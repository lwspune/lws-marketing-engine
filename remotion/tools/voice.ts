// Speak a reel's VOICE lines with Kokoro (offline; the model downloads once, ~90 MB, into node_modules' cache):
//   node tools/voice.ts pc007  →  public/voice/<reel file>.wav (the placed voice track) + .json (where it speaks)
// Then `node tools/mix.ts pc007 --voice` mixes it with the music. `--voice=hm_psi` (and `--speed=1.1`) tries another
// voice: Kokoro's Hindi voices (hf_alpha, hf_beta, hm_omega, hm_psi) read English with an Indian accent; their files are
// written with the voice in the name, so the default voice's files stay as they are. Unchanged lines come from the cache
// (public/voice/<key>.wav). Stops, without writing the track, if a line runs past the time its words are on screen.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { SR, readWav, writeWav } from '../src/lib/sfx.ts';
import { VOICE, VOICE_RMS, levelTo, overruns, placeVoice, trimSilence, upsample2x, voiceKey, type VoiceLine } from '../src/lib/voice.ts';

const REELS: Record<string, { lib: string; file: string }> = {
  pc007: { lib: '../src/lib/pc007.ts', file: 'public/pv-chem-007-halflife' },
};
const id = process.argv[2], reel = REELS[id];
if (!reel) throw new Error(`usage: node tools/voice.ts <${Object.keys(REELS).join(' | ')}>`);

const arg = (k: string) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=')[1];
const name = arg('voice') ?? VOICE.name, speed = Number(arg('speed') ?? VOICE.speed), tag = name === VOICE.name ? '' : `-${name}`;
const { VOICE: LINES, DURATION } = (await import(reel.lib)) as { VOICE: VoiceLine[]; DURATION: number };
const dir = 'public/voice';
mkdirSync(dir, { recursive: true });

let tts: { generate: (text: string, o: { voice: string; speed: number }) => Promise<{ audio: Float32Array; sampling_rate: number }> } | null = null;
const clips: Float32Array[] = [];
for (const line of LINES) {
  const cached = `${dir}/${voiceKey(line, name, speed)}.wav`;
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
    const out = await tts!.generate(line.say ?? line.text, { voice: name, speed });
    if (out.sampling_rate * 2 !== SR) throw new Error(`Kokoro gave ${out.sampling_rate} Hz, expected ${SR / 2}`);
    writeFileSync(cached, writeWav([levelTo(trimSilence(upsample2x(out.audio)), VOICE_RMS)], SR));
  }
  clips.push(readWav(readFileSync(cached)).channels[0]);
}

const seconds = clips.map(c => c.length / SR);
LINES.forEach((l, i) => console.log(`${l.t.toFixed(2)} s  ${seconds[i].toFixed(2)} s of ${(l.until - l.t).toFixed(2)} s  "${l.say ?? l.text}"`));
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
