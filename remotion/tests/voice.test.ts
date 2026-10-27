import test from 'node:test';
import assert from 'node:assert/strict';
import { SR, mixWithMusic, type Score } from '../src/lib/sfx.ts';
import { VOICE_SR, upsample2x, trimSilence, levelTo, placeVoice, overruns, voiceKey, onScreen, type VoiceLine } from '../src/lib/voice.ts';

// The voiceover trial (L43, 2026-10-20): Kokoro speaks lines that are already on screen, each inside the time its words
// are up, with the music dipped under it. The reel must still work muted (F17), so the voice only ever repeats text.
const rms = (a: Float32Array, t0: number, t1: number) => {
  let s = 0; const i0 = Math.round(t0 * SR), i1 = Math.round(t1 * SR);
  for (let i = i0; i < i1; i++) s += a[i] * a[i];
  return Math.sqrt(s / Math.max(1, i1 - i0));
};
const tone = (seconds: number, amp = 0.5, rate = VOICE_SR) =>
  Float32Array.from({ length: Math.round(seconds * rate) }, (_, i) => amp * Math.sin((2 * Math.PI * 220 * i) / rate));

test('Kokoro speaks at 24 kHz; doubling to 48 kHz keeps every sample and fills the gaps smoothly', () => {
  assert.equal(VOICE_SR * 2, SR);
  const x = tone(0.1), y = upsample2x(x);
  assert.equal(y.length, 2 * x.length);
  for (let i = 0; i < x.length; i++) assert.equal(y[2 * i], x[i]);
  for (let i = 1; i < x.length - 2; i++) {
    const lo = Math.min(x[i], x[i + 1]) - 0.01, hi = Math.max(x[i], x[i + 1]) + 0.01;
    assert.ok(y[2 * i + 1] >= lo && y[2 * i + 1] <= hi, `midpoint ${i} overshoots`);
  }
});

test('the silence Kokoro adds before and after a line is trimmed, leaving a short breath', () => {
  const quiet = new Float32Array(Math.round(0.4 * SR)), speech = tone(1, 0.5, SR);
  const clip = Float32Array.from([...quiet, ...speech, ...quiet]), out = trimSilence(clip);
  assert.ok(out.length < clip.length && out.length >= speech.length, `${out.length / SR} s`);
  assert.ok(out.length <= speech.length + 0.1 * SR, 'keeps at most 50 ms each side');
});

test('every line is set to the same speaking level', () => {
  for (const amp of [0.05, 0.3, 0.9]) {
    const out = levelTo(tone(1, amp, SR), 0.1);
    const r = Math.sqrt(out.reduce((s, v) => s + v * v, 0) / out.length);
    assert.ok(Math.abs(r - 0.1) < 1e-3, `rms ${r}`);
  }
});

test('lines are placed at their start times; the spans say where the voice is', () => {
  const { track, spans } = placeVoice([{ t: 1, samples: tone(0.5, 0.3, SR) }, { t: 2.5, samples: tone(1, 0.3, SR) }], 5);
  assert.equal(track.length, 5 * SR);
  assert.equal(rms(track, 0, 0.99), 0); assert.ok(rms(track, 1, 1.5) > 0.1); assert.equal(rms(track, 1.51, 2.49), 0);
  assert.deepEqual(spans, [[1, 1.5], [2.5, 3.5]]);
});

test('a line that runs past its slot, or into the next line, is reported (the tool stops on it)', () => {
  const lines: VoiceLine[] = [{ t: 0, until: 2, text: 'a' }, { t: 2, until: 4, text: 'b' }, { t: 4, until: 5, text: 'c' }];
  assert.deepEqual(overruns(lines, [1.9, 2.0, 0.5]), []);
  assert.deepEqual(overruns(lines, [2.1, 1.0, 1.2]).map(o => o.text), ['a', 'c']);
});

test('the cache key changes with the words, the voice and the speed, and only with them', () => {
  const line: VoiceLine = { t: 1, until: 3, text: '16 left' };
  assert.equal(voiceKey(line, 'af_heart', 1), voiceKey({ ...line, t: 2, until: 5 }, 'af_heart', 1));
  assert.notEqual(voiceKey(line, 'af_heart', 1), voiceKey({ ...line, text: '17 left' }, 'af_heart', 1));
  assert.notEqual(voiceKey(line, 'af_heart', 1), voiceKey({ ...line, say: 'sixteen left' }, 'af_heart', 1));
  assert.notEqual(voiceKey(line, 'af_heart', 1), voiceKey(line, 'bf_emma', 1));
  assert.notEqual(voiceKey(line, 'af_heart', 1), voiceKey(line, 'af_heart', 1.1));
  assert.match(voiceKey(line, 'af_heart', 1), /^[0-9a-f]{12}$/);
});

test('the voice only says what is on screen at that moment (F17: the reel still works muted)', () => {
  const shown = [{ t0: 0, t1: 4, text: '64 atoms. Two half-lives.\nHow many are left?' }, { t0: 4, t1: 7, text: '16 left: half go each half-life' }];
  assert.ok(onScreen({ t: 0.1, until: 4, text: '64 atoms. Two half-lives. How many are left?' }, shown));
  assert.ok(onScreen({ t: 4.1, until: 7, text: '16 left: half go each half-life' }, shown));
  assert.ok(!onScreen({ t: 4.1, until: 7, text: 'Sixteen are left now' }, shown), 'words not on screen');
  assert.ok(!onScreen({ t: 3, until: 6, text: '16 left: half go each half-life' }, shown), 'starts before its words are up');
});

test('the mix: music dips under the voice and comes back; the peak stays under −3 dB', () => {
  const n = 6 * SR, music = [0, 1].map(() => Float32Array.from({ length: n }, (_, i) => 0.6 * Math.sin((2 * Math.PI * 110 * i) / SR)));
  const score: Score = { duration: 6, hits: [], beds: [] };
  const voice = placeVoice([{ t: 2, samples: levelTo(tone(1.5, 0.5, SR), 0.25) }], 6);
  const dry = mixWithMusic(music, score), wet = mixWithMusic(music, score, 7, voice);
  const musicOnly = wet.left.map((v, i) => v - voice.track[i]);
  assert.ok(rms(musicOnly, 2.3, 3.4) < 0.45 * rms(dry.left, 2.3, 3.4), 'music did not dip ~7 dB under the voice');
  assert.ok(Math.abs(rms(wet.left, 0.2, 1.5) - rms(dry.left, 0.2, 1.5)) < 1e-3, 'music changed before the voice');
  assert.ok(Math.abs(rms(wet.left, 4.6, 5.8) - rms(dry.left, 4.6, 5.8)) < 0.02, 'music did not come back');
  assert.ok(wet.peak <= 10 ** (-3 / 20), `peak ${wet.peak}`);
});

// Cadence (founder, 2026-10-21: "the voiceover doesn't seem to have cadence"). The spoken form may reshape a line for the
// ear (punctuation, numbers in words) but never change its words (F17); lines can keep their natural loudness
// differences; and pitch movement is measured, not guessed.
test('a spoken form keeps the on-screen words: only punctuation and numbers-as-words may change', async () => {
  const { sameWords } = await import('../src/lib/voice.ts');
  assert.ok(sameWords('Straight rows: 52% filled', 'Straight rows… fifty-two percent filled.'));
  assert.ok(sameWords('74%: the best way to stack', 'Seventy-four percent! The best way to stack.'));
  assert.ok(sameWords('The fruit-seller’s pyramid is 74%', "The fruit-seller's pyramid is seventy-four percent."));
  assert.ok(!sameWords('One in the middle: 68%', 'Put one in the middle: sixty-eight percent'), 'an added word');
  assert.ok(!sameWords('One in the middle: 68%', 'One in the middle: sixty percent'), 'a different number');
});

test('pitch movement is measured: a steady tone barely moves, an octave glide moves about 12 semitones', async () => {
  const { pitchStats } = await import('../src/lib/voice.ts');
  const glide = (f0: number, f1: number, s: number) => { let ph = 0; return Float32Array.from({ length: Math.round(s * SR) }, (_, i) => { ph += (2 * Math.PI * (f0 * (f1 / f0) ** (i / (s * SR)))) / SR; return 0.4 * Math.sin(ph); }); };
  const steady = pitchStats(glide(200, 200, 1), SR), octave = pitchStats(glide(150, 300, 1), SR);
  assert.ok(steady.voiced > 0.9 && steady.range < 0.5, `steady range ${steady.range}`);
  assert.ok(Math.abs(octave.range - 12 * 0.8) < 1.5, `glide p10–p90 range ${octave.range}`);   // the middle 80 % of an even glide
  assert.ok(Math.abs(pitchStats(glide(150, 300, 1), SR).median - 212) < 12);
  assert.equal(pitchStats(new Float32Array(SR), SR).voiced, 0);
});

test('lines share one level: the script\'s overall loudness is set, each line keeps its own emphasis', async () => {
  const { levelTogether } = await import('../src/lib/voice.ts');
  const out = levelTogether([tone(1, 0.2, SR), tone(1, 0.4, SR)], 0.1);
  const r = out.map(c => rms(c, 0, 1));
  assert.ok(Math.abs(r[1] / r[0] - 2) < 1e-6, 'the louder line stays twice as loud');
  const all = Math.sqrt((r[0] ** 2 + r[1] ** 2) / 2);
  assert.ok(Math.abs(all - 0.1) < 1e-6);
});

test('Indic Parler-TTS: a "parler-<speaker>" voice is described by its speaker and pace, other voices are Kokoro\'s', async () => {
  const { parlerSpeaker, parlerDescription } = await import('../src/lib/voice.ts');
  assert.equal(parlerSpeaker('parler-Thoma'), 'Thoma');
  assert.equal(parlerSpeaker('af_heart'), null);
  const d = parlerDescription('Thoma', 1);
  assert.ok(d.startsWith('Thoma speaks'), 'the speaker is named first, so the voice stays the same line to line');
  assert.match(d, /moderate pace/);
  assert.match(d, /no background noise/);
  assert.match(parlerDescription('Mary', 1.15), /^Mary speaks at a slightly fast pace/);
  assert.match(parlerDescription('Mary', 0.9), /^Mary speaks at a slow pace/);
});

test('a line a little too long is sped up to fit without changing its pitch (at most 15 % faster)', async () => {
  const { fitTo, pitchStats } = await import('../src/lib/voice.ts');
  const voice = (s: number) => Float32Array.from({ length: Math.round(s * SR) }, (_, i) => 0.3 * Math.sin((2 * Math.PI * 200 * i) / SR) + 0.1 * Math.sin((2 * Math.PI * 400 * i) / SR));
  const x = voice(2.2), y = fitTo(x, 2.0);
  assert.ok(Math.abs(y.length / SR - 2.0) < 0.01, `fits: ${y.length / SR} s`);
  assert.ok(Math.abs(pitchStats(y, SR).median - pitchStats(x, SR).median) < 5, 'same pitch');
  assert.equal(fitTo(x, 2.5), x, 'a line that already fits is left alone');
  assert.equal(fitTo(x, 1.8), x, 'more than 15 % over is left for the overrun check to report');
});

test('the spoken form of a line, for checking a take by ear-to-text: numbers as words, no punctuation', async () => {
  const { spokenWords } = await import('../src/lib/voice.ts');
  assert.equal(spokenWords('9 ranks.'), 'nine ranks');
  assert.equal(spokenWords('B   Brigadier'), 'b brigadier');
  assert.equal(spokenWords('Carbon-14 halves every 5,730 years'), 'carbon fourteen halves every five thousand seven hundred thirty years');
});
