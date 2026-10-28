// @lws.pune · reel 028, remade the founder's way (2026-10-28: "i asked you to make exact one"): the studied
// @official_neutron_and_numbers trig reel (1.1M views, remake-backlog W32) in its own look and order: a dark starfield,
// a glowing cyan circle, flat neon lines, one coloured title per step, and a continuous narration (our own words, Kokoro
// af_heart, the founder's pick from two samples). The one change the founder chose: cot and cosec where they really are
// (theirs sends cosec up-left, off θ's ray, and cot left of the y-axis). Pure functions of t; the screen is 1080 × 1920.
//
// Beats (each starts with its narration line):
// | beat    | narration                                                            | picture                                   |
// | circle  | Take a circle with radius one.                                       | the circle draws, "1"; a ripple            |
// | angle   | Pick an angle, theta, and draw its radius.                           | the radius swings up to θ = 40°; a glow    |
// | sin     | Now drop a line straight down … That height is sine theta.           | green drop, "sin θ"                        |
// | cos     | And the shadow it leaves along the x-axis? That's cosine theta.      | yellow base, "cos θ"                       |
// | why     | But why is tangent called tangent?                                   | title only                                 |
// | touch   | Draw a line that just touches the circle on the right, going up.     | thin cyan line up x = 1                    |
// | extend  | Now stretch the radius until it meets that line.                     | the radius runs on to T                    |
// | tan     | That piece is the real tangent. It touches the circle.               | a glitch, then cyan A → T, "tan θ"         |
// | sec     | And the slanted line … That's the secant. It cuts right through …    | orange O → T, a flash where it cuts        |
// | cut     | Secant literally means to cut.                                       | "Secant = To Cut"                          |
// | top     | Now do the same at the top. Draw a line that touches the top …       | an arrow at the top; y = 1; ray to C       |
// | cot     | That top piece is cotangent.                                         | purple B → C, "cot θ"                      |
// | csc     | And the slanted line from the centre to it is cosecant.              | pink O → C, a flash where it cuts          |
// | six     | Six ratios. Six real lines.                                          | the six lines glow in turn                 |
import { prog, tween, type Key } from './motion.ts';
import type { Hit, Score } from './sfx.ts';
import type { VoiceLine } from './voice.ts';

export type V2 = [number, number];
export const THETA_DEG = 40, CENTRE: V2 = [540, 860], R = 330;
export const COLORS = { circle: '#22d3ee', radius: '#f1f5f9', sin: '#34d399', cos: '#facc15', tan: '#22d3ee', sec: '#fb923c',
  cot: '#c084fc', csc: '#f472b6', axis: '#64748b', bg: '#070b16', arrow: '#fbbf24' };

const rad = (d: number) => (d * Math.PI) / 180;
/** Every point of the figure at θ (degrees), in units of the radius: P on the circle, M under it, A = (1, 0) and
 *  B = (0, 1) where the two touching lines touch, T and C where θ's ray meets them. */
export function figure(deg: number) {
  const th = rad(deg), c = Math.cos(th), s = Math.sin(th);
  return { th, c, s, P: [c, s] as V2, M: [c, 0] as V2, A: [1, 0] as V2, T: [1, s / c] as V2, B: [0, 1] as V2, C: [c / s, 1] as V2 };
}
export const toScreen = (p: V2): V2 => [CENTRE[0] + R * p[0], CENTRE[1] - R * p[1]];

// ---- the narration and its beats --------------------------------------------------------------------------------------
// Start times leave each af_heart line (measured 2026-10-28) ~0.15 s spare and ~0.25 s of breath before the next.
const LINES: [string, string, number][] = [
  ['circle', 'Take a circle with radius one.', 0.3],
  ['angle', 'Pick an angle, theta, and draw its radius.', 2.55],
  ['sin', 'Now drop a line straight down to the x-axis. That height is sine theta.', 5.45],
  ['cos', 'And the shadow it leaves along the x-axis? That\'s cosine theta.', 10.04],
  ['why', 'But why is tangent called tangent?', 14.08],
  ['touch', 'Draw a line that just touches the circle on the right, going straight up.', 16.24],
  ['extend', 'Now stretch the radius until it meets that line.', 20.06],
  ['tan', 'That piece is the real tangent. It touches the circle.', 23.06],
  ['sec', 'And the slanted line from the centre up to it? That\'s the secant. It cuts right through the circle.', 26.64],
  ['cut', 'Secant literally means to cut.', 32.17],
  ['top', 'Now do the same at the top. Draw a line that touches the top of the circle, and stretch the radius to meet it.', 34.31],
  ['cot', 'That top piece is cotangent.', 40.74],
  ['csc', 'And the slanted line from the centre to it is cosecant.', 42.8],
  ['six', 'Six ratios. Six real lines.', 46.11],
];
export const DURATION = 49.6, COVER_T = 49.0;
export const BEATS = LINES.map(([id, , t]) => ({ id, t }));
const at = (id: string) => BEATS.find(b => b.id === id)!.t;
export const VOICE: VoiceLine[] = LINES.map(([, text, t], i) => ({ t, until: i + 1 < LINES.length ? LINES[i + 1][2] : DURATION - 0.3, text }));
export const beatAt = (t: number) => [...BEATS].reverse().find(b => t >= b.t)?.id ?? null;

// When each line starts drawing (on the words that name it) and how long it takes.
export const DRAW = {
  circle: at('circle') + 0.2, angle: at('angle') + 0.3, sin: at('sin') + 0.7, cos: at('cos') + 0.6, touch: at('touch') + 0.3,
  extend: at('extend') + 0.3, tan: at('tan'), sec: at('sec') + 1.6, top: at('top') + 2.0, extend2: at('top') + 4.2, cot: at('cot'),
  csc: at('csc') + 0.8,
};
const DUR = { circle: 1.2, angle: 1.5, sin: 0.8, cos: 0.8, touch: 1.2, extend: 0.9, tan: 0.5, sec: 1.0, top: 1.2, extend2: 0.8, cot: 0.6, csc: 1.0 };
const drawn = (k: keyof typeof DRAW, t: number) => prog(t, DRAW[k], DUR[k]);
export const angleAt = (t: number) => THETA_DEG * drawn('angle', t);
export const circleDrawn = (t: number) => drawn('circle', t);

/** A short swell 0 → 1 → 0 over d seconds from t0. */
const swell = (t: number, t0: number, d = 0.6) => (t >= t0 && t < t0 + d ? Math.sin((Math.PI * (t - t0)) / d) : 0);
export const rippleAt = (t: number) => { const u = (t - (DRAW.circle + 1.0)) / 1.0; return u > 0 && u < 1 ? u : 0; };
export const glowAt = (t: number) => swell(t, DRAW.angle + DUR.angle - 0.1, 0.9);
/** The glitch on the tangent (their beat ~20 s): a few frames of shifted slices, seeded so every render is the same. */
export const glitchAt = (t: number) => (t >= DRAW.tan - 0.12 && t < DRAW.tan + 0.24 ? 1 + Math.floor((t - DRAW.tan + 0.12) * 30) : 0);

/** Their gentle camera: a push in on "Cosine is the Base" and a smaller one on the tangent, each easing back out. The
 *  picture scales about the circle's centre (labels with it); titles stay put. */
const ZOOM_KEYS: Key[] = [
  { t: at('cos') + 0.2, dur: 0.6, to: [1.12] }, { t: at('why') - 0.4, dur: 0.6, to: [1] },
  { t: DRAW.tan + 0.3, dur: 0.6, to: [1.06] }, { t: at('sec') - 0.2, dur: 0.6, to: [1] },
];
export const zoomAt = (t: number) => tween(t, [1], ZOOM_KEYS)[0];

// ---- the lines (screen coordinates) ---------------------------------------------------------------------------------
export type Segment = { id: string; a: V2; b: V2; color: string; width: number; drawn: number; alpha: number; glow: number };
const LANE = 6;  // sec and cosec share θ's ray, so each runs in its own lane beside it
export function segmentsAt(t: number): Segment[] {
  const deg = Math.max(angleAt(t), 0.0001), f = figure(THETA_DEG), g = figure(deg), S = toScreen;
  const n: V2 = [Math.sin(f.th), Math.cos(f.th)];        // on screen: the ray's clockwise side (y points down)
  const lane = (p: V2, side: number): V2 => [p[0] + side * LANE * n[0], p[1] + side * LANE * n[1]];
  const six = (k: number) => swell(t, at('six') + 0.35 * k, 0.7);
  const seg = (id: string, a: V2, b: V2, color: string, width: number, d: number, alpha: number, glow = 0): Segment =>
    ({ id, a, b, color, width, drawn: d, alpha: d > 0 ? alpha : 0, glow });
  return [
    seg('radius', S([0, 0]), S(g.P), COLORS.radius, 4, t >= DRAW.angle ? 1 : 0, 1),
    seg('touch', S([1, 0]), S([1, f.T[1] + 0.42]), COLORS.tan, 3, drawn('touch', t), 0.6),
    seg('extend', S(f.P), S(f.T), COLORS.radius, 3, drawn('extend', t), 0.8),
    seg('top', S([0, 1]), S([f.C[0] + 0.25, 1]), COLORS.cot, 3, drawn('top', t), 0.6),
    seg('extend2', S(f.T), S(f.C), COLORS.radius, 3, drawn('extend2', t), 0.8),
    seg('sin', S(f.P), S(f.M), COLORS.sin, 6, drawn('sin', t), 1, 0.8 * six(0)),
    seg('cos', S([0, 0]), S(f.M), COLORS.cos, 6, drawn('cos', t), 1, 0.8 * six(1)),
    seg('tan', S(f.A), S(f.T), COLORS.tan, 7, drawn('tan', t), 1, 0.8 * swell(t, DRAW.tan, 0.8) + 0.8 * six(2)),
    seg('sec', lane(S([0, 0]), 1), lane(S(f.T), 1), COLORS.sec, 5, drawn('sec', t), 1, 0.8 * six(3)),
    seg('cot', S(f.B), S(f.C), COLORS.cot, 6, drawn('cot', t), 1, 0.8 * six(4)),
    seg('csc', lane(S([0, 0]), -1), lane(S(f.C), -1), COLORS.csc, 5, drawn('csc', t), 1, 0.8 * six(5)),
  ];
}
/** Flashes where each slant passes through the circle (at P), timed to the moment its tip gets there. */
export const CUTS = [DRAW.sec + DUR.sec * Math.cos(rad(THETA_DEG)), DRAW.csc + DUR.csc * Math.sin(rad(THETA_DEG))];
export const cutFlashAt = (t: number) => Math.max(...CUTS.map(c => swell(t, c - 0.05, 0.5)));
/** Their curved arrow pointing down at the top of the circle, while the top step is set up. */
export const arrowAt = (t: number) => prog(t, at('top') + 0.2, 0.4) * (1 - prog(t, DRAW.top + 0.6, 0.4));

// ---- words ------------------------------------------------------------------------------------------------------------
export type Title = { t: number; text: string; color: string };
export const TITLES: Title[] = [
  { t: at('circle'), text: 'Start with a circle of radius 1', color: COLORS.circle },
  { t: at('angle'), text: 'Choose an angle θ', color: COLORS.cos },
  { t: at('sin'), text: 'Sine is the Height', color: COLORS.sin },
  { t: at('cos'), text: 'Cosine is the Base', color: COLORS.cos },
  { t: at('why'), text: 'Why is it called Tangent?', color: COLORS.tan },
  { t: at('sec'), text: 'Secant Cuts the Circle', color: COLORS.sec },
  { t: at('top'), text: 'Cotangent at the Top', color: COLORS.cot },
  { t: at('csc'), text: 'Cosecant', color: COLORS.csc },
  { t: at('six'), text: 'Six Actual Lines', color: COLORS.cos },
];
export const SUBTITLES: (Title & { t1: number })[] = [
  { t: at('tan') + 0.6, t1: at('sec'), text: 'Tangent = Touching', color: COLORS.tan },
  { t: at('cut'), t1: at('top'), text: 'Secant = To Cut', color: COLORS.sec },
];
export const titleAt = (t: number) => [...TITLES].reverse().find(x => t >= x.t) ?? null;
export const subtitleAt = (t: number) => SUBTITLES.find(x => t >= x.t && t < x.t1) ?? null;
export const TITLE_Y = 200, TITLE_SIZE = 56, SUBTITLE_Y = 1330, SUBTITLE_SIZE = 40;

export type Label = { text: string; x: number; y: number; size: number; anchor: 'start' | 'middle' | 'end'; color: string; alpha: number };
export function labelsAt(t: number): Label[] {
  const f = figure(THETA_DEG), S = toScreen, P = S(f.P), M = S(f.M), A = S(f.A), T = S(f.T), C = S(f.C), B = S(f.B);
  const acw: V2 = [-Math.sin(f.th), -Math.cos(f.th)];   // on screen: the ray's anticlockwise side
  const along = (k: number, off: number): V2 => { const p = S([k * f.c, k * f.s]); return [p[0] + off * acw[0], p[1] + off * acw[1]]; };
  const half = rad(angleAt(t) / 2), sec = 1 / f.c;
  const fade = (k: keyof typeof DRAW) => prog(t, DRAW[k] + DUR[k] * 0.6, 0.3);
  // cosec's name sits just past its own end (beyond the top corner), clear of the tangent line it crosses
  const secAt = along(0.55 * sec, 34), cscAt: V2 = [C[0] + 12, C[1] - 26];
  return [
    { text: '1', x: A[0] + 14, y: A[1] + 40, size: 34, anchor: 'start', color: COLORS.radius, alpha: prog(t, DRAW.circle + 0.9, 0.3) },
    { text: 'θ', x: CENTRE[0] + 92 * Math.cos(half), y: CENTRE[1] - 92 * Math.sin(half) + 12, size: 34, anchor: 'middle', color: COLORS.cos, alpha: prog(t, DRAW.angle + 0.4, 0.3) },
    { text: 'sin θ', x: P[0] - 14, y: (P[1] + M[1]) / 2, size: 38, anchor: 'end', color: COLORS.sin, alpha: fade('sin') },
    { text: 'cos θ', x: (CENTRE[0] + M[0]) / 2, y: CENTRE[1] + 46, size: 38, anchor: 'middle', color: COLORS.cos, alpha: fade('cos') },
    { text: 'tan θ', x: A[0] + 18, y: (A[1] + T[1]) / 2, size: 38, anchor: 'start', color: COLORS.tan, alpha: fade('tan') },
    { text: 'sec θ', x: secAt[0], y: secAt[1], size: 38, anchor: 'middle', color: COLORS.sec, alpha: fade('sec') },
    { text: 'cot θ', x: (B[0] + C[0]) / 2, y: B[1] - 36, size: 38, anchor: 'middle', color: COLORS.cot, alpha: fade('cot') },
    { text: 'csc θ', x: cscAt[0], y: cscAt[1], size: 38, anchor: 'start', color: COLORS.csc, alpha: fade('csc') },
  ];
}
export function labelBox(l: Label) {
  const w = [...l.text].length * l.size * 0.55, h = l.size;
  const x0 = l.anchor === 'start' ? l.x : l.anchor === 'end' ? l.x - w : l.x - w / 2;
  return { x0, x1: x0 + w, y0: l.y - 0.6 * h, y1: l.y + 0.4 * h };
}

// ---- sound: soft, under the voice --------------------------------------------------------------------------------------
// A shimmer with the ripple, a tap as each line starts drawing, a snap where each slant cuts the circle, a crack on the
// glitch; quiet, so the narration leads. The music dips under the voice (mix.ts --voice).
export const MUSIC_HITS = [DRAW.tan, at('six')];
export const SOUND: Score = {
  duration: DURATION,
  hits: ([
    { kind: 'shimmer', t: DRAW.circle + 1.0, gain: 0.25 },
    ...(['sin', 'cos', 'tan', 'sec', 'cot', 'csc'] as const).map((k, i): Hit => ({ kind: 'tap', t: DRAW[k], gain: 0.3, pitch: 0.9 + 0.08 * i })),
    { kind: 'tap', t: DRAW.touch, gain: 0.22, pitch: 1.5 },
    { kind: 'tap', t: DRAW.top, gain: 0.22, pitch: 1.6 },
    { kind: 'crack', t: DRAW.tan - 0.1, gain: 0.25 },
    ...CUTS.map((t): Hit => ({ kind: 'snap', t, gain: 0.3 })),
  ] as Hit[]).map(h => ({ ...h, gain: h.gain * 1.6 })),
  beds: [],
};
