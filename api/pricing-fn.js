'use strict';

// Vercel serverless entry for the Pricing Hub API (rewrite target).
//
// Why this file exists: on this project Vercel's edge does not route
// multi-segment paths (e.g. /api/pricing/invoices/123/approve) to the
// api/pricing/[...path].js catch-all — they 404 at the edge, while
// single-segment paths reach the function fine. So vercel.json rewrites
// /api/pricing/:path* here, and this file restores the original path from
// the __path query param before handing off to the router.
//
// The router itself is untouched: same paths, same auth, same behavior.
// api/pricing/[...path].js is left in place as a fallback.

const express = require('express');
const { createPricingRouter } = require('../server/pricing-router');

const app = express();
app.disable('x-powered-by');
// JSON bodies for /login, /calculate, approvals, etc. (multer handles the
// multipart invoice uploads on its own route).
app.use(express.json({ limit: '1mb' }));

// Restore the pre-rewrite path: /api/pricing-fn?__path=upc/lookup&name=x
// becomes /api/pricing/upc/lookup?name=x for the router below.
app.use((req, res, next) => {
  const p = req.query && req.query.__path;
  if (typeof p === 'string' && p) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(req.query)) {
      if (k === '__path') continue;
      if (Array.isArray(v)) v.forEach(val => params.append(k, val));
      else params.append(k, v);
    }
    const qs = params.toString();
    req.url = '/api/pricing/' + p + (qs ? '?' + qs : '');
  }
  next();
});

// Same mount path the hub client expects (API_BASE = '/api/pricing').
app.use('/api/pricing', createPricingRouter());
// Deployment health check (no auth, no store).
app.get('/api/pricing/health', (_req, res) => res.json({ ok: true, service: 'pricing-hub-api' }));

module.exports = app;
