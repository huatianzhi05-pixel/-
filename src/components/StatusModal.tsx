import React from 'react';
import { GameProgressState, PlayerPhysicsState, REALMS } from '../game/rules';

interface StatusModalProps {
  gameState: 'paused' | 'gameover';
  progress: GameProgressState;
  physics: PlayerPhysicsState;
  onResume: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
  onOpenWardrobe: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  gameState,
  progress,
  physics,
  onResume,
  onRestart,
  onReturnTitle,
  onOpenWardrobe,
}) => {
  const isVictory = gameState === 'gameover';
  const realmInfo = REALMS[progress.currentRealm];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-6 pointer-events-auto"
      style={{ backgroundColor: 'rgba(9, 13, 24, 0.78)' }}
      role="dialog"
      aria-modal="true"
      aria-label={isVictory ? '神庙祈福升华达成' : '星盘暂停菜单'}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-amber-300/40 p-7 text-center text-slate-100 shadow-2xl"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.96)' }}
      >
        {/* Top Starlight Crest */}
        <svg viewBox="0 0 64 40" className="w-16 h-10 mx-auto mb-2" aria-hidden="true">
          <polygon
            points="32,4 38,16 52,20 38,24 32,36 26,24 12,20 26,16"
            fill="#FDE047"
          />
          <circle cx="16" cy="20" r="2.5" fill="#FDE68A" />
          <circle cx="48" cy="20" r="2.5" fill="#FDE68A" />
        </svg>

        <h2
          className="text-2xl sm:text-3xl font-bold text-amber-200 mb-1"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {isVictory ? '星河重生 · 神庙祈福升华' : '云海小憩 · 旅程暂停'}
        </h2>
        <p className="text-xs text-slate-300 mb-6">
          {isVictory
            ? `你已点亮「${realmInfo.name}」长老神庙祭坛，化作星光与先祖共鸣！`
            : `当前所在王国：${realmInfo.name}`}
        </p>

        {/* 3 Tabular-Nums Mastery Stat Tiles */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
              光之翼星阶
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-amber-300">
              {physics.maxWingWedges} 翼
            </div>
            <div className="text-[11px] font-mono tabular-nums text-slate-400">
              {progress.wingedLights} 小金人
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
              白蜡烛 / 爱心
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-amber-100">
              {progress.candles} / {progress.hearts}
            </div>
            <div className="text-[11px] font-mono tabular-nums text-rose-300">
              {progress.ascendedCandles} 升华红烛
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
              云海翱翔里程
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-sky-300">
              {Math.round(physics.distanceFlown)}m
            </div>
            <div className="text-[11px] font-mono tabular-nums text-slate-400">
              唤醒 {progress.awakenedSpirits.length} 先祖
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {isVictory ? (
            <button
              type="button"
              data-start="true"
              onClick={onRestart}
              className="w-full py-3 rounded-xl text-sm font-bold bg-amber-300 text-slate-950 hover:bg-amber-200 transition-colors cursor-pointer"
            >
              再次翱翔云海 · 开启新周目
            </button>
          ) : (
            <button
              type="button"
              onClick={onResume}
              className="w-full py-3 rounded-xl text-sm font-bold bg-amber-300 text-slate-950 hover:bg-amber-200 transition-colors cursor-pointer"
            >
              继续云海探索 [Esc/P]
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onOpenWardrobe}
              className="py-2.5 rounded-xl text-xs font-semibold border border-amber-300/35 bg-slate-900 text-amber-100 hover:border-amber-200 transition-colors cursor-pointer"
            >
              全皮肤衣橱 (46款)
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="py-2.5 rounded-xl text-xs font-semibold border border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500 transition-colors cursor-pointer"
            >
              返回遇境星盘 [R]
            </button>
          </div>

          <button
            type="button"
            onClick={onReturnTitle}
            className="w-full py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            返回标题画面
          </button>
        </div>
      </div>
    </div>
  );
};
