# @pyqvault_ · Physics, visualised #3 — where does a swinging pendulum's energy go?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11 · **Theme:** **lab** (L22 rotation: P3 lab) · **Made in
Remotion** (`remotion/src/PvPhysics003.tsx`, physics + timing `src/lib/pp003.ts`, tests `tests/pp003.test.ts`), a real
three.js pendulum · **Music:** `synthwave`, impacts at 4.0 s (release) and 16.6 s (air on) · **Length:** 31 s.
**Proven idea:** @sciencevisualised "energy trades places", 2.60M views (150× their typical reel),
https://www.instagram.com/reel/DcbO-NOMudT/ (remake-backlog P3). Ours adds the *why it stops*: air resistance, shown as a
growing heat band.

## The physics (checked, and tested)

- 1 kg bob, 1.2 m string, let go from rest at 50°: E₀ = mgL(1 − cos 50°) = 4.20 J (test).
- The full pendulum equation θ'' = −(g/L) sin θ (not the small-angle shortcut), integrated with RK4 at 2400 steps/s.
  Without air, PE + KE stays 4.20 J to within 0.0003% (test: within 0.2%); at the ends it's all PE, at the bottom
  all KE (tests: each reaches > 99% of E₀).
- From 16.6 s a simple drag (−0.15·ω) is added: the total only ever falls (test), the lost part is shown as heat
  (PE + KE + heat = 4.20 J), and about 20% is left at 27.4 s.

## What's on screen

| Time | Picture | Text (in frame) |
|---|---|---|
| 0–2.6 s | title still on a dark card, a green light circling its edge | **PHYSICS, VISUALISED #3 · Where does a swinging pendulum's energy go?** |
| 3–4 s | the pendulum held at 50°; bars: height 4.2, speed 0, heat 0 | *Lift it: it stores energy* |
| 4–16.6 s | it swings (blue height marker, green speed arrow); bars trade; stacked chart of KE + PE always reaches the 4.20 J line | *Top: all height. Bottom: all speed* · *The total never changes* |
| 16.6–27.4 s | air on: the swing shrinks, the orange heat band grows on top of the chart and in its bar | *Now add air…* · *each swing loses a little as heat* |
| 27.4–31 s | end card | Height ⇄ speed, then heat. **That's the physics.** Follow for #4 · **pyqvault.com** |

## Files

- `pv-physics-003-pendulum.mp4` · `pv-physics-003-pendulum-cover.png` · `pv-physics-003-strip.png`
- Re-make: `cd remotion && npm test && npm run music:pp003 && npm run render:pp003 && npm run cover:pp003`
