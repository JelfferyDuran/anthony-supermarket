// 🧑‍🍳 SuperKitchen Order Poll Monitor
// Checks if the kitchen aide bot is actively polling for new orders.
// Runs via hermes cron every 5 minutes.
// Reports: polling status, unhandled orders, kitchen thread backlog.

const fs = require('fs');
const path = require('path');

const ORDERS_PATH = path.join(__dirname, '..', '..', 'server', 'data', 'orders.json');
const ORDER_THREADS_PATH = path.join(__dirname, '..', '..', 'server', 'data', 'order_threads.json');

function getNewUnprocessedOrders() {
  try {
    if (!fs.existsSync(ORDERS_PATH)) return { count: 0, orders: [], error: 'orders.json missing' };
    const orders = JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf8'));
    if (!fs.existsSync(ORDER_THREADS_PATH)) return { count: orders.length, orders: orders.map(o => o.id), error: 'order_threads.json missing' };
    const threads = JSON.parse(fs.readFileSync(ORDER_THREADS_PATH, 'utf8'));
    const threadOrderIds = Object.keys(threads);
    const unprocessed = orders.filter(o => o.estado === 'recibido' && !threadOrderIds.includes(o.id));
    return { count: unprocessed.length, orders: unprocessed.map(o => o.id), totalOrders: orders.length, threads: threadOrderIds.length };
  } catch (e) {
    return { count: 0, orders: [], error: e.message };
  }
}

function run() {
  const timestamp = new Date().toISOString();
  const result = getNewUnprocessedOrders();

  const output = [
    `🧑‍🍳 Order Poll Monitor — ${timestamp}`,
    '',
    `  Total orders in system:    ${result.totalOrders || 0}`,
    `  Kitchen threads created:   ${result.threads || 0}`,
    `  Unprocessed (recibido):    ${result.count}`,
    '',
    result.count > 0
      ? `  ⚠️  ${result.count} order(s) not yet posted to kitchen: ${result.orders.join(', ')}`
      : result.error
        ? `  ❌ ${result.error}`
        : `  ✅ All orders processed`,
    '',
    result.count > 0 ? '  ACTION: Kitchen aide bot may not be polling — check server/kitchen-aide.js' : '',
  ].filter(Boolean).join('\n');

  console.log(output);
  return result.count > 0 ? 1 : 0;
}

(async () => {
  try {
    const exitCode = await run();
    process.exit(exitCode);
  } catch (e) {
    console.error(e);
    process.exit(2);
  }
})();
