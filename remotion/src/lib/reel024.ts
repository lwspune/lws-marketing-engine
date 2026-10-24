// @lws.pune · reel 024 (predict-first): f(x) = x², from set X = {−2, …, 2} to set Y = {0, …, 4}. What is the range of f?
// {0, 1, 4} (A). Five balls fly from X to Y, each drawing its arrow; the outputs list grows 4, 1, 0, 1, 4 and merges into
// the range pill; 2 and 3 are never hit. Then C = X is the domain, B = Y the codomain; two inputs on one output is still a
// function, one input with two arrows isn't. NDA 2022 (II) Q13 in the caption. Storyboard (independently reviewed, F31):
// reels/nda-maths-024-function-range.storyboard.md. Band px throughout. Pure functions of t.
//
// Beat table (from the storyboard):
// | time        | what moves                                                   | caption                               |
// | 0–3.8       | five balls fly X → Y, arrows draw, outputs light, list grows | Each input → exactly one output       |
// | 3.8–4.8     | 2, 3 dashed ("never hit"); the list merges into the pill     |                                       |
// | 5.0         | A lights; punch-in                                           | Range: only the outputs hit           |
// | 7.2–9.4     | X glows, "X · domain"                                        | C is X, the domain: every input       |
// | 9.4–11.6    | Y glows, "Y · codomain"                                      | B is Y, the codomain: allowed outputs |
// | 11.6–13.8   | −2 → 4 and 2 → 4 glow; ✓ on 4                                | Two inputs, one output: still fine    |
// | 13.8–16.4   | ghost arrow 1 → 0; ✗                                         | One input, two arrows: not a function |
// | 16.4–18.4   | the whole named picture holds                                | Range sits inside the codomain        |
import { prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { VIVID } from './palette.ts';

export const DURATION = 21.4, END_AT = 18.4, ANSWER_AT = 5.0, COVER_T = 0.3;
export const OPTIONS = ['A   {0, 1, 4}', 'B   {0, …, 4}', 'C   {−2, …, 2}'], ANSWER = 0;
export const COLORS = { domain: VIVID.white.cyan, codomain: VIVID.white.pink, range: VIVID.white.green };

export const X = [-2, -1, 0, 1, 2], Y = [0, 1, 2, 3, 4];
export const f = (x: number) => x * x;
export const RANGE = [...new Set(X.map(f))].sort((a, b) => a - b);
export const NEVER_HIT = Y.filter(y => !RANGE.includes(y));
/** Arrows as [input, output] pairs: the real map, one per input. */
export const ARROWS: [number, number][] = X.map(x => [x, f(x)]);
/** A function: every input in X has exactly one arrow. */
export const isFunction = (arrows: [number, number][]) => X.every(x => arrows.filter(([a]) => a === x).length === 1);

// Beats.
// The first ball leaves 0.2 s before frame 0, so frame 0 already shows it in the air with its arrow drawing.
export const FLIGHTS = X.map((x, i) => ({ x, t: 0.7 * i - 0.2, dur: 1.0 }));
export const NEVER_AT = 3.8, MERGE = { t: 4.0, dur: 0.8 }, PILL_AT = 4.4;
export const DOMAIN_AT = 7.2, CODOMAIN_AT = 9.4, MANY_AT = 11.6, CHECK_AT = 12.2, SUMMARY_AT = 16.4;
export const GHOST = { from: 1, to: 0, t: 13.8, dur: 0.8, out: 15.6 };

// Picture geometry (picture coords, before the camera): two ovals, five dots each.
export const OVAL = { X: { cx: 250, cy: 490 }, Y: { cx: 830, cy: 490 }, rx: 150, ry: 350 };
export const DOT_R = 34;
export const dot = (side: 'X' | 'Y', i: number) => ({ x: OVAL[side].cx, y: 210 + 135 * i });
/** Where an arrow from input x to output y starts and ends: on the two dots' edges. */
export function arrowEnds(x: number, y: number) {
  const a = dot('X', X.indexOf(x)), b = dot('Y', Y.indexOf(y)), d = Math.hypot(b.x - a.x, b.y - a.y);
  const ux = (b.x - a.x) / d, uy = (b.y - a.y) / d;
  return { x0: a.x + ux * DOT_R, y0: a.y + uy * DOT_R, x1: b.x - ux * DOT_R, y1: b.y - uy * DOT_R };
}
/** Ball i in flight at t (picture coords), or null before it leaves / after it lands. */
export function ballAt(t: number, i: number) {
  const fl = FLIGHTS[i]; if (t < fl.t || t >= fl.t + fl.dur) return null;
  const p = prog(t, fl.t, fl.dur), e = arrowEnds(fl.x, f(fl.x));
  return { x: e.x0 + (e.x1 - e.x0) * p, y: e.y0 + (e.y1 - e.y0) * p, p };
}
export const landedAt = (t: number, i: number) => t >= FLIGHTS[i].t + FLIGHTS[i].dur;
export const outputsAt = (t: number) => FLIGHTS.filter((_, i) => landedAt(t, i)).map(fl => f(fl.x));
export function readoutAt(t: number) {
  if (t >= PILL_AT) return `Range = {${RANGE.join(', ')}}`;
  const out = outputsAt(t);
  return out.length ? `Outputs: ${out.join(', ')}` : 'Outputs:';
}

// Camera on the picture only: [zoom, focus x, focus y], screen = (540 + (x − fx)·z, 515 + (y − fy)·z). Each key's focus
// keeps the picture's centre (540, 490) where it is, so the ovals zoom in place.
const C = 490, hold = (z: number) => C + (515 - C) / z;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1, 540, 515],
  keys: [
    { t: 0, dur: 4.6, to: [1.04, 540, hold(1.04)] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.1, 540, hold(1.1)] },
    { t: 5.4, dur: 0.6, to: [1, 540, 515] },
    { t: MANY_AT, dur: 2.0, to: [1.06, 540, hold(1.06)] },
    { t: GHOST.t, dur: 0.6, to: [1, 540, 515] },
  ],
};
export function toScreen(t: number, x: number, y: number) {
  const [z, fx, fy] = tween(t, CAMERA.start, CAMERA.keys);
  return { x: 540 + (x - fx) * z, y: 515 + (y - fy) * z, z };
}

export const CAPTIONS: Caption[] = [
  { t0: 0.3, t1: 3.0, text: 'Each input → exactly one output' },
  { t0: ANSWER_AT, t1: DOMAIN_AT, text: 'Range: only the outputs hit' },
  { t0: DOMAIN_AT, t1: CODOMAIN_AT, text: 'C is X, the domain: every input' },
  { t0: CODOMAIN_AT, t1: MANY_AT, text: 'B is Y, the codomain: allowed outputs' },
  { t0: MANY_AT, t1: GHOST.t, text: 'Two inputs, one output: still fine' },
  { t0: GHOST.t, t1: SUMMARY_AT, text: 'One input, two arrows: not a function' },
  { t0: SUMMARY_AT, t1: END_AT, text: 'Range sits inside the codomain' },
];
export const MUSIC_HITS = [ANSWER_AT, SUMMARY_AT];

// ---- labels: one list for the picture and the overlap test (screen positions in the band, after the camera) ---------
export type Label = { text: string; x: number; y: number; anchor: 'start' | 'middle' | 'end'; size: number; alpha: number;
  role: 'set' | 'tag' | 'mark' | 'readout' };
export const READOUT_Y = 955;
export function labelsAt(t: number): Label[] {
  const sx = toScreen(t, OVAL.X.cx, 0), sy = toScreen(t, OVAL.Y.cx, 0);
  const never = toScreen(t, OVAL.Y.cx, 556), z = never.z;
  // A mark is drawn centred 0.3 × size above its baseline (as labelBox has it), so +18 puts the ✗ on the ghost arrow's midpoint.
  const check = toScreen(t, 885, dot('Y', 4).y + 12);
  const g = arrowEnds(GHOST.from, GHOST.to), cross = toScreen(t, (g.x0 + g.x1) / 2, (g.y0 + g.y1) / 2 + 18);
  return [
    { text: t < DOMAIN_AT ? 'X' : 'X · domain', x: sx.x, y: 86, anchor: 'middle', size: 52, alpha: 1, role: 'set' },
    { text: t < CODOMAIN_AT ? 'Y' : 'Y · codomain', x: sy.x, y: 86, anchor: 'middle', size: 52, alpha: 1, role: 'set' },
    { text: '2, 3: never hit', x: never.x, y: never.y + 12, anchor: 'middle', size: 36 * z, alpha: prog(t, NEVER_AT, 0.4), role: 'tag' },
    { text: '✓', x: check.x, y: check.y, anchor: 'middle', size: 60 * z, alpha: prog(t, CHECK_AT, 0.3) * (1 - prog(t, GHOST.t, 0.3)), role: 'mark' },
    { text: '✗', x: cross.x, y: cross.y, anchor: 'middle', size: 60 * z, alpha: prog(t, GHOST.t + GHOST.dur, 0.25) * (1 - prog(t, GHOST.out, 0.4)), role: 'mark' },
    { text: readoutAt(t), x: 540, y: READOUT_Y, anchor: 'middle', size: 52, alpha: 1, role: 'readout' },
  ];
}
export function labelBox(l: Label) {
  const w = [...l.text].length * l.size * 0.5, h = l.size;
  const x0 = l.anchor === 'start' ? l.x : l.anchor === 'end' ? l.x - w : l.x - w / 2;
  return { x0, x1: x0 + w, y0: l.y - 0.8 * h, y1: l.y + 0.2 * h };
}

// Sound: a click as each ball lands (pitch up with the output), a tap as 2 and 3 go dashed, a knock on the answer, taps as
// each set is named, a click as the ✓ pops, a snap as the ✗ pops, whooshes on the fast zooms.
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...FLIGHTS.map((fl): Hit => ({ kind: 'click', t: fl.t + fl.dur, gain: 0.3, pitch: 0.9 + 0.08 * f(fl.x) })),
    { kind: 'tap', t: NEVER_AT, gain: 0.25 },
    { kind: 'thunk', t: ANSWER_AT, gain: 0.5 },
    { kind: 'tap', t: DOMAIN_AT, gain: 0.3 },
    { kind: 'tap', t: CODOMAIN_AT, gain: 0.3, pitch: 1.15 },
    { kind: 'click', t: CHECK_AT, gain: 0.32, pitch: 1.3 },
    { kind: 'snap', t: GHOST.t + GHOST.dur, gain: 0.35 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [],
};
