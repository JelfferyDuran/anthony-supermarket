/* Today — the home screen: integrity, live missions (ranked by urgency) and
   the team feed. Every number here comes from GET /game/state. */

import { esc, icon, ago, priorityLabel, healthTone, fmtInt, displayName } from '../ui.js';

const ORDER = { critical: 0, high: 1, normal: 2, clear: 3 };

function missionTarget(m) {
  if (m.key === 'review_line') return m.items && m.items.length ? '/review/' + m.items[0].id : '/review';
  if (m.key === 'rescue_intake') return '/intake';
  if (m.key === 'rule_guard') return '/products?f=rule';
  if (m.key === 'sales_feed') return '/vault';
  return '/today';
}

function missionCta(m) {
  if (m.done) return 'View';
  return {
    review_line: 'Start reviewing',
    rescue_intake: 'Rescue scans',
    rule_guard: 'Fix prices',
    sales_feed: 'Import sales',
  }[m.key] || 'Open';
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export function render(ctx, route, host) {
  const g = ctx.state.game;
  if (!g) {
    host.innerHTML = '<div class="card error-card">' + icon('alert') +
      '<div><b>Live missions are unavailable right now.</b><div class="muted">' +
      esc((ctx.state.loadErrors || []).join(' · ') || 'The game service did not answer.') + '</div></div></div>';
    return;
  }
  const p = g.player;
  const h = g.health;
  const missions = [...g.missions].sort((a, b) => ORDER[a.priority] - ORDER[b.priority]);
  const open = missions.filter((m) => !m.done).length;

  const comps = h.components.map((c) =>
    '<div class="meter-row">' +
      '<div class="meter-head"><span>' + esc(c.label) + '</span><span class="muted">' + c.score + '</span></div>' +
      '<div class="meter"><div class="meter-fill tone-' + healthTone(c.score) + '" style="width:' + Math.max(2, c.score) + '%"></div></div>' +
      '<div class="meter-detail">' + esc(c.detail) + '</div>' +
    '</div>'
  ).join('');

  const cards = missions.map((m) =>
    '<article class="mission prio-' + m.priority + (m.done ? ' done' : '') + '">' +
      '<div class="mission-top">' +
        '<span class="prio-tag">' + esc(priorityLabel(m.priority)) + '</span>' +
        (m.xpPotential ? '<span class="xp-chip">' + icon('bolt') + 'up to ' + fmtInt(m.xpPotential) + ' XP</span>' : '') +
      '</div>' +
      '<h3 class="mission-title">' + esc(m.title) + '</h3>' +
      '<div class="mission-count"><b>' + (m.done ? icon('check') : esc(String(m.count))) + '</b>' +
        '<span>' + esc(m.done ? 'Clear' : m.countLabel) + '</span></div>' +
      '<p class="mission-brief">' + esc(m.brief) + '</p>' +
      '<a class="btn ' + (m.done ? 'ghost' : 'primary') + ' block" href="#' + esc(missionTarget(m)) + '">' +
        esc(missionCta(m)) + icon('chevron') + '</a>' +
    '</article>'
  ).join('');

  const feed = (g.feed || []).slice(0, 6).map((e) =>
    '<li><span class="feed-who' + (e.you ? ' you' : '') + '">' + esc(e.you ? 'You' : displayName(e.name)) + '</span>' +
    '<span class="feed-what">' + esc(e.label) + '</span>' +
    '<span class="feed-xp">+' + e.xp + '</span>' +
    '<span class="feed-when">' + esc(ago(e.at)) + '</span></li>'
  ).join('');

  host.innerHTML =
    '<header class="page-head">' +
      '<h1>' + esc(greeting()) + ', ' + esc(displayName(p.name)) + '</h1>' +
      '<p class="muted">' + (open ? esc(open + ' mission' + (open === 1 ? '' : 's') + ' open') : 'Everything is clear') +
        ' · Dock integrity ' + h.score + ' (' + esc(h.status) + ')</p>' +
    '</header>' +
    (p.scoring ? '' :
      '<div class="notice">' + icon('alert') + '<span>You are using a shared operator key, so nothing you do earns XP. ' +
      'Sign in with your own manager account to level up.</span></div>') +
    ((ctx.state.loadErrors || []).length
      ? '<div class="notice warn">' + icon('alert') + '<span>Some data did not load: ' + esc(ctx.state.loadErrors.join(' · ')) + '</span></div>'
      : '') +
    '<div class="today-grid">' +
      '<section class="card integrity" aria-labelledby="intTitle">' +
        '<div class="integrity-head">' +
          '<div class="score-ring tone-' + healthTone(h.score) + '" style="--p:' + h.score + '">' +
            '<span class="score-num">' + h.score + '</span><span class="score-grade">' + esc(h.grade) + '</span></div>' +
          '<div><h2 id="intTitle">Dock integrity</h2><div class="muted">' + esc(h.status) +
          ' · one score for the whole pricing operation</div></div>' +
        '</div>' +
        comps +
      '</section>' +
      '<section class="missions" aria-label="Missions">' + cards + '</section>' +
    '</div>' +
    (feed
      ? '<section class="card"><h2 class="card-h">' + icon('bolt') + 'Dock radio</h2><ul class="feed">' + feed + '</ul></section>'
      : '');
}
