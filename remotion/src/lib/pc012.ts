// @pyqvault_ · Chemistry, visualised #12 (2026-10-26, framework v1.34): one drop of universal indicator in milk; is milk
// acidic, neutral or basic? Slightly acidic (pH ≈ 6.5). Idea C9 ("The pH chart"). Hook: You'd think · Opening: Colour
// flood (frame 0: close on a dropper over the milk with a fat drop falling, baking soda and water already coloured beside
// it; the camera follows the dropper tube to tube, a drop every ~0.5 s to 2.25 s, then pulls back to the whole rainbow;
// the question shrinks at 3 s and the pH strip slides in, F37).
// The first F39 reel (made to send): the payoff is the whole chart, seven everyday liquids on a pH strip, held still as a
// cheat sheet (11.7–13.5 s); then a rewind takes it all back to frame 0 (F27 loop). Full frame (F35) on Chemistry #11's
// dark set: the review panel's pass 1 (all three critics) found the studio version's pastels on off-white read as a chart.
//
// The chemistry (F10): typical pH values (they vary a little by brand: lemon juice 2–2.6, soda water 3.5–4, milk
// 6.4–6.8, baking soda solution ≈ 8.3, soap 9–10, drain cleaner 13–14; said in the caption) and a common universal
// indicator's colours (red ≤ 3, orange 4–5, yellow 6, green 7, teal 8, blue 9–10, indigo 11, violet 12–14). No bleach: it
// bleaches the indicator itself. Milk is opaque, so its colour shows pale (the indicator's yellow-green in white).
//
// BEAT TABLE (runbook step 1)
// | time           | what moves                                                            | text (beside what it names)      | keep in frame   |
// | 0–0.15 s HOOK  | dark set, close: a dropper over the milk (opaque cream), a fat glowing| the question, A/B/C, tag (big);  | milk + 2 each   |
// |                | drop falling; baking soda (teal) and water (green) already coloured   | a "milk" pill on its tube        | side            |
// | 0.15 s         | the drop lands: a bright yellow-green cloud runs down the milk (tap)  |                                  |                 |
// | 0.25–2.25 s    | the camera follows the dropper close, tube to tube: soap (0.7), lemon |                                  | each tube as    |
// |                | (1.15), a long glide right to soda water (1.8), drain cleaner (2.25); |                                  | its drop lands  |
// |                | a drop, a cloud and a tap each                                        |                                  |                 |
// | 2.3–3.0 s      | the pull-back to the whole rainbow (whoosh); the dropper lifts away   |                                  | all seven       |
// | 3.0 s          | the question shrinks to one line (F35)                                | "Milk: acid, neutral or base?"   |                 |
// | 3.1–3.65 s     | the pH strip slides in above the row (shimmer) and locks (snap)       | acid · neutral · base            | the row         |
// | 3.75–5.1 s     |                                                                       | Each colour means a pH           |                 |
// | 3.7–4.85 s     | the tubes lift and swap into pH order (lanes in depth, no clashes)    |                                  | the row         |
// | 5.0–6.5 s      | they land one by one, acid to base, with a hop (tap each); pH, name   | pH 2 · lemon juice …             | the row         |
// | 4.85–7.0 s     | milk hovers over the gap between soda water and water                 | ? (big)                          |                 |
// | 7.0 s ANSWER   | milk lands, a warm ring pulses out (thunk, music hit); punch-in      | pH 6.5; "A  acidic" at 7.5 s     | milk + water    |
// | 8.2–8.9 s      | across to the acid end, close (whoosh)                                | Below 7: acids (8.9–9.65)        | lemon, soda     |
// | 9.6–10.2 s     | across to the base end, close                                         | Above 7: bases (10.2–10.95)      | soap, drain     |
// | 10.95–11.45 s  | zoom out (whoosh)                                                     |                                  | the row         |
// | 11.7–13.5 s    | THE CHEAT SHEET (F39): everything still                               | Universal indicator: the pH chart| the row         |
// | 13.5–15.3 s    | the rewind (shimmer): tubes fly back, colours drain, close on milk    | the question returns big         | → the milk      |
import { clamp01, ease, prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { LAB } from './palette.ts';
import { orbitCamera, project, type V3 } from './inductionScene.ts';
import { FULL, inSafeArea, textBox, type Box } from './layout.ts';

export const DURATION = 15.3, REW0 = 13.5;
export const T_SHRINK = 3.0, ANSWER_AT = 7.0, ANSWER_LIT = 7.5, COVER_T = 2.93;
export const SHEET: [number, number] = [11.7, REW0];
export const LABEL = 'CHEMISTRY, VISUALISED  #12';
export const HEADER = ['One drop of indicator.', 'Milk is…'];
export const OPTIONS = ['A  acidic', 'B  neutral', 'C  basic'], ANSWER = 0;
export const SHORT_Q = 'Milk: acid, neutral or base?';
export const BRAND = 'PYQ Vault · pyqvault.com';
export const SHEET_TITLE = 'Universal indicator: the pH chart';

// ---- the chemistry ----
export type Id = 'lemon' | 'soda' | 'milk' | 'water' | 'bakingSoda' | 'soap' | 'drain';
export type Member = { id: Id; name: string; pH: number; base: string };
/** In pH order. `base` is the liquid's own colour before the indicator. */
export const MEMBERS: Member[] = [
  { id: 'lemon', name: 'lemon juice', pH: 2, base: '#e6dc96' },
  { id: 'soda', name: 'soda water', pH: 4, base: '#c9dfe7' },
  { id: 'milk', name: 'milk', pH: 6.5, base: '#f6f2e6' },
  { id: 'water', name: 'water', pH: 7, base: '#c6e0ec' },
  { id: 'bakingSoda', name: 'baking soda', pH: 8, base: '#d6e4e6' },
  { id: 'soap', name: 'soap', pH: 10, base: '#d8d3ea' },
  { id: 'drain', name: 'drain cleaner', pH: 13, base: '#cfe0e6' },
];
const byId = Object.fromEntries(MEMBERS.map((m, i) => [m.id, { ...m, slot: i }])) as Record<Id, Member & { slot: number }>;
/** A common universal indicator's colour at each pH (stops between are blended). */
const STOPS: [number, string][] = [
  [0, '#b3121f'], [2, '#d7262e'], [3, '#e4432b'], [4, '#ef7d1f'], [5, '#f2a31b'], [6, '#e1c51f'], [7, '#2fa84f'],
  [8, '#169c8f'], [9, '#1f7fc8'], [10, '#2457c9'], [11, '#3a3fae'], [12, '#5a33a6'], [14, '#6b2a9c'],
];
const hex = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, p: number) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * p).toString(16).padStart(2, '0')).join('');
export function indicatorColour(pH: number) {
  const v = Math.max(0, Math.min(14, pH)), i = Math.max(1, STOPS.findIndex(([s]) => s >= v)), [a, ca] = STOPS[i - 1], [b, cb] = STOPS[i];
  return mix(ca, cb, b === a ? 0 : (v - a) / (b - a));
}
/** Milk is opaque white: the indicator's colour shows through pale. */
const MILKY = 0.3;
export const tintOf = (m: Member) => (m.id === 'milk' ? mix(indicatorColour(m.pH), '#ffffff', MILKY) : indicatorColour(m.pH));

// ---- story time: runs with t, then runs back to 0 over the rewind, so the last frame is frame 0 (F27) ----
export function storyTime(t: number) {
  if (t < REW0) return t;
  return REW0 * (1 - ease(clamp01((t - REW0) / (DURATION - REW0))));
}

// ---- the opening: a drop into each tube, then its colour runs down the tube; milk's neighbours first, so colour is on
// screen within the first frames (the first stills: a white close-up for a whole second) ----
// (the first two before frame 0, so the reel opens on colour: baking soda teal, water green, milk's drop falling)
export const FLOOD: Record<Id, number> = { bakingSoda: -0.75, water: -0.4, milk: 0.15, soap: 0.7, lemon: 1.15, soda: 1.8, drain: 2.25 };
const FLOOD_DUR = 0.6, DROP_FALL = 0.25;
export const floodAt = (id: Id, t: number) => prog(storyTime(t), FLOOD[id], FLOOD_DUR);
export const liquidColour = (id: Id, t: number) => mix(byId[id].base, tintOf(byId[id]), floodAt(id, t));
/** The cloud of indicator spreading through the liquid (0 → 1 as it grows; it fades as the liquid takes its colour). */
export const bloomAt = (id: Id, t: number) => clamp01((storyTime(t) - FLOOD[id]) / FLOOD_DUR);
/** How far down the tube the colour has run (0 → 1), top first: the indicator sinking and mixing. */
export const frontAt = (id: Id, t: number) => floodAt(id, t);

// ---- the row of test tubes in a rack (scene units; the floor at y = 0); tall, so the row fills the phone (F35) ----
export const GLASS = { r: 0.1, h: 2.2, liquid: 1.7 } as const;
export const SLOT_DX = 0.42;
export const slotX = (i: number) => (i - 3) * SLOT_DX;
/** The order on the bench at frame 0: a shuffle, with milk in the middle for the close-up and the two ends staying put,
 *  so the row never narrows while it sorts (F35). */
export const START_ORDER: Id[] = ['lemon', 'soap', 'water', 'milk', 'bakingSoda', 'soda', 'drain'];
const startSlot = (id: Id) => START_ORDER.indexOf(id);
/** The pH strip, behind and above the row: pH 0–14 left to right. */
export const STRIP = { y0: 2.45, y1: 2.6, z: -0.45, half: 1.5 } as const;
export const stripX = (pH: number) => ((pH - 7) / 7) * STRIP.half;
// it arrives once the big question has shrunk (sliding in under it, it smeared across the chips on the cover)
export const STRIP_IN = 3.1;
export const STRIP_LOCK = 3.65;
export const stripIn = (t: number) => prog(storyTime(t), STRIP_IN, STRIP_LOCK - STRIP_IN);

// the sort: lift (4.0–4.4, each into its own depth lane so no two glasses pass through each other), slide to the pH
// order (4.45–5.15), then land one by one, acid to base, milk last at the answer
export const LIFT = 0.2;                                           // a lifted tube's rim stays under the strip
const LANE_DZ = 0.38, T_LIFT = 3.7, T_MOVE = 4.15, T_MOVED = 4.85, LAND_DUR = 0.35;
export const LANDS: Record<Id, number> = { lemon: 5.0, soda: 5.3, water: 5.6, bakingSoda: 5.9, soap: 6.2, drain: 6.5, milk: ANSWER_AT };
/** Each glass's depth lane while it moves: glasses whose paths cross take different lanes (lane 0 stays at the front). */
const LANES: Record<Id, number> = (() => {
  const span = (id: Id) => { const a = slotX(startSlot(id)), b = slotX(byId[id].slot); return [Math.min(a, b) - GLASS.r, Math.max(a, b) + GLASS.r]; };
  const ids = [...MEMBERS.map(m => m.id)].sort((p, q) => (span(q)[1] - span(q)[0]) - (span(p)[1] - span(p)[0]));
  const lanes = {} as Record<Id, number>, used: [number, number][][] = [];
  for (const id of ids) {
    const [a, b] = span(id);
    let k = 0;
    while (used[k]?.some(([c, d]) => a < d + 0.02 && c < b + 0.02)) k++;
    (used[k] ??= []).push([a, b]); lanes[id] = k;
  }
  return lanes;
})();
/** The base centre of a glass at t. */
export function glassPos(id: Id, t: number): V3 {
  const s = storyTime(t), x0 = slotX(startSlot(id)), x1 = slotX(byId[id].slot), lane = -LANES[id] * LANE_DZ;
  const up = prog(s, T_LIFT, 0.4), across = prog(s, T_MOVE, T_MOVED - T_MOVE), down = prog(s, LANDS[id] - LAND_DUR, LAND_DUR);
  const air = up * (1 - down), u = clamp01((s - LANDS[id]) / 0.3), hop = u > 0 && u < 1 ? 0.045 * Math.sin(Math.PI * u) * (1 - u) : 0;
  return [x0 + (x1 - x0) * across, LIFT * air + hop, lane * air];
}
export const landed = (id: Id, t: number) => storyTime(t) >= LANDS[id];
export const TIP_Y = GLASS.h + 0.22;
/** How far under milk's surface its tag sits. */
export const TAG_DY = 0.15;                                // the dropper's tip, above the tube's mouth
const VISITS = MEMBERS.map(m => m.id).sort((a, b) => FLOOD[a] - FLOOD[b]);
/** The dropper's tip at t (null once it has lifted away after the last drop): over each tube as its drop is released,
 *  gliding to the next in between. */
export function dropperAt(t: number): V3 | null {
  const s = storyTime(t), rel = VISITS.map(id => FLOOD[id] - DROP_FALL), xs = VISITS.map(id => slotX(startSlot(id)));
  const last = rel.length - 1;
  if (s >= rel[last] + 0.55) return null;
  if (s >= rel[last]) return [xs[last], TIP_Y + 2.2 * prog(s, rel[last] + 0.1, 0.45), 0];   // it lifts away out of frame
  let i = 0;
  while (i < last && s >= rel[i + 1]) i++;
  if (s < rel[0]) return [xs[0], TIP_Y, 0];
  const leave = Math.max(rel[i] + 0.08, FLOOD[VISITS[i]]), go = prog(s, leave, Math.max(0.05, rel[i + 1] - leave - 0.05));
  return [xs[i] + (xs[i + 1] - xs[i]) * go, TIP_Y + 0.12 * Math.sin(Math.PI * go), 0];
}
/** A drop of indicator falling from the dropper's tip into a tube, until it lands at the flood time (null otherwise). */
export function dropAt(id: Id, t: number): V3 | null {
  const s = storyTime(t), t0 = FLOOD[id] - DROP_FALL;
  if (s < t0 || s >= FLOOD[id]) return null;
  const p = clamp01((s - t0) / DROP_FALL), [x, , z] = glassPos(id, t), land = GLASS.liquid + 0.03;
  return [x, TIP_Y - (TIP_Y - land) * p * p, z];
}

// ---- camera: close on the milk, a pull-back to the row, a punch-in on the answer, the acid end, the base end, back ----
// LX: the wide shots sit a little left of centre, so the rightmost tube's name stays clear of Instagram's buttons
// Each shot's look-at height puts the strip's top edge ~330 px down the page, under the caption (tests)
const DIST = 11, FOV = 30, LX = 0.19, LY = 0.75, MID = 2.42, LY_PUNCH = 1.58, LY_END = 1.63, LY_OPEN_WIDE = 0.95;
const milkX = slotX(byId.milk.slot);
/** The opening's camera: from milk to each tube the dropper visits, arriving just before its drop lands. */
const FOLLOW: Key[] = (() => {
  const after = VISITS.filter(id => FLOOD[id] > 0), keys: Key[] = [];
  for (let i = 1; i < after.length; i++) {
    const t0 = FLOOD[after[i - 1]] + 0.1, arrive = FLOOD[after[i]] - 0.05;
    keys.push({ t: t0, dur: arrive - t0, to: [2.0, slotX(startSlot(after[i])), MID, 0] });
  }
  return keys;
})();
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [2.0, 0, MID, 0],                                          // [zoom, look-at x, look-at y, orbit]: milk and its neighbours
  keys: [
    ...FOLLOW,                                                       // close, following the dropper tube to tube
    { t: 2.3, dur: 0.7, to: [1.0, LX, LY_OPEN_WIDE, 0] },            // the pull-back to the whole rainbow (tops clear of the question)
    { t: 3.0, dur: 3.9, to: [1.03, LX, LY, 0] },                     // a slow push while they sort (and up into place)                      // a slow push while they sort
    { t: 6.95, dur: 0.6, to: [1.9, (milkX + slotX(3)) / 2, LY_PUNCH, 0] },// punch-in on milk and water as milk lands
    { t: 8.2, dur: 0.7, to: [2.0, slotX(1), LY_END, 0] },            // across to the acid end (lemon, soda water)
    { t: 9.6, dur: 0.6, to: [2.0, slotX(5), LY_END, 0] },            // across to the base end (soap, drain cleaner)
    { t: 10.95, dur: 0.5, to: [1.0, LX, LY, 0] },                     // out to the whole chart, settled by 11.45
    { t: REW0, dur: DURATION - REW0, to: [2.0, 0, MID, 0] },         // the rewind takes it back to frame 0
  ],
};
/** The pH strip's top edge on the page (a 3D object: words must not sit on it, tests). */
export const stripTopY = (t: number) => project([0, STRIP.y1, STRIP.z], cameraAt(t), FULL).y;
export function cameraAt(t: number) {
  const [zoom, lx, ly, orbit] = tween(t, CAMERA.start, CAMERA.keys);
  return orbitCamera(zoom, [lx, ly], orbit, DIST, FOV, FULL);
}
/** The picture's outline (F35: it should fill the frame). */
export const heroAt = (t: number): V3[] => MEMBERS.flatMap(m => { const [x, y, z] = glassPos(m.id, t); return [[x - GLASS.r, y, z], [x + GLASS.r, y, z]] as V3[]; });

// ---- colours (F24): the liquids are the indicator's real colours; text keeps the WHITE palette ----
// the dark set (all three panel critics, pass 1: pastel on off-white read as a bar chart; our two best reels glow on dark)
// the answer's highlight is warm white, a colour no liquid uses (Colour, pass 2: amber also read as soda water's orange)
export const COLOURS = { ink: LAB.ink, muted: LAB.muted, board: LAB.board, answer: '#fff4e0' } as const;

// ---- words: every text on screen, placed beside what it names (F35); the page draws exactly these ----
export const CAPTIONS: Caption[] = [
  { t0: 3.75, t1: 5.1, text: 'Each colour means a pH' },
  { t0: 8.9, t1: 9.65, text: 'Below 7: acids' },
  { t0: 10.2, t1: 10.95, text: 'Above 7: bases' },
  { t0: SHEET[0] - 0.35, t1: REW0, text: SHEET_TITLE },
];
export type Kind = 'label' | 'header' | 'chip' | 'nudge' | 'tag' | 'tag2' | 'line' | 'caption' | 'pH' | 'name' | 'q' | 'scale' | 'answer';
export type Text = { name: string; kind: Kind; text: string; size: number; x: number; y: number; alpha: number; box: Box; colour?: string };
const HEAD = { size: 56, chipW: 240, chipH: 76, gap: 22 };
const CAP_Y = 262, LINE_Y = 128, TAG_Y = 186, ANS_Y = 262;
const fade = (t: number, t0: number, t1: number, d = 0.2) => clamp01((t - t0) / d) * clamp01((t1 - t) / d);
/** How big the question is: big on frame 0, one line from T_SHRINK, big again by the end of the rewind (the loop). */
export const bigAt = (t: number) => (t < REW0 ? 1 - prog(t, T_SHRINK, 0.3) : prog(t, DURATION - 0.6, 0.5));
const upAt = (t: number) => (t < REW0 ? prog(t, T_SHRINK + 0.3, 0.4) : 1 - prog(t, REW0 + 0.3, 0.5));
/** Labels on the row leave as the rewind starts. */
const rowWords = (t: number) => (t < REW0 ? 1 : 1 - prog(t, REW0, 0.25));

function at(p: V3, t: number) { return project(p, cameraAt(t), FULL); }
/** A centred block of one or more lines (the textBox rule per line). */
const blockBox = (text: string, size: number, x: number, y: number): Box => {
  const lines = text.split('\n'), w = Math.max(...lines.map(l => [...l].length)) * size * 0.55, h = lines.length * size * 1.3;
  return { x: x - w / 2, y: y - h / 2, w, h };
};
/** Every text on screen at t, with its box (tests: inside Instagram's safe area, no two colliding). */
export function textsAt(t: number): Text[] {
  const out: Text[] = [], add = (x: Omit<Text, 'box'> & { pad?: number; box?: Box; pinned?: boolean }) => {
    const box = x.box ?? textBox(x.text, x.size, x.x, x.y, x.pad ?? 0);
    if (x.alpha <= 0.01 || (x.pinned && !inSafeArea(box))) return;
    const { pad: _pad, pinned: _pinned, ...text } = x;
    out.push({ ...text, box });
  };
  const big = bigAt(t), up = upAt(t), row = rowWords(t);
  add({ name: 'label', kind: 'label', text: LABEL, size: 34, x: 540, y: 116, alpha: big });
  HEADER.forEach((h, i) => add({ name: `header ${i + 1}`, kind: 'header', text: h, size: HEAD.size, x: 540, y: 184 + i * HEAD.size * 1.32, alpha: big }));
  const x0 = 540 - (3 * HEAD.chipW + 2 * HEAD.gap) / 2;
  OPTIONS.forEach((o, i) => add({ name: `chip ${'ABC'[i]}`, kind: 'chip', text: o, size: 42, x: x0 + i * (HEAD.chipW + HEAD.gap) + HEAD.chipW / 2, y: 350, alpha: big,
    box: { x: x0 + i * (HEAD.chipW + HEAD.gap), y: 312, w: HEAD.chipW, h: HEAD.chipH } }));
  add({ name: 'nudge', kind: 'nudge', text: 'comment your guess 👇', size: 32, x: 540, y: 480, alpha: big });
  add({ name: 'question line', kind: 'line', text: SHORT_Q, size: 44, x: 540, y: LINE_Y, alpha: t < REW0 ? prog(t, T_SHRINK + 0.3, 0.3) * (1 - prog(t, SHEET[0] - 0.35, 0.3)) : 0 });
  add({ name: 'tag', kind: 'tag', text: BRAND, size: 30, x: 540, y: 432 + (TAG_Y - 432) * up, alpha: 1 });
  // the strip's three words, above it, on the wide shots only: gone before the answer's punch-in, back once the camera settles on the whole chart
  const wide = t < ANSWER_AT ? 1 - prog(t, ANSWER_AT - 0.3, 0.2) : prog(t, SHEET[0] - 0.25, 0.2);
  const sIn = stripIn(t) * row * wide;
  for (const [name, pH] of [['acid', 2.5], ['neutral', 7], ['base', 11.5]] as const) {
    const p = at([stripX(pH), STRIP.y1, STRIP.z], t);
    add({ name, kind: 'scale', text: name === 'neutral' ? '7 neutral' : name, size: 30, x: p.x, y: p.y - 30, alpha: sIn * clamp01((storyTime(t) - STRIP_LOCK) / 0.2), pinned: true });   // once it has locked (the tag has risen past)
  }
  // each tube: its pH above, its name below, once it has landed
  for (const m of MEMBERS) {
    const [x, y, z] = glassPos(m.id, t), top = at([x, y + GLASS.h, z], t), foot = at([x, y, z + GLASS.r], t);
    const shown = row * clamp01((storyTime(t) - LANDS[m.id]) / 0.2);
    const pSize = m.id === 'milk' ? 44 : 38;
    add({ name: `pH ${m.id}`, kind: 'pH', text: `pH ${m.pH}`, size: pSize, x: top.x, y: top.y - 38, pad: 10, alpha: shown, pinned: true, colour: m.id === 'milk' ? COLOURS.answer : undefined });
    const label = m.name.replace(' ', '\n');                        // two words on two lines, like a label on a tube
    add({ name: `name ${m.id}`, kind: 'name', text: label, size: 36, x: foot.x, y: foot.y + 66, alpha: shown, pinned: true, box: blockBox(label, 36, foot.x, foot.y + 66) });
  }
  // milk's tag, from frame 0 until the question shrinks (and back for the loop): the question is about it
  const mk = glassPos('milk', t), mOn = at([mk[0], mk[1] + GLASS.liquid - TAG_DY, mk[2] + GLASS.r], t);
  add({ name: 'milk tag', kind: 'tag2', text: 'milk', size: 40, x: mOn.x, y: mOn.y, pad: 14, alpha: bigAt(t), pinned: true });
  // milk hovers with a question mark until it lands
  const milk = glassPos('milk', t), mTop = at([milk[0], milk[1] + GLASS.h, milk[2]], t);
  add({ name: 'pH milk?', kind: 'q', text: '?', size: 84, x: mTop.x, y: mTop.y - 46, alpha: row * fade(storyTime(t), T_MOVED, ANSWER_AT, 0.15), pinned: true });
  // the answer: the right option lights where the caption goes, once the punch-in has landed (mid-move, the strip
  // passes through that height); milk's own pH pops the moment it lands
  add({ name: 'answer', kind: 'answer', text: OPTIONS[ANSWER], size: 52, x: 540, y: ANS_Y, pad: 30, alpha: fade(t, ANSWER_LIT, CAPTIONS[1].t0) });
  const cap = CAPTIONS.find(c => t >= c.t0 && t < c.t1);
  if (cap) add({ name: 'caption', kind: 'caption', text: cap.text, size: 46, x: 540, y: CAP_Y, pad: 28,
    alpha: cap.text === SHEET_TITLE ? clamp01((t - cap.t0) / 0.3) * clamp01((cap.t1 + 0.25 - t) / 0.25) : fade(t, cap.t0, cap.t1) });
  return out;
}

// ---- sound ----
export const MUSIC_HITS = [ANSWER_AT, SHEET[0]];
/** The music's level (0–1, F16, Sound critic): full, dipped 4–5 dB only under the strip's snap, the landings and the
 *  answer's thunk, and faded at the loop seam. (Lowering it all over, so its routine beats sat under the reveals, put the
 *  effects level with it, against F16.) */
const LEVEL: [number, number][] = [
  [0, 1], [3.45, 1], [3.55, 0.55], [3.8, 0.55], [3.95, 1],
  [4.85, 1], [4.95, 0.6], [6.6, 0.6], [6.9, 0.55], [ANSWER_AT + 0.12, 0.55], [ANSWER_AT + 0.3, 1],
  [REW0, 1], [DURATION - 0.45, 0.8], [DURATION, 0.1],
];
export const musicLevel = (t: number) => {
  const i = LEVEL.findIndex(([t1]) => t1 >= t);
  if (i <= 0) return LEVEL[Math.max(0, i)][1];
  const [t0, v0] = LEVEL[i - 1], [t1, v1] = LEVEL[i];
  return t1 === t0 ? v1 : v0 + (v1 - v0) * (t - t0) / (t1 - t0);
};
/** The camera's whooshes, the one on the answer's punch-in held down so the thunk punches through. */
const camWhooshes = whooshesFor(CAMERA.start, CAMERA.keys).map(h => (Math.abs(h.t - ANSWER_AT) < 0.3 ? { ...h, gain: 0.12 } : h));
const pitchOf = (pH: number) => 0.8 + pH * 0.12;                   // landings climb in pitch from acid to base
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...MEMBERS.filter(m => FLOOD[m.id] >= 0).map(m => ({ kind: 'tap' as const, t: FLOOD[m.id], gain: m.id === 'milk' ? 0.55 : 0.36, pitch: 1.6 + 0.12 * startSlot(m.id) } as Hit)),
    { kind: 'thunk' as const, t: FLOOD.milk, gain: 0.2, pitch: 1.6 },                  // a body under the first drop
    { kind: 'shimmer' as const, t: FLOOD.milk, gain: 0.24 },
    { kind: 'shimmer' as const, t: STRIP_IN, gain: 0.2 },
    { kind: 'snap' as const, t: STRIP_LOCK, gain: 0.4 },
    { kind: 'whoosh-in' as const, t: T_LIFT + 0.1, gain: 0.15 },                         // the tubes lift
    ...MEMBERS.filter(m => m.id !== 'milk').map(m => ({ kind: 'tap' as const, t: LANDS[m.id], gain: 0.48, pitch: pitchOf(m.pH) } as Hit)),
    { kind: 'thunk' as const, t: ANSWER_AT, gain: 0.5 },
    { kind: 'tap' as const, t: ANSWER_LIT, gain: 0.35, pitch: 3.2 },                    // a bright tick as "A acidic" lights
    { kind: 'whoosh-out' as const, t: 9.95, gain: 0.18 },                                // across to the base end, like the acid end
    { kind: 'shimmer' as const, t: REW0, gain: 0.15 },
    ...camWhooshes,
  ].sort((a, b) => a.t - b.t),
  beds: [],
  music: musicLevel,
};
