// @pyqvault_ · Maths, visualised #5 (founder 2026-10-30: "create exact reel", then "shorter cut"): where the derivative
// comes from. @mathsy.uk's "Where differentiation actually comes from" (study copy study/reels/DelvgyeNk3L.mp4, never
// posted) copied in its look and order up to the derivative's formula, where their first half ends (57.5 s of 114.9 s):
// black board, one green curve on grey axes, gold for h and the moving point, a white chord that becomes the tangent,
// dashed guides, the formula built above the graph, word-by-word captions in a dark pill with the spoken word in gold.
// Ours: every word of the narration (Kokoro af_heart), the curve, the music (Pixabay "Science Documentary", shelf
// soothing-documentary) and the end card. Pure functions of t; the screen is 1080 × 1920. Storyboard:
// reels/pv-maths-005-first-principles.storyboard.md.
//
// The maths: f(x) = 0.3x² + 0.4, x0 = 1.4, h from 1.4. Chord slope (f(x0 + h) − f(x0)) / h = 0.3(2x0 + h) = 0.84 + 0.3h,
// which closes in on f′(x0) = 0.84 as h → 0. At h = 1.4, f(x0 + h) = 2.752 but f(x0) + h = 2.388: the warning beat.
import { clamp01, prog } from './motion.ts';
import type { Score } from './sfx.ts';
import type { VoiceLine } from './voice.ts';

export const SOURCE = { handle: '@mathsy.uk', url: 'https://www.instagram.com/reel/DelvgyeNk3L/', views17Oct: 47837, multiple17Oct: 2.0,
  likes30Oct: 8190, duration: 114.9, cutAt: 57.5 } as const;

// ---- the curve ---------------------------------------------------------------------------------------------------------
const A = 0.3, B = 0, C = 0.4;
export const F = (x: number) => A * x * x + B * x + C;
export const slope = (x: number) => 2 * A * x + B;
export const X0 = 1.4, H0 = 1.4;
export const chordSlope = (h: number) => (F(X0 + h) - F(X0)) / h;

/** The graph box in maths units, and where it sits on screen (x and y scaled apart, as theirs). */
export const GRAPH = { x0: 0, x1: 3.6, y0: 0, y1: 4.5 } as const;
const ORIGIN = [310, 1150] as const, SX = 155, SY = 122;   // their compact, centred graph (~560 × 550 px)
export const toScreen = ([x, y]: [number, number]): [number, number] => [ORIGIN[0] + SX * x, ORIGIN[1] - SY * y];
export const LAYOUT = { formulaY: 400, captionY: 1365, labelGap: 62 } as const;
export const COLORS = { bg: '#050607', curve: '#3ecf8e', gold: '#f5b83d', chord: '#f4f4f5', axis: '#6b7280', guide: '#9ca3af',
  text: '#e5e7eb', pill: '#16191f' } as const;

// ---- the narration (ours) and its beats --------------------------------------------------------------------------------
// dur = af_heart's spoken length (measured 2026-10-30); starts leave ≥ 0.3 s of breath and follow their beats' order.
export const LINES: { id: string; text: string; t: number; dur: number }[] = [
  { id: 'title', text: 'Where do derivatives really come from?', t: 0, dur: 1.94 },        // on screen from frame 0, as theirs
  { id: 'curve', text: 'It all starts with a curve: y equals f of x.', t: 2.6, dur: 2.94 },
  { id: 'point', text: 'Pick a point on it, above x.', t: 5.9, dur: 1.63 },
  { id: 'fx', text: 'Its height there is f of x.', t: 7.85, dur: 1.55 },
  { id: 'step', text: 'Now step a little to the right. Call that small step h.', t: 9.75, dur: 3.24 },
  { id: 'land', text: 'You land at x plus h,', t: 13.3, dur: 1.53 },
  { id: 'fxh', text: "and the curve's height there is f of x plus h.", t: 15.05, dur: 2.58 },
  { id: 'warn', text: "Careful: that isn't f of x with h added on. You have to work the curve out again at the new spot.", t: 18.1, dur: 5.44 },
  { id: 'chord', text: "Join the two points with a straight line. That's a chord.", t: 24.0, dur: 2.93 },
  { id: 'steep', text: 'How steep is it?', t: 27.4, dur: 1.07 },
  { id: 'rise', text: 'It climbs from f of x up to f of x plus h,', t: 28.85, dur: 2.96 },
  { id: 'climb', text: 'so the climb is f of x plus h, minus f of x.', t: 32.15, dur: 3.45 },
  { id: 'run', text: 'And it moves across by h.', t: 35.95, dur: 1.53 },
  { id: 'slope', text: "Climb over distance: that's the chord's slope.", t: 37.85, dur: 2.42 },
  { id: 'shrink', text: 'Now let h get smaller.', t: 40.8, dur: 1.38 },
  { id: 'slide', text: 'The second point slides back towards the first,', t: 42.5, dur: 2.39 },
  { id: 'tangent', text: "and the chord swings round until it just touches the curve at x. That's the tangent.", t: 45.15, dur: 4.49 },
  { id: 'close', text: 'h never quite reaches zero, but it gets as close as we like.', t: 50.2, dur: 3.5 },
  { id: 'limit', text: 'That closing-in is called a limit.', t: 54.05, dur: 1.73 },
  { id: 'deriv', text: 'And the slope it closes in on is the derivative, f dash of x.', t: 56.2, dur: 3.96 },
];
export const endCardAt = { start: 60.9 } as const;
export const DURATION = 63.5;
export const BEATS = LINES.map(({ id, t }) => ({ id, t }));
const at = (id: string) => BEATS.find(b => b.id === id)!.t;
export const COVER_T = at('slope') + 1.2;
export const VOICE: VoiceLine[] = LINES.map(({ t, text }, i) => ({ t, until: i + 1 < LINES.length ? LINES[i + 1].t : endCardAt.start, text }));

// ---- h: full size, then shrinking towards 0 (never reaching it) ----------------------------------------------------------
const SHRINK = at('shrink') + 0.6, NEAR = 0.0012, LAST = 0.0004;
export function hAt(t: number): number {
  if (t <= SHRINK) return H0;
  if (t <= at('close')) return H0 * (NEAR / H0) ** ((t - SHRINK) / (at('close') - SHRINK));
  const t1 = at('deriv') + 1;                                     // then slowly, so the counter can be read, and it stops
  return NEAR * (LAST / NEAR) ** ((Math.min(t, t1) - at('close')) / (t1 - at('close')));
}

/** Their live counter, from the line that says h never reaches zero until the derivative is named. */
export const counterAt = (t: number) =>
  t >= at('close') + 0.3 && t < at('deriv') + 0.8 ? { text: `h = ${hAt(t).toFixed(4)}`, alpha: prog(t, at('close') + 0.3, 0.3) * (1 - prog(t, at('deriv') + 0.5, 0.3)) } : null;

// ---- captions: the line being spoken, up to four words at a time, the spoken word in gold ------------------------------
const weight = (w: string) => w.replace(/[^\w']/g, '').length + 2;
export function captionAt(t: number): { words: string[]; active: number; start: number } | null {
  const i = LINES.findLastIndex(l => t >= l.t);
  if (i < 0) return null;
  const l = LINES[i], end = Math.min(l.t + l.dur + 0.6, i + 1 < LINES.length ? LINES[i + 1].t : endCardAt.start);
  if (t >= end) return null;
  const words = l.text.split(' '), total = words.reduce((s, w) => s + weight(w), 0);
  let k = 0, acc = 0;
  for (let j = 0; j < words.length; j++) { if (l.t + (l.dur * acc) / total <= t) k = j; acc += weight(words[j]); }
  // chunks: break after punctuation, or at four words
  let from = 0;
  for (let j = 0; j < words.length; j++) {
    const to = j + 1;
    if (/[,.:?]$/.test(words[j]) || to - from === 4 || to === words.length) {
      if (k < to) return { words: words.slice(from, to), active: k - from, start: from };
      from = to;
    }
  }
  return null;
}

// ---- the formula above the graph ----------------------------------------------------------------------------------------
export type Stage = 'neq' | 'climb' | 'quotient' | 'limit' | 'derivative';
export function formulaAt(t: number): { stage: Stage; alpha: number; age: number } | null {
  const spans: [Stage, number, number][] = [
    ['neq', at('warn') + 0.6, at('chord')],
    ['climb', at('climb') + 0.5, at('run') + 0.6],
    ['quotient', at('run') + 0.6, at('limit') + 0.3],
    ['limit', at('limit') + 0.3, at('deriv') + 2.0],
    ['derivative', at('deriv') + 2.0, endCardAt.start + 0.4],
  ];
  const s = spans.find(([, a, b]) => t >= a && t < b);
  if (!s) return null;
  const [stage, a, b] = s, last = stage === 'neq' || stage === 'derivative';
  return { stage, age: t - a, alpha: (stage === 'neq' || stage === 'climb' ? prog(t, a, 0.4) : 1) * (last ? 1 - prog(t, b - 0.4, 0.4) : 1) };
}

// ---- the figure ---------------------------------------------------------------------------------------------------------
/** The figure dims while the warning is on screen, and goes out for the end card. */
export const figureAlphaAt = (t: number) =>
  (1 - 0.72 * prog(t, at('warn') + 0.5, 0.4) * (1 - prog(t, at('chord') - 0.35, 0.35))) * (1 - prog(t, endCardAt.start - 0.2, 0.5));

/** Every element's progress (0…1) at t: how far it is drawn or how visible. */
export function sceneAt(t: number) {
  const h = hAt(t), wide = clamp01((h - 0.12) / 0.25);           // labels at x + h fade once the gap gets narrow
  const glow = (id: string, d = 0.3, len = 1.4) => prog(t, at(id) + d, 0.3) * (1 - prog(t, at(id) + d + len, 0.5));
  return {
    h,
    axes: prog(t, -0.4, 0.9),                                        // part-drawn at frame 0
    curve: prog(t, 0.6, 3.6),                                       // theirs is drawing by 1 s, done by 5 s
    p: prog(t, at('point') + 0.5, 0.3),
    xLabel: prog(t, at('point') + 1.0, 0.3),
    fx: prog(t, at('fx') + 0.5, 0.4),
    step: prog(t, at('step') + 0.8, 1.0),
    hLabel: prog(t, at('step') + 2.6, 0.3) * clamp01((h - 0.05) / 0.2),
    q: prog(t, at('land') + 0.4, 0.3),
    xhLabel: prog(t, at('land') + 0.6, 0.3) * wide,
    fxh: prog(t, at('fxh') + 1.2, 0.4) * wide,
    rise: prog(t, at('fxh') + 1.4, 0.6),
    chord: prog(t, at('chord') + 0.6, 1.0),
    chordGlow: glow('steep', 0.1) + glow('slope', 1.2) + glow('tangent', 3.4, 1.6),
    riseGlow: glow('rise', 1.2),
    runGlow: glow('run', 0.5),
  };
}

/** The chord through P and Q, run on past both points and kept inside the graph box. */
export function chordEnds(h: number): [[number, number], [number, number]] {
  const m = chordSlope(h), y = (x: number) => F(X0) + m * (x - X0);
  let xa = Math.max(GRAPH.x0, X0 - 1.4), xb = Math.min(GRAPH.x1, X0 + h + 1.5);   // long, as theirs
  if (y(xa) < GRAPH.y0) xa = X0 + (GRAPH.y0 - F(X0)) / m;
  if (y(xb) > GRAPH.y1) xb = X0 + (GRAPH.y1 - F(X0)) / m;
  return [[xa, y(xa)], [xb, y(xb)]];
}

/** The end card (ours): PYQ Vault, the series, the site. */
export const END = { title: 'PYQ Vault', series: 'MATHS, VISUALISED  #5', site: 'pyqvault.com' } as const;
export const endAlphaAt = (t: number) => prog(t, endCardAt.start + 0.2, 0.5);

// ---- sound: the shelf track under the voice, no effects ----------------------------------------------------------------
export const SOUND: Score = { duration: DURATION, hits: [], beds: [] };
