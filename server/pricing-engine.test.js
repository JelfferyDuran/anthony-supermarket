'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { priceInvoice, retailFromUnitCost, unitCostFromCase } = require('./pricing-engine');

test('uses cost times 1.70 with final currency rounding', () => assert.equal(retailFromUnitCost(2.49), 4.23));
test('calculates unit cost from case math', () => assert.equal(unitCostFromCase({ lineTotal: 48, caseQuantity: 2, unitsPerCase: 12 }), 2));
test('preserves UPC zeros and blocks ambiguous lines', () => {
  const result = priceInvoice({ invoice: { subtotal: 58 }, items: [
    { upc: '0074471000500', description: 'Cafe Bustelo', cases: 2, units: 12, total: 48, confidence: .99, status: 'approved' },
    { upc: '', description: 'Unknown', cases: 1, units: 0, total: 10, confidence: .6, status: 'approved' }
  ] });
  assert.equal(result.items[0].upc, '0074471000500'); assert.equal(result.items[0].final_retail_price, 3.4);
  assert.equal(result.items[1].status, 'needs_review'); assert.equal(result.reconciliation.variance, 0);
});
