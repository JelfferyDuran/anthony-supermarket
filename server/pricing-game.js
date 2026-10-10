'use strict';

// The Pricing Hub game layer: missions, XP, levels, streaks, badges and the
// store's "dock integrity" health score.
//
// Pure functions over records the pricing tables ALREADY keep:
//   * who approved or closed an invoice   pricing_invoices.approved_by / approved_at
//   * who set a line aside (short, wrong) pricing_invoice_lines.approved_by on rejected lines
//   * who repriced an item by hand        pricing_price_history.changed_by
//   * who imported POS sales              pos_import_batches.imported_by
//
// Nothing here writes and nothing is stored per player, so the browser cannot
// claim XP: a player's progress is whatever the audit trail says they did.
// Missions are the live work queues themselves — they clear when the real work
// is done, not when someone taps "complete".

const { suggestedRetail } = require('./pricing-engine');

const STORE_TZ = 'America/New_York';
const DAY_MS = 86_400_000;

// A read takes 30-90s. An invoice still 'extracting' long after it was created
// is not being read by anyone: the request that started it failed or died.
const STALE_EXTRACTION_MS = 10 * 60 * 1000;

// Approval writes its own price-history rows. Clients before 2026-10-10 did not
// link those rows to their invoice line, so a history row stamped by the same
// person this close to their own approval belongs to that approval (already
// scored) rather than to a separate hand reprice.
const APPROVAL_HISTORY_WINDOW_MS = 120_000;

const XP = Object.freeze({
  invoiceApproved: 100,
  perApprovedLine: 5,
  pennyPerfect: 50,      // approved total matched the printed subtotal to the cent
  invoiceClosed: 40,     // every line excluded: the delivery never came
  lineException: 8,      // a short or wrong line caught before it was priced
  retailEdit: 15,
  posImport: 60
});

const LEVELS = Object.freeze([
  { level: 1, xp: 0, title: 'Dock Hand' },
  { level: 2, xp: 250, title: 'Receiver' },
  { level: 3, xp: 600, title: 'Line Checker' },
  { level: 4, xp: 1100, title: 'Price Scout' },
  { level: 5, xp: 1800, title: 'Margin Keeper' },
  { level: 6, xp: 2700, title: 'Floor Captain' },
  { level: 7, xp: 3900, title: 'Dock Boss' },
  { level: 8, xp: 5400, title: 'Pricing Chief' },
  { level: 9, xp: 7200, title: 'Vault Keeper' },
  { level: 10, xp: 9500, title: 'Kingpin of the Dock' }
]);

const BADGES = Object.freeze([
  { key: 'first_pallet', name: 'First Pallet', desc: 'Approve your first invoice', stat: 'approvals', goal: 1 },
  { key: 'penny_perfect', name: 'Penny Perfect', desc: 'Approve an invoice that reconciles to the cent', stat: 'perfect', goal: 1 },
  { key: 'ten_pallets', name: 'Ten Pallets', desc: 'Approve 10 invoices', stat: 'approvals', goal: 10 },
  { key: 'sharp_eye', name: 'Sharp Eye', desc: 'Catch 10 short or wrong lines', stat: 'exceptions', goal: 10 },
  { key: 'price_keeper', name: 'Price Keeper', desc: 'Make 10 retail corrections', stat: 'edits', goal: 10 },
  { key: 'sales_scribe', name: 'Sales Scribe', desc: 'Import a POS sales export', stat: 'imports', goal: 1 },
  { key: 'week_warrior', name: 'Week Warrior', desc: 'Keep a 7-day work streak', stat: 'bestStreak', goal: 7 }
]);

const clamp = (value, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, value));
const toTime = value => {
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : null;
};
const numberOrNull = value => {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: STORE_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });

// Calendar day in the store's timezone as an integer ordinal, so streaks follow
// the store's day (a 9pm approval counts for today, not tomorrow UTC).
function storeDay(time) {
  const [y, m, d] = dayFormat.format(new Date(time)).split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

function dateOnlyDay(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''));
  return match ? Math.round(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / DAY_MS) : null;
}

function displayName(email) {
  const local = String(email || '').split('@')[0];
  return local || 'Operator';
}

// An intake nobody will finish on their own: stored but never read, or stuck
// mid-read well past any real extraction time.
function isStuckIntake(invoice, now = Date.now()) {
  if (!invoice) return false;
  if (invoice.status === 'uploaded') return true;
  if (invoice.status !== 'extracting') return false;
  const created = toTime(invoice.created_at);
  return created == null || now - created > STALE_EXTRACTION_MS;
}

// The binding shelf rule for a product, or null when it cannot be priced
// (internal supply, or no unit cost on file yet).
function rulePriceFor(product) {
  if (!product || product.internal) return null;
  const cost = numberOrNull(product.current_unit_cost);
  if (cost == null || cost <= 0) return null;
  return suggestedRetail(cost);
}

// ── XP ledger ─────────────────────────────────────────────────────────────────
function buildEvents({ invoices = [], lineExceptions = [], retailEdits = [], posImports = [] } = {}) {
  const events = [];
  const approvals = [];

  for (const inv of invoices) {
    const at = toTime(inv.approved_at);
    if (!inv.approved_by || at == null) continue;
    if (inv.status === 'imported') {
      const lines = Math.max(0, Number(inv.line_count) || 0);
      const variance = numberOrNull(inv.reconciliation_variance);
      const perfect = variance != null && Math.abs(variance) < 0.005;
      events.push({
        kind: 'invoice_approved', userId: inv.approved_by, at, ref: inv.id, lines, perfect,
        xp: XP.invoiceApproved + lines * XP.perApprovedLine + (perfect ? XP.pennyPerfect : 0),
        label: `Approved invoice #${inv.invoice_number || '—'}${perfect ? ' · penny perfect' : ''}`
      });
      approvals.push({ userId: inv.approved_by, at });
    } else if (inv.status === 'rejected') {
      events.push({
        kind: 'invoice_closed', userId: inv.approved_by, at, ref: inv.id, xp: XP.invoiceClosed,
        label: `Closed invoice #${inv.invoice_number || '—'} (nothing arrived)`
      });
    }
  }

  for (const line of lineExceptions) {
    const at = toTime(line.approved_at);
    if (!line.approved_by || at == null) continue;
    events.push({
      kind: 'line_exception', userId: line.approved_by, at, ref: line.id, xp: XP.lineException,
      label: 'Caught a short or wrong line'
    });
  }

  for (const row of retailEdits) {
    const at = toTime(row.changed_at);
    if (!row.changed_by || at == null || row.invoice_line_id) continue;
    const fromApproval = approvals.some(a => a.userId === row.changed_by && Math.abs(a.at - at) <= APPROVAL_HISTORY_WINDOW_MS);
    if (fromApproval) continue;
    events.push({
      kind: 'retail_edit', userId: row.changed_by, at, ref: row.product_id, xp: XP.retailEdit,
      label: 'Repriced an item'
    });
  }

  for (const batch of posImports) {
    const at = toTime(batch.created_at);
    if (!batch.imported_by || at == null) continue;
    events.push({
      kind: 'pos_import', userId: batch.imported_by, at, ref: batch.id, xp: XP.posImport,
      label: `Imported POS sales${batch.period_end ? ' through ' + String(batch.period_end).slice(0, 10) : ''}`
    });
  }

  return events.sort((a, b) => b.at - a.at);
}

function levelFor(xp) {
  let current = LEVELS[0];
  for (const step of LEVELS) if (xp >= step.xp) current = step;
  const next = LEVELS.find(step => step.xp > xp) || null;
  return {
    xp,
    level: current.level,
    title: current.title,
    levelFloor: current.xp,
    nextAt: next ? next.xp : null,
    nextTitle: next ? next.title : null,
    progress: next ? Math.round(((xp - current.xp) / (next.xp - current.xp)) * 1000) / 1000 : 1
  };
}

function streakFor(events, now) {
  const days = new Set(events.map(e => storeDay(e.at)));
  const today = storeDay(now);
  let start = days.has(today) ? today : days.has(today - 1) ? today - 1 : null;
  let current = 0;
  while (start != null && days.has(start - current)) current++;

  let best = 0;
  let run = 0;
  let prev = null;
  for (const day of [...days].sort((a, b) => a - b)) {
    run = prev != null && day === prev + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  }
  return { current, best, activeToday: days.has(today), atRisk: current > 0 && !days.has(today) };
}

function playerStats(events, streak) {
  const stats = { approvals: 0, perfect: 0, exceptions: 0, edits: 0, imports: 0, bestStreak: streak.best };
  const earnedAt = {};
  const chronological = [...events].sort((a, b) => a.at - b.at);
  for (const e of chronological) {
    if (e.kind === 'invoice_approved') { stats.approvals++; if (e.perfect) stats.perfect++; }
    else if (e.kind === 'line_exception') stats.exceptions++;
    else if (e.kind === 'retail_edit') stats.edits++;
    else if (e.kind === 'pos_import') stats.imports++;
    for (const badge of BADGES) {
      if (!earnedAt[badge.key] && badge.stat !== 'bestStreak' && stats[badge.stat] >= badge.goal) {
        earnedAt[badge.key] = new Date(e.at).toISOString();
      }
    }
  }
  const badges = BADGES.map(badge => ({
    key: badge.key,
    name: badge.name,
    desc: badge.desc,
    goal: badge.goal,
    value: Math.min(stats[badge.stat], badge.goal),
    earned: stats[badge.stat] >= badge.goal,
    earnedAt: earnedAt[badge.key] || null
  }));
  return { stats, badges };
}

// ── Missions: the live work queues ────────────────────────────────────────────
function buildMissions({ products = [], openInvoices = [], queueLines = [], latestPos = null, increaseAlerts = [], now = Date.now() }) {
  const missions = [];
  const ageDays = value => {
    const t = toTime(value);
    return t == null ? null : Math.max(0, Math.floor((now - t) / DAY_MS));
  };

  // 1. Review Line — invoices waiting on a human decision.
  const linesByInvoice = new Map();
  for (const line of queueLines) {
    linesByInvoice.set(line.invoice_id, (linesByInvoice.get(line.invoice_id) || 0) + 1);
  }
  const awaiting = openInvoices
    .filter(inv => inv.status === 'needs_review')
    .map(inv => ({
      id: inv.id,
      label: `#${inv.invoice_number || '—'}`,
      lines: linesByInvoice.get(inv.id) || Number(inv.line_count) || 0,
      ageDays: ageDays(inv.created_at)
    }))
    .sort((a, b) => (b.ageDays || 0) - (a.ageDays || 0));
  const oldest = awaiting.length ? awaiting[0].ageDays || 0 : 0;
  const reviewLines = awaiting.reduce((sum, inv) => sum + inv.lines, 0);
  missions.push({
    key: 'review_line',
    title: 'Clear the Review Line',
    brief: awaiting.length
      ? `${awaiting.length} invoice${awaiting.length === 1 ? '' : 's'} (${reviewLines} lines) waiting${oldest ? ` · oldest ${oldest} day${oldest === 1 ? '' : 's'}` : ''}. Match each line to a product and approve.`
      : 'Every delivered invoice is priced. The line is clear.',
    zone: 'review',
    action: 'review',
    count: awaiting.length,
    unit: 'invoice',
    countLabel: awaiting.length === 1 ? 'invoice waiting' : 'invoices waiting',
    done: awaiting.length === 0,
    priority: !awaiting.length ? 'clear' : oldest > 14 ? 'critical' : oldest > 3 ? 'high' : 'normal',
    xpEach: XP.invoiceApproved,
    xpPotential: awaiting.reduce((sum, inv) => sum + XP.invoiceApproved + inv.lines * XP.perApprovedLine, 0),
    items: awaiting.slice(0, 12)
  });

  // 2. Rescue stuck scans — stored but never read, or abandoned mid-read.
  const stuck = openInvoices
    .filter(inv => isStuckIntake(inv, now))
    .map(inv => ({
      id: inv.id,
      label: inv.invoice_number ? `#${inv.invoice_number}` : `Scan from ${String(inv.created_at || '').slice(0, 10) || 'unknown date'}`,
      status: inv.status,
      hasScan: Boolean(inv.source_object_path),
      ageDays: ageDays(inv.created_at)
    }));
  missions.push({
    key: 'rescue_intake',
    title: 'Rescue Stuck Scans',
    brief: stuck.length
      ? `${stuck.length} scan${stuck.length === 1 ? ' is' : 's are'} stored but never made it to review. Re-read each one so its lines reach the Review Line.`
      : 'Every stored scan has been read.',
    zone: 'intake',
    action: 'rescue',
    count: stuck.length,
    unit: 'scan',
    countLabel: stuck.length === 1 ? 'scan stuck' : 'scans stuck',
    done: stuck.length === 0,
    priority: stuck.length ? 'high' : 'clear',
    xpEach: 0,
    xpPotential: 0,
    items: stuck.slice(0, 12)
  });

  // 3. Rule Guard — sold items priced under retail = cost × 1.70 (.99).
  const spikes = new Map();
  for (const alert of increaseAlerts || []) {
    if (alert && alert.product_id && !spikes.has(alert.product_id)) spikes.set(alert.product_id, numberOrNull(alert.percent_change));
  }
  const leaks = [];
  for (const product of products) {
    const rule = rulePriceFor(product);
    if (rule == null) continue;
    const retail = numberOrNull(product.current_retail_price);
    const cost = numberOrNull(product.current_unit_cost);
    if (retail != null && retail >= rule - 0.005) continue;
    leaks.push({
      id: product.id,
      name: product.name || 'Unnamed product',
      cost,
      retail,
      rulePrice: rule,
      gap: retail == null ? rule : Math.round((rule - retail) * 100) / 100,
      belowCost: retail != null && cost != null && retail < cost,
      spikePct: spikes.has(product.id) ? spikes.get(product.id) : null
    });
  }
  leaks.sort((a, b) => Number(b.belowCost) - Number(a.belowCost) || b.gap - a.gap);
  missions.push({
    key: 'rule_guard',
    title: 'Rule Guard',
    brief: leaks.length
      ? `${leaks.length} item${leaks.length === 1 ? ' sells' : 's sell'} under the ×1.70 rule${leaks.some(l => l.belowCost) ? ', some below cost' : ''}. Apply the rule price or review each one.`
      : 'Every priced item sits on or above the ×1.70 rule.',
    zone: 'aisles',
    action: 'apply-rule',
    count: leaks.length,
    unit: 'item',
    countLabel: 'under the rule',
    done: leaks.length === 0,
    priority: !leaks.length ? 'clear' : leaks.some(l => l.belowCost) ? 'critical' : 'high',
    xpEach: XP.retailEdit,
    xpPotential: leaks.length * XP.retailEdit,
    items: leaks.slice(0, 25)
  });

  // 4. Feed the Vault — POS sales must be current for the financials to mean anything.
  const lastDay = latestPos ? dateOnlyDay(latestPos.period_end) : null;
  const yesterday = storeDay(now) - 1;
  const staleDays = lastDay == null ? null : Math.max(0, yesterday - lastDay);
  const salesDone = staleDays != null && staleDays <= 1;
  missions.push({
    key: 'sales_feed',
    title: 'Feed the Vault',
    brief: lastDay == null
      ? 'No POS sales have been imported yet. Upload an NRS sales export in the Vault.'
      : salesDone
        ? `Sales are current through ${String(latestPos.period_end).slice(0, 10)}.`
        : `Sales stop at ${String(latestPos.period_end).slice(0, 10)}: ${staleDays} day${staleDays === 1 ? '' : 's'} missing. Import the NRS exports since then.`,
    zone: 'vault',
    action: 'pos-import',
    count: salesDone ? 0 : (staleDays == null ? 1 : staleDays),
    unit: 'day',
    countLabel: lastDay == null ? 'never imported' : (staleDays === 1 ? 'day behind' : 'days behind'),
    done: salesDone,
    priority: salesDone ? 'clear' : staleDays == null || staleDays > 7 ? 'critical' : 'high',
    xpEach: XP.posImport,
    xpPotential: salesDone ? 0 : XP.posImport,
    lastPeriodEnd: latestPos && latestPos.period_end ? String(latestPos.period_end).slice(0, 10) : null,
    items: []
  });

  return missions;
}

// ── Health: one number for "is the pricing operation in shape?" ───────────────
function buildHealth({ products = [], missions = [] }) {
  const mission = key => missions.find(m => m.key === key) || { count: 0, items: [] };
  const review = mission('review_line');
  const rescue = mission('rescue_intake');
  const rule = mission('rule_guard');
  const sales = mission('sales_feed');

  const oldest = review.items.length ? review.items[0].ageDays || 0 : 0;
  const sold = products.filter(p => !p.internal);
  const priced = sold.filter(p => rulePriceFor(p) != null).length;
  const belowCost = (rule.items || []).filter(i => i.belowCost).length;
  const withUpc = products.filter(p => String(p.upc || '').replace(/\D/g, '')).length;
  const flagged = products.filter(p => p.flagged).length;

  const components = [
    {
      key: 'review', label: 'Review backlog', weight: 30,
      score: review.count ? clamp(100 - oldest * 4 - review.count * 3) : 100,
      detail: review.count ? `${review.count} invoice(s) waiting, oldest ${oldest} day(s)` : 'Clear'
    },
    {
      key: 'intake', label: 'Intake flow', weight: 15,
      score: clamp(100 - rescue.count * 34),
      detail: rescue.count ? `${rescue.count} stuck scan(s)` : 'Flowing'
    },
    {
      key: 'pricing', label: 'Price rule', weight: 25,
      score: priced ? clamp(100 - (rule.count / priced) * 500 - belowCost * 10) : 100,
      detail: rule.count ? `${rule.count} of ${priced} priced items under rule` : `${priced} of ${priced} priced items on rule`
    },
    {
      key: 'sales', label: 'Sales feed', weight: 20,
      score: sales.done ? 100 : sales.lastPeriodEnd ? clamp(100 - sales.count * 5) : 0,
      detail: sales.done ? 'Current' : sales.lastPeriodEnd ? `${sales.count} day(s) behind` : 'No sales imported'
    },
    {
      key: 'identity', label: 'UPC coverage', weight: 10,
      score: products.length ? Math.round((withUpc / products.length) * 100) : 100,
      detail: `${withUpc} of ${products.length} products carry a UPC${flagged ? ` · ${flagged} flagged for owner review` : ''}`
    }
  ].map(c => ({ ...c, score: Math.round(c.score) }));

  const score = Math.round(components.reduce((sum, c) => sum + c.score * c.weight, 0) / 100);
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';
  const status = score >= 90 ? 'Shipshape' : score >= 75 ? 'Steady' : score >= 50 ? 'Strained' : 'Critical';
  return { score, grade, status, components };
}

// ── Leaderboard + team feed ───────────────────────────────────────────────────
function buildLeaderboard(events, names, { now, youId }) {
  const weekStart = now - 7 * DAY_MS;
  const totals = new Map();
  for (const e of events) {
    const row = totals.get(e.userId) || { week: 0, all: 0 };
    row.all += e.xp;
    if (e.at >= weekStart) row.week += e.xp;
    totals.set(e.userId, row);
  }
  const rows = [...totals.entries()].map(([userId, t]) => ({
    name: names[userId] || 'Teammate',
    you: Boolean(youId) && userId === youId,
    weekXp: t.week,
    xp: t.all,
    level: levelFor(t.all).level
  }));
  return {
    week: rows.filter(r => r.weekXp > 0).sort((a, b) => b.weekXp - a.weekXp).slice(0, 10),
    allTime: rows.sort((a, b) => b.xp - a.xp).slice(0, 10)
  };
}

function buildGameState({
  identity = null,
  products = [],
  openInvoices = [],
  queueLines = [],
  events = [],
  latestPos = null,
  increaseAlerts = [],
  names = {},
  now = Date.now()
} = {}) {
  const youId = identity && identity.userId ? identity.userId : null;
  const mine = youId ? events.filter(e => e.userId === youId) : [];
  const xp = mine.reduce((sum, e) => sum + e.xp, 0);
  const streak = streakFor(mine, now);
  const { stats, badges } = playerStats(mine, streak);
  const weekStart = now - 7 * DAY_MS;
  const todayDay = storeDay(now);

  const missions = buildMissions({ products, openInvoices, queueLines, latestPos, increaseAlerts, now });
  const health = buildHealth({ products, missions });

  return {
    generatedAt: new Date(now).toISOString(),
    player: {
      name: identity && identity.email ? displayName(identity.email) : 'Operator',
      email: identity && identity.email ? identity.email : null,
      // Operator tokens and local demo have no person to credit.
      scoring: Boolean(youId),
      ...levelFor(xp),
      weekXp: mine.filter(e => e.at >= weekStart).reduce((sum, e) => sum + e.xp, 0),
      todayXp: mine.filter(e => storeDay(e.at) === todayDay).reduce((sum, e) => sum + e.xp, 0),
      streak,
      stats,
      badges,
      recent: mine.slice(0, 8).map(e => ({ kind: e.kind, label: e.label, xp: e.xp, at: new Date(e.at).toISOString() }))
    },
    health,
    missions,
    leaderboard: buildLeaderboard(events, names, { now, youId }),
    feed: events.slice(0, 12).map(e => ({
      name: names[e.userId] || 'Teammate',
      you: Boolean(youId) && e.userId === youId,
      kind: e.kind,
      label: e.label,
      xp: e.xp,
      at: new Date(e.at).toISOString()
    })),
    rules: { xp: XP, levels: LEVELS, badges: BADGES.map(({ key, name, desc, goal }) => ({ key, name, desc, goal })) }
  };
}

module.exports = {
  APPROVAL_HISTORY_WINDOW_MS,
  BADGES,
  LEVELS,
  STALE_EXTRACTION_MS,
  STORE_TZ,
  XP,
  buildEvents,
  buildGameState,
  buildHealth,
  buildMissions,
  displayName,
  isStuckIntake,
  levelFor,
  rulePriceFor,
  storeDay,
  streakFor
};
