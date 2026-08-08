// API helper — talks to the Super Kitchen backend.

// Keep static/GitHub Pages builds functional even when VITE_API_URL is not injected.
// Deployment environments can still override this value explicitly.
const API_BASE = import.meta.env.VITE_API_URL || 'https://cbpdiiyzzmbavsymjysb.functions.supabase.co/superkitchen';

export async function createOrder({ items, customer, tipoEntrega, notas }) {
  // Raw Telegram initData is safe to transmit to our backend, but must never be
  // trusted in the browser. The Edge Function validates it before using identity.
  const telegramInitData = window.Telegram?.WebApp?.initData || '';

  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map(i => ({
        productId: i.productId,
        name: i.name,
        qty: i.qty,
        unitPrice: i.unitPrice,
        meat: i.meat ? { id: i.meat.id, name: i.meat.name, priceDelta: i.meat.priceDelta } : null,
        side: i.side ? { id: i.side.id, name: i.side.name } : null,
      })),
      customer,
      tipoEntrega,
      notas,
      telegramInitData,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Order failed (HTTP ${res.status})`);
  }
  return res.json();
}

export async function generateProductImage(productId, prompt) {
  const res = await fetch(`${API_BASE}/api/admin/products/${productId}/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Image generation failed (HTTP ${res.status})`);
  }
  return res.json();
}
