# @pyqvault_ · Maths, visualised #2 — all of calculus in one curve

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11–12 · **Theme:** **lab** (L22 rotation: M2 lab) · **Made in
Remotion** (`remotion/src/PvMaths002.tsx`, maths + timing `src/lib/pm002.ts`, tests `tests/pm002.test.ts`) · **Music:**
`cinematic`, impacts at 4.2 s (limit), 10.4 s (derivative), 17.0 s (integral) · **Length:** 30 s.
**Proven idea:** @ubilumapp "Calculus I in 60 seconds", 599k views (55× their typical reel),
https://www.instagram.com/reel/DcwfuB6Omyy/ (remake-backlog M2). Ours shows each idea live on one curve, with numbers.

## The maths (checked, and tested)

- f(x) = 0.6 + 0.12x² + 0.15 sin 2x on 0 ≤ x ≤ 3; f′(x) = 0.24x + 0.3 cos 2x (test: matches a numerical derivative).
- Limit: a magnifier on x = 2.2 zooms ×1 → ×64; the biggest gap between curve and tangent inside it shrinks at every
  step and is under 2 px at ×64 (test).
- Derivative: secant from 2.2 to 2.2 + h, h 0.8 → 0.004; its slope gets closer to f′(2.2) = 0.436 every step (test).
- Integral: midpoint strips 4 → 8 → 16 → 64; each is closer to the exact ∫₀³ f dx = 1.8 + 1.08 + 0.075(1 − cos 6)
  = 2.883 (test; 64 strips within 1%).

## What's on screen

| Time | Picture | Text (in frame) |
|---|---|---|
| 0–2.6 s | title still on a dark card, a green light circling its edge | **MATHS, VISUALISED #2 · All of calculus in one curve** |
| 3–4.2 s | the curve draws itself | *One curve. Three big ideas.* |
| 4.2–9.8 s | a magnifier on x = 2.2 zooms ×1 → ×64; the curve inside straightens onto its (dashed) tangent | zoom ×N · *Zoom in: it looks straight (limit)* |
| 10.4–16.4 s | an orange secant through 2.2 and 2.2 + h swings onto the tangent | slope 0.745 → 0.436 (h shown) → f′(2.2) = 0.436 · *Its slope at that point (derivative)* |
| 17–23.6 s | green strips under the curve: 4 → 8 → 16 → 64 | N strips: 2.879… → exact area 2.883 · *Add thinner strips: the area (integral)* |
| 23.8–26.8 s | | *One idea: zoom in. That's calculus.* |
| 26.8–30 s | end card | Limit, slope, area. **That's the maths.** Follow for #3 · **pyqvault.com** |

## Files

- `pv-maths-002-calculus.mp4` · `pv-maths-002-calculus-cover.png` · `pv-maths-002-strip.png`
- Re-make: `cd remotion && npm test && npm run music:pm002 && npm run render:pm002 && npm run cover:pm002`
