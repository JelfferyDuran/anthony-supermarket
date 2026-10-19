/* Per-zone logic: binds backend data to 3D objects and handles taps.
   world.js builds the set; this file runs the show. */

import * as THREE from 'three';
import {
  state, queueInvoices, lineDesc, lineUnitCost, lineTotal,
  fmtMoney, productName, productCost, productRetail,
} from './api.js';
import { PALETTE } from './world.js';

const MAX_REVIEW_PKGS = 8;
const MAX_AISLE_BOXES = 48;

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function createZones(world, hooks) {
  const reviewGroup = new THREE.Group();
  world.scene.add(reviewGroup);
  const aisleGroup = new THREE.Group();
  world.scene.add(aisleGroup);

  const reviewPkgs = new Map();   // invoiceId -> group
  const productBoxes = new Map(); // productId -> mesh
  const floaters = [];           // {obj, baseY, phase, amp}
  const hitGeoBox = new THREE.BoxGeometry(2.8, 2.8, 2.8);
  const hitGeoSmall = new THREE.BoxGeometry(2.4, 2.4, 2.4);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false }); // raycastable, invisible

  world.onFrame((_, t) => {
    for (const f of floaters) {
      f.obj.position.y = f.baseY + Math.sin(t * 1.4 + f.phase) * f.amp;
      f.obj.rotation.y += 0.003;
    }
    // Rule Guard items pulse red until they are repriced (unless a search
    // highlight is driving the boxes right now).
    if (!highlightActive) {
      for (const m of productBoxes.values()) {
        if (m.userData.leak) m.material.emissiveIntensity = 0.45 + Math.max(0, Math.sin(t * 4)) * 0.75;
      }
    }
  });
  let highlightActive = false;

  // Products the Rule Guard mission says sell under retail = cost x 1.70.
  function leakIds() {
    const m = state.game && state.game.missions ? state.game.missions.find((x) => x.key === 'rule_guard') : null;
    return new Set(m ? m.items.map((i) => i.id) : []);
  }

  /* ================= REVIEW LINE ================= */
  function refreshReview() {
    const invoices = queueInvoices();
    const seen = new Set();

    invoices.slice(0, MAX_REVIEW_PKGS).forEach((inv, i) => {
      seen.add(inv.id);
      let g = reviewPkgs.get(inv.id);
      if (!g) {
        g = world.spawnPackage();
        const slot = world.anchors.reviewSlots[i % world.anchors.reviewSlots.length];
        g.position.copy(slot);
        // crisp HTML invoice tag (anchored, follows the package)
        const tag = world.addLabel(
          '#' + String(inv.number).slice(0, 14) + ' · ' + inv.lines.length + ' LINES',
          { cls: 'fl-tag', at: g, dy: 1.5, maxDist: 60, zone: 'review' }
        );
        g.userData.tag = tag;
        // generous invisible tap target
        const proxy = new THREE.Mesh(hitGeoBox, hitMat);
        proxy.userData.pick = { type: 'reviewPkg', invoiceId: inv.id };
        g.add(proxy);
        g.userData.proxy = proxy;
        reviewGroup.add(g);
        reviewPkgs.set(inv.id, g);
        floaters.push({ obj: g, baseY: slot.y, phase: Math.random() * 6.28, amp: 0.18 });
        world.pickables.review.push(proxy);
      } else {
        const slot = world.anchors.reviewSlots[i % world.anchors.reviewSlots.length];
        g.position.set(slot.x, g.position.y, slot.z);
        const f = floaters.find((x) => x.obj === g);
        if (f) f.baseY = slot.y;
      }
    });

    // remove packages that are no longer queued
    for (const [id, g] of [...reviewPkgs]) {
      if (!seen.has(id)) {
        reviewGroup.remove(g);
        if (g.userData.tag) g.userData.tag.remove();
        reviewPkgs.delete(id);
        const fi = floaters.findIndex((x) => x.obj === g);
        if (fi >= 0) floaters.splice(fi, 1);
        world.pickables.review = world.pickables.review.filter((m) => m !== g.userData.proxy);
      }
    }

    const extra = invoices.length - MAX_REVIEW_PKGS;
    hooks.setReviewBadge(invoices.length);
    return invoices.length;
  }

  // Celebrate an approval: fly the package to the vault with a particle burst.
  function celebrateApproval(invoiceId, done) {
    const g = reviewPkgs.get(invoiceId);
    if (!g) { if (done) done(); return; }
    reviewPkgs.delete(invoiceId);
    const fi = floaters.findIndex((x) => x.obj === g);
    if (fi >= 0) floaters.splice(fi, 1);
    world.pickables.review = world.pickables.review.filter((m) => m !== g.userData.proxy);

    const from = g.position.clone();
    const to = new THREE.Vector3(0, 5, 42); // vault door
    const peak = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 14, 0));
    const curve = new THREE.QuadraticBezierCurve3(from, peak, to);
    let t = 0;
    let stop = null;
    const step = (dt) => {
      t += dt / 1.4;
      if (t >= 1) {
        reviewGroup.remove(g);
        world.scene.remove(g);
        if (g.userData.tag) g.userData.tag.remove();
        world.burst(to, PALETTE.green, 60, 7);
        world.burst(to, PALETTE.amber, 30, 5);
        if (stop) stop();
        if (done) done();
        return;
      }
      g.position.copy(curve.getPoint(Math.min(1, t)));
      g.rotation.y += dt * 6;
      const s = 1 - t * 0.4;
      g.scale.set(s, s, s);
    };
    // lift out of the review group into the scene so it can travel
    reviewGroup.remove(g);
    world.scene.add(g);
    stop = world.onFrame(step);
  }

  /* ================= AISLES ================= */
  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  const boxPalette = [0x8a6b42, 0x6e7f96, 0x7d8a5a, 0x96706e, 0x5a7d8a, 0x8a5a7d];

  function refreshAisles() {
    // clear
    for (const [, m] of [...productBoxes]) {
      aisleGroup.remove(m);
      if (m.userData.hit) aisleGroup.remove(m.userData.hit);
    }
    productBoxes.clear();
    world.pickables.aisles.length = 0;

    // The shelves hold 48 boxes; work comes first — Rule Guard items, then
    // owner-flagged items, then the rest of the catalog.
    const leaks = leakIds();
    const rank = (p) => (leaks.has(p.id) ? 0 : p.flagged ? 1 : 2);
    const items = [...state.products].sort((a, b) => rank(a) - rank(b)).slice(0, MAX_AISLE_BOXES);
    const rows = world.anchors.shelfRows;
    const geo = new THREE.BoxGeometry(1.15, 0.95, 1.15);
    items.forEach((p, i) => {
      const row = rows[i % rows.length];
      const board = row.boards[Math.floor(i / rows.length) % row.boards.length];
      const perBoard = Math.ceil(items.length / (rows.length * row.boards.length));
      const slotInBoard = Math.floor(i / (rows.length * row.boards.length)) % perBoard;
      const x = -8 + slotInBoard * (16 / Math.max(1, perBoard - 1 || 1));
      const color = boxPalette[hashStr(productName(p)) % boxPalette.length];
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, board + 0.48, row.z);
      m.castShadow = true;
      m.userData.leak = leaks.has(p.id);
      if (m.userData.leak) mat.emissive.setHex(PALETTE.red);
      aisleGroup.add(m);
      // invisible, generous tap target (well over 48px on phones)
      const hit = new THREE.Mesh(hitGeoSmall, hitMat);
      hit.position.copy(m.position);
      hit.userData.pick = { type: 'product', productId: p.id };
      aisleGroup.add(hit);
      m.userData.hit = hit;
      productBoxes.set(p.id, m);
      world.pickables.aisles.push(hit);
    });
    return items.length;
  }

  function highlightProducts(ids) {
    const set = new Set(ids);
    const any = set.size > 0;
    highlightActive = any;
    for (const [id, m] of productBoxes) {
      if (!any) {
        m.material.emissive.setHex(m.userData.leak ? PALETTE.red : 0x000000);
        m.material.emissiveIntensity = m.userData.leak ? 0.6 : 0;
        m.scale.set(1, 1, 1);
      } else if (set.has(id)) {
        m.material.emissive.setHex(PALETTE.amber);
        m.material.emissiveIntensity = 0.9;
        m.scale.set(1.25, 1.25, 1.25);
      } else {
        m.material.emissive.setHex(0x000000);
        m.material.emissiveIntensity = 0;
        m.scale.set(0.85, 0.85, 0.85);
      }
    }
  }

  /* ================= VAULT ================= */
  function refreshVault() {
    const s = (state.financials && state.financials.summary) || {};
    const pick = (keys) => {
      for (const k of keys) {
        const v = num(s[k]);
        if (v != null) return v;
      }
      return null;
    };
    const revenue = pick(['gross_sales', 'revenue', 'total_revenue', 'sales', 'total_sales']);
    const cost = pick(['cost_of_goods', 'cost', 'total_cost', 'cogs', 'total_cogs']);
    const profit = pick(['profit', 'total_profit', 'gross_profit', 'net_profit']);
    world.anchors.setVaultBars([
      { key: 'revenue', value: revenue, text: fmtMoney(revenue) },
      { key: 'cost', value: cost, text: fmtMoney(cost) },
      { key: 'profit', value: profit, text: fmtMoney(profit) },
    ]);
    return { revenue, cost, profit, raw: s };
  }

  /* ================= DOCK HOLOGRAM ================= */
  function refreshHolo() {
    const invoices = queueInvoices();
    const awaiting = invoices.length;
    const nProducts = state.products.length;
    let catalogValue = 0;
    for (const p of state.products) {
      const r = productRetail(p);
      if (r != null) catalogValue += r;
    }
    const g = state.game;
    world.anchors.updateHolo([
      ...(g ? [`DOCK INTEGRITY  ${g.health.score} · ${g.health.grade}`] : []),
      `AWAITING REVIEW  ${awaiting}`,
      `CATALOG  ${nProducts} items · ${fmtMoney(catalogValue)}`,
    ]);
  }

  /* ================= picks ================= */
  function handlePick(pick) {
    if (!pick) return;
    if (pick.type === 'portal') hooks.goZone(pick.zone);
    else if (pick.type === 'tray') hooks.openUpload();
    else if (pick.type === 'reviewPkg') hooks.showInvoice(pick.invoiceId);
    else if (pick.type === 'product') hooks.showProduct(pick.productId);
    else if (hooks.onPick) hooks.onPick(pick); // game layer: beacons, stuck scans
  }

  return {
    refreshReview, refreshAisles, refreshVault, refreshHolo,
    highlightProducts, celebrateApproval, handlePick,
    reviewPkgs, productBoxes,
  };
}
