# @pyqvault_ · Physics, visualised #16: your TV remote talks to the TV with radio, infrared or sound?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 12 · **Topic:** idea **P74** ("One spectrum", score 62/100;
the second F39 share test, 2026-10-26) · **Hook:** Everyday puzzle (the remote in your hand) · **Opening:** close on a TV
remote on the dark set; its button goes down and a burst of drawn light leaves the LED at 0.2 s, a second press at 1.2 s,
then it flies up as the camera pulls back (2.2–3.0 s) · **Second hook:** none · **Loop:** yes, a rewind to frame 0 (F27) ·
**F39 (made to send), test 2 of 3:** the payoff is the whole electromagnetic spectrum, seven bands with their uses and
NCERT's wavelength ranges, held still for 1.85 s as a cheat sheet; the caption lists the table with infrared's use as "?"
and asks to send it to a physics group; a "try it" trick (a phone camera sees the remote's flash) · **Framework v1.34** ·
**Look:** full frame (F35) on the dark set (as Chemistry #11 and #12) · **Music:** `synthwave` (electronics), hits on the
answer (7.0 s) and the cheat sheet (11.8 s), dipped under the presses and the answer · **Voice:** none · **Length:** 15.25 s
· **Made in Remotion** (`remotion/src/PvPhysics016.tsx`; timeline, physics and every text's place in `src/lib/pp016.ts`;
tests in `tests/pp016.test.ts`).

## The physics (checked, and tested)

- NCERT Class 12, Electromagnetic Waves, Table 8.1: radio > 0.1 m · microwave 0.1 m – 1 mm · infrared 1 mm – 700 nm ·
  visible 700 – 400 nm · ultraviolet 400 nm – 1 nm · X-rays 1 nm – 10⁻³ nm · gamma < 10⁻³ nm. One kind of wave, shorter
  down the list, each photon carrying more energy. Uses as NCERT gives them (radio and TV; radar and ovens; remote
  switches; vision; sterilising; medical diagnosis; destroying cancer cells).
- TV remotes use infrared (an LED near 940 nm). The answer is **B infrared**. Sound isn't on the list: it isn't light.
- Many phone cameras show a remote's flash as a faint violet-white light (their sensors see a little past red); some rear
  cameras filter it out, so the reel says "many".
- The drawn waves only keep the order: the real wavelengths span a factor of about 10¹⁵ (said in the caption). Infrared is
  invisible: the burst and the remote's wave are drawn.

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–0.2 s | dark set, close on a TV remote, buttons up; the big red button going down | **PHYSICS, VISUALISED #16 · Your TV remote talks to the TV with…** A radio · B infrared · C sound · tag |
| 0.2 s | the LED fires: red rings spread and a wave leaves it (click, snap, shimmer) | |
| 1.2 s | a second press, a second burst | |
| 2.2–3.0 s | the remote flies up to the right as the camera pulls back (whoosh) | |
| 3.0 s | | the question shrinks: "Remote: radio, infrared or sound?" |
| 3.35–6.15 s | the ladder builds, one row every 0.4 s (taps rising): radio tower, oven, an empty slot, prism, sun, X-ray film, nucleus, each with its wave, shorter row by row | each row's name, use and range; infrared's use "?" · One kind of wave, squeezed tighter |
| 3.4–6.3 s | the remote hovers between radio and microwave, its own wave flickering (the cover, 6.28 s) | ? |
| 6.3–7.0 s | it tries radio's row, then microwave's: its wave doesn't match (a shudder and a clang each) | |
| 7.0 s | it docks in infrared's slot, the waves lock (thunk, music hit); a modest punch-in | infrared: **TV remotes**; **B infrared** lights at 7.5 s |
| 7.8–9.4 s | close: a phone slides in beside the remote; on its screen the LED glows violet-white | Many phone cameras can see it |
| 9.4–10.0 s | out to the whole ladder | |
| 10.1–11.4 s | a bright pulse runs down the waves, top to bottom (taps rising) | Shorter wave, more energy |
| 11.8–13.65 s | **the cheat sheet**, everything still (music hit at 11.8) | The EM spectrum: radio to gamma · every band's name, use and range |
| 13.65–15.25 s | the rewind (shimmer): rows fold away, the remote flies back to the close-up: the last frame is frame 0 | the question returns |

## Review panel (F38)

See `reels/review-panel.md` → Log.

## Files

- `pv-physics-016-spectrum.mp4` · `pv-physics-016-spectrum-cover.png` (6.28 s: the whole ladder built, the remote hovering with its "?")
- Re-make: `cd remotion && npm test && npm run music:pp016 && npm run mix:pp016 && npm run render:pp016 && npm run cover:pp016`
