// @soundmindwithshivani reminder reel #1 (framework S22, Painted 2D S21), "a reminder under the stars". Model: a 34 s
// "let me remind you" reel studied 2026-10-27: one short line at a time over slowly drifting night skies, no hard cuts,
// the hook inside a dark circle on frame 0, ending dark. Ours, in season (Diwali, not monsoon): a dark room with a round
// window (fly through it) → Pune rooftops with a sky lantern and diyas → her on the terrace, looking up → the Milky Way
// and a shooting star → moonlit clouds, dimming so the loop back to the dark room is soft. Pure functions of t; tests
// in tests/sm014.test.ts.
import { clamp01, ease } from './motion.ts';
import { textAlpha as textAlphaFor, type TextItem } from './meStory.ts';
import { viewOf as viewOf11, cameraTransform as cameraTransform11, type Cam } from './sm011.ts';
import { paintOf, type Paint } from './paint.ts';
import type { Score } from './sfx.ts';

export const W = 1080, H = 1920;
export const DURATION = 30;
export const MUSIC = { style: 'calm' as const, chime: 26.6 };
export const viewOf = viewOf11, cameraTransform = cameraTransform11;
/** Where a point of the drawing lands on screen. */
export const toScreen = (c: Cam, x: number, y: number) => ({ x: (x - c.cx) * c.z + W / 2, y: (y - c.cy) * c.z + H / 2 });

// ---- the words: one line at a time, back to back -----------------------------------------------------------------------
export const LINES: TextItem[] = [
  { text: "You've been hard on yourself again.", t0: 0, t1: 2.4 },
  { text: "So here's a gentle reminder.", t0: 2.4, t1: 4.6 },
  { text: 'You got out of bed today.', t0: 4.9, t1: 7.3 },
  { text: 'You kept going on the days that hurt.', t0: 7.3, t1: 10.2 },
  { text: 'You still laugh. You still care.', t0: 10.2, t1: 12.6 },
  { text: "Maybe you're not where you planned to be.", t0: 12.8, t1: 15.8 },
  { text: "But you're further than you were.", t0: 15.8, t1: 18.4 },
  { text: 'So breathe out.', t0: 18.8, t1: 20.8 },
  { text: 'Unclench your jaw.', t0: 20.8, t1: 23.0 },
  { text: 'Be a little kinder to yourself tonight.', t0: 23.4, t1: 26.6 },
  { text: "You're doing better than you think.", t0: 26.6, t1: DURATION },
];
export const HOOK = LINES[0];
export const textAlpha = (item: TextItem, t: number) => textAlphaFor(item, t, DURATION);
/** The least time a line needs on screen: about 3 words a second, plus a moment to land. */
export const readSeconds = (text: string) => text.split(/\s+/).length / 3.2 + 0.4;
/** Mid-frame, and small enough to sit inside the round window on frame 0. */
export const TEXT_BOX = { x: 240, y: 760, w: 600, h: 200 };

// ---- colour: night everywhere, every material painted from one base colour -------------------------------------------------
export const SCENE = { text: '#FFFFFF', behindText: ['#1E2350', '#2B2A62', '#262A5C', '#4B3F7E', '#3E4878'] };
export const PAINT: Record<string, Paint> = {
  wall: paintOf('#3B2A48'), frame: paintOf('#7A4E34'), curtain: paintOf('#7C3B5A'), sill: paintOf('#6A4A3A'),
  diya: paintOf('#B8643A'), lantern: paintOf('#E8892E'), far: paintOf('#2E3060'), mid: paintOf('#3A3266'),
  near: paintOf('#4A3D63'), terrace: paintOf('#3E3550'), mat: paintOf('#2E7F7A'), sweatshirt: paintOf('#8C6BB0'),
  hair: paintOf('#3A2418'), skin: paintOf('#E2AE88'), cup: paintOf('#C96A3E'), cloud: paintOf('#4A5684'),
  moon: paintOf('#E9DDB8'), plant: paintOf('#3F8F55'), pot: paintOf('#B65E3C'),
};

// ---- the drawing (px, each scene its own 1080 × 1920 drawing) -----------------------------------------------------------------
export const WINDOW = { cx: 540, cy: 860, r: 330 };
export const HER = { x: 540, headY: 1262, r: 60 };                  // the terrace: sitting, her back to us
export const MOON = { x: 760, y: 470, r: 70 };

// ---- the camera: five scenes with slow dissolves; layers at their own depth --------------------------------------------------
export type ShotId = 'window' | 'rooftops' | 'terrace' | 'sky' | 'clouds';
export type Shot = { id: ShotId; t0: number; t1: number; from: Cam; to: Cam; via?: { t: number; cam: Cam } };
export const WIDE: Cam = { cx: W / 2, cy: H / 2, z: 1 };
export const SHOTS: Shot[] = [
  // a slow drift towards the window, then through it
  { id: 'window', t0: 0, t1: 4.8, from: WIDE, via: { t: 3.4, cam: { cx: 540, cy: 930, z: 1.12 } }, to: { cx: WINDOW.cx, cy: WINDOW.cy, z: 3.4 } },
  { id: 'rooftops', t0: 4.8, t1: 12.6, from: { cx: 540, cy: 1060, z: 1.15 }, to: { cx: 560, cy: 900, z: 1.15 } },
  { id: 'terrace', t0: 12.6, t1: 18.6, from: { cx: 540, cy: 1110, z: 1.2 }, to: { cx: 540, cy: 830, z: 1.2 } },
  { id: 'sky', t0: 18.6, t1: 23.2, from: { cx: 580, cy: 900, z: 1.1 }, to: { cx: 480, cy: 820, z: 1.18 } },
  { id: 'clouds', t0: 23.2, t1: DURATION, from: { cx: 540, cy: 1000, z: 1.12 }, to: { cx: 540, cy: 880, z: 1.12 } },
];
export const LAYERS = { sky: 0, far: 0.35, mid: 0.65, near: 1 } as const;
const lerp = (a: number, b: number, u: number) => a * (1 - u) + b * u;
const lerpCam = (a: Cam, b: Cam, u: number): Cam => ({ cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u), z: lerp(a.z, b.z, u) });
export const shotAt = (t: number) => SHOTS.find(s => t >= s.t0 && t < s.t1) ?? SHOTS[SHOTS.length - 1];
export function cameraAt(t: number): Cam {
  const s = shotAt(t);
  if (s.via && t < s.via.t) return lerpCam(s.from, s.via.cam, ease(clamp01((t - s.t0) / (s.via.t - s.t0))));
  const [a, t0] = s.via ? [s.via.cam, s.via.t] : [s.from, s.t0];
  return lerpCam(a, s.to, ease(clamp01((t - t0) / (s.t1 - t0))));
}
export const DISSOLVE = 0.8;
export function dissolveAt(t: number) {
  const i = SHOTS.indexOf(shotAt(t)), s = SHOTS[i];
  if (i === 0 || t - s.t0 >= DISSOLVE) return null;
  return { prev: SHOTS[i - 1].to, prevId: SHOTS[i - 1].id, k: ease(clamp01((t - s.t0) / DISSOLVE)) };
}
/** The last seconds sink towards the dark of the first frame, so the loop is soft. The words don't dim. */
export const dimAt = (t: number) => 1 - 0.6 * ease(clamp01((t - 27.5) / (DURATION - 27.5)));

// ---- her, on the terrace: tips her head up to the sky, breathes, hair in the breeze ------------------------------------------
export const tiltAt = (t: number) => ease(clamp01((t - 13.4) / 3.5));
export const breathAt = (t: number) => Math.sin(t * 1.9);
export const breezeAt = (t: number, phase = 0) => 0.6 * Math.sin(1.3 * t + phase) + 0.4 * Math.sin(2.9 * t + 1.7 * phase);

// ---- always moving: stars, flames, the lantern, clouds, a shooting star --------------------------------------------------
const rnd = (i: number, k: number) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
/** A fixed field of stars across the top of a drawing (y < yMax); each twinkles on its own. */
export const starsAbove = (yMax: number, n: number, seed = 0) =>
  Array.from({ length: n }, (_, i) => ({ i, x: W * rnd(i, 11 + seed), y: yMax * Math.pow(rnd(i, 13 + seed), 1.3), r: 1.4 + 2.6 * Math.pow(rnd(i, 17 + seed), 3) }));
export const twinkleAt = (i: number, t: number) => 0.6 + 0.4 * Math.sin(t * (1.7 + 0.37 * (i % 7)) + i * 2.1);
export const flickerAt = (i: number, t: number) => 0.85 + 0.08 * Math.sin(t * 13 + i) + 0.05 * Math.sin(t * 31.7 + 2 * i) + 0.02 * Math.sin(t * 7.3 + 3 * i);
/** The sky lantern sways on its string (degrees). */
export const swayAt = (t: number) => 4 * Math.sin(t * 1.1) + 1.5 * Math.sin(t * 2.7);
export function cloudsAt(t: number) {
  return [{ x: 260, y: 780, w: 560, d: 1 }, { x: 780, y: 1000, w: 640, d: 0.7 }, { x: 420, y: 1300, w: 760, d: 1.3 }, { x: 880, y: 640, w: 440, d: 0.5 }]
    .map((c, i) => ({ ...c, x: c.x + 14 * c.d * (t - 23.2) * (i % 2 ? -1 : 1) }));
}
export const SHOOTING = { t0: 19.8, t1: 20.8, from: { x: 230, y: 360 }, to: { x: 860, y: 560 } };
export function shootingStarAt(t: number) {
  if (t < SHOOTING.t0 || t > SHOOTING.t1) return null;
  const u = (t - SHOOTING.t0) / (SHOOTING.t1 - SHOOTING.t0);
  return { x: lerp(SHOOTING.from.x, SHOOTING.to.x, u), y: lerp(SHOOTING.from.y, SHOOTING.to.y, u), alpha: Math.sin(Math.PI * u), tail: 140 + 60 * u };
}

// In season: no rain. A soft whoosh through the window, a shimmer for the shooting star.
export const SOUND: Score = {
  duration: DURATION,
  hits: [{ kind: 'whoosh-in', t: 4.0, gain: 0.22 }, { kind: 'shimmer', t: 19.9, gain: 0.2 }],
  beds: [],
};
