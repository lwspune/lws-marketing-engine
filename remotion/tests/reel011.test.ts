import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, ANSWER_AT, A, det, rowsAt, areaAt, scaleAt, drawAt, T_SWEEP,
  CAMERA, SOUND, CLICKS,
} from '../src/lib/reel011.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';

// @lws.pune · reel 011 remade (predict-first): double every number in a 2×2 matrix: its determinant? The rows of A are two
// arrows; |det| is the area between them. Double row 1: area ×2. Double row 2: ×2 again → ×4. Then any k: area × k².
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('the answer, re-derived: det(2A) = 4 det(A) for any 2×2, and |det| is the area between the rows', () => {
  let s = 11;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647) * 10 - 5;
  for (let i = 0; i < 50; i++) {
    const M: [[number, number], [number, number]] = [[r(), r()], [r(), r()]];
    near(det([[2 * M[0][0], 2 * M[0][1]], [2 * M[1][0], 2 * M[1][1]]]), 4 * det(M), 1e-9);
    // area of the parallelogram on the rows, by the shoelace formula on 0, r1, r1 + r2, r2
    const [[a, b], [c, d]] = M, pts = [[0, 0], [a, b], [a + c, b + d], [c, d]];
    const shoelace = Math.abs(pts.reduce((acc, [x, y], k) => { const [x2, y2] = pts[(k + 1) % 4]; return acc + x * y2 - x2 * y; }, 0)) / 2;
    near(shoelace, Math.abs(det(M)), 1e-9);
  }
  near(det(A), 5);
  assert.match(OPTIONS[ANSWER], /×4/);
  for (const o of OPTIONS) assert.ok(o.length <= 10, `chip too long: "${o}"`);
});

test('the picture is honest: the area shown is always |det| of the rows shown', () => {
  for (const t of frames) near(areaAt(t), Math.abs(det(rowsAt(t))), 1e-9);
  near(areaAt(0), 5); near(areaAt(ANSWER_AT), 20);
  const mid = frames.find(t => scaleAt(t)[0] === 2 && scaleAt(t)[1] === 1)!;
  near(areaAt(mid), 10, 1e-9);
});

test('row 1 doubles first, then row 2; the answer lights when both are doubled', () => {
  for (let i = 1; i < frames.length; i++) {
    const [a1, b1] = scaleAt(frames[i - 1]), [a2, b2] = scaleAt(frames[i]);
    if (frames[i] < T_SWEEP) assert.ok(a2 >= a1 && b2 >= b1, `a row shrinks at ${frames[i].toFixed(2)}`);
  }
  assert.ok(frames.some(t => scaleAt(t)[0] === 2 && scaleAt(t)[1] === 1), 'never shows row 1 alone doubled');
  assert.deepEqual(scaleAt(ANSWER_AT), [2, 2]);
  assert.ok(ANSWER_AT < 7, `answer at ${ANSWER_AT}`);
});

test('any k: both rows scaled by k give area 5k², swept from 2 up to 3 and down to 1', () => {
  for (const t of frames.filter(t => t >= T_SWEEP)) { const [k1, k2] = scaleAt(t); near(k1, k2); near(areaAt(t), 5 * k1 * k1, 1e-9); }
  const ks = frames.filter(t => t >= T_SWEEP).map(t => scaleAt(t)[0]);
  near(Math.max(...ks), 3, 1e-6); near(Math.min(...ks), 1, 1e-6);
});

test('something changes on every frame of the first 3 s (the rows draw themselves, then row 1 stretches)', () => {
  for (let f = 1; f <= 90; f++) {
    const a = f / 30, b = (f - 1) / 30;
    assert.ok(drawAt(a) !== drawAt(b) || scaleAt(a)[0] !== scaleAt(b)[0], `still at frame ${f}`);
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

test('sound from the picture: a click as the area passes each whole unit while the rows stretch, a thunk on the answer', () => {
  assert.equal(CLICKS.length, 15, 'area 5 → 20 passes 6, 7, …, 20');
  for (const c of CLICKS) { const u = areaAt(c.t); assert.ok(Math.abs(u - Math.round(u)) < 0.05, `click at area ${u}`); }
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
  near(SOUND.duration, DURATION);
});

test('short (≤ 25 s), labels ≤ 7 words, a music hit on the answer', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION && T_SWEEP > ANSWER_AT && T_SWEEP < END_AT);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT));
});
