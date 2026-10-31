// @pyqvault_ · Physics, visualised #17 (2026-10-31, framework v1.36): every force on a crate on a slope. Idea P7, an F40
// imitation: @sciencevisualised's "Acting Forces on Object" (1.45M views, 83× their typical reel), copied shot for shot
// from the study copy (study/reels/Dc9MzBgKwJS.mp4, never posted): a crate on a 35° slope with one character per force
// (one pulls it up the slope, one drags it down, one holds it off the slope, one hangs under it), the weight splitting
// into mg sin θ and mg cos θ, then the four equations. Ours: the soft studio in 3D (F36), four characters of our own,
// every word, the tag (F20), music and effects made in code, and a loop (F27). A one-off repeat of Physics #4's topic
// (founder, 2026-10-31: the proof outweighs F21's no-repeat rule).
//
// The maths (F10): weight mg straight down splits into mg sin θ down the slope and mg cos θ into it (at 90°, adding back
// to mg); N balances mg cos θ (no motion off the slope: N − mg cos θ = 0); friction f = μN acts down the slope as the
// crate is pulled up it; along the slope F − f − mg sin θ = ma, with F drawn larger than f + mg sin θ (a > 0).
//
// BEAT TABLE (theirs → ours; read from the study copy every 0.25 s)
// | time      | picture                                                         | words (ours)                     |
// | 0 s       | the whole scene: four characters, four arrows from the crate    | each force named; label, tag     |
// | 0.3–3.0 s | the characters tug                                              | Every force on the crate (pill)  |
// | 1.8 s     | the up-slope pull tugs hard                                     | up the slope (beside F)          |
// | 3.0 s     | names shrink to symbols; F, f and N's arrows go, mg's stays     | F · f · N · Weight mg            |
// | 4.3 s     | mg splits: mg sin θ down the slope, mg cos θ into it, 90° mark  | mg sin θ · mg cos θ · 90°        |
// | 6.3 s     | N grows out of the slope, as long as mg cos θ                   | N = mg cos θ                     |
// | 7.5–8.2 s | the four equations stack at the top, one line at a time         | the equations                    |
// | 9.0 s     | the arrows clear                                                |                                  |
// | 9.3 s     |                                                                 | Save this for your exam.         |
// | 10.0–10.6 | (theirs ends) words go, the four arrows and names come back     | frame 0 again (the loop)         |
import { clamp01, prog } from './motion.ts';
import type { Hit, Score } from './sfx.ts';
import { orbitCamera, project, type V3 } from './inductionScene.ts';
import { FULL, textBox, type Box } from './layout.ts';

export const SOURCE = { handle: '@sciencevisualised', url: 'https://www.instagram.com/reel/Dc9MzBgKwJS/', views: 1_450_000, multiple: 83, duration: 10.15 } as const;
// When each beat lands in their reel (read from the study copy, one frame every 0.25 s).
export const SOURCE_BEATS = { title: 0.3, upSlope: 1.8, simplify: 3.0, split: 4.3, normal: 6.3, eq1: 7.5, eq2: 7.8, eq3: 8.0, eq4: 8.2,
  clear: 9.0, remember: 9.3 } as const;
export const BEATS: Record<keyof typeof SOURCE_BEATS, number> = { ...SOURCE_BEATS };

export const DURATION = 10.6, COVER_T = 8.6;
const LOOP_IN = 10.05;                                              // the words go and frame 0 comes back from here
export const LABEL = 'PHYSICS, VISUALISED  #17';
export const SET = '#f2efe9';                                     // the soft studio (F36), a warm white
export const BRAND = 'PYQ Vault · pyqvault.com';
export const PILL = 'Every force on the crate';
export const CLOSER = 'Save this for your exam.';
export const EQUATIONS = ['F − f − mg sin θ = ma', 'N − mg cos θ = 0', 'N = mg cos θ', 'f = μN'] as const;

// ---- the slope (slope space: the origin on its surface under the crate; the rig sits at RIG in the studio) ----
export const THETA = (35 * Math.PI) / 180;
export const ALONG: V3 = [Math.cos(THETA), Math.sin(THETA), 0];     // up the slope
export const NORMAL: V3 = [-Math.sin(THETA), Math.cos(THETA), 0];   // out of the slope
export const RIG: V3 = [0.2, 1.5, 0];
export const CRATE = 0.95;                                         // the crate's edge
const at = (s: number, n: number, z = 0): V3 => [s * ALONG[0] + n * NORMAL[0], s * ALONG[1] + n * NORMAL[1], z];
const plus = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const times = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const CENTRE = at(0, CRATE / 2);
/** Where the slope meets the floor (slope space): the θ mark sits here, as theirs. */
export const FOOT = at(-RIG[1] / Math.sin(THETA), 0, 0.6);
/** The crate's two lower front-to-back edges, where it meets the slope (slope space). */
export const crateCorners = (): [V3, V3] => [at(-CRATE / 2, 0), at(CRATE / 2, 0)];

// ---- the forces (arrows from the crate's centre; lengths in scene units) ----
export type ForceId = 'F' | 'f' | 'N' | 'mg';
export const FORCE_IDS: ForceId[] = ['F', 'f', 'N', 'mg'];
// `colour` paints the character and the arrow; `ink` is the darker shade its words are set in (≥ 4.5:1 on the set)
export const FORCES: Record<ForceId, { name: string; colour: string; ink: string }> = {
  F: { name: 'Applied force', colour: '#e09a00', ink: '#8a5a00' },
  f: { name: 'Friction', colour: '#c9282c', ink: '#b42318' },
  N: { name: 'Normal', colour: '#1f5bcc', ink: '#1d4ed8' },
  mg: { name: 'Weight', colour: '#118553', ink: '#0f6b46' },   // emerald, not grass: told apart from the red for colour-blind viewers
};
const MG = 1.7, F_LEN = 1.75, f_LEN = 0.55;
export function force(id: ForceId): V3 {
  switch (id) {
    case 'F': return times(ALONG, F_LEN);
    case 'f': return times(ALONG, -f_LEN);
    case 'N': return times(NORMAL, MG * Math.cos(THETA));
    case 'mg': return [0, -MG, 0];
  }
}
export const COMPONENTS = { sin: times(ALONG, -MG * Math.sin(THETA)), cos: times(NORMAL, -MG * Math.cos(THETA)) };

// ---- the characters: one per force (ours: soft round bodies, big eyes; theirs are clay figures) ----
// Theirs stand about twice the crate's height: a body scale K, the ropes high on the crate's faces so they reach the
// pullers at the hip, running along the slope (the pull is along it, as F is).
export const K = 1.0;
const ROPE_N = 0.8;
const HIP_UP = ROPE_N / Math.cos(THETA);                          // straight up from a puller's feet to its rope's height
const FEET_S = { F: 1.95, f: -2.05 } as const, REACH = 0.7;        // feet along the slope; hands reach this far towards the crate
const HANDS_S = { F: FEET_S.F + HIP_UP * Math.sin(THETA) - REACH, f: FEET_S.f + HIP_UP * Math.sin(THETA) + REACH } as const;
export type Character = { feet: V3; hands: V3; lean: number; blink: number; effort: number };
/** A breath that runs a whole number of times through the reel, so the last frame is frame 0 (the loop). */
const cycle = (t: number, n: number, phase = 0) => Math.sin((2 * Math.PI * n * t) / DURATION + phase);
/** The hard tug on the up-slope pull at 1.8 s: 0 → 1 → 0 over 0.8 s. */
export const tugAt = (t: number) => clamp01(Math.sin(Math.PI * clamp01((t - BEATS.upSlope) / 0.8)));
export function characterAt(id: ForceId, t: number): Character {
  const blink = Math.max(0, 1 - Math.abs(((t * 0.37 + FORCE_IDS.indexOf(id) * 0.29) % 1) - 0.5) * 40);   // a blink every ~2.7 s
  switch (id) {
    case 'F': return { feet: at(FEET_S.F, 0), hands: at(HANDS_S.F, ROPE_N), lean: 0.3 + 0.04 * cycle(t, 6) + 0.1 * tugAt(t), blink, effort: 0.6 + 0.4 * tugAt(t) };
    case 'f': return { feet: at(FEET_S.f, 0), hands: at(HANDS_S.f, ROPE_N), lean: -0.3 + 0.04 * cycle(t, 5, 1), blink, effort: 0.8 };
    // N stands behind the crate, its head over the crate's upper-left corner, hands on the crate's top (as theirs)
    case 'N': return { feet: at(-1.45, 0, -0.5), hands: at(-0.47, CRATE - 0.02, -0.25), lean: 0.12 + 0.03 * cycle(t, 4, 2), blink, effort: 0.3 };
    case 'mg': {
      const hands = plus(CENTRE, [0, -0.42, 1.25]);                 // in front of the ramp's face (z 0.9), as theirs
      return { feet: plus(hands, [0.03 * cycle(t, 3), -1.5 * K, 0]), hands, lean: 0.02 * cycle(t, 3), blink, effort: 0.5 };
    }
  }
}
export function ropeAt(id: 'F' | 'f', _t: number) {
  const face = id === 'F' ? CRATE / 2 : -CRATE / 2;
  return { from: at(face, ROPE_N), to: at(HANDS_S[id], ROPE_N) };
}

// ---- the arrows (drawn flat over the scene from projected points) ----
export type Arrow = { name: string; from: V3; to: V3; colour: string; alpha: number; grow: number; dashed?: boolean };
const back = (t: number) => prog(t, LOOP_IN, 0.4);                // frame 0's things coming back for the loop
const cleared = (t: number) => 1 - prog(t, BEATS.clear, 0.3);
export function arrowsAt(t: number): Arrow[] {
  const out: Arrow[] = [], a = (name: string, v: V3, colour: string, alpha: number, grow = 1, from = CENTRE, dashed = false) => {
    if (alpha > 0.001) out.push({ name, from, to: plus(from, v), colour, alpha: clamp01(alpha), grow: clamp01(grow), dashed });
  };
  const first = (t: number) => Math.max(1 - prog(t, BEATS.simplify, 0.3), back(t));   // F, f, N on frame 0, gone at 3 s
  a('F', force('F'), FORCES.F.colour, first(t));
  a('f', force('f'), FORCES.f.colour, first(t));
  const n = Math.max(first(t), Math.min(prog(t, BEATS.normal, 0.5), cleared(t)));
  a('N', force('N'), FORCES.N.colour, n, t < BEATS.simplify || t >= LOOP_IN ? 1 : prog(t, BEATS.normal, 0.5));
  a('mg', force('mg'), FORCES.mg.colour, Math.max(t < BEATS.clear ? 1 : cleared(t), back(t)));
  const split = Math.min(prog(t, BEATS.split, 0.5), cleared(t)), grow = prog(t, BEATS.split, 0.5);
  a('mg sin', COMPONENTS.sin, FORCES.f.colour, split, grow);
  a('mg cos', COMPONENTS.cos, FORCES.mg.colour, split, grow);
  // the dashed sides of the rectangle: from each component's tip to mg's tip
  const tip = plus(CENTRE, force('mg')), guides = Math.min(prog(t, BEATS.split + 0.3, 0.4), cleared(t));
  a('guide sin', [tip[0] - (CENTRE[0] + COMPONENTS.sin[0]), tip[1] - (CENTRE[1] + COMPONENTS.sin[1]), 0], '#8a8f9c', guides * 0.8, 1, plus(CENTRE, COMPONENTS.sin), true);
  a('guide cos', [tip[0] - (CENTRE[0] + COMPONENTS.cos[0]), tip[1] - (CENTRE[1] + COMPONENTS.cos[1]), 0], '#8a8f9c', guides * 0.8, 1, plus(CENTRE, COMPONENTS.cos), true);
  return out;
}
/** The 90° mark where the two components meet, at the crate's centre. */
export const rightAngleAt = (t: number) => Math.min(prog(t, BEATS.split + 0.3, 0.4), cleared(t));

// ---- camera: still, as theirs, with a slow drift that comes back to where it started (the loop) ----
const DIST = 14.8, FOV = 30, LOOK: [number, number] = [0.36, 1.85];
export function cameraAt(t: number) {
  const w = (2 * Math.PI * t) / DURATION;
  return orbitCamera(1 + 0.012 * Math.sin(w), LOOK, 0.03 * Math.sin(w), DIST, FOV, FULL);
}
/** A slope-space point on screen. */
export const screen = (p: V3, t: number) => project(plus(p, RIG), cameraAt(t), FULL);

// ---- every text on screen at t, as named boxes (F35: inside the safe area, never colliding) ----
export type Kind = 'label' | 'tag' | 'pill' | 'name' | 'symbol' | 'note' | 'part' | 'equation' | 'closer';
export type Text = { name: string; kind: Kind; text: string; size: number; x: number; y: number; alpha: number; colour: string; box: Box };
export const LAYOUT = { barY: 120, pillY: 236, eqY: [240, 322, 404, 486], closerY: 1552 } as const;
export function textsAt(t: number): Text[] {
  const out: Text[] = [];
  const add = (x: Omit<Text, 'box'> & { box?: Box }) => { if (x.alpha > 0.01) out.push({ ...x, alpha: clamp01(x.alpha), box: x.box ?? textBox(x.text, x.size, x.x, x.y) }); };
  const left = (text: string, size: number, x0: number, y: number): Box => ({ ...textBox(text, size, 0, y), x: x0 });
  const right = (text: string, size: number, x1: number, y: number): Box => { const b = textBox(text, size, 0, y); return { ...b, x: x1 - b.w }; };
  const ink = '#2b3242';
  add({ name: 'label', kind: 'label', text: LABEL, size: 28, x: 60, y: LAYOUT.barY, alpha: 1, colour: '#5b6475', box: left(LABEL, 28, 60, LAYOUT.barY) });
  add({ name: 'tag', kind: 'tag', text: BRAND, size: 28, x: 1020, y: LAYOUT.barY, alpha: 1, colour: '#5b6475', box: right(BRAND, 28, 1020, LAYOUT.barY) });
  add({ name: 'pill', kind: 'pill', text: PILL, size: 40, x: 540, y: LAYOUT.pillY, alpha: Math.min(prog(t, BEATS.title, 0.25), 1 - prog(t, BEATS.simplify, 0.3)), colour: '#ffffff',
    box: textBox(PILL, 40, 540, LAYOUT.pillY, 22) });

  // the long names on frame 0 (beside each force's tip), short symbols beside the characters from 3 s
  const names = Math.max(1 - prog(t, BEATS.simplify, 0.3), back(t));
  // symbols come in once the names have gone, and leave before they come back (no cross-fade on top of each other)
  const symbols = Math.min(prog(t, BEATS.simplify + 0.3, 0.25), 1 - prog(t, LOOP_IN - 0.3, 0.25));
  const tipOf = (id: ForceId, dx: number, dy: number) => { const p = screen(plus(CENTRE, force(id)), t); return { x: p.x + dx, y: p.y + dy }; };
  const name = (id: ForceId, text: string, side: 'left' | 'right', dx: number, dy: number, alpha: number) => {
    const p = tipOf(id, dx, dy), size = 38;
    add({ name: `name ${id}`, kind: 'name', text, size, x: p.x, y: p.y, alpha, colour: FORCES[id].ink,
      box: side === 'left' ? right(text, size, p.x, p.y) : left(text, size, p.x, p.y) });
  };
  name('F', 'Applied force F', 'right', -150, -64, names);
  name('f', 'Friction f', 'left', -10, -52, names);
  name('N', 'Normal N', 'left', -20, -40, names);
  // the weight keeps its name through 3 s (as theirs) and gives it up when it splits
  name('mg', 'Weight mg', 'right', 34, -10, Math.max(Math.min(1 - prog(t, BEATS.split, 0.3), t < BEATS.clear ? 1 : 0), back(t)));
  const up = Math.min(prog(t, BEATS.upSlope, 0.3), 1 - prog(t, BEATS.simplify, 0.3));
  { const p = tipOf('F', -150, 0); add({ name: 'note up', kind: 'note', text: 'up the slope', size: 30, x: p.x, y: p.y, alpha: up, colour: FORCES.F.ink, box: right('up the slope', 30, p.x, p.y) }); }
  const sym = (id: ForceId, text: string, p: V3, dx: number, dy: number, alpha = symbols) => {
    const q = screen(p, t); add({ name: `symbol ${id}`, kind: 'symbol', text, size: 52, x: q.x + dx, y: q.y + dy, alpha, colour: FORCES[id].ink });
  };
  sym('F', 'F', characterAt('F', t).feet, 10, -300);
  sym('f', 'f', characterAt('f', t).feet, -60, -300);
  sym('N', 'N', characterAt('N', t).feet, -120, -250, Math.min(symbols, 1 - prog(t, BEATS.normal + 0.1, 0.2)));   // N = mg cos θ names it from 6.3 s

  // the split: each part named beside its tip; the 90° mark; N = mg cos θ beside N's tip
  const parts = Math.min(prog(t, BEATS.split + 0.2, 0.3), 1 - prog(t, BEATS.clear, 0.3));
  { const p = screen(plus(CENTRE, COMPONENTS.sin), t); add({ name: 'part sin', kind: 'part', text: 'mg sin θ', size: 40, x: p.x, y: p.y + 118, alpha: parts, colour: FORCES.f.ink, box: left('mg sin θ', 40, p.x + 6, p.y + 118) });  } // on the ramp, clear of the red arm
  { const p = screen(plus(CENTRE, COMPONENTS.cos), t); add({ name: 'part cos', kind: 'part', text: 'mg cos θ', size: 40, x: p.x, y: p.y + 34, alpha: parts, colour: FORCES.mg.ink, box: left('mg cos θ', 40, p.x + 26, p.y + 34) }); }
  const nTag = Math.min(prog(t, BEATS.normal + 0.3, 0.3), 1 - prog(t, BEATS.clear, 0.3));
  { const p = screen(plus(CENTRE, force('N')), t), w = textBox('N = mg cos θ', 40, 0, 0).w, x0 = Math.max(24, p.x - w / 2);   // above N's tip, inside the frame
    add({ name: 'part N', kind: 'part', text: 'N = mg cos θ', size: 40, x: x0 + w / 2, y: p.y - 46, alpha: nTag, colour: FORCES.N.ink, box: left('N = mg cos θ', 40, x0, p.y - 46) }); }

  { const p = screen(FOOT, t); add({ name: 'theta', kind: 'part', text: 'θ', size: 44, x: p.x + 112, y: p.y - 30, alpha: 1, colour: '#5b6475', box: textBox('θ', 44, p.x + 112, p.y - 30) }); }

  // the equations stack at the top, one line at a time (theirs: 7.5, 7.8, 8.0, 8.2 s); gone for the loop
  const keys = ['eq1', 'eq2', 'eq3', 'eq4'] as const, gone = 1 - prog(t, LOOP_IN, 0.3);
  EQUATIONS.forEach((e, i) => add({ name: `equation ${i + 1}`, kind: 'equation', text: e, size: 60, x: 540, y: LAYOUT.eqY[i],
    alpha: Math.min(prog(t, BEATS[keys[i]], 0.15), gone), colour: ink }));
  add({ name: 'closer', kind: 'closer', text: CLOSER, size: 52, x: 540, y: LAYOUT.closerY, alpha: Math.min(prog(t, BEATS.remember, 0.2), gone), colour: ink });
  return out;
}

// ---- sound ----
export const MUSIC_HITS = [BEATS.split];
export const SOUND: Score = {
  duration: DURATION,
  hits: ([
    { kind: 'whoosh-in', t: BEATS.title - 0.1, gain: 0.25 },
    { kind: 'thunk', t: BEATS.upSlope + 0.35, gain: 0.55 },        // the hard tug lands
    { kind: 'whoosh-out', t: BEATS.simplify, gain: 0.2 },
    { kind: 'snap', t: BEATS.split, gain: 0.6 },
    { kind: 'snap', t: BEATS.normal, gain: 0.55 },
    { kind: 'tap', t: BEATS.eq1, gain: 0.5, pitch: 2.0 },
    { kind: 'tap', t: BEATS.eq2, gain: 0.5, pitch: 2.2 },
    { kind: 'tap', t: BEATS.eq3, gain: 0.5, pitch: 2.4 },
    { kind: 'tap', t: BEATS.eq4, gain: 0.5, pitch: 2.7 },
    { kind: 'whoosh-out', t: BEATS.clear, gain: 0.2 },
    { kind: 'shimmer', t: BEATS.remember, gain: 0.4 },
    { kind: 'whoosh-in', t: DURATION - 0.55, gain: 0.25 },          // a swell into the loop
  ] as Hit[]).sort((a, b) => a.t - b.t),
  beds: [],
  music: () => 1,
};
