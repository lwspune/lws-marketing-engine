// The miniature look's pure rules (src/lib/miniature.ts): how deep the sharp zone is, and the small motions that keep the
// model alive (trees in the breeze, waves, flags) and the grass's colour patches. Founder, 2026-11-04.
import test from 'node:test';
import assert from 'node:assert/strict';
import { focusBand, sway, wave, flagWave, grassTint } from '../src/lib/miniature.ts';

const F = 1 / 30;

test('focus band: through the subject; wide shots read as a miniature (stronger, narrower), close ones stay gentle', () => {
  let prev = focusBand(0.5, 10);
  for (let d = 20; d <= 1000; d += 10) {
    const f = focusBand(0.5, d);
    assert.ok(f.blur >= prev.blur && f.taper <= prev.taper, `not stronger at ${d} m`);
    assert.ok(f.blur >= 0.06 && f.blur <= 0.16 && f.taper >= 0.2 && f.taper <= 0.4, `out of range at ${d} m`);
    prev = f;
  }
  assert.ok(focusBand(0.5, 725).blur >= 0.12 && focusBand(0.5, 31).blur <= 0.08, 'wide vs close');
  assert.equal(focusBand(0.42, 100).y, 0.42, 'the band runs through the subject');
  assert.equal(focusBand(-0.3, 100).y, 0.05); assert.equal(focusBand(1.4, 100).y, 0.95);
});

test('sway: trees move a little, smoothly, each on its own phase', () => {
  for (let t = 0; t < 25; t += F) {
    assert.ok(Math.abs(sway(t, 3)) <= 0.04, `too far at ${t.toFixed(2)}`);
    assert.ok(Math.abs(sway(t + F, 3) - sway(t, 3)) <= 0.004, `a jerk at ${t.toFixed(2)}`);
  }
  assert.equal(sway(4.2, 7), sway(4.2, 7), 'the same tree moves the same way on every render');
  assert.ok(Math.abs(sway(4.2, 7) - sway(4.2, 8)) > 1e-4, 'neighbours out of step');
});

test('waves: a gentle swell that moves, varies along the shore and never jumps', () => {
  for (let t = 0; t < 25; t += 0.5) for (let x = -120; x <= 120; x += 15) {
    assert.ok(Math.abs(wave(x, -100, t)) <= 0.35, 'too high a wave for the model');
    assert.ok(Math.abs(wave(x, -100, t + F) - wave(x, -100, t)) <= 0.03, 'a wave jumps');
  }
  const along = Array.from({ length: 30 }, (_, i) => wave(-120 + 8 * i, -100, 3));
  assert.ok(Math.max(...along) - Math.min(...along) > 0.1, 'the sea flat along the shore');
  assert.ok(Math.abs(wave(10, -100, 3) - wave(10, -100, 5)) > 1e-3, 'the sea frozen');
});

test('flags ripple like cloth: still at the mast, more towards the free end, bounded, smooth', () => {
  const w = 6.4;
  for (let t = 0; t < 10; t += F) {
    for (const v of [0, 0.5, 1]) assert.equal(flagWave(0, v, t, w), 0, 'the edge on the mast moves');
    for (let u = 0; u <= 1; u += 0.1) {
      assert.ok(Math.abs(flagWave(u, 0.5, t, w)) <= 0.12 * w, 'flaps too far');
      assert.ok(Math.abs(flagWave(u, 0.5, t + F, w) - flagWave(u, 0.5, t, w)) <= 0.06 * w, 'a jump in the cloth');
    }
  }
  const reach = (u: number) => Math.max(...Array.from({ length: 300 }, (_, i) => Math.abs(flagWave(u, 0.5, i * F, w))));
  assert.ok(reach(1) > reach(0.3), 'the free end moves more than near the mast');
});

test('grass: soft patches of lighter and darker green, the same on every frame, no hard edges', () => {
  const vals: number[] = [];
  for (let x = -120; x <= 110; x += 5) for (let z = -110; z <= 80; z += 5) {
    const g = grassTint(x, z); vals.push(g);
    assert.ok(g >= 0.88 && g <= 1.1, `tint ${g} at ${x}, ${z}`);
    assert.ok(Math.abs(grassTint(x + 1, z) - g) <= 0.02 && Math.abs(grassTint(x, z + 1) - g) <= 0.02, 'a hard edge');
  }
  assert.equal(grassTint(12.5, -40), grassTint(12.5, -40));
  assert.ok(Math.max(...vals) - Math.min(...vals) >= 0.08, 'the grass one flat colour');
});
