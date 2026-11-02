// @lws.pune · NDA Life #1 (3D, predict-first): NDA as a miniature. A toy-like model of the campus turns once (F22) under
// "Where is the passing-out parade held?" A Sudan Block · B Khetarpal · C Peacock Bay, a pin over each place. The camera
// visits Sudan Block (✗ "Not the parade ground."), Peacock Bay's sailing boats (✗), then Khetarpal Ground: blocks of
// cadets are set down like toy soldiers, B lights ✓, and only the passing-out course marches over the gold Antim Pag line.
// Three jets pass; the camera rises over the ground to the whole campus under the end card.
// Facts and their sources: storyboard § 8 (PIB, NDA's joining instructions, UPSC). Storyboard (independently reviewed,
// F31): reels/nda-life-001-campus.storyboard.md. World units are metres; the model is not to scale (§ 8).
//
// Beat table (from the storyboard):
// | time       | what moves                                                         | words                               |
// | 0–3.0      | the model, one full orbit; the pins pop in turn (0.3, 0.9, 1.5)    | header + A/B/C                      |
// | 3.0–5.8    | glide to Sudan Block, arc round the dome; A pops with a red ✗ at 5.0 | A · Sudan Block · Not the parade ground. |
// | 5.8–8.6    | glide to the lake, over the boats; C pops with a red ✗ at 7.9      | C · Peacock Bay · water sports · Not here. |
// | 8.6–10.6   | glide to the ground; blocks fall from 9.5, land 9.8–10.5           | B · Khetarpal                       |
// | 10.6–12.8  | a big ✓ slams over the ground and settles into pin B, a ring out; the course crosses the gold band, rank by rank (to 12.93) | Passing-out parade: here. · The last step: Antim Pag. |
// | 12.8–14.4  | to a camera off the jets' path; three jets fly in and pass close     |                                     |
// | 14.4–17.6  | pull back over the ground to the whole campus; end card 15.6       | It starts with the written exam. / Maths: 300 of 900 marks. / Follow for more |
import { prog, tween, captionAt, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { WHITE } from './palette.ts';
import { DOME_TOP } from './story001.ts';

export type V3 = [number, number, number];
export const DURATION = 17.6, ORBIT_END = 3.0, COVER_T = 2.6, ANSWER_AT = 10.6, END_AT = 15.6, MARCH_IN = 9.5;
export const OPTIONS = ['A   Sudan Block', 'B   Khetarpal', 'C   Peacock Bay'], ANSWER = 1;
export const HEADER = ['Where is the passing-out', 'parade held?'];
export const CROSSED = [{ i: 0, at: 5.0 }, { i: 2, at: 7.9 }];

// ---- the model (not to scale) ------------------------------------------------------------------------------------------
export const BASE = { x0: -200, x1: 240, z0: -235, z1: 85, h: 12 };
export const SUDAN = { x: 0, z: -90 };                                  // its front face; the dome's centre is 7.5 m behind
export const GROUND = { x0: -90, x1: 90, z0: -74, z1: 16 };
export const LINE = { z: -58, half: 40, width: 2.4 };     // a gold band, not a hairline (panel pass 1)
export const LAKE = { x: 165, z: -40, rx: 55, rz: 95 };
export type Hill = { x: number; z: number; r: number; h: number };
export const HILLS: Hill[] = [
  { x: -150, z: -195, r: 40, h: 55 }, { x: -62, z: -200, r: 35, h: 42 }, { x: 35, z: -196, r: 39, h: 62 },
  { x: 130, z: -196, r: 39, h: 50 }, { x: 205, z: -200, r: 30, h: 36 }, { x: -178, z: -110, r: 22, h: 36 }, { x: -180, z: -25, r: 20, h: 26 },
];
/** Other campus buildings, unnamed (x, z = centre; w along x, d along z). */
export const BUILDINGS = [
  { x: -140, z: -125, w: 40, d: 16, h: 10 }, { x: -140, z: -62, w: 30, d: 18, h: 12 }, { x: -138, z: 8, w: 36, d: 16, h: 9 },
  { x: 88, z: -122, w: 30, d: 14, h: 10 }, { x: -62, z: -140, w: 34, d: 14, h: 10 }, { x: 62, z: -142, w: 34, d: 14, h: 10 },
  { x: -40, z: 56, w: 40, d: 14, h: 9 }, { x: 45, z: 56, w: 30, d: 14, h: 9 },
];

// ---- pins -----------------------------------------------------------------------------------------------------------
// One dark colour for all three (panel pass 1: green on the grass and blue on the water vanished, and A's orange beside B's
// green was a colour-blind pair); the letters tell them apart, the big marks say right or wrong.
export const GRASS = '#79a858', WATER = '#3fa0dc', PIN_COLOR = WHITE.ink;
export const MARK = { r: 30, right: WHITE.green, wrong: '#b91c1c' };   // a pair colour-blind viewers tell apart (test)
export const PINS = [
  { letter: 'A', color: PIN_COLOR, at: [0, DOME_TOP + 14, SUDAN.z - 7.5] as V3 },
  { letter: 'B', color: PIN_COLOR, at: [0, 7, -29] as V3 },      // low, on the ground: not in front of Sudan Block (Colour, pass 2)
  { letter: 'C', color: PIN_COLOR, at: [LAKE.x, 22, LAKE.z] as V3 },
];
/** Each stop: its pin, when the camera has arrived, when it leaves. */
export const STOPS = [{ pin: 0, settled: 3.9, t1: 5.8 }, { pin: 2, settled: 6.7, t1: 8.6 }, { pin: 1, settled: 9.5, t1: 11.0 }];
export const PIN = { r: 32, tip: 18 };                                  // circle radius and the pointer below it (px)

// ---- camera: [zoom = 1000 / distance, target x, y, z, elevation°, azimuth°] ---------------------------------------------
const S = (d: number, tg: V3, el: number, az: number) => [1000 / d, ...tg, el, az];
const WIDE = S(1360, [20, 0, -75], 64, 0);           // from high up, so the slab fills the band (≤ 960 px wide at every angle)
export const CAM: { start: number[]; keys: Key[] } = {
  start: WIDE,
  keys: [
    { t: 3.0, dur: 0.9, to: S(165, [0, 32, -97], 16, -20) },           // glide to Sudan Block
    { t: 3.9, dur: 1.1, to: S(165, [0, 32, -97], 15, 30) },            // arc round the dome
    { t: 5.0, dur: 0.8, to: S(165, [0, 32, -97], 15, 38) },            // hold on the ✗
    { t: 5.8, dur: 0.9, to: S(150, [LAKE.x, 4, LAKE.z], 14, -30) },     // glide to the lake
    { t: 6.7, dur: 1.2, to: S(150, [LAKE.x + 5, 3, LAKE.z - 5], 16, 8) }, // low over the boats (not so low a sail fills the frame)
    { t: 7.9, dur: 0.7, to: S(150, [LAKE.x + 5, 3, LAKE.z - 5], 16, 14) },
    { t: 8.6, dur: 0.9, to: S(240, [0, 6, -34], 28, 0) },              // glide to the ground
    { t: 9.5, dur: 1.1, to: S(210, [0, 6, -34], 27, 0) },              // push as the blocks land
    { t: 10.6, dur: 0.4, to: S(175, [0, 8, -34], 26, 0) },             // punch-in on the ✓
    { t: 11.0, dur: 0.8, to: S(85, [0, 3, LINE.z], 11, 62) },          // swing low beside the line
    { t: 11.8, dur: 1.2, to: S(75, [0, 3, LINE.z - 4], 10, 72) },
    { t: 12.8, dur: 1.0, to: S(300, [-30, 60, 20], -3, -41) },         // off the jets' path (the side away from the lake), looking up the way they come
    { t: 13.8, dur: 0.6, to: S(221, [-106, 62, 62], -4.6, -33) },        // the camera holds; the look follows them past
    { t: 14.4, dur: 1.2, to: S(1360, [20, 0, 90], 64, 0) },           // pull back to the whole campus, set high: clear of the end card
    { t: END_AT, dur: DURATION - END_AT, to: S(1360, [20, 0, 90], 64, 8) },  // a slow drift round,
  ],
};
/** The orbit (F22): one full turn from frame 0, at speed on frame 0 and easing out only, ending at the front at 3.0. */
const orbit = (t: number) => { const u = Math.min(1, Math.max(0, t / ORBIT_END)); return 360 * (1 - (1 - u) ** 2); };
const DEG = Math.PI / 180, FOV = 30;
export const BAND = { top: 470, height: 1230, width: 1080 };   // to y 1700: the picture runs under the captions (panel pass 1)
export const SAFE_BOTTOM = 1600;                                 // nothing to read below this (Instagram's caption and buttons)
export const azimuthAt = (t: number) => tween(t, CAM.start, CAM.keys)[5] + orbit(t);
/** A small shake as the jets pass the camera. */
const shake = (t: number) => { const a = Math.max(0, 1 - Math.abs(t - 14.15) / 0.3); return [Math.sin(t * 91) * a * 0.6, Math.sin(t * 67 + 1) * a * 0.5, 0]; };
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

export type PinState = 'open' | 'crossed' | 'right';
const bump = (t: number, at: number, dur: number) => (t < at || t > at + dur ? 0 : Math.sin((Math.PI * (t - at)) / dur));
/** A pin's size: each pops in turn in the opening (a new event every 0.6 s), and with its ✗ or ✓ (panel pass 1). */
export const popAt = (i: number, t: number) => {
  const x = CROSSED.find(c => c.i === i);
  return 1 + 0.25 * bump(t, 0.3 + 0.6 * i, 0.35) + (x ? 0.35 * bump(t, x.at, 0.4) : 0) + (i === ANSWER ? 0.5 * bump(t, ANSWER_AT, 0.5) : 0);
};
/** The ring that flashes out across the ground from pin B on the answer (0 = none, then 0…1 as it grows and fades). */
export const ringAt = (t: number) => (t < ANSWER_AT || t > ANSWER_AT + 0.8 ? 0 : (t - ANSWER_AT) / 0.8);
/** The answer's big ✓ (pass 2: "the reveal is still pin-sized"): it slams in over the ground at 260 px, settles to 230,
 *  holds, then shrinks into pin B (toPin 0 → 1) and is gone by 1.1 s. */
export function burstAt(t: number) {
  const u = t - ANSWER_AT;
  if (u < 0 || u > 1.1) return { size: 0, alpha: 0, toPin: 0 };
  const grow = Math.min(1, u / 0.12), settle = prog(u, 0.12, 0.2), shrink = prog(u, 0.75, 0.3);
  return { size: (260 * grow - 30 * settle) * (1 - 0.75 * shrink), alpha: 1 - prog(u, 0.95, 0.15), toPin: shrink };
}
/** All three pins in the orbit; once the tour starts, only the current stop's pin (each fades in / out over 0.3 s). */
const shown = (t: number, a: number, b: number) => (a <= 0 ? 1 : prog(t, a, 0.3)) * (1 - prog(t, b, 0.3));
const WINDOWS: [number, number][][] = [[[0, 5.8]], [[0, ORBIT_END], [8.6, 12.7]], [[0, ORBIT_END], [5.8, 8.6]]];
const focusAt = (i: number, t: number) => Math.min(1, WINDOWS[i].reduce((s, [a, b]) => s + shown(t, a, b), 0));
/** A pin at t: where its tip lands on screen (bobbing), its state and mark, how visible it is. Pin A drops onto the dome
 *  3.9–4.6 (from 10 m up); all pins leave as the camera pulls back. */
export function pinAt(i: number, t: number) {
  const p = PINS[i], drop = i === 0 ? 10 * (1 - prog(t, 3.9, 0.7)) : 0;
  const q = project([p.at[0], p.at[1] + drop, p.at[2]], cameraAt(t)), s = { ...q, y: q.y + 5 * Math.sin((2 * Math.PI * t) / 1.3 + 2 * i) };
  const crossed = CROSSED.find(c => c.i === i && t >= c.at), right = i === ANSWER && t >= ANSWER_AT;
  const state: PinState = right ? 'right' : crossed ? 'crossed' : 'open';
  const inBand = Math.min(1, Math.max(0, (s.y - (BAND.top + 2 * PIN.r + PIN.tip)) / 30), Math.max(0, (SAFE_BOTTOM - s.y) / 30),
    Math.max(0, (s.x - PIN.r) / 30), Math.max(0, (BAND.width - PIN.r - s.x) / 30));
  const alpha = (s.depth > 0 ? inBand : 0) * (1 - prog(t, 14.4, 0.4)) * focusAt(i, t);
  return { x: s.x, y: s.y, depth: s.depth, state, mark: state === 'right' ? '✓' : state === 'crossed' ? '✗' : '', alpha, color: p.color, letter: p.letter, pop: popAt(i, t) };
}

// ---- the parade -----------------------------------------------------------------------------------------------------
const DROP = 0.3, DROP_H = 30, SPEED = 7.2, HALT = 13.3;
export type Block = { x: number; z: number; rows: number; cols: number; dx: number; dz: number; course: boolean; drop: number; lands: number };
const XS = [-54, -18, 18, 54];
export const BLOCKS: Block[] = [-50, -24].flatMap((z, row) => XS.map((x, k): Block => {
  const i = row * 4 + k, drop = MARCH_IN + 0.1 * i;
  return { x, z, rows: 5, cols: 6, dx: 2.2, dz: 2.2, course: row === 0 && Math.abs(x) < 30, drop, lands: drop + DROP };
}));
export type Figure = { x: number; y: number; z: number; course: boolean; rank: number; step: number };
/** Where the course's leading rank is at t (it starts at its block's z). */
const leadZ = (b: Block, t: number) => (b.course && t > ANSWER_AT ? b.z - SPEED * (Math.min(t, HALT) - ANSWER_AT) : b.z);
/** Every cadet on the ground at t: blocks fall in one after another (MARCH_IN on), then mark time; from the answer only
 *  the passing-out course moves, marching over the line rank by rank, and halts at 13.3. */
export function figuresAt(t: number): Figure[] {
  const out: Figure[] = [];
  for (const b of BLOCKS) {
    if (t < b.drop) continue;
    const f = Math.min(1, (t - b.drop) / DROP), y = DROP_H * (1 - f * f), lz = leadZ(b, t);
    const moving = b.course && t > ANSWER_AT && t < HALT;
    for (let r = 0; r < b.rows; r++) for (let c = 0; c < b.cols; c++) {
      out.push({ x: b.x - ((b.cols - 1) * b.dx) / 2 + c * b.dx, y, z: lz + r * b.dz, course: b.course, rank: r,
        step: t < b.lands ? 0 : Math.sin(2 * Math.PI * (moving ? 1.8 : 1.2) * (t - b.lands) + (moving ? 0 : r)) });
    }
  }
  return out;
}
/** When each rank of the course crosses the line (the leading rank first). */
export function crossingTimes() {
  const b = BLOCKS.find(x => x.course)!;
  return Array.from({ length: b.rows }, (_, r) => ANSWER_AT + (b.z + r * b.dz - LINE.z) / SPEED);
}
/** The gold line's flash: 1 as a rank crosses, fading in 0.12 s. */
export const lineFlashAt = (t: number) => Math.max(0, ...crossingTimes().map(c => (t >= c ? Math.exp(-(t - c) / 0.12) : 0)));

// ---- boats on the lake (white sails; panel pass 1: a near orange sail read as a red shard) -----------------------------
export const SAIL = '#fbfaf5';
export function boatsAt(t: number) {
  return [0, 1, 2, 3, 4].map(k => {
    const a = 0.9 * k + 0.09 * t * (k % 2 ? 1 : -1), rr = 0.35 + 0.12 * (k % 3);
    const x = LAKE.x + LAKE.rx * rr * Math.cos(a), z = LAKE.z + LAKE.rz * rr * 1.2 * Math.sin(a);
    const heading = Math.atan2(-LAKE.rx * Math.sin(a), LAKE.rz * 1.2 * Math.cos(a)) + (k % 2 ? 0 : Math.PI);
    return { x, z, heading, rock: 0.05 * Math.sin(2.1 * t + k), sail: SAIL };
  });
}

// ---- jets (a Su-30 fly-past, PIB; three in a vee, no smoke) --------------------------------------------------------------
export const JET = { span: 33, len: 45, speed: 200, smoke: false };   // a fly-past speed (~700 km/h), not a dash
const JET_Q: V3 = [-30, 60, 20], JET_AT = 13.7, JET_DIR = unit([-1, 0.03, 0.55]), JET_SIDE = unit(cross([0, 1, 0], JET_DIR));
export function jetsAt(t: number) {
  if (t < 13.0 || t >= 14.4) return [];
  const s = JET.speed * (t - JET_AT), lead: V3 = [JET_Q[0] + JET_DIR[0] * s, JET_Q[1] + JET_DIR[1] * s, JET_Q[2] + JET_DIR[2] * s];
  return [0, -1, 1].map(k => ({
    pos: [lead[0] - Math.abs(k) * 30 * JET_DIR[0] + k * 40 * JET_SIDE[0], lead[1], lead[2] - Math.abs(k) * 30 * JET_DIR[2] + k * 40 * JET_SIDE[2]] as V3,
    dir: JET_DIR, side: JET_SIDE,
  }));
}

// ---- light: a golden afternoon, then low and orange in the pull-back; the windows light up at 16.0 ----------------------
export function lightAt(t: number) {
  const low = prog(t, 14.4, 1.2);
  return { elevation: 32 - 24 * low, azimuth: -110, warm: low, intensity: 3.0 - 0.9 * low, glow: 0.12 + 0.6 * low };
}

// ---- words ----------------------------------------------------------------------------------------------------------
export const PILL = { y: 1370, size: 40 }, CAPTION_Y = 1490, CAPTION_SIZE = 48;
export const PILLS = [
  // each label waits for its place to be in view (pass 2: "C · Peacock Bay" was up over the dome)
  { t0: 3.0, t1: 6.2, text: 'A · Sudan Block' },
  { t0: 6.3, t1: 8.95, text: 'C · Peacock Bay' },
  { t0: 9.05, t1: ANSWER_AT, text: 'B · Khetarpal' },
  { t0: ANSWER_AT, t1: 14.4, text: 'B · Khetarpal Ground' },
];
export const CAPTIONS: Caption[] = [
  { t0: 5.0, t1: 5.8, text: 'Not the parade ground.' },
  { t0: 6.7, t1: 7.9, text: 'Peacock Bay: water sports.' },
  { t0: 7.9, t1: 8.6, text: 'Not here.' },
  { t0: ANSWER_AT, t1: 11.8, text: 'Passing-out parade: here.' },
  { t0: 11.8, t1: 13.0, text: 'The last step: Antim Pag.' },
].map(c => ({ ...c, size: CAPTION_SIZE, y: CAPTION_Y }));
export type EndLine = { at: number; text: string; size: number; weight: number; y: number };
export const END_PANEL = { top: 1225, height: 300 };
export const END_LINES: EndLine[] = [
  { at: 0, text: 'It starts with the written exam.', size: 48, weight: 700, y: 1300 },
  { at: 0.6, text: 'Maths: 300 of 900 marks.', size: 48, weight: 600, y: 1378 },
  { at: 1.2, text: 'Follow for more', size: 64, weight: 700, y: 1462 },
];
export const COVER_CAPTION = { text: 'Where is the passing-out\nparade held?', y: 620, size: 60 };

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
/** Every label on the picture at t (the stop pill, the caption, the visible pins): one list for the picture and the tests. */
export function labelBoxes(t: number): Box[] {
  const out: Box[] = [];
  const p = pillAt(t);
  if (p) out.push({ text: p.text, ...pillBox(p.text) });
  const c = captionAt(CAPTIONS, t);
  if (c && c.alpha > 0.01) out.push({ text: c.caption.text, ...captionBox(c.caption) });
  PINS.forEach((_, i) => {
    const q = pinAt(i, t);
    // the pin scaled about its tip, with its mark disc over the top-right corner (Life001.tsx's Pins)
    const k = q.pop, m = q.mark ? MARK.r : 0;
    if (q.alpha > 0.05) out.push({ text: `pin ${q.letter}`, x0: q.x - k * (PIN.r + 4), x1: q.x + k * (PIN.r + 4 + (m ? 22 : 0)), y0: q.y - k * (2 * PIN.r + PIN.tip + (m ? m - 4 : 0)), y1: q.y, pin: true });
  });
  return out;
}
/** Every piece of text a viewer can read at t (header, chips, pill, caption, end card). */
export function textsAt(t: number): string[] {
  const out = [...HEADER, ...OPTIONS];
  const p = pillAt(t); if (p) out.push(p.text);
  const c = captionAt(CAPTIONS, t); if (c) out.push(c.caption.text);
  for (const l of END_LINES) if (t >= END_AT + l.at) out.push(l.text);
  return out;
}

// ---- sound ----------------------------------------------------------------------------------------------------------
// Wind and birds under everything; whooshes on the fast glides only (F15); a soft click as pin A lands; a low thud on
// each ✗; water plips over the bay; a tap as each block lands and as each rank of the course crosses the line, marking
// time between; a thunk on the ✓; the jets' roar.
const plips = Array.from({ length: 5 }, (_, k) => 6.75 + 0.27 * k);
const markTime = Array.from({ length: 6 }, (_, k) => ANSWER_AT + 0.4 + 0.5 * k);
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...whooshesFor(CAM.start, CAM.keys),
    { kind: 'click', t: 4.6, gain: 0.3, pitch: 1.2 },
    ...[0.3, 0.9, 1.5].map((t): Hit => ({ kind: 'click', t, gain: 0.25, pitch: 1.4 })),   // each pin's pop (pass 2)
    ...CROSSED.map((c): Hit => ({ kind: 'whump', t: c.at, gain: 0.32 })),
    ...plips.map((t, k): Hit => ({ kind: 'tap', t, gain: 0.1, pitch: 0.5 + 0.06 * (k % 3) })),
    ...BLOCKS.map((b): Hit => ({ kind: 'tap', t: b.lands, gain: 0.28, pitch: 1.25 })),
    ...markTime.filter(t => !crossingTimes().some(c => Math.abs(c - t) < 0.08)).map((t): Hit => ({ kind: 'tap', t, gain: 0.12, pitch: 0.9 })),
    ...crossingTimes().map((t): Hit => ({ kind: 'tap', t, gain: 0.3, pitch: 1.6 })),
    { kind: 'thunk', t: ANSWER_AT, gain: 0.75 },                       // the loudest hit: louder than either ✗ (pass 2)
    { kind: 'shimmer', t: ANSWER_AT + 0.05, gain: 0.4 },               // the ring going out
  ],
  beds: [
    { kind: 'dawn', t0: 0, t1: DURATION, level: () => 0.45 },
    // louder, and fading out as they fly away rather than stopping dead (pass 2)
    { kind: 'roar', t0: 12.9, t1: 15.2, level: t => 1.5 * (t < 13.95 ? ((t - 12.9) / 1.05) ** 2 : Math.max(0, 1 - (t - 13.95) / 1.25)) },
  ],
  // the music dips under the ✓ and under the jets' pass (pass 2)
  music: t => 1 - 0.5 * Math.max(0, 1 - Math.abs(t - ANSWER_AT - 0.05) / 0.5) - 0.3 * Math.max(0, 1 - Math.abs(t - 13.95) / 0.7),
};
export { captionAt };
