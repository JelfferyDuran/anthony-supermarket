'use strict';

// HTTP tests for the game-layer routes and the intake rescue path:
//   GET  /game/state                 — manager read, scored from the audit trail
//   POST /products/:id/apply-rule    — server-priced repricing, approver only
//   POST /invoices/:id/extract       — re-read a stuck scan
// plus the two intake fixes they rely on: a failed read resets the invoice to
// 'uploaded' instead of stranding it in 'extracting', and approval links its
// history rows only to lines of the invoice being approved.

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { suggestedRetail } = require('./pricing-engine');

const SAMPLE = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'sample-invoice.json'), 'utf8'));
const MANAGER_TOKEN = 'test-manager-token';
const MANAGER_JWT = 'test-manager-jwt';
const CASHIER_JWT = 'test-cashier-jwt';
const MANAGER_USER_ID = '11111111-1111-4111-8111-111111111111';
const SCAN = Buffer.from('%PDF-1.4 non-sensitive sample scan for rescue testing');

function createFakeStore() {
  const products = new Map();
  const invoices = new Map();
  const linesByInvoice = new Map();
  const objects = new Map();
  const history = [];
  const approvals = [];
  const sources = { invoices: [], lineExceptions: [], retailEdits: [], posImports: [] };

  return {
    _state: { products, invoices, linesByInvoice, objects, history, approvals, sources },
    seedProduct(p) { products.set(p.id, { active: true, internal: false, ...p }); return p.id; },
    seedInvoice(inv, lines = []) {
      invoices.set(inv.id, { ...inv });
      linesByInvoice.set(inv.id, lines.map(l => ({ invoice_id: inv.id, ...l })));
      return inv.id;
    },
    seedObject(objectPath, buffer) { objects.set(objectPath, buffer); },

    async listProducts() { return [...products.values()].filter(p => p.active); },
    async getProduct(id) { return products.get(id) || null; },
    async setProductRetail({ productId, retailPrice, approvedBy, reason }) {
      const product = products.get(productId);
      if (product.current_unit_cost != null && retailPrice < product.current_unit_cost) throw new Error('retail price is below unit cost');
      history.push({ product_id: productId, previous_retail_price: product.current_retail_price, new_retail_price: retailPrice, changed_by: approvedBy, reason });
      product.current_retail_price = retailPrice;
      return product;
    },

    async findInvoiceByHash(hash) { return [...invoices.values()].find(i => i.source_sha256 === hash) || null; },
    async putInvoiceObject(hash, buffer) { const p = `${hash.slice(0, 2)}/${hash}`; objects.set(p, buffer); return p; },
    async downloadInvoiceObject(objectPath) {
      if (!objects.has(objectPath)) throw new Error('object not found');
      return { buffer: objects.get(objectPath), contentType: 'application/octet-stream' };
    },
    async createInvoice(record) {
      const inv = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...record };
      invoices.set(inv.id, inv);
      linesByInvoice.set(inv.id, []);
      return inv;
    },
    async getInvoice(id) { return invoices.get(id) || null; },
    async updateInvoice(id, patch) { const inv = invoices.get(id); if (!inv) return null; Object.assign(inv, patch); return inv; },
    async replaceInvoiceLines(invoiceId, lines) {
      const stored = lines.map(l => ({ id: crypto.randomUUID(), invoice_id: invoiceId, ...l }));
      linesByInvoice.set(invoiceId, stored);
      return stored;
    },
    async listInvoiceLines(invoiceId) { return linesByInvoice.get(invoiceId) || []; },
    async listReviewQueue() { return [...linesByInvoice.values()].flat().filter(l => l.review_status === 'needs_review'); },
    async approveInvoice({ invoiceId, approvedBy, lines }) {
      approvals.push({ invoiceId, approvedBy, lines });
      const inv = invoices.get(invoiceId);
      inv.status = 'imported';
      inv.approved_by = approvedBy;
      return { invoice_id: invoiceId, status: 'imported', applied: lines.length };
    },

    async listOpenInvoices() { return [...invoices.values()].filter(i => ['uploaded', 'extracting', 'needs_review'].includes(i.status)); },
    async listGameSources() { return sources; },
    async latestPosBatch() { return { period_end: '2026-08-19' }; },
    async priceIncreaseAlerts() { return []; },
    async resolveUserNames(ids) { return Object.fromEntries(ids.map(id => [id, id === MANAGER_USER_ID ? 'manager' : 'teammate'])); }
  };
}

async function startServer(store) {
  process.env.NODE_ENV = 'production';
  process.env.PRICING_MANAGER_TOKEN = MANAGER_TOKEN;
  process.env.PRICING_AGENT_KEY = 'test-agent-key';
  process.env.PRICING_OCR_WEBHOOK_URL = 'https://ocr.test/extract';
  delete process.env.GEMINI_API_KEY;
  for (const mod of ['./pricing-router', './pricing-ocr']) delete require.cache[require.resolve(mod)];
  const { createPricingRouter } = require('./pricing-router');

  const ocr = { mode: 'ok', calls: 0 };
  const app = express();
  app.use(express.json());
  app.use('/api/pricing', createPricingRouter({
    store,
    verifyUser: async token => {
      if (token === MANAGER_JWT) return { id: MANAGER_USER_ID, email: 'manager@example.test', role: 'manager' };
      if (token === CASHIER_JWT) return { id: '22222222-2222-4222-8222-222222222222', email: 'cashier@example.test', role: 'cashier' };
      return null;
    },
    fetch: async () => {
      ocr.calls++;
      return ocr.mode === 'fail'
        ? { ok: false, status: 503, json: async () => ({}) }
        : { ok: true, status: 200, json: async () => SAMPLE };
    }
  }));
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  return { server, ocr, base: `http://127.0.0.1:${server.address().port}/api/pricing` };
}

function call(base, method, route, { token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(base + route, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
    .then(async res => ({ status: res.status, body: await res.json().catch(() => null) }));
}

test('game state: managers only, scored from the audit trail', async t => {
  const store = createFakeStore();
  store.seedProduct({ id: 'p1', name: 'Rice', current_unit_cost: 2, current_retail_price: 2.49 });
  store.seedInvoice({ id: 'inv-open', invoice_number: 'R-1', status: 'needs_review', created_at: '2026-09-01T12:00:00Z' }, [
    { id: 'l1', review_status: 'needs_review' }, { id: 'l2', review_status: 'needs_review' }
  ]);
  store._state.sources.invoices.push({
    id: 'done', invoice_number: 'D-1', status: 'imported', approved_by: MANAGER_USER_ID,
    approved_at: new Date().toISOString(), line_count: 2, reconciliation_variance: 0
  });
  const { server, base } = await startServer(store);
  t.after(() => server.close());

  assert.equal((await call(base, 'GET', '/game/state')).status, 401);
  assert.equal((await call(base, 'GET', '/game/state', { token: CASHIER_JWT })).status, 401, 'a cashier role is not a manager');

  const res = await call(base, 'GET', '/game/state', { token: MANAGER_JWT });
  assert.equal(res.status, 200);
  assert.equal(res.body.player.name, 'manager');
  assert.equal(res.body.player.xp, 100 + 2 * 5 + 50);
  assert.equal(res.body.player.badges.find(b => b.key === 'first_pallet').earned, true);
  const missions = Object.fromEntries(res.body.missions.map(m => [m.key, m]));
  assert.equal(missions.review_line.count, 1);
  assert.equal(missions.review_line.items[0].lines, 2);
  assert.equal(missions.rule_guard.items[0].rulePrice, suggestedRetail(2));
  assert.ok(res.body.health.score >= 0 && res.body.health.score <= 100);

  const operator = await call(base, 'GET', '/game/state', { token: MANAGER_TOKEN });
  assert.equal(operator.status, 200);
  assert.equal(operator.body.player.scoring, false, 'an operator token has no person to credit');
});

test('apply-rule: the server prices it, only a named approver may write it', async t => {
  const store = createFakeStore();
  store.seedProduct({ id: 'under', name: 'Under', current_unit_cost: 2.0, current_retail_price: 2.49 });
  store.seedProduct({ id: 'on', name: 'On', current_unit_cost: 2.0, current_retail_price: suggestedRetail(2.0) });
  store.seedProduct({ id: 'above', name: 'Above', current_unit_cost: 1.0, current_retail_price: 4.99 });
  store.seedProduct({ id: 'bags', name: 'Bags', current_unit_cost: 0.05, current_retail_price: null, internal: true });
  store.seedProduct({ id: 'nocost', name: 'No cost', current_unit_cost: null, current_retail_price: 3.99 });
  const { server, base } = await startServer(store);
  t.after(() => server.close());

  const operator = await call(base, 'POST', '/products/under/apply-rule', { token: MANAGER_TOKEN, body: {} });
  assert.equal(operator.status, 403);
  assert.equal(operator.body.code, 'APPROVER_IDENTITY_REQUIRED');
  assert.equal(store._state.history.length, 0);

  // The browser cannot choose the price: a supplied retailPrice is ignored.
  const fixed = await call(base, 'POST', '/products/under/apply-rule', { token: MANAGER_JWT, body: { retailPrice: 0.01 } });
  assert.equal(fixed.status, 200);
  assert.equal(fixed.body.rulePrice, suggestedRetail(2.0));
  assert.equal(fixed.body.previous, 2.49);
  assert.equal(store._state.products.get('under').current_retail_price, suggestedRetail(2.0));
  assert.deepEqual(
    { by: store._state.history[0].changed_by, reason: store._state.history[0].reason },
    { by: MANAGER_USER_ID, reason: 'Pricing rule: unit cost x1.70, .99 shelf rounding' }
  );

  const same = await call(base, 'POST', '/products/on/apply-rule', { token: MANAGER_JWT, body: {} });
  assert.equal(same.status, 200);
  assert.equal(same.body.unchanged, true);
  assert.equal(store._state.history.length, 1, 'no-op writes no history');

  const lower = await call(base, 'POST', '/products/above/apply-rule', { token: MANAGER_JWT, body: {} });
  assert.equal(lower.status, 409);
  assert.equal(lower.body.code, 'WOULD_LOWER_PRICE');
  assert.equal(store._state.products.get('above').current_retail_price, 4.99, 'unchanged without confirmation');
  const confirmed = await call(base, 'POST', '/products/above/apply-rule', { token: MANAGER_JWT, body: { allowDecrease: true } });
  assert.equal(confirmed.status, 200);
  assert.equal(store._state.products.get('above').current_retail_price, suggestedRetail(1.0));

  assert.equal((await call(base, 'POST', '/products/bags/apply-rule', { token: MANAGER_JWT, body: {} })).body.code, 'INTERNAL_ITEM');
  assert.equal((await call(base, 'POST', '/products/nocost/apply-rule', { token: MANAGER_JWT, body: {} })).body.code, 'NO_UNIT_COST');
  assert.equal((await call(base, 'POST', '/products/missing/apply-rule', { token: MANAGER_JWT, body: {} })).status, 404);
});

test('a failed first read leaves the scan rescuable, and the rescue lands it in review', async t => {
  const store = createFakeStore();
  const { server, base, ocr } = await startServer(store);
  t.after(() => server.close());

  ocr.mode = 'fail';
  const form = new FormData();
  form.append('invoice', new Blob([SCAN], { type: 'application/pdf' }), 'scan.pdf');
  const upload = await fetch(base + '/invoices', { method: 'POST', headers: { Authorization: `Bearer ${MANAGER_JWT}` }, body: form });
  assert.equal(upload.status, 400);
  const [invoice] = [...store._state.invoices.values()];
  assert.equal(invoice.status, 'uploaded', 'not stranded in extracting');

  const again = new FormData();
  again.append('invoice', new Blob([SCAN], { type: 'application/pdf' }), 'scan.pdf');
  const dup = await (await fetch(base + '/invoices', { method: 'POST', headers: { Authorization: `Bearer ${MANAGER_JWT}` }, body: again })).json();
  assert.equal(dup.duplicate, true);
  assert.equal(dup.rescuable, true, 'the hub is told it can re-read it');

  // Rescue while the reader is still down: 502, and still rescuable after.
  const stillDown = await call(base, 'POST', `/invoices/${invoice.id}/extract`, { token: MANAGER_JWT });
  assert.equal(stillDown.status, 502);
  assert.equal(invoice.status, 'uploaded');

  ocr.mode = 'ok';
  const rescued = await call(base, 'POST', `/invoices/${invoice.id}/extract`, { token: MANAGER_JWT });
  assert.equal(rescued.status, 200, JSON.stringify(rescued.body));
  assert.equal(invoice.status, 'needs_review');
  assert.equal(rescued.body.lines.length, SAMPLE.items.length);
  assert.ok(rescued.body.lines.every(line => line.review_status === 'needs_review'), 'a re-read cannot approve itself');

  const twice = await call(base, 'POST', `/invoices/${invoice.id}/extract`, { token: MANAGER_JWT });
  assert.equal(twice.status, 409, 'lines under review are never overwritten');
  assert.equal(twice.body.code, 'NOT_STUCK');
});

test('rescue refuses fresh reads and scans with nothing on file', async t => {
  const store = createFakeStore();
  store.seedInvoice({ id: 'fresh', status: 'extracting', created_at: new Date().toISOString(), source_object_path: 'aa/x' });
  store.seedInvoice({ id: 'noscan', status: 'uploaded', created_at: '2026-08-20T12:00:00Z', source_object_path: null });
  store.seedInvoice({ id: 'notpdf', status: 'uploaded', created_at: '2026-08-20T12:00:00Z', source_object_path: 'bb/y' });
  store.seedObject('bb/y', Buffer.from('this is not a scan at all, just text'));
  const { server, base, ocr } = await startServer(store);
  t.after(() => server.close());

  assert.equal((await call(base, 'POST', '/invoices/fresh/extract', { token: MANAGER_JWT })).body.code, 'NOT_STUCK');
  assert.equal((await call(base, 'POST', '/invoices/noscan/extract', { token: MANAGER_JWT })).body.code, 'NO_SCAN');
  assert.equal((await call(base, 'POST', '/invoices/notpdf/extract', { token: MANAGER_JWT })).body.code, 'UNREADABLE_SCAN');
  assert.equal((await call(base, 'POST', '/invoices/fresh/extract', { token: CASHIER_JWT })).status, 401);
  assert.equal(ocr.calls, 0, 'nothing was sent to the reader');
});

test('approval links history only to lines of the invoice being approved', async t => {
  const store = createFakeStore();
  store.seedProduct({ id: 'p1', name: 'Rice', current_unit_cost: 2, current_retail_price: 3.99 });
  const own = crypto.randomUUID();
  const foreign = crypto.randomUUID();
  store.seedInvoice({ id: 'inv', status: 'needs_review', invoice_subtotal: 20 }, [{ id: own, line_number: 1, review_status: 'needs_review' }]);
  store.seedInvoice({ id: 'other', status: 'needs_review' }, [{ id: foreign, line_number: 1, review_status: 'needs_review' }]);
  const { server, base } = await startServer(store);
  t.after(() => server.close());

  const res = await call(base, 'POST', '/invoices/inv/approve', {
    token: MANAGER_JWT,
    body: {
      lines: [
        { id: own, line_number: 1, product_id: 'p1', unit_cost: 2, line_total: 10, retail_price: 3.99 },
        { invoice_line_id: foreign, line_number: 2, product_id: 'p1', unit_cost: 2, line_total: 10, retail_price: 3.99 }
      ]
    }
  });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const sent = store._state.approvals[0].lines.map(l => l.invoice_line_id);
  assert.deepEqual(sent, [own, null], "another invoice's line is never named");
});
