// @pyqvault_ · Physics, visualised #4: tilt a ramp; when does the block slide? (Class 11, Laws of Motion: friction.)
// Predict-first (learnings L28): the question and A/B/C are on screen from frame 0. A 1 kg block (μs = 0.7, μk = 0.45)
// sits on a plank that tilts up 3.6° a second. It holds while mg sin θ ≤ μs mg cos θ and slips the moment tan θ = μs:
// θ = 35°. Proven idea: @mathsy.uk "Forces on a slope" 1.50M (remake-backlog P4). Pure functions of t.
import type { Caption, Key } from './motion.ts';
import { whooshesFor, type Score } from './sfx.ts';

export const DURATION = 23.0, END_AT = 19.6;
export const M = 1, G = 9.8, MU_S = 0.7, MU_K = 0.45, THETA_C = Math.atan(MU_S);
export const OPTIONS = ['A   20°', 'B   35°', 'C   50°'], ANSWER = 1;

// Plank: hinged at its low end; positions s are along the plank, from the hinge up (scene units).
export const PLANK = { len: 3.2, start: 2.45, stop: 0.38 };
export const BLOCK = { len: 0.5, h: 0.36 };

const RATE = (3.6 * Math.PI) / 180, T0 = 0;             // 3.6° a second, from frame 0 (no still opening, L31)
export const T_SLIP = T0 + THETA_C / RATE;               // ≈ 9.7 s
const HOLD = (37 * Math.PI) / 180;                        // it eases to a stop at 37°, just past the slip
export function tiltAt(t: number) {
  if (t <= T0) return 0;
  const lin = RATE * (t - T0);
  if (lin <= THETA_C) return lin;
  // after the slip, ease from THETA_C to HOLD over 1.2 s (slope continuous at the join)
  const u = Math.min(1, (t - T_SLIP) / 1.2), k = 1 - (1 - u) * (1 - u);
  return Math.min(HOLD, THETA_C + (HOLD - THETA_C) * k);
}

// The slide: kinetic friction, constant acceleration down the plank, stopped by the bottom stop.
const ACC = G * (Math.sin(THETA_C) - MU_K * Math.cos(THETA_C));
export function blockAt(t: number) {
  if (t <= T_SLIP) return PLANK.start;
  const d = 0.5 * ACC * (t - T_SLIP) ** 2;
  return Math.max(PLANK.stop, PLANK.start - d);
}
export const slidingAt = (t: number) => t > T_SLIP && blockAt(t) > PLANK.stop;
export const T_STOP = T_SLIP + Math.sqrt((2 * (PLANK.start - PLANK.stop)) / ACC);   // it reaches the bottom stop
export const blockSpeedAt = (t: number) => (t > T_SLIP && t < T_STOP ? ACC * (t - T_SLIP) : 0);

// Forces along the slope (newtons): the pull of gravity, the most static friction can give, and what friction gives.
export function forcesAt(t: number) {
  const th = tiltAt(t), pull = M * G * Math.sin(th), maxFriction = MU_S * M * G * Math.cos(th);
  const friction = t <= T_SLIP ? pull : slidingAt(t) ? MU_K * M * G * Math.cos(th) : pull;
  return { theta: th, pull, maxFriction, friction };
}

export const CAPTIONS: Caption[] = [
  { t0: 3.0, t1: 6.8, text: 'Gravity pulls it down the slope' },
  { t0: 6.8, t1: T_SLIP, text: 'Friction holds it back… for now' },
  { t0: T_SLIP, t1: T_SLIP + 3.6, text: 'It slips at 35°!' },
  { t0: T_SLIP + 3.6, t1: END_AT, text: 'It slips when tan θ = μ' },
];
export const MUSIC_HITS = [T_SLIP];

// Camera (founder, 2026-10-20: zoom in and out to keep it exciting): [zoom, focus], focus 0 = the whole ramp, 1 = the block.
// A slow drift from frame 0, a slow push in as the slope steepens, a punch-in that lands on the slip, a quick zoom out
// to watch it slide into the stop, then a gentle push in for the rule.
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [0.88, 0],
  keys: [
    { t: 0, dur: 3.0, to: [1.05, 0.15] },
    { t: 3.6, dur: 5.2, to: [1.55, 0.75] },
    { t: T_SLIP - 0.35, dur: 0.35, to: [2.0, 1] },
    { t: T_SLIP + 0.5, dur: 0.8, to: [1.0, 0.25] },
    { t: T_SLIP + 4.0, dur: 3.0, to: [1.3, 0.35] },
  ],
};

// Sound from the experiment itself: a ratchet click for each whole degree the ramp tilts (rising: tension), the crack
// of static friction letting go at 35°, the friction scrape while it slides (as strong as its real speed), a wooden
// thunk at the stop, and a whoosh on each fast zoom. Music hit on the slip as before.
const V_MAX = ACC * (T_STOP - T_SLIP);
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...Array.from({ length: 34 }, (_, i) => ({ kind: 'click' as const, t: T0 + ((i + 1) * Math.PI) / 180 / RATE, gain: 0.17, pitch: 1 + (0.6 * (i + 1)) / 35 })),
    { kind: 'crack', t: T_SLIP, gain: 0.45 },
    { kind: 'thunk', t: T_STOP, gain: 0.6 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [{ kind: 'scrape', t0: T_SLIP, t1: T_STOP, level: t => blockSpeedAt(t) / V_MAX }],
};
