import * as THREE from 'three';
import {
  RealmConfig,
  DayNightPhase,
  PRAIRIE_CFG,
  getDayNightAtmosphere,
  groundHeightAt,
  getKrillStateAtTime,
} from './rules';
import { createMicroReliefTexture } from './models';
import { PlacedFurniture } from '../core/StorageService';

export interface BuiltWorldRefs {
  root: THREE.Group;
  terrainMat: THREE.MeshStandardMaterial;
  waterMat: THREE.MeshStandardMaterial;
  cloudInstanced: THREE.InstancedMesh;
  astrolabeRing1: THREE.Mesh;
  astrolabeRing2: THREE.Mesh;
  krillGroup: THREE.Group;
  shardEventGroup: THREE.Group;
  homeFurnitureGroup: THREE.Group;
  windTunnelGroup: THREE.Group;
  applyRealmTheme: (realm: RealmConfig, dayNightPhase?: DayNightPhase) => void;
  updateDynamicHazards: (
    elapsed: number,
    realm: RealmConfig,
    krillAlertLevel: number,
    shardType: 'black' | 'red' | null
  ) => void;
  rebuildHomeFurniture: (placements: PlacedFurniture[], isHomeRealm: boolean) => void;
  updateWaterRipples: (
    elapsed: number,
    playerX: number,
    playerZ: number,
    isWading: boolean
  ) => void;
}

export function buildDarkPlantMesh(shadowTex: THREE.CanvasTexture): THREE.Group {
  const group = new THREE.Group();
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.4, 20).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.75 })
  );
  shadow.position.y = 0.02;
  group.add(shadow);

  const darkStemMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x31102f,
    emissiveIntensity: 0.4,
    roughness: 0.65,
  });
  const sporeGlowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.2,
    roughness: 0.3,
  });

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(Math.cos(angle) * 0.55, 0.55, Math.sin(angle) * 0.55),
      new THREE.Vector3(Math.cos(angle + 0.4) * 0.95, 1.15, Math.sin(angle + 0.4) * 0.95),
    ]);
    const vine = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.11, 8, false), darkStemMat);
    const leafCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 12, 10).scale(1.3, 0.4, 1.3),
       sporeGlowMat
    );
    leafCap.position.set(Math.cos(angle + 0.4) * 0.95, 1.2, Math.sin(angle + 0.4) * 0.95);
    group.add(vine, leafCap);
  }
  return group;
}

export function buildRainShelterMesh(shadowTex: THREE.CanvasTexture): THREE.Group {
  const group = new THREE.Group();
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(2.6, 24).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.72 })
  );
  shadow.position.y = 0.02;
  group.add(shadow);

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0xcffafe,
    emissive: 0x0891b2,
    emissiveIntensity: 0.35,
    roughness: 0.45,
  });
  const capMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.15,
    roughness: 0.25,
    metalness: 0.2,
  });

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.48, 2.9, 12), stemMat);
  stem.position.y = 1.45;
  const umbrellaCap = new THREE.Mesh(
    new THREE.ConeGeometry(2.65, 1.25, 18),
    capMat
  );
  umbrellaCap.position.y = 3.1;

  const shelterRing = new THREE.Mesh(
    new THREE.RingGeometry(3.5, 3.75, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  shelterRing.position.y = 0.04;

  group.add(stem, umbrellaCap, shelterRing);
  return group;
}

export function buildRaceRingMesh(): THREE.Group {
  const group = new THREE.Group();
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xfde047,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.35,
    roughness: 0.2,
    metalness: 0.75,
  });
  const torus = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.14, 12, 32), ringMat);
  torus.name = 'spirit_core';
  const innerGem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.42, 0),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  group.add(torus, innerGem);
  return group;
}

export function buildDarkCrabMesh(
  shadowTex: THREE.CanvasTexture,
  flipped = false
): THREE.Group {
  const group = new THREE.Group();
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.95, 18).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.7 })
  );
  shadow.position.y = 0.02;
  group.add(shadow);

  const crabVisual = new THREE.Group();
  crabVisual.name = 'crab_visual';
  crabVisual.position.y = 0.42;
  if (flipped) {
    crabVisual.rotation.z = Math.PI;
  }

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    emissive: flipped ? 0x0284c7 : 0x881337,
    emissiveIntensity: 0.55,
    roughness: 0.5,
    metalness: 0.35,
  });
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, 14, 12).scale(1.25, 0.65, 1.05),
    shellMat
  );
  crabVisual.add(shell);

  for (let side = -1; side <= 1; side += 2) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshBasicMaterial({ color: flipped ? 0x38bdf8 : 0xf43f5e })
    );
    eye.position.set(side * 0.24, 0.12, 0.48);
    crabVisual.add(eye);
  }
  group.add(crabVisual);
  return group;
}

export function buildCoopDoorMesh(shadowTex: THREE.CanvasTexture): THREE.Group {
  const group = new THREE.Group();
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 20).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.72 })
  );
  shadow.position.y = 0.02;
  group.add(shadow);

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x312e81,
    roughness: 0.5,
    metalness: 0.3,
  });
  const runeMat = new THREE.MeshStandardMaterial({
    color: 0xa78bfa,
    emissive: 0x7c3aed,
    emissiveIntensity: 1.3,
    roughness: 0.2,
  });

  [-1.35, 1.35].forEach((px) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.65, 3.6, 0.65), stoneMat);
    pillar.position.set(px, 1.8, 0);
    const switchGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), runeMat);
    switchGem.position.set(px, 1.35, 0.45);
    group.add(pillar, switchGem);
  });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.55, 0.75), stoneMat);
  lintel.position.set(0, 3.7, 0);
  const centerSeal = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.09, 10, 24), runeMat);
  centerSeal.position.set(0, 2.0, 0);
  centerSeal.name = 'spirit_core';
  group.add(lintel, centerSeal);
  return group;
}

export function buildStarlightElevatorMesh(shadowTex: THREE.CanvasTexture): THREE.Group {
  const group = new THREE.Group();
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(2.8, 24).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.7 })
  );
  shadow.position.y = 0.02;
  group.add(shadow);

  const discMat = new THREE.MeshStandardMaterial({
    color: 0x4338ca,
    emissive: 0x6366f1,
    emissiveIntensity: 0.9,
    roughness: 0.25,
    metalness: 0.6,
  });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.2, 0.32, 24), discMat);
  disc.position.y = 0.2;

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(2.65, 0.08, 10, 32).rotateX(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xc4b5fd })
  );
  halo.position.y = 0.42;
  halo.name = 'spirit_core';
  group.add(disc, halo);
  return group;
}

export function buildEdenStatueMesh(
  shadowTex: THREE.CanvasTexture,
  activated = false
): THREE.Group {
  const group = new THREE.Group();
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.1, 18).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.75 })
  );
  shadow.position.y = 0.02;
  group.add(shadow);

  const statueMat = new THREE.MeshStandardMaterial({
    color: activated ? 0xfef08a : 0x3f3f46,
    emissive: activated ? 0xf59e0b : 0x881337,
    emissiveIntensity: activated ? 1.25 : 0.35,
    roughness: 0.65,
  });
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 1.25, 10), statueMat);
  torso.position.y = 0.65;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), statueMat);
  head.position.y = 1.45;
  const coreGem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.24, 0),
    new THREE.MeshBasicMaterial({ color: activated ? 0xfef08a : 0xf43f5e })
  );
  coreGem.position.set(0, 0.95, 0.3);
  coreGem.name = 'spirit_core';
  group.add(torso, head, coreGem);
  return group;
}

/**
 * Stage 12: Builds bespoke 3D interactive meshes for the 6《光·遇》Tribute Easter Eggs.
 */
export function buildEasterEggMesh(
  shadowTex: THREE.CanvasTexture,
  eggId: string
): THREE.Group {
  const group = new THREE.Group();
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(2.1, 22).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.72,
    })
  );
  shadow.position.y = 0.02;
  group.add(shadow);

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfde047,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.1,
    roughness: 0.25,
    metalness: 0.75,
  });

  if (eggId === 'egg_oreo_plush_shrine') {
    // 8-Player Summoning Ring + Adorable Black & White Oreo Puppy (奥利奥小狗)
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.5, 1.75, 8).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      })
    );
    ring.position.y = 0.04;
    group.add(ring);

    const cushion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.85, 0.28, 16),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.6 })
    );
    cushion.position.y = 0.14;
    group.add(cushion);

    const pupGroup = new THREE.Group();
    pupGroup.name = 'spirit_core';
    pupGroup.position.y = 0.52;
    const blackFur = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });
    const whiteFur = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });

    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 14, 12).scale(1.25, 0.85, 0.9),
      blackFur
    );
    const belly = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 12, 10).scale(1.05, 0.75, 0.85),
      whiteFur
    );
    belly.position.set(0.08, -0.04, 0);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), blackFur);
    head.position.set(0.32, 0.24, 0);
    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), whiteFur);
    snout.position.set(0.52, 0.2, 0);
    const earL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.1), blackFur);
    earL.position.set(0.28, 0.42, 0.18);
    const earR = earL.clone();
    earR.position.z = -0.18;
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.28, 8), whiteFur);
    tail.position.set(-0.42, 0.18, 0);
    tail.rotation.z = 0.6;
    pupGroup.add(body, belly, head, snout, earL, earR, tail);
    group.add(pupGroup);
  } else if (eggId === 'egg_little_prince_rose') {
    // B612 Glass Dome Glowing Crimson Rose (星光沙漠玫瑰)
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.82, 0.7, 16),
      new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.5 })
    );
    plinth.position.y = 0.35;
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.5 })
    );
    stem.position.y = 0.92;
    const roseBlossom = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.22, 1),
      new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xe11d48,
        emissiveIntensity: 1.5,
        roughness: 0.2,
      })
    );
    roseBlossom.position.y = 1.18;
    roseBlossom.name = 'spirit_core';
    const glassDome = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.48, 0.95, 20),
      new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.34,
        roughness: 0.05,
        metalness: 0.2,
      })
    );
    glassDome.position.y = 1.12;
    group.add(plinth, stem, roseBlossom, glassDome);
  } else if (eggId === 'egg_grandma_feast_table') {
    // Grandma's Ancestor Table + Steaming Golden Wax Buns (老奶奶团子盛宴)
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.35, 1.25),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 })
    );
    table.position.y = 0.55;
    group.add(table);
    const bunCluster = new THREE.Group();
    bunCluster.name = 'spirit_core';
    bunCluster.position.y = 1.05;
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), goldMat);
      bun.position.set(Math.cos(ang) * 0.65, (i % 2) * 0.12, Math.sin(ang) * 0.35);
      bunCluster.add(bun);
    }
    group.add(bunCluster);
  } else if (eggId === 'egg_tgc_office_portal') {
    // TGC Secret Office Blue Barrier + Space Station Satellite
    const portalFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 2.8, 0.22),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 0.62,
      })
    );
    portalFrame.position.y = 1.4;
    const satellite = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.42, 0.1, 48, 8),
      goldMat
    );
    satellite.position.y = 2.6;
    satellite.name = 'spirit_core';
    group.add(portalFrame, satellite);
  } else if (eggId === 'egg_hermit_yeti_igloo') {
    // Hermit Valley Yeti Plush + Warm Cocoa Mug & Snow Dome
    const snowBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.3, 0.28, 20),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.55 })
    );
    snowBase.position.y = 0.14;
    const yetiGroup = new THREE.Group();
    yetiGroup.name = 'spirit_core';
    yetiGroup.position.y = 0.72;
    const yetiFurMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
    const yetiTorso = new THREE.Mesh(new THREE.SphereGeometry(0.48, 14, 12), yetiFurMat);
    const yetiHead = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), yetiFurMat);
    yetiHead.position.y = 0.52;
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.34, 8), goldMat);
    hornL.position.set(-0.24, 0.78, 0);
    hornL.rotation.z = 0.45;
    const hornR = hornL.clone();
    hornR.position.x = 0.24;
    hornR.rotation.z = -0.45;
    yetiGroup.add(yetiTorso, yetiHead, hornL, hornR);
    group.add(snowBase, yetiGroup);
  } else if (eggId === 'egg_forgotten_ark_rainbow_spell') {
    // Forgotten Ark 6-Color Enchantment Orbs & Miniature Golden Ark
    const arkHull = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.45, 0.72),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 })
    );
    arkHull.position.y = 0.55;
    const orbsGroup = new THREE.Group();
    orbsGroup.name = 'spirit_core';
    orbsGroup.position.y = 1.45;
    const spellColors = [0xef4444, 0x38bdf8, 0x4ade80, 0xfacc15, 0xc084fc, 0xf472b6];
    spellColors.forEach((hex, idx) => {
      const ang = (idx / 6) * Math.PI * 2;
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 10),
        new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 1.3 })
      );
      orb.position.set(Math.cos(ang) * 0.85, Math.sin(idx) * 0.15, Math.sin(ang) * 0.85);
      orbsGroup.add(orb);
    });
    group.add(arkHull, orbsGroup);
  } else if (eggId === 'egg_aurora_concert_wings') {
    // AURORA Golden Translucent Butterfly Wings & Starlight Stage Pedestal
    const stagePedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.45, 0.36, 24),
      goldMat
    );
    stagePedestal.position.y = 0.18;
    const wingsGroup = new THREE.Group();
    wingsGroup.name = 'spirit_core';
    wingsGroup.position.y = 1.45;
    const auroraWingMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.35,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
    });
    const wingL = new THREE.Mesh(new THREE.CircleGeometry(0.95, 16), auroraWingMat);
    wingL.scale.set(1.2, 0.75, 1);
    wingL.position.set(-0.78, 0.1, 0);
    wingL.rotation.y = 0.35;
    const wingR = wingL.clone();
    wingR.position.x = 0.78;
    wingR.rotation.y = -0.35;
    wingsGroup.add(wingL, wingR);
    group.add(stagePedestal, wingsGroup);
  } else if (eggId === 'egg_abyss_treasure_leviathan') {
    // Abyss Bioluminescent Treasure Chest & Aqua Pearl Core
    const chestBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.68, 0.85),
      new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.5, metalness: 0.4 })
    );
    chestBase.position.y = 0.34;
    const pearlCore = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.46, 1),
      new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.4,
      })
    );
    pearlCore.position.y = 1.28;
    pearlCore.name = 'spirit_core';
    group.add(chestBase, pearlCore);
  } else if (eggId === 'egg_wind_paths_kalimba_chime') {
    // Season of Flight Golden Wind-Chime & White Bird Messenger
    const chimeRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.12, 12, 28),
      goldMat
    );
    chimeRing.position.y = 1.55;
    const chimeCore = new THREE.Group();
    chimeCore.name = 'spirit_core';
    chimeCore.position.y = 1.55;
    [-0.45, 0, 0.45].forEach((cx, idx) => {
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 1.1 + idx * 0.2, 10),
        goldMat
      );
      tube.position.set(cx, -0.35, 0);
      chimeCore.add(tube);
    });
    group.add(chimeRing, chimeCore);
  } else if (eggId === 'egg_trial_of_fire_brazier') {
    // Season of Prophecy 4-Trial Golden Crown Fire Brazier
    const altarBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.35, 0.65, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65 })
    );
    altarBase.position.y = 0.325;
    const flameCrown = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.58, 0),
      goldMat
    );
    flameCrown.position.y = 1.38;
    flameCrown.name = 'spirit_core';
    group.add(altarBase, flameCrown);
  } else {
    // Sanctuary Conch Geyser & Rainbow Bridge Prism Altar
    const conchRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.35, 0.22, 12, 28).rotateX(Math.PI / 2),
      new THREE.MeshStandardMaterial({
        color: eggId === 'egg_rainbow_bridge' ? 0xc084fc : 0x38bdf8,
        emissive: eggId === 'egg_rainbow_bridge' ? 0x9333ea : 0x0284c7,
        emissiveIntensity: 1.1,
      })
    );
    conchRing.position.y = 0.2;
    const coreCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.52, 0), goldMat);
    coreCrystal.position.y = 1.35;
    coreCrystal.name = 'spirit_core';
    group.add(conchRing, coreCrystal);
  }

  return group;
}

export function buildSkyWorldEnvironment(
  renderer: THREE.WebGLRenderer,
  initialRealm: RealmConfig
): BuiltWorldRefs {
  const root = new THREE.Group();

  const stoneBump = createMicroReliefTexture(renderer, 'stone');
  stoneBump.repeat.set(28, 28);
  const runeTex = createMicroReliefTexture(renderer, 'gold_runes');

  // 1. Stage 13 Ultra-Wide Continent Sculpted Terrain Mesh (520x520m, >11x original area!)
  const terrainGeo = new THREE.PlaneGeometry(520, 520, 200, 200);
  terrainGeo.rotateX(-Math.PI / 2);
  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    let vy = groundHeightAt(vx, vz);
    // Recess procedural grass/soil mesh slightly underneath stone architectural platforms so it never pokes through stone tiers
    const distCenter = Math.hypot(vx, vz);
    const distTemple = Math.hypot(vx, vz + 50);
    if (distCenter < 7.2) {
      vy -= 0.16;
    } else if (Math.abs(vx) < 2.3 && vz < -8.0 && vz > -42.0) {
      vy -= 0.14;
    } else if (distTemple < 10.8) {
      vy -= 0.18;
    }
    posAttr.setY(i, vy);
  }
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    color: initialRealm.groundPrimaryColor,
    roughness: 0.78,
    metalness: 0.08,
    bumpMap: stoneBump,
    bumpScale: 0.04,
  });
  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.receiveShadow = true;
  root.add(terrainMesh);

  // 2. Stage 13 Expanded Reflective Mirror Ocean surrounding all 8 Outer Sanctuaries (880x880m)
  const waterGeo = new THREE.PlaneGeometry(880, 880, 1, 1);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({
    color: initialRealm.waterColor,
    roughness: 0.16,
    metalness: 0.45,
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.position.y = -0.15;
  waterMesh.receiveShadow = true;
  root.add(waterMesh);

  // 3. Central Starlight Constellation Altar (遇境星盘祭坛 — top surface flush with groundHeightAt(0,0) = 1.20)
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0xdbeafe,
    roughness: 0.55,
    metalness: 0.15,
    bumpMap: stoneBump,
    bumpScale: 0.03,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.8,
  });

  const shrineGroup = new THREE.Group();
  shrineGroup.position.set(0, groundHeightAt(0, 0), 0);

  const outerTier = new THREE.Mesh(new THREE.CylinderGeometry(6.8, 7.3, 0.36, 36), stoneMat);
  outerTier.position.y = -0.185;
  outerTier.receiveShadow = true;

  const innerTier = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.8, 0.24, 36), stoneMat);
  innerTier.position.y = -0.12;
  innerTier.receiveShadow = true;

  // Starlight Rune Compass Decal flush on Altar (polygonOffset prevents Z-fighting)
  const runeDiscMat = new THREE.MeshStandardMaterial({
    map: runeTex,
    roughness: 0.3,
    metalness: 0.5,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const runeDisc = new THREE.Mesh(
    new THREE.CircleGeometry(4.0, 36).rotateX(-Math.PI / 2),
    runeDiscMat
  );
  runeDisc.position.y = 0.006;

  shrineGroup.add(outerTier, innerTier, runeDisc);

  // Shrine Meditation Glowing Lotus Circle at (0, 0.012, 2.2)
  const meditationRingMat = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const meditationRing = new THREE.Mesh(
    new THREE.RingGeometry(0.68, 0.86, 32).rotateX(-Math.PI / 2),
    meditationRingMat
  );
  meditationRing.position.set(0, 0.014, 2.2);
  shrineGroup.add(meditationRing);

  // 6 Wardrobe & Realm Stone Pillars flanking Left & Right of the Central Shrine
  const flankAngles = [-0.35, 0, 0.35, Math.PI - 0.35, Math.PI, Math.PI + 0.35];
  for (let i = 0; i < flankAngles.length; i++) {
    const angle = flankAngles[i];
    const px = Math.cos(angle) * 6.4;
    const pz = Math.sin(angle) * 6.4;

    const pillar = new THREE.Group();
    pillar.position.set(px, -0.02, pz);
    pillar.lookAt(0, -0.02, 0);

    const col = new THREE.Mesh(new THREE.BoxGeometry(0.75, 2.5, 0.55), stoneMat);
    col.position.y = 1.25;
    col.castShadow = true;

    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.65, 4).rotateY(Math.PI / 4), goldMat);
    cap.position.y = 2.82;

    const starGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), goldMat);
    starGem.position.set(0, 1.5, 0.32);

    pillar.add(col, cap, starGem);
    shrineGroup.add(pillar);
  }
  root.add(shrineGroup);

  // 3b. Stage 1 West Shallow Water Reflection Pool (x = -15.5, z = 0.0, y = 0.36) + Concentric Wading Ripples
  const poolSurfaceMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.22,
    roughness: 0.08,
    metalness: 0.35,
    transparent: true,
    opacity: 0.76,
  });
  const poolDisc = new THREE.Mesh(
    new THREE.CircleGeometry(4.1, 36).rotateX(-Math.PI / 2),
    poolSurfaceMat
  );
  poolDisc.position.set(-15.5, 0.36, 0.0);
  const poolRim = new THREE.Mesh(
    new THREE.TorusGeometry(4.2, 0.22, 10, 36).rotateX(Math.PI / 2),
    stoneMat
  );
  poolRim.position.set(-15.5, 0.35, 0.0);
  root.add(poolDisc, poolRim);

  // 3 Concentric Wading Ripple Rings that expand around player's ankles in shallow water
  const rippleRings: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }[] = [];
  for (let r = 0; r < 3; r++) {
    const rMat = new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const rMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.36, 28).rotateX(-Math.PI / 2),
      rMat
    );
    rMesh.position.set(-15.5, 0.375, 0.0);
    root.add(rMesh);
    rippleRings.push({ mesh: rMesh, mat: rMat });
  }

  // 3b-2. Stage 2 Dark Water Hazard Basin (x = -15.5, z = -12.0, y = 0.34) for Energy Drain Testing
  const darkWaterMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    emissive: 0x4c1d95,
    emissiveIntensity: 0.35,
    roughness: 0.14,
    metalness: 0.45,
    transparent: true,
    opacity: 0.88,
  });
  const darkPoolDisc = new THREE.Mesh(
    new THREE.CircleGeometry(3.45, 32).rotateX(-Math.PI / 2),
    darkWaterMat
  );
  darkPoolDisc.position.set(-15.5, 0.34, -12.0);
  const darkPoolRim = new THREE.Mesh(
    new THREE.TorusGeometry(3.55, 0.2, 10, 32).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.78 })
  );
  darkPoolRim.position.set(-15.5, 0.33, -12.0);
  root.add(darkPoolDisc, darkPoolRim);

  // 3c. Stage 1 East Steep Slide Slope & High-Fall Ledge Markers (x = 12..24, z = -4..4)
  [-3.8, 3.8].forEach((sz) => {
    const gatePost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 2.2, 10),
      stoneMat
    );
    gatePost.position.set(12.2, groundHeightAt(12.2, sz) + 1.0, sz);
    const gateGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), goldMat);
    gateGem.position.set(12.2, groundHeightAt(12.2, sz) + 2.3, sz);
    root.add(gatePost, gateGem);
  });
  const summitPillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.42, 2.6, 12),
    goldMat
  );
  summitPillar.position.set(23.5, groundHeightAt(23.5, 0) + 1.2, 0);
  root.add(summitPillar);

  // 4. Stepped Causeway Path leading North (-Z) to the Elder Temple (top surface flush with groundHeightAt)
  for (let s = 0; s < 8; s++) {
    const sz = -10 - s * 4.2;
    const sy = groundHeightAt(0, sz);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.32, 2.8), stoneMat);
    slab.position.set(0, sy - 0.15, sz);
    slab.receiveShadow = true;
    root.add(slab);

    // Brazier lanterns flanking the path every 2 slabs
    if (s % 2 === 0) {
      [-2.8, 2.8].forEach((sideX) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 1.6, 8), stoneMat);
        post.position.set(sideX, groundHeightAt(sideX, sz) + 0.8, sz);
        const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), goldMat);
        orb.position.set(sideX, groundHeightAt(sideX, sz) + 1.85, sz);
        root.add(post, orb);
      });
    }
  }

  // 5. Northern Elder Temple Sanctuary Landmark (plinth flush with groundHeightAt, hall shifted to z = -55 so altar at z = -48 is open)
  const templeGroup = new THREE.Group();
  const templeBaseY = groundHeightAt(0, -50);
  templeGroup.position.set(0, templeBaseY, -50);

  const plinth1 = new THREE.Mesh(new THREE.CylinderGeometry(9.5, 11.2, 2.4, 16), stoneMat);
  plinth1.position.y = -1.2;
  plinth1.receiveShadow = true;

  const mainHall = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 5.4, 9.5, 12), stoneMat);
  mainHall.position.set(0, 4.75, -5.0);
  mainHall.castShadow = true;

  const goldenRoof = new THREE.Mesh(new THREE.ConeGeometry(5.6, 7.5, 12), goldMat);
  goldenRoof.position.set(0, 13.2, -5.0);
  goldenRoof.castShadow = true;

  const spireNeedle = new THREE.Mesh(new THREE.ConeGeometry(0.45, 6.5, 8), goldMat);
  spireNeedle.position.set(0, 19.5, -5.0);

  // Rotating Celestial Astrolabe Rings crowning the Temple
  const astrolabeRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(4.8, 0.14, 10, 36),
    goldMat
  );
  astrolabeRing1.position.set(0, 14.5, -5.0);

  const astrolabeRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(6.2, 0.12, 10, 36),
    goldMat
  );
  astrolabeRing2.position.set(0, 14.5, -5.0);
  astrolabeRing2.rotation.x = Math.PI / 3;

  // Flanking Bell Towers
  [-11, 11].forEach((tx) => {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 11, 10), stoneMat);
    tower.position.set(tx, 4.5, 2.5);
    tower.castShadow = true;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 4.2, 10), goldMat);
    roof.position.set(tx, 12.0, 2.5);
    templeGroup.add(tower, roof);
  });

  templeGroup.add(plinth1, mainHall, goldenRoof, spireNeedle, astrolabeRing1, astrolabeRing2);
  root.add(templeGroup);

  // 5b. Stage 3 Prairie Sub-Zone Landmarks (蝴蝶平原石拱、幽光洞窟荧光晶石窟、三塔钟楼村落金钟塔)
  const prairieLandmarksGroup = new THREE.Group();

  // Sub-Zone 1: Butterfly Meadow Welcome Stone Archway at (0, groundHeightAt(0,-8), -8)
  const meadowArchY = groundHeightAt(0, -8);
  const meadowArch = new THREE.Mesh(
    new THREE.TorusGeometry(3.6, 0.28, 10, 28, Math.PI),
    stoneMat
  );
  meadowArch.position.set(0, meadowArchY + 0.2, -8.0);
  const meadowArchCrown = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.42, 0),
    goldMat
  );
  meadowArchCrown.position.set(0, meadowArchY + 4.2, -8.0);
  prairieLandmarksGroup.add(meadowArch, meadowArchCrown);

  // Sub-Zone 2: Echo Cavern (幽光洞窟) Stone Grotto Arch & Bioluminescent Crystal Spires around (-18.5, -16.0)
  const cavernGroup = new THREE.Group();
  const cavernBaseY = groundHeightAt(-18.5, -16.0);
  cavernGroup.position.set(-18.5, cavernBaseY, -16.0);
  const cavernArch1 = new THREE.Mesh(
    new THREE.TorusGeometry(4.6, 0.85, 10, 20, Math.PI),
    stoneMat
  );
  cavernArch1.rotation.y = 0.55;
  const cavernArch2 = new THREE.Mesh(
    new THREE.TorusGeometry(3.8, 0.72, 10, 20, Math.PI),
    stoneMat
  );
  cavernArch2.position.set(-1.4, -0.2, -1.8);
  cavernArch2.rotation.y = 0.45;
  const cavernCrystalMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.25,
    roughness: 0.2,
    metalness: 0.3,
  });
  [-2.6, 2.4, -0.8].forEach((cx, idx) => {
    const crystal = new THREE.Mesh(
      new THREE.ConeGeometry(0.38, 2.2 + idx * 0.45, 6),
      cavernCrystalMat
    );
    crystal.position.set(cx, 1.0, idx === 2 ? -2.4 : 1.2);
    crystal.rotation.z = (idx - 1) * 0.22;
    cavernGroup.add(crystal);
  });
  cavernGroup.add(cavernArch1, cavernArch2);
  prairieLandmarksGroup.add(cavernGroup);

  // Sub-Zone 3: Three-Tower Bell Village (三塔钟楼村落) Belfry Spire at (16.5, -24.5)
  const villageBellGroup = new THREE.Group();
  const vBellY = groundHeightAt(16.5, -24.5);
  villageBellGroup.position.set(16.5, vBellY, -24.5);
  const vPlinth = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 3.1, 0.8, 12),
    stoneMat
  );
  vPlinth.position.y = -0.36;
  const vPillarL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.38, 6.2, 10),
    stoneMat
  );
  vPillarL.position.set(-1.35, 3.4, 0);
  const vPillarR = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.38, 6.2, 10),
    stoneMat
  );
  vPillarR.position.set(1.35, 3.4, 0);
  const vRoof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 3.2, 10), goldMat);
  vRoof.position.set(0, 7.8, 0);
  const hangingBell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.68, 1.1, 14),
    goldMat
  );
  hangingBell.position.set(0, 5.2, 0);
  hangingBell.name = 'village_bell';
  villageBellGroup.add(vPlinth, vPillarL, vPillarR, vRoof, hangingBell);
  prairieLandmarksGroup.add(villageBellGroup);
  root.add(prairieLandmarksGroup);

  // 5c. Stage 3 Wind Tunnel Corridor Stream Rings (云野风洞流光环 · z = -14 .. -36, y = 6.8)
  const windTunnelGroup = new THREE.Group();
  const windRingMat = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.58,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const wtCfg = PRAIRIE_CFG.windTunnel;
  const windRings: THREE.Mesh[] = [];
  for (let i = 0; i < wtCfg.ringCount; i++) {
    const t = i / Math.max(1, wtCfg.ringCount - 1);
    const wz = wtCfg.zStart + (wtCfg.zEnd - wtCfg.zStart) * t;
    const wy = wtCfg.ringAltitudeY + Math.sin(t * Math.PI) * 1.6;
    const ringMesh = new THREE.Mesh(
      new THREE.TorusGeometry(3.8, 0.085, 10, 32),
      windRingMat
    );
    ringMesh.position.set(0, wy, wz);
    windTunnelGroup.add(ringMesh);
    windRings.push(ringMesh);
  }
  root.add(windTunnelGroup);

  // 5d. Stage 12 Outer Sanctuaries & High-Altitude Sky Islands (圣岛海螺喷泉群岛、千鸟天际浮岛、老奶奶秘密树屋、北境七彩彩虹桥)
  const outerSanctuariesGroup = new THREE.Group();

  // Outer Sanctuary 1: Sanctuary Islands Conch Geyser & Breaching Sky-Whale at (52, 4.2, -28)
  const geyserIslandGroup = new THREE.Group();
  const geyserY = groundHeightAt(52, -28);
  geyserIslandGroup.position.set(52, geyserY, -28);
  const conchSpire = new THREE.Mesh(
    new THREE.ConeGeometry(3.2, 6.8, 12),
    stoneMat
  );
  conchSpire.position.set(-4.2, 3.2, -2.5);
  conchSpire.rotation.z = -0.25;
  const geyserRim = new THREE.Mesh(
    new THREE.TorusGeometry(2.6, 0.35, 12, 28).rotateX(Math.PI / 2),
    stoneMat
  );
  geyserRim.position.set(0, 0.15, 0);
  const geyserJetPlume = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 1.85, 11.5, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  geyserJetPlume.position.set(0, 5.75, 0);
  geyserJetPlume.name = 'geyser_plume';
  // Ancient White Sky-Whale breaching above Sanctuary Islands
  const whaleGroup = new THREE.Group();
  whaleGroup.name = 'sanctuary_whale';
  whaleGroup.position.set(8.5, 9.5, -6.0);
  const whaleMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.65,
    roughness: 0.25,
  });
  const whaleBody = new THREE.Mesh(
    new THREE.CapsuleGeometry(1.35, 5.2, 10, 18).rotateX(Math.PI / 2),
    whaleMat
  );
  const whaleFluke = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.22, 1.4),
    whaleMat
  );
  whaleFluke.position.set(0, 0, -3.4);
  whaleGroup.add(whaleBody, whaleFluke);
  geyserIslandGroup.add(conchSpire, geyserRim, geyserJetPlume, whaleGroup);
  outerSanctuariesGroup.add(geyserIslandGroup);

  // Outer Sanctuary 2: Citadel Floating Sky Island at (46, 14.5, -68)
  const citadelGroup = new THREE.Group();
  const citadelY = groundHeightAt(46, -68);
  citadelGroup.position.set(46, citadelY, -68);
  const skyIslandBase = new THREE.Mesh(
    new THREE.ConeGeometry(8.5, 9.5, 14).rotateX(Math.PI),
    stoneMat
  );
  skyIslandBase.position.y = -4.75;
  const citadelRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(5.4, 0.16, 12, 36),
    goldMat
  );
  citadelRing1.position.y = 5.2;
  citadelRing1.name = 'citadel_ring_1';
  const citadelRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(6.8, 0.14, 12, 36),
    goldMat
  );
  citadelRing2.position.y = 5.2;
  citadelRing2.rotation.x = Math.PI / 3;
  citadelRing2.name = 'citadel_ring_2';
  citadelGroup.add(skyIslandBase, citadelRing1, citadelRing2);
  outerSanctuariesGroup.add(citadelGroup);

  // Outer Sanctuary 3: Grandma's Hollow Treehouse at (-54, 3.2, -32)
  const grandmaGroup = new THREE.Group();
  const grandmaY = groundHeightAt(-54, -32);
  grandmaGroup.position.set(-54, grandmaY, -32);
  const hollowTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(4.6, 5.8, 12.0, 20, 1, true, 0.55, Math.PI * 2 - 1.1),
    new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.85,
      side: THREE.DoubleSide,
    })
  );
  hollowTrunk.position.y = 5.8;
  const treeCrown = new THREE.Mesh(
    new THREE.DodecahedronGeometry(7.2, 1),
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.35,
      roughness: 0.65,
    })
  );
  treeCrown.position.y = 13.0;
  grandmaGroup.add(hollowTrunk, treeCrown);
  outerSanctuariesGroup.add(grandmaGroup);

  // Outer Sanctuary 4: 7-Color Prismatic Rainbow Sky-Bridge at (0, 9.2, -88)
  const rainbowBridgeGroup = new THREE.Group();
  const rbY = groundHeightAt(0, -88);
  rainbowBridgeGroup.position.set(0, rbY, -88);
  const rainbowColors = [
    0xef4444, 0xf97316, 0xfacc15, 0x4ade80, 0x38bdf8, 0x818cf8, 0xc084fc,
  ];
  rainbowColors.forEach((hex, idx) => {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(22.0, 0.22, 0.72),
      new THREE.MeshStandardMaterial({
        color: hex,
        emissive: hex,
        emissiveIntensity: 0.85,
        transparent: true,
        opacity: 0.78,
        roughness: 0.2,
      })
    );
    strip.position.set(0, -0.08, (idx - 3) * 0.74);
    rainbowBridgeGroup.add(strip);
  });
  outerSanctuariesGroup.add(rainbowBridgeGroup);

  // Outer Sanctuary 5: Wind Paths Cloud Archipelago at (112, 22, -96)
  const windPathsGroup = new THREE.Group();
  const wpY = groundHeightAt(112, -96);
  windPathsGroup.position.set(112, wpY, -96);
  const wpIslandBase = new THREE.Mesh(
    new THREE.ConeGeometry(10.5, 11.5, 14).rotateX(Math.PI),
    stoneMat
  );
  wpIslandBase.position.y = -5.75;
  const wpChimeArch = new THREE.Mesh(
    new THREE.TorusGeometry(6.2, 0.35, 12, 32, Math.PI),
    goldMat
  );
  wpChimeArch.position.y = 0.2;
  const wpSkyStreamRing = new THREE.Mesh(
    new THREE.TorusGeometry(9.5, 0.16, 10, 36).rotateX(Math.PI / 2),
    windRingMat
  );
  wpSkyStreamRing.position.y = 3.6;
  wpSkyStreamRing.name = 'wind_paths_ring';
  windPathsGroup.add(wpIslandBase, wpChimeArch, wpSkyStreamRing);
  outerSanctuariesGroup.add(windPathsGroup);

  // Outer Sanctuary 6: Hermit Valley Snow Peak & Sunset Gondola at (96, 18.5, 64)
  const hermitPeakGroup = new THREE.Group();
  const hpY = groundHeightAt(96, 64);
  hermitPeakGroup.position.set(96, hpY, 64);
  const snowPeakCone = new THREE.Mesh(
    new THREE.ConeGeometry(11.0, 12.0, 14).rotateX(Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.45 })
  );
  snowPeakCone.position.y = -6.0;
  const iglooDome = new THREE.Mesh(
    new THREE.SphereGeometry(3.4, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
  );
  iglooDome.position.set(-3.2, 0, -2.2);
  const gondolaPylon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.52, 8.5, 10),
    goldMat
  );
  gondolaPylon.position.set(4.5, 4.2, 1.8);
  hermitPeakGroup.add(snowPeakCone, iglooDome, gondolaPylon);
  outerSanctuariesGroup.add(hermitPeakGroup);

  // Outer Sanctuary 7: Abyss Bioluminescent Coral Reef Trench & Leviathan at (-108, 2.6, 68)
  const abyssGroup = new THREE.Group();
  const abY = groundHeightAt(-108, 68);
  abyssGroup.position.set(-108, abY, 68);
  const sunkenTower = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 3.2, 9.5, 12),
    new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.7 })
  );
  sunkenTower.position.set(-4.5, 4.6, -3.5);
  const coralArch = new THREE.Mesh(
    new THREE.TorusGeometry(5.5, 0.55, 10, 28, Math.PI),
    new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x0891b2,
      emissiveIntensity: 0.95,
    })
  );
  coralArch.rotation.y = 0.6;
  const leviathanGroup = new THREE.Group();
  leviathanGroup.name = 'abyss_leviathan';
  leviathanGroup.position.set(6.5, 6.2, 4.0);
  const leviathanBody = new THREE.Mesh(
    new THREE.CapsuleGeometry(1.1, 4.8, 10, 16).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.85,
    })
  );
  leviathanGroup.add(leviathanBody);
  abyssGroup.add(sunkenTower, coralArch, leviathanGroup);
  outerSanctuariesGroup.add(abyssGroup);

  // Outer Sanctuary 8: AURORA Starlight Concert Colosseum at (0, 12.8, -148)
  const auroraColosseumGroup = new THREE.Group();
  const acY = groundHeightAt(0, -148);
  auroraColosseumGroup.position.set(0, acY, -148);
  const colosseumPlinth = new THREE.Mesh(
    new THREE.CylinderGeometry(14.5, 16.5, 2.4, 28),
    stoneMat
  );
  colosseumPlinth.position.y = -1.2;
  for (let c = 0; c < 8; c++) {
    const cAng = (c / 8) * Math.PI * 2;
    const colMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.62, 7.8, 10),
      goldMat
    );
    colMesh.position.set(Math.cos(cAng) * 12.2, 3.9, Math.sin(cAng) * 12.2);
    auroraColosseumGroup.add(colMesh);
  }
  const auroraCrownRing = new THREE.Mesh(
    new THREE.TorusGeometry(9.8, 0.22, 12, 40),
    goldMat
  );
  auroraCrownRing.position.y = 8.4;
  auroraCrownRing.rotation.x = Math.PI / 2.4;
  auroraCrownRing.name = 'aurora_stage_ring';
  auroraColosseumGroup.add(colosseumPlinth, auroraCrownRing);
  outerSanctuariesGroup.add(auroraColosseumGroup);

  // Forgotten Ark (-88, -86.5 behind altar at -82) & Trial of Prophecy Gate (78, -118) Landmarks
  const arkLandmark = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 2.2, 3.2),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 })
  );
  arkLandmark.position.set(-88, groundHeightAt(-88, -86.5) + 1.1, -86.5);
  arkLandmark.rotation.z = 0.12;
  const trialGate = new THREE.Mesh(
    new THREE.TorusGeometry(4.8, 0.55, 10, 24, Math.PI),
    goldMat
  );
  trialGate.position.set(78, groundHeightAt(78, -118), -118);
  outerSanctuariesGroup.add(arkLandmark, trialGate);

  // 5e. 8 Continental Ground Architectural Villages, Pavilions, Towers, Bridges & Ruins (大陆地面建筑群落与可玩性升级)
  const warmWoodMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.72,
    metalness: 0.1,
  });
  const warmWindowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.35,
    roughness: 0.2,
  });

  // Southern Stepped Stone Causeway & Lanterns connecting Central Shrine (0,0) -> Aviary Village (0,28) -> Sundial Theater (0,62)
  for (let s = 0; s < 10; s++) {
    const sz = 10.0 + s * 4.4;
    if (Math.abs(sz - 28.0) < 4.5) continue;
    const sy = groundHeightAt(0, sz);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 2.6), stoneMat);
    slab.position.set(0, sy - 0.14, sz);
    slab.receiveShadow = true;
    outerSanctuariesGroup.add(slab);
  }
  [12.0, 20.0].forEach((sz) => {
    [-2.8, 2.8].forEach((sideX) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 1.6, 8), stoneMat);
      post.position.set(sideX, groundHeightAt(sideX, sz) + 0.8, sz);
      const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), goldMat);
      orb.position.set(sideX, groundHeightAt(sideX, sz) + 1.85, sz);
      outerSanctuariesGroup.add(post, orb);
    });
  });

  // Hub 1: South Aviary Village Plaza, Octagonal Tea Pavilion & 2 Stone Cottage Workshops at (0, 1.8, 28)
  const aviaryGroup = new THREE.Group();
  const aviaryY = groundHeightAt(0, 28);
  aviaryGroup.position.set(0, aviaryY, 28);
  const aviaryPlinth = new THREE.Mesh(
    new THREE.CylinderGeometry(5.2, 5.8, 0.72, 16),
    stoneMat
  );
  aviaryPlinth.position.y = -0.35;
  const teaTableMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.82, 0.68, 0.76, 14),
    warmWoodMat
  );
  teaTableMesh.position.y = 0.38;
  const teaFireCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.36, 1),
    warmWindowMat
  );
  teaFireCore.position.y = 1.05;
  [
    [-2.4, -2.4],
    [2.4, -2.4],
    [-2.4, 2.4],
    [2.4, 2.4],
  ].forEach(([cx, cz]) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 4.2, 10), stoneMat);
    col.position.set(cx, 2.1, cz);
    aviaryGroup.add(col);
  });
  const teaRoof1 = new THREE.Mesh(new THREE.ConeGeometry(4.5, 1.6, 8), goldMat);
  teaRoof1.position.y = 4.6;
  const teaRoof2 = new THREE.Mesh(new THREE.ConeGeometry(3.1, 1.5, 8), goldMat);
  teaRoof2.position.y = 5.8;
  // Flanking Aviary Stone Cottage Workshops at (-8.2, 28) & (8.2, 28)
  [-8.2, 8.2].forEach((shopX, idx) => {
    const shopGroup = new THREE.Group();
    shopGroup.position.set(shopX, 0, 0);
    const walls = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.25, 3.2, 8), stoneMat);
    walls.position.y = 1.6;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.65, 2.2, 8), goldMat);
    roof.position.y = 4.2;
    const winMesh = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.85, 0.18), warmWindowMat);
    winMesh.position.set(idx === 0 ? 1.95 : -1.95, 1.55, 0);
    winMesh.rotation.y = Math.PI / 2;
    const signGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), warmWindowMat);
    signGem.position.set(0, 5.5, 0);
    shopGroup.add(walls, roof, winMesh, signGem);
    aviaryGroup.add(shopGroup);
  });
  aviaryGroup.add(aviaryPlinth, teaTableMesh, teaFireCore, teaRoof1, teaRoof2);
  outerSanctuariesGroup.add(aviaryGroup);

  // Hub 2: South Ancient Sundial Amphitheater & 8-Pillar Hengestone Ring at (0, 3.2, 62)
  const sundialGroup = new THREE.Group();
  const sundialY = groundHeightAt(0, 62);
  sundialGroup.position.set(0, sundialY, 62);
  const sundialPlinth = new THREE.Mesh(
    new THREE.CylinderGeometry(8.8, 9.8, 1.2, 24),
    stoneMat
  );
  sundialPlinth.position.y = -0.58;
  const sundialObelisk = new THREE.Mesh(
    new THREE.ConeGeometry(1.12, 9.2, 8),
    goldMat
  );
  sundialObelisk.position.y = 4.6;
  const sundialHalo = new THREE.Mesh(
    new THREE.TorusGeometry(2.8, 0.12, 10, 32),
    goldMat
  );
  sundialHalo.position.y = 7.4;
  sundialHalo.rotation.x = Math.PI / 3;
  sundialHalo.name = 'sundial_halo_south';
  for (let k = 0; k < 8; k++) {
    const ang = (k / 8) * Math.PI * 2;
    const hx = Math.cos(ang) * 7.6;
    const hz = Math.sin(ang) * 7.6;
    const hCol = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.56, 5.4, 10), stoneMat);
    hCol.position.set(hx, 2.7, hz);
    const hCap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 2.4), stoneMat);
    hCap.position.set(hx, 5.5, hz);
    hCap.rotation.y = -ang;
    const hOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), goldMat);
    hOrb.position.set(hx, 6.1, hz);
    sundialGroup.add(hCol, hCap, hOrb);
  }
  sundialGroup.add(sundialPlinth, sundialObelisk, sundialHalo);
  outerSanctuariesGroup.add(sundialGroup);

  // Hub 3: Southeast Starlight Windmill Observatory & Archway at (34, 3.0, 26)
  const windmillGroup = new THREE.Group();
  const wmY = groundHeightAt(34, 26);
  windmillGroup.position.set(34, wmY, 26);
  const wmTower = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 2.1, 8.6, 12), stoneMat);
  wmTower.position.y = 4.3;
  const wmRoof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 2.8, 12), goldMat);
  wmRoof.position.y = 9.9;
  const sailsGroup = new THREE.Group();
  sailsGroup.position.set(0, 6.8, -1.75);
  sailsGroup.name = 'windmill_sails_se';
  for (let b = 0; b < 4; b++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.55, 4.2, 0.12), goldMat);
    const bAng = (b / 4) * Math.PI * 2;
    blade.position.set(Math.cos(bAng) * 2.1, Math.sin(bAng) * 2.1, 0);
    blade.rotation.z = bAng + Math.PI / 2;
    sailsGroup.add(blade);
  }
  const wmArch = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.34, 10, 24, Math.PI), stoneMat);
  wmArch.position.set(0, 0.2, -3.5);
  windmillGroup.add(wmTower, wmRoof, sailsGroup, wmArch);
  outerSanctuariesGroup.add(windmillGroup);

  // Hub 4: Southwest Mushroom Glen & Ancient Stone Bridge at (-24, 1.6, 18)
  const glenGroup = new THREE.Group();
  const glenY = groundHeightAt(-24, 18);
  glenGroup.position.set(-24, glenY, 18);
  const bridgeArch = new THREE.Mesh(
    new THREE.TorusGeometry(2.8, 0.42, 10, 24, Math.PI).rotateY(Math.PI / 2),
    stoneMat
  );
  bridgeArch.position.y = -0.8;
  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.28, 6.2), stoneMat);
  bridgeDeck.position.y = 0.05;
  const gazeboGroup = new THREE.Group();
  gazeboGroup.position.set(-4.2, 0, 0);
  const gazBase = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.72, 2.6, 8), stoneMat);
  gazBase.position.y = 1.3;
  const gazRoof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.8, 8), goldMat);
  gazRoof.position.y = 3.4;
  gazeboGroup.add(gazBase, gazRoof);
  glenGroup.add(bridgeArch, bridgeDeck, gazeboGroup);
  outerSanctuariesGroup.add(glenGroup);

  // Hub 5: East Sunset Race Arcade & Twin Glide Towers at (58, 3.5, 8)
  const eastRaceGroup = new THREE.Group();
  const erY = groundHeightAt(58, 8);
  eastRaceGroup.position.set(58, erY, 8);
  [-4.8, 4.8].forEach((tz) => {
    const rTower = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.92, 10.5, 12), stoneMat);
    rTower.position.set(0, 5.25, tz);
    const rRoof = new THREE.Mesh(new THREE.ConeGeometry(2.15, 3.2, 12), goldMat);
    rRoof.position.set(0, 12.0, tz);
    eastRaceGroup.add(rTower, rRoof);
  });
  const skyBridgeSpan = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 9.6), goldMat);
  skyBridgeSpan.position.set(0, 8.8, 0);
  // 3 Glowing Race Arcade Rings along the Eastern Glide Corridor
  [-24.0, -14.0, 0.0].forEach((offsetX) => {
    const rRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.4, 0.14, 10, 28).rotateY(Math.PI / 2),
      windRingMat
    );
    rRing.position.set(offsetX, 3.2, 0);
    eastRaceGroup.add(rRing);
  });
  eastRaceGroup.add(skyBridgeSpan);
  outerSanctuariesGroup.add(eastRaceGroup);

  // Hub 6: West Twilight Castle Ruins & Bonfire Courtyard at (-56, 2.8, 8)
  const westCastleGroup = new THREE.Group();
  const wcY = groundHeightAt(-56, 8);
  westCastleGroup.position.set(-56, wcY, 8);
  [-4.2, 4.2].forEach((tz) => {
    const bastion = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 2.02, 8.4, 10), stoneMat);
    bastion.position.set(-4.5, 4.2, tz);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(2.1, 2.4, 10), goldMat);
    crown.position.set(-4.5, 9.5, tz);
    westCastleGroup.add(bastion, crown);
  });
  [-3.8, 3.8].forEach((pz) => {
    const rPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.66, 4.6, 10), stoneMat);
    rPillar.position.set(4.5, 2.3, pz);
    const rOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 0), goldMat);
    rOrb.position.set(4.5, 5.0, pz);
    westCastleGroup.add(rPillar, rOrb);
  });
  const castleArchWall = new THREE.Mesh(
    new THREE.TorusGeometry(4.2, 0.52, 10, 24, Math.PI).rotateY(Math.PI / 2),
    stoneMat
  );
  castleArchWall.position.set(-4.5, 3.2, 0);
  westCastleGroup.add(castleArchWall);
  outerSanctuariesGroup.add(westCastleGroup);

  // Hub 7: Northeast Cloud-Sea Lighthouse & Parkour Stepping Pillars at (36, 3.6, -44)
  const lighthouseGroup = new THREE.Group();
  const lhY = groundHeightAt(36, -44);
  lighthouseGroup.position.set(36, lhY, -44);
  const lhTower = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.82, 11.2, 12), stoneMat);
  lhTower.position.y = 5.6;
  const lhLantern = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 1.6, 12), warmWindowMat);
  lhLantern.position.y = 11.8;
  const lhRoof = new THREE.Mesh(new THREE.ConeGeometry(1.65, 2.4, 12), goldMat);
  lhRoof.position.y = 13.6;
  const lhBeam = new THREE.Mesh(
    new THREE.ConeGeometry(1.6, 9.5, 16, 1, true).rotateZ(Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  lhBeam.position.set(0, 11.8, 0);
  lhBeam.name = 'lighthouse_beam_ne';
  lighthouseGroup.add(lhTower, lhLantern, lhRoof, lhBeam);
  outerSanctuariesGroup.add(lighthouseGroup);

  // Hub 8: Southwest Starlight Oasis Caravanserai & Twin Obelisks at (-48, 2.6, 56)
  const oasisGroup = new THREE.Group();
  const oaY = groundHeightAt(-48, 56);
  oasisGroup.position.set(-48, oaY, 56);
  const oaPavilion = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.72, 5.2, 10), stoneMat);
  oaPavilion.position.y = 2.6;
  const oaDome = new THREE.Mesh(new THREE.SphereGeometry(1.65, 16, 12), goldMat);
  oaDome.position.y = 5.6;
  [-4.5, 4.5].forEach((ox) => {
    const obelisk = new THREE.Mesh(new THREE.ConeGeometry(0.82, 5.6, 4), goldMat);
    obelisk.position.set(ox, 2.8, -3.0);
    oasisGroup.add(obelisk);
  });
  oasisGroup.add(oaPavilion, oaDome);
  outerSanctuariesGroup.add(oasisGroup);

  root.add(outerSanctuariesGroup);

  // 5f. InstancedMesh Ancient Wayfinder Ruin Columns & Golden Beacons across the Mid/Outer Continent
  const wayfinderCount = 36;
  const wayfinderGeo = new THREE.CylinderGeometry(0.32, 0.42, 3.4, 8);
  wayfinderGeo.translate(0, 1.7, 0);
  const wayfinderInstanced = new THREE.InstancedMesh(wayfinderGeo, stoneMat, wayfinderCount);
  const wfOrbGeo = new THREE.OctahedronGeometry(0.28, 0);
  wfOrbGeo.translate(0, 3.75, 0);
  const wfOrbInstanced = new THREE.InstancedMesh(wfOrbGeo, goldMat, wayfinderCount);
  const wfDummy = new THREE.Object3D();
  for (let i = 0; i < wayfinderCount; i++) {
    const ringIdx = i < 18 ? 0 : 1;
    const ang = ((i % 18) / 18) * Math.PI * 2 + 0.17 + ringIdx * 0.18;
    const rad = ringIdx === 0 ? 42.0 + (i % 3) * 4.5 : 78.0 + (i % 4) * 6.0;
    const wx = Math.cos(ang) * rad;
    const wz = Math.sin(ang) * rad;
    const wy = groundHeightAt(wx, wz);
    wfDummy.position.set(wx, wy - 0.1, wz);
    const wScale = 0.85 + (i % 3) * 0.18;
    wfDummy.scale.set(1, wScale, 1);
    wfDummy.rotation.set(0, ang, 0);
    wfDummy.updateMatrix();
    wayfinderInstanced.setMatrixAt(i, wfDummy.matrix);
    wfOrbInstanced.setMatrixAt(i, wfDummy.matrix);
  }
  wayfinderInstanced.instanceMatrix.needsUpdate = true;
  wfOrbInstanced.instanceMatrix.needsUpdate = true;
  wayfinderInstanced.computeBoundingSphere();
  wfOrbInstanced.computeBoundingSphere();
  root.add(wayfinderInstanced, wfOrbInstanced);

  // 5q. Stage 14: 48 Instanced Starlight Guiding Stepping Stones & Rune Lanterns connecting the Continental Hubs + Aviary Alchemy Cauldron & Sunset Race Finish Arch
  const guideWaypoints: [number, number, number, number][] = [
    // Segment 1: East Slide Ledge (22, 4) -> Sunset Race Arcade (36, 8) -> Twin Towers (54, 8)
    [14, 2, 34, 8],
    // Segment 2: Twin Towers (58, 8) -> Southeast Windmill Observatory (34, 26)
    [54, 11, 38, 23],
    // Segment 3: Southeast Windmill (34, 26) -> South Sundial Amphitheater (0, 62)
    [30, 30, 5, 57],
    // Segment 4: South Aviary Tea Village (0, 28) -> Southwest Mushroom Creek Bridge (-24, 18) -> West Twilight Castle (-52, 8)
    [-5, 26, -50, 9],
  ];
  const guideCount = 48;
  const guideSlabGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.22, 8);
  const guideRuneGeo = new THREE.OctahedronGeometry(0.22, 0);
  const lanternFlameMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const guideSlabInstanced = new THREE.InstancedMesh(guideSlabGeo, stoneMat, guideCount);
  const guideRuneInstanced = new THREE.InstancedMesh(guideRuneGeo, lanternFlameMat, guideCount);
  for (let i = 0; i < guideCount; i++) {
    const segIdx = Math.floor(i / 12);
    const stepInSeg = (i % 12) / 11;
    const [x0, z0, x1, z1] = guideWaypoints[segIdx];
    const gx = x0 + (x1 - x0) * stepInSeg;
    const gz = z0 + (z1 - z0) * stepInSeg;
    const gy = groundHeightAt(gx, gz);
    wfDummy.position.set(gx, gy + 0.08, gz);
    wfDummy.scale.set(1, 1, 1);
    wfDummy.rotation.set(0, i * 0.4, 0);
    wfDummy.updateMatrix();
    guideSlabInstanced.setMatrixAt(i, wfDummy.matrix);

    wfDummy.position.set(gx, gy + 0.42 + (i % 2) * 0.15, gz);
    wfDummy.updateMatrix();
    guideRuneInstanced.setMatrixAt(i, wfDummy.matrix);
  }
  guideSlabInstanced.instanceMatrix.needsUpdate = true;
  guideRuneInstanced.instanceMatrix.needsUpdate = true;
  guideSlabInstanced.computeBoundingSphere();
  guideRuneInstanced.computeBoundingSphere();
  root.add(guideSlabInstanced, guideRuneInstanced);

  // Aviary Magic Cottage Alchemy Spell Cauldron (-5.2, 1.8, 30.2) & Sunset Race Finish Arch (0, 3.2, 54.5)
  const alchemyGroup = new THREE.Group();
  const alcY = groundHeightAt(-5.2, 30.2);
  alchemyGroup.position.set(-5.2, alcY, 30.2);
  const cauldronPot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.55, 0.85, 12),
    goldMat
  );
  cauldronPot.position.y = 0.42;
  const cauldronBrew = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.62, 0.12, 12),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  cauldronBrew.position.y = 0.84;
  const cauldronHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.05, 8, 24),
    lanternFlameMat
  );
  cauldronHalo.position.y = 1.45;
  cauldronHalo.rotation.x = Math.PI / 3;
  cauldronHalo.name = 'aviary_spell_halo';
  alchemyGroup.add(cauldronPot, cauldronBrew, cauldronHalo);
  outerSanctuariesGroup.add(alchemyGroup);

  const finishArchGroup = new THREE.Group();
  const finY = groundHeightAt(0.0, 54.5);
  finishArchGroup.position.set(0.0, finY, 54.5);
  const finArch = new THREE.Mesh(
    new THREE.TorusGeometry(4.2, 0.28, 12, 32, Math.PI),
    goldMat
  );
  finArch.position.y = 0.2;
  const finBannerRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.4, 0.09, 10, 28),
    lanternFlameMat
  );
  finBannerRing.position.y = 3.2;
  finBannerRing.name = 'sunset_race_finish_ring';
  finishArchGroup.add(finArch, finBannerRing);
  outerSanctuariesGroup.add(finishArchGroup);

  // 6. InstancedMesh Billowing Cloud Sea Perimeter (inner, mid, and 210m ultra-outer cloud banks)
  const cloudCount = 192;
  const cloudGeo = new THREE.DodecahedronGeometry(5.2, 1);
  const cloudMat = new THREE.MeshStandardMaterial({
    color: initialRealm.cloudColor,
    emissive: initialRealm.skyHorizonColor,
    emissiveIntensity: 0.22,
    roughness: 0.9,
    metalness: 0.0,
  });
  const cloudInstanced = new THREE.InstancedMesh(cloudGeo, cloudMat, cloudCount);
  const dummy = new THREE.Object3D();
  const cColor = new THREE.Color();

  for (let i = 0; i < cloudCount; i++) {
    const ring = i < 64 ? 0 : i < 128 ? 1 : i < 160 ? 2 : 3;
    const countInRing = ring <= 1 ? 64 : 32;
    const angle = ((i % countInRing) / countInRing) * Math.PI * 2 + ring * 0.4;
    const radius =
      ring === 0
        ? 198 + (i % 7) * 5.2
        : ring === 1
          ? 124 + (i % 6) * 4.5
          : ring === 2
            ? 64 + (i % 7) * 4.0
            : 36 + (i % 5) * 4.5;
    const cx = Math.cos(angle) * radius;
    const cz = Math.sin(angle) * radius - 12;
    const cy =
      ring === 0
        ? 6.5 + (i % 6) * 3.2
        : ring === 1
          ? 3.5 + (i % 5) * 2.8
          : ring === 2
            ? 8.5 + (i % 4) * 2.5
            : 15 + (i % 5) * 3.5;

    dummy.position.set(cx, cy, cz);
    const sx = 1.5 + (i % 3) * 0.55;
    const sy = 0.8 + (i % 2) * 0.28;
    const sz = 1.3 + ((i + 1) % 3) * 0.45;
    dummy.scale.set(sx, sy, sz);
    dummy.rotation.set(0, angle, 0);
    dummy.updateMatrix();
    cloudInstanced.setMatrixAt(i, dummy.matrix);

    cColor.set(initialRealm.cloudColor).offsetHSL(0, 0, ((i % 5) - 2) * 0.03);
    cloudInstanced.setColorAt(i, cColor);
  }
  cloudInstanced.instanceMatrix.needsUpdate = true;
  if (cloudInstanced.instanceColor) cloudInstanced.instanceColor.needsUpdate = true;
  cloudInstanced.computeBoundingSphere();
  root.add(cloudInstanced);

  // 7. InstancedMesh Stylized Meadow Cypress Trees & Floating Spire Stones across the 220m continent
  const treeCount = 112;
  const treeGeo = new THREE.ConeGeometry(1.35, 5.2, 7);
  treeGeo.translate(0, 2.6, 0);
  const treeMat = new THREE.MeshStandardMaterial({
    color: initialRealm.groundSecondaryColor,
    roughness: 0.75,
  });
  const treeInstanced = new THREE.InstancedMesh(treeGeo, treeMat, treeCount);
  for (let i = 0; i < treeCount; i++) {
    const angle = (i / treeCount) * Math.PI * 2 + 0.25;
    const r =
      i < 36
        ? 21 + (i % 4) * 6.5
        : i < 76
          ? 48 + (i % 5) * 8.5
          : 96 + (i % 6) * 11.5;
    const tx = Math.cos(angle) * r;
    const tz = Math.sin(angle) * r - 4;
    if (Math.abs(tx) < 7 && tz < 68 && tz > -55) {
      dummy.position.set(tx + (tx >= 0 ? 11 : -11), groundHeightAt(tx + (tx >= 0 ? 11 : -11), tz), tz);
    } else {
      dummy.position.set(tx, groundHeightAt(tx, tz), tz);
    }
    const scale = 0.85 + (i % 4) * 0.16;
    dummy.scale.set(scale, scale * (0.9 + (i % 3) * 0.15), scale);
    dummy.rotation.set(0, i * 1.1, 0);
    dummy.updateMatrix();
    treeInstanced.setMatrixAt(i, dummy.matrix);
  }
  treeInstanced.instanceMatrix.needsUpdate = true;
  treeInstanced.computeBoundingSphere();
  root.add(treeInstanced);

  // 8. Patrolling Dark Dragon (冥龙 / Krill) + Searchlight Cone for Wasteland & Eden
  const krillGroup = new THREE.Group();
  krillGroup.visible = false;
  const krillBodyMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.6,
    metalness: 0.3,
  });
  const krillEyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const krillConeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const krillHead = new THREE.Mesh(
    new THREE.ConeGeometry(1.1, 2.8, 8).rotateX(Math.PI / 2),
    krillBodyMat
  );
  const krillEye = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 12), krillEyeMat);
  krillEye.position.set(0, 0, 1.35);
  krillGroup.add(krillHead, krillEye);

  for (let seg = 1; seg <= 6; seg++) {
    const segMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.05 - seg * 0.12, 0),
      krillBodyMat
    );
    segMesh.position.set(0, 0, -seg * 1.35);
    segMesh.name = `krill_seg_${seg}`;
    krillGroup.add(segMesh);
  }

  const spotlightCone = new THREE.Mesh(
    new THREE.ConeGeometry(5.5, 11.5, 20, 1, true),
    krillConeMat
  );
  spotlightCone.position.set(0, -4.8, 5.2);
  spotlightCone.rotation.x = -0.42;
  krillGroup.add(spotlightCone);
  root.add(krillGroup);

  // 9. Shard Eruption Event Crystal Group (黑石/红石碎片喷发事件)
  const shardEventGroup = new THREE.Group();
  shardEventGroup.position.set(8.5, groundHeightAt(8.5, -16), -16);
  shardEventGroup.visible = false;
  const shardCrystalMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    emissive: 0xbe123c,
    emissiveIntensity: 1.4,
    roughness: 0.25,
    metalness: 0.5,
  });
  for (let c = 0; c < 5; c++) {
    const ang = (c / 5) * Math.PI * 2;
    const shardSpike = new THREE.Mesh(
      new THREE.ConeGeometry(0.55 + (c === 0 ? 0.45 : 0), 2.8 + (c === 0 ? 1.4 : 0), 6),
      shardCrystalMat
    );
    shardSpike.position.set(
      c === 0 ? 0 : Math.cos(ang) * 1.2,
      1.1,
      c === 0 ? 0 : Math.sin(ang) * 1.2
    );
    shardSpike.rotation.z = c === 0 ? 0 : Math.cos(ang) * 0.35;
    shardSpike.rotation.x = c === 0 ? 0 : Math.sin(ang) * 0.35;
    shardEventGroup.add(shardSpike);
  }
  root.add(shardEventGroup);

  // 10. Home Workshop Furniture Group (小屋工坊自定义家具摆放)
  const homeFurnitureGroup = new THREE.Group();
  root.add(homeFurnitureGroup);

  const rebuildHomeFurniture = (placements: PlacedFurniture[], isHomeRealm: boolean) => {
    while (homeFurnitureGroup.children.length > 0) {
      homeFurnitureGroup.remove(homeFurnitureGroup.children[0]);
    }
    homeFurnitureGroup.visible = isHomeRealm;
    if (!isHomeRealm) return;

    for (const item of placements) {
      const fGroup = new THREE.Group();
      const fy = groundHeightAt(item.x, item.z);
      fGroup.position.set(item.x, fy, item.z);
      fGroup.rotation.y = item.rotY;

      if (item.furnitureId === 'furn_starlight_brazier') {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.42, 0.55, 12), stoneMat);
        pot.position.y = 0.28;
        const fire = new THREE.Mesh(
          new THREE.ConeGeometry(0.38, 0.75, 10),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        fire.position.y = 0.72;
        fGroup.add(pot, fire);
      } else if (item.furnitureId === 'furn_chat_bench') {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 0.65), stoneMat);
        seat.position.y = 0.48;
        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.48, 0.55), stoneMat);
        legL.position.set(-0.7, 0.24, 0);
        const legR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.48, 0.55), stoneMat);
        legR.position.set(0.7, 0.24, 0);
        const candleOnTable = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 0.22, 8),
          goldMat
        );
        candleOnTable.position.set(0, 0.66, 0);
        fGroup.add(seat, legL, legR, candleOnTable);
      } else if (item.furnitureId === 'furn_sakura_canopy') {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.6, 10), goldMat);
        pole.position.y = 1.3;
        const canopy = new THREE.Mesh(
          new THREE.ConeGeometry(1.85, 0.75, 12),
          new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 })
        );
        canopy.position.y = 2.65;
        fGroup.add(pole, canopy);
      } else if (item.furnitureId === 'furn_floating_lantern') {
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.25, 10), stoneMat);
        stand.position.y = 0.125;
        const orb = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.36, 1),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        orb.position.y = 1.65;
        const halo = new THREE.Mesh(
          new THREE.TorusGeometry(0.55, 0.04, 8, 20),
          goldMat
        );
        halo.position.y = 1.65;
        halo.rotation.x = Math.PI / 3;
        fGroup.add(stand, orb, halo);
      } else if (item.furnitureId === 'furn_manta_plush_rug') {
        const rug = new THREE.Mesh(
          new THREE.CylinderGeometry(1.35, 1.38, 0.06, 24),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.65 })
        );
        rug.position.y = 0.03;
        const mantaBody = new THREE.Mesh(
          new THREE.SphereGeometry(0.32, 12, 10),
          new THREE.MeshBasicMaterial({ color: 0xfef9c3 })
        );
        mantaBody.scale.set(1.4, 0.55, 1.1);
        mantaBody.position.set(0, 0.22, 0);
        fGroup.add(rug, mantaBody);
      } else {
        // Wind chime arch
        const arch = new THREE.Mesh(
          new THREE.TorusGeometry(1.2, 0.1, 10, 24, Math.PI),
          goldMat
        );
        arch.position.y = 0.1;
        fGroup.add(arch);
      }

      homeFurnitureGroup.add(fGroup);
    }
  };

  const applyRealmTheme = (realm: RealmConfig, dayNightPhase: DayNightPhase = 'noon') => {
    const atmo = getDayNightAtmosphere(dayNightPhase);
    const useAtmo = realm.id === 'prairie' || realm.id === 'home' || dayNightPhase !== 'noon';
    terrainMat.color.set(realm.groundPrimaryColor);
    waterMat.color.set(realm.waterColor);
    cloudMat.color.set(useAtmo ? atmo.cloudColor : realm.cloudColor);
    cloudMat.emissive.set(useAtmo ? atmo.skyHorizonColor : realm.skyHorizonColor);
    treeMat.color.set(realm.groundSecondaryColor);
    windTunnelGroup.visible = realm.weather === 'wind_updraft' || realm.id === 'home';
  };

  const updateDynamicHazards = (
    elapsed: number,
    realm: RealmConfig,
    krillAlertLevel: number,
    shardType: 'black' | 'red' | null
  ) => {
    // Animate Stage 3 Wind Tunnel Stream Rings & Village Bell
    if (windTunnelGroup.visible) {
      for (let i = 0; i < windRings.length; i++) {
        const ring = windRings[i];
        ring.rotation.z = elapsed * 1.2 + i * 0.45;
        const pulse = 1.0 + Math.sin(elapsed * 3.2 - i * 0.5) * 0.08;
        ring.scale.set(pulse, pulse, 1);
      }
      windRingMat.opacity = 0.46 + Math.sin(elapsed * 2.5) * 0.14;
    }
    const bellObj = prairieLandmarksGroup.getObjectByName('village_bell');
    if (bellObj) {
      bellObj.rotation.z = Math.sin(elapsed * 2.1) * 0.12;
    }

    // Stage 12 & 13: Animate Sanctuary Sky-Whale, Citadel Rings, Abyss Leviathan & Aurora Stage Ring
    const whaleObj = outerSanctuariesGroup.getObjectByName('sanctuary_whale');
    if (whaleObj) {
      whaleObj.position.y = 9.5 + Math.sin(elapsed * 1.1) * 3.8;
      whaleObj.rotation.x = Math.cos(elapsed * 1.1) * 0.45;
      whaleObj.rotation.y = elapsed * 0.25;
    }
    const cRing1 = outerSanctuariesGroup.getObjectByName('citadel_ring_1');
    const cRing2 = outerSanctuariesGroup.getObjectByName('citadel_ring_2');
    if (cRing1) cRing1.rotation.y = elapsed * 0.55;
    if (cRing2) cRing2.rotation.z = -elapsed * 0.42;
    const leviathanObj = outerSanctuariesGroup.getObjectByName('abyss_leviathan');
    if (leviathanObj) {
      leviathanObj.position.y = 6.2 + Math.sin(elapsed * 1.3) * 2.4;
      leviathanObj.rotation.y = -elapsed * 0.35;
    }
    const auroraRingObj = outerSanctuariesGroup.getObjectByName('aurora_stage_ring');
    if (auroraRingObj) {
      auroraRingObj.rotation.z = elapsed * 0.48;
    }
    const wpRingObj = outerSanctuariesGroup.getObjectByName('wind_paths_ring');
    if (wpRingObj) {
      wpRingObj.rotation.z = -elapsed * 0.85;
    }
    const windmillSails = outerSanctuariesGroup.getObjectByName('windmill_sails_se');
    if (windmillSails) {
      windmillSails.rotation.z = elapsed * 0.95;
    }
    const sundialHaloObj = outerSanctuariesGroup.getObjectByName('sundial_halo_south');
    if (sundialHaloObj) {
      sundialHaloObj.rotation.z = elapsed * 0.65;
    }
    const lighthouseBeamObj = outerSanctuariesGroup.getObjectByName('lighthouse_beam_ne');
    if (lighthouseBeamObj) {
      lighthouseBeamObj.rotation.y = elapsed * 0.75;
    }
    const aviaryHaloObj = outerSanctuariesGroup.getObjectByName('aviary_spell_halo');
    if (aviaryHaloObj) {
      aviaryHaloObj.rotation.z = elapsed * 1.1;
    }
    const finishRingObj = outerSanctuariesGroup.getObjectByName('sunset_race_finish_ring');
    if (finishRingObj) {
      finishRingObj.rotation.z = -elapsed * 0.85;
    }

    // Update Krill patrol in Wasteland & Eden
    const showKrill = realm.weather === 'krill_patrol' || realm.weather === 'eden_storm';
    krillGroup.visible = showKrill;
    if (showKrill) {
      const kState = getKrillStateAtTime(elapsed);
      krillGroup.position.set(kState.krillX, kState.krillY, kState.krillZ);
      krillGroup.rotation.y = kState.yaw;

      for (let seg = 1; seg <= 6; seg++) {
        const sObj = krillGroup.getObjectByName(`krill_seg_${seg}`);
        if (sObj) {
          sObj.position.x = Math.sin(elapsed * 4.5 - seg * 0.6) * 0.35;
          sObj.position.y = Math.cos(elapsed * 3.5 - seg * 0.5) * 0.22;
        }
      }

      const isAlert = krillAlertLevel > 0.05;
      krillEyeMat.color.setHex(isAlert ? 0xef4444 : 0x38bdf8);
      krillConeMat.color.setHex(isAlert ? 0xef4444 : 0x38bdf8);
      krillConeMat.opacity = isAlert ? 0.28 + Math.sin(elapsed * 18) * 0.1 : 0.16;
    }

    // Update Shard Eruption Crystal
    shardEventGroup.visible = shardType !== null;
    if (shardType) {
      shardCrystalMat.color.setHex(shardType === 'red' ? 0xe11d48 : 0x1e293b);
      shardCrystalMat.emissive.setHex(shardType === 'red' ? 0xf43f5e : 0x475569);
    }
  };

  const updateWaterRipples = (
    elapsed: number,
    playerX: number,
    playerZ: number,
    isWading: boolean
  ) => {
    for (let r = 0; r < rippleRings.length; r++) {
      const ring = rippleRings[r];
      if (!isWading) {
        ring.mat.opacity = 0;
        continue;
      }
      const phase = (elapsed * 1.4 + r / rippleRings.length) % 1.0;
      const scale = 0.7 + phase * 3.2;
      ring.mesh.position.set(playerX, 0.375, playerZ);
      ring.mesh.scale.set(scale, scale, 1);
      ring.mat.opacity = (1 - phase) * 0.75;
    }
  };

  return {
    root,
    terrainMat,
    waterMat,
    cloudInstanced,
    astrolabeRing1,
    astrolabeRing2,
    krillGroup,
    shardEventGroup,
    homeFurnitureGroup,
    windTunnelGroup,
    applyRealmTheme,
    updateDynamicHazards,
    rebuildHomeFurniture,
    updateWaterRipples,
  };
}
