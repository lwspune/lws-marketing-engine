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
// Bright objects (framework F24, founder 2026-10-21, @pyqvault_ and @lws.pune): every key object (what moves, changes or
// is explained) takes one of these, from the set for its board; WHITE / LAB above stay for text and UI. Each is strongly
// saturated, ≥ 3:1 against its board and ≥ 20° of hue from the others (tests/palette.test.ts). The white set is darker
// so it holds on the light board; the lab set is lighter so it glows on the dark one.
export const VIVID = {
  white: { red: '#e11d48', orange: '#ea580c', yellow: '#a87c00', green: '#16a34a', cyan: '#0891b2', blue: '#2563eb', violet: '#7c3aed', pink: '#c026d3' },
  lab: { red: '#fb7185', orange: '#fb923c', yellow: '#facc15', green: '#4ade80', cyan: '#22d3ee', blue: '#60a5fa', violet: '#a78bfa', pink: '#e879f9' },
} as const;

export type Palette ={ readonly [K in keyof typeof WHITE]: string } & { readonly card?: string; readonly shadow?: string };

export const tint =(hex: string, a: number) => `rgba(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ')}, ${a})`;

// Fonts, as in reels/engine.js: Cambria for maths and handwriting-weight text, Segoe UI Variable for captions.
export const TEXT_FONT = 'Cambria, "Cambria Math", serif';
export const MATH_FONT = '"Cambria Math", "Segoe UI Symbol", serif';
export const SOFT_UI = '"Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif';
export const UI = '"Segoe UI", system-ui, sans-serif';
