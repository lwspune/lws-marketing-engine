// Record a reel page to MP4 (real time: takes as long as the reel).
// node reels/tools/record.mjs reels/<name>.render.html   → reels/<name>.mp4
import { writeFileSync } from 'node:fs';
import { openPage } from './edge.mjs';

const [, , page, out = page.replace(/\.render\.html$/, '.mp4')] = process.argv;
const b = await openPage(page);
const len = await b.evaluate('renderReel().then(s => (window._out = s).length)');
let s = '';
for (let i = 0; i < len; i += 4_000_000) s += await b.evaluate(`window._out.slice(${i}, ${i + 4_000_000})`);
writeFileSync(out, Buffer.from(s, 'base64'));
console.log('wrote', out);
b.close();
