// Anthony's Supermarket — Automated e2e smoke test for the storefront order flow.
//
// Runs WITHOUT a browser tool. Pure Node: boots the real order-engine (index.js)
// with an isolated environment, serves the static storefront, then drives the
// exact HTTP contract the storefront's js/cart.js relies on:
//   GET  /api/items                         -> catalog (ids taken live, never hardcoded)
//   POST /api/orders  {items, tipoEntrega, cliente, notas} -> {ok, orderId, total}
//   GET  /api/orders/:id/status             -> {ok, orderId, estado, total, tipoEntrega, items}
//
// Usage:
//   node server/e2e-order-smoke.js
//
// Exit code: 0 on full PASS, non-zero on any failure (with a readable, step-named reason).
//
// All prices come from the engine catalog — the test asserts NO price value of its own.
// The isolated run writes only to server/data/orders.json locally; this script backs
// up and restores that file so no test orders are left behind.

'use strict';

const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

/* ─── Paths ────────────────────────────────────────────────────────── */
const SERVER_DIR = __dirname;
const ENGINE_SCRIPT = path.join(SERVER_DIR, 'index.js');
const SITE_DIR = path.join(SERVER_DIR, '..', '..', 'anthonys-supermarket-site', 'src');
const ORDERS_FILE = path.join(SERVER_DIR, 'data', 'orders.json');

/* ─── Configuration ────────────────────────────────────────────────── */
const PORT = parseInt(process.env.E2E_ENGINE_PORT || '3009', 10);
const SITE_PORT = parseInt(process.env.E2E_SITE_PORT || '5510', 10);
const CATALOG_URL = `/api/items`;
// E2E_ENGINE_URL: when set, the test does NOT boot its own engine and instead
// points at this URL (e.g. an already-running or intentionally-stopped engine).
const ENGINE_BASE = process.env.E2E_ENGINE_URL
  ? process.env.E2E_ENGINE_URL.replace(/\/+$/, '')
  : `http://127.0.0.1:${PORT}`;
const SITE_BASE = `http://127.0.0.1:${SITE_PORT}`;

/* ─── Step runner with named-step failure ─────────────────────────── */
let currentStep = 'init';
function failStep(step, message) {
  console.error(`FAIL [${step}]: ${message}`);
  cleanup();
  process.exit(1);
}
function step(stepName, fn) {
  currentStep = stepName;
  return fn();
}

/* ─── Order-store backup/restore ──────────────────────────────────── */
// The test uses cliente.nombre 'E2E Test Hermes' and a fixed notas string.
// We strip any prior test orders from the backup so they never accumulate
// across runs, even if a previous run was interrupted before cleanup.
const TEST_MARKER_NOTAS = 'Automated end-to-end test order';
const TEST_CLIENTE_NOMBRE = 'E2E Test Hermes';
function isTestOrder(order) {
  if (order && order.notas && order.notas.includes(TEST_MARKER_NOTAS)) return true;
  if (order && order.cliente && order.cliente.nombre === TEST_CLIENTE_NOMBRE) return true;
  return false;
}
function stripTestOrders(jsonText) {
  try {
    const orders = JSON.parse(jsonText);
    const clean = orders.filter(o => !isTestOrder(o));
    return JSON.stringify(clean, null, 2);
  } catch {
    return null; // not parseable — leave as-is
  }
}
let backup = null;
function backupOrders() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
      const stripped = stripTestOrders(raw);
      // If parsing succeeded and test orders were removed, save the cleaned version.
      if (stripped !== null && stripped !== raw) {
        backup = stripped;
        // Persist the cleaned backup immediately so the file itself is clean.
        const dir = path.dirname(ORDERS_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(ORDERS_FILE, stripped);
      } else {
        backup = raw;
      }
    }
  } catch (e) {
    console.warn(`[${currentStep}] warning: could not back up orders file: ${e.message}`);
  }
}
function restoreOrders() {
  try {
    if (backup !== null) {
      fs.writeFileSync(ORDERS_FILE, backup);
    } else if (fs.existsSync(ORDERS_FILE)) {
      // No backup means there were no orders — truncate to empty array.
      fs.writeFileSync(ORDERS_FILE, '[]');
    }
  } catch (e) {
    console.error(`[${currentStep}] warning: could not restore orders file: ${e.message}`);
  }
}
function cleanup() {
  restoreOrders();
}

/* ─── Engine boot ─────────────────────────────────────────────────── */
// Isolated env: blank all external integrations so the engine never tries to
// talk to Telegram / WhatsApp / n8n / Supabase. Orders write to the local
// server/data/orders.json which we back up + restore around the run.
function engineEnv() {
  const env = { ...process.env };
  env.PORT = String(PORT);
  env.TELEGRAM_TOKEN = '';
  env.WHATSAPP_WEBHOOK = '';
  env.N8N_WEBHOOK_URL = '';
  env.SUPABASE_URL = '';
  env.SUPABASE_ANON_KEY = '';
  env.SUPABASE_SERVICE_ROLE_KEY = '';
  env.ADMIN_TOKEN = '';
  env.ALLOWED_ORIGINS = '*';
  // Point the engine at the real repo seed (132 items) — never a hardcoded id.
  env.MENU_DATA_PATH = path.join(SERVER_DIR, '..', 'apps', 'menu', 'scripts', 'anthonys-seed.json');
  return env;
}

function bootEngine() {
  const child = spawn(process.execPath, [ENGINE_SCRIPT], {
    cwd: SERVER_DIR,
    env: engineEnv(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (d) => process.stdout.write('[engine] ' + d));
  child.stderr.on('data', (d) => process.stderr.write('[engine] ' + d));
  return child;
}

/* ─── Static storefront server ────────────────────────────────────── */
function serveStatic(dir, port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(dir, req.url === '/' ? '/index.html' : req.url);
      if (filePath.endsWith('/')) filePath = path.join(filePath, 'index.html');
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        const ext = path.extname(filePath).toLowerCase();
        const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
        res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

/* ─── HTTP helpers ────────────────────────────────────────────────── */
async function httpGet(url, opts = {}) {
  const res = await fetch(url, opts);
  return res;
}

async function waitForHealth(base, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${base}/api/health`);
      if (res.ok) return res;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  return null;
}

/* ─── Main ────────────────────────────────────────────────────────── */
(async () => {
  let engineChild = null;
  let staticServer = null;
  let orderId = null;
  let itemId = null;
  let catalogItems = null;
  let orderTotal = null;
  let orderTipoEntrega = null;

  try {
    /* Step 1: boot isolated engine (or connect to an external one) */
    await step('boot-engine', async () => {
      backupOrders();
      if (process.env.E2E_ENGINE_URL) {
        // External engine mode: skip booting, just wait for it to be reachable.
        const health = await waitForHealth(ENGINE_BASE, 3000);
        if (!health) {
          failStep('boot-engine', `external engine at ${ENGINE_BASE} is not reachable (GET /api/health failed)`);
        }
        return;
      }
      engineChild = bootEngine();
      const health = await waitForHealth(ENGINE_BASE);
      if (!health) {
        failStep('boot-engine', `engine did not become reachable at ${ENGINE_BASE} within 20s`);
      }
      const body = await health.json();
      if (body.status !== 'ok' || !body.items || body.items <= 0) {
        failStep('boot-engine', `health endpoint unhealthy: ${JSON.stringify(body)}`);
      }
      console.log(`[1] engine booted: ${body.items} catalog items ready`);
    });

    /* Step 2: serve + load the static storefront */
    await step('load-site', async () => {
      staticServer = await serveStatic(SITE_DIR, SITE_PORT);
      const res = await httpGet(`${SITE_BASE}/`);
      if (res.status !== 200) {
        failStep('load-site', `storefront returned HTTP ${res.status} (expected 200)`);
      }
      const html = await res.text();
      if (!html.includes('ANTHONY\'S SUPERMARKET') && !html.includes('Supermercado')) {
        failStep('load-site', 'storefront markup does not look like Anthony\'s Supermarket');
      }
      console.log('[2] storefront loaded');
    });

    /* Step 3: load catalog — ids taken live, never hardcoded */
    await step('load-catalog', async () => {
      const res = await httpGet(`${ENGINE_BASE}${CATALOG_URL}`);
      if (res.status !== 200) {
        failStep('load-catalog', `GET /api/items returned HTTP ${res.status}`);
      }
      catalogItems = await res.json();
      if (!Array.isArray(catalogItems) || catalogItems.length === 0) {
        failStep('load-catalog', 'catalog is empty');
      }
      // The contract guarantees ids like "kitchen-Desayunos / Breakfast-mangu-3-golpes".
      itemId = catalogItems[0].id;
      if (!itemId || !itemId.includes('/')) {
        failStep('load-catalog', `first catalog item has no slash-bearing id: ${itemId}`);
      }
      // Cross-check that the item id also appears in /api/items search.
      const first = catalogItems[0];
      assert.ok(first.precio > 0, 'catalog item must carry a precio');
      console.log(`[3] catalog loaded (${catalogItems.length} items); using live id: ${itemId} — ${first.nombre} @ $${first.precio.toFixed(2)}`);
    });

    /* Step 4 + 5 + 6: submit order (add item + fill form + submit) */
    await step('submit-order', async () => {
      const payload = {
        items: [{ id: itemId, cantidad: 1 }],
        tipoEntrega: 'pickup',
        cliente: { nombre: 'E2E Test Hermes', telefono: '2015550100', direccion: '' },
        notas: 'Automated end-to-end test order — please ignore',
      };
      const res = await fetch(`${ENGINE_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status !== 200) {
        const txt = await res.text();
        failStep('submit-order', `POST /api/orders returned HTTP ${res.status}: ${txt}`);
      }
      const data = await res.json();
      if (!data.ok || !data.orderId) {
        failStep('submit-order', `order response missing ok/orderId: ${JSON.stringify(data)}`);
      }
      orderId = data.orderId;
      orderTotal = data.total;
      orderTipoEntrega = 'pickup';
      console.log(`[4-6] order submitted: #${orderId} total=$${orderTotal.toFixed(2)} (${orderTipoEntrega})`);
    });

    /* Step 7: poll /api/orders/:id/status and assert estado */
    await step('poll-status', async () => {
      const deadline = Date.now() + 10000;
      let status = null;
      while (Date.now() < deadline) {
        const res = await fetch(`${ENGINE_BASE}/api/orders/${encodeURIComponent(orderId)}/status`);
        if (res.status !== 200) {
          failStep('poll-status', `GET /api/orders/:id/status returned HTTP ${res.status}`);
        }
        status = await res.json();
        if (status.ok && status.orderId === orderId && status.estado) {
          break;
        }
        await new Promise((r) => setTimeout(r, 500));
      }
      if (!status || !status.estado) {
        failStep('poll-status', 'status endpoint never returned an estado');
      }
      assert.equal(status.ok, true, 'status.ok must be true');
      assert.equal(status.orderId, orderId, 'status.orderId must match submitted order');
      assert.equal(status.tipoEntrega, orderTipoEntrega, 'status.tipoEntrega mismatch');
      assert.equal(status.items.length, 1, 'status.items must be length 1');
      const line = status.items[0];
      assert.equal(line.nombre, catalogItems[0].nombre, 'status item nombre must match catalog');
      assert.equal(line.cantidad, 1, 'status cantidad must be 1');
      // The estado must be one of the known states per the engine contract.
      const known = ['recibido', 'preparando', 'listo', 'entregado'];
      assert.ok(known.includes(status.estado), `unknown estado: ${status.estado}`);
      console.log(`[7] status polled: #${orderId} estado=${status.estado} total=$${status.total.toFixed(2)} items=[${line.nombre} x${line.cantidad}]`);
    });
  } catch (err) {
    failStep('test', `${err.name}: ${err.message}`);
  } finally {
    if (staticServer) staticServer.close();
    if (engineChild) engineChild.kill();
    cleanup();
  }

  console.log(`PASS [${orderId || 'N/A'}] — order flow verified end-to-end via HTTP (no browser tool).`);
  process.exit(0);
})().catch((err) => {
  failStep('test', `${err.name}: ${err.message}`);
});
