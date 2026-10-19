/* Me — player card (level, XP, streak, stats), badges with progress, the
   team leaderboard, how XP is earned, and account controls. */

import { esc, icon, ago, fmtInt, displayName } from '../ui.js';

let board = 'week';

export function render(ctx, route, host) {
  const g = ctx.state.game;
  if (!g) {
    host.innerHTML = '<div class="card">Your player card is unavailable right now.</div>' + accountHtml(ctx, null);
    wireAccount(ctx, host);
    return;
  }
  const p = g.player;
  const pct = Math.round((p.progress || 0) * 100);
  const stats = p.stats || {};
  const xp = (g.rules && g.rules.xp) || {};
  const rows = board === 'week' ? g.leaderboard.week : g.leaderboard.allTime;

  host.innerHTML =
    '<section class="card player-card">' +
      '<div class="level-ring" style="--p:' + pct + '"><span class="lv-k">LV</span><span class="lv-n">' + p.level + '</span></div>' +
      '<div class="player-main">' +
        '<h1>' + esc(displayName(p.name)) + '</h1>' +
        '<div class="player-title">' + esc(p.title || '') + '</div>' +
        '<div class="xpbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Progress to next level">' +
          '<div class="xpbar-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="muted small">' + fmtInt(p.xp) + ' XP · ' +
          (p.nextAt ? fmtInt(p.nextAt - p.xp) + ' to ' + esc(p.nextTitle) : 'top rank reached') + '</div>' +
      '</div>' +
    '</section>' +
    (p.scoring ? '' : '<div class="notice">' + icon('alert') + '<span>Shared operator keys earn no XP. Sign in with your own manager account to level up.</span></div>') +
    '<div class="kpis small">' +
      kpi(icon('flame') + 'Streak', (p.streak ? p.streak.current : 0) + ' days', 'best ' + (p.streak ? p.streak.best : 0)) +
      kpi(icon('bolt') + 'Today', fmtInt(p.todayXp) + ' XP') +
      kpi(icon('bolt') + 'This week', fmtInt(p.weekXp) + ' XP') +
      kpi(icon('review') + 'Invoices approved', fmtInt(stats.approvals), fmtInt(stats.perfect) + ' penny-perfect') +
      kpi(icon('alert') + 'Lines caught', fmtInt(stats.exceptions)) +
      kpi(icon('products') + 'Price fixes', fmtInt(stats.edits)) +
    '</div>' +
    '<section class="card"><h2 class="card-h">' + icon('trophy') + 'Badges</h2><ul class="badges">' +
      (p.badges || []).map((b) => {
        const prog = b.goal ? Math.min(100, Math.round((b.value / b.goal) * 100)) : 0;
        return '<li class="badge' + (b.earned ? ' earned' : '') + '">' +
          '<span class="badge-ic">' + icon(b.earned ? 'trophy' : 'shield') + '</span>' +
          '<span class="badge-body"><b>' + esc(b.name) + '</b><span class="muted small">' + esc(b.desc) + '</span>' +
          (b.earned
            ? '<span class="small txt-good">Earned' + (b.earnedAt ? ' ' + esc(ago(b.earnedAt)) : '') + '</span>'
            : '<span class="mini-bar"><span style="width:' + prog + '%"></span></span><span class="muted small">' + b.value + ' / ' + b.goal + '</span>') +
          '</span></li>';
      }).join('') + '</ul></section>' +
    '<section class="card"><div class="card-h-row"><h2 class="card-h">' + icon('trophy') + 'Leaderboard</h2>' +
      '<div class="seg" role="tablist">' +
        '<button type="button" role="tab" aria-selected="' + (board === 'week') + '" class="seg-btn' + (board === 'week' ? ' on' : '') + '" data-board="week">This week</button>' +
        '<button type="button" role="tab" aria-selected="' + (board === 'all') + '" class="seg-btn' + (board === 'all' ? ' on' : '') + '" data-board="all">All time</button>' +
      '</div></div>' +
      (rows.length ? '<ol class="board">' + rows.map((r, i) =>
        '<li class="' + (r.you ? 'you' : '') + '"><span class="rank">' + (i + 1) + '</span>' +
        '<span class="who">' + esc(displayName(r.name) + (r.you ? ' (you)' : '')) + '<span class="muted small"> · Lv ' + r.level + '</span></span>' +
        '<span class="mono">' + fmtInt(board === 'week' ? r.weekXp : r.xp) + ' XP</span></li>').join('') + '</ol>'
        : '<p class="muted">No XP earned ' + (board === 'week' ? 'this week' : 'yet') + '. Approve an invoice to get on the board.</p>') +
    '</section>' +
    '<section class="card"><h2 class="card-h">' + icon('bolt') + 'How XP is earned</h2><ul class="xp-guide">' +
      guide('Approve an invoice', (xp.invoiceApproved || 0) + ' + ' + (xp.perApprovedLine || 0) + ' per line') +
      guide('…that reconciles to the cent', '+' + (xp.pennyPerfect || 0)) +
      guide('Close a delivery that never came', xp.invoiceClosed) +
      guide('Catch a short or wrong line', xp.lineException) +
      guide('Fix or set a retail price', xp.retailEdit) +
      guide('Import POS sales', xp.posImport) +
    '</ul><p class="muted small">XP comes from the audit trail: who approved, changed or imported what. It can\'t be granted from the browser.</p></section>' +
    accountHtml(ctx, p);

  host.querySelectorAll('[data-board]').forEach((b) => b.addEventListener('click', () => { board = b.dataset.board; ctx.render(); }));
  wireAccount(ctx, host);
}

function kpi(label, value, sub) {
  return '<div class="kpi"><span class="kpi-label">' + label + '</span><b class="kpi-val">' + esc(value) + '</b>' +
    (sub ? '<span class="kpi-sub muted small">' + esc(sub) + '</span>' : '') + '</div>';
}

function guide(what, xp) {
  return '<li><span>' + esc(what) + '</span><b class="mono">' + esc(String(xp)) + ' XP</b></li>';
}

function accountHtml(ctx, p) {
  return '<section class="card"><h2 class="card-h">' + icon('me') + 'Account</h2>' +
    '<p class="muted">' + esc((p && p.email) || (ctx.state.user && ctx.state.user.email) || 'Signed in') + '</p>' +
    '<div class="btn-row">' +
      '<a class="btn ghost" href="/pricing-hub/">' + icon('cube') + 'Open the 3D dock</a>' +
      '<button type="button" class="btn danger" data-signout>' + icon('logout') + 'Sign out</button>' +
    '</div></section>';
}

function wireAccount(ctx, host) {
  const b = host.querySelector('[data-signout]');
  if (b) b.addEventListener('click', () => ctx.signOut());
}
