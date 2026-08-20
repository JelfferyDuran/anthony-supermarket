const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const LEVELS = [
  { name: 'Shelf Stocker', xp: 0 },
  { name: 'Price Runner', xp: 150 },
  { name: 'Margin Scout', xp: 400 },
  { name: 'Markup Captain', xp: 800 },
  { name: 'Margin Legend', xp: 1500 },
];

const BADGES = [
  { id: 'first_ocr', name: 'First OCR', xp: 40, check: (stats) => stats.ocrCount >= 1 },
  { id: 'ten_invoices', name: '10 Invoices', xp: 120, check: (stats) => stats.invoiceCount >= 10 },
  { id: 'hundred_70_margin', name: '100 at 70%', xp: 180, check: (stats) => stats.approvedAt70 >= 100 },
  { id: 'perfect_scan', name: 'Perfect Scan', xp: 90, check: (stats) => stats.perfectScanCount >= 1 },
  { id: 'weekend_warrior', name: 'Weekend Warrior', xp: 75, check: (stats) => stats.weekendActionCount >= 1 },
];

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

function hashText(text) {
  return crypto.createHash('sha256').update(String(text)).digest('hex');
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function round2(value) {
  return Math.round(safeNumber(value) * 100) / 100;
}

function targetRetail(cost) {
  return round2(safeNumber(cost) * 1.7);
}

function grossMargin(cost, retail) {
  const c = safeNumber(cost);
  const r = safeNumber(retail);
  if (!r) return null;
  return round2(((r - c) / r) * 100);
}

function markupPercent(cost, retail) {
  const c = safeNumber(cost);
  const r = safeNumber(retail);
  if (!c) return null;
  return round2(((r - c) / c) * 100);
}

function levelFromXp(xp) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xp) current = level;
  }
  return current;
}

function createDefaultState() {
  return {
    catalog: [],
    vendors: {},
    activity: [],
    auditLog: [],
    itemHistory: {},
    xpByUser: {},
    badgesByUser: {},
    badgeLedger: [],
    streaksByUser: {},
    missionsByUser: {},
    invoices: [],
    sessions: {},
    syncEvents: [],
    nextAuditId: 1,
    nextActivityId: 1,
    nextInvoiceId: 1,
    nextBadgeId: 1,
  };
}

function normalizeItem(raw) {
  const cost = safeNumber(raw.costPerUnit ?? raw.cost ?? 0);
  const retail = safeNumber(raw.retail ?? targetRetail(cost));
  const updatedAt = raw.updatedAt || raw.verifiedAt || null;
  const status = raw.status || (raw.internal ? 'internal' : 'pending');
  return {
    id: Number.isFinite(Number(raw.id)) ? Number(raw.id) : safeNumber(raw.id, 0),
    itemNo: String(raw.itemNo ?? '—'),
    name: String(raw.name ?? raw.nombre ?? 'Unnamed'),
    cat: String(raw.cat ?? raw.category ?? 'Uncategorized'),
    vendor: String(raw.vendor ?? 'Unknown'),
    invoice: String(raw.invoice ?? ''),
    boxes: safeNumber(raw.boxes, 1),
    boxPrice: round2(raw.boxPrice ?? raw.box_cost ?? 0),
    units: safeNumber(raw.units, 1),
    costPerUnit: round2(cost),
    retail: round2(retail),
    internal: Boolean(raw.internal),
    flagged: Boolean(raw.flagged),
    status,
    approvedBy: raw.approvedBy || null,
    verifiedAt: updatedAt,
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
    sourceSha256: raw.sourceSha256 || null,
    duplicateOf: raw.duplicateOf || null,
    notes: raw.notes || '',
  };
}

function makeAuditEntry({ type, actor, itemId = null, oldValue = null, newValue = null, meta = {} }) {
  return {
    id: null,
    type,
    actor: actor || { email: 'system', role: 'system' },
    itemId,
    oldValue,
    newValue,
    meta,
    createdAt: nowIso(),
  };
}

function dayCountsAsStreak(actionType) {
  return actionType === 'approve' || actionType === 'invoice' || actionType === 'sync' || actionType === 'mission';
}

class PricingHubStore {
  constructor({ statePath, seed }) {
    this.statePath = statePath;
    this.seed = seed || { vendors: {}, items: [] };
    this.state = this.loadState();
    this.ensureSeeded();
  }

  loadState() {
    try {
      if (this.statePath && fs.existsSync(this.statePath)) {
        const parsed = JSON.parse(fs.readFileSync(this.statePath, 'utf8'));
        return { ...createDefaultState(), ...parsed };
      }
    } catch {
      // fall through to default
    }
    return createDefaultState();
  }

  persist() {
    if (!this.statePath) return;
    const dir = path.dirname(this.statePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
  }

  ensureSeeded() {
    if (this.state.catalog.length) return;
    this.bootstrapCatalog({
      vendors: this.seed.vendors || {},
      items: this.seed.items || [],
      actor: { email: 'seed', role: 'system' },
      source: 'embedded-html',
    });
  }

  bootstrapCatalog({ vendors = {}, items = [], actor = { email: 'system', role: 'system' }, source = 'bootstrap' }) {
    const normalized = items.map(normalizeItem);
    this.state.vendors = vendors;
    this.state.catalog = normalized;
    this.state.syncEvents.push({
      id: this.state.syncEvents.length + 1,
      type: 'bootstrap',
      source,
      actor,
      count: normalized.length,
      createdAt: nowIso(),
      sha256: hashText(JSON.stringify({ vendors, items: normalized })),
    });
    this.recordActivity({
      type: 'bootstrap',
      actor,
      meta: { source, catalogSize: normalized.length },
    });
    this.persist();
    return this.getDashboard(actor);
  }

  getCatalogItem(itemId) {
    const numericId = Number(itemId);
    return this.state.catalog.find((item) => item.id === numericId);
  }

  computeStats(actor = { email: 'system', role: 'system' }) {
    const userKey = actor.email || 'system';
    const streak = this.state.streaksByUser[userKey] || { current: 0, best: 0, lastActiveDate: null, days: [] };
    const badges = this.state.badgesByUser[userKey] || [];
    const total = this.state.catalog.length;
    const approvedItems = this.state.catalog.filter((item) => item.status === 'approved').length;
    const verifiedItems = this.state.catalog.filter((item) => item.verifiedAt).length;
    const approvedAt70 = this.state.catalog.filter((item) => {
      const m = markupPercent(item.costPerUnit, item.retail);
      return item.status === 'approved' && m !== null && m >= 70;
    }).length;
    const invoiceCount = this.state.invoices.length;
    const ocrCount = this.state.syncEvents.filter((event) => event.type === 'ocr').length;
    const perfectScanCount = this.state.syncEvents.filter((event) => event.type === 'csv_dry_run' && event.meta && event.meta.errorCount === 0).length;
    const weekendActionCount = this.state.activity.filter((entry) => {
      const day = new Date(entry.createdAt).getDay();
      return day === 0 || day === 6;
    }).length;
    const freshnessDays = this.state.catalog
      .map((item) => {
        const ref = item.verifiedAt || item.updatedAt || item.createdAt;
        if (!ref) return null;
        const diff = Date.now() - new Date(ref).getTime();
        return diff / 86400000;
      })
      .filter((value) => value !== null);
    const freshness = freshnessDays.length
      ? round2(freshnessDays.reduce((sum, value) => sum + value, 0) / freshnessDays.length)
      : null;
    const vendorFreshness = Object.entries(
      this.state.catalog.reduce((acc, item) => {
        const ref = item.verifiedAt || item.updatedAt || item.createdAt;
        const days = ref ? round2((Date.now() - new Date(ref).getTime()) / 86400000) : null;
        if (!acc[item.vendor]) acc[item.vendor] = [];
        if (days !== null) acc[item.vendor].push(days);
        return acc;
      }, {})
    ).map(([vendor, values]) => ({
      vendor,
      averageDaysSinceVerification: values.length ? round2(values.reduce((sum, value) => sum + value, 0) / values.length) : null,
      itemCount: this.state.catalog.filter((item) => item.vendor === vendor).length,
    }));

    return {
      xp: this.getXp(actor),
      level: levelFromXp(this.getXp(actor)),
      streak,
      badges,
      totals: {
        items: total,
        approvedItems,
        verifiedItems,
        approvedAt70,
        invoiceCount,
        ocrCount,
        perfectScanCount,
        weekendActionCount,
      },
      freshness,
      vendorFreshness,
      coverage: {
        marginCoverage: total ? round2((approvedItems / total) * 100) : 0,
        syncCoverage: total ? round2((verifiedItems / total) * 100) : 0,
      },
    };
  }

  getXp(actor = { email: 'system', role: 'system' }) {
    const userKey = actor.email || 'system';
    return this.state.xpByUser[userKey] || 0;
  }

  addXp(actor, amount, reason, meta = {}) {
    const userKey = actor.email || 'system';
    if (!this.state.xpByUser[userKey]) this.state.xpByUser[userKey] = 0;
    this.state.xpByUser[userKey] += amount;
    const currentXp = this.getXp(actor);
    const entry = {
      id: this.state.nextBadgeId++,
      type: 'xp',
      actor,
      reason,
      xp: amount,
      runningXp: currentXp,
      createdAt: nowIso(),
      meta,
    };
    this.recordActivity({ type: 'xp', actor, meta: { reason, amount, ...meta } });
    return entry;
  }

  recordActivity({ type, actor, itemId = null, oldValue = null, newValue = null, meta = {} }) {
    const entry = makeAuditEntry({ type, actor, itemId, oldValue, newValue, meta });
    entry.id = this.state.nextAuditId++;
    this.state.auditLog.push(entry);
    this.state.activity.push({ ...entry, id: this.state.nextActivityId++ });
    if (dayCountsAsStreak(type)) {
      this.bumpStreak(actor);
    }
    this.persist();
    return entry;
  }

  bumpStreak(actor) {
    const userKey = actor.email || 'system';
    const key = todayKey();
    const current = this.state.streaksByUser[userKey] || { current: 0, best: 0, lastActiveDate: null, days: [] };
    if (current.lastActiveDate === key) return current;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = todayKey(yesterday);
    current.current = current.lastActiveDate === yesterdayKey ? current.current + 1 : 1;
    current.best = Math.max(current.best, current.current);
    current.lastActiveDate = key;
    if (!current.days.includes(key)) current.days.push(key);
    this.state.streaksByUser[userKey] = current;
    return current;
  }

  checkBadges(actor) {
    const stats = this.computeStats(actor).totals;
    const userKey = actor.email || 'system';
    if (!this.state.badgesByUser[userKey]) this.state.badgesByUser[userKey] = [];
    const currentBadges = this.state.badgesByUser[userKey];
    const unlocked = [];

    for (const badge of BADGES) {
      const already = currentBadges.some((entry) => entry.id === badge.id);
      if (!already && badge.check(stats)) {
        const awarded = {
          id: badge.id,
          name: badge.name,
          xp: badge.xp,
          createdAt: nowIso(),
        };
        currentBadges.push(awarded);
        unlocked.push(awarded);
        this.state.badgeLedger.push({
          id: this.state.nextBadgeId++,
          badgeId: badge.id,
          badgeName: badge.name,
          actor,
          createdAt: awarded.createdAt,
        });
        this.addXp(actor, badge.xp, `badge:${badge.id}`, { badgeId: badge.id });
        this.recordActivity({
          type: 'badge_unlock',
          actor,
          meta: { badgeId: badge.id, badgeName: badge.name, xp: badge.xp },
        });
      }
    }

    if (unlocked.length) this.persist();
    return unlocked;
  }

  getDashboard(actor = { email: 'system', role: 'system' }) {
    const stats = this.computeStats(actor);
    const level = stats.level;
    return {
      ok: true,
      dashboard: {
        xp: stats.xp,
        level,
        nextLevel: LEVELS.find((entry) => entry.xp > level.xp) || null,
        streak: stats.streak,
        badges: stats.badges,
        totals: stats.totals,
        freshness: stats.freshness,
        vendorFreshness: stats.vendorFreshness,
        coverage: stats.coverage,
        missions: this.getMissionCard(actor),
        activity: this.state.activity.slice(-12).reverse(),
      },
    };
  }

  getMissionCard(actor) {
    const userKey = actor.email || 'system';
    const reviewQueue = this.state.catalog.filter((item) => item.status !== 'approved');
    const pendingLines = reviewQueue.length;
    const today = todayKey();
    const existing = this.state.missionsByUser[userKey];
    if (existing && existing.day === today) return existing;
    const mission = {
      id: `mission-${today}`,
      day: today,
      title: pendingLines >= 3 ? 'Review 3 pending lines' : 'Upload an invoice',
      detail: pendingLines >= 3 ? `${Math.min(3, pendingLines)} lines ready for approval` : 'Bring in one invoice to unlock XP',
      xp: 35,
      completedAt: null,
    };
    this.state.missionsByUser[userKey] = mission;
    return mission;
  }

  completeMission(actor, missionId) {
    const userKey = actor.email || 'system';
    const mission = this.getMissionCard(actor);
    if (mission.id !== missionId || mission.completedAt) {
      return mission;
    }
    mission.completedAt = nowIso();
    this.state.missionsByUser[userKey] = mission;
    this.addXp(actor, mission.xp, `mission:${mission.id}`, { missionId });
    this.recordActivity({ type: 'mission', actor, meta: { missionId, xp: mission.xp } });
    this.persist();
    return mission;
  }

  listCatalog({
    query = '',
    vendor = '',
    status = '',
    page = 1,
    limit = 25,
    sort = 'updatedAt',
    direction = 'desc',
  } = {}) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 25));
    const q = String(query || '').trim().toLowerCase();
    let rows = [...this.state.catalog];
    if (vendor) rows = rows.filter((item) => item.vendor === vendor);
    if (status) rows = rows.filter((item) => item.status === status);
    if (q) {
      rows = rows.filter((item) =>
        [item.name, item.vendor, item.cat, item.itemNo, String(item.id)].some((value) =>
          String(value || '').toLowerCase().includes(q)
        )
      );
    }

    const dir = direction === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      if (typeof av === 'number' && typeof bv === 'number') return dir * (av - bv);
      return dir * String(av || '').localeCompare(String(bv || ''));
    });

    const total = rows.length;
    const start = (pageNum - 1) * limitNum;
    const paged = rows.slice(start, start + limitNum);
    return {
      rows: paged,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.max(1, Math.ceil(total / limitNum)),
      },
    };
  }

  getReviewQueue(opts = {}) {
    return this.listCatalog({ ...opts, status: opts.status || 'pending' });
  }

  getMarginWatch() {
    const rows = this.state.catalog
      .filter((item) => !item.internal)
      .map((item) => {
        const markup = markupPercent(item.costPerUnit, item.retail);
        const target = targetRetail(item.costPerUnit);
        const offTarget = item.retail < target || item.retail > round2(item.costPerUnit * 2.5);
        return {
          ...item,
          targetRetail: target,
          markupPercent: markup,
          offTarget,
          marginHealth: markup === null ? null : Math.max(0, Math.min(100, round2((markup / 70) * 100))),
        };
      })
      .filter((item) => item.offTarget || (item.markupPercent !== null && item.markupPercent < 70));

    return {
      rows: rows.sort((a, b) => (a.markupPercent || 0) - (b.markupPercent || 0)),
      meta: { count: rows.length },
    };
  }

  getActivityLog({ query = '', page = 1, limit = 25 } = {}) {
    const q = String(query || '').trim().toLowerCase();
    const rows = q
      ? this.state.activity.filter((entry) => JSON.stringify(entry).toLowerCase().includes(q))
      : [...this.state.activity];
    const total = rows.length;
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 25));
    const pageNum = Math.max(1, Number(page) || 1);
    const start = (pageNum - 1) * limitNum;
    return {
      rows: rows.slice(start, start + limitNum),
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.max(1, Math.ceil(total / limitNum)),
      },
    };
  }

  getAuditLog({ query = '', page = 1, limit = 25 } = {}) {
    const q = String(query || '').trim().toLowerCase();
    const rows = q
      ? this.state.auditLog.filter((entry) => JSON.stringify(entry).toLowerCase().includes(q))
      : [...this.state.auditLog];
    const total = rows.length;
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 25));
    const pageNum = Math.max(1, Number(page) || 1);
    const start = (pageNum - 1) * limitNum;
    return {
      rows: rows.slice(start, start + limitNum),
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.max(1, Math.ceil(total / limitNum)),
      },
    };
  }

  getItemHistory(itemId) {
    const key = String(itemId);
    return {
      rows: this.state.itemHistory[key] || [],
      meta: { itemId: key, count: (this.state.itemHistory[key] || []).length },
    };
  }

  getDuplicateInvoice(vendor, invoiceNo) {
    return this.state.invoices.find((entry) => entry.vendor === vendor && entry.invoiceNo === invoiceNo) || null;
  }

  recordInvoice({ vendor, invoiceNo, scanUrl = '', rows = [], sourceSha256 = '', actor = { email: 'system', role: 'system' }, dryRun = false }) {
    const existing = this.getDuplicateInvoice(vendor, invoiceNo);
    if (existing) {
      return { duplicate: true, existing };
    }

    const invoice = {
      id: this.state.nextInvoiceId++,
      vendor,
      invoiceNo,
      scanUrl,
      rows,
      sourceSha256: sourceSha256 || hashText(JSON.stringify({ vendor, invoiceNo, rows })),
      dryRun,
      createdAt: nowIso(),
      actor,
    };

    this.state.invoices.push(invoice);
    this.state.syncEvents.push({
      id: this.state.syncEvents.length + 1,
      type: 'ocr',
      source: 'invoice_intake',
      actor,
      count: rows.length || 1,
      createdAt: nowIso(),
      sha256: invoice.sourceSha256,
    });
    this.recordActivity({ type: 'invoice', actor, meta: { vendor, invoiceNo, dryRun, rowCount: rows.length } });
    this.addXp(actor, rows.length ? Math.max(10, rows.length * 3) : 10, 'invoice', { vendor, invoiceNo });
    this.checkBadges(actor);
    this.persist();
    return { duplicate: false, invoice };
  }

  upsertPrice(itemId, patch, actor, action = 'price_change') {
    const item = this.getCatalogItem(itemId);
    if (!item) return null;
    const previous = { retail: item.retail, costPerUnit: item.costPerUnit, status: item.status };
    if (patch.retail !== undefined) item.retail = round2(patch.retail);
    if (patch.costPerUnit !== undefined) item.costPerUnit = round2(patch.costPerUnit);
    if (patch.status) item.status = patch.status;
    if (patch.notes !== undefined) item.notes = String(patch.notes || '');
    if (patch.verifiedAt !== undefined) item.verifiedAt = patch.verifiedAt;
    item.updatedAt = nowIso();

    const history = this.state.itemHistory[String(item.id)] || [];
    history.push({
      id: history.length + 1,
      itemId: item.id,
      action,
      actor,
      oldValue: previous,
      newValue: {
        retail: item.retail,
        costPerUnit: item.costPerUnit,
        status: item.status,
      },
      createdAt: item.updatedAt,
    });
    this.state.itemHistory[String(item.id)] = history;
    this.recordActivity({
      type: action,
      actor,
      itemId: item.id,
      oldValue: previous,
      newValue: { retail: item.retail, costPerUnit: item.costPerUnit, status: item.status },
      meta: patch,
    });
    this.persist();
    return item;
  }

  approveItem(itemId, actor, note = '') {
    const item = this.getCatalogItem(itemId);
    if (!item) return null;
    const updated = this.upsertPrice(itemId, {
      status: 'approved',
      verifiedAt: nowIso(),
      notes: note || item.notes,
    }, actor, 'approve');
    this.addXp(actor, 15, 'approve', { itemId: item.id });
    this.checkBadges(actor);
    return updated;
  }

  rejectItem(itemId, actor, note = '') {
    const item = this.getCatalogItem(itemId);
    if (!item) return null;
    return this.upsertPrice(itemId, { status: 'rejected', notes: note || item.notes }, actor, 'reject');
  }

  registerSignin(actor, meta = {}) {
    this.recordActivity({ type: 'signin', actor, meta });
    const token = crypto.randomUUID();
    this.state.sessions[token] = {
      actor,
      createdAt: nowIso(),
    };
    this.persist();
    return {
      token,
      actor,
      createdAt: nowIso(),
    };
  }

  parseCsv(text) {
    const lines = String(text || '')
      .replace(/\r\n/g, '\n')
      .trim()
      .split('\n');
    if (!lines.length || !lines[0]) return { headers: [], rows: [] };

    const parseRow = (row) => {
      const cells = [];
      let current = '';
      let quoted = false;
      for (let i = 0; i < row.length; i += 1) {
        const ch = row[i];
        if (quoted) {
          if (ch === '"' && row[i + 1] === '"') {
            current += '"';
            i += 1;
          } else if (ch === '"') {
            quoted = false;
          } else {
            current += ch;
          }
        } else if (ch === ',') {
          cells.push(current);
          current = '';
        } else if (ch === '"') {
          quoted = true;
        } else {
          current += ch;
        }
      }
      cells.push(current);
      return cells.map((cell) => cell.trim());
    };

    const headers = parseRow(lines[0]);
    const rows = lines.slice(1).filter(Boolean).map((line, index) => {
      const values = parseRow(line);
      const row = {};
      headers.forEach((header, headerIndex) => {
        row[header] = values[headerIndex] ?? '';
      });
      row.__row = index + 2;
      return row;
    });
    return { headers, rows };
  }

  dryRunCsv(csvText) {
    const parsed = this.parseCsv(csvText);
    const report = [];
    let errorCount = 0;
    for (const row of parsed.rows) {
      const errors = [];
      if (!row.vendor) errors.push('Missing vendor');
      if (!row.invoiceNo && !row.invoice) errors.push('Missing invoice number');
      const cost = safeNumber(row.costPerUnit ?? row.cost, NaN);
      const retail = safeNumber(row.retail, NaN);
      if (!Number.isFinite(cost) || cost < 0) errors.push('Invalid cost');
      if (!Number.isFinite(retail) || retail < 0) errors.push('Invalid retail');
      if (row.margin && safeNumber(row.margin, NaN) < 70) errors.push('Margin below 70%');
      if (errors.length) errorCount += 1;
      report.push({
        row: row.__row,
        values: row,
        errors,
        valid: errors.length === 0,
      });
    }
    this.recordActivity({
      type: 'csv_dry_run',
      actor: { email: 'system', role: 'system' },
      meta: { errorCount, rowCount: report.length },
    });
    return {
      report,
      errorCount,
      rowCount: report.length,
    };
  }

  applyCsv(csvText, actor) {
    const preview = this.dryRunCsv(csvText);
    if (preview.errorCount) {
      return { applied: false, preview };
    }
    const parsed = this.parseCsv(csvText);
    const applied = [];
    for (const row of parsed.rows) {
      const item = this.upsertPrice(row.itemId || row.id, {
        retail: row.retail,
        costPerUnit: row.costPerUnit ?? row.cost,
        notes: row.notes || '',
        status: row.status || 'approved',
      }, actor, 'csv_apply');
      if (item) applied.push(item);
    }
    this.recordActivity({ type: 'csv_apply', actor, meta: { rowCount: applied.length } });
    this.state.syncEvents.push({
      id: this.state.syncEvents.length + 1,
      type: 'pos_import',
      source: 'csv_apply',
      actor,
      count: applied.length,
      createdAt: nowIso(),
      sha256: hashText(csvText),
    });
    this.persist();
    this.checkBadges(actor);
    return { applied: true, appliedCount: applied.length, preview };
  }
}

module.exports = {
  PricingHubStore,
  LEVELS,
  BADGES,
  todayKey,
  nowIso,
  hashText,
  round2,
  targetRetail,
  markupPercent,
  grossMargin,
  normalizeItem,
};
