// @lws.pune · reel 025 (predict-first, framework F32–F33): 256 balls, 8 rows of pegs; which bin fills most? The middle
// (A). Every peg is a fair 50–50, yet 70 of the 256 left/right paths end in the middle bin and 1 in each edge bin: one
// lonely path to the edge, a web of 70 into the middle, Pascal's numbers on the pegs, the expected piles (⁸Cₖ) on the
// real ones, and each peg as a coin toss. NDA 2018 (II) Q107 (8 coins, at least 6 heads = 37/256) in the caption.
// Storyboard (independently reviewed, F31): reels/nda-maths-025-galton-board.storyboard.md. Band px. Pure functions of t.
//
// Beat table (from the storyboard):
// | time       | what moves                                                        | caption                              |
// | 0–5.0      | 256 balls rain through the pegs and pile up; counts run           | Each peg: left or right, 50–50       |
// | 5.0        | A lights; punch-in on the bins                                    |                                      |
// | 5.0–7.6    | the rain ends; a dashed flat line at 256 ÷ 9, "C: all equal"      | Middle wins. But each peg is fair…   |
// | 8.0–9.8    | one path, all lefts, to the edge bin                              | Edge: only all-left gets there       |
// | 9.8–12.8   | the 70 paths into the middle bin, one after another               | Middle: 70 different ways in         |
// | 12.8–15.0  | path numbers write in on the pegs, row by row, then on the bins   | Each peg adds the two above          |
// | 15.0–17.4  | the expected piles (⁸Cₖ balls) drop onto the real ones            | Every path equally likely: 1 in 256  |
// | 17.4–19.8  | one path again, H/T at each peg: 4 heads → the middle bin         | Each peg is a coin toss              |
import { prog, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { VIVID } from './palette.ts';

export const DURATION = 22.8, END_AT = 19.8, ANSWER_AT = 5.0, COVER_T = 0.15;
export const OPTIONS = ['A   middle', 'B   edges', 'C   all equal'], ANSWER = 0;
export const COLORS = { ball: VIVID.white.blue, edge: VIVID.white.orange, web: VIVID.white.green };

// ---- the board ------------------------------------------------------------------------------------------------------
export const ROWS = 8, DX = 104, DY = 58, PEG_Y0 = 190, PEG_R = 7, BALL_R = 8, DISC_R = 22;
export const WALL_TOP = 640, FLOOR = 900, COUNT_Y = 948, BIN_NUM_Y = 700;
export const pegX = (r: number, j: number) => 540 + (j - r / 2) * DX;
export const pegY = (r: number) => PEG_Y0 + r * DY;
export const binX = (k: number) => 540 + (k - 4) * DX;

export function choose(n: number, k: number) { let c = 1; for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i; return c; }
/** Paths reaching peg j of row r (ʳCⱼ) and bin k (⁸Cₖ): Pascal's triangle. */
export const pegPaths = (r: number, j: number) => choose(r, j);
export const binPaths = () => Array.from({ length: ROWS + 1 }, (_, k) => choose(ROWS, k));
export const FLAT_AT = 256 / 9;               // the trap: every bin equal
export const EXPECTED_AT = binPaths();        // 256 balls × ⁸Cₖ / 256

// ---- the balls: a real run, each peg a fair 50–50 -------------------------------------------------------------------
// Ball i is released at REL0 + (REL1 − REL0)·i/255, falls onto the top peg, hops peg to peg (HOP s a row, a small lift),
// drops into its bin and settles in the next free slot of a hex-packed pile (in the order the balls arrive).
export const N_BALLS = 256, REL0 = -1.2, REL1 = 6.0, HOP = 0.12, G = 3000, LIFT = 14;
const CONTACT = BALL_R + PEG_R, ENTRY_Y = -30, ROW_H = BALL_R * Math.sqrt(3), BIN_Y = pegY(ROWS) - CONTACT;
const ENTRY = Math.sqrt((2 * (pegY(0) - CONTACT - ENTRY_Y)) / G);
const ORDER6 = [2, 3, 1, 4, 0, 5], ORDER5 = [2, 1, 3, 0, 4];
function slot(k: number, n: number) {
  const pair = Math.floor(n / 11), rem = n % 11, even = rem < 6, row = 2 * pair + (even ? 0 : 1);
  return { x: binX(k) + (even ? -40 + 16 * ORDER6[rem] : -32 + 16 * ORDER5[rem - 6]), y: FLOOR - BALL_R - row * ROW_H, row };
}
/** How tall a pile of n balls stands (fractional n: between its neighbours, for the trap line). */
export function pileHeight(n: number): number {
  if (n <= 0) return 0;
  if (!Number.isInteger(n)) { const a = Math.floor(n); return pileHeight(a) + (n - a) * (pileHeight(a + 1) - pileHeight(a)); }
  return 2 * BALL_R + slot(0, n - 1).row * ROW_H;
}

export type Ball = { release: number; steps: number[]; bin: number; slotX: number; slotY: number; fall: number; lands: number };
function runFor(seed: number): Ball[] {
  let x = seed * 7919 + 13;
  const next = () => { x = (x * 16807) % 2147483647; return x / 2147483647; };
  for (let i = 0; i < 10; i++) next();                         // warm up: a small seed's first draws are small
  const filled = Array(ROWS + 1).fill(0);
  return Array.from({ length: N_BALLS }, (_, i) => {
    const steps = Array.from({ length: ROWS }, (): number => (next() < 0.5 ? 0 : 1)), bin = steps.reduce((a, b) => a + b, 0);
    const s = slot(bin, filled[bin]++), release = REL0 + ((REL1 - REL0) * i) / (N_BALLS - 1);
    const fall = Math.sqrt((2 * (s.y - BIN_Y)) / G);
    return { release, steps, bin, slotX: s.x, slotY: s.y, fall, lands: release + ENTRY + ROWS * HOP + fall };
  });
}
const tally = (balls: Ball[], t: number) => { const c = Array(ROWS + 1).fill(0); for (const b of balls) if (b.lands <= t) c[b.bin]++; return c; };
/** The first seed (counting up from 1) whose run is a typical one: every bin within 1 standard deviation of ⁸Cₖ (an
 *  edge bin may be 0), the middle tallest at the end and clearly tallest (by 5) when the answer lights. */
export const SEED = (() => {
  const exp = binPaths();
  for (let s = 1; s <= 50; s++) {
    const run = runFor(s), end = tally(run, Infinity), at = tally(run, ANSWER_AT), others = (c: number[]) => Math.max(...c.filter((_, k) => k !== 4));
    if (end.every((c, k) => Math.abs(c - exp[k]) <= Math.sqrt(exp[k] * (1 - exp[k] / 256))) && end[4] > others(end) && at[4] >= others(at) + 5) return s;
  }
  throw new Error('no seed');
})();
export const BALLS = runFor(SEED);
export const countsAt = (t: number) => tally(BALLS, t);
export const landedBy = (t: number) => BALLS.filter(b => b.lands <= t).length;
export const pileTop = (k: number, t: number) => FLOOR - pileHeight(countsAt(t)[k]);

const smooth = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * u);
/** Where ball b is at t (band px), or null before it's released. */
export function ballAt(b: Ball, t: number): { x: number; y: number } | null {
  let s = t - b.release;
  if (s < 0) return null;
  if (s < ENTRY) return { x: 540, y: ENTRY_Y + 0.5 * G * s * s };
  s -= ENTRY;
  if (s < ROWS * HOP) {
    const r = Math.floor(s / HOP), u = s / HOP - r, j = b.steps.slice(0, r).reduce((a, c) => a + c, 0), j1 = j + b.steps[r];
    const x0 = pegX(r, j), y0 = pegY(r) - CONTACT, x1 = r < ROWS - 1 ? pegX(r + 1, j1) : binX(b.bin), y1 = r < ROWS - 1 ? pegY(r + 1) - CONTACT : BIN_Y;
    return { x: x0 + (x1 - x0) * smooth(u), y: y0 + (y1 - y0) * u * u - LIFT * 4 * u * (1 - u) };
  }
  s -= ROWS * HOP;
  if (s < b.fall) return { x: binX(b.bin) + (b.slotX - binX(b.bin)) * (s / b.fall), y: BIN_Y + 0.5 * G * s * s };
  return { x: b.slotX, y: b.slotY };
}

// ---- the paths ------------------------------------------------------------------------------------------------------
export const EDGE_PATH = Array(ROWS).fill(0) as number[];
export const MIDDLE_PATHS = Array.from({ length: 256 }, (_, n) => Array.from({ length: ROWS }, (_, r) => (n >> (ROWS - 1 - r)) & 1))
  .filter(s => s.reduce((a, b) => a + b, 0) === 4);
export const COIN_PATH = [1, 0, 1, 1, 0, 0, 1, 0];          // H T H H T T H T: right = heads
/** A path's corners: above the top peg, each peg it meets, its bin's wall top. */
export function pathPoints(seq: number[]) {
  const pts = [{ x: 540, y: pegY(0) - 60 }];
  let j = 0;
  for (let r = 0; r < ROWS; r++) { pts.push({ x: pegX(r, j), y: pegY(r) }); j += seq[r]; }
  pts.push({ x: binX(j), y: WALL_TOP });
  return pts;
}
type Span = { t: number; dur: number };
export const FLAT: Span = { t: 5.5, dur: 0.6 }, TRAP_OUT = 7.8, DIM: Span = { t: 7.6, dur: 0.4 }, EDGE: Span = { t: 8.0, dur: 1.6 };
export const WEB = { t: 9.8, gap: 0.037, dur: 0.3 }, NUM_T = 12.9, NUM_ROW = 0.22, EXPECTED: Span = { t: 15.0, dur: 0.4 };
export const COIN: Span = { t: 17.6, dur: 1.6 };
export const webPathAt = (i: number, t: number) => prog(t, WEB.t + i * WEB.gap, WEB.dur);
export const middleDoneAt = (t: number) => MIDDLE_PATHS.filter((_, i) => t >= WEB.t + i * WEB.gap + WEB.dur).length;
/** When row r's numbers write in (row 8 = the bins). */
export const numberAlpha = (r: number, t: number) => prog(t, NUM_T + r * NUM_ROW, 0.2);

export function readoutAt(t: number) {
  if (t < EDGE.t) return `${landedBy(t)} / 256 balls`;
  if (t < WEB.t) return 'edge: 1 path';
  if (t < 12.8) { const n = middleDoneAt(t); return `middle: ${n} path${n === 1 ? '' : 's'}`; }
  if (t < EXPECTED.t) return '256 paths in all';
  if (t < 17.4) return 'expected balls = paths';
  return 'k heads: ⁸Cₖ ways';
}

export const CAPTIONS: Caption[] = [
  { t0: 0.3, t1: 3.0, text: 'Each peg: left or right, 50–50' },
  { t0: ANSWER_AT, t1: 7.6, text: 'Middle wins. But each peg is fair…' },
  { t0: EDGE.t, t1: WEB.t, text: 'Edge: only all-left gets there' },
  { t0: WEB.t, t1: 12.8, text: 'Middle: 70 different ways in' },
  { t0: 12.8, t1: EXPECTED.t, text: 'Each peg adds the two above' },
  { t0: EXPECTED.t, t1: 17.4, text: 'Every path equally likely: 1 in 256' },
  { t0: 17.4, t1: END_AT, text: 'Each peg is a coin toss' },
];
export const MUSIC_HITS = [ANSWER_AT, EXPECTED.t + EXPECTED.dur];

// Camera on the board: [zoom, focus x, focus y], screen = (540 + (x − fx)·z, 515 + (y − fy)·z); `hold` keeps band point c
// where it is while zooming. A slow push from frame 0, a punch-in on the piles landing on the answer, a fast zoom out, a
// slow push into the web, a fast zoom out for the numbers, a gentle push for the coin.
const hold = (c: number, z: number) => c + (515 - c) / z;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1, 540, 515],
  keys: [
    { t: 0, dur: 4.65, to: [1.04, 540, hold(770, 1.04)] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.12, 540, hold(770, 1.12)] },
    { t: 5.6, dur: 0.6, to: [1, 540, 515] },
    { t: WEB.t, dur: 3.0, to: [1.05, 540, hold(520, 1.05)] },
    { t: 12.8, dur: 0.6, to: [1, 540, 515] },
    { t: 17.4, dur: 2.4, to: [1.04, 540, hold(520, 1.04)] },
  ],
};

// ---- labels: one list for the picture and the overlap test --------------------------------------------------------
export type Label = { text: string; x: number; y: number; anchor: 'start' | 'middle' | 'end'; size: number; alpha: number;
  role: 'readout' | 'count' | 'peg' | 'bin' | 'tag' | 'coin'; disc?: number };
const discIndex = (r: number, j: number) => (r * (r + 1)) / 2 + j;
const pegNumbersOut = (t: number) => 1 - prog(t, EXPECTED.t, 0.4);
export function labelsAt(t: number): Label[] {
  const counts = countsAt(t), countA = 1 - 0.8 * prog(t, 12.8, 0.4) + 0.8 * prog(t, EXPECTED.t, 0.4), out: Label[] = [];
  out.push({ text: readoutAt(t), x: 60, y: 70, anchor: 'start', size: 44, alpha: 1, role: 'readout' });
  for (let k = 0; k <= ROWS; k++) out.push({ text: String(counts[k]), x: binX(k), y: COUNT_Y, anchor: 'middle', size: 36, alpha: countA, role: 'count' });
  for (let r = 0; r < ROWS; r++) for (let j = 0; j <= r; j++)
    out.push({ text: String(pegPaths(r, j)), x: pegX(r, j), y: pegY(r) + 11, anchor: 'middle', size: 32, alpha: numberAlpha(r, t) * pegNumbersOut(t), role: 'peg', disc: discIndex(r, j) });
  for (let k = 0; k <= ROWS; k++)
    out.push({ text: String(EXPECTED_AT[k]), x: binX(k), y: BIN_NUM_Y, anchor: 'middle', size: 36, alpha: numberAlpha(ROWS, t) * (1 - prog(t, 17.4, 0.4)), role: 'bin' });
  out.push({ text: 'C: all equal', x: 1000, y: FLOOR - pileHeight(FLAT_AT) - 10, anchor: 'end', size: 34, alpha: prog(t, FLAT.t + FLAT.dur, 0.3) * (1 - prog(t, TRAP_OUT, 0.3)), role: 'tag' });
  let j = 0;
  COIN_PATH.forEach((h, r) => {
    const passed = prog(t, COIN.t + ((r + 1) / (ROWS + 1)) * COIN.dur, 0.15) * (1 - prog(t, END_AT - 0.3, 0.3));
    out.push({ text: h ? 'H' : 'T', x: pegX(r, j) + (h ? -30 : 30), y: pegY(r) + 12, anchor: h ? 'end' : 'start', size: 34, alpha: passed, role: 'coin' });
    j += h;
  });
  return out;
}
export function labelBox(l: Label) {
  const w = [...l.text].length * l.size * 0.5, h = l.size;
  const x0 = l.anchor === 'start' ? l.x : l.anchor === 'end' ? l.x - w : l.x - w / 2;
  return { x0, x1: x0 + w, y0: l.y - 0.8 * h, y1: l.y + 0.2 * h };
}
/** The white discs the peg numbers sit on, as boxes (visible ones only), in disc-index order. */
export function discsAt(t: number) {
  const out: { x0: number; x1: number; y0: number; y1: number; i: number }[] = [];
  for (let r = 0; r < ROWS; r++) for (let j = 0; j <= r; j++)
    if (numberAlpha(r, t) * pegNumbersOut(t) > 0.05) out.push({ x0: pegX(r, j) - DISC_R, x1: pegX(r, j) + DISC_R, y0: pegY(r) - DISC_R, y1: pegY(r) + DISC_R, i: discIndex(r, j) });
  return out;
}

// Sound: a soft tap for every 8th ball landing (pitch by bin), a knock on the answer, a click per peg on the lone path,
// a shimmer under the web with a tap every 5th path, a click per row of numbers, a whump as the expected piles land,
// a click per peg on the coin path; whooshes on the fast zooms.
const atFraction = (sp: Span, r: number) => sp.t + ((r + 1) / (ROWS + 1)) * sp.dur;
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...[...BALLS].sort((a, b) => a.lands - b.lands).filter((_, i) => i % 8 === 7)
      .map((b): Hit => ({ kind: 'tap', t: b.lands, gain: 0.22, pitch: 0.9 + 0.025 * b.bin })),
    { kind: 'thunk', t: ANSWER_AT, gain: 0.5 },
    ...EDGE_PATH.map((_, r): Hit => ({ kind: 'click', t: atFraction(EDGE, r), gain: 0.4, pitch: 0.9 + 0.05 * r })),
    { kind: 'shimmer', t: WEB.t, gain: 0.4 },
    ...MIDDLE_PATHS.map((_, i) => i).filter(i => i % 5 === 4).map((i): Hit => ({ kind: 'tap', t: WEB.t + i * WEB.gap + WEB.dur, gain: 0.28, pitch: 0.9 + 0.006 * i })),
    ...Array.from({ length: ROWS + 1 }, (_, r): Hit => ({ kind: 'click', t: NUM_T + r * NUM_ROW, gain: 0.32, pitch: 1 + 0.03 * r })),
    { kind: 'whump', t: EXPECTED.t + EXPECTED.dur, gain: 0.35 },
    ...COIN_PATH.map((_, r): Hit => ({ kind: 'click', t: atFraction(COIN, r), gain: 0.38, pitch: 1 + 0.04 * r })),
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [],
};
