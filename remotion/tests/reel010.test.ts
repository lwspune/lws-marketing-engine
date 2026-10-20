import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, ANSWER_AT, ROLLS, N_ROLLS, rolledBy, countsAt, landedBy, WAYS,
  T_GRID, gridLitAt, CAMERA, SOUND, SEED, CLICKS,
} from '../src/lib/reel010.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';

// @lws.pune · reel 010 remade (predict-first): roll two dice: which total comes up most? Real seeded rolls drop chips into
// a histogram; 7 pulls ahead; then the 6×6 grid of outcomes shows why: 7's diagonal is the longest, 6 ways of 36.
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('the answer, re-derived: 36 equally likely outcomes, and 7 has the most ways (6)', () => {
  const ways: Record<number, number> = {};
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) ways[a + b] = (ways[a + b] ?? 0) + 1;
  assert.deepEqual(WAYS, ways);
  assert.equal(Object.values(ways).reduce((s, v) => s + v, 0), 36);
  for (const [s, w] of Object.entries(ways)) if (+s !== 7) assert.ok(w < ways[7]);
  assert.equal(OPTIONS[ANSWER].trim().slice(-1), '7');
  for (const o of OPTIONS) assert.ok(o.length <= 10, `chip too long: "${o}"`);
});

test('the rolls are real dice: faces 1–6, seeded, and the chips count exactly what was rolled', () => {
  assert.ok(Number.isInteger(SEED));
  assert.equal(ROLLS.length, N_ROLLS);
  for (const r of ROLLS) assert.ok(r.a >= 1 && r.a <= 6 && r.b >= 1 && r.b <= 6 && Number.isInteger(r.a) && Number.isInteger(r.b));
  const faces = new Array(7).fill(0);
  for (const r of ROLLS) { faces[r.a]++; faces[r.b]++; }
  for (let f = 1; f <= 6; f++) assert.ok(Math.abs(faces[f] / (2 * N_ROLLS) - 1 / 6) < 0.04, `face ${f} is off: not fair dice`);
  const end = countsAt(DURATION);
  for (let s = 2; s <= 12; s++) assert.equal(end[s], ROLLS.filter(r => r.a + r.b === s).length);
});

test('rolling starts on frame 0, speeds up, and every chip lands before the grid', () => {
  assert.ok(rolledBy(0.1) >= 1, 'a roll in the first frames');
  for (let i = 1; i < frames.length; i++) assert.ok(rolledBy(frames[i]) >= rolledBy(frames[i - 1]));
  assert.ok(rolledBy(6) - rolledBy(5) > 5 * (rolledBy(2) - rolledBy(1)), 'it speeds up');
  assert.equal(landedBy(T_GRID), N_ROLLS);
});

test('7 leads from the answer on, and it ends clearly on top', () => {
  for (const t of frames.filter(t => t >= ANSWER_AT)) {
    const c = countsAt(t);
    for (let s = 2; s <= 12; s++) if (s !== 7) assert.ok(c[7] > c[s], `${s} ties or beats 7 at ${t.toFixed(2)} s`);
  }
  assert.ok(ANSWER_AT >= 3 && ANSWER_AT <= 7.5, `answer at ${ANSWER_AT}`);
  const end = countsAt(DURATION), second = Math.max(...[2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map(s => end[s]));
  assert.ok(end[7] >= second + 4, 'a clear lead, not a photo finish');
});

test('the grid: 7’s diagonal lights cell by cell after the rolls, 6 cells', () => {
  assert.equal(gridLitAt(T_GRID - 0.1), 0);
  assert.equal(gridLitAt(DURATION), 6);
  for (let i = 1; i < frames.length; i++) assert.ok(gridLitAt(frames[i]) >= gridLitAt(frames[i - 1]));
});

test('the camera zooms in at least twice and out at least once, smoothly, with a punch-in landing on the answer', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  for (let i = 1; i < frames.length; i++) {
    const a = tween(frames[i - 1], CAMERA.start, CAMERA.keys), b = tween(frames[i], CAMERA.start, CAMERA.keys);
    assert.ok(Math.abs(b[0] - a[0]) < 0.1 && Math.hypot(b[1] - a[1], b[2] - a[2]) < 45, `camera jumps at ${frames[i].toFixed(2)}`);
  }
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.3 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
});

test('sound from the picture: clicks on real chip landings, a thunk on the answer, a tap per lit cell, whooshes on fast zooms', () => {
  for (const c of CLICKS) assert.ok(ROLLS.some(r => Math.abs(r.lands - c.t) < 1e-9), 'a click with no chip landing');
  for (let s = 0; s < END_AT; s++) assert.ok(CLICKS.filter(c => c.t >= s && c.t < s + 1).length <= 14, `too many clicks in second ${s}`);
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  assert.equal(SOUND.hits.filter(h => h.kind === 'tap').length, 6);
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
  near(SOUND.duration, DURATION);
});

test('short (≤ 25 s), labels ≤ 7 words, a music hit on the answer', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION && T_GRID > ANSWER_AT);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT));
});
