// The white board's colours: a copy of Reel.WHITE in reels/engine.js (tests/palette.test.ts keeps them equal).
export const WHITE = {
  board: '#faf8f3', edge: '#f1ede4', ink: '#23304a', muted: '#5f6880',
  blue: '#3f56a0', green: '#2a736e', amber: '#a94f28', red: '#a94f28',
  fill: 'rgba(42, 115, 110, 0.16)', grid: 'rgba(35, 48, 74, 0.16)', axis: 'rgba(35, 48, 74, 0.45)',
} as const;

export const tint = (hex: string, a: number) => `rgba(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ')}, ${a})`;

// Fonts, as in reels/engine.js: Cambria for maths and handwriting-weight text, Segoe UI Variable for captions.
export const TEXT_FONT = 'Cambria, "Cambria Math", serif';
export const MATH_FONT = '"Cambria Math", "Segoe UI Symbol", serif';
export const SOFT_UI = '"Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif';
export const UI = '"Segoe UI", system-ui, sans-serif';
