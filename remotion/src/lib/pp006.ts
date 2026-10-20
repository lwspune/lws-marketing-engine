// @pyqvault_ · Physics, visualised #6 (predict-first): one tennis shot, hit three ways (no spin, topspin, backspin).
// Class 11 Physics · Mechanical properties of fluids (Bernoulli / Magnus). Real tennis ball (57 g, r 3.3 cm) at 26 m/s,
// 14° up, from 1 m: gravity + drag ½ρC_D A v² + Magnus lift ½ρC_L A v² at right angles to the velocity (C_D 0.55,
// C_L 0.25, same spin rate both ways). Topspin's lift points down: it clears the net and dips in at 20.1 m; no spin lands
// 25.6 m (out, the court is 23.77 m); backspin floats to 33 m. Proven idea: @sciencevisualised "topspin vs slice" 1.10M
// (remake-backlog P12, topic score 8/10). Framework v1.5. Pure functions of t.
import { type Caption, type Key } from './motion.ts';
import { whooshesFor, type Score } from './sfx.ts';

export const DURATION = 22.0, END_AT = 18.6;
export const OPTIONS = ['A   dip', 'B   float', 'C   neither'], ANSWER = 0;

export const BALL = { r: 0.033, m: 0.057, h0: 1.0 };
export const COURT = { length: 23.77, net: 23.77 / 2, netH: 0.914 };
export const V0 = 26, ANGLE = (14 * Math.PI) / 180, G = 9.81;
const A = Math.PI * BALL.r ** 2, RHO = 1.2;
export const K_DRAG = (RHO * 0.55 * A) / (2 * BALL.m), K_LIFT = (RHO * 0.25 * A) / (2 * BALL.m);

export type SpinKey = 'none' | 'top' | 'back';
// s = +1 topspin (the ball turns forward: clockwise as seen with the ball flying right), −1 backspin.
export const SPINS: { key: SpinKey; s: number; label: string }[] = [
  { key: 'none', s: 0, label: 'no spin' },
  { key: 'top', s: 1, label: 'topspin' },
  { key: 'back', s: -1, label: 'backspin' },
];
const S = (key: SpinKey) => SPINS.find(x => x.key === key)!.s;

// Magnus acceleration: K_LIFT·|v|·(ω̂ × v) with ω̂ = −s·ẑ, i.e. (vy, −vx)·s·K_LIFT·|v|.
const lift = (s: number, vx: number, vy: number): [number, number] => {
  const sp = Math.hypot(vx, vy);
  return [s * K_LIFT * sp * vy, -s * K_LIFT * sp * vx];
};
const accel = (s: number, vx: number, vy: number): [number, number] => {
  const sp = Math.hypot(vx, vy), [lx, ly] = lift(s, vx, vy);
  return [-K_DRAG * sp * vx + lx, -G - K_DRAG * sp * vy + ly];
};

// RK4 from launch to the bounce (ball's bottom on the court), then the exact crossing by interpolation.
const DT = 1e-4;
type Flight = { st: number[][]; land: { x: number; t: number; v: [number, number] } };
function fly(s: number): Flight {
  const st = [[0, BALL.h0, V0 * Math.cos(ANGLE), V0 * Math.sin(ANGLE)]];
  for (;;) {
    const [x, y, vx, vy] = st[st.length - 1];
    const f = (u: number[]) => { const [ax, ay] = accel(s, u[2], u[3]); return [u[2], u[3], ax, ay]; };
    const add = (u: number[], k: number[], h: number) => u.map((v, i) => v + h * k[i]);
    const u = [x, y, vx, vy], k1 = f(u), k2 = f(add(u, k1, DT / 2)), k3 = f(add(u, k2, DT / 2)), k4 = f(add(u, k3, DT));
    const n = u.map((v, i) => v + (DT / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    st.push(n);
    if (n[1] <= BALL.r) {
      const a = (y - BALL.r) / (y - n[1]), i = st.length - 2;
      const mid = u.map((v, j) => v + a * (n[j] - v));
      st[st.length - 1] = mid;
      return { st, land: { x: mid[0], t: (i + a) * DT, v: [mid[2], mid[3]] } };
    }
  }
}
const FLIGHTS: Record<SpinKey, Flight> = { none: fly(0), top: fly(1), back: fly(-1) };

export const landing = (key: SpinKey) => FLIGHTS[key].land;

/** Position (m) and velocity (m/s) at flight time tau (s after the hit); stays where it landed after that. */
export function flightAt(key: SpinKey, tau: number): { p: [number, number]; v: [number, number] } {
  const { st, land } = FLIGHTS[key];
  if (tau <= 0) return { p: [st[0][0], st[0][1]], v: [st[0][2], st[0][3]] };
  if (tau >= land.t) return { p: [land.x, BALL.r], v: land.v };
  const k = tau / DT, i = Math.floor(k), a = k - i, u = st[i], n = st[Math.min(i + 1, st.length - 1)];
  const at = (j: number) => u[j] + a * (n[j] - u[j]);
  return { p: [at(0), at(1)], v: [at(2), at(3)] };
}
export const liftAccel = (key: SpinKey, tau: number): [number, number] => { const [vx, vy] = flightAt(key, tau).v; return lift(S(key), vx, vy); };

// Screen time: the balls spin on the machine, the machine fires at T_HIT, the flight plays at ×SLOW.
export const T_HIT = 1.0, SLOW = 0.4;
export const flightTime = (t: number) => Math.max(0, (t - T_HIT) * SLOW);
export const landsAt = (key: SpinKey) => T_HIT + landing(key).t / SLOW;
// Drawn spin: 1.2 turns a second on screen (the real ~35 turns a second can't be seen), forward for topspin.
export const spinAngleAt = (key: SpinKey, t: number) => -S(key) * 2 * Math.PI * 1.2 * t;

export const ANSWER_AT = landsAt('top') + 0.45;

export const CAPTIONS: Caption[] = [
  { t0: 0.9, t1: landsAt('top'), text: 'Same hit, three spins (slow motion)' },
  { t0: landsAt('top'), t1: 6.3, text: 'Topspin dips in. The rest: out!' },
  { t0: 6.3, t1: 9.6, text: 'Topspin throws the air upward' },
  { t0: 9.6, t1: 12.6, text: 'Air goes up, ball goes down' },
  { t0: 12.6, t1: 15.4, text: 'Backspin: air down, ball floats' },
  { t0: 15.4, t1: END_AT, text: 'That’s why players hit topspin' },
];
export const MUSIC_HITS = [ANSWER_AT];

/** Which spin the air picture is showing (the close-up of one ball with the air flowing past). */
export const flowMode = (t: number): 'top' | 'back' | null => (t >= 6.3 && t < 12.6 ? 'top' : t >= 12.6 && t < 15.4 ? 'back' : null);

// Camera: [zoom, focus x along the court in m]. On the machine from frame 0 (the balls spinning), a slow push that
// follows the balls down the court, a punch-in on the topspin bounce landing on the answer, a slow pan out to where the
// others land, a quick zoom out for the air picture, and a gentle push back to the bounce inside the court at the end.
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1.5, 3],
  keys: [
    { t: 0, dur: 1.0, to: [1.6, 3.5] },
    { t: 1.1, dur: 2.3, to: [1.3, 15] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.55, landing('top').x] },
    { t: 4.6, dur: 1.3, to: [1.3, 26] },
    { t: 6.1, dur: 0.7, to: [1.0, 17] },
    { t: 15.4, dur: 2.6, to: [1.15, 19] },
  ],
};

// Sound from the picture: the ball machine fires once, each ball bounces where it lands, whooshes on the fast zooms.
export const SOUND: Score = {
  duration: DURATION,
  hits: [
    { kind: 'whump', t: T_HIT, gain: 0.55 },
    ...SPINS.map(s => ({ kind: 'thunk' as const, t: landsAt(s.key), gain: 0.5 })),
    ...whooshesFor(CAMERA.start, CAMERA.keys),
  ],
  beds: [],
};
