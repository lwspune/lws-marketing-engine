// @soundmindwithshivani reel #9, "the kite": "You don't have to have it all figured out."
// ME flies a kite. Storm clouds carrying questions (WHAT'S YOUR PLAN?, BY 30 YOU SHOULD…) roll in and gust at it, and the
// kite jerks about on its tight string. Close-up on ME. "Hold the string loosely. Let the wind help." ME lets the string
// out; the second wave barely moves the kite, which starts to climb. Ending: the clouds have gone, the kite soars high in
// the sun, ME smiles, the plant blooms. Same structure as reels #1–#8 (soundmind/brand.md → Reels). Pure functions of t
// (seconds), 1080×1920.
import { clamp01, ease } from './motion.ts';
import { textAlpha as textAlphaFor, zoomAt as zoomFor, labelWidth, MARGIN, SCREEN_W, type TextItem } from './meStory.ts';

export const DURATION = 27;
export const MUSIC = { style: 'calm' as const, chime: 24.2 };

export const HOOK: TextItem = { text: "You don't have to have it all figured out.", t0: 0, t1: 11 };
// Non-breaking spaces keep "Let the wind help." together on the card's second line.
export const LINE2: TextItem = { text: 'Hold the string loosely. Let\u00A0the\u00A0wind\u00A0help.', t0: 15.8, t1: DURATION };
export const ZOOM = { t0: 11, t1: 15.5, peak: 1.3 };
export const textAlpha = (item: TextItem, t: number) => textAlphaFor(item, t, DURATION);
export const zoomAt = (t: number) => zoomFor(t, ZOOM);

// Scene layout (px): ME sits on the left holding the string up; the kite flies on the right.
export const ME = { x: 300, headY: 1120, r: 64 };
export const GROUND_Y = 1330;
export const HAND = { x: 420, y: 1150 };
export const KITE = { w: 120, h: 160 };
export const PLANT = { x: 860, y: GROUND_Y + 4 };

// Clouds: the upper row drifts in from the right, the lower row from the left (clear of the kite on the right).
export type Cloud = { label: string; side: -1 | 1; hx: number; hy: number; t0: number };
const ROW = { upper: 600, lower: 900 }, CLOUD_PAD = 70, CLOUD_H = 120;
export const cloudWidth = (label: string) => labelWidth(label) + CLOUD_PAD;
const fitX = (label: string, x: number) => { const half = cloudWidth(label) / 2 + MARGIN; return Math.min(SCREEN_W - half, Math.max(half, x)); };
const wave = (labels: string[], start: number, gap: number, first: number): Cloud[] =>
  labels.map((label, i) => {
    const upper = (i + first) % 2 === 0;
    return { label, side: upper ? 1 : -1, hx: fitX(label, upper ? 700 : 300), hy: upper ? ROW.upper : ROW.lower, t0: start + i * gap };
  });
export const CLOUDS: Cloud[] = [
  ...wave(["WHAT'S YOUR PLAN?", 'BY 30 YOU SHOULD…', 'WHAT IF IT FAILS?', 'SETTLE DOWN', 'EVERYONE ELSE KNOWS'], 0.5, 1.8, 0),
  ...wave(['SO WHAT NOW?', 'STILL NOT SURE?', 'TIME IS RUNNING OUT'], 16.2, 1.8, 1),
];

// A cloud drifts in from its side, gusts at the kite, then drifts back out the way it came.
const ENTER = 0.9, GUST = 1.2, LEAVE = 0.9;
export type CloudState = { x: number; y: number; gust: number; phase: 'wait' | 'enter' | 'gust' | 'leave' | 'gone' };
export function cloudAt(c: Cloud, t: number): CloudState {
  const off = c.side > 0 ? SCREEN_W + cloudWidth(c.label) / 2 + 30 : -cloudWidth(c.label) / 2 - 30, s = t - c.t0;
  if (s < 0) return { x: off, y: c.hy, gust: 0, phase: 'wait' };
  if (s < ENTER) return { x: off + (c.hx - off) * ease(s / ENTER), y: c.hy, gust: 0, phase: 'enter' };
  if (s < ENTER + GUST) { const g = s - ENTER; return { x: c.hx, y: c.hy + 6 * Math.sin(g * 8), gust: Math.sin((Math.PI * g) / GUST), phase: 'gust' }; }
  if (s < ENTER + GUST + LEAVE) return { x: c.hx + (off - c.hx) * ease((s - ENTER - GUST) / LEAVE), y: c.hy, gust: 0, phase: 'leave' };
  return { x: off, y: c.hy, gust: 0, phase: 'gone' };
}
export const cloudBox = (c: Cloud, s: CloudState) =>
  ({ x0: s.x - cloudWidth(c.label) / 2, y0: s.y - CLOUD_H / 2, x1: s.x + cloudWidth(c.label) / 2, y1: s.y + CLOUD_H / 2 });

// The string: tight while the first wave gusts, let out (sagging) from LOOSE_T.
export const LOOSE_T = 15.8;
const loose = (t: number) => ease(clamp01((t - LOOSE_T) / 0.8));
export const sagAt = (t: number) => 20 + 80 * loose(t);

/** The kite's centre and tilt: where it flies, pushed by each gust (much less once the string is loose), always swaying. */
export function kiteAt(t: number) {
  const r1 = ease(clamp01((t - LOOSE_T) / 7)), r2 = ease(clamp01((t - 22.8) / 2.4));
  const bx = 760 + 10 * r1 + 30 * r2, by = 800 - 80 * r1 - 160 * r2;
  const strength = 1 - 0.88 * loose(t);
  const push = CLOUDS.reduce((p, c) => p - c.side * cloudAt(c, t).gust, 0) * strength;
  return {
    x: bx + 60 * push + 20 * push * Math.sin(t * 9),
    y: by + 30 * Math.abs(push) + 8 * Math.sin(t * 1.3),
    rot: 25 * push + 3 * Math.sin(t * 1.7),
  };
}

export const sunAt = (t: number) => ease(clamp01((t - 22.8) / 2.8));
export const smileAt = (t: number) => ease(clamp01((t - 23.6) / 1.2));
export const bloomAt = (t: number) => ease(clamp01((t - 24.0) / 1.4));
