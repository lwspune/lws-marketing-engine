# @pyqvault_ · Maths, visualised #3 — ₹1 at 100%, added every second: you end with?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11–12 · **Theme:** white (L22 rotation: M3 white) · **Format:**
predict-first (L28, L29), 23.8 s · **Made in Remotion** (`remotion/src/PvMaths003.tsx`, maths + timing `src/lib/pm003.ts`,
tests `tests/pm003.test.ts`) · **Music:** `trap`, impacts at 9.6 s (every second) and 11.6 s (the answer).
**Proven idea:** @codematrixvishal on e, 1.59M views (58× their typical reel), https://www.instagram.com/reel/Dbqgimsp0bk/
(remake-backlog M3). Ours makes it a money guess and draws the staircases that become eᵗ.

## The maths (checked, and tested)

- ₹1 at 100% a year, interest added n times: (1 + 1/n)ⁿ, computed as exp(n · log1p(1/n)) so huge n stays exact.
  n = 1: 2.00 · 2: 2.25 · 4: 2.44 · 12: 2.613 · 365: 2.7146 · 31,536,000 (every second): 2.7182818 = e to 7 decimals (tests).
- More often always gives more, never more than e (test); each staircase starts at ₹1 and ends at (1 + 1/n)ⁿ (test).
  Answer **B ₹2.72**. Traps: A ₹2 (adding once), C crores (thinking it grows without limit).

## What's on screen

| Time | Picture | Text (in frame) |
|---|---|---|
| 0 s → | **MATHS, VISUALISED #3 · ₹1 at 100% a year, added every second. You end with?** A ₹2 · B ₹2.72 · C crores · *comment your guess 👇*; empty axes ₹1–₹3 over one year | |
| 0.2–1.4 s | one step: ₹1 → ₹2 at year end | *Once a year: ₹1 → ₹2* · tally: once a year ₹2.00 |
| 3–11 s | staircases for 2, 4, 12, 365 times, then the smooth curve (every second); earlier ones stay as ghosts | *Add the interest more often…* · tally fills: ₹2.25, ₹2.44, ₹2.61, ₹2.71, ₹2.71828 |
| 11.6 s | the dashed line e = 2.71828… appears; **B ₹2.72** lights | *It stops growing at 2.718…* · *That number is e* |
| 20.4–23.8 s | end card | More often, never past e. **That's the maths.** Follow for #4 · **pyqvault.com** |

## Files

- `pv-maths-003-e.mp4` · `pv-maths-003-e-cover.png` (before the answer: "Guess before you watch") · `pv-maths-003-strip.png`
- Re-make: `cd remotion && npm test && npm run music:pm003 && npm run render:pm003 && npm run cover:pm003`
