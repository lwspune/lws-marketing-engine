import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { WHITE } from '../src/lib/palette.ts';

// The white board's colours are owned by reels/engine.js (and contrast-checked by tests/reel-theme.test.js).
// The Remotion copy must stay identical, or the two looks drift apart.
test('palette: WHITE matches reels/engine.js Reel.WHITE', () => {
  const window: { Reel?: { WHITE: Record<string, string> } } = {};
  runInNewContext(readFileSync(new URL('../../reels/engine.js', import.meta.url), 'utf8'), { window });
  assert.deepEqual({ ...WHITE }, { ...window.Reel!.WHITE });
});

// The dark "lab" look (@pyqvault_ background A/B test, L22): the same rule, against Reel.LAB.
test('palette: LAB matches reels/engine.js Reel.LAB', async () => {
  const { LAB } = await import('../src/lib/palette.ts') as { LAB?: Record<string, string> };
  const window: { Reel?: { LAB: Record<string, string> } } = {};
  runInNewContext(readFileSync(new URL('../../reels/engine.js', import.meta.url), 'utf8'), { window });
  assert.ok(LAB, 'palette.ts exports LAB');
  assert.deepEqual({ ...LAB }, { ...window.Reel!.LAB });
});

// Bright objects (framework F24, founder 2026-10-21, both handles): every key object takes a colour from VIVID, the set
// for the board it sits on. Each must be strongly saturated, stand out from that board (WCAG 1.4.11 non-text contrast,
// 3:1) and differ from the others in hue, so objects that must be told apart can be.
const channel = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
const luminance = (hex: string) => {
  const [r, g, b] = channel(hex).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const hueSat = (hex: string) => {
  const [r, g, b] = channel(hex), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = d === 0 ? 0 : mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60; if (h < 0) h += 360;
  return { h, s };
};

test('palette: VIVID has one bright set per board, with the same roles', async () => {
  const { VIVID, LAB } = await import('../src/lib/palette.ts') as { VIVID?: { white: Record<string, string>; lab: Record<string, string> }; LAB: Record<string, string> };
  assert.ok(VIVID, 'palette.ts exports VIVID');
  assert.deepEqual(Object.keys(VIVID.white), Object.keys(VIVID.lab));
  assert.ok(Object.keys(VIVID.white).length >= 8);
  for (const [set, board] of [[VIVID.white, WHITE.board], [VIVID.lab, LAB.board]] as const) {
    const hues: number[] = [];
    for (const [role, hex] of Object.entries(set)) {
      const { h, s } = hueSat(hex);
      assert.ok(s >= 0.65, `${role} ${hex} is not saturated enough (${s.toFixed(2)})`);
      assert.ok(contrast(hex, board) >= 3, `${role} ${hex} fades into ${board} (${contrast(hex, board).toFixed(2)}:1)`);
      hues.push(h);
    }
    for (let i = 0; i < hues.length; i++) for (let j = i + 1; j < hues.length; j++) {
      const gap = Math.min(Math.abs(hues[i] - hues[j]), 360 - Math.abs(hues[i] - hues[j]));
      assert.ok(gap >= 20, `${Object.keys(set)[i]} and ${Object.keys(set)[j]} are only ${gap.toFixed(0)}° apart`);
    }
  }
});

// Real colours first (framework F24, founder 2026-10-22: "wherever possible they should be realistic"): a vetted fill per
// material and board, plus an edge that is a shade of the same colour. A real colour too pale or dark for the board (glass,
// steel, ice on white) stands out through its edge, never through a fake colour: one of the two must reach 3:1.
test('palette: REAL materials have a true-to-life fill and an edge of their own colour that stands out on each board', async () => {
  const { REAL, LAB } = await import('../src/lib/palette.ts') as { REAL?: Record<'white' | 'lab', Record<string, { fill: string; edge: string }>>; LAB: Record<string, string> };
  assert.ok(REAL, 'palette.ts exports REAL');
  assert.deepEqual(Object.keys(REAL.white), Object.keys(REAL.lab));
  for (const m of ['copper', 'steel', 'zinc', 'gold', 'glass', 'water', 'flame', 'copperSulphate', 'chlorine', 'sodium', 'salt']) assert.ok(REAL.white[m], m);
  for (const [set, board] of [[REAL.white, WHITE.board], [REAL.lab, LAB.board]] as const) {
    for (const [m, { fill, edge }] of Object.entries(set)) {
      assert.ok(Math.max(contrast(fill, board), contrast(edge, board)) >= 3, `${m} vanishes on ${board}`);
      const a = hueSat(fill), b = hueSat(edge), gap = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h));
      if (a.s < 0.15) assert.ok(b.s < 0.2, `${m}: a grey metal's edge must stay grey (${edge})`);
      else assert.ok(gap <= 25, `${m}: the edge ${edge} is not a shade of ${fill} (${gap.toFixed(0)}° apart)`);
    }
  }
});

// Colour-blind safety (F24, founder 2026-10-22): two things the viewer must tell apart must still differ for the 1 in 12 men
// with red–green colour blindness. distinguishable() simulates protanopia and deuteranopia (Viénot 1999) and wants a CIE
// colour difference of at least CVD_MIN under both.
test('palette: distinguishable() catches the pairs red–green colour blindness merges', async () => {
  const { distinguishable, VIVID } = await import('../src/lib/palette.ts') as { distinguishable?: (a: string, b: string) => boolean; VIVID: { white: Record<string, string>; lab: Record<string, string> } };
  assert.ok(distinguishable, 'palette.ts exports distinguishable');
  const w = VIVID.white;
  assert.equal(distinguishable(w.red, w.green), false, 'red vs green');
  assert.equal(distinguishable(w.blue, w.violet), false, 'blue vs violet');
  assert.equal(distinguishable(w.orange, w.yellow), false, 'orange vs yellow');
  assert.equal(distinguishable(w.blue, w.orange), true, 'blue vs orange');
  assert.equal(distinguishable(w.cyan, w.red), true, 'cyan vs red');
  assert.equal(distinguishable(VIVID.lab.red, VIVID.lab.green), false, 'lab red vs green');
});
