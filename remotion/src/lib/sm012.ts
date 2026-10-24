// @soundmindwithshivani pause reel #2 (framework S20), "tapri at dusk", in the richer 2D look (founder, 2026-10-24):
// painted, not outlined. A street-side tea stall under a tin roof at dusk in the rain; a young woman with a kulhad of chai;
// her scooter parked in the rain. Wide (she sips) → the kettle and its steam → the scooter's tail light in a puddle →
// wide (she leans back, eyes closed). Pure functions of t (seconds), 1080×1920; tests in tests/sm012.test.ts.
import { clamp01, ease } from './motion.ts';
import { textAlpha as textAlphaFor, type TextItem } from './meStory.ts';
import { viewOf as viewOf11, cameraTransform as cameraTransform11, type Cam } from './sm011.ts';
import type { Score } from './sfx.ts';
import type { Paint } from './paint.ts';

export const W = 1080, H = 1920;
export const DURATION = 13;
export const MUSIC = { style: 'calm' as const, chime: 10.4 };
export const viewOf = viewOf11, cameraTransform = cameraTransform11;

// Non-breaking spaces keep the lines balanced ("You're allowed / to slow down.").
export const HOOK: TextItem = { text: "You're allowed to slow down.", t0: 0, t1: 3.3 };
export const LINE2: TextItem = { text: 'Let the rain set the pace.', t0: 10.1, t1: DURATION };
export const textAlpha = (item: TextItem, t: number) => textAlphaFor(item, t, DURATION);

// ---- colour: the dusk sky, the wet road, and the painted palette (fill, its light and shadow sides, its edge) -----------
export const SCENE = { text: '#FFFFFF', skyTop: '#1C2747', skyMid: '#3C4672', skyLow: '#D9875F', road: '#2A2F3D' };
export const PAINT: Record<string, Paint> = {
  tin: { fill: '#6F8A94', light: '#9DB4BB', shade: '#4C6168', edge: '#3D4F55' },
  wood: { fill: '#8A5A3A', light: '#B07A52', shade: '#6A4229', edge: '#54331F' },
  stallBlue: { fill: '#2F6F8F', light: '#4C93B5', shade: '#235670', edge: '#1B4558' },
  steel: { fill: '#A9B2BA', light: '#D7DDE2', shade: '#7F8991', edge: '#626B73' },
  scooter: { fill: '#5FB8A6', light: '#8CD6C7', shade: '#3F937F', edge: '#2F7363' },
  jacket: { fill: '#E3A72F', light: '#F4C766', shade: '#B9831C', edge: '#946815' },
  jeans: { fill: '#3E5C8A', light: '#5A7BAC', shade: '#2E466B', edge: '#243857' },
  skin: { fill: '#E2AE88', light: '#F0C7A6', shade: '#C98E68', edge: '#A9714F' },
  hair: { fill: '#3A2418', light: '#5A3A28', shade: '#2A1A11', edge: '#24160E' },
  kulhad: { fill: '#B5603A', light: '#D2805A', shade: '#8F4628', edge: '#73381F' },
  tree: { fill: '#2F6B4A', light: '#4A8C64', shade: '#235238', edge: '#1C432D' },
  building: { fill: '#4A4F70', light: '#636A8F', shade: '#3A3E5A', edge: '#30344C' },
};

// ---- the drawing (px) ------------------------------------------------------------------------------------------------------
export const AWNING_EDGE = { x0: 0, x1: 660, y: 905 };           // the tin roof's front edge, where the rain runs off
export const KETTLE = { x: 240, y: 1085 };
export const BULB = { x: 290, y: 965 };
export const TAIL_LIGHT = { x: 1012, y: 1345 };
export const WATER_Y = 1480;                                      // the road surface under the scooter: reflections mirror about it
export const PUDDLE = { x: 860, y: 1560, rx: 220, ry: 70 };
export const reflect = (p: { x: number; y: number }) => ({ x: p.x, y: 2 * WATER_Y - p.y });
export const HER = { x: 545, headY: 1150, r: 50 };
export const HER_SCALE = 1.25;                                   // she and the bench, scaled about her feet
export const FEET_Y = 1456;

// ---- the camera: four shots with dissolves; layers at their own depth ------------------------------------------------------
export type Shot = { id: 'wide' | 'kettle' | 'scooter' | 'rest'; t0: number; t1: number; from: Cam; to: Cam };
export const WIDE: Cam = { cx: W / 2, cy: H / 2, z: 1 };
const NEAR: Cam = { cx: 500, cy: 1000, z: 1.12 };
export const SHOTS: Shot[] = [
  { id: 'wide', t0: 0, t1: 3.5, from: WIDE, to: NEAR },
  { id: 'kettle', t0: 3.5, t1: 6.5, from: { cx: 255, cy: 1020, z: 2.6 }, to: { cx: 265, cy: 1000, z: 2.8 } },
  { id: 'scooter', t0: 6.5, t1: 9.5, from: { cx: 820, cy: 1440, z: 2.3 }, to: { cx: 835, cy: 1420, z: 2.45 } },
  { id: 'rest', t0: 9.5, t1: DURATION, from: NEAR, to: WIDE },
];
export const LAYERS = { sky: 0, far: 0.3, rainFar: 0.45, tree: 0.6, rainNear: 0.8, street: 1 } as const;
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
export const focusBlur = (id: Shot['id']) => (id === 'kettle' || id === 'scooter' ? 1 : 0);

// ---- her ---------------------------------------------------------------------------------------------------------------
export const sipAt = (t: number) => ease(clamp01((t - 0.8) / 0.6)) - ease(clamp01((t - 2.2) / 0.6));
export const leanAt = (t: number) => ease(clamp01((t - 9.9) / 1.3));
export const BLINKS = [0.35, 2.95, 9.65];
const blinking = (t: number) => BLINKS.some(b => t >= b && t < b + 0.13);
export const eyesClosed = (t: number) => sipAt(t) > 0.8 || leanAt(t) > 0.5 || blinking(t);
export const breezeAt = (t: number, phase = 0) => 0.6 * Math.sin(1.3 * t + phase) + 0.4 * Math.sin(2.9 * t + 1.7 * phase);

// ---- always moving: steam, drips off the tin, puddle rings, the bulb's flicker, rain ---------------------------------------
export const STEAM = { period: 2.2, rise: 150 };
export function steamAt(i: number, t: number) {
  const u = (t / STEAM.period + i / 4) % 1;
  return { rise: u * STEAM.rise, alpha: Math.sin(Math.PI * u), sway: 12 * Math.sin(2 * Math.PI * (1.3 * u + 0.37 * i)) };
}
const rnd = (i: number, k: number) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
export const DRIP_N = 22, DRIP_FALL = 560;
/** Drips running off the tin roof's edge: each falls from the edge to the ground on its own beat, then starts again. */
export function dripsAt(t: number) {
  return Array.from({ length: DRIP_N }, (_, i) => {
    const per = 0.55 + 0.35 * rnd(i, 1), u = (t / per + rnd(i, 2)) % 1;
    return { x: AWNING_EDGE.x0 + 12 + (AWNING_EDGE.x1 - AWNING_EDGE.x0 - 24) * (i + 0.5 * rnd(i, 3)) / DRIP_N, y: AWNING_EDGE.y + DRIP_FALL * u * u, len: 14 + 26 * u };
  });
}
/** Rings on the puddle: four at a time, each spreading and fading over its own beat. */
export function ripplesAt(t: number) {
  return Array.from({ length: 4 }, (_, i) => {
    const per = 0.9 + 0.3 * rnd(i, 4), cycle = Math.floor(t / per + rnd(i, 5)), u = (t / per + rnd(i, 5)) % 1;
    const ox = (rnd(i * 7 + cycle, 6) - 0.5) * PUDDLE.rx * 1.2, oy = (rnd(i * 7 + cycle, 7) - 0.5) * PUDDLE.ry * 0.8;
    return { x: PUDDLE.x + ox, y: PUDDLE.y + oy, rx: 8 + 70 * u, ry: 3 + 16 * u, alpha: 0.9 * (1 - u) };
  });
}
/** The bulb's brightness: a slow breath and a little flutter, never below 85 %. */
export const bulbAt = (t: number) => 0.925 + 0.045 * Math.sin(t * 2.1) + 0.03 * Math.sin(t * 13.7 + 1.3) * Math.sin(t * 0.9);
/** A rain streak at depth `near` (0 far … 1 near): it falls a little slanted from above the frame to the street. */
export function rainStreak(i: number, t: number, near: number) {
  const span = 1900, speed = 1300 + 900 * near + 300 * rnd(i, 8), fall = (t * speed + rnd(i, 9) * span) % span;
  return { x: rnd(i, 10) * (W + 300) - 300 + 0.18 * fall, y: -60 + fall, len: 28 + 70 * near + 20 * rnd(i, 11) };
}

export const SOUND: Score = { duration: DURATION, hits: [], beds: [{ kind: 'rain', t0: 0, t1: DURATION, level: () => 0.65 }] };
