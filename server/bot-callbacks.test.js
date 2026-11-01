'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { resolveMenuDataPath, resolveMenuBySlug } = require('./menu-seed');
const { MAX_CALLBACK_BYTES, catData, addData, parseCat, parseAdd } = require('./bot-callbacks');

const menuData = JSON.parse(fs.readFileSync(resolveMenuDataPath(), 'utf8'));
const menuFor = (slug) => resolveMenuBySlug(menuData, slug);

test('every bot button for the real menu fits Telegram\'s 64-byte callback_data limit', () => {
  const tooLong = [];
  for (const menu of menuData.menus) {
    menu.categorias.forEach((cat, ci) => {
      const check = (d) => { if (Buffer.byteLength(d) > MAX_CALLBACK_BYTES) tooLong.push(d); };
      check(catData(menu.slug, ci));
      cat.items.forEach((_, ii) => check(addData(menu.slug, ci, ii)));
    });
  }
  assert.deepEqual(tooLong, []);
});

test('positional buttons resolve to the same category and item', () => {
  for (const menu of menuData.menus) {
    menu.categorias.forEach((cat, ci) => {
      assert.equal(parseCat(catData(menu.slug, ci), menuFor).cat, cat);
      cat.items.forEach((item, ii) => {
        const got = parseAdd(addData(menu.slug, ci, ii), menuFor);
        assert.equal(got.item, item);
        assert.equal(got.catIndex, ci);
      });
    });
  }
});

test('legacy name-based buttons on old messages still resolve', () => {
  const menu = menuData.menus[0];
  const cat = menu.categorias[0];
  const item = cat.items[0];
  assert.equal(parseCat(`cat:${menu.slug}:${cat.nombre}`, menuFor).cat, cat);
  assert.equal(parseAdd(`add:${menu.slug}:${cat.nombre}:${item.nombre}`, menuFor).item, item);
});

test('unknown or out-of-range buttons resolve to nothing', () => {
  const slug = menuData.menus[0].slug;
  assert.equal(parseCat(`cat:${slug}:999`, menuFor).cat, null);
  assert.equal(parseAdd(`add:${slug}:0:999`, menuFor).item, null);
  assert.equal(parseAdd('add:x:0:0', () => undefined).item, null); // no menu at all
});
