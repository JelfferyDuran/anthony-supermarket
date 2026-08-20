const fs = require('fs');
const vm = require('vm');

function extractLiteral(source, marker, openChar, closeChar) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Missing marker: ${marker}`);
  }

  const startIndex = source.indexOf(openChar, markerIndex + marker.length);
  if (startIndex === -1) {
    throw new Error(`Missing literal opener for: ${marker}`);
  }

  let depth = 0;
  let stringQuote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = startIndex; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (stringQuote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === stringQuote) {
        stringQuote = null;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '*') {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === '\'') {
      stringQuote = ch;
      continue;
    }

    if (ch === openChar) {
      depth += 1;
    } else if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(startIndex, i + 1);
      }
    }
  }

  throw new Error(`Unterminated literal for: ${marker}`);
}

function loadPricingHubSeed(htmlPath) {
  const source = fs.readFileSync(htmlPath, 'utf8');
  const vendorsLiteral = extractLiteral(source, 'const VENDORS = ', '{', '}');
  const itemsLiteral = extractLiteral(source, 'const ALL_ITEMS = ', '[', ']');
  const context = {};

  const vendors = vm.runInNewContext(`(${vendorsLiteral})`, context);
  const items = vm.runInNewContext(`(${itemsLiteral})`, context);

  return { vendors, items };
}

module.exports = {
  extractLiteral,
  loadPricingHubSeed,
};
