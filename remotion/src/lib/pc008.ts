// @pyqvault_ · Chemistry, visualised #8 (predict-first): stack oranges in a box: the best you can fill it? 74%.
// Class 12 Chemistry · Solid State (MHT-CET: 49 PYQs on packing and voids). One cubic unit cell, edge A, three ways:
// simple cubic (8 corners, r = a/2, π/6 = 52.4%), body-centred (+ the centre, r = √3a/4, √3π/8 = 68%), face-centred
// (+ 6 faces, r = a/(2√2), π/(3√2) = 74%). Each orange is cut by the box's faces (1/8 of a corner one inside, ½ of a face
// one, all of the centre one), so the live fill is the real share of the box on every frame; the radii change between
// stackings without any two oranges overlapping. Then the fruit-seller's pyramid (9 + 4 + 1, face-centred) and its
// oranges turn copper: copper and gold atoms stack this way. Backlog C14 (7/10, our own idea from the CET notes).
// Framework v1.13 (F24: VIVID.lab on the dark board). Pure functions of t; world units, the cell centred at the origin.
//
// BEAT TABLE (runbook step 1). Voice lengths are Kokoro af_heart, measured (runbook step 3).
// | time        | what moves                                                | caption (voice)                              | keep in frame         | colours (VIVID.lab)                 |
// | 0–3.25 s    | 360° orbit; eight oranges drop into the box's corners      | question + A/B/C (2.95 s)                    | box + oranges         | oranges orange, box edges cyan      |
// | 3.25–5.7 s  | straight rows: the parts outside the box fade; 52.4%       | Straight rows: 52% filled (2.30 s)           | box + oranges         | outside parts ghost orange          |
// | 5.7–8.1 s   | corners shrink, one grows in the middle; 68%               | One in the middle: 68% (2.25 s)              | box + oranges         | bars: green                         |
// | 8.1–9.5 s   | middle shrinks away, six grow on the faces; 74%            | One on each face (1.18 s)                    | box + oranges         |                                     |
// | 9.5 s       | punch-in; "C 74%" lights                                   | 74%: the best way to stack (2.40 s)          | box + oranges         |                                     |
// | 11.7–12.1 s | the box fades; zoom out                                     |                                              | pyramid               |                                     |
// | 12.1 s      | the fruit-seller's pyramid builds, orange by orange        | The fruit-seller’s pyramid is 74% (2.68 s)   | pyramid               |                                     |
// | 15.1 s      | the pyramid's oranges turn copper                          | Copper and gold atoms stack this way (2.13 s)| pyramid               | copper (a known material)           |
// | 17.6 s      | end card                                                   |                                              |                       |                                     |
import { clamp01, prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import type { Shown, VoiceLine } from './voice.ts';

export type V3 = [number, number, number];

export const DURATION = 20.1, END_AT = 17.6;
export const A = 1.6, HALF = A / 2;
export const HEADER = ['Stack oranges in a box.', 'The best you can fill it?'];
export const OPTIONS = ['A  52%', 'B  68%', 'C  74%'], ANSWER = 2;

export const FILLS = { sc: Math.PI / 6, bcc: (Math.sqrt(3) * Math.PI) / 8, fcc: Math.PI / (3 * Math.SQRT2) };
const R_SC = A / 2, R_BCC = (Math.sqrt(3) * A) / 4, R_FCC = A / (2 * Math.SQRT2);

export const CORNERS: V3[] = [-1, 1].flatMap(x => [-1, 1].flatMap(y => [-1, 1].map(z => [x * HALF, y * HALF, z * HALF] as V3)));
export const FACES: V3[] = [0, 1, 2].flatMap(k => [-1, 1].map(s => { const p: V3 = [0, 0, 0]; p[k] = s * HALF; return p; }));
export const BODY: V3 = [0, 0, 0];

// Timed from the measured voice: each stacking holds as long as its line takes to say ("52%" is read in full).
export const T_DROP_END = 3.0, T_SC = 3.25, T_BCC0 = 5.7, T_BCC1 = 6.5, T_FCC0 = 8.1, T_FCC1 = 8.9, ANSWER_AT = 9.5;
export const T_CELL_OUT = 11.7, T_PYR = 12.1, T_METAL = 15.1;

/** The oranges' radii now. Between stackings they change linearly in the eased progress, and never overlap: corners
 *  with the centre stay ≤ √3a/2 apart in radius sum, corners with faces ≤ a/√2, faces with the centre ≤ a/2. */
export function radiiAt(t: number) {
  const p1 = prog(t, T_BCC0, T_BCC1 - T_BCC0), p2 = prog(t, T_FCC0, T_FCC1 - T_FCC0);
  return { corner: R_SC + (R_BCC - R_SC) * p1 + (R_FCC - R_BCC) * p2, body: R_BCC * p1 * (1 - p2), face: R_FCC * p2 };
}
/** The share of the box filled with orange: 1/8 of each corner orange, ½ of each face one, all of the centre one. */
export function fillAt(t: number) {
  const r = radiiAt(t);
  return ((4 / 3) * Math.PI * (r.corner ** 3 + 3 * r.face ** 3 + r.body ** 3)) / A ** 3;
}
/** The three bars (simple cubic, bcc, fcc): each counts up to its value once its stacking has settled. */
export const barsAt = (t: number) => [FILLS.sc * prog(t, T_SC, 0.5), FILLS.bcc * prog(t, T_BCC1, 0.5), FILLS.fcc * prog(t, T_FCC1, 0.3)];

// The opening: the eight oranges drop into the corners one after another, falling (y = h(1 − s²)), the last landing at
// 2.98 s, so something moves on every frame while the camera orbits.
const DROP_H = 1.3, DROP_DUR = 0.5, dropStart = (i: number) => 0.1 + i * 0.34;
export const dropY = (i: number, t: number) => DROP_H * (1 - clamp01((t - dropStart(i)) / DROP_DUR) ** 2);

// The fruit-seller's pyramid: 3 × 3, then 2 × 2 in the hollows, then 1 on top: face-centred stacking, each orange touching
// its neighbours (layer height d/√2). It builds orange by orange, then turns copper.
export const PYR_R = 0.32, FLOOR = -0.95;
const D = 2 * PYR_R;
export const PYRAMID: V3[] = [
  ...[-1, 0, 1].flatMap(i => [-1, 0, 1].map(j => [i * D, FLOOR + PYR_R, j * D] as V3)),
  ...[-0.5, 0.5].flatMap(i => [-0.5, 0.5].map(j => [i * D, FLOOR + PYR_R + D / Math.SQRT2, j * D] as V3)),
  [0, FLOOR + PYR_R + 2 * (D / Math.SQRT2), 0],
];
const pyrStart = (k: number) => T_PYR + 0.12 * k;
export const pyramidDrop = (k: number, t: number) => 1.8 * (1 - clamp01((t - pyrStart(k)) / 0.4) ** 2);
export const metalAt = (t: number) => prog(t, T_METAL, 0.8);

// The 3D band and camera: [zoom, orbit angle (rad), look-at y]. The orbit (F22): a full turn from frame 0, back at the
// three-quarter front view by 2.8 s; a slow push through the three stackings; a punch-in landing on 74%; a quick zoom out
// for the pyramid; a slow push as it turns copper.
export const BAND = { top: 440, width: 1080, height: 680 };
const DIST = 10.5, EL = (24 * Math.PI) / 180, FOV = 30, AZ = 0.62;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [0.9, AZ - 2 * Math.PI, 0],
  keys: [
    { t: 0, dur: 2.8, to: [1.0, AZ, 0] },
    { t: 3.2, dur: 5.6, to: [1.12, AZ, 0] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.36, AZ, 0] },
    { t: T_CELL_OUT, dur: 0.8, to: [0.98, AZ, -0.1] },
    { t: T_METAL, dur: 2.8, to: [1.12, AZ, -0.05] },
  ],
};
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
export function cameraAt(t: number): Camera {
  const [zoom, az, ly] = tween(t, CAMERA.start, CAMERA.keys), d = DIST / zoom;
  return {
    position: [d * Math.sin(az) * Math.cos(EL), ly + d * Math.sin(EL), d * Math.cos(az) * Math.cos(EL)],
    target: [0, ly, 0], up: [0, 1, 0], fov: FOV, aspect: BAND.width / BAND.height,
  };
}
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit3 = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
export function project(p: V3, cam: Camera) {
  const f = unit3(sub(cam.target, cam.position)), r = unit3(cross(f, cam.up)), u = cross(r, f), d = sub(p, cam.position);
  const depth = dot(d, f), k = Math.tan((cam.fov * Math.PI) / 360);
  const xn = dot(d, r) / (depth * k * cam.aspect), yn = dot(d, u) / (depth * k);
  return { x: ((xn + 1) / 2) * BAND.width, y: BAND.top + ((1 - yn) / 2) * BAND.height, depth };
}

export const COVER_T = 4.0;

export const CAPTIONS: Caption[] = [
  { t0: T_SC, t1: T_BCC0, text: 'Straight rows: 52% filled' },
  { t0: T_BCC0, t1: T_FCC0, text: 'One in the middle: 68%' },
  { t0: T_FCC0, t1: ANSWER_AT, text: 'One on each face' },
  { t0: ANSWER_AT, t1: T_PYR, text: '74%: the best way to stack' },
  { t0: T_PYR, t1: T_METAL, text: 'The fruit-seller’s pyramid is 74%' },
  { t0: T_METAL, t1: END_AT, text: 'Copper and gold atoms stack this way', size: 44 },
];
export const SHOWN: Shown[] = [{ t0: 0, t1: END_AT, text: HEADER.join('\n') }, ...CAPTIONS];
export const VOICE: VoiceLine[] = [
  { t: 0.15, until: CAPTIONS[0].t0, text: HEADER.join(' ') },
  ...CAPTIONS.map(c => ({ t: c.t0 + 0.1, until: c.t1, text: c.text })),
];
export const MUSIC_HITS = [ANSWER_AT];

// Sound from the picture: a soft thud as each orange lands (the eight in the box, the fourteen in the pyramid), whooshes
// on the fast zooms. Changing size is silent.
const thud = (t: number): Hit => ({ kind: 'thunk', t, gain: 0.14 });
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...[...Array(8).keys()].map(i => thud(dropStart(i) + DROP_DUR)),
    ...[...Array(14).keys()].map(k => thud(pyrStart(k) + 0.4)),
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [],
};
