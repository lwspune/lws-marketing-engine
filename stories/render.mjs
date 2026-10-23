// Render a week of maths question stories and write a GoPost manifest for each card.
//
//   node stories/render.mjs stories/pyqvault/2026-w44/batch.json              → every day in the batch
//   node stories/render.mjs stories/pyqvault/2026-w44/batch.json 2026-10-26   → just the named days
//
// The folder is the series: stories/pyqvault/ → @pyqvault_, stories/lwspune/ → @lws.pune (questions.js SERIES).
// Checks the whole batch first (questions.js rules, including "never posted before" against every
// other batch of the same series), then opens card.html in headless Edge and renders each day's question and answer card
// to 1080×1920 JPEGs next to the batch file. Fails if any maths won't set or any card doesn't fit.
// Queue the results with: cd publisher && npm run queue:add -- --org=lws-pune ../stories/<series>/<week>/*.post.json
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openPage } from '../reels/tools/edge.mjs';

const require = createRequire(import.meta.url);
const Q = require('./questions.js');
const here = dirname(fileURLToPath(import.meta.url));

const [, , batchFile, ...only] = process.argv;
if (!batchFile) { console.error('usage: node stories/render.mjs <batch.json> [YYYY-MM-DD …]'); process.exit(1); }
const batchPath = resolve(batchFile);
const batch = JSON.parse(readFileSync(batchPath, 'utf8'));
const series = Q.seriesOf(batchPath);

// Questions this account already used in any other week's batch.
const seriesDir = join(here, series);
const used = (existsSync(seriesDir) ? readdirSync(seriesDir) : [])
  .map((w) => join(seriesDir, w, 'batch.json'))
  .filter((f) => existsSync(f) && resolve(f) !== batchPath)
  .flatMap((f) => JSON.parse(readFileSync(f, 'utf8')).days.map((d) => d.questionId));

const problems = Q.validateBatch(batch, used);
if (problems.length) { console.error('Batch has problems:\n- ' + problems.join('\n- ')); process.exit(1); }

const outDir = dirname(batchPath);
const days = batch.days.filter((d) => !only.length || only.includes(d.date));
const [w, h] = Q.SIZE;
const b = await openPage(join(here, 'card.html'));
let failed = 0;
try {
  for (const day of days) {
    const manifests = Q.buildManifests(day, series);
    for (const m of manifests) {
      const bad = await b.evaluate(`renderCard(${JSON.stringify(day)}, ${JSON.stringify(m.question.part)})`);
      if (bad.length) { failed++; console.error(`✗ ${m.slug}: ${bad.join('; ')}`); }
      writeFileSync(join(outDir, m.cover), await b.screenshot(w, h));
      writeFileSync(join(outDir, `${m.slug}.post.json`), JSON.stringify(m, null, 2) + '\n');
    }
    console.log(`✓ ${day.date}: question + answer`);
  }
} finally {
  b.close();
}
if (failed) { console.error(`${failed} card(s) have problems: shorten the text or check the maths.`); process.exit(1); }
