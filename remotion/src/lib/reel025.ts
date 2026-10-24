// @lws.pune · reel 025 v2 (3D, predict-first, framework F32–F33): 256 balls, 8 rows of pegs; which bin fills most? The
// middle (A). A real 3D Galton board: every peg is a fair 50–50 (seeded), each ball flies true gravity arcs between the
// pegs it chose, then the Rapier physics engine piles the balls in the bins (reel025Physics.ts, simulated once). 70 of the
// 256 paths end in the middle bin, 1 in each edge bin: one orange tube to the edge, 70 green ones to the middle, Pascal's
// numbers on the pegs, glass columns at the expected heights, one orange ball as coin tosses. NDA 2018 (II) Q107 (8
// coins, at least 6 heads = 37/256) in the caption. Storyboard v2 (independently reviewed, F31):
// reels/nda-maths-025-galton-board.storyboard.md. World units: x right, y up, z towards the camera. Pure functions of t.
//
// Beat table (from the storyboard):
// | time       | what moves                                                          | caption                              |
// | 0–3.0      | a tilted 360° orbit while the rain starts; pegs flash when hit      | Each peg: left or right, 50–50       |
// | 3.0–5.0    | front view: the rain thickens, piles jostle                         |                                      |
// | 5.0        | A lights; punch-in on the bins                                      |                                      |
// | 5.0–8.6    | the last balls fall and settle                                      | Middle wins. But each peg is fair…   |
// | 9.1–10.6   | a frosted sheet at the all-equal height (256 ÷ 9)                   | All equal would only reach here      |
// | 10.8–12.4  | one orange tube, all lefts, to the edge bin                         | Edge: only all-left gets there       |
// | 12.4–15.2  | 70 green tubes into the middle bin                                  | Middle: 70 different ways in         |
// | 15.2–17.2  | path numbers pop up on the pegs, then in the bins                   | Paths to here = two above added      |
// | 17.2–19.4  | glass columns rise to the expected piles (⁸Cₖ balls)                | Every path equally likely: 1 in 256  |
// | 19.4–21.8  | one orange ball bounces down as coin tosses; the camera rides along | Each peg is a coin toss              |
import { prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { VIVID } from './palette.ts';

export type V3 = [number, number, number];
export const DURATION = 24.8, END_AT = 21.8, ANSWER_AT = 5.0, COVER_T = 0;
export const OPTIONS = ['A   middle', 'B   edges', 'C   all equal'], ANSWER = 0;
export const COLORS = { ball: VIVID.white.blue, edge: VIVID.white.orange, web: VIVID.white.green };

// ---- the board ------------------------------------------------------------------------------------------------------
export const ROWS = 8, DX = 1, DY = 0.55, R = 0.16, PEG_R = 0.07, LANES = 5, LANE_DZ = 2 * R;
export const FLOOR_Y = 0, WALL_TOP = 2.0, PEG_Y0 = WALL_TOP + DY + (ROWS - 1) * DY;
export const GLASS_Z = 0.82, BACK_Z = -0.82, FRONT_Z = 0.95, SPAWN_Y = PEG_Y0 + 0.55, FUNNEL_TOP = PEG_Y0 + 0.95, FRAME_TOP = PEG_Y0 + 1.15, FRAME_X = 4.7;
export const pegX = (r: number, j: number) => (j - r / 2) * DX;
export const pegY = (r: number) => PEG_Y0 - r * DY;
export const binX = (k: number) => (k - 4) * DX;
export const laneZ = (lane: number) => (lane - (LANES - 1) / 2) * LANE_DZ;
export const BOARD_CORNERS: V3[] = [[-FRAME_X, -0.2, FRONT_Z], [FRAME_X, -0.2, FRONT_Z], [-FRAME_X, FRAME_TOP, FRONT_Z], [FRAME_X, FRAME_TOP, FRONT_Z]];

export function choose(n: number, k: number) { let c = 1; for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i; return c; }
export const pegPaths = (r: number, j: number) => choose(r, j);
export const binPaths = () => Array.from({ length: ROWS + 1 }, (_, k) => choose(ROWS, k));
export const FLAT_AT = 256 / 9;
export const EXPECTED_AT = binPaths();

/** A straight-line fit of pile height against ball count, from the run's own settled piles (reel025Physics.ts). */
export type Fit = { a: number; b: number };
export const heightFor = (fit: Fit, n: number) => (n <= 0 ? 0 : Math.max(2 * R, fit.a + fit.b * n));
/** What the picture needs from the physics run: each bin's pile top per video frame, and the packing fit. */
export type RunInfo = { tops: number[][]; fit: Fit };

// ---- a ball's flight above the bins ---------------------------------------------------------------------------------
// It drops from the funnel onto the top peg, then hops peg to peg: each hop is a true gravity arc (g = G, time-scaled),
// the same bounce for every ball, so every hop takes HOP seconds and a ball stays one row behind the one before it in its
// lane. It touches a peg on the side it's about to go (30° off the top). The last hop lands it above its bin, where it is
// handed to the physics engine with the speed it has.
export const G = 60, BOUNCE = 1.2, N_BALLS = 256, REL0 = -1.3, REL_DT = 0.0315;
const CONTACT = PEG_R + R, CDX = CONTACT * Math.sin(Math.PI / 6), CDY = CONTACT * Math.cos(Math.PI / 6);
const flight = (dy: number) => (BOUNCE + Math.sqrt(BOUNCE * BOUNCE - 2 * G * dy)) / G;   // dy < 0: the drop between contacts
export const HOP = flight(-DY);
const DROP = Math.sqrt((2 * (SPAWN_Y - (PEG_Y0 + CDY))) / G);
export type Contact = { x: number; y: number; t: number };
export type Ball = { release: number; steps: number[]; bin: number; lane: number; z: number; contacts: Contact[];
  hand: { x: number; y: number; t: number; vx: number; vy: number } };

function flightFor(steps: number[], release: number, lane: number, jitter: number): Ball {
  const contacts: Contact[] = [];
  let j = 0;
  for (let r = 0; r < ROWS; r++) {
    contacts.push({ x: pegX(r, j) + (steps[r] ? CDX : -CDX), y: pegY(r) + CDY, t: release + DROP + r * HOP });
    j += steps[r];
  }
  const last = contacts[ROWS - 1], hx = binX(j) + jitter, hy = WALL_TOP + 0.2, T = flight(hy - last.y);
  return { release, steps, bin: j, lane, z: laneZ(lane), contacts, hand: { x: hx, y: hy, t: last.t + T, vx: (hx - last.x) / T, vy: BOUNCE - G * T } };
}
const lehmer = (seed: number) => {
  let x = seed * 7919 + 13;
  const next = () => { x = (x * 16807) % 2147483647; return x / 2147483647; };
  for (let i = 0; i < 10; i++) next();                         // warm up: a small seed's first draws are small
  return next;
};
/** The choices come from their own generator (the same draws as v1); where a ball lands across its bin's mouth from a
 *  second one, so the landing spread never changes a choice. */
function runFor(seed: number): Ball[] {
  const coin = lehmer(seed), spread = lehmer(seed + 1000);
  return Array.from({ length: N_BALLS }, (_, i) => {
    const steps = Array.from({ length: ROWS }, (): number => (coin() < 0.5 ? 0 : 1));
    return flightFor(steps, REL0 + i * REL_DT, i % LANES, (spread() - 0.5) * 0.5);
  });
}
const tally = (balls: Ball[], t: number) => { const c = Array(ROWS + 1).fill(0); for (const b of balls) if (b.hand.t <= t) c[b.bin]++; return c; };
/** The first seed (from 1) whose run is typical: every bin within 1 standard deviation of ⁸Cₖ (an edge may be 0), the
 *  middle tallest at the end and clearly tallest (by 5) when the answer lights. */
export const SEED = (() => {
  const exp = binPaths();
  for (let s = 1; s <= 50; s++) {
    const run = runFor(s), end = tally(run, Infinity), at = tally(run, ANSWER_AT), others = (c: number[]) => Math.max(...c.filter((_, k) => k !== 4));
    if (end.every((c, k) => Math.abs(c - exp[k]) <= Math.sqrt(exp[k] * (1 - exp[k] / 256))) && end[4] > others(end) && at[4] >= others(at) + 5) return s;
  }
  throw new Error('no seed');
})();
export const BALLS = runFor(SEED);
export const binsAt = (t: number) => tally(BALLS, t);
export const handedBy = (t: number) => BALLS.filter(b => b.hand.t <= t).length;
export const contactAt = (b: Ball, r: number) => b.contacts[r];

/** Where ball b is above the bins at t, with its squash (1 = round), or null before release / after the hand-over. */
export function ballAt(b: Ball, t: number): { x: number; y: number; z: number; squash: number } | null {
  if (t < b.release || t >= b.hand.t) return null;
  const c = b.contacts, s = t - b.release;
  if (s < DROP) return { x: c[0].x * prog(t, b.release, DROP), y: SPAWN_Y - 0.5 * G * s * s, z: b.z, squash: 1 };
  const r = Math.min(ROWS - 1, Math.floor((t - c[0].t) / HOP)), a = c[r], u = t - a.t;
  const to = r < ROWS - 1 ? c[r + 1] : { x: b.hand.x, t: b.hand.t }, T = to.t - a.t;
  return { x: a.x + ((to.x - a.x) * u) / T, y: a.y + BOUNCE * u - 0.5 * G * u * u, z: b.z, squash: 1 - 0.15 * Math.max(0, 1 - u / 0.05) };
}

/** How bright peg (r, j) flashes at t: 1 at a hit, fading over 0.15 s (the orange ball's hits included). */
const PEG_HITS: number[][][] = Array.from({ length: ROWS }, (_, r) => Array.from({ length: r + 1 }, () => [] as number[]));
for (const b of [...BALLS]) { let j = 0; b.contacts.forEach((c, r) => { PEG_HITS[r][j].push(c.t); j += b.steps[r]; }); }
export function pegFlash(r: number, j: number, t: number) {
  let f = 0;
  for (const h of PEG_HITS[r][j]) if (h <= t && t - h < 0.15) f = Math.max(f, 1 - (t - h) / 0.15);
  return f;
}

// ---- the paths and the coin ball --------------------------------------------------------------------------------------
export const EDGE_PATH = Array(ROWS).fill(0) as number[];
export const MIDDLE_PATHS = Array.from({ length: 256 }, (_, n) => Array.from({ length: ROWS }, (_, r) => (n >> (ROWS - 1 - r)) & 1))
  .filter(s => s.reduce((a, b) => a + b, 0) === 4);
export const COIN_PATH = [1, 0, 1, 1, 0, 0, 1, 0];          // H T H H T T H T: right = heads
export const TUBE_Z = GLASS_Z - 0.07;
/** A path's corners: the funnel, each peg it meets, its bin's wall top (in front of the balls, behind the glass). */
export function pathPoints(seq: number[]): V3[] {
  const pts: V3[] = [[0, SPAWN_Y, TUBE_Z]];
  let j = 0;
  for (let r = 0; r < ROWS; r++) { pts.push([pegX(r, j), pegY(r), TUBE_Z]); j += seq[r]; }
  pts.push([binX(j), WALL_TOP, TUBE_Z]);
  return pts;
}

type Span = { t: number; dur: number };
export const SHEET: Span = { t: 9.1, dur: 0.5 }, SHEET_OUT = 10.6, DIM: Span = { t: 10.8, dur: 0.4 }, EDGE: Span = { t: 10.8, dur: 1.6 };
export const WEB = { t: 12.4, gap: 0.035, dur: 0.3 }, TUBES_OUT = 15.2, NUM_T = 15.3, NUM_ROW = 0.2, PILLS_OUT = 17.2;
export const COLUMNS: Span = { t: 17.2, dur: 0.5 };
export const COIN_BALL = flightFor(COIN_PATH, 19.4, LANES - 1, 0.05);
COIN_BALL.contacts.forEach((c, r) => PEG_HITS[r][COIN_PATH.slice(0, r).reduce((a, b) => a + b, 0)].push(c.t));
export const COIN: Span = { t: COIN_BALL.release, dur: COIN_BALL.hand.t - COIN_BALL.release };
export const RIDE: Span = { t: 19.4, dur: 2.2 };
export const webPathAt = (i: number, t: number) => prog(t, WEB.t + i * WEB.gap, WEB.dur);
export const middleDoneAt = (t: number) => MIDDLE_PATHS.filter((_, i) => t >= WEB.t + i * WEB.gap + WEB.dur).length;
export const numberAlpha = (r: number, t: number) => prog(t, NUM_T + r * NUM_ROW, 0.2);
export const ballDim = (t: number) => 1 - 0.7 * prog(t, DIM.t, DIM.dur) + 0.7 * prog(t, COLUMNS.t, 0.4);

export function readoutAt(t: number) {
  if (t < EDGE.t) return `${handedBy(t)} / 256 balls`;
  if (t < WEB.t) return 'edge: 1 path';
  if (t < TUBES_OUT) { const n = middleDoneAt(t); return `middle: ${n} path${n === 1 ? '' : 's'}`; }
  if (t < COLUMNS.t) return '256 paths in all';
  if (t < COIN.t) return '256 balls, 256 paths';
  return 'k heads: ⁸Cₖ ways';
}

export const CAPTIONS: Caption[] = [
  { t0: 0.3, t1: 3.0, text: 'Each peg: left or right, 50–50' },
  { t0: ANSWER_AT, t1: 7.6, text: 'Middle wins. But each peg is fair…' },
  { t0: SHEET.t, t1: SHEET_OUT, text: 'All equal would only reach here' },
  { t0: EDGE.t, t1: WEB.t, text: 'Edge: only all-left gets there' },
  { t0: WEB.t, t1: TUBES_OUT, text: 'Middle: 70 different ways in' },
  { t0: TUBES_OUT, t1: COLUMNS.t, text: 'Paths to here = two above added' },
  { t0: COLUMNS.t, t1: COIN.t, text: 'Every path equally likely: 1 in 256' },
  { t0: COIN.t, t1: END_AT, text: 'Each peg is a coin toss' },
];
export const MUSIC_HITS = [ANSWER_AT, COLUMNS.t + COLUMNS.dur];

// ---- camera ---------------------------------------------------------------------------------------------------------
// One full orbit from frame 0 (F22), looking down 18° easing to 8°, front-on by ORBIT_END; then zooms only (ZOOM keys):
// a slow push, a punch-in on the bins landing on the answer, a fast zoom out, a slow push into the web, a fast zoom out
// for the numbers, and the ride-along: ×1.3 following the orange ball down, then back out.
const DEG = Math.PI / 180, DIST = 18.5, FOV = 30, BASE: V3 = [0, (FRAME_TOP - 0.2) / 2, 0];
export const BAND = { top: 560, height: 940, width: 1080 };
export const ORBIT_END = 3.0;
export const azimuthAt = (t: number) => 2 * Math.PI * prog(t, 0, ORBIT_END);
const elevationAt = (t: number) => (18 - 10 * prog(t, 0, ORBIT_END)) * DEG;
export const PUNCH: Span = { t: ANSWER_AT - 0.35, dur: 0.35 };
export const ZOOM: { start: number[]; keys: Key[] } = {
  start: [1],
  keys: [
    { t: ORBIT_END, dur: PUNCH.t - ORBIT_END, to: [1.04] },
    { t: PUNCH.t, dur: PUNCH.dur, to: [1.1] },
    { t: 5.6, dur: 0.6, to: [1] },
    { t: WEB.t, dur: TUBES_OUT - WEB.t, to: [1.06] },
    { t: TUBES_OUT, dur: 0.6, to: [1] },
    { t: RIDE.t, dur: 0.5, to: [1.3] },
    { t: RIDE.t + RIDE.dur - 0.6, dur: 0.6, to: [1] },
  ],
};
/** The orange ball's position (its flight, then where it was handed over), averaged over 0.15 s for a steady camera. */
function coinFollow(t: number): V3 {
  let x = 0, y = 0;
  for (let k = 0; k < 5; k++) {
    const s = t - 0.0375 * k, p = ballAt(COIN_BALL, s);
    x += p ? p.x : s < COIN.t ? 0 : COIN_BALL.hand.x;
    y += p ? p.y : s < COIN.t ? SPAWN_Y : COIN_BALL.hand.y;
  }
  return [x / 5, y / 5, 0];
}
export function targetAt(t: number): V3 {
  const punch = prog(t, PUNCH.t, PUNCH.dur) * (1 - prog(t, 5.6, 0.6)), ride = prog(t, RIDE.t, 0.5) * (1 - prog(t, RIDE.t + RIDE.dur - 0.6, 0.6));
  const f = coinFollow(t);
  return [ride * 0.7 * f[0], BASE[1] + (2.7 - BASE[1]) * punch + ride * (Math.min(f[1], PEG_Y0 - 0.6) - BASE[1]), 0];
}
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
export function cameraAt(t: number): Camera {
  const az = azimuthAt(t), el = elevationAt(t), d = DIST / tween(t, ZOOM.start, ZOOM.keys)[0], tg = targetAt(t);
  return { position: [tg[0] + d * Math.cos(el) * Math.sin(az), tg[1] + d * Math.sin(el), tg[2] + d * Math.cos(el) * Math.cos(az)],
    target: tg, up: [0, 1, 0], fov: FOV, aspect: BAND.width / BAND.height };
}
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
/** Where a world point lands on the 1080×1920 frame (the same perspective three.js uses). */
export function project(p: V3, cam: Camera) {
  const f = unit(sub(cam.target, cam.position)), r = unit(cross(f, cam.up)), u = cross(r, f), d = sub(p, cam.position);
  const depth = dot(d, f), k = Math.tan((cam.fov * DEG) / 2);
  return { x: ((dot(d, r) / (depth * k * cam.aspect) + 1) / 2) * BAND.width, y: BAND.top + ((1 - dot(d, u) / (depth * k)) / 2) * BAND.height, depth };
}

// ---- labels: one list for the picture and the tests (HTML on top of the 3D, placed with project) ----------------------
export type Label = { text: string; at: V3; screen?: { x: number; y: number }; size: number; alpha: number;
  anchor: 'start' | 'middle' | 'end'; role: 'readout' | 'count' | 'peg' | 'bin' | 'tag' | 'coin' };
export const LABEL_Z = GLASS_Z + 0.03, BIN_NUM_Y = WALL_TOP + 0.22;
export const sheetYFor = (run: RunInfo) => heightFor(run.fit, FLAT_AT);
export function labelsAt(t: number, run: RunInfo): Label[] {
  const counts = binsAt(t), ride = 1 - prog(t, RIDE.t - 0.3, 0.3);
  const countA = prog(t, ORBIT_END, 0.4) * (1 - 0.8 * prog(t, NUM_T, 0.4) + 0.8 * prog(t, COLUMNS.t, 0.4)) * ride;
  const out: Label[] = [{ text: readoutAt(t), at: [0, 0, 0], screen: { x: 60, y: 592 }, size: 44, alpha: 1, anchor: 'start', role: 'readout' }];
  for (let k = 0; k <= ROWS; k++) out.push({ text: String(counts[k]), at: [binX(k), -0.45, LABEL_Z], size: 36, alpha: countA, anchor: 'middle', role: 'count' });
  for (let r = 0; r < ROWS; r++) for (let j = 0; j <= r; j++)
    out.push({ text: String(pegPaths(r, j)), at: [pegX(r, j), pegY(r), LABEL_Z], size: 30, alpha: numberAlpha(r, t) * (1 - prog(t, PILLS_OUT, 0.4)), anchor: 'middle', role: 'peg' });
  for (let k = 0; k <= ROWS; k++)
    out.push({ text: String(EXPECTED_AT[k]), at: [binX(k), BIN_NUM_Y, LABEL_Z], size: 36, alpha: numberAlpha(ROWS, t) * ride, anchor: 'middle', role: 'bin' });
  out.push({ text: 'C: all equal', at: [4.42, sheetYFor(run) + 0.16, LABEL_Z], size: 34, alpha: prog(t, SHEET.t + 0.3, 0.3) * (1 - prog(t, SHEET_OUT, 0.3)), anchor: 'end', role: 'tag' });
  let firstH = true, firstT = true;
  COIN_PATH.forEach((h, r) => {
    const c = COIN_BALL.contacts[r], text = h ? (firstH ? 'H = right' : 'H') : (firstT ? 'T = left' : 'T');
    if (h) firstH = false; else firstT = false;
    out.push({ text, at: [c.x + (h ? -0.3 : 0.3), c.y - 0.05, LABEL_Z], size: 32, alpha: prog(t, c.t, 0.12) * (1 - prog(t, c.t + 0.7, 0.3)), anchor: h ? 'end' : 'start', role: 'coin' });
  });
  return out;
}
export function labelBox(l: Label, cam: Camera) {
  const p = l.screen ?? project(l.at, cam), w = [...l.text].length * l.size * 0.52, h = l.size;
  const x0 = l.anchor === 'start' ? p.x : l.anchor === 'end' ? p.x - w : p.x - w / 2;
  return { x0, x1: x0 + w, y0: p.y - 0.55 * h, y1: p.y + 0.55 * h };
}

// ---- sound ----------------------------------------------------------------------------------------------------------
// Peg pings (every 16th hit, pitch by row) and landing taps (every 8th ball), a knock on the answer, a tap as the sheet
// lands, a click per peg on the lone path, a shimmer under the web with a tap per 5th tube, a click per row of numbers, a
// whump as the columns land, a click per peg on the orange ball and a knock as it lands; whooshes on the fast zooms.
const atFraction = (sp: Span, r: number) => sp.t + ((r + 1) / (ROWS + 1)) * sp.dur;
const HITS = BALLS.flatMap(b => b.contacts.map((c, r) => ({ t: c.t, r }))).filter(h => h.t >= 0).sort((a, b) => a.t - b.t);
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...HITS.filter((_, i) => i % 16 === 0).map((h): Hit => ({ kind: 'tap', t: h.t, gain: 0.14, pitch: 1.25 - 0.05 * h.r })),
    ...[...BALLS].sort((a, b) => a.hand.t - b.hand.t).filter((_, i) => i % 8 === 7).map((b): Hit => ({ kind: 'tap', t: b.hand.t + 0.08, gain: 0.18, pitch: 0.8 })),
    { kind: 'thunk', t: ANSWER_AT, gain: 0.5 },
    { kind: 'tap', t: SHEET.t + SHEET.dur, gain: 0.3, pitch: 0.7 },
    ...EDGE_PATH.map((_, r): Hit => ({ kind: 'click', t: atFraction(EDGE, r), gain: 0.4, pitch: 0.9 + 0.05 * r })),
    { kind: 'shimmer', t: WEB.t, gain: 0.4 },
    ...MIDDLE_PATHS.map((_, i) => i).filter(i => i % 5 === 4).map((i): Hit => ({ kind: 'tap', t: WEB.t + i * WEB.gap + WEB.dur, gain: 0.28, pitch: 0.9 + 0.006 * i })),
    ...Array.from({ length: ROWS + 1 }, (_, r): Hit => ({ kind: 'click', t: NUM_T + r * NUM_ROW, gain: 0.32, pitch: 1 + 0.03 * r })),
    { kind: 'whump', t: COLUMNS.t + COLUMNS.dur, gain: 0.35 },
    ...COIN_BALL.contacts.map((c, r): Hit => ({ kind: 'click', t: c.t, gain: 0.38, pitch: 1 + 0.04 * r })),
    { kind: 'thunk', t: COIN_BALL.hand.t + 0.1, gain: 0.4 },
    ...whooshesFor(ZOOM.start, ZOOM.keys),
  ],
  beds: [],
};
