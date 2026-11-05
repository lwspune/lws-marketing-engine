// @lws.pune · NDA Life #1 (3D): NDA campus tour. A toy-like model of the campus turns once (F22) under "6 places every NDA
// cadet knows", six numbered pins and a dotted route on it. The camera visits each place in turn (Sudan Block, a squadron
// building with its squadron at PT, a pool with swimmers, the riding ring, Peacock Bay's sails) and ends at Khetarpal
// Ground, where only the passing-out course marches over the gold Antim Pag band; three jets pass; the camera rises to the
// whole campus under the end card. Founder, 2026-11-03: "make this reel as campus tour", replacing the first version's
// guess-the-place question. Facts and sources: storyboard § 8 (PIB, NDA's joining instructions, UPSC). Storyboard
// (independently reviewed, F31): reels/nda-life-001-campus.storyboard.md. World units are metres; not to scale.
//
// Beat table (from the storyboard):
// | time       | what moves                                                         | words                               |
// | 0–4.0      | the model, one full orbit; pins pop 1→6 (0.4–2.15); the route draws 0.5–3.5 | header + six dots            |
// | 4.0–19.0   | five places, 3 s each: a 1.5 s glide, 1.5 s there (the first glide starts at 3.4, in the turn); the place's pin
//              comes up and pulses 1.2 s into its glide, once on screen (5.2, 8.2, 11.2, 14.2, 17.2, 20.2)  | pill · one line each |
// | 19.0–21.3  | glide to Khetarpal Ground, the blocks (there from frame 0) mark time; push in, the gold band | 6 · Khetarpal Ground · Where cadets pass out. |
// | 21.3–24.9  | low beside the band: only the course steps off and crosses it, rank by rank (22.9–24.66) | The last step: Antim Pag. |
// | 24.9–26.5  | to a camera off the jets' path; three jets fly in and pass close     |                                     |
// | 26.5–29.7  | pull back to the whole campus; end card 27.7                       | It starts with the written exam: maths is 300 of 900 marks. / Follow for more |
import { prog, tween, captionAt, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { WHITE } from './palette.ts';
import { DOME_TOP } from './story001.ts';

export type V3 = [number, number, number];
export const ORBIT_END = 4.0, COVER_T = 3.6, GROUND_AT = 20.5, MARCH_GO = 21.3;
/** The jets' part, 12.1 s later than in the first cut: its camera, jets, shake and roar hang off this. */
const J = 12.1;
export const PULL = 14.4 + J, END_AT = PULL + 1.2, DURATION = END_AT + 2.0;
export const HEADER = ['6 places every', 'NDA cadet knows'];

// ---- the model (not to scale) ------------------------------------------------------------------------------------------
export const BASE = { x0: -200, x1: 240, z0: -235, z1: 85, h: 12 };
export const SUDAN = { x: 0, z: -90 };                                  // its front face; the dome's centre is 7.5 m behind
export const GROUND = { x0: -90, x1: 90, z0: -74, z1: 16 };
export const LINE = { z: -58, half: 40, width: 2.4 };                    // the Antim Pag: a gold band, not a hairline
/** Deep gold on a dark navy edge: it reads against the grass by brightness, not only by hue (panel, Colour: colour-blind). */
export const ANTIM = { gold: '#e0a400', edge: '#1f2a4a' };
export const LAKE = { x: 165, z: -40, rx: 55, rz: 95 };
export const SQUADRON = { x: -135, z: -88, w: 44, d: 14, h: 12 };        // a squadron building, its front facing +z
export const LAWN = { x: -135, z: -58, w: 40, d: 24 };                   // its lawn, where the squadron does PT
export const POOL = { x: -150, z: 40, w: 40, d: 22, lanes: 6 };
export const RING = { x: 68, z: 52, rx: 24, rz: 15 };                    // the riding ring: sand inside a white rail
export type Hill = { x: number; z: number; r: number; h: number };
export const HILLS: Hill[] = [
  { x: -150, z: -195, r: 40, h: 55 }, { x: -62, z: -200, r: 35, h: 42 }, { x: 35, z: -196, r: 39, h: 62 },
  { x: 130, z: -196, r: 39, h: 50 }, { x: 205, z: -200, r: 30, h: 36 }, { x: -178, z: -110, r: 22, h: 36 }, { x: -180, z: -25, r: 20, h: 26 },
];
/** Other campus buildings, unnamed (x, z = centre; w along x, d along z). */
export const BUILDINGS = [
  { x: -140, z: -125, w: 40, d: 16, h: 10 }, { x: -138, z: 8, w: 36, d: 16, h: 9 }, { x: 88, z: -122, w: 30, d: 14, h: 10 },
  { x: -62, z: -140, w: 34, d: 14, h: 10 }, { x: 62, z: -142, w: 34, d: 14, h: 10 }, { x: -40, z: 56, w: 40, d: 14, h: 9 },
];

// ---- the six places and their pins -------------------------------------------------------------------------------------
export const GRASS = '#79a858', WATER = '#3fa0dc', PIN_COLOR = WHITE.ink, NOW = WHITE.green;
export const PLACES = [
  { name: 'Sudan Block', pin: [0, DOME_TOP + 14, SUDAN.z - 7.5] as V3 },
  { name: 'Squadron building', pin: [SQUADRON.x, SQUADRON.h + 10, SQUADRON.z] as V3 },
  { name: 'Swimming pool', pin: [POOL.x, 8, POOL.z] as V3 },
  { name: 'Horse riding', pin: [RING.x, 10, RING.z] as V3 },
  { name: 'Peacock Bay', pin: [LAKE.x, 22, LAKE.z] as V3 },
  { name: 'Khetarpal Ground', pin: [0, 7, -29] as V3 },
];
export const PINS = PLACES.map((p, i) => ({ number: String(i + 1), color: PIN_COLOR, at: p.pin }));
/** Each visit: the glide starts at `go` and arrives 1.5 s later; a new place every 3 s (F2's floor, v1.15). Its pin comes up
 *  and pulses at `pulse`, once the place is on screen (mid-glide a pin rose through the label zone). */
export const STOPS = PLACES.map((_, i) => ({ place: i, go: ORBIT_END + 3 * i, settled: ORBIT_END + 3 * i + 1.5, pulse: ORBIT_END + 3 * i + 1.2 }));
export const PIN = { r: 32, tip: 18 };

/** The tour's route on the ground, 1 → 6 (gold discs). */
export const ROUTE: V3[] = [[0, 0.3, -78], [-135, 0.3, -44], [-126, 0.3, 40], [44, 0.3, 52], [104, 0.3, -20], [0, 0.3, -29]];
/** How much of the route is drawn (0…1, by length) and how strongly: drawn in the opening, then fainter. */
export const routeAt = (t: number) => ({ shown: prog(t, 0.5, 3.0), alpha: (1 - 0.45 * prog(t, ORBIT_END, 0.6)) * (1 - prog(t, PULL, 0.6)) });
/** Gold discs every 7 m along the route, each with the fraction of the route it sits at. */
export function routeDots() {
  const segs = ROUTE.slice(1).map((b, i) => { const a = ROUTE[i]; return { a, b, len: Math.hypot(b[0] - a[0], b[2] - a[2]) }; });
  const total = segs.reduce((s, x) => s + x.len, 0), out: { p: V3; f: number }[] = [];
  let run = 0;
  for (const s of segs) {
    for (let d = 0; d < s.len; d += 7) { const u = d / s.len; out.push({ p: [s.a[0] + (s.b[0] - s.a[0]) * u, 0.3, s.a[2] + (s.b[2] - s.a[2]) * u], f: (run + d) / total }); }
    run += s.len;
  }
  return out;
}
/** The header's six dots: "now" while a place is visited, then "done". */
export function dotState(i: number, t: number): 'next' | 'now' | 'done' {
  if (t < STOPS[i].go) return 'next';
  return i < STOPS.length - 1 && t >= STOPS[i + 1].go ? 'done' : 'now';
}

// ---- camera: [zoom = 1000 / distance, target x, y, z, elevation°, azimuth°] ---------------------------------------------
const S = (d: number, tg: V3, el: number, az: number) => [1000 / d, ...tg, el, az];
const WIDE = S(1360, [20, 0, -75], 64, 0);           // from high up, so the slab fills the band (≤ 960 px wide at every angle)
export const CAM: { start: number[]; keys: Key[] } = {
  start: WIDE,
  keys: [
    // 1: down to Sudan Block, starting while the turn is still going (panel, Motion: the opening settled to a stop)
    { t: ORBIT_END - 0.6, dur: 2.1, to: S(165, [0, 32, -97], 16, 15) },
    { t: 5.5, dur: 1.5, to: S(165, [0, 32, -97], 15, 36) },             //    a slow arc round the dome, the same way round
    { t: 7.0, dur: 1.5, to: S(118, [SQUADRON.x, 4, -64], 22, -28) },    // 2: close on the lawn: the squadron at PT, the building behind
    { t: 8.5, dur: 1.5, to: S(110, [SQUADRON.x, 4, -64], 21, -16) },
    { t: 10.0, dur: 1.5, to: S(92, [POOL.x, 0, POOL.z], 36, -20) },     // 3: the pool filling the frame (panel, Colour: swimmers were dashes)
    { t: 11.5, dur: 1.5, to: S(85, [POOL.x, 0, POOL.z], 35, -8) },
    { t: 13.0, dur: 1.5, to: S(115, [RING.x, 3, RING.z], 26, 20) },     // 4: the riding ring
    { t: 14.5, dur: 1.5, to: S(105, [RING.x, 3, RING.z], 25, 34) },
    { t: 16.0, dur: 1.5, to: S(150, [LAKE.x, 4, LAKE.z], 15, -10) },    // 5: Peacock Bay
    { t: 17.5, dur: 1.5, to: S(150, [LAKE.x + 5, 3, LAKE.z - 5], 16, 8) }, //  low over the boats
    { t: 19.0, dur: 1.5, to: S(240, [0, 6, -34], 28, 0) },              // 6: Khetarpal Ground
    { t: GROUND_AT, dur: 0.95, to: S(200, [0, 7, -34], 27, 0) },        //    push in as the band appears (slow: no whoosh, panel Sound: clutter)
    { t: MARCH_GO, dur: 1.2, to: S(85, [0, 3, LINE.z], 11, 62) },       //    swing low beside the band
    { t: MARCH_GO + 1.2, dur: 2.0, to: S(75, [0, 3, LINE.z - 4], 10, 72) },
    { t: 12.8 + J, dur: 1.0, to: S(300, [-30, 60, 20], -3, -41) },      // off the jets' path, looking up the way they come
    { t: 13.8 + J, dur: 0.6, to: S(221, [-106, 62, 62], -4.6, -33) },   // the camera holds; the look follows them past
    { t: PULL, dur: 1.2, to: S(1360, [20, 0, 90], 64, 0) },             // pull back to the whole campus, clear of the end card
    { t: END_AT, dur: DURATION - END_AT, to: S(1360, [20, 0, 90], 64, 8) },  // a slow drift round
  ],
};
/** The orbit (F22): one full turn from frame 0, at speed on frame 0 and easing out only, back at the front at 4.0. */
export const orbitAt = (t: number) => { const u = Math.min(1, Math.max(0, t / ORBIT_END)); return 360 * (1 - (1 - u) ** 2); };
const DEG = Math.PI / 180, FOV = 30;
export const BAND = { top: 470, height: 1230, width: 1080 };   // to y 1700: the picture runs under the captions
export const SAFE_BOTTOM = 1600;                                 // nothing to read below this (Instagram's caption and buttons)
export const azimuthAt = (t: number) => tween(t, CAM.start, CAM.keys)[5] + orbitAt(t);
/** A small shake as the jets pass the camera. */
const shake = (t: number) => { const a = Math.max(0, 1 - Math.abs(t - 14.15 - J) / 0.3); return [Math.sin(t * 91) * a * 0.6, Math.sin(t * 67 + 1) * a * 0.5, 0]; };
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
export function cameraAt(t: number): Camera {
  const [z, tx, ty, tz, el] = tween(t, CAM.start, CAM.keys), az = azimuthAt(t) * DEG, d = 1000 / z, e = el * DEG, k = shake(t);
  return {
    position: [tx + d * Math.cos(e) * Math.sin(az) + k[0], ty + d * Math.sin(e) + k[1], tz + d * Math.cos(e) * Math.cos(az)],
    target: [tx, ty, tz], up: [0, 1, 0], fov: FOV, aspect: BAND.width / BAND.height,
  };
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

const bump = (t: number, at: number, dur: number) => (t < at || t > at + dur ? 0 : Math.sin((Math.PI * (t - at)) / dur));
/** A pin's size: each pops in turn in the opening (one every 0.35 s), and pulses once its place is on screen (review B4). */
export const popAt = (i: number, t: number) => 1 + 0.25 * bump(t, 0.4 + 0.35 * i, 0.35) + 0.3 * bump(t, STOPS[i].pulse, 0.4);
/** All six pins in the orbit; once the tour starts, only the current place's (each fades in / out over 0.3 s). Pin 6
 *  leaves as the camera swings low beside the band (review: it would sit over the ranks). */
const shown = (t: number, a: number, b: number) => (a <= 0 ? 1 : prog(t, a, 0.3)) * (1 - prog(t, b, 0.3));
const windowOf = (i: number): [number, number][] => [[0, ORBIT_END], [STOPS[i].pulse - 0.1, i < 5 ? STOPS[i + 1].go : MARCH_GO]];
const focusAt = (i: number, t: number) => Math.min(1, windowOf(i).reduce((s, [a, b]) => s + shown(t, a, b), 0));
/** A pin at t: where its tip lands on screen (bobbing), how visible it is, its pulse. */
export function pinAt(i: number, t: number) {
  const p = PINS[i], q = project(p.at, cameraAt(t)), s = { ...q, y: q.y + 5 * Math.sin((2 * Math.PI * t) / 1.3 + 2 * i) };
  const inBand = Math.min(1, Math.max(0, (s.y - (BAND.top + 2 * PIN.r + PIN.tip)) / 30), Math.max(0, (SAFE_BOTTOM - s.y) / 30),
    Math.max(0, (s.x - PIN.r) / 30), Math.max(0, (BAND.width - PIN.r - s.x) / 30));
  const alpha = (s.depth > 0 ? inBand : 0) * (1 - prog(t, PULL, 0.4)) * focusAt(i, t);
  return { x: s.x, y: s.y, depth: s.depth, alpha, color: p.color, number: p.number, pop: popAt(i, t), now: t >= STOPS[i].go };
}

// ---- the parade -----------------------------------------------------------------------------------------------------
const SPEED = 5.0, HALT = MARCH_GO + 3.6;
export type Block = { x: number; z: number; rows: number; cols: number; dx: number; dz: number; course: boolean };
const XS = [-54, -18, 18, 54];
export const BLOCKS: Block[] = [-50, -24].flatMap((z, row) => XS.map((x): Block =>
  ({ x, z, rows: 5, cols: 6, dx: 2.2, dz: 2.2, course: row === 0 && Math.abs(x) < 30 })));
export type Figure = { x: number; y: number; z: number; course: boolean; rank: number; step: number; spread: number };
const leadZ = (b: Block, t: number) => (b.course && t > MARCH_GO ? b.z - SPEED * (Math.min(t, HALT) - MARCH_GO) : b.z);
/** Every cadet on the ground at t: the blocks stand there from frame 0 (a tease of the finale, review I3), mark time once
 *  the camera heads for the ground, and only the passing-out course marches over the line, halting at HALT. */
export function figuresAt(t: number): Figure[] {
  const out: Figure[] = [], marking = STOPS[5].go;
  for (const b of BLOCKS) {
    const lz = leadZ(b, t), moving = b.course && t > MARCH_GO && t < HALT;
    for (let r = 0; r < b.rows; r++) for (let c = 0; c < b.cols; c++) {
      out.push({ x: b.x - ((b.cols - 1) * b.dx) / 2 + c * b.dx, y: 0, z: lz + r * b.dz, course: b.course, rank: r, spread: 0,
        step: t < marking ? 0 : Math.sin(2 * Math.PI * (moving ? 1.5 : 1.2) * (t - marking) + (moving ? 0 : r)) });
    }
  }
  return out;
}
/** When each rank of the course crosses the line (the leading rank first). */
export function crossingTimes() {
  const b = BLOCKS.find(x => x.course)!;
  return Array.from({ length: b.rows }, (_, r) => MARCH_GO + (b.z + r * b.dz - LINE.z) / SPEED);
}
/** The gold line's flash: 1 as a rank crosses, fading in 0.12 s. */
export const lineFlashAt = (t: number) => Math.max(0, ...crossingTimes().map(c => (t >= c ? Math.exp(-(t - c) / 0.12) : 0)));

// ---- PT on the squadron's lawn: star jumps in time, all reel long --------------------------------------------------------
const JUMP_HZ = 1.5;
const jump = (t: number) => Math.abs(Math.sin(Math.PI * JUMP_HZ * t));   // 0 on the ground, 1 at the top: one jump every 1/1.5 s
export function ptAt(t: number): Figure[] {
  const out: Figure[] = [], j = jump(t);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++)
    out.push({ x: LAWN.x - 12.6 + 3.6 * c, y: 1.4 * j, z: LAWN.z - 6.8 + 3.4 * r, course: false, rank: r, step: 0, spread: j });
  return out;
}
/** When a jump lands (for the claps). */
const landings = (a: number, b: number) => { const out: number[] = []; for (let k = Math.ceil(a * JUMP_HZ); k / JUMP_HZ < b; k++) out.push(k / JUMP_HZ); return out; };

// ---- swimmers doing lengths -------------------------------------------------------------------------------------------
const SWIM = 1.6, LEN = POOL.w - 6;
export function swimmersAt(t: number) {
  const lane = POOL.d / POOL.lanes;
  return [0, 1, 3, 4].map((k, i) => {
    const s = (SWIM * t + 9 * i) % (2 * LEN), back = s > LEN, u = back ? 2 * LEN - s : s;
    return { x: POOL.x - LEN / 2 + u, z: POOL.z - POOL.d / 2 + lane * (k + 0.5), dir: back ? -1 : 1 };
  });
}

// ---- horses trotting round the ring --------------------------------------------------------------------------------------
const TROT = 0.45, TROT_HZ = 2.4;
export function horsesAt(t: number) {
  return [0, 1, 2].map(k => {
    const a = TROT * t + (2 * Math.PI * k) / 3, x = RING.x + 0.78 * RING.rx * Math.cos(a), z = RING.z + 0.78 * RING.rz * Math.sin(a);
    return { x, z, heading: Math.atan2(-RING.rx * Math.sin(a), RING.rz * Math.cos(a)), stride: Math.sin(2 * Math.PI * TROT_HZ * t + k) };
  });
}

// ---- boats on the lake (white sails) -----------------------------------------------------------------------------------
export const SAIL = '#fbfaf5';
export function boatsAt(t: number) {
  const u = t - 9.3;   // where they sailed in the first cut when the camera came over the lake (6.7 s then, 16.0 s now)
  return [0, 1, 2, 3, 4].map(k => {
    const a = 0.9 * k + 0.09 * u * (k % 2 ? 1 : -1), rr = 0.35 + 0.12 * (k % 3);
    const x = LAKE.x + LAKE.rx * rr * Math.cos(a), z = LAKE.z + LAKE.rz * rr * 1.2 * Math.sin(a);
    const heading = Math.atan2(-LAKE.rx * Math.sin(a), LAKE.rz * 1.2 * Math.cos(a)) + (k % 2 ? 0 : Math.PI);
    return { x, z, heading, rock: 0.05 * Math.sin(2.1 * t + k), sail: SAIL };
  });
}

// ---- jets (a Su-30 fly-past, PIB; three in a vee, no smoke) --------------------------------------------------------------
export const JET = { span: 44, len: 60, speed: 200, smoke: false };   // a fly-past speed (~700 km/h); a third bigger (panel, Drama: specks)
const JET_Q: V3 = [-30, 60, 20], JET_AT = 13.7 + J, JET_DIR = unit([-1, 0.03, 0.55]), JET_SIDE = unit(cross([0, 1, 0], JET_DIR));
export function jetsAt(t: number) {
  if (t < 13.0 + J || t >= PULL) return [];
  const s = JET.speed * (t - JET_AT), lead: V3 = [JET_Q[0] + JET_DIR[0] * s, JET_Q[1] + JET_DIR[1] * s, JET_Q[2] + JET_DIR[2] * s];
  return [0, -1, 1].map(k => ({
    pos: [lead[0] - Math.abs(k) * 30 * JET_DIR[0] + k * 40 * JET_SIDE[0], lead[1], lead[2] - Math.abs(k) * 30 * JET_DIR[2] + k * 40 * JET_SIDE[2]] as V3,
    dir: JET_DIR, side: JET_SIDE,
  }));
}

/** A blue sky behind the picture only while the camera looks up at the jets (panel: dark jets on the cream page read as
 *  cut-outs); the rest of the reel stays on the white board (F12). */
export const skyAt = (t: number) => prog(t, 12.8 + J, 0.4) * (1 - prog(t, PULL, 0.5));

// ---- light: a golden afternoon, then low and orange in the pull-back -----------------------------------------------------
export function lightAt(t: number) {
  const low = prog(t, PULL, 1.2);
  return { elevation: 32 - 24 * low, azimuth: -110, warm: low, intensity: 3.0 - 0.9 * low, glow: 0.12 + 0.6 * low };
}

// ---- words ----------------------------------------------------------------------------------------------------------
export const PILL = { y: 1370, size: 40 }, CAPTION_Y = 1490, CAPTION_SIZE = 48;
/** Each place's pill: from halfway through its glide to halfway through the next (the last one until the pull-back). */
export const PILLS = PLACES.map((p, i) => ({ t0: STOPS[i].go + 0.75, t1: i < 5 ? STOPS[i + 1].go + 0.75 : PULL, text: `${i + 1} · ${p.name}` }));
const LINES = ["NDA's landmark building.", 'Cadets live in squadrons.', "One of NDA's three pools.", 'Cadets learn horse riding.', 'Water sports all year round.'];
export const CAPTIONS: Caption[] = [
  // each from 0.3 s before the camera arrives until the next glide (1.8 s)
  ...LINES.map((text, i) => ({ t0: STOPS[i].settled - 0.3, t1: STOPS[i + 1].go, text })),
  { t0: GROUND_AT - 0.3, t1: 22.0, text: 'Where cadets pass out.' },
  { t0: 22.0, t1: HALT, text: 'The last step: Antim Pag.' },
].map(c => ({ ...c, size: CAPTION_SIZE, y: CAPTION_Y }));
export type EndLine = { at: number; text: string; size: number; weight: number; y: number };
export const END_PANEL = { top: 1225, height: 300 };
export const END_LINES: EndLine[] = [
  // one sentence on two rows, arriving together (review B2: one takeaway line)
  { at: 0, text: 'It starts with the written exam:', size: 48, weight: 700, y: 1300 },
  { at: 0, text: 'maths is 300 of 900 marks.', size: 48, weight: 700, y: 1370 },
  { at: 0.8, text: 'Follow for more', size: 64, weight: 700, y: 1462 },
];
/** The cover's hook (cover only, the header hidden): on the board above the picture, inside the 3:4 crop (review B3). */
export const COVER_CAPTION = { text: '6 places every\nNDA cadet knows', y: 350, size: 56 };

type Box = { text: string; x0: number; x1: number; y0: number; y1: number; pin?: boolean };
/** The board's Caption card: 48 px side padding, 30 px top and bottom, line height 1.22. */
export function captionBox(c: Caption) {
  const size = c.size ?? CAPTION_SIZE, w = [...c.text].length * size * 0.52 + 96, h = size * 1.22 + 60, y = c.y ?? CAPTION_Y;
  return { x0: 540 - w / 2, x1: 540 + w / 2, y0: y - h / 2, y1: y + h / 2 };
}
export function endLineBox(l: EndLine) {
  const w = [...l.text].length * l.size * 0.52;
  return { x0: 540 - w / 2, x1: 540 + w / 2, y0: l.y - 0.65 * l.size, y1: l.y + 0.65 * l.size };
}
export const pillAt = (t: number) => PILLS.find(p => t >= p.t0 && t < p.t1) ?? null;
export function pillBox(text: string) {
  const w = [...text].length * PILL.size * 0.55 + 72;
  return { x0: 540 - w / 2, x1: 540 + w / 2, y0: PILL.y - 36, y1: PILL.y + 36 };
}
/** Every label on the picture at t (the place pill, the caption, the visible pins): one list for the picture and the tests. */
export function labelBoxes(t: number): Box[] {
  const out: Box[] = [];
  const p = pillAt(t);
  if (p) out.push({ text: p.text, ...pillBox(p.text) });
  const c = captionAt(CAPTIONS, t);
  if (c && c.alpha > 0.01) out.push({ text: c.caption.text, ...captionBox(c.caption) });
  PINS.forEach((_, i) => {
    const q = pinAt(i, t), k = q.pop;                                   // the pin scaled about its tip (Life001.tsx's Pins)
    if (q.alpha > 0.05) out.push({ text: `pin ${q.number}`, x0: q.x - k * (PIN.r + 4), x1: q.x + k * (PIN.r + 4), y0: q.y - k * (2 * PIN.r + PIN.tip), y1: q.y, pin: true });
  });
  return out;
}
/** Every piece of text a viewer can read at t (header, pill, caption, end card). */
export function textsAt(t: number): string[] {
  const out = [...HEADER];
  const p = pillAt(t); if (p) out.push(p.text);
  const c = captionAt(CAPTIONS, t); if (c) out.push(c.caption.text);
  for (const l of END_LINES) if (t >= END_AT + l.at) out.push(l.text);
  return out;
}

// ---- sound ----------------------------------------------------------------------------------------------------------
// Wind and birds under everything; a click as each pin pops in the opening and as it pulses on its visit; at each place its own sound (claps
// on the squadron's jumps, swimmers' splashes, hoofbeats, water at the bay); marking time and a tap per rank crossing; the
// jets' roar, the music dipping under it. Whooshes only on the short moves (F15).
const during = (i: number, from = 0.9) => [STOPS[i].go + from, STOPS[i + 1].go] as const;   // from when the place is on screen
const every = ([a, b]: readonly [number, number], step: number) => Array.from({ length: Math.floor((b - a) / step) }, (_, k) => a + k * step);
const plips = Array.from({ length: 5 }, (_, k) => STOPS[4].settled + 0.3 + 0.27 * k);   // after the music's swell at ~17.3 s
/** Marking time on the same beat as the ranks' steps over the band (one step every dz / SPEED), from when the ground is on
 *  screen until the first rank crosses: no flams, and the march is heard all the way in (panel Sound, pass 2: the old
 *  every-0.5 s list came out empty). */
const STEP = BLOCKS[0].dz / SPEED;
const markTime = Array.from({ length: 12 }, (_, k) => crossingTimes()[0] - STEP * (k + 1)).filter(t => t >= GROUND_AT + 0.35).reverse();
/** 1 inside [a, b], easing in and out over 0.15 s. */
const span = (t: number, a: number, b: number) => prog(t, a - 0.15, 0.15) * (1 - prog(t, b, 0.15));
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...whooshesFor(CAM.start, CAM.keys),
    ...PINS.map((_, i): Hit => ({ kind: 'click', t: 0.4 + 0.35 * i, gain: 0.4, pitch: 1.4 })),
    ...STOPS.map((s): Hit => ({ kind: 'click', t: s.pulse, gain: 0.5, pitch: 1.2 })),
    ...landings(...during(1, 0.4)).map((t): Hit => ({ kind: 'tap', t, gain: 0.4, pitch: 1.8 })),       // claps on the jumps
    ...every(during(2), 0.33).map((t, k): Hit => ({ kind: 'tap', t, gain: 0.28, pitch: 0.45 + 0.05 * (k % 3) })),   // splashes
    ...every(during(3), 1 / TROT_HZ / 2).map((t, k): Hit => ({ kind: 'tap', t, gain: k % 2 ? 0.8 : 1.1, pitch: 0.75 })), // hoofbeats
    ...plips.map((t, k): Hit => ({ kind: 'tap', t, gain: 1.0, pitch: 0.5 + 0.06 * (k % 3) })),
    ...markTime.map((t): Hit => ({ kind: 'tap', t, gain: 0.3, pitch: 0.9 })),
    ...crossingTimes().map((t): Hit => ({ kind: 'tap', t, gain: 1.2, pitch: 1.6 })),       // the loudest taps: the payoff (panel Sound)
    { kind: 'shimmer', t: GROUND_AT + 0.15, gain: 0.2 },                 // the gold band appears
    // a pass per jet, staggered as the vee goes by: the loudest hits in the reel (panel Sound)
    ...[0, 0.2, 0.4].map((d): Hit => ({ kind: 'whoosh-in', t: 13.75 + J + d, gain: 1.28 })),
  ],
  beds: [
    { kind: 'dawn', t0: 0, t1: DURATION, level: t => 0.65 * (1 - prog(t, DURATION - 1.1, 0.7)) },   // fades out: no pop at the end
    // louder, and fading out as they fly away rather than stopping dead
    { kind: 'roar', t0: 12.9 + J, t1: 15.2 + J, level: t => 2.8 * (t < 13.95 + J ? ((t - 12.9 - J) / 1.05) ** 2 : Math.max(0, 1 - (t - 13.95 - J) / 1.25)) },
  ],
  // the music dips ~6 dB under each rank's step and ~5 dB under the jets' pass, and its own swells at ~17.3 and ~21.6 s are
  // trimmed ~5 dB, so the march and the jets are the loudest moments (panel Sound, pass 2)
  music: t => (1 - 0.5 * Math.max(0, ...crossingTimes().map(c => Math.min(1, 1 - (Math.abs(t - c) - 0.075) / 0.15))))
    * (1 - 0.45 * span(t, 17.1, 17.7)) * (1 - 0.45 * span(t, 21.4, 21.9))
    // and ~3 dB under the hoofbeats and the bay's water, so they're heard on a phone
    * (1 - 0.3 * span(t, STOPS[3].go + 1.4, STOPS[4].go)) * (1 - 0.25 * span(t, 17.7, 18.9))
    * (1 - 0.45 * Math.min(1, Math.max(0, 1 - (Math.abs(t - 13.95 - J) - 0.5) / 0.4))),
};
export { captionAt };
