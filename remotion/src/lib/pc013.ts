// @pyqvault_ · Chemistry, visualised #13 (2026-10-26, framework v1.34): add NaOH to iron(III) chloride: the cloud is white,
// blue or rust-brown? Rust-brown. Idea C49 ("Hydroxide clouds"). Hook: Pick one · Opening: Race running (frame 0: a
// dropper over the aluminium tube, a drop already falling; a white cloud blooms at 0.15 s, then copper's blue and
// iron(II)'s dirty green as the camera follows the dropper, F37). Iron(III) waits under a "?" until the answer. After it,
// more NaOH into the aluminium tube and its white cloud dissolves (amphoteric: a classic exam point, and something to
// watch after the answer, L62). The third F39 reel (made to send): the salt-analysis table, every ion with its hydroxide and
// colour, held still as a cheat sheet; then a rewind to frame 0 (F27). Dark set, rack of test tubes (as Chemistry #12).
//
// The chemistry (F10), NCERT Class 12 practical (salt analysis, cations): Al³⁺ + 3OH⁻ → Al(OH)₃, white and gelatinous,
// dissolving in excess NaOH as colourless aluminate [Al(OH)₄]⁻ · Cu²⁺ + 2OH⁻ → Cu(OH)₂, pale blue · Fe²⁺ + 2OH⁻ →
// Fe(OH)₂, dirty green (it browns slowly in air) · Fe³⁺ + 3OH⁻ → Fe(OH)₃, rust-brown. The solutions keep their own colours
// (copper sulphate blue, iron(II) sulphate pale green, iron(III) chloride yellow-brown, aluminium sulphate clear) and fade
// as the metal leaves them in the precipitate. Settling is sped up (said in the caption).
//
// BEAT TABLE (runbook step 1)
// | time           | what moves                                                            | text (beside what it names)      | keep in frame   |
// | 0–0.08 s HOOK  | dark set, close on the aluminium tube (truly clear); a dropper over   | the question, A/B/C, tag (big)   | the Al tube     |
// |                | it, a drop already halfway down                                       |                                  |                 |
// | 0.08 s         | a white cloud blooms down the tube, specks falling (tap, whump)       |                                  |                 |
// | 0.7, 1.3 s     | the camera follows the dropper: copper's blue cloud, iron(II)'s dirty |                                  | each tube as    |
// |                | olive-green (tap, whump each); then the dropper leaves (off screen)   |                                  | its drop lands  |
// | 2.2–2.9 s      | the pull-back to the whole rack (whoosh); the clouds settling         |                                  | the rack        |
// | 3.0 s          | the question shrinks (F35) (tick)                                     | "Iron(III): white, blue or brown?"|                |
// | 3.7 s          | each tube's colour, ion and hydroxide appear; "?" over iron(III)      | white · blue · dirty green · ?   |                 |
// | 3.3–3.75 s     |                                                                       | One drop of NaOH each            |                 |
// | 3.4–4.3 s      | close on iron(III); once settled, the dropper slides in over it       |                                  | the Fe³⁺ tube   |
// | 4.6 s ANSWER   | its drop lands: a rust-brown cloud blooms (thunk, whump, music hit);  | rust-brown; "C rust-brown" at    | the Fe³⁺ tube   |
// |                | a slow push                                                           | 5.1 s                            |                 |
// | 5.4–5.9 s      | across to aluminium (whoosh); the dropper comes back down             |                                  | the Al tube     |
// | 6.25–6.85 s    | three more drops (tap, whump each; the music dips): the first stirs   |                                  | the whole Al    |
// |                | the white layer back up, each thins it by a third: clear (shimmer)    | white → clear                    | tube            |
// | 7.0–7.6 s      | the dropper gone                                                      | Al(OH)₃ dissolves in excess NaOH |                 |
// | 7.6–8.1 s      | out to the whole rack (whoosh)                                        |                                  | the rack        |
// | 8.3–10.5 s     | THE CHEAT SHEET (F39): everything still                               | Salt analysis: hydroxide colours | the rack        |
// | 10.5–12.1 s    | the rewind (shimmer, whoosh): clouds lift and vanish, the dropper     | the question returns big         | → the Al tube   |
// |                | flies back                                                            |                                  |                 |
import { clamp01, prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { LAB } from './palette.ts';
import { orbitCamera, project, type V3 } from './inductionScene.ts';
import { FULL, inSafeArea, textBox, type Box } from './layout.ts';

export const DURATION = 12.1, REW0 = 10.5;
export const T_SHRINK = 3.0, ANSWER_AT = 4.6, ANSWER_LIT = 5.1, COVER_T = 2.85;
export const SHEET: [number, number] = [8.3, REW0];                 // 2.2 s: four ions, their formulas and colours
export const LABEL = 'CHEMISTRY, VISUALISED  #13';
export const HEADER = ['Add NaOH to iron(III) chloride.', 'The cloud is…'];
export const OPTIONS = ['A  white', 'B  blue', 'C  rust-brown'], ANSWER = 2;
export const SHORT_Q = 'Iron(III): white, blue or brown?';
export const BRAND = 'PYQ Vault · pyqvault.com';
export const SHEET_TITLE = 'Salt analysis: hydroxide colours';

// ---- the chemistry ----
export type Id = 'al' | 'cu' | 'fe2' | 'fe3';
export type Member = { id: Id; ion: string; hydroxide: string; colourName: string; solution: string; cloud: string; amphoteric?: boolean };
export const MEMBERS: Member[] = [
  { id: 'al', ion: 'Al³⁺', hydroxide: 'Al(OH)₃', colourName: 'white', solution: '#2c3c47', cloud: '#f4f6f8', amphoteric: true },
  { id: 'cu', ion: 'Cu²⁺', hydroxide: 'Cu(OH)₂', colourName: 'blue', solution: '#2f80d8', cloud: '#5aa2ea' },
  { id: 'fe2', ion: 'Fe²⁺', hydroxide: 'Fe(OH)₂', colourName: 'dirty green', solution: '#dcefcb', cloud: '#4b5a35' },
  { id: 'fe3', ion: 'Fe³⁺', hydroxide: 'Fe(OH)₃', colourName: 'rust-brown', solution: '#d8c46e', cloud: '#6e2d12' }   // burnt sienna, not orange (panel pass 2),
];
const byId = Object.fromEntries(MEMBERS.map((m, i) => [m.id, { ...m, slot: i }])) as Record<Id, Member & { slot: number }>;
const CLEAR = '#2c3c47';                                            // clear: the dark set shows through                                            // a clear liquid on the dark set (lighter read as milk)
const hex = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, p: number) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * p).toString(16).padStart(2, '0')).join('');

// ---- story time: runs with t, then back to 0 over the rewind (F27) ----
export function storyTime(t: number) {
  if (t < REW0) return t;
  const p = clamp01((t - REW0) / (DURATION - REW0));
  return REW0 * (1 - (1 - (1 - p) * (1 - p)));                     // ease-out: it starts moving at once (panel pass 2)
}

// ---- the drops and the clouds ----
export const DROPS: Record<Id, number> = { al: 0.08, cu: 0.7, fe2: 1.3, fe3: ANSWER_AT };   // the first lands in frames 2–3
export const EXCESS = [6.25, 6.55, 6.85];                              // more NaOH into the aluminium tube
const DROP_FALL = 0.25, BLOOM = 0.6, SETTLE = 2.5;
export type Cloud = { amount: number; settle: number };
/** How much of the tube's precipitate there is (0–1) and how far it has settled to the bottom (0–1). */
export function cloudAt(id: Id, t: number): Cloud {
  const s = storyTime(t), d = DROPS[id];
  let amount = prog(s, d, BLOOM), settle = prog(s, d + 0.8, SETTLE);
  if (id === 'al') {
    // the excess stirs the white layer back up through the tube, then each drop dissolves a third of it (aluminate is
    // colourless): three steps you can see (panel pass 2: settled at the bottom, the dissolving was off screen)
    settle *= 1 - prog(s, EXCESS[0], 0.3);
    amount *= 1 - EXCESS.reduce((a, e) => a + prog(s, e + 0.05, 0.35), 0) / EXCESS.length;
  }
  return { amount, settle };
}
/** The solution's colour: its own, fading towards clear as the metal leaves it in the precipitate. */
export const liquidColour = (id: Id, t: number) => mix(byId[id].solution, CLEAR, 0.8 * cloudAt(id, t).settle * (id === 'al' ? 0 : 1));

// ---- the rack (scene units; the floor at y = 0) ----
export const GLASS = { r: 0.12, h: 2.0, liquid: 1.5 } as const;
const DX = 0.55;
export const tubeX = (id: Id) => (byId[id].slot - 1.5) * DX;
export const TIP_Y = GLASS.h + 0.22;
/** The dropper's tip: over aluminium, copper, iron(II), then hovering over iron(III) (bobbing) until the answer; then
 *  back to aluminium for the excess, then it lifts away. */
// it leaves and comes back sideways at its own height, so it never crosses the words at the top (panel pass 1)
const OFF = 3.0;
const DROPPER: { start: number[]; keys: Key[] } = {
  start: [tubeX('al'), TIP_Y],
  keys: [
    { t: 0.12, dur: 0.33, to: [tubeX('cu'), TIP_Y] },
    { t: 0.72, dur: 0.33, to: [tubeX('fe2'), TIP_Y] },
    { t: 1.34, dur: 0.75, to: [OFF, TIP_Y] },                        // off to the right after the third drop
    { t: 4.0, dur: 0.3, to: [tubeX('fe3'), TIP_Y] },                // back in once the camera has settled, for the answer
    { t: 4.65, dur: 0.35, to: [OFF, TIP_Y] },
    { t: 5.0, dur: 0.02, to: [-OFF, TIP_Y] },                         // (off screen) round to the left
    { t: 5.75, dur: 0.25, to: [tubeX('al'), TIP_Y] },               // into the aluminium shot for the excess, once the camera has landed
    { t: 6.9, dur: 0.35, to: [-OFF, TIP_Y] },
  ],
};
export function dropperAt(t: number): V3 | null {
  const s = storyTime(t), [x, y] = tween(s, DROPPER.start, DROPPER.keys);
  if (Math.abs(x) > 2.6) return null;
  return [x, y, 0];
}
/** A drop falling from the dropper's tip into a tube's mouth, until it lands (null otherwise). */
export function dropAt(id: Id, t: number): V3 | null {
  const s = storyTime(t), times = id === 'al' ? [DROPS.al, ...EXCESS] : [DROPS[id]];
  for (const d of times) if (s >= d - DROP_FALL && s < d) {
    const p = (s - (d - DROP_FALL)) / DROP_FALL, land = GLASS.liquid + 0.03;
    return [tubeX(id), TIP_Y - (TIP_Y - land) * p * p, 0];
  }
  return null;
}

// ---- camera: close on aluminium, following the dropper, a pull-back, a push, a punch-in on the answer, aluminium, out ----
// LXW: the wide shots sit a little left, so iron(III)'s labels stay clear of Instagram's buttons
const DIST = 11, FOV = 30, MID = 2.3, LY_OW = 1.09, LY = 0.79, LY_CLOSE = 1.8, ZW = 1.35, LXW = 0.08;   // LY_CLOSE: the dropper below the words
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [2.0, tubeX('al'), MID, 0],                                // [zoom, look-at x, look-at y, orbit]: close on aluminium
  keys: [
    { t: 0, dur: 0.2, to: [2.04, tubeX('al'), MID - 0.02, 0] },      // a slow push from frame 0 (no still frames, F5)
    { t: 0.2, dur: 0.6, to: [2.0, tubeX('cu'), MID, 0] },            // follow the dropper to copper, without stopping
    { t: 0.8, dur: 0.55, to: [2.0, tubeX('fe2'), MID, 0] },          // and on to iron(II)
    { t: 1.35, dur: 0.85, to: [2.0, (tubeX('fe2') + tubeX('fe3')) / 2, MID, 0] },  // drifting on as the dropper leaves
    { t: 2.2, dur: 0.7, to: [ZW, LXW, LY_OW, 0] },                     // the pull-back to the rack (tube tops clear of the question)
    { t: 2.9, dur: 0.85, to: [ZW + 0.05, LXW, LY, 0] },                // a slow push while they settle
    { t: 3.4, dur: 0.55, to: [2.1, tubeX('fe3'), LY_CLOSE, 0] },     // close on iron(III), settled before the dropper comes in
    { t: 3.95, dur: 1.4, to: [2.2, tubeX('fe3'), LY_CLOSE, 0] },     // a slow push through the answer
    { t: 5.25, dur: 0.5, to: [1.5, tubeX('al'), 1.4, 0] },            // across to aluminium: the whole tube and the dropper in shot
    { t: 7.6, dur: 0.5, to: [ZW, LXW, LY, 0] },                        // out to the whole rack
    { t: REW0, dur: DURATION - REW0, to: [2.0, tubeX('al'), MID, 0] },
  ],
};
export function cameraAt(t: number) {
  const [zoom, lx, ly, orbit] = tween(t, CAMERA.start, CAMERA.keys);
  return orbitCamera(zoom, [lx, ly], orbit, DIST, FOV, FULL);
}
export const heroAt = (_t: number): V3[] => MEMBERS.flatMap(m => [[tubeX(m.id) - GLASS.r, 0, 0], [tubeX(m.id) + GLASS.r, 0, 0]] as V3[]);

export const COLOURS = { ink: LAB.ink, muted: LAB.muted, board: LAB.board, answer: '#fff4e0' } as const;

// ---- words ----
export const CAPTIONS: Caption[] = [
  { t0: 3.72, t1: 4.3, text: 'One drop of NaOH each' },
  { t0: 7.0, t1: 7.6, text: 'Al(OH)₃ dissolves in excess NaOH' },
  { t0: SHEET[0] - 0.35, t1: REW0, text: SHEET_TITLE },
];
export type Kind = 'label' | 'header' | 'chip' | 'nudge' | 'tag' | 'line' | 'caption' | 'colour' | 'ion' | 'hydroxide' | 'note' | 'q' | 'answer';
export type Text = { name: string; kind: Kind; text: string; size: number; x: number; y: number; alpha: number; box: Box; colour?: string };
const HEAD = { size: 56, chipW: 300, chipH: 76, gap: 16 };       // "C  rust-brown" fits (panel pass 1)
const CAP_Y = 262, LINE_Y = 128, TAG_Y = 186;
const fade = (t: number, t0: number, t1: number, d = 0.2) => clamp01((t - t0) / d) * clamp01((t1 - t) / d);
export const bigAt = (t: number) => (t < REW0 ? 1 - prog(t, T_SHRINK, 0.3) : prog(t, DURATION - 0.6, 0.5));
const upAt = (t: number) => (t < REW0 ? prog(t, T_SHRINK + 0.3, 0.4) : 1 - prog(t, REW0 + 0.3, 0.5));
const rowWords = (t: number) => (t < REW0 ? 1 : 1 - prog(t, REW0, 0.25));

function at(p: V3, t: number) { return project(p, cameraAt(t), FULL); }
export function textsAt(t: number): Text[] {
  const out: Text[] = [], add = (x: Omit<Text, 'box'> & { pad?: number; box?: Box; pinned?: boolean }) => {
    const box = x.box ?? textBox(x.text, x.size, x.x, x.y, x.pad ?? 0);
    if (x.alpha <= 0.01 || (x.pinned && !inSafeArea(box))) return;
    const { pad: _pad, pinned: _pinned, ...text } = x;
    out.push({ ...text, box });
  };
  const big = bigAt(t), up = upAt(t), row = rowWords(t), s = storyTime(t);
  add({ name: 'label', kind: 'label', text: LABEL, size: 34, x: 540, y: 116, alpha: big });
  HEADER.forEach((h, i) => add({ name: `header ${i + 1}`, kind: 'header', text: h, size: HEAD.size, x: 540, y: 184 + i * HEAD.size * 1.32, alpha: big }));
  const x0 = 540 - (3 * HEAD.chipW + 2 * HEAD.gap) / 2;
  OPTIONS.forEach((o, i) => add({ name: `chip ${'ABC'[i]}`, kind: 'chip', text: o, size: 38, x: x0 + i * (HEAD.chipW + HEAD.gap) + HEAD.chipW / 2, y: 350, alpha: big,
    box: { x: x0 + i * (HEAD.chipW + HEAD.gap), y: 312, w: HEAD.chipW, h: HEAD.chipH } }));
  add({ name: 'nudge', kind: 'nudge', text: 'comment your guess 👇', size: 32, x: 540, y: 480, alpha: big });
  add({ name: 'question line', kind: 'line', text: SHORT_Q, size: 44, x: 540, y: LINE_Y, alpha: t < REW0 ? prog(t, T_SHRINK + 0.3, 0.3) * (1 - prog(t, SHEET[0] - 0.35, 0.3)) : 0 });
  add({ name: 'tag', kind: 'tag', text: BRAND, size: 30, x: 540, y: 432 + (TAG_Y - 432) * up, alpha: 1 });
  const words = row * prog(s, T_SHRINK + 0.7, 0.2);                 // once the tag has risen past
  for (const m of MEMBERS) {
    const x = tubeX(m.id), top = at([x, GLASS.h, 0], t), foot = at([x, 0, GLASS.r], t), c = cloudAt(m.id, t);
    // the colour, over the tube once its cloud has formed; iron(III) shows "?" until the answer
    const colour = m.id === 'fe3' && s < ANSWER_AT ? '?' : m.id === 'al' && s >= EXCESS[2] + 0.4 ? 'white → clear' : c.amount > 0.5 || (m.id === 'al' && s >= EXCESS[0]) ? m.colourName : '';
    if (colour) add({ name: `colour ${m.id}`, kind: colour === '?' ? 'q' : 'colour', text: colour, size: colour === '?' ? 72 : 34, x: top.x, y: top.y - 44, pad: colour === '?' ? 0 : 12,
      alpha: words, pinned: true, colour: colour === '?' ? COLOURS.answer : m.cloud });
    // its ion and hydroxide under it, together or not at all
    const lines = [
      { name: `ion ${m.id}`, kind: 'ion' as const, text: m.ion, size: 52, y: foot.y + 52 },
      { name: `hydroxide ${m.id}`, kind: 'hydroxide' as const, text: m.hydroxide, size: 44, y: foot.y + 122 },
    ];
    if (lines.every(l => inSafeArea(textBox(l.text, l.size, foot.x, l.y)))) for (const l of lines) add({ ...l, x: foot.x, alpha: words });
    if (m.amphoteric && s >= EXCESS[0] + 0.8) {
      const note = 'dissolves\nin excess', y = foot.y + 204, lines = note.split('\n'), w = Math.max(...lines.map(l => [...l].length)) * 36 * 0.55, h = lines.length * 36 * 1.3;
      add({ name: `note ${m.id}`, kind: 'note', text: note, size: 36, x: foot.x, y, alpha: words * prog(s, EXCESS[0] + 0.8, 0.3), pinned: true, box: { x: foot.x - w / 2, y: y - h / 2, w, h } });
    }
  }
  add({ name: 'answer', kind: 'answer', text: OPTIONS[ANSWER], size: 52, x: 540, y: CAP_Y, pad: 30, alpha: fade(t, ANSWER_LIT, CAPTIONS[1].t0) });
  const cap = CAPTIONS.find(c => t >= c.t0 && t < c.t1);
  if (cap) add({ name: 'caption', kind: 'caption', text: cap.text, size: 46, x: 540, y: CAP_Y, pad: 28,
    alpha: cap.text === SHEET_TITLE ? clamp01((t - cap.t0) / 0.3) * clamp01((cap.t1 + 0.25 - t) / 0.25) : fade(t, cap.t0, cap.t1) });
  return out;
}

// ---- sound ----
export const MUSIC_HITS = [ANSWER_AT, SHEET[0]];
/** The music's level (F16): full, dipped ~5 dB under the opening drops and the answer's thunk. */
const LEVEL: [number, number][] = [
  [0, 1], ...(['al', 'cu', 'fe2'] as Id[]).flatMap(id => [[Math.max(0, DROPS[id] - 0.05), 1], [DROPS[id], 0.65], [DROPS[id] + 0.25, 0.65], [DROPS[id] + 0.45, 1]] as [number, number][]),
  [ANSWER_AT - 0.05, 1], [ANSWER_AT, 0.55], [ANSWER_AT + 0.12, 0.55], [ANSWER_AT + 0.3, 1],
  [EXCESS[0] - 0.1, 1], [EXCESS[0], 0.55], [EXCESS[2] + 0.25, 0.55], [EXCESS[2] + 0.45, 1],
  [SHEET[0] - 0.2, 1], [SHEET[0], 0.75], [SHEET[0] + 0.6, 0.75], [SHEET[0] + 0.9, 1],
  [DURATION, 1],
];
export const musicLevel = (t: number) => {
  const i = LEVEL.findIndex(([t1]) => t1 >= t);
  if (i <= 0) return LEVEL[Math.max(0, i)][1];
  const [t0, v0] = LEVEL[i - 1], [t1, v1] = LEVEL[i];
  return t1 === t0 ? v1 : v0 + (v1 - v0) * (t - t0) / (t1 - t0);
};
// the camera's whooshes on its real zooms only (a drift's whoosh took the first drop's weight, Sound pass 1; two pushes at
// 3.3 and 3.5 s stacked into a flam, Sound pass 2)
const zooms = [CAMERA.start[0], ...CAMERA.keys.map(k => k.to[0])];
const camWhooshes = whooshesFor(CAMERA.start, CAMERA.keys.filter((k, i) => Math.abs(k.to[0] - zooms[i]) >= 0.12))
  .filter(h => h.t > 0.3).map(h => (Math.abs(h.t - ANSWER_AT) < 0.6 ? { ...h, gain: 0.12 } : { ...h, gain: Math.min(h.gain, 0.28) }));
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...MEMBERS.map((m, i) => ({ kind: 'tap' as const, t: DROPS[m.id], gain: m.id === 'al' ? 0.75 : m.id === 'fe3' ? 0.25 : 0.4, pitch: 1.6 + 0.15 * i } as Hit)),
    ...(['al', 'cu', 'fe2'] as Id[]).map(id => ({ kind: 'whump' as const, t: DROPS[id] + 0.03, gain: id === 'al' ? 0.45 : 0.3 } as Hit)),
    { kind: 'tap' as const, t: T_SHRINK + 0.7, gain: 0.35, pitch: 2.6 },                // the labels and the "?" arrive
    { kind: 'thunk' as const, t: ANSWER_AT, gain: 0.55 },
    { kind: 'whump' as const, t: ANSWER_AT + 0.03, gain: 0.35 },
    { kind: 'tap' as const, t: ANSWER_LIT, gain: 0.35, pitch: 3.2 },
    ...EXCESS.flatMap((t, i) => [{ kind: 'tap' as const, t, gain: 0.6 - 0.1 * i, pitch: 1.5 + 0.15 * i }, { kind: 'whump' as const, t: t + 0.03, gain: 0.2 }] as Hit[]),   // thinning
    { kind: 'whoosh-out' as const, t: 5.3, gain: 0.2 },                                // across (and back) to aluminium
    { kind: 'shimmer' as const, t: EXCESS[0] + 0.9, gain: 0.26 },                   // the white cloud clearing
    { kind: 'shimmer' as const, t: REW0, gain: 0.3 },
    { kind: 'tap' as const, t: DURATION - 0.15, gain: 0.25, pitch: 2.0 },              // back in place, just before the loop
    { kind: 'whoosh-out' as const, t: REW0 + 0.3, gain: 0.22 },                     // the rewind's flight back
    ...camWhooshes,
  ].sort((a, b) => a.t - b.t),
  beds: [],
  music: musicLevel,
};
