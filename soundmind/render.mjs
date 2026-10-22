// Render a week of Sound Mind carousels and write a GoPost manifest for each post.
//
//   node soundmind/render.mjs soundmind/2026-w43/batch.json            → every post in the batch
//   node soundmind/render.mjs soundmind/2026-w43/batch.json sm-002-…   → just the named posts
//
// Checks the whole batch first (cards.js rules), then opens card.html in headless Edge, renders each
// slide to a 1080×1350 JPEG next to the batch file, and fails if any text or drawing spills out of
// its card. Scene stories (format "scene", framework S19) are drawn in remotion/ instead: one frame per
// slide of its SceneStory composition (layout checked by remotion/tests/sceneStory.test.ts).
// Queue the results with: cd publisher && npm run queue:add -- --org=lws-pune ../soundmind/<week>/*.post.json
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
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
const writeManifest = (post) => writeFileSync(join(outDir, `${post.slug}.post.json`), JSON.stringify(cards.buildManifest(post), null, 2) + '\n');

// A scene story: Remotion renders frame i = slide i into a scratch folder, then each frame takes its slide's file name.
for (const post of posts.filter((p) => p.format === 'scene')) {
  const tmp = mkdtempSync(join(tmpdir(), 'sm-scene-'));
  try {
    writeFileSync(join(tmp, 'props.json'), JSON.stringify({ post }));
    // Remotion's own command-line script, run with this Node: no shell, so paths need no quoting on any system.
    const remotion = join(here, '..', 'remotion');
    execFileSync(process.execPath, [join(remotion, 'node_modules', '@remotion', 'cli', 'remotion-cli.js'), 'render', 'SceneStory', join(tmp, 'out'),
      '--sequence', '--image-format=jpeg', '--jpeg-quality=92', `--props=${join(tmp, 'props.json')}`, '--log=error'], { cwd: remotion, stdio: 'inherit' });
    const frame = (f) => parseInt(f.match(/\d+/)[0], 10);
    const frames = readdirSync(join(tmp, 'out')).sort((a, c) => frame(a) - frame(c));
    if (frames.length !== post.slides.length) throw new Error(`${post.slug}: rendered ${frames.length} frames for ${post.slides.length} slides`);
    frames.forEach((f, i) => renameSync(join(tmp, 'out', f), join(outDir, cards.slideFile(post.slug, i))));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  writeManifest(post);
  console.log(`✓ ${post.slug}: ${post.slides.length} scene slides`);
}

const cardPosts = posts.filter((p) => p.format !== 'scene');
const b = cardPosts.length ? await openPage(join(here, 'card.html')) : null;
let failed = 0;
try {
  for (const post of cardPosts) {
    const json = JSON.stringify(post);
    for (let i = 0; i < post.slides.length; i++) {
      const spill = await b.evaluate(`renderSlide(${json}, ${i})`);
      if (spill.length) { failed++; console.error(`✗ ${post.slug} slide ${i + 1}: doesn't fit (${spill.join(', ')})`); }
      writeFileSync(join(outDir, cards.slideFile(post.slug, i)), await b.screenshot(w, h));
    }
    writeManifest(post);
    console.log(`✓ ${post.slug}: ${post.slides.length} slides`);
  }
} finally {
  b?.close();
}
if (failed) { console.error(`${failed} slide(s) don't fit: shorten the text or check the layout.`); process.exit(1); }
