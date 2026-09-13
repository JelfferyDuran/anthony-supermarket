// Menu seed file resolution.
//
// The seed ships in two layouts:
//   Docker image : <server>/seed/anthonys-seed.json       (see server/Dockerfile)
//   Repo checkout: <repo>/apps/menu/scripts/anthonys-seed.json
//
// MENU_DATA_PATH is honoured only when it actually points at a readable file.
// A host-only path — e.g. the Windows absolute path used for local runs in
// server/.env — cannot exist inside the container. Trusting it unconditionally
// shadowed the copy baked into the image and silently served an empty menu
// ({menus: []}) while still logging a successful load.

const path = require('path');
const fs = require('fs');

function fileExists(candidate) {
  try {
    return fs.statSync(candidate).isFile();
  } catch {
    return false;
  }
}

// Ordered by specificity: an explicit override first, then the Docker image
// layout, then the repo checkout layout.
function menuSeedCandidates(env = process.env, dirname = __dirname) {
  return [
    env.MENU_DATA_PATH,
    path.join(dirname, 'seed', 'anthonys-seed.json'),
    path.join(dirname, '..', 'apps', 'menu', 'scripts', 'anthonys-seed.json'),
    path.join(dirname, '..', 'seed', 'anthonys-seed.json'),
  ].filter(Boolean);
}

// Return the first candidate that exists, else null. Returning null (rather
// than falling back to a path known not to exist) keeps the caller honest:
// it can report that nothing was found instead of claiming a successful load.
function resolveMenuDataPath(candidates = menuSeedCandidates(), exists = fileExists) {
  for (const candidate of candidates) {
    try {
      if (exists(candidate)) return candidate;
    } catch {
      // An unreadable candidate is simply not a candidate.
    }
  }
  return null;
}

// Item count across every menu -> categoria -> items. Surfaced in the startup
// log so an empty-but-well-formed seed cannot masquerade as a healthy load.
function countMenuItems(data) {
  if (!data || !Array.isArray(data.menus)) return 0;
  return data.menus.reduce((menuTotal, menu) => {
    const categorias = menu && Array.isArray(menu.categorias) ? menu.categorias : [];
    return menuTotal + categorias.reduce((catTotal, cat) => {
      const items = cat && Array.isArray(cat.items) ? cat.items : [];
      return catTotal + items.length;
    }, 0);
  }, 0);
}

// Slug lookup with a single-menu fallback. Exact match wins; when the seed
// holds exactly one menu (the common case for this restaurant), any unknown
// slug — including stale references such as the pre-rename 'kitchen' — still
// resolves to it instead of 404ing. Unknown slugs on a multi-menu seed miss,
// so 404 semantics stay intact if more menus are added later.
function resolveMenuBySlug(data, slug) {
  if (!data || !Array.isArray(data.menus)) return undefined;
  if (slug) {
    const exact = data.menus.find(m => m && m.slug === slug);
    if (exact) return exact;
  }
  return data.menus.length === 1 ? data.menus[0] : undefined;
}

module.exports = { menuSeedCandidates, resolveMenuDataPath, countMenuItems, resolveMenuBySlug, fileExists };
