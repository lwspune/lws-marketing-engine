// @pyqvault_ · Chemistry, visualised #4 (predict-first): Charles's law (Class 11, States of Matter). A gas under a free
// lid (constant pressure) is heated from 0 °C to 273 °C. Its molecules speed up (∝ √T) and the lid rises: the volume
// doubles, because what counts is temperature from absolute zero: 273 K → 546 K. The V–T line, run backwards, hits zero
// at −273 °C. (273 rather than 273.15, as in the textbook problem.) Proven idea: @codematrixvishal 807k (remake C4).
import { prog, type Caption } from './motion.ts';

export const DURATION = 24.0, END_AT = 20.6;
export const OPTIONS = ['A   ×1.5', 'B   ×2', 'C   ×273'], ANSWER = 1;
export const T_HEAT = 2.0, T_DONE = 11.0, T_LINE = 13.0;

export const celsiusAt = (t: number) => 273 * prog(t, T_HEAT, T_DONE - T_HEAT);
export const kelvinAt = (t: number) => 273 + celsiusAt(t);
export const volumeAt = (t: number) => kelvinAt(t) / 273;                 // litres: 1 L at 0 °C
export const speedAt = (t: number) => Math.sqrt(kelvinAt(t) / 273);        // relative to 0 °C
export const lineV = (celsius: number) => (celsius + 273) / 273;           // the V–T line, in litres

export const N = 30, R_GLASS = 0.9, R_BALL = 0.065, HALF_W = R_GLASS / Math.SQRT2 - R_BALL - 0.02, H1 = 0.95;
export const heightAt = (t: number) => H1 * volumeAt(t);

let seed = 2731;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const BALLS = Array.from({ length: N }, () => ({ ux: rnd(), uz: rnd(), uy: rnd() * 2, vx: 0.35 + rnd() * 0.6, vz: 0.35 + rnd() * 0.6, vy: 0.8 + rnd() * 0.9 }));
const tri = (u: number) => { const m = ((u % 2) + 2) % 2; return m <= 1 ? m : 2 - m; };

// S(t) = ∫ speed dt (sideways phase); Gy(t) = ∫ speed / height dt (vertical phase): real speeds, growing room.
const STEP = 1 / 1200, S: number[] = [0], Gy: number[] = [0];
for (let i = 1; i * STEP <= DURATION + 0.05; i++) {
  const a = (i - 1) * STEP, b = i * STEP;
  S.push(S[i - 1] + (STEP / 2) * (speedAt(a) + speedAt(b)));
  Gy.push(Gy[i - 1] + (STEP / 2) * (speedAt(a) / heightAt(a) + speedAt(b) / heightAt(b)));
}
const at = (arr: number[], t: number) => { const k = Math.max(0, Math.min(arr.length - 1.001, t / STEP)), i = Math.floor(k); return arr[i] + (arr[i + 1] - arr[i]) * (k - i); };
export function particleAt(i: number, t: number): [number, number, number] {
  const b = BALLS[i], w = 2 * HALF_W, s = at(S, t);
  return [-HALF_W + w * tri(b.ux + (b.vx * s) / w), heightAt(t) * tri(b.uy + b.vy * at(Gy, t)), -HALF_W + w * tri(b.uz + (b.vz * s) / w)];
}

export const CAPTIONS: Caption[] = [
  { t0: 2.6, t1: 7.0, text: 'Heat it: the molecules speed up' },
  { t0: 7.0, t1: T_DONE, text: 'the lid rises…' },
  { t0: T_DONE, t1: T_LINE, text: 'Volume doubled!' },
  { t0: T_LINE, t1: 16.6, text: 'The line hits zero at −273 °C' },
  { t0: 16.6, t1: END_AT, text: 'Count from there: 273 K → 546 K' },
];
export const MUSIC_HITS = [T_DONE, T_LINE];
