import {
  FlightMode,
  LocomotionMode,
  SitMode,
  computeIdleMicroBehaviorPure,
  computeOrganicFlickerPure,
} from './rules';

export interface JointPose {
  hipsY: number;
  hipsPitch: number;
  hipsRoll: number;
  hipsYawOffset: number;

  spinePitch: number;
  spineYaw: number;
  spineRoll: number;

  headPitch: number;
  headYaw: number;
  headRoll: number;

  leftThighPitch: number;
  leftThighRoll: number;
  leftKneePitch: number;
  leftAnklePitch: number;

  rightThighPitch: number;
  rightThighRoll: number;
  rightKneePitch: number;
  rightAnklePitch: number;

  leftShoulderPitch: number;
  leftShoulderRoll: number;
  leftElbowPitch: number;

  rightShoulderPitch: number;
  rightShoulderRoll: number;
  rightElbowPitch: number;

  wingFlare: number; // 0 (draped over shoulders) to 1 (spread wide in flight)
  wingStroke: number; // -1 to 1 vertical flap stroke angle
  capeBillow: number; // 0 to 1 backward wind lift
  capeSpinFlare: number; // 0 to 1 centrifugal skirt flare
  showButterflyProp: boolean;
}

export interface AnimatorInput {
  elapsed: number;
  dt: number;
  grounded: boolean;
  horizSpeed: number;
  vy: number;
  gaitPhase: number;
  flightMode: FlightMode;
  flapCooldown: number;
  turnRate: number;
  activeEmote: string | null;
  activeEmoteTimer: number;
  activeEmoteLevel?: number;
  instrumentOpen: boolean;
  locomotionMode?: LocomotionMode;
  sitMode?: SitMode;
  landingStiffTimer?: number;
  landingCushionTimer?: number;
  takeoffTimer?: number;
  flightPitchPhase?: 'none' | 'climb' | 'level' | 'descent' | 'dive';
  inCloudBank?: boolean;
  inWindTunnel?: boolean;
  /** Short timer (seconds) triggered when interacting with candles, shards, or shrines for warm reach feedback */
  interactGestureTimer?: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export function computeSkyChildPose(input: AnimatorInput): JointPose {
  const {
    elapsed,
    grounded,
    horizSpeed,
    vy,
    gaitPhase,
    flightMode,
    flapCooldown,
    turnRate,
    activeEmote,
    activeEmoteTimer,
    instrumentOpen,
  } = input;

  // Base Idle Pose: Multi-phase organic idle micro-behaviors (curious horizon glances, skyward gazes, soft weight transfer)
  const breath = Math.sin(elapsed * 2.4);
  const idleMicro = computeIdleMicroBehaviorPure(elapsed);
  const windGust = computeOrganicFlickerPure(elapsed, 1.37);

  const pose: JointPose = {
    hipsY: idleMicro.safeHipsY,
    hipsPitch: 0,
    hipsRoll: idleMicro.weightShiftRoll,
    hipsYawOffset: -idleMicro.weightShiftRoll * 0.6,

    spinePitch: 0.03 + breath * 0.022,
    spineYaw: -idleMicro.headGlanceYaw * 0.22,
    spineRoll: -idleMicro.weightShiftRoll * 0.75,

    headPitch: idleMicro.headGlancePitch - breath * 0.022,
    headYaw: idleMicro.headGlanceYaw,
    headRoll: idleMicro.headGlanceRoll,

    leftThighPitch: -0.04 - idleMicro.kneeRelaxL * 0.45,
    leftThighRoll: 0.05,
    leftKneePitch: 0.07 + idleMicro.kneeRelaxL,
    leftAnklePitch: -0.03 - idleMicro.kneeRelaxL * 0.5,

    rightThighPitch: 0.04 - idleMicro.kneeRelaxR * 0.45,
    rightThighRoll: -0.05,
    rightKneePitch: 0.07 + idleMicro.kneeRelaxR,
    rightAnklePitch: -0.03 - idleMicro.kneeRelaxR * 0.5,

    leftShoulderPitch: 0.04 + windGust.wave * 0.025,
    leftShoulderRoll: 0.16 + (breath * 0.5 + 0.5) * 0.03,
    leftElbowPitch: -0.22 - (breath * 0.5 + 0.5) * 0.04,

    rightShoulderPitch: -0.04 - windGust.wave * 0.025,
    rightShoulderRoll: -0.16 - (breath * 0.5 + 0.5) * 0.03,
    rightElbowPitch: -0.22 - (breath * 0.5 + 0.5) * 0.04,

    wingFlare: 0.08 + (breath + 1) * 0.03 + Math.max(0, windGust.wave) * 0.04,
    wingStroke: breath * 0.04,
    capeBillow: 0.09 + (windGust.wave * 0.5 + 0.5) * 0.08,
    capeSpinFlare: 0,
    showButterflyProp: false,
  };


  // 1. Ground Walk vs Run Two-Tier Multi-Joint Stride Kinematics
  if (grounded && horizSpeed > 0.12) {
    // Smooth fade-in from Idle to Walk (0.12 -> 1.8 m/s), and distinct transition from Walk to Run (4.2 -> 7.2 m/s)
    const moveBlend = Math.min(1, (horizSpeed - 0.12) / 1.6);
    const rawRunT = Math.max(0, Math.min(1, (horizSpeed - 4.2) / 2.8));
    const runRatio = rawRunT * rawRunT * (3 - 2 * rawRunT); // Smoothstep 0 (Walk) -> 1 (Run)
    const isWade = input.locomotionMode === 'wade';

    const s = Math.sin(gaitPhase);
    const c = Math.cos(gaitPhase);
    const doubleFreq = Math.cos(gaitPhase * 2);

    // Center-of-gravity vertical bounce: Walk has a soft serene wave (0.036m); Run has an energetic athletic double-bounce (0.082m)
    const bounceAmp = lerp(0.036, 0.082, runRatio) * moveBlend;
    const hipsBaseDip = lerp(0.006, 0.024, runRatio) * moveBlend;
    pose.hipsY = 0.86 + Math.abs(s) * bounceAmp - hipsBaseDip;

    // Forward posture lean: Walk stays upright & poised (0.05 rad); Run leans athletically forward (0.18 rad)
    pose.hipsPitch = lerp(0.05, 0.18, runRatio) * moveBlend;
    pose.hipsRoll =
      c * lerp(0.042, 0.075, runRatio) * moveBlend + turnRate * 0.16 * moveBlend;
    pose.hipsYawOffset = s * lerp(0.065, 0.12, runRatio) * moveBlend;

    // Spine counter-rotation, breathing cadence & natural banking into turns
    pose.spinePitch =
      (lerp(0.06, 0.22, runRatio) + doubleFreq * lerp(0.015, 0.035, runRatio)) *
      moveBlend;
    pose.spineYaw = -s * lerp(0.09, 0.17, runRatio) * moveBlend;
    pose.spineRoll = -turnRate * 0.14 * moveBlend - c * 0.025 * moveBlend;

    // Head stabilizes horizon and glances naturally into the turn arc
    pose.headPitch =
      -lerp(0.04, 0.16, runRatio) * moveBlend + doubleFreq * 0.02 * moveBlend;
    pose.headYaw = -turnRate * 0.36 * moveBlend;
    pose.headRoll = -turnRate * 0.18 * moveBlend;

    // Articulated Thigh + Knee + Ankle cycle (Wade lifts knees higher through shallow water)
    const strideAmp =
      (isWade ? 0.56 : lerp(0.46, 0.82, runRatio)) * moveBlend;
    pose.leftThighPitch = s * strideAmp;
    pose.rightThighPitch = -s * strideAmp;

    const leftSwing = Math.max(0, c);
    const rightSwing = Math.max(0, -c);
    const swingKneeLift = isWade ? 0.88 : lerp(0.52, 1.02, runRatio);
    const stanceKneeSoftness = lerp(0.12, 0.26, runRatio);
    pose.leftKneePitch =
      (0.12 + leftSwing * swingKneeLift + Math.max(0, -s) * stanceKneeSoftness) *
      moveBlend;
    pose.rightKneePitch =
      (0.12 + rightSwing * swingKneeLift + Math.max(0, s) * stanceKneeSoftness) *
      moveBlend;

    const ankleAmp = lerp(0.22, 0.38, runRatio);
    pose.leftAnklePitch = (-s * ankleAmp - leftSwing * 0.24) * moveBlend;
    pose.rightAnklePitch = (s * ankleAmp - rightSwing * 0.24) * moveBlend;

    // Opposite Arm Swing: Walk has relaxed pendulum arms; Run has energetic bent-elbow pump
    const armAmp = lerp(0.34, 0.72, runRatio) * moveBlend;
    pose.leftShoulderPitch = -s * armAmp;
    pose.rightShoulderPitch = s * armAmp;
    pose.leftShoulderRoll = 0.16 + lerp(0.05, 0.15, runRatio) * moveBlend;
    pose.rightShoulderRoll = -0.16 - lerp(0.05, 0.15, runRatio) * moveBlend;

    const baseElbow = lerp(-0.26, -0.42, runRatio);
    const swingElbowFlex = lerp(0.24, 0.56, runRatio);
    pose.leftElbowPitch =
      baseElbow - Math.max(0, -s) * swingElbowFlex * moveBlend;
    pose.rightElbowPitch =
      baseElbow - Math.max(0, s) * swingElbowFlex * moveBlend;

    pose.wingFlare = (0.14 + lerp(0.08, 0.32, runRatio)) * moveBlend;
    pose.capeBillow = lerp(0.20, 0.52, runRatio) * moveBlend;
    pose.wingStroke = doubleFreq * lerp(0.035, 0.09, runRatio) * moveBlend;
  }

  // 2. Aerial Takeoff, Gliding (Climb / Level / Descent), Hover & Delta-Wing Dive Kinematics
  if (!grounded) {
    const isDiving =
      input.locomotionMode === 'dive' || input.flightPitchPhase === 'dive';
    const isGliding = flightMode === 'glide' || isDiving;
    const isFlapping = flapCooldown > 0;
    const takeoffBlend = Math.max(
      0,
      Math.min(1, (input.takeoffTimer ?? 0) / 0.28)
    );
    const flapWave = isFlapping
      ? Math.sin((0.22 - flapCooldown) * 28.0)
      : Math.sin(elapsed * 4.2);

    if (isDiving) {
      // Stage 2 Aerodynamic Delta-Wing Dive Pose (swept-back wings, streamlined legs, high speed)
      pose.hipsY = 0.90;
      pose.hipsPitch = 0.85;
      pose.hipsRoll = turnRate * 0.48;
      pose.spinePitch = 0.42;
      pose.spineYaw = -turnRate * 0.18;
      pose.spineRoll = -turnRate * 0.25;
      pose.headPitch = -0.58;
      pose.headYaw = -turnRate * 0.28;
      pose.headRoll = -turnRate * 0.18;

      pose.leftThighPitch = 0.55;
      pose.leftKneePitch = 0.12;
      pose.leftAnklePitch = 0.65;
      pose.rightThighPitch = 0.55;
      pose.rightKneePitch = 0.12;
      pose.rightAnklePitch = 0.65;

      // Swept-back delta arrow wings with asymmetric turn banking
      pose.leftShoulderRoll = 0.68 + turnRate * 0.18;
      pose.rightShoulderRoll = -0.68 + turnRate * 0.18;
      pose.leftShoulderPitch = 0.62;
      pose.rightShoulderPitch = 0.62;
      pose.leftElbowPitch = -0.08;
      pose.rightElbowPitch = -0.08;

      pose.wingFlare = 0.64;
      pose.wingStroke = -0.18;
      pose.capeBillow = 1.0;
    } else {
      // Distinguish Climb (+vy), Weightless Level/Apex (|vy| <= 1.8), and Descent (-vy)
      const ascentT = Math.max(0, Math.min(1, (vy - 1.2) / 5.5));
      const fallT = Math.max(0, Math.min(1, (-vy - 1.2) / 7.5));
      const airSway = Math.sin(elapsed * 3.2) * 0.07;

      pose.hipsY =
        0.92 + ascentT * 0.035 - fallT * 0.02 + takeoffBlend * 0.04;

      if (isGliding) {
        // Distinct Glide Climb vs Level Cruise vs Aerodynamic Glide Descent postures
        pose.hipsPitch =
          lerp(0.56, 0.30, ascentT) +
          fallT * 0.24 -
          takeoffBlend * 0.14;
        pose.spinePitch =
          lerp(0.26, 0.12, ascentT) +
          fallT * 0.16 -
          takeoffBlend * 0.12;
        pose.headPitch =
          lerp(-0.44, -0.58, ascentT) + fallT * 0.08;
      } else {
        pose.hipsPitch =
          lerp(0.18, 0.06, ascentT) +
          fallT * 0.06 -
          takeoffBlend * 0.10;
        pose.spinePitch =
          lerp(0.12, 0.02, ascentT) +
          fallT * 0.08 -
          takeoffBlend * 0.12;
        pose.headPitch = -0.18 - ascentT * 0.10 + fallT * 0.12;
      }

      // Expressive body, spine, and head banking into aerial turns
      pose.hipsRoll = turnRate * (isGliding ? 0.42 : 0.32);
      pose.spineYaw = -turnRate * 0.18;
      pose.spineRoll = -turnRate * (isGliding ? 0.24 : 0.16);
      pose.headYaw = -turnRate * 0.32;
      pose.headRoll = -turnRate * 0.20;

      // Iconic Sky Aerial & Glide Leg Pose:
      // - Takeoff / Climb: front knee tucked higher in graceful leap, back leg trailing
      // - Level Glide: streamlined floating trail with gentle knee asymmetry
      // - Descent: both legs extending softly into aerodynamic slipstream
      const glideLeftThigh = lerp(0.32, 0.16, ascentT) + fallT * 0.14;
      const glideRightThigh = lerp(0.48, 0.38, ascentT) + fallT * 0.08;
      pose.leftThighPitch =
        (isGliding
          ? glideLeftThigh
          : lerp(0.22, -0.28, ascentT) * (1 - fallT * 0.5)) -
        takeoffBlend * 0.22 +
        airSway;
      pose.leftKneePitch = isGliding
        ? lerp(0.42, 0.68, Math.max(ascentT, takeoffBlend)) * (1 - fallT * 0.35)
        : lerp(0.68, 0.94, Math.max(ascentT, takeoffBlend)) * (1 - fallT * 0.35);
      pose.leftAnklePitch = lerp(0.45, -0.12, fallT);

      pose.rightThighPitch =
        (isGliding
          ? glideRightThigh
          : lerp(0.08, 0.24, ascentT) * (1 - fallT * 0.6)) -
        airSway;
      pose.rightKneePitch = isGliding
        ? lerp(0.18, 0.26, ascentT) * (1 - fallT * 0.25)
        : lerp(0.35, 0.22, ascentT) + fallT * 0.12;
      pose.rightAnklePitch = lerp(0.55, -0.08, fallT);

      // Arms spread wide beneath cape like wings, with asymmetric turn banking!
      const strokeAngle = isFlapping
        ? flapWave * 0.74
        : takeoffBlend > 0
          ? Math.sin(takeoffBlend * Math.PI) * 0.48
          : flapWave * 0.15;
      const wingBankOffset = turnRate * (isGliding ? 0.22 : 0.14);
      const baseShoulderRoll = isGliding
        ? 1.28 - fallT * 0.08 + ascentT * 0.05
        : 1.05 + fallT * 0.12 + takeoffBlend * 0.18;

      pose.leftShoulderRoll =
        baseShoulderRoll + strokeAngle * 0.45 + wingBankOffset;
      pose.rightShoulderRoll =
        -baseShoulderRoll - strokeAngle * 0.45 + wingBankOffset;

      const glideShoulderSweep =
        lerp(0.24, 0.06, ascentT) + fallT * 0.18;
      pose.leftShoulderPitch = isGliding
        ? glideShoulderSweep
        : 0.1 - ascentT * 0.18 - takeoffBlend * 0.12;
      pose.rightShoulderPitch = isGliding
        ? glideShoulderSweep
        : 0.1 - ascentT * 0.18 - takeoffBlend * 0.12;
      pose.leftElbowPitch = -0.15 - ascentT * 0.12;
      pose.rightElbowPitch = -0.15 - ascentT * 0.12;

      pose.wingFlare = isGliding
        ? 0.98
        : Math.min(0.98, 0.82 + fallT * 0.08 + takeoffBlend * 0.14);
      pose.wingStroke = strokeAngle;
      pose.capeBillow = Math.min(
        1,
        (isGliding ? 0.72 : 0.60) +
          Math.max(0, -vy) * 0.045 +
          takeoffBlend * 0.18 +
          (input.inCloudBank ? 0.12 : 0)
      );
    }
  }

  // 3. Stage 1 Ground Special States: Slope Sliding, High-Landing Stiffness, Soft Jump/Glide Landing Cushion, Sitting & Shrine Meditation
  if (grounded && input.locomotionMode === 'slide') {
    // Dynamic surfing / ski stance down steep slopes
    pose.hipsY = 0.72;
    pose.hipsPitch = 0.24;
    pose.hipsYawOffset = 0.38;
    pose.spinePitch = 0.22;
    pose.spineYaw = -0.32;
    pose.leftThighPitch = -0.58;
    pose.leftKneePitch = 0.92;
    pose.rightThighPitch = 0.35;
    pose.rightKneePitch = 0.65;
    pose.leftShoulderRoll = 0.85;
    pose.rightShoulderRoll = -0.85;
    pose.wingFlare = 0.55;
    pose.capeBillow = 0.78;
  } else if (grounded && (input.landingStiffTimer ?? 0) > 0) {
    // High-fall landing recovery crouch (absorbs impact gracefully without dying)
    const stiffBlend = Math.min(1, (input.landingStiffTimer ?? 0) * 3.0);
    pose.hipsY = lerp(pose.hipsY, 0.58, stiffBlend);
    pose.hipsPitch = lerp(pose.hipsPitch, 0.32, stiffBlend);
    pose.spinePitch = lerp(pose.spinePitch, 0.38, stiffBlend);
    pose.headPitch = lerp(pose.headPitch, 0.25, stiffBlend);
    pose.leftThighPitch = lerp(pose.leftThighPitch, -0.85, stiffBlend);
    pose.leftKneePitch = lerp(pose.leftKneePitch, 1.45, stiffBlend);
    pose.rightThighPitch = lerp(pose.rightThighPitch, -0.85, stiffBlend);
    pose.rightKneePitch = lerp(pose.rightKneePitch, 1.45, stiffBlend);
    pose.leftShoulderRoll = lerp(pose.leftShoulderRoll, 0.55, stiffBlend);
    pose.rightShoulderRoll = lerp(pose.rightShoulderRoll, -0.55, stiffBlend);
    pose.wingFlare = Math.max(pose.wingFlare, stiffBlend * 0.48);
    pose.capeBillow = 0.45;
  } else if (grounded && (input.landingCushionTimer ?? 0) > 0) {
    // Normal jump / glide touchdown elastic knee-bend landing cushion + progressive wing-folding (calibrated to prevent ground clipping)
    const normT = Math.max(0, Math.min(1, (input.landingCushionTimer ?? 0) / 0.28));
    const cushionBell = Math.sin(normT * Math.PI); // 0 -> 1 -> 0 elastic compression curve
    pose.hipsY = Math.max(0.76, pose.hipsY - cushionBell * 0.095);
    pose.hipsPitch += cushionBell * 0.09;
    pose.spinePitch += cushionBell * 0.11;
    pose.headPitch += cushionBell * 0.06;
    pose.leftThighPitch -= cushionBell * 0.30;
    pose.leftKneePitch += cushionBell * 0.50;
    pose.leftAnklePitch -= cushionBell * 0.20;
    pose.rightThighPitch -= cushionBell * 0.30;
    pose.rightKneePitch += cushionBell * 0.50;
    pose.rightAnklePitch -= cushionBell * 0.20;
    pose.leftShoulderRoll += cushionBell * 0.26 + normT * 0.22;
    pose.rightShoulderRoll -= cushionBell * 0.26 + normT * 0.22;
    pose.wingFlare = Math.max(pose.wingFlare, normT * 0.64);
    pose.capeBillow = Math.max(pose.capeBillow, cushionBell * 0.42);
  } else if (grounded && input.sitMode && input.sitMode !== 'none') {
    if (input.sitMode === 'meditate_shrine') {
      // Cross-legged lotus meditation at the shrine with gentle levitation bob
      pose.hipsY = 0.48 + Math.sin(elapsed * 2.2) * 0.03;
      pose.hipsPitch = 0;
      pose.spinePitch = 0.06;
      pose.headPitch = 0.18;
      pose.leftThighPitch = -1.15;
      pose.leftThighRoll = 0.55;
      pose.leftKneePitch = 1.65;
      pose.rightThighPitch = -1.15;
      pose.rightThighRoll = -0.55;
      pose.rightKneePitch = 1.65;
      pose.leftShoulderPitch = -0.35;
      pose.rightShoulderPitch = -0.35;
      pose.leftElbowPitch = -0.95;
      pose.rightElbowPitch = -0.95;
      pose.wingFlare = 0.25;
      pose.capeBillow = 0.22;
    } else if (input.sitMode === 'sit_bench') {
      // Seated side-by-side on the stone chat bench with legs bent 90 deg forward
      pose.hipsY = 0.56;
      pose.hipsPitch = 0;
      pose.spinePitch = 0.04;
      pose.headYaw = 0.25 + Math.sin(elapsed * 1.2) * 0.12; // Glance warmly toward bench partner
      pose.leftThighPitch = -1.25;
      pose.leftKneePitch = 1.25;
      pose.rightThighPitch = -1.25;
      pose.rightKneePitch = 1.25;
      pose.leftShoulderPitch = -0.15;
      pose.rightShoulderPitch = -0.15;
      pose.leftElbowPitch = -0.55;
      pose.rightElbowPitch = -0.55;
      pose.capeBillow = 0.18;
    } else {
      // Casual ground sit with knees hugged gently
      pose.hipsY = 0.46;
      pose.hipsPitch = -0.08;
      pose.spinePitch = 0.12;
      pose.leftThighPitch = -1.1;
      pose.leftKneePitch = 1.35;
      pose.rightThighPitch = -0.95;
      pose.rightKneePitch = 1.15;
      pose.leftShoulderPitch = -0.35;
      pose.rightShoulderPitch = -0.35;
      pose.leftElbowPitch = -0.65;
      pose.rightElbowPitch = -0.65;
      pose.capeBillow = 0.15;
    }
  }

  // 4. 15-Key Musical Instrument Playing Pose
  if (instrumentOpen && grounded && horizSpeed < 0.4) {
    const musicSway = Math.sin(elapsed * 3.6);
    pose.spinePitch = 0.08;
    pose.spineRoll = musicSway * 0.05;
    pose.headPitch = 0.18;
    pose.headRoll = musicSway * 0.06;
    pose.leftShoulderPitch = -0.65 + Math.sin(elapsed * 7.0) * 0.08;
    pose.rightShoulderPitch = -0.65 + Math.cos(elapsed * 7.0) * 0.08;
    pose.leftShoulderRoll = 0.12;
    pose.rightShoulderRoll = -0.12;
    pose.leftElbowPitch = -0.82;
    pose.rightElbowPitch = -0.82;
  }

  // 4. Expressive Multi-Joint Ancestor Emote Choreographies (Stage 5: Lv.1–5 amplitude & cadence scaling)
  if (activeEmote && activeEmoteTimer > 0) {
    const emoteLv = Math.max(1, Math.min(5, input.activeEmoteLevel ?? 1));
    const lvScale = 1.0 + (emoteLv - 1) * 0.12; // Lv.1 = 1.0x up to Lv.5 = 1.48x richer motion!
    const t = elapsed * (1.0 + (emoteLv - 1) * 0.08);
    const blend = Math.min(1, activeEmoteTimer * 2.5);

    if (activeEmote === 'emote_butterfly') {
      // Extend right hand gently upward while left hand rests over heart, head gazes at perched butterfly
      pose.spinePitch = lerp(pose.spinePitch, -0.08 * lvScale, blend);
      pose.headPitch = lerp(pose.headPitch, -0.22 * lvScale, blend);
      pose.headYaw = lerp(pose.headYaw, -0.28, blend);
      pose.rightShoulderPitch = lerp(pose.rightShoulderPitch, -1.05 * lvScale, blend);
      pose.rightShoulderRoll = lerp(pose.rightShoulderRoll, -0.25 * lvScale, blend);
      pose.rightElbowPitch = lerp(
        pose.rightElbowPitch,
        -0.45 + Math.sin(t * 3) * 0.06 * lvScale,
        blend
      );
      pose.leftShoulderPitch = lerp(pose.leftShoulderPitch, -0.45, blend);
      pose.leftElbowPitch = lerp(pose.leftElbowPitch, -1.1, blend);
      pose.wingFlare = lerp(pose.wingFlare, 0.22 * lvScale, blend);
      pose.showButterflyProp = true;
    } else if (activeEmote === 'emote_spin_dance') {
      // Balletic Pirouette Leap: Passe bent knee, crown arms overhead, spinning cape flare
      pose.hipsY = lerp(pose.hipsY, 0.98 + 0.08 * lvScale + Math.sin(t * 6) * 0.08 * lvScale, blend);
      pose.hipsYawOffset = t * (7.2 + emoteLv * 1.1);
      pose.spinePitch = lerp(pose.spinePitch, -0.12 * lvScale, blend);
      pose.leftThighPitch = lerp(pose.leftThighPitch, 0.05, blend);
      pose.leftKneePitch = lerp(pose.leftKneePitch, 0.08, blend);
      pose.rightThighPitch = lerp(pose.rightThighPitch, -0.78 * lvScale, blend);
      pose.rightThighRoll = lerp(pose.rightThighRoll, -0.35, blend);
      pose.rightKneePitch = lerp(pose.rightKneePitch, 1.45, blend);
      pose.leftShoulderRoll = lerp(pose.leftShoulderRoll, 2.15 + 0.08 * emoteLv, blend);
      pose.rightShoulderRoll = lerp(pose.rightShoulderRoll, -(2.15 + 0.08 * emoteLv), blend);
      pose.leftElbowPitch = lerp(pose.leftElbowPitch, -0.55, blend);
      pose.rightElbowPitch = lerp(pose.rightElbowPitch, -0.55, blend);
      pose.wingFlare = lerp(pose.wingFlare, Math.min(1, 0.72 * lvScale), blend);
      pose.capeSpinFlare = lerp(0, Math.min(1, 0.75 * lvScale), blend);
    } else if (activeEmote === 'emote_bow_respect') {
      // Noble Sky Bow: Right hand over heart, deep waist bow, left arm swept back
      const bowCurve = Math.sin(Math.min(Math.PI, (3.5 - activeEmoteTimer) * 1.4));
      pose.hipsPitch = lerp(pose.hipsPitch, 0.42 * bowCurve * lvScale, blend);
      pose.spinePitch = lerp(pose.spinePitch, 0.48 * bowCurve * lvScale, blend);
      pose.headPitch = lerp(pose.headPitch, 0.35 * bowCurve * lvScale, blend);
      pose.rightShoulderPitch = lerp(pose.rightShoulderPitch, -0.55, blend);
      pose.rightShoulderRoll = lerp(pose.rightShoulderRoll, 0.25, blend);
      pose.rightElbowPitch = lerp(pose.rightElbowPitch, -1.35, blend);
      pose.leftShoulderPitch = lerp(pose.leftShoulderPitch, 0.42 * lvScale, blend);
      pose.leftShoulderRoll = lerp(pose.leftShoulderRoll, 0.35 * lvScale, blend);
      pose.leftKneePitch = lerp(pose.leftKneePitch, 0.18 * bowCurve * lvScale, blend);
    } else if (activeEmote === 'emote_handstand') {
      // Athletic Handstand with scissoring legs
      const scissor = Math.sin(t * 5.2) * 0.38 * lvScale;
      pose.hipsY = lerp(pose.hipsY, 1.32, blend);
      pose.hipsPitch = lerp(pose.hipsPitch, Math.PI, blend);
      pose.spinePitch = lerp(pose.spinePitch, -0.22, blend);
      pose.headPitch = lerp(pose.headPitch, -0.45, blend);
      pose.leftShoulderPitch = lerp(pose.leftShoulderPitch, -2.95, blend);
      pose.rightShoulderPitch = lerp(pose.rightShoulderPitch, -2.95, blend);
      pose.leftElbowPitch = lerp(pose.leftElbowPitch, -0.1, blend);
      pose.rightElbowPitch = lerp(pose.rightElbowPitch, -0.1, blend);
      pose.leftThighPitch = lerp(pose.leftThighPitch, scissor, blend);
      pose.rightThighPitch = lerp(pose.rightThighPitch, -scissor, blend);
      pose.leftKneePitch = lerp(pose.leftKneePitch, 0.25, blend);
      pose.rightKneePitch = lerp(pose.rightKneePitch, 0.25, blend);
    } else if (activeEmote === 'emote_cheer_jump') {
      // Joyful Starlight Jumps with arms cheering high
      const hop = Math.abs(Math.sin(t * 6.5));
      pose.hipsY = lerp(pose.hipsY, 0.86 + hop * 0.34 * lvScale, blend);
      pose.spinePitch = lerp(pose.spinePitch, -0.16 * hop * lvScale, blend);
      pose.headPitch = lerp(pose.headPitch, -0.25 * hop, blend);
      pose.leftShoulderRoll = lerp(
        pose.leftShoulderRoll,
        2.3 + Math.sin(t * 13) * 0.22 * lvScale,
        blend
      );
      pose.rightShoulderRoll = lerp(
        pose.rightShoulderRoll,
        -2.3 - Math.sin(t * 13) * 0.22 * lvScale,
        blend
      );
      pose.leftKneePitch = lerp(pose.leftKneePitch, hop * 0.85, blend);
      pose.rightKneePitch = lerp(pose.rightKneePitch, hop * 0.85, blend);
      pose.wingFlare = lerp(pose.wingFlare, Math.min(1, 0.58 * hop * lvScale), blend);
    } else if (activeEmote === 'emote_pray_star') {
      // Serene Kneeling Meditation Prayer
      pose.hipsY = lerp(pose.hipsY, 0.52 + (emoteLv >= 3 ? Math.sin(t * 2.5) * 0.04 * lvScale : 0), blend);
      pose.spinePitch = lerp(pose.spinePitch, 0.12, blend);
      pose.headPitch = lerp(pose.headPitch, 0.28, blend);
      pose.leftThighPitch = lerp(pose.leftThighPitch, -1.25, blend);
      pose.rightThighPitch = lerp(pose.rightThighPitch, -1.25, blend);
      pose.leftKneePitch = lerp(pose.leftKneePitch, 2.35, blend);
      pose.rightKneePitch = lerp(pose.rightKneePitch, 2.35, blend);
      pose.leftShoulderPitch = lerp(pose.leftShoulderPitch, -0.68, blend);
      pose.rightShoulderPitch = lerp(pose.rightShoulderPitch, -0.68, blend);
      pose.leftShoulderRoll = lerp(pose.leftShoulderRoll, -0.22, blend);
      pose.rightShoulderRoll = lerp(pose.rightShoulderRoll, 0.22, blend);
      pose.leftElbowPitch = lerp(pose.leftElbowPitch, -1.25, blend);
      pose.rightElbowPitch = lerp(pose.rightElbowPitch, -1.25, blend);
    } else if (activeEmote === 'emote_point') {
      // Pointing Forward toward the Horizon Temple
      pose.spinePitch = lerp(pose.spinePitch, -0.06 * lvScale, blend);
      pose.spineYaw = lerp(pose.spineYaw, -0.22 * lvScale, blend);
      pose.headPitch = lerp(pose.headPitch, -0.12, blend);
      pose.rightShoulderPitch = lerp(pose.rightShoulderPitch, -1.48 * Math.min(1.15, lvScale), blend);
      pose.rightShoulderRoll = lerp(pose.rightShoulderRoll, -0.12, blend);
      pose.rightElbowPitch = lerp(pose.rightElbowPitch, -0.08, blend);
      pose.leftShoulderPitch = lerp(pose.leftShoulderPitch, 0.25, blend);
      pose.wingFlare = lerp(pose.wingFlare, 0.35 * lvScale, blend);
    } else if (activeEmote === 'emote_ignite') {
      // Stage 7: Offering Red Candle forward with both hands / warm nod to ignite a stranger
      pose.spinePitch = lerp(pose.spinePitch, 0.14, blend);
      pose.headPitch = lerp(pose.headPitch, 0.12, blend);
      pose.rightShoulderPitch = lerp(pose.rightShoulderPitch, -1.18, blend);
      pose.rightShoulderRoll = lerp(pose.rightShoulderRoll, 0.12, blend);
      pose.rightElbowPitch = lerp(pose.rightElbowPitch, -0.35, blend);
      pose.leftShoulderPitch = lerp(pose.leftShoulderPitch, -0.52, blend);
      pose.leftElbowPitch = lerp(pose.leftElbowPitch, -0.95, blend);
      pose.wingFlare = lerp(pose.wingFlare, 0.28, blend);
    } else if (activeEmote === 'emote_high_five') {
      // Stage 7: Joyful High-Five Leap clapping right hand high in front
      const clapWave = Math.abs(Math.sin(t * 5.5));
      pose.hipsY = lerp(pose.hipsY, 0.88 + clapWave * 0.24, blend);
      pose.spinePitch = lerp(pose.spinePitch, -0.14, blend);
      pose.headPitch = lerp(pose.headPitch, -0.18, blend);
      pose.rightShoulderPitch = lerp(pose.rightShoulderPitch, -2.15, blend);
      pose.rightShoulderRoll = lerp(pose.rightShoulderRoll, -0.18, blend);
      pose.rightElbowPitch = lerp(pose.rightElbowPitch, -0.15, blend);
      pose.leftShoulderRoll = lerp(pose.leftShoulderRoll, 0.85, blend);
      pose.wingFlare = lerp(pose.wingFlare, 0.55, blend);
    } else if (activeEmote === 'emote_hug') {
      // Stage 7: Warm Embrace — arms wrapped forward, gentle sway, wings unfurled warmly
      const sway = Math.sin(t * 2.8) * 0.06;
      pose.spinePitch = lerp(pose.spinePitch, 0.16, blend);
      pose.spineRoll = lerp(pose.spineRoll, sway, blend);
      pose.headPitch = lerp(pose.headPitch, 0.14, blend);
      pose.headRoll = lerp(pose.headRoll, 0.18 + sway, blend);
      pose.leftShoulderPitch = lerp(pose.leftShoulderPitch, -1.25, blend);
      pose.rightShoulderPitch = lerp(pose.rightShoulderPitch, -1.25, blend);
      pose.leftShoulderRoll = lerp(pose.leftShoulderRoll, -0.38, blend);
      pose.rightShoulderRoll = lerp(pose.rightShoulderRoll, 0.38, blend);
      pose.leftElbowPitch = lerp(pose.leftElbowPitch, -0.78, blend);
      pose.rightElbowPitch = lerp(pose.rightElbowPitch, -0.78, blend);
      pose.wingFlare = lerp(pose.wingFlare, 0.65, blend);
      pose.capeBillow = lerp(pose.capeBillow, 0.35, blend);
    }
  }

  // 6. Module 11: Interactive Action Feedback (Warm Candle-Offering / Reach-Out Gesture on Interact or Shard Absorb)
  const interactTimer = input.interactGestureTimer ?? 0;
  if (interactTimer > 0 && (!activeEmote || activeEmoteTimer <= 0)) {
    const normG = Math.max(0, Math.min(1, interactTimer / 1.15));
    const gEnvelope = Math.sin(normG * Math.PI);
    pose.spinePitch = lerp(pose.spinePitch, pose.spinePitch + 0.14, gEnvelope);
    pose.headPitch = lerp(pose.headPitch, pose.headPitch + 0.10, gEnvelope);
    pose.rightShoulderPitch = lerp(pose.rightShoulderPitch, -1.24, gEnvelope);
    pose.rightShoulderRoll = lerp(pose.rightShoulderRoll, 0.14, gEnvelope);
    pose.rightElbowPitch = lerp(pose.rightElbowPitch, -0.36, gEnvelope);
    pose.leftShoulderPitch = lerp(pose.leftShoulderPitch, -0.48, gEnvelope * 0.75);
    pose.leftElbowPitch = lerp(pose.leftElbowPitch, -0.72, gEnvelope * 0.75);
    pose.wingFlare = Math.max(pose.wingFlare, 0.36 * gEnvelope);
    pose.capeBillow = Math.max(pose.capeBillow, 0.26 * gEnvelope);
  }

  return pose;
}

export interface WingTrailConfig {
  active: boolean;
  intensity: number; // 0..1 overall cloud-mist density
  spawnInterval: number; // seconds between cloud puff spawns per wingtip
  puffBaseScale: number; // base size of billowing cloud-mist puffs
  ribbonOpacity: number; // opacity of the continuous wingtip gossamer contrails
  turbulence: number; // curl/swirl strength in the wake
}

export function computeWingTrailConfig(input: {
  grounded: boolean;
  flightMode: FlightMode;
  horizSpeed: number;
  vy: number;
  flapCooldown: number;
  activeEmote: string | null;
  activeEmoteTimer: number;
  turnRate?: number;
  isDiving?: boolean;
  inCloudBank?: boolean;
  inWindTunnel?: boolean;
}): WingTrailConfig {
  const {
    grounded,
    flightMode,
    horizSpeed,
    vy,
    flapCooldown,
    activeEmote,
    activeEmoteTimer,
    turnRate = 0,
    isDiving = false,
    inCloudBank = false,
    inWindTunnel = false,
  } = input;

  const isSpinEmote =
    activeEmoteTimer > 0 &&
    (activeEmote === 'emote_spin_dance' || activeEmote === 'emote_cheer_jump');

  if (grounded && !isSpinEmote) {
    return {
      active: false,
      intensity: 0,
      spawnInterval: 999,
      puffBaseScale: 0,
      ribbonOpacity: 0,
      turbulence: 0,
    };
  }

  const airSpeed = Math.hypot(horizSpeed, vy);
  const speedFactor = Math.min(1, airSpeed / 14.0);
  const isGliding = !grounded && flightMode === 'glide';
  const isFlapping = flapCooldown > 0;
  const turnIntensity = Math.min(1, Math.abs(turnRate) / 1.1);

  if (isSpinEmote && grounded) {
    return {
      active: true,
      intensity: 0.66,
      spawnInterval: 0.028,
      puffBaseScale: 0.62,
      ribbonOpacity: 0.52,
      turbulence: 1.15,
    };
  }

  // Differentiate turning vortex, diving slipstream, cloud-sea grazing, and serene glide without occluding character!
  const intensity = Math.min(
    1.0,
    (isGliding ? 0.72 : 0.48) +
      speedFactor * 0.20 +
      (isFlapping ? 0.22 : 0) +
      (inCloudBank ? 0.18 : 0) +
      (inWindTunnel ? 0.14 : 0)
  );

  const puffBaseScale = Math.min(
    0.88,
    (isDiving ? 0.56 : isGliding ? 0.68 : 0.54) +
      (isFlapping ? 0.14 : 0) +
      (inCloudBank ? 0.14 : 0)
  );

  return {
    active: true,
    intensity,
    spawnInterval: isFlapping
      ? 0.013
      : isDiving || inWindTunnel
        ? 0.014
        : inCloudBank
          ? 0.015
          : isGliding
            ? 0.018
            : 0.026,
    puffBaseScale,
    ribbonOpacity: Math.min(
      0.76,
      (isDiving ? 0.74 : isGliding ? 0.62 : 0.42) +
        speedFactor * 0.14 +
        turnIntensity * 0.08
    ),
    turbulence:
      (isGliding ? 0.85 : 0.58) +
      (isFlapping ? 0.55 : 0) +
      turnIntensity * 0.65 +
      (inWindTunnel ? 0.35 : 0),
  };
}

export interface SecondaryClothAndHairMotion {
  primaryWaveFreq: number;
  secondaryFlutterFreq: number;
  waveAmplitude: number;
  asymmetricTurnTwist: number;
  hemLift: number;
  hairSwayPitch: number;
  hairSwayRoll: number;
  neckScarfFlutter: number;
}

/**
 * Module 6 Pure Function: Computes secondary physical inertia and wind-ripple harmonics
 * for the poncho cape, hair tufts, and neck accessories across ground and aerial locomotion.
 */
export function computeSecondaryClothAndHairMotionPure(input: {
  elapsed: number;
  capeBillow: number;
  wingFlare: number;
  wingStroke: number;
  hipsRoll: number;
  spineYaw: number;
  spinePitch: number;
}): SecondaryClothAndHairMotion {
  const {
    elapsed,
    capeBillow,
    wingFlare,
    wingStroke,
    hipsRoll,
    spineYaw,
    spinePitch,
  } = input;

  const windEnergy = Math.max(0, Math.min(1.5, capeBillow * 0.85 + wingFlare * 0.55));
  const primaryWaveFreq = 5.2 + windEnergy * 3.4;
  const secondaryFlutterFreq = 8.4 + windEnergy * 5.2;
  const waveAmplitude = 0.036 + windEnergy * 0.038;

  // Turn-induced asymmetric trailing twist along the cape hem and wings
  const asymmetricTurnTwist = Math.max(
    -0.38,
    Math.min(0.38, hipsRoll * 0.65 - spineYaw * 0.55)
  );
  const hemLift = Math.max(
    0,
    Math.min(0.45, capeBillow * 0.24 + Math.max(0, -wingStroke) * 0.16)
  );

  // Secondary hair & neck-accessory wind follow-through
  const breezePitch = Math.sin(elapsed * 3.8) * (0.025 + windEnergy * 0.045);
  const breezeRoll = Math.cos(elapsed * 3.1) * (0.02 + windEnergy * 0.04);
  const hairSwayPitch = Math.max(
    -0.42,
    Math.min(0.42, -spinePitch * 0.28 - capeBillow * 0.18 + breezePitch)
  );
  const hairSwayRoll = Math.max(
    -0.36,
    Math.min(0.36, -hipsRoll * 0.35 + spineYaw * 0.25 + breezeRoll)
  );
  const neckScarfFlutter = Math.sin(elapsed * (6.2 + windEnergy * 4.0)) * (0.06 + windEnergy * 0.16);

  return {
    primaryWaveFreq,
    secondaryFlutterFreq,
    waveAmplitude,
    asymmetricTurnTwist,
    hemLift,
    hairSwayPitch,
    hairSwayRoll,
    neckScarfFlutter,
  };
}


