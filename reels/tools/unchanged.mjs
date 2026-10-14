// Prove an engine.js change didn't alter any existing reel: hashes fixed frames + cover (or every
// carousel slide) of each engine page and compares them with baseline.txt.
// node reels/tools/unchanged.mjs          → compare (exit 1 on any difference)
// node reels/tools/unchanged.mjs --save   → re-record the baseline (only after an intended change)
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openPage } from './edge.mjs';

const here = dirname(fileURLToPath(import.meta.url)), reels = join(here, '..'), baseline = join(here, 'baseline.txt');
const TIMES = [0, 3, 8, 14, 20, 26, 28.5];
// nda-maths-001 is standalone (pre-engine), so an engine change can't affect it.
const pages = readdirSync(reels).filter(f => f.endsWith('.render.html') && f !== 'nda-maths-001.render.html').sort();
const sha = s => createHash('sha1').update(s).digest('hex').slice(0, 12);
const lines = [];
for (const p of pages) {
  const b = await openPage(join(reels, p));
  const slides = await b.evaluate('typeof slideCount !== "undefined" ? slideCount : 0'), out = [];
  if (slides) for (let i = 0; i < slides; i++) out.push(sha(await b.evaluate(`renderFrame(${i})`)));
  else { for (const t of TIMES) out.push(sha(await b.evaluate(`renderFrame(${t})`))); out.push('cover:' + sha(await b.evaluate('renderCover()'))); }
  lines.push(`${p} ${out.join(' ')}`);
  b.close();
}
if (process.argv.includes('--save')) {
  writeFileSync(baseline, lines.join('\n') + '\n');
  console.log('saved baseline for', pages.length, 'pages');
} else {
  if (!existsSync(baseline)) throw new Error('no baseline.txt yet: run with --save first');
  const old = new Map(readFileSync(baseline, 'utf8').trim().split('\n').map(l => [l.split(' ')[0], l]));
  let changed = 0;
  for (const l of lines) {
    const name = l.split(' ')[0], same = old.get(name) === l;
    if (!same) changed++;
    console.log(same ? 'SAME   ' : 'CHANGED', name);
  }
  process.exitCode = changed ? 1 : 0;
}
