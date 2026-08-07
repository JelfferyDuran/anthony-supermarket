const SUPABASE_URL = 'https://cbpdiiyzzmbavsymjysb.supabase.co';
// Supabase publishable keys are intentionally safe for browser clients.
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_RsaXnitzsl5NLMGLrWsfeA_JCJId6lk';
const API_BASE = import.meta.env.VITE_API_URL || `${SUPABASE_URL}/functions/v1/superkitchen`;
const STORAGE_KEY = 'anthony_superkitchen_staff_session_v1';

function normalizeSession(data) {
  if (!data?.access_token) return null;
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || '',
    expires_at: data.expires_at || Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600),
    user: data.user || null,
  };
}

function saveSession(session) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function authRequest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.msg || body?.message || body?.error_description || body?.error || `Auth failed (${res.status})`);
  return body;
}

export async function signIn(email, password) {
  const data = await authRequest('/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const session = normalizeSession(data);
  saveSession(session);
  return session;
}

export async function signUp(email, password) {
  const data = await authRequest('/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const session = normalizeSession(data);
  if (session) saveSession(session);
  return { session, user: data.user || null };
}

export async function refreshSession(force = false) {
  const current = readStoredSession();
  if (!current?.refresh_token) return current;
  const now = Math.floor(Date.now() / 1000);
  if (!force && Number(current.expires_at || 0) > now + 90) return current;

  const data = await authRequest('/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: current.refresh_token }),
  });
  const session = normalizeSession(data);
  saveSession(session);
  return session;
}

export async function signOut() {
  const current = readStoredSession();
  try {
    if (current?.access_token) {
      await authRequest('/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${current.access_token}` },
        body: '{}',
      });
    }
  } catch {
    // Local logout must still succeed if the remote session is already gone.
  } finally {
    saveSession(null);
  }
}

function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1];
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
}

export function sessionRole(session) {
  return decodeJwtPayload(session?.access_token || '')?.app_metadata?.role || null;
}

export function isStaffRole(role) {
  return ['kitchen', 'manager', 'admin'].includes(role);
}

async function staffFetch(path, options = {}) {
  const session = await refreshSession(false);
  if (!session?.access_token) throw new Error('Staff sign-in required');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(body?.error || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return body;
}

export async function listOrders() {
  return staffFetch('/api/orders');
}

export async function updateOrderStatus(orderId, status) {
  return staffFetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getOrderAudit(orderId) {
  return staffFetch(`/api/orders/${encodeURIComponent(orderId)}/audit`);
}
