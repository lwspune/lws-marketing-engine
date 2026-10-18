// @pyqvault_ · Maths, visualised #2: calculus in one curve (Class 11–12, Limits, Derivatives, Integrals).
// One curve, three ideas in a row: zoom in until it looks straight (limit), that straight bit's slope (derivative, a
// secant shrinking onto the tangent), and thin strips adding up to the area (integral).
// Proven idea: @ubilumapp "Calculus I in 60 seconds", 599k (remake-backlog M2). Pure maths + timing as functions of t.
import { prog, type Caption } from './motion.ts';

export const DURATION = 30.0, END_AT = 26.8;
export const PHASES = { limit: [4.2, 9.8], slope: [10.4, 16.4], area: [17.0, 23.6] } as const;

// The curve on 0 ≤ x ≤ 3: gently rising with a wave in it.
export const f = (x: number) => 0.6 + 0.12 * x * x + 0.15 * Math.sin(2 * x);
export const df = (x: number) => 0.24 * x + 0.3 * Math.cos(2 * x);
export const A = 2.2, X1 = 3;
export const AREA = 0.6 * X1 + 0.04 * X1 ** 3 + 0.075 * (1 - Math.cos(2 * X1)); // ∫₀³ f dx

// Frame mapping: x 0…3.2 → 130…990 px, y 0…2.2 → 1240…580 px.
export const PLOT = { x0: 130, y0: 1240, sx: 860 / 3.2, sy: 660 / 2.2 };
export const px = (x: number) => PLOT.x0 + x * PLOT.sx, py = (y: number) => PLOT.y0 - y * PLOT.sy;

// Limit: a round magnifier on (A, f(A)) zooms ×1 → ×64 (exponentially, so it feels steady).
export const zoomAt = (t: number) => Math.pow(64, prog(t, PHASES.limit[0], PHASES.limit[1] - PHASES.limit[0] - 0.6));
export const INSET = { cx: 390, cy: 730, r: 150 };   // the empty upper left, clear of the curve
// Largest gap (px, inside the magnifier) between the curve and its tangent at A, at a given zoom.
export function insetDeviation(z: number) {
  let worst = 0;
  for (let i = -50; i <= 50; i++) {
    const u = (i / 50) * INSET.r, dx = u / (PLOT.sx * z);           // inset px → x offset
    const gap = (f(A + dx) - f(A) - df(A) * dx) * PLOT.sy * z;      // vertical gap, in inset px
    worst = Math.max(worst, Math.abs(gap));
  }
  return worst;
}

// Derivative: the secant from A to A + h, h shrinking 0.8 → 0.004.
export const hAt = (t: number) => 0.8 * Math.pow(0.005, prog(t, PHASES.slope[0] + 0.4, PHASES.slope[1] - PHASES.slope[0] - 1.2));
export const secantSlope = (h: number) => (f(A + h) - f(A)) / h;

// Integral: 4 → 8 → 16 → 64 strips under the curve from 0 to 3 (midpoint heights).
const STEPS = [4, 8, 16, 64];
export const stripsAt = (t: number) => STEPS[Math.max(0, Math.min(3, Math.floor((t - PHASES.area[0]) / ((PHASES.area[1] - PHASES.area[0]) / 4))))];
export const riemann = (n: number) => { let s = 0; for (let i = 0; i < n; i++) s += f(((i + 0.5) / n) * X1) * (X1 / n); return s; };

export const CAPTIONS: Caption[] = [
  { t0: 3.2, t1: PHASES.limit[0], text: 'One curve. Three big ideas.' },
  { t0: PHASES.limit[0], t1: PHASES.slope[0], text: 'Zoom in: it looks straight\n(limit)' },
  { t0: PHASES.slope[0], t1: PHASES.area[0], text: 'Its slope at that point\n(derivative)' },
  { t0: PHASES.area[0], t1: 23.8, text: 'Add thinner strips: the area\n(integral)' },
  { t0: 23.8, t1: END_AT, text: 'One idea: zoom in.\nThat’s calculus.' },
];
export const MUSIC_HITS = [PHASES.limit[0], PHASES.slope[0], PHASES.area[0]];
