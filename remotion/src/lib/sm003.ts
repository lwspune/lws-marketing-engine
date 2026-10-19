// @soundmindwithshivani reel #3, "my own plant": "Other people's opinions are not instructions."
// ME sits watering her own plant while crows fly in carrying remarks (WHEN IS THE WEDDING?, AT YOUR AGE?…). Each crow
// circles once; ignored, it gives up and flies off, and the plant grows a little. Same structure as reels #1 and #2
// (soundmind/brand.md → Reels): message at frame 0 → first wave → close-up → second wave with a second line → the sun
// comes out, the plant blooms, ME smiles. Pure functions of t (seconds), 1080×1920.
import { clamp01, ease } from './motion.ts';
import { textAlpha as textAlphaFor, zoomAt as zoomFor, labelWidth, MARGIN, SCREEN_W, type TextItem } from './meStory.ts';

export const DURATION = 26;
export const MUSIC = { style: 'lofi' as const, chime: 23.0 };

export const HOOK: TextItem = { text: "Other people's opinions are not instructions.", t0: 0, t1: 11 };
export const LINE2: TextItem = { text: "Keep watering what's yours. Let them circle.", t0: 15.8, t1: DURATION };
export const ZOOM = { t0: 11, t1: 15.5, peak: 1.3 };
export const textAlpha = (item: TextItem, t: number) => textAlphaFor(item, t, DURATION);
export const zoomAt = (t: number) => zoomFor(t, ZOOM);

// Scene layout (px). ME sits on the left, her plant (a big pot) on the right; SHIELD covers both.
export const ME = { x: 400, headY: 1120, r: 64 };
export const GROUND_Y = 1330;
export const PLANT = { x: 720, y: GROUND_Y + 4, potScale: 1.6 };
export const SHIELD = { x: 250, y: 960, w: 620, h: 370 };

// A crow's body box, and where its remark-banner hangs below it.
export const CROW = { w: 110, h: 70 };
export const BANNER_DY = 82;
// Two rows far enough apart that a crow in one never touches a remark in the other.
const R = 45, ROWS = [560, 812];

export type Crow = { label: string; side: -1 | 1; hx: number; hy: number; t0: number };
// A circling banner stays fully on screen: its centre keeps half its width (plus the loop) from each edge.
const fitX = (label: string, x: number) => {
  const half = labelWidth(label) / 2 + R + MARGIN;
  return Math.min(SCREEN_W - half, Math.max(half, x));
};
const wave = (labels: string[], start: number, gap: number, first: number): Crow[] =>
  labels.map((label, i) => {
    // Rows alternate every crow; sides every two, so the next crow in a row comes from (and circles on) the other side.
    const k = i + first, side: -1 | 1 = Math.floor(k / 2) % 2 === 0 ? -1 : 1;
    return { label, side, hx: fitX(label, side < 0 ? 340 : 740), hy: ROWS[k % 2], t0: start + i * gap };
  });
export const CROWS: Crow[] = [
  ...wave(['WHEN IS THE WEDDING?', 'AT YOUR AGE?', 'GET A REAL JOB', "YOU'VE CHANGED", 'TOO THIN? TOO FAT?', 'BE PRACTICAL'], 0.6, 1.6, 0),
  ...wave(['SETTLE DOWN', 'NOT FOR GIRLS', 'WHO WILL MARRY YOU?', "YOU'RE TOO SENSITIVE", 'LOWER YOUR DREAMS'], 16.0, 1.2, 1),
];

const ENTER = 1.0, CIRCLE = 1.8, LEAVE = 1.1;
export type CrowState = { x: number; y: number; flap: number; phase: 'wait' | 'enter' | 'circle' | 'leave' | 'gone' };

export function crowAt(c: Crow, t: number): CrowState {
  // It gives up and flies back out the way it came, never across the other crows.
  const startX = c.side < 0 ? -120 : SCREEN_W + 120, endX = c.side < 0 ? -170 : SCREEN_W + 170;
  const flap = Math.sin(t * 14 + c.t0 * 3);
  if (t < c.t0) return { x: startX, y: c.hy, flap, phase: 'wait' };
  const s = t - c.t0, loopX = c.hx + R;
  if (s < ENTER) {
    const u = ease(s / ENTER);
    return { x: startX + (loopX - startX) * u, y: c.hy, flap, phase: 'enter' };
  }
  if (s < ENTER + CIRCLE) {
    const a = (2 * Math.PI * (s - ENTER)) / CIRCLE;                // one flattened loop over its spot
    return { x: c.hx + R * Math.cos(a), y: c.hy + R * 0.6 * Math.sin(a), flap, phase: 'circle' };
  }
  if (s < ENTER + CIRCLE + LEAVE) {
    const u = ((s - ENTER - CIRCLE) / LEAVE) ** 2;                  // gives up, then speeds away
    return { x: loopX + (endX - loopX) * u, y: c.hy - 20 * u, flap, phase: 'leave' };
  }
  return { x: endX, y: c.hy - 20, flap, phase: 'gone' };
}

/** The plant's size: it grows a step each time a crow gives up, and never shrinks. */
export function growthAt(t: number) {
  return 0.55 + CROWS.reduce((g, c) => g + 0.06 * ease(clamp01((t - (c.t0 + ENTER + CIRCLE)) / 0.6)), 0);
}
export const bloomAt = (t: number) => ease(clamp01((t - 22.8) / 1.6));
export const sunAt = (t: number) => ease(clamp01((t - 22.5) / 2.7));
export const smileAt = (t: number) => ease(clamp01((t - 23.2) / 1.2));
/** Water pours from the can in short bursts: 0 → 1 through each 1.4 s pour. */
export const pourAt = (t: number) => (t % 2.4) / 1.4;
