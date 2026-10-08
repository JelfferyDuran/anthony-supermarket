/* The Loading Dock — 3D world construction.
   One persistent night-time scene; the camera glides between five zones.
   Shared geometries/materials, modest poly counts, pixel ratio capped. */

import * as THREE from 'three';

export const PALETTE = {
  amber: 0xffb020,
  amberHot: 0xffc95e,
  cyan: 0x22d3ee,
  green: 0x34d399,
  red: 0xf87171,
  bg: 0x07090d,
  steel: 0x2a3342,
  darkSteel: 0x141a24,
  box: 0x8a6b42,
  box2: 0x6e7f96,
};

/* Zone layout: dock at origin, four zones at the compass points. */
export const ZONE_VIEW = {
  dock:   { pos: [0, 13, 30],   look: [0, 2.5, 0] },
  intake: { pos: [-48, 8, 19],  look: [-48, 2.5, 0] },
  review: { pos: [48, 8, 19],   look: [48, 2.5, 0] },
  aisles: { pos: [0, 9, -27],   look: [0, 2.5, -48] },
  vault:  { pos: [0, 9, 69],    look: [0, 3.5, 48] },
};

export const ZONE_POS = {
  dock: new THREE.Vector3(0, 0, 0),
  intake: new THREE.Vector3(-48, 0, 0),
  review: new THREE.Vector3(48, 0, 0),
  aisles: new THREE.Vector3(0, 0, -48),
  vault: new THREE.Vector3(0, 0, 48),
};

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ---------- canvas text helpers ---------- */
function textTexture(text, { size = 44, color = '#ffb020', bg = 'rgba(7,9,13,0.88)', padX = 30, padY = 20, font = null } = {}) {
  const c = document.createElement('canvas');
  const draw = () => {
    const ctx = c.getContext('2d');
    ctx.font = `800 ${size}px ${font || 'Inter, system-ui, sans-serif'}`;
    const w = Math.ceil(ctx.measureText(text).width);
    c.width = w + padX * 2;
    c.height = size + padY * 2;
    const g = c.getContext('2d');
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); }
    g.font = `800 ${size}px ${font || 'Inter, system-ui, sans-serif'}`;
    g.textBaseline = 'middle';
    g.fillStyle = color;
    g.fillText(text, padX, c.height / 2);
  };
  draw();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, redraw: (t) => { text = t; draw(); tex.needsUpdate = true; } };
}

function labelPlane(text, opts = {}) {
  const { tex, redraw } = textTexture(text, opts);
  const h = opts.height || 1.6;
  const aspect = tex.image.width / tex.image.height;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(h * aspect, h), mat);
  mesh.userData.redraw = redraw;
  mesh.userData.tex = tex;
  return mesh;
}

/* conveyor belt stripe texture */
function conveyorTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#10151d'; g.fillRect(0, 0, 256, 64);
  g.strokeStyle = 'rgba(255,176,32,0.55)'; g.lineWidth = 8;
  for (let x = -32; x < 288; x += 64) {
    g.beginPath(); g.moveTo(x, 64); g.lineTo(x + 32, 0); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.bg);
  scene.fog = new THREE.Fog(PALETTE.bg, 70, 190);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 600);
  camera.position.set(...ZONE_VIEW.dock.pos);
  const lookTarget = new THREE.Vector3(...ZONE_VIEW.dock.look);
  camera.lookAt(lookTarget);

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight(0x8fb4d8, 0x0a0c10, 0.55));
  const moon = new THREE.DirectionalLight(0x9fc4ff, 0.7);
  moon.position.set(-30, 50, 20);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  moon.shadow.camera.left = -70; moon.shadow.camera.right = 70;
  moon.shadow.camera.top = 70; moon.shadow.camera.bottom = -70;
  scene.add(moon);

  const zoneGlow = (x, z, color, intensity = 60, dist = 55) => {
    const p = new THREE.PointLight(color, intensity, dist, 1.8);
    p.position.set(x, 9, z);
    scene.add(p);
    return p;
  };
  zoneGlow(-48, 0, PALETTE.cyan);
  zoneGlow(48, 0, PALETTE.amber);
  zoneGlow(0, -48, 0x8b7cf6);
  zoneGlow(0, 48, PALETTE.green);
  zoneGlow(0, 0, PALETTE.amber, 40, 60);

  /* ---------- ground ---------- */
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(120, 48),
    new THREE.MeshStandardMaterial({ color: 0x0b0e14, roughness: 0.95, metalness: 0.05 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(220, 44, 0x1c2635, 0x11161f);
  grid.position.y = 0.02;
  scene.add(grid);

  /* shared bits */
  const steelMat = new THREE.MeshStandardMaterial({ color: PALETTE.steel, roughness: 0.5, metalness: 0.7 });
  const darkMat = new THREE.MeshStandardMaterial({ color: PALETTE.darkSteel, roughness: 0.8, metalness: 0.2 });
  const amberGlowMat = new THREE.MeshStandardMaterial({ color: 0x201404, emissive: PALETTE.amber, emissiveIntensity: 1.6, roughness: 0.4 });
  const cyanGlowMat = new THREE.MeshStandardMaterial({ color: 0x062a30, emissive: PALETTE.cyan, emissiveIntensity: 1.6, roughness: 0.4 });

  const animated = [];   // fn(dt, t) called every frame
  const pickables = { dock: [], intake: [], review: [], aisles: [], vault: [] };
  const anchors = {};

  /* ============ DOCK (home) ============ */
  const dock = new THREE.Group();
  scene.add(dock);

  // main conveyor through the dock
  const beltTex = conveyorTexture();
  const belt = new THREE.Mesh(
    new THREE.BoxGeometry(44, 0.5, 3.2),
    new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.85 })
  );
  belt.position.set(0, 0.9, 8);
  belt.receiveShadow = true;
  dock.add(belt);
  const beltFrame = new THREE.Mesh(new THREE.BoxGeometry(45, 0.3, 3.8), steelMat);
  beltFrame.position.set(0, 0.55, 8);
  dock.add(beltFrame);
  animated.push((dt) => { beltTex.offset.x -= dt * 0.55; });

  // dock sign
  const dockSign = labelPlane("ANTHONY'S LOADING DOCK", { size: 52, height: 2.2 });
  dockSign.position.set(0, 11, -4);
  dock.add(dockSign);

  // hologram stat panels (updated with live data)
  const holoGroup = new THREE.Group();
  holoGroup.position.set(0, 7.2, -4);
  dock.add(holoGroup);
  const holoLines = ['—', '—', '—'];
  const holoMeshes = holoLines.map((txt, i) => {
    const m = labelPlane(txt, { size: 40, color: '#22d3ee', height: 1.35, bg: 'rgba(8,20,26,0.82)' });
    m.position.set((i - 1) * 9.5, 0, 0);
    holoGroup.add(m);
    return m;
  });
  animated.push((_, t) => { holoGroup.position.y = 7.2 + Math.sin(t * 0.9) * 0.25; });
  anchors.updateHolo = (lines) => {
    lines.forEach((txt, i) => { if (holoMeshes[i]) holoMeshes[i].userData.redraw(String(txt)); });
  };

  // portals to the four zones
  const portalDefs = [
    { zone: 'intake', pos: [-17, 0, 0], rotY: Math.PI / 2, color: PALETTE.cyan, label: 'INTAKE BAY' },
    { zone: 'review', pos: [17, 0, 0], rotY: -Math.PI / 2, color: PALETTE.amber, label: 'REVIEW LINE' },
    { zone: 'aisles', pos: [0, 0, -17], rotY: 0, color: 0x8b7cf6, label: 'AISLES' },
    { zone: 'vault', pos: [0, 0, 17], rotY: Math.PI, color: PALETTE.green, label: 'VAULT' },
  ];
  const portalMeshes = {};
  for (const def of portalDefs) {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.28, 12, 40),
      new THREE.MeshStandardMaterial({ color: 0x111111, emissive: def.color, emissiveIntensity: 2.2, roughness: 0.4 })
    );
    ring.position.y = 3.1;
    g.add(ring);
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(2.35, 32),
      new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })
    );
    glow.position.y = 3.1;
    g.add(glow);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 3.6), darkMat);
    base.position.y = 0.25;
    g.add(base);
    const lab = labelPlane(def.label, { size: 40, color: '#ffffff', height: 1.1 });
    lab.position.y = 6.4;
    g.add(lab);
    g.position.set(...def.pos);
    g.rotation.y = def.rotY;
    g.userData.pick = { type: 'portal', zone: def.zone };
    ring.userData.pick = { type: 'portal', zone: def.zone };
    glow.userData.pick = { type: 'portal', zone: def.zone };
    dock.add(g);
    pickables.dock.push(ring, glow);
    portalMeshes[def.zone] = { group: g, ring, mat: ring.material };
    animated.push((_, t) => {
      const s = 1 + Math.sin(t * 2 + def.pos[0]) * 0.03;
      ring.scale.set(s, s, 1);
      ring.material.emissiveIntensity = 2.0 + Math.sin(t * 2.4 + def.pos[2]) * 0.5;
    });
  }
  anchors.portals = portalMeshes;

  // lamp posts with blinking beacons
  const beacons = [];
  for (const [x, z] of [[-24, -10], [24, -10], [-24, 16], [24, 16]]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 9, 8), steelMat);
    post.position.set(x, 4.5, z);
    post.castShadow = true;
    dock.add(post);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x111111, emissive: PALETTE.amber, emissiveIntensity: 2 })
    );
    lamp.position.set(x, 9.3, z);
    dock.add(lamp);
    beacons.push(lamp.material);
  }
  animated.push((_, t) => {
    beacons.forEach((m, i) => { m.emissiveIntensity = 1.2 + Math.max(0, Math.sin(t * 3 + i * 1.7)) * 1.8; });
  });

  /* ============ INTAKE BAY ============ */
  const intake = new THREE.Group();
  scene.add(intake);
  const IC = ZONE_POS.intake;

  // giant inbox tray: open-top box with glowing rim
  const tray = new THREE.Group();
  const trayWallMat = new THREE.MeshStandardMaterial({ color: 0x1a2230, roughness: 0.6, metalness: 0.5 });
  const wallT = 0.5, trayW = 12, trayD = 9, trayH = 3;
  const mkWall = (w, h, d, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), trayWallMat);
    m.position.set(IC.x + x, y, IC.z + z);
    m.castShadow = true; m.receiveShadow = true;
    intake.add(m);
    return m;
  };
  mkWall(trayW, wallT, trayD, 0, 0.6, 0);                       // floor
  mkWall(trayW, trayH, wallT, 0, trayH / 2 + 0.6, -trayD / 2);   // back
  mkWall(trayW, trayH, wallT, 0, trayH / 2 + 0.6, trayD / 2);   // front
  mkWall(wallT, trayH, trayD, -trayW / 2, trayH / 2 + 0.6, 0);   // left
  mkWall(wallT, trayH, trayD, trayW / 2, trayH / 2 + 0.6, 0);    // right
  // glowing rim
  const rim = new THREE.Mesh(new THREE.BoxGeometry(trayW + 0.4, 0.18, trayD + 0.4),
    new THREE.MeshStandardMaterial({ color: 0x062a30, emissive: PALETTE.cyan, emissiveIntensity: 1.8 }));
  rim.position.set(IC.x, trayH + 0.7, IC.z);
  intake.add(rim);
  const trayHit = new THREE.Mesh(new THREE.BoxGeometry(trayW, trayH + 2, trayD),
    new THREE.MeshBasicMaterial({ visible: false }));
  trayHit.position.set(IC.x, 2.4, IC.z);
  trayHit.userData.pick = { type: 'tray' };
  intake.add(trayHit);
  pickables.intake.push(trayHit);
  anchors.trayPos = new THREE.Vector3(IC.x, 3.4, IC.z);
  anchors.trayHit = trayHit;
  animated.push((_, t) => { rim.material.emissiveIntensity = 1.5 + Math.sin(t * 2.2) * 0.6; });

  const intakeSign = labelPlane('INTAKE BAY — DROP INVOICES HERE', { size: 44, color: '#22d3ee', height: 1.7 });
  intakeSign.position.set(IC.x, 9.5, IC.z);
  intake.add(intakeSign);

  // progress ring above the tray (spins while extracting)
  const progRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.22, 12, 48, Math.PI * 1.5),
    new THREE.MeshStandardMaterial({ color: 0x062a30, emissive: PALETTE.cyan, emissiveIntensity: 2.2 })
  );
  progRing.position.set(IC.x, 7.6, IC.z);
  progRing.visible = false;
  intake.add(progRing);
  anchors.progRing = progRing;
  animated.push((dt) => { if (progRing.visible) progRing.rotation.z -= dt * 4; });

  // guide arrows on the floor toward the tray
  const arrowTexC = document.createElement('canvas');
  arrowTexC.width = 128; arrowTexC.height = 128;
  const ag = arrowTexC.getContext('2d');
  ag.fillStyle = 'rgba(34,211,238,0.85)';
  ag.beginPath(); ag.moveTo(64, 12); ag.lineTo(112, 76); ag.lineTo(80, 76); ag.lineTo(80, 116); ag.lineTo(48, 116); ag.lineTo(48, 76); ag.lineTo(16, 76); ag.closePath(); ag.fill();
  const arrowTex = new THREE.CanvasTexture(arrowTexC);
  for (let i = 0; i < 3; i++) {
    const a = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4),
      new THREE.MeshBasicMaterial({ map: arrowTex, transparent: true, depthWrite: false }));
    a.rotation.x = -Math.PI / 2;
    a.rotation.z = -Math.PI / 2;
    a.position.set(IC.x + 12 + i * 5, 0.06, IC.z);
    intake.add(a);
    animated.push((_, t) => { a.material.opacity = 0.45 + Math.sin(t * 3 - i * 1.2) * 0.35; });
  }

  /* ============ REVIEW LINE ============ */
  const review = new THREE.Group();
  scene.add(review);
  const RC = ZONE_POS.review;

  const beltTex2 = conveyorTexture();
  const rBelt = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.5, 26),
    new THREE.MeshStandardMaterial({ map: beltTex2, roughness: 0.85 }));
  rBelt.position.set(RC.x, 0.9, RC.z);
  rBelt.receiveShadow = true;
  review.add(rBelt);
  const rFrame = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, 27), steelMat);
  rFrame.position.set(RC.x, 0.55, RC.z);
  review.add(rFrame);
  animated.push((dt) => { beltTex2.offset.x -= dt * 0.4; });

  const reviewSign = labelPlane('REVIEW LINE — TAP A PACKAGE', { size: 44, height: 1.7 });
  reviewSign.position.set(RC.x, 9.5, RC.z);
  review.add(reviewSign);
  anchors.reviewCenter = new THREE.Vector3(RC.x, 0, RC.z);
  // 8 package slots along the belt
  anchors.reviewSlots = [];
  for (let i = 0; i < 8; i++) {
    anchors.reviewSlots.push(new THREE.Vector3(RC.x, 1.9, RC.z - 10.5 + i * 3));
  }

  // scanner arch over the belt
  const archMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: PALETTE.amber, emissiveIntensity: 1.4, roughness: 0.5 });
  for (const dz of [-3, 3]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5.4, 0.5), steelMat);
    post.position.set(RC.x + (dz > 0 ? 2.2 : -2.2), 3.1, RC.z + dz);
    review.add(post);
  }
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(5, 0.5, 0.5), archMat);
  archTop.position.set(RC.x, 5.9, RC.z);
  review.add(archTop);
  const scanPlane = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 5),
    new THREE.MeshBasicMaterial({ color: PALETTE.amber, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }));
  scanPlane.rotation.y = Math.PI / 2;
  scanPlane.position.set(RC.x, 3.1, RC.z);
  review.add(scanPlane);
  animated.push((_, t) => { scanPlane.material.opacity = 0.05 + Math.max(0, Math.sin(t * 2.5)) * 0.08; });

  /* ============ AISLES ============ */
  const aisles = new THREE.Group();
  scene.add(aisles);
  const AC = ZONE_POS.aisles;

  const aisleSign = labelPlane('AISLES — PRODUCT CATALOG', { size: 44, color: '#b7a6ff', height: 1.7 });
  aisleSign.position.set(AC.x, 10.5, AC.z + 8);
  aisles.add(aisleSign);

  // pricing rule plaque
  const plaque = labelPlane('RETAIL = UNIT COST x 1.70  →  SHELF .99', { size: 36, color: '#ffb020', height: 1.15, bg: 'rgba(20,14,4,0.9)' });
  plaque.position.set(AC.x, 7.6, AC.z + 8);
  aisles.add(plaque);

  // shelf rows
  const shelfRows = [];
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x232c3d, roughness: 0.6, metalness: 0.5 });
  for (let r = 0; r < 3; r++) {
    const z = AC.z - 6 + r * 7;
    const row = new THREE.Group();
    for (const x of [-9, 9]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7, 1.6), shelfMat);
      post.position.set(x, 3.5, 0);
      post.castShadow = true;
      row.add(post);
    }
    const boards = [];
    for (let b = 0; b < 4; b++) {
      const board = new THREE.Mesh(new THREE.BoxGeometry(18.5, 0.3, 1.8), shelfMat);
      board.position.set(0, 1.2 + b * 1.9, 0);
      board.castShadow = true; board.receiveShadow = true;
      row.add(board);
      boards.push(1.2 + b * 1.9 + 0.15);
    }
    row.position.set(AC.x, 0, z);
    aisles.add(row);
    shelfRows.push({ z, boards });
  }
  anchors.shelfRows = shelfRows;
  anchors.aisleCenter = new THREE.Vector3(AC.x, 0, AC.z);

  /* ============ VAULT ============ */
  const vault = new THREE.Group();
  scene.add(vault);
  const VC = ZONE_POS.vault;

  // vault door
  const door = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 1.2, 36),
    new THREE.MeshStandardMaterial({ color: 0x39424f, roughness: 0.35, metalness: 0.85 }));
  door.rotation.x = Math.PI / 2;
  door.position.set(VC.x, 4.6, VC.z + 6);
  door.castShadow = true;
  vault.add(door);
  const doorRing = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.3, 12, 40),
    new THREE.MeshStandardMaterial({ color: 0x111111, emissive: PALETTE.green, emissiveIntensity: 1.6 }));
  doorRing.position.set(VC.x, 4.6, VC.z + 5.3);
  vault.add(doorRing);
  const spoke = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.5, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x111111, emissive: PALETTE.green, emissiveIntensity: 1.2 }));
  spoke.position.set(VC.x, 4.6, VC.z + 5.2);
  vault.add(spoke);
  animated.push((dt) => { spoke.rotation.z += dt * 0.25; });

  const vaultSign = labelPlane('VAULT — FINANCIALS', { size: 44, color: '#34d399', height: 1.7 });
  vaultSign.position.set(VC.x, 11.5, VC.z);
  vault.add(vaultSign);

  // 3D bar chart (heights set from financials)
  const barDefs = [
    { key: 'revenue', color: 0x22d3ee, label: 'REVENUE' },
    { key: 'cost', color: 0xf87171, label: 'COST' },
    { key: 'profit', color: 0x34d399, label: 'PROFIT' },
  ];
  const bars = [];
  barDefs.forEach((def, i) => {
    const x = VC.x + (i - 1) * 5;
    const geo = new THREE.BoxGeometry(2.6, 1, 2.6);
    geo.translate(0, 0.5, 0); // grow from the floor
    const mat = new THREE.MeshStandardMaterial({ color: def.color, emissive: def.color, emissiveIntensity: 0.55, roughness: 0.4 });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, 0.1, VC.z - 4);
    m.scale.y = 0.01;
    m.castShadow = true;
    vault.add(m);
    const lab = labelPlane(def.label, { size: 34, color: '#ffffff', height: 0.95 });
    lab.position.set(x, 0.8, VC.z - 2.2);
    vault.add(lab);
    const val = labelPlane('—', { size: 38, color: '#ffffff', height: 1.05 });
    val.position.set(x, 9.5, VC.z - 4);
    vault.add(val);
    bars.push({ def, mesh: m, valLabel: val, targetH: 0.01, targetText: '—' });
  });
  anchors.setVaultBars = (items) => {
    // items: [{key, value, text}]
    const max = Math.max(1, ...items.map(i => Math.abs(i.value || 0)));
    bars.forEach((b) => {
      const found = items.find(i => i.key === b.def.key);
      b.targetH = found ? Math.max(0.4, (Math.abs(found.value) / max) * 8) : 0.01;
      b.targetText = found ? found.text : '—';
      if (b.valLabel.userData.redraw) b.valLabel.userData.redraw(b.targetText);
    });
  };
  animated.push((dt) => {
    for (const b of bars) {
      const cur = b.mesh.scale.y;
      b.mesh.scale.y = cur + (b.targetH - cur) * Math.min(1, dt * 3);
    }
  });

  /* ---------- packages ---------- */
  const pkgGeo = new THREE.BoxGeometry(1.5, 1.05, 1.05);
  const pkgMats = [0x8a6b42, 0x6e7f96, 0x7d8a5a, 0x96706e].map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, metalness: 0.05 })
  );
  const tapeMat = new THREE.MeshStandardMaterial({ color: PALETTE.amber, emissive: PALETTE.amber, emissiveIntensity: 0.7, roughness: 0.5 });
  let pkgCount = 0;

  function spawnPackage(colorIdx = -1) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(pkgGeo, pkgMats[colorIdx >= 0 ? colorIdx % pkgMats.length : (pkgCount++) % pkgMats.length]);
    body.castShadow = true;
    g.add(body);
    const tape = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.18, 1.07), tapeMat);
    g.add(tape);
    g.userData.body = body;
    return g;
  }

  /* ---------- particle bursts ---------- */
  const bursts = [];
  function burst(pos, color = PALETTE.amber, n = 42, spread = 5) {
    const geo = new THREE.BufferGeometry();
    const p = new Float32Array(n * 3);
    const v = [];
    for (let i = 0; i < n; i++) {
      p[i * 3] = pos.x; p[i * 3 + 1] = pos.y; p[i * 3 + 2] = pos.z;
      const a = Math.random() * Math.PI * 2;
      const e = Math.random() * Math.PI - Math.PI / 2;
      const s = 2 + Math.random() * spread;
      v.push(new THREE.Vector3(Math.cos(a) * Math.cos(e) * s, Math.abs(Math.sin(e)) * s + 2, Math.sin(a) * Math.cos(e) * s));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const mat = new THREE.PointsMaterial({ color, size: 0.32, transparent: true, opacity: 1, depthWrite: false });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    bursts.push({ pts, v, life: 1.4 });
  }
  animated.push((dt) => {
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.life -= dt;
      const arr = b.pts.geometry.attributes.position.array;
      for (let j = 0; j < b.v.length; j++) {
        b.v[j].y -= dt * 6;
        arr[j * 3] += b.v[j].x * dt;
        arr[j * 3 + 1] += b.v[j].y * dt;
        arr[j * 3 + 2] += b.v[j].z * dt;
      }
      b.pts.geometry.attributes.position.needsUpdate = true;
      b.pts.material.opacity = Math.max(0, b.life / 1.4);
      if (b.life <= 0) {
        scene.remove(b.pts);
        b.pts.geometry.dispose();
        b.pts.material.dispose();
        bursts.splice(i, 1);
      }
    }
  });

  /* ---------- camera fly-to ---------- */
  const tween = {
    active: false, t: 0, dur: 1.2,
    fromPos: new THREE.Vector3(), toPos: new THREE.Vector3(),
    fromLook: new THREE.Vector3(), toLook: new THREE.Vector3(),
  };
  function flyTo(zone, dur = 1.2) {
    const v = ZONE_VIEW[zone];
    if (!v) return;
    tween.fromPos.copy(camera.position);
    tween.toPos.set(...v.pos);
    tween.fromLook.copy(lookTarget);
    tween.toLook.set(...v.look);
    tween.t = 0;
    tween.dur = dur;
    tween.active = true;
  }
  animated.push((dt) => {
    if (!tween.active) return;
    tween.t += dt / tween.dur;
    const k = easeInOutCubic(Math.min(1, tween.t));
    camera.position.lerpVectors(tween.fromPos, tween.toPos, k);
    lookTarget.lerpVectors(tween.fromLook, tween.toLook, k);
    camera.lookAt(lookTarget);
    if (tween.t >= 1) tween.active = false;
  });

  /* ---------- main tick ---------- */
  const clock = new THREE.Clock();
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    for (const fn of animated) fn(dt, t);
    renderer.render(scene, camera);
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  return {
    renderer, scene, camera, anchors, pickables,
    flyTo, tick, resize, burst, spawnPackage, labelPlane,
    onFrame: (fn) => {
      animated.push(fn);
      return () => { const i = animated.indexOf(fn); if (i >= 0) animated.splice(i, 1); };
    },
    tweenActive: () => tween.active,
  };
}
