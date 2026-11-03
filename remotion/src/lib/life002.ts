// @lws.pune · NDA Life #2 (3D): 3 roads after NDA. A small diorama with NDA (the Sudan Block model) at the front; three
// roads run out of its gate: west into the hills to the Indian Military Academy, north to the coast and the Indian Naval
// Academy, east to an airfield and the Air Force Academy. A column of cadets marches on each road from frame 0 (review B4);
// the camera picks each up and follows it in; each arrival has its own moment (the academy's flag runs up its mast, the
// ship sounds its horn and turns, a trainer takes off); the camera pulls up over all three roads. Facts: UPSC's NDA & NA (II)
// 2026 notice ¶ 6–9 and PIB (storyboard § 8). Storyboard (independently reviewed, F31):
// reels/nda-life-002-roads.storyboard.md. World units are metres; a diorama, not a map, not to scale.
//
// Beat table (from the storyboard):
// | time       | what moves                                                                  | words                         |
// | 0–4.0      | the diorama, one full turn; colour draws along the roads; columns marching; tags pop | header + three dots  |
// | 3.4–8.9    | glide to column 1, follow it in (arrives 7.6), rise to the academy as its flag runs up | 1 · Army · Dehradun    |
// | 8.9–13.9   | glide to column 2, follow it in (12.4), the horn at 13.3, the ship turns to shore    | 2 · Navy · Ezhimala      |
// | 13.9–19.2  | glide to column 3 (16.6), beside the runway; roll 16.9, wheels up 17.9 mid-frame, push in | 3 · Air Force · Hyderabad |
// | 19.2–21.6  | pull up over the whole diorama, the trainer still climbing away             | 4 years: cadet to officer.    |
// | 21.6–24.6  | end card, a slow drift                                                      | All 3 roads start with the exam: … |
import { prog, tween, captionAt, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';

export type V3 = [number, number, number];
export const ORBIT_END = 4.0, COVER_T = 3.2, PULL = 19.2, END_AT = 21.6, DURATION = 24.6;
export const LABEL = 'NDA LIFE  ·  THE ROAD AHEAD';
export const HEADER = ['After 3 years at NDA,', '3 roads to 3 academies'];

// ---- the diorama (not to scale) ----------------------------------------------------------------------------------------
export const SLAB = { x0: -125, x1: 110, z0: -112, z1: 80, h: 10 };
export const NDA = { x: 0, z: 62, scale: 0.28 };          // the Sudan Block model, scaled, its front facing the roads (−z)
export const GATE: V3 = [0, 0, 44];
export const SEA = { z0: SLAB.z0, z1: -90 }, BEACH = { z0: -90, z1: -82 };   // along the back of the diorama
export const RUNWAY = { x: 93, w: 10, z0: -80, z1: 58 };
export const GRASS = '#79a858';

// ---- the three roads: each academy, its place and the rank a year later (UPSC ¶ 6–9) ---------------------------------
type Road = { service: string; academy: string; place: string; rank: string; color: string; ground: string; pts: [number, number][];
  at: V3; size: V3; length: number };
const road = (r: Omit<Road, 'length'>): Road =>
  ({ ...r, length: r.pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - r.pts[i][0], p[1] - r.pts[i][1]), 0) });
export const ROADS: Road[] = [
  road({ service: 'Army', academy: 'Indian Military Academy', place: 'Dehradun', rank: 'Lieutenant', color: '#e0a400', ground: '#5f8a43',
    pts: [[0, 44], [-22, 38], [-46, 22], [-62, 0], [-68, -20]], at: [-68, 0, -33], size: [24, 9, 9] }),
  road({ service: 'Navy', academy: 'Indian Naval Academy', place: 'Ezhimala', rank: 'Sub-Lieutenant', color: '#1e40af', ground: '#e2d3a8',
    pts: [[0, 44], [0, 15], [-6, -20], [-2, -46], [0, -62]], at: [0, 0, -75], size: [22, 8, 9] }),
  road({ service: 'Air Force', academy: 'Air Force Academy', place: 'Hyderabad', rank: 'Flying Officer', color: '#22b8e0', ground: '#c2b99c',
    pts: [[0, 44], [24, 40], [50, 28], [64, 8], [68, -14]], at: [68, 0, -27], size: [22, 8, 9] }),
];
/** The point s metres along road k, and its heading (unit direction of travel). */
export function along(k: number, s: number) {
  const pts = ROADS[k].pts;
  let left = Math.max(0, s);
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), d: [number, number] = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    if (left <= L || i === pts.length - 1) { const u = Math.min(left, L); return { x: a[0] + d[0] * u, z: a[1] + d[1] * u, dir: d }; }
    left -= L;
  }
  return { x: pts[0][0], z: pts[0][1], dir: [0, -1] as [number, number] };
}
/** How much of each road's colour has drawn out of the gate (0…1): a third already on frame 0, so the three colours read
 *  before anyone scrolls (panel pass 1, Colour), all three together in the turn. */
export const drawnAt = (t: number) => 0.35 + 0.65 * prog(t, 0, 2.4);

// ---- the visits ------------------------------------------------------------------------------------------------------
/** A glide (`go` → `settled`, the first 2.0 s from inside the turn: review I1, the rest 1.5 s), the camera following the
 *  column until it `arrive`s, then the arrival's moment. */
export const VISITS = [
  { road: 0, go: 3.4, settled: 5.4, arrive: 7.6 },
  { road: 1, go: 8.9, settled: 10.4, arrive: 12.4 },
  { road: 2, go: 13.9, settled: 15.4, arrive: 16.6 },
];

// ---- the columns: 3 × 3 cadets, marching from frame 0 at two steps a second (review B4) -----------------------------------
export const FIG = 1.2;                                     // figure scale (Life001's cadets at 1.2: about 3.3 m on the model)
export const CAP_TOP = 2.78 * FIG;
export const STEP_HZ = 2, STEP_LEN = 1.05, SPEED = STEP_HZ * STEP_LEN;   // a step's length matches the legs' swing: no sliding
const DX = 1.9, DZ = 2.2;
/** Column k at t: how far along its road its front rank is (it halts at the end, on its visit's arrival), and the step. */
export function columnAt(k: number, t: number) {
  const { arrive } = VISITS[k], L = ROADS[k].length, s = L - SPEED * (arrive - Math.min(t, arrive));
  const moving = t < arrive;
  return { s, moving, step: moving ? Math.cos(Math.PI * STEP_HZ * t) : 0 };   // feet land on .0 and .5, the music's pulse
}
export type Figure = { x: number; z: number; heading: number; step: number };
/** Every cadet of column k: rank r behind the front rank along the road, files across it. */
export function cadetsAt(k: number, t: number): Figure[] {
  const c = columnAt(k, t), out: Figure[] = [];
  for (let r = 0; r < 3; r++) {
    const p = along(k, c.s - r * DZ), n: [number, number] = [-p.dir[1], p.dir[0]];
    for (let f = -1; f <= 1; f++) out.push({ x: p.x + f * DX * n[0], z: p.z + f * DX * n[1], heading: Math.atan2(p.dir[0], p.dir[1]), step: c.step });
  }
  return out;
}
/** Each cadet's feet and the top of its cap, in that order (for the tests' sizes on screen). */
export const columnPoints = (k: number, t: number): V3[] => cadetsAt(k, t).flatMap(f => [[f.x, 0, f.z], [f.x, CAP_TOP, f.z]] as V3[]);
const centreOf = (k: number, t: number): V3 => { const p = along(k, columnAt(k, t).s - DZ); return [p.x, 0, p.z]; };
/** The cadets' uniform, and a pale parade square where each column halts, so the dark figures stand on something light
 *  (panel pass 2: the Navy column vanished into its deep-blue road). */
export const UNIFORM = '#1f2a4a';
export const FORECOURT = { r: 8, color: '#ece6d6' };
export const forecourtAt = (k: number) => centreOf(k, VISITS[k].arrive);
export function academyPoints(k: number): V3[] {
  const { at, size } = ROADS[k], out: V3[] = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [0, size[1] + 3]) out.push([at[0] + (sx * size[0]) / 2, y, at[2] + (sz * size[2]) / 2]);
  return out;
}
export function slabCorners(): V3[] {
  const out: V3[] = [];
  for (const x of [SLAB.x0, SLAB.x1]) for (const z of [SLAB.z0, SLAB.z1]) for (const y of [0, -SLAB.h]) out.push([x, y, z]);
  return out;
}

// ---- the arrival moments ---------------------------------------------------------------------------------------------
/** The IMA's flag runs up its mast as column 1 arrives (0 at the foot, 1 at the top). Panel pass 1: the planned mist lifted
 *  above the frame and turned the peaks into smoke on the cover, so the Army's moment is this instead. */
export const flagAt = (t: number) => prog(t, VISITS[0].arrive + 0.6, 0.7);   // once the camera has settled (0.8 s)
/** The flag (a toy flag, big enough to read on a phone: panel pass 2 found the first one a few pixels) on its mast beside
 *  each academy's porch; the IMA's runs up, the others fly at the top. */
export const FLAG = { w: 6.4, h: 4.0, mast: 17, alongZ: [true, false, true], sign: [1, -1, 1] };   // across each arrival camera's view; the INA's flies
// away from the ship, over its own roof (stills: it covered the ship)
/** Where the flag's mast stands (beside the porch) and how high the flag's centre is. */
export function flagAt3(k: number, t: number) {
  const r = ROADS[k], y = (k === 0 ? 0.2 + 0.8 * flagAt(t) : 1) * (FLAG.mast - FLAG.h / 2 - 0.3);
  return { mast: [r.at[0] + r.size[0] / 2 + 3, 0, r.at[2] + r.size[2] / 2 + 2] as V3, y };
}
export function flagPoints(k: number, t: number): V3[] {
  const { mast: [x, , z], y } = flagAt3(k, t), L = FLAG.sign[k] * FLAG.w, [dx, dz] = FLAG.alongZ[k] ? [0, L] : [L, 0];
  return [[x, y - FLAG.h / 2, z], [x + dx, y + FLAG.h / 2, z + dz], [x, y + FLAG.h / 2, z], [x + dx, y - FLAG.h / 2, z + dz]];
}
/** Snow-capped peaks along the left edge, behind the IMA, all on the board (panel pass 1: they hung off its edge). */
export const PEAKS: { x: number; z: number; r: number; h: number }[] = [
  { x: -100, z: -86, r: 22, h: 40 }, { x: -101, z: -48, r: 22, h: 50 }, { x: -102, z: -8, r: 20, h: 38 }, { x: -76, z: -94, r: 16, h: 30 },
];
export const HILLS: { x: number; z: number; r: number; h: number }[] = [
  { x: -84, z: 30, r: 16, h: 14 }, { x: -40, z: -12, r: 13, h: 9 }, { x: -36, z: -48, r: 14, h: 12 }, { x: -86, z: -64, r: 13, h: 16 },
];
/** The ship off the coast at the back: sailing west, then on arrival 2 it sounds its horn and turns half towards the shore
 *  (half, so it stays broadside to the camera: panel pass 1 couldn't find it). */
export const SHIP = { len: 26, beam: 5, h: 9 };
const SHIP_X0 = 75;
/** The horn sounds once the camera has settled on the coast (the arrival's move takes 1 s). */
export const HORN_AT = VISITS[1].arrive + 0.9;
export function shipAt(t: number) {
  const a = HORN_AT - 0.2, go = Math.max(0, t - a - 0.2), turn = prog(t, a + 0.2, 1.4);
  const heading = -Math.PI / 2 + (Math.PI / 4) * turn;          // −π/2: sailing west (−x); −π/4: west and towards the shore
  const x = SHIP_X0 - 3.2 * Math.min(t, a + 0.2) - 3.2 * go * (1 - 0.3 * turn), z = -101 + 2.0 * go * turn;
  return { x, z, heading, rock: 0.03 * Math.sin(1.7 * t) };
}
export function shipPoints(t: number): V3[] {
  const s = shipAt(t), d = [Math.sin(s.heading), Math.cos(s.heading)], out: V3[] = [];
  for (const k of [-1, 1]) for (const y of [0, SHIP.h]) out.push([s.x + (k * SHIP.len * d[0]) / 2, y, s.z + (k * SHIP.len * d[1]) / 2]);
  return out;
}
/** The horn's steam: a white puff from the funnel as the horn sounds, so the moment works muted (0…1, then gone). */
export const puffAt = (t: number) => { const u = t - HORN_AT; return u <= 0 ? 0 : u < 0.3 ? u / 0.3 : Math.max(0, 1 - (u - 0.3) / 1.4); };
/** The trainer: rolls down the runway (north) once the camera is beside it, wheels up mid-frame, and is still climbing as the
 *  camera pulls up (panel pass 2: the roll and wheels-up had happened off the right edge). */
export const ROLL_AT = 16.9, WHEELS_UP = 17.9, PASS_AT = 18.3;
const PLANE_Z0 = 14;
const ACC = 25, CLIMB = 0.26;
export function planeAt(t: number) {
  const u = Math.max(0, t - ROLL_AT), r = Math.min(u, WHEELS_UP - ROLL_AT), v0 = ACC * r, d0 = 0.5 * ACC * r * r;
  const air = Math.max(0, t - WHEELS_UP), speed = v0 + 8 * Math.min(air, 2), dist = d0 + v0 * air + 4 * Math.min(air, 2) ** 2;
  const climb = air > 0 ? CLIMB * (dist - d0) * Math.min(1, air / 0.6) : 0;
  // the nose lifts 0.3 s before the wheels leave (rotation), then holds a climb
  const pitch = Math.min(0.22, Math.max(0, t - (WHEELS_UP - 0.3)) * 0.45);
  return { pos: [RUNWAY.x, climb, PLANE_Z0 - dist] as V3, speed, pitch };
}
export const PLANE = { span: 27, len: 21 };   // a toy trainer, bigger than life (panel pass 1: a speck at take-off)
export function planePoints(t: number): V3[] {
  const p = planeAt(t).pos;
  return [[p[0] - PLANE.span / 2, p[1] + 1, p[2]], [p[0] + PLANE.span / 2, p[1] + 1, p[2]], [p[0], p[1], p[2] - PLANE.len / 2], [p[0], p[1] + 4, p[2] + PLANE.len / 2]];
}

// ---- camera: [zoom = 1000 / distance, target x, y, z, elevation°, azimuth°] ---------------------------------------------
const S = (d: number, tg: V3, el: number, az: number) => [1000 / d, ...tg, el, az];
const WIDE = S(725, [-8, 4, -14], 54, 0);
const finalOf = (k: number): V3 => { const p = along(k, ROADS[k].length - DZ); return [p.x, 1.6, p.z]; };
const F = VISITS.map((_, k) => finalOf(k));
export const CAM: { start: number[]; keys: Key[] } = {
  start: WIDE,
  keys: [
    // 1 · Army: down behind the column, follow it in; swing round to the academy under the peaks as its flag runs up
    { t: VISITS[0].go, dur: 2.0, to: S(34, F[0], 24, 18) },
    { t: VISITS[0].settled, dur: VISITS[0].arrive - VISITS[0].settled, to: S(31, F[0], 22, 30) },   // a slow arc while following (panel: a treadmill)
    { t: VISITS[0].arrive, dur: 0.8, to: S(92, [-66, 2, -29], 15, 66) },
    // 2 · Navy: glide to the column on the middle road, follow it in; rise to the academy, the beach and the sea
    { t: VISITS[1].go, dur: 1.5, to: S(34, F[1], 22, -48) },
    { t: VISITS[1].settled, dur: VISITS[1].arrive - VISITS[1].settled, to: S(31, F[1], 20, -36) },
    { t: VISITS[1].arrive, dur: 1.0, to: S(104, [10, -1, -78], 11, -16) },
    // 3 · Air Force: glide to the airfield road, follow it in; to the side of the runway for the take-off
    { t: VISITS[2].go, dur: 1.5, to: S(34, F[2], 22, 38) },
    { t: VISITS[2].settled, dur: VISITS[2].arrive - VISITS[2].settled, to: S(31, F[2], 20, 28) },
    { t: VISITS[2].arrive, dur: 0.75, to: S(165, [84, 4, -8], 8, -74) },
    { t: WHEELS_UP, dur: 0.5, to: S(118, [86, 3, -22], 8, -74) },              // F9: a quick push in as the wheels leave the runway
    { t: PULL, dur: 2.0, to: S(660, [-8, 0, 14], 62, 20) },                  // pull up over the whole diorama
    { t: END_AT, dur: DURATION - END_AT, to: S(660, [-8, 0, 14], 62, 30) },  // a slow drift round
  ],
};
/** The orbit (F22): one full turn from frame 0, at speed on frame 0 and easing out only, back at the front at 4.0. */
export const orbitAt = (t: number) => { const u = Math.min(1, Math.max(0, t / ORBIT_END)); return 360 * (1 - (1 - u) ** 2); };
/** How much the camera follows column k's live position (0…1): in on the glide, out on the next. */
const followAt = (k: number, t: number) => prog(t, VISITS[k].go, VISITS[k].settled - VISITS[k].go) * (k < 2 ? 1 - prog(t, VISITS[k + 1].go, 1.5) : 1 - prog(t, PULL, 2.0));
const DEG = Math.PI / 180, FOV = 30;
export const BAND = { top: 470, height: 1230, width: 1080 };
export const SAFE_BOTTOM = 1600;
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
export function cameraAt(t: number): Camera {
  const [z, tx, ty, tz, el, az0] = tween(t, CAM.start, CAM.keys), az = (az0 + orbitAt(t)) * DEG, d = 1000 / z, e = el * DEG;
  // the keys aim at each column's final place; following adds how far it still has to go, which is 0 once it arrives
  let x = tx, y = ty, w = tz;
  VISITS.forEach((_, k) => { const f = followAt(k, t); if (f > 0) { const c = centreOf(k, t), g = centreOf(k, VISITS[k].arrive); x += f * (c[0] - g[0]); w += f * (c[2] - g[2]); } });
  return {
    position: [x + d * Math.cos(e) * Math.sin(az), y + d * Math.sin(e), w + d * Math.cos(e) * Math.cos(az)],
    target: [x, y, w], up: [0, 1, 0], fov: FOV, aspect: BAND.width / BAND.height,
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

/** A blue sky behind the picture only while the camera is low enough to see past the diorama's edge (the peaks, the
 *  take-off): a white plane and snow on the cream board would read as cut-outs (Defence #2's panel). */
export const skyAt = (t: number) => { const el = tween(t, CAM.start, CAM.keys)[4]; return Math.min(1, Math.max(0, (18 - el) / 4)); };

// ---- tags over the academies in the opening ---------------------------------------------------------------------------
export const TAG = { r: 32 };
const bump = (t: number, at: number, dur: number) => (t < at || t > at + dur ? 0 : Math.sin((Math.PI * (t - at)) / dur));
export function tagAt(i: number, t: number) {
  const { at, size } = ROADS[i], q = project([at[0], size[1] + 9, at[2]], cameraAt(t));
  const alpha = (q.depth > 0 ? 1 : 0) * prog(t, 0.6 + 0.35 * i, 0.2) * (1 - prog(t, VISITS[0].go - 0.1, 0.3));
  return { x: q.x, y: q.y, alpha, pop: 1 + 0.3 * bump(t, 0.6 + 0.35 * i, 0.35), number: String(i + 1), color: ROADS[i].color };
}

// ---- words ----------------------------------------------------------------------------------------------------------
export const PILL = { y: 1360, size: 54 }, CAPTION_Y = 1490, CAPTION_SIZE = 48;
export const PILLS = ROADS.map((r, i) => ({ t0: VISITS[i].go + 0.75, t1: i < 2 ? VISITS[i + 1].go + 0.75 : PULL, text: `${i + 1} · ${r.service} · ${r.place}`, color: r.color }));
export const CAPTIONS: Caption[] = [
  { t0: 5.1, t1: 6.9, text: 'Indian Military Academy.' }, { t0: 6.9, t1: 8.9, text: '1 year, then Lieutenant.' },
  { t0: 10.1, t1: 11.9, text: 'Indian Naval Academy.' }, { t0: 11.9, t1: 13.9, text: '1 year, then Sub-Lieutenant.' },
  { t0: 15.1, t1: 16.9, text: 'Air Force Academy.' }, { t0: 16.9, t1: 18.9, text: '1 year, then Flying Officer.' },
  { t0: PULL + 0.2, t1: END_AT, text: '4 years: cadet to officer.' },
].map(c => ({ ...c, size: CAPTION_SIZE, y: CAPTION_Y }));
export type EndLine = { at: number; text: string; size: number; weight: number; y: number };
export const END_PANEL = { top: 1225, height: 300 };
export const END_LINES: EndLine[] = [
  { at: 0, text: 'All 3 roads start with the exam:', size: 48, weight: 700, y: 1300 },
  { at: 0, text: 'maths is 300 of 900 marks.', size: 48, weight: 700, y: 1370 },
  { at: 0.8, text: 'Follow for more', size: 64, weight: 700, y: 1462 },
];
/** The cover's hook (cover only, the header hidden): on the board above the picture, inside the 3:4 crop. */
export const COVER_CAPTION = { text: HEADER.join('\n'), y: 350, size: 56 };
/** The header's dots: "now" while its pill is up, then "done". */
export function dotState(i: number, t: number): 'next' | 'now' | 'done' {
  return t < PILLS[i].t0 ? 'next' : t < PILLS[i].t1 ? 'now' : 'done';
}

type Box = { text: string; x0: number; x1: number; y0: number; y1: number; tag?: boolean };
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
/** Every label on the picture at t (the pill, the caption, the visible tags): one list for the picture and the tests. */
export function labelBoxes(t: number): Box[] {
  const out: Box[] = [];
  const p = pillAt(t);
  if (p) out.push({ text: p.text, ...pillBox(p.text) });
  const c = captionAt(CAPTIONS, t);
  if (c && c.alpha > 0.01) out.push({ text: c.caption.text, ...captionBox(c.caption) });
  ROADS.forEach((_, i) => {
    const g = tagAt(i, t), r = TAG.r * g.pop + 4;
    if (g.alpha > 0.05) out.push({ text: `tag ${g.number}`, x0: g.x - r, x1: g.x + r, y0: g.y - r, y1: g.y + r, tag: true });
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
// Wind and birds under everything; a click as each tag pops and each pill lands; each column's march only while it is
// followed, a little closer and louder each visit (review I8); a soft shimmer on each arrival; waves on the coast, the
// ship's horn; the trainer's engine rising down the runway and its pass over the camera, the loudest moment, the music in
// its quiet bar under it (the track from 21.8 s: its bar at 39–41 s lands at 17.2–19.2 here) and back full on the pull-up.
/** 1 inside [a, b], easing in and out over 0.15 s. */
const span = (t: number, a: number, b: number) => prog(t, a - 0.15, 0.15) * (1 - prog(t, b, 0.15));
const MARCH = [0.35, 0.5, 0.7];
/** The feet land at the ends of each swing, on .0 and .5 (the music's pulse: panel pass 1, Sound). */
const steps = (a: number, b: number) => { const out: number[] = []; for (let k = Math.ceil(a * STEP_HZ - 1e-9); k / STEP_HZ <= b + 1e-9; k++) out.push(k / STEP_HZ); return out; };
/** The take-off's engine (three layers of the roar bed: one is capped at full level and left a hole under the roll, panel
 *  pass 1): rising from the roll to wheels up, held through the pass, a long tail as it climbs away. */
const engine = (t: number) => (t < WHEELS_UP ? Math.sqrt(Math.max(0, (t - ROLL_AT + 0.4) / (WHEELS_UP - ROLL_AT + 0.4))) : t < PASS_AT + 0.4 ? 1 : Math.max(0, 1 - (t - PASS_AT - 0.4) / 2.4));
/** Whooshes for the fast camera moves, except round the take-off, where the plane's own pass is the one whoosh. */
const camWhooshes = whooshesFor(CAM.start, CAM.keys).filter(w => Math.abs(w.t - PASS_AT) > 1);
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...camWhooshes,
    ...ROADS.map((_, i): Hit => ({ kind: 'click', t: 0.6 + 0.35 * i, gain: 0.5, pitch: 1.4 })),
    ...PILLS.map((p): Hit => ({ kind: 'click', t: p.t0, gain: 0.5, pitch: 1.2 })),
    ...VISITS.flatMap((v, k) => steps(v.go + 0.5, v.arrive).map((t): Hit => ({ kind: 'tap', t, gain: MARCH[k], pitch: 0.8 }))),
    ...VISITS.map((v): Hit => ({ kind: 'shimmer', t: v.arrive, gain: 0.17 })),   // panel pass 2: 2 dB under the music grated
    { kind: 'horn', t: HORN_AT, gain: 0.22 },   // under the music (panel pass 2: level with it, louder than the roll)
    { kind: 'whoosh-in', t: PASS_AT, gain: 1.2 },                          // the plane past the camera: the loudest hit
    { kind: 'click', t: CAPTIONS.find(c => c.text.startsWith('4 years'))!.t0, gain: 0.45, pitch: 1.2 },   // panel pass 2: a silent line
    { kind: 'shimmer', t: END_AT, gain: 0.25 }, { kind: 'click', t: END_AT + 0.8, gain: 0.45, pitch: 1.2 },   // the end card lands (panel)
  ],
  beds: [
    // wind and birds in the hills, surf on the coast: each mostly where it belongs (panel pass 1: surf under the airfield)
    { kind: 'dawn', t0: 0, t1: DURATION, level: t => (0.4 + 0.25 * span(t, VISITS[0].go, VISITS[1].go)) * (1 - prog(t, DURATION - 1.1, 0.7)) },
    { kind: 'waves', t0: 0, t1: DURATION, level: t => (0.02 + 0.9 * span(t, VISITS[1].go + 0.4, VISITS[2].go + 0.3)) * (1 - prog(t, DURATION - 1.1, 0.7)) },
    ...[0, 1, 2, 3, 4].map(() => ({ kind: 'roar' as const, t0: ROLL_AT - 0.4, t1: PULL + 1.4, level: engine })),   // five layers: the roll was the quietest stretch (panel pass 2)
  ],
  // the music steps aside a little once the engine has built, to just after the pass (panel pass 2: it had sunk 8–13 dB)
  music: t => 0.85 * (1 - 0.2 * span(t, ROLL_AT + 0.4, PASS_AT + 0.15)),
};
export { captionAt };
