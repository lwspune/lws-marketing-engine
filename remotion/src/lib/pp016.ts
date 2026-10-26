// @pyqvault_ · Physics, visualised #16 (2026-10-26, framework v1.34): your TV remote talks to the TV with radio, infrared
// or sound? Infrared. Idea P74 ("One spectrum"). Hook: Everyday puzzle · Opening: close on a TV remote on the dark set; its
// button is pressed and a burst of (invisible, drawn) light leaves its LED at 0.2 s, then every 0.6 s (flicking channels), then it flies
// up as the camera pulls back (2.2–3.0 s, F37). The second F39 reel (made to send): the payoff is the whole
// electromagnetic spectrum, seven bands with their uses and NCERT's wavelength ranges, held still as a cheat sheet; then a
// rewind takes it all back to frame 0 (F27 loop). Full frame (F35) on the dark set (Chemistry #11 and #12).
//
// The physics (F10): NCERT Class 12, Electromagnetic Waves, Table 8.1: radio > 0.1 m · microwave 0.1 m – 1 mm · infrared
// 1 mm – 700 nm · visible 700 – 400 nm · ultraviolet 400 nm – 1 nm · X-rays 1 nm – 10⁻³ nm · gamma < 10⁻³ nm; one kind of
// wave, shorter down the list, each photon carrying more energy. TV remotes use infrared (an LED near 940 nm; NCERT names
// remote switches of household electronics as an infrared use). Sound is not on the list: it is not light. Many phone
// cameras pick up the near-infrared flash as a faint violet-white light (their sensors see a little past red; some rear
// cameras filter it out, so "many", said in the caption). The waves are drawn shorter row by row; the real ratio spans
// 10¹⁵, so the drawing only keeps the order (said in the caption). Infrared is invisible: the burst is drawn.
//
// BEAT TABLE (runbook step 1)
// | time           | what moves                                                            | text (beside what it names)      | keep in frame   |
// | 0–0.1 s HOOK   | dark set, close on a TV remote (number pad, coloured buttons, an IR   | the question, A/B/C, tag (big)   | the remote, the |
// |                | window), tipped to the camera; a TV behind it                         |                                  | TV              |
// | 0.1 s          | the LED fires: bright coral rings and a wave fly at the TV (click);   |                                  |                 |
// |                | the TV changes channel (tap)                                          |                                  |                 |
// | 0.7, 1.3, 1.9 s| more presses, flicking channels: a burst and a new channel each; the  |                                  |                 |
// |                | remote turning slowly as it fires                                     |                                  |                 |
// | 2.2–3.0 s      | the remote flies up to the right as the camera pulls back (whoosh);   |                                  | → the ladder    |
// |                | the TV fades                                                          |                                  |                 |
// | 3.0 s          | the question shrinks to one line (F35); the first row appears        | "Remote: radio, infrared or sound?"|               |
// | 3.02–5.82 s    | the ladder builds, top to bottom, one row every 0.4 s (tap, rising):  | each row's name, use and range;  | the ladder      |
// |                | its wave (shorter each row) and its object: a radio tower, an oven,   | infrared's use is "?"            |                 |
// |                | an empty slot, a prism, the sun, an X-ray film, a nucleus             | One kind of wave, squeezed tighter|                |
// | 3.0–6.3 s      | the remote hovers right, between radio and microwave (the cover, 6.28)| ? (over the remote)              |                 |
// | 6.3–7.0 s      | it tries radio's row (up), then microwave's: no match (clang each);   |                                  |                 |
// |                | microwave's (clang); infrared's does                                  |                                  |                 |
// | 7.0 s ANSWER   | it docks hard in infrared's slot (overshoot, settle), the row glows,  | infrared: TV remotes; "B infrared"| the IR row     |
// |                | the others dim (thunk, music hit); a modest punch-in                 | lights at 7.5 s                  |                 |
// | 7.8–9.4 s      | close (whoosh): a phone slides in beside the remote; on its lit       | Many phone cameras can see it    | remote + phone  |
// |                | camera screen, the remote's LED glows violet-white                    |                                  |                 |
// | 9.4–10.0 s     | zoom out (whoosh)                                                     |                                  | the ladder      |
// | 10.1–11.4 s    | a fat bright pulse runs down the waves, top to bottom (taps rising)   | Shorter wave, more energy        | the ladder      |
// | 11.8–13.65 s   | THE CHEAT SHEET (F39): everything still                               | The EM spectrum: radio to gamma  | the ladder      |
// | 13.65–15.25 s  | the rewind (shimmer): rows fold away, the remote flies back           | the question returns big         | → the remote    |
import { clamp01, ease, prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import { LAB } from './palette.ts';
import { orbitCamera, project, type V3 } from './inductionScene.ts';
import { FULL, inSafeArea, textBox, type Box } from './layout.ts';

export const DURATION = 15.25, REW0 = 13.65;
export const T_SHRINK = 3.0, ANSWER_AT = 7.0, ANSWER_LIT = 7.5, COVER_T = 6.28;
export const SHEET: [number, number] = [11.8, REW0];
export const LABEL = 'PHYSICS, VISUALISED  #16';
export const HEADER = ['Your TV remote talks', 'to the TV with…'];
export const OPTIONS = ['A  radio', 'B  infrared', 'C  sound'], ANSWER = 1;
export const SHORT_Q = 'Remote: radio, infrared or sound?';
export const BRAND = 'PYQ Vault · pyqvault.com';
export const SHEET_TITLE = 'The EM spectrum: radio to gamma';

// ---- the bands (NCERT Class 12, Table 8.1); lambda is the drawn wavelength (scene units), only its order is real ----
export type Band = { name: string; use: string; range: string; lambda: number; colour: string };
export const BANDS: Band[] = [
  { name: 'radio', use: 'radio, TV', range: '> 0.1 m', lambda: 1.25, colour: '#facc15' },
  { name: 'microwave', use: 'radar, ovens', range: '0.1 m – 1 mm', lambda: 0.62, colour: '#fb923c' },
  { name: 'infrared', use: 'TV remotes', range: '1 mm – 700 nm', lambda: 0.31, colour: '#ef4444' },
  { name: 'visible', use: 'what we see', range: '700 – 400 nm', lambda: 0.16, colour: '#ffffff' },
  { name: 'ultraviolet', use: 'sterilising', range: '400 nm – 1 nm', lambda: 0.085, colour: '#a78bfa' },
  { name: 'X-ray', use: 'bone scans', range: '1 nm – 10⁻³ nm', lambda: 0.045, colour: '#67e8f9' },
  { name: 'gamma', use: 'cancer therapy', range: '< 10⁻³ nm', lambda: 0.024, colour: '#4ade80' },
];
const IR = 2;
export const REMOTE_WAVE = BANDS[IR].lambda;

// ---- story time: runs with t, then back to 0 over the rewind, so the last frame is frame 0 (F27) ----
export function storyTime(t: number) {
  if (t < REW0) return t;
  return REW0 * (1 - ease(clamp01((t - REW0) / (DURATION - REW0))));
}

// ---- the ladder (scene units; rows in the plane z = 0) ----
export const ROW_Y = BANDS.map((_, i) => 1.68 - i * 0.54);       // the last row's labels clear the cover's pill
export const LABEL_X = -0.95, ICON_X = 1.05;
export const WAVE_X: [number, number] = [-0.55, 0.7];
export const ROW_SHOWN = BANDS.map((_, i) => 3.02 + 0.4 * i);       // the ladder starts as the question shrinks (no dead gap)
export const rowIn = (i: number, t: number) => prog(storyTime(t), ROW_SHOWN[i], 0.4);
/** The bright pulse running down the waves after the answer (0–1 per row). */
export const SWEEP = BANDS.map((_, i) => 10.1 + 0.17 * i);
export const sweepAt = (i: number, t: number) => { const d = storyTime(t) - SWEEP[i]; return d < 0 || d > 0.5 ? 0 : Math.sin(Math.PI * d / 0.5); };

// ---- the remote: close at frame 0, flies up, hovers, comes down the ladder, docks in infrared's slot ----
export const PRESSES = [0.1, 0.7, 1.3, 1.9];                      // flicking channels: a burst every 0.6 s, the first in the first frames (F37)
const P_OPEN: V3 = [0, 0.15, 0.6], HOVER: V3 = [ICON_X, (ROW_Y[0] + ROW_Y[1]) / 2, 0.45];   // between radio and microwave, clear of the caption
const lerp3 = (a: V3, b: V3, p: number): V3 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
const PATH: { t: number; dur: number; to: V3 }[] = [
  { t: 2.2, dur: 0.8, to: HOVER },
  { t: 6.3, dur: 0.2, to: [ICON_X, ROW_Y[0], 0.45] },
  { t: 6.55, dur: 0.2, to: [ICON_X, ROW_Y[1], 0.45] },
  { t: 6.8, dur: 0.2, to: [ICON_X, ROW_Y[IR], 0] },
];
/** The pauses where it compares its wave with a wrong row (a small shudder). */
export const MISSES = [6.5, 6.75];
export function remoteAt(t: number): V3 {
  const s = storyTime(t);
  let p: V3 = P_OPEN;
  for (const k of PATH) p = lerp3(p, k.to, prog(s, k.t, k.dur));
  const kick = (t0: number, d: number) => { const k = (s - t0) / d; return k > 0 && k < 1 ? Math.sin(Math.PI * k) * (1 - k) : 0; };
  const shudder = MISSES.reduce((a, m) => a + 0.12 * kick(m, 0.25), 0);          // bounced back off a wrong row
  const dock = 0.06 * kick(ANSWER_AT, 0.4);                                         // lands hard, overshoots, settles
  const press = PRESSES.reduce((a, q) => a + (s > q - 0.08 && s < q + 0.08 ? 1 - Math.abs(s - q) / 0.08 : 0), 0);
  return [p[0] + shudder, p[1] - 0.012 * press - dock, p[2]];
}
/** Its size and tilt: big and tipped towards the camera (buttons showing) at the start, settling as it flies up. */
export const remoteScale = (t: number) => 2.0 - 0.5 * prog(storyTime(t), 2.2, 0.8);
export const remoteTilt = (_t: number) => 0.85;                     // always tipped to the camera: its buttons show (side-on it read as a stick)
/** How far the remote's button is pressed (0–1). */
export const pressAt = (t: number) => { const s = storyTime(t); return PRESSES.reduce((a, q) => Math.max(a, clamp01(1 - Math.abs(s - (q - 0.04)) / 0.08)), 0); };
/** A burst of light from the LED (0 → 1 as its rings spread), one per press. */
export const BURST = 0.5;
export const burstAt = (t: number) => { const s = storyTime(t); for (const q of [...PRESSES].reverse()) if (s >= q && s < q + BURST) return (s - q) / BURST; return -1; };
/** A slow turn while it fires, so the opening moves on every frame; it settles as it flies up. */
export const remoteYaw = (t: number) => { const s = storyTime(t); return 0.32 * Math.sin(s * 1.9) * (1 - prog(s, 2.2, 0.8)); };
/** Its own wave, drawn across the row it is passing while it comes down (and hovering): 0 when not drawn. */
export const remoteWaveAt = (t: number) => { const s = storyTime(t); return s < 3.3 ? 0 : s < ANSWER_AT ? 1 : 1 - prog(s, ANSWER_AT, 0.4); };
/** The TV the remote flicks: on screen at the start, it changes channel at each press; gone before the ladder. */
export const TV: V3 = [-0.38, 0.42, -1.6];                         // behind the remote, in frame, under the hook's words
export const tvIn = (t: number) => 1 - prog(storyTime(t), 2.2, 0.5);
export const channelAt = (t: number) => PRESSES.filter(p => storyTime(t) >= p + 0.15).length;
/** The infrared row lighting up at the answer (0–1), the others dimming. */
export const answerGlow = (t: number) => { const d = storyTime(t) - ANSWER_AT; return d < 0 || d > 1.2 ? 0 : Math.sin(Math.PI * d / 1.2); };
export const docked = (t: number) => storyTime(t) >= ANSWER_AT;
/** The phone that sees the remote's flash. */
export const PHONE: V3 = [0.45, ROW_Y[IR] + 0.02, 0.6];
export const phoneIn = (t: number) => prog(storyTime(t), 7.8, 0.4) * (1 - prog(storyTime(t), 9.4, 0.3));

// ---- camera ----
const DIST = 11, FOV = 30, LY = -0.05;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [3.0, 0, 0.2, 0],                                          // [zoom, look-at x, look-at y, orbit]: close on the remote
  keys: [
    { t: 0, dur: 2.2, to: [2.7, 0, 0.2, 0] },                        // a slow drift while it fires (silent)
    { t: 2.2, dur: 0.8, to: [1.0, 0, LY, 0] },                       // the pull-back as it flies up (whoosh)
    { t: 3.0, dur: 3.1, to: [1.03, 0, LY, 0] },                      // a slow push while the ladder builds
    { t: 6.95, dur: 0.6, to: [1.25, 0.02, ROW_Y[IR], 0] },            // punch-in on the infrared row as it docks (its labels and the remote both in frame)
    { t: 7.8, dur: 0.6, to: [2.6, 0.8, ROW_Y[IR] - 0.15, 0] },       // close on the remote and the phone (the question line steps aside)
    { t: 9.4, dur: 0.6, to: [1.0, 0, LY, 0] },                       // out to the whole ladder
    { t: 10.0, dur: 1.7, to: [1.02, 0, LY, 0] },                     // a slow push under the pulse, settled by 11.7
    { t: REW0, dur: DURATION - REW0, to: [3.0, 0, 0.2, 0] },         // the rewind takes it back to frame 0
  ],
};
export function cameraAt(t: number) {
  const [zoom, lx, ly, orbit] = tween(t, CAMERA.start, CAMERA.keys);
  return orbitCamera(zoom, [lx, ly], orbit, DIST, FOV, FULL);
}
/** The picture's outline (F35): the rows that are up, label column to object column. */
export const heroAt = (t: number): V3[] => BANDS.flatMap((_, i) => (rowIn(i, t) > 0 ? [[LABEL_X - 0.3, ROW_Y[i], 0], [ICON_X + 0.18, ROW_Y[i], 0]] as V3[] : []));

// ---- colours: text in the LAB palette; the answer's highlight is warm white (a colour no wave uses) ----
export const COLOURS = { ink: LAB.ink, muted: LAB.muted, board: LAB.board, answer: '#fff4e0' } as const;

// ---- words: every text on screen, placed beside what it names (F35) ----
export const CAPTIONS: Caption[] = [
  { t0: 3.75, t1: 5.9, text: 'One kind of wave, squeezed tighter' },
  { t0: 8.35, t1: 9.4, text: 'Many phone cameras can see it' },
  { t0: 10.1, t1: 11.4, text: 'Shorter wave, more energy' },
  { t0: SHEET[0] - 0.35, t1: REW0, text: SHEET_TITLE },
];
export type Kind = 'label' | 'header' | 'chip' | 'nudge' | 'tag' | 'line' | 'caption' | 'name' | 'use' | 'range' | 'q' | 'answer';
export type Text = { name: string; kind: Kind; text: string; size: number; x: number; y: number; alpha: number; box: Box; colour?: string };
const HEAD = { size: 56, chipW: 240, chipH: 76, gap: 22 };
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
  OPTIONS.forEach((o, i) => add({ name: `chip ${'ABC'[i]}`, kind: 'chip', text: o, size: 42, x: x0 + i * (HEAD.chipW + HEAD.gap) + HEAD.chipW / 2, y: 350, alpha: big,
    box: { x: x0 + i * (HEAD.chipW + HEAD.gap), y: 312, w: HEAD.chipW, h: HEAD.chipH } }));
  add({ name: 'nudge', kind: 'nudge', text: 'comment your guess 👇', size: 32, x: 540, y: 480, alpha: big });
  const close = prog(t, 7.8, 0.3) * (1 - prog(t, 9.4, 0.3));         // the phone close-up: the ladder rises behind this line
  add({ name: 'question line', kind: 'line', text: SHORT_Q, size: 44, x: 540, y: LINE_Y, alpha: t < REW0 ? prog(t, T_SHRINK + 0.3, 0.3) * (1 - prog(t, SHEET[0] - 0.35, 0.3)) * (1 - close) : 0 });
  add({ name: 'tag', kind: 'tag', text: BRAND, size: 30, x: 540, y: 432 + (TAG_Y - 432) * up, alpha: 1 });
  // each row's name, use and range, in the label column
  BANDS.forEach((b, i) => {
    const a = row * rowIn(i, t) * prog(s, T_SHRINK + 0.3, 0.2), p = at([LABEL_X, ROW_Y[i], 0], t);
    const use = i === IR && s < ANSWER_AT ? '?' : b.use;
    const lines = [
      { name: `name ${b.name}`, kind: 'name' as const, text: b.name, size: 36, y: p.y - 46, colour: b.colour },
      { name: `use ${b.name}`, kind: 'use' as const, text: use, size: 32, y: p.y, colour: use === '?' ? COLOURS.answer : undefined },
      { name: `range ${b.name}`, kind: 'range' as const, text: b.range, size: 28, y: p.y + 42, colour: undefined },
    ];
    if (!lines.every(l => inSafeArea(textBox(l.text, l.size, p.x, l.y)))) return;   // a row's labels show together or not at all
    for (const l of lines) add({ ...l, x: p.x, alpha: a });
  });
  // the remote's question mark while it hovers and comes down
  const r = remoteAt(t), rp = at([r[0] - 0.3, r[1], r[2]], t);         // beside it, on its left
  add({ name: 'remote?', kind: 'q', text: '?', size: 96, x: rp.x, y: rp.y, alpha: row * fade(s, 3.4, 6.3, 0.2), pinned: true });
  add({ name: 'answer', kind: 'answer', text: OPTIONS[ANSWER], size: 52, x: 540, y: CAP_Y, pad: 30, alpha: fade(t, ANSWER_LIT, CAPTIONS[1].t0) });
  const cap = CAPTIONS.find(c => t >= c.t0 && t < c.t1);
  if (cap) add({ name: 'caption', kind: 'caption', text: cap.text, size: 46, x: 540, y: CAP_Y, pad: 28,
    alpha: cap.text === SHEET_TITLE ? clamp01((t - cap.t0) / 0.3) * clamp01((cap.t1 + 0.25 - t) / 0.25) : fade(t, cap.t0, cap.t1) });
  return out;
}

// ---- sound ----
export const MUSIC_HITS = [ANSWER_AT, SHEET[0]];
/** The music's level (F16, Sound critic): full, dipped ~4–5 dB under the presses, the ladder's taps, the answer's thunk and
 *  the energy pulse; only a mild fade at the loop seam (a deep one left the first press in a hole). */
const LEVEL: [number, number][] = [
  [0, 1],
  ...PRESSES.flatMap(p => [[p - 0.08, 1], [p - 0.02, 0.55], [p + 0.25, 0.55], [p + 0.45, 1]] as [number, number][]),
  [2.95, 1], [3.05, 0.65], [6.2, 0.65], [6.35, 1],
  [6.9, 1], [6.95, 0.55], [ANSWER_AT + 0.12, 0.55], [ANSWER_AT + 0.3, 1],
  [9.95, 1], [10.05, 0.6], [11.4, 0.6], [11.6, 1],
  [REW0, 1], [DURATION - 0.45, 0.85], [DURATION, 0.6],
];
export const musicLevel = (t: number) => {
  const i = LEVEL.findIndex(([t1]) => t1 >= t);
  if (i <= 0) return LEVEL[Math.max(0, i)][1];
  const [t0, v0] = LEVEL[i - 1], [t1, v1] = LEVEL[i];
  return t1 === t0 ? v1 : v0 + (v1 - v0) * (t - t0) / (t1 - t0);
};
const camWhooshes = whooshesFor(CAMERA.start, CAMERA.keys).map(h => (Math.abs(h.t - ANSWER_AT) < 0.3 ? { ...h, gain: 0.12 } : h));
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...PRESSES.flatMap((p, i) => [
      { kind: 'click' as const, t: p - 0.04, gain: i ? 0.45 : 0.65, pitch: 1 + 0.15 * i }, { kind: 'click' as const, t: p, gain: i ? 0.55 : 0.8, pitch: 1 + 0.15 * i },
      { kind: 'snap' as const, t: p + 0.01, gain: i ? 0.42 : 0.6, pitch: 1 + 0.12 * i }, { kind: 'shimmer' as const, t: p + 0.02, gain: i ? 0.16 : 0.24 },
    ] as Hit[]),
    { kind: 'thunk' as const, t: PRESSES[0], gain: 0.3, pitch: 1.4 },                    // a body under the first press
    ...PRESSES.map(p => ({ kind: 'tap' as const, t: p + 0.15, gain: 0.22, pitch: 2.4 } as Hit)),               // the TV changes channel
    ...ROW_SHOWN.map((t, i) => ({ kind: 'tap' as const, t, gain: 0.85, pitch: 0.9 + 0.25 * i } as Hit)),
    ...MISSES.map(t => ({ kind: 'clang' as const, t: t + 0.01, gain: 0.18, pitch: 0.7 } as Hit)),
    { kind: 'thunk' as const, t: ANSWER_AT, gain: 0.55 },
    { kind: 'snap' as const, t: ANSWER_AT + 0.02, gain: 0.3 },
    { kind: 'tap' as const, t: ANSWER_LIT, gain: 0.35, pitch: 3.2 },
    { kind: 'snap' as const, t: 8.2, gain: 0.32 },                                     // the phone lands
    { kind: 'shimmer' as const, t: 8.3, gain: 0.18 },                                  // its screen lights
    ...SWEEP.map((t, i) => ({ kind: 'tap' as const, t, gain: 0.7, pitch: 1.2 + 0.3 * i } as Hit)),
    { kind: 'shimmer' as const, t: REW0, gain: 0.15 },
    { kind: 'whoosh-out' as const, t: 14.55, gain: 0.25 },                             // the remote flies back into the close-up
    ...camWhooshes,
  ].sort((a, b) => a.t - b.t),
  beds: [],
  music: musicLevel,
};
