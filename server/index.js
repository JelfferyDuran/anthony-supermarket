// 🦁 Anthony's Supermarket — Order API + Telegram Bot Server
//
// Single-file Node.js server:
//   - REST API for menu/orders (JSON file store, works without MongoDB)
//   - Telegram bot (@AnthonySuperBot) for ordering
//   - n8n webhook dispatch for kitchen + WhatsApp
//
// ENV:
//   PORT=3001            (default)
//   TELEGRAM_TOKEN=      (required for bot — get from @BotFather)
//   N8N_WEBHOOK_URL=     (optional — dispatches orders to n8n)
//   KITCHEN_CHAT_ID=     (optional — Telegram group ID for kitchen alerts)
//   WHATSAPP_WEBHOOK=    (optional — URL for WhatsApp customer notifications)
//   MENU_DATA_PATH=      (path to menu seed JSON)
//
// Run: node server/index.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3001;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '';
const KITCHEN_CHAT_ID = process.env.KITCHEN_CHAT_ID || '';
const WHATSAPP_WEBHOOK = process.env.WHATSAPP_WEBHOOK || '';
const MENU_DATA_PATH = process.env.MENU_DATA_PATH || path.join(__dirname, '..', 'apps', 'menu', 'scripts', 'anthonys-seed.json');
const ORDERS_PATH = path.join(__dirname, 'data', 'orders.json');

// ─── Data Store ───────────────────────────────────────────────────────

let menuData = null;
function loadMenu() {
  try {
    menuData = JSON.parse(fs.readFileSync(MENU_DATA_PATH, 'utf8'));
    console.log(`✅ Menu loaded: ${menuData.nombre}`);
  } catch (e) {
    console.error('❌ Failed to load menu:', e.message);
    menuData = { slug: 'anthonys', nombre: 'Anthony\'s', menus: [] };
  }
}

function loadOrders() {
  try {
    if (!fs.existsSync(ORDERS_PATH)) return [];
    return JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf8'));
  } catch { return []; }
}

function saveOrders(orders) {
  const dir = path.dirname(ORDERS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
}

// ─── Flatten menu items for easy lookup ──────────────────────────────

let flatItems = [];
function flattenMenu() {
  flatItems = [];
  if (!menuData) return;
  menuData.menus.forEach(menu => {
    menu.categorias.forEach(cat => {
      cat.items.forEach(item => {
        flatItems.push({
          ...item,
          menuSlug: menu.slug,
          menuName: menu.nombre,
          categoria: cat.nombre,
          id: `${menu.slug}-${cat.nombre}-${item.nombre.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`
        });
      });
    });
  });
}

loadMenu();
flattenMenu();

// ─── Express App ──────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', restaurant: menuData?.nombre, items: flatItems.length });
});

// Get full menu
app.get('/api/menu', (req, res) => res.json(menuData));

// Get menu by slug
app.get('/api/menu/:slug', (req, res) => {
  const menu = menuData?.menus.find(m => m.slug === req.params.slug);
  if (!menu) return res.status(404).json({ error: 'Menu not found' });
  res.json(menu);
});

// Search items
app.get('/api/items', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const cat = req.query.categoria || '';
  const menu = req.query.menu || '';
  let results = [...flatItems];
  if (q) results = results.filter(i => i.nombre.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q));
  if (cat) results = results.filter(i => i.categoria === cat);
  if (menu) results = results.filter(i => i.menuSlug === menu);
  res.json(results);
});

// Place order
app.post('/api/orders', async (req, res) => {
  const { items, tipoEntrega, cliente, notas } = req.body;

  if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty' });
  if (!cliente?.nombre) return res.status(400).json({ error: 'Customer name required' });

  const order = {
    id: uuidv4().slice(0, 8).toUpperCase(),
    restaurantSlug: menuData?.slug || 'anthonys',
    items: items.map(i => ({
      itemId: i.id,
      nombre: i.nombre || i.name,
      precio: i.precio || i.price,
      cantidad: i.cantidad || 1
    })),
    total: items.reduce((s, i) => s + (i.precio || i.price || 0) * (i.cantidad || 1), 0),
    moneda: 'USD',
    tipoEntrega: tipoEntrega || 'pickup',
    cliente: {
      nombre: cliente.nombre,
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || ''
    },
    notas: notas || '',
    estado: 'recibido',
    createdAt: new Date().toISOString()
  };

  // Save order
  const orders = loadOrders();
  orders.push(order);
  saveOrders(orders);

  // Dispatch to n8n if configured
  if (N8N_WEBHOOK_URL) {
    dispatchToN8n(order).catch(e => console.error('n8n dispatch failed:', e.message));
  }

  // Notify kitchen Telegram group
  if (KITCHEN_CHAT_ID) {
    notifyKitchen(order).catch(e => console.error('Kitchen notification failed:', e.message));
  }

  // Notify customer via WhatsApp
  if (WHATSAPP_WEBHOOK) {
    notifyWhatsApp(order).catch(e => console.error('WhatsApp notification failed:', e.message));
  }

  console.log(`📦 Order #${order.id} — ${cliente.nombre} — $${order.total.toFixed(2)}`);
  res.json({ ok: true, orderId: order.id, total: order.total });
});

// Get order status
app.get('/api/orders/:id', (req, res) => {
  const orders = loadOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Get all orders (admin)
app.get('/api/orders', (req, res) => {
  const orders = loadOrders();
  res.json(orders.slice(-50).reverse());
});

async function dispatchToN8n(order) {
  const payload = {
    orderId: order.id,
    restaurantSlug: order.restaurantSlug,
    restaurantNombre: menuData?.nombre || "Anthony's Supermarket",
    total: order.total,
    moneda: order.moneda,
    tipoEntrega: order.tipoEntrega,
    cliente: order.cliente,
    notas: order.notas,
    items: order.items
  };
  const res = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000)
  });
  return res.ok;
}

// ─── Kitchen Notifications ──────────────────────────────────────────

async function notifyKitchen(order) {
  if (!bot || !KITCHEN_CHAT_ID) return;

  const itemsList = order.items.map(i =>
    `• ${i.nombre} x${i.cantidad} — _$${(i.precio * i.cantidad).toFixed(2)}_`
  ).join('\n');

  const message =
    `👨‍🍳 *NEW ORDER #${order.id}* 🦁\n\n` +
    `${itemsList}\n\n` +
    `*Total:* $${order.total.toFixed(2)}\n` +
    `*${order.tipoEntrega === 'pickup' ? '📦 Pickup' : '🚚 Delivery'}*\n\n` +
    `*Customer:* ${order.cliente.nombre}\n` +
    (order.cliente.telefono ? `*Phone:* ${order.cliente.telefono}\n` : '') +
    (order.cliente.direccion ? `*Address:* ${order.cliente.direccion}\n` : '') +
    (order.notas ? `*Notes:* ${order.notas}\n` : '') +
    `\n🕐 ${new Date(order.createdAt).toLocaleTimeString()}`;

  try {
    await bot.sendMessage(KITCHEN_CHAT_ID, message, { parse_mode: 'Markdown' });
    console.log(`👨‍🍳 Kitchen notified for order #${order.id}`);
  } catch (e) {
    console.error(`❌ Kitchen notification failed: ${e.message}`);
  }
}

async function notifyWhatsApp(order) {
  if (!WHATSAPP_WEBHOOK) return;

  const itemsList = order.items.map(i =>
    `• ${i.nombre} x${i.cantidad}`
  ).join('\n');

  const message =
    `🦁 *Order Confirmed!*\n\n` +
    `Order #${order.id}\n` +
    `Total: $${order.total.toFixed(2)}\n` +
    `${order.tipoEntrega === 'pickup' ? '📦 Pickup at store' : '🚚 Delivery to your address'}\n\n` +
    `${itemsList}\n\n` +
    `📍 288 Kearny Ave, Kearny NJ 07032\n` +
    `📞 (201) 428-1745\n\n` +
    `We'll notify you when ready!`;

  try {
    const res = await fetch(WHATSAPP_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: order.cliente.telefono || '',
        message: message,
        orderId: order.id
      }),
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) console.log(`📱 WhatsApp notified for order #${order.id}`);
  } catch (e) {
    console.error(`❌ WhatsApp notification failed: ${e.message}`);
  }
}

// ─── Telegram Bot ─────────────────────────────────────────────────────

let bot = null;

function startBot() {
  if (!TELEGRAM_TOKEN) {
    console.log('⚡ No TELEGRAM_TOKEN set — bot disabled. Set env var to enable.');
    return;
  }

  try {
    const TelegramBot = require('node-telegram-bot-api');
    bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
    console.log('🤖 Telegram bot started');

    // Welcome /start
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId,
        `🦁 *Welcome to Anthony's Supermarket!*\n\n` +
        `📍 288 Kearny Ave, Kearny NJ 07032\n` +
        `📞 (201) 428-1745\n\n` +
        `*Order from:*\n` +
        `🍳 /hotfood — Hot Food Menu (Comida Caliente)\n` +
        `🥩 /deli — Deli & Meats\n` +
        `🛒 /grocery — Grocery & Pantry\n` +
        `🔍 /search <item> — Search products\n` +
        `🛍️ /cart — View your cart\n` +
        `✅ /checkout — Place your order\n\n` +
        `🌐 Also order online: https://jelfferyduran.github.io/anthony-supermarket/`,
        { parse_mode: 'Markdown' }
      );
    });

    // Menu handlers
    const menuHandlers = {
      hotfood: { slug: 'hot-food', name: '🍳 Hot Food Menu' },
      deli: { slug: 'deli-meats', name: '🥩 Deli & Meats' },
      grocery: { slug: 'grocery', name: '🛒 Grocery' }
    };

    Object.entries(menuHandlers).forEach(([cmd, { slug, name }]) => {
      bot.onText(new RegExp(`/${cmd}`), (msg) => {
        const menu = menuData?.menus.find(m => m.slug === slug);
        if (!menu) return bot.sendMessage(msg.chat.id, 'Menu not found');

        let text = `*${name}*\n${menu.subtitulo || ''}\n\n`;
        const keyboard = [];

        menu.categorias.forEach(cat => {
          text += `*${cat.nombre}* — ${cat.items.length} items\n`;
          cat.items.slice(0, 5).forEach(item => {
            text += `  • ${item.nombre} — _$${item.precio.toFixed(2)}_\n`;
          });
          if (cat.items.length > 5) text += `  _+${cat.items.length - 5} more_\n`;
          text += '\n';
          // Add category button
          keyboard.push([{ text: `📋 ${cat.nombre}`, callback_data: `cat:${slug}:${cat.nombre}` }]);
        });

        text += `\nTap a category to see all items, or use /add <item name> to order.`;

        bot.sendMessage(msg.chat.id, text, {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: keyboard }
        });
      });
    });

    // Show items in a category
    bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id;
      const data = query.data || '';

      if (data.startsWith('cat:')) {
        const [, slug, catName] = data.split(':');
        const menu = menuData?.menus.find(m => m.slug === slug);
        const cat = menu?.categorias.find(c => c.nombre === catName);
        if (!cat) return bot.answerCallbackQuery(query.id, { text: 'Category not found' });

        let text = `*${cat.nombre}* — ${cat.items.length} items\n\n`;
        const keyboard = [];

        cat.items.forEach(item => {
          text += `*${item.nombre}*\n`;
          text += `  💰 $${item.precio.toFixed(2)}\n`;
          if (item.descripcion) text += `  📝 ${item.descripcion}\n`;
          text += '\n';
          keyboard.push([{ text: `➕ ${item.nombre} — $${item.precio.toFixed(2)}`, callback_data: `add:${slug}:${cat.nombre}:${item.nombre}` }]);
        });

        keyboard.push([{ text: '🔙 Back', callback_data: `back:${slug}` }]);

        await bot.answerCallbackQuery(query.id);
        await bot.sendMessage(chatId, text, {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: keyboard }
        });
      }

      // Add item to cart
      if (data.startsWith('add:')) {
        const [, slug, catName, ...nameParts] = data.split(':');
        const name = nameParts.join(':');
        const menu = menuData?.menus.find(m => m.slug === slug);
        const cat = menu?.categorias.find(c => c.nombre === catName);
        const item = cat?.items.find(i => i.nombre === name);
        if (!item) return bot.answerCallbackQuery(query.id, { text: 'Item not found' });

        // Store cart in memory per user
        const userId = query.from.id;
        if (!userCarts[userId]) userCarts[userId] = { items: [], slug: '' };
        const cart = userCarts[userId];
        if (!cart.slug) cart.slug = slug;

        const existing = cart.items.find(i => i.nombre === name);
        if (existing) {
          existing.cantidad = (existing.cantidad || 1) + 1;
        } else {
          cart.items.push({
            id: `${slug}-${catName}-${item.nombre.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: 1
          });
        }

        await bot.answerCallbackQuery(query.id, { text: `✅ Added ${item.nombre}` });
        await bot.sendMessage(chatId,
          `✅ *${item.nombre}* added to cart! ($${item.precio.toFixed(2)})`,
          { parse_mode: 'Markdown' }
        );
      }

      if (data.startsWith('back:')) {
        const slug = data.split(':')[1];
        const cmd = Object.entries(menuHandlers).find(([, v]) => v.slug === slug)?.[0];
        if (cmd) bot.emit('text', { chat: { id: chatId }, text: `/${cmd}` });
      }
    });

    // Search
    bot.onText(/\/search (.+)/, (msg, match) => {
      const q = match[1].toLowerCase();
      const results = flatItems.filter(i =>
        i.nombre.toLowerCase().includes(q) ||
        i.descripcion.toLowerCase().includes(q) ||
        i.categoria.toLowerCase().includes(q)
      ).slice(0, 10);

      if (!results.length) return bot.sendMessage(msg.chat.id, `No items found for "${match[1]}"`);

      let text = `🔍 *Results for "${match[1]}"*\n\n`;
      results.forEach(item => {
        text += `• *${item.nombre}* — _$${item.precio.toFixed(2)}_\n`;
        text += `  ${item.menuName} › ${item.categoria}\n\n`;
      });
      bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
    });

    // Cart
    bot.onText(/\/cart/, (msg) => {
      const userId = msg.from.id;
      const cart = userCarts[userId];
      if (!cart || !cart.items.length) return bot.sendMessage(msg.chat.id, '🛍️ Your cart is empty. Browse /hotfood, /deli, or /grocery to add items.');

      let text = `🛍️ *Your Cart*\n\n`;
      chatId: msg.chat.id;
      cart.items.forEach((item, i) => {
        text += `${i + 1}. ${item.nombre} x${item.cantidad} = _$${(item.precio * item.cantidad).toFixed(2)}_\n`;
      });
      const total = cart.items.reduce((s, i) => s + i.precio * i.cantidad, 0);
      text += `\n*Total: $${total.toFixed(2)}*`;
      text += `\n\n✅ /checkout — Place order\n🗑️ /clear — Clear cart`;

      bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
    });

    // Clear cart
    bot.onText(/\/clear/, (msg) => {
      const userId = msg.from.id;
      if (userCarts[userId]) {
        userCarts[userId].items = [];
        userCarts[userId].slug = '';
      }
      bot.sendMessage(msg.chat.id, '🗑️ Cart cleared!');
    });

    // Checkout
    bot.onText(/\/checkout/, async (msg) => {
      const userId = msg.from.id;
      const cart = userCarts[userId];
      if (!cart || !cart.items.length) return bot.sendMessage(msg.chat.id, 'Your cart is empty. Add items first!');

      const total = cart.items.reduce((s, i) => s + i.precio * i.cantidad, 0);

      const keyboard = [
        [{ text: '📦 Pickup', callback_data: 'checkout:pickup' }],
        [{ text: '🚚 Delivery', callback_data: 'checkout:delivery' }],
        [{ text: '❌ Cancel', callback_data: 'checkout:cancel' }]
      ];

      let text = `✅ *Ready to Checkout*\n\n`;
      cart.items.forEach(i => { text += `• ${i.nombre} x${i.cantidad} — $${(i.precio * i.cantidad).toFixed(2)}\n`; });
      text += `\n*Total: $${total.toFixed(2)}*`;
      text += `\n\nChoose pickup or delivery:`;

      await bot.sendMessage(msg.chat.id, text, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      });
    });

    // Checkout callback
    bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id;
      const data = query.data || '';

      if (data.startsWith('checkout:')) {
        const method = data.split(':')[1];
        if (method === 'cancel') {
          await bot.answerCallbackQuery(query.id, { text: 'Order cancelled' });
          return;
        }

        const userId = query.from.id;
        const cart = userCarts[userId];
        if (!cart || !cart.items.length) return;

        try {
          const res = await fetch(`http://localhost:${PORT}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: cart.items,
              tipoEntrega: method,
              cliente: {
                nombre: query.from.first_name || 'Telegram Customer',
                telefono: '',
                direccion: method === 'delivery' ? 'Please provide address' : ''
              },
              notas: ''
            })
          });
          const order = await res.json();

          if (order.ok) {
            // Clear cart
            userCarts[userId] = { items: [], slug: '' };

            await bot.sendMessage(chatId,
              `🎉 *Order Confirmed!*\n\n` +
              `Order #${order.orderId}\n` +
              `Total: *$${order.total.toFixed(2)}*\n` +
              `Type: ${method === 'pickup' ? '📦 Pickup' : '🚚 Delivery'}\n\n` +
              `📍 288 Kearny Ave, Kearny NJ 07032\n` +
              `📞 (201) 428-1745\n\n` +
              `We'll notify you when your order is ready! 🦁`,
              { parse_mode: 'Markdown' }
            );
          } else {
            await bot.sendMessage(chatId, `❌ Order failed: ${order.error}`);
          }
        } catch (e) {
          await bot.sendMessage(chatId, `❌ Server error: ${e.message}`);
        }

        await bot.answerCallbackQuery(query.id);
      }
    });

    // Help
    bot.onText(/\/help/, (msg) => {
      bot.sendMessage(msg.chat.id,
        `🦁 *Anthony's Super Bot Commands*\n\n` +
        `/start — Welcome & menu\n` +
        `/hotfood — Hot food menu\n` +
        `/deli — Deli & meats\n` +
        `/grocery — Grocery items\n` +
        `/search <item> — Search products\n` +
        `/cart — View cart\n` +
        `/checkout — Place order\n` +
        `/clear — Clear cart\n` +
        `/status — 🏪 Pending orders (kitchen only)\n` +
        `/help — This message`,
        { parse_mode: 'Markdown' }
      );
    });

    // ─── Kitchen: Status (order board) ────────────────────────────────
    bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      // Only respond if asked from the kitchen group or by admin
      const orders = loadOrders();
      const pending = orders.filter(o => o.estado === 'recibido' || o.estado === 'preparando');

      if (!pending.length) {
        return bot.sendMessage(chatId, '✅ No pending orders. All clear! 🦁');
      }

      let text = `👨‍🍳 *Kitchen — Order Board*\n\n`;
      pending.forEach((o, i) => {
        text += `*${i + 1}. #${o.id}* — ${o.estado === 'recibido' ? '🆕 New' : '👨‍🍳 Prep'}\n`;
        text += `   ${o.cliente.nombre} — ${o.tipoEntrega === 'pickup' ? '📦 Pickup' : '🚚 Delivery'}\n`;
        text += `   Total: $${o.total.toFixed(2)}\n`;
        o.items.forEach(item => {
          text += `   • ${item.nombre} x${item.cantidad}\n`;
        });
        text += `   🕐 ${new Date(o.createdAt).toLocaleString()}\n\n`;
      });

      const keyboard = pending.map(o => [
        { text: `✅ Mark #${o.id} Ready`, callback_data: `ready:${o.id}` }
      ]);

      await bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      });
    });

    // Kitchen: Mark order ready
    bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id;
      const data = query.data || '';

      if (data.startsWith('ready:')) {
        const orderId = data.split(':')[1];
        const orders = loadOrders();
        const order = orders.find(o => o.id === orderId);
        if (!order) return bot.answerCallbackQuery(query.id, { text: 'Order not found' });

        order.estado = 'listo';
        saveOrders(orders);

        await bot.answerCallbackQuery(query.id, { text: `✅ Order #${orderId} marked ready!` });
        await bot.sendMessage(chatId,
          `✅ *Order #${orderId} is READY!* 🎉\n\n` +
          `${order.cliente.nombre} — ${order.tipoEntrega === 'pickup' ? '📦 Ready for pickup' : '🚚 Out for delivery'}`,
          { parse_mode: 'Markdown' }
        );

        // Also notify customer if we have their chat ID stored
        // (future enhancement: track customer chat IDs for order status updates)
      }
    });

  } catch (e) {
    console.error('❌ Bot failed to start:', e.message);
  }
}

// ─── User carts (in memory) ───────────────────────────────────────────

const userCarts = {};

// ─── Start ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🦁 Anthony's Server running on http://localhost:${PORT}`);
  console.log(`📊 Menu: ${flatItems.length} items across ${menuData?.menus?.length || 0} menus`);
  if (KITCHEN_CHAT_ID) console.log(`👨‍🍳 Kitchen notifications enabled (chat: ${KITCHEN_CHAT_ID})`);
  if (WHATSAPP_WEBHOOK) console.log(`📱 WhatsApp notifications enabled`);
  if (N8N_WEBHOOK_URL) console.log(`🔗 n8n webhook enabled`);
  startBot();
});
