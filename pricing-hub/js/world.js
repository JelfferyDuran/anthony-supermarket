/* The Loading Dock — 3D world construction.
   One persistent night-time scene; the camera glides between five zones.
   Portrait phones get a wider FOV + pulled-back framing so each zone's hero
   fits fully in frame. Floating HTML labels (crisp on retina) name everything.
   Shared geometries/materials, modest poly counts, mobile perf scaling. */

import * as THREE from 'three';

export const PALETTE = {
  amber: 0xffb020,
  amberHot: 0xffc95e,
  cyan: 0x22d3ee,
  green: 0x34d399,
  red: 0xf87171,
  violet: 0x8b7cf6,
  bg: 0x07090d,
  steel: 0x2a3342,
  darkSteel: 0x141a24,
  box: 0x8a6b42,
  box2: 0x6e7f96,
};

/* Zone layout: dock at origin, four zones at the compass points.
   Base (landscape) framing; portrait phones pull back via PULL below. */
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

/* Portrait framing math (verified for 390x844, aspect 0.462):
   FOV 68 -> tan(34deg)=0.6745; horizontal half-angle factor 0.6745*0.462=0.3117.
   full visible width at distance d = d * 0.6234.
   - intake tray 12 wide: d=27.7 -> 17.3 fits
   - aisles shelves 18.5 wide: d=33 -> 20.6 fits
   - vault cluster ~12.6 wide: d=30.4 -> 19.0 fits
   - dock portals span ~39: d=63.6 -> 39.6 fits */
const LAND_FOV = 55;
const PORT_FOV = 68;
const PULL = { dock: 2.0, intake: 1.4, review: 1.35, aisles: 1.5, vault: 1.4 };

function portraitView() {
  return window.innerWidth / window.innerHeight < 0.8;
}

function computeView(zone) {
  const v = ZONE_VIEW[zone] || ZONE_VIEW.dock;
  const look = new THREE.Vector3(...v.look);
  const pos = new THREE.Vector3(...v.pos);
  if (portraitView()) {
    const dir = pos.clone().sub(look);
    const dist = dir.length() * (PULL[zone] || 1.35);
    dir.normalize();
    pos.copy(look).addScaledVector(dir, dist);
  }
  return { pos, look };
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ---------- canvas text helpers (kept for API stability) ---------- */
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
  const COARSE = (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) || window.innerWidth < 700;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, COARSE ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !COARSE; // phones skip shadow maps
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.bg);
  scene.fog = new THREE.Fog(PALETTE.bg, 70, 190);

  const camera = new THREE.PerspectiveCamera(portraitView() ? PORT_FOV : LAND_FOV, window.innerWidth / window.innerHeight, 0.1, 600);
  const lookTarget = new THREE.Vector3();
  {
    const v0 = computeView('dock');
    camera.position.copy(v0.pos);
    lookTarget.copy(v0.look);
    camera.lookAt(lookTarget);
  }

  /* ---------- lights: stronger key + cool rim ---------- */
  scene.add(new THREE.HemisphereLight(0x8fb4d8, 0x0a0c10, 0.65));
  const moon = new THREE.DirectionalLight(0x9fc4ff, 1.0); // key
  moon.position.set(-30, 50, 20);
  moon.castShadow = true;
  moon.shadow.mapSize.set(COARSE ? 512 : 1024, COARSE ? 512 : 1024);
  moon.shadow.camera.left = -70; moon.shadow.camera.right = 70;
  moon.shadow.camera.top = 70; moon.shadow.camera.bottom = -70;
  scene.add(moon);
  const rim = new THREE.DirectionalLight(0x6fb7ff, 0.55); // cool rim, no shadow
  rim.position.set(40, 18, -50);
  scene.add(rim);

  const zoneGlow = (x, z, color, intensity = 60, dist = 55) => {
    const p = new THREE.PointLight(color, intensity, dist, 1.8);
    p.position.set(x, 9, z);
    scene.add(p);
    return p;
  };
  zoneGlow(-48, 0, PALETTE.cyan);
  zoneGlow(48, 0, PALETTE.amber);
  zoneGlow(0, -48, PALETTE.violet);
  zoneGlow(0, 48, PALETTE.green);
  zoneGlow(0, 0, PALETTE.amber, 40, 60);

  /* ---------- floating HTML labels ---------- */
  const labelLayer = document.getElementById('labels');
  const labels = [];
  const projV = new THREE.Vector3();
  function normAnchor(at, dy) {
    if (!at) return null;
    if (typeof at === 'function') return at;
    if (at.isVector3) { const v = at.clone(); v.y += dy || 0; return (out) => out.copy(v); }
    if (at.isObject3D) return (out) => { at.getWorldPosition(out); out.y += dy || 0; return out; };
    return null;
  }
  // `zone` scopes a label to one zone: it only shows while the camera is
  // there (or flying there). Without it, far zones' titles bleed through.
  function addLabel(html, { cls = '', at = null, dy = 0, maxDist = 70, zone = null } = {}) {
    const el = document.createElement('div');
    el.className = ('float-label ' + cls).trim();
    el.innerHTML = html;
    if (labelLayer) labelLayer.appendChild(el);
    const L = {
      el, maxDist, zone,
      getPos: normAnchor(at, dy),
      setText(t) { el.innerHTML = t; },
      setAnchor(a, d) { L.getPos = normAnchor(a, d == null ? dy : d); },
      remove() { el.remove(); const i = labels.indexOf(L); if (i >= 0) labels.splice(i, 1); },
    };
    labels.push(L);
    return L;
  }
  function updateLabels() {
    const w = window.innerWidth, h = window.innerHeight;
    for (const L of labels) {
      if (!L.getPos || (L.zone && L.zone !== lastZone)) { L.el.style.display = 'none'; continue; }
      L.getPos(projV);
      const dist = camera.position.distanceTo(projV);
      projV.project(camera);
      if (projV.z > 1) { L.el.style.display = 'none'; continue; }
      const x = (projV.x * 0.5 + 0.5) * w;
      const y = (-projV.y * 0.5 + 0.5) * h;
      if (x < -90 || x > w + 90 || y < -60 || y > h + 60) { L.el.style.display = 'none'; continue; }
      L.el.style.display = 'block';
      L.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`;
      L.el.style.opacity = Math.max(0, Math.min(1, 1.7 - dist / L.maxDist)).toFixed(2);
    }
  }

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
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });

  const animated = [];   // fn(dt, t) called every frame
  const pickables = { dock: [], intake: [], review: [], aisles: [], vault: [] };
  const anchors = {};
  anchors.addLabel = addLabel;

  /* ---------- packages (shared factory) ---------- */
  const pkgGeo = new THREE.BoxGeometry(1.5, 1.05, 1.05);
  const pkgMats = [0x8a6b42, 0x6e7f96, 0x7d8a5a, 0x96706e].map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, metalness: 0.05 })
  );
  const tapeMat = new THREE.MeshStandardMaterial({ color: PALETTE.amber, emissive: PALETTE.amber, emissiveIntensity: 0.7, roughness: 0.5 });
  const shipLabelGeo = new THREE.PlaneGeometry(0.72, 0.45);
  const shipLabelMat = new THREE.MeshStandardMaterial({ color: 0xf2f5f9, roughness: 0.6 });
  let pkgCount = 0;

  function spawnPackage(colorIdx = -1) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(pkgGeo, pkgMats[colorIdx >= 0 ? colorIdx % pkgMats.length : (pkgCount++) % pkgMats.length]);
    body.castShadow = true;
    g.add(body);
    const tape = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.18, 1.07), tapeMat);
    g.add(tape);
    const shipLabel = new THREE.Mesh(shipLabelGeo, shipLabelMat); // shipping label patch
    shipLabel.position.set(-0.28, 0.14, 0.531);
    g.add(shipLabel);
    g.userData.body = body;
    return g;
  }

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

  addLabel("ANTHONY'S LOADING DOCK", { cls: 'fl-title', at: new THREE.Vector3(0, 12.8, -4), maxDist: 95, zone: 'dock' });

  // central hologram pedestal: cylinder base + floating rotating stats
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 4.1, 1.2, 28), darkMat);
  ped.position.set(0, 0.6, -4);
  ped.castShadow = true; ped.receiveShadow = true;
  dock.add(ped);
  // Own material: the ring's colour reports dock integrity (game.js).
  const pedRing = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.15, 10, 48), cyanGlowMat.clone());
  pedRing.rotation.x = Math.PI / 2;
  pedRing.position.set(0, 1.28, -4);
  dock.add(pedRing);
  anchors.setPedestalColor = (hex) => { pedRing.material.emissive.setHex(hex); };
  const halo = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.09, 8, 48), amberGlowMat);
  halo.position.set(0, 7.6, -4);
  halo.rotation.x = 1.05;
  dock.add(halo);
  animated.push((dt) => { halo.rotation.z += dt * 0.8; });
  const holoLabel = addLabel('—', { cls: 'fl-holo', at: new THREE.Vector3(0, 9.6, -4), maxDist: 95, zone: 'dock' });
  animated.push((_, t) => { halo.position.y = 7.6 + Math.sin(t * 0.9) * 0.25; });
  anchors.updateHolo = (lines) => {
    holoLabel.setText(lines.map((l) => String(l).replace(/</g, '&lt;')).join('<br>'));
  };

  // portals to the four zones — four DISTINCT silhouettes
  const portalDefs = [
    { zone: 'intake', shape: 'arch',  pos: [-17, 0, 0], rotY: Math.PI / 2,  color: PALETTE.cyan,   label: 'INTAKE' },
    { zone: 'review', shape: 'ring',  pos: [17, 0, 0],  rotY: -Math.PI / 2, color: PALETTE.amber,  label: 'REVIEW' },
    { zone: 'aisles', shape: 'gate',  pos: [0, 0, -17], rotY: 0,            color: PALETTE.violet, label: 'AISLES' },
    { zone: 'vault',  shape: 'hatch', pos: [0, 0, 17],  rotY: Math.PI,      color: PALETTE.green,  label: 'VAULT' },
  ];
  const portalMeshes = {};
  for (const def of portalDefs) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: def.color, emissiveIntensity: 2.0, roughness: 0.45 });
    let spinner = null;
    if (def.shape === 'arch') {
      // rectangular arch: two posts + lintel
      for (const sx of [-1.9, 1.9]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.7, 5.2, 0.7), mat);
        post.position.set(sx, 2.6, 0); post.castShadow = true; g.add(post);
      }
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.7, 0.7), mat);
      lintel.position.set(0, 5.35, 0); lintel.castShadow = true; g.add(lintel);
    } else if (def.shape === 'ring') {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.3, 12, 44), mat);
      ring.position.y = 3.2; ring.castShadow = true; g.add(ring);
      spinner = ring;
    } else if (def.shape === 'gate') {
      // rectangular gateway frame
      const t = 0.55, w = 4.6, h = 5.4;
      const top = new THREE.Mesh(new THREE.BoxGeometry(w, t, t), mat);
      top.position.y = h; top.castShadow = true; g.add(top);
      const bot = new THREE.Mesh(new THREE.BoxGeometry(w, t, t), mat);
      bot.position.y = 0.45; g.add(bot);
      for (const sx of [-w / 2, w / 2]) {
        const side = new THREE.Mesh(new THREE.BoxGeometry(t, h, t), mat);
        side.position.set(sx, h / 2 + 0.2, 0); side.castShadow = true; g.add(side);
      }
    } else { // hatch: flat circular vault hatch facing outward
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.5, 36), steelMat);
      disc.rotation.x = Math.PI / 2; disc.position.y = 3.2; disc.castShadow = true; g.add(disc);
      const rimT = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.24, 12, 44), mat);
      rimT.position.set(0, 3.2, 0.28); g.add(rimT);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.7, 16), mat);
      hub.rotation.x = Math.PI / 2; hub.position.set(0, 3.2, 0.4); g.add(hub);
      spinner = hub;
    }
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(2.2, 28),
      new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false })
    );
    glow.position.set(0, 3.1, -0.15);
    g.add(glow);
    const base = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.5, 3.6), darkMat);
    base.position.y = 0.25; base.receiveShadow = true;
    g.add(base);
    // generous invisible tap target (>=48px on phones)
    const hit = new THREE.Mesh(new THREE.BoxGeometry(6.6, 7.8, 3.8), hitMat);
    hit.position.y = 3.7;
    hit.userData.pick = { type: 'portal', zone: def.zone };
    g.add(hit);
    g.position.set(...def.pos);
    g.rotation.y = def.rotY;
    dock.add(g);
    pickables.dock.push(hit);
    addLabel(def.label, { cls: 'fl-portal', at: new THREE.Vector3(def.pos[0], 6.5, def.pos[2]), maxDist: 85, zone: 'dock' });
    portalMeshes[def.zone] = { group: g, mat };
    animated.push((_, t) => {
      mat.emissiveIntensity = 1.8 + Math.sin(t * 2.2 + def.pos[0]) * 0.5;
      if (spinner) spinner.rotation.z += 0.008;
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
  mkWall(trayW, trayH, wallT, 0, trayH / 2 + 0.6, trayD / 2);     // front
  mkWall(wallT, trayH, trayD, -trayW / 2, trayH / 2 + 0.6, 0);    // left
  mkWall(wallT, trayH, trayD, trayW / 2, trayH / 2 + 0.6, 0);     // right
  const rim2 = new THREE.Mesh(new THREE.BoxGeometry(trayW + 0.4, 0.18, trayD + 0.4),
    new THREE.MeshStandardMaterial({ color: 0x062a30, emissive: PALETTE.cyan, emissiveIntensity: 1.8 }));
  rim2.position.set(IC.x, trayH + 0.7, IC.z);
  intake.add(rim2);
  const trayHit = new THREE.Mesh(new THREE.BoxGeometry(trayW, trayH + 2, trayD), hitMat);
  trayHit.position.set(IC.x, 2.4, IC.z);
  trayHit.userData.pick = { type: 'tray' };
  intake.add(trayHit);
  pickables.intake.push(trayHit);
  anchors.trayPos = new THREE.Vector3(IC.x, 3.4, IC.z);
  anchors.trayHit = trayHit;
  animated.push((_, t) => { rim2.material.emissiveIntensity = 1.5 + Math.sin(t * 2.2) * 0.6; });

  // oversized floating package above the tray — the "drop here" hero
  const heroPkg = spawnPackage(0);
  heroPkg.scale.set(1.9, 1.9, 1.9);
  heroPkg.position.set(IC.x, 8.4, IC.z);
  intake.add(heroPkg);
  animated.push((_, t) => {
    heroPkg.position.y = 8.4 + Math.sin(t * 1.3) * 0.5;
    heroPkg.rotation.y += 0.008;
  });

  // pulsing drop ring on the tray floor
  const dropRing = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.16, 10, 48),
    new THREE.MeshStandardMaterial({ color: 0x062a30, emissive: PALETTE.cyan, emissiveIntensity: 2.4 }));
  dropRing.rotation.x = Math.PI / 2;
  dropRing.position.set(IC.x, 1.05, IC.z);
  intake.add(dropRing);
  animated.push((_, t) => {
    const s = 1 + Math.sin(t * 3) * 0.07;
    dropRing.scale.set(s, s, 1);
  });

  addLabel('INTAKE BAY', { cls: 'fl-title', at: new THREE.Vector3(IC.x, 11.2, IC.z), maxDist: 85, zone: 'intake' });
  addLabel('DROP INVOICE HERE', { cls: 'fl-drop', at: new THREE.Vector3(IC.x, 5.6, IC.z), maxDist: 60, zone: 'intake' });

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

  addLabel('REVIEW LINE', { cls: 'fl-title', at: new THREE.Vector3(RC.x, 10.2, RC.z), maxDist: 85, zone: 'review' });
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
    post.castShadow = true;
    review.add(post);
  }
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(5, 0.5, 0.5), archMat);
  archTop.position.set(RC.x, 5.9, RC.z);
  archTop.castShadow = true;
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

  addLabel('AISLES', { cls: 'fl-title', at: new THREE.Vector3(AC.x, 12.4, AC.z + 8), maxDist: 95, zone: 'aisles' });
  addLabel('RETAIL = UNIT COST × 1.70 → SHELF .99', { cls: 'fl-sub', at: new THREE.Vector3(AC.x, 6.6, AC.z + 8), maxDist: 60, zone: 'aisles' });

  // hanging category header boards
  const catDefs = [['DAIRY', -9], ['JUICE', -3], ['EGGS', 3], ['GROCERY', 9]];
  for (const [name, x] of catDefs) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(5.4, 1.15, 0.28), darkMat);
    board.position.set(AC.x + x, 8.8, AC.z + 8);
    board.castShadow = true;
    aisles.add(board);
    for (const dx of [-2.2, 2.2]) {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), steelMat);
      rod.position.set(AC.x + x + dx, 10.5, AC.z + 8);
      aisles.add(rod);
    }
    addLabel(name, { cls: 'fl-cat', at: new THREE.Vector3(AC.x + x, 8.8, AC.z + 8.35), maxDist: 75, zone: 'aisles' });
  }

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

  // bank-vault door: circle + 3 spokes + bolts
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
  const spokeGroup = new THREE.Group();
  spokeGroup.position.set(VC.x, 4.6, VC.z + 5.15);
  const spokeMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: PALETTE.green, emissiveIntensity: 1.2 });
  for (let s = 0; s < 3; s++) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.42, 0.28), spokeMat);
    sp.rotation.z = (s * Math.PI) / 3;
    spokeGroup.add(sp);
  }
  const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 20), spokeMat);
  hubCap.rotation.x = Math.PI / 2;
  spokeGroup.add(hubCap);
  vault.add(spokeGroup);
  animated.push((dt) => { spokeGroup.rotation.z += dt * 0.25; });
  const boltGeo = new THREE.SphereGeometry(0.28, 10, 10);
  for (let b = 0; b < 8; b++) {
    const a = (b / 8) * Math.PI * 2;
    const bolt = new THREE.Mesh(boltGeo, steelMat);
    bolt.position.set(VC.x + Math.cos(a) * 4.4, 4.6 + Math.sin(a) * 4.4, VC.z + 5.55);
    vault.add(bolt);
  }

  addLabel('VAULT', { cls: 'fl-title', at: new THREE.Vector3(VC.x, 12.6, VC.z + 4), maxDist: 90, zone: 'vault' });

  // 3D bar chart, two-tone bars (dark base + bright cap)
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
    const baseCol = new THREE.Color(def.color).multiplyScalar(0.42);
    const base = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: baseCol, roughness: 0.5, metalness: 0.2 }));
    const cap = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: def.color, emissive: def.color, emissiveIntensity: 1.1, roughness: 0.35 }));
    base.position.set(x, 0.1, VC.z - 4);
    cap.position.set(x, 0.1, VC.z - 4);
    base.castShadow = true;
    vault.add(base); vault.add(cap);
    addLabel(def.label, { cls: 'fl-cat', at: new THREE.Vector3(x, 1.5, VC.z - 2.0), maxDist: 65, zone: 'vault' });
    const valH = addLabel('—', { cls: 'fl-val', at: new THREE.Vector3(x, 10.8, VC.z - 4), maxDist: 75, zone: 'vault' });
    bars.push({ def, base, cap, valH, targetH: 0.01 });
  });
  anchors.setVaultBars = (items) => {
    // items: [{key, value, text}]
    const max = Math.max(1, ...items.map(i => Math.abs(i.value || 0)));
    bars.forEach((b) => {
      const found = items.find(i => i.key === b.def.key);
      b.targetH = found ? Math.max(0.4, (Math.abs(found.value) / max) * 8) : 0.01;
      if (b.valH) b.valH.setText(found ? found.text : '—');
    });
  };
  animated.push((dt) => {
    for (const b of bars) {
      const cur = b.base.userData.h || 0.01;
      const nh = cur + (b.targetH - cur) * Math.min(1, dt * 3);
      b.base.userData.h = nh;
      b.base.scale.y = Math.max(0.01, nh * 0.72);
      b.cap.scale.y = Math.max(0.01, nh * 0.28);
      b.cap.position.y = 0.1 + nh * 0.72;
    }
  });

  /* ---------- particle bursts ---------- */
  const bursts = [];
  function burst(pos, color = PALETTE.amber, n = 42, spread = 5) {
    n = COARSE ? Math.max(8, Math.ceil(n / 2)) : n; // halve on phones
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
  let lastZone = 'dock';
  const tween = {
    active: false, t: 0, dur: 1.2,
    fromPos: new THREE.Vector3(), toPos: new THREE.Vector3(),
    fromLook: new THREE.Vector3(), toLook: new THREE.Vector3(),
  };
  function flyTo(zone, dur = 1.2) {
    const { pos, look } = computeView(zone);
    lastZone = zone;
    tween.fromPos.copy(camera.position);
    tween.toPos.copy(pos);
    tween.fromLook.copy(lookTarget);
    tween.toLook.copy(look);
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

  /* ---------- labels update every frame ---------- */
  animated.push(() => updateLabels());

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
    camera.fov = portraitView() ? PORT_FOV : LAND_FOV;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (!tween.active) {
      const { pos, look } = computeView(lastZone);
      camera.position.copy(pos);
      lookTarget.copy(look);
      camera.lookAt(lookTarget);
    }
  }

  return {
    renderer, scene, camera, anchors, pickables,
    flyTo, tick, resize, burst, spawnPackage, labelPlane, addLabel,
    onFrame: (fn) => {
      animated.push(fn);
      return () => { const i = animated.indexOf(fn); if (i >= 0) animated.splice(i, 1); };
    },
    tweenActive: () => tween.active,
  };
}
