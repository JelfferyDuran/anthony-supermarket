import assert from 'node:assert/strict';
import { buildPricingPreview, InvoicePricingError } from '../supabase/functions/_shared/invoicePricing.ts';

const paid = buildPricingPreview({
  invoice: { vendor: 'Test Vendor', invoiceNumber: 'TEST-2PAGE', invoiceDate: '2026-08-09', invoiceTotal: 66.4, pages: 2, noCharge: false },
  items: [
    { name: 'Test Branded Product 24/6oz', upc: '123456789012', quantity: 2, caseCost: 24.95, packQty: 24, lineAmount: 49.9 },
    { name: 'Generic Product 12/8oz', upc: '987654321098', quantity: 1, caseCost: 16.5, packQty: 12, lineAmount: 16.5 },
  ],
});
assert.equal(paid.status, 'review_required');
assert.equal(paid.invoice.pages, 2);
assert.deepEqual(paid.reconciliation, { calculatedTotal: 66.4, difference: 0 });
assert.equal(paid.items[0].costPerUnit, 1.0396);
assert.equal(paid.items[0].suggestedRetail, 1.99);

const sample = buildPricingPreview({
  invoice: { vendor: 'Test Vendor', invoiceNumber: 'TEST-SAMPLE', invoiceDate: '2026-08-09', invoiceTotal: 0, pages: 1, noCharge: true },
  items: [{ name: 'Sample Product', upc: '123456789012', quantity: 1, caseCost: 0, packQty: 12, lineAmount: 0 }],
});
assert.equal(sample.status, 'no_charge');
assert.equal(sample.items[0].suggestedRetail, null);

const mustReject = (payload, pattern) => assert.throws(() => buildPricingPreview(payload), error => error instanceof InvoicePricingError && pattern.test(error.message));
const baseInvoice = { vendor: 'Test Vendor', invoiceNumber: 'TEST-FAIL', invoiceDate: '2026-08-09', invoiceTotal: 20, pages: 1, noCharge: false };
mustReject({ invoice: baseInvoice, items: [{ name: 'Bad line', quantity: 2, caseCost: 10, packQty: 12, lineAmount: 19 }] }, /case quantity × case cost/);
mustReject({ invoice: baseInvoice, items: [{ name: 'Bad total', quantity: 1, caseCost: 19, packQty: 12, lineAmount: 19 }] }, /Invoice total does not match/);
mustReject({ invoice: baseInvoice, items: [{ name: 'Missing pack', quantity: 1, caseCost: 20, packQty: '', lineAmount: 20 }] }, /confirm whole units per case/);
mustReject({ invoice: { ...baseInvoice, noCharge: false }, items: [{ name: 'Zero cost', quantity: 1, caseCost: 0, packQty: 12, lineAmount: 0 }] }, /positive case cost/);

console.log('Invoice pricing reconciliation, no-charge blocking, and ambiguity tests passed.');
