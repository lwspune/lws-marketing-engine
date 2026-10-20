import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Supply-chain guard for the only folder (with publisher/) where npm is allowed (CLAUDE.md, Remotion trial).
// A new package must be pinned, come from the npm registry, and run no install script we haven't looked at.
type Lock = { packages: Record<string, { version?: string; resolved?: string; hasInstallScript?: boolean;
  dependencies?: Record<string, string>; devDependencies?: Record<string, string> }> };
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  dependencies: Record<string, string>; devDependencies: Record<string, string> };
const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8')) as Lock;
const all = { ...pkg.dependencies, ...pkg.devDependencies };

// Packages allowed to run code on install, each read and approved by name.
const INSTALL_SCRIPTS_OK = new Set(['esbuild']); // Remotion's bundler: fetches its own platform binary

test('deps: every package is pinned to an exact version', () => {
  const loose = Object.entries(all).filter(([, v]) => !/^\d+\.\d+\.\d+$/.test(v));
  assert.deepEqual(loose, [], 'use "x.y.z", never ^, ~, ranges or tags');
});

test('deps: remotion and every @remotion/* package share one version', () => {
  const versions = new Set(Object.entries(all).filter(([n]) => n === 'remotion' || n.startsWith('@remotion/')).map(([, v]) => v));
  assert.equal(versions.size, 1, `found ${[...versions].join(', ')}`);
});

test('deps: package-lock.json matches package.json', () => {
  const root = lock.packages[''];
  assert.deepEqual({ ...root.dependencies, ...root.devDependencies }, all, 'run npm install to refresh the lock');
  for (const [name, version] of Object.entries(all)) {
    assert.equal(lock.packages[`node_modules/${name}`]?.version, version, `${name} in the lock`);
  }
});

test('deps: every package comes from the npm registry', () => {
  const other = Object.entries(lock.packages)
    .filter(([path, p]) => path && p.resolved && !p.resolved.startsWith('https://registry.npmjs.org/'))
    .map(([path]) => path);
  assert.deepEqual(other, []);
});

test('deps: no install scripts except the approved ones', () => {
  const scripts = Object.entries(lock.packages).filter(([, p]) => p.hasInstallScript)
    .map(([path]) => path.replace(/^.*node_modules\//, ''))
    .filter((name) => !INSTALL_SCRIPTS_OK.has(name));
  assert.deepEqual(scripts, [], 'read the script, then add the package to INSTALL_SCRIPTS_OK');
});

// The new tools (2026-10-20, founder-approved): the test fails until they are installed.
test('deps: the reel toolkit is installed', () => {
  for (const name of ['@remotion/paths', '@remotion/noise', '@remotion/rough-notation', '@react-three/postprocessing',
    'postprocessing', 'perfect-freehand']) assert.ok(all[name], `${name} in package.json`);
});
