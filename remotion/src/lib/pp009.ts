// @pyqvault_ · Physics, visualised #9 (predict-first): a car in your wing mirror: is it closer or farther than it looks?
// Closer. Class 12 Physics · Ray Optics: a wing mirror is a convex mirror (f = −F). 1/v + 1/u = 1/f gives v = −uF/(u + F),
// behind the glass and within F, and m = F/(u + F): upright and always smaller. From the driver's seat the car then looks
// smaller than a flat mirror would show it (angular size ratio m(d + u)/(d + |v|) < 1), so it looks farther away. The
// convex glass also reflects a wider view. Backlog P29 (topic score 7/10; @bisal.physics' convex-mirror reel 6.2×).
// Framework v1.13 (F24 bright objects, dark board → VIVID.lab). Pure functions of t; world units with F = 1, the axis
// along the road (x), the mirror facing +x.
//
// BEAT TABLE (runbook step 1). Voice lengths are Kokoro af_heart, measured (runbook step 3).
// | time       | what moves                                              | caption (voice)                              | keep in frame               | colours (VIVID.lab)                 |
// | 0–2.8 s    | 360° orbit; the car drives in, wheels turning           | question + A/B/C (3.53 s)                     | mirror, car                 | car blue, housing red, glass steel  |
// | 3.0–3.9 s  | five rays draw from the car's roof to the glass and out  | —                                            | mirror, car                 | rays cyan/pink/yellow/green/violet  |
// | 3.8 s →    | a small upright image car behind the glass, dashed lines | Its image: upright, but small (1.90 s)       | mirror, car, image          | image car blue (ghost)              |
// | 6.0–8.0 s  | the car keeps coming; the image grows, stays smaller     | Even up close: always smaller (1.88 s)       | mirror, car, image          | graph orange curve, ×1 line muted   |
// | 8.6 s      | punch-in; "A closer" lights; "what you see" panel        | Smaller looks farther: it's closer! (2.17 s)  | mirror, car, image          | panel: flat vs wing (green)         |
// | 11.4 s     | zoom out; the eye's view off flat glass vs convex glass  | But you see far more road (1.34 s)            | mirror, car, eye            | convex wedge green, flat outline    |
// | 14.4 s     | the warning appears on the wing frame in the panel       | That's why the glass warns you (1.50 s)       | mirror, car, eye            | warning text ink                    |
// | 16.3 s     | slow push                                                | Convex: smaller image, wider view (2.31 s)    | mirror, car                 |                                     |
// | 18.8 s     | end card                                                 |                                              |                             |                                     |
import { clamp01, prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Score } from './sfx.ts';
import type { Shown, VoiceLine } from './voice.ts';

export type V2 = [number, number];
export type V3 = [number, number, number];

export const DURATION = 21.3, END_AT = 18.8;
export const F = 1, R = 2 * F;                                  // focal length (magnitude); radius of curvature
export const POLE_X = -1.6, APERTURE = 0.62;                     // the glass's centre on the axis; its half-height
export const H = 0.55, CAR_L = 0.9, WHEEL_R = 0.1;               // the car's roof height and length; wheel radius
export const U_START = 3.6, U_END = 0.9;
export const HEADER = ['A car in your wing mirror.', 'Is it closer or farther than it looks?'];
export const OPTIONS = ['A  closer', 'B  farther', 'C  same'], ANSWER = 0;

/** The mirror formula with f = −F (convex): v = −uF/(u + F), negative = behind the glass. */
export const imageDistance = (u: number) => (u * -F) / (u + F);
/** m = −v/u = F/(u + F): positive (upright) and below 1 (smaller) for every u. */
export const magnification = (u: number) => -imageDistance(u) / u;
/** The glass at height y: a sphere of radius R round C = pole − R, bulging out towards the road. */
export const mirrorX = (y: number) => POLE_X - (R - Math.sqrt(R * R - y * y));
/** The outward normal of the glass at height y (unit). */
export const mirrorNormal = (y: number): V2 => [(mirrorX(y) - (POLE_X - R)) / R, y / R];

// The car drives in from frame 0 and stops before the answer.
export const T_RAYS = 3.0, T_STOP = 8.0, ANSWER_AT = 8.6, T_VIEW = 11.4, T_WARN = 14.4;
export const uAt = (t: number) => U_START + (U_END - U_START) * prog(t, 0, T_STOP);
/** How far the wheels have turned (rad): the distance driven over the wheel's radius. */
export const wheelTurn = (t: number) => (U_START - uAt(t)) / WHEEL_R;

export const raysDrawn = (t: number) => clamp01((t - T_RAYS) / 0.9);

/** The image now: where its roof is, how big, how visible. Always behind the glass, upright and smaller. */
export function imageAt(t: number) {
  const u = uAt(t), v = imageDistance(u), m = magnification(u);
  return { u, v, m, x: POLE_X + v, y: m * H, alpha: prog(t, T_RAYS + 0.8, 0.3) };
}

export type Ray = { rule: 'parallel' | 'pole' | null; inc: [V2, V2]; out: [V2, V2]; back: [V2, V2] };
const FAN: { y: number; rule: Ray['rule'] }[] = [
  { y: H, rule: 'parallel' }, { y: 0, rule: 'pole' }, { y: -0.5, rule: null }, { y: -0.25, rule: null }, { y: 0.3, rule: null },
];
const unit = (x: number, y: number): V2 => { const l = Math.hypot(x, y); return [x / l, y / l]; };

/** Five rays from the car's roof to the glass; each reflection heads back out as if from the image behind the glass
 *  (a dashed line back to it). */
export function rayPaths(t: number): Ray[] {
  const im = imageAt(t), tip: V2 = [POLE_X + im.u, H], img: V2 = [im.x, im.y];
  return FAN.map(({ y, rule }) => {
    const M: V2 = [mirrorX(y), y], d = unit(M[0] - img[0], M[1] - img[1]);
    return { rule, inc: [tip, M], out: [M, [M[0] + d[0] * 3.2, M[1] + d[1] * 3.2]], back: [M, img] };
  });
}

// The driver's eye (in the car, ahead of the mirror) and what it sees.
export const EYE: V2 = [POLE_X + 1.3, -0.8];
export const eyeDistance = Math.hypot(EYE[0] - POLE_X, EYE[1]);
/** How big the car looks in this mirror compared with a flat one, from the driver's seat (angular sizes): a flat mirror
 *  shows it full size u behind the glass, seen from d + u; this one m times as tall, |v| behind, seen from d + |v|. */
export const sizeVsFlat = (u: number) => (magnification(u) * (eyeDistance + u)) / (eyeDistance - imageDistance(u));

/** The eye's view, reflected off the glass's top and bottom edges by the reflection law (r = i − 2(i·n)n): a flat
 *  mirror's normal is +x, the convex glass's tilts out towards its edges, so its view fans wider. */
export function viewWedge(kind: 'flat' | 'convex') {
  const edge = (y: number): [V2, V2] => {
    const M: V2 = kind === 'flat' ? [POLE_X, y] : [mirrorX(y), y], n = kind === 'flat' ? [1, 0] : mirrorNormal(y);
    const i = unit(M[0] - EYE[0], M[1] - EYE[1]), k = 2 * (i[0] * n[0] + i[1] * n[1]);
    return [M, [i[0] - k * n[0], i[1] - k * n[1]]];
  };
  return { top: edge(APERTURE), bottom: edge(-APERTURE) };
}

// The 3D band and camera: [zoom, look-at x, orbit angle (rad, 0 = front), look-at y]. The orbit (F22) from frame 0 back at
// the front by 2.8 s; a slow push while the car comes; a punch-in landing on the answer (car, glass and image together);
// a quick zoom out for the view wedges; a slow push for the last line.
export const BAND = { top: 440, width: 1080, height: 680 };
const DIST = 6.6, EL = (8 * Math.PI) / 180, FOV = 30;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [0.92, 0.1, -2 * Math.PI, 0.1],
  keys: [
    { t: 0, dur: 2.8, to: [1.0, 0.1, 0, 0.1] },
    { t: 3.6, dur: 4.4, to: [1.12, -0.3, 0, 0.1] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.45, -1.3, 0, 0.12] },
    { t: T_VIEW - 0.2, dur: 0.8, to: [0.95, -0.2, 0, 0.25] },
    { t: T_WARN, dur: 2.6, to: [1.06, -0.4, 0, 0.15] },
  ],
};
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
export function cameraAt(t: number): Camera {
  const [zoom, lx, az, ly] = tween(t, CAMERA.start, CAMERA.keys), d = DIST / zoom;
  return {
    position: [lx + d * Math.sin(az) * Math.cos(EL), ly + d * Math.sin(EL), d * Math.cos(az) * Math.cos(EL)],
    target: [lx, ly, 0], up: [0, 1, 0], fov: FOV, aspect: BAND.width / BAND.height,
  };
}
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit3 = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
/** Where a 3D point lands on the 1080 × 1920 page. */
export function project(p: V3, cam: Camera) {
  const f = unit3(sub(cam.target, cam.position)), r = unit3(cross(f, cam.up)), u = cross(r, f), d = sub(p, cam.position);
  const depth = dot(d, f), k = Math.tan((cam.fov * Math.PI) / 360);
  const xn = dot(d, r) / (depth * k * cam.aspect), yn = dot(d, u) / (depth * k);
  return { x: ((xn + 1) / 2) * BAND.width, y: BAND.top + ((1 - yn) / 2) * BAND.height, depth };
}

export const COVER_T = 4.5;

export const CAPTIONS: Caption[] = [
  { t0: 4.0, t1: 6.1, text: 'Its image: upright, but small' },
  { t0: 6.1, t1: ANSWER_AT, text: 'Even up close: always smaller' },
  { t0: ANSWER_AT, t1: T_VIEW, text: 'Smaller looks farther: it’s closer!' },
  { t0: T_VIEW, t1: T_WARN, text: 'But you see far more road' },
  { t0: T_WARN, t1: 16.3, text: 'That’s why the glass warns you' },
  { t0: 16.3, t1: END_AT, text: 'Convex: smaller image, wider view' },
];
export const SHOWN: Shown[] = [{ t0: 0, t1: END_AT, text: HEADER.join('\n') }, ...CAPTIONS];
export const VOICE: VoiceLine[] = [
  { t: 0.15, until: CAPTIONS[0].t0, text: HEADER.join(' ') },
  ...CAPTIONS.map(c => ({ t: c.t0 + 0.1, until: c.t1, text: c.text })),
];
export const MUSIC_HITS = [ANSWER_AT];

// Sound from the picture: the car's engine hums as loud as it moves (a low rumble, the "roar" bed under the music) and
// stops with it; whooshes on the fast zooms. Light is silent.
const speed = (t: number) => Math.abs(uAt(t + 1 / 120) - uAt(t - 1 / 120)) * 60;
const V_MAX = (2 * (U_START - U_END)) / T_STOP;
export const SOUND: Score = {
  duration: DURATION,
  hits: whooshesFor(CAMERA.start, CAMERA.keys),
  beds: [{ kind: 'roar', t0: 0, t1: T_STOP, level: t => 0.7 * speed(t) / V_MAX }],
};
