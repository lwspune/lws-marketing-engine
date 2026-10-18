# @pyqvault_ · Physics, visualised #2 — why does squeezing a gas raise its pressure?

**Handle:** @pyqvault_ (publisher project `pyqvault-insta`) · **Audience:** Class 11 (CBSE / State boards, JEE,
NEET, MHT-CET) · **Theme:** **white** (background A/B test, L22: P1 lab, C1 white, P2 white) · **Made in Remotion**
(`remotion/src/PvPhysics002.tsx`, timeline `src/lib/pv002.ts`, tests `tests/pv002.test.ts`): a real three.js glass
cylinder, every frame rendered exactly · **Music:** "lofi" · **Length:** 30 s · approve at about **11:00 IST**
Follows the @pyqvault_ house settings (`pyqvault-insta.md`): no exam question on screen, short labels only, end card
ends with **pyqvault.com**. Idea seen working at @codematrixvishal (Boyle's law, 3.5M views, L27); this version is ours.

## The physics (checked, and tested)

- Boyle's law at constant temperature: P × V = constant. Here 4 L at 1 atm → 2 L at 2 atm → 1 L at 4 atm; the
  readout shows P × V = 4.0 on every frame (test).
- Why: the gas pushes by hitting the walls. Temperature is constant, so the molecules keep their speed; in half
  the height they reach the piston twice as often. The counter is measured from the simulation itself (each
  particle's real speed stays fixed while the room shrinks): **12.9 → 25.2 (×1.96) → 49.9 (×3.88) hits a second**.
- The graph: P against V traces the curve P = 4/V as the piston moves, then the x-axis morphs to 1/V and the same
  points lie on a straight line through the origin (test).

## What's on screen

| Time | Picture | Text (in frame) |
|---|---|---|
| 0–2.6 s | title still on a card, a light circling its edge | **PHYSICS, VISUALISED #2 · Why does squeezing a gas raise its pressure?** |
| 3.2–9 s | 3D glass cylinder, 40 particles bouncing, those hitting the piston light up amber; P–V graph with its dot at (4, 1) | V 4.0 L · P 1.0 atm · P × V = 4.0 · hits on the piston: ~14 a second · *Gas pushes by hitting the walls* |
| 9–17 s | the piston pushes down to 2 L; the dot traces the curve | live: V 2.0 L · P 2.0 atm · ~25 hits a second · *Squeeze it into half the space* · *Twice the hits → twice the pressure* |
| 17–21 s | down again to 1 L | V 1.0 L · P 4.0 atm · ~50 hits a second · *Half again → four times the pressure* |
| 21.4–26.6 s | the graph's x-axis morphs from V to 1/V: the curve straightens | *P × V never changes* |
| 26.6–30 s | end card | Half the space, twice the hits. **That's the physics.** Follow for #3 · **pyqvault.com** |

## Files

- `pv-physics-002-boyle.mp4` (1080×1920, 30 fps, rendered by Remotion)
- `pv-physics-002-boyle-cover.png`: at 2 L, counter ~25, "Squeeze a gas. Why ×2 pressure?"
- `pv-physics-002-strip.png`: frames decoded from the MP4
- Re-make: `cd remotion && npm test && npm run music:pv002 && npm run render:pv002 && npm run cover:pv002`

## Before you post (approval gate)

- [ ] Watch it once on your phone: the counter and readouts are readable
- [ ] It goes to **@pyqvault_**: approve at about 11:00 (approving posts at once)
- [ ] Caption starts "Class 11 Physics · Kinetic Theory"
