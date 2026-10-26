// The stills sheet (runbook step 5) in one go: bundle the project once, render the beat frames of one composition, and
// lay them out on one sheet with their times. `npx remotion still` bundles again for every frame (~90 s each on this
// laptop, 2026-10-23); this takes about that long for the whole sheet. One render at a time, like every render here.
//   npm run stills -- <Composition> <outDir> <frame,frame,...>
// outDir: the session's scratchpad (the founder judges finished reels only). Writes f<frame>.png + sheet.png there.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { RENDER_TEMP, useRenderTemp } from './tempDir.ts';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const [comp, outArg, list] = process.argv.slice(2);
if (!comp || !outArg || !list) throw new Error('usage: npm run stills -- <Composition> <outDir> <frame,frame,...>');
const outDir = resolve(outArg), frames = list.split(',').map(Number);
useRenderTemp();   // the browser's profile goes to RENDER_TEMP too (this script never reads remotion.config.ts)
mkdirSync(outDir, { recursive: true });

const bundleDir = join(RENDER_TEMP, `stills-${comp}-${Date.now()}`);
const serveUrl = await bundle({ entryPoint: resolve('src/index.ts'), outDir: bundleDir });
const opts = { browserExecutable: EDGE, chromeMode: 'chrome-for-testing' as const, chromiumOptions: { gl: 'angle' as const } };
const composition = await selectComposition({ serveUrl, id: comp, inputProps: {}, ...opts });
const name = (f: number) => join(outDir, `f${String(f).padStart(3, '0')}.png`);
for (const frame of frames) await renderStill({ composition, serveUrl, output: name(frame), frame, ...opts });
rmSync(bundleDir, { recursive: true, force: true });

// The sheet: each still at a quarter size with its time, screenshotted by headless Edge.
const cols = Math.min(6, frames.length), rows = Math.ceil(frames.length / cols);
const cells = frames.map(f => `<figure><img src="${pathToFileURL(name(f))}"><figcaption>${(f / composition.fps).toFixed(2)} s · frame ${f}</figcaption></figure>`).join('');
const html = join(outDir, 'sheet.html');
writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#ddd;font:20px system-ui;display:grid;`
  + `grid-template-columns:repeat(${cols},270px);gap:8px;padding:8px}figure{margin:0}img{width:270px;height:480px;display:block}`
  + `figcaption{text-align:center}</style>${cells}`);
execFileSync(EDGE, ['--headless=new', '--disable-gpu', `--screenshot=${join(outDir, 'sheet.png')}`, `--window-size=${8 + cols * 278},${8 + rows * 520}`,
  '--allow-file-access-from-files', '--hide-scrollbars', pathToFileURL(html).href], { stdio: 'ignore' });
console.log(`sheet: ${join(outDir, 'sheet.png')}`);
