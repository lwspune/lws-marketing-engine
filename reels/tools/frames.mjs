// Contact sheet of a reel page at chosen times (seconds), 4 per row, for checking the storyboard.
// node reels/tools/frames.mjs reels/<name>.render.html out.png 0 3.5 9.6 15 22 26.5 30.8
import { writeFileSync } from 'node:fs';
import { openPage } from './edge.mjs';

const [, , page, out, ...ts] = process.argv;
if (!out || !ts.length) throw new Error('usage: frames.mjs <page> <out.png> <t1> <t2> …');
const b = await openPage(page);
const sheet = await b.evaluate(`(async () => {
  const times = ${JSON.stringify(ts.map(Number))}, cols = 4, w = 360, h = 640, rows = Math.ceil(times.length / cols);
  const s = document.createElement('canvas'); s.width = cols * w; s.height = rows * (h + 30); const x = s.getContext('2d');
  x.fillStyle = '#222'; x.fillRect(0, 0, s.width, s.height);
  for (let i = 0; i < times.length; i++) {
    frame(times[i]); x.drawImage(document.getElementById('c'), (i % cols) * w, Math.floor(i / cols) * (h + 30), w, h);
    x.fillStyle = '#fff'; x.font = '20px monospace'; x.fillText('t=' + times[i] + 's', (i % cols) * w + 8, Math.floor(i / cols) * (h + 30) + h + 22);
  }
  return s.toDataURL('image/png').split(',')[1]; })()`);
writeFileSync(out, Buffer.from(sheet, 'base64'));
console.log('wrote', out);
b.close();
