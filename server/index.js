// ðŸ¦ Anthony's Supermarket â€” Order API + Telegram Bot Server
// With Supabase integration for persistent storage

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
const kitchenAide = require('./kitchen-aide');
const { createPricingRouter } = require('./pricing-router');
const { retailFromUnitCost, unitCostFromCase } = require('./pricing-engine');

const PORT = process.env.PORT || 3001;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '';
const KITCHEN_CHAT_ID = process.env.KITCHEN_CHAT_ID || '';
const TELEGRAM_BOT_URL = process.env.TELEGRAM_BOT_URL || 'https://t.me/Anthonysuperkitchen_bot';
// Mini App order backend (apps/superkitchen/server) â€” used to resolve ORDER_<id> deep links
const MINIAPP_API_URL = process.env.MINIAPP_API_URL || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',').map(origin => origin.trim()).filter(Boolean);
const TAX_RATE = Number(process.env.TAX_RATE || 0);
const WHATSAPP_WEBHOOK = process.env.WHATSAPP_WEBHOOK || '';
const MENU_DATA_PATH = process.env.MENU_DATA_PATH || path.join(__dirname, '..', 'apps', 'menu', 'scripts', 'anthonys-seed.json');
const ORDERS_PATH = path.join(__dirname, 'data', 'orders.json');
const PRICING_TELEGRAM_CHAT_IDS = new Set(
  [process.env.HERMES_CHAT_ID, ...(process.env.PRICING_TELEGRAM_CHAT_IDS || '').split(',')]
    .map(value => String(value || '').trim())
    .filter(Boolean)
);

// Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
let supabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('âœ… Supabase connected');
} else {
  console.log('âš ï¸ Supabase not configured â€” using local file storage');
}

// â”€â”€â”€ Data Functions (Supabase + Fallback) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function loadOrders() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) {
        console.error('Supabase load error:', error.message);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error('Failed to load orders from Supabase:', e.message);
      return [];
    }
  }
  // Fallback to local file storage
  try {
    if (!fs.existsSync(ORDERS_PATH)) return [];
    return JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf8'));
  } catch { return []; }
}

async function addOrder(order) {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .insert([{
          id: order.id,
          restaurant_slug: order.restaurantSlug,
          items: order.items,
          subtotal: order.subtotal,
          tax: order.tax,
          total: order.total,
          moneda: order.moneda,
          tipo_entrega: order.tipoEntrega,
          cliente: order.cliente,
          notas: order.notas,
          estado: order.estado
        }]);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Failed to add order to Supabase:', e.message);
      // Fallback to local storage
      const orders = await loadOrders();
      orders.push(order);
      const dir = path.dirname(ORDERS_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
      return true;
    }
  }
  // Local file storage
  const orders = await loadOrders();
  orders.push(order);
  const dir = path.dirname(ORDERS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
  return true;
}

async function getOrder(orderId) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (e) {
      console.error('Failed to get order from Supabase:', e.message);
      return null;
    }
  }
  const orders = await loadOrders();
  return orders.find(o => o.id === orderId) || null;
}

async function updateOrderStatus(orderId, estado) {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ estado, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Failed to update order in Supabase:', e.message);
      return false;
    }
  }
  const orders = await loadOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.estado = estado;
  }
  const dir = path.dirname(ORDERS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
  return true;
}

// â”€â”€â”€ Data Store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let menuData = null;
function loadMenu() {
  try {
    menuData = JSON.parse(fs.readFileSync(MENU_DATA_PATH, 'utf8'));
    console.log(`âœ… Menu loaded: ${menuData.nombre}`);
  } catch (e) {
    console.error('âŒ Failed to load menu:', e.message);
    menuData = { slug: 'anthonys', nombre: 'Anthony\'s', menus: [] };
  }
}

// â”€â”€â”€ Flatten menu items for easy lookup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Express App â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const app = express();
app.use(cors({ origin: ALLOWED_ORIGINS.includes('*') ? true : ALLOWED_ORIGINS }));
app.use(express.json());
app.use('/api/pricing', createPricingRouter());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', restaurant: menuData?.nombre, items: flatItems.length, supabase: !!supabase });
});

// Get full menu
app.get('/api/config', (req, res) => res.json({ restaurant: menuData?.nombre || "Anthony's Supermarket", phone: '(201) 428-1745', telegramBotUrl: TELEGRAM_BOT_URL }));

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

  const normalizedItems = items.map(i => {
    const catalogItem = flatItems.find(item => item.id === i.id || item.nombre === i.nombre || item.nombre === i.name);
    if (!catalogItem) return null;
    const cantidad = Math.max(1, Math.min(99, Number(i.cantidad || i.quantity || 1)));
    return {
      itemId: catalogItem.id,
      nombre: catalogItem.nombre,
      precio: Number(catalogItem.precio),
      cantidad
    };
  });

  if (normalizedItems.some(item => !item)) {
    return res.status(400).json({ error: 'One or more items are no longer available' });
  }

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;

  const order = {
    id: uuidv4().slice(0, 8).toUpperCase(),
    restaurantSlug: menuData?.slug || 'anthonys',
    items: normalizedItems,
    subtotal,
    tax,
    total: subtotal + tax,
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
  await addOrder(order);

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

  console.log(`ðŸ“¦ Order #${order.id} â€” ${cliente.nombre} â€” $${order.total.toFixed(2)}`);
  res.json({ ok: true, orderId: order.id, total: order.total });
});

// Get order status
app.get('/api/orders/:id', async (req, res) => {
  const order = await getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Get all orders (admin)
app.get('/api/orders', async (req, res) => {
  const orders = await loadOrders();
  res.json(orders.slice(-50).reverse());
});

async function dispatchToN8n(order) {
  const payload = {
    orderId: order.id,
    restaurantSlug: order.restaurantSlug,
    restaurantNombre: menuData?.nombre || "Anthony's Supermarket",
    subtotal: order.subtotal,
    tax: order.tax,
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

// â”€â”€â”€ Kitchen Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function notifyKitchen(order) {
  if (!bot || !KITCHEN_CHAT_ID) return;

  const itemsList = order.items.map(i =>
    `â€¢ ${i.nombre} x${i.cantidad} â€” _$${(i.precio * i.cantidad).toFixed(2)}_`
  ).join('\n');

  const message =
    `ðŸ‘¨â€ðŸ³ *NEW ORDER #${order.id}* ðŸ¦\n\n` +
    `${itemsList}\n\n` +
    `*Total:* $${order.total.toFixed(2)}\n` +
    `*${order.tipoEntrega === 'pickup' ? 'ðŸ“¦ Pickup' : 'ðŸšš Delivery'}*\n\n` +
    `*Customer:* ${order.cliente.nome}\n` +
    (order.cliente.telefono ? `*Phone:* ${order.cliente.telefono}\n` : '') +
    (order.cliente.direccion ? `*Address:* ${order.cliente.direccion}\n` : '') +
    (order.notas ? `*Notes:* ${order.notas}\n` : '') +
    `\nðŸ• ${new Date(order.createdAt).toLocaleTimeString()}`;

  try {
    await bot.sendMessage(KITCHEN_CHAT_ID, message, { parse_mode: 'Markdown' });
    console.log(`ðŸ‘¨â€ðŸ³ Kitchen notified for order #${order.id}`);
  } catch (e) {
    console.error(`âŒ Kitchen notification failed: ${e.message}`);
  }
}

async function notifyWhatsApp(order) {
  if (!WHATSAPP_WEBHOOK) return;

  const itemsList = order.items.map(i =>
    `â€¢ ${i.nombre} x${i.cantidad}`
  ).join('\n');

  const message =
    `ðŸ¦ *Order Confirmed!*\n\n` +
    `Order #${order.id}\n` +
    `Total: $${order.total.toFixed(2)}\n` +
    `${order.tipoEntrega === 'pickup' ? 'ðŸ“¦ Pickup at store' : 'ðŸšš Delivery to your address'}\n\n` +
    `${itemsList}\n\n` +
    `ðŸ“ 288 Kearny Ave, Kearny NJ 07032\n` +
    `ðŸ“ž (201) 428-1745\n\n` +
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
    if (res.ok) console.log(`ðŸ“± WhatsApp notified for order #${order.id}`);
  } catch (e) {
    console.error(`âŒ WhatsApp notification failed: ${e.message}`);
  }
}

// â”€â”€â”€ Telegram Bot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let bot = null;
const userCarts = {};

function startBot() {
  if (!TELEGRAM_TOKEN) {
    console.log('âš¡ No TELEGRAM_TOKEN set â€” bot disabled. Set env var to enable.');
    return;
  }

  try {
    const TelegramBot = require('node-telegram-bot-api');
    bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
    console.log('ðŸ¤– Telegram bot started');

    // Welcome /start â€” also handles Mini App deep links: /start ORDER_<id>
    bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const payload = (match && match[1] ? match[1] : '').trim();

      // Mini App handoff: https://t.me/Anthonysuperkitchen_bot?start=ORDER_<id>
      if (/^ORDER_[A-Z0-9]+$/i.test(payload)) {
        const orderId = payload.split('_')[1];
        if (!MINIAPP_API_URL) {
          return bot.sendMessage(chatId,
            `âš ï¸ Mini App order lookup is not configured yet.\n\nOrder #${orderId} was received â€” we'll confirm shortly.`);
        }
        try {
          const res = await fetch(`${MINIAPP_API_URL}/api/orders/${orderId}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const order = await res.json();
          const itemsList = order.items.map(i =>
            `â€¢ ${i.name} x${i.qty} â€” _$${(i.unitPrice * i.qty).toFixed(2)}_` +
            (i.meat ? `\n   Meat: ${i.meat.name}${i.meat.priceDelta > 0 ? ` (+$${i.meat.priceDelta.toFixed(2)})` : ''}` : '') +
            (i.side ? `\n   Side: ${i.side.name}` : '')
          ).join('\n');
          return bot.sendMessage(chatId,
            `ðŸ¦ *Order #${order.id} â€” Received!* âœ…\n\n` +
            `${itemsList}\n\n` +
            `*Total:* $${order.subtotal.toFixed(2)}\n` +
            `*${order.tipoEntrega === 'delivery' ? 'ðŸšš Delivery' : 'ðŸ“¦ Pickup'}*\n` +
            (order.cliente?.telefono ? `*Phone:* ${order.cliente.telefono}\n` : '') +
            (order.notas ? `*Notes:* ${order.notas}\n` : '') +
            `\nWe'll message you here when it's ready! ðŸ½ï¸`,
            { parse_mode: 'Markdown' }
          );
        } catch (e) {
          console.error(`Mini App order lookup failed for ${orderId}:`, e.message);
          return bot.sendMessage(chatId,
            `âš ï¸ Couldn't load order #${orderId} right now. Hang tight â€” we have it and will confirm shortly.`);
        }
      }

      bot.sendMessage(chatId,
        `ðŸ¦ *Welcome to Anthony's SuperKitchen!*\n\n` +
        `ðŸ“ 288 Kearny Ave, Kearny NJ 07032\n` +
        `ðŸ“ž (201) 428-1745\n\n` +
        `*Order from:*\n` +
        `ðŸ³ /menu â€” Full Kitchen Menu\n` +
        `ðŸ” /search <item> â€” Search items\n` +
        `ðŸ›ï¸ /cart â€” View your cart\n` +
        `âœ… /checkout â€” Place your order\n\n` +
        `ðŸŒ Also order online: https://jelfferyduran.github.io/anthony-supermarket/\n` +
        `ðŸ— Or try the Mini App: ${process.env.MINIAPP_URL || 'http://localhost:3002'}\n` +
        `ðŸ• Monâ€“Sat 7AMâ€“8PM | Sun CLOSED`,
        { parse_mode: 'Markdown' }
      );
    });

    // Menu handler
    bot.onText(/\/menu/, (msg) => {
      const menu = menuData?.menus.find(m => m.slug === 'kitchen');
      if (!menu) return bot.sendMessage(msg.chat.id, 'Menu not found');

      let text = `*ðŸ³ Anthony's SuperKitchen â€” Full Menu*\n${menu.subtitulo || ''}\n\n`;
      const keyboard = [];

      menu.categorias.forEach(cat => {
        text += `*${cat.nombre}* â€” ${cat.items.length} items\n`;
        cat.items.slice(0, 3).forEach(item => {
          text += `  â€¢ ${item.nombre} â€” _$${item.precio.toFixed(2)}_\n`;
        });
        if (cat.items.length > 3) text += `  _+${cat.items.length - 3} more_\n`;
        text += '\n';
        keyboard.push([{ text: `ðŸ“‹ ${cat.nombre}`, callback_data: `cat:kitchen:${cat.nombre}` }]);
      });

      text += `\nTap a category or use /search <item> to find something.`;

      bot.sendMessage(msg.chat.id, text, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
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

        let text = `*${cat.nombre}* â€” ${cat.items.length} items\n\n`;
        const keyboard = [];

        cat.items.forEach(item => {
          text += `*${item.nombre}*\n`;
          text += `  ðŸ’° $${item.precio.toFixed(2)}\n`;
          if (item.descripcion) text += `  ðŸ“ ${item.descripcion}\n`;
          text += '\n';
          keyboard.push([{ text: `âž• ${item.nombre} â€” $${item.precio.toFixed(2)}`, callback_data: `add:${slug}:${cat.nombre}:${item.nombre}` }]);
        });

        keyboard.push([{ text: 'ðŸ”™ Back', callback_data: `back:${slug}` }]);

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

        await bot.answerCallbackQuery(query.id, { text: `âœ… Added ${item.nombre}` });
        await bot.sendMessage(chatId,
          `âœ… *${item.nombre}* added to cart! ($${item.precio.toFixed(2)})`,
          { parse_mode: 'Markdown' }
        );
      }

      if (data.startsWith('back:')) {
        bot.emit('text', { chat: { id: chatId }, text: '/menu' });
      }

      // Kitchen Aide: status buttons in the kitchen group's order threads
      if (data.startsWith('kitchen:status:')) {
        return kitchenAide.handleStatusCallback(query);
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

      let text = `ðŸ” *Results for "${match[1]}"*\n\n`;
      results.forEach(item => {
        text += `â€¢ *${item.nombre}* â€” _$${item.precio.toFixed(2)}_\n`;
        text += `  ${item.menuName} â€º ${item.categoria}\n\n`;
      });
      bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
    });

    // Cart
    bot.onText(/\/cart/, (msg) => {
      const userId = msg.from.id;
      const cart = userCarts[userId];
      if (!cart || !cart.items.length) return bot.sendMessage(msg.chat.id, 'ðŸ›ï¸ Your cart is empty. Browse /menu to add items.');

      let text = `ðŸ›ï¸ *Your Cart*\n\n`;
      cart.items.forEach((item, i) => {
        text += `${i + 1}. ${item.nombre} x${item.cantidad} = _$${(item.precio * item.cantidad).toFixed(2)}_\n`;
      });
      const total = cart.items.reduce((s, i) => s + i.precio * i.cantidad, 0);
      text += `\n*Total: $${total.toFixed(2)}*`;
      text += `\n\nâœ… /checkout â€” Place order\nðŸ—‘ï¸ /clear â€” Clear cart`;

      bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
    });

    // Clear cart
    bot.onText(/\/clear/, (msg) => {
      const userId = msg.from.id;
      if (userCarts[userId]) {
        userCarts[userId].items = [];
        userCarts[userId].slug = '';
      }
      bot.sendMessage(msg.chat.id, 'ðŸ—‘ï¸ Cart cleared!');
    });

    // Checkout
    bot.onText(/\/checkout/, async (msg) => {
      const userId = msg.from.id;
      const cart = userCarts[userId];
      if (!cart || !cart.items.length) return bot.sendMessage(msg.chat.id, 'Your cart is empty. Add items first!');

      const total = cart.items.reduce((s, i) => s + i.precio * i.cantidad, 0);

      const keyboard = [
        [{ text: 'ðŸ“¦ Pickup', callback_data: 'checkout:pickup' }],
        [{ text: 'ðŸšš Delivery', callback_data: 'checkout:delivery' }],
        [{ text: 'âŒ Cancel', callback_data: 'checkout:cancel' }]
      ];

      let text = `âœ… *Ready to Checkout*\n\n`;
      cart.items.forEach(i => { text += `â€¢ ${i.nombre} x${i.cantidad} â€” $${(i.precio * i.cantidad).toFixed(2)}\n`; });
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
            userCarts[userId] = { items: [], slug: '' };

            await bot.sendMessage(chatId,
              `ðŸŽ‰ *Order Confirmed!*\n\n` +
              `Order #${order.orderId}\n` +
              `Total: *$${order.total.toFixed(2)}*\n` +
              `Type: ${method === 'pickup' ? 'ðŸ“¦ Pickup' : 'ðŸšš Delivery'}\n\n` +
              `ðŸ“ 288 Kearny Ave, Kearny NJ 07032\n` +
              `ðŸ“ž (201) 428-1745\n\n` +
              `We'll notify you when your order is ready! ðŸ¦`,
              { parse_mode: 'Markdown' }
            );
          } else {
            await bot.sendMessage(chatId, `âŒ Order failed: ${order.error}`);
          }
        } catch (e) {
          await bot.sendMessage(chatId, `âŒ Server error: ${e.message}`);
        }

        await bot.answerCallbackQuery(query.id);
      }
    });

    // Kitchen Aide: customer DMs (relay to kitchen thread) + kitchen thread replies (relay to customer)
    bot.on('message', async (msg) => {
      // Kitchen group thread reply -> relay back to customer
      if (msg.chat && String(msg.chat.id) === String(KITCHEN_CHAT_ID || '')) {
        return kitchenAide.handleKitchenThreadReply(msg);
      }
      // Private chat (customer DM) -> relay into their latest order thread
      if (msg.chat && msg.chat.type === 'private') {
        return kitchenAide.handleCustomerDm(msg);
      }
      return undefined;
    });

    // Help
    bot.onText(/\/help/, (msg) => {
      bot.sendMessage(msg.chat.id,
        `ðŸ¦ *Anthony's SuperKitchen Bot Commands*\n\n` +
        `/start â€” Welcome\n` +
        `/menu â€” Full kitchen menu\n` +
        `/search <item> â€” Search items\n` +
        `/cart â€” View cart\n` +
        `/checkout â€” Place order\n` +
        `/clear â€” Clear cart\n` +
        `/hours â€” Store hours & contact\n` +
        `/help â€” This message` +
        (PRICING_TELEGRAM_CHAT_IDS.has(String(msg.chat.id))
          ? `\n\n*Authorized pricing:*\n/price <unit-cost>\n/caseprice <line-total> <cases> <units-per-case>`
          : ''),
        { parse_mode: 'Markdown' }
      );
    });

    // Restricted Hermes/manager calculator. These commands never change a database price.
    bot.onText(/\/price(?:@\w+)?\s+([0-9]+(?:\.[0-9]+)?)/i, async (msg, match) => {
      if (!PRICING_TELEGRAM_CHAT_IDS.has(String(msg.chat.id))) return;
      try {
        const unitCost = Number(match[1]);
        const retail = retailFromUnitCost(unitCost);
        await bot.sendMessage(msg.chat.id,
          `*Anthony Pricing*\nUnit cost: $${unitCost.toFixed(2)}\nFormula: $${unitCost.toFixed(2)} Ã— 1.70\n*Final retail: $${retail.toFixed(2)}*\n\nReview before changing a live price.`,
          { parse_mode: 'Markdown' });
      } catch (error) {
        await bot.sendMessage(msg.chat.id, `Pricing error: ${error.message}`);
      }
    });

    bot.onText(/\/caseprice(?:@\w+)?\s+([0-9]+(?:\.[0-9]+)?)\s+([0-9]+(?:\.[0-9]+)?)\s+([0-9]+(?:\.[0-9]+)?)/i, async (msg, match) => {
      if (!PRICING_TELEGRAM_CHAT_IDS.has(String(msg.chat.id))) return;
      try {
        const lineTotal = Number(match[1]);
        const caseQuantity = Number(match[2]);
        const unitsPerCase = Number(match[3]);
        const unitCost = unitCostFromCase({ lineTotal, caseQuantity, unitsPerCase });
        const retail = retailFromUnitCost(unitCost);
        await bot.sendMessage(msg.chat.id,
          `*Anthony Case Pricing*\nLine total: $${lineTotal.toFixed(2)}\nPack: ${caseQuantity} case(s) Ã— ${unitsPerCase} units\nUnit cost: $${unitCost.toFixed(2)}\n*Final retail: $${retail.toFixed(2)}*\n\nReview before changing a live price.`,
          { parse_mode: 'Markdown' });
      } catch (error) {
        await bot.sendMessage(msg.chat.id, `Pricing error: ${error.message}`);
      }
    });

    // Hours / contact
    bot.onText(/\/hours/, (msg) => {
      bot.sendMessage(msg.chat.id,
        `ðŸ“ *Anthony's SuperKitchen*\n` +
        `288 Kearny Ave, Kearny NJ 07032\n\n` +
        `ðŸ“ž (201) 428-1745\n` +
        `ðŸ’¬ WhatsApp: 732-925-5201\n\n` +
        `ðŸ• *Hours:*\n` +
        `Monâ€“Sat: 7:00 AM â€“ 8:00 PM\n` +
        `Sunday: CLOSED\n\n` +
        `ðŸŒ https://jelfferyduran.github.io/anthony-supermarket/`,
        { parse_mode: 'Markdown' }
      );
    });

    // Status / Kitchen board
    bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      const orders = await loadOrders();
      const pending = orders.filter(o => o.estado === 'recibido' || o.estado === 'preparando');

      if (!pending.length) {
        return bot.sendMessage(chatId, 'âœ… No pending orders. All clear! ðŸ¦');
      }

      let text = `ðŸ‘¨â€ðŸ³ *Kitchen â€” Order Board*\n\n`;
      pending.forEach((o, i) => {
        text += `*${i + 1}. #${o.id}* â€” ${o.estado === 'recibido' ? 'ðŸ†• New' : 'ðŸ‘¨â€ðŸ³ Prep'}\n`;
        text += `   ${o.cliente.nombre} â€” ${o.tipo_entrega === 'pickup' ? 'ðŸ“¦ Pickup' : 'ðŸšš Delivery'}\n`;
        text += `   Total: $${o.total.toFixed(2)}\n`;
        o.items.forEach(item => {
          text += `   â€¢ ${item.nombre} x${item.cantidad}\n`;
        });
        text += `   ðŸ• ${new Date(o.created_at).toLocaleString()}\n\n`;
      });

      const keyboard = pending.map(o => [
        { text: `âœ… Mark #${o.id} Ready`, callback_data: `ready:${o.id}` }
      ]);

      await bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      });
    });

    // Mark order ready
    bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id;
      const data = query.data || '';

      if (data.startsWith('ready:')) {
        const orderId = data.split(':')[1];
        await updateOrderStatus(orderId, 'listo');

        await bot.answerCallbackQuery(query.id, { text: `âœ… Order #${orderId} marked ready!` });
        await bot.sendMessage(chatId,
          `âœ… *Order #${orderId} is READY!* ðŸŽ‰\n\n` +
          `Ready for pickup or delivery.`,
          { parse_mode: 'Markdown' }
        );
      }
    });

  } catch (e) {
    console.error('âŒ Bot failed to start:', e.message);
  }

  // ðŸ§‘â€ðŸ³ Kitchen Aide: order threads in the kitchen group
  kitchenAide.startKitchenAide(bot, MINIAPP_API_URL, KITCHEN_CHAT_ID);
}

// â”€â”€â”€ Start â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.listen(PORT, () => {
  console.log(`ðŸ¦ Anthony's Server running on http://localhost:${PORT}`);
  console.log(`ðŸ“Š Menu: ${flatItems.length} items across ${menuData?.menus?.length || 0} menus`);
  if (KITCHEN_CHAT_ID) console.log(`ðŸ‘¨â€ðŸ³ Kitchen notifications enabled (chat: ${KITCHEN_CHAT_ID})`);
  if (WHATSAPP_WEBHOOK) console.log(`ðŸ“± WhatsApp notifications enabled`);
  if (N8N_WEBHOOK_URL) console.log(`ðŸ”— n8n webhook enabled`);
  startBot();
});
