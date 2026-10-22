// @soundmindwithshivani reel #8, "the teacup": "It's okay to say no."
// ME holds her teacup. Kettles carrying requests (JUST THIS ONCE, YOU'RE FREE, NA?…) fly in and pour into it, one after
// another, until it overflows onto the saucer. Close-up on ME. "Put a lid on it. Your cup is yours." ME puts a lid on the
// cup; the second wave's tea only splashes off it, and the spill dries. Ending: the lid lifts, steam curls into a heart
// over her own tea, the sun comes out, ME smiles, the plant blooms. Same structure as reels #1–#7
// (soundmind/brand.md → Reels). Pure functions of t (seconds), 1080×1920.
import { clamp01, ease } from './motion.ts';
import { textAlpha as textAlphaFor, zoomAt as zoomFor, SCREEN_W, type TextItem } from './meStory.ts';

export const DURATION = 27;
export const MUSIC = { style: 'calm' as const, chime: 24.2 };

export const HOOK: TextItem = { text: "It's okay to say no.", t0: 0, t1: 11 };
// Non-breaking spaces keep "Your cup is yours." together on the card's second line.
export const LINE2: TextItem = { text: 'Put a lid on it. Your\u00A0cup\u00A0is\u00A0yours.', t0: 15.8, t1: DURATION };
export const ZOOM = { t0: 11, t1: 15.5, peak: 1.3 };
export const textAlpha = (item: TextItem, t: number) => textAlphaFor(item, t, DURATION);
export const zoomAt = (t: number) => zoomFor(t, ZOOM);

// Scene layout (px): ME sits on the left holding her cup out on its saucer; the kettles hover above it, one on each side.
export const ME = { x: 330, headY: 1120, r: 64 };
export const GROUND_Y = 1330;
export const CUP = { x: 570, y: 1210, w: 140, h: 100 };          // y is the cup's base
export const PLANT = { x: 860, y: GROUND_Y + 4 };
// Where a kettle hovers to pour (its body's centre) and where its label sits, per side.
export const HOVER = { left: { x: 440, y: 990, labelY: 860 }, right: { x: 700, y: 960, labelY: 770 } };

export type Kettle = { label: string; side: -1 | 1; t0: number };
const wave = (labels: string[], start: number, gap: number, first: number): Kettle[] =>
  labels.map((label, i) => ({ label, side: (i + first) % 2 === 0 ? -1 : 1, t0: start + i * gap }));
export const KETTLES: Kettle[] = [
  ...wave(['JUST THIS ONCE', "YOU'RE FREE, NA?", 'ONE SMALL FAVOUR', 'ADJUST KARO', "CAN'T SAY NO TO FAMILY"], 0.5, 1.9, 0),
  ...wave(['WHY NOT?', "YOU'VE CHANGED", "DON'T BE SELFISH"], 16.6, 1.8, 1),
];

const ENTER = 0.6, POUR = 1.0, LEAVE = 0.6;
export type KettleState = { x: number; y: number; labelY: number; tilt: number; phase: 'wait' | 'enter' | 'pour' | 'leave' | 'gone' };
const hover = (k: Kettle) => (k.side < 0 ? HOVER.left : HOVER.right);

export function kettleAt(k: Kettle, t: number): KettleState {
  const h = hover(k), off = k.side < 0 ? -200 : SCREEN_W + 200, s = t - k.t0;
  const at = (x: number, y: number, tilt: number, phase: KettleState['phase']) => ({ x, y, labelY: h.labelY + (y - h.y), tilt, phase });
  if (s < 0) return at(off, h.y - 120, 0, 'wait');
  if (s < ENTER) { const u = ease(s / ENTER); return at(off + (h.x - off) * u, h.y - 120 * (1 - u), 0, 'enter'); }
  if (s < ENTER + POUR) { const p = s - ENTER; return at(h.x, h.y, 50 * Math.min(1, p / 0.2, (POUR - p) / 0.2), 'pour'); }
  if (s < ENTER + POUR + LEAVE) { const u = ease((s - ENTER - POUR) / LEAVE); return at(h.x + (off - h.x) * u, h.y - 120 * u, 0, 'leave'); }
  return at(off, h.y - 120, 0, 'gone');
}
/** Tea flows while a kettle is tipped past this angle. */
export const POURING = 20;

// The lid: down just after the close-up, lifted off at the ending.
export const LID_T = 15.8;
export const lidAt = (t: number) => ease(clamp01((t - LID_T) / 0.5)) * (1 - ease(clamp01((t - 22.6) / 0.8)));

// How full the cup is (1 = brim; more spills over). Her own tea to start; each request of the first wave pours in a
// quarter of a cup. Once the lid is on, the spill dries and only her own tea is left.
const OWN = 0.3, POUR_IN = 0.25, AFTER = 0.75;
const raw = (t: number) => OWN + KETTLES.filter(k => k.t0 < LID_T).reduce((v, k) => v + POUR_IN * ease(clamp01((t - k.t0 - ENTER - 0.2) / (POUR - 0.4))), 0);
export function levelAt(t: number) {
  if (t < LID_T) return raw(t);
  const top = raw(LID_T);
  return top + (AFTER - top) * ease(clamp01((t - LID_T) / 0.7));
}
/** How much has spilled onto the saucer (0 … 1). */
export function spillAt(t: number) {
  const s = clamp01((raw(Math.min(t, LID_T)) - 1) / (raw(LID_T) - 1));
  return t < LID_T ? s : s * (1 - ease(clamp01((t - LID_T) / 0.7)));
}
/** A request of the second wave pouring onto the lid: 1 while its tea hits the lid. */
export function splashAt(t: number) {
  if (t < LID_T) return 0;
  return Math.max(0, ...KETTLES.filter(k => k.t0 > LID_T).map(k => { const s = kettleAt(k, t); return s.phase === 'pour' ? clamp01((s.tilt - POURING) / 20) : 0; }));
}

export const steamAt = (t: number) => ease(clamp01((t - 23.2) / 1.6));
export const sunAt = (t: number) => ease(clamp01((t - 22.8) / 2.8));
export const smileAt = (t: number) => ease(clamp01((t - 23.6) / 1.2));
export const bloomAt = (t: number) => ease(clamp01((t - 24.0) / 1.4));
