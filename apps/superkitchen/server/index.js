// Anthony's Super Kitchen - Mini App static/admin server
//
// Production order creation, receipt lookup, staff board reads, and status
// transitions are owned by the Supabase Edge Function. This server must not
// become a legacy public order-list or unaudited mutation path.

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3002;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean);
const MENU_PATH = process.env.MENU_PATH || path.join(__dirname, '..', 'src', 'data', 'menu.json');
const IMAGE_DIR = process.env.IMAGE_DIR || path.join(__dirname, '..', 'public', 'generated-images');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const EDGE_API_URL = process.env.EDGE_API_URL || 'https://cbpdiiyzzmbavsymjysb.supabase.co/functions/v1/superkitchen';

let menuData = null;
function loadMenu() {
  try {
    menuData = JSON.parse(fs.readFileSync(MENU_PATH, 'utf8'));
    console.log(`Mini App menu loaded: ${menuData.brand.name} (${menuData.products.length} products)`);
  } catch (e) {
    console.error(`Failed to load menu: ${e.message}`);
    menuData = { brand: { name: "Anthony's Super Kitchen" }, products: [] };
  }
}
loadMenu();

const app = express();
app.use(cors({ origin: ALLOWED_ORIGINS.includes('*') ? true : ALLOWED_ORIGINS }));
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'superkitchen-mini-app-static',
    restaurant: menuData?.brand?.name,
    products: menuData?.products?.length || 0,
    orderApi: EDGE_API_URL,
    orderStorage: 'supabase-edge-function-only',
    publicOrderRoutes: false,
    openai: Boolean(OPENAI_API_KEY),
  });
});

function orderApiRemoved(req, res) {
  res.status(410).json({
    error: 'Order API moved to the protected Supabase Edge Function',
    orderApi: EDGE_API_URL,
  });
}

app.post('/api/orders', orderApiRemoved);
app.get('/api/orders', orderApiRemoved);
app.get('/api/orders/:id', orderApiRemoved);
app.patch('/api/orders/:id/status', orderApiRemoved);
app.post('/api/orders/:id/status', orderApiRemoved);

app.post('/api/admin/products/:id/generate-image', async (req, res) => {
  const product = menuData.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (!ADMIN_TOKEN) return res.status(503).json({ error: 'Admin image generation is not configured' });
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${ADMIN_TOKEN}`) return res.status(401).json({ error: 'Unauthorized' });
  if (!OPENAI_API_KEY) return res.status(503).json({ error: 'OPENAI_API_KEY not configured on the server' });

  const prompt = req.body?.prompt || product.imagePrompt;
  try {
    const resp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: OPENAI_IMAGE_MODEL, prompt, size: '1024x1024', n: 1 }),
    });
    if (!resp.ok) throw new Error(`OpenAI error ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
    const data = await resp.json();
    const b64 = data.data?.[0]?.b64_json;
    const url = data.data?.[0]?.url;
    if (!fs.existsSync(IMAGE_DIR)) fs.mkdirSync(IMAGE_DIR, { recursive: true });
    const fileName = `${product.id}.png`;
    const outputPath = path.join(IMAGE_DIR, fileName);
    if (b64) fs.writeFileSync(outputPath, Buffer.from(b64, 'base64'));
    else if (url) {
      const imgResp = await fetch(url);
      if (!imgResp.ok) throw new Error(`Failed to download generated image: ${imgResp.status}`);
      fs.writeFileSync(outputPath, Buffer.from(await imgResp.arrayBuffer()));
    } else {
      throw new Error('OpenAI response had no image data');
    }
    res.json({ productId: product.id, imageUrl: `/generated-images/${fileName}`, generatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('Image generation failed:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.use('/generated-images', express.static(IMAGE_DIR));

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
  console.log(`Serving Mini App build from ${DIST_DIR}`);
}

app.listen(PORT, () => {
  console.log(`Super Kitchen Mini App static/admin server on :${PORT}`);
});
