// @soundmindwithshivani reel #11, the first "pause" reel (framework S20): "You don't have to earn rest."
// A young woman (early 20s) takes her chai on the balcony at a rainy dusk, phone face down, on a floor cushion. Four shots cut from one drawing: wide (she
// sips, eyes closed) → close-up of the glass and its steam → close-up of the tulsi on the rail as drops hit its leaves →
// wide again: she leans back, eyes closed. "Ten minutes. Just you and the rain." The camera ends where it began, so the
// reel loops. Pure functions of t (seconds), 1080×1920.
import { clamp01, ease } from './motion.ts';
import { textAlpha as textAlphaFor, type TextItem } from './meStory.ts';
import type { Score } from './sfx.ts';

export const W = 1080, H = 1920;
export const DURATION = 14;
export const MUSIC = { style: 'calm' as const, chime: 11.0 };

// Non-breaking spaces keep the lines balanced: "You don't have to / earn rest.", "Ten minutes. / Just you and the rain."
export const HOOK: TextItem = { text: "You don't have to earn rest.", t0: 0, t1: 3.8 };
export const LINE2: TextItem = { text: 'Ten minutes. Just you and the rain.', t0: 10.6, t1: DURATION };
export const textAlpha = (item: TextItem, t: number) => textAlphaFor(item, t, DURATION);

// Colours the words sit on (tests/sm011.test.ts keeps them WCAG AA with the ink).
export const SCENE = { ink: '#2F3A33', skyTop: '#8FA9BF', skyLow: '#DCE6EA', floor: ['#E9C29A', '#F4D8B4'] };

// The drawing (px): the awning across the top with its fairy lights, the town in the rain, the balcony rail (a ledge on
// a grill), her on a cane stool on the left, a little stool with her phone, the tulsi pot on the ledge on the right.
export const AWNING_Y = 150, LIGHTS_Y = 190, RAIL_Y = 1130, RAIL_H = 26, FLOOR_Y = 1460;
// She, her cushion and the stool are drawn in their own coordinates (HER, SEAT_Y, STOOL) and scaled up by FIG.s around
// FIG (her feet), so she fills the wide shot; toWorld / fromWorld convert.
export const FIG = { x: 400, y: 1500, s: 1.55 };
export const toWorld = (p: { x: number; y: number }) => ({ x: FIG.x + (p.x - FIG.x) * FIG.s, y: FIG.y + (p.y - FIG.y) * FIG.s });
export const fromWorld = (p: { x: number; y: number }) => ({ x: FIG.x + (p.x - FIG.x) / FIG.s, y: FIG.y + (p.y - FIG.y) / FIG.s });
export const HER = { x: 400, headY: 1080, r: 56 };
export const SEAT_Y = 1440;                              // the top of her floor cushion
export const KNEE_Y = 1275;                              // her knees, drawn up in front of her
export const STOOL = { x: 640, top: 1380 };
export const TULSI = { x: 860, y: RAIL_Y };              // the pot's base, standing on the ledge

// ---- the camera: four shots, cut, each with a slow drift --------------------------------------------------------------
export type Cam = { cx: number; cy: number; z: number };
export type Shot = { id: 'wide' | 'cup' | 'tulsi' | 'rest'; t0: number; t1: number; from: Cam; to: Cam };
export const WIDE: Cam = { cx: W / 2, cy: H / 2, z: 1 };
const NEAR: Cam = { cx: 480, cy: 930, z: 1.14 };
export const SHOTS: Shot[] = [
  { id: 'wide', t0: 0, t1: 4, from: WIDE, to: NEAR },
  { id: 'cup', t0: 4, t1: 7, from: { cx: 410, cy: 930, z: 2.6 }, to: { cx: 420, cy: 950, z: 2.85 } },
  { id: 'tulsi', t0: 7, t1: 10, from: { cx: 800, cy: 1010, z: 2.3 }, to: { cx: 860, cy: 980, z: 2.5 } },
  { id: 'rest', t0: 10, t1: DURATION, from: NEAR, to: WIDE },
];
const lerp = (a: number, b: number, u: number) => a * (1 - u) + b * u;
export const shotAt = (t: number) => SHOTS.find(s => t >= s.t0 && t < s.t1) ?? SHOTS[SHOTS.length - 1];
export function cameraAt(t: number): Cam {
  const s = shotAt(t), u = ease(clamp01((t - s.t0) / (s.t1 - s.t0)));
  return { cx: lerp(s.from.cx, s.to.cx, u), cy: lerp(s.from.cy, s.to.cy, u), z: lerp(s.from.z, s.to.z, u) };
}
/** The part of the drawing on screen. */
export const viewOf = (c: Cam) => ({ x0: c.cx - W / 2 / c.z, y0: c.cy - H / 2 / c.z, x1: c.cx + W / 2 / c.z, y1: c.cy + H / 2 / c.z });
// Depth: each layer follows the camera by its depth (0 = the sky, still; 1 = the balcony), so near things slide past far
// ones. A layer's view always stays inside the drawing when the balcony's does (the views are a concave blend).
export const LAYERS = { sky: 0, hills: 0.25, town: 0.45, rainFar: 0.55, trees: 0.7, rainNear: 0.85, balcony: 1 } as const;
export const layerCam = (c: Cam, depth: number): Cam =>
  ({ cx: W / 2 + (c.cx - W / 2) * depth, cy: H / 2 + (c.cy - H / 2) * depth, z: 1 + (c.z - 1) * depth });
/** Each cut is a soft dissolve: the new shot fades in over the outgoing one, which holds its last framing. */
export const DISSOLVE = 0.5;
export function dissolveAt(t: number) {
  const i = SHOTS.indexOf(shotAt(t)), s = SHOTS[i];
  if (i === 0 || t - s.t0 >= DISSOLVE) return null;
  return { prev: SHOTS[i - 1].to, k: ease(clamp01((t - s.t0) / DISSOLVE)) };
}
/** Soft focus: in a close-up the layers behind the balcony blur (1 = full blur). */
export const focusBlur = (s: Shot) => (s.id === 'cup' || s.id === 'tulsi' ? 1 : 0);
/** SVG transform that puts the camera's centre in the middle of the screen. */
export const cameraTransform = (c: Cam) => `translate(${W / 2} ${H / 2}) scale(${c.z}) translate(${-c.cx} ${-c.cy})`;

// ---- her: the sip, the lean back, her eyes ----------------------------------------------------------------------------
// The glass, in the drawing's coordinates (at rest in both hands, at her lips, in her lap).
export const CUP = { rest: { x: 406, y: 1108 }, sip: { x: 416, y: 942 }, lap: { x: 446, y: 1125 } };
/** The glass at her lips (0 → 1 → 0) in the first shot. */
export const sipAt = (t: number) => ease(clamp01((t - 0.9) / 0.6)) - ease(clamp01((t - 2.5) / 0.6));
export const leanAt = (t: number) => ease(clamp01((t - 10.4) / 1.3));
export const BLINKS = [0.45, 3.3, 4.6, 6.1, 9.6];
const blinking = (t: number) => BLINKS.some(b => t >= b && t < b + 0.13);
export const eyesClosed = (t: number) => sipAt(t) > 0.8 || leanAt(t) > 0.5 || blinking(t);
/** Her head's tilt (degrees, + = toward the rain on her left): back to sip, then a turn toward the rain in the close-up. */
export const headTiltAt = (t: number) =>
  -6 * sipAt(t) + 7 * ease(clamp01((t - 4.9) / 0.7)) * (1 - ease(clamp01((t - 6.1) / 0.7)));
/** A light breeze (about −1 … 1): hair, trees, the fairy-light wire. */
export const breezeAt = (t: number, phase = 0) => 0.6 * Math.sin(1.3 * t + phase) + 0.4 * Math.sin(2.9 * t + 1.7 * phase);
export function cupAt(t: number) {
  const s = sipAt(t), l = leanAt(t);
  const x = lerp(CUP.rest.x, CUP.sip.x, s), y = lerp(CUP.rest.y, CUP.sip.y, s);
  return { x: lerp(x, CUP.lap.x, l), y: lerp(y, CUP.lap.y, l), tilt: 22 * s };
}

// ---- moving all the time: steam, rain, drips, the tulsi's leaves -------------------------------------------------------
export const STEAM = { period: 2.4, rise: 170 };
/** Wisp i (0–3) of steam from the glass: how far it has risen, how visible it is, how far it sways. */
export function steamAt(i: number, t: number) {
  const u = (t / STEAM.period + i / 4) % 1;
  return { rise: u * STEAM.rise, alpha: Math.sin(Math.PI * u), sway: 14 * Math.sin(2 * Math.PI * (1.3 * u + 0.37 * i)) };
}

const rnd = (i: number, k: number) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
export const RAIN_N = 150, RAIN_SLANT = 0.2;
/** Rain streak i: falls from the awning to the floor line behind the rail, drifting a little to the right. */
export function rainStreak(i: number, t: number) {
  const span = FLOOR_Y - AWNING_Y, speed = 1500 + 400 * rnd(i, 1);
  const fall = (t * speed + rnd(i, 2) * span) % span;
  return { x: rnd(i, 3) * (W + 260) - 260 + RAIN_SLANT * fall, y: AWNING_Y + fall, len: 34 + 26 * rnd(i, 4) };
}
/** Fat drops off the awning's edge, each on its own beat. */
export const DRIPS = [70, 250, 520, 770, 1010].map((x, i) => ({ x, period: 1.1 + 0.25 * i, phase: rnd(i, 5) }));
export function dripAt(d: (typeof DRIPS)[number], t: number) {
  const u = (t / d.period + d.phase) % 1;
  return { x: d.x, y: AWNING_Y + 10 + 1400 * u * u, alpha: u < 0.9 ? 1 : (1 - u) * 10 };
}

// The tulsi's leaves (centre of each leaf, the angle it points at, its size), and the drops that hit three of them in
// the close-up. A hit leaf dips, springs back and settles.
export const LEAVES = [
  { x: 822, y: 1002, ang: -150, s: 1 }, { x: 900, y: 996, ang: -30, s: 1 }, { x: 806, y: 952, ang: -155, s: 0.9 },
  { x: 916, y: 946, ang: -25, s: 0.9 }, { x: 834, y: 918, ang: -125, s: 1.1 }, { x: 886, y: 914, ang: -55, s: 1.1 },
  { x: 814, y: 880, ang: -150, s: 0.85 }, { x: 906, y: 874, ang: -30, s: 0.85 }, { x: 846, y: 858, ang: -110, s: 0.95 },
  { x: 876, y: 854, ang: -70, s: 0.95 }, { x: 861, y: 826, ang: -90, s: 0.8 },
];
export const LEAF_HITS = [{ leaf: 1, t: 7.6 }, { leaf: 4, t: 8.5 }, { leaf: 9, t: 9.3 }];
export function leafBob(leaf: number, t: number) {
  return LEAF_HITS.filter(h => h.leaf === leaf && t >= h.t)
    .reduce((a, h) => { const d = t - h.t; return a + 9 * Math.exp(-3.2 * d) * Math.sin(16 * d); }, 0);
}
/** The drop on its way to a leaf (the 0.3 s before it lands), then its splash (0 → 1 over 0.25 s). */
export function hitDropAt(h: (typeof LEAF_HITS)[number], t: number) {
  const l = LEAVES[h.leaf], d = t - h.t;
  return { x: l.x, y: l.y - 8 - 300 * clamp01(-d / 0.3), falling: d < 0 && d > -0.3, splash: d >= 0 && d < 0.25 ? d / 0.25 : 0 };
}
/** A drop gathering under the ledge, then letting go. */
export const RAIL_DRIP = { x: 778, period: 1.7, gather: 1.25 };
export function railDripAt(t: number) {
  const d = t % RAIL_DRIP.period, base = RAIL_Y + RAIL_H;
  if (d < RAIL_DRIP.gather) return { x: RAIL_DRIP.x, y: base + 9 * (d / RAIL_DRIP.gather), r: 3 + 7 * (d / RAIL_DRIP.gather), falling: false };
  const f = (d - RAIL_DRIP.gather) / (RAIL_DRIP.period - RAIL_DRIP.gather);
  return { x: RAIL_DRIP.x, y: base + 9 + 420 * f * f, r: 9, falling: true };
}

// ---- sound: rain under the whole reel, a soft tap as each drop lands on a leaf ----------------------------------------
export const RAIN_LEVEL = 0.6;
export const SOUND: Score = {
  duration: DURATION,
  hits: LEAF_HITS.map(h => ({ kind: 'tap' as const, t: h.t, gain: 0.25, pitch: 1.8 })),
  beds: [{ kind: 'rain', t0: 0, t1: DURATION, level: () => RAIN_LEVEL }],
};
