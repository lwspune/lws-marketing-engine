// @pyqvault_ · Physics, visualised #3: where does a pendulum's energy go? (Class 11, Work, Energy & Power / Oscillations.)
// A 1 kg bob on a 1.2 m string, let go at 50°. Without air, height (PE) and speed (KE) trade places and the total stays
// 4.20 J. From DRAG_ON, air resistance (a simple drag ∝ speed) takes a little each swing as heat: that's why it stops.
// Proven idea: @sciencevisualised 2.60M "energy trades places" (remake-backlog P3); the heat part is ours.
// The motion is the full (not small-angle) pendulum, integrated once with RK4 into a table: pure functions of t.
import type { Caption } from './motion.ts';

export const DURATION = 31.0, END_AT = 27.4, RELEASE = 4.0, DRAG_ON = 16.6;
export const M = 1, G = 9.8, L = 1.2, THETA0 = (50 * Math.PI) / 180;
export const E0 = M * G * L * (1 - Math.cos(THETA0));
const DRAG = 0.15;                 // 1/s: the damping rate once the air is on (≈ 20% left at the end)

const DT = 1 / 2400, table: { theta: number; omega: number }[] = [];
{
  let th = THETA0, om = 0;
  const acc = (t: number, a: number, w: number) => -(G / L) * Math.sin(a) - (t >= DRAG_ON ? DRAG * w : 0);
  for (let i = 0; RELEASE + i * DT <= DURATION + 0.1; i++) {
    table.push({ theta: th, omega: om });
    const t = RELEASE + i * DT;
    const k1a = om, k1w = acc(t, th, om);
    const k2a = om + (DT / 2) * k1w, k2w = acc(t + DT / 2, th + (DT / 2) * k1a, om + (DT / 2) * k1w);
    const k3a = om + (DT / 2) * k2w, k3w = acc(t + DT / 2, th + (DT / 2) * k2a, om + (DT / 2) * k2w);
    const k4a = om + DT * k3w, k4w = acc(t + DT, th + DT * k3a, om + DT * k3w);
    th += (DT / 6) * (k1a + 2 * k2a + 2 * k3a + k4a); om += (DT / 6) * (k1w + 2 * k2w + 2 * k3w + k4w);
  }
}
export function stateAt(t: number) {
  if (t < RELEASE) return { theta: THETA0, omega: 0 };
  const k = Math.min(table.length - 1.001, (t - RELEASE) / DT), i = Math.floor(k), f = k - i;
  return { theta: table[i].theta + (table[i + 1].theta - table[i].theta) * f, omega: table[i].omega + (table[i + 1].omega - table[i].omega) * f };
}
// Energies in joules. Heat is what the air has taken so far (0 before DRAG_ON, up to RK4's tiny error).
export function energyAt(t: number) {
  const { theta, omega } = stateAt(t);
  const pe = M * G * L * (1 - Math.cos(theta)), ke = 0.5 * M * L * L * omega * omega;
  return { pe, ke, heat: t < DRAG_ON ? 0 : E0 - pe - ke };
}

export const CAPTIONS: Caption[] = [
  { t0: 3.0, t1: RELEASE + 0.2, text: 'Lift it: it stores energy' },
  { t0: RELEASE + 0.2, t1: 12.4, text: 'Top: all height. Bottom: all speed' },
  { t0: 12.4, t1: DRAG_ON, text: 'The total never changes' },
  { t0: DRAG_ON, t1: 21.6, text: 'Now add air…' },
  { t0: 21.6, t1: END_AT, text: 'each swing loses a little as heat' },
];
export const MUSIC_HITS = [RELEASE, DRAG_ON];
