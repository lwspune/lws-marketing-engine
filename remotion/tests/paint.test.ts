import test from 'node:test';
import assert from 'node:assert/strict';
import { paintProblems, paintOf } from '../src/lib/paint.ts';

// "Painted 2D" (founder, 2026-10-24: sm-r012 "looks much better"): no black ink outlines. Every colour in a painted
// palette has a light side, a shadow side and an edge that is a darker shade of itself. paintProblems() is the shared
// check each painted reel's palette runs through.
const good = { fill: '#2F6F8F', light: '#4C93B5', shade: '#235670', edge: '#1B4558' };

test('a properly painted colour passes', () => {
  assert.deepEqual(paintProblems({ stall: good }), []);
});

test('black ink as an edge is refused', () => {
  assert.match(paintProblems({ stall: { ...good, edge: '#000000' } }).join(), /ink/);
  assert.match(paintProblems({ stall: { ...good, edge: '#2F3A33' } }).join(), /another colour|ink/);
});

test('an edge in another colour is refused', () => {
  assert.match(paintProblems({ stall: { ...good, edge: '#7A2A1A' } }).join(), /another colour/);
});

test('shading must run light → fill → shade, and the edge must be darker than the fill', () => {
  assert.match(paintProblems({ stall: { ...good, light: '#1B4558' } }).join(), /order/);
  assert.match(paintProblems({ stall: { ...good, edge: '#9CC3D9' } }).join(), /edge/);
});

test('near-grey colours are not held to a hue (only to light, shade and edge order)', () => {
  assert.deepEqual(paintProblems({ steel: { fill: '#A9B2BA', light: '#D7DDE2', shade: '#7F8991', edge: '#626B73' } }), []);
});

test('paintOf(colour) derives a painted set from one base colour: same hue, lighter light, darker shade and edge', () => {
  const set = { wall: paintOf('#4A3A4E'), sweater: paintOf('#C8632F'), cushion: paintOf('#2E8C86'), pages: paintOf('#EFE4CC'), lamp: paintOf('#D9A441') };
  assert.deepEqual(paintProblems(set), []);
  assert.equal(set.sweater.fill, '#C8632F');
});
