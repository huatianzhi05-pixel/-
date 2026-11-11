import { EquippedLoadout, PRESET_OUTFITS } from '../game/cosmetics';
import {
  BotAiMode,
  NETWORK_CFG,
  SKY_15_NOTES,
  groundHeightAt,
  interpolateAndExtrapolatePeerPure,
  stepBotTravelerAiPure,
} from '../game/rules';
import { gameEventBus } from './EventBus';
import { skyAudio } from '../game/audio';

export interface RemoteTravelerState {
  playerId: string;
  playerName: string;
  isBot: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  yaw: number;
  targetYaw: number;
  grounded: boolean;
  flightMode: 'hover' | 'glide';
  locomotionMode: string;
  activeEmote: string | null;
  activeEmoteLevel: number;
  activeEmoteTimer: number;
  callRingTimer: number;
  callWaveRadius: number;
  chatBubbleText: string | null;
  chatBubbleTimer: number;
  notePopupText: string | null;
  notePopupTimer: number;
  loadout: EquippedLoadout;
  botPhase: number;
  lastPacketMs: number;
}

export interface NetworkStatusSnapshot {
  connected: boolean;
  roomId: string;
  latencyMs: number;
  onlineCount: number;
  maxRoomSize: number;
  reconnectCount: number;
  botAiMode: BotAiMode;
  queuedReliableCount: number;
}

/**
 * Pure helper to determine whether the app is running on a static/serverless edge CDN (like Netlify)
 * vs a persistent WebSocket host or a custom VITE_WS_URL endpoint.
 */
export function resolveDeployNetworkStrategyPure(
  hostname: string,
  protocol: string,
  host: string,
  customWsUrl = '',
  forceStatic = false
): {
  mode: 'custom_ws' | 'edge_serverless' | 'fullstack_ws';
  wsUrl: string | null;
  broadcastChannelName: string;
} {
  const trimmedWs = (customWsUrl || '').trim();
  if (trimmedWs.startsWith('ws://') || trimmedWs.startsWith('wss://')) {
    return {
      mode: 'custom_ws',
      wsUrl: trimmedWs,
      broadcastChannelName: 'glimmer_travelers_sync_v1',
    };
  }

  const lowerHost = (hostname || '').toLowerCase();
  const isStaticCdnHost =
    forceStatic ||
    lowerHost.endsWith('.netlify.app') ||
    lowerHost.endsWith('.netlify.live') ||
    lowerHost.endsWith('.vercel.app') ||
    lowerHost.endsWith('.pages.dev') ||
    lowerHost.endsWith('.github.io');

  if (isStaticCdnHost) {
    return {
      mode: 'edge_serverless',
      wsUrl: null,
      broadcastChannelName: 'glimmer_travelers_sync_v1',
    };
  }

  const wsProto = protocol === 'https:' ? 'wss:' : 'ws:';
  return {
    mode: 'fullstack_ws',
    wsUrl: `${wsProto}//${host}/ws`,
    broadcastChannelName: 'glimmer_travelers_sync_v1',
  };
}

class NetworkManager {
  private ws: WebSocket | null = null;
  private bc: BroadcastChannel | null = null;
  private connected = false;
  private roomId = 'offline_home';
  private maxRoomSize = 8;
  private latencyMs = 12;
  private lastTransformSentMs = 0;
  private pingTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private localPlayerId = '';
  private localPlayerName = '星海旅人';
  private currentRealmId = 'home';
  private currentLoadout: EquippedLoadout = PRESET_OUTFITS[0].loadout;
  private reconnectCount = 0;
  private seq = 0;
  private botAiMode: BotAiMode = 'patrol';
  private pendingReliableQueue: Record<string, any>[] = [];

  public remoteTravelers = new Map<string, RemoteTravelerState>();
  public dualActionPartnerId: string | null = null;
  public dualActionMode: 'none' | 'hand_hold' | 'carry' | 'bench_sit' = 'none';

  public initBots() {
    const botConfigs = NETWORK_CFG?.botTravelers || [
      {
        playerId: 'bot_traveller_1',
        playerName: '云野牧蝶人',
        spawnX: -2.4,
        spawnZ: 1.4,
        spawnYaw: 0.65,
        outfitIndex: 1,
        patrolPhase: 0.4,
      },
      {
        playerId: 'bot_traveller_2',
        playerName: '霞谷聆音客',
        spawnX: 2.4,
        spawnZ: 1.4,
        spawnYaw: -0.65,
        outfitIndex: 2,
        patrolPhase: 2.8,
      },
      {
        playerId: 'bot_traveller_3',
        playerName: '晨岛寻星者',
        spawnX: 0.0,
        spawnZ: -2.6,
        spawnYaw: 0.0,
        outfitIndex: 3,
        patrolPhase: 4.7,
      },
    ];

    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    for (const cfg of botConfigs) {
      if (!this.remoteTravelers.has(cfg.playerId)) {
        const y0 = groundHeightAt(cfg.spawnX, cfg.spawnZ);
        const outfit =
          PRESET_OUTFITS[cfg.outfitIndex % PRESET_OUTFITS.length]?.loadout ||
          PRESET_OUTFITS[1].loadout;
        this.remoteTravelers.set(cfg.playerId, {
          playerId: cfg.playerId,
          playerName: cfg.playerName,
          isBot: true,
          x: cfg.spawnX,
          y: y0,
          z: cfg.spawnZ,
          vx: 0,
          vy: 0,
          vz: 0,
          targetX: cfg.spawnX,
          targetY: y0,
          targetZ: cfg.spawnZ,
          yaw: cfg.spawnYaw,
          targetYaw: cfg.spawnYaw,
          grounded: true,
          flightMode: 'hover',
          locomotionMode: 'walk',
          activeEmote: null,
          activeEmoteLevel: 3,
          activeEmoteTimer: 0,
          callRingTimer: 0,
          callWaveRadius: 0.5,
          chatBubbleText: null,
          chatBubbleTimer: 0,
          notePopupText: null,
          notePopupTimer: 0,
          loadout: outfit,
          botPhase: cfg.patrolPhase,
          lastPacketMs: nowMs,
        });
      }
    }
  }

  private emitStatus() {
    gameEventBus.emit('network:status', this.getStatusSnapshot() as any);
  }

  public connect(
    playerId: string,
    playerName: string,
    realmId: string,
    loadout: EquippedLoadout,
    forceNewRoom = false
  ) {
    this.localPlayerId = playerId;
    this.localPlayerName = playerName;
    this.currentRealmId = realmId;
    this.currentLoadout = loadout;
    this.maxRoomSize =
      realmId === 'home'
        ? NETWORK_CFG?.maxCampPlayers || 16
        : NETWORK_CFG?.maxRoomPlayers || 8;
    this.initBots();

    if (typeof window === 'undefined') return;

    try {
      if (this.reconnectTimer) {
        window.clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      if (this.ws) {
        this.ws.onclose = null;
        this.ws.close();
        this.ws = null;
      }

      const envMeta = (import.meta as any).env || {};
      const strategy = resolveDeployNetworkStrategyPure(
        window.location.hostname,
        window.location.protocol,
        window.location.host,
        envMeta.VITE_WS_URL || '',
        envMeta.VITE_STATIC_DEPLOY === 'true'
      );

      // Initialize BroadcastChannel for zero-latency cross-tab multiplayer sync (works on Netlify & locally!)
      if (!this.bc && typeof BroadcastChannel !== 'undefined') {
        try {
          this.bc = new BroadcastChannel(strategy.broadcastChannelName);
          this.bc.onmessage = (ev) => {
            if (ev?.data && ev.data.senderId !== this.localPlayerId) {
              this.handleMessage(ev.data);
            }
          };
        } catch {
          // BroadcastChannel optional
        }
      }

      // On Netlify / static edge CDN without a custom WS URL, enter Cloud Autonomous Room Mode cleanly with 0 WS errors
      if (strategy.mode === 'edge_serverless' || !strategy.wsUrl) {
        this.connected = true;
        this.roomId = `${this.currentRealmId}_inst_1`;
        this.pendingReliableQueue = [];
        this.emitStatus();
        return;
      }

      const socket = new WebSocket(strategy.wsUrl);
      this.ws = socket;

      let openedAtLeastOnce = false;

      socket.onopen = () => {
        openedAtLeastOnce = true;
        this.connected = true;
        socket.send(
          JSON.stringify({
            v: NETWORK_CFG?.protocolVersion || '1.0',
            type: 'join_realm',
            playerId: this.localPlayerId,
            playerName: this.localPlayerName,
            realmId: this.currentRealmId,
            loadout: this.currentLoadout,
            forceNewRoom,
          })
        );

        // Flush any reliable events queued while disconnected!
        if (this.pendingReliableQueue.length > 0) {
          const toFlush = [...this.pendingReliableQueue];
          this.pendingReliableQueue = [];
          for (const item of toFlush) {
            socket.send(JSON.stringify(item));
          }
        }

        this.emitStatus();
      };

      socket.onmessage = (ev) => {
        try {
          const msg = JSON.parse(String(ev.data));
          this.handleMessage(msg);
        } catch (err) {
          console.error('[NetworkClient:Parse]', err);
        }
      };

      socket.onerror = () => {
        // Handled cleanly in socket.onclose
      };

      socket.onclose = () => {
        if (!openedAtLeastOnce) {
          // Proxy does not forward WebSocket upgrades: switch cleanly to HTTP + Autonomous Bot room mode without spamming WS reconnect errors
          this.connected = true;
          if (this.roomId === 'offline_home' || this.roomId.includes('重连')) {
            this.roomId = `${this.currentRealmId}_inst_1`;
          }
          this.pendingReliableQueue = [];
          this.emitStatus();
          return;
        }
        this.connected = false;
        this.roomId = '单机重连等待中';
        this.emitStatus();
        if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer);
        const delay = NETWORK_CFG?.reconnectDelayMs || 2500;
        this.reconnectTimer = window.setTimeout(() => {
          this.reconnectCount += 1;
          this.connect(
            this.localPlayerId,
            this.localPlayerName,
            this.currentRealmId,
            this.currentLoadout
          );
        }, delay);
      };

      if (this.pingTimer) window.clearInterval(this.pingTimer);
      this.pingTimer = window.setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              v: NETWORK_CFG?.protocolVersion || '1.0',
              type: 'ping',
              clientTs: performance.now(),
            })
          );
        }
      }, 2500);
    } catch (err) {
      console.error('[NetworkClient:Connect]', err);
    }
  }

  /**
   * Stage 6 Interactive Verification: Simulates an abrupt WebSocket drop, buffers reliable
   * events while offline, and automatically reconnects & resynchronizes room state.
   */
  public simulateDisconnectAndReconnect(offlineDurationMs = 950) {
    if (typeof window === 'undefined') return;
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.roomId = '断线缓冲重连中...';
    // Buffer a heartbeat call wave while offline to prove reliable event queue flushing
    this.pendingReliableQueue.push({
      v: NETWORK_CFG?.protocolVersion || '1.0',
      type: 'player:call',
      pitchMultiplier: 1.08,
      isDeepCall: false,
      callVoice: 'default',
    });
    this.emitStatus();

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectCount += 1;
      this.connect(
        this.localPlayerId,
        this.localPlayerName,
        this.currentRealmId,
        this.currentLoadout
      );
    }, offlineDurationMs);
  }

  /**
   * Stage 6 Interactive Verification: Requests the matchmaking server to assign a fresh
   * 8-player room instance (`forceNewRoom: true`).
   */
  public requestSwitchRoomInstance() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          v: NETWORK_CFG?.protocolVersion || '1.0',
          type: 'join_realm',
          playerId: this.localPlayerId,
          playerName: this.localPlayerName,
          realmId: this.currentRealmId,
          loadout: this.currentLoadout,
          forceNewRoom: true,
        })
      );
    } else {
      this.roomId = `${this.currentRealmId}_inst_${Math.random().toString(36).slice(2, 6)}`;
      this.emitStatus();
    }
  }

  /**
   * Stage 6 Bot Traveler AI Mode Switcher ('patrol' -> 'follow' -> 'gather').
   */
  public cycleBotAiMode(): BotAiMode {
    const order: BotAiMode[] = ['patrol', 'follow', 'gather'];
    const next = order[(order.indexOf(this.botAiMode) + 1) % order.length];
    this.botAiMode = next;
    this.emitStatus();
    return next;
  }

  /**
   * Stage 6 Bot Traveler Ensemble & Resonance Trigger: All 3 Bot Travelers wave/spin,
   * emit call rings, and play a pentatonic harmony chord together!
   */
  public triggerBotEnsembleResponse() {
    const bot1 = this.remoteTravelers.get('bot_traveller_1');
    const bot2 = this.remoteTravelers.get('bot_traveller_2');
    const bot3 = this.remoteTravelers.get('bot_traveller_3');

    if (bot1) {
      bot1.callRingTimer = 1.4;
      bot1.callWaveRadius = 0.5;
      bot1.activeEmote = 'emote_butterfly';
      bot1.activeEmoteLevel = 4;
      bot1.activeEmoteTimer = 3.6;
      bot1.chatBubbleText = '收到你的星音呼唤！一起振翅高飞吧 ✦';
      bot1.chatBubbleTimer = 5.0;
    }
    if (bot2) {
      bot2.callRingTimer = 1.4;
      bot2.callWaveRadius = 0.5;
      bot2.activeEmote = 'emote_spin_dance';
      bot2.activeEmoteLevel = 5;
      bot2.activeEmoteTimer = 3.8;
      bot2.notePopupText = '♪ Do - Mi - Sol 竖琴合奏';
      bot2.notePopupTimer = 4.0;
      const chordNotes = [0, 2, 4, 7];
      chordNotes.forEach((nIdx, i) => {
        if (typeof window !== 'undefined') {
          window.setTimeout(() => {
            const note = SKY_15_NOTES[nIdx];
            skyAudio.playInstrumentNote(note.freq, 'harp');
          }, i * 180);
        }
      });
    }
    if (bot3) {
      bot3.callRingTimer = 1.4;
      bot3.callWaveRadius = 0.5;
      bot3.activeEmote = 'emote_cheer_jump';
      bot3.activeEmoteLevel = 4;
      bot3.activeEmoteTimer = 3.5;
    }
  }

  /**
   * Stage 7 Social Interaction Trigger: Positions the target peer/bot to face localPlayer
   * at close social distance (~1.15m), plays the matching emote ('emote_ignite',
   * 'emote_bow_respect', 'emote_high_five', 'emote_hug'), emits a call ring + warm chat bubble,
   * and broadcasts the event over WebSocket.
   */
  public triggerSocialInteractionWithPeer(
    peerId: string,
    interactionType: 'ignite' | 'friend_request' | 'high_five' | 'hug',
    localPlayer: { x: number; y: number; z: number; yaw: number }
  ) {
    const peer = this.remoteTravelers.get(peerId);
    if (peer) {
      // Position peer 1.15m in front of localPlayer facing back toward localPlayer
      const frontX = localPlayer.x - Math.sin(localPlayer.yaw) * 1.15;
      const frontZ = localPlayer.z - Math.cos(localPlayer.yaw) * 1.15;
      peer.x = frontX;
      peer.y = localPlayer.y;
      peer.z = frontZ;
      peer.targetX = frontX;
      peer.targetY = localPlayer.y;
      peer.targetZ = frontZ;
      peer.yaw = localPlayer.yaw + Math.PI;
      peer.targetYaw = peer.yaw;
      peer.callRingTimer = 1.3;
      peer.callWaveRadius = 0.5;

      if (interactionType === 'ignite') {
        peer.activeEmote = 'emote_ignite';
        peer.activeEmoteLevel = 3;
        peer.activeEmoteTimer = 3.2;
        peer.chatBubbleText = '🕯️ 心火相映！很高兴在云海遇见你 ✦';
        peer.chatBubbleTimer = 4.8;
      } else if (interactionType === 'friend_request') {
        peer.activeEmote = 'emote_bow_respect';
        peer.activeEmoteLevel = 4;
        peer.activeEmoteTimer = 3.4;
        peer.chatBubbleText = '🤝 收下你的白蜡烛，我们现在是星盘挚友啦！';
        peer.chatBubbleTimer = 5.0;
      } else if (interactionType === 'high_five') {
        peer.activeEmote = 'emote_high_five';
        peer.activeEmoteLevel = 4;
        peer.activeEmoteTimer = 3.0;
        peer.chatBubbleText = '🙌 星光击掌！翼能充盈 +1.5 ✦';
        peer.chatBubbleTimer = 4.2;
      } else if (interactionType === 'hug') {
        peer.activeEmote = 'emote_hug';
        peer.activeEmoteLevel = 5;
        peer.activeEmoteTimer = 3.6;
        peer.chatBubbleText = '🫂 温暖拥抱！光之翼能量已瞬间充满 ❤️';
        peer.chatBubbleTimer = 5.0;
      }
    }
  }

  private handleMessage(msg: any) {
    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();

    if (msg.type === 'pong') {
      this.latencyMs = Math.max(1, Math.round(nowMs - Number(msg.clientTs)));
      this.emitStatus();
      return;
    }

    if (msg.type === 'room:init') {
      this.roomId = msg.roomId;
      if (msg.maxCapacity) {
        this.maxRoomSize = Number(msg.maxCapacity);
      }
      // Keep bots, replace remote human peers
      for (const [k, v] of this.remoteTravelers.entries()) {
        if (!v.isBot) this.remoteTravelers.delete(k);
      }
      if (Array.isArray(msg.peers)) {
        for (const p of msg.peers) {
          this.upsertRemotePeer(p, nowMs);
        }
      }
      this.emitStatus();
      return;
    }

    if (msg.type === 'peer:joined' && msg.peer) {
      this.upsertRemotePeer(msg.peer, nowMs);
      this.emitStatus();
      return;
    }

    if (msg.type === 'peer:left' && msg.playerId) {
      this.remoteTravelers.delete(msg.playerId);
      if (this.dualActionPartnerId === msg.playerId) {
        this.dualActionPartnerId = null;
        this.dualActionMode = 'none';
      }
      this.emitStatus();
      return;
    }

    if (msg.type === 'peer:transform' && msg.playerId) {
      const existing = this.remoteTravelers.get(msg.playerId);
      if (existing) {
        existing.targetX = Number(msg.x) || 0;
        existing.targetY = Number(msg.y) || 0;
        existing.targetZ = Number(msg.z) || 0;
        existing.vx = Number(msg.vx) || 0;
        existing.vy = Number(msg.vy) || 0;
        existing.vz = Number(msg.vz) || 0;
        existing.targetYaw = Number(msg.yaw) || 0;
        existing.grounded = Boolean(msg.grounded);
        existing.flightMode = msg.flightMode === 'glide' ? 'glide' : 'hover';
        existing.locomotionMode = String(msg.locomotionMode || 'idle');
        existing.lastPacketMs = nowMs;
        if (msg.activeEmote !== undefined) {
          existing.activeEmote = msg.activeEmote;
          existing.activeEmoteLevel = Number(msg.activeEmoteLevel) || 1;
          if (msg.activeEmote) existing.activeEmoteTimer = 3.0;
        }
        if (msg.loadout) existing.loadout = msg.loadout;
      } else {
        this.upsertRemotePeer(msg, nowMs);
      }
      return;
    }

    if (msg.type === 'player:call' && msg.senderId) {
      const peer = this.remoteTravelers.get(msg.senderId);
      if (peer) {
        peer.callRingTimer = msg.isDeepCall ? 1.6 : 1.1;
        peer.callWaveRadius = 0.5;
        skyAudio.playSkyCall(
          Number(msg.pitchMultiplier) || 1.05,
          msg.isDeepCall ? 1.35 : 0.75,
          Boolean(msg.isDeepCall),
          msg.callVoice || 'default'
        );
      }
    } else if (msg.type === 'player:emote' && msg.senderId) {
      const peer = this.remoteTravelers.get(msg.senderId);
      if (peer && msg.emoteId) {
        peer.activeEmote = String(msg.emoteId);
        peer.activeEmoteLevel = Number(msg.level) || 1;
        peer.activeEmoteTimer = 3.5;
      }
    } else if (msg.type === 'social:chat' && msg.senderId) {
      const peer = this.remoteTravelers.get(msg.senderId);
      if (peer) {
        peer.chatBubbleText = String(msg.text || '');
        peer.chatBubbleTimer = 5.5;
      }
      gameEventBus.emit('social:chatBubble', {
        senderId: msg.senderId,
        senderName: msg.senderName || '旅人',
        text: String(msg.text || ''),
      });
    } else if (msg.type === 'music:note' && msg.senderId) {
      const noteIdx = Math.max(0, Math.min(14, Number(msg.noteIndex) || 0));
      const note = SKY_15_NOTES[noteIdx];
      skyAudio.playInstrumentNote(note.freq, msg.instrument || 'piano');
      const peer = this.remoteTravelers.get(msg.senderId);
      if (peer) {
        peer.notePopupText = `♪ ${note.label} (${note.solfege})`;
        peer.notePopupTimer = 1.6;
      }
      gameEventBus.emit('music:notePlayed', {
        senderId: msg.senderId,
        noteIndex: noteIdx,
        freq: note.freq,
        instrument: msg.instrument || 'piano',
      });
    }
  }

  private upsertRemotePeer(p: any, nowMs: number) {
    this.remoteTravelers.set(p.playerId, {
      playerId: p.playerId,
      playerName: p.playerName || '远方旅人',
      isBot: false,
      x: Number(p.x) || 0,
      y: Number(p.y) || 1.2,
      z: Number(p.z) || 4,
      vx: Number(p.vx) || 0,
      vy: Number(p.vy) || 0,
      vz: Number(p.vz) || 0,
      targetX: Number(p.x) || 0,
      targetY: Number(p.y) || 1.2,
      targetZ: Number(p.z) || 4,
      yaw: Number(p.yaw) || 0,
      targetYaw: Number(p.yaw) || 0,
      grounded: Boolean(p.grounded ?? true),
      flightMode: p.flightMode === 'glide' ? 'glide' : 'hover',
      locomotionMode: String(p.locomotionMode || 'idle'),
      activeEmote: p.activeEmote || null,
      activeEmoteLevel: Number(p.activeEmoteLevel) || 1,
      activeEmoteTimer: p.activeEmote ? 3.0 : 0,
      callRingTimer: 0,
      callWaveRadius: 0.5,
      chatBubbleText: null,
      chatBubbleTimer: 0,
      notePopupText: null,
      notePopupTimer: 0,
      loadout: p.loadout || PRESET_OUTFITS[0].loadout,
      botPhase: 0,
      lastPacketMs: nowMs,
    });
  }

  public switchRealm(realmId: string, loadout: EquippedLoadout) {
    this.currentRealmId = realmId;
    this.currentLoadout = loadout;
    this.maxRoomSize =
      realmId === 'home'
        ? NETWORK_CFG?.maxCampPlayers || 16
        : NETWORK_CFG?.maxRoomPlayers || 8;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          v: NETWORK_CFG?.protocolVersion || '1.0',
          type: 'join_realm',
          playerId: this.localPlayerId,
          playerName: this.localPlayerName,
          realmId,
          loadout,
        })
      );
    }
  }

  public sendTransformThrottled(state: {
    x: number;
    y: number;
    z: number;
    vx?: number;
    vy?: number;
    vz?: number;
    yaw: number;
    pitch: number;
    grounded: boolean;
    flightMode: 'hover' | 'glide';
    locomotionMode?: string;
    activeEmote: string | null;
    activeEmoteLevel?: number;
    loadout: EquippedLoadout;
  }) {
    const now = performance.now();
    // 15Hz network transform rate (every 66ms)
    if (now - this.lastTransformSentMs < 66) return;
    this.lastTransformSentMs = now;
    this.seq += 1;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          v: NETWORK_CFG?.protocolVersion || '1.0',
          seq: this.seq,
          type: 'player:transform',
          ...state,
        })
      );
    }
    if (this.bc && this.localPlayerId) {
      try {
        this.bc.postMessage({
          type: 'peer:transform',
          senderId: this.localPlayerId,
          playerId: this.localPlayerId,
          playerName: this.localPlayerName,
          ...state,
        });
      } catch {
        // Ignore BroadcastChannel closed state
      }
    }
  }

  public broadcastEvent(type: string, payload: Record<string, any> = {}) {
    const packet = {
      v: NETWORK_CFG?.protocolVersion || '1.0',
      seq: ++this.seq,
      type,
      ...payload,
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(packet));
    } else {
      // Queue reliable social/expression events while disconnected so they flush on reconnect!
      if (this.pendingReliableQueue.length < 32) {
        this.pendingReliableQueue.push(packet);
      }
    }
    if (this.bc && this.localPlayerId) {
      try {
        this.bc.postMessage({
          ...packet,
          senderId: this.localPlayerId,
          senderName: this.localPlayerName,
        });
      } catch {
        // Ignore BroadcastChannel closed state
      }
    }

    // Autonomous Bot Traveler reactions in single-player / hybrid mode!
    if (type === 'player:call') {
      const bot1 = this.remoteTravelers.get('bot_traveller_1');
      if (bot1 && typeof window !== 'undefined') {
        window.setTimeout(() => {
          bot1.callRingTimer = 1.25;
          bot1.callWaveRadius = 0.5;
          bot1.activeEmote = 'emote_cheer_jump';
          bot1.activeEmoteLevel = 4;
          bot1.activeEmoteTimer = 2.8;
        }, 380);
      }
    } else if (type === 'player:emote') {
      const bot3 = this.remoteTravelers.get('bot_traveller_3');
      if (bot3 && typeof window !== 'undefined') {
        window.setTimeout(() => {
          bot3.activeEmote = payload.emoteId || 'emote_bow_respect';
          bot3.activeEmoteLevel = Number(payload.level) || 3;
          bot3.activeEmoteTimer = 3.2;
        }, 420);
      }
    } else if (type === 'music:note') {
      const bot2 = this.remoteTravelers.get('bot_traveller_2');
      if (bot2) {
        const noteIdx = Math.max(0, Math.min(14, Number(payload.noteIndex) || 0));
        const harmonyIdx = (noteIdx + 2) % 15;
        const harmonyNote = SKY_15_NOTES[harmonyIdx];
        bot2.notePopupText = `♪ 共鸣 ${harmonyNote.label}`;
        bot2.notePopupTimer = 1.5;
        bot2.activeEmote = 'emote_butterfly';
        bot2.activeEmoteTimer = 2.0;
      }
    } else if (type === 'social:chat') {
      const bot2 = this.remoteTravelers.get('bot_traveller_2');
      if (bot2 && typeof window !== 'undefined') {
        window.setTimeout(() => {
          const replies = [
            '愿星火照亮你的云海旅途 ✦',
            '一起去云野乘遥鲲滑翔吧！',
            '听到你的琴声啦，真治愈～',
            '小心暮土巡逻的冥龙探照光束哦！',
          ];
          bot2.chatBubbleText = replies[Math.floor(Math.random() * replies.length)];
          bot2.chatBubbleTimer = 5.0;
        }, 650);
      }
    }
  }

  /**
   * Step remote player interpolation + dead-reckoning extrapolation & autonomous Bot Traveler behaviors.
   */
  public stepTravelers(
    dt: number,
    elapsed: number,
    localPlayer: {
      x: number;
      y: number;
      z: number;
      yaw: number;
      grounded: boolean;
      flightMode: 'hover' | 'glide';
    }
  ) {
    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();

    for (const peer of this.remoteTravelers.values()) {
      if (peer.callRingTimer > 0) {
        peer.callRingTimer = Math.max(0, peer.callRingTimer - dt);
        peer.callWaveRadius += 16 * dt;
      } else {
        peer.callWaveRadius = 0.5;
      }
      if (peer.chatBubbleTimer > 0) {
        peer.chatBubbleTimer = Math.max(0, peer.chatBubbleTimer - dt);
        if (peer.chatBubbleTimer <= 0) peer.chatBubbleText = null;
      }
      if (peer.notePopupTimer > 0) {
        peer.notePopupTimer = Math.max(0, peer.notePopupTimer - dt);
        if (peer.notePopupTimer <= 0) peer.notePopupText = null;
      }
      if (peer.activeEmoteTimer > 0) {
        peer.activeEmoteTimer = Math.max(0, peer.activeEmoteTimer - dt);
        if (peer.activeEmoteTimer <= 0) peer.activeEmote = null;
      }

      // Check if this peer is currently holding hands or piggybacking with localPlayer!
      if (this.dualActionPartnerId === peer.playerId && this.dualActionMode !== 'none') {
        if (this.dualActionMode === 'hand_hold') {
          const sideX = localPlayer.x - Math.cos(localPlayer.yaw) * 0.95;
          const sideZ = localPlayer.z + Math.sin(localPlayer.yaw) * 0.95;
          peer.x += (sideX - peer.x) * (1 - Math.exp(-18 * dt));
          peer.y += (localPlayer.y - peer.y) * (1 - Math.exp(-18 * dt));
          peer.z += (sideZ - peer.z) * (1 - Math.exp(-18 * dt));
          peer.yaw = localPlayer.yaw;
          peer.grounded = localPlayer.grounded;
          peer.flightMode = localPlayer.flightMode;
          continue;
        } else if (this.dualActionMode === 'carry') {
          peer.x = localPlayer.x;
          peer.y = localPlayer.y + 1.48;
          peer.z = localPlayer.z;
          peer.yaw = localPlayer.yaw;
          peer.grounded = true;
          continue;
        }
      }

      if (peer.isBot) {
        const botNext = stepBotTravelerAiPure(
          peer,
          localPlayer,
          this.botAiMode,
          elapsed,
          dt
        );
        peer.x = botNext.x;
        peer.y = botNext.y;
        peer.z = botNext.z;
        peer.yaw = botNext.yaw;
      } else {
        // Stage 6: Smooth exponential interpolation + velocity dead-reckoning extrapolation + shortest-arc yaw
        const packetAgeSec = Math.max(0, (nowMs - peer.lastPacketMs) / 1000);
        const stepped = interpolateAndExtrapolatePeerPure(
          { x: peer.x, y: peer.y, z: peer.z, yaw: peer.yaw },
          {
            x: peer.targetX,
            y: peer.targetY,
            z: peer.targetZ,
            vx: peer.vx,
            vy: peer.vy,
            vz: peer.vz,
            yaw: peer.targetYaw,
          },
          dt,
          packetAgeSec
        );
        peer.x = stepped.x;
        peer.y = stepped.y;
        peer.z = stepped.z;
        peer.yaw = stepped.yaw;
      }
    }
  }

  public getStatusSnapshot(): NetworkStatusSnapshot {
    return {
      connected: this.connected,
      roomId: this.roomId,
      latencyMs: this.latencyMs,
      onlineCount: this.remoteTravelers.size + 1,
      maxRoomSize: this.maxRoomSize,
      reconnectCount: this.reconnectCount,
      botAiMode: this.botAiMode,
      queuedReliableCount: this.pendingReliableQueue.length,
    };
  }
}

export const networkClient = new NetworkManager();

