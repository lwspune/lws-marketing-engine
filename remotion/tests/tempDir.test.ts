import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { RENDER_TEMP, STALE_MINUTES, staleEntries, cleanTempDir, strayProfiles, cleanStrayProfiles } from '../tools/tempDir.ts';

// Renders leave their browser profiles behind on Windows (Remotion's delete runs while Edge still holds the files):
// 7.6 GB of them by 2026-10-22. remotion.config.ts sends every render's temp files to RENDER_TEMP and clears what's
// stale there before each render; `npm run clean:temp` does the same by hand.
const now = Date.parse('2026-10-22T16:00:00Z');
const minutesAgo = (m: number) => now - m * 60_000;

test('the render temp folder is inside the system temp folder, never in the repo', () => {
  assert.ok(resolve(RENDER_TEMP).startsWith(resolve(tmpdir())), RENDER_TEMP);
  assert.ok(!resolve(RENDER_TEMP).startsWith(resolve('..')), 'inside the repo');
});

test('only entries older than the stale age are picked', () => {
  assert.ok(STALE_MINUTES >= 30, 'a render still running must never lose its files');
  const picked = staleEntries([
    { name: 'puppeteer_dev_chrome_profile-old', mtimeMs: minutesAgo(STALE_MINUTES + 1) },
    { name: 'puppeteer_dev_chrome_profile-new', mtimeMs: minutesAgo(STALE_MINUTES - 1) },
    { name: 'react-motion-render-old', mtimeMs: minutesAgo(600) },
  ], now);
  assert.deepEqual(picked.sort(), ['puppeteer_dev_chrome_profile-old', 'react-motion-render-old']);
});

test('cleanTempDir removes stale folders and files, keeps fresh ones, and reports what it freed', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tempdir-test-'));
  try {
    const old = join(dir, 'puppeteer_dev_chrome_profile-old'), fresh = join(dir, 'puppeteer_dev_chrome_profile-new');
    mkdirSync(join(old, 'Default'), { recursive: true });
    writeFileSync(join(old, 'Default', 'cache.bin'), Buffer.alloc(2048));
    mkdirSync(fresh);
    writeFileSync(join(dir, 'stray.wav'), Buffer.alloc(1024));
    const past = new Date(minutesAgo(STALE_MINUTES + 10));
    utimesSync(old, past, past); utimesSync(join(dir, 'stray.wav'), past, past);
    const fresher = new Date(minutesAgo(1));
    utimesSync(fresh, fresher, fresher);
    const r = cleanTempDir(dir, now);
    assert.equal(existsSync(old), false);
    assert.equal(existsSync(join(dir, 'stray.wav')), false);
    assert.equal(existsSync(fresh), true);
    assert.equal(r.removed, 2);
    assert.equal(r.skipped, 0);
    assert.ok(r.bytes >= 3072, `freed ${r.bytes} bytes`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a missing folder is created, not an error', () => {
  const dir = join(mkdtempSync(join(tmpdir(), 'tempdir-test-')), 'render-temp');
  try {
    assert.deepEqual(cleanTempDir(dir, now), { removed: 0, skipped: 0, bytes: 0 });
    assert.ok(existsSync(dir));
  } finally {
    rmSync(join(dir, '..'), { recursive: true, force: true });
  }
});

// Remotion called from a script (tools/stills.ts, not a `remotion render`) never reads remotion.config.ts, so its browser
// profiles landed in the system temp folder: 324 of them, 4.8 GB, by 2026-10-26, with the disk at 0.6 GB free. The sweep
// takes only stale `puppeteer_dev_chrome_profile-*` folders there; everything else in the system temp belongs to other apps.
test('in the system temp folder only stale browser profiles are picked', () => {
  const picked = strayProfiles([
    { name: 'puppeteer_dev_chrome_profile-old', mtimeMs: minutesAgo(STALE_MINUTES + 1) },
    { name: 'puppeteer_dev_chrome_profile-new', mtimeMs: minutesAgo(STALE_MINUTES - 1) },
    { name: 'some-other-app-cache', mtimeMs: minutesAgo(6000) },
    { name: 'edge-abc123', mtimeMs: minutesAgo(6000) },
  ], now);
  assert.deepEqual(picked, ['puppeteer_dev_chrome_profile-old']);
});

test('cleanStrayProfiles removes stale profiles and leaves fresh ones and other apps\u2019 files', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tempdir-test-'));
  try {
    const old = join(dir, 'puppeteer_dev_chrome_profile-old'), fresh = join(dir, 'puppeteer_dev_chrome_profile-new'), other = join(dir, 'other-app');
    for (const d of [old, fresh, other]) mkdirSync(join(d, 'Default'), { recursive: true });
    writeFileSync(join(old, 'Default', 'cache.bin'), Buffer.alloc(4096));
    const past = new Date(minutesAgo(STALE_MINUTES + 10));
    utimesSync(old, past, past); utimesSync(other, past, past);
    const r = cleanStrayProfiles(dir, now);
    assert.equal(existsSync(old), false);
    assert.equal(existsSync(fresh), true);
    assert.equal(existsSync(other), true);
    assert.deepEqual([r.removed, r.skipped], [1, 0]);
    assert.ok(r.bytes >= 4096);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
