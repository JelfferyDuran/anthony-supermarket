const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

const {
  menuSeedCandidates,
  resolveMenuDataPath,
  countMenuItems,
} = require('./menu-seed');

const DOCKER_SEED = path.join('X:', 'app', 'seed', 'anthonys-seed.json');
const REPO_SEED = path.join('X:', 'repo', 'apps', 'menu', 'scripts', 'anthonys-seed.json');
const WIN_HOST_SEED = 'C:\\Users\\Jayto\\anthony-supermarket\\apps\\menu\\scripts\\anthonys-seed.json';

test('candidate list puts an explicit override first and includes both layouts', () => {
  const candidates = menuSeedCandidates({ MENU_DATA_PATH: WIN_HOST_SEED }, DOCKER_SEED.replace(/anthonys-seed\.json$/, ''));
  assert.strictEqual(candidates[0], WIN_HOST_SEED);
  assert.ok(candidates.some(c => c.includes(path.join('seed', 'anthonys-seed.json'))), 'docker layout present');
  assert.ok(candidates.some(c => c.includes(path.join('apps', 'menu', 'scripts'))), 'repo layout present');
});

test('candidate list omits an unset MENU_DATA_PATH instead of yielding undefined', () => {
  const candidates = menuSeedCandidates({}, '/app/server');
  assert.ok(candidates.length >= 3);
  assert.ok(!candidates.includes(undefined));
});

test('resolveMenuDataPath skips a non-existent override and finds the image seed', () => {
  // Regression: the container could not resolve the Windows path in
  // server/.env and served an empty menu instead of the seeded one.
  const candidates = [WIN_HOST_SEED, DOCKER_SEED, REPO_SEED];
  const exists = candidate => candidate === DOCKER_SEED;
  assert.strictEqual(resolveMenuDataPath(candidates, exists), DOCKER_SEED);
});

test('resolveMenuDataPath honours MENU_DATA_PATH when it is a real file', () => {
  const candidates = [WIN_HOST_SEED, DOCKER_SEED];
  const exists = candidate => candidate === WIN_HOST_SEED;
  assert.strictEqual(resolveMenuDataPath(candidates, exists), WIN_HOST_SEED);
});

test('resolveMenuDataPath returns null when nothing exists, rather than a bogus path', () => {
  assert.strictEqual(
    resolveMenuDataPath([WIN_HOST_SEED, DOCKER_SEED], () => false),
    null,
  );
});

test('resolveMenuDataPath survives a throwing exists predicate', () => {
  const exists = () => { throw new Error('EACCES'); };
  assert.strictEqual(resolveMenuDataPath([DOCKER_SEED], exists), null);
});

test('countMenuItems counts nested categoria items', () => {
  const data = {
    menus: [
      { categorias: [{ items: [{}, {}] }, { items: [{}] }] },
      { categorias: [{ items: [{}] }] },
    ],
  };
  assert.strictEqual(countMenuItems(data), 4);
});

test('countMenuItems is 0 for the empty fallback and for malformed shapes', () => {
  assert.strictEqual(countMenuItems({ menus: [] }), 0);
  assert.strictEqual(countMenuItems({}), 0);
  assert.strictEqual(countMenuItems(null), 0);
  assert.strictEqual(countMenuItems({ menus: [{}] }), 0);
});
