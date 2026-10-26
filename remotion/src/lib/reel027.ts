// @lws.pune · reel 027 (3D, predict-first): unroll each ring of a circle and stack them: what shape? A triangle (B). A thick
// 3D disc of 10 rings is cut at the top; every ring straightens, keeping its length, and they lie flat as a triangle with
// base 2πr (the old rim) and height r (the bottom radius, which never moves): ½ × 2πr × r = πr², half the 2πr × r
// rectangle. Then the rings light from the apex while the area counts up (∫₀ʳ 2πx dx), and the triangle rolls back into
// the disc. Idea: @proof.motion's πr² reel (30×, remake-backlog W29). NDA 2019 (I) Q76 (perimeter ÷ area = 2/r → 3) in
// the caption. Storyboard (independently reviewed, F31): reels/nda-maths-027-circle-area.storyboard.md. World units: x
// right, y up, z towards the camera; the disc's centre at the origin. Pure functions of t.
//
// Beat table (from the storyboard):
// | time       | what moves                                                            | caption                              |
// | 0–3.0      | a tilted 360° orbit; a ripple lifts each ring in turn, twice          | Area = πr². Here's why.              |
// | 3.0–4.4    | the red bottom radius draws, "r"; a white slit cuts the top          | Cut every ring at the top            |
// | 4.4–7.4    | the rings straighten into a triangle; the red radius stays put       | Lay every ring out flat              |
// | 7.4        | B lights; punch-in                                                    |                                      |
// | 7.4–8.8    | the dashed 2πr × r rectangle: the triangle fills half                 | Not a rectangle: inner rings shrink  |
// | 8.8–10.8   | the bottom strip (the rim) glows orange; brace "2πr"                  | Bottom strip = the rim: 2πr          |
// | 10.8–12.8  | push-in on the red radius: the height, "r"                           | Height: the radius that never moved  |
// | 12.8–16.0  | "Area = ½ × 2πr × r", ½ and 2 struck, "= πr²"                         | Triangle: ½ × base × height          |
// | 16.0–19.0  | rings light apex → base, "2π(0.nr)", area so far π(0.nr)² → ∫ line   | Adding thin rings = integration      |
// | 19.0–21.2  | the triangle rolls back into the disc                                 | Same rings, same area                |
import { prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { VIVID } from './palette.ts';

export type V3 = [number, number, number];
export const DURATION = 24.2, END_AT = 21.2, ANSWER_AT = 7.4, COVER_T = 0.5;
export const OPTIONS = ['A   rectangle', 'B   triangle', 'C   semicircle'], ANSWER = 1;
export const COLORS = { ringA: VIVID.white.cyan, ringB: VIVID.white.blue, rim: VIVID.white.orange, radius: VIVID.white.red };

// ---- the disc and the unrolling ---------------------------------------------------------------------------------------
export const R = 1.6, N_RINGS = 10, RING_W = R / N_RINGS, DEPTH = 0.45;

/** Where the point at radius rho, angle phi from the bottom (phi in [−π, π], the cut at ±π) sits at unroll s ∈ [0, 1].
 *  Each ring bends to an arc of radius rho / (1 − s) through its fixed bottom point, so it keeps its length 2π·rho; every
 *  ring is the same curve scaled by rho about the centre, so no two cross; at s = 1 it lies flat at y = −rho. */
export function unroll(rho: number, phi: number, s: number): [number, number] {
  if (s >= 1) return [rho * phi, -rho];
  const a = 1 - s;
  return [(rho * Math.sin(a * phi)) / a, (rho * (s - Math.cos(a * phi))) / a];
}
/** Ring k (0 = the innermost) as a closed outline: its outer edge left to right, then its inner edge back. */
export function ringOutline(k: number, s: number, segs: number): [number, number][] {
  const r0 = k * RING_W, r1 = (k + 1) * RING_W, out: [number, number][] = [];
  for (let i = 0; i <= segs; i++) out.push(unroll(r1, -Math.PI + (2 * Math.PI * i) / segs, s));
  for (let i = segs; i >= 0; i--) out.push(unroll(r0, -Math.PI + (2 * Math.PI * i) / segs, s));
  return out;
}

type Span = { t: number; dur: number };
export const ORBIT_END = 3.0;
export const RADIUS: Span = { t: 3.0, dur: 0.5 }, LABEL_R = 3.3, SLIT: Span = { t: 3.5, dur: 0.5 };
export const UNROLL: Span = { t: 4.4, dur: 3.0 }, ROLLBACK: Span = { t: 19.0, dur: 2.2 };
export const TRAP = { t: ANSWER_AT, dur: 0.6, out: 8.8 }, RIM: Span = { t: 8.8, dur: 0.5 }, HEIGHT: Span = { t: 10.8, dur: 2.0 };
export const FORMULA = { terms: [12.9, 13.4, 13.9], strike: 14.4, result: 15.2 };
export const SWEEP: Span = { t: 16.0, dur: 2.6 }, INTEGRAL_AT = SWEEP.t + SWEEP.dur;
export const sAt = (t: number) => prog(t, UNROLL.t, UNROLL.dur) * (1 - prog(t, ROLLBACK.t, ROLLBACK.dur));

/** The opening ripple: ring k lifts towards the camera as two waves run from the centre to the rim (one already under
 *  way on frame 0). */
const WAVES = [0, 1.4], WAVE_STEP = 0.11, WAVE_HALF = 0.35, LIFT = 0.08;
const waveTimes = (k: number) => WAVES.map(w => w + k * WAVE_STEP);
export function liftAt(k: number, t: number) {
  let h = 0;
  for (const c of waveTimes(k)) { const u = (t - c) / WAVE_HALF; if (Math.abs(u) < 1) h = Math.max(h, 0.5 * (1 + Math.cos(Math.PI * u))); }
  return LIFT * h;
}

/** How many rings are lit in the sweep (from the apex), and the readout for them. */
const STEP = SWEEP.dur / N_RINGS;
export const litCount = (t: number) => (t < SWEEP.t ? 0 : Math.min(N_RINGS, Math.floor((t - SWEEP.t) / STEP) + 1));
export function readoutAt(t: number) {
  if (t < SWEEP.t) return null;
  const n = litCount(t);
  return n < N_RINGS ? `area so far = π(0.${n}r)²` : 'area = πr²';
}
export const lengthLabel = (n: number) => (n < N_RINGS ? `2π(0.${n}r)` : '2πr');

export const CAPTIONS: Caption[] = [
  { t0: 0.3, t1: ORBIT_END, text: 'Area = πr². Here\'s why.' },
  { t0: ORBIT_END, t1: UNROLL.t, text: 'Cut every ring at the top' },
  { t0: 4.6, t1: 7.0, text: 'Lay every ring out flat' },
  { t0: ANSWER_AT, t1: TRAP.out, text: 'Not a rectangle: inner rings shrink' },
  { t0: RIM.t, t1: HEIGHT.t, text: 'Bottom strip = the rim: 2πr' },
  { t0: HEIGHT.t, t1: HEIGHT.t + HEIGHT.dur, text: 'Height: the radius that never moved' },
  { t0: HEIGHT.t + HEIGHT.dur, t1: SWEEP.t, text: 'Triangle: ½ × base × height' },
  { t0: SWEEP.t, t1: ROLLBACK.t, text: 'Adding thin rings = integration' },
  { t0: ROLLBACK.t + 0.2, t1: END_AT, text: 'Same rings, same area' },
];
export const MUSIC_HITS = [ANSWER_AT, FORMULA.result];

// ---- camera ---------------------------------------------------------------------------------------------------------
// One full orbit from frame 0 (F22), looking down 22° easing to 12° (so the strips show their depth), front-on by ORBIT_END; then zooms only: a slow push
// on the cut, a zoom out with the unrolling (the target slides down to the triangle's middle), a punch-in landing on the
// answer, a fast zoom out, a push-in on the height, a fast zoom out, a slow push in the sweep, and back in to the disc.
const DEG = Math.PI / 180, DIST = 20.4, FOV = 30, MID_Y = -R / 2;
export const BAND = { top: 560, height: 940, width: 1080 };
export const azimuthAt = (t: number) => 2 * Math.PI * prog(t, 0, ORBIT_END);
const elevationAt = (t: number) => (22 - 10 * prog(t, 0, ORBIT_END)) * DEG;
export const ZOOM: { start: number[]; keys: Key[] } = {
  start: [2.1],
  keys: [
    { t: ORBIT_END, dur: UNROLL.t - ORBIT_END, to: [2.2] },
    { t: UNROLL.t, dur: 2.65, to: [1] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.08] },
    { t: 8.0, dur: 0.5, to: [1] },
    { t: HEIGHT.t, dur: 0.7, to: [1.5] },
    { t: HEIGHT.t + HEIGHT.dur, dur: 0.6, to: [1] },
    { t: SWEEP.t, dur: SWEEP.dur, to: [1.06] },
    { t: ROLLBACK.t, dur: ROLLBACK.dur, to: [1.9] },
  ],
};
/** Pixels per world unit at the disc's plane for zoom z (the same perspective three.js uses). */
export const ppu = (z: number) => BAND.height / (2 * (DIST / z) * Math.tan((FOV * DEG) / 2));
export const targetAt = (t: number): V3 => [0, MID_Y * prog(t, UNROLL.t, 2.65) * (1 - prog(t, ROLLBACK.t, ROLLBACK.dur)), 0];
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
export function cameraAt(t: number): Camera {
  const az = azimuthAt(t), el = elevationAt(t), d = DIST / tween(t, ZOOM.start, ZOOM.keys)[0], tg = targetAt(t);
  return { position: [tg[0] + d * Math.cos(el) * Math.sin(az), tg[1] + d * Math.sin(el), tg[2] + d * Math.cos(el) * Math.cos(az)],
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
  anchor: 'start' | 'middle' | 'end'; role: 'r' | 'base' | 'length' | 'readout' | 'formula' };
export const FRONT_Z = DEPTH / 2 + 0.03, FORMULA_Y = 1380, FORMULA_SIZE = 56;
export const FORMULA_BOX = { y0: FORMULA_Y - 0.55 * FORMULA_SIZE - 10, y1: FORMULA_Y + 0.55 * FORMULA_SIZE };
export const formulaText = (t: number) => (t < INTEGRAL_AT ? 'Area = ½ × 2πr × r = πr²' : '∫₀ʳ 2πx dx = πr²');
export function labelsAt(t: number): Label[] {
  const n = litCount(t), k = Math.max(0, n - 1), stripY = -(k + 0.5) * RING_W;
  return [
    { text: 'r', at: [0.24, -R / 2, FRONT_Z], size: 48, anchor: 'start', role: 'r',
      alpha: prog(t, LABEL_R, 0.25) * (1 - prog(t, UNROLL.t, 0.3)) + prog(t, HEIGHT.t + 0.2, 0.3) * (1 - prog(t, HEIGHT.t + HEIGHT.dur, 0.3)) },
    { text: '2πr', at: [0, -R - 0.45, FRONT_Z], size: 46, anchor: 'middle', role: 'base', alpha: prog(t, RIM.t + 0.3, 0.3) * (1 - prog(t, HEIGHT.t, 0.3)) },
    { text: lengthLabel(n), at: [Math.max(1.1, 0.5 * Math.PI * (k + 1) * RING_W), stripY, FRONT_Z], size: 36, anchor: 'middle', role: 'length',
      alpha: prog(t, SWEEP.t, 0.15) * (1 - prog(t, INTEGRAL_AT, 0.3)) },
    { text: readoutAt(t) ?? '', at: [0, 0, 0], screen: { x: 60, y: 620 }, size: 44, anchor: 'start', role: 'readout',
      alpha: prog(t, SWEEP.t, 0.3) * (1 - prog(t, ROLLBACK.t, 0.4)) },
    { text: formulaText(t), at: [0, 0, 0], screen: { x: 540, y: FORMULA_Y }, size: FORMULA_SIZE, anchor: 'middle', role: 'formula',
      alpha: prog(t, FORMULA.terms[0], 0.3) },
  ];
}
export function labelBox(l: Label, cam: Camera) {
  const p = l.screen ?? project(l.at, cam), w = [...l.text].length * l.size * 0.52, h = l.size;
  const x0 = l.anchor === 'start' ? p.x : l.anchor === 'end' ? p.x - w : p.x - w / 2;
  return { x0, x1: x0 + w, y0: p.y - 0.55 * h, y1: p.y + 0.55 * h };
}

// ---- sound ----------------------------------------------------------------------------------------------------------
// A soft tap per ring as the ripple lifts it, a tap as the radius is drawn, a snap as the slit finishes the cut, a
// shimmer under the unrolling, a knock on the answer, taps as the brace lands and the height glows, a click per formula
// term and on the strike, a whump on πr², a click per ring in the sweep (rising), a tap on the ∫ line; whooshes on the
// fast zooms only. EFFECTS_GAIN (+2 dB) puts the effects ~9 dB under the music (F16: 5–10 dB).
const EFFECTS_GAIN = 1.25;
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...Array.from({ length: N_RINGS }, (_, k) => waveTimes(k).map((t): Hit => ({ kind: 'tap', t, gain: 0.12, pitch: 1.3 - 0.04 * k }))).flat(),
    { kind: 'tap', t: RADIUS.t + RADIUS.dur, gain: 0.22, pitch: 0.9 },
    { kind: 'snap', t: SLIT.t + SLIT.dur, gain: 0.4 },
    { kind: 'shimmer', t: UNROLL.t, gain: 0.4 },
    { kind: 'thunk', t: ANSWER_AT, gain: 0.5 },
    { kind: 'tap', t: RIM.t + RIM.dur, gain: 0.3, pitch: 0.8 },
    { kind: 'tap', t: HEIGHT.t + 0.7, gain: 0.3, pitch: 0.9 },
    ...FORMULA.terms.map((t, i): Hit => ({ kind: 'click', t, gain: 0.35, pitch: 1 + 0.06 * i })),
    { kind: 'click', t: FORMULA.strike, gain: 0.3, pitch: 0.8 },
    { kind: 'whump', t: FORMULA.result, gain: 0.35 },
    ...Array.from({ length: N_RINGS }, (_, i): Hit => ({ kind: 'click', t: SWEEP.t + i * STEP, gain: 0.32, pitch: 0.9 + 0.05 * i })),
    { kind: 'tap', t: INTEGRAL_AT, gain: 0.3, pitch: 1.1 },
    ...whooshesFor(ZOOM.start, ZOOM.keys),
  ].map(h => ({ ...h, gain: h.gain * EFFECTS_GAIN })),
  beds: [],
};
