// @soundmindwithshivani racing-mind reel #1 (framework S23, Painted 2D S21), "the 1 a.m. thoughts". Model: a 20 s reel
// studied 2026-10-27: a girl awake in bed while her worries pile up on screen in mixed sizes over a quickening pulse;
// then a hard cut to near-silence, a top-down view of her lying calm, "Breathe…". Ours: she lies awake on her side,
// lit by the bedside lamp, phone glowing, as ~18 thoughts crowd in faster and faster; at the cut everything stops (half a
// second of nothing), then from above she breathes in, out, and closes her eyes. Pure functions of t; tests in
// tests/sm015.test.ts.
import { clamp01, ease } from './motion.ts';
import { textAlpha as textAlphaFor, SAFE, type TextItem } from './meStory.ts';
import { viewOf as viewOf11, cameraTransform as cameraTransform11, type Cam } from './sm011.ts';
import { paintOf, type Paint } from './paint.ts';
import type { Hit, Score } from './sfx.ts';

export const W = 1080, H = 1920;
export const DURATION = 25;
export const MUSIC = { style: 'calm' as const, chime: 21.2 };
export const viewOf = viewOf11, cameraTransform = cameraTransform11;
/** Where a point of the drawing lands on screen. */
export const toScreen = (c: Cam, x: number, y: number) => ({ x: (x - c.cx) * c.z + W / 2, y: (y - c.cy) * c.z + H / 2 });

// ---- the thoughts: they come faster and faster, dim as they age, and all vanish at the cut ---------------------------------
export const CUT = 12.8;
type Style = 'regular' | 'italic' | 'bold';
const RAW: [string, number, Style][] = [
  ['Why am I still awake?', 54, 'bold'],
  ['Did I sound rude in that message?', 38, 'italic'],
  ['Everyone my age has it figured out.', 38, 'regular'],
  ['I should have studied more.', 38, 'regular'],
  ['Am I even good at my job?', 46, 'italic'],
  ['Mumma sounded worried today.', 38, 'regular'],
  ['What will people say?', 50, 'bold'],
  ['I wasted another weekend.', 36, 'italic'],
  ['Reply to that email.', 40, 'regular'],
  ['Why did I say that in 2019?', 44, 'italic'],
  ["I'm so behind.", 52, 'bold'],
  ['Start the gym. Again.', 38, 'regular'],
  ["Everyone's getting married.", 40, 'italic'],
  ['What am I doing with my life?', 44, 'bold'],
  ["I'll fix everything from Monday.", 36, 'italic'],
  ['Did I lock the door?', 42, 'regular'],
  ["Tomorrow I'll be tired again.", 40, 'italic'],
  ['I need to stop overthinking.', 56, 'bold'],
];
/** Where the thoughts may go: the dark room above her, inside Instagram's safe band. */
export const ZONE = { y0: 230, y1: 980 };
export type Thought = { text: string; size: number; style: Style; t: number; x: number; y: number };
/** A thought's box on screen; the width is a safe overestimate of Lora at that size. */
export const boxOf = (th: Pick<Thought, 'text' | 'size' | 'x' | 'y'>) => ({ x: th.x, y: th.y, w: Math.ceil(th.text.length * th.size * 0.53), h: Math.ceil(th.size * 1.3) });
const LIFE = 4.6;
export function thoughtAlpha(th: Pick<Thought, 't'>, t: number) {
  if (t < th.t || t >= CUT) return 0;
  const age = t - th.t, fadeIn = th.t === 0 ? 1 : clamp01(age / 0.25);
  const decay = age < 2.5 ? 1 : age < 4 ? 1 - (0.6 * (age - 2.5)) / 1.5 : Math.max(0, 0.4 * (1 - (age - 4) / (LIFE - 4)));
  return Math.min(fadeIn, decay);
}
const rnd = (i: number, k: number) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
/** Scatter the thoughts: each takes the first free spot from its own shuffled list, so none covers one still on screen. */
function place(): Thought[] {
  const out: Thought[] = [], times: number[] = [];
  RAW.forEach((_, i) => times.push(i === 0 ? 0 : i === 1 ? 1.3 : times[i - 1] + 0.9 - (0.55 * (i - 2)) / (RAW.length - 3)));
  // The hook and the last, loudest thought both take centre stage; anything still on screen when the last one comes
  // keeps out of its band.
  const last = RAW.length - 1, centre = (text: string, size: number) => ({ text, size, x: Math.round((W - text.length * size * 0.53) / 2), y: 560 });
  const finale = boxOf(centre(RAW[last][0], RAW[last][1]));
  RAW.forEach(([text, size, style], i) => {
    const t = times[i], w = Math.ceil(text.length * size * 0.53), h = Math.ceil(size * 1.3);
    const xs = [SAFE.left + 10, SAFE.left + 70, (W - w) / 2, SAFE.right - 10 - w, SAFE.right - 70 - w].filter(x => x >= SAFE.left && x + w <= SAFE.right);
    const spots: { x: number; y: number; k: number }[] = [];
    for (let y = ZONE.y0; y + h <= ZONE.y1; y += 10) for (const x of xs) spots.push({ x: Math.round(x), y, k: rnd(i * 977 + y, x) });
    if (i === 0 || i === last) spots.unshift({ ...centre(text, size), k: -1 });
    spots.sort((a, b) => a.k - b.k);
    const live: Pick<Thought, 'text' | 'size' | 'x' | 'y'>[] = out.filter(o => o.t + LIFE > t);
    if (i !== last && t + LIFE > times[last]) live.push({ text: RAW[last][0], size: RAW[last][1], x: finale.x, y: finale.y });
    const free = spots.find(s => live.every(o => {
      const a = { x: s.x - 8, y: s.y - 8, w: w + 16, h: h + 16 }, b = boxOf(o);
      return !(a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h);
    }));
    if (!free) throw new Error(`no room for "${text}"`);
    out.push({ text, size, style, t: Math.round(t * 100) / 100, x: free.x, y: free.y });
  });
  return out;
}
export const THOUGHTS = place();

// ---- the words after the cut ------------------------------------------------------------------------------------------------
export const BREATH_IN = [13.8, 17.3] as const, BREATH_OUT = [17.3, 21.3] as const;
export const LINES: TextItem[] = [
  { text: 'Breathe in…', t0: BREATH_IN[0], t1: BREATH_IN[1] },
  { text: '…and out.', t0: BREATH_OUT[0], t1: 21.0 },
  { text: 'The thoughts can wait till morning.', t0: 21.0, t1: DURATION },
];
export const textAlpha = (item: TextItem, t: number) => textAlphaFor(item, t, DURATION);
export const readSeconds = (text: string) => text.split(/\s+/).length / 3.2 + 0.4;
/** Above her head in the view from above. */
export const LINE_BOX = { x: 120, y: 250, w: 840, h: 200 };

// ---- colour: a dark blue room, one warm lamp ----------------------------------------------------------------------------------
export const SCENE = { text: '#FFFFFF', behindText: ['#1E2846', '#26304F', '#2A2440'] };
export const PAINT: Record<string, Paint> = {
  wall: paintOf('#1E2846'), blanket: paintOf('#3B4F86'), sheet: paintOf('#8E9AC0'), pillow: paintOf('#D8CCB8'),
  skin: paintOf('#E2AE88'), hair: paintOf('#3A2418'), sweatshirt: paintOf('#8C6BB0'), wood: paintOf('#6B4630'),
  lampShade: paintOf('#F2D8A6'), brass: paintOf('#C9963A'), phone: paintOf('#3A4052'), frame: paintOf('#4A3A5A'),
  curtain: paintOf('#5A3A5E'),
};

// ---- the camera: three shots, hard cuts ----------------------------------------------------------------------------------------
export type Shot = { id: 'awake' | 'gap' | 'rest'; t0: number; t1: number; from: Cam; to: Cam };
export const WIDE: Cam = { cx: W / 2, cy: H / 2, z: 1 };
const CLOSE: Cam = { cx: 420, cy: 1210, z: 2 };
export const SHOTS: Shot[] = [
  { id: 'awake', t0: 0, t1: CUT, from: { cx: 470, cy: 1080, z: 1.38 }, to: { cx: 450, cy: 1110, z: 1.5 } },
  { id: 'gap', t0: CUT, t1: 13.3, from: CLOSE, to: CLOSE },
  { id: 'rest', t0: 13.3, t1: DURATION, from: { cx: 540, cy: 790, z: 1.32 }, to: { cx: 540, cy: 770, z: 1.26 } },
];
export const LAYERS = { outside: 0.4, room: 1 } as const;
const lerp = (a: number, b: number, u: number) => a * (1 - u) + b * u;
export const shotAt = (t: number) => SHOTS.find(s => t >= s.t0 && t < s.t1) ?? SHOTS[SHOTS.length - 1];
export function cameraAt(t: number): Cam {
  const s = shotAt(t), u = s.id === 'awake' ? clamp01((t - s.t0) / (s.t1 - s.t0)) : ease(clamp01((t - s.t0) / (s.t1 - s.t0)));
  return { cx: lerp(s.from.cx, s.to.cx, u), cy: lerp(s.from.cy, s.to.cy, u), z: lerp(s.from.z, s.to.z, u) };
}

// ---- the drawings (px): her on her side (awake), and from above (rest) -----------------------------------------------------
export const SIDE = { headX: 400, headY: 1230, r: 58, lampX: 120, lampY: 1080, phoneX: 150, phoneY: 1262 };
export const TOP = { headX: 540, headY: 700, r: 66, lampX: 160, lampY: 640 };

// ---- her ----------------------------------------------------------------------------------------------------------------------
export const BLINKS = [1.6, 4.9, 8.2, 10.9];
export const eyesClosed = (t: number) => (t >= 19.2) || (t < CUT && BLINKS.some(b => t >= b && t < b + 0.13));
/** A restless shift under the blanket while awake (0 → 1 → 0). */
export const shiftAt = (t: number) => Math.sin(Math.PI * clamp01((t - 6.6) / 1.4));
/** The slow breath after the cut: 0 = out, 1 = full. */
export function chestAt(t: number) {
  if (t >= BREATH_IN[0] && t < BREATH_IN[1]) return ease((t - BREATH_IN[0]) / (BREATH_IN[1] - BREATH_IN[0]));
  if (t >= BREATH_OUT[0] && t < BREATH_OUT[1]) return 1 - ease((t - BREATH_OUT[0]) / (BREATH_OUT[1] - BREATH_OUT[0]));
  return 0;
}
/** Small, quick breaths while the thoughts race. */
export const restlessAt = (t: number) => (t < CUT ? Math.sin(t * 4.2) : 0);
export const phoneLit = (t: number) => t < CUT;
export const lampAt = (t: number) => 1 - 0.4 * ease(clamp01((t - 22.5) / (DURATION - 22.5)));
/** Fairy lights outside the window (Diwali), always twinkling. */
export const twinkleAt = (i: number, t: number) => 0.6 + 0.4 * Math.sin(t * (1.9 + 0.31 * (i % 5)) + i * 1.7);

// ---- sound: a heartbeat that quickens, a clock, a low rumble; then nothing; then piano --------------------------------------------
function heartbeats(): Hit[] {
  const out: Hit[] = [];
  for (let t = 0.5, k = 0; t < CUT - 0.25; k++) {
    const u = t / CUT, gain = 0.18 + 0.32 * u;
    out.push({ kind: 'thunk', t, gain, pitch: 0.55 }, { kind: 'thunk', t: t + 0.17, gain: gain * 0.7, pitch: 0.5 });
    t += 1.05 - 0.5 * u;
  }
  return out.filter(h => h.t < CUT - 0.05);
}
const ticks: Hit[] = Array.from({ length: Math.floor(CUT) }, (_, i) => ({ kind: 'click', t: i + 0.25, gain: 0.08, pitch: 1.8 }));
export const SOUND: Score = {
  duration: DURATION,
  hits: [...heartbeats(), ...ticks.filter(h => h.t < CUT - 0.05)],
  beds: [{ kind: 'roar', t0: 1, t1: CUT, level: (t: number) => (t >= CUT ? 0 : 0.85 * clamp01((t - 1) / (CUT - 1))) }],
  music: (t: number) => (t < CUT ? 0.6 + 0.2 * clamp01(t / CUT) : t < 13.3 ? 0 : 0.55 * clamp01((t - 13.3) / 1.5)),
};
