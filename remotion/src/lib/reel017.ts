// @lws.pune · Map #1 (predict-first, founder 2026-10-21): "Which chapter gets the most NDA maths questions now?" B,
// Probability: 41 of the last 360 (NDA-2 2025, NDA-1 2026, NDA-2 2026; the PYQ Vault guide's trends, 2026-10-21). Then
// all of NDA probability on one map: a hub and 8 nodes, the camera visiting each while its formula writes in, two flips
// to the indigo board for the pattern breaks ("90 of 176 are just counting", "exclusive ≠ independent"), and a zoom out
// to the whole map, held for a screenshot, that settles back into frame 0 so the reel loops. Model: a "formula map" reel
// studied 2026-10-21 (study/reels/DdttI7oyswS.mp4: map with empty boxes → node tour → two black flips → full map).
// Pure functions of t.
//
// Beat table (runbook step 1):
// | time        | what moves                                   | caption                             | keep in frame | colours           |
// | 0–2.8       | map small, spoke pulses, slow push           | (the question, PredictHeader)       | whole map     | VIVID per node    |
// | 2.8         | punch-in on the hub, "?" → Probability, B    | Last 3 papers: 41 of 360            | hub           | ink hub           |
// | 4.0–5.7     | node 1 Counting                              | Count the ways, divide by all       | its card      | red               |
// | 5.7–7.2     | flip: 90 of 176 … just counting              | (on the flip)                       | –             | indigo + yellow   |
// | 7.2–12.3    | Not A, A or B, Exclusive                     | one line each                       | its card      | orange/yellow/grn |
// | 12.3–13.8   | flip: Trap! Exclusive ≠ Independent          | (on the flip)                       | –             | indigo + yellow   |
// | 13.8–20.6   | Independent, Given B, Bayes, Binomial        | one line each                       | its card      | cyan/blue/vio/pink|
// | 20.6–24.45  | zoom out: the whole map, Screenshot this     | (header: Screenshot this · Follow)  | whole map     |                   |
// | 24.45–25    | labels fade, camera back to frame 0's view   | (the question again)                | whole map     |                   |
import { clamp01, prog, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { VIVID } from './palette.ts';

export const DURATION = 25.0, ANSWER_AT = 2.8, TOUR = 4.0, ZOOM_OUT = 20.6, LOOP_AT = 24.45, COVER_T = 1.2;
export const OPTIONS = ['A  Matrices', 'B  Probability', 'C  Trig'], ANSWER = 1;

// Questions per chapter in the last 3 NDA maths papers (NDA-2 2025, NDA-1 2026, NDA-2 2026; 120 each), copied from the
// question bank's guide (Question_Bank src/app/guide/nda-maths/_data/trends.ts → EXAM_MATRIX, read 2026-10-21).
export const LAST3: [string, number, number, number][] = [
  ['Matrices & Determinants', 10, 10, 11], ['Probability', 14, 13, 14], ['Statistics', 4, 6, 5],
  ['Trigonometric Identities', 5, 8, 7], ['Functions', 5, 1, 6], ['Lines', 6, 4, 7], ['Vectors', 7, 8, 5],
  ['3D Geometry', 4, 4, 5], ['Sequence & Series', 5, 4, 4], ['Differentiation', 7, 5, 4], ['Limits & Continuity', 4, 7, 6],
  ['Permutation & Combination', 4, 4, 2], ['Application of Derivatives', 4, 4, 3], ['Complex Numbers', 3, 3, 4],
  ['Sets & Relations', 4, 4, 6], ['Definite Integration', 2, 4, 3], ['Differential Equations', 3, 2, 4],
  ['Quadratic Equations', 6, 4, 4], ['Binomial Theorem', 1, 5, 2], ['Properties of Triangle', 0, 3, 3],
  ['Indefinite Integration', 3, 2, 2], ['Conics', 2, 2, 2], ['Inverse Trigonometry', 2, 2, 2], ['Trigonometric Equations', 4, 1, 1],
  ['Binomial Distribution', 2, 1, 1], ['Circles', 1, 2, 1], ['Applications of Integration', 2, 4, 2], ['Logarithms', 3, 1, 0],
  ['Height & Distance', 0, 2, 2], ['Binary Numbers', 3, 0, 1], ['Linear Inequalities', 0, 0, 1],
];
// NDA Probability PYQs 2017–2026 tagged "Probability via Counting", of all in the chapter (question bank, read-only,
// queried 2026-10-21).
export const COUNTING = { counting: 90, total: 176 };

// ---- the map (px, in the 1080×1920 frame at zoom 1) ------------------------------------------------------------------
export const REGION = { top: 445, h: 1100 };             // the picture area, below the question
export const VIEW = { x: 540, y: REGION.top + REGION.h / 2 }; // the camera's centre on screen
export const HUB = { x: 540, y: 990, r: 125 };
export type MapNode = { title: string; lines: string[]; caption: string; color: string; x: number; y: number; size?: number };
// Formula lines use ^{…} and _{…} for raised and lowered text.
export const NODES: MapNode[] = [
  { title: 'Counting', lines: ['favourable ÷ total'], caption: 'Count the ways, divide by all', color: VIVID.white.red, x: 540, y: 555 },
  { title: 'Not A', lines: ['P(A′) = 1 − P(A)'], caption: '“At least one”? Do 1 − none', color: VIVID.white.orange, x: 870, y: 720 },
  { title: 'A or B', lines: ['P(A) + P(B)', '− P(A∩B)'], caption: 'Add both, take the overlap off once', color: VIVID.white.yellow, x: 870, y: 990 },
  { title: 'Exclusive', lines: ['P(A∩B) = 0'], caption: 'Can’t happen together: no overlap', color: VIVID.white.green, x: 870, y: 1260 },
  { title: 'Independent', lines: ['P(A∩B) =', 'P(A) · P(B)'], caption: 'One doesn’t change the other: multiply', color: VIVID.white.cyan, x: 540, y: 1425 },
  { title: 'Given B', lines: ['P(A|B) =', 'P(A∩B) ÷ P(B)'], caption: 'B happened: B is the new whole', color: VIVID.white.blue, x: 210, y: 1260 },
  { title: 'Bayes', lines: ['P(A|B) =', 'P(B|A)·P(A) ÷ P(B)'], caption: 'Turn the condition around', color: VIVID.white.violet, x: 210, y: 990, size: 31 },
  { title: 'Binomial', lines: ['^{n}C_{r} p^{r} q^{n−r}', 'mean np · var npq'], caption: 'n tries, r successes, p each time', color: VIVID.white.pink, x: 210, y: 720 },
];
export const CARD_W = 330;
export const card = (i: number) => {
  const n = NODES[i], h = 36 + 50 + 44 * n.lines.length;
  return { x: n.x - CARD_W / 2, y: n.y - h / 2, w: CARD_W, h };
};
/** Map point → screen point for a camera [zoom, focus x, focus y]. */
export const toScreen = ([z, fx, fy]: number[], x: number, y: number) => [VIEW.x + (x - fx) * z, VIEW.y + (y - fy) * z];

// ---- the timeline ----------------------------------------------------------------------------------------------------
export type Flip = { t0: number; t1: number; lines: string[] };
export const FLIPS: Flip[] = [
  { t0: 5.7, t1: 7.2, lines: ['90 of 176', 'NDA probability PYQs', 'are just counting'] },
  { t0: 12.3, t1: 13.8, lines: ['Trap!', 'Exclusive ≠ Independent', 'exclusive: never together', 'independent: no effect'] },
];
/** When the camera starts for each node. Nodes 2 and 5 come straight after a flip: the camera got there behind it. */
export const SLOTS = [TOUR, 7.2, 8.9, 10.6, 13.8, 15.5, 17.2, 18.9];
const AFTER_FLIP = SLOTS.map(s => FLIPS.some(f => Math.abs(f.t1 - s) < 1e-9));
/** Each node's formula starts writing here: as the camera arrives, or at once after a flip. */
export const WRITE = SLOTS.map((s, i) => s + (AFTER_FLIP[i] ? 0.1 : 0.45));
/** When each node's turn ends: the next node, the next flip, or the zoom out. */
const ENDS = SLOTS.map((s, i) => Math.min(SLOTS[i + 1] ?? ZOOM_OUT, ...FLIPS.filter(f => f.t0 > s).map(f => f.t0)));

const unloop = (t: number, dur = 0.45) => 1 - prog(t, LOOP_AT, dur);
export const writeAt = (i: number, t: number) => prog(t, WRITE[i], 0.5) * unloop(t);
/** The glow on the node the camera is on. */
export const focusAt = (i: number, t: number) => prog(t, SLOTS[i] + 0.3, 0.3) * (1 - prog(t, ENDS[i] - 0.1, 0.3));
/** "?" in the hub turns into "Probability" as the answer lands. */
export const hubAnswerAt = (t: number) => prog(t, ANSWER_AT - 0.2, 0.4) * unloop(t);
/** A light running out along spoke i during the hook (0 → 1), or null. */
export const PULSE = (i: number) => 0.2 + i * 0.25;
export const pulseAt = (i: number, t: number) => (t >= PULSE(i) && t <= PULSE(i) + 0.45 ? prog(t, PULSE(i), 0.45) : null);
/** A flip to the indigo board: quick in and out (0.15 s), fully up in between. */
export const flipAt = (f: Flip, t: number) => clamp01((t - f.t0) / 0.15) * clamp01((f.t1 - t) / 0.15);
/** The end header ("Screenshot this"), in for the hold, out again as the reel loops. */
export const finalAt = (t: number) => prog(t, ZOOM_OUT + 0.2, 0.4) * (1 - prog(t, LOOP_AT, 0.4));
/** When the question's pill lights: once the end header has hidden the question, it shows unanswered again (frame 0). */
export const predictAnswerAt = (t: number) => (t < ZOOM_OUT + 0.7 ? ANSWER_AT : Infinity);

export const CAPTIONS: Caption[] = [
  { t0: ANSWER_AT, t1: TOUR, text: 'Last 3 papers: 41 of 360' },
  ...NODES.map((n, i) => ({ t0: SLOTS[i] + 0.3, t1: ENDS[i], text: n.caption })),
];
export const MUSIC_HITS = [ANSWER_AT, ZOOM_OUT];

// Camera: [zoom, focus x, focus y]. A slow push from frame 0, a punch-in on the hub with the answer, then in close on
// each node in turn (the moves after a flip happen behind it), a zoom out to the whole map, and back to frame 0's view.
const on = (i: number) => [1.7, NODES[i].x, NODES[i].y];
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [0.62, HUB.x, HUB.y],
  keys: [
    { t: 0, dur: ANSWER_AT - 0.45, to: [0.9, HUB.x, HUB.y] },
    { t: ANSWER_AT - 0.45, dur: 0.45, to: [1.5, HUB.x, HUB.y] },
    { t: ANSWER_AT, dur: 0.35, to: [1.55, HUB.x, HUB.y] },          // short: a slow zoom on text shimmers (F9)
    ...SLOTS.map((s, i): Key => {
      const flip = FLIPS.find(f => Math.abs(f.t1 - s) < 1e-9);
      return { t: flip ? flip.t0 + 0.2 : s, dur: 0.7, to: on(i) };
    }),
    { t: ZOOM_OUT, dur: 0.8, to: [1.0, HUB.x, HUB.y] },
    { t: LOOP_AT, dur: DURATION - LOOP_AT, to: [0.62, HUB.x, HUB.y] },
  ],
};

// Sound from the picture: a click as each spoke's light arrives, a thunk on the answer, a tap as each formula writes
// (rising round the ring), a whump on each flip, a tap as "Screenshot this" lands, whooshes on the fast zooms only.
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...NODES.map((_, i): Hit => ({ kind: 'click', t: PULSE(i) + 0.4, gain: 0.2, pitch: 1.2 + 0.04 * i })),
    { kind: 'thunk', t: ANSWER_AT, gain: 0.5 },
    ...WRITE.map((t, i): Hit => ({ kind: 'tap', t, gain: 0.4, pitch: 0.9 + 0.05 * i })),
    ...FLIPS.map((f): Hit => ({ kind: 'whump', t: f.t0, gain: 0.45 })),
    { kind: 'tap', t: ZOOM_OUT + 0.5, gain: 0.45, pitch: 1.3 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [],
};
