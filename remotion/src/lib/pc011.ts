// @pyqvault_ · Chemistry, visualised #11 (2026-10-26, framework v1.31): the same hammer, the same hit, on a copper bar and a
// salt crystal. Which shatters? A copper, B salt, C both → B. Idea C45 ("Metal bends, salt shatters"; founder's idea, score
// 55), picked as the third Shock reel and the first made under F37 (the aftershock). Hook: Same start, two endings ·
// Opening: Shock (both hammers land at 0.2 s) · loops (F27: the two reels before it end on the end card). Remade the same
// day for drama (founder: "not dramatic enough, pretty bland"): a dark set under a spotlight, close-ups and whip-pans in
// the first 3 s, a flash, chips and dust at the hit, a flash, 180 shards and a dust cloud at the burst.
//
// The chemistry (F10). In a metal, + ions sit in a sea of electrons that belong to no one atom: push one layer of ions one
// step over the next and the sea flows with it, so the metal bends and stays whole. In a salt, + and − ions take turns in
// every direction (rock salt: each Na⁺ has six Cl⁻ neighbours): push one layer one step and + sits on +, − on −, they push
// apart and the crystal splits along that plane. Salt's planes are its cube faces, so it breaks into smaller cubes. Sizes:
// copper's atoms are 256 pm apart (radius 128 pm, touching); Na⁺ 102 pm and Cl⁻ 181 pm, 282 pm apart (Shannon radii).
// Shown in slow motion (the caption says so, F10); the pieces fall under a slowed gravity.
//
// BEAT TABLE (runbook step 1; F37: a new event about every second until 3 s; F38: after the review panel's two passes)
// | time            | what moves                                                          | text (beside what it names)      | keep in frame     |
// | 0–0.2 s HOOK    | Shock, close: the hammer head (a short trail) a hand above the salt | the question, A/B/C, tag (big)   | the crystal       |
// | 0.2 s           | the first blow: a short flash, a crack down its face, a corner      | (both hammers land together)     |                   |
// |                 | knocked off, chips and dust, a hard shake (crack, boom, thunk)      |                                  |                   |
// | 0.75 s          | hard cut (snap) to the copper bar, still nearly straight            |                                  | the bar           |
// | 0.78–1.3 s      | it bends into a deep V under its hammer, fast then slowing; at 1.3 s|                                  | the bar           |
// |                 | it rings, dust bursts off its blocks, the hammer kicks up (whump, clang)|                              |                   |
// | 1.55 s          | hard cut (snap) back to the cracked crystal; the camera pushes in   |                                  | the crystal       |
// | 1.6–2.55 s      | cracks race across its faces (crack ×4, snap), dust spits, it shivers |                                |                   |
// | 2.55–3.2 s      | both hammers wind up and slam down                                  | the question shrinks (2.8 s)     | the crystal       |
// | 3.2 s           | the second blow: the burst, close: a flash, 27 cubes and 180 shards |                                  | the crystal       |
// |                 | fly (a third at the camera), a dust cloud (boom, crack)            |                                  |                   |
// | 3.32 s          | the hammer drives through to its steel block: amber sparks (thunk)  |                                  |                   |
// | 3.45–3.9 s      | ANSWER, held close on the debris (the music's accent)              | Salt shatters. Copper just bends.| the debris        |
// | 3.9–4.5 s       | pull back to both set-ups; pieces land (taps)                       | B salt (big) · copper            | both set-ups      |
// | 4.9 s 2nd HOOK  | the dive into the copper's bend (whoosh, snap, a lift in the music) | So why didn't the copper break?  | the bend          |
// | 5.6 s           | cut (snap) into copper's atoms, at an angle: + cores in a flowing,  | Copper: + ions in an electron sea| the slab          |
// |                 | glowing electron sea                                                |                                  |                   |
// | 6.3–7.0 s       | the top layers slide one step; the sea flows with them (scrape)     | Layers slide. The sea still holds.| the slab         |
// | 8.4 s           | cut (snap) to salt's atoms: Na⁺ and Cl⁻ taking turns                | Salt: + and − take turns         | the slab          |
// | 9.0–9.6 s       | the top layers slide one step (scrape)                              |                                  | the slab          |
// | 9.6–10.1 s      | + over +, − over −: yellow pulses and arrows (thunk ×3); punch in   | Slide one step: + meets +        | the slip plane    |
// | 10.6 s          | the split: a flash and a shake, the top layers flung apart, drifting| Like charges push. It splits.    | both halves       |
// |                 | on (crack, boom); the camera pulls back                             |                                  |                   |
// | 11.9 s          | cut (snap) back out: the bent bar, the scattered cubes, drifting    | Metals bend. Salts shatter.      | both set-ups      |
// | 12.95–14.45 s   | the rewind (shimmer): pieces fly back, the bar straightens, the     | the question returns big         | → the crystal     |
// |                 | hammers rise, back to the close-up: the last frame is frame 0 (loop)|                                  |                   |
// Colours (F24): copper, steel, wood, salt REAL (lab set); Na⁺ violet, Cl⁻ green, electrons cyan, the push red (VIVID lab:
// ions have no colour of their own). Pairs told apart (tests): Na⁺ vs Cl⁻, copper vs its electrons. Dark board (LAB).
import { clamp01, ease, prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { LAB, REAL, VIVID } from './palette.ts';
import { orbitCamera, project, type V3 } from './inductionScene.ts';
import { FULL, SAFE, inSafeArea, textBox, type Box } from './layout.ts';

export const DURATION = 14.45;
export const T_HIT = 0.2, T_BEND1 = 1.3, T_CRACK1 = 1.6, T_CRACK2 = 2.35, T_SHRINK = 2.8, T_BURST = 3.2, ANSWER_AT = 3.45;
export const T_SECOND = 4.9, CUT1 = 5.6, SECOND_ANSWER_AT = 7.1, CUT2 = 8.4, T_LIKE = 9.6, T_SPLIT = 10.6, CUT3 = 11.9, REW0 = 12.95;
export const COVER_T = 0.45;
const T_SLIDE_CU = 6.3, T_SLIDE_NACL = 9.0, SLIDE = 0.6;
/** The shots (F37: no still shot before the burst): close on the crystal for the hit, a whip-pan to the copper bending, a
 *  whip back to the crystal circling it as the cracks race, the burst close, then wide for the answer and the dive. A wide
 *  shot at 1.4–2.7 s in the first remake let the picture go still (1–2 % of pixels moving). These are the wide ones (F35 is
 *  checked on them). */
export const WIDE: [number, number][] = [[4.5, T_SECOND], [CUT3, REW0]];
/** Hard cuts on the bench (the panel's pass 2: the whip-pans were blurred, dead frames): to the copper, back to the salt. */
export const MACRO_CUTS = [0.75, 1.55];
export const LABEL = 'CHEMISTRY, VISUALISED  #11';
export const HEADER = ['Same hammer. Same hit.', 'Which one shatters?'];
export const OPTIONS = ['A  copper', 'B  salt', 'C  both'], ANSWER = 1;
export const SHORT_Q = 'Copper or salt: which shatters?';
export const SECOND_Q = 'So why didn\'t the copper break?';
export const BRAND = 'PYQ Vault · pyqvault.com';

// ---- the chemistry (F10: the tests re-derive it) ----
/** Radii and spacings in pm: copper's metallic radius, Na⁺ and Cl⁻ (Shannon, 6-coordinate). */
export const PM = { Cu: 128, CuSpacing: 256, 'Na+': 102, 'Cl-': 181, NaClSpacing: 282 } as const;
const U = 100;                                                             // micro scene units: 100 pm
export const CU_SLAB = { cols: 7, rows: 4, layers: 2, gap: PM.CuSpacing / U, r: PM.Cu / U } as const;
export const SALT_SLAB = { cols: 7, rows: 4, layers: 2, gap: PM.NaClSpacing / U } as const;
const SLIP = 2;                                                            // rows 2 and 3 are the layers that slide
export type Ion = 'Na+' | 'Cl-';
/** Rock salt: the ions take turns in every direction. */
export const ionAt = (i: number, j: number, k = 0): Ion => ((i + j + k) % 2 === 0 ? 'Cl-' : 'Na+');
/** The ions facing each other across the slip plane once the top layers have slid `steps` places: [below, above]. */
export function facingPairs(steps: number): [Ion, Ion][] {
  const out: [Ion, Ion][] = [];
  for (let i = 0; i < SALT_SLAB.cols; i++) if (i + steps < SALT_SLAB.cols) out.push([ionAt(i + steps, SLIP - 1), ionAt(i, SLIP)]);
  return out;
}
export const slideCu = (t: number) => prog(t, T_SLIDE_CU, 0.7);
export const slideSalt = (t: number) => prog(t, T_SLIDE_NACL, SLIDE);
export const splitAt = (t: number) => prog(t, T_SPLIT, 0.7);   // fast: the halves fly
/** How hard like charges push at the slip plane (0–1): three pulses as they line up, held until they fly apart. */
export const repelAt = (t: number) => (t < T_LIKE || t > T_SPLIT + 0.6 ? 0 : Math.max(0.45, ...[0, 0.25, 0.5].map(d => Math.exp(-Math.max(0, t - T_LIKE - d) / 0.12) * (t >= T_LIKE + d ? 1 : 0))) * (1 - prog(t, T_SPLIT, 0.6)));

// ---- seeded numbers: the same on every render and in the tests ----
const rng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// ================= macro: the bench (scene units ≈ 10 per metre; the floor at y = 0) =================
const BLOCK_H = 0.55;
export const BAR = { x: -0.95, half: 0.75, support: 0.6, thick: 0.12, depth: 0.22, base: BLOCK_H } as const;
export const SUPPORT = { w: 0.2, d: 0.4, h: BLOCK_H } as const;
export const SALT = { x: 0.95, base: BLOCK_H, side: 0.45 } as const;
export const SALT_BLOCK = { hw: 0.32, hd: 0.3, h: BLOCK_H } as const;
export const PIECE = SALT.side / 3;
const BAR_TOP = BAR.base + BAR.thick, SALT_TOP = SALT.base + SALT.side;

/** Story time: the slow-motion clock of the bench. It runs with t, holds while the atoms are on screen, and runs back to
 *  0 over the rewind, so the last frame is frame 0. */
const S_END = T_BURST + 2.6;
export function storyTime(t: number) {
  if (t < CUT3) return Math.min(t, S_END);
  if (t < REW0) return S_END;
  return S_END * (1 - ease(clamp01((t - REW0) / (DURATION - REW0))));
}
export const sceneAt = (t: number): 'macro' | 'copper' | 'salt' => (t < CUT1 || t >= CUT3 ? 'macro' : t < CUT2 ? 'copper' : 'salt');

/** How far the middle of the copper bar has sunk (scene units). */
const BEND_MAX = 0.24, BEND_MORE = 0.05;
const ring = (s: number, t0: number) => (s > t0 ? 0.03 * Math.sin(28 * (s - t0)) * Math.exp(-(s - t0) / 0.35) : 0);
/** The first blow bends the bar slowly at first, then fast (u³: the whip lands on a bar still mostly straight at 1 s, the
 *  panel's Motion must-fix), and it rings as the bend lands; the second blow at the burst bends it a little more. */
const easeOut = (u: number) => 1 - (1 - u) ** 2;
export const bendAt = (s: number) => BEND_MAX * (0.1 * clamp01((s - T_HIT) / (MACRO_CUTS[0] - T_HIT))
  + 0.9 * easeOut(clamp01((s - MACRO_CUTS[0] - 0.03) / (T_BEND1 - MACRO_CUTS[0] - 0.03)))) + ring(s, T_BEND1)
  + BEND_MORE * ease(clamp01((s - T_BURST) / 0.15)) + ring(s, T_BURST + 0.15);
/** The bar's centre line as offsets from straight: a V with a rounded tip between the blocks, the overhanging ends lifting
 *  on as straight lines (x from the bar's middle, −half…half). */
export function barShape(s: number, n = 30) {
  const D = bendAt(s), c = 0.08, a = BAR.support, norm = Math.sqrt(a * a + c * c) - c;
  const g = (u: number) => (Math.sqrt(u * u + c * c) - c) / norm, slope = a / Math.sqrt(a * a + c * c) / norm;
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = (i - n / 2) * (2 * BAR.half / n), u = Math.abs(x);
    return { x, dy: u <= a ? -D * (1 - g(u)) : D * slope * (u - a) };
  });
}

/** A hammer: `face` is the height of its striking face, `surface` what's under it, `lift` the gap between. Both fall from
 *  the same height at the same speed and land together (same start); the copper's rides the bar down as it bends, then
 *  kicks up; the salt's bounces off the cracked crystal. Both wind up from 2.55 s and strike again at the burst: the first
 *  blow cracks the salt, the second shatters it (and bends the copper a little more); the salt's drops through to the block. */
const LIFT0 = 0.22, T_DROP = 0.12, T_WIND = 2.55, T_SLAM = 3.0, WOUND = 0.75;
const windUp = (from: number, s: number) => (s < T_SLAM ? from + (WOUND - from) * ease(clamp01((s - T_WIND) / (T_SLAM - T_WIND)))
  : WOUND * (1 - clamp01((s - T_SLAM) / (T_BURST - T_SLAM)) ** 2));
export function hammerAt(k: 'copper' | 'salt', s: number) {
  const x = k === 'copper' ? BAR.x : SALT.x;
  let surface: number, lift: number;
  if (k === 'copper') {
    surface = BAR_TOP - bendAt(s);
    const up = 0.45 * ease(clamp01((s - T_BEND1) / 0.5));                                     // it kicks back up off the bar
    lift = s < T_HIT ? LIFT0 * (1 - s / T_HIT) : s < T_WIND ? up : s < T_BURST ? windUp(0.45, s)
      : 0.5 * ease(clamp01((s - T_BURST - 0.15) / 0.6));
  } else {
    const burst = s >= T_BURST;
    surface = burst ? SALT.base : SALT_TOP;
    if (s < T_HIT) lift = LIFT0 * (1 - s / T_HIT);
    else if (!burst) lift = s < T_WIND ? 0.22 * ease(clamp01((s - T_HIT) / 0.4)) : windUp(0.22, s);
    else {
      const fall = clamp01((s - T_BURST) / T_DROP) ** 2, from = SALT_TOP - SALT.base;
      lift = from * (1 - fall) + 0.6 * ease(clamp01((s - T_BURST - T_DROP - 0.08) / 1.3));
    }
  }
  return { x, surface, lift, face: surface + lift, tilt: (k === 'copper' ? 1 : -1) * 0.35 * Math.min(lift, 0.6) };
}

/** The crystal shivers under the hammer while the cracks spread, harder as the burst nears (scene units, x and z). */
export function shiverAt(s: number): [number, number] {
  if (s < T_CRACK1 || s >= T_BURST) return [0, 0];
  const a = 0.004 + 0.01 * clamp01((s - T_CRACK1) / (T_BURST - T_CRACK1));
  return [a * Math.sin(97 * s), a * Math.cos(83 * s)];
}

/** Camera shake, on the bench only: the hit and the burst. */
export function shakeAt(t: number): [number, number] {
  if (t >= CUT1) return [0, 0];
  const amp = (t0: number, a: number) => (t >= t0 ? a * Math.exp(-(t - t0) / 0.15) : 0);
  const k = amp(T_HIT, 0.09) + amp(T_BURST, 0.07);
  return [k * Math.sin(61 * t), 0.6 * k * Math.cos(53 * t)];
}

/** Dust rings on the floor round each block as the hammers land, and again under the copper as its bend lands. */
export function dustAt(s: number) {
  const rings = [
    ...[BAR.x - BAR.support, BAR.x + BAR.support, SALT.x].map(x => ({ x, t0: T_HIT, r0: 0.25 })),
    ...[BAR.x - BAR.support, BAR.x + BAR.support].map(x => ({ x, t0: T_BEND1, r0: 0.2 })),
    { x: SALT.x, t0: T_BURST + T_DROP, r0: 0.35 },
  ];
  return rings.filter(r => s >= r.t0 && s < r.t0 + 0.9).map(r => { const u = (s - r.t0) / 0.9; return { x: r.x, r: r.r0 + 0.6 * ease(u), alpha: 0.32 * (1 - u) }; });
}

/** Cracks on the crystal's faces (front z = +side/2, top), along the planes it will split on: two run down from the hammer
 *  at 1.3 s, three more branch across at 2.2 s (the hint). Each grows over 0.3 s; gone once it bursts. */
type Crack = { t0: number; pts: V3[] };
const h = SALT.side / 2, X0 = SALT.x;
const CRACKS: Crack[] = [
  { t0: T_HIT, pts: [[X0 + PIECE / 2, SALT_TOP, 0], [X0 + PIECE / 2, SALT_TOP, h], [X0 + PIECE / 2, SALT.base, h]] },   // the first blow
  { t0: T_CRACK1 + 0.15, pts: [[X0 - PIECE / 2, SALT_TOP, 0], [X0 - PIECE / 2, SALT_TOP, h], [X0 - PIECE / 2, SALT.base + PIECE, h]] },
  { t0: T_CRACK2, pts: [[X0 + PIECE / 2, SALT.base + 2 * PIECE, h], [X0 - h, SALT.base + 2 * PIECE, h]] },
  { t0: T_CRACK2 + 0.1, pts: [[X0 + PIECE / 2, SALT.base + PIECE, h], [X0 + h, SALT.base + PIECE, h]] },
  { t0: T_CRACK2 + 0.2, pts: [[X0 - PIECE / 2, SALT_TOP, -PIECE / 2], [X0 + h, SALT_TOP, -PIECE / 2]] },
];
const len = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
/** A crack is jagged, not ruled (the panel: "black tape"): each straight run is split in five, its inner points nudged
 *  across the face it runs on (never off the crystal's surface). */
function jag(pts: V3[], seed: number): V3[] {
  const r = rng(seed), out: V3[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], d = [0, 1, 2].map(k => Math.abs(b[k] - a[k])), along = d.indexOf(Math.max(...d));
    const normal = Math.abs(a[2] - h) < 1e-9 && Math.abs(b[2] - h) < 1e-9 ? 2 : 1, across = [0, 1, 2].find(k => k !== along && k !== normal)!;
    for (let j = 1; j < 5; j++) {
      const p: V3 = [a[0] + (b[0] - a[0]) * j / 5, a[1] + (b[1] - a[1]) * j / 5, a[2] + (b[2] - a[2]) * j / 5];
      p[across] += (r() - 0.5) * 0.028;
      out.push(p);
    }
    out.push(b);
  }
  return out;
}
CRACKS.forEach((c, i) => { c.pts = jag(c.pts, 700 + i); });
export function cracksAt(s: number): V3[][] {
  if (s >= T_BURST) return [];
  return CRACKS.filter(c => s >= c.t0).map(c => {
    const total = c.pts.slice(1).reduce((a, p, i) => a + len(c.pts[i], p), 0);
    let left = total * ease(clamp01((s - c.t0) / 0.3));
    const out: V3[] = [c.pts[0]];
    for (let i = 1; i < c.pts.length && left > 0; i++) {
      const l = len(c.pts[i - 1], c.pts[i]), k = Math.min(1, left / l), a = c.pts[i - 1], b = c.pts[i];
      out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]); left -= l;
    }
    return out;
  });
}
/** Flecks of salt spraying off each new crack (ballistic, slowed gravity). */
const FLECKS = (() => {
  const r = rng(1111);
  return CRACKS.flatMap(c => Array.from({ length: 6 }, () => ({ t0: c.t0 + 0.05, o: c.pts[1], v: [(r() - 0.5) * 0.8, 0.4 + r() * 0.6, 0.2 + r() * 0.5] as V3 })));
})();
export function flecksAt(s: number) {
  return FLECKS.filter(f => s >= f.t0 && s < f.t0 + 0.7).map(f => {
    const u = s - f.t0;
    return { pos: [f.o[0] + f.v[0] * u, f.o[1] + f.v[1] * u - 2.5 * u * u, f.o[2] + f.v[2] * u] as V3, alpha: 1 - u / 0.7 };
  });
}

// ---- the burst: 27 cubes, simulated once with a fixed step (the same in Node and in Edge) ----
const G = 5, BOUNCE = 0.3, GRIP = 0.55, SLOW = 2.2, DT = 1 / 240, KEEP = 2;
/** What a piece rests on: the salt's block or the floor. */
export const supportAt = (x: number, z: number) => (Math.abs(x - SALT.x) <= SALT_BLOCK.hw && Math.abs(z) <= SALT_BLOCK.hd ? SALT_BLOCK.h : 0);
type State = { p: V3; r: V3 };
/** Half the height of a cube of side PIECE turned by Euler angles r (three.js order XYZ). */
function halfHeight(r: V3) {
  const [cx, sx, cy, sy, cz, sz] = [Math.cos(r[0]), Math.sin(r[0]), Math.cos(r[1]), Math.sin(r[1]), Math.cos(r[2]), Math.sin(r[2])];
  // second row of R = Rx·Ry·Rz
  const r10 = cx * sz + sx * sy * cz, r11 = cx * cz - sx * sy * sz, r12 = -sx * cy;
  return (PIECE / 2) * (Math.abs(r10) + Math.abs(r11) + Math.abs(r12));
}
const START: V3[] = [];
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++)
  START.push([SALT.x + (i - 1) * PIECE, SALT.base + (j + 0.5) * PIECE, (k - 1) * PIECE]);
const SIM = (() => {
  const r = rng(4545), frames: State[][] = [], landings: number[] = [];
  const pieces = START.map((p, n) => {
    const j = Math.floor(n / 3) % 3, dx = p[0] - SALT.x, dz = p[2];
    let a = Math.atan2(dz, dx);
    if (Math.hypot(dx, dz) < 1e-9) a = r() * 2 * Math.PI;
    const sp = 0.45 + 0.5 * r() + 0.12 * j;
    return { p: [...p] as V3, v: [0.55 * sp * Math.cos(a), 0.5 + 0.7 * r() + 0.25 * j, sp * Math.sin(a) + 0.15] as V3,
      r: [0, 0, 0] as V3, w: [(r() - 0.5) * 9, (r() - 0.5) * 6, (r() - 0.5) * 9] as V3, rest: false, landed: false };
  });
  const steps = Math.round((S_END + 0.5 - T_BURST) / DT);
  for (let s = 0; s <= steps; s++) {
    if (s % KEEP === 0) frames.push(pieces.map(q => ({ p: [...q.p] as V3, r: [...q.r] as V3 })));
    for (const q of pieces) {
      if (q.rest) {                                              // settle flat, keep the turn about the vertical
        q.r = q.r.map((a, i) => (i === 1 ? a : a + (Math.round(a / (Math.PI / 2)) * (Math.PI / 2) - a) * Math.min(1, DT * 12))) as V3;
        q.p[1] = supportAt(q.p[0], q.p[2]) + halfHeight(q.r);
        const sp = Math.hypot(q.v[0], q.v[2]);
        if (sp > 0) { const k = Math.max(0, sp - SLOW * DT) / sp; q.v[0] *= k; q.v[2] *= k; }
        q.p[0] += q.v[0] * DT; q.p[2] += q.v[2] * DT;
        if (q.p[1] - halfHeight(q.r) > supportAt(q.p[0], q.p[2]) + 1e-6) q.rest = false;   // slid off the block: falls again
        continue;
      }
      q.v[1] -= G * DT;
      for (let i = 0; i < 3; i++) { q.p[i] += q.v[i] * DT; q.r[i] += q.w[i] * DT; }
      const floor = supportAt(q.p[0], q.p[2]), hh = halfHeight(q.r);
      if (q.p[1] - hh < floor && q.v[1] < 0) {
        q.p[1] = floor + hh;
        if (!q.landed) { q.landed = true; landings.push(T_BURST + s * DT); }
        q.v[1] = -q.v[1] * BOUNCE; q.v[0] *= GRIP; q.v[2] *= GRIP; q.w = q.w.map(w => w * GRIP) as V3;
        if (q.v[1] < 0.25) { q.v[1] = 0; q.rest = true; q.w = [0, 0, 0]; }
      }
    }
  }
  return { frames, landings };
})();
/** The 27 pieces at story time s: centres, turns and size. */
export function piecesAt(s: number) {
  if (s < T_BURST) return START.map(p => ({ pos: [...p] as V3, rot: [0, 0, 0] as V3, size: PIECE }));
  const f = (s - T_BURST) / (DT * KEEP), i = Math.min(SIM.frames.length - 1, Math.floor(f)), j = Math.min(SIM.frames.length - 1, i + 1), u = Math.min(1, f - i);
  return SIM.frames[i].map((a, n) => {
    const b = SIM.frames[j][n];
    return { pos: a.p.map((v, k) => v + (b.p[k] - v) * u) as V3, rot: a.r.map((v, k) => v + (b.r[k] - v) * u) as V3, size: PIECE };
  });
}

// ---- the drama (founder, 2026-10-26: "not dramatic enough"): a flash, chips and dust at the hit; at the burst a flash,
// shards flying (some straight at the camera) and a cloud of salt dust. Chips and shards are real (salt breaks into small
// cubes); the flash is the reel's drama (F10: drama of any kind, the result real). ----
/** A white flash at the hit and at the burst (0–1): up in 0.02 s, gone in ~0.3 s. Time t, not story time: the rewind
 *  doesn't replay it. */
export function flashAt(t: number) {
  if (t >= CUT1) { const u = t - T_SPLIT; return u < 0 ? 0 : 0.8 * (u < 0.02 ? u / 0.02 : Math.exp(-(u - 0.02) / 0.04)); }   // the atomic split
  return Math.min(1, [T_HIT, T_BURST].reduce((a, t0) => {
    const u = t - t0;
    return a + (u < 0 ? 0 : u < 0.02 ? u / 0.02 : Math.exp(-(u - 0.02) / 0.04));   // 2–3 frames (the panel: no white-out)
  }, 0));
}
/** A small ballistic body with a size, simulated to the floor or the block (bounce, then rest). */
type Bit = { p: V3; v: V3; size: number; spin: V3 };
function fly(bits: Bit[], t0: number, until: number, g = G) {
  const frames: V3[][] = [], steps = Math.round((until - t0) / DT), live = bits.map(b => ({ p: [...b.p] as V3, v: [...b.v] as V3, rest: false }));
  for (let s = 0; s <= steps; s++) {
    if (s % KEEP === 0) frames.push(live.map(q => [...q.p] as V3));
    for (const [n, q] of live.entries()) {
      if (q.rest) continue;
      q.v[1] -= g * DT;
      for (let i = 0; i < 3; i++) q.p[i] += q.v[i] * DT;
      const floor = supportAt(q.p[0], q.p[2]) + bits[n].size / 2;
      if (q.p[1] < floor) {
        q.p[1] = floor; q.v[1] = -q.v[1] * 0.25; q.v[0] *= 0.5; q.v[2] *= 0.5;
        if (q.v[1] < 0.2) { q.rest = true; q.v = [0, 0, 0]; }
      }
    }
  }
  return (s: number) => {
    const f = Math.max(0, (s - t0) / (DT * KEEP)), i = Math.min(frames.length - 1, Math.floor(f)), j = Math.min(frames.length - 1, i + 1), u = Math.min(1, f - i);
    return frames[i].map((a, n) => ({ pos: a.map((v, k) => v + (frames[j][n][k] - v) * u) as V3, size: bits[n].size, rot: bits[n].spin.map(w => w * (s - t0)) as V3 }));
  };
}
/** 40 chips knocked off the crystal's top edges by the hit, spraying out and falling (slow motion). */
const CHIP_LIFE = 1.6;
const CHIPS = (() => {
  const r = rng(3131);
  const bits: Bit[] = Array.from({ length: 40 }, () => {
    const a = r() * 2 * Math.PI, sp = 0.5 + r() * 0.9;
    return { p: [SALT.x + 0.1 * Math.cos(a), SALT_TOP - 0.01, 0.1 * Math.sin(a)] as V3, v: [sp * Math.cos(a), 0.6 + r() * 1.0, sp * Math.sin(a) + 0.25] as V3,
      size: 0.012 + r() * 0.025, spin: [(r() - 0.5) * 12, (r() - 0.5) * 12, (r() - 0.5) * 12] as V3 };
  });
  bits.push({ p: [SALT.x + h - 0.05, SALT_TOP - 0.05, h - 0.05], v: [0.7, 0.9, 0.8], size: 0.09, spin: [7, 3, 9] });   // a corner knocked off
  return fly(bits, T_HIT, T_HIT + CHIP_LIFE, 10);                 // chips fall fast (the panel: they hung in the air)
})();
export const chipsAt = (s: number) => (s < T_HIT || s >= T_HIT + CHIP_LIFE ? [] : CHIPS(s));
/** 180 shards thrown out by the burst, faster than the 27 big pieces, a third of them straight at the camera. */
const SHARDS = (() => {
  const r = rng(8181);
  const bits: Bit[] = Array.from({ length: 180 }, (_, n) => {
    const a = r() * 2 * Math.PI, sp = 0.8 + r() * 1.6, atCam = n % 3 === 0;
    const p: V3 = [SALT.x + (r() - 0.5) * SALT.side, SALT.base + 0.02 + r() * SALT.side, (r() - 0.5) * SALT.side];
    return { p, v: [sp * Math.cos(a) * 0.7, 0.4 + r() * 1.6, atCam ? 0.9 + r() * 1.3 : sp * Math.sin(a)] as V3,
      size: 0.015 + r() * 0.04, spin: [(r() - 0.5) * 16, (r() - 0.5) * 16, (r() - 0.5) * 16] as V3 };
  });
  return fly(bits, T_BURST, S_END + 0.5);
})();
export const shardsAt = (s: number) => (s < T_BURST ? [] : SHARDS(s));
/** Amber sparks where the salt's hammer drives through and hits its steel block (steel on steel). */
const SPARK_T = T_BURST + T_DROP;
const SPARKS = (() => {
  const r = rng(5757);
  return Array.from({ length: 22 }, () => { const a = r() * 2 * Math.PI, sp = 1.2 + r() * 1.6; return { v: [sp * Math.cos(a), 0.5 + r() * 1.4, sp * Math.sin(a) + 0.3] as V3, life: 0.35 + r() * 0.35 }; });
})();
export function sparksAt(s: number) {
  return SPARKS.filter(k => s >= SPARK_T && s < SPARK_T + k.life).map(k => {
    const u = s - SPARK_T;
    return { pos: [SALT.x + k.v[0] * u, SALT.base + 0.02 + Math.max(0, k.v[1] * u - 6 * u * u), 0.12 + k.v[2] * u] as V3, alpha: 1 - u / k.life };
  });
}
/** Salt dust: a puff off the crystal at the hit, a cloud at the burst; puffs grow, drift up and out, and fade. */
const PUFFS = (() => {
  const r = rng(9393), fromSalt = () => [SALT.x, SALT.base + SALT.side * (0.3 + 0.7 * r()), 0] as V3;
  const make = (t0: number, n: number, spread: number, life: number, from = fromSalt) => Array.from({ length: n }, () => {
    const a = r() * 2 * Math.PI;
    return { t0: t0 + r() * 0.08, life: life * (0.7 + 0.3 * r()), o: from(),
      d: [Math.cos(a) * spread * (0.4 + r()), 0.15 + r() * 0.5, Math.sin(a) * spread * (0.4 + r()) + 0.15] as V3, r0: 0.04 + r() * 0.05 };
  });
  const blocks = () => [BAR.x + (r() < 0.5 ? -1 : 1) * BAR.support, 0.08, 0] as V3, top = () => [SALT.x + (r() - 0.5) * 0.3, SALT.base + SALT.side, 0.1] as V3;
  return [...make(T_HIT, 14, 0.35, 1.1), ...make(T_BEND1, 12, 0.3, 0.9, blocks), ...make(T_CRACK1, 6, 0.2, 0.8, top), ...make(T_CRACK2, 8, 0.25, 0.8, top),
    ...make(T_BURST, 46, 0.9, 2.4)];
})();
export function dustCloudAt(s: number) {
  return PUFFS.filter(p => s >= p.t0 && s < p.t0 + p.life).map(p => {
    const u = (s - p.t0) / p.life, g = 1 - Math.exp(-u * 4);
    return { pos: [p.o[0] + p.d[0] * g, p.o[1] + p.d[1] * g, p.o[2] + p.d[2] * g] as V3, r: p.r0 + 0.22 * g, alpha: 0.5 * (1 - u) * Math.min(1, u * 12) };
  });
}

// ================= micro: the slabs (units of 100 pm), front layer at z = 0 =================
const slabXY = (i: number, j: number, gap: number, cols: number, rows: number) => [(i - (cols - 1) / 2) * gap, (j - (rows - 1) / 2) * gap] as const;
/** Copper's cores at t: the top two rows have slid `slideCu` steps. */
export function copperCoresAt(t: number) {
  const { cols, rows, layers, gap } = CU_SLAB, out: V3[] = [];
  for (let k = 0; k < layers; k++) for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const [x, y] = slabXY(i, j, gap, cols, rows);
    out.push([x + (j >= SLIP ? slideCu(t) * gap : 0), y, -k * gap]);
  }
  return out;
}
/** The electron sea: 46 electrons wandering between and in front of the cores; those in the top rows ride the slide. */
const ELECTRONS = (() => {
  const r = rng(2626), w = (CU_SLAB.cols - 1) / 2 * CU_SLAB.gap, hh = (CU_SLAB.rows - 1) / 2 * CU_SLAB.gap;
  return Array.from({ length: 46 }, () => ({ x: (r() * 2 - 1) * w, y: (r() * 2 - 1) * hh, z: r() < 0.5 ? 1.45 : -CU_SLAB.gap / 2, ph: r() * 6.28, w: 0.8 + r() * 1.4 }));
})();
export function electronsAt(t: number) {
  const w = (CU_SLAB.cols - 1) * CU_SLAB.gap, flow = (x: number) => ((((x + w / 2) % w) + w) % w) - w / 2;   // drifting, wrapped
  return ELECTRONS.map(e => [flow(e.x + 1.1 * t) + 0.7 * Math.sin(e.w * t + e.ph) + (e.y > 0 ? slideCu(t) : 0.4 * slideCu(t)) * CU_SLAB.gap,
    e.y + 0.5 * Math.cos(1.3 * e.w * t + e.ph), e.z] as V3);
}
/** Salt's ions at t: the top two rows slide one step, then fly up and tilt away (the split). */
export function saltIonsAt(t: number) {
  const { cols, rows, layers, gap } = SALT_SLAB, sp = splitAt(t), out: { pos: V3; ion: Ion }[] = [];
  for (let k = 0; k < layers; k++) for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const [x, y] = slabXY(i, j, gap, cols, rows);
    if (j < SLIP) { out.push({ pos: [x, y, -k * gap], ion: ionAt(i, j, k) }); continue; }
    const after = Math.max(0, t - T_SPLIT - 0.7), a = 0.22 * sp + 0.08 * after, px = x + slideSalt(t) * gap, py = y + 6.5 * sp + 1.4 * after, cx = (cols - 1) / 2 * gap * 0.3, cy = gap / 2;
    // the top block turns about its lower right edge as it lifts
    const dx = px - cx, dy = py - cy;
    out.push({ pos: [cx + dx * Math.cos(a) - dy * Math.sin(a) + 1.2 * sp, cy + dx * Math.sin(a) + dy * Math.cos(a), -k * gap], ion: ionAt(i, j, k) });
  }
  return out;
}
/** The like pairs facing each other once slid, where the push shows (front layer only). */
export function repelPairsAt(t: number) {
  if (repelAt(t) <= 0) return [];
  const { cols } = SALT_SLAB, ions = saltIonsAt(t);
  const at = (i: number, j: number) => ions[j * cols + i].pos;
  const out: { a: V3; b: V3; ion: Ion }[] = [];
  for (let i = 0; i + 1 < cols; i++) out.push({ a: at(i + 1, SLIP - 1), b: at(i, SLIP), ion: ionAt(i + 1, SLIP - 1) });
  return out;
}

// ================= camera =================
const FOV = 30, DIST = 12.5, MICRO_DIST = 80, LOOK_Y = 0.95;   // the bench sits below the question, mid-page
/** Frame 0: close on the crystal, the hammer face rushing down at it. */
const CLOSE = [3.3, SALT.x, 1.15, 0.2];                         // close: the crystal a third of the width, the hammer below the question
export const CAMERA = {
  cuX: BAR.x,
  macro: {
    start: CLOSE,                                                        // [zoom, look-at x, look-at y, orbit (rad)]
    keys: [
      { t: 0, dur: 0.55, to: [CLOSE[0], SALT.x, CLOSE[2] + 0.02, 0.14] },// creep round the crystal as the hammer falls (silent)
      { t: MACRO_CUTS[0], dur: 0, to: [2.3, BAR.x, BAR_TOP - 0.12, -0.12] },  // cut to the copper, its bar still nearly straight
      { t: MACRO_CUTS[0] + 0.03, dur: 0.75, to: [2.3, BAR.x, BAR_TOP - 0.22, 0.12] }, // round it as it bends (no zoom: silent)
      { t: MACRO_CUTS[1], dur: 0, to: [3.0, SALT.x, 1.08, 0.3] },            // cut back to the crystal, cracking
      { t: MACRO_CUTS[1] + 0.03, dur: 1.62, to: [3.5, SALT.x, 1.02, -0.15] }, // push in, circling it, as the cracks race (silent)
      { t: 3.9, dur: 0.6, to: [1.2, -0.2, LOOK_Y, 0.06] },              // held close on the debris, then the two-shot
      { t: T_SECOND, dur: CUT1 - T_SECOND, to: [3.0, BAR.x, BAR_TOP - 0.12, 0] }, // the dive into the bend
      { t: CUT3, dur: 0, to: [0.98, 0.05, LOOK_Y, 0.2] },                // the cut back out: both results, the scattered pieces in frame
      { t: CUT3 + 0.05, dur: REW0 - CUT3 - 0.1, to: [1.08, -0.05, LOOK_Y, -0.12] },   // a clear drift round both (no still hold)
      { t: REW0, dur: DURATION - REW0, to: CLOSE },                      // the rewind takes it back to frame 0
    ] as Key[],
  },
  copper: {
    start: [2.4, 0, 0, 0],
    keys: [
      { t: CUT1, dur: 0.65, to: [1.1, 0, 0, 0.3] },                      // out of the bend: the slab, at an angle
      { t: T_SLIDE_CU, dur: 0.7, to: [1.14, CU_SLAB.gap / 2, 0, 0.42] }, // follow the slide, still turning
    ] as Key[],
  },
  salt: {
    start: [1.0, 0, 0, -0.12],
    keys: [
      { t: CUT2, dur: 0.6, to: [1.02, 0, 0, -0.06] },
      { t: T_SLIDE_NACL, dur: SLIDE, to: [1.02, SALT_SLAB.gap / 2, 0, -0.04] },
      { t: T_LIKE, dur: 0.5, to: [1.3, SALT_SLAB.gap / 2, 0, -0.02] },  // punch in on + over + before it splits
      { t: T_SPLIT, dur: 0.8, to: [0.78, SALT_SLAB.gap / 2, 3.0, 0.04] }, // pull back as it splits
      { t: T_SPLIT + 0.85, dur: CUT3 - T_SPLIT - 0.9, to: [0.84, SALT_SLAB.gap / 2, 3.4, 0.12] },   // drift on (no still hold)
    ] as Key[],
  },
};
export function cameraAt(t: number) {
  const scene = sceneAt(t);
  if (scene === 'macro') {
    const [zoom, lx, ly, orbit] = tween(t, CAMERA.macro.start, CAMERA.macro.keys), [sx, sy] = shakeAt(t);
    const c = orbitCamera(zoom, [lx + sx, ly + sy], orbit, DIST, FOV, FULL);
    return c;
  }
  const cam = scene === 'copper' ? CAMERA.copper : CAMERA.salt, [zoom, lx, ly, orbit] = tween(t, cam.start, cam.keys);
  const k = scene === 'salt' && t >= T_SPLIT ? 0.5 * Math.exp(-(t - T_SPLIT) / 0.15) : 0;   // a shake as the layers fly apart
  return orbitCamera(zoom, [lx + k * Math.sin(61 * t), ly + 0.6 * k * Math.cos(53 * t)], orbit, MICRO_DIST, FOV, FULL);
}
/** The picture's outline (F35: it should fill the frame). */
export function heroAt(t: number): V3[] {
  const scene = sceneAt(t);
  if (scene === 'macro') return [[BAR.x - BAR.half, BAR.base, 0], [BAR.x + BAR.half, BAR.base, 0], [SALT.x - SALT_BLOCK.hw, 0, SALT_BLOCK.hd], [SALT.x + SALT_BLOCK.hw, 0, SALT_BLOCK.hd], [SALT.x, SALT_TOP, 0]];
  if (scene === 'copper') return copperCoresAt(t).filter((_, n) => n < CU_SLAB.cols * CU_SLAB.rows).map(p => [p[0] + Math.sign(p[0]) * CU_SLAB.r, p[1], 0] as V3);
  return saltIonsAt(t).filter((_, n) => n < SALT_SLAB.cols * SALT_SLAB.rows).map(x => [x.pos[0] + Math.sign(x.pos[0]) * PM[x.ion] / U, x.pos[1], 0] as V3);
}

// ================= words: every text on screen, beside what it names (F35) =================
export const CAPTIONS: Caption[] = [
  { t0: 3.5, t1: T_SECOND, text: 'Salt shatters. Copper just bends.' },
  { t0: CUT1 + 0.3, t1: SECOND_ANSWER_AT, text: 'Copper: + ions in an electron sea' },
  { t0: SECOND_ANSWER_AT, t1: CUT2, text: 'Layers slide. The sea still holds.' },
  { t0: CUT2 + 0.2, t1: T_LIKE, text: 'Salt: + and − take turns' },
  { t0: T_LIKE, t1: T_SPLIT, text: 'Slide one step: + meets +' },
  { t0: T_SPLIT, t1: CUT3, text: 'Like charges push. It splits.' },
  { t0: CUT3 + 0.2, t1: REW0, text: 'Metals bend. Salts shatter.' },
];
export type Kind = 'label' | 'header' | 'chip' | 'tag' | 'nudge' | 'line' | 'caption' | 'setTag' | 'answer';
export type Text = { name: string; kind: Kind; text: string; size: number; x: number; y: number; alpha: number; box: Box };
const HEAD = { size: 56, chipW: 240, chipH: 76, gap: 22 };
const CAP_Y = 300, LINE_Y = 128, TAG_Y = 186;
const fade = (t: number, t0: number, t1: number, d = 0.2) => clamp01((t - t0) / d) * clamp01((t1 - t) / d);
/** How big the question is: big on frame 0, one line from T_SHRINK, big again by the end of the rewind (the loop). */
export const bigAt = (t: number) => (t < REW0 ? 1 - prog(t, T_SHRINK, 0.15) : prog(t, DURATION - 0.6, 0.5));
// the tag drops back to its frame-0 place before the big question returns over it
const upAt = (t: number) => (t < REW0 ? prog(t, T_SHRINK + 0.15, 0.3) : 1 - prog(t, REW0 + 0.3, 0.5));
/** The set-ups' tags: only on the wide shots (a close-up has one set-up), out before the rewind. */
const tagsAt = (t: number) => Math.max(...WIDE.map(([a, b]) => clamp01((t - a) / 0.25) * (b === REW0 ? 1 - prog(t, REW0, 0.4) : clamp01((b - t) / 0.2))));

/** Every text on screen at t, with its box (tests: inside Instagram's safe area, no two colliding). */
export function textsAt(t: number): Text[] {
  const out: Text[] = [], add = (x: Omit<Text, 'box'> & { pad?: number; box?: Box; pinned?: boolean }) => {
    const box = x.box ?? textBox(x.text, x.size, x.x, x.y, x.pad ?? 0);
    if (x.alpha <= 0.01 || (x.pinned && !inSafeArea(box))) return;
    const { pad: _pad, pinned: _pinned, ...text } = x;
    out.push({ ...text, box });
  };
  const big = bigAt(t);
  add({ name: 'label', kind: 'label', text: LABEL, size: 34, x: 540, y: 116, alpha: big });
  HEADER.forEach((h, i) => add({ name: `header ${i + 1}`, kind: 'header', text: h, size: HEAD.size, x: 540, y: 184 + i * HEAD.size * 1.32, alpha: big }));
  const x0 = 540 - (3 * HEAD.chipW + 2 * HEAD.gap) / 2;
  OPTIONS.forEach((o, i) => add({ name: `chip ${'ABC'[i]}`, kind: 'chip', text: o, size: 42, x: x0 + i * (HEAD.chipW + HEAD.gap) + HEAD.chipW / 2, y: 350, alpha: big,
    box: { x: x0 + i * (HEAD.chipW + HEAD.gap), y: 312, w: HEAD.chipW, h: HEAD.chipH } }));
  add({ name: 'nudge', kind: 'nudge', text: 'comment your guess 👇', size: 32, x: 540, y: 480, alpha: big });
  if (t < REW0) {
    const line = prog(t, T_SHRINK + 0.15, 0.15);
    add({ name: 'question line', kind: 'line', text: t < T_SECOND ? SHORT_Q : SECOND_Q, size: 44, x: 540, y: LINE_Y,
      alpha: t < T_SECOND ? line * (1 - prog(t, T_SECOND - 0.25, 0.25)) : prog(t, T_SECOND, 0.25) * (1 - prog(t, CUT3 - 0.3, 0.3)) });
  }
  add({ name: 'tag', kind: 'tag', text: BRAND, size: 30, x: 540, y: 432 + (TAG_Y - 432) * upAt(t), alpha: 1 });
  // the set-ups' names, under each block; the salt's lights as the answer
  const vis = tagsAt(t);
  if (vis > 0.01 && sceneAt(t) === 'macro') {
    const cam = cameraAt(t);
    for (const [k, x] of [['copper', BAR.x], ['salt', SALT.x]] as const) {
      const foot = project([x, 0, SALT_BLOCK.hd + 0.05], cam, FULL), answer = k === 'salt' && t >= ANSWER_AT;
      const size = answer ? 52 : 42, text = answer ? OPTIONS[ANSWER] : k, half = textBox(text, size, 0, 0, 20).w / 2;
      // kept clear of Instagram's buttons (the bigger answer pill reached into them)
      add({ name: `tag ${k}`, kind: answer ? 'answer' : 'setTag', text, size, x: Math.min(foot.x, SAFE.right - 10 - half), y: foot.y + 56, pad: 20, alpha: vis, pinned: true });
    }
  }
  const cap = CAPTIONS.find(c => t >= c.t0 && t < c.t1);
  if (cap) add({ name: 'caption', kind: 'caption', text: cap.text, size: 52, x: 540, y: CAP_Y, pad: 28, alpha: fade(t, cap.t0, cap.t1) });
  return out;
}

// ================= colours (F24) =================
const R = REAL.lab, V = VIVID.lab;
export const COLOURS = {
  copper: R.copper.fill, copperEdge: R.copper.edge, steel: R.steel.fill, steelEdge: R.steel.edge, wood: R.wood.fill,
  salt: R.salt.fill, saltEdge: R.salt.edge, na: V.violet, cl: V.green, electron: V.cyan, push: V.yellow,
  ink: LAB.ink, muted: LAB.muted, amber: LAB.amber, board: LAB.board, floor: '#0c1016',
} as const;

// ================= sound (F14–F16) =================
export const MUSIC_HITS = [ANSWER_AT, T_SECOND];
/** The first landings of the pieces, at most one every 0.06 s (a tap each). */
const landTaps: Hit[] = SIM.landings.sort((a, b) => a - b).filter((t, i, a) => i === 0 || t - a[i - 1] >= 0.06).slice(0, 10)
  .map((t, i) => ({ kind: 'tap' as const, t, gain: 0.32, pitch: 1.6 + 0.25 * ((i * 37) % 5) }));
const cutKey = CAMERA.macro.keys.findIndex(k => k.dur === 0 && k.t >= CUT3);
/** The music's level (the panel's Sound must-fixes): no swell over the cracks, a riser into the burst, a hole for the burst
 *  to play alone, a lift for the second question, a dip at each cut and under the split, quiet at the loop seam. */
const LEVEL: [number, number][] = [
  [0, 2], [1.0, 1.4], [2.0, 1], [2.3, 0.45], [3.05, 0.85], [3.12, 0.4], [3.42, 0.4], [3.5, 0.75], [3.9, 1], [T_SECOND - 0.1, 1],
  [T_SECOND + 0.05, 1.2], [T_SECOND + 0.6, 1],
  ...[[CUT1 + 0.3, 0.8], [T_SLIDE_CU - 0.1, 0.8], [T_SLIDE_CU, 0.55], [T_SLIDE_CU + 0.7, 0.55], [T_SLIDE_CU + 0.9, 0.8], [CUT2 - 0.2, 0.8],
    [T_SLIDE_NACL, 0.55], [T_LIKE + 0.7, 0.55]] as [number, number][],
  ...[CUT1, CUT2, CUT3].flatMap(c => [[c - 0.12, 1], [c, 0.5], [c + 0.2, 1]] as [number, number][]),
  [T_SPLIT - 0.05, 1], [T_SPLIT, 0.45], [T_SPLIT + 0.6, 0.45], [T_SPLIT + 0.9, 1], [DURATION - 1, 1], [DURATION, 0.15],
].sort((a, b) => a[0] - b[0]) as [number, number][];
export const musicLevel = (t: number) => {
  const i = LEVEL.findIndex(([t1]) => t1 >= t);
  if (i <= 0) return LEVEL[Math.max(0, i)][1];
  const [t0, v0] = LEVEL[i - 1], [t1, v1] = LEVEL[i];
  return t1 === t0 ? v1 : v0 + (v1 - v0) * (t - t0) / (t1 - t0);
};
/** The camera's own whooshes, minus the answer's pull-back (the accent marks it) and the dive's (late: it is placed by hand). */
const camWhooshes = whooshesFor(CAMERA.macro.start, CAMERA.macro.keys.slice(0, cutKey))
  .filter(h => h.t < ANSWER_AT - 0.1 && !MACRO_CUTS.some(c => Math.abs(h.t + 0.45 - c) < 0.01));   // a hard cut gets a snap, not a whoosh
const FX = 0.55;                                                            // effects 5–10 dB under the music (F16)
export const SOUND: Score = {
  duration: DURATION,
  hits: ([
    { kind: 'crack', t: T_HIT, gain: 0.6 }, { kind: 'boom', t: T_HIT + 0.02, gain: 0.5 }, { kind: 'thunk', t: T_HIT + 0.01, gain: 0.45 },   // the hit, close on the salt
    ...MACRO_CUTS.map(t => ({ kind: 'snap' as const, t, gain: 0.5 })),
    { kind: 'whump', t: T_BEND1, gain: 0.5 }, { kind: 'clang', t: T_BEND1, gain: 0.45, pitch: 0.8 },                              // the bar rings
    { kind: 'crack', t: T_CRACK1, gain: 0.6 }, { kind: 'crack', t: T_CRACK1 + 0.15, gain: 0.45 },
    { kind: 'crack', t: T_CRACK2, gain: 0.6 }, { kind: 'crack', t: T_CRACK2 + 0.1, gain: 0.45 }, { kind: 'snap', t: T_CRACK2 + 0.2, gain: 0.5 },
    { kind: 'boom', t: T_BURST, gain: 0.8 }, { kind: 'crack', t: T_BURST, gain: 0.6 },
    { kind: 'thunk', t: T_BURST + T_DROP, gain: 0.35 }, { kind: 'whoosh-in', t: T_SECOND + 0.1 - 0.45, gain: 0.7 }, { kind: 'snap', t: T_SECOND, gain: 0.3 },
    ...landTaps,
    { kind: 'snap', t: CUT1, gain: 0.35 }, { kind: 'snap', t: CUT2, gain: 0.35 }, { kind: 'snap', t: CUT3, gain: 0.35 },
    ...[0, 0.25, 0.5].map(d => ({ kind: 'thunk' as const, t: T_LIKE + d, gain: 0.4 })),
    { kind: 'crack', t: T_SPLIT, gain: 0.45 }, { kind: 'boom', t: T_SPLIT + 0.03, gain: 0.45 },
    { kind: 'shimmer', t: REW0, gain: 0.3 },
    ...camWhooshes,
    ...whooshesFor(CAMERA.copper.start, CAMERA.copper.keys),
    ...whooshesFor(CAMERA.salt.start, CAMERA.salt.keys),
  ] as Hit[]).map(h => ({ ...h, gain: h.gain * FX })).sort((a, b) => a.t - b.t),
  beds: [
    { kind: 'scrape', t0: T_SLIDE_CU, t1: T_SLIDE_CU + 0.7, level: () => 0.25 },
    { kind: 'scrape', t0: T_SLIDE_NACL, t1: T_SLIDE_NACL + SLIDE, level: () => 0.3 },
  ],
  music: musicLevel,
};
