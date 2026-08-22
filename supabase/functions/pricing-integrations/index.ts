import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const API_VERSION = "2026-08-21.1";

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const MANAGER_ROLES = new Set(["manager", "admin"]);
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}

async function requireManager(req: Request) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  const { data, error } = await authClient.auth.getUser(auth.slice(7));
  if (error || !data.user) return null;
  const role = String(data.user.app_metadata?.role || "");
  if (!MANAGER_ROLES.has(role)) return null;
  return { userId: data.user.id, role };
}

function clampLimit(value: string | null, fallback = 50) {
  const parsed = Number(value || fallback);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(200, Math.trunc(parsed)));
}

function text(value: unknown, max = 500) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "GET" && req.method !== "POST") {
    return json({ error: "Method not allowed", allowed: ["GET", "POST"] }, 405);
  }

  const actor = await requireManager(req);
  if (!actor) {
    console.warn("pricing-integrations denied", { reason: "manager_role_required" });
    return json({ error: "Manager or admin role required" }, 403);
  }

  const url = new URL(req.url);

  if (req.method === "GET") {
    const resource = url.searchParams.get("resource") || "inventory";

    if (resource === "inventory") {
      const { data, error } = await admin
        .from("inventory_balances")
        .select("product_id,on_hand_quantity,source_session_id,updated_at,pricing_products(name,category,department,current_retail_price)")
        .order("updated_at", { ascending: false })
        .limit(5000);
      if (error) return json({ error: "Inventory unavailable" }, 503);
      return json({ ok: true, service: "pricing-integrations", apiVersion: API_VERSION, resource, balances: data || [] });
    }

    if (resource === "counts") {
      const { data, error } = await admin
        .from("inventory_count_sessions")
        .select("id,label,status,notes,started_by,completed_by,created_at,completed_at")
        .order("created_at", { ascending: false })
        .limit(clampLimit(url.searchParams.get("limit"), 50));
      if (error) return json({ error: "Inventory counts unavailable" }, 503);
      return json({ ok: true, service: "pricing-integrations", apiVersion: API_VERSION, resource, counts: data || [] });
    }

    if (resource === "products") {
      const { data, error } = await admin
        .from("pricing_products")
        .select("id,upc,name,category,department,current_retail_price,updated_at")
        .eq("active", true)
        .order("name")
        .limit(5000);
      if (error) return json({ error: "Products unavailable" }, 503);
      return json({ ok: true, service: "pricing-integrations", apiVersion: API_VERSION, resource, products: data || [] });
    }

    if (resource === "aliases") {
      const { data, error } = await admin
        .from("pos_product_aliases")
        .select("id,product_id,upc,normalized_name,approved_by,created_at,pricing_products(name)")
        .order("created_at", { ascending: false })
        .limit(clampLimit(url.searchParams.get("limit"), 100));
      if (error) return json({ error: "POS aliases unavailable" }, 503);
      return json({ ok: true, service: "pricing-integrations", apiVersion: API_VERSION, resource, aliases: data || [] });
    }

    if (resource === "unmatched_pos") {
      const { data, error } = await admin.rpc("pricing_unmatched_pos_summary", {
        p_limit: clampLimit(url.searchParams.get("limit"), 50),
      });
      if (error) return json({ error: "Unmatched POS summary unavailable" }, 503);
      return json({ ok: true, service: "pricing-integrations", apiVersion: API_VERSION, resource, rows: data || [] });
    }

    return json({ error: "Unknown resource" }, 404);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON body required" }, 400);
  }

  const action = text(body.action, 80);

  if (action === "start_count") {
    const { data, error } = await admin
      .from("inventory_count_sessions")
      .insert({
        label: text(body.label, 160) || null,
        notes: text(body.notes, 1000) || null,
        started_by: actor.userId,
      })
      .select("id,label,status,notes,started_by,created_at")
      .single();
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true, action, count: data }, 201);
  }

  if (action === "save_count_lines") {
    const sessionId = text(body.session_id, 80);
    const lines = Array.isArray(body.lines) ? body.lines : [];
    if (!sessionId || !lines.length) return json({ error: "session_id and lines are required" }, 400);
    if (lines.length > 1000) return json({ error: "At most 1000 count lines per request" }, 413);

    const { data: session, error: sessionError } = await admin
      .from("inventory_count_sessions")
      .select("id,status")
      .eq("id", sessionId)
      .single();
    if (sessionError || !session) return json({ error: "Inventory count session not found" }, 404);
    if (session.status !== "draft") return json({ error: "Only draft counts can be edited" }, 409);

    const records = [];
    for (const raw of lines) {
      const row = (raw || {}) as Record<string, unknown>;
      const productId = text(row.product_id, 80);
      const quantity = Number(row.quantity_each);
      if (!productId || !Number.isFinite(quantity) || quantity < 0) {
        return json({ error: "Each line needs product_id and non-negative quantity_each" }, 400);
      }
      records.push({
        session_id: sessionId,
        product_id: productId,
        quantity_each: quantity,
        note: text(row.note, 500) || null,
        counted_at: new Date().toISOString(),
      });
    }

    const { data, error } = await admin
      .from("inventory_count_lines")
      .upsert(records, { onConflict: "session_id,product_id" })
      .select("product_id,quantity_each,note,counted_at");
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true, action, session_id: sessionId, saved: data?.length || 0, lines: data || [] });
  }

  if (action === "complete_count") {
    const sessionId = text(body.session_id, 80);
    if (!sessionId) return json({ error: "session_id is required" }, 400);
    const { data, error } = await admin.rpc("inventory_complete_count", {
      p_session_id: sessionId,
      p_completed_by: actor.userId,
    });
    if (error) return json({ error: error.message }, 409);
    return json({ ok: true, action, result: data });
  }

  if (action === "cancel_count") {
    const sessionId = text(body.session_id, 80);
    if (!sessionId) return json({ error: "session_id is required" }, 400);
    const { data, error } = await admin
      .from("inventory_count_sessions")
      .update({ status: "cancelled" })
      .eq("id", sessionId)
      .eq("status", "draft")
      .select("id,status")
      .maybeSingle();
    if (error) return json({ error: error.message }, 400);
    if (!data) return json({ error: "Draft count not found" }, 404);
    return json({ ok: true, action, count: data });
  }

  if (action === "register_pos_alias") {
    const productId = text(body.product_id, 80);
    const upc = text(body.upc, 80) || null;
    const normalizedName = text(body.normalized_name, 500) || null;
    if (!productId || (!upc && !normalizedName)) {
      return json({ error: "product_id plus UPC or normalized_name is required" }, 400);
    }
    const { data, error } = await admin.rpc("pricing_register_pos_alias", {
      p_product_id: productId,
      p_upc: upc,
      p_normalized_name: normalizedName,
      p_approved_by: actor.userId,
    });
    if (error) return json({ error: error.message }, 409);
    return json({ ok: true, action, result: data });
  }

  return json({ error: "Unknown action" }, 404);
});
