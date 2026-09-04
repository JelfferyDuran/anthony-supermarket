const express = require('express');
const crypto = require('crypto');
const { PricingHubStore, nowIso, hashText } = require('./pricing-hub-store');

function makeJsonError(status, code, message, details = null) {
  const error = { ok: false, error: { code, message } };
  if (details) error.error.details = details;
  error.status = status;
  return error;
}

function sendError(res, status, code, message, details = null) {
  return res.status(status).json(makeJsonError(status, code, message, details));
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function safeBodyObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function rateLimiter() {
  const buckets = new Map();
  return function limit(key, max, windowMs) {
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };
    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }
    bucket.count += 1;
    buckets.set(key, bucket);
    return {
      allowed: bucket.count <= max,
      retryAfterMs: Math.max(0, bucket.resetAt - now),
      count: bucket.count,
    };
  };
}

function createPricingHubApi(options = {}) {
  const statePath = options.statePath;
  const seed = options.seed || { vendors: {}, items: [] };
  const store = options.store || new PricingHubStore({ statePath, seed });
  const router = express.Router();
  const limit = rateLimiter();
  const localEmail = process.env.PRICING_HUB_LOCAL_EMAIL || 'pricing@kingdomfiservices.com';
  const localPassword = process.env.PRICING_HUB_LOCAL_PASSWORD || '';

  function authFromRequest(req) {
    const header = String(req.headers.authorization || '');
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) return null;
    const token = match[1].trim();
    return store.state.sessions[token] || null;
  }

  function requireAuth(req, res, next) {
    const session = authFromRequest(req);
    if (!session) {
      return sendError(res, 401, 'unauthorized', 'Missing or invalid bearer token');
    }
    req.pricingActor = session.actor;
    req.pricingSession = session;
    next();
  }

  function validateCatalogPayload(body) {
    const errors = [];
    if (!body || typeof body !== 'object') {
      errors.push('Payload must be an object');
      return errors;
    }
    if (!Array.isArray(body.items)) errors.push('items must be an array');
    if (body.items && body.items.length > 5000) errors.push('items exceeds maximum size');
    if (body.vendors && typeof body.vendors !== 'object') errors.push('vendors must be an object');
    return errors;
  }

  function requestActor(req) {
    return req.pricingActor || { email: 'system', role: 'system' };
  }

  router.get('/api/pricing/health', (req, res) => {
    const stats = store.computeStats({ email: 'system', role: 'system' });
    res.json({
      ok: true,
      status: 'ok',
      service: 'pricing-hub',
      catalogItems: store.state.catalog.length,
      invoices: store.state.invoices.length,
      auditEntries: store.state.auditLog.length,
      xpEnabled: true,
      levelNames: stats.level ? stats.level.name : null,
    });
  });

  router.post('/api/pricing/login', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const bucket = limit(`login:${ip}`, 5, 15 * 60 * 1000);
    if (!bucket.allowed) {
      return sendError(res, 429, 'rate_limited', 'Too many login attempts', {
        retryAfterMs: bucket.retryAfterMs,
      });
    }

    const body = safeBodyObject(req.body);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!email || !password) {
      return sendError(res, 400, 'validation_error', 'Email and password are required');
    }

    if (email !== localEmail.toLowerCase() || !localPassword || password !== localPassword) {
      return sendError(res, 401, 'invalid_credentials', 'Invalid manager credentials');
    }

    const session = store.registerSignin({ email, role: 'manager' }, {
      source: 'local-fallback',
      ip,
    });
    res.json({
      ok: true,
      access_token: session.token,
      token_type: 'Bearer',
      user: { email, role: 'manager' },
      issued_at: session.createdAt,
    });
  });

  router.post('/api/pricing/bootstrap', (req, res) => {
    const body = safeBodyObject(req.body);
    const errors = validateCatalogPayload(body);
    if (errors.length) {
      return sendError(res, 400, 'validation_error', 'Invalid bootstrap payload', errors);
    }
    const digest = hashText(JSON.stringify({ vendors: body.vendors || {}, items: body.items || [] }));
    const result = store.bootstrapCatalog({
      vendors: body.vendors || {},
      items: body.items || [],
      actor: { email: body.actorEmail || 'bootstrap', role: 'system' },
      source: body.source || 'bootstrap',
    });
    res.json({
      ok: true,
      seed_sha256: digest,
      dashboard: result.dashboard,
    });
  });

  router.use(requireAuth);

  router.get('/api/pricing/dashboard', (req, res) => {
    res.json(store.getDashboard(requestActor(req)));
  });

  router.get('/api/pricing/catalog', (req, res) => {
    const result = store.listCatalog({
      query: req.query.q || req.query.search || '',
      vendor: req.query.vendor || '',
      status: req.query.status || '',
      page: req.query.page || 1,
      limit: req.query.limit || 25,
      sort: req.query.sort || 'updatedAt',
      direction: req.query.direction || 'desc',
    });
    res.json({ ok: true, ...result });
  });

  router.get('/api/pricing/review-queue', (req, res) => {
    const result = store.getReviewQueue({
      query: req.query.q || '',
      page: req.query.page || 1,
      limit: req.query.limit || 25,
    });
    res.json({ ok: true, ...result });
  });

  router.get('/api/pricing/activity', (req, res) => {
    const result = store.getActivityLog({
      query: req.query.q || '',
      page: req.query.page || 1,
      limit: req.query.limit || 25,
    });
    res.json({ ok: true, ...result });
  });

  router.get('/api/pricing/audit', (req, res) => {
    const result = store.getAuditLog({
      query: req.query.q || '',
      page: req.query.page || 1,
      limit: req.query.limit || 25,
    });
    res.json({ ok: true, ...result });
  });

  router.get('/api/pricing/margin-watch', (req, res) => {
    res.json({ ok: true, ...store.getMarginWatch() });
  });

  router.get('/api/pricing/items/:itemId/history', (req, res) => {
    const itemId = Number(req.params.itemId);
    if (!Number.isFinite(itemId)) {
      return sendError(res, 400, 'validation_error', 'itemId must be numeric');
    }
    res.json({ ok: true, ...store.getItemHistory(itemId) });
  });

  router.post('/api/pricing/items/:itemId/approve', (req, res) => {
    const itemId = Number(req.params.itemId);
    if (!Number.isFinite(itemId)) {
      return sendError(res, 400, 'validation_error', 'itemId must be numeric');
    }
    const body = safeBodyObject(req.body);
    const item = store.approveItem(itemId, requestActor(req), String(body.note || ''));
    if (!item) return sendError(res, 404, 'not_found', 'Item not found');
    const unlocked = store.checkBadges(requestActor(req));
    res.json({ ok: true, item, unlockedBadges: unlocked, dashboard: store.getDashboard(requestActor(req)).dashboard });
  });

  router.post('/api/pricing/items/:itemId/reject', (req, res) => {
    const itemId = Number(req.params.itemId);
    if (!Number.isFinite(itemId)) {
      return sendError(res, 400, 'validation_error', 'itemId must be numeric');
    }
    const body = safeBodyObject(req.body);
    const item = store.rejectItem(itemId, requestActor(req), String(body.note || ''));
    if (!item) return sendError(res, 404, 'not_found', 'Item not found');
    res.json({ ok: true, item });
  });

  router.post('/api/pricing/items/:itemId/price', (req, res) => {
    const itemId = Number(req.params.itemId);
    if (!Number.isFinite(itemId)) {
      return sendError(res, 400, 'validation_error', 'itemId must be numeric');
    }
    const body = safeBodyObject(req.body);
    const retail = Number(body.retail);
    if (!Number.isFinite(retail) || retail <= 0) {
      return sendError(res, 400, 'validation_error', 'retail must be a positive number');
    }
    const item = store.upsertPrice(itemId, {
      retail,
      notes: body.note || '',
      status: body.status || 'approved',
    }, requestActor(req), 'price_change');
    if (!item) return sendError(res, 404, 'not_found', 'Item not found');
    store.checkBadges(requestActor(req));
    res.json({ ok: true, item, dashboard: store.getDashboard(requestActor(req)).dashboard });
  });

  router.post('/api/pricing/invoices', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const bucket = limit(`invoice:${ip}`, 20, 60 * 60 * 1000);
    if (!bucket.allowed) {
      return sendError(res, 429, 'rate_limited', 'Too many invoice intake requests', {
        retryAfterMs: bucket.retryAfterMs,
      });
    }
    const body = safeBodyObject(req.body);
    const vendor = String(body.vendor || '').trim();
    const invoiceNo = String(body.invoiceNo || body.invoice || '').trim();
    if (!vendor || !invoiceNo) {
      return sendError(res, 400, 'validation_error', 'vendor and invoiceNo are required');
    }
    const result = store.recordInvoice({
      vendor,
      invoiceNo,
      scanUrl: String(body.scanUrl || ''),
      rows: Array.isArray(body.rows) ? body.rows : [],
      sourceSha256: String(body.sourceSha256 || ''),
      actor: requestActor(req),
      dryRun: Boolean(body.dryRun),
    });
    if (result.duplicate) {
      return res.json({
        ok: true,
        duplicate: true,
        message: 'already in system',
        existing: result.existing,
      });
    }
    res.json({
      ok: true,
      duplicate: false,
      invoice: result.invoice,
      dashboard: store.getDashboard(requestActor(req)).dashboard,
    });
  });

  router.post('/api/pricing/import/csv', (req, res) => {
    const body = safeBodyObject(req.body);
    const csv = String(body.csv || body.text || '');
    if (!csv.trim()) {
      return sendError(res, 400, 'validation_error', 'csv text is required');
    }
    const dryRun = store.dryRunCsv(csv);
    if (body.apply) {
      const applyResult = store.applyCsv(csv, requestActor(req));
      return res.json({
        ok: true,
        dryRun: dryRun.report,
        errorCount: dryRun.errorCount,
        applied: applyResult.applied,
        appliedCount: applyResult.appliedCount || 0,
      });
    }
    res.json({
      ok: true,
      dryRun: dryRun.report,
      errorCount: dryRun.errorCount,
      rowCount: dryRun.rowCount,
    });
  });

  router.post('/api/pricing/missions/:missionId/complete', (req, res) => {
    const missionId = String(req.params.missionId || '').trim();
    if (!missionId) {
      return sendError(res, 400, 'validation_error', 'missionId is required');
    }
    const mission = store.completeMission(requestActor(req), missionId);
    res.json({ ok: true, mission, dashboard: store.getDashboard(requestActor(req)).dashboard });
  });

  router.get('/api/pricing/items/:itemId', (req, res) => {
    const itemId = Number(req.params.itemId);
    if (!Number.isFinite(itemId)) {
      return sendError(res, 400, 'validation_error', 'itemId must be numeric');
    }
    const item = store.getCatalogItem(itemId);
    if (!item) return sendError(res, 404, 'not_found', 'Item not found');
    res.json({ ok: true, item });
  });

  router.use((err, req, res, next) => {
    console.error('[pricing-hub]', err);
    if (res.headersSent) return next(err);
    return sendError(res, 500, 'internal_error', 'Unexpected server error');
  });

  return { router, store, makeJsonError, sendError, authFromRequest };
}

module.exports = {
  createPricingHubApi,
  makeJsonError,
  sendError,
};
