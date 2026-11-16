// Zero-404 Procedural Web Audio Synthesizer, 3D Spatial Soundscape & Generative Music Engine for Glimmer Travelers (微光旅人)
import {
  AcousticSoundscapeProfile,
  DynamicAudioMixEvaluation,
  DynamicMusicMood,
  SpatialAudioEvaluation,
  computeDynamicAudioMixBalancePure,
  computeGenerativeMusicStepPure,
} from './rules';

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
  ambientVolume: number; // 0..1
  sfxVolume: number; // 0..1
  instrumentVolume: number; // 0..1
}

class SkyAudioEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;
  public callVoice: CallVoiceType = 'default';
  public masterVolume: number = 0.85;
  public bgmVolume: number = 0.75;
  public ambientVolume: number = 0.8;
  public sfxVolume: number = 0.9;
  public instrumentVolume: number = 0.95;

  private bgmTimer: number | null = null;
  private bgmStep: number = 0;
  private bgmBaseFreq: number = 293.66; // D4 (Prairie key center)
  private bgmTempoMult: number = 1.0;
  private bgmMood: DynamicMusicMood = 'calm_explore';

  // Acoustic Space Reverb / Echo Bus Nodes
  private reverbInputNode: GainNode | null = null;
  private reverbDelayNode: DelayNode | null = null;
  private reverbFeedbackGain: GainNode | null = null;
  private reverbFilterNode: BiquadFilterNode | null = null;
  private reverbWetGainNode: GainNode | null = null;

  // Continuous Flight Wind & Regional Ambience Nodes
  private windNoiseSource: AudioBufferSourceNode | null = null;
  private windFilterNode: BiquadFilterNode | null = null;
  private windGainNode: GainNode | null = null;
  private waterFilterNode: BiquadFilterNode | null = null;
  private waterGainNode: GainNode | null = null;

  // Live Soundscape & Anti-Masking Ducking State
  private currentSoundscape: AcousticSoundscapeProfile | null = null;
  private currentMixEval: DynamicAudioMixEvaluation | null = null;
  private recentImportantSfxTimerSec: number = 0;
  private birdAndEmitterTimerSec: number = 0;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && !this.reverbInputNode) {
      this.initAcousticReverbAndContinuousBuses(this.ctx);
    }
    return this.ctx;
  }

  private initAcousticReverbAndContinuousBuses(ctx: AudioContext) {
    try {
      // 1. Acoustic Space Reverb / Echo Feedback Network (Cavern / Valley / Sanctuary)
      const revIn = ctx.createGain();
      const delay = ctx.createDelay(1.0);
      const feedback = ctx.createGain();
      const dampingFilter = ctx.createBiquadFilter();
      const wetOut = ctx.createGain();

      delay.delayTime.value = 0.16;
      feedback.gain.value = 0.36;
      dampingFilter.type = 'lowpass';
      dampingFilter.frequency.value = 2800;
      wetOut.gain.value = 0.24;

      revIn.connect(delay);
      delay.connect(dampingFilter);
      dampingFilter.connect(feedback);
      feedback.connect(delay);
      dampingFilter.connect(wetOut);
      wetOut.connect(ctx.destination);

      this.reverbInputNode = revIn;
      this.reverbDelayNode = delay;
      this.reverbFeedbackGain = feedback;
      this.reverbFilterNode = dampingFilter;
      this.reverbWetGainNode = wetOut;

      // 2. Looping Pink/Warm Noise Buffer for Dynamic Flight Wind & Water Stream
      const sampleRate = ctx.sampleRate || 44100;
      const bufLen = sampleRate * 3;
      const noiseBuf = ctx.createBuffer(1, bufLen, sampleRate);
      const data = noiseBuf.getChannelData(0);
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      for (let i = 0; i < bufLen; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + white * 0.029;
        b1 = 0.985 * b1 + white * 0.032;
        b2 = 0.95 * b2 + white * 0.048;
        data[i] = (b0 + b1 + b2) * 0.35;
      }

      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      noiseSrc.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.value = 420;
      windFilter.Q.value = 1.4;

      const windGain = ctx.createGain();
      windGain.gain.value = 0.0001;

      const waterFilter = ctx.createBiquadFilter();
      waterFilter.type = 'bandpass';
      waterFilter.frequency.value = 680;
      waterFilter.Q.value = 2.2;

      const waterGain = ctx.createGain();
      waterGain.gain.value = 0.0001;

      noiseSrc.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(ctx.destination);

      noiseSrc.connect(waterFilter);
      waterFilter.connect(waterGain);
      waterGain.connect(ctx.destination);

      noiseSrc.start();

      this.windNoiseSource = noiseSrc;
      this.windFilterNode = windFilter;
      this.windGainNode = windGain;
      this.waterFilterNode = waterFilter;
      this.waterGainNode = waterGain;
    } catch {
      // Safe fallback in headless or restricted Web Audio environments
    }
  }

  private connectWithSpaceReverb(
    ctx: AudioContext,
    sourceNode: AudioNode,
    reverbSendRatio = 0.5
  ) {
    sourceNode.connect(ctx.destination);
    if (this.reverbInputNode && reverbSendRatio > 0.05) {
      sourceNode.connect(this.reverbInputNode);
    }
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (mute) {
      this.stopAmbientMusic();
      if (this.windGainNode && this.ctx) {
        this.windGainNode.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.08);
      }
      if (this.waterGainNode && this.ctx) {
        this.waterGainNode.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.08);
      }
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
    if (typeof partial.ambientVolume === 'number') {
      this.ambientVolume = Math.max(0, Math.min(1, partial.ambientVolume));
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
      ambientVolume: this.ambientVolume,
      sfxVolume: this.sfxVolume,
      instrumentVolume: this.instrumentVolume,
    };
  }

  public getLatestSoundscapeSnapshot(): {
    soundscape: AcousticSoundscapeProfile | null;
    mix: DynamicAudioMixEvaluation | null;
  } {
    return {
      soundscape: this.currentSoundscape,
      mix: this.currentMixEval,
    };
  }

  /**
   * Module 10: Real-time 3D Soundscape, Reverb Adaptation, Flight Wind & Spatial Emitter Step
   * Called each frame / HUD tick from the main loop.
   */
  public updateContinuousSoundscape(
    dt: number,
    soundscape: AcousticSoundscapeProfile,
    params: {
      grounded: boolean;
      horizSpeed: number;
      vy: number;
      isDiving: boolean;
      inCloudBank: boolean;
      isPlayingInstrument: boolean;
    }
  ) {
    this.currentSoundscape = soundscape;
    this.bgmMood = soundscape.musicMood;
    this.bgmBaseFreq = soundscape.rootFreqHz;

    if (this.recentImportantSfxTimerSec > 0) {
      this.recentImportantSfxTimerSec = Math.max(
        0,
        this.recentImportantSfxTimerSec - dt
      );
    }

    const mixEval = computeDynamicAudioMixBalancePure({
      masterVolume: this.masterVolume,
      bgmVolume: this.bgmVolume,
      ambientVolume: this.ambientVolume,
      sfxVolume: this.sfxVolume,
      instrumentVolume: this.instrumentVolume,
      grounded: params.grounded,
      horizSpeed: params.horizSpeed,
      vy: params.vy,
      isDiving: params.isDiving,
      inCloudBank: params.inCloudBank,
      isPlayingInstrument: params.isPlayingInstrument,
      recentImportantSfxTimerSec: this.recentImportantSfxTimerSec,
    });
    this.currentMixEval = mixEval;

    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    // 1. Adapt Acoustic Reverb & Delay to current Biome (Cavern / Valley / Meadow)
    if (
      this.reverbWetGainNode &&
      this.reverbDelayNode &&
      this.reverbFeedbackGain
    ) {
      this.reverbWetGainNode.gain.setTargetAtTime(
        soundscape.reverbWetMix01 * 0.65,
        now,
        0.25
      );
      this.reverbDelayNode.delayTime.setTargetAtTime(
        Math.max(0.06, Math.min(0.45, soundscape.echoDelayMs / 1000)),
        now,
        0.25
      );
      const fb = Math.min(0.68, 0.22 + soundscape.reverbDecaySec * 0.14);
      this.reverbFeedbackGain.gain.setTargetAtTime(fb, now, 0.25);
    }

    // 2. Modulate Continuous Aerial Flight Wind & Regional Breeze (Capped by anti-masking rule)
    if (this.windGainNode && this.windFilterNode) {
      const baseBreezeGain =
        soundscape.windLayerPresence01 * 0.035 * mixEval.effectiveAmbientGain;
      const targetWindGain = Math.max(
        0.0002,
        Math.max(baseBreezeGain, mixEval.flightWindGain01 * 0.42)
      );
      this.windGainNode.gain.setTargetAtTime(targetWindGain, now, 0.15);
      this.windFilterNode.frequency.setTargetAtTime(
        mixEval.flightWindFilterHz,
        now,
        0.15
      );
    }

    // 3. Modulate Regional Water / Rain / Stream Layer
    if (this.waterGainNode && this.waterFilterNode) {
      const nearWaterBoost =
        soundscape.nearestEmitter &&
        (soundscape.nearestEmitter.emitterKind === 'water_stream' ||
          soundscape.nearestEmitter.emitterKind === 'waterfall_cascade')
          ? soundscape.nearestEmitter.gain01 * 0.045
          : 0;
      const targetWaterGain = Math.max(
        0.0001,
        (soundscape.waterLayerPresence01 * 0.025 + nearWaterBoost) *
          mixEval.effectiveAmbientGain
      );
      this.waterGainNode.gain.setTargetAtTime(targetWaterGain, now, 0.2);
    }

    // 4. Periodic 3D Spatialized Nature & World Emitter Micro-Events (Birdsong, Cavern Drops, Wind Chimes)
    this.birdAndEmitterTimerSec += dt;
    if (this.birdAndEmitterTimerSec >= 3.4) {
      this.birdAndEmitterTimerSec = 0;
      if (soundscape.nearestEmitter && soundscape.nearestEmitter.gain01 > 0.12) {
        this.playSpatialEmitterPulse(
          soundscape.nearestEmitter,
          mixEval.effectiveAmbientGain
        );
      } else if (
        soundscape.birdsongPresence01 > 0.45 &&
        mixEval.effectiveAmbientGain > 0.05
      ) {
        this.playDistantBirdsongChirp(mixEval.effectiveAmbientGain);
      }
    }
  }

  /**
   * 3D Spatialized World Emitter Pulse (Stereo Panned + Distance Low-Pass Filtered)
   */
  private playSpatialEmitterPulse(
    emitterEval: SpatialAudioEvaluation,
    ambientBusGain: number
  ) {
    const ctx = this.ensureContext();
    if (!ctx || ambientBusGain <= 0.01) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const panner =
      typeof ctx.createStereoPanner === 'function'
        ? ctx.createStereoPanner()
        : null;

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(emitterEval.lowpassCutoffHz, now);

    if (panner) {
      panner.pan.setValueAtTime(emitterEval.panStereo, now);
    }

    const kind = emitterEval.emitterKind;
    let dur = 0.65;
    if (kind === 'cavern_crystal_spring') {
      // Crystal cavern water droplet echo
      osc.type = 'sine';
      const dropFreq = 780 + Math.random() * 240;
      osc.frequency.setValueAtTime(dropFreq, now);
      osc.frequency.exponentialRampToValueAtTime(dropFreq * 1.45, now + 0.14);
      dur = 0.35;
    } else if (kind === 'wind_chime_shrine') {
      // Glass wind chime shimmer
      osc.type = 'sine';
      const chimeNotes = [587.33, 659.25, 783.99, 880.0, 1046.5];
      const f = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
      osc.frequency.setValueAtTime(f * 1.5, now);
      dur = 0.95;
    } else if (kind === 'ancient_bell_tower') {
      // Distant resonant temple bronze bell
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(293.66, now);
      dur = 1.6;
    } else if (kind === 'manta_sanctuary_choir') {
      // Distant light manta call
      osc.type = 'sine';
      osc.frequency.setValueAtTime(392.0, now);
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.55);
      dur = 1.1;
    } else {
      // Gentle water/hearth harmonic sparkle
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440 + Math.random() * 120, now);
      dur = 0.45;
    }

    const peak = Math.min(0.065, emitterEval.gain01 * 0.055 * ambientBusGain);
    gain.gain.setValueAtTime(0.0005, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0004, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    if (panner) {
      gain.connect(panner);
      this.connectWithSpaceReverb(ctx, panner, 0.7);
    } else {
      this.connectWithSpaceReverb(ctx, gain, 0.7);
    }

    osc.start(now);
    osc.stop(now + dur + 0.04);
  }

  /**
   * Gentle Distant Meadow / Forest Songbird Two-Note Chirp with Stereo Panning
   */
  private playDistantBirdsongChirp(ambientBusGain: number) {
    const ctx = this.ensureContext();
    if (!ctx || ambientBusGain <= 0.01) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner =
      typeof ctx.createStereoPanner === 'function'
        ? ctx.createStereoPanner()
        : null;

    if (panner) {
      panner.pan.setValueAtTime((Math.random() - 0.5) * 1.4, now);
    }

    const f1 = 1567.98 * (0.95 + Math.random() * 0.12); // G6 region
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f1, now);
    osc.frequency.exponentialRampToValueAtTime(f1 * 1.18, now + 0.07);
    osc.frequency.setValueAtTime(f1 * 1.12, now + 0.11);
    osc.frequency.exponentialRampToValueAtTime(f1 * 1.32, now + 0.21);

    const peak = 0.022 * ambientBusGain;
    gain.gain.setValueAtTime(0.0004, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0004, now + 0.25);

    osc.connect(gain);
    if (panner) {
      gain.connect(panner);
      this.connectWithSpaceReverb(ctx, panner, 0.45);
    } else {
      this.connectWithSpaceReverb(ctx, gain, 0.45);
    }

    osc.start(now);
    osc.stop(now + 0.27);
  }

  // Stage 3, 5 & Module 10: Non-Repeating Generative Ambient Soundtrack (自适应治愈竖琴、长笛与和弦铺底)
  public setMusicContext(baseFreq = 293.66, tempoMultiplier = 1.0) {
    this.bgmBaseFreq = baseFreq;
    this.bgmTempoMult = Math.max(0.7, Math.min(1.3, tempoMultiplier));
  }

  public startAmbientMusic() {
    if (this.muted || typeof window === 'undefined') return;
    if (this.bgmTimer !== null) return;

    const scheduleNextNote = () => {
      if (this.muted) {
        this.bgmTimer = null;
        return;
      }
      const ctx = this.ensureContext();
      const phraseStep = computeGenerativeMusicStepPure(
        this.bgmStep++,
        this.bgmBaseFreq,
        this.bgmMood,
        this.bgmTempoMult
      );

      const bgmGainScale = this.currentMixEval
        ? this.currentMixEval.effectiveBgmGain
        : this.masterVolume * this.bgmVolume;

      if (ctx && bgmGainScale > 0.01 && !phraseStep.isRest) {
        const now = ctx.currentTime;

        // 1. Soft Harp Pluck Arpeggio (Routed through spatial reverb)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(phraseStep.harpFreqHz, now);
        gain.gain.setValueAtTime(0.0005, now);
        gain.gain.linearRampToValueAtTime(0.036 * bgmGainScale, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 1.95);
        osc.connect(gain);
        this.connectWithSpaceReverb(ctx, gain, 0.65);
        osc.start(now);
        osc.stop(now + 2.0);

        // 2. Lyrical Celestial Flute or Scenic Leitmotif Counter-Melody
        if (phraseStep.fluteFreqHz !== null) {
          const fluteOsc = ctx.createOscillator();
          const fluteGain = ctx.createGain();
          fluteOsc.type = 'sine';
          fluteOsc.frequency.setValueAtTime(phraseStep.fluteFreqHz, now + 0.14);
          fluteGain.gain.setValueAtTime(0.0005, now + 0.14);
          fluteGain.gain.linearRampToValueAtTime(
            0.026 * bgmGainScale,
            now + 0.48
          );
          fluteGain.gain.exponentialRampToValueAtTime(0.0005, now + 2.65);
          fluteOsc.connect(fluteGain);
          this.connectWithSpaceReverb(ctx, fluteGain, 0.75);
          fluteOsc.start(now + 0.14);
          fluteOsc.stop(now + 2.7);
        }

        // 3. Warm Harmonic Pad Root / Fifth Swell on phrase boundaries
        if (phraseStep.stepIndex % 5 === 0 && phraseStep.padChordFreqsHz[0]) {
          const padOsc = ctx.createOscillator();
          const padGain = ctx.createGain();
          padOsc.type = 'sine';
          padOsc.frequency.setValueAtTime(phraseStep.padChordFreqsHz[0], now);
          padGain.gain.setValueAtTime(0.0004, now);
          padGain.gain.linearRampToValueAtTime(
            0.022 * bgmGainScale,
            now + 0.85
          );
          padGain.gain.exponentialRampToValueAtTime(0.0004, now + 3.6);
          padOsc.connect(padGain);
          this.connectWithSpaceReverb(ctx, padGain, 0.8);
          padOsc.start(now);
          padOsc.stop(now + 3.65);
        }
      }

      this.bgmTimer = window.setTimeout(
        scheduleNextNote,
        phraseStep.stepDurationMs
      );
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

    this.recentImportantSfxTimerSec = Math.max(
      this.recentImportantSfxTimerSec,
      0.9
    );

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
      osc1.frequency.exponentialRampToValueAtTime(
        baseFreq * 1.18,
        now + dur * 0.45
      );
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.92, now + dur);
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.1, now + dur);
    } else if (voice === 'jellyfish') {
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(baseFreq * 1.08, now);
      osc1.frequency.exponentialRampToValueAtTime(
        baseFreq * 1.42,
        now + dur * 0.35
      );
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.18, now + dur);
      osc2.frequency.setValueAtTime(baseFreq * 2.16, now);
      osc2.frequency.exponentialRampToValueAtTime(
        baseFreq * 2.84,
        now + dur * 0.5
      );
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
      osc2.frequency.exponentialRampToValueAtTime(
        baseFreq * 2.0,
        now + dur * 0.8
      );
    }

    const peakGain = (isDeepCall ? 0.24 : 0.18) * sfxScale;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + dur);

    osc1.connect(gain);
    osc2.connect(gain);
    this.connectWithSpaceReverb(ctx, gain, 0.85);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur + 0.04);
    osc2.stop(now + dur + 0.04);

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
      this.connectWithSpaceReverb(ctx, subGain, 0.85);
      subOsc.start(now);
      subOsc.stop(now + dur + 0.3);
    }
  }

  // Module 10: 地面轻盈起跳音效 (Ground Jump Takeoff — Distinct from Aerial Wing Flap)
  public playJumpTakeoff() {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const pitchVar = 0.96 + Math.random() * 0.08;
    osc.frequency.setValueAtTime(175 * pitchVar, now);
    osc.frequency.exponentialRampToValueAtTime(330 * pitchVar, now + 0.13);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.085 * sfxScale, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.16);

    osc.connect(gain);
    this.connectWithSpaceReverb(ctx, gain, 0.35);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  // 空中振翅飞行音效 (Aerial Wing Flap)
  public playWingFlap() {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const shimmer = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    shimmer.type = 'triangle';
    const pitchVar = 0.95 + Math.random() * 0.12;
    osc.frequency.setValueAtTime(220 * pitchVar, now);
    osc.frequency.exponentialRampToValueAtTime(440 * pitchVar, now + 0.18);
    shimmer.frequency.setValueAtTime(587.33 * pitchVar, now);
    shimmer.frequency.exponentialRampToValueAtTime(880 * pitchVar, now + 0.2);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11 * sfxScale, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    shimmer.connect(gain);
    this.connectWithSpaceReverb(ctx, gain, 0.5);
    osc.start(now);
    shimmer.start(now);
    osc.stop(now + 0.25);
    shimmer.stop(now + 0.25);
  }

  // 轻盈/缓冲落地音效 (Landing Step with Impact Velocity & Surface Awareness)
  public playLandStep(
    impactSpeed = 4.0,
    surface: 'grass' | 'stone' | 'water' | 'snow' | 'sand' = 'grass'
  ) {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const impactFactor = Math.max(0.6, Math.min(1.5, Math.abs(impactSpeed) / 5.5));

    osc.type = surface === 'stone' ? 'triangle' : 'sine';
    const startFreq =
      surface === 'water' ? 280 : surface === 'stone' ? 195 : 155;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(68, now + 0.13);

    gain.gain.setValueAtTime(0.068 * impactFactor * sfxScale, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.14);

    osc.connect(gain);
    this.connectWithSpaceReverb(ctx, gain, 0.45);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Module 6 & 10: 材质与步态区分脚步音效 (Walk vs Run + Grass / Stone / Water / Snow / Sand)
  public playFootstep(
    surface: 'grass' | 'stone' | 'water' | 'snow' | 'sand' = 'grass',
    isRunning = false
  ) {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const velBoost = isRunning ? 1.28 : 0.82;
    const pitchShift = (isRunning ? 1.12 : 0.96) * (0.94 + Math.random() * 0.12);

    if (surface === 'water') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340 * pitchShift, now);
      osc.frequency.exponentialRampToValueAtTime(520 * pitchShift, now + 0.09);
      gain.gain.setValueAtTime(0.042 * velBoost * sfxScale, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.11);
    } else if (surface === 'stone') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240 * pitchShift, now);
      osc.frequency.exponentialRampToValueAtTime(
        115 * pitchShift,
        now + 0.065
      );
      gain.gain.setValueAtTime(0.048 * velBoost * sfxScale, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.075);
    } else if (surface === 'snow') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420 * pitchShift, now);
      osc.frequency.exponentialRampToValueAtTime(210 * pitchShift, now + 0.08);
      gain.gain.setValueAtTime(0.038 * velBoost * sfxScale, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.09);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(145 * pitchShift, now);
      osc.frequency.exponentialRampToValueAtTime(82 * pitchShift, now + 0.08);
      gain.gain.setValueAtTime(0.036 * velBoost * sfxScale, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.09);
    }

    osc.connect(gain);
    this.connectWithSpaceReverb(ctx, gain, 0.35);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Module 10: 社交动作与情绪互动温暖反馈音效 (Social Wave / Dance / Hand-Hold / High-Five / Hug)
  public playSocialInteractionChime(
    interactionKind: 'wave' | 'dance' | 'hand_hold' | 'high_five' | 'hug' | 'sit' = 'wave'
  ) {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    this.recentImportantSfxTimerSec = Math.max(
      this.recentImportantSfxTimerSec,
      0.8
    );

    const now = ctx.currentTime;
    const notesByKind: Record<typeof interactionKind, number[]> = {
      wave: [523.25, 659.25],
      dance: [587.33, 739.99, 880.0],
      hand_hold: [440.0, 554.37, 659.25, 880.0],
      high_five: [659.25, 987.77, 1318.51],
      hug: [392.0, 493.88, 587.33, 783.99],
      sit: [329.63, 493.88],
    };

    const freqs = notesByKind[interactionKind] || notesByKind.wave;
    freqs.forEach((f, idx) => {
      const t0 = now + idx * 0.06;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = interactionKind === 'hug' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, t0);
      g.gain.setValueAtTime(0.0008, t0);
      g.gain.linearRampToValueAtTime(0.095 * sfxScale, t0 + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0006, t0 + 0.58);
      osc.connect(g);
      this.connectWithSpaceReverb(ctx, g, 0.65);
      osc.start(t0);
      osc.stop(t0 + 0.62);
    });
  }

  // 云海擦掠与高空风圈气流共鸣音效 (Cloud Grazing & Skyward Current Whoosh Chime)
  public playCloudWhoosh(isWindRingBoost = false) {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    const baseFreq = isWindRingBoost ? 587.33 : 440.0;
    osc1.frequency.setValueAtTime(baseFreq * 0.85, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.32);
    osc2.frequency.setValueAtTime(baseFreq * 1.7, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, now + 0.36);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(
      (isWindRingBoost ? 0.11 : 0.075) * sfxScale,
      now + 0.08
    );
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.48);

    osc1.connect(gain);
    osc2.connect(gain);
    this.connectWithSpaceReverb(ctx, gain, 0.55);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  }

  // 低翼能柔和提醒星音 (Low Flight Energy Gentle Chime)
  public playLowEnergyPulse() {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(392.0, now);
    osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.28);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.065 * sfxScale, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.32);

    osc.connect(gain);
    this.connectWithSpaceReverb(ctx, gain, 0.4);
    osc.start(now);
    osc.stop(now + 0.34);
  }

  // 烛火点燃与收集音效 (Candle Ignite Chime)
  public playCandleIgnite() {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    this.recentImportantSfxTimerSec = Math.max(
      this.recentImportantSfxTimerSec,
      0.85
    );

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
      this.connectWithSpaceReverb(ctx, gain, 0.6);
      osc.start(now);
      osc.stop(now + 0.48);
    });
  }

  // 吸收光之翼或唤醒先祖圣咏 (Winged Light / Spirit Resonance Fanfare)
  public playWingedLightAbsorb() {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    this.recentImportantSfxTimerSec = Math.max(
      this.recentImportantSfxTimerSec,
      1.6
    );

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
      this.connectWithSpaceReverb(ctx, gain, 0.8);
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
    this.connectWithSpaceReverb(ctx, gain, 0.5);
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
    const instScale =
      this.masterVolume *
      this.instrumentVolume *
      Math.max(0.1, Math.min(1.5, volumeMult));
    if (!ctx || instScale <= 0.01) return;

    this.recentImportantSfxTimerSec = Math.max(
      this.recentImportantSfxTimerSec,
      1.2
    );

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
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq * 1.5, now);
      osc2.frequency.setValueAtTime(freq * 2.76, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.13 * instScale, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.85);
      stopAfterSec = 1.95;

      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq * 4.15, now + 0.02);
      chimeGain.gain.setValueAtTime(0.0005, now + 0.02);
      chimeGain.gain.linearRampToValueAtTime(0.06 * instScale, now + 0.035);
      chimeGain.gain.exponentialRampToValueAtTime(0.0005, now + 1.25);
      chimeOsc.connect(chimeGain);
      this.connectWithSpaceReverb(ctx, chimeGain, 0.75);
      chimeOsc.start(now + 0.02);
      chimeOsc.stop(now + 1.3);
    } else if (instrument === 'music_box') {
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
    this.connectWithSpaceReverb(ctx, gain, 0.7);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + stopAfterSec);
    osc2.stop(now + stopAfterSec);
  }

  // Module 6: Tier-differentiated Lumina Shard Collection & Echo Resonance Audio Feedback
  public playLuminaShardCollect(
    tier: 'dew_glimmer' | 'prism_crystal' | 'nebula_core' | 'aether_crown',
    isEchoResonance = false
  ) {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    this.recentImportantSfxTimerSec = Math.max(
      this.recentImportantSfxTimerSec,
      1.1
    );

    const now = ctx.currentTime;
    const notesByTier: Record<
      'dew_glimmer' | 'prism_crystal' | 'nebula_core' | 'aether_crown',
      number[]
    > = {
      dew_glimmer: [587.33, 880.0],
      prism_crystal: [659.25, 830.61, 1174.66],
      nebula_core: [523.25, 659.25, 783.99, 1046.5],
      aether_crown: [440.0, 554.37, 659.25, 880.0, 1108.73],
    };

    const freqs = notesByTier[tier] || notesByTier.dew_glimmer;
    const gainScale = isEchoResonance ? 0.58 : 1.0;

    freqs.forEach((f, idx) => {
      const startOffset = idx * (isEchoResonance ? 0.065 : 0.055);
      const dur = isEchoResonance ? 0.65 : 0.95 + idx * 0.12;
      const osc = ctx.createOscillator();
      const harmonic = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type =
        tier === 'aether_crown' || tier === 'nebula_core' ? 'triangle' : 'sine';
      harmonic.type = 'sine';
      osc.frequency.setValueAtTime(f, now + startOffset);
      harmonic.frequency.setValueAtTime(
        f * (isEchoResonance ? 1.5 : 2.0),
        now + startOffset
      );

      g.gain.setValueAtTime(0.0008, now + startOffset);
      g.gain.linearRampToValueAtTime(
        0.11 * gainScale * sfxScale,
        now + startOffset + 0.018
      );
      g.gain.exponentialRampToValueAtTime(0.0006, now + startOffset + dur);

      osc.connect(g);
      harmonic.connect(g);
      this.connectWithSpaceReverb(ctx, g, 0.7);
      osc.start(now + startOffset);
      harmonic.start(now + startOffset);
      osc.stop(now + startOffset + dur + 0.04);
      harmonic.stop(now + startOffset + dur + 0.04);
    });
  }

  // Module 6: Ceremonial Explorer Growth Rank-Up Chime
  public playExplorerRankUpCeremony(newRank = 2) {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    this.recentImportantSfxTimerSec = Math.max(
      this.recentImportantSfxTimerSec,
      1.8
    );

    const now = ctx.currentTime;
    const baseFreqs = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    const pitchBoost = 1 + Math.min(4, Math.max(0, newRank - 2)) * 0.04;

    baseFreqs.forEach((f, idx) => {
      const t0 = now + idx * 0.075;
      const osc = ctx.createOscillator();
      const shimmer = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'triangle';
      shimmer.type = 'sine';
      osc.frequency.setValueAtTime(f * pitchBoost, t0);
      shimmer.frequency.setValueAtTime(f * pitchBoost * 2.0, t0);

      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(0.13 * sfxScale, t0 + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0007, t0 + 1.35);

      osc.connect(g);
      shimmer.connect(g);
      this.connectWithSpaceReverb(ctx, g, 0.8);
      osc.start(t0);
      shimmer.start(t0);
      osc.stop(t0 + 1.4);
      shimmer.stop(t0 + 1.4);
    });
  }

  // Module 6: Secret Landmark & Ancient Story Mural Discovery Chime
  public playSecretLandmarkDiscover() {
    const ctx = this.ensureContext();
    const sfxScale = this.masterVolume * this.sfxVolume;
    if (!ctx || sfxScale <= 0.01) return;

    this.recentImportantSfxTimerSec = Math.max(
      this.recentImportantSfxTimerSec,
      1.4
    );

    const now = ctx.currentTime;
    const notes = [392.0, 587.33, 783.99, 1174.66];
    notes.forEach((f, idx) => {
      const t0 = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t0);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(0.1 * sfxScale, t0 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0006, t0 + 1.2);
      osc.connect(g);
      this.connectWithSpaceReverb(ctx, g, 0.8);
      osc.start(t0);
      osc.stop(t0 + 1.25);
    });
  }
}

export const skyAudio = new SkyAudioEngine();
