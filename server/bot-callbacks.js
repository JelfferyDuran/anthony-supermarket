'use strict';

// Telegram rejects an inline button whose callback_data is over 64 bytes
// (400 BUTTON_DATA_INVALID), and one bad button fails the whole message.
// Names made that happen: "add:kitchen:Desayunos / Breakfast:Guineitos con
// Huevo Salami y Queso Frito" is 74 bytes, so whole categories never opened.
// Buttons therefore carry positions ("add:kitchen:3:12"); the old name-based
// form is still resolved so buttons on messages sent before this keep working.

const MAX_CALLBACK_BYTES = 64;

const catData = (slug, catIndex) => `cat:${slug}:${catIndex}`;
const addData = (slug, catIndex, itemIndex) => `add:${slug}:${catIndex}:${itemIndex}`;

const isIndex = (s) => /^\d+$/.test(s);

function findCategory(menu, ref) {
  if (!menu || !Array.isArray(menu.categorias)) return { cat: null, catIndex: -1 };
  const catIndex = isIndex(ref) ? Number(ref) : menu.categorias.findIndex((c) => c.nombre === ref);
  const cat = menu.categorias[catIndex] || null;
  return { cat, catIndex: cat ? catIndex : -1 };
}

// "cat:<slug>:<catIndex|catName>"
function parseCat(data, menuFor) {
  const [, slug, catRef] = data.split(':');
  return { slug, ...findCategory(menuFor(slug), catRef) };
}

// "add:<slug>:<catIndex>:<itemIndex>" or legacy "add:<slug>:<catName>:<itemName>"
function parseAdd(data, menuFor) {
  const [, slug, catRef, ...rest] = data.split(':');
  const itemRef = rest.join(':');
  const { cat, catIndex } = findCategory(menuFor(slug), catRef);
  let item = null;
  if (cat) {
    item = isIndex(itemRef) && isIndex(catRef)
      ? cat.items[Number(itemRef)] || null
      : cat.items.find((i) => i.nombre === itemRef) || null;
  }
  return { slug, cat, catIndex, item };
}

module.exports = { MAX_CALLBACK_BYTES, catData, addData, parseCat, parseAdd };
