import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BOT_URL = Deno.env.get("BOT_URL") || "https://t.me/Anthonysuperkitchen_bot";

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const MENU = {
  brand: { name: "Anthony's Super Kitchen", subtitle: "Dominican Fast Food Favorites", botUrl: BOT_URL },
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

const ALLOWED_ORIGINS = new Set([
  "https://jelfferyduran.github.io",
  "https://cbpdiiyzzmbavsymjysb.supabase.co",
]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://jelfferyduran.github.io",
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(req) },
  });
}

const INDEX_HTML = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"/><meta name="theme-color" content="#000000"/><title>Anthony's Super Kitchen</title><script type="module" crossorigin src="https://cbpdiiyzzmbavsymjysb.supabase.co/storage/v1/object/public/superkitchen/assets/index-CbqMrWNm.js"></script><link rel="stylesheet" crossorigin href="https://cbpdiiyzzmbavsymjysb.supabase.co/storage/v1/object/public/superkitchen/assets/index-_jaESIZA.css"></head><body><div id="root"></div></body></html>`;

function html(req: Request, body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders(req) },
  });
}

const findProduct = (id: string) => MENU.products.find((p) => p.id === id) || null;
const findMeat = (id: string) => MENU.meats.find((m) => m.id === id) || null;
const findSide = (id: string) => MENU.sides.find((s) => s.id === id) || null;

function newOrderId() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

const buckets = new Map<string, { count: number; reset: number }>();
function rateLimited(req: Request) {
  const now = Date.now();
  const key = (req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const current = buckets.get(key);
  if (!current || current.reset < now) {
    buckets.set(key, { count: 1, reset: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 12;
}

async function requireStaff(req: Request) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  const { data, error } = await authClient.auth.getUser(auth.slice(7));
  if (error || !data.user) return null;
  const role = data.user.app_metadata?.role;
  return ["kitchen", "manager", "admin"].includes(role) ? { user: data.user, role } : null;
}

async function handleCreateOrder(req: Request) {
  if (rateLimited(req)) return json(req, { error: "Too many requests. Please try again shortly." }, 429);
  const len = Number(req.headers.get("content-length") || 0);
  if (len > 32768) return json(req, { error: "Request too large" }, 413);

  let body: any;
  try { body = await req.json(); } catch { return json(req, { error: "Invalid JSON" }, 400); }

  const { items, customer, tipoEntrega, notas } = body || {};
  if (!Array.isArray(items) || items.length === 0 || items.length > 30) return json(req, { error: "Invalid cart" }, 400);

  const nombre = String(customer?.nombre || "").trim();
  const telefono = String(customer?.telefono || "").trim();
  const safeNotas = String(notas || "").trim();
  if (!nombre || nombre.length > 80) return json(req, { error: "Invalid customer name" }, 400);
  if (telefono.length > 32) return json(req, { error: "Invalid phone number" }, 400);
  if (safeNotas.length > 500) return json(req, { error: "Notes are too long" }, 400);

  const normalized: any[] = [];
  for (const raw of items) {
    const product = findProduct(raw?.productId);
    if (!product) return json(req, { error: "One or more items are unavailable" }, 400);

    const qty = Number(raw?.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return json(req, { error: `Invalid quantity for ${product.name}` }, 400);

    let meat = null;
    if (product.allowMeatChoice) {
      meat = findMeat(raw?.meat?.id);
      if (!meat) return json(req, { error: `Valid meat choice required for ${product.name}` }, 400);
    }

    let side = null;
    if (product.allowSideChoice) {
      side = findSide(raw?.side?.id);
      if (!side) return json(req, { error: `Valid side choice required for ${product.name}` }, 400);
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

  const subtotal = Math.round(normalized.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;
  const order = {
    id: newOrderId(),
    restaurant_slug: "superkitchen",
    items: normalized,
    subtotal,
    tax: 0,
    total: subtotal,
    moneda: "USD",
    tipo_entrega: tipoEntrega === "delivery" ? "delivery" : "pickup",
    cliente: { nombre, telefono },
    notas: safeNotas,
    estado: "recibido",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin.from("orders").insert([order]);
  if (error) {
    console.error("order insert failed", error.message);
    return json(req, { error: "Failed to save order" }, 500);
  }

  return json(req, { ok: true, orderId: order.id, total: order.total, botUrl: BOT_URL }, 201);
}

async function handleGetOrder(req: Request, id: string) {
  if (!(await requireStaff(req))) return json(req, { error: "Unauthorized" }, 401);
  const { data, error } = await admin.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) return json(req, { error: "Failed to load order" }, 500);
  if (!data) return json(req, { error: "Order not found" }, 404);
  return json(req, data);
}

async function handleListOrders(req: Request) {
  if (!(await requireStaff(req))) return json(req, { error: "Unauthorized" }, 401);
  const { data, error } = await admin.from("orders").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) return json(req, { error: "Failed to list orders" }, 500);
  return json(req, data);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  const path = new URL(req.url).pathname.replace(/^\/[^/]+/, "") || "/";

  try {
    if (req.method === "GET" && path === "/") return html(req, INDEX_HTML);
    if (req.method === "POST" && (path === "/orders" || path === "/api/orders")) return await handleCreateOrder(req);
    if (req.method === "GET" && (path === "/orders" || path === "/api/orders")) return await handleListOrders(req);
    if (req.method === "GET" && (path.startsWith("/orders/") || path.startsWith("/api/orders/"))) {
      return await handleGetOrder(req, path.split("/").pop() || "");
    }
    return json(req, { error: "Not found" }, 404);
  } catch (e) {
    console.error("superkitchen handler error", e);
    return json(req, { error: "Internal error" }, 500);
  }
});
