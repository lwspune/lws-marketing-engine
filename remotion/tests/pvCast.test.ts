import test from 'node:test';
import assert from 'node:assert/strict';
import { CAST, PAINT, BOARD, TEXT, SUBTEXT } from '../src/lib/pvCast.ts';

// @pyqvault_ character cast, first sketch (founder, 2026-10-24, after studying @qubit.exe: physics quantities as characters
// acting out a law). Our own designs, drawn from the circuit symbols: Volt (a battery cell), Amp (a spark), Ohm (a resistor).
// Painted, not outlined (the founder found our reels "like kids drawing"): edges are darker shades of each colour.
const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
const lum = (hex: string) => {
  const [r, g, b] = rgb(hex).map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const hue = (hex: string) => {
  const [r, g, b] = rgb(hex), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (d === 0) return 0;
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};
const chroma = (hex: string) => { const c = rgb(hex); return Math.max(...c) - Math.min(...c); };
const hueGap = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

test('three characters, one per quantity in Ohm’s law', () => {
  assert.deepEqual(CAST.map(c => c.id), ['volt', 'amp', 'ohm']);
  assert.match(CAST[0].role, /voltage/i);
  assert.match(CAST[1].role, /current/i);
  assert.match(CAST[2].role, /resistance/i);
});

test('each has three distinct poses; Ohm heats up when current is forced through (P = I²R)', () => {
  for (const c of CAST) {
    assert.equal(c.poses.length, 3, c.id);
    assert.equal(new Set(c.poses.map(p => p.id)).size, 3, `${c.id} repeats a pose`);
    for (const p of c.poses) assert.ok(p.label.length > 0 && p.label.split(/\s+/).length <= 4, `${c.id}/${p.id} label`);
  }
  assert.ok(CAST[2].poses.some(p => p.id === 'hot'));
});

test('painted, not outlined: every edge is a darker shade of its own colour, never black ink', () => {
  for (const [name, p] of Object.entries(PAINT)) {
    assert.ok(lum(p.edge) < lum(p.fill) && lum(p.shade) < lum(p.fill) && lum(p.light) > lum(p.fill), `${name}: shading out of order`);
    if (chroma(p.fill) > 0.08) assert.ok(hueGap(hue(p.edge), hue(p.fill)) <= 30, `${name}: edge is another colour`);
    assert.ok(lum(p.edge) > 0.006, `${name}: edge is near-black ink`);
  }
});

test('the names and roles are readable on the board (WCAG AA)', () => {
  assert.ok(contrast(TEXT, BOARD) >= 4.5);
  assert.ok(contrast(SUBTEXT, BOARD) >= 4.5);
});
