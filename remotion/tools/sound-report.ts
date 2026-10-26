// The sound critic's view of a reel (framework F38): it can't listen, so it reads the mix as numbers. Prints every hit and
// bed from the reel's SOUND score, the music's own hits, and the loudness every 0.25 s of the music, the effects and the
// final mix, then the gap between effects and music (F16: effects 5–10 dB under the music's body).
//   node tools/sound-report.ts src/lib/pc011.ts public/pv-chem-011-hammer
import { existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SR, readWav, renderSfx, rmsDbWindows, type Score } from '../src/lib/sfx.ts';

const [lib, file] = process.argv.slice(2);
if (!lib || !file) throw new Error('usage: node tools/sound-report.ts <src/lib/reel.ts> <public/reel-file (no .wav)>');
const { SOUND } = (await import(pathToFileURL(resolve(lib)).href)) as { SOUND: Score };
const mono = (path: string) => { const w = readWav(readFileSync(path)); return w.channels[0].map((v, i) => (v + (w.channels[1]?.[i] ?? v)) / 2); };
const mix = mono(`${file}-mix.wav`), fx = renderSfx(SOUND);
// the music as it plays: the mix minus the effects (after the reel's level curve, the dips under each effect and the limiter).
// The raw music file would mislead: a swell the curve takes out still shows in it (Chemistry #11, the sound critic's pass 2).
const music = mix.map((v, i) => v - (fx[i] ?? 0));
const spec = `music/${basename(file)}.json`;
const cues = existsSync(spec) ? (JSON.parse(readFileSync(spec, 'utf8')).music.hits as number[]) : [];

const STEP = 0.25, M = rmsDbWindows(music, SR, STEP), E = rmsDbWindows(fx, SR, STEP), X = rmsDbWindows(mix, SR, STEP);
const f1 = (n: number) => (n <= -119 ? '   –' : n.toFixed(1).padStart(5));
console.log(`Sound report · ${basename(file)} (${SOUND.duration} s)`);
console.log(`Hits (time kind gain): ${SOUND.hits.map(h => `${h.t.toFixed(2)} ${h.kind} ${h.gain.toFixed(2)}`).join(' · ')}`);
console.log(`Beds: ${SOUND.beds.map(b => `${b.kind} ${b.t0.toFixed(2)}–${b.t1.toFixed(2)}`).join(' · ') || 'none'}`);
console.log(`Music hits (the music's own accents): ${cues.join(', ') || 'none'}`);
console.log('Loudness every 0.25 s, dB RMS (time · music as played · effects · mix):');
const rows: string[] = [];
for (let i = 0; i < X.length; i++) rows.push(`${(i * STEP).toFixed(2)} ${f1(M[i] ?? -120)} ${f1(E[i] ?? -120)} ${f1(X[i])}`);
for (let i = 0; i < rows.length; i += 4) console.log('  ' + rows.slice(i, i + 4).join('  |  '));
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const live = E.map((e, i) => [e, M[i]]).filter(([e, m]) => e > -60 && m > -60);
const peak = mix.reduce((a, v) => Math.max(a, Math.abs(v)), 0);
console.log(`Effects vs music where both play: median ${median(live.map(([e, m]) => e - m)).toFixed(1)} dB (F16 wants −5 to −10) · mix peak ${(20 * Math.log10(peak)).toFixed(1)} dB · loudest effects at ${E.map((e, i) => [e, i * STEP]).sort((a, b) => b[0] - a[0]).slice(0, 5).map(([, t]) => t.toFixed(2)).join(', ')} s`);
