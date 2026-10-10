/* Products — catalog search, filters (under rule / no UPC / flagged), one-tap
   Rule Guard fixes, and the product card (rule fix, set retail, barcode,
   history). Prices are always written by the server; "Fix" names the product
   and the server computes cost × 1.70 (.99). */

import {
  productName, productCost, productRetail, retailFromCost, fmtDate,
} from '../../../pricing-hub/js/api.js';
import { esc, icon, fmtMoney, num, toast, setBusy, emptyState, plural } from '../ui.js';
import { mountUpcFinder } from '../upc.js';

let query = '';
const history = new Map(); // productId -> rows | { error }

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'rule', label: 'Under rule' },
  { key: 'noupc', label: 'No UPC' },
  { key: 'flagged', label: 'Flagged' },
];

export function rulePrice(p) {
  if (!p || p.internal) return null;
  const c = productCost(p);
  if (c == null || c <= 0) return null;
  return retailFromCost(c);
}

function status(p) {
  const rule = rulePrice(p);
  const retail = productRetail(p);
  const cost = productCost(p);
  if (p.internal) return { key: 'internal', label: 'Internal', tone: 'muted' };
  if (retail != null && cost != null && retail < cost) return { key: 'below', label: 'Below cost', tone: 'bad' };
  if (rule == null) return { key: 'nocost', label: 'No cost', tone: 'muted' };
  if (retail == null || retail < rule - 0.005) return { key: 'under', label: 'Under rule', tone: 'warn' };
  if (retail > rule + 0.005) return { key: 'above', label: 'Above rule', tone: 'muted' };
  return { key: 'on', label: 'On rule', tone: 'good' };
}

const isUnder = (p) => ['below', 'under'].includes(status(p).key) && rulePrice(p) != null;
const hasUpc = (p) => Boolean(String(p.upc || '').replace(/\D/g, ''));

function matches(p, f) {
  if (f === 'rule' && !isUnder(p)) return false;
  if (f === 'noupc' && hasUpc(p)) return false;
  if (f === 'flagged' && !p.flagged) return false;
  return true;
}

function rowHtml(p) {
  const s = status(p);
  const rule = rulePrice(p);
  const retail = productRetail(p);
  const cost = productCost(p);
  const margin = retail != null && cost != null && retail > 0 ? ((retail - cost) / retail) * 100 : null;
  return '<li class="prod-row" data-id="' + esc(p.id) + '">' +
    '<a class="prod-main" href="#/products/' + encodeURIComponent(p.id) + '">' +
      '<span class="prod-name">' + esc(productName(p)) + '</span>' +
      '<span class="prod-sub muted small">' + (s.key === 'below' ? '<b class="txt-bad">Below cost</b> · ' : '') + esc([p.category || p.department || null, hasUpc(p) ? null : 'no UPC',
        p.flagged ? 'flagged' : null].filter(Boolean).join(' · ')) + '</span>' +
    '</a>' +
    '<span class="prod-price"><span class="mono">' + fmtMoney(retail) + '</span>' +
      '<span class="muted small mono">cost ' + fmtMoney(cost) + (margin != null ? ' · ' + margin.toFixed(0) + '%' : '') + '</span></span>' +
    (isUnder(p) && rule != null
      ? '<button type="button" class="btn small primary" data-fix="' + esc(p.id) + '">Fix · ' + fmtMoney(rule) + '</button>'
      : '<span class="tag ' + s.tone + '">' + esc(s.label) + '</span>') +
  '</li>';
}

async function applyRule(ctx, p, btn, allowDecrease = false) {
  setBusy(btn, true, 'Fixing…');
  try {
    const res = await ctx.api.applyRule(p.id, { allowDecrease });
    toast(res.unchanged
      ? 'Already on the rule price.'
      : icon('check') + ' <b>' + esc(productName(p)) + '</b> → ' + fmtMoney(res.rulePrice), 'ok');
    await ctx.afterAction({ products: true });
    return true;
  } catch (e) {
    setBusy(btn, false);
    if (e.data && e.data.code === 'WOULD_LOWER_PRICE') return e.data;
    toast(esc(e.message), 'err');
    return false;
  }
}

export function render(ctx, route, host) {
  if (route.id) return renderDetail(ctx, route.id, host);
  const f = FILTERS.some((x) => x.key === route.query.get('f')) ? route.query.get('f') : 'all';
  const all = ctx.state.products;
  const counts = {
    all: all.length,
    rule: all.filter(isUnder).length,
    noupc: all.filter((p) => !hasUpc(p)).length,
    flagged: all.filter((p) => p.flagged).length,
  };

  host.innerHTML =
    '<header class="page-head"><h1>Products</h1>' +
      '<p class="muted">' + plural(all.length, 'active product') + ' · retail = cost × 1.70, shelf-rounded to .99</p></header>' +
    '<div class="toolbar">' +
      '<div class="search-box grow">' + icon('search') +
        '<input type="search" id="prodSearch" placeholder="Search name, UPC or category…" autocomplete="off" value="' + esc(query) + '" aria-label="Search products"></div>' +
      '<div class="chips" role="tablist" aria-label="Filter products">' + FILTERS.map((x) =>
        '<a role="tab" aria-selected="' + (x.key === f) + '" class="chip' + (x.key === f ? ' on' : '') + '" href="#/products' +
        (x.key === 'all' ? '' : '?f=' + x.key) + '">' + esc(x.label) + ' <span class="chip-n">' + counts[x.key] + '</span></a>').join('') +
      '</div>' +
    '</div>' +
    (f === 'rule' && counts.rule
      ? '<div class="notice">' + icon('shield') + '<span>Rule Guard: these sell under cost × 1.70. <b>Fix</b> reprices from the cost on file. Each fix earns XP.</span></div>'
      : '') +
    '<ul class="prod-list" id="prodList"></ul>' +
    '<div id="prodEmpty"></div>';

  const list = host.querySelector('#prodList');
  const empty = host.querySelector('#prodEmpty');
  const draw = () => {
    const q = query.trim().toLowerCase();
    const rows = all.filter((p) => matches(p, f) && (!q ||
      (productName(p) + ' ' + (p.upc || '') + ' ' + (p.category || p.department || '')).toLowerCase().includes(q)));
    if (f === 'rule') rows.sort((a, b) => Number(status(b).key === 'below') - Number(status(a).key === 'below'));
    list.innerHTML = rows.slice(0, 400).map(rowHtml).join('');
    empty.innerHTML = rows.length ? (rows.length > 400 ? '<p class="muted small">Showing 400 of ' + rows.length + '. Narrow the search.</p>' : '')
      : (f === 'rule' && !q ? emptyState('shield', 'Every priced item is on the rule', 'Nothing sells under cost × 1.70.')
        : emptyState('search', 'No products match', 'Try another name, a UPC, or the All filter.'));
    list.querySelectorAll('[data-fix]').forEach((b) => b.addEventListener('click', async () => {
      const p = all.find((x) => String(x.id) === b.dataset.fix);
      const ok = await applyRule(ctx, p, b);
      if (ok === true) ctx.render();
    }));
  };
  draw();
  const input = host.querySelector('#prodSearch');
  input.addEventListener('input', () => { query = input.value; draw(); });
}

function renderDetail(ctx, id, host) {
  const p = ctx.state.products.find((x) => String(x.id) === String(id));
  if (!p) {
    host.innerHTML = '<a class="back" href="#/products">' + icon('back') + 'Products</a>' +
      emptyState('products', 'Product not found', 'It may have been deactivated.');
    return;
  }
  const cost = productCost(p);
  const retail = productRetail(p);
  const rule = rulePrice(p);
  const s = status(p);
  const margin = retail != null && cost != null ? retail - cost : null;
  const marginPct = margin != null && retail > 0 ? (margin / retail) * 100 : null;
  const alert = ((ctx.state.financials && ctx.state.financials.alerts) || []).find((a) => String(a.product_id) === String(p.id));
  const gap = rule != null && (retail == null || Math.abs(retail - rule) >= 0.005);

  host.innerHTML =
    '<a class="back" href="#/products' + (isUnder(p) ? '?f=rule' : '') + '">' + icon('back') + 'Products</a>' +
    '<header class="page-head"><h1>' + esc(productName(p)) + '</h1>' +
      '<p class="muted">' + esc([p.category || p.department || null, hasUpc(p) ? 'UPC ' + p.upc : 'No UPC yet', p.flagged ? 'Flagged for owner review' : null]
        .filter(Boolean).join(' · ')) + '</p></header>' +
    '<div class="stats">' +
      '<div class="stat"><b class="mono">' + fmtMoney(cost) + '</b><span>unit cost</span></div>' +
      '<div class="stat"><b class="mono">' + fmtMoney(retail) + '</b><span>retail</span></div>' +
      '<div class="stat"><b class="mono">' + fmtMoney(margin) + '</b><span>margin' + (marginPct != null ? ' · ' + marginPct.toFixed(0) + '%' : '') + '</span></div>' +
      '<div class="stat ' + s.tone + '"><b class="mono">' + fmtMoney(rule) + '</b><span>rule price · ' + esc(s.label.toLowerCase()) + '</span></div>' +
    '</div>' +
    (alert ? '<div class="notice warn">' + icon('alert') + '<span>Cost went up ' + esc(Number(alert.percent_change).toFixed(1)) +
      '% (' + fmtMoney(alert.previous_unit_cost) + ' → ' + fmtMoney(alert.new_unit_cost) + ') on ' + esc(fmtDate(alert.changed_at)) + '.</span></div>' : '') +
    '<section class="card">' +
      '<h2 class="card-h">' + icon('shield') + 'Price</h2>' +
      (gap && !p.internal
        ? '<div class="rule-fix"><p>' + (retail != null && retail > rule
            ? 'Retail is above the rule. Lowering it is allowed but needs a confirm.'
            : 'Retail is under the ×1.70 rule' + (s.key === 'below' ? ' and below cost' : '') + '.') + '</p>' +
          '<button type="button" class="btn ' + (retail != null && retail > rule ? 'ghost' : 'primary') + '" id="ruleBtn">' +
          (retail != null && retail > rule ? 'Lower to rule · ' : 'Fix to rule · ') + fmtMoney(rule) + '</button></div>'
        : (rule != null ? '<p class="muted">' + icon('check') + ' On the ×1.70 rule.</p>' : '<p class="muted">No cost on file, so there is no rule price.</p>')) +
      '<form class="inline-form" id="retailForm">' +
        '<label class="fld"><span>Set retail</span><input type="number" inputmode="decimal" step="0.01" min="0" id="retailInput" placeholder="' +
          (retail != null ? retail.toFixed(2) : '0.00') + '"></label>' +
        '<button type="submit" class="btn">Save price</button>' +
      '</form>' +
      '<div class="form-msg" id="retailMsg" role="status"></div>' +
    '</section>' +
    '<section class="card">' +
      '<h2 class="card-h">' + icon('barcode') + 'Barcode</h2>' +
      (hasUpc(p)
        ? '<p class="mono big">' + esc(p.upc) + '</p><button type="button" class="link" id="upcReplace">Replace barcode</button><div id="upcBox"></div>'
        : '<p class="muted">No barcode yet. Labels and scanning need one.</p><div id="upcBox"></div>') +
    '</section>' +
    '<section class="card">' +
      '<h2 class="card-h">' + icon('refresh') + 'Price history</h2><div id="histBox" class="muted">Loading…</div>' +
    '</section>';

  // Rule fix (with an explicit confirm before lowering a price)
  const ruleBtn = host.querySelector('#ruleBtn');
  if (ruleBtn) {
    let confirmLower = false;
    ruleBtn.addEventListener('click', async () => {
      const res = await applyRule(ctx, p, ruleBtn, confirmLower);
      if (res === true) { history.delete(p.id); ctx.render(); return; }
      if (res && res.code === 'WOULD_LOWER_PRICE') {
        confirmLower = true;
        ruleBtn.textContent = 'Confirm: lower to ' + fmtMoney(res.rulePrice);
        ruleBtn.classList.add('danger');
        host.querySelector('#retailMsg').textContent = 'This lowers the shelf price. Tap again to confirm.';
      }
    });
  }

  // Manual retail
  host.querySelector('#retailForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const msg = host.querySelector('#retailMsg');
    const v = num(host.querySelector('#retailInput').value);
    if (v == null || v <= 0) { msg.textContent = 'Enter a price above $0.00.'; return; }
    if (cost != null && v < cost && !p.internal) { msg.textContent = 'That is below cost (' + fmtMoney(cost) + '). The hub will not accept it.'; return; }
    setBusy(btn, true, 'Saving…');
    try {
      await ctx.api.setRetail(p.id, v);
      toast(icon('check') + ' <b>' + esc(productName(p)) + '</b> → ' + fmtMoney(v), 'ok');
      history.delete(p.id);
      await ctx.afterAction({ products: true });
      ctx.render();
    } catch (err) {
      msg.textContent = err.message;
      setBusy(btn, false);
    }
  });

  // Barcode
  const upcBox = host.querySelector('#upcBox');
  const mount = () => mountUpcFinder(upcBox, { ctx, productId: p.id, query: productName(p), onSaved: () => ctx.render() });
  if (!hasUpc(p)) mount();
  const replace = host.querySelector('#upcReplace');
  if (replace) replace.addEventListener('click', () => { replace.remove(); mount(); });

  // History
  const box = host.querySelector('#histBox');
  const drawHistory = (rows) => {
    if (rows.error) { box.textContent = 'History unavailable: ' + rows.error; return; }
    box.innerHTML = rows.length
      ? '<ul class="hist">' + rows.slice(0, 10).map((h) =>
          '<li><span class="mono">' + fmtMoney(h.previous_retail_price != null ? h.previous_retail_price : h.old_retail_price) +
          ' → <b>' + fmtMoney(h.new_retail_price != null ? h.new_retail_price : h.new_price) + '</b></span>' +
          '<span class="muted small">' + esc(fmtDate(h.changed_at || h.created_at)) + '</span></li>').join('') + '</ul>'
      : 'No recorded changes yet.';
  };
  if (history.has(p.id)) drawHistory(history.get(p.id));
  else {
    ctx.api.getHistory(p.id)
      .then((rows) => { history.set(p.id, rows); if (box.isConnected) drawHistory(rows); })
      .catch((e) => { if (box.isConnected) drawHistory({ error: e.message }); });
  }
}
