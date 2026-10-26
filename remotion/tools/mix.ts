// Mix a reel's own sound effects (its SOUND score) into its music, dipping the music under them:
//   node tools/mix.ts pp004   →  public/pv-physics-004-slope-mix.wav (the reel plays this file)
//   node tools/mix.ts pc007 --voice  →  …-voice-mix.wav, with the voiceover from tools/voice.ts (L43)
//   node tools/mix.ts pc007 --voice=hm_psi  →  …-voice-hm_psi-mix.wav (another voice, to compare)
// Run after `npm run music:<reel>`. Prints the levels so they can be checked against the house limits.
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { SR, mixWithMusic, readWav, renderSfx, writeWav, type Score, type VoiceTrack } from '../src/lib/sfx.ts';

const REELS: Record<string, { lib: string; file: string }> = {
  pp004: { lib: '../src/lib/pp004.ts', file: 'public/pv-physics-004-slope' },
  pc004: { lib: '../src/lib/pc004.ts', file: 'public/pv-chem-004-charles' },
  pp005: { lib: '../src/lib/pp005.ts', file: 'public/pv-physics-005-adiabatic' },
  pp006: { lib: '../src/lib/pp006.ts', file: 'public/pv-physics-006-topspin' },
  pp007: { lib: '../src/lib/pp007.ts', file: 'public/pv-physics-007-heat' },
  pc006: { lib: '../src/lib/pc006.ts', file: 'public/pv-chem-006-flame' },
  pc005: { lib: '../src/lib/pc005.ts', file: 'public/pv-chem-005-pvt' },
  pc007: { lib: '../src/lib/pc007.ts', file: 'public/pv-chem-007-halflife' },
  pp008: { lib: '../src/lib/pp008.ts', file: 'public/pv-physics-008-spoon' },
  pp009: { lib: '../src/lib/pp009.ts', file: 'public/pv-physics-009-wing-mirror' },
  pp010: { lib: '../src/lib/pp010.ts', file: 'public/pv-physics-010-launch-angles' },
  pp009b: { lib: '../src/lib/pp009b.ts', file: 'public/pv-physics-009b-wing-mirror' },
  pc008: { lib: '../src/lib/pc008.ts', file: 'public/pv-chem-008-packing' },
  pf2: { lib: '../src/lib/pf2.ts', file: 'public/pv-f2-induction' },
  pp011: { lib: '../src/lib/pp011.ts', file: 'public/pv-physics-011-induction' },
  pc009: { lib: '../src/lib/pc009.ts', file: 'public/pv-chem-009-electrolysis' },
  pp012: { lib: '../src/lib/pp012.ts', file: 'public/pv-physics-012-lift-power' },
  pp013: { lib: '../src/lib/pp013.ts', file: 'public/pv-physics-013-lightning' },
  pc010: { lib: '../src/lib/pc010.ts', file: 'public/pv-chem-010-salt' },
  pp015: { lib: '../src/lib/pp015.ts', file: 'public/pv-physics-015-ice' },
  pc011: { lib: '../src/lib/pc011.ts', file: 'public/pv-chem-011-hammer' },
  pc012: { lib: '../src/lib/pc012.ts', file: 'public/pv-chem-012-ph' },
  pp016: { lib: '../src/lib/pp016.ts', file: 'public/pv-physics-016-spectrum' },
  '015': { lib: '../src/lib/reel015.ts', file: 'public/nda-maths-015-slope-graph' },
  '016': { lib: '../src/lib/reel016.ts', file: 'public/nda-maths-016-multiply' },
  '017': { lib: '../src/lib/reel017.ts', file: 'public/nda-maths-017-probability-map' },
  '019': { lib: '../src/lib/reel019.ts', file: 'public/nda-maths-019-area-between' },
  '020': { lib: '../src/lib/reel020.ts', file: 'public/nda-maths-020-matrix-grid' },
  '021': { lib: '../src/lib/reel021.ts', file: 'public/nda-maths-021-log-flip' },
  '022': { lib: '../src/lib/reel022.ts', file: 'public/nda-maths-022-complete-square' },
  '023': { lib: '../src/lib/reel023.ts', file: 'public/nda-maths-023-derivative-cycle' },
  '024': { lib: '../src/lib/reel024.ts', file: 'public/nda-maths-024-function-range' },
  '025': { lib: '../src/lib/reel025.ts', file: 'public/nda-maths-025-galton-board' },
  '027': { lib: '../src/lib/reel027.ts', file: 'public/nda-maths-027-circle-area' },
  '018': { lib: '../src/lib/reel018.ts', file: 'public/nda-maths-018-secant-tangent' },
  '010': { lib: '../src/lib/reel010.ts', file: 'public/nda-maths-010-why-seven' },
  '011': { lib: '../src/lib/reel011.ts', file: 'public/nda-maths-011-why-det-area' },
  '012': { lib: '../src/lib/reel012.ts', file: 'public/nda-maths-012-why-sin-cos' },
  '014': { lib: '../src/lib/reel014.ts', file: 'public/nda-maths-014-cone' },
  sm011: { lib: '../src/lib/sm011.ts', file: 'public/sm-r011-chai' },
  sm012: { lib: '../src/lib/sm012.ts', file: 'public/sm-r012-tapri' },
  ohm: { lib: '../src/lib/pvOhm.ts', file: 'public/pv-physics-014-ohm' },
  sm013: { lib: '../src/lib/sm013.ts', file: 'public/sm-r013-window' },
};
const id = process.argv[2], reel = REELS[id];
if (!reel) throw new Error(`usage: node tools/mix.ts <${Object.keys(REELS).join(' | ')}>`);

const { SOUND } = (await import(reel.lib)) as { SOUND: Score };
const music = readWav(readFileSync(`${reel.file}.wav`));
if (music.sampleRate !== SR) throw new Error(`music is ${music.sampleRate} Hz, expected ${SR}`);
let voice: VoiceTrack | undefined, out = `${reel.file}-mix.wav`;
const voiceArg = process.argv.find(a => a === '--voice' || a.startsWith('--voice='));
if (voiceArg) {
  const tag = voiceArg.includes('=') ? `-${voiceArg.split('=')[1]}` : '', v = `public/voice/${basename(reel.file)}${tag}`;
  voice = { track: readWav(readFileSync(`${v}.wav`)).channels[0], spans: JSON.parse(readFileSync(`${v}.json`, 'utf8')).spans };
  out = `${reel.file}-voice${tag}-mix.wav`;
}
const { left, right, peak, scale } = mixWithMusic(music.channels, SOUND, 7, voice);
writeFileSync(out, writeWav([left, right], SR));

const db = (v: number) => (20 * Math.log10(Math.max(v, 1e-9))).toFixed(1);
const rmsOf = (a: Float32Array) => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);
const fx = renderSfx(SOUND);
console.log(`${out}: peak ${db(peak)} dB · overall scale ${scale.toFixed(2)} · music ${db(rmsOf(music.channels[0]))} dB RMS · effects ${db(rmsOf(fx))} dB RMS${voice ? ` · voice ${db(rmsOf(voice.track.filter(v => v !== 0)))} dB RMS while speaking` : ''}`);
