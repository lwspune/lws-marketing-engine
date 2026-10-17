// Reel 014, NDA 2026 (II) Maths Q68: what angle does r = (cos θ) î + (sin θ) ĵ + k̂ make with the +z-axis?
// |r| = √(cos²θ + sin²θ + 1) = √2 and its z-part is 1, so cos γ = 1/√2: γ = π/4 for every θ. As θ runs, the tip
// circles at height 1 with radius 1 and the arrow sweeps a cone; every arrow is the long side of the same
// "up 1, across 1" right triangle. Traps: (a) π/2 is the angle of the floor shadow (cos θ, sin θ, 0);
// (b) π/3 comes from cos γ = 1/2, i.e. forgetting the √ in |r|.
// Timeline and geometry as pure functions of t (seconds), in maths coordinates (z up).
import { prog, type Caption } from './motion.ts';

const PI = Math.PI, DEG = PI / 180;
export type V3 = [number, number, number];
export const DURATION = 31.5, ANSWER_AT = 21.8, END_AT = 28.5;
// The 3D scene is drawn in this band of the 1080×1920 frame (between the question card and the working).
export const BAND = { top: 860, height: 620, width: 1080 };

export const arrowGrow = (t: number) => prog(t, 3.2, 1.2);
// The first sweep goes once round, then on to 133°: 90° from the camera while the triangle is explained.
const SWEEP1 = 2 * PI + 133 * DEG;
const sweep1 = (t: number) => prog(t, 7.2, 4.8) * SWEEP1;
// The second sweep (under the θ counter) goes round once more and on to 193°, 90° from the camera for the answer and traps.
const SWEEP2 = 2 * PI + 60 * DEG;
export const thetaAt = (t: number) => sweep1(t) + prog(t, 17.0, 4.4) * SWEEP2;
export const coneFraction = (t: number) => Math.min(1, sweep1(t) / (2 * PI));
export const tip = (th: number): V3 => [Math.cos(th), Math.sin(th), 1];

// When each part of the figure shows (0…1).
export const spokeAlpha = (t: number) => prog(t, 4.6, 0.6);     // the dashed "across 1" at height 1
export const triangleAlpha = (t: number) => prog(t, 12.2, 0.6); // the up 1 / across 1 / √2 triangle
export const arcAlpha = (t: number) => prog(t, 13.6, 0.6);      // γ = 45° at the origin
export const trapAlpha = (t: number) => prog(t, 25.2, 0.6);     // the floor shadow at 90°

// A camera circling the z-axis at a steady pace from frame 0, a little above the floor.
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
const DIST = 4.9, ELEV = 17 * DEG, TARGET: V3 = [0, 0, 0.45];
export function cameraAt(t: number): Camera {
  const az = (-52 + 6.5 * t) * DEG;
  return {
    position: [TARGET[0] + DIST * Math.cos(ELEV) * Math.cos(az), TARGET[1] + DIST * Math.cos(ELEV) * Math.sin(az), TARGET[2] + DIST * Math.sin(ELEV)],
    target: TARGET, up: [0, 0, 1], fov: 30, aspect: BAND.width / BAND.height,
  };
}

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };

// Where a 3D point lands on the 1080×1920 frame, with the same perspective three.js uses for this camera
// (labels are HTML laid over the 3D canvas, so they stay crisp Cambria).
export function project(p: V3, cam: Camera) {
  const f = unit(sub(cam.target, cam.position)), r = unit(cross(f, cam.up)), u = cross(r, f), d = sub(p, cam.position);
  const depth = dot(d, f), k = Math.tan((cam.fov * DEG) / 2);
  const xn = dot(d, r) / (depth * k * cam.aspect), yn = dot(d, u) / (depth * k);
  return { x: ((xn + 1) / 2) * BAND.width, y: BAND.top + ((1 - yn) / 2) * BAND.height, depth };
}

export type Label = { id: string; text: string; at: V3; alpha: number; tone: 'axis' | 'blue' | 'green' | 'muted' };
export function labels(t: number): Label[] {
  const th = thetaAt(t), [c, s] = [Math.cos(th), Math.sin(th)], tri = triangleAlpha(t);
  const bis = unit([c, s, 1 + Math.SQRT2]); // halfway between the z-axis and the arrow
  return [
    { id: 'x', text: 'x', at: [1.48, 0, 0], alpha: 1, tone: 'axis' },
    { id: 'y', text: 'y', at: [0, 1.48, 0], alpha: 1, tone: 'axis' },
    { id: 'z', text: 'z', at: [0, 0, 1.58], alpha: 1, tone: 'axis' },
    { id: 'r', text: 'r', at: [1.12 * c, 1.12 * s, 1.1], alpha: prog(t, 4.2, 0.4) * (1 - tri), tone: 'blue' },
    { id: 'up', text: '1', at: [-0.17 * c, -0.17 * s, 0.5], alpha: tri, tone: 'green' },
    { id: 'across', text: '1', at: [c / 2, s / 2, 1.13], alpha: tri, tone: 'green' },
    { id: 'long', text: '√2', at: [0.68 * c, 0.68 * s, 0.4], alpha: tri, tone: 'blue' },
    { id: 'gamma', text: '45°', at: [0.66 * bis[0], 0.66 * bis[1], 0.66 * bis[2]], alpha: arcAlpha(t), tone: 'green' },
    { id: 'shadow', text: '90°', at: [0.4 * c, 0.4 * s, 0.1], alpha: trapAlpha(t), tone: 'muted' },
  ];
}

// The line of working under the figure.
export function working(t: number): { kind: 'none' | 'length' | 'cos' | 'counter' | 'trap'; deg?: number } {
  if (t < 12.6) return { kind: 'none' };
  if (t < 14.9) return { kind: 'length' };
  if (t < 17.0) return { kind: 'cos' };
  if (t < 25.0) return { kind: 'counter', deg: Math.round(thetaAt(t) / DEG) % 360 };
  return { kind: 'trap' };
}

export const CAPTIONS: Caption[] = [
  { t0: 0,    t1: 3.2,  text: 'θ keeps changing.\nDoes the angle?' },
  { t0: 3.2,  t1: 7.0,  text: 'Draw r for one θ.' },
  { t0: 7.0,  t1: 12.0, text: 'Let θ run.\nIt sweeps a cone.' },
  { t0: 12.0, t1: 17.0, text: 'Up 1, across 1.' },
  { t0: 17.0, t1: 21.6, text: 'Same triangle\nfor every θ.' },
  { t0: 21.6, t1: 25.0, text: 'Answer: (c) π/4' },
  { t0: 25.0, t1: END_AT, size: 48, text: 'Trap (a) π/2: that is the shadow.\nTrap (b) π/3: you forgot the √.' },
];
