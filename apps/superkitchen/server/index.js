// 🍗 Anthony's Super Kitchen — Telegram Mini App backend
//
// Endpoints:
//   POST /api/orders                          create order -> { orderId, total }
//   GET  /api/orders/:id                      order lookup (bot deep-link: ?start=ORDER_<id>)
//   GET  /api/orders                          list orders (admin)
//   POST /api/admin/products/:id/generate-image   server-side OpenAI image gen
//   GET  /api/health
//   (static) serves apps/superkitchen/dist when built
//
// Orders persist to a JSON file (server/data/orders.json). Secrets
// (OPENAI_API_KEY etc.) come from environment variables ONLY.

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.PORT || 3002;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean);
const MENU_PATH = process.env.MENU_PATH || path.join(__dirname, '..', 'src', 'data', 'menu.json');
const ORDERS_PATH = process.env.ORDERS_PATH || path.join(__dirname, 'data', 'orders.json');
const IMAGE_DIR = process.env.IMAGE_DIR || path.join(__dirname, '..', 'public', 'generated-images');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || ''; // optional bearer for image-gen
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2';
const BOT_URL = process.env.BOT_URL || 'https://t.me/SuperAnthbot';
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Supabase (optional — falls back to local JSON file storage)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
let supabase = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Mini App Supabase connected');
  } catch (e) {
    console.error('⚠️ Mini App Supabase init failed:', e.message);
    supabase = null;
  }
} else {
  console.log('⚠️ Mini App Supabase not configured — using local file storage');
}

// ─── Data helpers ────────────────────────────────────────────────────

let menuData = null;
function loadMenu() {
  try {
    menuData = JSON.parse(fs.readFileSync(MENU_PATH, 'utf8'));
    console.log(`✅ Mini App menu loaded: ${menuData.brand.name} (${menuData.products.length} products)`);
  } catch (e) {
    console.error(`❌ Failed to load menu: ${e.message}`);
    menuData = { brand: { name: "Anthony's Super Kitchen" }, meats: [], sides: [], products: [] };
  }
}
loadMenu();

function loadOrders() {
  if (supabase) {
    // Note: async — callers below treat this as fire-and-forget fallback;
    // primary reads go through Supabase via loadOrdersAsync where needed.
  }
  try {
    if (!fs.existsSync(ORDERS_PATH)) return [];
    return JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf8'));
  } catch (e) {
    console.error('Failed to read orders:', e.message);
    return [];
  }
}

async function loadOrdersAsync() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Supabase load orders failed:', e.message);
    }
  }
  return loadOrders();
}

function saveOrders(orders) {
  const dir = path.dirname(ORDERS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
}

async function addOrder(order) {
  if (supabase) {
    try {
      const { error } = await supabase.from('orders').insert([{
        id: order.id,
        restaurant_slug: order.restaurantSlug,
        items: order.items,
        subtotal: order.subtotal,
        tax: 0,
        total: order.subtotal,
        moneda: order.moneda,
        tipo_entrega: order.tipoEntrega,
        cliente: order.cliente,
        notas: order.notas,
        estado: order.estado,
        created_at: order.createdAt,
      }]);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Supabase add order failed:', e.message);
      // fall through to local storage
    }
  }
  const orders = loadOrders();
  orders.push(order);
  saveOrders(orders);
  return true;
}

async function getOrderAsync(orderId) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) return data;
    } catch (e) {
      console.error('Supabase get order failed:', e.message);
    }
  }
  return loadOrders().find(o => o.id === orderId) || null;
}

function findProduct(productId) {
  return menuData.products.find(p => p.id === productId) || null;
}

function findMeat(id) {
  return menuData.meats.find(m => m.id === id) || null;
}

function findSide(id) {
  return menuData.sides.find(s => s.id === id) || null;
}

// ─── Express ─────────────────────────────────────────────────────────

const app = express();
app.use(cors({ origin: ALLOWED_ORIGINS.includes('*') ? true : ALLOWED_ORIGINS }));
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
    restaurant: menuData?.brand?.name,
    products: menuData?.products?.length || 0,
    orders: (await loadOrdersAsync()).length,
    supabase: !!supabase,
    openai: !!OPENAI_API_KEY,
  });
});

// Create order — validated against menu data, prices computed server-side
app.post('/api/orders', async (req, res) => {
  const { items, customer, tipoEntrega, notas } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  if (!customer?.nombre || !customer.nombre.trim()) {
    return res.status(400).json({ error: 'Customer name required' });
  }

  const normalized = [];
  for (const raw of items) {
    const product = findProduct(raw.productId);
    if (!product || !product.available) {
      return res.status(400).json({ error: `Item unavailable: ${raw.name || raw.productId}` });
    }
    const qty = Math.max(1, Math.min(99, Number(raw.qty) || 1));

    let meat = null;
    if (product.allowMeatChoice) {
      if (!raw.meat?.id) return res.status(400).json({ error: `Meat required for ${product.name}` });
      meat = findMeat(raw.meat.id);
      if (!meat) return res.status(400).json({ error: `Unknown meat: ${raw.meat.id}` });
    }
    let side = null;
    if (product.allowSideChoice) {
      if (!raw.side?.id) return res.status(400).json({ error: `Side required for ${product.name}` });
      side = findSide(raw.side.id);
      if (!side) return res.status(400).json({ error: `Unknown side: ${raw.side.id}` });
    }

    const unitPrice = product.basePrice + (meat?.priceDelta || 0);
    normalized.push({
      productId: product.id,
      name: product.name,
      qty,
      unitPrice: Math.round(unitPrice * 100) / 100,
      meat: meat ? { id: meat.id, name: meat.name, priceDelta: meat.priceDelta } : null,
      side: side ? { id: side.id, name: side.name } : null,
      lineTotal: Math.round(unitPrice * qty * 100) / 100,
    });
  }

  const subtotal = Math.round(normalized.reduce((s, i) => s + i.lineTotal, 0) * 100) / 100;

  const order = {
    id: crypto.randomBytes(4).toString('hex').toUpperCase(),
    restaurantSlug: 'superkitchen',
    items: normalized,
    subtotal,
    moneda: 'USD',
    tipoEntrega: tipoEntrega === 'delivery' ? 'delivery' : 'pickup',
    cliente: { nombre: customer.nombre.trim(), telefono: (customer.telefono || '').trim() },
    notas: notas || '',
    estado: 'recibido',
    createdAt: new Date().toISOString(),
  };

  const orders = loadOrders();
  await addOrder(order);
  orders.push(order); // keep local mirror in sync for admin list fallback
  saveOrders(orders);

  console.log(`🍗 Order #${order.id} — ${order.cliente.nombre} — $${order.subtotal.toFixed(2)}`);
  res.json({ ok: true, orderId: order.id, total: order.subtotal, botUrl: BOT_URL });
});

// Get order by id (used by the bot for ?start=ORDER_<id>)
app.get('/api/orders/:id', async (req, res) => {
  const order = await getOrderAsync(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// List orders (admin)
app.get('/api/orders', async (req, res) => {
  res.json((await loadOrdersAsync()).slice(-50).reverse());
});

// Admin: generate product image (server-side OpenAI, never client-side)
app.post('/api/admin/products/:id/generate-image', async (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // Optional bearer token guard
  if (ADMIN_TOKEN) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${ADMIN_TOKEN}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  if (!OPENAI_API_KEY) {
    return res.status(503).json({ error: 'OPENAI_API_KEY not configured on the server' });
  }

  const prompt = req.body?.prompt || product.imagePrompt;
  try {
    const resp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_IMAGE_MODEL,
        prompt,
        size: '1024x1024',
        n: 1,
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`OpenAI error ${resp.status}: ${errText.slice(0, 200)}`);
    }
    const data = await resp.json();
    const b64 = data.data?.[0]?.b64_json;
    const url = data.data?.[0]?.url;

    if (!fs.existsSync(IMAGE_DIR)) fs.mkdirSync(IMAGE_DIR, { recursive: true });
    const fileName = `${product.id}.png`;
    const outputPath = path.join(IMAGE_DIR, fileName);

    if (b64) {
      fs.writeFileSync(outputPath, Buffer.from(b64, 'base64'));
    } else if (url) {
      const imgResp = await fetch(url);
      if (!imgResp.ok) throw new Error(`Failed to download generated image: ${imgResp.status}`);
      const buf = Buffer.from(await imgResp.arrayBuffer());
      fs.writeFileSync(outputPath, buf);
    } else {
      throw new Error('OpenAI response had no image data');
    }

    const publicUrl = `/generated-images/${fileName}`;
    // Cache the URL on the product so the frontend can use it without re-generating
    product.imageUrl = publicUrl;
    try {
      fs.writeFileSync(MENU_PATH, JSON.stringify(menuData, null, 2));
    } catch (e) {
      console.warn('Could not persist imageUrl to menu.json:', e.message);
    }

    console.log(`🖼️ Generated image for ${product.id} -> ${publicUrl}`);
    res.json({ productId: product.id, imageUrl: publicUrl, generatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('Image generation failed:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Serve generated images
app.use('/generated-images', express.static(IMAGE_DIR));

// Serve built frontend when present (production)
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
  console.log(`🌐 Serving Mini App build from ${DIST_DIR}`);
}

app.listen(PORT, () => {
  console.log(`🍗 Super Kitchen Mini App server on :${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/api/health`);
  console.log(`   Bot:     ${BOT_URL}`);
});
