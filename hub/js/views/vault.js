/* Vault — money view: P&L for the imported period, the POS sales feed (and
   its import), margin by category, vendor spend, invoice aging and cost
   increase alerts. All figures come from GET /financials. */

import { fmtDate } from '../../../pricing-hub/js/api.js';
import { esc, icon, fmtMoney, num, toast, setBusy, emptyState, fmtPct, fmtInt } from '../ui.js';

function pick(s, keys) {
  for (const k of keys) { const v = num(s[k]); if (v != null) return v; }
  return null;
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function render(ctx, route, host) {
  const fin = ctx.state.financials;
  const g = ctx.state.game;
  const sales = g && g.missions ? g.missions.find((m) => m.key === 'sales_feed') : null;
  const s = (fin && fin.summary) || {};
  const revenue = pick(s, ['gross_sales', 'revenue', 'total_revenue']);
  const cogs = pick(s, ['cost_of_goods', 'cogs', 'total_cost']);
  const profit = pick(s, ['gross_profit', 'profit']);
  const marginPct = revenue && profit != null ? (profit / revenue) * 100 : null;
  const share = num(s.costed_revenue_share);

  const margin = ((fin && fin.margin) || []).slice().sort((a, b) => (num(b.revenue) || 0) - (num(a.revenue) || 0)).slice(0, 10);
  const maxRev = Math.max(1, ...margin.map((m) => num(m.revenue) || 0));

  const vendors = new Map();
  for (const r of (fin && fin.vendorSpend) || []) {
    const k = r.vendor_name || 'Unknown vendor';
    const v = vendors.get(k) || { name: k, spend: 0, invoices: 0 };
    v.spend += num(r.total_spend) || 0;
    v.invoices += num(r.invoice_count) || 0;
    vendors.set(k, v);
  }
  const topVendors = [...vendors.values()].sort((a, b) => b.spend - a.spend).slice(0, 8);

  const buckets = new Map();
  for (const r of (fin && fin.aging) || []) {
    const b = buckets.get(r.bucket) || { bucket: r.bucket, n: 0, amount: 0 };
    b.n += 1; b.amount += num(r.amount) || 0;
    buckets.set(r.bucket, b);
  }
  const alerts = ((fin && fin.alerts) || []).slice(0, 10);

  host.innerHTML =
    '<header class="page-head"><h1>Vault</h1><p class="muted">' +
      (s.period_start ? 'Sales period ' + esc(fmtDate(s.period_start)) + ' – ' + esc(fmtDate(s.period_end)) : 'Financials from imported POS sales and approved invoices') +
    '</p></header>' +
    (!fin ? '<div class="notice warn">' + icon('alert') + '<span>Financials did not load. Pull to refresh or try again later.</span></div>' : '') +
    '<div class="kpis">' +
      kpi('Gross sales', fmtMoney(revenue)) +
      kpi('Cost of goods', fmtMoney(cogs)) +
      kpi('Gross profit', fmtMoney(profit), marginPct != null ? fmtPct(marginPct) + ' margin' : '') +
      kpi('Costed revenue', share != null ? fmtPct(share) : '—', 'of sales has a known cost') +
      kpi('Units sold', fmtInt(s.units_sold)) +
      kpi('Vendor spend', fmtMoney(num(s.vendor_spend)), s.invoice_count != null ? fmtInt(s.invoice_count) + ' invoices' : '') +
    '</div>' +
    '<section class="card' + (sales && !sales.done ? ' attn' : '') + '">' +
      '<h2 class="card-h">' + icon('vault') + 'Feed the Vault — POS sales</h2>' +
      (sales ? '<p class="' + (sales.done ? 'muted' : '') + '">' + esc(sales.brief) + '</p>' : '') +
      '<p class="muted small">Upload the NRS sales export (CSV). Re-uploading the same file is safe; it is counted once.</p>' +
      '<label class="btn ' + (sales && !sales.done ? 'primary' : '') + '">' + icon('upload') + 'Import sales CSV' +
        '<input type="file" accept=".csv,text/csv" class="sr-only" id="posFile"></label>' +
      '<div class="form-msg" id="posMsg" role="status"></div>' +
    '</section>' +
    '<div class="vault-grid">' +
      '<section class="card"><h2 class="card-h">Margin by category</h2>' +
        (margin.length ? '<ul class="bars">' + margin.map((m) =>
          '<li><div class="bar-head"><span>' + esc(m.label || 'Uncategorized') + '</span><span class="mono">' + fmtMoney(m.revenue) +
          ' · <b>' + fmtPct(m.margin_pct) + '</b></span></div>' +
          '<div class="bar"><div class="bar-fill" style="width:' + Math.max(2, ((num(m.revenue) || 0) / maxRev) * 100) + '%"></div></div></li>').join('') + '</ul>'
          : emptyState('vault', 'No sales yet', 'Import a POS export to see margins.')) +
      '</section>' +
      '<section class="card"><h2 class="card-h">Vendor spend</h2>' +
        (topVendors.length ? '<table class="tbl"><thead><tr><th>Vendor</th><th>Invoices</th><th>Spend</th></tr></thead><tbody>' +
          topVendors.map((v) => '<tr><td>' + esc(v.name) + '</td><td>' + fmtInt(v.invoices) + '</td><td class="mono">' + fmtMoney(v.spend) + '</td></tr>').join('') +
          '</tbody></table>' : emptyState('file', 'No approved invoices yet', 'Spend appears once invoices are approved.')) +
      '</section>' +
      '<section class="card"><h2 class="card-h">Invoice aging</h2>' +
        (buckets.size ? '<table class="tbl"><thead><tr><th>Bucket</th><th>Invoices</th><th>Amount</th></tr></thead><tbody>' +
          [...buckets.values()].map((b) => '<tr><td>' + esc(b.bucket) + '</td><td>' + b.n + '</td><td class="mono">' + fmtMoney(b.amount) + '</td></tr>').join('') +
          '</tbody></table>' : '<p class="muted">Nothing outstanding.</p>') +
      '</section>' +
      '<section class="card"><h2 class="card-h">' + icon('alert') + 'Cost increases</h2>' +
        (alerts.length ? '<ul class="alert-list">' + alerts.map((a) =>
          '<li><a href="#/products/' + encodeURIComponent(a.product_id) + '">' + esc(a.product_name) + '</a>' +
          '<span class="mono small">' + fmtMoney(a.previous_unit_cost) + ' → ' + fmtMoney(a.new_unit_cost) +
          ' <b class="txt-bad">+' + fmtPct(a.percent_change) + '</b></span></li>').join('') + '</ul>'
          : '<p class="muted">No cost increases in the window.</p>') +
      '</section>' +
    '</div>' +
    '<section class="card"><h2 class="card-h">' + icon('file') + 'Price-gun labels</h2>' +
      '<p class="muted small">CSV of item, UPC, price and department for the label printer.</p>' +
      '<button type="button" class="btn" id="labelsBtn">' + icon('file') + 'Download all labels</button></section>';

  const file = host.querySelector('#posFile');
  file.addEventListener('change', async () => {
    const f = file.files && file.files[0];
    file.value = '';
    if (!f) return;
    const msg = host.querySelector('#posMsg');
    msg.textContent = 'Importing ' + f.name + '…';
    try {
      const res = await ctx.api.importPos(f);
      const sm = (res && res.summary) || {};
      const done = res && res.duplicate
        ? '<b class="txt-good">Already imported</b> — this export was counted before.'
        : '<b class="txt-good">Imported ' + esc(fmtInt(sm.row_count)) + ' rows</b>' +
          (sm.period_start ? ' · ' + esc(sm.period_start) + ' → ' + esc(sm.period_end || '') : '') +
          (res && res.matched != null ? ' · ' + esc(String(res.matched)) + ' matched to the catalog' : '');
      await ctx.afterAction({ financials: true });
      ctx.render(); // fresh numbers; the new page gets the result line below
      const fresh = document.getElementById('posMsg');
      if (fresh) fresh.innerHTML = done;
      toast(icon('check') + ' <b>Sales import done</b>', 'ok');
    } catch (e) {
      msg.textContent = e.message;
    }
  });

  host.querySelector('#labelsBtn').addEventListener('click', async (e) => {
    const b = e.currentTarget;
    setBusy(b, true, 'Preparing…');
    try {
      downloadBlob(await ctx.api.downloadLabels(), 'price-labels.csv');
    } catch (err) {
      toast('Could not download labels: ' + esc(err.message), 'err');
    } finally {
      setBusy(b, false);
    }
  });
}

function kpi(label, value, sub) {
  return '<div class="kpi"><span class="kpi-label">' + esc(label) + '</span><b class="kpi-val mono">' + esc(value) + '</b>' +
    (sub ? '<span class="kpi-sub muted small">' + esc(sub) + '</span>' : '') + '</div>';
}
