// @pyqvault_ · Physics, visualised #12 (2026-10-23, framework v1.27): two lifts raise the same box the same height, one
// twice as fast. Does the faster one do more work? No: the same. Idea P6 ("Same lift, faster = more power"; remake of
// @sciencevisualised 1.33M, 76×). Hook queue row 3: You'd think · Orbit 360°. The second L62 test: each lift's work count
// is the answer (both land on 1,470 J) and counts again in the replay, past the answer; silent like C8. White board
// (L22: white 11, dark 13 in reels made), drive (F13/L34: lifts in motion; C8 was synthwave).
//
// The physics (F10): lifting at a steady speed, the work is W = mgh = 50 kg × 9.8 m/s² × 3 m = 1,470 J, whatever the
// speed. Power is work per second: 1,470 J in 3 s = 490 W (1 m/s), in 6 s = 245 W (0.5 m/s); P = mgv. The counts show
// mgh(t) live; the meters show mgv while a lift climbs (0 at rest). The replay is labelled (⏪, then ⏸ while it holds).
//
// BEAT TABLE (runbook step 1)
// | time          | what moves                                                          | caption                     | keep in frame     | colours                        |
// | 0–2.8 s HOOK  | You'd think · Orbit 360°: the camera goes all the way round two     | Same box, same height.      | both towers       | crates wood, towers steel      |
// |               | lift towers, both boxes already rising from 0.4 s (silent orbit)    | Faster lift, more work? A/B/C| (REAL); fast orange,|                              |
// |               |                                                                     | + tag                       |                   | slow blue (VIVID)              |
// | 3.4 s         | the fast box arrives (thunk); its count stops at 1,470 J            | Fast lift: there already    | both towers       |                                |
// | 5.8–6.6 s     | punch-in on the tops (whoosh-in) as the slow box arrives (6.4 s)    | Slow lift: still climbing   | both boxes        |                                |
// | 6.8 s ANSWER  | "B the same" lights: 1,470 J and 1,470 J                            | Same work: 1,470 J each     | both boxes        |                                |
// | 7.0–7.6 s     | zoom out (whoosh-out); both rewind to the floor (⏪), counts to 0     |                             | both towers       |                                |
// | 7.8 s 2nd     | "So what did speed change?": both climb again; 8.6 s they freeze    | So what did speed change?   | both meters       |                                |
// |               | (⏸, thunk) and the camera punches in on the meters: 490 W vs 245 W  | Power: work done per second |                   |                                |
// | 11.0 s →      | zoom out (whoosh-out), ▶: they finish; arrivals thunk; counts end   | Twice as fast, twice the    | both towers       |                                |
// |               | 1,470 J each again                                                  | power · 490 W vs 245 W ·    |                   |                                |
// |               |                                                                     | Same work. Half the time.   |                   |                                |
// | 16.8 s → end  | end card (no loop: Hook queue)                                      | Power = work ÷ time         |                   |                                |
// Pairs to tell apart (colour-blind safe, tests): the fast lift vs the slow lift (counts, meters, graph lines, tags).
import { prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { REAL, VIVID, WHITE } from './palette.ts';
import { orbitCamera, type Band, type V3 } from './inductionScene.ts';

export const DURATION = 19.2, END_AT = 16.8;
export const T_GO = 0.4, ANSWER_AT = 6.8, T_REWIND = 7.0, T_SECOND = 7.8, T_PAUSE = 8.6, T_RESUME = 11.0, COVER_T = 1.2;
export const LABEL = 'PHYSICS, VISUALISED  #12';
export const HEADER = ['Same box, same height.', 'Faster lift, more work?'];
export const OPTIONS = ['A  more', 'B  the same', 'C  less'], ANSWER = 1;
export const BRAND = 'PYQ Vault · pyqvault.com';
export const SECOND_Q = 'So what did speed change?';

// ---- the physics ----
export const G = 9.8, MASS = 50, HEIGHT = 3;                    // kg, m
export const WORK = MASS * G * HEIGHT;                          // 1,470 J
export type Lift = 'fast' | 'slow';
export const LIFT = { fast: { speed: 1, x: -0.9 }, slow: { speed: 0.5, x: 0.9 } } as const;   // m/s; tower x (scene units)
const REWIND = 0.6;
export const paused = (t: number) => t >= T_PAUSE && t < T_RESUME;
/** Climbing time in the replay: it runs from T_SECOND, holds through the pause, runs on from T_RESUME. */
const replayElapsed = (t: number) => Math.min(Math.max(0, t - T_SECOND), T_PAUSE - T_SECOND) + Math.max(0, t - T_RESUME);
/** The box's height (m) above its start. */
export function heightAt(k: Lift, t: number) {
  const v = LIFT[k].speed;
  if (t < T_REWIND) return Math.min(HEIGHT, v * Math.max(0, t - T_GO));
  if (t < T_REWIND + REWIND) return HEIGHT * (1 - prog(t, T_REWIND, REWIND));
  return Math.min(HEIGHT, v * replayElapsed(t));
}
export const work = (k: Lift, t: number) => MASS * G * heightAt(k, t);
/** The power meter: mgv while the lift climbs (held while paused), 0 at rest or rewinding. */
export function powerAt(k: Lift, t: number) {
  const climbing = (s: number) => heightAt(k, s + 1e-4) > heightAt(k, s) + 1e-9;
  return climbing(paused(t) ? T_PAUSE - 1e-3 : t) ? MASS * G * LIFT[k].speed : 0;
}
const replayTimeAt = (e: number) => (e <= T_PAUSE - T_SECOND ? T_SECOND + e : T_RESUME + e - (T_PAUSE - T_SECOND));
export const arrivals = {
  fast: [T_GO + HEIGHT / LIFT.fast.speed, replayTimeAt(HEIGHT / LIFT.fast.speed)],
  slow: [T_GO + HEIGHT / LIFT.slow.speed, replayTimeAt(HEIGHT / LIFT.slow.speed)],
};
/** The moments each count passes another tenth of the work, in both climbs (a tap on each). */
export const workTicks = (k: Lift) => Array.from({ length: 10 }, (_, i) => (i + 1) * HEIGHT / 10 / LIFT[k].speed)
  .flatMap(e => [T_GO + e, replayTimeAt(e)]).sort((a, b) => a - b);

// ---- the scene (scene units: S per metre) ----
export const S = 0.8;
export const GROUND = -1.35;                                    // top of the floor slab
export const PLATFORM0 = GROUND + 0.1;                          // the platform's top at the start
export const CRATE = 0.4;                                       // a 50 cm crate
export const TOWER = { top: PLATFORM0 + S * HEIGHT + CRATE + 0.2, railX: 0.34, railZ: -0.28 };
export const MOTOR = { y: TOWER.top + 0.2, size: [0.66, 0.36, 0.44] as V3 };
export const platformY = (k: Lift, t: number) => PLATFORM0 + S * heightAt(k, t);
/** Each power meter stands on its motor (clear of the crate arriving below); the lift's tag sits above it. */
export const meterAt = (k: Lift): V3 => [LIFT[k].x, MOTOR.y + MOTOR.size[1] / 2 + 0.14, 0.1];
export const tagAt = (k: Lift): V3 => [LIFT[k].x, meterAt(k)[1] + 0.3, 0.1];

export const BAND: Band = { top: 500, width: 1080, height: 740 };
const DIST = 7.6, FOV = 30, LOOK_Y = 0.58;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [0.86, 0, LOOK_Y, -2 * Math.PI],                       // [zoom, look-at x, look-at y, orbit]; wider while orbiting
  keys: [
    { t: 0, dur: 2.8, to: [0.88, 0, LOOK_Y, 0] },               // the opening orbit: a full turn, back at the front (F22)
    { t: 3.0, dur: 2.7, to: [0.98, 0, 0.66, 0] },              // slow push while they climb
    { t: 5.8, dur: 0.8, to: [1.55, 0, 1.3, 0] },               // punch-in on the tops as the slow box arrives
    { t: T_REWIND, dur: 0.8, to: [0.94, 0, LOOK_Y, 0] },        // zoom out for the replay
    { t: T_PAUSE, dur: 0.8, to: [1.9, 0, MOTOR.y + 0.15, 0] }, // punch-in on the power meters
    { t: T_RESUME, dur: 0.8, to: [0.94, 0, LOOK_Y, 0] },        // zoom out, ▶
    { t: 12.0, dur: END_AT - 12.0, to: [0.98, 0, 0.66, 0] },   // slow push to the end
  ],
};
export const zoomAt = (t: number) => tween(t, CAMERA.start, CAMERA.keys)[0];
export function cameraAt(t: number) {
  const [zoom, lx, ly, orbit] = tween(t, CAMERA.start, CAMERA.keys);
  return orbitCamera(zoom, [lx, ly], orbit, DIST, FOV, BAND);
}
/** Points that must stay inside the band, by what the camera is showing. */
export function anchors(t: number) {
  const out: { name: string; p: V3 }[] = [], lifts: Lift[] = ['fast', 'slow'];
  const wide = (t >= 3.0 && t < 5.8) || (t >= T_SECOND && t < T_PAUSE) || t >= T_RESUME + 0.8;
  if (t < 3.0 || wide) for (const k of lifts) out.push(
    { name: `${k} tag`, p: tagAt(k) }, { name: `${k} tower foot`, p: [LIFT[k].x, GROUND, 0] },
    { name: `${k} crate`, p: [LIFT[k].x, platformY(k, t) + CRATE, 0] },
  );
  if (t >= 6.6 && t < T_REWIND) for (const k of lifts) out.push({ name: `${k} crate top`, p: [LIFT[k].x, platformY(k, t) + CRATE, CRATE / 2] },
    { name: `${k} meter`, p: meterAt(k) });
  if (t >= T_PAUSE + 0.8 && t < T_RESUME) for (const k of lifts) out.push(
    { name: `${k} meter left`, p: [LIFT[k].x - 0.3, meterAt(k)[1] - 0.18, 0.1] }, { name: `${k} meter right`, p: [LIFT[k].x + 0.3, meterAt(k)[1] + 0.18, 0.1] });
  return out;
}

// ---- the graph card: work against time for the first race; its slope is the power ----
export const GRAPH = { left: 170, right: 960, top: 1310, bottom: 1490, t1: 7, wmax: 1600 };
export const graphX = (t: number) => GRAPH.left + (Math.min(t, GRAPH.t1) / GRAPH.t1) * (GRAPH.right - GRAPH.left);
export const graphY = (w: number) => GRAPH.bottom - (Math.min(w, GRAPH.wmax) / GRAPH.wmax) * (GRAPH.bottom - GRAPH.top);
export const T_SLOPES = 9.6;                                    // the slope labels (490 W, 245 W) appear on the graph

// ---- colours (F24) ----
export const COLOURS = {
  fast: VIVID.white.orange, slow: VIVID.white.blue,
  crate: REAL.white.wood.fill, crateEdge: REAL.white.wood.edge, steel: REAL.white.steel.fill, steelEdge: REAL.white.steel.edge, ink: WHITE.ink,
} as const;

// ---- words and sound ----
export const CAPTIONS: Caption[] = [
  { t0: 3.4, t1: 5.4, text: 'Fast lift: there already' },
  { t0: 5.4, t1: ANSWER_AT, text: 'Slow lift: still climbing' },
  { t0: ANSWER_AT, t1: T_SECOND, text: 'Same work: 1,470 J each' },
  { t0: T_SECOND, t1: T_SLOPES, text: SECOND_Q },
  { t0: T_SLOPES, t1: T_RESUME + 0.2, text: 'Power: work done per second' },
  { t0: T_RESUME + 0.2, t1: 13.4, text: 'Twice as fast, twice the power' },
  { t0: 13.4, t1: 15.2, text: '490 W vs 245 W' },
  { t0: 15.2, t1: END_AT - 0.1, text: 'Same work. Half the time.' },
];
export const SECOND_HOOK = CAPTIONS[3];
export const END_LINES = ['Power = work ÷ time', 'pyqvault.com', 'Follow for #13'];
export const MUSIC_HITS = [ANSWER_AT, T_SECOND];
const taps = (k: Lift, pitch: number): Hit[] => workTicks(k).map(t => ({ kind: 'tap' as const, t, gain: 0.3, pitch }));
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...[...arrivals.fast, ...arrivals.slow].map(t => ({ kind: 'thunk' as const, t, gain: 0.45 })),
    { kind: 'thunk' as const, t: T_PAUSE, gain: 0.55 },
    ...taps('fast', 1.3), ...taps('slow', 0.9),
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ].sort((a, b) => a.t - b.t),
  beds: [],
};
