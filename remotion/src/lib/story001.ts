// @lws.pune · defence story 001 "ONE DAY" (3D): a student stands at Sudan Block's closed gate before sunrise; the sun
// clears the dome, its light reaches him, and his shadow on the red path turns into a cadet's (peaked cap, rifle at the
// slope) while he stands still; the gate opens and he walks in. Our own model of the building (from public photos), no
// crest. Storyboard (independently reviewed, F31): reels/nda-story-001-one-day.storyboard.md. World units: metres; x
// right, y up, z towards the student (the building's front at z = 0, the dome's centre at z = DOME_Z). Pure functions of t.
//
// Beat table (from the storyboard, retimed after the stills):
// | time      | what moves                                                                     | words                      |
// | 0–2.4     | pre-dawn orbit round Sudan Block, at speed from frame 0                        | ONE DAY                    |
// | 2.4–4.0   | the camera glides down the path and lands behind the student at the gate       | Today: outside the gate.   |
// | 4.0–4.8   | slow push; he lifts his head; the dome's rim glows                             |                            |
// | 4.8       | the sun clears the dome: its light reaches him (boom, music hit)               |                            |
// | 5.0–5.8   | crane: tilts down, rises, turns round, ends looking straight down on him       |                            |
// | 5.8–7.2   | his shadow becomes a cadet's (bag fades, cap, rifle); complete on the 7.2 hit  |                            |
// | 7.2–8.2   | the cadet shadow held                                                          |                            |
// | 8.2–8.7   | the camera turns back down behind him; the gate opens (clang)                  |                            |
// | 8.7–9.7   | he walks through (steps 8.85, 9.2, 9.55)                                       | One day: inside.           |
// | 9.7–12.0  | the camera rises and pans up to the dome                                       | ONE DAY · Which year…? 👇  |
import { prog, clamp01, type Caption } from './motion.ts';
import type { Hit, Score } from './sfx.ts';

export type V3 = [number, number, number];
export const DURATION = 12, ORBIT_END = 2.4, SUN_UP = 4.8, GATE_VIEW_T = 4.4;
type Span = { t: number; dur: number };
export const DESCENT: Span = { t: 2.4, dur: 1.6 }, PUSH: Span = { t: 4.0, dur: 0.8 }, CRANE: Span = { t: 4.9, dur: 1.35 };
export const MORPH: Span = { t: 6.1, dur: 1.1 }, HOLD_END = 7.8, TURN_BACK: Span = { t: HOLD_END, dur: 0.6 };
export const GATE: Span = { t: 8.4, dur: 1.0 }, WALK: Span = { t: 8.9, dur: 1.0 }, STEPS = [9.05, 9.4, 9.75];
export const RISE: Span = { t: 9.9, dur: 2.1 };
/** The cover (both pass-1 critics: the strongest image) is the finished cadet shadow, its title under his feet. */
export const COVER_T = 7.5, COVER_TITLE = { y0: 1440, y1: 1600, size: 130 };
export const MUSIC_HITS = [SUN_UP, 7.2];
const DEG = Math.PI / 180;

// ---- the place --------------------------------------------------------------------------------------------------------
// Sudan Block: a long block (110 m × 15 m × 15 m) with a taller central bay (22 m wide, 20 m high), a drum (r 7 m, 6 m)
// and a ribbed dome (r 8.5 m, 13 m) with a finial: 40.5 m to the top (NDA: about 132 ft).
export const BLOCK = { len: 110, h: 15, depth: 15 }, BAY = { w: 22, h: 20, proud: 1 };
export const DRUM = { r: 7, h: 6 }, DOME = { r: 8.5, h: 13 }, FINIAL = 1.5;
export const DOME_Z = -BLOCK.depth / 2, DOME_BASE = BAY.h + DRUM.h, DOME_TOP = DOME_BASE + DOME.h + FINIAL;
export const PATH_W = 6, STUDENT_Z = 120, GATE_Z = 118.5, GATE_HALF = 2.2, GATE_H = 2.4;

// ---- the sun ----------------------------------------------------------------------------------------------------------
// It rises straight behind the dome. At SUN_UP its rays graze the dome's top down to the student's feet: that is when the
// dome's shadow edge reaches him and the light arrives. It keeps rising (7°/s, faster than life, so his shadow isn't
// stretched past reading) to 32°, then holds.
const FEET_LINE = Math.atan(DOME_TOP / (STUDENT_Z - DOME_Z)), RATE = 7 * DEG;
export const sunElevation = (t: number) => Math.min(32 * DEG, Math.max(14 * DEG, FEET_LINE + RATE * (t - SUN_UP)));
/** Where the dome's shadow ends on the path (z). */
export const domeShadowTip = (t: number) => DOME_Z + DOME_TOP / Math.tan(sunElevation(t));
/** The sun's direction (unit vector towards it): behind the building (−z), up by its elevation. */
export const sunDir = (t: number): V3 => [0, Math.sin(sunElevation(t)), -Math.cos(sunElevation(t))];
/** How much sunlight there is: none until the sun clears the dome, full 0.3 s later. */
export const sunlight = (t: number) => prog(t, SUN_UP, 0.3);
/** Dawn: 0 at the deep pre-dawn of frame 0, 1 once the sun is up (sky, glow and fill light follow it). */
export const dawnAt = (t: number) => 0.35 * prog(t, 0, SUN_UP) + 0.65 * prog(t, SUN_UP - 0.6, 1.4);

// ---- his shadow -------------------------------------------------------------------------------------------------------
// The silhouette (seen from behind, x across his body, h up from the ground) as rounded strokes; SIL_H is the texture's
// height, so the shadow on the path is SIL_H ÷ tan(sun) long, pointing at the camera (+z).
export const SIL_H = 2.05;
export const shadowLength = (t: number) => SIL_H / Math.tan(sunElevation(t));
export const morphAt = (t: number) => prog(t, MORPH.t, MORPH.dur);
export type Stroke = { id: string; a: [number, number]; b: [number, number]; r: number };
type Pose = Record<string, Stroke>;
const S = (id: string, a: [number, number], b: [number, number], r: number): Stroke => ({ id, a, b, r });
// The boy: feet apart, a slouch, arms loose, a bag hanging off his right shoulder. The cadet: heels together, squared
// shoulders, arms straight, a peaked cap's wide flat crown, a rifle at the slope over the left shoulder.
const STUDENT: Stroke[] = [
  S('legL', [-0.15, 0.04], [-0.11, 0.86], 0.07), S('legR', [0.15, 0.04], [0.11, 0.86], 0.07),
  S('torso', [0, 0.95], [0, 1.34], 0.17), S('shoulders', [-0.15, 1.38], [0.15, 1.38], 0.07),
  S('armL', [-0.2, 1.36], [-0.28, 0.85], 0.05), S('armR', [0.2, 1.36], [0.27, 0.85], 0.05),
  S('neck', [0, 1.44], [0, 1.53], 0.05), S('head', [0.01, 1.62], [0.02, 1.65], 0.1),
  S('bag', [0.27, 1.32], [0.3, 0.92], 0.13), S('cap', [0, 1.68], [0, 1.68], 0), S('capBand', [0, 1.68], [0, 1.68], 0),
  S('capFill', [0, 1.68], [0, 1.68], 0), S('rifle', [-0.22, 1.25], [-0.22, 1.25], 0),
];
// (The cadet's legs meet at the heels with a gap above, his arms hang clear of his body, and the cap is a narrow band
// under a wide crown: the outline of a peaked cap from behind.)
const CADET: Stroke[] = [
  S('legL', [-0.05, 0.04], [-0.1, 0.88], 0.062), S('legR', [0.05, 0.04], [0.1, 0.88], 0.062),
  S('torso', [0, 0.95], [0, 1.4], 0.19), S('shoulders', [-0.24, 1.46], [0.24, 1.46], 0.075),
  S('armL', [-0.31, 1.42], [-0.3, 0.87], 0.05), S('armR', [0.31, 1.42], [0.3, 0.86], 0.05),
  S('neck', [0, 1.5], [0, 1.58], 0.05), S('head', [0, 1.66], [0, 1.68], 0.1),
  S('bag', [0.27, 1.32], [0.3, 0.92], 0), S('cap', [-0.15, 1.86], [0.15, 1.86], 0.05), S('capBand', [-0.08, 1.76], [0.08, 1.76], 0.045),
  S('capFill', [-0.06, 1.81], [0.06, 1.81], 0.06), S('rifle', [-0.24, 1.22], [-0.46, 1.99], 0.042),
];
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const lerp2 = (a: [number, number], b: [number, number], u: number): [number, number] => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
/** The shadow's shape at morph m (0 = the student, 1 = the cadet): the bag fades first, then the cap grows, then the
 *  rifle rises along its line. */
export function silhouetteAt(m: number) {
  const bag = 1 - clamp01(m * 2), cap = clamp01((m - 0.3) / 0.5), rifle = clamp01((m - 0.5) / 0.5);
  const cad: Pose = Object.fromEntries(CADET.map(s => [s.id, s]));
  const parts = STUDENT.map(s => {
    const c = cad[s.id], u = s.id.startsWith('cap') ? cap : s.id === 'rifle' ? rifle : s.id === 'bag' ? 1 - bag : m;
    return { id: s.id, a: lerp2(s.a, c.a, u), b: lerp2(s.id === 'rifle' ? s.a : s.b, c.b, u), r: lerp(s.r, c.r, u) };
  });
  return { parts, bag, cap, rifle };
}

// ---- the gate and the walk --------------------------------------------------------------------------------------------
/** Heavy: slow to start, then swinging to 80° with a small bounce back off its stop (the clang is the latch going). */
export function gateAngleAt(t: number) {
  const u = clamp01((t - GATE.t) / GATE.dur), swing = u < 0.8 ? (u / 0.8) ** 2 * (3 - 2 * (u / 0.8)) : 1;
  const bounce = u < 0.8 ? 0 : 0.06 * Math.sin((Math.PI * (u - 0.8)) / 0.2);
  return 80 * DEG * (swing - bounce);
}
export const WALK_DIST = 2.1;
export const studentZAt = (t: number) => STUDENT_Z - WALK_DIST * prog(t, WALK.t, WALK.dur);
/** The walk's leg swing (radians, + = the left leg forward) and body bob (m), from the step times. */
export function strideAt(t: number) {
  if (t < WALK.t || t > WALK.t + WALK.dur) return { swing: 0, bob: 0 };
  const u = (t - WALK.t) / WALK.dur, fade = Math.sin(Math.PI * u);
  return { swing: 0.45 * fade * Math.sin(Math.PI * (t - STEPS[0]) / (STEPS[1] - STEPS[0]) + Math.PI / 2), bob: 0.03 * fade * Math.abs(Math.sin(Math.PI * (t - STEPS[0]) / (STEPS[1] - STEPS[0]))) };
}
/** He lifts his head towards the dome before the sun comes (radians, + = up). */
export const headLiftAt = (t: number) => 0.5 * prog(t, PUSH.t, 0.6);

// ---- camera -----------------------------------------------------------------------------------------------------------
export const FRAME = { width: 1080, height: 1920 };
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
type Shot = { position: V3; target: V3; fov: number };
// Low enough that the drum and dome always stand against the sky (both pass-1 critics: no edge of the world, no red dome
// on dark ground for colour-blind eyes).
const ORBIT = { r: 165, h: 17, look: [0, 24, DOME_Z] as V3, fov: 36 };
/** A full turn, at speed on frame 0 and easing out onto the front (F5, F22). */
export const azimuthAt = (t: number) => 2 * Math.PI * (1 - (1 - clamp01(t / ORBIT_END)) ** 2);
const orbitShot = (t: number): Shot => {
  const az = azimuthAt(t);
  return { position: [ORBIT.r * Math.sin(az), ORBIT.h, DOME_Z + ORBIT.r * Math.cos(az)], target: ORBIT.look, fov: ORBIT.fov };
};
const GATE0: Shot = { position: [0.35, 1.5, 124.6], target: [0, 20, DOME_Z], fov: 40 };
const GATE1: Shot = { position: [0.35, 1.5, 124.0], target: [0, 20, DOME_Z], fov: 38 };
// Straight down on him and his shadow, turned round (facing +z), so the shadow stands upright in the frame: his feet at
// the bottom, its head (the cap, later) at the top. The crane turns 180° as it rises and tilts down. It pushes in as the
// shadow shortens.
const down = (p: V3): V3 => [p[0], p[1] - 10 * Math.sin(86 * DEG), p[2] + 10 * Math.cos(86 * DEG)];
const HIGH0: Shot = { position: [0, 8, 120.8], target: down([0, 8, 120.8]), fov: 52 };
const HIGH1: Shot = { position: [0, 7, 120.6], target: down([0, 7, 120.6]), fov: 50 };
const FOLLOW0: Shot = { position: [0.4, 3.4, 124.5], target: [0, 0.9, 112], fov: 46 };
const FOLLOW1: Shot = { position: [0.4, 3.4, 123.0], target: [0, 0.9, 110.5], fov: 46 };
const END: Shot = { position: [0, 8, 108], target: [0, 21, DOME_Z], fov: 42 };
// `aim`: the target gets there in this many seconds (a pan up to the dome before the title comes back). `turn`: for the
// two 180° turns, tilt first and turn once looking straight down ('late'), or turn first and then tilt up ('early'), so
// the turn is a spin of the ground below, never a swing past a pillar or a lawn.
const SHOTS: { span: Span; from: Shot; to: Shot; aim?: number; turn?: 'late' | 'early' }[] = [
  { span: DESCENT, from: orbitShot(ORBIT_END), to: GATE0 },
  { span: PUSH, from: GATE0, to: GATE1 },
  { span: CRANE, from: GATE1, to: HIGH0, turn: 'late' },
  { span: { t: CRANE.t + CRANE.dur, dur: HOLD_END - CRANE.t - CRANE.dur }, from: HIGH0, to: HIGH1 },
  { span: TURN_BACK, from: HIGH1, to: FOLLOW0, turn: 'early' },
  { span: { t: GATE.t, dur: RISE.t - GATE.t }, from: FOLLOW0, to: FOLLOW1 },
  { span: RISE, from: FOLLOW1, to: END, aim: 0.8 },
];
const mix3 = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
/** A shot's heading (0 = towards the building, −z; π = back towards +z), tilt and look distance. Shots blend by these,
 *  not by their targets, so the crane turns round smoothly instead of swinging through its own position. */
function aim(s: Shot) {
  const d = [s.target[0] - s.position[0], s.target[1] - s.position[1], s.target[2] - s.position[2]], flat = Math.hypot(d[0], d[2]);
  return { yaw: Math.atan2(d[0], -d[2]), pitch: Math.atan2(d[1], flat), dist: Math.hypot(d[0], d[1], d[2]) };
}
export function cameraAt(t: number): Camera {
  let shot = orbitShot(t);
  if (t > ORBIT_END) {
    const k = [...SHOTS].reverse().find(s => t >= s.span.t) ?? SHOTS[0], u = prog(t, k.span.t, k.span.dur), v = prog(t, k.span.t, k.aim ?? k.span.dur);
    const { t: t0, dur } = k.span, first = (x: number) => prog(t, t0, dur * x), last = (x: number) => prog(t, t0 + dur * (1 - x), dur * x);
    // late: rise (first 35 %), tilt down (12–35 %), then spin slowly while looking straight down (last 65 %; Motion
    // critic: a quick spin reads as the picture flipping); early: the reverse
    const mid = prog(t, t0 + dur * 0.12, dur * 0.23), mid2 = prog(t, t0 + dur * 0.65, dur * 0.23);
    const vy = k.turn === 'late' ? last(0.65) : k.turn === 'early' ? first(0.65) : v;
    const vp = k.turn === 'late' ? mid : k.turn === 'early' ? mid2 : v;
    const vu = k.turn === 'late' ? first(0.35) : k.turn === 'early' ? last(0.35) : u;
    const a = aim(k.from), b = aim(k.to), yaw = lerp(a.yaw, b.yaw, vy), pitch = lerp(a.pitch, b.pitch, vp), dist = lerp(a.dist, b.dist, v);
    const position = mix3(k.from.position, k.to.position, vu);
    shot = { position, fov: lerp(k.from.fov, k.to.fov, u),
      target: [position[0] + dist * Math.cos(pitch) * Math.sin(yaw), position[1] + dist * Math.sin(pitch), position[2] - dist * Math.cos(pitch) * Math.cos(yaw)] };
  }
  return { ...shot, up: [0, 1, 0], aspect: FRAME.width / FRAME.height };
}
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
/** Where a world point lands on the 1080×1920 frame (the same perspective three.js uses). */
export function project(p: V3, cam: Camera) {
  const f = unit(sub(cam.target, cam.position)), r = unit(cross(f, cam.up)), u = cross(r, f), d = sub(p, cam.position);
  const depth = dot(d, f), k = Math.tan((cam.fov * DEG) / 2);
  return { x: ((dot(d, r) / (depth * k * cam.aspect) + 1) / 2) * FRAME.width, y: ((1 - dot(d, u) / (depth * k)) / 2) * FRAME.height, depth };
}

// ---- words ------------------------------------------------------------------------------------------------------------
export const TITLE = { text: 'ONE DAY', y0: 250, y1: 410, size: 150 };
export const titleAlpha = (t: number) => (1 - prog(t, ORBIT_END, 0.5)) + prog(t, 10.7, 0.4);
// The story lines sit in the title's band while the title is down (both pass-1 critics: never on his shirt); the closing
// question is big, on a solid pill, above Instagram's own overlay.
export const QUESTION: Caption = { t0: 10.3, t1: DURATION + 0.1, text: 'Which year is yours? 👇', size: 74, y: 1400 };
export const CAPTIONS: Caption[] = [
  { t0: 2.95, t1: SUN_UP, text: 'Today: outside the gate.', size: 60, y: 330 },
  { t0: GATE.t, t1: QUESTION.t0, text: 'One day: inside.', size: 60, y: 330 },
  QUESTION,
];
export function captionBox(c: Caption) {
  const size = c.size ?? 60, w = [...c.text].length * size * 0.52 + 64;
  return { x0: 540 - w / 2, x1: 540 + w / 2, y0: (c.y ?? 330) - 0.85 * size, y1: (c.y ?? 330) + 0.85 * size, size };
}

// ---- sound ------------------------------------------------------------------------------------------------------------
// Dawn air from frame 0 (wind + birds), a whoosh as the camera lands behind him and as it cranes up, the boom as the sun
// clears the dome, a shimmer while the shadow changes, the gate's iron clang, a footstep per step.
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    { kind: 'whoosh-in', t: DESCENT.t + DESCENT.dur - 0.45, gain: 0.3 },
    { kind: 'boom', t: SUN_UP, gain: 0.7 },
    { kind: 'whoosh-out', t: CRANE.t + CRANE.dur - 0.45, gain: 0.25 },
    { kind: 'shimmer', t: MORPH.t, gain: 0.5 },
    { kind: 'clang', t: GATE.t, gain: 0.4, pitch: 0.55 },
    { kind: 'thunk', t: GATE.t + 0.8 * GATE.dur, gain: 0.35 },
    ...STEPS.map((t): Hit => ({ kind: 'tap', t, gain: 0.35, pitch: 0.3 })),
  ],
  beds: [{ kind: 'dawn', t0: 0, t1: DURATION, level: t => 0.9 - 0.4 * prog(t, SUN_UP, 1) }],
};
