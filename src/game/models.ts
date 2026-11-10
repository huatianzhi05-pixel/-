import * as THREE from 'three';
import { EquippedLoadout, getCosmeticById } from './cosmetics';
import { JointPose, WingTrailConfig } from './characterAnimator';

// Procedural tileable micro-relief canvas texture for stone, fabric, and gold runes
export function createMicroReliefTexture(
  renderer: THREE.WebGLRenderer,
  type: 'stone' | 'fabric' | 'gold_runes'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  if (type === 'stone') {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      const x = (i * 73) % 256;
      const y = (i * 137) % 256;
      const shade = 105 + ((i * 29) % 45);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(x, y, 4, 4);
    }
    ctx.strokeStyle = '#606060';
    ctx.lineWidth = 2;
    for (let y = 0; y < 256; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
  } else if (type === 'fabric') {
    ctx.fillStyle = '#909090';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#a4a4a4';
    for (let y = 0; y < 256; y += 4) {
      ctx.fillRect(0, y, 256, 1);
    }
    for (let x = 0; x < 256; x += 4) {
      ctx.fillRect(x, 0, 1, 256);
    }
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(128, 128, 92, 0, Math.PI * 2);
    ctx.arc(128, 128, 54, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(128 + Math.cos(angle) * 54, 128 + Math.sin(angle) * 54);
      ctx.lineTo(128 + Math.cos(angle) * 110, 128 + Math.sin(angle) * 110);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  if (type === 'gold_runes') {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  return tex;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  grad.addColorStop(0, 'rgba(8, 12, 24, 0.58)');
  grad.addColorStop(0.55, 'rgba(8, 12, 24, 0.24)');
  grad.addColorStop(1, 'rgba(8, 12, 24, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Generate rich gradient + gold trim + glowing star pattern texture for Sky Capes
function createCapePatternTexture(
  primaryHex: string,
  secondaryHex: string,
  accentHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Smooth vertical fabric gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, primaryHex);
  grad.addColorStop(0.76, secondaryHex);
  grad.addColorStop(0.88, accentHex);
  grad.addColorStop(1.0, accentHex);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Crisp Sky geometric border line above the hem
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.45;
  ctx.fillRect(0, 212, 256, 4);
  ctx.globalAlpha = 1.0;

  // Decorative diamond motifs along the hem border
  ctx.fillStyle = primaryHex;
  for (let x = 16; x < 256; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 224);
    ctx.lineTo(x + 7, 234);
    ctx.lineTo(x, 244);
    ctx.lineTo(x - 7, 234);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Create subdivided Poncho / Mantle Cape Geometry with rest vertex buffer for real-time cloth & wing deformation
interface DynamicCapeData {
  mesh: THREE.Mesh;
  geometry: THREE.BufferGeometry;
  restPositions: Float32Array;
  uvs: Float32Array;
  radialSegs: number;
  heightSegs: number;
  ribbons: THREE.Mesh[];
}

function createDynamicSkyCape(
  styleVariant: string,
  primaryHex: string,
  secondaryHex: string,
  accentHex: string,
  emissiveHex: string | undefined,
  fabricTex: THREE.CanvasTexture
): DynamicCapeData {
  const radialSegs = 32;
  const heightSegs = 12;
  const vertexCount = (radialSegs + 1) * (heightSegs + 1);

  const positions = new Float32Array(vertexCount * 3);
  const restPositions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices: number[] = [];

  // Angle runs around the shoulders/back from front-left (+0.78 PI) through back (PI / -PI) to front-right (-0.78 PI)
  // Let's parameterize u in [0, 1] as angle theta in [-0.82 * PI, +0.82 * PI] where theta = 0 is directly behind (-Z)
  for (let iy = 0; iy <= heightSegs; iy++) {
    const v = iy / heightSegs; // 0 = neck collar, 1 = bottom hem
    for (let ix = 0; ix <= radialSegs; ix++) {
      const u = ix / radialSegs; // 0 = left front edge, 0.5 = center back, 1 = right front edge
      const theta = (u - 0.5) * Math.PI * 1.68; // 0 is center back (-Z), +-0.84*PI wraps to chest front

      // Shape hemline length based on cape styleVariant
      const absTheta = Math.abs(theta);
      let hemLengthMod = 1.0;

      if (styleVariant === 'swallowtail') {
        // Twin swallowtail peaks at back-left and back-right, shorter V-notch at center spine
        const twinPeak = Math.cos((absTheta - 0.42) * 3.8);
        hemLengthMod = 0.88 + Math.max(-0.12, twinPeak * 0.24);
      } else if (styleVariant === 'manta') {
        // Broad sweeping manta wings on sides + long pointed tail at center back
        const wingPeak = Math.exp(-Math.pow(absTheta - 1.15, 2) * 2.5) * 0.28;
        const tailPeak = Math.exp(-Math.pow(absTheta, 2) * 8.0) * 0.26;
        hemLengthMod = 0.85 + wingPeak + tailPeak;
      } else if (styleVariant === 'butterfly') {
        // Monarch double-lobed butterfly wings
        const upperLobe = Math.exp(-Math.pow(absTheta - 1.25, 2) * 3.5) * 0.34;
        const lowerLobe = Math.exp(-Math.pow(absTheta - 0.48, 2) * 4.5) * 0.28;
        hemLengthMod = 0.78 + upperLobe + lowerLobe;
      } else if (styleVariant === 'petal') {
        // Scalloped cherry blossom petals
        hemLengthMod = 0.92 + Math.abs(Math.cos(theta * 4.0)) * 0.14;
      } else if (styleVariant === 'jagged') {
        // Sharp dark dragon-wing scallops
        hemLengthMod = 0.9 + Math.sin(absTheta * 5.0) * 0.16;
      } else {
        // Classic / Royal bell curve (slightly longer at back, shorter toward front chest)
        hemLengthMod = 1.04 - (absTheta / (Math.PI * 0.84)) * 0.28;
      }

      const effectiveV = v * (0.2 + 0.8 * hemLengthMod);
      // Bell-shaped poncho profile: tight at neck collar (r=0.19), gracefully flaring over shoulders, arms, and back
      const neckRadius = 0.19;
      const shoulderCurve = Math.sin(Math.min(1, v * 1.45) * (Math.PI * 0.5));
      const radius = neckRadius + shoulderCurve * 0.34 + Math.pow(effectiveV, 1.2) * 0.38;

      // In local torso space, +Z is forward, -Z is back, +X is right, -X is left
      const x = Math.sin(theta) * radius;
      const z = -Math.cos(theta) * radius * (0.88 + 0.14 * Math.cos(theta));
      const y = -Math.pow(effectiveV, 1.06) * 0.78;

      const idx = iy * (radialSegs + 1) + ix;
      positions[idx * 3] = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = z;

      restPositions[idx * 3] = x;
      restPositions[idx * 3 + 1] = y;
      restPositions[idx * 3 + 2] = z;

      uvs[idx * 2] = u;
      uvs[idx * 2 + 1] = v;
    }
  }

  for (let iy = 0; iy < heightSegs; iy++) {
    for (let ix = 0; ix < radialSegs; ix++) {
      const a = iy * (radialSegs + 1) + ix;
      const b = a + 1;
      const c = (iy + 1) * (radialSegs + 1) + ix;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const patternTex = createCapePatternTexture(primaryHex, secondaryHex, accentHex);
  const isTranslucent = styleVariant === 'butterfly';

  const material = new THREE.MeshStandardMaterial({
    map: patternTex,
    bumpMap: fabricTex,
    bumpScale: 0.012,
    emissive: emissiveHex || accentHex,
    emissiveIntensity: isTranslucent ? 0.42 : 0.14,
    roughness: isTranslucent ? 0.22 : 0.55,
    metalness: isTranslucent ? 0.3 : 0.12,
    transparent: isTranslucent,
    opacity: isTranslucent ? 0.88 : 1.0,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;

  // Optional trailing streamer ribbons for Swallowtail / Manta capes
  const ribbons: THREE.Mesh[] = [];
  if (styleVariant === 'swallowtail' || styleVariant === 'manta') {
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: accentHex,
      emissive: emissiveHex || accentHex,
      emissiveIntensity: 0.45,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });
    [-0.24, 0.24].forEach((rx) => {
      const rGeo = new THREE.PlaneGeometry(0.08, 0.22, 1, 6);
      rGeo.translate(0, -0.11, 0);
      const rMesh = new THREE.Mesh(rGeo, ribbonMat);
      rMesh.position.set(rx, -0.68, -0.44);
      mesh.add(rMesh);
      ribbons.push(rMesh);
    });
  }

  return {
    mesh,
    geometry,
    restPositions,
    uvs,
    radialSegs,
    heightSegs,
    ribbons,
  };
}

export interface SkyChildRig {
  root: THREE.Group;
  bodyVisual: THREE.Group;
  hipsGroup: THREE.Group;
  torsoGroup: THREE.Group;
  neckGroup: THREE.Group;
  headGroup: THREE.Group;
  leftThigh: THREE.Group;
  leftShin: THREE.Group;
  leftFoot: THREE.Group;
  rightThigh: THREE.Group;
  rightShin: THREE.Group;
  rightFoot: THREE.Group;
  leftShoulder: THREE.Group;
  leftForearm: THREE.Group;
  rightShoulder: THREE.Group;
  rightForearm: THREE.Group;
  butterflyProp: THREE.Group;
  prayerMandala: THREE.Mesh;
  leftWingTipAnchor: THREE.Group;
  rightWingTipAnchor: THREE.Group;
  // Legacy compatibility handles
  leftLeg: THREE.Object3D;
  rightLeg: THREE.Object3D;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  leftWing: THREE.Group;
  rightWing: THREE.Group;
  capeCenter: THREE.Group;
  hairGroup: THREE.Group;
  hatGroup: THREE.Group;
  maskGroup: THREE.Group;
  faceAccessoryGroup: THREE.Group;
  neckAccessoryGroup: THREE.Group;
  pantsGroup: THREE.Group;
  propGroup: THREE.Group;
  callRingMesh: THREE.Mesh;
  flameOrb: THREE.Mesh;
  rebuildLoadout: (loadout: EquippedLoadout) => void;
  applyPose: (pose: JointPose, elapsed: number) => void;
  updateWingEnergyDisplay: (
    wingEnergy: number,
    maxWedges: number,
    tempLostWedges?: number
  ) => void;
  setSilhouetteMode: (isSilhouette: boolean, loadout?: EquippedLoadout) => void;
}

export function buildSkyChildRig(
  initialLoadout: EquippedLoadout,
  shadowTex: THREE.CanvasTexture,
  fabricTex: THREE.CanvasTexture
): SkyChildRig {
  const root = new THREE.Group();
  const bodyVisual = new THREE.Group();
  root.add(bodyVisual);

  // 1. Soft Radial Contact Shadow Disc flush on ground
  const shadowGeo = new THREE.CircleGeometry(0.95, 24);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.72,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = 0.02;
  root.add(shadowMesh);

  // 2. Acoustic Call / Honk Expanding Golden Resonance Ring
  const callGeo = new THREE.RingGeometry(0.6, 0.95, 36);
  callGeo.rotateX(-Math.PI / 2);
  const callMat = new THREE.MeshBasicMaterial({
    color: 0xfde047,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const callRingMesh = new THREE.Mesh(callGeo, callMat);
  callRingMesh.position.y = 1.1;
  root.add(callRingMesh);

  // 3. Rotating Golden Starlight Prayer Mandala (visible during emote_pray_star)
  const mandalaGeo = new THREE.RingGeometry(0.85, 1.15, 6);
  mandalaGeo.rotateX(-Math.PI / 2);
  const mandalaMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const prayerMandala = new THREE.Mesh(mandalaGeo, mandalaMat);
  prayerMandala.position.y = 0.05;
  root.add(prayerMandala);

  // Warm Obsidian Clay Skin Material (signature Sky Kid matte dark silhouette skin)
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x222736,
    roughness: 0.58,
    metalness: 0.08,
  });

  // ================= HIERARCHICAL SKELETON JOINTS =================
  const hipsGroup = new THREE.Group();
  hipsGroup.position.set(0, 0.86, 0);
  bodyVisual.add(hipsGroup);

  // --- Left Articulated Leg (Thigh -> Knee/Shin -> Ankle/Foot) ---
  const leftThigh = new THREE.Group();
  leftThigh.position.set(-0.13, 0, 0);
  const thighGeo = new THREE.CapsuleGeometry(0.068, 0.24, 8, 12);
  thighGeo.translate(0, -0.16, 0);
  const leftThighMesh = new THREE.Mesh(thighGeo, skinMat);
  leftThighMesh.castShadow = true;
  leftThigh.add(leftThighMesh);

  const leftShin = new THREE.Group();
  leftShin.position.set(0, -0.34, 0);
  const shinGeo = new THREE.CylinderGeometry(0.058, 0.036, 0.34, 12);
  shinGeo.translate(0, -0.17, 0);
  const leftShinMesh = new THREE.Mesh(shinGeo, skinMat);
  leftShinMesh.castShadow = true;
  leftShin.add(leftShinMesh);

  const leftFoot = new THREE.Group();
  leftFoot.position.set(0, -0.34, 0);
  const footGeo = new THREE.CapsuleGeometry(0.042, 0.11, 6, 10);
  footGeo.rotateX(Math.PI / 2);
  footGeo.translate(0, -0.02, 0.045);
  const leftFootMesh = new THREE.Mesh(footGeo, skinMat);
  leftFoot.add(leftFootMesh);

  leftShin.add(leftFoot);
  leftThigh.add(leftShin);
  hipsGroup.add(leftThigh);

  // --- Right Articulated Leg (Thigh -> Knee/Shin -> Ankle/Foot) ---
  const rightThigh = new THREE.Group();
  rightThigh.position.set(0.13, 0, 0);
  const rightThighMesh = new THREE.Mesh(thighGeo, skinMat);
  rightThighMesh.castShadow = true;
  rightThigh.add(rightThighMesh);

  const rightShin = new THREE.Group();
  rightShin.position.set(0, -0.34, 0);
  const rightShinMesh = new THREE.Mesh(shinGeo, skinMat);
  rightShinMesh.castShadow = true;
  rightShin.add(rightShinMesh);

  const rightFoot = new THREE.Group();
  rightFoot.position.set(0, -0.34, 0);
  const rightFootMesh = new THREE.Mesh(footGeo, skinMat);
  rightFoot.add(rightFootMesh);

  rightShin.add(rightFoot);
  rightThigh.add(rightShin);
  hipsGroup.add(rightThigh);

  // --- Spine & Torso Group ---
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.02, 0);
  hipsGroup.add(torsoGroup);

  const pantsGroup = new THREE.Group();
  torsoGroup.add(pantsGroup);

  // Glowing Heart Core on Chest
  const coreGeo = new THREE.OctahedronGeometry(0.095, 0);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xfef9c3,
    emissive: 0xf59e0b,
    emissiveIntensity: 2.2,
    roughness: 0.15,
  });
  const chestCore = new THREE.Mesh(coreGeo, coreMat);
  chestCore.position.set(0, 0.36, 0.19);
  torsoGroup.add(chestCore);

  // --- Left Articulated Arm (Shoulder -> UpperArm -> Elbow/Forearm -> Hand) ---
  const leftShoulder = new THREE.Group();
  leftShoulder.position.set(-0.22, 0.46, 0);
  const upperArmGeo = new THREE.CapsuleGeometry(0.048, 0.18, 6, 10);
  upperArmGeo.translate(0, -0.11, 0);
  const leftUpperArmMesh = new THREE.Mesh(upperArmGeo, skinMat);
  leftShoulder.add(leftUpperArmMesh);

  const leftForearm = new THREE.Group();
  leftForearm.position.set(0, -0.22, 0);
  const forearmGeo = new THREE.CapsuleGeometry(0.042, 0.18, 6, 10);
  forearmGeo.translate(0, -0.11, 0);
  const leftForearmMesh = new THREE.Mesh(forearmGeo, skinMat);
  leftForearm.add(leftForearmMesh);

  const handMittenGeo = new THREE.SphereGeometry(0.048, 10, 10);
  handMittenGeo.scale(0.85, 1.25, 0.75);
  const leftHandMesh = new THREE.Mesh(handMittenGeo, skinMat);
  leftHandMesh.position.set(0, -0.23, 0);
  leftForearm.add(leftHandMesh);

  leftShoulder.add(leftForearm);
  torsoGroup.add(leftShoulder);

  // --- Right Articulated Arm (Shoulder -> UpperArm -> Elbow/Forearm -> Hand + Butterfly/Candle) ---
  const rightShoulder = new THREE.Group();
  rightShoulder.position.set(0.22, 0.46, 0);
  const rightUpperArmMesh = new THREE.Mesh(upperArmGeo, skinMat);
  rightShoulder.add(rightUpperArmMesh);

  const rightForearm = new THREE.Group();
  rightForearm.position.set(0, -0.22, 0);
  const rightForearmMesh = new THREE.Mesh(forearmGeo, skinMat);
  rightForearm.add(rightForearmMesh);

  const rightHandMesh = new THREE.Mesh(handMittenGeo, skinMat);
  rightHandMesh.position.set(0, -0.23, 0);
  rightForearm.add(rightHandMesh);

  // Red Hand Candle + Glowing Flame attached to Right Hand (angled forward away from body/cape)
  const handCandleGroup = new THREE.Group();
  handCandleGroup.position.set(0.03, -0.25, 0.13);
  handCandleGroup.rotation.x = 0.42;
  const candleStick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.03, 0.15, 8),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
  );
  const flameOrb = new THREE.Mesh(
    new THREE.ConeGeometry(0.038, 0.11, 8),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  flameOrb.position.set(0, 0.12, 0);
  handCandleGroup.add(candleStick, flameOrb);
  rightForearm.add(handCandleGroup);

  // 3D Golden Butterfly Prop perched near Right Hand during emote_butterfly
  const butterflyProp = new THREE.Group();
  butterflyProp.position.set(0, -0.28, 0.14);
  butterflyProp.visible = false;
  const bWingMat = new THREE.MeshBasicMaterial({
    color: 0xfde047,
    side: THREE.DoubleSide,
  });
  const bWingL = new THREE.Mesh(new THREE.CircleGeometry(0.11, 6), bWingMat);
  bWingL.position.x = -0.06;
  bWingL.name = 'bwing_l';
  const bWingR = new THREE.Mesh(new THREE.CircleGeometry(0.11, 6), bWingMat);
  bWingR.position.x = 0.06;
  bWingR.name = 'bwing_r';
  butterflyProp.add(bWingL, bWingR);
  rightForearm.add(butterflyProp);

  rightShoulder.add(rightForearm);
  torsoGroup.add(rightShoulder);

  // --- Cape & Prop Mounts on Upper Spine ---
  const capeCenter = new THREE.Group();
  capeCenter.position.set(0, 0.54, 0);
  torsoGroup.add(capeCenter);

  // Wingtip 3D Anchors (track exact deformed left/right wingtip vertices on the poncho cape)
  const leftWingTipAnchor = new THREE.Group();
  const rightWingTipAnchor = new THREE.Group();
  const wingTipGlowGeo = new THREE.SphereGeometry(0.085, 10, 10);
  wingTipGlowGeo.scale(1.4, 0.65, 1.4);
  const wingTipGlowMat = new THREE.MeshBasicMaterial({
    color: 0xfffbeb,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const leftTipGlowMesh = new THREE.Mesh(wingTipGlowGeo, wingTipGlowMat);
  const rightTipGlowMesh = new THREE.Mesh(wingTipGlowGeo, wingTipGlowMat);
  leftWingTipAnchor.add(leftTipGlowMesh);
  rightWingTipAnchor.add(rightTipGlowMesh);

  const leftWing = new THREE.Group();
  const rightWing = new THREE.Group();
  torsoGroup.add(leftWing, rightWing);

  const propGroup = new THREE.Group();
  propGroup.position.set(0, 0.36, -0.26);
  torsoGroup.add(propGroup);

  // --- Neck & Sculpted Ovoid Head ---
  const neckGroup = new THREE.Group();
  neckGroup.position.set(0, 0.56, 0);
  const neckMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.08, 0.12, 10),
    skinMat
  );
  neckMesh.position.y = 0.04;
  neckGroup.add(neckMesh);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.24, 0);
  const headGeo = new THREE.SphereGeometry(0.24, 28, 22);
  headGeo.scale(0.96, 1.04, 0.98);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  const hairGroup = new THREE.Group();
  const hatGroup = new THREE.Group();
  const maskGroup = new THREE.Group();
  const faceAccessoryGroup = new THREE.Group();
  const neckAccessoryGroup = new THREE.Group();
  headGroup.add(hairGroup, hatGroup, maskGroup, faceAccessoryGroup);
  neckGroup.add(headGroup, neckAccessoryGroup);
  torsoGroup.add(neckGroup);

  let dynamicCape: DynamicCapeData | null = null;

  const clearGroup = (g: THREE.Group) => {
    while (g.children.length > 0) {
      g.remove(g.children[0]);
    }
  };

  // ================= REBUILD LOADOUT (8 MODULAR SLOTS) =================
  const rebuildLoadout = (loadout: EquippedLoadout) => {
    const capeItem = getCosmeticById(loadout.cape);
    const hairItem = getCosmeticById(loadout.hair);
    const hatItem = loadout.hat ? getCosmeticById(loadout.hat) : null;
    const maskItem = getCosmeticById(loadout.mask);
    const faceItem = loadout.faceAccessory
      ? getCosmeticById(loadout.faceAccessory)
      : null;
    const neckItem = loadout.neckAccessory
      ? getCosmeticById(loadout.neckAccessory)
      : null;
    const pantsItem = getCosmeticById(loadout.pants);
    const propItem = getCosmeticById(loadout.prop);

    const scaleMod = maskItem.scaleModifier ?? 1.0;
    bodyVisual.scale.set(scaleMod, scaleMod, scaleMod);

    // 1. Sculpted Lathe Tunic & Trousers (Pants)
    clearGroup(pantsGroup);
    const pantsPrimaryMat = new THREE.MeshStandardMaterial({
      color: pantsItem.primaryColor,
      roughness: 0.68,
      metalness: 0.12,
      bumpMap: fabricTex,
      bumpScale: 0.014,
      side: THREE.DoubleSide,
    });
    const pantsSecondaryMat = new THREE.MeshStandardMaterial({
      color: pantsItem.secondaryColor,
      roughness: 0.58,
      metalness: 0.15,
    });
    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: pantsItem.accentColor,
      emissive: pantsItem.accentColor,
      emissiveIntensity: 0.25,
      roughness: 0.28,
      metalness: 0.72,
    });

    // Sculpted flared tunic silhouette using LatheGeometry (kept above hip joint y=0.02 to prevent thigh clipping)
    const tunicProfile = [
      new THREE.Vector2(0.29, 0.01),
      new THREE.Vector2(0.24, 0.1),
      new THREE.Vector2(0.165, 0.22), // Cinched waist
      new THREE.Vector2(0.19, 0.38), // Chest
      new THREE.Vector2(0.14, 0.54), // Collar
    ];
    const tunicMesh = new THREE.Mesh(
      new THREE.LatheGeometry(tunicProfile, 24),
      pantsPrimaryMat
    );
    tunicMesh.castShadow = true;
    pantsGroup.add(tunicMesh);

    // Waist Obi / Gold Belt Sash + Ornamental Knot
    const beltSash = new THREE.Mesh(
      new THREE.CylinderGeometry(0.175, 0.195, 0.09, 20),
      goldAccentMat
    );
    beltSash.position.set(0, 0.19, 0);
    const beltKnot = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.055, 0),
      goldAccentMat
    );
    beltKnot.position.set(0, 0.19, 0.19);
    pantsGroup.add(beltSash, beltKnot);

    // Attach trouser cuffs directly onto leftThigh and rightThigh so legs move inside the pants!
    leftThigh.children.slice(1).forEach((c) => {
      if (c.name === 'pant_cuff') leftThigh.remove(c);
    });
    rightThigh.children.slice(1).forEach((c) => {
      if (c.name === 'pant_cuff') rightThigh.remove(c);
    });

    const isWideHakama = pantsItem.styleVariant === 'samurai';
    const pantCuffGeo = isWideHakama
      ? new THREE.ConeGeometry(0.125, 0.34, 14)
      : new THREE.CylinderGeometry(0.088, 0.072, 0.3, 14);
    pantCuffGeo.translate(0, -0.19, 0);

    const leftPantCuff = new THREE.Mesh(
      pantCuffGeo,
      isWideHakama ? pantsPrimaryMat : pantsSecondaryMat
    );
    leftPantCuff.name = 'pant_cuff';
    leftThigh.add(leftPantCuff);

    const rightPantCuff = new THREE.Mesh(
      pantCuffGeo,
      isWideHakama ? pantsPrimaryMat : pantsSecondaryMat
    );
    rightPantCuff.name = 'pant_cuff';
    rightThigh.add(rightPantCuff);

    // 2. Sculpted Flowing Poncho Cape + Collar Mantle + Spine Wing Stars
    clearGroup(capeCenter);
    dynamicCape = createDynamicSkyCape(
      capeItem.styleVariant,
      capeItem.primaryColor,
      capeItem.secondaryColor,
      capeItem.accentColor,
      capeItem.emissiveColor,
      fabricTex
    );
    capeCenter.add(dynamicCape.mesh);

    // Sculpted Shoulder Collar / Fur Mantle Ring
    const collarTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.052, 12, 24),
      new THREE.MeshStandardMaterial({
        color: capeItem.accentColor,
        emissive: capeItem.emissiveColor || capeItem.accentColor,
        emissiveIntensity: 0.3,
        roughness: 0.35,
        metalness: 0.5,
      })
    );
    collarTorus.rotation.x = Math.PI / 2 + 0.12;
    collarTorus.position.set(0, -0.01, 0.01);
    capeCenter.add(collarTorus);

    // 6 Glowing Wing Wedge Stars embedded along the back spine of the cape (individual materials for per-wedge energy & crack state)
    for (let s = 0; s < 6; s++) {
      const starMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
      const starDiamond = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.038, 0),
        starMat
      );
      starDiamond.scale.set(1.0, 1.3, 0.4);
      starDiamond.name = `cape_star_${s}`;
      capeCenter.add(starDiamond);
    }

    // Re-attach wingtip cloud emitter anchors so they stay synced in capeCenter space
    wingTipGlowMat.color.set(capeItem.emissiveColor || capeItem.accentColor || '#fffbeb');
    capeCenter.add(leftWingTipAnchor, rightWingTipAnchor);

    // 3. Sculpted Mask & Glowing Almond Starlight Eyes
    clearGroup(maskGroup);
    const maskMat = new THREE.MeshStandardMaterial({
      color: maskItem.primaryColor,
      roughness: 0.28,
      metalness: 0.42,
    });
    const maskGlowMat = new THREE.MeshStandardMaterial({
      color: maskItem.accentColor,
      emissive: maskItem.emissiveColor || maskItem.accentColor,
      emissiveIntensity: 1.8,
      roughness: 0.15,
    });

    // Contoured ovoid faceplate
    const facePlateGeo = new THREE.SphereGeometry(
      0.244,
      24,
      18,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.52
    );
    facePlateGeo.scale(0.95, 1.04, 0.98);
    const facePlate = new THREE.Mesh(facePlateGeo, maskMat);
    facePlate.rotation.x = Math.PI * 0.48;
    facePlate.position.set(0, -0.01, 0.02);
    maskGroup.add(facePlate);

    // Expressive Almond-Shaped Glowing Sky Eyes
    const eyeGeo = new THREE.SphereGeometry(0.034, 12, 10);
    eyeGeo.scale(1.35, 0.78, 0.5);
    const leftEye = new THREE.Mesh(eyeGeo, maskGlowMat);
    leftEye.position.set(-0.078, 0.01, 0.228);
    leftEye.rotation.z = -0.12;
    const rightEye = new THREE.Mesh(eyeGeo, maskGlowMat);
    rightEye.position.set(0.078, 0.01, 0.228);
    rightEye.rotation.z = 0.12;

    // Forehead Starlight Diamond Emblem
    const browDiamond = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.042, 0),
      maskGlowMat
    );
    browDiamond.scale.set(0.85, 1.35, 0.45);
    browDiamond.position.set(0, 0.11, 0.232);
    maskGroup.add(leftEye, rightEye, browDiamond);

    if (maskItem.styleVariant === 'anubis' || maskItem.styleVariant === 'fox') {
      // Sculpted Snout + Tall Pointed Jackal / Fox Ears
      const snout = new THREE.Mesh(
        new THREE.ConeGeometry(0.11, 0.22, 8).rotateX(Math.PI / 2),
        maskMat
      );
      snout.position.set(0, -0.04, 0.26);
      const earGeo = new THREE.ConeGeometry(0.068, 0.36, 8);
      const earL = new THREE.Mesh(earGeo, maskMat);
      earL.position.set(-0.14, 0.28, 0.06);
      earL.rotation.set(-0.1, 0, 0.16);
      const earR = new THREE.Mesh(earGeo, maskMat);
      earR.position.set(0.14, 0.28, 0.06);
      earR.rotation.set(-0.1, 0, -0.16);
      maskGroup.add(snout, earL, earR);

      if (maskItem.styleVariant === 'anubis') {
        const haloRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.21, 0.018, 10, 28),
          maskGlowMat
        );
        haloRing.position.set(0, 0.22, 0.06);
        maskGroup.add(haloRing);
      }
    } else if (maskItem.styleVariant === 'dragon_horn') {
      // Curved Sweeping Dragon Horns using CatmullRomCurve3 + TubeGeometry
      [-1, 1].forEach((dir) => {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(dir * 0.12, 0.16, 0.08),
          new THREE.Vector3(dir * 0.24, 0.28, -0.02),
          new THREE.Vector3(dir * 0.28, 0.44, -0.14),
          new THREE.Vector3(dir * 0.18, 0.56, -0.05),
        ]);
        const hornMesh = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 12, 0.036, 8, false),
          maskGlowMat
        );
        maskGroup.add(hornMesh);
      });
    } else if (maskItem.styleVariant === 'blush') {
      const blushMat = new THREE.MeshBasicMaterial({ color: 0xfb7185 });
      const blushL = new THREE.Mesh(new THREE.CircleGeometry(0.038, 12), blushMat);
      blushL.position.set(-0.12, -0.04, 0.215);
      blushL.rotation.y = -0.35;
      const blushR = new THREE.Mesh(new THREE.CircleGeometry(0.038, 12), blushMat);
      blushR.position.set(0.12, -0.04, 0.215);
      blushR.rotation.y = 0.35;
      maskGroup.add(blushL, blushR);
    }

    // 4. Sculpted Organic Hairstyles with Curved Locks & Bangs
    clearGroup(hairGroup);
    const hairMat = new THREE.MeshStandardMaterial({
      color: hairItem.primaryColor,
      roughness: 0.46,
      metalness: 0.08,
    });
    const hairAccentMat = new THREE.MeshStandardMaterial({
      color: hairItem.accentColor,
      emissive: hairItem.emissiveColor || hairItem.accentColor,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.65,
    });

    // Base sculpted hair dome + soft front bangs framing forehead
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.262, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.64),
      hairMat
    );
    hairCap.position.set(0, 0.03, -0.01);
    hairGroup.add(hairCap);

    // Sculpted front bangs Locks
    [-0.11, 0, 0.11].forEach((bx, idx) => {
      const bangLock = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.045, 0.12, 6, 10),
        hairMat
      );
      bangLock.position.set(bx, 0.15, 0.21 - Math.abs(bx) * 0.2);
      bangLock.rotation.set(0.35, 0, (idx - 1) * 0.22);
      hairGroup.add(bangLock);
    });

    if (hairItem.styleVariant === 'white_bird') {
      // Iconic Rhythm White Bird Twin Sweeping Wing Plumes + Crown Tuft
      [-1, 1].forEach((dir) => {
        const plumeCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(dir * 0.18, 0.12, 0.04),
          new THREE.Vector3(dir * 0.32, 0.24, -0.04),
          new THREE.Vector3(dir * 0.38, 0.42, -0.14),
        ]);
        const plume = new THREE.Mesh(
          new THREE.TubeGeometry(plumeCurve, 12, 0.062, 10, false),
          hairMat
        );
        const lowerPlume = new THREE.Mesh(
          new THREE.ConeGeometry(0.075, 0.28, 10),
          hairMat
        );
        lowerPlume.position.set(dir * 0.26, 0.16, -0.06);
        lowerPlume.rotation.set(-0.35, 0, -dir * 0.72);
        hairGroup.add(plume, lowerPlume);
      });
      const crownCrest = new THREE.Mesh(
        new THREE.ConeGeometry(0.075, 0.28, 10),
        hairMat
      );
      crownCrest.position.set(0, 0.34, -0.04);
      crownCrest.rotation.x = -0.32;
      hairGroup.add(crownCrest);
    } else if (hairItem.styleVariant === 'mushroom_bob') {
      // Smooth rounded Forest Elder Bob Bowl
      const bobBell = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.31, 0.26, 24, 1, true),
        hairMat
      );
      bobBell.position.y = 0.02;
      hairGroup.add(bobBell);
    } else if (hairItem.styleVariant === 'witch_hat') {
      const brim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.54, 0.58, 0.035, 24),
        hairMat
      );
      brim.position.y = 0.21;
      const hatCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.21, 0),
        new THREE.Vector3(0.02, 0.48, -0.04),
        new THREE.Vector3(0.14, 0.72, -0.16),
      ]);
      const hatCone = new THREE.Mesh(
        new THREE.TubeGeometry(hatCurve, 14, 0.16, 12, false),
        hairMat
      );
      const goldBand = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.028, 10, 24).rotateX(Math.PI / 2),
        hairAccentMat
      );
      goldBand.position.y = 0.24;
      hairGroup.add(brim, hatCone, goldBand);
    } else if (hairItem.styleVariant === 'bunny_ears') {
      [-1, 1].forEach((dir) => {
        const ear = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.058, 0.34, 8, 12),
          hairMat
        );
        ear.position.set(dir * 0.13, 0.42, -0.02);
        ear.rotation.set(-0.15, 0, -dir * 0.18);
        hairGroup.add(ear);
      });
    } else if (hairItem.styleVariant === 'halo_crown') {
      const sunHalo = new THREE.Mesh(
        new THREE.TorusGeometry(0.32, 0.026, 12, 32),
        hairAccentMat
      );
      sunHalo.position.set(0, 0.42, -0.04);
      const topBun = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 14, 12),
        hairMat
      );
      topBun.position.set(0, 0.3, -0.02);
      hairGroup.add(sunHalo, topBun);
    } else if (
      hairItem.styleVariant === 'princess_long' ||
      hairItem.styleVariant === 'dragon_braid'
    ) {
      // Multi-segment braided / flowing hair cascade curved outward behind the collar to avoid neck/cape clipping
      for (let b = 0; b < 4; b++) {
        const bead = new THREE.Mesh(
          new THREE.SphereGeometry(0.115 - b * 0.015, 12, 10),
          hairMat
        );
        bead.position.set(0, 0.05 - b * 0.14, -0.27 - b * 0.065);
        hairGroup.add(bead);
      }
      const crownTiara = new THREE.Mesh(
        new THREE.TorusGeometry(0.2, 0.024, 10, 24).rotateX(Math.PI / 2),
        hairAccentMat
      );
      crownTiara.position.y = 0.25;
      hairGroup.add(crownTiara);
    } else {
      // Spiky Ikemen / Moth Tuft locks
      for (let s = 0; s < 5; s++) {
        const angle = (s / 5) * Math.PI * 2;
        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(0.075, 0.26, 8),
          hairMat
        );
        spike.position.set(
          Math.sin(angle) * 0.16,
          0.26,
          Math.cos(angle) * 0.16 - 0.04
        );
        spike.rotation.set(-0.35, angle, 0);
        hairGroup.add(spike);
      }
    }

    // 5. Back Prop / Musical Instrument
    clearGroup(propGroup);
    const propPrimaryMat = new THREE.MeshStandardMaterial({
      color: propItem.primaryColor,
      roughness: 0.28,
      metalness: 0.65,
    });
    const propGlowMat = new THREE.MeshStandardMaterial({
      color: propItem.accentColor,
      emissive: propItem.emissiveColor || propItem.accentColor,
      emissiveIntensity: 0.95,
      roughness: 0.2,
    });

    if (propItem.styleVariant === 'piano' || propItem.styleVariant === 'kalimba') {
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.28, 0.07),
        propPrimaryMat
      );
      const keysBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.07, 0.09),
        propGlowMat
      );
      keysBar.position.y = -0.05;
      propGroup.add(frame, keysBar);
    } else if (propItem.styleVariant === 'harp') {
      const harpRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.2, 0.032, 10, 24),
        propPrimaryMat
      );
      const harpCore = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.075, 0),
        propGlowMat
      );
      propGroup.add(harpRing, harpCore);
    } else if (propItem.styleVariant === 'brazier') {
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.12, 0.2, 12),
        propPrimaryMat
      );
      const fire = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.26, 10),
        propGlowMat
      );
      fire.position.y = 0.16;
      propGroup.add(pot, fire);
    } else if (
      propItem.styleVariant === 'umbrella' ||
      propItem.styleVariant === 'staff'
    ) {
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.78, 10),
        propPrimaryMat
      );
      rod.rotation.z = 0.35;
      const tipOrb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.095, 0),
        propGlowMat
      );
      tipOrb.position.set(-0.14, 0.35, 0);
      propGroup.add(rod, tipOrb);
    } else {
      const plushBody = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 14, 12),
        propPrimaryMat
      );
      plushBody.scale.set(1.35, 0.68, 1.0);
      propGroup.add(plushBody);
    }

    // 6. Hat Slot (`hatGroup`)
    clearGroup(hatGroup);
    if (hatItem && hatItem.styleVariant !== 'none') {
      const hatMat = new THREE.MeshStandardMaterial({
        color: hatItem.primaryColor,
        roughness: 0.45,
        metalness: 0.25,
      });
      const hatAccentMat = new THREE.MeshStandardMaterial({
        color: hatItem.accentColor,
        emissive: hatItem.emissiveColor || hatItem.accentColor,
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: 0.75,
      });
      if (hatItem.styleVariant === 'crown') {
        const crownRing = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.13, 0.09, 6, 1, true),
          hatAccentMat
        );
        crownRing.position.set(0, 0.34, 0);
        hatGroup.add(crownRing);
      } else if (hatItem.styleVariant === 'sun_hat') {
        const brim = new THREE.Mesh(
          new THREE.CylinderGeometry(0.46, 0.48, 0.025, 24),
          hatMat
        );
        brim.position.set(0, 0.24, 0);
        const dome = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.25, 0.11, 20),
          hatMat
        );
        dome.position.set(0, 0.29, 0);
        const ribbon = new THREE.Mesh(
          new THREE.TorusGeometry(0.24, 0.02, 8, 20).rotateX(Math.PI / 2),
          hatAccentMat
        );
        ribbon.position.set(0, 0.26, 0);
        hatGroup.add(brim, dome, ribbon);
      } else if (hatItem.styleVariant === 'wizard_cone') {
        const brim = new THREE.Mesh(
          new THREE.CylinderGeometry(0.48, 0.52, 0.03, 24),
          hatMat
        );
        brim.position.set(0, 0.24, 0);
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(0.23, 0.46, 18),
          hatMat
        );
        cone.position.set(0, 0.46, -0.03);
        cone.rotation.x = -0.18;
        hatGroup.add(brim, cone);
      }
    }

    // 7. Face Accessory Slot (`faceAccessoryGroup`)
    clearGroup(faceAccessoryGroup);
    if (faceItem && faceItem.styleVariant !== 'none') {
      const faceAccMat = new THREE.MeshStandardMaterial({
        color: faceItem.primaryColor,
        emissive: faceItem.emissiveColor || faceItem.accentColor,
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: 0.65,
      });
      if (faceItem.styleVariant === 'earrings') {
        [-0.24, 0.24].forEach((ex) => {
          const drop = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.035, 0),
            faceAccMat
          );
          drop.position.set(ex, -0.05, 0.04);
          faceAccessoryGroup.add(drop);
        });
      } else if (faceItem.styleVariant === 'sunglasses') {
        [-0.085, 0.085].forEach((gx) => {
          const lens = new THREE.Mesh(
            new THREE.CylinderGeometry(0.062, 0.062, 0.02, 14).rotateX(Math.PI / 2),
            faceAccMat
          );
          lens.position.set(gx, 0.04, 0.245);
          faceAccessoryGroup.add(lens);
        });
      } else if (faceItem.styleVariant === 'forehead_gem') {
        const gem = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.038, 0),
          faceAccMat
        );
        gem.position.set(0, 0.12, 0.245);
        faceAccessoryGroup.add(gem);
      }
    }

    // 8. Neck Accessory Slot (`neckAccessoryGroup`)
    clearGroup(neckAccessoryGroup);
    if (neckItem && neckItem.styleVariant !== 'none') {
      const neckMat = new THREE.MeshStandardMaterial({
        color: neckItem.primaryColor,
        emissive: neckItem.emissiveColor || neckItem.accentColor,
        emissiveIntensity: 0.35,
        roughness: 0.4,
        metalness: 0.4,
      });
      if (neckItem.styleVariant === 'bell_choker') {
        const bell = new THREE.Mesh(
          new THREE.SphereGeometry(0.048, 12, 12),
          neckMat
        );
        bell.position.set(0, 0.01, 0.19);
        neckAccessoryGroup.add(bell);
      } else if (neckItem.styleVariant === 'scarf') {
        const scarfRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.155, 0.045, 10, 20).rotateX(Math.PI / 2),
          neckMat
        );
        scarfRing.position.set(0, 0.03, 0.01);
        const scarfTail = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.28, 0.025),
          neckMat
        );
        scarfTail.position.set(0.09, -0.1, 0.19);
        scarfTail.rotation.z = 0.15;
        neckAccessoryGroup.add(scarfRing, scarfTail);
      } else if (neckItem.styleVariant === 'pendant') {
        const crystal = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.045, 0),
          neckMat
        );
        crystal.position.set(0, -0.02, 0.195);
        neckAccessoryGroup.add(crystal);
      }
    }
  };

  // ================= REAL-TIME SKELETAL POSE & ANTI-CLIPPING CLOTH DEFORMATION =================
  const applyPose = (pose: JointPose, elapsed: number) => {
    // 1. Automatic Foot-to-Ground Anti-Sinking Clamp: ensure lowest foot sole never dips below y = 0.02
    const lThighWorldAngle = pose.hipsPitch + pose.leftThighPitch;
    const lShinWorldAngle = lThighWorldAngle + pose.leftKneePitch;
    const rThighWorldAngle = pose.hipsPitch + pose.rightThighPitch;
    const rShinWorldAngle = rThighWorldAngle + pose.rightKneePitch;

    const leftFootRelY = -0.34 * Math.cos(lThighWorldAngle) - 0.34 * Math.cos(lShinWorldAngle) - 0.065;
    const rightFootRelY = -0.34 * Math.cos(rThighWorldAngle) - 0.34 * Math.cos(rShinWorldAngle) - 0.065;
    const minFootRelY = Math.min(leftFootRelY, rightFootRelY);
    const safeHipsY = Math.max(pose.hipsY, 0.02 - minFootRelY);

    hipsGroup.position.y = safeHipsY;
    hipsGroup.rotation.set(pose.hipsPitch, pose.hipsYawOffset, pose.hipsRoll);

    torsoGroup.rotation.set(pose.spinePitch, pose.spineYaw, pose.spineRoll);
    headGroup.rotation.set(pose.headPitch, pose.headYaw, pose.headRoll);

    // Legs (Thigh -> Shin/Knee -> Ankle/Foot)
    leftThigh.rotation.set(pose.leftThighPitch, 0, pose.leftThighRoll);
    leftShin.rotation.x = pose.leftKneePitch;
    leftFoot.rotation.x = pose.leftAnklePitch;

    rightThigh.rotation.set(pose.rightThighPitch, 0, pose.rightThighRoll);
    rightShin.rotation.x = pose.rightKneePitch;
    rightFoot.rotation.x = pose.rightAnklePitch;

    // Arms (Shoulder -> Forearm/Elbow)
    leftShoulder.rotation.set(pose.leftShoulderPitch, 0, pose.leftShoulderRoll);
    leftForearm.rotation.x = pose.leftElbowPitch;

    rightShoulder.rotation.set(pose.rightShoulderPitch, 0, pose.rightShoulderRoll);
    rightForearm.rotation.x = pose.rightElbowPitch;

    // Hide hand candle during high-motion flight/acrobatics/butterfly emote to prevent self-clipping
    handCandleGroup.visible =
      !pose.showButterflyProp &&
      pose.wingFlare < 0.45 &&
      Math.abs(pose.hipsPitch) < 0.8 &&
      pose.capeSpinFlare < 0.2;

    // Butterfly prop animation when emote_butterfly is active
    butterflyProp.visible = pose.showButterflyProp;
    if (pose.showButterflyProp) {
      const bwL = butterflyProp.getObjectByName('bwing_l');
      const bwR = butterflyProp.getObjectByName('bwing_r');
      const flap = Math.sin(elapsed * 18.0) * 0.65;
      if (bwL) bwL.rotation.y = flap;
      if (bwR) bwR.rotation.y = -flap;
    }

    // Compute leg backward swing & arm lift envelope so the poncho cape never clips with limbs!
    const leftBackReach = Math.max(
      0,
      Math.sin(pose.leftThighPitch) * 0.34 +
        Math.sin(pose.leftThighPitch + pose.leftKneePitch) * 0.34
    );
    const rightBackReach = Math.max(
      0,
      Math.sin(pose.rightThighPitch) * 0.34 +
        Math.sin(pose.rightThighPitch + pose.rightKneePitch) * 0.34
    );
    const maxBackLegSwing = Math.max(leftBackReach, rightBackReach);
    const leftArmRaise = Math.min(
      0.55,
      Math.abs(pose.leftShoulderPitch) * 0.25 + Math.abs(pose.leftShoulderRoll) * 0.32
    );
    const rightArmRaise = Math.min(
      0.55,
      Math.abs(pose.rightShoulderPitch) * 0.25 + Math.abs(pose.rightShoulderRoll) * 0.32
    );

    // Dynamic Flowing Poncho Cape Vertex Wave, Wing Unfurling & Body-Capsule Pushout
    if (dynamicCape) {
      const posAttr = dynamicCape.geometry.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const restArr = dynamicCape.restPositions;
      const uvArr = dynamicCape.uvs;
      const count = posAttr.count;

      for (let i = 0; i < count; i++) {
        const rx = restArr[i * 3];
        const ry = restArr[i * 3 + 1];
        const rz = restArr[i * 3 + 2];
        const u = uvArr[i * 2]; // 0..1 around shoulders (0.5 is center back)
        const v = uvArr[i * 2 + 1]; // 0..1 from collar to hem

        // Pin collar vertices at v == 0 tightly to shoulders
        if (v < 0.04) {
          posArr[i * 3] = rx;
          posArr[i * 3 + 1] = ry;
          posArr[i * 3 + 2] = rz;
          continue;
        }

        // How far this vertex is on the left/right wing flanks vs center back
        const sideFactor = Math.sin(Math.abs(u - 0.5) * Math.PI); // 0 at center back, 1 on left/right wings
        const backCenterFactor = Math.max(0, 1 - Math.abs(u - 0.5) * 2.4);
        const signX = rx >= 0 ? 1 : -1;
        const armRaise = rx < 0 ? leftArmRaise : rightArmRaise;

        // 1. Wing Flare + Automatic Arm-Drape Pushout (drapes over swinging/raised arms)
        const wingOutX =
          signX * sideFactor * v * (pose.wingFlare * 0.72 + armRaise * 0.48);
        const wingLiftY =
          sideFactor * v * (pose.wingFlare * 0.42 + armRaise * 0.52);

        // 2. Wing Flap Stroke with realistic secondary tip phase lag
        const tipLag = Math.sin(elapsed * 14.0 - v * 2.2) * 0.08 * pose.wingFlare;
        const strokeY = sideFactor * Math.pow(v, 1.15) * (pose.wingStroke * 0.48 + tipLag);

        // 3. Cloth Wind Billow + Leg Swing Envelope Clearance
        const wave1 = Math.sin(elapsed * 5.2 - v * 4.5 + u * 6.28) * 0.042 * v;
        const wave2 = Math.cos(elapsed * 7.8 - v * 6.0 - u * 9.42) * 0.026 * v * (1 + pose.capeBillow);
        const legClearanceZ = maxBackLegSwing * Math.pow(v, 1.05) * backCenterFactor * 1.15;
        const backwardBillowZ =
          -Math.pow(v, 1.25) *
            (0.28 * pose.capeBillow + 0.35 * pose.capeSpinFlare) -
          legClearanceZ;
        const radialSpinFlare = pose.capeSpinFlare * v * 0.42;

        let px = rx * (1 + radialSpinFlare) + wingOutX + wave1 * 0.35;
        let py =
          ry +
          wingLiftY +
          strokeY +
          Math.abs(wave1) * 0.25 +
          pose.capeBillow * v * 0.18 +
          legClearanceZ * 0.25;
        let pz = rz * (1 + radialSpinFlare) + backwardBillowZ + wave1 + wave2;

        // 4. Hard Body-Capsule & Tunic/Shin Anti-Clipping Pushout
        const minSafeRadius =
          0.22 + v * (0.26 + maxBackLegSwing * 0.75 * backCenterFactor);
        const horizDist = Math.hypot(px, pz);
        if (horizDist < minSafeRadius && horizDist > 0.0001) {
          const pushScale = minSafeRadius / horizDist;
          px *= pushScale;
          pz *= pushScale;
        }
        // Prevent back hem from ever swinging forward into the knees/shins
        if (backCenterFactor > 0.2) {
          const maxAllowedBackZ = -0.21 - v * (0.22 + maxBackLegSwing * 0.85);
          if (pz > maxAllowedBackZ) {
            pz = maxAllowedBackZ;
          }
        }

        posArr[i * 3] = px;
        posArr[i * 3 + 1] = py;
        posArr[i * 3 + 2] = pz;
      }

      posAttr.needsUpdate = true;
      dynamicCape.geometry.computeVertexNormals();

      // Update the 6 glowing Wing Wedge stars so they ride flush on the outer center-back spine of the cape!
      const midCol = Math.floor(dynamicCape.radialSegs / 2);
      for (let s = 0; s < 6; s++) {
        const starObj = capeCenter.getObjectByName(`cape_star_${s}`);
        if (starObj) {
          const row = Math.min(dynamicCape.heightSegs, 2 + s * 2);
          const vIdx = row * (dynamicCape.radialSegs + 1) + midCol;
          starObj.position.set(
            posArr[vIdx * 3],
            posArr[vIdx * 3 + 1],
            posArr[vIdx * 3 + 2] - 0.028
          );
        }
      }

      // Dynamically mount Back Prop / Musical Instrument (`propGroup`) outside the deformed cape surface so it NEVER clips into the cape!
      const propRow = Math.min(dynamicCape.heightSegs, 4);
      const propVIdx = propRow * (dynamicCape.radialSegs + 1) + midCol;
      const upperVIdx = 2 * (dynamicCape.radialSegs + 1) + midCol;
      const lowerVIdx = 6 * (dynamicCape.radialSegs + 1) + midCol;
      const dyCape = posArr[lowerVIdx * 3 + 1] - posArr[upperVIdx * 3 + 1];
      const dzCape = posArr[lowerVIdx * 3 + 2] - posArr[upperVIdx * 3 + 2];
      const capeSlopeAngle = Math.atan2(dzCape, -dyCape);

      propGroup.position.set(
        posArr[propVIdx * 3],
        0.54 + posArr[propVIdx * 3 + 1] + 0.04,
        posArr[propVIdx * 3 + 2] - 0.095
      );
      propGroup.rotation.set(capeSlopeAngle, 0, 0);

      // Update exact 3D Wingtip Anchors at the outer left & right cape wing hem vertices
      const tipRow = dynamicCape.heightSegs;
      const leftCol = Math.round(dynamicCape.radialSegs * 0.16);
      const rightCol = Math.round(dynamicCape.radialSegs * 0.84);
      const leftVIdx = tipRow * (dynamicCape.radialSegs + 1) + leftCol;
      const rightVIdx = tipRow * (dynamicCape.radialSegs + 1) + rightCol;

      leftWingTipAnchor.position.set(
        posArr[leftVIdx * 3],
        posArr[leftVIdx * 3 + 1],
        posArr[leftVIdx * 3 + 2]
      );
      rightWingTipAnchor.position.set(
        posArr[rightVIdx * 3],
        posArr[rightVIdx * 3 + 1],
        posArr[rightVIdx * 3 + 2]
      );

      // Illuminate wingtip cloud aura when wings flare open during flight / gliding
      const tipAuraAlpha = Math.max(0, (pose.wingFlare - 0.28) * 0.85);
      wingTipGlowMat.opacity = tipAuraAlpha;
      const tipPulse = 0.85 + Math.sin(elapsed * 10.0) * 0.2 + pose.wingFlare * 0.5;
      leftTipGlowMesh.scale.setScalar(tipPulse);
      rightTipGlowMesh.scale.setScalar(tipPulse);

      // Undulate trailing Swallowtail / Manta ribbons outside the cape hem
      const rSegs = dynamicCape.radialSegs;
      dynamicCape.ribbons.forEach((rMesh, idx) => {
        const ribCol =
          idx === 0
            ? Math.round(rSegs * 0.36)
            : Math.round(rSegs * 0.64);
        const ribVIdx = tipRow * (rSegs + 1) + ribCol;
        rMesh.position.set(
          posArr[ribVIdx * 3],
          Math.max(-0.62, posArr[ribVIdx * 3 + 1] + 0.06),
          posArr[ribVIdx * 3 + 2] - 0.03
        );
        rMesh.rotation.x = 0.48 + pose.capeBillow * 0.65 + Math.sin(elapsed * 6.5 + idx) * 0.16;
        rMesh.rotation.z = (idx === 0 ? -1 : 1) * (0.18 + pose.wingFlare * 0.35);
      });
    }
  };

  const updateWingEnergyDisplay = (
    wingEnergy: number,
    maxWedges: number,
    tempLostWedges = 0
  ) => {
    const safeMax = Math.max(1, maxWedges);
    const ratio = Math.max(0, Math.min(1, wingEnergy / safeMax));
    const lostRatio = Math.max(0, Math.min(1, tempLostWedges / safeMax));
    const litCount = ratio * 6;
    const activeSlots = Math.round((1 - lostRatio) * 6);

    // 1. Modulate Cape Fabric Emissive Radiance & Chest Heart Core with current Wing Energy
    if (dynamicCape) {
      const capeMat = dynamicCape.mesh.material as THREE.MeshStandardMaterial;
      capeMat.emissiveIntensity = 0.03 + ratio * 0.42;
    }
    coreMat.emissiveIntensity = 0.45 + ratio * 2.05;

    // 2. Modulate the 6 Spine Energy Wedge Stars (Gold Lit -> Dim Drained -> Crimson Cracked)
    for (let s = 0; s < 6; s++) {
      const starObj = capeCenter.getObjectByName(`cape_star_${s}`) as THREE.Mesh | undefined;
      if (starObj) {
        starObj.visible = true;
        const sMat = starObj.material as THREE.MeshBasicMaterial;
        if (s >= activeSlots) {
          // Temporarily lost / cracked wedge
          sMat.color.setHex(0xf43f5e);
          starObj.scale.set(0.75, 0.95, 0.35);
        } else if (s + 0.35 <= litCount) {
          // Fully or mostly charged wedge
          sMat.color.setHex(0xfef08a);
          starObj.scale.set(1.08, 1.38, 0.44);
        } else {
          // Drained wedge waiting for recharge
          sMat.color.setHex(0x475569);
          starObj.scale.set(0.55, 0.72, 0.28);
        }
      }
    }
  };

  let currentSilhouetteState = false;
  let cachedLoadout: EquippedLoadout = initialLoadout;
  const silhouetteOutfitMat = new THREE.MeshStandardMaterial({
    color: 0x263147,
    emissive: 0x0f172a,
    emissiveIntensity: 0.15,
    roughness: 0.72,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });

  const setSilhouetteMode = (isSilhouette: boolean, loadoutOverride?: EquippedLoadout) => {
    if (loadoutOverride) {
      cachedLoadout = loadoutOverride;
    }
    if (isSilhouette === currentSilhouetteState) return;
    currentSilhouetteState = isSilhouette;

    if (isSilhouette) {
      const overrideMatGroups = [
        hairGroup,
        hatGroup,
        maskGroup,
        faceAccessoryGroup,
        neckAccessoryGroup,
        pantsGroup,
        propGroup,
      ];
      for (const grp of overrideMatGroups) {
        grp.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            (obj as THREE.Mesh).material = silhouetteOutfitMat;
          }
        });
      }
      if (dynamicCape) {
        dynamicCape.mesh.material = silhouetteOutfitMat;
      }
    } else {
      rebuildLoadout(cachedLoadout);
    }
  };

  rebuildLoadout(initialLoadout);

  return {
    root,
    bodyVisual,
    hipsGroup,
    torsoGroup,
    neckGroup,
    headGroup,
    leftThigh,
    leftShin,
    leftFoot,
    rightThigh,
    rightShin,
    rightFoot,
    leftShoulder,
    leftForearm,
    rightShoulder,
    rightForearm,
    butterflyProp,
    prayerMandala,
    leftWingTipAnchor,
    rightWingTipAnchor,
    leftLeg: leftThigh,
    rightLeg: rightThigh,
    leftArm: leftShoulder,
    rightArm: rightShoulder,
    leftWing,
    rightWing,
    capeCenter,
    hairGroup,
    hatGroup,
    maskGroup,
    faceAccessoryGroup,
    neckAccessoryGroup,
    pantsGroup,
    propGroup,
    callRingMesh,
    flameOrb,
    rebuildLoadout: (l: EquippedLoadout) => {
      cachedLoadout = l;
      currentSilhouetteState = false;
      rebuildLoadout(l);
    },
    applyPose,
    updateWingEnergyDisplay,
    setSilhouetteMode,
  };
}

// Build composite 3-12 part Red Candle Cluster
export function buildCandleClusterMesh(shadowTex: THREE.CanvasTexture): THREE.Group {
  const group = new THREE.Group();

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.35, 20).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.65 })
  );
  shadow.position.y = 0.02;
  group.add(shadow);

  const baseStone = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.25, 0.24, 14),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85, metalness: 0.1 })
  );
  baseStone.position.y = 0.12;
  group.add(baseStone);

  const waxMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    emissive: 0x991b1b,
    emissiveIntensity: 0.35,
    roughness: 0.42,
  });

  const flameMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const candlePositions = [
    { x: 0, z: 0, h: 1.15, r: 0.22 },
    { x: -0.42, z: 0.28, h: 0.82, r: 0.16 },
    { x: 0.44, z: 0.22, h: 0.92, r: 0.17 },
    { x: -0.28, z: -0.42, h: 0.68, r: 0.15 },
    { x: 0.34, z: -0.36, h: 0.76, r: 0.15 },
  ];

  candlePositions.forEach((c) => {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(c.r * 0.9, c.r, c.h, 12), waxMat);
    body.position.set(c.x, 0.24 + c.h / 2, c.z);
    body.castShadow = true;
    group.add(body);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(c.r * 0.55, 0.34, 8), flameMat);
    flame.position.set(c.x, 0.24 + c.h + 0.18, c.z);
    flame.name = 'candle_flame';
    group.add(flame);
  });

  return group;
}

// Build Sculpted Glowing Winged Light Child (光之翼·小金人)
export function buildWingedLightMesh(shadowTex: THREE.CanvasTexture): THREE.Group {
  const group = new THREE.Group();

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.1, 20).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.6 })
  );
  shadow.position.y = 0.02;
  group.add(shadow);

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 2.0,
    roughness: 0.18,
    metalness: 0.35,
  });

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.045, 8, 28).rotateX(Math.PI / 2),
    goldMat
  );
  ring.position.y = 0.08;
  group.add(ring);

  // Sculpted glowing child with Lathe tunic, ovoid head, white-bird hair plumes, and flared cape
  const tunicProfile = [
    new THREE.Vector2(0.32, 0.42),
    new THREE.Vector2(0.18, 0.95),
    new THREE.Vector2(0.14, 1.32),
  ];
  const torso = new THREE.Mesh(new THREE.LatheGeometry(tunicProfile, 18), goldMat);
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.35, 6, 8), goldMat);
  legL.position.set(-0.1, 0.25, 0);
  const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.35, 6, 8), goldMat);
  legR.position.set(0.1, 0.25, 0);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 14), goldMat);
  head.position.y = 1.54;

  const capeCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.65, 0.95, 16, 1, true, Math.PI * 0.25, Math.PI * 1.5),
    goldMat
  );
  capeCone.position.set(0, 0.98, -0.08);

  const beaconBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.42, 9.0, 12, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  beaconBeam.position.y = 4.5;

  group.add(torso, legL, legR, head, capeCone, beaconBeam);
  return group;
}

// Build Sculpted Ancestor Spirit Statue (先祖灵魂共鸣石像)
export function buildAncestorSpiritMesh(shadowTex: THREE.CanvasTexture): THREE.Group {
  const group = new THREE.Group();

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.3, 20).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.7 })
  );
  shadow.position.y = 0.02;
  group.add(shadow);

  const spiritMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.15,
    roughness: 0.28,
    metalness: 0.2,
    transparent: true,
    opacity: 0.88,
  });

  const stonePlinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.95, 0.35, 12),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
  );
  stonePlinth.position.y = 0.175;

  const robeProfile = [
    new THREE.Vector2(0.48, 0.35),
    new THREE.Vector2(0.32, 1.15),
    new THREE.Vector2(0.38, 1.78),
    new THREE.Vector2(0.18, 1.98),
  ];
  const robe = new THREE.Mesh(new THREE.LatheGeometry(robeProfile, 20), spiritMat);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 14), spiritMat);
  head.position.y = 2.22;
  const maskHorn = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.45, 8), spiritMat);
  maskHorn.position.set(0, 2.55, 0.08);
  maskHorn.rotation.x = 0.25;

  const soulCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.18, 0),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  soulCore.position.set(0, 1.62, 0.42);
  soulCore.name = 'spirit_core';

  group.add(stonePlinth, robe, head, maskHorn, soulCore);
  return group;
}

// Build Stage 3 Bioluminescent Glowing Plant (云野发光植物 · 星瓣花与荧光星冠菇)
export function buildLightBloomMesh(shadowTex: THREE.CanvasTexture): THREE.Group {
  const group = new THREE.Group();

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.35, 20).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.68,
    })
  );
  shadow.position.y = 0.02;
  group.add(shadow);

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.45,
    roughness: 0.5,
  });
  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.35,
    roughness: 0.22,
    metalness: 0.15,
    side: THREE.DoubleSide,
  });
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });

  // Central sculpted stem + 2 side stems
  const mainStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.18, 1.05, 10),
    stemMat
  );
  mainStem.position.y = 0.52;
  group.add(mainStem);

  // 6 Sculpted Glowing Lotus Petals radiating around the crown
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const petal = new THREE.Mesh(
      new THREE.ConeGeometry(0.36, 0.85, 8).rotateX(Math.PI * 0.36),
      petalMat
    );
    petal.position.set(
      Math.cos(angle) * 0.38,
      1.05,
      Math.sin(angle) * 0.38
    );
    petal.rotation.y = -angle + Math.PI / 2;
    group.add(petal);
  }

  // Side bioluminescent mushroom caps
  [-0.55, 0.58].forEach((ox, idx) => {
    const oz = idx === 0 ? 0.32 : -0.28;
    const h = idx === 0 ? 0.62 : 0.74;
    const miniStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.1, h, 8),
      stemMat
    );
    miniStem.position.set(ox, h / 2, oz);
    const miniCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.58),
      petalMat
    );
    miniCap.position.set(ox, h - 0.05, oz);
    group.add(miniStem, miniCap);
  });

  // Floating Golden Pollen Core & Orbiting Butterflies (animated via 'spirit_core')
  const pollenCore = new THREE.Group();
  pollenCore.position.set(0, 1.55, 0);
  pollenCore.name = 'spirit_core';

  const centerGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), coreMat);
  pollenCore.add(centerGem);

  const bWingMat = new THREE.MeshBasicMaterial({
    color: 0xfde047,
    side: THREE.DoubleSide,
  });
  [-0.48, 0.48].forEach((bx, bIdx) => {
    const bfy = new THREE.Mesh(new THREE.CircleGeometry(0.12, 6), bWingMat);
    bfy.position.set(bx, 0.18 + bIdx * 0.12, (bIdx === 0 ? 1 : -1) * 0.25);
    bfy.rotation.x = 0.6;
    pollenCore.add(bfy);
  });

  group.add(pollenCore);
  return group;
}

// Build composite Soaring Light Manta (圣岛发光遥鲲)
export function buildLightMantaMesh(): THREE.Group {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xfffbeb,
    emissive: 0xfde68a,
    emissiveIntensity: 0.65,
    roughness: 0.25,
    side: THREE.DoubleSide,
  });
  const goldTrimMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

  const hull = new THREE.Mesh(
    new THREE.ConeGeometry(0.72, 2.8, 12).rotateX(Math.PI / 2),
    bodyMat
  );

  // Curved sweeping Manta wings instead of rectangular boxes
  const wingCurveL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.2, 0, 0.4),
    new THREE.Vector3(-1.5, 0.15, 0.1),
    new THREE.Vector3(-3.1, -0.1, -0.6),
  ]);
  const leftWing = new THREE.Mesh(
    new THREE.TubeGeometry(wingCurveL, 12, 0.35, 8, false),
    bodyMat
  );
  leftWing.scale.set(1, 0.22, 1.8);
  leftWing.name = 'manta_wing_l';

  const wingCurveR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.2, 0, 0.4),
    new THREE.Vector3(1.5, 0.15, 0.1),
    new THREE.Vector3(3.1, -0.1, -0.6),
  ]);
  const rightWing = new THREE.Mesh(
    new THREE.TubeGeometry(wingCurveR, 12, 0.35, 8, false),
    bodyMat
  );
  rightWing.scale.set(1, 0.22, 1.8);
  rightWing.name = 'manta_wing_r';

  const tailRibbon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.01, 4.2, 8).rotateX(Math.PI / 2),
    goldTrimMat
  );
  tailRibbon.position.set(0, 0, -3.1);

  group.add(hull, leftWing, rightWing, tailRibbon);
  return group;
}

// ============================================================================
// ETHEREAL WINGTIP CLOUD-MIST & GOSSAMER CONTRAIL SYSTEM (仙气云雾拖尾系统)
// ============================================================================
interface CloudMistPuff {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  baseScale: number;
  phase: number;
  spinSpeed: number;
}

export interface WingCloudTrailSystem {
  update: (
    dt: number,
    elapsed: number,
    rig: SkyChildRig,
    trailCfg: WingTrailConfig,
    playerVx: number,
    playerVy: number,
    playerVz: number
  ) => void;
  burstWingTipClouds: (rig: SkyChildRig, countPerWing?: number) => void;
  setAccentColor: (hexColor: string) => void;
  resetRibbonHistory: (rig: SkyChildRig) => void;
}

function createCloudRibbonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Horizontal gradient along trail length (u: 0 = wingtip head, 1 = dissolving tail)
  // combined with soft vertical cloud feathering (v: 0 = top edge, 0.5 = core, 1 = bottom edge)
  const imgData = ctx.createImageData(256, 64);
  const data = imgData.data;

  for (let y = 0; y < 64; y++) {
    const vNorm = (y / 63) * 2 - 1; // -1..1 across ribbon width
    const edgeFeather = Math.pow(Math.max(0, 1 - vNorm * vNorm), 1.4);

    for (let x = 0; x < 256; x++) {
      const u = x / 255; // 0 at wingtip head -> 1 at tail end
      const headFade = Math.min(1, u * 9.0);
      const tailFade = Math.pow(1 - u, 1.55);
      // Soft cloud billow modulation along the ribbon
      const wispWave = 0.82 + 0.18 * Math.sin(u * 18.0) * Math.cos(vNorm * 3.14);
      const alpha = Math.min(1, edgeFeather * headFade * tailFade * wispWave);

      const idx = (y * 256 + x) * 4;
      // Warm pearlescent cloud white with subtle golden-sky luminescence
      data[idx] = 255;
      data[idx + 1] = 252;
      data[idx + 2] = 242;
      data[idx + 3] = Math.round(alpha * 255);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const _leftTipWorld = new THREE.Vector3();
const _rightTipWorld = new THREE.Vector3();
const _sideAxis = new THREE.Vector3();
const _segDir = new THREE.Vector3();
const _upVec = new THREE.Vector3(0, 1, 0);
const _puffDummy = new THREE.Object3D();

export function buildWingCloudTrailSystem(scene: THREE.Scene): WingCloudTrailSystem {
  const RIBBON_NODES = 28;

  const createRibbonMesh = (ribbonTex: THREE.CanvasTexture) => {
    const vertexCount = RIBBON_NODES * 2;
    const positions = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const indices: number[] = [];

    for (let i = 0; i < RIBBON_NODES; i++) {
      const u = i / (RIBBON_NODES - 1);
      uvs[i * 4] = u;
      uvs[i * 4 + 1] = 0;
      uvs[i * 4 + 2] = u;
      uvs[i * 4 + 3] = 1;

      if (i < RIBBON_NODES - 1) {
        const a = i * 2;
        const b = a + 1;
        const c = (i + 1) * 2;
        const d = c + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);

    const mat = new THREE.MeshBasicMaterial({
      map: ribbonTex,
      color: 0xfffbeb,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const history: THREE.Vector3[] = Array.from(
      { length: RIBBON_NODES },
      () => new THREE.Vector3(0, -200, 0)
    );

    return { mesh, geo, mat, history };
  };

  const ribbonTex = createCloudRibbonTexture();
  const leftRibbon = createRibbonMesh(ribbonTex);
  const rightRibbon = createRibbonMesh(ribbonTex);

  // Volumetric Cloud-Mist Puff Pool (160 soft billowing cloud puffs)
  const PUFF_CAP = 160;
  const puffGeo = new THREE.IcosahedronGeometry(0.19, 2);
  // Sculpt slightly flattened, organic cloud-puff proportions
  puffGeo.scale(1.28, 0.82, 1.18);

  const puffMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfef3c7,
    emissiveIntensity: 0.55,
    roughness: 0.9,
    metalness: 0.0,
    transparent: true,
    opacity: 0.54,
    depthWrite: false,
  });

  const puffInstanced = new THREE.InstancedMesh(puffGeo, puffMat, PUFF_CAP);
  puffInstanced.frustumCulled = false;
  scene.add(puffInstanced);

  const puffPool: CloudMistPuff[] = Array.from({ length: PUFF_CAP }, () => ({
    active: false,
    x: 0,
    y: -200,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    life: 0,
    maxLife: 1,
    baseScale: 1,
    phase: 0,
    spinSpeed: 1,
  }));

  let puffHead = 0;
  let spawnTimer = 0;
  let ribbonsInitialized = false;
  let currentRibbonAlpha = 0;

  const spawnCloudPuff = (
    wx: number,
    wy: number,
    wz: number,
    vx: number,
    vy: number,
    vz: number,
    baseScale: number,
    maxLife: number
  ) => {
    const p = puffPool[puffHead];
    puffHead = (puffHead + 1) % PUFF_CAP;
    p.active = true;
    p.x = wx + (Math.random() - 0.5) * 0.16;
    p.y = wy + (Math.random() - 0.5) * 0.12;
    p.z = wz + (Math.random() - 0.5) * 0.16;
    p.vx = vx;
    p.vy = vy;
    p.vz = vz;
    p.life = 0;
    p.maxLife = maxLife;
    p.baseScale = baseScale;
    p.phase = Math.random() * Math.PI * 2;
    p.spinSpeed = (Math.random() - 0.5) * 3.2;
  };

  const updateRibbonGeometry = (
    ribbon: ReturnType<typeof createRibbonMesh>,
    headPos: THREE.Vector3,
    dt: number,
    elapsed: number,
    turbulence: number,
    wingSign: number
  ) => {
    const hist = ribbon.history;

    // Shift history backward and apply subtle upward thermal drift + cloud curl to older nodes
    for (let i = RIBBON_NODES - 1; i > 0; i--) {
      hist[i].copy(hist[i - 1]);
      const ageRatio = i / (RIBBON_NODES - 1);
      const curlX =
        Math.sin(elapsed * 4.5 + i * 0.45 + wingSign) * 0.32 * turbulence * dt;
      const curlZ =
        Math.cos(elapsed * 3.8 + i * 0.38 - wingSign) * 0.32 * turbulence * dt;
      hist[i].x += curlX * ageRatio;
      hist[i].y += (0.45 + turbulence * 0.25) * dt * ageRatio;
      hist[i].z += curlZ * ageRatio;
    }
    hist[0].copy(headPos);

    const posAttr = ribbon.geo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < RIBBON_NODES; i++) {
      const curr = hist[i];
      const next = hist[Math.min(RIBBON_NODES - 1, i + 1)];
      const prev = hist[Math.max(0, i - 1)];

      _segDir.subVectors(prev, next);
      if (_segDir.lengthSq() < 0.00001) {
        _sideAxis.set(1, 0, 0);
      } else {
        _segDir.normalize();
        _sideAxis.crossVectors(_segDir, _upVec);
        if (_sideAxis.lengthSq() < 0.0001) {
          _sideAxis.set(1, 0, 0);
        } else {
          _sideAxis.normalize();
        }
      }

      // Bank ribbon slightly with spiral cloud wave
      const u = i / (RIBBON_NODES - 1);
      // Width profile: starts sleek at wingtip (0.14m), billows out in mid-wake (0.34m), tapers to 0 at tail
      const billowEnvelope = Math.sin(Math.pow(u, 0.65) * Math.PI);
      const halfWidth = (0.07 * (1 - u) + 0.24 * billowEnvelope) * (0.65 + 0.35 * currentRibbonAlpha);

      const bankY = Math.sin(elapsed * 5.0 + i * 0.35) * halfWidth * 0.35;

      arr[i * 6] = curr.x - _sideAxis.x * halfWidth;
      arr[i * 6 + 1] = curr.y - bankY;
      arr[i * 6 + 2] = curr.z - _sideAxis.z * halfWidth;

      arr[i * 6 + 3] = curr.x + _sideAxis.x * halfWidth;
      arr[i * 6 + 4] = curr.y + bankY;
      arr[i * 6 + 5] = curr.z + _sideAxis.z * halfWidth;
    }

    posAttr.needsUpdate = true;
  };

  const resetRibbonHistory = (rig: SkyChildRig) => {
    rig.root.updateMatrixWorld(true);
    rig.leftWingTipAnchor.getWorldPosition(_leftTipWorld);
    rig.rightWingTipAnchor.getWorldPosition(_rightTipWorld);
    for (let i = 0; i < RIBBON_NODES; i++) {
      leftRibbon.history[i].copy(_leftTipWorld);
      rightRibbon.history[i].copy(_rightTipWorld);
    }
    ribbonsInitialized = true;
  };

  const burstWingTipClouds = (rig: SkyChildRig, countPerWing = 7) => {
    rig.root.updateMatrixWorld(true);
    rig.leftWingTipAnchor.getWorldPosition(_leftTipWorld);
    rig.rightWingTipAnchor.getWorldPosition(_rightTipWorld);

    for (let i = 0; i < countPerWing; i++) {
      const angle = (i / countPerWing) * Math.PI * 2 + Math.random() * 0.5;
      const radialSpeed = 0.65 + Math.random() * 1.35;
      const vx = Math.cos(angle) * radialSpeed;
      const vy = 0.35 + Math.random() * 1.1;
      const vz = Math.sin(angle) * radialSpeed;
      const scale = 0.85 + Math.random() * 0.55;
      const life = 0.65 + Math.random() * 0.45;

      spawnCloudPuff(_leftTipWorld.x, _leftTipWorld.y, _leftTipWorld.z, vx, vy, vz, scale, life);
      spawnCloudPuff(_rightTipWorld.x, _rightTipWorld.y, _rightTipWorld.z, -vx, vy, vz, scale, life);
    }
  };

  const setAccentColor = (hexColor: string) => {
    // Blend 70% pure cloud white with 30% cape accent color for ethereal tinted mist
    const tint = new THREE.Color(hexColor).lerp(new THREE.Color(0xffffff), 0.68);
    leftRibbon.mat.color.copy(tint);
    rightRibbon.mat.color.copy(tint);
    puffMat.emissive.copy(tint);
  };

  const update = (
    dt: number,
    elapsed: number,
    rig: SkyChildRig,
    trailCfg: WingTrailConfig,
    playerVx: number,
    playerVy: number,
    playerVz: number
  ) => {
    rig.root.updateMatrixWorld(true);
    rig.leftWingTipAnchor.getWorldPosition(_leftTipWorld);
    rig.rightWingTipAnchor.getWorldPosition(_rightTipWorld);

    if (!ribbonsInitialized) {
      resetRibbonHistory(rig);
    }

    // Smoothly fade ribbon opacity in when flying/gliding and out when landing
    const targetAlpha = trailCfg.active ? trailCfg.ribbonOpacity : 0;
    currentRibbonAlpha += (targetAlpha - currentRibbonAlpha) * (1 - Math.exp(-9.0 * dt));
    leftRibbon.mat.opacity = currentRibbonAlpha;
    rightRibbon.mat.opacity = currentRibbonAlpha;

    if (currentRibbonAlpha > 0.01) {
      updateRibbonGeometry(leftRibbon, _leftTipWorld, dt, elapsed, trailCfg.turbulence, -1);
      updateRibbonGeometry(rightRibbon, _rightTipWorld, dt, elapsed, trailCfg.turbulence, 1);
    } else {
      // Keep history snapped to current wingtips while grounded so takeoff never stretches a line
      for (let i = 0; i < RIBBON_NODES; i++) {
        leftRibbon.history[i].copy(_leftTipWorld);
        rightRibbon.history[i].copy(_rightTipWorld);
      }
    }

    // Emit Volumetric Billowing Cloud-Mist Puffs from both wingtips while flying/gliding
    if (trailCfg.active) {
      spawnTimer += dt;
      while (spawnTimer >= trailCfg.spawnInterval) {
        spawnTimer -= trailCfg.spawnInterval;

        // Inherit gentle fraction of reverse wake + upward thermal lift + lateral wingtip vortex
        const wakeVx = -playerVx * 0.08 + (Math.random() - 0.5) * 0.75 * trailCfg.turbulence;
        const wakeVy = -playerVy * 0.05 + 0.45 + Math.random() * 0.65;
        const wakeVz = -playerVz * 0.08 + (Math.random() - 0.5) * 0.75 * trailCfg.turbulence;
        const pScale = trailCfg.puffBaseScale * (0.75 + Math.random() * 0.5);
        const pLife = 0.62 + Math.random() * 0.48;

        spawnCloudPuff(
          _leftTipWorld.x,
          _leftTipWorld.y,
          _leftTipWorld.z,
          wakeVx - 0.25,
          wakeVy,
          wakeVz,
          pScale,
          pLife
        );
        spawnCloudPuff(
          _rightTipWorld.x,
          _rightTipWorld.y,
          _rightTipWorld.z,
          wakeVx + 0.25,
          wakeVy,
          wakeVz,
          pScale,
          pLife
        );
      }
    } else {
      spawnTimer = 0;
    }

    // Update all active cloud-mist puffs in the Zero-GC InstancedMesh pool
    for (let i = 0; i < PUFF_CAP; i++) {
      const pf = puffPool[i];
      if (!pf.active) {
        _puffDummy.position.set(0, -200, 0);
        _puffDummy.scale.set(0, 0, 0);
        _puffDummy.updateMatrix();
        puffInstanced.setMatrixAt(i, _puffDummy.matrix);
        continue;
      }

      pf.life += dt;
      if (pf.life >= pf.maxLife) {
        pf.active = false;
        _puffDummy.position.set(0, -200, 0);
        _puffDummy.scale.set(0, 0, 0);
        _puffDummy.updateMatrix();
        puffInstanced.setMatrixAt(i, _puffDummy.matrix);
        continue;
      }

      const progress = pf.life / pf.maxLife;
      // Air drag slows initial velocity while gentle curl turbulence swirls the cloud puff
      const drag = Math.exp(-2.4 * dt);
      pf.vx *= drag;
      pf.vy *= drag;
      pf.vz *= drag;

      const swirlX = Math.sin(elapsed * 4.2 + pf.phase) * 0.45;
      const swirlZ = Math.cos(elapsed * 3.9 + pf.phase) * 0.45;

      pf.x += (pf.vx + swirlX) * dt;
      pf.y += (pf.vy + 0.28) * dt;
      pf.z += (pf.vz + swirlZ) * dt;

      // Cloud billow curve: puffs expand rapidly to peak volume at 35% life, then softly dissipate to 0
      const billowCurve = Math.sin(Math.pow(progress, 0.58) * Math.PI);
      const scale = pf.baseScale * billowCurve * 1.32;

      _puffDummy.position.set(pf.x, pf.y, pf.z);
      _puffDummy.scale.set(scale * 1.15, scale * 0.85, scale * 1.15);
      _puffDummy.rotation.set(
        pf.phase + elapsed * pf.spinSpeed * 0.5,
        pf.phase + elapsed * pf.spinSpeed,
        0
      );
      _puffDummy.updateMatrix();
      puffInstanced.setMatrixAt(i, _puffDummy.matrix);
    }

    puffInstanced.instanceMatrix.needsUpdate = true;
  };

  return {
    update,
    burstWingTipClouds,
    setAccentColor,
    resetRibbonHistory,
  };
}

