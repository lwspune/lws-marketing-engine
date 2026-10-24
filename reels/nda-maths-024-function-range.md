# @lws.pune · 024, Why? #12: f(x) = x² from X to Y. What is the range? (domain, codomain, range)

**Handle:** @lws.pune (project `pyq-vault`) · **Kind:** an **NDA maths concept** reel (framework F1) · **Series:** Why? #12 ·
**Storyboard:** [nda-maths-024-function-range.storyboard.md](nda-maths-024-function-range.storyboard.md), reviewed by
an independent agent before any code (F31; 1 blocker fixed, 1 declined, 5 improvements taken) · **NDA link:** NDA 2022 (II)
Maths Q13 (question id `de6011e3-03ae-415b-a52a-8de41b353945`), named in the caption · **Idea:** the founder's own ask
(2026-10-24: "a reel explaining the concept of function with input, output, domain, codomain and range"), not a remake,
so no proof multiple · Made with `lwspune-framework.md` v1.8 · **Look:** white board, VIVID objects (F24: domain cyan,
codomain pink, range green) · **Music:** `bright` (023 synthwave before it) · **Length:** 21.4 s · **Made in Remotion**
(`remotion/src/Reel024.tsx`, timeline, camera, labels and sound in `src/lib/reel024.ts`, tests in `tests/reel024.test.ts`).

## The maths (checked, and tested)

- X = {−2, −1, 0, 1, 2}, Y = {0, 1, 2, 3, 4}, f(x) = x². The outputs are 4, 1, 0, 1, 4 (all in Y, so f: X → Y is a
  function). Distinct: **{0, 1, 4} → A**.
- **Domain** = every input = X. **Codomain** = every output allowed = Y. **Range** = the outputs actually hit, a subset of
  the codomain: Y minus the range = {2, 3}, never hit.
- **What makes it a function:** each input has exactly one arrow. −2 and 2 both going to 4 is fine; giving 1 a second
  arrow (to 0) breaks it (tested with `isFunction`).
- **NDA 2022 (II) Q13:** A = {7, 8, …, 16}, f: A → N, f(x) = the highest prime factor of x. How many elements are in the
  range? 7→7, 8→2, 9→3, 10→5, 11→11, 12→3, 13→13, 14→7, 15→5, 16→2 → {2, 3, 5, 7, 11, 13}, **6 → (c)** (tested). Matches
  the bank's key. The same lesson: the codomain N never ends, the range has 6.
- **Traps:** B {0, …, 4} is the codomain (range = codomain, the commonest mix-up); C {−2, …, 2} is the domain (inputs taken
  for outputs).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | sets X (cyan) and Y (pink) with all ten numbers; the first ball already flying from −2 | **NDA MATHS · FUNCTIONS · f(x) = x², from set X to set Y. What is the range of f?** A {0, 1, 4} · B {0, …, 4} · C {−2, …, 2} |
| 0–3.6 s | five balls fly X → Y drawing arrows; each output lights green; the list grows "Outputs: 4, 1, 0, 1, 4" | *Each input → exactly one output* |
| 3.8–4.8 s | 2 and 3 go dashed ("2, 3: never hit"); the repeats fade and the list becomes "Range = {0, 1, 4}" | |
| 5.0 s | punch-in · **A {0, 1, 4}** lights | *Range: only the outputs hit* |
| 7.2–11.6 s | X glows, "X · domain"; then Y glows, "Y · codomain" | *C is X, the domain: every input* → *B is Y, the codomain: allowed outputs* |
| 11.6–13.8 s | −2 → 4 and 2 → 4 thicken; ✓ on 4 | *Two inputs, one output: still fine* |
| 13.8–16.4 s | a dashed arrow 1 → 0; ✗ | *One input, two arrows: not a function* |
| 16.4–18.4 s | the whole named picture holds (worth a screenshot) | *Range sits inside the codomain* |
| 18.4–21.4 s | end card | Range = **the outputs you hit.** Follow for more |

**Cover:** 0.3 s (the first ball half-way, nothing lit), "What's the range?".

## Camera (F9) and sound (F14–F16)

- Only the ovals, arrows, balls and marks zoom, about the picture's centre; the set labels follow their ovals sideways
  and the readout stays still. Slow push from frame 0 → **punch-in landing on the answer** (whoosh) → fast zoom out
  (whoosh) → push in on the two arrows into 4 → fast zoom out (whoosh) for the ✗. Tested: ovals in frame and clear of the
  labels and readout; no two labels overlap on any frame.
- A click as each ball lands (pitch up with the output), a tap as 2 and 3 go dashed, a knock on the answer, taps as each
  set is named, a click for the ✓, a snap for the ✗.

## Files

- `nda-maths-024-function-range.mp4` · `nda-maths-024-function-range-cover.png` · `nda-maths-024-strip.png`
- Re-make: `cd remotion && npm test && npm run music:024 && npm run mix:024 && npm run render:024 && npm run cover:024`

## Before you post (founder)

- [ ] Watch it once on the phone: the numbers in the dots and "2, 3: never hit" readable
- [ ] The answer (A {0, 1, 4}) and Q13's working match this kit
- [ ] Cover chosen in the upload screen
