// @soundmindwithshivani pause reel #3 (framework S20, Painted 2D S21), "window seat". Not monsoon any more (founder,
// 2026-10-24: "chai in cozy room besides window with book in hand"): a clear golden-hour evening indoors. She sits curled
// in a window seat with a book open on her knees, chai steaming on the sill, dust drifting in the sunbeam, a lamp, a plant,
// fairy lights; outside, a soft sunset over the town. Wide (she glances out and back) → the cup → a page turning in the
// breeze → wide (the book on her chest, eyes closed). Pure functions of t; tests in tests/sm013.test.ts.
import { clamp01, ease } from './motion.ts';
import { textAlpha as textAlphaFor, type TextItem } from './meStory.ts';
import { viewOf as viewOf11, cameraTransform as cameraTransform11, type Cam } from './sm011.ts';
import { paintOf, type Paint } from './paint.ts';
import type { Score } from './sfx.ts';

export const W = 1080, H = 1920;
export const DURATION = 13;
export const MUSIC = { style: 'calm' as const, chime: 10.5 };
export const viewOf = viewOf11, cameraTransform = cameraTransform11;

// Non-breaking spaces keep the lines balanced ("Rest isn't a reward. / It's a need.").
export const HOOK: TextItem = { text: "Rest isn't a reward. It's a need.", t0: 0, t1: 3.3 };
export const LINE2: TextItem = { text: 'One chapter. One cup. No hurry.', t0: 10.1, t1: DURATION };
export const textAlpha = (item: TextItem, t: number) => textAlphaFor(item, t, DURATION);

// ---- colour: a warm, dim room around a bright window; every material painted from one base colour -----------------------
export const SCENE = { text: '#FFFFFF', behindText: ['#3A2E40', '#46384C'] };
export const PAINT: Record<string, Paint> = {
  wall: paintOf('#46384C'), frame: paintOf('#8A5A3A'), seat: paintOf('#9C6B45'), cushion: paintOf('#2E8C86'),
  sweater: paintOf('#C8632F'), pyjama: paintOf('#7A8FC4'), skin: paintOf('#E2AE88'), hair: paintOf('#3A2418'),
  cover: paintOf('#2F6B4A'), pages: paintOf('#EFE4CC'), mug: paintOf('#D9784A'), lampShade: paintOf('#F2D8A6'),
  lampBrass: paintOf('#C9963A'), plant: paintOf('#3F8F55'), pot: paintOf('#B65E3C'), rug: paintOf('#8E3B46'),
};

// ---- the drawing (px) ------------------------------------------------------------------------------------------------------
export const WINDOW = { x0: 300, x1: 1000, y0: 540, y1: 1250 };
export const SEAT_Y = 1290;                                         // the window seat's top, where she sits
export const CUP = { x: 880, y: 1262 };                             // the mug on the sill, right of her
export const BOOK = { x: 560, y: 1175, w: 190 };                    // open on her knees, pages up
export const HER = { x: 560, headY: 1010, r: 50 };
export const SUN = { x: 820, y: 1060, r: 70 };
/** The sunbeam through the window: where the dust drifts (a box in front of the lower window). */
export const BEAM = { x0: 360, x1: 960, y0: 760, y1: 1240 };
export const inBeam = (x: number, y: number) => x >= BEAM.x0 && x <= BEAM.x1 && y >= BEAM.y0 && y <= BEAM.y1;

// ---- the camera: four shots with dissolves; the town outside moves at its own depth ----------------------------------------
export type Shot = { id: 'wide' | 'cup' | 'book' | 'rest'; t0: number; t1: number; from: Cam; to: Cam };
export const WIDE: Cam = { cx: W / 2, cy: H / 2, z: 1 };
const NEAR: Cam = { cx: 520, cy: 1000, z: 1.1 };
export const SHOTS: Shot[] = [
  { id: 'wide', t0: 0, t1: 3.5, from: WIDE, to: NEAR },
  { id: 'cup', t0: 3.5, t1: 6.5, from: { cx: 840, cy: 1170, z: 2.5 }, to: { cx: 845, cy: 1150, z: 2.65 } },
  { id: 'book', t0: 6.5, t1: 9.5, from: { cx: 560, cy: 1120, z: 2.4 }, to: { cx: 560, cy: 1110, z: 2.55 } },
  { id: 'rest', t0: 9.5, t1: DURATION, from: NEAR, to: WIDE },
];
export const LAYERS = { sky: 0, town: 0.3, near: 0.55, room: 1 } as const;
const lerp = (a: number, b: number, u: number) => a * (1 - u) + b * u;
export const shotAt = (t: number) => SHOTS.find(s => t >= s.t0 && t < s.t1) ?? SHOTS[SHOTS.length - 1];
export function cameraAt(t: number): Cam {
  const s = shotAt(t), u = ease(clamp01((t - s.t0) / (s.t1 - s.t0)));
  return { cx: lerp(s.from.cx, s.to.cx, u), cy: lerp(s.from.cy, s.to.cy, u), z: lerp(s.from.z, s.to.z, u) };
}
export const DISSOLVE = 0.5;
export function dissolveAt(t: number) {
  const i = SHOTS.indexOf(shotAt(t)), s = SHOTS[i];
  if (i === 0 || t - s.t0 >= DISSOLVE) return null;
  return { prev: SHOTS[i - 1].to, prevId: SHOTS[i - 1].id, k: ease(clamp01((t - s.t0) / DISSOLVE)) };
}
export const focusBlur = (id: Shot['id']) => (id === 'cup' || id === 'book' ? 1 : 0);

// ---- her ---------------------------------------------------------------------------------------------------------------
/** A glance out of the window and back (0 = reading, 1 = looking out), in the first shot. */
export const glanceAt = (t: number) => ease(clamp01((t - 1.2) / 0.5)) - ease(clamp01((t - 2.4) / 0.5));
export const leanAt = (t: number) => ease(clamp01((t - 9.9) / 1.3));
export const BLINKS = [0.5, 3.1, 9.6];
const blinking = (t: number) => BLINKS.some(b => t >= b && t < b + 0.13);
export const eyesClosed = (t: number) => leanAt(t) > 0.5 || blinking(t);
export const breezeAt = (t: number, phase = 0) => 0.6 * Math.sin(1.3 * t + phase) + 0.4 * Math.sin(2.9 * t + 1.7 * phase);

// ---- always moving: steam, a page in the breeze, dust in the sunbeam, clouds, birds going home ----------------------------
export const STEAM = { period: 2.2, rise: 150 };
export function steamAt(i: number, t: number) {
  const u = (t / STEAM.period + i / 4) % 1;
  return { rise: u * STEAM.rise, alpha: Math.sin(Math.PI * u), sway: 12 * Math.sin(2 * Math.PI * (1.3 * u + 0.37 * i)) };
}
export const PAGE_TURN = [7.2, 8.2];
export const pageAt = (t: number) => ease(clamp01((t - PAGE_TURN[0]) / (PAGE_TURN[1] - PAGE_TURN[0])));
const rnd = (i: number, k: number) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
/** Dust motes drifting slowly in the beam: each wanders on its own slow loop and wraps inside the beam. */
export function motesAt(t: number) {
  const fr = (v: number) => ((v % 1) + 1) % 1;
  return Array.from({ length: 16 }, (_, i) => ({
    x: BEAM.x0 + (BEAM.x1 - BEAM.x0) * fr(rnd(i, 1) + t * (0.004 + 0.006 * rnd(i, 2)) + 0.02 * Math.sin(t * 0.8 + 6 * rnd(i, 3))),
    y: BEAM.y0 + (BEAM.y1 - BEAM.y0) * fr(rnd(i, 4) - t * (0.006 + 0.008 * rnd(i, 5))),
    r: 2 + 3 * rnd(i, 6), alpha: 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.7 + 6 * rnd(i, 7))),
  }));
}
/** Clouds over the town: they drift and come back within the reel, so the loop has no jump. */
export function cloudsAt(t: number) {
  return [{ x: 420, y: 640, w: 170 }, { x: 720, y: 600, w: 220 }, { x: 900, y: 700, w: 140 }]
    .map((c, i) => ({ ...c, x: c.x + 24 * Math.sin((2 * Math.PI * t) / DURATION + i * 1.9) }));
}
/** Two birds crossing the window, going home, in the first shot. */
export function birdsAt(t: number) {
  return [0, 1].map(i => { const u = clamp01((t - 0.3 - 0.35 * i) / 3.0); return { x: 260 + 800 * u, y: 760 - 90 * u + 14 * i + 8 * Math.sin(t * 9 + i), flap: Math.sin(t * 14 + i * 2), on: u > 0 && u < 1 }; });
}
/** The fairy lights twinkle; never off. */
export const twinkleAt = (i: number, t: number) => 0.65 + 0.35 * Math.sin(t * 2.3 + i * 1.7);

// Not monsoon: no rain. A soft page sound as the page turns, a soft tap as she closes the book on her chest.
export const SOUND: Score = {
  duration: DURATION,
  hits: [{ kind: 'whoosh-out', t: PAGE_TURN[0], gain: 0.22 }, { kind: 'tap', t: 10.7, gain: 0.18, pitch: 0.7 }],
  beds: [],
};
