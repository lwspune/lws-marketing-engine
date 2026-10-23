// @lws.pune · reel 023 (predict-first): differentiate sin x four times. You get…? sin x (A). Each derivative slides the
// wave a quarter turn left (sin → cos → −sin → −cos → sin) while a dial's pointer turns 90°. Then two turns = −y (the
// mirror wave draws itself), and for the faster wave sin 2x each turn also doubles the height, so y″ = −4y. NDA 2019 (I)
// Q83 in the caption. Storyboard (independently reviewed, F31): reels/nda-maths-023-derivative-cycle.storyboard.md.
// Band px throughout. Pure functions of t.
//
// Beat table (from the storyboard):
// | time       | what moves                                          | caption                              |
// | 0–5.2      | four quarter slides; the pointer turns; the pill counts | Each derivative… · Four: back to sin x |
// | 5.2        | A lights; punch-in on the wave                      |                                      |
// | 5.6–8.5    | −sin x draws itself as the mirror wave, tagged (B)  | Two turns: y″ = −y                   |
// | 8.5–9.3    | the dial fades; the panel rescales; sin x → sin 2x  | Twice as fast: each turn ×2 taller   |
// | 9.3–12.3   | two steps, each a quarter slide and ×2 taller        | (same) · Two turns: y″ = −4y         |
// | 12.3–14.0  | hold; pill y″ + 4y = 0                              | So y″ + 4y = 0                       |
import { prog, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { VIVID } from './palette.ts';

export const DURATION = 17.0, END_AT = 14.0, ANSWER_AT = 5.2, COVER_T = 0.5;
export const OPTIONS = ['A   sin x', 'B   −sin x', 'C   cos x'], ANSWER = 0;
export const COLORS = { wave: VIVID.white.blue, mirror: VIVID.white.orange };

type Span = { t: number; dur: number };
export const STEPS: Span[] = [0, 1.3, 2.6, 3.9].map(t => ({ t, dur: 1.3 }));
export const MIRROR: Span = { t: 5.6, dur: 1.4 };
export const SQUEEZE: Span = { t: 8.5, dur: 0.8 };
export const FAST_STEPS: Span[] = [{ t: 9.3, dur: 1.5 }, { t: 10.8, dur: 1.5 }];
const sum = (spans: Span[], t: number) => spans.reduce((s, sp) => s + prog(t, sp.t, sp.dur), 0);

/** How far the wave has turned: π/2 per derivative (sin(x + π/2) = cos x). */
export const phaseAt = (t: number) => (Math.PI / 2) * sum(STEPS, t);
/** The blue wave at t: sin(x + phase) for the first four turns; then sin(kx) squeezing to sin 2x; then each fast step
 *  turns it a quarter and doubles it: 2^n sin(2x + nπ/2), ending on −4 sin 2x. */
export function waveAt(t: number) {
  if (t < SQUEEZE.t) { const p = phaseAt(t); return (x: number) => Math.sin(x + p); }
  const k = 1 + prog(t, SQUEEZE.t, SQUEEZE.dur), n = sum(FAST_STEPS, t);
  return (x: number) => 2 ** n * Math.sin(k * x + (n * Math.PI) / 2);
}
export const mirrorEndAt = (t: number) => -Math.PI + 3 * Math.PI * prog(t, MIRROR.t, MIRROR.dur);

export function pillAt(t: number) {
  if (t < STEPS[0].t + STEPS[0].dur) return 'y = sin x';
  if (t < STEPS[1].t + STEPS[1].dur) return 'y′ = cos x';
  if (t < STEPS[2].t + STEPS[2].dur) return 'y″ = −sin x';
  if (t < STEPS[3].t + STEPS[3].dur) return 'y‴ = −cos x';
  if (t < 6.4) return 'y⁗ = sin x';
  if (t < SQUEEZE.t) return 'y″ = −y';
  if (t < FAST_STEPS[0].t + FAST_STEPS[0].dur) return 'y = sin 2x';
  if (t < FAST_STEPS[1].t + FAST_STEPS[1].dur) return 'y′ = 2 cos 2x';
  if (t < 13.0) return 'y″ = −4 sin 2x';
  return 'y″ + 4y = 0';
}

// The wave panel: x ∈ [−π, 2π] → band x 80…1000; centre and scale change once, while the camera holds still.
export const panelX = (x: number) => 80 + ((x + Math.PI) / (3 * Math.PI)) * 920;
export function panelAt(t: number) {
  const r = prog(t, SQUEEZE.t, SQUEEZE.dur);
  return { cy: 400 + 120 * r, amp: 150 - 90 * r, maxY: t < FAST_STEPS[0].t ? 1 : 2 ** sum(FAST_STEPS, t) };
}
export const DIAL = { cx: 540, cy: 760, r: 130 };

export const CAPTIONS: Caption[] = [
  { t0: 0.3, t1: 2.6, text: 'Each derivative: slide a quarter left' },
  { t0: 3.9, t1: ANSWER_AT, text: 'Four: back to sin x' },
  { t0: ANSWER_AT, t1: SQUEEZE.t, text: 'Two turns: y″ = −y' },
  { t0: SQUEEZE.t, t1: 10.8, text: 'Twice as fast: each turn ×2 taller' },
  { t0: 10.8, t1: 12.3, text: 'Two turns: y″ = −4y' },
  { t0: 12.3, t1: END_AT, text: 'So y″ + 4y = 0' },
];
export const MUSIC_HITS = [ANSWER_AT, 12.3];

// Camera on the wave panel only: [zoom, focus x, focus y], screen = (540 + (x − fx)·z, 515 + (y − fy)·z). Each key's focus
// is chosen so the panel's centre stays where it is (fy = c + (515 − c)/z): it zooms in place and never slides onto the
// dial. A slow push from frame 0, a punch-in landing on the answer, a fast zoom out, nothing while the panel rescales,
// a gentle push for the last line.
const hold = (c: number, z: number) => c + (515 - c) / z;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1, 540, 515],
  keys: [
    { t: 0, dur: 4.6, to: [1.05, 540, hold(400, 1.05)] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.15, 540, hold(400, 1.15)] },
    { t: 5.6, dur: 0.6, to: [1.0, 540, 515] },
    { t: 12.3, dur: 1.7, to: [1.08, 540, hold(520, 1.08)] },
  ],
};

// ---- labels: one list for the picture and the overlap test --------------------------------------------------------
export type Label = { text: string; x: number; y: number; anchor: 'start' | 'middle' | 'end'; size: number; alpha: number; zoomed?: boolean };
export function labelsAt(t: number): Label[] {
  const dial = 1 - prog(t, SQUEEZE.t, 0.5), p = panelAt(t), marks = prog(t, FAST_STEPS[0].t, 0.4);
  const { cx, cy, r } = DIAL, py = (y: number) => p.cy - y * p.amp;
  return [
    { text: 'sin x', x: cx, y: cy - r - 18, anchor: 'middle', size: 36, alpha: dial },
    { text: 'cos x', x: cx + r + 18, y: cy + 12, anchor: 'start', size: 36, alpha: dial },
    { text: '−sin x', x: cx, y: cy + r + 40, anchor: 'middle', size: 36, alpha: dial },
    { text: '−cos x', x: cx - r - 18, y: cy + 12, anchor: 'end', size: 36, alpha: dial },
    { text: '−sin x = only 2 derivatives (B)', x: 300, y: 178, anchor: 'start', size: 34, alpha: prog(t, MIRROR.t + MIRROR.dur, 0.4) * (1 - prog(t, SQUEEZE.t - 0.2, 0.3)) },
    { text: '1', x: panelX(0) - 14, y: py(1) + 11, anchor: 'end', size: 30, alpha: marks, zoomed: true },
    { text: '4', x: panelX(0) - 14, y: py(4) + 11, anchor: 'end', size: 30, alpha: marks, zoomed: true },
  ];
}
export function labelBox(l: Label) {
  const w = [...l.text].length * l.size * 0.5, h = l.size;
  const x0 = l.anchor === 'start' ? l.x : l.anchor === 'end' ? l.x - w : l.x - w / 2;
  return { x0, x1: x0 + w, y0: l.y - 0.8 * h, y1: l.y + 0.2 * h };
}

// Sound: a tick as each slide lands (the fourth gets the knock on the answer), whooshes on the punch-in and zoom out, a
// whump as the mirror wave finishes drawing, a tap as the wave squeezes, ticks as the fast steps land.
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...STEPS.slice(0, 3).map((s, i): Hit => ({ kind: 'click', t: s.t + s.dur, gain: 0.3, pitch: 0.9 + 0.12 * i })),
    { kind: 'thunk', t: ANSWER_AT, gain: 0.5 },
    { kind: 'whump', t: MIRROR.t + MIRROR.dur, gain: 0.35 },
    { kind: 'tap', t: SQUEEZE.t, gain: 0.3 },
    ...FAST_STEPS.map((s, i): Hit => ({ kind: 'click', t: s.t + s.dur, gain: 0.32, pitch: 1.1 + 0.15 * i })),
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [],
};
