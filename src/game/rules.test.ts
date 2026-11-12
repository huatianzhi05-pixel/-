import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWingWedges,
  createInitialPhysicsState,
  createInitialProgressState,
  createWorldInteractables,
  stepPlayerPhysics,
  findNearestInteractable,
  applyInteraction,
  groundHeightAt,
  getKrillStateAtTime,
  resolveObstacleCollisions,
  ENERGY_CFG,
  PRAIRIE_CFG,
  DAY_NIGHT_PHASES,
  getDayNightAtmosphere,
  getSubZoneNameAt,
  isInDarkWaterAt,
  computeCallWaveEffect,
  computeEmoteLevelSpec,
  SKY_EMOTES,
  SKY_15_NOTES,
  NETWORK_CFG,
  assignRoomInstancePure,
  validateServerAuthorityTransformPure,
  interpolateAndExtrapolatePeerPure,
  stepBotTravelerAiPure,
  isInRealmShelterAt,
  flipDarkCrabsWithDeepCallPure,
  STAGE12_CFG,
  CONTINENTAL_ARCHITECTURAL_HUBS,
  SKY_ALCHEMY_SPELLS,
  SUNSET_RACE_CHECKPOINTS,
  createInitialSunsetRaceStatePure,
  stepSunsetRaceTrialPure,
  STATIC_WORLD_OBSTACLES,
  SKY_INSTRUMENT_VOICES,
  SKY_ENSEMBLE_PRACTICE_SONGS,
  createInitialEnsemblePracticeStatePure,
  stepEnsemblePracticeNotePure,
  evaluateEnsembleAccuracyRatingPure,
} from './rules';
import { DEFAULT_LOADOUT, getCosmeticsByCategory } from './cosmetics';
import {
  computeSkyChildPose,
  computeWingTrailConfig,
} from './characterAnimator';
import { skyAudio } from './audio';
import {
  GAME_CONFIG,
  storageService,
  buildDefaultSaveData,
  checkAndApplyDailyReset,
  forgeCandlesFromWaxPure,
  startSpiritMemoryQuestPure,
  advanceSpiritMemoryStepPure,
  unlockConstellationNodePure,
  unlockFriendTreeNodePure,
  igniteStrangerPure,
  sendOrAcceptFriendRequestPure,
  renameFriendNicknamePure,
  canPlayersChatPure,
  computeTeleportToFriendPure,
  executeDualSocialActionPure,
  toggleBlockPeerPure,
  reportPeerPure,
  filterSensitiveChat,
  submitMeditationNotePure,
  setEmoteLevelPure,
  progressDailyQuestPure,
  claimDailyQuestPure,
  completeSeasonStoryActPure,
  rotateTravelingSpiritPure,
  settleSeasonEndConversionPure,
  completeShardPurificationEventPure,
  recordPhotoSnapshotPure,
  craftAndPlaceHomeFurniturePure,
  rotateOrRemoveHomeFurniturePure,
  applyPresetHomeLayoutPure,
  toggleChildSafeModePure,
  computeQualityTierSettingsPure,
  updateAccessibilityAndPerfPure,
  advanceOnboardingTutorialPure,
  translateUiPure,
  discoverEasterEggPure,
  evaluateSunsetRaceMedalPure,
  recordSunsetRaceCompletionPure,
} from '../core/StorageService';
import { resolveDeployNetworkStrategyPure } from '../core/NetworkClient';

test('Full-Skin Wardrobe catalog contains all 8 modular categories with rich items', () => {
  assert.ok(getCosmeticsByCategory('cape').length >= 12);
  assert.ok(getCosmeticsByCategory('hair').length >= 10);
  assert.ok(getCosmeticsByCategory('hat').length >= 4);
  assert.ok(getCosmeticsByCategory('mask').length >= 8);
  assert.ok(getCosmeticsByCategory('faceAccessory').length >= 4);
  assert.ok(getCosmeticsByCategory('neckAccessory').length >= 4);
  assert.ok(getCosmeticsByCategory('pants').length >= 8);
  assert.ok(getCosmeticsByCategory('prop').length >= 8);
});

test('Winged Light calculation scales wedges accurately with cape bonus', () => {
  assert.equal(calculateWingWedges(1), 1);
  assert.equal(calculateWingWedges(20), 6);
  // DEFAULT_LOADOUT has cape_owl_white (+1 wing bonus)
  assert.equal(calculateWingWedges(20, DEFAULT_LOADOUT), 7);
});

test('Player physics supports ground takeoff jump and aerial wing flap', () => {
  const initial = createInitialPhysicsState(DEFAULT_LOADOUT);
  assert.equal(initial.grounded, true);

  // Trigger jump
  const jumpRes = stepPlayerPhysics(
    initial,
    {
      moveX: 0,
      moveZ: -1,
      jumpJustPressed: true,
      jumpHeld: true,
      toggleFlightModeJustPressed: false,
      sprintHeld: false,
      cameraYaw: Math.PI,
    },
    0.016,
    DEFAULT_LOADOUT
  );

  assert.equal(jumpRes.didFlap, true);
  assert.equal(jumpRes.nextState.grounded, false);
  assert.ok(jumpRes.nextState.vy > 7.0);

  // Trigger aerial wing flap after cooldown
  const midAir = { ...jumpRes.nextState, flapCooldown: 0 };
  const prevEnergy = midAir.wingEnergy;
  const flapRes = stepPlayerPhysics(
    midAir,
    {
      moveX: 0,
      moveZ: -1,
      jumpJustPressed: true,
      jumpHeld: true,
      toggleFlightModeJustPressed: true,
      sprintHeld: false,
      cameraYaw: Math.PI,
    },
    0.016,
    DEFAULT_LOADOUT
  );

  assert.equal(flapRes.didFlap, true);
  assert.equal(flapRes.nextState.flightMode, 'glide');
  assert.ok(flapRes.nextState.wingEnergy < prevEnergy);
});

test('Interaction system lights candles, collects Winged Light, and ascends at Temple Altar', () => {
  const interactables = createWorldInteractables('home');
  const candle = interactables.find((i) => i.type === 'candle_cluster')!;
  const wingedLight = interactables.find((i) => i.type === 'winged_light')!;
  const temple = interactables.find((i) => i.type === 'temple_altar')!;

  const nearCandle = findNearestInteractable(
    candle.x + 0.5,
    candle.y,
    candle.z,
    interactables
  );
  assert.equal(nearCandle?.id, candle.id);

  let progress = createInitialProgressState();
  let physics = createInitialPhysicsState(DEFAULT_LOADOUT);
  physics.wingEnergy = 2; // Depleted energy

  // 1. Light candle cluster
  const res1 = applyInteraction(candle, progress, physics, DEFAULT_LOADOUT);
  assert.equal(res1.updatedTarget.activated, true);
  assert.equal(res1.nextProgress.litCandlesCount, 1);
  assert.equal(res1.nextPhysics.wingEnergy, res1.nextPhysics.maxWingWedges);

  // 2. Collect Winged Light
  const res2 = applyInteraction(
    wingedLight,
    res1.nextProgress,
    res1.nextPhysics,
    DEFAULT_LOADOUT
  );
  assert.equal(res2.nextProgress.wingedLights, progress.wingedLights + 1);

  // 3. Meditate at Temple Altar
  const res3 = applyInteraction(
    temple,
    res2.nextProgress,
    res2.nextPhysics,
    DEFAULT_LOADOUT
  );
  assert.equal(res3.ascendedAtTemple, true);
  assert.ok(
    res3.nextProgress.ascendedCandles > res2.nextProgress.ascendedCandles
  );
});

test('Terrain groundHeightAt is flat on central shrine and rises at northern temple', () => {
  assert.equal(groundHeightAt(0, 0), 1.2);
  assert.ok(groundHeightAt(0, -48) > 4.0);
});

test('Multi-joint character animator computes natural stride knee flexion, aerial wing flare, and emote poses', () => {
  const idlePose = computeSkyChildPose({
    elapsed: 1.0,
    dt: 0.016,
    grounded: true,
    horizSpeed: 0,
    vy: 0,
    gaitPhase: 0,
    flightMode: 'hover',
    flapCooldown: 0,
    turnRate: 0,
    activeEmote: null,
    activeEmoteTimer: 0,
    instrumentOpen: false,
  });
  assert.ok(idlePose.wingFlare < 0.25);
  assert.equal(idlePose.showButterflyProp, false);

  const runPose = computeSkyChildPose({
    elapsed: 1.0,
    dt: 0.016,
    grounded: true,
    horizSpeed: 7.2,
    vy: 0,
    gaitPhase: 0.5,
    flightMode: 'hover',
    flapCooldown: 0,
    turnRate: 0.4,
    activeEmote: null,
    activeEmoteTimer: 0,
    instrumentOpen: false,
  });
  assert.ok(runPose.leftKneePitch > 0.5);
  assert.ok(Math.abs(runPose.spineYaw) > 0.05);
  assert.ok(runPose.capeBillow > 0.3);

  const glidePose = computeSkyChildPose({
    elapsed: 2.0,
    dt: 0.016,
    grounded: false,
    horizSpeed: 10.5,
    vy: -1.2,
    gaitPhase: 1.0,
    flightMode: 'glide',
    flapCooldown: 0.15,
    turnRate: 0,
    activeEmote: null,
    activeEmoteTimer: 0,
    instrumentOpen: false,
  });
  assert.ok(glidePose.wingFlare > 0.9);
  assert.ok(glidePose.hipsPitch > 0.4);

  const butterflyPose = computeSkyChildPose({
    elapsed: 3.0,
    dt: 0.016,
    grounded: true,
    horizSpeed: 0,
    vy: 0,
    gaitPhase: 0,
    flightMode: 'hover',
    flapCooldown: 0,
    turnRate: 0,
    activeEmote: 'emote_butterfly',
    activeEmoteTimer: 2.5,
    instrumentOpen: false,
  });
  assert.equal(butterflyPose.showButterflyProp, true);
  assert.ok(butterflyPose.rightShoulderPitch < -0.8);
});

test('Wingtip cloud-mist trail config activates during flight and gliding with intensified density', () => {
  const groundedCfg = computeWingTrailConfig({
    grounded: true,
    flightMode: 'hover',
    horizSpeed: 5.0,
    vy: 0,
    flapCooldown: 0,
    activeEmote: null,
    activeEmoteTimer: 0,
  });
  assert.equal(groundedCfg.active, false);
  assert.equal(groundedCfg.intensity, 0);

  const hoverCfg = computeWingTrailConfig({
    grounded: false,
    flightMode: 'hover',
    horizSpeed: 4.5,
    vy: 2.0,
    flapCooldown: 0,
    activeEmote: null,
    activeEmoteTimer: 0,
  });
  assert.equal(hoverCfg.active, true);
  assert.ok(hoverCfg.intensity > 0.5);

  const glideFlapCfg = computeWingTrailConfig({
    grounded: false,
    flightMode: 'glide',
    horizSpeed: 11.0,
    vy: -1.5,
    flapCooldown: 0.16,
    activeEmote: null,
    activeEmoteTimer: 0,
  });
  assert.equal(glideFlapCfg.active, true);
  assert.ok(glideFlapCfg.intensity > hoverCfg.intensity);
  assert.ok(glideFlapCfg.spawnInterval < hoverCfg.spawnInterval);
  assert.ok(glideFlapCfg.ribbonOpacity > hoverCfg.ribbonOpacity);
});

test('Daily Reset logic resets daily candle/heart counters and refreshes quests on a new UTC date', () => {
  const save = buildDefaultSaveData();
  save.lastDailyResetDate = '2026-01-01';
  save.dailyCandlesForged = 18;
  save.dailyHeartsReceived = 4;

  const { save: afterReset, didReset } = checkAndApplyDailyReset(
    save,
    '2026-01-02'
  );
  assert.equal(didReset, true);
  assert.equal(afterReset.lastDailyResetDate, '2026-01-02');
  assert.equal(afterReset.dailyCandlesForged, 0);
  assert.equal(afterReset.dailyHeartsReceived, 0);
  assert.equal(afterReset.dailyQuests.length, 4);
});

test('Constellation node unlock enforces prerequisites and deducts exact currency', () => {
  const save = buildDefaultSaveData();
  // node_emote_point_lv1 is unlocked by default; node_wing_buff_isle requires node_hair_moth
  const blockedRes = unlockConstellationNodePure(
    save,
    'spirit_isle_pointing',
    'node_wing_buff_isle'
  );
  assert.equal(blockedRes.success, false);

  // Unlock node_hair_moth first (cost 4 candles)
  const prevCandles = save.candles;
  const okRes = unlockConstellationNodePure(
    save,
    'spirit_isle_pointing',
    'node_hair_moth'
  );
  assert.equal(okRes.success, true);
  assert.equal(okRes.nextSave.candles, prevCandles - 4);
  assert.ok(
    okRes.nextSave.unlockedConstellationNodes.includes('node_hair_moth')
  );

  // Now node_wing_buff_isle (cost 2 ascendedCandles) can be unlocked and grants +1 wingedLight
  const okRes2 = unlockConstellationNodePure(
    okRes.nextSave,
    'spirit_isle_pointing',
    'node_wing_buff_isle'
  );
  assert.equal(okRes2.success, true);
  assert.equal(okRes2.nextSave.ascendedCandles, save.ascendedCandles - 2);
  assert.equal(okRes2.nextSave.wingedLights, save.wingedLights + 1);
});

test('Friend Tree progression enforces Ignite -> Friend -> High-Five / Chat and filters sensitive chat', () => {
  const save = buildDefaultSaveData();
  // Cannot unlock ft_highfive on bot_traveller_1 before ft_friend
  const blocked = unlockFriendTreeNodePure(
    save,
    'bot_traveller_1',
    'ft_highfive'
  );
  assert.equal(blocked.success, false);

  // Ignite first (cost 0)
  const r1 = unlockFriendTreeNodePure(save, 'bot_traveller_1', 'ft_ignite');
  assert.equal(r1.success, true);
  assert.equal(r1.nextSave.friends['bot_traveller_1'].ignited, true);

  // Make friend (cost 1 candle)
  const r2 = unlockFriendTreeNodePure(
    r1.nextSave,
    'bot_traveller_1',
    'ft_friend'
  );
  assert.equal(r2.success, true);
  assert.equal(r2.nextSave.friends['bot_traveller_1'].isFriend, true);

  // Unlock highfive (cost 1 candle)
  const r3 = unlockFriendTreeNodePure(
    r2.nextSave,
    'bot_traveller_1',
    'ft_highfive'
  );
  assert.equal(r3.success, true);
  assert.ok(
    r3.nextSave.friends['bot_traveller_1'].unlockedNodes.includes('ft_highfive')
  );

  // Sensitive chat filter
  assert.equal(
    filterSensitiveChat('你好旅人，不要作弊或者外挂'),
    '你好旅人，不要**或者**'
  );
});

test('Wasteland Krill spotlight detection triggers non-lethal temporary wedge loss and recovers near light shelter', () => {
  const krillPos = getKrillStateAtTime(2.0);
  let phys = createInitialPhysicsState(DEFAULT_LOADOUT);
  phys.x = krillPos.spotX;
  phys.z = krillPos.spotZ;
  phys.y = groundHeightAt(phys.x, phys.z);

  // Step in Wasteland under Krill spotlight until alert reaches 1.0 and triggers Krill strike
  let hitStrike: string | null | undefined = null;
  for (let i = 0; i < 45; i++) {
    const step = stepPlayerPhysics(
      phys,
      {
        moveX: 0,
        moveZ: 0,
        jumpJustPressed: false,
        jumpHeld: false,
        toggleFlightModeJustPressed: false,
        sprintHeld: false,
        cameraYaw: 0,
        realmId: 'wasteland',
        elapsed: 2.0,
      },
      0.05,
      DEFAULT_LOADOUT
    );
    phys = step.nextState;
    if (step.hazardStrike === 'krill') {
      hitStrike = step.hazardStrike;
      break;
    }
  }

  assert.equal(hitStrike, 'krill');
  assert.ok(phys.tempLostWedges > 0);

  // Move to central shrine light shelter (0,0) and verify non-lethal recovery
  let shelterState = {
    ...phys,
    x: 0,
    z: 0,
    krillAlertLevel: 0,
  };
  for (let i = 0; i < 80; i++) {
    const rec = stepPlayerPhysics(
      shelterState,
      {
        moveX: 0,
        moveZ: 0,
        jumpJustPressed: false,
        jumpHeld: false,
        toggleFlightModeJustPressed: false,
        sprintHeld: false,
        cameraYaw: 0,
        realmId: 'home',
        elapsed: 5.0,
      },
      0.05,
      DEFAULT_LOADOUT
    );
    shelterState = rec.nextState;
  }

  assert.equal(shelterState.tempLostWedges, 0);
});

test('Obstacle collision solver pushes player and bots out of shrine pillars and temple architecture without clipping', () => {
  // Shrine pillar 1 is at (6.4, 0) with radius 0.55. Attempting to stand at (6.4, 0.05) with actorRadius 0.44 must push out to >= 0.99m from center
  const resPillar = resolveObstacleCollisions(6.4, 1.2, 0.05, 0.44);
  const distFromPillar = Math.hypot(resPillar.x - 6.4, resPillar.z - 0);
  assert.ok(distFromPillar >= 0.55 + 0.44 - 1e-4);

  // Northern temple main hall is at (0, -55) with radius 5.2. Attempting to walk inside at (0, -54.0) must push out to >= 5.64m from (0, -55)
  const resTemple = resolveObstacleCollisions(0, 4.2, -54.0, 0.44);
  const distFromHall = Math.hypot(resTemple.x - 0, resTemple.z - -55);
  assert.ok(distFromHall >= 5.2 + 0.44 - 1e-4);
});

test('Stage 1 Ground Locomotion supports Walk vs Run, Steep Slope Sliding, Shallow Water Wading, High-Fall Stiffness, and Sitting/Meditation', () => {
  // 1. Walk (< 0.68 joystick push) vs Run (full push >= 0.68)
  let walkState = createInitialPhysicsState(DEFAULT_LOADOUT);
  for (let i = 0; i < 15; i++) {
    walkState = stepPlayerPhysics(
      walkState,
      {
        moveX: 0,
        moveZ: -0.45,
        jumpJustPressed: false,
        jumpHeld: false,
        toggleFlightModeJustPressed: false,
        sprintHeld: false,
        cameraYaw: 0,
      },
      0.03,
      DEFAULT_LOADOUT
    ).nextState;
  }
  assert.equal(walkState.locomotionMode, 'walk');

  let runState = createInitialPhysicsState(DEFAULT_LOADOUT);
  for (let i = 0; i < 15; i++) {
    runState = stepPlayerPhysics(
      runState,
      {
        moveX: 0,
        moveZ: -1.0,
        jumpJustPressed: false,
        jumpHeld: false,
        toggleFlightModeJustPressed: false,
        sprintHeld: true,
        cameraYaw: 0,
      },
      0.03,
      DEFAULT_LOADOUT
    ).nextState;
  }
  assert.equal(runState.locomotionMode, 'run');
  assert.ok(Math.hypot(runState.vx, runState.vz) > Math.hypot(walkState.vx, walkState.vz) * 1.4);

  // 2. Steep Slope Sliding at East Slope (x = 18.0, z = 0.0)
  let slopeState = createInitialPhysicsState(DEFAULT_LOADOUT);
  slopeState.x = 18.0;
  slopeState.z = 0.0;
  slopeState.y = groundHeightAt(18.0, 0.0);
  for (let i = 0; i < 10; i++) {
    slopeState = stepPlayerPhysics(
      slopeState,
      {
        moveX: 0,
        moveZ: 0,
        jumpJustPressed: false,
        jumpHeld: false,
        toggleFlightModeJustPressed: false,
        sprintHeld: false,
        cameraYaw: 0,
      },
      0.04,
      DEFAULT_LOADOUT
    ).nextState;
  }
  assert.equal(slopeState.isSlidingSlope, true);
  assert.equal(slopeState.locomotionMode, 'slide');
  assert.ok(slopeState.vx < -1.0); // Sliding downhill toward -X!

  // 3. Shallow Water Wading at West Pool (x = -15.5, z = 0.0)
  let waterState = createInitialPhysicsState(DEFAULT_LOADOUT);
  waterState.x = -15.5;
  waterState.z = 0.0;
  waterState.y = groundHeightAt(-15.5, 0.0);
  waterState = stepPlayerPhysics(
    waterState,
    {
      moveX: 0,
      moveZ: -0.5,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: false,
      cameraYaw: 0,
    },
    0.04,
    DEFAULT_LOADOUT
  ).nextState;
  assert.equal(waterState.isInShallowWater, true);
  assert.equal(waterState.locomotionMode, 'wade');

  // 4. Non-lethal High-Fall Landing Recovery Stiffness
  let fallState = createInitialPhysicsState(DEFAULT_LOADOUT);
  fallState.x = 0;
  fallState.z = 0;
  fallState.y = 1.25;
  fallState.vy = -12.0;
  fallState.grounded = false;
  const landedRes = stepPlayerPhysics(
    fallState,
    {
      moveX: 0,
      moveZ: 0,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: false,
      cameraYaw: 0,
    },
    0.03,
    DEFAULT_LOADOUT
  );
  assert.equal(landedRes.didLand, true);
  assert.ok(landedRes.nextState.landingStiffTimer > 0);
  assert.equal(landedRes.nextState.locomotionMode, 'land_stiff');

  // 5. Shrine Meditation & Bench Sit Alongside
  let shrineState = createInitialPhysicsState(DEFAULT_LOADOUT);
  shrineState.x = 0;
  shrineState.z = 2.2;
  shrineState.y = groundHeightAt(0, 2.2);
  shrineState = stepPlayerPhysics(
    shrineState,
    {
      moveX: 0,
      moveZ: 0,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      toggleSitJustPressed: true,
      sprintHeld: false,
      cameraYaw: 0,
    },
    0.02,
    DEFAULT_LOADOUT
  ).nextState;
  assert.equal(shrineState.sitMode, 'meditate_shrine');
  assert.equal(shrineState.locomotionMode, 'meditate_shrine');

  // Moving joystick automatically stands up from meditation
  shrineState = stepPlayerPhysics(
    shrineState,
    {
      moveX: 0,
      moveZ: -0.8,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: false,
      cameraYaw: 0,
    },
    0.02,
    DEFAULT_LOADOUT
  ).nextState;
  assert.equal(shrineState.sitMode, 'none');
});

test('Stage 2 Flight & Energy supports 1-Wedge Flap Cost, Aerial Dive & Swoop Pull-Up, Dark Water Drain, and Companion/Light Recharge', () => {
  // 1. Config-driven 1.0 wedge consumption per aerial flap (outside recharge shelter)
  let airState = createInitialPhysicsState(DEFAULT_LOADOUT);
  airState.x = 20.0;
  airState.z = -18.0;
  airState.y = 14.0;
  airState.grounded = false;
  airState.coyoteTimer = 0;
  const startEnergy = airState.wingEnergy;

  const flapRes = stepPlayerPhysics(
    airState,
    {
      moveX: 0,
      moveZ: -1.0,
      jumpJustPressed: true,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: false,
      cameraYaw: 0,
    },
    0.02,
    DEFAULT_LOADOUT
  );
  assert.equal(flapRes.didFlap, true);
  assert.ok(
    Math.abs(startEnergy - flapRes.nextState.wingEnergy - ENERGY_CFG.flapCostWedges) < 0.05,
    'Aerial flap should deduct configured flapCostWedges (1.0 wedge)'
  );

  // 2. Aerial Dive (`diveHeld: true`) builds momentum & accelerates horizontally, then swoops up on release
  let diveState = flapRes.nextState;
  for (let i = 0; i < 12; i++) {
    diveState = stepPlayerPhysics(
      diveState,
      {
        moveX: 0,
        moveZ: -1.0,
        jumpJustPressed: false,
        jumpHeld: false,
        toggleFlightModeJustPressed: false,
        diveHeld: true,
        sprintHeld: false,
        cameraYaw: 0,
      },
      0.04,
      DEFAULT_LOADOUT
    ).nextState;
  }
  assert.equal(diveState.isDiving, true);
  assert.equal(diveState.locomotionMode, 'dive');
  assert.ok(diveState.diveMomentum > 2.5);
  assert.ok(Math.hypot(diveState.vx, diveState.vz) > 15.0);

  const prePullUpVy = diveState.vy;
  const swoopState = stepPlayerPhysics(
    diveState,
    {
      moveX: 0,
      moveZ: -1.0,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      diveHeld: false,
      sprintHeld: false,
      cameraYaw: 0,
    },
    0.04,
    DEFAULT_LOADOUT
  ).nextState;
  assert.equal(swoopState.isDiving, false);
  assert.ok(swoopState.vy > prePullUpVy + 4.0, 'Releasing dive converts diveMomentum into upward swoop lift');

  // 3. Polluted Dark Water Basin at (-15.5, -12.0) drains energy non-lethally
  assert.equal(isInDarkWaterAt(-15.5, -12.0, 'home'), true);
  let darkWaterState = createInitialPhysicsState(DEFAULT_LOADOUT);
  darkWaterState.x = -15.5;
  darkWaterState.z = -12.0;
  darkWaterState.y = groundHeightAt(-15.5, -12.0);
  const initialDW = darkWaterState.wingEnergy;
  darkWaterState = stepPlayerPhysics(
    darkWaterState,
    {
      moveX: 0,
      moveZ: 0,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: false,
      cameraYaw: 0,
    },
    0.5,
    DEFAULT_LOADOUT
  ).nextState;
  assert.equal(darkWaterState.isInDarkWater, true);
  assert.equal(darkWaterState.energyChangeSource, 'dark_water');
  assert.ok(darkWaterState.wingEnergy < initialDW);

  // 4. Companion proximity recharges energy and repairs tempLostWedges even in rain
  let rainCompState = createInitialPhysicsState(DEFAULT_LOADOUT);
  rainCompState.x = 22.0;
  rainCompState.z = -18.0;
  rainCompState.y = groundHeightAt(22.0, -18.0);
  rainCompState.wingEnergy = 2.0;
  rainCompState.tempLostWedges = 1.0;
  rainCompState = stepPlayerPhysics(
    rainCompState,
    {
      moveX: 0,
      moveZ: 0,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      nearCompanion: true,
      sprintHeld: false,
      cameraYaw: 0,
      realmId: 'forest',
    },
    0.5,
    DEFAULT_LOADOUT
  ).nextState;
  assert.equal(rainCompState.energyChangeSource, 'companion');
  assert.ok(rainCompState.wingEnergy > 2.0);
  assert.ok(rainCompState.tempLostWedges < 1.0);
});

test('Stage 3 Daylight Prairie (云野) supports 3 Sub-Zones, Candle Clusters, Glowing Plants (light_bloom), Wind Tunnel Tailwind, 2 Ancestor Spirit Stations, and 4 Day/Night Atmosphere Phases', () => {
  // 1. 3 Sub-Zones spatial resolution in Prairie
  assert.equal(PRAIRIE_CFG.subZones.length, 3);
  assert.equal(getSubZoneNameAt('prairie', 0, 4), '蝴蝶平原');
  assert.equal(getSubZoneNameAt('prairie', -18.5, -16.0), '幽光洞窟');
  assert.equal(getSubZoneNameAt('prairie', 14.5, -28.0), '三塔钟楼村落');

  // 2. Data-driven Prairie interactables: 4 candle clusters, 3 glowing light_bloom plants, 2 ancestor spirits
  const prairieItems = createWorldInteractables('prairie');
  const candles = prairieItems.filter((i) => i.type === 'candle_cluster');
  const blooms = prairieItems.filter((i) => i.type === 'light_bloom');
  const spirits = prairieItems.filter((i) => i.type === 'ancestor_spirit');
  assert.ok(candles.length >= 4);
  assert.ok(blooms.length >= 3);
  assert.equal(spirits.length, 2);
  assert.equal(spirits[0].emoteUnlocked, 'emote_butterfly');
  assert.equal(spirits[1].emoteUnlocked, 'emote_cheer_jump');

  // 3. Glowing Plant (light_bloom) proximity recharges energy & [E] interaction blooms for +wax and full energy
  let bloomPhys = createInitialPhysicsState(DEFAULT_LOADOUT);
  bloomPhys.x = blooms[0].x;
  bloomPhys.z = blooms[0].z;
  bloomPhys.y = groundHeightAt(bloomPhys.x, bloomPhys.z);
  bloomPhys.wingEnergy = 2.0;
  const nearBloomStep = stepPlayerPhysics(
    bloomPhys,
    {
      moveX: 0,
      moveZ: 0,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: false,
      cameraYaw: 0,
      realmId: 'prairie',
    },
    0.25,
    DEFAULT_LOADOUT
  ).nextState;
  assert.equal(nearBloomStep.inShelter, true);
  assert.equal(nearBloomStep.energyChangeSource, 'candle_light');
  assert.ok(nearBloomStep.wingEnergy > 2.0);

  const prog = createInitialProgressState();
  const bloomInteractRes = applyInteraction(
    blooms[0],
    prog,
    nearBloomStep,
    DEFAULT_LOADOUT
  );
  assert.equal(bloomInteractRes.updatedTarget.activated, true);
  assert.equal(
    bloomInteractRes.nextPhysics.wingEnergy,
    bloomInteractRes.nextPhysics.maxWingWedges
  );
  assert.ok(bloomInteractRes.nextProgress.wax > prog.wax || bloomInteractRes.nextProgress.candles > prog.candles);

  // 4. Wind Tunnel Corridor provides both upward lift (vy) and forward tailwind propulsion (-vz) + energy recharge
  let windPhys = createInitialPhysicsState(DEFAULT_LOADOUT);
  windPhys.x = 0;
  windPhys.z = -20.0;
  windPhys.y = 7.0;
  windPhys.vy = 0;
  windPhys.vz = -2.0;
  windPhys.wingEnergy = 3.0;
  windPhys.grounded = false;
  let windStep = windPhys;
  for (let i = 0; i < 5; i++) {
    windStep = stepPlayerPhysics(
      windStep,
      {
        moveX: 0,
        moveZ: 0,
        jumpJustPressed: false,
        jumpHeld: false,
        toggleFlightModeJustPressed: false,
        sprintHeld: false,
        cameraYaw: Math.PI,
        realmId: 'prairie',
      },
      0.05,
      DEFAULT_LOADOUT
    ).nextState;
  }
  assert.equal(windStep.inWindTunnel, true);
  assert.ok(windStep.vy > 0.5, 'Wind tunnel lifts player upward');
  assert.ok(windStep.vz < -2.2, 'Wind tunnel boosts player forward along -Z toward Three-Tower Village');
  assert.ok(windStep.wingEnergy > 3.0, 'Wind tunnel recharges wing energy');

  // 5. 4 Day/Night Atmosphere Phases
  assert.equal(DAY_NIGHT_PHASES.length, 4);
  for (const phase of DAY_NIGHT_PHASES) {
    const atmo = getDayNightAtmosphere(phase);
    assert.ok(atmo.label.length > 0);
    assert.ok(atmo.sunIntensity > 1.0);
    assert.ok(atmo.musicTempoMultiplier >= 0.8);
  }
});

test('Stage 4 Spirit Memory Flow (3-step quest), Constellation Unlock Tree (all 5 spirit types & node categories), Candle/Heart Economy with Daily Caps, and Save Export/Import', () => {
  // 1. Verify all 5 spirit types exist in GAME_CONFIG.constellations
  const spiritTypes = new Set(GAME_CONFIG.constellations.map((s) => s.type));
  assert.ok(spiritTypes.has('regular'));
  assert.ok(spiritTypes.has('seasonal'));
  assert.ok(spiritTypes.has('season_guide'));
  assert.ok(spiritTypes.has('returning'));
  assert.ok(spiritTypes.has('event'));

  // 2. 3-Step Spirit Memory Reliving Flow (follow -> fly -> interact)
  let save = buildDefaultSaveData();
  const quest0 = startSpiritMemoryQuestPure('spirit_prairie_butterfly');
  assert.ok(quest0, 'spirit_prairie_butterfly has a 3-step memory quest');
  assert.equal(quest0.currentStepIndex, 1);
  assert.equal(quest0.totalSteps, 3);
  assert.equal(quest0.steps[0].mode, 'follow');
  assert.equal(quest0.steps[1].mode, 'fly');
  assert.equal(quest0.steps[2].mode, 'interact');

  const step1To2 = advanceSpiritMemoryStepPure(quest0, save);
  assert.equal(step1To2.completed, false);
  assert.equal(step1To2.nextQuest?.currentStepIndex, 2);

  const step2To3 = advanceSpiritMemoryStepPure(step1To2.nextQuest!, step1To2.nextSave);
  assert.equal(step2To3.completed, false);
  assert.equal(step2To3.nextQuest?.currentStepIndex, 3);

  const prevHearts = save.hearts;
  const prevAscended = save.ascendedCandles;
  const step3Done = advanceSpiritMemoryStepPure(step2To3.nextQuest!, step2To3.nextSave);
  assert.equal(step3Done.completed, true);
  assert.equal(step3Done.nextQuest, null);
  save = step3Done.nextSave;
  assert.ok(save.relivedSpiritIds.includes('spirit_prairie_butterfly'));
  assert.equal(save.hearts, prevHearts + 1);
  assert.equal(save.ascendedCandles, prevAscended + 2);

  // 3. Constellation Unlock Tree across node categories (emote, heart, cosmetic, call_sound, music_sheet)
  // Unlock Lv.3 butterfly emote (cost 5 candles)
  const lv3Res = unlockConstellationNodePure(
    save,
    'spirit_prairie_butterfly',
    'node_emote_butterfly_lv3'
  );
  assert.equal(lv3Res.success, true);
  assert.equal(lv3Res.nextSave.emoteLevels['emote_butterfly'], 3);
  save = lv3Res.nextSave;

  // Exchange 3 candles for +1 Heart node on spirit_prairie_butterfly
  const heartsBeforeNode = save.hearts;
  const heartNodeRes = unlockConstellationNodePure(
    save,
    'spirit_prairie_butterfly',
    'node_heart_butterfly'
  );
  assert.equal(heartNodeRes.success, true);
  assert.equal(heartNodeRes.nextSave.hearts, heartsBeforeNode + 1);
  save = heartNodeRes.nextSave;

  // Unlock cosmetic cape_manta_king (cost 3 hearts, prerequisite node_emote_butterfly_lv3)
  const capeRes = unlockConstellationNodePure(
    save,
    'spirit_prairie_butterfly',
    'node_cape_sunlight_yellow'
  );
  assert.equal(capeRes.success, true);
  assert.ok(capeRes.nextSave.unlockedCosmeticIds.includes('cape_manta_king'));
  save = capeRes.nextSave;

  // Unlock call_sound node_call_manta (cost 4 candles)
  const callRes = unlockConstellationNodePure(
    save,
    'spirit_prairie_butterfly',
    'node_call_manta'
  );
  assert.equal(callRes.success, true);
  assert.ok(callRes.nextSave.unlockedCallSoundIds?.includes('call_manta_spirit'));
  save = callRes.nextSave;

  // 4. Candle Wax Forging with Daily Cap Enforcement (dailyCandleCap = 20)
  const candlesBeforeForge = save.candles;
  save.candleWax = 40;
  save.dailyCandlesForged = 19; // Only 1 candle quota left today!
  const forgeRes = forgeCandlesFromWaxPure(save, 250); // 290 total wax = 2 potential candles, but capped at 1!
  assert.equal(forgeRes.forgedCount, 1);
  assert.equal(forgeRes.cappedByDailyLimit, true);
  assert.equal(forgeRes.nextSave.candles, candlesBeforeForge + 1);
  assert.equal(forgeRes.nextSave.dailyCandlesForged, 20);

  // 5. Save JSON Export & Import Round-Trip
  const customSave = {
    ...forgeRes.nextSave,
    playerName: '云海测试旅人',
    equippedLoadout: {
      ...forgeRes.nextSave.equippedLoadout,
      cape: 'cape_manta_king',
      mask: 'mask_chibi',
    },
  };
  const exportedJson = storageService.exportSaveJson(customSave);
  const importedRes = storageService.importSaveJson(exportedJson);
  assert.equal(importedRes.success, true);
  assert.equal(importedRes.save?.playerName, '云海测试旅人');
  assert.equal(importedRes.save?.equippedLoadout.cape, 'cape_manta_king');
  assert.equal(importedRes.save?.equippedLoadout.mask, 'mask_chibi');
});

test('Stage 5 Expression supports Tap vs Charged Deep Call, 4 Call Voices, Lv.1–5 Emote Upgrades & Pose Scaling, Shrine Meditation Blessing Notes, and 15-Key Instrument & Mixer', () => {
  // 1. Tap Call (< 0.55s) vs Charged Deep Call (>= 0.55s)
  const tapCall = computeCallWaveEffect(0.2, 'default', 3.0, 7.0);
  assert.equal(tapCall.isDeepCall, false);
  assert.equal(tapCall.waveRadius, 8.5);
  assert.equal(tapCall.flipsDarkCrabs, false);
  assert.ok(tapCall.nextWingEnergy > 3.0 && tapCall.nextWingEnergy < 4.0);

  const deepMantaCall = computeCallWaveEffect(0.95, 'manta', 3.0, 7.0);
  assert.equal(deepMantaCall.isDeepCall, true);
  assert.equal(deepMantaCall.waveRadius, 22.0);
  assert.equal(deepMantaCall.flipsDarkCrabs, true);
  assert.equal(deepMantaCall.crabFlipRadius, 18.0);
  assert.equal(deepMantaCall.nextWingEnergy, 4.5); // +1.5 wedges restored!
  assert.equal(deepMantaCall.ringColorHex, '#38BDF8');

  // 2. Emote Wheel (7 emotes including emote_point) & Lv.1–5 Upgrade Scaling
  assert.ok(SKY_EMOTES.length >= 7);
  assert.ok(SKY_EMOTES.some((e) => e.id === 'emote_point'));

  const lv1Spec = computeEmoteLevelSpec('emote_spin_dance', 1);
  const lv5Spec = computeEmoteLevelSpec('emote_spin_dance', 5);
  assert.equal(lv1Spec.level, 1);
  assert.equal(lv5Spec.level, 5);
  assert.ok(lv5Spec.motionScale > lv1Spec.motionScale);
  assert.ok(lv5Spec.particleCount > lv1Spec.particleCount * 3);

  // Animator produces visibly wider spin flare & higher leap at Lv.5 than Lv.1
  const poseLv1 = computeSkyChildPose({
    elapsed: 1.5,
    dt: 0.016,
    grounded: true,
    horizSpeed: 0,
    vy: 0,
    gaitPhase: 0,
    flightMode: 'hover',
    flapCooldown: 0,
    turnRate: 0,
    activeEmote: 'emote_spin_dance',
    activeEmoteTimer: 3.0,
    activeEmoteLevel: 1,
    instrumentOpen: false,
  });
  const poseLv5 = computeSkyChildPose({
    elapsed: 1.5,
    dt: 0.016,
    grounded: true,
    horizSpeed: 0,
    vy: 0,
    gaitPhase: 0,
    flightMode: 'hover',
    flapCooldown: 0,
    turnRate: 0,
    activeEmote: 'emote_spin_dance',
    activeEmoteTimer: 3.0,
    activeEmoteLevel: 5,
    instrumentOpen: false,
  });
  assert.ok(poseLv5.capeSpinFlare > poseLv1.capeSpinFlare);
  assert.ok(poseLv5.hipsYawOffset > poseLv1.hipsYawOffset);

  // 3. Shrine Meditation Blessing Note awards +1 Heart on first daily submission & filters sensitive words
  let save = buildDefaultSaveData();
  const initialHearts = save.hearts;
  const medRes1 = submitMeditationNotePure(
    save,
    '愿微光常伴旅途，绝不外挂！',
    '2026-11-09'
  );
  assert.equal(medRes1.heartAwarded, true);
  assert.equal(medRes1.nextSave.hearts, initialHearts + 1);
  assert.equal(medRes1.cleanedText, '愿微光常伴旅途，绝不**！');
  assert.equal(medRes1.nextSave.meditationNotes?.[0].text, '愿微光常伴旅途，绝不**！');

  // Second meditation on the same UTC day does not duplicate the daily heart reward
  const medRes2 = submitMeditationNotePure(
    medRes1.nextSave,
    '第二次冥想留言',
    '2026-11-09'
  );
  assert.equal(medRes2.heartAwarded, false);
  assert.equal(medRes2.nextSave.hearts, initialHearts + 1);

  // 4. Emote Level Persistence & 15-Key Instrument + Audio Mixer
  const upgradedSave = setEmoteLevelPure(medRes2.nextSave, 'emote_butterfly', 5);
  assert.equal(upgradedSave.emoteLevels['emote_butterfly'], 5);
  assert.equal(SKY_15_NOTES.length, 15);
  assert.ok(upgradedSave.savedSongs.length >= 2);

  skyAudio.setMixerVolumes({ masterVolume: 0.7, bgmVolume: 0.5, instrumentVolume: 0.9 });
  const vols = skyAudio.getMixerVolumes();
  assert.equal(vols.masterVolume, 0.7);
  assert.equal(vols.bgmVolume, 0.5);
  assert.equal(vols.instrumentVolume, 0.9);
});

test('Stage 6 Multiplayer Base supports 8-Player Room Matchmaking Overflow, Server-Authoritative Speed Anti-Cheat, Client Interpolation + Velocity Extrapolation, and Bot Traveler AI Modes', () => {
  // 1. Verify NETWORK_CFG loaded from gameConfig.json
  assert.equal(NETWORK_CFG.protocolVersion, '1.0');
  assert.equal(NETWORK_CFG.maxRoomPlayers, 8);
  assert.equal(NETWORK_CFG.maxCampPlayers, 16);
  assert.equal(NETWORK_CFG.botTravelers.length, 3);

  // 2. 8-Player Room Matchmaking Cap & Automatic Instance Overflow
  let rooms: Record<string, string[]> = {};
  for (let i = 1; i <= 8; i++) {
    const res = assignRoomInstancePure(rooms, 'prairie', `p_${i}`);
    rooms = res.updatedRooms;
    assert.equal(res.roomId, 'prairie_inst_1');
    assert.equal(res.maxCapacity, 8);
    assert.equal(res.memberCount, i);
  }
  // 9th player joining 'prairie' must automatically spill over into 'prairie_inst_2'
  const overflowRes = assignRoomInstancePure(rooms, 'prairie', 'p_9');
  assert.equal(overflowRes.roomId, 'prairie_inst_2');
  assert.equal(overflowRes.isNewRoom, true);
  assert.equal(overflowRes.memberCount, 1);
  assert.equal(overflowRes.updatedRooms['prairie_inst_1'].length, 8);

  // Home camp supports up to 16 players per instance
  const homeRes = assignRoomInstancePure(rooms, 'home', 'p_home_1');
  assert.equal(homeRes.maxCapacity, 16);

  // 3. Server-Authoritative Speed Anti-Cheat Validator (max 28.0 m/s)
  const validMove = validateServerAuthorityTransformPure(
    { x: 0, y: 1.2, z: 0 },
    { x: 0, y: 1.2, z: -1.4 },
    0.1,
    28.0
  );
  assert.equal(validMove.accepted, true);
  assert.equal(validMove.clampedZ, -1.4);

  // Anomalous speed spike (100m in 0.1s = 1000 m/s) is clamped to 2.8m step
  const cheatMove = validateServerAuthorityTransformPure(
    { x: 0, y: 1.2, z: 0 },
    { x: 100, y: 1.2, z: 0 },
    0.1,
    28.0
  );
  assert.equal(cheatMove.accepted, false);
  assert.ok(Math.abs(cheatMove.clampedX - 2.8) < 0.01);

  // 4. Client Position Interpolation + Velocity Dead-Reckoning Extrapolation + Shortest-Arc Yaw
  const interp = interpolateAndExtrapolatePeerPure(
    { x: 0, y: 1.2, z: 0, yaw: 3.0 },
    { x: 2.0, y: 1.2, z: 0, vx: 10.0, vy: 0, vz: 0, yaw: -3.0 },
    0.05,
    0.1 // 100ms packet age -> extrapolates targetX from 2.0 to 3.0!
  );
  assert.ok(interp.x > 0.9, 'Position interpolates toward velocity-extrapolated target');
  // Shortest arc between +3.0 rad and -3.0 rad crosses +PI, so yaw increases above 3.0 rather than decreasing toward 0
  assert.ok(interp.yaw > 3.0, 'Shortest-arc yaw interpolation wraps across PI boundary');

  // 5. Autonomous Bot Traveler AI ('patrol', 'follow', 'gather')
  const bot0 = {
    playerId: 'bot_traveller_1',
    x: -2.4,
    y: 1.2,
    z: 1.4,
    yaw: 0.65,
    botPhase: 0.4,
  };
  const localP = { x: 4.0, y: 1.2, z: -6.0, yaw: Math.PI };
  const followStep = stepBotTravelerAiPure(bot0, localP, 'follow', 2.0, 0.05);
  const distBefore = Math.hypot(bot0.x - localP.x, bot0.z - localP.z);
  const distAfter = Math.hypot(followStep.x - localP.x, followStep.z - localP.z);
  assert.ok(distAfter < distBefore, 'Bot Traveler moves toward local player in follow mode');
});

test('Stage 7 Social Pipeline supports Ignite Stranger -> Friend Request (1 Candle & Nickname) -> Chat Rules (Lv.3 & Bench) -> Teleport -> 4 Dual Actions (Hand-Hold, High-Five, Warm Hug Full Energy, Carry) -> Block & Report', () => {
  let save = buildDefaultSaveData();

  // 1. Initially bot_traveller_1 is an unignited stranger silhouette; chat & teleport are blocked
  assert.equal(save.friends['bot_traveller_1'].ignited, false);
  assert.equal(save.friends['bot_traveller_1'].isFriend, false);
  const strangerChat = canPlayersChatPure(save, 'bot_traveller_1', 'stand');
  assert.equal(strangerChat.allowed, false);
  assert.equal(strangerChat.channel, 'blocked');

  // However, sitting on the Double Stone Chat Bench ('sit_bench') enables bench_chat even with a stranger!
  const benchChat = canPlayersChatPure(save, 'bot_traveller_1', 'sit_bench');
  assert.equal(benchChat.allowed, true);
  assert.equal(benchChat.channel, 'bench_chat');

  const failedTp = computeTeleportToFriendPure(save, 'bot_traveller_1', {
    x: -2.4,
    y: 1.2,
    z: 1.4,
    yaw: 0.5,
  });
  assert.equal(failedTp.success, false);

  // 2. Ignite stranger silhouette (Free -> reveals appearance & unlocks ft_ignite)
  const ignRes = igniteStrangerPure(save, 'bot_traveller_1');
  assert.equal(ignRes.newlyIgnited, true);
  save = ignRes.nextSave;
  assert.equal(save.friends['bot_traveller_1'].ignited, true);
  assert.ok(save.friends['bot_traveller_1'].unlockedNodes.includes('ft_ignite'));

  // 3. Send Friend Request (1 White Candle -> unlocks ft_friend + custom nickname)
  const candlesBefore = save.candles;
  const reqRes = sendOrAcceptFriendRequestPure(
    save,
    'bot_traveller_1',
    '云野挚友·牧蝶人'
  );
  assert.equal(reqRes.success, true);
  save = reqRes.nextSave;
  assert.equal(save.candles, candlesBefore - 1);
  assert.equal(save.friends['bot_traveller_1'].isFriend, true);
  assert.equal(save.friends['bot_traveller_1'].nickname, '云野挚友·牧蝶人');
  assert.ok(save.friends['bot_traveller_1'].unlockedNodes.includes('ft_friend'));

  // Rename friend nickname with sensitive word filtering
  const renameRes = renameFriendNicknamePure(
    save,
    'bot_traveller_1',
    '星光外挂伙伴'
  );
  assert.equal(renameRes.success, true);
  save = renameRes.nextSave;
  assert.equal(save.friends['bot_traveller_1'].nickname, '星光**伙伴');

  // 4. Teleport to friend (Constellation Warp) now succeeds and offsets by 1.45m
  const tpRes = computeTeleportToFriendPure(save, 'bot_traveller_1', {
    x: 10.0,
    y: 1.5,
    z: -8.0,
    yaw: 0,
    realmId: 'prairie',
  });
  assert.equal(tpRes.success, true);
  assert.equal(tpRes.targetRealm, 'prairie');
  assert.ok(Math.hypot(tpRes.targetX - 10.0, tpRes.targetZ - -8.0) > 1.3);

  // 5. Progressive Friend Tree Unlock (Lv.2 High-Five -> Lv.3 Chat -> Lv.4 Hug -> Lv.5 Carry)
  const lv2 = unlockFriendTreeNodePure(save, 'bot_traveller_1', 'ft_highfive');
  assert.equal(lv2.success, true);
  const lv3 = unlockFriendTreeNodePure(lv2.nextSave, 'bot_traveller_1', 'ft_chat');
  assert.equal(lv3.success, true);
  const lv4 = unlockFriendTreeNodePure(lv3.nextSave, 'bot_traveller_1', 'ft_hug');
  assert.equal(lv4.success, true);
  const lv5 = unlockFriendTreeNodePure(lv4.nextSave, 'bot_traveller_1', 'ft_carry');
  assert.equal(lv5.success, true);
  save = lv5.nextSave;

  // Friend chat is now allowed while standing
  const friendChat = canPlayersChatPure(save, 'bot_traveller_1', 'stand');
  assert.equal(friendChat.allowed, true);
  assert.equal(friendChat.channel, 'friend_chat');

  // 6. Execute all 4 Dual Actions (hand_hold, high_five, hug, carry)
  const hhRes = executeDualSocialActionPure(
    save,
    { wingEnergy: 3.0, maxWingWedges: 7.0, tempLostWedges: 0 },
    'bot_traveller_1',
    'hand_hold'
  );
  assert.equal(hhRes.success, true);
  assert.equal(hhRes.nextDualMode, 'hand_hold');

  const hfRes = executeDualSocialActionPure(
    save,
    { wingEnergy: 3.0, maxWingWedges: 7.0, tempLostWedges: 0 },
    'bot_traveller_1',
    'high_five'
  );
  assert.equal(hfRes.success, true);
  assert.equal(hfRes.activeEmote, 'emote_high_five');
  assert.equal(hfRes.nextPhysics.wingEnergy, 4.5); // +1.5 wedges restored!

  // Warm Hug instantly restores 100% of maxWingWedges AND clears tempLostWedges!
  const hugRes = executeDualSocialActionPure(
    save,
    { wingEnergy: 1.2, maxWingWedges: 7.0, tempLostWedges: 2.0 },
    'bot_traveller_1',
    'hug'
  );
  assert.equal(hugRes.success, true);
  assert.equal(hugRes.activeEmote, 'emote_hug');
  assert.equal(hugRes.nextPhysics.wingEnergy, 7.0);
  assert.equal(hugRes.nextPhysics.tempLostWedges, 0);

  const carryRes = executeDualSocialActionPure(
    save,
    { wingEnergy: 7.0, maxWingWedges: 7.0, tempLostWedges: 0 },
    'bot_traveller_1',
    'carry'
  );
  assert.equal(carryRes.success, true);
  assert.equal(carryRes.nextDualMode, 'carry');

  // 7. Block & Report Safety Controls
  const blockRes = toggleBlockPeerPure(save, 'bot_traveller_3');
  assert.equal(blockRes.isBlocked, true);
  assert.ok(blockRes.nextSave.blockedPeerIds?.includes('bot_traveller_3'));
  assert.equal(
    canPlayersChatPure(blockRes.nextSave, 'bot_traveller_3', 'sit_bench').allowed,
    false
  );

  const unBlockRes = toggleBlockPeerPure(blockRes.nextSave, 'bot_traveller_3');
  assert.equal(unBlockRes.isBlocked, false);

  const reportRes = reportPeerPure(
    unBlockRes.nextSave,
    'bot_traveller_3',
    '恶意骚扰',
    true,
    '2026-11-09T12:00:00Z'
  );
  assert.equal(reportRes.reportEntry.peerId, 'bot_traveller_3');
  assert.ok(reportRes.nextSave.blockedPeerIds?.includes('bot_traveller_3'));
  assert.equal(reportRes.nextSave.reportedPeers?.length, 1);
  assert.equal(reportRes.nextSave.reportedPeers?.[0].reason, '恶意骚扰');
});

test('Stage 8 All 8 Sky Realms & Eye of Eden Rebirth Cycle: Forest mushroom shelters, Valley race rings, Wasteland Krill shelter & crab flip, Vault co-op door & elevator, and Eden statue offering & Orbit rebirth', () => {
  // 1. Hidden Forest (雨林): Exposed dark rain drains energy, while Mushroom Shelter blocks rain & recharges, and [E] triggers jellyfish float lift
  assert.equal(isInRealmShelterAt('forest', -7.2, -14.5), true);
  assert.equal(isInRealmShelterAt('forest', 22.0, -18.0), false);

  let forestPhys = createInitialPhysicsState(DEFAULT_LOADOUT);
  forestPhys.x = -7.2;
  forestPhys.z = -14.5;
  forestPhys.y = groundHeightAt(-7.2, -14.5);
  forestPhys.wingEnergy = 2.0;
  const shelterStep = stepPlayerPhysics(
    forestPhys,
    {
      moveX: 0,
      moveZ: 0,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: false,
      cameraYaw: 0,
      realmId: 'forest',
    },
    0.4,
    DEFAULT_LOADOUT
  ).nextState;
  assert.equal(shelterStep.inShelter, true);
  assert.equal(shelterStep.energyChangeSource, 'candle_light');
  assert.ok(shelterStep.wingEnergy > 2.0);

  const forestItems = createWorldInteractables('forest');
  const mushroomShelter = forestItems.find((i) => i.type === 'rain_shelter');
  assert.ok(mushroomShelter);
  let prog = createInitialProgressState();
  prog.currentRealm = 'forest';
  const floatRes = applyInteraction(
    mushroomShelter!,
    prog,
    shelterStep,
    DEFAULT_LOADOUT
  );
  assert.ok(floatRes.nextPhysics.vy >= 9.0);
  assert.equal(floatRes.nextPhysics.grounded, false);

  // 2. Valley of Triumph (霞谷): Flying Race Ring grants wax + high-speed forward glide boost
  const valleyItems = createWorldInteractables('valley');
  const raceRings = valleyItems.filter((i) => i.type === 'race_ring');
  assert.ok(raceRings.length >= 3);
  prog.currentRealm = 'valley';
  const ringRes = applyInteraction(
    raceRings[0],
    prog,
    createInitialPhysicsState(DEFAULT_LOADOUT),
    DEFAULT_LOADOUT
  );
  assert.ok(ringRes.nextPhysics.vz <= -13.0);
  assert.equal(ringRes.nextPhysics.flightMode, 'glide');
  assert.ok(ringRes.nextProgress.wax > prog.wax || ringRes.nextProgress.candles > prog.candles);

  // 3. Golden Wasteland (暮土): Ribcage Ruin Shelter blocks Krill lock-on & Charged Deep Call flips Dark Crabs
  assert.equal(isInRealmShelterAt('wasteland', -8.5, -17.5), true);
  const wasteItems = createWorldInteractables('wasteland');
  const crabs = wasteItems.filter((i) => i.type === 'dark_crab');
  assert.equal(crabs.length, 2);
  assert.equal(crabs[0].flipped, false);

  // Tap call does NOT flip crabs
  const tapFlip = flipDarkCrabsWithDeepCallPure(
    crabs[0].x,
    crabs[0].z,
    0,
    false,
    wasteItems
  );
  assert.equal(tapFlip.flippedCount, 0);

  // Charged Deep Call within 18m flips nearby Dark Crabs onto their backs!
  const deepFlip = flipDarkCrabsWithDeepCallPure(
    crabs[0].x,
    crabs[0].z,
    18.0,
    true,
    wasteItems
  );
  assert.equal(deepFlip.flippedCount, 2);
  const flippedCrab = deepFlip.nextInteractables.find(
    (i) => i.id === crabs[0].id
  );
  assert.equal(flippedCrab?.flipped, true);

  // 4. Vault of Knowledge (禁阁): 2-Player Co-op Mechanism Door & Starlight Elevator Platform
  const vaultItems = createWorldInteractables('vault');
  const coopDoor = vaultItems.find((i) => i.type === 'coop_door');
  const elevator = vaultItems.find((i) => i.type === 'starlight_elevator');
  assert.ok(coopDoor);
  assert.ok(elevator);
  prog.currentRealm = 'vault';
  const doorRes = applyInteraction(
    coopDoor!,
    prog,
    createInitialPhysicsState(DEFAULT_LOADOUT),
    DEFAULT_LOADOUT
  );
  assert.equal(doorRes.updatedTarget.activated, true);

  const elevRes = applyInteraction(
    elevator!,
    doorRes.nextProgress,
    doorRes.nextPhysics,
    DEFAULT_LOADOUT
  );
  assert.ok(elevRes.nextPhysics.y >= 13.0);
  assert.equal(elevRes.nextPhysics.grounded, false);

  // 5. Eye of Eden (伊甸之眼): Petrified Statue Winged Light Offering (+1 Ascended Candle per statue) & Orbit Starlight Rebirth
  const edenItems = createWorldInteractables('eden');
  const statues = edenItems.filter((i) => i.type === 'eden_statue');
  const rebirthAltar = edenItems.find((i) => i.type === 'temple_altar');
  assert.equal(statues.length, 4);
  assert.ok(rebirthAltar);

  prog.currentRealm = 'eden';
  const startWl = prog.wingedLights;
  const startAc = prog.ascendedCandles;

  const statueRes = applyInteraction(
    statues[0],
    prog,
    createInitialPhysicsState(DEFAULT_LOADOUT),
    DEFAULT_LOADOUT
  );
  assert.equal(statueRes.nextProgress.wingedLights, startWl - 1);
  assert.equal(statueRes.nextProgress.ascendedCandles, startAc + 1);

  const rebirthRes = applyInteraction(
    rebirthAltar!,
    statueRes.nextProgress,
    statueRes.nextPhysics,
    DEFAULT_LOADOUT
  );
  assert.equal(rebirthRes.ascendedAtTemple, true);
  assert.ok(rebirthRes.nextProgress.ascendedCandles >= startAc + 5);
  assert.ok(
    rebirthRes.nextProgress.wingedLights > startWl,
    'Orbit Rebirth restores sacrificed Winged Lights and grants +1 Permanent Wing Buff'
  );
  assert.equal(rebirthRes.nextPhysics.tempLostWedges, 0);
});

test('Stage 9 Daily Quests, 4-Act Seasonal Guide Storyline & Ultimate Gift, Rotating Traveling Spirits, Season-End 1:1 Candle Conversion, and Black/Red Shard Eruption Events', () => {
  let save = buildDefaultSaveData();

  // 1. Daily Quest Progression & Reward Claiming
  const q0 = save.dailyQuests[0];
  assert.ok(q0);
  assert.equal(q0.claimed, false);
  const blockedClaim = claimDailyQuestPure(save, q0.id);
  assert.equal(blockedClaim.success, false);

  const progRes = progressDailyQuestPure(save, q0.id, q0.targetCount);
  assert.equal(progRes.progressedIds.length, 1);
  assert.equal(progRes.newlyCompletedTitle, q0.title);
  save = progRes.nextSave;
  assert.equal(save.dailyQuests[0].currentCount, q0.targetCount);

  const prevSeasonCandles = save.seasonCandles;
  const claimRes = claimDailyQuestPure(save, q0.id);
  assert.equal(claimRes.success, true);
  save = claimRes.nextSave;
  assert.equal(save.dailyQuests[0].claimed, true);
  assert.equal(save.seasonCandles, prevSeasonCandles + q0.rewardAmount);

  // 2. 4-Act Seasonal Guide Storyline (sq_act_1 .. sq_act_4) & Ultimate Gift Unlock
  assert.deepEqual(save.completedSeasonQuestIds, []);
  const act1Res = completeSeasonStoryActPure(save);
  assert.equal(act1Res.success, true);
  assert.equal(act1Res.completedActId, 'sq_act_1');
  save = act1Res.nextSave;

  const act2Res = completeSeasonStoryActPure(save);
  assert.equal(act2Res.success, true);
  assert.equal(act2Res.completedActId, 'sq_act_2');
  save = act2Res.nextSave;

  const act3Res = completeSeasonStoryActPure(save);
  assert.equal(act3Res.success, true);
  assert.equal(act3Res.completedActId, 'sq_act_3');
  save = act3Res.nextSave;

  const act4Res = completeSeasonStoryActPure(save);
  assert.equal(act4Res.success, true);
  assert.equal(act4Res.completedActId, 'sq_act_4');
  save = act4Res.nextSave;
  assert.equal(save.completedSeasonQuestIds?.length, 4);
  assert.ok(save.unlockedCosmeticIds.includes('cape_aurora_wings'));

  // 3. Rotating Traveling Spirit (限时复刻旅行先祖轮换)
  assert.equal(save.activeTravelingSpiritIndex, 0);
  const tsRes = rotateTravelingSpiritPure(save);
  assert.equal(tsRes.nextSave.activeTravelingSpiritIndex, 1);
  assert.equal(tsRes.activeSpirit.id, 'ts_fire_prophet');
  save = tsRes.nextSave;

  // 4. Black & Red Shard Eruption Purification Events
  const preWhiteCandles = save.candles;
  const blackShardRes = completeShardPurificationEventPure(save, 'black');
  assert.equal(blackShardRes.rewardType, 'candles');
  assert.equal(blackShardRes.rewardAmount, 2);
  save = blackShardRes.nextSave;
  assert.equal(save.candles, preWhiteCandles + 2);

  const preRedCandles = save.ascendedCandles;
  const redShardRes = completeShardPurificationEventPure(save, 'red');
  assert.equal(redShardRes.rewardType, 'ascendedCandles');
  assert.equal(redShardRes.rewardAmount, 4);
  save = redShardRes.nextSave;
  assert.equal(save.ascendedCandles, preRedCandles + 4);

  // 5. Season-End 1:1 Season Candle -> White Candle Conversion
  const seasonCandlesToConvert = save.seasonCandles;
  assert.ok(seasonCandlesToConvert > 0);
  const candlesBeforeConvert = save.candles;
  const convRes = settleSeasonEndConversionPure(save);
  assert.equal(convRes.convertedCount, seasonCandlesToConvert);
  save = convRes.nextSave;
  assert.equal(save.seasonCandles, 0);
  assert.equal(save.candles, candlesBeforeConvert + seasonCandlesToConvert);
});

test('Stage 10 Free-Camera Photo Studio, Home Workshop 6-Blueprint Shared Space Furniture & Preset Layouts, and Child Guardian Mode', () => {
  let save = buildDefaultSaveData();

  // 1. Photo Studio Album Archiving, FOV/Roll Clamping & Sensitive Word Filtering
  const photoRes1 = recordPhotoSnapshotPure(save, {
    realmName: '云野 · 三塔钟楼村落',
    filter: 'dreamy_bloom',
    fov: 95, // clamped to 85mm
    rollDeg: -40, // clamped to -25°
    dofMode: 'cinematic',
    selfieMode: true,
    emoteId: 'emote_spin_dance',
    caption: '拒绝外挂与唯美云海合拍',
    timestampStr: '2026-11-10',
  });
  assert.equal(photoRes1.photoEntry.fov, 85);
  assert.equal(photoRes1.photoEntry.rollDeg, -25);
  assert.equal(photoRes1.photoEntry.dofMode, 'cinematic');
  assert.equal(photoRes1.photoEntry.selfieMode, true);
  assert.equal(photoRes1.photoEntry.caption, '拒绝**与唯美云海合拍');
  save = photoRes1.nextSave;
  assert.equal(save.savedPhotos?.[0].id, photoRes1.photoEntry.id);

  // 2. Home Workshop 6-Item Catalog: Craft New Furniture -> Rotate 45° -> Remove Back to Inventory
  assert.equal(GAME_CONFIG.homeFurnitureCatalog.length, 6);
  const candlesBeforeCraft = save.candles;
  const craftRes = craftAndPlaceHomeFurniturePure(
    save,
    'furn_floating_lantern', // cost 5 candles, not in initial inventory
    { x: 1.5, y: 1.2, z: 2.5, rotY: 0 },
    'furn_test_inst_1'
  );
  assert.equal(craftRes.success, true);
  assert.equal(craftRes.craftedNew, true);
  save = craftRes.nextSave;
  assert.equal(save.candles, candlesBeforeCraft - 5);
  assert.ok(save.homeFurnitureInventory.includes('furn_floating_lantern'));
  assert.ok(
    save.homeFurniturePlacements.some((p) => p.instanceId === 'furn_test_inst_1')
  );

  // Rotate +45° (PI / 4 ≈ 0.79 rad)
  const rotRes = rotateOrRemoveHomeFurniturePure(
    save,
    'furn_test_inst_1',
    'rotate'
  );
  assert.equal(rotRes.success, true);
  save = rotRes.nextSave;
  const rotatedInst = save.homeFurniturePlacements.find(
    (p) => p.instanceId === 'furn_test_inst_1'
  );
  assert.equal(rotatedInst?.rotY, 0.79);

  // Remove furniture back to inventory
  const remRes = rotateOrRemoveHomeFurniturePure(
    save,
    'furn_test_inst_1',
    'remove'
  );
  assert.equal(remRes.success, true);
  save = remRes.nextSave;
  assert.equal(
    save.homeFurniturePlacements.some((p) => p.instanceId === 'furn_test_inst_1'),
    false
  );

  // 3. One-Click Shared Space Preset Layout ('preset_sakura_teahouse' & 'preset_starlight_camp')
  const presetRes = applyPresetHomeLayoutPure(save, 'preset_sakura_teahouse');
  assert.equal(presetRes.success, true);
  save = presetRes.nextSave;
  assert.equal(save.homeFurniturePlacements.length, 4);
  assert.ok(save.homeFurnitureInventory.includes('furn_sakura_canopy'));

  // 4. Child Guardian Mode ('childSafeMode') locks all free-text chat & custom photo captions
  const childOn = toggleChildSafeModePure(save, true);
  assert.equal(childOn.childSafeMode, true);
  save = childOn.nextSave;

  // Even on a Double Chat Bench ('sit_bench'), free-text chat is blocked when Child Guardian Mode is ON
  const blockedBenchChat = canPlayersChatPure(
    save,
    'bot_traveller_1',
    'sit_bench'
  );
  assert.equal(blockedBenchChat.allowed, false);
  assert.equal(blockedBenchChat.channel, 'blocked');

  // Photo captions automatically use safe preset blessing when Child Guardian Mode is ON
  const safePhotoRes = recordPhotoSnapshotPure(save, {
    realmName: '遇境 · 星盘海岸',
    filter: 'warm_dusk',
    fov: 60,
    selfieMode: false,
    caption: '任意自由输入文字',
  });
  assert.equal(
    safePhotoRes.photoEntry.caption,
    '云海微光留影 · 愿温暖与星光常伴'
  );
});

test('Stage 11 Adaptive Performance Quality Tiering, High-Contrast & Reduced-Shake Accessibility, Bilingual i18n, and 3-Step Onboarding Tutorial', () => {
  let save = buildDefaultSaveData();

  // 1. Adaptive Quality Tiering ('auto' -> low on SoftwareGL / low FPS, medium on <48 FPS, high on 60 FPS)
  const swTier = computeQualityTierSettingsPure('auto', 60, true);
  assert.equal(swTier.resolvedTier, 'low');
  assert.equal(swTier.shadowMapEnabled, false);
  assert.equal(swTier.pixelRatioCap, 1.0);

  const midTier = computeQualityTierSettingsPure('auto', 40, false);
  assert.equal(midTier.resolvedTier, 'medium');
  assert.equal(midTier.pixelRatioCap, 1.25);

  const highTier = computeQualityTierSettingsPure('high', 60, false);
  assert.equal(highTier.resolvedTier, 'high');
  assert.equal(highTier.pixelRatioCap, 1.5);
  assert.equal(highTier.particleScale, 1.0);

  // 2. Accessibility Suite (High-Contrast + Reduced Camera Shake) & Bilingual i18n ('zh' / 'en')
  const accRes = updateAccessibilityAndPerfPure(save, {
    qualityTier: 'medium',
    highContrastMode: true,
    reducedMotionShake: true,
    locale: 'en',
  });
  save = accRes.nextSave;
  assert.equal(save.qualityTier, 'medium');
  assert.equal(save.highContrastMode, true);
  assert.equal(save.reducedMotionShake, true);
  assert.equal(save.locale, 'en');
  assert.equal(translateUiPure('en', 'appTitle'), 'Glimmer Travelers · Rea Sky');
  assert.equal(translateUiPure('zh', 'appTitle'), '微光旅人 · Rea 光遇');

  // 3. 3-Step Interactive Onboarding Tutorial (0: move -> 1: ignite -> 2: fly -> 3: completed with +2 White Candles)
  assert.equal(save.tutorialStep, 0);
  const candlesBeforeTut = save.candles;

  const step1 = advanceOnboardingTutorialPure(save, 'move');
  assert.equal(step1.advanced, true);
  assert.equal(step1.nextSave.tutorialStep, 1);

  const step2 = advanceOnboardingTutorialPure(step1.nextSave, 'ignite');
  assert.equal(step2.advanced, true);
  assert.equal(step2.nextSave.tutorialStep, 2);

  const step3 = advanceOnboardingTutorialPure(step2.nextSave, 'fly');
  assert.equal(step3.advanced, true);
  assert.equal(step3.justCompletedAll, true);
  assert.equal(step3.rewardCandles, 2);
  assert.equal(step3.nextSave.tutorialStep, 3);
  assert.equal(step3.nextSave.candles, candlesBeforeTut + 2);
});

test('Netlify & Edge CDN deployment adapter selects edge_serverless on *.netlify.app, fullstack_ws on localhost, and custom_ws when VITE_WS_URL is set', () => {
  // 1. Netlify domain automatically enters edge_serverless mode (no failing /ws connection attempts)
  const netlifyStrat = resolveDeployNetworkStrategyPure(
    'rea-sky-travelers.netlify.app',
    'https:',
    'rea-sky-travelers.netlify.app'
  );
  assert.equal(netlifyStrat.mode, 'edge_serverless');
  assert.equal(netlifyStrat.wsUrl, null);
  assert.equal(netlifyStrat.broadcastChannelName, 'glimmer_travelers_sync_v1');

  // 2. Local / Fullstack Node server uses fullstack_ws
  const localStrat = resolveDeployNetworkStrategyPure(
    'localhost',
    'http:',
    'localhost:3000'
  );
  assert.equal(localStrat.mode, 'fullstack_ws');
  assert.equal(localStrat.wsUrl, 'ws://localhost:3000/ws');

  // 3. Custom external WebSocket server overrides static host
  const customStrat = resolveDeployNetworkStrategyPure(
    'rea-sky-travelers.netlify.app',
    'https:',
    'rea-sky-travelers.netlify.app',
    'wss://sky-realtime.example.com/ws'
  );
  assert.equal(customStrat.mode, 'custom_ws');
  assert.equal(customStrat.wsUrl, 'wss://sky-realtime.example.com/ws');
});

test('Stage 12 & 13 Ultra-Wide Continent Expansion (220m Radius / 11x Area), 8 Outer Sanctuaries, Wind-Path Cloud Rail, and 12 Interactive Sky Tribute Easter Eggs', () => {
  // 1. Expanded world bounds (220m playable radius vs legacy 66m -> >11x area!)
  assert.equal(STAGE12_CFG.worldRadius, 220);
  assert.equal(STAGE12_CFG.outerSanctuaries.length, 8);
  assert.equal(STAGE12_CFG.easterEggs.length, 12);

  let farPhys = createInitialPhysicsState(DEFAULT_LOADOUT);
  farPhys.x = 185;
  farPhys.z = 0;
  farPhys.y = groundHeightAt(185, 0);
  const farStep = stepPlayerPhysics(
    farPhys,
    {
      moveX: 0,
      moveZ: 0,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: false,
      cameraYaw: 0,
      realmId: 'prairie',
    },
    0.05,
    DEFAULT_LOADOUT
  ).nextState;
  assert.ok(
    Math.hypot(farStep.x, farStep.z) > 180,
    'Expanded 220m world radius allows exploring ultra-outer sanctuaries beyond 180m'
  );

  // 2. All 8 Outer Sanctuaries terrain plateaus & sub-zone names
  assert.equal(getSubZoneNameAt('prairie', 52, -28), '圣岛 · 海螺间歇泉群岛');
  assert.ok(Math.abs(groundHeightAt(52, -28) - 4.2) < 0.05);

  assert.equal(getSubZoneNameAt('valley', 46, -68), '千鸟城 · 天际星桥浮岛');
  assert.ok(Math.abs(groundHeightAt(46, -68) - 14.5) < 0.05);

  assert.equal(getSubZoneNameAt('forest', -54, -32), '秘密花园 · 老奶奶团子树屋');
  assert.ok(Math.abs(groundHeightAt(-54, -32) - 3.2) < 0.05);

  assert.equal(getSubZoneNameAt('vault', 0, -88), '北境天际 · 七彩星光彩虹桥');
  assert.ok(Math.abs(groundHeightAt(0, -88) - 9.2) < 0.05);

  assert.equal(getSubZoneNameAt('prairie', 112, -96), '风行网道 · 云端浮空群岛');
  assert.ok(Math.abs(groundHeightAt(112, -96) - 22.0) < 0.05);

  assert.equal(getSubZoneNameAt('valley', 96, 64), '圆梦村 · 雪隐峰日落缆车台');
  assert.ok(Math.abs(groundHeightAt(96, 64) - 18.5) < 0.05);

  assert.equal(getSubZoneNameAt('wasteland', -108, 68), '潜海季 · 荧光深海珊瑚渊');
  assert.ok(Math.abs(groundHeightAt(-108, 68) - 2.6) < 0.05);

  assert.equal(getSubZoneNameAt('vault', 0, -148), '欧若拉 · 千人星光音乐竞技场');
  assert.ok(Math.abs(groundHeightAt(0, -148) - 12.8) < 0.05);

  // 3. Outer Wind-Path Cloud Rail grants high-altitude updraft & energy recharge
  let wpPhys = createInitialPhysicsState(DEFAULT_LOADOUT);
  wpPhys.x = 112.0;
  wpPhys.z = -96.0;
  wpPhys.y = 26.0;
  wpPhys.vy = 0;
  wpPhys.grounded = false;
  wpPhys.wingEnergy = 2.5;
  const wpStep = stepPlayerPhysics(
    wpPhys,
    {
      moveX: 0,
      moveZ: 0,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: false,
      cameraYaw: 0,
      realmId: 'prairie',
    },
    0.05,
    DEFAULT_LOADOUT
  ).nextState;
  assert.equal(wpStep.inWindTunnel, true);
  assert.ok(wpStep.vy > 0, 'Outer Wind-Path Cloud Rail lifts player upward');
  assert.ok(wpStep.wingEnergy > 2.5, 'Outer Wind-Path Cloud Rail recharges wing energy');

  // 4. All 12 Interactive Easter Eggs + 7 Winged Lights per Realm + Geyser & Wind-Path Launches
  const prairieItems = createWorldInteractables('prairie');
  const easterEggs = prairieItems.filter((i) => i.type === 'easter_egg');
  const wingedLights = prairieItems.filter((i) => i.type === 'winged_light');
  assert.equal(easterEggs.length, 12);
  assert.ok(wingedLights.length >= 7);

  const geyserEgg = easterEggs.find(
    (e) => e.id === 'egg_sanctuary_geyser_whale'
  )!;
  assert.ok(geyserEgg);
  const geyserRes = applyInteraction(
    geyserEgg,
    createInitialProgressState(),
    createInitialPhysicsState(DEFAULT_LOADOUT),
    DEFAULT_LOADOUT
  );
  assert.equal(geyserRes.updatedTarget.activated, true);
  assert.equal(geyserRes.nextPhysics.grounded, false);
  assert.ok(
    geyserRes.nextPhysics.vy >= 18.0,
    'Sanctuary Geyser Easter Egg launches player high into the sky (vy >= 18.0)'
  );

  // 5. Persistent Easter Egg Discovery Album & First-Time Reward Settlement across Stage 12 & 13 eggs
  let save = buildDefaultSaveData();
  assert.deepEqual(save.discoveredEasterEggIds, []);
  const startCandles = save.candles;
  const startHearts = save.hearts;
  const startWl = save.wingedLights;

  const oreoRes1 = discoverEasterEggPure(save, 'egg_oreo_plush_shrine');
  assert.equal(oreoRes1.newlyDiscovered, true);
  assert.equal(oreoRes1.eggConfig?.candlesBonus, 2);
  assert.equal(oreoRes1.eggConfig?.heartsBonus, 1);
  save = oreoRes1.nextSave;
  assert.ok(save.discoveredEasterEggIds?.includes('egg_oreo_plush_shrine'));
  assert.ok(save.candles >= startCandles + 2);
  assert.equal(save.hearts, startHearts + 1);

  // Discover Stage 13 AURORA Concert Wings Easter Egg (+1 permanent Winged Light, +2 Candles, +1 Heart)
  const auroraRes = discoverEasterEggPure(save, 'egg_aurora_concert_wings');
  assert.equal(auroraRes.newlyDiscovered, true);
  assert.equal(auroraRes.eggConfig?.wingedLightBonus, 1);
  save = auroraRes.nextSave;
  assert.equal(save.wingedLights, startWl + 1);
  assert.equal(save.discoveredEasterEggIds?.length, 2);

  // Repeat interaction with the same Easter egg does not duplicate first-time rewards
  const candlesAfterAurora = save.candles;
  const oreoRes2 = discoverEasterEggPure(save, 'egg_oreo_plush_shrine');
  assert.equal(oreoRes2.newlyDiscovered, false);
  assert.equal(oreoRes2.nextSave.candles, candlesAfterAurora);
});

test('Locomotion & Collision Polish: Smooth uphill/downhill ground tracking, tangential building sliding, and zero invisible prop/slope walls', () => {
  // 1. Walking downhill from Northern Temple ramp (z = -40 toward z = -33) stays grounded every single frame without chattering into fly mode
  let downState = createInitialPhysicsState(DEFAULT_LOADOUT);
  downState.x = 0;
  downState.z = -40.0;
  downState.y = groundHeightAt(0, -40.0);
  downState.grounded = true;
  for (let i = 0; i < 40; i++) {
    downState = stepPlayerPhysics(
      downState,
      {
        moveX: 0,
        moveZ: 1.0, // Walk south downhill (+Z)
        jumpJustPressed: false,
        jumpHeld: false,
        toggleFlightModeJustPressed: false,
        sprintHeld: true,
        cameraYaw: 0,
      },
      0.016,
      DEFAULT_LOADOUT
    ).nextState;
    assert.equal(
      downState.grounded,
      true,
      `Frame ${i}: Player must stay firmly grounded while running downhill (no walk/fly chattering)`
    );
    assert.ok(
      downState.locomotionMode === 'run' || downState.locomotionMode === 'walk',
      `Frame ${i}: LocomotionMode must remain walk/run on downhill grade`
    );
  }

  // 2. Walking uphill on outer sanctuary skirts (e.g. Sanctuary Islands at x=64, z=-61) does NOT trigger involuntary slide-back ("invisible wall")
  let sancSlopeState = createInitialPhysicsState(DEFAULT_LOADOUT);
  sancSlopeState.x = 64.0;
  sancSlopeState.z = -61.0; // Steep outer skirt of Sanctuary Islands (center 64, -72, r=15)
  sancSlopeState.y = groundHeightAt(64.0, -61.0);
  sancSlopeState.grounded = true;
  for (let i = 0; i < 20; i++) {
    sancSlopeState = stepPlayerPhysics(
      sancSlopeState,
      {
        moveX: 0,
        moveZ: -1.0, // Walk north (-Z) uphill toward sanctuary center (64, -72)
        jumpJustPressed: false,
        jumpHeld: false,
        toggleFlightModeJustPressed: false,
        sprintHeld: true,
        cameraYaw: 0,
      },
      0.02,
      DEFAULT_LOADOUT
    ).nextState;
  }
  assert.equal(sancSlopeState.isSlidingSlope, false);
  assert.ok(
    sancSlopeState.z < -61.5,
    'Player walks smoothly uphill onto outer sanctuary skirt without hitting a slope slide-back wall'
  );

  // 3. Tangential velocity sliding along Shrine Pillar (6.4, 0) eliminates inward velocity fighting
  let slidePillarState = createInitialPhysicsState(DEFAULT_LOADOUT);
  slidePillarState.x = 5.45;
  slidePillarState.z = 0.25;
  slidePillarState.y = groundHeightAt(5.45, 0.25);
  slidePillarState.vx = 6.5; // Moving +X into pillar at (6.4, 0) with slight +Z offset
  slidePillarState.vz = 1.5;
  const pillarStep = stepPlayerPhysics(
    slidePillarState,
    {
      moveX: 1.0,
      moveZ: 0.2,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: true,
      cameraYaw: 0,
    },
    0.03,
    DEFAULT_LOADOUT
  ).nextState;
  const distToPillar = Math.hypot(pillarStep.x - 6.4, pillarStep.z - 0);
  assert.ok(distToPillar >= 0.52 + 0.44 - 1e-4);
  const nx = (pillarStep.x - 6.4) / distToPillar;
  const nz = (pillarStep.z - 0) / distToPillar;
  const inwardVel = pillarStep.vx * nx + pillarStep.vz * nz;
  assert.ok(
    inwardVel >= -1e-4,
    'Inward velocity into building pillar is zeroed out for smooth tangential sliding'
  );

  // 4. Causeway center roadway, meadow candle, and spirit coordinates have zero invisible prop walls
  const bridgeCenterCheck = resolveObstacleCollisions(0, 1.2, -18.4, 0.44);
  assert.equal(bridgeCenterCheck.hitObstacle, false);
  const candleCheck = resolveObstacleCollisions(0, 1.2, -28.0, 0.44);
  assert.equal(candleCheck.hitObstacle, false);
  const spiritCheck = resolveObstacleCollisions(-14.5, 1.2, -14.0, 0.44);
  assert.equal(spiritCheck.hitObstacle, false);
});

test('Building Anti-Clipping & Platform Floor Alignment: Solid 3D structures block clipping while platforms, doorways, and altars remain flush and accessible', () => {
  // 1. Stone platforms match 3D visual plinths (zero floor sinking)
  assert.equal(groundHeightAt(6.7, 0), 1.2, 'Shrine outerTier edge is flush at 1.2m');
  assert.equal(groundHeightAt(0, -50), 4.6, 'Northern Temple plinth center is flush at 4.6m');
  assert.equal(groundHeightAt(6.0, -50), 4.6, 'Northern Temple plinth outer terrace is flush at 4.6m');
  assert.equal(groundHeightAt(16.5, -24.5), 2.0, 'Three-Tower Bell Village plinth is flush at 2.0m');
  assert.equal(groundHeightAt(0, -148), 12.8, 'AURORA Colosseum center is flush at 12.8m');
  assert.equal(groundHeightAt(13.5, -148), 12.8, 'AURORA Colosseum colonnade ring is flush at 12.8m');

  // 2. Solid 3D buildings across all zones push player out and prevent getting stuck inside
  const solidChecks = [
    { name: 'Causeway Stone Lantern', x: -2.8, y: 1.2, z: -18.4 },
    { name: 'Meadow Stone Arch Left Leg', x: -3.6, y: 1.2, z: -8.0 },
    { name: 'Northern Temple Main Hall', x: 0, y: 5.0, z: -55.0 },
    { name: 'Northern Temple Left Bell Tower', x: -11.0, y: 5.0, z: -47.5 },
    { name: 'Echo Cavern Arch Left Wall', x: -22.42, y: 1.5, z: -13.6 },
    { name: 'Three-Tower Bell Village Pillar', x: 15.15, y: 2.3, z: -24.5 },
    { name: 'Sanctuary Conch Spire', x: 47.8, y: 4.5, z: -30.5 },
    { name: 'Grandma Hollow Treehouse Back Bark Wall', x: -58.5, y: 4.0, z: -34.5 },
    { name: 'Hermit Valley Snow Igloo', x: 92.8, y: 18.5, z: 61.8 },
    { name: 'Abyss Sunken Stone Tower', x: -112.5, y: 2.6, z: 64.5 },
    { name: 'AURORA Colosseum Golden Column', x: 12.2, y: 12.8, z: -148.0 },
    { name: 'Forgotten Ark Wooden Hull', x: -88.0, y: 2.8, z: -86.5 },
  ];

  for (const b of solidChecks) {
    const res = resolveObstacleCollisions(b.x, b.y, b.z, 0.44);
    assert.equal(res.hitObstacle, true, `${b.name} must block clipping`);
    const recheck = resolveObstacleCollisions(res.x, b.y, res.z, 0.44);
    assert.equal(
      recheck.hitObstacle,
      false,
      `${b.name} must cleanly push player outside all overlapping colliders in 1 step without getting stuck`
    );
  }

  // 3. Grandma's Hollow Treehouse SE Doorway (-52.2, -27.2) and Interior Dining Table (-54, -32) are open and accessible!
  const doorwayCheck = resolveObstacleCollisions(-52.2, 3.8, -27.2, 0.44);
  assert.equal(doorwayCheck.hitObstacle, false, 'Grandma Treehouse doorway is open for walking inside');
  const interiorCheck = resolveObstacleCollisions(-54.0, 3.8, -32.0, 0.44);
  assert.equal(interiorCheck.hitObstacle, false, 'Grandma Treehouse interior feast table is accessible');

  // 4. Forgotten Ark Easter Egg Altar (-88, -82) and Northern Temple Altar (0, -48) are unobstructed
  const arkEggAltarCheck = resolveObstacleCollisions(-88.0, 2.5, -82.0, 0.44);
  assert.equal(arkEggAltarCheck.hitObstacle, false, 'Forgotten Ark Easter Egg altar (-88, -82) is unobstructed');
  const templeAltarCheck = resolveObstacleCollisions(0, 4.6, -48.0, 0.44);
  assert.equal(templeAltarCheck.hitObstacle, false, 'Northern Temple front altar (0, -48) is unobstructed');
});

test('Continental Ground Architectural Hubs (8 Complexes): Terrace heights, sub-zone names, 18 new playable interactables, solid building colliders, and thermal updrafts', () => {
  // 1. All 8 Continental Architectural Hubs exist with flush stone terraces and sub-zone names
  assert.equal(CONTINENTAL_ARCHITECTURAL_HUBS.length, 8);
  for (const hub of CONTINENTAL_ARCHITECTURAL_HUBS) {
    assert.equal(groundHeightAt(hub.x, hub.z), hub.y, `${hub.name} terrace center is flush at ${hub.y}m`);
    assert.equal(getSubZoneNameAt('prairie', hub.x, hub.z), hub.name);
  }

  // 2. 18 new interactive items across the 8 ground hubs (total 10 candle clusters, 6 light blooms, 11 winged lights in Prairie)
  const items = createWorldInteractables('prairie');
  const hubItems = items.filter((i) => i.id.includes('_hub_'));
  assert.equal(hubItems.length, 18);
  assert.equal(items.filter((i) => i.type === 'candle_cluster').length, 10);
  assert.equal(items.filter((i) => i.type === 'light_bloom').length, 6);
  assert.equal(items.filter((i) => i.type === 'winged_light').length, 11);

  // 3. Solid architectural colliders at the new ground hubs block clipping while keeping plazas accessible
  const hubSolidChecks = [
    { name: 'Aviary West Stone Cottage', x: -7.5, y: 2.0, z: 26.5 },
    { name: 'Aviary East Music Shop', x: 7.5, y: 2.0, z: 26.5 },
    { name: 'Sundial Central Obelisk', x: 0.0, y: 3.5, z: 62.0 },
    { name: 'Southeast Windmill Tower', x: 34.0, y: 3.5, z: 26.0 },
    { name: 'East Sunset Race North Tower', x: 58.0, y: 4.0, z: 3.2 },
    { name: 'West Twilight Castle North Keep', x: -60.5, y: 3.5, z: 3.8 },
    { name: 'Northeast Cloud Lighthouse', x: 36.0, y: 4.0, z: -44.0 },
    { name: 'Southwest Oasis West Obelisk', x: -52.5, y: 3.0, z: 53.0 },
  ];
  for (const hc of hubSolidChecks) {
    const col = resolveObstacleCollisions(hc.x, hc.y, hc.z, 0.44);
    assert.equal(col.hitObstacle, true, `${hc.name} must block player clipping`);
    const recheck = resolveObstacleCollisions(col.x, hc.y, col.z, 0.44);
    assert.equal(recheck.hitObstacle, false, `${hc.name} must cleanly push player outside`);
  }

  // 4. Thermal Updraft at Southeast Windmill Observatory (34, 26) lifts airborne player and recharges wing energy
  let wmPhys = createInitialPhysicsState(DEFAULT_LOADOUT);
  wmPhys.x = 34.0;
  wmPhys.z = 26.0;
  wmPhys.y = 6.0;
  wmPhys.vy = 0;
  wmPhys.grounded = false;
  wmPhys.wingEnergy = 2.0;
  const wmStep = stepPlayerPhysics(
    wmPhys,
    {
      moveX: 0,
      moveZ: 0,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: false,
      cameraYaw: 0,
      realmId: 'prairie',
    },
    0.1,
    DEFAULT_LOADOUT
  ).nextState;
  assert.equal(wmStep.inWindTunnel, true);
  assert.ok(wmStep.vy > 0.25, 'Windmill Observatory thermal updraft lifts airborne player');
  assert.ok(wmStep.wingEnergy > 2.0, 'Windmill Observatory recharges wing energy');
});

test('Stage 14 Aviary Alchemy Spell Buffs (4 Spells) & 4-Checkpoint Sunset Speedrun Time-Trial Leaderboard', () => {
  // 1. All 4 Sky Alchemy Spells exist with 180s duration
  assert.equal(SKY_ALCHEMY_SPELLS.length, 4);
  for (const sp of SKY_ALCHEMY_SPELLS) {
    assert.equal(sp.durationSec, 180);
  }

  // 2. spell_wind_speed grants +25% faster running speed compared to baseline
  const baseRun = stepPlayerPhysics(
    createInitialPhysicsState(DEFAULT_LOADOUT),
    {
      moveX: 0,
      moveZ: -1.0,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: true,
      cameraYaw: 0,
    },
    0.05,
    DEFAULT_LOADOUT
  ).nextState;

  const spellRun = stepPlayerPhysics(
    createInitialPhysicsState(DEFAULT_LOADOUT),
    {
      moveX: 0,
      moveZ: -1.0,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: true,
      cameraYaw: 0,
      activeSpellId: 'spell_wind_speed',
    },
    0.05,
    DEFAULT_LOADOUT
  ).nextState;
  assert.ok(
    Math.hypot(spellRun.vx, spellRun.vz) > Math.hypot(baseRun.vx, baseRun.vz) * 1.2,
    'spell_wind_speed boosts ground running speed by ~25%'
  );

  // 3. spell_antigravity_feather boosts jump/flap lift by +30% and reduces airborne gravity
  const baseJump = stepPlayerPhysics(
    createInitialPhysicsState(DEFAULT_LOADOUT),
    {
      moveX: 0,
      moveZ: 0,
      jumpJustPressed: true,
      jumpHeld: true,
      toggleFlightModeJustPressed: false,
      sprintHeld: false,
      cameraYaw: 0,
    },
    0.02,
    DEFAULT_LOADOUT
  ).nextState;
  const featherJump = stepPlayerPhysics(
    createInitialPhysicsState(DEFAULT_LOADOUT),
    {
      moveX: 0,
      moveZ: 0,
      jumpJustPressed: true,
      jumpHeld: true,
      toggleFlightModeJustPressed: false,
      sprintHeld: false,
      cameraYaw: 0,
      activeSpellId: 'spell_antigravity_feather',
    },
    0.02,
    DEFAULT_LOADOUT
  ).nextState;
  assert.ok(
    featherJump.vy > baseJump.vy * 1.25,
    'spell_antigravity_feather increases vertical jump/flap lift and lowers gravity'
  );

  // 4. spell_golden_aegis prevents dark water energy drain at (-15.5, -12.0) and recharges up to maxWingWedges + 2
  let aegisPhys = createInitialPhysicsState(DEFAULT_LOADOUT);
  aegisPhys.x = -15.5;
  aegisPhys.z = -12.0;
  aegisPhys.y = groundHeightAt(-15.5, -12.0);
  const startCap = aegisPhys.maxWingWedges;
  const aegisStep = stepPlayerPhysics(
    aegisPhys,
    {
      moveX: 0,
      moveZ: 0,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: false,
      cameraYaw: 0,
      realmId: 'home',
      activeSpellId: 'spell_golden_aegis',
    },
    0.5,
    DEFAULT_LOADOUT
  ).nextState;
  assert.equal(aegisStep.isInDarkWater, false);
  assert.ok(aegisStep.wingEnergy > startCap, 'spell_golden_aegis grants +2 bonus wing wedges capacity and protects against dark water');

  // 5. 4-Checkpoint Sunset Speedrun Time-Trial Progression & Medal Settlement
  assert.equal(SUNSET_RACE_CHECKPOINTS.length, 4);
  let race = createInitialSunsetRaceStatePure();
  race.active = true;
  for (let i = 0; i < SUNSET_RACE_CHECKPOINTS.length; i++) {
    const cp = SUNSET_RACE_CHECKPOINTS[i];
    const step = stepSunsetRaceTrialPure(race, cp.x, cp.z, 8500);
    assert.equal(step.reachedCheckpoint?.id, cp.id);
    assert.equal(step.justCompletedRace, i === SUNSET_RACE_CHECKPOINTS.length - 1);
    race = step.nextState;
  }
  assert.equal(race.completed, true);
  assert.equal(race.elapsedMs, 34000);

  assert.equal(evaluateSunsetRaceMedalPure(34000).medal, 'gold');
  assert.equal(evaluateSunsetRaceMedalPure(62000).medal, 'silver');
  assert.equal(evaluateSunsetRaceMedalPure(89000).medal, 'bronze');

  const save = buildDefaultSaveData();
  const settle = recordSunsetRaceCompletionPure(save, 34000);
  assert.equal(settle.isNewRecord, true);
  assert.equal(settle.medal, 'gold');
  assert.equal(settle.candlesAwarded, 3);
  assert.equal(settle.heartsAwarded, 1);
  assert.equal(settle.nextSave.bestRaceTimeMs, 34000);
  assert.equal(settle.nextSave.bestRaceMedal, 'gold');
  assert.equal(settle.nextSave.completedRaceCount, 1);
});

test('Bugfix Audit: East Sunset Race Ring +X Boost, Alchemy Cauldron Collider & Wall Clearance, Rainbow Trail +15% Speed, and Relative Starlight Elevator Lift', () => {
  const progress = createInitialProgressState();

  // 1. East Sunset Race Ring boosts Eastward (+X) along the race corridor instead of North (-Z)
  const homeItems = createWorldInteractables('home');
  const eastRing = homeItems.find((i) => i.id === 'home_hub_east_race_ring_1')!;
  assert.ok(eastRing, 'home_hub_east_race_ring_1 exists in home interactables');
  const basePhys = createInitialPhysicsState(DEFAULT_LOADOUT);
  basePhys.x = eastRing.x;
  basePhys.z = eastRing.z;
  basePhys.y = eastRing.y;
  const eastBoost = applyInteraction(eastRing, progress, basePhys, DEFAULT_LOADOUT);
  assert.ok(eastBoost.nextPhysics.vx > 12, 'East Sunset Race Ring boosts velocity in +X direction');
  assert.equal(eastBoost.nextPhysics.vz, 0, 'East Sunset Race Ring does not push sideways in Z');
  assert.ok(Math.abs(eastBoost.nextPhysics.yaw - Math.PI * 0.5) < 0.001, 'East Sunset Race Ring faces +X');

  // Valley race ring still boosts North (-Z)
  const valleyItems = createWorldInteractables('valley');
  const valleyRing = valleyItems.find((i) => i.type === 'race_ring')!;
  assert.ok(valleyRing, 'Valley race_ring exists');
  const valleyBoost = applyInteraction(valleyRing, progress, basePhys, DEFAULT_LOADOUT);
  assert.ok(valleyBoost.nextPhysics.vz < -12, 'Valley race ring boosts velocity in -Z direction');
  assert.equal(valleyBoost.nextPhysics.vx, 0);

  // 2. Aviary Alchemy Cauldron is separated from aviary_shop_west wall and has a solid obstacle collider
  const cauldronObs = STATIC_WORLD_OBSTACLES.find((o) => o.id === 'aviary_alchemy_cauldron')!;
  const westShopObs = STATIC_WORLD_OBSTACLES.find((o) => o.id === 'aviary_shop_west')!;
  const finishArchL = STATIC_WORLD_OBSTACLES.find((o) => o.id === 'sunset_finish_arch_l')!;
  assert.ok(cauldronObs, 'aviary_alchemy_cauldron obstacle registered');
  assert.ok(westShopObs, 'aviary_shop_west obstacle registered');
  assert.ok(finishArchL, 'sunset_finish_arch_l obstacle registered');

  const centerDist = Math.hypot(cauldronObs.x - westShopObs.x, cauldronObs.z - westShopObs.z);
  assert.ok(
    centerDist > cauldronObs.radius + westShopObs.radius + 0.4,
    'Alchemy cauldron has generous walkable clearance from West Aviary Shop wall'
  );

  const pushedFromCauldron = resolveObstacleCollisions(
    cauldronObs.x + 0.1,
    groundHeightAt(cauldronObs.x, cauldronObs.z),
    cauldronObs.z,
    0.44
  );
  assert.equal(pushedFromCauldron.hitObstacle, true, 'Player cannot clip inside aviary_alchemy_cauldron');

  // 3. spell_rainbow_trail grants +15% ground running speed
  const normalWalk = stepPlayerPhysics(
    createInitialPhysicsState(DEFAULT_LOADOUT),
    {
      moveX: 0,
      moveZ: -1.0,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: true,
      cameraYaw: 0,
    },
    0.05,
    DEFAULT_LOADOUT
  ).nextState;
  const rainbowWalk = stepPlayerPhysics(
    createInitialPhysicsState(DEFAULT_LOADOUT),
    {
      moveX: 0,
      moveZ: -1.0,
      jumpJustPressed: false,
      jumpHeld: false,
      toggleFlightModeJustPressed: false,
      sprintHeld: true,
      cameraYaw: 0,
      activeSpellId: 'spell_rainbow_trail',
    },
    0.05,
    DEFAULT_LOADOUT
  ).nextState;
  assert.ok(
    Math.hypot(rainbowWalk.vx, rainbowWalk.vz) > Math.hypot(normalWalk.vx, normalWalk.vz) * 1.12,
    'spell_rainbow_trail increases ground speed by ~15%'
  );

  // 4. starlight_elevator lifts at least 12m above local terrain floor
  const sundialElevator = homeItems.find((i) => i.id === 'home_hub_sundial_elevator')!;
  assert.ok(sundialElevator, 'home_hub_sundial_elevator exists');
  const elevRes = applyInteraction(sundialElevator, progress, basePhys, DEFAULT_LOADOUT);
  const localFloor = groundHeightAt(sundialElevator.x, sundialElevator.z);
  assert.ok(
    elevRes.nextPhysics.y >= localFloor + 12.0 - 0.01,
    'starlight_elevator lifts player at least 12m above local ground height'
  );
});

test('8 Sky Instrument Timbres (Xylophone, Wind Chime, Flute, Music Box, etc.) & Beginner Auto-Ensemble Practice Mode', () => {
  // 1. All 8 instrument timbres exist including xylophone, wind_chime, flute, and music_box
  assert.equal(SKY_INSTRUMENT_VOICES.length, 8);
  const voiceIds = SKY_INSTRUMENT_VOICES.map((v) => v.id);
  assert.ok(voiceIds.includes('xylophone'), 'xylophone (森灵木琴) is registered');
  assert.ok(voiceIds.includes('wind_chime'), 'wind_chime (云端风铃) is registered');
  assert.ok(voiceIds.includes('flute'), 'flute (星语长笛) is registered');
  assert.ok(voiceIds.includes('music_box'), 'music_box (星河八音盒) is registered');

  // Verify skyAudio.playInstrumentNote safely accepts all 8 voices in headless/Node environment
  for (const v of SKY_INSTRUMENT_VOICES) {
    skyAudio.playInstrumentNote(523.25, v.id, 0.9);
  }

  // 2. 4 Multi-part Ensemble Practice Songs exist with valid 0..14 lead & harmony key indices
  assert.equal(SKY_ENSEMBLE_PRACTICE_SONGS.length, 4);
  for (const song of SKY_ENSEMBLE_PRACTICE_SONGS) {
    assert.ok(song.steps.length >= 8);
    for (const step of song.steps) {
      assert.ok(step.leadKeyIndex >= 0 && step.leadKeyIndex < 15);
      assert.ok(step.harmonyKeyIndex >= 0 && step.harmonyKeyIndex < 15);
    }
  }

  // 3. Beginner Any-Key Assist Mode allows any key input to play the target lead note + harmony accompaniment and complete with S rating
  const prairieSong = SKY_ENSEMBLE_PRACTICE_SONGS[0];
  let practice = createInitialEnsemblePracticeStatePure(prairieSong.id, true);
  practice.active = true;
  for (let i = 0; i < prairieSong.steps.length; i++) {
    // Even if beginner presses key 0 every time, anyKeyAssist resolves to target leadKeyIndex
    const res = stepEnsemblePracticeNotePure(practice, 0, false);
    assert.equal(res.isCorrect, true);
    assert.equal(res.resolvedLeadKeyIndex, prairieSong.steps[i].leadKeyIndex);
    assert.equal(res.harmonyKeyIndex, prairieSong.steps[i].harmonyKeyIndex);
    assert.equal(res.justCompleted, i === prairieSong.steps.length - 1);
    practice = res.nextState;
  }
  assert.equal(practice.completed, true);
  assert.equal(practice.maxCombo, prairieSong.steps.length);
  assert.equal(practice.rating, 'S');

  // 4. Strict Practice Mode (anyKeyAssist = false) tracks misses and resets combo on wrong key
  let strictPractice = createInitialEnsemblePracticeStatePure(prairieSong.id, false);
  const firstTarget = prairieSong.steps[0].leadKeyIndex;
  const wrongKey = (firstTarget + 1) % 15;
  const missRes = stepEnsemblePracticeNotePure(strictPractice, wrongKey, false);
  assert.equal(missRes.isCorrect, false);
  assert.equal(missRes.nextState.misses, 1);
  assert.equal(missRes.nextState.combo, 0);
  assert.equal(missRes.nextState.stepIndex, 0);

  const hitRes = stepEnsemblePracticeNotePure(missRes.nextState, firstTarget, false);
  assert.equal(hitRes.isCorrect, true);
  assert.equal(hitRes.nextState.hits, 1);
  assert.equal(hitRes.nextState.combo, 1);
  assert.equal(hitRes.nextState.stepIndex, 1);

  assert.equal(evaluateEnsembleAccuracyRatingPure(10, 0), 'S');
  assert.equal(evaluateEnsembleAccuracyRatingPure(8, 2), 'A');
  assert.equal(evaluateEnsembleAccuracyRatingPure(5, 5), 'B');
});



