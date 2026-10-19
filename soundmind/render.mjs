// Render a week of Sound Mind carousels and write a GoPost manifest for each post.
//
//   node soundmind/render.mjs soundmind/2026-w43/batch.json            → every post in the batch
//   node soundmind/render.mjs soundmind/2026-w43/batch.json sm-002-…   → just the named posts
//
// Checks the whole batch first (cards.js rules), then opens card.html in headless Edge, renders each
// slide to a 1080×1350 JPEG next to the batch file, and fails if any text or drawing spills out of
// its card. Queue the results with: cd publisher && npm run queue:add -- --org=lws-pune ../soundmind/<week>/*.post.json
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openPage } from '../reels/tools/edge.mjs';

const require = createRequire(import.meta.url);
const cards = require('./cards.js');
const { names } = require('./art.js');
const here = dirname(fileURLToPath(import.meta.url));

const [, , batchFile, ...only] = process.argv;
if (!batchFile) { console.error('usage: node soundmind/render.mjs <batch.json> [slug …]'); process.exit(1); }
const batch = JSON.parse(readFileSync(batchFile, 'utf8'));
const problems = cards.validateBatch(batch, names);
if (problems.length) { console.error('Batch has problems:\n- ' + problems.join('\n- ')); process.exit(1); }

const outDir = dirname(resolve(batchFile));
const posts = batch.posts.filter((p) => !only.length || only.includes(p.slug));
const [w, h] = cards.SIZE;
const b = await openPage(join(here, 'card.html'));
let failed = 0;
try {
  for (const post of posts) {
    const json = JSON.stringify(post);
    for (let i = 0; i < post.slides.length; i++) {
      const spill = await b.evaluate(`renderSlide(${json}, ${i})`);
      if (spill.length) { failed++; console.error(`✗ ${post.slug} slide ${i + 1}: doesn't fit (${spill.join(', ')})`); }
      writeFileSync(join(outDir, cards.slideFile(post.slug, i)), await b.screenshot(w, h));
    }
    writeFileSync(join(outDir, `${post.slug}.post.json`), JSON.stringify(cards.buildManifest(post), null, 2) + '\n');
    console.log(`✓ ${post.slug}: ${post.slides.length} slides`);
  }
} finally {
  b.close();
}
if (failed) { console.error(`${failed} slide(s) don't fit: shorten the text or check the layout.`); process.exit(1); }
