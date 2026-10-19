// @soundmindwithshivani reel #1: "Not everything that falls on you is yours to carry."
// A calm ME sits under an umbrella while word-drops (SHOULD, GUILT, WHAT WILL PEOPLE SAY?…) fall from a cloud,
// land on the canopy, roll off its edge and fade on the grass. Structure taken from the 45K "protect your peace"
// reel (@silvabydebalina, studied 2026-10-19): message on screen at frame 0 → first wave → close-up → second wave
// with a second line → the cloud leaves, the sun comes out, ME smiles. Pure functions of t (seconds), 1080×1920.
import { clamp01, ease } from './motion.ts';
import { textAlpha as textAlphaFor, zoomAt as zoomFor, LABEL_H, labelWidth, SCREEN_W, MARGIN, type TextItem } from './meStory.ts';

export { SAFE, TEXT_BOXES, LABEL_H, labelWidth, type TextItem } from './meStory.ts';

export const DURATION = 26;
export const MUSIC = { style: 'calm' as const, chime: 22.8 };

export const HOOK: TextItem = { text: 'Not everything that falls on you is yours to carry.', t0: 0, t1: 11 };
export const LINE2: TextItem = { text: 'Stay under your umbrella. Let the rest roll off.', t0: 15.8, t1: DURATION };
export const ZOOM = { t0: 11, t1: 15.5, peak: 1.35 };

// Scene layout (px). The canopy is the top half of an ellipse; ME sits under it, left of the shaft.
export const UMBRELLA = { cx: 580, cy: 1000, rx: 310, ry: 200 };
export const ME = { x: 510, headY: 1120, r: 64 };
export const GROUND_Y = 1330;
export const CLOUD_Y = 590;
const SPAWN_Y = 650;

export type Drop = { label: string; x: number; t0: number };
const wave = (labels: string[], offsets: number[], start: number, gap: number): Drop[] =>
  labels.map((label, i) => ({ label, x: UMBRELLA.cx + offsets[i % offsets.length], t0: start + i * gap }));
export const DROPS: Drop[] = [
  ...wave(['SHOULD', 'GUILT', 'WHAT WILL PEOPLE SAY?', 'COMPARISON', 'NOT ENOUGH', 'BE PERFECT', 'TOO SENSITIVE', 'SHOULD', 'HURRY UP'],
    [-150, 120, -30, 170, -190, 60, -110, 200, -20], 1.2, 1.05),
  ...wave(['OVERTHINKING', 'PLEASE EVERYONE', 'WHAT IF?', 'BY NOW YOU SHOULD…', 'TOO MUCH', 'SAY YES', 'NOT GOOD ENOUGH', 'GUILT'],
    [140, -170, 40, -60, 190, 160, -200, -120], 16.0, 0.7),
];

/** The canopy's top at x (its rim height outside it). */
export function surfaceY(x: number) {
  const { cx, cy, rx, ry } = UMBRELLA, u = (x - cx) / rx;
  return Math.abs(u) >= 1 ? cy : cy - ry * Math.sqrt(1 - u * u);
}
function slope(x: number) {
  const { cx, rx, ry } = UMBRELLA, u = Math.max(-0.97, Math.min(0.97, (x - cx) / rx));
  return (ry * u) / (rx * Math.sqrt(1 - u * u));
}

const G_FALL = 900, G_DROP = 2400, SLIDE = 0.9, REST = 0.4, FADE = 0.7, DRIFT = 80;
export type DropState = { x: number; y: number; rot: number; alpha: number; phase: 'wait' | 'fall' | 'slide' | 'drop' | 'gone' };

export function dropAt(d: Drop, t: number): DropState {
  const { cx, cy, rx } = UMBRELLA, side = d.x >= cx ? 1 : -1;
  const startY = SPAWN_Y + LABEL_H / 2;
  if (t < d.t0) return { x: d.x, y: startY, rot: 0, alpha: 0, phase: 'wait' };
  const landY = surfaceY(d.x) - LABEL_H / 2;
  const tHit = d.t0 + Math.sqrt((2 * (landY - startY)) / G_FALL);
  if (t < tHit) {
    const s = t - d.t0;
    return { x: d.x, y: startY + 0.5 * G_FALL * s * s, rot: 0.06 * Math.sin(s * 9), alpha: clamp01(s / 0.15), phase: 'fall' };
  }
  const rimX = cx + side * (rx + 10);
  if (t < tHit + SLIDE) {
    const s = t - tHit, u = ease(s / SLIDE), x = d.x + (rimX - d.x) * u;
    const bounce = s < 0.3 ? 26 * Math.sin((Math.PI * s) / 0.3) : 0;
    return { x, y: surfaceY(x) - LABEL_H / 2 - bounce, rot: Math.atan(slope(x)) * 0.6, alpha: 1, phase: 'slide' };
  }
  // It drifts outwards as it falls, but never so far that the label leaves the screen.
  const half = labelWidth(d.label) / 2;
  const landX = side > 0 ? Math.max(rimX, Math.min(rimX + DRIFT, SCREEN_W - MARGIN - half)) : Math.min(rimX, Math.max(rimX - DRIFT, MARGIN + half));
  const t2 = tHit + SLIDE, y0 = cy - LABEL_H / 2, y1 = GROUND_Y - LABEL_H / 2 + 10;
  const fallTime = Math.sqrt((2 * (y1 - y0)) / G_DROP), s = t - t2;
  if (s < fallTime + REST + FADE) {
    const k = Math.min(1, s / fallTime);
    const y = s < fallTime ? y0 + 0.5 * G_DROP * s * s : y1;
    const alpha = 1 - clamp01((s - fallTime - REST) / FADE);
    return { x: rimX + (landX - rimX) * k, y, rot: side * 0.35 * (1 - k), alpha, phase: 'drop' };
  }
  return { x: landX, y: y1, rot: 0, alpha: 0, phase: 'gone' };
}

export const textAlpha = (item: TextItem, t: number) => textAlphaFor(item, t, DURATION);
export const zoomAt = (t: number) => zoomFor(t, ZOOM);

export const sunAt = (t: number) => ease(clamp01((t - 22.5) / 2.7));
export const smileAt = (t: number) => ease(clamp01((t - 23.2) / 1.2));
export const plantAt = (t: number) => ease(clamp01((t - 23.6) / 1.8));

/** The cloud sways over the umbrella, then drifts off to the right at the end. */
export function cloudX(t: number) {
  const sway = UMBRELLA.cx + 20 * Math.sin(t * 0.6);
  return t < 22 ? sway : sway + 1100 * ease(clamp01((t - 22) / 2.5));
}
