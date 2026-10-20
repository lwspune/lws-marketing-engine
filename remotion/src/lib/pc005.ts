// @pyqvault_ · Chemistry, visualised #5 (predict-first): P, V and T together (Class 11 Chemistry · States of Matter).
// A fixed amount of gas: P·V/T is constant. Heat it with the lid locked (300 → 600 K: P × 2), then hold 600 K and
// squeeze it to half (P × 2 again): P × 4. Proven idea: @codematrixvishal "P, V and T" 299k (remake-backlog C5, topic
// score 7/10). Framework v1.4: every point, and the first orbit shot (F22). Pure functions of t.
import { prog, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';

export const DURATION = 21.4, END_AT = 18.0;
export const OPTIONS = ['A   ×1', 'B   ×2', 'C   ×4'], ANSWER = 2;
export const T_HEAT1 = 4.0, T_UNLOCK = 4.3, T_SQ0 = 4.6, T_SQ1 = 8.0, ANSWER_AT = T_SQ1 + 0.45;

export const flameAt = (t: number) => prog(t, 0, 0.4) * (1 - prog(t, T_HEAT1, 0.45));
export const tempAt = (t: number) => 300 + 300 * prog(t, 0, T_HEAT1);              // K: lit on frame 0, 600 K at 4 s
export const volumeAt = (t: number) => 2 - prog(t, T_SQ0, T_SQ1 - T_SQ0);           // L: locked at 2 L, then to 1 L
export const pressureAt = (t: number) => (tempAt(t) / 300) * (2 / volumeAt(t));     // atm, from P·V/T = 1·2/300
export const speedAt = (t: number) => Math.sqrt(tempAt(t) / 300);

export const N = 34, R_GLASS = 0.9, R_BALL = 0.065, HALF_W = R_GLASS / Math.SQRT2 - R_BALL - 0.02, H2 = 1.7;   // H2: height at 2 L
export const heightAt = (t: number) => (H2 * volumeAt(t)) / 2;
const easeSlope = (p: number) => (p < 0.5 ? 4 * p : 4 * (1 - p));
export const pistonSpeedAt = (t: number) => {
  const p = (t - T_SQ0) / (T_SQ1 - T_SQ0);
  return p <= 0 || p >= 1 ? 0 : ((H2 / 2) * easeSlope(p)) / (T_SQ1 - T_SQ0);
};

const BALLS = (() => {
  let seed = 7005;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: N }, () => ({ ux: rnd(), uz: rnd(), uy: rnd() * 2, vx: 0.35 + rnd() * 0.6, vz: 0.35 + rnd() * 0.6, vy: 0.8 + rnd() * 0.9 }));
})();
const tri = (u: number) => { const m = ((u % 2) + 2) % 2; return m <= 1 ? m : 2 - m; };
const STEP = 1 / 1200, S: number[] = [0], G: number[] = [0];
for (let i = 1; i * STEP <= DURATION + 0.05; i++) {
  const a = (i - 1) * STEP, b = i * STEP;
  S.push(S[i - 1] + (STEP / 2) * (speedAt(a) + speedAt(b)));
  G.push(G[i - 1] + (STEP / 2) * (speedAt(a) / heightAt(a) + speedAt(b) / heightAt(b)));
}
const at = (arr: number[], t: number) => { const k = Math.max(0, Math.min(arr.length - 1.001, t / STEP)), i = Math.floor(k); return arr[i] + (arr[i + 1] - arr[i]) * (k - i); };
export function particleAt(i: number, t: number): [number, number, number] {
  const b = BALLS[i], w = 2 * HALF_W, s = at(S, t);
  return [-HALF_W + w * tri(b.ux + (b.vx * s) / w), heightAt(t) * tri(b.uy + b.vy * at(G, t)), -HALF_W + w * tri(b.uz + (b.vz * s) / w)];
}

// Every hit on the lid: hotter means harder hits, squeezed means more of them (that's the pressure).
function lidHits(t1: number): Hit[] {
  const out: Hit[] = [];
  BALLS.forEach((b, i) => {
    let prev = Math.floor((b.uy + b.vy * G[0] - 1) / 2);
    for (let k = 1; k * STEP <= t1; k++) {
      const cur = Math.floor((b.uy + b.vy * G[k] - 1) / 2);
      if (cur > prev) {
        const a0 = b.uy + b.vy * G[k - 1], a1 = b.uy + b.vy * G[k], t = (k - 1 + (2 * cur + 1 - a0) / (a1 - a0)) * STEP;
        out.push({ kind: 'tap', t, gain: 0.24 * speedAt(t), pitch: 0.92 + 0.16 * (((i * 7919 + out.length * 104729) % 1000) / 1000) });
      }
      prev = cur;
    }
  });
  return out.sort((a, b) => a.t - b.t);
}

export const CAPTIONS: Caption[] = [
  { t0: 0.8, t1: T_UNLOCK, text: 'Heat it: lid locked' },
  { t0: T_UNLOCK, t1: T_SQ1, text: 'Hold 600 K, squeeze to half' },
  { t0: T_SQ1, t1: 10.8, text: 'Pressure ×4!' },
  { t0: 10.8, t1: 14.4, text: '×2 from heat, ×2 from squeeze' },
  { t0: 14.4, t1: END_AT, text: 'P·V ÷ T never changes' },
];
export const MUSIC_HITS = [ANSWER_AT];

// Camera: [zoom, look-at height, orbit angle (rad, 0 = front)]. The orbit (F22): from 52° on one side round to 20° on
// the other while the question is up and the burner lights, then back to the front before the squeeze, where the
// gauges and the piston explain. Then a slow push in while squeezing, a punch-in landing on the answer, a quick zoom
// out, and a gentle push in for the last line.
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [0.95, 0.85, -0.9],
  keys: [
    { t: 0, dur: 3.4, to: [1.15, 0.8, 0.35] },
    { t: 3.5, dur: 0.8, to: [1.15, 0.8, 0] },
    { t: T_SQ0, dur: 3.4, to: [1.35, 0.7, 0] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.55, 0.7, 0] },
    { t: 10.4, dur: 0.8, to: [1.0, 0.85, 0] },
    { t: 13.5, dur: 3.0, to: [1.12, 0.8, 0] },
  ],
};

const V_MAX = ((H2 / 2) * 2) / (T_SQ1 - T_SQ0);
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    { kind: 'whump', t: 0, gain: 0.55 },
    ...lidHits(END_AT),
    { kind: 'click', t: T_UNLOCK, gain: 0.5, pitch: 0.7 },
    { kind: 'thunk', t: T_SQ1, gain: 0.6 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [
    { kind: 'roar', t0: 0, t1: T_HEAT1 + 0.5, level: flameAt },
    { kind: 'scrape', t0: T_SQ0, t1: T_SQ1, level: t => pistonSpeedAt(t) / V_MAX },
  ],
};
