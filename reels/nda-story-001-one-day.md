# @lws.pune · Story #1, ONE DAY: a student at Sudan Block's gate; the sunrise turns his shadow into a cadet's

**Handle:** @lws.pune (project `pyq-vault`, post slug `nda-story-001-one-day`) · **Series:** defence stories #1 (the first
reel that isn't a maths concept: lessons L8, L74) · **Storyboard:** [nda-story-001-one-day.storyboard.md](nda-story-001-one-day.storyboard.md),
reviewed by an independent agent before any code (F31; 5 blockers fixed, 3 improvements taken) · **Founder's brief
(2026-10-27):** a student looking at Sudan Block, title "One day", music in the mood of the film song "Lakshya" but our
own, made in code, and no "LWS Pune · NDA coaching" line · **Look:** real 3D at dawn: indigo → gold sky, the red dome
and red path, a gold sun with rays · **Music:** `anthem` (new: a marching snare, toms, brass, a choir pad; D–Bm–G–A, our
own melody, nothing copied) · **Length:** 12.0 s · **Made in Remotion 3D** (`remotion/src/Story001.tsx`; the place, the
sun, the shadow, the camera, words and sound in `src/lib/story001.ts`; tests in `tests/story001.test.ts`).

## What's true (checked, and tested)

- Sudan Block is our own model from public photos and NDA's own figure (about 132 ft = 40 m to the top): a long basalt
  block with red bands, a taller central bay, a drum, a red ribbed dome with a finial. No photo, no crest.
- The sun rises straight behind the dome and clears its top, as seen from his feet, at 4.8 s. At that moment the dome's
  shadow ends exactly at his feet, so the light reaches him on the beat (tested). Then it climbs to 32°, faster than in
  life, so his shadow is never stretched past reading (under 2× his height, tested).
- Which way the real building faces isn't claimed: the caption never says "sunrise at NDA".
- Nothing is said about any real person or cadet.

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | pre-dawn, the orbit already moving, windows lit, gold behind the dome | **ONE DAY** |
| 0–2.4 s | one 360° turn round Sudan Block, easing onto the front | |
| 2.4–4.0 s | the camera glides down the red path and lands behind the student at the closed iron gate | *Today: outside the gate.* (2.95–4.8) |
| 4.0–4.8 s | slow push; he lifts his head; the dome's rim glows | |
| 4.8 s | the sun clears the dome: a flare, sunlight on him, his shadow appears | |
| 4.9–6.25 s | the camera rises and turns until it looks straight down on him | |
| 6.1–7.2 s | his shadow changes: the bag fades, a peaked cap, a rifle at the slope. He doesn't move | |
| 7.2–7.8 s | the cadet shadow held | |
| 7.8–9.9 s | the camera drops back behind him; the gate swings open; he walks through in 3 steps | *One day: inside.* (8.4–10.3) |
| 9.9–12.0 s | the camera rises up the path to the sunlit dome | **Which year is yours? 👇** (10.3) · **ONE DAY** (10.7) |

**Cover:** 7.5 s, the finished cadet shadow from above, "ONE DAY" under his feet (both pass-1 critics: the strongest
image; the student and the gate are in it, the twist is the hook).

## Sound (F14–F16)

Dawn wind and birds from frame 0, fading once the sun is up; a whoosh as the camera lands and as it cranes; a boom as the
sun clears the dome (on the music's downbeat); a shimmer under the shadow change; the gate's iron clang and its thunk as
it stops; a footstep per step. The music rests (no drums) during the landing and rolls into the 4.8 and 7.2 hits. Peak
−3.3 dB; music −23.5 dB RMS, effects −24.3 dB RMS (the effects sit closer to the music than F16's 5–10 dB, on purpose:
here the boom and the clang are the story; the founder judged the finished reel).

## Review panel (F38)

Pass 1 on the stills (Drama 4, Colour 4, Motion 5): every must-fix done (row in `review-panel.md`). Pass 2 not run: the
founder watched the pass-1-fixed MP4 and judged it "looks good" (2026-10-27).

Declined:
- Cutting or shortening the opening orbit: F22 (the orbit is the hook that names the place in the first second).
- The student in the final frame: the dome, the title and the question fill it; he has just walked out of the shot.
- A seamless loop: frame 0 is pre-dawn and the end is sunlit, so a loop would jump in light anyway.
- "The cadet shadow vanishes at 8.4 s" (Motion): checked at full size, the cap and rifle are there as the camera turns.

## Files

- `nda-story-001-one-day.mp4` · `nda-story-001-one-day-cover.png` · `nda-story-001-one-day.post.json`
- Re-make: `cd remotion && npm test && npm run music:s001 && npm run mix:s001 && npm run render:s001 && npm run cover:s001`

## Before you post (founder)

- [ ] Watch it once on the phone: the cadet's cap and rifle read in the shadow
- [ ] Cover chosen in the upload screen
- [ ] Reply to the year comments in the first hour (the caption asks for them)
