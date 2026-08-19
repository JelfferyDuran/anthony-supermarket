'use strict';

// Tests for channel-agnostic invoice intake. The security question here is
// simple and worth being strict about: can a sender who is not on a channel's
// allowlist get a scan into the review queue?

const test = require('node:test');
const assert = require('node:assert/strict');

const KEYS = ['HERMES_CHAT_ID', 'PRICING_TELEGRAM_CHAT_IDS', 'PRICING_WHATSAPP_NUMBERS'];

function withEnv(values, run) {
  const saved = {};
  for (const key of KEYS) { saved[key] = process.env[key]; delete process.env[key]; }
  Object.assign(process.env, values);
  try {
    return run(require('./pricing-intake'));
  } finally {
    for (const key of KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
}

const PDF = { buffer: Buffer.from('%PDF-1.4 scan'), mimetype: 'application/pdf', originalname: 'inv.pdf' };

// ── Allowlists ───────────────────────────────────────────────────────────────

test('an empty allowlist admits nobody', () => withEnv({}, intake => {
  assert.equal(intake.isSenderAllowed('telegram', '12345'), false);
  assert.equal(intake.isSenderAllowed('whatsapp', '12015550100'), false);
}));

test('a listed Telegram chat is admitted, an unlisted one is not', () => withEnv({ PRICING_TELEGRAM_CHAT_IDS: '111,222' }, intake => {
  assert.equal(intake.isSenderAllowed('telegram', '111'), true);
  assert.equal(intake.isSenderAllowed('telegram', '333'), false);
}));

test('HERMES_CHAT_ID still authorises Telegram, for config continuity', () => withEnv({ HERMES_CHAT_ID: '999' }, intake => {
  assert.equal(intake.isSenderAllowed('telegram', '999'), true);
}));

test('channels do not share an allowlist', () => withEnv(
  { PRICING_TELEGRAM_CHAT_IDS: '111', PRICING_WHATSAPP_NUMBERS: '12015550100' },
  intake => {
    // A Telegram chat id must not authorise WhatsApp, or vice versa: they are
    // different namespaces and a shared list would let one channel vouch for the other.
    assert.equal(intake.isSenderAllowed('whatsapp', '111'), false);
    assert.equal(intake.isSenderAllowed('telegram', '12015550100'), false);
  }
));

test('WhatsApp numbers match across the formats bridges actually send', () => withEnv({ PRICING_WHATSAPP_NUMBERS: '+1 (201) 555-0100' }, intake => {
  for (const form of ['12015550100', '+12015550100', '2015550100', '12015550100@c.us', '+1 201 555 0100']) {
    assert.equal(intake.isSenderAllowed('whatsapp', form), true, `should match ${form}`);
  }
  assert.equal(intake.isSenderAllowed('whatsapp', '12015550101'), false, 'a different number must not match');
}));

// ── Submission validation ────────────────────────────────────────────────────

test('the hub needs no sender allowlist — the router already authenticated it', () => withEnv({}, intake => {
  assert.equal(intake.validateSubmission({ channel: 'hub', file: PDF }).ok, true);
}));

test('an unlisted chat sender is refused, and told nothing useful', () => withEnv({ PRICING_TELEGRAM_CHAT_IDS: '111' }, intake => {
  const result = intake.validateSubmission({ channel: 'telegram', sender: '222', file: PDF });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'SENDER_NOT_ALLOWED');
  assert.equal(result.status, 404, 'a 404 does not confirm the endpoint exists');
  assert.equal(result.error, 'Not found');
}));

test('a listed chat sender may submit', () => withEnv({ PRICING_TELEGRAM_CHAT_IDS: '111' }, intake => {
  assert.equal(intake.validateSubmission({ channel: 'telegram', sender: '111', file: PDF }).ok, true);
}));

test('rejects an unknown channel rather than defaulting to a permissive one', () => withEnv({}, intake => {
  const result = intake.validateSubmission({ channel: 'sms', sender: 'x', file: PDF });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'CHANNEL_UNKNOWN');
}));

test('rejects an unsupported file type and an oversized file', () => withEnv({}, intake => {
  assert.equal(intake.validateSubmission({ channel: 'hub', file: { buffer: Buffer.from('x'), mimetype: 'text/html' } }).code, 'TYPE_UNSUPPORTED');
  assert.equal(intake.validateSubmission({ channel: 'hub', file: { buffer: Buffer.alloc(11 * 1024 * 1024), mimetype: 'application/pdf' } }).code, 'FILE_TOO_LARGE');
  assert.equal(intake.validateSubmission({ channel: 'hub', file: null }).code, 'NO_FILE');
}));

// ── Audit trail ──────────────────────────────────────────────────────────────

test('the audit label identifies the channel without storing the phone number', () => withEnv({}, intake => {
  const label = intake.senderFingerprint('whatsapp', '+1 201 555 0100');
  assert.match(label, /^whatsapp:[0-9a-f]{12}$/);
  assert.ok(!label.includes('2015550100'), 'the raw number must not be embedded');
  // The same sender in two formats is the same fingerprint, so repeat senders
  // are still recognisable without keeping their identity.
  assert.equal(label, intake.senderFingerprint('whatsapp', '12015550100@c.us'));
}));

test('the same id on two channels yields different fingerprints', () => withEnv({}, intake => {
  assert.notEqual(intake.senderFingerprint('telegram', '111'), intake.senderFingerprint('whatsapp', '111'));
}));

// ── Acknowledgement wording ──────────────────────────────────────────────────

test('the reply never implies a price was set', () => withEnv({}, intake => {
  const message = intake.acknowledgement({ lineCount: 12, invoiceNumber: 'S-1', ocrConfigured: true });
  assert.match(message, /read 12 lines/);
  assert.match(message, /Nothing is priced yet/);
}));

test('a duplicate scan says so instead of pretending it was new', () => withEnv({}, intake => {
  assert.match(intake.acknowledgement({ duplicate: true }), /Already have this exact scan/);
}));

test('with no reader configured, the reply says the lines still need entering', () => withEnv({}, intake => {
  const message = intake.acknowledgement({ lineCount: 0, ocrConfigured: false });
  assert.match(message, /stored securely/);
  assert.match(message, /by hand/);
}));

test('one line reads "1 line", not "1 lines"', () => withEnv({}, intake => {
  assert.match(intake.acknowledgement({ lineCount: 1, ocrConfigured: true }), /read 1 line\b/);
}));
