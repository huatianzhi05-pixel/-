import gameConfigRaw from '../config/gameConfig.json';
import { DEFAULT_LOADOUT, EquippedLoadout } from '../game/cosmetics';
import { gameEventBus } from './EventBus';

export const GAME_CONFIG = gameConfigRaw;

export interface FriendRecord {
  peerId: string;
  nickname: string;
  ignited: boolean;
  isFriend: boolean;
  unlockedNodes: string[]; // e.g. ['ft_ignite', 'ft_friend', 'ft_highfive', 'ft_chat', 'ft_hug', 'ft_carry']
  lastGiftedDate: string | null;
  online: boolean;
  isBot: boolean;
  loadout: EquippedLoadout;
}

export interface DailyQuestState {
  id: string;
  title: string;
  type: string;
  currentCount: number;
  targetCount: number;
  rewardType: 'seasonCandles' | 'hearts';
  rewardAmount: number;
  claimed: boolean;
}

export interface PlacedFurniture {
  instanceId: string;
  furnitureId: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
}

export interface RecordedMusicNote {
  keyIndex: number;
  delayMs: number;
}

export interface RecordedSongSheet {
  id: string;
  title: string;
  bpm: number;
  notes: RecordedMusicNote[];
}

export interface PersistentSaveData {
  playerId: string;
  playerName: string;
  candles: number;
  candleWax: number;
  dailyCandlesForged: number;
  hearts: number;
  dailyHeartsReceived: number;
  seasonCandles: number;
  ascendedCandles: number;
  wingedLights: number;
  collectedWingedLightIds: string[];
  relivedSpiritIds: string[];
  unlockedConstellationNodes: string[];
  unlockedCosmeticIds: string[];
  unlockedMusicSheetIds?: string[];
  unlockedCallSoundIds?: string[];
  emoteLevels: Record<string, number>;
  equippedLoadout: EquippedLoadout;
  friends: Record<string, FriendRecord>;
  dailyQuests: DailyQuestState[];
  dailyRerollsUsed: number;
  lastDailyResetDate: string;
  activeSeasonId: string;
  homeFurnitureInventory: string[];
  homeFurniturePlacements: PlacedFurniture[];
  savedSongs: RecordedSongSheet[];
  meditationNotes?: {
    id: string;
    author: string;
    text: string;
    createdAt: string;
  }[];
  activeCallVoice?: 'default' | 'manta' | 'jellyfish' | 'bell';
  lastMeditationDate?: string | null;
  blockedPeerIds?: string[];
  reportedPeers?: {
    peerId: string;
    nickname: string;
    reason: string;
    createdAt: string;
  }[];
  completedSeasonQuestIds?: string[];
  activeTravelingSpiritIndex?: number;
  savedPhotos?: SavedPhotoRecord[];
  tutorialStep: number; // 0: move, 1: ignite, 2: fly, 3: completed
  childSafeMode: boolean;
  locale: 'zh' | 'en';
  qualityTier?: 'auto' | 'low' | 'medium' | 'high';
  highContrastMode?: boolean;
  reducedMotionShake?: boolean;
  discoveredEasterEggIds?: string[];
  bestRaceTimeMs?: number | null;
  bestRaceMedal?: 'gold' | 'silver' | 'bronze' | null;
  completedRaceCount?: number;
}

export interface SavedPhotoRecord {
  id: string;
  realmName: string;
  filter: string;
  fov: number;
  rollDeg: number;
  dofMode: 'off' | 'soft' | 'cinematic';
  selfieMode: boolean;
  emoteId: string | null;
  caption: string;
  createdAt: string;
}

export interface SpiritMemoryStepConfig {
  stepIndex: number;
  title: string;
  mode: 'follow' | 'fly' | 'interact';
  x: number;
  y: number;
  z: number;
}

export interface SpiritMemoryQuestState {
  spiritId: string;
  spiritName: string;
  realmId: string;
  emoteUnlocked: string;
  currentStepIndex: number;
  totalSteps: number;
  steps: SpiritMemoryStepConfig[];
  completed: boolean;
}

const STORAGE_KEY = 'glimmer_travelers_save_v2';
const IDB_NAME = 'GlimmerTravelersDB';
const IDB_STORE = 'saves';
const IDB_KEY = 'primary_save';

export function getTodayUtcDateString(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function buildDefaultSaveData(now = new Date()): PersistentSaveData {
  const today = getTodayUtcDateString(now);
  const initialQuests: DailyQuestState[] = GAME_CONFIG.dailyQuestsPool
    .slice(0, 4)
    .map((q) => ({
      id: q.id,
      title: q.title,
      type: q.type,
      currentCount: 0,
      targetCount: q.targetCount,
      rewardType: q.rewardType as 'seasonCandles' | 'hearts',
      rewardAmount: q.rewardAmount,
      claimed: false,
    }));

  return {
    playerId: `traveler_${Math.random().toString(36).slice(2, 9)}`,
    playerName: '星海旅人',
    candles: 88,
    candleWax: 40,
    dailyCandlesForged: 0,
    hearts: 36,
    dailyHeartsReceived: 0,
    seasonCandles: 24,
    ascendedCandles: 18,
    wingedLights: 20,
    collectedWingedLightIds: [],
    relivedSpiritIds: ['spirit_isle_pointing'],
    unlockedConstellationNodes: [
      'node_emote_point_lv1',
      'node_emote_butterfly_lv1',
      'node_emote_cheer_lv1',
      'node_emote_spin_lv1',
      'node_guide_pendant',
      'node_emote_pray_lv1',
    ],
    unlockedCosmeticIds: [
      'cape_classic_flame',
      'cape_owl_white',
      'hair_moth_default',
      'hair_white_bird',
      'hat_none',
      'mask_classic_flame',
      'mask_anubis',
      'face_none',
      'face_star_earrings',
      'neck_none',
      'neck_gold_choker',
      'neck_aurora_pendant',
      'pants_classic_white',
      'pants_fire_prophet',
      'prop_sky_piano',
    ],
    unlockedMusicSheetIds: ['sheet_starlight_lullaby'],
    unlockedCallSoundIds: ['call_default'],
    emoteLevels: {
      emote_butterfly: 1,
      emote_spin_dance: 3,
      emote_bow_respect: 3,
      emote_handstand: 3,
      emote_cheer_jump: 1,
      emote_pray_star: 2,
    },
    equippedLoadout: { ...DEFAULT_LOADOUT },
    friends: {
      bot_traveller_1: {
        peerId: 'bot_traveller_1',
        nickname: '云野牧蝶人',
        ignited: false,
        isFriend: false,
        unlockedNodes: [],
        lastGiftedDate: null,
        online: true,
        isBot: true,
        loadout: {
          cape: 'cape_sakura_bloom',
          hair: 'hair_bunny_peeking',
          mask: 'mask_chibi',
          pants: 'pants_jelly_cargo',
          prop: 'prop_golden_harp',
        },
      },
      bot_traveller_2: {
        peerId: 'bot_traveller_2',
        nickname: '霞谷聆音客',
        ignited: true,
        isFriend: true,
        unlockedNodes: ['ft_ignite', 'ft_friend', 'ft_highfive', 'ft_chat'],
        lastGiftedDate: null,
        online: true,
        isBot: true,
        loadout: {
          cape: 'cape_aurora_wings',
          hair: 'hair_aurora_tiara',
          mask: 'mask_faceless',
          pants: 'pants_aurora_gold',
          prop: 'prop_sky_piano',
        },
      },
      bot_traveller_3: {
        peerId: 'bot_traveller_3',
        nickname: '晨岛寻星者',
        ignited: true,
        isFriend: false,
        unlockedNodes: ['ft_ignite'],
        lastGiftedDate: null,
        online: true,
        isBot: true,
        loadout: {
          cape: 'cape_manta_king',
          hair: 'hair_moth_default',
          mask: 'mask_anubis',
          pants: 'pants_fire_prophet',
          prop: 'prop_golden_harp',
        },
      },
    },
    dailyQuests: initialQuests,
    dailyRerollsUsed: 0,
    lastDailyResetDate: today,
    activeSeasonId: GAME_CONFIG.seasonsAndEvents.activeSeasonId,
    homeFurnitureInventory: ['furn_starlight_brazier', 'furn_chat_bench'],
    homeFurniturePlacements: [
      {
        instanceId: 'placed_brazier_1',
        furnitureId: 'furn_starlight_brazier',
        x: -4.6,
        y: 1.2,
        z: 3.8,
        rotY: 0,
      },
      {
        instanceId: 'placed_bench_1',
        furnitureId: 'furn_chat_bench',
        x: 4.6,
        y: 1.2,
        z: 3.8,
        rotY: -0.4,
      },
    ],
    savedSongs: [...GAME_CONFIG.presetMusicSheets],
    meditationNotes: [
      {
        id: 'med_preset_1',
        author: '云野牧蝶人',
        text: '愿每一缕微光都能穿越云海，照亮独行旅人的夜空。',
        createdAt: today,
      },
      {
        id: 'med_preset_2',
        author: '霞谷聆音客',
        text: '在云野听风声与竖琴共鸣，谢谢身旁素昧平生的陪伴。',
        createdAt: today,
      },
    ],
    activeCallVoice: 'default',
    lastMeditationDate: null,
    blockedPeerIds: [],
    reportedPeers: [],
    completedSeasonQuestIds: [],
    activeTravelingSpiritIndex: 0,
    savedPhotos: [
      {
        id: 'photo_preset_1',
        realmName: '云野 · 蝴蝶平原',
        filter: 'warm_dusk',
        fov: 55,
        rollDeg: 0,
        dofMode: 'soft',
        selfieMode: false,
        emoteId: 'emote_butterfly',
        caption: '与牧蝶先祖在金黄花海共舞',
        createdAt: today,
      },
    ],
    tutorialStep: 0,
    childSafeMode: false,
    locale: 'zh',
    qualityTier: 'auto',
    highContrastMode: false,
    reducedMotionShake: false,
    discoveredEasterEggIds: [],
    bestRaceTimeMs: null,
    bestRaceMedal: null,
    completedRaceCount: 0,
  };
}

/**
 * Pure function to check and apply daily server-time reset for candles, hearts, and quests.
 */
export function checkAndApplyDailyReset(
  save: PersistentSaveData,
  todayStr = getTodayUtcDateString()
): { save: PersistentSaveData; didReset: boolean } {
  if (save.lastDailyResetDate === todayStr) {
    return { save, didReset: false };
  }

  const refreshedQuests: DailyQuestState[] = GAME_CONFIG.dailyQuestsPool
    .slice(0, 4)
    .map((q) => ({
      id: q.id,
      title: q.title,
      type: q.type,
      currentCount: 0,
      targetCount: q.targetCount,
      rewardType: q.rewardType as 'seasonCandles' | 'hearts',
      rewardAmount: q.rewardAmount,
      claimed: false,
    }));

  const nextSave: PersistentSaveData = {
    ...save,
    dailyCandlesForged: 0,
    dailyHeartsReceived: 0,
    dailyRerollsUsed: 0,
    dailyQuests: refreshedQuests,
    lastDailyResetDate: todayStr,
  };

  return { save: nextSave, didReset: true };
}

/**
 * Stage 4: Pure function to forge White Candles from collected Wax while enforcing dailyCandleCap.
 */
export function forgeCandlesFromWaxPure(
  save: PersistentSaveData,
  waxAdded: number
): {
  nextSave: PersistentSaveData;
  forgedCount: number;
  cappedByDailyLimit: boolean;
  message: string;
} {
  const waxPerCandle = GAME_CONFIG.economy.waxPerCandle || 100;
  const dailyCap = GAME_CONFIG.economy.dailyCandleCap || 20;
  const remainingQuota = Math.max(0, dailyCap - save.dailyCandlesForged);

  const totalWax = Math.max(0, save.candleWax + waxAdded);
  const potentialCandles = Math.floor(totalWax / waxPerCandle);
  const forgedCount = Math.min(potentialCandles, remainingQuota);
  const cappedByDailyLimit = potentialCandles > remainingQuota;

  const leftoverWax = cappedByDailyLimit
    ? Math.min(waxPerCandle - 1, totalWax - forgedCount * waxPerCandle)
    : totalWax % waxPerCandle;

  const nextSave: PersistentSaveData = {
    ...save,
    candles: save.candles + forgedCount,
    candleWax: leftoverWax,
    dailyCandlesForged: save.dailyCandlesForged + forgedCount,
  };

  let message = '';
  if (forgedCount > 0) {
    message = `烛火凝结成功：合成 +${forgedCount} 根白蜡烛（今日已合成 ${nextSave.dailyCandlesForged}/${dailyCap}）！`;
  } else if (cappedByDailyLimit) {
    message = `今日白蜡烛合成已达上限 (${dailyCap}/${dailyCap})，请明日再来收集烛火！`;
  } else {
    message = `已收集 +${waxAdded} 滴烛火（当前进度 ${nextSave.candleWax}/${waxPerCandle}）`;
  }

  return { nextSave, forgedCount, cappedByDailyLimit, message };
}

/**
 * Stage 4: Start a multi-step Spirit Memory Quest from gameConfig.json.
 */
export function startSpiritMemoryQuestPure(
  spiritId: string
): SpiritMemoryQuestState | null {
  const quests = (GAME_CONFIG as any).spiritMemoryQuests as
    | {
        spiritId: string;
        spiritName: string;
        realmId: string;
        emoteUnlocked: string;
        steps: SpiritMemoryStepConfig[];
      }[]
    | undefined;
  const found = quests?.find((q) => q.spiritId === spiritId);
  if (!found || !found.steps || found.steps.length === 0) return null;

  return {
    spiritId: found.spiritId,
    spiritName: found.spiritName,
    realmId: found.realmId,
    emoteUnlocked: found.emoteUnlocked,
    currentStepIndex: 1,
    totalSteps: found.steps.length,
    steps: found.steps.map((s) => ({
      stepIndex: s.stepIndex,
      title: s.title,
      mode: s.mode as 'follow' | 'fly' | 'interact',
      x: s.x,
      y: s.y,
      z: s.z,
    })),
    completed: false,
  };
}

/**
 * Stage 4: Advance active Spirit Memory Quest step-by-step; upon completing final step,
 * adds spirit to relivedSpiritIds in Constellation, unlocks Lv.1 emote, and grants rewards.
 */
export function advanceSpiritMemoryStepPure(
  quest: SpiritMemoryQuestState,
  save: PersistentSaveData
): {
  nextQuest: SpiritMemoryQuestState | null;
  nextSave: PersistentSaveData;
  completed: boolean;
  message: string;
} {
  if (quest.currentStepIndex < quest.totalSteps) {
    const nextIdx = quest.currentStepIndex + 1;
    const stepObj = quest.steps[nextIdx - 1];
    const nextQuest: SpiritMemoryQuestState = {
      ...quest,
      currentStepIndex: nextIdx,
    };
    return {
      nextQuest,
      nextSave: save,
      completed: false,
      message: `✦ 先祖记忆共鸣推进 (${nextIdx}/${quest.totalSteps})：${stepObj.title}`,
    };
  }

  // Final step completed! Add spirit to Constellation & award currency
  const forgeRes = forgeCandlesFromWaxPure(save, 50);
  const nextSave: PersistentSaveData = {
    ...forgeRes.nextSave,
    hearts: forgeRes.nextSave.hearts + 1,
    ascendedCandles: forgeRes.nextSave.ascendedCandles + 2,
    relivedSpiritIds: save.relivedSpiritIds.includes(quest.spiritId)
      ? [...save.relivedSpiritIds]
      : [...save.relivedSpiritIds, quest.spiritId],
    unlockedConstellationNodes: [...save.unlockedConstellationNodes],
    emoteLevels: {
      ...save.emoteLevels,
      [quest.emoteUnlocked]: Math.max(
        save.emoteLevels[quest.emoteUnlocked] || 0,
        1
      ),
    },
  };

  // Ensure root free node of this spirit is unlocked in Constellation
  const spiritCfg = GAME_CONFIG.constellations.find(
    (s) => s.spiritId === quest.spiritId
  );
  if (spiritCfg && spiritCfg.nodes.length > 0) {
    const rootNode = spiritCfg.nodes[0];
    if (
      rootNode.costType === 'free' &&
      !nextSave.unlockedConstellationNodes.includes(rootNode.id)
    ) {
      nextSave.unlockedConstellationNodes.push(rootNode.id);
    }
  }

  return {
    nextQuest: null,
    nextSave,
    completed: true,
    message: `🌟 先祖记忆圆满重温！「${quest.spiritName}」已化作流星归入你的星盘，解锁「${quest.emoteUnlocked}」动作并获得 +1 爱心 & +2 升华红蜡烛！`,
  };
}

/**
 * Pure function to unlock a Constellation node with prerequisite & currency validation.
 */
export function unlockConstellationNodePure(
  save: PersistentSaveData,
  spiritId: string,
  nodeId: string
): { nextSave: PersistentSaveData; success: boolean; message: string } {
  if (save.unlockedConstellationNodes.includes(nodeId)) {
    return { nextSave: save, success: false, message: '该星盘节点已解锁' };
  }

  const spirit = GAME_CONFIG.constellations.find((s) => s.spiritId === spiritId);
  if (!spirit) {
    return { nextSave: save, success: false, message: '未找到对应先祖星盘' };
  }

  const node = spirit.nodes.find((n) => n.id === nodeId);
  if (!node) {
    return { nextSave: save, success: false, message: '未找到该星盘节点' };
  }

  if (
    node.prerequisiteId &&
    !save.unlockedConstellationNodes.includes(node.prerequisiteId)
  ) {
    return {
      nextSave: save,
      success: false,
      message: '请先解锁前置星盘节点！',
    };
  }

  const nextSave: PersistentSaveData = {
    ...save,
    relivedSpiritIds: save.relivedSpiritIds.includes(spiritId)
      ? [...save.relivedSpiritIds]
      : [...save.relivedSpiritIds, spiritId],
    unlockedConstellationNodes: [...save.unlockedConstellationNodes],
    unlockedCosmeticIds: [...save.unlockedCosmeticIds],
    unlockedMusicSheetIds: [...(save.unlockedMusicSheetIds || [])],
    unlockedCallSoundIds: [...(save.unlockedCallSoundIds || [])],
    emoteLevels: { ...save.emoteLevels },
  };

  if (node.costType === 'candles') {
    if (nextSave.candles < node.costAmount) {
      return { nextSave: save, success: false, message: '白蜡烛数量不足' };
    }
    nextSave.candles -= node.costAmount;
  } else if (node.costType === 'hearts') {
    if (nextSave.hearts < node.costAmount) {
      return { nextSave: save, success: false, message: '先祖爱心数量不足' };
    }
    nextSave.hearts -= node.costAmount;
  } else if (node.costType === 'seasonCandles') {
    if (nextSave.seasonCandles < node.costAmount) {
      return { nextSave: save, success: false, message: '季节蜡烛数量不足' };
    }
    nextSave.seasonCandles -= node.costAmount;
  } else if (node.costType === 'ascendedCandles') {
    if (nextSave.ascendedCandles < node.costAmount) {
      return { nextSave: save, success: false, message: '升华红蜡烛数量不足' };
    }
    nextSave.ascendedCandles -= node.costAmount;
  }

  nextSave.unlockedConstellationNodes.push(node.id);
  if (
    node.category === 'cosmetic' &&
    !nextSave.unlockedCosmeticIds.includes(node.targetId)
  ) {
    nextSave.unlockedCosmeticIds.push(node.targetId);
  } else if (node.category === 'emote' && (node as any).level) {
    nextSave.emoteLevels[node.targetId] = Math.max(
      nextSave.emoteLevels[node.targetId] || 1,
      (node as any).level
    );
  } else if (node.category === 'wing_buff') {
    nextSave.wingedLights += 1;
  } else if (node.category === 'heart') {
    nextSave.hearts += 1;
    nextSave.dailyHeartsReceived += 1;
  } else if (
    node.category === 'music_sheet' &&
    !nextSave.unlockedMusicSheetIds!.includes(node.targetId)
  ) {
    nextSave.unlockedMusicSheetIds!.push(node.targetId);
  } else if (
    node.category === 'call_sound' &&
    !nextSave.unlockedCallSoundIds!.includes(node.targetId)
  ) {
    nextSave.unlockedCallSoundIds!.push(node.targetId);
  }

  return {
    nextSave,
    success: true,
    message:
      node.category === 'cosmetic'
        ? `星盘共鸣成功：已解锁装扮「${node.name}」并收入衣橱！`
        : node.category === 'heart'
          ? `与先祖兑换成功：获得 +1 颗先祖爱心！`
          : `星盘共鸣成功：已解锁「${node.name}」！`,
  };
}

/**
 * Pure function to unlock a Friend Tree node with a specific peer.
 */
export function unlockFriendTreeNodePure(
  save: PersistentSaveData,
  peerId: string,
  nodeId: string
): { nextSave: PersistentSaveData; success: boolean; message: string } {
  const friend = save.friends[peerId];
  if (!friend) {
    return { nextSave: save, success: false, message: '未找到该旅人记录' };
  }

  if (friend.unlockedNodes.includes(nodeId)) {
    return { nextSave: save, success: false, message: '该好友树节点已解锁' };
  }

  const nodeCfg = GAME_CONFIG.social.friendTreeNodes.find((n) => n.id === nodeId);
  if (!nodeCfg) {
    return { nextSave: save, success: false, message: '未知的好友树节点' };
  }

  if (
    nodeCfg.prerequisiteId &&
    !friend.unlockedNodes.includes(nodeCfg.prerequisiteId)
  ) {
    return {
      nextSave: save,
      success: false,
      message: '请先与对方解锁上一级好友互动节点！',
    };
  }

  const nextSave: PersistentSaveData = {
    ...save,
    friends: {
      ...save.friends,
      [peerId]: {
        ...friend,
        unlockedNodes: [...friend.unlockedNodes],
      },
    },
  };

  if (nodeCfg.costType === 'candles') {
    if (nextSave.candles < nodeCfg.costAmount) {
      return { nextSave: save, success: false, message: '白蜡烛不足，无法解锁该好友节点' };
    }
    nextSave.candles -= nodeCfg.costAmount;
  } else if (nodeCfg.costType === 'hearts') {
    if (nextSave.hearts < nodeCfg.costAmount) {
      return { nextSave: save, success: false, message: '爱心不足，无法解锁该好友节点' };
    }
    nextSave.hearts -= nodeCfg.costAmount;
  }

  const targetFriend = nextSave.friends[peerId];
  targetFriend.unlockedNodes.push(nodeId);
  if (nodeId === 'ft_ignite') targetFriend.ignited = true;
  if (nodeId === 'ft_friend') targetFriend.isFriend = true;

  return {
    nextSave,
    success: true,
    message: `与「${targetFriend.nickname}」成功解锁好友树节点：${nodeCfg.name}！`,
  };
}

/**
 * Filter sensitive words for friend chat bubbles.
 */
export function filterSensitiveChat(rawText: string): string {
  let cleaned = rawText.trim().slice(0, 60);
  for (const word of GAME_CONFIG.social.sensitiveWords) {
    if (cleaned.includes(word)) {
      cleaned = cleaned.split(word).join('**');
    }
  }
  return cleaned;
}

/**
 * Stage 5 Pure Function: Submit a Shrine Meditation blessing note, filter sensitive words,
 * and grant +1 Heart on the first meditation of the day.
 */
export function submitMeditationNotePure(
  save: PersistentSaveData,
  rawText: string,
  todayStr = getTodayUtcDateString()
): {
  nextSave: PersistentSaveData;
  heartAwarded: boolean;
  cleanedText: string;
  message: string;
} {
  const cleanedText = filterSensitiveChat(
    rawText.trim() ||
      '愿每一缕微光都能穿越云海，照亮独行旅人的夜空。'
  );
  const alreadyRewardedToday = save.lastMeditationDate === todayStr;
  const heartReward = alreadyRewardedToday
    ? 0
    : ((GAME_CONFIG as any).expression?.meditation?.heartReward ?? 1);

  const newNote = {
    id: `med_${Date.now()}`,
    author: save.playerName || '星海旅人',
    text: cleanedText,
    createdAt: todayStr,
  };

  const nextSave: PersistentSaveData = {
    ...save,
    hearts: save.hearts + heartReward,
    lastMeditationDate: todayStr,
    meditationNotes: [newNote, ...(save.meditationNotes || []).slice(0, 11)],
  };

  const message =
    heartReward > 0
      ? `🧘 神龛冥想心语已化作纸船星光漂流：「${cleanedText}」· 获得今日冥想馈赠 +${heartReward} 颗先祖爱心 & 斗篷翼能回满！`
      : `🧘 神龛冥想心语已寄出：「${cleanedText}」· 斗篷翼能已瞬间回满！`;

  return {
    nextSave,
    heartAwarded: heartReward > 0,
    cleanedText,
    message,
  };
}

/**
 * Stage 5 Pure Function: Set or upgrade an Emote's active level (Lv.1 to Lv.5) in save data.
 */
export function setEmoteLevelPure(
  save: PersistentSaveData,
  emoteId: string,
  targetLevel: number
): PersistentSaveData {
  const clamped = Math.max(1, Math.min(5, Math.round(targetLevel)));
  return {
    ...save,
    emoteLevels: {
      ...save.emoteLevels,
      [emoteId]: clamped,
    },
  };
}

/**
 * Stage 7 Pure Function: Ignites an unlit stranger silhouette (`ft_ignite`, free),
 * revealing their true appearance and nickname.
 */
export function igniteStrangerPure(
  save: PersistentSaveData,
  peerId: string,
  fallbackNickname = '远方星火旅人',
  fallbackLoadout: EquippedLoadout = DEFAULT_LOADOUT
): {
  nextSave: PersistentSaveData;
  newlyIgnited: boolean;
  message: string;
} {
  if ((save.blockedPeerIds || []).includes(peerId)) {
    return {
      nextSave: save,
      newlyIgnited: false,
      message: '已屏蔽该旅人，请先解除屏蔽后再递出烛火',
    };
  }

  const existing = save.friends[peerId];
  if (existing && existing.ignited && existing.unlockedNodes.includes('ft_ignite')) {
    return {
      nextSave: save,
      newlyIgnited: false,
      message: `已与「${existing.nickname}」相互点亮心火`,
    };
  }

  const updatedRecord: FriendRecord = existing
    ? {
        ...existing,
        ignited: true,
        unlockedNodes: existing.unlockedNodes.includes('ft_ignite')
          ? [...existing.unlockedNodes]
          : ['ft_ignite', ...existing.unlockedNodes],
      }
    : {
        peerId,
        nickname: fallbackNickname,
        ignited: true,
        isFriend: false,
        unlockedNodes: ['ft_ignite'],
        lastGiftedDate: null,
        online: true,
        isBot: peerId.startsWith('bot_'),
        loadout: fallbackLoadout,
      };

  const nextSave: PersistentSaveData = {
    ...save,
    friends: {
      ...save.friends,
      [peerId]: updatedRecord,
    },
  };

  return {
    nextSave,
    newlyIgnited: true,
    message: `🕯️ 心火共鸣成功！已照亮旅人「${updatedRecord.nickname}」的真实装扮面貌，可递出 1 根白蜡烛缔结好友`,
  };
}

/**
 * Stage 7 Pure Function: Sends/accepts a Friend Request (`ft_friend`, costs 1 White Candle)
 * with an optional custom nickname.
 */
export function sendOrAcceptFriendRequestPure(
  save: PersistentSaveData,
  peerId: string,
  customNickname?: string
): {
  nextSave: PersistentSaveData;
  success: boolean;
  message: string;
} {
  if ((save.blockedPeerIds || []).includes(peerId)) {
    return {
      nextSave: save,
      success: false,
      message: '该旅人处于屏蔽列表中，无法发起好友请求',
    };
  }

  const friend = save.friends[peerId];
  if (!friend || !friend.ignited || !friend.unlockedNodes.includes('ft_ignite')) {
    return {
      nextSave: save,
      success: false,
      message: '请先向该陌生旅人递出烛火完成「点亮星火 (Lv.0)」！',
    };
  }

  if (friend.isFriend && friend.unlockedNodes.includes('ft_friend')) {
    if (customNickname && customNickname.trim()) {
      return renameFriendNicknamePure(save, peerId, customNickname);
    }
    return {
      nextSave: save,
      success: false,
      message: `「${friend.nickname}」已是你的星盘好友`,
    };
  }

  const cost = GAME_CONFIG.economy.friendRequestCostCandles || 1;
  if (save.candles < cost) {
    return {
      nextSave: save,
      success: false,
      message: `白蜡烛不足 ${cost} 根，无法递出结友蜡烛`,
    };
  }

  const cleanedNick =
    customNickname && customNickname.trim()
      ? filterSensitiveChat(customNickname.trim()).slice(0, 18)
      : friend.nickname;

  const nextSave: PersistentSaveData = {
    ...save,
    candles: save.candles - cost,
    friends: {
      ...save.friends,
      [peerId]: {
        ...friend,
        nickname: cleanedNick || friend.nickname,
        ignited: true,
        isFriend: true,
        unlockedNodes: friend.unlockedNodes.includes('ft_friend')
          ? [...friend.unlockedNodes]
          : [...friend.unlockedNodes, 'ft_friend'],
      },
    },
  };

  return {
    nextSave,
    success: true,
    message: `🤝 结友仪式达成！已赠予 1 根白蜡烛与「${cleanedNick || friend.nickname}」缔结星盘好友，解锁牵手共飞与好友传送！`,
  };
}

/**
 * Stage 7 Pure Function: Renames an existing friend's nickname with sensitive-word filtering.
 */
export function renameFriendNicknamePure(
  save: PersistentSaveData,
  peerId: string,
  rawNickname: string
): {
  nextSave: PersistentSaveData;
  success: boolean;
  message: string;
} {
  const friend = save.friends[peerId];
  if (!friend || !friend.ignited) {
    return {
      nextSave: save,
      success: false,
      message: '请先点亮该旅人后再设置专属爱称',
    };
  }
  const cleaned = filterSensitiveChat(rawNickname.trim()).slice(0, 18);
  if (!cleaned) {
    return {
      nextSave: save,
      success: false,
      message: '请输入有效的好友备注昵称',
    };
  }

  const nextSave: PersistentSaveData = {
    ...save,
    friends: {
      ...save.friends,
      [peerId]: {
        ...friend,
        nickname: cleaned,
      },
    },
  };

  return {
    nextSave,
    success: true,
    message: `✏️ 已将好友专属星盘爱称更新为：「${cleaned}」`,
  };
}

/**
 * Stage 7 Pure Function: Checks whether local player and target peer are allowed to exchange
 * readable text chat (requires either Lv.3 `ft_chat` unlocked OR sitting on a Double Chat Bench `sit_bench`,
 * and neither childSafeMode nor blocked).
 */
export function canPlayersChatPure(
  save: PersistentSaveData,
  peerId: string,
  sitMode = 'none'
): {
  allowed: boolean;
  channel: 'friend_chat' | 'bench_chat' | 'blocked';
  reason: string;
} {
  if (save.childSafeMode) {
    return {
      allowed: false,
      channel: 'blocked',
      reason: '当前处于儿童守护模式，仅使用先祖动作与呼唤交流',
    };
  }
  if ((save.blockedPeerIds || []).includes(peerId)) {
    return {
      allowed: false,
      channel: 'blocked',
      reason: '该旅人已被屏蔽，无法收发星语气泡',
    };
  }
  if (sitMode === 'sit_bench') {
    return {
      allowed: true,
      channel: 'bench_chat',
      reason: '双人云石长椅共坐交谈中（无需解锁好友树即可畅聊）',
    };
  }
  const friend = save.friends[peerId];
  if (friend && friend.unlockedNodes.includes('ft_chat')) {
    return {
      allowed: true,
      channel: 'friend_chat',
      reason: '已解锁 Lv.3 心音密语好友自由畅聊',
    };
  }
  return {
    allowed: false,
    channel: 'blocked',
    reason: '尚未解锁「Lv.3 心音密语」节点（或请并排坐上双人云石长椅开启长椅夜话）',
  };
}

/**
 * Stage 7 Pure Function: Toggles blocking/unblocking a traveler (`blockedPeerIds`).
 */
export function toggleBlockPeerPure(
  save: PersistentSaveData,
  peerId: string
): {
  nextSave: PersistentSaveData;
  isBlocked: boolean;
  message: string;
} {
  const list = save.blockedPeerIds || [];
  const exists = list.includes(peerId);
  const nextList = exists
    ? list.filter((id) => id !== peerId)
    : [...list, peerId];
  const nick = save.friends[peerId]?.nickname || peerId;

  const nextSave: PersistentSaveData = {
    ...save,
    blockedPeerIds: nextList,
  };

  return {
    nextSave,
    isBlocked: !exists,
    message: !exists
      ? `🚫 已屏蔽旅人「${nick}」：其模型、呼唤与聊天气泡已隐藏，双人动作已断开`
      : `✓ 已解除对「${nick}」的屏蔽，恢复正常星盘共鸣`,
  };
}

/**
 * Stage 7 Pure Function: Submits a player safety report (`reportedPeers`) and automatically blocks the peer.
 */
export function reportPeerPure(
  save: PersistentSaveData,
  peerId: string,
  reason: string,
  autoBlock = true,
  todayStr = getTodayUtcDateString()
): {
  nextSave: PersistentSaveData;
  reportEntry: {
    peerId: string;
    nickname: string;
    reason: string;
    createdAt: string;
  };
  message: string;
} {
  const nick = save.friends[peerId]?.nickname || peerId;
  const cleanedReason = filterSensitiveChat(reason.trim() || '言语不当');
  const entry = {
    peerId,
    nickname: nick,
    reason: cleanedReason,
    createdAt: todayStr,
  };

  const blocked = save.blockedPeerIds || [];
  const nextBlocked =
    autoBlock && !blocked.includes(peerId) ? [...blocked, peerId] : blocked;

  const nextSave: PersistentSaveData = {
    ...save,
    blockedPeerIds: nextBlocked,
    reportedPeers: [entry, ...(save.reportedPeers || []).slice(0, 19)],
  };

  return {
    nextSave,
    reportEntry: entry,
    message: `🛡️ 举报已提交至守护先祖巡查台（对象：「${nick}」· 原因：${cleanedReason}），已自动为你屏蔽该旅人`,
  };
}

/**
 * Stage 7 Pure Function: Validates and computes starlight warp teleport coordinates to a friend.
 */
export function computeTeleportToFriendPure(
  save: PersistentSaveData,
  peerId: string,
  peerTransform: { x: number; y: number; z: number; yaw: number; realmId?: string }
): {
  success: boolean;
  targetX: number;
  targetY: number;
  targetZ: number;
  targetYaw: number;
  targetRealm?: string;
  message: string;
} {
  if ((save.blockedPeerIds || []).includes(peerId)) {
    return {
      success: false,
      targetX: 0,
      targetY: 0,
      targetZ: 0,
      targetYaw: 0,
      message: '无法传送至已屏蔽旅人身边',
    };
  }
  const friend = save.friends[peerId];
  if (!friend || !friend.isFriend || !friend.unlockedNodes.includes('ft_friend')) {
    return {
      success: false,
      targetX: 0,
      targetY: 0,
      targetZ: 0,
      targetYaw: 0,
      message: '请先与该旅人缔结星盘好友（Lv.1），即可开启星盘跨区传送！',
    };
  }

  const offset = (GAME_CONFIG.social as any).teleportOffsetMeters || 1.45;
  const targetX = Number((peerTransform.x + Math.sin(peerTransform.yaw) * offset).toFixed(2));
  const targetZ = Number((peerTransform.z + Math.cos(peerTransform.yaw) * offset).toFixed(2));
  const targetY = Number(Math.max(0.2, peerTransform.y).toFixed(2));
  const targetYaw = Number(((peerTransform.yaw + Math.PI) % (Math.PI * 2)).toFixed(3));

  return {
    success: true,
    targetX,
    targetY,
    targetZ,
    targetYaw,
    targetRealm: peerTransform.realmId,
    message: `🌠 星盘跃迁成功！已化作流星传送至挚友「${friend.nickname}」身旁`,
  };
}

/**
 * Stage 7 Pure Function: Validates and executes dual collaborative actions:
 * - 'hand_hold' (requires ft_friend)
 * - 'high_five' (requires ft_highfive, restores +1.5 wing energy)
 * - 'hug' (requires ft_hug, restores 100% wing energy & clears tempLostWedges)
 * - 'carry' (requires ft_carry, piggyback flight)
 * - 'release' (detaches active dual mode)
 */
export function executeDualSocialActionPure<
  TPhys extends {
    wingEnergy: number;
    maxWingWedges: number;
    tempLostWedges: number;
  },
>(
  save: PersistentSaveData,
  physics: TPhys,
  peerId: string,
  action: 'hand_hold' | 'high_five' | 'hug' | 'carry' | 'release'
): {
  success: boolean;
  nextPhysics: TPhys;
  nextDualMode: 'none' | 'hand_hold' | 'carry' | 'bench_sit';
  nextPartnerId: string | null;
  activeEmote: string | null;
  message: string;
} {
  if (action === 'release') {
    return {
      success: true,
      nextPhysics: { ...physics },
      nextDualMode: 'none',
      nextPartnerId: null,
      activeEmote: null,
      message: '已松开双人协作，恢复自由探索',
    };
  }

  if ((save.blockedPeerIds || []).includes(peerId)) {
    return {
      success: false,
      nextPhysics: physics,
      nextDualMode: 'none',
      nextPartnerId: null,
      activeEmote: null,
      message: '已屏蔽该旅人，无法发起双人互动',
    };
  }

  const friend = save.friends[peerId];
  if (!friend || !friend.ignited) {
    return {
      success: false,
      nextPhysics: physics,
      nextDualMode: 'none',
      nextPartnerId: null,
      activeEmote: null,
      message: '请先点亮该陌生旅人并解锁对应好友树节点！',
    };
  }

  const reqMap: Record<'hand_hold' | 'high_five' | 'hug' | 'carry', { node: string; label: string }> = {
    hand_hold: { node: 'ft_friend', label: 'Lv.1 缔结好友 & 牵手共飞' },
    high_five: { node: 'ft_highfive', label: 'Lv.2 星光击掌' },
    hug: { node: 'ft_hug', label: 'Lv.4 温暖拥抱' },
    carry: { node: 'ft_carry', label: 'Lv.5 背抱翱翔' },
  };

  const req = reqMap[action];
  if (!friend.unlockedNodes.includes(req.node)) {
    return {
      success: false,
      nextPhysics: physics,
      nextDualMode: 'none',
      nextPartnerId: null,
      activeEmote: null,
      message: `尚未与「${friend.nickname}」解锁好友树节点：${req.label}`,
    };
  }

  if (action === 'hand_hold') {
    const nextPhysics: TPhys = {
      ...physics,
      wingEnergy: Math.min(physics.maxWingWedges, physics.wingEnergy + 1.0),
    };
    return {
      success: true,
      nextPhysics,
      nextDualMode: 'hand_hold',
      nextPartnerId: peerId,
      activeEmote: null,
      message: `🤝 已与「${friend.nickname}」牵手同步共飞 · 旅途心火相连，持续为你恢复翼能！`,
    };
  }

  if (action === 'carry') {
    const nextPhysics: TPhys = {
      ...physics,
      wingEnergy: Math.min(physics.maxWingWedges, physics.wingEnergy + 1.5),
    };
    return {
      success: true,
      nextPhysics,
      nextDualMode: 'carry',
      nextPartnerId: peerId,
      activeEmote: null,
      message: `🎒 已与「${friend.nickname}」开启背抱翱翔 · 挚友正骑在你的肩头一同穿云飞翔！`,
    };
  }

  if (action === 'high_five') {
    const boost = (GAME_CONFIG.social as any).highFiveEnergyRestoreWedges || 1.5;
    const nextPhysics: TPhys = {
      ...physics,
      wingEnergy: Math.min(physics.maxWingWedges, physics.wingEnergy + boost),
    };
    return {
      success: true,
      nextPhysics,
      nextDualMode: 'none',
      nextPartnerId: null,
      activeEmote: 'emote_high_five',
      message: `🙌 与「${friend.nickname}」欢庆星光击掌！掌心迸发灿烂星火，恢复 +${boost} 格翼能！`,
    };
  }

  // action === 'hug'
  const nextPhysics: TPhys = {
    ...physics,
    wingEnergy: physics.maxWingWedges,
    tempLostWedges: 0,
  };
  return {
    success: true,
    nextPhysics,
    nextDualMode: 'none',
    nextPartnerId: null,
    activeEmote: 'emote_hug',
    message: `🫂 与「${friend.nickname}」温暖相拥！心火共鸣已瞬间回满全部 ${physics.maxWingWedges} 格斗篷光能并修复受损羽翼！`,
  };
}

// ============================================================================
// Stage 9: Daily Quests, Seasonal Guide Storyline (4 Acts + Ultimate Gift),
// Traveling Spirit Rotation, Season-End 1:1 Candle Conversion & Shard Events
// ============================================================================

/**
 * Stage 9 Pure Function: Advances progress on matching Daily Quests by `delta`
 * (or completes all 4 daily quests when `questIdOrType === 'ALL'`).
 */
export function progressDailyQuestPure(
  save: PersistentSaveData,
  questIdOrType: string,
  delta = 1
): {
  nextSave: PersistentSaveData;
  progressedIds: string[];
  newlyCompletedTitle: string | null;
} {
  const progressedIds: string[] = [];
  let newlyCompletedTitle: string | null = null;

  const nextQuests = save.dailyQuests.map((q) => {
    const matches =
      questIdOrType === 'ALL' ||
      q.id === questIdOrType ||
      q.type === questIdOrType;
    if (!matches || q.claimed) return q;

    const add = questIdOrType === 'ALL' ? q.targetCount : Math.max(1, delta);
    const nextCount = Math.min(q.targetCount, q.currentCount + add);
    if (nextCount > q.currentCount) {
      progressedIds.push(q.id);
      if (nextCount >= q.targetCount && q.currentCount < q.targetCount) {
        newlyCompletedTitle = q.title;
      }
    }
    return {
      ...q,
      currentCount: nextCount,
    };
  });

  return {
    nextSave: {
      ...save,
      dailyQuests: nextQuests,
    },
    progressedIds,
    newlyCompletedTitle,
  };
}

/**
 * Stage 9 Pure Function: Claims reward (+seasonCandles or +hearts) for a completed Daily Quest.
 */
export function claimDailyQuestPure(
  save: PersistentSaveData,
  questId: string
): {
  success: boolean;
  nextSave: PersistentSaveData;
  message: string;
} {
  const quest = save.dailyQuests.find((q) => q.id === questId);
  if (!quest) {
    return { success: false, nextSave: save, message: '未找到该每日任务' };
  }
  if (quest.claimed) {
    return {
      success: false,
      nextSave: save,
      message: `今日任务「${quest.title}」已领取过奖励！`,
    };
  }
  if (quest.currentCount < quest.targetCount) {
    return {
      success: false,
      nextSave: save,
      message: `任务「${quest.title}」尚未达成 (${quest.currentCount}/${quest.targetCount})`,
    };
  }

  const nextSave: PersistentSaveData = {
    ...save,
    seasonCandles:
      quest.rewardType === 'seasonCandles'
        ? save.seasonCandles + quest.rewardAmount
        : save.seasonCandles,
    hearts:
      quest.rewardType === 'hearts'
        ? save.hearts + quest.rewardAmount
        : save.hearts,
    dailyQuests: save.dailyQuests.map((q) =>
      q.id === questId ? { ...q, claimed: true } : q
    ),
  };

  return {
    success: true,
    nextSave,
    message: `✦ 已领取每日任务「${quest.title}」奖励：+${quest.rewardAmount} ${
      quest.rewardType === 'seasonCandles' ? '季节蜡烛' : '先祖爱心'
    }！`,
  };
}

/**
 * Stage 9 Pure Function: Completes a Seasonal Guide Storyline Act (`sq_act_1`..`sq_act_4`),
 * awarding Hearts, Season Candles, Ascended Candles, and the Ultimate Gift (`cape_aurora_wings`) on Act 4.
 */
export function completeSeasonStoryActPure(
  save: PersistentSaveData,
  actId?: string
): {
  success: boolean;
  completedActId: string | null;
  nextSave: PersistentSaveData;
  message: string;
} {
  const storyQuests =
    ((GAME_CONFIG.seasonsAndEvents as any).seasonStoryQuests as {
      id: string;
      actNumber: number;
      title: string;
      realmId: string;
      description: string;
      rewardHearts: number;
      rewardSeasonCandles: number;
      rewardAscendedCandles: number;
      unlockCosmeticId: string | null;
    }[]) || [];

  const doneList = save.completedSeasonQuestIds || [];
  const targetAct = actId
    ? storyQuests.find((a) => a.id === actId)
    : storyQuests.find((a) => !doneList.includes(a.id)) ||
      storyQuests[storyQuests.length - 1];

  if (!targetAct) {
    return {
      success: false,
      completedActId: null,
      nextSave: save,
      message: '未找到季节向导剧情任务配置',
    };
  }

  if (doneList.includes(targetAct.id)) {
    return {
      success: false,
      completedActId: targetAct.id,
      nextSave: save,
      message: `已通关「${targetAct.title}」· 可随时重温星海乐章！`,
    };
  }

  const nextCosmetics =
    targetAct.unlockCosmeticId &&
    !save.unlockedCosmeticIds.includes(targetAct.unlockCosmeticId)
      ? [...save.unlockedCosmeticIds, targetAct.unlockCosmeticId]
      : [...save.unlockedCosmeticIds];

  const nextSave: PersistentSaveData = {
    ...save,
    hearts: save.hearts + (targetAct.rewardHearts || 0),
    seasonCandles: save.seasonCandles + (targetAct.rewardSeasonCandles || 0),
    ascendedCandles:
      save.ascendedCandles + (targetAct.rewardAscendedCandles || 0),
    completedSeasonQuestIds: [...doneList, targetAct.id],
    unlockedCosmeticIds: nextCosmetics,
  };

  return {
    success: true,
    completedActId: targetAct.id,
    nextSave,
    message: targetAct.unlockCosmeticId
      ? `🌟 达成季节终章「${targetAct.title}」！获得 +${targetAct.rewardHearts} 爱心、+${targetAct.rewardSeasonCandles} 季节蜡烛，并解锁毕业礼「欧若拉流光透明神翼」！`
      : `🌟 完成季节向导剧情「${targetAct.title}」！获得 +${targetAct.rewardHearts} 爱心 & +${targetAct.rewardSeasonCandles} 季节蜡烛！`,
  };
}

/**
 * Stage 9 Pure Function: Rotates the visiting Traveling Spirit (复刻旅行先祖) at the Home Shrine,
 * unlocking their featured seasonal cosmetic and +1 Wing Buff when greeted.
 */
export function rotateTravelingSpiritPure(
  save: PersistentSaveData,
  explicitIndex?: number
): {
  nextSave: PersistentSaveData;
  activeSpirit: {
    id: string;
    spiritId: string;
    name: string;
    seasonOrigin: string;
    stayWindowLabel: string;
    featuredCosmeticId: string;
    featuredCosmeticName: string;
    wingBuffBonus: number;
  };
  message: string;
} {
  const pool =
    ((GAME_CONFIG.seasonsAndEvents as any).travelingSpiritsPool as {
      id: string;
      spiritId: string;
      name: string;
      seasonOrigin: string;
      stayWindowLabel: string;
      featuredCosmeticId: string;
      featuredCosmeticName: string;
      wingBuffBonus: number;
    }[]) || [];

  const currIdx = save.activeTravelingSpiritIndex ?? 0;
  const nextIdx =
    typeof explicitIndex === 'number'
      ? ((explicitIndex % pool.length) + pool.length) % pool.length
      : (currIdx + 1) % Math.max(1, pool.length);

  const activeSpirit = pool[nextIdx] || {
    id: 'ts_peeking_bunny',
    spiritId: 'spirit_valley_spin',
    name: '复刻先祖 · 梦想季偷看邮差',
    seasonOrigin: '梦想季',
    stayWindowLabel: '周四 06:00 — 周一 12:00',
    featuredCosmeticId: 'hair_bunny_peeking',
    featuredCosmeticName: '梦想季垂耳兔绒帽发',
    wingBuffBonus: 1,
  };

  const nextCosmetics = save.unlockedCosmeticIds.includes(
    activeSpirit.featuredCosmeticId
  )
    ? [...save.unlockedCosmeticIds]
    : [...save.unlockedCosmeticIds, activeSpirit.featuredCosmeticId];

  const nextRelived = save.relivedSpiritIds.includes(activeSpirit.spiritId)
    ? [...save.relivedSpiritIds]
    : [...save.relivedSpiritIds, activeSpirit.spiritId];

  const nextSave: PersistentSaveData = {
    ...save,
    activeTravelingSpiritIndex: nextIdx,
    unlockedCosmeticIds: nextCosmetics,
    relivedSpiritIds: nextRelived,
  };

  return {
    nextSave,
    activeSpirit,
    message: `⏳ 复刻旅行先祖已降临遇境星盘：「${activeSpirit.name}」（来自${activeSpirit.seasonOrigin}）· 已开放限定装扮「${activeSpirit.featuredCosmeticName}」兑换！`,
  };
}

/**
 * Stage 9 Pure Function: Season-End Settlement converting all remaining Season Candles 1:1
 * into regular White Candles (`candles += seasonCandles`, `seasonCandles = 0`).
 */
export function settleSeasonEndConversionPure(save: PersistentSaveData): {
  convertedCount: number;
  nextSave: PersistentSaveData;
  message: string;
} {
  const rate =
    Number(
      (GAME_CONFIG.seasonsAndEvents as any).seasonCandleEndConversionRate
    ) || 1.0;
  const convertedCount = Math.floor(save.seasonCandles * rate);
  if (convertedCount <= 0) {
    return {
      convertedCount: 0,
      nextSave: save,
      message: '当前季节蜡烛余额为 0，无需结算转化',
    };
  }

  const nextSave: PersistentSaveData = {
    ...save,
    candles: save.candles + convertedCount,
    seasonCandles: 0,
  };

  return {
    convertedCount,
    nextSave,
    message: `🕯️ 季末结余转化完成：${convertedCount} 根季节蜡烛已按 1:1 比例全额转化为 +${convertedCount} 根白蜡烛（当前白蜡烛 ${nextSave.candles}）！`,
  };
}

/**
 * Stage 9 Pure Function: Executes Black Shard (+200 Wax / +2 White Candles) or
 * Red Shard (+4 Ascended Red Candles) Eruption purification settlement.
 */
export function completeShardPurificationEventPure(
  save: PersistentSaveData,
  shardType: 'black' | 'red'
): {
  nextSave: PersistentSaveData;
  rewardType: 'candles' | 'ascendedCandles';
  rewardAmount: number;
  message: string;
} {
  if (shardType === 'black') {
    const forgeRes = forgeCandlesFromWaxPure(save, 200);
    const gained = Math.max(2, forgeRes.forgedCount);
    const nextSave: PersistentSaveData = {
      ...forgeRes.nextSave,
      candles:
        forgeRes.forgedCount > 0 ? forgeRes.nextSave.candles : save.candles + 2,
    };
    return {
      nextSave,
      rewardType: 'candles',
      rewardAmount: gained,
      message: `☄️ 黑石碎片余烬净化完成！吸收 200 滴纯净烛火并凝结 +${gained} 根白蜡烛！`,
    };
  }

  const nextSave: PersistentSaveData = {
    ...save,
    ascendedCandles: save.ascendedCandles + 4,
  };
  return {
    nextSave,
    rewardType: 'ascendedCandles',
    rewardAmount: 4,
    message:
      '🔥 伊甸红石碎片喷发挑战完成！净化暗黑红石晶簇并唤醒远古破晓记忆，获赐 +4 根升华红蜡烛！',
  };
}

// ============================================================================
// Stage 10: Photo Studio Album, Home Workshop Furniture & Child Guardian Mode
// ============================================================================

/**
 * Stage 10 Pure Function: Records a captured photo snapshot in the persistent album
 * (capped at photoStudio.maxSavedPhotos, sanitizing captions).
 */
export function recordPhotoSnapshotPure(
  save: PersistentSaveData,
  input: {
    realmName: string;
    filter: string;
    fov: number;
    rollDeg?: number;
    dofMode?: 'off' | 'soft' | 'cinematic';
    selfieMode: boolean;
    emoteId?: string | null;
    caption?: string;
    timestampStr?: string;
  }
): {
  nextSave: PersistentSaveData;
  photoEntry: SavedPhotoRecord;
  message: string;
} {
  const cfg = (GAME_CONFIG as any).photoStudio || {};
  const maxPhotos = Number(cfg.maxSavedPhotos) || 12;
  const clampedFov = Math.max(
    Number(cfg.fovMin) || 28,
    Math.min(Number(cfg.fovMax) || 85, Math.round(input.fov))
  );
  const maxRoll = Number(cfg.maxRollDeg) || 25;
  const clampedRoll = Math.max(
    -maxRoll,
    Math.min(maxRoll, Math.round(input.rollDeg || 0))
  );
  const rawCaption = (input.caption || '').trim();
  const safeCaption = save.childSafeMode
    ? '云海微光留影 · 愿温暖与星光常伴'
    : filterSensitiveChat(rawCaption || `${input.realmName} · 云海留影`);

  const photoEntry: SavedPhotoRecord = {
    id: `photo_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    realmName: input.realmName,
    filter: input.filter,
    fov: clampedFov,
    rollDeg: clampedRoll,
    dofMode: input.dofMode || 'off',
    selfieMode: input.selfieMode,
    emoteId: input.emoteId ?? null,
    caption: safeCaption,
    createdAt: input.timestampStr || getTodayUtcDateString(),
  };

  const existing = save.savedPhotos || [];
  const nextPhotos = [photoEntry, ...existing].slice(0, maxPhotos);

  const nextSave: PersistentSaveData = {
    ...save,
    savedPhotos: nextPhotos,
  };

  return {
    nextSave,
    photoEntry,
    message: `📸 纪念相片已收入云海相册并导出高清 PNG（${photoEntry.realmName} · ${
      photoEntry.selfieMode ? '自拍特写' : '远景环绕'
    } · 焦距 ${photoEntry.fov}mm）！`,
  };
}

/**
 * Stage 10 Pure Function: Crafts (if not yet in inventory) and places a Home Workshop furniture item.
 */
export function craftAndPlaceHomeFurniturePure(
  save: PersistentSaveData,
  furnitureId: string,
  coords: { x: number; y: number; z: number; rotY: number },
  instanceIdOverride?: string
): {
  success: boolean;
  craftedNew: boolean;
  placedItem: PlacedFurniture | null;
  nextSave: PersistentSaveData;
  message: string;
} {
  const furnCfg = GAME_CONFIG.homeFurnitureCatalog.find(
    (f) => f.id === furnitureId
  );
  if (!furnCfg) {
    return {
      success: false,
      craftedNew: false,
      placedItem: null,
      nextSave: save,
      message: '未找到该小屋家具图纸',
    };
  }

  if (save.homeFurniturePlacements.length >= 16) {
    return {
      success: false,
      craftedNew: false,
      placedItem: null,
      nextSave: save,
      message: '共享空间摆放已达上限 (16 件)，请先移除或收纳部分家具',
    };
  }

  const owned = save.homeFurnitureInventory.includes(furnitureId);
  if (!owned && save.candles < furnCfg.costCandles) {
    return {
      success: false,
      craftedNew: false,
      placedItem: null,
      nextSave: save,
      message: `白蜡烛不足 ${furnCfg.costCandles} 根（当前 ${save.candles} 根），无法制作「${furnCfg.name}」`,
    };
  }

  const placedItem: PlacedFurniture = {
    instanceId:
      instanceIdOverride ||
      `furn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    furnitureId,
    x: Number(coords.x.toFixed(2)),
    y: Number(coords.y.toFixed(2)),
    z: Number(coords.z.toFixed(2)),
    rotY: Number(coords.rotY.toFixed(2)),
  };

  const nextSave: PersistentSaveData = {
    ...save,
    candles: owned ? save.candles : save.candles - furnCfg.costCandles,
    homeFurnitureInventory: owned
      ? save.homeFurnitureInventory
      : [...save.homeFurnitureInventory, furnitureId],
    homeFurniturePlacements: [...save.homeFurniturePlacements, placedItem],
  };

  return {
    success: true,
    craftedNew: !owned,
    placedItem,
    nextSave,
    message: owned
      ? `🏡 已在共享空间摆放「${furnCfg.name}」(${placedItem.x}, ${placedItem.z})！`
      : `🛠️ 已消耗 ${furnCfg.costCandles} 根白蜡烛制作并摆放「${furnCfg.name}」！`,
  };
}

/**
 * Stage 10 Pure Function: Rotates a placed furniture item by +45° (PI/4) or removes it back to inventory.
 */
export function rotateOrRemoveHomeFurniturePure(
  save: PersistentSaveData,
  instanceId: string,
  action: 'rotate' | 'remove'
): {
  success: boolean;
  nextSave: PersistentSaveData;
  message: string;
} {
  const target = save.homeFurniturePlacements.find(
    (p) => p.instanceId === instanceId
  );
  if (!target) {
    return {
      success: false,
      nextSave: save,
      message: '未找到该已摆放家具实例',
    };
  }

  const furnCfg = GAME_CONFIG.homeFurnitureCatalog.find(
    (f) => f.id === target.furnitureId
  );
  const furnName = furnCfg?.name || target.furnitureId;

  if (action === 'remove') {
    const nextPlacements = save.homeFurniturePlacements.filter(
      (p) => p.instanceId !== instanceId
    );
    return {
      success: true,
      nextSave: {
        ...save,
        homeFurniturePlacements: nextPlacements,
      },
      message: `📦 已将「${furnName}」收回小屋背包`,
    };
  }

  // action === 'rotate'
  const nextRot = Number(
    ((target.rotY + Math.PI / 4) % (Math.PI * 2)).toFixed(2)
  );
  const nextPlacements = save.homeFurniturePlacements.map((p) =>
    p.instanceId === instanceId ? { ...p, rotY: nextRot } : p
  );

  return {
    success: true,
    nextSave: {
      ...save,
      homeFurniturePlacements: nextPlacements,
    },
    message: `↻ 已将「${furnName}」顺时针旋转 45°`,
  };
}

/**
 * Stage 10 Pure Function: Applies a one-click curated Shared Space preset layout
 * (`preset_sakura_teahouse` or `preset_starlight_camp`).
 */
export function applyPresetHomeLayoutPure(
  save: PersistentSaveData,
  presetId: string,
  groundYFn: (x: number, z: number) => number = () => 1.2
): {
  success: boolean;
  nextSave: PersistentSaveData;
  message: string;
} {
  const presets =
    ((GAME_CONFIG as any).homePresetLayouts as {
      id: string;
      name: string;
      description: string;
      placements: { furnitureId: string; x: number; z: number; rotY: number }[];
    }[]) || [];
  const preset = presets.find((p) => p.id === presetId) || presets[0];
  if (!preset) {
    return {
      success: false,
      nextSave: save,
      message: '未找到预设共享空间方案',
    };
  }

  const nextInventory = new Set(save.homeFurnitureInventory);
  const nextPlacements: PlacedFurniture[] = preset.placements.map((item, idx) => {
    nextInventory.add(item.furnitureId);
    return {
      instanceId: `preset_${preset.id}_${idx + 1}`,
      furnitureId: item.furnitureId,
      x: item.x,
      y: Number(groundYFn(item.x, item.z).toFixed(2)),
      z: item.z,
      rotY: item.rotY,
    };
  });

  const nextSave: PersistentSaveData = {
    ...save,
    homeFurnitureInventory: Array.from(nextInventory),
    homeFurniturePlacements: nextPlacements,
  };

  return {
    success: true,
    nextSave,
    message: `✨ 已一键应用共享空间主题布景：「${preset.name}」（共摆放 ${nextPlacements.length} 件 3D 家具）！`,
  };
}

/**
 * Stage 10 Pure Function: Toggles Child Guardian Mode (`childSafeMode`),
 * restricting free-text chat & custom strings while keeping safe emotes & calls active.
 */
export function toggleChildSafeModePure(
  save: PersistentSaveData,
  explicitState?: boolean
): {
  nextSave: PersistentSaveData;
  childSafeMode: boolean;
  message: string;
} {
  const nextMode =
    explicitState !== undefined ? explicitState : !save.childSafeMode;
  const nextSave: PersistentSaveData = {
    ...save,
    childSafeMode: nextMode,
  };

  return {
    nextSave,
    childSafeMode: nextMode,
    message: nextMode
      ? '🛡️ 已开启未成年人/儿童守护模式：自由文字聊天已锁定，仅保留安全的先祖动作、星音呼唤与预设祝福语交流'
      : '🔓 已关闭儿童守护模式：好友星盘文字聊天与长椅交谈已恢复开放',
  };
}

// ============================================================================
// Stage 11: Performance Quality Tiering, Accessibility, Bilingual i18n & Tutorial
// ============================================================================

export type QualityTierOption = 'auto' | 'low' | 'medium' | 'high';

/**
 * Stage 11 Pure Function: Resolves graphics quality settings from user tier or adaptive FPS / Software-GL telemetry.
 */
export function computeQualityTierSettingsPure(
  requestedTier: QualityTierOption,
  measuredFps = 60,
  isSoftwareGl = false
): {
  resolvedTier: 'low' | 'medium' | 'high';
  pixelRatioCap: number;
  shadowMapEnabled: boolean;
  particleScale: number;
  cloudInstanceRatio: number;
  label: string;
} {
  let resolvedTier: 'low' | 'medium' | 'high' = 'high';
  if (requestedTier === 'auto') {
    if (isSoftwareGl || measuredFps < 30) {
      resolvedTier = 'low';
    } else if (measuredFps < 48) {
      resolvedTier = 'medium';
    } else {
      resolvedTier = 'high';
    }
  } else {
    resolvedTier = requestedTier;
  }

  const tiers = ((GAME_CONFIG as any).stage11Polish?.performanceTiers || {}) as Record<
    string,
    {
      label: string;
      pixelRatioCap: number;
      shadowMapEnabled: boolean;
      particleScale: number;
      cloudInstanceRatio: number;
    }
  >;
  const spec = tiers[resolvedTier] || {
    label: resolvedTier,
    pixelRatioCap: resolvedTier === 'low' ? 1.0 : resolvedTier === 'medium' ? 1.25 : 1.5,
    shadowMapEnabled: resolvedTier !== 'low',
    particleScale: resolvedTier === 'low' ? 0.45 : resolvedTier === 'medium' ? 0.75 : 1.0,
    cloudInstanceRatio: resolvedTier === 'low' ? 0.55 : resolvedTier === 'medium' ? 0.8 : 1.0,
  };

  return {
    resolvedTier,
    pixelRatioCap: spec.pixelRatioCap,
    shadowMapEnabled: spec.shadowMapEnabled,
    particleScale: spec.particleScale,
    cloudInstanceRatio: spec.cloudInstanceRatio,
    label:
      requestedTier === 'auto'
        ? `智能自适应 (${spec.label})`
        : spec.label,
  };
}

/**
 * Stage 11 Pure Function: Updates quality tier, high-contrast accessibility, reduced shake, and bilingual locale.
 */
export function updateAccessibilityAndPerfPure(
  save: PersistentSaveData,
  patch: {
    qualityTier?: QualityTierOption;
    highContrastMode?: boolean;
    reducedMotionShake?: boolean;
    locale?: 'zh' | 'en';
  }
): {
  nextSave: PersistentSaveData;
  message: string;
} {
  const nextSave: PersistentSaveData = {
    ...save,
    qualityTier: patch.qualityTier ?? save.qualityTier ?? 'auto',
    highContrastMode:
      patch.highContrastMode !== undefined
        ? patch.highContrastMode
        : Boolean(save.highContrastMode),
    reducedMotionShake:
      patch.reducedMotionShake !== undefined
        ? patch.reducedMotionShake
        : Boolean(save.reducedMotionShake),
    locale: patch.locale ?? save.locale ?? 'zh',
  };

  const parts: string[] = [];
  if (patch.qualityTier !== undefined) {
    const q = computeQualityTierSettingsPure(patch.qualityTier);
    parts.push(`画质档位：${q.label}`);
  }
  if (patch.highContrastMode !== undefined) {
    parts.push(
      `高对比色觉辅助：${patch.highContrastMode ? '已开启' : '已关闭'}`
    );
  }
  if (patch.reducedMotionShake !== undefined) {
    parts.push(
      `防眩晕镜头减震：${patch.reducedMotionShake ? '已开启' : '已关闭'}`
    );
  }
  if (patch.locale !== undefined) {
    parts.push(
      patch.locale === 'en'
        ? 'Language switched to English (EN)'
        : '界面语言已切换为简体中文 (ZH)'
    );
  }

  return {
    nextSave,
    message: `⚙️ 系统设置已更新 · ${parts.join(' | ')}`,
  };
}

/**
 * Stage 11 Pure Function: Advances the 3-step interactive onboarding tutorial
 * (0: move -> 1: ignite -> 2: fly -> 3: completed with +2 White Candles reward).
 */
export function advanceOnboardingTutorialPure(
  save: PersistentSaveData,
  action: 'move' | 'ignite' | 'fly' | 'complete_all' | 'reset'
): {
  advanced: boolean;
  justCompletedAll: boolean;
  rewardCandles: number;
  nextSave: PersistentSaveData;
  message: string;
} {
  if (action === 'reset') {
    return {
      advanced: true,
      justCompletedAll: false,
      rewardCandles: 0,
      nextSave: {
        ...save,
        tutorialStep: 0,
      },
      message: '🔄 已重置新手旅途引导至第 1 步（漫步微光之境）',
    };
  }

  if (save.tutorialStep >= 3) {
    return {
      advanced: false,
      justCompletedAll: false,
      rewardCandles: 0,
      nextSave: save,
      message: '新手引导已全部完成',
    };
  }

  const rewardCfg =
    Number((GAME_CONFIG as any).stage11Polish?.onboardingTutorial?.completionRewardCandles) || 2;

  if (action === 'complete_all') {
    return {
      advanced: true,
      justCompletedAll: true,
      rewardCandles: rewardCfg,
      nextSave: {
        ...save,
        tutorialStep: 3,
        candles: save.candles + rewardCfg,
      },
      message: `🎉 新手旅途 3 步引导圆满完成！已赠予启航贺礼 +${rewardCfg} 根白蜡烛！`,
    };
  }

  const expectedAction =
    save.tutorialStep === 0
      ? 'move'
      : save.tutorialStep === 1
        ? 'ignite'
        : 'fly';

  if (action !== expectedAction) {
    return {
      advanced: false,
      justCompletedAll: false,
      rewardCandles: 0,
      nextSave: save,
      message: '',
    };
  }

  const nextStep = save.tutorialStep + 1;
  const justCompletedAll = nextStep >= 3;
  const reward = justCompletedAll ? rewardCfg : 0;

  const nextSave: PersistentSaveData = {
    ...save,
    tutorialStep: nextStep,
    candles: save.candles + reward,
  };

  const stepMessages: Record<number, string> = {
    1: '✨ 新手引导 [1/3] 漫步完成！下一步：按 [E] 点亮烛火或按 [Q] 发出星音呼唤',
    2: '✨ 新手引导 [2/3] 点亮共鸣完成！下一步：按 [Space] 振翅飞翔冲上云海',
    3: `🎉 新手旅途 3 步引导全部完成！获得启航奖励 +${reward} 根白蜡烛！`,
  };

  return {
    advanced: true,
    justCompletedAll,
    rewardCandles: reward,
    nextSave,
    message: stepMessages[nextStep] || '新手引导已推进',
  };
}

/**
 * Stage 11 Pure Function: Bilingual dictionary lookup (`zh` / `en`).
 */
export function translateUiPure(locale: 'zh' | 'en', key: string): string {
  const dict = ((GAME_CONFIG as any).stage11Polish?.i18n?.[locale] ||
    (GAME_CONFIG as any).stage11Polish?.i18n?.zh ||
    {}) as Record<string, string>;
  return dict[key] || key;
}

// ============================================================================
// Stage 12: V2.0 World Expansion — 4 Outer Sanctuaries & 6 Sky Tribute Easter Eggs
// ============================================================================

export interface EasterEggConfigItem {
  id: string;
  name: string;
  subtitle: string;
  loreText: string;
  x: number;
  z: number;
  radius: number;
  waxReward: number;
  candlesBonus: number;
  heartsBonus: number;
  ascendedCandlesBonus: number;
  wingedLightBonus: number;
  launchVy: number;
}

/**
 * Stage 12 Pure Function: Discovers and records a Sky Tribute Easter Egg (`eggId`),
 * granting first-time discovery rewards (Candles, Hearts, Ascended Candles, Winged Light, Wax)
 * and updating `discoveredEasterEggIds`.
 */
export function discoverEasterEggPure(
  save: PersistentSaveData,
  eggId: string
): {
  newlyDiscovered: boolean;
  eggConfig: EasterEggConfigItem | null;
  nextSave: PersistentSaveData;
  message: string;
} {
  const eggs = (((GAME_CONFIG as any).stage12Expansion?.easterEggs || []) as EasterEggConfigItem[]);
  const eggConfig = eggs.find((e) => e.id === eggId) || null;
  if (!eggConfig) {
    return {
      newlyDiscovered: false,
      eggConfig: null,
      nextSave: save,
      message: '未找到该秘境彩蛋记录',
    };
  }

  const discovered = save.discoveredEasterEggIds || [];
  if (discovered.includes(eggId)) {
    return {
      newlyDiscovered: false,
      eggConfig,
      nextSave: save,
      message: `✨ 再次触发「${eggConfig.name}」· ${eggConfig.loreText}`,
    };
  }

  const forgeRes = forgeCandlesFromWaxPure(save, eggConfig.waxReward || 50);
  const nextDiscovered = [...discovered, eggId];

  const nextSave: PersistentSaveData = {
    ...forgeRes.nextSave,
    candles: forgeRes.nextSave.candles + (eggConfig.candlesBonus || 0),
    hearts: forgeRes.nextSave.hearts + (eggConfig.heartsBonus || 0),
    ascendedCandles:
      forgeRes.nextSave.ascendedCandles + (eggConfig.ascendedCandlesBonus || 0),
    wingedLights:
      forgeRes.nextSave.wingedLights + (eggConfig.wingedLightBonus || 0),
    discoveredEasterEggIds: nextDiscovered,
  };

  const rewardParts: string[] = [];
  if (eggConfig.wingedLightBonus > 0) {
    rewardParts.push(`+${eggConfig.wingedLightBonus} 永久光之翼`);
  }
  if (eggConfig.candlesBonus > 0) {
    rewardParts.push(`+${eggConfig.candlesBonus} 白蜡烛`);
  }
  if (eggConfig.heartsBonus > 0) {
    rewardParts.push(`+${eggConfig.heartsBonus} 爱心`);
  }
  if (eggConfig.ascendedCandlesBonus > 0) {
    rewardParts.push(`+${eggConfig.ascendedCandlesBonus} 升华红蜡烛`);
  }
  if (eggConfig.waxReward > 0) {
    rewardParts.push(`+${eggConfig.waxReward} 滴烛火`);
  }

  return {
    newlyDiscovered: true,
    eggConfig,
    nextSave,
    message: `🎉 首次解锁隐藏彩蛋 (${nextDiscovered.length}/${eggs.length}) ${eggConfig.name}！获得 ${rewardParts.join('、')} · ${eggConfig.loreText}`,
  };
}

// ============================================================================
// Stage 14: Sunset Speedrun Time-Trial Medal & Personal Best Settlement
// ============================================================================

export type SunsetRaceMedal = 'gold' | 'silver' | 'bronze';

export function evaluateSunsetRaceMedalPure(elapsedMs: number): {
  medal: SunsetRaceMedal;
  medalLabel: string;
  candlesReward: number;
  heartsReward: number;
} {
  if (elapsedMs <= 45000) {
    return {
      medal: 'gold',
      medalLabel: '🥇 黄金飞翼奖章',
      candlesReward: 3,
      heartsReward: 1,
    };
  }
  if (elapsedMs <= 75000) {
    return {
      medal: 'silver',
      medalLabel: '🥈 白银流光奖章',
      candlesReward: 2,
      heartsReward: 0,
    };
  }
  return {
    medal: 'bronze',
    medalLabel: '🥉 青铜微光奖章',
    candlesReward: 1,
    heartsReward: 0,
  };
}

export function recordSunsetRaceCompletionPure(
  save: PersistentSaveData,
  elapsedMs: number
): {
  isNewRecord: boolean;
  medal: SunsetRaceMedal;
  medalLabel: string;
  candlesAwarded: number;
  heartsAwarded: number;
  nextSave: PersistentSaveData;
  message: string;
} {
  const clampedMs = Math.max(1500, Math.round(elapsedMs));
  const evalRes = evaluateSunsetRaceMedalPure(clampedMs);
  const prevBest = save.bestRaceTimeMs ?? null;
  const isNewRecord = prevBest === null || clampedMs < prevBest;
  const isFirstCompletion = (save.completedRaceCount || 0) === 0;

  const candlesAwarded = isFirstCompletion || isNewRecord ? evalRes.candlesReward : 1;
  const heartsAwarded = isFirstCompletion ? evalRes.heartsReward : 0;

  const medalRank: Record<SunsetRaceMedal, number> = {
    gold: 3,
    silver: 2,
    bronze: 1,
  };
  const nextBestMedal =
    !save.bestRaceMedal || medalRank[evalRes.medal] >= medalRank[save.bestRaceMedal]
      ? evalRes.medal
      : save.bestRaceMedal;

  const nextSave: PersistentSaveData = {
    ...save,
    candles: save.candles + candlesAwarded,
    hearts: save.hearts + heartsAwarded,
    bestRaceTimeMs: isNewRecord ? clampedMs : prevBest,
    bestRaceMedal: nextBestMedal,
    completedRaceCount: (save.completedRaceCount || 0) + 1,
  };

  const secStr = (clampedMs / 1000).toFixed(2);
  const rewardStr =
    heartsAwarded > 0
      ? `+${candlesAwarded} 白蜡烛 & +${heartsAwarded} 爱心`
      : `+${candlesAwarded} 白蜡烛`;

  return {
    isNewRecord,
    medal: evalRes.medal,
    medalLabel: evalRes.medalLabel,
    candlesAwarded,
    heartsAwarded,
    nextSave,
    message: `🏁 霞光环大陆竞速冲线！用时 ${secStr}s · 斩获「${evalRes.medalLabel}」${isNewRecord ? '（🌟 刷新个人最佳纪录！）' : ''}，获得 ${rewardStr}！`,
  };
}

/**
 * Stage 4: Asynchronous IndexedDB mirror helper for dual-layer single-player persistence.
 */
function writeToIndexedDb(data: PersistentSaveData): void {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  try {
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(data, IDB_KEY);
      tx.oncomplete = () => db.close();
    };
  } catch (err) {
    console.error('[StorageService:IndexedDB]', err);
  }
}

class StorageManager {
  public load(): PersistentSaveData {
    if (typeof window === 'undefined') {
      return buildDefaultSaveData();
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const fresh = buildDefaultSaveData();
        this.save(fresh);
        return fresh;
      }
      const parsed = JSON.parse(raw) as PersistentSaveData;
      const def = buildDefaultSaveData();
      const merged: PersistentSaveData = {
        ...def,
        ...parsed,
        friends: {
          ...def.friends,
          ...(parsed.friends || {}),
        },
        blockedPeerIds: parsed.blockedPeerIds || [],
        reportedPeers: parsed.reportedPeers || [],
        unlockedConstellationNodes: Array.from(
          new Set([
            ...def.unlockedConstellationNodes,
            ...(parsed.unlockedConstellationNodes || []),
          ])
        ),
        unlockedCosmeticIds: Array.from(
          new Set([
            ...def.unlockedCosmeticIds,
            ...(parsed.unlockedCosmeticIds || []),
          ])
        ),
      };
      const { save: afterReset, didReset } = checkAndApplyDailyReset(merged);
      if (didReset) {
        this.save(afterReset);
      }
      return afterReset;
    } catch (err) {
      console.error('[StorageService]', err);
      return buildDefaultSaveData();
    }
  }

  public save(data: PersistentSaveData): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      writeToIndexedDb(data);
      gameEventBus.emit('save:updated', { timestamp: Date.now() });
      // Also sync asynchronously to backend SQLite/JSON archive if server is running
      fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {
        // Offline single-player fallback is expected when running standalone
      });
    } catch (err) {
      console.error('[StorageService]', err);
    }
  }

  public exportSaveJson(data?: PersistentSaveData): string {
    const target = data || this.load();
    return JSON.stringify(target, null, 2);
  }

  public importSaveJson(rawJson: string): {
    save: PersistentSaveData | null;
    success: boolean;
    message: string;
  } {
    try {
      const parsed = JSON.parse(rawJson) as Partial<PersistentSaveData>;
      if (!parsed || typeof parsed !== 'object' || typeof parsed.candles !== 'number') {
        return {
          save: null,
          success: false,
          message: '存档格式校验失败：缺少核心货币或角色字段',
        };
      }
      const merged: PersistentSaveData = {
        ...buildDefaultSaveData(),
        ...parsed,
      };
      this.save(merged);
      return {
        save: merged,
        success: true,
        message: `存档导入成功！欢迎回来，${merged.playerName}（白蜡烛 ${merged.candles} / 爱心 ${merged.hearts}）`,
      };
    } catch (err) {
      console.error('[StorageService:importSaveJson]', err);
      return {
        save: null,
        success: false,
        message: '存档 JSON 解析失败，请检查 JSON 格式是否正确',
      };
    }
  }

  public resetToDefault(): PersistentSaveData {
    const fresh = buildDefaultSaveData();
    this.save(fresh);
    return fresh;
  }
}

export const storageService = new StorageManager();
