/* Pricing Hub — 2D operations console.
   One fast, flat interface over the same API and session as the 3D Loading
   Dock (/pricing-hub/). Hash routes keep back-button and deep links working:
     #/today  #/review  #/review/<invoiceId>  #/products  #/products/<id>
     #/intake  #/vault  #/me
   Everything the game shows comes from GET /game/state; the browser never
   computes XP. */

import { api, state, isAuthed, clearSession, queueInvoices } from '../../pricing-hub/js/api.js';
import { $, esc, icon, toast, healthTone, displayName } from './ui.js';
import * as today from './views/today.js';
import * as review from './views/review.js';
import * as products from './views/products.js';
import * as intake from './views/intake.js';
import * as vault from './views/vault.js';
import * as me from './views/me.js';

const VIEWS = { today, review, products, intake, vault, me };
const NAV = [
  { key: 'today', label: 'Today', icon: 'today' },
  { key: 'review', label: 'Review', icon: 'review' },
  { key: 'products', label: 'Products', icon: 'products' },
  { key: 'intake', label: 'Intake', icon: 'intake' },
  { key: 'vault', label: 'Vault', icon: 'vault' },
];

/* ---------- routing ---------- */
function parseRoute() {
  const raw = (location.hash || '').replace(/^#/, '') || '/today';
  const [pathPart, queryPart] = raw.split('?');
  const parts = pathPart.split('/').filter(Boolean).map(decodeURIComponent);
  const name = VIEWS[parts[0]] ? parts[0] : 'today';
  return { name, id: parts[1] || null, query: new URLSearchParams(queryPart || ''), raw };
}

function go(path, { replace = false } = {}) {
  const hash = '#' + (path.startsWith('/') ? path : '/' + path);
  if (location.hash === hash) { render(); return; }
  if (replace) { history.replaceState(null, '', hash); render(); }
  else location.hash = hash;
}

/* ---------- shared working state (survives re-renders) ---------- */
const work = {
  matches: new Map(),   // invoice line id -> { id, name } chosen product
  edits: new Map(),     // invoice line id -> { cases, cost, retail }
  exc: new Map(),       // invoice line id -> 'short' | 'rejected'
};

/* ---------- data refresh ---------- */
let lastRefresh = 0;
let refreshing = null;

function isAuthError(e) {
  return e && /session expired|401/i.test(e.message || '');
}

async function refreshAll() {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const prevGame = state.game;
    const results = await Promise.allSettled([
      api.getProducts(),
      api.getQueue(),
      api.getFinancials(),
      api.getConfig(),
      api.getGameState(),
    ]);
    const failed = results.filter((r) => r.status === 'rejected').map((r) => r.reason);
    if (failed.some(isAuthError) || !isAuthed()) {
      showSignin('Your session expired — please sign in again.');
      throw new Error('signed out');
    }
    lastRefresh = Date.now();
    state.loadErrors = failed.map((e) => e.message);
    celebrate(prevGame, state.game);
    renderShell();
    return results;
  })();
  try { return await refreshing; } finally { refreshing = null; }
}

// After a write: refresh what changed plus the game, then celebrate.
async function afterAction({ products: p = false, queue = false, financials = false } = {}) {
  const prevGame = state.game;
  const calls = [api.getGameState()];
  if (p) calls.push(api.getProducts());
  if (queue) calls.push(api.getQueue());
  if (financials) calls.push(api.getFinancials());
  const results = await Promise.allSettled(calls);
  if (results.some((r) => r.status === 'rejected' && isAuthError(r.reason)) || !isAuthed()) {
    showSignin('Your session expired — please sign in again.');
    return;
  }
  celebrate(prevGame, state.game);
  renderShell();
}

/* ---------- game feedback: diff two server snapshots ---------- */
function celebrate(prev, next) {
  if (!prev || !next || !prev.player || !next.player) return;
  if (prev.player.email !== next.player.email) return;
  const gained = (next.player.xp || 0) - (prev.player.xp || 0);
  if (gained > 0) xpFloat('+' + gained + ' XP');
  if ((next.player.level || 0) > (prev.player.level || 0)) showLevelUp(next.player);
  const had = new Set((prev.player.badges || []).filter((b) => b.earned).map((b) => b.key));
  for (const b of next.player.badges || []) {
    if (b.earned && !had.has(b.key)) toast(icon('trophy') + ' <b>Badge unlocked</b> — ' + esc(b.name), 'ok');
  }
  const wasOpen = new Set((prev.missions || []).filter((m) => !m.done).map((m) => m.key));
  for (const m of next.missions || []) {
    if (m.done && wasOpen.has(m.key)) toast(icon('check') + ' <b>Mission clear</b> — ' + esc(m.title), 'ok');
  }
}

function xpFloat(text) {
  const box = $('xpFloats');
  const chip = $('playerChip');
  if (!box || !chip) return;
  const r = chip.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'xp-float';
  el.textContent = text;
  el.style.left = Math.round(r.left + r.width / 2) + 'px';
  el.style.top = Math.round(r.bottom + 4) + 'px';
  box.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

function showLevelUp(player) {
  $('luNum').textContent = String(player.level);
  $('luTitle').textContent = player.title || '';
  $('luNext').textContent = player.nextAt
    ? (player.nextAt - player.xp) + ' XP to ' + player.nextTitle
    : 'Top rank reached.';
  $('levelUp').classList.remove('hidden');
  $('luClose').focus();
}

/* ---------- shell ---------- */
function navCounts() {
  const g = state.game;
  const m = (key) => (g && g.missions ? g.missions.find((x) => x.key === key) : null);
  const reviewN = queueInvoices().length;
  const rescue = m('rescue_intake');
  const rule = m('rule_guard');
  const sales = m('sales_feed');
  return {
    review: reviewN,
    intake: rescue ? rescue.count : 0,
    products: rule ? rule.count : 0,
    vault: sales && !sales.done ? 1 : 0,
    today: g && g.missions ? g.missions.filter((x) => !x.done).length : 0,
  };
}

function renderShell() {
  const g = state.game;
  const p = g && g.player;
  const route = parseRoute();
  const counts = navCounts();

  // Player strip
  if (p) {
    $('phLevel').textContent = String(p.level);
    $('phName').textContent = displayName(p.name);
    $('phTitle').textContent = p.title || '';
    $('phBarFill').style.width = Math.round((p.progress || 0) * 100) + '%';
    $('phXp').textContent = p.nextAt ? p.xp + ' / ' + p.nextAt + ' XP' : p.xp + ' XP';
    $('phStreak').textContent = String(p.streak ? p.streak.current : 0);
    $('playerChip').setAttribute('aria-label',
      'Level ' + p.level + ' ' + (p.title || '') + ', ' + p.xp + ' XP. Open your player card.');
  }
  if (g && g.health) {
    const h = g.health;
    $('phHealth').textContent = String(h.score);
    $('healthChip').className = 'health-chip tone-' + healthTone(h.score);
    $('healthChip').setAttribute('aria-label', 'Dock integrity ' + h.score + ', ' + h.status);
    $('healthChip').title = 'Dock integrity · ' + h.grade + ' · ' + h.status;
  }

  // Nav
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const key = a.dataset.nav;
    const active = key === route.name;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    const badge = a.querySelector('.nav-badge');
    const n = counts[key] || 0;
    if (badge) {
      badge.textContent = n > 99 ? '99+' : String(n);
      badge.classList.toggle('hidden', n === 0);
    }
  });
  document.title = (counts.review ? '(' + counts.review + ') ' : '') + 'Pricing Hub · Anthony\'s';
}

function buildNav() {
  $('nav').innerHTML = NAV.map((n) =>
    '<a href="#/' + n.key + '" data-nav="' + n.key + '" class="nav-item">' +
      '<span class="nav-ic">' + icon(n.icon) + '</span>' +
      '<span class="nav-label">' + n.label + '</span>' +
      '<span class="nav-badge hidden"></span></a>'
  ).join('');
}

/* ---------- view rendering ---------- */
let currentKey = '';
let returnTo = null;
function render() {
  if (!isAuthed()) { showSignin(); return; }
  const route = parseRoute();
  const view = VIEWS[route.name];
  const host = $('view');
  const key = route.raw;
  const sameView = key === currentKey;
  currentKey = key;
  renderShell();
  try {
    view.render(ctx, route, host);
  } catch (e) {
    console.error(e);
    host.innerHTML = '<div class="card error-card">' + icon('alert') +
      '<div><b>Something went wrong showing this page.</b><div class="muted">' + esc(e.message) + '</div></div></div>';
  }
  if (!sameView) {
    window.scrollTo(0, 0);
    host.focus({ preventScroll: true });
  }
}

function signOut() {
  api.signOut();
  work.matches.clear(); work.edits.clear(); work.exc.clear();
  returnTo = null;
  showSignin('Signed out.');
}

const ctx = { api, state, work, go, render, refreshAll, afterAction, toast, signOut };

/* ---------- sign-in ---------- */
// A preview deployment can serve this page without the server-only pricing
// environment. The public GET /config says so (storeConfigured: false); say
// that instead of letting it look like a wrong password. Same check as the
// 3D dock's boot.js.
function signinUnavailable() {
  return Boolean(state.config && state.config.storeConfigured === false);
}

async function probeSignin() {
  if (!state.config) {
    try { await api.getConfig(); } catch (_) { return; } // sign-in reports it
  }
  if (signinUnavailable() && !$('signin').classList.contains('hidden')) {
    $('signinError').textContent = 'This preview is not connected to Pricing Hub authentication. ' +
      'Use the production hub or configure the preview environment first.';
  }
}

function showSignin(msg) {
  clearSession();
  state.game = null;
  returnTo = returnTo || (location.hash && !/^#\/?$/.test(location.hash) ? location.hash : null);
  $('app').classList.add('hidden');
  $('signin').classList.remove('hidden');
  $('boot').classList.add('hidden');
  $('signinError').textContent = msg || '';
  setTimeout(() => $('signinEmail').focus(), 30);
  probeSignin();
}

async function doSignin(e) {
  e.preventDefault();
  const email = $('signinEmail').value.trim();
  const password = $('signinPassword').value;
  const err = $('signinError');
  err.textContent = '';
  if (signinUnavailable()) {
    err.textContent = 'This preview is not connected to Pricing Hub authentication. Your credentials were not evaluated.';
    return;
  }
  if (!email || !password) { err.textContent = 'Enter your email and password.'; return; }
  const btn = $('signinBtn');
  btn.disabled = true;
  btn.textContent = 'Signing in…';
  try {
    await api.login(email, password);
    $('signinPassword').value = '';
    await enterApp();
    toast('Signed in as <b>' + esc(email) + '</b> · your session lasts 30 days.', 'ok');
  } catch (ex) {
    if (ex.message !== 'signed out') err.textContent = ex.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign in';
  }
}

async function enterApp() {
  $('signin').classList.add('hidden');
  $('app').classList.remove('hidden');
  $('view').innerHTML = '<div class="skeleton-stack"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton short"></div></div>';
  await refreshAll();
  $('boot').classList.add('hidden');
  if (returnTo) { const r = returnTo; returnTo = null; history.replaceState(null, '', r); }
  currentKey = '';
  render();
}

/* ---------- boot ---------- */
async function main() {
  buildNav();
  $('signinForm').addEventListener('submit', doSignin);
  $('luClose').addEventListener('click', () => $('levelUp').classList.add('hidden'));
  $('levelUp').addEventListener('click', (e) => { if (e.target.id === 'levelUp') $('levelUp').classList.add('hidden'); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('levelUp').classList.contains('hidden')) $('levelUp').classList.add('hidden');
  });
  window.addEventListener('hashchange', render);

  // Coming back to the tab after a while: refresh numbers, keep any
  // half-typed review work on screen.
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState !== 'visible' || !isAuthed()) return;
    if (Date.now() - lastRefresh < 90_000) return;
    try {
      await refreshAll();
      const r = parseRoute();
      if (!r.id && (r.name === 'today' || r.name === 'review' || r.name === 'intake')) render();
    } catch (_) { /* signed out or offline; the next action reports it */ }
  });

  if (!isAuthed()) { showSignin(); return; }
  try {
    await enterApp();
  } catch (e) {
    if (e.message === 'signed out') return;
    $('boot').classList.add('hidden');
    $('app').classList.remove('hidden');
    $('view').innerHTML = '<div class="card error-card">' + icon('alert') +
      '<div><b>The hub could not load.</b><div class="muted">' + esc(e.message) + '</div>' +
      '<button class="btn" id="bootRetry">' + icon('refresh') + 'Try again</button></div></div>';
    $('bootRetry').addEventListener('click', () => location.reload());
  }
}

main().catch((e) => {
  console.error('Hub boot failed:', e);
  const b = $('boot');
  if (b) b.innerHTML = '<div class="boot-fail">The hub could not start. ' + esc(e.message) +
    ' <a href="">Reload</a></div>';
});

