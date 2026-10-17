// Reel 005, NDA 2023 (II) Maths Q67: ∫₀^8π |sin x| dx = 16. The timeline and geometry of
// reels/nda-maths-005-area.render.html, as pure functions of t (seconds), so the scene can draw any frame.
// |sin x| repeats every π and one hump has area ∫₀^π sin x dx = [−cos x]₀^π = 2, so 8 humps × 2 = 16.
// Traps: (a) 2 counts one hump; (c) 8 takes the period as 2π (4 periods × 2).
import { prog, type Caption } from './motion.ts';

const PI = Math.PI;
export const DURATION = 31.5;
export const ANSWER_AT = 21.8;
export const END_AT = 28.5;
// Graph: x from 0 to xmax maps onto GX0..GX1; the baseline is GY. Clipped to the band CLIP_Y0..CLIP_Y1.
export const GX0 = 130, GX1 = 920, GY = 1230, CLIP_Y0 = 870, CLIP_Y1 = 1460;

export type View = { z: number; xmax: number; amp: number };

// z = 0: all 8 humps; z = 1: zoomed on the first.
export function view(t: number): View {
  const z = prog(t, 10.2, 1.2) - prog(t, 16.0, 1.0);
  return { z, xmax: 8 * PI * Math.pow(1 / 8, z), amp: 210 + 80 * z };
}
export const px = (V: View, x: number) => GX0 + (x / V.xmax) * (GX1 - GX0);
export const py = (V: View, y: number) => GY - y * V.amp;

// sin x while the dips fold up: fold 0 = sin x, fold 1 = |sin x|.
export const f = (x: number, fold: number) => { const s = Math.sin(x); return s < 0 ? s * (1 - 2 * fold) : s; };
export const foldAt = (t: number) => prog(t, 6.6, 2.0);
export const curveEnd = (t: number, V: View) => Math.min(8 * PI * prog(t, 1.0, 4.0), V.xmax);

const n1 = (v: number) => Math.round(v * 10) / 10;

// The curve as two SVG paths, humps and dips, so the dips can be dimmer until they fold up,
// plus the glowing dot that leads it while it draws.
export function curvePaths(t: number, V: View) {
  const fold = foldAt(t), end = curveEnd(t, V), out = { above: '', below: '' };
  if (end > 0) {
    for (const below of [false, true]) {
      let d = '', pen = false;
      for (let i = 0; i <= 480; i++) {
        const x = (end * i) / 480, s = Math.sin(x);
        const isBelow = s < -1e-9 || (s <= 1e-9 && Math.sin(x + 1e-3) < 0);
        if (isBelow !== below) { pen = false; continue; }
        d += `${pen ? 'L' : 'M'}${n1(px(V, x))} ${n1(py(V, f(x, fold)))}`; pen = true;
      }
      out[below ? 'below' : 'above'] = d;
    }
  }
  const drawing = end > 0 && end < 8 * PI - 1e-6 && end < V.xmax;
  return { ...out, belowAlpha: 0.5 + 0.5 * fold, head: drawing ? { x: px(V, end), y: py(V, f(end, fold)) } : null };
}

// The area under one stretch of the curve, as an SVG path.
export function fillPath(V: View, a: number, b: number, fold: number) {
  let d = `M${n1(px(V, a))} ${GY}`;
  for (let i = 0; i <= 60; i++) { const x = a + ((b - a) * i) / 60; d += `L${n1(px(V, x))} ${n1(py(V, f(x, fold)))}`; }
  return d + `L${n1(px(V, b))} ${GY}Z`;
}

// The first hump: midpoint slices grow in, then melt into one smooth area. Then humps 2–8 fill in turn.
export const N = 16, SLICE0 = 11.6, SLICE_GAP = 0.14, MERGE = 14.1, FILL0 = 17.2, FILL_GAP = 0.45;
export const mergeAt = (t: number) => prog(t, MERGE, 0.6);
export const slicesAlpha = (t: number) => (t < SLICE0 ? 0 : 1 - mergeAt(t));
export function slices(t: number, V: View) {
  if (slicesAlpha(t) <= 0) return [];
  const out: { x: number; y: number; w: number; h: number }[] = [];
  for (let i = 0; i < N; i++) {
    const g = prog(t, SLICE0 + i * SLICE_GAP, 0.3); if (g <= 0) continue;
    const a = (i * PI) / N, b = ((i + 1) * PI) / N, h = Math.sin((a + b) / 2) * V.amp * g;
    out.push({ x: px(V, a), y: GY - h, w: px(V, b) - px(V, a), h });
  }
  return out;
}
export const humpAlpha = (t: number, k: number) => (k === 1 ? mergeAt(t) : prog(t, FILL0 + (k - 2) * FILL_GAP, 0.3));
export function humpsShown(t: number) {
  let n = 1; for (let k = 2; k <= 8; k++) if (humpAlpha(t, k) > 0.5) n++;
  return n;
}

export const CAPTIONS: Caption[] = [
  { t0: 0,    t1: 3.2,  text: '8π looks scary.\nWatch the area.' },
  { t0: 3.2,  t1: 6.4,  text: 'Draw sin x from 0 to 8π.' },
  { t0: 6.4,  t1: 10.0, text: 'The modulus flips\nevery dip up.' },
  { t0: 10.0, t1: 13.0, text: 'Zoom in on one hump.' },
  { t0: 13.0, t1: 16.4, text: 'Slices build its area: 2' },
  { t0: 16.4, t1: 21.6, text: 'Same hump, 8 times.' },
  { t0: 21.6, t1: 25.0, text: 'Answer: (d) 16' },
  { t0: 25.0, t1: END_AT, size: 48, text: 'Trap (a) 2: that is one hump.\nTrap (c) 8: period is π, not 2π.' },
];
