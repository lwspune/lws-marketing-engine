import test from 'node:test';
import assert from 'node:assert/strict';
import { ELEMENTS, FAMILIES, familyOf, cellOf, TABLE, DURATION, END_AT, CAPTIONS, spotlight, tileRise, MUSIC_HITS } from '../src/lib/pc002.ts';

// @pyqvault_ · Chemistry, visualised #2: the periodic table's 8 families (Class 11, Classification of Elements).
const count = (id: string) => ELEMENTS.filter(e => familyOf(e.z) === id).length;
const syms = (id: string) => ELEMENTS.filter(e => familyOf(e.z) === id).map(e => e.sym).join(' ');

test('all 118 elements, numbered 1–118, with unique symbols', () => {
  assert.equal(ELEMENTS.length, 118);
  ELEMENTS.forEach((e, i) => assert.equal(e.z, i + 1));
  assert.equal(new Set(ELEMENTS.map(e => e.sym)).size, 118);
  assert.equal(ELEMENTS[0].sym, 'H'); assert.equal(ELEMENTS[25].sym, 'Fe'); assert.equal(ELEMENTS[78].sym, 'Au'); assert.equal(ELEMENTS[117].sym, 'Og');
});

test('the families, member by member (re-checked against the NCERT Class 11 table)', () => {
  assert.equal(syms('alkali'), 'Li Na K Rb Cs Fr');                 // group 1 without hydrogen
  assert.equal(syms('alkaline'), 'Be Mg Ca Sr Ba Ra');              // group 2
  assert.equal(syms('halogen'), 'F Cl Br I At Ts');                 // group 17
  assert.equal(syms('noble'), 'He Ne Ar Kr Xe Rn Og');              // group 18
  assert.equal(syms('metalloid'), 'B Si Ge As Sb Te');
  assert.equal(count('lanthanide'), 15); assert.equal(syms('lanthanide').split(' ')[0], 'La');
  assert.equal(count('actinide'), 15); assert.equal(syms('actinide').split(' ').at(-1), 'Lr');
  assert.equal(count('transition'), 38);                            // groups 3–12, periods 4–7 (La/Ac shown in the f-rows)
  assert.equal(familyOf(1), null); assert.equal(familyOf(6), null); // H and C belong to no family here
  assert.equal(FAMILIES.length, 8);
});

test('layout: every element has its own cell, groups 1–18 and periods 1–7 plus the two f-rows', () => {
  const seen = new Set<string>();
  for (const e of ELEMENTS) {
    const c = cellOf(e.z), key = `${c.col},${c.row}`;
    assert.ok(!seen.has(key), `${e.sym} overlaps another element at ${key}`); seen.add(key);
    assert.ok(c.col >= 1 && c.col <= 18 && c.row >= 1 && c.row <= 10, `${e.sym} off the table`);
  }
  assert.deepEqual(cellOf(2), { col: 18, row: 1 }); assert.deepEqual(cellOf(26), { col: 8, row: 4 });
  assert.deepEqual(cellOf(57), { col: 3, row: 9 }); assert.deepEqual(cellOf(103), { col: 17, row: 10 });
  assert.deepEqual(cellOf(118), { col: 18, row: 7 });
});

test('the table fits the frame with a margin', () => {
  assert.ok(TABLE.left >= 30 && TABLE.left + 18 * TABLE.pitch - TABLE.gap <= 1050);
});

test('timeline: the table builds, then each family takes the spotlight once, in order, before the end card', () => {
  assert.equal(tileRise(1, 0), 0); assert.equal(tileRise(118, 6), 1);
  let last = -1;
  for (const f of FAMILIES) {
    const at = FAMILIES.map(x => x.id).indexOf(f.id);
    assert.ok(f.t0 > last && f.t1 > f.t0 && f.t1 <= END_AT, `${f.id} window`); last = f.t0;
    assert.equal(spotlight((f.t0 + f.t1) / 2)?.id, f.id);
    assert.equal(at, FAMILIES.indexOf(f));
  }
  assert.ok(END_AT < DURATION);
});

test('house settings: short labels (≤ 7 words a line) for captions and every family trait', () => {
  const lines = [...CAPTIONS.flatMap(c => c.text.split('\n')), ...FAMILIES.map(f => f.trait)];
  for (const l of lines) assert.ok(l.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, `too long: "${l}"`);
});

test('music: the hits land on the build and on two family changes, inside the reel', () => {
  for (const h of MUSIC_HITS) assert.ok(h > 1 && h < END_AT - 1);
  assert.ok(MUSIC_HITS.includes(FAMILIES[0].t0));
});
