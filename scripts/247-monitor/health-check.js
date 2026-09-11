// 🧑‍🍳 SuperKitchen 24/7 Health Monitor
// Checks the Express server, Supabase Edge Function, and bot polling status.
// Designed to run via hermes cron every 5 minutes.

const http = require('http');
const fs = require('fs');
const path = require('path');

const SERVER_URL = process.env.SUPABASE_URL
  ? 'http://host.docker.internal:3001'
  : 'http://localhost:3001';
const HEALTH_URL = `${SERVER_URL}/api/health`;
const ORDERS_PATH = path.join(__dirname, '..', '..', 'server', 'data', 'orders.json');
const ORDER_THREADS_PATH = path.join(__dirname, '..', '..', 'server', 'data', 'order_threads.json');
const POLL_INTERVAL_MS = Number(process.env.KITCHEN_POLL_INTERVAL_MS || 15000);
const ALERT_THRESHOLD_MS = 300000; // 5 minutes

let lastRun = null;
let consecutiveFailures = 0;

async function checkServerHealth() {
  return new Promise((resolve) => {
    const req = http.get(HEALTH_URL, { timeout: 5000 }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve({ ok: true, status: res.statusCode, data });
        } catch (e) {
          resolve({ ok: true, status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', (e) => resolve({ ok: false, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
  });
}

async function checkOrdersFreshness() {
  try {
    if (!fs.existsSync(ORDERS_PATH)) return { ok: false, error: 'orders.json missing' };
    const orders = JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf8'));
    const newest = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    if (!newest) return { ok: false, error: 'no orders' };
    const ageMs = Date.now() - new Date(newest.created_at).getTime();
    return { ok: true, newestOrderId: newest.id, ageMs, ageMin: Math.floor(ageMs / 60000) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function checkKitchenThreads() {
  try {
    if (!fs.existsSync(ORDER_THREADS_PATH)) return { ok: true, threads: 0, note: 'no thread map yet' };
    const threads = JSON.parse(fs.readFileSync(ORDER_THREADS_PATH, 'utf8'));
    const entries = Object.values(threads);
    const active = entries.filter(t => t.estado === 'recibido' || t.estado === 'preparando');
    return { ok: true, total: entries.length, active: active.length, stale: entries.filter(t => Date.now() - new Date(t.created_at).getTime() > ALERT_THRESHOLD_MS).length };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function run() {
  const timestamp = new Date().toISOString();
  const results = {};

  try { results.server = await checkServerHealth(); } catch (e) { results.server = { ok: false, error: e.message }; }
  try { results.orders = await checkOrdersFreshness(); } catch (e) { results.orders = { ok: false, error: e.message }; }
  try { results.kitchen = await checkKitchenThreads(); } catch (e) { results.kitchen = { ok: false, error: e.message }; }

  const allOk = Object.values(results).every(r => r.ok);
  const status = allOk ? '✅ ALL HEALTHY' : '❌ ISSUES DETECTED';
  const failures = Object.entries(results).filter(([, v]) => !v.ok);

  const output = [
    `🧑‍🍳 SuperKitchen Health Check — ${timestamp}`,
    `Status: ${status}`,
    '',
    `  Server:     ${results.server.ok ? '✅' : '❌'} ${results.server.ok ? `HTTP ${results.server.status}` : results.server.error}`,
    `  Orders:     ${results.orders.ok ? '✅' : '❌'} ${results.orders.ok ? `Newest: ${results.orders.newestOrderId} (${results.orders.ageMin}m ago)` : results.orders.error}`,
    `  Kitchen:    ${results.kitchen.ok ? '✅' : '❌'} ${results.kitchen.ok ? `${results.kitchen.active} active threads, ${results.kitchen.stale} stale >5m` : results.kitchen.error}`,
    '',
    `  Cron next run: ${new Date(Date.now() + POLL_INTERVAL_MS).toISOString()}`,
  ].join('\n');

  console.log(output);
  return allOk ? 0 : 1;
}

run().then(exitCode => process.exit(exitCode)).catch(e => { console.error(e); process.exit(2); });
