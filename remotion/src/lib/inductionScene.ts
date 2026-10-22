// The 3D scene both induction reels share (lib/induction.ts has the physics): the coil stands upright, the magnet moves
// along its axis (y), N pole down. Scene units are 10 cm (S per metre), so the 6 cm coil is 0.6 tall. Pure functions.
import { COIL, MAGNET, emf } from './induction.ts';

export type V3 = [number, number, number];
export const S = 10;                                          // scene units per metre
export const COIL3 = { r: COIL.a * S, h: COIL.L * S, turns: 24 };   // 24 drawn turns stand for the 2,000 (labelled)
export const MAG3 = { h: MAGNET.length * S, r: MAGNET.radius * S };

/** The coil's wire as points along a helix: `turns` turns of radius r over height h, centred on (0, cy, 0). */
export function helix(turns: number, r: number, h: number, cy = 0, perTurn = 40): V3[] {
  const n = Math.max(2, Math.round(turns * perTurn)), pts: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * turns * 2 * Math.PI, y = cy - h / 2 + (i / n) * h;
    pts.push([r * Math.cos(a), y, r * Math.sin(a)]);
  }
  return pts;
}

/** A wire from the coil's lead to a terminal: a smooth path of points (quadratic Bézier through a bend). */
export function wire(from: V3, bend: V3, to: V3, n = 48): V3[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const s = i / n, a = (1 - s) ** 2, b = 2 * s * (1 - s), c = s * s;
    return [0, 1, 2].map(k => a * from[k] + b * bend[k] + c * to[k]) as V3;
  });
}

/** The EMF along a timeline: the magnet's distance from the coil's centre u(t) (metres) is relative, so the coil may
 *  move too. Differentiated over ±1/240 s, and exactly 0 while nothing moves. */
export function emfAt(u: (t: number) => number, t: number) {
  const h = 1 / 240, v = (u(t + h) - u(t - h)) / (2 * h);
  return Math.abs(v) < 1e-9 ? 0 : emf(u(t), v);
}
/** How far charge has moved round the circuit by t (∝ ∫ℰ dt), to slide the current dots along the wires. */
export function chargeAt(u: (t: number) => number, t: number, fps = 30) {
  let q = 0;
  for (let f = 0; f < Math.round(t * fps); f++) q += emfAt(u, f / fps) / fps;
  return q;
}

// ---- camera and projection (the same maths as the other 3D reels) ----
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
export type Band = { top: number; width: number; height: number };
/** A camera at `dist / zoom` from the look-at point, swung `orbit` radians round the vertical. */
export function orbitCamera(zoom: number, look: [number, number], orbit: number, dist: number, fov: number, band: Band): Camera {
  const d = dist / zoom, target: V3 = [look[0], look[1], 0];
  return { position: [look[0] + d * Math.sin(orbit), look[1] + 0.18 * d, d * Math.cos(orbit)], target, up: [0, 1, 0], fov, aspect: band.width / band.height };
}
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit3 = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
/** Where a 3D point lands on the 1080 × 1920 page. */
export function project(p: V3, cam: Camera, band: Band) {
  const f = unit3(sub(cam.target, cam.position)), r = unit3(cross(f, cam.up)), u = cross(r, f), d = sub(p, cam.position);
  const depth = dot3(d, f), k = Math.tan((cam.fov * Math.PI) / 360);
  const xn = dot3(d, r) / (depth * k * cam.aspect), yn = dot3(d, u) / (depth * k);
  return { x: ((xn + 1) / 2) * band.width, y: band.top + ((1 - yn) / 2) * band.height, depth };
}
