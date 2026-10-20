// @pyqvault_ · Chemistry, visualised #6 (predict-first): a barium salt goes into the flame: the flame turns…? Apple
// green. Class 11 Chemistry · The s-Block Elements (flame test) + Structure of the Atom (emission). Five burners, salts
// in one by one: Li crimson, Na yellow, K violet (lilac), Ca brick red, Ba apple green (NCERT's colours), each lighting
// its real emission lines on a spectrum. The why: heat kicks an electron up a shell; it falls back and gives out light
// of one energy, E = hc/λ (barium 524 nm = 2.37 eV). Our own idea (backlog C7, topic score 6/10). Framework v1.5.
import { prog, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';

export const DURATION = 22.0, END_AT = 18.6;
export const OPTIONS = ['A   yellow', 'B   green', 'C   red'], ANSWER = 1;

export const METALS = [
  { sym: 'Li', name: 'lithium', ncert: 'crimson red', nm: [670.8], hex: '#e3123a', at: 1.0 },
  { sym: 'Na', name: 'sodium', ncert: 'yellow', nm: [589.0, 589.6], hex: '#ffc81e', at: 1.8 },
  { sym: 'K', name: 'potassium', ncert: 'violet', nm: [766.5, 404.4], hex: '#b48cff', at: 2.6 },
  { sym: 'Ca', name: 'calcium', ncert: 'brick red', nm: [622], hex: '#ff5a28', at: 3.4 },
  { sym: 'Ba', name: 'barium', ncert: 'apple green', nm: [524, 554], hex: '#8ee05a', at: 4.3 },
];
export const GAS_BLUE = '#6fa8ff';
export const ANSWER_AT = METALS[METALS.length - 1].at + 0.45;
export const PHOTON_EV = 1239.84 / 524;                       // hc = 1239.84 eV·nm

/** How far the salt has taken over flame i (0 = plain gas flame, 1 = the metal's colour). */
export const saltAt = (i: number, t: number) => prog(t, METALS[i].at, 0.5);
const mix = (a: string, b: string, s: number) => '#' + [1, 3, 5].map(k => {
  const x = parseInt(a.slice(k, k + 2), 16), y = parseInt(b.slice(k, k + 2), 16);
  return Math.round(x + (y - x) * s).toString(16).padStart(2, '0');
}).join('');
export const colourAt = (i: number, t: number) => { const s = saltAt(i, t); return s <= 0 ? GAS_BLUE : s >= 1 ? METALS[i].hex : mix(GAS_BLUE, METALS[i].hex, s); };
/** Flame height factor: a live flicker, different for each burner. */
export const flameFlicker = (i: number, t: number) => 1 + 0.1 * Math.sin(t * 17 + i * 2.1) + 0.06 * Math.sin(t * 31 + i * 1.3);

// The atom close-up: the electron sits in shell 1, the heat kicks it to shell 3, it falls back and a photon flies out.
export const T_UP = 7.0, T_DOWN = 9.8;
export const electronShellAt = (t: number) => 1 + 2 * prog(t, T_UP, 0.5) - 2 * prog(t, T_DOWN, 0.4);
export const photonAt = (t: number): { travel: number } | null => (t < T_DOWN ? null : { travel: Math.min(1, (t - T_DOWN) / 1.6) });

export const CAPTIONS: Caption[] = [
  { t0: 0.9, t1: METALS[4].at, text: 'Lithium, sodium, potassium, calcium…' },
  { t0: METALS[4].at, t1: 6.6, text: 'Barium: apple green!' },
  { t0: 6.6, t1: 9.8, text: 'Heat kicks an electron up' },
  { t0: 9.8, t1: 12.6, text: 'It falls back: one colour of light' },
  { t0: 12.6, t1: 15.4, text: 'Each metal: its own colour' },
  { t0: 15.4, t1: END_AT, text: 'That’s how fireworks get colours' },
];
export const MUSIC_HITS = [ANSWER_AT];

// Camera: [zoom, focus x (burners at −2.4 … 2.4, barium on the right), orbit angle]. A drift from frame 0, a slow push
// while the salts go in, a punch-in on the barium flame landing on the answer, a quick zoom out for the atom, a slow
// push for "its own colour", and the one orbit (80°, slow) round the five coloured flames as the closing moment.
export const T_ORBIT = 15.4;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [0.95, 0, 0],
  keys: [
    { t: 0, dur: 1.0, to: [1.0, 0, 0] },
    { t: 1.1, dur: 3.0, to: [1.15, 0.6, 0] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.6, 2.4, 0] },
    { t: 6.4, dur: 0.7, to: [1.0, 0, 0] },
    { t: 12.6, dur: 2.6, to: [1.1, 0, 0] },
    { t: T_ORBIT, dur: 3.0, to: [1.2, 0, 1.4] },
  ],
};

// Sound from the picture: the burners' roar the whole time, the salt crackling as each one goes in, whooshes on the fast
// zooms. Music hit on the answer.
const crackles = (at: number, i: number): Hit[] => [0.08, 0.2, 0.33].map((d, k) => ({ kind: 'crack', t: at + d, gain: [0.22, 0.16, 0.12][k], pitch: 1.1 + 0.15 * ((i + k) % 3) }));
export const SOUND: Score = {
  duration: DURATION,
  hits: [...METALS.flatMap((m, i) => crackles(m.at, i)), ...whooshesFor(CAMERA.start, CAMERA.keys)],
  beds: [{ kind: 'roar', t0: 0, t1: END_AT + 1.2, level: () => 0.55 }],
};
