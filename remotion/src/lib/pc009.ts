// @pyqvault_ · Chemistry, visualised #9 (2026-10-23, framework v1.27): split water with one battery. Which tube fills
// first? Hydrogen, twice as fast. Idea C8 ("Split water", our own), Hook queue row 2: Race · Split apart. First L62 test:
// a big running count that is the answer itself and keeps running past it, posted silent (so the voice, L43, can't take
// the credit). White board (L22: dark leads 13–10 in reels made), synthwave (F13/L34: a race; fewer reels than drive).
//
// The chemistry (F10): 2 H₂O → 2 H₂ + O₂ (water with a little acid, platinum electrodes; hydrogen at the − electrode,
// oxygen at the +). Every two water molecules give two H₂ and one O₂, and at the same temperature and pressure equal
// numbers of gas molecules take equal space (Avogadro), so the hydrogen tube collects exactly twice the volume: 2 : 1 at
// every moment. The counters show that volume in mL (2 mL/s and 1 mL/s), like a real voltameter's scale; the drawn
// molecules are a model, labelled "zoomed ×10⁸" whenever one is shown big (a water molecule is ~0.28 nm; shown ~2.5 cm).
//
// BEAT TABLE (runbook step 1)
// | time           | what moves                                                         | caption                     | keep in frame       | colours                      |
// | 0–2.4 s HOOK   | Race · Split apart: one water molecule fills the band, breathing;  | Two tubes. Which fills      | the molecule, then  | O red, H blue (VIVID);       |
// |                | at 0.5 s it bursts (crack): both H fly to the left tube, the O to  | first? + A/B/C + tag        | both tubes, beaker, | water, glass, steel (REAL)   |
// |                | the right, shrinking as the camera pulls back to two tubes already |                             | battery             |                              |
// |                | bubbling, the left visibly faster; the counts tick (a tap each mL) |                             |                     |                              |
// | 2.6–6.1 s      | the race: bubbles stream, gas columns grow, counts and the graph   | Battery on: water splits ·  | tubes, counts       | H₂ blue, O₂ red              |
// |                | climb 2 : 1; slow push                                             | Gas fills each tube         |                     |                              |
// | 6.1–6.9 s      | punch-in on the two gas columns (whoosh-in)                        |                             | tube tops           |                              |
// | 7.0 s ANSWER   | "A hydrogen" lights; counts pop at 14 mL : 7 mL                    | Hydrogen: twice as fast     | tube tops           |                              |
// | 8.0 s 2nd HOOK | "Why exactly twice as fast?": punch-in on one water molecule       | Why exactly twice as fast?  | the molecule        |                              |
// |                | (whoosh-in); 9.0 s it splits in slow motion (crack), both H light  | Two H for every O           |                     |                              |
// | 10.6–11.6 s    | zoom out (whoosh-out): its atoms fly to the tubes; counts run on   | 2 H₂O → 2 H₂ + O₂           | everything          |                              |
// | 11.6–17.4 s    | the race runs on, slow push; counts reach 34 : 17                  | Twice the molecules, twice  | everything          |                              |
// |                |                                                                    | the gas · Still exactly 2:1 |                     |                              |
// | 17.4 s → end   | end card (no loop: Hook queue)                                     | Water splits 2 H₂ : 1 O₂    |                     |                              |
// Pairs to tell apart (colour-blind safe, tests): hydrogen vs oxygen (atoms, bubbles, gas, counts and graph lines).
import { prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { REAL, VIVID, WHITE } from './palette.ts';
import { orbitCamera, type Band, type V3 } from './inductionScene.ts';

export const DURATION = 19.8, END_AT = 17.4;
export const T_BURST = 0.5, ANSWER_AT = 7.0, T_SECOND = 8.0, T_SLOW = 9.0, T_LIT = 9.3, T_FLY2 = 10.6, COVER_T = 0.4;
export const LABEL = 'CHEMISTRY, VISUALISED  #9';
export const HEADER = ['Two tubes. Which fills first?'];
export const OPTIONS = ['A  hydrogen', 'B  oxygen', 'C  together'], ANSWER = 0;
export const BRAND = 'PYQ Vault · pyqvault.com';
export const SECOND_Q = 'Why exactly twice as fast?';
export const ZOOM_LABEL = '1 water molecule · zoomed ×10⁸';

// ---- the chemistry: 2 H₂O → 2 H₂ + O₂ ----
export const REACTION = { left: { H2O: 2 }, right: { H2: 2, O2: 1 } } as const;
/** Atoms on each side of the equation (the tests check they balance). */
export function atoms(side: Record<string, number>) {
  const n = { H: 0, O: 0 };
  for (const [f, k] of Object.entries(side)) { const m = f.match(/^(H(\d?))?(O(\d?))?$/)!; n.H += k * (m[1] ? Number(m[2] || 1) : 0); n.O += k * (m[3] ? Number(m[4] || 1) : 0); }
  return n;
}
export const RATE = { H2: 2, O2: 1 };                          // mL per second: equal molecules take equal space
export const volume = (gas: 'H2' | 'O2', t: number) => RATE[gas] * Math.max(0, Math.min(t, END_AT));
export const count = (gas: 'H2' | 'O2', t: number) => Math.floor(volume(gas, t) + 1e-9);
/** The moments each counter ticks to its next whole mL (the tap on each). */
export const ticks = (gas: 'H2' | 'O2') => Array.from({ length: count(gas, END_AT) }, (_, i) => (i + 1) / RATE[gas]);

// ---- the apparatus (scene units ≈ 10 cm): a tank of water on a bench, two inverted tubes over two electrodes, a battery ----
export const TANK = { w: 2.4, h: 0.95, d: 0.9, y: -0.85, water: -0.45 };       // centre y; the water's surface
export const TUBE = { r: 0.2, inner: 0.18, mouth: -1.08, top: 0.95 };          // a hemisphere closes it above `top`
export const TUBES = { H2: -0.65, O2: 0.65 } as const;                        // x of each tube (H₂ over the − electrode)
export const ELECTRODE = { tip: -0.97, base: -1.3, r: 0.035 };
export const BENCH = { y: -1.38, h: 0.08, w: 3.7, d: 1.5 };                  // centre y; the tank stands on it
export const BATTERY = { at: [0, -1.2, 0.62] as V3, size: [0.5, 0.28, 0.26] as V3, terminal: 0.1 };   // on the bench in front; − at x − 0.1, + at x + 0.1
const tip = (sign: -1 | 1): V3 => [BATTERY.at[0] + sign * BATTERY.terminal, BATTERY.at[1] + BATTERY.size[1] / 2 + 0.06, BATTERY.at[2]];
/** Each electrode's wire: out under the tank's front edge, along the bench to its battery terminal (− to H₂, + to O₂). */
export const WIRE_PATHS = {
  H2: { from: [TUBES.H2, ELECTRODE.base, 0] as V3, bend: [TUBES.H2 + 0.15, BENCH.y + 0.04, 0.62] as V3, to: tip(-1) },
  O2: { from: [TUBES.O2, ELECTRODE.base, 0] as V3, bend: [TUBES.O2 - 0.15, BENCH.y + 0.04, 0.62] as V3, to: tip(1) },
};
export const terminalAt = tip;
export const ML = 0.035;                                                      // tube length per mL of gas
export const interfaceY = (gas: 'H2' | 'O2', t: number) => TUBE.top - ML * volume(gas, t);

// ---- bubbles: a seeded stream from each electrode tip, rising until they reach their tube's gas ----
const rng = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
export const BUBBLE_RATE = { H2: 10, O2: 5 };                 // per second: twice the gas, twice the bubbles
export type Bubble = { gas: 'H2' | 'O2'; t0: number; dx: number; dz: number; speed: number; r: number; wob: number };
function stream(gas: 'H2' | 'O2', seed: number): Bubble[] {
  const r = rng(seed), out: Bubble[] = [], n = Math.ceil((DURATION + 2) * BUBBLE_RATE[gas]) + 30;
  for (let i = 0; i < n; i++) {
    const t0 = (i - 30 + 0.6 * (r() - 0.5)) / BUBBLE_RATE[gas];               // already running before frame 0 (F5)
    out.push({ gas, t0, dx: (r() - 0.5) * 0.12, dz: (r() - 0.5) * 0.12, speed: 1.0 + 0.4 * r(), r: 0.022 + 0.018 * r(), wob: r() * 6.28 });
  }
  return out;
}
export const BUBBLES = [...stream('H2', 7), ...stream('O2', 11)];
/** Where a bubble is at t, or null before it leaves the electrode or once it has reached the gas above. */
export function bubbleAt(b: Bubble, t: number): V3 | null {
  const age = t - b.t0, y = ELECTRODE.tip + b.speed * age;
  if (age < 0 || y >= interfaceY(b.gas, t) - b.r) return null;
  const x = TUBES[b.gas] + b.dx + 0.025 * Math.sin(b.wob + 9 * age);
  return [x, y, b.dz];
}

// ---- the molecules: the hook's (0–2.4 s) and the second hook's (8.0–11.6 s), both at M ----
export const M: V3 = [0, -0.6, 0.4];
const O_R = 0.11, H_R = 0.075, BOND = 0.15, HALF = (104.5 / 2) * (Math.PI / 180);
const H_REST: V3[] = [+1, -1].map(s => [-BOND * Math.cos(HALF), s * BOND * Math.sin(HALF), 0] as V3);   // both H to the left of O
export type Atom = { el: 'H' | 'O'; p: V3; r: number; lit: number; alpha: number };
const add = (a: V3, b: V3, k = 1): V3 => [a[0] + k * b[0], a[1] + k * b[1], a[2] + k * b[2]];
const TARGET = { H: [TUBES.H2, ELECTRODE.tip + 0.05, 0] as V3, O: [TUBES.O2, ELECTRODE.tip + 0.05, 0] as V3 };
/** One molecule flying apart from `t1` over `dur`: H atoms to the hydrogen tube, O to the oxygen tube, shrinking to
 *  bubble size (the zoom ends) and fading as they arrive. `spread` pulls the atoms apart first (the slow split). */
function flying(t: number, t1: number, dur: number, size: number, spread: number, lit: number): Atom[] {
  const e = prog(t, t1, dur), ey = prog(t, t1 + 0.35 * dur, 0.65 * dur), shrink = 1 - 0.8 * prog(t, t1 + 0.15 * dur, 0.8 * dur), fade = 1 - prog(t, t1 + 0.85 * dur, 0.15 * dur);
  if (fade <= 0) return [];
  const o0 = add(M, [0.05 * size, 0, 0]);
  // Sideways first, then down: they burst apart in view and only sink to the electrodes once the camera has pulled back.
  const along = (a: V3, b: V3): V3 => [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * ey, a[2] + (b[2] - a[2]) * e];
  const atomsNow: Atom[] = [{ el: 'O', p: add(along(o0, TARGET.O), [0, 0.2 * Math.sin(Math.PI * e), 0.15 * Math.sin(Math.PI * e)]), r: O_R * size * shrink, lit: 0, alpha: fade }];
  for (const h of H_REST) {
    const rest = add(o0, h, size * (1 + spread));
    atomsNow.push({ el: 'H', p: add(along(rest, TARGET.H), [0, 0.2 * Math.sin(Math.PI * e), 0.15 * Math.sin(Math.PI * e)]), r: H_R * size * shrink, lit, alpha: fade });
  }
  return atomsNow;
}
export function moleculeAt(t: number): Atom[] {
  if (t < T_BURST + 2.0) {                                      // the hook: breathing, then the burst
    const breathe = 1 + 0.05 * Math.sin(2 * Math.PI * 2.5 * t) * (1 - prog(t, T_BURST, 0.2));
    return flying(t, T_BURST, 1.8, breathe, 0.25 * prog(t, T_BURST, 0.15) * (1 - prog(t, T_BURST + 0.3, 0.5)), 0);
  }
  if (t >= T_SECOND && t < T_FLY2 + 1.0) {                      // the second hook: appears, slow split, the H atoms light
    const size = prog(t, T_SECOND, 0.5);
    return flying(t, T_FLY2, 1.0, size, 0.55 * prog(t, T_SLOW, 1.4), prog(t, T_LIT, 0.4));
  }
  return [];
}
/** The zoom label sits above the O atom, clear of both H atoms as they pull away. */
export const ZOOM_LABEL_AT: V3 = [M[0] + 0.05, M[1] + 0.28, M[2]];
/** How big the molecule is shown (the zoom label's alpha follows it). */
export const zoomLabelAlpha = (t: number) => (1 - prog(t, 0.6, 0.35)) + prog(t, T_SECOND + 0.3, 0.3) * (1 - prog(t, T_FLY2 - 0.2, 0.3));

// ---- camera: starts on the molecule, pulls back to the apparatus, punches in twice ----
export const BAND: Band = { top: 470, width: 1080, height: 770 };
const DIST = 6.6, FOV = 30, Z_MOL = 4.5;
const WIDE = 1.04;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [Z_MOL, M[0], M[1], 0],                                // [zoom, look-at x, look-at y, orbit]
  keys: [
    { t: T_BURST, dur: 1.9, to: [WIDE, 0, -0.18, 0] },          // pull back to the two tubes (slow: no whoosh)
    { t: 2.6, dur: 3.4, to: [WIDE + 0.08, 0, -0.16, 0] },       // slow push while they race
    { t: 6.1, dur: 0.8, to: [1.6, 0, 0.35, 0] },                // punch-in on the gas columns, landing on the answer
    { t: T_SECOND, dur: 0.8, to: [3.6, M[0], M[1], 0] },        // punch-in on one molecule (the second hook), room for its split
    { t: T_FLY2, dur: 0.9, to: [WIDE, 0, -0.18, 0] },           // zoom out as its atoms fly to the tubes
    { t: 11.6, dur: END_AT - 11.6, to: [WIDE + 0.08, 0, -0.16, 0] },   // slow push to the end
  ],
};
export const zoomAt = (t: number) => tween(t, CAMERA.start, CAMERA.keys)[0];
export function cameraAt(t: number) {
  const [zoom, lx, ly, orbit] = tween(t, CAMERA.start, CAMERA.keys);
  return orbitCamera(zoom, [lx, ly], orbit, DIST, FOV, BAND);
}
export const ACID_LABEL_AT: V3 = [0, -0.62, 0.5];
export const acidLabelAlpha = (t: number) => prog(t, 2.6, 0.4) * (1 - prog(t, 5.6, 0.4));
/** Points that must stay inside the band, by what the camera is showing (the wide shots: after each pull-back). */
export const isWide = (t: number) => (t >= T_BURST + 1.7 && t < 6.1) || t >= T_FLY2 + 1.0;
export function anchors(t: number) {
  const z = zoomAt(t), out: { name: string; p: V3 }[] = [];
  const travelling = t >= T_SECOND && t < T_SECOND + 0.8;     // the camera is still on its way down to the molecule
  for (const a of moleculeAt(t)) if (z > 3 && a.alpha > 0.5 && !travelling)
    out.push({ name: `atom ${a.el} top`, p: [a.p[0], a.p[1] + a.r, a.p[2]] }, { name: `atom ${a.el} bottom`, p: [a.p[0], a.p[1] - a.r, a.p[2]] });
  if (zoomLabelAlpha(t) > 0.05 && !travelling) out.push({ name: 'zoom label', p: ZOOM_LABEL_AT });
  if (isWide(t)) {
    out.push(
      { name: 'H₂ tube top', p: [TUBES.H2, TUBE.top + TUBE.r, 0] }, { name: 'O₂ tube top', p: [TUBES.O2, TUBE.top + TUBE.r, 0] },
      { name: 'tank left', p: [-TANK.w / 2, TANK.y - TANK.h / 2, TANK.d / 2] }, { name: 'tank right', p: [TANK.w / 2, TANK.y - TANK.h / 2, TANK.d / 2] },
      { name: 'battery', p: [BATTERY.at[0], BATTERY.at[1] - BATTERY.size[1] / 2, BATTERY.at[2] + BATTERY.size[2] / 2] },
      { name: 'bench front', p: [0, BENCH.y - BENCH.h / 2, BENCH.d / 2] },
    );
    if (acidLabelAlpha(t) > 0.05) out.push({ name: 'acid label', p: ACID_LABEL_AT });
  } else if (t > 6 && t < T_SECOND) {                          // the punch-in on the gas columns
    for (const g of ['H2', 'O2'] as const) out.push({ name: `${g} top`, p: [TUBES[g], TUBE.top + TUBE.r, 0] }, { name: `${g} gas edge`, p: [TUBES[g], interfaceY(g, t), 0] });
  }
  return out;
}

// ---- the graph card: mL against time, both lines drawing themselves ----
export const GRAPH = { left: 150, right: 980, top: 1300, bottom: 1500, t1: END_AT, vmax: 36 };
export const graphX = (t: number) => GRAPH.left + (Math.min(t, GRAPH.t1) / GRAPH.t1) * (GRAPH.right - GRAPH.left);
export const graphY = (v: number) => GRAPH.bottom - (Math.min(v, GRAPH.vmax) / GRAPH.vmax) * (GRAPH.bottom - GRAPH.top);

// ---- colours (F24) ----
export const COLOURS = {
  H: VIVID.white.blue, O: VIVID.white.red,
  water: REAL.white.water.fill, waterEdge: REAL.white.water.edge, glass: REAL.white.glass.fill, glassEdge: REAL.white.glass.edge,
  electrode: REAL.white.steel.fill, wire: REAL.white.copper.fill, ink: WHITE.ink,
} as const;

// ---- words and sound ----
export const CAPTIONS: Caption[] = [
  { t0: 2.6, t1: 4.6, text: 'Battery on: water splits' },
  { t0: 4.6, t1: ANSWER_AT, text: 'Gas fills each tube' },
  { t0: ANSWER_AT, t1: T_SECOND, text: 'Hydrogen: twice as fast' },
  { t0: T_SECOND, t1: 9.6, text: SECOND_Q },
  { t0: 9.6, t1: 11.4, text: 'Two H for every O' },
  { t0: 11.4, t1: 13.6, text: '2 H₂O → 2 H₂ + O₂' },
  { t0: 13.6, t1: 15.6, text: 'Twice the molecules, twice the gas' },
  { t0: 15.6, t1: END_AT - 0.1, text: 'Still exactly 2 : 1' },
];
export const SECOND_HOOK = CAPTIONS[3];
export const END_LINES = ['Water splits 2 H₂ : 1 O₂', 'pyqvault.com', 'Follow for #10'];
export const MUSIC_HITS = [ANSWER_AT, T_SECOND];
const taps = (gas: 'H2' | 'O2', pitch: number): Hit[] => ticks(gas).filter(t => t > T_BURST + 0.2).map(t => ({ kind: 'tap' as const, t, gain: 0.65, pitch }));
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    { kind: 'crack' as const, t: T_BURST, gain: 0.9 },
    { kind: 'crack' as const, t: T_SLOW, gain: 0.8 },
    ...taps('H2', 1.3), ...taps('O2', 0.9),
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ].sort((a, b) => a.t - b.t),
  beds: [],
};
