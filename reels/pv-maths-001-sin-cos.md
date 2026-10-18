# @pyqvault_ · Maths, visualised #1 — where do the sin and cos waves come from?

**Handle:** @pyqvault_ (publisher project `pyqvault-insta`) · **Audience:** Class 11 (CBSE / State boards, JEE, MHT-CET)
· **Theme:** white (L22 rotation) · **Made in Remotion** (`remotion/src/PvMaths001.tsx`, geometry + timing
`src/lib/pm001.ts`, tests `tests/pm001.test.ts`) · **Music:** `drive`, impacts at 4.6 s (the turn starts), 16.0 s (the cos
wave turns), 20.6 s (it lands on the sine wave) · **Length:** 29 s · goes out in the next free slot.
**Proven idea:** @codematrixvishal "Trigonometry in Motion", 3.10M views (113× their typical reel),
https://www.instagram.com/reel/DbKeNVpps4y/ (remake-backlog M1). Ours adds the *why*: the cosine wave is turned and slid
90° onto the sine wave, where it lands exactly.

## The maths (checked, and tested)

- Point on a circle of radius r at angle θ: height r·sin θ, width r·cos θ (tests check both on every sample).
- The sine pen moves level with the point; the cosine pen moves straight below it (tests).
- The payoff is a rigid move of the cosine graph: turned −90° about its origin onto the sine axes, then slid right by
  90°. Every point of the slid curve inside 0–360° lies exactly on y = sin θ (test, to 10⁻⁶ px): cos(θ − 90°) = sin θ,
  i.e. cos θ = sin(θ + 90°). The tail that slides past 360° is drawn dashed.

## What's on screen

| Time | Picture | Text (in frame) |
|---|---|---|
| 0–2.6 s | title still on a card, a light circling its edge | **MATHS, VISUALISED #1 · Where do the sin and cos waves come from?** |
| 3–4.6 s | the circle draws; the point waits at 0° | *One point, going round* |
| 4.6–15 s | one full turn: green height → sine wave to the right; blue width → cosine wave downwards; dashed guides to both pens | live: θ · sin θ · cos θ · *Its height draws sin θ* · *Its width draws cos θ* |
| 16–18.2 s | the cosine wave turns onto the sine axes | *Turn the cos wave…* |
| 18.6–20.6 s | it slides 90° right (amber "90°" between the peaks) and lands on the sine wave, which glows | *…slide it 90° right* |
| 21–25.6 s | | **cos θ = sin(θ + 90°)** · *cos is sin, a quarter turn early* |
| 25.6–29 s | end card | One circle, two waves. **That's the maths.** Follow for #2 · **pyqvault.com** |

## Files

- `pv-maths-001-sin-cos.mp4` (1080×1920, 30 fps) · `pv-maths-001-sin-cos-cover.png` · `pv-maths-001-strip.png`
- Re-make: `cd remotion && npm test && npm run music:pm001 && npm run render:pm001 && npm run cover:pm001`
