import { Config } from '@remotion/cli/config';

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
