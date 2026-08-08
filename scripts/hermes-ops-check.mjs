#!/usr/bin/env node

const required = [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'HERMES_OBSERVER_EMAIL',
  'HERMES_OBSERVER_PASSWORD',
];

const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(2);
}

const baseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  if (!response.ok) {
    const message = body?.error_description || body?.msg || body?.error || `${response.status} ${response.statusText}`;
    throw new Error(String(message));
  }
  return body;
}

try {
  const auth = await requestJson(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: publishableKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: process.env.HERMES_OBSERVER_EMAIL,
      password: process.env.HERMES_OBSERVER_PASSWORD,
    }),
  });

  const accessToken = auth?.access_token;
  if (!accessToken) throw new Error('Supabase did not return an access token.');

  const summary = await requestJson(`${baseUrl}/functions/v1/superkitchen-ops`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  console.error(`Hermes observer check failed: ${error.message}`);
  process.exit(1);
}
