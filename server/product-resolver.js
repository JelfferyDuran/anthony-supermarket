const fs = require('fs');
const path = require('path');

// ─── Load product truth layer ────────────────────────────────────────────────
const PRODUCTS_PATH = path.join(__dirname, 'data', 'products.json');

let PRODUCTS_DATA = { products: [] };
try {
  PRODUCTS_DATA = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
} catch (err) {
  console.error('[product-resolver] FAILED to load products.json:', err.message);
}

// ─── Index builders ─────────────────────────────────────────────────────────

// Build lookup tables once at startup
const BY_ID = new Map();
const BY_ALIAS = new Map();  // normalized alias → product id
const BY_NOMBRE = new Map(); // normalized nombre → product id

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s]/g, '')     // strip punctuation
    .replace(/\s+/g, ' ')             // collapse whitespace
    .trim();
}

function buildIndex() {
  BY_ID.clear();
  BY_ALIAS.clear();
  BY_NOMBRE.clear();

  for (const p of PRODUCTS_DATA.products || []) {
    BY_ID.set(p.id, p);

    // Index by nombre
    const normNombre = normalize(p.nombre);
    if (normNombre) BY_NOMBRE.set(normNombre, p.id);

    // Index by all aliases
    for (const alias of p.aliases || []) {
      const normAlias = normalize(alias);
      if (normAlias) BY_ALIAS.set(normAlias, p.id);
    }
  }

  console.log(`[product-resolver] indexed ${BY_ID.size} products, ${BY_ALIAS.size} aliases`);
}

// Build on load
buildIndex();

// ─── Resolution API ─────────────────────────────────────────────────────────

/**
 * Resolve a customer query string to a canonical product.
 * Returns: { product: {...}, score: number, match: string } | null
 * 
 * Three-stage matching:
 *   1. Exact alias hit (O(1))
 *   2. Exact nombre hit (O(1))
 *   3. Token-overlap fuzzy fallback (O(n) but n is small ~100 items)
 */
function resolve(query) {
  if (!query || typeof query !== 'string') return null;
  
  const norm = normalize(query);
  if (!norm) return null;

  // Stage 1: exact alias
  if (BY_ALIAS.has(norm)) {
    return {
      product: BY_ID.get(BY_ALIAS.get(norm)),
      score: 1.0,
      match: query,
      stage: 'alias'
    };
  }

  // Stage 2: exact nombre
  if (BY_NOMBRE.has(norm)) {
    return {
      product: BY_ID.get(BY_NOMBRE.get(norm)),
      score: 1.0,
      match: query,
      stage: 'nombre'
    };
  }

  // Stage 3: token-overlap fuzzy
  const queryTokens = new Set(norm.split(' '));
  let best = null;
  let bestScore = 0;

  for (const p of PRODUCTS_DATA.products || []) {
    const itemTokens = new Set([
      ...normalize(p.nombre).split(' '),
      ...(p.aliases || []).flatMap(a => normalize(a).split(' '))
    ]);

    // Jaccard similarity
    const intersection = [...queryTokens].filter(t => itemTokens.has(t)).length;
    const union = queryTokens.size + itemTokens.size - intersection;
    const score = union > 0 ? intersection / union : 0;

    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }

  if (best && bestScore >= 0.3) {
    return {
      product: best,
      score: Math.round(bestScore * 100) / 100,
      match: query,
      stage: 'fuzzy'
    };
  }

  return null;
}

/**
 * Resolve multiple items from a comma/newline-separated order string.
 * "2 pernil, coca cola" → [{ product, cantidad: 2 }, { product, cantidad: 1 }]
 */
function resolveOrder(orderStr) {
  if (!orderStr) return [];
  
  const results = [];
  const parts = orderStr.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);

  for (const part of parts) {
    // Extract quantity prefix: "2 pernil" → 2, "pernil" → 1
    const qtyMatch = part.match(/^(\d+)\s+(.+)$/);
    let cantidad = 1;
    let query = part;

    if (qtyMatch) {
      cantidad = parseInt(qtyMatch[1], 10);
      query = qtyMatch[2];
    }

    const resolved = resolve(query);
    if (resolved) {
      results.push({
        ...resolved.product,
        cantidad,
        query,
        score: resolved.score,
        matchStage: resolved.stage
      });
    } else {
      results.push({
        id: null,
        nombre: query,
        cantidad,
        query,
        score: 0,
        matchStage: 'unresolved'
      });
    }
  }

  return results;
}

/**
 * Get all products in a category
 */
function getByCategory(categoria) {
  return (PRODUCTS_DATA.products || []).filter(p => p.categoria === categoria);
}

/**
 * Get all categories
 */
function getCategories() {
  return [...new Set((PRODUCTS_DATA.products || []).map(p => p.categoria))];
}

/**
 * Search products by partial name/alias (for /search command)
 */
function search(partial) {
  if (!partial) return [];
  const norm = normalize(partial);
  
  return (PRODUCTS_DATA.products || [])
    .map(p => {
      const nombreScore = normalize(p.nombre).includes(norm) ? 0.8 : 0;
      const aliasScore = (p.aliases || []).some(a => normalize(a).includes(norm)) ? 0.6 : 0;
      const fuzzy = resolve(partial);
      const score = Math.max(nombreScore, aliasScore, fuzzy ? fuzzy.score * 0.5 : 0);
      return { product: p, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(r => r.product);
}

module.exports = {
  resolve,
  resolveOrder,
  getByCategory,
  getCategories,
  search,
  normalize,
  _raw: () => PRODUCTS_DATA.products,
  _reload: () => {
    try {
      PRODUCTS_DATA = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
      buildIndex();
      return true;
    } catch {
      return false;
    }
  }
};
