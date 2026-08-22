// Manager-only Pricing Hub Phase D client.
// Uses the same authenticated staff JWT as the existing Super Kitchen portal.
// The Edge Function re-checks manager/admin role from protected app_metadata.

const INTEGRATIONS_BASE = 'https://cbpdiiyzzmbavsymjysb.functions.supabase.co/pricing-integrations';

async function jfetch(url, token, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Pricing request failed (HTTP ${res.status})`);
  return body;
}

export const listPricingProducts = (token) =>
  jfetch(`${INTEGRATIONS_BASE}?resource=products`, token).then((r) => r.products || []);

export const listInventoryBalances = (token) =>
  jfetch(`${INTEGRATIONS_BASE}?resource=inventory`, token).then((r) => r.balances || []);

export const listInventoryCounts = (token, limit = 30) =>
  jfetch(`${INTEGRATIONS_BASE}?resource=counts&limit=${encodeURIComponent(limit)}`, token).then((r) => r.counts || []);

export const listUnmatchedPos = (token, limit = 50) =>
  jfetch(`${INTEGRATIONS_BASE}?resource=unmatched_pos&limit=${encodeURIComponent(limit)}`, token).then((r) => r.rows || []);

export const listPosAliases = (token, limit = 100) =>
  jfetch(`${INTEGRATIONS_BASE}?resource=aliases&limit=${encodeURIComponent(limit)}`, token).then((r) => r.aliases || []);

export const startInventoryCount = (token, { label, notes } = {}) =>
  jfetch(INTEGRATIONS_BASE, token, {
    method: 'POST',
    body: JSON.stringify({ action: 'start_count', label, notes }),
  }).then((r) => r.count);

export const saveInventoryCountLines = (token, sessionId, lines) =>
  jfetch(INTEGRATIONS_BASE, token, {
    method: 'POST',
    body: JSON.stringify({ action: 'save_count_lines', session_id: sessionId, lines }),
  });

export const completeInventoryCount = (token, sessionId) =>
  jfetch(INTEGRATIONS_BASE, token, {
    method: 'POST',
    body: JSON.stringify({ action: 'complete_count', session_id: sessionId }),
  });

export const cancelInventoryCount = (token, sessionId) =>
  jfetch(INTEGRATIONS_BASE, token, {
    method: 'POST',
    body: JSON.stringify({ action: 'cancel_count', session_id: sessionId }),
  });

export const registerPosAlias = (token, { productId, upc, normalizedName }) =>
  jfetch(INTEGRATIONS_BASE, token, {
    method: 'POST',
    body: JSON.stringify({
      action: 'register_pos_alias',
      product_id: productId,
      upc: upc || null,
      normalized_name: normalizedName || null,
    }),
  }).then((r) => r.result);
