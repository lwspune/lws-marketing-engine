import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, volumeAt, pressureAt, particleAt, pistonHits, hitsPerSecond, N, R_BALL, HALF_W, heightAt,
  graphPoint, flipAt, curveSamples,
} from '../src/lib/pv002.ts';

// @pyqvault_ · Physics, visualised #2: Boyle's law. The piston halves the volume twice (4 → 2 → 1 L); the gas
// hits the piston twice as often each time, so the pressure doubles, and P × V stays 4.
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('volume: 4 L at the start, held at 2 L, ends at 1 L; never grows and never jumps', () => {
  near(volumeAt(0), 4); near(volumeAt(8.9), 4);
  near(volumeAt(14), 2); near(volumeAt(16.9), 2);
  near(volumeAt(21), 1); near(volumeAt(END_AT), 1);
  for (let i = 1; i < frames.length; i++) {
    const d = volumeAt(frames[i]) - volumeAt(frames[i - 1]);
    assert.ok(d <= 1e-12 && d > -0.08, `volume step ${d} at ${frames[i]}`);
  }
});

test("Boyle's law: P × V = 4 on every frame (1 atm at 4 L, 2 at 2 L, 4 at 1 L)", () => {
  for (const t of frames) near(pressureAt(t) * volumeAt(t), 4, 1e-9);
  near(pressureAt(0), 1); near(pressureAt(15), 2); near(pressureAt(22), 4);
});

test('every particle stays inside the cylinder on every frame (centres between floor and piston)', () => {
  for (const t of frames) {
    const h = heightAt(t);
    for (let i = 0; i < N; i++) {
      const [x, y, z] = particleAt(i, t);
      assert.ok(Math.abs(x) <= HALF_W + 1e-9 && Math.abs(z) <= HALF_W + 1e-9, `particle ${i} through the wall at ${t}`);
      assert.ok(y >= -1e-9 && y <= h + 1e-9, `particle ${i} outside floor/piston at ${t} (y ${y}, h ${h})`);
    }
  }
  assert.ok(HALF_W + R_BALL < 0.9 / Math.SQRT2 + 1e-9, 'the square the balls move in fits inside the round glass');
});

test('particles move smoothly: no jump bigger than a ball per frame', () => {
  for (let k = 1; k < frames.length; k++) for (let i = 0; i < N; i++) {
    const a = particleAt(i, frames[k - 1]), b = particleAt(i, frames[k]);
    assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 2 * R_BALL, `particle ${i} jumps at ${frames[k]}`);
  }
});

test('the why: half the volume → about twice the hits on the piston (measured from the simulation)', () => {
  const rate = (t0: number, t1: number) => pistonHits(t0, t1) / (t1 - t0);
  const r4 = rate(2, 9), r2 = rate(11.8, 17), r1 = rate(19.8, END_AT);
  assert.ok(r4 > 8, `enough hits to count at 4 L (${r4.toFixed(1)}/s)`);
  assert.ok(Math.abs(r2 / r4 - 2) < 0.3, `4 L → 2 L: ×${(r2 / r4).toFixed(2)}`);
  assert.ok(Math.abs(r1 / r4 - 4) < 0.6, `4 L → 1 L: ×${(r1 / r4).toFixed(2)}`);
});

test('hits counter: pure (same answer twice) and a whole number per second', () => {
  for (const t of [1, 5.3, 14.2, 23.9]) {
    assert.equal(hitsPerSecond(t), hitsPerSecond(t));
    assert.ok(Number.isInteger(hitsPerSecond(t)) && hitsPerSecond(t) >= 0);
  }
});

test('graph: the dot is always on P = 4/V; after the flip the samples lie on one line through the origin', () => {
  for (const t of frames) { const g = graphPoint(t); near(g.P * g.V, 4, 1e-9); }
  const pts = curveSamples(END_AT, 1);            // fully flipped: x is 1/V
  for (const p of pts) near(p.P / p.x, 4, 1e-9);  // P = 4 · (1/V): a straight line through the origin
  near(flipAt(0), 0); near(flipAt(END_AT), 1);
});

test('house settings: short labels only (≤ 7 words a line), captions in order, nothing after the end card', () => {
  for (const c of CAPTIONS) for (const line of c.text.split('\n'))
    assert.ok(line.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${line}"`);
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT + 1e-9);
});
