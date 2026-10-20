// @pyqvault_ · Physics, visualised #5 (predict-first): squeeze a gas to half its volume, once in an insulated cylinder
// and once in a cylinder standing in water. Class 11 Physics · Thermodynamics. Insulated = adiabatic: the work you do
// has nowhere to go, so T·V^(γ−1) stays constant: 300 K → 300·2^(2/3) ≈ 476 K (why a bicycle pump gets hot). In water
// = isothermal: the heat flows out and it stays at 300 K. Monatomic ideal gas, γ = 5/3. Proven idea: @bisal.physics
// "adiabatic squeeze" 1.06M (remake-backlog P5, topic score 10/10). Framework v1.3: every point. Pure functions of t.
import { prog, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';

export const DURATION = 21.8, END_AT = 18.4;
export const OPTIONS = ['A   same', 'B   hotter', 'C   colder'], ANSWER = 1;
export const GAMMA = 5 / 3, T0 = 300;
export const T_SQ = 1.0, T_DONE = 4.8, ANSWER_AT = T_DONE + 0.45;
export type Side = 'ins' | 'water';

// Volume relative to the start (both cylinders squeezed the same way), temperature (K), pressure relative to the start.
export const volumeAt = (t: number) => 1 - 0.5 * prog(t, T_SQ, T_DONE - T_SQ);
export const tempAt = (side: Side, t: number) => (side === 'ins' ? T0 * volumeAt(t) ** (1 - GAMMA) : T0);
export const pressureAt = (side: Side, t: number) => (side === 'ins' ? volumeAt(t) ** -GAMMA : 1 / volumeAt(t));
export const speedAt = (side: Side, t: number) => Math.sqrt(tempAt(side, t) / T0);       // molecules: v ∝ √T

export const N = 34, R_GLASS = 0.72, R_BALL = 0.06, HALF_W = R_GLASS / Math.SQRT2 - R_BALL - 0.02, H1 = 1.6;
export const heightAt = (t: number) => H1 * volumeAt(t);
// How fast the pistons move (scene units / s): the derivative of the eased squeeze.
const easeSlope = (p: number) => (p < 0.5 ? 4 * p : 4 * (1 - p));
export const pistonSpeedAt = (t: number) => {
  const p = (t - T_SQ) / (T_DONE - T_SQ);
  return p <= 0 || p >= 1 ? 0 : (H1 * 0.5 * easeSlope(p)) / (T_DONE - T_SQ);
};

// Molecules: each bounces between the walls and between floor and piston at its real speed (as in pc004).
const BALLS = (() => {
  let seed = 5005;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: N }, () => ({ ux: rnd(), uz: rnd(), uy: rnd() * 2, vx: 0.35 + rnd() * 0.6, vz: 0.35 + rnd() * 0.6, vy: 0.8 + rnd() * 0.9 }));
})();
const tri = (u: number) => { const m = ((u % 2) + 2) % 2; return m <= 1 ? m : 2 - m; };
const STEP = 1 / 1200;
function integrals(side: Side) {                              // S = ∫ speed dt (sideways), G = ∫ speed / height dt (up–down)
  const S = [0], G = [0];
  for (let i = 1; i * STEP <= DURATION + 0.05; i++) {
    const a = (i - 1) * STEP, b = i * STEP;
    S.push(S[i - 1] + (STEP / 2) * (speedAt(side, a) + speedAt(side, b)));
    G.push(G[i - 1] + (STEP / 2) * (speedAt(side, a) / heightAt(a) + speedAt(side, b) / heightAt(b)));
  }
  return { S, G };
}
const INT = { ins: integrals('ins'), water: integrals('water') };
const at = (arr: number[], t: number) => { const k = Math.max(0, Math.min(arr.length - 1.001, t / STEP)), i = Math.floor(k); return arr[i] + (arr[i + 1] - arr[i]) * (k - i); };
export function particleAt(side: Side, i: number, t: number): [number, number, number] {
  const b = BALLS[i], w = 2 * HALF_W, s = at(INT[side].S, t);
  return [-HALF_W + w * tri(b.ux + (b.vx * s) / w), heightAt(t) * tri(b.uy + b.vy * at(INT[side].G, t)), -HALF_W + w * tri(b.uz + (b.vz * s) / w)];
}

// Every hit of a molecule on a piston: hotter molecules hit harder (gain ∝ speed) and, squeezed, more often.
function pistonHits(side: Side, t1: number): (Hit & { side: Side })[] {
  const out: (Hit & { side: Side })[] = [], G = INT[side].G;
  BALLS.forEach((b, i) => {
    let prev = Math.floor((b.uy + b.vy * G[0] - 1) / 2);
    for (let k = 1; k * STEP <= t1; k++) {
      const cur = Math.floor((b.uy + b.vy * G[k] - 1) / 2);
      if (cur > prev) {
        const a0 = b.uy + b.vy * G[k - 1], a1 = b.uy + b.vy * G[k], t = (k - 1 + (2 * cur + 1 - a0) / (a1 - a0)) * STEP;
        out.push({ kind: 'tap', t, gain: 0.26 * speedAt(side, t), pitch: (side === 'ins' ? 1.0 : 0.85) + 0.1 * (((i * 7919 + out.length * 104729) % 1000) / 1000), side });
      }
      prev = cur;
    }
  });
  return out;
}

export const CAPTIONS: Caption[] = [
  { t0: 1.0, t1: T_DONE, text: 'Squeeze both: same push' },
  { t0: T_DONE, t1: 8.0, text: 'Insulated: 300 K → 476 K!' },
  { t0: 8.0, t1: 11.4, text: 'In water, the heat escapes' },
  { t0: 11.4, t1: 15.0, text: 'Your push became heat' },
  { t0: 15.0, t1: END_AT, text: 'That’s why a pump gets hot' },
];
export const MUSIC_HITS = [ANSWER_AT];

// Camera: [zoom, focus] with focus −1 = the insulated cylinder, 0 = both, +1 = the one in water. A slow drift from
// frame 0, a slow push in during the squeeze, a punch-in on the hot cylinder landing on the answer, a pan to the cool
// one, a quick zoom out to both, then a gentle push towards the hot one for the last line.
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [0.95, 0],
  keys: [
    { t: 0, dur: 1.0, to: [1.05, 0] },
    { t: 1.2, dur: 3.4, to: [1.25, 0] },
    { t: T_DONE + 0.1, dur: 0.35, to: [1.55, -1] },
    { t: 7.6, dur: 0.7, to: [1.55, 1] },
    { t: 11.0, dur: 0.8, to: [1.0, 0] },
    { t: 14.0, dur: 3.0, to: [1.15, -0.5] },
  ],
};

// Sound from the experiment: molecules tapping each piston (more and harder on the hot side), the pistons' scrape while
// they move (as strong as their speed), a thunk as they stop, whooshes on the fast zooms. Music hit on the answer.
const V_MAX = (H1 * 0.5 * 2) / (T_DONE - T_SQ);
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...pistonHits('ins', END_AT), ...pistonHits('water', END_AT),
    { kind: 'thunk', t: T_DONE, gain: 0.6 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [{ kind: 'scrape', t0: T_SQ, t1: T_DONE, level: t => pistonSpeedAt(t) / V_MAX }],
};
