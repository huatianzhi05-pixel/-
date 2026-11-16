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
    skyTopColor: '#25356E',
    skyHorizonColor: '#F3A683',
    fogColor: '#EDA88A',
    fogDensity: 0.0052,
    sunColor: '#FDE8B2',
    sunIntensity: 1.95,
    hemiSkyColor: '#A5C8FA',
    hemiGroundColor: '#D48B5C',
    groundPrimaryColor: '#3D7A6E',
    groundSecondaryColor: '#629E82',
    waterColor: '#244B6B',
    cloudColor: '#FCE6C9',
    ambientNoteBase: 261.63, // C4
  },
  isle: {
    id: 'isle',
    name: '晨岛 · 初生沙洲',
    subtitle: 'Isle of Dawn · 破晓沙丘、飞翔试炼风洞与预言山谷四试炼',
    subZones: ['初生星火沙洲', '乘风起跳高台', '预言四元素洞窟', '晨曦云端神殿'],
    weather: 'wind_updraft',
    skyTopColor: '#383A7A',
    skyHorizonColor: '#F7C594',
    fogColor: '#F9DAB8',
    fogDensity: 0.0048,
    sunColor: '#FFF2CC',
    sunIntensity: 1.9,
    hemiSkyColor: '#FCE3B4',
    hemiGroundColor: '#C88A4B',
    groundPrimaryColor: '#D6A55C',
    groundSecondaryColor: '#B88442',
    waterColor: '#52A8CC',
    cloudColor: '#FFF7E8',
    ambientNoteBase: 277.18, // C#4
  },
  prairie: {
    id: 'prairie',
    name: '云野 · 圣岛浮屿',
    subtitle: 'Daylight Prairie · 蝴蝶平原、幽光洞窟与三塔钟楼村落',
    subZones: PRAIRIE_CFG.subZones.map((z) => z.name),
    weather: 'wind_updraft',
    skyTopColor: '#1E78B8',
    skyHorizonColor: '#BCE2FA',
    fogColor: '#DCF0FC',
    fogDensity: 0.0046,
    sunColor: '#FFF8E6',
    sunIntensity: 2.05,
    hemiSkyColor: '#8ED1FC',
    hemiGroundColor: '#6CC49A',
    groundPrimaryColor: '#5EB890',
    groundSecondaryColor: '#429B76',
    waterColor: '#4CB2DE',
    cloudColor: '#FFFDF8',
    ambientNoteBase: 293.66, // D4
  },
  forest: {
    id: 'forest',
    name: '雨林 · 荧光秘境',
    subtitle: 'Hidden Forest · 细雨消融光能，靠近灯柱/蘑菇亭或与旅人牵手可护火',
    subZones: ['静谧林间庭院', '荧光溪流与秘密树屋', '巨兽骸骨空地', '雨林水母神庙'],
    weather: 'rain',
    skyTopColor: '#14263B',
    skyHorizonColor: '#2A546E',
    fogColor: '#234D5E',
    fogDensity: 0.0072,
    sunColor: '#8CE9F7',
    sunIntensity: 1.55,
    hemiSkyColor: '#4AD4E8',
    hemiGroundColor: '#184E44',
    groundPrimaryColor: '#2E6E65',
    groundSecondaryColor: '#21544D',
    waterColor: '#1D6E85',
    cloudColor: '#BCEEF5',
    ambientNoteBase: 329.63, // E4
  },
  valley: {
    id: 'valley',
    name: '霞谷 · 落日千鸟城',
    subtitle: 'Valley of Triumph · 滑冰场极速漂移、飞行赛道、隐士雪峰与落日竞技场',
    subZones: ['寒霜溜冰场', '霞光飞行赛道', '云端隐士谷', '落日千鸟竞技场'],
    weather: 'ice',
    skyTopColor: '#3E2378',
    skyHorizonColor: '#F28599',
    fogColor: '#F7B2C0',
    fogDensity: 0.005,
    sunColor: '#FDE47E',
    sunIntensity: 2.05,
    hemiSkyColor: '#F08CAE',
    hemiGroundColor: '#D8ECFA',
    groundPrimaryColor: '#DCEEFB',
    groundSecondaryColor: '#E36D86',
    waterColor: '#76BEE6',
    cloudColor: '#FCE0E6',
    ambientNoteBase: 349.23, // F4
  },
  wasteland: {
    id: 'wasteland',
    name: '暮土 · 远古遗迹',
    subtitle: 'Golden Wasteland · 冥龙探照巡逻、暗黑植物与遗忘方舟，掩体躲避红光',
    subZones: ['破碎边陲荒漠', '巨兽荒原墓地', '遗忘魔法方舟', '远古守卫战场'],
    weather: 'krill_patrol',
    skyTopColor: '#0D2B24',
    skyHorizonColor: '#32826B',
    fogColor: '#216150',
    fogDensity: 0.0068,
    sunColor: '#86E5C0',
    sunIntensity: 1.6,
    hemiSkyColor: '#4CC69D',
    hemiGroundColor: '#243336',
    groundPrimaryColor: '#314446',
    groundSecondaryColor: '#26594C',
    waterColor: '#16453A',
    cloudColor: '#98D9C3',
    ambientNoteBase: 392.0, // G4
  },
  vault: {
    id: 'vault',
    name: '禁阁 · 星河浮台',
    subtitle: 'Vault of Knowledge · 星光沙漠、四人合力机关门、漂浮书库与星辰塔顶',
    subZones: ['星光沙漠花园', '双人共鸣机关门', '四层悬浮星光书库', '浩瀚星河塔顶'],
    weather: 'starlight_gravity',
    skyTopColor: '#0C102B',
    skyHorizonColor: '#383582',
    fogColor: '#25235E',
    fogDensity: 0.0056,
    sunColor: '#CAC0FA',
    sunIntensity: 1.75,
    hemiSkyColor: '#8B94F2',
    hemiGroundColor: '#232054',
    groundPrimaryColor: '#38367D',
    groundSecondaryColor: '#524FA8',
    waterColor: '#1F1E4F',
    cloudColor: '#D6DEFA',
    ambientNoteBase: 440.0, // A4
  },
  eden: {
    id: 'eden',
    name: '伊甸之眼 · 暴风祭坛',
    subtitle: 'Eye of Eden · 逆风躲避红石坠落与雷霆，点亮先祖石像完成重生升华仪式',
    subZones: ['暴风眼石门', '红石飞星坡道', '雷霆掩体长廊', '星河重生祭坛'],
    weather: 'eden_storm',
    skyTopColor: '#1C0911',
    skyHorizonColor: '#7D203B',
    fogColor: '#4E1426',
    fogDensity: 0.0078,
    sunColor: '#F48498',
    sunIntensity: 1.68,
    hemiSkyColor: '#E65C7B',
    hemiGroundColor: '#26242B',
    groundPrimaryColor: '#302C32',
    groundSecondaryColor: '#8C2845',
    waterColor: '#451221',
    cloudColor: '#EBA4B2',
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
  for (const isl of FLOATING_SKY_ISLANDS) {
    if (Math.hypot(x - isl.x, z - isl.z) <= isl.outerRadius) {
      return isl.name;
    }
  }
  for (const mural of ANCIENT_STORY_MURALS) {
    if (Math.hypot(x - mural.x, z - mural.z) <= mural.radius) {
      return mural.zoneName;
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
  landingCushionTimer: number;
  // Stage 2 Flight & Energy States
  takeoffTimer: number;
  inCloudBank: boolean;
  flightPitchPhase: 'none' | 'climb' | 'level' | 'descent' | 'dive';
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

  // 4g. Module 5 Multi-Tiered Floating Sky Islands & Aerial Stepping Stones
  for (const isl of FLOATING_SKY_ISLANDS) {
    const dIsl = Math.hypot(x - isl.x, z - isl.z);
    if (dIsl < isl.outerRadius) {
      if (dIsl <= isl.flatRadius) {
        return isl.y;
      }
      const blendT = 1 - (dIsl - isl.flatRadius) / (isl.outerRadius - isl.flatRadius);
      const smooth = blendT * blendT * (3 - 2 * blendT);
      return 0.85 + (isl.y - 0.85) * smooth;
    }
  }

  // 5. Gentle rolling meadow hills, sculpted canyon valleys & outer horizon mountain ridges across the 220m expanded continent
  const wave1 = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 1.6;
  const wave2 = Math.sin((x + z) * 0.045) * 1.1;
  const edgeLift = dist > 52 ? Math.min(12.5, (dist - 52) * 0.12) : 0;

  // Sculpted outer mountain ridges & scenic horizon peaks beyond 128m (preserving all inner/mid landmarks)
  const mountainRidgeLift =
    dist > 128
      ? Math.max(
          0,
          Math.sin(Math.atan2(z, x) * 7.0 + dist * 0.035) *
            Math.min(9.5, (dist - 128) * 0.14)
        )
      : 0;

  return Math.max(-0.4, 0.35 + wave1 + wave2 + edgeLift + mountainRidgeLift);
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

export interface FloatingSkyIslandSpec {
  id: string;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  z: number;
  flatRadius: number;
  outerRadius: number;
  hasUpdraftThermal: boolean;
  hasWaterfall: boolean;
}

export const FLOATING_SKY_ISLANDS: FloatingSkyIslandSpec[] = [
  {
    id: 'island_west_step_1',
    name: '西境云阶浮岛 · 一阶微风台',
    subtitle: '连接幽光洞窟与高空云海的第一级阶梯浮岛，底部垂落发光藤蔓与上升气流',
    x: -32.0,
    y: 9.5,
    z: -28.0,
    flatRadius: 4.2,
    outerRadius: 6.5,
    hasUpdraftThermal: true,
    hasWaterfall: false,
  },
  {
    id: 'island_nw_step_2',
    name: '西北云海浮岛 · 二阶流云屿',
    subtitle: '海拔 14.8m 的中层悬空绿洲，设有远古断桥拱门与飞瀑云雾',
    x: -48.0,
    y: 14.8,
    z: -54.0,
    flatRadius: 4.8,
    outerRadius: 7.2,
    hasUpdraftThermal: true,
    hasWaterfall: true,
  },
  {
    id: 'island_celestial_observatory',
    name: '云端天星观景浮岛 · 秘境穹顶',
    subtitle: '海拔 21.5m 的最高处隐秘观星圣殿，可俯瞰整片星光大陆与远方群峰',
    x: -28.0,
    y: 21.5,
    z: -80.0,
    flatRadius: 6.2,
    outerRadius: 9.2,
    hasUpdraftThermal: true,
    hasWaterfall: true,
  },
  {
    id: 'island_east_canyon_bridge',
    name: '东境云谷断桥浮屿 · 飞跃跳板',
    subtitle: '衔接东侧高台滑道与圣岛群峰的空中驿站，刻有远古引航星纹',
    x: 42.0,
    y: 11.2,
    z: -6.0,
    flatRadius: 4.5,
    outerRadius: 6.8,
    hasUpdraftThermal: true,
    hasWaterfall: false,
  },
];

export interface AncientStoryMuralSpec {
  id: string;
  zoneName: string;
  visualStoryTheme: string;
  x: number;
  y: number;
  z: number;
  radius: number;
}

export const ANCIENT_STORY_MURALS: AncientStoryMuralSpec[] = [
  {
    id: 'mural_fallen_colossus_valley',
    zoneName: '遗落巨人山谷 · 守望者残像',
    visualStoryTheme: '倾颓的远古守望石像半掩于花草溪流间，掌心仍托举着不灭的微光星核',
    x: -26.0,
    y: 1.4,
    z: -4.5,
    radius: 5.5,
  },
  {
    id: 'mural_sunken_astrolabe_grotto',
    zoneName: '幽晶回音暗道 · 沉没星盘壁画',
    visualStoryTheme: '洞窟岩壁上由发光晶石镶嵌出先祖乘光鳐渡越云海的无字壁画',
    x: -24.5,
    y: 1.5,
    z: -22.0,
    radius: 5.2,
  },
  {
    id: 'mural_broken_sky_aqueduct',
    zoneName: '云海断桥遗迹 · 引星渡槽',
    visualStoryTheme: '断裂的空中石拱桥延伸向云海深处，悬浮引路石灯在风中静默指路',
    x: 28.0,
    y: 2.2,
    z: -14.0,
    radius: 5.5,
  },
  {
    id: 'mural_celestial_stargazer_crown',
    zoneName: '云端天星观景浮岛 · 秘境穹顶',
    visualStoryTheme: '高空浮岛之巅的古老浑天仪与观星石座，无需文字即可感受失落星辰王国的辉煌',
    x: -28.0,
    y: 21.5,
    z: -80.0,
    radius: 6.5,
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
): {
  x: number;
  z: number;
  hitObstacle: boolean;
  normalX: number;
  normalZ: number;
  maxHitY: number;
} {
  let outX = x;
  let outZ = z;
  let hitObstacle = false;
  let normalX = 0;
  let normalZ = 0;
  let maxHitY = 0;

  const allObstacles =
    extraObstacles.length > 0
      ? [...STATIC_WORLD_OBSTACLES, ...extraObstacles]
      : STATIC_WORLD_OBSTACLES;

  for (let pass = 0; pass < 4; pass++) {
    let hitInPass = false;
    for (let i = 0; i < allObstacles.length; i++) {
      const obs = allObstacles[i];
      if (y > obs.maxY) continue;

      // Case A: Analytical Hollow Cylindrical Shell with Open Doorway (e.g. Grandma's Hollow Treehouse)
      if (obs.hollowShellThickness !== undefined) {
        const halfBand = obs.hollowShellThickness + actorRadius;
        const outerBound = obs.radius + halfBand;
        const dx = outX - obs.x;
        const dz = outZ - obs.z;
        if (Math.abs(dx) >= outerBound || Math.abs(dz) >= outerBound) continue;

        const dist = Math.hypot(dx, dz);
        const radialDelta = dist - obs.radius;
        if (Math.abs(radialDelta) >= halfBand || dist <= 0.0001) continue;

        const angle = Math.atan2(dx, dz);
        const doorCenter = obs.doorwayAngle ?? 0;
        const doorHalf = obs.doorwayHalfWidthRad ?? 0.58;
        let angDiff = angle - doorCenter;
        while (angDiff > Math.PI) angDiff -= Math.PI * 2;
        while (angDiff < -Math.PI) angDiff += Math.PI * 2;
        if (Math.abs(angDiff) <= doorHalf) {
          continue;
        }
        hitObstacle = true;
        hitInPass = true;
        if (obs.maxY > maxHitY) maxHitY = obs.maxY;
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
        continue;
      }

      // Case B: Solid Cylinder or Capsule Segment (e.g. Forgotten Ark Hull, Pillars, Towers, Igloo)
      const minDist = obs.radius + actorRadius;
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
      } else {
        // Fast AABB reject for pure cylinders before Math.hypot
        if (Math.abs(outX - cx) >= minDist || Math.abs(outZ - cz) >= minDist) {
          continue;
        }
      }

      const dx = outX - cx;
      const dz = outZ - cz;
      const dist = Math.hypot(dx, dz);
      if (dist < minDist) {
        hitObstacle = true;
        hitInPass = true;
        if (obs.maxY > maxHitY) maxHitY = obs.maxY;
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
    if (!hitInPass) break;
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

  return { x: outX, z: outZ, hitObstacle, normalX, normalZ, maxHitY };
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

export interface SkywardExplorationRing {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  boostDirX: number;
  boostDirY: number;
  boostDirZ: number;
}

/**
 * 5 High-Altitude Skyward Exploration Current Rings (云海天际巡航风圈航线)
 * forming an elevated aerial exploration highway from Central Shrine -> Bell Village -> Bird-Bridge Citadel -> Wind Paths -> AURORA Colosseum.
 */
export const SKYWARD_EXPLORATION_RINGS: SkywardExplorationRing[] = [
  {
    id: 'sky_ring_1_shrine_ascent',
    name: '天际风圈 1 · 神龛升空流光环',
    x: 0.0,
    y: 14.5,
    z: -22.0,
    radius: 5.2,
    boostDirX: 0.52,
    boostDirY: 0.25,
    boostDirZ: -0.82,
  },
  {
    id: 'sky_ring_2_bell_overlook',
    name: '天际风圈 2 · 三塔钟楼云端环',
    x: 18.0,
    y: 14.5,
    z: -34.0,
    radius: 5.8,
    boostDirX: 0.65,
    boostDirY: 0.22,
    boostDirZ: -0.72,
  },
  {
    id: 'sky_ring_3_citadel_arch',
    name: '天际风圈 3 · 千鸟星桥巡航环',
    x: 42.0,
    y: 17.5,
    z: -58.0,
    radius: 6.2,
    boostDirX: 0.78,
    boostDirY: 0.18,
    boostDirZ: -0.60,
  },
  {
    id: 'sky_ring_4_wind_paths_gate',
    name: '天际风圈 4 · 风行网道天门环',
    x: 84.0,
    y: 21.0,
    z: -82.0,
    radius: 6.5,
    boostDirX: -0.68,
    boostDirY: 0.12,
    boostDirZ: -0.72,
  },
  {
    id: 'sky_ring_5_aurora_approach',
    name: '天际风圈 5 · 欧若拉极北星环',
    x: 22.0,
    y: 18.5,
    z: -120.0,
    radius: 6.5,
    boostDirX: -0.58,
    boostDirY: 0.10,
    boostDirZ: -0.80,
  },
];

/**
 * Pure helper checking if an airborne position `(x, y, z)` is inside or grazing the volumetric Cloud Sea rings.
 */
export function isInCloudBankAt(x: number, y: number, z: number): boolean {
  if (y < 2.2) return false;
  const distCloudCenter = Math.hypot(x, z + 12.0);
  // Ring 3 inner high cloud pillows (r = 32..56, y = 11..29)
  if (distCloudCenter >= 32.0 && distCloudCenter <= 56.0 && y >= 11.0 && y <= 29.5) {
    return true;
  }
  // Ring 2 mid cloud bank (r = 60..88, y = 5.5..19.5)
  if (distCloudCenter >= 60.0 && distCloudCenter <= 88.0 && y >= 5.5 && y <= 19.5) {
    return true;
  }
  // Ring 1 outer cloud bank (r = 118..152, y = 2.5..16.5)
  if (distCloudCenter >= 118.0 && distCloudCenter <= 152.0 && y >= 2.5 && y <= 16.5) {
    return true;
  }
  // Perimeter cloud sea & Wind Paths high cloud deck
  if (Math.hypot(x, z) > 48.0 && y >= 4.5 && y <= 24.0) {
    return true;
  }
  return false;
}

/**
 * Pure helper checking if an airborne player `(x, y, z)` is near one of the 3 overhead Soaring Light Mantas (圣岛遥鲲).
 */
export function isNearLightMantaAt(
  x: number,
  y: number,
  z: number,
  elapsed: number
): boolean {
  for (let m = 0; m < 3; m++) {
    const phase = (m * Math.PI * 2) / 3;
    const radius = 22 + m * 8;
    const yBase = 14 + m * 3.5;
    const angle = elapsed * 0.22 + phase;
    const mx = Math.cos(angle) * radius;
    const mz = Math.sin(angle) * radius - 18;
    const my = yBase + Math.sin(elapsed * 1.4 + phase) * 1.8;
    const dist3d = Math.hypot(x - mx, y - my, z - mz);
    if (dist3d <= 7.8) return true;
  }
  return false;
}

/**
 * Pure helper returning the active Skyward Exploration Current Ring if `(x, y, z)` is within its boost radius.
 */
export function findActiveSkywardRingAt(
  x: number,
  y: number,
  z: number
): SkywardExplorationRing | null {
  for (const ring of SKYWARD_EXPLORATION_RINGS) {
    const dist3d = Math.hypot(x - ring.x, y - ring.y, z - ring.z);
    if (dist3d <= ring.radius) {
      return ring;
    }
  }
  return null;
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
    landingCushionTimer: 0,
    takeoffTimer: 0,
    inCloudBank: false,
    flightPitchPhase: 'none',
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
    },
    // Module 5: Floating Sky Islands & Hidden Grotto Exploration Rewards
    {
      id: `${realm}_candle_west_step_island`,
      type: 'candle_cluster',
      name: '西境云阶浮岛 · 领航圣火簇',
      subtitle: '点燃一阶浮岛圣火 (+65 滴烛火 & 激活飞往西北高空浮岛的上升气流)',
      x: -32.0,
      y: groundHeightAt(-32.0, -28.0),
      z: -28.0,
      radius: 4.0,
      activated: false,
      waxReward: 65,
    },
    {
      id: `${realm}_bloom_nw_step_island`,
      type: 'light_bloom',
      name: '西北流云屿 · 悬空星瓣花',
      subtitle: '共鸣绽放海拔 14.8m 浮空岛光之花 (+70 滴烛火 & 瞬间充满翼能)',
      x: -48.0,
      y: groundHeightAt(-48.0, -54.0),
      z: -54.0,
      radius: 4.0,
      activated: false,
      waxReward: 70,
    },
    {
      id: `${realm}_wl_celestial_observatory`,
      type: 'winged_light',
      name: '光之翼 · 云端天星观景台',
      subtitle: '登顶海拔 21.5m 隐秘天星观景浮岛 · 吸收苍穹守望小金人 (+1 永久光之翼)',
      x: -28.0,
      y: groundHeightAt(-28.0, -80.0),
      z: -80.0,
      radius: 4.2,
      activated: false,
    },
    {
      id: `${realm}_candle_east_canyon_island`,
      type: 'candle_cluster',
      name: '东境云谷浮屿 · 古桥碑铭烛台',
      subtitle: '点亮云谷断桥浮岛圣火 (+65 滴烛火 & 续航飞往圣岛群峰)',
      x: 42.0,
      y: groundHeightAt(42.0, -6.0),
      z: -6.0,
      radius: 4.0,
      activated: false,
      waxReward: 65,
    }
  );

  if (realm !== 'vault') {
    list.push({
      id: `${realm}_coop_sanctuary_door`,
      type: 'coop_door',
      name: `${realmTitle}双人协力星芒石门`,
      subtitle:
        '需 2 名旅人（真实联机玩家或呼唤本地 AI 旅伴）同时就位点亮双星基座 · 开启秘境上升通道 (+65 滴烛火)',
      x: 8.5,
      y: groundHeightAt(8.5, -7.5),
      z: -7.5,
      radius: 4.5,
      activated: false,
      waxReward: 65,
    });
  }

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

  // Tick down non-lethal high-landing recovery stiffness timer & normal jump landing cushion timer
  if (next.landingStiffTimer > 0) {
    next.landingStiffTimer = Math.max(0, next.landingStiffTimer - dt);
  }
  if ((next.landingCushionTimer ?? 0) > 0) {
    next.landingCushionTimer = Math.max(0, (next.landingCushionTimer ?? 0) - dt);
  } else {
    next.landingCushionTimer = 0;
  }
  if ((next.takeoffTimer ?? 0) > 0) {
    next.takeoffTimer = Math.max(0, (next.takeoffTimer ?? 0) - dt);
  } else {
    next.takeoffTimer = 0;
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

  // Gentle uphill resistance & stability on natural slopes (without blocking climb)
  const preHorizSpd = Math.hypot(next.vx, next.vz);
  const groundSpeed =
    baseGroundSpeed *
    (isChibi ? 1.08 : 1.0) *
    (isIceRealm ? 1.35 : 1.0) *
    (hasWindSpeedSpell ? 1.25 : hasRainbowTrailSpell ? 1.15 : 1.0) *
    (inShallowWater ? LOCOMOTION_CFG.shallowWaterSlowMultiplier : 1.0) *
    (next.landingStiffTimer > 0 ? 0.45 : 1.0);

  // Calculate world-space wish direction relative to cameraYaw with smooth, non-snapping anatomical turning
  let wishX = 0;
  let wishZ = 0;
  let turnAlignmentFactor = 1.0;
  if (inputLen > 0.05 && next.sitMode === 'none') {
    const nx = input.moveX / inputLen;
    const nz = input.moveZ / inputLen;
    const sinY = Math.sin(input.cameraYaw);
    const cosY = Math.cos(input.cameraYaw);
    wishX = nx * cosY + nz * sinY;
    wishZ = nz * cosY - nx * sinY;

    const targetYaw = Math.atan2(wishX, wishZ);
    // Smooth angular shortest-path interpolation with anatomical max angular velocity clamp
    let diff = targetYaw - next.yaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    const turnRate = next.grounded
      ? preHorizSpd > 4.6
        ? 10.5
        : 13.5
      : next.flightMode === 'glide'
        ? 5.5
        : 8.5;
    const maxTurnRadPerSec = next.grounded
      ? preHorizSpd > 4.6
        ? 7.8
        : 10.8
      : next.flightMode === 'glide'
        ? 4.5
        : 7.2;
    const rawStep = diff * (1 - Math.exp(-turnRate * dt));
    const maxStep = maxTurnRadPerSec * dt;
    const clampedStep = Math.max(-maxStep, Math.min(maxStep, rawStep));
    next.yaw += clampedStep;
    // Normalize yaw within [-PI, PI]
    while (next.yaw > Math.PI) next.yaw -= Math.PI * 2;
    while (next.yaw < -Math.PI) next.yaw += Math.PI * 2;

    // When already moving at speed and reversing direction sharply (> ~85 deg), modulate target speed smoothly so character pivots naturally
    if (next.grounded && preHorizSpd > 1.2 && Math.abs(diff) > 1.48) {
      turnAlignmentFactor = Math.max(0.42, 0.55 + 0.45 * Math.cos(diff));
    }

    const airSpeedRatio = next.grounded
      ? 1.0
      : Math.max(0.55, Math.min(1.25, preHorizSpd / 11.0));
    const maxRoll = next.grounded ? 0.18 : next.flightMode === 'glide' ? 0.64 : 0.38;
    const rollSensitivity = next.grounded
      ? 0.09
      : (next.flightMode === 'glide' ? 0.48 : 0.28) * airSpeedRatio;
    const targetRoll = Math.max(-maxRoll, Math.min(maxRoll, -diff * rollSensitivity));
    next.roll += (targetRoll - next.roll) * (1 - Math.exp(-(next.grounded ? 12 : 8.5) * dt));
  } else {
    next.roll *= Math.exp(-(next.grounded ? 12 : 7.5) * dt);
    if (Math.abs(next.roll) < 0.002) next.roll = 0;
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
    // Ground Takeoff Jump: natural upward lift + forward leap momentum carry when moving
    next.vy = LOCOMOTION_CFG.jumpVerticalImpulse * flapLiftScale;
    if (preHorizSpd > 0.6) {
      const leapBoost = Math.min(1.35, preHorizSpd * 0.16);
      const moveDirX = next.vx / preHorizSpd;
      const moveDirZ = next.vz / preHorizSpd;
      next.vx += moveDirX * leapBoost;
      next.vz += moveDirZ * leapBoost;
    }
    next.grounded = false;
    next.sitMode = 'none';
    next.isSlidingSlope = false;
    next.isDiving = false;
    next.coyoteTimer = 0;
    next.jumpBufferTimer = 0;
    next.takeoffTimer = 0.28;
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
    next.takeoffTimer = 0.26;
    next.jumpBufferTimer = 0;
    next.isDiving = false;
    didFlap = true;

    // Pull-up swoop bonus if flapping out of a dive or steep glide descent!
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
      next.vx += wishX * 3.4;
      next.vz += wishZ * 3.4;
    }
  }

  // Stage 2: Aerial Dive (俯冲加速) vs Aerodynamic Descent Momentum Conversion
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
    // In normal glide descent (vy < -2.2), gently accumulate aerodynamic swoop momentum up to 4.2
    if (!next.grounded && next.flightMode === 'glide' && next.vy < -2.2) {
      next.diveMomentum = Math.min(4.2, next.diveMomentum + (-next.vy - 2.2) * 0.35 * dt);
    } else {
      next.diveMomentum = Math.max(0, next.diveMomentum - 4.0 * dt);
    }
  }

  // Continuous gentle glide lift when holding Space in air with energy (and not diving)
  if (!next.grounded && !next.isDiving && input.jumpHeld && next.wingEnergy > 0.1) {
    const continuousDrain = 0.22 * dt;
    next.wingEnergy = Math.max(0, next.wingEnergy - continuousDrain);
    next.vy += (next.flightMode === 'glide' ? 7.2 : 8.5) * dt;
  }

  // Horizontal velocity & drag (including Steep Slope Sliding, Valley Ice Rink, Glide Forward Inertia & Dive)
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
      // Gentle slope speed modulation on non-sliding hills (uphill slightly calmer, downhill slightly brisker)
      const gentleSlopeMod =
        slopeInfo.slopeAngleDeg > 2.0 && !inSlideRampZone
          ? Math.max(0.86, Math.min(1.08, 1.0 - uphillAlignment * (slopeInfo.slopeAngleDeg / 140)))
          : 1.0;
      const effectiveGroundSpeed = groundSpeed * turnAlignmentFactor * gentleSlopeMod;
      const targetVx =
        wishX * effectiveGroundSpeed * (isRunningInput ? 1 : Math.max(0.55, scaledMag));
      const targetVz =
        wishZ * effectiveGroundSpeed * (isRunningInput ? 1 : Math.max(0.55, scaledMag));

      // Separate natural acceleration on start vs smooth coasting deceleration on stop
      const isAccelerating = inputLen > 0.05;
      const accelRate = isIceRealm
        ? 4.2
        : isAccelerating
          ? turnAlignmentFactor < 0.85
            ? 12.5
            : 10.2
          : 11.5;
      const accel = 1 - Math.exp(-accelRate * dt);
      next.vx += (targetVx - next.vx) * accel;
      next.vz += (targetVz - next.vz) * accel;
      if (inputLen <= 0.05 && !isIceRealm && Math.hypot(next.vx, next.vz) < 0.06) {
        next.vx = 0;
        next.vz = 0;
      }
    }
  } else {
    // Airborne Aerodynamics:
    // - Glide Mode maintains natural forward cruise inertia along heading even when WASD is released!
    // - Descending converts potential energy into extra horizontal airspeed; climbing trades a small fraction of speed for altitude.
    const descentSpeedBonus =
      !next.isDiving && next.vy < -1.8
        ? Math.min(3.8, (-next.vy - 1.8) * 0.34)
        : 0;
    const climbSpeedTrade =
      !next.isDiving && next.vy > 2.2 ? 0.92 : 1.0;
    const lowEnergySpeedMod = next.wingEnergy < 0.5 ? 0.88 : 1.0;
    const spellAirSpeedMod = hasWindSpeedSpell ? 1.25 : hasRainbowTrailSpell ? 1.12 : 1.0;

    const baseModeAirSpeed = next.isDiving
      ? ENERGY_CFG.diveMaxHorizontalSpeed
      : next.flightMode === 'glide'
        ? (inputLen > 0.05 ? ENERGY_CFG.glideAirSpeed : ENERGY_CFG.glideAirSpeed * 0.86) +
          descentSpeedBonus +
          next.diveMomentum * 0.35
        : ENERGY_CFG.hoverAirSpeed + descentSpeedBonus * 0.4;

    const airSpeed =
      baseModeAirSpeed * climbSpeedTrade * lowEnergySpeedMod * spellAirSpeedMod;

    const forwardX = Math.sin(next.yaw);
    const forwardZ = Math.cos(next.yaw);
    // In Glide or Dive mode, always propel along the glider's forward heading for authentic soaring inertia!
    const useForwardHeading = next.isDiving || next.flightMode === 'glide';
    const targetVx = useForwardHeading ? forwardX * airSpeed : wishX * airSpeed;
    const targetVz = useForwardHeading ? forwardZ * airSpeed : wishZ * airSpeed;
    const airControlRate = next.isDiving
      ? 6.5
      : next.flightMode === 'glide'
        ? inputLen > 0.05
          ? 4.8
          : 2.6
        : 7.0;
    const airControl = 1 - Math.exp(-airControlRate * dt);
    next.vx += (targetVx - next.vx) * airControl;
    next.vz += (targetVz - next.vz) * airControl;
  }

  // Gravity (with Jump Apex Softening & Aerodynamic Glide Lift when cruising at speed!)
  const isNearJumpApex =
    !next.grounded && !next.isDiving && Math.abs(next.vy) < 1.85 && next.distanceFlown < 6.0;
  const apexGravityScale = isNearJumpApex ? 0.74 : 1.0;
  const glideAerodynamicLiftScale =
    !next.grounded &&
    !next.isDiving &&
    next.flightMode === 'glide' &&
    preHorizSpd > 9.0 &&
    next.wingEnergy > 0.2
      ? 0.84
      : 1.0;
  const rawGravity = next.isDiving
    ? ENERGY_CFG.diveGravity
    : weather === 'starlight_gravity'
      ? 6.5
      : next.grounded
        ? 20.0
        : next.flightMode === 'glide'
          ? 8.4 * glideAerodynamicLiftScale
          : 13.5 * apexGravityScale;
  const baseGravity =
    !next.grounded && !next.isDiving && hasAntigravSpell
      ? rawGravity * 0.6
      : rawGravity;
  const maxSinkSpeed = next.isDiving ? -19.5 : next.wingEnergy < 0.5 ? -9.8 : -14.0;
  next.vy = Math.max(maxSinkSpeed, next.vy - baseGravity * dt);

  // Stage 3 Wind Tunnel Updraft, Stage 13 Outer Wind-Path Cloud Rail, Cloud-Sea Grazing, Light Manta Draft & 5 Skyward Exploration Rings
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
    (CONTINENTAL_ARCHITECTURAL_HUBS.some(
      (h) => h.hasUpdraftThermal && Math.hypot(next.x - h.x, next.z - h.z) <= 5.8
    ) ||
      FLOATING_SKY_ISLANDS.some(
        (isl) => isl.hasUpdraftThermal && Math.hypot(next.x - isl.x, next.z - isl.z) <= 6.5
      ));
  const inEastRaceArcade =
    next.x >= 28.0 && next.x <= 62.0 && Math.abs(next.z - 8.0) <= 4.2 && next.y <= 12.0;
  const activeSkywardRing = !next.grounded
    ? findActiveSkywardRingAt(next.x, next.y, next.z)
    : null;
  const inCloudBank = !next.grounded && isInCloudBankAt(next.x, next.y, next.z);
  next.inCloudBank = inCloudBank;
  const nearLightManta =
    !next.grounded && isNearLightMantaAt(next.x, next.y, next.z, elapsed);

  const inWindCorridor =
    inInnerWindCorridor ||
    inOuterWindPath ||
    inHubThermalUpdraft ||
    inEastRaceArcade ||
    Boolean(activeSkywardRing);
  next.inWindTunnel = inWindCorridor;

  if (inInnerWindCorridor && !next.grounded && !next.isDiving && !activeSkywardRing) {
    next.vy = Math.min(11.5, next.vy + (wt.updraftAccel + 4.5) * dt);
    // Forward tailwind propulsion toward the northern Three-Tower Bell Village (-Z)
    next.vz = Math.min(next.vz - wt.forwardBoostAccel * dt, -3.5);
    next.wingEnergy = Math.min(
      effectiveMaxEnergy,
      next.wingEnergy + wt.rechargeRatePerSec * dt
    );
  } else if (activeSkywardRing && !next.isDiving) {
    // Skyward Exploration Current Ring propels the player along the aerial route & recharges wing energy!
    next.vx += activeSkywardRing.boostDirX * 14.5 * dt;
    next.vy = Math.min(13.5, Math.max(next.vy, 3.8) + activeSkywardRing.boostDirY * 14.5 * dt);
    next.vz += activeSkywardRing.boostDirZ * 14.5 * dt;
    next.wingEnergy = Math.min(
      effectiveMaxEnergy,
      next.wingEnergy + (wt.rechargeRatePerSec + 1.1) * dt
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

  // Cloud-Sea Grazing & Overhead Light Manta Updraft Support
  if (inCloudBank && !next.isDiving) {
    if (next.vy < -1.5) {
      // Soft buoyant cloud cushion when skimming cloud tops
      next.vy = Math.min(4.2, Math.max(-1.5, next.vy + 12.0 * dt));
    } else if (next.vy < 3.2) {
      next.vy += 3.5 * dt;
    }
  }
  if (nearLightManta && !next.isDiving) {
    next.vy = Math.min(10.5, next.vy + 5.5 * dt);
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

  // Resolve solid obstacle collisions (shrine pillars, temple hall, bell towers) with smooth tangential sliding & aerial anti-stuck deflection
  const colRes = resolveObstacleCollisions(next.x, next.y, next.z, 0.44);
  if (colRes.hitObstacle) {
    next.x = colRes.x;
    next.z = colRes.z;
    const inwardDot = next.vx * colRes.normalX + next.vz * colRes.normalZ;
    if (inwardDot < 0) {
      next.vx -= inwardDot * colRes.normalX;
      next.vz -= inwardDot * colRes.normalZ;
    }
    // Aerial anti-stuck protection: when flying/gliding into a tower or pillar, smoothly deflect yaw along the tangent
    // and provide a gentle roof-lip lift when near the top of the obstacle so flight never gets wedged mid-air.
    if (!next.grounded) {
      if (colRes.maxHitY > 0 && next.y >= colRes.maxHitY - 1.5 && next.vy > -2.5) {
        next.vy = Math.max(next.vy, 3.2);
      }
      const tangSpeed = Math.hypot(next.vx, next.vz);
      if (tangSpeed > 0.35) {
        const tangYaw = Math.atan2(next.vx, next.vz);
        let yDiff = tangYaw - next.yaw;
        while (yDiff > Math.PI) yDiff -= Math.PI * 2;
        while (yDiff < -Math.PI) yDiff += Math.PI * 2;
        next.yaw += yDiff * Math.min(1, 5.5 * dt);
      } else {
        // Head-on impact: nudge velocity along tangent (-normalZ, normalX) so glider slides around the obstacle
        const sideSign =
          Math.sin(next.yaw) * -colRes.normalZ + Math.cos(next.yaw) * colRes.normalX >= 0
            ? 1
            : -1;
        const tangX = -colRes.normalZ * sideSign;
        const tangZ = colRes.normalX * sideSign;
        next.vx += tangX * 3.6;
        next.vz += tangZ * 3.6;
        const targetYaw = Math.atan2(tangX, tangZ);
        let yDiff = targetYaw - next.yaw;
        while (yDiff > Math.PI) yDiff -= Math.PI * 2;
        while (yDiff < -Math.PI) yDiff += Math.PI * 2;
        next.yaw += yDiff * Math.min(1, 6.0 * dt);
      }
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

  // Terrain collision, downhill/slope ground-following snap tolerance & momentum-preserving flight touchdown
  const floorY =
    next.sitMode === 'sit_bench'
      ? groundHeightAt(next.x, next.z) + 0.18
      : groundHeightAt(next.x, next.z);
  const downhillSnapTolerance =
    wasGroundedBeforeMove && !didFlap && next.vy <= 0.05
      ? Math.min(0.75, 0.52 + Math.hypot(next.vx, next.vz) * 0.025)
      : 0.0;
  if (next.y <= floorY + downhillSnapTolerance) {
    if (!wasGroundedBeforeMove && preLandVy < -1.6) {
      didLand = true;
      // High fall landing recovery stiffness vs normal jump / glide run-out elastic cushion
      if (preLandVy <= LOCOMOTION_CFG.highLandingVelocityThreshold) {
        next.landingStiffTimer = LOCOMOTION_CFG.landingStiffDurationSec;
        next.landingCushionTimer = 0.28;
        next.vx *= 0.25;
        next.vz *= 0.25;
      } else {
        // Normal jump / glide touchdown: natural knee-bend cushion & smooth forward momentum run-out
        next.landingCushionTimer = Math.min(
          0.28,
          Math.max(
            next.flightMode === 'glide' ? 0.22 : 0.18,
            Math.abs(preLandVy) * 0.04
          )
        );
        const touchHorizSpd = Math.hypot(next.vx, next.vz);
        const maxRunoutSpd = LOCOMOTION_CFG.runSpeed * 1.15;
        if (touchHorizSpd > maxRunoutSpd) {
          const clampRatio = maxRunoutSpd / touchHorizSpd;
          next.vx *= clampRatio;
          next.vz *= clampRatio;
        }
      }
    }
    next.y = floorY;
    next.vy = 0;
    next.grounded = true;
    next.isDiving = false;
    next.diveMomentum = 0;
    next.distanceFlown = 0;
    next.inCloudBank = false;
    next.flightPitchPhase = 'none';
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

  // Determine exact LocomotionMode & FlightPitchPhase for HUD, Debug Telemetry & Skeletal Animator
  const horizSpd = Math.hypot(next.vx, next.vz);
  if (!next.grounded) {
    if (next.isDiving) {
      next.locomotionMode = 'dive';
      next.flightPitchPhase = 'dive';
    } else {
      next.locomotionMode = next.vy > 1.2 && next.distanceFlown < 3.6 ? 'jump' : 'fly';
      next.flightPitchPhase =
        next.vy > 1.8 ? 'climb' : next.vy < -1.8 ? 'descent' : 'level';
    }
  } else if (next.landingStiffTimer > 0) {
    next.locomotionMode = 'land_stiff';
  } else if (next.sitMode !== 'none') {
    next.locomotionMode = next.sitMode;
  } else if (next.isSlidingSlope && horizSpd > 0.5) {
    next.locomotionMode = 'slide';
  } else if (next.isInShallowWater && horizSpd > 0.15) {
    next.locomotionMode = 'wade';
  } else if (horizSpd > 5.4) {
    next.locomotionMode = 'run';
  } else if (horizSpd > 0.16) {
    next.locomotionMode = 'walk';
  } else {
    next.locomotionMode = 'idle';
  }

  // Pitch tilt when flying (distinct Climb, Level, Descent, Dive angles), or walking across sloped terrain
  if (!next.grounded) {
    const targetPitch = next.isDiving
      ? -0.78
      : next.flightMode === 'glide'
        ? Math.max(-0.52, Math.min(0.42, -next.vy * 0.048 - 0.04))
        : Math.max(-0.38, Math.min(0.38, -next.vy * 0.036));
    next.pitch += (targetPitch - next.pitch) * (1 - Math.exp(-9 * dt));
  } else {
    const forwardX = Math.sin(next.yaw);
    const forwardZ = Math.cos(next.yaw);
    const slopeAlongHeading =
      -(forwardX * postSlope.downSlopeX + forwardZ * postSlope.downSlopeZ) *
      Math.tan((postSlope.slopeAngleDeg * Math.PI) / 180);
    const targetGroundPitch =
      horizSpd > 0.2
        ? Math.max(-0.14, Math.min(0.14, slopeAlongHeading * 0.22))
        : 0;
    next.pitch += (targetGroundPitch - next.pitch) * (1 - Math.exp(-10 * dt));
    if (Math.abs(next.pitch) < 0.002) next.pitch = 0;
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

  // Passive Wing Energy & Temporary Lost Wedge Recharge (or gentle balanced stamina consumption during sustained open-air flight)
  const canRechargeNow =
    !next.isInDarkWater &&
    (next.inShelter ||
      next.nearCompanion ||
      inWindCorridor ||
      inCloudBank ||
      nearLightManta ||
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
    } else if (next.nearCompanion || nearLightManta) {
      rechargeRate = nearLightManta ? 2.0 : ENERGY_CFG.companionProximityRechargeRatePerSec;
      energySource = 'companion';
    } else if (hasFireBrazier) {
      rechargeRate = 1.6;
      energySource = 'brazier_prop';
    } else if (inWindCorridor || inCloudBank || nearCloudRing) {
      rechargeRate = inCloudBank
        ? Math.max(1.65, ENERGY_CFG.windTunnelRechargeRatePerSec)
        : ENERGY_CFG.windTunnelRechargeRatePerSec;
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
  } else if (
    !next.grounded &&
    !next.isDiving &&
    !input.jumpHeld &&
    weather !== 'rain' &&
    weather !== 'eden_storm' &&
    next.vy > -4.5
  ) {
    // Gentle, balanced passive stamina consumption during prolonged open-air flight outside clouds/thermals/light
    const passiveFlightDrain = next.flightMode === 'glide' ? 0.055 : 0.075;
    next.wingEnergy = Math.max(0, next.wingEnergy - passiveFlightDrain * dt);
    netRate = -passiveFlightDrain;
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
  loadout?: EquippedLoadout,
  options?: {
    coopParticipantCount?: number;
    requiredCoopParticipants?: number;
  }
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
    const reqCount = options?.requiredCoopParticipants ?? 2;
    const curCount = options?.coopParticipantCount ?? reqCount;
    if (curCount < reqCount) {
      updatedTarget.activated = false;
      bannerMessage = `🔒 「${target.name}」需 ${reqCount} 名旅人同时就位共鸣（当前 ${curCount}/${reqCount} 人）· 请点击「🔔 呼唤旅伴协力」或邀请联机好友靠近！`;
    } else {
      const waxGain = target.waxReward ?? 65;
      const totalWax = nextProgress.wax + waxGain;
      nextProgress.candles += Math.floor(totalWax / 100);
      nextProgress.wax = totalWax % 100;
      nextPhysics.wingEnergy = nextPhysics.maxWingWedges;
      nextPhysics.vy = Math.max(nextPhysics.vy, 5.2);
      nextPhysics.grounded = false;
      nextPhysics.flightMode = 'hover';
      bannerMessage = `🚪 已与同伴 (${curCount}/${reqCount} 人) 协力点亮「${target.name}」双人星芒机关 · 秘库通道开启 (+${waxGain} 滴烛火 & 唤起星光上升气流)！`;
    }
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
  dt: number,
  coopTarget?: { x: number; z: number } | null
): { x: number; y: number; z: number; yaw: number } {
  let desiredX = bot.x;
  let desiredZ = bot.z;

  if (coopTarget) {
    // Summoned to assist at a 2-player Co-op Mechanism plinth!
    const offsetSide =
      bot.playerId === 'bot_traveller_1'
        ? -1.25
        : bot.playerId === 'bot_traveller_2'
          ? 1.25
          : 0.0;
    desiredX = coopTarget.x + offsetSide;
    desiredZ = coopTarget.z + (bot.playerId === 'bot_traveller_3' ? 1.35 : 0.45);
  } else if (mode === 'follow') {
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

// ============================================================================
// Module 3: Cinematic Third-Person Camera System (电影感第三人称摄像机系统)
// ============================================================================

export interface ScenicVistaZone {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  outerRadius: number;
  innerRadius: number;
  focalX: number;
  focalY: number;
  focalZ: number;
  distBonus: number;
  fovBonus: number;
  pitchBias: number;
  lookAtBlendMax: number;
}

/**
 * 8 Curated Scenic Vista Zones (高处、山谷、云层与重要奇观地标电影镜头展示区)
 * Gently widens framing and tilts gaze toward monumental architecture without locking player control.
 */
export const SCENIC_VISTA_ZONES: ScenicVistaZone[] = [
  {
    id: 'vista_elder_temple',
    name: '北境长老神庙 · 星盘圣殿仰望全景',
    x: 0.0,
    y: 4.6,
    z: -44.0,
    outerRadius: 22.0,
    innerRadius: 9.0,
    focalX: 0.0,
    focalY: 13.5,
    focalZ: -55.0,
    distBonus: 2.2,
    fovBonus: 3.5,
    pitchBias: -0.08,
    lookAtBlendMax: 0.18,
  },
  {
    id: 'vista_bell_village',
    name: '三塔钟楼村落 · 云端金钟远眺',
    x: 16.5,
    y: 2.0,
    z: -24.5,
    outerRadius: 15.0,
    innerRadius: 6.0,
    focalX: 16.5,
    focalY: 7.2,
    focalZ: -24.5,
    distBonus: 1.6,
    fovBonus: 2.5,
    pitchBias: -0.05,
    lookAtBlendMax: 0.14,
  },
  {
    id: 'vista_sky_citadel',
    name: '千鸟天际浮岛 · 星桥高空纵深',
    x: 46.0,
    y: 14.5,
    z: -68.0,
    outerRadius: 24.0,
    innerRadius: 10.0,
    focalX: 46.0,
    focalY: 20.0,
    focalZ: -68.0,
    distBonus: 2.5,
    fovBonus: 4.0,
    pitchBias: -0.06,
    lookAtBlendMax: 0.16,
  },
  {
    id: 'vista_aurora_colosseum',
    name: '欧若拉星光竞技场 · 千人穹顶剧场',
    x: 0.0,
    y: 12.8,
    z: -148.0,
    outerRadius: 28.0,
    innerRadius: 12.0,
    focalX: 0.0,
    focalY: 20.5,
    focalZ: -148.0,
    distBonus: 2.8,
    fovBonus: 5.0,
    pitchBias: -0.08,
    lookAtBlendMax: 0.20,
  },
  {
    id: 'vista_sundial_amphitheater',
    name: '正南远古日晷剧场 · 八星柱巨石阵',
    x: 0.0,
    y: 3.2,
    z: 62.0,
    outerRadius: 20.0,
    innerRadius: 8.5,
    focalX: 0.0,
    focalY: 9.2,
    focalZ: 62.0,
    distBonus: 2.0,
    fovBonus: 3.0,
    pitchBias: -0.06,
    lookAtBlendMax: 0.16,
  },
  {
    id: 'vista_sanctuary_whale_geyser',
    name: '圣岛海螺喷泉 · 白鲸跃海奇观',
    x: 52.0,
    y: 4.2,
    z: -28.0,
    outerRadius: 22.0,
    innerRadius: 9.0,
    focalX: 58.0,
    focalY: 11.0,
    focalZ: -32.0,
    distBonus: 2.2,
    fovBonus: 3.5,
    pitchBias: -0.06,
    lookAtBlendMax: 0.16,
  },
  {
    id: 'vista_wind_paths_archipelago',
    name: '风行网道群岛 · 云海天门长廊',
    x: 112.0,
    y: 22.0,
    z: -96.0,
    outerRadius: 26.0,
    innerRadius: 11.0,
    focalX: 112.0,
    focalY: 26.5,
    focalZ: -96.0,
    distBonus: 2.6,
    fovBonus: 4.5,
    pitchBias: -0.05,
    lookAtBlendMax: 0.15,
  },
  {
    id: 'vista_echo_cavern_grotto',
    name: '幽光洞窟 · 荧光晶石秘境山谷',
    x: -18.5,
    y: 1.4,
    z: -16.0,
    outerRadius: 14.0,
    innerRadius: 5.5,
    focalX: -18.5,
    focalY: 4.2,
    focalZ: -16.0,
    distBonus: 1.2,
    fovBonus: 2.0,
    pitchBias: -0.04,
    lookAtBlendMax: 0.12,
  },
  {
    id: 'vista_celestial_observatory',
    name: '云端天星观景台 · 苍穹浮岛全景',
    x: -28.0,
    y: 21.5,
    z: -80.0,
    outerRadius: 20.0,
    innerRadius: 7.5,
    focalX: 0.0,
    focalY: 16.0,
    focalZ: -50.0,
    distBonus: 2.8,
    fovBonus: 5.0,
    pitchBias: -0.07,
    lookAtBlendMax: 0.16,
  },
  {
    id: 'vista_east_canyon_arch',
    name: '东境云谷断桥 · 圣岛远眺台',
    x: 42.0,
    y: 11.2,
    z: -6.0,
    outerRadius: 16.0,
    innerRadius: 6.0,
    focalX: 52.0,
    focalY: 10.5,
    focalZ: -28.0,
    distBonus: 2.0,
    fovBonus: 3.5,
    pitchBias: -0.05,
    lookAtBlendMax: 0.14,
  },
];

export interface CinematicCameraState {
  camX: number;
  camY: number;
  camZ: number;
  focusX: number;
  focusY: number;
  focusZ: number;
  yaw: number;
  pitch: number;
  roll: number;
  distance: number;
  fov: number;
  smoothedCollisionRatio: number;
  manualLookGraceTimer: number;
  userZoomOffset: number;
  activeVistaId: string | null;
  vistaBlend: number;
}

export function createInitialCameraStatePure(
  playerX = 0,
  playerY = 1.2,
  playerZ = 6.0
): CinematicCameraState {
  return {
    camX: playerX,
    camY: playerY + 3.0,
    camZ: playerZ + 7.8,
    focusX: playerX,
    focusY: playerY + 1.6,
    focusZ: playerZ,
    yaw: 0,
    pitch: 0.26,
    roll: 0,
    distance: 7.8,
    fov: 60,
    smoothedCollisionRatio: 1.0,
    manualLookGraceTimer: 0,
    userZoomOffset: 0,
    activeVistaId: null,
    vistaBlend: 0,
  };
}

/**
 * Pure helper evaluating whether the player is near a Scenic Vista Zone or soaring in high-altitude / cloud-sea panoramas.
 */
export function evaluateScenicVistaAtPure(
  x: number,
  y: number,
  z: number,
  inCloudBank: boolean
): {
  vista: ScenicVistaZone | null;
  blend: number;
  distBonus: number;
  fovBonus: number;
} {
  let bestVista: ScenicVistaZone | null = null;
  let bestBlend = 0;

  for (const v of SCENIC_VISTA_ZONES) {
    const dist = Math.hypot(x - v.x, z - v.z);
    if (dist < v.outerRadius) {
      const rawT =
        dist <= v.innerRadius
          ? 1.0
          : 1.0 - (dist - v.innerRadius) / Math.max(0.1, v.outerRadius - v.innerRadius);
      const smoothT = rawT * rawT * (3 - 2 * rawT);
      if (smoothT > bestBlend) {
        bestBlend = smoothT;
        bestVista = v;
      }
    }
  }

  // High-altitude ridge / cloud-sea panoramic expansion even outside named landmarks
  const altitudeFactor = Math.max(0, Math.min(1, (y - 9.5) / 14.0));
  const cloudBonus = inCloudBank ? 0.55 : 0;
  const envPanoramaT = Math.min(1, altitudeFactor + cloudBonus);

  const distBonus =
    (bestVista ? bestVista.distBonus * bestBlend : 0) + envPanoramaT * 1.65;
  const fovBonus =
    (bestVista ? bestVista.fovBonus * bestBlend : 0) + envPanoramaT * 2.8;

  return {
    vista: bestVista,
    blend: bestBlend,
    distBonus,
    fovBonus,
  };
}

/**
 * Pure 2D segment-to-circle clearance solver for camera obstacle avoidance (`STATIC_WORLD_OBSTACLES`).
 * Ensures the camera ray from `(focusX, focusZ)` to `(desiredX, desiredZ)` never clips inside solid walls, towers, or trees,
 * returning both a safe pullback ratio `[0.28..1.0]` and a smooth tangential slide offset to prevent sudden jumping.
 */
export function computeCameraObstacleClearancePure(
  focusX: number,
  focusY: number,
  focusZ: number,
  desiredX: number,
  desiredY: number,
  desiredZ: number
): {
  safeRatio: number;
  deflectX: number;
  deflectZ: number;
  occludedById: string | null;
} {
  const rayDx = desiredX - focusX;
  const rayDz = desiredZ - focusZ;
  const rayLenXZ = Math.hypot(rayDx, rayDz);
  if (rayLenXZ < 0.05) {
    return { safeRatio: 1.0, deflectX: 0, deflectZ: 0, occludedById: null };
  }

  const dirX = rayDx / rayLenXZ;
  const dirZ = rayDz / rayLenXZ;
  const camSafetyMargin = 0.58;

  let minSafeRatio = 1.0;
  let deflectX = 0;
  let deflectZ = 0;
  let occludedById: string | null = null;

  for (const obs of STATIC_WORLD_OBSTACLES) {
    // Ignore low props below camera ray or thin decorative posts (< 0.68m radius) that shouldn't yank the camera
    if (obs.maxY < Math.min(focusY, desiredY) - 0.2) continue;
    if (obs.radius < 0.68) continue;
    // Skip hollow shell obstacles (e.g. Grandma's Treehouse interior) when player is inside
    if (obs.hollowShellThickness && Math.hypot(focusX - obs.x, focusZ - obs.z) < obs.radius) {
      continue;
    }

    const ox = obs.x - focusX;
    const oz = obs.z - focusZ;
    // Project obstacle center onto camera ray [0 .. rayLenXZ]
    const proj = ox * dirX + oz * dirZ;
    if (proj <= 0.1 || proj >= rayLenXZ + obs.radius + camSafetyMargin) {
      continue;
    }

    const clampedProj = Math.max(0, Math.min(rayLenXZ, proj));
    const closestX = dirX * clampedProj;
    const closestZ = dirZ * clampedProj;
    const perpDx = closestX - ox;
    const perpDz = closestZ - oz;
    const perpDist = Math.hypot(perpDx, perpDz);
    const effectiveRadius = obs.radius + camSafetyMargin;

    if (perpDist < effectiveRadius) {
      // If the obstacle blocks the ray deeply near its center, pull camera forward in front of the wall;
      // If it only grazes the outer edge of the cylinder/tree, slide tangentially around it so distance doesn't pop!
      const penetration = effectiveRadius - perpDist;
      const grazeRatio = perpDist / effectiveRadius;

      if (grazeRatio < 0.58) {
        const halfChord = Math.sqrt(
          Math.max(0, effectiveRadius * effectiveRadius - perpDist * perpDist)
        );
        const hitDist = Math.max(1.8, proj - halfChord);
        const ratio = Math.max(0.28, Math.min(1.0, hitDist / rayLenXZ));
        if (ratio < minSafeRatio) {
          minSafeRatio = ratio;
          occludedById = obs.id;
        }
      } else {
        // Smooth tangential deflection around building/tree edge
        const normX = perpDist > 0.001 ? perpDx / perpDist : -dirZ;
        const normZ = perpDist > 0.001 ? perpDz / perpDist : dirX;
        deflectX += normX * penetration * 0.85;
        deflectZ += normZ * penetration * 0.85;
        occludedById = obs.id;
      }
    }
  }

  return {
    safeRatio: minSafeRatio,
    deflectX,
    deflectZ,
    occludedById,
  };
}

/**
 * Pure step function for the Module 3 Cinematic Third-Person Camera System.
 * Handles:
 * 1. Smooth damped follow & velocity look-ahead (with takeoff vertical lag & landing cushion settle);
 * 2. Differentiated framing parameters (Sit / Idle / Walk / Run / Hover / Glide / Dive) & dynamic Rule-of-Thirds composition;
 * 3. Smooth non-snapping turn alignment with manual-look grace timer;
 * 4. Spring-damped multi-obstacle & 6-sample terrain avoidance;
 * 5. Scenic Vista & High-Altitude / Cloud-Sea panoramic framing.
 */
export function computeCinematicCameraStepPure(
  prevCam: CinematicCameraState,
  player: PlayerPhysicsState,
  input: {
    dt: number;
    isDraggingCamera: boolean;
    moveX: number;
    moveZ: number;
    turnRate: number;
    selfieMode: boolean;
    photoModeOpen: boolean;
    photoFov: number;
  }
): CinematicCameraState {
  const dt = Math.min(0.1, Math.max(0.001, input.dt));
  const next: CinematicCameraState = { ...prevCam };

  const horizSpeed = Math.hypot(player.vx, player.vz);
  const totalSpeed = Math.hypot(horizSpeed, player.vy);
  const airSpeedRatio = Math.min(1, totalSpeed / 14.5);

  // 1. Manual Look Grace Timer & Smooth Non-Snapping Orbit Alignment
  if (input.isDraggingCamera) {
    next.manualLookGraceTimer = 1.65;
  } else if (next.manualLookGraceTimer > 0) {
    next.manualLookGraceTimer = Math.max(0, next.manualLookGraceTimer - dt);
  }

  const vistaEval = evaluateScenicVistaAtPure(
    player.x,
    player.y,
    player.z,
    player.inCloudBank
  );
  next.activeVistaId = vistaEval.vista ? vistaEval.vista.id : null;
  next.vistaBlend += (vistaEval.blend - next.vistaBlend) * (1 - Math.exp(-3.5 * dt));

  if (
    !input.isDraggingCamera &&
    next.manualLookGraceTimer <= 0 &&
    horizSpeed > 1.15 &&
    !input.selfieMode &&
    (!player.grounded || input.moveZ < -0.12)
  ) {
    const desiredBehindYaw = player.yaw + Math.PI;
    let camDiff = desiredBehindYaw - next.yaw;
    while (camDiff > Math.PI) camDiff -= Math.PI * 2;
    while (camDiff < -Math.PI) camDiff += Math.PI * 2;

    // Gentle speed-modulated alignment rate with angular velocity cap so turning never snaps the camera
    const alignRate = player.grounded ? 0.68 : player.flightMode === 'glide' ? 1.15 : 0.92;
    const maxCamTurnRadPerSec = player.grounded ? 0.85 : 1.35;
    const rawStep = camDiff * (1 - Math.exp(-alignRate * dt));
    const maxStep = maxCamTurnRadPerSec * dt;
    next.yaw += Math.max(-maxStep, Math.min(maxStep, rawStep));
    while (next.yaw > Math.PI) next.yaw -= Math.PI * 2;
    while (next.yaw < -Math.PI) next.yaw += Math.PI * 2;
  }

  // 2. State-Differentiated Camera Distance & FOV (Sit / Idle / Walk / Run / Hover / Glide / Dive + Vista)
  let baseDist = 8.0;
  let baseFov = 60.0;
  let baseTargetOffsetY = 1.62;

  if (input.selfieMode) {
    baseDist = 4.2;
    baseFov = 55.0;
    baseTargetOffsetY = 1.42;
  } else if (player.grounded) {
    if (player.sitMode !== 'none') {
      baseDist = 6.2;
      baseFov = 56.0;
      baseTargetOffsetY = 1.32;
    } else if (horizSpeed < 0.25) {
      baseDist = 7.4;
      baseFov = 58.5;
      baseTargetOffsetY = 1.56;
    } else if (player.locomotionMode === 'run' || player.locomotionMode === 'slide') {
      baseDist = 8.7 + Math.min(0.6, (horizSpeed - 4.5) * 0.15);
      baseFov = 63.0;
      baseTargetOffsetY = 1.68;
    } else {
      baseDist = 8.0;
      baseFov = 60.0;
      baseTargetOffsetY = 1.62;
    }
  } else {
    // Airborne states: Takeoff -> Hover -> Glide -> High-Speed Dive / Wind Tunnel
    if (player.isDiving) {
      baseDist = 12.8 + airSpeedRatio * 1.4;
      baseFov = 72.0 + airSpeedRatio * 3.0;
      baseTargetOffsetY = 1.65;
    } else if (player.flightMode === 'glide') {
      baseDist =
        10.8 +
        airSpeedRatio * 1.8 +
        (player.inWindTunnel ? 0.9 : 0);
      baseFov =
        66.5 +
        airSpeedRatio * 4.5 +
        (player.inWindTunnel ? 2.5 : 0);
      baseTargetOffsetY = 1.86;
    } else {
      // Hover / Jump
      baseDist = 9.3 + airSpeedRatio * 0.8;
      baseFov = 62.5 + airSpeedRatio * 2.0;
      baseTargetOffsetY = 1.74;
    }
  }

  const targetDist = Math.max(
    3.6,
    Math.min(
      16.5,
      baseDist +
        (input.selfieMode ? 0 : vistaEval.distBonus + next.userZoomOffset)
    )
  );
  next.distance += (targetDist - next.distance) * (1 - Math.exp(-4.8 * dt));

  const targetFov = input.photoModeOpen
    ? input.photoFov
    : Math.max(
        50,
        Math.min(78, baseFov + (input.selfieMode ? 0 : vistaEval.fovBonus))
      );
  next.fov += (targetFov - next.fov) * (1 - Math.exp(-5.5 * dt));

  // 3. Dynamic Screen Composition (Rule-of-Thirds + Velocity Look-Ahead) & Pivot Follow Delay
  const effectiveYaw = input.selfieMode ? player.yaw + Math.PI : next.yaw;
  const camRightX = Math.cos(effectiveYaw);
  const camRightZ = -Math.sin(effectiveYaw);

  // Subtle lateral composition shift when turning or moving across the frame so character isn't locked to dead center
  const lateralOffset = input.selfieMode
    ? 0
    : Math.max(-0.75, Math.min(0.75, -input.turnRate * 0.38));

  // Forward velocity look-ahead leads the player's motion
  const lookAheadScale = input.selfieMode
    ? 0
    : player.grounded
      ? 0.20
      : player.flightMode === 'glide'
        ? 0.26
        : 0.18;
  const lookAheadX = Math.max(-2.1, Math.min(2.1, player.vx * lookAheadScale));
  const lookAheadZ = Math.max(-2.1, Math.min(2.1, player.vz * lookAheadScale));
  const lookAheadY = input.selfieMode
    ? 0
    : Math.max(-0.75, Math.min(1.05, player.vy * 0.11));

  // Landing cushion dip & Scenic Vista elevation lift
  const landingDipY =
    player.grounded && (player.landingCushionTimer > 0 || player.landingStiffTimer > 0)
      ? -0.14
      : 0;
  const vistaLiftY = !input.selfieMode ? next.vistaBlend * 0.42 : 0;

  let desiredFocusX =
    player.x + lookAheadX + camRightX * lateralOffset;
  let desiredFocusY =
    player.y + baseTargetOffsetY + lookAheadY + landingDipY + vistaLiftY;
  let desiredFocusZ =
    player.z + lookAheadZ + camRightZ * lateralOffset;

  // Gently blend look-at focus toward active Scenic Vista landmark focal point (max 18%) without stealing control
  if (vistaEval.vista && !input.selfieMode && vistaEval.blend > 0.01) {
    const v = vistaEval.vista;
    const lookBlend = v.lookAtBlendMax * vistaEval.blend;
    desiredFocusX += Math.max(-3.2, Math.min(3.2, (v.focalX - desiredFocusX) * lookBlend));
    desiredFocusY += Math.max(-1.5, Math.min(2.4, (v.focalY - desiredFocusY) * lookBlend));
    desiredFocusZ += Math.max(-3.2, Math.min(3.2, (v.focalZ - desiredFocusZ) * lookBlend));
  }

  const isLargeTeleport =
    Math.hypot(player.x - prevCam.focusX, player.z - prevCam.focusZ) > 18.0 ||
    Math.abs(player.y - prevCam.focusY) > 18.0;

  // Separate horizontal vs vertical pivot spring rates (so takeoff & small jumps have a silky vertical follow lag)
  const focusHorizRate = player.grounded ? 9.2 : 8.4;
  const focusVertRate =
    player.takeoffTimer > 0
      ? 5.2
      : !player.grounded
        ? 6.8
        : 10.5;
  const alphaFH = isLargeTeleport ? 1.0 : 1 - Math.exp(-focusHorizRate * dt);
  const alphaFV = isLargeTeleport ? 1.0 : 1 - Math.exp(-focusVertRate * dt);

  next.focusX += (desiredFocusX - next.focusX) * alphaFH;
  next.focusY += (desiredFocusY - next.focusY) * alphaFV;
  next.focusZ += (desiredFocusZ - next.focusZ) * alphaFH;

  // 4. Desired Orbit Camera Position & Obstacle / Terrain Anti-Clipping
  const vistaPitchBias =
    vistaEval.vista && !input.selfieMode
      ? vistaEval.vista.pitchBias * vistaEval.blend
      : 0;
  const effectivePitch = Math.max(
    -0.25,
    Math.min(0.88, next.pitch + vistaPitchBias)
  );

  const idealCamX = next.focusX + Math.sin(effectiveYaw) * next.distance;
  const idealCamZ = next.focusZ + Math.cos(effectiveYaw) * next.distance;
  const idealCamY =
    player.y +
    (player.grounded ? 2.55 : player.flightMode === 'glide' ? 3.35 : 3.05) +
    effectivePitch * 4.6;

  const obsCheck = computeCameraObstacleClearancePure(
    next.focusX,
    next.focusY,
    next.focusZ,
    idealCamX,
    idealCamY,
    idealCamZ
  );

  // Asymmetric collision spring: pull in quickly when approaching an obstacle, ease out smoothly when clear
  const colRate =
    obsCheck.safeRatio < next.smoothedCollisionRatio ? 14.5 : 4.6;
  next.smoothedCollisionRatio = isLargeTeleport
    ? obsCheck.safeRatio
    : next.smoothedCollisionRatio +
      (obsCheck.safeRatio - next.smoothedCollisionRatio) *
        (1 - Math.exp(-colRate * dt));

  const effectiveDist = next.distance * next.smoothedCollisionRatio;
  let desiredCamX =
    next.focusX + Math.sin(effectiveYaw) * effectiveDist + obsCheck.deflectX;
  let desiredCamZ =
    next.focusZ + Math.cos(effectiveYaw) * effectiveDist + obsCheck.deflectZ;
  let desiredCamY = idealCamY;

  // 6-Sample Terrain & Cliff Anti-Clipping Sweep from focus pivot to camera endpoint
  for (let s = 1; s <= 6; s++) {
    const frac = s / 6;
    const sx = next.focusX + (desiredCamX - next.focusX) * frac;
    const sz = next.focusZ + (desiredCamZ - next.focusZ) * frac;
    const sy = next.focusY + (desiredCamY - next.focusY) * frac;
    const terrainClearY = groundHeightAt(sx, sz) + 1.18;
    if (sy < terrainClearY) {
      desiredCamY += (terrainClearY - sy) / frac;
    }
  }

  // Smooth camera position follow with decoupled horizontal/vertical damping
  const posHorizRate = player.grounded ? 8.8 : 9.6;
  const posVertRate = player.takeoffTimer > 0 ? 5.6 : player.grounded ? 9.5 : 7.5;
  const alphaPH = isLargeTeleport ? 1.0 : 1 - Math.exp(-posHorizRate * dt);
  const alphaPV = isLargeTeleport ? 1.0 : 1 - Math.exp(-posVertRate * dt);

  next.camX += (desiredCamX - next.camX) * alphaPH;
  next.camY += (desiredCamY - next.camY) * alphaPV;
  next.camZ += (desiredCamZ - next.camZ) * alphaPH;

  // 5. Aerial Horizon Roll Sympathy (smoothly banks camera horizon during glide/dive turns, levels out on landing)
  const targetRoll =
    !player.grounded && !input.selfieMode && (player.flightMode === 'glide' || player.isDiving)
      ? Math.max(-0.14, Math.min(0.14, -player.roll * 0.18))
      : 0;
  next.roll += (targetRoll - next.roll) * (1 - Math.exp(-6.5 * dt));
  if (Math.abs(next.roll) < 0.001 && targetRoll === 0) {
    next.roll = 0;
  }

  return next;
}

// ============================================================================
// MODULE 4 UPGRADE: OVERALL ART DIRECTION, LIGHTING, ATMOSPHERE & SKY SYSTEM
// (Unified Healing Color System, Sub-Zone Biome Themes, Volumetric God-Rays,
//  Highlight-Safe Filmic Exposure, & Multi-Layer Terrain/Cloud Shading)
// ============================================================================

export interface RegionalBiomeTheme {
  id: string;
  name: string;
  x: number;
  z: number;
  innerRadius: number;
  outerRadius: number;
  skyTopTint: string;
  skyHorizonTint: string;
  fogTint: string;
  fogDensityMultiplier: number;
  godRayColor: string;
  godRayBoost: number;
  auroraBoost: number;
}

export const REGIONAL_BIOME_THEMES: RegionalBiomeTheme[] = [
  {
    id: 'biome_echo_cavern',
    name: '幽光晶石洞窟·冷翠微光',
    x: -18.5,
    z: -16.0,
    innerRadius: 7.0,
    outerRadius: 19.0,
    skyTopTint: '#133B5C',
    skyHorizonTint: '#5EC2D6',
    fogTint: '#4BA8BE',
    fogDensityMultiplier: 1.18,
    godRayColor: '#8CE9F7',
    godRayBoost: 0.14,
    auroraBoost: 0.15,
  },
  {
    id: 'biome_sanctuary_islands',
    name: '圣岛海螺群岛·晴海暖金',
    x: 52.0,
    z: -28.0,
    innerRadius: 12.0,
    outerRadius: 32.0,
    skyTopTint: '#1B6CA8',
    skyHorizonTint: '#FBE0B4',
    fogTint: '#F5E4C8',
    fogDensityMultiplier: 0.85,
    godRayColor: '#FFF3C4',
    godRayBoost: 0.12,
    auroraBoost: 0.0,
  },
  {
    id: 'biome_citadel_sky',
    name: '千鸟落日天城·流霞玫瑰',
    x: 46.0,
    z: -68.0,
    innerRadius: 14.0,
    outerRadius: 34.0,
    skyTopTint: '#3A2875',
    skyHorizonTint: '#F498A8',
    fogTint: '#F8BDC8',
    fogDensityMultiplier: 0.82,
    godRayColor: '#FDE293',
    godRayBoost: 0.15,
    auroraBoost: 0.25,
  },
  {
    id: 'biome_grandma_treehouse',
    name: '老奶奶秘密树屋·暖林琥珀',
    x: -54.0,
    z: -32.0,
    innerRadius: 10.0,
    outerRadius: 26.0,
    skyTopTint: '#1B433E',
    skyHorizonTint: '#E5B47A',
    fogTint: '#C89E6E',
    fogDensityMultiplier: 1.15,
    godRayColor: '#FDE68A',
    godRayBoost: 0.18,
    auroraBoost: 0.0,
  },
  {
    id: 'biome_aurora_colosseum',
    name: '欧若拉星河剧场·极光星夜',
    x: 0.0,
    z: -148.0,
    innerRadius: 18.0,
    outerRadius: 42.0,
    skyTopTint: '#11163B',
    skyHorizonTint: '#5E54A4',
    fogTint: '#484088',
    fogDensityMultiplier: 0.88,
    godRayColor: '#C4B5FD',
    godRayBoost: 0.10,
    auroraBoost: 0.75,
  },
  {
    id: 'biome_hermit_snow_peak',
    name: '隐士雪峰冰屋·寒晶晚照',
    x: 96.0,
    z: 64.0,
    innerRadius: 12.0,
    outerRadius: 30.0,
    skyTopTint: '#2E3B78',
    skyHorizonTint: '#F2B5D4',
    fogTint: '#E2C8E8',
    fogDensityMultiplier: 0.92,
    godRayColor: '#E0F2FE',
    godRayBoost: 0.08,
    auroraBoost: 0.35,
  },
  {
    id: 'biome_abyss_coral',
    name: '深海珊瑚渊·碧海荧光',
    x: -108.0,
    z: 68.0,
    innerRadius: 12.0,
    outerRadius: 30.0,
    skyTopTint: '#0D2B3E',
    skyHorizonTint: '#228B9E',
    fogTint: '#1B6F82',
    fogDensityMultiplier: 1.22,
    godRayColor: '#67E8F9',
    godRayBoost: 0.16,
    auroraBoost: 0.2,
  },
  {
    id: 'biome_celestial_observatory',
    name: '云端天星观景浮岛·星穹琉璃',
    x: -28.0,
    z: -80.0,
    innerRadius: 10.0,
    outerRadius: 26.0,
    skyTopTint: '#1E295B',
    skyHorizonTint: '#93C5FD',
    fogTint: '#BAE6FD',
    fogDensityMultiplier: 0.78,
    godRayColor: '#FEF08A',
    godRayBoost: 0.18,
    auroraBoost: 0.45,
  },
  {
    id: 'biome_canyon_ruins',
    name: '东境云谷遗迹·暖霞金辉',
    x: 42.0,
    z: -6.0,
    innerRadius: 8.0,
    outerRadius: 22.0,
    skyTopTint: '#284E78',
    skyHorizonTint: '#FCD392',
    fogTint: '#FDE6B8',
    fogDensityMultiplier: 0.88,
    godRayColor: '#FDE047',
    godRayBoost: 0.15,
    auroraBoost: 0.1,
  },
];

export interface AtmosphericVisualProfile {
  realmId: RealmId;
  dayNightPhase: DayNightPhase;
  localThemeName: string;
  skyTopColor: string;
  skyMidColor: string;
  skyHorizonColor: string;
  fogColor: string;
  fogDensity: number;
  sunColor: string;
  sunIntensity: number;
  sunDirection: { x: number; y: number; z: number };
  hemiSkyColor: string;
  hemiGroundColor: string;
  hemiIntensity: number;
  rimLightColor: string;
  rimLightIntensity: number;
  cloudColor: string;
  cloudShadowColor: string;
  godRayColor: string;
  godRayOpacity: number;
  starfieldIntensity: number;
  auroraIntensity: number;
  toneMappingExposure: number;
}

function parseHexToRgb01(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  const num = parseInt(clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.padEnd(6, '0').slice(0, 6), 16);
  if (Number.isNaN(num)) return [0.8, 0.85, 0.9];
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

function rgb01ToHex(r: number, g: number, b: number): string {
  const clampByte = (v: number) => Math.max(0, Math.min(255, Math.round(v * 255)));
  const hr = clampByte(r).toString(16).padStart(2, '0');
  const hg = clampByte(g).toString(16).padStart(2, '0');
  const hb = clampByte(b).toString(16).padStart(2, '0');
  return `#${hr}${hg}${hb}`.toUpperCase();
}

/**
 * Pure color interpolation helper that also softly desaturates overly neon hues
 * so all realm and time-of-day transitions maintain a cohesive, gentle healing palette.
 */
export function blendHexColorsPure(
  hexA: string,
  hexB: string,
  t: number,
  maxSaturation = 0.82
): string {
  const clampedT = Math.max(0, Math.min(1, t));
  const [rA, gA, bA] = parseHexToRgb01(hexA);
  const [rB, gB, bB] = parseHexToRgb01(hexB);
  let r = rA + (rB - rA) * clampedT;
  let g = gA + (gB - gA) * clampedT;
  let b = bA + (bB - bA) * clampedT;

  // Softly tame excessive saturation so colors never look garish or neon
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  const sat = maxC > 0.001 ? (maxC - minC) / maxC : 0;
  if (sat > maxSaturation) {
    const pull = (sat - maxSaturation) * 0.55;
    r = r + (luma - r) * pull;
    g = g + (luma - g) * pull;
    b = b + (luma - b) * pull;
  }

  return rgb01ToHex(r, g, b);
}

/**
 * Pure function computing the complete Module 4 Atmospheric, Lighting, Sky, Fog & Post-Processing
 * profile for any realm, time-of-day phase, and player 3D position.
 */
export function computeAtmosphericVisualProfilePure(
  realmId: RealmId,
  phase: DayNightPhase,
  playerX = 0,
  playerY = 1.2,
  playerZ = 6,
  inCloudBank = false
): AtmosphericVisualProfile {
  const realm = REALMS[realmId];
  const atmo = getDayNightAtmosphere(phase);

  // When phase === 'noon', preserve each realm's unique signature color palette;
  // When phase !== 'noon' (morning, sunset, starry_night), blend 68% time-of-day atmosphere with 32% realm signature!
  const phaseBlend = phase === 'noon' ? 0.0 : 0.68;

  let skyTopColor = blendHexColorsPure(realm.skyTopColor, atmo.skyTopColor, phaseBlend, 0.78);
  let skyHorizonColor = blendHexColorsPure(
    realm.skyHorizonColor,
    atmo.skyHorizonColor,
    phaseBlend,
    0.82
  );
  let fogColor = blendHexColorsPure(realm.fogColor, atmo.fogColor, phaseBlend, 0.80);
  let sunColor = blendHexColorsPure(realm.sunColor, atmo.sunColor, phaseBlend, 0.75);
  let hemiSkyColor = blendHexColorsPure(realm.hemiSkyColor, atmo.hemiSkyColor, phaseBlend, 0.78);
  let hemiGroundColor = blendHexColorsPure(
    realm.hemiGroundColor,
    atmo.hemiGroundColor,
    phaseBlend,
    0.72
  );
  let cloudColor = blendHexColorsPure(realm.cloudColor, atmo.cloudColor, phaseBlend, 0.76);

  let fogDensity =
    realm.fogDensity * (1 - phaseBlend) + atmo.fogDensity * phaseBlend;
  let rawSunIntensity =
    realm.sunIntensity * (1 - phaseBlend) + atmo.sunIntensity * phaseBlend;

  // Evaluate local sub-zone biome color theme
  let localThemeName = `${realm.name.split('·')[0].trim()}·${atmo.label}`;
  let godRayColor = blendHexColorsPure(sunColor, skyHorizonColor, 0.35, 0.78);
  let godRayBoost = 0;
  let auroraBoost = 0;

  for (const biome of REGIONAL_BIOME_THEMES) {
    const dist = Math.hypot(playerX - biome.x, playerZ - biome.z);
    if (dist < biome.outerRadius) {
      const rawT =
        dist <= biome.innerRadius
          ? 1.0
          : 1.0 - (dist - biome.innerRadius) / Math.max(0.1, biome.outerRadius - biome.innerRadius);
      const smoothT = rawT * rawT * (3 - 2 * rawT) * 0.62;
      if (smoothT > 0.05) {
        skyTopColor = blendHexColorsPure(skyTopColor, biome.skyTopTint, smoothT, 0.78);
        skyHorizonColor = blendHexColorsPure(skyHorizonColor, biome.skyHorizonTint, smoothT, 0.80);
        fogColor = blendHexColorsPure(fogColor, biome.fogTint, smoothT, 0.78);
        fogDensity *= 1 + (biome.fogDensityMultiplier - 1) * smoothT;
        godRayColor = blendHexColorsPure(godRayColor, biome.godRayColor, smoothT, 0.80);
        godRayBoost += biome.godRayBoost * smoothT;
        auroraBoost += biome.auroraBoost * smoothT;
        if (smoothT > 0.25) {
          localThemeName = biome.name;
        }
      }
    }
  }

  // Ensure fogColor seamlessly harmonizes with skyHorizonColor for natural aerial perspective
  fogColor = blendHexColorsPure(fogColor, skyHorizonColor, 0.42, 0.78);
  const skyMidColor = blendHexColorsPure(skyTopColor, skyHorizonColor, 0.54, 0.78);
  const cloudShadowColor = blendHexColorsPure(skyTopColor, hemiGroundColor, 0.38, 0.68);

  // Altitude-based atmospheric thinning: high altitude views open up slightly while valleys retain cozy mist
  const altitudeThinning = Math.max(0.76, Math.min(1.05, 1.0 - (playerY - 4.0) * 0.008));
  fogDensity = Math.max(0.0022, Math.min(0.0072, fogDensity * altitudeThinning * 0.64));

  // Sun direction shifts naturally across Morning -> Noon -> Sunset -> Starry Night
  const rawSunPos =
    phase === 'morning'
      ? { x: 38, y: 24, z: -22 }
      : phase === 'sunset'
        ? { x: -36, y: 19, z: -32 }
        : phase === 'starry_night'
          ? { x: -18, y: 34, z: -38 }
          : { x: 24, y: 42, z: -18 };
  const sunLen = Math.hypot(rawSunPos.x, rawSunPos.y, rawSunPos.z) || 1;
  const sunDirection = {
    x: rawSunPos.x / sunLen,
    y: rawSunPos.y / sunLen,
    z: rawSunPos.z / sunLen,
  };

  // Clamp sun & hemisphere intensities so white/gold surfaces never clip or overexpose
  const sunIntensity = Math.max(0.95, Math.min(1.88, rawSunIntensity * 0.78));
  const hemiIntensity =
    phase === 'starry_night' ? 0.58 : phase === 'sunset' ? 0.68 : 0.74;

  const rimLightColor = blendHexColorsPure(skyHorizonColor, '#7DD3FC', 0.45, 0.76);
  const rimLightIntensity = phase === 'starry_night' ? 0.48 : 0.62;

  // Volumetric God-Ray opacity (stronger in dawn/dusk/forest/prairie shafts, softer at night)
  const baseGodRay =
    phase === 'starry_night'
      ? 0.08
      : phase === 'morning' || phase === 'sunset'
        ? 0.24
        : realmId === 'forest'
          ? 0.26
          : 0.18;
  const godRayOpacity = Math.max(0.06, Math.min(0.36, baseGodRay + godRayBoost));

  // Starfield & Aurora visibility
  const starfieldIntensity =
    phase === 'starry_night' || realmId === 'vault'
      ? 0.95
      : phase === 'sunset' || realmId === 'home' || realmId === 'eden'
        ? 0.52
        : phase === 'morning'
          ? 0.25
          : 0.08;

  const baseAurora =
    realmId === 'vault' || phase === 'starry_night'
      ? 0.65
      : realmId === 'home' || realmId === 'valley' || phase === 'sunset'
        ? 0.38
        : 0.12;
  const auroraIntensity = Math.max(0, Math.min(1.0, baseAurora + auroraBoost));

  // Highlight-Safe Filmic Exposure Adaptation (prevents overexposure in bright snow/clouds)
  let baseExposure =
    phase === 'starry_night'
      ? 1.02
      : phase === 'noon' && (realmId === 'prairie' || realmId === 'valley')
        ? 0.90
        : 0.94;
  if (inCloudBank) {
    baseExposure -= 0.04;
  }
  const toneMappingExposure = Math.max(0.84, Math.min(1.04, baseExposure));

  return {
    realmId,
    dayNightPhase: phase,
    localThemeName,
    skyTopColor,
    skyMidColor,
    skyHorizonColor,
    fogColor,
    fogDensity,
    sunColor,
    sunIntensity,
    sunDirection,
    hemiSkyColor,
    hemiGroundColor,
    hemiIntensity,
    rimLightColor,
    rimLightIntensity,
    cloudColor,
    cloudShadowColor,
    godRayColor,
    godRayOpacity,
    starfieldIntensity,
    auroraIntensity,
    toneMappingExposure,
  };
}

/**
 * Pure helper computing multi-layered vertex colors + analytical Ambient Occlusion (AO)
 * for the 520x520m continent terrain so ground, slopes, shorelines, and cliffs have
 * organic painterly gradation instead of a flat single-color plastic surface.
 */
export function computeTerrainVertexColorPure(
  vx: number,
  vy: number,
  vz: number,
  ny: number,
  primaryHex: string,
  secondaryHex: string,
  horizonHex: string
): [number, number, number] {
  const [pR, pG, pB] = parseHexToRgb01(primaryHex);
  const [sR, sG, sB] = parseHexToRgb01(secondaryHex);
  const [hR, hG, hB] = parseHexToRgb01(horizonHex);

  // 1. Organic spatial meadow dapple wave [0..1]
  const meadowWave =
    0.5 +
    0.32 * Math.sin(vx * 0.075 + vz * 0.06) +
    0.18 * Math.cos(vx * 0.19 - vz * 0.14);
  let r = pR * (1 - meadowWave * 0.45) + sR * (meadowWave * 0.45);
  let g = pG * (1 - meadowWave * 0.45) + sG * (meadowWave * 0.45);
  let b = pB * (1 - meadowWave * 0.45) + sB * (meadowWave * 0.45);

  // 2. Warm coastal sand / shallow shore transition near water level (vy < 0.72m)
  if (vy < 0.72) {
    const shoreT = Math.max(0, Math.min(1, (0.72 - vy) / 0.75));
    const sandR = 0.84 * 0.7 + hR * 0.3;
    const sandG = 0.76 * 0.7 + hG * 0.3;
    const sandB = 0.62 * 0.7 + hB * 0.3;
    r = r * (1 - shoreT * 0.65) + sandR * (shoreT * 0.65);
    g = g * (1 - shoreT * 0.65) + sandG * (shoreT * 0.65);
    b = b * (1 - shoreT * 0.65) + sandB * (shoreT * 0.65);
  }

  // 3. Steep cliff rock & high-altitude sunlit ridge highlights
  const slopeSteepness = Math.max(0, Math.min(1, (0.88 - ny) / 0.42));
  if (slopeSteepness > 0.02) {
    // Warm weathered limestone-slate cliff tone
    const rockR = 0.56 * 0.75 + hR * 0.25;
    const rockG = 0.58 * 0.75 + hG * 0.25;
    const rockB = 0.63 * 0.75 + hB * 0.25;
    r = r * (1 - slopeSteepness * 0.7) + rockR * (slopeSteepness * 0.7);
    g = g * (1 - slopeSteepness * 0.7) + rockG * (slopeSteepness * 0.7);
    b = b * (1 - slopeSteepness * 0.7) + rockB * (slopeSteepness * 0.7);
  }

  if (vy > 3.6) {
    const ridgeT = Math.max(0, Math.min(1, (vy - 3.6) / 11.0)) * 0.34;
    r = r * (1 - ridgeT) + hR * ridgeT;
    g = g * (1 - ridgeT) + hG * ridgeT;
    b = b * (1 - ridgeT) + hB * ridgeT;
  }

  // 4. Analytical Ambient Occlusion (AO) in low hollows and around stone foundations
  const distCenter = Math.hypot(vx, vz);
  const distTemple = Math.hypot(vx, vz + 50);
  let ao = 1.0;
  if (distCenter < 8.4 && distCenter > 6.4) {
    ao -= 0.12;
  } else if (distTemple < 12.2 && distTemple > 9.2) {
    ao -= 0.14;
  }
  if (ny < 0.82) {
    ao -= (0.82 - ny) * 0.18;
  }
  ao = Math.max(0.76, Math.min(1.04, ao));

  return [
    Math.max(0.04, Math.min(0.98, r * ao)),
    Math.max(0.04, Math.min(0.98, g * ao)),
    Math.max(0.04, Math.min(0.98, b * ao)),
  ];
}

// ============================================================================
// MODULE 6 UPGRADE: ORIGINAL 4-TIER LUMINA SHARD COLLECTION, SECRET LANDMARKS
// COMPENDIUM & EXPLORATION-DRIVEN GROWTH SYSTEM
// ============================================================================

export type LightShardTier =
  | 'dew_glimmer'
  | 'prism_crystal'
  | 'nebula_core'
  | 'aether_crown';

export interface LightShardSpec {
  id: string;
  tier: LightShardTier;
  tierLabel: string;
  icon: string;
  name: string;
  zoneName: string;
  loreHint: string;
  x: number;
  y: number;
  z: number;
  colorHex: string;
  resonancePts: number;
  waxValue: number;
  firstCandlesBonus: number;
  firstHeartsBonus: number;
  firstAscendedBonus: number;
  firstWingedLightBonus: number;
  echoWaxValue: number; // Gentle repeat-visit echo wax when already collected in a previous session
}

export const LUMINA_SHARD_CATALOG: LightShardSpec[] = [
  // Tier 1: 晨露微光碎片 (Dew Glimmer · 6 Shards along ground routes, meadows & bridges)
  {
    id: 'shard_dew_shrine_arch',
    tier: 'dew_glimmer',
    tierLabel: '晨露微光',
    icon: '💧',
    name: '晨露微光 · 迎宾石拱星滴',
    zoneName: '蝴蝶平原 · 迎宾石拱门',
    loreHint: '凝结在古石拱门脚下的第一滴破晓晨露，指引初醒旅人踏入花海。',
    x: 2.8,
    y: groundHeightAt(2.8, -8.0) + 1.05,
    z: -8.0,
    colorHex: '#FDE047',
    resonancePts: 15,
    waxValue: 35,
    firstCandlesBonus: 1,
    firstHeartsBonus: 0,
    firstAscendedBonus: 0,
    firstWingedLightBonus: 0,
    echoWaxValue: 15,
  },
  {
    id: 'shard_dew_reflection_pool',
    tier: 'dew_glimmer',
    tierLabel: '晨露微光',
    icon: '💧',
    name: '晨露微光 · 镜湖浅滩浮珠',
    zoneName: '西侧 · 镜水浅滩池',
    loreHint: '漂浮在清澈浅滩水面的微光水珠，随涟漪轻轻律动。',
    x: -13.2,
    y: groundHeightAt(-13.2, 1.5) + 1.05,
    z: 1.5,
    colorHex: '#FDE047',
    resonancePts: 15,
    waxValue: 35,
    firstCandlesBonus: 1,
    firstHeartsBonus: 0,
    firstAscendedBonus: 0,
    firstWingedLightBonus: 0,
    echoWaxValue: 15,
  },
  {
    id: 'shard_dew_aviary_teahouse',
    tier: 'dew_glimmer',
    tierLabel: '晨露微光',
    icon: '💧',
    name: '晨露微光 · 云巢茶歇暖星',
    zoneName: '南境 · 云巢八角茶亭',
    loreHint: '茶亭檐角垂落的一缕暖金微光，带着炉火与花茶的余温。',
    x: -3.8,
    y: groundHeightAt(-3.8, 26.5) + 1.1,
    z: 26.5,
    colorHex: '#FDE047',
    resonancePts: 15,
    waxValue: 35,
    firstCandlesBonus: 1,
    firstHeartsBonus: 0,
    firstAscendedBonus: 0,
    firstWingedLightBonus: 0,
    echoWaxValue: 15,
  },
  {
    id: 'shard_dew_creek_bridge',
    tier: 'dew_glimmer',
    tierLabel: '晨露微光',
    icon: '💧',
    name: '晨露微光 · 溪谷拱桥流萤',
    zoneName: '西南 · 荧光蘑菇溪谷与古石拱桥',
    loreHint: '古石拱桥桥洞旁聚集的流萤光滴，伴随潺潺水声闪烁。',
    x: -22.5,
    y: groundHeightAt(-22.5, 16.5) + 1.1,
    z: 16.5,
    colorHex: '#FDE047',
    resonancePts: 15,
    waxValue: 35,
    firstCandlesBonus: 1,
    firstHeartsBonus: 0,
    firstAscendedBonus: 0,
    firstWingedLightBonus: 0,
    echoWaxValue: 15,
  },
  {
    id: 'shard_dew_slide_crest',
    tier: 'dew_glimmer',
    tierLabel: '晨露微光',
    icon: '💧',
    name: '晨露微光 · 东岭滑道跃星',
    zoneName: '东侧 · 陡坡起跳高台',
    loreHint: '悬于东侧高台滑道顶端的微光星滴，鼓励旅人迎风助跑起跳。',
    x: 23.5,
    y: groundHeightAt(23.5, 0.0) + 1.2,
    z: 0.0,
    colorHex: '#FDE047',
    resonancePts: 15,
    waxValue: 35,
    firstCandlesBonus: 1,
    firstHeartsBonus: 0,
    firstAscendedBonus: 0,
    firstWingedLightBonus: 0,
    echoWaxValue: 15,
  },
  {
    id: 'shard_dew_temple_steps',
    tier: 'dew_glimmer',
    tierLabel: '晨露微光',
    icon: '💧',
    name: '晨露微光 · 神殿石阶引路光',
    zoneName: '北境 · 长老神庙石阶',
    loreHint: '静候在长老神庙长阶前的守望星滴，见证旅人一路前行的足迹。',
    x: 2.5,
    y: groundHeightAt(2.5, -38.0) + 1.15,
    z: -38.0,
    colorHex: '#FDE047',
    resonancePts: 15,
    waxValue: 35,
    firstCandlesBonus: 1,
    firstHeartsBonus: 0,
    firstAscendedBonus: 0,
    firstWingedLightBonus: 0,
    echoWaxValue: 15,
  },

  // Tier 2: 星棱晶簇碎片 (Prism Crystal · 4 Shards in caverns, ruins & towers)
  {
    id: 'shard_prism_echo_cavern',
    tier: 'prism_crystal',
    tierLabel: '星棱晶簇',
    icon: '💎',
    name: '星棱晶簇 · 幽谷回音翠晶',
    zoneName: '幽光洞窟 · 晶石秘境',
    loreHint: '洞窟深处共鸣生长的冷翠棱晶，靠近时会发出清澈的空谷泛音。',
    x: -19.5,
    y: groundHeightAt(-19.5, -18.0) + 1.35,
    z: -18.0,
    colorHex: '#38BDF8',
    resonancePts: 30,
    waxValue: 60,
    firstCandlesBonus: 2,
    firstHeartsBonus: 0,
    firstAscendedBonus: 0,
    firstWingedLightBonus: 0,
    echoWaxValue: 20,
  },
  {
    id: 'shard_prism_bell_belfry',
    tier: 'prism_crystal',
    tierLabel: '星棱晶簇',
    icon: '💎',
    name: '星棱晶簇 · 三塔钟鸣琉璃',
    zoneName: '三塔钟楼村落',
    loreHint: '受三塔古钟声波凝聚而成的琉璃棱晶，折射着晴空与云海的流光。',
    x: 18.2,
    y: groundHeightAt(18.2, -25.5) + 1.4,
    z: -25.5,
    colorHex: '#38BDF8',
    resonancePts: 30,
    waxValue: 60,
    firstCandlesBonus: 2,
    firstHeartsBonus: 0,
    firstAscendedBonus: 0,
    firstWingedLightBonus: 0,
    echoWaxValue: 20,
  },
  {
    id: 'shard_prism_fallen_colossus',
    tier: 'prism_crystal',
    tierLabel: '星棱晶簇',
    icon: '💎',
    name: '星棱晶簇 · 守望巨人掌心晶',
    zoneName: '遗落巨人山谷 · 守望者残像',
    loreHint: '倾颓的远古守望石像历经千年仍护在掌心的不灭星棱晶簇。',
    x: -25.0,
    y: groundHeightAt(-25.0, -4.5) + 1.45,
    z: -4.5,
    colorHex: '#38BDF8',
    resonancePts: 30,
    waxValue: 60,
    firstCandlesBonus: 2,
    firstHeartsBonus: 0,
    firstAscendedBonus: 0,
    firstWingedLightBonus: 0,
    echoWaxValue: 20,
  },
  {
    id: 'shard_prism_broken_aqueduct',
    tier: 'prism_crystal',
    tierLabel: '星棱晶簇',
    icon: '💎',
    name: '星棱晶簇 · 云海断桥引航晶',
    zoneName: '云海断桥遗迹 · 引星渡槽',
    loreHint: '悬浮于断裂渡槽尽头的引航棱晶，指向东侧高空断桥浮屿。',
    x: 31.5,
    y: groundHeightAt(31.5, -12.5) + 2.2,
    z: -12.5,
    colorHex: '#38BDF8',
    resonancePts: 30,
    waxValue: 60,
    firstCandlesBonus: 2,
    firstHeartsBonus: 0,
    firstAscendedBonus: 0,
    firstWingedLightBonus: 0,
    echoWaxValue: 20,
  },

  // Tier 3: 云海星核碎片 (Nebula Core · 4 Shards on floating islands & sanctuaries)
  {
    id: 'shard_nebula_west_step_1',
    tier: 'nebula_core',
    tierLabel: '云海星核',
    icon: '🔮',
    name: '云海星核 · 西境一阶微风核',
    zoneName: '西境云阶浮岛 · 一阶微风台',
    loreHint: '托举西境第一级浮空岛的旋转星云核心，蕴含丰沛的高空风能。',
    x: -30.5,
    y: 9.5 + 1.5,
    z: -27.0,
    colorHex: '#C084FC',
    resonancePts: 50,
    waxValue: 80,
    firstCandlesBonus: 2,
    firstHeartsBonus: 1,
    firstAscendedBonus: 0,
    firstWingedLightBonus: 0,
    echoWaxValue: 25,
  },
  {
    id: 'shard_nebula_nw_step_2',
    tier: 'nebula_core',
    tierLabel: '云海星核',
    icon: '🔮',
    name: '云海星核 · 西北流云飞瀑核',
    zoneName: '西北云海浮岛 · 二阶流云屿',
    loreHint: '在海拔 14.8m 悬空飞瀑源头流转的星核，吸收后可令斗篷流光溢彩。',
    x: -46.5,
    y: 14.8 + 1.5,
    z: -52.5,
    colorHex: '#C084FC',
    resonancePts: 50,
    waxValue: 80,
    firstCandlesBonus: 2,
    firstHeartsBonus: 1,
    firstAscendedBonus: 0,
    firstWingedLightBonus: 0,
    echoWaxValue: 25,
  },
  {
    id: 'shard_nebula_east_canyon',
    tier: 'nebula_core',
    tierLabel: '云海星核',
    icon: '🔮',
    name: '云海星核 · 东境断桥飞跃核',
    zoneName: '东境云谷断桥浮屿 · 飞跃跳板',
    loreHint: '衔接东岭与圣岛群峰的空中星核，记录着远古翼族横跨裂谷的航迹。',
    x: 43.2,
    y: 11.2 + 1.5,
    z: -5.2,
    colorHex: '#C084FC',
    resonancePts: 50,
    waxValue: 80,
    firstCandlesBonus: 2,
    firstHeartsBonus: 1,
    firstAscendedBonus: 0,
    firstWingedLightBonus: 0,
    echoWaxValue: 25,
  },
  {
    id: 'shard_nebula_sanctuary_geyser',
    tier: 'nebula_core',
    tierLabel: '云海星核',
    icon: '🔮',
    name: '云海星核 · 圣岛海螺潮汐核',
    zoneName: '圣岛 · 海螺间歇泉群岛',
    loreHint: '与圣岛白鲸歌声共鸣的潮汐星核，散发着晴海与暖霞交融的辉光。',
    x: 50.0,
    y: groundHeightAt(50.0, -26.5) + 1.5,
    z: -26.5,
    colorHex: '#C084FC',
    resonancePts: 50,
    waxValue: 80,
    firstCandlesBonus: 2,
    firstHeartsBonus: 1,
    firstAscendedBonus: 0,
    firstWingedLightBonus: 0,
    echoWaxValue: 25,
  },

  // Tier 4: 苍穹王冠圣辉 (Aether Crown · 2 Apex Shards at high-altitude summits)
  {
    id: 'shard_aether_celestial_crown',
    tier: 'aether_crown',
    tierLabel: '苍穹圣辉',
    icon: '👑',
    name: '苍穹圣辉 · 云端天星浑天冕',
    zoneName: '云端天星观景浮岛 · 秘境穹顶',
    loreHint: '悬浮于海拔 21.5m 天星观景台浑天仪中心的至高圣辉，赐予永久翼阶成长与升华洗礼。',
    x: -28.0,
    y: 21.5 + 1.85,
    z: -78.2,
    colorHex: '#F472B6',
    resonancePts: 85,
    waxValue: 100,
    firstCandlesBonus: 3,
    firstHeartsBonus: 2,
    firstAscendedBonus: 2,
    firstWingedLightBonus: 1,
    echoWaxValue: 35,
  },
  {
    id: 'shard_aether_sundial_zenith',
    tier: 'aether_crown',
    tierLabel: '苍穹圣辉',
    icon: '👑',
    name: '苍穹圣辉 · 远古日晷天顶冕',
    zoneName: '正南中域 · 远古日晷八星柱剧场',
    loreHint: '在八星柱日晷方尖碑正上方凝聚的太阳圣辉，象征星光王国的永恒盟约。',
    x: 0.0,
    y: groundHeightAt(0.0, 62.0) + 2.2,
    z: 60.2,
    colorHex: '#F472B6',
    resonancePts: 85,
    waxValue: 100,
    firstCandlesBonus: 3,
    firstHeartsBonus: 2,
    firstAscendedBonus: 2,
    firstWingedLightBonus: 1,
    echoWaxValue: 35,
  },
];

export interface SecretLandmarkCompendiumEntry {
  id: string;
  name: string;
  category: 'floating_island' | 'story_mural';
  subtitle: string;
  x: number;
  y: number;
  z: number;
  discoverRadius: number;
  resonanceRewardPts: number;
}

export const SECRET_EXPLORATION_LANDMARKS: SecretLandmarkCompendiumEntry[] = [
  ...FLOATING_SKY_ISLANDS.map((isl) => ({
    id: isl.id,
    name: isl.name,
    category: 'floating_island' as const,
    subtitle: isl.subtitle,
    x: isl.x,
    y: isl.y,
    z: isl.z,
    discoverRadius: isl.outerRadius,
    resonanceRewardPts: 25,
  })),
  ...ANCIENT_STORY_MURALS.filter(
    (m) => m.id !== 'mural_celestial_stargazer_crown'
  ).map((m) => ({
    id: m.id,
    name: m.zoneName,
    category: 'story_mural' as const,
    subtitle: m.visualStoryTheme,
    x: m.x,
    y: m.y,
    z: m.z,
    discoverRadius: m.radius,
    resonanceRewardPts: 25,
  })),
  {
    id: 'mural_celestial_stargazer_crown',
    name: '失落观星圣坛 · 苍穹浑天仪碑',
    category: 'story_mural',
    subtitle: '高空浮岛之巅的古老浑天仪与观星石座，无字诉说星辰王国的辉煌历史',
    x: -28.0,
    y: 21.5,
    z: -80.0,
    discoverRadius: 6.8,
    resonanceRewardPts: 30,
  },
];

export interface NearbyLuminaShardEvaluation {
  nearestShard: LightShardSpec | null;
  distance3d: number;
  isAlreadyCollected: boolean;
  isWithinVisualHintRadius: boolean; // <= 14.5m soft proximity visual hint
  isWithinCollectRadius: boolean; // <= 2.65m automatic magnetic absorption
  proximityIntensity: number; // 0..1 smooth pulse intensity
}

/**
 * Pure helper evaluating proximity to the 16 Lumina Shards across the world:
 * - Within 14.5m: triggers soft proximity visual hint (glowing tether / HUD resonance pulse)
 * - Within 2.65m: triggers magnetic absorption (or repeat-session echo resonance if not yet echoed this session)
 */
export function evaluateNearbyLuminaShardPure(
  px: number,
  py: number,
  pz: number,
  collectedShardIds: string[],
  sessionEchoedShardIds: string[] = []
): NearbyLuminaShardEvaluation {
  let bestShard: LightShardSpec | null = null;
  let bestScoreDist = Infinity;
  let bestRawDist = Infinity;

  for (const shard of LUMINA_SHARD_CATALOG) {
    const isCollected = collectedShardIds.includes(shard.id);
    const isEchoedThisSession = sessionEchoedShardIds.includes(shard.id);
    if (isCollected && isEchoedThisSession) {
      continue;
    }

    const dx = shard.x - px;
    const dy = shard.y - (py + 1.0);
    const dz = shard.z - pz;
    const rawDist = Math.hypot(dx, dy, dz);
    // Prioritize uncollected shards slightly when distances are similar
    const scoreDist = isCollected ? rawDist + 3.0 : rawDist;
    if (scoreDist < bestScoreDist) {
      bestScoreDist = scoreDist;
      bestRawDist = rawDist;
      bestShard = shard;
    }
  }

  if (!bestShard) {
    return {
      nearestShard: null,
      distance3d: Infinity,
      isAlreadyCollected: false,
      isWithinVisualHintRadius: false,
      isWithinCollectRadius: false,
      proximityIntensity: 0,
    };
  }

  const isAlreadyCollected = collectedShardIds.includes(bestShard.id);
  const hintRadius = 11.5;
  const collectRadius = 2.65;
  const isWithinVisualHintRadius = bestRawDist <= hintRadius;
  const isWithinCollectRadius = bestRawDist <= collectRadius;
  const proximityIntensity = isWithinVisualHintRadius
    ? Math.max(0.08, Math.min(1.0, 1.0 - (bestRawDist - collectRadius) / (hintRadius - collectRadius)))
    : 0;

  return {
    nearestShard: bestShard,
    distance3d: Number(bestRawDist.toFixed(2)),
    isAlreadyCollected,
    isWithinVisualHintRadius,
    isWithinCollectRadius,
    proximityIntensity: Number(proximityIntensity.toFixed(3)),
  };
}

/**
 * Pure helper checking if the player has just entered an undiscovered Secret Exploration Landmark.
 */
export function findNewlyDiscoveredSecretLandmarkAtPure(
  px: number,
  py: number,
  pz: number,
  discoveredSecretZoneIds: string[]
): SecretLandmarkCompendiumEntry | null {
  for (const entry of SECRET_EXPLORATION_LANDMARKS) {
    if (discoveredSecretZoneIds.includes(entry.id)) continue;
    const distXZ = Math.hypot(px - entry.x, pz - entry.z);
    const altDiff = Math.abs(py - entry.y);
    if (distXZ <= entry.discoverRadius && altDiff <= 6.5) {
      return entry;
    }
  }
  return null;
}

// ============================================================================
// MODULE 8 UPGRADE: PLAYER SOCIAL, CO-OP MECHANISMS, PARTNER FOLLOW & NETWORK HONESTY
// (Strict Distinction Between Real Online Players vs. Local AI Companions,
//  Contextual Proximity Social Prompts, Multi-Player Co-op Mechanisms,
//  Partner Follow Mode, and Shared Scenic / Emotional Resonance)
// ============================================================================

export interface SocialPeerSnapshot {
  playerId: string;
  name: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  grounded?: boolean;
  flightMode?: 'hover' | 'glide';
  sitMode?: string;
  activeEmote?: string | null;
  isBot: boolean;
}

export type ProximityQuickActionType =
  | 'ignite'
  | 'wave_greet'
  | 'dance'
  | 'sit_together'
  | 'friend_request'
  | 'high_five'
  | 'hug'
  | 'hand_hold'
  | 'follow_partner';

export interface NearbySocialPeerEvaluation {
  nearestPeer: SocialPeerSnapshot | null;
  distance3d: number;
  isWithinPromptRadius: boolean; // <= 4.5m triggers contextual non-intrusive HUD prompt
  peerSourceType: 'real_online_player' | 'local_ai_companion' | null;
  peerSourceBadge: string;
  ignited: boolean;
  isFriend: boolean;
  unlockLevel: number;
  displayName: string;
  availableQuickActions: ProximityQuickActionType[];
}

/**
 * Pure helper evaluating the closest unblocked traveler within `promptRadius` (default 4.5m).
 * Strictly distinguishes real WebSocket/BroadcastChannel online players (`!peer.isBot`)
 * from local single-player AI companions (`peer.isBot`).
 */
export function evaluateNearbySocialPeerPure(
  px: number,
  py: number,
  pz: number,
  peers: SocialPeerSnapshot[],
  friendsMap: Record<
    string,
    {
      nickname?: string;
      ignited?: boolean;
      isFriend?: boolean;
      unlockLevel?: number;
    }
  > = {},
  blockedIds: string[] = [],
  promptRadius = 4.5
): NearbySocialPeerEvaluation {
  let bestPeer: SocialPeerSnapshot | null = null;
  let bestDist = Infinity;

  for (const peer of peers) {
    if (blockedIds.includes(peer.playerId)) continue;
    const dx = peer.x - px;
    const dy = (peer.y || 0) - py;
    const dz = peer.z - pz;
    const dist = Math.hypot(dx, dy * 0.5, dz);
    // Slightly prioritize real online players if at identical distance
    const scoreDist = peer.isBot ? dist : dist - 0.15;
    if (scoreDist < bestDist) {
      bestDist = dist;
      bestPeer = peer;
    }
  }

  if (!bestPeer || bestDist > promptRadius) {
    return {
      nearestPeer: null,
      distance3d: bestPeer ? Number(bestDist.toFixed(2)) : Infinity,
      isWithinPromptRadius: false,
      peerSourceType: null,
      peerSourceBadge: '',
      ignited: false,
      isFriend: false,
      unlockLevel: 0,
      displayName: '',
      availableQuickActions: [],
    };
  }

  const record = friendsMap[bestPeer.playerId];
  const ignited = Boolean(record?.ignited);
  const isFriend = Boolean(record?.isFriend);
  const unlockLevel = record?.unlockLevel ?? (isFriend ? 1 : 0);
  const peerSourceType = bestPeer.isBot
    ? 'local_ai_companion'
    : 'real_online_player';
  const peerSourceBadge = bestPeer.isBot
    ? '🤖 本地AI旅伴'
    : '🌐 真实联机玩家';
  const displayName = ignited
    ? record?.nickname || bestPeer.name
    : '未点亮的陌生旅人 (心火剪影)';

  const actions: ProximityQuickActionType[] = [];
  if (!ignited) {
    actions.push('ignite', 'wave_greet');
  } else {
    actions.push('wave_greet', 'dance', 'sit_together', 'follow_partner');
    if (!isFriend) {
      actions.push('friend_request');
    } else {
      actions.push('hand_hold', 'high_five', 'hug');
    }
  }

  return {
    nearestPeer: bestPeer,
    distance3d: Number(bestDist.toFixed(2)),
    isWithinPromptRadius: true,
    peerSourceType,
    peerSourceBadge,
    ignited,
    isFriend,
    unlockLevel,
    displayName,
    availableQuickActions: actions,
  };
}

export interface CoopMechanismEvaluation {
  mechanismId: string;
  mechanismName: string;
  participantCount: number;
  requiredParticipants: number;
  canActivate: boolean;
  chargeProgress01: number;
  realHumanParticipants: number;
  aiCompanionParticipants: number;
  participantLabels: string[];
  statusHint: string;
}

/**
 * Pure helper evaluating multi-player / companion co-op mechanism readiness (`coop_door`).
 * Counts both real connected players and summoned AI companions standing within `activationRadius` (default 5.8m).
 */
export function evaluateCoopMechanismPure(
  px: number,
  py: number,
  pz: number,
  mechanism: { id: string; name: string; x: number; y: number; z: number },
  peers: SocialPeerSnapshot[],
  requiredParticipants = 2,
  activationRadius = 5.8
): CoopMechanismEvaluation {
  const localDist = Math.hypot(px - mechanism.x, pz - mechanism.z);
  const localInRange = localDist <= activationRadius;

  let realHumanParticipants = localInRange ? 1 : 0;
  let aiCompanionParticipants = 0;
  const participantLabels: string[] = [];

  if (localInRange) {
    participantLabels.push('你 [🌐 本地玩家]');
  }

  for (const peer of peers) {
    const d = Math.hypot(peer.x - mechanism.x, peer.z - mechanism.z);
    if (d <= activationRadius) {
      if (peer.isBot) {
        aiCompanionParticipants += 1;
        participantLabels.push(`${peer.name} [🤖 本地AI旅伴]`);
      } else {
        realHumanParticipants += 1;
        participantLabels.push(`${peer.name} [🌐 真实联机玩家]`);
      }
    }
  }

  const participantCount = realHumanParticipants + aiCompanionParticipants;
  const canActivate = participantCount >= requiredParticipants;
  const chargeProgress01 = Number(
    Math.min(1, participantCount / Math.max(1, requiredParticipants)).toFixed(2)
  );

  const statusHint = canActivate
    ? `✦ 双人星芒共鸣已就绪 (${participantCount}/${requiredParticipants} 人) · 按 [E] 协力开启「${mechanism.name}」！`
    : `⏳ 需 ${requiredParticipants} 名旅人同时就位 (${participantCount}/${requiredParticipants} 人) · 点击「🔔 呼唤旅伴协力」或等待联机好友靠近`;

  return {
    mechanismId: mechanism.id,
    mechanismName: mechanism.name,
    participantCount,
    requiredParticipants,
    canActivate,
    chargeProgress01,
    realHumanParticipants,
    aiCompanionParticipants,
    participantLabels,
    statusHint,
  };
}

export interface SharedEmotionalMomentEvaluation {
  active: boolean;
  momentType:
    | 'none'
    | 'shared_bench'
    | 'shared_hand_hold_flight'
    | 'shared_scenic_vista'
    | 'shared_music_duet';
  title: string;
  subtitle: string;
  partnerName: string;
  partnerIsBot: boolean;
  wingRechargeBonusPerSec: number;
  waxBonusOnce: number;
}

/**
 * Pure helper evaluating warm emotional co-experiences (co-sitting on bench, hand-hold flight,
 * co-viewing a Scenic Vista, or musical duet harmony) with an ignited partner within 4.8m.
 */
export function evaluateSharedEmotionalMomentPure(
  px: number,
  py: number,
  pz: number,
  sitMode: string,
  dualActionMode: 'none' | 'hand_hold' | 'carry',
  inScenicVistaName: string | null,
  isPlayingMusicOrDance: boolean,
  peers: SocialPeerSnapshot[],
  friendsMap: Record<string, { nickname?: string; ignited?: boolean; isFriend?: boolean }> = {}
): SharedEmotionalMomentEvaluation {
  let closestIgnitedPeer: SocialPeerSnapshot | null = null;
  let bestDist = Infinity;

  for (const peer of peers) {
    const rec = friendsMap[peer.playerId];
    if (!rec?.ignited && !rec?.isFriend) continue;
    const d = Math.hypot(peer.x - px, peer.z - pz);
    if (d <= 4.8 && d < bestDist) {
      bestDist = d;
      closestIgnitedPeer = peer;
    }
  }

  if (!closestIgnitedPeer) {
    return {
      active: false,
      momentType: 'none',
      title: '',
      subtitle: '',
      partnerName: '',
      partnerIsBot: false,
      wingRechargeBonusPerSec: 0,
      waxBonusOnce: 0,
    };
  }

  const partnerName =
    friendsMap[closestIgnitedPeer.playerId]?.nickname || closestIgnitedPeer.name;
  const roleTag = closestIgnitedPeer.isBot ? '🤖 AI旅伴' : '🌐 联机好友';

  if (dualActionMode === 'hand_hold' || dualActionMode === 'carry') {
    return {
      active: true,
      momentType: 'shared_hand_hold_flight',
      title: '🤝 并肩同行 · 心火共飞',
      subtitle: `正与 ${partnerName} (${roleTag}) 同步翱翔 · 翼能互助持续恢复中`,
      partnerName,
      partnerIsBot: closestIgnitedPeer.isBot,
      wingRechargeBonusPerSec: 1.45,
      waxBonusOnce: 15,
    };
  }

  if (sitMode === 'sit_bench') {
    return {
      active: true,
      momentType: 'shared_bench',
      title: '🪑 长椅夜话 · 烛光静坐',
      subtitle: `与 ${partnerName} (${roleTag}) 同坐石椅共赏云海 · 自由密语已开启`,
      partnerName,
      partnerIsBot: closestIgnitedPeer.isBot,
      wingRechargeBonusPerSec: 1.6,
      waxBonusOnce: 20,
    };
  }

  if (isPlayingMusicOrDance) {
    return {
      active: true,
      momentType: 'shared_music_duet',
      title: '🎵 星光和鸣 · 共舞同欢',
      subtitle: `与 ${partnerName} (${roleTag}) 心意相通合奏共舞 · 传递温暖微光`,
      partnerName,
      partnerIsBot: closestIgnitedPeer.isBot,
      wingRechargeBonusPerSec: 1.35,
      waxBonusOnce: 15,
    };
  }

  if (inScenicVistaName || sitMode === 'sit_ground') {
    const vistaTitle = inScenicVistaName
      ? inScenicVistaName.split('·')[0].trim()
      : '云海静谧草坡';
    return {
      active: true,
      momentType: 'shared_scenic_vista',
      title: `✨ 共赏胜景 · ${vistaTitle}`,
      subtitle: `与 ${partnerName} (${roleTag}) 并肩眺望远方奇观 · 心火共鸣加成`,
      partnerName,
      partnerIsBot: closestIgnitedPeer.isBot,
      wingRechargeBonusPerSec: 1.25,
      waxBonusOnce: 20,
    };
  }

  return {
    active: false,
    momentType: 'none',
    title: '',
    subtitle: '',
    partnerName: '',
    partnerIsBot: false,
    wingRechargeBonusPerSec: 0,
    waxBonusOnce: 0,
  };
}

/**
 * Pure helper stepping the local player when in Partner Follow Mode (`🧭 跟随伙伴探索`).
 * Smoothly guides the player behind/beside the followed leader and automatically cancels
 * if the player provides manual directional input (`manualInputMagnitude > 0.15`).
 */
export function computeFollowerStepPure(
  follower: { x: number; y: number; z: number; yaw: number },
  leader: {
    x: number;
    y: number;
    z: number;
    yaw: number;
    grounded?: boolean;
    flightMode?: 'hover' | 'glide';
  },
  manualInputMagnitude: number,
  dt: number
): {
  cancelledByInput: boolean;
  x: number;
  y: number;
  z: number;
  yaw: number;
  grounded: boolean;
  flightMode: 'hover' | 'glide';
} {
  if (manualInputMagnitude > 0.15) {
    return {
      cancelledByInput: true,
      x: follower.x,
      y: follower.y,
      z: follower.z,
      yaw: follower.yaw,
      grounded: leader.grounded ?? true,
      flightMode: leader.flightMode ?? 'hover',
    };
  }

  const safeDt = Math.min(0.1, Math.max(0.001, dt));
  const trailDist = 1.65;
  const targetX = leader.x - Math.sin(leader.yaw) * trailDist;
  const targetZ = leader.z - Math.cos(leader.yaw) * trailDist;
  const targetY =
    leader.grounded === false ? leader.y : groundHeightAt(targetX, targetZ);

  const alpha = 1 - Math.exp(-8.5 * safeDt);
  const nextX = follower.x + (targetX - follower.x) * alpha;
  const nextY = follower.y + (targetY - follower.y) * alpha;
  const nextZ = follower.z + (targetZ - follower.z) * alpha;

  const dx = leader.x - nextX;
  const dz = leader.z - nextZ;
  const desiredYaw = Math.hypot(dx, dz) > 0.05 ? Math.atan2(dx, dz) : leader.yaw;
  const diffYaw = Math.atan2(
    Math.sin(desiredYaw - follower.yaw),
    Math.cos(desiredYaw - follower.yaw)
  );
  const nextYaw = follower.yaw + diffYaw * alpha;

  return {
    cancelledByInput: false,
    x: nextX,
    y: nextY,
    z: nextZ,
    yaw: nextYaw,
    grounded: leader.grounded ?? true,
    flightMode: leader.flightMode ?? 'hover',
  };
}

/**
 * Pure helper for idempotent network event deduplication across WebSocket + BroadcastChannel
 * or reconnect flushes so emotes, calls, chat, and co-op activations never double-trigger.
 */
export function deduplicateNetworkEventPure(
  eventId: string | undefined,
  seenEventIds: string[],
  maxRingBufferSize = 120
): {
  isDuplicate: boolean;
  nextSeenEventIds: string[];
} {
  if (!eventId) {
    return { isDuplicate: false, nextSeenEventIds: seenEventIds };
  }
  if (seenEventIds.includes(eventId)) {
    return { isDuplicate: true, nextSeenEventIds: seenEventIds };
  }
  const next = [...seenEventIds, eventId];
  if (next.length > maxRingBufferSize) {
    next.splice(0, next.length - maxRingBufferSize);
  }
  return { isDuplicate: false, nextSeenEventIds: next };
}

// ============================================================================
// MODULE 9 (EIGHTH MODULE): UI & INTERACTION EXPERIENCE PURE HELPERS
// ============================================================================

export type ActiveInputDeviceType = 'keyboard' | 'gamepad' | 'touch';

export type ContextualHintCategory =
  | 'none'
  | 'collect'
  | 'interact'
  | 'coop'
  | 'social'
  | 'flight_dive'
  | 'flight_glide'
  | 'flight_hover'
  | 'walk_run'
  | 'sit';

export interface ContextualControlHintEvaluation {
  visible: boolean;
  category: ContextualHintCategory;
  icon: string;
  primaryText: string;
  keybindLabel: string;
  opacity01: number;
  isEphemeralTimedOut: boolean;
}

/**
 * Pure helper evaluating contextual, state-driven operation hints (walking, flying, diving,
 * interacting, collecting, co-op, and sitting).
 * Enforces the anti-permanence rule: continuous locomotion/idle hints automatically fade out
 * after `maxDisplaySec` (default 4.2s) in the same state so hints never stay permanently
 * burned into the screen.
 */
export function evaluateContextualControlHintPure(params: {
  grounded: boolean;
  locomotionMode: string;
  flightMode: 'hover' | 'glide';
  isDiving: boolean;
  sitMode: string;
  wingEnergy: number;
  inWindTunnel?: boolean;
  nearestInteractable?: { id: string; name: string; type: string } | null;
  nearbyLuminaShard?: {
    isWithinVisualHintRadius: boolean;
    nearestShard: { id: string; name: string; tierLabel: string } | null;
    isAlreadyCollected: boolean;
  } | null;
  nearbySocialPeer?: {
    isWithinPromptRadius: boolean;
    displayName: string;
    ignited: boolean;
  } | null;
  coopEval?: {
    mechanismName: string;
    canActivate: boolean;
    participantCount: number;
    requiredParticipants: number;
  } | null;
  stateAgeSec: number;
  inputDevice?: ActiveInputDeviceType;
  maxDisplaySec?: number;
}): ContextualControlHintEvaluation {
  const device = params.inputDevice || 'keyboard';
  const maxSec = params.maxDisplaySec ?? 4.2;

  const keyInteract =
    device === 'gamepad' ? '[X / ⬜]' : device === 'touch' ? '[点击按钮]' : '[E / F]';
  const keyFlap =
    device === 'gamepad' ? '[A / ✕]' : device === 'touch' ? '[点击振翅]' : '[Space]';
  const keyFlightToggle =
    device === 'gamepad' ? '[RB / R1]' : device === 'touch' ? '[切换模式]' : '[Shift]';
  const keyDive =
    device === 'gamepad' ? '[B / ◯]' : device === 'touch' ? '[按住俯冲]' : '[X]';
  const keyCall =
    device === 'gamepad' ? '[Y / △]' : device === 'touch' ? '[点击呼唤]' : '[Q]';
  const keyMove =
    device === 'gamepad' ? '[左摇杆]' : device === 'touch' ? '[左下摇杆]' : '[WASD]';

  //Compute ephemeral fade for steady states (fades smoothly between maxSec - 1.0 and maxSec)
  const isTimedOut = params.stateAgeSec > maxSec;
  const steadyOpacity = isTimedOut
    ? 0
    : params.stateAgeSec > maxSec - 1.0
      ? Number(Math.max(0, maxSec - params.stateAgeSec).toFixed(2))
      : 1;

  // 1. Highest priority: Co-op mechanism right in front of the player
  if (params.coopEval) {
    if (params.coopEval.canActivate) {
      return {
        visible: true,
        category: 'coop',
        icon: '✨',
        primaryText: `双人星芒共鸣已满 (${params.coopEval.participantCount}/${params.coopEval.requiredParticipants}) · 开启「${params.coopEval.mechanismName}」`,
        keybindLabel: `${keyInteract} 协力开启`,
        opacity01: 1,
        isEphemeralTimedOut: false,
      };
    }
    return {
      visible: !isTimedOut,
      category: 'coop',
      icon: '🚪',
      primaryText: `靠近「${params.coopEval.mechanismName}」· 需 ${params.coopEval.requiredParticipants} 人同时就位`,
      keybindLabel: '点击 [呼唤旅伴] 协力',
      opacity01: steadyOpacity,
      isEphemeralTimedOut: isTimedOut,
    };
  }

  // 2. Collectible Lumina Shard or Winged Light in range
  if (
    params.nearbyLuminaShard?.isWithinVisualHintRadius &&
    params.nearbyLuminaShard.nearestShard
  ) {
    const shard = params.nearbyLuminaShard.nearestShard;
    return {
      visible: true,
      category: 'collect',
      icon: '💎',
      primaryText: params.nearbyLuminaShard.isAlreadyCollected
        ? `感应到「${shard.name}」星光回响`
        : `发现${shard.tierLabel}「${shard.name}」`,
      keybindLabel: `${keyInteract} 吸收光能`,
      opacity01: 1,
      isEphemeralTimedOut: false,
    };
  }

  if (params.nearestInteractable) {
    const item = params.nearestInteractable;
    const isCollectible =
      item.type === 'winged_light' || item.type === 'easter_egg';
    return {
      visible: true,
      category: isCollectible ? 'collect' : 'interact',
      icon: isCollectible ? '🌟' : '🕯️',
      primaryText: isCollectible
        ? `发现光之馈赠「${item.name}」`
        : `靠近「${item.name}」`,
      keybindLabel: `${keyInteract} ${isCollectible ? '拾取共鸣' : '点亮互动'}`,
      opacity01: 1,
      isEphemeralTimedOut: false,
    };
  }

  // 3. Nearby Traveler Social Prompt
  if (params.nearbySocialPeer?.isWithinPromptRadius) {
    return {
      visible: !isTimedOut,
      category: 'social',
      icon: params.nearbySocialPeer.ignited ? '🤝' : '🕯️',
      primaryText: params.nearbySocialPeer.ignited
        ? `与「${params.nearbySocialPeer.displayName}」相遇 · 可挥手、牵手或跟随`
        : '靠近陌生旅人剪影 · 递出烛火照亮彼此',
      keybindLabel: params.nearbySocialPeer.ignited ? '点击互动栏' : '点亮心火',
      opacity01: steadyOpacity,
      isEphemeralTimedOut: isTimedOut,
    };
  }

  // 4. Aerial Flight States (Dive / Glide / Hover) — Ephemeral (fades after maxSec)
  if (!params.grounded) {
    if (params.isDiving) {
      return {
        visible: !isTimedOut,
        category: 'flight_dive',
        icon: '☄️',
        primaryText: '高空收翼俯冲蓄势中 · 松开俯冲可转化为强力升空',
        keybindLabel: `松开 ${keyDive} 拉起升空`,
        opacity01: steadyOpacity,
        isEphemeralTimedOut: isTimedOut,
      };
    }
    if (params.flightMode === 'glide') {
      return {
        visible: !isTimedOut,
        category: 'flight_glide',
        icon: params.inWindTunnel ? '🌬️' : '🕊️',
        primaryText: params.inWindTunnel
          ? '乘风行网道高速滑翔中 · 翼能持续恢复'
          : '展翼滑翔乘风中 · 倾侧方向控制轨迹',
        keybindLabel: `${keyMove} 转向 · ${keyDive} 俯冲 · ${keyFlightToggle} 切悬停`,
        opacity01: steadyOpacity,
        isEphemeralTimedOut: isTimedOut,
      };
    }
    return {
      visible: !isTimedOut,
      category: 'flight_hover',
      icon: '🪽',
      primaryText:
        params.wingEnergy <= 0.2
          ? '翼能即将耗尽 · 靠近云层、烛火或长按呼唤回能'
          : '空中悬停升空模式 · 振翅攀升或展开滑翔',
      keybindLabel: `${keyFlap} 振翅 · ${keyFlightToggle} 切滑翔`,
      opacity01: steadyOpacity,
      isEphemeralTimedOut: isTimedOut,
    };
  }

  // 5. Sitting / Meditation State — Ephemeral
  if (params.sitMode && params.sitMode !== 'none' && params.sitMode !== 'stand') {
    return {
      visible: !isTimedOut,
      category: 'sit',
      icon: '🧘',
      primaryText: '静坐冥想与调息中 · 心火微光平稳流淌',
      keybindLabel: `推动 ${keyMove} 或按 [Z] 起身`,
      opacity01: steadyOpacity,
      isEphemeralTimedOut: isTimedOut,
    };
  }

  // 6. Ground Walking / Running State — Ephemeral (fades out after 4.2s)
  if (params.locomotionMode === 'walk' || params.locomotionMode === 'run') {
    return {
      visible: !isTimedOut,
      category: 'walk_run',
      icon: '🌿',
      primaryText:
        params.locomotionMode === 'run'
          ? '疾步穿行云野 · 跃起即可顺势展翼起飞'
          : '漫步探索世界 · 轻推漫步，推满或按 Shift 奔跑',
      keybindLabel: `${keyFlap} 跳跃/起飞 · ${keyCall} 星音呼唤`,
      opacity01: steadyOpacity,
      isEphemeralTimedOut: isTimedOut,
    };
  }

  return {
    visible: false,
    category: 'none',
    icon: '',
    primaryText: '',
    keybindLabel: '',
    opacity01: 0,
    isEphemeralTimedOut: true,
  };
}

export interface ResponsiveUiProfile {
  deviceCategory: 'mobile' | 'tablet' | 'desktop';
  primaryInput: ActiveInputDeviceType;
  isCompactViewport: boolean;
  minTouchTargetPx: number;
  joystickDiameterPx: number;
  dockButtonHeightClass: string;
  dockFontSizeClass: string;
  autoCollapseSecondaryHud: boolean;
}

/**
 * Pure helper computing device & viewport adaptation parameters across PC, Gamepad, Tablet, and Mobile.
 */
export function resolveResponsiveUiProfilePure(
  viewportWidth: number,
  viewportHeight: number,
  hasTouch: boolean,
  gamepadConnected: boolean
): ResponsiveUiProfile {
  const safeW = Math.max(320, viewportWidth || 1440);
  const safeH = Math.max(320, viewportHeight || 900);

  const deviceCategory: 'mobile' | 'tablet' | 'desktop' =
    safeW < 768 ? 'mobile' : safeW < 1100 ? 'tablet' : 'desktop';

  const primaryInput: ActiveInputDeviceType = gamepadConnected
    ? 'gamepad'
    : hasTouch && safeW < 1024
      ? 'touch'
      : 'keyboard';

  const isCompactViewport = safeW < 960 || safeH < 620;
  const minTouchTargetPx =
    deviceCategory === 'mobile' || primaryInput === 'touch' ? 44 : 36;
  const joystickDiameterPx =
    deviceCategory === 'mobile' ? 68 : deviceCategory === 'tablet' ? 62 : 56;

  return {
    deviceCategory,
    primaryInput,
    isCompactViewport,
    minTouchTargetPx,
    joystickDiameterPx,
    dockButtonHeightClass:
      deviceCategory === 'mobile' ? 'h-9 px-3' : 'h-7.5 px-2.5',
    dockFontSizeClass:
      deviceCategory === 'mobile' ? 'text-xs' : 'text-[11px] sm:text-xs',
    autoCollapseSecondaryHud: isCompactViewport,
  };
}

export interface HudBreathingVisibilityState {
  showExpandedCurrencies: boolean;
  showSubZoneLabel: boolean;
  topBarOpacityClass: string;
  bottomDockOpacityClass: string;
  isWhisperMinimalMode: boolean;
}

/**
 * Pure helper determining when in-game HUD elements should auto-recede into
 * Sky-style "Whisper Minimal Mode" so the 3D world remains unobstructed.
 */
export function evaluateHudAutoHideStatePure(params: {
  immersiveModeManual: boolean;
  isHoveringHud: boolean;
  secondsSinceCurrencyChange: number;
  secondsSinceInteraction: number;
  isCompactViewport: boolean;
  hasActiveEmergencyAlert: boolean;
}): HudBreathingVisibilityState {
  if (params.immersiveModeManual && !params.isHoveringHud) {
    return {
      showExpandedCurrencies: false,
      showSubZoneLabel: false,
      topBarOpacityClass: 'opacity-55 hover:opacity-100',
      bottomDockOpacityClass: 'opacity-60 hover:opacity-100',
      isWhisperMinimalMode: true,
    };
  }

  const recentlyChangedCurrency = params.secondsSinceCurrencyChange <= 4.0;
  const recentlyInteracted = params.secondsSinceInteraction <= 3.5;
  const showExpandedCurrencies =
    params.isHoveringHud ||
    recentlyChangedCurrency ||
    (!params.isCompactViewport && recentlyInteracted);

  const isCalmCruising =
    !params.isHoveringHud &&
    !recentlyChangedCurrency &&
    !recentlyInteracted &&
    !params.hasActiveEmergencyAlert;

  return {
    showExpandedCurrencies,
    showSubZoneLabel: !params.isCompactViewport || params.isHoveringHud,
    topBarOpacityClass: isCalmCruising
      ? 'opacity-80 hover:opacity-100'
      : 'opacity-100',
    bottomDockOpacityClass: isCalmCruising
      ? 'opacity-85 hover:opacity-100'
      : 'opacity-100',
    isWhisperMinimalMode: isCalmCruising,
  };
}

// ============================================================================
// MODULE 10 (NINTH MODULE): MUSIC, SPATIAL AUDIO & SOUNDSCAPE PURE HELPERS
// ============================================================================

export type AcousticZoneType =
  | 'meadow_breeze'
  | 'forest_rain_canopy'
  | 'cavern_crystal_echo'
  | 'valley_glacial_wind'
  | 'cloud_sea_aether'
  | 'sanctuary_water_shore';

export type DynamicMusicMood =
  | 'calm_explore'
  | 'soaring_flight'
  | 'mystic_cavern'
  | 'scenic_leitmotif'
  | 'hazard_tension';

export type SpatialEmitterKind =
  | 'campfire_hearth'
  | 'water_stream'
  | 'waterfall_cascade'
  | 'wind_chime_shrine'
  | 'ancient_bell_tower'
  | 'cavern_crystal_spring'
  | 'cloud_updraft_vortex'
  | 'manta_sanctuary_choir';

export interface SpatialSoundEmitterSpec {
  id: string;
  name: string;
  kind: SpatialEmitterKind;
  x: number;
  y: number;
  z: number;
  refDistance: number;
  maxDistance: number;
  baseFreqHz: number;
  description: string;
}

export const WORLD_SPATIAL_SOUND_EMITTERS: SpatialSoundEmitterSpec[] = [
  {
    id: 'emit_home_campfire',
    name: '遇境星盘暖篝火',
    kind: 'campfire_hearth',
    x: 4.5,
    y: 1.2,
    z: 3.5,
    refDistance: 3.5,
    maxDistance: 34.0,
    baseFreqHz: 220.0,
    description: '温暖木柴轻响与星火微鸣',
  },
  {
    id: 'emit_mirror_lake_shore',
    name: '镜湖浅滩流泉',
    kind: 'water_stream',
    x: -14.0,
    y: 0.4,
    z: 10.0,
    refDistance: 5.0,
    maxDistance: 46.0,
    baseFreqHz: 340.0,
    description: '清澈湖水拍岸与潺潺溪流声',
  },
  {
    id: 'emit_temple_bell_spire',
    name: '云端圣殿古钟塔',
    kind: 'ancient_bell_tower',
    x: 0.0,
    y: 13.5,
    z: -48.0,
    refDistance: 8.0,
    maxDistance: 85.0,
    baseFreqHz: 293.66,
    description: '悠远空灵的圣殿铜钟泛音共鸣',
  },
  {
    id: 'emit_east_wind_chime_pavilion',
    name: '东翼晨曦风铃亭',
    kind: 'wind_chime_shrine',
    x: 48.0,
    y: 7.5,
    z: -12.0,
    refDistance: 5.5,
    maxDistance: 52.0,
    baseFreqHz: 587.33,
    description: '随山谷微风轻摇的琉璃风铃清音',
  },
  {
    id: 'emit_west_crystal_cavern_spring',
    name: '西翼幽谷水晶暗泉',
    kind: 'cavern_crystal_spring',
    x: -54.0,
    y: 2.2,
    z: -18.0,
    refDistance: 6.0,
    maxDistance: 55.0,
    baseFreqHz: 440.0,
    description: '洞窟钟乳石水滴与晶簇空灵回响',
  },
  {
    id: 'emit_north_waterfall_cascade',
    name: '北境云崖飞瀑',
    kind: 'waterfall_cascade',
    x: -22.0,
    y: 9.0,
    z: -78.0,
    refDistance: 7.0,
    maxDistance: 68.0,
    baseFreqHz: 260.0,
    description: '高处跌落的云崖飞瀑与水雾轰鸣',
  },
  {
    id: 'emit_sky_island_updraft',
    name: '苍穹浮岛上升气旋',
    kind: 'cloud_updraft_vortex',
    x: 0.0,
    y: 28.0,
    z: -32.0,
    refDistance: 8.0,
    maxDistance: 64.0,
    baseFreqHz: 392.0,
    description: '高空云海暖流盘旋上升的和弦风吟',
  },
  {
    id: 'emit_manta_sanctuary_choir',
    name: '圣岛遥鲲巡游天籁',
    kind: 'manta_sanctuary_choir',
    x: 24.0,
    y: 18.0,
    z: -24.0,
    refDistance: 9.0,
    maxDistance: 75.0,
    baseFreqHz: 523.25,
    description: '远处光之遥鲲群掠过云层的空灵长鸣',
  },
];

export interface SpatialAudioEvaluation {
  emitterId: string;
  emitterName: string;
  emitterKind: SpatialEmitterKind;
  distance3d: number;
  gain01: number;
  panStereo: number; // -1 (left) .. +1 (right)
  lowpassCutoffHz: number; // Air absorption filter
  isAudible: boolean;
}

/**
 * Pure 3D spatial audio calculator: computes smooth inverse-cosine distance attenuation,
 * listener-yaw stereo panning (-1..+1), and air-absorption low-pass filter cutoff.
 */
export function computeSpatialAudioGainAndPanPure(
  listenerX: number,
  listenerY: number,
  listenerZ: number,
  listenerYaw: number,
  emitter: SpatialSoundEmitterSpec
): SpatialAudioEvaluation {
  const dx = emitter.x - listenerX;
  const dy = emitter.y - listenerY;
  const dz = emitter.z - listenerZ;
  const dist3d = Math.hypot(dx, dy, dz);

  if (dist3d >= emitter.maxDistance) {
    return {
      emitterId: emitter.id,
      emitterName: emitter.name,
      emitterKind: emitter.kind,
      distance3d: Number(dist3d.toFixed(2)),
      gain01: 0,
      panStereo: 0,
      lowpassCutoffHz: 1600,
      isAudible: false,
    };
  }

  let gain01 = 1.0;
  if (dist3d > emitter.refDistance) {
    const t = Math.min(
      1,
      Math.max(
        0,
        (dist3d - emitter.refDistance) /
          Math.max(0.001, emitter.maxDistance - emitter.refDistance)
      )
    );
    // Smooth raised-cosine rolloff for natural spatial fade
    gain01 = 0.5 * (1 + Math.cos(Math.PI * t));
    gain01 = Math.pow(gain01, 1.35);
  }

  // Listener forward in our coordinate system: (-sin(yaw), -cos(yaw))
  // Listener right vector: (cos(yaw), -sin(yaw))
  const horizDist = Math.hypot(dx, dz);
  let panStereo = 0;
  if (horizDist > 0.25) {
    const nx = dx / horizDist;
    const nz = dz / horizDist;
    const rightX = Math.cos(listenerYaw);
    const rightZ = -Math.sin(listenerYaw);
    const dotRight = nx * rightX + nz * rightZ;
    panStereo = Math.max(-0.92, Math.min(0.92, dotRight));
  }

  // Distance air absorption: high frequencies attenuate naturally over distance
  const distRatio = Math.min(1, dist3d / Math.max(1, emitter.maxDistance));
  const lowpassCutoffHz = Math.round(14000 - distRatio * 11600);

  return {
    emitterId: emitter.id,
    emitterName: emitter.name,
    emitterKind: emitter.kind,
    distance3d: Number(dist3d.toFixed(2)),
    gain01: Number(gain01.toFixed(3)),
    panStereo: Number(panStereo.toFixed(3)),
    lowpassCutoffHz,
    isAudible: gain01 > 0.015,
  };
}

export interface AcousticSoundscapeProfile {
  acousticZone: AcousticZoneType;
  zoneLabel: string;
  reverbWetMix01: number;
  reverbDecaySec: number;
  echoDelayMs: number;
  windLayerPresence01: number;
  waterLayerPresence01: number;
  birdsongPresence01: number;
  distantChimePresence01: number;
  musicMood: DynamicMusicMood;
  musicThemeTitle: string;
  rootFreqHz: number;
  nearestEmitter: SpatialAudioEvaluation | null;
  audibleEmitters: SpatialAudioEvaluation[];
}

/**
 * Pure helper evaluating the current 3D position, realm, altitude, and movement state
 * to determine the regional ambient soundscape (meadow, forest, cavern, valley, cloud sea, shore),
 * cave/valley reverb parameters, 3D spatial emitters, and adaptive musical theme.
 */
export function evaluateAcousticSoundscapeAtPure(params: {
  realmId: RealmId;
  x: number;
  y: number;
  z: number;
  yaw: number;
  grounded: boolean;
  inCloudBank: boolean;
  inWindTunnel?: boolean;
  horizSpeed: number;
  vy: number;
  isDiving: boolean;
  krillAlertLevel: number;
  activeVistaId?: string | null;
}): AcousticSoundscapeProfile {
  const { x, y, z, yaw, realmId, grounded, inCloudBank } = params;

  // Evaluate all spatial emitters and sort by highest audible gain
  const evaluatedEmitters = WORLD_SPATIAL_SOUND_EMITTERS.map((em) =>
    computeSpatialAudioGainAndPanPure(x, y, z, yaw, em)
  )
    .filter((e) => e.isAudible)
    .sort((a, b) => b.gain01 - a.gain01);

  const nearestEmitter = evaluatedEmitters[0] || null;

  // Determine Acoustic Zone based on 3D altitude, biome coordinates, and realm
  let acousticZone: AcousticZoneType = 'meadow_breeze';
  let zoneLabel = '宁静草原 · 微风与远林鸟鸣';
  let reverbWetMix01 = 0.2;
  let reverbDecaySec = 1.1;
  let echoDelayMs = 120;
  let windLayerPresence01 = 0.35;
  let waterLayerPresence01 = 0.2;
  let birdsongPresence01 = 0.65;
  let distantChimePresence01 = 0.35;

  const isInsideCavern =
    realmId === 'vault' ||
    (x < -38 && z < -6 && y < 12) ||
    (Math.abs(x) < 25 && z < -55 && y < 6);
  const isHighCloudSea =
    !grounded && (y > 16.5 || inCloudBank || Boolean(params.inWindTunnel));
  const isNearWaterShore =
    y < 1.6 && Math.hypot(x + 14, z - 10) < 12;
  const isForestCanopy =
    realmId === 'forest' || (x < -20 && z > 12 && y < 14);
  const isMountainValley =
    realmId === 'valley' || y > 9.5 || z < -36;

  if (isInsideCavern) {
    acousticZone = 'cavern_crystal_echo';
    zoneLabel = '幽暗晶洞 · 钟乳水滴与深邃空间混响';
    reverbWetMix01 = 0.62;
    reverbDecaySec = 2.8;
    echoDelayMs = 245;
    windLayerPresence01 = 0.18;
    waterLayerPresence01 = 0.55;
    birdsongPresence01 = 0.05;
    distantChimePresence01 = 0.72;
  } else if (isHighCloudSea) {
    acousticZone = 'cloud_sea_aether';
    zoneLabel = '高空云海 · 暖流风吟与天际遥鲲共鸣';
    reverbWetMix01 = 0.36;
    reverbDecaySec = 1.9;
    echoDelayMs = 185;
    windLayerPresence01 = 0.78;
    waterLayerPresence01 = 0.05;
    birdsongPresence01 = 0.15;
    distantChimePresence01 = 0.65;
  } else if (isForestCanopy) {
    acousticZone = 'forest_rain_canopy';
    zoneLabel = '静谧林冠 · 细雨叶落与林间生灵清啼';
    reverbWetMix01 = 0.34;
    reverbDecaySec = 1.65;
    echoDelayMs = 155;
    windLayerPresence01 = 0.42;
    waterLayerPresence01 = 0.68;
    birdsongPresence01 = 0.75;
    distantChimePresence01 = 0.4;
  } else if (isMountainValley) {
    acousticZone = 'valley_glacial_wind';
    zoneLabel = '云崖山谷 · 峡谷回风与远方圣殿钟鸣';
    reverbWetMix01 = 0.45;
    reverbDecaySec = 2.15;
    echoDelayMs = 210;
    windLayerPresence01 = 0.64;
    waterLayerPresence01 = 0.22;
    birdsongPresence01 = 0.32;
    distantChimePresence01 = 0.68;
  } else if (isNearWaterShore) {
    acousticZone = 'sanctuary_water_shore';
    zoneLabel = '镜湖浅滩 · 柔波拍岸与浅溪水韵';
    reverbWetMix01 = 0.26;
    reverbDecaySec = 1.35;
    echoDelayMs = 135;
    windLayerPresence01 = 0.3;
    waterLayerPresence01 = 0.82;
    birdsongPresence01 = 0.58;
    distantChimePresence01 = 0.42;
  }

  // Determine Dynamic Music Mood & Original Theme Title
  const realmRootFreq = REALMS[realmId]?.ambientNoteBase || 293.66;
  let musicMood: DynamicMusicMood = 'calm_explore';
  let musicThemeTitle = '《晨露与微风的序曲 · Whisper of Meadow Light》';
  let rootFreqHz = realmRootFreq;

  if (params.krillAlertLevel > 0.15 || realmId === 'eden') {
    musicMood = 'hazard_tension';
    musicThemeTitle = '《逆风星火 · Ember in the Storm》';
    rootFreqHz = 220.0;
  } else if (params.activeVistaId || y > 22.0) {
    musicMood = 'scenic_leitmotif';
    musicThemeTitle = '《苍穹星轨的回响 · Echoes of the Astral Spire》';
    rootFreqHz = realmRootFreq * 1.125; // Uplifting major second modulation
  } else if (isInsideCavern) {
    musicMood = 'mystic_cavern';
    musicThemeTitle = '《幽谷晶簇的夜曲 · Nocturne of Crystal Vaults》';
    rootFreqHz = realmRootFreq * 0.833; // Warm minor-sixth contemplative shift
  } else if (!grounded && (params.horizSpeed > 6.5 || isHighCloudSea)) {
    musicMood = 'soaring_flight';
    musicThemeTitle = '《乘风越过云海 · Wings Above the Cloud Sea》';
    rootFreqHz = realmRootFreq;
  }

  return {
    acousticZone,
    zoneLabel,
    reverbWetMix01: Number(reverbWetMix01.toFixed(2)),
    reverbDecaySec: Number(reverbDecaySec.toFixed(2)),
    echoDelayMs,
    windLayerPresence01: Number(windLayerPresence01.toFixed(2)),
    waterLayerPresence01: Number(waterLayerPresence01.toFixed(2)),
    birdsongPresence01: Number(birdsongPresence01.toFixed(2)),
    distantChimePresence01: Number(distantChimePresence01.toFixed(2)),
    musicMood,
    musicThemeTitle,
    rootFreqHz: Number(rootFreqHz.toFixed(2)),
    nearestEmitter,
    audibleEmitters: evaluatedEmitters,
  };
}

export interface DynamicAudioMixEvaluation {
  effectiveBgmGain: number;
  effectiveAmbientGain: number;
  effectiveSfxGain: number;
  effectiveInstrumentGain: number;
  flightWindGain01: number;
  flightWindFilterHz: number;
  isWindCapped: boolean;
}

/**
 * Pure audio mixer & anti-masking ducking balancer.
 * Ensures flight wind rises naturally with airspeed and diving, while strictly
 * capping wind volume (<= 0.24 * master * ambient) so it NEVER drowns out
 * background music, bird/water ambience, or interaction chimes.
 */
export function computeDynamicAudioMixBalancePure(params: {
  masterVolume: number;
  bgmVolume: number;
  ambientVolume: number;
  sfxVolume: number;
  instrumentVolume: number;
  grounded: boolean;
  horizSpeed: number;
  vy: number;
  isDiving: boolean;
  inCloudBank: boolean;
  isPlayingInstrument: boolean;
  recentImportantSfxTimerSec: number;
}): DynamicAudioMixEvaluation {
  const master = Math.max(0, Math.min(1, params.masterVolume));
  const bgm = Math.max(0, Math.min(1, params.bgmVolume));
  const amb = Math.max(0, Math.min(1, params.ambientVolume));
  const sfx = Math.max(0, Math.min(1, params.sfxVolume));
  const inst = Math.max(0, Math.min(1, params.instrumentVolume));

  // Sidechain ducking: when player plays an instrument or triggers a ceremony/collection chime,
  // gently duck BGM and ambient wind so notes and chimes shine clearly.
  const instDuck = params.isPlayingInstrument ? 0.42 : 1.0;
  const sfxDuck = params.recentImportantSfxTimerSec > 0 ? 0.72 : 1.0;

  const effectiveBgmGain = Number((master * bgm * instDuck * sfxDuck).toFixed(3));
  const effectiveAmbientGain = Number(
    (master * amb * (params.isPlayingInstrument ? 0.65 : 1.0) * sfxDuck).toFixed(3)
  );
  const effectiveSfxGain = Number((master * sfx).toFixed(3));
  const effectiveInstrumentGain = Number((master * inst).toFixed(3));

  // Calculate dynamic flight/glide wind intensity from airspeed
  const totalSpeed = Math.hypot(params.horizSpeed, params.vy);
  const rawWindRatio = params.grounded
    ? Math.min(0.22, totalSpeed / 32.0)
    : Math.min(
        1.0,
        0.18 +
          totalSpeed / 24.0 +
          (params.isDiving ? 0.22 : 0) +
          (params.inCloudBank ? 0.12 : 0)
      );

  // Strict anti-masking ceiling: flight wind can NEVER exceed 0.24 of effective ambient bus
  const maxAllowedWindGain = Number((0.24 * effectiveAmbientGain).toFixed(3));
  const unclampedWindGain = rawWindRatio * 0.32 * effectiveAmbientGain;
  const flightWindGain01 = Number(
    Math.min(maxAllowedWindGain, unclampedWindGain).toFixed(3)
  );
  const isWindCapped = unclampedWindGain >= maxAllowedWindGain && maxAllowedWindGain > 0;

  const flightWindFilterHz = Math.round(
    params.grounded
      ? 360 + totalSpeed * 28
      : 480 + Math.min(1400, totalSpeed * 75 + (params.isDiving ? 380 : 0))
  );

  return {
    effectiveBgmGain,
    effectiveAmbientGain,
    effectiveSfxGain,
    effectiveInstrumentGain,
    flightWindGain01,
    flightWindFilterHz,
    isWindCapped,
  };
}

export interface GenerativeMusicPhraseStep {
  stepIndex: number;
  isRest: boolean;
  harpFreqHz: number;
  fluteFreqHz: number | null;
  padChordFreqsHz: number[];
  stepDurationMs: number;
  harmonicDegreeLabel: string;
}

/**
 * Pure non-repeating generative music phrase engine.
 * Uses golden-ratio / prime-modulo phase stepping across 5 warm harmonic degrees
 * (Imaj9, IVmaj7, V6, vi11, Iadd9) and inserts natural breathing rests so the
 * soundtrack feels alive, healing, and never fatiguing.
 */
export function computeGenerativeMusicStepPure(
  stepIndex: number,
  rootFreqHz: number,
  mood: DynamicMusicMood,
  tempoMultiplier = 1.0
): GenerativeMusicPhraseStep {
  const safeStep = Math.max(0, Math.floor(stepIndex));
  const safeRoot = Math.max(110, Math.min(880, rootFreqHz || 293.66));

  // 5-chord progression cycle (changes every 6 steps)
  const chordProgressions: {
    label: string;
    chordRatios: number[];
    melodyPool: number[];
  }[] = [
    {
      label: 'Imaj9 (星海主音)',
      chordRatios: [1.0, 1.25, 1.5, 1.875],
      melodyPool: [1.0, 1.125, 1.25, 1.5, 1.667, 2.0, 2.25],
    },
    {
      label: 'IVmaj7 (暖云下属)',
      chordRatios: [1.333, 1.667, 2.0, 2.5],
      melodyPool: [1.333, 1.5, 1.667, 2.0, 2.25, 2.667],
    },
    {
      label: 'vi9 (幽谷柔和关系小调)',
      chordRatios: [0.833, 1.0, 1.25, 1.5],
      melodyPool: [0.833, 1.0, 1.125, 1.25, 1.5, 1.667],
    },
    {
      label: 'V6 (乘风属音悬留)',
      chordRatios: [0.75, 1.125, 1.25, 1.5],
      melodyPool: [1.125, 1.25, 1.5, 1.667, 2.0, 2.25],
    },
    {
      label: 'Iadd9 (晨曦归航)',
      chordRatios: [1.0, 1.125, 1.25, 1.5],
      melodyPool: [1.0, 1.25, 1.5, 2.0, 2.25, 2.5],
    },
  ];

  const chordIdx =
    (Math.floor(safeStep / 5) + Math.floor(safeStep / 17)) %
    chordProgressions.length;
  const activeHarmony = chordProgressions[chordIdx];

  // Anti-fatigue breathing rest rule: every phrase naturally pauses on quasi-periodic beats
  const restSlot = (safeStep * 7 + 3) % 11;
  const isRest =
    mood === 'soaring_flight'
      ? restSlot === 0
      : mood === 'scenic_leitmotif'
        ? restSlot === 0
        : restSlot === 0 || restSlot === 5;

  // Non-repeating note index using prime stride + golden-ratio offset
  const noteIdx =
    (safeStep * 3 + Math.floor(safeStep / 4) * 5 + chordIdx * 2) %
    activeHarmony.melodyPool.length;
  const harpRatio = activeHarmony.melodyPool[noteIdx];
  const harpFreqHz = Number((safeRoot * harpRatio).toFixed(2));

  // Counter-melody flute or celesta chime plays on lyrical beats
  const playFlute =
    !isRest &&
    (mood === 'scenic_leitmotif' ||
      mood === 'soaring_flight' ||
      safeStep % 3 === 0);
  const fluteIdx =
    (safeStep * 5 + 1) % activeHarmony.melodyPool.length;
  const fluteFreqHz = playFlute
    ? Number((safeRoot * activeHarmony.melodyPool[fluteIdx] * 1.5).toFixed(2))
    : null;

  const padChordFreqsHz = activeHarmony.chordRatios.map((r) =>
    Number((safeRoot * r * 0.5).toFixed(2))
  );

  // Organic tempo rubato so intervals never feel robotic
  const rubatoFactor =
    1.0 + Math.sin(safeStep * 0.92) * 0.08 + (isRest ? 0.18 : 0);
  const moodTempo =
    mood === 'soaring_flight'
      ? 1.16
      : mood === 'scenic_leitmotif'
        ? 1.05
        : mood === 'mystic_cavern'
          ? 0.86
          : 0.98;
  const effectiveTempo = Math.max(0.65, Math.min(1.45, tempoMultiplier * moodTempo));
  const stepDurationMs = Math.round((940 / effectiveTempo) * rubatoFactor);

  return {
    stepIndex: safeStep,
    isRest,
    harpFreqHz,
    fluteFreqHz,
    padChordFreqsHz,
    stepDurationMs,
    harmonicDegreeLabel: activeHarmony.label,
  };
}

// ============================================================================
// Module 11: Immersion & Micro-Detail Polish Pure Helpers (沉浸感与细节表现升级)
// ============================================================================

export interface OrganicFlickerSample {
  /** Normalized non-mechanical flicker value in [-1, 1] */
  wave: number;
  /** Positive intensity multiplier in [0.78, 1.24] for warm candle/shrine lights */
  intensityMultiplier: number;
  /** 3D curl-like drift offsets for organic particles & foliage gusts */
  driftX: number;
  driftY: number;
  driftZ: number;
}

/**
 * Pure non-mechanical multi-harmonic wave generator (Perlin-like 3-prime-frequency superposition).
 * Ensures candle lights, shrine braziers, firefly particles, and wind gusts never oscillate mechanically.
 */
export function computeOrganicFlickerPure(
  elapsed: number,
  seed = 0
): OrganicFlickerSample {
  const t = Math.max(0, elapsed);
  const phaseA = seed * 1.6180339;
  const phaseB = seed * 2.7182818 + 1.13;
  const phaseC = seed * 3.1415926 + 2.47;

  // Superposition of 3 incommensurate frequencies (1.73Hz, 4.19Hz, 8.93Hz)
  const w1 = Math.sin(t * 1.73 + phaseA) * 0.56;
  const w2 = Math.sin(t * 4.19 + phaseB) * 0.31;
  const w3 = Math.cos(t * 8.93 + phaseC) * 0.13;
  const wave = Math.max(-1, Math.min(1, Number((w1 + w2 + w3).toFixed(4))));

  const intensityMultiplier = Number((1.0 + wave * 0.22).toFixed(4));

  const driftX = Number(
    (
      Math.sin(t * 0.83 + phaseA) * 0.65 +
      Math.cos(t * 2.17 + phaseB) * 0.35
    ).toFixed(4)
  );
  const driftY = Number(
    (
      Math.sin(t * 1.29 + phaseB) * 0.6 +
      Math.sin(t * 3.07 + phaseC) * 0.4
    ).toFixed(4)
  );
  const driftZ = Number(
    (
      Math.cos(t * 0.97 + phaseC) * 0.65 +
      Math.sin(t * 2.41 + phaseA) * 0.35
    ).toFixed(4)
  );

  return {
    wave,
    intensityMultiplier,
    driftX,
    driftY,
    driftZ,
  };
}

export interface IdleMicroBehaviorPose {
  /** Curious head glance yaw in radians */
  headGlanceYaw: number;
  /** Curious head glance pitch in radians (positive = looking slightly skyward) */
  headGlancePitch: number;
  /** Subtle head tilt roll in radians */
  headGlanceRoll: number;
  /** Subtle torso weight-shift roll in radians */
  weightShiftRoll: number;
  /** Calibrated hips Y height >= 0.858 so feet NEVER clip below ground */
  safeHipsY: number;
  /** Left/right knee relaxation angles matched to safeHipsY */
  kneeRelaxL: number;
  kneeRelaxR: number;
  /** Active micro-behavior phase label for telemetry/tests */
  microBehaviorPhase: 'calm_breath' | 'skyward_gaze' | 'horizon_glance' | 'weight_shift';
}

/**
 * Pure idle micro-behavior generator for the Sky Child when standing still.
 * Produces natural, non-robotic curious head glances, skyward gazes, and soft weight shifts
 * while guaranteeing `safeHipsY >= 0.858` so the character's feet never clip into the ground.
 */
export function computeIdleMicroBehaviorPure(
  elapsed: number
): IdleMicroBehaviorPose {
  const t = Math.max(0, elapsed);
  // 14-second organic behavioral cycle
  const cyclePos = t % 14.0;

  let headGlanceYaw = 0;
  let headGlancePitch = 0;
  let headGlanceRoll = 0;
  let microBehaviorPhase: IdleMicroBehaviorPose['microBehaviorPhase'] = 'calm_breath';

  if (cyclePos >= 2.2 && cyclePos < 5.6) {
    // Phase 1: Curious horizon glance to the left/right
    microBehaviorPhase = 'horizon_glance';
    const localT = (cyclePos - 2.2) / 3.4;
    const envelope = Math.sin(localT * Math.PI);
    const dir = Math.floor(t / 14.0) % 2 === 0 ? 1 : -1;
    headGlanceYaw = dir * 0.22 * envelope;
    headGlancePitch = -0.04 * envelope;
    headGlanceRoll = dir * 0.05 * envelope;
  } else if (cyclePos >= 7.0 && cyclePos < 10.6) {
    // Phase 2: Gentle skyward gaze toward the floating islands / mantas overhead
    microBehaviorPhase = 'skyward_gaze';
    const localT = (cyclePos - 7.0) / 3.6;
    const envelope = Math.sin(localT * Math.PI);
    headGlanceYaw = Math.sin(t * 0.6) * 0.08 * envelope;
    headGlancePitch = -0.18 * envelope; // Negative X rotation tilts head upward in our rig
    headGlanceRoll = 0.04 * envelope;
  } else if (cyclePos >= 11.2 && cyclePos < 13.6) {
    // Phase 3: Soft weight shift between feet
    microBehaviorPhase = 'weight_shift';
    const localT = (cyclePos - 11.2) / 2.4;
    const envelope = Math.sin(localT * Math.PI);
    headGlanceYaw = -0.08 * envelope;
    headGlancePitch = 0.03 * envelope;
    headGlanceRoll = -0.04 * envelope;
  } else {
    // Calm breathing baseline with subtle organic drift
    headGlanceYaw = Math.sin(t * 0.55) * 0.035;
    headGlancePitch = Math.cos(t * 0.42) * 0.025;
    headGlanceRoll = Math.sin(t * 0.38) * 0.018;
  }

  // Slow weight transfer wave across ~6.8 seconds
  const weightWave = Math.sin(t * 0.92);
  const weightShiftRoll = Number((weightWave * 0.026).toFixed(4));

  // Alternating soft knee relaxation (only one knee relaxes slightly while the other supports weight)
  const kneeRelaxL = Number((Math.max(0, weightWave) * 0.045).toFixed(4));
  const kneeRelaxR = Number((Math.max(0, -weightWave) * 0.045).toFixed(4));

  // Strict anti-ground-clipping guarantee: hipsY stays >= 0.858 at all times during idle
  const breathLift = (Math.sin(t * 2.1) * 0.5 + 0.5) * 0.018;
  const safeHipsY = Number((0.86 + breathLift).toFixed(4));

  return {
    headGlanceYaw: Number(headGlanceYaw.toFixed(4)),
    headGlancePitch: Number(headGlancePitch.toFixed(4)),
    headGlanceRoll: Number(headGlanceRoll.toFixed(4)),
    weightShiftRoll,
    safeHipsY,
    kneeRelaxL,
    kneeRelaxR,
    microBehaviorPhase,
  };
}

export interface ImmersionSceneFeedbackSnapshot {
  /** Normalized high-altitude expansion factor [0..1] for y in [10m..34m] */
  highAltitudeRatio01: number;
  /** Extra camera FOV degrees at high altitude [0..4.2] */
  altitudeFovBonusDeg: number;
  /** Extra camera follow distance at high altitude [0..1.8] */
  altitudeDistBonus: number;
  /** Fog far-plane clarity multiplier [1.0..1.35] so high vistas see further */
  horizonClarityMultiplier: number;
  /** Subtle item-approach harmonic shimmer [0..1] when within 9.5m of special items */
  itemApproachShimmer01: number;
  /** Whether player is skimming low over water and should emit wake ripples */
  shouldEmitWaterWake: boolean;
}

/**
 * Pure evaluator for Scene Feedback (Module 11):
 * - High-altitude spatial expansion (wider FOV, clearer horizon fog, aerial openness when climbing above y = 10m..34m)
 * - Subtle harmonic shimmer when approaching special items or Lumina Shards (<= 9.5m)
 * - Low-altitude water wake detection when wading or gliding within 2.4m above water basins
 */
export function evaluateImmersionSceneFeedbackPure(params: {
  x: number;
  y: number;
  z: number;
  grounded: boolean;
  isInShallowWater: boolean;
  nearestInteractableDist: number | null;
  nearestShardDist: number | null;
}): ImmersionSceneFeedbackSnapshot {
  const rawAlt = (params.y - 10.0) / 24.0;
  const clampedAlt = Math.max(0, Math.min(1, rawAlt));
  // Smoothstep curve for natural spatial expansion
  const highAltitudeRatio01 = Number(
    (clampedAlt * clampedAlt * (3 - 2 * clampedAlt)).toFixed(3)
  );

  const altitudeFovBonusDeg = Number((highAltitudeRatio01 * 4.2).toFixed(2));
  const altitudeDistBonus = Number((highAltitudeRatio01 * 1.8).toFixed(2));
  const horizonClarityMultiplier = Number(
    (1.0 + highAltitudeRatio01 * 0.35).toFixed(3)
  );

  const bestItemDist = Math.min(
    params.nearestInteractableDist ?? Infinity,
    params.nearestShardDist ?? Infinity
  );
  const rawApproach =
    bestItemDist < 9.5 ? Math.max(0, Math.min(1, (9.5 - bestItemDist) / 7.5)) : 0;
  const itemApproachShimmer01 = Number(
    (rawApproach * rawApproach * (3 - 2 * rawApproach)).toFixed(3)
  );

  const overWaterBasin =
    params.isInShallowWater ||
    (params.y <= 2.4 && isInShallowWaterAt(params.x, params.z));

  return {
    highAltitudeRatio01,
    altitudeFovBonusDeg,
    altitudeDistBonus,
    horizonClarityMultiplier,
    itemApproachShimmer01,
    shouldEmitWaterWake: overWaterBasin,
  };
}



