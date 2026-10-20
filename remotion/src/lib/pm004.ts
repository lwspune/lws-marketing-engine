// @pyqvault_ · Maths, visualised #3 (predict-first): f and f′ together (Class 11–12 · Limits & Derivatives /
// Application of Derivatives). f(x) = x³ − 3x; f′(x) = 3x² − 3. A tangent slides along f; its slope draws itself below
// as f′. At the top of the hill (x = −1) and the bottom of the valley (x = 1) the tangent is flat: f′ = 0 (answer B).
// Proven idea: @codematrixvishal "f and f′" 651k / 3.14M (remake-backlog M4, topic score 7/10). Flat 2D, so no orbit
// (F22 is for 3D); the zooms act on the graphs. Framework v1.4. Pure functions of t.
import { prog, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';

export const DURATION = 21.0, END_AT = 17.6;
export const OPTIONS = ['A   highest', 'B   zero', 'C   lowest'], ANSWER = 1;
export const f = (x: number) => x ** 3 - 3 * x;
export const df = (x: number) => 3 * x ** 2 - 3;

// The tangent point, from x = −2 to 2: to the peak (0–4.4 s), a beat there, on to the valley (5.4–9.4 s), a beat, then to the end.
export const ANSWER_AT = 4.4, T_VALLEY = 9.4;
const LEGS: [number, number, number, number][] = [[0, ANSWER_AT, -2, -1], [5.4, T_VALLEY, -1, 1], [10.2, 12.4, 1, 2]];
export function xAt(t: number) {
  let x = -2;
  for (const [t0, t1, a, b] of LEGS) if (t >= t0) x = a + (b - a) * prog(t, t0, t1 - t0);
  return x;
}

export const CAPTIONS: Caption[] = [
  { t0: 0.6, t1: ANSWER_AT, text: 'The slope, drawn as a graph' },
  { t0: ANSWER_AT, t1: 7.0, text: 'At the top: slope = 0' },
  { t0: 7.0, t1: T_VALLEY, text: 'Going down: f′ below zero' },
  { t0: T_VALLEY, t1: 12.4, text: 'At the bottom: zero again' },
  { t0: 12.4, t1: END_AT, text: 'Peaks and valleys: f′ = 0' },
];
export const MUSIC_HITS = [ANSWER_AT, T_VALLEY];

// Graph geometry inside the picture area (px): shared x scale; f above, f′ below.
export const X0 = 540, SX = 220, FY0 = 260, FSY = 70, DY0 = 740, DSY = 26;   // f′ reaches 9 at x = ±2
export const px = (x: number) => X0 + x * SX;

// Camera: [zoom, focus x (px), focus y (px)] on the graphs. A slow push in from frame 0, a punch-in on the peak landing
// on the answer, a zoom out, a second punch-in on the valley, a zoom out, and a gentle push in for the last line.
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1, X0, 500],
  keys: [
    { t: 0, dur: 4.0, to: [1.12, X0, 500] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.35, px(-1), 460] },   // the peak and its f′ zero, both in view
    { t: 5.6, dur: 0.7, to: [1.0, X0, 500] },
    { t: T_VALLEY - 0.35, dur: 0.35, to: [1.45, px(1), 600] },
    { t: 10.4, dur: 0.7, to: [1.0, X0, 500] },
    { t: 13.0, dur: 3.0, to: [1.1, X0, 500] },
  ],
};

// Sound: a soft tick each time the tangent passes a gridline (every 0.5), its pitch following the slope there (steeper
// up = higher), and a knock at each zero of f′, on the music's hits. Whooshes on the fast zooms.
export const GRID_X = [-1.5, -0.5, 0, 0.5, 1.5];      // ±1 are the zeros: they get the knock instead
function passTime(x: number) {
  for (const [t0, t1, a, b] of LEGS) if (x > Math.min(a, b) && x < Math.max(a, b)) {
    let lo = t0, hi = t1;                                     // xAt is increasing on each leg: bisect
    for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (xAt(mid) < x) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  throw new Error(`x = ${x} is never passed`);
}
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...GRID_X.map((x): Hit => ({ kind: 'click', t: passTime(x), gain: 0.3, pitch: 1 + 0.08 * df(x) })),
    { kind: 'thunk', t: ANSWER_AT, gain: 0.5 },
    { kind: 'thunk', t: T_VALLEY, gain: 0.5 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [],
};
