# @pyqvault_ · Physics, visualised #17: every force on a crate on a slope

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11 · **Topic:** idea **P7** (its card said "tilt the rope",
written from the caption alone; the study copy showed the real reel, below) · **Framework v1.36, F40** (proven ideas only,
≥ 100k views) · **A one-off repeat** of Physics #4's topic (forces on a slope), founder 2026-10-31: the proof outweighs F21's
no-repeat rule · **Hook / opening:** copied (the whole scene from frame 0, no guess, as theirs) · **Loop:** yes, the
last 0.55 s brings back frame 0's arrows and names (F27; theirs ends on its last line) · **Look:** the soft studio (F36),
four characters of our own · **Music:** `lofi`, made in code, one hit on the split (4.3 s) · **Voice:** none (theirs
speaks one line; ours puts our own line on screen) · **Length:** 10.6 s (theirs 10.15 s) · **Made in Remotion**
(`remotion/src/PvForces.tsx`; timeline, maths and every text's place in `src/lib/pvForces.ts`; tests in
`tests/pvForces.test.ts`; `npm run music:pvForces`, `mix:pvForces`, `render:pvForces`, `cover:pvForces`).

## Proven idea

@sciencevisualised, "Acting Forces on Object" ([reel](https://www.instagram.com/reel/Dc9MzBgKwJS/)): **1.45M views,
83× their typical reel**. Study copy `study/reels/Dc9MzBgKwJS.mp4` (git-ignored, never posted), 10.15 s, 24 fps, read
every 0.25 s. Their shot list, and ours at the same times:

| Time | Theirs | Ours |
|---|---|---|
| 0 s | the whole scene: a crate on a slope, four clay characters (one pulls it up, one drags it down, one holds it from above, one hangs under it), four arrows from the crate, each force named | the same, our characters, our names: Applied force F · Friction f · Normal N · Weight mg |
| 0.3–3.0 s | a title pill "Acting Forces on Object"; the characters tug | "Every force on the crate" |
| 1.8 s | "up along the inclined plane" beside F | "up the slope"; a hard tug (thunk) |
| 3.0 s | names shrink to symbols; F, f and N's arrows go, mg stays | the same |
| 4.3 s | mg splits into mg sin θ and mg cos θ, a 90° mark, dashed guides | the same (snap) |
| 6.3 s | N's arrow grows, "N = mg cos θ" | the same (snap) |
| 7.5–8.2 s | four equations stack at the top | the same four, one tap each |
| 9.0 s | the arrows clear | the same |
| 9.3 s | "Remember this." (spoken) | "Save this for your exam." (on screen) |
| 10.0–10.6 s | (ends) | the words go, the four arrows and names come back: frame 0 |

Never theirs: their video, frames, characters, wording, voice or music.

## The physics (checked, and tested)

- Weight mg points straight down. On a slope of angle θ it splits into **mg sin θ down the slope** and **mg cos θ into
  the slope**, at 90°, adding back to mg.
- Nothing moves off the slope, so **N − mg cos θ = 0: N = mg cos θ**.
- The crate is pulled up the slope by F, so kinetic friction acts down it: **f = μN**.
- Along the slope: **F − f − mg sin θ = ma**. The arrows are drawn with F longer than f + mg sin θ, so a > 0.
- The ropes run along the slope, as F and f do (tested). θ = 35° in the picture; the equations hold for any θ.

## Colours

Force colours are told apart for colour-blind viewers (`distinguishable`): theirs pair a red friction with a grass-green
weight, too close for red-green colour blindness, so ours are red and emerald. Every text colour is ≥ 4.5:1 on the set.

## Checks

`npm test` (pvForces: the maths, beats within 0.6 s of theirs, the loop, layout on every frame, colours, sound) ·
`node reels/tools/check-video.mjs reels/pv-physics-017-forces.mp4 …`: 1080×1920, stereo, peak −3.2 dB, body −21.7 dB RMS
(four PASS) · side-by-side sheets (theirs vs ours at 0, 2, 5.5, 8.6, 9.67 and 10 s) read before queuing.
