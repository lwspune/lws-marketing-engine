// @lws.pune · Defence #2 (3D showcase, F4 v1.17): 4 fighter jets of the Indian Air Force. Tejas, Mirage 2000, Su-30MKI and
// Rafale fly in a diamond above the clouds, part-lit, under "4 fighter jets of the Indian Air Force" and four numbered dots;
// the camera turns once round them (F22), then visits each in turn: it lights up in its real grey, a ring shows the part that
// tells it apart ("how to spot it"), then one sourced line. The Rafale rolls; the camera swoops below and all four fly over.
// Founder, 2026-11-03: "We need to move out of quiz mindset" (it was first built as "Which one is the Rafale?"). Facts:
// storyboard § 8 (PIB). Storyboard (independently reviewed, F31): reels/nda-defence-002-jets.storyboard.md.
// World units are metres; the formation flies along +z; our own simplified models, not to scale.
//
// Beat table (from the storyboard):
// | time        | what moves                                                                 | words                                |
// | 0–4.0       | the diamond from above-behind, one full turn round it; tags 1–4 pop        | header + dots 1–4                    |
// | 3.4–8.4     | glide to 1 (5.4), from above; it lights; the ring on the kink in its wing  | 1 · Tejas · Small triangle wing, kinked. · Designed and built in India. |
// | 8.4–12.9    | glide to 2 (9.9), from above; the ring on its straight edge                | 2 · Mirage 2000 · Triangle wing, straight edge. · From France, upgraded by HAL. |
// | 12.9–17.4   | glide to 3 (14.4), behind and above; the ring between its two fins         | 3 · Su-30MKI · Two tail fins. · Russian design, built by HAL. |
// | 17.4–22.2   | glide to 4 (18.9), above and ahead; ring: front wings, then its fin; beside it for the barrel roll 20.6–21.9 (the music's silent break) | 4 · Rafale · Front wings, one tail fin. · With the IAF since 2020. |
// | 22.2–25.4   | the music crashes back in; the camera swoops round to the side and below; all four cross the sky (≈25.1) |                                      |
// | 25.4–28.4   | they climb away; end card                                                  | Flying one starts with the exam: / maths is 300 of 900 marks. / Follow for more |
import { prog, tween, captionAt, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';

export type V3 = [number, number, number];
export const ORBIT_END = 4.0, COVER_T = 3.2, FLY_AT = 22.2, END_AT = 25.4, DURATION = 28.4;
export const HEADER = ['4 fighter jets of the', 'Indian Air Force'];
export const ROLL = { t0: 20.6, t1: 21.9 };

// ---- the jets (local: +z the nose, +y up, +x right; half-planforms as [x, z], leading edge first) -------------------------
export type Fin = { x: number; z0: number; z1: number; top0: number; top1: number; h: number; cant: number };
export type JetSpec = {
  key: string; name: string; len: number; nose: number; tail: number; r: number; lit: string;
  wing: [number, number][]; canard?: [number, number][]; tailplane?: [number, number][]; fins: Fin[]; nozzles: { x: number; z: number }[];
};
export const JETS: JetSpec[] = [
  { // Tejas: a small compound ("kinked") triangle wing, no front wings, one engine, one fin
    key: 'tejas', name: 'Tejas', len: 13.2, nose: 6.6, tail: -6.6, r: 0.75, lit: '#a3aebb',
    wing: [[0.7, 3.4], [1.8, -0.4], [4.1, -5.2], [4.1, -5.8], [0.7, -6.0]],   // the inner edge swept harder: the kink
    fins: [{ x: 0, z0: -6.4, z1: -2.6, top0: -6.3, top1: -4.6, h: 3.0, cant: 0 }], nozzles: [{ x: 0, z: -6.9 }],
  },
  { // Mirage 2000: a plain triangle wing with one straight leading edge, no front wings, one engine, one fin
    key: 'mirage', name: 'Mirage 2000', len: 14.4, nose: 7.2, tail: -7.2, r: 0.8, lit: '#8e9aa8',
    wing: [[0.8, 2.2], [4.6, -5.0], [4.6, -5.4], [0.8, -5.8]],
    fins: [{ x: 0, z0: -7.0, z1: -3.0, top0: -6.8, top1: -5.2, h: 3.2, cant: 0 }], nozzles: [{ x: 0, z: -7.6 }],
  },
  { // Su-30MKI: swept wings, front wings, tail wings, two engines set wide, two fins
    key: 'su30', name: 'Su-30MKI', len: 21.9, nose: 11.0, tail: -10.9, r: 1.0, lit: '#9aa1a8',
    wing: [[0.9, 5.0], [1.6, 1.2], [7.3, -3.6], [7.3, -4.9], [1.6, -5.2], [0.9, -5.2]], canard: [[1.1, 4.6], [3.0, 3.4], [3.0, 3.0], [1.1, 3.4]],
    tailplane: [[1.6, -6.6], [4.5, -8.8], [4.5, -9.6], [1.6, -9.2]],
    fins: [-1, 1].map(s => ({ x: 1.7 * s, z0: -10.4, z1: -6.0, top0: -10.2, top1: -8.6, h: 3.4, cant: 0.14 * s })), nozzles: [{ x: -1.0, z: -11.2 }, { x: 1.0, z: -11.2 }],
  },
  { // Rafale: a triangle wing with close-coupled front wings (canards), two engines, one fin
    key: 'rafale', name: 'Rafale', len: 15.3, nose: 7.6, tail: -7.6, r: 0.85, lit: '#7d8792',
    wing: [[0.8, 0.4], [5.4, -5.6], [5.4, -6.0], [0.8, -6.4]], canard: [[0.8, 3.0], [2.6, 1.4], [2.6, 1.0], [0.8, 1.2]],
    fins: [{ x: 0, z0: -7.4, z1: -3.4, top0: -7.2, top1: -5.6, h: 3.3, cant: 0 }], nozzles: [{ x: -0.55, z: -7.8 }, { x: 0.55, z: -7.8 }],
  },
];
/** The diamond, relative to the formation's centre: Rafale ahead, Tejas left, Mirage right, Su-30MKI behind. */
export const FORM: V3[] = [[-16, 0, -5], [16, 0, -5], [0, -2, -21], [0, 3, 10]];
export const SPEED = 50;                                         // m/s along +z: the clouds below stream past
const centre = (t: number): V3 => [0, 0, SPEED * t];
export const SILHOUETTE = '#1b2230';

/** Each visit: the glide starts at `go` and arrives at `settled`, when the jet lights up fully. */
export const VISITS = [3.4, 8.4, 12.9, 17.4].map((go, jet) => ({ jet, go, settled: jet === 0 ? 5.4 : go + 1.5 }));
/** How lit a jet is: part-lit (0.35) from frame 0 so the first thing seen is jets (review I2), fully at its visit. */
export const litAt = (i: number, t: number) => 0.35 + 0.65 * prog(t, VISITS[i].settled, 0.35);

const unit = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const LAST = JETS.length - 1;
/** A jet's place and attitude: a gentle bob and sway, the Rafale's barrel roll, a climb after the fly-over. */
export function jetPose(i: number, t: number) {
  // a gentle sway; a slow bank while it's shown (panel, Motion: frozen during each stop); the Rafale's barrel roll
  const v = VISITS[i], stopEnd = i < LAST ? VISITS[i + 1].go : ROLL.t0, shown = t > v.settled && t < stopEnd ? Math.sin((Math.PI * (t - v.settled)) / (stopEnd - v.settled)) : 0;
  const roll = 0.07 * Math.sin(0.8 * t + 2 * i) + 0.2 * shown + (i === LAST ? 2 * Math.PI * prog(t, ROLL.t0, ROLL.t1 - ROLL.t0) : 0);
  const climb = Math.max(0, t - PASS_AT), pitch = -0.25 * prog(t, PASS_AT, 1.2);
  const pos = add(add(centre(t), FORM[i]), [0, 0.9 * Math.sin(0.9 * t + i) + 6 * climb * climb, 0]);
  return { pos, roll, pitch, yaw: 0 };
}
/** A local point on jet i at t, in the world (three.js's 'YXZ' order: roll, then pitch, then yaw). */
export function toWorld(i: number, t: number, p: V3): V3 {
  const { pos, roll, pitch } = jetPose(i, t);
  const [x0, y0, z0] = p;
  const x1 = x0 * Math.cos(roll) - y0 * Math.sin(roll), y1 = x0 * Math.sin(roll) + y0 * Math.cos(roll);
  const y2 = y1 * Math.cos(pitch) - z0 * Math.sin(pitch), z2 = y1 * Math.sin(pitch) + z0 * Math.cos(pitch);
  return [pos[0] + x1, pos[1] + y2, pos[2] + z2];
}
/** The jet's outline points (nose, tail, wing and front-wing tips, fin tops) in the world: for framing. */
export function jetPoints(i: number, t: number): V3[] {
  const j = JETS[i], local: V3[] = [[0, 0, j.nose], [0, 0, j.tail]];
  for (const s of [-1, 1]) {
    const tip = j.wing.reduce((a, b) => (b[0] > a[0] ? b : a));
    local.push([s * tip[0], 0, tip[1]]);
    if (j.canard) { const c = j.canard.reduce((a, b) => (b[0] > a[0] ? b : a)); local.push([s * c[0], 0.4, c[1]]); }
  }
  for (const f of j.fins) local.push([f.x + f.cant * f.h, f.h, (f.top0 + f.top1) / 2]);
  return local.map(p => toWorld(i, t, p));
}
/** What each ring shows while the "how to spot it" line is up (the Rafale's moves to its fin halfway). */
export const FEATURES: V3[][] = [
  [[1.8, 0, -0.4]],                          // Tejas: the kink in its wing's leading edge
  [[2.7, 0, -1.6]],                          // Mirage 2000: its straight leading edge
  [[0, 2.2, -8.4]],                          // Su-30MKI: between its two fins
  [[1.6, 0.5, 2.0], [0, 2.4, -5.6]],         // Rafale: its front wings, then its one fin
];

// ---- camera: [zoom = 1000 / distance, target x, y, z (from the formation's centre), elevation°, azimuth°] ---------------
const S = (d: number, tg: V3, el: number, az: number) => [1000 / d, ...tg, el, az];
const at = (i: number, dz = 0): V3 => [FORM[i][0], FORM[i][1], FORM[i][2] + dz];
export const CAM: { start: number[]; keys: Key[] } = {
  start: S(150, [0, 0, -5], 48, 200),          // above-behind the diamond, all four in frame, as close as it fits
  keys: [
    { t: 3.4, dur: 2.0, to: S(40, at(0, -1), 62, 214) },        // 1 Tejas, from above: its wing's outline
    { t: 5.4, dur: 3.0, to: S(38, at(0, -1), 60, 226) },
    { t: 8.4, dur: 1.5, to: S(40, at(1, -1), 62, 150) },        // 2 Mirage, from above (passing over the Tejas)
    { t: 9.9, dur: 3.0, to: S(38, at(1, -1), 60, 138) },
    { t: 12.9, dur: 1.5, to: S(49, at(2, -4), 42, 175) },       // 3 Su-30MKI, behind and above: its two fins
    { t: 14.4, dur: 3.0, to: S(48, at(2, -4), 41, 165) },
    { t: 17.4, dur: 1.5, to: S(38, at(3, 1), 50, 22) },         // 4 Rafale, above and ahead: its front wings
    { t: 18.9, dur: 1.5, to: S(38, at(3, 1), 44, 8) },
    { t: 20.4, dur: 0.6, to: S(48, at(3), 10, 95) },            // drop beside it so the roll reads (panel, Drama: from above it only thinned)
    { t: 21.0, dur: 0.6, to: S(52, at(3), 12, 110) },
    { t: 21.6, dur: 0.6, to: S(110, [0, 0, -4], 34, 140) },     // pull back behind-right of the diamond for the fly-over
  ],
};
/** The orbit (F22): one full turn from frame 0, at speed on frame 0, easing out only. */
export const orbitAt = (t: number) => { const u = Math.min(1, Math.max(0, t / ORBIT_END)); return 360 * (1 - (1 - u) ** 2); };
const DEG = Math.PI / 180, FOV = 30;
export const BAND = { top: 470, height: 1230, width: 1080 };
export const SAFE_BOTTOM = 1600;
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
function keyed(t: number) {
  const [z, tx, ty, tz, el, az0] = tween(t, CAM.start, CAM.keys), az = (az0 + orbitAt(t)) * DEG, d = 1000 / z, e = el * DEG;
  const target = add(centre(t), [tx, ty, tz]);
  return { position: add(target, [d * Math.cos(e) * Math.sin(az), d * Math.sin(e), d * Math.cos(e) * Math.cos(az)]), target };
}
/** The fly-over: a curved swoop (out round the right, never through a jet) to a point below and ahead of the diamond, which
 *  then holds still in the world while all four fly over it, the camera looking up; they pass over at PASS_AT. */
// LOW sits above the cloud layer (y −70…−120): at −80 the camera was inside it and the end card played over grey
// from the side and a little below, so the diamond crosses the sky sideways through the middle, not up into the header
// (panel, Motion and Drama: the jets flew up behind the header as dark slabs)
const SWOOP = 1.4, AHEAD = 70, LOW: V3 = [72, -18, 0], LOOK: V3 = [0, 0, -6], SIDE: V3 = [95, 10, 0];
export const PASS_AT = FLY_AT + SWOOP + (AHEAD - LOOK[2]) / SPEED;
const below = (t: number): V3 => [LOW[0], LOW[1], AHEAD - SPEED * Math.max(0, t - FLY_AT - SWOOP)];
const shake = (t: number): V3 => { const a = Math.max(0, 1 - Math.abs(t - PASS_AT) / 0.35); return [Math.sin(t * 91) * a * 0.5, Math.sin(t * 67 + 1) * a * 0.4, 0]; };
export function cameraAt(t: number): Camera {
  const k = keyed(t), c = centre(t), w = prog(t, FLY_AT, SWOOP);
  const lerp = (a: V3, b: V3): V3 => [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w, a[2] + (b[2] - a[2]) * w];
  const p0 = sub(k.position, c), p2 = below(t), bz = (i: number) => (1 - w) ** 2 * p0[i] + 2 * (1 - w) * w * SIDE[i] + w * w * p2[i];
  const pos: V3 = [bz(0), bz(1), bz(2)], tgt = lerp(sub(k.target, c), LOOK);
  return { position: add(add(c, pos), shake(t)), target: add(c, tgt), up: [0, 1, 0], fov: FOV, aspect: BAND.width / BAND.height };
}
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export function project(p: V3, cam: Camera) {
  const f = unit(sub(cam.target, cam.position)), r = unit(cross(f, cam.up)), u = cross(r, f), d = sub(p, cam.position);
  const depth = dot(d, f), k = Math.tan((cam.fov * DEG) / 2);
  return { x: ((dot(d, r) / (depth * k * cam.aspect) + 1) / 2) * BAND.width, y: BAND.top + ((1 - dot(d, u) / (depth * k)) / 2) * BAND.height, depth };
}

// ---- tags, the ring, the header's dots ----------------------------------------------------------------------------------
export const TAG = { r: 30, lift: 7 };
export const RING_COLOR = '#ffd23f';
const bump = (t: number, a: number, d: number) => (t < a || t > a + d ? 0 : Math.sin((Math.PI * (t - a)) / d));
export const TAG_POPS = [0.3, 0.65, 1.0, 1.35];
/** A jet's number tag (matching the header's dots), in the opening only: the pills name the jets after it. */
export function tagAt(i: number, t: number) {
  const top = toWorld(i, t, [0, JETS[i].fins[0].h + TAG.lift, JETS[i].tail * 0.2]), q = project(top, cameraAt(t));
  const edge = Math.min(1, Math.max(0, (q.y - BAND.top - TAG.r) / 30), Math.max(0, (1290 - q.y) / 30), Math.max(0, (q.x - TAG.r) / 30), Math.max(0, (1080 - TAG.r - q.x) / 30));
  const alpha = (q.depth > 0 ? edge : 0) * prog(t, TAG_POPS[i] - 0.1, 0.15) * (1 - prog(t, VISITS[0].go, 0.4));
  return { x: q.x, y: q.y, alpha, number: String(i + 1), pop: 1 + 0.3 * bump(t, TAG_POPS[i], 0.35) };
}
/** The ring on the visited jet's telling part, while its "how to spot it" line is up. */
export function ringAt(t: number) {
  const k = VISITS.findIndex(v => t >= v.settled - 1e-6 && t < v.settled + 1.5);
  if (k < 0) return null;
  const v = VISITS[k], fs = FEATURES[v.jet], f = fs[t < v.settled + 0.75 || fs.length === 1 ? 0 : 1];
  const q = project(toWorld(v.jet, t, f), cameraAt(t));
  const u = t - v.settled;
  return { x: q.x, y: q.y, r: 56, pop: 1 + 0.15 * (u > 0 && u < 0.35 ? Math.sin((Math.PI * u) / 0.35) : 0), alpha: prog(t, v.settled - 0.15, 0.2) * (1 - prog(t, v.settled + 1.35, 0.15)) * (0.75 + 0.25 * Math.sin(8 * t)) };
}
/** The header's four dots: "now" while a jet is shown, then "done". */
export function dotState(i: number, t: number): 'next' | 'now' | 'done' {
  // the dot changes with the name (panel, Motion: the dot named the next jet while the old name was still up)
  const on = (k: number) => (k === 0 ? 4.4 : VISITS[k].go + 0.75);
  if (t < on(i)) return 'next';
  return i < LAST && t >= on(i + 1) ? 'done' : 'now';
}

// ---- words ----------------------------------------------------------------------------------------------------------
export const PILL = { y: 1360, size: 56 }, CAPTION_Y = 1490, CAPTION_SIZE = 48;   // the name the biggest words below (panel, Colour)
export const PILLS = JETS.map((j, i) => ({ t0: i === 0 ? 4.4 : VISITS[i].go + 0.75, t1: i < LAST ? VISITS[i + 1].go + 0.75 : FLY_AT, text: `${i + 1} · ${j.name}` }));
const LINES = [['Small triangle wing, kinked.', 'Designed and built in India.'], ['Triangle wing, straight edge.', 'From France, upgraded by HAL.'],
  ['Two tail fins.', 'Russian design, built by HAL.'], ['Front wings, one tail fin.', 'With the IAF since 2020.']];
export const CAPTIONS: Caption[] = VISITS.flatMap((v, k) => {
  const mid = v.settled + 1.5, end = k < LAST ? VISITS[k + 1].go : FLY_AT;
  return [{ t0: v.settled, t1: mid, text: LINES[k][0] }, { t0: mid, t1: end, text: LINES[k][1] }];
}).map(c => ({ ...c, size: CAPTION_SIZE, y: CAPTION_Y }));
export type EndLine = { at: number; text: string; size: number; weight: number; y: number };
export const END_PANEL = { top: 1225, height: 300 };
export const END_LINES: EndLine[] = [
  { at: 0, text: 'Flying one starts with the exam:', size: 48, weight: 700, y: 1300 },
  { at: 0, text: 'maths is 300 of 900 marks.', size: 48, weight: 700, y: 1370 },
  { at: 0.8, text: 'Follow for more', size: 64, weight: 700, y: 1462 },
];
export const COVER_CAPTION = { text: '4 fighter jets of the\nIndian Air Force', y: 360, size: 56 };

type Box = { text: string; x0: number; x1: number; y0: number; y1: number; tag?: boolean };
export function captionBox(c: Caption) {
  const size = c.size ?? CAPTION_SIZE, w = [...c.text].length * size * 0.52 + 96, h = size * 1.22 + 60, y = c.y ?? CAPTION_Y;
  return { x0: 540 - w / 2, x1: 540 + w / 2, y0: y - h / 2, y1: y + h / 2 };
}
export function endLineBox(l: EndLine) {
  const w = [...l.text].length * l.size * 0.52;
  return { x0: 540 - w / 2, x1: 540 + w / 2, y0: l.y - 0.65 * l.size, y1: l.y + 0.65 * l.size };
}
export const pillAt = (t: number) => PILLS.find(p => t >= p.t0 && t < p.t1) ?? null;
export const PILL_H = PILL.size * 1.55;
export function pillBox(text: string) {
  const w = [...text].length * PILL.size * 0.55 + 72;
  return { x0: 540 - w / 2, x1: 540 + w / 2, y0: PILL.y - PILL_H / 2, y1: PILL.y + PILL_H / 2 };
}
export function labelBoxes(t: number): Box[] {
  const out: Box[] = [];
  const p = pillAt(t);
  if (p) out.push({ text: p.text, ...pillBox(p.text) });
  const c = captionAt(CAPTIONS, t);
  if (c && c.alpha > 0.01) out.push({ text: c.caption.text, ...captionBox(c.caption) });
  for (let i = 0; i < JETS.length; i++) {
    const g = tagAt(i, t), k = g.pop;
    if (g.alpha > 0.05) out.push({ text: `tag ${g.number}`, x0: g.x - k * TAG.r, x1: g.x + k * TAG.r, y0: g.y - k * TAG.r, y1: g.y + k * TAG.r, tag: true });
  }
  const r = ringAt(t);
  if (r && r.alpha > 0.05) out.push({ text: 'ring', x0: r.x - r.r, x1: r.x + r.r, y0: r.y - r.r, y1: r.y + r.r });
  return out;
}
export function textsAt(t: number): string[] {
  const out = [...HEADER];
  const p = pillAt(t); if (p) out.push(p.text);
  const c = captionAt(CAPTIONS, t); if (c) out.push(c.caption.text);
  for (const l of END_LINES) if (t >= END_AT + l.at) out.push(l.text);
  return out;
}

// ---- clouds far below (white puffs the formation streams over) ------------------------------------------------------------
export function clouds() {
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out: { p: V3; s: number }[] = [];
  for (let z = -300; z < SPEED * DURATION + 400; z += 26) for (let k = 0; k < 3; k++) {
    const x = -260 + 520 * r(), y = -70 - 50 * r(), size = 10 + 14 * r();
    for (let m = 0; m < 4; m++) out.push({ p: [x + (r() - 0.5) * 2.2 * size, y + (r() - 0.5) * 0.5 * size, z + (r() - 0.5) * 1.6 * size], s: size * (0.55 + 0.45 * r()) });
  }
  return out;
}

// ---- sound ----------------------------------------------------------------------------------------------------------
// The engines' hum under everything; a click as each tag pops; a soft shimmer as each jet lights and a click as its ring
// lands (and as the Rafale's moves to its fin); a whoosh on the roll; four passes and the roar as they fly over, the music
// ducked. The music (the track from 29.5 s: full from frame 0, panel Sound) has a silent break during the roll and comes
// back with a hit on the swoop.
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...whooshesFor(CAM.start, CAM.keys),
    ...TAG_POPS.map((t): Hit => ({ kind: 'click', t, gain: 0.35, pitch: 1.4 })),
    ...VISITS.map((v): Hit => ({ kind: 'shimmer', t: v.settled, gain: 0.3 })),
    ...VISITS.map((v): Hit => ({ kind: 'click', t: v.settled + 0.1, gain: 0.4, pitch: 1.2 })),
    { kind: 'click', t: VISITS[LAST].settled + 0.75, gain: 0.3, pitch: 1.1 },
    // a pass per jet, 0.35 s apart and stepping down, so each is heard on its own (panel pass 2: one block of hiss at 1.2)
    ...[0.62, 0.55, 0.5, 0.45].map((gain, k): Hit => ({ kind: 'whoosh-in', t: PASS_AT - 0.5 + 0.35 * k, gain })),
  ],
  beds: [
    // the engines, far off; fading under the fly-over's roar, not before it (pass 2: a hush at 22.5 s)
    { kind: 'roar', t0: 0, t1: FLY_AT + 1.3, level: t => 0.55 * (1 - prog(t, FLY_AT + 0.6, 0.6)) },
    { kind: 'roar', t0: FLY_AT, t1: END_AT + 2.0, level: t => 2.4 * (t < PASS_AT ? ((t - FLY_AT) / (PASS_AT - FLY_AT)) ** 2 : Math.max(0, 1 - (t - PASS_AT) / 2.4)) },
  ],
  // this stretch of the track (29.5 s on) is ~6 dB hotter than the shelf's level, which was set from its quiet intro: × 0.5
  music: t => 0.5 * (1 - 0.3 * Math.max(0, 1 - Math.abs(t - VISITS[LAST].settled - 0.05) / 0.5)) * (1 - 0.25 * Math.max(0, 1 - Math.abs(t - PASS_AT) / 0.8)),
};
export { captionAt };
