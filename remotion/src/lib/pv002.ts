// @pyqvault_ · Physics, visualised #2: why does squeezing a gas raise its pressure? (Boyle's law, Class 11.)
// A piston halves the volume twice (4 → 2 → 1 L) at constant temperature. The particles keep their speed, so
// with half the room they reach the piston twice as often: twice the hits → twice the pressure, P × V = 4.
// Timeline, geometry and the gas as pure functions of t (seconds): Remotion renders frames in any order and in
// parallel, so nothing may depend on the previous frame. Scene units: y up, the floor at y = 0.
import { prog, type Caption } from './motion.ts';

export const DURATION = 30.0, END_AT = 26.6;

// Volume (L) and pressure (atm). Boyle: P = 4 / V.
export const volumeAt = (t: number) => 4 - 2 * prog(t, 9.0, 2.6) - prog(t, 17.0, 2.6);
export const pressureAt = (t: number) => 4 / volumeAt(t);

// The cylinder: glass radius 0.9. Particle centres move in a square that fits inside the round glass, and
// between the floor (y = 0) and the piston (y = height). Height ∝ volume, so the hit rate is exactly ∝ 1 / V.
export const R_GLASS = 0.9, R_BALL = 0.07, HALF_W = R_GLASS / Math.SQRT2 - R_BALL - 0.02, H_FULL = 2.4;
export const heightAt = (t: number) => H_FULL * volumeAt(t) / 4;

// A bounce between two walls: u runs freely, tri(u) folds it into 0…1 and back.
const tri = (u: number) => { const m = ((u % 2) + 2) % 2; return m <= 1 ? m : 2 - m; };

// The particles: a fixed random set (same on every frame and in every render tab).
export const N = 40;
let seed = 20261018;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const BALLS = Array.from({ length: N }, () => ({
  ux: rnd(), uz: rnd(), uy: rnd() * 2,                       // starting phases
  vx: 0.5 + rnd() * 0.9, vz: 0.5 + rnd() * 0.9, vy: 1.0 + rnd() * 1.2, // speeds (units/s), constant: same temperature
}));

// G(t) = ∫₀ᵗ ds / height(s), tabulated once. A particle's vertical phase is uy + vy · G(t): its real speed stays
// vy while the room shrinks, so it crosses the (shorter) room more often.
const STEP = 1 / 1200, G: number[] = [0];
for (let i = 1; i * STEP <= DURATION + 0.05; i++) {
  const t0 = (i - 1) * STEP, t1 = i * STEP;
  G.push(G[i - 1] + (STEP / 2) * (1 / heightAt(t0) + 1 / heightAt(t1)));
}
const gAt = (t: number) => {
  const k = Math.max(0, Math.min(G.length - 1.001, t / STEP)), i = Math.floor(k);
  return G[i] + (G[i + 1] - G[i]) * (k - i);
};
const phaseY = (i: number, t: number) => BALLS[i].uy + BALLS[i].vy * gAt(t);

export function particleAt(i: number, t: number): [number, number, number] {
  const b = BALLS[i], w = 2 * HALF_W;
  return [
    -HALF_W + w * tri(b.ux + (b.vx * t) / w),
    heightAt(t) * tri(phaseY(i, t)),
    -HALF_W + w * tri(b.uz + (b.vz * t) / w),
  ];
}
// Just bounced off the piston (lights up for a moment): the phase is within a hair of an odd number.
export const justHit = (i: number, t: number) => {
  const m = ((phaseY(i, t) % 2) + 2) % 2;
  return Math.abs(m - 1) < 0.07;
};

// Hits on the piston between t0 and t1, counted from the simulation itself (a hit = the phase passes an odd number).
export function pistonHits(t0: number, t1: number) {
  let n = 0;
  for (let i = 0; i < N; i++) n += Math.floor((phaseY(i, t1) + 1) / 2) - Math.floor((phaseY(i, t0) + 1) / 2);
  return n;
}
// The live counter: hits per second over the last 2 s (shorter at the very start).
export function hitsPerSecond(t: number) {
  const t0 = Math.max(0, t - 2);
  return t - t0 < 0.5 ? Math.round(pistonHits(0, 2) / 2) : Math.round(pistonHits(t0, t) / (t - t0));
}

// The graph: P against V, then (from 21.4 s) P against 1/V, where the curve straightens into a line.
export const flipAt = (t: number) => prog(t, 21.4, 1.8);
export const graphPoint = (t: number) => ({ V: volumeAt(t), P: pressureAt(t) });
// The traced part of the curve, from 4 L down to the volume at t; x is V, morphing to 1/V as k goes 0 → 1.
export function curveSamples(t: number, k: number) {
  const vEnd = volumeAt(t), n = 60, out: { V: number; P: number; x: number }[] = [];
  for (let j = 0; j <= n; j++) {
    const V = 4 - (4 - vEnd) * (j / n), P = 4 / V;
    out.push({ V, P, x: V + (1 / V - V) * k });
  }
  return out;
}

// Short labels only (house settings): the picture carries the idea.
export const CAPTIONS: Caption[] = [
  { t0: 3.0,  t1: 8.8,  text: 'Gas pushes by hitting the walls' },
  { t0: 8.8,  t1: 13.0, text: 'Squeeze it into half the space' },
  { t0: 13.0, t1: 17.0, text: 'Twice the hits → twice the pressure' },
  { t0: 17.0, t1: 21.2, text: 'Half again → four times the pressure' },
  { t0: 21.2, t1: END_AT, text: 'P × V never changes' },
];
