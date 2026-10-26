// @pyqvault_ · Chemistry, visualised #10 (predict-first, "You'd think" + Shock): an explosive metal and a poison gas make…
// a worse poison, a new metal, or table salt? Table salt. Sodium (it explodes in water) burns in chlorine (a WW1 poison gas):
// 2Na + Cl₂ → 2NaCl. Each sodium atom hands its one outer electron to a chlorine atom; both are left with a full shell of 8,
// Na⁺ and Cl⁻, which pull together and stack into the cubic rock-salt lattice, the reason a salt grain is a cube. Second hook
// (F26): why does only salt water conduct? In the crystal the ions are locked in place; in water they can move, so the bulb
// lights. Class 11 Chemistry · Chemical bonding (ionic bond). Backlog C44 (idea score 62; founder's idea, picked as the
// second Shock reel, 2026-10-26). Framework v1.28: entertainment first, the result real (F10); "not to scale", "zoomed" and
// "don't try this" are in the caption. Dark board (L22: the flame and its glow need the dark). Pure functions of t.
// Two scales: the jar and the beaker in metres-ish world units ('macro'), the atoms in units of 100 pm ('micro'); the
// smoke washes the screen white at each cut between them.
//
// BEAT TABLE (runbook step 1)
// | time         | what moves                                                         | caption                          | keep in frame         | colours (LAB board)                          |
// | 0 HOOK       | Shock: a spoon of burning sodium already plunging into a jar of    | question + A/B/C + tag (F4, F20) | jar, spoon            | chlorine REAL yellow-green, sodium REAL,     |
// |   0–1 s      | green chlorine; at 0.2 s it bursts: yellow flash, sparks, shake     |                                  |                       | flame sodium yellow, glass REAL              |
// | 0.2–2.4 s    | it burns; white smoke fills the jar; the green fades               | The green gas turns white (2.45) | jar                   | smoke white                                  |
// | 2.8–3.3 s    | punch-in into the smoke; it washes the screen white (cut)          |                                  |                       |                                              |
// | 3.3 s        | one Na atom, one Cl atom; Na's lone outer electron circles          | Sodium has one spare electron    | both atoms            | Na VIVID violet, Cl REAL chlorine,           |
// | 3.9–4.5 s    | the electron hops into the gap in Cl's ring of 7                    |                                  | both atoms            | electron VIVID cyan                          |
// | 4.5–5.3 s    | Na shrinks to Na⁺, Cl swells to Cl⁻ (real radii); they snap together| Chlorine grabs it: + and −       | both ions             |                                              |
// | 5.4–6.6 s    | pull back: 62 more ions fly in and lock into a 4×4×4 cube           | They stack into a cube           | the lattice           |                                              |
// | 6.65–7.0 s   | the lattice turns into a clear crystal cube; white wash (cut)       |                                  | the lattice           | crystal white                                |
// | 7.6 ANSWER   | back at the jar: punch-in on the spoon of white cube crystals; C   | Every salt grain is a cube       | the crystals          |                                              |
// | 8.8 2nd HOOK | pan right to a beaker of dry salt between two electrodes; bulb dark| Why does only salt water conduct?| beaker, bulb, battery | electrodes steel, wires copper (REAL)        |
// | 9.5–10.3 s   | water pours in; the salt dissolves into drifting ions               |                                  | beaker                | water REAL                                   |
// | 10.8 ANSWER2 | the bulb lights; Na⁺ drift to −, Cl⁻ to +                          | In water, the ions can move      | beaker                |                                              |
// | 11.3–12.9 s  | punch-in between the electrodes                                     | Locked in a crystal, free in water (12.6) | electrodes   |                                              |
// | 12.9–14.6 s  | zoom out to the jar and the beaker                                  |                                  | jar + beaker          |                                              |
// | 14.6 s       | end card                                                            |                                  |                       |                                              |
// Pairs told apart (F24, tests): Na violet vs Cl chlorine, the electron cyan vs each.
import { clamp01, prog, tween, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';

export type V3 = [number, number, number];

export const DURATION = 17.0, END_AT = 14.6;
export const LABEL = 'CHEMISTRY, VISUALISED  #10';
export const HEADER = ['Explosive metal + poison gas.', 'What do you get?'];
export const OPTIONS = ['A  worse poison', 'B  new metal', 'C  table salt'], ANSWER = 2;
export const BRAND = 'PYQ Vault · pyqvault.com';

export const T_ENTER = 0.2, T_FLAME_OUT = 2.4, CUT1 = 3.3;
export const T_HOP0 = 3.9, T_HOP1 = 4.5, T_SIZE1 = 5.0, T_PAIR = 5.3, T_LATTICE0 = 5.4, T_LATTICE1 = 6.6, T_CRYSTAL = 6.65, CUT2 = 7.0;
export const ANSWER_AT = 7.6, T_SECOND = 8.8, T_POUR0 = 9.5, T_POUR1 = 10.3, T_DISSOLVE0 = 10.0, ANSWER2_AT = 10.8;

// ---- the chemistry (F10: re-derived in the tests) ----
export const PROTONS = { Na: 11, Cl: 17 };
export const SHELLS: Record<'Na' | 'Cl' | 'Na+' | 'Cl-', number[]> = { Na: [2, 8, 1], Cl: [2, 8, 7], 'Na+': [2, 8], 'Cl-': [2, 8, 8] };
/** Atomic radii (metallic Na, covalent Cl) and ionic radii (Shannon, 6-coordinate), in pm. */
export const RADIUS_PM = { Na: 186, Cl: 99, 'Na+': 102, 'Cl-': 181 };
/** The Na–Cl distance in rock salt: half the cubic cell's 564 pm edge. */
export const NACL_PM = 282, UNIT_PM = 100;
const R = (k: keyof typeof RADIUS_PM) => RADIUS_PM[k] / UNIT_PM, D = NACL_PM / UNIT_PM;

// ---- seeded numbers: the same on every render and in the tests ----
const rng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ================= macro: the gas jar =================
export const JAR = { r: 0.9, h: 2.6, wall: 0.04 };
const CUP_REST_Y = 1.3, CUP_START_Y = JAR.h + 0.4, V_IN = (CUP_START_Y - JAR.h) / T_ENTER;
/** The deflagrating spoon's cup: plunging at V_IN from before frame 0, crossing the jar mouth at T_ENTER, then braking
    smoothly (same speed at the mouth) to rest in the middle of the jar. */
export function cupAt(t: number): V3 {
  if (t <= T_ENTER) return [0, CUP_START_Y - V_IN * t, 0];
  const d = JAR.h - CUP_REST_Y, stop = (2 * d) / V_IN, u = clamp01((t - T_ENTER) / stop);
  return [0, JAR.h - d * (1 - (1 - u) ** 2), 0];
}
/** The sodium bead: burning a little on the way down, bursting into flame in the chlorine, out by T_FLAME_OUT. */
export function flameAt(t: number) {
  if (t < T_ENTER) return 0.18;
  if (t >= T_FLAME_OUT) return 0;
  const up = clamp01((t - T_ENTER) / 0.06), down = 1 - prog(t, 1.2, T_FLAME_OUT - 1.2);
  return Math.max(0.18 * (1 - up), up * down * (0.95 + 0.05 * Math.sin(t * 47) * Math.sin(t * 13)));
}
/** How much of the bead is left. */
export const beadAt = (t: number) => 1 - prog(t, 0.5, T_FLAME_OUT - 0.5);
const FLASHES = [T_ENTER, T_ENTER + 0.07];
export const flashAt = (t: number) => Math.min(0.6, FLASHES.filter(s => t >= s && t - s < 0.4).reduce((a, s) => a + 0.55 * Math.exp(-(t - s) / 0.035), 0));
export function shakeAt(t: number): [number, number] {
  const amp = t >= T_ENTER && t - T_ENTER < 1.6 ? 0.1 * Math.exp(-(t - T_ENTER) / 0.25) : 0;
  return [amp * Math.sin(61 * t), amp * 0.6 * Math.cos(53 * t)];
}
/** Sparks off the bead: a burst as it enters, then a few every 0.1 s while it burns. Ballistic, under gravity. */
const SPARKS = (() => {
  const r = rng(1010), out: { t0: number; v: V3; life: number }[] = [];
  const add = (t0: number, n: number, up: number) => { for (let i = 0; i < n; i++) {
    const az = r() * 2 * Math.PI, h = 0.3 + r() * 0.9;
    out.push({ t0, v: [h * Math.cos(az), up * (0.6 + r() * 2.2), h * Math.sin(az)], life: 0.35 + r() * 0.25 });
  } };
  add(T_ENTER, 48, 1.4);
  for (let t0 = T_ENTER + 0.1; t0 < 1.9; t0 += 0.1) add(t0, 6, 1);
  return out;
})();
export function sparksAt(t: number) {
  const out: { pos: V3; alpha: number }[] = [];
  for (const s of SPARKS) {
    const tau = t - s.t0;
    if (tau < 0 || tau >= s.life) continue;
    const o = cupAt(s.t0);
    out.push({ pos: [o[0] + s.v[0] * tau, o[1] + 0.08 + s.v[1] * tau - 4.9 * tau * tau, o[2] + s.v[2] * tau], alpha: 1 - tau / s.life });
  }
  return out;
}
/** The chlorine left in the jar (1 = all of it): used up as the sodium burns. */
export const chlorineAt = (t: number) => 1 - 0.88 * prog(t, T_ENTER + 0.1, 2.2);
/** White smoke (tiny NaCl crystals): puffs born at the bead, rising and spreading, kept inside the glass, settling out. */
const PUFFS = (() => {
  const r = rng(4410), n = 70;
  return Array.from({ length: n }, (_, i) => ({
    t0: T_ENTER + 0.05 + (i * 1.8) / n, az: r() * 2 * Math.PI, spread: 0.3 + r() * 0.6, rise: -0.4 + r() * 1.5, spin: 0.25 + r() * 0.35,
  }));
})();
const SMOKE_OUT = 6.0;
export function smokeAt(t: number) {
  const out: { pos: V3; r: number; alpha: number }[] = [];
  const fade = 1 - prog(t, CUT1 + 0.1, SMOKE_OUT - CUT1 - 0.1);
  if (fade <= 0) return out;
  const room = JAR.r - JAR.wall;
  for (const p of PUFFS) {
    const age = t - p.t0;
    if (age < 0) continue;
    const g = 1 - Math.exp(-age / 0.9), r = 0.08 + 0.32 * (1 - Math.exp(-age / 0.8)), o = cupAt(p.t0), a = p.az + p.spin * age;
    let x = o[0] + p.spread * g * Math.cos(a), z = o[2] + p.spread * g * Math.sin(a);
    const h = Math.hypot(x, z), lim = room - r;
    if (h > lim) { x *= lim / h; z *= lim / h; }
    const y = Math.min(JAR.h - r, Math.max(r, o[1] + p.rise * g));
    out.push({ pos: [x, y, z], r, alpha: clamp01(age / 0.15) * fade });
  }
  return out;
}
/** The white salt left on the glass and the jar's floor. */
export const depositAt = (t: number) => prog(t, 1.6, 3.0);
/** White cube crystals left in the spoon's cup as the bead burns away. */
const CUP_CRYSTALS = (() => {
  const r = rng(7171);
  return Array.from({ length: 18 }, (_, i) => {
    const ring = i < 7 ? 0 : 1, a = r() * 2 * Math.PI, rad = ring ? 0.08 + r() * 0.05 : r() * 0.06;
    return { off: [rad * Math.cos(a), 0.05 + (1 - ring) * 0.05 + (i % 3) * 0.025, rad * Math.sin(a)] as V3, size: 0.07 + r() * 0.04, spin: r() * Math.PI };
  });
})();
export function cupCrystalsAt(t: number) {
  const g = prog(t, 1.8, 1.2);
  if (g <= 0) return [];
  const c = cupAt(t);
  return CUP_CRYSTALS.map(k => ({ pos: [c[0] + k.off[0], c[1] + k.off[1], c[2] + k.off[2]] as V3, size: k.size * g, spin: k.spin }));
}

// ================= the cuts =================
export const sceneAt = (t: number): 'macro' | 'micro' => (t >= CUT1 && t < CUT2 ? 'micro' : 'macro');
/** Smoke-white over the 3D band at each cut: it hides the change of scale. */
export const washAt = (t: number) => Math.max(...[CUT1, CUT2].map(c => Math.min(1, 1.25 * prog(1 - Math.abs(t - c) / 0.3, 0, 1))));

// ================= micro: two atoms, then the lattice (units of 100 pm) =================
const idx = (i: number, j: number, k: number) => (i * 4 + j) * 4 + k;
/** Rock salt, 4 × 4 × 4 ions centred on the origin, alternating: every neighbour is the other ion. */
export const SITES: { pos: V3; ion: 'Na+' | 'Cl-' }[] = [];
for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++)
  SITES.push({ pos: [(i - 1.5) * D, (j - 1.5) * D, (k - 1.5) * D], ion: (i + j + k) % 2 ? 'Na+' : 'Cl-' });
/** The first pair lands on two neighbouring inner sites, at the front of the cube. */
export const PAIR_SITES: [number, number] = [idx(1, 2, 2), idx(2, 2, 2)];
const NA_SITE = SITES[PAIR_SITES[0]].pos, CL_SITE = SITES[PAIR_SITES[1]].pos;
const NA0: V3 = [-2.5, NA_SITE[1], NA_SITE[2]], CL0: V3 = [1.9, CL_SITE[1], CL_SITE[2]];
const W_NA = (2 * Math.PI) / 1.5, W_CL = (2 * Math.PI) / 4;
const ring = (c: V3, r: number, angles: number[]): V3[] => angles.map(a => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), c[2]]);

type Atom = { pos: V3; r: number; charge: number; electrons: V3[] };
/** Both atoms at t: centre, radius (atomic → ionic), charge and the outer electrons on their rings; `hop` is the electron
    in flight. Na's electron is round at the side facing Cl when it leaves; Cl's ring turns so its gap faces Na as it lands. */
export function atomsAt(t: number): { na: Atom; cl: Atom; hop: V3 | null } {
  const k = prog(t, T_HOP1, T_SIZE1 - T_HOP1), m = clamp01((t - T_SIZE1) / (T_PAIR - T_SIZE1)) ** 2;
  const naPos = mix3(NA0, NA_SITE, m), clPos = mix3(CL0, CL_SITE, m);
  const naR = lerp(R('Na'), R('Na+'), k), clR = lerp(R('Cl'), R('Cl-'), k);
  const phase = W_CL * (t - T_HOP1), slots = Array.from({ length: 8 }, (_, s) => phase + (s * Math.PI) / 4);
  const caught = t >= T_HOP1;
  const na: Atom = { pos: naPos, r: naR, charge: caught ? 1 : 0, electrons: t < T_HOP0 ? ring(naPos, naR, [W_NA * (t - T_HOP0)]) : [] };
  const cl: Atom = { pos: clPos, r: clR, charge: caught ? -1 : 0, electrons: ring(clPos, clR, caught ? slots : slots.filter((_, s) => s !== 4)) };
  let hop: V3 | null = null;
  if (t >= T_HOP0 && t < T_HOP1) {
    const u = prog(t, T_HOP0, T_HOP1 - T_HOP0), a: V3 = [NA0[0] + R('Na'), NA0[1], NA0[2]], b: V3 = [CL0[0] - R('Cl'), CL0[1], CL0[2]];
    const p = mix3(a, b, u), lift = Math.sin(Math.PI * u);
    hop = [p[0], p[1] + 0.9 * lift, p[2] + 0.4 * lift];
  }
  return { na, cl, hop };
}

/** The other 62 ions fly in from outside along their own line from the centre, inner ones first, each in 0.35 s. */
const FLIGHT = 0.35;
const ORDER = SITES.map((s, i) => ({ i, d: Math.hypot(...s.pos) })).filter(o => !PAIR_SITES.includes(o.i)).sort((a, b) => a.d - b.d || a.i - b.i);
export const ARRIVALS: number[] = Array(SITES.length).fill(T_PAIR);
ORDER.forEach((o, rank) => { ARRIVALS[o.i] = T_LATTICE0 + FLIGHT + (rank / (ORDER.length - 1)) * (T_LATTICE1 - T_LATTICE0 - FLIGHT); });
export function ionsAt(t: number) {
  return SITES.map((s, i) => {
    if (PAIR_SITES.includes(i)) return { pos: s.pos, ion: s.ion, alpha: 1 };
    const u = clamp01((t - (ARRIVALS[i] - FLIGHT)) / FLIGHT), d = Math.hypot(...s.pos), far = 9;
    const k = 1 - (1 - u) ** 3, from: V3 = [s.pos[0] * (1 + far / d), s.pos[1] * (1 + far / d), s.pos[2] * (1 + far / d)];
    return { pos: mix3(from, s.pos, k), ion: s.ion, alpha: u <= 0 ? 0 : clamp01(u / 0.3) };
  });
}
/** The lattice turns into a clear crystal cube round it. */
export const crystalAt = (t: number) => prog(t, T_CRYSTAL, 0.25);
export const CRYSTAL_HALF = 1.5 * D + R('Cl-') + 0.1;

// ================= macro: the beaker =================
export const BEAKER = { x: 3.6, r: 0.75, h: 1.6, bulb: [3.6 + 1.2, 0.3, 0.3] as V3, battery: [3.6 - 1.2, 0.18, 0.3] as V3 };
/** The bottom ends of the two steel electrodes: − (to the battery's −) on the left, + on the right. */
export const ELECTRODES = { neg: [BEAKER.x - 0.35, 0.15, 0] as V3, pos: [BEAKER.x + 0.35, 0.15, 0] as V3, top: 2.0 };
const WATER_TOP = 1.15;
export const waterLevel = (t: number) => WATER_TOP * prog(t, T_POUR0, T_POUR1 - T_POUR0);
export const pourAt = (t: number) => prog(t, T_POUR0 - 0.15, 0.15) * (1 - prog(t, T_POUR1 - 0.1, 0.2));
/** Dry salt heaped between the electrodes; it dissolves once the water covers it. */
const GRAINS = (() => {
  const r = rng(5151);
  return Array.from({ length: 16 }, (_, i) => {
    const size = 0.09 + r() * 0.05, layer = i < 10 ? 0 : 1;
    return { pos: [BEAKER.x - 0.28 + r() * 0.56, size / 2 + layer * 0.1, -0.28 + r() * 0.56] as V3, size, spin: r() * Math.PI };
  });
})();
export const grainsAt = (t: number) => {
  const k = 1 - prog(t, T_DISSOLVE0, 0.7);
  return k <= 0.02 ? [] : GRAINS.map(g => ({ pos: g.pos, size: g.size * k, spin: g.spin }));
};
/** Free ions in the water: they leave the grains as they dissolve, wander, then drift to the electrode of opposite sign. */
const WATER_IONS = (() => {
  const r = rng(6262);
  return Array.from({ length: 20 }, (_, i) => ({
    ion: (i % 2 ? 'Na+' : 'Cl-') as 'Na+' | 'Cl-', grain: [GRAINS[i % GRAINS.length].pos[0], GRAINS[i % GRAINS.length].pos[1] + 0.06, GRAINS[i % GRAINS.length].pos[2]] as V3,
    home: [BEAKER.x - 0.27 + r() * 0.54, 0.18 + r() * 0.55, -0.42 + r() * 0.84] as V3, ph: r() * 6.28, w: 1.5 + r() * 1.5,
  }));
})();
const DRIFT = 0.13;
export function waterIonsAt(t: number) {
  if (t < T_DISSOLVE0) return [];
  const out = prog(t, T_DISSOLVE0, 0.8), lo = ELECTRODES.neg[0] + 0.06, hi = ELECTRODES.pos[0] - 0.06;
  return WATER_IONS.map(w => {
    const p = mix3(w.grain, w.home, out), sgn = w.ion === 'Na+' ? -1 : 1;
    const x = p[0] + 0.03 * Math.sin(w.w * t + w.ph) + sgn * DRIFT * Math.max(0, t - ANSWER2_AT);
    return { ion: w.ion, pos: [Math.min(hi, Math.max(lo, x)), p[1] + 0.03 * Math.cos(w.w * 1.3 * t + w.ph), p[2]] as V3 };
  });
}
export const bulbGlow = (t: number) => prog(t, ANSWER2_AT - 0.2, 0.4);

// ================= camera =================
export const BAND = { top: 470, width: 1080, height: 1000 };
const FOV = 30, DEG = Math.PI / 180;
/** Macro: [zoom, look-at x, look-at y], a fixed three-quarter view a little from above, plus the shake. */
const MACRO_DIST = 11, MACRO_AZ = 18 * DEG, MACRO_EL = 12 * DEG;
export const MACRO_CAMERA: { start: number[]; keys: Key[] } = {
  start: [1.0, 0, 1.9],
  keys: [
    { t: 0.5, dur: 2.2, to: [1.25, 0, 1.75] },                 // slow push in while it burns
    { t: 2.8, dur: 0.5, to: [3.0, 0, 1.45] },                  // punch into the smoke: it washes white (CUT1)
    { t: CUT2, dur: 0, to: [1.6, 0, 1.15] },                   // the cut back: the whole jar
    { t: ANSWER_AT - 0.5, dur: 0.5, to: [4.6, 0, 1.38] },      // punch-in on the salt in the spoon: the answer
    { t: T_SECOND, dur: 0.9, to: [1.2, BEAKER.x, 1.3] },       // across to the beaker
    { t: 11.3, dur: 0.45, to: [2.0, BEAKER.x, 0.65] },         // in between the electrodes
    { t: 12.9, dur: 1.2, to: [0.85, 1.8, 1.5] },               // out to both
  ],
};
/** Micro: [zoom, look-at x, y, z, azimuth°, elevation°]. */
const MICRO_DIST = 17;
export const MICRO_CAMERA: { start: number[]; keys: Key[] } = {
  start: [1.0, -0.3, NA_SITE[1], NA_SITE[2], 0, 0],
  keys: [
    { t: 3.5, dur: 1.4, to: [1.08, -0.3, NA_SITE[1], NA_SITE[2], 0, 4] },   // slow push in on the two atoms
    { t: T_SIZE1, dur: 0.3, to: [1.08, 0, NA_SITE[1], NA_SITE[2], 0, 4] },  // follow the pair as it snaps
    { t: T_LATTICE0, dur: 1.0, to: [0.44, 0, -1.2, 0, 32, 20] },           // pull back as the cube builds
    { t: 6.4, dur: 1.0, to: [0.46, 0, -1.2, 0, 38, 20] },                  // drift round the crystal
  ],
};
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
export function cameraAt(t: number): Camera {
  const aspect = BAND.width / BAND.height;
  if (sceneAt(t) === 'micro') {
    const [z, lx, ly, lz, az, el] = tween(t, MICRO_CAMERA.start, MICRO_CAMERA.keys), d = MICRO_DIST / z;
    return { position: [lx + d * Math.sin(az * DEG) * Math.cos(el * DEG), ly + d * Math.sin(el * DEG), lz + d * Math.cos(az * DEG) * Math.cos(el * DEG)],
      target: [lx, ly, lz], up: [0, 1, 0], fov: FOV, aspect };
  }
  const [z, lx, ly] = tween(t, MACRO_CAMERA.start, MACRO_CAMERA.keys), d = MACRO_DIST / z, [sx, sy] = shakeAt(t);
  return { position: [lx + sx + d * Math.sin(MACRO_AZ) * Math.cos(MACRO_EL), ly + sy + d * Math.sin(MACRO_EL), d * Math.cos(MACRO_AZ) * Math.cos(MACRO_EL)],
    target: [lx + sx, ly + sy, 0], up: [0, 1, 0], fov: FOV, aspect };
}
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit3 = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
/** Where a 3D point lands on the 1080 × 1920 page. */
export function project(p: V3, cam: Camera) {
  const f = unit3(sub(cam.target, cam.position)), r = unit3(cross(f, cam.up)), u = cross(r, f), d = sub(p, cam.position);
  const depth = dot(d, f), k = Math.tan((cam.fov * Math.PI) / 360);
  const xn = dot(d, r) / (depth * k * cam.aspect), yn = dot(d, u) / (depth * k);
  return { x: ((xn + 1) / 2) * BAND.width, y: BAND.top + ((1 - yn) / 2) * BAND.height, depth };
}

export const COVER_T = 0.45;

export const CAPTIONS: Caption[] = [
  { t0: 2.45, t1: CUT1, text: 'The green gas turns white' },
  { t0: 3.45, t1: 4.6, text: 'Sodium has one spare electron' },
  { t0: 4.6, t1: 5.75, text: 'Chlorine grabs it: + and −' },
  { t0: 5.75, t1: CUT2, text: 'They stack into a cube' },
  { t0: ANSWER_AT, t1: T_SECOND, text: 'Every salt grain is a cube' },
  { t0: T_SECOND, t1: ANSWER2_AT, text: 'Why does only salt water conduct?' },
  { t0: ANSWER2_AT, t1: 12.6, text: 'In water, the ions can move' },
  { t0: 12.6, t1: 14.4, text: 'Locked in a crystal, free in water' },
];
export const SECOND_HOOK = CAPTIONS[5];
export const END_LINES = ['Poison gas + explosive metal = salt', 'pyqvault.com', 'Follow for #11'];
export const MUSIC_HITS = [ANSWER_AT, ANSWER2_AT];

// Sound from the picture: the burst (crack, whump, boom) and the burning's roar with sparks crackling, the electron leaving
// (click) and landing (snap), the ions meeting (thunk), a tap per eight ions locking in (rising), a shimmer as the crystal
// forms and as the bulb lights, the pour; whooshes on the fast zooms (none across a cut: the wash hides those).
const cutAt = MACRO_CAMERA.keys.findIndex(k => k.dur === 0);
const crackle: Hit[] = Array.from({ length: Math.floor((2.1 - 0.35) / 0.13) }, (_, i) => ({ kind: 'click' as const, t: 0.35 + i * 0.13, gain: 0.08, pitch: 1.3 + 0.6 * (((i * 7919) % 100) / 100) }));
const taps: Hit[] = ORDER.filter((_, rank) => rank % 8 === 7 || rank === ORDER.length - 1)
  .map((o, k) => ({ kind: 'tap' as const, t: ARRIVALS[o.i], gain: 0.4, pitch: 1 + 0.15 * k }));
/** Every effect scaled together so they sit 5–10 dB under the music (F16). */
const FX = 0.75;
export const SOUND: Score = {
  duration: DURATION,
  hits: ([
    { kind: 'crack', t: T_ENTER, gain: 0.3 }, { kind: 'whump', t: T_ENTER, gain: 0.55 }, { kind: 'boom', t: T_ENTER + 0.05, gain: 0.45 },
    ...crackle,
    { kind: 'click', t: T_HOP0, gain: 0.35, pitch: 2 }, { kind: 'snap', t: T_HOP1, gain: 0.45 }, { kind: 'thunk', t: T_PAIR, gain: 0.55 },
    ...taps, { kind: 'shimmer', t: T_CRYSTAL, gain: 0.35 }, { kind: 'shimmer', t: ANSWER2_AT - 0.1, gain: 0.35 },
    ...whooshesFor(MACRO_CAMERA.start, MACRO_CAMERA.keys.slice(0, cutAt)),
    ...whooshesFor(MACRO_CAMERA.keys[cutAt].to, MACRO_CAMERA.keys.slice(cutAt + 1)),
    ...whooshesFor(MICRO_CAMERA.start, MICRO_CAMERA.keys),
  ] as Hit[]).map(h => ({ ...h, gain: h.gain * FX })).sort((a, b) => a.t - b.t),
  beds: [
    { kind: 'roar', t0: 0, t1: T_FLAME_OUT, level: (t: number) => 0.06 + 0.45 * flameAt(t) },
    { kind: 'rain', t0: T_POUR0, t1: T_POUR1, level: () => 0.35 },
  ],
};
