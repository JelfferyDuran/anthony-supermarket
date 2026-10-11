'use strict';

// Builds the Vercel static output. vercel.json runs this as its buildCommand
// and publishes ONLY public-build/ (outputDirectory).
//
// ALLOWLIST, not denylist. Until 2026-10-09 the output directory was the repo
// root, so every tracked file was publicly downloadable: server source,
// invoices/, nrs/ POS exports, apps/pricing-hub's embedded cost ledger and the
// manual-intake cost records. Only the paths below are published now. A new
// public file must be added here on purpose, and scripts/test-public-site.cjs
// fails CI if a published page references something that is not.
//
// The Pricing Hub API is not part of this. Vercel builds
// api/pricing/[...path].js as a serverless function and bundles the server/
// code it requires into the function; server/ never needs a static copy.
//
// Usage: node scripts/build-public-site.js [outDir]   (default: public-build)

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_OUT = path.join(ROOT, 'public-build');

// Single files, copied as-is. A missing one fails the build: a deploy that
// would ship a broken site should not replace the current one.
const PUBLIC_FILES = [
  'index.html',
  'links.html',
  'privacy.html',
  'terms.html',
  'sales.html',
  'data/sale.json', // fetched by sales.html; promo copy only, no cost fields
  'pricing-hub/index.html',
  'pricing-hub/game.css',
  'pricing-hub/polish.css', // visual layer over game.css (main's #52)
];

// Directories, copied recursively, but only files with a listed extension.
// Notes, scripts, archives and data (.md .txt .py .zip .json .csv) never ship.
const PUBLIC_DIRS = {
  'pricing-hub/js': ['.js'],
  assets: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.ico', '.avif',
    '.mp4', '.webm', '.woff', '.woff2', '.pdf', '.html'],
};

function assertSafeOutDir(outDir) {
  const out = path.resolve(outDir);
  // Never let the clean step touch the repo itself or anything above it.
  if (out === ROOT || ROOT.startsWith(out + path.sep)) {
    throw new Error(`refusing to build into ${out}: it contains the repository`);
  }
  return out;
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push({ full, entry });
  }
  return files;
}

function copy(rel, out) {
  const dest = path.join(out, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(ROOT, rel), dest);
}

function build(outDir = DEFAULT_OUT) {
  const out = assertSafeOutDir(outDir);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  const published = [];
  const skipped = [];

  for (const rel of PUBLIC_FILES) {
    const stat = fs.lstatSync(path.join(ROOT, rel), { throwIfNoEntry: false });
    if (!stat || !stat.isFile()) throw new Error(`public file missing or not a regular file: ${rel}`);
    copy(rel, out);
    published.push(rel);
  }

  for (const [dirRel, extensions] of Object.entries(PUBLIC_DIRS)) {
    const dir = path.join(ROOT, dirRel);
    if (!fs.existsSync(dir)) throw new Error(`public directory missing: ${dirRel}`);
    for (const { full, entry } of walk(dir)) {
      const rel = path.relative(ROOT, full).split(path.sep).join('/');
      // Symlinks are skipped: one could point anywhere (invoices/pricing is a
      // Drive symlink on some machines).
      if (!entry.isFile() || !extensions.includes(path.extname(rel).toLowerCase())) {
        skipped.push(rel);
        continue;
      }
      copy(rel, out);
      published.push(rel);
    }
  }

  return { outDir: out, published, skipped };
}

if (require.main === module) {
  const { outDir, published, skipped } = build(process.argv[2] || DEFAULT_OUT);
  console.log(`public site: ${published.length} files -> ${path.relative(ROOT, outDir) || outDir}`);
  if (skipped.length) console.log(`not published (type not allowlisted): ${skipped.join(', ')}`);
}

module.exports = { build, PUBLIC_FILES, PUBLIC_DIRS };
