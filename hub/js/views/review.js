/* Review — the invoice queue and the review card.
   The card loads the invoice with ALL its lines (GET /invoices/:id), so lines
   marked short/wrong stay visible and undoable, and an all-excluded invoice
   can still be closed. Typed edits live in ctx.work and survive re-renders.
   A live checklist mirrors the server's approval gate (pricing-engine.js
   approvalReadiness) so blockers show before Approve, not after. */

import {
  queueInvoices, lineDesc, lineUnitCost, lineTotal, lineProposedRetail, retailFromCost,
  productName, productCost, fmtDate,
} from '../../../pricing-hub/js/api.js';
import { esc, icon, fmtMoney, num, toast, setBusy, emptyState, plural } from '../ui.js';
import { mountUpcFinder } from '../upc.js';

const cache = new Map();     // invoiceId -> { invoice, lines, at } | { error }
const loading = new Set();
const approvedRecently = new Map(); // invoiceId -> { number, lines, total }
const STALE_MS = 60_000;

/* ---------- line model (server row + working edits) ---------- */
function lineModel(ctx) {
  const edit = (l) => ctx.work.edits.get(l.id) || {};
  const setEdit = (l, patch) => ctx.work.edits.set(l.id, { ...edit(l), ...patch });
  const excluded = (l) => l.review_status === 'rejected';
  const excKind = (l) => (/^short/i.test(l.review_reason || '') ? 'short' : 'rejected');
  const cases = (l) => {
    const e = edit(l);
    if (e.cases != null) return e.cases;
    const v = Number(l.case_quantity);
    return Number.isFinite(v) ? v : 0;
  };
  const cost = (l) => {
    const e = edit(l);
    return e.cost != null ? e.cost : lineUnitCost(l);
  };
  const total = (l) => {
    const e = edit(l);
    const c = cost(l);
    if ((e.cases != null || e.cost != null) && c != null) {
      const upc = Number(l.units_per_case) || 0;
      if (upc > 0) return Math.round(cases(l) * upc * c * 100) / 100;
    }
    return lineTotal(l) || 0;
  };
  const ruleRetail = (l) => {
    const e = edit(l);
    return e.cost != null ? retailFromCost(e.cost) : lineProposedRetail(l);
  };
  const retail = (l) => {
    const e = edit(l);
    return e.retail != null ? e.retail : ruleRetail(l);
  };
  const match = (l) => {
    const m = ctx.work.matches.get(l.id);
    if (m) return m.cleared ? null : m;
    if (!l.matched_product_id) return null;
    const p = ctx.state.products.find((x) => String(x.id) === String(l.matched_product_id));
    return { id: l.matched_product_id, name: p ? productName(p) : 'Catalog item' };
  };
  return { edit, setEdit, excluded, excKind, cases, cost, total, ruleRetail, retail, match };
}

function readiness(inv, lines, M, tolerance) {
  const active = lines.filter((l) => !M.excluded(l));
  const blockers = [];
  const unmatched = active.filter((l) => !M.match(l));
  if (unmatched.length) {
    blockers.push({ text: plural(unmatched.length, 'line') + (unmatched.length === 1 ? ' still needs' : ' still need') + ' a product match', lineId: unmatched[0].id });
  }
  for (const l of active) {
    const label = 'Line ' + (l.line_number != null ? l.line_number : '?');
    const c = M.cost(l);
    if (c == null || c < 0) { blockers.push({ text: label + ' has no unit cost', lineId: l.id }); continue; }
    if (l.internal) continue;
    const r = M.retail(l);
    if (r == null) blockers.push({ text: label + ' has no retail price', lineId: l.id });
    else if (r < c) blockers.push({ text: label + ' is priced below cost', lineId: l.id });
  }
  const sum = Math.round(active.reduce((s, l) => s + M.total(l), 0) * 100) / 100;
  const printed = inv.invoice_subtotal != null && Number.isFinite(Number(inv.invoice_subtotal))
    ? Number(inv.invoice_subtotal) : null;
  const variance = printed != null ? Math.round((printed - sum) * 100) / 100 : null;
  if (active.length && variance != null && Math.abs(variance) > tolerance) {
    blockers.push({ text: 'Totals are off by ' + fmtMoney(variance) + ' (printed ' + fmtMoney(printed) + ', lines ' + fmtMoney(sum) + ')' });
  }
  return { active, blockers, sum, printed, variance };
}

/* ---------- product suggestions ---------- */
const STOP = new Set(['the', 'and', 'with', 'pack', 'case', 'oz', 'ct', 'pk', 'lb', 'lbs', 'can', 'cans', 'jar', 'bag', 'box', 'each']);
function tokens(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9.]+/g, ' ').split(' ')
    .filter((t) => t.length >= 3 && !STOP.has(t));
}
function suggest(ctx, line) {
  const products = ctx.state.products;
  const upc = String(line.extracted_upc || '').replace(/\D/g, '');
  if (upc.length >= 8) {
    const hit = products.find((p) => String(p.upc || '').replace(/\D/g, '').endsWith(upc.slice(-11)));
    if (hit) return [{ p: hit, why: 'barcode match' }];
  }
  const want = new Set(tokens(lineDesc(line)));
  if (!want.size) return [];
  return products
    .map((p) => {
      const have = tokens(productName(p));
      let score = 0;
      for (const t of have) if (want.has(t)) score += /\d/.test(t) ? 2 : 1;
      return { p, score };
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => ({ p: x.p, why: 'similar name' }));
}
function searchProducts(ctx, q) {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const scored = [];
  for (const p of ctx.state.products) {
    const hay = (productName(p) + ' ' + (p.upc || '') + ' ' + (p.category || '')).toLowerCase();
    const at = hay.indexOf(needle);
    if (at >= 0) scored.push({ p, rank: at === 0 ? 0 : 1 });
  }
  return scored.sort((a, b) => a.rank - b.rank || productName(a.p).localeCompare(productName(b.p))).slice(0, 8).map((x) => x.p);
}

/* ---------- list ---------- */
function summaries(ctx) {
  const mission = ctx.state.game && ctx.state.game.missions
    ? ctx.state.game.missions.find((m) => m.key === 'review_line') : null;
  const ages = new Map(((mission && mission.items) || []).map((i) => [String(i.id), i]));
  const list = queueInvoices().map((inv) => ({
    id: inv.id,
    number: inv.number,
    date: inv.date,
    open: inv.lines.length,
    total: inv.lines.reduce((s, l) => s + (lineTotal(l) || 0), 0),
    printed: inv.subtotal,
    ageDays: ages.has(String(inv.id)) ? ages.get(String(inv.id)).ageDays : null,
  }));
  // Invoices still awaiting review whose lines were all excluded are not in the
  // needs_review queue; the mission still knows about them.
  for (const it of (mission && mission.items) || []) {
    if (!list.some((x) => String(x.id) === String(it.id))) {
      list.push({ id: it.id, number: String(it.label || '').replace(/^#/, ''), date: '', open: 0, total: null, printed: null, ageDays: it.ageDays });
    }
  }
  return list.sort((a, b) => (b.ageDays == null ? -1 : b.ageDays) - (a.ageDays == null ? -1 : a.ageDays));
}

function renderList(ctx, activeId) {
  const list = summaries(ctx);
  if (!list.length) {
    return emptyState('check', 'The review line is clear', 'Every delivered invoice is priced. Upload a new one from Intake.') +
      '<a class="btn primary block" href="#/intake">' + icon('upload') + 'Upload an invoice</a>';
  }
  return '<div class="list-head"><h2>' + plural(list.length, 'invoice') + ' waiting</h2>' +
    '<span class="muted small">oldest first</span></div>' +
    '<ul class="inv-list">' + list.map((x) => {
      const age = x.ageDays == null ? '' : x.ageDays === 0 ? 'today' : x.ageDays + 'd';
      const ageTone = x.ageDays == null ? '' : x.ageDays > 14 ? 'bad' : x.ageDays > 3 ? 'warn' : 'ok';
      return '<li><a class="inv-row' + (String(x.id) === String(activeId) ? ' active' : '') + '" href="#/review/' + encodeURIComponent(x.id) + '">' +
        '<span class="inv-main"><b>#' + esc(x.number || '—') + '</b>' +
          '<span class="muted small">' + esc([fmtDate(x.date), x.open ? plural(x.open, 'line') : 'all lines excluded'].filter(Boolean).join(' · ')) + '</span></span>' +
        '<span class="inv-side">' + (x.total != null ? '<span class="mono">' + fmtMoney(x.total) + '</span>' : '') +
          (age ? '<span class="age tone-' + ageTone + '">' + esc(age) + '</span>' : '') + '</span>' +
        icon('chevron', 'inv-chev') +
      '</a></li>';
    }).join('') + '</ul>';
}

/* ---------- detail ---------- */
async function load(ctx, id, { force = false } = {}) {
  const hit = cache.get(id);
  if (!force && hit && !hit.error && Date.now() - hit.at < STALE_MS) return;
  if (loading.has(id)) return;
  loading.add(id);
  try {
    const data = await ctx.api.getInvoice(id);
    const lines = (data.lines || []).slice().sort((a, b) => (a.line_number || 0) - (b.line_number || 0));
    cache.set(id, { invoice: data.invoice, lines, at: Date.now() });
  } catch (e) {
    cache.set(id, { error: e.message, status: e.status });
  } finally {
    loading.delete(id);
  }
  const r = (location.hash || '').split('?')[0];
  if (r === '#/review/' + encodeURIComponent(id) || r === '#/review/' + id) ctx.render();
}

function lineHtml(ctx, M, l, idx) {
  const desc = lineDesc(l);
  const qty = [M.cases(l) ? M.cases(l) + ' case' + (M.cases(l) === 1 ? '' : 's') : null,
    l.units_per_case ? '× ' + l.units_per_case + ' units' : null].filter(Boolean).join(' ');
  const meta = esc(['Line ' + (l.line_number != null ? l.line_number : idx + 1), qty,
    l.vendor_sku ? 'SKU ' + l.vendor_sku : null].filter(Boolean).join(' · '));

  if (M.excluded(l)) {
    const short = M.excKind(l) === 'short';
    return '<article class="line excluded" id="line-' + esc(l.id) + '" data-line="' + idx + '">' +
      '<header class="line-head"><h3 class="line-name">' + esc(desc) + '</h3>' +
        '<span class="line-total mono">' + fmtMoney(M.total(l)) + '</span></header>' +
      '<div class="line-meta">' + meta + '</div>' +
      '<div class="line-exc"><span class="tag ' + (short ? 'warn' : 'bad') + '">' +
        (short ? 'Didn\'t arrive' : 'Wrong line') + '</span><span class="muted small">Stays on the record, not priced.</span></div>' +
      '<div class="line-actions"><button type="button" class="btn small ghost" data-act="undo">' + icon('undo') + 'Put back</button></div>' +
    '</article>';
  }

  const m = M.match(l);
  const cost = M.cost(l);
  const rule = M.ruleRetail(l);
  const retail = M.retail(l);
  const prod = m ? ctx.state.products.find((p) => String(p.id) === String(m.id)) : null;
  const needsUpc = m && !(prod && prod.upc);
  const below = retail != null && cost != null && !l.internal && retail < cost;
  const sugg = m ? [] : suggest(ctx, l);

  return '<article class="line' + (m ? '' : ' unmatched') + '" id="line-' + esc(l.id) + '" data-line="' + idx + '">' +
    '<header class="line-head"><h3 class="line-name">' + esc(desc) + '</h3>' +
      '<span class="line-total mono" data-total>' + fmtMoney(M.total(l)) + '</span></header>' +
    '<div class="line-meta">' + meta + '</div>' +
    (l.review_reason ? '<div class="line-flag">' + icon('alert') + esc(l.review_reason) + '</div>' : '') +
    '<div class="line-match">' +
      (m
        ? '<div class="matched">' + icon('check') + '<span class="matched-name">' + esc(m.name) + '</span>' +
          '<button type="button" class="link" data-act="rematch">Change</button></div>'
        : '<label class="field-label" for="m-' + esc(l.id) + '">Match to a product</label>' +
          (sugg.length ? '<div class="sugg">' + sugg.map((s, si) =>
            '<button type="button" class="chip" data-sugg="' + si + '">' + esc(productName(s.p)) +
            '<span class="chip-sub">' + esc(s.why) + '</span></button>').join('') + '</div>' : '') +
          '<div class="search-box">' + icon('search') +
            '<input type="search" id="m-' + esc(l.id) + '" data-search placeholder="Search name or UPC…" autocomplete="off"></div>' +
          '<div class="search-results" data-results></div>') +
    '</div>' +
    '<div class="line-fields">' +
      '<label class="fld"><span>Cases</span><input type="number" inputmode="decimal" step="any" min="0" data-f="cases" value="' + esc(M.cases(l)) + '"></label>' +
      '<label class="fld"><span>Unit cost</span><input type="number" inputmode="decimal" step="0.01" min="0" data-f="cost" value="' + (cost != null ? esc(cost) : '') + '" placeholder="—"></label>' +
      '<label class="fld' + (below ? ' bad' : '') + '"><span>Retail</span><input type="number" inputmode="decimal" step="0.01" min="0" data-f="retail" value="' + (retail != null ? retail.toFixed(2) : '') + '"></label>' +
    '</div>' +
    '<div class="line-rule muted small" data-rule>' + ruleHint(rule, retail, below) + '</div>' +
    '<div class="line-actions">' +
      '<button type="button" class="btn small ghost warn" data-act="short">Didn\'t arrive</button>' +
      '<button type="button" class="btn small ghost" data-act="reject">Wrong line</button>' +
    '</div>' +
    (needsUpc ? '<div class="line-upc"><div class="muted small">' + esc(m.name) + ' has no barcode yet.</div><div data-upc></div></div>' : '') +
  '</article>';
}

function ruleHint(rule, retail, below) {
  if (below) return '<span class="txt-bad">Below cost — raise the retail price.</span>';
  if (rule == null) return 'No cost on file, so no rule price.';
  if (retail != null && Math.abs(retail - rule) >= 0.005) return 'Rule price ' + fmtMoney(rule) + ' · you set ' + fmtMoney(retail);
  return 'Rule price ' + fmtMoney(rule) + ' (cost × 1.70, .99)';
}

function approveBarHtml() {
  return '<div class="approve-bar" data-approvebar>' +
    '<div class="checklist" data-checklist></div>' +
    '<button type="button" class="btn primary block lg" data-approve></button>' +
  '</div>';
}

function renderApprovedCard(id) {
  const a = approvedRecently.get(id);
  return '<div class="card success-card">' + icon('check', 'lg') +
    '<h2>Invoice #' + esc(a.number) + ' approved</h2>' +
    '<p class="muted">' + plural(a.lines, 'price') + ' are live · ' + fmtMoney(a.total) + '</p>' +
    '<div class="btn-row">' +
      '<button type="button" class="btn" data-labels="' + esc(id) + '">' + icon('file') + 'Download price labels</button>' +
      (a.next ? '<a class="btn primary" href="#/review/' + encodeURIComponent(a.next) + '">Next invoice' + icon('chevron') + '</a>'
        : '<a class="btn primary" href="#/today">Back to Today' + icon('chevron') + '</a>') +
    '</div></div>';
}

export function render(ctx, route, host) {
  const id = route.id;
  host.innerHTML = '<div class="split' + (id ? ' has-detail' : '') + '">' +
    '<aside class="split-list" aria-label="Invoices waiting">' + renderList(ctx, id) + '</aside>' +
    '<section class="split-detail" aria-live="polite" data-detail></section></div>';
  const detail = host.querySelector('[data-detail]');

  if (!id) {
    detail.innerHTML = '<div class="detail-placeholder">' + icon('review', 'lg') + '<p>Pick an invoice to review.</p></div>';
    return;
  }
  if (approvedRecently.has(id)) {
    detail.innerHTML = '<a class="back" href="#/review">' + icon('back') + 'All invoices</a>' + renderApprovedCard(id);
    wireLabels(ctx, detail);
    return;
  }
  const hit = cache.get(id);
  if (!hit || (!hit.error && Date.now() - hit.at >= STALE_MS)) {
    if (!hit) detail.innerHTML = '<div class="skeleton-stack"><div class="skeleton"></div><div class="skeleton"></div></div>';
    load(ctx, id, { force: Boolean(hit) });
    if (!hit) return;
  }
  if (hit && hit.error) {
    detail.innerHTML = '<a class="back" href="#/review">' + icon('back') + 'All invoices</a>' +
      '<div class="card error-card">' + icon('alert') + '<div><b>' +
      esc(hit.status === 404 ? 'That invoice no longer exists.' : 'Could not open this invoice.') + '</b>' +
      '<div class="muted">' + esc(hit.error) + '</div>' +
      '<button type="button" class="btn small" data-retry>' + icon('refresh') + 'Try again</button></div></div>';
    detail.querySelector('[data-retry]').addEventListener('click', () => { cache.delete(id); ctx.render(); });
    return;
  }
  renderDetail(ctx, id, detail);
}

function renderDetail(ctx, id, detail) {
  const { invoice: inv, lines } = cache.get(id);
  const M = lineModel(ctx);
  const tolerance = (ctx.state.config && Number(ctx.state.config.reconciliationTolerance)) || 0.01;

  if (inv.status !== 'needs_review') {
    const word = { imported: 'approved', approved: 'approved', rejected: 'closed', uploaded: 'still waiting to be read', extracting: 'still being read' }[inv.status] || inv.status;
    detail.innerHTML = '<a class="back" href="#/review">' + icon('back') + 'All invoices</a>' +
      '<div class="card"><h2>Invoice #' + esc(inv.invoice_number || '—') + '</h2>' +
      '<p class="muted">This invoice is ' + esc(word) + ', so there is nothing to review here.</p>' +
      (/uploaded|extracting/.test(inv.status) ? '<a class="btn" href="#/intake">Go to Intake</a>' : '') + '</div>';
    return;
  }

  const excludedN = lines.filter(M.excluded).length;
  detail.innerHTML =
    '<a class="back" href="#/review">' + icon('back') + 'All invoices</a>' +
    '<header class="inv-head">' +
      '<div><h1>Invoice #' + esc(inv.invoice_number || '—') + '</h1>' +
        '<div class="muted">' + esc([fmtDate(inv.invoice_date), plural(lines.length, 'line'),
          excludedN ? excludedN + ' excluded' : null].filter(Boolean).join(' · ')) + '</div></div>' +
      (inv.has_scan ? '<button type="button" class="btn small" data-scan>' + icon('file') + 'View scan</button>' : '') +
    '</header>' +
    '<div class="stats" data-stats></div>' +
    '<div class="lines">' + lines.map((l, i) => lineHtml(ctx, M, l, i)).join('') + '</div>' +
    approveBarHtml() +
    '<p class="rule-note">Pricing rule · retail = unit cost × 1.70, shelf-rounded to .99</p>';

  const summary = () => updateSummary(ctx, detail, inv, lines, M, tolerance);
  lines.forEach((l, i) => wireLine(ctx, detail, inv, lines, l, i, M, summary));
  summary();

  const scan = detail.querySelector('[data-scan]');
  if (scan) {
    scan.addEventListener('click', async () => {
      // Open the tab inside the tap, then point it at the signed URL; a window
      // opened after an await is blocked as a popup.
      const w = window.open('', '_blank');
      try {
        const { url } = await ctx.api.getInvoiceSource(inv.id);
        if (w) { w.opener = null; w.location.href = url; } else location.href = url;
      } catch (e) {
        if (w) w.close();
        toast('Could not open the scan: ' + esc(e.message), 'err');
      }
    });
  }

  detail.querySelector('[data-approve]').addEventListener('click', () => approve(ctx, id, inv, lines, M, tolerance, detail));
}

function updateSummary(ctx, detail, inv, lines, M, tolerance) {
  const r = readiness(inv, lines, M, tolerance);
  const matched = r.active.filter((l) => M.match(l)).length;
  detail.querySelector('[data-stats]').innerHTML =
    '<div class="stat"><b>' + r.active.length + '</b><span>to approve</span></div>' +
    '<div class="stat"><b class="mono">' + fmtMoney(r.sum) + '</b><span>line total</span></div>' +
    '<div class="stat"><b>' + matched + '/' + r.active.length + '</b><span>matched</span></div>' +
    (r.printed != null
      ? '<div class="stat ' + (r.variance != null && Math.abs(r.variance) <= tolerance ? 'good' : 'bad') + '"><b class="mono">' +
        (r.variance != null && Math.abs(r.variance) <= tolerance ? 'Reconciles' : fmtMoney(r.variance)) + '</b><span>vs printed ' + fmtMoney(r.printed) + '</span></div>'
      : '');

  const btn = detail.querySelector('[data-approve]');
  const list = detail.querySelector('[data-checklist]');
  if (!btn.classList.contains('busy')) {
    if (!r.active.length) {
      btn.innerHTML = btn.dataset.confirm ? 'Tap again to close the invoice' : 'Close invoice — nothing was received';
      btn.className = 'btn danger block lg';
      btn.disabled = false;
    } else {
      btn.innerHTML = icon('check') + 'Approve ' + plural(r.active.length, 'line') + ' · ' + fmtMoney(r.sum);
      btn.className = 'btn primary block lg';
      btn.disabled = r.blockers.length > 0;
    }
  }
  list.innerHTML = !r.active.length
    ? '<div class="check-ok muted small">Every line is excluded. Closing records that nothing was priced.</div>'
    : r.blockers.length
      ? '<button type="button" class="check-head" data-toggle aria-expanded="false">' + icon('alert') +
        plural(r.blockers.length, 'thing') + ' to fix before approving<span class="m-only muted small"> · show</span></button>' +
        '<ul>' + r.blockers.map((b) => '<li>' + (b.lineId
          ? '<button type="button" class="link" data-jump="' + esc(b.lineId) + '">' + esc(b.text) + '</button>'
          : esc(b.text)) + '</li>').join('') + '</ul>'
      : '<div class="check-ok">' + icon('check') + 'Ready to approve</div>';
  const bar = detail.querySelector('[data-approvebar]');
  const toggle = list.querySelector('[data-toggle]');
  if (toggle) {
    toggle.setAttribute('aria-expanded', String(bar.classList.contains('open')));
    toggle.addEventListener('click', () => {
      bar.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(bar.classList.contains('open')));
    });
  }
  list.querySelectorAll('[data-jump]').forEach((b) => b.addEventListener('click', () => {
    const el = document.getElementById('line-' + b.dataset.jump);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const f = el.querySelector('[data-search], [data-f="cost"], [data-f="retail"]');
    if (f) setTimeout(() => f.focus({ preventScroll: true }), 350);
  }));
}

function replaceLine(ctx, detail, inv, lines, idx, M, summary) {
  const el = detail.querySelector('[data-line="' + idx + '"]');
  if (!el) return;
  const tpl = document.createElement('template');
  tpl.innerHTML = lineHtml(ctx, M, lines[idx], idx);
  el.replaceWith(tpl.content.firstElementChild);
  wireLine(ctx, detail, inv, lines, lines[idx], idx, M, summary);
  summary();
}

function wireLine(ctx, detail, inv, lines, l, idx, M, summary) {
  const el = detail.querySelector('[data-line="' + idx + '"]');
  if (!el) return;
  const redraw = () => replaceLine(ctx, detail, inv, lines, idx, M, summary);

  // Numbers: update the computed bits in place so focus never jumps.
  el.querySelectorAll('[data-f]').forEach((input) => {
    input.addEventListener('change', () => {
      const f = input.dataset.f;
      const v = num(input.value);
      M.setEdit(l, { [f]: v != null && v >= 0 ? v : null });
      const t = el.querySelector('[data-total]');
      if (t) t.textContent = fmtMoney(M.total(l));
      const retailInput = el.querySelector('[data-f="retail"]');
      if (f === 'cost' && M.edit(l).retail == null && retailInput && document.activeElement !== retailInput) {
        const r = M.retail(l);
        retailInput.value = r != null ? r.toFixed(2) : '';
      }
      const below = M.retail(l) != null && M.cost(l) != null && !l.internal && M.retail(l) < M.cost(l);
      if (retailInput) retailInput.closest('.fld').classList.toggle('bad', below);
      const hint = el.querySelector('[data-rule]');
      if (hint) hint.innerHTML = ruleHint(M.ruleRetail(l), M.retail(l), below);
      summary();
    });
  });

  // Matching
  const pick = (p) => {
    ctx.work.matches.set(l.id, { id: p.id, name: productName(p) });
    redraw();
  };
  const sugg = M.match(l) ? [] : suggest(ctx, l);
  el.querySelectorAll('[data-sugg]').forEach((b) => b.addEventListener('click', () => pick(sugg[Number(b.dataset.sugg)].p)));
  const search = el.querySelector('[data-search]');
  if (search) {
    const results = el.querySelector('[data-results]');
    let hits = [];
    search.addEventListener('input', () => {
      hits = searchProducts(ctx, search.value);
      results.innerHTML = search.value.trim()
        ? (hits.length ? hits.map((p, i) => '<button type="button" class="pick" data-hit="' + i + '">' +
            '<span class="pick-main">' + esc(productName(p)) + '</span>' +
            '<span class="pick-sub mono">' + esc([p.upc || null, 'cost ' + fmtMoney(productCost(p))].filter(Boolean).join(' · ')) + '</span></button>').join('')
          : '<div class="muted small">No product matches “' + esc(search.value.trim()) + '”.</div>')
        : '';
      results.querySelectorAll('[data-hit]').forEach((b) => b.addEventListener('click', () => pick(hits[Number(b.dataset.hit)])));
    });
    search.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && hits.length) { e.preventDefault(); pick(hits[0]); }
    });
  }
  const rematch = el.querySelector('[data-act="rematch"]');
  if (rematch) rematch.addEventListener('click', () => {
    ctx.work.matches.set(l.id, { cleared: true });
    redraw();
    const s = detail.querySelector('[data-line="' + idx + '"] [data-search]');
    if (s) s.focus();
  });

  // Exceptions — persisted immediately so nothing is lost if the phone closes.
  async function setStatus(btn, status, note) {
    setBusy(btn, true, 'Saving…');
    try {
      const body = status === 'rejected'
        ? [{ id: l.id, review_status: 'rejected', review_note: note }]
        : [{ id: l.id, review_status: 'needs_review' }];
      await ctx.api.updateLineReviews(inv.id, body);
      l.review_status = status;
      l.review_reason = status === 'rejected' ? note : null;
      redraw();
      ctx.afterAction({}).catch(() => {});
    } catch (e) {
      toast('Could not update the line: ' + esc(e.message), 'err');
      setBusy(btn, false);
    }
  }
  const act = (name, fn) => { const b = el.querySelector('[data-act="' + name + '"]'); if (b) b.addEventListener('click', () => fn(b)); };
  act('short', (b) => setStatus(b, 'rejected', 'Short — box did not arrive'));
  act('reject', (b) => setStatus(b, 'rejected', 'Rejected by manager — wrong/duplicate line'));
  act('undo', (b) => setStatus(b, 'needs_review'));

  // Barcode for a matched product that has none
  const upcBox = el.querySelector('[data-upc]');
  if (upcBox) {
    const m = M.match(l);
    mountUpcFinder(upcBox, { ctx, productId: m.id, query: lineDesc(l), onSaved: redraw });
  }
}


async function approve(ctx, id, inv, lines, M, tolerance, detail) {
  const btn = detail.querySelector('[data-approve]');
  const r = readiness(inv, lines, M, tolerance);

  // Every line excluded: close the invoice instead of approving nothing.
  if (!r.active.length) {
    if (!btn.dataset.confirm) {
      btn.dataset.confirm = '1';
      btn.textContent = 'Tap again to close the invoice';
      setTimeout(() => { if (btn.isConnected) { delete btn.dataset.confirm; updateSummary(ctx, detail, inv, lines, M, tolerance); } }, 4000);
      return;
    }
    setBusy(btn, true, 'Closing…');
    try {
      await ctx.api.updateLineReviews(inv.id, [], true);
      lines.forEach((l) => { ctx.work.matches.delete(l.id); ctx.work.edits.delete(l.id); });
      cache.delete(id);
      toast(icon('check') + ' <b>Invoice #' + esc(inv.invoice_number || '') + ' closed</b> — nothing was priced.', 'ok');
      await ctx.afterAction({ queue: true });
      ctx.go('/review');
    } catch (e) {
      toast(esc(e.message), 'err');
      setBusy(btn, false);
      delete btn.dataset.confirm;
    }
    return;
  }

  if (r.blockers.length) return;
  setBusy(btn, true, 'Approving…');
  const payload = r.active.map((l) => ({
    id: l.id,
    invoice_line_id: l.id,
    line_number: l.line_number,
    product_id: (M.match(l) || {}).id || null,
    unit_cost: M.cost(l),
    line_total: M.total(l),
    retail_price: M.retail(l),
    internal: !!l.internal,
  }));
  try {
    await ctx.api.approveInvoice(inv.id, payload);
    lines.forEach((l) => { ctx.work.matches.delete(l.id); ctx.work.edits.delete(l.id); });
    cache.delete(id);
    await ctx.afterAction({ queue: true, products: true });
    const next = summaries(ctx).find((x) => String(x.id) !== String(id));
    approvedRecently.set(id, { number: inv.invoice_number || '—', lines: payload.length, total: r.sum, next: next ? next.id : null });
    ctx.render();
  } catch (e) {
    const blockers = e.data && Array.isArray(e.data.blockers) ? e.data.blockers : [e.message];
    detail.querySelector('[data-checklist]').innerHTML =
      '<div class="check-head">' + icon('alert') + 'The hub did not accept this approval</div><ul>' +
      blockers.map((b) => '<li>' + esc(b) + '</li>').join('') + '</ul>';
    setBusy(btn, false);
  }
}

function wireLabels(ctx, root) {
  root.querySelectorAll('[data-labels]').forEach((b) => b.addEventListener('click', async () => {
    setBusy(b, true, 'Preparing…');
    try {
      const blob = await ctx.api.downloadLabels(b.dataset.labels);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'price-labels.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {
      toast('Could not download labels: ' + esc(e.message), 'err');
    } finally {
      setBusy(b, false);
    }
  }));
}
