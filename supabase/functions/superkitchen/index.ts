// Anthony's Super Kitchen — Supabase Edge Function
// Public HTTPS API for the Mini App (replaces the Express backend on :3002)
//
// Endpoints:
//   GET  /                      health + config
//   POST /orders                create order -> { orderId, total }
//   GET  /orders/:id            order lookup (bot deep-link: ?start=ORDER_<id>)
//   GET  /orders                list orders (admin)
//
// Runs on Deno (Supabase Edge Functions). Uses the same `orders` table.
// CORS enabled so the Mini App frontend (Supabase Storage) can call it.

import { createClient } from "jsr:@supabase/supabase-js@2";

// SUPABASE_URL + SUPABASE_ANON_KEY are auto-injected by the platform.
// RLS on `orders` allows public insert/select, so anon is sufficient.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const BOT_URL = Deno.env.get("BOT_URL") || "https://t.me/Anthonysuperkitchen_bot";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MENU = {
  brand: {
    name: "Anthony's Super Kitchen",
    subtitle: "Dominican Fast Food Favorites",
    botUrl: BOT_URL,
  },
  currency: "USD",
  meats: [
    { id: "chicken", name: "Chicken", priceDelta: 0 },
    { id: "beef", name: "Beef", priceDelta: 0 },
    { id: "pork", name: "Pork", priceDelta: 0 },
    { id: "shrimp", name: "Shrimp", priceDelta: 2.0, premium: true },
    { id: "mixed", name: "Mixed Meat", priceDelta: 2.0, premium: true },
  ],
  sides: [
    { id: "tostones", name: "Tostones" },
    { id: "papas", name: "Papas" },
    { id: "yuca", name: "Yuca" },
    { id: "batata-fritas", name: "Batata Fritas" },
    { id: "arroz-habichuela", name: "Arroz con Habichuela" },
  ],
  products: [
    { id: "yaroa-small", category: "Yaroas", name: "Yaroa Small", basePrice: 6.95, allowMeatChoice: true, allowSideChoice: false },
    { id: "yaroa-large", category: "Yaroas", name: "Yaroa Large", basePrice: 14.95, allowMeatChoice: true, allowSideChoice: false },
    { id: "chimi-dominicano", category: "Chimis", name: "Chimi Dominicano", basePrice: 9.95, allowMeatChoice: true, allowSideChoice: true },
    { id: "mofongo", category: "Mofongos", name: "Mofongo", basePrice: 14.95, allowMeatChoice: true, allowSideChoice: false },
    { id: "pica-pollo-tenders", category: "Pica Pollo", name: "Pica Pollo / Tenders 4 pc", basePrice: 9.95, allowMeatChoice: false, allowSideChoice: true },
  ],
};

const findProduct = (id: string) => MENU.products.find(p => p.id === id) || null;
const findMeat = (id: string) => MENU.meats.find(m => m.id === id) || null;
const findSide = (id: string) => MENU.sides.find(s => s.id === id) || null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Frontend entry — served at the function root with correct content-type.
// Assets (JS/CSS/logo) live on public Storage with absolute URLs.
const INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#000000" />
    <title>Anthony's Super Kitchen</title>
    <script type="module" crossorigin src="https://cbpdiiyzzmbavsymjysb.supabase.co/storage/v1/object/public/superkitchen/assets/index-CbqMrWNm.js"></script>
    <link rel="stylesheet" crossorigin href="https://cbpdiiyzzmbavsymjysb.supabase.co/storage/v1/object/public/superkitchen/assets/index-_jaESIZA.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

function htmlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
  });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function newOrderId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

async function handleCreateOrder(req: Request): Promise<Response> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const { items, customer, tipoEntrega, notas } = body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return json({ error: "Cart is empty" }, 400);
  }
  if (!customer?.nombre || !customer.nombre.trim()) {
    return json({ error: "Customer name required" }, 400);
  }

  const normalized: any[] = [];
  for (const raw of items) {
    const product = findProduct(raw?.productId);
    if (!product) return json({ error: `Item unavailable: ${raw?.name || raw?.productId}` }, 400);
    const qty = Math.max(1, Math.min(99, Number(raw.qty) || 1));

    let meat = null;
    if (product.allowMeatChoice) {
      if (!raw.meat?.id) return json({ error: `Meat required for ${product.name}` }, 400);
      meat = findMeat(raw.meat.id);
      if (!meat) return json({ error: `Unknown meat: ${raw.meat.id}` }, 400);
    }
    let side = null;
    if (product.allowSideChoice) {
      if (!raw.side?.id) return json({ error: `Side required for ${product.name}` }, 400);
      side = findSide(raw.side.id);
      if (!side) return json({ error: `Unknown side: ${raw.side.id}` }, 400);
    }

    const unitPrice = Math.round((product.basePrice + (meat?.priceDelta || 0)) * 100) / 100;
    normalized.push({
      productId: product.id,
      name: product.name,
      qty,
      unitPrice,
      meat: meat ? { id: meat.id, name: meat.name, priceDelta: meat.priceDelta } : null,
      side: side ? { id: side.id, name: side.name } : null,
      lineTotal: Math.round(unitPrice * qty * 100) / 100,
    });
  }

  const subtotal = Math.round(normalized.reduce((s, i) => s + i.lineTotal, 0) * 100) / 100;

  const order = {
    id: newOrderId(),
    restaurant_slug: "superkitchen",
    items: normalized,
    subtotal,
    tax: 0,
    total: subtotal,
    moneda: "USD",
    tipo_entrega: tipoEntrega === "delivery" ? "delivery" : "pickup",
    cliente: { nombre: customer.nombre.trim(), telefono: (customer.telefono || "").trim() },
    notas: notas || "",
    estado: "recibido",
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("orders").insert([order]);
  if (error) {
    console.error("insert error:", error.message);
    return json({ error: "Failed to save order" }, 500);
  }

  console.log(`🍗 Order #${order.id} — ${order.cliente.nombre} — $${order.subtotal.toFixed(2)}`);
  return json({ ok: true, orderId: order.id, total: order.subtotal, botUrl: BOT_URL });
}

async function handleGetOrder(id: string): Promise<Response> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return json({ error: "Failed to load order" }, 500);
  if (!data) return json({ error: "Order not found" }, 404);
  return json(data);
}

async function handleListOrders(): Promise<Response> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return json({ error: "Failed to list orders" }, 500);
  return json(data);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url);
  // The function receives its full slug in the path (e.g. /superkitchen/orders),
  // so strip the leading /<slug> prefix before routing.
  let path = url.pathname.replace(/^\/[^/]+/, "") || "/";

  try {
    if (req.method === "GET" && (path === "/" || path === "")) {
      return htmlResponse(INDEX_HTML);
    }

    if (req.method === "POST" && (path === "/orders" || path === "/api/orders")) {
      return await handleCreateOrder(req);
    }

    if (req.method === "GET" && (path === "/orders" || path === "/api/orders")) {
      return await handleListOrders();
    }

    if (req.method === "GET" && (path.startsWith("/orders/") || path.startsWith("/api/orders/"))) {
      const id = path.split("/").pop();
      return await handleGetOrder(id);
    }

    return json({ error: "Not found" }, 404);
  } catch (e) {
    console.error("handler error:", e);
    return json({ error: "Internal error" }, 500);
  }
});
