import React from 'react';
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
  const cape = getCosmeticById(loadout.cape);
  const hair = getCosmeticById(loadout.hair);
  const mask = getCosmeticById(loadout.mask);

  return (
    <div
      className="fixed inset-0 z-30 flex flex-col justify-between p-2.5 sm:p-5 md:p-6 pointer-events-auto select-none overflow-y-auto"
      style={{
        background:
          'radial-gradient(circle at 50% 48%, rgba(9, 13, 26, 0.38) 0%, rgba(9, 13, 26, 0.68) 100%)',
      }}
    >
      {/* Top Bar: Single-line non-wrapping status & Wardrobe CTA */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-xl border border-amber-200/20 text-xs text-amber-100/95 min-w-0 overflow-hidden"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.78)' }}
        >
          <span className="font-bold tracking-wider text-amber-300 whitespace-nowrap shrink-0">
            REA · 光遇引擎
          </span>
          <span aria-hidden="true" className="text-slate-500 shrink-0">·</span>
          <span className="whitespace-nowrap shrink-0 text-amber-100">
            全皮肤图鉴已解锁 (46/46)
          </span>
          <span aria-hidden="true" className="hidden md:inline text-slate-500 shrink-0">·</span>
          <span className="hidden md:inline text-amber-200/85 truncate">
            当前装扮：{cape.name} · {hair.name} · {mask.name}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenWardrobe}
          className="px-3 py-1 rounded-xl text-xs font-semibold text-amber-100 border border-amber-300/45 transition-transform active:scale-95 hover:border-amber-200 whitespace-nowrap shrink-0 cursor-pointer shadow-md"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
        >
          星盘全皮肤衣橱 (46款)
        </button>
      </div>

      {/* Center Hero Lockup with Compact-Viewport Resilience */}
      <div
        className="my-auto max-w-xl mx-auto text-center flex flex-col items-center px-4 py-2 sm:py-4 rounded-3xl"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(9, 13, 26, 0.62) 0%, rgba(9, 13, 26, 0.0) 78%)',
        }}
      >
        {/* Bespoke Inline SVG Sky Constellation Emblem */}
        <svg
          viewBox="0 0 220 84"
          className="w-28 sm:w-36 h-10 sm:h-14 mb-1 overflow-visible shrink-0"
          aria-hidden="true"
        >
          <path
            d="M 25 64 Q 110 8 195 64"
            fill="none"
            stroke="#FDE68A"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.85"
          />
          <path
            d="M 48 60 Q 110 20 172 60"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            opacity="0.95"
          />
          <path
            d="M 94 42 C 68 26, 42 32, 22 46 C 46 46, 68 50, 90 54 Z"
            fill="#FEF3C7"
            opacity="0.92"
          />
          <path
            d="M 126 42 C 152 26, 178 32, 198 46 C 174 46, 152 50, 130 54 Z"
            fill="#FEF3C7"
            opacity="0.92"
          />
          <polygon
            points="110,10 118,34 144,42 118,50 110,74 102,50 76,42 102,34"
            fill="#FDE047"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
          <circle cx="110" cy="42" r="4.5" fill="#FFFFFF" />
          <circle cx="62" cy="38" r="2.5" fill="#FDE68A" />
          <circle cx="158" cy="38" r="2.5" fill="#FDE68A" />
        </svg>

        <h1
          className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-wider text-amber-50 mb-1 leading-tight"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            textShadow: '0 2px 16px rgba(0, 0, 0, 0.85), 0 0 28px rgba(245, 158, 11, 0.55)',
            textWrap: 'balance',
          }}
        >
          微光旅人 · REA 光遇
        </h1>

        <p
          className="text-xs sm:text-sm text-amber-100 font-medium tracking-wide mb-2.5 sm:mb-3.5 max-w-lg"
          style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)' }}
        >
          云海星途与全皮肤探索社交系统 · 振翅掠过八大云端王国，点亮陌生人心火，与先祖共鸣
        </p>

        {/* Starting Realm Selector Strip */}
        <div
          className="flex flex-wrap items-center justify-center gap-1 p-1 rounded-xl border border-amber-200/30 mb-2.5 sm:mb-3.5"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
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
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                    : 'text-amber-100/85 hover:text-white'
                }`}
              >
                {r.name.split(' · ')[0]}
              </button>
            );
          })}
        </div>

        {/* Primary & Secondary Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            data-start="true"
            data-testid="start-game-btn"
            onClick={onStartGame}
            className="px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-amber-300 hover:bg-amber-200 active:scale-95 transition-all shadow-lg cursor-pointer whitespace-nowrap shrink-0"
            style={{
              boxShadow: '0 0 28px rgba(251, 191, 36, 0.55)',
            }}
          >
            踏入云海 · 开始探索
          </button>

          <button
            type="button"
            onClick={onOpenWardrobe}
            className="px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-amber-100 border border-amber-300/45 hover:border-amber-200 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
          >
            更换全图鉴皮肤
          </button>
        </div>
      </div>

      {/* Bottom Safe Margin: Single flat, borderless inline control hint */}
      <div
        className="text-center text-[10px] sm:text-xs text-amber-100/90 tracking-wide whitespace-nowrap overflow-hidden text-ellipsis shrink-0"
        style={{ textShadow: '0 1px 6px rgba(0, 0, 0, 0.9)' }}
      >
        WASD 移动 · Space 振翅 · Shift 滑翔/俯冲 · E 点火 · Q 呼唤 · K 星盘 · G 好友树 · C 衣橱 · V 乐器 · O 拍照模式
      </div>
    </div>
  );
};

