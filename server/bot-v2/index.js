'use strict';

// Anthony's Super Kitchen — Telegram Bot v2
// Native Node 22 runtime: no external npm dependencies.
//
// Security posture:
// - No direct database credentials or Supabase client.
// - No duplicate/local order store.
// - No public order-list/admin routes.
// - Customer receipt lookup uses only the redacted Edge Function endpoint.
// - Kitchen operations belong in the authenticated KDS, not Telegram commands.
// - TELEGRAM_TOKEN is server-only and must be a freshly rotated BotFather token.

const http = require('node:http');

const PORT = Number(process.env.PORT || 3001);
const TELEGRAM_TOKEN = String(process.env.TELEGRAM_TOKEN || '').trim();
const MINIAPP_URL = String(
  process.env.MINIAPP_URL ||
  'https://jelfferyduran.github.io/anthony-supermarket/apps/superkitchen/dist/'
).trim();
const MINIAPP_API_URL = String(
  process.env.MINIAPP_API_URL ||
  'https://cbpdiiyzzmbavsymjysb.supabase.co/functions/v1/superkitchen'
).trim();
const KITCHEN_CHAT_ID = String(process.env.KITCHEN_CHAT_ID || '').trim();

function requireSafeHttpsUrl(name, value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
  const localDev = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !localDev) {
    throw new Error(`${name} must use HTTPS outside local development`);
  }
  return url.toString();
}

const SAFE_MINIAPP_URL = requireSafeHttpsUrl('MINIAPP_URL', MINIAPP_URL);
const SAFE_API_URL = requireSafeHttpsUrl('MINIAPP_API_URL', MINIAPP_API_URL).replace(/\/$/, '');

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPrivateChat(msg) {
  return msg?.chat?.type === 'private';
}

function isConfiguredKitchenChat(chatId) {
  return Boolean(KITCHEN_CHAT_ID) && String(chatId) === KITCHEN_CHAT_ID;
}

const userWindows = new Map();
function rateLimited(userId) {
  const key = String(userId || 'unknown');
  const now = Date.now();
  const current = userWindows.get(key);
  if (!current || current.resetAt <= now) {
    userWindows.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 20;
}

async function fetchJson(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const body = await res.json().catch(() => ({}));
    return { res, body };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchReceipt(orderId) {
  if (!/^[A-F0-9]{16}$/i.test(orderId)) {
    const err = new Error('Invalid order reference');
    err.code = 'INVALID_ORDER_ID';
    throw err;
  }

  const { res, body } = await fetchJson(
    `${SAFE_API_URL}/api/orders/${encodeURIComponent(orderId)}`,
    { method: 'GET', headers: { Accept: 'application/json' } },
    8_000,
  );
  if (!res.ok) {
    const err = new Error(`Receipt lookup failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body;
}

function receiptMessage(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const itemLines = items.slice(0, 30).map((item) => {
    const qty = Math.max(1, Math.min(20, Number(item?.qty) || 1));
    const name = escapeHtml(item?.name || 'Item');
    const choices = [];
    if (item?.meat?.name) choices.push(escapeHtml(item.meat.name));
    if (item?.side?.name) choices.push(escapeHtml(item.side.name));
    return `• ${qty}× ${name}${choices.length ? ` — ${choices.join(' / ')}` : ''}`;
  });

  const status = escapeHtml(order?.estado || 'recibido');
  const type = order?.tipo_entrega === 'delivery' ? '🚚 Delivery' : '📦 Pickup';
  return [
    `🦁 <b>Order #${escapeHtml(order?.id)}</b>`,
    '',
    ...(itemLines.length ? itemLines : ['Order received.']),
    '',
    `<b>Total:</b> ${money(order?.total ?? order?.subtotal)}`,
    `<b>Type:</b> ${type}`,
    `<b>Status:</b> ${status}`,
    '',
    'Customer contact details are intentionally not exposed through this receipt link.',
  ].join('\n');
}

function miniAppKeyboard() {
  return {
    inline_keyboard: [[
      { text: '🍽️ Open Anthony’s Super Kitchen', web_app: { url: SAFE_MINIAPP_URL } },
    ]],
  };
}

function telegramEndpoint(method) {
  return `https://api.telegram.org/bot${TELEGRAM_TOKEN}/${method}`;
}

async function telegramRequest(method, payload = {}, timeoutMs = 10_000, externalSignal = null) {
  if (!TELEGRAM_TOKEN) throw new Error('Telegram bot is not configured');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const abortFromExternal = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', abortFromExternal, { once: true });
  }

  try {
    const res = await fetch(telegramEndpoint(method), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body?.ok !== true) {
      const err = new Error(`Telegram API ${method} failed`);
      err.status = res.status;
      err.retryAfter = Number(body?.parameters?.retry_after || 0);
      throw err;
    }
    return body.result;
  } finally {
    clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener('abort', abortFromExternal);
  }
}

async function sendMessage(chatId, text, options = {}) {
  return telegramRequest('sendMessage', {
    chat_id: chatId,
    text,
    ...options,
  });
}

async function handleStart(msg, payload) {
  if (rateLimited(msg?.from?.id)) {
    return sendMessage(msg.chat.id, 'Too many requests. Please try again shortly.');
  }

  const orderMatch = String(payload || '').trim().match(/^ORDER_([A-F0-9]{16})$/i);
  if (orderMatch) {
    try {
      const order = await fetchReceipt(orderMatch[1].toUpperCase());
      return sendMessage(msg.chat.id, receiptMessage(order), {
        parse_mode: 'HTML',
        reply_markup: miniAppKeyboard(),
      });
    } catch (err) {
      const publicMessage = err?.status === 404
        ? 'That order reference was not found.'
        : 'The order receipt is temporarily unavailable. Your order data remains protected.';
      return sendMessage(msg.chat.id, publicMessage, { reply_markup: miniAppKeyboard() });
    }
  }

  return sendMessage(
    msg.chat.id,
    '<b>Anthony’s Super Kitchen</b> 🦁\nDominican favorites, made to order.',
    { parse_mode: 'HTML', reply_markup: miniAppKeyboard() },
  );
}

async function handleMessage(msg) {
  const text = typeof msg?.text === 'string' ? msg.text.trim() : '';
  if (!text || !msg?.chat?.id) return;

  const start = text.match(/^\/start(?:@\w+)?(?:\s+(.+))?$/i);
  if (start) {
    if (!isPrivateChat(msg)) return;
    return handleStart(msg, start[1] || '');
  }

  if (/^\/menu(?:@\w+)?$/i.test(text)) {
    if (!isPrivateChat(msg) || rateLimited(msg?.from?.id)) return;
    return sendMessage(msg.chat.id, 'Open the verified Mini App to browse the current menu and prices.', {
      reply_markup: miniAppKeyboard(),
    });
  }

  if (/^\/help(?:@\w+)?$/i.test(text)) {
    if (!isPrivateChat(msg) || rateLimited(msg?.from?.id)) return;
    return sendMessage(
      msg.chat.id,
      'Commands:\n/menu — open the current menu\n/help — show help\n\nOrders and prices are handled by the protected Super Kitchen backend.',
      { reply_markup: miniAppKeyboard() },
    );
  }

  if (/^\/status(?:@\w+)?$/i.test(text)) {
    if (rateLimited(msg?.from?.id)) return;
    if (!isConfiguredKitchenChat(msg.chat.id)) {
      return sendMessage(msg.chat.id, 'Kitchen status is available only in the protected staff dashboard.');
    }
    return sendMessage(msg.chat.id, 'Use the protected Kitchen Display System for live orders and status changes.');
  }
}

let stopping = false;
let pollAbortController = null;
let updateOffset = 0;

async function pollingLoop() {
  if (!TELEGRAM_TOKEN) {
    console.log('Bot v2 disabled: TELEGRAM_TOKEN is not configured.');
    return;
  }

  console.log('Telegram bot v2 started with native protected Mini App handoff.');
  while (!stopping) {
    pollAbortController = new AbortController();
    try {
      const updates = await telegramRequest(
        'getUpdates',
        { offset: updateOffset, timeout: 30, allowed_updates: ['message'] },
        40_000,
        pollAbortController.signal,
      );
      for (const update of Array.isArray(updates) ? updates : []) {
        if (Number.isSafeInteger(update?.update_id)) updateOffset = update.update_id + 1;
        if (update?.message) {
          try {
            await handleMessage(update.message);
          } catch (err) {
            console.error('Telegram message handler failed:', err?.name || 'Error');
          }
        }
      }
    } catch (err) {
      if (stopping || err?.name === 'AbortError') break;
      console.error('Telegram polling error:', err?.status || err?.name || 'unknown');
      const retryMs = Math.max(2_000, Math.min(30_000, Number(err?.retryAfter || 0) * 1000));
      await sleep(retryMs);
    } finally {
      pollAbortController = null;
    }
  }
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

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/health') {
    return sendJson(res, 200, {
      status: 'ok',
      service: 'superkitchen-bot-v2',
      botEnabled: Boolean(TELEGRAM_TOKEN),
      telegramTransport: 'native-node-long-polling',
      orderStorage: 'supabase-edge-function-only',
      kitchenOperations: 'authenticated-kds-only',
    });
  }
  return sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Super Kitchen bot v2 health server listening on port ${PORT}`);
  pollingLoop().catch((err) => {
    console.error('Telegram polling loop stopped:', err?.name || 'Error');
  });
});

function shutdown(signal) {
  if (stopping) return;
  stopping = true;
  console.log(`${signal}: shutting down Super Kitchen bot v2`);
  try { pollAbortController?.abort(); } catch {}
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
