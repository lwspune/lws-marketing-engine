// Speak a reel's VOICE lines with Kokoro (offline; the model downloads once, ~90 MB, into node_modules' cache):
//   node tools/voice.ts pc007  →  public/voice/<reel file>.wav (the placed voice track) + .json (where it speaks)
// Then `node tools/mix.ts pc007 --voice` mixes it with the music. `--voice=hm_psi` (and `--speed=1.1`) tries another
// voice: Kokoro's Hindi voices (hf_alpha, hf_beta, hm_omega, hm_psi) read English with an Indian accent; their files are
// written with the voice in the name, so the default voice's files stay as they are. Unchanged lines come from the cache
// (public/voice/<key>.wav). Stops, without writing the track, if a line runs past the time its words are on screen.
// Cadence (founder, 2026-10-21): `--together` sets one loudness for the script instead of per line. Each line's spoken
// form (`say`) must keep its on-screen words. Prints each line's pitch spread (semitones, 10th–90th percentile).
// `--voice=parler-Thoma` (or parler-Mary, …) uses Indic Parler-TTS instead (trial 2026-10-27; setup:
// tools/parler-requirements.txt); its pace comes from --speed, asked for in words. `--fit` speeds up a line up to 15 % too
// long to fit its time (same pitch).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { SR, readWav, writeWav } from '../src/lib/sfx.ts';
import { VOICE, VOICE_RMS, fitTo, levelTo, levelTogether, overruns, parlerDescription, parlerSpeaker, pitchStats, placeVoice, sameWords, spokenWords, trimSilence, upsample2x, voiceKey, type VoiceLine } from '../src/lib/voice.ts';

const REELS: Record<string, { lib: string; file: string }> = {
  pc007: { lib: '../src/lib/pc007.ts', file: 'public/pv-chem-007-halflife' },
  pp008: { lib: '../src/lib/pp008.ts', file: 'public/pv-physics-008-spoon' },
  pp009: { lib: '../src/lib/pp009.ts', file: 'public/pv-physics-009-wing-mirror' },
  pp010: { lib: '../src/lib/pp010.ts', file: 'public/pv-physics-010-launch-angles' },
  pp009b: { lib: '../src/lib/pp009b.ts', file: 'public/pv-physics-009b-wing-mirror' },
  pc008: { lib: '../src/lib/pc008.ts', file: 'public/pv-chem-008-packing' },
  d001: { lib: '../src/lib/defence001.ts', file: 'public/nda-defence-001-army-ranks' },
  '028': { lib: '../src/lib/reel028.ts', file: 'public/nda-maths-028-trig-lines' },
};
const id = process.argv[2], reel = REELS[id];
if (!reel) throw new Error(`usage: node tools/voice.ts <${Object.keys(REELS).join(' | ')}>`);

const arg = (k: string) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=')[1];
const name = arg('voice') ?? VOICE.name, speed = Number(arg('speed') ?? VOICE.speed);
const together = process.argv.includes('--together'), takes = Number(arg('takes') ?? 1);
// a Parler voice made with `--takes=3` keeps the take a speech recogniser hears closest to the words (tools/parler.py)
const keyName = takes > 1 ? `${name}x${takes}` : name;
const tag = [name === VOICE.name ? '' : name, speed === VOICE.speed ? '' : `s${speed}`, takes > 1 ? `x${takes}` : '', together ? 'together' : '']
  .filter(Boolean).map(p => `-${p}`).join('');
const { VOICE: LINES, DURATION } = (await import(reel.lib)) as { VOICE: VoiceLine[]; DURATION: number };
for (const l of LINES) if (l.say && !sameWords(l.text, l.say)) throw new Error(`"${l.say}" changes the words of "${l.text}" (F17)`);
const dir = 'public/voice';
mkdirSync(dir, { recursive: true });

let tts: { generate: (text: string, o: { voice: string; speed: number }) => Promise<{ audio: Float32Array; sampling_rate: number }> } | null = null;
async function speak(text: string, key: string): Promise<Float32Array> {
  const cached = `${dir}/${key}.wav`;
  if (!existsSync(cached)) {
    if (!tts) {
      const { KokoroTTS } = await import('kokoro-js');
      const k = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
      // The Hindi voices ship with kokoro-js but aren't on its (frozen) list, so its name check is relaxed for them on
      // this instance; their first letter "h" makes it phonemize the English text with espeak "en".
      const check = k._validate_voice.bind(k);
      if (/^h[fm]_/.test(name)) Object.assign(k, { _validate_voice: (v: string) => (/^h[fm]_/.test(v) ? v.at(0) : check(v)) });
      tts = k as unknown as typeof tts;
    }
    const out = await tts!.generate(text, { voice: name, speed });
    if (out.sampling_rate * 2 !== SR) throw new Error(`Kokoro gave ${out.sampling_rate} Hz, expected ${SR / 2}`);
    writeFileSync(cached, writeWav([trimSilence(upsample2x(out.audio))], SR));
  }
  return readWav(readFileSync(cached)).channels[0];
}

// A "parler-<speaker>" voice (Indic Parler-TTS, Indian English): the lines not yet cached go to tools/parler.py in one
// batch (the model loads once, ~1 min; each line takes a while on the CPU), which writes 48 kHz clips to trim and cache.
const speaker = parlerSpeaker(name);
if (speaker) {
  const todo = LINES.map(l => ({ key: voiceKey(l, keyName, speed) + '-raw', text: l.say ?? l.text, words: spokenWords(l.say ?? l.text), takes }))
    .filter(l => !existsSync(`${dir}/${l.key}.wav`));
  if (todo.length) {
    const out = mkdtempSync(join(tmpdir(), 'parler-'));
    try {
      writeFileSync(`${out}/job.json`, JSON.stringify({ description: parlerDescription(speaker, speed), out, lines: todo }));
      const run = spawnSync('.parler/Scripts/python', ['tools/parler.py', `${out}/job.json`], { stdio: 'inherit' });
      if (run.status !== 0) throw new Error('tools/parler.py failed (setup: tools/parler-requirements.txt)');
      for (const l of todo) {
        const { channels, sampleRate } = readWav(readFileSync(`${out}/${l.key}.wav`));
        if (sampleRate !== SR) throw new Error(`parler.py gave ${sampleRate} Hz, expected ${SR}`);
        // Parler leaves a soft hiss before and after a line, so its edges are found against the clip's own peak
        const peak = channels[0].reduce((m, v) => Math.max(m, Math.abs(v)), 0);
        writeFileSync(`${dir}/${l.key}.wav`, writeWav([trimSilence(channels[0], 0.15 * peak)], SR));
      }
    } finally { rmSync(out, { recursive: true, force: true }); }
  }
}

let clips: Float32Array[] = [];
for (const line of LINES) clips.push(await speak(line.say ?? line.text, voiceKey(line, keyName, speed) + '-raw'));
clips = together ? levelTogether(clips, VOICE_RMS) : clips.map(c => levelTo(c, VOICE_RMS));
// `--fit`: a line up to 15 % too long for its time is sped up to fit, same pitch (fitTo); longer ones are still refused.
if (process.argv.includes('--fit')) clips = clips.map((c, i) => {
  const room = Math.min(LINES[i].until, LINES[i + 1]?.t ?? Infinity) - LINES[i].t - 0.02, y = fitTo(c, room);
  if (y !== c) console.log(`fit: "${LINES[i].say ?? LINES[i].text}" ${((c.length / y.length - 1) * 100).toFixed(0)} % faster`);
  return y;
});

const seconds = clips.map(c => c.length / SR);
const spread = clips.map(c => pitchStats(c, SR).range);
LINES.forEach((l, i) => console.log(`${l.t.toFixed(2)} s  ${seconds[i].toFixed(2)} s of ${(l.until - l.t).toFixed(2)} s  pitch ±${spread[i].toFixed(1)} st  "${l.say ?? l.text}"`));
console.log(`pitch spread, median of lines: ${[...spread].sort((a, b) => a - b)[Math.floor(spread.length / 2)].toFixed(1)} semitones${tag ? ` (${tag.slice(1)})` : ''}`);
const late = overruns(LINES, seconds);
if (late.length) {
  for (const l of late) console.error(`too long: "${l.text}" takes ${l.seconds.toFixed(2)} s, has ${(l.until - l.t).toFixed(2)} s`);
  process.exit(1);
}
const { track, spans } = placeVoice(LINES.map((l, i) => ({ t: l.t, samples: clips[i] })), DURATION);
const base = `${dir}/${basename(reel.file)}${tag}`;
writeFileSync(`${base}.wav`, writeWav([track], SR));
writeFileSync(`${base}.json`, JSON.stringify({ voice: { name, speed }, spans }, null, 1));
console.log(`${base}.wav: ${spans.length} lines, voice ${name} at ${speed}×`);
