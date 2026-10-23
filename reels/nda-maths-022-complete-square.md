# @lws.pune · 022, Why? #10: x² + 6x: add what to make a perfect square? (completing the square, with tiles)

**Handle:** @lws.pune (project `pyq-vault`) · **Kind:** an **NDA maths concept** reel (framework F1) · **Series:** Why? #10 ·
**Storyboard:** [nda-maths-022-complete-square.storyboard.md](nda-maths-022-complete-square.storyboard.md), reviewed by an
independent agent before any code (F31; 3 blockers fixed) · **NDA link:** NDA 2026 (I) Maths Q42 (question id
`9ce30270-c0a8-455b-bb9f-7681d2bcb640`), named in the caption · **Proven idea:** remake-backlog W16, "the quadratic formula
is a square, completed": @codematrixvishal 1.10M (40×) [link](https://www.instagram.com/reel/DZPH3WfpKcB/); topic score
5/10 · Made with `lwspune-framework.md` v1.8 · **Look:** white board, VIVID objects (F24) · **Music:** `lofi` (021
cinematic before it) · **Length:** 18.6 s · **Made in Remotion** (`remotion/src/Reel022.tsx`, tiles + graph + camera +
labels + sound in `src/lib/reel022.ts`, tests in `tests/reel022.test.ts`).

## The maths (checked, and tested)

- Tiles: x² (the square), 3x + 3x = 6x (the halves), the missing corner 3 × 3 = 9. x² + 6x + 9 = (x + 3)² (test at
  several x) → **B 9**.
- So x² + 6x = (x + 3)² − 9. A square is never negative, so x² + 6x ≥ −9, equal only when x + 3 = 0: lowest point
  (−3, −9) (tests). The live readout is y = x² + 6x at the moving dot (test).
- **NDA 2026 (I) Q42:** "For a given k, the minimum value of x² + kx + k²?" x² + kx + k² = (x + k/2)² + 3k²/4, so the
  minimum is **3k²/4 → (c)**, at x = −k/2 (tested by brute force at five values of k). Matches the bank's key.
- **Traps:** A 6 (adds the middle number); C 36 (squares the 6 instead of half of it).
- Honest scale: x is unknown, so it's drawn at an arbitrary size with no number on it; 3 and 6 are to scale with each
  other (1 unit = 40 px).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | blue x² square, orange 6x strip already splitting and gliding in | **NDA MATHS · QUADRATIC EQUATIONS · x² + 6x: add what to make a perfect square?** A 6 · B 9 · C 36 |
| 0–1.4 s | the strip splits; "6" becomes "3", "3" at 1.2 s; the left half lands beside the square | *Split the 6x strip in two* |
| 1.4–3.4 s | the other half drops, slides under, turns and slides up into place | *…and wrap it round the square* |
| 3.4–4.3 s | the dashed 3 × 3 corner pulses | *One corner is missing* |
| 4.3 s | the corner fills green, "9"; the whole square glows; punch-in · **B 9** lights | *A perfect square!* |
| 5.6–7.0 s | sides relabel "x + 3"; x² + 6x + 9 = (x + 3)² | |
| 7.0–9.0 s | the 9 lifts out; the line becomes x² + 6x = (x + 3)² − 9 | *Take the 9 back out* |
| 9.0–12.6 s | tiles shrink to the corner; the parabola draws; a dot rides from x = 0 down to (−3, −9), live `y = …` | *Lowest value: −9, at x = −3* |
| 12.6–15.6 s | push in on the vertex, "(x + 3)² = 0 here" | *Squared part ≥ 0, so ≥ −9* · `y = −9 (lowest)` |
| 15.6–18.6 s | end card | Completing the square: **add (half the x number)².** Follow for more |

**Cover:** 0.15 s (the strip still reads as one "6x" piece with "6" on top: no "3, 3", no "3x", no corner), "6, 9 or 36?".

## Camera (F9) and sound (F14–F16)

- Slow push in from frame 0 → **punch-in on the corner landing on the answer** (whoosh) → fast zoom out (whoosh) → pan
  following the dot → gentle push in on the vertex. Tested: the wrapping half never cuts into the square or the other
  half and stays in frame; no two labels ever overlap; every visible label stays in the picture on every frame.
- A snap at the split, a tap as each half lands, soft clicks as the corner pulses, a knock on the answer, a whump as the 9
  lifts out, ticks as the readout passes −1 … −8, a tap at the vertex.

## Files

- `nda-maths-022-complete-square.mp4` · `nda-maths-022-complete-square-cover.png` · `nda-maths-022-strip.png`
- Re-make: `cd remotion && npm test && npm run music:022 && npm run mix:022 && npm run render:022 && npm run cover:022`

## Before you post (founder)

- [ ] Watch it once on the phone: the tiles' labels and the readout readable
- [ ] The answer (B 9) and Q42's working match this kit
- [ ] Cover chosen in the upload screen
