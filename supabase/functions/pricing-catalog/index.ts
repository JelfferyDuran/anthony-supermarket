import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const API_VERSION = "2026-08-21.1";

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(body: unknown, status = 200, cacheControl = "public, max-age=60, stale-while-revalidate=300") {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "GET") {
    return json({ error: "Method not allowed", allowed: ["GET"] }, 405, "no-store");
  }

  // verify_jwt=true is enforced by Supabase before this function runs. The
  // customer app can use its existing valid Supabase JWT/publishable context;
  // this function never accepts a service-role credential from a client.
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) {
    return json({ error: "Unauthorized" }, 401, "no-store");
  }

  const { data, error } = await admin
    .from("pricing_products")
    .select("id,upc,name,department,category,current_retail_price,updated_at")
    .eq("active", true)
    .eq("internal", false)
    .not("current_retail_price", "is", null)
    .gt("current_retail_price", 0)
    .order("name")
    .limit(5000);

  if (error) {
    console.error("pricing-catalog query failed", { message: error.message });
    return json({
      ok: false,
      service: "pricing-catalog",
      apiVersion: API_VERSION,
      error: "Catalog unavailable",
    }, 503, "no-store");
  }

  const items = (data || []).map((product) => ({
    id: product.id,
    upc: product.upc || null,
    name: product.name,
    category: product.category || null,
    department: product.department || product.category || null,
    retailPrice: Number(product.current_retail_price),
    updatedAt: product.updated_at,
  }));

  return json({
    ok: true,
    service: "pricing-catalog",
    apiVersion: API_VERSION,
    source: "approved-pricing-products",
    pricingRule: "cost_x_1.70_server_authoritative",
    count: items.length,
    items,
  });
});
