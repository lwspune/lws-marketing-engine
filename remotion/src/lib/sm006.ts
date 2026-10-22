// @soundmindwithshivani reel #6, "the mirror": "Your body is not a project to fix."
// ME sits beside a standing mirror that shows her reflection. Sticky notes slap onto the glass (FIX THIS, HIDE THAT…);
// the cloth in ME's hand wipes each one off and it flutters down to the grass. Close-up on calm ME. "It's the home you
// live in." A second wave is wiped too, and a flower grows on the mirror's frame for each note. Ending: flowers all round
// the frame, ME and her reflection smile, the glass sparkles, the sun comes out. Same structure as reels #1–#5
// (soundmind/brand.md → Reels). Pure functions of t (seconds), 1080×1920.
import { clamp01, ease } from './motion.ts';
import { textAlpha as textAlphaFor, zoomAt as zoomFor, type TextItem } from './meStory.ts';

export const DURATION = 27;
export const MUSIC = { style: 'calm' as const, chime: 24.0 };

export const HOOK: TextItem = { text: 'Your body is not a project to fix.', t0: 0, t1: 11 };
export const LINE2: TextItem = { text: "It's the home you live in.", t0: 15.8, t1: DURATION };
export const ZOOM = { t0: 11, t1: 15.5, peak: 1.3 };
export const textAlpha = (item: TextItem, t: number) => textAlphaFor(item, t, DURATION);
export const zoomAt = (t: number) => zoomFor(t, ZOOM);

// Scene layout (px): ME sits on the left; the oval mirror stands on the grass to her right.
export const ME = { x: 290, headY: 1120, r: 64 };
export const GROUND_Y = 1330;
export const MIRROR = { x: 720, y: 1010, rx: 160, ry: 230 };
export const CLOTH_REST = { x: 440, y: 1222 };                    // in ME's right hand

// Sticky notes: Kalam 34 px capitals, at most two lines.
export const NOTE = { w: 240, h: 150 };
export const NOTE_FONT = 34, CHAR_W = 19.5;
/** The note's words on one line, or split into the two most even lines. */
export function noteLines(label: string): string[] {
  if (label.length * CHAR_W <= NOTE.w - 24) return [label];
  const words = label.split(' ');
  let best: string[] = [label];
  for (let k = 1; k < words.length; k++) {
    const pair = [words.slice(0, k).join(' '), words.slice(k).join(' ')];
    if (best.length === 1 || Math.max(...pair.map(l => l.length)) < Math.max(...best.map(l => l.length))) best = pair;
  }
  return best;
}

export type Note = { label: string; x: number; y: number; rot: number; t0: number };
// Two spots on the glass, upper and lower, taken in turn, so the two notes up at once never overlap.
const SPOTS = [{ x: 712, y: 905 }, { x: 728, y: 1110 }], ROTS = [-5, 4, -3, 6];
const wave = (labels: string[], start: number, gap: number, first: number): Note[] =>
  labels.map((label, i) => ({ label, ...SPOTS[(i + first) % 2], rot: ROTS[(i + first) % 4], t0: start + i * gap }));
export const NOTES: Note[] = [
  ...wave(['FIX THIS', 'HIDE THAT', 'NOT LIKE BEFORE', 'TOO MUCH', 'COVER UP'], 0.6, 1.8, 0),
  ...wave(['NOT PHOTO READY', 'TOO DARK? TOO PALE?', 'WHAT WILL PEOPLE SAY?'], 16.0, 2.0, 1),
];

const SLAP = 0.35, WIPE_T = 1.3, FALL_T = 1.9, GONE_T = 2.8;
export type NoteState = { x: number; y: number; rot: number; scale: number; alpha: number; phase: 'wait' | 'slap' | 'stuck' | 'wipe' | 'fall' | 'gone' };

export function noteAt(n: Note, t: number): NoteState {
  const s = t - n.t0, still = { x: n.x, y: n.y, rot: n.rot, scale: 1, alpha: 1 };
  if (s < 0) return { ...still, alpha: 0, phase: 'wait' };
  if (s < SLAP) return { ...still, scale: 1.5 - 0.5 * ease(s / SLAP), alpha: clamp01(s / 0.12), phase: 'slap' };
  if (s < WIPE_T) return { ...still, phase: 'stuck' };
  if (s < FALL_T) return { ...still, rot: n.rot + 3 * Math.sin((s - WIPE_T) * 30), phase: 'wipe' };   // it shivers under the cloth
  if (s < GONE_T) {
    const u = (s - FALL_T) / (GONE_T - FALL_T);                      // peels off, flutters down, fades on the grass
    return { x: n.x + 40 * Math.sin(u * 7), y: n.y + (GROUND_Y + 40 - n.y) * u * u, rot: n.rot + 70 * u, scale: 1 - 0.25 * u, alpha: 1 - clamp01((u - 0.6) / 0.4), phase: 'fall' };
  }
  return { ...still, y: GROUND_Y + 40, alpha: 0, phase: 'gone' };
}

// The cloth, as a piecewise-linear path through time: it waits in ME's hand, flies to each note, wipes it in four
// strokes, and comes back.
type P = { t: number; x: number; y: number };
const CLOTH: P[] = (() => {
  const keys: P[] = [{ t: 0, ...CLOTH_REST }];
  const at = (t: number, x: number, y: number) => { if (t > keys[keys.length - 1].t) keys.push({ t, x, y }); };
  for (const n of NOTES) {
    at(n.t0 + 0.9, CLOTH_REST.x, CLOTH_REST.y);
    at(n.t0 + WIPE_T, n.x - 60, n.y - 20);
    [[60, -5], [-60, 10], [60, 20], [0, 0]].forEach(([dx, dy], k) => at(n.t0 + WIPE_T + (0.6 * (k + 1)) / 4, n.x + dx, n.y + dy));
    at(n.t0 + 2.4, CLOTH_REST.x, CLOTH_REST.y);
  }
  return keys;
})();

export function clothAt(t: number) {
  if (t <= CLOTH[0].t) return { x: CLOTH[0].x, y: CLOTH[0].y };
  for (let i = 1; i < CLOTH.length; i++) {
    const a = CLOTH[i - 1], b = CLOTH[i];
    if (t <= b.t) { const u = (t - a.t) / (b.t - a.t); return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }; }
  }
  const z = CLOTH[CLOTH.length - 1];
  return { x: z.x, y: z.y };
}

// Flowers on the mirror's frame: one for each note of the second wave as it falls, the rest at the ending.
export type Flower = { x: number; y: number; t0: number };
const onFrame = (deg: number) => ({ x: MIRROR.x + (MIRROR.rx + 10) * Math.cos((deg * Math.PI) / 180), y: MIRROR.y + (MIRROR.ry + 10) * Math.sin((deg * Math.PI) / 180) });
const SECOND = NOTES.filter(n => n.t0 > ZOOM.t1);
export const FLOWERS: Flower[] = [
  ...SECOND.map((n, i) => ({ ...onFrame([-150, -30, 150][i]), t0: n.t0 + FALL_T })),
  ...[-90, 20, 60, 180, 210].map((deg, k) => ({ ...onFrame(deg), t0: 23.0 + 0.25 * k })),
];
export const flowerAt = (f: Flower, t: number) => ease(clamp01((t - f.t0) / 0.6));

export const smileAt = (t: number) => ease(clamp01((t - 23.4) / 1.2));
export const sunAt = (t: number) => ease(clamp01((t - 22.8) / 2.8));
export const sparkleAt = (t: number) => clamp01((t - 24.0) / 0.5) * (0.6 + 0.4 * Math.sin(t * 5));
