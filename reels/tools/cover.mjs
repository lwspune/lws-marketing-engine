// Save a reel's cover PNG.
// node reels/tools/cover.mjs reels/<name>.render.html   → reels/<name>-cover.png
import { writeFileSync } from 'node:fs';
import { openPage } from './edge.mjs';

const [, , page, out = page.replace(/\.render\.html$/, '-cover.png')] = process.argv;
const b = await openPage(page);
writeFileSync(out, Buffer.from(await b.evaluate('renderCover()'), 'base64'));
console.log('wrote', out);
b.close();
