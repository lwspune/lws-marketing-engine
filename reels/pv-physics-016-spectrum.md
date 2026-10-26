# @pyqvault_ · Physics, visualised #16: your TV remote talks to the TV with radio, infrared or sound?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 12 · **Topic:** idea **P74** ("One spectrum", score 62/100;
the second F39 share test, 2026-10-26) · **Hook:** Everyday puzzle (the remote in your hand) · **Opening:** close on a TV
remote on the dark set, a lit TV behind it; a press and a burst of drawn coral light every 0.6 s from 0.1 s, the TV
changing channel each time, then it flies up as the camera pulls back (2.2–2.8 s) and the ladder builds bottom-up · **Second hook:** none · **Loop:** yes, a rewind to frame 0 (F27) ·
**F39 (made to send), test 2 of 3:** the payoff is the whole electromagnetic spectrum, seven bands with their uses and
NCERT's wavelength ranges, held still for 1.85 s as a cheat sheet; the caption lists the table with infrared's use as "?"
and asks to send it to a physics group; a "try it" trick (a phone camera sees the remote's flash) · **Framework v1.34** ·
**Look:** full frame (F35) on the dark set (as Chemistry #11 and #12) · **Music:** `synthwave` (electronics), hits on the
answer (7.0 s) and the cheat sheet (11.8 s), dipped under the presses and the answer · **Voice:** none · **Length:** 15.25 s (seamless music: `music.seamless`, no fade at the loop seam)
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
| 0–0.1 s | dark set, close on a TV remote (number pad, coloured buttons, an IR window), tipped to the camera; a lit TV behind it | **PHYSICS, VISUALISED #16 · Your TV remote talks to the TV with…** A radio · B infrared · C sound · tag |
| 0.1 s | the LED fires: bright coral rings and a wave fly out (click, snap); the TV changes channel (tap) | |
| 0.7, 1.3, 1.9 s | more presses, flicking channels: a burst and a new channel each; the remote turning slowly | |
| 2.2–2.8 s | the remote flies up to the right as the camera pulls back (whoosh); the TV fades | |
| 2.5 s | | the question shrinks: "Remote: radio, infrared or sound?" |
| 2.6–5.4 s | the ladder builds bottom-up, one row every 0.4 s (taps): gamma's nucleus, the X-ray film, the sun, a prism, infrared's empty slot, an oven, a radio tower, each with its wave, shorter row by row | each row's name, use and range; infrared's use "?" · One kind of wave, squeezed tighter |
| 3.4–6.3 s | the remote hovers between radio and microwave, its own coral wave running out of its LED | ? |
| 6.3–7.0 s | it tries radio's row, then microwave's: its wave flashes red, it bounces back (a clang each) | |
| 7.0 s | it docks hard in infrared's slot (overshoot, settle); the row glows, the others dim (thunk, music hit); a gentle push | infrared: **TV remotes**; **B infrared** lights at 7.5 s |
| 7.8–9.4 s | close (whoosh): a phone slides in beside the remote; on its lit camera screen the LED glows violet-white (snap, shimmer) | Many phone cameras can see it |
| 9.4–10.0 s | out to the whole ladder | |
| 10.25–11.8 s | a pulse runs down the waves, whitening and growing as it goes (taps rising) | Shorter wave, more energy |
| 11.8–13.65 s | **the cheat sheet**, everything still (music hit at 11.8) | The EM spectrum: radio to gamma · every band's name, use and range |
| 13.65–15.25 s | the rewind (shimmer): rows fold away, the remote flies back to the close-up: the last frame is frame 0 | the question returns |

## Review panel (F38)

See `reels/review-panel.md` → Log.

## Files

- `pv-physics-016-spectrum.mp4` · `pv-physics-016-spectrum-cover.png` (6.28 s: the whole ladder built, the remote hovering with its "?")
- Re-make: `cd remotion && npm test && npm run music:pp016 && npm run mix:pp016 && npm run render:pp016 && npm run cover:pp016`
