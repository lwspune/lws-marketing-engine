// Headless-Edge runs that are killed or crash leave their ~30 MB throwaway profile behind; 124 of them
// filled the disk on 2026-10-17. sweepStaleProfiles() removes old ones and must never touch fresh ones
// (a run in progress) or anything that isn't an `edge-*` folder.
const test = require('node:test');
const assert = require('node:assert');
const { mkdtempSync, mkdirSync, writeFileSync, existsSync, utimesSync, rmSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');

test('removes edge-* profiles older than the cut-off, keeps fresh ones and other folders', async () => {
  const { sweepStaleProfiles } = await import('../reels/tools/edge.mjs');
  const root = mkdtempSync(join(tmpdir(), 'sweep-test-'));
  try {
    const make = (name, ageMin) => {
      const d = join(root, name); mkdirSync(d); writeFileSync(join(d, 'f'), 'x');
      const t = new Date(Date.now() - ageMin * 60_000); utimesSync(d, t, t); return d;
    };
    const old = make('edge-old111', 60), fresh = make('edge-new222', 2), other = make('keepme', 600);
    const removed = sweepStaleProfiles(root, 30 * 60_000);
    assert.strictEqual(removed, 1);
    assert.ok(!existsSync(old), 'old profile removed');
    assert.ok(existsSync(fresh), 'fresh profile kept (may be a run in progress)');
    assert.ok(existsSync(other), 'non-edge folder kept');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
