# nda-maths-025-galton-board storyboard

## 1. The idea
- One sentence: every peg is a fair 50–50, yet the balls pile up in the middle, because far more paths lead to the
  middle bin (70 of the 256) than to an edge bin (1); the path counts are Pascal's triangle, and each peg is a coin toss.
- End-card takeaway: "Most paths, most balls." Chapter: NDA MATHS · PROBABILITY.
- Source idea: remake-backlog W18 (core chapter, F32), no proven remake (proof "—"), score 6/10. Framework F33: watched
  happening, the formula last.
- Caption PYQ: NDA 2018 (II) Q107 (id `7150efc9-ecdc-4b4b-ae0e-81040547bf98`): "8 coins are tossed simultaneously. The
  probability of getting at least 6 heads is" → (c) 37/256. Re-derived: ⁸C₆ + ⁸C₇ + ⁸C₈ = 28 + 8 + 1 = 37 of 2⁸ = 256.
  On the board: right = heads, so the three right-hand bins hold 37 of the 256 paths. Named in the caption only (F20).

## 2. The viewer
- An NDA aspirant who has met ⁿCᵣ and "probability = favourable / total", but thinks of them as formulas. Has probably
  never seen a Galton board.
- Likely answers: **C all equal** (each peg is fair, so each bin must be fair: the strongest pull, and the trap the reel is
  built around); **B edges** (balls "bounce outwards"; weak). Right: **A middle**.

## 3. The question (frame 0)
- Lines: "256 balls, 8 rows of pegs." (26 chars) / "Which bin fills most?" (21) · Options: A middle · B edges ·
  C all equal.
- On frame 0: the whole board (8 rows of pegs, 9 bins) and balls already falling through the pegs. The caption from 0.3 s
  says each peg is 50–50 (the fact the trap rests on). Nothing else is needed.
- 2-second answer: gut feeling, or "the middle can be reached many ways". The piles settle it within 5 s either way.

## 4. Frame 0 and the cover
- Frame 0: about 43 balls already in flight between the pegs (released from t = −1.2 s, so the rain is under way); the
  bins are empty (the first ball lands at ≈ 0.1 s). Readout "0 / 256 balls".
- Cover: t = 0.15 s, before the first caption (0.3 s): balls in the pegs, about 2 in the bins (no pile shape yet). Text
  "Middle, edges or all equal?" at y 1590 (inside 240–1680), alone in the caption zone. No spoiler: no pile.

## 5. Beats
| time | picture: what moves | on-screen words (≤ 7) | camera | sound | key colours |
|---|---|---|---|---|---|
| 0–5.0 | 256 balls rain through the pegs at a steady rate (released −1.2 … 6.0 s), hopping peg to peg, landing and stacking in the bins; live count under each bin; readout counts up | "Each peg: left or right, 50–50" (0.3–3.0) | slow push 1.00 → 1.04 | soft tap every 8th landing | balls VIVID blue; pegs ink 45%; bin walls axis |
| 5.0 | **A lights**: the middle pile is clearly tallest (≈ 50 there vs ≈ 1 in each edge bin) | | punch-in ×1.12 on the bins, landing at 5.0 | whoosh-in + thunk + music hit | |
| 5.0–7.6 | the rain finishes (last ball lands ≈ 7.4); a muted dashed flat line draws across all bins at 256 ÷ 9 ≈ 28 balls, tagged "C: all equal" | "Middle wins. But each peg is fair…" (second hook) | zoom out to 1.00 (5.6–6.2) | whoosh-out | flat line muted, dashed |
| 7.6–8.0 | the flat line fades; balls fade to 25% (piles and counts stay) | | still | | |
| 8.0–9.8 | ONE path draws itself from the top peg to the left edge bin's wall top (y 640), all lefts; readout "1 path" | "Edge: only all-left gets there" | still | click per peg (8, rising) | edge path VIVID orange |
| 9.8–12.8 | the 70 paths into the middle bin draw one after another, fast (each in 0.3 s, a new one every 0.037 s), thin and see-through: the web thickens where many paths share a step; every path ends at the bin's wall top (y 640); readout counts "1 path" → "70 paths" (no label at the bin mouth while the web is up) | "Middle: 70 different ways in" | slow push 1.00 → 1.05 | tap every 5th path, pitch rising; shimmer under the web | middle paths VIVID pink |
| 12.8–15.0 | the paths fade; the ball counts under the bins dim to 20%; on each peg its number of paths writes in, row by row (0.22 s a row): 1 · 1 1 · 1 2 1 · … · 1 7 21 35 35 21 7 1; then on the bin mouths 1 8 28 56 70 56 28 8 1; readout "256 paths in all" | "Each peg adds the two above" | zoom out to 1.00 (12.8–13.4) | whoosh-out; soft click per row | numbers ink on small white discs over the pegs; bin numbers pink |
| 15.0–17.4 | balls back to full colour, counts back; a green dashed outline (the expected pile) drops onto each pile at the height of its path number: every path is equally likely (1 in 256), so 256 balls expect ⁸Cₖ in bin k; the real piles sit close to it, a few balls over or under; readout "expected balls = paths" | "Every path equally likely: 1 in 256" | still | whump as the outlines land | outline WHITE green, dashed |
| 17.4–19.8 | one path draws again (H T H H T T H T: right = H, left = T), each letter appearing beside its peg as the path passes; 4 H land it in the middle bin; readout "k heads: ⁸Cₖ ways" | "Each peg is a coin toss" | gentle push 1.00 → 1.04 | click per row | path VIVID orange, H/T ink |
| 19.8–22.8 | end card | "Most paths, / most balls. / Follow for more" | – | – | |
Answer at 5.0 s. Second hook at 5.0 ("But each peg is fair…"), answered 8.0–17.4. Something new every second: the rain and
counts (0–7.4), the flat line (5.6), the lone path (8.0), the web (9.8), the numbers (12.8), the outlines (15.0), the
tosses (17.4).

## 6. Layout map (1080 × 1920)
| zone | y range (px) | what sits there |
|---|---|---|
| header | 96 – 440 | label, question (2 lines at 54 px), chips (w 240: "C   all equal"), nudge |
| picture band | 470 – 1500 (band y 0 – 1030) | readout top-left; pegs, bins, piles, counts (below) |
| caption | ~1540 – 1640 | |
| nothing important | > 1680; < 240 on the cover | |
Inside the band (band px; the board is centred on x 540):
- Readout: band (60, 70), anchor start, 44 px, ink. Widest "8 tosses: ⁸Cₖ ways" / "256 paths in all" ≈ 17 chars ≈ 375 px
  → x 60 … 435, clear of the ball stream at x 540 ± 20 above the first peg.
- Balls enter through the soft top edge at x 540 and fall to the top peg. Ball radius 8.
- Pegs: row r = 0…7 has r + 1 pegs at x = 540 + (j − r/2)·104, y = 190 + 58r (row 7 at y 596, x 176 … 904). Peg radius 7.
- Bins: 9, centred at x = 540 + (k − 4)·104 (124 … 956), walls at the half-steps (72 … 1008), wall tops y 640, floor
  y 900 (pile room 260 px: hex-packed, 6 balls a row, 13.9 px a row; the tallest real pile, ≤ 85, is ≤ 15 rows = 224 px,
  top ≥ 676).
- Ball counts under the floor: y 948, 36 px, muted, centred on each bin ("85" widest, ≈ 36 px of the 104 px bin).
- Path numbers above the bins: y 676 is too close to a tall pile (top ≥ 676), so they sit on the bin mouths at y 628,
  36 px (box 599 … 635), between row 7's pegs (y 596, discs r 7 → 603) and the wall tops (640). Row 7's peg numbers
  replace those pegs' dots, so the two rows are 32 px apart vertically and offset half a step (52 px) horizontally; both
  ≤ 2 digits at 36 px (≈ 36 px wide). Row 7's discs (r 22, y 574 … 618) sit 52 px sideways from each bin label (half
  widths 22 + 18 = 40 < 52). Checked by the overlap test (discs included).
- Peg numbers: centred on the pegs, 32 px on white discs r 22 (rows are 58 apart, discs 78 apart along a diagonal).
- "C: all equal" tag: 34 px, right end of the flat line, anchor end at x 1000, baseline 6 px above the line (≈ 810);
  ≈ 204 px wide → x 796 … 1000, over bins 7–8 (bin 6's walls end at 800). In the overlap test, with the real pile tops
  of the bins under it as boxes.
- The lone path's and the web's counts are in the readout only; the paths end at the wall tops (y 640).
- H/T letters (17.4): 34 px, beside each peg on the side away from the path's next step, inside the board.
- Zooms (whole board layer, readout and labels in a still layer except counts and numbers, which sit with the board):
  punch-in ×1.12 about (540, 770): board x 72 … 1008 → 16 … 1064 (inside 0–1080); floor counts y 948 → 969 (inside the
  band, above the bottom soft edge at 1000). Slow push ×1.05 about (540, 520) for the web: x 72 … 1008 → 49 … 1031; the
  top peg y 190 → 173 and the floor 900 → 919, both inside.
- Soft edges: top 5 %, bottom 3 % (so counts at 948 stay crisp).

## 7. The story without words
Balls rain through a triangle of pegs and pile into bins: a tall heap in the middle, almost nothing at the edges, far
from a flat line across all bins. One lonely path reaches the edge bin; then a dense web of paths pours into the middle,
a counter running to 70. Numbers bloom on every peg, growing towards the centre, and the bins read 1 … 70 … 1. A dashed
outline built from those numbers drops onto the heaps and fits them.

## 8. Honest numbers
- The balls: a real simulation, 256 balls, each peg a fair 50–50 from a seeded generator (+ − × ÷ only, so tests and
  render get the same run). Every count on screen is that run's own count. The seed is chosen from the first 50 so the
  run is a typical one (middle tallest, every bin within 2 standard deviations of ⁸Cₖ, an edge bin may be 0; chosen by a rule in the tests, not by eye);
  said in the caption kit. A ball's bin = its number of rights (test).
- Path numbers: counted by enumerating all 2⁸ = 256 left/right sequences; each peg's number = the sequences reaching it =
  ʳCⱼ, each bin's = ⁸Cₖ; they sum to 256 (tests).
- The outline ("expected"): 256 balls × ⁸Cₖ / 256 = ⁸Cₖ expected balls; each path's chance 1/256 (tests).
- The flat line: 256 / 9 = 28.4 balls (test), drawn at that height.
- The PYQ: 28 + 8 + 1 = 37, by enumeration (test).

## 9. Risks
- 256 moving balls could read as noise: one colour, small, on clean pegs; the piles are the focus by 5 s.
- The web of 70 paths could look like a scribble: thin, see-through, drawn in order, the counter carries the count.
- Two rows of numbers near the bin mouths (row 7's pegs and the bins): offset half a step and 32 px apart; overlap test.
- A random run that looks lopsided would fight the message: the seed rule (8) and the expected outline make it honest.
- Too many words: captions ≤ 7 words, one at a time; the readout is the only other text.
- Colour-blind: blue balls vs pink web vs orange path, each pair checked with `distinguishable()`.

## 10. Review
Independent agent, 2026-10-24: **fix first** (maths checked: Pascal rows 0–7, ⁸Cₖ summing to 256, 256 ÷ 9, 37/256, ≈ 174
landed at 5 s, last landing ≈ 7.3 s).
- B1 "256 balls, 256 paths: they match" is false for one run (≈ 66 vs 70) and skips why paths matter → **fixed**: caption
  "Every path equally likely: 1 in 256", the outline is the *expected* pile (readout "expected balls = paths"), the ball
  counts dim while the path numbers write in.
- B2 cover at 0.4 s collides with the first caption and has ≈ 11 balls landed, not 3 → **fixed**: cover at 0.15 s
  (≈ 2 landed), before the caption.
- B3 the "70" label sits on the web's densest point → **fixed**: counts in the readout only; paths end at the wall tops.
- I1 H/T on all row-7 pegs is crowded → **taken**: H/T letters along one middle path, 4 H → the middle bin.
- I2 k undefined → **taken**: "k heads: ⁸Cₖ ways".
- I3 tag size + reach over bin 6 → **taken**: 34 px, ends at x 796 (bin 6's wall at 800), tested against the real piles.
- I4 discs vs bin labels; digits in the disc → **taken**: 32 px in r 22 discs, discs in the overlap test.
- I5 the 0.6 s zoom out needs its whoosh (F15) → **taken** (`whooshesFor` adds it).
- Also: "≈ 43 in flight at frame 0" (was 35); the seed rule allows an empty edge bin (37% of runs).
