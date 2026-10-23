// @lws.pune · reel 019 (predict-first): the area between y = x and y = x³ (first quadrant) is…? Both curves draw from
// frame 0; strips sweep in between them, each top minus bottom, while the total counts up; then the strips double
// (10 → 20 → 40 → 80) and the total settles on 0.25 = ¼ (answer B). Then why: ½ under the line, ¼ under x³, the ¼
// drops away, ½ − ¼ = ¼. This is NDA 2022 (I) Q78 (caption). Proven idea: @codematrixvishal 1.80M (66×)
// (remake-backlog W10). Flat 2D on the white board. Pure functions of t.
//
// Beat table (runbook step 1):
// | time       | what moves                                      | caption                          | keep in frame | colours                 |
// | 0–2.0      | y = x and y = x³ draw from 0 to 1, slow push     | Line on top, x³ below            | both curves   | line blue, x³ orange (VIVID) |
// | 2.0–5.0    | 10 strips rise from x³ to x, total counts up     | Each strip: top minus bottom     | the region    | strips green (VIVID)    |
// | 5.4–6.4    | strips double ×3, total → 0.25002                | Thinner strips… the total settles| the region    |                         |
// | 7.0        | strips melt into one area, punch-in, B lights    | Area = ¼                         | the region    |                         |
// | 8.0–9.6    | zoom out; the triangle under the line fills      | Under the line: ½                | triangle      | blue tint               |
// | 9.6–11.2   | the part under x³ fills                          | Under x³: ¼                      | that part     | orange tint             |
// | 11.2–13.0  | the x³ part drops away, the green ¼ stays        | Between them: ½ − ¼ = ¼          | the region    |                         |
// | 13.0–16.0  | gentle push in                                  | Area between = ∫(top − bottom)   | the region    |                         |
// | 16.0–19.0  | end card                                        | Area between curves: … Follow    | –             |                         |
// Pairs told apart: line–cubic, line–strips, cubic–strips (distinguishable(), tests).
import { clamp01, prog, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { VIVID } from './palette.ts';

export const DURATION = 19.0, END_AT = 16.0, ANSWER_AT = 7.0, COVER_T = 1.2;
export const OPTIONS = ['A   ½', 'B   ¼', 'C   ⅛'], ANSWER = 1;
export const COLORS = { top: VIVID.white.blue, bottom: VIVID.white.orange, area: VIVID.white.green };

export const top = (x: number) => x, bottom = (x: number) => x ** 3;
/** Midpoint strips: n strips across [0, 1], each (top − bottom) at its middle × its width. */
export const stripSum = (n: number) => Array.from({ length: n }, (_, i) => (i + 0.5) / n).reduce((s, m) => s + (top(m) - bottom(m)) / n, 0);
// The two areas of the "why" beat, from antiderivatives: ∫₀¹ x dx = ½, ∫₀¹ x³ dx = ¼.
export const PARTS = { underTop: 1 ** 2 / 2, underBottom: 1 ** 4 / 4 };

// Timeline: the curves draw, then 10 strips sweep in one by one, then they double three times before the answer.
export const SWEEP = { t: 2.0, dur: 3.0 };
const STEP = SWEEP.dur / 10;
export const DOUBLINGS = [5.4, 5.9, 6.4];
export const drawAt = (t: number) => prog(t, 0, SWEEP.t);
/** Strips on screen: how many (n), how many of the first sweep have started (shown), and the sweep as a smooth count. */
export function stripsAt(t: number) {
  const sweep = 10 * clamp01((t - SWEEP.t) / SWEEP.dur), shown = t < SWEEP.t ? 0 : Math.min(10, Math.floor((t - SWEEP.t) / STEP + 1e-9) + 1);
  const n = 10 * 2 ** DOUBLINGS.filter(d => t >= d).length;
  return { n, shown, sweep };
}
/** The total on screen: the strips shown so far, then each doubling's sum; exactly 0.25 from the answer on. */
export function readoutAt(t: number) {
  if (t >= ANSWER_AT) return '0.25';
  const { n, shown } = stripsAt(t);
  if (n > 10) return stripSum(n).toFixed(5);
  let s = 0;
  for (let i = 0; i < shown; i++) { const m = (i + 0.5) / 10; s += (top(m) - bottom(m)) / 10; }
  return s.toFixed(5);
}
export const BEATS = { triangle: 8.0, cubic: 9.6, subtract: 11.2, rule: 13.0 };

export const CAPTIONS: Caption[] = [
  { t0: 0.4, t1: SWEEP.t, text: 'Line on top, x³ below' },
  { t0: SWEEP.t, t1: 5.2, text: 'Each strip: top minus bottom' },
  { t0: 5.2, t1: ANSWER_AT, text: 'Thinner strips… the total settles' },
  { t0: ANSWER_AT, t1: BEATS.triangle, text: 'Area = ¼' },
  { t0: BEATS.triangle, t1: BEATS.cubic, text: 'Under the line: ½' },
  { t0: BEATS.cubic, t1: BEATS.subtract, text: 'Under x³: ¼' },
  { t0: BEATS.subtract, t1: BEATS.rule, text: 'Between them: ½ − ¼ = ¼' },
  { t0: BEATS.rule, t1: END_AT, text: 'Area between = ∫(top − bottom)' },
];
export const MUSIC_HITS = [ANSWER_AT, BEATS.subtract];

// Graph geometry inside the picture area (px): x and y from 0 to 1 on the same scale.
export const X0 = 190, Y0 = 880, S = 700;
export const px = (x: number) => X0 + x * S, py = (y: number) => Y0 - y * S;

// Camera: [zoom, focus x, focus y] (px) on the graph. A slow push in from frame 0, a punch-in on the area landing on the
// answer, a fast zoom out for the "why", a push in while it builds, and a gentle push for the last line.
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1, 540, 520],
  keys: [
    { t: 0, dur: 5.0, to: [1.12, 560, 560] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.3, px(0.5), py(0.32)] },
    { t: BEATS.triangle, dur: 0.6, to: [1.0, 540, 520] },
    { t: BEATS.triangle + 0.8, dur: 4.0, to: [1.1, 560, 560] },
    { t: BEATS.rule, dur: 3.0, to: [1.18, 560, 600] },
  ],
};

// Sound: a tap as each strip of the first sweep rises, pitch climbing; a snap at each doubling; a knock on the answer;
// a soft whump as each part of the "why" fills, a knock as ½ − ¼ lands. Whooshes on the fast zooms.
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...Array.from({ length: 10 }, (_, i): Hit => ({ kind: 'tap', t: SWEEP.t + i * STEP, gain: 0.3, pitch: 0.9 + 0.05 * i })),
    ...DOUBLINGS.map((t): Hit => ({ kind: 'snap', t, gain: 0.3 })),
    { kind: 'thunk', t: ANSWER_AT, gain: 0.5 },
    { kind: 'whump', t: BEATS.triangle + 0.2, gain: 0.35 },
    { kind: 'whump', t: BEATS.cubic, gain: 0.35 },
    { kind: 'thunk', t: BEATS.subtract + 0.8, gain: 0.4 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [],
};
