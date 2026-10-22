// @soundmindwithshivani reel #5, "the hammock": "You don't have to earn your rest."
// ME sleeps in a hammock between two trees, under a low, red battery. Pressures (ONE MORE TASK, LAZY?, GUILT…) arrive on
// ropes tied to the hammock and tug at it; ME keeps resting, each one gives up and floats away, and the battery charges a
// step. Close-up on sleeping ME. "Rest isn't a reward. It's a need." A second wave gives up too. Ending: the battery is
// full and green, the sun comes out, ME wakes and smiles, the plant by the tree blooms. Same structure as reels #1–#4
// (soundmind/brand.md → Reels). Pure functions of t (seconds), 1080×1920.
import { clamp01, ease } from './motion.ts';
import { textAlpha as textAlphaFor, zoomAt as zoomFor, labelWidth, MARGIN, SCREEN_W, type TextItem } from './meStory.ts';

export const DURATION = 27;
export const MUSIC = { style: 'calm' as const, chime: 24.2 };

export const HOOK: TextItem = { text: "You don't have to earn your rest.", t0: 0, t1: 11 };
// Non-breaking spaces keep "It's a need." together on the card's second line.
export const LINE2: TextItem = { text: "Rest isn't a reward. It's\u00A0a\u00A0need.", t0: 15.8, t1: DURATION };
export const ZOOM = { t0: 11, t1: 15.5, peak: 1.3 };
export const textAlpha = (item: TextItem, t: number) => textAlphaFor(item, t, DURATION);
export const zoomAt = (t: number) => zoomFor(t, ZOOM);

// Scene layout (px): two trees, the hammock slung between them, ME lying in it; the battery floats above.
export const GROUND_Y = 1330;
export const TREES = [110, 970];
export const ANCHORS = { left: { x: 150, y: 1000 }, right: { x: 930, y: 1000 } };
export const HAMMOCK = { x0: 270, x1: 810, y: 1060, sag: 130 };       // the cloth's ends and how far its middle hangs
export const ME = { x: 330, headY: 1048, r: 58 };                       // her head, on the hammock's left end
export const BATTERY = { x: 440, y: 545, w: 200, h: 100 };
export const PLANT = { x: 860, y: GROUND_Y + 4 };
/** Where a pressure's rope is tied: the hammock's rim, on the pressure's side. */
export const ropeTo = (side: -1 | 1) => ({ x: side < 0 ? 430 : 700, y: HAMMOCK.y + 10 });

export type Pressure = { label: string; side: -1 | 1; hx: number; hy: number; t0: number };
const ROWS = [730, 880], PULL = 30;
// A tugging label stays fully on screen: its centre keeps half its width (plus the pull) from each edge.
const fitX = (label: string, x: number) => {
  const half = labelWidth(label) / 2 + MARGIN + PULL;
  return Math.min(SCREEN_W - half, Math.max(half, x));
};
const wave = (labels: string[], start: number, gap: number, first: number): Pressure[] =>
  labels.map((label, i) => {
    // Rows alternate every pressure; sides every two, so neighbours come from different corners.
    const k = i + first, side: -1 | 1 = Math.floor(k / 2) % 2 === 0 ? -1 : 1;
    return { label, side, hx: fitX(label, side < 0 ? 330 : 750), hy: ROWS[k % 2], t0: start + i * gap };
  });
export const PRESSURES: Pressure[] = [
  ...wave(['ONE MORE TASK', 'YOU SHOULD BE DOING SOMETHING', 'LAZY?', 'DISHES ARE WAITING', 'GUILT'], 0.6, 1.85, 0),
  ...wave(['NOT YET', "YOU HAVEN'T EARNED IT", 'EVERYONE ELSE IS WORKING'], 16.0, 1.8, 1),
];

const ENTER = 0.8, TUG = 1.4, LEAVE = 1.0;
export type PressureState = { x: number; y: number; pull: number; alpha: number; phase: 'wait' | 'enter' | 'tug' | 'leave' | 'gone' };

export function pressureAt(p: Pressure, t: number): PressureState {
  const startX = p.side < 0 ? -labelWidth(p.label) / 2 - 40 : SCREEN_W + labelWidth(p.label) / 2 + 40;
  if (t < p.t0) return { x: startX, y: p.hy, pull: 0, alpha: 0, phase: 'wait' };
  const s = t - p.t0;
  if (s < ENTER) return { x: startX + (p.hx - startX) * ease(s / ENTER), y: p.hy, pull: 0, alpha: 1, phase: 'enter' };
  if (s < ENTER + TUG) {
    const pull = Math.sin((3 * Math.PI * (s - ENTER)) / TUG) ** 2;       // three tugs, each pulling outwards
    return { x: p.hx + p.side * PULL * pull, y: p.hy, pull, alpha: 1, phase: 'tug' };
  }
  if (s < ENTER + TUG + LEAVE) {
    const u = (s - ENTER - TUG) / LEAVE;                                  // the rope lets go; it drifts up and away
    return { x: p.hx + p.side * 420 * u * u, y: p.hy - 260 * u, pull: 0, alpha: 1 - u, phase: 'leave' };
  }
  return { x: p.hx + p.side * 420, y: p.hy - 260, pull: 0, alpha: 0, phase: 'gone' };
}
const leftAt = (p: Pressure) => p.t0 + ENTER + TUG;

/** The hammock's sideways swing (px): a gentle rock, plus a pull towards each tugging pressure. */
export const swayAt = (t: number) =>
  8 * Math.sin(t * 1.3) + PRESSURES.reduce((s, p) => s + p.side * 22 * pressureAt(p, t).pull, 0);

// The battery: low and red at the start, a step up each time a pressure gives up, topped up once the last one has gone.
const FULL_T = 22.8;
export function batteryAt(t: number) {
  const v = 0.12 + PRESSURES.reduce((s, p) => s + 0.09 * ease(clamp01((t - leftAt(p)) / 0.8)), 0) + 0.16 * ease(clamp01((t - FULL_T) / 0.8));
  return Math.min(1, Math.round(v * 1e6) / 1e6);
}
export const batteryColour = (level: number) => (level < 0.34 ? 'low' : level < 0.67 ? 'mid' : 'full');

export const wakeAt = (t: number) => ease(clamp01((t - 23.7) / 0.8));
export const smileAt = (t: number) => ease(clamp01((t - 24.0) / 1.2));
export const sunAt = (t: number) => ease(clamp01((t - 23.4) / 2.8));
export const bloomAt = (t: number) => ease(clamp01((t - 24.4) / 1.4));
