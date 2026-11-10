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

export function buildSkyWorldEnvironment(
  renderer: THREE.WebGLRenderer,
  initialRealm: RealmConfig
): BuiltWorldRefs {
  const root = new THREE.Group();

  const stoneBump = createMicroReliefTexture(renderer, 'stone');
  stoneBump.repeat.set(16, 16);
  const runeTex = createMicroReliefTexture(renderer, 'gold_runes');

  // 1. Sculpted Meadow / Sanctuary Terrain Mesh (128x128 high-density grid to eliminate chordal foot sinking)
  const terrainGeo = new THREE.PlaneGeometry(180, 180, 128, 128);
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

  // 2. Reflective Mirror Sea surrounding the Islands
  const waterGeo = new THREE.PlaneGeometry(340, 340, 1, 1);
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
  vPlinth.position.y = 0.4;
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

  // 6. InstancedMesh Billowing Cloud Sea Perimeter (云海围合边界)
  const cloudCount = 96;
  const cloudGeo = new THREE.DodecahedronGeometry(4.8, 1);
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
    const ring = i < 64 ? 1 : 2;
    const angle = (i / (ring === 1 ? 64 : 32)) * Math.PI * 2 + ring * 0.4;
    const radius = ring === 1 ? 58 + (i % 5) * 3.5 : 34 + (i % 7) * 4.5;
    const cx = Math.cos(angle) * radius;
    const cz = Math.sin(angle) * radius - 8;
    const cy = ring === 1 ? 2.5 + (i % 4) * 2.2 : 14 + (i % 5) * 3.5;

    dummy.position.set(cx, cy, cz);
    const sx = 1.4 + (i % 3) * 0.45;
    const sy = 0.75 + (i % 2) * 0.25;
    const sz = 1.2 + ((i + 1) % 3) * 0.4;
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

  // 7. InstancedMesh Stylized Meadow Cypress Trees & Floating Spire Stones
  const treeCount = 28;
  const treeGeo = new THREE.ConeGeometry(1.35, 5.2, 7);
  treeGeo.translate(0, 2.6, 0);
  const treeMat = new THREE.MeshStandardMaterial({
    color: initialRealm.groundSecondaryColor,
    roughness: 0.75,
  });
  const treeInstanced = new THREE.InstancedMesh(treeGeo, treeMat, treeCount);
  for (let i = 0; i < treeCount; i++) {
    const angle = (i / treeCount) * Math.PI * 2 + 0.25;
    const r = 22 + (i % 4) * 7.5;
    const tx = Math.cos(angle) * r;
    const tz = Math.sin(angle) * r - 6;
    if (Math.abs(tx) < 7 && tz < 5 && tz > -55) {
      dummy.position.set(tx + (tx >= 0 ? 9 : -9), groundHeightAt(tx + (tx >= 0 ? 9 : -9), tz), tz);
    } else {
      dummy.position.set(tx, groundHeightAt(tx, tz), tz);
    }
    const scale = 0.85 + (i % 4) * 0.14;
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
