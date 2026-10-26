// @pyqvault_ · Physics, visualised #13 (predict-first, "You'd think" + the first Shock opening): lightning hits your car.
// What saves you: the rubber tyres, the metal body, or luck? The metal body. A car is a closed metal shell: the charge
// rides its outside down to the road (jumping right past the tyres, which kilometres of air already failed to stop), and
// inside a closed conductor the field is zero (Gauss's law: no charge inside, no field). Then the second hook (F26): is a
// convertible safe? No: with the roof folded away there is no cage, and a second bolt's path runs through the cabin.
// Class 12 Physics · Electrostatics (conductors). Backlog P51 (idea score 55; founder's pick, 2026-10-23). Framework v1.28:
// entertainment first, the result real (F10): slow motion and drama, no disclaimers on screen ("not to scale" and "slow
// motion" are in the caption). Dark board (L22: lightning and its glow need the dark). Nobody real: a crash-test dummy
// drives. Pure functions of t; world units are metres, x along the car (front +x), y up, z across (+z toward the camera).
//
// BEAT TABLE (runbook step 1)
// | time        | what moves                                                         | caption                          | keep in frame        | colours (LAB board)                         |
// | 0 HOOK      | Shock: rain falling, the leader already zig-zagging down; it strikes| question + A/B/C + tag (F4, F20) | car, roof, the bolt's| bolt white-violet glow, steel body (REAL),  |
// |   0–1 s     | the roof at 0.20 s, 3 return strokes: white flash, sparks, shake   |                                  | last metre           | sparks amber, rain pale blue                |
// | 0.2–3.6 s   | cyan charge streams from the roof over the outside of the shell    | Charge races over the metal (2.8)| car                  | charge VIVID cyan                           |
// | 3.6 s       | the camera drops to the front wheel: arcs jump past the tyres      | It jumps right past the tyres    | front wheel          | arcs cyan, tyre rubber dark                 |
// | 5.4 ANSWER  | punch-in on the cabin: the dummy untouched, "E = 0"; "B" lights    | The metal shell carries it       | cabin, dummy         | dummy yellow (real crash-test yellow)       |
// | 6.6 2nd     | "Is a convertible safe?": zoom out, the roof folds into the boot   | Is a convertible safe?           | car                  |                                             |
// | 7.8 s       | a second bolt strikes straight into the open cabin                 |                                  | cabin                | danger path VIVID red                       |
// | 9.0 ANSWER2 | the red path runs through the seat: no roof, no cage               | No roof: no cage                 | cabin                |                                             |
// | 10.8–11.6   | the roof folds back; zoom out                                      |                                  | car                  |                                             |
// | 11.4 s      | field lines from the cloud end on the outside of the metal         | Inside a metal shell: E = 0      | car                  | field lines pale blue                       |
// | 13.6 s      | slow push in, rain                                                 | Stay inside, windows up          | car                  |                                             |
// | 15.6–17.0   | loop: the lines fade, the chips reset, a new leader starts at 16.7 | —                                | car                  |                                             |
// Pairs told apart (F24, tests): charge cyan vs danger red, each vs the steel body, the dummy's yellow vs the danger red.
import { prog, tween, clamp01, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';

export type V3 = [number, number, number];

export const DURATION = 17.0, LOOP_AT = 15.6;
/** The stepped leader starts 0.3 s before frame 0 (and 0.3 s before the loop's end): on frame 0 it is already well on
    its way down, inside the picture. */
export const T_LEADER = -0.3;
/** A flash is a few return strokes down one channel, tens of milliseconds apart (real flashes: 3–4, 40–60 ms). */
export const STROKES = [0.2, 0.26, 0.32];
export const T_STRIKE = STROKES[0];
export const HEADER = ['Lightning hits your car.', 'What saves you?'];
export const OPTIONS = ['A  tyres', 'B  metal body', 'C  luck'], ANSWER = 1;
export const BRAND = 'PYQ Vault · pyqvault.com';
export const T_TYRES = 3.6, ANSWER_AT = 5.4, T_SECOND = 6.6, ROOF_CLOSE = 10.8, ANSWER2_AT = 9.0, T_FIELD = 11.4, T_SAFE = 13.6;
export const STROKES2 = [7.8, 7.86, 7.92];
/** The charge streams over the shell from the strike until just after the answer; gone before the roof moves. */
export const FLOW_END = ANSWER_AT + 0.4;

// ---- the car: a lower body and a cabin (rounded boxes in the scene), four wheels ----
export const CAR = {
  body: { x0: -2.2, x1: 2.2, y0: 0.3, y1: 1.0, zh: 0.9 },
  cabin: { x0: -1.05, x1: 1.25, y0: 1.0, y1: 1.58, zh: 0.8 },
  wheel: { x: 1.4, y: 0.33, r: 0.33, z: 0.86, w: 0.24, gap: 0.04 },
};
export const ROOF_HIT: V3 = [0.1, CAR.cabin.y1, 0];
export const DUMMY_HEAD: V3 = [0.15, 1.3, 0.3];
export const CABIN_HIT: V3 = [0.15, 1.42, 0.3];        // the top of the dummy's head: the highest point once the roof is gone
export const CLOUD_Y = 8.0;

// Signed distance to the car's outer shell (the union of the two boxes): 0 on its surface.
const sdBox = (p: V3, lo: V3, hi: V3) => {
  const q = p.map((v, i) => Math.max(lo[i] - v, v - hi[i]));
  const out = Math.hypot(...q.map(v => Math.max(v, 0)));
  return out > 0 ? out : Math.max(...q);
};
const B = CAR.body, C = CAR.cabin;
export const shellDistance = (p: V3) => Math.min(
  sdBox(p, [B.x0, B.y0, -B.zh], [B.x1, B.y1, B.zh]),
  sdBox(p, [C.x0, C.y0, -C.zh], [C.x1, C.y1, C.zh]),
);
/** The passenger space: inside the cabin glass and down into the footwell. */
export const insideCabin = (p: V3) => p[0] > -1.0 && p[0] < 1.2 && p[1] > 0.45 && p[1] < 1.53 && Math.abs(p[2]) < 0.75;

// ---- seeded numbers: the same on every render and in the tests ----
const rng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

/** A jagged bolt from a to b: midpoint displacement, sideways only, so it always comes down. */
function jag(a: V3, b: V3, seed: number, depth: number, spread: number): V3[] {
  const r = rng(seed);
  let pts: V3[] = [a, b];
  for (let d = 0; d < depth; d++) {
    const next: V3[] = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], q = pts[i], s = spread / 2 ** d;
      next.push([(p[0] + q[0]) / 2 + (r() - 0.5) * s, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2 + (r() - 0.5) * s * 0.6], q);
    }
    pts = next;
  }
  return pts;
}
export const BOLT = jag([-1.6, CLOUD_Y, -0.6], ROOF_HIT, 1301, 5, 2.2);
export const BOLT2 = jag([1.4, CLOUD_Y, -0.4], CABIN_HIT, 1307, 5, 2.2);
/** Two short side branches off each bolt (they fade with it). */
export const BRANCHES = [BOLT, BOLT2].map((b, k) => [8, 15].map((i, j) => jag(b[i], [b[i][0] + (j ? 1.4 : -1.2), b[i][1] - 1.6, b[i][2] + 0.3], 1400 + k * 10 + j, 3, 0.7)));

/** Time within the loop: the last 0.3 s belongs to the next pass's leader, so the reel runs on into frame 0 (F27). */
const loopT = (t: number) => (t >= DURATION + T_LEADER ? t - DURATION : t);

/** How much of the first bolt's channel the leader has drawn (0–1). */
export const leaderAt = (t: number) => clamp01((loopT(t) - T_LEADER) / (T_STRIKE - T_LEADER));
const glow = (u: number, strokes: number[], leaderFrom: number) => {
  if (u < leaderFrom) return 0;
  if (u < strokes[0]) return 0.7;
  const fade = 1 - prog(u, strokes[0] + 0.35, 0.5);
  if (fade <= 0) return 0;
  const spikes = strokes.filter(s => s <= u).reduce((a, s) => a + Math.exp(-(u - s) / 0.045), 0);
  return Math.min(1, (0.3 + spikes) * fade);
};
/** The first bolt's brightness: a faint leader, a spike per return stroke, gone by ~1 s. */
export const boltGlow = (t: number) => glow(loopT(t), STROKES, T_LEADER);
/** Light thrown on the car by the return strokes only (none from the leader). */
const spikesAt = (u: number, strokes: number[]) => (u < strokes[0] ? 0 : Math.min(1, strokes.filter(s => s <= u && u - s < 0.6).reduce((a, s) => a + Math.exp(-(u - s) / 0.045), 0)));
export const strokeLight = (t: number) => spikesAt(loopT(t), STROKES);
export const stroke2Light = (t: number) => spikesAt(t, STROKES2);
export const leader2At = (t: number) => clamp01((t - (STROKES2[0] - 0.3)) / 0.3);
export const bolt2Glow = (t: number) => glow(t, STROKES2, STROKES2[0] - 0.3);
/** The white flash over the whole frame, per return stroke: bright, and gone in tens of milliseconds so the bolt shows. */
export const flashAt = (t: number) => Math.min(0.6, [...STROKES, ...STROKES2]
  .filter(s => t >= s && t - s < 0.4).reduce((a, s) => a + 0.55 * Math.exp(-(t - s) / 0.03), 0));
/** The camera shake after each strike, dying away in about a second. */
export function shakeAt(t: number): [number, number] {
  const amp = [STROKES[0], STROKES2[0]].filter(s => t >= s && t - s < 1.5).reduce((a, s) => a + 0.12 * Math.exp(-(t - s) / 0.22), 0);
  return [amp * Math.sin(61 * t), amp * 0.6 * Math.cos(53 * t)];
}

/** Sparks thrown off where each bolt lands: ballistic, under real gravity, each fading over its life. */
const SPARKS = (() => {
  const r = rng(1313);
  return Array.from({ length: 48 }, () => {
    const az = r() * 2 * Math.PI, el = (15 + r() * 65) * (Math.PI / 180), sp = 2.5 + r() * 3;
    return { v: [sp * Math.cos(el) * Math.cos(az), sp * Math.sin(el), sp * Math.cos(el) * Math.sin(az)] as V3, life: 0.5 + r() * 0.4 };
  });
})();
export function sparksAt(t: number) {
  const out: { pos: V3; alpha: number }[] = [];
  for (const [s, o] of [[STROKES[0], ROOF_HIT], [STROKES2[0], CABIN_HIT]] as [number, V3][]) {
    for (const k of SPARKS) {
      const tau = t - s;
      if (tau < 0 || tau >= k.life) continue;
      out.push({ pos: [o[0] + k.v[0] * tau, o[1] + k.v[1] * tau - 4.9 * tau * tau, o[2] + k.v[2] * tau], alpha: 1 - tau / k.life });
    }
  }
  return out;
}

// ---- the charge on the outside of the shell: four paths from the roof, each down a pillar and a side to a wheel arch ----
const ARCH_Y = CAR.wheel.y + CAR.wheel.r + CAR.wheel.gap;
const side = (sx: number, sz: number): V3[] => [
  ROOF_HIT,
  [sx > 0 ? 1.0 : -0.8, C.y1, sz * C.zh],
  [sx > 0 ? C.x1 : C.x0, C.y0, sz * C.zh],
  [sx * CAR.wheel.x, B.y1, sz * B.zh],
  [sx * CAR.wheel.x, ARCH_Y, sz * B.zh],
];
export const SKIN: V3[][] = [side(1, 1), side(-1, 1), side(1, -1), side(-1, -1)];
const lengths = (p: V3[]) => p.slice(1).map((q, i) => Math.hypot(q[0] - p[i][0], q[1] - p[i][1], q[2] - p[i][2]));
function along(p: V3[], u: number): V3 {
  const L = lengths(p), total = L.reduce((a, b) => a + b, 0);
  let d = u * total;
  for (let i = 0; i < L.length; i++) {
    if (d <= L[i] || i === L.length - 1) { const k = L[i] ? Math.min(1, d / L[i]) : 0; return p[i].map((v, j) => v + (p[i + 1][j] - v) * k) as V3; }
    d -= L[i];
  }
  return p[p.length - 1];
}
/** Slow motion: the charge is drawn creeping at a few metres a second (the caption says so). */
const PER_PATH = 10, SPEED_U = 1.6;
const flowAlpha = (t: number) => prog(t, T_STRIKE, 0.15) * (1 - prog(t, FLOW_END, 0.6));
export function chargeAt(t: number) {
  if (t < T_STRIKE || t >= FLOW_END + 0.6) return [];
  const a = flowAlpha(t), out: { pos: V3; alpha: number }[] = [];
  SKIN.forEach((path, j) => {
    for (let k = 0; k < PER_PATH; k++) {
      const u = (t - T_STRIKE) * SPEED_U - k / PER_PATH;
      if (u < 0) continue;
      out.push({ pos: along(path, (u + j * 0.13) % 1), alpha: a });
    }
  });
  return out;
}
/** Each path's last leg: an arc from the wheel arch down to the wet road, outside the tyre. Re-jagged 12 times a second. */
export function arcsAt(t: number) {
  if (t < T_STRIKE + 0.15 || t >= FLOW_END + 0.6) return [];
  const emphasis = 0.55 + 0.45 * prog(t, T_TYRES - 0.3, 0.3) * (1 - prog(t, ANSWER_AT, 0.4));
  return SKIN.map((path, j) => {
    const from = path[path.length - 1], sx = Math.sign(from[0]), sz = Math.sign(from[2]);
    const to: V3 = [from[0] + sx * 0.22, 0, sz * 1.15];
    return { from, to, alpha: flowAlpha(t) * emphasis, seed: 1500 + j * 97 + Math.floor(t * 12) };
  });
}
export const arcPath = (a: { from: V3; to: V3; seed: number }) => jag(a.from, a.to, a.seed, 3, 0.35);

// ---- the convertible ----
export const roofOpen = (t: number) => prog(t, T_SECOND, 0.8) * (1 - prog(t, ROOF_CLOSE, 0.8));
/** No roof, no cage: from the dummy's head down through the seat to the floor, then out to the road. */
export const DANGER: V3[] = [CABIN_HIT, [0.15, 1.0, 0.3], [0.1, 0.55, 0.3], [0.1, 0.5, 0.75], [0.1, B.y0, B.zh], [0.25, 0, 1.15]];
export const dangerAlpha = (t: number) => (t < STROKES2[0] ? 0 : (1 - 0.25 * prog(t, STROKES2[0] + 0.2, 0.6)) * (1 - prog(t, ROOF_CLOSE - 0.6, 0.6)));

// ---- the why: field lines from the cloud end on the outside of the metal (perpendicular to it), none inside ----
export function fieldLines(): V3[][] {
  const out: V3[][] = [];
  for (const z of [0]) for (let x = -3; x <= 3.01; x += 0.5) {
    const onCabin = z === 0 && x > C.x0 && x < C.x1, onBody = z === 0 && x > B.x0 && x < B.x1;
    const end = onCabin ? C.y1 : onBody ? B.y1 : 0;
    out.push(Array.from({ length: 9 }, (_, k) => [x, CLOUD_Y + (end - CLOUD_Y) * (k / 8), z] as V3));
  }
  return out;
}
export const fieldAlpha = (t: number) => prog(t, T_FIELD, 0.8) * (1 - prog(t, LOOP_AT, 0.6));
/** Inside a closed conductor with no charge inside: Gauss's law gives zero flux through any surface in the cabin, so E = 0. */
export const E_INSIDE = 0;

// ---- rain: real drops fall at about 9 m/s; one fall takes exactly 1 s, so it repeats with the loop ----
const RAIN_TOP = 8.6, RAIN_FALL = 9.2, RAIN_PERIOD = 1.0;
export const RAIN_SPEED = RAIN_FALL / RAIN_PERIOD;
const DROPS = (() => { const r = rng(1777); return Array.from({ length: 170 }, () => ({ x: -6 + r() * 12, z: -4 + r() * 7, ph: r() })); })();
export const rainAt = (t: number): V3[] => DROPS.map(d => {
  const f = t / RAIN_PERIOD + d.ph;
  return [d.x, RAIN_TOP - RAIN_FALL * (f - Math.floor(f)), d.z];
});

// ---- camera: [zoom, look-at x, look-at y]; shake added on top ----
export const BAND = { top: 470, width: 1080, height: 1000 };
const DIST = 13, EL = (6 * Math.PI) / 180, AZ = (28 * Math.PI) / 180, FOV = 30;
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1.0, 0.0, 2.6],
  keys: [
    { t: 0.6, dur: 2.0, to: [1.25, 0.1, 1.5] },                     // slow push in once the strike has landed
    { t: T_TYRES - 0.5, dur: 0.6, to: [1.55, 1.2, 0.75] },           // down to the front wheel
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.7, 0.15, 1.15] },       // punch-in on the cabin: the answer
    { t: T_SECOND, dur: 0.8, to: [1.05, 0.0, 2.3] },                 // zoom out as the roof folds: sky for the second bolt
    { t: STROKES2[0] + 0.5, dur: 1.2, to: [1.4, 0.15, 1.2] },        // in to the cabin: the path through the seat
    { t: T_FIELD - 0.4, dur: 0.9, to: [0.95, 0.0, 2.8] },            // out for the field lines
    { t: 13.0, dur: 2.4, to: [1.1, 0.0, 2.2] },                      // slow push
    { t: LOOP_AT, dur: DURATION - LOOP_AT, to: [1.0, 0.0, 2.6] },    // back to frame 0's view
  ],
};
export type Camera = { position: V3; target: V3; up: V3; fov: number; aspect: number };
export function cameraAt(t: number): Camera {
  const [zoom, lx, ly] = tween(t, CAMERA.start, CAMERA.keys), d = DIST / zoom, [sx, sy] = shakeAt(t);
  return {
    position: [lx + sx + d * Math.sin(AZ) * Math.cos(EL), ly + sy + d * Math.sin(EL), d * Math.cos(AZ) * Math.cos(EL)],
    target: [lx + sx, ly + sy, 0], up: [0, 1, 0], fov: FOV, aspect: BAND.width / BAND.height,
  };
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

export const CHIPS_RESET = LOOP_AT;
export const COVER_T = 0.36;

export const CAPTIONS: Caption[] = [
  { t0: 2.8, t1: T_TYRES, text: 'Charge races over the metal' },
  { t0: T_TYRES, t1: ANSWER_AT, text: 'It jumps right past the tyres' },
  { t0: ANSWER_AT, t1: T_SECOND, text: 'The metal shell carries it' },
  { t0: T_SECOND, t1: ANSWER2_AT, text: 'Is a convertible safe?' },
  { t0: ANSWER2_AT, t1: T_FIELD, text: 'No roof: no cage' },
  { t0: T_FIELD, t1: T_SAFE, text: 'Inside a metal shell: E = 0' },
  { t0: T_SAFE, t1: LOOP_AT, text: 'Stay inside, windows up' },
];
export const SECOND_HOOK = CAPTIONS[3];
export const MUSIC_HITS = [ANSWER_AT, ANSWER2_AT];

// Sound from the picture: a crack per return stroke and the thunder straight after (it's right overhead), the arcs'
// crackle while they jump, the rain under everything; whooshes on the fast zooms (the roof fold's is one of them).
const cracks: Hit[] = [...STROKES, ...STROKES2].map((t, i) => ({ kind: 'crack', t, gain: [0.4, 0.25, 0.2][i % 3] }));
const thunder: Hit[] = [STROKES[0], STROKES2[0]].map(s => ({ kind: 'boom', t: s + 0.06, gain: 0.4 }));
const crackle: Hit[] = Array.from({ length: Math.floor((FLOW_END - T_STRIKE - 0.3) / 0.21) }, (_, i) => {
  const t = T_STRIKE + 0.3 + i * 0.21, loud = t >= T_TYRES - 0.3 && t < ANSWER_AT;
  return { kind: 'click', t, gain: loud ? 0.2 : 0.09, pitch: 1.4 + 0.5 * (((i * 7919) % 100) / 100) };
});
export const SOUND: Score = {
  duration: DURATION,
  hits: [...cracks, ...thunder, ...crackle, ...whooshesFor(CAMERA.start, CAMERA.keys)].sort((a, b) => a.t - b.t),
  beds: [{ kind: 'roar', t0: 0, t1: DURATION, level: () => 0.07 }],
};

const r6 = (v: number) => Math.round(v * 1e6) / 1e6;
export const loopState = (t: number) => ({
  leader: r6(leaderAt(t)), glow: r6(boltGlow(t)), rain: rainAt(t).map(p => p.map(r6)), camera: cameraAt(t).position.map(r6),
  charge: chargeAt(t).length, sparks: sparksAt(t).length, roof: roofOpen(t), field: fieldAlpha(t), danger: dangerAlpha(t),
  caption: CAPTIONS.some(c => t >= c.t0 && t < c.t1), flash: flashAt(t),
});
