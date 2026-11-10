import { FlightMode, LocomotionMode, SitMode } from './rules';

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

  // Base Idle Pose (Natural breathing, slight knee softness, gentle breeze)
  const breath = Math.sin(elapsed * 2.4);
  const slowSway = Math.sin(elapsed * 1.3);

  const pose: JointPose = {
    hipsY: 0.86 + breath * 0.014,
    hipsPitch: 0,
    hipsRoll: slowSway * 0.025,
    hipsYawOffset: 0,

    spinePitch: 0.03 + breath * 0.025,
    spineYaw: -slowSway * 0.04,
    spineRoll: -slowSway * 0.02,

    headPitch: -breath * 0.03,
    headYaw: Math.sin(elapsed * 0.85) * 0.14,
    headRoll: Math.cos(elapsed * 1.1) * 0.04,

    leftThighPitch: -0.04,
    leftThighRoll: 0.05,
    leftKneePitch: 0.08,
    leftAnklePitch: -0.04,

    rightThighPitch: 0.04,
    rightThighRoll: -0.05,
    rightKneePitch: 0.08,
    rightAnklePitch: -0.04,

    leftShoulderPitch: 0.04,
    leftShoulderRoll: 0.16 + breath * 0.02,
    leftElbowPitch: -0.22,

    rightShoulderPitch: -0.04,
    rightShoulderRoll: -0.16 - breath * 0.02,
    rightElbowPitch: -0.22,

    wingFlare: 0.08 + (breath + 1) * 0.03,
    wingStroke: breath * 0.04,
    capeBillow: 0.08,
    capeSpinFlare: 0,
    showButterflyProp: false,
  };

  // 1. Ground Walk / Run Multi-Joint Stride Kinematics
  if (grounded && horizSpeed > 0.15) {
    const runBlend = Math.min(1, horizSpeed / 7.5);
    const s = Math.sin(gaitPhase);
    const c = Math.cos(gaitPhase);
    const doubleFreq = Math.cos(gaitPhase * 2);

    // Vertical double-bounce per stride cycle + forward athletic lean
    pose.hipsY = 0.86 + Math.abs(s) * 0.075 * runBlend - 0.02 * runBlend;
    pose.hipsPitch = 0.16 * runBlend;
    pose.hipsRoll = c * 0.07 * runBlend + turnRate * 0.15;
    pose.hipsYawOffset = s * 0.11 * runBlend;

    // Spine counter-rotation & dynamic lean
    pose.spinePitch = 0.18 * runBlend + doubleFreq * 0.03 * runBlend;
    pose.spineYaw = -s * 0.16 * runBlend;
    pose.spineRoll = -turnRate * 0.12;

    // Head stabilizes horizon and banks into turns
    pose.headPitch = -0.14 * runBlend + doubleFreq * 0.025;
    pose.headYaw = -turnRate * 0.35;
    pose.headRoll = -turnRate * 0.18;

    // Articulated Thigh + Knee + Ankle cycle (Knee bends strongly during forward swing recovery!)
    const strideAmp = 0.78 * runBlend;
    pose.leftThighPitch = s * strideAmp;
    pose.rightThighPitch = -s * strideAmp;

    // Knee bends when leg is passing from back to front (c > 0 for left leg, c < 0 for right leg)
    const leftSwing = Math.max(0, c);
    const rightSwing = Math.max(0, -c);
    pose.leftKneePitch = (0.15 + leftSwing * 0.95 + Math.max(0, -s) * 0.25) * runBlend;
    pose.rightKneePitch = (0.15 + rightSwing * 0.95 + Math.max(0, s) * 0.25) * runBlend;

    pose.leftAnklePitch = (-s * 0.35 - leftSwing * 0.25) * runBlend;
    pose.rightAnklePitch = (s * 0.35 - rightSwing * 0.25) * runBlend;

    // Opposite Arm Swing with natural Elbow Flexion
    const armAmp = 0.68 * runBlend;
    pose.leftShoulderPitch = -s * armAmp;
    pose.rightShoulderPitch = s * armAmp;
    pose.leftShoulderRoll = 0.18 + 0.12 * runBlend;
    pose.rightShoulderRoll = -0.18 - 0.12 * runBlend;
    pose.leftElbowPitch = -0.35 - Math.max(0, -s) * 0.52 * runBlend;
    pose.rightElbowPitch = -0.35 - Math.max(0, s) * 0.52 * runBlend;

    pose.wingFlare = 0.18 + 0.28 * runBlend;
    pose.capeBillow = 0.45 * runBlend;
    pose.wingStroke = doubleFreq * 0.08 * runBlend;
  }

  // 2. Aerial Flight / Soaring / Dive / Wing Flap Kinematics
  if (!grounded) {
    const isDiving = input.locomotionMode === 'dive';
    const isGliding = flightMode === 'glide' || isDiving;
    const isFlapping = flapCooldown > 0;
    const flapWave = isFlapping
      ? Math.sin((0.22 - flapCooldown) * 28.0)
      : Math.sin(elapsed * 4.2);

    if (isDiving) {
      // Stage 2 Aerodynamic Delta-Wing Dive Pose (swept-back wings, streamlined legs, high speed)
      pose.hipsY = 0.90;
      pose.hipsPitch = 0.85;
      pose.hipsRoll = turnRate * 0.45;
      pose.spinePitch = 0.42;
      pose.spineYaw = -turnRate * 0.18;
      pose.headPitch = -0.58;
      pose.headYaw = -turnRate * 0.25;

      pose.leftThighPitch = 0.55;
      pose.leftKneePitch = 0.12;
      pose.leftAnklePitch = 0.65;
      pose.rightThighPitch = 0.55;
      pose.rightKneePitch = 0.12;
      pose.rightAnklePitch = 0.65;

      // Swept-back delta arrow wings
      pose.leftShoulderRoll = 0.68;
      pose.rightShoulderRoll = -0.68;
      pose.leftShoulderPitch = 0.62;
      pose.rightShoulderPitch = 0.62;
      pose.leftElbowPitch = -0.08;
      pose.rightElbowPitch = -0.08;

      pose.wingFlare = 0.62;
      pose.wingStroke = -0.18;
      pose.capeBillow = 1.0;
    } else {
      // Body streamlines in Glide mode or hovers gracefully in Hover mode
      pose.hipsY = 0.92;
      pose.hipsPitch = isGliding ? 0.58 : 0.18;
      pose.hipsRoll = turnRate * 0.35;

      pose.spinePitch = isGliding ? 0.28 : 0.12;
      pose.spineYaw = -turnRate * 0.15;

      pose.headPitch = isGliding ? -0.45 : -0.18;
      pose.headYaw = -turnRate * 0.28;

      // Iconic Sky Aerial Leg Pose: One leg gracefully bent at knee, other extended trailing in wind
      const airSway = Math.sin(elapsed * 3.2) * 0.08;
      pose.leftThighPitch = (isGliding ? 0.32 : 0.22) + airSway;
      pose.leftKneePitch = isGliding ? 0.42 : 0.68;
      pose.leftAnklePitch = 0.45;

      pose.rightThighPitch = (isGliding ? 0.48 : 0.08) - airSway;
      pose.rightKneePitch = isGliding ? 0.18 : 0.35;
      pose.rightAnklePitch = 0.55;

      // Arms spread wide beneath cape like wings!
      const strokeAngle = isFlapping ? flapWave * 0.72 : flapWave * 0.16;
      pose.leftShoulderRoll = (isGliding ? 1.28 : 1.05) + strokeAngle * 0.45;
      pose.rightShoulderRoll = -(isGliding ? 1.28 : 1.05) - strokeAngle * 0.45;
      pose.leftShoulderPitch = isGliding ? 0.25 : 0.1;
      pose.rightShoulderPitch = isGliding ? 0.25 : 0.1;
      pose.leftElbowPitch = -0.15;
      pose.rightElbowPitch = -0.15;

      pose.wingFlare = isGliding ? 0.98 : 0.82;
      pose.wingStroke = strokeAngle;
      pose.capeBillow = Math.min(1, 0.65 + Math.max(0, -vy) * 0.04);
    }
  }

  // 3. Stage 1 Ground Special States: Slope Sliding, High-Landing Stiffness, Sitting & Shrine Meditation
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
    pose.capeBillow = 0.45;
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
}): WingTrailConfig {
  const {
    grounded,
    flightMode,
    horizSpeed,
    vy,
    flapCooldown,
    activeEmote,
    activeEmoteTimer,
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
  const speedFactor = Math.min(1, airSpeed / 12.0);
  const isGliding = !grounded && flightMode === 'glide';
  const isFlapping = flapCooldown > 0;

  if (isSpinEmote && grounded) {
    return {
      active: true,
      intensity: 0.72,
      spawnInterval: 0.025,
      puffBaseScale: 0.78,
      ribbonOpacity: 0.58,
      turbulence: 1.15,
    };
  }

  const intensity = Math.min(
    1.0,
    (isGliding ? 0.78 : 0.56) +
      speedFactor * 0.22 +
      (isFlapping ? 0.25 : 0)
  );

  return {
    active: true,
    intensity,
    spawnInterval: isFlapping ? 0.012 : isGliding ? 0.016 : 0.024,
    puffBaseScale: (isGliding ? 0.95 : 0.76) + (isFlapping ? 0.28 : 0),
    ribbonOpacity: Math.min(0.82, (isGliding ? 0.68 : 0.48) + speedFactor * 0.16),
    turbulence: (isGliding ? 0.95 : 0.65) + (isFlapping ? 0.65 : 0),
  };
}

