import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, ANSWER_AT, thetaAt, pointAt, partsAt, drawnRanges, CAMERA, SOUND,
  CLICKS, T_NINETY,
} from '../src/lib/reel012.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';

// @lws.pune · reel 012 remade (predict-first): the angle keeps turning: what happens to sin²θ + cos²θ? A point circles a
// circle of radius 1; its triangle's legs are cos θ and sin θ; sin² and cos² trade places and their sum stays 1.
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const rad = (d: number) => (d * Math.PI) / 180;

test('the answer, re-derived: on every frame the point is on the unit circle and sin² + cos² = 1', () => {
  for (const t of frames) {
    const [x, y] = pointAt(t), th = rad(thetaAt(t)), { sin2, cos2 } = partsAt(t);
    near(x, Math.cos(th)); near(y, Math.sin(th)); near(x * x + y * y, 1, 1e-12);
    near(sin2, y * y); near(cos2, x * x); near(sin2 + cos2, 1, 1e-12);
  }
  assert.equal(OPTIONS[ANSWER].trim().split(/\s+/).pop(), '1');
  for (const o of OPTIONS) assert.ok(o.length <= 10, `chip too long: "${o}"`);
});

test('the angle turns on every frame, never backwards, and the parts really trade (each swings 0 ↔ 1)', () => {
  for (let i = 1; i < frames.length; i++) assert.ok(thetaAt(frames[i]) > thetaAt(frames[i - 1]), `θ stops at ${frames[i].toFixed(2)}`);
  const s = frames.map(t => partsAt(t).sin2);
  assert.ok(Math.max(...s) > 0.99 && Math.min(...s) < 0.01, 'sin² should reach both 0 and 1');
  assert.ok(thetaAt(ANSWER_AT) > 180, 'the answer lights after half a turn has shown the sum hold');
});

test('the graph draws itself over one full turn, then stays whole', () => {
  const total = (t: number) => drawnRanges(t).reduce((s, [a, b]) => s + (b - a), 0);
  for (let i = 1; i < frames.length; i++) assert.ok(total(frames[i]) >= total(frames[i - 1]) - 1e-9);
  near(total(DURATION), 360, 1e-9);
  for (const t of frames) for (const [a, b] of drawnRanges(t)) assert.ok(a >= 0 && b <= 360 && a <= b);
});

test('the 90° moment: the point sits near the top while the caption says so (sin² = 1, cos² = 0)', () => {
  const cap = CAPTIONS.find(c => c.text.includes('90°'))!;
  near(cap.t0, T_NINETY);
  for (const t of frames.filter(t => t >= cap.t0 && t <= cap.t1)) {
    const d = ((thetaAt(t) % 360) + 360) % 360;
    assert.ok(Math.abs(d - 90) <= 12, `θ = ${d.toFixed(1)}° at ${t.toFixed(2)} s`);
  }
});

test('the camera zooms in at least twice and out at least once, smoothly, with a punch-in landing on the answer', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys), b = tween(frames[i], CAMERA.start, CAMERA.keys);
    assert.ok(Math.abs(b[0] - a[0]) < 0.1 && Math.hypot(b[1] - a[1], b[2] - a[2]) < 45, `camera jumps at ${frames[i].toFixed(2)}`);
  }
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.2 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
});

test('sound from the picture: a click each time the point passes a 30° mark, a thunk on the answer, whooshes on fast zooms', () => {
  for (const c of CLICKS) { const d = thetaAt(c.t); assert.ok(Math.abs(d / 30 - Math.round(d / 30)) < 0.02, `click at ${d.toFixed(2)}°`); }
  const marks = Math.floor(thetaAt(END_AT) / 30) - Math.floor(thetaAt(0) / 30);
  assert.equal(CLICKS.length, marks);
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
  near(SOUND.duration, DURATION);
});

test('short (≤ 25 s), labels ≤ 7 words, a music hit on the answer', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT));
});
