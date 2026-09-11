const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = html.indexOf('// Decoration must never gate');
const end = html.indexOf('// Cart persistence', start);
assert.ok(start >= 0 && end > start, 'decorative initialization is isolated');
const decoration = html.slice(start, end);

function initialize({ three, reduced = false } = {}) {
  const canvas = { hidden: false };
  let onLoad;
  let warned = false;
  const context = {
    innerWidth: 1200,
    document: { getElementById: () => canvas },
    window: {
      THREE: three,
      matchMedia: () => ({ matches: reduced }),
      addEventListener: (event, fn) => { assert.equal(event, 'load'); onLoad = fn; },
    },
    THREE: three,
    console: { warn: () => { warned = true; } },
  };
  vm.runInNewContext(decoration, context);
  assert.equal(canvas.hidden, false, 'no graphics initialization during menu startup');
  assert.equal(typeof onLoad, 'function');
  assert.doesNotThrow(() => onLoad(), 'graphics failure is contained');
  return { canvas, warned };
}

test('unavailable Three.js CDN leaves an ordinary usable page', () => {
  assert.equal(initialize().canvas.hidden, true);
  assert.doesNotMatch(html, /<body[^>]*class=["'][^"']*loading/);
  assert.doesNotMatch(html, /user-scalable=no|maximum-scale=1\.0/);
});
test('WebGL context failure cannot interrupt menu and cart initialization', () => {
  const three = {
    Scene: function () {},
    PerspectiveCamera: function () {},
    WebGLRenderer: function () { throw new Error('WebGL unavailable'); },
  };
  const result = initialize({ three });
  assert.equal(result.canvas.hidden, true);
  assert.equal(result.warned, true);
});
test('reduced motion skips renderer creation', () => {
  let created = false;
  const three = { WebGLRenderer: function () { created = true; } };
  assert.equal(initialize({ three, reduced: true }).canvas.hidden, true);
  assert.equal(created, false);
});
test('all inline application scripts parse', () => {
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/application\/ld\+json/.test(match[1])) { JSON.parse(match[2]); continue; }
    if (!/\bsrc=/.test(match[1])) new vm.Script(match[2]);
  }
});
