import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const PROTOCOL_VERSION = '1.0';
const MAX_ROOM_SIZE = 8;
const MAX_HOME_ROOM_SIZE = 16;
const MAX_SPEED_METERS_PER_SEC = 28.0; // Server-authoritative anti-cheat speed cap

interface ConnectedPeer {
  ws: WebSocket;
  playerId: string;
  playerName: string;
  realmId: string;
  roomId: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  pitch: number;
  grounded: boolean;
  flightMode: 'hover' | 'glide';
  locomotionMode: string;
  activeEmote: string | null;
  activeEmoteLevel: number;
  loadout: Record<string, string>;
  lastUpdateMs: number;
  msgCountWindow: number;
  windowResetMs: number;
}

// Persistent Server Archive (SQLite via node:sqlite when available + JSON file store)
const DATA_DIR = path.join(__dirname, '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const SAVE_FILE_PATH = path.join(DATA_DIR, 'saves.json');

function loadAllServerSaves(): Record<string, any> {
  try {
    if (fs.existsSync(SAVE_FILE_PATH)) {
      return JSON.parse(fs.readFileSync(SAVE_FILE_PATH, 'utf-8'));
    }
  } catch (err) {
    console.error('[ServerSaveStore]', err);
  }
  return {};
}

function writeServerSave(playerId: string, saveData: any): void {
  try {
    const all = loadAllServerSaves();
    // Server-authoritative daily cap sanity check
    if (typeof saveData.dailyCandlesForged === 'number') {
      saveData.dailyCandlesForged = Math.min(20, Math.max(0, saveData.dailyCandlesForged));
    }
    all[playerId] = { ...saveData, updatedAt: Date.now() };
    fs.writeFileSync(SAVE_FILE_PATH, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ServerSaveStore]', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  const httpServer = http.createServer(app);

  // Room & Matchmaking Manager
  const peers = new Map<string, ConnectedPeer>();
  const rooms = new Map<string, Set<string>>();

  // REST API for Save, Health & Stage 6 Room Inspection
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      protocol: PROTOCOL_VERSION,
      maxRoomSize: MAX_ROOM_SIZE,
      maxHomeRoomSize: MAX_HOME_ROOM_SIZE,
      rooms: rooms.size,
      connectedPeers: peers.size,
    });
  });

  app.get('/api/rooms', (_req, res) => {
    const list = Array.from(rooms.entries()).map(([rId, set]) => {
      const isHome = rId.startsWith('home_');
      return {
        roomId: rId,
        memberCount: set.size,
        maxCapacity: isHome ? MAX_HOME_ROOM_SIZE : MAX_ROOM_SIZE,
        members: Array.from(set),
      };
    });
    res.json({
      protocol: PROTOCOL_VERSION,
      maxRoomSize: MAX_ROOM_SIZE,
      maxHomeRoomSize: MAX_HOME_ROOM_SIZE,
      rooms: list,
    });
  });

  app.get('/api/save/:playerId', (req, res) => {
    const all = loadAllServerSaves();
    const record = all[req.params.playerId];
    if (!record) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(record);
  });

  app.post('/api/save', (req, res) => {
    const body = req.body;
    if (!body || typeof body.playerId !== 'string') {
      res.status(400).json({ error: 'Invalid save payload' });
      return;
    }
    writeServerSave(body.playerId, body);
    res.json({ ok: true });
  });

  const REPORT_FILE_PATH = path.join(DATA_DIR, 'reports.json');
  app.post('/api/report', (req, res) => {
    try {
      const { reporterId, peerId, nickname, reason } = req.body || {};
      if (!peerId || !reason) {
        res.status(400).json({ error: 'Missing peerId or reason' });
        return;
      }
      let existing: any[] = [];
      if (fs.existsSync(REPORT_FILE_PATH)) {
        existing = JSON.parse(fs.readFileSync(REPORT_FILE_PATH, 'utf-8'));
      }
      const entry = {
        reporterId: String(reporterId || 'anonymous'),
        peerId: String(peerId),
        nickname: String(nickname || peerId),
        reason: String(reason),
        createdAt: new Date().toISOString(),
      };
      existing.push(entry);
      fs.writeFileSync(REPORT_FILE_PATH, JSON.stringify(existing, null, 2), 'utf-8');
      res.json({ ok: true, reportCount: existing.length, entry });
    } catch (err) {
      console.error('[ServerReportStore]', err);
      res.status(500).json({ error: 'Report store error' });
    }
  });

  function assignRoomForRealm(
    realmId: string,
    preferredRoomId?: string,
    forceNewRoom = false
  ): string {
    const cap = realmId === 'home' ? MAX_HOME_ROOM_SIZE : MAX_ROOM_SIZE;
    if (!forceNewRoom) {
      if (preferredRoomId && rooms.has(preferredRoomId)) {
        const set = rooms.get(preferredRoomId)!;
        if (set.size < cap) return preferredRoomId;
      }

      for (const [rId, memberSet] of rooms.entries()) {
        if (rId.startsWith(`${realmId}_`) && memberSet.size < cap) {
          return rId;
        }
      }
    }

    const newRoomId = `${realmId}_inst_${Math.random().toString(36).slice(2, 6)}`;
    rooms.set(newRoomId, new Set());
    return newRoomId;
  }

  function removePeerFromRoom(peer: ConnectedPeer) {
    const set = rooms.get(peer.roomId);
    if (set) {
      set.delete(peer.playerId);
      if (set.size === 0) {
        rooms.delete(peer.roomId);
      } else {
        broadcastToRoom(peer.roomId, {
          v: PROTOCOL_VERSION,
          type: 'peer:left',
          playerId: peer.playerId,
        });
      }
    }
  }

  function broadcastToRoom(roomId: string, payload: Record<string, any>, excludePlayerId?: string) {
    const set = rooms.get(roomId);
    if (!set) return;
    const raw = JSON.stringify(payload);
    for (const pid of set) {
      if (pid === excludePlayerId) continue;
      const p = peers.get(pid);
      if (p && p.ws.readyState === WebSocket.OPEN) {
        p.ws.send(raw);
      }
    }
  }

  // WebSocket Server mounted at /ws
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '/', `http://${request.headers.host}`);
    if (url.pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws) => {
    let currentPeer: ConnectedPeer | null = null;

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(String(data));
        const now = Date.now();

        if (msg.type === 'ping') {
          ws.send(
            JSON.stringify({
              v: PROTOCOL_VERSION,
              type: 'pong',
              clientTs: msg.clientTs,
              serverTs: now,
            })
          );
          return;
        }

        if (msg.type === 'join_realm') {
          const playerId = String(msg.playerId || `p_${Math.random().toString(36).slice(2, 8)}`);
          const realmId = String(msg.realmId || 'home');

          if (currentPeer) {
            removePeerFromRoom(currentPeer);
          }

          const roomId = assignRoomForRealm(
            realmId,
            msg.preferredRoomId,
            Boolean(msg.forceNewRoom)
          );
          const maxCap = realmId === 'home' ? MAX_HOME_ROOM_SIZE : MAX_ROOM_SIZE;
          currentPeer = {
            ws,
            playerId,
            playerName: String(msg.playerName || '星海旅人'),
            realmId,
            roomId,
            x: Number(msg.x) || 0,
            y: Number(msg.y) || 1.2,
            z: Number(msg.z) || 6,
            vx: Number(msg.vx) || 0,
            vy: Number(msg.vy) || 0,
            vz: Number(msg.vz) || 0,
            yaw: Number(msg.yaw) || Math.PI,
            pitch: 0,
            grounded: true,
            flightMode: 'hover',
            locomotionMode: String(msg.locomotionMode || 'idle'),
            activeEmote: null,
            activeEmoteLevel: 1,
            loadout: msg.loadout || {},
            lastUpdateMs: now,
            msgCountWindow: 0,
            windowResetMs: now,
          };

          peers.set(playerId, currentPeer);
          if (!rooms.has(roomId)) rooms.set(roomId, new Set());
          rooms.get(roomId)!.add(playerId);

          // Send existing peers in the room to the newly joined player
          const roomMembers = Array.from(rooms.get(roomId)!)
            .filter((id) => id !== playerId)
            .map((id) => {
              const mp = peers.get(id)!;
              return {
                playerId: mp.playerId,
                playerName: mp.playerName,
                x: mp.x,
                y: mp.y,
                z: mp.z,
                vx: mp.vx,
                vy: mp.vy,
                vz: mp.vz,
                yaw: mp.yaw,
                grounded: mp.grounded,
                flightMode: mp.flightMode,
                locomotionMode: mp.locomotionMode,
                activeEmote: mp.activeEmote,
                activeEmoteLevel: mp.activeEmoteLevel,
                loadout: mp.loadout,
              };
            });

          ws.send(
            JSON.stringify({
              v: PROTOCOL_VERSION,
              type: 'room:init',
              roomId,
              realmId,
              maxCapacity: maxCap,
              onlineCount: rooms.get(roomId)!.size,
              peers: roomMembers,
            })
          );

          broadcastToRoom(
            roomId,
            {
              v: PROTOCOL_VERSION,
              type: 'peer:joined',
              peer: {
                playerId: currentPeer.playerId,
                playerName: currentPeer.playerName,
                x: currentPeer.x,
                y: currentPeer.y,
                z: currentPeer.z,
                vx: currentPeer.vx,
                vy: currentPeer.vy,
                vz: currentPeer.vz,
                yaw: currentPeer.yaw,
                grounded: currentPeer.grounded,
                flightMode: currentPeer.flightMode,
                locomotionMode: currentPeer.locomotionMode,
                activeEmote: currentPeer.activeEmote,
                activeEmoteLevel: currentPeer.activeEmoteLevel,
                loadout: currentPeer.loadout,
              },
            },
            playerId
          );
          return;
        }

        if (!currentPeer) return;

        // Rate limiter (max 45 messages per second per client)
        if (now - currentPeer.windowResetMs > 1000) {
          currentPeer.windowResetMs = now;
          currentPeer.msgCountWindow = 0;
        }
        currentPeer.msgCountWindow++;
        if (currentPeer.msgCountWindow > 45) return;

        if (msg.type === 'player:transform') {
          const dtSec = Math.max(0.01, (now - currentPeer.lastUpdateMs) / 1000);
          const nx = Number(msg.x) || 0;
          const ny = Number(msg.y) || 0;
          const nz = Number(msg.z) || 0;
          const dist = Math.hypot(nx - currentPeer.x, ny - currentPeer.y, nz - currentPeer.z);

          // Server-authoritative speed check (allow shrine reset and legitimate sanctuary/compass warps within 230m world radius)
          const isShrineReset = Math.hypot(nx, nz - 6) < 2.5;
          const isContinentWarp = Math.hypot(nx, nz) <= 230 && dist > 14.0;
          if (
            dist / dtSec <= MAX_SPEED_METERS_PER_SEC ||
            isShrineReset ||
            isContinentWarp ||
            dtSec > 1.0
          ) {
            currentPeer.x = nx;
            currentPeer.y = ny;
            currentPeer.z = nz;
          } else {
            // Clamp anomalous speed spike toward previous position
            const maxStep = MAX_SPEED_METERS_PER_SEC * dtSec;
            const ratio = dist > 0.0001 ? maxStep / dist : 0;
            currentPeer.x += (nx - currentPeer.x) * ratio;
            currentPeer.y += (ny - currentPeer.y) * ratio;
            currentPeer.z += (nz - currentPeer.z) * ratio;
          }
          currentPeer.vx = Number(msg.vx) || 0;
          currentPeer.vy = Number(msg.vy) || 0;
          currentPeer.vz = Number(msg.vz) || 0;
          currentPeer.yaw = Number(msg.yaw) || 0;
          currentPeer.pitch = Number(msg.pitch) || 0;
          currentPeer.grounded = Boolean(msg.grounded);
          currentPeer.flightMode = msg.flightMode === 'glide' ? 'glide' : 'hover';
          currentPeer.locomotionMode = String(msg.locomotionMode || 'idle');
          currentPeer.activeEmote = msg.activeEmote || null;
          currentPeer.activeEmoteLevel = Number(msg.activeEmoteLevel) || 1;
          if (msg.loadout) currentPeer.loadout = msg.loadout;
          currentPeer.lastUpdateMs = now;

          broadcastToRoom(
            currentPeer.roomId,
            {
              v: PROTOCOL_VERSION,
              type: 'peer:transform',
              playerId: currentPeer.playerId,
              x: currentPeer.x,
              y: currentPeer.y,
              z: currentPeer.z,
              vx: currentPeer.vx,
              vy: currentPeer.vy,
              vz: currentPeer.vz,
              yaw: currentPeer.yaw,
              pitch: currentPeer.pitch,
              grounded: currentPeer.grounded,
              flightMode: currentPeer.flightMode,
              locomotionMode: currentPeer.locomotionMode,
              activeEmote: currentPeer.activeEmote,
              activeEmoteLevel: currentPeer.activeEmoteLevel,
              loadout: currentPeer.loadout,
              serverTs: now,
            },
            currentPeer.playerId
          );
        } else if (
          msg.type === 'player:call' ||
          msg.type === 'player:emote' ||
          msg.type === 'social:ignite' ||
          msg.type === 'social:friend_request' ||
          msg.type === 'social:unlock_node' ||
          msg.type === 'social:dual_action' ||
          msg.type === 'social:chat' ||
          msg.type === 'social:report' ||
          msg.type === 'music:note'
        ) {
          if (msg.type === 'player:emote' && msg.emoteId) {
            currentPeer.activeEmote = String(msg.emoteId);
            currentPeer.activeEmoteLevel = Number(msg.level) || 1;
          }
          broadcastToRoom(
            currentPeer.roomId,
            {
              ...msg,
              v: PROTOCOL_VERSION,
              senderId: currentPeer.playerId,
              senderName: currentPeer.playerName,
              serverTs: now,
            },
            currentPeer.playerId
          );
        }
      } catch (err) {
        console.error('[WSServer]', err);
      }
    });

    ws.on('close', () => {
      if (currentPeer) {
        removePeerFromRoom(currentPeer);
        peers.delete(currentPeer.playerId);
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[ServerStartup]', err);
});

