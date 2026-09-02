// Staff API — talks to the Super Kitchen edge functions with a staff Bearer JWT.
// Contract (live, verified): 
//   GET  /api/orders             → list (staff: kitchen/manager/admin)
//   PATCH /api/orders/:id/status → { status: preparando|listo|completado|cancelado }
//   GET  /api/orders/:id/audit   → audit log (manager/admin)
//   GET  superkitchen-ops        → read-only operational summary (manager/admin/observer)

const API_BASE = import.meta.env.VITE_API_URL || 'https://cbpdiiyzzmbavsymjysb.functions.supabase.co/superkitchen';
const OPS_BASE = 'https://cbpdiiyzzmbavsymjysb.functions.supabase.co/superkitchen-ops';

async function jfetch(url, token, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (HTTP ${res.status})`);
  }
  return res.json();
}

export const listOrders = (token) => jfetch(`${API_BASE}/api/orders`, token);

export const updateOrderStatus = (token, id, status) =>
  jfetch(`${API_BASE}/api/orders/${id}/status`, token, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const getAudit = (token, id) => jfetch(`${API_BASE}/api/orders/${id}/audit`, token);

export const getOpsSummary = (token) => jfetch(OPS_BASE, token);

// Short human id (orders are 16-char uppercase hex)
export const shortId = (id) => (id ? String(id).slice(0, 8) : '—');

export const timeAgo = (iso) => {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.max(0, Math.floor(ms / 60000));
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d`;
};
