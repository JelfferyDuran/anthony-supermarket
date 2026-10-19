/* Shared UI helpers for the 2D Pricing Hub: escaping, icons, toasts, small
   formatters. Every string that reaches innerHTML goes through esc(). */

export const $ = (id) => document.getElementById(id);

export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function num(v) {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// Money with thousands separators ($48,210.55). The 3D dock keeps api.js's.
export function fmtMoney(v) {
  const n = num(v);
  return n == null ? '—' : USD.format(n);
}

// Email local parts arrive lowercase ("maria.lopez"); show "Maria Lopez".
export function displayName(s) {
  return String(s || '').split(/[._-]+/).filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Operator';
}

export function fmtPct(v, digits = 1) {
  const n = num(v);
  return n == null ? '—' : n.toFixed(digits) + '%';
}

export function fmtInt(v) {
  const n = num(v);
  return n == null ? '—' : Math.round(n).toLocaleString();
}

export function plural(n, one, many) {
  return n + ' ' + (n === 1 ? one : (many || one + 's'));
}

export function ago(iso) {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '';
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  const d = Math.floor(s / 86400);
  return d === 1 ? 'yesterday' : d + 'd ago';
}

/* ---------- icons (inline SVG, 24px grid, stroke = currentColor) ---------- */
const PATHS = {
  today: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  review: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v2h6V3"/><path d="M9 11l2 2 4-4"/><path d="M9 17h6"/>',
  products: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  intake: '<path d="M4 13h4l2 3h4l2-3h4"/><path d="M4 13l2.5-8h11l2.5 8v6H4z"/>',
  vault: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
  me: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  upload: '<path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  x: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.6 4.5L20 16"/><path d="M20 20v-4h-4"/>',
  flame: '<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 .8 1.2 1.5 1.8 2.5 2C11 7.5 11 5 12 3z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  barcode: '<path d="M4 5v14"/><path d="M7 5v14"/><path d="M11 5v14"/><path d="M14 5v14"/><path d="M17 5v14"/><path d="M20 5v14"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4"/><path d="M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4"/><path d="M8 20h8"/>',
  logout: '<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h10"/>',
  cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5"/><path d="M12 12v9"/><path d="M12 12L4 7.5"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5"/><path d="M12 18h.01"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  undo: '<path d="M9 14l-5-5 5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
};

export function icon(name, cls = '') {
  return '<svg class="ic ' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (PATHS[name] || '') + '</svg>';
}

/* ---------- toasts ---------- */
// msg is trusted markup built by the caller from esc()'d values.
export function toast(msg, kind = '') {
  const box = $('toasts');
  if (!box) return;
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.setAttribute('role', kind === 'err' ? 'alert' : 'status');
  el.innerHTML = msg;
  box.appendChild(el);
  while (box.children.length > 3) box.firstElementChild.remove();
  setTimeout(() => el.classList.add('out'), 4200);
  setTimeout(() => el.remove(), 4700);
}

/* ---------- misc ---------- */
export function setBusy(btn, busy, label) {
  if (!btn) return;
  if (busy) {
    btn.dataset.label = btn.dataset.label || btn.innerHTML;
    btn.disabled = true;
    btn.classList.add('busy');
    if (label) btn.textContent = label;
  } else {
    btn.disabled = false;
    btn.classList.remove('busy');
    if (btn.dataset.label) { btn.innerHTML = btn.dataset.label; delete btn.dataset.label; }
  }
}

export function emptyState(iconName, title, body) {
  return '<div class="empty">' + icon(iconName, 'lg') +
    '<div class="empty-title">' + esc(title) + '</div>' +
    (body ? '<div class="empty-body">' + esc(body) + '</div>' : '') + '</div>';
}

export function priorityLabel(p) {
  return { critical: 'Urgent', high: 'Needs work', normal: 'On track', clear: 'Clear' }[p] || p;
}

export function healthTone(score) {
  if (score >= 90) return 'good';
  if (score >= 75) return 'ok';
  if (score >= 50) return 'warn';
  return 'bad';
}
