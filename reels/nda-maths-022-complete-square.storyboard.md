# nda-maths-022-complete-square storyboard

## 1. The idea
- One sentence: x² + 6x is a square with a strip stuck on; split the strip in two, wrap it round, and the only piece
  missing is a small corner of 3 × 3 = 9, so x² + 6x + 9 = (x + 3)², and x² + 6x = (x + 3)² − 9 is never below −9.
- End-card takeaway: "Completing the square: / add (half the x number)²." (true when x²'s number is 1, as here).
  Chapter: NDA MATHS · QUADRATIC EQUATIONS.
- Source idea: remake-backlog W16, "The quadratic formula is a square, completed", @codematrixvishal 1.10M (40×), score 5/10.
- Caption PYQ: NDA 2026 (I) Q42 (id `9ce30270-c0a8-455b-bb9f-7681d2bcb640`): "For a given k, minimum of x² + kx + k²?"
  Re-derived: x² + kx + k² = (x + k/2)² + k² − k²/4 = (x + k/2)² + 3k²/4 ≥ 3k²/4, reached at x = −k/2 → (c) 3k²/4.

## 2. The viewer
- Knows the quadratic formula by heart; has heard "completing the square" but never seen it as an actual square.
- Likely answers: **A 6** (just adds the middle number); **C 36** (squares the 6 instead of half of it). Right: **B 9**.

## 3. The question (frame 0)
- Lines: "x² + 6x: add what to make" (25 chars) / "a perfect square?" · Options: A 6 · B 9 · C 36.
- On frame 0: a blue square labelled x on two sides ("x²" inside) and an orange strip x tall and 6 wide ("6x" inside,
  "6" on top). Everything needed is there (the picture is x² + 6x).
- 2-second answer: "half of 6 is 3, 3² = 9", or from the picture once the strip starts splitting.

## 4. Frame 0 and the cover
- Frame 0: both tiles on screen; the orange strip has already started to split down its middle (a hairline gap
  opening) while the whole strip glides left towards the square, so the picture moves from frame 0.
- Cover: 0.5 s: the split barely begun, "6" still above the strip (the "3, 3" labels don't appear until 1.2 s, so the
  cover doesn't hand over the "half of 6" step that beats the 36 trap). Cover text "6, 9 or 36?" at y 1590.

## 5. Beats
| time | picture: what moves | on-screen words (≤ 7) | camera | sound | key colours |
|---|---|---|---|---|---|
| 0–1.4 | the 6x strip splits into two 3x halves while gliding left; the left half lands against the square's right side at 1.4; "6" above swaps to "3" and "3" at 1.2–1.4 | "Split the 6x strip in two" | slow push in ×1.06 about band (540, 560) | snap at the split, tap as the left half lands | x² blue, strips orange (VIVID) |
| 1.4–3.4 | the right half drops straight down (1.4–2.0), slides left under the tiles (2.0–2.6), turns 90° there (2.6–3.0), slides up into place under the square (3.0–3.4) | "…and wrap it round the square" | slow | whoosh-free; tap as it lands | |
| 3.4–4.3 | a dashed 3 × 3 gap shows at the corner; it pulses twice | "One corner is missing" | slow push toward the corner | soft tick per pulse | dashed outline green |
| 4.3 | the corner fills green, "9" inside; the outline of the whole (x + 3) × (x + 3) square glows; **B lights** | "A perfect square!" (4.3–7.0) | punch-in ×1.25 on the corner (0.35 s) | whoosh-in + knock + music hit | corner green (VIVID) |
| 4.3–7.0 | sides relabel "x + 3" on top and left; the identity line under the tiles: x² + 6x + 9 = (x + 3)² | (same caption) | fast zoom out | whoosh-out | |
| 7.0–9.0 | the green corner lifts up and right, out of the square, and fades; the identity line re-forms as x² + 6x = (x + 3)² − 9, the "− 9" in green where the corner went | "Take the 9 back out" | hold | whump as it lifts | corner green, "− 9" green |
| 9.0–9.6 | the tiles shrink ×0.5 to the top-left; their labels hide; the identity line stays at the top-right | – | still | – | |
| 9.6–12.6 | the parabola y = x² + 6x draws itself; a dot slides along it from x = 1 down to the vertex with a live pill "y = …" that stops at −9; the vertex lights and "(x + 3)² = 0 here" appears beside it | "Lowest value: −9, at x = −3" | follows the dot gently | tick as the pill passes each whole number below 0; tap at the vertex | parabola blue, dot + vertex green |
| 12.6–15.6 | gentle push in on the vertex | "Squared part ≥ 0, so ≥ −9" | push ×1.12 centred on the vertex | – | |
| 15.6–18.6 | end card | "Completing the square: / add (half the x number)². / Follow for more" | – | – | |
Answer at 4.3 s. After the answer: the identity (4.3–9.0) and why it finds a minimum (9.6–15.6), which is the caption's
PYQ.

## 6. Layout map (1080 × 1920)
| zone | y range (px) | what sits there |
|---|---|---|
| header | 96 – 440 | label, 2 question lines, chips, "comment your guess" |
| picture band | 470 – 1500 (band px below) | tiles 0–9.6 s; small tiles + identity line + graph after |
| caption | ~1540 – 1640 | one caption; the cover text "6, 9 or 36?" at y 1590 |
- Tiles (band px): x = 360 px, 1 unit of "6" = 40 px. x² square (300–660, 150–510). The 6x strip at frame 0:
  (700–940, 150–510). Left half ends at (660–780, 150–510). Right half (120 × 360, centre (880, 330)) drops to centre
  (880, 790) [x 820–940, y 610–970: clear of all tiles], slides left to centre (480, 790) [x 420–540: below the tiles,
  which end at y 510 then], turns about its centre [sweep circle r ≈ 190: x 290–670, y 600–980; the blue square ends at
  510, so no overlap], ends horizontal (300–660, 730–850), slides up to (300–660, 510–630). Corner (660–780, 510–630).
  Whole square 300–780 × 150–630. The ×1.06 push about (540, 560) keeps the sweep inside x 269–676, y 586–1005 (the
  bottom fade starts at 968: the strip passes through it only while turning, never rests there).
- Labels: "x" above the square (480, 118); "x" left of it (268, 330); "6" above the strip (820, 118) → "3" above each half
  at 1.2 s; after the wrap "3" left of the bottom half (268, 570). "x²" and "3x" inside their tiles.
- Identity line at band y 720 (below the finished square, nothing else there after 3.4 s), 46 px.
- The lifted corner goes up-right to (820–940, 380–500), clear of the square, then fades; "− 9" appears at the identity
  line's right end.
- 9.0 s on: tiles ×0.5 to (150–390, 75–315), labels hidden; identity line moves to the top-right (band x 430–1040,
  y 110, 38 px). Graph: x ∈ [−7, 1] → band x 140–940 (100 px/unit); y ∈ [−11, 5] → band y 380–960 (36.25 px/unit);
  vertex (−3, −9) at (540, 887); label "(x + 3)² = 0 here" to its **right** (565–900, 887); the curve is clipped at y = 5
  (it leaves the range at x = −3 ± √14). The live pill "y = −9" at band top centre (22–110).
- Widest text: "x² + 6x + 9 = (x + 3)²" at 46 px ≈ 600 px.

## 7. The story without words
A square and a strip. The strip splits; one half slides to the side, the other drops, turns and slides underneath. A
small dashed corner is all that's missing from a bigger square; it fills in green. The green corner lifts away. A
parabola appears, a dot rides it down to its lowest point, and the number beside it stops at −9.

## 8. Honest numbers
- Tile areas: x², 3x + 3x = 6x, corner 3 × 3 = 9; (x + 3)² = x² + 6x + 9 (test at several x).
- The live pill is y = x² + 6x at the dot's x (test); vertex x = −3, y = −9 (test); Q42's 3k²/4 re-derived at several k.
- x is drawn at an arbitrary size (it's unknown): the label "x" has no number; 3 and 6 are to scale with each other.
- Tests: the turning half's corners never enter the blue square, the left half or the corner cell, and stay inside the
  frame at that beat's zoom.

## 9. Risks
- The turning half's sweep (handled by the path above, tested).
- "x" at 360 px beside "3" at 120 px could suggest x = 9: no number is written on x.
- Tiles shrinking + graph drawing at once is busy: the shrink finishes before the graph starts.
- The vertex near the bottom fade: y range shifted to [−11, 5] and the last push centred on the vertex.

## 10. Review
Independent agent, 2026-10-23: **fix first** (maths checked: tile areas, the identity, the vertex, Q42 (c), the scale).
- B1 the turning half would sweep through the right half and nearly leave the frame → **fixed**: drop, slide left
  under the tiles, turn there, slide up; sweep x 290–670, y 600–980, tested.
- B2 the cover at 1.0 s showed "3, 3" and gave away the step that beats the 36 trap → **fixed**: labels swap at
  1.2–1.4 s; cover at 0.5 s; cover text placed at y 1590.
- B3 the identity was in the caption and on the picture at once (F7) → **fixed**: captions "A perfect square!" and "Take
  the 9 back out"; the lifted corner's path and the "− 9" are in the layout map.
- I1 1.4–2.6 s nearly still → **taken**: the gap closes during the split; the wrap now fills 1.4–3.4; answer at 4.3 s.
- I2 no live number (F3) → **taken**: a dot rides the parabola with a live "y = …" pill stopping at −9.
- I3 x = −3 is an impossible side length → **taken**: "(x + 3)² = 0 here" at the vertex (the algebra holds for every x).
- I4 end card vs takeaway mismatch → **taken**: one line, "add (half the x number)²".
- I5 labels too small after the ×0.5 shrink → **taken**: they hide.
- Layout: vertex near the bottom fade → **taken**: y range [−11, 5], push centred on the vertex.
