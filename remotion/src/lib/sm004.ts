// @soundmindwithshivani reel #4, "my own page": "Your inner critic doesn't get to write your story."
// ME sits on the grass with her notebook. The critic's lines write themselves onto the page in a grey scrawl and ME's
// pen strikes each one out (a hand-drawn strike, @remotion/rough-notation). Close-up on calm ME. The page turns: "Cross it
// out. Write something kinder." Each new line is struck and a little pen doodle grows beside it (pen strokes from
// perfect-freehand). Ending: ME writes I'M ENOUGH, a marker sweeps behind it, the sun comes out, ME smiles. Same structure
// as reels #1–#3 (soundmind/brand.md → Reels). Pure functions of t (seconds), 1080×1920.
import { clamp01, ease } from './motion.ts';
import { textAlpha as textAlphaFor, zoomAt as zoomFor, type TextItem } from './meStory.ts';

export const DURATION = 28;
export const MUSIC = { style: 'calm' as const, chime: 24.7 };
export const SEED = 4004;                                       // rough-notation draws with Math.random unless seeded

export const HOOK: TextItem = { text: "Your inner critic doesn't get to write your story.", t0: 0, t1: 11 };
export const LINE2: TextItem = { text: 'Cross it out. Write something kinder.', t0: 15.8, t1: DURATION };
export const ZOOM = { t0: 11, t1: 15.5, peak: 1.3 };
export const textAlpha = (item: TextItem, t: number) => textAlphaFor(item, t, DURATION);
export const zoomAt = (t: number) => zoomFor(t, ZOOM);

// Scene layout (px): ME sits on the left, her open notebook stands on the grass to her right.
export const ME = { x: 250, headY: 1120, r: 64 };
export const GROUND_Y = 1330;
export const PAGE = { x: 450, y: 830, w: 540, h: 480 };
export const FONT = 36, CHAR_W = 21;                            // Kalam bold capitals at 36 px: about 21 px a letter
const TEXT_X = PAGE.x + 30, ROW_Y = (row: number) => PAGE.y + 60 + row * 82;
export const REST = { x: 610, y: 1298 };                        // where the pen waits: the empty foot of the page

export type Line = { text: string; row: number; t0: number };
export const LINES: Line[] = [
  ...["YOU'RE SO BEHIND", 'TOO LATE NOW', "EVERYONE'S AHEAD", "WHAT'S WRONG WITH YOU?", 'LAZY'].map((text, row) => ({ text, row, t0: 0.8 + 2 * row })),
  ...['TOO MUCH', 'NOT AGAIN', 'NOT ENOUGH'].map((text, row) => ({ text, row, t0: 16.2 + 2.6 * row })),
];
export const FINAL: Line = { text: "I'M ENOUGH", row: 3, t0: 24.0 };

export const wordBox = (l: Line) => {
  const y = ROW_Y(l.row);
  return { x0: TEXT_X, x1: TEXT_X + l.text.length * CHAR_W, y0: y - FONT * 0.8, y1: y + FONT * 0.8 };
};

// A line writes itself left to right (0.7 s), waits, the pen strikes it out (0.4 s), then it fades back.
// (+1e-9: a step that ends exactly on a frame lands on 1, not 0.999…)
export const writeAt = (l: Line, t: number) => clamp01((t - l.t0) / 0.7 + 1e-9);
export const strikeAt = (l: Line, t: number) => clamp01((t - l.t0 - 1.2) / 0.4 + 1e-9);
export const inkAlpha = (l: Line, t: number) => 1 - 0.65 * clamp01((t - l.t0 - 1.6) / 0.4);
export const pageTurnAt = (t: number) => ease(clamp01((t - 15.5) / 0.6));
export const highlightAt = (t: number) => clamp01((t - FINAL.t0 - 0.7) / 0.8);
export const sunAt = (t: number) => ease(clamp01((t - 23.6) / 2.8));
export const smileAt = (t: number) => ease(clamp01((t - 24.6) / 1.2));

// Doodles: one beside each line of the second wave, drawn by the pen just after the strike.
export type Shape = 'heart' | 'star' | 'flower';
export type Doodle = { shape: Shape; row: number; x: number; y: number; size: number; t0: number };
const SECOND = LINES.filter(l => l.t0 > ZOOM.t1);
export const DOODLES: Doodle[] = SECOND.map((l, i) => ({ shape: (['heart', 'star', 'flower'] as Shape[])[i], row: l.row, x: 780, y: ROW_Y(l.row), size: 78, t0: l.t0 + 1.7 }));
export const doodleAt = (d: Doodle, t: number) => clamp01((t - d.t0) / 0.6);

/** The pen's path for a doodle, in units of its size (−0.5 … 0.5), starting at its leftmost point. */
export function doodlePoints(shape: Shape): [number, number][] {
  const n = 48, pts: [number, number][] = [];
  for (let k = 0; k <= n; k++) {
    const a = (2 * Math.PI * k) / n;
    if (shape === 'heart') {                                    // the classic heart curve, from its left lobe
      const s = a + (3 * Math.PI) / 2, x = 16 * Math.sin(s) ** 3, y = 13 * Math.cos(s) - 5 * Math.cos(2 * s) - 2 * Math.cos(3 * s) - Math.cos(4 * s);
      pts.push([x / 34, -y / 34 + 0.05]);
    } else if (shape === 'star') {                              // five points, drawn in one stroke
      const k5 = Math.floor((k / n) * 10) % 10, u = (k / n) * 10 - Math.floor((k / n) * 10);
      const corner = (j: number) => { const b = Math.PI + (j * Math.PI) / 5, r = j % 2 === 0 ? 0.5 : 0.22; return [r * Math.cos(b), r * Math.sin(b)]; };
      const [x0, y0] = corner(k5), [x1, y1] = corner(k5 + 1);
      pts.push([x0 + (x1 - x0) * u, y0 + (y1 - y0) * u]);
    } else {                                                    // a five-petal flower (round petals, narrow waists), from the left
      const b = a + Math.PI, r = 0.06 + 0.44 * Math.abs(Math.cos((5 * b) / 2)) ** 0.6;
      pts.push([r * Math.cos(b), r * Math.sin(b)]);
    }
  }
  return pts;
}
const doodlePoint = (d: Doodle, u: number) => {
  const pts = doodlePoints(d.shape), k = Math.min(pts.length - 1, Math.floor(u * (pts.length - 1))), f = u * (pts.length - 1) - k;
  const [ax, ay] = pts[k], [bx, by] = pts[Math.min(k + 1, pts.length - 1)];
  return { x: d.x + d.size * (ax + (bx - ax) * f), y: d.y + d.size * (ay + (by - ay) * f) };
};

// The pen, as a piecewise-linear path through time: it travels to each line, writes along it, glides back, strikes it
// out, draws the doodle (second wave), and rests at the foot of the page in between and for the close-up.
type P = { t: number; x: number; y: number };
const PEN: P[] = (() => {
  const keys: P[] = [{ t: 0, ...REST }];
  const at = (t: number, x: number, y: number) => {
    const last = keys[keys.length - 1];
    if (t > last.t) keys.push({ t, x, y });
  };
  const hold = (t: number) => { const last = keys[keys.length - 1]; at(t, last.x, last.y); };
  for (const l of LINES) {
    const b = wordBox(l), mid = (b.y0 + b.y1) / 2;
    hold(l.t0 - 0.4);
    at(l.t0, b.x0, mid + 10); at(l.t0 + 0.7, b.x1, mid + 10);  // writing (the pen follows the words)
    at(l.t0 + 1.2, b.x0, mid); at(l.t0 + 1.6, b.x1, mid);       // glide back, then the strike
    const d = DOODLES.find(d => d.row === l.row && d.t0 > l.t0 && d.t0 < l.t0 + 2);
    if (d) for (let k = 0; k <= 24; k++) { const p = doodlePoint(d, k / 24); at(d.t0 + (0.6 * k) / 24, p.x, p.y); }
    if (l === LINES[4]) { at(l.t0 + 2.2, REST.x, REST.y); }      // back to rest for the close-up
  }
  const b = wordBox(FINAL), mid = (b.y0 + b.y1) / 2;
  hold(FINAL.t0 - 0.4); at(FINAL.t0, b.x0, mid + 10); at(FINAL.t0 + 0.7, b.x1, mid + 10);
  at(FINAL.t0 + 1.5, REST.x, REST.y);
  return keys;
})();

export function penAt(t: number) {
  if (t <= PEN[0].t) return { x: PEN[0].x, y: PEN[0].y };
  for (let i = 1; i < PEN.length; i++) {
    const a = PEN[i - 1], b = PEN[i];
    if (t <= b.t) { const u = (t - a.t) / (b.t - a.t); return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }; }
  }
  const z = PEN[PEN.length - 1];
  return { x: z.x, y: z.y };
}
