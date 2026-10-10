'use strict';

// Vercel serverless entry for the Pricing Hub API.
//
// Mounts ONLY the pricing router. server/index.js is deliberately NOT used
// here: it is the kitchen/order monolith — it binds a TCP port, starts
// Telegram long-polling, and calls process.exit(1) when the kitchen menu seed
// is missing. None of that may run inside a serverless function.
//
// The hub client (pricing-hub/index.html) calls this API same-origin at
// /api/pricing/*, which is exactly the path Vercel routes to this file
// (api/pricing/[...path].js).

const express = require('express');
const { createPricingRouter } = require('../../server/pricing-router');

const app = express();
app.disable('x-powered-by');
// JSON bodies for /login, /calculate, approvals, etc. (multer handles the
// multipart invoice uploads on its own route).
app.use(express.json({ limit: '1mb' }));
// Same mount path the hub client expects (API_BASE = '/api/pricing').
app.use('/api/pricing', createPricingRouter());
// Deployment health check (no auth, no store). Lives under /api/pricing/*
// because that is the path prefix Vercel routes to this function.
app.get('/api/pricing/health', (_req, res) => res.json({ ok: true, service: 'pricing-hub-api' }));

module.exports = app;
