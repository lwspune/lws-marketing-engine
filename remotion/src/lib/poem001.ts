// @lws.pune · the poem reel (founder, 2026-10-28): a copy of @filmy.sketches' reel (study/reels/Dd9KpTsOQH6.mp4, never
// posted). Theirs: a recitation of the poem "विपत्ति में, विरोध में अडिग रहो, अटल रहो…" (credited to Ramdhari Singh
// 'Dinkar') over four red-and-black Mahabharata paintings, each pushing in slowly, cross-fading on the couplets, then the
// poet's name. Ours: the same shape, timing and red-black look, over the struggle of Indian soldiers, in licensed photos
// (Wikimedia Commons: GODL-India or public domain) graded to their palette. No words of the poem on screen (the poem is in
// their audio). Their audio goes on in the Instagram app ("Use audio"), never into our file: the MP4 is silent.
//
// | time         | ours (theirs)                                                                       |
// | 0–10.0 s     | a soldier alone in a snowstorm (Krishna's hand on a kneeling Arjuna)                 |
// | 10.0–19.5 s  | a soldier signalling "follow me" across a field (Krishna pointing from the chariot)  |
// | 19.5–27.5 s  | close on a soldier taking aim (Arjuna drawing his bow)                               |
// | 27.5–46 s    | commandos against the sky, a helicopter coming in, tracers (a chariot in an arrow storm) |
// | 41.7–46 s    | the poet's name, LWS Pune under it (their credit card)                               |
import { clamp01, prog } from './motion.ts';

export const SOURCE = { handle: '@filmy.sketches', url: 'https://www.instagram.com/reel/Dd9KpTsOQH6/', audio: 46.02, cuts: [10.0, 19.5, 27.5], credit: 41.7 } as const;
export const DURATION = 46.0, COVER_T = 3.0;

export type Scene = { file: string; t0: number; t1: number; fade: number; pan: number; licence: 'Public domain' | 'GODL-India'; credit: string; source: string };
const S = (file: string, t0: number, fade: number, pan: number, licence: Scene['licence'], credit: string, source: string) => ({ file, t0, fade, pan, licence, credit, source });
const RAW = [
  S('lws-poem/snow-red.png', 0, 0, -40, 'GODL-India', 'Indian Army, Ministry of Defence (India)', 'https://commons.wikimedia.org/wiki/File:An_Indian_Army_soldier_in_snow_camouflage.jpg'),
  S('lws-poem/follow-red.png', 9.5, 1.0, 50, 'Public domain', 'Sgt. Michael J. MacLeod, U.S. Army', 'https://commons.wikimedia.org/wiki/File:An_Indian_Army_soldier_signals_to_fellow_soldiers_to_follow_him_during_an_ambush_demonstration_to_U.S._Army_paratroopers_during_Yudh_Abhyas_2013.jpg'),
  S('lws-poem/aim-red.png', 19.2, 0.6, -30, 'Public domain', 'Crista Yazzie, U.S. Army', 'https://commons.wikimedia.org/wiki/File:Indian_Army_soldier_at_Camp_Babina.jpg'),
  S('lws-poem/sky-red.png', 27.2, 0.6, 0, 'GODL-India', 'Government of India', 'https://commons.wikimedia.org/wiki/File:HAL_Dhruv_MKIII_and_Commandos_doing_Heliborne_operations.jpg'),
];
export const SCENES: Scene[] = RAW.map((s, i) => ({ ...s, t1: i + 1 < RAW.length ? RAW[i + 1].t0 + RAW[i + 1].fade : DURATION }));

/** How much of each scene shows at t: the next fades in over the one before, so they always add up to 1. */
export function sceneAlphas(t: number): number[] {
  return SCENES.map((s, i) => {
    const inn = i === 0 ? (t >= 0 ? 1 : 0) : s.fade > 0 ? clamp01((t - s.t0) / s.fade) : t >= s.t0 ? 1 : 0;
    const next = SCENES[i + 1], out = next ? 1 - clamp01((t - next.t0) / next.fade) : 1;
    return inn * out;
  });
}
/** The slow push-in of scene i (theirs: about 10% over a scene), with a little drift sideways. */
export function pushAt(i: number, t: number) {
  const s = SCENES[i], u = clamp01((t - s.t0) / (s.t1 - s.t0));
  return { scale: 1.02 + 0.12 * u, dx: s.pan * u };
}

export const CREDIT = { t0: 41.7, poet: "रामधारी सिंह 'दिनकर'", brand: 'LWS Pune' } as const;
export const creditAt = (t: number) => prog(t, CREDIT.t0, 0.5);

// ---- embers rising all reel (theirs has sparks drifting through every painting) ----
const rnd = (i: number, k: number) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
const EMBERS = Array.from({ length: 46 }, (_, i) => ({ x0: 40 + rnd(i, 1) * 1000, speed: 60 + rnd(i, 2) * 140, phase: rnd(i, 3) * 2020, sway: 10 + rnd(i, 4) * 25, w: 0.4 + rnd(i, 5), r: 2 + rnd(i, 6) * 5 }));
export function embersAt(t: number) {
  return EMBERS.map((e, i) => ({
    x: e.x0 + Math.sin(t * e.w + i) * e.sway,
    y: 1970 - ((t * e.speed + e.phase) % 2020),
    r: e.r,
    alpha: 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 6 * e.w + i * 1.7)),
  }));
}

// ---- tracers in the last scene (their arrow storm), streaking down to the left ----
const STREAKS = Array.from({ length: 14 }, (_, i) => ({ x0: 200 + rnd(i, 7) * 1100, y0: -200 + rnd(i, 8) * 900, speed: 900 + rnd(i, 9) * 700, len: 140 + rnd(i, 10) * 140, phase: rnd(i, 11) * 3 }));
const DIR = [-0.62, 0.78];                                            // down and to the left, as theirs
export function streaksAt(t: number) {
  const s = SCENES[3];
  if (t < s.t0) return [];
  const a = clamp01((t - s.t0) / 1.5);
  return STREAKS.map(k => {
    const d = (((t - s.t0) + k.phase) * k.speed) % 2600;
    const x2 = k.x0 + DIR[0] * d, y2 = k.y0 + DIR[1] * d;
    return { x1: x2 - DIR[0] * k.len, y1: y2 - DIR[1] * k.len, x2, y2, alpha: a * 0.8 };
  });
}
