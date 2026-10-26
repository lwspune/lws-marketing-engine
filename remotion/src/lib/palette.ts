// The white board's colours: a copy of Reel.WHITE in reels/engine.js (tests/palette.test.ts keeps them equal).
export const WHITE = {
  board: '#faf8f3', edge: '#f1ede4', ink: '#23304a', muted: '#5f6880',
  blue: '#3f56a0', green: '#2a736e', amber: '#a94f28', red: '#a94f28',
  fill: 'rgba(42, 115, 110, 0.16)', grid: 'rgba(35, 48, 74, 0.16)', axis: 'rgba(35, 48, 74, 0.45)',
} as const;

// The dark "lab" board: a copy of Reel.LAB (tests/palette.test.ts). Same colour roles as WHITE, plus the card fill
// and the shadow colour (shadows on a dark board are black, not ink).
export const LAB = {
  board: '#121822', edge: '#0a0e15', ink: '#e6ebf3', muted: '#a3adbd',
  blue: '#86a8ff', green: '#4fd1a5', amber: '#ffb35c', red: '#ffb35c',
  fill: 'rgba(79, 209, 165, 0.16)', grid: 'rgba(230, 235, 243, 0.14)', axis: 'rgba(230, 235, 243, 0.42)',
  card: '#1b2330', shadow: '#000000',
} as const;
// Object colours (framework F24, founder 2026-10-21/22, @pyqvault_ and @lws.pune): real colours first (REAL below); these
// bright ones only for things with no real colour (particles, rays, arrows, bars), from the set for the board, a different
// one for anything the viewer must tell apart; WHITE / LAB above stay for text and UI. Each is strongly saturated, ≥ 3:1
// against its board and ≥ 20° of hue from the others (tests/palette.test.ts). The white set is darker so it holds on the
// light board; the lab set is lighter so it glows on the dark one, but not pastel: 3D lighting lightens a surface further
// (Physics #9's first stills: a pale-blue car, a pink housing). Under red–green colour blindness red–green, orange–yellow
// and blue–violet merge: check pairs with distinguishable().
export const VIVID = {
  white: { red: '#e11d48', orange: '#ea580c', yellow: '#a87c00', green: '#16a34a', cyan: '#0891b2', blue: '#2563eb', violet: '#7c3aed', pink: '#c026d3' },
  lab: { red: '#f43f5e', orange: '#f97316', yellow: '#facc15', green: '#22c55e', cyan: '#06b6d4', blue: '#3b82f6', violet: '#8b5cf6', pink: '#d946ef' },
} as const;

// Real material colours (F24, founder 2026-10-22: "wherever possible they should be realistic"): a true-to-life fill per
// board and an edge that is a shade of the same colour (darker on white, lighter on lab). Where the fill is too pale or
// dark for the board (glass, steel, ice on white), the edge carries the contrast; one of the two is ≥ 3:1 (tests).
export const REAL = {
  white: {
    copper: { fill: '#b87333', edge: '#7f4a1c' }, steel: { fill: '#9aa3ad', edge: '#59626c' }, zinc: { fill: '#a7aeb6', edge: '#5f6770' },
    silver: { fill: '#c4c8cc', edge: '#6b7279' }, gold: { fill: '#d4a017', edge: '#8a6400' }, glass: { fill: '#cfe8ec', edge: '#3f7f8a' },
    water: { fill: '#6fb7d6', edge: '#2b7499' }, ice: { fill: '#dff3fa', edge: '#4f8fa8' }, flame: { fill: '#f59e0b', edge: '#b45309' },
    copperSulphate: { fill: '#1e88e5', edge: '#1565c0' }, chlorine: { fill: '#c5d64a', edge: '#66741a' }, rust: { fill: '#b7410e', edge: '#8a3009' },
    wood: { fill: '#a0703f', edge: '#6e4a26' }, leaf: { fill: '#3f9b3a', edge: '#2a6e27' }, sodium: { fill: '#d2d4d6', edge: '#62676e' },
    salt: { fill: '#eef1f4', edge: '#6b7682' },
  },
  lab: {
    copper: { fill: '#c98146', edge: '#e8a978' }, steel: { fill: '#8f98a3', edge: '#c6cdd5' }, zinc: { fill: '#9aa1a9', edge: '#cdd3d9' },
    silver: { fill: '#c0c4c8', edge: '#e3e6e9' }, gold: { fill: '#e0b330', edge: '#f2cf63' }, glass: { fill: '#9fd3dc', edge: '#cdeff4' },
    water: { fill: '#4fa3c7', edge: '#8ccbe5' }, ice: { fill: '#bfe6f3', edge: '#e6f6fb' }, flame: { fill: '#f8a92a', edge: '#fcd27a' },
    copperSulphate: { fill: '#3b8fe0', edge: '#82b8f1' }, chlorine: { fill: '#c8d94e', edge: '#e2ec8a' }, rust: { fill: '#c4521c', edge: '#e88b5c' },
    wood: { fill: '#a87a48', edge: '#d2a679' }, leaf: { fill: '#4caf47', edge: '#8ad485' }, sodium: { fill: '#d2d4d6', edge: '#eef0f2' },
    salt: { fill: '#e8ecf0', edge: '#f8fafc' },
  },
} as const;

// Colour-blind safety (F24, founder 2026-10-22): about 1 in 12 men can't tell some colours apart. Two colours the viewer
// must tell apart should still differ under protanopia and deuteranopia (Viénot 1999, in linear RGB): a CIE76 difference of
// at least CVD_MIN under both. Calibrated on VIVID: red–green, orange–yellow and blue–violet fall below it.
export const CVD_MIN = 15;
const CVD = {
  protan: [[0.11238, 0.88762, 0], [0.11238, 0.88762, 0], [0.00401, -0.00401, 1]],
  deutan: [[0.29275, 0.70725, 0], [0.29275, 0.70725, 0], [-0.02234, 0.02234, 1]],
} as const;
const linear = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
  .map(v => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
const toLab = ([r, g, b]: number[]) => {
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const x = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047), y = f(0.2126 * r + 0.7152 * g + 0.0722 * b), z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};
const seenAs = (hex: string, m: readonly (readonly number[])[]) => {
  const v = linear(hex);
  return m.map(row => Math.min(1, Math.max(0, row[0] * v[0] + row[1] * v[1] + row[2] * v[2])));
};
const deltaE = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Can a viewer with red–green colour blindness still tell these two colours apart? */
export const distinguishable = (a: string, b: string) =>
  Object.values(CVD).every(m => deltaE(toLab(seenAs(a, m)), toLab(seenAs(b, m))) >= CVD_MIN);

export type Palette ={ readonly [K in keyof typeof WHITE]: string } & { readonly card?: string; readonly shadow?: string };

export const tint =(hex: string, a: number) => `rgba(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ')}, ${a})`;

// Fonts, as in reels/engine.js: Cambria for maths and handwriting-weight text, Segoe UI Variable for captions.
export const TEXT_FONT = 'Cambria, "Cambria Math", serif';
export const MATH_FONT = '"Cambria Math", "Segoe UI Symbol", serif';
export const SOFT_UI = '"Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif';
export const UI = '"Segoe UI", system-ui, sans-serif';
