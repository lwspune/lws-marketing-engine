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
