import test from 'node:test';
import assert from 'node:assert/strict';
import { MUTED, VIVID, type SmPalette } from '../src/lib/smPalette.ts';

// Sound Mind's "ME" reels come in two palettes: the original muted one and a vivid one (founder, 2026-10-20: "more
// vibrant colours"). Whatever the palette, every piece of text must stay readable: WCAG AA (4.5:1) against what's behind it.
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const HEX = /^#[0-9A-F]{6}$/i;

for (const [name, p] of [['muted', MUTED], ['vivid', VIVID]] as [string, SmPalette][]) {
  test(`${name}: the message and the handle are readable on the sky and the grass`, () => {
    for (const bg of [p.skyTop, p.skyBottom]) assert.ok(contrast(p.ink, bg) >= 4.5, `ink on sky ${bg}: ${contrast(p.ink, bg).toFixed(2)}`);
    assert.ok(contrast(p.ink, p.grass) >= 4.5, `handle on grass: ${contrast(p.ink, p.grass).toFixed(2)}`);
  });

  test(`${name}: remarks, the second line and "ME" are readable on their own backgrounds`, () => {
    for (const pill of p.pills) assert.ok(contrast(p.ink, pill) >= 4.5, `remark on ${pill}: ${contrast(p.ink, pill).toFixed(2)}`);
    assert.ok(contrast(p.ink, p.cardSolid) >= 4.5);
    assert.ok(contrast(p.ink, p.white) >= 4.5);
  });

  test(`${name}: every colour is a plain #RRGGBB value`, () => {
    for (const [k, v] of Object.entries(p)) {
      if (k === 'card' || k === 'moodOpacity') continue;
      for (const c of Array.isArray(v) ? v : [v]) assert.match(String(c), HEX, `${k} = ${c}`);
    }
  });
}

test('the vivid palette really is brighter: more saturated sky, grass, pot and bloom than the muted one', () => {
  const sat = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    return max === 0 ? 0 : (max - min) / max;
  };
  for (const k of ['skyTop', 'grass', 'pot', 'bloomPetal', 'can'] as const) {
    assert.ok(sat(VIVID[k]) > sat(MUTED[k]) + 0.15, `${k}: vivid ${sat(VIVID[k]).toFixed(2)} vs muted ${sat(MUTED[k]).toFixed(2)}`);
  }
  assert.ok(new Set(VIVID.pills).size >= 4, 'remarks get several colours');
});
