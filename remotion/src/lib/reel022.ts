// @lws.pune · reel 022 (predict-first): x² + 6x: add what to make a perfect square? 9 (B). The 6x strip splits in two;
// one half lands beside the square, the other drops, slides under, turns and slides up into place; the missing corner is
// 3 × 3 = 9. Then the 9 lifts back out (x² + 6x = (x + 3)² − 9) and a dot rides the parabola down to its lowest point, −9.
// NDA 2026 (I) Q42 in the caption. Storyboard (independently reviewed, F31): reels/nda-maths-022-complete-square.storyboard.md.
// Band px throughout (the 1080 × 1030 picture area). Pure functions of t.
//
// Beat table (from the storyboard):
// | time      | what moves                                             | caption                           |
// | 0–1.4     | the strip splits; the left half lands by the square      | Split the 6x strip in two         |
// | 1.4–3.4   | the right half drops, slides under, turns, slides up     | …and wrap it round the square     |
// | 3.4–4.3   | the dashed 3 × 3 corner pulses                          | One corner is missing             |
// | 4.3       | the corner fills: 9; B lights; punch-in                  | A perfect square!                 |
// | 7.0–9.0   | the 9 lifts out; identity → (x + 3)² − 9                 | Take the 9 back out               |
// | 9.0–12.6  | tiles shrink; parabola draws; a dot rides to (−3, −9)   | Lowest value: −9, at x = −3       |
// | 12.6–15.6 | push in on the vertex                                   | Squared part ≥ 0, so ≥ −9         |
import { prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { VIVID } from './palette.ts';

export const DURATION = 18.6, END_AT = 15.6, ANSWER_AT = 4.3, COVER_T = 0.15;
export const OPTIONS = ['A   6', 'B   9', 'C   36'], ANSWER = 1;
export const COLORS = { square: VIVID.white.blue, strip: VIVID.white.orange, corner: VIVID.white.green };
export const f = (x: number) => x * x + 6 * x;
export const VERTEX: [number, number] = [-3, -9];

// ---- the tiles (x drawn at 360 px; 1 unit of the 6 = 40 px) ---------------------------------------------------------
export const SQUARE = { x: 300, y: 150, w: 360, h: 360 };
export const LEFT_END = { x: 660, y: 150, w: 120, h: 360 };
export const LABEL_SWAP = { t: 1.2, dur: 0.2 };
export const leftHalfAt = (t: number) => ({ x: 700 - 40 * prog(t, 0, 1.4), y: 150, w: 120, h: 360 });
/** The wrapping half: drop (1.4–2.0), slide left under the tiles (2.0–2.6), turn (2.6–3.0), slide up (3.0–3.4). */
export function rightHalfAt(t: number) {
  return {
    cx: 880 - 400 * prog(t, 2.0, 0.6),
    cy: 330 + 460 * prog(t, 1.4, 0.6) - 220 * prog(t, 3.0, 0.4),
    angle: 90 * prog(t, 2.6, 0.4),
  };
}
export function halfCorners({ cx, cy, angle }: { cx: number; cy: number; angle: number }): [number, number][] {
  const a = (angle * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return ([[-60, -180], [60, -180], [60, 180], [-60, 180]] as [number, number][]).map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
}
/** The corner: its dashed outline (pulsing), its fill (the answer), its lift out (7.0–8.0) and fade. */
export function cornerAt(t: number) {
  const lift = prog(t, 7.0, 1.0);
  return {
    outline: prog(t, 3.4, 0.2) * (1 - prog(t, ANSWER_AT, 0.2)), pulse: Math.abs(Math.sin(((t - 3.4) / 0.45) * Math.PI)),
    fill: prog(t, ANSWER_AT, 0.3), x: 660 + 160 * lift, y: 510 - 130 * lift, alpha: 1 - prog(t, 8.2, 0.8),
  };
}
// After 9.0 s the tiles shrink to half size at the top-left, then fade as the push in on the vertex starts.
export const SHRINK = { t: 9.0, dur: 0.6 };
export const tileScale = (t: number) => 1 - 0.5 * prog(t, SHRINK.t, SHRINK.dur);
export const tileShift = (t: number) => 45 * prog(t, SHRINK.t, SHRINK.dur);
export const tileAlpha = (t: number) => 1 - prog(t, 12.6, 0.5);

// ---- the graph: x ∈ [−7, 1] → 140…940, y ∈ [−11, 5] → 960…380 ---------------------------------------------------------
export const gx = (x: number) => 140 + (x + 7) * 100, gy = (y: number) => 380 + (5 - y) * 36.25;
export const GRAPH = { t: 9.6, dur: 1.2 }, RIDE = { t: 10.8, dur: 1.8 };
/** The dot's x on the parabola (null before it appears): from 0 down to the vertex. */
export const dotX = (t: number) => (t < RIDE.t ? null : -3 * prog(t, RIDE.t, RIDE.dur));
export const readoutAt = (t: number) => { const x = dotX(t); if (x === null) return ''; const y = f(x); return `y = ${y === 0 ? '0' : y.toFixed(2).replace('-', '−')}`; };

export const CAPTIONS: Caption[] = [
  { t0: 0.3, t1: 1.4, text: 'Split the 6x strip in two' },
  { t0: 1.4, t1: 3.4, text: '…and wrap it round the square' },
  { t0: 3.4, t1: ANSWER_AT, text: 'One corner is missing' },
  { t0: ANSWER_AT, t1: 7.0, text: 'A perfect square!' },
  { t0: 7.0, t1: 9.0, text: 'Take the 9 back out' },
  { t0: 9.6, t1: 12.6, text: 'Lowest value: −9, at x = −3' },
  { t0: 12.6, t1: END_AT, text: 'Squared part ≥ 0, so ≥ −9' },
];
export const MUSIC_HITS = [ANSWER_AT, 12.6];

// Camera: [zoom, focus x, focus y] (band px). A slow push from frame 0, a punch-in on the corner landing on the answer, a
// fast zoom out, a pan following the dot, and a gentle push in on the vertex. Text that isn't on a tile stays still.
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1, 540, 515],
  keys: [
    { t: 0, dur: 3.3, to: [1.06, 540, 540] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.2, 640, 470] },
    { t: 5.0, dur: 0.6, to: [1.0, 540, 515] },
    { t: RIDE.t, dur: RIDE.dur, to: [1.0, 540, 600] },
    { t: 12.6, dur: 3.0, to: [1.1, 540, 760] },
  ],
};
/** Band px of the picture → where it shows on screen at time t. */
export const view = ([x, y]: [number, number], t: number): [number, number] => {
  const [z, fx, fy] = tween(t, CAMERA.start, CAMERA.keys);
  return [540 + (x - fx) * z, 515 + (y - fy) * z];
};

// ---- labels: one list for the picture and the overlap test --------------------------------------------------------
export type Label = { text: string; x: number; y: number; anchor: 'start' | 'middle' | 'end'; size: number; alpha: number; color: string; fixed?: boolean };
function swapText(a: string, b: string, t: number, at: number) {
  const q = prog(t, at, 0.5);
  return q < 0.5 ? { text: a, fade: 1 - 2 * q } : { text: b, fade: 2 * q - 1 };
}
export function labelsAt(t: number, ink = '#23304a', muted = '#5f6880'): Label[] {
  const onTiles = 1 - prog(t, SHRINK.t - 0.25, 0.25), oldSides = 1 - prog(t, ANSWER_AT, 0.2), newSides = prog(t, 5.6, 0.3);   // after the zoom out, so the left label stays in frame
  const l = leftHalfAt(t), r = rightHalfAt(t), k = cornerAt(t), lift = prog(t, 7.0, 1.0);
  const gap = r.cx - 60 - (l.x + l.w), whole = gap < 3 ? 1 : Math.max(0, 1 - (gap - 3) / 5);
  const id = swapText('x² + 6x + 9 = (x + 3)²', 'x² + 6x = (x + 3)² − 9', t, 7.6), hop = prog(t, SHRINK.t, 0.5);
  const move = hop < 0.5 ? 0 : 1, hopFade = hop < 0.5 ? 1 - 2 * hop : 2 * hop - 1;   // fades out, reappears top-right: never crosses the tiles
  return [
    { text: 'x', x: 480, y: 118, anchor: 'middle', size: 40, alpha: oldSides * onTiles, color: muted },
    { text: 'x', x: 268, y: 345, anchor: 'middle', size: 40, alpha: oldSides * onTiles, color: muted },
    { text: '6', x: 820, y: 118, anchor: 'middle', size: 40, alpha: 1 - prog(t, LABEL_SWAP.t, 0.1), color: muted },
    { text: '3', x: l.x + 60, y: 118, anchor: 'middle', size: 40, alpha: prog(t, 1.3, 0.1) * oldSides, color: muted },
    { text: '3', x: 880, y: 118, anchor: 'middle', size: 40, alpha: prog(t, 1.3, 0.1) * (1 - prog(t, 1.4, 0.15)), color: muted },
    { text: '3', x: 268, y: 582, anchor: 'middle', size: 40, alpha: prog(t, 3.4, 0.3) * oldSides, color: muted },
    { text: 'x + 3', x: 540, y: 118, anchor: 'middle', size: 40, alpha: newSides * onTiles, color: muted },
    { text: 'x + 3', x: 285, y: 400, anchor: 'end', size: 40, alpha: newSides * onTiles, color: muted },
    { text: 'x²', x: 480, y: 363, anchor: 'middle', size: 52, alpha: onTiles, color: ink },
    { text: '6x', x: 820, y: 344, anchor: 'middle', size: 40, alpha: whole, color: ink },   // fades as the strip visibly splits
    { text: '3x', x: l.x + 60, y: 344, anchor: 'middle', size: 40, alpha: prog(t, 1.3, 0.1) * onTiles, color: ink },
    { text: '3x', x: r.cx, y: r.cy + 14, anchor: 'middle', size: 40, alpha: prog(t, 1.3, 0.1) * onTiles, color: ink },
    { text: '9', x: k.x + 60, y: k.y + 78 - 0 * lift, anchor: 'middle', size: 48, alpha: k.fill * k.alpha, color: ink },
    { text: id.text, x: 540 + 195 * move, y: 720 - 520 * move, anchor: 'middle', size: 46 - 8 * move,
      alpha: prog(t, ANSWER_AT + 0.3, 0.4) * id.fade * hopFade * (1 - prog(t, 12.6, 0.4)), color: ink, fixed: true },
    { text: '(x + 3)² = 0 here', x: gx(-3) + 20, y: gy(-9) + 52, anchor: 'start', size: 36, alpha: prog(t, 12.6, 0.4), color: COLORS.corner },
  ];
}
/** A label's box on screen (fixed labels don't zoom; the rest move with the camera). */
export function labelBox(lb: Label, t: number) {
  const z = lb.fixed ? 1 : tween(t, CAMERA.start, CAMERA.keys)[0], [x, y] = lb.fixed ? [lb.x, lb.y] : view([lb.x, lb.y], t);
  const w = [...lb.text].length * lb.size * 0.5 * z, h = lb.size * z;
  const x0 = lb.anchor === 'start' ? x : lb.anchor === 'end' ? x - w : x - w / 2;
  return { x0, x1: x0 + w, y0: y - 0.8 * h, y1: y + 0.2 * h };
}

// When does the readout pass v (it only falls while the dot rides)? Bisection.
function readoutCross(v: number) {
  let lo = RIDE.t, hi = RIDE.t + RIDE.dur;
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (f(dotX(mid)!) > v) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
// Sound: a snap at the split, a tap as each half lands, soft clicks as the corner pulses, a knock on the answer, a whump
// as the 9 lifts out, ticks as the readout passes −1 … −8, a tap at the vertex. Whooshes on the fast zooms.
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    { kind: 'snap', t: 0.05, gain: 0.3 },
    { kind: 'tap', t: 1.4, gain: 0.32 },
    { kind: 'tap', t: 3.4, gain: 0.35, pitch: 1.1 },
    { kind: 'click', t: 3.6, gain: 0.2 }, { kind: 'click', t: 4.05, gain: 0.2 },
    { kind: 'thunk', t: ANSWER_AT, gain: 0.5 },
    { kind: 'whump', t: 7.0, gain: 0.35 },
    ...[-1, -2, -3, -4, -5, -6, -7, -8].map((v, i): Hit => ({ kind: 'click', t: readoutCross(v), gain: 0.26, pitch: 1.3 - 0.05 * i })),
    { kind: 'tap', t: RIDE.t + RIDE.dur, gain: 0.35, pitch: 0.9 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [],
};
