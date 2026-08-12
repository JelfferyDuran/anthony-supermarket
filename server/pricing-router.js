'use strict';

const express = require('express');
const multer = require('multer');
const { priceInvoice, retailFromUnitCost, unitCostFromCase } = require('./pricing-engine');

const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, ALLOWED_TYPES.has(file.mimetype)) });

function timingSafeEqualText(left, right) {
  const crypto = require('crypto');
  const a = Buffer.from(String(left || '')), b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function createPricingRouter() {
  const router = express.Router();
  const managerToken = process.env.PRICING_MANAGER_TOKEN || '';
  const agentKey = process.env.PRICING_AGENT_KEY || '';
  const ocrUrl = process.env.PRICING_OCR_WEBHOOK_URL || '';
  const ocrToken = process.env.PRICING_OCR_WEBHOOK_TOKEN || '';
  const localDemo = process.env.NODE_ENV !== 'production' && !managerToken && !agentKey;
  const authorize = mode => (req, res, next) => {
    const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const managerOk = managerToken && timingSafeEqualText(bearer, managerToken);
    const agentOk = agentKey && timingSafeEqualText(req.headers['x-pricing-agent-key'], agentKey);
    if (localDemo || managerOk || (mode === 'calculate' && agentOk)) return next();
    return res.status(managerToken || agentKey ? 401 : 503).json({ error: 'Pricing authentication is not configured' });
  };

  router.get('/config', (_req, res) => res.json({ multiplier: 1.70, ocrConfigured: Boolean(ocrUrl), localDemo, maxUploadMb: 10, acceptedTypes: [...ALLOWED_TYPES] }));
  router.post('/calculate', authorize('calculate'), (req, res) => {
    try {
      const unitCost = req.body.lineTotal != null ? unitCostFromCase(req.body) : Number(req.body.unitCost);
      return res.json({ unitCost, retailPrice: retailFromUnitCost(unitCost), multiplier: 1.70 });
    } catch (error) { return res.status(400).json({ error: error.message }); }
  });
  router.post('/invoices/extract', authorize('manager'), upload.single('invoice'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'A supported PDF or image invoice is required' });
    if (!ocrUrl) return res.status(503).json({ error: 'OCR is not configured', code: 'OCR_NOT_CONFIGURED' });
    try {
      const body = new FormData();
      body.append('invoice', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
      body.append('vendor_name', req.body.vendor_name || '');
      body.append('invoice_number', req.body.invoice_number || '');
      const headers = ocrToken ? { Authorization: `Bearer ${ocrToken}` } : {};
      const response = await fetch(ocrUrl, { method: 'POST', headers, body, signal: AbortSignal.timeout(45000) });
      if (!response.ok) throw new Error(`OCR service returned HTTP ${response.status}`);
      return res.json(priceInvoice(await response.json()));
    } catch (error) {
      console.error('Pricing OCR failed:', error.message);
      return res.status(502).json({ error: 'Invoice extraction failed', detail: error.message });
    }
  });
  router.use((error, _req, res, next) => {
    if (error instanceof multer.MulterError) return res.status(400).json({ error: error.message });
    if (error) return res.status(400).json({ error: 'Unsupported invoice file' });
    return next();
  });
  return router;
}

module.exports = { createPricingRouter };
