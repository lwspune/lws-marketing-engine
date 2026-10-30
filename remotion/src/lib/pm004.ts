// @pyqvault_ · Maths, visualised #4 (2026-10-28, framework v1.35): the chain rule as a gear train. Idea M10, the first F40
// imitation: @learnara.math's "Chain Rule visualized!" (86k views, 7.1× their typical reel), copied shot for shot from the
// study copy (study/reels/DerDcmpqINc.mp4, never posted): the same three gears (x drives u, u drives y), the same beats at
// the same times, the same wrong guess (add the rates: 3 + 2 = 5?) broken by the count (6). Ours: the soft studio in 3D
// (F36), every word, the V mascot, the tag (F20), music and effects made in code, and a loop (F27) where they have an end card.
//
// The maths (F10): x has 36 teeth, u 18, y 6, so u turns 2 times per turn of x (du/dx = 2) and y 3 times per turn of u
// (dy/du = 3); one turn of x turns y 6 times: dy/dx = dy/du · du/dx = 3 × 2 = 6. Turns are counted, not signed angles.
//
// BEAT TABLE (theirs → ours; runbook step 1)
// | time    | picture                                                     | words (ours)                               |
// | 0–3.0 s | gears turning, slowing to a stop at the cut; V over x       | tag, series label                          |
// | 0.8 s   |                                                             | Chain Rule / Visualised pops in            |
// | 3.0 s   | the lesson: headline, the answer card, the gears below      | How fast does y turn? · dy/dx = ?          |
// | 4–5.7 s | x turns once: u's counter 0 → 2                             | Give x one full turn                       |
// | 6.0 s   | du/dx = 2 tag on u                                          | u turns twice as fast                      |
// | 7.2–8.9 | u turns once: y's counter 0 → 3                             | Now give u one turn                        |
// | 9.2 s   | dy/du = 3 tag on y                                          | y turns 3× as fast as u                    |
// | 11.0 s  | the card stamps 3 + 2 = 5? (thunk); V thinks                | Just add them: 5?                          |
// | 13–16 s | x turns once: y's counter 0 → 6, the 6th with the break     | Check: one turn of x                       |
// | 16.0 s  | 3 + 2 = 5? shatters, 6 lands big (crack, music hit, dip); V laughs | It's 6, not 5!                      |
// | 18–22 s | x turns once in two halves: y counts 3 per u turn           | Every u turn: 3 of y · ? + ? → 3 + ? → 3 + 3 |
// | 23.0 s  | 3 × 2 = 6, a tick (shimmer)                                 | So multiply: 3 × 2 = 6                     |
// | 25.0 s  | dy/du × du/dx = 6                                           | This is the chain rule                     |
// | 27–29 s | x turns once: counters 1 · 2 · 6; the chain rule card       | Each link multiplies                       |
// | 29.5 s  |                                                             | Multiply along the chain                   |
// | 31–34 s | the gears speed back up to frame 0's pace; words leave at 32 | (their end card; ours loops), a swell     |
import { clamp01, prog } from './motion.ts';
import type { Hit, Score } from './sfx.ts';
import { orbitCamera, project, type V3 } from './inductionScene.ts';
import { FULL, textBox, type Box } from './layout.ts';

export const SOURCE = { handle: '@learnara.math', url: 'https://www.instagram.com/reel/DerDcmpqINc/', views: 85973, multiple: 7.1, duration: 34.03 } as const;
// When each beat lands in their reel (read from the study copy, one frame a second).
export const SOURCE_BEATS = { title: 1.0, lesson: 3.0, uRate: 6.0, yRate: 9.0, guess: 11.0, check: 13.0, reveal: 16.0, steps: 18.0,
  multiply: 23.0, chainRule: 25.0, everyLink: 27.0, summary: 29.0, end: 32.0 } as const;
export const BEATS: Record<keyof typeof SOURCE_BEATS, number> = { title: 0.8, lesson: 3.0, uRate: 6.0, yRate: 9.2, guess: 11.0, check: 13.0,
  reveal: 16.0, steps: 18.0, multiply: 23.0, chainRule: 25.0, everyLink: 27.0, summary: 29.5, end: 32.0 };

export const DURATION = 34.0, COVER_T = 1.6;
export const LABEL = 'MATHS, VISUALISED  #4';
export const SET = '#f2efe9';                                     // the soft studio (F36), a warm white
export const BRAND = 'PYQ Vault · pyqvault.com';
export const TITLE = ['Chain Rule', 'Visualised'] as const;

// ---- the gears (scene units; the floor at y = 0) ----
export type GearId = 'x' | 'u' | 'y';
export const GEAR_IDS: GearId[] = ['y', 'u', 'x'];                    // left to right, as theirs
const MODULE = 1 / 30, AXLE_Y = 1.3;                                 // pitch radius = teeth × MODULE / 2
export const ADDENDUM = MODULE;                                       // how far a tooth stands out past the pitch circle
type Gear = { teeth: number; r: number; cx: number; cy: number; colour: string; phase: number; dir: 1 | -1; ratio: number };
const pitch = (teeth: number) => (teeth * MODULE) / 2;
const Y_CX = -1.3;
export const GEARS: Record<GearId, Gear> = (() => {
  // twice their teeth, the same ratios: short teeth, so the small gear reads as a gear (Drama, pass 1)
  const y = pitch(12), u = pitch(36), x = pitch(72);
  return {
    // x and u touch at u's right (x's left), u and y at u's left. Even tooth counts: a tooth points at 0 and π on x and y;
    // u is set half a tooth on, so a gap of u faces each of them.
    y: { teeth: 12, r: y, cx: Y_CX, cy: AXLE_Y, colour: '#ea580c', phase: 0, dir: -1, ratio: 6 },
    u: { teeth: 36, r: u, cx: Y_CX + y + u, cy: AXLE_Y, colour: '#047857', phase: Math.PI / 36, dir: 1, ratio: 2 },
    x: { teeth: 72, r: x, cx: Y_CX + y + 2 * u + x, cy: AXLE_Y, colour: '#1d4ed8', phase: 0, dir: -1, ratio: 1 },
  };
})();

// ---- how far x has turned (whole turns); u and y follow ----
const END_SPEED = 0.5;                                                // turns of x a second at frame 0 and at the end (the loop)
// the spin-up for the loop starts at 31 s, before the words leave (Motion, pass 1: 29.5–32 s was still): the speed rises as
// s², half a turn in 3 s, reaching 0.5 turn/s at 34 s
const SPIN_UP = 31.0;
type Seg = { t0: number; t1: number; from: number; to: number };
const SEGS: Seg[] = [
  { t0: 4.0, t1: 5.7, from: 1.0, to: 2.0 },                           // A: x once, count u
  { t0: 7.2, t1: 8.9, from: 2.0, to: 2.5 },                           // B: u once, count y
  { t0: 13.0, t1: 16.0, from: 2.5, to: 3.5 },                         // C: x once, count y: the 6th lands with the break
  { t0: 18.0, t1: 19.6, from: 3.5, to: 4.0 },                         // D1: u's first turn, 3 of y
  { t0: 20.4, t1: 22.0, from: 4.0, to: 4.5 },                         // D2: u's second turn, 3 more
  { t0: 27.0, t1: 29.0, from: 4.5, to: 5.5 },                         // E: x once, every counter
];
export function xTurns(t: number): number {
  if (t <= 1.0) return END_SPEED * t;                                 // frame 0: already turning
  if (t <= BEATS.lesson) { const s = t - 1.0; return 0.5 + END_SPEED * s - 0.125 * s * s; }   // easing to a stop at the cut
  if (t >= SPIN_UP) { const s = Math.min(t, DURATION) - SPIN_UP; return 5.5 + (s * s * s) / 54; }   // back up to frame 0's speed: 6 at the end
  let v = 1.0;
  for (const g of SEGS) if (t >= g.t0) v = g.from + (g.to - g.from) * prog(t, g.t0, g.t1 - g.t0);
  return v;
}
export const turns = (id: GearId, t: number) => GEARS[id].ratio * xTurns(t);
/** The gear's rotation (radians, about its axle, anticlockwise positive). */
export const angle = (id: GearId, t: number) => GEARS[id].phase + GEARS[id].dir * 2 * Math.PI * turns(id, t);

// ---- the counters under the gears: which ones show, counted from the start of their part ----
type Phase = { t0: number; t1: number; base: number; ids: GearId[]; yPerU?: number };
const PHASES: Phase[] = [
  { t0: 3.7, t1: 7.0, base: 1.0, ids: ['u', 'x'] },
  { t0: 7.0, t1: 10.8, base: 2.0, ids: ['y', 'u'] },
  { t0: 12.8, t1: 17.6, base: 2.5, ids: ['y', 'x'] },
  { t0: 17.8, t1: 24.6, base: 3.5, ids: ['y', 'u'], yPerU: 20.4 },   // y starts again at u's second turn (theirs: 20 s)
  { t0: 26.8, t1: BEATS.end, base: 4.5, ids: ['y', 'u', 'x'] },
];
const EPS = 1e-6;
export function countersAt(t: number): { id: GearId; n: number }[] {
  if (t < 0) return [];
  const p = PHASES.find(p => t >= p.t0 && t < p.t1);
  if (!p) return [];
  const done = (id: GearId) => Math.floor(GEARS[id].ratio * (xTurns(t) - p.base) + EPS);
  return p.ids.map(id => ({ id, n: id === 'y' && p.yPerU !== undefined && t >= p.yPerU ? done('y') - 3 : done(id) }));
}
const firstUTurn = SEGS[3].t1, secondUTurn = SEGS[4].t1;
/** 1 on the frame a counter steps up, falling to 0 over 0.3 s (the number bumps: Drama, pass 1). */
export function counterBumpAt(id: GearId, t: number) {
  for (let k = 0; k < 9; k++) {
    const a = t - k / 30, now = countersAt(a).find(c => c.id === id), was = countersAt(a - 1 / 30).find(c => c.id === id);
    if (now && was && now.n === was.n + 1) return 1 - k / 9;
  }
  return 0;
}

// ---- the answer card ----
// a hard cut from the title to the lesson at 3 s, as theirs: no empty frame (Drama, Motion, pass 1) and no overlap (a
// cross-fade stacked the title on the headline)
const LESSON_IN = BEATS.lesson;
export type Card = { text: string; label: string; tone: 'plain' | 'wrong' | 'right'; shatter: number };
export function cardAt(t: number): Card | null {
  if (t < LESSON_IN || t >= BEATS.end + 0.4) return null;
  const c = (text: string, tone: Card['tone'] = 'plain', label = 'dy/dx =', shatter = 0): Card => ({ text, label, tone, shatter });
  if (t < BEATS.guess) return c('?');
  if (t < BEATS.reveal) return c('3 + 2 = 5?', 'wrong');
  if (t < BEATS.steps) return c('6', 'plain', 'dy/dx =', t < BEATS.reveal + 0.7 ? Math.max(0.01, prog(t, BEATS.reveal, 0.7)) : 0);
  if (t < firstUTurn) return c('? + ? = 6');
  if (t < secondUTurn) return c('3 + ? = 6');
  if (t < BEATS.multiply) return c('3 + 3 = 6');
  if (t < BEATS.chainRule) return c('3 × 2 = 6', 'right');
  if (t < BEATS.everyLink) return c('dy/du × du/dx = 6', 'right');
  return c('dy/dx = dy/du · du/dx', 'right', 'CHAIN RULE');
}

// ---- the words at the top (ours; theirs are in the caption kit's shot list) ----
type Headline = { t0: number; title: string; sub: string };
export const HEADLINES: Headline[] = [
  { t0: LESSON_IN, title: 'How fast does y turn?', sub: 'x drives u, u drives y' },
  { t0: 4.0, title: 'Give x one full turn', sub: "and count u's turns" },
  { t0: BEATS.uRate, title: 'u turns twice as fast', sub: '2 turns of u per turn of x' },
  { t0: 7.2, title: 'Now give u one turn', sub: "and count y's turns" },
  { t0: BEATS.yRate, title: 'y turns 3× as fast as u', sub: '3 turns of y per turn of u' },
  { t0: BEATS.guess, title: 'Just add them: 5?', sub: 'is y 5× as fast as x?' },
  { t0: BEATS.check, title: 'Check: one turn of x', sub: "and count y's turns" },
  { t0: BEATS.reveal, title: "It's 6, not 5!", sub: 'y turned 6 times' },
  { t0: BEATS.steps, title: 'Every u turn: 3 of y', sub: 'and u turns twice' },
  { t0: BEATS.multiply, title: 'So multiply: 3 × 2 = 6', sub: 'rates multiply, they never add' },
  { t0: BEATS.chainRule, title: 'This is the chain rule', sub: 'y per u, times u per x' },
  { t0: BEATS.everyLink, title: 'Each link multiplies', sub: '1 turn of x · 2 of u · 6 of y' },
  { t0: BEATS.summary, title: 'Multiply along the chain', sub: 'every rate, link by link' },
];
export function headlineAt(t: number): (Headline & { age: number }) | null {
  if (t < LESSON_IN || t >= BEATS.end + 0.4) return null;
  const h = [...HEADLINES].reverse().find(h => t >= h.t0)!;
  return { ...h, age: t - h.t0 };
}
/** The lesson's words cut in on the title's last frame, and fade out at the end. */
const lessonAlpha = (t: number) => (t >= LESSON_IN ? 1 - prog(t, BEATS.end, 0.4) : 0);
/** The title over the gears: pops in at 0.8 s, gone by the lesson; absent at the end, as on frame 0 (the loop). */
export const titleAt = (t: number) => (t >= BEATS.lesson ? 0 : prog(t, BEATS.title, 0.35));
export const rateTagsAt = (t: number) => {
  const out = 1 - prog(t, BEATS.end, 0.4);
  return { du: prog(t, BEATS.uRate, 0.3) * out, dy: prog(t, BEATS.yRate, 0.3) * out };
};

// ---- camera: still, as theirs, with a slow drift that comes back to where it started (the loop) ----
// framed as theirs: big gears just under the card, x running off the right edge, counters just under the posts
const DIST = 12.8, FOV = 30, LOOK: [number, number] = [0.18, 1.89];
export function cameraAt(t: number) {
  const w = (2 * Math.PI * t) / DURATION;
  return orbitCamera(1 + 0.02 * Math.sin(w), LOOK, 0.05 * Math.sin(w), DIST, FOV, FULL);
}
/** The gear train's outline: each gear's sides and top (for the framing tests). */
export const gearPoints = (_t: number): V3[] => GEAR_IDS.flatMap(id => {
  const g = GEARS[id], R = g.r + ADDENDUM;
  return [[g.cx - R, g.cy, 0], [g.cx + R, g.cy, 0], [g.cx, g.cy + R, 0]] as V3[];
});

// ---- the mascot: PYQ Vault's V, floating over x ----
export type Pose = 'idle' | 'talk' | 'think' | 'laugh';
export function mascotAt(t: number): { pose: Pose; at: V3; bob: number } {
  const x = GEARS.x, at: V3 = [x.cx - 0.35, x.cy + x.r + ADDENDUM + 0.32, 0.2];
  let pose: Pose = 'idle';
  if (t >= BEATS.guess && t < BEATS.reveal) pose = 'think';
  else if ((t >= BEATS.reveal && t < BEATS.steps) || (t >= BEATS.multiply && t < BEATS.chainRule)) pose = 'laugh';
  else { const h = headlineAt(t); if (h && h.age < 0.7) pose = 'talk'; }
  return { pose, at, bob: Math.sin((2 * Math.PI * t * 17) / DURATION) };   // 17 bobs a reel: back in step at the loop
}

// ---- every text on screen at t, as named boxes (F35: inside the safe area, never colliding) ----
export type Kind = 'label' | 'tag' | 'title' | 'headline' | 'sub' | 'card' | 'hub' | 'counter' | 'rate';
export type Text = { name: string; kind: Kind; text: string; size: number; x: number; y: number; alpha: number; box: Box };
export const LAYOUT = { barY: 120, titleY: [340, 500], headY: 250, subY: 322, card: { x: 60, y: 384, w: 960, h: 200 } } as const;
const at = (p: V3, t: number) => project(p, cameraAt(t), FULL);
export function textsAt(t: number): Text[] {
  const out: Text[] = [], add = (x: Omit<Text, 'box'> & { box?: Box }) => { if (x.alpha > 0.01) out.push({ ...x, box: x.box ?? textBox(x.text, x.size, x.x, x.y) }); };
  const left = (text: string, size: number, x0: number, y: number): Box => { const b = textBox(text, size, 0, y); return { ...b, x: x0 }; };
  const right = (text: string, size: number, x1: number, y: number): Box => { const b = textBox(text, size, 0, y); return { ...b, x: x1 - b.w }; };
  add({ name: 'label', kind: 'label', text: LABEL, size: 28, x: 60, y: LAYOUT.barY, alpha: 1, box: left(LABEL, 28, 60, LAYOUT.barY) });
  add({ name: 'tag', kind: 'tag', text: BRAND, size: 28, x: 1020, y: LAYOUT.barY, alpha: 1, box: right(BRAND, 28, 1020, LAYOUT.barY) });
  const ti = titleAt(t);
  TITLE.forEach((w, i) => add({ name: `title ${i + 1}`, kind: 'title', text: w, size: 120, x: 540, y: LAYOUT.titleY[i], alpha: ti }));
  const la = lessonAlpha(t), h = headlineAt(t);
  if (h) {
    const fresh = h.t0 === LESSON_IN ? 1 : clamp01(h.age / 0.2);   // the first one comes with the cut
    add({ name: 'headline', kind: 'headline', text: h.title, size: 64, x: 540, y: LAYOUT.headY, alpha: la * fresh });
    add({ name: 'sub', kind: 'sub', text: h.sub, size: 44, x: 540, y: LAYOUT.subY, alpha: la * fresh });
  }
  const card = cardAt(t);
  if (card) add({ name: 'card', kind: 'card', text: card.text, size: 84, x: 540, y: LAYOUT.card.y + LAYOUT.card.h / 2, alpha: la, box: { ...LAYOUT.card } });
  for (const id of GEAR_IDS) {
    const g = GEARS[id], hub = at([g.cx, g.cy, 0.12], t);
    add({ name: `hub ${id}`, kind: 'hub', text: id, size: id === 'y' ? 34 : 44, x: hub.x, y: hub.y, alpha: 1 });
  }
  for (const c of countersAt(t)) {
    const g = GEARS[c.id], foot = at([g.cx, 0, 0.45], t);
    add({ name: `counter ${c.id}`, kind: 'counter', text: String(c.n), size: 52, x: foot.x, y: foot.y, alpha: la,
      box: { x: foot.x - 46, y: foot.y - 46, w: 92, h: 92 } });             // on the post's foot, as theirs
  }
  const tags = rateTagsAt(t);
  const tag = (name: string, text: string, p: V3, alpha: number) => { const q = at(p, t); add({ name, kind: 'rate', text, size: 34, x: q.x, y: q.y, alpha, box: { x: q.x - 95, y: q.y - 48, w: 190, h: 96 } }); };
  tag('rate du/dx', 'du/dx = 2', [GEARS.u.cx + 0.35, GEARS.u.cy + GEARS.u.r + 0.62, 0.2], tags.du);
  tag('rate dy/du', 'dy/du = 3', [GEARS.y.cx + 0.15, GEARS.y.cy + GEARS.y.r + 0.62, 0.2], tags.dy);
  return out;
}

// ---- sound ----
export const MUSIC_HITS = [BEATS.reveal];                        // one accent: the break is the peak
const PITCH: Record<GearId, number> = { x: 1.0, u: 1.35, y: 1.8 };
/** A click on every counter step, found the way the viewer sees it: frame by frame. One click a frame (two on one frame
 *  stacked into a level jump), none where a bigger hit lands on the step (the snaps, the crack). */
const counterClicks = (): Hit[] => {
  const hits: Hit[] = [], bigger = [firstUTurn, secondUTurn, BEATS.reveal];
  let prev = countersAt(0);
  for (let f = 1; f <= Math.round(DURATION * 30); f++) {
    const t = f / 30, now = countersAt(t);
    const up = now.filter(c => { const p = prev.find(q => q.id === c.id); return p && c.n === p.n + 1; });
    if (up.length && !bigger.some(b => Math.abs(b - t) < 0.15)) {
      const top = up.reduce((a, c) => (PITCH[c.id] > PITCH[a.id] ? c : a));
      hits.push({ kind: 'click', t, gain: 0.62, pitch: PITCH[top.id] + 0.04 * top.n });
    }
    prev = now;
  }
  return hits;
};
const LEVEL: [number, number][] = [
  [0, 1], [BEATS.guess - 0.05, 1], [BEATS.guess, 0.6], [BEATS.guess + 0.3, 1],
  [BEATS.reveal - 0.1, 1], [BEATS.reveal - 0.05, 0.45], [BEATS.reveal + 0.5, 0.45], [BEATS.reveal + 1.0, 1], [DURATION, 1],
];
export const musicLevel = (t: number) => {
  const i = LEVEL.findIndex(([t1]) => t1 >= t);
  if (i <= 0) return LEVEL[Math.max(0, i)][1];
  const [t0, v0] = LEVEL[i - 1], [t1, v1] = LEVEL[i];
  return t1 === t0 ? v1 : v0 + (v1 - v0) * (t - t0) / (t1 - t0);
};
const quiet = new Set([BEATS.guess, BEATS.reveal, BEATS.multiply]);
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    { kind: 'whoosh-in' as const, t: BEATS.title - 0.1, gain: 0.3 },
    ...HEADLINES.filter(h => !quiet.has(h.t0)).map(h => ({ kind: 'tap' as const, t: h.t0, gain: 0.5, pitch: 2.4 })),
    ...counterClicks(),
    { kind: 'thunk' as const, t: BEATS.guess, gain: 0.7 },
    { kind: 'crack' as const, t: BEATS.reveal, gain: 0.95 },
    { kind: 'snap' as const, t: firstUTurn, gain: 0.55 },
    { kind: 'snap' as const, t: secondUTurn, gain: 0.55 },
    { kind: 'shimmer' as const, t: BEATS.multiply, gain: 0.5 },
    { kind: 'shimmer' as const, t: BEATS.everyLink, gain: 0.2 },
    { kind: 'whoosh-out' as const, t: BEATS.end, gain: 0.2 },
    { kind: 'whoosh-in' as const, t: DURATION - 0.55, gain: 0.3 },     // a swell into the loop
  ].sort((a, b) => a.t - b.t),
  beds: [],
  music: musicLevel,
};
