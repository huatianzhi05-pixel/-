import React, { useState } from 'react';
import { EquippedLoadout, getCosmeticById } from '../game/cosmetics';
import { REALMS, RealmId } from '../game/rules';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenWardrobe: () => void;
  selectedRealm: RealmId;
  onSelectRealm: (realm: RealmId) => void;
  loadout: EquippedLoadout;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenWardrobe,
  selectedRealm,
  onSelectRealm,
  loadout,
}) => {
  const [showLoadoutDetail, setShowLoadoutDetail] = useState(false);
  const [showControlGuide, setShowControlGuide] = useState(false);

  const cape = getCosmeticById(loadout.cape);
  const hair = getCosmeticById(loadout.hair);
  const mask = getCosmeticById(loadout.mask);
  const currentRealmMeta = REALMS[selectedRealm];

  return (
    <div
      data-testid="title-screen-overlay"
      className="fixed inset-0 z-30 flex flex-col justify-between p-3 sm:p-6 md:p-8 pointer-events-auto select-none overflow-y-auto sky-modal-backdrop"
      style={{
        background:
          'radial-gradient(circle at 50% 42%, rgba(9, 13, 26, 0.0) 0%, rgba(9, 13, 26, 0.34) 100%)',
      }}
    >
      {/* Top Perimeter: Minimal Unboxed Brand Signature + Collapsible Loadout & Wardrobe Action */}
      <div className="flex items-start justify-between gap-3 shrink-0">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-100/90 tracking-wider">
            <span className="font-semibold text-amber-200">微光旅人</span>
            <span aria-hidden="true" className="text-white/30">·</span>
            <span className="text-amber-100/75">云海飞行探索世界</span>
            <button
              type="button"
              data-testid="title-loadout-detail-toggle"
              onClick={() => setShowLoadoutDetail((prev) => !prev)}
              className="sky-btn ml-1 px-2.5 py-0.5 rounded-full border border-amber-200/25 bg-slate-950/50 text-[11px] text-amber-200/90 hover:text-white cursor-pointer"
            >
              {showLoadoutDetail ? '▾ 收起装扮详情' : '✦ 当前装扮概览'}
            </button>
          </div>

          {showLoadoutDetail && (
            <div
              data-testid="title-loadout-detail-drawer"
              className="sky-panel-enter sky-glass-pill px-3.5 py-2 rounded-2xl text-xs text-amber-100/95 flex flex-wrap items-center gap-2 max-w-md"
            >
              <span className="text-amber-300 font-semibold">全图鉴 46 款外观已就绪</span>
              <span aria-hidden="true" className="text-white/25">·</span>
              <span className="text-slate-200">
                当前穿戴：{cape.name} / {hair.name} / {mask.name}
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          data-testid="title-open-wardrobe-btn"
          onClick={onOpenWardrobe}
          className="sky-btn sky-glass-pill px-3.5 py-2 rounded-full text-xs font-semibold text-amber-100 hover:border-amber-300/60 hover:text-white whitespace-nowrap shrink-0 cursor-pointer shadow-md flex items-center gap-1.5"
        >
          <span>🧥 星盘衣橱</span>
          <span className="text-[11px] text-amber-300/90 font-mono">(46)</span>
        </button>
      </div>

      {/* Center-Bottom Ethereal Lockup: Leaves Central 3D Character & Sky Vista Unobstructed */}
      <div className="mt-auto mb-3 sm:mb-5 max-w-2xl mx-auto w-full text-center flex flex-col items-center px-4 py-3 sm:py-5 rounded-3xl sky-panel-enter">
        {/* Bespoke Inline SVG Sky Constellation Emblem */}
        <svg
          viewBox="0 0 220 76"
          className="w-24 sm:w-32 h-9 sm:h-12 mb-1 overflow-visible shrink-0"
          aria-hidden="true"
        >
          <path
            d="M 28 58 Q 110 8 192 58"
            fill="none"
            stroke="#FDE68A"
            strokeWidth="1.25"
            strokeDasharray="4 4"
            opacity="0.75"
          />
          <path
            d="M 52 54 Q 110 18 168 54"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.75"
            opacity="0.9"
          />
          <polygon
            points="110,8 117,30 140,38 117,46 110,68 103,46 80,38 103,30"
            fill="#FDE047"
            stroke="#FFFFFF"
            strokeWidth="1.25"
          />
          <circle cx="110" cy="38" r="4" fill="#FFFFFF" />
          <circle cx="66" cy="35" r="2.2" fill="#FDE68A" />
          <circle cx="154" cy="35" r="2.2" fill="#FDE68A" />
        </svg>

        <h1
          className="text-3xl sm:text-5xl font-bold tracking-widest text-amber-50 mb-1 leading-tight"
          style={{
            fontFamily: 'var(--sky-font-serif)',
            textShadow:
              '0 2px 18px rgba(0, 0, 0, 0.82), 0 0 32px rgba(245, 158, 11, 0.45)',
          }}
        >
          微光旅人 · REA 光遇
        </h1>

        <p
          className="text-xs sm:text-sm text-amber-100/90 font-normal tracking-wide mb-4 max-w-md"
          style={{ textShadow: '0 1px 8px rgba(0, 0, 0, 0.85)' }}
        >
          当前启程：{currentRealmMeta.name} — {currentRealmMeta.subtitle}
        </p>

        {/* Primary & Secondary Action Hierarchy */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-3.5">
          <button
            type="button"
            data-start="true"
            data-testid="start-game-btn"
            onClick={onStartGame}
            className="sky-btn min-h-[44px] px-7 py-2.5 rounded-full text-sm font-bold text-slate-950 bg-amber-300 hover:bg-amber-200 shadow-xl cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2"
            style={{
              boxShadow: '0 0 32px rgba(251, 191, 36, 0.5)',
            }}
          >
            <span>✦ 踏入云海 · 开始探索</span>
          </button>

          <button
            type="button"
            onClick={onOpenWardrobe}
            className="sky-btn sky-glass-pill min-h-[44px] px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-amber-100 hover:border-amber-200/60 hover:text-white cursor-pointer whitespace-nowrap shrink-0"
          >
            更换旅人外观
          </button>
        </div>

        {/* Featherlight Starting Realm Selector Ribbon */}
        <div
          className="sky-glass-pill flex flex-wrap items-center justify-center gap-1 p-1 rounded-full max-w-full"
          role="group"
          aria-label="选择初始探索王国"
        >
          {(Object.keys(REALMS) as RealmId[]).map((rKey) => {
            const r = REALMS[rKey];
            const active = selectedRealm === rKey;
            return (
              <button
                key={rKey}
                type="button"
                onClick={() => onSelectRealm(rKey)}
                className={`sky-btn min-h-[34px] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-amber-300 text-slate-950 font-bold shadow-sm'
                    : 'text-amber-100/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {r.name.split(' · ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Safe Perimeter: On-Demand Multi-Device Control Guide (Hidden by Default) */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        {showControlGuide && (
          <div
            data-testid="title-controls-guide-panel"
            className="sky-panel-enter sky-glass-pill px-4 py-2.5 rounded-2xl text-[11px] sm:text-xs text-amber-100/95 max-w-2xl text-center space-y-1"
          >
            <div>
              <strong className="text-amber-300">⌨️ 键鼠操控：</strong>
              WASD 移动 · Space 跳跃/振翅 · Shift 切换滑翔/疾跑 · X 高空俯冲 · E 点火共鸣 · Q 星音呼唤 · H 沉浸视野
            </div>
            <div>
              <strong className="text-sky-300">🎮 手柄支持：</strong>
              左摇杆移动 · 右摇杆视角 · A 跳跃/振翅 · RB 切换滑翔 · B 俯冲 · X 共鸣互动 · Y 星音呼唤
            </div>
            <div>
              <strong className="text-emerald-300">📱 触屏适配：</strong>
              左下虚拟摇杆（轻推漫步 / 推满疾跑） · 底部轻量化星盘动作坞一键触发飞行、社交与拍照
            </div>
          </div>
        )}

        <button
          type="button"
          data-testid="title-controls-toggle-btn"
          onClick={() => setShowControlGuide((prev) => !prev)}
          className="sky-btn px-3.5 py-1 rounded-full text-[11px] text-amber-100/75 hover:text-amber-100 cursor-pointer flex items-center gap-1.5"
          style={{ textShadow: '0 1px 6px rgba(0, 0, 0, 0.85)' }}
        >
          <span>{showControlGuide ? '▾ 收起操作说明' : '⌨️ 查看键鼠 / 手柄 / 触屏操作指南'}</span>
        </button>
      </div>
    </div>
  );
};


