// @lws.pune · reel 028 (3D, predict-first): on a circle of radius 1, which line is tan θ? B, the piece of the line that
// touches the circle at (1, 0). The sin–cos triangle (height sin θ, base cos θ) is stretched from the centre by 1/cos θ
// until its base is 1: its height lands on that touching line and is sin θ ÷ cos θ = tan θ. The slant to it cuts the
// circle: sec θ. The same build against the line touching the top gives cot θ and cosec θ; Pythagoras on the two big
// triangles gives 1 + tan²θ = sec²θ and 1 + cot²θ = cosec²θ. Then θ sweeps and all six lengths change with live numbers.
// Idea: @official_neutron_and_numbers' trig reel (59×, remake-backlog W32; theirs draws cot and cosec wrongly). NDA 2024
// (II) Q79 (lim θ→π/2 (sec θ − tan θ) = 0) in the caption. Storyboard (independently reviewed, F31):
// reels/nda-maths-028-trig-lines.storyboard.md. World units: the circle's radius is 1, so a length is its ratio's value;
// x right, y up, z towards the camera; the centre O at the origin. Pure functions of t.
//
// Beat table (from the storyboard):
// | time       | what moves                                                               | caption                                  |
// | 0–3.0      | a 360° orbit: front, a whip round the back (1.0–1.6), front; A (0.05), B (0.5), C (1.9) pulse | Every trig ratio is a real line |
// | 3.1–5.3    | tags fade, B and C dim; the sin–cos triangle fills; sin, then cos glow   | Height sin θ, base cos θ                 |
// | 5.3–6.9    | the triangle grows from O by 1/cos θ; its height lands on x = 1          | Stretch it until the base is 1           |
// | 7.2        | B lights; punch-in; "tan θ = sin θ ÷ cos θ"                              | So the height is tan θ                   |
// | 8.9–11.4   | the touching line x = 1 brightens and runs long; a ring where it touches | Tangent means touching. It touches here. |
// | 11.4–13.8  | the slant lights orange, a flash where it cuts the circle; 1 + tan² = sec²| Secant means cutting. It cuts through.   |
// | 13.8–15.2  | the line touching the top draws; a ring where it touches                 | Same trick at the top                    |
// | 15.2–18.0  | the ray reaches it: cot (violet), θ again at the top, cosec (pink, its cut on the music's accent 16.8) | Cot θ touches. Cosec θ cuts. |
// | 18.0–24.0  | θ sweeps 40° → 62° → 28° → 40°; six live readouts                        | Turn θ: all six lines move · Six ratios… |
// | 24.0–27.3  | end card (its first two lines voiced)                                    |                                          |
import { clamp01, prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { VIVID, WHITE } from './palette.ts';
import type { Shown, VoiceLine } from './voice.ts';

export type V2 = [number, number];
export type V3 = [number, number, number];
export const DURATION = 27.3, END_AT = 24.0, ANSWER_AT = 7.2, ORBIT_END = 3.0, COVER_T = 3.05, THETA0 = 40;
export const HEADER = ['Circle of radius 1.', 'Which line is tan θ?'];
export const OPTIONS = ['A', 'B', 'C'], ANSWER = 1, OPTION_LINES = ['sin', 'tan', 'sec'] as const;
const V = VIVID.white;
export const COLORS = { sin: V.green, cos: V.cyan, tan: V.blue, sec: V.orange, cot: V.violet, cosec: V.pink, circle: WHITE.muted, ray: WHITE.muted };
export type Name = 'sin' | 'cos' | 'tan' | 'sec' | 'cot' | 'cosec';

// ---- the figure ------------------------------------------------------------------------------------------------------
const rad = (d: number) => (d * Math.PI) / 180;
/** Every point of the figure at θ (degrees): P on the circle, M under it, A = (1, 0) and B = (0, 1) where the two
 *  touching lines touch, T and C where θ's ray meets them. */
export function figure(deg: number) {
  const th = rad(deg), c = Math.cos(th), s = Math.sin(th);
  return { th, c, s, P: [c, s] as V2, M: [c, 0] as V2, A: [1, 0] as V2, T: [1, s / c] as V2, B: [0, 1] as V2, C: [c / s, 1] as V2 };
}
/** sec and cosec lie on the same ray, so each gets its own lane beside it: sec on the clockwise side, cosec the other. */
export const LANE = 0.035;
const lane = (p: V2, th: number, side: number): V2 => [p[0] + side * LANE * Math.sin(th), p[1] - side * LANE * Math.cos(th)];

type Span = { t: number; dur: number };
export const PULSES = [0.05, 0.5, 1.9], TAGS_OUT = 3.1, DIM: Span = { t: 3.1, dur: 0.4 }, SLAB_IN: Span = { t: 3.2, dur: 0.4 };
export const SIN_GLOW = 3.45, COS_GLOW = 3.9, STRETCH: Span = { t: 5.3, dur: 1.6 }, SIN_BACK = 7.6, COS_BACK = 8.9;
export const TOUCH: Span = { t: 8.9, dur: 0.7 }, PING_A = 9.6, SEC: Span = { t: 11.4, dur: 0.4 }, CUT1 = 11.9;
export const TOP: Span = { t: 13.8, dur: 0.8 }, PING_B = 14.7, RAY: Span = { t: 15.2, dur: 0.3 }, COT: Span = { t: 15.4, dur: 0.4 };
export const ARC_C = 15.8, COSEC: Span = { t: 16.3, dur: 0.4 }, CUT2 = 16.8, SWEEP_START = 18.0;
export const FORMULAS = [
  { t: 7.4, text: 'tan θ = sin θ ÷ cos θ' },
  { t: 12.6, text: '1 + tan²θ = sec²θ' },
  { t: 17.2, text: '1 + cot²θ = cosec²θ' },
];

const THETA_KEYS: Key[] = [{ t: 18.4, dur: 1.8, to: [62] }, { t: 20.4, dur: 2.2, to: [28] }, { t: 22.8, dur: 1.0, to: [THETA0] }];
export const thetaAt = (t: number) => tween(t, [THETA0], THETA_KEYS)[0];
/** The stretch: the triangle's scale about O, 1 → 1/cos θ. */
export const kAt = (t: number) => 1 + (1 / Math.cos(rad(THETA0)) - 1) * prog(t, STRETCH.t, STRETCH.dur);

const hex = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
export const mix = (a: string, b: string, p: number) =>
  '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * clamp01(p)).toString(16).padStart(2, '0')).join('');
/** A short swell of light: 0 → 1 → 0 over 0.6 s from t0. */
const flash = (t: number, t0: number, d = 0.6) => (t >= t0 && t < t0 + d ? Math.sin((Math.PI * (t - t0)) / d) : 0);

export type Segment = { id: string; a: V2; b: V2; color: string; alpha: number; glow: number; r: number };
/** Every line of the figure at t: one list for the picture and the tests. */
export function segmentsAt(t: number): Segment[] {
  const f = figure(thetaAt(t)), { th } = f, k = kAt(t);
  const dim = (0.2 + 0.8 * (1 - prog(t, DIM.t, DIM.dur)));
  const far: V2 = Math.hypot(...f.T) > Math.hypot(...f.C) ? f.T : f.C;
  const touchUp = 0.25 + 0.05 * prog(t, TOUCH.t, TOUCH.dur), topEnd = Math.max(f.C[0] + 0.3, 1.3), topP = prog(t, TOP.t, TOP.dur);
  const answered = prog(t, ANSWER_AT - 0.3, 0.3);
  const segs: Segment[] = [
    { id: 'radius', a: [0, 0], b: f.P, color: COLORS.circle, alpha: 1, glow: 0, r: 0.014 },
    { id: 'ray', a: f.P, b: far, color: COLORS.ray, alpha: 0.7 * prog(t, RAY.t, RAY.dur), glow: 0, r: 0.009 },
    { id: 'touchRight', a: [1, -touchUp], b: [1, f.T[1] + touchUp], color: COLORS.tan,
      alpha: 0.65 * prog(t, TOUCH.t, TOUCH.dur), glow: 0.4 * flash(t, PING_A - 0.3), r: 0.011 },
    { id: 'touchTop', a: [-0.3, 1], b: [-0.3 + (topEnd + 0.3) * topP, 1], color: COLORS.cot, alpha: 0.65 * Math.min(1, topP * 5), glow: 0.4 * flash(t, PING_B - 0.3), r: 0.011 },
    // the triangle's sides while it is the sin–cos triangle and while it grows; the height becomes tan θ
    { id: 'base', a: [0, 0], b: [k * f.c, 0], color: mix(COLORS.cos, COLORS.circle, prog(t, STRETCH.t, STRETCH.dur)),
      alpha: prog(t, COS_GLOW, 0.3), glow: 0.5 * flash(t, COS_GLOW), r: 0.028 },
    { id: 'height', a: [k * f.c, 0], b: [k * f.c, k * f.s], color: mix(COLORS.sin, COLORS.tan, answered),
      alpha: 1 - prog(t, ANSWER_AT + 0.1, 0.3), glow: 0.6 * flash(t, PULSES[0]) + 0.5 * flash(t, SIN_GLOW), r: 0.03 },
    { id: 'sin', a: f.P, b: f.M, color: COLORS.sin, alpha: prog(t, SIN_BACK, 0.4), glow: 0, r: 0.028 },
    { id: 'cos', a: [0, 0], b: f.M, color: COLORS.cos, alpha: prog(t, COS_BACK, 0.4), glow: 0, r: 0.028 },
    { id: 'tan', a: f.A, b: f.T, color: COLORS.tan, alpha: Math.max(dim, prog(t, ANSWER_AT, 0.3)),
      glow: 0.6 * flash(t, PULSES[1]) + 0.7 * flash(t, ANSWER_AT), r: 0.03 },
    { id: 'sec', a: lane([0, 0], th, 1), b: lane(f.T, th, 1), color: COLORS.sec, alpha: Math.max(dim, prog(t, SEC.t, SEC.dur)),
      glow: 0.6 * flash(t, PULSES[2]) + 0.6 * flash(t, SEC.t), r: 0.028 },
    { id: 'cot', a: f.B, b: f.C, color: COLORS.cot, alpha: prog(t, COT.t, COT.dur), glow: 0.6 * flash(t, COT.t), r: 0.03 },
    { id: 'cosec', a: lane([0, 0], th, -1), b: lane(f.C, th, -1), color: COLORS.cosec, alpha: prog(t, COSEC.t, COSEC.dur),
      glow: 0.6 * flash(t, COSEC.t), r: 0.028 },
  ];
  return segs;
}
/** The triangle as a thin slab: the sin–cos triangle, then (grown) O-A-T; gone in the sweep. */
export function slabAt(t: number) {
  const f = figure(THETA0), k = kAt(t);
  return { pts: [[0, 0], [k * f.c, 0], [k * f.c, k * f.s]] as V2[],
    alpha: (0.2 * prog(t, SLAB_IN.t, SLAB_IN.dur) + 0.12 * flash(t, FORMULAS[1].t - 0.2, 1.2)) * (1 - prog(t, SWEEP_START - 0.3, 0.4)) };
}
/** Where the two touching lines touch (rings that pulse) and where the slants cut the circle (flashes). */
export const PINGS = [{ at: 'A' as const, t: PING_A }, { at: 'B' as const, t: PING_B }];
export const CUTS = [CUT1, CUT2];

export function formulaAt(t: number) {
  if (t < FORMULAS[0].t || t >= SWEEP_START) return null;
  return [...FORMULAS].reverse().find(f => t >= f.t)!.text;
}
/** The six live readouts in the sweep: the true value at this frame's θ, to 2 dp. */
export function readoutsAt(t: number) {
  if (t < SWEEP_START) return null;
  const { th } = figure(thetaAt(t)), v = [Math.sin(th), Math.cos(th), Math.tan(th), 1 / Math.cos(th), 1 / Math.tan(th), 1 / Math.sin(th)];
  return (['sin', 'cos', 'tan', 'sec', 'cot', 'cosec'] as Name[]).map((name, i) => ({ name, value: v[i].toFixed(2) }));
}

export const CAPTIONS: Caption[] = [
  { t0: 0, t1: ORBIT_END, text: 'Every trig ratio is a real line' },
  { t0: 3.1, t1: STRETCH.t, text: 'Height sin θ, base cos θ' },
  { t0: STRETCH.t, t1: ANSWER_AT, text: 'Stretch it until the base is 1' },
  { t0: ANSWER_AT, t1: TOUCH.t, text: 'So the height is tan θ' },
  { t0: TOUCH.t, t1: SEC.t, text: 'Tangent means touching. It touches here.' },
  { t0: SEC.t, t1: TOP.t, text: 'Secant means cutting. It cuts through.' },
  { t0: TOP.t, t1: RAY.t, text: 'Same trick at the top' },
  { t0: RAY.t, t1: SWEEP_START, text: 'Cot θ touches. Cosec θ cuts.' },
  { t0: SWEEP_START, t1: 20.6, text: 'Turn θ: all six lines move' },
  { t0: 21.0, t1: END_AT, text: 'Six ratios. Six real lines.' },
].map(c => ({ ...c, size: 46 }));
export const END_LINES = ['Trig ratios are', 'lengths on one circle.'];
export const END_AT_LINE = [0.2, 0.35];
export const MUSIC_HITS = [ANSWER_AT, CUT2];

// ---- voice (af_heart, the founder's ask for this reel): the question, then each caption, word for word -------------
export const SHOWN: Shown[] = [
  { t0: 0, t1: END_AT, text: HEADER.join('\n') }, ...CAPTIONS,
  { t0: END_AT + END_AT_LINE[1] + 0.35, t1: DURATION, text: END_LINES.join(' ') },
];
export const VOICE: VoiceLine[] = [
  { t: 0.15, until: 3.1, text: HEADER.join(' ') },
  ...CAPTIONS.slice(1).map(c => ({ t: c.t0 + 0.05, until: c.t1, text: c.text })),
  { t: END_AT + END_AT_LINE[1] + 0.35, until: DURATION, text: END_LINES.join(' ') },
];

// ---- camera ---------------------------------------------------------------------------------------------------------
// One full orbit from frame 0 (F22), looking down 20° easing to 5°, front-on by ORBIT_END. Review panel, pass 1: a flat
// figure seen edge-on or from behind can't be read, so the turn holds near the front for ~0.9 s (A and B pulse), whips
// round the back in ~0.6 s (Defence #1's fix) and settles to the front (C pulses): a tanh whip plus a small ease-out
// drift, so it is already turning on frame 0. Then zooms with the target (the second and third values) following the
// action: a slow push from 2.4 s on the triangle, a zoom out as it grows, a punch-in landing on the answer (the far side
// of the circle leaves the frame on purpose; tan θ stays whole), a fast zoom out, a slow push along the touching line, a
// fast zoom out for the slant, a slow drift up to the top pair, a fast zoom out for the sweep.
const DEG = Math.PI / 180, DIST = 6.4, FOV = 30;
export const BAND = { top: 480, height: 1020, width: 1080 };
const WHIP = { at: 1.3, width: 0.3, drift: 0.06 };
export function azimuthAt(t: number) {
  const u = clamp01(t / ORBIT_END), x = (v: number) => (v * ORBIT_END - WHIP.at) / WHIP.width;
  const whip = (Math.tanh(x(u)) - Math.tanh(x(0))) / (Math.tanh(x(1)) - Math.tanh(x(0)));
  return 2 * Math.PI * (WHIP.drift * (1 - (1 - u) ** 2) + (1 - WHIP.drift) * whip);
}
const elevationAt = (t: number) => (20 - 15 * prog(t, 0, ORBIT_END)) * DEG;
export const ZOOM: { start: number[]; keys: Key[] } = {
  start: [1.24, 0.15, 0.05],
  keys: [
    { t: 2.4, dur: 2.2, to: [1.3, 0.3, 0.2] },
    { t: STRETCH.t, dur: 1.5, to: [1.19, 0.3, 0.25] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.42, 0.62, 0.35] },
    { t: TOUCH.t, dur: 0.5, to: [1.19, 0.3, 0.3] },
    { t: TOUCH.t + 0.5, dur: 1.8, to: [1.27, 0.32, 0.3] },
    { t: SEC.t, dur: 0.5, to: [1.17, 0.35, 0.35] },
    { t: TOP.t, dur: 1.4, to: [1.13, 0.35, 0.38] },
    { t: SWEEP_START, dur: 0.6, to: [0.95, 0.45, 0.52] },
  ],
};
/** Pixels per world unit in the figure's plane for zoom z (the same perspective three.js uses). */
export const ppu = (z: number) => BAND.height / (2 * (DIST / z) * Math.tan((FOV * DEG) / 2));
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
export function cameraAt(t: number): Camera {
  const [z, tx, ty] = tween(t, ZOOM.start, ZOOM.keys), az = azimuthAt(t), el = elevationAt(t), d = DIST / z, tg: V3 = [tx, ty, 0];
  return { position: [tx + d * Math.cos(el) * Math.sin(az), ty + d * Math.sin(el), d * Math.cos(el) * Math.cos(az)],
    target: tg, up: [0, 1, 0], fov: FOV, aspect: BAND.width / BAND.height };
}
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
/** Where a world point lands on the 1080×1920 frame. */
export function project(p: V3, cam: Camera) {
  const f = unit(sub(cam.target, cam.position)), r = unit(cross(f, cam.up)), u = cross(r, f), d = sub(p, cam.position);
  const depth = dot(d, f), k = Math.tan((cam.fov * DEG) / 2);
  return { x: ((dot(d, r) / (depth * k * cam.aspect) + 1) / 2) * BAND.width, y: BAND.top + ((1 - dot(d, u) / (depth * k)) / 2) * BAND.height, depth };
}

// ---- labels: one list for the picture and the tests (HTML on top of the 3D, placed with project) ----------------------
export type Label = { text: string; at: V3; screen?: { x: number; y: number }; size: number; alpha: number;
  anchor: 'start' | 'middle' | 'end'; role: 'tag' | 'theta' | 'name' | 'one' | 'pill' | 'formula' | 'readout'; color: string };
export const FORMULA_Y = 545, FORMULA_SIZE = 52, READOUT_Y = [1420, 1472], READOUT_X = [180, 540, 900], READOUT_SIZE = 44;
const Z = 0.05;
const at = (p: V2): V3 => [p[0], p[1], Z];
/** How much the figure faces the camera in the orbit: 1 within 30° of the front, 0 from 60° round (tags would bunch up
 *  edge-on). */
const facing = (t: number) => clamp01((Math.cos(azimuthAt(t)) - Math.cos(60 * DEG)) / (Math.cos(30 * DEG) - Math.cos(60 * DEG)));
export function labelsAt(t: number): Label[] {
  const f = figure(thetaAt(t)), { th } = f, dir: V2 = [f.c, f.s], cw: V2 = [f.s, -f.c], acw: V2 = [-f.s, f.c];
  const along = (p: V2, d: number, n: V2, o: number): V2 => [p[0] + dir[0] * d + n[0] * o, p[1] + dir[1] * d + n[1] * o];
  const tags = facing(t) * (1 - prog(t, TAGS_OUT, 0.3)), sweep = 1 - prog(t, SWEEP_START, 0.4), k = kAt(t), f0 = figure(THETA0);
  const sec = 1 / f.c, bis = [-1 - f.c, -f.s], bl = Math.hypot(bis[0], bis[1]);
  const L = (text: string, p: V2, alpha: number, anchor: Label['anchor'], role: Label['role'], color: string, size = 40): Label =>
    ({ text, at: at(p), size, alpha, anchor, role, color });
  const formula = formulaAt(t);
  return [
    L('A', [f.c - 0.09, f.s / 2], tags, 'end', 'tag', COLORS.sin, 48),
    L('B', [1.09, f.T[1] / 2], tags, 'start', 'tag', COLORS.tan, 48),
    L('C', along([0, 0], 0.62 * sec, acw, 0.2), tags, 'middle', 'tag', COLORS.sec, 48),
    L('θ', [0.3 * Math.cos(th / 2), 0.3 * Math.sin(th / 2)], 1, 'middle', 'theta', COLORS.circle, 36),
    L('1', along([0, 0], 0.45, acw, 0.1), 1 - prog(t, STRETCH.t, 0.3), 'middle', 'one', COLORS.circle, 40),
    L('sin θ', [f.c - 0.05, f.s / 2], prog(t, SIN_GLOW, 0.3) * (1 - prog(t, STRETCH.t, 0.2)) + prog(t, SIN_BACK, 0.4) * sweep, 'end', 'name', COLORS.sin),
    L('cos θ', [f.c / 2, -0.14], prog(t, COS_GLOW, 0.3) * (1 - prog(t, STRETCH.t, 0.2)) + prog(t, COS_BACK, 0.4) * sweep, 'middle', 'name', COLORS.cos),
    L(`× 1/cos θ = ${k.toFixed(2)}`, [k * f0.c, -0.34], prog(t, STRETCH.t, 0.2) * (1 - prog(t, ANSWER_AT, 0.3)), 'middle', 'pill', COLORS.circle, 36),
    L('1', [0.86, -0.14], prog(t, ANSWER_AT - 0.6, 0.3) * sweep, 'middle', 'one', COLORS.circle),
    L('1', [-0.07, 0.5], prog(t, TOP.t + 0.8, 0.3) * sweep, 'end', 'one', COLORS.circle),
    L('tan θ', [1.07, f.T[1] / 2], prog(t, ANSWER_AT, 0.3), 'start', 'name', COLORS.tan),
    L('sec θ', along(f.T, 0.15, cw, 0.1), prog(t, SEC.t, SEC.dur), 'start', 'name', COLORS.sec),
    L('cot θ', [f.C[0] / 2, 0.87], prog(t, COT.t, COT.dur), 'middle', 'name', COLORS.cot),
    L('cosec θ', along(f.C, 0.04, acw, 0.2), prog(t, COSEC.t, COSEC.dur), 'end', 'name', COLORS.cosec),
    L('θ', [f.C[0] + (0.3 * bis[0]) / bl, 1 + (0.3 * bis[1]) / bl], prog(t, ARC_C, 0.3) * sweep, 'middle', 'theta', COLORS.circle, 36),
    { text: formula ?? FORMULAS[2].text, at: [0, 0, 0], screen: { x: 540, y: FORMULA_Y }, size: FORMULA_SIZE, anchor: 'middle', role: 'formula',
      color: WHITE.ink, alpha: formula ? prog(t, FORMULAS[0].t, 0.3) * (1 - prog(t, SWEEP_START - 0.3, 0.3)) : 0 },
    ...(readoutsAt(t) ?? []).map((r, i): Label => ({ text: `${r.name} ${r.value}`, at: [0, 0, 0], size: READOUT_SIZE, anchor: 'middle',
      screen: { x: READOUT_X[i % 3], y: READOUT_Y[Math.floor(i / 3)] }, role: 'readout', color: COLORS[r.name], alpha: prog(t, SWEEP_START, 0.4) })),
  ];
}
export function labelBox(l: Label, cam: Camera) {
  const p = l.screen ?? project(l.at, cam), w = [...l.text].length * l.size * 0.52, h = l.size;
  const x0 = l.anchor === 'start' ? p.x : l.anchor === 'end' ? p.x - w : p.x - w / 2;
  return { x0, x1: x0 + w, y0: p.y - 0.55 * h, y1: p.y + 0.55 * h };
}

// ---- sound ----------------------------------------------------------------------------------------------------------
// A soft tap on each candidate's pulse, a click as sin and then cos glow, a quiet shimmer under the stretch (it builds to
// the answer), a knock on the answer (the loudest hit), a bright tap where each touching line touches, a tick as the top
// line starts, a snap where each slant cuts the circle (the second on the music's accent), a click per formula line and
// as cot draws, a tick every 5° of θ in the sweep (pitch following θ) and a tap at each turnaround, a tap as the end card
// arrives; whooshes on the fast zooms only, the zoom-outs softer. Review panel, pass 1 (Sound): EFFECTS_GAIN 2.5 puts
// the effects ~9 dB under the music (F16: 5–10 dB); the calm piano's bar accents stay (the shared engine), so the
// reel's own hits are made to stand over them.
const EFFECTS_GAIN = 2.5;
function sweepTicks(): Hit[] {
  const out: Hit[] = [], dt = 1 / 240;
  let last = Math.floor(thetaAt(SWEEP_START) / 5);
  for (let t = SWEEP_START; t < END_AT; t += dt) {
    const d = thetaAt(t), bin = Math.floor(d / 5);
    if (bin !== last) out.push({ kind: 'click', t, gain: 0.26, pitch: 0.75 + ((d - 28) / 34) * 0.6 });
    last = bin;
  }
  // a soft tap where θ turns round (62°, then 28°)
  for (const k of THETA_KEYS.slice(0, 2)) out.push({ kind: 'tap', t: k.t + k.dur, gain: 0.3, pitch: k.to[0] > THETA0 ? 1.3 : 0.8 });
  return out;
}
export const SOUND: Score = {
  duration: DURATION,
  hits: ([
    ...PULSES.map((t, i): Hit => ({ kind: 'tap', t, gain: 0.3, pitch: 1.2 - 0.15 * i })),
    { kind: 'click', t: SIN_GLOW, gain: 0.3, pitch: 1.1 },
    { kind: 'click', t: COS_GLOW, gain: 0.3, pitch: 0.95 },
    { kind: 'shimmer', t: STRETCH.t, gain: 0.2 },
    { kind: 'thunk', t: ANSWER_AT, gain: 0.8 },
    ...FORMULAS.map((f, i): Hit => ({ kind: 'click', t: f.t, gain: 0.3, pitch: 1 + 0.08 * i })),
    { kind: 'tap', t: PING_A, gain: 0.32, pitch: 1.6 },
    { kind: 'snap', t: CUT1, gain: 0.38 },
    { kind: 'tap', t: TOP.t, gain: 0.22, pitch: 1.4 },
    { kind: 'tap', t: PING_B, gain: 0.32, pitch: 1.7 },
    { kind: 'click', t: COT.t, gain: 0.3, pitch: 1.2 },
    { kind: 'snap', t: CUT2, gain: 0.38 },
    ...sweepTicks(),
    { kind: 'tap', t: END_AT + 0.2, gain: 0.3, pitch: 1.0 },
    ...whooshesFor(ZOOM.start, ZOOM.keys).map(w => (w.kind === 'whoosh-out' ? { ...w, gain: w.gain * 0.6 } : w)),
  ] as Hit[]).map(h => ({ ...h, gain: h.gain * EFFECTS_GAIN })),
  beds: [],
};
