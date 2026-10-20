// Reel element analysis: measure each cover's pixels (E1–E4) in headless Edge with the tested coverMetrics() from
// elements.js, at 270 px wide. Writes <out-dir>/covers.json { id: metrics }. Delete the covers afterwards.
//
//   node reels/tools/cover-metrics.mjs <out-dir> <covers-dir>
import { readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { launch, fileUrl } from './edge.mjs';

const [, , outDir, coversDir] = process.argv;
if (!outDir || !coversDir) throw new Error('usage: cover-metrics.mjs <out-dir> <covers-dir>');
const { coverMetrics } = createRequire(import.meta.url)('./elements.js');

const files = readdirSync(coversDir).filter(f => /^R\d+\.jpg$/.test(f)).sort();
const b = await launch(fileUrl(coversDir) + '/');
const out = {};
try {
  for (const f of files) {
    out[f.replace('.jpg', '')] = await b.evaluate(`(async () => {
      const bmp = await createImageBitmap(await (await fetch(${JSON.stringify(fileUrl(join(coversDir, f)))})).blob());
      const w = 270, h = Math.round(bmp.height * w / bmp.width), c = new OffscreenCanvas(w, h), x = c.getContext('2d');
      x.drawImage(bmp, 0, 0, w, h);
      const m = (${coverMetrics.toString()})(x.getImageData(0, 0, w, h).data, w, h);
      return { ...m, width: bmp.width, height: bmp.height };
    })()`);
  }
} finally { b.close(); }
writeFileSync(join(outDir, 'covers.json'), JSON.stringify(out, null, 1));
console.log(`${files.length} covers measured → ${join(outDir, 'covers.json')}`);
