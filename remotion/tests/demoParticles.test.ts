import test from 'node:test';
import assert from 'node:assert/strict';
import { MeshBasicMaterial } from 'three';
import { withSeed, flameAt } from '../src/lib/demoParticles.ts';

// Realism demo 5 (2026-10-20): a three.quarks Bunsen flame (flame, sparks, heat haze). three.quarks steps particles by
// clock time with Math.random; Remotion draws frames out of order. So each frame rebuilds the effect and replays it from
// 0 in fixed 1/30 s steps with a seeded random: the same frame must always come out the same.
const snapshot = (frame: number) => {
  const { systems } = flameAt(frame, new MeshBasicMaterial());
  return systems.map(s => s.particles.slice(0, s.particleNum).map(p => [p.position.x, p.position.y, p.position.z, p.size.x, p.color.w]));
};

test('withSeed gives the same random numbers every time and puts Math.random back', () => {
  const real = Math.random;
  const a = withSeed(5, () => [Math.random(), Math.random()]), b = withSeed(5, () => [Math.random(), Math.random()]);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, withSeed(6, () => [Math.random(), Math.random()]));
  assert.equal(Math.random, real);
});

test('the same frame gives the same particles, whenever it is drawn', () => {
  assert.deepEqual(snapshot(45), snapshot(45));
  assert.notDeepEqual(snapshot(45), snapshot(46));
});

test('the flame is alive from early on and keeps a steady crowd of particles', () => {
  const count = (f: number) => flameAt(f, new MeshBasicMaterial()).systems.reduce((n, s) => n + s.particleNum, 0);
  assert.ok(count(6) > 10, `${count(6)} particles at 0.2 s`);
  assert.ok(count(90) > 80 && count(90) < 2000, `${count(90)} particles at 3 s`);
});
