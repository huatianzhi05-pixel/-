import { EquippedLoadout, getCosmeticById } from './cosmetics';
import gameConfigRaw from '../config/gameConfig.json';

export const LOCOMOTION_CFG = gameConfigRaw.locomotion;
export const ENERGY_CFG = gameConfigRaw.energy;
export const PRAIRIE_CFG = gameConfigRaw.prairieZone;
export const EXPRESSION_CFG = (gameConfigRaw as any).expression;
export const NETWORK_CFG = (gameConfigRaw as any).network;
export const REALMS_STAGE8_CFG = (gameConfigRaw as any).realmsStage8;
export const STAGE12_CFG = (gameConfigRaw as any).stage12Expansion;

export type DayNightPhase = 'morning' | 'noon' | 'sunset' | 'starry_night';
export const DAY_NIGHT_PHASES: DayNightPhase[] = [
  'morning',
  'noon',
  'sunset',
  'starry_night',
];

export interface DayNightAtmosphere {
  id: DayNightPhase;
  label: string;
  skyTopColor: string;
  skyHorizonColor: string;
  fogColor: string;
  fogDensity: number;
  sunColor: string;
  sunIntensity: number;
  hemiSkyColor: string;
  hemiGroundColor: string;
  cloudColor: string;
  musicTempoMultiplier: number;
}

export function getDayNightAtmosphere(phase: DayNightPhase): DayNightAtmosphere {
  return PRAIRIE_CFG.dayNightCycle[phase] as DayNightAtmosphere;
}

export type RealmId =
  | 'home'
  | 'isle'
  | 'prairie'
  | 'forest'
  | 'valley'
  | 'wasteland'
  | 'vault'
  | 'eden';

export type WeatherHazardType =
  | 'clear'
  | 'wind_updraft'
  | 'rain'
  | 'ice'
  | 'krill_patrol'
  | 'starlight_gravity'
  | 'eden_storm';

export interface RealmConfig {
  id: RealmId;
  name: string;
  subtitle: string;
  subZones: string[];
  weather: WeatherHazardType;
  skyTopColor: string;
  skyHorizonColor: string;
  fogColor: string;
  fogDensity: number;
  sunColor: string;
  sunIntensity: number;
  hemiSkyColor: string;
  hemiGroundColor: string;
  groundPrimaryColor: string;
  groundSecondaryColor: string;
  waterColor: string;
  cloudColor: string;
  ambientNoteBase: number;
}

export const REALMS: Record<RealmId, RealmConfig> = {
  home: {
    id: 'home',
    name: '遇境 · 星盘群岛',
    subtitle: 'Home & Aviary Camp · 个人小屋、公共篝火与八大星门枢纽',
    subZones: ['中央星盘神龛', '个人微光小屋', '云巢篝火营地', '回归先祖栈桥'],
    weather: 'clear',
    skyTopColor: '#1E295B',
    skyHorizonColor: '#F59E0B',
    fogColor: '#F4A261',
    fogDensity: 0.0065,
    sunColor: '#FDE68A',
    sunIntensity: 2.2,
    hemiSkyColor: '#93C5FD',
    hemiGroundColor: '#D97706',
    groundPrimaryColor: '#3B4D54',
    groundSecondaryColor: '#D97706',
    waterColor: '#2A4365',
    cloudColor: '#FDE68A',
    ambientNoteBase: 261.63, // C4
  },
  isle: {
    id: 'isle',
    name: '晨岛 · 初生沙洲',
    subtitle: 'Isle of Dawn · 破晓沙丘、飞翔试炼风洞与预言山谷四试炼',
    subZones: ['初生星火沙洲', '乘风起跳高台', '预言四元素洞窟', '晨曦云端神殿'],
    weather: 'wind_updraft',
    skyTopColor: '#312E81',
    skyHorizonColor: '#FDBA74',
    fogColor: '#FED7AA',
    fogDensity: 0.0058,
    sunColor: '#FEF3C7',
    sunIntensity: 2.1,
    hemiSkyColor: '#FDE68A',
    hemiGroundColor: '#D97706',
    groundPrimaryColor: '#EAB308',
    groundSecondaryColor: '#CA8A04',
    waterColor: '#38BDF8',
    cloudColor: '#FFFBEB',
    ambientNoteBase: 277.18, // C#4
  },
  prairie: {
    id: 'prairie',
    name: '云野 · 圣岛浮屿',
    subtitle: 'Daylight Prairie · 蝴蝶平原、幽光洞窟与三塔钟楼村落',
    subZones: PRAIRIE_CFG.subZones.map((z) => z.name),
    weather: 'wind_updraft',
    skyTopColor: '#0284C7',
    skyHorizonColor: '#BAE6FD',
    fogColor: '#E0F2FE',
    fogDensity: 0.0055,
    sunColor: '#FFFBEB',
    sunIntensity: 2.4,
    hemiSkyColor: '#7DD3FC',
    hemiGroundColor: '#4ADE80',
    groundPrimaryColor: '#34D399',
    groundSecondaryColor: '#10B981',
    waterColor: '#38BDF8',
    cloudColor: '#FFFFFF',
    ambientNoteBase: 293.66, // D4
  },
  forest: {
    id: 'forest',
    name: '雨林 · 荧光秘境',
    subtitle: 'Hidden Forest · 细雨消融光能，靠近灯柱/蘑菇亭或与旅人牵手可护火',
    subZones: ['静谧林间庭院', '荧光溪流与秘密树屋', '巨兽骸骨空地', '雨林水母神庙'],
    weather: 'rain',
    skyTopColor: '#0F172A',
    skyHorizonColor: '#1E3A5F',
    fogColor: '#164E63',
    fogDensity: 0.0085,
    sunColor: '#67E8F9',
    sunIntensity: 1.6,
    hemiSkyColor: '#22D3EE',
    hemiGroundColor: '#064E3B',
    groundPrimaryColor: '#0F766E',
    groundSecondaryColor: '#115E59',
    waterColor: '#0891B2',
    cloudColor: '#A5F3FC',
    ambientNoteBase: 329.63, // E4
  },
  valley: {
    id: 'valley',
    name: '霞谷 · 落日千鸟城',
    subtitle: 'Valley of Triumph · 滑冰场极速漂移、飞行赛道、隐士雪峰与落日竞技场',
    subZones: ['寒霜溜冰场', '霞光飞行赛道', '云端隐士谷', '落日千鸟竞技场'],
    weather: 'ice',
    skyTopColor: '#4C1D95',
    skyHorizonColor: '#FB7185',
    fogColor: '#FDA4AF',
    fogDensity: 0.006,
    sunColor: '#FDE047',
    sunIntensity: 2.5,
    hemiSkyColor: '#F472B6',
    hemiGroundColor: '#E0F2FE',
    groundPrimaryColor: '#E0F2FE',
    groundSecondaryColor: '#F43F5E',
    waterColor: '#7DD3FC',
    cloudColor: '#FECDD3',
    ambientNoteBase: 349.23, // F4
  },
  wasteland: {
    id: 'wasteland',
    name: '暮土 · 远古遗迹',
    subtitle: 'Golden Wasteland · 冥龙探照巡逻、暗黑植物与遗忘方舟，掩体躲避红光',
    subZones: ['破碎边陲荒漠', '巨兽荒原墓地', '遗忘魔法方舟', '远古守卫战场'],
    weather: 'krill_patrol',
    skyTopColor: '#062C22',
    skyHorizonColor: '#10B981',
    fogColor: '#047857',
    fogDensity: 0.008,
    sunColor: '#6EE7B7',
    sunIntensity: 1.7,
    hemiSkyColor: '#34D399',
    hemiGroundColor: '#1F2937',
    groundPrimaryColor: '#1E293B',
    groundSecondaryColor: '#065F46',
    waterColor: '#064E3B',
    cloudColor: '#6EE7B7',
    ambientNoteBase: 392.0, // G4
  },
  vault: {
    id: 'vault',
    name: '禁阁 · 星河浮台',
    subtitle: 'Vault of Knowledge · 星光沙漠、四人合力机关门、漂浮书库与星辰塔顶',
    subZones: ['星光沙漠花园', '双人共鸣机关门', '四层悬浮星光书库', '浩瀚星河塔顶'],
    weather: 'starlight_gravity',
    skyTopColor: '#090A1A',
    skyHorizonColor: '#312E81',
    fogColor: '#1E1B4B',
    fogDensity: 0.0065,
    sunColor: '#C4B5FD',
    sunIntensity: 1.9,
    hemiSkyColor: '#818CF8',
    hemiGroundColor: '#1E1B4B',
    groundPrimaryColor: '#312E81',
    groundSecondaryColor: '#4338CA',
    waterColor: '#1E1B4B',
    cloudColor: '#C7D2FE',
    ambientNoteBase: 440.0, // A4
  },
  eden: {
    id: 'eden',
    name: '伊甸之眼 · 暴风祭坛',
    subtitle: 'Eye of Eden · 逆风躲避红石坠落与雷霆，点亮先祖石像完成重生升华仪式',
    subZones: ['暴风眼石门', '红石飞星坡道', '雷霆掩体长廊', '星河重生祭坛'],
    weather: 'eden_storm',
    skyTopColor: '#180409',
    skyHorizonColor: '#881337',
    fogColor: '#4C0519',
    fogDensity: 0.0095,
    sunColor: '#FB7185',
    sunIntensity: 1.8,
    hemiSkyColor: '#F43F5E',
    hemiGroundColor: '#1F2937',
    groundPrimaryColor: '#27272A',
    groundSecondaryColor: '#9F1239',
    waterColor: '#4C0519',
    cloudColor: '#FDA4AF',
    ambientNoteBase: 493.88, // B4
  },
};

export function getSubZoneNameAt(realmId: RealmId, x: number, z: number): string {
  // Stage 12: Check 4 Outer Sanctuaries first across the expanded 135m world
  const outerSanctuaries = (STAGE12_CFG?.outerSanctuaries || []) as {
    id: string;
    name: string;
    x: number;
    z: number;
    radius: number;
  }[];
  for (const s of outerSanctuaries) {
    if (Math.hypot(x - s.x, z - s.z) <= (s.radius || 14.0)) {
      return s.name;
    }
  }
  for (const hub of CONTINENTAL_ARCHITECTURAL_HUBS) {
    if (Math.hypot(x - hub.x, z - hub.z) <= hub.outerRadius) {
      return hub.name;
    }
  }

  if (realmId === 'prairie') {
    // Stage 3 Data-driven 3 Prairie Sub-Zones:
    // 1) 幽光洞窟 (Echo Cavern on West side around x = -18.5, z = -16)
    if (x < -7.5 && z <= -6.0 && z >= -26.5) {
      return PRAIRIE_CFG.subZones[1].name; // 幽光洞窟
    }
    // 2) 三塔钟楼村落 (Three-Tower Bell Village & Northern Temple beyond z <= -16)
    if (z <= -16.0) {
      return PRAIRIE_CFG.subZones[2].name; // 三塔钟楼村落
    }
    // 3) 蝴蝶平原 (Butterfly Meadow starting area)
    return PRAIRIE_CFG.subZones[0].name; // 蝴蝶平原
  }
  const zones = REALMS[realmId].subZones;
  if (z > 0) return zones[0] || '起始星坛';
  if (z > -18) return zones[Math.min(1, zones.length - 1)];
  if (z > -36) return zones[Math.min(2, zones.length - 1)];
  return zones[zones.length - 1];
}

export type InteractableType =
  | 'candle_cluster'
  | 'light_bloom'
  | 'winged_light'
  | 'ancestor_spirit'
  | 'temple_altar'
  | 'realm_portal'
  | 'dark_plant'
  | 'chat_bench'
  | 'rain_shelter'
  | 'race_ring'
  | 'dark_crab'
  | 'coop_door'
  | 'starlight_elevator'
  | 'eden_statue'
  | 'easter_egg';

export interface WorldInteractable {
  id: string;
  type: InteractableType;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  activated: boolean;
  targetRealm?: RealmId;
  spiritId?: string;
  emoteUnlocked?: string;
  waxReward?: number;
  flipped?: boolean;
  loreText?: string;
  candlesBonus?: number;
  heartsBonus?: number;
  ascendedCandlesBonus?: number;
  wingedLightBonus?: number;
  launchVy?: number;
}

export interface EmoteAction {
  id: string;
  name: string;
  spiritName: string;
  realm: RealmId;
  level: number;
  description: string;
}

export const SKY_EMOTES: EmoteAction[] = [
  {
    id: 'emote_butterfly',
    name: '引蝶共鸣',
    spiritName: '云野引蝶先祖',
    realm: 'prairie',
    level: 4,
    description: '伸出指尖召唤金色光蝶环绕周身，持续恢复微光能量。',
  },
  {
    id: 'emote_spin_dance',
    name: '音韵旋转舞',
    spiritName: '音韵季向导先祖',
    realm: 'valley',
    level: 5,
    description: '轻盈跃起在空中完成双周芭蕾旋舞，洒满星芒光点。',
  },
  {
    id: 'emote_bow_respect',
    name: '抚胸鞠躬礼',
    spiritName: '霞谷鞠躬先祖',
    realm: 'valley',
    level: 4,
    description: '光之子旅人相遇时最温暖的相互致意礼仪。',
  },
  {
    id: 'emote_handstand',
    name: '单手倒立',
    spiritName: '霞谷倒立先祖',
    realm: 'valley',
    level: 4,
    description: '在祭坛边沿展现矫健平衡感，斗篷垂落发光。',
  },
  {
    id: 'emote_cheer_jump',
    name: '雀跃欢呼',
    spiritName: '云野欢呼先祖',
    realm: 'prairie',
    level: 4,
    description: '高举双手向天际跃起，绽放喜悦心形火光。',
  },
  {
    id: 'emote_pray_star',
    name: '星盘祈祷',
    spiritName: '禁阁祈祷圣徒',
    realm: 'vault',
    level: 4,
    description: '双膝微曲闭目凝神，脚下浮现旋转六芒星辰法阵。',
  },
  {
    id: 'emote_point',
    name: '指点远方',
    spiritName: '晨岛指路先祖',
    realm: 'isle',
    level: 4,
    description: '向远方云海神殿伸手引路，召唤星光轨迹指引同伴前行。',
  },
];

export interface CallWaveEffectResult {
  isDeepCall: boolean;
  waveRadius: number;
  durationSec: number;
  pitchMultiplier: number;
  energyRestored: number;
  nextWingEnergy: number;
  flipsDarkCrabs: boolean;
  crabFlipRadius: number;
  particleCount: number;
  ringColorHex: string;
}

/**
 * Stage 5 Pure Function: Computes Tap Call vs Charged Deep Call wave radius, energy resonance,
 * dark crab flip radius, and timbre color from gameConfig.json expression.calls.
 */
export function computeCallWaveEffect(
  holdDurationSec: number,
  callVoice: 'default' | 'manta' | 'jellyfish' | 'bell' = 'default',
  currentEnergy = 4.0,
  maxEffectiveEnergy = 7.0,
  pitchSlideOffset = 0
): CallWaveEffectResult {
  const callsCfg = EXPRESSION_CFG?.calls || {
    tapRadius: 8.5,
    deepChargeThresholdSec: 0.55,
    deepRadius: 22.0,
    tapEnergyRestoreWedges: 0.45,
    deepEnergyRestoreWedges: 1.5,
    crabFlipRadius: 18.0,
    voices: [],
  };

  const isDeepCall = holdDurationSec >= callsCfg.deepChargeThresholdSec;
  const waveRadius = isDeepCall ? callsCfg.deepRadius : callsCfg.tapRadius;
  const durationSec = isDeepCall
    ? Math.min(1.85, Math.max(1.15, holdDurationSec))
    : 0.75;
  const clampedPitchSlide = Math.max(-0.25, Math.min(0.35, pitchSlideOffset));
  const pitchMultiplier = Number((1.0 + clampedPitchSlide).toFixed(3));
  const energyRestored = isDeepCall
    ? callsCfg.deepEnergyRestoreWedges
    : callsCfg.tapEnergyRestoreWedges;
  const nextWingEnergy = Math.min(
    Math.max(1, maxEffectiveEnergy),
    currentEnergy + energyRestored
  );

  const voiceEntry = callsCfg.voices?.find((v: any) => v.id === callVoice);
  const ringColorHex = voiceEntry?.color || '#FEF08A';

  return {
    isDeepCall,
    waveRadius,
    durationSec,
    pitchMultiplier,
    energyRestored,
    nextWingEnergy,
    flipsDarkCrabs: isDeepCall,
    crabFlipRadius: isDeepCall ? callsCfg.crabFlipRadius : 0,
    particleCount: isDeepCall ? 38 : 16,
    ringColorHex,
  };
}

export interface EmoteLevelSpec {
  emoteId: string;
  level: number;
  label: string;
  motionScale: number;
  particleCount: number;
  durationSec: number;
  auraDescription: string;
}

/**
 * Stage 5 Pure Function: Resolves Lv.1–5 emote upgrade parameters (motion amplitude scale,
 * starlight particle burst count, duration, and visual aura description).
 */
export function computeEmoteLevelSpec(
  emoteId: string,
  levelRaw = 1
): EmoteLevelSpec {
  const clampedLevel = Math.max(1, Math.min(5, Math.round(levelRaw)));
  const levelsTable = EXPRESSION_CFG?.emoteLevels || [];
  const row = levelsTable.find((r: any) => r.level === clampedLevel) || {
    level: clampedLevel,
    label: `Lv.${clampedLevel}`,
    motionScale: Number((1.0 + (clampedLevel - 1) * 0.12).toFixed(2)),
    particleCount: 12 + (clampedLevel - 1) * 8,
    auraDescription: clampedLevel >= 4 ? '璀璨星芒粒子环绕' : '基础共鸣动作',
  };

  return {
    emoteId,
    level: clampedLevel,
    label: row.label,
    motionScale: row.motionScale,
    particleCount: row.particleCount,
    durationSec: Number((3.2 + (clampedLevel - 1) * 0.35).toFixed(2)),
    auraDescription: row.auraDescription,
  };
}

export type FlightMode = 'hover' | 'glide';

export type SitMode = 'none' | 'sit_ground' | 'meditate_shrine' | 'sit_bench';

export type LocomotionMode =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'slide'
  | 'wade'
  | 'sit_ground'
  | 'meditate_shrine'
  | 'sit_bench'
  | 'land_stiff'
  | 'fly'
  | 'dive';

export type EnergyChangeSource =
  | 'none'
  | 'shrine_light'
  | 'candle_light'
  | 'companion'
  | 'ground'
  | 'wind_cloud'
  | 'brazier_prop'
  | 'dark_water'
  | 'dark_rain'
  | 'eden_storm'
  | 'krill_strike';

export interface PlayerPhysicsState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  pitch: number;
  roll: number;
  grounded: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  flightMode: FlightMode;
  wingEnergy: number;
  maxWingWedges: number;
  tempLostWedges: number;
  flapCooldown: number;
  isRecharging: boolean;
  inShelter: boolean;
  inWindTunnel: boolean;
  krillAlertLevel: number; // 0 = safe, 0..1 = spotted red lock-on
  distanceFlown: number;
  // Stage 1 Ground Locomotion States
  locomotionMode: LocomotionMode;
  sitMode: SitMode;
  isInShallowWater: boolean;
  isSlidingSlope: boolean;
  slopeAngleDeg: number;
  landingStiffTimer: number;
  // Stage 2 Flight & Energy States
  isDiving: boolean;
  diveMomentum: number;
  isInDarkWater: boolean;
  nearCompanion: boolean;
  energyChangeSource: EnergyChangeSource;
  netEnergyRatePerSec: number;
}

export interface PlayerInputFrame {
  moveX: number; // -1 to 1 (A/D)
  moveZ: number; // -1 to 1 (W/S, where -1 is forward)
  jumpJustPressed: boolean;
  jumpHeld: boolean;
  toggleFlightModeJustPressed: boolean;
  toggleSitJustPressed?: boolean;
  diveHeld?: boolean;
  nearCompanion?: boolean;
  nearLitCandle?: boolean;
  sprintHeld: boolean;
  cameraYaw: number;
  realmId?: RealmId;
  elapsed?: number;
  activeSpellId?: SkySpellId | null;
}

export type SkySpellId =
  | 'spell_rainbow_trail'
  | 'spell_antigravity_feather'
  | 'spell_wind_speed'
  | 'spell_golden_aegis';

export interface SkyAlchemySpell {
  id: SkySpellId;
  name: string;
  icon: string;
  subtitle: string;
  durationSec: number;
  colorHex: string;
}

export const SKY_ALCHEMY_SPELLS: SkyAlchemySpell[] = [
  {
    id: 'spell_rainbow_trail',
    name: '七彩流光尾迹魔法',
    icon: '🌈',
    subtitle: '飞翔绽放七彩星芒尾迹 · 全场景翼能回复速度 +35% (180秒)',
    durationSec: 180,
    colorHex: '#F472B6',
  },
  {
    id: 'spell_antigravity_feather',
    name: '轻羽失重漂浮魔法',
    icon: '🪶',
    subtitle: '空中下坠重力降低 40% · 振翅升空推力 +30% (180秒)',
    durationSec: 180,
    colorHex: '#38BDF8',
  },
  {
    id: 'spell_wind_speed',
    name: '疾风冲刺滑翔魔法',
    icon: '⚡',
    subtitle: '地面奔跑与高空滑翔极速提升 +25% · 竞速破纪录利器 (180秒)',
    durationSec: 180,
    colorHex: '#FACC15',
  },
  {
    id: 'spell_golden_aegis',
    name: '璀璨金身满翼魔法',
    icon: '✨',
    subtitle: '临时赐予 +2 格额外翼能上限 · 免疫黑水与淋雨损耗 (180秒)',
    durationSec: 180,
    colorHex: '#FDE047',
  },
];

export interface SunsetRaceCheckpoint {
  index: number;
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  radius: number;
}

export const SUNSET_RACE_CHECKPOINTS: SunsetRaceCheckpoint[] = [
  {
    index: 0,
    id: 'cp_1_arcade_start',
    name: 'CP1 · 东境竞速拱廊起点',
    x: 36.0,
    y: 3.5,
    z: 8.0,
    radius: 8.5,
  },
  {
    index: 1,
    id: 'cp_2_twin_towers',
    name: 'CP2 · 霞光双子塔天桥',
    x: 58.0,
    y: 5.0,
    z: 8.0,
    radius: 9.0,
  },
  {
    index: 2,
    id: 'cp_3_windmill_observatory',
    name: 'CP3 · 东南星盘风车观星台',
    x: 34.0,
    y: 4.5,
    z: 26.0,
    radius: 9.5,
  },
  {
    index: 3,
    id: 'cp_4_sundial_finish',
    name: 'CP4 · 正南远古日晷终点',
    x: 0.0,
    y: 4.5,
    z: 62.0,
    radius: 10.5,
  },
];

export interface SunsetRaceTrialState {
  active: boolean;
  elapsedMs: number;
  currentCheckpointIndex: number; // 0..3
  completed: boolean;
}

export function createInitialSunsetRaceStatePure(): SunsetRaceTrialState {
  return {
    active: false,
    elapsedMs: 0,
    currentCheckpointIndex: 0,
    completed: false,
  };
}

export function stepSunsetRaceTrialPure(
  state: SunsetRaceTrialState,
  playerX: number,
  playerZ: number,
  dtMs: number
): {
  nextState: SunsetRaceTrialState;
  reachedCheckpoint: SunsetRaceCheckpoint | null;
  justCompletedRace: boolean;
} {
  if (!state.active || state.completed) {
    return {
      nextState: state,
      reachedCheckpoint: null,
      justCompletedRace: false,
    };
  }

  const nextElapsedMs = state.elapsedMs + Math.max(0, dtMs);
  const targetCp = SUNSET_RACE_CHECKPOINTS[state.currentCheckpointIndex];
  if (!targetCp) {
    return {
      nextState: { ...state, elapsedMs: nextElapsedMs, active: false, completed: true },
      reachedCheckpoint: null,
      justCompletedRace: true,
    };
  }

  const dist = Math.hypot(playerX - targetCp.x, playerZ - targetCp.z);
  if (dist <= targetCp.radius) {
    const nextIdx = state.currentCheckpointIndex + 1;
    const finished = nextIdx >= SUNSET_RACE_CHECKPOINTS.length;
    return {
      nextState: {
        active: !finished,
        elapsedMs: nextElapsedMs,
        currentCheckpointIndex: nextIdx,
        completed: finished,
      },
      reachedCheckpoint: targetCp,
      justCompletedRace: finished,
    };
  }

  return {
    nextState: {
      ...state,
      elapsedMs: nextElapsedMs,
    },
    reachedCheckpoint: null,
    justCompletedRace: false,
  };
}

export interface GameProgressState {
  candles: number;
  wax: number; // 0-99, 100 converts to +1 candle
  hearts: number;
  seasonCandles: number;
  ascendedCandles: number;
  wingedLights: number;
  awakenedSpirits: string[];
  litCandlesCount: number;
  currentRealm: RealmId;
  activeEmote: string | null;
  activeEmoteTimer: number;
  callWaveTimer: number;
  callWaveRadius: number;
  shardEventActive: boolean;
  shardEventType: 'black' | 'red' | null;
}

// Winged Light thresholds driven directly by gameConfig.json energy.wingedLightToWedgesTable
export const WING_WEDGE_THRESHOLDS: number[] = ENERGY_CFG.wingedLightToWedgesTable.map(
  (row) => row.requiredWingedLight
);

export function calculateWingWedges(wingedLights: number, loadout?: EquippedLoadout): number {
  let baseWedges = 1;
  for (let i = 0; i < WING_WEDGE_THRESHOLDS.length; i++) {
    if (wingedLights >= WING_WEDGE_THRESHOLDS[i]) {
      baseWedges = i + 1;
    }
  }
  const capeBonus = loadout ? getCosmeticById(loadout.cape).wingBonus || 0 : 0;
  return Math.min(ENERGY_CFG.maxWingWedgesCap, Math.max(1, baseWedges + capeBonus));
}

export function getNextWingThreshold(wingedLights: number): number {
  for (const t of WING_WEDGE_THRESHOLDS) {
    if (wingedLights < t) return t;
  }
  return WING_WEDGE_THRESHOLDS[WING_WEDGE_THRESHOLDS.length - 1];
}

// Pure procedural terrain height function shared between physics and 3D mesh builders
export function groundHeightAt(x: number, z: number): number {
  const distSq = x * x + z * z;
  const dist = Math.sqrt(distSq);

  // 1. Central Starlight Shrine Plaza (flat stepped circular altar flush with outerTier radius 6.8m)
  if (dist < 6.95) {
    return 1.2;
  }

  // 2. West Shallow Water Reflection Pool (centered at x = -15.5, z = 0.0, radius 4.2m)
  const distPool = Math.hypot(x - -15.5, z - 0.0);
  if (distPool < 4.2) {
    const poolT = distPool / 4.2;
    return 0.08 + poolT * poolT * 0.26;
  }

  // 2b. Stage 2 Dark Water Hazard Basin (centered at x = -15.5, z = -12.0, radius 3.6m)
  const distDarkPool = Math.hypot(x - -15.5, z - -12.0);
  if (distDarkPool < 3.6) {
    const dtPool = distDarkPool / 3.6;
    return 0.06 + dtPool * dtPool * 0.28;
  }

  // 3. East Steep Sand/Snow Slide Slope & High Jump Ledge (x in [12, 25], z in [-5.5, 5.5])
  if (x >= 12.0 && x <= 25.0 && Math.abs(z) <= 5.5) {
    const zBlend = Math.min(1, (5.5 - Math.abs(z)) / 1.2);
    const rampT = Math.min(1, Math.max(0, (x - 12.0) / 10.0));
    const rampHeight = 0.55 + rampT * 6.25; // Rises from 0.55m to 6.80m (~32 deg slope!)
    const baseMeadow = 0.55;
    return baseMeadow * (1 - zBlend) + rampHeight * zBlend;
  }

  if (dist < 11.0) {
    const t = (dist - 6.95) / 4.05;
    return 1.2 * (1 - t) + 0.35 * t;
  }

  // 4. Northern Elder Temple Sanctuary Plinth & Ramp (centered at x: 0, z: -50, flat radius 9.5m matching plinth1!)
  const dxTemple = x - 0;
  const dzTemple = z + 50;
  const distTemple = Math.sqrt(dxTemple * dxTemple + dzTemple * dzTemple);
  if (distTemple < 16.0) {
    if (distTemple <= 9.5) {
      return 4.6;
    }
    const rampT = Math.max(0, 1 - (distTemple - 9.5) / 6.5);
    const smoothT = rampT * rampT * (3 - 2 * rampT);
    return 0.65 + smoothT * 3.95;
  }

  // 4b. Stage 3 Sub-Zone 2: Echo Cavern Terrace (幽光洞窟高台 around x: -18.5, z: -16.0)
  const distCavern = Math.hypot(x - -18.5, z - -16.0);
  if (distCavern < 8.5) {
    const cavernT = Math.max(0, 1 - distCavern / 8.5);
    return 0.55 + cavernT * 0.95;
  }

  // 4c. Stage 3 Sub-Zone 3: Three-Tower Bell Village Island Terrace (三塔钟楼村落浮屿 around x: 16.5, z: -24.5)
  const distVillage = Math.hypot(x - 16.5, z - -24.5);
  if (distVillage < 10.5) {
    if (distVillage <= 2.9) {
      return 2.0;
    }
    const villageT = Math.max(0, 1 - (distVillage - 2.9) / 7.6);
    return 0.65 + villageT * 1.35;
  }

  // 4d. Stage 12 & 13 Outer Sanctuaries & High-Altitude Sky Islands (innerFlat = 0.70 * rSanc so stone plinths never clip)
  const outerSanctuaries = (STAGE12_CFG?.outerSanctuaries || []) as {
    id: string;
    x: number;
    y: number;
    z: number;
    radius: number;
  }[];
  for (const s of outerSanctuaries) {
    const dSanc = Math.hypot(x - s.x, z - s.z);
    const rSanc = s.radius || 14.0;
    if (dSanc < rSanc) {
      const innerFlat = rSanc * 0.70;
      if (dSanc <= innerFlat) {
        return s.y;
      }
      const blendT = 1 - (dSanc - innerFlat) / (rSanc - innerFlat);
      const smooth = blendT * blendT * (3 - 2 * blendT);
      return 0.8 + (s.y - 0.8) * smooth;
    }
  }

  // 4e. Stage 12 Oreo 8-Player Shrine Terrace (38, -18), TGC Office Portal (-36, -48) & B612 Desert Rose (-42, 26)
  const distOreo = Math.hypot(x - 38.0, z - -18.0);
  if (distOreo < 7.5) {
    const tOreo = Math.max(0, 1 - distOreo / 7.5);
    return 1.2 + tOreo * 1.6;
  }
  const distTgc = Math.hypot(x - -36.0, z - -48.0);
  if (distTgc < 7.5) {
    const tTgc = Math.max(0, 1 - distTgc / 7.5);
    return 1.2 + tTgc * 2.2;
  }
  const distRose = Math.hypot(x - -42.0, z - 26.0);
  if (distRose < 8.0) {
    const tRose = Math.max(0, 1 - distRose / 8.0);
    return 1.1 + tRose * 1.5;
  }
  const distArk = Math.hypot(x - -88.0, z - -82.0);
  if (distArk < 12.0) {
    const tArk = Math.max(0, 1 - distArk / 12.0);
    return 1.2 + tArk * 3.4;
  }
  const distTrial = Math.hypot(x - 78.0, z - -118.0);
  if (distTrial < 11.5) {
    const tTrial = Math.max(0, 1 - distTrial / 11.5);
    return 1.4 + tTrial * 5.0;
  }

  // 4f. 8 Continental Ground Architectural Villages, Pavilions, Ruins & Towers (filling the mid/outer continent)
  for (const hub of CONTINENTAL_ARCHITECTURAL_HUBS) {
    const dHub = Math.hypot(x - hub.x, z - hub.z);
    if (dHub < hub.outerRadius) {
      if (dHub <= hub.flatRadius) {
        return hub.y;
      }
      const blendT = 1 - (dHub - hub.flatRadius) / (hub.outerRadius - hub.flatRadius);
      const smooth = blendT * blendT * (3 - 2 * blendT);
      return 0.75 + (hub.y - 0.75) * smooth;
    }
  }

  // 5. Gentle rolling meadow hills & floating island ridges across the 220m expanded continent
  const wave1 = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 1.6;
  const wave2 = Math.sin((x + z) * 0.045) * 1.1;
  const edgeLift = dist > 52 ? Math.min(12.5, (dist - 52) * 0.12) : 0;

  return Math.max(-0.4, 0.35 + wave1 + wave2 + edgeLift);
}

/**
 * Pure check for whether a world coordinate `(x, z)` is inside the Shallow Water Wading Pool.
 */
export function isInShallowWaterAt(x: number, z: number): boolean {
  const distPool = Math.hypot(x - -15.5, z - 0.0);
  if (distPool < 3.95) return true;
  return groundHeightAt(x, z) < LOCOMOTION_CFG.shallowWaterSurfaceY - 0.04;
}

/**
 * Stage 2: Pure check for whether a world coordinate `(x, z)` is inside polluted Dark Water (暗水).
 * Active in the Dark Water Basin (-15.5, -12.0) outside Prairie, or in Wasteland/Eden low water pools.
 */
export function isInDarkWaterAt(x: number, z: number, realmId: RealmId = 'home'): boolean {
  if (realmId === 'prairie') return false;
  const distDarkPool = Math.hypot(x - -15.5, z - -12.0);
  if (distDarkPool < 3.4) return true;
  if (realmId === 'wasteland' || realmId === 'eden') {
    const distWestPool = Math.hypot(x - -15.5, z - 0.0);
    if (distWestPool < 3.95) return true;
    return groundHeightAt(x, z) < 0.22;
  }
  return false;
}

/**
 * Pure finite-difference terrain slope calculator returning slope angle in degrees and unit downhill vector.
 */
export function getTerrainSlopeAt(
  x: number,
  z: number
): { slopeAngleDeg: number; downSlopeX: number; downSlopeZ: number } {
  const eps = 0.25;
  const dhdx = (groundHeightAt(x + eps, z) - groundHeightAt(x - eps, z)) / (2 * eps);
  const dhdz = (groundHeightAt(x, z + eps) - groundHeightAt(x, z - eps)) / (2 * eps);
  const gradMag = Math.hypot(dhdx, dhdz);
  const slopeAngleDeg = (Math.atan(gradMag) * 180) / Math.PI;
  if (gradMag < 0.001) {
    return { slopeAngleDeg: 0, downSlopeX: 0, downSlopeZ: 0 };
  }
  return {
    slopeAngleDeg,
    downSlopeX: -dhdx / gradMag,
    downSlopeZ: -dhdz / gradMag,
  };
}

/**
 * Pure check for whether `(x, z)` is on the dedicated East Sand/Snow Slide Ramp (`x = 12..25, z = -6..6`).
 * Prevents normal hills, temple stairs, and outer sanctuary skirts from acting like reverse-pushing "invisible walls".
 */
export function isInDedicatedSlideRampAt(x: number, z: number): boolean {
  return x >= 12.0 && x <= 25.0 && Math.abs(z) <= 6.0;
}

export interface ContinentalArchitecturalHub {
  id: string;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  z: number;
  flatRadius: number;
  outerRadius: number;
  hasUpdraftThermal?: boolean;
}

export const CONTINENTAL_ARCHITECTURAL_HUBS: ContinentalArchitecturalHub[] = [
  {
    id: 'hub_aviary_tea_village',
    name: '南境 · 云巢商店街与八角茶亭',
    subtitle: '八角飞檐茶歇亭、魔法石屋工坊、乐器回音坊与围炉烛火长桌',
    x: 0.0,
    y: 1.8,
    z: 28.0,
    flatRadius: 11.2,
    outerRadius: 14.8,
  },
  {
    id: 'hub_sundial_amphitheater',
    name: '正南中域 · 远古日晷八星柱剧场',
    subtitle: '八柱环形巨石星阵、中央黄金日晷方尖碑与南境升空星盘',
    x: 0.0,
    y: 3.2,
    z: 62.0,
    flatRadius: 9.2,
    outerRadius: 14.5,
    hasUpdraftThermal: true,
  },
  {
    id: 'hub_southeast_windmill',
    name: '东南近域 · 星盘风车观星台',
    subtitle: '旋转四叶黄金风车高塔、观星双柱拱门与上升热气流',
    x: 34.0,
    y: 3.0,
    z: 26.0,
    flatRadius: 6.2,
    outerRadius: 10.5,
    hasUpdraftThermal: true,
  },
  {
    id: 'hub_southwest_mushroom_bridge',
    name: '西南近域 · 荧光溪谷与古石拱桥',
    subtitle: '四角飞檐溪谷石亭、古石拱桥与巨型荧光避雨伞菇群',
    x: -24.0,
    y: 1.6,
    z: 18.0,
    flatRadius: 5.8,
    outerRadius: 8.8,
  },
  {
    id: 'hub_east_sunset_race_towers',
    name: '正东中域 · 霞光竞速拱廊与双子塔',
    subtitle: '双子黄金滑翔塔楼、空中天桥与霞光加速流光环走廊',
    x: 58.0,
    y: 3.5,
    z: 8.0,
    flatRadius: 7.2,
    outerRadius: 11.5,
  },
  {
    id: 'hub_west_twilight_castle',
    name: '正西中域 · 暮光古堡遗迹与圣火庭院',
    subtitle: '双角古堡石塔、断垣拱廊、篝火回能祭坛与古堡光之翼',
    x: -56.0,
    y: 2.8,
    z: 8.0,
    flatRadius: 7.4,
    outerRadius: 11.5,
  },
  {
    id: 'hub_northeast_lighthouse',
    name: '东北中域 · 云海引航灯塔与浮石阶梯',
    subtitle: '旋转金芒引航高塔、云端跑酷跳台石柱与高空上升气流',
    x: 36.0,
    y: 3.6,
    z: -44.0,
    flatRadius: 5.5,
    outerRadius: 9.5,
    hasUpdraftThermal: true,
  },
  {
    id: 'hub_southwest_oasis_caravanserai',
    name: '西南远域 · 星漠驼铃驿站与方尖碑群',
    subtitle: '星漠穹顶石亭、双子黄金方尖碑与绿洲升空星盘',
    x: -48.0,
    y: 2.6,
    z: 56.0,
    flatRadius: 6.8,
    outerRadius: 11.0,
  },
];

export interface WorldObstacleCollider {
  id: string;
  x: number;
  z: number;
  x2?: number;
  z2?: number;
  radius: number;
  maxY: number;
  hollowShellThickness?: number;
  doorwayAngle?: number;
  doorwayHalfWidthRad?: number;
}

const SHRINE_PILLAR_ANGLES = [-0.35, 0, 0.35, Math.PI - 0.35, Math.PI, Math.PI + 0.35];

export const STATIC_WORLD_OBSTACLES: WorldObstacleCollider[] = [
  // 1. 6 Central Shrine Flanking Stone Pillars + Shrine Stone Brazier Basin
  ...SHRINE_PILLAR_ANGLES.map((angle, idx) => ({
    id: `shrine_pillar_${idx}`,
    x: Math.cos(angle) * 6.4,
    z: Math.sin(angle) * 6.4,
    radius: 0.55,
    maxY: 4.6,
  })),
  { id: 'shrine_brazier_pot', x: -4.6, z: 3.8, radius: 0.48, maxY: 2.2 },

  // 2. Butterfly Meadow Welcome Stone Archway Legs at (±3.6, -8.0)
  { id: 'meadow_arch_l', x: -3.6, z: -8.0, radius: 0.42, maxY: 3.8 },
  { id: 'meadow_arch_r', x: 3.6, z: -8.0, radius: 0.42, maxY: 3.8 },

  // 3. 8 Causeway Stone Lantern Pillars (x = ±2.8, z = -10, -18.4, -26.8, -35.2)
  ...[0, 2, 4, 6].flatMap((s) => {
    const sz = -10 - s * 4.2;
    return [
      { id: `lantern_l_${s}`, x: -2.8, z: sz, radius: 0.28, maxY: 3.6 },
      { id: `lantern_r_${s}`, x: 2.8, z: sz, radius: 0.28, maxY: 3.6 },
    ];
  }),

  // 4. East Slide Slope Gate Posts & Summit Golden Pillar
  { id: 'slide_gate_l', x: 12.2, z: -3.8, radius: 0.32, maxY: 4.2 },
  { id: 'slide_gate_r', x: 12.2, z: 3.8, radius: 0.32, maxY: 4.2 },
  { id: 'slide_summit_pillar', x: 23.5, z: 0.0, radius: 0.44, maxY: 9.8 },

  // 5. Northern Elder Temple Main Hall (z = -55) & Flanking Bell Towers (±11, -47.5)
  { id: 'temple_main_hall', x: 0, z: -55.0, radius: 5.42, maxY: 26.0 },
  { id: 'temple_tower_l', x: -11, z: -47.5, radius: 2.25, maxY: 20.0 },
  { id: 'temple_tower_r', x: 11, z: -47.5, radius: 2.25, maxY: 20.0 },

  // 6. Sub-Zone 2: Echo Cavern Double Stone Arch Walls & Crystal Spires around (-18.5, -16.0)
  { id: 'cavern_arch1_l', x: -22.42, z: -13.6, radius: 0.88, maxY: 5.5 },
  { id: 'cavern_arch1_r', x: -14.58, z: -18.4, radius: 0.88, maxY: 5.5 },
  { id: 'cavern_arch2_l', x: -23.32, z: -16.15, radius: 0.76, maxY: 4.8 },
  { id: 'cavern_arch2_r', x: -16.48, z: -19.45, radius: 0.76, maxY: 4.8 },
  { id: 'cavern_crystal_0', x: -21.1, z: -14.8, radius: 0.4, maxY: 4.5 },
  { id: 'cavern_crystal_1', x: -16.1, z: -14.8, radius: 0.4, maxY: 4.5 },
  { id: 'cavern_crystal_2', x: -19.3, z: -18.4, radius: 0.4, maxY: 4.8 },

  // 7. Sub-Zone 3: Three-Tower Bell Village Belfry Stone Pillars at (16.5 ± 1.35, -24.5)
  { id: 'village_bell_pillar_l', x: 15.15, z: -24.5, radius: 0.44, maxY: 9.5 },
  { id: 'village_bell_pillar_r', x: 17.85, z: -24.5, radius: 0.44, maxY: 9.5 },

  // 8. Outer Sanctuary 1: Sanctuary Islands Conch Spire at (47.8, -30.5)
  { id: 'sanctuary_conch_spire', x: 47.8, z: -30.5, radius: 2.95, maxY: 12.0 },

  // 9. Outer Sanctuary 3: Grandma's Hollow Treehouse Bark Shell at (-54, -32) with Open South-East Doorway
  {
    id: 'grandma_treehouse_shell',
    x: -54.0,
    z: -32.0,
    radius: 5.2,
    hollowShellThickness: 0.62,
    doorwayAngle: 0.0,
    doorwayHalfWidthRad: 0.58,
    maxY: 15.5,
  },

  // 10. Outer Sanctuary 5: Wind Paths Chime Arch Legs at (112 ± 6.2, -96)
  { id: 'wind_paths_arch_l', x: 105.8, z: -96.0, radius: 0.52, maxY: 28.5 },
  { id: 'wind_paths_arch_r', x: 118.2, z: -96.0, radius: 0.52, maxY: 28.5 },

  // 11. Outer Sanctuary 6: Hermit Valley Snow Igloo Dome & Gondola Pylon
  { id: 'hermit_igloo_dome', x: 92.8, z: 61.8, radius: 3.15, maxY: 23.0 },
  { id: 'hermit_gondola_pylon', x: 100.5, z: 65.8, radius: 0.54, maxY: 28.0 },

  // 12. Outer Sanctuary 7: Abyss Sunken Stone Tower & Coral Arch Legs
  { id: 'abyss_sunken_tower', x: -112.5, z: 64.5, radius: 2.95, maxY: 13.5 },
  { id: 'abyss_coral_arch_l', x: -112.54, z: 71.11, radius: 0.62, maxY: 9.0 },
  { id: 'abyss_coral_arch_r', x: -103.46, z: 64.89, radius: 0.62, maxY: 9.0 },

  // 13. Outer Sanctuary 8: AURORA Colosseum 8 Golden Columns around (0, -148) at r = 12.2m
  ...Array.from({ length: 8 }, (_, c) => {
    const cAng = (c / 8) * Math.PI * 2;
    return {
      id: `aurora_col_${c}`,
      x: Number((Math.cos(cAng) * 12.2).toFixed(2)),
      z: Number((-148.0 + Math.sin(cAng) * 12.2).toFixed(2)),
      radius: 0.62,
      maxY: 22.0,
    };
  }),

  // 14. Forgotten Ark Wooden Hull Capsule (-90.8..-85.2, -86.5) & Trial of Prophecy Gate Legs (78 ± 4.8, -118)
  {
    id: 'ark_wooden_hull',
    x: -90.8,
    z: -86.5,
    x2: -85.2,
    z2: -86.5,
    radius: 1.62,
    maxY: 8.5,
  },
  { id: 'trial_gate_l', x: 73.2, z: -118.0, radius: 0.62, maxY: 12.0 },
  { id: 'trial_gate_r', x: 82.8, z: -118.0, radius: 0.62, maxY: 12.0 },

  // 15. Hub 1: South Aviary Tea Pavilion Columns, Tea Table & Stone Cottage Shops (0, 28) + South Causeway Lanterns
  { id: 'south_lantern_l_0', x: -2.8, z: 12.0, radius: 0.28, maxY: 3.6 },
  { id: 'south_lantern_r_0', x: 2.8, z: 12.0, radius: 0.28, maxY: 3.6 },
  { id: 'south_lantern_l_1', x: -2.8, z: 20.0, radius: 0.28, maxY: 3.6 },
  { id: 'south_lantern_r_1', x: 2.8, z: 20.0, radius: 0.28, maxY: 3.6 },
  { id: 'aviary_tea_table', x: 0.0, z: 28.0, radius: 0.85, maxY: 3.2 },
  { id: 'aviary_pavilion_col_0', x: -2.4, z: 25.6, radius: 0.38, maxY: 6.8 },
  { id: 'aviary_pavilion_col_1', x: 2.4, z: 25.6, radius: 0.38, maxY: 6.8 },
  { id: 'aviary_pavilion_col_2', x: -2.4, z: 30.4, radius: 0.38, maxY: 6.8 },
  { id: 'aviary_pavilion_col_3', x: 2.4, z: 30.4, radius: 0.38, maxY: 6.8 },
  { id: 'aviary_shop_west', x: -8.2, z: 28.0, radius: 2.25, maxY: 6.8 },
  { id: 'aviary_shop_east', x: 8.2, z: 28.0, radius: 2.25, maxY: 6.8 },
  { id: 'aviary_alchemy_cauldron', x: -5.2, z: 30.2, radius: 0.72, maxY: 3.2 },

  // 16. Hub 2: Ancient Sundial Amphitheater Central Obelisk, Finish Arch Legs & 8 Hengestone Columns around (0, 62)
  { id: 'sundial_obelisk_center', x: 0.0, z: 62.0, radius: 1.15, maxY: 13.5 },
  { id: 'sunset_finish_arch_l', x: -4.2, z: 54.5, radius: 0.35, maxY: 6.5 },
  { id: 'sunset_finish_arch_r', x: 4.2, z: 54.5, radius: 0.35, maxY: 6.5 },
  ...Array.from({ length: 8 }, (_, k) => {
    const ang = (k / 8) * Math.PI * 2;
    return {
      id: `sundial_henge_col_${k}`,
      x: Number((Math.cos(ang) * 7.6).toFixed(2)),
      z: Number((62.0 + Math.sin(ang) * 7.6).toFixed(2)),
      radius: 0.58,
      maxY: 9.8,
    };
  }),

  // 17. Hub 3: Southeast Starlight Windmill Tower (34, 26) & Arch Pillars
  { id: 'windmill_tower_se', x: 34.0, z: 26.0, radius: 2.1, maxY: 14.5 },
  { id: 'windmill_arch_l', x: 30.2, z: 22.5, radius: 0.45, maxY: 7.5 },
  { id: 'windmill_arch_r', x: 37.8, z: 22.5, radius: 0.45, maxY: 7.5 },

  // 18. Hub 4: Southwest Mushroom Glen Gazebo & Stone Bridge Piers (-24, 18)
  { id: 'glen_gazebo_sw', x: -28.2, z: 18.0, radius: 1.65, maxY: 6.5 },
  { id: 'glen_bridge_pier_n', x: -24.0, z: 15.2, radius: 0.48, maxY: 4.2 },
  { id: 'glen_bridge_pier_s', x: -24.0, z: 20.8, radius: 0.48, maxY: 4.2 },

  // 19. Hub 5: East Sunset Race Twin Glide Towers (58, 3.2) & (58, 12.8)
  { id: 'east_race_tower_n', x: 58.0, z: 3.2, radius: 1.95, maxY: 16.0 },
  { id: 'east_race_tower_s', x: 58.0, z: 12.8, radius: 1.95, maxY: 16.0 },

  // 20. Hub 6: West Twilight Castle Bastion Towers & Ruined Aqueduct Pillars (-56, 8)
  { id: 'west_castle_tower_n', x: -60.5, z: 3.8, radius: 2.05, maxY: 13.5 },
  { id: 'west_castle_tower_s', x: -60.5, z: 12.2, radius: 2.05, maxY: 13.5 },
  { id: 'west_castle_pillar_n', x: -51.5, z: 4.2, radius: 0.68, maxY: 7.5 },
  { id: 'west_castle_pillar_s', x: -51.5, z: 11.8, radius: 0.68, maxY: 7.5 },

  // 21. Hub 7: Northeast Cloud-Sea Lighthouse Tower (36, -44)
  { id: 'ne_lighthouse_tower', x: 36.0, z: -44.0, radius: 1.85, maxY: 17.5 },

  // 22. Hub 8: Southwest Starlight Oasis Caravanserai Pavilion & Twin Obelisks (-48, 56)
  { id: 'sw_oasis_pavilion', x: -48.0, z: 56.0, radius: 1.75, maxY: 10.5 },
  { id: 'sw_oasis_obelisk_w', x: -52.5, z: 53.0, radius: 0.85, maxY: 8.8 },
  { id: 'sw_oasis_obelisk_e', x: -43.5, z: 53.0, radius: 0.85, maxY: 8.8 },
];

/**
 * Pure collision resolver that pushes an actor out of solid cylindrical, capsule, and hollow-shell
 * world architecture using multi-contact relaxation passes and computes the true composite outward normal
 * `(normalX, normalZ)` so characters never clip into or get wedged inside buildings.
 */
export function resolveObstacleCollisions(
  x: number,
  y: number,
  z: number,
  actorRadius = 0.44,
  extraObstacles: WorldObstacleCollider[] = []
): { x: number; z: number; hitObstacle: boolean; normalX: number; normalZ: number } {
  let outX = x;
  let outZ = z;
  let hitObstacle = false;
  let normalX = 0;
  let normalZ = 0;

  const allObstacles =
    extraObstacles.length > 0
      ? [...STATIC_WORLD_OBSTACLES, ...extraObstacles]
      : STATIC_WORLD_OBSTACLES;

  for (let pass = 0; pass < 4; pass++) {
    for (const obs of allObstacles) {
      if (y > obs.maxY) continue;

      // Case A: Analytical Hollow Cylindrical Shell with Open Doorway (e.g. Grandma's Hollow Treehouse)
      if (obs.hollowShellThickness !== undefined) {
        const dx = outX - obs.x;
        const dz = outZ - obs.z;
        const dist = Math.hypot(dx, dz);
        const angle = Math.atan2(dx, dz);
        const doorCenter = obs.doorwayAngle ?? 0;
        const doorHalf = obs.doorwayHalfWidthRad ?? 0.58;
        let angDiff = angle - doorCenter;
        while (angDiff > Math.PI) angDiff -= Math.PI * 2;
        while (angDiff < -Math.PI) angDiff += Math.PI * 2;
        if (Math.abs(angDiff) <= doorHalf) {
          continue;
        }
        const halfBand = obs.hollowShellThickness + actorRadius;
        const radialDelta = dist - obs.radius;
        if (Math.abs(radialDelta) < halfBand && dist > 0.0001) {
          hitObstacle = true;
          const rx = dx / dist;
          const rz = dz / dist;
          if (radialDelta >= 0) {
            normalX = rx;
            normalZ = rz;
            const targetR = obs.radius + halfBand + 1e-4;
            outX = obs.x + rx * targetR;
            outZ = obs.z + rz * targetR;
          } else {
            normalX = -rx;
            normalZ = -rz;
            const targetR = Math.max(0.1, obs.radius - halfBand - 1e-4);
            outX = obs.x + rx * targetR;
            outZ = obs.z + rz * targetR;
          }
        }
        continue;
      }

      // Case B: Solid Cylinder or Capsule Segment (e.g. Forgotten Ark Hull, Pillars, Towers, Igloo)
      let cx = obs.x;
      let cz = obs.z;
      if (obs.x2 !== undefined && obs.z2 !== undefined) {
        const segDx = obs.x2 - obs.x;
        const segDz = obs.z2 - obs.z;
        const segLenSq = segDx * segDx + segDz * segDz;
        if (segLenSq > 0.0001) {
          const t = Math.max(
            0,
            Math.min(1, ((outX - obs.x) * segDx + (outZ - obs.z) * segDz) / segLenSq)
          );
          cx = obs.x + t * segDx;
          cz = obs.z + t * segDz;
        }
      }

      const dx = outX - cx;
      const dz = outZ - cz;
      const dist = Math.hypot(dx, dz);
      const minDist = obs.radius + actorRadius;
      if (dist < minDist) {
        hitObstacle = true;
        const pushDist = minDist + 1e-4;
        if (dist > 0.0001) {
          normalX = dx / dist;
          normalZ = dz / dist;
          outX = cx + normalX * pushDist;
          outZ = cz + normalZ * pushDist;
        } else {
          normalX = 0;
          normalZ = 1;
          outX = cx;
          outZ = cz + pushDist;
        }
      }
    }
  }

  if (hitObstacle) {
    const netDx = outX - x;
    const netDz = outZ - z;
    const netDist = Math.hypot(netDx, netDz);
    if (netDist > 0.0001) {
      normalX = netDx / netDist;
      normalZ = netDz / netDist;
    }
  }

  return { x: outX, z: outZ, hitObstacle, normalX, normalZ };
}

/**
 * Pure helper computing Wasteland Dark Dragon (Krill / 冥龙) patrol & spotlight position at `elapsed`.
 */
export function getKrillStateAtTime(elapsed: number): {
  krillX: number;
  krillY: number;
  krillZ: number;
  yaw: number;
  spotX: number;
  spotZ: number;
  spotRadius: number;
} {
  const angle = elapsed * 0.32;
  const krillX = Math.cos(angle) * 18.0;
  const krillZ = -22.0 + Math.sin(angle * 2) * 10.0;
  const krillY = 9.5 + Math.sin(elapsed * 1.5) * 0.8;
  const yaw = -angle + Math.PI * 0.5;
  const spotX = krillX + Math.sin(yaw) * 6.5;
  const spotZ = krillZ + Math.cos(yaw) * 6.5;
  return { krillX, krillY, krillZ, yaw, spotX, spotZ, spotRadius: 5.8 };
}

export function createInitialPhysicsState(loadout?: EquippedLoadout): PlayerPhysicsState {
  const maxWedges = calculateWingWedges(20, loadout);
  return {
    x: 0,
    y: groundHeightAt(0, 6),
    z: 6,
    vx: 0,
    vy: 0,
    vz: 0,
    yaw: Math.PI, // Facing North (-Z) toward the Starlight Altar and Temple Vista!
    pitch: 0,
    roll: 0,
    grounded: true,
    coyoteTimer: 0.12,
    jumpBufferTimer: 0,
    flightMode: 'hover',
    wingEnergy: maxWedges,
    maxWingWedges: maxWedges,
    tempLostWedges: 0,
    flapCooldown: 0,
    isRecharging: false,
    inShelter: true,
    inWindTunnel: false,
    krillAlertLevel: 0,
    distanceFlown: 0,
    locomotionMode: 'idle',
    sitMode: 'none',
    isInShallowWater: false,
    isSlidingSlope: false,
    slopeAngleDeg: 0,
    landingStiffTimer: 0,
    isDiving: false,
    diveMomentum: 0,
    isInDarkWater: false,
    nearCompanion: false,
    energyChangeSource: 'shrine_light',
    netEnergyRatePerSec: ENERGY_CFG.lightSourceRechargeRatePerSec,
  };
}

export function createInitialProgressState(): GameProgressState {
  return {
    candles: 88,
    wax: 40,
    hearts: 36,
    seasonCandles: 24,
    ascendedCandles: 18,
    wingedLights: 20, // Starts at 6-8 wedges depending on cape
    awakenedSpirits: ['emote_butterfly'],
    litCandlesCount: 0,
    currentRealm: 'home',
    activeEmote: null,
    activeEmoteTimer: 0,
    callWaveTimer: 0,
    callWaveRadius: 0,
    shardEventActive: false,
    shardEventType: null,
  };
}

export function createWorldInteractables(realm: RealmId): WorldInteractable[] {
  const realmTitle = REALMS[realm].name.split(' · ')[0];
  const isPrairie = realm === 'prairie';

  // Stage 3: Data-driven Candle Clusters from gameConfig.json prairieZone.candleClusters
  const candleItems: WorldInteractable[] = PRAIRIE_CFG.candleClusters.map((c, idx) => ({
    id: isPrairie ? c.id : `${realm}_candle_${idx}`,
    type: 'candle_cluster',
    name: isPrairie ? c.name : `${realmTitle}${c.name.replace(/^云野|^蝴蝶平原|^幽光洞窟|^三塔村落/, '')}`,
    subtitle: c.subtitle,
    x: c.x,
    y: groundHeightAt(c.x, c.z),
    z: c.z,
    radius: 3.5,
    activated: false,
    waxReward: c.waxReward,
  }));

  // Stage 3: Data-driven Glowing Plants (发光植物 light_bloom) from gameConfig.json prairieZone.lightBlooms
  const bloomItems: WorldInteractable[] = PRAIRIE_CFG.lightBlooms.map((b, idx) => ({
    id: isPrairie ? b.id : `${realm}_bloom_${idx}`,
    type: 'light_bloom',
    name: isPrairie ? b.name : `${b.name.split(' · ')[0]} · ${realmTitle}`,
    subtitle: b.subtitle,
    x: b.x,
    y: groundHeightAt(b.x, b.z),
    z: b.z,
    radius: 3.6,
    activated: false,
    waxReward: b.waxReward,
  }));

  // Stage 3: Data-driven Ancestor Spirit Stations × 2 from gameConfig.json prairieZone.ancestorSpirits
  const spiritItems: WorldInteractable[] = PRAIRIE_CFG.ancestorSpirits.map((s, idx) => ({
    id: isPrairie ? s.id : `${realm}_spirit_${idx === 0 ? 'west' : 'east'}`,
    type: 'ancestor_spirit',
    name: isPrairie ? s.name : idx === 0 ? `${realmTitle}引蝶先祖灵魂` : `${realmTitle}欢呼先祖灵魂`,
    subtitle: s.subtitle,
    x: s.x,
    y: groundHeightAt(s.x, s.z),
    z: s.z,
    radius: 3.8,
    activated: false,
    spiritId: s.spiritId,
    emoteUnlocked: s.emoteUnlocked,
  }));

  const list: WorldInteractable[] = [
    ...candleItems,
    ...bloomItems,
    // Glowing Winged Light Children across the 3 sub-zones (光之翼·小金人)
    {
      id: `${realm}_wl_plaza`,
      type: 'winged_light',
      name: '光之翼 · 蝴蝶平原星童',
      subtitle: '吸收光之翼 (+1 永久小金人 & 提升飞行翼能上限)',
      x: 0,
      y: groundHeightAt(0, -13.5),
      z: -13.5,
      radius: 3.5,
      activated: false,
    },
    {
      id: `${realm}_wl_east_peak`,
      type: 'winged_light',
      name: '光之翼 · 幽光洞窟守望者',
      subtitle: '吸收洞窟光之翼 (+1 永久小金人 & 提升飞行翼能上限)',
      x: -21.5,
      y: groundHeightAt(-21.5, -17.5),
      z: -17.5,
      radius: 3.6,
      activated: false,
    },
    {
      id: `${realm}_wl_temple_crest`,
      type: 'winged_light',
      name: '光之翼 · 三塔钟楼之巅',
      subtitle: '吸收村落钟塔金人 (+1 永久小金人 & 提升飞行翼能上限)',
      x: 16.0,
      y: groundHeightAt(16.0, -24.0),
      z: -24.0,
      radius: 3.6,
      activated: false,
    },
    {
      id: `${realm}_wl_sky_citadel`,
      type: 'winged_light',
      name: '光之翼 · 千鸟天际浮岛星童',
      subtitle: '登上 14.5m 高空千鸟星桥浮岛 · 吸收云端金人 (+1 永久小金人)',
      x: 46.0,
      y: groundHeightAt(46.0, -68.0),
      z: -68.0,
      radius: 4.0,
      activated: false,
    },
    {
      id: `${realm}_wl_wind_paths`,
      type: 'winged_light',
      name: '光之翼 · 风行网道云端领航员',
      subtitle: '飞抵海拔 22m 风行网道浮空群岛 · 吸收高空领航金人 (+1 永久小金人)',
      x: 115.0,
      y: groundHeightAt(115.0, -96.0),
      z: -96.0,
      radius: 4.2,
      activated: false,
    },
    {
      id: `${realm}_wl_hermit_peak`,
      type: 'winged_light',
      name: '光之翼 · 雪隐峰日落守望者',
      subtitle: '登上东南雪隐峰海拔 18.5m 缆车台 · 吸收雪山金人 (+1 永久小金人)',
      x: 99.0,
      y: groundHeightAt(99.0, 64.0),
      z: 64.0,
      radius: 4.2,
      activated: false,
    },
    {
      id: `${realm}_wl_aurora_colosseum`,
      type: 'winged_light',
      name: '光之翼 · 欧若拉星光剧场之巅',
      subtitle: '飞抵极北天际千人星光竞技场 · 吸收音乐会金人 (+1 永久小金人)',
      x: 0.0,
      y: groundHeightAt(0.0, -144.0),
      z: -144.0,
      radius: 4.2,
      activated: false,
    },
    ...spiritItems,
    // Elder Temple Ascension Altar (神庙祈福升华终点)
    {
      id: `${realm}_temple_altar`,
      type: 'temple_altar',
      name:
        realm === 'eden'
          ? '伊甸之眼 · 星河重生祭坛'
          : `${realmTitle}长老神庙祭坛`,
      subtitle:
        realm === 'eden'
          ? '献出光之翼点亮先祖石像 · 完成伊甸星河重生仪式 (+4 升华红蜡烛)'
          : '点亮神庙长老祭坛 · 完成云海星途升华仪式',
      x: 0,
      y: groundHeightAt(0, -48),
      z: -48,
      radius: 4.5,
      activated: false,
    },
  ];

  // Stage 8: Add Realm-Specific Signature Mechanics & Interactables
  if (realm === 'forest') {
    const forestCfg = REALMS_STAGE8_CFG?.forest;
    // Glowing Mushroom Rain Shelters (荧光巨菇避雨亭)
    for (const sh of forestCfg?.mushroomShelters || []) {
      list.push({
        id: sh.id,
        type: 'rain_shelter',
        name: sh.name,
        subtitle: sh.subtitle,
        x: sh.x,
        y: groundHeightAt(sh.x, sh.z),
        z: sh.z,
        radius: sh.radius || 4.2,
        activated: false,
      });
    }
    // Dark Plants in Hidden Forest
    for (const dp of forestCfg?.darkPlants || []) {
      list.push({
        id: dp.id,
        type: 'dark_plant',
        name: dp.name,
        subtitle: dp.subtitle,
        x: dp.x,
        y: groundHeightAt(dp.x, dp.z),
        z: dp.z,
        radius: 3.8,
        activated: false,
        waxReward: dp.waxReward || 65,
      });
    }
  } else if (realm === 'valley') {
    const valleyCfg = REALMS_STAGE8_CFG?.valley;
    // Valley Skating & Flying Race Checkpoints (霞谷滑行/飞行赛道金环)
    for (const ring of valleyCfg?.raceRings || []) {
      list.push({
        id: ring.id,
        type: 'race_ring',
        name: ring.name,
        subtitle: ring.subtitle,
        x: ring.x,
        y: groundHeightAt(ring.x, ring.z) + (ring.yOffset || 1.5),
        z: ring.z,
        radius: 4.4,
        activated: false,
        waxReward: ring.waxReward || 45,
      });
    }
  } else if (realm === 'wasteland') {
    const wasteCfg = REALMS_STAGE8_CFG?.wasteland;
    // Stone & Ribcage Cover Shelters that break Krill line-of-sight
    for (const sh of wasteCfg?.ruinShelters || []) {
      list.push({
        id: sh.id,
        type: 'rain_shelter',
        name: sh.name,
        subtitle: sh.subtitle,
        x: sh.x,
        y: groundHeightAt(sh.x, sh.z),
        z: sh.z,
        radius: sh.radius || 4.2,
        activated: false,
      });
    }
    // Dark Crabs that can be flipped on their backs with Charged Deep Call [Q]
    for (const crab of wasteCfg?.darkCrabs || []) {
      list.push({
        id: crab.id,
        type: 'dark_crab',
        name: crab.name,
        subtitle: crab.subtitle,
        x: crab.x,
        y: groundHeightAt(crab.x, crab.z),
        z: crab.z,
        radius: 3.8,
        activated: false,
        flipped: false,
        waxReward: crab.waxReward || 40,
      });
    }
    list.push({
      id: 'wasteland_dark_plant_1',
      type: 'dark_plant',
      name: '暮土远古蚀光花',
      subtitle: '举起心火持续燃烧净化暗植物 (+65 滴纯净烛火 & 驱散暗蟹)',
      x: -4.2,
      y: groundHeightAt(-4.2, -20.5),
      z: -20.5,
      radius: 3.8,
      activated: false,
      waxReward: 65,
    });
  } else if (realm === 'vault') {
    const vaultCfg = REALMS_STAGE8_CFG?.vault;
    if (vaultCfg?.coopDoor) {
      const cd = vaultCfg.coopDoor;
      list.push({
        id: cd.id,
        type: 'coop_door',
        name: cd.name,
        subtitle: cd.subtitle,
        x: cd.x,
        y: groundHeightAt(cd.x, cd.z),
        z: cd.z,
        radius: 4.2,
        activated: false,
        waxReward: cd.waxReward || 65,
      });
    }
    if (vaultCfg?.starlightElevator) {
      const el = vaultCfg.starlightElevator;
      list.push({
        id: el.id,
        type: 'starlight_elevator',
        name: el.name,
        subtitle: el.subtitle,
        x: el.x,
        y: groundHeightAt(el.x, el.z),
        z: el.z,
        radius: 4.4,
        activated: false,
      });
    }
  } else if (realm === 'eden') {
    const edenCfg = REALMS_STAGE8_CFG?.eden;
    for (const st of edenCfg?.statues || []) {
      list.push({
        id: st.id,
        type: 'eden_statue',
        name: st.name,
        subtitle: st.subtitle,
        x: st.x,
        y: groundHeightAt(st.x, st.z),
        z: st.z,
        radius: 3.8,
        activated: false,
      });
    }
    list.push({
      id: 'eden_dark_plant_1',
      type: 'dark_plant',
      name: '暴风眼蚀光红石藤',
      subtitle: '用烛火净化暴风眼暗植物 (+65 滴烛火 & 恢复斗篷翼能)',
      x: -4.2,
      y: groundHeightAt(-4.2, -20.5),
      z: -20.5,
      radius: 3.8,
      activated: false,
      waxReward: 65,
    });
  }

  // Stage 12: 6 Collectible Sky Tribute Easter Eggs across the 135m expanded map
  const easterEggs = (STAGE12_CFG?.easterEggs || []) as {
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
  }[];
  for (const egg of easterEggs) {
    list.push({
      id: egg.id,
      type: 'easter_egg',
      name: egg.name,
      subtitle: egg.subtitle,
      loreText: egg.loreText,
      x: egg.x,
      y: groundHeightAt(egg.x, egg.z),
      z: egg.z,
      radius: egg.radius || 4.4,
      activated: false,
      waxReward: egg.waxReward || 60,
      candlesBonus: egg.candlesBonus || 0,
      heartsBonus: egg.heartsBonus || 0,
      ascendedCandlesBonus: egg.ascendedCandlesBonus || 0,
      wingedLightBonus: egg.wingedLightBonus || 0,
      launchVy: egg.launchVy || 0,
    });
  }

  // Continental Architectural Hub Interactables (18 playable elements across the 8 ground architectural complexes)
  list.push(
    // 1. South Aviary Market & Tea Village (0, 28)
    {
      id: `${realm}_hub_aviary_tea_candles`,
      type: 'candle_cluster',
      name: '云巢八角茶亭 · 围炉茶点烛台',
      subtitle: '点燃茶亭石桌烛火 (+65 滴烛火 & 瞬间回满翼能)',
      x: 0.0,
      y: groundHeightAt(0.0, 28.0),
      z: 28.0,
      radius: 4.0,
      activated: false,
      waxReward: 65,
    },
    {
      id: `${realm}_hub_aviary_bloom`,
      type: 'light_bloom',
      name: '云巢乐器坊 · 庭院星瓣花',
      subtitle: '共鸣绽放商店街发光花 (+50 滴烛火 & 金蝶环绕)',
      x: 5.5,
      y: groundHeightAt(5.5, 29.5),
      z: 29.5,
      radius: 3.8,
      activated: false,
      waxReward: 50,
    },
    // 2. South Sundial Colonnade Amphitheater (0, 62)
    {
      id: `${realm}_hub_sundial_candles`,
      type: 'candle_cluster',
      name: '远古日晷剧场 · 星阵圣火盆',
      subtitle: '点燃八星柱日晷圣火 (+75 滴烛火 & 激活上升热气流)',
      x: 0.0,
      y: groundHeightAt(0.0, 58.0),
      z: 58.0,
      radius: 4.0,
      activated: false,
      waxReward: 75,
    },
    {
      id: `${realm}_hub_sundial_elevator`,
      type: 'starlight_elevator',
      name: '远古日晷 · 升空星盘机关',
      subtitle: '启动日晷星盘升力 · 托举旅人直上云端俯瞰整片南境大陆',
      x: 0.0,
      y: groundHeightAt(0.0, 65.5),
      z: 65.5,
      radius: 4.2,
      activated: false,
    },
    {
      id: `${realm}_hub_sundial_wl`,
      type: 'winged_light',
      name: '光之翼 · 远古日晷守望者',
      subtitle: '吸收南境日晷星阵小金人 (+1 永久光之翼 & 提升翼阶上限)',
      x: 0.0,
      y: groundHeightAt(0.0, 68.5),
      z: 68.5,
      radius: 4.0,
      activated: false,
    },
    // 3. Southeast Windmill Observatory (34, 26)
    {
      id: `${realm}_hub_windmill_candles`,
      type: 'candle_cluster',
      name: '星盘风车塔 · 观星圣火簇',
      subtitle: '点燃风车塔底大烛堆 (+60 滴烛火 & 借风车气流升空)',
      x: 31.2,
      y: groundHeightAt(31.2, 24.5),
      z: 24.5,
      radius: 3.8,
      activated: false,
      waxReward: 60,
    },
    {
      id: `${realm}_hub_windmill_bloom`,
      type: 'light_bloom',
      name: '风车观星台 · 云端光之花',
      subtitle: '共鸣绽放观星花 (+55 滴烛火 & 充满斗篷能量)',
      x: 37.5,
      y: groundHeightAt(37.5, 28.0),
      z: 28.0,
      radius: 3.8,
      activated: false,
      waxReward: 55,
    },
    // 4. Southwest Glowing Mushroom Creek & Stone Arch Bridge (-24, 18)
    {
      id: `${realm}_hub_sw_bridge_shelter`,
      type: 'rain_shelter',
      name: '西南溪谷 · 飞檐古石亭',
      subtitle: '在古桥飞檐亭避雨护火 · 瞬间修复全部受损翼格并补充能量',
      x: -24.0,
      y: groundHeightAt(-24.0, 18.0),
      z: 18.0,
      radius: 4.2,
      activated: false,
    },
    {
      id: `${realm}_hub_sw_bridge_bloom`,
      type: 'light_bloom',
      name: '古石拱桥 · 荧光伞菇簇',
      subtitle: '共鸣点亮溪畔荧光巨菇 (+55 滴烛火 & 飞舞光蝶)',
      x: -20.5,
      y: groundHeightAt(-20.5, 20.5),
      z: 20.5,
      radius: 3.8,
      activated: false,
      waxReward: 55,
    },
    // 5. East Sunset Race Arcade & Twin Towers (58, 8)
    {
      id: `${realm}_hub_east_race_ring_1`,
      type: 'race_ring',
      name: '东境竞速拱廊 · 起点流光金环',
      subtitle: '穿过拱廊起点金环 · 触发 13.8m/s 极速滑翔冲刺 (+50 滴烛火)',
      x: 36.0,
      y: groundHeightAt(36.0, 8.0) + 1.5,
      z: 8.0,
      radius: 4.5,
      activated: false,
      waxReward: 50,
    },
    {
      id: `${realm}_hub_east_race_ring_2`,
      type: 'race_ring',
      name: '东境双子塔 · 凯旋流光金环',
      subtitle: '穿过双子塔天桥金环 · 二段流光加速 (+65 滴烛火 & 充满翼能)',
      x: 54.0,
      y: groundHeightAt(54.0, 8.0) + 1.8,
      z: 8.0,
      radius: 4.5,
      activated: false,
      waxReward: 65,
    },
    {
      id: `${realm}_hub_east_race_wl`,
      type: 'winged_light',
      name: '光之翼 · 霞光双子塔之巅',
      subtitle: '抵达正东竞速双子塔祭坛 · 吸收凯旋小金人 (+1 永久光之翼)',
      x: 61.5,
      y: groundHeightAt(61.5, 8.0),
      z: 8.0,
      radius: 4.0,
      activated: false,
    },
    // 6. West Twilight Castle Ruins & Courtyard (-56, 8)
    {
      id: `${realm}_hub_west_castle_candles`,
      type: 'candle_cluster',
      name: '暮光古堡庭院 · 圣火大烛堆',
      subtitle: '点燃古堡中庭圣火 (+70 滴烛火 & 掩体护火回能)',
      x: -56.0,
      y: groundHeightAt(-56.0, 8.0),
      z: 8.0,
      radius: 4.2,
      activated: false,
      waxReward: 70,
    },
    {
      id: `${realm}_hub_west_castle_wl`,
      type: 'winged_light',
      name: '光之翼 · 暮光古堡断垣星童',
      subtitle: '探索西境古堡遗迹 · 吸收城墙守望小金人 (+1 永久光之翼)',
      x: -60.5,
      y: groundHeightAt(-60.5, 8.0),
      z: 8.0,
      radius: 4.0,
      activated: false,
    },
    // 7. Northeast Cloud Lighthouse & Stepping Pillars (36, -44)
    {
      id: `${realm}_hub_ne_lighthouse_candles`,
      type: 'candle_cluster',
      name: '东北引航灯塔 · 领航圣火坛',
      subtitle: '点燃灯塔基座圣火 (+65 滴烛火 & 开启灯塔上升气流)',
      x: 33.2,
      y: groundHeightAt(33.2, -42.5),
      z: -42.5,
      radius: 3.8,
      activated: false,
      waxReward: 65,
    },
    {
      id: `${realm}_hub_ne_lighthouse_wl`,
      type: 'winged_light',
      name: '光之翼 · 云海灯塔引航员',
      subtitle: '造访东北引航灯塔高台 · 吸收灯塔小金人 (+1 永久光之翼)',
      x: 39.2,
      y: groundHeightAt(39.2, -45.5),
      z: -45.5,
      radius: 4.0,
      activated: false,
    },
    // 8. Southwest Starlight Oasis Caravanserai (-48, 56)
    {
      id: `${realm}_hub_sw_oasis_candles`,
      type: 'candle_cluster',
      name: '星漠驼铃驿站 · 穹顶绿洲烛台',
      subtitle: '点燃星漠驿站穹顶烛簇 (+70 滴烛火 & 瞬间恢复翼能)',
      x: -48.0,
      y: groundHeightAt(-48.0, 53.0),
      z: 53.0,
      radius: 4.0,
      activated: false,
      waxReward: 70,
    },
    {
      id: `${realm}_hub_sw_oasis_elevator`,
      type: 'starlight_elevator',
      name: '星漠方尖碑 · 星光升空浮台',
      subtitle: '激活双子方尖碑共鸣 · 乘星光浮台跃升西南高空云海',
      x: -48.0,
      y: groundHeightAt(-48.0, 59.5),
      z: 59.5,
      radius: 4.2,
      activated: false,
    }
  );

  return list;
}

/**
 * Stage 8 Pure Helper: Checks if `(x, z)` is inside a realm-specific shelter pavilion
 * (Forest glowing mushroom shelters or Wasteland stone ruin shelters).
 */
export function isInRealmShelterAt(
  realmId: RealmId,
  x: number,
  z: number
): boolean {
  if (realmId === 'forest') {
    const shelters = REALMS_STAGE8_CFG?.forest?.mushroomShelters || [];
    return shelters.some(
      (s: any) => Math.hypot(x - s.x, z - s.z) <= (s.radius || 4.2)
    );
  }
  if (realmId === 'wasteland' || realmId === 'eden') {
    const shelters = REALMS_STAGE8_CFG?.wasteland?.ruinShelters || [];
    return shelters.some(
      (s: any) => Math.hypot(x - s.x, z - s.z) <= (s.radius || 4.2)
    );
  }
  return false;
}

export function stepPlayerPhysics(
  state: PlayerPhysicsState,
  input: PlayerInputFrame,
  dtRaw: number,
  loadout?: EquippedLoadout
): {
  nextState: PlayerPhysicsState;
  didFlap: boolean;
  didLand: boolean;
  hazardStrike?: 'krill' | 'storm' | null;
} {
  const dt = Math.min(Math.max(dtRaw, 0.001), 0.05);
  const next: PlayerPhysicsState = { ...state };
  let didFlap = false;
  let didLand = false;
  let hazardStrike: 'krill' | 'storm' | null = null;

  const realmId: RealmId = input.realmId || 'home';
  const weather = REALMS[realmId].weather;
  const elapsed = input.elapsed ?? 0;

  // Toggle between Hover Mode and Glide Mode
  if (input.toggleFlightModeJustPressed) {
    next.flightMode = next.flightMode === 'hover' ? 'glide' : 'hover';
  }

  const inputLen = Math.hypot(input.moveX, input.moveZ);

  // Stage 1: Sit / Shrine Meditate / Bench Sit Alongside Toggle
  if (input.toggleSitJustPressed && next.grounded) {
    if (next.sitMode !== 'none') {
      next.sitMode = 'none';
    } else {
      const distShrineMeditation = Math.hypot(next.x - 0, next.z - 2.2);
      const distStoneBench = Math.hypot(next.x - 4.6, next.z - 3.8);
      if (distShrineMeditation < 3.0) {
        next.sitMode = 'meditate_shrine';
        next.x = 0;
        next.z = 2.2;
        next.y = groundHeightAt(0, 2.2);
        next.yaw = Math.PI;
      } else if (distStoneBench < 3.2) {
        next.sitMode = 'sit_bench';
        next.x = 4.25;
        next.z = 3.8;
        next.y = groundHeightAt(4.25, 3.8) + 0.18;
        next.yaw = Math.PI - 0.4;
      } else {
        next.sitMode = 'sit_ground';
      }
      next.vx = 0;
      next.vz = 0;
    }
  }

  // Stand up automatically if player pushes joystick/WASD or jumps while seated
  if (next.sitMode !== 'none' && (inputLen > 0.15 || input.jumpJustPressed)) {
    next.sitMode = 'none';
  }

  // Tick down non-lethal high-landing recovery stiffness timer
  if (next.landingStiffTimer > 0) {
    next.landingStiffTimer = Math.max(0, next.landingStiffTimer - dt);
  }

  // Check Shallow Water Wading & Terrain Slope Angle
  const inShallowWater = next.grounded && isInShallowWaterAt(next.x, next.z);
  next.isInShallowWater = inShallowWater;

  const slopeInfo = getTerrainSlopeAt(next.x, next.z);
  next.slopeAngleDeg = slopeInfo.slopeAngleDeg;
  const inSlideRampZone = isInDedicatedSlideRampAt(next.x, next.z);
  const onSteepSlope =
    next.grounded &&
    inSlideRampZone &&
    slopeInfo.slopeAngleDeg >= LOCOMOTION_CFG.slopeSlideMinAngleDeg;
  next.isSlidingSlope = onSteepSlope;

  // Chibi mask gives slightly brisker ground cadence; Valley ice gives extra speed
  const isChibi = loadout?.mask === 'mask_chibi';
  const hasFireBrazier =
    loadout?.prop === 'prop_fire_brazier' || loadout?.prop === 'prop_ancestral_staff';
  const isIceRealm = weather === 'ice' && next.grounded;

  // Stage 1: Two-tier Walk vs Run (joystick pushed full >= threshold or Shift held)
  const isRunningInput =
    input.sprintHeld || inputLen >= LOCOMOTION_CFG.runJoystickThreshold;
  const baseGroundSpeed = isRunningInput
    ? LOCOMOTION_CFG.runSpeed
    : LOCOMOTION_CFG.walkSpeed;

  const activeSpell = input.activeSpellId || null;
  const hasWindSpeedSpell = activeSpell === 'spell_wind_speed';
  const hasAntigravSpell = activeSpell === 'spell_antigravity_feather';
  const hasGoldenAegisSpell = activeSpell === 'spell_golden_aegis';
  const hasRainbowTrailSpell = activeSpell === 'spell_rainbow_trail';

  const groundSpeed =
    baseGroundSpeed *
    (isChibi ? 1.08 : 1.0) *
    (isIceRealm ? 1.35 : 1.0) *
    (hasWindSpeedSpell ? 1.25 : hasRainbowTrailSpell ? 1.15 : 1.0) *
    (inShallowWater ? LOCOMOTION_CFG.shallowWaterSlowMultiplier : 1.0) *
    (next.landingStiffTimer > 0 ? 0.45 : 1.0);

  // Calculate world-space wish direction relative to cameraYaw
  let wishX = 0;
  let wishZ = 0;
  if (inputLen > 0.05 && next.sitMode === 'none') {
    const nx = input.moveX / inputLen;
    const nz = input.moveZ / inputLen;
    const sinY = Math.sin(input.cameraYaw);
    const cosY = Math.cos(input.cameraYaw);
    wishX = nx * cosY + nz * sinY;
    wishZ = nz * cosY - nx * sinY;

    const targetYaw = Math.atan2(wishX, wishZ);
    // Smooth angular shortest-path interpolation
    let diff = targetYaw - next.yaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const turnRate = next.grounded ? 14.0 : next.flightMode === 'glide' ? 5.5 : 8.5;
    next.yaw += diff * (1 - Math.exp(-turnRate * dt));
    next.roll = Math.max(-0.55, Math.min(0.55, -diff * (next.grounded ? 0.1 : 0.42)));
  } else {
    next.roll *= Math.exp(-10 * dt);
  }

  // If the player is actively walking uphill on the East Slide Ramp, let them walk normally instead of sliding back
  const uphillAlignment = -(wishX * slopeInfo.downSlopeX + wishZ * slopeInfo.downSlopeZ);
  const activeSlideSlope = onSteepSlope && uphillAlignment < 0.35;
  next.isSlidingSlope = activeSlideSlope;

  next.flapCooldown = Math.max(0, next.flapCooldown - dt);

  // Jump buffer & Coyote timers
  if (input.jumpJustPressed) {
    next.jumpBufferTimer = 0.14;
  } else {
    next.jumpBufferTimer = Math.max(0, next.jumpBufferTimer - dt);
  }

  if (next.grounded) {
    next.coyoteTimer = 0.12;
  } else {
    next.coyoteTimer = Math.max(0, next.coyoteTimer - dt);
  }

  const aegisBonusWedges = hasGoldenAegisSpell ? 2.0 : 0.0;
  const effectiveMaxEnergy = Math.max(
    1,
    next.maxWingWedges + aegisBonusWedges - next.tempLostWedges
  );
  const flapLiftScale = hasAntigravSpell ? 1.3 : 1.0;

  // Ground Jump or Aerial Wing Flap (Stage 2: consumes ENERGY_CFG.flapCostWedges = 1.0 wedge per flap)
  if (next.jumpBufferTimer > 0 && next.coyoteTimer > 0) {
    // Ground Takeoff Jump
    next.vy = LOCOMOTION_CFG.jumpVerticalImpulse * flapLiftScale;
    next.grounded = false;
    next.sitMode = 'none';
    next.isSlidingSlope = false;
    next.isDiving = false;
    next.coyoteTimer = 0;
    next.jumpBufferTimer = 0;
    didFlap = true;
  } else if (
    input.jumpJustPressed &&
    !next.grounded &&
    next.wingEnergy >= 0.25 &&
    next.flapCooldown <= 0
  ) {
    // Aerial Wing Flap (振翅高飞): deducts configured flapCostWedges (default 1.0 wedge)
    next.wingEnergy = Math.max(0, next.wingEnergy - ENERGY_CFG.flapCostWedges);
    next.flapCooldown = 0.22;
    next.jumpBufferTimer = 0;
    next.isDiving = false;
    didFlap = true;

    // Pull-up swoop bonus if flapping out of a dive!
    const pullUpBonus = next.diveMomentum * ENERGY_CFG.divePullUpLiftFactor;
    next.diveMomentum = 0;

    if (next.flightMode === 'glide') {
      next.vy = Math.max(
        next.vy + 5.8 * flapLiftScale + pullUpBonus,
        7.2 * flapLiftScale + pullUpBonus
      );
      const boostDirX = Math.sin(next.yaw);
      const boostDirZ = Math.cos(next.yaw);
      next.vx += boostDirX * ENERGY_CFG.glideForwardBoost;
      next.vz += boostDirZ * ENERGY_CFG.glideForwardBoost;
    } else {
      next.vy = Math.max(
        next.vy + ENERGY_CFG.flapVerticalImpulse * 0.8 * flapLiftScale,
        ENERGY_CFG.flapVerticalImpulse * flapLiftScale + pullUpBonus
      );
      next.vx += wishX * 3.2;
      next.vz += wishZ * 3.2;
    }
  }

  // Stage 2: Aerial Dive (俯冲加速) vs Continuous Gentle Glide Lift
  const wantsDive = Boolean(input.diveHeld) && !next.grounded;
  if (wantsDive) {
    next.isDiving = true;
    next.flightMode = 'glide';
    next.diveMomentum = Math.min(12.0, next.diveMomentum + 9.5 * dt);
  } else {
    if (next.isDiving && !next.grounded && next.diveMomentum > 0.5) {
      // Swoop pull-up: convert accumulated dive momentum into upward lift!
      next.vy = Math.max(
        next.vy,
        3.2 + next.diveMomentum * ENERGY_CFG.divePullUpLiftFactor
      );
      next.diveMomentum *= 0.25;
    }
    next.isDiving = false;
    next.diveMomentum = Math.max(0, next.diveMomentum - 4.5 * dt);
  }

  // Continuous gentle glide lift when holding Space in air with energy (and not diving)
  if (!next.grounded && !next.isDiving && input.jumpHeld && next.wingEnergy > 0.1) {
    const continuousDrain = 0.22 * dt;
    next.wingEnergy = Math.max(0, next.wingEnergy - continuousDrain);
    next.vy += (next.flightMode === 'glide' ? 7.2 : 8.5) * dt;
  }

  // Horizontal velocity & drag (including Steep Slope Sliding, Valley Ice Rink & Stage 2 Aerial Dive!)
  if (next.grounded) {
    next.isDiving = false;
    next.diveMomentum = 0;
    if (next.sitMode !== 'none') {
      next.vx = 0;
      next.vz = 0;
    } else if (activeSlideSlope) {
      // Steep slope sliding on the dedicated East Slide Ramp: accelerate along downhill gradient + allow steering
      const slideAccel = LOCOMOTION_CFG.slopeSlideAcceleration;
      next.vx += (slopeInfo.downSlopeX * slideAccel + wishX * 5.2) * dt;
      next.vz += (slopeInfo.downSlopeZ * slideAccel + wishZ * 5.2) * dt;
      const slideSpeed = Math.hypot(next.vx, next.vz);
      if (slideSpeed > 11.2) {
        next.vx = (next.vx / slideSpeed) * 11.2;
        next.vz = (next.vz / slideSpeed) * 11.2;
      }
      if (slideSpeed > 0.4 && inputLen < 0.1) {
        const slideYaw = Math.atan2(next.vx, next.vz);
        let sDiff = slideYaw - next.yaw;
        while (sDiff > Math.PI) sDiff -= Math.PI * 2;
        while (sDiff < -Math.PI) sDiff += Math.PI * 2;
        next.yaw += sDiff * (1 - Math.exp(-9 * dt));
      }
    } else {
      const scaledMag = Math.min(1, inputLen);
      const targetVx = wishX * groundSpeed * (isRunningInput ? 1 : Math.max(0.55, scaledMag));
      const targetVz = wishZ * groundSpeed * (isRunningInput ? 1 : Math.max(0.55, scaledMag));
      const accel = 1 - Math.exp(-(isIceRealm ? 4.2 : 16.5) * dt);
      next.vx += (targetVx - next.vx) * accel;
      next.vz += (targetVz - next.vz) * accel;
      if (inputLen <= 0.05 && !isIceRealm && Math.hypot(next.vx, next.vz) < 0.08) {
        next.vx = 0;
        next.vz = 0;
      }
    }
  } else {
    const airSpeed =
      (next.isDiving
        ? ENERGY_CFG.diveMaxHorizontalSpeed
        : next.flightMode === 'glide'
          ? ENERGY_CFG.glideAirSpeed
          : ENERGY_CFG.hoverAirSpeed) * (hasWindSpeedSpell ? 1.25 : 1.0);
    const forwardX = Math.sin(next.yaw);
    const forwardZ = Math.cos(next.yaw);
    const useForwardHeading = next.isDiving || (next.flightMode === 'glide' && inputLen > 0.05);
    const targetVx = useForwardHeading ? forwardX * airSpeed : wishX * airSpeed;
    const targetVz = useForwardHeading ? forwardZ * airSpeed : wishZ * airSpeed;
    const airControl = 1 - Math.exp(-(next.isDiving ? 6.5 : next.flightMode === 'glide' ? 4.5 : 7.0) * dt);
    next.vx += (targetVx - next.vx) * airControl;
    next.vz += (targetVz - next.vz) * airControl;
  }

  // Gravity (steeper downward acceleration during Dive, softer when Gliding or in Vault starlight low-gravity or Antigravity Feather Spell!)
  const rawGravity = next.isDiving
    ? ENERGY_CFG.diveGravity
    : weather === 'starlight_gravity'
      ? 6.5
      : next.grounded
        ? 20.0
        : next.flightMode === 'glide'
          ? 8.4
          : 13.5;
  const baseGravity =
    !next.grounded && !next.isDiving && hasAntigravSpell
      ? rawGravity * 0.6
      : rawGravity;
  const maxSinkSpeed = next.isDiving ? -19.5 : -14.0;
  next.vy = Math.max(maxSinkSpeed, next.vy - baseGravity * dt);

  // Stage 3 Wind Tunnel Updraft & Stage 13 Outer Wind-Path Cloud Rail Network
  const wt = PRAIRIE_CFG.windTunnel;
  const inInnerWindCorridor =
    (weather === 'wind_updraft' || realmId === 'home') &&
    next.x >= wt.xMin &&
    next.x <= wt.xMax &&
    next.z <= wt.zStart &&
    next.z >= wt.zEnd &&
    (!next.grounded || weather === 'wind_updraft');
  const distFromWindPaths = Math.hypot(next.x - 112.0, next.z - -96.0);
  const inOuterWindPath =
    !next.grounded &&
    next.y >= 8.0 &&
    (distFromWindPaths <= 28.0 ||
      (Math.hypot(next.x, next.z) >= 88.0 && Math.hypot(next.x, next.z) <= 156.0 && next.y >= 11.0));
  const inHubThermalUpdraft =
    !next.grounded &&
    !next.isDiving &&
    CONTINENTAL_ARCHITECTURAL_HUBS.some(
      (h) => h.hasUpdraftThermal && Math.hypot(next.x - h.x, next.z - h.z) <= 5.8
    );
  const inEastRaceArcade =
    next.x >= 28.0 && next.x <= 62.0 && Math.abs(next.z - 8.0) <= 4.2 && next.y <= 12.0;
  const inWindCorridor = inInnerWindCorridor || inOuterWindPath || inHubThermalUpdraft || inEastRaceArcade;
  next.inWindTunnel = inWindCorridor;
  if (inInnerWindCorridor && !next.grounded && !next.isDiving) {
    next.vy = Math.min(11.5, next.vy + (wt.updraftAccel + 4.5) * dt);
    // Forward tailwind propulsion toward the northern Three-Tower Bell Village (-Z)
    next.vz = Math.min(next.vz - wt.forwardBoostAccel * dt, -3.5);
    next.wingEnergy = Math.min(
      effectiveMaxEnergy,
      next.wingEnergy + wt.rechargeRatePerSec * dt
    );
  } else if ((inOuterWindPath || inHubThermalUpdraft) && !next.isDiving) {
    next.vy = Math.min(13.5, next.vy + (wt.updraftAccel + 10.5) * dt);
    next.wingEnergy = Math.min(
      effectiveMaxEnergy,
      next.wingEnergy + (wt.rechargeRatePerSec + 0.8) * dt
    );
  } else if (inEastRaceArcade) {
    // East Sunset Race Arcade gives a playful tailwind boost along +X and recharges wing energy
    if (next.vx > 0.5) {
      next.vx = Math.min(12.5, next.vx + 4.8 * dt);
    }
    next.wingEnergy = Math.min(
      effectiveMaxEnergy,
      next.wingEnergy + wt.rechargeRatePerSec * dt
    );
  }

  // Variable jump cut if releasing space early on initial hop
  if (
    !next.grounded &&
    !input.jumpHeld &&
    !next.isDiving &&
    next.vy > 4.0 &&
    next.wingEnergy === next.maxWingWedges
  ) {
    next.vy *= 0.85;
  }

  // Integrate position
  const wasGroundedBeforeMove = next.grounded;
  const prevX = next.x;
  const prevZ = next.z;
  const preLandVy = next.vy;
  next.x += next.vx * dt;
  next.y += next.vy * dt;
  next.z += next.vz * dt;

  // Resolve solid obstacle collisions (shrine pillars, temple hall, bell towers) with smooth tangential sliding
  const colRes = resolveObstacleCollisions(next.x, next.y, next.z, 0.44);
  if (colRes.hitObstacle) {
    next.x = colRes.x;
    next.z = colRes.z;
    const inwardDot = next.vx * colRes.normalX + next.vz * colRes.normalZ;
    if (inwardDot < 0) {
      next.vx -= inwardDot * colRes.normalX;
      next.vz -= inwardDot * colRes.normalZ;
    }
  }

  // Stage 13: Keep player inside expanded playable cloud sanctuary radius (225m, >11x area!) with soft cloud updraft bounce
  const maxWorldRadius = Math.max(225, Number(STAGE12_CFG?.worldRadius) || 225);
  const radialDist = Math.hypot(next.x, next.z);
  if (radialDist > maxWorldRadius) {
    const scaleBack = maxWorldRadius / radialDist;
    next.x *= scaleBack;
    next.z *= scaleBack;
    next.vy = Math.max(next.vy, 7.5); // Outer cloud bank lifts player gently upward!
    next.wingEnergy = Math.min(effectiveMaxEnergy, next.wingEnergy + 1.8 * dt);
  }

  const stepHorizDist = Math.hypot(next.x - prevX, next.z - prevZ);
  if (!next.grounded) {
    next.distanceFlown += stepHorizDist;
  }

  // Terrain collision, downhill ground-following snap tolerance & non-lethal high-landing stiffness
  const floorY =
    next.sitMode === 'sit_bench'
      ? groundHeightAt(next.x, next.z) + 0.18
      : groundHeightAt(next.x, next.z);
  const downhillSnapTolerance =
    wasGroundedBeforeMove && !didFlap && next.vy <= 0.05 ? 0.65 : 0.0;
  if (next.y <= floorY + downhillSnapTolerance) {
    if (!wasGroundedBeforeMove && preLandVy < -2.0) {
      didLand = true;
      // High fall landing recovery stiffness (no fall damage/death!)
      if (preLandVy <= LOCOMOTION_CFG.highLandingVelocityThreshold) {
        next.landingStiffTimer = LOCOMOTION_CFG.landingStiffDurationSec;
        next.vx *= 0.25;
        next.vz *= 0.25;
      }
    }
    next.y = floorY;
    next.vy = 0;
    next.grounded = true;
    next.isDiving = false;
    next.diveMomentum = 0;
  } else {
    next.grounded = false;
  }

  // Update post-move shallow water, dark water & slope flags
  next.isInShallowWater = next.grounded && isInShallowWaterAt(next.x, next.z);
  next.isInDarkWater = next.grounded && isInDarkWaterAt(next.x, next.z, realmId);
  next.nearCompanion = Boolean(input.nearCompanion);

  const postSlope = getTerrainSlopeAt(next.x, next.z);
  next.slopeAngleDeg = postSlope.slopeAngleDeg;
  next.isSlidingSlope =
    next.grounded &&
    isInDedicatedSlideRampAt(next.x, next.z) &&
    postSlope.slopeAngleDeg >= LOCOMOTION_CFG.slopeSlideMinAngleDeg &&
    uphillAlignment < 0.35;

  // Determine exact LocomotionMode for HUD, Debug Telemetry & Skeletal Animator
  const horizSpd = Math.hypot(next.vx, next.vz);
  if (!next.grounded) {
    if (next.isDiving) {
      next.locomotionMode = 'dive';
    } else {
      next.locomotionMode = next.vy > 1.5 && next.distanceFlown < 3.0 ? 'jump' : 'fly';
    }
  } else if (next.landingStiffTimer > 0) {
    next.locomotionMode = 'land_stiff';
  } else if (next.sitMode !== 'none') {
    next.locomotionMode = next.sitMode;
  } else if (next.isSlidingSlope && horizSpd > 0.5) {
    next.locomotionMode = 'slide';
  } else if (next.isInShallowWater && horizSpd > 0.15) {
    next.locomotionMode = 'wade';
  } else if (horizSpd > 5.8) {
    next.locomotionMode = 'run';
  } else if (horizSpd > 0.18) {
    next.locomotionMode = 'walk';
  } else {
    next.locomotionMode = 'idle';
  }

  // Pitch tilt when flying or diving
  if (!next.grounded) {
    const targetPitch = next.isDiving
      ? -0.78
      : Math.max(-0.45, Math.min(0.45, -next.vy * 0.04));
    next.pitch += (targetPitch - next.pitch) * (1 - Math.exp(-9 * dt));
  } else {
    next.pitch *= Math.exp(-10 * dt);
  }

  // Shelter & Light Source checks (Central Shrine, Northern Temple, Candle Clusters, Glowing Plants, Realm Mushroom/Ruin Shelters, Continental Hubs, Companion, or Brazier/Umbrella)
  const nearCenterShrine = radialDist < 10.5;
  const nearNorthernTemple = Math.hypot(next.x, next.z + 48) < 11.5;
  const nearCandleOrBloom =
    Boolean(input.nearLitCandle) ||
    PRAIRIE_CFG.candleClusters.some((c) => Math.hypot(next.x - c.x, next.z - c.z) < 3.8) ||
    PRAIRIE_CFG.lightBlooms.some((b) => Math.hypot(next.x - b.x, next.z - b.z) < 4.0);
  const nearRealmShelter = isInRealmShelterAt(realmId, next.x, next.z);
  const nearOuterSanctuary = ((STAGE12_CFG?.outerSanctuaries || []) as { x: number; z: number; radius: number }[]).some(
    (s) => Math.hypot(next.x - s.x, next.z - s.z) < (s.radius || 14.0) * 0.75
  );
  const nearContinentalHub = CONTINENTAL_ARCHITECTURAL_HUBS.some(
    (h) => Math.hypot(next.x - h.x, next.z - h.z) <= h.flatRadius * 0.85
  );
  const nearCandleCluster = nearCandleOrBloom || nearRealmShelter || nearOuterSanctuary || nearContinentalHub;
  const nearCloudRing = radialDist > 48;
  const hasUmbrella = loadout?.prop === 'prop_light_umbrella' || hasGoldenAegisSpell;
  if (hasGoldenAegisSpell) {
    next.isInDarkWater = false;
  }
  next.inShelter =
    nearCenterShrine ||
    nearNorthernTemple ||
    nearCandleCluster ||
    nearRealmShelter ||
    nearOuterSanctuary ||
    Boolean(hasFireBrazier || hasUmbrella);

  let energySource: EnergyChangeSource = 'none';
  let netRate = 0;

  // Environmental Hazards (Non-lethal: only drains or temporarily knocks loose Wing Energy!)
  if (next.isInDarkWater) {
    // Polluted Dark Water drains wing energy continuously; if at 0, slowly cracks tempLostWedges
    const drain = ENERGY_CFG.darkWaterDrainRatePerSec;
    next.wingEnergy = Math.max(0, next.wingEnergy - drain * dt);
    if (next.wingEnergy <= 0.01) {
      next.tempLostWedges = Math.min(
        next.maxWingWedges - 1,
        next.tempLostWedges + 0.35 * dt
      );
    }
    next.isRecharging = false;
    energySource = 'dark_water';
    netRate = -drain;
  } else if (weather === 'rain' && !next.inShelter && !next.nearCompanion) {
    // Hidden Forest Rain drains wing energy slowly when exposed
    const drain = ENERGY_CFG.darkRainDrainRatePerSec;
    next.wingEnergy = Math.max(0, next.wingEnergy - drain * dt);
    next.isRecharging = false;
    energySource = 'dark_rain';
    netRate = -drain;
  } else if (weather === 'krill_patrol') {
    // Golden Wasteland Dark Dragon (Krill / 冥龙) spotlight check
    const krill = getKrillStateAtTime(elapsed);
    const distToSpot = Math.hypot(next.x - krill.spotX, next.z - krill.spotZ);
    if (distToSpot < krill.spotRadius && !next.inShelter) {
      next.krillAlertLevel = Math.min(1.0, next.krillAlertLevel + 0.55 * dt);
      if (next.krillAlertLevel >= 1.0) {
        // Krill dive strike! Temporarily knocks loose configured wedges—never kills!
        const loss = ENERGY_CFG.krillHitEnergyLossWedges;
        next.krillAlertLevel = 0;
        next.tempLostWedges = Math.min(next.maxWingWedges - 1, next.tempLostWedges + loss);
        next.wingEnergy = Math.min(
          Math.max(0.5, next.wingEnergy - loss),
          next.maxWingWedges - next.tempLostWedges
        );
        next.vy = 5.5;
        hazardStrike = 'krill';
        energySource = 'krill_strike';
        netRate = -loss;
      }
    } else {
      next.krillAlertLevel = Math.max(0, next.krillAlertLevel - 0.85 * dt);
    }
  } else if (weather === 'eden_storm' && !next.inShelter) {
    // Eye of Eden periodic red storm gust
    const gustWave = Math.sin(elapsed * 1.6);
    if (gustWave > 0.78) {
      next.wingEnergy = Math.max(0, next.wingEnergy - 0.55 * dt);
      next.vz += 2.2 * dt; // Headwind push
      energySource = 'eden_storm';
      netRate = -0.55;
    }
  } else {
    next.krillAlertLevel = Math.max(0, next.krillAlertLevel - dt);
  }

  // Passive Wing Energy & Temporary Lost Wedge Recharge (when not actively draining in dark water or rain)
  const canRechargeNow =
    !next.isInDarkWater &&
    (next.inShelter ||
      next.nearCompanion ||
      inWindCorridor ||
      nearCloudRing ||
      hasRainbowTrailSpell ||
      hasGoldenAegisSpell ||
      (next.grounded && weather !== 'rain' && weather !== 'eden_storm'));
  next.isRecharging = canRechargeNow;

  if (canRechargeNow) {
    if (next.tempLostWedges > 0 && (next.inShelter || next.nearCompanion || hasGoldenAegisSpell)) {
      // Recover temporarily lost wedges when standing near a shrine/light source or companion!
      next.tempLostWedges = Math.max(
        0,
        next.tempLostWedges - ENERGY_CFG.tempLostWedgeRecoveryRatePerSec * dt
      );
    }
    const currentCap = Math.max(
      1,
      next.maxWingWedges + aegisBonusWedges - next.tempLostWedges
    );
    let rechargeRate = ENERGY_CFG.groundRechargeRatePerSec;
    if (nearCandleCluster) {
      rechargeRate = ENERGY_CFG.lightSourceRechargeRatePerSec;
      energySource = 'candle_light';
    } else if (nearCenterShrine || nearNorthernTemple) {
      rechargeRate = ENERGY_CFG.lightSourceRechargeRatePerSec;
      energySource = 'shrine_light';
    } else if (next.nearCompanion) {
      rechargeRate = ENERGY_CFG.companionProximityRechargeRatePerSec;
      energySource = 'companion';
    } else if (hasFireBrazier) {
      rechargeRate = 1.6;
      energySource = 'brazier_prop';
    } else if (inWindCorridor || nearCloudRing) {
      rechargeRate = ENERGY_CFG.windTunnelRechargeRatePerSec;
      energySource = 'wind_cloud';
    } else {
      rechargeRate = ENERGY_CFG.groundRechargeRatePerSec;
      energySource = 'ground';
    }
    if (hasRainbowTrailSpell || hasGoldenAegisSpell) {
      rechargeRate *= 1.35;
    }
    netRate = rechargeRate;
    next.wingEnergy = Math.min(currentCap, next.wingEnergy + rechargeRate * dt);
  }

  next.energyChangeSource = energySource;
  next.netEnergyRatePerSec = netRate;

  return { nextState: next, didFlap, didLand, hazardStrike };
}

export function findNearestInteractable(
  px: number,
  py: number,
  pz: number,
  interactables: WorldInteractable[]
): WorldInteractable | null {
  let best: WorldInteractable | null = null;
  let bestDist = Infinity;

  for (const item of interactables) {
    const isReusable =
      item.type === 'temple_altar' ||
      item.type === 'rain_shelter' ||
      item.type === 'starlight_elevator' ||
      item.type === 'easter_egg';
    if (item.activated && !isReusable) continue;
    const dx = item.x - px;
    const dy = item.y - py;
    const dz = item.z - pz;
    const dist = Math.sqrt(dx * dx + dy * dy * 0.5 + dz * dz);
    if (dist <= item.radius && dist < bestDist) {
      bestDist = dist;
      best = item;
    }
  }
  return best;
}

export function applyInteraction(
  target: WorldInteractable,
  progress: GameProgressState,
  physics: PlayerPhysicsState,
  loadout?: EquippedLoadout
): {
  nextProgress: GameProgressState;
  nextPhysics: PlayerPhysicsState;
  updatedTarget: WorldInteractable;
  ascendedAtTemple: boolean;
  bannerMessage: string;
} {
  const nextProgress: GameProgressState = {
    ...progress,
    awakenedSpirits: [...progress.awakenedSpirits],
  };
  const nextPhysics: PlayerPhysicsState = { ...physics, tempLostWedges: 0 };
  const updatedTarget: WorldInteractable = { ...target, activated: true };
  let ascendedAtTemple = false;
  let bannerMessage = '';

  if (
    target.type === 'candle_cluster' ||
    target.type === 'light_bloom' ||
    target.type === 'dark_plant'
  ) {
    const waxGain = target.waxReward ?? 45;
    const totalWax = nextProgress.wax + waxGain;
    const forgedCandles = Math.floor(totalWax / 100);
    nextProgress.candles += forgedCandles;
    nextProgress.wax = totalWax % 100;
    nextProgress.litCandlesCount += 1;
    nextPhysics.wingEnergy = nextPhysics.maxWingWedges;
    bannerMessage =
      target.type === 'dark_plant'
        ? `已用烛火净化「${target.name}」· 释放纯净星光 +${waxGain} 滴烛火，翼能已回满！`
        : target.type === 'light_bloom'
          ? `共鸣绽放发光植物「${target.name}」· 金蝶飞舞 +${waxGain} 滴烛火，斗篷能量已瞬间回满！`
          : forgedCandles > 0
            ? `点燃「${target.name}」· 合成 +${forgedCandles} 根白蜡烛，光之翼能量已充满！`
            : `点燃「${target.name}」· 收集 +${waxGain} 滴烛火，光之翼能量已充满！`;
  } else if (target.type === 'winged_light') {
    nextProgress.wingedLights += 1;
    const newMaxWedges = calculateWingWedges(nextProgress.wingedLights, loadout);
    const leveledUp = newMaxWedges > nextPhysics.maxWingWedges;
    nextPhysics.maxWingWedges = newMaxWedges;
    nextPhysics.wingEnergy = newMaxWedges;
    bannerMessage = leveledUp
      ? `吸收「${target.name}」· 光之翼晋升至 ${newMaxWedges} 翼星阶！`
      : `吸收「${target.name}」· 永久光之翼 +1 (当前 ${nextProgress.wingedLights} 个)`;
  } else if (target.type === 'ancestor_spirit') {
    nextProgress.hearts += 1;
    nextProgress.ascendedCandles += 2;
    if (target.emoteUnlocked && !nextProgress.awakenedSpirits.includes(target.emoteUnlocked)) {
      nextProgress.awakenedSpirits.push(target.emoteUnlocked);
    }
    nextPhysics.wingEnergy = nextPhysics.maxWingWedges;
    bannerMessage = `重温先祖记忆「${target.name}」· 已加入星盘，获得 +1 爱心 & +2 升华红蜡烛！`;
  } else if (target.type === 'rain_shelter') {
    nextPhysics.wingEnergy = nextPhysics.maxWingWedges;
    nextPhysics.inShelter = true;
    if (nextProgress.currentRealm === 'forest') {
      const floatVy = REALMS_STAGE8_CFG?.forest?.jellyfishFloatBoostVy || 9.4;
      nextPhysics.vy = floatVy;
      nextPhysics.grounded = false;
      nextPhysics.locomotionMode = 'fly';
      bannerMessage = `☂️ 已在「${target.name}」避雨回满翼能，并借荧光水母浮力跃升空中！`;
    } else {
      bannerMessage = `🛡️ 已进入掩体「${target.name}」· 阻断冥龙红光锁定并修复全部受损翼格！`;
    }
  } else if (target.type === 'race_ring') {
    const waxGain = target.waxReward ?? 45;
    const totalWax = nextProgress.wax + waxGain;
    const forgedCandles = Math.floor(totalWax / 100);
    nextProgress.candles += forgedCandles;
    nextProgress.wax = totalWax % 100;
    nextPhysics.wingEnergy = nextPhysics.maxWingWedges;
    const boostSpeed = REALMS_STAGE8_CFG?.valley?.raceRingBoostSpeed || 13.8;
    if (target.id.includes('hub_east_race_ring')) {
      nextPhysics.vx = boostSpeed;
      nextPhysics.vz = 0;
      nextPhysics.yaw = Math.PI * 0.5;
    } else {
      nextPhysics.vz = -boostSpeed;
      nextPhysics.yaw = Math.PI;
    }
    nextPhysics.vy = Math.max(nextPhysics.vy, 4.2);
    nextPhysics.grounded = false;
    nextPhysics.flightMode = 'glide';
    bannerMessage = `🏁 穿过「${target.name}」· 触发霞谷流光冲刺 (${boostSpeed}m/s) +${waxGain} 滴烛火，斗篷能量已回满！`;
  } else if (target.type === 'dark_crab') {
    const waxGain = target.waxReward ?? 40;
    const totalWax = nextProgress.wax + waxGain;
    nextProgress.candles += Math.floor(totalWax / 100);
    nextProgress.wax = totalWax % 100;
    nextPhysics.wingEnergy = nextPhysics.maxWingWedges;
    updatedTarget.flipped = true;
    bannerMessage = target.flipped
      ? `🦀 已安抚并净化四脚朝天的「${target.name}」· 获得 +${waxGain} 滴烛火，翼能回满！`
      : `🦀 心火共鸣掀翻并净化「${target.name}」（长按 [Q] 深呼唤可大范围震翻暗蟹）· +${waxGain} 滴烛火！`;
  } else if (target.type === 'coop_door') {
    const waxGain = target.waxReward ?? 65;
    const totalWax = nextProgress.wax + waxGain;
    nextProgress.candles += Math.floor(totalWax / 100);
    nextProgress.wax = totalWax % 100;
    nextPhysics.wingEnergy = nextPhysics.maxWingWedges;
    bannerMessage = `🚪 已与同伴协力点亮「${target.name}」双人星芒机关 · 秘库大门开启 (+${waxGain} 滴烛火 & 解锁星河悬浮台)！`;
  } else if (target.type === 'starlight_elevator') {
    const baseTargetY =
      REALMS_STAGE8_CFG?.vault?.starlightElevator?.targetAltitudeY || 13.5;
    const localFloor = Math.max(
      groundHeightAt(target.x, target.z),
      groundHeightAt(nextPhysics.x, nextPhysics.z)
    );
    const targetY = Math.max(baseTargetY, Number((localFloor + 12.0).toFixed(1)));
    nextPhysics.y = targetY;
    nextPhysics.vy = 3.5;
    nextPhysics.grounded = false;
    nextPhysics.flightMode = 'hover';
    nextPhysics.locomotionMode = 'fly';
    nextPhysics.wingEnergy = nextPhysics.maxWingWedges;
    bannerMessage = `🌌 「${target.name}」已吟唱升空 · 托举旅人直达高层星河浮台 (高度 ${targetY}m)！`;
  } else if (target.type === 'eden_statue') {
    const acGain = REALMS_STAGE8_CFG?.eden?.ascendedCandlesPerStatue || 1;
    nextProgress.wingedLights = Math.max(1, nextProgress.wingedLights - 1);
    nextProgress.ascendedCandles += acGain;
    const newMaxWedges = calculateWingWedges(nextProgress.wingedLights, loadout);
    nextPhysics.maxWingWedges = newMaxWedges;
    nextPhysics.wingEnergy = newMaxWedges;
    bannerMessage = `🕯️ 向「${target.name}」献出 1 枚光之翼 · 先祖灵魂得救，获得 +${acGain} 根伊甸升华红蜡烛！`;
  } else if (target.type === 'temple_altar') {
    if (nextProgress.currentRealm === 'eden') {
      const bonusAc = REALMS_STAGE8_CFG?.eden?.rebirthBonusAscendedCandles || 4;
      const permBuff =
        REALMS_STAGE8_CFG?.eden?.rebirthPermanentWingBuffBonus || 1;
      nextProgress.candles += 5;
      nextProgress.hearts += 3;
      nextProgress.ascendedCandles += bonusAc;
      // Restore sacrificed Winged Lights and grant +1 Permanent Wing Buff!
      nextProgress.wingedLights = Math.max(21, nextProgress.wingedLights + 4 + permBuff);
      const rebornWedges = calculateWingWedges(nextProgress.wingedLights, loadout);
      nextPhysics.maxWingWedges = rebornWedges;
      nextPhysics.wingEnergy = rebornWedges;
      nextPhysics.tempLostWedges = 0;
      ascendedAtTemple = true;
      bannerMessage = `✨ 完成「${target.name}」星河涅槃重生！获赐 +${bonusAc} 升华红蜡烛与永久光之翼加成 (当前 ${nextProgress.wingedLights} 小金人 · ${rebornWedges} 翼)！`;
    } else {
      nextProgress.candles += 3;
      nextProgress.hearts += 2;
      nextProgress.ascendedCandles += 4;
      ascendedAtTemple = true;
      bannerMessage = `点亮「${target.name}」· 星门开启，祈福升华仪式达成！`;
    }
  } else if (target.type === 'easter_egg') {
    const waxGain = target.waxReward ?? 60;
    const totalWax = nextProgress.wax + waxGain;
    const forgedCandles = Math.floor(totalWax / 100);
    nextProgress.candles += forgedCandles;
    nextProgress.wax = totalWax % 100;

    if (!target.activated) {
      nextProgress.candles += target.candlesBonus || 0;
      nextProgress.hearts += target.heartsBonus || 0;
      nextProgress.ascendedCandles += target.ascendedCandlesBonus || 0;
      if (target.wingedLightBonus && target.wingedLightBonus > 0) {
        nextProgress.wingedLights += target.wingedLightBonus;
      }
    }

    const updatedMaxWedges = calculateWingWedges(nextProgress.wingedLights, loadout);
    nextPhysics.maxWingWedges = updatedMaxWedges;
    nextPhysics.wingEnergy = updatedMaxWedges;

    if (target.launchVy && target.launchVy > 0) {
      nextPhysics.vy = target.launchVy;
      nextPhysics.grounded = false;
      nextPhysics.flightMode = 'glide';
      nextPhysics.locomotionMode = 'fly';
    }

    bannerMessage = `🎉 触发彩蛋「${target.name}」！${target.loreText || target.subtitle}`;
  }

  return {
    nextProgress,
    nextPhysics,
    updatedTarget,
    ascendedAtTemple,
    bannerMessage,
  };
}

// 15-Key Sky Pentatonic / Major Scale Note Frequencies (C4 to C6)
export interface SkyMusicNote {
  index: number;
  label: string;
  solfege: string;
  keyShortcut: string;
  freq: number;
  shape: 'circle' | 'diamond' | 'root';
}

export const SKY_15_NOTES: SkyMusicNote[] = [
  { index: 0, label: 'C4', solfege: 'Do', keyShortcut: '1', freq: 261.63, shape: 'root' },
  { index: 1, label: 'D4', solfege: 'Re', keyShortcut: '2', freq: 293.66, shape: 'circle' },
  { index: 2, label: 'E4', solfege: 'Mi', keyShortcut: '3', freq: 329.63, shape: 'diamond' },
  { index: 3, label: 'F4', solfege: 'Fa', keyShortcut: '4', freq: 349.23, shape: 'circle' },
  { index: 4, label: 'G4', solfege: 'Sol', keyShortcut: '5', freq: 392.0, shape: 'diamond' },

  { index: 5, label: 'A4', solfege: 'La', keyShortcut: 'Y', freq: 440.0, shape: 'circle' },
  { index: 6, label: 'B4', solfege: 'Ti', keyShortcut: 'U', freq: 493.88, shape: 'circle' },
  { index: 7, label: 'C5', solfege: 'Do⁺', keyShortcut: 'I', freq: 523.25, shape: 'root' },
  { index: 8, label: 'D5', solfege: 'Re⁺', keyShortcut: 'O', freq: 587.33, shape: 'circle' },
  { index: 9, label: 'E5', solfege: 'Mi⁺', keyShortcut: 'P', freq: 659.25, shape: 'diamond' },

  { index: 10, label: 'F5', solfege: 'Fa⁺', keyShortcut: 'H', freq: 698.46, shape: 'circle' },
  { index: 11, label: 'G5', solfege: 'Sol⁺', keyShortcut: 'J', freq: 783.99, shape: 'diamond' },
  { index: 12, label: 'A5', solfege: 'La⁺', keyShortcut: 'K', freq: 880.0, shape: 'circle' },
  { index: 13, label: 'B5', solfege: 'Ti⁺', keyShortcut: 'L', freq: 987.77, shape: 'circle' },
  { index: 14, label: 'C6', solfege: 'Do²⁺', keyShortcut: ';', freq: 1046.5, shape: 'root' },
];

export type SkyInstrumentVoiceId =
  | 'piano'
  | 'harp'
  | 'flute'
  | 'xylophone'
  | 'wind_chime'
  | 'music_box'
  | 'drum'
  | 'kalimba';

export interface SkyInstrumentVoiceMeta {
  id: SkyInstrumentVoiceId;
  label: string;
  icon: string;
  timbreTag: string;
  companionVoice: SkyInstrumentVoiceId;
}

export const SKY_INSTRUMENT_VOICES: SkyInstrumentVoiceMeta[] = [
  {
    id: 'piano',
    label: '🎹 水晶钢琴',
    icon: '🎹',
    timbreTag: '清澈泛音 · 经典高音钢琴',
    companionVoice: 'harp',
  },
  {
    id: 'harp',
    label: '🪕 黄金竖琴',
    icon: '🪕',
    timbreTag: '温润拨弦 · 云野先祖圣琴',
    companionVoice: 'flute',
  },
  {
    id: 'flute',
    label: '🪈 星语长笛',
    icon: '🪈',
    timbreTag: '悠扬气鸣 · 柔美颤音木管',
    companionVoice: 'harp',
  },
  {
    id: 'xylophone',
    label: '🎼 森灵木琴',
    icon: '🎼',
    timbreTag: '清脆木槌 · 雨林空谷马林巴',
    companionVoice: 'kalimba',
  },
  {
    id: 'wind_chime',
    label: '🎐 云端风铃',
    icon: '🎐',
    timbreTag: '空灵晶簇 · 风行赛道琉璃铃',
    companionVoice: 'flute',
  },
  {
    id: 'music_box',
    label: '🎠 星河八音盒',
    icon: '🎠',
    timbreTag: '梦幻银簧 · 禁阁星光音乐盒',
    companionVoice: 'harp',
  },
  {
    id: 'drum',
    label: '🥁 部落星鼓',
    icon: '🥁',
    timbreTag: '浑厚律动 · 预言山谷节拍鼓',
    companionVoice: 'xylophone',
  },
  {
    id: 'kalimba',
    label: '🔔 拇指琴',
    icon: '🔔',
    timbreTag: '玲珑金属 · 温暖篝火伴奏琴',
    companionVoice: 'piano',
  },
];

export interface EnsemblePracticeStep {
  leadKeyIndex: number; // 0..14 player target key
  harmonyKeyIndex: number; // 0..14 automatic spirit companion accompaniment key
  beatMs: number; // duration in ms before next note in auto-demo or rhythm guide
  lyricHint?: string;
}

export interface EnsemblePracticeSong {
  id: string;
  title: string;
  subtitle: string;
  difficulty: '入门 ★☆☆' | '进阶 ★★☆' | '大师 ★★★';
  bpm: number;
  recommendedVoice: SkyInstrumentVoiceId;
  companionVoice: SkyInstrumentVoiceId;
  steps: EnsemblePracticeStep[];
}

export const SKY_ENSEMBLE_PRACTICE_SONGS: EnsemblePracticeSong[] = [
  {
    id: 'song_prairie_starlight',
    title: '《云野星光曲 · 迎风序章》',
    subtitle: '新手首选 · 先祖竖琴自动伴奏和弦，跟随高亮键位轻松合奏',
    difficulty: '入门 ★☆☆',
    bpm: 96,
    recommendedVoice: 'flute',
    companionVoice: 'harp',
    steps: [
      { leadKeyIndex: 4, harmonyKeyIndex: 0, beatMs: 380, lyricHint: '微风起' },
      { leadKeyIndex: 7, harmonyKeyIndex: 2, beatMs: 380, lyricHint: '越云海' },
      { leadKeyIndex: 9, harmonyKeyIndex: 4, beatMs: 380, lyricHint: '听钟鸣' },
      { leadKeyIndex: 11, harmonyKeyIndex: 7, beatMs: 520, lyricHint: '展金翼' },
      { leadKeyIndex: 9, harmonyKeyIndex: 4, beatMs: 380, lyricHint: '掠晴空' },
      { leadKeyIndex: 7, harmonyKeyIndex: 2, beatMs: 480, lyricHint: '伴蝶舞' },
      { leadKeyIndex: 8, harmonyKeyIndex: 4, beatMs: 380, lyricHint: '拾星火' },
      { leadKeyIndex: 9, harmonyKeyIndex: 5, beatMs: 380, lyricHint: '唤同伴' },
      { leadKeyIndex: 7, harmonyKeyIndex: 0, beatMs: 600, lyricHint: '共翱翔' },
    ],
  },
  {
    id: 'song_forest_xylophone_rain',
    title: '《雨林空谷 · 木琴听雨》',
    subtitle: '专为木琴与风铃定制的治愈五声旋律 · 荧光水母低音和鸣',
    difficulty: '入门 ★☆☆',
    bpm: 92,
    recommendedVoice: 'xylophone',
    companionVoice: 'wind_chime',
    steps: [
      { leadKeyIndex: 7, harmonyKeyIndex: 0, beatMs: 400, lyricHint: '雨滴落' },
      { leadKeyIndex: 8, harmonyKeyIndex: 1, beatMs: 400, lyricHint: '竹林翠' },
      { leadKeyIndex: 9, harmonyKeyIndex: 2, beatMs: 480, lyricHint: '伞菇明' },
      { leadKeyIndex: 11, harmonyKeyIndex: 4, beatMs: 480, lyricHint: '溪流缓' },
      { leadKeyIndex: 12, harmonyKeyIndex: 5, beatMs: 400, lyricHint: '白鸟飞' },
      { leadKeyIndex: 11, harmonyKeyIndex: 4, beatMs: 400, lyricHint: '穿云雾' },
      { leadKeyIndex: 9, harmonyKeyIndex: 2, beatMs: 440, lyricHint: '见虹桥' },
      { leadKeyIndex: 7, harmonyKeyIndex: 0, beatMs: 600, lyricHint: '心火暖' },
    ],
  },
  {
    id: 'song_vault_chime_lullaby',
    title: '《星河小夜曲 · 禁阁风铃》',
    subtitle: '高音区风铃与八音盒双声部交织 · 舒缓节拍零压力跟弹',
    difficulty: '进阶 ★★☆',
    bpm: 86,
    recommendedVoice: 'wind_chime',
    companionVoice: 'music_box',
    steps: [
      { leadKeyIndex: 7, harmonyKeyIndex: 4, beatMs: 420, lyricHint: '星河转' },
      { leadKeyIndex: 11, harmonyKeyIndex: 7, beatMs: 420, lyricHint: '浮石升' },
      { leadKeyIndex: 10, harmonyKeyIndex: 5, beatMs: 420, lyricHint: '灯塔明' },
      { leadKeyIndex: 9, harmonyKeyIndex: 4, beatMs: 520, lyricHint: '遥鲲吟' },
      { leadKeyIndex: 8, harmonyKeyIndex: 3, beatMs: 420, lyricHint: '越星门' },
      { leadKeyIndex: 7, harmonyKeyIndex: 2, beatMs: 420, lyricHint: '揽月华' },
      { leadKeyIndex: 8, harmonyKeyIndex: 4, beatMs: 420, lyricHint: '化流光' },
      { leadKeyIndex: 9, harmonyKeyIndex: 4, beatMs: 420, lyricHint: '归静谧' },
      { leadKeyIndex: 11, harmonyKeyIndex: 7, beatMs: 420, lyricHint: '礼长老' },
      { leadKeyIndex: 14, harmonyKeyIndex: 7, beatMs: 640, lyricHint: '耀苍穹' },
    ],
  },
  {
    id: 'song_valley_sunset_symphony',
    title: '《飞翔之歌 · 霞谷凯旋交响》',
    subtitle: '长笛主旋律配黄金竖琴琶音 · 体验千人竞技场高燃合奏',
    difficulty: '大师 ★★★',
    bpm: 116,
    recommendedVoice: 'piano',
    companionVoice: 'harp',
    steps: [
      { leadKeyIndex: 0, harmonyKeyIndex: 4, beatMs: 320, lyricHint: '滑道启' },
      { leadKeyIndex: 2, harmonyKeyIndex: 7, beatMs: 320, lyricHint: '乘疾风' },
      { leadKeyIndex: 4, harmonyKeyIndex: 9, beatMs: 320, lyricHint: '跃冰湖' },
      { leadKeyIndex: 7, harmonyKeyIndex: 4, beatMs: 420, lyricHint: '穿金环' },
      { leadKeyIndex: 9, harmonyKeyIndex: 5, beatMs: 320, lyricHint: '入云霄' },
      { leadKeyIndex: 11, harmonyKeyIndex: 7, beatMs: 320, lyricHint: '沐晚霞' },
      { leadKeyIndex: 12, harmonyKeyIndex: 9, beatMs: 420, lyricHint: '伴千鸟' },
      { leadKeyIndex: 11, harmonyKeyIndex: 7, beatMs: 320, lyricHint: '越双塔' },
      { leadKeyIndex: 9, harmonyKeyIndex: 4, beatMs: 320, lyricHint: '聚星盘' },
      { leadKeyIndex: 14, harmonyKeyIndex: 7, beatMs: 620, lyricHint: '凯旋归' },
    ],
  },
];

export interface EnsemblePracticeState {
  active: boolean;
  songId: string;
  stepIndex: number;
  totalSteps: number;
  combo: number;
  maxCombo: number;
  hits: number;
  misses: number;
  anyKeyAssist: boolean; // Beginner assist: pressing any key or clicking "跟弹下一音" plays the right target note
  autoAccompanyPlay: boolean; // Automatic Spirit Ensemble pacing mode
  completed: boolean;
  rating: 'S' | 'A' | 'B' | null;
}

export function evaluateEnsembleAccuracyRatingPure(
  hits: number,
  misses: number
): 'S' | 'A' | 'B' {
  const total = Math.max(1, hits + misses);
  const acc = hits / total;
  if (acc >= 0.9) return 'S';
  if (acc >= 0.72) return 'A';
  return 'B';
}

export function createInitialEnsemblePracticeStatePure(
  songId = SKY_ENSEMBLE_PRACTICE_SONGS[0].id,
  anyKeyAssist = true
): EnsemblePracticeState {
  const song =
    SKY_ENSEMBLE_PRACTICE_SONGS.find((s) => s.id === songId) ||
    SKY_ENSEMBLE_PRACTICE_SONGS[0];
  return {
    active: false,
    songId: song.id,
    stepIndex: 0,
    totalSteps: song.steps.length,
    combo: 0,
    maxCombo: 0,
    hits: 0,
    misses: 0,
    anyKeyAssist,
    autoAccompanyPlay: false,
    completed: false,
    rating: null,
  };
}

export interface EnsemblePracticeStepResult {
  nextState: EnsemblePracticeState;
  isCorrect: boolean;
  resolvedLeadKeyIndex: number;
  harmonyKeyIndex: number;
  companionVoice: SkyInstrumentVoiceId;
  justCompleted: boolean;
  accuracyPercent: number;
}

/**
 * Pure state transition for the Auto-Ensemble Practice Mode (自动合奏练习模式).
 * - When `state.anyKeyAssist` or `forceCorrectAssist` is true, beginners always hit the target lead note
 *   while the Spirit Ensemble companion simultaneously plays `harmonyKeyIndex`!
 * - When `state.anyKeyAssist` is false (strict practice), only pressing `targetStep.leadKeyIndex` advances the step.
 */
export function stepEnsemblePracticeNotePure(
  state: EnsemblePracticeState,
  playedKeyIndex: number,
  forceCorrectAssist = false
): EnsemblePracticeStepResult {
  const song =
    SKY_ENSEMBLE_PRACTICE_SONGS.find((s) => s.id === state.songId) ||
    SKY_ENSEMBLE_PRACTICE_SONGS[0];
  const safeIdx = Math.max(0, Math.min(song.steps.length - 1, state.stepIndex));
  const currentStep = song.steps[safeIdx];

  const useAssist = state.anyKeyAssist || forceCorrectAssist;
  const isMatch = useAssist || playedKeyIndex === currentStep.leadKeyIndex;

  if (!isMatch) {
    const nextMisses = state.misses + 1;
    const total = Math.max(1, state.hits + nextMisses);
    return {
      nextState: {
        ...state,
        combo: 0,
        misses: nextMisses,
      },
      isCorrect: false,
      resolvedLeadKeyIndex: Math.max(0, Math.min(14, playedKeyIndex)),
      harmonyKeyIndex: currentStep.harmonyKeyIndex,
      companionVoice: song.companionVoice,
      justCompleted: false,
      accuracyPercent: Math.round((state.hits / total) * 100),
    };
  }

  const nextHits = state.hits + 1;
  const nextCombo = state.combo + 1;
  const nextMaxCombo = Math.max(state.maxCombo, nextCombo);
  const nextStepIndex = safeIdx + 1;
  const justCompleted = nextStepIndex >= song.steps.length;
  const total = Math.max(1, nextHits + state.misses);
  const accuracyPercent = Math.round((nextHits / total) * 100);
  const rating = justCompleted
    ? evaluateEnsembleAccuracyRatingPure(nextHits, state.misses)
    : state.rating;

  return {
    nextState: {
      ...state,
      stepIndex: justCompleted ? 0 : nextStepIndex,
      totalSteps: song.steps.length,
      combo: nextCombo,
      maxCombo: nextMaxCombo,
      hits: nextHits,
      completed: justCompleted,
      autoAccompanyPlay: justCompleted ? false : state.autoAccompanyPlay,
      rating,
    },
    isCorrect: true,
    resolvedLeadKeyIndex: currentStep.leadKeyIndex,
    harmonyKeyIndex: currentStep.harmonyKeyIndex,
    companionVoice: song.companionVoice,
    justCompleted,
    accuracyPercent,
  };
}


// ============================================================================
// Stage 6: Multiplayer Base Pure Functions (8-Player Room Matchmaking,
// Server-Authoritative Anti-Cheat, Client Interpolation + Dead-Reckoning
// Extrapolation, and Bot Traveler AI State Machine)
// ============================================================================

export type BotAiMode = 'patrol' | 'follow' | 'gather';

export interface RoomAssignmentResult {
  roomId: string;
  maxCapacity: number;
  memberCount: number;
  isNewRoom: boolean;
  updatedRooms: Record<string, string[]>;
}

/**
 * Stage 6 Pure Function: Assigns a player to an existing or newly created room instance
 * enforcing the 8-player cap per realm room (or 16-player cap for 'home' Aviary Camp).
 */
export function assignRoomInstancePure(
  existingRooms: Record<string, string[]>,
  realmId: string,
  playerId: string,
  preferredRoomId?: string,
  forceNewInstance = false
): RoomAssignmentResult {
  const maxCapacity =
    realmId === 'home'
      ? NETWORK_CFG?.maxCampPlayers || 16
      : NETWORK_CFG?.maxRoomPlayers || 8;

  const updatedRooms: Record<string, string[]> = {};
  for (const [rId, members] of Object.entries(existingRooms)) {
    const filtered = members.filter((id) => id !== playerId);
    if (filtered.length > 0) {
      updatedRooms[rId] = filtered;
    }
  }

  if (!forceNewInstance) {
    if (preferredRoomId && updatedRooms[preferredRoomId]) {
      if (updatedRooms[preferredRoomId].length < maxCapacity) {
        updatedRooms[preferredRoomId] = [...updatedRooms[preferredRoomId], playerId];
        return {
          roomId: preferredRoomId,
          maxCapacity,
          memberCount: updatedRooms[preferredRoomId].length,
          isNewRoom: false,
          updatedRooms,
        };
      }
    }

    for (const [rId, members] of Object.entries(updatedRooms)) {
      if (rId.startsWith(`${realmId}_inst_`) && members.length < maxCapacity) {
        updatedRooms[rId] = [...members, playerId];
        return {
          roomId: rId,
          maxCapacity,
          memberCount: updatedRooms[rId].length,
          isNewRoom: false,
          updatedRooms,
        };
      }
    }
  }

  let idx = 1;
  while (updatedRooms[`${realmId}_inst_${idx}`]) {
    idx++;
  }
  const newRoomId = `${realmId}_inst_${idx}`;
  updatedRooms[newRoomId] = [playerId];
  return {
    roomId: newRoomId,
    maxCapacity,
    memberCount: 1,
    isNewRoom: true,
    updatedRooms,
  };
}

export interface AuthorityTransformValidation {
  accepted: boolean;
  clampedX: number;
  clampedY: number;
  clampedZ: number;
  speedMps: number;
}

/**
 * Stage 6 Pure Function: Server-authoritative movement speed validator.
 * Rejects/clamps anomalous teleport speed spikes above maxAuthoritySpeedMps (28 m/s)
 * while permitting intentional Shrine reset at (0, *, 6).
 */
export function validateServerAuthorityTransformPure(
  prev: { x: number; y: number; z: number },
  next: { x: number; y: number; z: number },
  dtSec: number,
  maxSpeedMps: number = NETWORK_CFG?.maxAuthoritySpeedMps || 28.0
): AuthorityTransformValidation {
  const safeDt = Math.max(0.01, dtSec);
  const dx = next.x - prev.x;
  const dy = next.y - prev.y;
  const dz = next.z - prev.z;
  const dist = Math.hypot(dx, dy, dz);
  const speedMps = dist / safeDt;
  const isShrineReset = Math.hypot(next.x, next.z - 6) < 2.5;

  if (speedMps <= maxSpeedMps || isShrineReset || safeDt > 1.2) {
    return {
      accepted: true,
      clampedX: next.x,
      clampedY: next.y,
      clampedZ: next.z,
      speedMps,
    };
  }

  const maxStep = maxSpeedMps * safeDt;
  const ratio = dist > 0.0001 ? maxStep / dist : 0;
  return {
    accepted: false,
    clampedX: Number((prev.x + dx * ratio).toFixed(3)),
    clampedY: Number((prev.y + dy * ratio).toFixed(3)),
    clampedZ: Number((prev.z + dz * ratio).toFixed(3)),
    speedMps,
  };
}

/**
 * Stage 6 Pure Function: Client-side remote peer interpolation + velocity dead-reckoning
 * extrapolation + shortest-arc angular yaw interpolation.
 */
export function interpolateAndExtrapolatePeerPure(
  current: { x: number; y: number; z: number; yaw: number },
  target: {
    x: number;
    y: number;
    z: number;
    vx?: number;
    vy?: number;
    vz?: number;
    yaw: number;
  },
  dtSec: number,
  packetAgeSec = 0,
  interpLambda: number = NETWORK_CFG?.interpolationLambda || 12.0,
  maxExtrapSec: number = NETWORK_CFG?.extrapolationMaxSec || 0.25
): { x: number; y: number; z: number; yaw: number } {
  const safeDt = Math.min(Math.max(dtSec, 0.001), 0.1);
  const extrapT = Math.min(Math.max(0, packetAgeSec), maxExtrapSec);
  const vx = target.vx || 0;
  const vy = target.vy || 0;
  const vz = target.vz || 0;

  const predictedX = target.x + vx * extrapT;
  const predictedY = target.y + vy * extrapT;
  const predictedZ = target.z + vz * extrapT;

  const alpha = 1 - Math.exp(-interpLambda * safeDt);
  const nextX = current.x + (predictedX - current.x) * alpha;
  const nextY = current.y + (predictedY - current.y) * alpha;
  const nextZ = current.z + (predictedZ - current.z) * alpha;

  // Shortest-arc yaw interpolation via atan2(sin, cos)
  const diffYaw = Math.atan2(
    Math.sin(target.yaw - current.yaw),
    Math.cos(target.yaw - current.yaw)
  );
  const nextYaw = current.yaw + diffYaw * alpha;

  return {
    x: nextX,
    y: nextY,
    z: nextZ,
    yaw: nextYaw,
  };
}

/**
 * Stage 6 Pure Function: Steps autonomous Bot Traveler AI ('patrol' | 'follow' | 'gather')
 * with obstacle collision avoidance and player personal-space separation.
 */
export function stepBotTravelerAiPure(
  bot: {
    playerId: string;
    x: number;
    y: number;
    z: number;
    yaw: number;
    botPhase: number;
  },
  localPlayer: { x: number; y: number; z: number; yaw: number },
  mode: BotAiMode,
  elapsed: number,
  dt: number
): { x: number; y: number; z: number; yaw: number } {
  let desiredX = bot.x;
  let desiredZ = bot.z;

  if (mode === 'follow') {
    // Follow in a friendly semi-circle behind/beside localPlayer
    const slotAngle =
      localPlayer.yaw +
      Math.PI +
      (bot.playerId === 'bot_traveller_1'
        ? -0.65
        : bot.playerId === 'bot_traveller_2'
          ? 0.65
          : 0.0);
    const followDist = 2.1;
    desiredX = localPlayer.x + Math.sin(slotAngle) * followDist;
    desiredZ = localPlayer.z + Math.cos(slotAngle) * followDist;
  } else if (mode === 'gather') {
    // Gather around the localPlayer in a tight resonance circle for ensemble/greeting
    const ringAngle = elapsed * 0.6 + bot.botPhase;
    desiredX = localPlayer.x + Math.cos(ringAngle) * 1.65;
    desiredZ = localPlayer.z + Math.sin(ringAngle) * 1.65;
  } else {
    // Default shrine patrol orbit
    const baseX =
      bot.playerId === 'bot_traveller_1'
        ? -2.4
        : bot.playerId === 'bot_traveller_2'
          ? 2.4
          : 0.0;
    const baseZ = bot.playerId === 'bot_traveller_3' ? -2.6 : 1.4;
    desiredX = baseX + Math.sin(elapsed * 0.45 + bot.botPhase) * 0.85;
    desiredZ = baseZ + Math.cos(elapsed * 0.45 + bot.botPhase) * 0.75;
  }

  // Smooth step toward desired coordinate
  const moveAlpha = 1 - Math.exp(-5.5 * Math.min(0.1, Math.max(0.001, dt)));
  let nextX = bot.x + (desiredX - bot.x) * moveAlpha;
  let nextZ = bot.z + (desiredZ - bot.z) * moveAlpha;

  // Avoid overlapping localPlayer
  const pdx = nextX - localPlayer.x;
  const pdz = nextZ - localPlayer.z;
  const pDist = Math.hypot(pdx, pdz);
  if (pDist < 0.95) {
    const push = (0.95 - pDist) / Math.max(0.001, pDist);
    nextX += pdx * push;
    nextZ += pdz * push;
  }

  const resolved = resolveObstacleCollisions(
    nextX,
    groundHeightAt(nextX, nextZ),
    nextZ,
    0.45
  );
  const dx = resolved.x - bot.x;
  const dz = resolved.z - bot.z;
  const nextY = groundHeightAt(resolved.x, resolved.z);

  let targetYaw = bot.yaw;
  if (mode === 'follow' || mode === 'gather') {
    targetYaw = Math.atan2(localPlayer.x - resolved.x, localPlayer.z - resolved.z);
  } else if (Math.hypot(dx, dz) > 0.001) {
    targetYaw = Math.atan2(dx, dz);
  }
  const yawDiff = Math.atan2(
    Math.sin(targetYaw - bot.yaw),
    Math.cos(targetYaw - bot.yaw)
  );
  const nextYaw = bot.yaw + yawDiff * (1 - Math.exp(-8 * dt));

  return {
    x: resolved.x,
    y: nextY,
    z: resolved.z,
    yaw: nextYaw,
  };
}

/**
 * Stage 8 Pure Function: Flips nearby Dark Crabs (`type === 'dark_crab'`) onto their backs
 * when hit by a Charged Deep Call (`isDeepCall === true`) within `crabFlipRadius` (default 18m).
 */
export function flipDarkCrabsWithDeepCallPure(
  px: number,
  pz: number,
  crabFlipRadius: number,
  isDeepCall: boolean,
  interactables: WorldInteractable[]
): {
  nextInteractables: WorldInteractable[];
  flippedCount: number;
} {
  if (!isDeepCall || crabFlipRadius <= 0) {
    return { nextInteractables: interactables, flippedCount: 0 };
  }

  let flippedCount = 0;
  const nextInteractables = interactables.map((item) => {
    if (item.type !== 'dark_crab' || item.activated) return item;
    const dist = Math.hypot(item.x - px, item.z - pz);
    if (dist <= crabFlipRadius) {
      flippedCount++;
      return {
        ...item,
        flipped: true,
        subtitle:
          '已震翻四脚朝天！靠近按 [E] 净化安抚 (+40 滴烛火 & 回复斗篷翼能)',
      };
    }
    return item;
  });

  return { nextInteractables, flippedCount };
}

