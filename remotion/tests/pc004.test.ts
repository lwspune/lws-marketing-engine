import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, T_DONE, celsiusAt, kelvinAt, volumeAt, heightAt, speedAt,
  particleAt, N, HALF_W, R_BALL, lineV,
} from '../src/lib/pc004.ts';

// @pyqvault_ · Chemistry, visualised #4 (predict-first): Charles's law. Heat a gas at constant pressure from 0 °C to
// 273 °C: its volume doubles, because 0 °C → 273 °C is 273 K → 546 K (V ∝ absolute temperature).
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('the answer, re-derived: 273 K → 546 K doubles the volume, and the right option says ×2', () => {
  near(kelvinAt(0), 273); near(kelvinAt(END_AT), 546);
  near(volumeAt(END_AT) / volumeAt(0), 2);
  assert.match(OPTIONS[ANSWER], /×2/);
});

test('it only heats up, smoothly, 0 → 273 °C, and V ∝ T (kelvin) on every frame', () => {
  near(celsiusAt(0), 0); near(celsiusAt(T_DONE), 273);
  for (let i = 1; i < frames.length; i++) {
    const d = celsiusAt(frames[i]) - celsiusAt(frames[i - 1]);
    assert.ok(d >= -1e-9 && d < 2.5, `temperature step ${d} at ${frames[i]}`);
  }
  for (const t of frames) near(volumeAt(t) / kelvinAt(t), 1 / 273, 1e-12);
});

test('hotter molecules move faster: speed ∝ √T, so √2 times faster at the end', () => {
  near(speedAt(0), 1); near(speedAt(END_AT), Math.SQRT2, 1e-9);
});

test('every particle stays inside, between floor and lid, and moves smoothly', () => {
  for (let k = 0; k < frames.length; k++) {
    const t = frames[k];
    for (let i = 0; i < N; i++) {
      const [x, y, z] = particleAt(i, t);
      assert.ok(Math.abs(x) <= HALF_W + 1e-9 && Math.abs(z) <= HALF_W + 1e-9 && y >= -1e-9 && y <= heightAt(t) + 1e-9, `particle ${i} out at ${t}`);
      if (k) { const p = particleAt(i, frames[k - 1]); assert.ok(Math.hypot(x - p[0], y - p[1], z - p[2]) < 2 * R_BALL, `jump ${i} at ${t}`); }
    }
  }
});

test('the why: the V–T line, extended backwards, reaches zero volume at −273 °C', () => {
  near(lineV(-273), 0); near(lineV(0), 1); near(lineV(273), 2);
});

test('short (≤ 25 s), short labels, music hits on the answer and on absolute zero', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) for (const l of c.text.split('\n'))
    assert.ok(l.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${l}"`);
  assert.ok(MUSIC_HITS.includes(T_DONE));
});
