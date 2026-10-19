# @pyqvault_ · Chemistry, visualised #4 — heat a gas from 0 °C to 273 °C: its volume?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11 · **Theme:** **lab** (L22 rotation: C4 lab) · **Format:**
predict-first (L28, L29): the question with A/B/C from frame 0, no still title card, 24 s · **Made in Remotion**
(`remotion/src/PvChem004.tsx`, simulation + timing `src/lib/pc004.ts`, tests `tests/pc004.test.ts`), a three.js cylinder
over a flame · **Music:** `synthwave`, impacts at 11.0 s (the volume doubles) and 13.0 s (the line reaches −273 °C).
**Proven idea:** @codematrixvishal Charles's-law piston, 807k views (30× their typical reel),
https://www.instagram.com/reel/DaXyLxWJDbn/ (remake-backlog C4). Ours turns it into a guess and shows *why* ×2.

## The chemistry (checked, and tested)

- Constant pressure (free lid with a fixed weight); heated 0 → 273 °C, i.e. 273 → 546 K. V ∝ T in kelvin on every frame
  (test), so V doubles: 1.00 → 2.00 L → **B ×2**. (273 is used for 273.15, as in the textbook problem.)
- Molecules speed up with √T: √2 ≈ 1.41× faster at the end (test); they turn from blue to amber as they warm.
- The V–T line V = (θ + 273)/273 reaches zero at −273 °C = 0 K (test). Traps: ×1.5 (a guess), ×273 (dividing °C by °C).

## What's on screen

| Time | Picture | Text (in frame) |
|---|---|---|
| 0 s → | **CHEMISTRY, VISUALISED #4 · Heat a gas from 0 °C to 273 °C. Its volume becomes?** A ×1.5 · B ×2 · C ×273 · *comment your guess 👇*; the cylinder at 0 °C | |
| 2–11 s | flames light; molecules warm (blue → amber) and speed up; the lid rises; the V–T dot climbs from (0 °C, 1 L) to (273 °C, 2 L) | live: θ °C = T K · V L · same pressure · *Heat it: the molecules speed up* · *the lid rises…* |
| 11 s | **B ×2** lights | *Volume doubled!* |
| 13–20.6 s | the line runs back (dashed) to zero at −273 °C, which glows: = 0 K | *The line hits zero at −273 °C* · *Count from there: 273 K → 546 K* |
| 20.6–24 s | end card | Double the kelvin, double the volume. **That's the chemistry.** Follow for #5 · **pyqvault.com** |

## Files

- `pv-chem-004-charles.mp4` · `pv-chem-004-charles-cover.png` · `pv-chem-004-strip.png`
- Re-make: `cd remotion && npm test && npm run music:pc004 && npm run render:pc004 && npm run cover:pc004`
