// @pyqvault_ · Physics, visualised #15 (2026-10-26, framework v1.29): two glasses of the same drink with the same ice; in
// one it floats at the top, in the other a mesh holds it at the bottom. Which cools the drink faster? The top. Idea P36
// ("Ice at the top"; founder's idea, top physics score 79). Hook: Everyday puzzle · Opening: Zoom (frame 0 is a close-up
// of the floating ice with cold water already pouring down from it; the camera pulls back to both glasses). The first
// full-frame studio reel (F35 one picture, full frame; F36 soft studio): no question card, graph card or caption pill;
// the question shrinks to one line at 3 s and every text sits beside what it names. End card (F27: P13 and P14 loop).
//
// The physics (F10), a model of the drink as 24 layers of 0.5 cm (a 12 cm drink in a 6.6 cm glass, 410 g), run in real
// time and shown 5 minutes in 8 s (said in the caption). Water is densest at 4 °C. Each step: the ice takes heat from the
// water it touches (h·a/ρc = 0.03 per second, about 400 W/m²·K over the cubes' surface; its share falls as the cubes
// shrink, area ∝ mass^⅔) and melts 1 g per 334 J; water conducts heat between layers (1.43 × 10⁻⁷ m²/s, very slow); the
// room (25 °C) warms the glass a little through its side (k = 1.4 × 10⁻⁴ per second); then any layer heavier than the
// one below it sinks and mixes (convection). Ice on top: its cold water is heavier than the warm drink, so it sinks and
// stirs the whole glass. Ice at the bottom: its cold water is already at the bottom; the warm drink above is lighter and
// stays put, so only slow conduction reaches the top. Left out: the meltwater's own volume (it would cool the top-ice
// drink a little more). Result at 5:00: 10 °C vs 16 °C; the top of the bottom-ice drink is still 25 °C.
//
// BEAT TABLE (runbook step 1)
// | time           | what moves                                                          | text (beside what it names)   | keep in frame        |
// | 0–1.8 s HOOK   | Zoom: close on the floating ice, cold blue water pouring down; the  | the question, A/B/C, tag      | the ice → both       |
// |                | camera pulls back to both glasses; ice clinks                       | (big, top of frame)           | glasses              |
// | 1.8–3.0 s      | both glasses cooling: the left all over, the right only at its foot | temperatures, clock, tags     | both glasses         |
// | 3.0 s          | the question shrinks to one line under the top edge (F35)          | "Ice on top or at the bottom?"|                      |
// | 3.7 s          | cold streams falling from the top ice                               | Cold water sinks from the ice | both glasses         |
// | 5.0–5.8 s      | punch-in (whoosh) on the right glass's warm top                     | Its top: still 25 °C          | the right glass top  |
// | 6.8–7.6 s      | zoom out (whoosh)                                                   | Here the cold stays down      | both glasses         |
// | 8.0 s          | the clock stops at 5:00 (thunk); the top ice is gone               |                               |                      |
// | 8.6 s ANSWER   | the left glass's tag lights: "A  ice on top"; 10 °C vs 16 °C        | Ice on top cools it all       | both glasses         |
// | 9.6 s 2nd hook | the camera swings right to a fridge, cut away (whoosh)              | So where should the freezer go?| the fridge          |
// | 10.6 s         | cold air pours down from the freezer, warms past the food, rises    | Cold air falls past the food  | the fridge           |
// | 12.0–12.8 s    | punch-in on the freezer (whoosh); its label lights                  | Freezer on top: all of it cools| the freezer         |
// | 13.8 s →       | zoom out (whoosh); the loop keeps turning                           | Cold sinks. Warm rises.       | the fridge           |
// | 15.6 s → end   | end card                                                            | Put the cold on top           |                      |
// Pairs to tell apart (colour-blind safe, tests): warm vs cold water.
import { clamp01, prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { REAL, VIVID, WHITE } from './palette.ts';
import { orbitCamera, project, type V3 } from './inductionScene.ts';
import { FULL, inSafeArea, textBox, type Box } from './layout.ts';

export const DURATION = 17.6, END_AT = 15.6;
export const T_SHRINK = 3.0, ANSWER_AT = 8.6, T_SECOND = 9.6, SECOND_ANSWER_AT = 12.8, COVER_T = 1.6;
export const CLOCK = { t0: 0, t1: 8.0, real: 300 } as const;      // 5 minutes of real time over the first 8 s
export const LABEL = 'PHYSICS, VISUALISED  #15';
export const HEADER = ['Ice at the top or the bottom:', 'which cools a drink faster?'];
export const OPTIONS = ['A  top', 'B  bottom', 'C  the same'], ANSWER = 0;
export const SHORT_Q = 'Ice on top or at the bottom?';
export const BRAND = 'PYQ Vault · pyqvault.com';
export const SECOND_Q = 'So where should the freezer go?';

// ---- the physics ----
export type Glass = 'top' | 'bottom';                             // where the ice is
export const START = 25, ROOM = 25;                               // °C
export const N = 24, DZ = 0.005;                                  // layers, m
const AREA = Math.PI * 3.3 * 3.3, LAYER_G = AREA * DZ * 100;      // cm², g of drink per layer
export const ICE_LAYERS = 8, ICE_G = 80;                          // the ice spans 4 cm; 8 cubes of 10 g
const K_ICE = 0.03, K_ROOM = 1.4e-4, ALPHA = 1.43e-7, C_W = 4.18, L_F = 334, DT = 0.25;
/** Water's density (kg/m³), a fit good to 0.1 kg/m³ from 0 to 30 °C: densest at 4 °C. */
export const density = (T: number) => 1000 * (1 - 6.8e-6 * (T - 4) ** 2);

/** Convection: water heavier than the water under it sinks and mixes with it, until no layer sits on lighter water. The
 *  layers have equal masses; working up from the bottom, each new layer merges with the mixed block below while it is
 *  the heavier, and the merged block keeps checking downwards. */
function stabilise(T: Float64Array) {
  const blocks: { n: number; T: number }[] = [];
  for (let i = 0; i < T.length; i++) {
    blocks.push({ n: 1, T: T[i] });
    while (blocks.length > 1) {
      const top = blocks[blocks.length - 1], below = blocks[blocks.length - 2];
      if (density(top.T) <= density(below.T)) break;
      below.T = (below.T * below.n + top.T * top.n) / (below.n + top.n); below.n += top.n; blocks.pop();
    }
  }
  let i = 0;
  for (const b of blocks) for (let j = 0; j < b.n; j++) T[i++] = b.T;
}

type Run = { T: Float64Array[]; ice: number[]; melt: number[]; room: number[]; sink: number[] };
const STEPS = Math.round(CLOCK.real / DT);
function simulate(where: Glass): Run {
  const inIce = (i: number) => (where === 'top' ? i >= N - ICE_LAYERS : i < ICE_LAYERS);
  const edge = where === 'top' ? N - ICE_LAYERS : -1;            // the pair (edge, edge − 1) is the ice's lower boundary
  let T = new Float64Array(N).fill(START), ice = ICE_G, melt = 0, room = 0;
  const run: Run = { T: [T.slice()], ice: [ice], melt: [0], room: [0], sink: [0] };
  for (let s = 1; s <= STEPS; s++) {
    const next = T.slice(), share = Math.pow(ice / ICE_G, 2 / 3);
    let q = 0;
    for (let i = 0; i < N; i++) {
      const up = T[Math.min(N - 1, i + 1)], down = T[Math.max(0, i - 1)];
      next[i] += DT * ALPHA * (up - 2 * T[i] + down) / (DZ * DZ);
      const gain = DT * K_ROOM * (ROOM - T[i]);
      next[i] += gain; room += gain * LAYER_G * C_W;
      if (inIce(i) && ice > 0) { const d = DT * K_ICE * share * T[i]; next[i] -= d; q += d * LAYER_G * C_W; }
    }
    if (q / L_F > ice) {                                          // the last of the ice: take only what it can melt
      const keep = (ice * L_F) / q;
      for (let i = 0; i < N; i++) if (inIce(i)) next[i] = T[i] + (next[i] - T[i]) + (1 - keep) * DT * K_ICE * share * T[i];
      q = ice * L_F;
    }
    ice -= q / L_F; melt += q;
    let sunk = 0;
    for (let i = 0; i < edge; i++) sunk += next[i];
    stabilise(next);
    for (let i = 0; i < edge; i++) sunk -= next[i];               // the cold carried down below the ice (°C·layers)
    T = next;
    run.T.push(T.slice()); run.ice.push(Math.max(0, ice)); run.melt.push(melt); run.room.push(room); run.sink.push(sunk);
  }
  return run;
}
const RUNS: Partial<Record<Glass, Run>> = {};
const runOf = (k: Glass) => (RUNS[k] ??= simulate(k));

export const realSeconds = (t: number) => clamp01((t - CLOCK.t0) / (CLOCK.t1 - CLOCK.t0)) * CLOCK.real;
const stepAt = (t: number) => Math.round(realSeconds(t) / DT);
/** Each layer's temperature (°C), bottom first. */
export const profile = (k: Glass, t: number) => Array.from(runOf(k).T[stepAt(t)]);
export const meanTemp = (k: Glass, t: number) => profile(k, t).reduce((a, b) => a + b, 0) / N;
export const iceLeft = (k: Glass, t: number) => runOf(k).ice[stepAt(t)];
export const meltHeat = (k: Glass, t: number) => runOf(k).melt[stepAt(t)];
export const roomHeat = (k: Glass, t: number) => runOf(k).room[stepAt(t)];
export const waterHeatLost = (k: Glass, t: number) => (START - meanTemp(k, t)) * N * LAYER_G * C_W;
const SINK_PEAK = Math.max(...runOf('top').sink.map((_, s, a) => smooth(a, s)));
function smooth(a: number[], s: number) { let v = 0, n = 0; for (let j = Math.max(1, s - 8); j <= Math.min(a.length - 1, s + 8); j++) { v += a[j]; n++; } return n ? v / n : 0; }
/** How hard cold water is pouring down from the ice (0–1): the convection the model does at the ice's lower edge. */
export const sinking = (k: Glass, t: number) => (k === 'bottom' || t > CLOCK.t1 ? 0 : smooth(runOf(k).sink, stepAt(t)) / SINK_PEAK);
export function clockText(t: number) { const s = Math.round(realSeconds(t)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }

// ---- the fridge (the second answer): air leaves the freezer at the top, falls at the back past the food, crosses the
// floor, rises at the front and goes back in. Local coordinates: y up from the floor of the cabinet, z from back to front.
export const FRIDGE = { x: 3.6, w: 1.25, h: 2.4, d: 0.85, wall: 0.06, freezer: { y0: 1.82, y1: 2.26 } } as const;
const LOOP: { y: number; z: number }[] = [
  { y: FRIDGE.freezer.y0 - 0.02, z: -0.26 }, { y: 0.22, z: -0.26 }, { y: 0.18, z: 0.2 }, { y: FRIDGE.freezer.y0 - 0.1, z: 0.26 },
  { y: FRIDGE.freezer.y0 + 0.06, z: 0 }, { y: FRIDGE.freezer.y0 - 0.02, z: -0.26 },
];
const LEGS = [0.42, 0.12, 0.34, 0.06, 0.06];                       // share of the loop each leg takes
/** Where the air is at u ∈ [0, 1) round the loop (fridge-local y, z). */
export function airPath(u: number) {
  let v = ((u % 1) + 1) % 1, i = 0;
  if (u === 1) return { ...LOOP[0] };
  while (v > LEGS[i] && i < LEGS.length - 1) { v -= LEGS[i]; i++; }
  const p = Math.min(1, v / LEGS[i]), a = LOOP[i], b = LOOP[i + 1];
  return { y: a.y + (b.y - a.y) * p, z: a.z + (b.z - a.z) * p };
}
/** The air's temperature round the loop (°C): −5 leaving the freezer, warming past the food, cooled again inside. */
export function airTemp(u: number) {
  const v = ((u % 1) + 1) % 1;
  if (v <= LEGS[0]) return -5 + 11 * (v / LEGS[0]);              // the fall at the back: −5 → 6
  if (v <= LEGS[0] + LEGS[1] + LEGS[2]) return 6 + 2 * ((v - LEGS[0]) / (LEGS[1] + LEGS[2]));
  return 8 - 13 * ((v - (1 - LEGS[3] - LEGS[4])) / (LEGS[3] + LEGS[4]));
}

// ---- the scene (scene units: 10 per metre; the floor at y = 0) ----
export const GLASS = { rIn: 0.33, rOut: 0.355, base: 0.1, wall: 1.42 } as const;
export const DRINK_TOP = GLASS.base + N * DZ * 10;                // 1.3
export const GX: Record<Glass, number> = { top: -0.47, bottom: 0.47 };
export const CUBE = 0.22;
/** The ice cubes' centres (2 layers of 4); they shrink as they melt. */
export function cubes(k: Glass): V3[] {
  const ys = k === 'top' ? [DRINK_TOP - CUBE / 2 + 0.02, DRINK_TOP - 1.5 * CUBE + 0.02] : [GLASS.base + CUBE / 2 + 0.005, GLASS.base + 1.5 * CUBE + 0.01];
  const o = 0.115;
  return ys.flatMap(y => [[-o, -o], [o, -o], [-o, o], [o, o]].map(([x, z]) => [GX[k] + x, y, z] as V3));
}
export const MESH_Y = GLASS.base + 2 * CUBE + 0.03;               // the mesh holding the bottom ice down
export const cubeScale = (k: Glass, t: number) => Math.cbrt(iceLeft(k, t) / ICE_G);

const DIST = 7.0, FOV = 30, LOOK_Y = 0.83, F_LOOK_Y = 1.2;
const FREEZER_Y = (FRIDGE.freezer.y0 + FRIDGE.freezer.y1) / 2;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [2.3, GX.top, DRINK_TOP - 0.35, 0],                       // [zoom, look-at x, look-at y, orbit]: close on the floating ice
  keys: [
    { t: 0, dur: 1.8, to: [1.0, 0, LOOK_Y, 0] },                   // the Zoom opening: pull back to both glasses (slow: silent)
    { t: 1.9, dur: 3.0, to: [1.05, 0, LOOK_Y, 0] },                // slow push while they cool
    { t: 5.0, dur: 0.8, to: [2.0, GX.bottom, DRINK_TOP - 0.1, 0] },// punch-in on the warm top of the bottom-ice drink
    { t: 6.8, dur: 0.8, to: [1.0, 0, LOOK_Y, 0] },                 // zoom out
    { t: 7.6, dur: 1.0, to: [1.04, 0, LOOK_Y, 0] },                // a slow push to the answer
    { t: T_SECOND, dur: 0.9, to: [1.0, FRIDGE.x, F_LOOK_Y, 0] },   // swing to the fridge (the second hook's move)
    { t: 10.6, dur: 1.3, to: [1.04, FRIDGE.x, F_LOOK_Y, 0] },      // slow push
    { t: 12.0, dur: 0.8, to: [1.45, FRIDGE.x, FREEZER_Y - 0.3, 0] }, // punch-in on the freezer and the cold falling from it
    { t: 13.8, dur: 0.9, to: [1.0, FRIDGE.x, F_LOOK_Y, 0] },       // zoom out
  ],
};
export function cameraAt(t: number) {
  const [zoom, lx, ly, orbit] = tween(t, CAMERA.start, CAMERA.keys);
  return orbitCamera(zoom, [lx, ly], orbit, DIST, FOV, FULL);
}
export const SWAP = T_SECOND + 0.45;                                       // past this, the camera is on the fridge
/** The picture's outline (F35: it should fill the frame). */
export function heroAt(t: number): V3[] {
  if (t >= END_AT) return [];
  if (t < SWAP) return (['top', 'bottom'] as Glass[]).flatMap(k => [-1, 1].flatMap(s => [[GX[k] + s * GLASS.rOut, 0, 0], [GX[k] + s * GLASS.rOut, GLASS.wall, 0]] as V3[]));
  return [-1, 1].flatMap(s => [[FRIDGE.x + s * FRIDGE.w / 2, 0, FRIDGE.d / 2], [FRIDGE.x + s * FRIDGE.w / 2, FRIDGE.h, FRIDGE.d / 2]] as V3[]);
}

// ---- colours (F24): the drink's temperature, warm orange → peach → light blue → cold blue (a cooled drink reads blue,
// not white: the first stills had a pale middle and the 10 °C glass looked like milk) ----
export const COLOURS = {
  warm: VIVID.white.orange, cold: VIVID.white.blue,
  glass: REAL.white.glass.fill, glassEdge: REAL.white.glass.edge, ice: REAL.white.ice.fill, steel: REAL.white.steel.fill, steelEdge: REAL.white.steel.edge,
  ink: WHITE.ink, muted: WHITE.muted, amber: WHITE.amber, studio: '#eef0f3',
} as const;
const hex = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, p: number) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * p).toString(16).padStart(2, '0')).join('');
const SCALE: [number, string][] = [[0, VIVID.white.blue], [6, '#4f8ff0'], [12, '#a9cff5'], [17, '#f6dcc8'], [21, '#f4a26b'], [ROOM, VIVID.white.orange]];
export function tempColour(T: number) {
  if (T >= ROOM) return COLOURS.warm;
  if (T <= 0) return COLOURS.cold;
  const i = SCALE.findIndex(([v]) => v >= T), [t0, c0] = SCALE[i - 1], [t1, c1] = SCALE[i];
  return mix(c0, c1, (T - t0) / (t1 - t0));
}
/** The drink's surface picture, W around × H up (RGBA, bottom row first): each layer in its temperature's colour, and in
 *  the top-ice glass, fingers of cold water falling from the ice's lower edge as hard as the model's convection runs (the
 *  model mixes them in at once; the picture shows them fall and fade as they mix). */
export function drinkPixels(k: Glass, t: number, W: number, H: number) {
  const T = profile(k, t), px = new Uint8Array(W * H * 4), s = Math.sqrt(sinking(k, t));   // √: still seen as the ice runs low
  const edge = (N - ICE_LAYERS) / N, cold = hex(tempColour(1));   // water leaving the ice is near 0 °C (it sinks while above 4 °C)
  for (let row = 0; row < H; row++) {
    const v = (row + 0.5) / H, base = hex(tempColour(T[Math.min(N - 1, Math.floor(v * N))]));
    for (let u = 0; u < W; u++) {
      let a = 0;
      if (s > 0 && v < edge) for (let j = 0; j < 9; j++) {
        const uj = (j * 0.618 + 0.11) % 1, du = Math.min(Math.abs((u + 0.5) / W - uj), 1 - Math.abs((u + 0.5) / W - uj));
        const front = edge - (((t + j * 0.37) / 1.4) % 1) * (edge + 0.45), behind = v - front;  // the finger's tip falls, its tail trails
        if (behind >= 0 && behind < 0.45 && v < edge) a = Math.max(a, s * clamp01(1.3 - du / 0.07) * (1 - behind / 0.45));
      }
      const c = base.map((b, i) => Math.round(b + (cold[i] - b) * a)), o = (row * W + u) * 4;
      px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2]; px[o + 3] = 255;
    }
  }
  return px;
}
/** A temperature written on the studio: warm → cold through ink, so it reads at every temperature (tests). */
export function textColour(T: number) {
  const p = clamp01(T / ROOM);
  return p >= 0.5 ? mix(COLOURS.ink, COLOURS.warm, (p - 0.5) / 0.5) : mix(COLOURS.ink, COLOURS.cold, (0.5 - p) / 0.5);
}

// ---- words: every text on screen, placed beside what it names (F35); the page draws exactly these ----
export const CAPTIONS: (Caption & { at: Glass | 'fridge' })[] = [
  { t0: 3.7, t1: 5.0, text: 'Cold water sinks from the ice', at: 'top' },
  { t0: 5.0, t1: 6.8, text: 'Top layer: still 25 °C', at: 'bottom' },
  { t0: 6.8, t1: ANSWER_AT, text: 'Here the cold stays down', at: 'bottom' },
  { t0: ANSWER_AT, t1: T_SECOND, text: 'Ice on top cools it all', at: 'top' },
  { t0: 10.6, t1: SECOND_ANSWER_AT, text: 'Cold air falls past the food', at: 'fridge' },
  { t0: SECOND_ANSWER_AT, t1: 14.2, text: 'Freezer on top: all of it cools', at: 'fridge' },
  { t0: 14.2, t1: END_AT - 0.1, text: 'Cold sinks. Warm rises.', at: 'fridge' },
];
export const SECOND_HOOK = { t0: T_SECOND, t1: END_AT, text: SECOND_Q };
export const END_LINES = ['Put the cold on top', 'pyqvault.com', 'Follow for #16'];

export type Kind = 'label' | 'header' | 'chip' | 'tag' | 'nudge' | 'line' | 'caption' | 'temp' | 'glassTag' | 'answer' | 'clock' | 'freezer';
export type Text = { name: string; kind: Kind; text: string; size: number; x: number; y: number; alpha: number; box: Box; colour?: string };
const HEAD = { size: 56, chipW: 240, chipH: 76, gap: 22 };
const CAP_Y = 300, LINE_Y = 128, TAG_Y = 186;
const fade = (t: number, t0: number, t1: number, d = 0.25) => clamp01((t - t0) / d) * clamp01((t1 - t) / d);

function at(p: V3, t: number) { return project(p, cameraAt(t), FULL); }
/** Every text on screen at t, with its box (tests: inside Instagram's safe area, no two colliding). */
export function textsAt(t: number): Text[] {
  // a label pinned to an object hides while it would sit under Instagram's own buttons or caption (or off the page)
  const out: Text[] = [], add = (x: Omit<Text, 'box'> & { pad?: number; box?: Box; pinned?: boolean }) => {
    const box = x.box ?? textBox(x.text, x.size, x.x, x.y, x.pad ?? 0);
    if (x.alpha <= 0.01 || (x.pinned && !inSafeArea(box))) return;
    const { pad: _pad, pinned: _pinned, ...text } = x;
    out.push({ ...text, box });
  };
  if (t >= END_AT) return out;
  // the question: big until T_SHRINK, then one line under the top edge (F35 + F4)
  const big = 1 - prog(t, T_SHRINK, 0.3), line = prog(t, T_SHRINK + 0.3, 0.3);
  add({ name: 'label', kind: 'label', text: LABEL, size: 34, x: 540, y: 116, alpha: big });
  HEADER.forEach((h, i) => add({ name: `header ${i + 1}`, kind: 'header', text: h, size: HEAD.size, x: 540, y: 184 + i * HEAD.size * 1.32, alpha: big }));
  const x0 = 540 - (3 * HEAD.chipW + 2 * HEAD.gap) / 2;
  OPTIONS.forEach((o, i) => add({ name: `chip ${'ABC'[i]}`, kind: 'chip', text: o, size: 42, x: x0 + i * (HEAD.chipW + HEAD.gap) + HEAD.chipW / 2, y: 350, alpha: big,
    box: { x: x0 + i * (HEAD.chipW + HEAD.gap), y: 312, w: HEAD.chipW, h: HEAD.chipH } }));
  add({ name: 'nudge', kind: 'nudge', text: 'comment your guess 👇', size: 32, x: 540, y: 480, alpha: big });
  add({ name: 'question line', kind: 'line', text: t < T_SECOND ? SHORT_Q : SECOND_Q, size: 44, x: 540, y: LINE_Y,
    alpha: t < T_SECOND ? line * (1 - prog(t, T_SECOND - 0.25, 0.25)) : prog(t, T_SECOND, 0.25) });
  const tagY = 432 + (TAG_Y - 432) * prog(t, T_SHRINK + 0.3, 0.4);   // it rises once the big question has gone
  add({ name: 'tag', kind: 'tag', text: BRAND, size: 30, x: 540, y: tagY, alpha: 1 });
  // the glasses: temperature over each, a tag under each, the clock between; hidden once off screen
  if (t < SWAP) for (const k of ['top', 'bottom'] as Glass[]) {
    const rim = at([GX[k], GLASS.wall, 0], t), foot = at([GX[k], 0, GLASS.rOut], t), vis = glassTexts(t);
    const temp = `${Math.round(meanTemp(k, t))} °C`;
    const tY = Math.max(rim.y - 62, TAG_Y + 120), gY = foot.y + 52;
    add({ name: `temp ${k}`, kind: 'temp', text: temp, size: 60, x: rim.x, y: tY, alpha: vis * onPage(rim.x), pinned: true, colour: textColour(meanTemp(k, t)) });
    const answer = k === 'top' && t >= ANSWER_AT;
    add({ name: `tag ${k}`, kind: answer ? 'answer' : 'glassTag', text: answer ? 'A  ice on top' : k === 'top' ? 'ice on top' : 'ice at bottom',
      size: answer ? 40 : 34, x: foot.x, y: gY, pad: 20, alpha: vis * onPage(foot.x), pinned: true });
  }
  if (t < SWAP) {
    const foot = at([0, 0, GLASS.rOut], t), cY = foot.y + 130;
    add({ name: 'clock', kind: 'clock', text: `⏱ ${clockText(t)}`, size: 40, x: 540, y: cY, alpha: glassTexts(t), pinned: true });
  }
  // the freezer's label, on its door; it lights at the second answer
  if (t >= SWAP) {
    const f = at([FRIDGE.x, FREEZER_Y, FRIDGE.d / 2], t), lit = t >= SECOND_ANSWER_AT;
    add({ name: 'freezer', kind: lit ? 'answer' : 'freezer', text: lit ? 'freezer at the top' : 'freezer', size: lit ? 40 : 36, x: f.x, y: f.y, pad: 20, alpha: fade(t, SWAP, END_AT), pinned: true });
  }
  // the caption: one line, over what it names
  const cap = CAPTIONS.find(c => t >= c.t0 && t < c.t1);
  if (cap) {
    const ax = cap.at === 'fridge' ? 540 : at([GX[cap.at], GLASS.wall, 0], t).x;
    const w = textBox(cap.text, 46, 0, 0, 28).w, x = Math.min(1040 - w / 2, Math.max(40 + w / 2, ax));
    add({ name: 'caption', kind: 'caption', text: cap.text, size: 46, x, y: CAP_Y, pad: 28, alpha: fade(t, cap.t0, cap.t1, 0.2) });
  }
  return out;
}
const onPage = (x: number) => clamp01(Math.min(x - 90, 990 - x) / 60);
/** The glasses' labels come in once the opening zoom has pulled back (1.5–1.8 s) and leave as the camera swings away. */
const glassTexts = (t: number) => clamp01((t - 1.5) / 0.3) * clamp01(1 - (t - T_SECOND) / 0.3);

// ---- sound ----
export const MUSIC_HITS = [ANSWER_AT, T_SECOND];
const minute = (m: number) => CLOCK.t0 + (CLOCK.t1 - CLOCK.t0) * (60 * m) / CLOCK.real;
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    { kind: 'tap' as const, t: 0.08, gain: 0.3, pitch: 2.4 }, { kind: 'tap' as const, t: 0.27, gain: 0.25, pitch: 2.0 },
    { kind: 'tap' as const, t: 0.46, gain: 0.22, pitch: 2.7 },                       // the ice clinks as it settles
    { kind: 'shimmer' as const, t: 0.1, gain: 0.22 },                               // the cold starting to pour
    ...[1, 2, 3, 4, 5].map(m => ({ kind: 'click' as const, t: minute(m), gain: 0.35 } as Hit)),
    { kind: 'thunk' as const, t: CLOCK.t1, gain: 0.5 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ].sort((a, b) => a.t - b.t),
  beds: [],
};
