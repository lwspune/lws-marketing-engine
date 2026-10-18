import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, NMAX, R_BALL, HALF_W, countAt, volumeAt, heightAt, present, particleAt, lidHits, ADDS,
} from '../src/lib/pc003.ts';

// @pyqvault_ · Chemistry, visualised #3: Avogadro's law. Add gas at the same pressure and temperature: the free lid
// rises so the volume grows in step with the amount (12 → 24 → 48 particles, 1 → 2 → 4 L), and each square of lid is
// hit just as often, so the pressure stays the same.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

test('the amount doubles twice (12 → 24 → 48) and the volume follows it exactly: V/n stays the same', () => {
  assert.equal(countAt(0), 12); assert.equal(countAt(ADDS[0].t1 + 0.6), 24); assert.equal(countAt(END_AT), 48);
  near(volumeAt(0), 1); near(volumeAt(ADDS[0].t1 + 0.6), 2); near(volumeAt(END_AT), 4); // the lid settles 0.6 s after the last particle
  for (const t of frames) assert.ok(Math.abs(volumeAt(t) / (countAt(t) / 12) - 1) < 0.2, `V/n drifts at ${t}`);
  assert.equal(NMAX, 48);
});

test('every particle that is in the gas stays inside the cylinder (between floor and lid)', () => {
  for (const t of frames) for (let i = 0; i < NMAX; i++) {
    if (!present(i, t)) continue;
    const [x, y, z] = particleAt(i, t);
    assert.ok(Math.abs(x) <= HALF_W + 1e-9 && Math.abs(z) <= HALF_W + 1e-9, `particle ${i} through the wall at ${t}`);
    assert.ok(y >= -1e-9 && y <= heightAt(t) + 1e-9, `particle ${i} outside at ${t}`);
  }
});

test('particles move smoothly: under two radii per frame', () => {
  for (let k = 1; k < frames.length; k++) for (let i = 0; i < NMAX; i++) {
    if (!present(i, frames[k - 1]) || !present(i, frames[k])) continue;
    const a = particleAt(i, frames[k - 1]), b = particleAt(i, frames[k]);
    assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 2 * R_BALL, `particle ${i} jumps at ${frames[k]}`);
  }
});

test('the why: twice the gas in twice the room hits the lid just as often (measured from the simulation)', () => {
  const rate = (t0: number, t1: number) => lidHits(t0, t1) / (t1 - t0);
  const r1 = rate(2, ADDS[0].t0), r2 = rate(ADDS[0].t1 + 0.5, ADDS[1].t0), r4 = rate(ADDS[1].t1 + 0.5, END_AT);
  assert.ok(r1 > 6, `enough hits to count (${r1.toFixed(1)}/s)`);
  assert.ok(Math.abs(r2 / r1 - 1) < 0.25 && Math.abs(r4 / r1 - 1) < 0.25, `rates ${r1.toFixed(1)} → ${r2.toFixed(1)} → ${r4.toFixed(1)}`);
});

test('house settings: short labels; music hits on each "add gas"', () => {
  for (const c of CAPTIONS) for (const l of c.text.split('\n'))
    assert.ok(l.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${l}"`);
  for (const a of ADDS) assert.ok(MUSIC_HITS.includes(a.t0));
  assert.ok(END_AT < DURATION);
});
