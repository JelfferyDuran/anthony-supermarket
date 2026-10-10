/* Boot: builds the world, wires HUD + zones, runs the main loop.
   Sets window.__hubBooted so the index.html watchdog knows we made it. */

import * as THREE from 'three';
import { createWorld } from './world.js';
import { createZones } from './zones.js';
import { createHud } from './hud.js';
import { createGame } from './game.js';
import { api, state, isAuthed, clearSession } from './api.js';

const ZONES = ['dock', 'intake', 'review', 'aisles', 'vault'];
let currentZone = 'dock';

function setLoader(text) {
  const el = document.getElementById('loaderStatus');
  if (el) el.textContent = text;
}

async function main() {
  setLoader('Building the dock…');
  const canvas = document.getElementById('scene');
  const world = createWorld(canvas);

  const nav = {
    currentZone: () => currentZone,
    goZone,
    refreshAll,
    refreshGame: () => refreshGame(),
    openMissions: (key) => game && game.openBoard(key || null),
  };

  // zones' hooks call hud methods; hud is assigned just below, before any tap.
  let hud = null;
  let game = null;
  const zones = createZones(world, {
    goZone,
    setReviewBadge: (n) => hud.setReviewBadge(n),
    openUpload: () => hud.openUpload(),
    showInvoice: (id) => hud.showInvoice(id),
    showProduct: (id) => hud.showProduct(id),
    onPick: (pick) => game && game.handlePick(pick),
  });
  hud = createHud(world, zones, nav);
  game = createGame(world, hud, nav);

  // Game state is derived server-side; refreshing it after any action is how
  // XP, level-ups, badges and mission clears show up.
  async function refreshGame() {
    const g = await game.refresh();
    if (g && g.player && g.player.email) hud.setUser(g.player.email);
    try { zones.refreshHolo(); } catch (_) { /* best-effort */ }
    return g;
  }

  function goZone(zone) {
    if (!ZONES.includes(zone)) return;
    currentZone = zone;
    world.flyTo(zone, 1.2);
    hud.setZone(zone);
    hud.closePanel();
    if (zone === 'vault') hud.showVaultPanel();
  }

  async function refreshAll() {
    const results = await Promise.allSettled([
      api.getProducts(),
      api.getQueue(),
      api.getFinancials(),
      api.getConfig(),
      game.refresh(),
    ]);
    const rejected = results.find((r) => r.status === 'rejected');
    if (rejected && /session expired|401/i.test(rejected.reason.message)) {
      clearSession();
      hud.showSignin(rejected.reason.message);
      return;
    }
    try { zones.refreshReview(); } catch (_) { /* zone refresh is best-effort */ }
    try { zones.refreshAisles(); } catch (_) { /* best-effort */ }
    try { zones.refreshVault(); } catch (_) { /* best-effort */ }
    try { zones.refreshHolo(); } catch (_) { /* best-effort */ }
    const g = state.game;
    if (g && g.player && g.player.email) hud.setUser(g.player.email);
  }
  nav.refreshAll = refreshAll;

  /* ---------- tap-to-interact (raycast; drags don't count) ---------- */
  const ray = new THREE.Raycaster();
  const ptr = new THREE.Vector2();
  let downAt = null;
  canvas.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', (e) => {
    if (!downAt) return;
    const dx = e.clientX - downAt[0];
    const dy = e.clientY - downAt[1];
    downAt = null;
    if (dx * dx + dy * dy > 144) return;      // it was a drag, not a tap
    if (world.tweenActive()) return;          // let the camera land first
    if (!isAuthed()) return;                   // sign-in gate owns the screen
    ptr.x = (e.clientX / window.innerWidth) * 2 - 1;
    ptr.y = -(e.clientY / window.innerHeight) * 2 + 1;
    ray.setFromCamera(ptr, world.camera);
    const targets = [...world.pickables[currentZone], ...world.pickables.dock];
    const hits = ray.intersectObjects(targets, true);
    if (!hits.length) return;
    let o = hits[0].object;
    while (o && !o.userData.pick) o = o.parent;
    if (o && o.userData.pick) zones.handlePick(o.userData.pick);
  });

  window.addEventListener('resize', world.resize);

  /* ---------- main loop ---------- */
  world.resize();
  world.renderer.setAnimationLoop(world.tick);

  document.getElementById('loader').classList.add('hidden');
  window.__hubBooted = true;

  /* ---------- auth gate ---------- */
  if (!isAuthed()) {
    hud.showSignin();
    return;
  }
  setLoader('Checking session…');
  try {
    await api.getConfig(); // throws on 401
    hud.setUser(state.user && state.user.email);
    setLoader('Loading inventory…');
    await refreshAll();
  } catch (e) {
    hud.showSignin(/session expired/i.test(e.message) ? e.message : '');
    if (!/session expired|not authorized|not configured/i.test(e.message)) {
      hud.toast('<b>Hub unreachable:</b> ' + e.message.replace(/</g, '&lt;'), 'err');
    }
  }
}

main().catch((e) => {
  console.error('Boot failed:', e);
  document.getElementById('loader').classList.add('hidden');
  document.getElementById('bootFail').classList.remove('hidden');
});
