import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, OPTIONS, ANSWER, ANSWER_AT, T_HEADS, T_SIX, T_COIN2, GRID, cell, POP, popAt, headsAt, sixAt, bothAt, splitAt, chanceAt,
  CAPTIONS, CAMERA, SOUND, MUSIC_HITS, COVER_T,
} from '../src/lib/reel016.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';

// @lws.pune · Why? #6 (predict-first, flat 2D; the founder dropped the 3D opening for 2D reels, 2026-10-20): a coin shows heads AND a die shows 6: chance?
// 1/12. NDA Maths · Probability: for independent events P(A and B) = P(A) × P(B), shown as the square of all outcomes
// (2 coin columns × 6 die rows) where each "and" cuts the space.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const outcomes = (coins: number) => {
  let all: string[][] = [[]];
  for (let c = 0; c < coins; c++) all = all.flatMap(o => ['H', 'T'].map(s => [...o, s]));
  return all.flatMap(o => [1, 2, 3, 4, 5, 6].map(d => [...o, String(d)]));
};

test('the answer, re-derived by counting outcomes: 1 of 12 = ½ × ⅙; a second coin: 1 of 24', () => {
  const one = outcomes(1), hit1 = one.filter(o => o[0] === 'H' && o[1] === '6');
  assert.equal(one.length, 12); assert.equal(hit1.length, 1);
  const two = outcomes(2), hit2 = two.filter(o => o[0] === 'H' && o[1] === 'H' && o[2] === '6');
  assert.equal(two.length, 24); assert.equal(hit2.length, 1);
  assert.match(OPTIONS[ANSWER], /1\/12/);
  assert.ok(OPTIONS.some(o => /2\/3/.test(o)), 'the "add them" trap: ½ + ⅙ = ⅔');
  assert.ok(OPTIONS.some(o => /\b1\/6\b/.test(o)), 'the "forget the coin" trap');
  assert.deepEqual(chanceAt(ANSWER_AT + 0.5), { num: 1, den: 12 });
  assert.deepEqual(chanceAt(T_COIN2 + 1), { num: 1, den: 24 });
});

test('the square: 2 columns (heads, tails) × 6 rows (die 1–6), cells tiling the grid exactly', () => {
  assert.equal(GRID.cols, 2); assert.equal(GRID.rows, 6);
  let area = 0;
  for (let c = 0; c < 2; c++) for (let r = 0; r < 6; r++) { const k = cell(c, r); area += k.w * k.h; }
  assert.equal(area, GRID.w * GRID.h);
  assert.equal(cell(1, 5).x + cell(1, 5).w, GRID.x + GRID.w); assert.equal(cell(1, 5).y + cell(1, 5).h, GRID.y + GRID.h);
});

test('the 12 cells pop in one by one from frame 0, and something changes on every frame of the first 3 s (F5)', () => {
  for (let i = 0; i < 12; i++) { assert.equal(popAt(i, 0), 0); assert.equal(popAt(i, T_HEADS), 1); }
  for (let i = 1; i < 12; i++) assert.ok(popAt(i, POP(i)) === 0 && popAt(i - 1, POP(i)) > 0, 'one by one');
  for (let f = 1; f <= 90; f++) {
    const a = tween((f - 1) / 30, CAMERA.start, CAMERA.keys), b = tween(f / 30, CAMERA.start, CAMERA.keys);
    assert.ok(b.some((v, i) => v !== a[i]), `still at frame ${f}`);
  }
});

test('the story in order: the cells, then heads, then a six, then both, then a second coin', () => {
  assert.ok(0 < T_HEADS && T_HEADS < T_SIX && T_SIX < ANSWER_AT && ANSWER_AT < T_COIN2 && T_COIN2 < END_AT);
  assert.equal(headsAt(T_HEADS - 0.01), 0); assert.equal(headsAt(T_SIX), 1);
  assert.equal(sixAt(T_SIX - 0.01), 0); assert.equal(sixAt(ANSWER_AT), 1);
  assert.equal(bothAt(ANSWER_AT - 0.31), 0); assert.equal(bothAt(ANSWER_AT + 0.3), 1);
  assert.equal(splitAt(T_COIN2 - 0.01), 0); assert.equal(splitAt(T_COIN2 + 0.8), 1);
  assert.ok(ANSWER_AT < 5, 'the answer comes within 5 s');
  assert.deepEqual(chanceAt(T_HEADS + 0.9), { num: 1, den: 2 });
});

test('the cover shows the grid built, before anything is answered (F6)', () => {
  assert.ok(COVER_T < T_HEADS && headsAt(COVER_T) === 0 && popAt(9, COVER_T) === 1);
});

test('the camera: zooms in twice and out once, a punch-in landing on the answer, no jumps', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.3 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys), b = tween(frames[i], CAMERA.start, CAMERA.keys);
    assert.ok(b[0] >= 0.95 && b[0] <= 1.9 && Math.abs(b[0] - a[0]) < 0.1 && Math.abs(b[1] - a[1]) < 40 && Math.abs(b[2] - a[2]) < 40, `camera jumps at ${frames[i]}`);
  }
});

test('sound from the picture: a pop per cell as it appears, a tap per cell as it fills, a thunk on the answer, a click on the split, whooshes', () => {
  const taps = SOUND.hits.filter(h => h.kind === 'tap');
  assert.equal(taps.length, 6 + 2, 'six heads cells, two six cells');
  assert.ok(taps.every(h => (h.t >= T_HEADS && h.t < T_SIX) || (h.t >= T_SIX && h.t < ANSWER_AT)));
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  assert.ok(SOUND.hits.some(h => h.kind === 'click' && Math.abs(h.t - T_COIN2) < 1e-9));
  assert.equal(SOUND.hits.filter(h => h.kind === 'click' && h.t < T_HEADS).length, 12, 'a pop per cell');
  const wh = whooshesFor(CAMERA.start, CAMERA.keys);
  for (const w of wh) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  assert.equal(SOUND.duration, DURATION);
});

test('short (≤ 25 s), labels ≤ 7 words, music hits on the answer and the split', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, T_COIN2]);
});
