# @lws.pune · 025, Why? #13: 256 balls, 8 rows of pegs. Which bin fills most? (a 3D Galton board)

**Handle:** @lws.pune (project `pyq-vault`) · **Kind:** the first weekly **core Probability** reel (framework F32), made to
F33 (watched happening, the formula last) · **Series:** Why? #13 · **Version:** v2, **3D** (the founder found the 2D v1
"bland and 2D, hardly any movements", 2026-10-24; v1 was never posted) · **Storyboard:**
[nda-maths-025-galton-board.storyboard.md](nda-maths-025-galton-board.storyboard.md), v2 reviewed by an independent agent
before any code (F31; 3 blockers fixed) · **NDA link:** NDA 2018 (II) Maths Q107 (question id
`7150efc9-ecdc-4b4b-ae0e-81040547bf98`), named in the caption · **Idea:** remake-backlog W18, no proven remake, topic
score 6/10 · Made with `lwspune-framework.md` v1.9 · **Look:** white board; a real 3D board (wood frame, steel pegs,
glass both sides), glossy VIVID blue marbles, orange path and coin ball, green web (colour-blind checked) ·
**Music:** `bright` · **Length:** 24.8 s · **Made in Remotion 3D** (`remotion/src/Reel025.tsx`; flights, camera, labels
and sound in `src/lib/reel025.ts`; the bins' physics in `src/lib/reel025Physics.ts` (Rapier); tests in
`tests/reel025.test.ts`).

## The maths (checked, and tested)

- Each peg sends a ball left or right, 50–50. After 8 pegs a ball's bin is its number of rights, k = 0…8.
- There are 2⁸ = 256 left/right paths, each equally likely (1 in 256). Bin k is reached by ⁸Cₖ of them:
  1, 8, 28, 56, **70**, 56, 28, 8, 1 (enumerated, tested). So the middle bin gets the most → **A**.
- Each peg's number of paths is ʳCⱼ, the sum of the two above it: Pascal's triangle (tested peg by peg).
- 256 balls expect ⁸Cₖ balls in bin k; "all equal" would be 256 ÷ 9 ≈ 28.4 a bin (tested).
- **The run on screen is honest.** Each ball's 8 choices come from a seeded fair generator; its flight between the pegs
  it chose is a gravity arc (time-scaled, the same bounce for all, so no two balls in a lane overlap: tested every
  frame); from its bin's mouth the **Rapier physics engine** piles it with the others by real collisions (every ball
  ends at rest in the bin its choices give, two runs identical: tested). The seed is the first (from 1) whose run is
  typical: every bin within one standard deviation of ⁸Cₖ, the middle tallest (rule in `reel025.ts`). Seed 11:
  **1 6 26 59 72 54 27 10 1**. The glass columns and the "all equal" sheet use the heights those numbers of balls stand
  at in this run's own piles (a straight-line fit, each real pile within 0.25 of it: tested).
- **NDA 2018 (II) Q107:** "8 coins are tossed simultaneously. The probability of getting at least 6 heads is" → right =
  heads, so the three right-hand bins: (28 + 8 + 1)/256 = **37/256 → (c)** (tested by enumeration). Matches the bank.
- **Traps:** C all equal (each peg fair, so each bin fair: the sheet shows how far off that is); B edges (1 path each).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | the board front-on, ~40 marbles already bouncing down the pegs, bins empty | **NDA MATHS · PROBABILITY · 256 balls, 8 rows of pegs. Which bin fills most?** A middle · B edges · C all equal · `0 / 256 balls` |
| 0–3.0 s | a tilted 360° orbit of the board (glass both sides, so the back view shows the balls too); pegs flash and pulse when hit; balls leave short trails | *Each peg: left or right, 50–50* |
| 3.0–5.0 s | front view: the rain thickens; heaps jostle up in the bins; counts under the bins | |
| 5.0 s | punch-in on the bins · **A middle** lights | |
| 5.0–9.0 s | the last marbles fall and settle | *Middle wins. But each peg is fair…* |
| 9.1–10.6 s | a slate sheet slides in at the all-equal height, tagged "C: all equal" | *All equal would only reach here* |
| 10.8–12.4 s | the marbles fade; one orange tube grows down the far-left pegs | *Edge: only all-left gets there* · `edge: 1 path` |
| 12.4–15.2 s | 70 green tubes pour into the middle bin | *Middle: 70 different ways in* · `middle: 70 paths` |
| 15.2–17.2 s | number pills pop up on the pegs row by row; 1 8 28 56 70 56 28 8 1 in the bins | *Paths to here = two above added* · `256 paths in all` |
| 17.2–19.4 s | the marbles return; green glass columns rise to the expected heights | *Every path equally likely: 1 in 256* · `256 balls, 256 paths` |
| 19.4–21.8 s | one orange marble bounces down H T H H T T H T ("H = right", "T = left"), the camera riding along; it lands in the middle | *Each peg is a coin toss* · `k heads: ⁸Cₖ ways` |
| 21.8–24.8 s | end card | Most paths, most balls. **Follow for more** |

**Cover:** frame 0 (front-on, bins empty), "Middle, edges or all equal?".

## Sound (F14–F16)

Peg pings (every 16th hit, pitch by row), landing taps, a knock on the answer, a tap as the sheet lands, a click per peg
on the orange tube, a shimmer under the web with a tap per 5th tube, a click per row of numbers, a whump as the columns
land, a click per peg on the coin ball and a knock as it lands; whooshes on the fast zooms.

## Files

- `nda-maths-025-galton-board.mp4` · `nda-maths-025-galton-board-cover.png` · `nda-maths-025-strip.png`
- Re-make: `cd remotion && npm test && npm run simulate:025 && npm run music:025 && npm run mix:025 && npm run render:025 && npm run cover:025`
- No YouTube copy yet: the "Subscribe for more" end card (`EndCard platform`) is on the unmerged `feat/youtube-shorts`
  branch. Render `-yt.mp4` once that's merged.

## Before you post (founder)

- [ ] Watch it once on the phone: the counts, peg numbers and H/T letters readable
- [ ] The answer (A middle) and Q107's working match this kit
- [ ] Cover chosen in the upload screen
