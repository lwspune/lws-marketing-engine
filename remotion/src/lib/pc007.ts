// @pyqvault_ · Chemistry, visualised #7 (predict-first, the first voiceover, L43): 64 atoms, two half-lives: how many
// are left? 16. Class 12 Chemistry · Chemical Kinetics: radioactive decay is first order, so the half-life
// (t½ = 0.693/k) is the same however many atoms are left. Which atom goes next is random; how many go is not. Ends on
// carbon dating (C-14, t½ = 5,730 years). Backlog C13 (topic score 7/10, our own idea). Framework v1.7.
import { prog, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';
import type { Shown, VoiceLine } from './voice.ts';

export const DURATION = 21.9, END_AT = 19.4;
export const N0 = 64;
export const HEADER = ['64 atoms. Two half-lives.', 'How many are left?'];
export const OPTIONS = ['A   0', 'B   16', 'C   32'], ANSWER = 1;

// The half-life clock: still for the first 0.4 s (the atoms already pulse), 2 s of reel per half-life, paused on the
// answer (16 held while it lands), then on at the same rate. The clock is on screen, so the pause is shown, not hidden.
export const T0 = 0.4, T_HALF = 2.0, ANSWER_AT = T0 + 2 * T_HALF, RESUME = 6.0;
export const halfLivesAt = (t: number) => Math.min(2, Math.max(0, (t - T0) / T_HALF)) + Math.max(0, (t - RESUME) / T_HALF);

// The k-th decay (k = 1 … 63) happens when 64·(½)^h falls to 64 − k, so the count is exactly the law at every whole
// half-life; the 64th atom has no set time (it could last for ever).
export const DECAY_H = Array.from({ length: N0 - 1 }, (_, k) => Math.log2(N0 / (N0 - 1 - k)));
export const countAt = (t: number) => { const h = halfLivesAt(t); return N0 - DECAY_H.filter(d => d <= h).length; };
/** The reel time of the (k+1)-th decay. */
export const decayTimeOf = (k: number) => { const h = DECAY_H[k]; return h <= 2 ? T0 + h * T_HALF : RESUME + (h - 2) * T_HALF; };

// Which atom goes: a seeded shuffle of the 8 × 8 tray (the same every render). ORDER[k] decays k-th; ORDER[63] never.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const ORDER = (() => {
  const r = rng(2026), a = Array.from({ length: N0 }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
})();
const RANK = (() => { const r = new Array<number>(N0); ORDER.forEach((atom, k) => (r[atom] = k)); return r; })();
/** Seconds since atom i decayed, or null while it is still unstable. */
export const sinceDecay = (i: number, t: number) => {
  const k = RANK[i]; if (k >= DECAY_H.length) return null;
  const at = decayTimeOf(k); return t >= at ? t - at : null;
};
/** An unstable atom's glow (0…1): a slow pulse, out of step from atom to atom, so the tray shimmers from frame 0. */
export const glowAt = (i: number, t: number) => 0.5 + 0.5 * Math.sin(t * 4.7 + i * 1.37);

export const C14_YEARS = 5730;
/** The age of a sample with this fraction of its carbon-14 left: t = t½ · log₂(1 / fraction). */
export const carbonAge = (fraction: number) => Math.round(C14_YEARS * Math.log2(1 / fraction));
export const T_CARBON = 13.0;                                   // the graph's axis turns into years
export const COVER_T = 0.3;

export const CAPTIONS: Caption[] = [
  { t0: ANSWER_AT, t1: 7.0, text: '16 left: half go each half-life' },
  { t0: 7.0, t1: 10.0, text: 'Which one goes next? Nobody knows.' },
  { t0: 10.0, t1: T_CARBON, text: 'Same half-life, however many are left' },
  { t0: T_CARBON, t1: 17.3, text: 'Carbon-14 halves every 5,730 years' },
  { t0: 17.3, t1: END_AT, text: 'That’s how we date old bones' },
];
// What is on screen when: the question stays up until the end card; each caption for its slot.
export const SHOWN: Shown[] = [{ t0: 0, t1: END_AT, text: HEADER.join('\n') }, ...CAPTIONS];
// The voiceover reads the question from frame 0, then each caption just after it appears.
export const VOICE: VoiceLine[] = [
  { t: 0.15, until: ANSWER_AT, text: HEADER.join(' ') },
  ...CAPTIONS.map(c => ({ t: c.t0 + 0.1, until: c.t1, text: c.text })),
];
export const MUSIC_HITS = [ANSWER_AT];

// Camera: [zoom] on the tray. A drift from frame 0, a slow push while the atoms go, a punch-in landing on the 16
// survivors, a quick zoom out as the clock restarts, a slow push for "same half-life", out again for carbon dating.
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [0.94],
  keys: [
    { t: 0, dur: 1.0, to: [1.0] },
    { t: 1.0, dur: 3.0, to: [1.12] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.32] },
    { t: 5.9, dur: 0.7, to: [1.0] },
    { t: 10.0, dur: 2.8, to: [1.12] },
    { t: T_CARBON, dur: 0.8, to: [0.95] },
  ],
};

// Sound from the picture: the Geiger counter on screen clicks once per decay (pitch varies a little, like a real one),
// whooshes on the fast zooms. Music hit on the answer.
const clicks: Hit[] = DECAY_H.map((_, k) => decayTimeOf(k)).filter(t => t < DURATION - 0.5)
  .map((t, k) => ({ kind: 'click', t, gain: 0.32, pitch: 0.85 + 0.3 * ((k * 0.618) % 1) }));
export const SOUND: Score = {
  duration: DURATION,
  hits: [...clicks, ...whooshesFor(CAMERA.start, CAMERA.keys)],
  beds: [],
};

/** How far the punch-in's survivors are lit up (0…1): from the answer until the clock restarts. */
export const survivorsLit = (t: number) => prog(t, ANSWER_AT, 0.3) * (1 - prog(t, RESUME, 0.4));
