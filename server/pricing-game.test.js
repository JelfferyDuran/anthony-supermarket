'use strict';

// Unit tests for the Pricing Hub game layer (pricing-game.js). Pure functions,
// so every input is an in-memory record shaped like the real table rows.

const test = require('node:test');
const assert = require('node:assert/strict');
const game = require('./pricing-game');
const { suggestedRetail } = require('./pricing-engine');

const ANA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const BEN = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const NOW = Date.parse('2026-10-10T16:00:00Z'); // Oct 10, noon in the store

test('approvals score base + per line, with a penny-perfect bonus', () => {
  const events = game.buildEvents({
    invoices: [
      { id: 'i1', invoice_number: '100', status: 'imported', approved_by: ANA, approved_at: '2026-10-10T14:00:00Z', line_count: 4, reconciliation_variance: 0 },
      { id: 'i2', invoice_number: '101', status: 'imported', approved_by: ANA, approved_at: '2026-10-10T15:00:00Z', line_count: 2, reconciliation_variance: 0.01 },
      { id: 'i3', invoice_number: '102', status: 'rejected', approved_by: BEN, approved_at: '2026-10-10T15:30:00Z' },
      { id: 'i4', invoice_number: '103', status: 'needs_review', approved_by: null }
    ]
  });
  const byRef = Object.fromEntries(events.map(e => [e.ref, e]));
  assert.equal(byRef.i1.xp, game.XP.invoiceApproved + 4 * game.XP.perApprovedLine + game.XP.pennyPerfect);
  assert.equal(byRef.i1.perfect, true);
  assert.equal(byRef.i2.xp, game.XP.invoiceApproved + 2 * game.XP.perApprovedLine);
  assert.equal(byRef.i3.kind, 'invoice_closed');
  assert.equal(byRef.i3.xp, game.XP.invoiceClosed);
  assert.equal(byRef.i4, undefined, 'unattributed invoices score nothing');
  assert.deepEqual(events.map(e => e.ref), ['i3', 'i2', 'i1'], 'newest first');
});

test('approval history is not double-counted as hand reprices', () => {
  const events = game.buildEvents({
    invoices: [{ id: 'i1', status: 'imported', approved_by: ANA, approved_at: '2026-10-10T14:00:00Z', line_count: 1 }],
    retailEdits: [
      // written by the approval itself (same person, same moment, unlinked legacy row)
      { product_id: 'p1', changed_by: ANA, changed_at: '2026-10-10T14:00:01Z', invoice_line_id: null },
      // linked to an invoice line: always part of an approval
      { product_id: 'p2', changed_by: ANA, changed_at: '2026-10-09T10:00:00Z', invoice_line_id: 'line-1' },
      // a genuine hand reprice an hour later
      { product_id: 'p3', changed_by: ANA, changed_at: '2026-10-10T15:00:00Z', invoice_line_id: null },
      // someone else repricing at the same moment as ANA's approval still counts for them
      { product_id: 'p4', changed_by: BEN, changed_at: '2026-10-10T14:00:01Z', invoice_line_id: null }
    ]
  });
  const edits = events.filter(e => e.kind === 'retail_edit');
  assert.deepEqual(edits.map(e => e.ref).sort(), ['p3', 'p4']);
  assert.ok(edits.every(e => e.xp === game.XP.retailEdit));
});

test('line exceptions and POS imports score for whoever recorded them', () => {
  const events = game.buildEvents({
    lineExceptions: [{ id: 'l1', approved_by: BEN, approved_at: '2026-10-10T12:00:00Z' }, { id: 'l2', approved_by: null, approved_at: '2026-10-10T12:00:00Z' }],
    posImports: [{ id: 'b1', imported_by: ANA, created_at: '2026-10-10T11:00:00Z', period_end: '2026-10-09' }]
  });
  assert.deepEqual(events.map(e => [e.kind, e.userId, e.xp]), [
    ['line_exception', BEN, game.XP.lineException],
    ['pos_import', ANA, game.XP.posImport]
  ]);
  assert.match(events[1].label, /2026-10-09/);
});

test('levels follow the published thresholds', () => {
  assert.deepEqual(game.levelFor(0), { xp: 0, level: 1, title: 'Dock Hand', levelFloor: 0, nextAt: 250, nextTitle: 'Receiver', progress: 0 });
  assert.equal(game.levelFor(249).level, 1);
  assert.equal(game.levelFor(250).level, 2);
  assert.equal(game.levelFor(425).progress, 0.5);
  const top = game.levelFor(100000);
  assert.equal(top.level, game.LEVELS[game.LEVELS.length - 1].level);
  assert.equal(top.nextAt, null);
  assert.equal(top.progress, 1);
});

test('streaks count store days, not UTC days', () => {
  // 01:30Z on Oct 10 is 21:30 on Oct 9 in New York.
  const at = iso => ({ at: Date.parse(iso) });
  const s = game.streakFor([at('2026-10-10T15:00:00Z'), at('2026-10-10T01:30:00Z'), at('2026-10-08T14:00:00Z')], NOW);
  assert.equal(s.current, 3, 'Oct 8, 9 (evening) and 10');
  assert.equal(s.activeToday, true);
  assert.equal(s.atRisk, false);

  const lapsed = game.streakFor([at('2026-10-09T15:00:00Z'), at('2026-10-08T15:00:00Z')], NOW);
  assert.equal(lapsed.current, 2, 'yesterday still counts');
  assert.equal(lapsed.atRisk, true, 'nothing yet today');

  const broken = game.streakFor([at('2026-10-07T15:00:00Z'), at('2026-10-06T15:00:00Z'), at('2026-10-05T15:00:00Z')], NOW);
  assert.equal(broken.current, 0);
  assert.equal(broken.best, 3);
});

test('stuck intake: uploaded always, extracting only once it is stale', () => {
  assert.equal(game.isStuckIntake({ status: 'uploaded', created_at: new Date(NOW).toISOString() }, NOW), true);
  assert.equal(game.isStuckIntake({ status: 'extracting', created_at: new Date(NOW - 60_000).toISOString() }, NOW), false);
  assert.equal(game.isStuckIntake({ status: 'extracting', created_at: new Date(NOW - game.STALE_EXTRACTION_MS - 1).toISOString() }, NOW), true);
  assert.equal(game.isStuckIntake({ status: 'needs_review', created_at: '2026-01-01T00:00:00Z' }, NOW), false);
});

function sampleProducts() {
  return [
    { id: 'on', name: 'On rule', current_unit_cost: 2.0, current_retail_price: suggestedRetail(2.0), upc: '012' },
    { id: 'under', name: 'Under rule', current_unit_cost: 2.0, current_retail_price: 2.49 },
    { id: 'belowcost', name: 'Below cost', current_unit_cost: 5.0, current_retail_price: 4.0 },
    { id: 'above', name: 'Above rule', current_unit_cost: 1.0, current_retail_price: 9.99, upc: '034' },
    { id: 'internal', name: 'Bags', current_unit_cost: 0.1, current_retail_price: null, internal: true },
    { id: 'nocost', name: 'No cost yet', current_unit_cost: null, current_retail_price: 3.99 }
  ];
}

test('missions mirror the live queues', () => {
  const missions = game.buildMissions({
    products: sampleProducts(),
    openInvoices: [
      { id: 'r1', invoice_number: 'A', status: 'needs_review', created_at: '2026-09-20T12:00:00Z', line_count: 9 },
      { id: 'r2', invoice_number: 'B', status: 'needs_review', created_at: '2026-10-09T12:00:00Z', line_count: 9 },
      { id: 's1', status: 'uploaded', created_at: '2026-08-20T18:00:00Z', source_object_path: 'ab/abc' },
      { id: 's2', status: 'extracting', created_at: new Date(NOW - 30_000).toISOString() }
    ],
    queueLines: [{ invoice_id: 'r1' }, { invoice_id: 'r1' }, { invoice_id: 'r2' }],
    latestPos: { period_end: '2026-08-19' },
    increaseAlerts: [{ product_id: 'under', percent_change: 12.5 }],
    now: NOW
  });
  const m = Object.fromEntries(missions.map(x => [x.key, x]));

  assert.equal(m.review_line.count, 2);
  assert.equal(m.review_line.items[0].id, 'r1', 'oldest first');
  assert.equal(m.review_line.items[0].lines, 2, 'counts lines still in review');
  assert.equal(m.review_line.priority, 'critical', 'oldest is 20 days old');
  assert.equal(m.review_line.xpPotential, 2 * game.XP.invoiceApproved + 3 * game.XP.perApprovedLine);

  assert.deepEqual(m.rescue_intake.items.map(i => i.id), ['s1'], 'a fresh read is not stuck');
  assert.equal(m.rescue_intake.items[0].hasScan, true);

  assert.deepEqual(m.rule_guard.items.map(i => i.id), ['belowcost', 'under'], 'below-cost first; internal, no-cost and above-rule skipped');
  assert.equal(m.rule_guard.items[1].rulePrice, suggestedRetail(2.0));
  assert.equal(m.rule_guard.items[1].spikePct, 12.5);
  assert.equal(m.rule_guard.priority, 'critical');

  assert.equal(m.sales_feed.done, false);
  assert.equal(m.sales_feed.count, 51, 'Aug 19 to yesterday (Oct 9)');
  assert.equal(m.sales_feed.lastPeriodEnd, '2026-08-19');
});

test('an all-clear operation scores 100 and every mission reads done', () => {
  const products = [{ id: 'p', current_unit_cost: 2, current_retail_price: suggestedRetail(2), upc: '0123' }];
  const missions = game.buildMissions({ products, openInvoices: [], queueLines: [], latestPos: { period_end: '2026-10-09' }, now: NOW });
  assert.ok(missions.every(m => m.done && m.priority === 'clear'), JSON.stringify(missions.map(m => [m.key, m.done])));
  const health = game.buildHealth({ products, missions });
  assert.equal(health.score, 100);
  assert.equal(health.grade, 'A');
  assert.equal(health.status, 'Shipshape');
});

test('a backlogged operation reads critical, component by component', () => {
  const products = sampleProducts();
  const missions = game.buildMissions({
    products,
    openInvoices: [{ id: 'r1', status: 'needs_review', created_at: '2026-08-20T12:00:00Z' }, { id: 's1', status: 'uploaded', created_at: '2026-08-20T12:00:00Z' }],
    queueLines: [],
    latestPos: { period_end: '2026-08-19' },
    now: NOW
  });
  const health = game.buildHealth({ products, missions });
  const c = Object.fromEntries(health.components.map(x => [x.key, x.score]));
  assert.equal(c.review, 0, '51-day-old invoice');
  assert.equal(c.intake, 66, 'one stuck scan');
  assert.equal(c.sales, 0, '51 days behind');
  assert.equal(c.identity, 33, '2 of 6 products carry a UPC');
  assert.equal(health.grade, 'F');
  assert.equal(health.status, 'Critical');
});

test('game state credits the signed-in player and keeps teammates anonymous', () => {
  const events = game.buildEvents({
    invoices: [
      { id: 'i1', invoice_number: '1', status: 'imported', approved_by: ANA, approved_at: '2026-10-10T14:00:00Z', line_count: 3, reconciliation_variance: 0 },
      { id: 'i2', invoice_number: '2', status: 'imported', approved_by: BEN, approved_at: '2026-09-01T14:00:00Z', line_count: 1 }
    ],
    posImports: [{ id: 'b1', imported_by: ANA, created_at: '2026-10-09T14:00:00Z' }]
  });
  const state = game.buildGameState({
    identity: { kind: 'manager', userId: ANA, email: 'ana@example.test' },
    products: sampleProducts(),
    events,
    names: { [ANA]: 'ana', [BEN]: 'ben' },
    now: NOW
  });

  const anaXp = game.XP.invoiceApproved + 3 * game.XP.perApprovedLine + game.XP.pennyPerfect + game.XP.posImport;
  assert.equal(state.player.name, 'ana');
  assert.equal(state.player.scoring, true);
  assert.equal(state.player.xp, anaXp);
  assert.equal(state.player.todayXp, anaXp - game.XP.posImport);
  assert.equal(state.player.streak.current, 2);
  const earned = state.player.badges.filter(b => b.earned).map(b => b.key).sort();
  assert.deepEqual(earned, ['first_pallet', 'penny_perfect', 'sales_scribe']);
  assert.equal(state.player.badges.find(b => b.key === 'ten_pallets').value, 1);

  assert.deepEqual(state.leaderboard.week.map(r => [r.name, r.you]), [['ana', true]], 'ben scored outside the week');
  assert.deepEqual(state.leaderboard.allTime.map(r => r.name), ['ana', 'ben']);
  const json = JSON.stringify(state);
  assert.ok(!json.includes(BEN), 'teammate ids never leave the server');
  assert.ok(!json.includes('ben@'), 'teammate emails never leave the server');
  assert.equal(state.feed[0].label.startsWith('Approved invoice #1'), true);
});

test('an operator token sees the missions but scores nothing', () => {
  const state = game.buildGameState({ identity: { kind: 'operator', userId: null }, products: sampleProducts(), now: NOW });
  assert.equal(state.player.scoring, false);
  assert.equal(state.player.xp, 0);
  assert.equal(state.player.name, 'Operator');
  assert.equal(state.missions.length, 4);
});
