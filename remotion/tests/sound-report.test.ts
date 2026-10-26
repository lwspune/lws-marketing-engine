import test from 'node:test';
import assert from 'node:assert/strict';
import { rmsDbWindows } from '../src/lib/sfx.ts';

// The review panel's sound critic can't listen (framework F38): it reads the mix as numbers, the loudness of the music and
// of the effects in short windows, next to the reel's own list of hits.
test('rmsDbWindows: the loudness of each window in dB (RMS, full scale = 0 dB); silence is −∞, shown as −120', () => {
  const sr = 1000, sine = Float32Array.from({ length: 2000 }, (_, i) => Math.sin((2 * Math.PI * 50 * i) / sr));
  const db = rmsDbWindows(sine, sr, 0.5);
  assert.equal(db.length, 4);
  for (const d of db) assert.ok(Math.abs(d - -3.01) < 0.05, `a full-scale sine is −3 dB RMS (${d})`);
  const half = rmsDbWindows(sine.map(v => v * 0.5), sr, 0.5);
  assert.ok(Math.abs(half[0] - db[0] + 6.02) < 0.05, 'half the amplitude is 6 dB down');
  assert.deepEqual(rmsDbWindows(new Float32Array(1000), sr, 0.5), [-120, -120]);
  assert.equal(rmsDbWindows(new Float32Array(1100), sr, 0.5).length, 3, 'a short last window still counts');
});
