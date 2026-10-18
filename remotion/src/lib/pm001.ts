// @pyqvault_ · Maths, visualised #1: sine and cosine in motion (Class 11, Trigonometric Functions).
// A point goes once round a circle: its height draws sin θ to the right, its width draws cos θ downwards. Then the
// cosine graph turns onto the sine axes and slides 90° right, landing exactly on the sine graph: cos θ = sin(θ + 90°).
// Proven idea: @codematrixvishal 3.10M "Trigonometry in Motion" (remake-backlog M1); the landing is our "why".
// Geometry in frame pixels (1080×1920, y down); timing as pure functions of t (seconds).
import { prog, type Caption } from './motion.ts';

export const DURATION = 29.0, END_AT = 25.6;
const TAU = 2 * Math.PI;

export const CIRCLE = { cx: 290, cy: 760, r: 165 };
// The sine graph: θ runs right from the circle's centre line; the cosine graph: θ runs down from below the circle.
export const SINE = { x0: 500, y0: CIRCLE.cy, k: 420 / TAU, amp: CIRCLE.r };   // 420 px a turn: room to slide 90° more
export const COSV = { y0: 990, k: 420 / TAU };

// One turn, steady in the middle and easing at both ends, 4.6 s → 15.0 s.
export const thetaAt = (t: number) => TAU * prog(t, 4.6, 10.4) * 0.5 + TAU * Math.max(0, Math.min(1, (t - 4.6) / 10.4)) * 0.5;

export const pointAt = (th: number) => ({ x: CIRCLE.cx + CIRCLE.r * Math.cos(th), y: CIRCLE.cy - CIRCLE.r * Math.sin(th) });
export const sinPen = (th: number) => ({ x: SINE.x0 + th * SINE.k, y: pointAt(th).y });
export const cosPen = (th: number) => ({ x: pointAt(th).x, y: COSV.y0 + th * COSV.k });

// The payoff, as a rigid move: the vertical cosine graph turns −90° (its θ-axis from "down" to "right") about its own
// origin while that origin travels to the sine graph's origin (morph k: 0 → 1), then slides right by 90° (slide s).
export const morphAt = (t: number) => prog(t, 16.0, 2.2);
export const slideAt = (t: number) => prog(t, 18.6, 2.0);
export function cosCurve(k: number, s: number, upto = TAU) {
  const a = -Math.PI / 2 * k, ca = Math.cos(a), sa = Math.sin(a);
  const ox = CIRCLE.cx + (SINE.x0 - CIRCLE.cx) * k + s * (Math.PI / 2) * SINE.k, oy = COSV.y0 + (SINE.y0 - COSV.y0) * k;
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i <= 160; i++) {
    const th = (upto * i) / 160, lx = CIRCLE.r * Math.cos(th), ly = th * COSV.k; // local: across = cos θ, along = θ (down)
    out.push({ x: ox + lx * ca - ly * sa, y: oy + lx * sa + ly * ca });
  }
  return out;
}
export const sinCurve = (upto = TAU) => Array.from({ length: 161 }, (_, i) => sinPen((upto * i) / 160));

export const CAPTIONS: Caption[] = [
  { t0: 3.2, t1: 4.6, text: 'One point, going round' },
  { t0: 4.6, t1: 9.6, text: 'Its height draws sin θ' },
  { t0: 9.6, t1: 15.4, text: 'Its width draws cos θ' },
  { t0: 16.0, t1: 18.6, text: 'Turn the cos wave…' },
  { t0: 18.6, t1: 21.0, text: '…slide it 90° right' },
  { t0: 21.0, t1: END_AT, text: 'cos is sin, a quarter turn early' },
];
export const MUSIC_HITS = [4.6, 16.0, 20.6];
