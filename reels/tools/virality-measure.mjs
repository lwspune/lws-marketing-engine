// Measure a finished reel for the virality predictor (framework F30): motion and colourfulness over the first 3 s, its
// length, and its cover's colourfulness, decoded from the files the manifest posts (what Instagram gets).
// node reels/tools/virality-measure.mjs reels/<reel>.post.json [more.post.json …]
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { launch, fileUrl } from './edge.mjs';

const v = createRequire(import.meta.url)('./virality.js');
const manifests = process.argv.slice(2);
if (!manifests.length) throw new Error('usage: virality-measure.mjs <reel>.post.json …');

const W = 90, H = 160, STEP = 0.1, SPAN = 3;   // small frames, 10 a second, first 3 s
const b = await launch(fileUrl(dirname(manifests[0])) + '/');
const median = (xs) => { const s = [...xs].sort((a, c) => a - c), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

for (const file of manifests) {
  const m = JSON.parse(readFileSync(file, 'utf8')), dir = dirname(file);
  const video = JSON.stringify(m.files ?? m).match(/[\w.-]+\.mp4/)[0], cover = JSON.stringify(m.files ?? m).match(/[\w.-]+-cover[\w.-]*\.(?:png|jpe?g)/)?.[0];
  const r = await b.evaluate(`(async () => {
    const W = ${W}, H = ${H}, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d', { willReadFrequently: true }), grab = () => btoa(String.fromCharCode(...x.getImageData(0, 0, W, H).data));
    const v = document.createElement('video'); v.muted = true; v.src = ${JSON.stringify(fileUrl(join(dir, video)))}; document.body.append(v);
    await new Promise((ok, no) => { v.onloadedmetadata = ok; v.onerror = () => no(new Error('cannot decode video')); });
    const frames = [];
    for (let t = 0; t <= ${SPAN} + 1e-9; t += ${STEP}) { v.currentTime = t; await new Promise(ok => v.onseeked = ok); x.drawImage(v, 0, 0, W, H); frames.push(grab()); }
    let coverPx = null;
    ${cover ? `const img = new Image(); img.src = ${JSON.stringify(fileUrl(join(dir, cover)))}; await img.decode(); x.drawImage(img, 0, 0, W, H); coverPx = grab();` : ''}
    return { seconds: v.duration, frames, coverPx };
  })()`);
  const px = (s) => new Uint8ClampedArray(Buffer.from(s, 'base64'));
  const frames = r.frames.map(px), diffs = frames.slice(1).map((f, i) => v.changedShare(frames[i], f));
  const share = v.motionShare(diffs), colour = median(frames.map(v.colourfulness)), coverColour = r.coverPx ? v.colourfulness(px(r.coverPx)) : null;
  console.log(JSON.stringify({ reel: file.replace(/^.*[\\/]/, '').replace('.post.json', ''), seconds: +r.seconds.toFixed(1),
    motion03: +share.toFixed(2), colour03: +colour.toFixed(1), coverColour: coverColour == null ? null : +coverColour.toFixed(1),
    points: { motion: v.points.motion(share), colour: v.points.colour(colour), length: v.points.length(r.seconds) } }));
}
b.close();
