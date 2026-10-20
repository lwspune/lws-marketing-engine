// @lws.pune · Why? #6 (predict-first): a coin shows heads AND a die shows 6: chance? 1/12 (B). NDA Maths · Probability.
// The square of all outcomes: 2 coin columns × 6 die rows = 12 equal cells. Heads takes half the square, a six takes
// one row, and the cell where they cross is 1 of 12 = ½ × ⅙. A second coin halves that cell again: 1/24. Each "and"
// cuts the space, which is why independent chances multiply. Proven idea: @mathsy.uk "why do we multiply
// probabilities?" 822k (remake-backlog W11, topic score 8/10). Flat 2D (a 3D opening was tried and dropped by the
// founder, 2026-10-20): the 12 cells pop in one by one from frame 0 under a slow push. Pure functions of t.
import { prog, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';

export const DURATION = 19.4, END_AT = 16.8;
export const OPTIONS = ['A   2/3', 'B   1/12', 'C   1/6'], ANSWER = 1;

// The grid (px): column 0 = heads, 1 = tails; row r = die face r + 1 (six at the bottom).
export const GRID = { x: 190, y: 550, w: 700, h: 768, cols: 2, rows: 6 };
export const cell = (c: number, r: number) => {
  const w = GRID.w / GRID.cols, h = GRID.h / GRID.rows;
  return { x: GRID.x + c * w, y: GRID.y + r * h, w, h, cx: GRID.x + (c + 0.5) * w, cy: GRID.y + (r + 0.5) * h };
};
export const HEADS = 0, SIX = 5;

export const T_HEADS = 1.7, T_SIX = 2.8, ANSWER_AT = 4.1, T_COIN2 = 7.4;
/** The 12 cells pop into the grid one by one from frame 0 (row by row). */
export const POP = (i: number) => 0.1 + i * 0.11;
export const popAt = (i: number, t: number) => prog(t, POP(i), 0.25);
/** Heads fills its column cell by cell (top to bottom). */
export const headsAt = (t: number) => prog(t, T_HEADS, 0.9);
export const headsCellAt = (r: number, t: number) => prog(t, T_HEADS + r * 0.15, 0.25);
/** A six fills its row. */
export const sixAt = (t: number) => prog(t, T_SIX, 0.6);
export const sixCellAt = (c: number, t: number) => prog(t, T_SIX + c * 0.2, 0.25);
/** The crossing cell (heads and six) lights as the answer lands. */
export const bothAt = (t: number) => prog(t, ANSWER_AT - 0.3, 0.6);
/** A second coin: the crossing cell splits and only half of it stays lit. */
export const splitAt = (t: number) => prog(t, T_COIN2, 0.7);

/** The chance shown under the grid as the story goes. */
export function chanceAt(t: number): { num: number; den: number } {
  if (t >= T_COIN2 + 0.4) return { num: 1, den: 24 };
  if (t >= ANSWER_AT) return { num: 1, den: 12 };
  if (t >= T_HEADS + 0.5) return { num: 1, den: 2 };
  return { num: 1, den: 1 };
}

export const COVER_T = 1.5;                                     // the grid built, nothing filled or answered

export const CAPTIONS: Caption[] = [
  { t0: 1.6, t1: T_SIX, text: 'Heads: half the square' },
  { t0: T_SIX, t1: ANSWER_AT, text: 'A six: one row of six' },
  { t0: ANSWER_AT, t1: 7.3, text: 'Both: 1 cell of 12' },
  { t0: 7.3, t1: 10.4, text: 'Another coin? Half again: 1/24' },
  { t0: 10.4, t1: 13.6, text: 'Each “and” cuts the space' },
  { t0: 13.6, t1: END_AT, text: 'True when one doesn’t change the other' },
];
export const MUSIC_HITS = [ANSWER_AT, T_COIN2];

// Camera on the 2D picture: [zoom, focus x, focus y] (px). A slow push from frame 0 drifting towards the crossing cell, a punch-in landing on it with the answer, a zoom out, a punch-in on the split for the second
// coin, a zoom out, and a slow push for the takeaway.
const BOTH = cell(HEADS, SIX);
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1, 540, 904],
  keys: [
    { t: 0, dur: 3.6, to: [1.08, 470, 1000] },
    { t: ANSWER_AT - 0.45, dur: 0.45, to: [1.35, BOTH.cx, BOTH.cy] },
    { t: 5.2, dur: 0.7, to: [1.0, 540, 904] },
    { t: T_COIN2 - 0.7, dur: 0.7, to: [1.4, BOTH.cx, BOTH.cy] },
    { t: 8.8, dur: 0.7, to: [1.0, 540, 904] },
    { t: 10.4, dur: 3.0, to: [1.1, 540, 904] },
  ],
};

// Sound from the picture: a soft pop as each cell appears, a tap as each cell fills, a thunk when the answer lights, a
// click as the cell splits, whooshes on the fast zooms only.
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...Array.from({ length: 12 }, (_, i): Hit => ({ kind: 'click', t: POP(i), gain: 0.18, pitch: 1.3 + 0.03 * i })),
    ...Array.from({ length: 6 }, (_, r): Hit => ({ kind: 'tap', t: T_HEADS + r * 0.15, gain: 0.35, pitch: 0.9 + 0.04 * r })),
    ...Array.from({ length: 2 }, (_, c): Hit => ({ kind: 'tap', t: T_SIX + c * 0.2, gain: 0.4, pitch: 1.2 })),
    { kind: 'thunk', t: ANSWER_AT, gain: 0.5 },
    { kind: 'click', t: T_COIN2, gain: 0.45, pitch: 0.8 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [],
};
