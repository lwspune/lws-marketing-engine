// @pyqvault_ pilot reel with the new cast (Volt, Amp, Ohm: lib/pvCast.ts), in Painted 2D. "Double the battery. What
// happens to the current?" A circuit loop: Volt (the battery, + cap up) on the left side, Ohm (the resistor) on the right,
// a ring of Amp sparks racing clockwise round the wire (conventional current, out of + across the top). A second battery
// stacks on Volt: I = V/R doubles, the sparks go twice as fast, Ohm gets 4x hotter (P = I^2 R). Second hook: "Now double
// Ohm?": a second resistor, the current falls back. The extras leave and it loops. Pure functions of t; tests in
// tests/pvOhm.test.ts.
import { clamp01, ease, type Caption } from './motion.ts';
import type { Score } from './sfx.ts';

export const DURATION = 14;
export const HEADER = ['Double the battery.', 'What happens to the current?'];
export const OPTIONS = ['A  doubles', 'B  same', 'C  halves'], ANSWER = 0, ANSWER_AT = 5.6;
export const BRAND = 'PYQ Vault · pyqvault.com';
export const COVER_T = 2.0;

// ---- the beats ----------------------------------------------------------------------------------------------------------
const V2_IN = [3.4, 4.2], R2_IN = [10.4, 11.2], OUT = [12.6, 13.4];
export const T_HOT = 6.4, T_EQ = [8.1, 9.5];
export const HOOK2 = { text: 'Now double Ohm?', size: 60 }, HOOK2_AT = 9.6;
export const CAPTIONS: Caption[] = [
  { t0: 1.0, t1: 3.3, text: 'One battery: a steady flow' },
  { t0: 3.5, t1: 5.5, text: 'Add a second battery' },
  { t0: 5.6, t1: 7.4, text: 'Twice the push, twice the current' },
  { t0: 7.5, t1: 9.5, text: 'Ohm gets 4× hotter' },
  { t0: HOOK2_AT, t1: 11.6, text: HOOK2.text, size: HOOK2.size },
  { t0: 11.8, t1: 13.4, text: 'Back to 1 A' },
];

/** Cells of push (1 or 2) and resistors in the way (1 or 2): each counts once it has landed. */
export const voltsAt = (t: number) => (t >= V2_IN[1] && t < OUT[0] ? 2 : 1);
export const ohmsAt = (t: number) => (t >= R2_IN[1] && t < OUT[0] ? 2 : 1);
export const currentAt = (t: number) => voltsAt(t) / ohmsAt(t);
/** Heat in each resistor, relative to the start: I^2 R with R = 1 each. */
export const heatAt = (t: number) => currentAt(t) ** 2;
/** The extra battery and the extra resistor sliding in (0 → 1) and back out at the end. */
const slide = (t: number, inn: number[]) => ease(clamp01((t - inn[0]) / (inn[1] - inn[0]))) * (1 - ease(clamp01((t - OUT[0]) / (OUT[1] - OUT[0]))));
export const extraVoltAt = (t: number) => slide(t, V2_IN);
export const extraOhmAt = (t: number) => slide(t, R2_IN);

// ---- the loop of wire and the sparks on it --------------------------------------------------------------------------------
export const LOOP = { x0: 250, x1: 830, y0: 690, y1: 1460, r: 80 };   // tall and narrow: room for the cast at size
const straightW = LOOP.x1 - LOOP.x0 - 2 * LOOP.r, straightH = LOOP.y1 - LOOP.y0 - 2 * LOOP.r, arc = (Math.PI * LOOP.r) / 2;
const PERIM = 2 * straightW + 2 * straightH + 4 * arc;
/** The point a fraction s (0…1) of the way round the loop, clockwise from the top-left corner's end. */
export function pointOnLoop(s: number) {
  let d = (((s % 1) + 1) % 1) * PERIM;
  const { x0, x1, y0, y1, r } = LOOP;
  const segs: [number, (u: number) => { x: number; y: number }][] = [
    [straightW, u => ({ x: x0 + r + u * straightW, y: y0 })],
    [arc, u => ({ x: x1 - r + r * Math.sin(u * Math.PI / 2), y: y0 + r - r * Math.cos(u * Math.PI / 2) })],
    [straightH, u => ({ x: x1, y: y0 + r + u * straightH })],
    [arc, u => ({ x: x1 - r + r * Math.cos(u * Math.PI / 2), y: y1 - r + r * Math.sin(u * Math.PI / 2) })],
    [straightW, u => ({ x: x1 - r - u * straightW, y: y1 })],
    [arc, u => ({ x: x0 + r - r * Math.sin(u * Math.PI / 2), y: y1 - r + r * Math.cos(u * Math.PI / 2) })],
    [straightH, u => ({ x: x0, y: y1 - r - u * straightH })],
    [arc, u => ({ x: x0 + r - r * Math.cos(u * Math.PI / 2), y: y0 + r - r * Math.sin(u * Math.PI / 2) })],
  ];
  for (const [len, at] of segs) { if (d <= len) return at(d / len); d -= len; }
  return { x: x0 + r, y: y0 };
}

// The sparks' shift round the loop follows the charge that has flowed (the running total of I), scaled so that over the
// whole reel they move a whole number of spacings: the last frame shows them exactly where the first did.
export const AMP_N = 10;
const SPACINGS = 25;
const STEPS = [0, V2_IN[1], R2_IN[1], OUT[0], DURATION];
function flowed(t: number) {
  let q = 0;
  for (let i = 0; i < STEPS.length - 1; i++) {
    const a = STEPS[i], b = Math.min(STEPS[i + 1], t);
    if (b > a) q += (b - a) * currentAt((a + STEPS[i + 1]) / 2);
  }
  return q;
}
const TOTAL = flowed(DURATION);
export function ampsAt(t: number) {
  const shift = (SPACINGS / AMP_N) * (flowed(t) / TOTAL);
  return Array.from({ length: AMP_N }, (_, k) => ({ s: k / AMP_N + shift }));
}

// ---- the live meter --------------------------------------------------------------------------------------------------------
export const BOARD = '#141A2E';
export const METER = { x: 540, y: 1000, color: '#FFFFFF', bg: BOARD, text: (t: number) => `I = ${Math.round(currentAt(t))} A` };

// ---- sound: the battery lands, the answer snaps, a hum that follows Ohm's heat -------------------------------------------
export const MUSIC = { style: 'drive' as const };
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    { kind: 'whump', t: V2_IN[1], gain: 0.8 },
    { kind: 'snap', t: ANSWER_AT, gain: 0.7 },
    { kind: 'whump', t: R2_IN[1], gain: 0.7 },
    { kind: 'whoosh-out', t: OUT[0], gain: 0.4 },
  ],
  beds: [{ kind: 'roar', t0: 0, t1: DURATION, level: (t: number) => 0.12 + 0.22 * (heatAt(t) - 1) / 3 }],
};
