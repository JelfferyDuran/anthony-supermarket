'use strict';

// Anthony's Super Kitchen — Telegram Bot v2
//
// Security posture:
// - No direct database credentials or Supabase client.
// - No duplicate order store or local-file fallback.
// - No public order-list/admin HTTP routes.
// - Customer receipt lookup uses the redacted Edge Function endpoint only.
// - Kitchen operations belong in the authenticated KDS, not Telegram commands.
// - TELEGRAM_TOKEN is server-only and must be a freshly rotated BotFather token.

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const PORT = Number(process.env.PORT || 3001);
const TELEGRAM_TOKEN = String(process.env.TELEGRAM_TOKEN || '').trim();
const MINIAPP_URL = String(
  process.env.MINIAPP_URL ||
  'https://jelfferyduran.github.io/anthony-supermarket/apps/superkitchen/dist/'
).trim();
const MINIAPP_API_URL = String(
  process.env.MINIAPP_API_URL ||
  'https://cbpdiiyzzmbavsymjysb.supabase.co/functions/v1/superkitchen'
).replace(/\/+$/, '');
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

function isPrivateChat(msg) {
  return msg?.chat?.type === 'private';
}

function isConfiguredKitchenChat(chatId) {
  return Boolean(KITCHEN_CHAT_ID) && String(chatId) === KITCHEN_CHAT_ID;
}

// Lightweight in-process flood control. Telegram itself authenticates update origin
// for long polling, but one account should not be able to hammer downstream APIs.
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

async function fetchReceipt(orderId) {
  if (!/^[A-F0-9]{16}$/i.test(orderId)) {
    const err = new Error('Invalid order reference');
    err.code = 'INVALID_ORDER_ID';
    throw err;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch(`${SAFE_API_URL}/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(`Receipt lookup failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
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

const app = express();
app.disable('x-powered-by');

app.get('/api/health', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({
    status: 'ok',
    service: 'superkitchen-bot-v2',
    botEnabled: Boolean(TELEGRAM_TOKEN),
    orderStorage: 'supabase-edge-function-only',
    kitchenOperations: 'authenticated-kds-only',
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

let bot = null;

async function handleStart(msg, match) {
  if (rateLimited(msg?.from?.id)) {
    return bot.sendMessage(msg.chat.id, 'Too many requests. Please try again shortly.');
  }

  const payload = String(match?.[1] || '').trim();
  const orderMatch = payload.match(/^ORDER_([A-F0-9]{16})$/i);

  if (orderMatch) {
    try {
      const order = await fetchReceipt(orderMatch[1].toUpperCase());
      return bot.sendMessage(msg.chat.id, receiptMessage(order), {
        parse_mode: 'HTML',
        reply_markup: miniAppKeyboard(),
      });
    } catch (err) {
      const publicMessage = err?.status === 404
        ? 'That order reference was not found.'
        : 'The order receipt is temporarily unavailable. Your order data remains protected.';
      return bot.sendMessage(msg.chat.id, publicMessage, { reply_markup: miniAppKeyboard() });
    }
  }

  return bot.sendMessage(
    msg.chat.id,
    '<b>Anthony’s Super Kitchen</b> 🦁\nDominican favorites, made to order.',
    { parse_mode: 'HTML', reply_markup: miniAppKeyboard() },
  );
}

function startBot() {
  if (!TELEGRAM_TOKEN) {
    console.log('Bot v2 disabled: TELEGRAM_TOKEN is not configured.');
    return;
  }

  bot = new TelegramBot(TELEGRAM_TOKEN, {
    polling: { params: { timeout: 30 } },
  });

  bot.onText(/^\/start(?:\s+(.+))?$/i, async (msg, match) => {
    if (!isPrivateChat(msg)) return;
    try {
      await handleStart(msg, match);
    } catch (err) {
      console.error('start handler failed:', err?.name || 'Error');
    }
  });

  bot.onText(/^\/menu$/i, async (msg) => {
    if (!isPrivateChat(msg) || rateLimited(msg?.from?.id)) return;
    await bot.sendMessage(msg.chat.id, 'Open the verified Mini App to browse the current menu and prices.', {
      reply_markup: miniAppKeyboard(),
    });
  });

  bot.onText(/^\/status$/i, async (msg) => {
    // No order data is ever returned through this command. Even in the kitchen
    // chat, operational status belongs in the authenticated KDS.
    if (!isConfiguredKitchenChat(msg.chat.id)) {
      return bot.sendMessage(msg.chat.id, 'Kitchen status is available only in the protected staff dashboard.');
    }
    return bot.sendMessage(msg.chat.id, 'Use the protected Kitchen Display System for live orders and status changes.');
  });

  bot.onText(/^\/help$/i, async (msg) => {
    if (!isPrivateChat(msg) || rateLimited(msg?.from?.id)) return;
    await bot.sendMessage(
      msg.chat.id,
      'Commands:\n/menu — open the current menu\n/help — show help\n\nOrders and prices are handled by the protected Super Kitchen backend.',
      { reply_markup: miniAppKeyboard() },
    );
  });

  bot.on('polling_error', (err) => {
    // Avoid dumping response bodies or credentials into logs.
    console.error('Telegram polling error:', err?.code || err?.name || 'unknown');
  });

  console.log('Telegram bot v2 started with protected Mini App handoff.');
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Super Kitchen bot v2 health server listening on port ${PORT}`);
  startBot();
});

function shutdown(signal) {
  console.log(`${signal}: shutting down Super Kitchen bot v2`);
  try { bot?.stopPolling?.(); } catch {}
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
