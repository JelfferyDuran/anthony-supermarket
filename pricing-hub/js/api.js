/* Pricing Hub API client. Backend contract lives in server/pricing-router.js —
   this file is a thin typed wrapper. Sessions last 30 days (server-minted). */

const BASE = '/api/pricing';
const TOKEN_KEY = 'pricingToken';

export const state = {
  token: localStorage.getItem(TOKEN_KEY) || null,
  user: null,
  config: null,
  products: [],
  queue: [],          // needs_review lines, grouped on demand
  financials: null,
  cleared: 0,         // invoices approved this session (game counter)
};

export function isAuthed() {
  return Boolean(state.token);
}

export function saveSession(token, user) {
  state.token = token;
  state.user = user || null;
  try { localStorage.setItem(TOKEN_KEY, token); } catch (_) { /* private mode */ }
}

export function clearSession() {
  state.token = null;
  state.user = null;
  try { localStorage.removeItem(TOKEN_KEY); } catch (_) { /* private mode */ }
}

async function request(path, { method = 'GET', body = null, form = null, on401 = null } = {}) {
  const headers = {};
  if (state.token) headers['Authorization'] = 'Bearer ' + state.token;
  let payload = null;
  if (form) {
    payload = form; // fetch sets multipart boundary itself
  } else if (body != null) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: payload });
  } catch (e) {
    throw new Error('Network error: could not reach the hub (' + e.message + ')');
  }
  if (res.status === 401) {
    clearSession();
    if (typeof on401 === 'function') on401();
    throw new Error('Session expired — please sign in again.');
  }
  let data = null;
  try { data = await res.json(); } catch (_) { /* non-JSON */ }
  if (!res.ok) {
    const msg = (data && (data.error || data.detail)) || ('Request failed (' + res.status + ')');
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  async login(email, password) {
    const data = await request('/login', { method: 'POST', body: { email, password } });
    // { token, user: { email, role } } — task contract. Be lenient about shape.
    const token = data.token || data.sessionToken || data.access_token;
    const user = data.user || { email, role: data.role || '' };
    if (!token) throw new Error('Sign-in failed: no session token returned.');
    saveSession(token, user);
    return user;
  },

  signOut() { clearSession(); },

  async getConfig() {
    state.config = await request('/config');
    return state.config;
  },

  async getProducts() {
    const data = await request('/products');
    state.products = Array.isArray(data.products) ? data.products : [];
    return state.products;
  },

  async getQueue() {
    const data = await request('/queue');
    state.queue = Array.isArray(data.lines) ? data.lines : [];
    return state.queue;
  },

  // Multipart invoice upload with real progress via XHR (fetch can't report it).
  // onProgress(0..1, phase) — phase: 'upload' | 'extract'.
  uploadInvoice(file, fields = {}, { onProgress = null, signal = null } = {}) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('invoice', file, file.name);
      if (fields.invoice_number) form.append('invoice_number', fields.invoice_number);
      if (fields.invoice_date) form.append('invoice_date', fields.invoice_date);

      const xhr = new XMLHttpRequest();
      if (signal) {
        signal.addEventListener('abort', () => xhr.abort(), { once: true });
      }
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total, 'upload');
      });
      xhr.addEventListener('load', () => {
        let data = null;
        try { data = JSON.parse(xhr.responseText); } catch (_) { /* fall through */ }
        if (xhr.status === 401) {
          clearSession();
          reject(new Error('Session expired — please sign in again.'));
          return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
          const msg = (data && (data.error || data.detail)) || ('Upload failed (' + xhr.status + ')');
          reject(new Error(msg));
          return;
        }
        resolve(data);
      });
      xhr.addEventListener('error', () => reject(new Error('Network error during upload.')));
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled.')));
      xhr.open('POST', BASE + '/invoices');
      if (state.token) xhr.setRequestHeader('Authorization', 'Bearer ' + state.token);
      xhr.send(form);
      if (onProgress) onProgress(0, 'upload');
    });
  },

  async approveInvoice(invoiceId, lines) {
    // Server validates readiness; 422 carries { blockers }.
    return request('/invoices/' + encodeURIComponent(invoiceId) + '/approve', {
      method: 'POST',
      body: { lines },
    });
  },

  async getFinancials() {
    state.financials = await request('/financials');
    return state.financials;
  },

  importPos(file) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('file', file, file.name);
      const xhr = new XMLHttpRequest();
      xhr.addEventListener('load', () => {
        let data = null;
        try { data = JSON.parse(xhr.responseText); } catch (_) { /* fall through */ }
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new Error((data && data.error) || ('POS import failed (' + xhr.status + ')')));
          return;
        }
        resolve(data);
      });
      xhr.addEventListener('error', () => reject(new Error('Network error during POS import.')));
      xhr.open('POST', BASE + '/pos/import');
      if (state.token) xhr.setRequestHeader('Authorization', 'Bearer ' + state.token);
      xhr.send(form);
    });
  },

  async setRetail(productId, retailPrice) {
    return request('/products/' + encodeURIComponent(productId) + '/retail', {
      method: 'PATCH',
      body: { retail_price: retailPrice, retailPrice },
    });
  },

  async getHistory(productId) {
    const data = await request('/products/' + encodeURIComponent(productId) + '/history');
    return Array.isArray(data.history) ? data.history : (Array.isArray(data) ? data : []);
  },

  async calculate(unitCost, markupPct = 70) {
    return request('/calculate', { method: 'POST', body: { unitCost, markupPct } });
  },
};

/* ---------- data helpers (defensive field access; backend is source of truth) ---------- */

export function invoiceOf(line) {
  return line.pricing_invoices || line.invoice || {};
}

export function queueInvoices() {
  // Group needs_review lines by invoice -> packages on the review line.
  const map = new Map();
  for (const line of state.queue) {
    const id = line.invoice_id || invoiceOf(line).id || 'unknown';
    if (!map.has(id)) {
      const inv = invoiceOf(line);
      map.set(id, {
        id,
        number: inv.invoice_number || line.invoice_number || '—',
        date: inv.invoice_date || line.invoice_date || '',
        status: inv.status || 'needs_review',
        lines: [],
      });
    }
    map.get(id).lines.push(line);
  }
  return [...map.values()];
}

export function lineDesc(line) {
  return line.extracted_description || line.description || line.item_name || 'Unreadable line';
}

export function lineUnitCost(line) {
  const v = line.calculated_unit_cost != null ? line.calculated_unit_cost : line.unit_cost;
  return Number.isFinite(Number(v)) ? Number(v) : null;
}

export function lineTotal(line) {
  const v = Number(line.line_total);
  return Number.isFinite(v) ? v : null;
}

// Shelf rounding from the existing hub client: nearest .99.
export function roundRetail(p) {
  const b = Math.floor(p);
  return (p - b >= 0.5) ? b + 0.99 : Math.max(0.99, b - 1 + 0.99);
}

// Binding rule: retail = unit cost x 1.70, then shelf-round.
export function retailFromCost(cost) {
  if (!Number.isFinite(Number(cost))) return null;
  return roundRetail(Number(cost) * 1.70);
}

export function lineProposedRetail(line) {
  if (line.proposed_retail_price != null && Number.isFinite(Number(line.proposed_retail_price))) {
    return Number(line.proposed_retail_price);
  }
  const c = lineUnitCost(line);
  return c != null ? retailFromCost(c) : null;
}

export function productName(p) {
  return p.name || p.item_name || p.product_name || 'Unnamed product';
}

export function productCost(p) {
  const v = p.current_unit_cost != null ? p.current_unit_cost : p.unit_cost;
  return Number.isFinite(Number(v)) ? Number(v) : null;
}

export function productRetail(p) {
  const v = p.current_retail_price != null ? p.current_retail_price : p.retail_price;
  return Number.isFinite(Number(v)) ? Number(v) : null;
}

export function fmtMoney(v) {
  if (v == null || !Number.isFinite(Number(v))) return '—';
  return '$' + Number(v).toFixed(2);
}

export function fmtDate(s) {
  if (!s) return '';
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? String(s) : d.toLocaleDateString();
}
