import React, { useState, useEffect, useRef } from 'react';
import {
  DayNightPhase,
  EXPRESSION_CFG,
  GameProgressState,
  PlayerPhysicsState,
  REALMS,
  RealmId,
  SKY_EMOTES,
  STAGE12_CFG,
  CONTINENTAL_ARCHITECTURAL_HUBS,
  SKY_ALCHEMY_SPELLS,
  SkySpellId,
  SUNSET_RACE_CHECKPOINTS,
  SunsetRaceTrialState,
  WorldInteractable,
  computeEmoteLevelSpec,
  getDayNightAtmosphere,
  getSubZoneNameAt,
  LUMINA_SHARD_CATALOG,
  SECRET_EXPLORATION_LANDMARKS,
  NearbyLuminaShardEvaluation,
  NearbySocialPeerEvaluation,
  CoopMechanismEvaluation,
  SharedEmotionalMomentEvaluation,
  ActiveInputDeviceType,
  evaluateContextualControlHintPure,
  resolveResponsiveUiProfilePure,
  evaluateHudAutoHideStatePure,
  AcousticSoundscapeProfile,
} from '../game/rules';
import { EquippedLoadout, getCosmeticById } from '../game/cosmetics';
import { CallVoiceType, AudioMixerSettings } from '../game/audio';
import {
  SpiritMemoryQuestState,
  EXPLORER_GROWTH_RANKS,
  evaluateExplorerGrowthRankPure,
} from '../core/StorageService';

interface GameHudProps {
  progress: GameProgressState;
  physics: PlayerPhysicsState;
  loadout: EquippedLoadout;
  nearestInteractable: WorldInteractable | null;
  bannerMessage: string | null;
  muted: boolean;
  debugMode: boolean;
  fps: number;
  netStatus: {
    connected: boolean;
    roomId: string;
    latencyMs: number;
    onlineCount: number;
    realOnlineCount?: number;
    localBotCount?: number;
    localBotsEnabled?: boolean;
    followLeaderId?: string | null;
    maxRoomSize?: number;
    reconnectCount?: number;
    botAiMode?: string;
    queuedReliableCount?: number;
  };
  dualActionStatusText: string | null;
  latestChatBubble: { senderName: string; text: string } | null;
  dayNightPhase: DayNightPhase;
  activeSpiritMemory?: SpiritMemoryQuestState | null;
  emoteLevels?: Record<string, number>;
  activeEmoteLevel?: number;
  activeCallVoice?: CallVoiceType;
  meditationNotes?: {
    id: string;
    author: string;
    text: string;
    createdAt: string;
  }[];
  onStartSpiritMemoryQuest?: (spiritId: string) => void;
  onAdvanceSpiritMemory?: () => void;
  onForgeCandleWax?: (waxAmount: number) => void;
  onCycleDayNightPhase: () => void;
  onToggleDebugMode: () => void;
  onToggleMute: () => void;
  onTriggerInteract: () => void;
  onTriggerCallWave: (holdDurationSec?: number) => void;
  onChangeCallVoice?: (voice: CallVoiceType) => void;
  onTriggerFlap: () => void;
  onToggleFlightMode: () => void;
  onToggleSit: () => void;
  onSetDiveHeld?: (held: boolean) => void;
  onDebugTeleport?: (
    x: number,
    y: number,
    z: number,
    label: string,
    targetRealm?: RealmId
  ) => void;
  onDebugSimulateWedgeLoss?: () => void;
  onTriggerEmote: (emoteId: string, levelOverride?: number) => void;
  onUpgradeEmoteLevel?: (emoteId: string, nextLevel: number) => void;
  onSubmitMeditationNote?: (text: string) => void;
  onSimulateReconnect?: () => void;
  onCycleBotAiMode?: () => void;
  onTriggerBotEnsemble?: () => void;
  onSwitchRoomInstance?: () => void;
  onIgnitePeer?: (peerId: string) => void;
  onSendFriendRequest?: (peerId: string, customNickname?: string) => void;
  onTeleportToFriend?: (peerId: string) => void;
  onExecuteDualAction?: (
    peerId: string,
    actionType: 'hand_hold' | 'high_five' | 'hug' | 'carry' | 'release'
  ) => void;
  onProgressAndClaimDailyQuest?: () => void;
  onCompleteSeasonStoryAct?: (actId?: string) => void;
  onRotateTravelingSpirit?: () => void;
  onTriggerShardEvent?: (shardType: 'black' | 'red' | null) => void;
  onSettleSeasonEndConversion?: () => void;
  childSafeMode?: boolean;
  onApplyPresetHomeLayout?: (presetId: string) => void;
  onToggleChildSafeMode?: () => void;
  qualityTier?: 'auto' | 'low' | 'medium' | 'high';
  highContrastMode?: boolean;
  reducedMotionShake?: boolean;
  locale?: 'zh' | 'en';
  tutorialStep?: number;
  onUpdateAccessibilityAndPerf?: (patch: {
    qualityTier?: 'auto' | 'low' | 'medium' | 'high';
    highContrastMode?: boolean;
    reducedMotionShake?: boolean;
    locale?: 'zh' | 'en';
  }) => void;
  onAdvanceOnboardingTutorial?: (
    action: 'move' | 'ignite' | 'fly' | 'complete_all' | 'reset'
  ) => void;
  discoveredEasterEggIds?: string[];
  onDiscoverAndWarpEasterEgg?: (eggId: string) => void;
  collectedLuminaShardIds?: string[];
  sessionEchoedShardIds?: string[];
  discoveredSecretZoneIds?: string[];
  luminaResonancePts?: number;
  explorerRank?: number;
  nearbyLuminaShardEval?: NearbyLuminaShardEvaluation | null;
  nearbySocialPeerEval?: NearbySocialPeerEvaluation | null;
  coopEval?: CoopMechanismEvaluation | null;
  sharedEmotionalEval?: SharedEmotionalMomentEvaluation | null;
  ceremonyTitle?: string | null;
  onCollectAndWarpLuminaShard?: (shardId: string) => void;
  onDiscoverAndWarpSecretLandmark?: (landmarkId: string) => void;
  onFollowPartner?: (peerId: string | null) => void;
  onSummonCoopCompanions?: () => void;
  onToggleLocalBotsEnabled?: () => void;
  activeSpellId?: SkySpellId | null;
  activeSpellRemainingSec?: number;
  onActivateSkySpell?: (spellId: SkySpellId | null) => void;
  sunsetRaceState?: SunsetRaceTrialState;
  bestRaceTimeMs?: number | null;
  bestRaceMedal?: 'gold' | 'silver' | 'bronze' | null;
  onStartSunsetRace?: () => void;
  onCompleteSunsetRaceQuickTest?: () => void;
  onOpenWardrobe: () => void;
  onOpenConstellationHub: (
    tab: 'constellation' | 'social' | 'quests' | 'home' | 'save'
  ) => void;
  onOpenPhotoMode: () => void;
  onToggleInstrument: () => void;
  onSelectRealm: (realm: RealmId) => void;
  onPause: () => void;
  onResetPosition: () => void;
  onTouchJoystickChange?: (moveX: number, moveZ: number, sprint: boolean) => void;
  activeInputDevice?: ActiveInputDeviceType;
  soundscapeProfile?: AcousticSoundscapeProfile | null;
  audioMixer?: AudioMixerSettings;
  onChangeAudioMixer?: (partial: Partial<AudioMixerSettings>) => void;
}

function formatEnergySourceLabel(physics: PlayerPhysicsState): {
  text: string;
  colorClass: string;
} {
  if (physics.krillAlertLevel > 0.1) {
    return {
      text: '⚠️ 冥龙红光锁定！速躲掩体',
      colorClass: 'text-red-400 font-bold',
    };
  }
  if (physics.isDiving) {
    return {
      text: `⚡ 俯冲蓄势中 (动量 ${physics.diveMomentum.toFixed(1)} · 松开拉起升空)`,
      colorClass: 'text-cyan-300 font-bold',
    };
  }
  const rateStr =
    physics.netEnergyRatePerSec >= 0
      ? `+${physics.netEnergyRatePerSec.toFixed(2)}/s`
      : `${physics.netEnergyRatePerSec.toFixed(2)}/s`;
  switch (physics.energyChangeSource) {
    case 'dark_water':
      return {
        text: `⚠️ 暗水侵蚀耗能 (${rateStr})`,
        colorClass: 'text-rose-400 font-bold',
      };
    case 'dark_rain':
      return {
        text: `🌧️ 暗雨消融心火 (${rateStr})`,
        colorClass: 'text-sky-300 font-semibold',
      };
    case 'eden_storm':
      return {
        text: `☄️ 暴风红石逆风 (${rateStr})`,
        colorClass: 'text-rose-400 font-bold',
      };
    case 'krill_strike':
      return {
        text: '💥 遭受暗黑冲击 · 翼能受损！',
        colorClass: 'text-red-400 font-bold',
      };
    case 'shrine_light':
      return {
        text: `✦ 神龛圣火回能 (${rateStr}${physics.tempLostWedges > 0 ? ' · 修复碎翼中' : ''})`,
        colorClass: 'text-amber-200 font-semibold',
      };
    case 'candle_light':
      return {
        text: `🔥 烛火温暖回能 (${rateStr}${physics.tempLostWedges > 0 ? ' · 修复碎翼中' : ''})`,
        colorClass: 'text-amber-300 font-semibold',
      };
    case 'companion':
      return {
        text: `🤝 旅人陪伴回能 (${rateStr})`,
        colorClass: 'text-emerald-300 font-semibold',
      };
    case 'brazier_prop':
      return {
        text: `🔥 背饰篝火回能 (${rateStr})`,
        colorClass: 'text-amber-200 font-semibold',
      };
    case 'wind_cloud':
      return {
        text: `🌬️ 风洞/云海托举回能 (${rateStr})`,
        colorClass: 'text-sky-300 font-semibold',
      };
    case 'ground':
      return {
        text: `✦ 地面平稳回能 (${rateStr})`,
        colorClass: 'text-amber-100/85',
      };
    default:
      return {
        text: physics.wingEnergy <= 0.05 ? '⚠️ 翼能已耗尽 (无法拍翼)' : '☁️ 云海自由翱翔中',
        colorClass: physics.wingEnergy <= 0.05 ? 'text-rose-300 font-semibold' : 'text-slate-300',
      };
  }
}

export const GameHud: React.FC<GameHudProps> = ({
  progress,
  physics,
  loadout,
  nearestInteractable,
  bannerMessage,
  muted,
  debugMode,
  fps,
  netStatus,
  dualActionStatusText,
  latestChatBubble,
  dayNightPhase,
  activeSpiritMemory,
  emoteLevels = {},
  activeEmoteLevel = 1,
  activeCallVoice = 'default',
  meditationNotes = [],
  onStartSpiritMemoryQuest,
  onAdvanceSpiritMemory,
  onForgeCandleWax,
  onCycleDayNightPhase,
  onToggleDebugMode,
  onToggleMute,
  onTriggerInteract,
  onTriggerCallWave,
  onChangeCallVoice,
  onTriggerFlap,
  onToggleFlightMode,
  onToggleSit,
  onSetDiveHeld,
  onDebugTeleport,
  onDebugSimulateWedgeLoss,
  onTriggerEmote,
  onUpgradeEmoteLevel,
  onSubmitMeditationNote,
  onSimulateReconnect,
  onCycleBotAiMode,
  onTriggerBotEnsemble,
  onSwitchRoomInstance,
  onIgnitePeer,
  onSendFriendRequest,
  onTeleportToFriend,
  onExecuteDualAction,
  onProgressAndClaimDailyQuest,
  onCompleteSeasonStoryAct,
  onRotateTravelingSpirit,
  onTriggerShardEvent,
  onSettleSeasonEndConversion,
  childSafeMode = false,
  onApplyPresetHomeLayout,
  onToggleChildSafeMode,
  qualityTier = 'auto',
  highContrastMode = false,
  reducedMotionShake = false,
  locale = 'zh',
  tutorialStep = 0,
  onUpdateAccessibilityAndPerf,
  onAdvanceOnboardingTutorial,
  discoveredEasterEggIds = [],
  onDiscoverAndWarpEasterEgg,
  collectedLuminaShardIds = [],
  sessionEchoedShardIds = [],
  discoveredSecretZoneIds = [],
  luminaResonancePts = 0,
  explorerRank = 1,
  nearbyLuminaShardEval = null,
  nearbySocialPeerEval = null,
  coopEval = null,
  sharedEmotionalEval = null,
  ceremonyTitle = null,
  onCollectAndWarpLuminaShard,
  onDiscoverAndWarpSecretLandmark,
  onFollowPartner,
  onSummonCoopCompanions,
  onToggleLocalBotsEnabled,
  activeSpellId = null,
  activeSpellRemainingSec = 0,
  onActivateSkySpell,
  sunsetRaceState,
  bestRaceTimeMs = null,
  bestRaceMedal = null,
  onStartSunsetRace,
  onCompleteSunsetRaceQuickTest,
  onOpenWardrobe,
  onOpenConstellationHub,
  onOpenPhotoMode,
  onToggleInstrument,
  onSelectRealm,
  onPause,
  onResetPosition,
  onTouchJoystickChange,
  activeInputDevice,
  soundscapeProfile,
  audioMixer,
  onChangeAudioMixer,
}) => {
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [immersiveModeManual, setImmersiveModeManual] = useState(false);
  const [audioMixerOpen, setAudioMixerOpen] = useState(false);
  const [currencyPinnedExpanded, setCurrencyPinnedExpanded] = useState(false);
  const [isHoveringHud, setIsHoveringHud] = useState(false);
  const [secondsSinceCurrencyChange, setSecondsSinceCurrencyChange] = useState(0);
  const [stateAgeSec, setStateAgeSec] = useState(0);
  const [viewportDims, setViewportDims] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
    hasTouch:
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0),
    gamepadConnected: false,
  }));
  const [dockTab, setDockTab] = useState<'actions' | 'emotes' | 'realms'>('actions');
  const [meditationDrawerOpen, setMeditationDrawerOpen] = useState(false);
  const [easterEggDrawerOpen, setEasterEggDrawerOpen] = useState(false);
  const [meditationInput, setMeditationInput] = useState(
    '愿每一缕微光都能穿越云海，照亮独行旅人的夜空。'
  );
  const callPressStartRef = useRef<number>(0);
  const [joyKnob, setJoyKnob] = useState({ x: 0, y: 0, active: false });
  const joyBaseRef = useRef<HTMLDivElement | null>(null);

  // Track viewport resize & gamepad connection for multi-device UI adaptation
  useEffect(() => {
    const updateDeviceProfile = () => {
      const pads =
        typeof navigator !== 'undefined' && navigator.getGamepads
          ? Array.from(navigator.getGamepads()).filter(Boolean)
          : [];
      setViewportDims({
        width: window.innerWidth,
        height: window.innerHeight,
        hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        gamepadConnected: pads.length > 0,
      });
    };
    window.addEventListener('resize', updateDeviceProfile);
    window.addEventListener('gamepadconnected', updateDeviceProfile);
    window.addEventListener('gamepaddisconnected', updateDeviceProfile);
    return () => {
      window.removeEventListener('resize', updateDeviceProfile);
      window.removeEventListener('gamepadconnected', updateDeviceProfile);
      window.removeEventListener('gamepaddisconnected', updateDeviceProfile);
    };
  }, []);

  // Reset currency timer whenever player gains/spends candles, wax, hearts, or ascended candles
  useEffect(() => {
    setSecondsSinceCurrencyChange(0);
  }, [
    progress.candles,
    progress.wax,
    progress.hearts,
    progress.ascendedCandles,
    progress.wingedLights,
  ]);

  // Reset contextual state age timer whenever primary locomotion/flight/sit/interact/collect context changes
  const contextStateSignature = `${physics.grounded ? 'g' : 'a'}:${physics.locomotionMode}:${physics.flightMode}:${physics.isDiving ? 'd' : 'n'}:${physics.sitMode}:${nearestInteractable?.id || ''}:${nearbyLuminaShardEval?.nearestShard?.id || ''}:${nearbySocialPeerEval?.nearestPeer?.playerId || ''}:${coopEval?.mechanismId || ''}:${coopEval?.canActivate ? '1' : '0'}`;
  useEffect(() => {
    setStateAgeSec(0);
  }, [contextStateSignature]);

  // 250ms tick for ephemeral hint auto-fade & HUD breathing auto-collapse
  useEffect(() => {
    const timer = window.setInterval(() => {
      setStateAgeSec((prev) => Math.min(30, Number((prev + 0.25).toFixed(2))));
      setSecondsSinceCurrencyChange((prev) =>
        Math.min(30, Number((prev + 0.25).toFixed(2)))
      );
    }, 250);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.code === 'KeyH' && !document.querySelector('[aria-label="光遇15键云端乐器演奏与自动合奏台"]')) {
        setDockCollapsed((prev) => !prev);
        setImmersiveModeManual((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const realm = REALMS[progress.currentRealm];
  const subZoneName = getSubZoneNameAt(progress.currentRealm, physics.x, physics.z);
  const equippedCape = getCosmeticById(loadout.cape);
  const fullWedges = Math.min(physics.maxWingWedges, Math.floor(physics.wingEnergy));
  const partialWedge = Math.max(0, physics.wingEnergy - fullWedges);

  const responsiveProfile = resolveResponsiveUiProfilePure(
    viewportDims.width,
    viewportDims.height,
    viewportDims.hasTouch,
    viewportDims.gamepadConnected || activeInputDevice === 'gamepad'
  );
  const resolvedInputDevice: ActiveInputDeviceType =
    activeInputDevice || responsiveProfile.primaryInput;

  const hudBreathing = evaluateHudAutoHideStatePure({
    immersiveModeManual,
    isHoveringHud: isHoveringHud || currencyPinnedExpanded,
    secondsSinceCurrencyChange,
    secondsSinceInteraction: stateAgeSec,
    isCompactViewport: responsiveProfile.isCompactViewport,
    hasActiveEmergencyAlert:
      physics.krillAlertLevel > 0.1 || physics.tempLostWedges > 0.05,
  });

  const contextualHint = evaluateContextualControlHintPure({
    grounded: physics.grounded,
    locomotionMode: physics.locomotionMode,
    flightMode: physics.flightMode,
    isDiving: physics.isDiving,
    sitMode: physics.sitMode,
    wingEnergy: physics.wingEnergy,
    inWindTunnel: physics.inWindTunnel,
    nearestInteractable: null,
    nearbyLuminaShard: null,
    nearbySocialPeer: null,
    coopEval: null,
    stateAgeSec,
    inputDevice: resolvedInputDevice,
    maxDisplaySec: 4.2,
  });

  const handleJoyPointer = (clientX: number, clientY: number) => {
    if (!joyBaseRef.current || !onTouchJoystickChange) return;
    const rect = joyBaseRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.42;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    const clampedR = Math.min(maxR, dist);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clampedR;
    const ky = Math.sin(angle) * clampedR;
    setJoyKnob({ x: kx, y: ky, active: true });

    const normX = kx / maxR;
    const normZ = ky / maxR;
    const isRun = dist >= maxR * 0.68;
    onTouchJoystickChange(normX, normZ, isRun);
  };

  const resetJoystick = () => {
    setJoyKnob({ x: 0, y: 0, active: false });
    onTouchJoystickChange?.(0, 0, false);
  };

  return (
    <div className="fixed inset-0 z-20 pointer-events-none select-none flex flex-col justify-between p-2.5 sm:p-3.5">
      {/* ================= TOP PERIMETER WRAPPER (RIBBON + TOP TOASTS) ================= */}
      <div className="flex flex-col items-center w-full gap-1.5 pointer-events-none">
        {/* ================= TOP PERIMETER: ULTRA-SLIM TRANSLUCENT GLASS RIBBON ================= */}
        <div
          onPointerEnter={() => setIsHoveringHud(true)}
          onPointerLeave={() => setIsHoveringHud(false)}
          className={`flex items-center justify-between gap-1.5 w-full transition-opacity duration-300 ${hudBreathing.topBarOpacityClass}`}
        >
        {/* Top-Left Capsule: Featherlight Auto-Collapsing Currencies & Current Realm */}
        <div
          data-testid="hud-currency-capsule"
          onClick={() => setCurrencyPinnedExpanded((prev) => !prev)}
          title="点击固定展开或收起次要货币与子区域详情"
          className="sky-glass-pill h-9 px-2.5 sm:px-3 rounded-full text-slate-100 pointer-events-auto shadow-sm flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
        >
          {/* White Candles + Inline Wax Progress */}
          <div className="flex items-center gap-1" title="白蜡烛与烛火合成进度">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
              <path d="M12 2C10 5 9 7 12 10C15 7 14 5 12 2Z" fill="#FDE047" />
              <rect x="9" y="10" width="6" height="12" rx="1.5" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
            </svg>
            <span className="hidden lg:inline text-[11px] text-slate-300">白蜡</span>
            <span className="text-xs font-bold font-mono tabular-nums text-white">
              {Math.round(progress.candles)}
            </span>
            {hudBreathing.showExpandedCurrencies && (
              <span
                className="text-[10px] font-mono tabular-nums text-amber-300/90"
                title={`烛火进度 ${Math.round(progress.wax)}/100`}
              >
                ({Math.round(progress.wax)}%)
              </span>
            )}
          </div>

          <span aria-hidden="true" className="text-white/20 text-xs">·</span>

          {/* Ancestor Hearts */}
          <div className="flex items-center gap-1" title="先祖爱心">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="#FB7185"
              />
            </svg>
            <span className="hidden lg:inline text-[11px] text-slate-300">爱心</span>
            <span className="text-xs font-bold font-mono tabular-nums text-rose-200">
              {Math.round(progress.hearts)}
            </span>
          </div>

          {hudBreathing.showExpandedCurrencies && (
            <>
              <span aria-hidden="true" className="text-white/20 text-xs">·</span>

              {/* Ascended Red Candles */}
              <div className="flex items-center gap-1" title="伊甸升华红蜡烛">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
                  <polygon points="12,1 16,8 12,11 8,8" fill="#FDE047" />
                  <rect x="8.5" y="10" width="7" height="12" rx="1.5" fill="#EF4444" />
                </svg>
                <span className="hidden lg:inline text-[11px] text-slate-300">红烛</span>
                <span className="text-xs font-bold font-mono tabular-nums text-amber-300">
                  {Math.round(progress.ascendedCandles)}
                </span>
              </div>
            </>
          )}

          <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/15">
            {hudBreathing.showSubZoneLabel && (
              <span
                data-testid="hud-subzone-label"
                className="hidden xl:inline text-[11px] text-amber-100/90 max-w-[135px] truncate"
              >
                {realm.name.split(' · ')[0]} · {subZoneName}
              </span>
            )}
            <button
              type="button"
              data-testid="cycle-daynight-btn"
              onClick={(e) => {
                e.stopPropagation();
                onCycleDayNightPhase();
              }}
              title={`当前：${realm.name.split(' · ')[0]} · ${subZoneName} — 点击或按 [T] 切换昼夜氛围`}
              className="sky-btn px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] font-medium text-sky-100 cursor-pointer whitespace-nowrap shrink-0"
            >
              {dayNightPhase === 'morning'
                ? '🌅 晨曦'
                : dayNightPhase === 'noon'
                  ? '☀️ 正午'
                  : dayNightPhase === 'sunset'
                    ? '🌇 流霞'
                    : '🌌 星夜'}
            </button>
          </div>
        </div>

        {/* Top-Center Crest: Compact Sky Wing Energy Ring + Inline Wedge Diamonds */}
        <div
          className="sky-glass-pill h-9 px-3 rounded-full flex items-center gap-2 pointer-events-auto shadow-sm whitespace-nowrap shrink-0"
        >
          {/* Compact Segmented Circular Wing Energy Ring */}
          <div
            data-testid="hud-wing-energy-ring"
            className="relative w-7 h-7 shrink-0 flex items-center justify-center"
            title={`斗篷能量环：${physics.wingEnergy.toFixed(2)} / ${physics.maxWingWedges} 格 (每次拍翼消耗 1 格)`}
          >
            <svg viewBox="0 0 56 56" className="w-7 h-7 -rotate-90">
              {Array.from({ length: physics.maxWingWedges }).map((_, idx) => {
                const total = Math.max(1, physics.maxWingWedges);
                const r = 22;
                const cx = 28;
                const cy = 28;
                const gapDeg = total > 1 ? 7 : 0;
                const sweepDeg = 360 / total - gapDeg;
                const startDeg = idx * (360 / total) + gapDeg / 2;
                const endDeg = startDeg + sweepDeg;
                const startRad = (startDeg * Math.PI) / 180;
                const endRad = (endDeg * Math.PI) / 180;
                const x1 = cx + r * Math.cos(startRad);
                const y1 = cy + r * Math.sin(startRad);
                const x2 = cx + r * Math.cos(endRad);
                const y2 = cy + r * Math.sin(endRad);
                const largeArc = sweepDeg > 180 ? 1 : 0;
                const d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;

                const isTempLost =
                  idx >= physics.maxWingWedges - physics.tempLostWedges;
                const isFull = !isTempLost && idx < fullWedges;
                const isPartial =
                  !isTempLost && idx === fullWedges && partialWedge > 0.05;

                const strokeColor = isTempLost
                  ? '#EF4444'
                  : isFull
                    ? '#FDE047'
                    : isPartial
                      ? '#F59E0B'
                      : 'rgba(148, 163, 184, 0.35)';

                return (
                  <path
                    key={idx}
                    d={d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isFull || isPartial ? '5.5' : '4.0'}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold font-mono text-amber-200">
              {Math.ceil(Math.max(0, physics.wingEnergy - 0.04))}
            </span>
          </div>

          {/* Discrete Wing Energy Wedges */}
          <div
            className="hidden lg:flex items-center gap-0.5"
            role="meter"
            aria-label="光之翼飞行能量"
            aria-valuenow={Math.round(physics.wingEnergy)}
            aria-valuemin={0}
            aria-valuemax={physics.maxWingWedges}
          >
            {Array.from({ length: physics.maxWingWedges }).map((_, idx) => {
              const isTempLost =
                idx >= physics.maxWingWedges - physics.tempLostWedges;
              const isFull = !isTempLost && idx < fullWedges;
              const isPartial =
                !isTempLost && idx === fullWedges && partialWedge > 0.08;
              return (
                <svg
                  key={idx}
                  viewBox="0 0 20 24"
                  className="w-3 h-3.5 transition-transform"
                  aria-hidden="true"
                >
                  <polygon
                    points="10,2 18,12 10,22 2,12"
                    fill={
                      isTempLost
                        ? 'rgba(239, 68, 68, 0.4)'
                        : isFull
                          ? '#FDE047'
                          : isPartial
                            ? '#F59E0B'
                            : 'rgba(30, 41, 59, 0.7)'
                    }
                    stroke={
                      isTempLost
                        ? '#EF4444'
                        : isFull || isPartial
                          ? '#FEF9C3'
                          : '#64748B'
                    }
                    strokeWidth="1.6"
                  />
                </svg>
              );
            })}
          </div>

          {/* Winged Light Count & Flight Mode Pill */}
          <span
            className="text-[11px] font-mono tabular-nums text-amber-200/95 font-semibold"
            title={`已收集 ${progress.wingedLights} 个光之翼小金人`}
          >
            {physics.maxWingWedges}翼({progress.wingedLights}金)
          </span>

          {physics.wingEnergy > physics.maxWingWedges + 0.05 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-400/25 border border-amber-300/60 text-[10px] font-mono font-bold text-amber-200">
              +{Math.round(physics.wingEnergy - physics.maxWingWedges)}⚡
            </span>
          )}

          {physics.tempLostWedges > 0.05 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-950/90 border border-rose-400/50 text-[10px] font-mono text-rose-300">
              -{physics.tempLostWedges.toFixed(1)}
            </span>
          )}

          <button
            type="button"
            tabIndex={-1}
            data-testid="toggle-flight-mode-btn"
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleFlightMode();
            }}
            title="点击或按 [Shift] 切换悬停/滑翔模式"
            className="px-2 py-0.5 rounded-full bg-sky-400/15 hover:bg-sky-400/25 border border-sky-300/30 text-[10px] text-sky-200 font-medium cursor-pointer whitespace-nowrap shrink-0 transition-colors"
          >
            {physics.isDiving
              ? '俯冲 [X]'
              : physics.flightMode === 'glide'
                ? '滑翔 [Shift]'
                : '悬停 [Shift]'}
          </button>

          {(() => {
            const srcInfo = formatEnergySourceLabel(physics);
            return (
              <span
                data-testid="hud-energy-source-label"
                className={`hidden 2xl:inline text-[10px] ${srcInfo.colorClass}`}
              >
                {srcInfo.text}
              </span>
            );
          })()}
        </div>

        {/* Top-Right Capsule: Constellation, Friends, Photo, Compass & System Controls */}
        <div
          className="sky-glass-pill h-9 px-2 rounded-full flex items-center gap-1 pointer-events-auto shadow-sm whitespace-nowrap shrink-0"
        >
          <button
            type="button"
            data-testid="open-constellation-hub-btn"
            onClick={() => onOpenConstellationHub('constellation')}
            title="先祖星盘解锁树 [K]"
            className="sky-btn h-7 px-2.5 rounded-full hover:bg-white/15 flex items-center gap-1 text-xs font-medium text-amber-100 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>✦ 星盘</span>
          </button>

          <button
            type="button"
            data-testid="open-social-hub-btn"
            onClick={() => onOpenConstellationHub('social')}
            title="好友星盘与联机互动 [G]"
            className="sky-btn h-7 px-2.5 rounded-full hover:bg-white/15 flex items-center gap-1 text-xs font-medium text-sky-100 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>🤝 好友</span>
          </button>

          <button
            type="button"
            data-testid="open-photo-mode-btn"
            onClick={onOpenPhotoMode}
            title="自由相机与自拍留影 [O/P]"
            className="sky-btn h-7 px-2.5 rounded-full hover:bg-white/15 flex items-center gap-1 text-xs font-medium text-rose-100 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>📷 拍照</span>
          </button>

          <button
            type="button"
            data-testid="open-easter-egg-compass-btn"
            onClick={() => setEasterEggDrawerOpen((prev) => !prev)}
            className="sky-btn h-7 px-2.5 rounded-full bg-amber-400/15 hover:bg-amber-400/25 border border-amber-300/35 flex items-center gap-1 text-xs font-medium text-amber-200 cursor-pointer whitespace-nowrap shrink-0"
            title="打开光能探索成长阶位、16 枚四阶光能碎片、8 处隐秘地标与 12 大致敬彩蛋图鉴"
          >
            <span>🗺️ 秘境</span>
            <span
              data-testid="hud-explorer-rank-badge"
              className="px-1 rounded bg-amber-400/25 text-[10px] font-bold text-amber-200"
            >
              Lv.{explorerRank}
            </span>
            <span className="font-mono text-[10px] text-amber-300">
              {collectedLuminaShardIds.length}/16
            </span>
          </button>

          <div className="h-3.5 w-px bg-white/15 mx-0.5" />

          <button
            type="button"
            data-testid="hud-immersive-mode-btn"
            aria-label={immersiveModeManual ? '恢复标准界面 [H]' : '纯净沉浸视野 [H]'}
            title={immersiveModeManual ? '恢复标准界面 [H]' : '开启纯净沉浸视野（自动隐藏次要信息与底部坞） [H]'}
            onClick={() => {
              const next = !immersiveModeManual;
              setImmersiveModeManual(next);
              setDockCollapsed(next);
            }}
            className={`sky-btn w-7 h-7 rounded-full flex items-center justify-center text-xs cursor-pointer shrink-0 ${
              immersiveModeManual
                ? 'bg-amber-300 text-slate-950 font-bold'
                : 'hover:bg-white/15 text-amber-100'
            }`}
          >
            👁️
          </button>

          <button
            type="button"
            data-testid="hud-audio-mixer-btn"
            aria-label="打开混音台与空间声景面板"
            title="打开 5 通道混音台与 3D 空间声景面板"
            onClick={() => setAudioMixerOpen((prev) => !prev)}
            className={`sky-btn w-7 h-7 rounded-full flex items-center justify-center text-xs cursor-pointer shrink-0 ${
              audioMixerOpen
                ? 'bg-amber-300 text-slate-950 font-bold'
                : 'hover:bg-white/15 text-amber-100'
            }`}
          >
            🎵
          </button>

          <button
            type="button"
            data-testid="hud-mute-btn"
            aria-label={muted ? '取消静音 [M]' : '静音 [M]'}
            title={muted ? '取消静音 [M]' : '静音 [M]'}
            onClick={onToggleMute}
            className="sky-btn w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-amber-100 cursor-pointer shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              {muted ? (
                <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
              ) : (
                <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
              )}
            </svg>
          </button>

          <button
            type="button"
            aria-label="重置回遇境星盘 [R]"
            title="重置回遇境星盘 [R]"
            onClick={onResetPosition}
            className="sky-btn w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-amber-100 cursor-pointer shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="暂停游戏 [Esc]"
            title="暂停游戏 [Esc]"
            onClick={onPause}
            className="sky-btn w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-amber-100 cursor-pointer shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* ================= MODULE 10: 5-BUS AUDIO MIXER & 3D SPATIAL SOUNDSCAPE POPOVER ================= */}
      {audioMixerOpen && (
        <div
          data-testid="hud-audio-mixer-panel"
          className="fixed top-14 right-3.5 z-40 sky-panel-enter sky-glass-pill p-3.5 rounded-2xl text-xs text-slate-100 pointer-events-auto shadow-2xl w-80 sm:w-96 space-y-2.5"
        >
          <div className="flex items-center justify-between border-b border-white/15 pb-2">
            <div className="font-bold text-amber-200 flex items-center gap-1.5">
              <span>🎵 空间声景与五通道混音台</span>
            </div>
            <button
              type="button"
              data-testid="close-audio-mixer-btn"
              onClick={() => setAudioMixerOpen(false)}
              className="sky-btn px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[11px] text-slate-300 hover:text-white cursor-pointer"
            >
              ✕ 关闭
            </button>
          </div>

          {/* Live 3D Acoustic Zone, Reverb & Generative Music Status */}
          {soundscapeProfile && (
            <div className="p-2.5 rounded-xl bg-slate-950/65 border border-amber-200/20 space-y-1 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">自适应乐章：</span>
                <span
                  data-testid="mixer-music-theme-title"
                  className="font-semibold text-amber-200 truncate"
                >
                  {soundscapeProfile.musicThemeTitle}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">声学环境：</span>
                <span
                  data-testid="mixer-acoustic-zone-badge"
                  className="text-sky-200 font-medium"
                >
                  {soundscapeProfile.zoneLabel} (混响 {Math.round(soundscapeProfile.reverbWetMix01 * 100)}%)
                </span>
              </div>
              {soundscapeProfile.nearestEmitter && (
                <div
                  data-testid="mixer-nearest-emitter-info"
                  className="flex items-center justify-between gap-2 text-[10px] text-emerald-200/90 pt-0.5 border-t border-white/10"
                >
                  <span>
                    🔊 3D声源：{soundscapeProfile.nearestEmitter.emitterName} (
                    {soundscapeProfile.nearestEmitter.distance3d}m)
                  </span>
                  <span className="font-mono">
                    音量 {Math.round(soundscapeProfile.nearestEmitter.gain01 * 100)}% ·{' '}
                    {soundscapeProfile.nearestEmitter.panStereo < -0.15
                      ? '偏左'
                      : soundscapeProfile.nearestEmitter.panStereo > 0.15
                        ? '偏右'
                        : '正前'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 5-Channel Volume Sliders */}
          {audioMixer && onChangeAudioMixer && (
            <div className="space-y-2">
              {(
                [
                  {
                    key: 'masterVolume',
                    label: '🔊 主音量 (Master)',
                    testId: 'mixer-slider-master',
                  },
                  {
                    key: 'bgmVolume',
                    label: '🎼 治愈配乐 (BGM)',
                    testId: 'mixer-slider-bgm',
                  },
                  {
                    key: 'ambientVolume',
                    label: '🍃 环境与飞行风声 (Ambient)',
                    testId: 'mixer-slider-ambient',
                  },
                  {
                    key: 'sfxVolume',
                    label: '👣 角色与收集音效 (SFX)',
                    testId: 'mixer-slider-sfx',
                  },
                  {
                    key: 'instrumentVolume',
                    label: '🎹 乐器演奏音量 (Instrument)',
                    testId: 'mixer-slider-instrument',
                  },
                ] as const
              ).map((bus) => {
                const val = audioMixer[bus.key];
                return (
                  <div key={bus.key} className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-200 w-44 truncate">
                      {bus.label}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(val * 100)}
                      data-testid={bus.testId}
                      onChange={(e) =>
                        onChangeAudioMixer({
                          [bus.key]: Number(e.target.value) / 100,
                        })
                      }
                      className="w-28 accent-amber-300 cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-amber-200 w-9 text-right">
                      {Math.round(val * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 leading-relaxed">
            ✦ 智能防掩蔽混音已启用：高速滑翔/俯冲时风声自动限幅（≤24%），收集碎片或弹奏乐器时自动轻柔闪避背景音。
          </div>
        </div>
      )}

      {/* ================= BUILT-IN DEBUG OVERLAY (?debug=1) ================= */}
      {debugMode && (
        <div
          data-testid="debug-telemetry-panel"
          className="fixed top-14 left-3.5 z-40 px-3 py-2 rounded-xl border border-emerald-400/40 bg-slate-950/92 text-[10px] font-mono text-emerald-300 pointer-events-auto space-y-0.5 shadow-xl max-w-3xl max-h-[48vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-bold text-emerald-200">
              [DEBUG PANEL · ?debug=1 · 阶段1–13全量实时遥测]
            </span>
            <button
              type="button"
              onClick={onToggleDebugMode}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              [关闭]
            </button>
          </div>
          <div>
            FPS: {fps} | Pos: ({physics.x.toFixed(1)}, {physics.y.toFixed(2)},{' '}
            {physics.z.toFixed(1)}) | Speed:{' '}
            {Math.hypot(physics.vx, physics.vz).toFixed(2)}m/s (vy:{' '}
            {physics.vy.toFixed(1)})
          </div>
          <div>
            Realm: <strong className="text-amber-200">{progress.currentRealm}</strong> (
            {subZoneName}) | Time:{' '}
            <strong className="text-sky-200">
              {getDayNightAtmosphere(dayNightPhase).label}
            </strong>{' '}
            | State: <strong className="text-amber-300">{physics.locomotionMode}</strong>{' '}
            | Flight:{' '}
            <strong className="text-sky-300">
              {physics.isDiving ? 'DIVE' : physics.flightMode.toUpperCase()}
            </strong>
          </div>
          <div>
            Energy: <strong className="text-amber-200">{physics.wingEnergy.toFixed(2)}/{physics.maxWingWedges}</strong>{' '}
            (Lost: {physics.tempLostWedges.toFixed(1)}) | Src:{' '}
            <strong className="text-cyan-300">{physics.energyChangeSource}</strong> (
            {physics.netEnergyRatePerSec >= 0 ? '+' : ''}
            {physics.netEnergyRatePerSec.toFixed(2)}/s)
          </div>
          <div data-testid="debug-net-telemetry">
            Net:{' '}
            <strong className={netStatus.connected ? 'text-emerald-300' : 'text-amber-300'}>
              {netStatus.connected ? 'WS_ONLINE' : 'RECONNECTING/BOT_FALLBACK'}
            </strong>{' '}
            | Room: <strong className="text-sky-200">{netStatus.roomId}</strong> (
            {netStatus.onlineCount}/{netStatus.maxRoomSize ?? 8}人) | RTT:{' '}
            {netStatus.latencyMs}ms | Reconn: {netStatus.reconnectCount ?? 0} | BotAI:{' '}
            <strong className="text-amber-200">{netStatus.botAiMode ?? 'patrol'}</strong>
          </div>
          {onDebugTeleport && (
            <>
              <div className="pt-1 border-t border-emerald-500/30 flex flex-wrap items-center gap-1.5">
                <span className="text-emerald-200/80">阶段1地面:</span>
                <button
                  type="button"
                  data-testid="debug-tp-shrine"
                  onClick={() => onDebugTeleport(0, 1.2, 2.2, '中央神龛冥想光圈')}
                  className="px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-400/30 cursor-pointer"
                >
                  神龛冥想圈
                </button>
                <button
                  type="button"
                  data-testid="debug-tp-bench"
                  onClick={() => onDebugTeleport(4.25, 1.2, 3.8, '双人石椅并排坐点')}
                  className="px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-400/30 cursor-pointer"
                >
                  双人长椅
                </button>
                <button
                  type="button"
                  data-testid="debug-tp-water"
                  onClick={() => onDebugTeleport(-15.5, 0.08, 0.0, '西侧浅水涉水池')}
                  className="px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-400/30 cursor-pointer"
                >
                  浅水涉水池
                </button>
                <button
                  type="button"
                  data-testid="debug-tp-slope"
                  onClick={() => onDebugTeleport(19.5, 5.24, 0.0, '东侧陡坡滑行道')}
                  className="px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-400/30 cursor-pointer"
                >
                  陡坡滑行道
                </button>
                <button
                  type="button"
                  data-testid="debug-tp-highfall"
                  onClick={() => onDebugTeleport(0, 12.5, 4.5, '高处坠落硬直测试(无摔死)')}
                  className="px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-400/30 cursor-pointer"
                >
                  高处落地硬直
                </button>
              </div>
              <div className="pt-1 border-t border-sky-500/30 flex flex-wrap items-center gap-1.5">
                <span className="text-sky-200/90">阶段2飞行&能量:</span>
                <button
                  type="button"
                  data-testid="debug-tp-highdive"
                  onClick={() => onDebugTeleport(0, 26.0, 10.0, '高空滑翔与俯冲测试台')}
                  className="px-2 py-0.5 rounded bg-sky-900/70 hover:bg-sky-800 text-sky-100 border border-sky-400/40 cursor-pointer"
                >
                  高空俯冲台
                </button>
                <button
                  type="button"
                  data-testid="debug-tp-wingedlight"
                  onClick={() => onDebugTeleport(0, 0.42, -12.2, '光之翼小金人收集点')}
                  className="px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                >
                  光之翼收集点
                </button>
                <button
                  type="button"
                  data-testid="debug-tp-windtunnel"
                  onClick={() => onDebugTeleport(0, 7.5, -22.0, '风洞上升气流回能区')}
                  className="px-2 py-0.5 rounded bg-sky-900/70 hover:bg-sky-800 text-sky-100 border border-sky-400/40 cursor-pointer"
                >
                  风洞气流区
                </button>
                <button
                  type="button"
                  data-testid="debug-tp-darkwater"
                  onClick={() =>
                    onDebugTeleport(-15.5, 0.06, -12.0, '暗水侵蚀耗能测试池', 'home')
                  }
                  className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-100 border border-rose-400/40 cursor-pointer"
                >
                  暗水耗能池
                </button>
                {onDebugSimulateWedgeLoss && (
                  <button
                    type="button"
                    data-testid="debug-sim-wedgeloss"
                    onClick={onDebugSimulateWedgeLoss}
                    className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-100 border border-rose-400/40 cursor-pointer"
                  >
                    模拟掉翼&回能
                  </button>
                )}
              </div>
              <div className="pt-1 border-t border-amber-500/30 flex flex-wrap items-center gap-1.5">
                <span className="text-amber-200/90">阶段3云野:</span>
                <button
                  type="button"
                  data-testid="debug-tp-prairie-z1"
                  onClick={() =>
                    onDebugTeleport(
                      6.2,
                      0.45,
                      -2.8,
                      '云野子区1：蝴蝶平原 & 发光星瓣花',
                      'prairie'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                >
                  子区1:蝴蝶平原&发光花
                </button>
                <button
                  type="button"
                  data-testid="debug-tp-prairie-z2"
                  onClick={() =>
                    onDebugTeleport(
                      -18.2,
                      0.55,
                      -12.8,
                      '云野子区2：幽光洞窟 & 引蝶先祖站',
                      'prairie'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                >
                  子区2:幽光洞窟&引蝶先祖
                </button>
                <button
                  type="button"
                  data-testid="debug-tp-prairie-z3"
                  onClick={() =>
                    onDebugTeleport(
                      14.5,
                      0.45,
                      -24.8,
                      '云野子区3：三塔钟楼村落 & 欢呼先祖站',
                      'prairie'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                >
                  子区3:三塔村落&欢呼先祖
                </button>
                <button
                  type="button"
                  data-testid="debug-tp-prairie-wind"
                  onClick={() =>
                    onDebugTeleport(
                      0,
                      7.4,
                      -15.0,
                      '云野风洞流光环走廊 (自动托举加速)',
                      'prairie'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-sky-900/70 hover:bg-sky-800 text-sky-100 border border-sky-400/40 cursor-pointer"
                >
                  风洞流光环
                </button>
                <button
                  type="button"
                  data-testid="debug-cycle-daynight"
                  onClick={onCycleDayNightPhase}
                  className="px-2 py-0.5 rounded bg-purple-900/70 hover:bg-purple-800 text-purple-100 border border-purple-400/40 cursor-pointer"
                >
                  昼夜切换 [T]
                </button>
              </div>
              <div className="pt-1 border-t border-cyan-500/30 flex flex-wrap items-center gap-1.5">
                <span className="text-cyan-200/90">阶段4先祖&星盘:</span>
                {onStartSpiritMemoryQuest && (
                  <button
                    type="button"
                    data-testid="debug-stage4-memory"
                    onClick={() =>
                      onStartSpiritMemoryQuest('spirit_prairie_butterfly')
                    }
                    className="px-2 py-0.5 rounded bg-cyan-900/70 hover:bg-cyan-800 text-cyan-100 border border-cyan-400/40 cursor-pointer"
                  >
                    先祖记忆3幕流程
                  </button>
                )}
                {onAdvanceSpiritMemory && (
                  <button
                    type="button"
                    data-testid="debug-stage4-advance"
                    onClick={onAdvanceSpiritMemory}
                    className="px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                  >
                    推进记忆下一幕
                  </button>
                )}
                <button
                  type="button"
                  data-testid="debug-stage4-constellation"
                  onClick={() => onOpenConstellationHub('constellation')}
                  className="px-2 py-0.5 rounded bg-indigo-900/70 hover:bg-indigo-800 text-indigo-100 border border-indigo-400/40 cursor-pointer"
                >
                  星盘解锁树 [K]
                </button>
                {onForgeCandleWax && (
                  <button
                    type="button"
                    data-testid="debug-stage4-forge"
                    onClick={() => onForgeCandleWax(100)}
                    className="px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                  >
                    +100烛火合成白烛
                  </button>
                )}
                <button
                  type="button"
                  data-testid="debug-stage4-wardrobe"
                  onClick={onOpenWardrobe}
                  className="px-2 py-0.5 rounded bg-pink-900/70 hover:bg-pink-800 text-pink-100 border border-pink-400/40 cursor-pointer"
                >
                  8部位衣橱 [C]
                </button>
                <button
                  type="button"
                  data-testid="debug-stage4-save"
                  onClick={() => onOpenConstellationHub('save')}
                  className="px-2 py-0.5 rounded bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 border border-emerald-400/40 cursor-pointer"
                >
                  存档管理
                </button>
              </div>
              <div className="pt-1 border-t border-fuchsia-500/30 flex flex-wrap items-center gap-1.5">
                <span className="text-fuchsia-200/90">阶段5表达&音乐:</span>
                <button
                  type="button"
                  data-testid="debug-stage5-deepcall"
                  onClick={() => onTriggerCallWave(0.95)}
                  className="px-2 py-0.5 rounded bg-sky-900/70 hover:bg-sky-800 text-sky-100 border border-sky-400/40 cursor-pointer"
                >
                  蓄力深呼唤(+1.5翼能)
                </button>
                {onChangeCallVoice && (
                  <button
                    type="button"
                    data-testid="debug-stage5-callvoice"
                    onClick={() => {
                      const order: CallVoiceType[] = [
                        'default',
                        'manta',
                        'jellyfish',
                        'bell',
                      ];
                      const nextVoice =
                        order[(order.indexOf(activeCallVoice) + 1) % order.length];
                      onChangeCallVoice(nextVoice);
                    }}
                    className="px-2 py-0.5 rounded bg-indigo-900/70 hover:bg-indigo-800 text-indigo-100 border border-indigo-400/40 cursor-pointer"
                  >
                    切换音色({activeCallVoice})
                  </button>
                )}
                <button
                  type="button"
                  data-testid="debug-stage5-emotelv5"
                  onClick={() => {
                    onUpgradeEmoteLevel?.('emote_spin_dance', 5);
                    onTriggerEmote('emote_spin_dance', 5);
                  }}
                  className="px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                >
                  满级Lv.5旋转舞
                </button>
                <button
                  type="button"
                  data-testid="debug-stage5-meditate"
                  onClick={() => {
                    onDebugTeleport(0, 1.2, 2.2, '中央神龛冥想留言台');
                    setMeditationDrawerOpen(true);
                  }}
                  className="px-2 py-0.5 rounded bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 border border-emerald-400/40 cursor-pointer"
                >
                  神龛冥想留言
                </button>
                <button
                  type="button"
                  data-testid="debug-stage5-instrument"
                  onClick={onToggleInstrument}
                  className="px-2 py-0.5 rounded bg-purple-900/70 hover:bg-purple-800 text-purple-100 border border-purple-400/40 cursor-pointer"
                >
                  竖琴&钢琴乐谱台[V]
                </button>
              </div>
              <div className="pt-1 border-t border-teal-500/30 flex flex-wrap items-center gap-1.5">
                <span className="text-teal-200/90">阶段6联机底座:</span>
                {onSimulateReconnect && (
                  <button
                    type="button"
                    data-testid="debug-stage6-reconnect"
                    onClick={onSimulateReconnect}
                    className="px-2 py-0.5 rounded bg-teal-900/70 hover:bg-teal-800 text-teal-100 border border-teal-400/40 cursor-pointer"
                  >
                    模拟断线重连
                  </button>
                )}
                {onCycleBotAiMode && (
                  <button
                    type="button"
                    data-testid="debug-stage6-botmode"
                    onClick={onCycleBotAiMode}
                    className="px-2 py-0.5 rounded bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 border border-emerald-400/40 cursor-pointer"
                  >
                    机器人AI({netStatus.botAiMode ?? 'patrol'})
                  </button>
                )}
                {onTriggerBotEnsemble && (
                  <button
                    type="button"
                    data-testid="debug-stage6-botensemble"
                    onClick={onTriggerBotEnsemble}
                    className="px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                  >
                    机器人共鸣合奏
                  </button>
                )}
                {onSwitchRoomInstance && (
                  <button
                    type="button"
                    data-testid="debug-stage6-switchroom"
                    onClick={onSwitchRoomInstance}
                    className="px-2 py-0.5 rounded bg-sky-900/70 hover:bg-sky-800 text-sky-100 border border-sky-400/40 cursor-pointer"
                  >
                    切换8人房间分线
                  </button>
                )}
              </div>
              <div className="pt-1 border-t border-rose-500/30 flex flex-wrap items-center gap-1.5">
                <span className="text-rose-200/90">阶段7社交系统:</span>
                {onIgnitePeer && (
                  <button
                    type="button"
                    data-testid="debug-stage7-ignite"
                    onClick={() => onIgnitePeer('bot_traveller_1')}
                    className="px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                  >
                    点亮陌生人(显真容)
                  </button>
                )}
                {onSendFriendRequest && (
                  <button
                    type="button"
                    data-testid="debug-stage7-friend"
                    onClick={() =>
                      onSendFriendRequest('bot_traveller_1', '云野挚友·牧蝶人')
                    }
                    className="px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                  >
                    缔结好友(1白烛)
                  </button>
                )}
                {onTeleportToFriend && (
                  <button
                    type="button"
                    data-testid="debug-stage7-teleport"
                    onClick={() => onTeleportToFriend('bot_traveller_2')}
                    className="px-2 py-0.5 rounded bg-sky-900/70 hover:bg-sky-800 text-sky-100 border border-sky-400/40 cursor-pointer"
                  >
                    传送至好友
                  </button>
                )}
                {onExecuteDualAction && (
                  <>
                    <button
                      type="button"
                      data-testid="debug-stage7-highfive"
                      onClick={() =>
                        onExecuteDualAction('bot_traveller_2', 'high_five')
                      }
                      className="px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                    >
                      星光击掌(+1.5翼能)
                    </button>
                    <button
                      type="button"
                      data-testid="debug-stage7-hug"
                      onClick={() =>
                        onExecuteDualAction('bot_traveller_2', 'hug')
                      }
                      className="px-2 py-0.5 rounded bg-rose-900/70 hover:bg-rose-800 text-rose-100 border border-rose-400/40 cursor-pointer"
                    >
                      温暖拥抱(瞬间满能)
                    </button>
                    <button
                      type="button"
                      data-testid="debug-stage7-handhold"
                      onClick={() =>
                        onExecuteDualAction('bot_traveller_2', 'hand_hold')
                      }
                      className="px-2 py-0.5 rounded bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 border border-emerald-400/40 cursor-pointer"
                    >
                      牵手同步共飞
                    </button>
                    <button
                      type="button"
                      data-testid="debug-stage7-carry"
                      onClick={() =>
                        onExecuteDualAction('bot_traveller_2', 'carry')
                      }
                      className="px-2 py-0.5 rounded bg-indigo-900/70 hover:bg-indigo-800 text-indigo-100 border border-indigo-400/40 cursor-pointer"
                    >
                      背抱翱翔
                    </button>
                  </>
                )}
                <button
                  type="button"
                  data-testid="debug-stage7-socialmodal"
                  onClick={() => onOpenConstellationHub('social')}
                  className="px-2 py-0.5 rounded bg-purple-900/70 hover:bg-purple-800 text-purple-100 border border-purple-400/40 cursor-pointer"
                >
                  好友树&举报[G]
                </button>
              </div>
              <div className="pt-1 border-t border-indigo-500/30 flex flex-wrap items-center gap-1.5">
                <span className="text-indigo-200/90">阶段8全王国&伊甸:</span>
                <button
                  type="button"
                  data-testid="debug-stage8-forest"
                  onClick={() =>
                    onDebugTeleport(
                      -7.2,
                      0.45,
                      -14.2,
                      '雨林：淋雨掉能 & 荧光巨菇避雨亭 (+水母浮力跃升)',
                      'forest'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-cyan-900/70 hover:bg-cyan-800 text-cyan-100 border border-cyan-400/40 cursor-pointer"
                >
                  雨林·淋雨&蘑菇亭
                </button>
                <button
                  type="button"
                  data-testid="debug-stage8-valley"
                  onClick={() =>
                    onDebugTeleport(
                      0.0,
                      0.45,
                      -11.8,
                      '霞谷：寒霜溜冰场低摩擦滑行 & 赛道金环冲刺',
                      'valley'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-pink-900/70 hover:bg-pink-800 text-pink-100 border border-pink-400/40 cursor-pointer"
                >
                  霞谷·溜冰场&光圈赛
                </button>
                <button
                  type="button"
                  data-testid="debug-stage8-wasteland"
                  onClick={() =>
                    onDebugTeleport(
                      -4.8,
                      0.45,
                      -16.2,
                      '暮土：冥龙巡逻掩体 & 深呼唤[Q]掀翻暗蟹',
                      'wasteland'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 border border-emerald-400/40 cursor-pointer"
                >
                  暮土·冥龙掩体&暗蟹
                </button>
                <button
                  type="button"
                  data-testid="debug-stage8-vault"
                  onClick={() =>
                    onDebugTeleport(
                      0.0,
                      0.45,
                      -17.8,
                      '禁阁：双人星盘机关门 & 星河低重力悬浮台',
                      'vault'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-indigo-900/70 hover:bg-indigo-800 text-indigo-100 border border-indigo-400/40 cursor-pointer"
                >
                  禁阁·双人门&星河台
                </button>
                <button
                  type="button"
                  data-testid="debug-stage8-eden"
                  onClick={() =>
                    onDebugTeleport(
                      -3.8,
                      0.45,
                      -14.0,
                      '伊甸之眼：先祖石像献祭(+红蜡烛) & 星河涅槃重生',
                      'eden'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-100 border border-rose-400/40 cursor-pointer"
                >
                  伊甸·献祭石像&重生
                </button>
              </div>
              <div className="pt-1 border-t border-amber-500/30 flex flex-wrap items-center gap-1.5">
                <span className="text-amber-200/90">阶段9任务&季节:</span>
                {onProgressAndClaimDailyQuest && (
                  <button
                    type="button"
                    data-testid="debug-stage9-dailyquest"
                    onClick={onProgressAndClaimDailyQuest}
                    className="px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                  >
                    完成&领每日任务
                  </button>
                )}
                {onCompleteSeasonStoryAct && (
                  <button
                    type="button"
                    data-testid="debug-stage9-seasonstory"
                    onClick={() => onCompleteSeasonStoryAct()}
                    className="px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                  >
                    推进季节向导剧情
                  </button>
                )}
                {onRotateTravelingSpirit && (
                  <button
                    type="button"
                    data-testid="debug-stage9-travelingspirit"
                    onClick={onRotateTravelingSpirit}
                    className="px-2 py-0.5 rounded bg-purple-900/70 hover:bg-purple-800 text-purple-100 border border-purple-400/40 cursor-pointer"
                  >
                    轮换复刻旅行先祖
                  </button>
                )}
                {onTriggerShardEvent && (
                  <button
                    type="button"
                    data-testid="debug-stage9-redshard"
                    onClick={() => onTriggerShardEvent('red')}
                    className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-100 border border-rose-400/40 cursor-pointer"
                  >
                    红石碎片喷发(+4红烛)
                  </button>
                )}
                {onSettleSeasonEndConversion && (
                  <button
                    type="button"
                    data-testid="debug-stage9-convertcandles"
                    onClick={onSettleSeasonEndConversion}
                    className="px-2 py-0.5 rounded bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 border border-emerald-400/40 cursor-pointer"
                  >
                    季末季蜡1:1转白烛
                  </button>
                )}
              </div>
              <div className="pt-1 border-t border-pink-500/30 flex flex-wrap items-center gap-1.5">
                <span className="text-pink-200/90">阶段10拍照&小屋:</span>
                <button
                  type="button"
                  data-testid="debug-stage10-photomode"
                  onClick={onOpenPhotoMode}
                  className="px-2 py-0.5 rounded bg-pink-900/70 hover:bg-pink-800 text-pink-100 border border-pink-400/40 cursor-pointer"
                >
                  自由相机&自拍[O]
                </button>
                <button
                  type="button"
                  data-testid="debug-stage10-homehub"
                  onClick={() => onOpenConstellationHub('home')}
                  className="px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                >
                  小屋工坊家具布置
                </button>
                {onApplyPresetHomeLayout && (
                  <button
                    type="button"
                    data-testid="debug-stage10-presetlayout"
                    onClick={() =>
                      onApplyPresetHomeLayout('preset_sakura_teahouse')
                    }
                    className="px-2 py-0.5 rounded bg-sky-900/70 hover:bg-sky-800 text-sky-100 border border-sky-400/40 cursor-pointer"
                  >
                    一键布置落樱茶会
                  </button>
                )}
                {onToggleChildSafeMode && (
                  <button
                    type="button"
                    data-testid="debug-stage10-childsafe"
                    onClick={onToggleChildSafeMode}
                    className="px-2 py-0.5 rounded bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 border border-emerald-400/40 cursor-pointer"
                  >
                    儿童守护({childSafeMode ? 'ON' : 'OFF'})
                  </button>
                )}
              </div>
              <div className="pt-1 border-t border-cyan-500/30 flex flex-wrap items-center gap-1.5">
                <span className="text-cyan-200/90">阶段11画质&无障碍&引导:</span>
                {onUpdateAccessibilityAndPerf && (
                  <>
                    <button
                      type="button"
                      data-testid="debug-stage11-quality"
                      onClick={() => {
                        const order: ('auto' | 'low' | 'medium' | 'high')[] = [
                          'auto',
                          'low',
                          'medium',
                          'high',
                        ];
                        const next =
                          order[(order.indexOf(qualityTier) + 1) % order.length];
                        onUpdateAccessibilityAndPerf({ qualityTier: next });
                      }}
                      className="px-2 py-0.5 rounded bg-cyan-900/70 hover:bg-cyan-800 text-cyan-100 border border-cyan-400/40 cursor-pointer"
                    >
                      画质档位({qualityTier})
                    </button>
                    <button
                      type="button"
                      data-testid="debug-stage11-contrast"
                      onClick={() =>
                        onUpdateAccessibilityAndPerf({
                          highContrastMode: !highContrastMode,
                        })
                      }
                      className="px-2 py-0.5 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                    >
                      高对比辅助({highContrastMode ? 'ON' : 'OFF'})
                    </button>
                    <button
                      type="button"
                      data-testid="debug-stage11-shake"
                      onClick={() =>
                        onUpdateAccessibilityAndPerf({
                          reducedMotionShake: !reducedMotionShake,
                        })
                      }
                      className="px-2 py-0.5 rounded bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 border border-emerald-400/40 cursor-pointer"
                    >
                      防眩晕减震({reducedMotionShake ? 'ON' : 'OFF'})
                    </button>
                    <button
                      type="button"
                      data-testid="debug-stage11-locale"
                      onClick={() =>
                        onUpdateAccessibilityAndPerf({
                          locale: locale === 'en' ? 'zh' : 'en',
                        })
                      }
                      className="px-2 py-0.5 rounded bg-indigo-900/70 hover:bg-indigo-800 text-indigo-100 border border-indigo-400/40 cursor-pointer"
                    >
                      语言({locale.toUpperCase()})
                    </button>
                  </>
                )}
                {onAdvanceOnboardingTutorial && (
                  <button
                    type="button"
                    data-testid="debug-stage11-tutorial"
                    onClick={() => onAdvanceOnboardingTutorial('complete_all')}
                    className="px-2 py-0.5 rounded bg-yellow-900/70 hover:bg-yellow-800 text-yellow-100 border border-yellow-400/40 cursor-pointer"
                  >
                    完成引导({tutorialStep}/3)
                  </button>
                )}
              </div>
              <div className="pt-1 border-t border-amber-400/40 flex flex-wrap items-center gap-1.5">
                <span className="text-amber-300 font-semibold">
                  阶段12广域秘境&彩蛋({discoveredEasterEggIds.length}/12):
                </span>
                <button
                  type="button"
                  data-testid="debug-stage12-geyser"
                  onClick={() =>
                    onDiscoverAndWarpEasterEgg
                      ? onDiscoverAndWarpEasterEgg('egg_sanctuary_geyser_whale')
                      : onDebugTeleport(52, 4.2, -26.5, '圣岛·海螺间歇泉与白鲸群岛')
                  }
                  className="px-2 py-0.5 rounded bg-sky-900/80 hover:bg-sky-800 text-sky-100 border border-sky-400/40 cursor-pointer"
                >
                  圣岛喷泉&白鲸(52,-28)
                </button>
                <button
                  type="button"
                  data-testid="debug-stage12-citadel"
                  onClick={() =>
                    onDebugTeleport(
                      46,
                      14.5,
                      -66.5,
                      '千鸟城·天际星桥高空浮岛 (高度 14.5m)'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-amber-900/80 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                >
                  千鸟高空浮岛(46,14.5,-68)
                </button>
                <button
                  type="button"
                  data-testid="debug-stage12-grandma"
                  onClick={() =>
                    onDiscoverAndWarpEasterEgg
                      ? onDiscoverAndWarpEasterEgg('egg_grandma_feast_table')
                      : onDebugTeleport(-54, 3.2, -30.5, '秘密花园·老奶奶团子树屋')
                  }
                  className="px-2 py-0.5 rounded bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-400/40 cursor-pointer"
                >
                  老奶奶团子树屋(-54,-32)
                </button>
                <button
                  type="button"
                  data-testid="debug-stage12-rainbow"
                  onClick={() =>
                    onDiscoverAndWarpEasterEgg
                      ? onDiscoverAndWarpEasterEgg('egg_rainbow_bridge')
                      : onDebugTeleport(0, 9.2, -86.5, '北境天际·七彩星光彩虹桥')
                  }
                  className="px-2 py-0.5 rounded bg-fuchsia-900/80 hover:bg-fuchsia-800 text-fuchsia-100 border border-fuchsia-400/40 cursor-pointer"
                >
                  七彩彩虹桥(0,9.2,-88)
                </button>
                <button
                  type="button"
                  data-testid="debug-stage12-oreo"
                  onClick={() =>
                    onDiscoverAndWarpEasterEgg?.('egg_oreo_plush_shrine')
                  }
                  className="px-2 py-0.5 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-400/40 cursor-pointer"
                >
                  召唤奥利奥小狗(38,-18)
                </button>
                <button
                  type="button"
                  data-testid="debug-stage12-rose"
                  onClick={() =>
                    onDiscoverAndWarpEasterEgg?.('egg_little_prince_rose')
                  }
                  className="px-2 py-0.5 rounded bg-pink-900/80 hover:bg-pink-800 text-pink-100 border border-pink-400/40 cursor-pointer"
                >
                  B612玻璃玫瑰(-42,26)
                </button>
                <button
                  type="button"
                  data-testid="debug-stage12-compass"
                  onClick={() => setEasterEggDrawerOpen((prev) => !prev)}
                  className="px-2 py-0.5 rounded bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 border border-indigo-400/40 cursor-pointer"
                >
                  秘境&彩蛋图鉴
                </button>
              </div>
              <div className="mt-1 pt-1 border-t border-slate-800 flex flex-wrap items-center gap-1">
                <span className="text-slate-400">阶段13极远大陆&新彩蛋:</span>
                <button
                  type="button"
                  data-testid="debug-stage13-windpaths"
                  onClick={() =>
                    onDiscoverAndWarpEasterEgg?.('egg_wind_paths_kalimba_chime')
                  }
                  className="px-2 py-0.5 rounded bg-cyan-900/80 hover:bg-cyan-800 text-cyan-100 border border-cyan-400/40 cursor-pointer"
                >
                  风行网道(112,22,-96)
                </button>
                <button
                  type="button"
                  data-testid="debug-stage13-hermit"
                  onClick={() =>
                    onDiscoverAndWarpEasterEgg?.('egg_hermit_yeti_igloo')
                  }
                  className="px-2 py-0.5 rounded bg-sky-900/80 hover:bg-sky-800 text-sky-100 border border-sky-400/40 cursor-pointer"
                >
                  雪隐峰冰屋(96,18.5,64)
                </button>
                <button
                  type="button"
                  data-testid="debug-stage13-abyss"
                  onClick={() =>
                    onDiscoverAndWarpEasterEgg?.('egg_abyss_treasure_leviathan')
                  }
                  className="px-2 py-0.5 rounded bg-teal-900/80 hover:bg-teal-800 text-teal-100 border border-teal-400/40 cursor-pointer"
                >
                  深海珊瑚渊(-108,68)
                </button>
                <button
                  type="button"
                  data-testid="debug-stage13-aurora"
                  onClick={() =>
                    onDiscoverAndWarpEasterEgg?.('egg_aurora_concert_wings')
                  }
                  className="px-2 py-0.5 rounded bg-amber-900/80 hover:bg-amber-800 text-amber-100 border border-amber-400/40 cursor-pointer"
                >
                  欧若拉剧场(0,12.8,-148)
                </button>
                <button
                  type="button"
                  data-testid="debug-stage13-ark"
                  onClick={() =>
                    onDiscoverAndWarpEasterEgg?.('egg_forgotten_ark_rainbow_spell')
                  }
                  className="px-2 py-0.5 rounded bg-purple-900/80 hover:bg-purple-800 text-purple-100 border border-purple-400/40 cursor-pointer"
                >
                  遗忘方舟(-88,-82)
                </button>
                <button
                  type="button"
                  data-testid="debug-stage13-trial"
                  onClick={() =>
                    onDiscoverAndWarpEasterEgg?.('egg_trial_of_fire_brazier')
                  }
                  className="px-2 py-0.5 rounded bg-orange-900/80 hover:bg-orange-800 text-orange-100 border border-orange-400/40 cursor-pointer"
                >
                  预言四试炼(78,-118)
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= DISCREET FLOATING TOASTS & DRAWERS ================= */}
      <div className="flex flex-col items-center gap-1.5 pointer-events-none">
        {tutorialStep < 3 && onAdvanceOnboardingTutorial && (
          <div
            data-testid="onboarding-tutorial-banner"
            className="px-3 py-1 rounded-full border border-white/15 bg-slate-950/70 text-[11px] text-amber-100/95 shadow-sm flex items-center gap-2 pointer-events-auto whitespace-nowrap"
          >
            <span>
              {locale === 'en'
                ? tutorialStep === 0
                  ? '🧭 1/3: Walk [WASD]'
                  : tutorialStep === 1
                    ? '🧭 2/3: Ignite [E] or Call [Q]'
                    : '🧭 3/3: Fly [Space] (+2 Candles)'
                : tutorialStep === 0
                  ? '🧭 旅途指引 1/3：按 [WASD] 漫步'
                  : tutorialStep === 1
                    ? '🧭 旅途指引 2/3：按 [E] 点亮或 [Q] 呼唤'
                    : '🧭 旅途指引 3/3：按 [Space] 振翅飞翔 (+2 白蜡)'}
            </span>
            <button
              type="button"
              data-testid="hud-advance-tutorial-btn"
              onClick={() =>
                onAdvanceOnboardingTutorial(
                  tutorialStep === 0
                    ? 'move'
                    : tutorialStep === 1
                      ? 'ignite'
                      : 'fly'
                )
              }
              className="px-2 py-0.5 rounded-full bg-amber-300/90 hover:bg-amber-300 text-slate-950 font-bold text-[10px] cursor-pointer"
            >
              {locale === 'en' ? 'Next ➔' : '完成 ➔'}
            </button>
          </div>
        )}
        {activeSpellId && (
          <div
            data-testid="active-sky-spell-pill"
            className="px-3 py-1 rounded-full border border-fuchsia-300/45 bg-slate-950/75 text-[11px] text-fuchsia-100 shadow-sm flex items-center gap-2 pointer-events-auto whitespace-nowrap"
          >
            <span>
              {SKY_ALCHEMY_SPELLS.find((s) => s.id === activeSpellId)?.icon}{' '}
              <strong className="text-amber-200">
                {SKY_ALCHEMY_SPELLS.find((s) => s.id === activeSpellId)?.name}
              </strong>{' '}
              ({Math.max(1, Math.ceil(activeSpellRemainingSec))}s)
            </span>
            <button
              type="button"
              data-testid="cancel-sky-spell-btn"
              onClick={() => onActivateSkySpell?.(null)}
              className="px-1.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[10px] text-slate-300 cursor-pointer"
            >
              散去
            </button>
          </div>
        )}
        {sunsetRaceState?.active && (
          <div
            data-testid="active-sunset-race-pill"
            className="px-3.5 py-1 rounded-full border border-amber-300/60 bg-slate-950/80 text-xs text-amber-100 shadow-lg flex items-center gap-2.5 pointer-events-auto whitespace-nowrap"
          >
            <span className="font-bold text-amber-300 font-mono">
              🏁 霞光竞速 {(sunsetRaceState.elapsedMs / 1000).toFixed(2)}s
            </span>
            <span className="text-sky-200 text-[11px]">
              下一站 ({sunsetRaceState.currentCheckpointIndex + 1}/
              {SUNSET_RACE_CHECKPOINTS.length})：
              {SUNSET_RACE_CHECKPOINTS[sunsetRaceState.currentCheckpointIndex]?.name}
            </span>
            {onCompleteSunsetRaceQuickTest && (
              <button
                type="button"
                data-testid="hud-race-finish-quick-btn"
                onClick={onCompleteSunsetRaceQuickTest}
                className="px-2 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-bold cursor-pointer"
              >
                ⚡ 冲线结算
              </button>
            )}
          </div>
        )}
        {activeSpiritMemory && (
          <div
            data-testid="spirit-memory-tracker"
            className="px-3.5 py-1.5 rounded-full border border-cyan-300/45 bg-slate-950/75 text-xs text-cyan-100 shadow-lg flex items-center gap-2.5 pointer-events-auto whitespace-nowrap"
          >
            <div>
              <span className="font-bold text-amber-300">
                🌟 先祖记忆 ({activeSpiritMemory.currentStepIndex}/
                {activeSpiritMemory.totalSteps})：
              </span>
              <span>
                {
                  activeSpiritMemory.steps[
                    activeSpiritMemory.currentStepIndex - 1
                  ]?.title
                }
              </span>
            </div>
            {onAdvanceSpiritMemory && (
              <button
                type="button"
                data-testid="advance-spirit-memory-btn"
                onClick={onAdvanceSpiritMemory}
                className="px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold cursor-pointer"
              >
                ✨ 推进 [F]
              </button>
            )}
          </div>
        )}

        {ceremonyTitle && (
          <div
            data-testid="hud-ceremony-banner"
            className="px-4 py-1.5 rounded-full border border-amber-300/70 bg-gradient-to-r from-amber-950/90 via-indigo-950/90 to-amber-950/90 text-xs font-bold text-amber-200 shadow-xl flex items-center gap-2 pointer-events-none"
          >
            <span className="text-sm">✨</span>
            <span>{ceremonyTitle}</span>
            <span className="text-sm">✨</span>
          </div>
        )}

        {nearbyLuminaShardEval?.isWithinVisualHintRadius &&
          nearbyLuminaShardEval.nearestShard && (
            <div
              data-testid="hud-lumina-proximity-hint"
              className="px-3.5 py-1 rounded-full border border-cyan-300/55 bg-slate-950/80 text-[11px] text-cyan-100 shadow-lg flex items-center gap-2 pointer-events-auto whitespace-nowrap"
            >
              <span>
                {nearbyLuminaShardEval.nearestShard.icon}{' '}
                <strong className="text-amber-200">
                  {nearbyLuminaShardEval.nearestShard.name}
                </strong>{' '}
                <span className="font-mono text-cyan-300">
                  ({nearbyLuminaShardEval.distance3d.toFixed(1)}m)
                </span>
              </span>
              <span className="text-[10px] text-slate-300">
                {nearbyLuminaShardEval.isAlreadyCollected
                  ? `🌊 可回响共鸣 (+${nearbyLuminaShardEval.nearestShard.echoWaxValue}烛火)`
                  : `✦ 靠近收集 (+${nearbyLuminaShardEval.nearestShard.resonancePts}光能)`}
              </span>
              {onCollectAndWarpLuminaShard && (
                <button
                  type="button"
                  data-testid="hud-absorb-nearby-shard-btn"
                  onClick={() =>
                    onCollectAndWarpLuminaShard(
                      nearbyLuminaShardEval.nearestShard!.id
                    )
                  }
                  className="px-2 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-bold cursor-pointer"
                >
                  ✨ 吸收共鸣 [E]
                </button>
              )}
            </div>
          )}

        {bannerMessage && (
          <div
            className="px-4 py-1 rounded-full border border-amber-200/35 bg-slate-950/75 text-xs font-medium text-amber-100 shadow-md max-w-xl truncate"
            role="status"
          >
            {bannerMessage}
          </div>
        )}

        {dualActionStatusText && (
          <div className="px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-xs text-emerald-200 font-medium">
            {dualActionStatusText}
          </div>
        )}

        {netStatus.followLeaderId && (
          <div
            data-testid="hud-follow-leader-pill"
            className="px-3.5 py-1 rounded-full bg-cyan-950/85 border border-cyan-400/50 text-xs text-cyan-100 font-medium flex items-center gap-2 pointer-events-auto shadow-md"
          >
            <span>
              🧭 正在自动跟随伙伴探索 ({netStatus.followLeaderId}) · 按任意方向键或点击可随时脱离
            </span>
            {onFollowPartner && (
              <button
                type="button"
                data-testid="hud-stop-follow-btn"
                onClick={() => onFollowPartner(null)}
                className="px-2 py-0.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-[10px] font-bold cursor-pointer"
              >
                停止跟随
              </button>
            )}
          </div>
        )}

        {sharedEmotionalEval?.active && (
          <div
            data-testid="hud-shared-emotional-banner"
            className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-950/85 via-rose-950/85 to-amber-950/85 border border-amber-300/55 text-[11px] text-amber-100 shadow-lg flex items-center gap-2 pointer-events-none"
          >
            <span className="font-bold text-amber-200">{sharedEmotionalEval.title}</span>
            <span className="text-slate-200">{sharedEmotionalEval.subtitle}</span>
          </div>
        )}

        {latestChatBubble && (
          <div className="px-3.5 py-1 rounded-full bg-slate-950/80 border border-sky-300/40 text-xs text-sky-100 shadow-md">
            💬 <strong className="text-amber-200">{latestChatBubble.senderName}：</strong>
            {latestChatBubble.text}
          </div>
        )}

        {/* Stage 5: Shrine Meditation & Blessing Note Modal Drawer */}
        {(meditationDrawerOpen || physics.sitMode === 'meditate_shrine') && (
          <div
            data-testid="meditation-shrine-panel"
            className="w-full max-w-xl p-3.5 rounded-2xl border border-emerald-300/50 bg-slate-950/94 text-slate-100 shadow-2xl pointer-events-auto"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold text-emerald-300">
                🧘 神龛冥想心语台 · 留言化作星光纸船漂流 (+1 每日先祖爱心)
              </span>
              <button
                type="button"
                onClick={() => setMeditationDrawerOpen(false)}
                className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
              >
                [收起]
              </button>
            </div>
            <div className="text-[11px] text-amber-100/90 mb-2">
              {EXPRESSION_CFG?.meditation?.promptQuestion ||
                '今日神龛冥想提问：在云海旅途中，哪一刻的微光与陪伴最令你感到温暖？'}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                data-testid="meditation-note-input"
                value={meditationInput}
                onChange={(e) => setMeditationInput(e.target.value)}
                placeholder="写下你的星海冥想心语..."
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-100"
              />
              <button
                type="button"
                data-testid="submit-meditation-btn"
                onClick={() => {
                  onSubmitMeditationNote?.(meditationInput);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                ✨ 寄出冥想心语
              </button>
            </div>
            {meditationNotes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-emerald-200/90">
                <span className="text-slate-400">神龛星光留声：</span>
                {meditationNotes.slice(0, 3).map((n) => (
                  <span
                    key={n.id}
                    className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/30"
                  >
                    ✦ {n.author}：「{n.text}」
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stage 12: Outer Sanctuary & 6 Sky Tribute Easter Eggs Compass Drawer */}
        {easterEggDrawerOpen && (
          <div
            data-testid="easter-egg-compass-drawer"
            className="fixed inset-x-0 top-16 mx-auto z-50 w-[94vw] max-w-3xl p-4 rounded-2xl border border-amber-300/50 bg-slate-950/95 text-slate-100 shadow-2xl pointer-events-auto max-h-[76vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
              <div>
                <div className="text-xs sm:text-sm font-bold text-amber-200">
                  🗺️ 光能探索成长阶位、16 枚四阶光能碎片、8 处隐秘地标与 12 大致敬彩蛋图鉴
                </div>
                <div className="text-[11px] text-slate-400">
                  已收集光能碎片 {collectedLuminaShardIds.length}/16 · 已踏足隐秘地标{' '}
                  {discoveredSecretZoneIds.length}/8 · 已收录致敬彩蛋{' '}
                  {discoveredEasterEggIds.length}/12
                </div>
              </div>
              <button
                type="button"
                data-testid="close-easter-egg-compass-btn"
                onClick={() => setEasterEggDrawerOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
              >
                关闭 [✕]
              </button>
            </div>

            {/* Module 6: Explorer Growth Rank & Lumina Resonance Progress Card */}
            {(() => {
              const rankEval = evaluateExplorerGrowthRankPure(luminaResonancePts);
              return (
                <div
                  data-testid="compendium-explorer-rank-card"
                  className="mb-3 p-3 rounded-xl border border-amber-300/45 bg-gradient-to-r from-slate-900/95 via-indigo-950/70 to-slate-900/95"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold">
                        {rankEval.currentRankSpec.badgeIcon} {rankEval.currentRankSpec.title}
                      </span>
                      <span className="text-xs text-amber-100 font-medium">
                        {rankEval.currentRankSpec.rewardSummary}
                      </span>
                    </div>
                    <span
                      data-testid="compendium-resonance-pts"
                      className="font-mono text-xs font-bold text-cyan-300"
                    >
                      ✨ 光能共鸣：{luminaResonancePts} pt
                      {rankEval.nextRankSpec
                        ? ` / 下一阶 ${rankEval.nextRankSpec.title} 需 ${rankEval.nextRankSpec.requiredResonancePts} pt`
                        : ' (已达最高阶位 MAX)'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-amber-300 via-cyan-300 to-fuchsia-400 transition-all duration-300"
                      style={{
                        width: `${rankEval.progressPercent}%`,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                    {EXPLORER_GROWTH_RANKS.map((rk) => {
                      const unlocked = rankEval.currentRankSpec.rank >= rk.rank;
                      return (
                        <div
                          key={rk.rank}
                          className={`px-2 py-1 rounded-lg border ${
                            unlocked
                              ? 'border-amber-300/50 bg-amber-950/35 text-amber-100'
                              : 'border-slate-800 bg-slate-950/60 text-slate-400'
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span>
                              {rk.badgeIcon} {rk.title}
                            </span>
                            <span>{unlocked ? '✓ 已解锁' : `${rk.requiredResonancePts}pt`}</span>
                          </div>
                          <div className="truncate opacity-85">{rk.rewardSummary}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Module 6: 16 Original 4-Tier Lumina Shards Catalog */}
            <div className="mb-3" data-testid="compendium-lumina-shards-grid">
              <div className="text-[11px] font-semibold text-cyan-300 mb-1.5">
                💎 四阶原创光能碎片图鉴（{collectedLuminaShardIds.length}/16 已收集 · 晨露微光 +15pt / 星棱晶簇 +30pt / 云海星核 +50pt / 苍穹圣辉 +85pt，已收集碎片重访可触发「星光回响」获温和烛火）：
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {LUMINA_SHARD_CATALOG.map((shard) => {
                  const isCollected = collectedLuminaShardIds.includes(shard.id);
                  const isEchoed = sessionEchoedShardIds.includes(shard.id);
                  return (
                    <div
                      key={shard.id}
                      data-testid={`compendium-shard-card-${shard.id}`}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 ${
                        isCollected
                          ? 'border-cyan-300/55 bg-cyan-950/25'
                          : 'border-slate-800 bg-slate-900/90'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-amber-100 truncate">
                            {shard.icon} {shard.name}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              isCollected
                                ? isEchoed
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                                  : 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                                : 'bg-slate-800 text-amber-300'
                            }`}
                          >
                            {isCollected
                              ? isEchoed
                                ? '✓ 本局已回响'
                                : '✓ 已收集 · 可回响'
                              : `+${shard.resonancePts}pt · ${shard.tierLabel}`}
                          </span>
                        </div>
                        <div className="text-[10px] text-cyan-200/85 mt-0.5">
                          📍 {shard.zoneName} ({shard.x}, {Math.round(shard.y)}m, {shard.z})
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {shard.loreHint}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span className="text-[10px] text-amber-200/90 font-mono">
                          {isCollected
                            ? `回响奖励: +${shard.echoWaxValue} 滴烛火`
                            : `首收: +${shard.resonancePts}pt / +${shard.waxValue}烛火 / +${shard.firstCandlesBonus}白蜡`}
                        </span>
                        <button
                          type="button"
                          data-testid={`collect-lumina-shard-btn-${shard.id}`}
                          onClick={() => {
                            onCollectAndWarpLuminaShard?.(shard.id);
                            setEasterEggDrawerOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-[11px] font-bold cursor-pointer shrink-0"
                        >
                          {isCollected ? '🌊 跃迁回响' : '✨ 寻光收集'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Module 6: 8 Secret Landmarks & Ancient Story Murals Compendium */}
            <div className="mb-3" data-testid="compendium-secret-landmarks-grid">
              <div className="text-[11px] font-semibold text-fuchsia-300 mb-1.5">
                🏛️ 八大隐秘浮岛与远古无字壁画胜景图鉴（{discoveredSecretZoneIds.length}/8 已发现 · 踏足区域自动收录并获 +25~30pt 光能共鸣 & +1 白蜡烛）：
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SECRET_EXPLORATION_LANDMARKS.map((lm) => {
                  const discovered = discoveredSecretZoneIds.includes(lm.id);
                  return (
                    <div
                      key={lm.id}
                      data-testid={`compendium-landmark-card-${lm.id}`}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                        discovered
                          ? 'border-fuchsia-300/55 bg-fuchsia-950/25'
                          : 'border-slate-800 bg-slate-900/90'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-fuchsia-200 truncate">
                            {lm.category === 'floating_island' ? '🏝️' : '🪨'} {lm.name}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              discovered
                                ? 'bg-emerald-500/25 text-emerald-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {discovered ? '✓ 已踏足' : `+${lm.resonanceRewardPts}pt`}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {lm.subtitle}
                        </div>
                      </div>
                      <button
                        type="button"
                        data-testid={`discover-secret-landmark-btn-${lm.id}`}
                        onClick={() => {
                          onDiscoverAndWarpSecretLandmark?.(lm.id);
                          setEasterEggDrawerOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-fuchsia-400/25 hover:bg-fuchsia-400/40 border border-fuchsia-300/50 text-[11px] font-bold text-fuchsia-100 shrink-0 cursor-pointer"
                      >
                        🧭 前往胜景
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage 14: Aviary Alchemy Spell Workshop & Sunset Speedrun Time-Trial */}
            <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Aviary Alchemy Spell Workshop */}
              <div className="p-3 rounded-xl border border-fuchsia-400/35 bg-slate-900/90">
                <div className="text-[11px] font-bold text-fuchsia-200 mb-1">
                  ✨ 南境云巢 · 炼金魔法工坊（免费赐福 180 秒增益）：
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {SKY_ALCHEMY_SPELLS.map((spell) => {
                    const isCurrent = activeSpellId === spell.id;
                    return (
                      <div
                        key={spell.id}
                        className={`px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-2 ${
                          isCurrent
                            ? 'border-fuchsia-300 bg-fuchsia-950/45'
                            : 'border-slate-800 bg-slate-950/60'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-fuchsia-100 truncate">
                            {spell.icon} {spell.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {spell.subtitle}
                          </div>
                        </div>
                        <button
                          type="button"
                          data-testid={`activate-spell-btn-${spell.id}`}
                          onClick={() => {
                            onActivateSkySpell?.(isCurrent ? null : spell.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer ${
                            isCurrent
                              ? 'bg-fuchsia-400 text-slate-950'
                              : 'bg-fuchsia-500/20 hover:bg-fuchsia-500/35 border border-fuchsia-300/40 text-fuchsia-200'
                          }`}
                        >
                          {isCurrent ? '✓ 生效中' : '✨ 施放魔法'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sunset Speedrun Time-Trial Challenge */}
              <div className="p-3 rounded-xl border border-amber-400/35 bg-slate-900/90 flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-bold text-amber-200">
                      🏁 霞光环大陆流光竞速赛（4 站滑翔计时挑战）
                    </span>
                    <span
                      data-testid="sunset-race-best-badge"
                      className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-[10px] font-mono text-amber-200"
                    >
                      {bestRaceTimeMs
                        ? `最佳: ${(bestRaceTimeMs / 1000).toFixed(2)}s (${
                            bestRaceMedal === 'gold'
                              ? '🥇黄金'
                              : bestRaceMedal === 'silver'
                                ? '🥈白银'
                                : '🥉青铜'
                          })`
                        : '最佳: 暂无纪录'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mb-2">
                    路线：东境竞速拱廊 (36,8) ➔ 霞光双子塔 (58,8) ➔ 东南风车观星台 (34,26) ➔ 正南远古日晷终点 (0,62)。45秒内冲线获🥇黄金飞翼奖章及 +3 白蜡烛 & +1 爱心！
                  </div>
                  <div className="space-y-1">
                    {SUNSET_RACE_CHECKPOINTS.map((cp) => {
                      const passed =
                        Boolean(sunsetRaceState?.active) &&
                        (sunsetRaceState?.currentCheckpointIndex || 0) > cp.index;
                      const current =
                        Boolean(sunsetRaceState?.active) &&
                        sunsetRaceState?.currentCheckpointIndex === cp.index;
                      return (
                        <div
                          key={cp.id}
                          className="flex items-center justify-between text-[10px] px-2 py-1 rounded bg-slate-950/70 border border-slate-800"
                        >
                          <span className="text-slate-200 font-medium">{cp.name}</span>
                          <span className="font-mono text-amber-300">
                            {passed ? '✓ 已通过' : current ? '🎯 当前目标' : `(${cp.x}, ${cp.z})`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    data-testid="start-sunset-race-btn"
                    onClick={() => {
                      onStartSunsetRace?.();
                      setEasterEggDrawerOpen(false);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    🏁 传送起点并开启竞速赛
                  </button>
                  {onCompleteSunsetRaceQuickTest && (
                    <button
                      type="button"
                      data-testid="drawer-race-finish-quick-btn"
                      onClick={() => {
                        onCompleteSunsetRaceQuickTest();
                        setEasterEggDrawerOpen(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-400/20 hover:bg-sky-400/35 border border-sky-300/50 text-sky-200 text-xs font-bold cursor-pointer"
                    >
                      ⚡ 冲线结算
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 8 Continental Ground Architectural Hubs */}
            <div className="mb-3">
              <div className="text-[11px] font-semibold text-emerald-300 mb-1.5">
                🏛️ 八大地面建筑群落与互动玩法区（分布于全大陆东南西北中域，含烛火、光之翼、竞速金环、上升气流与升空星盘）：
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CONTINENTAL_ARCHITECTURAL_HUBS.map((hub) => (
                  <div
                    key={hub.id}
                    className="p-2.5 rounded-xl border border-emerald-400/35 bg-slate-900/90 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-emerald-200 truncate">
                        {hub.name}{' '}
                        <span className="font-mono text-[10px] text-slate-400">
                          ({hub.x}, {hub.y}m, {hub.z})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {hub.subtitle}
                      </div>
                    </div>
                    <button
                      type="button"
                      data-testid={`warp-continental-hub-btn-${hub.id}`}
                      onClick={() => {
                        onDebugTeleport?.(hub.x, hub.y, hub.z + 1.2, hub.name);
                        setEasterEggDrawerOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-400/20 hover:bg-emerald-400/35 border border-emerald-300/50 text-[11px] font-bold text-emerald-200 shrink-0 cursor-pointer"
                    >
                      🏛️ 传送探索
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 8 Outer Sanctuaries */}
            <div className="mb-3">
              <div className="text-[11px] font-semibold text-sky-300 mb-1.5">
                🏝️ 八大外围秘境与高空浮岛群（点击可乘风行网道直达）：
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {((STAGE12_CFG?.outerSanctuaries || []) as {
                  id: string;
                  name: string;
                  subtitle: string;
                  x: number;
                  y: number;
                  z: number;
                }[]).map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-xl border border-sky-400/30 bg-slate-900/90 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-sky-200 truncate">
                        {s.name}{' '}
                        <span className="font-mono text-[10px] text-slate-400">
                          ({s.x}, {s.y}m, {s.z})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {s.subtitle}
                      </div>
                    </div>
                    <button
                      type="button"
                      data-testid={`warp-sanctuary-btn-${s.id}`}
                      onClick={() => {
                        onDebugTeleport?.(s.x, s.y, s.z + 1.5, s.name);
                        setEasterEggDrawerOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-400/20 hover:bg-sky-400/35 border border-sky-300/50 text-[11px] font-bold text-sky-200 shrink-0 cursor-pointer"
                    >
                      🌬️ 乘风前往
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 12 Collectible Easter Eggs */}
            <div>
              <div className="text-[11px] font-semibold text-amber-300 mb-1.5">
                🥚 十二大《光·遇》经典致敬彩蛋（首次触发可获丰厚白蜡烛、爱心、红蜡烛与永久小金人）：
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {((STAGE12_CFG?.easterEggs || []) as {
                  id: string;
                  name: string;
                  subtitle: string;
                  loreText: string;
                  x: number;
                  z: number;
                  launchVy: number;
                }[]).map((egg) => {
                  const found = discoveredEasterEggIds.includes(egg.id);
                  return (
                    <div
                      key={egg.id}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 ${
                        found
                          ? 'border-amber-300/60 bg-amber-950/30'
                          : 'border-slate-800 bg-slate-900/90'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-amber-200 truncate">
                            {egg.name}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              found
                                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {found ? '✓ 已收录' : '未解锁'}
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-100/80 mt-0.5">
                          {egg.subtitle}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {egg.loreText}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span className="font-mono text-[10px] text-slate-400">
                          坐标: ({egg.x}, {egg.z})
                        </span>
                        <button
                          type="button"
                          data-testid={`warp-easter-egg-btn-${egg.id}`}
                          onClick={() => {
                            onDiscoverAndWarpEasterEgg?.(egg.id);
                            setEasterEggDrawerOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold cursor-pointer"
                        >
                          🌠 跃迁并触发彩蛋
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* ================= BOTTOM PERIMETER: FEATHERLIGHT TRANSLUCENT DOCK ================= */}
      <div className="relative flex items-end justify-center w-full">
        {/* Left Discreet Translucent Touch Joystick (Multi-Device Adaptive Sizing) */}
        <div
          ref={joyBaseRef}
          data-testid="touch-virtual-joystick"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            handleJoyPointer(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (!joyKnob.active) return;
            handleJoyPointer(e.clientX, e.clientY);
          }}
          onPointerUp={resetJoystick}
          onPointerCancel={resetJoystick}
          style={{
            width: `${responsiveProfile.joystickDiameterPx}px`,
            height: `${responsiveProfile.joystickDiameterPx}px`,
          }}
          title="虚拟摇杆：轻推漫步 (<68%)，推满奔跑 (>=68%)"
          className={`fixed bottom-3 left-3 flex rounded-full sky-glass-pill items-center justify-center pointer-events-auto cursor-pointer touch-none transition-opacity ${
            responsiveProfile.primaryInput === 'touch' || joyKnob.active
              ? 'opacity-85 hover:opacity-100'
              : 'opacity-45 hover:opacity-95'
          }`}
        >
          <div className="w-8 h-8 rounded-full border border-dashed border-amber-200/20 pointer-events-none absolute" />
          <div
            className="w-5 h-5 rounded-full bg-amber-300/80 border border-white/80 shadow-sm transition-transform duration-75"
            style={{
              transform: `translate(${joyKnob.x * 0.65}px, ${joyKnob.y * 0.65}px)`,
            }}
          />
        </div>

        {/* Centered Compact Translucent Starlight Dock */}
        <div className="flex flex-col items-center max-w-4xl pointer-events-none">
          {/* Module 8: 2-Player Co-op Mechanism Status & Companion Summon Capsule */}
          {coopEval && (
            <div
              data-testid="hud-coop-status-pill"
              className="mb-1.5 px-3.5 py-1.5 rounded-2xl border border-amber-300/60 bg-slate-950/90 text-xs text-amber-100 shadow-xl flex flex-wrap items-center justify-center gap-2 pointer-events-auto sky-hint-enter"
            >
              <span className="font-bold text-amber-300">
                🚪 {coopEval.mechanismName} ({coopEval.participantCount}/
                {coopEval.requiredParticipants} 人就位)
              </span>
              <span className="text-[11px] text-slate-300">
                {coopEval.participantLabels.join(' · ') || '等待旅人靠近'}
              </span>
              {!coopEval.canActivate && onSummonCoopCompanions && (
                <button
                  type="button"
                  data-testid="hud-summon-coop-btn"
                  onClick={onSummonCoopCompanions}
                  className="sky-btn px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold cursor-pointer shadow-sm"
                >
                  🔔 呼唤旅伴协力就位
                </button>
              )}
              {coopEval.canActivate && (
                <button
                  type="button"
                  data-testid="hud-activate-coop-btn"
                  onClick={onTriggerInteract}
                  className="sky-btn px-3 py-1 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-[11px] font-extrabold cursor-pointer shadow-sm"
                >
                  ✨ 双人共鸣已满 · 按 [E] 开启石门
                </button>
              )}
            </div>
          )}

          {/* Module 8: Contextual Non-Intrusive Proximity Social Interaction Bar */}
          {nearbySocialPeerEval?.isWithinPromptRadius &&
            nearbySocialPeerEval.nearestPeer && (
              <div
                data-testid="hud-proximity-social-bar"
                className="mb-1.5 px-3 py-1 rounded-full border border-sky-300/45 bg-slate-950/85 text-xs text-slate-100 shadow-lg flex flex-wrap items-center justify-center gap-1.5 pointer-events-auto sky-hint-enter"
              >
                <span
                  data-testid="hud-proximity-peer-source-badge"
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    nearbySocialPeerEval.peerSourceType === 'local_ai_companion'
                      ? 'bg-indigo-950/90 border-indigo-400/50 text-indigo-200'
                      : 'bg-emerald-950/90 border-emerald-400/50 text-emerald-200'
                  }`}
                >
                  {nearbySocialPeerEval.peerSourceBadge}
                </span>
                <span className="font-semibold text-amber-100 text-[11px]">
                  {nearbySocialPeerEval.displayName}{' '}
                  <span className="font-mono text-[10px] text-slate-400">
                    ({nearbySocialPeerEval.distance3d}m)
                  </span>
                </span>

                <div className="h-3 w-px bg-white/15 mx-0.5" />

                {!nearbySocialPeerEval.ignited && onIgnitePeer && (
                  <button
                    type="button"
                    data-testid="hud-prox-ignite-btn"
                    onClick={() =>
                      onIgnitePeer(nearbySocialPeerEval.nearestPeer!.playerId)
                    }
                    className="sky-btn px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold cursor-pointer"
                  >
                    🕯️ 点亮心火
                  </button>
                )}

                <button
                  type="button"
                  data-testid="hud-prox-wave-btn"
                  onClick={() => onTriggerEmote('emote_bow_respect', 3)}
                  className="sky-btn px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[11px] text-sky-100 cursor-pointer"
                >
                  👋 挥手问候
                </button>

                <button
                  type="button"
                  data-testid="hud-prox-dance-btn"
                  onClick={() => onTriggerEmote('emote_spin_dance', 4)}
                  className="sky-btn px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[11px] text-amber-100 cursor-pointer"
                >
                  💃 欢舞
                </button>

                {nearbySocialPeerEval.ignited &&
                  !nearbySocialPeerEval.isFriend &&
                  onSendFriendRequest && (
                    <button
                      type="button"
                      data-testid="hud-prox-friend-btn"
                      onClick={() =>
                        onSendFriendRequest(
                          nearbySocialPeerEval.nearestPeer!.playerId
                        )
                      }
                      className="sky-btn px-2.5 py-0.5 rounded-full bg-amber-400/90 hover:bg-amber-300 text-slate-950 text-[11px] font-bold cursor-pointer"
                    >
                      🤝 赠烛结友
                    </button>
                  )}

                {nearbySocialPeerEval.ignited && onFollowPartner && (
                  <button
                    type="button"
                    data-testid="hud-prox-follow-btn"
                    onClick={() =>
                      onFollowPartner(
                        netStatus.followLeaderId ===
                          nearbySocialPeerEval.nearestPeer!.playerId
                          ? null
                          : nearbySocialPeerEval.nearestPeer!.playerId
                      )
                    }
                    className={`sky-btn px-2 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer ${
                      netStatus.followLeaderId ===
                      nearbySocialPeerEval.nearestPeer!.playerId
                        ? 'bg-cyan-400 text-slate-950'
                        : 'bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/40 text-cyan-200'
                    }`}
                  >
                    {netStatus.followLeaderId ===
                    nearbySocialPeerEval.nearestPeer!.playerId
                      ? '✓ 跟随中'
                      : '🧭 跟随'}
                  </button>
                )}

                {nearbySocialPeerEval.isFriend && onExecuteDualAction && (
                  <>
                    <button
                      type="button"
                      data-testid="hud-prox-handhold-btn"
                      onClick={() =>
                        onExecuteDualAction(
                          nearbySocialPeerEval.nearestPeer!.playerId,
                          'hand_hold'
                        )
                      }
                      className="sky-btn px-2 py-0.5 rounded-full bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-400/40 text-[11px] text-emerald-200 font-semibold cursor-pointer"
                    >
                      🤝 牵手共飞
                    </button>
                    <button
                      type="button"
                      data-testid="hud-prox-highfive-btn"
                      onClick={() =>
                        onExecuteDualAction(
                          nearbySocialPeerEval.nearestPeer!.playerId,
                          'high_five'
                        )
                      }
                      className="sky-btn px-2 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/40 text-[11px] text-amber-200 cursor-pointer"
                    >
                      🙌 击掌
                    </button>
                    <button
                      type="button"
                      data-testid="hud-prox-hug-btn"
                      onClick={() =>
                        onExecuteDualAction(
                          nearbySocialPeerEval.nearestPeer!.playerId,
                          'hug'
                        )
                      }
                      className="sky-btn px-2 py-0.5 rounded-full bg-rose-500/25 hover:bg-rose-500/40 border border-rose-400/40 text-[11px] text-rose-200 cursor-pointer"
                    >
                      🫂 拥抱
                    </button>
                  </>
                )}
              </div>
            )}

          {nearestInteractable && (
            <button
              type="button"
              data-testid="hud-nearest-interactable-btn"
              onClick={onTriggerInteract}
              className="sky-btn sky-hint-enter mb-1.5 px-4 py-1.5 rounded-full border border-amber-300 bg-amber-300/95 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1.5 hover:bg-amber-200 transition-all pointer-events-auto cursor-pointer whitespace-nowrap"
            >
              <span>🔥 [E / F] {nearestInteractable.name} — {nearestInteractable.subtitle}</span>
            </button>
          )}

          {/* Module 9: Dynamic Contextual Operation Hint Capsule (Auto-Fades after 4.2s in Steady State) */}
          {contextualHint.visible && (
            <div
              data-testid="hud-contextual-control-hint"
              data-hint-category={contextualHint.category}
              style={{ opacity: contextualHint.opacity01 }}
              className="sky-hint-enter mb-1.5 px-3.5 py-1 rounded-full sky-glass-pill text-[11px] text-slate-100 flex items-center gap-2 pointer-events-none transition-opacity duration-300"
            >
              <span>{contextualHint.icon}</span>
              <span className="font-semibold text-amber-200">
                {contextualHint.primaryText}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-300/20 border border-amber-300/40 text-amber-100 font-mono text-[10px]">
                {contextualHint.keybindLabel}
              </span>
            </div>
          )}

          {dockCollapsed ? (
            <button
              type="button"
              tabIndex={-1}
              data-testid="toggle-dock-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                setDockCollapsed(false);
              }}
              className="sky-btn sky-glass-pill px-3.5 py-1 rounded-full text-[11px] font-medium text-amber-200 hover:text-white pointer-events-auto cursor-pointer shadow-sm whitespace-nowrap"
            >
              ▴ 展开星盘动作坞 [H]
            </button>
          ) : (
            <div
              className="rounded-full sky-glass-pill px-2.5 py-1 text-slate-100 shadow-lg pointer-events-auto flex flex-col gap-1 transition-opacity duration-300"
            >
              {/* Single-Line Compact Mode & Action Strip */}
              <div className="flex items-center justify-center gap-1 flex-wrap sm:flex-nowrap">
                {/* Mode Segmented Pills */}
                <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-slate-950/50 border border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDockTab('actions')}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      dockTab === 'actions'
                        ? 'bg-amber-300 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    动作
                  </button>
                  <button
                    type="button"
                    data-testid="dock-tab-emotes"
                    onClick={() => setDockTab('emotes')}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      dockTab === 'emotes'
                        ? 'bg-amber-300 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    表情
                  </button>
                  <button
                    type="button"
                    onClick={() => setDockTab('realms')}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      dockTab === 'realms'
                        ? 'bg-amber-300 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    星门
                  </button>
                </div>

                <div className="h-3.5 w-px bg-white/15 hidden sm:block shrink-0" />

                {/* Tab 1 Inline Compact Action Chips */}
                {dockTab === 'actions' && (
                  <div className="flex items-center justify-center gap-1 flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      data-testid="flap-wing-btn"
                      onClick={onTriggerFlap}
                      title="消耗1格翼能振翅升空 [Space]"
                      className="h-7 px-2.5 rounded-full border border-amber-300/35 bg-white/8 hover:bg-white/18 text-xs font-medium text-amber-100 transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      🪽 振翅 <span className="hidden xl:inline text-[10px] text-amber-200/75">[Space]</span>
                    </button>

                    <button
                      type="button"
                      data-testid="dive-boost-btn"
                      onPointerDown={() => onSetDiveHeld?.(true)}
                      onPointerUp={() => onSetDiveHeld?.(false)}
                      onPointerLeave={() => onSetDiveHeld?.(false)}
                      onClick={() => onSetDiveHeld?.(!physics.isDiving)}
                      title="空中收翼俯冲转化升力 [X]"
                      className={`h-7 px-2.5 rounded-full border text-xs font-medium transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
                        physics.isDiving
                          ? 'border-cyan-300 bg-cyan-400/25 text-cyan-100'
                          : 'border-cyan-300/35 bg-white/8 hover:bg-white/18 text-cyan-100'
                      }`}
                    >
                      ☄️ {physics.isDiving ? '拉起' : '俯冲'} <span className="hidden xl:inline text-[10px] text-cyan-200/75">[X]</span>
                    </button>

                    <button
                      type="button"
                      data-testid="call-wave-btn"
                      onPointerDown={() => {
                        callPressStartRef.current = performance.now();
                      }}
                      onPointerUp={() => {
                        const heldSec = Math.max(
                          0.15,
                          (performance.now() - callPressStartRef.current) / 1000
                        );
                        onTriggerCallWave(heldSec);
                      }}
                      title="短按星音呼唤 / 长按蓄力深呼唤 [Q]"
                      className="h-7 px-2.5 rounded-full border border-sky-300/35 bg-white/8 hover:bg-white/18 text-xs font-medium text-sky-100 transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      🔔 呼唤 <span className="hidden xl:inline text-[10px] text-sky-200/75">[Q]</span>
                    </button>

                    <button
                      type="button"
                      data-testid="interact-heart-btn"
                      onClick={onTriggerInteract}
                      title={nearestInteractable ? nearestInteractable.name : '点亮蜡烛/拾取小金人 [E/F]'}
                      className="h-7 px-2.5 rounded-full border border-rose-300/35 bg-white/8 hover:bg-white/18 text-xs font-medium text-rose-100 transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      🔥 共鸣 <span className="hidden xl:inline text-[10px] text-rose-200/75">[E]</span>
                    </button>

                    <button
                      type="button"
                      data-testid="sit-meditate-btn"
                      onClick={() => {
                        onToggleSit();
                        setMeditationDrawerOpen(true);
                      }}
                      title="地面打坐 / 神龛冥想留言 [Z]"
                      className={`h-7 px-2.5 rounded-full border text-xs font-medium transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
                        physics.sitMode !== 'none'
                          ? 'border-emerald-300 bg-emerald-400/25 text-emerald-100'
                          : 'border-emerald-300/35 bg-white/8 hover:bg-white/18 text-emerald-100'
                      }`}
                    >
                      🧘 {physics.sitMode !== 'none' ? '起身' : '冥想'} <span className="hidden xl:inline text-[10px] text-emerald-200/75">[Z]</span>
                    </button>

                    <button
                      type="button"
                      data-testid="open-wardrobe-btn"
                      onClick={onOpenWardrobe}
                      title="8部位换装衣橱 [C]"
                      className="h-7 px-2.5 rounded-full border border-amber-300/50 bg-amber-400/15 hover:bg-amber-400/25 text-xs font-medium text-amber-100 transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      🧥 衣橱 <span className="hidden xl:inline text-[10px] text-amber-200/75">[C]</span>
                    </button>

                    <button
                      type="button"
                      data-testid="open-instrument-btn"
                      onClick={onToggleInstrument}
                      title="竖琴/钢琴/长笛/录制回放 [V]"
                      className="h-7 px-2.5 rounded-full border border-purple-300/35 bg-white/8 hover:bg-white/18 text-xs font-medium text-purple-100 transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      🎵 乐器 <span className="hidden xl:inline text-[10px] text-purple-200/75">[V]</span>
                    </button>
                  </div>
                )}

                {/* Tab 3 Inline 8 Sky Realms Portal Pills */}
                {dockTab === 'realms' && (
                  <div className="flex items-center justify-center gap-1 flex-wrap sm:flex-nowrap">
                    {(Object.keys(REALMS) as RealmId[]).map((rKey) => {
                      const r = REALMS[rKey];
                      const active = progress.currentRealm === rKey;
                      return (
                        <button
                          key={rKey}
                          type="button"
                          onClick={() => onSelectRealm(rKey)}
                          title={r.name}
                          className={`h-7 px-2.5 rounded-full border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                            active
                              ? 'border-amber-300 bg-amber-300/25 text-amber-100 font-bold'
                              : 'border-white/12 bg-white/8 hover:bg-white/18 text-slate-200'
                          }`}
                        >
                          {r.name.split(' · ')[0]}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="h-3.5 w-px bg-white/15 hidden sm:block shrink-0" />

                {/* Quiet Inline Room Status & Collapse Toggle */}
                <span
                  data-testid="hud-dock-room-status"
                  title="严格区分：🌐 真实联机玩家 vs 🤖 本地单机 AI 旅伴"
                  className="hidden 2xl:inline text-[10px] text-amber-100/80 whitespace-nowrap shrink-0"
                >
                  🌐 真人{netStatus.realOnlineCount ?? 1} · 🤖 AI旅伴{netStatus.localBotCount ?? 3}
                </span>

                <button
                  type="button"
                  tabIndex={-1}
                  data-testid="toggle-dock-btn"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    setDockCollapsed(true);
                  }}
                  title="收起底部星盘坞进入纯净观赏模式 [H]"
                  className="h-7 px-2 rounded-full hover:bg-white/15 text-[11px] font-medium text-amber-200/90 hover:text-white cursor-pointer whitespace-nowrap shrink-0"
                >
                  ▾ 收起
                </button>
              </div>

              {/* Tab 2: Compact Emotes & Call Timbres Strip */}
              {dockTab === 'emotes' && (
                <div className="pt-1 border-t border-white/10 flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="text-sky-200/90">音色:</span>
                      {(
                        [
                          { id: 'default', label: '初心星音' },
                          { id: 'manta', label: '遥鲲清鸣' },
                          { id: 'jellyfish', label: '水母空灵' },
                          { id: 'bell', label: '禁阁星钟' },
                        ] as const
                      ).map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          data-testid={`call-voice-btn-${v.id}`}
                          onClick={() => onChangeCallVoice?.(v.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium cursor-pointer whitespace-nowrap ${
                            activeCallVoice === v.id
                              ? 'bg-sky-300 text-slate-950 font-bold'
                              : 'bg-white/10 text-slate-300 hover:text-white'
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        data-testid="deep-call-trigger-btn"
                        onClick={() => onTriggerCallWave(0.95)}
                        className="px-2 py-0.5 rounded-full bg-amber-300/20 border border-amber-300/40 text-[10px] text-amber-200 font-medium hover:bg-amber-300/30 cursor-pointer whitespace-nowrap"
                      >
                        🌟 蓄力深呼唤
                      </button>
                      <button
                        type="button"
                        data-testid="open-meditation-drawer-btn"
                        onClick={() => setMeditationDrawerOpen((prev) => !prev)}
                        className="px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-[10px] text-emerald-200 font-medium hover:bg-emerald-400/30 cursor-pointer whitespace-nowrap"
                      >
                        🧘 冥想留言
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {SKY_EMOTES.map((emote) => {
                      const isActive = progress.activeEmote === emote.id;
                      const unlockedLv = emoteLevels[emote.id] || 1;
                      const spec = computeEmoteLevelSpec(emote.id, unlockedLv);
                      return (
                        <div
                          key={emote.id}
                          title={`${emote.name} · ${spec.auraDescription}`}
                          className={`px-2 py-1 rounded-full border flex items-center gap-1.5 whitespace-nowrap ${
                            isActive
                              ? 'border-amber-300 bg-amber-300/25 text-amber-100'
                              : 'border-white/12 bg-white/8 text-slate-200'
                          }`}
                        >
                          <button
                            type="button"
                            data-testid={`emote-btn-${emote.id}`}
                            onClick={() => onTriggerEmote(emote.id, unlockedLv)}
                            className="text-xs font-medium cursor-pointer hover:text-amber-200"
                          >
                            {emote.name} <span className="font-mono text-[10px] text-amber-300">Lv.{unlockedLv}</span>
                          </button>
                          <button
                            type="button"
                            data-testid={`upgrade-emote-btn-${emote.id}`}
                            onClick={() => {
                              const nextLv = unlockedLv >= 5 ? 1 : unlockedLv + 1;
                              onUpgradeEmoteLevel?.(emote.id, nextLv);
                              onTriggerEmote(emote.id, nextLv);
                            }}
                            title="升级/切换动作等级 (Lv.1–5)"
                            className="px-1.5 py-0.2 rounded-full bg-white/12 hover:bg-amber-300 hover:text-slate-950 text-[9px] font-semibold text-amber-200 cursor-pointer"
                          >
                            {unlockedLv < 5 ? '⬆️' : '↺'}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {progress.activeEmote && (
                    <div
                      data-testid="active-emote-status"
                      className="text-[10px] text-amber-200 font-medium text-center"
                    >
                      ✨ 当前施展动作：{progress.activeEmote} (Lv.{activeEmoteLevel})
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
