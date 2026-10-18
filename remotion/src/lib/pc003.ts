// @pyqvault_ · Chemistry, visualised #3: Avogadro's law (Class 11, States of Matter). Gas is added twice (12 → 24 → 48
// particles) at the same temperature and pressure: a free lid rises so the volume grows in step (1 → 2 → 4 L). Each new
// particle has the same speed, so twice the particles in twice the room hit the lid just as often: same pressure.
// Proven idea: @bisal.physics 421k "add gas, the volume grows" (remake-backlog C3); the live hit count is our "why".
// Pure functions of t (Remotion renders frames in any order). Scene units, y up, floor at y = 0.
import { prog, type Caption } from './motion.ts';

export const DURATION = 30.0, END_AT = 26.4;
export const N0 = 12, NMAX = 48;
export const R_GLASS = 0.9, R_BALL = 0.065, HALF_W = R_GLASS / Math.SQRT2 - R_BALL - 0.02, H1 = 0.62; // 1 L = 0.62 high

// Two additions: the particles of each arrive one by one through the valve between t0 and t1.
export const ADDS = [{ t0: 7.6, t1: 10.6, from: 12, to: 24 }, { t0: 15.4, t1: 18.4, from: 24, to: 48 }];
const arrival = (i: number) => {
  if (i < N0) return -1;
  const a = ADDS.find(x => i >= x.from && i < x.to)!;
  return a.t0 + ((i - a.from + 0.5) / (a.to - a.from)) * (a.t1 - a.t0);
};
export const present = (i: number, t: number) => t >= arrival(i);
export const countAt = (t: number) => { let n = 0; for (let i = 0; i < NMAX; i++) if (present(i, t)) n++; return n; };

// The lid follows the amount smoothly (it's pushed up by the new particles): V = n / 12 litres, eased per addition.
export const volumeAt = (t: number) => 1 + ADDS.reduce((v, a) => v + ((a.to - a.from) / N0) * prog(t, a.t0, a.t1 - a.t0 + 0.6), 0);
export const heightAt = (t: number) => H1 * volumeAt(t);

let seed = 1810;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const BALLS = Array.from({ length: NMAX }, () => ({ ux: rnd(), uz: rnd(), uy: rnd() * 2, vx: 0.4 + rnd() * 0.7, vz: 0.4 + rnd() * 0.7, vy: 0.9 + rnd() * 1.0 }));
const tri = (u: number) => { const m = ((u % 2) + 2) % 2; return m <= 1 ? m : 2 - m; };

// G(t) = ∫ ds / height: vertical phase = start + vy · (G(t) − G(arrival)), so speeds stay real as the room grows.
const STEP = 1 / 1200, G: number[] = [0];
for (let i = 1; i * STEP <= DURATION + 0.05; i++) G.push(G[i - 1] + (STEP / 2) * (1 / heightAt((i - 1) * STEP) + 1 / heightAt(i * STEP)));
const gAt = (t: number) => { const k = Math.max(0, Math.min(G.length - 1.001, t / STEP)), i = Math.floor(k); return G[i] + (G[i + 1] - G[i]) * (k - i); };
// New particles enter at the valve (bottom left) moving up: phase starts near 0 (the floor).
const phaseY = (i: number, t: number) => {
  const a = Math.max(0, arrival(i)), b = BALLS[i];
  return (arrival(i) < 0 ? b.uy : 0.02) + b.vy * (gAt(t) - gAt(a));
};
export function particleAt(i: number, t: number): [number, number, number] {
  const b = BALLS[i], w = 2 * HALF_W, a = Math.max(0, arrival(i)), dt = t - a;
  const ux = arrival(i) < 0 ? b.ux : 0.02, uz = arrival(i) < 0 ? b.uz : 0.5;   // newcomers start by the valve
  return [-HALF_W + w * tri(ux + (b.vx * dt) / w), heightAt(t) * tri(phaseY(i, t)), -HALF_W + w * tri(uz + (b.vz * dt) / w)];
}
export const justHit = (i: number, t: number) => { const m = ((phaseY(i, t) % 2) + 2) % 2; return Math.abs(m - 1) < 0.07; };
export function lidHits(t0: number, t1: number) {
  let n = 0;
  for (let i = 0; i < NMAX; i++) {
    const s = Math.max(t0, arrival(i)); if (s >= t1) continue;
    n += Math.floor((phaseY(i, t1) + 1) / 2) - Math.floor((phaseY(i, s) + 1) / 2);
  }
  return n;
}
export const hitsPerSecond = (t: number) => { const t0 = Math.max(0, t - 2.5); return t - t0 < 0.5 ? Math.round(lidHits(0, 2.5) / 2.5) : Math.round(lidHits(t0, t) / (t - t0)); };

export const CAPTIONS: Caption[] = [
  { t0: 3.0, t1: ADDS[0].t0, text: 'A gas under a free lid' },
  { t0: ADDS[0].t0, t1: 12.6, text: 'Double the gas…' },
  { t0: 12.6, t1: ADDS[1].t0, text: '…it takes double the space' },
  { t0: ADDS[1].t0, t1: 20.6, text: 'Double it again' },
  { t0: 20.6, t1: END_AT, text: 'Equal volumes hold\nequal numbers of particles' },
];
export const MUSIC_HITS = [ADDS[0].t0, ADDS[1].t0];
