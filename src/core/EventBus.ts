/**
 * Central Typed Event Bus for decoupled communication across:
 * Input / Character / World / LightEnergy / Social / Network / UI / Audio / Save modules.
 */

export type GameEventMap = {
  'input:move': { moveX: number; moveZ: number; isRunning: boolean };
  'input:cameraDelta': { dx: number; dy: number };
  'input:flap': undefined;
  'input:call': { pitchMultiplier: number; durationSec: number };
  'input:interact': undefined;
  'character:landed': { x: number; y: number; z: number; impactSpeed: number };
  'character:wingDamaged': { lostWedges: number; source: string };
  'light:recharged': { amount: number; source: 'ground' | 'light_pillar' | 'companion' | 'hug' };
  'world:realmChanged': { realmId: string; subZoneName: string };
  'world:shardEventState': { active: boolean; shardType: 'black' | 'red' | null; phase: string };
  'social:strangerIgnited': { peerId: string; peerName: string };
  'social:friendNodeUnlocked': { peerId: string; nodeId: string; action: string };
  'social:dualActionState': { peerId: string | null; mode: 'none' | 'hand_hold' | 'carry' | 'bench_sit' };
  'social:chatBubble': { senderId: string; senderName: string; text: string };
  'network:status': {
    connected: boolean;
    onlineCount: number;
    latencyMs: number;
    roomId: string;
    maxRoomSize: number;
    reconnectCount: number;
    botAiMode: 'patrol' | 'follow' | 'gather';
    queuedReliableCount: number;
  };
  'music:notePlayed': { senderId: string; noteIndex: number; freq: number; instrument: string };
  'quest:progressed': { questId: string; current: number; target: number; completed: boolean };
  'save:updated': { timestamp: number };
};

type Handler<T> = (payload: T) => void;

class TypedEventBus {
  private listeners = new Map<keyof GameEventMap, Set<Handler<any>>>();

  public on<K extends keyof GameEventMap>(
    event: K,
    handler: Handler<GameEventMap[K]>
  ): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler);
    return () => {
      set?.delete(handler);
    };
  }

  public emit<K extends keyof GameEventMap>(
    event: K,
    payload: GameEventMap[K]
  ): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.forEach((fn) => {
      try {
        fn(payload);
      } catch (err) {
        console.error(`[EventBus:${String(event)}]`, err);
      }
    });
  }
}

export const gameEventBus = new TypedEventBus();
