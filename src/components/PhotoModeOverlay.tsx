import React, { useState } from 'react';
import { SKY_EMOTES } from '../game/rules';
import { SavedPhotoRecord } from '../core/StorageService';

export type PhotoFilterType =
  | 'none'
  | 'warm_dusk'
  | 'starlight_cyan'
  | 'dreamy_bloom'
  | 'vintage_sepia';

export type PhotoDofType = 'off' | 'soft' | 'cinematic';

interface PhotoModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  filter: PhotoFilterType;
  onChangeFilter: (f: PhotoFilterType) => void;
  selfieMode: boolean;
  onToggleSelfie: () => void;
  fov: number;
  onChangeFov: (fov: number) => void;
  rollDeg?: number;
  onChangeRollDeg?: (rollDeg: number) => void;
  dofMode?: PhotoDofType;
  onChangeDofMode?: (dof: PhotoDofType) => void;
  savedPhotos?: SavedPhotoRecord[];
  childSafeMode?: boolean;
  onTriggerEmote: (emoteId: string) => void;
  onCaptureSnapshot: (caption?: string) => void;
}

export const PhotoModeOverlay: React.FC<PhotoModeOverlayProps> = ({
  isOpen,
  onClose,
  filter,
  onChangeFilter,
  selfieMode,
  onToggleSelfie,
  fov,
  onChangeFov,
  rollDeg = 0,
  onChangeRollDeg,
  dofMode = 'off',
  onChangeDofMode,
  savedPhotos = [],
  childSafeMode = false,
  onTriggerEmote,
  onCaptureSnapshot,
}) => {
  const [showGrid, setShowGrid] = useState(true);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [captionInput, setCaptionInput] = useState(
    '云海与星光交汇的瞬间 ✦'
  );

  if (!isOpen) return null;

  const filters: { id: PhotoFilterType; label: string }[] = [
    { id: 'none', label: '原色星海' },
    { id: 'warm_dusk', label: '霞谷暖金' },
    { id: 'starlight_cyan', label: '雨林空灵' },
    { id: 'dreamy_bloom', label: '禁阁柔光' },
    { id: 'vintage_sepia', label: '晨岛旧梦' },
  ];

  const dofOptions: { id: PhotoDofType; label: string }[] = [
    { id: 'off', label: '全域清晰' },
    { id: 'soft', label: 'F2.8 浅景深' },
    { id: 'cinematic', label: 'F1.4 电影散景' },
  ];

  return (
    <div
      data-testid="photo-mode-overlay"
      className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-5"
    >
      {/* Optical Depth-of-Field Vignette Ring */}
      {dofMode !== 'off' && (
        <div
          data-testid="photo-dof-vignette"
          className="fixed inset-0 pointer-events-none transition-all duration-300"
          style={{
            boxShadow:
              dofMode === 'cinematic'
                ? 'inset 0 0 130px 42px rgba(2, 6, 23, 0.72)'
                : 'inset 0 0 80px 20px rgba(15, 23, 42, 0.45)',
          }}
        />
      )}

      {/* Rule-of-Thirds Composition Grid Overlay */}
      {showGrid && (
        <div
          data-testid="photo-composition-grid"
          className="fixed inset-8 pointer-events-none border border-amber-200/20 rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-y-0 left-1/3 w-px bg-amber-200/18" />
          <div className="absolute inset-y-0 left-2/3 w-px bg-amber-200/18" />
          <div className="absolute inset-x-0 top-1/3 h-px bg-amber-200/18" />
          <div className="absolute inset-x-0 top-2/3 h-px bg-amber-200/18" />
        </div>
      )}

      {/* Top Viewfinder Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="px-3.5 py-1.5 rounded-2xl bg-slate-950/88 border border-amber-300/35 text-xs text-amber-100 font-semibold flex items-center gap-2.5">
          <span>
            📷 阶段10 自由云海摄影工作台 ·{' '}
            {selfieMode ? '🤳 自拍特写机位' : '🏞️ 远景环绕机位'}
          </span>
          <span className="text-amber-300 font-mono">
            {fov}mm · 倾角 {rollDeg > 0 ? `+${rollDeg}°` : `${rollDeg}°`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="toggle-photo-grid-btn"
            onClick={() => setShowGrid((prev) => !prev)}
            className={`px-3 py-1.5 rounded-2xl border text-xs font-semibold cursor-pointer ${
              showGrid
                ? 'bg-amber-400/20 border-amber-300/60 text-amber-200'
                : 'bg-slate-950/85 border-slate-700 text-slate-300'
            }`}
          >
            {showGrid ? '⊞ 九宫格构图线' : '⊡ 隐藏构图线'}
          </button>

          <button
            type="button"
            data-testid="toggle-photo-album-btn"
            onClick={() => setAlbumOpen((prev) => !prev)}
            className="px-3.5 py-1.5 rounded-2xl bg-slate-950/90 hover:bg-slate-900 border border-sky-400/40 text-xs text-sky-200 font-semibold cursor-pointer"
          >
            🖼️ 云海相册 ({savedPhotos.length})
          </button>

          <button
            type="button"
            data-testid="exit-photo-mode-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded-2xl bg-slate-950/90 hover:bg-slate-900 border border-slate-700 text-xs text-amber-200 font-semibold cursor-pointer"
          >
            退出相机 [Esc]
          </button>
        </div>
      </div>

      {/* Saved Photo Album Drawer */}
      {albumOpen && (
        <div
          data-testid="photo-album-drawer"
          className="relative z-10 mx-auto my-auto w-full max-w-2xl rounded-3xl bg-slate-950/95 border border-sky-400/40 p-5 pointer-events-auto shadow-2xl space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div>
              <div className="text-sm font-bold text-amber-200">
                🖼️ 旅人云海纪念相册 (已收录 {savedPhotos.length} 张留影)
              </div>
              <div className="text-xs text-slate-400">
                每次按下快门自动导出无 UI 高清 PNG 并归档相机参数与留影心情
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAlbumOpen(false)}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
            >
              关闭相册
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {savedPhotos.map((ph, idx) => (
              <div
                key={ph.id}
                data-testid={`saved-photo-item-${idx}`}
                className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-amber-100">
                    {ph.caption}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    📍 {ph.realmName} · {ph.selfieMode ? '🤳 自拍镜头' : '🏞️ 远景镜头'} · 滤镜:{' '}
                    {ph.filter} · 焦距 {ph.fov}mm · 景深 {ph.dofMode}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-sky-300 shrink-0">
                  {ph.createdAt}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Camera Controls Studio */}
      <div className="relative z-10 mx-auto w-full max-w-4xl rounded-3xl bg-slate-950/92 border border-amber-300/35 p-4 pointer-events-auto shadow-2xl space-y-3">
        {/* Row 1: Artistic Filters + Depth-of-Field Modes */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1">光影滤镜：</span>
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                data-testid={`photo-filter-${f.id}`}
                onClick={() => onChangeFilter(f.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${
                  filter === f.id
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {onChangeDofMode && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">光学景深：</span>
              {dofOptions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  data-testid={`photo-dof-${d.id}`}
                  onClick={() => onChangeDofMode(d.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold cursor-pointer ${
                    dofMode === d.id
                      ? 'bg-sky-400 text-slate-950'
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Row 2: Dual Camera Mode + FOV Focal Slider + Roll Tilt Slider */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-testid="toggle-selfie-mode-btn"
              onClick={onToggleSelfie}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                selfieMode
                  ? 'bg-sky-400/20 border-sky-400 text-sky-200'
                  : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            >
              {selfieMode ? '🤳 自拍正视镜头 (已开启)' : '🏞️ 远景跟拍镜头 (点击切自拍)'}
            </button>

            <label className="flex items-center gap-2 text-xs text-slate-300">
              <span>焦距 ({fov}mm)</span>
              <input
                type="range"
                data-testid="photo-fov-slider"
                min={28}
                max={85}
                value={fov}
                onChange={(e) => onChangeFov(Number(e.target.value))}
                className="w-24 accent-amber-400 cursor-pointer"
              />
            </label>

            {onChangeRollDeg && (
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <span>镜头倾角 ({rollDeg}°)</span>
                <input
                  type="range"
                  data-testid="photo-roll-slider"
                  min={-25}
                  max={25}
                  value={rollDeg}
                  onChange={(e) => onChangeRollDeg(Number(e.target.value))}
                  className="w-24 accent-sky-400 cursor-pointer"
                />
              </label>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!childSafeMode ? (
              <input
                type="text"
                data-testid="photo-caption-input"
                value={captionInput}
                onChange={(e) => setCaptionInput(e.target.value)}
                placeholder="输入相片留影心情..."
                className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-100 w-44 focus:outline-none focus:border-amber-400"
              />
            ) : (
              <span className="text-[11px] text-emerald-300 px-2.5 py-1 rounded-xl bg-emerald-950/50 border border-emerald-500/30">
                🛡️ 儿童守护模式预设祝福留影
              </span>
            )}
          </div>
        </div>

        {/* Row 3: Pose Selector + Shutter Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1">摆拍动作：</span>
            {SKY_EMOTES.map((em) => (
              <button
                key={em.id}
                type="button"
                data-testid={`photo-emote-${em.id}`}
                onClick={() => onTriggerEmote(em.id)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-amber-100 cursor-pointer"
              >
                {em.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            data-testid="capture-photo-btn"
            onClick={() => onCaptureSnapshot(captionInput)}
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 font-bold text-xs shadow-lg hover:brightness-105 cursor-pointer"
          >
            📸 快门保存相片并归档 (PNG)
          </button>
        </div>
      </div>
    </div>
  );
};

