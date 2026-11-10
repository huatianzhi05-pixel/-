import React, { useState } from 'react';
import {
  CosmeticCategory,
  EquippedLoadout,
  PRESET_OUTFITS,
  getCosmeticsByCategory,
  getCosmeticById,
} from '../game/cosmetics';
import { skyAudio } from '../game/audio';

interface WardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  loadout: EquippedLoadout;
  unlockedCosmeticIds?: string[];
  onChangeLoadout: (next: EquippedLoadout) => void;
}

const CATEGORY_TABS: { id: CosmeticCategory; label: string; count: number }[] = [
  { id: 'cape', label: '斗篷', count: 12 },
  { id: 'hair', label: '发型', count: 10 },
  { id: 'hat', label: '帽子', count: 4 },
  { id: 'mask', label: '面具', count: 8 },
  { id: 'faceAccessory', label: '脸饰', count: 4 },
  { id: 'neckAccessory', label: '颈饰', count: 4 },
  { id: 'pants', label: '外套/裤子', count: 8 },
  { id: 'prop', label: '手持/背饰道具', count: 8 },
];

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  isOpen,
  onClose,
  loadout,
  unlockedCosmeticIds = [],
  onChangeLoadout,
}) => {
  const [activeCategory, setActiveCategory] = useState<CosmeticCategory>('cape');

  if (!isOpen) return null;

  const items = getCosmeticsByCategory(activeCategory);
  const currentEquippedId =
    loadout[activeCategory] || items[0]?.id || 'cape_owl_white';
  const currentItem = getCosmeticById(currentEquippedId);

  const handleSelectItem = (itemId: string) => {
    skyAudio.playCandleIgnite();
    onChangeLoadout({
      ...loadout,
      [activeCategory]: itemId,
    });
  };

  const handleApplyPreset = (presetLoadout: EquippedLoadout) => {
    skyAudio.playWingedLightAbsorb();
    onChangeLoadout({ ...presetLoadout });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-8 pointer-events-auto"
      style={{ backgroundColor: 'rgba(9, 13, 24, 0.78)' }}
      role="dialog"
      aria-modal="true"
      aria-label="星盘全皮肤换装衣橱"
    >
      <div
        className="w-full max-w-5xl rounded-2xl border border-amber-300/35 text-slate-100 flex flex-col max-h-[88vh] overflow-hidden shadow-2xl"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.96)' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-800">
          <div>
            <h2
              className="text-xl md:text-2xl font-bold text-amber-200 tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              遇境星盘 · 8 部位模块化衣橱 (星盘已解锁 {unlockedCosmeticIds.length} 款 · 支持全图鉴自由换装)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              包含斗篷、发型、帽子、面具、脸饰、颈饰、外套/裤子、手持乐器道具 8 大部位，实时保存至本地存档
            </p>
          </div>

          <button
            type="button"
            data-testid="close-wardrobe-modal-btn"
            onClick={onClose}
            aria-label="关闭换装衣橱"
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-300 text-slate-950 hover:bg-amber-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            完成穿戴 [C/Esc]
          </button>
        </div>

        {/* One-Click Iconic Preset Bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-amber-300/90 mr-1">
            一键传奇套装：
          </span>
          {PRESET_OUTFITS.map((preset) => {
            const isMatched =
              loadout.cape === preset.loadout.cape &&
              loadout.hair === preset.loadout.hair &&
              loadout.mask === preset.loadout.mask &&
              loadout.pants === preset.loadout.pants;
            return (
              <button
                key={preset.id}
                type="button"
                data-testid={`wardrobe-preset-${preset.id}`}
                onClick={() => handleApplyPreset(preset.loadout)}
                title={preset.subtitle}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  isMatched
                    ? 'bg-amber-400/20 border-amber-300 text-amber-200 font-semibold'
                    : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-amber-300/50 hover:text-white'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>

        {/* Category Filter Tabs */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-slate-800 overflow-x-auto">
          {CATEGORY_TABS.map((tab) => {
            const active = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`wardrobe-tab-${tab.id}`}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'border-amber-300 text-amber-200'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        {/* Cosmetics Grid & Active Item Inspector */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Skin Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((item) => {
              const selected = item.id === currentEquippedId;
              const isConstellationUnlocked = unlockedCosmeticIds.includes(
                item.id
              );
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`wardrobe-item-${item.id}`}
                  onClick={() => handleSelectItem(item.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    selected
                      ? 'border-amber-300 bg-slate-800/95 shadow-md'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    {/* Color & Material Swatch Preview */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-5 h-5 rounded-full border border-white/30 inline-block"
                        style={{ backgroundColor: item.primaryColor }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 inline-block"
                        style={{ backgroundColor: item.accentColor }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        selected
                          ? 'bg-amber-400 text-slate-950'
                          : isConstellationUnlocked
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-amber-300/80'
                      }`}
                    >
                      {selected
                        ? '已穿戴'
                        : isConstellationUnlocked
                          ? '★ 星盘已拥有'
                          : '点击穿戴'}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-slate-100 truncate">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {item.season}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Skin Spec & Live Loadout Summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs text-amber-300/90 font-medium mb-1">
                {currentItem.season}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {currentItem.name}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {currentItem.description}
              </p>

              <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
                <div className="text-slate-400 font-semibold mb-1.5">
                  当前光之子 8 部位全身搭配 (自动存档)：
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">斗篷</span>
                  <span className="text-amber-200 font-medium">
                    {getCosmeticById(loadout.cape).name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">发型</span>
                  <span className="text-amber-200 font-medium">
                    {getCosmeticById(loadout.hair).name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">帽子</span>
                  <span className="text-amber-200 font-medium">
                    {getCosmeticById(loadout.hat || 'hat_none').name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">面具</span>
                  <span className="text-amber-200 font-medium">
                    {getCosmeticById(loadout.mask).name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">脸饰</span>
                  <span className="text-amber-200 font-medium">
                    {getCosmeticById(loadout.faceAccessory || 'face_star_earrings').name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">颈饰</span>
                  <span className="text-amber-200 font-medium">
                    {getCosmeticById(loadout.neckAccessory || 'neck_gold_choker').name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">外套/裤子</span>
                  <span className="text-amber-200 font-medium">
                    {getCosmeticById(loadout.pants).name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">手持/背饰</span>
                  <span className="text-amber-200 font-medium">
                    {getCosmeticById(loadout.prop).name}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">体型缩放比例</span>
                  <span className="font-mono tabular-nums text-emerald-300">
                    {(getCosmeticById(loadout.mask).scaleModifier ?? 1.0).toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              提示：在「先祖星盘 [P]」解锁的装扮会自动标记为「★ 星盘已拥有」；穿戴「矮人面具(Chibi)」会自动切换为 0.72 倍小矮人身高。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
