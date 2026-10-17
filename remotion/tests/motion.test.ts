import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp01, ease, prog, captionAt } from '../src/lib/motion.ts';

// These must match reels/engine.js exactly, so a reel keeps its timings when it moves to Remotion.

test('ease: smooth in-out, symmetric about the middle', () => {
  assert.equal(ease(0), 0);
  assert.equal(ease(0.25), 0.125);
  assert.equal(ease(0.5), 0.5);
  assert.equal(ease(0.75), 0.875);
  assert.equal(ease(1), 1);
});

test('clamp01 keeps progress inside 0…1', () => {
  assert.equal(clamp01(-2), 0);
  assert.equal(clamp01(0.3), 0.3);
  assert.equal(clamp01(7), 1);
});

test('prog: 0 before t0, eased while running, 1 after', () => {
  assert.equal(prog(0.9, 1, 2), 0);
  assert.equal(prog(2, 1, 2), 0.5);
  assert.equal(prog(3.5, 1, 2), 1);
});

test('prog with no duration is a step at t0', () => {
  assert.equal(prog(0.99, 1, 0), 0);
  assert.equal(prog(1, 1, 0), 1);
});

const CAPS = [
  { t0: 0, t1: 3.2, text: 'hook' },
  { t0: 3.2, t1: 6.4, text: 'second' },
];

test('captionAt: the opening caption is fully visible on frame 0 (the hook)', () => {
  assert.deepEqual(captionAt(CAPS, 0), { caption: CAPS[0], alpha: 1, age: 0 });
});

test('captionAt: a caption fades out over its last 0.25 s', () => {
  const c = captionAt(CAPS, 3.1);
  assert.equal(c?.caption.text, 'hook');
  assert.ok(Math.abs(c!.alpha - 0.4) < 1e-9);
});

test('captionAt: a later caption fades in over 0.18 s', () => {
  const c = captionAt(CAPS, 3.29);
  assert.equal(c?.caption.text, 'second');
  assert.ok(Math.abs(c!.alpha - 0.5) < 1e-9);
  assert.ok(Math.abs(c!.age - 0.09) < 1e-9);
});

test('captionAt: nothing between or after captions', () => {
  assert.equal(captionAt(CAPS, 6.4), null);
  assert.equal(captionAt(CAPS, 99), null);
});
