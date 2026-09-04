const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'anthony-pricing-hub-'));

process.env.PRICING_HUB_STATE_PATH = path.join(tempDir, 'pricing-hub-state.json');
process.env.PRICING_HUB_LOCAL_EMAIL = 'pricing@kingdomfiservices.com';
process.env.PRICING_HUB_LOCAL_PASSWORD = 'test-password';
process.env.PORT = '0';
process.env.TELEGRAM_TOKEN = '';
process.env.KITCHEN_CHAT_ID = '';
process.env.ALLOWED_ORIGINS = '*';

const { app } = require('../index');

let server;
let baseUrl;
let token;

async function request(pathname, options = {}) {
  const res = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  return { res, data };
}

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  const login = await request('/api/pricing/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'pricing@kingdomfiservices.com', password: 'test-password' }),
  });
  assert.equal(login.res.status, 200);
  token = login.data.access_token;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('pricing health reports seeded catalog', async () => {
  const { res, data } = await request('/api/pricing/health');
  assert.equal(res.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.status, 'ok');
  assert.ok(data.catalogItems > 0);
});

test('pricing login rejects invalid credentials', async () => {
  const bad = await request('/api/pricing/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'pricing@kingdomfiservices.com', password: 'wrong' }),
  });
  assert.equal(bad.res.status, 401);
  assert.equal(bad.data.error.code, 'invalid_credentials');
});

test('catalog search and pagination work with bearer auth', async () => {
  const { res, data } = await request('/api/pricing/catalog?q=Family&limit=5&page=1', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  assert.equal(res.status, 200);
  assert.equal(data.ok, true);
  assert.ok(Array.isArray(data.rows));
  assert.ok(data.rows.length <= 5);
  assert.ok(data.meta.total > 0);
});

test('approvals record history and support history lookups', async () => {
  const approve = await request('/api/pricing/items/3/approve', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ note: 'approved in test' }),
  });
  assert.equal(approve.res.status, 200);
  assert.equal(approve.data.ok, true);
  assert.equal(approve.data.item.status, 'approved');

  const history = await request('/api/pricing/items/3/history', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  assert.equal(history.res.status, 200);
  assert.ok(history.data.rows.length >= 1);
});

test('margin watch and audit log are available to signed-in users', async () => {
  const watch = await request('/api/pricing/margin-watch', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(watch.res.status, 200);
  assert.equal(watch.data.ok, true);
  assert.ok(Array.isArray(watch.data.rows));

  const audit = await request('/api/pricing/audit?limit=10', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(audit.res.status, 200);
  assert.equal(audit.data.ok, true);
  assert.ok(Array.isArray(audit.data.rows));
});

test('csv dry run returns row-level validation before apply', async () => {
  const dryRun = await request('/api/pricing/import/csv', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      csv: 'vendor,invoiceNo,itemId,costPerUnit,retail\nTest Vendor,INV-1,3,1.00,1.70',
    }),
  });
  assert.equal(dryRun.res.status, 200);
  assert.equal(dryRun.data.ok, true);
  assert.equal(dryRun.data.errorCount, 0);
  assert.equal(dryRun.data.rowCount, 1);
  assert.ok(Array.isArray(dryRun.data.dryRun));
  assert.equal(dryRun.data.dryRun[0].valid, true);
});

test('duplicate invoice intake is reported cleanly', async () => {
  const first = await request('/api/pricing/invoices', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      vendor: 'Test Vendor',
      invoiceNo: 'INV-DUP-1',
      rows: [{ itemId: 3, retail: 1.99 }],
    }),
  });
  assert.equal(first.res.status, 200);
  assert.equal(first.data.ok, true);
  assert.equal(first.data.duplicate, false);

  const second = await request('/api/pricing/invoices', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      vendor: 'Test Vendor',
      invoiceNo: 'INV-DUP-1',
      rows: [{ itemId: 3, retail: 1.99 }],
    }),
  });
  assert.equal(second.res.status, 200);
  assert.equal(second.data.duplicate, true);
  assert.match(second.data.message, /already in system/i);
});
