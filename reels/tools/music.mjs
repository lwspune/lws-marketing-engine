// Render a reel's house music (engine.js, rendered offline: sample-exact, starts at t = 0) to a WAV file.
// For reels made in Remotion (remotion/), which play it as their soundtrack.
// node reels/tools/music.mjs reels/<name>.render.html out.wav
// node reels/tools/music.mjs remotion/music/<name>.json out.wav   ← { "duration": 31.5, "music": { "chime": 21.8 } }
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { openPage, fileUrl } from './edge.mjs';

const [, , src, out] = process.argv;
if (!src || !out) throw new Error('usage: music.mjs <page.render.html | spec.json> <out.wav>');

// A spec that names a shelf track ({ "music": { "track": "<id>", "from": s } }): cut the licensed track instead of
// rendering engine.js music (reels/tools/shelf.js has the rules and the list).
if (src.endsWith('.json') && JSON.parse(readFileSync(src, 'utf8')).music?.track) {
  const { execFileSync } = await import('node:child_process');
  const shelf = createRequire(import.meta.url)('./shelf.js');
  const spec = JSON.parse(readFileSync(src, 'utf8')), track = shelf.find(shelf.load(), spec.music.track);
  const plan = shelf.cutPlan(track, { duration: spec.duration, from: spec.music.from });
  const ffmpeg = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'remotion', 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffmpeg.exe');
  const wav = execFileSync(ffmpeg, ['-v', 'error', '-ss', String(plan.from), '-t', String(plan.duration), '-i', shelf.fileOf(track.id),
    '-af', `volume=${plan.gainDb}dB`, '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', '-f', 'wav', '-'], { maxBuffer: 1 << 28 });
  let o = 12; while (wav.toString('ascii', o, o + 4) !== 'data') o += 8 + wav.readUInt32LE(o + 4);
  const pcm = new Int16Array(wav.buffer, wav.byteOffset + o + 8, (wav.length - o - 8) >> 1);
  shelf.applyFades(pcm, 48000, plan);
  writeFileSync(out, wav);
  console.log(`wrote ${out} · ${track.title} by ${track.artist} (Pixabay) · ${plan.from}–${plan.from + plan.duration} s · ${plan.gainDb} dB`);
  process.exit(0);
}

let page = src, tmp = null;
if (src.endsWith('.json')) {
  // A throwaway page that mounts the engine with just the timing and music of the spec.
  const spec = JSON.parse(readFileSync(src, 'utf8')), engine = fileUrl(resolve(dirname(fileURLToPath(import.meta.url)), '..', 'engine.js'));
  tmp = mkdtempSync(join(tmpdir(), 'reel-music-')); page = join(tmp, 'music.render.html');
  writeFileSync(page, `<!doctype html><meta charset="utf-8"><canvas id="c"></canvas><div id="bar"></div><div id="status"></div>
<script src="${engine}"></script>
<script>Reel.mount(${JSON.stringify({ name: 'music', theme: 'white', size: [1080, 1920], captions: [], lines: [], ...spec })});</script>`);
}
const b = await openPage(page);
try {
  // Read the base64 back in 4 MB slices, like record.mjs: one large return stalls the DevTools socket.
  const len = await b.evaluate('renderMusic().then(s => (window._wav = s).length)');
  let s = '';
  for (let i = 0; i < len; i += 4_000_000) s += await b.evaluate(`window._wav.slice(${i}, ${i + 4_000_000})`);
  writeFileSync(out, Buffer.from(s, 'base64'));
  console.log('wrote', out);
} finally {
  b.close();
  if (tmp) rmSync(tmp, { recursive: true, force: true });
}
