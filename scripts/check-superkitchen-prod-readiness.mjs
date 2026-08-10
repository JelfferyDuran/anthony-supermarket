import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  }
}

const indexHtml = read('apps/superkitchen/index.html');
assert(indexHtml.includes('https://telegram.org/js/telegram-web-app.js'), 'Mini App index.html must load Telegram WebApp SDK');

const render = read('render.yaml');
assert(/name:\s*anthonys-order-api[\s\S]*rootDir:\s*server\/bot-v2/.test(render), 'Render anthonys-order-api must point at server/bot-v2');
assert(!/name:\s*anthonys-order-api[\s\S]*rootDir:\s*server\s*(\n|$)/.test(render), 'Render anthonys-order-api must not point at legacy server root');
assert(render.includes('KITCHEN_NOTIFY_TOKEN'), 'Render bot service must define KITCHEN_NOTIFY_TOKEN as a server-side secret');

const miniServer = read('apps/superkitchen/server/index.js');
assert(!miniServer.includes(".from('orders')"), 'Mini App server must not write/read orders directly from Supabase tables');
assert(!miniServer.includes('.from("orders")'), 'Mini App server must not write/read orders directly from Supabase tables');
assert(!/app\.get\(['"]\/api\/orders['"],[\s\S]*loadOrders/.test(miniServer), 'Mini App server must not expose a public order list');
assert(!/update\s*\(\s*\{\s*estado/.test(miniServer), 'Mini App server must not update order status directly');
assert(miniServer.includes('Order API moved to the protected Supabase Edge Function'), 'Mini App server order routes must be explicitly retired');

const bot = read('server/bot-v2/index.js');
assert(bot.includes('/api/kitchen/notify'), 'Bot v2 must expose notification-only kitchen alert route');
assert(bot.includes('KITCHEN_NOTIFY_TOKEN'), 'Kitchen notification route must require a dedicated token');
assert(!bot.includes('callback_query'), 'Bot v2 must not handle Telegram callback status mutations');
assert(!/staff_update_order_status|\.rpc\(/.test(bot), 'Bot v2 must not call staff status mutation RPCs');
assert(bot.includes('authenticated-kds-only'), 'Bot v2 health must advertise authenticated KDS-only operations');

if (!process.exitCode) console.log('Super Kitchen production-readiness guards passed.');
