'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  HUB_PREVIEW_MARKUP_PCT,
  MAX_RECONCILIATION_VARIANCE,
  RETAIL_MULTIPLIER,
  approvalBlockers,
  costVariance,
  normalizeUpc,
  priceInvoice,
  retailFromUnitCost,
  roundCost,
  roundMoney,
  roundRetail,
  suggestedRetail,
  unitCostFromCase
} = require('./pricing-engine');

// ── Currency and cost arithmetic ─────────────────────────────────────────────

test('retail applies the 1.70 rule and rounds only the final currency value', () => {
  assert.equal(retailFromUnitCost(2.49), 4.23);
  assert.equal(retailFromUnitCost(0), 0);
});

test('rejects a negative unit cost rather than producing a negative price', () => {
  assert.throws(() => retailFromUnitCost(-1), /cannot be negative/);
});

test('rounds half-cent boundaries up instead of drifting down on float error', () => {
  // 2.675 is the classic float case: it is stored just below 2.675.
  assert.equal(roundMoney(2.675), 2.68);
  assert.equal(roundMoney(1.005), 1.01);
  assert.equal(roundMoney(0.145), 0.15);
});

test('keeps four decimals of cost so fractional cents survive case math', () => {
  assert.equal(roundCost(1.08795), 1.088);
  assert.equal(unitCostFromCase({ lineTotal: 21.76, caseQuantity: 1, unitsPerCase: 20 }), 1.088);
});

test('calculates unit cost from case math', () => {
  assert.equal(unitCostFromCase({ lineTotal: 48, caseQuantity: 2, unitsPerCase: 12 }), 2);
});

test('applies discounts and allocated charges before dividing', () => {
  assert.equal(unitCostFromCase({ lineTotal: 100, caseQuantity: 1, unitsPerCase: 10, lineDiscount: 20 }), 8);
  assert.equal(unitCostFromCase({ lineTotal: 100, caseQuantity: 1, unitsPerCase: 10, allocatedCharges: 10 }), 11);
});

test('refuses impossible pack math instead of dividing by zero', () => {
  assert.throws(() => unitCostFromCase({ lineTotal: 10, caseQuantity: 1, unitsPerCase: 0 }), /must be positive/);
  assert.throws(() => unitCostFromCase({ lineTotal: 10, caseQuantity: 0, unitsPerCase: 12 }), /must be positive/);
  assert.throws(() => unitCostFromCase({ lineTotal: -1, caseQuantity: 1, unitsPerCase: 12 }), /cannot be negative/);
});

// ── Shelf pricing ────────────────────────────────────────────────────────────

test('every suggested shelf price ends in .99', () => {
  for (const cost of [0.10, 0.46, 1.088, 2.0615, 3.1392, 5.7, 12.34]) {
    const price = suggestedRetail(cost);
    assert.ok(Math.abs(price * 100 % 100 - 99) < 1e-6, `${cost} produced ${price}`);
  }
});

test('shelf rounding never falls below the minimum retail step', () => {
  assert.equal(roundRetail(0.10), 0.99);
  assert.equal(roundRetail(1.20), 0.99);
  assert.equal(roundRetail(1.60), 1.99);
});

// The owner locked one markup rule on 2026-08-19. Before that the hub previewed
// 65% while the server approved at 1.70, so the browser showed a price the
// server would not write. These two constants are the same rule expressed twice
// and must never drift apart again.
test('the hub preview markup and the approved-retail multiplier are one rule', () => {
  assert.equal(RETAIL_MULTIPLIER, 1.70);
  assert.equal(HUB_PREVIEW_MARKUP_PCT, 70);
  assert.equal(HUB_PREVIEW_MARKUP_PCT, Math.round((RETAIL_MULTIPLIER - 1) * 100));
});

test('a shelf suggestion is the approved price snapped to .99', () => {
  for (const cost of [0.46, 1.088, 2.0615, 3.1392, 3.3333, 5.7]) {
    const approved = retailFromUnitCost(cost);
    const shelf = suggestedRetail(cost);
    // The shelf price is the .99 rounding of the same underlying number.
    assert.equal(shelf, roundRetail(approved), `cost ${cost}`);
  }
});

test('matches the Pricing Hub rounding on known live items', () => {
  // Spot values asserted independently by scripts/verify-pricing-hub.js.
  assert.equal(suggestedRetail(3.1392), 4.99);
  assert.equal(suggestedRetail(1.088), 1.99);
  assert.equal(suggestedRetail(0.46), 0.99);
});

// ── UPC handling ─────────────────────────────────────────────────────────────

test('preserves leading zeros in UPCs and strips only separators', () => {
  assert.equal(normalizeUpc('0074471000500'), '0074471000500');
  assert.equal(normalizeUpc('0-74471-00050-0'), '0744710005 00'.replace(/\s/g, ''));
  assert.equal(normalizeUpc(null), '');
});

// ── Variance ─────────────────────────────────────────────────────────────────

test('a first sighting is not a price change', () => {
  assert.equal(costVariance(null, 2.5), null);
});

test('reports direction, delta and percent on a real cost move', () => {
  // The live Van Camps 48/5oz move: $2.3656 -> $2.0615.
  const variance = costVariance(2.3656, 2.0615);
  assert.equal(variance.direction, 'decrease');
  assert.equal(variance.delta, -0.3041);
  assert.ok(Math.abs(variance.percent + 12.85) < 0.01);
});

// ── Invoice pricing and the approval gate ────────────────────────────────────

test('preserves UPC zeros and blocks ambiguous lines', () => {
  const result = priceInvoice({
    invoice: { subtotal: 58 },
    items: [
      { upc: '0074471000500', description: 'Cafe Bustelo', cases: 2, units: 12, total: 48, confidence: 0.99, status: 'approved' },
      { upc: '', description: 'Unknown', cases: 1, units: 0, total: 10, confidence: 0.6, status: 'approved' }
    ]
  });
  assert.equal(result.items[0].upc, '0074471000500');
  assert.equal(result.items[0].final_retail_price, 3.4);
  assert.equal(result.items[1].status, 'needs_review');
  assert.equal(result.reconciliation.variance, 0);
});

test('low OCR confidence cannot approve itself even when asked to', () => {
  const result = priceInvoice({
    items: [{ upc: '0074471000500', description: 'Blurry', cases: 1, units: 12, total: 24, confidence: 0.5, status: 'approved' }]
  });
  assert.equal(result.items[0].status, 'needs_review');
  assert.match(result.items[0].review_reason, /confidence/);
});

test('flags reconciliation drift beyond one cent', () => {
  const ok = priceInvoice({ invoice: { subtotal: 48.01 }, items: [{ upc: '1', description: 'x', cases: 1, units: 12, total: 48, confidence: 1, status: 'approved' }] });
  assert.equal(ok.reconciliation.within_tolerance, true);

  const drifted = priceInvoice({ invoice: { subtotal: 48.02 }, items: [{ upc: '1', description: 'x', cases: 1, units: 12, total: 48, confidence: 1, status: 'approved' }] });
  assert.equal(drifted.reconciliation.within_tolerance, false);
  assert.equal(drifted.reconciliation.tolerance, MAX_RECONCILIATION_VARIANCE);
});

test('approval is blocked while any line still needs review', () => {
  const priced = priceInvoice({
    invoice: { subtotal: 58 },
    items: [
      { upc: '0074471000500', description: 'Good', cases: 2, units: 12, total: 48, confidence: 0.99, status: 'approved' },
      { upc: '', description: 'Bad', cases: 1, units: 10, total: 10, confidence: 0.4, status: 'approved' }
    ]
  });
  const blockers = approvalBlockers(priced);
  assert.equal(blockers.length, 1);
  assert.match(blockers[0], /need review/);
});

test('a clean invoice has no approval blockers', () => {
  const priced = priceInvoice({
    invoice: { subtotal: 48 },
    items: [{ upc: '0074471000500', description: 'Good', cases: 2, units: 12, total: 48, confidence: 0.99, status: 'approved' }]
  });
  assert.deepEqual(approvalBlockers(priced), []);
});
