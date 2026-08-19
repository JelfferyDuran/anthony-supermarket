'use strict';

// End-to-end test of the invoice pricing pipeline over the real HTTP router.
//
// It drives the documented flow with a NON-SENSITIVE sample invoice
// (server/fixtures/sample-invoice.json — fictional vendor, invented lines, no
// PII): upload -> SHA-256 dedupe -> private storage -> OCR -> lines land
// needs_review -> manager matches and approves -> products, immutable history
// and a label batch are written -> price-gun CSV exports.
//
// Supabase is replaced by an in-memory double that enforces the same rules the
// SQL enforces, so this exercises the HTTP surface, the auth boundaries and the
// engine together. The SQL guarantees themselves are proven separately against a
// real PostgreSQL instance by scripts/test-pricing-migrations.js.

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SAMPLE = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'sample-invoice.json'), 'utf8'));

const MANAGER_TOKEN = 'test-manager-token';
const AGENT_KEY = 'test-agent-key';
const MANAGER_JWT = 'test-manager-jwt';
const CASHIER_JWT = 'test-cashier-jwt';
const MANAGER_USER_ID = '11111111-1111-1111-1111-111111111111';

// ── In-memory stand-in for the Supabase-backed store ─────────────────────────
function createFakeStore() {
  const invoices = new Map();
  const linesByInvoice = new Map();
  const products = new Map();
  const history = [];
  const labelBatches = [];
  const objects = new Map();
  const posBatches = new Map();
  const posSales = [];
  const round = value => Math.round(value * 100) / 100;

  return {
    _state: { invoices, linesByInvoice, products, history, labelBatches, objects, posBatches, posSales },

    seedProduct(product) {
      products.set(product.id, { internal: false, ...product });
      return product.id;
    },

    async findInvoiceByHash(hash) {
      return [...invoices.values()].find(invoice => invoice.source_sha256 === hash) || null;
    },
    async putInvoiceObject(hash, buffer, contentType) {
      const objectPath = `${hash.slice(0, 2)}/${hash}`;
      objects.set(objectPath, { bytes: buffer.length, contentType });
      return objectPath;
    },
    async signInvoiceObject(objectPath) {
      return `https://storage.test/signed/${objectPath}?token=short-lived`;
    },
    async createInvoice(record) {
      const invoice = { id: crypto.randomUUID(), ...record };
      invoices.set(invoice.id, invoice);
      linesByInvoice.set(invoice.id, []);
      return invoice;
    },
    async getInvoice(id) {
      return invoices.get(id) || null;
    },
    async updateInvoice(id, patch) {
      const invoice = invoices.get(id);
      if (!invoice) return null;
      Object.assign(invoice, patch);
      return invoice;
    },
    async replaceInvoiceLines(invoiceId, lines) {
      const stored = lines.map(line => ({ id: crypto.randomUUID(), invoice_id: invoiceId, ...line }));
      linesByInvoice.set(invoiceId, stored);
      return stored;
    },
    async listInvoiceLines(invoiceId) {
      return linesByInvoice.get(invoiceId) || [];
    },
    async listReviewQueue() {
      return [...linesByInvoice.values()].flat().filter(line => line.review_status === 'needs_review');
    },
    async listProducts() {
      return [...products.values()];
    },
    async listPriceHistory(productId) {
      return history.filter(row => row.product_id === productId);
    },

    async setProductRetail({ productId, retailPrice, approvedBy }) {
      const product = products.get(productId);
      if (!product) throw new Error(`product ${productId} not found`);
      if (product.internal) throw new Error(`internal item ${productId} is not sold and cannot carry a retail price`);
      if (product.current_unit_cost != null && retailPrice < product.current_unit_cost) {
        throw new Error(`retail price ${retailPrice} is below unit cost ${product.current_unit_cost}`);
      }
      history.push({
        product_id: productId,
        previous_retail_price: product.current_retail_price,
        new_retail_price: retailPrice,
        changed_by: approvedBy
      });
      product.current_retail_price = retailPrice;
      return product;
    },

    async approveInvoice({ invoiceId, approvedBy, lines }) {
      if (!approvedBy) throw new Error('an approver is required');
      const invoice = invoices.get(invoiceId);
      if (!invoice) throw new Error('invoice not found');
      if (invoice.status === 'imported') {
        return { invoice_id: invoiceId, status: 'imported', applied: 0, already_imported: true };
      }
      let applied = 0;
      for (const line of lines) {
        if (!line.product_id) throw new Error(`line ${line.line_number} has no matched product; fuzzy matches cannot approve`);
        const product = products.get(line.product_id);
        if (!product) throw new Error(`product ${line.product_id} not found`);
        if (!product.internal && (line.retail_price == null || line.retail_price < line.unit_cost)) {
          throw new Error(`line ${line.line_number} retail is below unit cost`);
        }
        history.push({
          product_id: line.product_id,
          previous_unit_cost: product.current_unit_cost,
          new_unit_cost: line.unit_cost,
          previous_retail_price: product.current_retail_price,
          new_retail_price: line.retail_price,
          changed_by: approvedBy
        });
        product.current_unit_cost = line.unit_cost;
        if (!product.internal) product.current_retail_price = line.retail_price;
        applied++;
      }
      const stored = linesByInvoice.get(invoiceId) || [];
      const stillPending = stored.filter(line => line.review_status === 'needs_review'
        && !lines.some(reviewed => reviewed.line_number === line.line_number));
      if (stillPending.length) throw new Error(`${stillPending.length} line(s) still need review`);
      for (const line of stored) line.review_status = 'approved';

      labelBatches.push({ invoice_id: invoiceId, row_count: applied, created_by: approvedBy });
      invoice.status = 'imported';
      invoice.approved_by = approvedBy;
      return { invoice_id: invoiceId, status: 'imported', applied, reconciliation_variance: 0 };
    },

    // ── POS + financials ───────────────────────────────────────────────────
    async findPosBatchByHash(hash) {
      return [...posBatches.values()].find(batch => batch.source_sha256 === hash) || null;
    },
    async createPosBatch(record) {
      const batch = { id: crypto.randomUUID(), ...record };
      posBatches.set(batch.id, batch);
      return batch;
    },
    async insertPosSales(batchId, rows) {
      for (const row of rows) posSales.push({ ...row, batch_id: batchId });
      return rows.length;
    },
    async listPosBatches() {
      return [...posBatches.values()];
    },
    async pnlSummary(from, to) {
      const inRange = posSales.filter(row => (!from || row.sold_at >= from) && (!to || row.sold_at <= to));
      const sold = inRange.filter(row => !row.is_void && !row.is_refund);
      const gross = round(sold.reduce((sum, row) => sum + row.gross_sales, 0));
      const cogs = round(sold.reduce((sum, row) => {
        const product = row.product_id && products.get(row.product_id);
        return sum + (product ? (product.current_unit_cost || 0) * row.quantity : 0);
      }, 0));
      const costed = round(sold.filter(row => row.product_id).reduce((sum, row) => sum + row.gross_sales, 0));
      return {
        gross_sales: gross,
        cost_of_goods: cogs,
        gross_profit: round(gross - cogs),
        voids: round(inRange.filter(r => r.is_void).reduce((s, r) => s + Math.abs(r.gross_sales), 0)),
        refunds: round(inRange.filter(r => r.is_refund).reduce((s, r) => s + Math.abs(r.gross_sales), 0)),
        costed_revenue_share: gross ? round((costed / gross) * 100) : null,
        vendor_spend: 0,
        invoice_count: invoices.size
      };
    },
    async vendorSpend() { return []; },
    async invoiceAging() { return []; },
    async marginBy() { return []; },
    async priceIncreaseAlerts() { return []; },

    async listLabelRows(invoiceId) {
      return [...products.values()]
        .filter(product => !product.internal && product.current_retail_price != null)
        .map(product => ({
          item_name: product.name,
          upc: product.upc || '',
          price: product.current_retail_price,
          department: product.department || ''
        }));
    }
  };
}

// ── Test harness ─────────────────────────────────────────────────────────────
function startServer({ store, ocr = true } = {}) {
  process.env.NODE_ENV = 'production';
  process.env.PRICING_MANAGER_TOKEN = MANAGER_TOKEN;
  process.env.PRICING_AGENT_KEY = AGENT_KEY;
  process.env.PRICING_OCR_WEBHOOK_URL = ocr ? 'https://ocr.test/extract' : '';

  // Reloaded per server so the router re-reads the environment above.
  delete require.cache[require.resolve('./pricing-router')];
  const { createPricingRouter } = require('./pricing-router');

  const app = express();
  app.use(express.json());
  app.use('/api/pricing', createPricingRouter({
    store,
    // Stands in for Supabase Auth. Roles come from app_metadata only.
    verifyUser: async token => {
      if (token === MANAGER_JWT) return { id: MANAGER_USER_ID, email: 'manager@example.test', role: 'manager' };
      if (token === CASHIER_JWT) return { id: '22222222-2222-2222-2222-222222222222', email: 'cashier@example.test', role: 'cashier' };
      return null;
    },
    fetch: async () => ({ ok: true, status: 200, json: async () => SAMPLE })
  }));

  const server = app.listen(0);
  return new Promise(resolve => server.once('listening', () => resolve({
    server,
    base: `http://127.0.0.1:${server.address().port}/api/pricing`
  })));
}

function uploadBody(bytes, filename = 'sample-invoice.pdf') {
  const form = new FormData();
  form.append('invoice', new Blob([bytes], { type: 'application/pdf' }), filename);
  return form;
}

const SAMPLE_SCAN = Buffer.from('%PDF-1.4 non-sensitive sample invoice for pipeline testing');

// ── Tests ────────────────────────────────────────────────────────────────────

test('end-to-end: sample invoice flows upload -> review -> approve -> export', async t => {
  const store = createFakeStore();
  const coffeeId = store.seedProduct({ id: crypto.randomUUID(), name: 'Sample Coffee 12/10oz', upc: '0074471000500', department: 'Tea/Coffee', current_unit_cost: 4.25, current_retail_price: 7.99 });
  const riceId = store.seedProduct({ id: crypto.randomUUID(), name: 'Sample Rice 20/2lb', upc: '0012000001260', department: 'Rice', current_unit_cost: 2.30, current_retail_price: 3.99 });
  const { server, base } = await startServer({ store });
  t.after(() => server.close());

  // 1. Upload the scan.
  const upload = await fetch(`${base}/invoices`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MANAGER_JWT}` },
    body: uploadBody(SAMPLE_SCAN)
  });
  assert.equal(upload.status, 200);
  const created = await upload.json();
  assert.equal(created.invoice.source_sha256, crypto.createHash('sha256').update(SAMPLE_SCAN).digest('hex'));
  assert.ok(created.invoice.source_object_path, 'scan stored in the private bucket');
  assert.equal(created.lines.length, 3);

  // 2. OCR output lands entirely in review — nothing self-approves.
  assert.ok(created.lines.every(line => line.review_status === 'needs_review'));
  assert.ok(created.lines.every(line => line.matched_product_id === null), 'OCR never matches a product');
  const smudged = created.lines.find(line => line.line_number === 3);
  assert.match(smudged.review_reason, /confidence/);

  // 3. Re-uploading the same scan is idempotent, not a second invoice.
  const duplicate = await fetch(`${base}/invoices`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MANAGER_JWT}` },
    body: uploadBody(SAMPLE_SCAN, 'rescanned.pdf')
  });
  const duplicateBody = await duplicate.json();
  assert.equal(duplicateBody.duplicate, true);
  assert.equal(duplicateBody.invoice.id, created.invoice.id);
  assert.equal(store._state.invoices.size, 1);

  // 4. The queue shows exactly what needs a human.
  const queue = await (await fetch(`${base}/queue`, { headers: { Authorization: `Bearer ${MANAGER_JWT}` } })).json();
  assert.equal(queue.lines.length, 3);

  // 5a. Submitting only part of the invoice fails reconciliation: the lines no
  //     longer add up to the invoice subtotal.
  const partial = await fetch(`${base}/invoices/${created.invoice.id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MANAGER_JWT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lines: [
        { line_number: 1, product_id: coffeeId, unit_cost: 4.00, retail_price: 6.99, line_total: 96.00 },
        { line_number: 2, product_id: riceId, unit_cost: 2.125, retail_price: 3.99, line_total: 42.50 }
      ]
    })
  });
  assert.equal(partial.status, 422);
  assert.ok((await partial.json()).blockers.some(blocker => /reconciliation variance/.test(blocker)));

  // 5b. Reconciliation now balances, but the smudged line still has no product,
  //     so approval is still refused.
  const premature = await fetch(`${base}/invoices/${created.invoice.id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MANAGER_JWT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lines: [
        { line_number: 1, product_id: coffeeId, unit_cost: 4.00, retail_price: 6.99, line_total: 96.00 },
        { line_number: 2, product_id: riceId, unit_cost: 2.125, retail_price: 3.99, line_total: 42.50 },
        { line_number: 3, product_id: null, unit_cost: 1.00, retail_price: 1.99, line_total: 10.00 }
      ]
    })
  });
  assert.equal(premature.status, 422);
  const prematureBody = await premature.json();
  assert.ok(prematureBody.blockers.some(blocker => /need review/.test(blocker)));
  assert.equal(store._state.invoices.get(created.invoice.id).status, 'needs_review', 'nothing was committed');

  // 6. Manager resolves the third line, then approves the whole invoice.
  const approve = await fetch(`${base}/invoices/${created.invoice.id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MANAGER_JWT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lines: [
        { line_number: 1, product_id: coffeeId, unit_cost: 4.00, retail_price: 6.99, line_total: 96.00 },
        { line_number: 2, product_id: riceId, unit_cost: 2.125, retail_price: 3.99, line_total: 42.50 },
        { line_number: 3, product_id: riceId, unit_cost: 1.00, retail_price: 1.99, line_total: 10.00 }
      ]
    })
  });
  assert.equal(approve.status, 200);
  const result = (await approve.json()).result;
  assert.equal(result.status, 'imported');
  assert.equal(result.applied, 3);

  // 7. Products moved, history recorded the move, label batch created.
  assert.equal(store._state.products.get(coffeeId).current_unit_cost, 4.00);
  assert.equal(store._state.products.get(coffeeId).current_retail_price, 6.99);
  const coffeeHistory = store._state.history.filter(row => row.product_id === coffeeId);
  assert.equal(coffeeHistory.length, 1);
  assert.equal(coffeeHistory[0].previous_retail_price, 7.99);
  assert.equal(coffeeHistory[0].changed_by, MANAGER_USER_ID);
  assert.equal(store._state.labelBatches.length, 1);

  // 8. Re-approving is idempotent.
  const again = await fetch(`${base}/invoices/${created.invoice.id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MANAGER_JWT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines: [{ line_number: 1, product_id: coffeeId, unit_cost: 4.00, retail_price: 6.99, line_total: 96.00 }] })
  });
  assert.equal((await again.json()).result.already_imported, true);

  // 9. Price-gun export emits the four documented columns.
  const csv = await (await fetch(`${base}/export/labels`, { headers: { Authorization: `Bearer ${MANAGER_JWT}` } })).text();
  const rows = csv.trim().split('\n');
  assert.equal(rows[0], 'item_name,upc,price,department');
  assert.ok(rows.some(row => row.startsWith('Sample Coffee 12/10oz,0074471000500,6.99,Tea/Coffee')));

  // 10. The stored scan is reachable only through a signed link.
  const source = await (await fetch(`${base}/invoices/${created.invoice.id}/source`, { headers: { Authorization: `Bearer ${MANAGER_JWT}` } })).json();
  assert.match(source.url, /^https:\/\/storage\.test\/signed\//);
  assert.equal(source.expiresInSeconds, 300);
});

test('an unauthenticated caller cannot read or write pricing', async t => {
  const store = createFakeStore();
  const { server, base } = await startServer({ store });
  t.after(() => server.close());

  assert.equal((await fetch(`${base}/products`)).status, 401);
  assert.equal((await fetch(`${base}/queue`)).status, 401);
  assert.equal((await fetch(`${base}/invoices`, { method: 'POST', body: uploadBody(SAMPLE_SCAN) })).status, 401);
  // The capability probe stays public: it exposes no data, only whether the
  // pipeline is configured.
  assert.equal((await fetch(`${base}/config`)).status, 200);
});

test('a signed-in non-manager is rejected', async t => {
  const store = createFakeStore();
  const { server, base } = await startServer({ store });
  t.after(() => server.close());

  const response = await fetch(`${base}/products`, { headers: { Authorization: `Bearer ${CASHIER_JWT}` } });
  assert.equal(response.status, 401);
});

test('the Hermes agent key calculates but cannot reach any write path', async t => {
  const store = createFakeStore();
  const { server, base } = await startServer({ store });
  t.after(() => server.close());

  const calc = await fetch(`${base}/calculate`, {
    method: 'POST',
    headers: { 'x-pricing-agent-key': AGENT_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ lineTotal: 48, caseQuantity: 2, unitsPerCase: 12 })
  });
  assert.equal(calc.status, 200);
  assert.equal((await calc.json()).retailPrice, 3.4);

  for (const [path, init] of [
    ['/products', {}],
    ['/queue', {}],
    ['/export/labels', {}],
    ['/invoices', { method: 'POST', body: uploadBody(SAMPLE_SCAN) }]
  ]) {
    const response = await fetch(`${base}${path}`, { ...init, headers: { 'x-pricing-agent-key': AGENT_KEY, ...(init.headers || {}) } });
    assert.equal(response.status, 401, `agent key must not reach ${path}`);
  }
});

test('the shared operator token can read but cannot approve a price', async t => {
  const store = createFakeStore();
  const productId = store.seedProduct({ id: crypto.randomUUID(), name: 'Sample Rice 20/2lb', current_unit_cost: 2.30, current_retail_price: 3.99 });
  const { server, base } = await startServer({ store });
  t.after(() => server.close());

  assert.equal((await fetch(`${base}/products`, { headers: { Authorization: `Bearer ${MANAGER_TOKEN}` } })).status, 200);

  // No auth.users row behind a shared token, so an approval could not be
  // attributed to anyone. It must be refused, not recorded anonymously.
  const edit = await fetch(`${base}/products/${productId}/retail`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${MANAGER_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ retailPrice: 4.99 })
  });
  assert.equal(edit.status, 403);
  assert.equal((await edit.json()).code, 'APPROVER_IDENTITY_REQUIRED');
});

test('a manager retail edit persists server-side and records who changed it', async t => {
  const store = createFakeStore();
  const productId = store.seedProduct({ id: crypto.randomUUID(), name: 'Sample Rice 20/2lb', current_unit_cost: 2.30, current_retail_price: 3.99 });
  const { server, base } = await startServer({ store });
  t.after(() => server.close());

  const response = await fetch(`${base}/products/${productId}/retail`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${MANAGER_JWT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ retailPrice: 4.99, reason: 'owner override' })
  });
  assert.equal(response.status, 200);
  assert.equal(store._state.products.get(productId).current_retail_price, 4.99);
  assert.equal(store._state.history.at(-1).changed_by, MANAGER_USER_ID);
});

test('a retail edit below cost is refused', async t => {
  const store = createFakeStore();
  const productId = store.seedProduct({ id: crypto.randomUUID(), name: 'Sample Rice 20/2lb', current_unit_cost: 2.30, current_retail_price: 3.99 });
  const { server, base } = await startServer({ store });
  t.after(() => server.close());

  const response = await fetch(`${base}/products/${productId}/retail`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${MANAGER_JWT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ retailPrice: 1.00 })
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /below unit cost/);
  assert.equal(store._state.products.get(productId).current_retail_price, 3.99, 'price unchanged');
});

test('without OCR configured the scan is still stored privately and reported', async t => {
  const store = createFakeStore();
  const { server, base } = await startServer({ store, ocr: false });
  t.after(() => server.close());

  const response = await fetch(`${base}/invoices`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MANAGER_JWT}` },
    body: uploadBody(SAMPLE_SCAN)
  });
  assert.equal(response.status, 202);
  const body = await response.json();
  assert.equal(body.code, 'OCR_NOT_CONFIGURED');
  assert.ok(body.invoice.source_object_path, 'the scan is not lost when OCR is unavailable');
  assert.equal(body.lines.length, 0);
});

// ── Phase C: POS import and financials ───────────────────────────────────────

const POS_CSV = [
  'Date,Item Description,UPC,Qty,Unit Price,Line Total,Payment,Cashier,Department',
  '08/15/2026,Sample Coffee 12/10oz,0074471000500,10,5.99,59.90,CASH,Ana,Tea/Coffee',
  '08/15/2026,Sample Rice 20/2lb,0012000001260,5,3.99,19.95,VISA,Ana,Rice',
  '08/15/2026,Unknown Snack,,2,1.50,3.00,CASH,Ana,Snacks',
  '08/15/2026,Voided Line,,1,4.00,4.00,CASH,Ana,Snacks',
  'Grand Total,,,,,86.85,,,'
].join('\n');

function posBody(text, filename = 'nrs_sales_2026-08-15.csv') {
  const form = new FormData();
  form.append('sales', new Blob([text], { type: 'text/csv' }), filename);
  return form;
}

function seedCatalog(store) {
  return {
    coffee: store.seedProduct({ id: crypto.randomUUID(), name: 'Sample Coffee 12/10oz', upc: '0074471000500', department: 'Tea/Coffee', category: 'Tea/Coffee', current_unit_cost: 4.00, current_retail_price: 5.99 }),
    rice: store.seedProduct({ id: crypto.randomUUID(), name: 'Sample Rice 20/2lb', upc: '0012000001260', department: 'Rice', category: 'Rice', current_unit_cost: 2.00, current_retail_price: 3.99 })
  };
}

test('POS import parses, matches products, and reports what it could not match', async t => {
  const store = createFakeStore();
  seedCatalog(store);
  const { server, base } = await startServer({ store });
  t.after(() => server.close());

  const response = await fetch(`${base}/pos/import`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MANAGER_JWT}` },
    body: posBody(POS_CSV)
  });
  assert.equal(response.status, 200);
  const body = await response.json();

  // 59.90 + 19.95 + 3.00 + 4.00; the Grand Total footer row is skipped, not summed.
  assert.equal(body.summary.gross_sales, 86.85);
  assert.equal(body.matched, 2, 'the two catalog items matched on UPC');
  assert.equal(body.unmatched, 2, 'the unknown snack and voided line stay unmatched');
  assert.equal(body.batch.period_start, '2026-08-15');
  assert.equal(store._state.posSales.length, 4);
  // The report footer must not have become a sale.
  assert.ok(!store._state.posSales.some(row => /grand total/i.test(row.item_name)));
});

test('re-uploading the same POS export does not double-count a day of sales', async t => {
  const store = createFakeStore();
  seedCatalog(store);
  const { server, base } = await startServer({ store });
  t.after(() => server.close());

  const first = await fetch(`${base}/pos/import`, { method: 'POST', headers: { Authorization: `Bearer ${MANAGER_JWT}` }, body: posBody(POS_CSV) });
  assert.equal(first.status, 200);
  const rowsAfterFirst = store._state.posSales.length;

  const second = await fetch(`${base}/pos/import`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MANAGER_JWT}` },
    body: posBody(POS_CSV, 'manually-dropped-copy.csv')
  });
  const body = await second.json();
  assert.equal(body.duplicate, true);
  assert.equal(store._state.posSales.length, rowsAfterFirst, 'no rows were added twice');
  assert.equal(store._state.posBatches.size, 1);
});

test('an unreadable POS export is rejected with the header it saw', async t => {
  const store = createFakeStore();
  const { server, base } = await startServer({ store });
  t.after(() => server.close());

  const response = await fetch(`${base}/pos/import`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MANAGER_JWT}` },
    body: posBody('alpha,beta,gamma\n1,2,3', 'weird.csv')
  });
  assert.equal(response.status, 422);
  const body = await response.json();
  assert.equal(body.code, 'POS_FORMAT_UNRECOGNIZED');
  assert.match(body.error, /alpha, beta, gamma/);
  assert.equal(store._state.posSales.length, 0, 'nothing was imported from a file we could not read');
});

test('importing POS sales requires an identified approver, not a shared token', async t => {
  const store = createFakeStore();
  const { server, base } = await startServer({ store });
  t.after(() => server.close());

  const response = await fetch(`${base}/pos/import`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MANAGER_TOKEN}` },
    body: posBody(POS_CSV)
  });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).code, 'APPROVER_IDENTITY_REQUIRED');
});

test('financials report margin and flag how much revenue actually has a known cost', async t => {
  const store = createFakeStore();
  seedCatalog(store);
  const { server, base } = await startServer({ store });
  t.after(() => server.close());

  await fetch(`${base}/pos/import`, { method: 'POST', headers: { Authorization: `Bearer ${MANAGER_JWT}` }, body: posBody(POS_CSV) });

  const response = await fetch(`${base}/financials?from=2026-08-01&to=2026-08-31`, {
    headers: { Authorization: `Bearer ${MANAGER_JWT}` }
  });
  assert.equal(response.status, 200);
  const { summary, period } = await response.json();

  assert.deepEqual(period, { from: '2026-08-01', to: '2026-08-31' });
  // 59.90 + 19.95 + 3.00 + 4.00 = 86.85 (the void is not flagged in this export,
  // so every line counts as sold).
  assert.equal(summary.gross_sales, 86.85);
  // Coffee 10 x $4.00 + rice 5 x $2.00 = $50.00.
  assert.equal(summary.cost_of_goods, 50.00);
  assert.equal(summary.gross_profit, 36.85);
  // 79.85 of 86.85 has a known cost.
  assert.equal(summary.costed_revenue_share, 91.94);
});

test('a malformed date filter narrows nothing instead of erroring', async t => {
  const store = createFakeStore();
  const { server, base } = await startServer({ store });
  t.after(() => server.close());

  const response = await fetch(`${base}/financials?from=not-a-date`, { headers: { Authorization: `Bearer ${MANAGER_JWT}` } });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).period.from, null);
});

test('financials are not readable without a manager identity', async t => {
  const store = createFakeStore();
  const { server, base } = await startServer({ store });
  t.after(() => server.close());

  assert.equal((await fetch(`${base}/financials`)).status, 401);
  assert.equal((await fetch(`${base}/financials`, { headers: { Authorization: `Bearer ${CASHIER_JWT}` } })).status, 401);
  assert.equal((await fetch(`${base}/pos/batches`, { headers: { 'x-pricing-agent-key': AGENT_KEY } })).status, 401);
});
