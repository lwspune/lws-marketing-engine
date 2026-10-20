# @pyqvault_ · Physics, visualised #5: squeeze an insulated gas, its temperature?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11 · **Topic:** remake-backlog **P5**, topic score **10/10**
(F21) · **Proven idea:** @bisal.physics adiabatic squeeze, 1.06M views (125× their typical reel),
https://www.instagram.com/reel/Dd-vzrQSvZx/ · **Framework v1.3**, every point · **Background:** dark (L22) · **Music:**
`trap` (L34 rotation: fewest reels), hit on the answer · **Length:** 21.8 s · **Made in Remotion**
(`remotion/src/PvPhysics005.tsx`, physics + timing + sound `src/lib/pp005.ts`, tests `tests/pp005.test.ts`).

## The physics (checked, and tested)

- Monatomic ideal gas (γ = 5/3), both cylinders squeezed the same way from V to V/2 (1.0 → 4.8 s).
- **Insulated (adiabatic):** T·V^(γ−1) = constant → 300 K × 2^(2/3) = **476 K**; PV^γ = constant → P × 3.17 (tests, every
  frame). Answer **B hotter**. Everyday hook: a bicycle pump gets hot.
- **In water (isothermal):** the heat flows out, T stays 300 K, PV = constant → P × 2.00.
- Molecules move at their real relative speed (∝ √T): 1.26× faster on the hot side; the hot side's piston gets more hits
  (squeezed and faster) and each one harder (tests).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | question + A/B/C over the two cylinders, molecules already moving | **PHYSICS, VISUALISED #5 · Squeeze an insulated gas to half. Its temperature?** A same · B hotter · C colder |
| 1.0–4.8 s | both pistons push down; insulated molecules warm (blue → amber) and speed up; in water, heat drifts out; live T and P; the P–V graph draws both curves | *Squeeze both: same push* |
| 5.25 s | punch-in on the insulated cylinder · **B hotter** lights | *Insulated: 300 K → 476 K!* |
| 7.6–11 s | pan to the cylinder in water | *In water, the heat escapes* |
| 11–18.4 s | zoom out to both, gentle push in | *Your push became heat* · *That's why a pump gets hot* |
| 18.4–21.8 s | end card | Squeeze it: your work becomes heat. **That's the physics.** Follow for #6 · **pyqvault.com** |

## Camera (F9) and sound (F14–F16)

- Drift in from frame 0 → slow push in during the squeeze → **punch-in landing on the answer** (whoosh) → pan to the
  water cylinder → quick zoom out (whoosh) → gentle push in.
- Molecules tapping each piston (every tap a real hit; more and harder on the hot side), the pistons' scrape while they
  move, a thunk as they stop. Mix: peak −5.2 dB, effects ~5 dB under the music.

## Files

- `pv-physics-005-adiabatic.mp4` · `pv-physics-005-adiabatic-cover.png` (0.8 s, before the squeeze) · `pv-physics-005-strip.png`
- Re-make: `cd remotion && npm test && npm run music:pp005 && npm run mix:pp005 && npm run render:pp005 && npm run cover:pp005`
