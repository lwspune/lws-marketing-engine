import { Config } from '@remotion/cli/config';
import { useRenderTemp } from './tools/tempDir.ts';

// Every render keeps its temp files (browser profiles, bundles, frames) in one folder of its own and clears that
// folder's stale leftovers first: Remotion's own clean-up fails on Windows (tools/tempDir.ts). The disk filled on
// 2026-10-17 and twice on 2026-10-22.
useRenderTemp();
// At most 4 browser tabs per render (Remotion would open 6 on this 12-core, 16 GB laptop): two renders side by side
// ran memory out and grew the page file to 12.6 GB. Render one thing at a time.
Config.setConcurrency(4);

// Render with the Edge already on this laptop instead of downloading a browser (disk is tight), in its
// new headless mode. Output as reels/tools/record.mjs makes it: H.264 + AAC MP4, sRGB-safe yuv420p.
Config.setBrowserExecutable('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe');
Config.setChromeMode('chrome-for-testing');
// 3D reels (three.js): draw WebGL on the laptop's GPU through ANGLE, much faster than software rendering.
Config.setChromiumOpenGlRenderer('angle');
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setVideoImageFormat('png');
Config.setCrf(16);
Config.setOverwriteOutput(true);
