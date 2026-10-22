// @soundmindwithshivani reel #10, "the rain cloud": "It's okay to not be okay."
// A small rain cloud hangs over ME. Signs pop up from the grass (STOP CRYING, BE STRONG, SMILE!…); with each one ME holds
// it in: the rain stops, and the cloud squeezes smaller and darker. Close-up on ME. "Let it rain. Things grow after." ME
// lets it rain; the second wave's signs are washed over, and a flower sprouts for each. Ending: the rain stops, the cloud
// turns white and floats off, a rainbow, the sun, ME smiles, the flowers bloom. Same structure as reels #1–#9
// (soundmind/brand.md → Reels). Pure functions of t (seconds), 1080×1920.
import { clamp01, ease } from './motion.ts';
import { textAlpha as textAlphaFor, zoomAt as zoomFor, labelWidth, MARGIN, SCREEN_W, type TextItem } from './meStory.ts';

export const DURATION = 27;
export const MUSIC = { style: 'calm' as const, chime: 24.2 };

export const HOOK: TextItem = { text: "It's okay to not be okay.", t0: 0, t1: 11 };
export const LINE2: TextItem = { text: 'Let it rain. Things grow after.', t0: 15.8, t1: DURATION };
export const ZOOM = { t0: 11, t1: 15.5, peak: 1.3 };
export const textAlpha = (item: TextItem, t: number) => textAlphaFor(item, t, DURATION);
export const zoomAt = (t: number) => zoomFor(t, ZOOM);

// Scene layout (px): ME sits on the left under her cloud; the signs pop up on the right.
export const ME = { x: 340, headY: 1120, r: 64 };
export const GROUND_Y = 1330;
export const CLOUD = { x: 340, y: 850, w: 320, h: 170 };
export const LET_T = 15.8;                                        // ME lets it rain
export const RAIN_END = 22.6;

export type Sign = { label: string; x: number; y: number; t0: number; washed: boolean };
const SPOTS = [900, 1080];
const fitX = (label: string, x: number) => { const half = labelWidth(label) / 2 + MARGIN; return Math.min(SCREEN_W - half, Math.max(half, x)); };
const wave = (labels: string[], start: number, gap: number, first: number, washed: boolean): Sign[] =>
  labels.map((label, i) => ({ label, x: fitX(label, 770), y: SPOTS[(i + first) % 2], t0: start + i * gap, washed }));
export const SIGNS: Sign[] = [
  ...wave(['STOP CRYING', 'BE STRONG', 'SMILE!', 'OTHERS HAVE IT WORSE', "DON'T BE DRAMATIC"], 0.6, 1.8, 0, false),
  ...wave(["YOU'RE OVERREACTING", 'JUST MOVE ON', 'NOT IN FRONT OF PEOPLE'], 16.4, 1.8, 1, true),
];

// A sign rises out of the grass on its post, stands, then sinks back (first wave) or is washed over by the rain (second).
const RISE = 0.4, UP_1 = 1.6, UP_2 = 1.0, SINK = 0.4, TOPPLE = 0.7;
export type SignState = { x: number; y: number; rot: number; alpha: number; phase: 'wait' | 'rise' | 'up' | 'sink' | 'topple' | 'gone' };
export function signAt(s: Sign, t: number): SignState {
  const low = GROUND_Y + 60, up = s.washed ? UP_2 : UP_1, d = t - s.t0;
  const at = (y: number, rot: number, alpha: number, phase: SignState['phase']) => ({ x: s.x, y, rot, alpha, phase });
  if (d < 0) return at(low, 0, 0, 'wait');
  if (d < RISE) return at(low + (s.y - low) * ease(d / RISE), 0, 1, 'rise');
  if (d < RISE + up) return at(s.y + 4 * Math.sin(d * 10) * Math.exp(-(d - RISE) * 4), 0, 1, 'up');
  const e = d - RISE - up;
  if (!s.washed && e < SINK) return at(s.y + (low - s.y) * ease(e / SINK), 0, 1, 'sink');
  if (s.washed && e < TOPPLE) { const u = ease(e / TOPPLE); return at(s.y + 70 * u, 75 * u, 1 - u, 'topple'); }
  return at(low, s.washed ? 75 : 0, 0, 'gone');
}
const upAt = (s: Sign) => s.t0 + RISE;

// The cloud: each first-wave sign squeezes it smaller and darker (ME holding it in); let go, it swells and rains; at the
// ending it turns white, floats up and fades.
const heldAt = (t: number) => SIGNS.filter(s => !s.washed).reduce((n, s) => n + ease(clamp01((t - upAt(s)) / 0.3)), 0);
export function cloudAt(t: number) {
  const n = heldAt(Math.min(t, LET_T)), squeezed = 1 - 0.09 * n, darkHeld = 0.12 * n;
  const r = ease(clamp01((t - LET_T) / 0.6)), white = ease(clamp01((t - 22.8) / 1.0));
  return {
    scale: squeezed + (1.1 - squeezed) * r,
    dark: (darkHeld + (0.45 - darkHeld) * r) * (1 - white),
    y: CLOUD.y + 6 * Math.sin(t * 1.5) - 220 * ease(clamp01((t - 23.2) / 1.6)),
    alpha: 1 - ease(clamp01((t - 23.6) / 1.2)),
  };
}
/** Rain (0 … 1): a little at the start, held in sign by sign, then let go until the ending. */
export function rainAt(t: number) {
  if (t < LET_T) return Math.max(0, 0.6 - 0.15 * heldAt(t));
  return ease(clamp01((t - LET_T) / 0.5)) * (1 - ease(clamp01((t - RAIN_END) / 0.8)));
}

// Flowers in the grass: one for each washed-over sign, the rest at the ending.
export type Sprout = { x: number; t0: number };
export const SPROUTS: Sprout[] = [
  ...SIGNS.filter(s => s.washed).map((s, i) => ({ x: [150, 560, 930][i], t0: upAt(s) + UP_2 })),
  ...[250, 470, 700, 820].map((x, k) => ({ x, t0: 23.4 + 0.2 * k })),
];
export const sproutAt = (f: Sprout, t: number) => ease(clamp01((t - f.t0) / 0.7));
export const bloomAt = (t: number) => ease(clamp01((t - 24.0) / 1.4));
export const rainbowAt = (t: number) => ease(clamp01((t - 23.0) / 2.0));
export const sunAt = (t: number) => ease(clamp01((t - 22.8) / 2.8));
export const smileAt = (t: number) => ease(clamp01((t - 23.6) / 1.2));
