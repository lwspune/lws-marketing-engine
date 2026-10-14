// Check a recorded MP4: size, audio within house limits (peak ≤ −3 dB, body about −22 dB RMS), and save
// a strip of frames decoded from the file itself (what Instagram will get).
// node reels/tools/check-video.mjs reels/<name>.mp4 strip.png 0.05 9.6 15.2 22.6 26.5 30.8
import { writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { launch, fileUrl } from './edge.mjs';

const [, , video, out, ...ts] = process.argv;
if (!out || !ts.length) throw new Error('usage: check-video.mjs <video.mp4> <out.png> <t1> <t2> …');
const b = await launch(fileUrl(dirname(video)) + '/'); // any file:// page, so the video can be fetched
const r = await b.evaluate(`(async () => {
  const url = ${JSON.stringify(fileUrl(video))};
  const audio = await new OfflineAudioContext(2, 48000, 48000).decodeAudioData(await (await fetch(url)).arrayBuffer());
  const d = audio.getChannelData(0), win = audio.sampleRate / 2, rms = [];
  let peak = 0; for (const s of d) peak = Math.max(peak, Math.abs(s));
  for (let i = 0; i < d.length; i += win) { let s = 0; for (let j = i; j < Math.min(i + win, d.length); j++) s += d[j] * d[j]; rms.push(20 * Math.log10(Math.sqrt(s / win) + 1e-9)); }
  const v = document.createElement('video'); v.muted = true; v.src = url; document.body.append(v);
  await new Promise((r, j) => { v.onloadedmetadata = r; v.onerror = () => j(new Error('cannot decode video')); });
  const times = ${JSON.stringify(ts.map(Number))}, w = 270, h = 480;
  const s = document.createElement('canvas'); s.width = times.length * w; s.height = h; const x = s.getContext('2d');
  for (let i = 0; i < times.length; i++) { v.currentTime = times[i]; await new Promise(r => v.onseeked = r); x.drawImage(v, i * w, 0, w, h); }
  const body = rms.slice(3, -6).sort((a, b) => a - b); // skip the fade-in and fade-out
  return { w: v.videoWidth, h: v.videoHeight, seconds: +v.duration.toFixed(1), channels: audio.numberOfChannels,
    peakDb: +(20 * Math.log10(peak)).toFixed(1), medianRmsDb: +body[body.length >> 1].toFixed(1), png: s.toDataURL('image/png').split(',')[1] };
})()`);
writeFileSync(out, Buffer.from(r.png, 'base64')); delete r.png;
const checks = [
  ['1080×1920', r.w === 1080 && r.h === 1920],
  ['stereo audio', r.channels === 2],
  ['peak ≤ −3 dB', r.peakDb <= -3],
  ['body loudness −26…−18 dB RMS', r.medianRmsDb >= -26 && r.medianRmsDb <= -18],
];
console.log(r);
for (const [name, ok] of checks) console.log(ok ? 'PASS' : 'FAIL', name);
b.close();
process.exitCode = checks.every(([, ok]) => ok) ? 0 : 1;
