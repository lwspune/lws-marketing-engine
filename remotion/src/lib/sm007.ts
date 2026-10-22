// @soundmindwithshivani reel #7, "the glitter jar": "Calm can't be forced. It settles."
// ME holds a jar of glitter water. Pressures (CALM DOWN!, JUST RELAX…) slam in and each one shakes the jar: the glitter
// whirls. Close-up on calm ME. "Put it down. Let it settle." ME sets the jar on the grass; a second wave arrives but can't
// shake it, and the glitter sinks. Ending: clear water, the glitter at the bottom, a flower grows, the sun comes out, ME
// smiles. Same structure as reels #1–#6 (soundmind/brand.md → Reels). Pure functions of t (seconds), 1080×1920.
import { clamp01, ease } from './motion.ts';
import { textAlpha as textAlphaFor, zoomAt as zoomFor, labelWidth, MARGIN, SCREEN_W, type TextItem } from './meStory.ts';

export const DURATION = 27;
export const MUSIC = { style: 'calm' as const, chime: 24.2 };

// A non-breaking space keeps "It settles." together on the hook's second line.
export const HOOK: TextItem = { text: "Calm can't be forced. It\u00A0settles.", t0: 0, t1: 11 };
export const LINE2: TextItem = { text: 'Put it down. Let it settle.', t0: 15.8, t1: DURATION };
export const ZOOM = { t0: 11, t1: 15.5, peak: 1.3 };
export const textAlpha = (item: TextItem, t: number) => textAlphaFor(item, t, DURATION);
export const zoomAt = (t: number) => zoomFor(t, ZOOM);

// Scene layout (px): ME sits on the left holding the jar out to her right; later it stands on the grass beside her.
export const ME = { x: 330, headY: 1120, r: 64 };
export const GROUND_Y = 1330;
export const JAR = { w: 180, h: 230 };
const HELD = { x: 590, y: 1090 }, DOWN = { x: 650, y: GROUND_Y - JAR.h / 2 };
export const DOWN_T = 15.6;                                        // ME starts to put the jar down
const MOVE = 0.9;
export const PLANT = { x: 860, y: GROUND_Y + 4 };

/** The jar's centre: held, then lifted a little and set down on the grass. */
export function jarAt(t: number) {
  const u = ease(clamp01((t - DOWN_T) / MOVE));
  return { x: HELD.x + (DOWN.x - HELD.x) * u, y: HELD.y + (DOWN.y - HELD.y) * u - 40 * Math.sin(Math.PI * u) };
}

export type Pressure = { label: string; side: -1 | 1; hx: number; hy: number; t0: number };
const ROWS = [700, 840];
const fitX = (label: string, x: number) => {
  const half = labelWidth(label) / 2 + MARGIN;
  return Math.min(SCREEN_W - half, Math.max(half, x));
};
const wave = (labels: string[], start: number, gap: number, first: number): Pressure[] =>
  labels.map((label, i) => {
    const k = i + first, side: -1 | 1 = Math.floor(k / 2) % 2 === 0 ? -1 : 1;
    return { label, side, hx: fitX(label, side < 0 ? 360 : 720), hy: ROWS[k % 2], t0: start + i * gap };
  });
export const PRESSURES: Pressure[] = [
  ...wave(['CALM DOWN!', 'JUST RELAX', 'STOP OVERTHINKING', 'WHY ARE YOU LIKE THIS?', 'HURRY UP'], 0.5, 1.8, 0),
  ...wave(['FIX IT NOW', 'BE OKAY ALREADY', 'GET OVER IT'], 17.0, 1.8, 1),
];

// A pressure slams in from its side (and, in the first wave, its arrival shakes the jar), shouts, then shrinks away.
const ENTER = 0.4, SHOUT = 1.4, FADE = 0.5;
export type PressureState = { x: number; y: number; alpha: number; scale: number; phase: 'wait' | 'enter' | 'shout' | 'fade' | 'gone' };
export const hitAt = (p: Pressure) => p.t0 + ENTER;

export function pressureAt(p: Pressure, t: number): PressureState {
  const startX = p.side < 0 ? -labelWidth(p.label) / 2 - 40 : SCREEN_W + labelWidth(p.label) / 2 + 40;
  if (t < p.t0) return { x: startX, y: p.hy, alpha: 0, scale: 1, phase: 'wait' };
  const s = t - p.t0;
  if (s < ENTER) { const u = (s / ENTER) ** 2; return { x: startX + (p.hx - startX) * u, y: p.hy, alpha: 1, scale: 1, phase: 'enter' }; }
  if (s < ENTER + SHOUT) return { x: p.hx, y: p.hy, alpha: 1, scale: 1 + 0.06 * Math.exp(-(s - ENTER) * 6), phase: 'shout' };
  if (s < ENTER + SHOUT + FADE) { const u = (s - ENTER - SHOUT) / FADE; return { x: p.hx, y: p.hy, alpha: 1 - u, scale: 1 - 0.4 * u, phase: 'fade' }; }
  return { x: p.hx, y: p.hy, alpha: 0, scale: 0.6, phase: 'gone' };
}

const HITS = PRESSURES.filter(p => p.t0 < DOWN_T).map(hitAt);
/** The jar's tilt (degrees): a short, dying wobble after each hit of the first wave. */
export const shakeAt = (t: number) =>
  HITS.reduce((a, h) => { const s = t - h; return s < 0 || s > 1 ? a : a + 9 * Math.sin(s * 40) * Math.exp(-s / 0.22); }, 0);

// How stirred the glitter is (0 settled … 1 whirling): stirred at the start, more with each hit, then, once the jar is
// down, sinking slowly to nothing.
const SETTLE = 7.4;
const stirred = (t: number) => clamp01(0.6 + HITS.reduce((a, h) => a + 0.3 * ease(clamp01((t - h) / 0.2)), 0));
export function agitationAt(t: number) {
  if (t < DOWN_T) return stirred(t);
  return stirred(DOWN_T) * (1 - ease(clamp01((t - DOWN_T) / SETTLE)));
}

// Glitter: each speck has a resting place in a heap at the bottom and an orbit in the water; the stirring blends them.
// Offsets are from the jar's centre (px); the water fills it below the lid.
const IN = { x: JAR.w / 2 - 18, top: -JAR.h / 2 + 40, bottom: JAR.h / 2 - 14 };
export const inJar = (p: { x: number; y: number }) => Math.abs(p.x) <= IN.x + 1e-6 && p.y >= IN.top - 1e-6 && p.y <= IN.bottom + 1e-6;
const rand = (i: number, k: number) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
export type Speck = { sx: number; sy: number; r: number; phase: number; speed: number; colour: number; size: number };
export const GLITTER: Speck[] = Array.from({ length: 64 }, (_, i) => {
  const sx = (rand(i, 1) * 2 - 1) * 66;
  return {
    sx, sy: IN.bottom - 4 - 26 * rand(i, 2) * (1 - (sx / 72) ** 2), r: 18 + 46 * rand(i, 3), phase: 2 * Math.PI * rand(i, 4),
    speed: (1.2 + 1.6 * rand(i, 5)) * (i % 2 ? 1 : -1), colour: i % 4, size: 9 + 6 * rand(i, 6),
  };
});
export function glitterAt(g: Speck, t: number) {
  const a = agitationAt(t), ang = g.phase + g.speed * t;
  const ox = g.r * Math.cos(ang), oy = -10 + 0.9 * g.r * Math.sin(ang);
  return { x: g.sx + (ox - g.sx) * a, y: g.sy + (oy - g.sy) * a };
}

const SETTLED_T = DOWN_T + SETTLE;
export const sunAt = (t: number) => ease(clamp01((t - SETTLED_T) / 2.8));
export const smileAt = (t: number) => ease(clamp01((t - SETTLED_T - 0.6) / 1.2));
export const bloomAt = (t: number) => ease(clamp01((t - SETTLED_T - 1.0) / 1.4));
/** Calm breaths: rings that open out from ME once the jar is down. */
export const breathAt = (t: number) => (t < DOWN_T + MOVE ? -1 : ((t - DOWN_T - MOVE) % 2.5) / 2.5);
