// @lws.pune · reel 021 (predict-first): flip y = 2ˣ over the line y = x and you get…? log₂x (B). A copy of the curve and
// its dots folds across the mirror line; every point (a, b) lands on (b, a), so 2³ = 8 becomes log₂8 = 3. Then the strip
// y ≤ 0, which 2ˣ never enters, folds onto x ≤ 0: no log for 0 or negatives. NDA 2024 (I) Q27 in the caption.
// Storyboard (independently reviewed, framework F31): reels/nda-maths-021-log-flip.storyboard.md. Pure functions of t.
//
// Beat table (from the storyboard):
// | time       | what moves                                            | caption                          |
// | 0–1.5      | 2ˣ draws, dots (1, 2), (2, 4), (3, 8) pop in            | Power of 2: x in, 2ˣ out         |
// | 1.5–4.4    | the copy folds over y = x, crossing it at 2.95 s       | Fold it over y = x…              |
// | 4.6        | "y = log₂x", B lights, punch-in on (3, 8)–(8, 3)       | 2³ = 8 flips to log₂8 = 3        |
// | 5.0–7.3    | the swap segment draws; the pair's labels become 2³ = 8 / log₂8 = 3 | (same)              |
// | 8.0–10.4   | zoom out; the other pairs become equations             | Every point swaps the same way   |
// | 10.4–12.4  | y ≤ 0 shades ("2ˣ never here"), folds onto x ≤ 0 ("no log") | 2ˣ is never 0… · So no log…  |
// | 13.6–16.6  | end card                                              | Logarithm = the power, flipped   |
import { clamp01, prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { VIVID } from './palette.ts';

export const DURATION = 16.6, END_AT = 13.6, ANSWER_AT = 4.6, COVER_T = 1.45;
export const OPTIONS = ['A   x²', 'B   log₂x', 'C   2⁻ˣ'], ANSWER = 1;
export const COLORS = { exp: VIVID.white.blue, log: VIVID.white.orange };
export const exp2 = (x: number) => 2 ** x, log2 = (x: number) => Math.log2(x);
export const DOTS: [number, number][] = [[1, 2], [2, 4], [3, 8]];

/** Fold a point over y = x: s = 1 leaves it, s = −1 is its mirror image (b, a); in between it moves straight across. */
export function fold([a, b]: [number, number], s: number): [number, number] {
  const m = (a + b) / 2, d = (a - b) / 2;
  return [m + s * d, m - s * d];
}

// The curve draws from x = 0.5 (already on screen at frame 0) to 3.1, then the copy folds; one ease runs into the next.
export const FOLD = { t: 1.5, dur: 2.9 }, CROSS_AT = FOLD.t + FOLD.dur / 2;
export const xEndAt = (t: number) => 0.5 + 2.6 * prog(t, 0, FOLD.t);
export const foldAt = (t: number) => 1 - 2 * prog(t, FOLD.t, FOLD.dur);
function appearAt(x: number) {                                    // when the drawing reaches x (xEndAt only rises)
  let lo = 0, hi = FOLD.t;
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (xEndAt(mid) < x) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
/** A dot's pop-in, 0 → 1 over 0.15 s once the drawing reaches it. */
export const dotAt = ([a]: [number, number], t: number) => clamp01((t - appearAt(a)) / 0.15);

// The swap segment between (3, 8) and (8, 3), and the moments each pair's labels become equations.
export const SEGMENT = { t: 5.0, dur: 0.6 };
const EQ_EXP = [9.4, 8.6, 5.8], EQ_LOG = [9.4, 8.6, 6.6];        // per dot, in DOTS order
export const LABELS_OUT = 10.4;
// The strip y ≤ 0 shades, then folds onto x ≤ 0.
export const SHADE_AT = 10.4, STRIP_FOLD = { t: 11.4, dur: 1.0 };
export const stripFoldAt = (t: number) => 1 - 2 * prog(t, STRIP_FOLD.t, STRIP_FOLD.dur);
export const stripCorners = (s: number) => ([[-1.5, -1.5], [8.6, -1.5], [8.6, 0], [-1.5, 0]] as [number, number][]).map(p => fold(p, s));

export const CAPTIONS: Caption[] = [
  { t0: 0.3, t1: 1.8, text: 'Power of 2: x in, 2ˣ out' },
  { t0: 1.8, t1: ANSWER_AT, text: 'Fold it over y = x…' },
  { t0: ANSWER_AT, t1: 8.0, text: '2³ = 8 flips to log₂8 = 3' },
  { t0: 8.0, t1: SHADE_AT, text: 'Every point swaps the same way' },
  { t0: SHADE_AT, t1: 12.0, text: '2ˣ is never 0 or negative…' },
  { t0: 12.0, t1: END_AT, text: 'So no log for 0 or negatives' },
];
export const MUSIC_HITS = [ANSWER_AT, STRIP_FOLD.t + STRIP_FOLD.dur];

// The picture: band-local px, 95 px per unit on both axes (equal, so the swap segment really looks perpendicular).
export const K = 95;
// Camera: [zoom, centre x, centre y] in maths units. A slow push in from frame 0, a punch-in re-centred on the (3, 8)–(8, 3)
// pair landing on the answer, a fast zoom out, and a gentle push for the domain beat.
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1, 3.5, 3.9],
  keys: [
    { t: 0, dur: 4.2, to: [1.06, 3.5, 3.9] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.3, 5.5, 5.5] },
    { t: 8.0, dur: 0.6, to: [1.0, 3.5, 3.9] },
    { t: STRIP_FOLD.t, dur: 2.2, to: [1.06, 3.5, 3.9] },
  ],
};
export type Cam = { z: number; cx: number; cy: number };
export function cam(t: number): Cam {
  const [z, cx, cy] = tween(t, CAMERA.start, CAMERA.keys);
  return { z, cx, cy };
}
export const toScreen = (x: number, y: number, c: Cam): [number, number] => [540 + (x - c.cx) * K * c.z, 515 - (y - c.cy) * K * c.z];

// ---- labels: one list for the picture and the overlap test --------------------------------------------------------
export type Label = { text: string; x: number; y: number; anchor: 'start' | 'middle' | 'end'; size: number; alpha: number; color: string; vertical?: boolean };
const SUP: Record<number, string> = { 1: '¹', 2: '²', 3: '³' };
/** Cross-fade one text into another in place: the old fades out, then the new fades in (one label, never two). */
function swapText(oldText: string, newText: string, t: number, at: number) {
  const q = prog(t, at, 0.5);
  return q < 0.5 ? { text: oldText, fade: 1 - 2 * q } : { text: newText, fade: 2 * q - 1 };
}
export function labelsAt(t: number, muted = '#5f6880'): Label[] {
  const c = cam(t), zoomed = clamp01((c.z - 1.065) / 0.025), out = 1 - prog(t, LABELS_OUT, 0.5), s = foldAt(t);
  const at = (x: number, y: number, dx: number, dy: number) => { const [u, v] = toScreen(x, y, c); return { x: u + dx, y: v + dy }; };
  const ls: Label[] = [];
  const draw = clamp01((xEndAt(t) - 2.4) / 0.3);
  ls.push({ text: 'y = 2ˣ', ...at(2.4, 5.3, -22, 12), anchor: 'end', size: 40, alpha: draw * (1 - zoomed), color: COLORS.exp });
  ls.push({ text: 'y = x', ...at(7.4, 7.4, 16, 40), anchor: 'start', size: 36, alpha: 1 - zoomed, color: muted });
  ls.push({ text: 'y = log₂x', ...at(6.2, 1.4, 0, 0), anchor: 'start', size: 40, alpha: prog(t, ANSWER_AT, 0.4) * (1 - zoomed), color: COLORS.log });
  DOTS.forEach(([a, b], i) => {
    const keep = i === 2 ? 1 : 1 - zoomed;                         // only the (3, 8) pair stays labelled while zoomed in
    const e = swapText(`(${a}, ${b})`, `2${SUP[a]} = ${b}`, t, EQ_EXP[i]);
    ls.push({ text: e.text, ...at(a, b, -22, 12), anchor: 'end', size: 40, alpha: dotAt([a, b], t) * e.fade * keep * out, color: COLORS.exp });
    const [u, v] = fold([a, b], s), l = swapText(`(${b}, ${a})`, `log₂${b} = ${a}`, t, EQ_LOG[i]);
    const off = i === 0 ? { dx: 14, dy: 44, anchor: 'start' as const } : i === 1 ? { dx: 0, dy: 48, anchor: 'middle' as const } : { dx: 20, dy: 48, anchor: 'end' as const };
    ls.push({ text: l.text, ...at(u, v, off.dx, off.dy), anchor: off.anchor, size: 40, alpha: prog(t, CROSS_AT, 0.3) * l.fade * keep * out, color: COLORS.log });
  });
  ls.push({ text: '2ˣ never here', ...at(5.2, -0.5, 0, 0), anchor: 'middle', size: 36, alpha: prog(t, SHADE_AT, 0.5) * (1 - prog(t, STRIP_FOLD.t, 0.3)), color: COLORS.exp });
  ls.push({ text: 'no log', ...at(-0.75, 4.0, 0, 0), anchor: 'middle', size: 44, alpha: prog(t, STRIP_FOLD.t + STRIP_FOLD.dur - 0.2, 0.4), color: COLORS.log, vertical: true });
  return ls;
}
/** A label's box (band px): Cambria at ~0.5 em per character, baseline at y. */
export function labelBox(l: Label) {
  const w = [...l.text].length * l.size * 0.5, h = l.size;
  if (l.vertical) return { x0: l.x - h / 2, x1: l.x + h / 2, y0: l.y - w / 2, y1: l.y + w / 2 };
  const x0 = l.anchor === 'start' ? l.x : l.anchor === 'end' ? l.x - w : l.x - w / 2;
  return { x0, x1: x0 + w, y0: l.y - 0.8 * h, y1: l.y + 0.2 * h };
}

// Sound: a tap as each dot pops in; a shimmer under the fold and a snap as the copy crosses the line; a knock on the
// answer; taps for the segment and each equation; a whump as the strip shades, a shimmer + snap as it folds and lands.
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...DOTS.map(([a]): Hit => ({ kind: 'tap', t: appearAt(a), gain: 0.3, pitch: 0.9 + 0.1 * a })),
    { kind: 'shimmer', t: FOLD.t, gain: 0.3 },
    { kind: 'snap', t: CROSS_AT, gain: 0.35 },
    { kind: 'thunk', t: ANSWER_AT, gain: 0.5 },
    ...[SEGMENT.t, EQ_EXP[2], EQ_LOG[2], EQ_EXP[1], EQ_EXP[0]].map((t, i): Hit => ({ kind: 'tap', t, gain: 0.28, pitch: 1 + 0.05 * i })),
    { kind: 'whump', t: SHADE_AT, gain: 0.35 },
    { kind: 'shimmer', t: STRIP_FOLD.t, gain: 0.3 },
    { kind: 'snap', t: STRIP_FOLD.t + STRIP_FOLD.dur, gain: 0.35 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [],
};
