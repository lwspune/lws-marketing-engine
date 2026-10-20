// @pyqvault_ · Physics, visualised #8 (predict-first): in a spoon a flame looks upside down; bring it close and the image
// turns upright and bigger. Class 12 Physics · Ray Optics: a spoon's bowl is a concave mirror, 1/v + 1/u = 1/f and
// m = −v/u (real-is-positive). Far beyond F the image is real and inverted; at F the rays leave parallel and there is no
// image; inside F it is virtual, behind the mirror, upright and magnified (×2.5 at u = 0.6f). Backlog P24 (topic score
// 7/10; @bisal.physics' concave-mirror reel 10.5×). Framework v1.11: the first 360° opening orbit (F22) and the first
// caption without the answer (F6, L45). Pure functions of t; world units with f = 1, the axis along x, the bowl facing +x.
import { clamp01, prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Score } from './sfx.ts';
import type { Shown, VoiceLine } from './voice.ts';

export type V2 = [number, number];
export type V3 = [number, number, number];

export const DURATION = 20.4, END_AT = 18.0;
export const F = 1, R = 2 * F;                                  // focal length; the bowl's radius of curvature
export const POLE_X = -1.0, H = 0.5, APERTURE = 0.95;           // the bowl's centre on the axis; flame tip height; bowl half-height
export const U_START = 2.5 * F, U_END = 0.6 * F;
export const HEADER = ['In a spoon, a flame looks upside down.', 'Bring it close. Now it’s…'];
export const OPTIONS = ['A  upside down', 'B  upright', 'C  vanishes'], ANSWER = 1;

/** The mirror formula, 1/v + 1/u = 1/f, solved for v (negative = behind the mirror, a virtual image). */
export const imageDistance = (u: number) => (u * F) / (u - F);
/** m = −v/u: negative = upside down, positive = upright; |m| > 1 = bigger. */
export const magnification = (u: number) => -imageDistance(u) / u;
/** The bowl's surface at height y (a sphere of radius R round C = pole + R). */
export const mirrorX = (y: number) => POLE_X + R - Math.sqrt(R * R - y * y);

// The candle: still while the camera orbits and the rays draw, slides in to F, holds there (rays parallel, no image),
// then moves inside F and stops: the upright image is the answer.
export const T_RAYS = 3.0, T_SLIDE0 = 4.4, T_AT_F = 7.8, T_LEAVE_F = 8.8, ANSWER_AT = 9.6;
export const uAt = (t: number) => t < T_AT_F
  ? U_START + (F - U_START) * prog(t, T_SLIDE0, T_AT_F - T_SLIDE0)
  : F + (U_END - F) * prog(t, T_LEAVE_F, ANSWER_AT - T_LEAVE_F);

/** How far the light has travelled (0…1): flame → bowl over the first half, bowl → image over the second. */
export const raysDrawn = (t: number) => clamp01((t - T_RAYS) / 0.9);

/** The image now: where its tip is, how big, and how visible (it fades out where it would leave the frame). */
export function imageAt(t: number) {
  const u = uAt(t), atF = Math.abs(u - F) < 1e-9, v = atF ? Infinity : imageDistance(u), m = atF ? -Infinity : magnification(u);
  const virtual = v < 0, appear = prog(t, T_RAYS + 0.8, 0.3);
  const fit = atF ? 0 : virtual ? clamp01((3.0 - m) / 0.35) : clamp01((3.4 - v) / 0.6);
  return { u, v, m, virtual, x: POLE_X + v, y: m * H, alpha: appear * fit };
}

export type Ray = { rule: 'parallel' | 'pole' | null; inc: [V2, V2]; out: [V2, V2]; back?: [V2, V2] };
const FAN: { y: number; rule: Ray['rule'] }[] = [
  { y: H, rule: 'parallel' }, { y: 0, rule: 'pole' }, { y: -0.85, rule: null }, { y: -0.5, rule: null }, { y: 0.25, rule: null }, { y: 0.8, rule: null },
];
const unit = (x: number, y: number): V2 => { const l = Math.hypot(x, y); return [x / l, y / l]; };

/** Six rays from the flame's tip to the bowl and on: towards the real image (and past it), or away from the virtual one
 *  with a dashed line back to it. At F every reflected ray leaves parallel to the pole ray's reflection. */
export function rayPaths(t: number): Ray[] {
  const im = imageAt(t), tip: V2 = [POLE_X + im.u, H], atF = !Number.isFinite(im.v);
  return FAN.map(({ y, rule }) => {
    const M: V2 = [mirrorX(y), y], img: V2 = [im.x, im.y];
    let d: V2, len: number;
    if (atF) { d = unit(F, -H); len = 8; }
    else if (im.virtual) { d = unit(M[0] - img[0], M[1] - img[1]); len = 4.2; }
    else { d = unit(img[0] - M[0], img[1] - M[1]); len = Math.min(Math.hypot(img[0] - M[0], img[1] - M[1]) + 1.0, 8); }
    const ray: Ray = { rule, inc: [tip, M], out: [M, [M[0] + d[0] * len, M[1] + d[1] * len]] };
    if (im.virtual) ray.back = [M, img];
    return ray;
  });
}

/** The flame's flicker (0…1), different on every frame. */
export const flicker = (t: number) => 0.5 + 0.25 * Math.sin(t * 23) + 0.15 * Math.sin(t * 37 + 1) + 0.1 * Math.sin(t * 61 + 2);

// The 3D band and camera. Camera values: [zoom, look-at x, orbit angle (rad, 0 = front), look-at y]. The orbit (F22):
// a full turn round the bench from frame 0, eased, back at the front at 2.8 s, before the rays draw. Then a slow push
// while the candle slides, a punch-in landing on the upright image (the answer), a quick zoom out, a slow push for "your
// eye traces the rays back".
export const BAND = { top: 440, width: 1080, height: 680 };
const DIST = 6.6, EL = (8 * Math.PI) / 180, FOV = 30;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [0.92, -0.4, -2 * Math.PI, 0.1],
  keys: [
    { t: 0, dur: 2.8, to: [1.0, -0.4, 0, 0.1] },
    { t: T_SLIDE0, dur: 3.4, to: [1.1, -0.15, 0, 0] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.32, -1.25, 0, 0.42] },
    { t: 11.6, dur: 0.8, to: [1.0, -0.85, 0, 0.2] },
    { t: 13.0, dur: 3.0, to: [1.08, -0.95, 0, 0.15] },
  ],
};
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
export function cameraAt(t: number, values = tweenCamera(t)): Camera {
  const [zoom, lx, az, ly] = values, d = DIST / zoom, target: V3 = [lx, ly, 0];
  return {
    position: [lx + d * Math.sin(az) * Math.cos(EL), ly + d * Math.sin(EL), d * Math.cos(az) * Math.cos(EL)],
    target, up: [0, 1, 0], fov: FOV, aspect: BAND.width / BAND.height,
  };
}
const tweenCamera = (t: number) => tween(t, CAMERA.start, CAMERA.keys);

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit3 = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
/** Where a 3D point lands on the 1080 × 1920 page (for the F and C labels drawn over the 3D band). */
export function project(p: V3, cam: Camera) {
  const f = unit3(sub(cam.target, cam.position)), r = unit3(cross(f, cam.up)), u = cross(r, f), d = sub(p, cam.position);
  const depth = dot(d, f), k = Math.tan((cam.fov * Math.PI) / 360);
  const xn = dot(d, r) / (depth * k * cam.aspect), yn = dot(d, u) / (depth * k);
  return { x: ((xn + 1) / 2) * BAND.width, y: BAND.top + ((1 - yn) / 2) * BAND.height, depth };
}

/** Where the eye sits for "your eye traces the rays back": in the spreading reflected light, below and right. */
export const EYE: V2 = [1.2, -0.95];
export const COVER_T = 4.3;

export const CAPTIONS: Caption[] = [
  { t0: 4.1, t1: 5.95, text: 'Far: upside down and small' },
  { t0: 5.95, t1: T_AT_F, text: 'Closer: bigger, still flipped' },
  { t0: T_AT_F, t1: ANSWER_AT, text: 'At F the rays never meet' },
  { t0: ANSWER_AT, t1: 12.4, text: 'Inside F: upright and bigger!' },
  { t0: 12.4, t1: 15.2, text: 'Your eye traces the rays back' },
  { t0: 15.2, t1: END_AT, text: 'That’s how make-up mirrors magnify' },
];
// What is on screen when: the question stays up until the end card; each caption for its slot.
export const SHOWN: Shown[] = [{ t0: 0, t1: END_AT, text: HEADER.join('\n') }, ...CAPTIONS];
// The voiceover reads the question from frame 0, then each caption just after it appears.
export const VOICE: VoiceLine[] = [
  { t: 0.15, until: CAPTIONS[0].t0, text: HEADER.join(' ') },
  ...CAPTIONS.map(c => ({ t: c.t0 + 0.1, until: c.t1, text: c.text })),
];
export const MUSIC_HITS = [ANSWER_AT];

// Sound from the picture: the candle holder's soft scrape while it slides (as loud as its speed), a thunk where it
// stops (at F, and inside F), whooshes on the fast zooms. Light itself is silent: no sound for the rays.
const speed = (t: number) => Math.abs(uAt(t + 1 / 120) - uAt(t - 1 / 120)) * 60;
const V_MAX = 2 * Math.max((U_START - F) / (T_AT_F - T_SLIDE0), (F - U_END) / (ANSWER_AT - T_LEAVE_F));
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    { kind: 'thunk', t: T_AT_F, gain: 0.22 },
    { kind: 'thunk', t: ANSWER_AT, gain: 0.3 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [
    { kind: 'scrape', t0: T_SLIDE0, t1: T_AT_F, level: t => 0.45 * speed(t) / V_MAX },
    { kind: 'scrape', t0: T_LEAVE_F, t1: ANSWER_AT, level: t => 0.45 * speed(t) / V_MAX },
  ],
};
