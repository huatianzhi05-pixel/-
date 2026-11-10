import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SKY_15_NOTES, SkyMusicNote } from '../game/rules';
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
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [activeSongTitle, setActiveSongTitle] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<RecordedMusicNote[]>([]);
  const [sheetJsonModal, setSheetJsonModal] = useState(false);
  const [sheetJsonText, setSheetJsonText] = useState('');
  const [mixerVolumes, setMixerVolumes] = useState(() => skyAudio.getMixerVolumes());

  const recordStartMsRef = useRef<number>(0);
  const autoTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
    };
  }, []);

  const triggerNote = useCallback(
    (note: SkyMusicNote) => {
      setLastActiveIndex(note.index);
      skyAudio.playInstrumentNote(note.freq, instrumentType);
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

  // Stage 5: Keyboard shortcut listener (1-5 / Y-P / H-;) for live playing & recording
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
      if (e.code in keyMap) {
        e.preventDefault();
        const note = SKY_15_NOTES[keyMap[e.code]];
        triggerNote(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, triggerNote]);

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

  return (
    <div
      data-testid="instrument-studio-overlay"
      className="fixed inset-x-0 bottom-36 z-30 flex justify-center px-4 pointer-events-none"
      role="region"
      aria-label="光遇15键云端乐器演奏台"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-amber-300/40 p-4 sm:p-5 text-slate-100 shadow-2xl pointer-events-auto"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.94)' }}
      >
        {/* Header & 5-Instrument Selector (Harp + Piano + Flute + Drum + Kalimba) */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-amber-200 mr-1">
              15键云端乐器：
            </span>
            {(
              [
                { id: 'piano', label: '🎹 水晶钢琴' },
                { id: 'harp', label: '🪕 黄金竖琴' },
                { id: 'flute', label: '🪈 星语长笛' },
                { id: 'drum', label: '🥁 部落星鼓' },
                { id: 'kalimba', label: '🔔 拇指琴' },
              ] as const
            ).map((inst) => (
              <button
                key={inst.id}
                type="button"
                data-testid={`instrument-voice-${inst.id}`}
                onClick={() => onChangeInstrumentType(inst.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  instrumentType === inst.id
                    ? 'bg-amber-300 text-slate-950 font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {inst.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              data-testid="instrument-record-btn"
              onClick={handleToggleRecording}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
              }`}
            >
              {isRecording ? `● 停止并保存 (${recordedNotes.length})` : '● 录制乐谱'}
            </button>

            {recordedNotes.length > 0 && !isRecording && (
              <button
                type="button"
                data-testid="instrument-playback-btn"
                onClick={() => handlePlayRecordedNotes(recordedNotes, '刚录制的乐谱')}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 cursor-pointer"
              >
                ▶ 回放录音 ({recordedNotes.length}音)
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
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-amber-200 hover:text-white cursor-pointer"
            >
              乐谱JSON
            </button>

            <button
              type="button"
              data-testid="instrument-auto-melody-btn"
              onClick={handleToggleAutoMelody}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isAutoPlaying
                  ? 'bg-rose-500 text-white'
                  : 'bg-sky-400 text-slate-950 hover:bg-sky-300'
              }`}
            >
              {isAutoPlaying
                ? `■ 停止演奏 ${activeSongTitle || ''}`
                : '▶ 自动《云野星光曲》'}
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

        {/* Stage 5: Saved Cloud Songbook & Audio Mixer Bar */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-amber-200">📚 云端乐谱库：</span>
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
                className="w-14 accent-amber-300 cursor-pointer"
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
                className="w-14 accent-sky-300 cursor-pointer"
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
                className="w-14 accent-emerald-300 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Optional Sheet Music JSON Import/Share Drawer */}
        {sheetJsonModal && (
          <div className="mb-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
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

        {/* Authentic 3x5 Sky Diamond / Circle / Square Key Matrix */}
        <div className="grid grid-cols-5 gap-2">
          {SKY_15_NOTES.map((note) => {
            const active = lastActiveIndex === note.index;
            return (
              <button
                key={note.index}
                type="button"
                data-testid={`instrument-note-${note.index}`}
                onClick={() => triggerNote(note)}
                aria-label={`弹奏音符 ${note.label} ${note.solfege}`}
                className={`h-13 rounded-xl border flex flex-col items-center justify-center transition-transform active:scale-90 cursor-pointer ${
                  active
                    ? 'border-amber-200 bg-amber-300/30 text-amber-100 scale-95'
                    : 'border-amber-200/25 bg-slate-900/90 hover:border-amber-300/60 text-amber-100'
                }`}
              >
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
                        stroke="#FDE047"
                        strokeWidth="1.8"
                      />
                      <polygon
                        points="12,5 19,12 12,19 5,12"
                        fill={active ? '#FDE047' : 'none'}
                        stroke="#FEF08A"
                        strokeWidth="1.6"
                      />
                    </>
                  )}
                  {note.shape === 'diamond' && (
                    <polygon
                      points="12,3 21,12 12,21 3,12"
                      fill={active ? '#38BDF8' : 'none'}
                      stroke="#7DD3FC"
                      strokeWidth="1.8"
                    />
                  )}
                  {note.shape === 'circle' && (
                    <circle
                      cx="12"
                      cy="12"
                      r="7.5"
                      fill={active ? '#FDE68A' : 'none'}
                      stroke="#FDE68A"
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

