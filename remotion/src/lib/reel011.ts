// @lws.pune · reel 011 remade (predict-first, framework v1.1): double every number in a 2×2 matrix: its determinant
// becomes…? NDA maths concept (Matrices & Determinants); NDA 2025 (II) Q44 named in the caption. The rows of A = [3 1; 1 2]
// are two arrows and |det A| = 5 is the area between them. Double row 1: the area doubles (two copies). Double row 2: it
// doubles again (four copies) → ×4 = 2². Then any k scales the area by k² (a graph of area against k draws itself).
// Replaces the engine-made "Why? #3" (still title card, MCQ at the end). Pure functions of t.
import { prog, type Caption, type Key } from './motion.ts';
import { whooshesFor, type Hit, type Score } from './sfx.ts';

export const DURATION = 22.0, END_AT = 18.6;
export const OPTIONS = ['A   ×2', 'B   ×4', 'C   same'], ANSWER = 1;

type M2 = [[number, number], [number, number]];
export const A: M2 = [[3, 1], [1, 2]];
export const det = (m: M2) => m[0][0] * m[1][1] - m[0][1] * m[1][0];

// The arrows draw themselves (0–1.25 s); row 1 stretches ×2 (1.2–3.2 s); row 2 stretches ×2 (3.6–5.6 s); then from T_SWEEP
// both rows share one k that sweeps 2 → 3 → 1.
export const T_ROW1 = 1.2, T_ROW2 = 3.6, STRETCH = 2.0, T_SWEEP = 9.0;
export const drawAt = (t: number) => prog(t, 0, T_ROW1 + 0.05);   // runs right into the stretch: no still frame
const SWEEP: [number, number, number, number][] = [[T_SWEEP, 11.2, 2, 3], [11.6, 14.6, 3, 1], [15.0, 16.6, 1, 2]];
export function scaleAt(t: number): [number, number] {
  if (t >= T_SWEEP) {
    let k = 2;
    for (const [t0, t1, a, b] of SWEEP) if (t >= t0) k = a + (b - a) * prog(t, t0, t1 - t0);
    return [k, k];
  }
  return [1 + prog(t, T_ROW1, STRETCH), 1 + prog(t, T_ROW2, STRETCH)];
}
export const rowsAt = (t: number): M2 => { const [k1, k2] = scaleAt(t); return [[A[0][0] * k1, A[0][1] * k1], [A[1][0] * k2, A[1][1] * k2]]; };
export const areaAt = (t: number) => Math.abs(det(rowsAt(t)));
export const ANSWER_AT = T_ROW2 + STRETCH;

export const CAPTIONS: Caption[] = [
  { t0: 0.6, t1: T_ROW2, text: 'Double row 1: area doubles' },
  { t0: T_ROW2, t1: ANSWER_AT, text: 'Double row 2: doubles again' },
  { t0: ANSWER_AT, t1: T_SWEEP, text: '|2A| = 4 |A|, not 2 |A|' },
  { t0: T_SWEEP, t1: 12.6, text: 'Scale by k: area × k²' },
  { t0: 12.6, t1: 15.6, text: 'n×n matrix: |kA| = kⁿ |A|' },
  { t0: 15.6, t1: END_AT, text: 'Two rows doubled: ×4' },
];
export const MUSIC_HITS = [ANSWER_AT];

// Picture layout (px, inside the picture band, which sits under a fixed strip for the matrix and the area: F9 keeps
// labels still while the picture zooms). One unit = U px; the origin sits low on the left so k = 3 still fits.
export const BAND = { top: 610, height: 890 };
export const U = 48, ORIGIN = { x: 200, y: 450 };
export const sx = (x: number) => ORIGIN.x + U * x, sy = (y: number) => ORIGIN.y - U * y;
export const GRAPH = { x0: 180, x1: 900, y0: 820, h: 200, kMax: 3.2, areaMax: 50 };

// Camera: [zoom, focus x, focus y] on the picture. A slow push from frame 0, a punch-in on the four copies landing on the
// answer, a zoom out to fit k = 3 and the graph, a gentle push for the last line.
export const CAMERA: { start: number[]; keys: Key[] } = {
  start: [1, 540, 445],
  keys: [
    { t: 0, dur: 3.0, to: [1.08, 400, 330] },
    { t: ANSWER_AT - 0.35, dur: 0.35, to: [1.3, 392, 306] },          // the centre of the four copies
    { t: ANSWER_AT + 2.4, dur: 0.7, to: [0.94, 540, 445] },
    { t: 16.0, dur: 2.4, to: [1.04, 520, 440] },
  ],
};

// Sound from the picture: a soft click each time the area passes a whole unit while the rows stretch (pitch rising with
// the area), a thunk when ×4 lights, whooshes on the fast zooms.
function crossings(): Hit[] {
  const out: Hit[] = [], dt = 1 / 600;
  let prev = areaAt(0);
  for (let t = dt; t < T_SWEEP; t += dt) {
    const a = areaAt(t);
    if (Math.floor(a + 1e-9) > Math.floor(prev + 1e-9)) out.push({ kind: 'click', t, gain: 0.45, pitch: 0.8 + 0.03 * Math.floor(a + 1e-9) });
    prev = a;
  }
  return out;
}
export const CLICKS = crossings();
export const SOUND: Score = {
  duration: DURATION,
  hits: [...CLICKS, { kind: 'thunk', t: ANSWER_AT, gain: 0.55 }, ...whooshesFor(CAMERA.start, CAMERA.keys)],
  beds: [],
};
