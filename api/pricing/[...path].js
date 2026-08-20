'use strict';

const path = require('node:path');

if (!process.env.PRICING_HUB_STATE_PATH) {
  process.env.PRICING_HUB_STATE_PATH = path.join(
    require('node:os').tmpdir(),
    'anthony-pricing-hub-state.json'
  );
}

if (!process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS = '*';
}

module.exports = require('../../server').app;
