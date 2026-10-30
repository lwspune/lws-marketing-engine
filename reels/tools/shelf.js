"use strict";
// The music shelf (founder, 2026-10-30): licensed tracks we put in our own MP4 and post through GoPost everywhere
// (Pixabay Content License: commercial use, no credit needed). The list is reels/music-shelf.json (committed: title,
// artist, page, licence, length, where the sound starts, a level correction to the house level); the MP3s are in
// remotion/public/music-shelf/ (git-ignored; re-download from each page). A reel's music spec names one:
//
//   remotion/music/<reel>.json   { "duration": 30, "music": { "track": "patriotic-india", "from": 12 } }
//
// and reels/tools/music.mjs cuts it (from → from + duration), corrects its level and fades its edges, instead of
// rendering engine.js music. These are the pure rules; music.mjs runs ffmpeg.
const fs = require("node:fs");
const path = require("node:path");

const LIST = path.join(__dirname, "..", "music-shelf.json");
const DIR = path.join(__dirname, "..", "..", "remotion", "public", "music-shelf");

const load = () => JSON.parse(fs.readFileSync(LIST, "utf8"));
const fileOf = (id) => path.join(DIR, `${id}.mp3`);

function find(shelf, id) {
  const t = shelf.find((x) => x.id === id);
  if (!t) throw new Error(`"${id}" is not on the shelf: ${shelf.map((x) => x.id).join(", ")}`);
  return t;
}

/** Where to cut a track for a reel: from its sound's start (or the spec's `from`), for the reel's length, faded at the
 *  edges: a short fade-in only when the cut lands mid-track (from 0 the track's own attack stays), a 1.5 s fade-out. */
function cutPlan(track, { duration, from }) {
  if (!(duration > 0)) throw new Error("the reel's duration must be over 0");
  const start = from ?? track.start;
  if (start + duration > track.seconds) throw new Error(`${track.id}: ${start} s + ${duration} s runs past the end (${track.seconds} s); start earlier or pick a longer track`);
  return { from: start, duration, gainDb: track.gainDb, fadeIn: start > 0 ? 0.05 : 0, fadeOut: Math.min(1.5, duration / 4) };
}

/** Linear fades on interleaved stereo 16-bit samples, in place (this ffmpeg build has no afade). */
function applyFades(pcm, rate, { fadeIn, fadeOut }) {
  const frames = pcm.length / 2, fi = Math.round(fadeIn * rate), fo = Math.round(fadeOut * rate);
  for (let f = 0; f < frames; f++) {
    let g = 1;
    if (f < fi) g = f / fi;
    if (f >= frames - fo) g = Math.min(g, (frames - 1 - f) / fo);
    if (g < 1) { pcm[2 * f] = Math.round(pcm[2 * f] * g); pcm[2 * f + 1] = Math.round(pcm[2 * f + 1] * g); }
  }
  return pcm;
}

module.exports = { load, find, fileOf, cutPlan, applyFades, DIR };
