// @pyqvault_ · Maths, visualised #3 (predict-first): e, why 2.718? (Class 11–12, Exponential and logarithmic functions.)
// ₹1 at 100% interest a year, the interest added n times: (1 + 1/n)^n. Once: ₹2; twice: ₹2.25; monthly ₹2.61; daily
// ₹2.71; every second: ₹2.71828… = e, and never more. Drawn as the year's staircase, which melts into the curve eᵗ.
// Proven idea: @codematrixvishal "e" 1.59M (remake-backlog M3). Pure functions of t.
import type { Caption } from './motion.ts';

export const DURATION = 23.8, END_AT = 20.4, T_ANSWER = 11.6;
export const OPTIONS = ['A   ₹2', 'B   ₹2.72', 'C   crores'], ANSWER = 1;

// (1 + 1/n)^n, computed as exp(n · log1p(1/n)) so a huge n stays accurate.
export const amount = (n: number) => Math.exp(n * Math.log1p(1 / n));
// The money at time τ (0…1 year) when interest is added n times: a staircase; for n ≥ 10⁶ it's the smooth eᵗ.
export const valueAt = (n: number, tau: number) => (n >= 1e6 ? Math.exp(tau * n * Math.log1p(1 / n)) : amount(n) ** (Math.min(n, Math.floor(n * tau + 1e-9)) / n));

export const STAGES = [
  { n: 1, label: 'once a year', t0: 0 },
  { n: 2, label: 'twice', t0: 3.0 },
  { n: 4, label: '4 times', t0: 4.4 },
  { n: 12, label: 'every month', t0: 5.8 },
  { n: 365, label: 'every day', t0: 7.6 },
  { n: 31_536_000, label: 'every second', t0: 9.6 },
] as const;
export const stageAt = (t: number) => [...STAGES].reverse().find(s => t >= s.t0) ?? STAGES[0];

export const CAPTIONS: Caption[] = [
  { t0: 0.6, t1: 3.0, text: 'Once a year: ₹1 → ₹2' },
  { t0: 3.0, t1: T_ANSWER, text: 'Add the interest more often…' },
  { t0: T_ANSWER, t1: 15.6, text: 'It stops growing at 2.718…' },
  { t0: 15.6, t1: END_AT, text: 'That number is e' },
];
export const MUSIC_HITS = [STAGES[5].t0, T_ANSWER];
