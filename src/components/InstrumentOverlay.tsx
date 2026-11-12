import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SKY_15_NOTES,
  SkyMusicNote,
  SKY_INSTRUMENT_VOICES,
  SKY_ENSEMBLE_PRACTICE_SONGS,
  EnsemblePracticeState,
  createInitialEnsemblePracticeStatePure,
  stepEnsemblePracticeNotePure,
} from '../game/rules';
import { InstrumentVoice, skyAudio } from '../game/audio';
import { RecordedMusicNote, RecordedSongSheet } from '../core/StorageService';

interface InstrumentOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  instrumentType: InstrumentVoice;
  onChangeInstrumentType: (t: InstrumentVoice) => void;
  onNotePlayed: (note: SkyMusicNote) => void;
  savedSongs?: RecordedSongSheet[];
  onSaveRecordedSong?: (song: RecordedSongSheet) => void;
}

const SKY_MELODY_SEQUENCE = [
  { noteIdx: 4, delay: 320 }, // G4
  { noteIdx: 7, delay: 320 }, // C5
  { noteIdx: 9, delay: 320 }, // E5
  { noteIdx: 11, delay: 480 }, // G5
  { noteIdx: 9, delay: 320 }, // E5
  { noteIdx: 7, delay: 480 }, // C5
  { noteIdx: 8, delay: 320 }, // D5
  { noteIdx: 9, delay: 320 }, // E5
  { noteIdx: 7, delay: 640 }, // C5
];

export const InstrumentOverlay: React.FC<InstrumentOverlayProps> = ({
  isOpen,
  onClose,
  instrumentType,
  onChangeInstrumentType,
  onNotePlayed,
  savedSongs = [],
  onSaveRecordedSong,
}) => {
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const [lastHarmonyIndex, setLastHarmonyIndex] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [activeSongTitle, setActiveSongTitle] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<RecordedMusicNote[]>([]);
  const [sheetJsonModal, setSheetJsonModal] = useState(false);
  const [sheetJsonText, setSheetJsonText] = useState('');
  const [mixerVolumes, setMixerVolumes] = useState(() => skyAudio.getMixerVolumes());

  // Beginner Auto-Ensemble Practice State
  const [practiceOpen, setPracticeOpen] = useState(true);
  const [practiceState, setPracticeState] = useState<EnsemblePracticeState>(() => ({
    ...createInitialEnsemblePracticeStatePure(SKY_ENSEMBLE_PRACTICE_SONGS[0].id, true),
    active: true,
  }));
  const [practiceTempoMult, setPracticeTempoMult] = useState<0.75 | 1.0 | 1.25>(1.0);
  const [practiceFeedback, setPracticeFeedback] = useState<string>(
    '✨ 先祖伴奏已就绪！点击高亮键位或按「✨ 跟弹下一音」即可自动和弦合奏'
  );

  const recordStartMsRef = useRef<number>(0);
  const autoTimerRef = useRef<number | null>(null);
  const practiceAutoTimerRef = useRef<number | null>(null);
  const practiceStateRef = useRef<EnsemblePracticeState>(practiceState);

  useEffect(() => {
    practiceStateRef.current = practiceState;
  }, [practiceState]);

  useEffect(() => {
    return () => {
      if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
      if (practiceAutoTimerRef.current) window.clearTimeout(practiceAutoTimerRef.current);
    };
  }, []);

  const currentPracticeSong =
    SKY_ENSEMBLE_PRACTICE_SONGS.find((s) => s.id === practiceState.songId) ||
    SKY_ENSEMBLE_PRACTICE_SONGS[0];
  const currentVoiceMeta =
    SKY_INSTRUMENT_VOICES.find((v) => v.id === instrumentType) ||
    SKY_INSTRUMENT_VOICES[0];
  const companionVoiceMeta =
    SKY_INSTRUMENT_VOICES.find((v) => v.id === currentPracticeSong.companionVoice) ||
    SKY_INSTRUMENT_VOICES[1];

  const triggerNote = useCallback(
    (note: SkyMusicNote, companionHarmonyNote?: SkyMusicNote, companionVoice?: InstrumentVoice) => {
      setLastActiveIndex(note.index);
      skyAudio.playInstrumentNote(note.freq, instrumentType, 1.0);
      if (companionHarmonyNote && companionVoice) {
        setLastHarmonyIndex(companionHarmonyNote.index);
        skyAudio.playInstrumentNote(companionHarmonyNote.freq, companionVoice, 0.72);
      }
      onNotePlayed(note);

      if (isRecording) {
        const delayMs = Math.max(
          0,
          Math.round(performance.now() - recordStartMsRef.current)
        );
        setRecordedNotes((prev) => [...prev, { keyIndex: note.index, delayMs }]);
      }
    },
    [instrumentType, isRecording, onNotePlayed]
  );

  const handlePracticeStepInput = useCallback(
    (playedKeyIndex: number, forceAssist = false) => {
      const st = practiceStateRef.current;
      const stepRes = stepEnsemblePracticeNotePure(st, playedKeyIndex, forceAssist);
      practiceStateRef.current = stepRes.nextState;
      setPracticeState(stepRes.nextState);

      const leadNote = SKY_15_NOTES[stepRes.resolvedLeadKeyIndex];
      const harmonyNote = SKY_15_NOTES[stepRes.harmonyKeyIndex];

      if (stepRes.isCorrect) {
        triggerNote(leadNote, harmonyNote, stepRes.companionVoice);
        if (stepRes.justCompleted) {
          setPracticeFeedback(
            `🎉 恭喜完成${currentPracticeSong.title}合奏！评级：${stepRes.nextState.rating} 级 · 最高连击 x${stepRes.nextState.maxCombo} (${stepRes.accuracyPercent}%)`
          );
        } else {
          const nextStepObj = currentPracticeSong.steps[stepRes.nextState.stepIndex];
          const nextTargetNote = SKY_15_NOTES[nextStepObj.leadKeyIndex];
          setPracticeFeedback(
            `🎶 完美合奏 +1 (连击 x${stepRes.nextState.combo}) · 先祖${companionVoiceMeta.label}和鸣 [${harmonyNote.solfege}] ➔ 下一音按 [${nextTargetNote.keyShortcut}] (${nextTargetNote.solfege})`
          );
        }
      } else {
        // Strict mode miss: play the user's clicked note and gently remind the target key
        triggerNote(leadNote);
        const targetStep = currentPracticeSong.steps[st.stepIndex];
        const targetNote = SKY_15_NOTES[targetStep.leadKeyIndex];
        setPracticeFeedback(
          `💡 差一点点！请按高亮键 [${targetNote.keyShortcut}] (${targetNote.solfege})，或开启「新手任意键辅助」零失误跟弹`
        );
      }
    },
    [companionVoiceMeta.label, currentPracticeSong, triggerNote]
  );

  // Automatic Spirit Ensemble Pacing Timer when `practiceState.autoAccompanyPlay` is active
  useEffect(() => {
    if (!isOpen || !practiceState.active || !practiceState.autoAccompanyPlay) {
      if (practiceAutoTimerRef.current) {
        window.clearTimeout(practiceAutoTimerRef.current);
        practiceAutoTimerRef.current = null;
      }
      return;
    }

    const song =
      SKY_ENSEMBLE_PRACTICE_SONGS.find((s) => s.id === practiceState.songId) ||
      SKY_ENSEMBLE_PRACTICE_SONGS[0];
    const safeIdx = Math.max(0, Math.min(song.steps.length - 1, practiceState.stepIndex));
    const stepSpec = song.steps[safeIdx];
    const intervalMs = Math.max(160, Math.round(stepSpec.beatMs / practiceTempoMult));

    practiceAutoTimerRef.current = window.setTimeout(() => {
      handlePracticeStepInput(stepSpec.leadKeyIndex, true);
    }, intervalMs);

    return () => {
      if (practiceAutoTimerRef.current) {
        window.clearTimeout(practiceAutoTimerRef.current);
        practiceAutoTimerRef.current = null;
      }
    };
  }, [
    isOpen,
    practiceState.active,
    practiceState.autoAccompanyPlay,
    practiceState.songId,
    practiceState.stepIndex,
    practiceTempoMult,
    handlePracticeStepInput,
  ]);

  // Stage 5: Keyboard shortcut listener (1-5 / Y-P / H-; and Space for practice step)
  useEffect(() => {
    if (!isOpen) return;
    const keyMap: Record<string, number> = {
      Digit1: 0,
      Digit2: 1,
      Digit3: 2,
      Digit4: 3,
      Digit5: 4,
      KeyY: 5,
      KeyU: 6,
      KeyI: 7,
      KeyO: 8,
      KeyP: 9,
      KeyH: 10,
      KeyJ: 11,
      KeyK: 12,
      KeyL: 13,
      Semicolon: 14,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.code === 'Space' && practiceStateRef.current.active && practiceOpen) {
        e.preventDefault();
        e.stopPropagation();
        const song =
          SKY_ENSEMBLE_PRACTICE_SONGS.find((s) => s.id === practiceStateRef.current.songId) ||
          SKY_ENSEMBLE_PRACTICE_SONGS[0];
        const targetIdx = song.steps[practiceStateRef.current.stepIndex]?.leadKeyIndex ?? 0;
        handlePracticeStepInput(targetIdx, true);
        return;
      }
      if (e.code in keyMap) {
        e.preventDefault();
        const keyIdx = keyMap[e.code];
        if (practiceStateRef.current.active && practiceOpen) {
          handlePracticeStepInput(keyIdx, false);
        } else {
          triggerNote(SKY_15_NOTES[keyIdx]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, practiceOpen, handlePracticeStepInput, triggerNote]);

  const handleSelectPracticeSong = (songId: string, switchVoice = true) => {
    if (practiceAutoTimerRef.current) {
      window.clearTimeout(practiceAutoTimerRef.current);
      practiceAutoTimerRef.current = null;
    }
    const song =
      SKY_ENSEMBLE_PRACTICE_SONGS.find((s) => s.id === songId) ||
      SKY_ENSEMBLE_PRACTICE_SONGS[0];
    const nextState: EnsemblePracticeState = {
      ...createInitialEnsemblePracticeStatePure(song.id, practiceState.anyKeyAssist),
      active: true,
    };
    practiceStateRef.current = nextState;
    setPracticeState(nextState);
    if (switchVoice) {
      onChangeInstrumentType(song.recommendedVoice);
    }
    const firstNote = SKY_15_NOTES[song.steps[0].leadKeyIndex];
    setPracticeFeedback(
      `🎼 已载入${song.title} (${song.difficulty}) · 请按高亮键 [${firstNote.keyShortcut}] (${firstNote.solfege}) 开始跟弹`
    );
  };

  const handleToggleAutoEnsemblePlay = () => {
    setPracticeState((prev) => {
      const nextAuto = !prev.autoAccompanyPlay;
      const next: EnsemblePracticeState = {
        ...prev,
        active: true,
        completed: false,
        autoAccompanyPlay: nextAuto,
      };
      practiceStateRef.current = next;
      return next;
    });
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recordedNotes.length > 0 && onSaveRecordedSong) {
        onSaveRecordedSong({
          id: `song_${Date.now()}`,
          title: `旅人自创星曲 (${recordedNotes.length}音)`,
          bpm: 110,
          notes: recordedNotes,
        });
      }
    } else {
      setRecordedNotes([]);
      recordStartMsRef.current = performance.now();
      setIsRecording(true);
    }
  };

  const handlePlayRecordedNotes = (seq: RecordedMusicNote[], title = '旅人录音回放') => {
    if (seq.length === 0) return;
    if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
    setIsAutoPlaying(true);
    setActiveSongTitle(title);

    let step = 0;
    const startTs = performance.now();

    const tickPlayback = () => {
      if (step >= seq.length) {
        setIsAutoPlaying(false);
        setActiveSongTitle(null);
        return;
      }
      const elapsed = performance.now() - startTs;
      while (step < seq.length && seq[step].delayMs <= elapsed) {
        const idx = Math.max(0, Math.min(14, seq[step].keyIndex));
        triggerNote(SKY_15_NOTES[idx]);
        step++;
      }
      if (step < seq.length) {
        autoTimerRef.current = window.setTimeout(tickPlayback, 25);
      } else {
        setIsAutoPlaying(false);
        setActiveSongTitle(null);
      }
    };
    tickPlayback();
  };

  const handleToggleAutoMelody = () => {
    if (isAutoPlaying) {
      if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
      setIsAutoPlaying(false);
      setActiveSongTitle(null);
      return;
    }
    setIsAutoPlaying(true);
    setActiveSongTitle('《云野星光曲》');
    let step = 0;

    const playNext = () => {
      if (step >= SKY_MELODY_SEQUENCE.length) {
        setIsAutoPlaying(false);
        setActiveSongTitle(null);
        return;
      }
      const item = SKY_MELODY_SEQUENCE[step];
      const note = SKY_15_NOTES[item.noteIdx];
      triggerNote(note);
      step += 1;
      autoTimerRef.current = window.setTimeout(playNext, item.delay);
    };
    playNext();
  };

  const handleChangeVolume = (
    channel: 'masterVolume' | 'bgmVolume' | 'instrumentVolume',
    value: number
  ) => {
    skyAudio.setMixerVolumes({ [channel]: value, sfxVolume: value });
    setMixerVolumes(skyAudio.getMixerVolumes());
  };

  if (!isOpen) return null;

  const activeStepSpec =
    currentPracticeSong.steps[
      Math.max(0, Math.min(currentPracticeSong.steps.length - 1, practiceState.stepIndex))
    ];
  const nextStepSpec =
    currentPracticeSong.steps[
      (practiceState.stepIndex + 1) % currentPracticeSong.steps.length
    ];
  const targetLeadKeyIdx =
    practiceOpen && practiceState.active ? activeStepSpec.leadKeyIndex : null;
  const nextLeadKeyIdx =
    practiceOpen && practiceState.active ? nextStepSpec.leadKeyIndex : null;
  const targetLeadNote =
    targetLeadKeyIdx !== null ? SKY_15_NOTES[targetLeadKeyIdx] : null;

  return (
    <div
      data-testid="instrument-studio-overlay"
      className="fixed inset-x-0 bottom-14 z-30 flex justify-center px-3 sm:px-4 pointer-events-none"
      role="region"
      aria-label="光遇15键云端乐器演奏与自动合奏台"
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-amber-300/40 p-3 sm:p-3.5 text-slate-100 shadow-2xl pointer-events-auto max-h-[82vh] overflow-y-auto"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)' }}
      >
        {/* Header & 8-Instrument Timbre Selector (Piano, Harp, Flute, Xylophone, Wind Chime, Music Box, Drum, Kalimba) */}
        <div className="flex flex-col gap-1.5 mb-2 pb-2 border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-200">
                🎵 15键云端乐器 (8大音色)：
              </span>
              <span
                data-testid="active-instrument-timbre-tag"
                className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-300/35 text-amber-100"
              >
                当前：{currentVoiceMeta.label} · {currentVoiceMeta.timbreTag}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                data-testid="instrument-practice-mode-btn"
                onClick={() => {
                  setPracticeOpen((prev) => !prev);
                  setPracticeState((prev) => ({ ...prev, active: true }));
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  practiceOpen
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
                }`}
              >
                {practiceOpen ? '🎓 合奏练习模式 (开启中)' : '🎓 开启合奏练习'}
              </button>

              <button
                type="button"
                data-testid="instrument-record-btn"
                onClick={handleToggleRecording}
                className={`px-2 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                }`}
              >
                {isRecording ? `● 停止保存 (${recordedNotes.length})` : '● 录音'}
              </button>

              {recordedNotes.length > 0 && !isRecording && (
                <button
                  type="button"
                  data-testid="instrument-playback-btn"
                  onClick={() => handlePlayRecordedNotes(recordedNotes, '刚录制的乐谱')}
                  className="px-2 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 cursor-pointer"
                >
                  ▶ 回放 ({recordedNotes.length})
                </button>
              )}

              <button
                type="button"
                data-testid="instrument-json-btn"
                onClick={() => {
                  setSheetJsonText(
                    JSON.stringify(
                      recordedNotes.length > 0
                        ? recordedNotes
                        : [
                            { keyIndex: 0, delayMs: 0 },
                            { keyIndex: 4, delayMs: 320 },
                            { keyIndex: 7, delayMs: 640 },
                            { keyIndex: 9, delayMs: 960 },
                          ]
                    )
                  );
                  setSheetJsonModal((prev) => !prev);
                }}
                className="px-2 py-1 rounded-md text-xs font-medium bg-slate-800 text-amber-200 hover:text-white cursor-pointer"
              >
                乐谱JSON
              </button>

              <button
                type="button"
                data-testid="instrument-auto-melody-btn"
                onClick={handleToggleAutoMelody}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isAutoPlaying
                    ? 'bg-rose-500 text-white'
                    : 'bg-sky-400 text-slate-950 hover:bg-sky-300'
                }`}
              >
                {isAutoPlaying ? `■ 停止独奏` : '▶ 独奏示范'}
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="收起乐器面板"
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                收起 [V]
              </button>
            </div>
          </div>

          {/* 8 Instrument Timbre Pills */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {SKY_INSTRUMENT_VOICES.map((inst) => {
              const active = instrumentType === inst.id;
              return (
                <button
                  key={inst.id}
                  type="button"
                  data-testid={`instrument-voice-${inst.id}`}
                  onClick={() => {
                    onChangeInstrumentType(inst.id);
                    skyAudio.playInstrumentNote(523.25, inst.id, 0.85);
                  }}
                  title={inst.timbreTag}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                    active
                      ? 'bg-amber-300 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{inst.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= BEGINNER AUTO-ENSEMBLE PRACTICE MODE PANEL ================= */}
        {practiceOpen && (
          <div
            data-testid="ensemble-practice-panel"
            className="mb-2 rounded-xl bg-slate-900/95 border border-emerald-400/35 p-2.5 space-y-1.5"
          >
            {/* Row 1: Song Selection Pills & Practice Mode Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-300">
                  🎼 合奏曲目：
                </span>
                {SKY_ENSEMBLE_PRACTICE_SONGS.map((song) => {
                  const selected = practiceState.songId === song.id;
                  return (
                    <button
                      key={song.id}
                      type="button"
                      data-testid={`practice-song-${song.id}`}
                      onClick={() => handleSelectPracticeSong(song.id, true)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                        selected
                          ? 'bg-emerald-400 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-white/10'
                      }`}
                    >
                      {song.title.split(' · ')[0]}
                      <span className="ml-1 opacity-80 text-[10px]">
                        ({song.difficulty.split(' ')[0]})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tempo & Beginner Any-Key Assist Toggles */}
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-[10px]">
                  {([0.75, 1.0, 1.25] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      data-testid={`practice-tempo-${spd}`}
                      onClick={() => setPracticeTempoMult(spd)}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${
                        practiceTempoMult === spd
                          ? 'bg-amber-300 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd === 0.75 ? '0.75x慢速' : spd === 1.0 ? '1.0x标准' : '1.25x轻快'}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  data-testid="practice-anykey-assist-btn"
                  onClick={() =>
                    setPracticeState((prev) => {
                      const next = { ...prev, anyKeyAssist: !prev.anyKeyAssist };
                      practiceStateRef.current = next;
                      return next;
                    })
                  }
                  title="开启后按任意键位或空格键都能准确弹响目标主旋律并触发先祖和弦伴奏，新手零压力上手"
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border cursor-pointer ${
                    practiceState.anyKeyAssist
                      ? 'bg-amber-400/20 border-amber-300/60 text-amber-200 font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {practiceState.anyKeyAssist ? '🛡️ 新手任意键纠错：已开启' : '🎯 严格键位练习模式'}
                </button>
              </div>
            </div>

            {/* Row 2: Live Step Progress Track, Target Key Prompt & One-Click Follow Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/90">
              <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-300">
                    先祖伴奏：<strong className="text-sky-300">{companionVoiceMeta.label}</strong>
                  </span>
                  <span className="text-slate-500">|</span>
                  <span
                    data-testid="practice-progress-counter"
                    className="font-mono text-emerald-300 font-semibold"
                  >
                    进度：{practiceState.stepIndex + 1}/{currentPracticeSong.steps.length}
                  </span>
                  <span
                    data-testid="practice-combo-badge"
                    className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 font-mono text-[11px] text-amber-200 font-bold"
                  >
                    连击 x{practiceState.combo} (最高 x{practiceState.maxCombo})
                  </span>
                  {practiceState.rating && (
                    <span
                      data-testid="practice-rating-badge"
                      className="px-2 py-0.5 rounded-full bg-emerald-400/25 border border-emerald-300/60 font-mono text-[11px] text-emerald-200 font-bold"
                    >
                      🏆 最近评级：{practiceState.rating} 级
                    </span>
                  )}
                </div>

                {/* Step Note Sequence Bar */}
                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                  {currentPracticeSong.steps.map((st, idx) => {
                    const noteObj = SKY_15_NOTES[st.leadKeyIndex];
                    const isCurrent = idx === practiceState.stepIndex;
                    const isDone = idx < practiceState.stepIndex;
                    return (
                      <div
                        key={idx}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-0.5 shrink-0 border ${
                          isCurrent
                            ? 'bg-emerald-400 text-slate-950 font-bold border-emerald-200'
                            : isDone
                              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        <span>{noteObj.solfege}</span>
                        <span className="opacity-75">[{noteObj.keyShortcut}]</span>
                      </div>
                    );
                  })}
                </div>

                <div
                  data-testid="practice-feedback-banner"
                  className="text-[11px] text-amber-100/95 truncate"
                >
                  {practiceFeedback}
                </div>
              </div>

              {/* Action Buttons for Easy Beginner Follow-Play & Auto-Ensemble */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  data-testid="practice-step-next-btn"
                  onClick={() =>
                    handlePracticeStepInput(activeStepSpec.leadKeyIndex, true)
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 text-xs font-extrabold shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <span>✨ 跟弹下一音</span>
                  {targetLeadNote && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-950/20 font-mono text-[11px]">
                      [{targetLeadNote.keyShortcut}/Space] {targetLeadNote.solfege}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  data-testid="practice-auto-ensemble-btn"
                  onClick={handleToggleAutoEnsemblePlay}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    practiceState.autoAccompanyPlay
                      ? 'bg-rose-500 text-white'
                      : 'bg-sky-400 hover:bg-sky-300 text-slate-950'
                  }`}
                >
                  {practiceState.autoAccompanyPlay
                    ? '■ 暂停自动合奏'
                    : '🤖 自动合奏演示'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stage 5: Saved Cloud Songbook & Audio Mixer Bar */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-amber-200">📚 旅人自创乐谱：</span>
            {savedSongs.slice(0, 4).map((song) => (
              <button
                key={song.id}
                type="button"
                data-testid={`play-saved-song-${song.id}`}
                onClick={() => {
                  setRecordedNotes(song.notes);
                  handlePlayRecordedNotes(song.notes, song.title);
                }}
                className="px-2 py-0.5 rounded bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-400/40 text-indigo-100 cursor-pointer"
              >
                ▶ {song.title} ({song.notes.length}音)
              </button>
            ))}
          </div>

          <div
            data-testid="audio-mixer-controls"
            className="flex flex-wrap items-center gap-3 text-slate-300"
          >
            <label className="flex items-center gap-1">
              <span>总音量</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={mixerVolumes.masterVolume}
                onChange={(e) =>
                  handleChangeVolume('masterVolume', parseFloat(e.target.value))
                }
                className="w-12 accent-amber-300 cursor-pointer"
              />
            </label>
            <label className="flex items-center gap-1">
              <span>配乐</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={mixerVolumes.bgmVolume}
                onChange={(e) =>
                  handleChangeVolume('bgmVolume', parseFloat(e.target.value))
                }
                className="w-12 accent-sky-300 cursor-pointer"
              />
            </label>
            <label className="flex items-center gap-1">
              <span>乐器</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={mixerVolumes.instrumentVolume}
                onChange={(e) =>
                  handleChangeVolume('instrumentVolume', parseFloat(e.target.value))
                }
                className="w-12 accent-emerald-300 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Optional Sheet Music JSON Import/Share Drawer */}
        {sheetJsonModal && (
          <div className="mb-2 p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <input
              type="text"
              data-testid="instrument-json-input"
              value={sheetJsonText}
              onChange={(e) => setSheetJsonText(e.target.value)}
              placeholder="粘贴 JSON 乐谱数组 [{keyIndex:0, delayMs:0}, ...]"
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-amber-100"
            />
            <button
              type="button"
              data-testid="instrument-json-import-btn"
              onClick={() => {
                try {
                  const parsed = JSON.parse(sheetJsonText);
                  if (Array.isArray(parsed)) {
                    setRecordedNotes(parsed);
                    handlePlayRecordedNotes(parsed, '导入JSON乐谱');
                  }
                } catch (err) {
                  console.error('[InstrumentSheetImport]', err);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
            >
              导入并演奏
            </button>
          </div>
        )}

        {/* Authentic 3x5 Sky Diamond / Circle / Square Key Matrix with Practice Target Highlighting */}
        <div className="grid grid-cols-5 gap-1.5">
          {SKY_15_NOTES.map((note) => {
            const active = lastActiveIndex === note.index;
            const isHarmonyActive = lastHarmonyIndex === note.index;
            const isTargetLead = targetLeadKeyIdx === note.index;
            const isNextLead = !isTargetLead && nextLeadKeyIdx === note.index;

            return (
              <button
                key={note.index}
                type="button"
                data-testid={`instrument-note-${note.index}`}
                data-target-note={isTargetLead ? 'true' : 'false'}
                onClick={() => {
                  if (practiceOpen && practiceState.active) {
                    handlePracticeStepInput(note.index, false);
                  } else {
                    triggerNote(note);
                  }
                }}
                aria-label={`弹奏音符 ${note.label} ${note.solfege}`}
                className={`relative h-11 rounded-xl border flex flex-col items-center justify-center transition-transform active:scale-90 cursor-pointer ${
                  isTargetLead
                    ? 'border-emerald-300 bg-emerald-400/25 text-emerald-100 ring-2 ring-emerald-300/60 shadow-lg'
                    : active
                      ? 'border-amber-200 bg-amber-300/30 text-amber-100 scale-95'
                      : isHarmonyActive
                        ? 'border-sky-300/80 bg-sky-400/20 text-sky-100'
                        : isNextLead
                          ? 'border-amber-300/60 bg-slate-900/95 text-amber-100'
                          : 'border-amber-200/25 bg-slate-900/90 hover:border-amber-300/60 text-amber-100'
                }`}
              >
                {isTargetLead && (
                  <span
                    data-testid="practice-target-key-badge"
                    className="absolute -top-2 right-1.5 px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-extrabold shadow"
                  >
                    ★ 跟弹
                  </span>
                )}
                {isNextLead && (
                  <span className="absolute -top-2 right-1.5 px-1 py-0.2 rounded-full bg-slate-800 border border-amber-300/50 text-amber-200 text-[9px] font-medium">
                    预备
                  </span>
                )}
                {isHarmonyActive && !isTargetLead && (
                  <span className="absolute -top-2 left-1.5 px-1 py-0.2 rounded-full bg-sky-400/30 border border-sky-300/50 text-sky-200 text-[9px]">
                    和弦
                  </span>
                )}

                <svg viewBox="0 0 24 24" className="w-5 h-5 mb-0.5" aria-hidden="true">
                  {note.shape === 'root' && (
                    <>
                      <rect
                        x="4"
                        y="4"
                        width="16"
                        height="16"
                        rx="2"
                        fill="none"
                        stroke={isTargetLead ? '#6EE7B7' : '#FDE047'}
                        strokeWidth="1.8"
                      />
                      <polygon
                        points="12,5 19,12 12,19 5,12"
                        fill={active || isTargetLead ? '#FDE047' : 'none'}
                        stroke="#FEF08A"
                        strokeWidth="1.6"
                      />
                    </>
                  )}
                  {note.shape === 'diamond' && (
                    <polygon
                      points="12,3 21,12 12,21 3,12"
                      fill={active || isTargetLead ? '#38BDF8' : 'none'}
                      stroke={isTargetLead ? '#6EE7B7' : '#7DD3FC'}
                      strokeWidth="1.8"
                    />
                  )}
                  {note.shape === 'circle' && (
                    <circle
                      cx="12"
                      cy="12"
                      r="7.5"
                      fill={active || isTargetLead ? '#FDE68A' : 'none'}
                      stroke={isTargetLead ? '#6EE7B7' : '#FDE68A'}
                      strokeWidth="1.8"
                    />
                  )}
                </svg>
                <div className="flex items-center gap-1 text-[11px] font-mono tabular-nums">
                  <span className="font-semibold text-amber-200">{note.solfege}</span>
                  <span className="text-slate-400">[{note.keyShortcut}]</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


