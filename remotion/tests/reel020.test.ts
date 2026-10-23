import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, END_AT, ANSWER_AT, CAPTIONS, MUSIC_HITS, OPTIONS, ANSWER, M, S, det, apply, matAt, areaAt, readoutAt, MORPH, SQUASH,
  CAMERA, cam, toScreen, BAND, CELLS, SOUND, COLORS, COVER_T,
} from '../src/lib/reel020.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable, VIVID } from '../src/lib/palette.ts';

// @lws.pune · reel 020 (predict-first): the matrix [[2, 1], [1, 3]] reshapes the grid; the unit square's area becomes
// det = 2·3 − 1·1 = 5 (answer B). Then [[2, 1], [4, 2]] (det 0) squashes the plane onto a line. Caption: NDA 2026 (II)
// Q69, the parallelogram on a + 3b and 3a + b (unit vectors at 30°) has area |1·1 − 3·3| · ½ = 4 (answer (d)).
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const shoelace = (pts: [number, number][]) => Math.abs(pts.reduce((s, [x, y], i) => { const [u, v] = pts[(i + 1) % pts.length]; return s + x * v - u * y; }, 0)) / 2;
const square = (m: number[][]) => ([[0, 0], [1, 0], [1, 1], [0, 1]] as [number, number][]).map(p => apply(m, p));

test('the answer, re-derived: the square lands on a parallelogram of area 5 = ad − bc; the traps are 6 and 7', () => {
  near(det(M), M[0][0] * M[1][1] - M[0][1] * M[1][0]); near(det(M), 5);
  near(shoelace(square(M)), 5);
  assert.deepEqual(apply(M, [1, 0]), [2, 1]); assert.deepEqual(apply(M, [0, 1]), [1, 3]);   // the columns: where î and ĵ land
  assert.match(OPTIONS[ANSWER], /\b5\b/);
  assert.ok(OPTIONS.some(o => /\b6\b/.test(o)) && M[0][0] * M[1][1] === 6, 'trap 6 = the diagonal alone');
  assert.ok(OPTIONS.some(o => /\b7\b/.test(o)) && M.flat().reduce((a, b) => a + b) === 7, 'trap 7 = all four entries added');
});

test('NDA 2026 (II) Q69: area on a + 3b and 3a + b = |det [[1, 3], [3, 1]]| × area on a, b = 8 × ½ = 4', () => {
  const a: [number, number] = [1, 0], b: [number, number] = [Math.cos(Math.PI / 6), Math.sin(Math.PI / 6)];   // unit, 30° apart
  const cross = (u: [number, number], v: [number, number]) => u[0] * v[1] - u[1] * v[0];
  const s1: [number, number] = [a[0] + 3 * b[0], a[1] + 3 * b[1]], s2: [number, number] = [3 * a[0] + b[0], 3 * a[1] + b[1]];
  near(Math.abs(cross(a, b)), 0.5);
  near(Math.abs(cross(s1, s2)), 4);
  near(Math.abs(det([[1, 3], [3, 1]])) * Math.abs(cross(a, b)), 4);
});

test('the squash: [[2, 1], [4, 2]] has det 0, its columns are parallel, and the square lands flat', () => {
  near(det(S), 0);
  const [c1, c2] = [apply(S, [1, 0]), apply(S, [0, 1])];
  near(c1[0] * c2[1] - c1[1] * c2[0], 0);
  near(shoelace(square(S)), 0);
});

test('the live area is the true area of the moving square on every frame, and reaches 5 then 0', () => {
  for (const t of frames) near(areaAt(t), shoelace(square(matAt(t))), 1e-9);
  near(areaAt(0), 1); near(areaAt(ANSWER_AT), 5); near(areaAt(SQUASH.t + SQUASH.dur), 0);
  for (const t of frames.filter(t => t < ANSWER_AT - 0.1)) assert.notEqual(readoutAt(t), '5.00', `spoiler at ${t}`);
  assert.equal(readoutAt(ANSWER_AT), '5.00');
});

test('the grid moves from frame 0, on every frame of the first 3 s', () => {
  for (let k = 1; k <= 90; k++) assert.ok(areaAt(k / 30) > areaAt((k - 1) / 30), `still at frame ${k}`);
  assert.ok(MORPH.t === 0 && MORPH.t + MORPH.dur === ANSWER_AT);
});

test('the cover is taken early, with an area that gives nothing away', () => {
  assert.ok(COVER_T < ANSWER_AT && areaAt(COVER_T) < 2);
});

test('camera: two zooms in, one out, a punch-in on the answer, smooth, and everything that matters stays in the picture', () => {
  let z = CAMERA.start[0], ins = 0, outs = 0;
  for (const k of CAMERA.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1, `${ins} in, ${outs} out`);
  assert.ok(CAMERA.keys.some(k => k.dur <= 0.5 && k.to[0] > 1.2 && Math.abs(k.t + k.dur - ANSWER_AT) < 0.05), 'no punch-in on the answer');
  for (let i = 1; i < frames.length; i++) assert.ok(Math.abs(cam(frames[i]).z - cam(frames[i - 1]).z) < 0.1, `zoom jumps at ${frames[i]}`);
  const inside = ([x, y]: [number, number]) => x > 30 && x < 1050 && y > 120 && y < BAND.height - 30;   // below the area pill
  for (const t of frames.filter(t => t < END_AT)) for (const p of square(matAt(t))) assert.ok(inside(toScreen(p, cam(t))), `square corner out at ${t}`);
  for (const cell of CELLS) for (const t of frames.filter(t => t >= cell.t && t < SQUASH.t)) {
    const pts = ([[0, 0], [1, 0], [1, 1], [0, 1]] as [number, number][]).map(([x, y]) => apply(matAt(t), [x + cell.i, y + cell.j]));
    for (const p of pts) assert.ok(inside(toScreen(p, cam(t))), `cell ${cell.i},${cell.j} out at ${t}`);
  }
});

test('sound: a tick each time the area passes a whole number (rising, then falling), a knock at 5, a whump when flat', () => {
  const ticks = SOUND.hits.filter(h => h.kind === 'click');
  const up = ticks.filter(h => h.t < ANSWER_AT), down = ticks.filter(h => h.t > SQUASH.t);
  assert.deepEqual(up.map(h => Math.round(areaAt(h.t) * 1e6) / 1e6), [2, 3, 4]);
  assert.deepEqual(down.map(h => Math.round(areaAt(h.t) * 1e6) / 1e6), [4, 3, 2, 1]);
  for (let i = 1; i < up.length; i++) assert.ok(up[i].pitch! > up[i - 1].pitch!);
  for (let i = 1; i < down.length; i++) assert.ok(down[i].pitch! < down[i - 1].pitch!);
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 1e-9));
  assert.ok(SOUND.hits.some(h => h.kind === 'whump' && Math.abs(h.t - (SQUASH.t + SQUASH.dur)) < 1e-9));
  for (const w of whooshesFor(CAMERA.start, CAMERA.keys)) assert.ok(SOUND.hits.some(s => s.kind === w.kind && Math.abs(s.t - w.t) < 1e-9));
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION - 0.5);
});

test('colours: î, ĵ and the square are VIVID and told apart, colour-blind safe', () => {
  const v = Object.values(VIVID.white) as string[];
  for (const c of [COLORS.i, COLORS.j, COLORS.square, COLORS.grid]) assert.ok(v.includes(c), `${c} is not VIVID`);
  for (const [a, b] of [[COLORS.i, COLORS.j], [COLORS.i, COLORS.square], [COLORS.j, COLORS.square]]) assert.ok(distinguishable(a, b), `${a} vs ${b}`);
});

test('short (≤ 25 s), captions ≤ 7 words and in order, music hits on the answer and the flat plane', () => {
  assert.ok(DURATION <= 25 && END_AT < DURATION);
  for (const c of CAPTIONS) assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${c.text}"`);
  for (let i = 1; i < CAPTIONS.length; i++) assert.ok(CAPTIONS[i].t0 >= CAPTIONS[i - 1].t1 - 1e-9);
  assert.ok(CAPTIONS.at(-1)!.t1 <= END_AT);
  assert.ok(MUSIC_HITS.includes(ANSWER_AT) && MUSIC_HITS.includes(SQUASH.t + SQUASH.dur));
});
