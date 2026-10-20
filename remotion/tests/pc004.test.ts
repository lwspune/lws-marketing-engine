import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, T_DONE, celsiusAt, kelvinAt, volumeAt, heightAt, speedAt,
  particleAt, N, HALF_W, R_BALL, lineV, T_LINE, T_ZERO, flameAt, CAMERA, GRAPH_ZOOM, SOUND,
} from '../src/lib/pc004.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';

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

test('short (≤ 25 s), short labels, a music hit on the answer (0 K gets its own boom)', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) for (const l of c.text.split('\n'))
    assert.ok(l.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${l}"`);
  assert.ok(MUSIC_HITS.includes(T_DONE));
});

// Remake (founder, 2026-10-20): the picture moves from frame 0 behind the question, the camera zooms in and out, and
// the sound comes from the experiment itself (a gas being heated: burner and molecules, no boiling: nothing boils).
test('the burner lights on frame 0 and the gas warms on every frame until 273 °C, then the burner goes out', () => {
  assert.equal(flameAt(0), 0);
  assert.ok(flameAt(1 / 30) > 0 && flameAt(0.5) === 1);
  for (let f = 1; f <= 90; f++) assert.ok(celsiusAt(f / 30) > celsiusAt((f - 1) / 30), `still at frame ${f}`);
  assert.equal(flameAt(T_DONE + 0.6), 0);
});

test('the camera zooms in at least twice and out at least once, smoothly; the graph zooms onto −273 °C and back', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys)[0], b = tween(frames[i], CAMERA.start, CAMERA.keys)[0];
    assert.ok(b >= 0.85 && b <= 2.2 && Math.abs(b - a) < 0.1, `zoom ${b} at ${frames[i]}`);
  }
  const g = (t: number) => tween(t, GRAPH_ZOOM.start, GRAPH_ZOOM.keys)[0];
  assert.equal(g(T_LINE), 1);
  assert.ok(g(T_ZERO + 0.3) > 1.5, 'zoomed in on −273 °C when 0 K glows');
  assert.equal(g(END_AT), 1);
});

test('a "whump" as the burner lights, its roar follows the flame, and every tap is a real hit on the lid', () => {
  assert.ok(SOUND.hits.some(h => h.kind === 'whump' && h.t === 0));
  const roar = SOUND.beds.filter(b => b.kind === 'roar');
  assert.equal(roar.length, 1);
  for (let t = 0; t < END_AT; t += 0.1) assert.equal(roar[0].level(t), flameAt(t));
  const taps = SOUND.hits.filter(h => h.kind === 'tap');
  assert.ok(taps.length > 100);
  for (const h of taps) {
    const atLid = Array.from({ length: N }, (_, i) => particleAt(i, h.t)[1]).some(y => Math.abs(y - heightAt(h.t)) < 0.01);
    assert.ok(atLid, `tap at ${h.t} with no molecule at the lid`);
  }
});

test('honest physics in the taps: hotter means fewer hits on the risen lid each second, but each one harder', () => {
  const taps = SOUND.hits.filter(h => h.kind === 'tap'), win = (a: number, b: number) => taps.filter(h => h.t >= a && h.t < b);
  const cold = win(0, 2), hot = win(T_DONE, T_DONE + 2);
  const rate = hot.length / cold.length, avg = (hs: typeof taps) => hs.reduce((s, h) => s + h.gain, 0) / hs.length;
  assert.ok(rate > 0.5 && rate < 0.95, `hit-rate ratio ${rate} (theory √2 / 2 ≈ 0.71)`);
  assert.ok(Math.abs(avg(hot) / avg(cold) - speedAt(T_DONE) / speedAt(1)) < 0.1, 'each hit is harder in proportion to speed');
});

test('a deep boom as 0 K glows, whooshes on the fast zooms, all over before the end card fades', () => {
  assert.ok(SOUND.hits.some(h => h.kind === 'boom' && Math.abs(h.t - T_ZERO) < 1e-9));
  const w = [...whooshesFor(CAMERA.start, CAMERA.keys), ...whooshesFor(GRAPH_ZOOM.start, GRAPH_ZOOM.keys)];
  assert.ok(w.length >= 3);
  for (const h of w) assert.ok(SOUND.hits.some(s => s.kind === h.kind && Math.abs(s.t - h.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
  assert.equal(SOUND.duration, DURATION);
});
