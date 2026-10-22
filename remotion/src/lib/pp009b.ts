// @pyqvault_ · Physics, visualised #9, rebuilt (2026-10-22) to framework v1.26: a car in your wing mirror looks far. Is it?
// Closer. Class 12 Physics · Ray Optics. The same idea as pp009.ts (P29), now told by the picture (F29): the flat glass
// bulges into a convex one and the car in it shrinks (hook "You'd think", opening Morph, F25); a top-down map shows where
// the car seems to be (judged by its size) and, at the answer, where it really is. Second hook (F26): "So why curve it at
// all?" as the mirror splits into flat and curved, and a motorbike rides into the blind spot that only the curved glass
// shows. It loops (F27). Real numbers, in metres: a wing mirror of R = 1.4 m, 18 cm wide, the driver's eye 0.94 m from it.
// The view in each glass is a real 3D road seen from the eye's mirror image (a camera behind the glass), as wide as the
// law of reflection says the glass sees; its shrink is checked against the mirror formula (tests).
//
// Map coordinates (x, y): metres from the glass's centre, x back along the road, y out from our car (the driver's side,
// the overtaking lane). Pure functions of t.
//
// BEAT TABLE (runbook step 1). Voice lengths are Kokoro af_heart, measured (runbook step 3).
// | time         | what moves                                                         | caption (voice)                          | keep in frame        | colours                                          |
// | 0–1.6 s HOOK | "You'd think" + Morph: the flat glass bulges, the road in it zooms  | Looks far. Really? + A/B/C + tag         | the glass            | housing red (VIVID: our car), road asphalt, sky, |
// |              | out and the blue car shrinks to 0.38× (shimmer); the car drives in  | (voice: the question)                    |                      | grass (real), car blue (VIVID)                   |
// | 1.6–8.0 s    | the car comes from 16 m to 12 m; on the map an outline car marks   | Curved glass shrinks everything ·        | the glass, the map   | outline car blue, dashed                         |
// |              | where it seems to be (~44 → 33 m)                                  | Smaller looks farther away               |                      |                                                  |
// | 8.4 s ANSWER | the real car drops onto the map at 12 m (thunk); "A closer" lights | It's closer than it looks!               | the map              | real car solid blue                              |
// | 9.8 s 2nd    | "So why curve it at all?": the mirror splits, flat left, curved    | So why curve it at all?                  | both glasses         | wedges: curved cyan, flat pale dashed            |
// |              | right (snap, zoom out); the map draws both glasses' views          |                                          |                      |                                                  |
// | 10.3–12.1 s  | a motorbike rides up into the blind spot: it leaves the flat glass | —                                        | both glasses, map    | bike yellow (VIVID)                              |
// |              | and stays in the curved one; on the map it sits in the cyan wedge  |                                          |                      |                                                  |
// | 12.6 s       | hold                                                               | Wider view: no blind spot                |                      |                                                  |
// | 14.8 s       | the real warning appears on the curved glass                       | Smaller image, wider view                |                      | ink                                              |
// | 16.8–19.0 s  | LOOP: the mirrors merge, the bike and the map marks go, the glass  | —                                        | the glass            |                                                  |
// |              | flattens, the car drops back to 16 m: the last frame is frame 0     |                                          |                      |                                                  |
// Pairs to tell apart (colour-blind safe, tests): our car vs the car, the car vs the bike, our car vs the bike, the curved
// glass's view vs the flat one's.
import { prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Score } from './sfx.ts';
import { LAB, VIVID } from './palette.ts';
import type { Shown, VoiceLine } from './voice.ts';

export type V2 = [number, number];
export type V3 = [number, number, number];

const DEG = Math.PI / 180;
const unit = (v: V2): V2 => { const l = Math.hypot(v[0], v[1]); return [v[0] / l, v[1] / l]; };
const dot = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1];

// ---- the glass ----
export const R = 1.4, F = R / 2;                           // radius of curvature, focal length (convex: f = −F)
export const GLASS = { w: 0.18, h: 0.12 }, A = GLASS.w / 2;  // the glass, metres; A = its half-width
export const EYE: V2 = [0.5, -0.8], EYE_H = 1.15;          // the driver's eye: 0.5 m behind the glass, 0.8 m in
export const EP = Math.hypot(...EYE);
export const AIM = 9 * DEG;                                 // the eye's ray off the glass's centre heads 9° out from straight back

/** The law of reflection: r = i − 2(i·n)n. */
export const reflect = (i: V2, n: V2): V2 => { const k = 2 * dot(i, n); return [i[0] - k * n[0], i[1] - k * n[1]]; };
const I0: V2 = [-EYE[0] / EP, -EYE[1] / EP];
/** The glass's normal at its centre, set so the eye's ray reflects onto the aim. */
export const N0: V2 = unit([Math.cos(AIM) - I0[0], Math.sin(AIM) - I0[1]]);
const T0: V2 = [-N0[1], N0[0]];                             // along the glass, + = its outer edge

/** A point on the glass, s metres from its centre; k = 0 flat, k = 1 the wing mirror's sphere (radius R / k). */
export function mirrorPoint(s: number, k: number): V2 {
  if (k <= 0) return [s * T0[0], s * T0[1]];
  const Rk = R / k, sag = Rk - Math.sqrt(Rk * Rk - s * s);
  return [s * T0[0] - sag * N0[0], s * T0[1] - sag * N0[1]];
}
/** The glass's outward normal there: from the sphere's centre, R / k behind the glass. */
export function mirrorNormal(s: number, k: number): V2 {
  if (k <= 0) return N0;
  const Rk = R / k, P = mirrorPoint(s, k);
  return [(P[0] + Rk * N0[0]) / Rk, (P[1] + Rk * N0[1]) / Rk];
}

/** What the eye sees off the glass: the eye's rays to the glass's two edges, reflected (angles from straight back). */
export function viewWedge(k: number) {
  const edges = [-A, A].map(s => {
    const M = mirrorPoint(s, k), r = reflect(unit([M[0] - EYE[0], M[1] - EYE[1]]), mirrorNormal(s, k));
    return { M, r, a: Math.atan2(r[1], r[0]) };
  });
  const lo = Math.min(edges[0].a, edges[1].a), hi = Math.max(edges[0].a, edges[1].a);
  return { lo, hi, mid: (lo + hi) / 2, half: (hi - lo) / 2, edges };
}
/** How big things look in this glass against a flat one: the same glass spread over a wider view. */
export const shrink = (k: number) => Math.tan(viewWedge(0).half) / Math.tan(viewWedge(k).half);
/** The mirror formula's answer (paraxial): m = F/(u + F), image |v| = uF/(u + F) behind the glass; seen from the eye,
 *  its angular size against a flat mirror's (which shows the car u behind the glass, full size). */
export function sizeVsFlat(u: number, focal: number) {
  if (focal === Infinity) return 1;
  const m = focal / (u + focal), v = (u * focal) / (u + focal);
  return (m * (EP + u)) / (EP + v);
}
/** How far away a car looks (metres from the glass), judged by its size: a car of known size looks farther when smaller. */
export const apparent = (u: number, k: number) => (EP + u) / shrink(k) - EP;

/** The eye's mirror image: where a flat glass's view seems to come from (the glass camera stands here). */
export const EYE_IMAGE: V2 = (() => { const k = 2 * dot(EYE, N0); return [EYE[0] - k * N0[0], EYE[1] - k * N0[1]]; })();
/** Is a point (map) in the glass's view? */
export function inGlass(p: V2, k: number) {
  const w = viewWedge(k), a = Math.atan2(p[1] - EYE_IMAGE[1], p[0] - EYE_IMAGE[0]);
  return Math.abs(a - w.mid) < w.half;
}

// ---- the timeline ----
export const DURATION = 19.0, LOOP_AT = 16.8;
export const T_MORPH = 1.6, T_STOP = 8.0, ANSWER_AT = 8.4, T_SPLIT = 9.8, T_BIKE = 10.3, T_WARN = 14.8, COVER_T = 4.5;
export const LANE_Y = 2.2, U0 = 16, U1 = 12;               // the next lane's centre; the car's distance, start and end
export const LABEL = 'PHYSICS, VISUALISED  #9';
export const HEADER = ['Looks far. Really?'];
export const OPTIONS = ['A  closer', 'B  farther', 'C  same'], ANSWER = 0;
export const BRAND = 'PYQ Vault · pyqvault.com';
export const SECOND_Q = 'So why curve it at all?';

/** The first glass's curvature: it bulges from frame 0 and flattens again for the loop. */
export const morph = (t: number) => prog(t, 0, T_MORPH) * (1 - prog(t, LOOP_AT + 0.4, 1.4));
/** The split into two glasses (flat left, curved right), and back. */
export const split = (t: number) => prog(t, T_SPLIT, 0.6) * (1 - prog(t, LOOP_AT, 0.8));

/** The car's distance from the glass: 16 m → 12 m by 8 s, keeping pace with us, then dropping back for the loop. */
export const carU = (t: number) => U0 + (U1 - U0) * prog(t, 0, T_STOP) + (U0 - U1) * prog(t, LOOP_AT, DURATION - LOOP_AT - 0.2);
export const carPos = (t: number): V2 => { const u = carU(t); return [Math.sqrt(u * u - LANE_Y * LANE_Y), LANE_Y]; };

const fadeOut = (t: number, dur = 0.6) => 1 - prog(t, LOOP_AT, dur);
/** Where the car seems to be: in its lane, as far back as its size says. */
export function ghostAt(t: number) {
  const metres = apparent(carU(t), morph(t));
  return { pos: [Math.sqrt(metres * metres - LANE_Y * LANE_Y), LANE_Y] as V2, metres, alpha: prog(t, T_MORPH, 0.5) * fadeOut(t) };
}
/** Where it really is: on the map from the answer. */
export const realAt = (t: number) => ({ pos: carPos(t), metres: carU(t), alpha: prog(t, ANSWER_AT, 0.25) * fadeOut(t) });

/** The motorbike: rides up from 20 m back into the blind spot, 6 m back and 17° out, then drops back for the loop. */
export const BIKE_REST: V2 = [6 * Math.cos(17 * DEG), 6 * Math.sin(17 * DEG)];
const BIKE_FROM = 20;
export function bikeAt(t: number) {
  const x = BIKE_FROM + (BIKE_REST[0] - BIKE_FROM) * prog(t, T_BIKE, 1.8) + (BIKE_FROM - BIKE_REST[0]) * prog(t, LOOP_AT, 1.2);
  return { pos: [x, BIKE_REST[1]] as V2, alpha: prog(t, T_BIKE, 0.3) * (1 - prog(t, LOOP_AT + 0.6, 0.6)) };
}
export const wedgesAlpha = (t: number) => prog(t, T_SPLIT + 0.2, 0.5) * fadeOut(t);
export const warnAlpha = (t: number) => prog(t, T_WARN, 0.5) * fadeOut(t, 0.5);

// ---- the glass camera (the view inside each glass) ----
/** A camera at the eye's mirror image, aimed at the middle of the glass's view, as wide as it; three.js axes are
 *  (y, height, x). The page flips its picture left–right, as a mirror does. */
export function glassCamera(k: number) {
  const w = viewWedge(k), aspect = GLASS.w / GLASS.h, pitch = -1.2 * DEG;
  const position: V3 = [EYE_IMAGE[1], EYE_H, EYE_IMAGE[0]];
  const target: V3 = [position[0] + 10 * Math.sin(w.mid), EYE_H + 10 * Math.tan(pitch), position[2] + 10 * Math.cos(w.mid)];
  return { position, target, fov: (2 * Math.atan(Math.tan(w.half) / aspect)) / DEG, aspect };
}

// ---- the main band: the wing mirror(s) seen from the driver's seat ----
export const BAND = { top: 440, width: 1080, height: 700 };
const DIST = 0.55, FOV = 30, SEP = 0.14;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1.2, 0, 0],                                       // [zoom, look-at x, look-at y]
  keys: [
    { t: 0, dur: T_STOP, to: [1.26, 0, 0] },
    { t: T_SPLIT, dur: 0.6, to: [0.84, 0, 0] },
    { t: LOOP_AT, dur: 1.4, to: [1.2, 0, 0] },
  ],
};
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
export function mainCameraAt(t: number): Camera {
  const [zoom, lx, ly] = tween(t, CAMERA.start, CAMERA.keys);
  return { position: [lx, ly, DIST / zoom], target: [lx, ly, 0], up: [0, 1, 0], fov: FOV, aspect: BAND.width / BAND.height };
}
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit3 = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
/** Where a 3D point lands on the 1080 × 1920 page. */
export function project(p: V3, cam: Camera) {
  const f = unit3(sub(cam.target, cam.position)), r = unit3(cross(f, cam.up)), u = cross(r, f), d = sub(p, cam.position);
  const depth = dot3(d, f), k = Math.tan((cam.fov * Math.PI) / 360);
  const xn = dot3(d, r) / (depth * k * cam.aspect), yn = dot3(d, u) / (depth * k);
  return { x: ((xn + 1) / 2) * BAND.width, y: BAND.top + ((1 - yn) / 2) * BAND.height, depth };
}
export const FACE_Z = 0.0;                                   // the glass's face; the housing sits behind it
/** Each glass on the page: [flat (left, only once split), curved (right)], with its 3D centre and curvature. */
export function mirrorsAt(t: number) {
  const cam = mainCameraAt(t), s = split(t);
  return [{ cx: -SEP * s, k: 0, alpha: Math.min(1, s * 3) }, { cx: SEP * s, k: morph(t), alpha: 1 }].map(m => {
    const a = project([m.cx - GLASS.w / 2, GLASS.h / 2, FACE_Z], cam), b = project([m.cx + GLASS.w / 2, -GLASS.h / 2, FACE_Z], cam);
    return { ...m, x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y };
  });
}

// ---- the map (the bottom card) ----
export const MAP = { left: 100, right: 980, top: 1160, bottom: 1520, x0: -3, x1: 47, yMid: 1.0, cy: 1352 };
const MS = (MAP.right - MAP.left) / (MAP.x1 - MAP.x0);
export const MAP_SCALE = MS;
/** Map metres → page pixels: back along the road to the right, out from our car upwards. */
export const mapPx = (p: V2) => ({ x: MAP.left + (p[0] - MAP.x0) * MS, y: MAP.cy - (p[1] - MAP.yMid) * MS });

// ---- colours (F24) ----
const V = VIVID.lab;
export const COLOURS = {
  ownCar: V.red, car: V.blue, bike: V.yellow, curved: V.cyan, flat: LAB.ink,
  sky: '#9cc7ec', asphalt: '#4a4f57', line: '#eef1f4', grass: '#4caf47', tyre: '#15181d', window: '#1c2430', pole: '#9aa1a9',
} as const;

// ---- words, voice, sound ----
export const CAPTIONS: Caption[] = [
  { t0: 2.0, t1: 5.2, text: 'Curved glass shrinks everything' },
  { t0: 5.2, t1: ANSWER_AT, text: 'Smaller looks farther away' },
  { t0: ANSWER_AT, t1: T_SPLIT, text: 'It’s closer than it looks!' },
  { t0: T_SPLIT, t1: 12.6, text: SECOND_Q },
  { t0: 12.6, t1: T_WARN, text: 'Wider view: no blind spot' },
  { t0: T_WARN, t1: LOOP_AT, text: 'Smaller image, wider view' },
];
export const SECOND_HOOK = CAPTIONS[3];
export const WARNING = ['OBJECTS IN MIRROR ARE', 'CLOSER THAN THEY APPEAR'];
export const SHOWN: Shown[] = [{ t0: 0, t1: DURATION, text: HEADER.join('\n') }, ...CAPTIONS];
export const VOICE: VoiceLine[] = [
  { t: 0.15, until: CAPTIONS[0].t0, text: HEADER.join(' ') },
  ...CAPTIONS.map(c => ({ t: c.t0 + 0.1, until: c.t1, text: c.text })),
];
export const MUSIC_HITS = [ANSWER_AT, T_SPLIT];

// Sound from the picture: a shimmer as the glass bulges, the car's hum as it moves (and the bike's), a thunk as the real
// car lands on the map, a snap as the mirror splits; whooshes on the fast zooms.
const speed = (f: (t: number) => number) => (t: number) => Math.abs(f(t + 1 / 120) - f(t - 1 / 120)) * 60;
const carSpeed = speed(carU), bikeSpeed = speed(t => bikeAt(t).pos[0]);
const CAR_MAX = (2 * (U0 - U1)) / T_STOP, BIKE_MAX = (2 * (BIKE_FROM - BIKE_REST[0])) / 1.8;
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    { kind: 'shimmer' as const, t: 0, gain: 0.5 },
    { kind: 'thunk' as const, t: ANSWER_AT, gain: 0.55 },
    { kind: 'snap' as const, t: T_SPLIT, gain: 0.5 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ].sort((a, b) => a.t - b.t),
  beds: [
    { kind: 'roar', t0: 0, t1: T_STOP, level: t => 0.5 * carSpeed(t) / CAR_MAX },
    { kind: 'roar', t0: T_BIKE, t1: T_BIKE + 1.8, level: t => 0.45 * bikeSpeed(t) / BIKE_MAX },
    { kind: 'roar', t0: LOOP_AT, t1: DURATION, level: t => 0.3 * carSpeed(t) / CAR_MAX },
  ],
};

const r6 = (v: number) => Math.round(v * 1e6) / 1e6;
export const loopState = (t: number) => ({
  mirrors: mirrorsAt(t).map(m => [m.k, m.alpha, m.x, m.y, m.w, m.h].map(r6)),
  car: r6(carU(t)), marks: [ghostAt(t).alpha, realAt(t).alpha, bikeAt(t).alpha, wedgesAlpha(t), warnAlpha(t)].map(r6),
  camera: mainCameraAt(t).position.map(r6), caption: CAPTIONS.some(c => t >= c.t0 && t < c.t1),
});
