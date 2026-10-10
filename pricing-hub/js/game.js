/* Game layer: player HUD, mission board, player card, health panel and the
   3D mission beacons / stuck-scan packages.

   Everything shown here comes from GET /game/state. The server derives XP,
   levels, streaks and badges from attributed records (who approved, who
   repriced, who imported), so this file only DISPLAYS progress and
   celebrates changes between two server snapshots — it never decides them.
   Missions are the live work queues: they clear when the work is done. */

import * as THREE from 'three';
import { api, state, fmtMoney, fmtDate } from './api.js';
import { PALETTE, ZONE_POS } from './world.js';
import { esc } from './hud.js';

const PRIORITY = {
  critical: { color: PALETTE.red, css: 'crit', label: 'CRITICAL', rank: 0 },
  high: { color: PALETTE.amber, css: 'high', label: 'HIGH', rank: 1 },
  normal: { color: PALETTE.cyan, css: 'norm', label: 'OPEN', rank: 2 },
  clear: { color: PALETTE.green, css: 'clear', label: 'CLEAR', rank: 3 },
};

const svg = (paths) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
const ICONS = {
  review_line: svg('<rect x="6" y="4" width="12" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9.5 13.5l2.25 2.25 4-4.75"/>'),
  rescue_intake: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/>'),
  rule_guard: svg('<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
  sales_feed: svg('<path d="M4 19h16"/><path d="M6 15l4-4 3 3 5-6"/><path d="M15 8h3v3"/>'),
  medal: svg('<circle cx="12" cy="14" r="6"/><path d="M8.5 9L6 3h4l2 4 2-4h4l-2.5 6"/><path d="M12 11.5v5M10 14h4"/>'),
};

const BEACONS = [
  { key: 'review_line', x: -10.5, label: 'REVIEW', short: 'REVIEW' },
  { key: 'rescue_intake', x: -3.5, label: 'RESCUE', short: 'RESCUE' },
  { key: 'rule_guard', x: 3.5, label: 'RULE GUARD', short: 'RULES' },
  { key: 'sales_feed', x: 10.5, label: 'SALES FEED', short: 'SALES' },
];
const narrowScreen = () => window.innerWidth < 700;

function plural(unit, n) {
  return n === 1 ? unit : unit + 's';
}

function ago(iso) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '';
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 90) return 'just now';
  if (s < 3600) return Math.round(s / 60) + ' min ago';
  if (s < 86400) return Math.round(s / 3600) + ' h ago';
  return Math.round(s / 86400) + ' d ago';
}

export function createGame(world, hud, nav) {
  const $ = (id) => document.getElementById(id);
  let prev = null;            // last snapshot, for diffing XP / levels / badges
  let boardFocus = null;      // mission the open board leads with, or null
  let openView = null;        // 'board' | 'player' | 'health' | null
  const busy = new Set();     // ids with an action in flight

  /* ================= 3D: mission beacons on the dock ================= */
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const columnGeo = new THREE.CylinderGeometry(0.55, 0.75, 1, 18);
  columnGeo.translate(0, 0.5, 0);
  const plinthGeo = new THREE.CylinderGeometry(1.5, 1.7, 0.4, 24);
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0x141a24, roughness: 0.8, metalness: 0.2 });
  const ringGeo = new THREE.TorusGeometry(1.9, 0.08, 8, 40);
  const beaconHitGeo = new THREE.BoxGeometry(3.6, 5.2, 3.6);
  const beacons = new Map();

  for (const def of BEACONS) {
    const g = new THREE.Group();
    g.position.set(def.x, 0, 2.5);
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.2;
    plinth.receiveShadow = true;
    g.add(plinth);
    const mat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: PALETTE.cyan, emissiveIntensity: 1.8, roughness: 0.4 });
    const column = new THREE.Mesh(columnGeo, mat);
    column.position.y = 0.4;
    column.castShadow = true;
    g.add(column);
    const ringMat = new THREE.MeshBasicMaterial({ color: PALETTE.cyan, transparent: true, opacity: 0.7, depthWrite: false });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.45;
    g.add(ring);
    const hit = new THREE.Mesh(beaconHitGeo, hitMat);
    hit.position.y = 2.4;
    hit.userData.pick = { type: 'mission', key: def.key };
    g.add(hit);
    world.scene.add(g);
    world.pickables.dock.push(hit);
    const label = world.addLabel(esc(def.label), { cls: 'fl-mission norm', at: g, dy: 5.2, maxDist: 80, zone: 'dock' });
    beacons.set(def.key, { def, g, mat, column, ring, ringMat, label, h: 1, target: 1, critical: false, phase: Math.random() * 6 });
  }

  world.onFrame((dt, t) => {
    for (const b of beacons.values()) {
      b.h += (b.target - b.h) * Math.min(1, dt * 3);
      b.column.scale.y = b.h;
      b.mat.emissiveIntensity = b.critical ? 1.5 + Math.sin(t * 5 + b.phase) * 0.9 : 1.6 + Math.sin(t * 2 + b.phase) * 0.35;
      const k = (t * 0.6 + b.phase) % 1;
      b.ring.scale.set(1 + k * 0.7, 1 + k * 0.7, 1);
      b.ringMat.opacity = 0.75 * (1 - k);
    }
  });

  function updateBeacons(missions) {
    const narrow = narrowScreen();
    for (const m of missions) {
      const b = beacons.get(m.key);
      if (!b) continue;
      // phones pull the dock camera far back: alternate label heights
      b.label.setAnchor(b.g, narrow && BEACONS.indexOf(b.def) % 2 ? 3.6 : 5.2);
      const pr = PRIORITY[m.priority] || PRIORITY.normal;
      b.mat.emissive.setHex(pr.color);
      b.ringMat.color.setHex(pr.color);
      b.critical = m.priority === 'critical';
      b.target = m.done ? 0.6 : Math.min(4.4, 1.4 + Math.log2(1 + m.count) * 0.8);
      b.label.el.className = 'float-label fl-mission ' + pr.css;
      b.label.setText(esc(narrow ? b.def.short : b.def.label) + ' <b>' + (m.done ? '&#10003;' : esc(String(m.count))) + '</b>');
    }
  }

  window.addEventListener('resize', () => { if (prev) updateBeacons(prev.missions); });

  /* ================= 3D: stuck scans waiting at the intake ================= */
  const IC = ZONE_POS.intake;
  const stuckGroup = new THREE.Group();
  world.scene.add(stuckGroup);
  const stuckPkgs = new Map(); // invoiceId -> group
  const stuckHitGeo = new THREE.BoxGeometry(2.4, 2.4, 2.4);
  const stuckLabel = world.addLabel('', { cls: 'fl-stuck hidden', at: new THREE.Vector3(IC.x - 7.3, 2.5, IC.z + 7.2), maxDist: 60, zone: 'intake' });
  world.onFrame((_, t) => {
    let i = 0;
    for (const g of stuckPkgs.values()) {
      g.userData.body.material.emissiveIntensity = 0.25 + Math.max(0, Math.sin(t * 3 + i)) * 0.45;
      i++;
    }
  });

  function updateStuck(mission) {
    const items = (mission && mission.items) || [];
    const seen = new Set();
    items.slice(0, 6).forEach((item, i) => {
      seen.add(item.id);
      let g = stuckPkgs.get(item.id);
      if (!g) {
        g = world.spawnPackage(3);
        g.userData.body.material = g.userData.body.material.clone();
        g.userData.body.material.emissive = new THREE.Color(PALETTE.red);
        const hit = new THREE.Mesh(stuckHitGeo, hitMat);
        hit.userData.pick = { type: 'stuckScan', invoiceId: item.id };
        g.add(hit);
        g.userData.hit = hit;
        world.pickables.intake.push(hit);
        stuckGroup.add(g);
        stuckPkgs.set(item.id, g);
      }
      g.position.set(IC.x - 8.5 + i * 2.4, 0.55, IC.z + 7.2);
      g.rotation.y = (i % 2 ? 1 : -1) * 0.35;
    });
    for (const [id, g] of [...stuckPkgs]) {
      if (seen.has(id)) continue;
      stuckGroup.remove(g);
      world.pickables.intake = world.pickables.intake.filter((h) => h !== g.userData.hit);
      stuckPkgs.delete(id);
    }
    stuckLabel.setText(items.length ? 'STUCK SCANS · ' + items.length + ' · TAP TO RE-READ' : '');
    stuckLabel.el.classList.toggle('hidden', !items.length);
  }

  /* ================= 3D: sales freshness at the vault ================= */
  const VC = ZONE_POS.vault;
  const salesLabel = world.addLabel('', { cls: 'fl-stuck hidden', at: new THREE.Vector3(VC.x, 1.6, VC.z + 1.5), maxDist: 70, zone: 'vault' });
  function updateSales(mission) {
    if (!mission) return;
    salesLabel.el.classList.remove('hidden');
    salesLabel.el.classList.toggle('ok', mission.done);
    salesLabel.setText(mission.done
      ? 'SALES CURRENT · ' + esc(mission.lastPeriodEnd || '')
      : mission.lastPeriodEnd
        ? 'SALES ' + esc(String(mission.count)) + ' DAYS BEHIND · IMPORT IN PANEL'
        : 'NO SALES IMPORTED YET');
  }

  /* ================= player HUD (DOM) ================= */
  const healthColor = (h) => (h.score >= 75 ? PALETTE.green : h.score >= 50 ? PALETTE.amber : PALETTE.red);

  function renderHud(g) {
    const p = g.player;
    $('playerHud').classList.remove('hidden', 'offline');
    $('phLevelNum').textContent = String(p.level);
    $('phName').textContent = p.scoring ? p.name : 'Operator';
    $('phTitle').textContent = p.scoring ? p.title : 'not scoring';
    $('phXp').textContent = p.nextAt
      ? (p.xp - p.levelFloor) + ' / ' + (p.nextAt - p.levelFloor) + ' XP'
      : p.xp + ' XP · MAX';
    $('phBarFill').style.width = Math.round(p.progress * 100) + '%';
    $('phStreakNum').textContent = String(p.streak.current);
    $('phStreak').classList.toggle('risk', p.streak.atRisk);
    $('phStreak').classList.toggle('hot', p.streak.activeToday);
    $('phStreak').title = p.streak.atRisk
      ? 'Streak at risk — do one approval, rescue or reprice today'
      : p.streak.current + '-day work streak (best ' + p.streak.best + ')';
    const hb = $('phHealth');
    $('phHealthNum').textContent = String(g.health.score);
    hb.className = 'ph-chip health g-' + g.health.grade.toLowerCase();
    hb.title = 'Dock integrity ' + g.health.score + ' · ' + g.health.status;
    const open = g.missions.filter((m) => !m.done).length;
    $('missionsBadge').textContent = String(open);
    $('missionsBadge').classList.toggle('hidden', open === 0);
    $('missionsBtn').classList.toggle('alert', g.missions.some((m) => m.priority === 'critical'));
    world.anchors.setPedestalColor(healthColor(g.health));
  }

  function floatXp(amount, label) {
    const box = $('xpFloats');
    const el = document.createElement('div');
    el.className = 'xp-float';
    el.innerHTML = '+' + amount + ' XP' + (label ? '<small>' + esc(label) + '</small>' : '');
    box.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  function showLevelUp(p) {
    $('luNum').textContent = String(p.level);
    $('luTitle').textContent = p.title;
    $('luNext').textContent = p.nextAt ? 'Next: ' + p.nextTitle + ' at ' + p.nextAt + ' XP' : 'Top rank reached.';
    $('levelUp').classList.remove('hidden');
    const at = new THREE.Vector3(0, 8, -4);
    world.burst(at, PALETTE.amber, 90, 8);
    world.burst(at, PALETTE.cyan, 60, 6);
  }
  $('luClose').addEventListener('click', () => $('levelUp').classList.add('hidden'));

  // Compare two server snapshots and celebrate what actually changed.
  function celebrate(a, b) {
    if (b.player.scoring && a.player.scoring) {
      const gained = b.player.xp - a.player.xp;
      if (gained > 0) floatXp(gained, b.player.recent[0] && b.player.recent[0].label);
      if (b.player.level > a.player.level) showLevelUp(b.player);
      const had = new Set(a.player.badges.filter((x) => x.earned).map((x) => x.key));
      for (const badge of b.player.badges) {
        if (badge.earned && !had.has(badge.key)) {
          hud.toast('<b>Badge unlocked: ' + esc(badge.name) + '</b> — ' + esc(badge.desc), 'ok');
        }
      }
    }
    for (const m of b.missions) {
      const old = a.missions.find((x) => x.key === m.key);
      if (old && !old.done && m.done) {
        hud.toast('<b>Mission clear:</b> ' + esc(m.title), 'ok');
        const beacon = beacons.get(m.key);
        if (beacon) world.burst(beacon.g.position.clone().add(new THREE.Vector3(0, 3, 0)), PALETTE.green, 50, 6);
      }
    }
  }

  function apply(g, { celebrateChanges = true } = {}) {
    renderHud(g);
    updateBeacons(g.missions);
    updateStuck(mission('rescue_intake'));
    updateSales(mission('sales_feed'));
    if (prev && celebrateChanges) celebrate(prev, g);
    prev = g;
    // keep an open game panel live — but never paint over another module's card
    if (gameViewActive()) {
      if (openView === 'board') openBoard(boardFocus, { keepScroll: true });
      else if (openView === 'player') openPlayer({ keepScroll: true });
      else if (openView === 'health') openHealth({ keepScroll: true });
    }
  }

  async function refresh() {
    let g;
    try {
      g = await api.getGameState();
    } catch (e) {
      if (/session expired/i.test(e.message)) throw e;
      $('playerHud').classList.remove('hidden');
      $('playerHud').classList.add('offline');
      $('phTitle').textContent = 'game offline';
      return null;
    }
    apply(g);
    return g;
  }

  function mission(key) {
    return state.game && state.game.missions ? state.game.missions.find((m) => m.key === key) || null : null;
  }

  /* ================= mission board ================= */
  function itemRows(m) {
    if (!m.items || !m.items.length) return '';
    let rows = '';
    if (m.key === 'review_line') {
      rows = m.items.map((it) =>
        '<div class="ms-item"><span>' + esc(it.label) + ' · ' + it.lines + ' ' + plural('line', it.lines) +
        (it.ageDays != null ? ' · <i>' + it.ageDays + 'd old</i>' : '') + '</span>' +
        '<button class="btn ghost small" data-act="invoice" data-id="' + esc(it.id) + '">Review</button></div>').join('');
    } else if (m.key === 'rescue_intake') {
      rows = m.items.map((it) =>
        '<div class="ms-item"><span>' + esc(it.label) + ' · ' + esc(it.status) +
        (it.ageDays != null ? ' · <i>' + it.ageDays + 'd</i>' : '') + '</span>' +
        (it.hasScan
          ? '<button class="btn ghost small warn" data-act="rescue" data-id="' + esc(it.id) + '"' + (busy.has(it.id) ? ' disabled' : '') + '>' + (busy.has(it.id) ? 'Reading…' : 'Re-read') + '</button>'
          : '<span class="ms-note">no scan on file</span>') + '</div>').join('');
    } else if (m.key === 'rule_guard') {
      rows = m.items.map((it) =>
        '<div class="ms-item"><span>' + esc(it.name) + ' · ' + fmtMoney(it.retail) + ' → <b>' + fmtMoney(it.rulePrice) + '</b>' +
        (it.belowCost ? ' <i class="bad">below cost</i>' : '') +
        (it.spikePct != null ? ' <i>cost +' + esc(String(it.spikePct)) + '%</i>' : '') + '</span>' +
        '<button class="btn ghost small" data-act="rule" data-id="' + esc(it.id) + '"' + (busy.has(it.id) ? ' disabled' : '') + '>' + (busy.has(it.id) ? 'Applying…' : 'Apply') + '</button></div>').join('');
    }
    const more = m.count > m.items.length ? '<div class="ms-note">+' + (m.count - m.items.length) + ' more</div>' : '';
    return '<div class="ms-items">' + rows + more + '</div>';
  }

  const GO_LABEL = { review: 'Go to Review Line', intake: 'Go to Intake Bay', aisles: 'Go to Aisles', vault: 'Open the Vault' };

  function missionCard(m) {
    const pr = PRIORITY[m.priority] || PRIORITY.normal;
    return '<section class="mission ' + pr.css + '" data-mission="' + esc(m.key) + '">' +
      '<div class="ms-head"><span class="ms-ico">' + (ICONS[m.key] || '') + '</span>' +
        '<div class="ms-titles"><div class="ms-title">' + esc(m.title) + '</div><span class="ms-pill">' + pr.label + '</span></div>' +
        '<div class="ms-count">' + (m.done ? '&#10003;' : esc(String(m.count))) +
          '<small>' + (m.done ? 'clear' : esc(m.countLabel || plural(m.unit, m.count) + ' left')) + '</small></div></div>' +
      '<p class="ms-brief">' + esc(m.brief) + '</p>' +
      (m.xpPotential ? '<div class="ms-xp">Up to <b>+' + m.xpPotential + ' XP</b> on the board</div>' : '') +
      (m.done ? '' : itemRows(m)) +
      '<div class="ms-actions"><button class="btn cy" data-act="go" data-zone="' + esc(m.zone) + '">' + esc(GO_LABEL[m.zone] || 'Go') + '</button></div>' +
    '</section>';
  }

  function healthStrip(h) {
    return '<button class="health-strip g-' + h.grade.toLowerCase() + '" data-act="health">' +
      '<span class="hs-score">' + h.score + '</span><span class="hs-text"><b>Dock integrity · ' + esc(h.status) + '</b>' +
      '<small>Grade ' + esc(h.grade) + ' · tap for the breakdown</small></span></button>';
  }

  function openBoard(focusKey = null, { keepScroll = false } = {}) {
    const g = state.game;
    if (!g) { hud.toast('Missions are still loading…'); return; }
    boardFocus = focusKey;
    const order = [...g.missions].sort((a, b) => {
      if (focusKey) {
        if (a.key === focusKey) return -1;
        if (b.key === focusKey) return 1;
      }
      return (PRIORITY[a.priority] || PRIORITY.normal).rank - (PRIORITY[b.priority] || PRIORITY.normal).rank;
    });
    const scroll = keepScroll ? $('panel').scrollTop : 0;
    hud.openPanel(
      '<div class="card-title">Mission Board</div>' +
      '<div class="card-sub">Live work queues — each clears when the real work is done.</div>' +
      healthStrip(g.health) + order.map(missionCard).join('') +
      '<div class="rule-plaque">XP comes from the audit trail: approvals, line exceptions, reprices and POS imports recorded under your sign-in.</div>'
    );
    claimPanel('board', scroll);
  }

  async function runRescue(id) {
    if (busy.has(id)) return;
    busy.add(id);
    if (gameViewActive() && openView === 'board') openBoard(boardFocus, { keepScroll: true });
    hud.toast('Re-reading the scan — this can take 30–90 seconds.');
    try {
      const res = await api.rescueInvoice(id);
      const n = res && res.lines ? res.lines.length : 0;
      hud.toast('<b>Scan rescued</b> — ' + n + ' ' + plural('line', n) + ' on the Review Line. Approve it for XP.', 'ok');
    } catch (e) {
      hud.toast('<b>Re-read failed:</b> ' + esc(e.message), 'err');
    } finally {
      busy.delete(id);
      await nav.refreshAll();
    }
  }

  async function runRule(id, allowDecrease = false) {
    if (busy.has(id)) return;
    busy.add(id);
    if (gameViewActive() && openView === 'board') openBoard(boardFocus, { keepScroll: true });
    try {
      const res = await api.applyRule(id, { allowDecrease });
      const name = res.product && res.product.name ? res.product.name : 'Item';
      hud.toast(res.unchanged
        ? esc(name) + ' already sits on the rule price.'
        : '<b>' + esc(name) + '</b> repriced ' + fmtMoney(res.previous) + ' → <b>' + fmtMoney(res.rulePrice) + '</b>.', 'ok');
    } catch (e) {
      hud.toast('<b>Could not apply the rule:</b> ' + esc(e.message), 'err');
    } finally {
      busy.delete(id);
      await nav.refreshAll();
    }
  }

  /* ================= player card ================= */
  function openPlayer({ keepScroll = false } = {}) {
    const g = state.game;
    if (!g) { hud.toast('Your stats are still loading…'); return; }
    const p = g.player;
    const pct = Math.round(p.progress * 100);
    const lb = (rows, key) => rows.length
      ? rows.map((r, i) => '<div class="lb-row' + (r.you ? ' you' : '') + '"><span class="lb-rank">' + (i + 1) + '</span>' +
          '<span class="lb-name">' + esc(r.name) + (r.you ? ' <i>you</i>' : '') + '</span><span class="lb-lv">LV ' + r.level + '</span>' +
          '<span class="lb-xp">' + r[key] + ' XP</span></div>').join('')
      : '<div class="ms-note">No scored work yet — the first approval puts a name on the board.</div>';
    const scroll = keepScroll ? $('panel').scrollTop : 0;
    hud.openPanel(
      '<div class="pc-head"><div class="pc-ring" style="--p:' + pct + '"><b>' + p.level + '</b><small>LV</small></div>' +
        '<div><div class="card-title">' + esc(p.scoring ? p.name : 'Operator') + '</div>' +
        '<div class="card-sub">' + esc(p.scoring ? p.title : 'Shared operator sign-in — not scoring') + '</div>' +
        '<div class="pc-xp">' + p.xp + ' XP' + (p.nextAt ? ' · ' + (p.nextAt - p.xp) + ' to ' + esc(p.nextTitle) : ' · top rank') + '</div></div></div>' +
      '<div class="stat-grid">' +
        '<div class="stat"><div class="v">' + p.streak.current + '</div><div class="k">day streak</div></div>' +
        '<div class="stat"><div class="v cy">' + p.todayXp + '</div><div class="k">XP today</div></div>' +
        '<div class="stat"><div class="v grn">' + p.weekXp + '</div><div class="k">XP this week</div></div>' +
      '</div>' +
      (p.streak.atRisk ? '<div class="blockers" style="color:var(--amber);border-color:rgba(255,176,32,.45);background:rgba(255,176,32,.08)">Streak at risk — one approval, rescue or reprice today keeps it alive.</div>' : '') +
      '<div class="card-sub" style="margin-top:14px">Badges</div><div class="badge-grid">' +
        p.badges.map((b) => '<div class="badge' + (b.earned ? ' earned' : '') + '" title="' + esc(b.desc) + '">' + ICONS.medal +
          '<b>' + esc(b.name) + '</b><small>' + esc(b.desc) + '</small>' +
          (b.earned ? '<i>' + esc(b.earnedAt ? fmtDate(b.earnedAt) : 'earned') + '</i>'
                    : '<span class="bg-bar"><span style="width:' + Math.round((b.value / b.goal) * 100) + '%"></span></span><i>' + b.value + ' / ' + b.goal + '</i>') +
        '</div>').join('') + '</div>' +
      '<div class="card-sub" style="margin-top:14px">This week</div>' + lb(g.leaderboard.week, 'weekXp') +
      '<div class="card-sub" style="margin-top:14px">All time</div>' + lb(g.leaderboard.allTime, 'xp') +
      '<div class="card-sub" style="margin-top:14px">Dock radio</div>' +
      (g.feed.length
        ? g.feed.map((f) => '<div class="feed-row"><b>' + esc(f.you ? 'You' : f.name) + '</b> ' + esc(f.label) +
            ' <span class="feed-xp">+' + f.xp + '</span> <span class="feed-at">' + esc(ago(f.at)) + '</span></div>').join('')
        : '<div class="ms-note">Quiet on the dock.</div>') +
      '<div class="card-sub" style="margin-top:14px">How XP works</div><div class="xp-rules">' +
        '<div>Approve an invoice <b>+' + g.rules.xp.invoiceApproved + '</b> · +' + g.rules.xp.perApprovedLine + ' per line · +' + g.rules.xp.pennyPerfect + ' if it reconciles to the cent</div>' +
        '<div>Catch a short or wrong line <b>+' + g.rules.xp.lineException + '</b> · Close a delivery that never came <b>+' + g.rules.xp.invoiceClosed + '</b></div>' +
        '<div>Reprice an item <b>+' + g.rules.xp.retailEdit + '</b> · Import POS sales <b>+' + g.rules.xp.posImport + '</b></div>' +
      '</div>'
    );
    claimPanel('player', scroll);
  }

  /* ================= health breakdown ================= */
  function openHealth({ keepScroll = false } = {}) {
    const g = state.game;
    if (!g) return;
    const h = g.health;
    const scroll = keepScroll ? $('panel').scrollTop : 0;
    hud.openPanel(
      '<div class="card-title">Dock integrity · ' + h.score + '</div>' +
      '<div class="card-sub">Grade ' + esc(h.grade) + ' · ' + esc(h.status) + ' — weighted from the live queues</div>' +
      h.components.map((c) => '<div class="hc-row"><div class="hc-top"><b>' + esc(c.label) + '</b><span>' + c.score + ' <small>× ' + c.weight + '%</small></span></div>' +
        '<div class="hc-bar"><span class="' + (c.score >= 75 ? 'ok' : c.score >= 50 ? 'mid' : 'bad') + '" style="width:' + c.score + '%"></span></div>' +
        '<div class="ms-note">' + esc(c.detail) + '</div></div>').join('') +
      '<div class="approve-row"><button class="btn cy" data-act="board">Open the Mission Board</button></div>'
    );
    claimPanel('health', scroll);
  }

  /* ================= wiring ================= */
  // hud.openPanel() clears panelBody.dataset.view, so any other module's card
  // (invoice, product, vault) automatically ends the game view.
  function claimPanel(view, scroll) {
    $('panelBody').dataset.view = 'game';
    $('panel').scrollTop = scroll || 0;
    openView = view;
  }
  function gameViewActive() {
    return !$('panel').classList.contains('hidden') && $('panelBody').dataset.view === 'game';
  }

  $('panelBody').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn || !gameViewActive()) return;
    const act = btn.dataset.act;
    if (act === 'go') { openView = null; nav.goZone(btn.dataset.zone); }
    else if (act === 'invoice') { openView = null; nav.goZone('review'); hud.showInvoice(btn.dataset.id); }
    else if (act === 'rescue') runRescue(btn.dataset.id);
    else if (act === 'rule') runRule(btn.dataset.id);
    else if (act === 'health') openHealth();
    else if (act === 'board') openBoard();
  });
  $('missionsBtn').addEventListener('click', () => openBoard());
  $('phLevel').addEventListener('click', () => openPlayer());
  $('phMain').addEventListener('click', () => openPlayer());
  $('phStreak').addEventListener('click', () => openPlayer());
  $('phHealth').addEventListener('click', () => openHealth());

  function handlePick(pick) {
    if (pick.type === 'mission') openBoard(pick.key);
    else if (pick.type === 'stuckScan') openBoard('rescue_intake');
  }

  return { refresh, openBoard, openPlayer, openHealth, handlePick, mission, runRule };
}
