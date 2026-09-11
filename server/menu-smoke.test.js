'use strict';

// Menu loader smoke guard.
//
// Regression target: the container once served /api/menu as {menus: []}
// because a host-only MENU_DATA_PATH shadowed the seed baked into the image
// (fixed in 08baf39). The loader now refuses to boot on a missing or empty
// seed, and /api/menu returns 503 instead of a zero-item payload.
//
// This smoke guard asserts all three properties against the REAL files and
// the REAL server process:
//   1. The real seed resolves and contains items.
//   2. A booted server serves /api/menu with items > 0.
//   3. An empty seed makes the server refuse to boot (exit != 0).

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { resolveMenuDataPath, countMenuItems } = require('./menu-seed');

const SERVER = path.join(__dirname, 'index.js');
const REPO_SEED = path.join(__dirname, '..', 'apps', 'menu', 'scripts', 'anthonys-seed.json');

// Avoid the Windows excluded range 3001-3100 and the common 3000s.
function pickPort() {
  return 20000 + Math.floor(Math.random() * 20000);
}

// Boot the real server with the Telegram bot and Supabase disabled so the
// smoke test exercises the menu path only. Returns the child + base URL.
function bootServer(extraEnv = {}) {
  const port = pickPort();
  const child = spawn(process.execPath, [SERVER], {
    cwd: __dirname,
    env: {
      ...process.env,
      PORT: String(port),
      TELEGRAM_TOKEN: '',
      SUPABASE_URL: '',
      SUPABASE_ANON_KEY: '',
      PRICING_SERVE_STATIC: '0',
      ...extraEnv,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return { child, port, base: `http://127.0.0.1:${port}` };
}

async function waitForHttp(base, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${base}/api/health`);
      if (res.ok) return res;
    } catch {
      // server not up yet
    }
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error(`server did not become reachable at ${base} within ${timeoutMs}ms`);
}

function writeTempSeed(contents) {
  const file = path.join(os.tmpdir(), `menu-smoke-${process.pid}-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(contents));
  return file;
}

test('real seed resolves and contains items', () => {
  const resolved = resolveMenuDataPath();
  assert.ok(resolved, 'resolveMenuDataPath returned null — no seed found');
  const data = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  const items = countMenuItems(data);
  assert.ok(items > 0, `resolved seed ${resolved} has 0 items`);
});

test('booted server: /api/menu returns items > 0', async (t) => {
  const { child, base } = bootServer();
  t.after(() => child.kill());

  await waitForHttp(base);
  const res = await fetch(`${base}/api/menu`);
  assert.equal(res.status, 200);
  const body = await res.json();
  const items = countMenuItems(body);
  assert.ok(items > 0, `/api/menu returned 0 items: ${JSON.stringify(body).slice(0, 200)}`);
});

test('booted server: repo checkout seed is the one served', async (t) => {
  const { child, base } = bootServer();
  t.after(() => child.kill());

  await waitForHttp(base);
  const res = await fetch(`${base}/api/menu`);
  assert.equal(res.status, 200);
  const body = await res.json();
  // The repo checkout layout must win when MENU_DATA_PATH is unset, so the
  // server serves the populated seed, not a host-path fallback.
  const servedSource = resolveMenuDataPath();
  const servedFromDisk = JSON.parse(fs.readFileSync(servedSource, 'utf8'));
  assert.equal(countMenuItems(body), countMenuItems(servedFromDisk));
  assert.equal(body.nombre, servedFromDisk.nombre);
});

test('empty seed makes the server refuse to boot (exit != 0)', async (t) => {
  const seed = writeTempSeed({ slug: 'anthonys', nombre: 'Anthony\'s', menus: [] });
  t.after(() => { try { fs.unlinkSync(seed); } catch {} });

  const { child } = bootServer({ MENU_DATA_PATH: seed });
  const exitCode = await new Promise(resolve => child.on('exit', resolve));

  assert.notEqual(exitCode, 0, 'server must not boot with an empty menu seed');
  assert.equal(exitCode, 1, `expected exit code 1, got ${exitCode}`);
});

test('malformed seed makes the server refuse to boot (exit != 0)', async (t) => {
  const seed = path.join(os.tmpdir(), `menu-smoke-bad-${Date.now()}.json`);
  fs.writeFileSync(seed, '{ not valid json !!!');
  t.after(() => { try { fs.unlinkSync(seed); } catch {} });

  const { child } = bootServer({ MENU_DATA_PATH: seed });
  const exitCode = await new Promise(resolve => child.on('exit', resolve));

  assert.notEqual(exitCode, 0, 'server must not boot with a malformed menu seed');
  assert.equal(exitCode, 1, `expected exit code 1, got ${exitCode}`);
});

test('host-only MENU_DATA_PATH (missing in container) falls back to a populated seed', async (t) => {
  // Regression for 08baf39: server/.env points at a Windows host path that
  // cannot exist inside the container. The resolver must skip it and serve
  // the seed the image actually has — never {menus: []}.
  const hostOnly = 'C:\\Users\\Jayto\\no-such-container-path\\anthonys-seed.json';
  const { child, base } = bootServer({ MENU_DATA_PATH: hostOnly });
  t.after(() => child.kill());

  await waitForHttp(base);
  const res = await fetch(`${base}/api/menu`);
  assert.equal(res.status, 200);
  const body = await res.json();
  const items = countMenuItems(body);
  assert.ok(items > 0, `fallback menu returned 0 items: ${JSON.stringify(body).slice(0, 200)}`);
});
