import React, { useState, useEffect } from 'react';
import {
  GAME_CONFIG,
  PersistentSaveData,
  canPlayersChatPure,
  filterSensitiveChat,
  storageService,
} from '../core/StorageService';

interface ConstellationAndSocialModalProps {
  isOpen: boolean;
  initialTab?: 'constellation' | 'social' | 'quests' | 'home' | 'save';
  onClose: () => void;
  saveData: PersistentSaveData;
  sitMode?: string;
  dualActionPartnerId: string | null;
  dualActionMode: 'none' | 'hand_hold' | 'carry' | 'bench_sit';
  onUnlockConstellationNode: (spiritId: string, nodeId: string) => void;
  onStartSpiritMemoryQuest?: (spiritId: string) => void;
  onForgeCandleWax?: (waxAmount: number) => void;
  onEquipCosmeticFromTree?: (cosmeticId: string) => void;
  onImportSaveData?: (rawJson: string) => void;
  onResetSaveData?: () => void;
  onUnlockFriendNode: (peerId: string, nodeId: string) => void;
  onIgnitePeer?: (peerId: string) => void;
  onSendFriendRequest?: (peerId: string, customNickname?: string) => void;
  onRenameFriend?: (peerId: string, newNickname: string) => void;
  onTeleportToFriend?: (peerId: string) => void;
  onExecuteDualAction?: (
    peerId: string,
    actionType: 'hand_hold' | 'high_five' | 'hug' | 'carry' | 'release'
  ) => void;
  onToggleBlockPeer?: (peerId: string) => void;
  onReportPeer?: (peerId: string, reason: string) => void;
  onSetDualAction: (
    peerId: string | null,
    mode: 'none' | 'hand_hold' | 'carry' | 'bench_sit'
  ) => void;
  onSendFriendChat: (peerId: string, text: string) => void;
  onGiftHeart: (peerId: string) => void;
  onClaimQuest: (questId: string) => void;
  onProgressDailyQuest?: (questIdOrType: string) => void;
  onCompleteSeasonStoryAct?: (actId?: string) => void;
  onRotateTravelingSpirit?: () => void;
  onSettleSeasonEndConversion?: () => void;
  onRerollQuests: () => void;
  onSwitchSeason: (seasonId: string) => void;
  onTriggerShardEvent: (shardType: 'black' | 'red' | null) => void;
  onPlaceFurniture: (furnitureId: string) => void;
  onRotateOrRemoveFurniture?: (
    instanceId: string,
    action: 'rotate' | 'remove'
  ) => void;
  onApplyPresetHomeLayout?: (presetId: string) => void;
  onClearFurniture: () => void;
  onToggleChildSafeMode: () => void;
  onUpdateAccessibilityAndPerf?: (patch: {
    qualityTier?: 'auto' | 'low' | 'medium' | 'high';
    highContrastMode?: boolean;
    reducedMotionShake?: boolean;
    locale?: 'zh' | 'en';
  }) => void;
  onAdvanceOnboardingTutorial?: (
    action: 'move' | 'ignite' | 'fly' | 'complete_all' | 'reset'
  ) => void;
}

export const ConstellationAndSocialModal: React.FC<
  ConstellationAndSocialModalProps
> = ({
  isOpen,
  initialTab = 'constellation',
  onClose,
  saveData,
  sitMode = 'stand',
  dualActionPartnerId,
  dualActionMode,
  onUnlockConstellationNode,
  onStartSpiritMemoryQuest,
  onForgeCandleWax,
  onEquipCosmeticFromTree,
  onImportSaveData,
  onResetSaveData,
  onUnlockFriendNode,
  onIgnitePeer,
  onSendFriendRequest,
  onRenameFriend,
  onTeleportToFriend,
  onExecuteDualAction,
  onToggleBlockPeer,
  onReportPeer,
  onSetDualAction,
  onSendFriendChat,
  onGiftHeart,
  onClaimQuest,
  onProgressDailyQuest,
  onCompleteSeasonStoryAct,
  onRotateTravelingSpirit,
  onSettleSeasonEndConversion,
  onRerollQuests,
  onSwitchSeason,
  onTriggerShardEvent,
  onPlaceFurniture,
  onRotateOrRemoveFurniture,
  onApplyPresetHomeLayout,
  onClearFurniture,
  onToggleChildSafeMode,
  onUpdateAccessibilityAndPerf,
  onAdvanceOnboardingTutorial,
}) => {
  const [activeTab, setActiveTab] = useState<
    'constellation' | 'social' | 'quests' | 'home' | 'save'
  >(initialTab);
  const [selectedSpiritId, setSelectedSpiritId] = useState<string>(
    GAME_CONFIG.constellations[1]?.spiritId ||
      GAME_CONFIG.constellations[0].spiritId
  );
  const [selectedPeerId, setSelectedPeerId] = useState<string>('bot_traveller_1');
  const [chatInput, setChatInput] = useState('');
  const [nicknameDraft, setNicknameDraft] = useState('');
  const [reportReason, setReportReason] = useState<string>('言语不当');
  const [saveJsonText, setSaveJsonText] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const currentSpirit =
    GAME_CONFIG.constellations.find((s) => s.spiritId === selectedSpiritId) ||
    GAME_CONFIG.constellations[0];

  const isSpiritRelived = saveData.relivedSpiritIds.includes(
    currentSpirit.spiritId
  );
  const unlockedCountForSpirit = currentSpirit.nodes.filter((n) =>
    saveData.unlockedConstellationNodes.includes(n.id)
  ).length;
  const spiritProgressPct = Math.round(
    (unlockedCountForSpirit / Math.max(1, currentSpirit.nodes.length)) * 100
  );

  const friendsList = Object.values(saveData.friends);
  const currentPeer =
    saveData.friends[selectedPeerId] || friendsList[0] || null;

  const costBadge = (type: string, amount: number) => {
    if (type === 'free' || amount === 0) return '免费共鸣';
    if (type === 'candles') return `${amount} 白蜡烛`;
    if (type === 'hearts') return `${amount} 爱心`;
    if (type === 'seasonCandles') return `${amount} 季蜡`;
    if (type === 'ascendedCandles') return `${amount} 升华红烛`;
    return `${amount}`;
  };

  const spiritTypeBadge = (type: string) => {
    switch (type) {
      case 'seasonal':
        return { label: '季节先祖', cls: 'bg-sky-500/20 text-sky-300 border-sky-400/40' };
      case 'season_guide':
        return { label: '季节向导', cls: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40' };
      case 'returning':
        return { label: '回归先祖', cls: 'bg-purple-500/20 text-purple-300 border-purple-400/40' };
      case 'event':
        return { label: '活动先祖', cls: 'bg-pink-500/20 text-pink-300 border-pink-400/40' };
      default:
        return { label: '常驻先祖', cls: 'bg-amber-500/20 text-amber-300 border-amber-400/40' };
    }
  };

  const nodeCategoryLabel = (node: any) => {
    switch (node.category) {
      case 'emote':
        return `先祖动作升级 (Lv.${node.level || 1})`;
      case 'wing_buff':
        return '永久光之翼节点 (+1 永久小金人)';
      case 'heart':
        return '先祖爱心馈赠 (+1 先祖爱心)';
      case 'music_sheet':
        return '典藏乐谱 (解锁后加入云端乐器曲库)';
      case 'call_sound':
        return '特殊星音呼唤音色 (遥鲲/星钟共鸣)';
      default:
        return '衣橱永久装扮 (解锁后自动进入衣橱)';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="先祖星盘、社交好友树与每日任务中心"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 pointer-events-auto"
    >
      <div className="w-full max-w-5xl max-h-[88vh] flex flex-col rounded-3xl bg-slate-900 border border-amber-300/30 shadow-2xl overflow-hidden text-amber-50">
        {/* Top Header & Stage 4 Currency Economy Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold tracking-wider text-amber-200">
              微光星盘中枢 · 先祖星座 / 蜡烛爱心经济 / 社交阶梯 / 存档管理
            </h2>
            <p className="text-xs text-slate-400">
              阶段4 数据驱动：今日已合成白烛 {saveData.dailyCandlesForged}/
              {GAME_CONFIG.economy.dailyCandleCap} · 今日爱心{' '}
              {saveData.dailyHeartsReceived}/{GAME_CONFIG.economy.dailyHeartCap}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <span
              data-testid="modal-candles-count"
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-100"
              title="白蜡烛与当前烛火池进度"
            >
              🕯️ 白烛 {saveData.candles} ({saveData.candleWax}/100)
            </span>
            {onForgeCandleWax && (
              <button
                type="button"
                data-testid="forge-candle-btn"
                onClick={() => onForgeCandleWax(100)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-sans font-semibold cursor-pointer"
                title="收集 100 滴烛火并立即凝结 1 根白蜡烛（受每日 20 根上限约束）"
              >
                + 凝结白烛
              </button>
            )}
            <span
              data-testid="modal-hearts-count"
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-rose-300"
            >
              ❤️ 爱心 {saveData.hearts}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-sky-300">
              💠 季蜡 {saveData.seasonCandles}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-red-400">
              ✦ 红烛 {saveData.ascendedCandles}
            </span>
            <button
              type="button"
              data-testid="close-constellation-modal-btn"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans font-semibold cursor-pointer"
            >
              返回云海 [Esc]
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-900/95 border-b border-slate-800 overflow-x-auto">
          {[
            { id: 'constellation', label: '✦ 先祖星座解锁树' },
            { id: 'social', label: '🤝 社交阶梯与好友树' },
            { id: 'quests', label: '📜 每日任务与季节/红石' },
            { id: 'home', label: '🏡 小屋工坊家具布置' },
            { id: 'save', label: '💾 存档与数据管理' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-testid={`hub-tab-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'save') {
                  setSaveJsonText(storageService.exportSaveJson(saveData));
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: SPIRIT CONSTELLATION TREE */}
          {activeTab === 'constellation' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-2">
                  选择王国先祖星盘 ({GAME_CONFIG.constellations.length} 位先祖)
                </div>
                {GAME_CONFIG.constellations.map((spirit) => {
                  const active = spirit.spiritId === currentSpirit.spiritId;
                  const relived = saveData.relivedSpiritIds.includes(
                    spirit.spiritId
                  );
                  const badge = spiritTypeBadge(spirit.type);
                  return (
                    <button
                      key={spirit.spiritId}
                      type="button"
                      data-testid={`select-spirit-${spirit.spiritId}`}
                      onClick={() => setSelectedSpiritId(spirit.spiritId)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        active
                          ? 'bg-amber-400/15 border-amber-300 text-amber-100'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold truncate">
                          {spirit.spiritName}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border shrink-0 ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {spirit.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span
                          className={
                            relived ? 'text-emerald-300' : 'text-amber-300/90'
                          }
                        >
                          {relived ? '✓ 已追忆入驻星盘' : '🕯️ 待重温先祖记忆'}
                        </span>
                        <span className="font-mono text-slate-400">
                          {
                            spirit.nodes.filter((n) =>
                              saveData.unlockedConstellationNodes.includes(n.id)
                            ).length
                          }
                          /{spirit.nodes.length} 节点
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="md:col-span-8 bg-slate-950/70 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-amber-200">
                          {currentSpirit.spiritName} · 星座解锁树
                        </h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
                          完成度 {spiritProgressPct}% ({unlockedCountForSpirit}/
                          {currentSpirit.nodes.length})
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        按前置依赖依次点亮星辰节点，解锁动作（Lv.1–5）、先祖爱心、装扮、乐谱与永久翼阶
                      </p>
                    </div>

                    {onStartSpiritMemoryQuest &&
                      (currentSpirit.spiritId === 'spirit_prairie_butterfly' ||
                        currentSpirit.spiritId === 'spirit_prairie_cheer' ||
                        currentSpirit.spiritId === 'spirit_isle_pointing') && (
                        <button
                          type="button"
                          data-testid="start-spirit-memory-btn"
                          onClick={() => {
                            onStartSpiritMemoryQuest(currentSpirit.spiritId);
                            onClose();
                          }}
                          className="px-3.5 py-2 rounded-xl bg-sky-500/25 hover:bg-sky-500/40 border border-sky-400/50 text-sky-200 text-xs font-bold cursor-pointer"
                        >
                          {isSpiritRelived
                            ? '🌟 再次重温先祖记忆 (3幕互动)'
                            : '🌟 立即开启先祖记忆流程 (3幕互动)'}
                        </button>
                      )}
                  </div>

                  <div className="space-y-3">
                    {currentSpirit.nodes.map((node, idx) => {
                      const isUnlocked =
                        saveData.unlockedConstellationNodes.includes(node.id);
                      const prereqMet =
                        !node.prerequisiteId ||
                        saveData.unlockedConstellationNodes.includes(
                          node.prerequisiteId
                        );
                      const prereqNode = currentSpirit.nodes.find(
                        (n) => n.id === node.prerequisiteId
                      );

                      return (
                        <div
                          key={node.id}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                            isUnlocked
                              ? 'bg-emerald-950/30 border-emerald-500/40'
                              : prereqMet
                                ? 'bg-slate-900 border-amber-400/40'
                                : 'bg-slate-950/50 border-slate-800 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-mono ${
                                isUnlocked
                                  ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                                  : 'bg-slate-800 border-amber-300/40 text-amber-200'
                              }`}
                            >
                              {isUnlocked ? '★' : idx + 1}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-amber-100">
                                {node.name}
                              </div>
                              <div className="text-xs text-slate-400">
                                {nodeCategoryLabel(node)}
                                {prereqNode && !isUnlocked
                                  ? ` · 前置：${prereqNode.name}`
                                  : ''}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isUnlocked &&
                              node.category === 'cosmetic' &&
                              onEquipCosmeticFromTree && (
                                <button
                                  type="button"
                                  data-testid={`equip-from-tree-${node.targetId}`}
                                  onClick={() =>
                                    onEquipCosmeticFromTree(node.targetId)
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/35 border border-amber-300/40 text-amber-200 text-xs font-semibold cursor-pointer"
                                >
                                  👕 立即穿戴
                                </button>
                              )}

                            {isUnlocked ? (
                              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                                ✓ 已点亮解锁
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={!prereqMet}
                                data-testid={`unlock-node-${node.id}`}
                                onClick={() =>
                                  onUnlockConstellationNode(
                                    currentSpirit.spiritId,
                                    node.id
                                  )
                                }
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                  prereqMet
                                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                解锁 ({costBadge(node.costType, node.costAmount)})
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    提示：解锁的装扮会自动进入「衣橱换装 [C]」，动作升级后可在底部「动作」栏施展高阶特效。
                  </span>
                  <span className="text-amber-300/90 font-mono">
                    已解锁节点总数：{saveData.unlockedConstellationNodes.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL LADDER & FRIEND TREE (STAGE 7 FULL PIPELINE) */}
          {activeTab === 'social' && currentPeer && (() => {
            const blockedIds = saveData.blockedPeerIds || [];
            const isBlocked = blockedIds.includes(currentPeer.peerId);
            const chatPermission = canPlayersChatPure(
              saveData,
              currentPeer.peerId,
              sitMode
            );
            const reportReasons: string[] = (GAME_CONFIG.social as any)
              ?.reportReasons || [
              '言语不当',
              '恶意骚扰',
              '疑似外挂作弊',
              '其他违规行为',
            ];

            return (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Column: Friend & Instance Traveler List */}
                <div className="md:col-span-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-300/80">
                      好友与同房旅人列表 ({friendsList.length})
                    </span>
                    <button
                      type="button"
                      data-testid="toggle-child-safe-btn"
                      onClick={onToggleChildSafeMode}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border cursor-pointer ${
                        saveData.childSafeMode
                          ? 'bg-emerald-950/60 border-emerald-400/50 text-emerald-200'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {saveData.childSafeMode
                        ? '🛡️ 儿童守护：开启'
                        : '🛡️ 儿童守护：关闭'}
                    </button>
                  </div>

                  {friendsList.map((peer) => {
                    const selected = peer.peerId === currentPeer.peerId;
                    const peerBlocked = blockedIds.includes(peer.peerId);
                    return (
                      <button
                        key={peer.peerId}
                        type="button"
                        data-testid={`select-peer-${peer.peerId}`}
                        onClick={() => {
                          setSelectedPeerId(peer.peerId);
                          setNicknameDraft(peer.nickname);
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          selected
                            ? 'bg-amber-400/15 border-amber-300 text-amber-100'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold truncate">
                            {peer.ignited
                              ? peer.nickname
                              : '未点亮的陌生旅人 (剪影)'}
                          </span>
                          <span
                            data-testid={`peer-badge-${peer.peerId}`}
                            className={`text-[10px] px-2 py-0.5 rounded shrink-0 ${
                              peerBlocked
                                ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                                : peer.isFriend
                                  ? 'bg-amber-400/20 text-amber-300'
                                  : peer.ignited
                                    ? 'bg-sky-400/20 text-sky-300'
                                    : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {peerBlocked
                              ? '🚫 已屏蔽'
                              : peer.isFriend
                                ? '★ 星盘挚友'
                                : peer.ignited
                                  ? '🕯️ 已点亮旅人'
                                  : '👤 陌生剪影'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {peerBlocked
                            ? '已屏蔽该旅人：隐藏3D身影与气泡，断开双人互动'
                            : peer.ignited
                              ? `已解锁 ${peer.unlockedNodes.length}/6 阶好友树 · ${
                                  peer.isFriend ? '支持星盘跃迁传送' : '可赠予1白烛结为好友'
                                }`
                              : '遵循光遇社交法则：陌生人呈深灰剪影，请先递出烛火点亮'}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Right Column: Progressive Social Pipeline */}
                <div className="md:col-span-8 space-y-4">
                  {/* Step 1-3: Ignite -> Friend Request -> Nickname & Teleport */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-amber-200 flex items-center gap-2">
                          <span>
                            当前选中：「
                            {currentPeer.ignited
                              ? currentPeer.nickname
                              : '未点亮的陌生旅人 (剪影)'}
                            」
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                            ID: {currentPeer.peerId}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          阶段7 渐进式社交链路：点亮心火显露真容 → 1白烛缔结好友并备注昵称 → 星盘传送与四类双人互动
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {!currentPeer.ignited && (
                          <button
                            type="button"
                            data-testid="social-ignite-btn"
                            onClick={() => {
                              if (onIgnitePeer) {
                                onIgnitePeer(currentPeer.peerId);
                              } else {
                                onUnlockFriendNode(currentPeer.peerId, 'ft_ignite');
                              }
                            }}
                            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer shadow-sm"
                          >
                            🕯️ 递出烛火点亮旅人 (免费显露真容)
                          </button>
                        )}

                        {currentPeer.ignited && !currentPeer.isFriend && (
                          <button
                            type="button"
                            data-testid="social-friend-request-btn"
                            onClick={() => {
                              if (onSendFriendRequest) {
                                onSendFriendRequest(
                                  currentPeer.peerId,
                                  nicknameDraft.trim() || undefined
                                );
                              } else {
                                onUnlockFriendNode(currentPeer.peerId, 'ft_friend');
                              }
                            }}
                            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer shadow-sm"
                          >
                            🤝 赠予1白烛缔结好友 (好友请求)
                          </button>
                        )}

                        {currentPeer.isFriend && onTeleportToFriend && (
                          <button
                            type="button"
                            data-testid="social-teleport-friend-btn"
                            onClick={() => onTeleportToFriend(currentPeer.peerId)}
                            className="px-3.5 py-1.5 rounded-xl bg-sky-500/25 hover:bg-sky-500/40 border border-sky-400/50 text-sky-200 text-xs font-bold cursor-pointer"
                          >
                            🌠 传送至好友身边 (星盘跃迁)
                          </button>
                        )}

                        {currentPeer.isFriend && (
                          <button
                            type="button"
                            data-testid="gift-heart-btn"
                            onClick={() => onGiftHeart(currentPeer.peerId)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-xs font-semibold cursor-pointer"
                          >
                            🎁 互赠爱心 (3白烛)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Friend Nickname Customization Bar */}
                    {currentPeer.ignited && (
                      <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-400">
                          好友专属备注昵称：
                        </span>
                        <input
                          type="text"
                          data-testid="social-nickname-input"
                          value={nicknameDraft}
                          onChange={(e) => setNicknameDraft(e.target.value)}
                          placeholder={currentPeer.nickname}
                          maxLength={16}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                        />
                        {currentPeer.isFriend && onRenameFriend && (
                          <button
                            type="button"
                            data-testid="social-rename-btn"
                            onClick={() => {
                              if (nicknameDraft.trim()) {
                                onRenameFriend(currentPeer.peerId, nicknameDraft.trim());
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-300/30 text-amber-200 text-xs font-semibold cursor-pointer"
                          >
                            ✏️ 保存备注昵称
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Step 4: 4 Dual Actions (Hand-hold, High-five, Hug, Piggyback Carry) */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-300/80">
                        双人亲密协作动作 (牵手 / 击掌 / 拥抱 / 背抱)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        解锁对应好友树阶梯后即可随时发起
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* 1. Hand-Hold */}
                      <button
                        type="button"
                        disabled={!currentPeer.unlockedNodes.includes('ft_friend') || isBlocked}
                        data-testid="toggle-hand-hold-btn"
                        onClick={() => {
                          if (onExecuteDualAction) {
                            onExecuteDualAction(
                              currentPeer.peerId,
                              dualActionMode === 'hand_hold' &&
                                dualActionPartnerId === currentPeer.peerId
                                ? 'release'
                                : 'hand_hold'
                            );
                          } else {
                            onSetDualAction(
                              dualActionMode === 'hand_hold' &&
                                dualActionPartnerId === currentPeer.peerId
                                ? null
                                : currentPeer.peerId,
                              dualActionMode === 'hand_hold' &&
                                dualActionPartnerId === currentPeer.peerId
                                ? 'none'
                                : 'hand_hold'
                            );
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          !currentPeer.unlockedNodes.includes('ft_friend') || isBlocked
                            ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                            : dualActionMode === 'hand_hold' &&
                                dualActionPartnerId === currentPeer.peerId
                              ? 'bg-emerald-400 text-slate-950 cursor-pointer'
                              : 'bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-300/30 cursor-pointer'
                        }`}
                      >
                        {dualActionMode === 'hand_hold' &&
                        dualActionPartnerId === currentPeer.peerId
                          ? '✓ 正在牵手共飞 (点击松手)'
                          : '🤝 牵手同步飞行 (Lv.1)'}
                      </button>

                      {/* 2. High-Five */}
                      <button
                        type="button"
                        disabled={!currentPeer.unlockedNodes.includes('ft_highfive') || isBlocked}
                        data-testid="social-highfive-btn"
                        onClick={() =>
                          onExecuteDualAction &&
                          onExecuteDualAction(currentPeer.peerId, 'high_five')
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          !currentPeer.unlockedNodes.includes('ft_highfive') || isBlocked
                            ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                            : 'bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 border border-amber-400/40 cursor-pointer'
                        }`}
                      >
                        🙌 星光击掌 (+1.5翼能 · Lv.2)
                      </button>

                      {/* 3. Warm Hug */}
                      <button
                        type="button"
                        disabled={!currentPeer.unlockedNodes.includes('ft_hug') || isBlocked}
                        data-testid="social-hug-btn"
                        onClick={() =>
                          onExecuteDualAction &&
                          onExecuteDualAction(currentPeer.peerId, 'hug')
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          !currentPeer.unlockedNodes.includes('ft_hug') || isBlocked
                            ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                            : 'bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 border border-rose-400/50 cursor-pointer'
                        }`}
                      >
                        🫂 温暖拥抱 (瞬间满能 · Lv.4)
                      </button>

                      {/* 4. Piggyback Carry */}
                      <button
                        type="button"
                        disabled={!currentPeer.unlockedNodes.includes('ft_carry') || isBlocked}
                        data-testid="social-carry-btn"
                        onClick={() => {
                          if (onExecuteDualAction) {
                            onExecuteDualAction(
                              currentPeer.peerId,
                              dualActionMode === 'carry' &&
                                dualActionPartnerId === currentPeer.peerId
                                ? 'release'
                                : 'carry'
                            );
                          } else {
                            onSetDualAction(
                              dualActionMode === 'carry' &&
                                dualActionPartnerId === currentPeer.peerId
                                ? null
                                : currentPeer.peerId,
                              dualActionMode === 'carry' &&
                                dualActionPartnerId === currentPeer.peerId
                                ? 'none'
                                : 'carry'
                            );
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          !currentPeer.unlockedNodes.includes('ft_carry') || isBlocked
                            ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                            : dualActionMode === 'carry' &&
                                dualActionPartnerId === currentPeer.peerId
                              ? 'bg-emerald-400 text-slate-950 cursor-pointer'
                              : 'bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-300/30 cursor-pointer'
                        }`}
                      >
                        {dualActionMode === 'carry' &&
                        dualActionPartnerId === currentPeer.peerId
                          ? '✓ 正在背抱翱翔 (点击放下)'
                          : '🎒 背抱翱翔 (Lv.5)'}
                      </button>
                    </div>
                  </div>

                  {/* Friend Tree Nodes (6-Tier Ladder) */}
                  <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-4 space-y-2.5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-1">
                      好友树成长阶梯 (6 阶节点 · 点亮 → 好友 → 击掌 → 密语 → 拥抱 → 背抱)
                    </div>
                    {GAME_CONFIG.social.friendTreeNodes.map((fNode) => {
                      const unlocked = currentPeer.unlockedNodes.includes(fNode.id);
                      const prereqMet =
                        !fNode.prerequisiteId ||
                        currentPeer.unlockedNodes.includes(fNode.prerequisiteId);

                      return (
                        <div
                          key={fNode.id}
                          className={`flex items-center justify-between p-3 rounded-xl border ${
                            unlocked
                              ? 'bg-emerald-950/30 border-emerald-500/40'
                              : prereqMet
                                ? 'bg-slate-900 border-amber-400/40'
                                : 'bg-slate-950/50 border-slate-800 opacity-60'
                          }`}
                        >
                          <div>
                            <div className="text-sm font-semibold text-amber-100">
                              Lv.{fNode.level} · {fNode.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {fNode.description}
                            </div>
                          </div>

                          {unlocked ? (
                            <span className="text-xs text-emerald-300 font-semibold">
                              ✓ 已解锁
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={!prereqMet}
                              data-testid={`unlock-friend-${fNode.id}`}
                              onClick={() =>
                                onUnlockFriendNode(currentPeer.peerId, fNode.id)
                              }
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                                prereqMet
                                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {costBadge(fNode.costType, fNode.costAmount)}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Step 5: Friend Chat & Bench Chat Box (with Sensitive Word Filter) */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-amber-200">
                        💬 心音密语与长椅交谈 (带敏感词过滤)
                      </span>
                      <span
                        data-testid="social-chat-channel-badge"
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300"
                      >
                        {chatPermission.allowed
                          ? chatPermission.channel === 'bench_chat'
                            ? '🪑 长椅烛火交谈已就绪'
                            : '✦ 好友心音密语已就绪'
                          : '🔒 需解锁 Lv.3 密语或同坐双人石椅'}
                      </span>
                    </div>

                    {!chatPermission.allowed ? (
                      <p className="text-xs text-slate-400">
                        {chatPermission.reason}
                      </p>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const filtered = filterSensitiveChat(chatInput);
                          if (!filtered) return;
                          onSendFriendChat(currentPeer.peerId, filtered);
                          setChatInput('');
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          data-testid="social-chat-input"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={`向 ${
                            currentPeer.ignited ? currentPeer.nickname : '同桌旅人'
                          } 发送头顶星语气泡...`}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="submit"
                          data-testid="social-chat-send-btn"
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer"
                        >
                          发送星语
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Step 6: Block & Report Safety Panel */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-rose-300">
                        🛡️ 社交边界守护 · 屏蔽与违规举报
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        屏蔽后立即隐藏对方身影与聊天气泡；举报将自动屏蔽并归档记录 (累计已举报{' '}
                        <span data-testid="social-report-count" className="font-mono text-amber-200">
                          {(saveData.reportedPeers || []).length}
                        </span>{' '}
                        次)
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {onToggleBlockPeer && (
                        <button
                          type="button"
                          data-testid="social-block-btn"
                          onClick={() => onToggleBlockPeer(currentPeer.peerId)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border ${
                            isBlocked
                              ? 'bg-emerald-950/70 border-emerald-400/50 text-emerald-200'
                              : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
                          }`}
                        >
                          {isBlocked ? '✓ 解除屏蔽该旅人' : '🚫 屏蔽该旅人'}
                        </button>
                      )}

                      {onReportPeer && (
                        <div className="flex items-center gap-1.5">
                          <select
                            data-testid="social-report-reason-select"
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                          >
                            {reportReasons.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            data-testid="social-report-btn"
                            onClick={() =>
                              onReportPeer(currentPeer.peerId, reportReason)
                            }
                            className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-semibold cursor-pointer"
                          >
                            ⚠️ 提交举报
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 3: DAILY QUESTS, SEASONS & SHARD ERUPTIONS */}
          {activeTab === 'quests' && (() => {
            const seasonStoryQuests =
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
            const completedActs = saveData.completedSeasonQuestIds || [];
            const tsPool =
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
            const activeTs =
              tsPool[(saveData.activeTravelingSpiritIndex ?? 0) % Math.max(1, tsPool.length)];

            return (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7 space-y-4">
                  {/* Daily Quests Card */}
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-amber-200">
                          今日向导先祖任务 (每日 4 项 · 零肝度治愈循环)
                        </h3>
                        <p className="text-xs text-slate-400">
                          最后重置日期：{saveData.lastDailyResetDate} (UTC)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {onProgressDailyQuest && (
                          <button
                            type="button"
                            data-testid="complete-all-daily-quests-btn"
                            onClick={() => onProgressDailyQuest('ALL')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-400/50 text-emerald-200 text-xs font-bold cursor-pointer"
                          >
                            ⚡ 一键达成全部任务
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={saveData.dailyRerollsUsed >= 1}
                          data-testid="reroll-daily-quests-btn"
                          onClick={onRerollQuests}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                            saveData.dailyRerollsUsed < 1
                              ? 'bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-300/30 cursor-pointer'
                              : 'bg-slate-900 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          ↻ 更换今日任务 ({1 - saveData.dailyRerollsUsed}/1)
                        </button>
                      </div>
                    </div>

                    {saveData.dailyQuests.map((q) => {
                      const done = q.currentCount >= q.targetCount;
                      return (
                        <div
                          key={q.id}
                          className="p-3.5 rounded-2xl bg-slate-950/75 border border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-sm font-semibold text-amber-100">
                              {q.title}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              进度：{q.currentCount} / {q.targetCount} · 奖励：+
                              {q.rewardAmount}{' '}
                              {q.rewardType === 'seasonCandles'
                                ? '季节蜡烛'
                                : '先祖爱心'}
                            </div>
                          </div>

                          {q.claimed ? (
                            <span
                              data-testid={`quest-claimed-${q.id}`}
                              className="text-xs text-emerald-300 font-semibold"
                            >
                              ✓ 已领取
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {!done && onProgressDailyQuest && (
                                <button
                                  type="button"
                                  data-testid={`progress-quest-${q.id}`}
                                  onClick={() => onProgressDailyQuest(q.id)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-sky-400/30 text-sky-200 text-xs font-semibold cursor-pointer"
                                >
                                  +1 推进
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={!done}
                                data-testid={`claim-quest-${q.id}`}
                                onClick={() => onClaimQuest(q.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                                  done
                                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                {done ? '领取奖励' : '进行中'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Stage 9: 4-Act Seasonal Guide Storyline & Ultimate Gift */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-sky-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-sky-300">
                          🌟 阶段9 · 季节向导 4 幕剧情任务链 & 毕业礼
                        </div>
                        <div className="text-[11px] text-slate-400">
                          已完成 {completedActs.length} / {seasonStoryQuests.length} 幕 · 通关第 4 幕解锁毕业礼「欧若拉流光透明神翼」
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {seasonStoryQuests.map((act) => {
                        const isDone = completedActs.includes(act.id);
                        return (
                          <div
                            key={act.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                              isDone
                                ? 'bg-emerald-950/30 border-emerald-500/40'
                                : 'bg-slate-900/90 border-slate-800'
                            }`}
                          >
                            <div>
                              <div className="text-xs font-bold text-amber-100">
                                {act.title}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {act.description}
                              </div>
                              <div className="text-[10px] text-amber-300/90 mt-0.5 font-mono">
                                奖励：+{act.rewardHearts} 爱心 · +{act.rewardSeasonCandles} 季节蜡烛
                                {act.rewardAscendedCandles > 0
                                  ? ` · +${act.rewardAscendedCandles} 升华红烛`
                                  : ''}
                                {act.unlockCosmeticId ? ' · 🏆 毕业礼神翼' : ''}
                              </div>
                            </div>

                            {isDone ? (
                              <span
                                data-testid={`season-act-done-${act.id}`}
                                className="shrink-0 text-xs text-emerald-300 font-semibold"
                              >
                                ✓ 已通关
                              </span>
                            ) : (
                              <button
                                type="button"
                                data-testid={`season-quest-btn-${act.id}`}
                                onClick={() =>
                                  onCompleteSeasonStoryAct &&
                                  onCompleteSeasonStoryAct(act.id)
                                }
                                className="shrink-0 px-3 py-1.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-bold cursor-pointer"
                              >
                                完成本幕剧情
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 space-y-4">
                  {/* Active Season Switcher */}
                  <div className="p-4 rounded-2xl bg-slate-950/75 border border-slate-800 space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                      季节与节日活动实时切换 (JSON 数据驱动)
                    </div>
                    {GAME_CONFIG.seasonsAndEvents.seasons.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        data-testid={`switch-season-${s.id}`}
                        onClick={() => onSwitchSeason(s.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          saveData.activeSeasonId === s.id
                            ? 'bg-amber-400/15 border-amber-300 text-amber-100'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{s.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {s.description}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Stage 9: Traveling Spirit Rotation & Season-End 1:1 Candle Conversion */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-400/35 space-y-2.5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                      ⏳ 限时复刻旅行先祖 & 季末季蜡 1:1 结算
                    </div>
                    {activeTs && (
                      <div
                        data-testid="active-traveling-spirit-card"
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1"
                      >
                        <div className="text-xs font-bold text-amber-100">
                          {activeTs.name}
                        </div>
                        <div className="text-[11px] text-sky-300">
                          所属季节：{activeTs.seasonOrigin} · {activeTs.stayWindowLabel}
                        </div>
                        <div className="text-[11px] text-slate-300">
                          限定兑换物：<strong className="text-amber-200">{activeTs.featuredCosmeticName}</strong> + 永久光翼节点
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {onRotateTravelingSpirit && (
                        <button
                          type="button"
                          data-testid="rotate-traveling-spirit-btn"
                          onClick={onRotateTravelingSpirit}
                          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer"
                        >
                          ⏳ 轮换复刻先祖并解锁限定装扮
                        </button>
                      )}
                      {onSettleSeasonEndConversion && (
                        <button
                          type="button"
                          data-testid="settle-season-candles-btn"
                          onClick={onSettleSeasonEndConversion}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-300/40 text-amber-200 text-xs font-semibold cursor-pointer"
                        >
                          🕯️ 季末季蜡 1:1 转白烛 (余 {saveData.seasonCandles})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Shard Eruption Event */}
                  <div className="p-4 rounded-2xl bg-slate-950/75 border border-slate-800 space-y-2.5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                      破晓碎片喷发事件 (黑石 / 红石降落挑战)
                    </div>
                    <p className="text-xs text-slate-400">
                      触发后场景中央降落红/黑曜石碎片与暗黑植物，净化后立即结算烛火或升华红蜡烛！
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        data-testid="trigger-shard-black-btn"
                        onClick={() => onTriggerShardEvent('black')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 text-xs font-semibold cursor-pointer"
                      >
                        ☄️ 触发黑石事件 (+200 烛火)
                      </button>
                      <button
                        type="button"
                        data-testid="trigger-shard-red-btn"
                        onClick={() => onTriggerShardEvent('red')}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/25 hover:bg-rose-500/40 border border-rose-400/40 text-rose-200 text-xs font-semibold cursor-pointer"
                      >
                        🔥 触发红石事件 (+4 升华红烛)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 4: HOME WORKSHOP FURNITURE & CHILD GUARDIAN MODE */}
          {activeTab === 'home' && (() => {
            const presets =
              ((GAME_CONFIG as any).homePresetLayouts as {
                id: string;
                name: string;
                description: string;
              }[]) || [];

            return (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Column: 6 Furniture Blueprints + Preset Shared Space Layouts */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-amber-200">
                        🏡 阶段10 · 小屋工坊与共享空间布置 (已摆放{' '}
                        {saveData.homeFurniturePlacements.length} / 16 件)
                      </h3>
                      <p className="text-xs text-slate-400">
                        制作并摆放在遇境星盘周围，火盆与祈愿灯可持续回能，双人石椅可免好友树交谈
                      </p>
                    </div>
                    <button
                      type="button"
                      data-testid="clear-all-furniture-btn"
                      onClick={onClearFurniture}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      收纳全部家具
                    </button>
                  </div>

                  {/* Preset Shared Space Themes */}
                  {onApplyPresetHomeLayout && presets.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-400/35 space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        ✨ 一键应用共享空间主题布景 (JSON 预设矩阵)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {presets.map((pr) => (
                          <button
                            key={pr.id}
                            type="button"
                            data-testid={`apply-home-preset-${pr.id}`}
                            onClick={() => onApplyPresetHomeLayout(pr.id)}
                            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-300/30 text-left cursor-pointer"
                          >
                            <div className="text-xs font-bold text-amber-100">
                              {pr.name}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {pr.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6-Item Furniture Crafting & Placement Catalog */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {GAME_CONFIG.homeFurnitureCatalog.map((furn: any) => {
                      const owned = saveData.homeFurnitureInventory.includes(
                        furn.id
                      );
                      return (
                        <div
                          key={furn.id}
                          className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-2.5"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-amber-100">
                                {furn.name}
                              </span>
                              {furn.effectLabel && (
                                <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-400/30 text-[10px] text-amber-200">
                                  {furn.effectLabel}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {furn.description}
                            </p>
                          </div>

                          <button
                            type="button"
                            data-testid={`place-furniture-${furn.id}`}
                            onClick={() => onPlaceFurniture(furn.id)}
                            className="w-full px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer"
                          >
                            {owned
                              ? '+ 摆放到角色前方'
                              : `🛠️ 制作并摆放 (${furn.costCandles} 白烛)`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Placed Furniture Instance Inspector + Child Guardian Mode */}
                <div className="md:col-span-5 space-y-4">
                  {/* Placed Furniture Instances List (Rotate 45° / Remove) */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-sky-300">
                      🪑 已摆放 3D 家具实例管理 ({saveData.homeFurniturePlacements.length} 件)
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {saveData.homeFurniturePlacements.length === 0 ? (
                        <div className="text-xs text-slate-500 py-3 text-center">
                          当前共享空间暂无摆放家具，点击左侧图纸即可摆放
                        </div>
                      ) : (
                        saveData.homeFurniturePlacements.map((inst) => {
                          const cfg = GAME_CONFIG.homeFurnitureCatalog.find(
                            (f) => f.id === inst.furnitureId
                          );
                          const deg = Math.round((inst.rotY * 180) / Math.PI);
                          return (
                            <div
                              key={inst.instanceId}
                              data-testid={`placed-furniture-row-${inst.instanceId}`}
                              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                            >
                              <div>
                                <div className="text-xs font-bold text-amber-100">
                                  {cfg?.name || inst.furnitureId}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400">
                                  坐标 ({inst.x}, {inst.z}) · 朝向 {deg}°
                                </div>
                              </div>

                              {onRotateOrRemoveFurniture && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    data-testid={`rotate-furniture-${inst.instanceId}`}
                                    onClick={() =>
                                      onRotateOrRemoveFurniture(
                                        inst.instanceId,
                                        'rotate'
                                      )
                                    }
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-sky-200 cursor-pointer"
                                  >
                                    ↻ 旋转45°
                                  </button>
                                  <button
                                    type="button"
                                    data-testid={`remove-furniture-${inst.instanceId}`}
                                    onClick={() =>
                                      onRotateOrRemoveFurniture(
                                        inst.instanceId,
                                        'remove'
                                      )
                                    }
                                    className="px-2 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-[11px] text-rose-200 cursor-pointer"
                                  >
                                    ✕ 收回
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Stage 10: Child Guardian Mode (未成年人/儿童守护模式) Dedicated Panel */}
                  <div className="p-4 rounded-2xl bg-slate-950/85 border border-emerald-400/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        🛡️ 阶段10 · 未成年人 / 儿童守护模式
                      </span>
                      <span
                        data-testid="childsafe-status-badge"
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          saveData.childSafeMode
                            ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {saveData.childSafeMode ? '已开启守护' : '标准社交模式'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      开启后将自动屏蔽所有自由文字输入（包含好友树私聊、双人长椅文字交谈、自由冥想留言与相册自定义配文），仅保留安全的先祖动作、星音呼唤、乐器演奏与预设祝福语。
                    </p>
                    <button
                      type="button"
                      data-testid="home-toggle-childsafe-btn"
                      onClick={onToggleChildSafeMode}
                      className={`w-full px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        saveData.childSafeMode
                          ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 border border-emerald-400/40 text-emerald-200'
                      }`}
                    >
                      {saveData.childSafeMode
                        ? '🛡️ 儿童守护模式运行中（点击切换为标准模式）'
                        : '🔒 一键开启未成年人 / 儿童守护模式'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 5: STAGE 4 SAVE & PERSISTENCE MANAGER */}
          {activeTab === 'save' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    💾 阶段4 双层持久化存档状态
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">存储引擎：</span>
                      <span className="text-emerald-300">localStorage + IndexedDB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">旅人 ID：</span>
                      <span className="text-amber-200">{saveData.playerId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">已追忆先祖：</span>
                      <span className="text-amber-200">
                        {saveData.relivedSpiritIds.length} / {GAME_CONFIG.constellations.length} 位
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">星盘已点亮节点：</span>
                      <span className="text-amber-200">
                        {saveData.unlockedConstellationNodes.length} 个
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">衣橱已解锁装扮：</span>
                      <span className="text-amber-200">
                        {saveData.unlockedCosmeticIds.length} 款
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">今日已合成白蜡烛：</span>
                      <span className="text-amber-200">
                        {saveData.dailyCandlesForged} / {GAME_CONFIG.economy.dailyCandleCap}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-testid="export-save-btn"
                      onClick={() =>
                        setSaveJsonText(storageService.exportSaveJson(saveData))
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 text-xs font-semibold cursor-pointer"
                    >
                      📤 刷新导出 JSON
                    </button>
                    {onImportSaveData && (
                      <button
                        type="button"
                        data-testid="import-save-btn"
                        onClick={() => onImportSaveData(saveJsonText)}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer"
                      >
                        📥 导入并应用 JSON
                      </button>
                    )}
                    {onResetSaveData && (
                      <button
                        type="button"
                        data-testid="reset-save-btn"
                        onClick={() => {
                          onResetSaveData();
                          setSaveJsonText(storageService.exportSaveJson());
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-semibold cursor-pointer"
                      >
                        🔄 重置初始存档
                      </button>
                    )}
                  </div>
                </div>

                {/* Stage 11: Performance Tiering, Accessibility, Bilingual i18n & Onboarding Tutorial */}
                <div className="p-4 rounded-2xl bg-slate-950/85 border border-sky-400/40 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-300">
                    ⚡ 阶段11 · 画质分档、无障碍、双语 i18n 与新手引导
                  </div>

                  {/* Quality Tiers */}
                  {onUpdateAccessibilityAndPerf && (
                    <div className="space-y-2">
                      <div className="text-[11px] text-slate-300 font-semibold">
                        渲染画质分档 (当前: {saveData.qualityTier || 'auto'}):
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(
                          [
                            { id: 'auto', label: '智能自适应' },
                            { id: 'low', label: '流畅省电' },
                            { id: 'medium', label: '均衡画质' },
                            { id: 'high', label: '极致云海' },
                          ] as const
                        ).map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            data-testid={`set-quality-tier-${t.id}`}
                            onClick={() =>
                              onUpdateAccessibilityAndPerf({ qualityTier: t.id })
                            }
                            className={`px-2 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer ${
                              (saveData.qualityTier || 'auto') === t.id
                                ? 'bg-sky-400 text-slate-950'
                                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {/* High-Contrast & Reduced Motion Shake & Bilingual Locale */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <button
                          type="button"
                          data-testid="toggle-high-contrast-btn"
                          onClick={() =>
                            onUpdateAccessibilityAndPerf({
                              highContrastMode: !saveData.highContrastMode,
                            })
                          }
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer border ${
                            saveData.highContrastMode
                              ? 'bg-amber-400 text-slate-950 border-amber-300'
                              : 'bg-slate-900 text-slate-300 border-slate-700'
                          }`}
                        >
                          👁️ 高对比辅助 ({saveData.highContrastMode ? 'ON' : 'OFF'})
                        </button>

                        <button
                          type="button"
                          data-testid="toggle-reduced-shake-btn"
                          onClick={() =>
                            onUpdateAccessibilityAndPerf({
                              reducedMotionShake: !saveData.reducedMotionShake,
                            })
                          }
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer border ${
                            saveData.reducedMotionShake
                              ? 'bg-emerald-400 text-slate-950 border-emerald-300'
                              : 'bg-slate-900 text-slate-300 border-slate-700'
                          }`}
                        >
                          🛡️ 防眩晕减震 ({saveData.reducedMotionShake ? 'ON' : 'OFF'})
                        </button>

                        <button
                          type="button"
                          data-testid="toggle-locale-btn"
                          onClick={() =>
                            onUpdateAccessibilityAndPerf({
                              locale: saveData.locale === 'en' ? 'zh' : 'en',
                            })
                          }
                          className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer bg-indigo-950/90 hover:bg-indigo-900 text-indigo-200 border border-indigo-400/40"
                        >
                          🌐 语言: {saveData.locale === 'en' ? 'English (EN)' : '简体中文 (ZH)'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3-Step Onboarding Tutorial Controls */}
                  {onAdvanceOnboardingTutorial && (
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 font-semibold">
                          🧭 3 步新手旅途引导进度:
                        </span>
                        <span
                          data-testid="tutorial-step-badge"
                          className="font-mono text-amber-300 font-bold"
                        >
                          {saveData.tutorialStep >= 3
                            ? '3/3 已通关 (+2 白烛)'
                            : `第 ${saveData.tutorialStep + 1}/3 步`}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          data-testid="complete-tutorial-btn"
                          disabled={saveData.tutorialStep >= 3}
                          onClick={() =>
                            onAdvanceOnboardingTutorial('complete_all')
                          }
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer ${
                            saveData.tutorialStep >= 3
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                          }`}
                        >
                          {saveData.tutorialStep >= 3
                            ? '✓ 已领取启航贺礼'
                            : '⚡ 一键完成引导 (+2 白烛)'}
                        </button>
                        <button
                          type="button"
                          data-testid="reset-tutorial-btn"
                          onClick={() => onAdvanceOnboardingTutorial('reset')}
                          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold cursor-pointer"
                        >
                          🔄 重置引导进度
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-7 flex flex-col">
                <label className="text-xs font-semibold text-amber-200 mb-2">
                  存档 JSON 数据镜像（可直接编辑后点击「导入并应用 JSON」验证持久化）：
                </label>
                <textarea
                  data-testid="save-json-textarea"
                  value={saveJsonText}
                  onChange={(e) => setSaveJsonText(e.target.value)}
                  rows={14}
                  className="w-full flex-1 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
