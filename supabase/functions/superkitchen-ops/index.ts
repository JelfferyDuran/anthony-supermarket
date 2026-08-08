import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ALLOWED_ROLES = new Set(["agent_observer", "manager", "admin"]);
const ACTIVE_STATUSES = new Set(["recibido", "preparando", "listo"]);
const API_VERSION = "2026-08-08.1";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}

async function requireObserver(req: Request) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;

  const { data, error } = await authClient.auth.getUser(auth.slice(7));
  if (error || !data.user) return null;

  const role = String(data.user.app_metadata?.role || "");
  if (!ALLOWED_ROLES.has(role)) return null;

  return {
    userId: data.user.id,
    role,
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function ageMinutes(createdAt: string | null | undefined, nowMs: number) {
  const createdMs = new Date(createdAt || 0).getTime();
  if (!Number.isFinite(createdMs) || createdMs <= 0) return null;
  return Math.max(0, Math.floor((nowMs - createdMs) / 60_000));
}

Deno.serve(async (req: Request) => {
  if (req.method !== "GET") {
    return json({ error: "Method not allowed", allowed: ["GET"] }, 405);
  }

  const actor = await requireObserver(req);
  if (!actor) {
    console.warn("superkitchen-ops denied", { reason: "unauthorized" });
    return json({ error: "Unauthorized" }, 401);
  }

  const now = new Date();
  const nowMs = now.getTime();
  const since24h = new Date(nowMs - 24 * 60 * 60 * 1000).toISOString();

  const [activeResult, recentResult, auditResult] = await Promise.all([
    admin
      .from("orders")
      .select("id,estado,tipo_entrega,total,created_at,updated_at")
      .in("estado", ["recibido", "preparando", "listo"])
      .order("created_at", { ascending: true })
      .limit(200),
    admin
      .from("orders")
      .select("id,estado,tipo_entrega,total,created_at,updated_at")
      .gte("created_at", since24h)
      .order("created_at", { ascending: false })
      .limit(500),
    admin
      .from("order_audit_log")
      .select("from_status,to_status,source,created_at")
      .gte("created_at", since24h)
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const dbError = activeResult.error || recentResult.error || auditResult.error;
  if (dbError) {
    console.error("superkitchen-ops query failed", {
      actorRole: actor.role,
      message: dbError.message,
    });
    return json({
      ok: false,
      service: "superkitchen-ops",
      apiVersion: API_VERSION,
      error: "Operational summary unavailable",
    }, 503);
  }

  const activeOrders = activeResult.data || [];
  const recentOrders = recentResult.data || [];
  const auditEvents = auditResult.data || [];

  const activeByStatus: Record<string, number> = {
    recibido: 0,
    preparando: 0,
    listo: 0,
  };

  for (const order of activeOrders) {
    if (ACTIVE_STATUSES.has(order.estado)) {
      activeByStatus[order.estado] = (activeByStatus[order.estado] || 0) + 1;
    }
  }

  const orderStatusLast24h: Record<string, number> = {};
  const deliveryTypeLast24h: Record<string, number> = { pickup: 0, delivery: 0 };
  let grossSalesLast24h = 0;

  for (const order of recentOrders) {
    const status = String(order.estado || "unknown");
    orderStatusLast24h[status] = (orderStatusLast24h[status] || 0) + 1;

    const deliveryType = order.tipo_entrega === "delivery" ? "delivery" : "pickup";
    deliveryTypeLast24h[deliveryType] += 1;

    if (status !== "cancelado") {
      grossSalesLast24h += Number(order.total || 0);
    }
  }

  const transitionCounts: Record<string, number> = {};
  for (const event of auditEvents) {
    const key = `${event.from_status || "none"}->${event.to_status || "none"}`;
    transitionCounts[key] = (transitionCounts[key] || 0) + 1;
  }

  const oldestActive = activeOrders[0] || null;
  const newestRecent = recentOrders[0] || null;

  console.info("superkitchen-ops allowed", {
    actorUserId: actor.userId,
    actorRole: actor.role,
    activeOrders: activeOrders.length,
    ordersLast24h: recentOrders.length,
  });

  return json({
    ok: true,
    service: "superkitchen-ops",
    apiVersion: API_VERSION,
    mode: "read-only",
    scope: "non-PII operational summary",
    asOf: now.toISOString(),
    database: {
      reachable: true,
    },
    active: {
      total: activeOrders.length,
      byStatus: activeByStatus,
      oldestOrderAgeMinutes: oldestActive ? ageMinutes(oldestActive.created_at, nowMs) : null,
      oldestOrderId: oldestActive?.id || null,
    },
    last24h: {
      orders: recentOrders.length,
      grossSalesExcludingCancelled: roundMoney(grossSalesLast24h),
      byStatus: orderStatusLast24h,
      byDeliveryType: deliveryTypeLast24h,
      auditTransitions: auditEvents.length,
      transitionCounts,
    },
    recentOrders: recentOrders.slice(0, 10).map((order) => ({
      id: order.id,
      status: order.estado,
      deliveryType: order.tipo_entrega === "delivery" ? "delivery" : "pickup",
      total: Number(order.total || 0),
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      ageMinutes: ageMinutes(order.created_at, nowMs),
    })),
    freshness: {
      lastOrderAt: newestRecent?.created_at || null,
      lastAuditEventAt: auditEvents[0]?.created_at || null,
    },
  });
});
