// @pyqvault_ · Physics, visualised #10 (predict-first, "Pick one"): launch at 30° and at 60°, same speed. Which lands
// farther? The same: range R = v² sin 2θ / g, and sin 60° = sin 120°. Then the second hook (F26): which angle goes
// farthest of all? 45° (sin 2θ = 1); every pair adding to 90° ties (15° and 75° too). Class 11 Physics · Motion in a Plane
// (projectile motion). Backlog P11 (topic score 8/10; @sciencevisualised's fan of angles 11×). Framework v1.15: hook
// "Pick one" with the race already running from frame 0 (F25), a second hook at the answer (F26), a loop back to frame 0
// instead of an end card (F27), "PYQ Vault · pyqvault.com" under the question (F20). White board (L22: physics
// alternates, #9 was dark), VIVID.white (F24). Real numbers: v = 30 m/s, g = 9.8 m/s², no air; times are real time.
// Pure functions of t; world units are metres × S, x along the field, y up, one lane per angle along z.
//
// BEAT TABLE (runbook step 1). Voice lengths are Kokoro af_heart, measured (runbook step 3).
// | time        | what moves                                                | caption (voice)                          | keep in frame                | colours (VIVID.white)                  |
// | 0 (loop)    | 30° and 60° balls already 0.3 s into flight, trails       | question + A/B/C + tag (voice: question) | launchers, both balls        | 30° blue, 60° red                      |
// | 2.76 s      | 30° lands: flag "79.5 m"; 60° still high                  | 30° lands first… (1.44 s)                | balls, flag                  | flag in the ball's colour              |
// | 5.00 s      | 60° lands on the same flag; punch-in; "C same" lights     | Same spot!                               | both balls, the flag         | finish line ink                        |
// | 6.40 s      | zoom out; all five fire (15°–75°) as the second question  | Then which angle goes farthest? (1.69 s) | launchers, every ball        | 15° orange, 45° green, 75° violet      |
// | 10.73 s     | 45° lands farthest: flag "91.8 m"                          | 45° goes farthest! (1.75 s)              | every ball, the flags        | 45° green                              |
// | 11.70–12.31 | 60° lands on 30°'s flag, 75° on 15°'s; graph dots pair up | Angles adding to 90° tie (12.8 s, 1.97 s)| the flags                    | graph dots in the balls' colours       |
// | 14.80 s     | the sin 2θ curve draws through the dots, top at 45°       | The curve peaks at 45° (15.0 s)          | the flags                    | curve green                            |
// | 17.30 s     | loop: everything fades, the chips un-light                | —                                        | launchers                    |                                        |
// | 18.20 s     | 30° and 60° fire again: at 18.5 s the frame is frame 0    | —                                        | launchers, both balls        |                                        |
import { prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import type { Shown, VoiceLine } from './voice.ts';

export type V3 = [number, number, number];

export const V0 = 30, G = 9.8, S = 0.1;                         // launch speed (m/s), gravity (m/s²), world units per metre
export const DEG = Math.PI / 180;
export const ANGLES = [15, 30, 45, 60, 75] as const;
export type Angle = (typeof ANGLES)[number];
export const PAIR: Angle[] = [30, 60];
/** One lane per angle, front (camera side, +z) to back. */
export const LANE: Record<Angle, number> = { 75: 1.0, 60: 0.5, 45: 0, 30: -0.5, 15: -1.0 };

/** Range R = v² sin 2θ / g (metres), flight time T = 2 v sin θ / g, top height v² sin² θ / 2g. No air. */
export const range = (deg: number) => (V0 * V0 * Math.sin(2 * deg * DEG)) / G;
export const flightTime = (deg: number) => (2 * V0 * Math.sin(deg * DEG)) / G;
export const topHeight = (deg: number) => (V0 * Math.sin(deg * DEG)) ** 2 / (2 * G);
/** Where the ball is (metres) τ seconds after launch; it stays where it landed. */
export function flight(deg: number, tau: number): [number, number] {
  const k = Math.max(0, Math.min(tau, flightTime(deg))), c = Math.cos(deg * DEG), s = Math.sin(deg * DEG);
  return [V0 * c * k, Math.max(0, V0 * s * k - (G * k * k) / 2)];
}

export const HEADER = ['Pick one. Don’t switch.', 'Which lands farther?'];
export const OPTIONS = ['A  30°', 'B  60°', 'C  same'], ANSWER = 2;
export const BRAND = 'PYQ Vault · pyqvault.com';

// Three volleys. The first pair is already 0.3 s into flight on frame 0 (the race is running, F25); all five fire with
// the second question (F26); the pair fires again 0.3 s before the end, so the last frame runs on into frame 0 (F27).
export const TAU0 = 0.3, DURATION = 18.5, LOOP_AT = 17.3;
export const T_FAN = 6.4;
export type Shot = { deg: Angle; t0: number; until: number };
export const SHOTS: Shot[] = [
  ...PAIR.map(deg => ({ deg, t0: -TAU0, until: T_FAN })),
  ...ANGLES.map(deg => ({ deg, t0: T_FAN, until: LOOP_AT + 0.6 })),
  ...PAIR.map(deg => ({ deg, t0: DURATION - TAU0, until: Infinity })),
];
export const landsAt = (s: Shot) => s.t0 + flightTime(s.deg);
export const ANSWER_AT = landsAt(SHOTS[1]);                     // the first 60° lands (≈ 5.00 s)
export const T_45 = landsAt(SHOTS.find(s => s.deg === 45)!);    // 45° lands farthest (≈ 10.73 s)

/** Balls on the field at t: where (world units, the ball's foot), how visible. A landed ball rests at its spot. */
export function ballsAt(t: number) {
  return SHOTS.flatMap((s, i) => {
    if (t < s.t0 || t >= s.until) return [];
    const [x, y] = flight(s.deg, t - s.t0), fade = s.until === Infinity ? 1 : 1 - prog(t, s.until - 0.5, 0.5);
    return [{ id: i, deg: s.deg, pos: [x * S, y * S, LANE[s.deg]] as V3, landed: t >= landsAt(s), alpha: fade, tau: t - s.t0 }];
  });
}
/** Each ball's trail so far: points from launch to now (world units). */
export function trail(deg: Angle, tau: number, n = 40): V3[] {
  return Array.from({ length: n + 1 }, (_, k) => {
    const [x, y] = flight(deg, (tau * k) / n);
    return [x * S, y * S, LANE[deg]] as V3;
  });
}

/** A flag at each landing spot, from the first landing there until the loop clears the field. */
export function flagsAt(t: number) {
  const out: { deg: Angle; x: number; z: number; alpha: number; metres: number }[] = [];
  for (const s of SHOTS) {
    const at = landsAt(s);
    if (t < at || s.until === Infinity || out.some(f => f.deg === s.deg)) continue;
    out.push({ deg: s.deg, x: range(s.deg) * S, z: LANE[s.deg], metres: range(s.deg), alpha: prog(t, at, 0.3) * (1 - prog(t, LOOP_AT, 0.5)) });
  }
  return out.filter(f => f.alpha > 0);
}
/** "79.5 m": one decimal, as the flags show it. */
export const metres = (m: number) => `${m.toFixed(1)} m`;

// The graph below: range against angle; a dot for each angle once its ball lands, the twins joined, then the
// sin 2θ curve drawing through them.
export const T_CURVE = 14.8;
export const curveDrawn = (t: number) => prog(t, T_CURVE, 1.6) * (1 - prog(t, LOOP_AT, 0.5));
export function graphDots(t: number) {
  return ANGLES.flatMap(deg => {
    const first = SHOTS.filter(s => s.deg === deg && s.until !== Infinity).map(landsAt).sort((a, b) => a - b)[0];
    const alpha = prog(t, first, 0.3) * (1 - prog(t, LOOP_AT, 0.5));
    return alpha > 0 ? [{ deg, metres: range(deg), alpha }] : [];
  });
}

// The camera: [zoom, look-at x, look-at y]. The whole field at the start; a slow push while the pair flies; a punch-in
// landing on the answer at the shared flag; a quick zoom out for the five; a slow push during the graph; back to the
// start values by the end so the loop has no seam.
export const BAND = { top: 500, width: 1080, height: 620 };
const DIST = 11.0, EL = 7 * DEG, AZ = 14 * DEG, FOV = 30;
const LANDING = range(30) * S;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1.0, 4.7, 2.4],
  keys: [
    { t: 0, dur: 2.6, to: [1.04, 4.6, 2.4] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.6, LANDING - 0.3, 0.9] },
    { t: T_FAN - 0.1, dur: 0.8, to: [0.97, 4.7, 2.25] },
    { t: 12.6, dur: 3.6, to: [0.99, 4.7, 2.25] },
    { t: LOOP_AT, dur: DURATION - LOOP_AT, to: [1.0, 4.7, 2.4] },
  ],
};
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
export function cameraAt(t: number): Camera {
  const [zoom, lx, ly] = tween(t, CAMERA.start, CAMERA.keys), d = DIST / zoom;
  return {
    position: [lx + d * Math.sin(AZ) * Math.cos(EL), ly + d * Math.sin(EL), d * Math.cos(AZ) * Math.cos(EL)],
    target: [lx, ly, 0], up: [0, 1, 0], fov: FOV, aspect: BAND.width / BAND.height,
  };
}
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit3 = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
/** Where a 3D point lands on the 1080 × 1920 page. */
export function project(p: V3, cam: Camera) {
  const f = unit3(sub(cam.target, cam.position)), r = unit3(cross(f, cam.up)), u = cross(r, f), d = sub(p, cam.position);
  const depth = dot(d, f), k = Math.tan((cam.fov * Math.PI) / 360);
  const xn = dot(d, r) / (depth * k * cam.aspect), yn = dot(d, u) / (depth * k);
  return { x: ((xn + 1) / 2) * BAND.width, y: BAND.top + ((1 - yn) / 2) * BAND.height, depth };
}

/** The question card resets with the loop: the chips un-light and "comment your guess" comes back (F27). */
export const CHIPS_RESET = LOOP_AT;
export const COVER_T = 3.6;

// Captions say only words the voice reads as written ("30°" is "thirty degrees", measured); the distances live on the
// flags and the formula on the graph, which the voice doesn't read (F17).
export const CAPTIONS: Caption[] = [
  { t0: 2.9, t1: ANSWER_AT, text: '30° lands first…' },
  { t0: ANSWER_AT, t1: T_FAN, text: 'Same spot!' },
  { t0: T_FAN, t1: T_45, text: 'Then which angle goes farthest?' },
  { t0: T_45, t1: 12.8, text: '45° goes farthest!' },
  { t0: 12.8, t1: 15.0, text: 'Angles adding to 90° tie' },
  { t0: 15.0, t1: LOOP_AT, text: 'The curve peaks at 45°' },
];
export const SECOND_HOOK = CAPTIONS[2];
export const SHOWN: Shown[] = [{ t0: 0, t1: LOOP_AT, text: HEADER.join('\n') }, ...CAPTIONS];
export const VOICE: VoiceLine[] = [
  { t: 0.15, until: CAPTIONS[0].t0, text: HEADER.join(' ') },
  ...CAPTIONS.map(c => ({ t: c.t0 + 0.1, until: c.t1, text: c.text })),
];
export const MUSIC_HITS = [ANSWER_AT, T_45];

// Sound from the picture: a soft launch pop as each volley fires (the first is before frame 0), a thunk as each ball
// lands; whooshes on the fast zooms.
const pops: Hit[] = [...new Set(SHOTS.map(s => s.t0))].filter(t => t >= 0)
  .map(t => ({ kind: 'whump', t, gain: SHOTS.filter(s => s.t0 === t).length > 2 ? 0.55 : 0.4 }));
const thunks: Hit[] = SHOTS.filter(s => s.until !== Infinity && landsAt(s) < DURATION)
  .map(s => ({ kind: 'thunk', t: landsAt(s), gain: 0.5 }));
export const SOUND: Score = {
  duration: DURATION,
  hits: [...pops, ...thunks, ...whooshesFor(CAMERA.start, CAMERA.keys)].sort((a, b) => a.t - b.t),
  beds: [],
};
export const loopState = (t: number) => ({ balls: ballsAt(t).map(b => b.pos), flags: flagsAt(t).length, dots: graphDots(t).length, curve: curveDrawn(t), camera: cameraAt(t).position, caption: CAPTIONS.some(c => t >= c.t0 && t < c.t1) });
