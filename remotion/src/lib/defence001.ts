// @lws.pune · defence #1 (3D, predict-first): Indian Army officer ranks on a shoulder strap. Frame 0: an olive strap
// wearing the national emblem over three stars (one, then two side by side) turns once round (F22) under "Which rank
// wears this?" A Colonel · B Brigadier · C Major Gen. B lights; a gold line joins the stars into a triangle; one star
// slides off and the strap wears Colonel's badge (the trap: one star fewer). The strap is cleared, a ladder of the 9 ranks
// fades in on the left and the badges land one rank at a time, Lieutenant to General (the lit rank's name big under the
// strap); then the Field Marshal (emblem over two crossed batons in a wreath, only 2 ever). Every badge checked against its
// picture: storyboard § 8. Storyboard (independently reviewed, F31): reels/nda-defence-001-army-ranks.storyboard.md.
// World units: the strap is 0.9 wide, 2.4 long, centred on the origin, its front face towards +z, its point up.
//
// Beat table (from the storyboard):
// | time       | what moves                                                                  | words                              |
// | 0–3.0      | the strap with the Brigadier's badges, one full turn                        | header + A/B/C                     |
// | 3.0        | B lights; the stars flash in turn; punch-in                                 |                                    |
// | 3.0–4.4    | a gold line joins the three stars                                           | Emblem + 3 stars in a triangle     |
// | 4.4–5.2    | the bottom-right star slides off, the bottom-left moves to the centre       | Colonel: emblem + only 2 stars     |
// | 5.4–5.9    | all badges lift off; zoom out; the ladder fades in                          |                                    |
// | 6.0–15.9   | a rank every 1.1 s: Lt, Capt, Maj, Lt Col, Col, Brig, Maj Gen, Lt Gen, Gen   | NDA → IMA → you start here (6.0) · The Army Chief's rank (14.8) |
// | 15.9–18.3  | the Field Marshal; zoom out; the whole ladder                               | Only 2 ever held this rank · Manekshaw (1973) · Cariappa (1986) |
// | 18.3–20.5  | end card                                                                    | 9 ranks. Lieutenant to General. / Follow for more |
import { prog, tween, captionAt, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { VIVID } from './palette.ts';

export type V3 = [number, number, number];
export const DURATION = 20.5, ORBIT_END = 3.0, ANSWER_AT = ORBIT_END, COVER_T = 2.7, END_AT = 18.3;
export const OPTIONS = ['A   Colonel', 'B   Brigadier', 'C   Major Gen'], ANSWER = 1;
type Span = { t: number; dur: number };
export const TRAP: Span = { t: 4.4, dur: 0.8 }, CLEAR: Span = { t: 5.4, dur: 0.5 }, TRIANGLE = { t: 3.15, dur: 0.6, out: 4.4 };
export const STEP = 1.1, rankTimes = Array.from({ length: 9 }, (_, i) => +(6.0 + STEP * i).toFixed(2)), FM_AT = 15.9;
export const COLORS = { strap: '#4b5320', strapEdge: '#3a4119', brass: '#c9a227', brassDark: '#8a6a12', lit: VIVID.white.orange, gold: '#d9a514' };

// ---- the strap and its badges -----------------------------------------------------------------------------------------
export const STRAP = { w: 0.9, len: 2.4, t: 0.08, point: 0.3, button: { y: 0.92, r: 0.09 } };
export type BadgeKind = 'star' | 'emblem' | 'swordBaton' | 'batonsWreath';
export type Badge = { kind: BadgeKind; x: number; y: number };
export const STAR_R = 0.14, EMBLEM = { w: 0.3, h: 0.42 }, SWORD_HALF = 0.42, WREATH_R = 0.36;
/** Half-width and half-height of a badge (for the layout tests). */
export const badgeExtent = (k: BadgeKind): [number, number] =>
  k === 'star' ? [STAR_R, STAR_R] : k === 'emblem' ? [EMBLEM.w / 2, EMBLEM.h / 2] : k === 'swordBaton' ? [0.33, 0.27] : [WREATH_R, WREATH_R];
// Rows down the strap (y): the badges sit below the button, top to bottom, as in the pictures.
const R1 = 0.45, R2 = 0, R3 = -0.42, R4 = -0.8, SB = -0.62, FMY = -0.55, DX = 0.2;
const star = (x: number, y: number): Badge => ({ kind: 'star', x, y });
const emblem = (y: number): Badge => ({ kind: 'emblem', x: 0, y });
const sword: Badge = { kind: 'swordBaton', x: 0, y: SB };
// Badge ids carry a badge from one rank to the next (it slides instead of flying off and back).
export type Rank = { name: string; badges: Record<string, Badge> };
export const RANKS: Rank[] = [
  { name: 'Lieutenant', badges: { a: star(0, R3), b: star(0, R4) } },
  { name: 'Captain', badges: { c: star(0, R2), a: star(0, R3), b: star(0, R4) } },
  { name: 'Major', badges: { e: emblem(R2) } },
  { name: 'Lieutenant Colonel', badges: { e: emblem(R2), a: star(0, R3) } },
  { name: 'Colonel', badges: { e: emblem(R2), a: star(0, R3), b: star(0, R4) } },
  { name: 'Brigadier', badges: { e: emblem(R2), a: star(0, R3), b: star(-DX, R4), c: star(DX, R4) } },
  { name: 'Major General', badges: { a: star(0, R2), sb: sword } },
  { name: 'Lieutenant General', badges: { e: emblem(R2), sb: sword } },
  { name: 'General', badges: { e: emblem(R1), a: star(0, R2), sb: sword } },
];
export const FIELD_MARSHAL: Rank = { name: 'Field Marshal', badges: { e: emblem(R1), fm: { kind: 'batonsWreath', x: 0, y: FMY } } };
export const OPENING = RANKS[5].badges;

type State = { t: number; dur: number; badges: Record<string, Badge>; leave: 'up' | 'right'; rank: number };
const STATES: State[] = [
  { t: -Infinity, dur: 0, badges: OPENING, leave: 'up', rank: -1 },
  { t: TRAP.t, dur: TRAP.dur, badges: RANKS[4].badges, leave: 'right', rank: -1 },
  { t: CLEAR.t, dur: CLEAR.dur, badges: {}, leave: 'up', rank: -1 },
  ...RANKS.map((r, i): State => ({ t: rankTimes[i], dur: 0.35, badges: r.badges, leave: 'up', rank: i })),
  { t: FM_AT, dur: 0.35, badges: FIELD_MARSHAL.badges, leave: 'up', rank: 9 },
];
const stateIndex = (t: number) => { let k = 0; while (k + 1 < STATES.length && STATES[k + 1].t <= t) k++; return k; };
/** The badges the strap is heading to at t (its last change's target). */
export const stateAt = (t: number) => STATES[stateIndex(t)].badges;

const ARRIVE = 0.3, STAGGER = 0.12, DROP = 0.9;
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export type Placed = { id: string; kind: BadgeKind; x: number; y: number; z: number; alpha: number; landed?: number };
/** Every badge on (or flying to / off) the strap at t: its place on the strap, its height off it (z), its opacity, and
 *  for one that drops on, when it lands. New badges fall onto the strap one after another (0.12 s apart); badges a rank
 *  keeps slide to their new place; the rest lift off (or slide off to the right, in the trap). */
export function badgesAt(t: number): Placed[] {
  const k = stateIndex(t), cur = STATES[k];
  if (k === 0) return Object.entries(cur.badges).map(([id, b]) => ({ id, ...b, z: 0, alpha: 1 }));
  const prev = STATES[k - 1].badges, u = Math.min(1, (t - cur.t) / cur.dur), e = prog(u, 0, 1), out: Placed[] = [];
  let order = 0;
  for (const [id, b] of Object.entries(cur.badges)) {
    const p = prev[id];
    if (p && p.kind === b.kind) { out.push({ id, kind: b.kind, x: lerp(p.x, b.x, e), y: lerp(p.y, b.y, e), z: 0, alpha: 1 }); continue; }
    const land = cur.t + ARRIVE + STAGGER * order++, f = Math.min(1, Math.max(0, (t - (land - ARRIVE)) / ARRIVE));
    out.push({ id, kind: b.kind, x: b.x, y: b.y, z: DROP * (1 - f * f), alpha: t < land - ARRIVE ? 0 : Math.min(1, (t - (land - ARRIVE)) / 0.08), landed: land });
  }
  for (const [id, b] of Object.entries(prev)) {
    if (cur.badges[id] && cur.badges[id].kind === b.kind) continue;
    const fade = Math.max(0, 1 - 1.2 * u);
    out.push(cur.leave === 'right'
      ? { id, kind: b.kind, x: b.x + 1.2 * e, y: b.y, z: 0.1 * Math.sin(Math.PI * u), alpha: Math.max(0, 1 - Math.max(0, u - 0.5) * 2) }
      : { id, kind: b.kind, x: b.x, y: b.y + 0.3 * e, z: DROP * e, alpha: fade });
  }
  return out;
}
/** The answer's stars flash one after another (0…1). */
export const flashAt = (id: string, t: number) => {
  const i = ['a', 'b', 'c'].indexOf(id), at = ANSWER_AT + 0.15 * i;
  return i < 0 || t < at ? 0 : Math.max(0, 1 - (t - at) / 0.4);
};
/** The gold line through the Brigadier's three stars: drawn, held, gone as the trap starts. */
export const triangleAt = (t: number) => ({ drawn: prog(t, TRIANGLE.t, TRIANGLE.dur), alpha: 1 - prog(t, TRIANGLE.out, 0.25) });
export const TRIANGLE_PTS: [number, number][] = [[0, R3], [DX, R4], [-DX, R4], [0, R3]];

/** The strap's outline corners, front and back (for framing tests). */
export function strapCorners(): V3[] {
  const { w, len, t, point } = STRAP, h = len / 2, pts: [number, number][] = [[-w / 2, -h], [w / 2, -h], [w / 2, h - point], [0, h], [-w / 2, h - point]];
  return [t / 2, -t / 2].flatMap(z => pts.map(([x, y]): V3 => [x, y, z]));
}

// ---- camera -------------------------------------------------------------------------------------------------------------
// One full orbit from frame 0 (F22), slow through the front and fast round the back so the badges face the viewer for
// most of the 3 s (review I1); then zooms only: a punch-in on the answer, out as the strap is cleared (and to the right
// of the ladder), a slow push through the climb, out for the Field Marshal.
const DEG = Math.PI / 180, DIST = 6.06, FOV = 30, EL = 6 * DEG, ORBIT_K = 0.8, CLIMB_X = -0.66;
export const BAND = { top: 470, height: 1030, width: 1080 };
export const azimuthAt = (t: number) => {
  const u = Math.min(1, Math.max(0, t / ORBIT_END));
  return u >= 1 ? 2 * Math.PI : 2 * Math.PI * (u - (ORBIT_K * Math.sin(2 * Math.PI * u)) / (2 * Math.PI));
};
export const ZOOM: { start: number[]; keys: Key[] } = {
  start: [1],
  keys: [
    { t: ANSWER_AT, dur: 0.4, to: [1.28] },
    { t: CLEAR.t, dur: CLEAR.dur, to: [1] },
    { t: rankTimes[0], dur: FM_AT - rankTimes[0], to: [1.08] },
    { t: FM_AT, dur: 0.6, to: [0.92] },
  ],
};
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
export function cameraAt(t: number): Camera {
  const az = azimuthAt(t), d = DIST / tween(t, ZOOM.start, ZOOM.keys)[0], tg: V3 = [CLIMB_X * prog(t, CLEAR.t, CLEAR.dur), 0, 0];
  return { position: [tg[0] + d * Math.cos(EL) * Math.sin(az), tg[1] + d * Math.sin(EL), tg[2] + d * Math.cos(EL) * Math.cos(az)],
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

// ---- words: the ladder, the big rank name, the captions (one list for the picture and the tests) --------------------------
export const LADDER = { x: 60, bottom: 1440, gap: 105, size: 40 }, NAME = { y: 1450, size: 56 }, CAPTION_Y = 1580, CAPTION_SIZE = 50;
export type Row = { text: string; y: number; state: 'done' | 'lit' | 'next'; weight: number; marker: boolean; alpha: number };
const currentRank = (t: number) => (t >= FM_AT ? 9 : rankTimes.filter(r => r <= t).length - 1);
export function ladderAt(t: number): Row[] {
  if (t < CLEAR.t) return [];
  const c = currentRank(t), fade = prog(t, CLEAR.t + 0.3, 0.3), names = [...RANKS.map(r => r.name), ...(t >= FM_AT ? [FIELD_MARSHAL.name] : [])];
  return names.map((text, i) => {
    const state = i < c ? 'done' : i === c ? 'lit' : 'next';
    return { text, y: LADDER.bottom - LADDER.gap * i, state, weight: state === 'lit' ? 800 : 600, marker: state === 'lit',
      alpha: fade * (state === 'next' ? 0.45 : 1) * (i === 9 ? prog(t, FM_AT, 0.3) : 1) };
  });
}
/** The lit rank's name, big, centred under the strap, popping in as its badge lands. */
export function rankNameAt(t: number) {
  if (t < rankTimes[0] || t >= END_AT) return null;
  const c = currentRank(t), at = c === 9 ? FM_AT : rankTimes[c], x = project([0, 0, 0], cameraAt(t)).x;
  return { text: c === 9 ? FIELD_MARSHAL.name : RANKS[c].name, x, y: NAME.y, size: NAME.size, alpha: prog(t, at + 0.15, 0.2), age: t - at };
}
export const CAPTIONS: Caption[] = [
  { t0: ANSWER_AT + 0.1, t1: TRAP.t, text: 'Emblem + 3 stars in a triangle' },
  { t0: TRAP.t, t1: CLEAR.t + 0.2, text: 'Colonel: emblem + only 2 stars' },
  { t0: rankTimes[0], t1: rankTimes[1], text: 'NDA → IMA → you start here' },
  { t0: rankTimes[8], t1: FM_AT, text: 'The Army Chief\'s rank' },
  { t0: FM_AT + 0.2, t1: FM_AT + 1.2, text: 'Only 2 ever held this rank' },
  { t0: FM_AT + 1.2, t1: END_AT, text: 'Manekshaw (1973) · Cariappa (1986)' },
].map(c => ({ ...c, size: CAPTION_SIZE, y: CAPTION_Y }));
export function captionBox(c: Caption) {
  // the board's Caption card: 48 px side padding, 30 px top and bottom, line height 1.22
  const size = c.size ?? CAPTION_SIZE, w = [...c.text].length * size * 0.52 + 96, h = size * 1.22 + 60, y = c.y ?? CAPTION_Y;
  return { x0: 540 - w / 2, x1: 540 + w / 2, y0: y - h / 2, y1: y + h / 2 };
}
type LabelBox = { text: string; x0: number; x1: number; y0: number; y1: number };
export function labelBoxes(t: number): LabelBox[] {
  const out: LabelBox[] = [];
  for (const r of ladderAt(t)) if (r.alpha > 0.01) {
    out.push({ text: r.text, x0: LADDER.x - 36, x1: LADDER.x + [...r.text].length * LADDER.size * 0.55, y0: r.y - 0.55 * LADDER.size, y1: r.y + 0.55 * LADDER.size });
  }
  const n = rankNameAt(t);
  if (n && n.alpha > 0.01) {
    const w = [...n.text].length * n.size * 0.55;
    out.push({ text: n.text, x0: n.x - w / 2, x1: n.x + w / 2, y0: n.y - 0.55 * n.size, y1: n.y + 0.55 * n.size });
  }
  const cap = captionAt(CAPTIONS, t);
  if (cap && cap.alpha > 0.01) out.push({ text: cap.caption.text, ...captionBox(cap.caption) });
  return out;
}

// ---- sound --------------------------------------------------------------------------------------------------------------
// A thunk on the answer and a small bright tink as each of its stars flashes; a click as the trap's star slides off and
// a tink as the other settles; a clank whenever badges come off; a tink as each new badge lands (pitch up a step per
// rank); a shimmer for the Field Marshal; whooshes on the fast zooms only (F15). EFFECTS_GAIN (+2.3 dB) puts the effects
// ~8 dB under the music (F16: 5–10 dB).
const landings = () => {
  const out: { t: number; rank: number }[] = [];
  for (const s of STATES.slice(1)) {
    const prev = STATES[STATES.indexOf(s) - 1].badges;
    let order = 0;
    for (const [id, b] of Object.entries(s.badges)) if (!(prev[id] && prev[id].kind === b.kind)) out.push({ t: s.t + ARRIVE + STAGGER * order++, rank: s.rank });
  }
  return out;
};
export const MUSIC_HITS = [ANSWER_AT, rankTimes[8]];
const EFFECTS_GAIN = 1.3;
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    { kind: 'thunk', t: ANSWER_AT, gain: 0.5 },
    ...[0, 1, 2].map((i): Hit => ({ kind: 'clang', t: ANSWER_AT + 0.15 * i, gain: 0.1, pitch: 2.4 + 0.1 * i })),
    { kind: 'click', t: TRAP.t, gain: 0.25, pitch: 0.8 },
    { kind: 'clang', t: TRAP.t + TRAP.dur, gain: 0.14, pitch: 2.0 },
    ...[CLEAR.t, rankTimes[2], rankTimes[6], FM_AT].map((t): Hit => ({ kind: 'clang', t, gain: 0.22, pitch: 0.9 })),
    ...landings().map((l): Hit => ({ kind: 'clang', t: l.t, gain: 0.18, pitch: 1.7 + 0.07 * Math.max(0, l.rank) })),
    { kind: 'shimmer', t: FM_AT + 0.35, gain: 0.35 },
    ...whooshesFor(ZOOM.start, ZOOM.keys),
  ].map(h => ({ ...h, gain: h.gain * EFFECTS_GAIN })),
  beds: [],
};
