// @pyqvault_ · Chemistry, visualised #4 (predict-first): Charles's law (Class 11, States of Matter). A gas under a free
// lid (constant pressure) is heated from 0 °C to 273 °C. Its molecules speed up (∝ √T) and the lid rises: the volume
// doubles, because what counts is temperature from absolute zero: 273 K → 546 K. The V–T line, run backwards, hits zero
// at −273 °C. (273 rather than 273.15, as in the textbook problem.) Proven idea: @codematrixvishal 807k (remake C4).
import { prog, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';

export const DURATION = 22.0, END_AT = 18.6;
export const OPTIONS = ['A   ×1.5', 'B   ×2', 'C   ×273'], ANSWER = 1;
// Remade 2026-10-20: the burner lights on frame 0 (no still opening, L31) and goes out once the gas reaches 273 °C.
export const T_HEAT = 0, T_DONE = 9.0, T_LINE = 11.0, T_ZERO = T_LINE + 1.2;   // T_ZERO: −273 °C (0 K) glows

export const celsiusAt = (t: number) => 273 * prog(t, T_HEAT, T_DONE - T_HEAT);
export const kelvinAt = (t: number) => 273 + celsiusAt(t);
export const flameAt = (t: number) => prog(t, T_HEAT, 0.4) * (1 - prog(t, T_DONE, 0.45));   // 0…1, lit → out
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
  { t0: 1.0, t1: 4.4, text: 'Heat it: the molecules speed up' },
  { t0: 4.4, t1: T_DONE, text: 'the lid rises…' },
  { t0: T_DONE, t1: T_LINE, text: 'Volume doubled!' },
  { t0: T_LINE, t1: 14.6, text: 'The line hits zero at −273 °C' },
  { t0: 14.6, t1: END_AT, text: 'Count from there: 273 K → 546 K' },
];
export const MUSIC_HITS = [T_DONE];                      // 0 K gets its own boom (SOUND)

// Every hit of a molecule on the lid, from the same motion that draws them: particle i touches the lid each time its
// vertical bounce reaches the top. Hotter molecules hit harder (gain ∝ speed) but, with the lid risen, less often.
function lidHits(t1: number): Hit[] {
  const out: Hit[] = [];
  BALLS.forEach((b, i) => {
    let prev = Math.floor((b.uy + b.vy * Gy[0] - 1) / 2);
    for (let k = 1; k * STEP <= t1; k++) {
      const cur = Math.floor((b.uy + b.vy * Gy[k] - 1) / 2);
      if (cur > prev) {
        const a0 = b.uy + b.vy * Gy[k - 1], a1 = b.uy + b.vy * Gy[k], top = 2 * cur + 1, t = (k - 1 + (top - a0) / (a1 - a0)) * STEP;
        out.push({ kind: 'tap', t, gain: 0.28 * speedAt(t), pitch: 0.92 + 0.16 * (((i * 7919 + out.length * 104729) % 1000) / 1000) });
      }
      prev = cur;
    }
  });
  return out.sort((a, b) => a.t - b.t);
}

// Camera (founder, 2026-10-20: zoom in and out to keep it exciting): [zoom, look-at height]. Push in on the molecules
// as they heat, pull back as the lid rises, punch in on the lid as the volume doubles, then settle.
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [0.9, 0.85],
  keys: [
    { t: 0, dur: 3.2, to: [1.35, 0.6] },
    { t: 4.4, dur: 2.6, to: [0.95, 1.15] },
    { t: T_DONE - 0.3, dur: 0.3, to: [1.3, 1.7] },
    { t: T_DONE + 1.4, dur: 1.4, to: [1.0, 1.0] },
  ],
};
// The graph zooms onto −273 °C as the line reaches it (landing as 0 K glows), and back out for the last line.
export const GRAPH_ZOOM: { start: number[]; keys: Key[] } = {
  start: [1],
  keys: [{ t: T_ZERO - 0.6, dur: 0.6, to: [1.8] }, { t: T_LINE + 4.4, dur: 0.7, to: [1] }],
};

// Sound from the experiment: the burner lighting ("whump") and roaring while it's lit, the molecules tapping the lid,
// a deep boom as absolute zero glows, whooshes on the fast zooms. A gas being heated: nothing boils, so no boiling.
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    { kind: 'whump', t: 0, gain: 0.55 },
    ...lidHits(END_AT),
    { kind: 'boom', t: T_ZERO, gain: 0.62 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
    ...whooshesFor(GRAPH_ZOOM.start, GRAPH_ZOOM.keys),
  ],
  beds: [{ kind: 'roar', t0: 0, t1: T_DONE + 0.5, level: flameAt }],
};
