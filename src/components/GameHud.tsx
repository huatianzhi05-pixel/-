import React, { useState, useEffect, useRef } from 'react';
import {
  DayNightPhase,
  EXPRESSION_CFG,
  GameProgressState,
  PlayerPhysicsState,
  REALMS,
  RealmId,
  SKY_EMOTES,
  WorldInteractable,
  computeEmoteLevelSpec,
  getDayNightAtmosphere,
  getSubZoneNameAt,
} from '../game/rules';
import { EquippedLoadout, getCosmeticById } from '../game/cosmetics';
import { CallVoiceType } from '../game/audio';
import { SpiritMemoryQuestState } from '../core/StorageService';

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
}

function formatEnergySourceLabel(physics: PlayerPhysicsState): {
  text: string;
  colorClass: string;
} {
  if (physics.krillAlertLevel > 0.1) {
    return {
      text: '⚠️ 冥龙红光锁定！速躲掩体',
      colorClass: 'text-red-400 font-bold animate-pulse',
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
        colorClass: 'text-rose-400 font-bold animate-pulse',
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
  onOpenWardrobe,
  onOpenConstellationHub,
  onOpenPhotoMode,
  onToggleInstrument,
  onSelectRealm,
  onPause,
  onResetPosition,
  onTouchJoystickChange,
}) => {
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [dockTab, setDockTab] = useState<'actions' | 'emotes' | 'realms'>('actions');
  const [meditationDrawerOpen, setMeditationDrawerOpen] = useState(false);
  const [meditationInput, setMeditationInput] = useState(
    '愿每一缕微光都能穿越云海，照亮独行旅人的夜空。'
  );
  const callPressStartRef = useRef<number>(0);
  const [joyKnob, setJoyKnob] = useState({ x: 0, y: 0, active: false });
  const joyBaseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'KeyH' && !document.querySelector('[aria-label="光遇15键云端乐器演奏台"]')) {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const realm = REALMS[progress.currentRealm];
  const subZoneName = getSubZoneNameAt(progress.currentRealm, physics.x, physics.z);
  const equippedCape = getCosmeticById(loadout.cape);
  const fullWedges = Math.floor(physics.wingEnergy);
  const partialWedge = physics.wingEnergy - fullWedges;

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
    <div className="fixed inset-0 z-20 pointer-events-none select-none flex flex-col justify-between p-4 md:p-5">
      {/* ================= TOP PERIMETER CLUSTER ================= */}
      <div className="flex items-start justify-between gap-3">
        {/* Top-Left: Candles, Hearts, Ascended Candles & Current Realm + Sub-Zone */}
        <div
          className="rounded-2xl border border-amber-200/25 px-4 py-2 text-slate-100 pointer-events-auto shadow-lg"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)' }}
        >
          <div className="flex items-center gap-3.5">
            {/* White Candles */}
            <div className="flex items-center gap-1.5" title="白蜡烛与烛火进度">
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
                <path d="M12 2C10 5 9 7 12 10C15 7 14 5 12 2Z" fill="#FDE047" />
                <rect x="9" y="10" width="6" height="12" rx="1.5" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
              </svg>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  白蜡烛
                </div>
                <div className="text-sm font-bold font-mono tabular-nums text-white leading-tight">
                  {Math.round(progress.candles)}
                </div>
              </div>
            </div>

            {/* Hearts */}
            <div className="flex items-center gap-1.5" title="先祖爱心">
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="#FB7185"
                />
              </svg>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  先祖爱心
                </div>
                <div className="text-sm font-bold font-mono tabular-nums text-rose-200 leading-tight">
                  {Math.round(progress.hearts)}
                </div>
              </div>
            </div>

            {/* Ascended Candles */}
            <div className="flex items-center gap-1.5" title="伊甸升华红蜡烛">
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
                <polygon points="12,1 16,8 12,11 8,8" fill="#FDE047" />
                <rect x="8.5" y="10" width="7" height="12" rx="1.5" fill="#EF4444" />
              </svg>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  升华红烛
                </div>
                <div className="text-sm font-bold font-mono tabular-nums text-amber-300 leading-tight">
                  {Math.round(progress.ascendedCandles)}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Zone, Day/Night Phase & Wax Forge Bar */}
          <div className="mt-1.5 pt-1 border-t border-slate-800 flex items-center justify-between gap-2.5 text-[11px] text-amber-100/85">
            <span data-testid="hud-subzone-label">
              {realm.name.split(' · ')[0]} · {subZoneName}
            </span>
            <button
              type="button"
              data-testid="cycle-daynight-btn"
              onClick={onCycleDayNightPhase}
              title="点击或按 [T] 切换昼夜氛围与配乐律动"
              className="px-2 py-0.5 rounded bg-sky-950/80 hover:bg-sky-900 border border-sky-400/35 text-[10px] font-semibold text-sky-200 cursor-pointer"
            >
              {dayNightPhase === 'morning'
                ? '🌅 破晓晨曦 [T]'
                : dayNightPhase === 'noon'
                  ? '☀️ 晴空正午 [T]'
                  : dayNightPhase === 'sunset'
                    ? '🌇 落日流霞 [T]'
                    : '🌌 星河静夜 [T]'}
            </button>
            <span className="font-mono tabular-nums text-amber-300">
              烛火 {Math.round(progress.wax)}/100
            </span>
          </div>
        </div>

        {/* Top-Center: Iconic Sky Circular Segmented Wing Energy Ring + Wedge Bar */}
        <div
          className="rounded-2xl border border-amber-300/40 px-4 py-2 flex items-center gap-3.5 pointer-events-auto shadow-xl"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
        >
          {/* Stage 2 Segmented Circular Wing Energy Ring */}
          <div
            data-testid="hud-wing-energy-ring"
            className="relative w-12 h-12 shrink-0 flex items-center justify-center"
            title={`斗篷能量环：${physics.wingEnergy.toFixed(2)} / ${physics.maxWingWedges} 格 (每次拍翼消耗 1 格)`}
          >
            <svg viewBox="0 0 56 56" className="w-12 h-12 -rotate-90">
              {Array.from({ length: physics.maxWingWedges }).map((_, idx) => {
                const total = Math.max(1, physics.maxWingWedges);
                const r = 22;
                const cx = 28;
                const cy = 28;
                const gapDeg = total > 1 ? 6 : 0;
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
                      : '#334155';

                return (
                  <path
                    key={idx}
                    d={d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isFull || isPartial ? '4.8' : '3.6'}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-xs font-extrabold font-mono text-amber-200">
                {Math.ceil(Math.max(0, physics.wingEnergy - 0.04))}
              </span>
              <span className="text-[8px] text-amber-300/80 uppercase">翼格</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-200">
                光之翼能量 · {physics.maxWingWedges} 翼星阶
              </span>
              <span className="text-xs font-mono tabular-nums text-amber-300 font-bold">
                ({progress.wingedLights} 小金人)
              </span>
              {physics.tempLostWedges > 0.05 && (
                <span className="px-1.5 py-0.2 rounded bg-rose-950/90 border border-rose-400/50 text-[10px] font-mono text-rose-300">
                  受损 -{physics.tempLostWedges.toFixed(1)} 格
                </span>
              )}
            </div>

            {/* Discrete Wing Energy Wedges */}
            <div
              className="flex items-center gap-1.5"
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
                    className="w-4 h-5 transition-transform"
                    aria-hidden="true"
                  >
                    <polygon
                      points="10,2 18,12 10,22 2,12"
                      fill={
                        isTempLost
                          ? 'rgba(239, 68, 68, 0.35)'
                          : isFull
                            ? '#FDE047'
                            : isPartial
                              ? '#F59E0B'
                              : 'rgba(30, 41, 59, 0.85)'
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
                    {isFull && <circle cx="10" cy="12" r="2.5" fill="#FFFFFF" />}
                  </svg>
                );
              })}
            </div>

            {/* Flight Mode & Stage 2 Recharge / Drain Source Telemetry Line */}
            <div className="mt-1 flex items-center gap-2.5 text-[11px]">
              <button
                type="button"
                tabIndex={-1}
                data-testid="toggle-flight-mode-btn"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onToggleFlightMode();
                }}
                className="text-sky-300 hover:text-sky-200 font-medium cursor-pointer"
              >
                飞行模式：
                {physics.isDiving
                  ? '极速俯冲 [X]'
                  : physics.flightMode === 'glide'
                    ? '流光滑翔 (远距拉镜) [Shift]'
                    : '垂直悬停 (精准升降) [Shift]'}
              </button>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              {(() => {
                const srcInfo = formatEnergySourceLabel(physics);
                return (
                  <span
                    data-testid="hud-energy-source-label"
                    className={srcInfo.colorClass}
                  >
                    {srcInfo.text}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Top-Right: Quick Feature Shortcuts (Constellation, Friends, Quests, Photo, Debug, Mute, Reset, Pause) */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            data-testid="open-constellation-hub-btn"
            onClick={() => onOpenConstellationHub('constellation')}
            className="h-9 px-2.5 rounded-xl border border-amber-200/25 flex items-center gap-1 text-xs font-semibold text-amber-200 hover:border-amber-300 cursor-pointer"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)' }}
          >
            <span>✦ 星盘</span>
            <span className="hidden lg:inline text-[10px] text-slate-400">[K]</span>
          </button>

          <button
            type="button"
            data-testid="open-social-hub-btn"
            onClick={() => onOpenConstellationHub('social')}
            className="h-9 px-2.5 rounded-xl border border-amber-200/25 flex items-center gap-1 text-xs font-semibold text-sky-200 hover:border-sky-300 cursor-pointer"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)' }}
          >
            <span>🤝 好友</span>
            <span className="hidden lg:inline text-[10px] text-slate-400">[G]</span>
          </button>

          <button
            type="button"
            data-testid="open-photo-mode-btn"
            onClick={onOpenPhotoMode}
            className="h-9 px-2.5 rounded-xl border border-amber-200/25 flex items-center gap-1 text-xs font-semibold text-rose-200 hover:border-rose-300 cursor-pointer"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)' }}
          >
            <span>📷 拍照</span>
            <span className="hidden lg:inline text-[10px] text-slate-400">[O]</span>
          </button>

          <button
            type="button"
            aria-label={muted ? '取消静音 [M]' : '静音 [M]'}
            onClick={onToggleMute}
            className="w-9 h-9 rounded-xl border border-amber-200/25 flex items-center justify-center text-amber-100 hover:border-amber-300 cursor-pointer"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)' }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
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
            onClick={onResetPosition}
            className="w-9 h-9 rounded-xl border border-amber-200/25 flex items-center justify-center text-amber-100 hover:border-amber-300 cursor-pointer"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)' }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="暂停游戏 [P/Esc]"
            onClick={onPause}
            className="w-9 h-9 rounded-xl border border-amber-200/25 flex items-center justify-center text-amber-100 hover:border-amber-300 cursor-pointer"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)' }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* ================= BUILT-IN DEBUG OVERLAY (?debug=1) ================= */}
      {debugMode && (
        <div
          data-testid="debug-telemetry-panel"
          className="self-start mt-2 px-3.5 py-2.5 rounded-xl border border-emerald-400/40 bg-slate-950/92 text-[11px] font-mono text-emerald-300 pointer-events-auto space-y-1 shadow-xl max-w-xl"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-bold text-emerald-200">
              [DEBUG PANEL · ?debug=1 · 阶段1–11全量实时遥测]
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
                  星盘解锁树 [P]
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
            </>
          )}
        </div>
      )}

      {/* ================= TOP-CENTER STATUS TOAST, SPIRIT MEMORY TRACKER & CHAT BUBBLE ================= */}
      <div className="mt-2 flex flex-col items-center gap-1.5 pointer-events-none mb-auto">
        {tutorialStep < 3 && onAdvanceOnboardingTutorial && (
          <div
            data-testid="onboarding-tutorial-banner"
            className="px-3.5 py-1.5 rounded-2xl border border-amber-300/50 bg-slate-950/88 text-[11px] text-amber-100 shadow-lg flex items-center gap-2.5 pointer-events-auto"
          >
            <span>
              {locale === 'en'
                ? tutorialStep === 0
                  ? '🧭 Step 1/3: Walk with [WASD]'
                  : tutorialStep === 1
                    ? '🧭 Step 2/3: Press [E] to ignite or [Q] to call'
                    : '🧭 Step 3/3: Press [Space] to flap & fly (+2 Candles)'
                : tutorialStep === 0
                  ? '🧭 新手旅途 [1/3]：按 [WASD] 在遇境漫步'
                  : tutorialStep === 1
                    ? '🧭 新手旅途 [2/3]：按 [E] 点亮烛火或按 [Q] 星音呼唤'
                    : '🧭 新手旅途 [3/3]：按 [Space] 振翅飞翔 (+2 白蜡烛)'}
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
              className="px-2 py-0.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] cursor-pointer"
            >
              {locale === 'en' ? 'Next ➔' : '推进步骤 ➔'}
            </button>
          </div>
        )}
        {activeSpiritMemory && (
          <div
            data-testid="spirit-memory-tracker"
            className="px-4 py-2 rounded-2xl border border-cyan-300/70 bg-slate-950/92 text-xs text-cyan-100 shadow-2xl flex flex-wrap items-center gap-3 pointer-events-auto"
          >
            <div>
              <span className="font-bold text-amber-300">
                🌟 先祖记忆重温中 ({activeSpiritMemory.currentStepIndex}/
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
                className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold cursor-pointer"
              >
                ✨ 共鸣推进本幕 [F]
              </button>
            )}
          </div>
        )}

        {bannerMessage && (
          <div
            className="px-5 py-1.5 rounded-xl border border-amber-300/60 text-xs sm:text-sm font-semibold text-amber-100 shadow-xl"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.90)' }}
            role="status"
          >
            {bannerMessage}
          </div>
        )}

        {dualActionStatusText && (
          <div className="px-4 py-1 rounded-full bg-emerald-950/90 border border-emerald-400/50 text-xs text-emerald-200 font-semibold">
            {dualActionStatusText}
          </div>
        )}

        {latestChatBubble && (
          <div className="px-4 py-1.5 rounded-2xl bg-slate-900/95 border border-sky-300/50 text-xs text-sky-100 shadow-lg">
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
      </div>

      {/* ================= BOTTOM ROW: VIRTUAL TOUCH JOYSTICK + STARLIGHT DOCK ================= */}
      <div className="relative flex items-end justify-center w-full">
        {/* Left Virtual Touch Joystick (For Touch / Mobile & Drag Movement; push full to run) */}
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
          title="虚拟摇杆：轻推漫步 (<68%)，推满奔跑 (>=68%)"
          className="flex w-20 h-20 rounded-full border border-amber-200/35 bg-slate-950/75 items-center justify-center pointer-events-auto cursor-pointer shrink-0 mr-3 mb-1 touch-none relative"
        >
          <div className="w-12 h-12 rounded-full border border-dashed border-amber-200/20 pointer-events-none absolute" />
          <div
            className="w-8 h-8 rounded-full bg-amber-300/85 border border-white shadow-md transition-transform duration-75"
            style={{
              transform: `translate(${joyKnob.x}px, ${joyKnob.y}px)`,
            }}
          />
        </div>

        {/* Collapsible Unified Bottom Starlight Dock */}
        <div className="flex flex-col items-center w-full max-w-4xl pointer-events-none">
          {nearestInteractable && (
            <button
              type="button"
              onClick={onTriggerInteract}
              className="mb-2.5 px-5 py-2 rounded-xl border-2 border-amber-300 bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 hover:bg-amber-200 active:scale-95 transition-all pointer-events-auto cursor-pointer"
            >
              <span>🔥 [E] {nearestInteractable.name} — {nearestInteractable.subtitle}</span>
            </button>
          )}

          {/* Collapse / Expand Zen Mode Toggle Handle */}
          <button
            type="button"
            tabIndex={-1}
            data-testid="toggle-dock-btn"
            onClick={(e) => {
              e.currentTarget.blur();
              setDockCollapsed((prev) => !prev);
            }}
            className="px-4 py-1 rounded-t-xl border border-b-0 border-amber-200/30 text-[11px] font-semibold text-amber-200 hover:text-white pointer-events-auto cursor-pointer"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
          >
            {dockCollapsed ? '▴ 展开星盘控制坞 [H]' : '▾ 收起星盘 (纯净观赏模式) [H]'}
          </button>

          {!dockCollapsed && (
            <div
              className="w-full rounded-2xl border border-amber-200/30 px-4 py-2.5 text-slate-100 shadow-2xl pointer-events-auto"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.90)' }}
            >
              {/* Dock Mode Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDockTab('actions')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      dockTab === 'actions'
                        ? 'bg-amber-300 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    核心探索与换装
                  </button>
                  <button
                    type="button"
                    data-testid="dock-tab-emotes"
                    onClick={() => setDockTab('emotes')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      dockTab === 'emotes'
                        ? 'bg-amber-300 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    呼唤与动作轮盘 (Lv.1–5)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDockTab('realms')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      dockTab === 'realms'
                        ? 'bg-amber-300 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    八大王国星门传送
                  </button>
                </div>

                <div
                  data-testid="hud-dock-room-status"
                  className="text-[11px] text-amber-200/85 truncate"
                >
                  房间：{netStatus.roomId} · 在线旅人：{netStatus.onlineCount}/
                  {netStatus.maxRoomSize ?? 8} 人 · 斗篷：{equippedCape.name}
                </div>
              </div>

              {/* Tab 1: Core Exploration, Flight, Dive, Call, Wardrobe & Instrument */}
              {dockTab === 'actions' && (
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                  <button
                    type="button"
                    data-testid="flap-wing-btn"
                    onClick={onTriggerFlap}
                    className="px-3 py-2 rounded-xl border border-amber-300/40 bg-slate-900 hover:border-amber-200 text-left transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="text-xs font-bold text-amber-200">
                      振翅高飞 [Space]
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      消耗1格翼能升空
                    </div>
                  </button>

                  <button
                    type="button"
                    data-testid="dive-boost-btn"
                    onPointerDown={() => onSetDiveHeld?.(true)}
                    onPointerUp={() => onSetDiveHeld?.(false)}
                    onPointerLeave={() => onSetDiveHeld?.(false)}
                    onClick={() => onSetDiveHeld?.(!physics.isDiving)}
                    className={`px-3 py-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer ${
                      physics.isDiving
                        ? 'border-cyan-300 bg-cyan-400/25 text-cyan-100'
                        : 'border-cyan-300/40 bg-slate-900 hover:border-cyan-200'
                    }`}
                  >
                    <div className="text-xs font-bold text-cyan-200">
                      {physics.isDiving ? '拉起升空 [X]' : '俯冲加速 [X]'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {physics.isDiving
                        ? `蓄势 ${physics.diveMomentum.toFixed(1)} · 松开拉升`
                        : '空中收翼俯冲转化升力'}
                    </div>
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
                    className="px-3 py-2 rounded-xl border border-sky-300/40 bg-slate-900 hover:border-sky-200 text-left transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="text-xs font-bold text-sky-200">
                      星音呼唤 [Q]
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      短按鸣叫 / 长按蓄力深呼唤
                    </div>
                  </button>

                  <button
                    type="button"
                    data-testid="interact-heart-btn"
                    onClick={onTriggerInteract}
                    className="px-3 py-2 rounded-xl border border-rose-300/40 bg-slate-900 hover:border-rose-200 text-left transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="text-xs font-bold text-rose-200">
                      心火共鸣 [E]
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {nearestInteractable ? nearestInteractable.name : '点亮蜡烛/拾取小金人'}
                    </div>
                  </button>

                  <button
                    type="button"
                    data-testid="sit-meditate-btn"
                    onClick={() => {
                      onToggleSit();
                      setMeditationDrawerOpen(true);
                    }}
                    className={`px-3 py-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer ${
                      physics.sitMode !== 'none'
                        ? 'border-emerald-300 bg-emerald-400/20 text-emerald-100'
                        : 'border-emerald-300/40 bg-slate-900 hover:border-emerald-200'
                    }`}
                  >
                    <div className="text-xs font-bold text-emerald-200">
                      {physics.sitMode !== 'none' ? '起身站立 [Z]' : '坐下 / 冥想 [Z]'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {physics.sitMode === 'meditate_shrine'
                        ? '正在神龛打坐冥想'
                        : physics.sitMode === 'sit_bench'
                          ? '正与旅人长椅并排坐'
                          : '地面坐下/神龛冥想留言'}
                    </div>
                  </button>

                  <button
                    type="button"
                    data-testid="open-wardrobe-btn"
                    onClick={onOpenWardrobe}
                    className="px-3 py-2 rounded-xl border border-amber-300/60 bg-amber-400/15 hover:bg-amber-400/25 text-left transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="text-xs font-bold text-amber-200">
                      8部位换装衣橱 [C]
                    </div>
                    <div className="text-[11px] text-amber-100/80 truncate">
                      斗篷/发/帽/面/脸/颈/裤/背
                    </div>
                  </button>

                  <button
                    type="button"
                    data-testid="open-instrument-btn"
                    onClick={onToggleInstrument}
                    className="px-3 py-2 rounded-xl border border-purple-300/40 bg-slate-900 hover:border-purple-200 text-left transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="text-xs font-bold text-purple-200">
                      云端乐器 [V]
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      竖琴/钢琴/长笛/录制回放
                    </div>
                  </button>
                </div>
              )}

              {/* Tab 2: Stage 5 Call Timbres + 7 Ancestor Emotes with Lv.1-5 Upgrade Wheel */}
              {dockTab === 'emotes' && (
                <div className="space-y-2">
                  {/* Call Voice Switcher & Deep Call Trigger Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-800/80 text-[11px]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-sky-200">🔊 呼唤音色：</span>
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
                          className={`px-2 py-0.5 rounded-md font-medium cursor-pointer ${
                            activeCallVoice === v.id
                              ? 'bg-sky-300 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        data-testid="deep-call-trigger-btn"
                        onClick={() => onTriggerCallWave(0.95)}
                        className="px-2.5 py-0.5 rounded-md bg-amber-300/20 border border-amber-300/50 text-amber-200 font-semibold hover:bg-amber-300/30 cursor-pointer"
                      >
                        🌟 蓄力深呼唤 (+1.5格翼能 & 掀翻暗蟹)
                      </button>
                      <button
                        type="button"
                        data-testid="open-meditation-drawer-btn"
                        onClick={() => setMeditationDrawerOpen((prev) => !prev)}
                        className="px-2.5 py-0.5 rounded-md bg-emerald-400/20 border border-emerald-300/50 text-emerald-200 font-semibold hover:bg-emerald-400/30 cursor-pointer"
                      >
                        🧘 神龛冥想留言
                      </button>
                    </div>
                  </div>

                  {/* 7 Ancestor Emotes with Lv.1-5 Level Badge & Upgrade Trigger */}
                  <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                    {SKY_EMOTES.map((emote) => {
                      const isActive = progress.activeEmote === emote.id;
                      const unlockedLv = emoteLevels[emote.id] || 1;
                      const spec = computeEmoteLevelSpec(emote.id, unlockedLv);
                      return (
                        <div
                          key={emote.id}
                          className={`p-2 rounded-xl border transition-all flex flex-col justify-between ${
                            isActive
                              ? 'border-amber-300 bg-amber-300/20 text-amber-100'
                              : 'border-slate-800 bg-slate-900 hover:border-slate-600 text-slate-200'
                          }`}
                        >
                          <button
                            type="button"
                            data-testid={`emote-btn-${emote.id}`}
                            onClick={() => onTriggerEmote(emote.id, unlockedLv)}
                            className="text-left cursor-pointer w-full"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold truncate">
                                {emote.name}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-amber-400/25 text-amber-200 text-[10px] font-mono font-bold">
                                Lv.{unlockedLv}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {spec.auraDescription}
                            </div>
                          </button>

                          <div className="mt-1.5 pt-1 border-t border-slate-800 flex items-center justify-between gap-1">
                            <span className="text-[9px] text-amber-200/75 font-mono">
                              ★×{spec.particleCount} ({spec.motionScale}x)
                            </span>
                            <button
                              type="button"
                              data-testid={`upgrade-emote-btn-${emote.id}`}
                              onClick={() => {
                                const nextLv = unlockedLv >= 5 ? 1 : unlockedLv + 1;
                                onUpgradeEmoteLevel?.(emote.id, nextLv);
                                onTriggerEmote(emote.id, nextLv);
                              }}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-amber-300 hover:text-slate-950 text-[9px] font-semibold text-amber-200 cursor-pointer"
                            >
                              {unlockedLv < 5 ? `⬆️ 升至Lv.${unlockedLv + 1}` : '↺ 切回Lv.1'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {progress.activeEmote && (
                    <div
                      data-testid="active-emote-status"
                      className="text-[11px] text-amber-200 font-semibold text-center"
                    >
                      ✨ 当前施展动作：{progress.activeEmote} (Lv.{activeEmoteLevel})
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: 8 Sky Realms Instant Portal Switcher */}
              {dockTab === 'realms' && (
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {(Object.keys(REALMS) as RealmId[]).map((rKey) => {
                    const r = REALMS[rKey];
                    const active = progress.currentRealm === rKey;
                    return (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() => onSelectRealm(rKey)}
                        className={`px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? 'border-amber-300 bg-amber-300/20 text-amber-100'
                            : 'border-slate-800 bg-slate-900 hover:border-slate-600 text-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold truncate">
                          {r.name.split(' · ')[0]}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {r.name.split(' · ')[1]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
