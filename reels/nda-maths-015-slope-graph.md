# @lws.pune · 015: at the top of the hill, the slope graph is…? (f and f′ together)

**Handle:** @lws.pune (project `pyq-vault`) · **Moved from @pyqvault_** (founder, 2026-10-20: "better for LWS Pune"; it was
made as Maths, visualised #3 and never posted there) · **Kind:** an **NDA maths concept** reel (founder, 2026-10-20: focus on
NDA maths concepts for @lws.pune, real PYQs not too strict) · **NDA link:** the idea is NDA 2024 (I) Q91 statement (A),
"a local maximum means f′ = 0" (answer (a) A only, re-derived: Fermat; (B) f″ < 0 can fail, e.g. −x⁴), named in the
caption, not on screen · **Proven idea:** @codematrixvishal "f and f′", 651k (24×) and 3.14M (115×) · Made with the
@pyqvault_ framework v1.4 (flat 2D, zooms on the graphs) · **Look:** white board · **Music:** `cinematic`, hits on both
zeros · **Length:** 21.0 s · **End card:** @lws.pune style (no link, "Follow for more") · **Made in Remotion**
(`remotion/src/Reel015.tsx`, maths + timing + camera + sound `src/lib/reel015.ts`, tests `tests/reel015.test.ts`).

## The maths (checked, and tested)

- f(x) = x³ − 3x, f′(x) = 3x² − 3 (test: f′ matches f's numerical slope). Peak at x = −1, valley at x = 1, f′ = 0 at
  both (tests) → **B zero**.
- The tangent point moves from x = −2 to 2: to the peak (0–4.4 s), a beat, to the valley (5.4–9.4 s), a beat, to the
  end (10.2–12.4 s). Moving on every frame of the first 3 s (test).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | both graphs already drawn faintly; the tangent slides; f′ draws itself below, green above zero, amber below | **NDA MATHS · DERIVATIVES · At the top of the hill, the slope graph is…?** A highest · B zero · C lowest |
| 4.4 s | punch-in on the peak: flat tangent, f′ = 0 glows · **B zero** lights | *At the top: slope = 0* |
| 5.4–9.4 s | down the hill: slope negative, amber | *Going down: f′ below zero* |
| 9.4 s | punch-in on the valley: f′ = 0 again | *At the bottom: zero again* |
| 12.4–17.6 s | | *Peaks and valleys: f′ = 0* |
| 17.6–21 s | end card | Every peak and valley: **the slope is 0.** Follow for more |

## Camera (F9) and sound (F14–F16)

- Slow push in from frame 0 → **punch-in on the peak landing on the answer** (whoosh) → zoom out (whoosh) → punch-in on
  the valley (whoosh) → zoom out (whoosh) → gentle push in.
- A soft tick each time the tangent passes a gridline, its pitch following the slope there (steeper up = higher, tested);
  a knock at each zero, on the music's hits. Mix: peak −4.1 dB.

## Files

- `nda-maths-015-slope-graph.mp4` · `nda-maths-015-slope-graph-cover.png` (2.0 s, still climbing) · `nda-maths-015-strip.png`
- Re-make: `cd remotion && npm test && npm run music:015 && npm run mix:015 && npm run render:015 && npm run cover:015`
