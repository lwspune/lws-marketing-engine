// @pyqvault_ · Physics, visualised #7 (predict-first): lift the wall between a hot gas and a cold gas. Class 11 Physics ·
// Thermodynamics / kinetic theory. 600 K on the left, 200 K on the right, at the same pressure (p = nkT, so the cold side
// holds 3× the molecules). 2,400 hard spheres in a box, elastic collisions (equal masses swap the velocity along the line
// of centres, so energy is conserved exactly): the speed spreads by collisions until both sides read 300 K, the
// molecule-weighted average, and it never flows back. Proven idea: @bisal.physics "heat flows hot → cold" 457k
// (remake-backlog P9, topic score 8/10). Framework v1.6.
//
// One simulation drives the picture, the thermometers and the sound. It uses only + − × ÷ and √ on doubles (IEEE-exact
// in every JS engine) with a seeded generator, so Node (tests, sound) and Edge (render) compute the identical run.
// Thermometers show a 2 s average in 10 K steps, like a real one: with 2,400 molecules the reading would wobble a few
// kelvin (a real gas has ~10²³ and doesn't).
import { prog, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';

export const DURATION = 22.0, END_AT = 18.6, FPS = 30, FRAMES = Math.round(DURATION * FPS);
export const OPTIONS = ['A   equal', 'B   apart', 'C   swap'], ANSWER = 0;   // "apart": hot hotter, cold colder; "swap": cold ends hotter
export const T_HOT0 = 600, T_COLD0 = 200, N_HOT = 600, N_COLD = 1800, N = N_HOT + N_COLD;
export const BOX = { l: 1.5, h: 1.0, d: 0.5 };               // x ∈ [−l, l] (wall at 0), y ∈ [0, h], z ∈ [−d, d]
export const R_HIT = 0.011;                                    // collision radius (molecules are drawn a little bigger)
const C = 1.8;                                                 // rms speed at 200 K (scene units / s): slowed down
export const T_OPEN = 1.0, T_LIFTED = 1.6;
export const wallBottomAt = (t: number) => BOX.h * prog(t, T_OPEN, T_LIFTED - T_OPEN);
export const tempOfSpeedSq = (v2: number) => (T_COLD0 * v2) / (C * C);

const HZ = 300, SUB = HZ / FPS, PER_TAP = 50;                  // one tap is heard for every 50 real hits on an end wall
export type Tap = { t: number; i: number; wall: 'left' | 'right'; gain: number; pitch: number };

export function simulate() {
  let seed = 7007;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = () => { let a = 0; for (let k = 0; k < 12; k++) a += rnd(); return a - 6; };   // near-normal, no log/cos
  const x = new Float64Array(N), y = new Float64Array(N), z = new Float64Array(N);
  const vx = new Float64Array(N), vy = new Float64Array(N), vz = new Float64Array(N);
  const { l: L, h: H, d: D } = BOX, R = R_HIT;
  for (let i = 0; i < N; i++) {
    x[i] = i < N_HOT ? -L + R + rnd() * (L - 2 * R) : R + rnd() * (L - 2 * R);
    y[i] = R + rnd() * (H - 2 * R); z[i] = -D + R + rnd() * (2 * D - 2 * R);
    vx[i] = gauss(); vy[i] = gauss(); vz[i] = gauss();
  }
  // Each side: no net drift, and exactly its temperature (mean v² = C² × T / 200 K).
  const settle = (a: number, b: number, meanV2: number) => {
    let mx = 0, my = 0, mz = 0; const n = b - a;
    for (let i = a; i < b; i++) { mx += vx[i]; my += vy[i]; mz += vz[i]; }
    let k = 0;
    for (let i = a; i < b; i++) { vx[i] -= mx / n; vy[i] -= my / n; vz[i] -= mz / n; k += vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i]; }
    const f = Math.sqrt((meanV2 * n) / k);
    for (let i = a; i < b; i++) { vx[i] *= f; vy[i] *= f; vz[i] *= f; }
  };
  settle(0, N_HOT, (C * C * T_HOT0) / T_COLD0); settle(N_HOT, N, C * C);

  const pos = new Float32Array(FRAMES * N * 3), sp2 = new Float32Array(FRAMES * N);
  const energy = new Float64Array(FRAMES), left = new Float64Array(FRAMES), right = new Float64Array(FRAMES);
  const taps: Tap[] = [], hits = { left: { n: 0, vx2: 0 }, right: { n: 0, vx2: 0 } };
  const wallHit = (t: number, i: number, wall: 'left' | 'right', v: number) => {
    const w = hits[wall]; w.n++; w.vx2 += v * v;
    if (w.n === PER_TAP) { taps.push(tap(t, i, wall, w.vx2 / PER_TAP)); w.n = 0; w.vx2 = 0; }
  };
  const cell = 2 * R, GX = Math.ceil((2 * L) / cell), GY = Math.ceil(H / cell), GZ = Math.ceil((2 * D) / cell);
  const head = new Int32Array(GX * GY * GZ), next = new Int32Array(N), home = new Int32Array(N);
  const dt = 1 / HZ;
  const record = (f: number) => {
    let e = 0, kl = 0, nl = 0, kr = 0, nr = 0;
    for (let i = 0; i < N; i++) {
      const v2 = vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i];
      pos[3 * (f * N + i)] = x[i]; pos[3 * (f * N + i) + 1] = y[i]; pos[3 * (f * N + i) + 2] = z[i]; sp2[f * N + i] = v2;
      e += v2; if (x[i] < 0) { kl += v2; nl++; } else { kr += v2; nr++; }
    }
    energy[f] = e; left[f] = tempOfSpeedSq(kl / nl); right[f] = tempOfSpeedSq(kr / nr);
  };
  record(0);
  for (let st = 1; st < FRAMES * SUB; st++) {
    const t = st * dt, bottom = wallBottomAt(t), walled = t < T_LIFTED;
    for (let i = 0; i < N; i++) {
      const wasLeft = x[i] < 0;
      x[i] += vx[i] * dt; y[i] += vy[i] * dt; z[i] += vz[i] * dt;
      // Walls mirror the molecule back in and flip that velocity: no energy lost.
      if (x[i] < -L + R) { x[i] = 2 * (-L + R) - x[i]; vx[i] = -vx[i]; wallHit(t, i, 'left', vx[i]); }
      if (x[i] > L - R) { x[i] = 2 * (L - R) - x[i]; vx[i] = -vx[i]; wallHit(t, i, 'right', vx[i]); }
      if (y[i] < R) { y[i] = 2 * R - y[i]; vy[i] = -vy[i]; }
      if (y[i] > H - R) { y[i] = 2 * (H - R) - y[i]; vy[i] = -vy[i]; }
      if (z[i] < -D + R) { z[i] = 2 * (-D + R) - z[i]; vz[i] = -vz[i]; }
      if (z[i] > D - R) { z[i] = 2 * (D - R) - z[i]; vz[i] = -vz[i]; }
      if (walled && wasLeft !== x[i] < 0 && y[i] + R > bottom) { x[i] = -x[i]; vx[i] = -vx[i]; }   // the dividing wall
    }
    head.fill(-1);
    for (let i = 0; i < N; i++) {
      const a = Math.min(GX - 1, Math.max(0, Math.floor((x[i] + L) / cell))), b = Math.min(GY - 1, Math.max(0, Math.floor(y[i] / cell)));
      const c = Math.min(GZ - 1, Math.max(0, Math.floor((z[i] + D) / cell))), k = (a * GY + b) * GZ + c;
      home[i] = k; next[i] = head[k]; head[k] = i;
    }
    for (let i = 0; i < N; i++) {
      const k = home[i], a = Math.floor(k / (GY * GZ)), b = Math.floor(k / GZ) % GY, c = k % GZ;
      for (let da = -1; da <= 1; da++) for (let db = -1; db <= 1; db++) for (let dc = -1; dc <= 1; dc++) {
        const A = a + da, B = b + db, Cc = c + dc;
        if (A < 0 || B < 0 || Cc < 0 || A >= GX || B >= GY || Cc >= GZ) continue;
        for (let j = head[(A * GY + B) * GZ + Cc]; j !== -1; j = next[j]) {
          if (j <= i) continue;
          const dx = x[j] - x[i], dy = y[j] - y[i], dz = z[j] - z[i], d2 = dx * dx + dy * dy + dz * dz;
          if (d2 >= 4 * R * R || d2 === 0) continue;
          const dv = (vx[j] - vx[i]) * dx + (vy[j] - vy[i]) * dy + (vz[j] - vz[i]) * dz;
          if (dv >= 0) continue;                                // already moving apart
          const q = dv / d2;                                    // equal masses: swap the velocity along the line of centres
          vx[i] += q * dx; vy[i] += q * dy; vz[i] += q * dz; vx[j] -= q * dx; vy[j] -= q * dy; vz[j] -= q * dz;
        }
      }
    }
    if (st % SUB === 0) record(st / SUB);
  }
  const at = (f: number) => Math.max(0, Math.min(FRAMES - 1, f));
  return {
    positionsAt: (f: number) => pos.subarray(3 * N * at(f), 3 * N * (at(f) + 1)),
    speedSqAt: (f: number) => sp2.subarray(N * at(f), N * (at(f) + 1)),
    energyAt: (f: number) => energy[at(f)],
    rawTemps: (f: number) => ({ left: left[at(f)], right: right[at(f)] }),
    taps,
  };
}

// A tap's loudness is the average energy its 50 hits brought to the wall: the gas's temperature at that wall (molecules
// that reach a wall are the faster ones, mean vx² = 2kT/m, so T = 200 K × 1.5·vx² / C²). The hot end a little higher pitched.
function tap(t: number, i: number, wall: 'left' | 'right', meanVx2: number): Tap {
  return { t, i, wall, gain: (0.85 * tempOfSpeedSq(1.5 * meanVx2)) / T_HOT0, pitch: (wall === 'left' ? 1.1 : 0.9) + 0.08 * (((i * 7919) % 1000) / 1000) };
}

const SIM = simulate();
export const { positionsAt, speedSqAt, energyAt, rawTemps } = SIM;

// The thermometers: the last 2 s averaged, shown in 10 K steps. `smoothTemps` (unrounded) draws the graph.
const WINDOW = 2 * FPS;
export function smoothTemps(t: number) {
  const f = Math.max(0, Math.min(FRAMES - 1, Math.round(t * FPS))), f0 = Math.max(0, f - WINDOW + 1);
  let l = 0, r = 0;
  for (let k = f0; k <= f; k++) { const s = rawTemps(k); l += s.left; r += s.right; }
  return { left: l / (f - f0 + 1), right: r / (f - f0 + 1) };
}
export const shownTemps = (t: number) => { const s = smoothTemps(t); return { left: Math.round(s.left / 10) * 10, right: Math.round(s.right / 10) * 10 }; };

// The answer lights when the two thermometers first read within 10 K.
const MEET = (() => {
  for (let f = Math.ceil(T_OPEN * FPS); f < FRAMES; f++) { const s = shownTemps(f / FPS); if (s.left - s.right <= 10) return f; }
  return FRAMES - 1;
})();
export const ANSWER_AT = MEET / FPS;

// The heat arrow between the thermometers: draws itself as the wall lifts, as thick as the gap, gone once they meet.
export function heatArrowAt(t: number) {
  const s = smoothTemps(t), gap = Math.max(0, Math.min(1, (s.left - s.right) / (T_HOT0 - T_COLD0)));
  return { draw: prog(t, T_OPEN + 0.2, 0.8), width: 4 + 22 * gap, opacity: 1 - prog(t, ANSWER_AT, 0.6) };
}

export const CAPTIONS: Caption[] = [
  { t0: 0.9, t1: 2.6, text: 'Hot = fast molecules. Cold = slow.' },
  { t0: 2.6, t1: ANSWER_AT, text: 'Each bump passes speed along' },
  { t0: ANSWER_AT, t1: ANSWER_AT + 3, text: 'Equal: both 300 K' },
  { t0: ANSWER_AT + 3, t1: 12.4, text: 'Heat flows hot → cold' },
  { t0: 12.4, t1: 15.4, text: 'Never back on its own' },
  { t0: 15.4, t1: END_AT, text: 'That’s the second law' },
];
export const MUSIC_HITS = [ANSWER_AT];

// Camera: [zoom, focus] with focus −1 = the hot end, 0 = the wall, +1 = the cold end. A drift towards the hot side from
// frame 0, a slow push in on the wall as it lifts and the gases mix, a punch-in landing on the answer, a quick zoom out
// to the whole box, then a gentle push for the last line.
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [0.95, 0],
  keys: [
    { t: 0, dur: 1.0, to: [1.05, -0.3] },
    { t: 1.1, dur: 3.2, to: [1.25, 0] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.55, 0] },
    { t: ANSWER_AT + 2.6, dur: 0.7, to: [1.0, 0] },
    { t: 13.5, dur: 3.0, to: [1.15, 0.2] },
  ],
};

// Sound from the picture: molecules tapping the end walls (one tap per 50 real hits) (the hot end softens as it cools, the cold end grows
// louder as it warms), the wall's slide while it lifts and a thunk when it stops, whooshes on the fast zooms.
export const TAPS = SIM.taps.filter(h => h.t < END_AT);
const LIFT_V = 1 / (T_LIFTED - T_OPEN);
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    ...TAPS.map((h): Hit => ({ kind: 'tap', t: h.t, gain: h.gain, pitch: h.pitch })),
    { kind: 'thunk', t: T_LIFTED, gain: 0.5 },
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [{ kind: 'scrape', t0: T_OPEN, t1: T_LIFTED, level: t => (wallBottomAt(t + 0.01) - wallBottomAt(t)) / (0.01 * BOX.h * LIFT_V * 2) }],
};
