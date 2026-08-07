import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BOT_URL = Deno.env.get("BOT_URL") || "https://t.me/Anthonysuperkitchen_bot";
const MINIAPP_URL = "https://jelfferyduran.github.io/anthony-supermarket/apps/superkitchen/dist/";
// Server-only secret. A historical token must never be reused here.
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const MENU = {
  meats: [
    { id: "chicken", name: "Chicken", priceDelta: 0 },
    { id: "beef", name: "Beef", priceDelta: 0 },
    { id: "pork", name: "Pork", priceDelta: 0 },
    { id: "shrimp", name: "Shrimp", priceDelta: 2.0 },
    { id: "mixed", name: "Mixed Meat", priceDelta: 2.0 },
  ],
  sides: [
    { id: "tostones", name: "Tostones" },
    { id: "papas", name: "Papas" },
    { id: "yuca", name: "Yuca" },
    { id: "batata-fritas", name: "Batata Fritas" },
    { id: "arroz-habichuela", name: "Arroz con Habichuela" },
  ],
  products: [
    { id: "yaroa-small", name: "Yaroa Small", basePrice: 6.95, allowMeatChoice: true, allowSideChoice: false },
    { id: "yaroa-large", name: "Yaroa Large", basePrice: 14.95, allowMeatChoice: true, allowSideChoice: false },
    { id: "chimi-dominicano", name: "Chimi Dominicano", basePrice: 9.95, allowMeatChoice: true, allowSideChoice: true },
    { id: "mofongo", name: "Mofongo", basePrice: 14.95, allowMeatChoice: true, allowSideChoice: false },
    { id: "pica-pollo-tenders", name: "Pica Pollo / Tenders 4 pc", basePrice: 9.95, allowMeatChoice: false, allowSideChoice: true },
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
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(req) },
  });
}

function rootHtml(req: Request) {
  const body = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${MINIAPP_URL}"><meta name="referrer" content="no-referrer"><title>Anthony's Super Kitchen</title></head><body><p><a href="${MINIAPP_URL}">Open Anthony's Super Kitchen</a></p></body></html>`;
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; style-src 'none'; img-src 'none'; base-uri 'none'; form-action 'none'",
      ...corsHeaders(req),
    },
  });
}

const findProduct = (id: string) => MENU.products.find((p) => p.id === id) || null;
const findMeat = (id: string) => MENU.meats.find((m) => m.id === id) || null;
const findSide = (id: string) => MENU.sides.find((s) => s.id === id) || null;

function newOrderId() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

const encoder = new TextEncoder();

async function hmacSha256(key: string | Uint8Array, data: string) {
  const rawKey = typeof key === "string" ? encoder.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data)));
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeHexEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

type TelegramIdentity = {
  verified: boolean;
  invalid?: boolean;
  reason?: string;
  userId?: number;
  authDate?: number;
};

async function verifyTelegramInitData(value: unknown): Promise<TelegramIdentity> {
  const raw = typeof value === "string" ? value : "";
  if (!raw) return { verified: false, reason: "absent" };
  if (raw.length > 8192) return { verified: false, invalid: true, reason: "too_large" };
  // Until a freshly rotated token is configured, identity is deliberately ignored.
  if (!TELEGRAM_BOT_TOKEN) return { verified: false, reason: "not_configured" };

  const params = new URLSearchParams(raw);
  const receivedHash = (params.get("hash") || "").toLowerCase();
  const authDate = Number(params.get("auth_date"));
  if (!/^[a-f0-9]{64}$/.test(receivedHash) || !Number.isSafeInteger(authDate) || authDate <= 0) {
    return { verified: false, invalid: true, reason: "malformed" };
  }

  params.delete("hash");
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${key}=${val}`)
    .join("\n");

  const secretKey = await hmacSha256("WebAppData", TELEGRAM_BOT_TOKEN);
  const expectedHash = bytesToHex(await hmacSha256(secretKey, dataCheckString));
  if (!timingSafeHexEqual(expectedHash, receivedHash)) {
    return { verified: false, invalid: true, reason: "signature" };
  }

  const age = Math.floor(Date.now() / 1000) - authDate;
  if (age < -60 || age > 900) return { verified: false, invalid: true, reason: "stale" };

  let user: any;
  try {
    user = JSON.parse(params.get("user") || "null");
  } catch {
    return { verified: false, invalid: true, reason: "bad_user" };
  }
  const userId = Number(user?.id);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return { verified: false, invalid: true, reason: "missing_user" };
  }
  return { verified: true, userId, authDate };
}

const fallbackBuckets = new Map<string, { count: number; resetAt: number }>();
function fallbackRateLimited(key: string) {
  const now = Date.now();
  const current = fallbackBuckets.get(key);
  if (!current || current.resetAt <= now) {
    fallbackBuckets.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 12;
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return bytesToHex(new Uint8Array(digest));
}

async function rateLimited(req: Request) {
  const ip = (req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const ua = (req.headers.get("user-agent") || "unknown").slice(0, 160);
  const keyHash = await sha256Hex(`${ip}|${ua}|superkitchen-order`);
  const { data, error } = await admin.rpc("consume_order_rate_limit", {
    p_key_hash: keyHash,
    p_limit: 12,
    p_window_seconds: 60,
  });
  if (!error && typeof data === "boolean") return !data;
  console.error("durable rate limiter unavailable", error?.message || "unknown");
  return fallbackRateLimited(keyHash);
}

async function requireStaff(req: Request) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  const { data, error } = await authClient.auth.getUser(auth.slice(7));
  if (error || !data.user) return null;
  const role = data.user.app_metadata?.role;
  return ["kitchen", "manager", "admin"].includes(role) ? { user: data.user, role } : null;
}

async function parseLimitedJson(req: Request) {
  const raw = await req.text();
  if (encoder.encode(raw).byteLength > 32768) throw new Error("REQUEST_TOO_LARGE");
  try {
    return JSON.parse(raw || "{}");
  } catch {
    throw new Error("INVALID_JSON");
  }
}

async function handleCreateOrder(req: Request) {
  if (await rateLimited(req)) return json(req, { error: "Too many requests. Please try again shortly." }, 429);

  let body: any;
  try {
    body = await parseLimitedJson(req);
  } catch (e) {
    return json(req, { error: (e as Error).message === "REQUEST_TOO_LARGE" ? "Request too large" : "Invalid JSON" }, (e as Error).message === "REQUEST_TOO_LARGE" ? 413 : 400);
  }

  const { items, customer, tipoEntrega, notas, telegramInitData } = body || {};
  if (!Array.isArray(items) || items.length === 0 || items.length > 30) return json(req, { error: "Invalid cart" }, 400);

  const tg = await verifyTelegramInitData(telegramInitData);
  if (tg.invalid) return json(req, { error: "Invalid or expired Telegram session" }, 401);

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

  const subtotal = Math.round(normalized.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;
  const now = new Date().toISOString();
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
    telegram_user_id: tg.verified ? tg.userId : null,
    telegram_auth_date: tg.verified && tg.authDate ? new Date(tg.authDate * 1000).toISOString() : null,
    created_at: now,
    updated_at: now,
  };

  const { error } = await admin.from("orders").insert([order]);
  if (error) {
    console.error("order insert failed", error.message);
    return json(req, { error: "Failed to save order" }, 500);
  }

  return json(req, {
    ok: true,
    orderId: order.id,
    total: order.total,
    botUrl: BOT_URL,
    telegramVerified: tg.verified,
  }, 201);
}

async function handleGetOrder(req: Request, id: string) {
  const staff = await requireStaff(req);
  if (staff) {
    const { data, error } = await admin.from("orders").select("*").eq("id", id).maybeSingle();
    if (error) return json(req, { error: "Failed to load order" }, 500);
    if (!data) return json(req, { error: "Order not found" }, 404);
    return json(req, data);
  }

  if (!/^[A-F0-9]{16}$/i.test(id)) return json(req, { error: "Unauthorized" }, 401);
  const { data, error } = await admin
    .from("orders")
    .select("id,items,subtotal,total,moneda,tipo_entrega,estado,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) return json(req, { error: "Failed to load receipt" }, 500);
  if (!data) return json(req, { error: "Order not found" }, 404);
  // Compatibility alias for the currently deployed legacy bot; no PII is added.
  return json(req, { ...data, tipoEntrega: data.tipo_entrega });
}

async function handleListOrders(req: Request) {
  if (!(await requireStaff(req))) return json(req, { error: "Unauthorized" }, 401);
  const { data, error } = await admin.from("orders").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) return json(req, { error: "Failed to list orders" }, 500);
  return json(req, data);
}

async function handleUpdateStatus(req: Request, id: string) {
  const staff = await requireStaff(req);
  if (!staff) return json(req, { error: "Unauthorized" }, 401);
  let body: any;
  try {
    body = await parseLimitedJson(req);
  } catch {
    return json(req, { error: "Invalid JSON" }, 400);
  }
  const next = String(body?.status || "").trim();
  if (!["preparando", "listo", "completado", "cancelado"].includes(next)) return json(req, { error: "Invalid status" }, 400);

  const { data, error } = await admin.rpc("staff_update_order_status", {
    p_order_id: id,
    p_new_status: next,
    p_actor_user_id: staff.user.id,
    p_actor_role: staff.role,
  });
  if (error) {
    console.error("status update rejected", error.message);
    return json(req, { error: "Status change rejected" }, 409);
  }
  return json(req, data);
}

async function handleAudit(req: Request, id: string) {
  const staff = await requireStaff(req);
  if (!staff || !["manager", "admin"].includes(staff.role)) return json(req, { error: "Unauthorized" }, 401);
  const { data, error } = await admin
    .from("order_audit_log")
    .select("id,order_id,from_status,to_status,actor_user_id,actor_role,source,detail,created_at")
    .eq("order_id", id)
    .order("created_at", { ascending: true });
  if (error) return json(req, { error: "Failed to load audit log" }, 500);
  return json(req, data);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  const path = new URL(req.url).pathname.replace(/^\/[^/]+/, "") || "/";

  try {
    if (req.method === "GET" && path === "/") return rootHtml(req);
    if (req.method === "POST" && (path === "/orders" || path === "/api/orders")) return await handleCreateOrder(req);
    if (req.method === "GET" && (path === "/orders" || path === "/api/orders")) return await handleListOrders(req);

    const audit = path.match(/^\/(?:api\/)?orders\/([^/]+)\/audit$/);
    if (req.method === "GET" && audit) return await handleAudit(req, audit[1]);

    const status = path.match(/^\/(?:api\/)?orders\/([^/]+)\/status$/);
    if (req.method === "PATCH" && status) return await handleUpdateStatus(req, status[1]);

    const order = path.match(/^\/(?:api\/)?orders\/([^/]+)$/);
    if (req.method === "GET" && order) return await handleGetOrder(req, order[1]);

    return json(req, { error: "Not found" }, 404);
  } catch (error) {
    console.error("superkitchen handler error", error instanceof Error ? error.message : "unknown");
    return json(req, { error: "Internal error" }, 500);
  }
});
