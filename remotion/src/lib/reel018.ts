// @lws.pune · reel 018 (predict-first): what a derivative really is. A chord through two points of y = x² (P at x = 1,
// Q at x = 1 + h) slides shut: its slope (f(1 + h) − f(1)) / h = 2 + h counts down to 2 as Q runs into P, and the chord
// becomes the tangent (answer B). Then a deep zoom on P: up close, the curve and its tangent are one line. Then P moves
// to x = 2 and the slope grows to 4: the slope of x² at any x is 2x. NDA 2021 (II) Q100 in the caption.
// Proven idea: @codematrixvishal 3.14M (115×), @mathsy.uk 1.24M (52×) (remake-backlog W8). Flat 2D on the white board.
// Pure functions of t.
//
// Beat table (runbook step 1):
// | time       | what moves                                          | caption                           | keep in frame | colours            |
// | 0–5.0      | Q slides into P, the chord pivots, slope 3.5 → 2.00x | A line through two points · Slide…| P and Q       | curve blue (VIVID), chord + Q orange (VIVID) |
// | 5.0        | h = 0: punch-in on P, the chord turns tangent, B lit | They meet: the tangent. Slope 2   | P             | tangent green (VIVID) |
// | 6.8–10.3   | deep zoom on P (×48): the curve straightens          | Zoom in: the curve turns straight | P             |                    |
// | 11.0–11.7  | fast zoom out to the whole graph                    | –                                 | P             |                    |
// | 12.0–14.6  | the tangent slides to x = 2, slope 2 → 4             | Move along: the slope grows       | the point     |                    |
// | 14.6–18.0  | gentle push in                                      | Slope of x² at any x: 2x          | the point     |                    |
// | 18.0–21.0  | end card                                            | The derivative: … Follow for more | –             |                    |
// Pairs told apart: curve–chord, chord–tangent, curve–tangent (all distinguishable(), tests).
import { prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { VIVID } from './palette.ts';

export const DURATION = 21.0, END_AT = 18.0, ANSWER_AT = 5.0, COVER_T = 0.3;
export const OPTIONS = ['A   1', 'B   2', 'C   ∞'], ANSWER = 1;
export const COLORS = { curve: VIVID.white.blue, chord: VIVID.white.orange, tangent: VIVID.white.green };

export const f = (x: number) => x * x;
/** Slope of the chord from x to x + h (h = 0: the tangent, f′(x) = 2x). */
export const chordSlope = (x: number, h: number) => (h === 0 ? 2 * x : (f(x + h) - f(x)) / h);

// The gap h shrinks by the same factor every second (each halving a tick), from 1.5 to 0.002 just before the answer,
// then it is 0: the readout reads 2.00x in the last half second, so the step to the tangent is invisible.
export const H0 = 1.5, H_END = 0.002;
const LAMBDA = Math.log(H0 / H_END) / ANSWER_AT;
export const hAt = (t: number) => (t >= ANSWER_AT ? 0 : H0 * Math.exp(-LAMBDA * Math.max(0, t)));
export const HALVINGS = Array.from({ length: 20 }, (_, i) => ((i + 1) * Math.LN2) / LAMBDA).filter(t => t < ANSWER_AT - 0.2);

// After the deep zoom, P (the tangent point) slides from x = 1 to 2.
export const SLIDE = { t: 12.0, dur: 2.6 };
export const xAt = (t: number) => 1 + prog(t, SLIDE.t, SLIDE.dur);

export const CAPTIONS: Caption[] = [
  { t0: 0.5, t1: 2.7, text: 'A line through two points' },
  { t0: 2.7, t1: ANSWER_AT, text: 'Slide them together…' },
  { t0: ANSWER_AT, t1: 6.8, text: 'They meet: the tangent. Slope 2' },
  { t0: 6.8, t1: 11.0, text: 'Zoom in: the curve turns straight' },
  { t0: 11.7, t1: 14.6, text: 'Move along: the slope grows' },
  { t0: 14.6, t1: END_AT, text: 'Slope of x² at any x: 2x' },
];

// The picture area (px) and its scale at zoom 1: px per unit across and up (not equal: the curve fits the tall band).
export const BAND = { top: 470, height: 1030, sx: 260, sy: 120 };

// Camera: [log₂ zoom, centre x, centre y] in maths units, so a deep zoom eases evenly (×2 per step, not all at the end).
// A slow push in from frame 0, a punch-in on P landing on the answer, a deep zoom on P, a fast zoom out about P (P stays
// put), a pan following the slide, and a gentle push in for the last line.
export const DEEP: Key = { t: 6.8, dur: 3.5, to: [5.6, 1, 1] };
export const ZOOM_OUT: Key = { t: 11.0, dur: 0.7, to: [0, 1, 1] };
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [0, 1.175, 3.5],
  keys: [
    { t: 0, dur: 4.6, to: [0.32, 1.1, 2.8] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [0.85, 1, 1] },
    DEEP,
    ZOOM_OUT,
    { t: SLIDE.t, dur: SLIDE.dur, to: [0, 1.5, 2.6] },
    { t: 14.8, dur: 3.0, to: [0.15, 1.6, 2.8] },
  ],
};
export type Cam = { z: number; cx: number; cy: number };
export function cam(t: number): Cam {
  const [lz, cx, cy] = tween(t, CAMERA.start, CAMERA.keys);
  return { z: 2 ** lz, cx, cy };
}
/** Maths point → px inside the band. Everything is drawn in screen space, so lines keep their width at any zoom. */
export const toScreen = (x: number, y: number, c: Cam): [number, number] =>
  [540 + (x - c.cx) * BAND.sx * c.z, BAND.height / 2 - (y - c.cy) * BAND.sy * c.z];

// Sound: a tick each time the gap halves, rising as Q closes in; a knock as the chord locks into the tangent; a shimmer
// under the deep zoom; a tap as the sliding point passes x = 1.5 and lands on 2. Whooshes on the fast zooms.
export const MUSIC_HITS = [ANSWER_AT, ZOOM_OUT.t + ZOOM_OUT.dur];
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...HALVINGS.map((t, i): Hit => ({ kind: 'click', t, gain: 0.28, pitch: 0.9 + 0.07 * i })),
    { kind: 'thunk', t: ANSWER_AT, gain: 0.5 },
    { kind: 'shimmer', t: DEEP.t, gain: 0.35 },
    { kind: 'tap', t: SLIDE.t + SLIDE.dur / 2, gain: 0.3 },
    { kind: 'tap', t: SLIDE.t + SLIDE.dur, gain: 0.35, pitch: 1.2 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [],
};
