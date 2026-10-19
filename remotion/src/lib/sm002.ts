// @soundmindwithshivani reel #2, "the window": "Not every thought deserves an answer tonight."
// ME sits on a floor cushion with a cup of tea beside a closed window. Thoughts (WHAT IF?, DID I SAY IT WRONG?,
// 3 AM WORRIES…) fly up to the glass from outside, thump against it, slide down and fade. Same structure as reel #1
// (soundmind/brand.md → Reels): message at frame 0 → first wave → close-up (she sips her tea) → second wave with a
// second line → night falls, the moon comes out, ME falls asleep smiling. Pure functions of t (seconds), 1080×1920.
import { clamp01, ease } from './motion.ts';
import { textAlpha as textAlphaFor, zoomAt as zoomFor, labelWidth, type TextItem } from './meStory.ts';

export const DURATION = 26;
export const MUSIC = { style: 'calm' as const, chime: 23.0 };

export const HOOK: TextItem = { text: 'Not every thought deserves an answer tonight.', t0: 0, t1: 11 };
export const LINE2: TextItem = { text: 'Close the window. Let them knock. You can rest.', t0: 15.8, t1: DURATION };
export const ZOOM = { t0: 11, t1: 15.5, peak: 1.35 };
export const textAlpha = (item: TextItem, t: number) => textAlphaFor(item, t, DURATION);
export const zoomAt = (t: number) => zoomFor(t, ZOOM);

// Scene layout (px): the window pane on the right, ME on a cushion on the left, the floor from FLOOR_Y.
export const GLASS = { x: 460, y: 570, w: 500, h: 580 };
export const ME = { x: 250, headY: 1120, r: 64 };
export const FLOOR_Y = 1330;

export type Thought = { label: string; x: number; y: number; t0: number };
const CX = GLASS.x + GLASS.w / 2, SQUASH_X = 0.06, SQUASH_Y = 0.1, EDGE = 4;
// Keep every thought, even when squashed against the glass, inside the pane.
const fitX = (label: string, x: number) => {
  const half = (labelWidth(label) * (1 + SQUASH_X)) / 2 + EDGE;
  return Math.min(GLASS.x + GLASS.w - half, Math.max(GLASS.x + half, x));
};
// Four rows down the pane, used in turn: a row is free again before the next thought lands in it, and a thought only
// slides a short way down its row, so two thoughts on the glass never overlap.
const ROWS = [680, 805, 930, 1055];
const wave = (labels: string[], start: number, gap: number): Thought[] =>
  labels.map((label, i) => ({ label, x: fitX(label, CX + (i % 2 ? 40 : -40)), y: ROWS[i % ROWS.length], t0: start + i * gap }));
export const THOUGHTS: Thought[] = [
  ...wave(['WHAT IF?', 'DID I SAY IT WRONG?', 'REPLAY THAT CHAT', 'WHAT WILL THEY THINK?', '3 AM WORRIES', 'ARE THEY UPSET?',
    "TOMORROW'S TO-DO", 'WHY DID I SAY THAT?', 'CHECK THE PHONE'], 1.2, 1.05),
  ...wave(['WHAT IF THEY LEAVE?', 'I SHOULD HAVE…', 'EVERYONE IS AHEAD', 'WHAT IF I FAIL?', 'ONE MORE SCROLL', 'NOT GOOD ENOUGH',
    'WHAT IF?', 'REPLAY IT AGAIN'], 16.0, 0.7),
];

const APPROACH = 0.9, HIT = 0.25, SLIDE = 1.6, FADE = 0.6, FAR = 0.35, SLIDE_DY = 45;
export type ThoughtState = { x: number; y: number; scale: number; sx: number; sy: number; alpha: number; phase: 'wait' | 'approach' | 'hit' | 'slide' | 'gone' };

export function thoughtAt(th: Thought, t: number): ThoughtState {
  const x0 = CX + (th.x - CX) * 0.4, y0 = th.y - 80;
  if (t < th.t0) return { x: x0, y: y0, scale: FAR, sx: 1, sy: 1, alpha: 0, phase: 'wait' };
  const s = t - th.t0;
  if (s < APPROACH) {
    const u = (s / APPROACH) ** 2;                                  // speeding up towards the glass
    return { x: x0 + (th.x - x0) * u, y: y0 + (th.y - y0) * u, scale: FAR + (1 - FAR) * u, sx: 1, sy: 1, alpha: clamp01(s / 0.2), phase: 'approach' };
  }
  if (s < APPROACH + HIT) {
    const k = Math.sin((Math.PI * (s - APPROACH)) / HIT);           // the thump: squashed flat against the pane
    return { x: th.x, y: th.y, scale: 1, sx: 1 + SQUASH_X * k, sy: 1 - SQUASH_Y * k, alpha: 1, phase: 'hit' };
  }
  if (s < APPROACH + HIT + SLIDE) {
    const u = (s - APPROACH - HIT) / SLIDE;
    return { x: th.x, y: th.y + SLIDE_DY * u * u, scale: 1, sx: 1, sy: 1, alpha: 1 - clamp01((u * SLIDE - (SLIDE - FADE)) / FADE), phase: 'slide' };
  }
  return { x: th.x, y: th.y + SLIDE_DY, scale: 1, sx: 1, sy: 1, alpha: 0, phase: 'gone' };
}

/** She lifts the cup to her lips during the close-up, holds it, and lowers it again. */
export function sipAt(t: number) {
  if (t < 11.6 || t > 14.9) return 0;
  if (t < 12.8) return ease((t - 11.6) / 1.2);
  if (t < 13.8) return 1;
  return 1 - ease((t - 13.8) / 1.1);
}

export const nightAt = (t: number) => ease(clamp01((t - 22.5) / 2.7));
export const sleepAt = (t: number) => ease(clamp01((t - 23.2) / 1.4));
export const smileAt = (t: number) => 0.75 * ease(clamp01((t - 23.6) / 1.2));
