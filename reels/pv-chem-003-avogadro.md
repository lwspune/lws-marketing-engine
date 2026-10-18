# @pyqvault_ · Chemistry, visualised #3 — add gas: why does the volume grow?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11 · **Theme:** white (L22 rotation: C3 white) · **Made in
Remotion** (`remotion/src/PvChem003.tsx`, simulation + timing `src/lib/pc003.ts`, tests `tests/pc003.test.ts`), a real
three.js cylinder · **Music:** `trap`, impacts on each "add gas" (7.6 s, 15.4 s) · **Length:** 30 s.
**Proven idea:** @bisal.physics "add more gas, the volume grows", 421k views (50× their typical reel),
https://www.instagram.com/reel/Dd5lqeJy6e7/ (remake-backlog C3). Ours adds the *why*: the live count of hits on the lid
stays level while the gas doubles twice.

## The chemistry (checked, and tested)

- Same temperature (every particle keeps its speed) and same pressure (a free lid with a fixed weight). Gas is added
  twice through a valve: 12 → 24 → 48 particles; the lid rises so V = n/12 L: 1 → 2 → 4 L (tests; V/n within 20% even
  while the lid is moving, exact once it settles).
- Every particle stays between the floor and the lid and inside the glass on every frame (test).
- Hits on the lid, counted from the simulation itself: 12.1 → 11.4 → 12.9 a second (test: each within 25% of the
  first). Pressure = hits per second on the lid, so it stays the same: Avogadro's law, V ∝ n at fixed T and P, i.e.
  equal volumes hold equal numbers of particles.

## What's on screen

| Time | Picture | Text (in frame) |
|---|---|---|
| 0–2.6 s | title still on a card, a light circling its edge | **CHEMISTRY, VISUALISED #3 · Add gas: why does the volume grow?** |
| 3.2–7.6 s | 12 particles under a free lid; V–n graph dot at (12, 1) | particles 12 · V 1.0 L · P 1.0 atm · hits on the lid ~12 a second · *A gas under a free lid* |
| 7.6–15.4 s | the valve glows, 12 green particles come in, the lid rises to 2 L; the dot climbs the line | *Double the gas…* · *…it takes double the space* · hits stay ~12 |
| 15.4–20.6 s | 24 more come in, the lid rises to 4 L | *Double it again* |
| 20.6–26.4 s | | *Equal volumes hold equal numbers of particles* |
| 26.4–30 s | end card | Twice the gas, twice the space. **That's the chemistry.** Follow for #4 · **pyqvault.com** |

## Files

- `pv-chem-003-avogadro.mp4` · `pv-chem-003-avogadro-cover.png` · `pv-chem-003-strip.png`
- Re-make: `cd remotion && npm test && npm run music:pc003 && npm run render:pc003 && npm run cover:pc003`
