import test from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import { BOX, N, R, FRAMES, lidAt, simulatePlain, simulateRapier } from '../src/lib/demoPhysics.ts';

// Realism demo 4 (2026-10-20): the same 40 gas molecules in a glass box, a lid squeezing them from 2 s. "Plain" is how
// our reels move molecules today (straight lines, walls only); "Rapier" adds real collisions between them. Remotion
// draws frames out of order, so the simulation is worked out once, in fixed steps, and must give the same result
// every time.
await RAPIER.init();
// Rapier lets a fast ball sink briefly into a wall while it resolves the contact: up to 0.018 here (~6 px for one frame,
// against a 60 px molecule behind glass), even with 8 solver passes. Allowed, with a margin.
const TOL = 0.02;
const inside = (p: number[], lid: number) =>
  Math.abs(p[0]) <= BOX.x - R + TOL && Math.abs(p[2]) <= BOX.z - R + TOL && p[1] >= -BOX.y + R - TOL && p[1] <= lid - R + TOL;
const minGap = (f: number[][]) => {
  let m = Infinity;
  for (let i = 0; i < f.length; i++) for (let j = i + 1; j < f.length; j++) m = Math.min(m, Math.hypot(f[i][0] - f[j][0], f[i][1] - f[j][1], f[i][2] - f[j][2]));
  return m;
};

test('the Rapier run is deterministic: two runs give identical frames', () => {
  assert.deepEqual(simulateRapier(RAPIER), simulateRapier(RAPIER));
});

test('both runs start from the same molecules, one position per molecule per frame', () => {
  const a = simulatePlain(), b = simulateRapier(RAPIER);
  assert.equal(a.length, FRAMES); assert.equal(b.length, FRAMES);
  assert.ok(a.every(f => f.length === N) && b.every(f => f.length === N));
  assert.deepEqual(a[0], b[0]);
});

test('the lid comes down from 2 s and every molecule stays inside the box under it', () => {
  assert.equal(lidAt(0), BOX.y); assert.equal(lidAt(1.9), BOX.y); assert.ok(lidAt(4.5) < BOX.y * 0.4);
  for (const run of [simulatePlain(), simulateRapier(RAPIER)])
    run.forEach((f, k) => f.forEach((p, i) => assert.ok(inside(p, lidAt(k / 30)), `molecule ${i} outside at frame ${k}: ${p}`)));
});

test('only Rapier keeps molecules from passing through each other', () => {
  const plain = simulatePlain(), rap = simulateRapier(RAPIER);
  const overlaps = (run: number[][][]) => run.filter(f => minGap(f) < 2 * R * 0.8).length;
  assert.ok(overlaps(plain) > FRAMES / 4, `plain overlaps in ${overlaps(plain)} frames`);
  assert.ok(overlaps(rap) <= 2, `rapier overlaps in ${overlaps(rap)} frames`);
});
