// @pyqvault_ · Physics, visualised #4: tilt a ramp; when does the block slide? (Class 11, Laws of Motion: friction.)
// Predict-first (learnings L28): the question and A/B/C are on screen from frame 0. A 1 kg block (μs = 0.7, μk = 0.45)
// sits on a plank that tilts up 3.6° a second. It holds while mg sin θ ≤ μs mg cos θ and slips the moment tan θ = μs:
// θ = 35°. Proven idea: @mathsy.uk "Forces on a slope" 1.50M (remake-backlog P4). Pure functions of t.
import type { Caption } from './motion.ts';

export const DURATION = 23.8, END_AT = 20.4;
export const M = 1, G = 9.8, MU_S = 0.7, MU_K = 0.45, THETA_C = Math.atan(MU_S);
export const OPTIONS = ['A   20°', 'B   35°', 'C   50°'], ANSWER = 1;

// Plank: hinged at its low end; positions s are along the plank, from the hinge up (scene units).
export const PLANK = { len: 3.2, start: 2.45, stop: 0.38 };
export const BLOCK = { len: 0.5, h: 0.36 };

const RATE = (3.6 * Math.PI) / 180, T0 = 0.8;           // 3.6° a second, from 0.8 s
export const T_SLIP = T0 + THETA_C / RATE;               // ≈ 10.5 s
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
