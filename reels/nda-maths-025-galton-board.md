# @lws.pune · 025, Why? #13: 256 balls, 8 rows of pegs. Which bin fills most? (the Galton board)

**Handle:** @lws.pune (project `pyq-vault`) · **Kind:** the first weekly **core Probability** reel (framework F32), made to
F33 (watched happening, the formula last) · **Series:** Why? #13 · **Storyboard:**
[nda-maths-025-galton-board.storyboard.md](nda-maths-025-galton-board.storyboard.md), reviewed by an independent agent
before any code (F31; 3 blockers fixed) · **NDA link:** NDA 2018 (II) Maths Q107 (question id
`7150efc9-ecdc-4b4b-ae0e-81040547bf98`), named in the caption · **Idea:** remake-backlog W18, no proven remake (proof
"—"), topic score 6/10 · Made with `lwspune-framework.md` v1.9 · **Look:** white board, VIVID objects (F24: blue balls,
orange path, green web; colour-blind checked) · **Music:** `bright` (023 synthwave before it) · **Length:** 22.8 s ·
**Made in Remotion** (`remotion/src/Reel025.tsx`; board, balls, paths, camera, labels and sound in `src/lib/reel025.ts`,
tests in `tests/reel025.test.ts`).

## The maths (checked, and tested)

- Each peg sends a ball left or right, 50–50. After 8 pegs a ball's bin is its number of rights, k = 0…8.
- There are 2⁸ = 256 left/right paths, each equally likely (1 in 256). Bin k is reached by ⁸Cₖ of them:
  1, 8, 28, 56, **70**, 56, 28, 8, 1 (counted by enumerating all 256, tested). So the middle bin gets the most → **A**.
- Each peg's number of paths is ʳCⱼ, the sum of the two above it: Pascal's triangle (tested peg by peg).
- 256 balls are expected to put ⁸Cₖ balls in bin k; the trap line "all equal" would be 256 ÷ 9 ≈ 28.4 a bin (tested).
- **The run on screen:** a real simulation, every peg a fair 50–50 from a seeded generator (the same run in tests and
  render). The seed is the first (counting from 1) whose run is typical: every bin within one standard deviation of ⁸Cₖ,
  the middle tallest at the end and clearly tallest at the answer (rule in `reel025.ts`, checked in the tests). Seed 11:
  **1 6 26 59 72 54 27 10 1**; every count on screen is this run's own.
- **NDA 2018 (II) Q107:** "8 coins are tossed simultaneously. The probability of getting at least 6 heads is" → right =
  heads, so it's the three right-hand bins: (28 + 8 + 1)/256 = **37/256 → (c)** (tested by enumeration). Matches the
  bank's key.
- **Traps:** C all equal (each peg is fair, so each bin must be: the reel draws that flat line and the piles beat it);
  B edges (the edge bins need all 8 the same way: 1 path each).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | ~43 blue balls already falling through the pegs; empty bins; counts 0 | **NDA MATHS · PROBABILITY · 256 balls, 8 rows of pegs. Which bin fills most?** A middle · B edges · C all equal · readout `0 / 256 balls` |
| 0–5.0 s | the rain; balls stack in the bins, counts run | *Each peg: left or right, 50–50* |
| 5.0 s | punch-in on the piles · **A middle** lights | |
| 5.0–7.8 s | the rain ends; a dashed flat line at 28.4 a bin, tagged "C: all equal" | *Middle wins. But each peg is fair…* |
| 8.0–9.8 s | the balls dim; one orange path, all lefts, to the edge bin | *Edge: only all-left gets there* · `edge: 1 path` |
| 9.8–12.8 s | 70 green paths pour into the middle, one after another | *Middle: 70 different ways in* · `middle: 70 paths` |
| 12.8–15.0 s | path numbers bloom on the pegs row by row; 1 8 28 56 70 56 28 8 1 in the bins | *Each peg adds the two above* · `256 paths in all` |
| 15.0–17.4 s | green dashed expected piles drop onto the real ones | *Every path equally likely: 1 in 256* · `expected balls = paths` |
| 17.4–19.8 s | one path again with H/T at each peg: 4 heads land in the middle | *Each peg is a coin toss* · `k heads: ⁸Cₖ ways` |
| 19.8–22.8 s | end card | Most paths, most balls. **Follow for more** |

**Cover:** 0.15 s (balls in the pegs, bins empty), "Middle, edges or all equal?".

## Camera (F9) and sound (F14–F16)

- Slow push from frame 0 → **punch-in on the piles landing on the answer** (whoosh) → fast zoom out (whoosh) → slow push
  into the web → fast zoom out for the numbers (whoosh) → gentle push for the coin path. Tested: the board stays in the
  frame; no two labels overlap; the bin numbers stay clear of their piles.
- A soft tap for every 8th ball landing, a knock on the answer, a click per peg on the lone path, a shimmer under the web
  with a tap every 5th path, a click per row of numbers, a whump as the expected piles land, a click per peg on the coin
  path. Mix: peak −3.3 dB, body −20.3 dB (check-video: 4 PASS).

## Files

- `nda-maths-025-galton-board.mp4` · `nda-maths-025-galton-board-cover.png` · `nda-maths-025-strip.png`
- Re-make: `cd remotion && npm test && npm run music:025 && npm run mix:025 && npm run render:025 && npm run cover:025`
- No YouTube copy yet: the "Subscribe for more" end card (`EndCard platform`) is on the unmerged `feat/youtube-shorts`
  branch. Render `-yt.mp4` once that's merged.

## Before you post (founder)

- [ ] Watch it once on the phone: the readout, counts and peg numbers readable
- [ ] The answer (A middle) and Q107's working match this kit
- [ ] Cover chosen in the upload screen
