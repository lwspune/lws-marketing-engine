# nda-maths-025-galton-board storyboard (v2: 3D)

**Why v2:** the founder watched the finished 2D reel (2026-10-24): "galton board is bland and 2D. hardly any movements.
make it 3D with movement effects". v1 (2D, small dots on a flat diagram, a near-still camera) was never posted; its
storyboard and review are in git history (commit 7b37fcb). v2 keeps v1's question, answer, maths and honesty rules, and
remakes the picture as a real 3D board with physical motion.

## 1. The idea
- One sentence: every peg is a fair 50–50, yet the balls pile up in the middle, because 70 of the 256 equally likely
  paths lead to the middle bin and 1 to each edge; the counts are Pascal's triangle, and each peg is a coin toss.
- End-card takeaway: "Most paths, most balls." Chapter: NDA MATHS · PROBABILITY.
- Source: remake-backlog W18 (core chapter, F32), no proven remake, score 6/10. F33 (watched happening, formula last).
- Caption PYQ: NDA 2018 (II) Q107 (id `7150efc9-ecdc-4b4b-ae0e-81040547bf98`): 8 coins, at least 6 heads → (c) 37/256.
  Re-derived: ⁸C₆ + ⁸C₇ + ⁸C₈ = 28 + 8 + 1 = 37 of 256. Caption only (F20).

## 2. The viewer
- NDA aspirant, knows ⁿCᵣ as a formula; has probably never seen a Galton board.
- Likely answers: **C all equal** (each peg fair → each bin fair: the trap); **B edges** (weak). Right: **A middle**.

## 3. The question (frame 0)
- "256 balls, 8 rows of pegs." / "Which bin fills most?" · A middle · B edges · C all equal (header, as v1).
- Frame 0: the whole 3D board front-on (the orbit starts there), the first ~40 balls already bouncing down the pegs.

## 4. Frame 0 and the cover
- Frame 0: front-on, camera just starting to turn, balls in the pegs, **0 balls in the bins** (the first lands ≈ 0.9 s).
- Cover: t = 0 (frame 0). No spoiler: empty bins (tested: 0 landed at the cover time). Text "Middle, edges or all
  equal?" at y 1590.

## 5. The board (3D, real materials, F24)
- Units: peg spacing DX = 1 across, DY = 0.55 between rows. Width: 9 bins of 1 + a wood frame 0.2 each side = 9.4.
  Height: top frame 0.2 + funnel 0.7 + pegs 7 × 0.55 = 3.85 + 0.55 to the bin tops + bins 1.4 + floor frame 0.2 = 6.9.
  At 1000 px across the board (106 px a unit) it stands ≈ 731 px tall, inside the 940 px 3D band (tested).
- A **wood** frame (REAL wood, RoundBox, F8) 1.5 deep with a pale backboard, a **glass** front (REAL glass), 36 **steel**
  pegs (REAL steel) running front to back, 9 bins with thin steel walls, a funnel at the top. `RealLight`.
- 256 glossy marbles, **VIVID blue**, radius 0.12 (≈ 25 px across), in **five lanes front to back** (z = −0.48 … +0.48,
  0.24 apart; the gap between glass and backboard is 1.26): ball i rides lane i mod 5. A bin holds 4 across × 5 deep, so
  the tallest pile (≤ 84 balls) stands ≈ 1.1 (tested ≤ 1.25 under the 1.4 walls). Why five: every ball passes the top
  peg, and two balls in one lane must be a full hop apart there (0.16 s) or they'd overlap; five lanes let 256 balls fall
  in 8.2 s.
- **How a ball moves.** Above the bins: each ball makes a seeded fair 50–50 choice at every peg (the same honest rule as
  v1); between pegs it flies a true gravity arc off the peg it hit (time-scaled gravity, g = 60, the same bounce for every
  ball, so a hop always takes the same 0.16 s and each ball stays exactly one row behind the one before it in its lane),
  with a brief squash on each impact. Balls in the same lane stay ≥ 1.8 radii apart (tested on every frame, so none
  visibly pass through another); lanes are a full diameter apart. Into the bins: from the bin mouth each
  ball is handed to the **Rapier physics engine** (balls, bin walls, floor, glass and backboard as real colliders), so the
  piles form by real collisions: balls land, bounce, roll off the heap and settle. Tested: every ball ends in the bin its
  choices give; everything is at rest before 9.1 s; two runs are identical.
- **Movement effects:** each peg flashes (white rim glow, 0.15 s) and pulses 3 % when hit, so the top pegs shimmer; fast
  balls leave a short fading trail (3 ghosts at −1, −2, −3 frames); the piles jostle as balls land; the camera opens with
  a tilted full orbit (F22), pushes, punches in on the answer, and rides along with one ball in the coin-toss beat.

## 6. Beats
| time | picture: what moves | on-screen words (≤ 7) | camera | sound | key colours |
|---|---|---|---|---|---|
| 0–3.0 | the orbit: front → side → back → side → front, looking down 18° easing to 8° (the frame's depth and the pegs read from the side), while the rain starts; pegs flash as they're hit | "Each peg: left or right, 50–50" (0.3–3.0) | orbit 360°, eased, front by 3.0 | soft ping per ~6th peg hit, pitch by row | balls VIVID blue; pegs steel; frame wood; glass |
| 3.0–5.0 | front view: the rain thickens (releases run −1.6 … 6.6 s), piles rise and jostle; live counts under the bins fade in at 3.0 | | slow push ×1.04 | pings + landing taps | |
| 5.0 | **A lights**; the middle pile is clearly tallest | | punch-in ×1.1 on the bins (all 9 bins and counts stay in frame), landing at 5.0 | whoosh-in + thunk + music hit | |
| 5.0–8.6 | the last balls fall and settle (all at rest by 9.1) | "Middle wins. But each peg is fair…" (5.0–7.6) | fast zoom out (5.6–6.2) | whoosh-out; taps | |
| 9.1–10.6 | a frosted glass sheet slides in across all bins at the height a pile of 256 ÷ 9 ≈ 28.4 balls stands, tagged "C: all equal"; the middle pile pokes far through it, the edges sit far below | "All equal would only reach here" | still | soft whoosh of the sheet (tap) | sheet frosted white, muted tag |
| 10.8–12.4 | the balls dim; one glowing **orange** tube grows from the funnel down the far-left pegs into the edge bin | "Edge: only all-left gets there" · readout "edge: 1 path" | still | a ping per peg as it passes | tube VIVID orange |
| 12.4–15.2 | 70 glowing **green** tubes pour down the pegs into the middle bin, one after another, a bead of light at each head; the bundle thickens where paths share a step | "Middle: 70 different ways in" · readout counts to 70 | slow push ×1.06 | shimmer + a tap per 5th tube | tubes VIVID green, see-through |
| 15.2–17.2 | the tubes fade; a white number pill pops up on every peg, row by row (1 · 1 1 · … · 1 7 21 35 35 21 7 1), then green numbers inside the bins (1 8 28 56 70 56 28 8 1); counts dim | "Paths to here = two above added" · readout "256 paths in all" | fast zoom out (15.2–15.8) | whoosh-out; a click per row | ink on white pills; bin numbers green |
| 17.2–19.4 | the pills fade (gone by 17.6); the balls brighten; a see-through green glass column rises in each bin to the height ⁸Cₖ balls stand; the real piles sit close to their columns | "Every path equally likely: 1 in 256" · readout "256 balls, 256 paths" | still | whump as the columns land | columns VIVID green glass |
| 19.4–21.8 | one **orange** ball drops from the funnel and bounces down the pegs, H T H H T T H T: a letter pops beside each peg it hits, the first two reading "H = right", "T = left"; 4 H → it lands on the middle pile | "Each peg is a coin toss" · readout "k heads: ⁸Cₖ ways" | **ride-along**: the camera follows the orange ball down at ×1.3, then eases back as it lands | a ping per peg; a thunk as it lands | coin ball VIVID orange |
| 21.8–24.8 | end card | "Most paths, / most balls. / Follow for more" | – | – | |

Answer at 5.0 s. Second hook at 5.0, answered 9.1–19.4. Something moves on every frame: balls from frame 0 until 8.6,
then the sheet, tubes, pills, columns and the orange ball.

## 7. Layout map (1080 × 1920)
| zone | y range (px) | what sits there |
|---|---|---|
| header | 96 – 440 | label, question, chips (w 240), nudge (as v1) |
| readout | 470 – 540 | top-left, x 60, 44 px, fixed (not in the 3D) |
| 3D band | 560 – 1500 | the board; counts, numbers, tag and H/T are HTML placed with `project()` |
| caption | ~1540 – 1640 | the widest, "Middle wins. But each peg is fair…" (34 chars at 50 px ≈ 850 px), fits 960 |
| nothing important | > 1680 | |
- From 3.0 s the board is front-on, ≈ 1000 px across and ≈ 806 px tall, centred in the band (tested with `project()`:
  the board's corners inside the band at zoom 1; at the ×1.1 punch-in all 9 bins and their counts stay inside).
- Labels hidden during the orbit (they'd swing); counts fade in at 3.0. Tested inside the band and non-overlapping on every
  frame, except during the ride-along (19.4–21.6), when the counts and bin numbers are hidden and only the H/T letters
  (next to the orange ball, tested inside) and the readout show.
- Counts under each bin, 36 px, muted. Bin numbers inside the bins near the wall tops, above the tallest pile and its
  column (tested). Peg pills on the pegs (32 px digits), gone before the columns and the coin beat. The "C: all equal"
  tag on the sheet's right end over bins 7–8, whose piles stay under the sheet (tested). H/T beside each peg on the side
  away from the ball's next step.

## 8. The story without words
A 3D board turns once in the light while marbles rain through steel pegs that flash as they're hit; the marbles heap up,
tallest in the middle, almost nothing at the edges, and a flat sheet marking "all equal" shows how far off that is. One
orange thread of light reaches the edge bin; a thick green bundle of 70 pours into the middle. Numbers pop up on every
peg, growing towards the centre; glass columns rise to the size those numbers predict and match the heaps. Then one
orange marble bounces down alone and lands in the middle.

## 9. Honest numbers
- Each ball's 8 choices: a seeded fair generator (as v1); its bin = its number of rights (test). The bounce arcs only
  carry it between the pegs it chose. The piles: Rapier, from each ball's real arrival position and speed; every ball
  ends in its bin and at rest (tests). The seed: the first (from 1) whose run is typical (every bin within 1 standard
  deviation of ⁸Cₖ, middle tallest at the end and clearly tallest at the answer), as v1.
- Path counts: enumerated (all 2⁸ sequences); pegs ʳCⱼ, bins ⁸Cₖ (tests). The PYQ: 37 by enumeration (test).
- The columns and the sheet: the height a pile of n balls stands in a bin, from a straight-line fit (height against
  count) to the run's own settled piles, so they use the same packing the piles have (test: each real pile within 0.25
  of its fitted height); columns at n = ⁸Cₖ, the sheet at n = 256 ÷ 9.
- Every count on screen is that run's own count.

## 10. Risks
- Physics runs out of order in Remotion: simulated once (`npm run simulate:025` → `public/nda-maths-025-physics.json`,
  git-ignored), played back; two runs identical (test).
- A ball bouncing out of its bin or through the glass: walls above any bounce, CCD on; tested at rest in its bin.
- The orbit's back view: tilted 18°, so the frame's depth and pegs read from the side and behind; ends front-on by 3.0.
- White board + bright tubes: VIVID colours (no bloom on white); they read by colour and thickness.
- 256 balls + trails + 70 tubes: instanced meshes; render 5–10 min, one render at a time; disk ≈ 3 GB free.
- Colour-blind: blue balls / orange path / green web pairwise `distinguishable()` (tested).

## 11. Review
v2 reviewed by an independent agent, 2026-10-24: **fix first** (maths checked: Pascal rows, ⁸Cₖ sum 256, 256 ÷ 9, 4 H in
H T H H T T H T, 37/256, middle sd ≈ 7.1).
- B1 the cover at 2.9 s shows the middle bulge and its rule could never pass → **fixed**: cover = frame 0 (front-on, 0
  balls landed, tested).
- B2 the "all equal" sheet drawn at the full-run height while balls still land → **fixed**: all at rest by 9.1 (tested),
  the sheet slides in at 9.1 (built: 8.8 was too early; the last ball settles at ≈ 9.0).
- B3 the board can't fill both the width and the band → **fixed**: dimensions stated (9.4 × 6.9 units, ≈ 1000 × 731 px);
  lanes front to back make piles shorter and the balls bigger (r 0.12).
- I1 orbit edge-on / from behind while "50–50" is up → **taken**: tilted 18° → 8°, frame 0.8 deep.
- I2 scripted balls would pass through each other → **taken**: five lanes (three were too few: the top peg needs a full
  hop between same-lane balls), one bounce for all; same-lane gap ≥ 1.8 radii tested every frame. Reel 24.8 s (≤ 25).
- I3 peg numbers unexplained → **taken**: "Paths to here = two above added".
- I4 256 balls ↔ 256 paths → **taken**: readout "256 balls, 256 paths".
- I5 say H = right → **taken**: the first H and T read "H = right", "T = left".
- Layout: punch-in keeps all 9 bins + counts (×1.1, tested); ride-along exemptions stated (counts and bin numbers hidden);
  pills gone by 17.6, before the coin beat; widest caption ≈ 850 px.
