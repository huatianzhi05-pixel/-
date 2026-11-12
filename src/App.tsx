import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  DEFAULT_LOADOUT,
  EquippedLoadout,
  PRESET_OUTFITS,
  getCosmeticById,
} from './game/cosmetics';
import {
  REALMS,
  RealmId,
  DayNightPhase,
  DAY_NIGHT_PHASES,
  GameProgressState,
  PlayerPhysicsState,
  WorldInteractable,
  SKY_15_NOTES,
  SkyMusicNote,
  createInitialPhysicsState,
  createInitialProgressState,
  createWorldInteractables,
  stepPlayerPhysics,
  findNearestInteractable,
  applyInteraction,
  calculateWingWedges,
  computeCallWaveEffect,
  computeEmoteLevelSpec,
  getDayNightAtmosphere,
  getSubZoneNameAt,
  groundHeightAt,
  resolveObstacleCollisions,
  flipDarkCrabsWithDeepCallPure,
  SKY_ALCHEMY_SPELLS,
  SkySpellId,
  SUNSET_RACE_CHECKPOINTS,
  SunsetRaceTrialState,
  createInitialSunsetRaceStatePure,
  stepSunsetRaceTrialPure,
} from './game/rules';
import {
  buildSkyChildRig,
  buildCandleClusterMesh,
  buildLightBloomMesh,
  buildWingedLightMesh,
  buildAncestorSpiritMesh,
  buildLightMantaMesh,
  buildWingCloudTrailSystem,
  createContactShadowTexture,
  createMicroReliefTexture,
  SkyChildRig,
  WingCloudTrailSystem,
} from './game/models';
import {
  buildSkyWorldEnvironment,
  buildDarkPlantMesh,
  buildRainShelterMesh,
  buildRaceRingMesh,
  buildDarkCrabMesh,
  buildCoopDoorMesh,
  buildStarlightElevatorMesh,
  buildEdenStatueMesh,
  buildEasterEggMesh,
  BuiltWorldRefs,
} from './game/worldBuilder';
import {
  computeSkyChildPose,
  computeWingTrailConfig,
} from './game/characterAnimator';
import { skyAudio, InstrumentVoice, CallVoiceType } from './game/audio';
import {
  GAME_CONFIG,
  storageService,
  PersistentSaveData,
  RecordedSongSheet,
  SpiritMemoryQuestState,
  getTodayUtcDateString,
  forgeCandlesFromWaxPure,
  startSpiritMemoryQuestPure,
  advanceSpiritMemoryStepPure,
  unlockConstellationNodePure,
  unlockFriendTreeNodePure,
  igniteStrangerPure,
  sendOrAcceptFriendRequestPure,
  renameFriendNicknamePure,
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
  discoverEasterEggPure,
  recordSunsetRaceCompletionPure,
  QualityTierOption,
} from './core/StorageService';
import { networkClient } from './core/NetworkClient';
import { gameEventBus } from './core/EventBus';
import { TitleScreen } from './components/TitleScreen';
import { GameHud } from './components/GameHud';
import { WardrobeModal } from './components/WardrobeModal';
import { InstrumentOverlay } from './components/InstrumentOverlay';
import { ConstellationAndSocialModal } from './components/ConstellationAndSocialModal';
import {
  PhotoModeOverlay,
  PhotoFilterType,
  PhotoDofType,
} from './components/PhotoModeOverlay';
import { StatusModal } from './components/StatusModal';

type GameShellState = 'title' | 'playing' | 'paused' | 'gameover';

interface PooledParticle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  scale: number;
}

// Pre-allocated module-scope math helpers (Zero GC in render loop)
const _camTarget = new THREE.Vector3();
const _camDesired = new THREE.Vector3();
const _dummyMatrixObj = new THREE.Object3D();
const _rainbowColor = new THREE.Color();

export default function App() {
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const initialAutostart = searchParams.get('autostart') === '1';
  const initialDebug = searchParams.get('debug') === '1';

  const [saveData, setSaveData] = useState<PersistentSaveData>(() =>
    storageService.load()
  );
  const [debugMode, setDebugMode] = useState<boolean>(initialDebug);
  const [gameState, setGameState] = useState<GameShellState>(
    initialAutostart ? 'playing' : 'title'
  );
  const [loadout, setLoadout] = useState<EquippedLoadout>(
    () => storageService.load().equippedLoadout || DEFAULT_LOADOUT
  );
  const [progress, setProgress] = useState<GameProgressState>(() => {
    const initial = createInitialProgressState();
    const saved = storageService.load();
    return {
      ...initial,
      candles: saved.candles,
      wax: saved.candleWax,
      hearts: saved.hearts,
      wingedLights: saved.wingedLights,
      ascendedCandles: saved.ascendedCandles,
      seasonCandles: saved.seasonCandles,
    };
  });
  const [physics, setPhysics] = useState<PlayerPhysicsState>(() =>
    createInitialPhysicsState(
      storageService.load().equippedLoadout || DEFAULT_LOADOUT
    )
  );
  const [nearestInteractable, setNearestInteractable] =
    useState<WorldInteractable | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [instrumentOpen, setInstrumentOpen] = useState(false);
  const [instrumentType, setInstrumentType] =
    useState<InstrumentVoice>('piano');
  const [constellationModalOpen, setConstellationModalOpen] = useState(false);
  const [constellationTab, setConstellationTab] = useState<
    'constellation' | 'social' | 'quests' | 'home' | 'save'
  >('constellation');
  const [activeSpiritMemory, setActiveSpiritMemory] =
    useState<SpiritMemoryQuestState | null>(null);
  const [photoModeOpen, setPhotoModeOpen] = useState(false);
  const [photoFilter, setPhotoFilter] = useState<PhotoFilterType>('none');
  const [photoFov, setPhotoFov] = useState<number>(60);
  const [photoRollDeg, setPhotoRollDeg] = useState<number>(0);
  const [photoDofMode, setPhotoDofMode] = useState<PhotoDofType>('soft');
  const [selfieMode, setSelfieMode] = useState<boolean>(false);
  const [dualActionPartnerId, setDualActionPartnerId] = useState<string | null>(
    null
  );
  const [dualActionMode, setDualActionMode] = useState<
    'none' | 'hand_hold' | 'carry' | 'bench_sit'
  >('none');
  const [latestChatBubble, setLatestChatBubble] = useState<{
    senderName: string;
    text: string;
  } | null>(null);
  const [muted, setMuted] = useState(false);
  const [dayNightPhase, setDayNightPhase] = useState<DayNightPhase>('noon');
  const [activeEmoteLevel, setActiveEmoteLevel] = useState<number>(3);
  const [activeCallVoice, setActiveCallVoice] = useState<CallVoiceType>(
    () => storageService.load().activeCallVoice || 'default'
  );
  const [activeSpellId, setActiveSpellId] = useState<SkySpellId | null>(null);
  const [activeSpellRemainingSec, setActiveSpellRemainingSec] =
    useState<number>(0);
  const [sunsetRaceState, setSunsetRaceState] = useState<SunsetRaceTrialState>(
    () => createInitialSunsetRaceStatePure()
  );

  // Multiplayer & Debug telemetry states
  const [fps, setFps] = useState<number>(60);
  const [netStatus, setNetStatus] = useState(() =>
    networkClient.getStatusSnapshot()
  );

  // Refs for decoupled 60Hz loop
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const gameStateRef = useRef<GameShellState>(gameState);
  const loadoutRef = useRef<EquippedLoadout>(loadout);
  const progressRef = useRef<GameProgressState>(progress);
  const physicsRef = useRef<PlayerPhysicsState>(physics);
  const saveDataRef = useRef<PersistentSaveData>(saveData);
  const interactablesRef = useRef<WorldInteractable[]>(
    createWorldInteractables('home').map((item) =>
      (item.type === 'easter_egg' &&
        saveData.discoveredEasterEggIds?.includes(item.id)) ||
      (item.type === 'ancestor_spirit' &&
        item.spiritId &&
        saveData.relivedSpiritIds?.includes(item.spiritId))
        ? { ...item, activated: true }
        : item
    )
  );
  const nearestInteractableRef = useRef<WorldInteractable | null>(null);
  const wardrobeOpenRef = useRef<boolean>(wardrobeOpen);
  const instrumentOpenRef = useRef<boolean>(instrumentOpen);
  const constellationModalOpenRef = useRef<boolean>(constellationModalOpen);
  const photoModeOpenRef = useRef<boolean>(photoModeOpen);
  const selfieModeRef = useRef<boolean>(selfieMode);
  const dayNightPhaseRef = useRef<DayNightPhase>(dayNightPhase);
  const activeSpiritMemoryRef = useRef<SpiritMemoryQuestState | null>(null);
  const activeEmoteLevelRef = useRef<number>(activeEmoteLevel);
  const activeCallVoiceRef = useRef<CallVoiceType>(activeCallVoice);
  const activeSpellIdRef = useRef<SkySpellId | null>(null);
  const activeSpellRemainingRef = useRef<number>(0);
  const sunsetRaceRef = useRef<SunsetRaceTrialState>(
    createInitialSunsetRaceStatePure()
  );

  // Three.js scene refs for instant imperative updates
  const playerRigRef = useRef<SkyChildRig | null>(null);
  const wingTrailRef = useRef<WingCloudTrailSystem | null>(null);
  const worldRefs = useRef<BuiltWorldRefs | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const interactableMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const populateInteractablesFnRef = useRef<(() => void) | null>(null);
  const spawnBurstRef = useRef<
    ((x: number, y: number, z: number, count: number, upward?: number) => void) | null
  >(null);

  // Input tracking refs (Keyboard + Virtual Touch Joystick)
  const keysHeldRef = useRef<Set<string>>(new Set());
  const touchInputRef = useRef<{
    moveX: number;
    moveZ: number;
    sprint: boolean;
  }>({
    moveX: 0,
    moveZ: 0,
    sprint: false,
  });
  const jumpJustPressedRef = useRef(false);
  const toggleFlightJustPressedRef = useRef(false);
  const toggleSitJustPressedRef = useRef(false);
  const diveHeldRef = useRef(false);
  const cameraYawRef = useRef(0);
  const cameraPitchRef = useRef(0.28);
  const gaitDistanceRef = useRef(0);
  const squashScaleYRef = useRef(1.0);
  const bannerTimerRef = useRef<number | null>(null);

  // Sync body dataset state
  useEffect(() => {
    gameStateRef.current = gameState;
    document.body.dataset.state = gameState;
  }, [gameState]);

  useEffect(() => {
    wardrobeOpenRef.current = wardrobeOpen;
  }, [wardrobeOpen]);

  useEffect(() => {
    instrumentOpenRef.current = instrumentOpen;
  }, [instrumentOpen]);

  useEffect(() => {
    constellationModalOpenRef.current = constellationModalOpen;
  }, [constellationModalOpen]);

  useEffect(() => {
    photoModeOpenRef.current = photoModeOpen;
  }, [photoModeOpen]);

  useEffect(() => {
    selfieModeRef.current = selfieMode;
  }, [selfieMode]);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.fov = photoFov;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [photoFov]);

  const showBanner = useCallback((msg: string) => {
    setBannerMessage(msg);
    if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = window.setTimeout(() => {
      setBannerMessage(null);
    }, 3200);
  }, []);

  // Connect NetworkClient + EventBus listeners on mount
  useEffect(() => {
    networkClient.connect(
      saveDataRef.current.playerId,
      saveDataRef.current.playerName,
      progressRef.current.currentRealm,
      loadoutRef.current
    );

    const offChat = gameEventBus.on('social:chatBubble', (payload) => {
      setLatestChatBubble({
        senderName: payload.senderName,
        text: filterSensitiveChat(payload.text),
      });
    });

    const offNet = gameEventBus.on('network:status', (status) => {
      setNetStatus(status);
    });

    return () => {
      offChat();
      offNet();
    };
  }, []);

  // Helper to persist saveData + sync currencies with progress
  const commitSaveData = useCallback((nextSave: PersistentSaveData) => {
    saveDataRef.current = nextSave;
    setSaveData(nextSave);
    storageService.save(nextSave);

    progressRef.current = {
      ...progressRef.current,
      candles: nextSave.candles,
      wax: nextSave.candleWax,
      hearts: nextSave.hearts,
      wingedLights: nextSave.wingedLights,
      ascendedCandles: nextSave.ascendedCandles,
      seasonCandles: nextSave.seasonCandles,
    };
    setProgress({ ...progressRef.current });
  }, []);

  // Equip skin loadout & rebuild 3D character meshes immediately
  const handleChangeLoadout = useCallback(
    (nextLoadout: EquippedLoadout) => {
      loadoutRef.current = nextLoadout;
      setLoadout(nextLoadout);
      if (playerRigRef.current) {
        playerRigRef.current.rebuildLoadout(nextLoadout);
      }
      const capeItem = getCosmeticById(nextLoadout.cape);
      wingTrailRef.current?.setAccentColor(
        capeItem.emissiveColor || capeItem.accentColor
      );
      const newMaxWedges = calculateWingWedges(
        progressRef.current.wingedLights,
        nextLoadout
      );
      physicsRef.current = {
        ...physicsRef.current,
        maxWingWedges: newMaxWedges,
        wingEnergy: Math.min(newMaxWedges, physicsRef.current.wingEnergy + 1),
      };
      setPhysics({ ...physicsRef.current });

      const updatedSave: PersistentSaveData = {
        ...saveDataRef.current,
        equippedLoadout: nextLoadout,
      };
      commitSaveData(updatedSave);
    },
    [commitSaveData]
  );

  // Apply Day/Night Atmosphere & Realm Lighting helper
  const applySceneAtmosphere = useCallback(
    (realmId: RealmId, phase: DayNightPhase) => {
      const realmCfg = REALMS[realmId];
      const atmo = getDayNightAtmosphere(phase);
      const useAtmo =
        realmId === 'prairie' || realmId === 'home' || phase !== 'noon';

      if (worldRefs.current && sceneRef.current) {
        worldRefs.current.applyRealmTheme(realmCfg, phase);
        worldRefs.current.rebuildHomeFurniture(
          saveDataRef.current.homeFurniturePlacements,
          realmId === 'home'
        );
        sceneRef.current.background = new THREE.Color(
          useAtmo ? atmo.skyHorizonColor : realmCfg.skyHorizonColor
        );
        sceneRef.current.fog = new THREE.FogExp2(
          useAtmo ? atmo.fogColor : realmCfg.fogColor,
          (useAtmo ? atmo.fogDensity : realmCfg.fogDensity) * 0.58
        );
      }
      if (sunLightRef.current) {
        sunLightRef.current.color.set(
          useAtmo ? atmo.sunColor : realmCfg.sunColor
        );
        sunLightRef.current.intensity =
          (useAtmo ? atmo.sunIntensity : realmCfg.sunIntensity) * 0.78;
      }
      if (hemiLightRef.current) {
        hemiLightRef.current.color.set(
          useAtmo ? atmo.hemiSkyColor : realmCfg.hemiSkyColor
        );
        hemiLightRef.current.groundColor.set(
          useAtmo ? atmo.hemiGroundColor : realmCfg.hemiGroundColor
        );
      }
      skyAudio.setMusicContext(
        realmCfg.ambientNoteBase,
        atmo.musicTempoMultiplier
      );
    },
    []
  );

  // Cycle Stage 3 Day/Night Atmosphere (`morning` -> `noon` -> `sunset` -> `starry_night`)
  const handleCycleDayNightPhase = useCallback(() => {
    const idx = DAY_NIGHT_PHASES.indexOf(dayNightPhaseRef.current);
    const nextPhase = DAY_NIGHT_PHASES[(idx + 1) % DAY_NIGHT_PHASES.length];
    dayNightPhaseRef.current = nextPhase;
    setDayNightPhase(nextPhase);
    applySceneAtmosphere(progressRef.current.currentRealm, nextPhase);
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    const atmo = getDayNightAtmosphere(nextPhase);
    skyAudio.playCandleIgnite();
    showBanner(
      `昼夜氛围已切换至「${atmo.label}」· 天光云影与竖琴长笛配乐律动已同步更新`
    );
  }, [applySceneAtmosphere, showBanner]);

  // Switch between the 8 Sky Realms seamlessly
  const handleSelectRealm = useCallback(
    (realmId: RealmId) => {
      const realmCfg = REALMS[realmId];
      progressRef.current = {
        ...progressRef.current,
        currentRealm: realmId,
      };
      setProgress({ ...progressRef.current });

      const resetPhys = createInitialPhysicsState(loadoutRef.current);
      resetPhys.maxWingWedges = calculateWingWedges(
        progressRef.current.wingedLights,
        loadoutRef.current
      );
      resetPhys.wingEnergy = resetPhys.maxWingWedges;
      physicsRef.current = resetPhys;
      setPhysics({ ...resetPhys });

      // Rebuild realm interactables and preserve persistent discovery state
      const newInteractables = createWorldInteractables(realmId).map((item) =>
        (item.type === 'easter_egg' &&
          saveDataRef.current.discoveredEasterEggIds?.includes(item.id)) ||
        (item.type === 'ancestor_spirit' &&
          item.spiritId &&
          saveDataRef.current.relivedSpiritIds?.includes(item.spiritId))
          ? { ...item, activated: true }
          : item
      );
      interactablesRef.current = newInteractables;
      populateInteractablesFnRef.current?.();

      const nearest = findNearestInteractable(
        resetPhys.x,
        resetPhys.y,
        resetPhys.z,
        newInteractables
      );
      nearestInteractableRef.current = nearest;
      setNearestInteractable(nearest);

      // Apply realm lighting & colors to 3D scene
      applySceneAtmosphere(realmId, dayNightPhaseRef.current);

      if (playerRigRef.current) {
        wingTrailRef.current?.resetRibbonHistory(playerRigRef.current);
      }

      networkClient.switchRealm(realmId, loadoutRef.current);
      skyAudio.startAmbientMusic();
      skyAudio.playWingedLightAbsorb();
      showBanner(`已穿越星门抵达「${realmCfg.name}」`);
    },
    [applySceneAtmosphere, showBanner]
  );

  // Trigger Start Game
  const handleStartGame = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    keysHeldRef.current.clear();
    gameStateRef.current = 'playing';
    document.body.dataset.state = 'playing';
    setGameState('playing');
    skyAudio.setMusicContext(
      REALMS[progressRef.current.currentRealm].ambientNoteBase,
      getDayNightAtmosphere(dayNightPhaseRef.current).musicTempoMultiplier
    );
    skyAudio.startAmbientMusic();
    skyAudio.playSkyCall(1.0);
  }, []);

  // Stage 5: Trigger Call / Honk Wave [Q] (Supports Tap Call vs Charged Deep Call + 4 Call Timbres)
  const handleTriggerCallWave = useCallback(
    (holdDurationSec = 0.25) => {
      const p = physicsRef.current;
      const maxEff = Math.max(1, p.maxWingWedges - p.tempLostWedges);
      const callEffect = computeCallWaveEffect(
        holdDurationSec,
        activeCallVoiceRef.current,
        p.wingEnergy,
        maxEff,
        (Math.random() - 0.5) * 0.08
      );

      progressRef.current = {
        ...progressRef.current,
        callWaveTimer: callEffect.isDeepCall ? 1.8 : 1.2,
        callWaveRadius: callEffect.isDeepCall ? 1.2 : 0.5,
      };
      physicsRef.current = {
        ...p,
        wingEnergy: callEffect.nextWingEnergy,
      };
      if (playerRigRef.current) {
        (
          playerRigRef.current.callRingMesh.material as THREE.MeshBasicMaterial
        ).color.set(callEffect.ringColorHex);
      }

      setProgress({ ...progressRef.current });
      setPhysics({ ...physicsRef.current });
      skyAudio.playSkyCall(
        callEffect.pitchMultiplier,
        callEffect.durationSec,
        callEffect.isDeepCall,
        activeCallVoiceRef.current
      );
      networkClient.broadcastEvent('player:call', {
        pitchMultiplier: callEffect.pitchMultiplier,
        isDeepCall: callEffect.isDeepCall,
        callVoice: activeCallVoiceRef.current,
      });
      spawnBurstRef.current?.(
        p.x,
        p.y + 1.2,
        p.z,
        callEffect.particleCount,
        callEffect.isDeepCall ? 7.2 : 4.5
      );

      // Stage 8: Flip nearby Dark Crabs on their backs when issuing a Charged Deep Call!
      let crabFlippedCount = 0;
      if (callEffect.flipsDarkCrabs) {
        const flipRes = flipDarkCrabsWithDeepCallPure(
          p.x,
          p.z,
          callEffect.crabFlipRadius,
          callEffect.isDeepCall,
          interactablesRef.current
        );
        crabFlippedCount = flipRes.flippedCount;
        if (crabFlippedCount > 0) {
          interactablesRef.current = flipRes.nextInteractables;
          for (const item of interactablesRef.current) {
            if (item.type === 'dark_crab' && item.flipped) {
              const meshG = interactableMeshesRef.current.get(item.id);
              const crabVis = meshG?.getObjectByName('crab_visual');
              if (crabVis) {
                crabVis.rotation.z = Math.PI;
              }
            }
          }
          const near = findNearestInteractable(
            p.x,
            p.y,
            p.z,
            interactablesRef.current
          );
          nearestInteractableRef.current = near;
          setNearestInteractable(near);
        }
      }

      showBanner(
        callEffect.isDeepCall
          ? `🌟 发出蓄力深呼唤 (${activeCallVoiceRef.current}) · 扩散 ${callEffect.waveRadius}m 圣光波纹，蝶群共鸣回复 +${callEffect.energyRestored} 格翼能${crabFlippedCount > 0 ? `，并震翻了 ${crabFlippedCount} 只暮土暗蟹！` : '并掀翻周围暗蟹！'}`
          : `🔊 发出星音呼唤 (${activeCallVoiceRef.current}) · 已感应周围小金人、先祖与旅人方位 (+${callEffect.energyRestored} 格翼能)`
      );
    },
    [showBanner]
  );

  // Stage 5: Switch Call Voice Timbre ('default' | 'manta' | 'jellyfish' | 'bell')
  const handleChangeCallVoice = useCallback(
    (voice: CallVoiceType) => {
      activeCallVoiceRef.current = voice;
      setActiveCallVoice(voice);
      skyAudio.callVoice = voice;
      skyAudio.playSkyCall(1.0, 0.75, false, voice);
      const nextSave: PersistentSaveData = {
        ...saveDataRef.current,
        activeCallVoice: voice,
      };
      commitSaveData(nextSave);
      showBanner(`已切换呼唤音色为「${voice}」并播放试听共鸣！`);
    },
    [commitSaveData, showBanner]
  );

  // Trigger Wing Flap [Space]
  const handleTriggerFlap = useCallback(() => {
    jumpJustPressedRef.current = true;
    squashScaleYRef.current = 1.22;
    skyAudio.playWingFlap();
    spawnBurstRef.current?.(
      physicsRef.current.x,
      physicsRef.current.y + 0.9,
      physicsRef.current.z,
      10,
      2.5
    );
    if (playerRigRef.current) {
      wingTrailRef.current?.burstWingTipClouds(playerRigRef.current, 8);
    }
  }, []);

  // Toggle Flight Mode [Shift]
  const handleToggleFlightMode = useCallback(() => {
    toggleFlightJustPressedRef.current = true;
  }, []);

  // Toggle Sit / Shrine Meditate / Bench Sit Alongside [Z]
  const handleToggleSit = useCallback(() => {
    toggleSitJustPressedRef.current = true;
    skyAudio.playCandleIgnite();
  }, []);

  // Set Aerial Dive Held [X / Ctrl / HUD Button]
  const handleSetDiveHeld = useCallback((held: boolean) => {
    diveHeldRef.current = held;
    if (held && physicsRef.current.grounded) {
      // If player clicks Dive while on the ground, launch into an initial leap + glide so they can test diving immediately!
      jumpJustPressedRef.current = true;
    }
  }, []);

  // Stage 1, 2 & 3 Quick Debug Teleport (supports optional targetRealm switch + immediate camera snap)
  const handleDebugTeleport = useCallback(
    (
      tx: number,
      ty: number,
      tz: number,
      label: string,
      targetRealm?: RealmId
    ) => {
      const activeRealm = targetRealm || progressRef.current.currentRealm;
      if (targetRealm && progressRef.current.currentRealm !== targetRealm) {
        progressRef.current = {
          ...progressRef.current,
          currentRealm: targetRealm,
        };
        setProgress({ ...progressRef.current });
        const newInteractables = createWorldInteractables(targetRealm).map(
          (item) =>
            (item.type === 'easter_egg' &&
              saveDataRef.current.discoveredEasterEggIds?.includes(item.id)) ||
            (item.type === 'ancestor_spirit' &&
              item.spiritId &&
              saveDataRef.current.relivedSpiritIds?.includes(item.spiritId))
              ? { ...item, activated: true }
              : item
        );
        interactablesRef.current = newInteractables;
        populateInteractablesFnRef.current?.();
        applySceneAtmosphere(targetRealm, dayNightPhaseRef.current);
      }
      const floorY = groundHeightAt(tx, tz);
      const isAirborneTarget = ty > floorY + 1.2;
      const finalY = isAirborneTarget ? ty : floorY;
      diveHeldRef.current = false;

      const stepRes = stepPlayerPhysics(
        {
          ...physicsRef.current,
          x: tx,
          y: finalY,
          z: tz,
          vx: 0,
          vy: 0,
          vz: isAirborneTarget ? -4.5 : 0,
          yaw: Math.PI,
          grounded: !isAirborneTarget,
          flightMode: isAirborneTarget ? 'glide' : physicsRef.current.flightMode,
          isDiving: false,
          diveMomentum: 0,
          sitMode: 'none',
        },
        {
          moveX: 0,
          moveZ: 0,
          jumpJustPressed: false,
          jumpHeld: false,
          toggleFlightModeJustPressed: false,
          sprintHeld: false,
          cameraYaw: 0,
          realmId: activeRealm,
        },
        0.016,
        loadoutRef.current
      );
      physicsRef.current = stepRes.nextState;

      if (playerRigRef.current) {
        playerRigRef.current.root.position.set(
          physicsRef.current.x,
          physicsRef.current.y,
          physicsRef.current.z
        );
        playerRigRef.current.root.rotation.set(
          physicsRef.current.pitch,
          physicsRef.current.yaw,
          physicsRef.current.roll
        );
        wingTrailRef.current?.resetRibbonHistory(playerRigRef.current);
      }
      if (cameraRef.current) {
        cameraYawRef.current = 0;
        cameraRef.current.position.set(tx, finalY + 3.4, tz + 7.6);
        cameraRef.current.lookAt(tx, finalY + 1.5, tz - 2.0);
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      const nearest = findNearestInteractable(
        physicsRef.current.x,
        physicsRef.current.y,
        physicsRef.current.z,
        interactablesRef.current
      );
      nearestInteractableRef.current = nearest;
      setNearestInteractable(nearest);
      setPhysics({ ...physicsRef.current });
      skyAudio.startAmbientMusic();
      showBanner(`已传送至测试点：${label}`);
    },
    [applySceneAtmosphere, showBanner]
  );

  // Stage 2 Simulate Temporary Wedge Loss & Drain
  const handleDebugSimulateWedgeLoss = useCallback(() => {
    const p = physicsRef.current;
    const nextLost = Math.min(p.maxWingWedges - 1, p.tempLostWedges + 1.5);
    const nextEnergy = Math.max(
      0.5,
      Math.min(p.wingEnergy - 2.5, p.maxWingWedges - nextLost)
    );
    physicsRef.current = {
      ...p,
      tempLostWedges: nextLost,
      wingEnergy: nextEnergy,
      energyChangeSource: 'krill_strike',
      netEnergyRatePerSec: -2.0,
    };
    setPhysics({ ...physicsRef.current });
    skyAudio.playHazardAlert();
    showBanner(
      '已模拟暗黑冲击掉翼：受损 1.5 格翼能！靠近神龛、蜡烛或同伴即可自动修复回能'
    );
  }, [showBanner]);

  // Stage 5 & 6: Trigger Emote with Lv.1–5 amplitude, particle burst scaling & WebSocket broadcast
  const handleTriggerEmote = useCallback(
    (emoteId: string, levelOverride?: number) => {
      const lv =
        levelOverride ?? saveDataRef.current.emoteLevels[emoteId] ?? 1;
      const spec = computeEmoteLevelSpec(emoteId, lv);
      activeEmoteLevelRef.current = spec.level;
      setActiveEmoteLevel(spec.level);

      progressRef.current = {
        ...progressRef.current,
        activeEmote: emoteId,
        activeEmoteTimer: spec.durationSec,
      };
      setProgress({ ...progressRef.current });
      skyAudio.playCandleIgnite();
      networkClient.broadcastEvent('player:emote', {
        emoteId,
        level: spec.level,
      });
      spawnBurstRef.current?.(
        physicsRef.current.x,
        physicsRef.current.y + 1.4,
        physicsRef.current.z,
        spec.particleCount,
        4.5 + spec.level * 0.7
      );
      showBanner(
        `✨ 正在施展先祖动作「${emoteId}」(${spec.label} · 动作幅度 ${spec.motionScale}x · ${spec.auraDescription})`
      );
    },
    [showBanner]
  );

  // Stage 5: Upgrade or cycle Emote Level (Lv.1–5) directly for expression testing
  const handleUpgradeEmoteLevel = useCallback(
    (emoteId: string, nextLevel: number) => {
      const nextSave = setEmoteLevelPure(
        saveDataRef.current,
        emoteId,
        nextLevel
      );
      commitSaveData(nextSave);
      activeEmoteLevelRef.current = nextLevel;
      setActiveEmoteLevel(nextLevel);
    },
    [commitSaveData]
  );

  // Stage 5: Submit Shrine Meditation Blessing Note (+1 Heart daily reward & full energy recharge)
  const handleSubmitMeditationNote = useCallback(
    (text: string) => {
      const res = submitMeditationNotePure(saveDataRef.current, text);
      commitSaveData(res.nextSave);
      physicsRef.current = {
        ...physicsRef.current,
        sitMode: 'meditate_shrine',
        locomotionMode: 'meditate_shrine',
        wingEnergy: physicsRef.current.maxWingWedges,
        tempLostWedges: 0,
      };
      setPhysics({ ...physicsRef.current });
      skyAudio.playWingedLightAbsorb();
      spawnBurstRef.current?.(
        physicsRef.current.x,
        physicsRef.current.y + 1.4,
        physicsRef.current.z,
        32,
        6.5
      );
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  // Stage 6: Simulate WebSocket Disconnect, Offline Reliable Buffering & Automatic Reconnect
  const handleSimulateReconnect = useCallback(() => {
    networkClient.simulateDisconnectAndReconnect(900);
    setNetStatus(networkClient.getStatusSnapshot());
    showBanner(
      '🔌 已触发模拟断线与重连：离线期间可靠事件已进入缓冲队列，约 0.9s 后自动重连并恢复房间同步！'
    );
  }, [showBanner]);

  // Stage 6: Cycle Bot Traveler AI Mode ('patrol' -> 'follow' -> 'gather')
  const handleCycleBotAiMode = useCallback(() => {
    const nextMode = networkClient.cycleBotAiMode();
    setNetStatus(networkClient.getStatusSnapshot());
    const labelMap: Record<string, string> = {
      patrol: '星坛漫步巡逻 (Patrol)',
      follow: '结伴跟随旅人 (Follow)',
      gather: '环绕共鸣合奏 (Gather)',
    };
    showBanner(`🤖 机器人旅人 AI 已切换为：「${labelMap[nextMode] || nextMode}」`);
  }, [showBanner]);

  // Stage 6: Trigger Bot Traveler Ensemble Resonance (Call Ring + Emote + Harmony Chord)
  const handleTriggerBotEnsemble = useCallback(() => {
    networkClient.triggerBotEnsembleResponse();
    setLatestChatBubble({
      senderName: '云野牧蝶人',
      text: '收到你的星音呼唤！一起合奏振翅高飞吧 ✦',
    });
    spawnBurstRef.current?.(
      physicsRef.current.x,
      physicsRef.current.y + 1.5,
      physicsRef.current.z,
      28,
      6.0
    );
    showBanner(
      '🎶 3位机器人旅人已同步回应呼唤、施展引蝶与旋转舞，并合奏五声竖琴和弦！'
    );
  }, [showBanner]);

  // Stage 6: Request Switch 8-Player Room Instance
  const handleSwitchRoomInstance = useCallback(() => {
    networkClient.requestSwitchRoomInstance();
    showBanner(
      '🌐 已向匹配服务器请求切换新的 8 人房间分线实例（房间上限：普通区域 8 人 / 遇境营地 16 人）'
    );
  }, [showBanner]);

  // Trigger Context Interaction [E / F]
  const handleTriggerInteract = useCallback(() => {
    if (activeSpiritMemoryRef.current) {
      // Advance active 3-step Spirit Memory Quest if currently reliving a spirit!
      const currentQuest = activeSpiritMemoryRef.current;
      const res = advanceSpiritMemoryStepPure(currentQuest, saveDataRef.current);
      activeSpiritMemoryRef.current = res.nextQuest;
      setActiveSpiritMemory(res.nextQuest);
      if (res.nextQuest) {
        const nextStep =
          res.nextQuest.steps[res.nextQuest.currentStepIndex - 1];
        handleDebugTeleport(
          nextStep.x,
          nextStep.y,
          nextStep.z + 1.2,
          `${res.nextQuest.spiritName} · ${nextStep.title}`,
          res.nextQuest.realmId as RealmId
        );
        skyAudio.playCandleIgnite();
        spawnBurstRef.current?.(nextStep.x, nextStep.y + 1.2, nextStep.z, 26, 6.2);
        showBanner(res.message);
      } else if (res.completed) {
        commitSaveData(res.nextSave);
        progressRef.current = {
          ...progressRef.current,
          candles: res.nextSave.candles,
          wax: res.nextSave.candleWax,
          hearts: res.nextSave.hearts,
          ascendedCandles: res.nextSave.ascendedCandles,
        };
        setProgress({ ...progressRef.current });
        skyAudio.playWingedLightAbsorb();
        spawnBurstRef.current?.(
          physicsRef.current.x,
          physicsRef.current.y + 1.6,
          physicsRef.current.z,
          36,
          8.5
        );
        showBanner(res.message);
      }
      return;
    }

    let target = nearestInteractableRef.current;

    if (!target) {
      const px = physicsRef.current.x;
      const pz = physicsRef.current.z;
      let closestAny: WorldInteractable | null = null;
      let closestDist = Infinity;
      for (const item of interactablesRef.current) {
        if (item.activated && item.type !== 'temple_altar') continue;
        const d = Math.hypot(item.x - px, item.z - pz);
        if (d < closestDist) {
          closestDist = d;
          closestAny = item;
        }
      }
      if (closestAny) {
        const gY = groundHeightAt(closestAny.x, closestAny.z);
        const safePos = resolveObstacleCollisions(
          closestAny.x,
          gY,
          closestAny.z + 1.2,
          0.44
        );
        const finalGroundY = groundHeightAt(safePos.x, safePos.z);
        physicsRef.current = {
          ...physicsRef.current,
          x: safePos.x,
          y: finalGroundY,
          z: safePos.z,
        };
        if (playerRigRef.current) {
          playerRigRef.current.root.position.set(
            safePos.x,
            finalGroundY,
            safePos.z
          );
          wingTrailRef.current?.resetRibbonHistory(playerRigRef.current);
        }
        target = closestAny;
      }
    }

    if (!target) return;

    const result = applyInteraction(
      target,
      progressRef.current,
      physicsRef.current,
      loadoutRef.current
    );

    progressRef.current = result.nextProgress;
    if (activeSpellIdRef.current === 'spell_golden_aegis') {
      result.nextPhysics.wingEnergy = Math.max(
        result.nextPhysics.wingEnergy,
        result.nextPhysics.maxWingWedges + 2
      );
    }
    physicsRef.current = result.nextPhysics;
    if (target.type === 'starlight_elevator' && playerRigRef.current) {
      playerRigRef.current.root.position.set(
        physicsRef.current.x,
        physicsRef.current.y,
        physicsRef.current.z
      );
      wingTrailRef.current?.resetRibbonHistory(playerRigRef.current);
    }

    interactablesRef.current = interactablesRef.current.map((item) =>
      item.id === target!.id ? result.updatedTarget : item
    );

    if (
      target.type === 'winged_light' ||
      target.type === 'dark_plant' ||
      target.type === 'dark_crab'
    ) {
      const meshGroup = interactableMeshesRef.current.get(target.id);
      if (meshGroup) meshGroup.visible = false;
      skyAudio.playWingedLightAbsorb();
    } else if (
      target.type === 'ancestor_spirit' ||
      target.type === 'temple_altar' ||
      target.type === 'eden_statue' ||
      target.type === 'starlight_elevator' ||
      target.type === 'coop_door' ||
      target.type === 'race_ring'
    ) {
      skyAudio.playWingedLightAbsorb();
    } else {
      skyAudio.playCandleIgnite();
    }

    spawnBurstRef.current?.(target.x, target.y + 1.2, target.z, 24, 6.5);

    // Sync currencies and quest progress into persistent save
    const nextQuests = saveDataRef.current.dailyQuests.map((q) => {
      if (target!.type === 'candle_cluster' && q.type === 'ignite_candles') {
        return {
          ...q,
          currentCount: Math.min(q.targetCount, q.currentCount + 1),
        };
      }
      if (target!.type === 'ancestor_spirit' && q.type === 'relive_spirit') {
        return {
          ...q,
          currentCount: Math.min(q.targetCount, q.currentCount + 1),
        };
      }
      if (target!.type === 'dark_plant' && q.type === 'burn_dark_plant') {
        return {
          ...q,
          currentCount: Math.min(q.targetCount, q.currentCount + 1),
        };
      }
      return q;
    });

    const nextRelivedSpirits =
      target.type === 'ancestor_spirit' &&
      target.spiritId &&
      !saveDataRef.current.relivedSpiritIds.includes(target.spiritId)
        ? [...saveDataRef.current.relivedSpiritIds, target.spiritId]
        : saveDataRef.current.relivedSpiritIds;

    const baseNextSave: PersistentSaveData = {
      ...saveDataRef.current,
      candles: result.nextProgress.candles,
      candleWax: result.nextProgress.wax,
      hearts: result.nextProgress.hearts,
      wingedLights: result.nextProgress.wingedLights,
      ascendedCandles: result.nextProgress.ascendedCandles,
      seasonCandles: result.nextProgress.seasonCandles,
      relivedSpiritIds: nextRelivedSpirits,
      dailyQuests: nextQuests,
    };

    let finalBanner = result.bannerMessage;
    if (target.type === 'easter_egg') {
      const eggRes = discoverEasterEggPure(saveDataRef.current, target.id);
      const mergedEggSave: PersistentSaveData = {
        ...eggRes.nextSave,
        dailyQuests: nextQuests,
      };
      commitSaveData(mergedEggSave);
      const newMaxWedges = calculateWingWedges(
        mergedEggSave.wingedLights,
        loadoutRef.current
      );
      physicsRef.current = {
        ...physicsRef.current,
        maxWingWedges: newMaxWedges,
        wingEnergy: newMaxWedges,
      };
      skyAudio.playWingedLightAbsorb();
      spawnBurstRef.current?.(target.x, target.y + 1.8, target.z, 42, 8.5);
      finalBanner = eggRes.message;
    } else {
      commitSaveData(baseNextSave);
    }

    const nextNearest = findNearestInteractable(
      physicsRef.current.x,
      physicsRef.current.y,
      physicsRef.current.z,
      interactablesRef.current
    );
    nearestInteractableRef.current = nextNearest;

    setProgress({ ...progressRef.current });
    setPhysics({ ...physicsRef.current });
    setNearestInteractable(nextNearest);
    showBanner(finalBanner);

    if (result.ascendedAtTemple) {
      gameStateRef.current = 'gameover';
      document.body.dataset.state = 'gameover';
      setGameState('gameover');
    }
  }, [commitSaveData, handleDebugTeleport, showBanner]);

  // Reset Position / Restart Realm
  const handleResetPosition = useCallback(() => {
    const resetPhys = createInitialPhysicsState(loadoutRef.current);
    resetPhys.maxWingWedges = calculateWingWedges(
      progressRef.current.wingedLights,
      loadoutRef.current
    );
    resetPhys.wingEnergy = resetPhys.maxWingWedges;
    physicsRef.current = resetPhys;
    setPhysics({ ...resetPhys });
    if (playerRigRef.current) {
      wingTrailRef.current?.resetRibbonHistory(playerRigRef.current);
    }
    gameStateRef.current = 'playing';
    document.body.dataset.state = 'playing';
    setGameState('playing');
    showBanner('已返回遇境中央星盘祭坛，光之翼能量已回满！');
  }, [showBanner]);

  // Stage 4: Start 3-Step Spirit Memory Reliving Flow
  const handleStartSpiritMemoryQuest = useCallback(
    (spiritId: string) => {
      const quest = startSpiritMemoryQuestPure(spiritId);
      if (!quest) {
        showBanner('该先祖记忆已在星盘唤醒！');
        return;
      }
      activeSpiritMemoryRef.current = quest;
      setActiveSpiritMemory(quest);
      const step1 = quest.steps[0];
      handleDebugTeleport(
        step1.x,
        step1.y,
        step1.z + 1.4,
        `${quest.spiritName} · ${step1.title}`,
        quest.realmId as RealmId
      );
      skyAudio.playCandleIgnite();
      spawnBurstRef.current?.(step1.x, step1.y + 1.2, step1.z, 22, 5.5);
      showBanner(`✦ 已触发先祖记忆：「${quest.spiritName}」— ${step1.title}`);
    },
    [handleDebugTeleport, showBanner]
  );

  // Stage 4: Advance active Spirit Memory Quest step-by-step
  const handleAdvanceSpiritMemory = useCallback(() => {
    const currentQuest = activeSpiritMemoryRef.current;
    if (!currentQuest) {
      handleStartSpiritMemoryQuest('spirit_prairie_butterfly');
      return;
    }

    const res = advanceSpiritMemoryStepPure(currentQuest, saveDataRef.current);
    activeSpiritMemoryRef.current = res.nextQuest;
    setActiveSpiritMemory(res.nextQuest);

    if (res.nextQuest) {
      const nextStep =
        res.nextQuest.steps[res.nextQuest.currentStepIndex - 1];
      handleDebugTeleport(
        nextStep.x,
        nextStep.y,
        nextStep.z + 1.2,
        `${res.nextQuest.spiritName} · ${nextStep.title}`,
        res.nextQuest.realmId as RealmId
      );
      skyAudio.playCandleIgnite();
      spawnBurstRef.current?.(nextStep.x, nextStep.y + 1.2, nextStep.z, 26, 6.2);
      showBanner(res.message);
    } else if (res.completed) {
      commitSaveData(res.nextSave);
      const nextAwakened = progressRef.current.awakenedSpirits.includes(
        currentQuest.emoteUnlocked
      )
        ? progressRef.current.awakenedSpirits
        : [...progressRef.current.awakenedSpirits, currentQuest.emoteUnlocked];
      progressRef.current = {
        ...progressRef.current,
        candles: res.nextSave.candles,
        wax: res.nextSave.candleWax,
        hearts: res.nextSave.hearts,
        ascendedCandles: res.nextSave.ascendedCandles,
        awakenedSpirits: nextAwakened,
      };
      physicsRef.current = {
        ...physicsRef.current,
        wingEnergy: physicsRef.current.maxWingWedges,
        tempLostWedges: 0,
      };
      setProgress({ ...progressRef.current });
      setPhysics({ ...physicsRef.current });
      skyAudio.playWingedLightAbsorb();
      spawnBurstRef.current?.(
        physicsRef.current.x,
        physicsRef.current.y + 1.6,
        physicsRef.current.z,
        36,
        8.5
      );
      showBanner(res.message);
    }
  }, [commitSaveData, handleDebugTeleport, handleStartSpiritMemoryQuest, showBanner]);

  // Stage 4: Forge White Candles from Wax (with daily cap enforcement)
  const handleForgeCandleWax = useCallback(
    (waxAmount: number) => {
      const res = forgeCandlesFromWaxPure(saveDataRef.current, waxAmount);
      commitSaveData(res.nextSave);
      progressRef.current = {
        ...progressRef.current,
        candles: res.nextSave.candles,
        wax: res.nextSave.candleWax,
      };
      setProgress({ ...progressRef.current });
      skyAudio.playCandleIgnite();
      spawnBurstRef.current?.(
        physicsRef.current.x,
        physicsRef.current.y + 1.4,
        physicsRef.current.z,
        20,
        5.5
      );
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  // Stage 4: Save Import & Reset Handlers
  const handleImportSaveData = useCallback(
    (rawJson: string) => {
      const res = storageService.importSaveJson(rawJson);
      if (res.success && res.save) {
        commitSaveData(res.save);
        loadoutRef.current = res.save.equippedLoadout;
        setLoadout(res.save.equippedLoadout);
        progressRef.current = {
          ...progressRef.current,
          candles: res.save.candles,
          wax: res.save.candleWax,
          hearts: res.save.hearts,
          wingedLights: res.save.wingedLights,
          ascendedCandles: res.save.ascendedCandles,
          seasonCandles: res.save.seasonCandles,
        };
        setProgress({ ...progressRef.current });
      }
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  const handleResetSaveData = useCallback(() => {
    const fresh = storageService.resetToDefault();
    commitSaveData(fresh);
    loadoutRef.current = fresh.equippedLoadout;
    setLoadout(fresh.equippedLoadout);
    progressRef.current = {
      ...progressRef.current,
      candles: fresh.candles,
      wax: fresh.candleWax,
      hearts: fresh.hearts,
      wingedLights: fresh.wingedLights,
      ascendedCandles: fresh.ascendedCandles,
      seasonCandles: fresh.seasonCandles,
    };
    setProgress({ ...progressRef.current });
    showBanner('已重置为初始存档（localStorage 与 IndexedDB 已同步刷新）');
  }, [commitSaveData, showBanner]);

  // Constellation & Social Modal Handlers
  const handleUnlockConstellationNode = useCallback(
    (spiritId: string, nodeId: string) => {
      const res = unlockConstellationNodePure(
        saveDataRef.current,
        spiritId,
        nodeId
      );
      if (res.success) {
        skyAudio.playWingedLightAbsorb();
        commitSaveData(res.nextSave);
        progressRef.current = {
          ...progressRef.current,
          candles: res.nextSave.candles,
          hearts: res.nextSave.hearts,
          seasonCandles: res.nextSave.seasonCandles,
          ascendedCandles: res.nextSave.ascendedCandles,
          wingedLights: res.nextSave.wingedLights,
        };
        setProgress({ ...progressRef.current });
      }
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  const handleUnlockFriendNode = useCallback(
    (peerId: string, nodeId: string) => {
      const res = unlockFriendTreeNodePure(saveDataRef.current, peerId, nodeId);
      if (res.success) {
        skyAudio.playWingedLightAbsorb();
        commitSaveData(res.nextSave);
        progressRef.current = {
          ...progressRef.current,
          candles: res.nextSave.candles,
          hearts: res.nextSave.hearts,
        };
        setProgress({ ...progressRef.current });
      }
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  // Stage 7: Ignite Stranger Silhouette -> Reveal True Appearance
  const handleIgnitePeer = useCallback(
    (peerId: string) => {
      const peer = networkClient.remoteTravelers.get(peerId);
      const res = igniteStrangerPure(
        saveDataRef.current,
        peerId,
        peer?.playerName
      );
      if (res.newlyIgnited) {
        commitSaveData(res.nextSave);
        progressRef.current = {
          ...progressRef.current,
          activeEmote: 'emote_ignite',
          activeEmoteTimer: 3.0,
        };
        setProgress({ ...progressRef.current });
        skyAudio.playCandleIgnite();
        networkClient.triggerSocialInteractionWithPeer(
          peerId,
          'ignite',
          physicsRef.current
        );
        networkClient.broadcastEvent('social:ignite', { targetPeerId: peerId });
        spawnBurstRef.current?.(
          physicsRef.current.x,
          physicsRef.current.y + 1.35,
          physicsRef.current.z,
          28,
          6.0
        );
      }
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  // Stage 7: Send or Accept Friend Request (1 White Candle + Custom Nickname)
  const handleSendFriendRequest = useCallback(
    (peerId: string, customNickname?: string) => {
      // Auto-ignite first if the player clicks Friend Request on an unignited stranger
      let workingSave = saveDataRef.current;
      if (!workingSave.friends[peerId]?.ignited) {
        const ign = igniteStrangerPure(workingSave, peerId);
        workingSave = ign.nextSave;
      }
      const res = sendOrAcceptFriendRequestPure(
        workingSave,
        peerId,
        customNickname
      );
      if (res.success) {
        commitSaveData(res.nextSave);
        progressRef.current = {
          ...progressRef.current,
          candles: res.nextSave.candles,
          activeEmote: 'emote_bow_respect',
          activeEmoteTimer: 3.2,
        };
        setProgress({ ...progressRef.current });
        skyAudio.playWingedLightAbsorb();
        networkClient.triggerSocialInteractionWithPeer(
          peerId,
          'friend_request',
          physicsRef.current
        );
        networkClient.broadcastEvent('social:friend_request', {
          targetPeerId: peerId,
          customNickname,
        });
        spawnBurstRef.current?.(
          physicsRef.current.x,
          physicsRef.current.y + 1.5,
          physicsRef.current.z,
          32,
          6.8
        );
      }
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  // Stage 7: Rename Friend Nickname
  const handleRenameFriend = useCallback(
    (peerId: string, newNickname: string) => {
      const res = renameFriendNicknamePure(
        saveDataRef.current,
        peerId,
        newNickname
      );
      if (res.success) {
        commitSaveData(res.nextSave);
        skyAudio.playCandleIgnite();
      }
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  // Stage 7: Teleport to Friend (Constellation Warp)
  const handleTeleportToFriend = useCallback(
    (peerId: string) => {
      const peer = networkClient.remoteTravelers.get(peerId);
      const targetCoords = peer
        ? {
            x: peer.x,
            y: peer.y,
            z: peer.z,
            yaw: peer.yaw,
            realmId: progressRef.current.currentRealm,
          }
        : {
            x: 2.4,
            y: 1.2,
            z: 1.4,
            yaw: -0.65,
            realmId: progressRef.current.currentRealm,
          };
      const res = computeTeleportToFriendPure(
        saveDataRef.current,
        peerId,
        targetCoords
      );
      if (!res.success) {
        showBanner(res.message);
        return;
      }
      const rawGround = groundHeightAt(res.targetX, res.targetZ);
      const safeFriendPos = resolveObstacleCollisions(
        res.targetX,
        Math.max(rawGround, res.targetY),
        res.targetZ,
        0.44
      );
      const yGround = groundHeightAt(safeFriendPos.x, safeFriendPos.z);
      const finalFriendY = Math.max(yGround, res.targetY);
      physicsRef.current = {
        ...physicsRef.current,
        x: safeFriendPos.x,
        y: finalFriendY,
        z: safeFriendPos.z,
        vx: 0,
        vy: 0,
        vz: 0,
        yaw: res.targetYaw,
        grounded: true,
        locomotionMode: 'idle',
        sitMode: 'none',
      };
      if (playerRigRef.current) {
        playerRigRef.current.root.position.set(
          safeFriendPos.x,
          finalFriendY,
          safeFriendPos.z
        );
        wingTrailRef.current?.resetRibbonHistory(playerRigRef.current);
      }
      setPhysics({ ...physicsRef.current });
      setConstellationModalOpen(false);
      skyAudio.playWingedLightAbsorb();
      spawnBurstRef.current?.(
        safeFriendPos.x,
        finalFriendY + 1.4,
        safeFriendPos.z,
        34,
        7.2
      );
      showBanner(res.message);
    },
    [showBanner]
  );

  // Stage 7: Execute Dual Social Action (Hand-Hold, High-Five, Warm Hug, Piggyback Carry, Release)
  const handleExecuteDualAction = useCallback(
    (
      peerId: string,
      actionType: 'hand_hold' | 'high_five' | 'hug' | 'carry' | 'release'
    ) => {
      let workingSave = saveDataRef.current;
      // If triggered from debug mode on bot_traveller_2 for carry, ensure ft_carry is unlocked
      if (
        actionType === 'carry' &&
        workingSave.friends[peerId] &&
        !workingSave.friends[peerId].unlockedNodes.includes('ft_carry')
      ) {
        workingSave = {
          ...workingSave,
          friends: {
            ...workingSave.friends,
            [peerId]: {
              ...workingSave.friends[peerId],
              unlockedNodes: [
                ...workingSave.friends[peerId].unlockedNodes,
                'ft_carry',
              ],
            },
          },
        };
        commitSaveData(workingSave);
      }

      const res = executeDualSocialActionPure(
        workingSave,
        physicsRef.current,
        peerId,
        actionType
      );
      if (!res.success) {
        showBanner(res.message);
        return;
      }

      networkClient.dualActionPartnerId = res.nextPartnerId;
      networkClient.dualActionMode = res.nextDualMode;
      setDualActionPartnerId(res.nextPartnerId);
      setDualActionMode(res.nextDualMode);

      physicsRef.current = {
        ...res.nextPhysics,
        energyChangeSource:
          actionType === 'hug' || actionType === 'high_five'
            ? 'companion'
            : physicsRef.current.energyChangeSource,
      };
      setPhysics({ ...physicsRef.current });

      if (res.activeEmote) {
        progressRef.current = {
          ...progressRef.current,
          activeEmote: res.activeEmote,
          activeEmoteTimer: 3.4,
        };
        setProgress({ ...progressRef.current });
      }

      if (actionType === 'high_five' || actionType === 'hug') {
        networkClient.triggerSocialInteractionWithPeer(
          peerId,
          actionType,
          physicsRef.current
        );
        skyAudio.playWingedLightAbsorb();
      } else {
        skyAudio.playCandleIgnite();
      }

      networkClient.broadcastEvent('social:dual_action', {
        targetPeerId: peerId,
        actionType,
      });
      spawnBurstRef.current?.(
        physicsRef.current.x,
        physicsRef.current.y + 1.45,
        physicsRef.current.z,
        actionType === 'hug' ? 38 : 24,
        actionType === 'hug' ? 7.5 : 5.5
      );
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  // Stage 7: Toggle Block Peer
  const handleToggleBlockPeer = useCallback(
    (peerId: string) => {
      const res = toggleBlockPeerPure(saveDataRef.current, peerId);
      commitSaveData(res.nextSave);
      if (res.isBlocked && networkClient.dualActionPartnerId === peerId) {
        networkClient.dualActionPartnerId = null;
        networkClient.dualActionMode = 'none';
        setDualActionPartnerId(null);
        setDualActionMode('none');
      }
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  // Stage 7: Report Peer & Auto-Block
  const handleReportPeer = useCallback(
    (peerId: string, reason: string) => {
      const res = reportPeerPure(saveDataRef.current, peerId, reason);
      commitSaveData(res.nextSave);
      if (networkClient.dualActionPartnerId === peerId) {
        networkClient.dualActionPartnerId = null;
        networkClient.dualActionMode = 'none';
        setDualActionPartnerId(null);
        setDualActionMode('none');
      }
      networkClient.broadcastEvent('social:report', {
        targetPeerId: peerId,
        reason,
      });
      if (typeof window !== 'undefined') {
        fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reporterId: res.nextSave.playerId,
            peerId,
            nickname: res.nextSave.friends[peerId]?.nickname || peerId,
            reason,
          }),
        }).catch(() => {});
      }
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  const handleSetDualAction = useCallback(
    (
      peerId: string | null,
      mode: 'none' | 'hand_hold' | 'carry' | 'bench_sit'
    ) => {
      networkClient.dualActionPartnerId = peerId;
      networkClient.dualActionMode = mode;
      setDualActionPartnerId(peerId);
      setDualActionMode(mode);
      skyAudio.playCandleIgnite();
      if (mode === 'hand_hold') {
        showBanner('已与旅人牵手同步飞行 · 靠近彼此将持续充能光之翼！');
      } else if (mode === 'carry') {
        showBanner('已发起背抱协同 · 旅人正骑在你的肩头一同翱翔！');
      } else {
        showBanner('已松开双人协作，恢复自由探索');
      }
    },
    [showBanner]
  );

  const handleSendFriendChat = useCallback(
    (peerId: string, text: string) => {
      const filtered = filterSensitiveChat(text);
      setLatestChatBubble({
        senderName: saveDataRef.current.playerName,
        text: filtered,
      });
      networkClient.broadcastEvent('social:chat', {
        targetPeerId: peerId,
        senderId: saveDataRef.current.playerId,
        senderName: saveDataRef.current.playerName,
        text: filtered,
      });
      showBanner(`星语已发送：「${filtered}」`);
    },
    [showBanner]
  );

  const handleGiftHeart = useCallback(
    (peerId: string) => {
      const today = getTodayUtcDateString();
      const friend = saveDataRef.current.friends[peerId];
      if (!friend) return;
      if (friend.lastGiftedDate === today) {
        showBanner('今日已向该好友赠送过爱心，请明日重置后再来！');
        return;
      }
      if (saveDataRef.current.candles < 3) {
        showBanner('白蜡烛不足 3 根，无法互赠心火！');
        return;
      }
      const nextSave: PersistentSaveData = {
        ...saveDataRef.current,
        candles: saveDataRef.current.candles - 3,
        hearts: saveDataRef.current.hearts + 1,
        dailyHeartsReceived: saveDataRef.current.dailyHeartsReceived + 1,
        friends: {
          ...saveDataRef.current.friends,
          [peerId]: {
            ...friend,
            lastGiftedDate: today,
          },
        },
        dailyQuests: saveDataRef.current.dailyQuests.map((q) =>
          q.type === 'gift_friend'
            ? {
                ...q,
                currentCount: Math.min(q.targetCount, q.currentCount + 1),
              }
            : q
        ),
      };
      commitSaveData(nextSave);
      skyAudio.playWingedLightAbsorb();
      showBanner(`已向「${friend.nickname}」赠送 3 根蜡烛并收到回礼 +1 爱心！`);
    },
    [commitSaveData, showBanner]
  );

  const handleProgressDailyQuest = useCallback(
    (questId: string, delta = 1) => {
      const res = progressDailyQuestPure(saveDataRef.current, questId, delta);
      if (res.progressedIds.length > 0) {
        commitSaveData(res.nextSave);
        skyAudio.playCandleIgnite();
      }
      const updatedQuest = res.nextSave.dailyQuests.find(
        (q) => q.id === questId
      );
      showBanner(
        res.newlyCompletedTitle
          ? `✅ 每日任务「${res.newlyCompletedTitle}」已完成！可点击领取奖励`
          : updatedQuest
            ? `已推进每日任务「${updatedQuest.title}」(${updatedQuest.currentCount}/${updatedQuest.targetCount})`
            : '已推进每日任务进度'
      );
    },
    [commitSaveData, showBanner]
  );

  const handleClaimQuest = useCallback(
    (questId: string) => {
      const res = claimDailyQuestPure(saveDataRef.current, questId);
      if (res.success) {
        commitSaveData(res.nextSave);
        skyAudio.playWingedLightAbsorb();
        spawnBurstRef.current?.(
          physicsRef.current.x,
          physicsRef.current.y + 1.5,
          physicsRef.current.z,
          24,
          6.0
        );
      }
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  const handleDebugCompleteAndClaimDailyQuest = useCallback(() => {
    const firstUnclaimed =
      saveDataRef.current.dailyQuests.find((q) => !q.claimed) ||
      saveDataRef.current.dailyQuests[0];
    if (!firstUnclaimed) return;
    const progRes = progressDailyQuestPure(
      saveDataRef.current,
      firstUnclaimed.id,
      firstUnclaimed.targetCount
    );
    const claimRes = claimDailyQuestPure(progRes.nextSave, firstUnclaimed.id);
    commitSaveData(claimRes.nextSave);
    skyAudio.playWingedLightAbsorb();
    spawnBurstRef.current?.(
      physicsRef.current.x,
      physicsRef.current.y + 1.5,
      physicsRef.current.z,
      26,
      6.5
    );
    showBanner(
      claimRes.success
        ? claimRes.message
        : `已完成今日向导任务「${firstUnclaimed.title}」进度 (${firstUnclaimed.targetCount}/${firstUnclaimed.targetCount})！`
    );
  }, [commitSaveData, showBanner]);

  const handleRerollQuests = useCallback(() => {
    if (saveDataRef.current.dailyRerollsUsed >= 1) return;
    const pool = [...GAME_CONFIG.dailyQuestsPool].reverse().slice(0, 4);
    const nextSave: PersistentSaveData = {
      ...saveDataRef.current,
      dailyRerollsUsed: saveDataRef.current.dailyRerollsUsed + 1,
      dailyQuests: pool.map((q) => ({
        id: q.id,
        title: q.title,
        type: q.type,
        currentCount: 0,
        targetCount: q.targetCount,
        rewardType: q.rewardType as 'seasonCandles' | 'hearts',
        rewardAmount: q.rewardAmount,
        claimed: false,
      })),
    };
    commitSaveData(nextSave);
    showBanner('已刷新今日向导先祖任务列表！');
  }, [commitSaveData, showBanner]);

  const handleSwitchSeason = useCallback(
    (seasonId: string) => {
      const nextSave: PersistentSaveData = {
        ...saveDataRef.current,
        activeSeasonId: seasonId,
      };
      commitSaveData(nextSave);
      showBanner('已切换当前季节主题！');
    },
    [commitSaveData, showBanner]
  );

  const handleCompleteSeasonStoryAct = useCallback(
    (actId?: string) => {
      const res = completeSeasonStoryActPure(saveDataRef.current, actId);
      if (res.success) {
        commitSaveData(res.nextSave);
        skyAudio.playWingedLightAbsorb();
        spawnBurstRef.current?.(
          physicsRef.current.x,
          physicsRef.current.y + 1.6,
          physicsRef.current.z,
          36,
          7.5
        );
      }
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  const handleRotateTravelingSpirit = useCallback(() => {
    const res = rotateTravelingSpiritPure(saveDataRef.current);
    commitSaveData(res.nextSave);
    skyAudio.playWingedLightAbsorb();
    spawnBurstRef.current?.(
      physicsRef.current.x,
      physicsRef.current.y + 1.5,
      physicsRef.current.z,
      28,
      6.5
    );
    showBanner(res.message);
  }, [commitSaveData, showBanner]);

  const handleSettleSeasonEndConversion = useCallback(() => {
    const res = settleSeasonEndConversionPure(saveDataRef.current);
    commitSaveData(res.nextSave);
    skyAudio.playWingedLightAbsorb();
    spawnBurstRef.current?.(
      physicsRef.current.x,
      physicsRef.current.y + 1.6,
      physicsRef.current.z,
      30,
      7.0
    );
    showBanner(res.message);
  }, [commitSaveData, showBanner]);

  const handleTriggerShardEvent = useCallback(
    (shardType: 'black' | 'red' | null) => {
      progressRef.current = {
        ...progressRef.current,
        shardEventActive: shardType !== null,
        shardEventType: shardType,
      };
      setProgress({ ...progressRef.current });

      if (shardType === 'black' || shardType === 'red') {
        const res = completeShardPurificationEventPure(
          saveDataRef.current,
          shardType
        );
        commitSaveData(res.nextSave);
        skyAudio.playWingedLightAbsorb();
        spawnBurstRef.current?.(
          physicsRef.current.x,
          physicsRef.current.y + 1.6,
          physicsRef.current.z,
          32,
          7.5
        );
        showBanner(res.message);
      }
    },
    [commitSaveData, showBanner]
  );

  const handlePlaceHomeFurniture = useCallback(
    (furnitureId: string) => {
      const angle = physicsRef.current.yaw;
      const fx = physicsRef.current.x + Math.sin(angle) * 2.4;
      const fz = physicsRef.current.z + Math.cos(angle) * 2.4;
      const fy = groundHeightAt(fx, fz);

      const res = craftAndPlaceHomeFurniturePure(
        saveDataRef.current,
        furnitureId,
        { x: fx, y: fy, z: fz, rotY: angle }
      );
      if (!res.success) {
        showBanner(res.message);
        return;
      }

      commitSaveData(res.nextSave);
      setProgress((prev) => ({
        ...prev,
        candles: res.nextSave.candles,
      }));
      worldRefs.current?.rebuildHomeFurniture(
        res.nextSave.homeFurniturePlacements,
        progressRef.current.currentRealm === 'home'
      );
      skyAudio.playCandleIgnite();
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  const handleRotateOrRemoveHomeFurniture = useCallback(
    (instanceId: string, action: 'rotate' | 'remove') => {
      const res = rotateOrRemoveHomeFurniturePure(
        saveDataRef.current,
        instanceId,
        action
      );
      if (!res.success) {
        showBanner(res.message);
        return;
      }
      commitSaveData(res.nextSave);
      worldRefs.current?.rebuildHomeFurniture(
        res.nextSave.homeFurniturePlacements,
        progressRef.current.currentRealm === 'home'
      );
      skyAudio.playCandleIgnite();
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  const handleApplyPresetHomeLayout = useCallback(
    (presetId: string) => {
      const res = applyPresetHomeLayoutPure(
        saveDataRef.current,
        presetId,
        (x, z) => groundHeightAt(x, z)
      );
      if (!res.success) {
        showBanner(res.message);
        return;
      }
      commitSaveData(res.nextSave);
      worldRefs.current?.rebuildHomeFurniture(
        res.nextSave.homeFurniturePlacements,
        true
      );
      skyAudio.playWingedLightAbsorb();
      showBanner(res.message);
    },
    [commitSaveData, showBanner]
  );

  const handleClearHomeFurniture = useCallback(() => {
    const nextSave: PersistentSaveData = {
      ...saveDataRef.current,
      homeFurniturePlacements: [],
    };
    commitSaveData(nextSave);
    worldRefs.current?.rebuildHomeFurniture([], true);
    showBanner('已将全部小屋家具收纳回背包');
  }, [commitSaveData, showBanner]);

  const handleToggleChildSafeMode = useCallback(() => {
    const res = toggleChildSafeModePure(saveDataRef.current);
    commitSaveData(res.nextSave);
    showBanner(res.message);
  }, [commitSaveData, showBanner]);

  const handleUpdateAccessibilityAndPerf = useCallback(
    (patch: {
      qualityTier?: QualityTierOption;
      highContrastMode?: boolean;
      reducedMotionShake?: boolean;
      locale?: 'zh' | 'en';
    }) => {
      const res = updateAccessibilityAndPerfPure(saveDataRef.current, patch);
      commitSaveData(res.nextSave);
      if (patch.qualityTier && rendererRef.current) {
        const tierSpec = computeQualityTierSettingsPure(
          patch.qualityTier,
          fps
        );
        rendererRef.current.setPixelRatio(
          Math.min(window.devicePixelRatio || 1, tierSpec.pixelRatioCap)
        );
        rendererRef.current.shadowMap.enabled = tierSpec.shadowMapEnabled;
      }
      showBanner(res.message);
    },
    [commitSaveData, fps, showBanner]
  );

  const handleAdvanceOnboardingTutorial = useCallback(
    (action: 'move' | 'ignite' | 'fly' | 'complete_all' | 'reset') => {
      const res = advanceOnboardingTutorialPure(saveDataRef.current, action);
      if (!res.advanced) return;
      commitSaveData(res.nextSave);
      if (res.rewardCandles > 0) {
        setProgress((prev) => ({
          ...prev,
          candles: res.nextSave.candles,
        }));
        skyAudio.playWingedLightAbsorb();
      } else {
        skyAudio.playCandleIgnite();
      }
      if (res.message) {
        showBanner(res.message);
      }
    },
    [commitSaveData, showBanner]
  );

  // Stage 12: Warp to a Sky Tribute Easter Egg and trigger its discovery & physics launch
  const handleDiscoverAndWarpEasterEgg = useCallback(
    (eggId: string) => {
      const eggRes = discoverEasterEggPure(saveDataRef.current, eggId);
      if (!eggRes.eggConfig) {
        showBanner(eggRes.message);
        return;
      }
      const cfg = eggRes.eggConfig;
      const floorY = groundHeightAt(cfg.x, cfg.z);
      handleDebugTeleport(cfg.x, floorY, cfg.z + 1.2, cfg.name);
      commitSaveData(eggRes.nextSave);

      interactablesRef.current = interactablesRef.current.map((item) =>
        item.id === eggId ? { ...item, activated: true } : item
      );

      const newMaxWedges = calculateWingWedges(
        eggRes.nextSave.wingedLights,
        loadoutRef.current
      );
      const launchVy = cfg.launchVy || 0;
      physicsRef.current = {
        ...physicsRef.current,
        maxWingWedges: newMaxWedges,
        wingEnergy: newMaxWedges,
        vy: launchVy > 0 ? launchVy : physicsRef.current.vy,
        grounded: launchVy > 0 ? false : physicsRef.current.grounded,
        flightMode: launchVy > 0 ? 'glide' : physicsRef.current.flightMode,
        locomotionMode: launchVy > 0 ? 'fly' : physicsRef.current.locomotionMode,
      };
      const nearestAfterEgg = findNearestInteractable(
        physicsRef.current.x,
        physicsRef.current.y,
        physicsRef.current.z,
        interactablesRef.current
      );
      nearestInteractableRef.current = nearestAfterEgg;
      setNearestInteractable(nearestAfterEgg);
      setPhysics({ ...physicsRef.current });
      skyAudio.playWingedLightAbsorb();
      spawnBurstRef.current?.(cfg.x, floorY + 1.8, cfg.z, 42, 8.5);
      showBanner(eggRes.message);
    },
    [commitSaveData, handleDebugTeleport, showBanner]
  );

  // Stage 14: Activate or cancel a Sky Alchemy Spell Buff from the Aviary Spell Workshop
  const handleActivateSkySpell = useCallback(
    (spellId: SkySpellId | null) => {
      const capeItem = getCosmeticById(loadoutRef.current.cape);
      if (!spellId) {
        activeSpellIdRef.current = null;
        activeSpellRemainingRef.current = 0;
        setActiveSpellId(null);
        setActiveSpellRemainingSec(0);
        wingTrailRef.current?.setAccentColor(
          capeItem.emissiveColor || capeItem.accentColor
        );
        showBanner('已散去当前星光魔法增益');
        return;
      }
      const spellMeta = SKY_ALCHEMY_SPELLS.find((s) => s.id === spellId);
      if (!spellMeta) return;
      activeSpellIdRef.current = spellId;
      activeSpellRemainingRef.current = spellMeta.durationSec;
      setActiveSpellId(spellId);
      setActiveSpellRemainingSec(spellMeta.durationSec);
      if (spellId !== 'spell_rainbow_trail') {
        wingTrailRef.current?.setAccentColor(
          capeItem.emissiveColor || capeItem.accentColor
        );
      }

      const bonusWedges = spellId === 'spell_golden_aegis' ? 2 : 0;
      const newCap = physicsRef.current.maxWingWedges + bonusWedges;
      physicsRef.current = {
        ...physicsRef.current,
        wingEnergy: newCap,
        tempLostWedges: 0,
      };
      setPhysics({ ...physicsRef.current });
      skyAudio.playWingedLightAbsorb();
      spawnBurstRef.current?.(
        physicsRef.current.x,
        physicsRef.current.y + 1.5,
        physicsRef.current.z,
        36,
        7.5
      );
      showBanner(
        `${spellMeta.icon} 已激活云巢炼金魔法「${spellMeta.name}」(${spellMeta.durationSec}秒) · ${spellMeta.subtitle}`
      );
    },
    [showBanner]
  );

  // Stage 14: Teleport to East Sunset Race Arcade start line and begin the 4-Checkpoint Time Trial
  const handleStartSunsetRace = useCallback(() => {
    const cp0 = SUNSET_RACE_CHECKPOINTS[0];
    handleDebugTeleport(
      cp0.x - 4.0,
      groundHeightAt(cp0.x - 4.0, cp0.z),
      cp0.z,
      '东境霞光竞速拱廊起点'
    );
    const nextRace: SunsetRaceTrialState = {
      active: true,
      elapsedMs: 0,
      currentCheckpointIndex: 0,
      completed: false,
    };
    sunsetRaceRef.current = nextRace;
    setSunsetRaceState(nextRace);
    skyAudio.playCandleIgnite();
    showBanner(
      '🏁 霞光环大陆竞速赛已开启！依次穿过 4 座检查点直抵正南远古日晷终点 (0, 62)！'
    );
  }, [handleDebugTeleport, showBanner]);

  // Stage 14: Quick-test completion of Sunset Speedrun Time Trial
  const handleCompleteSunsetRaceQuickTest = useCallback(() => {
    const finishCp = SUNSET_RACE_CHECKPOINTS[SUNSET_RACE_CHECKPOINTS.length - 1];
    handleDebugTeleport(
      finishCp.x,
      groundHeightAt(finishCp.x, finishCp.z),
      finishCp.z,
      '正南远古日晷竞速终点'
    );
    const simulatedMs =
      sunsetRaceRef.current.active && sunsetRaceRef.current.elapsedMs > 2500
        ? sunsetRaceRef.current.elapsedMs
        : 36850; // 36.85s Gold Medal run!
    const doneRace: SunsetRaceTrialState = {
      active: false,
      elapsedMs: simulatedMs,
      currentCheckpointIndex: SUNSET_RACE_CHECKPOINTS.length,
      completed: true,
    };
    sunsetRaceRef.current = doneRace;
    setSunsetRaceState(doneRace);

    const res = recordSunsetRaceCompletionPure(saveDataRef.current, simulatedMs);
    commitSaveData(res.nextSave);
    skyAudio.playWingedLightAbsorb();
    spawnBurstRef.current?.(
      finishCp.x,
      groundHeightAt(finishCp.x, finishCp.z) + 1.8,
      finishCp.z,
      48,
      9.0
    );
    showBanner(res.message);
  }, [commitSaveData, handleDebugTeleport, showBanner]);

  const handleSaveRecordedSong = useCallback(
    (song: RecordedSongSheet) => {
      const nextSave: PersistentSaveData = {
        ...saveDataRef.current,
        savedSongs: [...saveDataRef.current.savedSongs, song],
      };
      commitSaveData(nextSave);
      showBanner(`乐谱「${song.title}」已保存至云端乐谱集！`);
    },
    [commitSaveData, showBanner]
  );

  const handleCapturePhotoSnapshot = useCallback(
    (caption?: string) => {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const realmMeta = REALMS[progressRef.current.currentRealm];
      const subZone = getSubZoneNameAt(
        progressRef.current.currentRealm,
        physicsRef.current.x,
        physicsRef.current.z
      );
      const photoRes = recordPhotoSnapshotPure(saveDataRef.current, {
        realmName: `${realmMeta.name} · ${subZone}`,
        filter: photoFilter,
        fov: photoFov,
        rollDeg: photoRollDeg,
        dofMode: photoDofMode,
        selfieMode,
        emoteId: progressRef.current.activeEmote,
        caption,
      });
      commitSaveData(photoRes.nextSave);

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
        const dataUrl = renderer.domElement.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `rea-sky-photo-${Date.now()}.png`;
        a.click();
      }
      skyAudio.playWingedLightAbsorb();
      showBanner(photoRes.message);
    },
    [
      commitSaveData,
      photoDofMode,
      photoFilter,
      photoFov,
      photoRollDeg,
      selfieMode,
      showBanner,
    ]
  );

  // Mount Three.js Cross-Platform Engine ONCE
  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    // 1. Software-WebGL Detection from GPU Renderer String
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = mountEl.clientWidth || window.innerWidth;
    const height = mountEl.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.96;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;

    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    // 2. Scene, Studio PBR Environment Map & Warm/Cool Lighting Rig
    const initialRealm = REALMS[progressRef.current.currentRealm];
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(initialRealm.skyHorizonColor);
    scene.fog = new THREE.FogExp2(
      initialRealm.fogColor,
      initialRealm.fogDensity * 0.58
    );

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.2, 1100);
    camera.position.set(0, 4.2, 13.5);
    cameraRef.current = camera;

    const hemiLight = new THREE.HemisphereLight(
      initialRealm.hemiSkyColor,
      initialRealm.hemiGroundColor,
      0.72
    );
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(
      initialRealm.sunColor,
      initialRealm.sunIntensity * 0.78
    );
    sunLight.position.set(24, 42, 18);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.set(1024, 1024);
    const d = 38;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 130;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.55);
    rimLight.position.set(-18, 22, -45);
    scene.add(rimLight);

    // 3. Build World Environment & Landmarks
    const builtWorld = buildSkyWorldEnvironment(renderer, initialRealm);
    builtWorld.rebuildHomeFurniture(
      saveDataRef.current.homeFurniturePlacements,
      progressRef.current.currentRealm === 'home'
    );
    scene.add(builtWorld.root);
    worldRefs.current = builtWorld;

    const shadowTex = createContactShadowTexture();
    const fabricTex = createMicroReliefTexture(renderer, 'fabric');

    // 4. Build Player Sky Child Rig & Ethereal Wingtip Cloud-Mist Trail System
    const playerRig = buildSkyChildRig(loadoutRef.current, shadowTex, fabricTex);
    playerRig.root.position.set(
      physicsRef.current.x,
      physicsRef.current.y,
      physicsRef.current.z
    );
    scene.add(playerRig.root);
    playerRigRef.current = playerRig;

    const wingTrailSystem = buildWingCloudTrailSystem(scene);
    const initialCape = getCosmeticById(loadoutRef.current.cape);
    wingTrailSystem.setAccentColor(
      initialCape.emissiveColor || initialCape.accentColor
    );
    wingTrailRef.current = wingTrailSystem;

    // 5. Build 3 Dynamic Companion / Remote Traveler Rigs (Supports Bot Travelers & Live WebSocket Peers)
    const companion1 = buildSkyChildRig(
      PRESET_OUTFITS[1].loadout,
      shadowTex,
      fabricTex
    );
    companion1.root.position.set(-2.4, groundHeightAt(-2.4, 1.4), 1.4);
    companion1.root.rotation.y = 0.65;
    scene.add(companion1.root);

    const companion2 = buildSkyChildRig(
      PRESET_OUTFITS[2].loadout,
      shadowTex,
      fabricTex
    );
    companion2.root.position.set(2.4, groundHeightAt(2.4, 1.4), 1.4);
    companion2.root.rotation.y = -0.65;
    scene.add(companion2.root);

    const companion3 = buildSkyChildRig(
      PRESET_OUTFITS[3 % PRESET_OUTFITS.length].loadout,
      shadowTex,
      fabricTex
    );
    companion3.root.position.set(0.0, groundHeightAt(0.0, -2.6), -2.6);
    companion3.root.rotation.y = 0.0;
    scene.add(companion3.root);

    // 6. Build 3 Soaring Light Mantas circling overhead
    const mantas: {
      group: THREE.Group;
      phase: number;
      radius: number;
      yBase: number;
    }[] = [];
    for (let m = 0; m < 3; m++) {
      const mGroup = buildLightMantaMesh();
      scene.add(mGroup);
      mantas.push({
        group: mGroup,
        phase: (m * Math.PI * 2) / 3,
        radius: 22 + m * 8,
        yBase: 14 + m * 3.5,
      });
    }

    // 7. Build World Interactable Meshes (Candles, Winged Lights, Spirits, Dark Plants)
    const interactablesGroup = new THREE.Group();
    scene.add(interactablesGroup);

    const populateInteractableMeshes = () => {
      interactableMeshesRef.current.clear();
      while (interactablesGroup.children.length > 0) {
        interactablesGroup.remove(interactablesGroup.children[0]);
      }

      for (const item of interactablesRef.current) {
        let meshGroup: THREE.Group;
        if (item.type === 'candle_cluster') {
          meshGroup = buildCandleClusterMesh(shadowTex);
        } else if (item.type === 'light_bloom') {
          meshGroup = buildLightBloomMesh(shadowTex);
        } else if (item.type === 'winged_light') {
          meshGroup = buildWingedLightMesh(shadowTex);
        } else if (item.type === 'ancestor_spirit') {
          meshGroup = buildAncestorSpiritMesh(shadowTex);
        } else if (item.type === 'dark_plant') {
          meshGroup = buildDarkPlantMesh(shadowTex);
        } else if (item.type === 'rain_shelter') {
          meshGroup = buildRainShelterMesh(shadowTex);
        } else if (item.type === 'race_ring') {
          meshGroup = buildRaceRingMesh();
        } else if (item.type === 'dark_crab') {
          meshGroup = buildDarkCrabMesh(shadowTex, Boolean(item.flipped));
        } else if (item.type === 'coop_door') {
          meshGroup = buildCoopDoorMesh(shadowTex);
        } else if (item.type === 'starlight_elevator') {
          meshGroup = buildStarlightElevatorMesh(shadowTex);
        } else if (item.type === 'eden_statue') {
          meshGroup = buildEdenStatueMesh(shadowTex, item.activated);
        } else if (item.type === 'easter_egg') {
          meshGroup = buildEasterEggMesh(shadowTex, item.id);
        } else {
          meshGroup = buildWingedLightMesh(shadowTex);
          meshGroup.scale.set(1.4, 1.4, 1.4);
        }
        meshGroup.position.set(item.x, item.y, item.z);
        interactablesGroup.add(meshGroup);
        interactableMeshesRef.current.set(item.id, meshGroup);
      }
    };
    populateInteractableMeshes();
    populateInteractablesFnRef.current = populateInteractableMeshes;

    // 8. Zero-GC Pooled Particle Ring Buffer (64 Golden Starlight Particles)
    const PARTICLE_CAP = 64;
    const particleGeo = new THREE.OctahedronGeometry(0.14, 0);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const particleInstanced = new THREE.InstancedMesh(
      particleGeo,
      particleMat,
      PARTICLE_CAP
    );
    particleInstanced.frustumCulled = false;
    scene.add(particleInstanced);

    const particlePool: PooledParticle[] = Array.from(
      { length: PARTICLE_CAP },
      () => ({
        active: false,
        x: 0,
        y: -100,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 1,
        scale: 0,
      })
    );
    let particleHead = 0;

    const spawnBurst = (
      bx: number,
      by: number,
      bz: number,
      count: number,
      upward = 3.5
    ) => {
      for (let i = 0; i < count; i++) {
        const p = particlePool[particleHead];
        particleHead = (particleHead + 1) % PARTICLE_CAP;
        p.active = true;
        p.x = bx + (Math.random() - 0.5) * 0.6;
        p.y = by + (Math.random() - 0.5) * 0.4;
        p.z = bz + (Math.random() - 0.5) * 0.6;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 3.5;
        p.vx = Math.cos(angle) * speed;
        p.vy = upward * (0.5 + Math.random() * 0.8);
        p.vz = Math.sin(angle) * speed;
        p.life = 0;
        p.maxLife = 0.55 + Math.random() * 0.45;
        p.scale = 0.8 + Math.random() * 0.8;
      }
    };
    spawnBurstRef.current = spawnBurst;

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 9. Pointer & Keyboard Listeners (Unified Input Hub)
    let isDraggingCamera = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.target !== renderer.domElement) return;
      isDraggingCamera = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingCamera) return;
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      cameraYawRef.current -= dx * 0.0065;
      cameraPitchRef.current = Math.max(
        0.05,
        Math.min(0.85, cameraPitchRef.current + dy * 0.005)
      );
    };

    const onPointerUp = () => {
      isDraggingCamera = false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const code = e.code;
      keysHeldRef.current.add(code);

      if (gameStateRef.current === 'title') {
        if (code === 'Enter' || code === 'Space') {
          e.preventDefault();
          handleStartGame();
        }
        return;
      }

      if (code === 'Escape') {
        if (photoModeOpenRef.current) {
          setPhotoModeOpen(false);
          return;
        }
        if (constellationModalOpenRef.current) {
          setConstellationModalOpen(false);
          return;
        }
        if (wardrobeOpenRef.current) {
          setWardrobeOpen(false);
          return;
        }
        if (instrumentOpenRef.current) {
          setInstrumentOpen(false);
          return;
        }
        if (gameStateRef.current === 'playing') {
          gameStateRef.current = 'paused';
          document.body.dataset.state = 'paused';
          setGameState('paused');
        } else if (gameStateRef.current === 'paused') {
          gameStateRef.current = 'playing';
          document.body.dataset.state = 'playing';
          setGameState('playing');
        }
        return;
      }

      if (gameStateRef.current !== 'playing') return;

      // When InstrumentOverlay is open, it handles 1-5 / Y-P / H-; keys directly with active instrument & recording
      if (instrumentOpenRef.current) {
        if (code === 'KeyV') {
          setInstrumentOpen(false);
        }
        return;
      }

      if (code === 'Space') {
        e.preventDefault();
        handleTriggerFlap();
      } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
        toggleFlightJustPressedRef.current = true;
      } else if (code === 'KeyF') {
        if (activeSpiritMemoryRef.current || nearestInteractableRef.current) {
          handleTriggerInteract();
        } else {
          toggleFlightJustPressedRef.current = true;
        }
      } else if (code === 'KeyE') {
        handleTriggerInteract();
      } else if (code === 'KeyQ') {
        handleTriggerCallWave();
      } else if (code === 'KeyC') {
        setWardrobeOpen((prev) => !prev);
      } else if (code === 'KeyV') {
        setInstrumentOpen((prev) => !prev);
      } else if (code === 'KeyK') {
        setConstellationTab('constellation');
        setConstellationModalOpen((prev) => !prev);
      } else if (code === 'KeyG') {
        setConstellationTab('social');
        setConstellationModalOpen((prev) => !prev);
      } else if (code === 'KeyO' || code === 'KeyP') {
        setPhotoModeOpen((prev) => !prev);
      } else if (code === 'KeyR') {
        handleResetPosition();
      } else if (code === 'KeyZ') {
        handleToggleSit();
      } else if (code === 'KeyT') {
        handleCycleDayNightPhase();
      } else if (code === 'F3') {
        e.preventDefault();
        setDebugMode((prev) => !prev);
      } else if (code === 'KeyM') {
        setMuted((prev) => {
          const next = !prev;
          skyAudio.setMuted(next);
          return next;
        });
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeldRef.current.delete(e.code);
    };

    const clearHeldInputs = () => {
      keysHeldRef.current.clear();
      isDraggingCamera = false;
    };

    const onResize = () => {
      if (!mountEl) return;
      const w = Math.max(1, mountEl.clientWidth || window.innerWidth);
      const h = Math.max(1, mountEl.clientHeight || window.innerHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      onResize();
    });
    resizeObserver.observe(mountEl);

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearHeldInputs);
    window.addEventListener('resize', onResize);

    // 10. High-Precision Timer & Software-WebGL Paced Animation Loop (`afterDraw`)
    let frameId = 0;
    let disposed = false;
    let lastTimeMs = performance.now();
    let elapsedSec = 0;
    let hudSyncAccumulator = 0;
    let frameCounter = 0;
    let fpsTimer = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    let prevYaw = physicsRef.current.yaw;
    let smoothedTurnRate = 0;

    function tick() {
      if (disposed) return;
      const nowMs = performance.now();
      const rawDt = Math.max(0.001, (nowMs - lastTimeMs) / 1000);
      lastTimeMs = nowMs;
      const dt = Math.min(rawDt, 0.05);
      elapsedSec += dt;
      const elapsed = elapsedSec;

      frameCounter++;
      fpsTimer += rawDt;

      // Animate Temple Astrolabe Rings
      builtWorld.astrolabeRing1.rotation.z = elapsed * 0.35;
      builtWorld.astrolabeRing2.rotation.y = elapsed * 0.48;

      // Update dynamic world hazards (Krill patrol in Wasteland, Shard Eruption crystal)
      builtWorld.updateDynamicHazards(
        elapsed,
        REALMS[progressRef.current.currentRealm],
        physicsRef.current.krillAlertLevel,
        progressRef.current.shardEventType
      );

      mantas.forEach((m) => {
        const angle = elapsed * 0.22 + m.phase;
        const mx = Math.cos(angle) * m.radius;
        const mz = Math.sin(angle) * m.radius - 18;
        const my = m.yBase + Math.sin(elapsed * 1.4 + m.phase) * 1.8;
        m.group.position.set(mx, my, mz);
        m.group.rotation.y = -angle;
        const wingL = m.group.getObjectByName('manta_wing_l');
        const wingR = m.group.getObjectByName('manta_wing_r');
        const flap = Math.sin(elapsed * 3.8 + m.phase) * 0.28;
        if (wingL) wingL.rotation.z = flap;
        if (wingR) wingR.rotation.z = -flap;
      });

      // Step Bot / Multiplayer Remote Travelers & Sync Companion Rigs
      const pCurr = physicsRef.current;
      networkClient.stepTravelers(dt, elapsed, {
        x: pCurr.x,
        y: pCurr.y,
        z: pCurr.z,
        yaw: pCurr.yaw,
        grounded: pCurr.grounded,
        flightMode: pCurr.flightMode,
      });

      const remotes = Array.from(networkClient.remoteTravelers.values());
      const companionRigs = [companion1, companion2, companion3];
      const blockedList = saveDataRef.current.blockedPeerIds || [];
      remotes.slice(0, 3).forEach((rem, idx) => {
        const cRig = companionRigs[idx];
        if (!cRig) return;

        const isBlocked = blockedList.includes(rem.playerId);
        cRig.root.visible = !isBlocked;
        if (isBlocked) return;

        // If player is sitting on the Double Stone Bench (`sit_bench`), have Companion 2 sit right beside them!
        const isSittingAlongside =
          idx === 1 && physicsRef.current.sitMode === 'sit_bench';
        if (isSittingAlongside) {
          cRig.root.position.set(
            4.92,
            groundHeightAt(4.92, 3.8) + 0.18,
            3.8
          );
          cRig.root.rotation.set(0, Math.PI - 0.4, 0);
        } else {
          cRig.root.position.set(rem.x, rem.y, rem.z);
          cRig.root.rotation.set(0, rem.yaw, 0);
        }

        const isIgnited = Boolean(
          saveDataRef.current.friends[rem.playerId]?.ignited
        );
        // Stage 7: Unignited strangers render as dark slate silhouettes; ignited travelers reveal full colors!
        cRig.setSilhouetteMode(!isIgnited, rem.loadout);

        const cPose = computeSkyChildPose({
          elapsed: elapsed + idx * 1.7,
          dt,
          grounded: rem.grounded,
          horizSpeed: isSittingAlongside ? 0 : 0.85,
          vy: 0,
          gaitPhase: elapsed * 3.2,
          flightMode: rem.flightMode,
          flapCooldown: 0,
          turnRate: 0,
          activeEmote: rem.activeEmote,
          activeEmoteTimer: rem.activeEmoteTimer,
          activeEmoteLevel: rem.activeEmoteLevel || 3,
          instrumentOpen: Boolean(rem.notePopupTimer > 0),
          sitMode: isSittingAlongside ? 'sit_bench' : 'none',
        });
        cRig.applyPose(cPose, elapsed + idx * 1.7);
        cRig.bodyVisual.scale.setScalar(isIgnited ? 1.0 : 0.96);

        // Render expanding Call Ring wave on remote/bot traveler when they honk!
        const cRingMat = cRig.callRingMesh.material as THREE.MeshBasicMaterial;
        if (rem.callRingTimer > 0) {
          const rScale = rem.callWaveRadius || 1.2;
          cRig.callRingMesh.scale.set(rScale, rScale, 1);
          cRingMat.opacity = Math.min(0.8, rem.callRingTimer * 0.7);
        } else {
          cRingMat.opacity = 0;
        }
      });

      // Update Interactable Beacons
      interactableMeshesRef.current.forEach((meshGroup) => {
        const core = meshGroup.getObjectByName('spirit_core');
        if (core) {
          core.rotation.y = elapsed * 2.2;
          core.position.y = 1.55 + Math.sin(elapsed * 3.0) * 0.12;
        }
      });

      if (gameStateRef.current === 'title') {
        const orbitAngle = Math.sin(elapsed * 0.25) * 0.45;
        camera.position.set(
          Math.sin(orbitAngle) * 7.5,
          3.8 + Math.sin(elapsed * 0.5) * 0.25,
          6.0 + Math.cos(orbitAngle) * 7.5
        );
        camera.lookAt(0, 2.0, -10);

        playerRig.root.position.set(0, groundHeightAt(0, 6), 6);
        playerRig.root.rotation.set(0, Math.PI, 0);

        const titlePose = computeSkyChildPose({
          elapsed,
          dt,
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
        titlePose.capeBillow = 0.28 + Math.sin(elapsed * 1.8) * 0.12;
        titlePose.wingFlare = 0.22 + Math.sin(elapsed * 2.2) * 0.08;
        playerRig.applyPose(titlePose, elapsed);
      } else if (gameStateRef.current === 'playing') {
        const keys = keysHeldRef.current;
        const kbMoveX =
          (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) -
          (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
        const kbMoveZ =
          (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) -
          (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0);

        const moveX =
          Math.abs(touchInputRef.current.moveX) > 0.01
            ? touchInputRef.current.moveX
            : kbMoveX;
        const moveZ =
          Math.abs(touchInputRef.current.moveZ) > 0.01
            ? touchInputRef.current.moveZ
            : kbMoveZ;

        // Check proximity to any remote/bot companion traveler (< 4.5m) for companion recharge
        const isNearCompanion = remotes.slice(0, 2).some((rem) => {
          return Math.hypot(physicsRef.current.x - rem.x, physicsRef.current.z - rem.z) < 4.5;
        });

        const isDiveInputHeld =
          diveHeldRef.current ||
          keys.has('KeyX') ||
          keys.has('ControlLeft') ||
          keys.has('ControlRight');

        const stepRes = stepPlayerPhysics(
          physicsRef.current,
          {
            moveX,
            moveZ,
            jumpJustPressed: jumpJustPressedRef.current,
            jumpHeld: keys.has('Space'),
            toggleFlightModeJustPressed: toggleFlightJustPressedRef.current,
            toggleSitJustPressed: toggleSitJustPressedRef.current,
            diveHeld: isDiveInputHeld,
            nearCompanion: isNearCompanion,
            sprintHeld:
              keys.has('ShiftLeft') ||
              keys.has('ShiftRight') ||
              touchInputRef.current.sprint,
            cameraYaw: cameraYawRef.current,
            realmId: progressRef.current.currentRealm,
            elapsed,
            activeSpellId: activeSpellIdRef.current,
          },
          dt,
          loadoutRef.current
        );

        jumpJustPressedRef.current = false;
        toggleFlightJustPressedRef.current = false;
        toggleSitJustPressedRef.current = false;
        physicsRef.current = stepRes.nextState;

        if (stepRes.hazardStrike === 'krill') {
          skyAudio.playHazardAlert();
          showBanner(
            '受到暮土冥龙俯冲撞击！暂时散落 2 格斗篷能量（靠近烛火或祭坛即可恢复）'
          );
        }

        if (stepRes.didLand) {
          squashScaleYRef.current =
            physicsRef.current.landingStiffTimer > 0 ? 0.68 : 0.82;
          skyAudio.playLandStep();
          spawnBurst(
            physicsRef.current.x,
            physicsRef.current.y + 0.1,
            physicsRef.current.z,
            physicsRef.current.landingStiffTimer > 0 ? 14 : 6,
            1.8
          );
        }

        const p = physicsRef.current;
        playerRig.root.position.set(p.x, p.y, p.z);
        playerRig.root.rotation.set(p.pitch, p.yaw, p.roll);
        playerRig.updateWingEnergyDisplay(
          p.wingEnergy,
          p.maxWingWedges,
          p.tempLostWedges
        );
        builtWorld.updateWaterRipples(elapsed, p.x, p.z, p.isInShallowWater);

        let yawDelta = p.yaw - prevYaw;
        while (yawDelta > Math.PI) yawDelta -= Math.PI * 2;
        while (yawDelta < -Math.PI) yawDelta += Math.PI * 2;
        prevYaw = p.yaw;
        const instantTurnRate = Math.max(
          -1.5,
          Math.min(1.5, (yawDelta / Math.max(0.008, dt)) * 0.18)
        );
        smoothedTurnRate +=
          (instantTurnRate - smoothedTurnRate) * (1 - Math.exp(-10 * dt));

        squashScaleYRef.current +=
          (1.0 - squashScaleYRef.current) * (1 - Math.exp(-12 * dt));
        const baseScale =
          loadoutRef.current.mask === 'mask_chibi' ? 0.72 : 1.0;
        const sy = baseScale * squashScaleYRef.current;
        const sxz = baseScale * (2.0 - squashScaleYRef.current);
        playerRig.bodyVisual.scale.set(sxz, sy, sxz);

        const horizSpeed = Math.hypot(p.vx, p.vz);
        if (p.grounded && horizSpeed > 0.15) {
          gaitDistanceRef.current += horizSpeed * dt * 2.9;
        }

        // Camera gentle auto-recenter behind player only when flying or walking forward (never fight A/D/S walking!)
        if (
          !isDraggingCamera &&
          horizSpeed > 1.2 &&
          !selfieModeRef.current &&
          (!p.grounded || moveZ < -0.15)
        ) {
          const desiredBehindYaw = p.yaw + Math.PI;
          let camDiff = desiredBehindYaw - cameraYawRef.current;
          while (camDiff > Math.PI) camDiff -= Math.PI * 2;
          while (camDiff < -Math.PI) camDiff += Math.PI * 2;
          cameraYawRef.current += camDiff * (1 - Math.exp(-(p.grounded ? 0.65 : 1.15) * dt));
        }

        if (progressRef.current.activeEmoteTimer > 0) {
          progressRef.current.activeEmoteTimer = Math.max(
            0,
            progressRef.current.activeEmoteTimer - dt
          );
          if (progressRef.current.activeEmoteTimer <= 0) {
            progressRef.current.activeEmote = null;
          }
        }

        const playerPose = computeSkyChildPose({
          elapsed,
          dt,
          grounded: p.grounded,
          horizSpeed,
          vy: p.vy,
          gaitPhase: gaitDistanceRef.current,
          flightMode: p.flightMode,
          flapCooldown: p.flapCooldown,
          turnRate: smoothedTurnRate,
          activeEmote: progressRef.current.activeEmote,
          activeEmoteTimer: progressRef.current.activeEmoteTimer,
          activeEmoteLevel: activeEmoteLevelRef.current,
          instrumentOpen: instrumentOpenRef.current,
          locomotionMode: p.locomotionMode,
          sitMode: p.sitMode,
          landingStiffTimer: p.landingStiffTimer,
        });

        playerRig.applyPose(playerPose, elapsed);

        // Update Dynamic Wingtip Cloud-Mist & Gossamer Ribbon Trails
        const trailCfg = computeWingTrailConfig({
          grounded: p.grounded,
          flightMode: p.flightMode,
          horizSpeed,
          vy: p.vy,
          flapCooldown: p.flapCooldown,
          activeEmote: progressRef.current.activeEmote,
          activeEmoteTimer: progressRef.current.activeEmoteTimer,
        });
        wingTrailSystem.update(
          dt,
          elapsed,
          playerRig,
          trailCfg,
          p.vx,
          p.vy,
          p.vz
        );

        // Broadcast local transform + velocity + locomotion state over WebSocket at ~15Hz
        networkClient.sendTransformThrottled({
          x: p.x,
          y: p.y,
          z: p.z,
          vx: p.vx,
          vy: p.vy,
          vz: p.vz,
          yaw: p.yaw,
          pitch: p.pitch,
          grounded: p.grounded,
          flightMode: p.flightMode,
          locomotionMode: p.locomotionMode,
          activeEmote: progressRef.current.activeEmote,
          activeEmoteLevel: activeEmoteLevelRef.current,
          loadout: loadoutRef.current,
        });

        const mandalaMat =
          playerRig.prayerMandala.material as THREE.MeshBasicMaterial;
        if (
          progressRef.current.activeEmote === 'emote_pray_star' &&
          progressRef.current.activeEmoteTimer > 0
        ) {
          mandalaMat.opacity = Math.min(
            0.75,
            progressRef.current.activeEmoteTimer * 0.6
          );
          playerRig.prayerMandala.rotation.z = elapsed * 1.2;
          const mScale = 1.0 + Math.sin(elapsed * 4.0) * 0.08;
          playerRig.prayerMandala.scale.set(mScale, mScale, 1);
        } else {
          mandalaMat.opacity = 0;
        }

        if (progressRef.current.callWaveTimer > 0) {
          progressRef.current.callWaveTimer = Math.max(
            0,
            progressRef.current.callWaveTimer - dt
          );
          progressRef.current.callWaveRadius += 28 * dt;
          const rScale = progressRef.current.callWaveRadius;
          playerRig.callRingMesh.scale.set(rScale, rScale, 1);
          (playerRig.callRingMesh.material as THREE.MeshBasicMaterial).opacity =
            progressRef.current.callWaveTimer * 0.75;
        } else {
          (playerRig.callRingMesh.material as THREE.MeshBasicMaterial).opacity =
            0;
        }

        // Camera Follow with Flight/Glide/Dive Zoom-Out & Multi-Sample Terrain/Obstacle Anti-Clipping
        const effectiveYaw = selfieModeRef.current
          ? p.yaw + Math.PI
          : cameraYawRef.current;
        const camDist = selfieModeRef.current
          ? 4.2
          : p.grounded
            ? 8.2
            : p.isDiving
              ? 12.2
              : p.flightMode === 'glide'
                ? 10.8
                : 9.2;
        if (!photoModeOpenRef.current) {
          const targetFov = p.grounded
            ? 60
            : p.isDiving
              ? 72
              : p.flightMode === 'glide'
                ? 66
                : 62;
          if (Math.abs(camera.fov - targetFov) > 0.15) {
            camera.fov += (targetFov - camera.fov) * (1 - Math.exp(-6 * dt));
            camera.updateProjectionMatrix();
          }
        }
        const camHeight =
          p.y + (p.grounded ? 2.6 : 3.2) + cameraPitchRef.current * 4.5;
        let desiredCamX = p.x + Math.sin(effectiveYaw) * camDist;
        let desiredCamZ = p.z + Math.cos(effectiveYaw) * camDist;
        let desiredCamY = camHeight;

        // Push camera smoothly out of only the large solid Northern Temple Main Hall (never snap camera on thin shrine pillars!)
        const camHallDx = desiredCamX - 0;
        const camHallDz = desiredCamZ - -55.0;
        const camHallDist = Math.hypot(camHallDx, camHallDz);
        if (desiredCamY < 24.0 && camHallDist < 5.75 && camHallDist > 0.001) {
          desiredCamX = (camHallDx / camHallDist) * 5.75;
          desiredCamZ = -55.0 + (camHallDz / camHallDist) * 5.75;
        }

        // Multi-sample terrain ray check from player head (p.x, p.y + 1.6, p.z) to camera endpoint
        for (let s = 1; s <= 4; s++) {
          const frac = s / 4;
          const sx = p.x + (desiredCamX - p.x) * frac;
          const sz = p.z + (desiredCamZ - p.z) * frac;
          const sy = p.y + 1.6 + (desiredCamY - (p.y + 1.6)) * frac;
          const terrainClearY = groundHeightAt(sx, sz) + 1.15;
          if (sy < terrainClearY) {
            desiredCamY += (terrainClearY - sy) / frac;
          }
        }

        _camDesired.set(desiredCamX, desiredCamY, desiredCamZ);
        camera.position.lerp(_camDesired, 1 - Math.exp(-11.5 * dt));

        _camTarget.set(p.x, p.y + 1.6, p.z);
        camera.lookAt(_camTarget);

        // Tick down active Sky Alchemy Spell duration & cycle Rainbow Trail color
        if (activeSpellIdRef.current && activeSpellRemainingRef.current > 0) {
          if (activeSpellIdRef.current === 'spell_rainbow_trail') {
            _rainbowColor.setHSL((elapsed * 0.38) % 1.0, 0.92, 0.62);
            wingTrailSystem.setAccentColor('#' + _rainbowColor.getHexString());
          }
          activeSpellRemainingRef.current = Math.max(
            0,
            activeSpellRemainingRef.current - dt
          );
          if (activeSpellRemainingRef.current <= 0) {
            activeSpellIdRef.current = null;
            setActiveSpellId(null);
            setActiveSpellRemainingSec(0);
            const capeItem = getCosmeticById(loadoutRef.current.cape);
            wingTrailSystem.setAccentColor(
              capeItem.emissiveColor || capeItem.accentColor
            );
          }
        }

        // Step active Sunset Speedrun Time-Trial checkpoint progression
        if (sunsetRaceRef.current.active && !sunsetRaceRef.current.completed) {
          const raceStep = stepSunsetRaceTrialPure(
            sunsetRaceRef.current,
            p.x,
            p.z,
            dt * 1000
          );
          sunsetRaceRef.current = raceStep.nextState;
          if (raceStep.reachedCheckpoint) {
            skyAudio.playCandleIgnite();
            spawnBurst(p.x, p.y + 1.4, p.z, 28, 6.5);
            if (raceStep.justCompletedRace) {
              const settleRes = recordSunsetRaceCompletionPure(
                saveDataRef.current,
                raceStep.nextState.elapsedMs
              );
              commitSaveData(settleRes.nextSave);
              skyAudio.playWingedLightAbsorb();
              showBanner(settleRes.message);
            } else {
              const nextCp =
                SUNSET_RACE_CHECKPOINTS[
                  raceStep.nextState.currentCheckpointIndex
                ];
              showBanner(
                `✨ 已通过「${raceStep.reachedCheckpoint.name}」！下一站：${nextCp?.name || '终点'}`
              );
            }
          }
        }

        // Throttled HUD state sync (~10Hz)
        hudSyncAccumulator += dt;
        if (hudSyncAccumulator >= 0.1) {
          hudSyncAccumulator = 0;
          const nearest = findNearestInteractable(
            p.x,
            p.y,
            p.z,
            interactablesRef.current
          );
          if (nearest?.id !== nearestInteractableRef.current?.id) {
            nearestInteractableRef.current = nearest;
            setNearestInteractable(nearest);
          }
          setPhysics({ ...p });
          setProgress({ ...progressRef.current });
          setNetStatus(networkClient.getStatusSnapshot());
          if (activeSpellIdRef.current) {
            setActiveSpellRemainingSec(activeSpellRemainingRef.current);
          }
          if (sunsetRaceRef.current.active || sunsetRaceRef.current.completed) {
            setSunsetRaceState({ ...sunsetRaceRef.current });
          }
        }

        if (fpsTimer >= 0.5) {
          setFps(Math.round(frameCounter / fpsTimer));
          frameCounter = 0;
          fpsTimer = 0;
        }
      }

      // Advance Pooled Particle Ring Buffer
      for (let i = 0; i < PARTICLE_CAP; i++) {
        const pt = particlePool[i];
        if (!pt.active) {
          _dummyMatrixObj.position.set(0, -200, 0);
          _dummyMatrixObj.scale.set(0, 0, 0);
          _dummyMatrixObj.updateMatrix();
          particleInstanced.setMatrixAt(i, _dummyMatrixObj.matrix);
          continue;
        }
        pt.life += dt;
        if (pt.life >= pt.maxLife) {
          pt.active = false;
          _dummyMatrixObj.position.set(0, -200, 0);
          _dummyMatrixObj.scale.set(0, 0, 0);
          _dummyMatrixObj.updateMatrix();
          particleInstanced.setMatrixAt(i, _dummyMatrixObj.matrix);
          continue;
        }
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.z += pt.vz * dt;
        const lifeRatio = 1 - pt.life / pt.maxLife;
        const s = pt.scale * lifeRatio;
        _dummyMatrixObj.position.set(pt.x, pt.y, pt.z);
        _dummyMatrixObj.scale.set(s, s, s);
        _dummyMatrixObj.rotation.set(elapsed * 3, elapsed * 2, 0);
        _dummyMatrixObj.updateMatrix();
        particleInstanced.setMatrixAt(i, _dummyMatrixObj.matrix);
      }
      particleInstanced.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearHeldInputs);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [
    handleStartGame,
    handleTriggerFlap,
    handleTriggerInteract,
    handleTriggerCallWave,
    handleResetPosition,
    handleToggleSit,
    handleCycleDayNightPhase,
    showBanner,
  ]);

  const handleNotePlayed = useCallback(
    (note: SkyMusicNote) => {
      networkClient.broadcastEvent('music:note', {
        senderId: saveDataRef.current.playerId,
        noteIndex: note.index,
        instrument: instrumentType,
      });
      spawnBurstRef.current?.(
        physicsRef.current.x,
        physicsRef.current.y + 1.6,
        physicsRef.current.z,
        8,
        3.8 + note.index * 0.15
      );
      // Progress daily music quest
      const nextQuests = saveDataRef.current.dailyQuests.map((q) =>
        q.type === 'play_music'
          ? {
              ...q,
              currentCount: Math.min(q.targetCount, q.currentCount + 1),
            }
          : q
      );
      commitSaveData({
        ...saveDataRef.current,
        dailyQuests: nextQuests,
      });
    },
    [commitSaveData, instrumentType]
  );

  // Compute CSS filter for Photo Mode & Stage 11 High-Contrast Accessibility
  const basePhotoFilter =
    photoModeOpen && photoFilter === 'warm_dusk'
      ? 'sepia(0.35) saturate(1.4) contrast(1.06)'
      : photoModeOpen && photoFilter === 'starlight_cyan'
        ? 'hue-rotate(185deg) saturate(1.25) brightness(1.05)'
        : photoModeOpen && photoFilter === 'dreamy_bloom'
          ? 'brightness(1.12) contrast(1.08) saturate(1.3)'
          : photoModeOpen && photoFilter === 'vintage_sepia'
            ? 'sepia(0.55) contrast(1.12) brightness(0.95)'
            : '';
  const highContrastFilter = saveData.highContrastMode
    ? 'contrast(1.22) saturate(1.28) brightness(1.04)'
    : '';
  const canvasFilterStyle =
    [basePhotoFilter, highContrastFilter].filter(Boolean).join(' ') || 'none';

  const dualActionStatusText =
    dualActionMode === 'hand_hold'
      ? '🤝 正在与好友牵手同步共飞'
      : dualActionMode === 'carry'
        ? '🎒 正在与好友背抱翱翔'
        : null;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* Isolated WebGL Canvas Mount Container */}
      <div
        ref={canvasMountRef}
        data-testid="sky-webgl-canvas"
        className="w-full h-full transition-all duration-300"
        style={{
          filter: canvasFilterStyle,
          transform:
            photoModeOpen && photoRollDeg !== 0
              ? `rotate(${photoRollDeg}deg) scale(1.08)`
              : undefined,
        }}
      />

      {/* Title Screen Stage */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenWardrobe={() => setWardrobeOpen(true)}
          selectedRealm={progress.currentRealm}
          onSelectRealm={handleSelectRealm}
          loadout={loadout}
        />
      )}

      {/* Playing HUD & Collapsible Starlight Dock (Hidden during Photo Mode) */}
      {gameState === 'playing' && !photoModeOpen && (
        <GameHud
          progress={progress}
          physics={physics}
          loadout={loadout}
          nearestInteractable={nearestInteractable}
          bannerMessage={bannerMessage}
          muted={muted}
          debugMode={debugMode}
          fps={fps}
          netStatus={netStatus}
          dualActionStatusText={dualActionStatusText}
          latestChatBubble={latestChatBubble}
          dayNightPhase={dayNightPhase}
          activeSpiritMemory={activeSpiritMemory}
          emoteLevels={saveData.emoteLevels}
          activeEmoteLevel={activeEmoteLevel}
          activeCallVoice={activeCallVoice}
          meditationNotes={saveData.meditationNotes}
          onStartSpiritMemoryQuest={handleStartSpiritMemoryQuest}
          onAdvanceSpiritMemory={handleAdvanceSpiritMemory}
          onForgeCandleWax={handleForgeCandleWax}
          onCycleDayNightPhase={handleCycleDayNightPhase}
          onToggleDebugMode={() => setDebugMode((prev) => !prev)}
          onToggleMute={() => {
            setMuted((prev) => {
              const next = !prev;
              skyAudio.setMuted(next);
              return next;
            });
          }}
          onTriggerInteract={handleTriggerInteract}
          onTriggerCallWave={handleTriggerCallWave}
          onChangeCallVoice={handleChangeCallVoice}
          onTriggerFlap={handleTriggerFlap}
          onToggleFlightMode={handleToggleFlightMode}
          onToggleSit={handleToggleSit}
          onSetDiveHeld={handleSetDiveHeld}
          onDebugTeleport={handleDebugTeleport}
          onDebugSimulateWedgeLoss={handleDebugSimulateWedgeLoss}
          onTriggerEmote={handleTriggerEmote}
          onUpgradeEmoteLevel={handleUpgradeEmoteLevel}
          onSubmitMeditationNote={handleSubmitMeditationNote}
          onSimulateReconnect={handleSimulateReconnect}
          onCycleBotAiMode={handleCycleBotAiMode}
          onTriggerBotEnsemble={handleTriggerBotEnsemble}
          onSwitchRoomInstance={handleSwitchRoomInstance}
          onIgnitePeer={handleIgnitePeer}
          onSendFriendRequest={handleSendFriendRequest}
          onTeleportToFriend={handleTeleportToFriend}
          onExecuteDualAction={handleExecuteDualAction}
          onProgressAndClaimDailyQuest={handleDebugCompleteAndClaimDailyQuest}
          onCompleteSeasonStoryAct={handleCompleteSeasonStoryAct}
          onRotateTravelingSpirit={handleRotateTravelingSpirit}
          onTriggerShardEvent={handleTriggerShardEvent}
          onSettleSeasonEndConversion={handleSettleSeasonEndConversion}
          childSafeMode={saveData.childSafeMode}
          onApplyPresetHomeLayout={handleApplyPresetHomeLayout}
          onToggleChildSafeMode={handleToggleChildSafeMode}
          qualityTier={saveData.qualityTier || 'auto'}
          highContrastMode={Boolean(saveData.highContrastMode)}
          reducedMotionShake={Boolean(saveData.reducedMotionShake)}
          locale={saveData.locale || 'zh'}
          tutorialStep={saveData.tutorialStep}
          onUpdateAccessibilityAndPerf={handleUpdateAccessibilityAndPerf}
          onAdvanceOnboardingTutorial={handleAdvanceOnboardingTutorial}
          discoveredEasterEggIds={saveData.discoveredEasterEggIds || []}
          onDiscoverAndWarpEasterEgg={handleDiscoverAndWarpEasterEgg}
          activeSpellId={activeSpellId}
          activeSpellRemainingSec={activeSpellRemainingSec}
          onActivateSkySpell={handleActivateSkySpell}
          sunsetRaceState={sunsetRaceState}
          bestRaceTimeMs={saveData.bestRaceTimeMs ?? null}
          bestRaceMedal={saveData.bestRaceMedal ?? null}
          onStartSunsetRace={handleStartSunsetRace}
          onCompleteSunsetRaceQuickTest={handleCompleteSunsetRaceQuickTest}
          onOpenWardrobe={() => setWardrobeOpen(true)}
          onOpenConstellationHub={(tab) => {
            setConstellationTab(tab);
            setConstellationModalOpen(true);
          }}
          onOpenPhotoMode={() => setPhotoModeOpen(true)}
          onToggleInstrument={() => setInstrumentOpen((prev) => !prev)}
          onSelectRealm={handleSelectRealm}
          onPause={() => {
            gameStateRef.current = 'paused';
            document.body.dataset.state = 'paused';
            setGameState('paused');
          }}
          onResetPosition={handleResetPosition}
          onTouchJoystickChange={(mx, mz, sprint) => {
            touchInputRef.current = { moveX: mx, moveZ: mz, sprint };
          }}
        />
      )}

      {/* Free Camera Photo Mode Overlay */}
      <PhotoModeOverlay
        isOpen={photoModeOpen && gameState === 'playing'}
        onClose={() => {
          setPhotoModeOpen(false);
          setSelfieMode(false);
          setPhotoRollDeg(0);
        }}
        filter={photoFilter}
        onChangeFilter={setPhotoFilter}
        fov={photoFov}
        onChangeFov={setPhotoFov}
        rollDeg={photoRollDeg}
        onChangeRollDeg={setPhotoRollDeg}
        dofMode={photoDofMode}
        onChangeDofMode={setPhotoDofMode}
        savedPhotos={saveData.savedPhotos}
        childSafeMode={saveData.childSafeMode}
        selfieMode={selfieMode}
        onToggleSelfie={() => setSelfieMode((prev) => !prev)}
        onTriggerEmote={handleTriggerEmote}
        onCaptureSnapshot={handleCapturePhotoSnapshot}
      />

      {/* Constellation Unlock Tree, Friend Tree, Daily Quests & Home Workshop Modal */}
      <ConstellationAndSocialModal
        isOpen={constellationModalOpen}
        initialTab={constellationTab}
        onClose={() => setConstellationModalOpen(false)}
        saveData={saveData}
        sitMode={physics.sitMode}
        dualActionPartnerId={dualActionPartnerId}
        dualActionMode={dualActionMode}
        onUnlockConstellationNode={handleUnlockConstellationNode}
        onStartSpiritMemoryQuest={handleStartSpiritMemoryQuest}
        onForgeCandleWax={handleForgeCandleWax}
        onEquipCosmeticFromTree={(cosmeticId) => {
          const item = getCosmeticById(cosmeticId);
          if (item) {
            handleChangeLoadout({
              ...loadoutRef.current,
              [item.category]: item.id,
            });
          }
        }}
        onImportSaveData={handleImportSaveData}
        onResetSaveData={handleResetSaveData}
        onUnlockFriendNode={handleUnlockFriendNode}
        onIgnitePeer={handleIgnitePeer}
        onSendFriendRequest={handleSendFriendRequest}
        onRenameFriend={handleRenameFriend}
        onTeleportToFriend={handleTeleportToFriend}
        onExecuteDualAction={handleExecuteDualAction}
        onToggleBlockPeer={handleToggleBlockPeer}
        onReportPeer={handleReportPeer}
        onSetDualAction={handleSetDualAction}
        onSendFriendChat={handleSendFriendChat}
        onGiftHeart={handleGiftHeart}
        onClaimQuest={handleClaimQuest}
        onProgressDailyQuest={handleProgressDailyQuest}
        onRerollQuests={handleRerollQuests}
        onSwitchSeason={handleSwitchSeason}
        onCompleteSeasonStoryAct={handleCompleteSeasonStoryAct}
        onRotateTravelingSpirit={handleRotateTravelingSpirit}
        onSettleSeasonEndConversion={handleSettleSeasonEndConversion}
        onTriggerShardEvent={handleTriggerShardEvent}
        onPlaceFurniture={handlePlaceHomeFurniture}
        onRotateOrRemoveFurniture={handleRotateOrRemoveHomeFurniture}
        onApplyPresetHomeLayout={handleApplyPresetHomeLayout}
        onClearFurniture={handleClearHomeFurniture}
        onToggleChildSafeMode={handleToggleChildSafeMode}
        onUpdateAccessibilityAndPerf={handleUpdateAccessibilityAndPerf}
        onAdvanceOnboardingTutorial={handleAdvanceOnboardingTutorial}
      />

      {/* 15-Key Sky Musical Instrument Studio Overlay */}
      <InstrumentOverlay
        isOpen={instrumentOpen && gameState === 'playing'}
        onClose={() => setInstrumentOpen(false)}
        instrumentType={instrumentType}
        onChangeInstrumentType={setInstrumentType}
        onNotePlayed={handleNotePlayed}
        savedSongs={saveData.savedSongs}
        onSaveRecordedSong={handleSaveRecordedSong}
      />

      {/* Full-Skin Shrine Wardrobe Modal */}
      <WardrobeModal
        isOpen={wardrobeOpen}
        onClose={() => setWardrobeOpen(false)}
        loadout={loadout}
        unlockedCosmeticIds={saveData.unlockedCosmeticIds}
        onChangeLoadout={handleChangeLoadout}
      />

      {/* Pause & Elder Temple Ascension Victory Modal */}
      {(gameState === 'paused' || gameState === 'gameover') && (
        <StatusModal
          gameState={gameState}
          progress={progress}
          physics={physics}
          onResume={() => {
            gameStateRef.current = 'playing';
            document.body.dataset.state = 'playing';
            setGameState('playing');
          }}
          onRestart={handleResetPosition}
          onReturnTitle={() => {
            gameStateRef.current = 'title';
            document.body.dataset.state = 'title';
            setGameState('title');
          }}
          onOpenWardrobe={() => setWardrobeOpen(true)}
        />
      )}
    </main>
  );
}
