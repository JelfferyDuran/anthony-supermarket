/* HUD: HTML overlay — sign-in gate, top bar, zone nav, FAB, upload flow,
   sliding detail panels, toasts. Readable text lives here; 3D is the stage. */

import * as THREE from 'three';
import {
  api, state, queueInvoices, invoiceOf, lineDesc, lineUnitCost, lineTotal,
  lineProposedRetail, retailFromCost, productName, productCost, productRetail,
  fmtMoney, fmtDate,
} from './api.js';

const $ = (id) => document.getElementById(id);

export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function createHud(world, zones, nav) {
  // nav: { goZone(zone), refreshAll(), currentZone() }

  /* ---------- toasts ---------- */
  function toast(msg, kind = '') {
    const box = $('toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.innerHTML = msg;
    box.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .4s'; }, 3600);
    setTimeout(() => el.remove(), 4100);
  }

  /* ---------- panel ---------- */
  function openPanel(html) {
    delete $('panelBody').dataset.view;
    $('panelBody').innerHTML = html;
    $('panel').classList.remove('hidden');
    $('panelScrim').classList.remove('hidden');
  }
  function closePanel() {
    $('panel').classList.add('hidden');
    $('panelScrim').classList.add('hidden');
    $('panelBody').innerHTML = '';
  }
  $('panelClose').addEventListener('click', closePanel);
  $('panelScrim').addEventListener('click', closePanel);

  /* ---------- top bar / nav ---------- */
  const ZONE_LABELS = { dock: 'DOCK', intake: 'INTAKE BAY', review: 'REVIEW LINE', aisles: 'AISLES', vault: 'VAULT' };
  function setZone(zone) {
    $('zoneName').textContent = ZONE_LABELS[zone] || zone.toUpperCase();
    document.querySelectorAll('.znav').forEach((b) => {
      b.classList.toggle('active', b.dataset.zone === zone);
    });
    // aisle search only makes sense in the aisles
    const sb = $('aisleSearch');
    if (sb) sb.classList.toggle('hidden', zone !== 'aisles');
    if (zone !== 'aisles') zones.highlightProducts([]);
  }
  function setUser(email) {
    $('userEmail').textContent = email || '';
  }
  function setReviewBadge(n) {
    const b = $('reviewBadge');
    b.textContent = String(n);
    b.classList.toggle('hidden', n === 0);
  }
  function setCleared(n) {
    $('clearedCount').textContent = String(n);
  }
  document.querySelectorAll('.znav').forEach((b) => {
    b.addEventListener('click', () => nav.goZone(b.dataset.zone));
  });
  $('signoutBtn').addEventListener('click', () => {
    api.signOut();
    location.reload();
  });

  /* ---------- sign-in ---------- */
  async function doSignin() {
    const email = $('signinEmail').value.trim();
    const password = $('signinPassword').value;
    const errBox = $('signinError');
    errBox.textContent = '';
    if (!email || !password) { errBox.textContent = 'Enter your email and password.'; return; }
    $('signinBtn').disabled = true;
    $('signinBtn').textContent = 'Signing in…';
    try {
      const user = await api.login(email, password);
      $('signin').classList.add('hidden');
      setUser(user.email);
      toast('Signed in as <b>' + esc(user.email) + '</b> — session lasts 30 days.', 'ok');
      await nav.refreshAll();
    } catch (e) {
      errBox.textContent = e.message; // server's message, verbatim
    } finally {
      $('signinBtn').disabled = false;
      $('signinBtn').textContent = 'Sign in';
    }
  }
  $('signinBtn').addEventListener('click', doSignin);
  $('signinPassword').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSignin(); });
  $('signinEmail').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSignin(); });
  function showSignin(msg) {
    if (msg) $('signinError').textContent = msg;
    $('signin').classList.remove('hidden');
  }

  /* ---------- aisle search (dynamic, only visible in aisles) ---------- */
  const searchBar = document.createElement('div');
  searchBar.id = 'aisleSearch';
  searchBar.className = 'hidden';
  searchBar.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>' +
    '<input id="aisleSearchInput" type="search" placeholder="Search products…" autocomplete="off">';
  document.body.appendChild(searchBar);
  searchBar.querySelector('input').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) { zones.highlightProducts([]); return; }
    const ids = state.products
      .filter((p) => (productName(p) + ' ' + (p.upc || '')).toLowerCase().includes(q))
      .map((p) => p.id);
    zones.highlightProducts(ids);
    if (!ids.length) toast('No products match "' + esc(q) + '".');
  });

  /* ---------- upload flow ---------- */
  const picker = $('filePicker');
  function openUpload() {
    nav.goZone('intake');
    // picker.click() must run synchronously inside the tap gesture or iOS
    // Safari will refuse to open the file chooser.
    picker.click();
  }
  $('fab').addEventListener('click', openUpload);
  picker.addEventListener('change', () => {
    if (picker.files && picker.files[0]) handleFile(picker.files[0]);
    picker.value = '';
  });

  const OK_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

  function setUploadProgress(frac, phase) {
    const ring = $('uploadRing');
    if (phase === 'extract') {
      $('uploadTitle').textContent = 'Extracting lines…';
      $('uploadSub').textContent = 'Reading the invoice — this can take 30–90 seconds.';
      ring.classList.add('spin');
      ring.style.setProperty('--p', 100);
      $('uploadPct').textContent = '…';
      world.anchors.progRing.visible = true;
    } else {
      const pct = Math.round(frac * 100);
      ring.style.setProperty('--p', pct);
      $('uploadPct').textContent = pct + '%';
      $('uploadTitle').textContent = 'Uploading…';
      $('uploadSub').textContent = $('uploadSub').textContent || 'Sending to the hub.';
    }
  }

  function flyObject(obj, curve, dur, done) {
    let t = 0;
    let stop = null;
    const step = (dt) => {
      t += dt / dur;
      if (t >= 1) { if (stop) stop(); if (done) done(); return; }
      obj.position.copy(curve.getPoint(Math.min(1, t)));
      obj.rotation.y += dt * 3;
    };
    stop = world.onFrame(step);
  }

  async function handleFile(file) {
    if (!OK_TYPES.has(file.type)) { toast('Only PDF, JPEG, PNG or WebP invoices.', 'err'); return; }
    if (file.size > 10 * 1024 * 1024) { toast('That file is over the 10 MB limit.', 'err'); return; }

    nav.goZone('intake');
    const tray = world.anchors.trayPos.clone();

    // the package drops into the inbox tray
    const pkg = world.spawnPackage();
    pkg.position.set(tray.x, 15, tray.z + 7);
    world.scene.add(pkg);
    flyObject(pkg,
      new THREE.QuadraticBezierCurve3(
        pkg.position.clone(),
        new THREE.Vector3(tray.x, 10, tray.z + 3.5),
        tray.clone()
      ), 0.9,
      () => { world.burst(tray, 0x22d3ee, 24, 4); });

    // upload HUD
    $('uploadHud').classList.remove('hidden');
    $('uploadRing').classList.remove('spin');
    $('uploadRing').style.setProperty('--p', 0);
    $('uploadPct').textContent = '0%';
    $('uploadTitle').textContent = 'Uploading…';
    $('uploadSub').textContent = esc(file.name);
    const ctrl = new AbortController();
    $('uploadCancel').onclick = () => ctrl.abort();
    let extracting = false;

    try {
      const res = await api.uploadInvoice(file, {}, {
        signal: ctrl.signal,
        onProgress: (f, phase) => {
          if (!extracting && f >= 0.999) { extracting = true; setUploadProgress(1, 'extract'); }
          else if (!extracting) setUploadProgress(f, 'upload');
        },
      });
      world.anchors.progRing.visible = false;

      if (res && res.duplicate) {
        world.scene.remove(pkg);
        await nav.refreshAll();
        if (res.rescuable) {
          toast('<b>Already stored, but never read</b> — re-read it from the Rescue mission.', 'err');
          nav.openMissions('rescue_intake');
          return;
        }
        toast('<b>Already in the system</b> — showing the existing invoice.', 'ok');
        showInvoice(res.invoice.id);
        return;
      }
      if (res && (res.code === 'OCR_NOT_CONFIGURED' || res.warning)) {
        world.scene.remove(pkg);
        await nav.refreshAll();
        toast('<b>Stored, but no lines extracted:</b> ' + esc(res.warning || 'OCR is not configured.'), 'err');
        if (res.invoice) showInvoice(res.invoice.id);
        return;
      }

      // success: the package rides to the review line
      const slot = world.anchors.reviewSlots[0].clone();
      flyObject(pkg,
        new THREE.QuadraticBezierCurve3(
          tray.clone(),
          tray.clone().lerp(slot, 0.5).add(new THREE.Vector3(0, 16, 0)),
          slot.clone()
        ), 1.3,
        async () => {
          world.scene.remove(pkg);
          world.burst(slot, 0xffb020, 30, 5);
          await nav.refreshAll();
          toast('<b>Invoice extracted</b> — ' + (res.lines ? res.lines.length : 0) + ' lines on the review line.', 'ok');
          if (res.invoice) showInvoice(res.invoice.id);
        });
    } catch (e) {
      world.anchors.progRing.visible = false;
      world.scene.remove(pkg);
      if (/cancelled/i.test(e.message)) toast('Upload cancelled.');
      else {
        toast('<b>Upload failed:</b> ' + esc(e.message) +
          ' — if the scan was stored, it waits in the Rescue mission.', 'err');
        nav.refreshAll();
      }
    } finally {
      $('uploadHud').classList.add('hidden');
    }
  }

  /* ================= invoice review card ================= */
  const matchState = new Map(); // lineId -> product

  // Review working state. review_status persists to the DB immediately via
  // PATCH /invoices/:id/lines so work survives a closed phone; _excKind,
  // _editCases and _editCost are the card's working copy for this session.
  function lineExcluded(l) { return l.review_status === 'rejected'; }
  function excKind(l) { return l._excKind || 'rejected'; }
  function excLabel(l) {
    return excKind(l) === 'short' ? 'SHORT — box did not arrive' : 'REJECTED — wrong line';
  }
  function effCases(l) {
    if (l._editCases != null) return l._editCases;
    const v = Number(l.case_quantity);
    return Number.isFinite(v) ? v : 0;
  }
  function effCost(l) {
    if (l._editCost != null) return l._editCost;
    return lineUnitCost(l); // may be null; the server guards a null cost
  }
  function effTotal(l) {
    const c = effCost(l);
    if ((l._editCases != null || l._editCost != null) && c != null) {
      const upc = Number(l.units_per_case) || 0;
      if (upc > 0) return Math.round(effCases(l) * upc * c * 100) / 100;
    }
    return lineTotal(l) || 0;
  }
  function effRetail(l) {
    if (l._editCost != null) return retailFromCost(l._editCost);
    return lineProposedRetail(l);
  }

  function showInvoice(invoiceId) {
    const inv = queueInvoices().find((x) => String(x.id) === String(invoiceId));
    if (!inv) { toast('That invoice is no longer in the review queue.'); return; }

    const active = inv.lines.filter((l) => !lineExcluded(l));
    const excluded = inv.lines.filter(lineExcluded);
    const approvedTotal = active.reduce((s, l) => s + effTotal(l), 0);
    const excludedTotal = excluded.reduce((s, l) => s + effTotal(l), 0);
    const matchedCount = active.filter((l) => l.matched_product_id || matchState.get(l.id)).length;
    const printed = inv.subtotal;
    const variance = printed != null ? Math.round((printed - approvedTotal) * 100) / 100 : null;
    const reconciles = variance != null && Math.abs(variance) <= 0.01;

    const rows = inv.lines.map((l, idx) => {
      const out = lineExcluded(l);
      const matched = l.matched_product_id || (matchState.get(l.id) || {}).id;
      const cost = effCost(l);
      const total = effTotal(l);
      const proposed = effRetail(l);
      const qty = [effCases(l) ? effCases(l) + ' case(s)' : null,
                   l.units_per_case ? '× ' + l.units_per_case + ' units' : null].filter(Boolean).join(' ');
      // A matched product without a barcode gets a "Find UPC" action — the
      // lookup runs against the public database, no POS access needed.
      const prodForUpc = matched ? state.products.find((p) => String(p.id) === String(matched)) : null;
      const needsUpc = matched && !(prodForUpc && prodForUpc.upc);

      if (out) {
        return '<div class="line-row excluded" data-line="' + idx + '">' +
          '<div class="lr-top"><span class="lr-name">' + esc(lineDesc(l)) + '</span>' +
          '<span class="lr-total">' + fmtMoney(total) + '</span></div>' +
          '<div class="lr-meta">' + esc(['line ' + (l.line_number != null ? l.line_number : idx + 1), qty,
              cost != null ? 'unit cost ' + fmtMoney(cost) : null,
              l.vendor_sku ? 'SKU ' + l.vendor_sku : null].filter(Boolean).join(' · ')) + '</div>' +
          '<div><span class="exc-badge' + (excKind(l) === 'short' ? ' short' : '') + '">' + esc(excLabel(l)) + '</span></div>' +
          (l.review_reason ? '<div class="lr-meta">' + esc(l.review_reason) + '</div>' : '') +
          '<div class="lr-actions"><button class="btn ghost small" data-undo="' + idx + '">Undo — put back in review</button></div>' +
        '</div>';
      }

      return '<div class="line-row' + (matched ? '' : ' unmatched') + '" data-line="' + idx + '">' +
        '<div class="lr-top"><span class="lr-name">' + esc(lineDesc(l)) + '</span>' +
        '<span class="lr-total">' + fmtMoney(total) + '</span></div>' +
        '<div class="lr-meta">' + esc(['line ' + (l.line_number != null ? l.line_number : idx + 1), qty,
            cost != null ? 'unit cost ' + fmtMoney(cost) : null,
            l.vendor_sku ? 'SKU ' + l.vendor_sku : null].filter(Boolean).join(' · ')) + '</div>' +
        (l.review_reason ? '<div class="lr-reason">' + esc(l.review_reason) + '</div>' : '') +
        '<div class="lr-meta">Proposed retail <b style="color:var(--cyan)">' + fmtMoney(proposed) + '</b>' +
        (matched ? ' · matched: <b style="color:var(--green)">' + esc((matchState.get(l.id) || {}).name || 'catalog item') + '</b>' : ' · <b style="color:var(--red)">needs product match</b>') + '</div>' +
        (matched ? '' :
          '<div class="lr-match"><input type="search" placeholder="Type to match a product…" data-matchinput="' + idx + '" autocomplete="off"></div>' +
          '<div data-matchresults="' + idx + '"></div>') +
        '<div class="lr-meta" style="margin-top:6px">Retail $ <input data-retail="' + idx + '" type="number" step="0.01" min="0" value="' +
          (proposed != null ? proposed.toFixed(2) : '') + '" style="width:90px;background:var(--bg);border:1px solid #2a3446;border-radius:6px;color:var(--ink);padding:5px 7px;font-family:var(--mono)"></div>' +
        '<div class="lr-edit"><label>Cases <input data-cases="' + idx + '" type="number" step="any" min="0" value="' + effCases(l) + '"></label>' +
        '<label>Unit cost $ <input data-cost="' + idx + '" type="number" step="0.01" min="0" value="' + (cost != null ? cost : '') + '" placeholder="—"></label></div>' +
        '<div class="lr-actions">' +
          '<button class="btn ghost small warn" data-short="' + idx + '">Didn\'t arrive</button>' +
          '<button class="btn ghost small" data-reject="' + idx + '">Wrong line</button>' +
          (needsUpc ? '<button class="btn ghost small cy" data-findupc="' + idx + '">Find UPC</button>' : '') +
        '</div>' +
        (needsUpc ? '<div data-upcresults="' + idx + '" style="margin-top:6px"></div>' : '') +
      '</div>';
    }).join('');

    const approveLabel = active.length
      ? 'Approve ' + active.length + ' line' + (active.length === 1 ? '' : 's') + ' · ' + fmtMoney(approvedTotal)
      : 'Close invoice — nothing received';

    openPanel(
      '<div class="card-title">Invoice #' + esc(inv.number) + '</div>' +
      '<div class="card-sub">' + esc([fmtDate(inv.date), inv.status].filter(Boolean).join(' · ')) + '</div>' +
      '<div class="stat-grid">' +
        '<div class="stat"><div class="v">' + inv.lines.length + '</div><div class="k">lines</div></div>' +
        '<div class="stat"><div class="v cy">' + fmtMoney(approvedTotal) + '</div><div class="k">to approve</div></div>' +
        '<div class="stat"><div class="v grn">' + matchedCount + '</div><div class="k">matched</div></div>' +
      '</div>' +
      (printed != null
        ? '<div class="recon-strip">Printed total <b>' + fmtMoney(printed) + '</b>' +
          (excluded.length ? ' · Excluded <b>' + fmtMoney(excludedTotal) + '</b>' : '') +
          ' · ' + (reconciles
            ? '<b style="color:var(--green)">Reconciles</b>'
            : '<b style="color:var(--red)">Variance ' + fmtMoney(variance) + '</b>') +
          '</div>'
        : '') +
      '<div id="approveBlockers"></div>' +
      rows +
      '<div class="approve-row"><button class="btn primary" id="approveBtn">' + esc(approveLabel) + '</button></div>' +
      (excluded.length ? '<div class="lr-meta" style="margin-top:8px">' + excluded.length + ' line(s) excluded — they stay on the record but won\'t be priced.</div>' : '') +
      '<div class="rule-plaque">Pricing rule · retail = <b>unit cost × 1.70</b>, shelf-rounded to .99</div>'
    );

    // product matching
    $('panelBody').querySelectorAll('[data-matchinput]').forEach((input) => {
      input.addEventListener('input', () => {
        const idx = Number(input.dataset.matchinput);
        const line = inv.lines[idx];
        const box = $('panelBody').querySelector('[data-matchresults="' + idx + '"]');
        const q = input.value.trim().toLowerCase();
        if (!q) { box.innerHTML = ''; return; }
        const hits = state.products
          .filter((p) => (productName(p) + ' ' + (p.upc || '')).toLowerCase().includes(q))
          .slice(0, 6);
        box.innerHTML = hits.map((p, hi) =>
          '<button class="match-pick" data-pick="' + idx + ':' + hi + '">' +
          '<span>' + esc(productName(p)) + '</span><small>' + fmtMoney(productCost(p)) + '</small></button>'
        ).join('') || '<div class="lr-meta">No matches.</div>';
        box.querySelectorAll('[data-pick]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const [li, pi] = btn.dataset.pick.split(':').map(Number);
            const prod = state.products.filter((p) =>
              (productName(p) + ' ' + (p.upc || '')).toLowerCase().includes(q)).slice(0, 6)[pi];
            matchState.set(inv.lines[li].id, { id: prod.id, name: productName(prod) });
            showInvoice(invoiceId); // re-render with the match
          });
        });
      });
    });

    // qty / cost corrections — 'change' (not 'input') so re-render doesn't steal focus
    $('panelBody').querySelectorAll('[data-cases]').forEach((input) => {
      input.addEventListener('change', () => {
        const idx = Number(input.dataset.cases);
        const v = num(input.value);
        inv.lines[idx]._editCases = (v != null && v >= 0) ? v : null;
        showInvoice(invoiceId);
      });
    });
    $('panelBody').querySelectorAll('[data-cost]').forEach((input) => {
      input.addEventListener('change', () => {
        const idx = Number(input.dataset.cost);
        const v = num(input.value);
        inv.lines[idx]._editCost = (v != null && v >= 0) ? v : null;
        showInvoice(invoiceId);
      });
    });

    // line exceptions — persisted immediately so nothing is lost mid-review
    async function setExcluded(idx, kind, note) {
      const line = inv.lines[idx];
      try {
        await api.updateLineReviews(inv.id, [{ id: line.id, review_status: 'rejected', review_note: note }]);
        line.review_status = 'rejected';
        line._excKind = kind;
        line.review_reason = note;
        showInvoice(invoiceId);
      } catch (e) { toast('Could not update line: ' + e.message, 'err'); }
    }
    $('panelBody').querySelectorAll('[data-short]').forEach((btn) => {
      btn.addEventListener('click', () => setExcluded(Number(btn.dataset.short), 'short', 'Short — box did not arrive'));
    });
    $('panelBody').querySelectorAll('[data-reject]').forEach((btn) => {
      btn.addEventListener('click', () => setExcluded(Number(btn.dataset.reject), 'rejected', 'Rejected by manager — wrong/duplicate line'));
    });
    $('panelBody').querySelectorAll('[data-undo]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const idx = Number(btn.dataset.undo);
        const line = inv.lines[idx];
        try {
          await api.updateLineReviews(inv.id, [{ id: line.id, review_status: 'needs_review' }]);
          line.review_status = 'needs_review';
          line._excKind = null;
          line.review_reason = null;
          showInvoice(invoiceId);
        } catch (e) { toast('Could not reopen line: ' + e.message, 'err'); }
      });
    });

    // UPC lookup — resolves the matched product's barcode from the public
    // database (no POS access needed) and saves the manager's pick.
    $('panelBody').querySelectorAll('[data-findupc]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const idx = Number(btn.dataset.findupc);
        const line = inv.lines[idx];
        const prodId = line.matched_product_id || (matchState.get(line.id) || {}).id;
        if (!prodId) { toast('Match a product first, then find its UPC.'); return; }
        const box = $('panelBody').querySelector('[data-upcresults="' + idx + '"]');
        btn.disabled = true;
        box.innerHTML = '<div class="lr-meta">Looking up barcodes…</div>';
        try {
          const cands = await api.lookupUpc(lineDesc(line));
          if (!cands.length) {
            box.innerHTML = '<div class="lr-meta">No barcodes found online — scan the package instead.</div>';
          } else {
            box.innerHTML = cands.map((c, ci) =>
              '<button class="match-pick" data-upcpick="' + idx + ':' + ci + '">' +
              '<span><b>' + esc(c.code) + '</b> — ' + esc(c.name || 'unknown product') + '</span>' +
              (c.brands ? '<small>' + esc(c.brands) + '</small>' : '') + '</button>'
            ).join('');
            box.querySelectorAll('[data-upcpick]').forEach((pick) => {
              pick.addEventListener('click', async () => {
                const parts = pick.dataset.upcpick.split(':').map(Number);
                const cand = cands[parts[1]];
                const ln = inv.lines[parts[0]];
                const pid = ln.matched_product_id || (matchState.get(ln.id) || {}).id;
                pick.disabled = true;
                try {
                  await api.setProductUpc(pid, cand.code);
                  const sp = state.products.find((p) => String(p.id) === String(pid));
                  if (sp) sp.upc = cand.code;
                  toast('<b>UPC saved</b> — ' + esc(cand.code), 'ok');
                  nav.refreshGame();
                  showInvoice(invoiceId);
                } catch (e) {
                  toast('Could not save UPC: ' + e.message, 'err');
                  pick.disabled = false;
                }
              });
            });
          }
        } catch (e) {
          box.innerHTML = '<div class="lr-meta">Lookup failed: ' + esc(e.message) + '</div>';
        } finally {
          if (btn.isConnected) btn.disabled = false;
        }
      });
    });

    $('approveBtn').addEventListener('click', async () => {
      const btn = $('approveBtn');
      btn.disabled = true;

      // Every line excluded: close the invoice instead of approving nothing.
      if (!active.length) {
        btn.textContent = 'Closing…';
        try {
          await api.updateLineReviews(inv.id, [], true);
          for (const l of inv.lines) matchState.delete(l.id);
          closePanel();
          await nav.refreshAll();
          toast('<b>Invoice closed</b> — every line was excluded, nothing was priced.', 'ok');
        } catch (e) {
          toast(e.message, 'err');
          btn.disabled = false;
          btn.textContent = approveLabel;
        }
        return;
      }

      btn.textContent = 'Approving…';
      const lines = [];
      inv.lines.forEach((l, idx) => {
        if (lineExcluded(l)) return; // excluded lines stay on the record, out of the approval
        const retailInput = $('panelBody').querySelector('[data-retail="' + idx + '"]');
        const retailVal = retailInput ? num(retailInput.value) : null;
        lines.push({
          id: l.id,
          invoice_line_id: l.id,
          line_number: l.line_number,
          product_id: l.matched_product_id || (matchState.get(l.id) || {}).id || null,
          unit_cost: effCost(l),
          line_total: effTotal(l),
          retail_price: retailVal != null ? retailVal : effRetail(l),
          internal: !!l.internal,
        });
      });
      try {
        await api.approveInvoice(inv.id, lines);
        for (const l of inv.lines) matchState.delete(l.id);
        state.cleared += 1;
        setCleared(state.cleared);
        closePanel();
        zones.celebrateApproval(inv.id, async () => { await nav.refreshAll(); });
        toast('<b>Invoice approved</b> — prices are live.', 'ok');
      } catch (e) {
        const blockers = e.data && Array.isArray(e.data.blockers) ? e.data.blockers : null;
        $('approveBlockers').innerHTML = '<div class="blockers"><b>Not ready to approve:</b><ul>' +
          (blockers ? blockers.map((b) => '<li>' + esc(b) + '</li>').join('') : '<li>' + esc(e.message) + '</li>') +
          '</ul></div>';
        btn.disabled = false;
        btn.textContent = approveLabel;
      }
    });
  }
  /* ================= product card ================= */
  async function showProduct(productId) {
    const p = state.products.find((x) => String(x.id) === String(productId));
    if (!p) { toast('Product not found.'); return; }
    const cost = productCost(p);
    const retail = productRetail(p);
    const suggested = cost != null ? retailFromCost(cost) : null;
    const margin = (retail != null && cost != null) ? retail - cost : null;
    const ruleGap = suggested != null && (retail == null || Math.abs(retail - suggested) >= 0.005);

    openPanel(
      '<div class="card-title">' + esc(productName(p)) + '</div>' +
      '<div class="card-sub">' + esc([p.upc ? 'UPC ' + p.upc : null, p.category || p.department || null].filter(Boolean).join(' · ')) + '</div>' +
      '<div class="stat-grid">' +
        '<div class="stat"><div class="v">' + fmtMoney(cost) + '</div><div class="k">unit cost</div></div>' +
        '<div class="stat"><div class="v cy">' + fmtMoney(retail) + '</div><div class="k">retail</div></div>' +
        '<div class="stat"><div class="v grn">' + fmtMoney(margin) + '</div><div class="k">margin</div></div>' +
      '</div>' +
      '<div class="lr-meta">Suggested by rule: <b style="color:var(--amber)">' + fmtMoney(suggested) + '</b>' +
        (ruleGap ? ' · <b style="color:' + (retail < suggested ? 'var(--red)">under the rule' : 'var(--ink-dim)">above the rule') + '</b>' : ' · <b style="color:var(--green)">on rule</b>') + '</div>' +
      (ruleGap && !p.internal
        ? '<div class="approve-row"><button class="btn ' + (retail < suggested ? 'primary' : 'ghost') + '" id="ruleApply">' +
            (retail < suggested ? 'Fix to rule · ' + fmtMoney(suggested) : 'Lower to rule · ' + fmtMoney(suggested)) + '</button></div>'
        : '') +
      (p.upc ? '' :
        '<div class="lr-match" style="margin-top:10px"><button class="btn cy" id="upcFind" style="white-space:nowrap">Find UPC</button></div>' +
        '<div id="upcBox" style="margin-top:6px"></div>') +
      '<div class="lr-match" style="margin-top:10px"><input id="retailEdit" type="number" step="0.01" min="0" placeholder="New retail price…" inputmode="decimal">' +
      '<button class="btn cy" id="retailSave" style="white-space:nowrap">Set retail</button></div>' +
      '<div id="retailMsg" class="lr-meta" style="margin-top:6px"></div>' +
      '<div class="card-sub" style="margin-top:14px">Price history</div>' +
      '<div id="histBox" class="lr-meta">Loading…</div>' +
      '<div class="rule-plaque">Pricing rule · retail = <b>unit cost × 1.70</b>, shelf-rounded to .99</div>'
    );

    // UPC lookup on the product card — same public-database flow as the review line.
    const upcFindBtn = $('upcFind');
    if (upcFindBtn) {
      upcFindBtn.addEventListener('click', async () => {
        const box = $('upcBox');
        upcFindBtn.disabled = true;
        box.innerHTML = '<div class="lr-meta">Looking up barcodes…</div>';
        try {
          const cands = await api.lookupUpc(productName(p));
          if (!cands.length) {
            box.innerHTML = '<div class="lr-meta">No barcodes found online — scan the package instead.</div>';
          } else {
            box.innerHTML = cands.map((c, ci) =>
              '<button class="match-pick" data-cardupc="' + ci + '">' +
              '<span><b>' + esc(c.code) + '</b> — ' + esc(c.name || 'unknown product') + '</span>' +
              (c.brands ? '<small>' + esc(c.brands) + '</small>' : '') + '</button>'
            ).join('');
            box.querySelectorAll('[data-cardupc]').forEach((pick) => {
              pick.addEventListener('click', async () => {
                const cand = cands[Number(pick.dataset.cardupc)];
                pick.disabled = true;
                try {
                  await api.setProductUpc(p.id, cand.code);
                  p.upc = cand.code;
                  toast('<b>UPC saved</b> — ' + esc(cand.code), 'ok');
                  nav.refreshGame();
                  showProduct(productId);
                } catch (e) {
                  toast('Could not save UPC: ' + e.message, 'err');
                  pick.disabled = false;
                }
              });
            });
          }
        } catch (e) {
          box.innerHTML = '<div class="lr-meta">Lookup failed: ' + esc(e.message) + '</div>';
        } finally {
          if (upcFindBtn.isConnected) upcFindBtn.disabled = false;
        }
      });
    }

    $('retailSave').addEventListener('click', async () => {
      const v = num($('retailEdit').value);
      if (v == null || v < 0) { $('retailMsg').textContent = 'Enter a valid price.'; return; }
      $('retailSave').disabled = true;
      try {
        await api.setRetail(p.id, v);
        $('retailMsg').innerHTML = '<b style="color:var(--green)">Retail updated to ' + fmtMoney(v) + '.</b>';
        await api.getProducts();
        zones.refreshAisles();
        nav.refreshGame();
      } catch (e) {
        $('retailMsg').textContent = e.message;
      } finally {
        $('retailSave').disabled = false;
      }
    });

    const ruleBtn = $('ruleApply');
    if (ruleBtn) {
      let confirmLower = false;
      ruleBtn.addEventListener('click', async () => {
        ruleBtn.disabled = true;
        try {
          // The server prices it from the cost on file; we only name the product.
          const res = await api.applyRule(p.id, { allowDecrease: confirmLower });
          $('retailMsg').innerHTML = '<b style="color:var(--green)">' +
            (res.unchanged ? 'Already on the rule price.' : 'Repriced to ' + fmtMoney(res.rulePrice) + ' by the ×1.70 rule.') + '</b>';
          await api.getProducts();
          zones.refreshAisles();
          await nav.refreshGame();
          ruleBtn.remove();
        } catch (e) {
          if (e.data && e.data.code === 'WOULD_LOWER_PRICE' && !confirmLower) {
            confirmLower = true;
            ruleBtn.textContent = 'Confirm: lower to ' + fmtMoney(e.data.rulePrice);
            $('retailMsg').textContent = e.message;
          } else {
            $('retailMsg').textContent = e.message;
          }
          ruleBtn.disabled = false;
        }
      });
    }

    try {
      const hist = await api.getHistory(p.id);
      $('histBox').innerHTML = hist.length
        ? hist.slice(0, 6).map((h) =>
            '<div>· ' + fmtMoney(h.previous_retail_price != null ? h.previous_retail_price : h.old_retail_price) +
            ' → <b>' + fmtMoney(h.new_retail_price != null ? h.new_retail_price : h.new_price) + '</b>' +
            ' <span style="color:var(--ink-faint)">' + esc(fmtDate(h.changed_at || h.created_at)) + '</span></div>'
          ).join('')
        : 'No recorded changes.';
    } catch (_) {
      $('histBox').textContent = 'History unavailable.';
    }
  }

  /* ================= vault panel ================= */
  async function showVaultPanel() {
    const { revenue, cost, profit, raw } = zones.refreshVault();
    const salesMission = state.game && state.game.missions ? state.game.missions.find((m) => m.key === 'sales_feed') : null;
    const keys = Object.keys(raw || {}).filter((k) => typeof raw[k] === 'number').slice(0, 8);
    openPanel(
      '<div class="card-title">Vault — financials</div>' +
      '<div class="card-sub">The 3D bars mirror these numbers.</div>' +
      '<div class="stat-grid">' +
        '<div class="stat"><div class="v cy">' + fmtMoney(revenue) + '</div><div class="k">revenue</div></div>' +
        '<div class="stat"><div class="v">' + fmtMoney(cost) + '</div><div class="k">cost</div></div>' +
        '<div class="stat"><div class="v grn">' + fmtMoney(profit) + '</div><div class="k">profit</div></div>' +
      '</div>' +
      (keys.length ? '<div class="lr-meta">' + keys.map((k) => esc(k.replace(/_/g, ' ')) + ': <b>' +
        (/_share$/.test(k) ? esc(Number(raw[k]).toFixed(1)) + '%' : fmtMoney(raw[k])) + '</b>').join('<br>') + '</div>' : '') +
      '<div class="card-sub" style="margin-top:14px">POS sales import</div>' +
      (salesMission ? '<div class="recon-strip">' + esc(salesMission.brief) + '</div>' : '') +
      '<div class="lr-meta" style="margin-bottom:8px">Upload the NRS sales CSV. Re-uploading the same export is safe.</div>' +
      '<div class="approve-row"><button class="btn cy" id="posBtn">Choose sales CSV</button></div>' +
      '<input type="file" id="posPicker" accept=".csv,text/csv" hidden>' +
      '<div id="posMsg" class="lr-meta" style="margin-top:8px"></div>'
    );
    $('posBtn').addEventListener('click', () => $('posPicker').click());
    $('posPicker').addEventListener('change', async () => {
      const f = $('posPicker').files[0];
      if (!f) return;
      $('posMsg').textContent = 'Importing…';
      try {
        const res = await api.importPos(f);
        const sm = res && res.summary ? res.summary : {};
        $('posMsg').innerHTML = res && res.duplicate
          ? '<b style="color:var(--green)">Already imported</b> — this export was counted before.'
          : '<b style="color:var(--green)">Imported ' + esc(String(sm.row_count != null ? sm.row_count : '')) + ' rows</b>' +
            (sm.period_start ? ' · ' + esc(sm.period_start) + ' → ' + esc(sm.period_end || '') : '') +
            (res && res.matched != null ? ' · ' + esc(String(res.matched)) + ' matched to the catalog' : '');
        await nav.refreshAll();
      } catch (e) {
        $('posMsg').textContent = e.message;
      }
    });
  }

  return {
    toast, openPanel, closePanel,
    setZone, setUser, setReviewBadge, setCleared,
    showSignin, showInvoice, showProduct, showVaultPanel,
    openUpload,
  };
}
