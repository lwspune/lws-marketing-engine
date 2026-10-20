# @lws.pune · 016, Why? #6: toss a coin, roll a die. Chance of heads AND a six? (why probabilities multiply)

**Handle:** @lws.pune (project `pyq-vault`) · **Kind:** NDA maths concept (F1), no PYQ named (none needed for the idea) ·
**Topic:** @lws.pune backlog **W11**, topic score **8/10** (the top open idea) · **Proven idea:** @mathsy.uk "why do we
multiply probabilities?" 822k (34×) · **Framework:** @lws.pune v1.3 · **Look:** white board, flat 2D (a 3D opening was
built and dropped by the founder the same day, L44) · **Music:** `synthwave` (not used on @lws.pune yet; 015 before it
was cinematic), hits on the answer and the split · **Question:** reworded by the founder's check ("Heads on a coin AND a 6
on a die: chance?" was confusing: it asked before anything was tossed) · **Length:** 19.4 s · **End card:** "Follow for
more" · **Made in Remotion** (`remotion/src/Reel016.tsx`, timing + camera + sound `src/lib/reel016.ts`, tests
`tests/reel016.test.ts`).

## The maths (checked, and tested)

- A coin and a die give 2 × 6 = 12 equally likely outcomes. Heads and a six is exactly one of them: **1/12 = ½ × ⅙**,
  answer **B**. The tests count the outcomes (12, one hit; with a second coin 24, one hit = ½ × ½ × ⅙).
- The traps on screen: **A 2/3** is adding the chances (½ + ⅙), which answers neither "and" nor "or" (P(H or 6) =
  ½ + ⅙ − 1/12 = 7/12); **C 1/6** forgets the coin.
- Honest limit, said on screen and in the caption: multiply only when one event doesn't change the other (independent).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–1.6 s | the 12 cells pop into the grid one by one (a soft pop each) under a slow push; dice faces down the side | **NDA MATHS · PROBABILITY · Toss a coin, roll a die. Chance of heads AND a six?** A 2/3 · B 1/12 · C 1/6 · all outcomes: 12 cells |
| 1.7–2.8 s | the heads column fills, cell by cell (a tap each) | *Heads: half the square* · heads: 6 of 12 = ½ |
| 2.8–4.1 s | the six row fills | *A six: one row of six* · a six: 2 of 12 = ⅙ |
| 4.1 s | punch-in on the crossing cell, it glows green, **B 1/12** lights (thunk) | *Both: 1 cell of 12* · H6: 1 of 12 = ½ × ⅙ |
| 7.4 s | punch-in; the cell splits, half stays lit (click) | *Another coin? Half again: 1/24* · HH6: 1 of 24 = ½ × ½ × ⅙ |
| 10.4–16.8 s | slow push on the whole grid | *Each "and" cuts the space* · *True when one doesn't change the other* |
| 16.8–19.4 s | end card | Each "and" cuts the space: **the chances multiply.** Follow for more |

## Files

- `nda-maths-016-multiply.mp4` · `nda-maths-016-multiply-cover.png` (1.5 s, grid built, nothing filled) ·
  `nda-maths-016-strip.png`
- Re-make: `cd remotion && npm test && npm run music:016 && npm run mix:016 && npm run render:016 && npm run cover:016`
