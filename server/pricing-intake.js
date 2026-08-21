'use strict';

// Channel-agnostic invoice intake.
//
// The owner decided on 2026-08-19 that a scan can arrive from the hub UI, from
// Telegram, or from the WhatsApp bridge. All three land in the SAME queue and
// obey the same rule: an arriving scan is evidence, never an approval. Whatever
// channel it came from, every extracted line sits in `needs_review` until a
// manager resolves it in the hub against the source image.
//
// A channel is only allowed to submit if its sender is on that channel's
// allowlist. Allowlists are per-channel because a Telegram chat id and a
// WhatsApp number are different namespaces — one list shared across both would
// let an id from one channel authorise the other.

const crypto = require('crypto');

// Parses a comma-separated allowlist from the environment.
function parseAllowlist(raw) {
  return new Set(
    String(raw || '')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean)
  );
}

function channelAllowlists() {
  return {
    // HERMES_CHAT_ID is kept for continuity with the existing bot config.
    telegram: parseAllowlist([process.env.HERMES_CHAT_ID, process.env.PRICING_TELEGRAM_CHAT_IDS].filter(Boolean).join(',')),
    whatsapp: parseAllowlist(process.env.PRICING_WHATSAPP_NUMBERS)
  };
}

// Normalizes a sender id so an allowlist comparison is not defeated by
// formatting. WhatsApp numbers arrive variously as +1 201 555 0100,
// 12015550100, or 12015550100@c.us depending on the bridge.
function normalizeSender(channel, sender) {
  const raw = String(sender == null ? '' : sender).trim();
  if (channel === 'whatsapp') {
    const digits = raw.replace(/@.*$/, '').replace(/\D/g, '');
    // Treat a bare 10-digit US number and its +1 form as the same sender.
    return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  }
  return raw;
}

function isSenderAllowed(channel, sender) {
  const lists = channelAllowlists();
  const list = lists[channel];
  if (!list || !list.size) return false;
  const normalized = normalizeSender(channel, sender);
  if (!normalized) return false;
  for (const entry of list) {
    if (normalizeSender(channel, entry) === normalized) return true;
  }
  return false;
}

const SUPPORTED_CHANNELS = new Set(['hub', 'telegram', 'whatsapp']);
const ACCEPTED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 10 * 1024 * 1024;

// Validates an inbound submission before anything is stored or extracted.
// Returns { ok: true } or { ok: false, status, error, code }.
function validateSubmission({ channel, sender, file }) {
  if (!SUPPORTED_CHANNELS.has(channel)) {
    return { ok: false, status: 400, code: 'CHANNEL_UNKNOWN', error: `Unknown intake channel "${channel}"` };
  }
  if (!file || !file.buffer || !file.buffer.length) {
    return { ok: false, status: 400, code: 'NO_FILE', error: 'A PDF or image of the invoice is required' };
  }
  if (file.buffer.length > MAX_BYTES) {
    return { ok: false, status: 413, code: 'FILE_TOO_LARGE', error: 'That file is larger than 10 MB' };
  }
  if (!ACCEPTED_TYPES.has(file.mimetype)) {
    return { ok: false, status: 415, code: 'TYPE_UNSUPPORTED', error: 'Send a PDF, JPEG, PNG or WebP' };
  }
  // The hub is authenticated by the router's manager/approver check, so it has
  // no sender allowlist. Chat channels do.
  if (channel !== 'hub' && !isSenderAllowed(channel, sender)) {
    // Deliberately vague: an unlisted sender should not learn that an intake
    // endpoint exists here.
    return { ok: false, status: 404, code: 'SENDER_NOT_ALLOWED', error: 'Not found' };
  }
  return { ok: true };
}

// A stable, non-identifying label for the audit trail. The full chat id or phone
// number is NOT stored: it is customer/owner-adjacent identity data, and the
// pipeline only needs to know which channel a scan came from and that the same
// sender sent it before.
function senderFingerprint(channel, sender) {
  const normalized = normalizeSender(channel, sender);
  if (!normalized) return null;
  return `${channel}:${crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 12)}`;
}

// The message a chat channel sends back once a scan is queued. It states plainly
// that nothing has been priced yet, so nobody assumes a shelf price moved just
// because the bot said "received".
function acknowledgement({ lineCount, duplicate, invoiceNumber, ocrConfigured }) {
  if (duplicate) {
    return 'Already have this exact scan on file — nothing was counted twice. '
      + 'Check the Pricing Hub if you expected it to be further along.';
  }
  if (!ocrConfigured) {
    return 'Invoice received and stored securely. No reader is configured yet, so the lines '
      + 'still need to be entered by hand in the Pricing Hub.';
  }
  const label = invoiceNumber ? ` (#${invoiceNumber})` : '';
  return `Invoice received${label} — read ${lineCount} line${lineCount === 1 ? '' : 's'}. `
    + 'Nothing is priced yet: every line is waiting for review in the Pricing Hub.';
}

module.exports = {
  ACCEPTED_TYPES,
  MAX_BYTES,
  SUPPORTED_CHANNELS,
  acknowledgement,
  channelAllowlists,
  isSenderAllowed,
  normalizeSender,
  parseAllowlist,
  senderFingerprint,
  validateSubmission
};
