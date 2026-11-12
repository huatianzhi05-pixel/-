// Zero-404 Procedural Web Audio Synthesizer for Glimmer Travelers (微光旅人)

export type InstrumentVoice =
  | 'piano'
  | 'harp'
  | 'flute'
  | 'xylophone'
  | 'wind_chime'
  | 'music_box'
  | 'drum'
  | 'kalimba';
export type CallVoiceType = 'default' | 'manta' | 'jellyfish' | 'bell';

export interface AudioMixerSettings {
  masterVolume: number; // 0..1
  bgmVolume: number; // 0..1
  sfxVolume: number; // 0..1
  instrumentVolume: number; // 0..1
}

class SkyAudioEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;
  public callVoice: CallVoiceType = 'default';
  public masterVolume: number = 0.85;
  public bgmVolume: number = 0.75;
  public sfxVolume: number = 0.9;
  public instrumentVolume: number = 0.95;

  private bgmTimer: number | null = null;
  private bgmStep: number = 0;
  private bgmBaseFreq: number = 293.66; // D4 (Prairie key center)
  private bgmTempoMult: number = 1.0;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (mute) {
      this.stopAmbientMusic();
    } else {
      this.startAmbientMusic();
    }
  }

  public setMixerVolumes(partial: Partial<AudioMixerSettings>) {
    if (typeof partial.masterVolume === 'number') {
      this.masterVolume = Math.max(0, Math.min(1, partial.masterVolume));
    }
    if (typeof partial.bgmVolume === 'number') {
      this.bgmVolume = Math.max(0, Math.min(1, partial.bgmVolume));
    }
    if (typeof partial.sfxVolume === 'number') {
      this.sfxVolume = Math.max(0, Math.min(1, partial.sfxVolume));
    }
    if (typeof partial.instrumentVolume === 'number') {
      this.instrumentVolume = Math.max(0, Math.min(1, partial.instrumentVolume));
    }
  }

  public getMixerVolumes(): AudioMixerSettings {
    return {
      masterVolume: this.masterVolume,
      bgmVolume: this.bgmVolume,
      sfxVolume: this.sfxVolume,
      instrumentVolume: this.instrumentVolume,
    };
  }

  // Stage 3 & 5: Generative Ambient Soundtrack (云野治愈竖琴与长笛风铃配乐)
  public setMusicContext(baseFreq = 293.66, tempoMultiplier = 1.0) {
    this.bgmBaseFreq = baseFreq;
    this.bgmTempoMult = Math.max(0.7, Math.min(1.3, tempoMultiplier));
  }

  public startAmbientMusic() {
    if (this.muted || typeof window === 'undefined') return;
    if (this.bgmTimer !== null) return;

    // Pentatonic & Major-9th intervals relative to realm root note
    const arpRatios = [1.0, 1.125, 1.25, 1.5, 1.667, 2.0, 1.5, 1.25];
    const fluteMelodyRatios = [2.0, 2.25, 2.5, 3.0, 2.5, 2.0, 1.667, 1.5];

    const scheduleNextNote = () => {
      if (this.muted) {
        this.bgmTimer = null;
        return;
      }
      const ctx = this.ensureContext();
      const bgmGainScale = this.masterVolume * this.bgmVolume;
      if (ctx && bgmGainScale > 0.01) {
        const now = ctx.currentTime;
        const step = this.bgmStep++;
        const ratio = arpRatios[step % arpRatios.length];
        const freq = this.bgmBaseFreq * ratio;

        // 1. Soft Harp Pluck Arpeggio
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.0005, now);
        gain.gain.linearRampToValueAtTime(0.036 * bgmGainScale, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 1.85);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.9);

        // 2. Every 4th beat: Warm Pad Root / Fifth Drone & Celestial Flute Motif
        if (step % 4 === 0) {
          const fluteRatio =
            fluteMelodyRatios[Math.floor(step / 4) % fluteMelodyRatios.length];
          const fluteOsc = ctx.createOscillator();
          const fluteGain = ctx.createGain();
          fluteOsc.type = 'sine';
          fluteOsc.frequency.setValueAtTime(this.bgmBaseFreq * fluteRatio, now + 0.12);
          fluteGain.gain.setValueAtTime(0.0005, now + 0.12);
          fluteGain.gain.linearRampToValueAtTime(0.028 * bgmGainScale, now + 0.45);
          fluteGain.gain.exponentialRampToValueAtTime(0.0005, now + 2.6);
          fluteOsc.connect(fluteGain);
          fluteGain.connect(ctx.destination);
          fluteOsc.start(now + 0.12);
          fluteOsc.stop(now + 2.65);
        }
      }

      const intervalMs = Math.round(920 / this.bgmTempoMult);
      this.bgmTimer = window.setTimeout(scheduleNextNote, intervalMs);
    };

    this.bgmTimer = window.setTimeout(scheduleNextNote, 300);
  }

  public stopAmbientMusic() {
    if (this.bgmTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // Stage 5: 光之子呼唤声 (Honk / Call Resonance with pitch, duration, deep-call sub-harmonic & 4 timbres)
  public playSkyCall(
    pitchMultiplier = 1.0,
    durationSec = 0.85,
    isDeepCall = false,
    voiceOverride?: CallVoiceType
  ) {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    const voice = voiceOverride || this.callVoice;
    const now = ctx.currentTime;
    const dur = Math.max(0.45, Math.min(2.2, durationSec));
    const baseFreq = 523.25 * pitchMultiplier; // C5

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    if (voice === 'manta') {
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq * 0.75, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.18, now + dur * 0.45);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.92, now + dur);
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.1, now + dur);
    } else if (voice === 'jellyfish') {
      // Stage 5: Ethereal Jellyfish Shimmering Vibrato Call
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(baseFreq * 1.08, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.42, now + dur * 0.35);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.18, now + dur);
      osc2.frequency.setValueAtTime(baseFreq * 2.16, now);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.84, now + dur * 0.5);
    } else if (voice === 'bell') {
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq * 1.25, now);
      osc2.frequency.setValueAtTime(baseFreq * 2.5, now);
    } else {
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(baseFreq * 0.92, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.06, now + 0.14);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq, now + dur * 0.8);
      osc2.frequency.setValueAtTime(baseFreq * 1.84, now);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.0, now + dur * 0.8);
    }

    const peakGain = (isDeepCall ? 0.24 : 0.18) * sfxScale;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + dur);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur + 0.04);
    osc2.stop(now + dur + 0.04);

    // Charged Deep Call adds a warm octave-fifth resonance chord burst!
    if (isDeepCall) {
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(baseFreq * 0.5, now);
      subOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, now + dur);
      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.14 * sfxScale, now + 0.12);
      subGain.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.25);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + dur + 0.3);
    }
  }

  // 振翅飞行音效 (Wing Flap)
  public playWingFlap() {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const pitchVar = 0.95 + Math.random() * 0.12;
    osc.frequency.setValueAtTime(220 * pitchVar, now);
    osc.frequency.exponentialRampToValueAtTime(440 * pitchVar, now + 0.18);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11 * sfxScale, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // 轻盈落地音效 (Landing Step)
  public playLandStep() {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.11);

    gain.gain.setValueAtTime(0.07 * sfxScale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // 烛火点燃与收集音效 (Candle Ignite Chime)
  public playCandleIgnite() {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.065;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12 * sfxScale, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.48);
    });
  }

  // 吸收光之翼或唤醒先祖圣咏 (Winged Light / Spirit Resonance Fanfare)
  public playWingedLightAbsorb() {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    const chord = [261.63, 329.63, 392.0, 493.88, 587.33, 783.99];
    chord.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.11 * sfxScale, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.3);
    });
  }

  // 冥龙探照锁定或危险预警低音 (Krill / Storm Warning)
  public playHazardAlert() {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.45);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09 * sfxScale, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.52);
  }

  // 15键乐器弹奏 (8 Timbres: Piano / Harp / Flute / Xylophone / Wind Chime / Music Box / Drum / Kalimba)
  public playInstrumentNote(
    freq: number,
    instrument: InstrumentVoice = 'piano',
    volumeMult = 1.0
  ) {
    const ctx = this.ensureContext();
    const instScale = this.masterVolume * this.instrumentVolume * Math.max(0.1, Math.min(1.5, volumeMult));
    if (!ctx || instScale <= 0.01) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    let stopAfterSec = 1.5;

    if (instrument === 'piano') {
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 2, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.16 * instScale, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.1);
      stopAfterSec = 1.2;
    } else if (instrument === 'harp') {
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 1.5, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15 * instScale, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.35);
      stopAfterSec = 1.45;
    } else if (instrument === 'flute') {
      // 星语长笛: Soft breathy attack + warm harmonic vibrato & sustained air resonance
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(freq * 0.992, now);
      osc1.frequency.exponentialRampToValueAtTime(freq * 1.004, now + 0.16);
      osc1.frequency.exponentialRampToValueAtTime(freq * 0.998, now + 0.45);
      osc1.frequency.exponentialRampToValueAtTime(freq * 1.003, now + 0.85);
      osc2.frequency.setValueAtTime(freq * 2.0, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15 * instScale, now + 0.085);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.55);
      stopAfterSec = 1.65;
    } else if (instrument === 'xylophone') {
      // 森灵木琴: Crisp wooden mallet attack (1x fundamental + 4x marimba harmonic) & warm hollow decay
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 4.0, now);
      osc2.frequency.exponentialRampToValueAtTime(freq * 3.96, now + 0.12);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.21 * instScale, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.55);
      stopAfterSec = 0.65;
    } else if (instrument === 'wind_chime') {
      // 云端风铃: Shimmering crystal/metallic chime (1x + 2.76x bell partial + 5.4x sparkle)
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq * 1.5, now);
      osc2.frequency.setValueAtTime(freq * 2.76, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.13 * instScale, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.85);
      stopAfterSec = 1.95;

      // Secondary high-sparkle wind chime partial
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq * 4.15, now + 0.02);
      chimeGain.gain.setValueAtTime(0.0005, now + 0.02);
      chimeGain.gain.linearRampToValueAtTime(0.06 * instScale, now + 0.035);
      chimeGain.gain.exponentialRampToValueAtTime(0.0005, now + 1.25);
      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(now + 0.02);
      chimeOsc.stop(now + 1.3);
    } else if (instrument === 'music_box') {
      // 星河八音盒: Delicate silver tine pluck with crystal octave shimmer
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq * 2.0, now);
      osc2.frequency.setValueAtTime(freq * 4.0, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14 * instScale, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.25);
      stopAfterSec = 1.35;
    } else if (instrument === 'drum') {
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq * 0.65, now);
      osc1.frequency.exponentialRampToValueAtTime(freq * 0.22, now + 0.22);
      osc2.frequency.setValueAtTime(freq * 1.3, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22 * instScale, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.42);
      stopAfterSec = 0.5;
    } else {
      // Kalimba bell
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 3, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14 * instScale, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.75);
      stopAfterSec = 0.85;
    }

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + stopAfterSec);
    osc2.stop(now + stopAfterSec);
  }
}

export const skyAudio = new SkyAudioEngine();

