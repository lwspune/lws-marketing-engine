# @pyqvault_ · Physics, visualised #8: a flame in a spoon is upside down. Bring it close: now it's…?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 12 · **Topic:** remake-backlog **P24**, topic score **7/10**
(F21), the first of the Ray Optics run (P19–P29) · **Proven idea:** @bisal.physics' concave-mirror image, 89k views
(10.5× their typical reel), https://www.instagram.com/reel/DeZOe3Sy5Fb/ · **Framework v1.11** · **Background:** white
(L22: physics alternates, P7 was dark) · **Music:** `trap` (L34: the style with the fewest reels), hit on the answer ·
**Orbit:** the first full 360° opening orbit (F22 v1.8) · **Caption:** the first without the answer (F6, L45) ·
**Voice:** Kokoro `af_heart` (F23; a silent render alongside) · **Length:** 20.4 s · **Made in Remotion**
(`remotion/src/PvPhysics008.tsx`, optics + timing + sound `src/lib/pp008.ts`, tests `tests/pp008.test.ts`).

## The physics (checked, and tested)

- A spoon's bowl is a concave mirror. World units with f = 1, R = 2f; the mirror formula 1/v + 1/u = 1/f and
  m = −v/u (real-is-positive), re-derived in the tests at u = 2.5f (v = 5f/3, m = −2/3), u = 2f (m = −1, at C) and
  u = 0.6f (v = −1.5f, m = +2.5: behind the spoon, upright, bigger). Answer **B upright**.
- At F (u = f) the reflected rays leave parallel: no image, so "C vanishes" is true only at that one spot, and the reel
  shows it ("At F the rays never meet"). The answer is where the candle ends up, inside F.
- Six rays from the flame's tip: they land on the curved bowl and head for the image (the textbook's paraxial drawing).
  Tests: every reflected ray lines up with the image exactly; the pole ray reflects at equal angles; the parallel ray
  passes F to within 0.07f (the bowl's depth at that height); at F all six leave parallel.
- The image fades out where it would leave the frame (|m| > 3, or v > 3.4f), never drawn somewhere wrong.

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–2.8 s | question + A/B/C; the camera goes once round the spoon and the candle (flame flickering), ending at the front | **PHYSICS, VISUALISED #8 · In a spoon, a flame looks upside down. Bring it close. Now it's…** A upside down · B upright · C vanishes |
| 3.0–3.9 s | six rays draw from the flame to the bowl and on; light dots run along them; F and C appear | |
| 3.9–7.8 s | a small upside-down candle where the rays meet; the candle slides in, the image grows and runs off; the graph draws (below the line = upside down) | *Far: upside down and small* · *Closer: bigger, still flipped* |
| 7.8–8.8 s | the candle holds at F; the rays leave parallel | *At F the rays never meet* |
| 9.6 s | candle inside F: an upright ×2.5 candle behind the spoon, dashed lines tracing back to it; punch-in; **B upright** lights; the graph jumps above the line | *Inside F: upright and bigger!* |
| 12.4–18 s | an eye in the reflected light; the dashed lines brighten | *Your eye traces the rays back* · *That's how make-up mirrors magnify* |
| 18–20.4 s | end card | Far: upside down. Inside F: upright. **A spoon is a concave mirror** · Follow for #9 · **pyqvault.com** |

## Camera (F9, F22) and sound (F14–F16)

- The 360° orbit from frame 0 (no whoosh), back at the front at 2.8 s → slow push while the candle slides →
  **punch-in landing on the answer** (whoosh) → quick zoom out (whoosh) → slow push for the eye.
- The candle holder's soft scrape while it slides (as loud as its speed), a thunk where it stops (at F, and inside F).
  Light makes no sound, so the rays are silent.
- Both renders pass `check-video` (1080×1920, stereo, peak ≤ −3 dB, loudness in range).

## Files

`pv-physics-008-spoon-voice.mp4` (voiced, in the manifest) and `pv-physics-008-spoon.mp4` (silent) · cover
`pv-physics-008-spoon-cover.png` (4.3 s, before the answer: "Guess before you watch") · `pv-physics-008-spoon.post.json`
· strip `pv-physics-008-strip.png`. Re-make: `cd remotion && npm run music:pp008 && npm run voice:pp008 && npm run
mix:pp008 && npm run render:pp008 && npm run render:pp008v && npm run cover:pp008`.

## The vivid remake (framework F24, 2026-10-21)

Founder: "more vivid colour objects", then "remake this physics reel with this new rule, I want to compare". Same timeline,
sound and voice; only the objects' colours change (`<PvPhysics008 vivid />`, colours from the white board's `VIVID` set):
a cyan spoon, a red candle on a violet holder, an orange flame, six rays each in its own colour (blue = parallel ray,
pink = pole ray, then red, green, orange, violet), their light dots and dashed trace-backs in the same colours, violet F
and C marks, and a red (upside down) → green (upright) graph. Text keeps the WHITE palette.

`pv-physics-008-spoon-vivid-voice.mp4` (passes `check-video`) · cover `pv-physics-008-spoon-vivid-cover.png` · strip
`pv-physics-008-vivid-strip.png` · side by side: `pv-physics-008-compare.mp4` (first left, vivid right, the vivid one's
sound; `npm run compare:pp008`). Re-make: `npm run render:pp008vivid && npm run cover:pp008vivid`.
**Founder's pick (2026-10-21):** "original spoon colour was better, rest vivid is better". The vivid look now keeps the
steel spoon (framework F24 v1.13: known materials keep their look); the manifest points to the vivid files and the queued
GoPost post was replaced (`queue:add --replace`, still Ready). `pv-physics-008-compare.mp4` shows the cyan-spoon draft.
