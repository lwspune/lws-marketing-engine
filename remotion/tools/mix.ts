// Mix a reel's own sound effects (its SOUND score) into its music, dipping the music under them:
//   node tools/mix.ts pp004   →  public/pv-physics-004-slope-mix.wav (the reel plays this file)
// Run after `npm run music:<reel>`. Prints the levels so they can be checked against the house limits.
import { readFileSync, writeFileSync } from 'node:fs';
import { SR, mixWithMusic, readWav, renderSfx, writeWav, type Score } from '../src/lib/sfx.ts';

const REELS: Record<string, { lib: string; file: string }> = {
  pp004: { lib: '../src/lib/pp004.ts', file: 'public/pv-physics-004-slope' },
  pc004: { lib: '../src/lib/pc004.ts', file: 'public/pv-chem-004-charles' },
  pp005: { lib: '../src/lib/pp005.ts', file: 'public/pv-physics-005-adiabatic' },
  pp006: { lib: '../src/lib/pp006.ts', file: 'public/pv-physics-006-topspin' },
  pc005: { lib: '../src/lib/pc005.ts', file: 'public/pv-chem-005-pvt' },
  '015': { lib: '../src/lib/reel015.ts', file: 'public/nda-maths-015-slope-graph' },
};
const id = process.argv[2], reel = REELS[id];
if (!reel) throw new Error(`usage: node tools/mix.ts <${Object.keys(REELS).join(' | ')}>`);

const { SOUND } = (await import(reel.lib)) as { SOUND: Score };
const music = readWav(readFileSync(`${reel.file}.wav`));
if (music.sampleRate !== SR) throw new Error(`music is ${music.sampleRate} Hz, expected ${SR}`);
const { left, right, peak, scale } = mixWithMusic(music.channels, SOUND);
writeFileSync(`${reel.file}-mix.wav`, writeWav([left, right], SR));

const db = (v: number) => (20 * Math.log10(Math.max(v, 1e-9))).toFixed(1);
const rmsOf = (a: Float32Array) => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);
const fx = renderSfx(SOUND);
console.log(`${reel.file}-mix.wav: peak ${db(peak)} dB · overall scale ${scale.toFixed(2)} · music ${db(rmsOf(music.channels[0]))} dB RMS · effects ${db(rmsOf(fx))} dB RMS`);
