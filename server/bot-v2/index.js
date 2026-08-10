'use strict';

// Anthony's Super Kitchen - Telegram Bot v2
// Native Node runtime with no database credentials.
//
// Security posture:
// - TELEGRAM_TOKEN and KITCHEN_CHAT_ID are server-side only.
// - /api/kitchen/notify is notification-only and requires KITCHEN_NOTIFY_TOKEN.
// - No Telegram callback mutates order status; staff changes stay in the authenticated KDS.
// - Order receipts are fetched from the redacted Supabase Edge Function endpoint.

const http = require('node:http');

const PORT = Number(process.env.PORT || 3001);
const TELEGRAM_TOKEN = String(process.env.TELEGRAM_TOKEN || '').trim();
const KITCHEN_CHAT_ID = String(process.env.KITCHEN_CHAT_ID || '').trim();
const KITCHEN_NOTIFY_TOKEN = String(process.env.KITCHEN_NOTIFY_TOKEN || '').trim();
const MINIAPP_URL = String(process.env.MINIAPP_URL || 'https://jelfferyduran.github.io/anthony-supermarket/apps/superkitchen/dist/').trim();
const MINIAPP_API_URL = String(process.env.MINIAPP_API_URL || 'https://cbpdiiyzzmbavsymjysb.supabase.co/functions/v1/superkitchen').trim();

function requireSafeUrl(name, value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
  const localDev = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !localDev) throw new Error(`${name} must use HTTPS outside local development`);
  return url.toString();
}

const SAFE_MINIAPP_URL = requireSafeUrl('MINIAPP_URL', MINIAPP_URL);
const SAFE_API_URL = requireSafeUrl('MINIAPP_API_URL', MINIAPP_API_URL).replace(/\/$/, '');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function money(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : '$0.00';
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  res.end(payload);
}

async function readJsonBody(req, limitBytes = 32768) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > limitBytes) throw new Error('Request body too large');
  }
  return raw ? JSON.parse(raw) : {};
}

function telegramEndpoint(method) {
  return `https://api.telegram.org/bot${TELEGRAM_TOKEN}/${method}`;
}

async function telegramRequest(method, payload, timeoutMs = 10000) {
  if (!TELEGRAM_TOKEN) throw new Error('Telegram bot is not configured');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(telegramEndpoint(method), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body?.ok !== true) throw new Error(`Telegram API ${method} failed (${res.status})`);
    return body.result;
  } finally {
    clearTimeout(timer);
  }
}

function miniAppKeyboard() {
  return { inline_keyboard: [[{ text: "Open Anthony's Super Kitchen", web_app: { url: SAFE_MINIAPP_URL } }]] };
}

async function fetchReceipt(orderId) {
  if (!/^[A-F0-9]{8,16}$/i.test(orderId)) throw new Error('Invalid order reference');
  const res = await fetch(`${SAFE_API_URL}/api/orders/${encodeURIComponent(orderId)}`, { headers: { Accept: 'application/json' } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Receipt lookup failed (${res.status})`);
  return body;
}

function receiptMessage(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const lines = items.slice(0, 30).map((item) => {
    const qty = Math.max(1, Math.min(20, Number(item?.qty || item?.cantidad) || 1));
    const name = escapeHtml(item?.name || item?.nombre || 'Item');
    return `• ${qty}x ${name}`;
  });
  return [
    `Order #${escapeHtml(order?.id)}`,
    '',
    ...(lines.length ? lines : ['Order received.']),
    '',
    `Total: ${money(order?.total ?? order?.subtotal)}`,
    `Type: ${order?.tipo_entrega === 'delivery' || order?.tipoEntrega === 'delivery' ? 'Delivery' : 'Pickup'}`,
    `Status: ${escapeHtml(order?.estado || 'recibido')}`,
  ].join('\n');
}

function kitchenMessage(order) {
  const id = escapeHtml(order?.id || order?.orderId || 'NEW');
  const items = Array.isArray(order?.items) ? order.items.slice(0, 40) : [];
  const itemLines = items.map((item) => {
    const qty = Math.max(1, Math.min(99, Number(item?.qty || item?.cantidad) || 1));
    const name = escapeHtml(item?.name || item?.nombre || 'Item');
    const details = [];
    if (item?.meat?.name) details.push(escapeHtml(item.meat.name));
    if (item?.side?.name) details.push(escapeHtml(item.side.name));
    return `• ${qty}x ${name}${details.length ? ` - ${details.join(' / ')}` : ''}`;
  });
  const type = order?.tipo_entrega === 'delivery' || order?.tipoEntrega === 'delivery' ? 'Delivery' : 'Pickup';
  const total = money(order?.total ?? order?.subtotal);
  const verified = order?.telegram_verified === true || order?.telegramVerified === true ? 'yes' : 'no';
  return [
    `<b>New Super Kitchen order #${id}</b>`,
    '',
    ...(itemLines.length ? itemLines : ['Order received. Open KDS for details.']),
    '',
    `<b>Total:</b> ${total}`,
    `<b>Type:</b> ${escapeHtml(type)}`,
    `<b>Telegram verified:</b> ${verified}`,
    '',
    'Use the protected Kitchen Display System for status changes.',
  ].join('\n');
}

async function sendMessage(chatId, text, options = {}) {
  return telegramRequest('sendMessage', { chat_id: chatId, text, ...options });
}

async function handleStart(chatId, payload) {
  const match = String(payload || '').trim().match(/^ORDER_([A-F0-9]{8,16})$/i);
  if (match) {
    try {
      const order = await fetchReceipt(match[1].toUpperCase());
      return sendMessage(chatId, receiptMessage(order), { reply_markup: miniAppKeyboard() });
    } catch {
      return sendMessage(chatId, 'That order receipt is temporarily unavailable. Your order data remains protected.', { reply_markup: miniAppKeyboard() });
    }
  }
  return sendMessage(chatId, "Anthony's Super Kitchen - open the verified Mini App to order.", { reply_markup: miniAppKeyboard() });
}

let updateOffset = 0;
let stopping = false;
async function pollingLoop() {
  if (!TELEGRAM_TOKEN) return console.log('Bot v2 disabled: TELEGRAM_TOKEN is not configured.');
  while (!stopping) {
    try {
      const updates = await telegramRequest('getUpdates', { offset: updateOffset, timeout: 30, allowed_updates: ['message'] }, 40000);
      for (const update of Array.isArray(updates) ? updates : []) {
        if (Number.isSafeInteger(update?.update_id)) updateOffset = update.update_id + 1;
        const msg = update?.message;
        const text = typeof msg?.text === 'string' ? msg.text.trim() : '';
        if (!msg?.chat?.id || msg.chat.type !== 'private') continue;
        const start = text.match(/^\/start(?:@\w+)?(?:\s+(.+))?$/i);
        if (start) await handleStart(msg.chat.id, start[1] || '');
        else if (/^\/(menu|help)(?:@\w+)?$/i.test(text)) await sendMessage(msg.chat.id, 'Open the verified Mini App to browse current menu and prices.', { reply_markup: miniAppKeyboard() });
      }
    } catch (err) {
      if (!stopping) console.error('Telegram polling error:', err?.message || 'unknown');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/api/health') {
    return sendJson(res, 200, {
      status: 'ok',
      service: 'superkitchen-bot-v2',
      botEnabled: Boolean(TELEGRAM_TOKEN),
      kitchenNotifyEnabled: Boolean(KITCHEN_CHAT_ID && KITCHEN_NOTIFY_TOKEN),
      orderStorage: 'supabase-edge-function-only',
      kitchenOperations: 'authenticated-kds-only',
    });
  }

  if (req.method === 'POST' && req.url === '/api/kitchen/notify') {
    if (!KITCHEN_CHAT_ID || !KITCHEN_NOTIFY_TOKEN) return sendJson(res, 503, { error: 'Kitchen notifications are not configured' });
    if (req.headers.authorization !== `Bearer ${KITCHEN_NOTIFY_TOKEN}`) return sendJson(res, 401, { error: 'Unauthorized' });
    try {
      const body = await readJsonBody(req);
      await sendMessage(KITCHEN_CHAT_ID, kitchenMessage(body.order || body), { parse_mode: 'HTML' });
      return sendJson(res, 202, { ok: true });
    } catch (err) {
      return sendJson(res, 400, { error: err?.message || 'Invalid notification request' });
    }
  }

  return sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Super Kitchen bot v2 listening on port ${PORT}`);
  pollingLoop().catch((err) => console.error('Telegram polling loop stopped:', err?.message || 'Error'));
});

function shutdown() {
  stopping = true;
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
