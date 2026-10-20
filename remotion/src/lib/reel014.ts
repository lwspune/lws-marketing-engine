// @lws.pune · reel 014 remade (predict-first, framework v1.1): r = (cos θ) î + (sin θ) ĵ + k̂, θ keeps turning: its angle
// with the z-axis? NDA maths concept (3D vectors, direction cosines); NDA 2026 (II) Q68 named in the caption.
// |r| = √(cos²θ + sin²θ + 1) = √2 and its z-part is 1, so cos γ = 1/√2: γ = 45° for every θ. The arrow sweeps a cone;
// every arrow is the long side of the same "up 1, across 1" right triangle. Trap: 90° is the angle of the floor shadow.
// Replaces the first 014 (the exam question on screen throughout). Pure functions of t, maths coordinates (z up).
import { prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';

const PI = Math.PI, DEG = PI / 180;
export type V3 = [number, number, number];
export const DURATION = 22.0, ANSWER_AT = 5.0, END_AT = 18.6;
export const OPTIONS = ['A   varies', 'B   45°', 'C   90°'], ANSWER = 1;
// The 3D scene's band: under the question and the fixed live strip, above the caption.
export const BAND = { top: 580, height: 920, width: 1080 };

// θ: one quick full turn from frame 0 (the cone paints itself), then a slow drift through the side-on view while the
// triangle is explained and answered and the trap shown, then a steady turn to the end. Always increasing.
const TH0 = 18 * DEG;
const LEGS: [number, number, number, number][] = [[0, 2.4, TH0, TH0 + 2 * PI], [2.4, 12.5, TH0 + 2 * PI, TH0 + 2 * PI + 45 * DEG], [12.5, DURATION, TH0 + 2 * PI + 45 * DEG, TH0 + 4 * PI + 85 * DEG]];
export function thetaAt(t: number) {
  for (const [t0, t1, a, b] of LEGS) if (t <= t1) {
    const u = (t - t0) / (t1 - t0);
    return t0 === 2.4 ? a + (b - a) * (0.7 * prog(t, t0, t1 - t0) + 0.3 * u) : a + (b - a) * u;
  }
  return LEGS[LEGS.length - 1][3];
}
export const coneFraction = (t: number) => Math.min(1, (thetaAt(t) - TH0) / (2 * PI));
export const tip = (th: number): V3 => [Math.cos(th), Math.sin(th), 1];
/** The angle between r and the z-axis, in degrees, computed from the vector itself (the live readout). */
export const angleWithZ = (t: number) => { const r = tip(thetaAt(t)); return Math.acos(r[2] / Math.hypot(...r)) / DEG; };

export const arrowGrow = (t: number) => prog(t, 0, 0.6);
export const triangleAlpha = (t: number) => prog(t, 2.6, 0.6);           // up 1 / across 1 / √2
export const arcAlpha = (t: number) => prog(t, 3.4, 0.6);                // γ = 45° at the origin
export const trapAlpha = (t: number) => prog(t, 9.0, 0.6) * (1 - prog(t, 12.2, 0.5));   // the floor shadow at 90°

export const CAPTIONS: Caption[] = [
  { t0: 0.6, t1: 2.6, text: 'θ turns: the arrow sweeps a cone' },
  { t0: 2.6, t1: ANSWER_AT, text: 'Up 1, across 1, every time' },
  { t0: ANSWER_AT, t1: 9.0, text: 'Always 45°, whatever θ is' },
  { t0: 9.0, t1: 12.5, text: '90° is only its shadow' },
  { t0: 12.5, t1: 15.6, text: '|r| = √2, not 2' },
  { t0: 15.6, t1: END_AT, text: 'Same triangle all the way round' },
];
export const MUSIC_HITS = [ANSWER_AT];

// Camera: an orbit shot in the opening (90° round the z-axis, eased, F22), then the explaining view with a slow drift;
// the zoom follows CAMERA's keys: a push in, a punch-in landing on the answer, a zoom out, a push in for the trap, a zoom
// out to the whole cone, a gentle push for the last line.
const AZ = -52 * DEG, ORBIT = 90 * DEG, DIST = 7.2, ELEV = 17 * DEG, TARGET: V3 = [0, 0, 0.5];
export const ORBIT_END = 2.2;
export const azimuthAt = (t: number) => AZ - ORBIT * (1 - prog(t, 0, ORBIT_END)) + 0.6 * DEG * Math.max(0, t - ORBIT_END);
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [0.92],
  keys: [
    { t: 0, dur: ORBIT_END, to: [1.0] },
    { t: 2.6, dur: 2.0, to: [1.08] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.28] },
    { t: 6.6, dur: 0.7, to: [1.0] },
    { t: 9.0, dur: 1.5, to: [1.12] },
    { t: 12.4, dur: 0.7, to: [0.95] },
    { t: 16.0, dur: 2.4, to: [1.03] },
  ],
};
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
export function cameraAt(t: number): Camera {
  const az = azimuthAt(t), d = DIST / tween(t, CAMERA.start, CAMERA.keys)[0];
  return {
    position: [TARGET[0] + d * Math.cos(ELEV) * Math.cos(az), TARGET[1] + d * Math.cos(ELEV) * Math.sin(az), TARGET[2] + d * Math.sin(ELEV)],
    target: TARGET, up: [0, 0, 1], fov: 30, aspect: BAND.width / BAND.height,
  };
}

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };

/** Where a 3D point lands on the 1080×1920 frame, with the same perspective three.js uses (labels are HTML on top). */
export function project(p: V3, cam: Camera) {
  const f = unit(sub(cam.target, cam.position)), r = unit(cross(f, cam.up)), u = cross(r, f), d = sub(p, cam.position);
  const depth = dot(d, f), k = Math.tan((cam.fov * DEG) / 2);
  const xn = dot(d, r) / (depth * k * cam.aspect), yn = dot(d, u) / (depth * k);
  return { x: ((xn + 1) / 2) * BAND.width, y: BAND.top + ((1 - yn) / 2) * BAND.height, depth };
}

export type Label = { id: string; text: string; at: V3; alpha: number; tone: 'axis' | 'blue' | 'green' | 'muted' };
export function labels(t: number): Label[] {
  const th = thetaAt(t), [c, s] = [Math.cos(th), Math.sin(th)], tri = triangleAlpha(t);
  const bis = unit([c, s, 1 + Math.SQRT2]);                     // halfway between the z-axis and the arrow
  return [
    { id: 'x', text: 'x', at: [1.48, 0, 0], alpha: 1 - tri, tone: 'axis' },   // x and y fade once the triangle is up (√2 can land on them)
    { id: 'y', text: 'y', at: [0, 1.48, 0], alpha: 1 - tri, tone: 'axis' },
    { id: 'z', text: 'z', at: [0, 0, 1.58], alpha: 1, tone: 'axis' },
    { id: 'r', text: 'r', at: [1.12 * c, 1.12 * s, 1.1], alpha: arrowGrow(t) * (1 - tri), tone: 'blue' },
    { id: 'up', text: '1', at: [-0.17 * c, -0.17 * s, 0.5], alpha: tri, tone: 'green' },
    { id: 'across', text: '1', at: [c / 2, s / 2, 1.13], alpha: tri, tone: 'green' },
    { id: 'long', text: '√2', at: [0.68 * c, 0.68 * s, 0.4], alpha: tri, tone: 'blue' },
    { id: 'gamma', text: '45°', at: [0.66 * bis[0], 0.66 * bis[1], 0.66 * bis[2]], alpha: arcAlpha(t), tone: 'green' },
    { id: 'shadow', text: '90°', at: [0.4 * c, 0.4 * s, 0.1], alpha: trapAlpha(t), tone: 'muted' },
  ];
}

// Sound from the picture: a soft click each time θ passes a 30° mark, a thunk when 45° lights, whooshes on fast zooms.
function marks(): Hit[] {
  const out: Hit[] = [], dt = 1 / 600;
  let prev = thetaAt(0) / DEG;
  for (let t = dt; t < END_AT; t += dt) {
    const d = thetaAt(t) / DEG;
    if (Math.floor(d / 30) > Math.floor(prev / 30)) out.push({ kind: 'click', t, gain: 0.4, pitch: 0.95 + 0.05 * (Math.floor(d / 30) % 4) });
    prev = d;
  }
  return out;
}
export const CLICKS = marks();
export const SOUND: Score = {
  duration: DURATION,
  hits: [...CLICKS, { kind: 'thunk', t: ANSWER_AT, gain: 0.55 }, ...whooshesFor(CAMERA.start, CAMERA.keys)],
  beds: [],
};
