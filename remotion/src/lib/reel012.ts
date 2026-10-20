// @lws.pune · reel 012 remade (predict-first, framework v1.1): the angle keeps turning: what happens to sin²θ + cos²θ?
// NDA maths concept (Trigonometric Identities); NDA 2025 (I) Q35 named in the caption. A point circles a circle of radius 1;
// its right triangle has legs cos θ and sin θ and hypotenuse 1 (Pythagoras). A stacked bar shows sin² and cos² trading
// places while the total stays exactly 1; below, both waves draw themselves and their sum is a flat line at 1.
// Replaces the engine-made "Why? #4" (still title card, MCQ at the end). Pure functions of t.
import { prog, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';

export const DURATION = 22.0, END_AT = 18.6;
export const OPTIONS = ['A   1', 'B   θ', 'C   varies'], ANSWER = 0;

// θ in degrees: a steady turn (20° → 380°, one full turn), easing into 90° for the 90° moment (450°), a slow drift there,
// then a faster spin to the end. Always increasing, so something moves on every frame.
export const T_NINETY = 12.4;
const LEGS: [number, number, number, number][] = [[0, 8.6, 20, 380], [8.6, T_NINETY, 380, 450], [T_NINETY, 15.6, 450, 458], [15.6, DURATION, 458, 760]];
export function thetaAt(t: number) {
  for (const [t0, t1, a, b] of LEGS) if (t <= t1) {
    const u = (t - t0) / (t1 - t0);
    // the first and last legs run at a steady speed; the middle ones ease, with a small linear term so θ never stops
    return t0 === 0 || t1 === DURATION ? a + (b - a) * u : a + (b - a) * (0.85 * prog(t, t0, t1 - t0) + 0.15 * u);
  }
  return LEGS[LEGS.length - 1][3];
}
const rad = (d: number) => (d * Math.PI) / 180;
export const pointAt = (t: number): [number, number] => [Math.cos(rad(thetaAt(t))), Math.sin(rad(thetaAt(t)))];
export const partsAt = (t: number) => { const [x, y] = pointAt(t); return { sin2: y * y, cos2: x * x }; };

/** The parts of the graph (θ from 0° to 360°) drawn so far: from the start angle up to θ, then wrapping round once. */
export function drawnRanges(t: number): [number, number][] {
  const th = thetaAt(t), start = LEGS[0][2];
  if (th <= 360) return [[start, th]];
  return th >= 360 + start ? [[0, 360]] : [[0, th - 360], [start, 360]];
}

export const ANSWER_AT = 4.6;
export const CAPTIONS: Caption[] = [
  { t0: 0.6, t1: ANSWER_AT, text: 'Turn the angle: sin², cos² trade' },
  { t0: ANSWER_AT, t1: 8.6, text: 'The sum never moves: always 1' },
  { t0: 8.6, t1: T_NINETY, text: 'Pythagoras on a circle of 1' },
  { t0: T_NINETY, t1: 15.6, text: 'At 90°: 1 + 0 = 1' },
  { t0: 15.6, t1: END_AT, text: 'Any angle: sin² + cos² = 1' },
];
export const MUSIC_HITS = [ANSWER_AT];

// Picture layout (px, inside the picture band, under a fixed strip with the live numbers: F9 keeps labels still).
export const BAND = { top: 590, height: 910 };
export const CIRCLE = { x: 300, y: 270, r: 190 };
export const BAR = { x: 700, w: 90, top: 70, unit: 390 };            // the bar's full height is exactly 1
export const GRAPH = { x0: 140, x1: 940, y0: 820, unit: 200 };        // value 0 at y0, 1 at y0 − unit

// Camera: [zoom, focus x, focus y]. A slow push towards the bar from frame 0, a punch-in on the bar landing on the answer,
// a zoom out, a slow push into the circle for Pythagoras and the 90° moment, a zoom out, a gentle push for the last line.
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1, 540, 455],
  keys: [
    { t: 0, dur: 3.5, to: [1.06, 620, 380] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.3, 745, 270] },
    { t: ANSWER_AT + 1.6, dur: 0.7, to: [1.0, 540, 455] },
    { t: 8.8, dur: 1.6, to: [1.2, 330, 300] },
    { t: 15.4, dur: 0.7, to: [1.0, 540, 455] },
    { t: 16.2, dur: 2.2, to: [1.05, 540, 465] },
  ],
};

// Sound from the picture: a soft click each time the point passes a 30° mark (pitch following sin² there), a thunk when
// "stays 1" lights, whooshes on the fast zooms.
function marks(): Hit[] {
  const out: Hit[] = [], dt = 1 / 600;
  let prev = thetaAt(0);
  for (let t = dt; t < END_AT; t += dt) {
    const th = thetaAt(t);
    if (Math.floor(th / 30) > Math.floor(prev / 30)) {
      const m = Math.floor(th / 30) * 30, s2 = Math.sin(rad(m)) ** 2;
      out.push({ kind: 'click', t, gain: 0.45, pitch: 0.85 + 0.3 * s2 });
    }
    prev = th;
  }
  return out;
}
export const CLICKS = marks();
export const SOUND: Score = {
  duration: DURATION,
  hits: [...CLICKS, { kind: 'thunk', t: ANSWER_AT, gain: 0.55 }, ...whooshesFor(CAMERA.start, CAMERA.keys)],
  beds: [],
};
