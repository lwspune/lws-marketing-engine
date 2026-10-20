# @pyqvault_ · Chemistry, visualised #4 — heat a gas from 0 °C to 273 °C: its volume?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11 · **Theme:** **lab** (L22 rotation: C4 lab) · **Format:**
predict-first (L28, L29): the question with A/B/C from frame 0, no still title card, 22 s · **Made in Remotion**
(`remotion/src/PvChem004.tsx`, simulation + timing `src/lib/pc004.ts`, tests `tests/pc004.test.ts`), a three.js cylinder
over a flame · **Music:** `synthwave`, impact at 9.0 s (the volume doubles); 0 K gets its own boom.
**Remade 2026-10-20** to framework v1 (`pyqvault-framework.md`): burner lit on frame 0 and out at 273 °C (F5), rounded
knob (F8), camera + graph zooms (F9) and the experiment's own sound (F14–F16). The first version (flames from 2 s, no
effects) was never posted. Cover moved to 3.0 s: at the old time the readout already said V 1.95 L (F6).
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
| 0 s → | **CHEMISTRY, VISUALISED #4 · Heat a gas from 0 °C to 273 °C. Its volume becomes?** A ×1.5 · B ×2 · C ×273 · *comment your guess 👇*; the burner lights under the cylinder | |
| 0–9 s | flames burn; molecules warm (blue → amber) and speed up; the lid rises; the V–T dot climbs from (0 °C, 1 L) to (273 °C, 2 L) | live: θ °C = T K · V L · same pressure · *Heat it: the molecules speed up* · *the lid rises…* |
| 9 s | the burner goes out; **B ×2** lights | *Volume doubled!* |
| 11–18.6 s | the line runs back (dashed) to zero at −273 °C, which glows: = 0 K | *The line hits zero at −273 °C* · *Count from there: 273 K → 546 K* |
| 18.6–22 s | end card | Double the kelvin, double the volume. **That's the chemistry.** Follow for #5 · **pyqvault.com** |

## Camera (F9, `CAMERA` and `GRAPH_ZOOM` in `src/lib/pc004.ts`)

| Time | Move |
|---|---|
| 0–3.2 s | push in on the molecules as they heat (0.9 → 1.6) |
| 4.4–7.0 s | pull back as the lid rises (→ 0.95) |
| 8.7–9.0 s | **punch-in on the lid as the volume doubles** (→ 1.3) · whoosh in |
| 10.4–11.8 s | settle (→ 1.0) |
| 11.6–12.2 s | the graph zooms onto −273 °C (×1.8), landing as 0 K glows · whoosh in |
| 15.4–16.1 s | the graph zooms back out for the last line · whoosh out |

## Sound (F14–F16, `SOUND` in `src/lib/pc004.ts`, tested)

- A **"whump"** as the burner lights on frame 0, then its **roar** (flickering with the flames) until it goes out at 9 s.
- A soft **patter of molecules hitting the lid**: every tap is a real hit in the picture. Honest physics, tested: hotter
  molecules hit **harder** (√2×) but, with the lid risen, **less often** (≈ 0.7× per second): the pressure stays the same.
- A deep **boom** as −273 °C = 0 K glows (12.2 s). Whooshes on the three fast zooms. Nothing boils, so no boiling sound.
- Mix: music dips under the whump, roar and boom; effects ~5 dB under the music; peak −4.5 dB (no limiting needed).

## Files

- `pv-chem-004-charles.mp4` · `pv-chem-004-charles-cover.png` · `pv-chem-004-strip.png`
- Re-make: `cd remotion && npm test && npm run music:pc004 && npm run mix:pc004 && npm run render:pc004 && npm run cover:pc004`
  (the reel plays `public/pv-chem-004-charles-mix.wav`: music + effects)
