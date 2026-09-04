const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'anthony-pricing-hub-vercel-'));
process.env.PRICING_HUB_STATE_PATH = path.join(tempDir, 'pricing-hub-state.json');
process.env.PRICING_HUB_LOCAL_EMAIL = 'pricing@kingdomfiservices.com';
process.env.PRICING_HUB_LOCAL_PASSWORD = 'test-password';
process.env.PORT = '0';
process.env.TELEGRAM_TOKEN = '';
process.env.KITCHEN_CHAT_ID = '';
process.env.ALLOWED_ORIGINS = '*';

const app = require('../../api/pricing/[...path].js');

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

test('vercel bridge serves the pricing hub api', async () => {
  const { res, data } = await request('/api/pricing/health');
  assert.equal(res.status, 200);
  assert.equal(data.ok, true);
  assert.ok(data.catalogItems > 0);
});

test('vercel bridge still supports signed-in catalog calls', async () => {
  const { res, data } = await request('/api/pricing/catalog?q=Family&limit=3&page=1', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  assert.equal(res.status, 200);
  assert.equal(data.ok, true);
  assert.ok(Array.isArray(data.rows));
});
