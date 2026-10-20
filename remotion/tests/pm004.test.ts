import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, ANSWER_AT, T_VALLEY, f, df, xAt, CAMERA, SOUND, GRID_X,
} from '../src/lib/pm004.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';

// @pyqvault_ · Maths, visualised #3 (predict-first): f and f′ together. f(x) = x³ − 3x, f′(x) = 3x² − 3. A tangent slides
// along f and its slope is drawn below as f′. At the top of the hill (x = −1) and the bottom of the valley (x = 1) the
// tangent is flat: f′ = 0. Answer: B zero.
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('the answer, re-derived: f′ really is the slope of f, and it is zero at the peak (x = −1) and the valley (x = 1)', () => {
  for (const x of [-2, -1.3, -0.4, 0, 0.7, 1.9]) near(df(x), (f(x + 1e-6) - f(x - 1e-6)) / 2e-6, 1e-5);
  near(df(-1), 0); near(df(1), 0);
  assert.ok(f(-1) > f(-1.05) && f(-1) > f(-0.95), 'x = −1 is a peak');
  assert.ok(f(1) < f(1.05) && f(1) < f(0.95), 'x = 1 is a valley');
  assert.match(OPTIONS[ANSWER], /zero/);
  near(xAt(ANSWER_AT), -1); near(xAt(T_VALLEY), 1);
});

test('the tangent point only moves forward, smoothly, and is already moving on every frame of the first 3 s', () => {
  for (let i = 1; i < frames.length; i++) {
    const d = xAt(frames[i]) - xAt(frames[i - 1]);
    assert.ok(d >= -1e-12 && d < 0.06, `step ${d} at ${frames[i]}`);
  }
  for (let k = 1; k <= 90; k++) assert.ok(xAt(k / 30) > xAt((k - 1) / 30), `still at frame ${k}`);
  near(xAt(0), -2); near(xAt(END_AT), 2);
});

test('zooms: at least two in and one out, smooth, a punch-in landing on the answer at the peak', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys)[0], b = tween(frames[i], CAMERA.start, CAMERA.keys)[0];
    assert.ok(b >= 0.85 && b <= 2.2 && Math.abs(b - a) < 0.1, `zoom ${b} at ${frames[i]}`);
  }
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.3 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
});

test('sound: a tick at each gridline the tangent passes, its pitch following the slope there; a knock at each zero', () => {
  const ticks = SOUND.hits.filter(h => h.kind === 'click');
  assert.equal(ticks.length, GRID_X.length);
  ticks.forEach((h, i) => near(xAt(h.t), GRID_X[i], 1e-6));
  for (let i = 1; i < ticks.length; i++) {           // steeper slope → higher pitch, everywhere
    const a = df(GRID_X[i - 1]), b = df(GRID_X[i]);
    if (a !== b) assert.equal(Math.sign(ticks[i].pitch! - ticks[i - 1].pitch!), Math.sign(b - a));
  }
  const knocks = SOUND.hits.filter(h => h.kind === 'thunk');
  assert.equal(knocks.length, 2);
  near(knocks[0].t, ANSWER_AT); near(knocks[1].t, T_VALLEY);
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
});

test('short (≤ 25 s), labels ≤ 7 words, music hits on both zeros', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT) && MUSIC_HITS.includes(T_VALLEY));
});
