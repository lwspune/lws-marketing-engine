// @lws.pune · reel 010 remade (predict-first, framework v1.1): roll two dice: which total comes up most? NDA maths concept
// (Probability); NDA 2026 (II) Q111 named in the caption. 360 real rolls (seeded) drop chips into a histogram of totals,
// slowly then fast; 7 pulls ahead and the answer lights. Then why: the 6×6 grid of the 36 equally likely outcomes, where
// 7's diagonal (6 cells) is the longest. Proven idea: the old 010 is our own "Why? #2"; remade to the framework.
// Pure functions of t.
import { prog, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';

export const DURATION = 22.0, END_AT = 18.6;
export const OPTIONS = ['A   7', 'B   12', 'C   equal'], ANSWER = 0;

export const WAYS: Record<number, number> = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };

// The rolls: roll k happens at 0.05 + T_ROLL·(k / N)^(1/2.6): a few in the first second, a flood by the end. A chip takes
// FLY seconds to drop from the dice into its column. SEED is the first seed (counting up from 1) whose run ends with 7
// clearly on top; every roll in it is a fair, independent die roll.
export const N_ROLLS = 360, T_ROLL = 8.0, FLY = 0.35;
export const SEED = (() => {
  for (let s = 1; s < 1000; s++) { const r = rollsFor(s), c = tally(r); if (c[7] >= Math.max(...[2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map(k => c[k])) + 4) return s; }
  throw new Error('no seed');
})();
function rollsFor(seed: number) {
  let x = seed * 7919 + 13;
  const die = () => { x = (x * 16807) % 2147483647; return 1 + Math.floor((x / 2147483647) * 6); };
  return Array.from({ length: N_ROLLS }, (_, k) => {
    const t = 0.05 + (T_ROLL - 0.05) * (k / (N_ROLLS - 1)) ** (1 / 2.6);
    return { a: die(), b: die(), t, lands: t + FLY };
  });
}
function tally(rolls: { a: number; b: number }[]) {
  const c: Record<number, number> = {};
  for (let s = 2; s <= 12; s++) c[s] = 0;
  for (const r of rolls) c[r.a + r.b]++;
  return c;
}
export const ROLLS = rollsFor(SEED);
export const rolledBy = (t: number) => ROLLS.filter(r => r.t <= t).length;
export const landedBy = (t: number) => ROLLS.filter(r => r.lands <= t).length;
export const countsAt = (t: number) => tally(ROLLS.filter(r => r.lands <= t));
export const lastRoll = (t: number) => { const n = rolledBy(t); return n ? ROLLS[n - 1] : { a: 1, b: 1, t: 0, lands: FLY }; };

// The answer lights once 7 leads and never loses the lead again (re-checked in the tests on every frame).
export const ANSWER_AT = (() => {
  let at = Infinity;
  for (let i = ROLLS.length - 1; i >= 0; i--) {
    const c = countsAt(ROLLS[i].lands);
    if ([2, 3, 4, 5, 6, 8, 9, 10, 11, 12].every(s => c[7] > c[s])) at = ROLLS[i].lands; else break;
  }
  return Math.max(3.0, Math.ceil(at * 30 - 1e-9) / 30);   // the first frame at or after the lead
})();

// The why: from T_GRID the 6×6 grid of outcomes; 7's diagonal lights one cell every 0.3 s.
export const T_GRID = 9.0, T_DIAG = 10.2;
export const gridLitAt = (t: number) => Math.max(0, Math.min(6, Math.floor((t - T_DIAG) / 0.3) + 1));

export const CAPTIONS: Caption[] = [
  { t0: 0.6, t1: ANSWER_AT, text: 'Every roll drops into its total' },
  { t0: ANSWER_AT, t1: T_GRID, text: '7 comes up most' },
  { t0: T_GRID, t1: 12.5, text: '36 ways two dice can land' },
  { t0: 12.5, t1: 15.5, text: '7 has the most: 6 of 36' },
  { t0: 15.5, t1: END_AT, text: '12 has just one: 6 + 6' },
];
export const MUSIC_HITS = [ANSWER_AT];

// Picture layout (px, inside the picture band; the band starts at y = 470 on screen).
export const HIST = { x0: 150, x1: 930, base: 960, perChip: 7 };
export const colX = (s: number) => HIST.x0 + ((s - 2 + 0.5) * (HIST.x1 - HIST.x0)) / 11;

// Camera: [zoom, focus x, focus y] on the picture. A slow push from frame 0, a punch-in on 7's column landing on the
// answer, a zoom out, a slow push into the grid, a zoom out before the exact shape draws over the bars, and a gentle
// push for the last line.
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1, 540, 500],
  keys: [
    { t: 0, dur: 3.5, to: [1.08, 540, 560] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.4, colX(7), 700] },
    { t: ANSWER_AT + 1.4, dur: 0.7, to: [1.0, 540, 500] },
    { t: 9.4, dur: 1.2, to: [1.25, 540, 250] },
    { t: 12.2, dur: 0.7, to: [1.0, 540, 500] },
    { t: 16.2, dur: 2.2, to: [1.08, 540, 560] },
  ],
};

// Sound from the picture: a click as a chip lands (every landing at first; once they flood in, every 10th, and only
// while the rolls run), a thunk when the answer lights, a tap as each cell of 7's diagonal lights, whooshes on fast zooms.
export const CLICKS: Hit[] = ROLLS.filter((r, k) => k < 24 || k % 10 === 0).map((r, k) => ({ kind: 'click', t: r.lands, gain: 0.5, pitch: 0.9 + 0.04 * ((r.a + r.b) - 2) + 0.02 * (k % 3) }));
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...CLICKS,
    { kind: 'thunk', t: ANSWER_AT, gain: 0.55 },
    ...Array.from({ length: 6 }, (_, i): Hit => ({ kind: 'tap', t: T_DIAG + 0.3 * i, gain: 0.7, pitch: 1 + 0.06 * i })),
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [],
};
export const chipProgress = (r: { t: number }, t: number) => prog(t, r.t, FLY);
