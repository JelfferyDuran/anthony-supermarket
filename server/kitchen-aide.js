// 🧑‍🍳 Kitchen Aide — order threads for Anthony's Super Kitchen
//
// Polls the Mini App public API for new orders (estado=recibido), creates a
// Telegram forum topic (thread) per order in the kitchen group, posts the
// ticket with status buttons, and relays comments between the customer's DM
// and the kitchen thread.
//
// Thread map is persisted to server/data/order_threads.json so restarts don't
// duplicate tickets.

const path = require('path');
const fs = require('fs');

const THREAD_MAP_PATH = process.env.ORDER_THREADS_PATH || path.join(__dirname, 'data', 'order_threads.json');
const POLL_INTERVAL_MS = Number(process.env.KITCHEN_POLL_INTERVAL_MS || 15000);

// Staff credentials for the hardened API (Supabase Auth user with role=kitchen)
const STAFF_EMAIL = process.env.KITCHEN_STAFF_EMAIL || '';
const STAFF_PASSWORD = process.env.KITCHEN_STAFF_PASSWORD || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

let bot = null;
let miniAppApiUrl = '';
let kitchenChatId = '';
let staffToken = null;
let staffTokenExpiresAt = 0;

const STATUS_EMOJI = {
  recibido: '🆕 Received',
  preparando: '👨‍🍳 Preparing',
  listo: '✅ Ready',
  completado: '✔️ Completed',
  cancelado: '❌ Cancelled',
};

// Valid transitions enforced by the RPC (staff_update_order_status)
const VALID_TRANSITIONS = {
  recibido: ['preparando', 'cancelado'],
  preparando: ['listo', 'cancelado'],
  listo: ['completado', 'cancelado'],
  completado: [],
  cancelado: [],
};

async function ensureStaffToken() {
  if (staffToken && Date.now() < staffTokenExpiresAt - 60000) return staffToken;
  if (!STAFF_EMAIL || !STAFF_PASSWORD || !SUPABASE_URL) {
    console.error('🧑‍🍳 Staff credentials missing — set KITCHEN_STAFF_EMAIL/PASSWORD + SUPABASE_URL');
    return null;
  }
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email: STAFF_EMAIL, password: STAFF_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Staff login failed HTTP ${res.status}`);
  const data = await res.json();
  staffToken = data.access_token;
  staffTokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return staffToken;
}

async function apiFetch(path, options = {}) {
  const token = await ensureStaffToken();
  const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
  if (options.body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${miniAppApiUrl}${path}`, { ...options, headers });
  if (res.status === 401) {
    // Token may have expired — force refresh once
    staffToken = null;
    const token2 = await ensureStaffToken();
    const res2 = await fetch(`${miniAppApiUrl}${path}`, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${token2}` },
    });
    return res2;
  }
  return res;
}

function loadThreadMap() {
  try {
    if (!fs.existsSync(THREAD_MAP_PATH)) return {};
    return JSON.parse(fs.readFileSync(THREAD_MAP_PATH, 'utf8'));
  } catch (e) {
    console.error('Failed to read order_threads:', e.message);
    return {};
  }
}

function saveThreadMap(map) {
  const dir = path.dirname(THREAD_MAP_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(THREAD_MAP_PATH, JSON.stringify(map, null, 2));
}

function buildTicketText(order) {
  const items = order.items.map(i => {
    let line = `• ${i.name} x${i.qty} — $${(i.unitPrice * i.qty).toFixed(2)}`;
    if (i.meat) line += `\n   🥩 Meat: ${i.meat.name}${i.meat.priceDelta > 0 ? ` (+$${i.meat.priceDelta.toFixed(2)})` : ''}`;
    if (i.side) line += `\n   🍟 Side: ${i.side.name}`;
    return line;
  }).join('\n');

  const customer = order.cliente || {};
  return (
    `🦁 *NEW ORDER #${order.id}*\n\n` +
    `${items}\n\n` +
    `*Total:* $${order.subtotal.toFixed(2)}\n` +
    `*${order.tipo_entrega === 'delivery' ? '🚚 Delivery' : '📦 Pickup'}*\n` +
    `*Customer:* ${customer.nombre || '?'}\n` +
    (customer.telefono ? `*Phone:* ${customer.telefono}\n` : '') +
    (customer.telegram_id ? `*TG:* ${customer.telegram_id}\n` : '') +
    (order.notas ? `*Notes:* ${order.notas}\n` : '') +
    `\n🕐 ${new Date(order.created_at).toLocaleTimeString()}`
  );
}

function statusKeyboard(orderId, current) {
  const next = VALID_TRANSITIONS[current] || [];
  const mk = (s) => ({
    text: `${STATUS_EMOJI[s] || s}${current === s ? ' ✓' : ''}`,
    callback_data: `kitchen:status:${orderId}:${s}`,
  });
  const buttons = [];
  if (next.includes('preparando')) buttons.push(mk('preparando'));
  if (next.includes('listo')) buttons.push(mk('listo'));
  if (next.includes('completado')) buttons.push(mk('completado'));
  if (next.includes('cancelado')) buttons.push(mk('cancelado'));
  // Group into rows of 2
  const keyboard = [];
  for (let i = 0; i < buttons.length; i += 2) keyboard.push(buttons.slice(i, i + 2));
  return { inline_keyboard: keyboard };
}

async function handleNewOrder(order) {
  if (!bot || !kitchenChatId) return false;
  const threadMap = loadThreadMap();
  if (threadMap[order.id]) return true; // already posted

  try {
    // Create a forum topic (thread) for this order
    const topic = await bot.createForumTopic(kitchenChatId, `Order #${order.id} — ${(order.cliente?.nombre || '?').slice(0, 20)}`);
    const messageThreadId = topic.message_thread_id;

    // Post the ticket into the thread with status buttons
    await bot.sendMessage(kitchenChatId, buildTicketText(order), {
      parse_mode: 'Markdown',
      message_thread_id: messageThreadId,
      reply_markup: statusKeyboard(order.id, order.estado),
    });

    // Remember it
    threadMap[order.id] = {
      message_thread_id: messageThreadId,
      cliente_nombre: order.cliente?.nombre || '',
      telegram_id: order.telegram_user_id || order.cliente?.telegram_id || null,
      estado: order.estado,
      created_at: order.created_at,
    };
    saveThreadMap(threadMap);

    console.log(`🧑‍🍳 Kitchen thread created for order #${order.id} (topic ${messageThreadId})`);
    return true;
  } catch (e) {
    console.error(`❌ Failed to create kitchen thread for #${order.id}:`, e.message);
    return false;
  }
}

// Poll the public API for new orders
async function pollForOrders() {
  if (!bot || !miniAppApiUrl || !kitchenChatId) return;
  try {
    const res = await apiFetch('/api/orders');
    if (!res.ok) return;
    const orders = await res.json();
    // Newest first from API; iterate reversed so threads appear in order
    for (const order of [...orders].reverse()) {
      if (order.estado === 'recibido') {
        await handleNewOrder(order);
      }
    }
  } catch (e) {
    console.error('Kitchen poll error:', e.message);
  }
}

// Status button pressed in the kitchen thread
async function handleStatusCallback(query) {
  const [, , orderId, estado] = (query.data || '').split(':');
  if (!orderId || !estado) return;

  // Enforce valid transitions client-side too (RPC enforces server-side)
  const threadMap = loadThreadMap();
  const current = threadMap[orderId]?.estado || 'recibido';
  if (!(VALID_TRANSITIONS[current] || []).includes(estado)) {
    await bot.answerCallbackQuery(query.id, { text: `⚠️ Can't go ${current} → ${estado}` });
    return;
  }

  try {
    const res = await apiFetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: estado }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    // Update the thread map
    if (threadMap[orderId]) threadMap[orderId].estado = estado;
    saveThreadMap(threadMap);

    await bot.answerCallbackQuery(query.id, { text: `Order #${orderId}: ${STATUS_EMOJI[estado] || estado}` });

    // Update the ticket message buttons
    const msg = query.message;
    await bot.editMessageReplyMarkup(statusKeyboard(orderId, estado), {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    });

    // Notify the customer in their DM
    const tgId = threadMap[orderId]?.telegram_id;
    if (tgId && estado !== 'recibido') {
      const msgText =
        estado === 'preparando' ? `👨‍🍳 *Order #${orderId} is being prepared!* Hang tight — almost there. 🍳` :
        estado === 'listo' ? `✅ *Order #${orderId} is READY!* 🎉\n\n📍 Pickup at 288 Kearny Ave, Kearny NJ — show your order number (#${orderId}) at the register.` :
        estado === 'completado' ? `✔️ Order #${orderId} completed. Thanks for ordering! 🙏` :
        estado === 'cancelado' ? `❌ Order #${orderId} was cancelled. Contact us if that's a mistake.` : '';
      if (msgText) await bot.sendMessage(tgId, msgText, { parse_mode: 'Markdown' });
    }

    console.log(`🧑‍🍳 Order #${orderId} -> ${estado} (by ${query.from?.username || query.from?.first_name || '?'})`);
  } catch (e) {
    console.error(`Status update failed for ${orderId}:`, e.message);
    await bot.answerCallbackQuery(query.id, { text: '⚠️ Update failed' });
  }
}

function orderReadyPickupLine(orderId, threadMap) {
  const entry = threadMap[orderId] || {};
  if (entry.estado) { /* state already persisted */ }
  return `📍 Pickup at 288 Kearny Ave, Kearny NJ — show your order number (#${orderId}) at the register.`;
}

// Customer DMs the bot -> relay into their latest order's kitchen thread
async function handleCustomerDm(msg) {
  if (!bot || !kitchenChatId) return false;
  const userId = msg.from?.id;
  const text = msg.text;
  if (!userId || !text || text.startsWith('/')) return false;

  // Find this customer's most recent order with a thread
  const threadMap = loadThreadMap();
  const entry = Object.values(threadMap)
    .filter(t => String(t.telegram_id) === String(userId))
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))[0];
  if (!entry) return false;

  const name = msg.from.first_name || msg.from.username || `TG${userId}`;
  try {
    await bot.sendMessage(kitchenChatId, `💬 *${name} (customer):* ${text}`, {
      parse_mode: 'Markdown',
      message_thread_id: entry.message_thread_id,
    });
    await bot.sendMessage(userId, `📨 Your message about order was sent to the kitchen. We'll reply here!`);
    return true;
  } catch (e) {
    console.error('Relay to kitchen failed:', e.message);
    return false;
  }
}

// Kitchen replies in a thread -> relay back to the customer DM
async function handleKitchenThreadReply(msg) {
  if (!bot || !kitchenChatId) return false;
  if (String(msg.chat.id) !== String(kitchenChatId)) return false;
  if (!msg.message_thread_id || !msg.text || msg.text.startsWith('/')) return false;

  const threadMap = loadThreadMap();
  const entry = Object.values(threadMap).find(t => t.message_thread_id === msg.message_thread_id);
  if (!entry || !entry.telegram_id) return false;

  const kitchenName = msg.from?.first_name || msg.from?.username || 'Kitchen';
  try {
    await bot.sendMessage(entry.telegram_id,
      `🧑‍🍳 *Kitchen reply on order #${orderIdFromThread(msg, threadMap)}:*\n${msg.text}`,
      { parse_mode: 'Markdown' }
    );
    return true;
  } catch (e) {
    console.error('Relay to customer failed:', e.message);
    return false;
  }
}

function orderIdFromThread(msg, threadMap) {
  const entry = Object.values(threadMap).find(t => t.message_thread_id === msg.message_thread_id);
  // The map keys are order ids; find the key for this thread
  return Object.keys(threadMap).find(k => threadMap[k].message_thread_id === msg.message_thread_id) || '';
}

function startKitchenAide(instance, apiUrl, chatId) {
  bot = instance;
  miniAppApiUrl = apiUrl;
  kitchenChatId = chatId;
  if (!bot || !apiUrl || !chatId) {
    console.log('🧑‍🍳 Kitchen Aide disabled (needs bot + MINIAPP_API_URL + KITCHEN_CHAT_ID)');
    return;
  }
  console.log(`🧑‍🍳 Kitchen Aide active — polling ${apiUrl} every ${POLL_INTERVAL_MS / 1000}s for the kitchen group`);
  // Initial poll after a short delay, then interval
  setTimeout(pollForOrders, 3000);
  setInterval(pollForOrders, POLL_INTERVAL_MS);
}

module.exports = { startKitchenAide, handleStatusCallback, handleCustomerDm, handleKitchenThreadReply };
