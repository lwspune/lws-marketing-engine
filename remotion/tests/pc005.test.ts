import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, ANSWER_AT, T_HEAT1, T_UNLOCK, T_SQ0, T_SQ1, tempAt, volumeAt, pressureAt,
  heightAt, speedAt, particleAt, flameAt, pistonSpeedAt, N, HALF_W, R_BALL, CAMERA, SOUND,
} from '../src/lib/pc005.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';

// @pyqvault_ · Chemistry, visualised #5 (predict-first): P, V and T together. Fixed amount of gas: P·V/T is constant.
// Heat it with the lid locked (300 → 600 K: P × 2), then hold 600 K and squeeze it to half (P × 2 again): P × 4.
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const DEG = 180 / Math.PI;

test('the answer, re-derived: double T and halve V → P × 4, and the right option says ×4', () => {
  near(tempAt(END_AT), 600); near(volumeAt(END_AT), 1); near(pressureAt(END_AT), 4);
  assert.match(OPTIONS[ANSWER], /×4/);
  near(pressureAt(T_HEAT1 + 0.1), 2);                                   // heating alone: × 2
});

test('P·V/T never changes, on every frame; the lid stays locked while it heats; heat stops before the squeeze', () => {
  for (const t of frames) near((pressureAt(t) * volumeAt(t)) / tempAt(t), (1 * 2) / 300, 1e-12);
  for (const t of frames.filter(t => t < T_UNLOCK)) near(volumeAt(t), 2);
  for (const t of frames.filter(t => t >= T_SQ0)) near(tempAt(t), 600);
  assert.ok(T_HEAT1 < T_UNLOCK && T_UNLOCK < T_SQ0 && T_SQ1 < ANSWER_AT);
  assert.equal(flameAt(0), 0); assert.ok(flameAt(1 / 30) > 0); assert.equal(flameAt(T_HEAT1 + 0.6), 0);
});

test('molecules: speed ∝ √T, inside on every frame, smooth, already moving at frame 0', () => {
  near(speedAt(END_AT), Math.SQRT2);
  for (let k = 0; k < frames.length; k++) for (let i = 0; i < N; i++) {
    const t = frames[k], [x, y, z] = particleAt(i, t);
    assert.ok(Math.abs(x) <= HALF_W + 1e-9 && Math.abs(z) <= HALF_W + 1e-9 && y >= -1e-9 && y <= heightAt(t) + 1e-9, `${i} out at ${t}`);
    if (k) { const p = particleAt(i, frames[k - 1]); assert.ok(Math.hypot(x - p[0], y - p[1], z - p[2]) < 2 * R_BALL, `jump ${i} at ${t}`); }
  }
  for (let f = 1; f <= 90; f++) assert.ok(particleAt(0, f / 30).some((v, j) => v !== particleAt(0, (f - 1) / 30)[j]), `still at frame ${f}`);
});

test('orbit (framework F22): one 60–120° arc in the opening, back at the front view before the squeeze and the answer', () => {
  const az = frames.map(t => tween(t, CAMERA.start, CAMERA.keys)[2] * DEG);
  const span = Math.max(...az) - Math.min(...az);
  assert.ok(span >= 60 && span <= 120, `orbit spans ${span.toFixed(0)}°`);
  frames.forEach((t, i) => { if (t >= T_SQ0 - 0.2) assert.ok(Math.abs(az[i]) < 0.5, `still orbiting at ${t} (${az[i].toFixed(1)}°)`); });
  for (let i = 1; i < az.length; i++) assert.ok(Math.abs(az[i] - az[i - 1]) < 2.5, `orbit jumps at ${frames[i]}`);
});

test('zooms: at least two in and one out, smooth, a punch-in landing on the answer, never while orbiting', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys)[0], b = tween(frames[i], CAMERA.start, CAMERA.keys)[0];
    assert.ok(b >= 0.85 && b <= 2.2 && Math.abs(b - a) < 0.1, `zoom ${b} at ${frames[i]}`);
  }
  const punch = CAMERA.keys.find(k => k.dur <= 0.5 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05);
  assert.ok(punch, 'no punch-in on the answer');
  assert.equal(tween(punch.t, CAMERA.start, CAMERA.keys)[2], 0, 'punch-in while orbiting');
});

test('sound: burner whump + roar while lit, the lock clicks open, taps are real lid hits, scrape while squeezing, thunk', () => {
  assert.ok(SOUND.hits.some(h => h.kind === 'whump' && h.t === 0));
  const roar = SOUND.beds.find(b => b.kind === 'roar')!;
  for (const t of frames) assert.equal(roar.level(t), flameAt(t));
  assert.ok(SOUND.hits.some(h => h.kind === 'click' && Math.abs(h.t - T_UNLOCK) < 1e-9));
  const taps = SOUND.hits.filter(h => h.kind === 'tap');
  assert.ok(taps.length > 150);
  for (const h of taps) assert.ok(Array.from({ length: N }, (_, i) => particleAt(i, h.t)[1]).some(y => Math.abs(y - heightAt(h.t)) < 0.01), `tap at ${h.t}`);
  const rate = (a: number, b: number) => taps.filter(h => h.t >= a && h.t < b).length / (b - a);
  assert.ok(rate(T_SQ1, T_SQ1 + 2) > 2 * rate(0, 1.5), 'hot and squeezed: the lid is hit far more often (theory 2√2 ≈ 2.8×)');
  const scrape = SOUND.beds.find(b => b.kind === 'scrape')!;
  near(scrape.t0, T_SQ0); near(scrape.t1, T_SQ1);
  assert.equal(pistonSpeedAt(T_SQ1 + 0.1), 0);
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - T_SQ1) < 1e-9));
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
});

test('short (≤ 25 s), labels ≤ 7 words, a music hit on the answer', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT));
});
