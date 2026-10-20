# Reel 010, Why? #2 (remade 2026-10-20): roll two dice, which total comes up most?

**Handle:** @lws.pune (project `pyq-vault`) · **Framework:** `lwspune-framework.md` v1.1 · **Made in Remotion**
(`remotion/src/Reel010.tsx`, timeline `src/lib/reel010.ts`, tests `tests/reel010.test.ts`) · **Music:** `bright`, hit on the
answer · **Length:** 22 s · **Posted** 20 Oct by hand, right after the remake (founder: "remake today's and publish it
right away"). The first version (engine, still title card, MCQ at the end, `.render.html`) was never posted.

## The idea (checked, and tested)

- Two dice: 36 equally likely outcomes; each total is one diagonal of the 6×6 grid; 7's is the longest (6 ways), so 7
  comes up most: 6/36. 12 has one way (6 + 6).
- The race is real: 360 seeded rolls of fair dice (the tests check faces and counts); seed = the first one whose run ends
  with 7 clearly on top (60 vs 54). The answer lights at 7.0 s, when 7 takes a lead it never loses.
- NDA 2026 (II) Maths Q111 (question id `9b36dbd5-e618-403e-8192-d36eeb06a0ce`): P(total is neither 5 nor 7) =
  (36 − 4 − 6)/36 = 13/18 → (c). In the caption only.

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | question + A 7 · B 12 · C equal; two dice tumbling, chips dropping into the totals' columns | **NDA MATHS · PROBABILITY · Roll two dice. Which total comes up most?** |
| 0.6–7.0 s | rolls speed up, the histogram builds, counts live | *Every roll drops into its total* |
| 7.0 s | punch-in on 7's column · **A** lights · a hand-drawn circle rings the 7 (rough-notation, seeded) | *7 comes up most* |
| 9–15.5 s | the 6×6 grid; 7's diagonal lights cell by cell; the exact 1…6…1 shape draws itself over the bars | *36 ways two dice can land* · *7 has the most: 6 of 36* |
| 15.5–18.6 s | | *12 has just one: 6 + 6* |
| 18.6–22 s | end card | Two dice, 36 ways to land. **7 has the most: 6.** Follow for more |

Sound: a click as chips land (every one at first, then every 10th), a thunk on the answer, a tap per lit grid cell.

## Files

- `nda-maths-010-why-seven.mp4` · `-cover.png` (2.0 s) · `nda-maths-010-strip.png` · `.post.json`
- Re-make: `cd remotion && npm test && npm run music:010 && npm run mix:010 && npm run render:010 && npm run cover:010`
