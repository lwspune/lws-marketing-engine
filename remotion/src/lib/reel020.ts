// @lws.pune · reel 020 (predict-first): a matrix moves space. The plane's grid bends from frame 0 as the matrix
// [[2, 1], [1, 3]] takes over: î lands on (2, 1), ĵ on (1, 3), and the unit square becomes a parallelogram whose area
// counts 1 → 5 = det (answer B). Every other square grows ×5 too. Then [[2, 1], [4, 2]] (det 0) squashes the whole plane
// onto one line: area 0, nothing to undo it with (no inverse). NDA 2026 (II) Q69 in the caption. Proven idea:
// @codematrixvishal 916k (34×) (remake-backlog W14; reel 011 showed det scaling with the rows, this shows the grid).
// Flat 2D on the white board. Pure functions of t.
//
// Beat table (runbook step 1):
// | time       | what moves                                         | caption                       | keep in frame        | colours                         |
// | 0–3.6      | the grid bends I → M, square → parallelogram, 1 → 5 | Watch the grid move · …leans  | the square           | î red, ĵ blue, square yellow, grid cyan (VIVID) |
// | 3.6        | punch-in on the parallelogram, B lights            | Area ×5: the determinant      | the square           |                                 |
// | 5.2–8.2    | zoom out; two neighbour squares light, 5 each       | Every square grows ×5         | the square + 2 cells | yellow tint                     |
// | 8.2–10.6   | zoom out; M → [[2,1],[4,2]], the plane goes flat    | det 0? The plane goes flat    | the square's image   |                                 |
// | 10.6–13.0  | gentle push in on the line                         | Flat: no area, no inverse     | the line             |                                 |
// | 13.0–16.0  | end card                                           | Determinant = … Follow        | –                    |                                 |
// Pairs told apart: î–ĵ, î–square, ĵ–square (distinguishable(), tests).
import { prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { VIVID } from './palette.ts';

export const DURATION = 16.0, END_AT = 13.0, ANSWER_AT = 3.6, COVER_T = 0.9;
export const OPTIONS = ['A   6', 'B   5', 'C   7'], ANSWER = 1;
export const COLORS = { i: VIVID.white.red, j: VIVID.white.blue, square: VIVID.white.yellow, grid: VIVID.white.cyan };

export type Mat = number[][];
export const I: Mat = [[1, 0], [0, 1]], M: Mat = [[2, 1], [1, 3]], S: Mat = [[2, 1], [4, 2]];
export const det = (m: Mat) => m[0][0] * m[1][1] - m[0][1] * m[1][0];
export const apply = (m: Mat, [x, y]: [number, number]): [number, number] => [m[0][0] * x + m[0][1] * y, m[1][0] * x + m[1][1] * y];
const lerp = (a: Mat, b: Mat, s: number): Mat => a.map((row, r) => row.map((v, c) => v + (b[r][c] - v) * s));

// The grid bends from frame 0 to the answer, then squashes later.
export const MORPH = { t: 0, dur: ANSWER_AT }, SQUASH = { t: 8.6, dur: 2.0 };
export function matAt(t: number): Mat {
  return t < SQUASH.t ? lerp(I, M, prog(t, MORPH.t, MORPH.dur)) : lerp(M, S, prog(t, SQUASH.t, SQUASH.dur));
}
/** The unit square's area now: |det| of the matrix on screen (the shoelace area of its image, tested). */
export const areaAt = (t: number) => Math.abs(det(matAt(t)));
export const readoutAt = (t: number) => areaAt(t).toFixed(2);

// Two neighbour squares that light up after the answer: each grows ×5 too.
export const CELLS = [{ i: -1, j: 0, t: 6.0 }, { i: 1, j: 0, t: 6.5 }];

export const CAPTIONS: Caption[] = [
  { t0: 0.4, t1: 2.0, text: 'Watch the grid move' },
  { t0: 2.0, t1: ANSWER_AT, text: 'The square stretches and leans' },
  { t0: ANSWER_AT, t1: 5.6, text: 'Area ×5: the determinant' },
  { t0: 5.6, t1: 8.2, text: 'Every square grows ×5' },
  { t0: 8.2, t1: 10.6, text: 'det 0? The plane goes flat' },
  { t0: 10.6, t1: END_AT, text: 'Flat: no area, no inverse' },
];
export const MUSIC_HITS = [ANSWER_AT, SQUASH.t + SQUASH.dur];

// The picture area (px) and its scale at zoom 1 (px per unit, the same both ways: shapes keep their true areas).
export const BAND = { top: 470, height: 1030, k: 140 };
// Camera: [zoom, centre x, centre y] in maths units. A slow push in from frame 0, a punch-in on the parallelogram landing
// on the answer, a fast zoom out to show its neighbours, a slow zoom out to fit the squashed line, a gentle push in.
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1, 1.5, 2.0],
  keys: [
    { t: 0, dur: 3.2, to: [1.08, 1.5, 2.0] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.35, 1.5, 2.0] },
    { t: 5.2, dur: 0.8, to: [0.95, 1.5, 2.2] },
    { t: 8.2, dur: 2.4, to: [0.75, 1.5, 3.0] },
    { t: 10.8, dur: 2.2, to: [0.85, 1.4, 2.8] },
  ],
};
export type Cam = { z: number; cx: number; cy: number };
export function cam(t: number): Cam {
  const [z, cx, cy] = tween(t, CAMERA.start, CAMERA.keys);
  return { z, cx, cy };
}
export const toScreen = ([x, y]: [number, number], c: Cam): [number, number] =>
  [540 + (x - c.cx) * BAND.k * c.z, BAND.height / 2 - (y - c.cy) * BAND.k * c.z];

// When does the area pass v? Bisection on a stretch where it only rises or only falls.
function crossing(v: number, t0: number, t1: number) {
  let lo = t0, hi = t1;
  const rising = areaAt(t1) > areaAt(t0);
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if ((areaAt(mid) < v) === rising) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
// Sound: a tick each time the area passes a whole number, rising as it grows, falling as it flattens; a knock at 5;
// taps as the neighbour squares light; a whump when the plane is flat. Whooshes on the fast zooms.
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...[2, 3, 4].map((v, i): Hit => ({ kind: 'click', t: crossing(v, MORPH.t, MORPH.t + MORPH.dur), gain: 0.3, pitch: 0.9 + 0.12 * i })),
    { kind: 'thunk', t: ANSWER_AT, gain: 0.5 },
    ...CELLS.map((c, i): Hit => ({ kind: 'tap', t: c.t, gain: 0.35, pitch: 1 + 0.1 * i })),
    ...[4, 3, 2, 1].map((v, i): Hit => ({ kind: 'click', t: crossing(v, SQUASH.t, SQUASH.t + SQUASH.dur), gain: 0.3, pitch: 1.3 - 0.12 * i })),
    { kind: 'whump', t: SQUASH.t + SQUASH.dur, gain: 0.45 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [],
};
