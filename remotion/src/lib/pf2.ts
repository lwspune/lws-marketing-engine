// @pyqvault_ · framework-2 test, reel A (L61, founder 2026-10-22): electromagnetic induction made exactly as
// `reels/pyqvault-framework-2.md` ("Science, Assembled") says: its P18 storyboard on its §2 grammar and §1.2 format.
// Exploded parts float (hook) → they assemble with snaps → the field switches on (activation) → the magnet moves in and the
// needle swings, stops and it returns to zero, pulls out and it reverses → Faraday's law on a clean overlay → recall:
// "No change in flux → no induced EMF", a small PYQ Vault mark. Dark navy, teal field and current, amber for the answer,
// no narration. Our framework (F1–F30) is deliberately NOT applied: reel B (pp011.ts) is the same topic made by it.
// The physics is lib/induction.ts; the needle is the EMF on a fixed scale, re-derived in the tests.
//
// BEAT TABLE (the bible's P18, time-coded)
// | time        | beat      | what moves                                                        | text                              |
// | 0–3 s       | hook      | magnet, coil former, loose winding, meter and wires float apart,  | Can motion create voltage?        |
// |             |           | drifting; the camera pushes in slowly                              |                                   |
// | 3–7 s       | assemble  | the winding wraps onto the former, the meter glides in, two wires | coil · 2,000 turns, galvanometer, |
// |             |           | connect: a snap per part; the camera orbits round to the front     | magnet (as each part locks)       |
// | 7–12 s      | activate  | teal field lines switch on (shimmer); the magnet moves into the    | Changing flux                     |
// |             |           | coil and the needle swings; it stops (thunk), needle back to zero  |                                   |
// | 12–17 s     |           | still, needle at zero; then the magnet pulls out, needle reverses   | Changing flux                     |
// | 17–23 s     | explain   | the camera pulls back; the magnet goes in and out again under a     | Changing magnetic flux induces an |
// |             |           | clean formula card                                                 | EMF · ℰ = −N dΦ/dt · Faraday's    |
// |             |           |                                                                    | law · Lenz's law · assumption     |
// | 23–30 s     | recall    | the magnet slides in and stays still: needle at zero               | No change in flux → no induced    |
// |             |           |                                                                    | EMF · PYQ Vault (from 26.5 s)     |
import { prog, tween, type Key } from './motion.ts';
import type { Score } from './sfx.ts';
import { LAB, REAL, VIVID } from './palette.ts';
import { COIL3, MAG3, S, emfAt, orbitCamera, type Band, type V3 } from './inductionScene.ts';

export const DURATION = 30;
export const T_LOCK = 7, T_ACT = 7, T_EXPLAIN = 17, T_RECALL = 23, T_TAKEAWAY = 25.3, T_BRAND = 26.5, COVER_T = 9.3;
export const HOOK = 'Can motion create voltage?';
export const PROCESS = 'Changing flux';
export const PRINCIPLE = 'Changing magnetic flux induces an EMF';
export const FORMULA = 'ℰ = −N dΦ/dt';
export const LAW_LABELS = ["Faraday's law", "Lenz's law"];
export const ASSUMPTION = 'Idealised coil and magnet';
export const TAKEAWAY = 'No change in flux → no induced EMF';
export const BRAND = 'PYQ Vault';

// ---- the parts and their assembly (3–7 s) ----
export const PARTS = [
  { name: 'former', at: 4.4, dur: 1.2 }, { name: 'winding', at: 5.0, dur: 1.8 }, { name: 'meter', at: 5.6, dur: 1.2 },
  { name: 'wireA', at: 6.1, dur: 0.5 }, { name: 'wireB', at: 6.6, dur: 0.5 },
] as const;
export type PartName = (typeof PARTS)[number]['name'];
export const CLOSED = 6.6;                                     // the second wire connects: the circuit is complete
/** 0 = exploded, 1 = locked in place. */
export function partAt(name: PartName, t: number) {
  const p = PARTS.find(q => q.name === name)!;
  return prog(t, p.at - p.dur, p.dur);
}
export const FORMER_OFF: V3 = [-0.45, 0.3, -0.3];
export const METER: V3 = [1.2, -0.15, 0.1], METER_SIZE: V3 = [0.66, 0.52, 0.18], METER_OFF: V3 = [0.4, -0.35, 0.1];
const off = (base: V3, o: V3, p: number): V3 => [base[0] + o[0] * (1 - p), base[1] + o[1] * (1 - p), base[2] + o[2] * (1 - p)];
export const formerAt = (t: number) => off([0, 0, 0], FORMER_OFF, partAt('former', t));
export const meterAt = (t: number) => off(METER, METER_OFF, partAt('meter', t));
/** The winding: loose and wide while exploded, wrapped tight on the former when locked. */
export function windingAt(t: number) {
  const k = 1 - partAt('winding', t);
  return { r: COIL3.r * (1 + 0.9 * k), h: COIL3.h * (1 + 1.0 * k), spin: 3 * k, y: 0.1 * k };
}
export const LEADS = { top: [COIL3.r, COIL3.h / 2, 0] as V3, bottom: [COIL3.r, -COIL3.h / 2, 0] as V3 };
export const TERMINALS = { a: [0.87, 0.0, 0.1] as V3, b: [0.87, -0.3, 0.1] as V3 };
export const BENDS = { a: [0.6, 0.32, 0.05] as V3, b: [0.6, -0.42, 0.05] as V3 };

// ---- the magnet (metres from the coil's centre, N pole down) ----
const U_EX = 0.2;
export const MOVES = [
  { t0: 8.2, t1: 10.4, to: 0 }, { t0: 13.6, t1: 15.8, to: 0.14 },      // P18: in (needle swings), out (it reverses)
  { t0: 17.8, t1: 19.8, to: 0 }, { t0: 20.6, t1: 22.6, to: 0.14 },     // again, under the formula
  { t0: 23.2, t1: 25.0, to: 0 },                                       // recall: in, then still
];
const MAGNET_KEYS: Key[] = [
  { t: 0, dur: 3.4, to: [0.195] }, { t: 3.4, dur: 3.0, to: [0.14] },   // drifting apart, then gliding into place
  ...MOVES.map(m => ({ t: m.t0, dur: m.t1 - m.t0, to: [m.to] })),
];
export const magnetU = (t: number) => tween(t, [U_EX], MAGNET_KEYS)[0];
export const magnetY = (t: number) => magnetU(t) * S;

// ---- the galvanometer: centre zero, full scale fixed for the whole reel ----
const peakEmf = (() => {
  let m = 0;
  for (let f = Math.round(CLOSED * 30); f <= DURATION * 30; f++) m = Math.max(m, Math.abs(emfAt(magnetU, f / 30)));
  return m;
})();
export const FULL_SCALE = Math.ceil(peakEmf * 1.15 * 10) / 10;   // volts
/** Needle position, −1 … 1 (+ = the EMF's sign), zero until the circuit closes. */
export const needle = (t: number) => (t < CLOSED ? 0 : emfAt(magnetU, t) / FULL_SCALE);
export const NEEDLE_MAX_DEG = 50;

// ---- what shows when ----
export const fieldAlpha = (t: number) => prog(t, T_ACT, 0.7);
export const LABELS = [
  { part: 'winding', text: 'coil · 2,000 turns', at: 5.0 }, { part: 'meter', text: 'galvanometer', at: 5.6 },
  { part: 'magnet', text: 'magnet', at: 6.4 },
] as const;
export const labelAlpha = (part: string, t: number) => {
  const l = LABELS.find(x => x.part === part)!;
  return prog(t, l.at, 0.3) * (1 - prog(t, 12.6, 0.6));
};
export const processAlpha = (t: number) => Math.max(...MOVES.slice(0, 2).map(m => prog(t, m.t0, 0.3) * (1 - prog(t, m.t1, 0.3))));
export const hookAlpha = (t: number) => 1 - prog(t, 3.2, 0.4);
export const explainAlpha = (t: number) => prog(t, T_EXPLAIN, 0.5) * (1 - prog(t, T_RECALL, 0.5));
export const takeawayAlpha = (t: number) => prog(t, T_TAKEAWAY, 0.4);
export const brandAlpha = (t: number) => prog(t, T_BRAND, 0.5);

// ---- camera: a slow push in the hook, one orbit round to the front while it assembles, a slow push, pull back ----
export const BAND: Band = { top: 330, width: 1080, height: 1180 };
const DIST = 4.7, FOV = 30;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [0.74, 0.6, 0.85, -0.45],                            // [zoom, look-at x, look-at y, orbit]
  keys: [
    { t: 0, dur: 3, to: [0.78, 0.6, 0.8, -0.42] },
    { t: 3, dur: 4.4, to: [1.0, 0.5, 0.5, 0] },
    { t: 8.2, dur: 4.4, to: [1.02, 0.55, 0.62, 0] },
    { t: T_EXPLAIN, dur: 2.2, to: [0.86, 0.55, 0.42, 0] },
    { t: T_RECALL, dur: 1.5, to: [0.98, 0.55, 0.4, 0] },
  ],
};
export function cameraAt(t: number) {
  const [zoom, lx, ly, orbit] = tween(t, CAMERA.start, CAMERA.keys);
  return orbitCamera(zoom, [lx, ly], orbit, DIST, FOV, BAND);
}

/** Points that must stay inside the band when shown (the tests check every frame). */
export function anchors(t: number) {
  const y = magnetY(t), m = meterAt(t), w = windingAt(t), f = formerAt(t);
  const out: { name: string; p: V3 }[] = [
    { name: 'magnet top', p: [0, y + MAG3.h / 2, 0] }, { name: 'magnet bottom', p: [0, y - MAG3.h / 2, 0] },
    { name: 'winding left', p: [-w.r, w.y - w.h / 2, 0] }, { name: 'winding right', p: [w.r, w.y + w.h / 2, 0] },
    { name: 'former', p: [f[0] - COIL3.r, f[1] - COIL3.h / 2, f[2]] },
    { name: 'meter left', p: [m[0] - METER_SIZE[0] / 2, m[1] - METER_SIZE[1] / 2, m[2]] },
    { name: 'meter right', p: [m[0] + METER_SIZE[0] / 2, m[1] + METER_SIZE[1] / 2, m[2]] },
  ];
  if (labelAlpha('winding', t) > 0) out.push({ name: 'coil label', p: LABEL_AT.winding(t) });
  if (labelAlpha('meter', t) > 0) out.push({ name: 'meter label', p: LABEL_AT.meter(t) });
  if (labelAlpha('magnet', t) > 0) out.push({ name: 'magnet label', p: LABEL_AT.magnet(t) });
  return out;
}
export const LABEL_AT = {
  winding: (_t: number): V3 => [0, -COIL3.h / 2 - 0.16, 0.3],
  meter: (t: number): V3 => { const m = meterAt(t); return [m[0], m[1] - METER_SIZE[1] / 2 - 0.12, m[2]]; },
  magnet: (t: number): V3 => [-MAG3.r - 0.08, magnetY(t) + 0.1, 0],
};

// ---- the visual meaning system (§1.3) ----
export const COLOURS = {
  field: VIVID.lab.cyan, current: VIVID.lab.cyan, amber: LAB.amber, white: LAB.ink,
  north: VIVID.lab.red, south: VIVID.lab.blue, copper: REAL.lab.copper.fill, glass: REAL.lab.glass.fill, wire: REAL.lab.steel.fill,
} as const;

// ---- sound (§1.2): a magnetic snap per part, a short activation sound, low impacts, a soft hum with the current ----
export const MUSIC_HITS = [T_ACT, T_EXPLAIN];
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...PARTS.map((p, i) => ({ kind: 'snap' as const, t: p.at, gain: 0.34, pitch: 1 + 0.06 * i })),
    { kind: 'shimmer' as const, t: T_ACT, gain: 0.5 },
    { kind: 'thunk' as const, t: MOVES[0].t1, gain: 0.4 },
    { kind: 'thunk' as const, t: MOVES[4].t1, gain: 0.35 },
  ].sort((a, b) => a.t - b.t),
  beds: [{ kind: 'roar', t0: CLOSED, t1: DURATION, level: t => 0.16 * Math.abs(needle(t)) }],
};
