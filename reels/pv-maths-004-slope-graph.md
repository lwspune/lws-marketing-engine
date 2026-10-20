# @pyqvault_ · Maths, visualised #3: at the top of the hill, the slope graph is…?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11–12 · **Topic:** remake-backlog **M4**, topic score
**7/10** (F21) · **Proven idea:** @codematrixvishal "f and f′", 651k (24×) and 3.14M (115×) · **Framework v1.4** (flat 2D:
zooms on the graphs, no orbit) · **Background:** white (L22) · **Music:** `cinematic` (L34 rotation), hits on both zeros
· **Length:** 21.0 s · **Series number:** #3 (the earlier Maths #3, the e reel, was rejected and never posted) · **Made in
Remotion** (`remotion/src/PvMaths004.tsx`, maths + timing + camera + sound `src/lib/pm004.ts`, tests `tests/pm004.test.ts`).

## The maths (checked, and tested)

- f(x) = x³ − 3x, f′(x) = 3x² − 3 (test: f′ matches f's numerical slope). Peak at x = −1, valley at x = 1, f′ = 0 at
  both (tests) → **B zero**.
- The tangent point moves from x = −2 to 2: to the peak (0–4.4 s), a beat, to the valley (5.4–9.4 s), a beat, to the
  end (10.2–12.4 s). Moving on every frame of the first 3 s (test).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | both graphs already drawn faintly; the tangent slides; f′ draws itself below, green above zero, amber below | **MATHS, VISUALISED #3 · At the top of the hill, the slope graph is…?** A highest · B zero · C lowest |
| 4.4 s | punch-in on the peak: flat tangent, f′ = 0 glows · **B zero** lights | *At the top: slope = 0* |
| 5.4–9.4 s | down the hill: slope negative, amber | *Going down: f′ below zero* |
| 9.4 s | punch-in on the valley: f′ = 0 again | *At the bottom: zero again* |
| 12.4–17.6 s | | *Peaks and valleys: f′ = 0* |
| 17.6–21 s | end card | Every peak and valley: f′ = 0. **That's the maths.** Follow for #4 · **pyqvault.com** |

## Camera (F9) and sound (F14–F16)

- Slow push in from frame 0 → **punch-in on the peak landing on the answer** (whoosh) → zoom out (whoosh) → punch-in on
  the valley (whoosh) → zoom out (whoosh) → gentle push in.
- A soft tick each time the tangent passes a gridline, its pitch following the slope there (steeper up = higher, tested);
  a knock at each zero, on the music's hits. Mix: peak −4.1 dB.

## Files

- `pv-maths-004-slope-graph.mp4` · `pv-maths-004-slope-graph-cover.png` (2.0 s, still climbing) · `pv-maths-004-strip.png`
- Re-make: `cd remotion && npm test && npm run music:pm004 && npm run mix:pm004 && npm run render:pm004 && npm run cover:pm004`
