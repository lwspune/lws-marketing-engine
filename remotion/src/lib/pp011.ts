// @pyqvault_ · Physics, visualised #11 (2026-10-22, framework v1.26): a magnet held still inside a coil. Bulb? Off.
// Class 12 Physics · Electromagnetic induction. Idea P37 ("Still magnet, dark bulb", the founder's), and reel B of the
// framework-2 test (L61): the same topic as PvF2Induction (made by `pyqvault-framework-2.md`), made here by our framework.
// Physics in lib/induction.ts (Faraday's law on a 2,000-turn coil, a 25 × 50 mm neodymium magnet); the bulb's glow is the
// power at its 1.5 V rating through a 0.08 s filament lag. Dark board, silent, like reel A, so the two differ by framework.
//
// BEAT TABLE (runbook step 1)
// | time          | what moves                                                         | caption                       | keep in frame   | colours                         |
// | 0–2.4 s HOOK  | "You'd think" + Assemble: the coil winds itself turn by turn round | Magnet stops inside. Bulb? +  | coil, magnet,   | copper (REAL), magnet red/blue  |
// |               | the axis (a snap per 3 turns, pitch rising), the wires reach the   | A/B/C + tag                   | bulb            | (VIVID), wires steel (REAL)     |
// |               | bulb (shimmer when done); the magnet already sinking above it      |                               |                 |                                 |
// | 2.4–6.7 s     | it plunges in and out three times, slower each time: the bulb      | Moving magnet: the bulb       | coil, magnet,   | field cyan, current yellow      |
// |               | flashes, current dots run, the ℰ graph draws itself                | flashes · Now it stops inside | bulb, graph     | (VIVID), glow warm              |
// | 6.7–8.0 s     | still at the centre; punch-in on the dark bulb (whoosh-in)         |                               | bulb            |                                 |
// | 8.4 s ANSWER  | "C off" lights; the graph is a flat line                           | No change, no current         | bulb            |                                 |
// | 9.6 s 2nd     | "Move the coil instead?": zoom out (whoosh-out), the coil slides up | Move the coil instead?        | coil, magnet    |                                 |
// |               | over the still magnet and back: the bulb lights both ways          | Any change in flux works      |                 |                                 |
// | 13.4–15.6 s   | the magnet shakes fast in the coil: brighter than before           | Faster change, brighter bulb  | all             |                                 |
// | 16.2 s → end  | end card                                                           | A changing field makes current|                 |                                 |
// Pairs to tell apart (colour-blind safe, tests): the field vs the current; N vs S.
import { prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Score } from './sfx.ts';
import { LAB, REAL, VIVID } from './palette.ts';
import { filament } from './induction.ts';
import { COIL3, MAG3, S, emfAt, orbitCamera, type Band, type V3 } from './inductionScene.ts';

export const DURATION = 19.0, END_AT = 16.2;
export const T_WOUND = 2.4, T_STOP = 6.7, ANSWER_AT = 8.4, T_SECOND = 9.6, T_SHAKE = 13.4, COVER_T = 3.0;
export const LABEL = 'PHYSICS, VISUALISED  #11';
export const HEADER = ['Magnet stops inside. Bulb?'];
export const OPTIONS = ['A  bright', 'B  dim', 'C  off'], ANSWER = 2;
export const BRAND = 'PYQ Vault · pyqvault.com';
export const SECOND_Q = 'Move the coil instead?';
export const BULB_V = 1.5;                                     // a 1.5 V torch bulb: full glow at its rating

// ---- the hook: the coil winds itself ----
export const windUpTo = (t: number) => Math.min(1, Math.max(0, t / 2.2));
export const wiresUpTo = (t: number) => prog(t, 1.7, 0.6);

// ---- motion (metres): the magnet's centre and the coil's, both from the coil's starting centre, up positive ----
const SHAKE = { amp: 0.035, hz: 3, ramp: 0.4, len: 2.2 };
const MAGNET_KEYS: Key[] = [
  { t: 0, dur: 2.4, to: [0.12] },                                       // sinking slowly while the coil winds
  { t: 2.4, dur: 0.7, to: [0] }, { t: 3.2, dur: 0.7, to: [0.1] },        // in, out
  { t: 4.0, dur: 0.7, to: [0] }, { t: 4.8, dur: 0.8, to: [0.08] },       // in, out (a little slower)
  { t: 5.7, dur: 1.0, to: [0] },                                        // in, slowly, and stop at the centre (T_STOP)
];
export function magnetU(t: number) {
  const base = tween(t, [0.16], MAGNET_KEYS)[0];
  if (t <= T_SHAKE) return base;
  const env = prog(t, T_SHAKE, SHAKE.ramp) * (1 - prog(t, T_SHAKE + SHAKE.len - SHAKE.ramp, SHAKE.ramp));
  return base + SHAKE.amp * env * Math.sin(2 * Math.PI * SHAKE.hz * (t - T_SHAKE));
}
const COIL_KEYS: Key[] = [{ t: 10.0, dur: 0.8, to: [0.1] }, { t: 11.2, dur: 0.8, to: [0] }];
export const coilU = (t: number) => tween(t, [0], COIL_KEYS)[0];
/** The magnet's distance from the coil's centre: only this relative position matters (the physics). */
export const relU = (t: number) => magnetU(t) - coilU(t);
export const emfNow = (t: number) => (t < 2.2 ? 0 : emfAt(relU, t));     // the circuit closes when the wires reach the bulb

const GLOW = filament(Array.from({ length: Math.round(DURATION * 30) + 2 }, (_, f) => Math.min(1, (emfNow(f / 30) / BULB_V) ** 2)), 1 / 30);
export const glow = (t: number) => GLOW[Math.max(0, Math.min(GLOW.length - 1, Math.round(t * 30)))];

// ---- the scene ----
export const BULB: V3 = [1.05, 0.02, 0.1];
export const coilY = (t: number) => coilU(t) * S;
export const magnetY = (t: number) => magnetU(t) * S;
export const leadsAt = (t: number) => ({ top: [COIL3.r, coilY(t) + COIL3.h / 2, 0] as V3, bottom: [COIL3.r, coilY(t) - COIL3.h / 2, 0] as V3 });
export const SOCKET = { a: [BULB[0] - 0.16, BULB[1] - 0.14, BULB[2]] as V3, b: [BULB[0] + 0.0, BULB[1] - 0.22, BULB[2]] as V3 };
export const READOUT_AT: V3 = [BULB[0], BULB[1] + 0.62, BULB[2]];
export const coilLabelAt = (t: number): V3 => [0, coilY(t) - COIL3.h / 2 - 0.15, 0.3];

export const BAND: Band = { top: 470, width: 1080, height: 760 };
const DIST = 5.2, FOV = 30;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1.0, 0.5, 0.75, 0],                                  // [zoom, look-at x, look-at y, orbit]
  keys: [
    { t: 0, dur: T_STOP, to: [1.08, 0.5, 0.6, 0] },             // slow push while it builds and runs
    { t: 7.2, dur: 0.8, to: [1.35, 0.8, 0.3, 0] },             // punch-in on the dark bulb
    { t: T_SECOND, dur: 0.9, to: [0.98, 0.5, 0.65, 0] },       // zoom out for the second hook
    { t: T_SHAKE - 0.2, dur: 2.4, to: [1.06, 0.5, 0.5, 0] },
  ],
};
export function cameraAt(t: number) {
  const [zoom, lx, ly, orbit] = tween(t, CAMERA.start, CAMERA.keys);
  return orbitCamera(zoom, [lx, ly], orbit, DIST, FOV, BAND);
}
/** Points that must stay inside the band (the bulb and its readout always; the rest unless the camera is punched in). */
export function anchors(t: number) {
  const out: { name: string; p: V3 }[] = [
    { name: 'bulb top', p: [BULB[0], BULB[1] + 0.42, BULB[2]] }, { name: 'bulb base', p: [BULB[0], BULB[1] - 0.22, BULB[2]] },
    { name: 'readout', p: READOUT_AT },
  ];
  if (tween(t, CAMERA.start, CAMERA.keys)[0] < 1.25) out.push(
    { name: 'magnet top', p: [0, magnetY(t) + MAG3.h / 2, 0] }, { name: 'magnet bottom', p: [0, magnetY(t) - MAG3.h / 2, 0] },
    { name: 'coil left', p: [-COIL3.r, coilY(t) - COIL3.h / 2, 0] }, { name: 'coil top', p: [-COIL3.r, coilY(t) + COIL3.h / 2, 0] },
    { name: 'coil label', p: coilLabelAt(t) },
  );
  return out;
}

// ---- the graph card: ℰ against time, drawing itself ----
export const GRAPH = { left: 110, right: 970, top: 1255, bottom: 1505, t1: END_AT, vmax: 3 };
export const graphX = (t: number) => GRAPH.left + (Math.min(t, GRAPH.t1) / GRAPH.t1) * (GRAPH.right - GRAPH.left);
export const graphY = (e: number) => (GRAPH.top + GRAPH.bottom) / 2 + 12 - (Math.max(-GRAPH.vmax, Math.min(GRAPH.vmax, e)) / GRAPH.vmax) * 100;

// ---- colours (F24) ----
export const COLOURS = {
  field: VIVID.lab.cyan, current: VIVID.lab.yellow, north: VIVID.lab.red, south: VIVID.lab.blue,
  copper: REAL.lab.copper.fill, glass: REAL.lab.glass.fill, wire: REAL.lab.steel.fill, socket: REAL.lab.silver.fill,
  filament: REAL.lab.flame.fill, ink: LAB.ink,
} as const;

// ---- words and sound ----
export const CAPTIONS: Caption[] = [
  { t0: 2.6, t1: 5.0, text: 'Moving magnet: the bulb flashes' },
  { t0: 5.0, t1: ANSWER_AT, text: 'Now it stops inside' },
  { t0: ANSWER_AT, t1: T_SECOND, text: 'No change, no current' },
  { t0: T_SECOND, t1: 11.9, text: SECOND_Q },
  { t0: 11.9, t1: T_SHAKE, text: 'Any change in flux works' },
  { t0: T_SHAKE, t1: END_AT - 0.1, text: 'Faster change, brighter bulb' },
];
export const SECOND_HOOK = CAPTIONS[3];
export const END_LINES = ['A changing field makes current', 'pyqvault.com', 'Follow for #12'];
export const MUSIC_HITS = [ANSWER_AT, T_SECOND];
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...Array.from({ length: 8 }, (_, i) => ({ kind: 'snap' as const, t: 0.15 + i * 0.27, gain: 0.3, pitch: 1 + 0.05 * i })),
    { kind: 'shimmer' as const, t: T_WOUND, gain: 0.5 },
    { kind: 'thunk' as const, t: T_STOP, gain: 0.45 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ].sort((a, b) => a.t - b.t),
  beds: [{ kind: 'roar', t0: 2.2, t1: END_AT, level: t => 0.2 * glow(t) }],
};
