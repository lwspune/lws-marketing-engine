# nda-maths-021-log-flip storyboard

## 1. The idea
- One sentence: the graph of log₂x is the graph of 2ˣ folded over the line y = x, because a log swaps what goes in and
  what comes out: 2³ = 8 means log₂8 = 3; and since 2ˣ is never 0 or negative, log₂x has no 0 or negative inputs.
- End-card takeaway: "Logarithm = / the power, flipped." Chapter: NDA MATHS · LOGARITHMS.
- Source idea: remake-backlog W12, "What a logarithm is (exponential, flipped)", @mathsy.uk 1.10M (46×), score 5/10.
- Caption PYQ: NDA 2024 (I) Q27 (id `e0244426-f13f-4475-a9fa-32198825fe25`): "number of solutions of
  log₄(x − 1) = log₂(x − 3)" → One. Re-derived: log₄(x − 1) = ½ log₂(x − 1), so x − 1 = (x − 3)², x² − 7x + 10 = 0,
  x = 2 or 5; logs need x > 3, so only x = 5 → (b) One. Named in the caption as "NDA asks logs like this": it's the
  domain rule this reel ends on (x = 2 is thrown out).

## 2. The viewer
- An NDA aspirant who can compute log₂8 = 3 by rule but has never seen why the graph looks the way it does.
- Likely answers: **A y = x²** (thinks "inverse of a power" = a square / square root, mixing up x² and 2ˣ);
  **C y = 2⁻ˣ** (thinks "flip" = mirror in the y-axis). Right: **B y = log₂x**.

## 3. The question (frame 0)
- Lines: "Flip y = 2ˣ over the line y = x." (32 chars) / "You get…?" · Options: A x² · B log₂x · C 2⁻ˣ.
- On frame 0: the curve y = 2ˣ (blue, labelled "y = 2ˣ"), the mirror line y = x (dashed, labelled "y = x"), both axes
  with 0, 4, 8 marked. That is everything needed.
- 2-second answer: "flip over y = x swaps x and y; the swap of 2ˣ is log₂x" (or by elimination).

## 4. Frame 0 and the cover
- Frame 0: axes and the dashed mirror already there; the blue curve already drawn from x = −1.5 to about x = 0.5 and
  drawing on, finished by 1.5 s; blue dots pop in on it as it passes (1, 2), (2, 4), (3, 8), each with its coordinates.
- Cover: 1.7 s: blue curve fully drawn with its three labelled dots, the mirror line, nothing orange yet. Cover text
  "Flip 2ˣ over y = x → ?" at y 1590 (reads on its own in the grid). No spoiler.

## 5. Beats
| time | picture: what moves | on-screen words (≤ 7) | camera | sound | key colours |
|---|---|---|---|---|---|
| 0–1.5 | blue 2ˣ draws itself; dots pop on at (1, 2), (2, 4), (3, 8) with their coordinates | "Power of 2: x in, 2ˣ out" (0.3–1.8) | slow push in | a tap per dot | 2ˣ blue (VIVID), dots blue |
| 1.8–4.4 | **the fold:** a copy of the blue curve and its dots folds over the mirror line (every point moves straight across, perpendicular to y = x), with a soft shadow so it never vanishes; it passes the line quickly (fast in the middle of its ease) and turns orange as it crosses; each dot keeps its old label until it crosses, then shows its swapped one: (2, 1), (4, 2), (8, 3) | "Fold it over y = x…" | slow | shimmer under the fold; a snap as the copy crosses the line | the copy blue → orange (VIVID) |
| 4.6 | the orange curve is labelled "y = log₂x"; **B lights** | "2³ = 8 flips to log₂8 = 3" (4.6–8.0) | punch-in ×1.3, re-centred on (5.5, 5.5), the midpoint of (3, 8) and (8, 3) (0.35 s) | whoosh-in + knock + music hit | orange |
| 5.0–5.6 | a dashed segment draws from (3, 8) to (8, 3), crossing the mirror at right angles | | hold | tap | |
| 5.8 | "(3, 8)" cross-fades into "2³ = 8" | | | tap | |
| 6.6 | "(8, 3)" cross-fades into "log₂8 = 3" | | | tap | |
| 7.3 | the pair pulses once | | | | |
| 8.0–10.4 | fast zoom out; the other pairs do the same: 8.6 "2² = 4" ↔ "log₂4 = 2"; 9.4 "2¹ = 2" ↔ "log₂2 = 1" | "Every point swaps the same way" | fast zoom out (0.6 s) | whoosh-out; taps | |
| 10.4–11.4 | the dot-pair labels fade; the strip below the x-axis (y ≤ 0) shades blue: "2ˣ never here" | "2ˣ is never 0 or negative…" (10.4–12.0) | still | whump | blue tint |
| 11.4–12.4 | that shaded strip folds over the mirror and lands as the strip left of the y-axis (x ≤ 0), orange: "no log" (set vertically) | "So no log for 0 or negatives" (12.0–13.6) | gentle push in | shimmer, snap as it lands | orange tint |
| 12.4–13.6 | hold; the orange curve's left end pulses where it dives toward the y-axis without touching it | (same) | gentle push | | |
| 13.6–16.6 | end card | "Logarithm = / the power, flipped. / Follow for more" | – | – | |
Answer at 4.6 s. After the answer: something new every ~0.7 s (segment, two cross-fades, pulse), then the other pairs,
then the domain rule coming from the flip itself (the trap behind Q27's rejected x = 2).

## 6. Layout map (1080 × 1920)
Graph coordinates below are **band-local** (the band is the 1080 × 1030 picture area starting at frame y 470).
| zone | frame y (px) | what sits there |
|---|---|---|
| header | 96 – 440 | label, 2 question lines (54 px), chips at ~306–382, "comment your guess" ~400–435 |
| picture band | 470 – 1500 | the graph, clipped to the band with soft top/bottom edges: maths x, y ∈ [−1.5, 8.6] at 95 px/unit (equal on both axes, so the swap segment really looks perpendicular), centre (3.5, 3.9): (0, 0) at band (207, 885), (8, 8) at band (967, 125) |
| caption | ~1540 – 1640 | one caption; cover text at 1590 |
- Curve labels: "y = 2ˣ" on the **left** of the blue curve near (2.4, 5.3). "y = log₂x" **below** the orange curve at
  (5.3, 1.6) → band (711, 733), anchored start, clear of (4, 2)'s label (centred at band x 588, ends ≈ 683). "y = x"
  **below-right** of the mirror at (7.4, 7.4).
- Dot labels, one per dot (coordinates, later cross-faded into the equation in the same place):
  (1, 2) **left**; (2, 4) **left**; (3, 8) **left** (anchored end); (2, 1) **below-right** at about (2.2, 0.55) → band
  (416, 833), above the x-axis (885); (4, 2) **below**; (8, 3) **below**, anchored end at band x ≤ 1000.
- Punch-in ×1.3 centred on (5.5, 5.5): (3, 8) → (231, 206), (8, 3) → (849, 824); "2³ = 8" (≈ 150 px) left of (3, 8)
  ends ≥ 60; "log₂8 = 3" (≈ 190 px) under (8, 3) spans 754–944. Tested: every visible label inside band x 30–1050 and
  y 30–1000 on every frame.
- The x ≤ 0 strip is band x 65–207; the (1, 2)-pair labels are hidden by then (10.4 s).
- Widest label: "log₂8 = 3" (9 chars at 40 px ≈ 190 px).

## 7. The story without words
A blue curve rises steeply through three dots. A copy folds across the dashed diagonal and lands as an orange curve that
rises slowly; the three dots land at mirrored places. One pair of dots is joined across the diagonal: same numbers,
swapped. Then the region under the x-axis, which the blue curve never enters, folds over too, and the orange curve
never enters it.

## 8. Honest numbers
- Fold: p = (a, b) → p_par + s·p_perp with s from 1 to −1 (p_par along y = x, p_perp across it); at s = −1 exactly
  (b, a) (test). The orange curve is log₂x sampled directly and matches the folded copy (test).
- Dots: 2¹ = 2, 2² = 4, 2³ = 8 and their logs (tests). Q27 re-derived in tests (x = 5 only). The shaded strip y ≤ 0
  folds onto x ≤ 0 (test).

## 9. Risks
- The steep part of 2ˣ above y = 8.6 leaves the frame: blue drawn to x = 3.1, orange to x = 8.6.
- Near the origin the curves and the mirror crowd: no labels there.
- At s = 0 the copy lies on the mirror: passed quickly, with a soft shadow.
- Spoiler: nothing orange before 1.8 s; "y = log₂x" not before 4.6 s.
- Colour-blind: blue vs orange (distinguishable, tested).

## 10. Review
Independent agent, 2026-10-23: **fix first** (maths checked: Q27, the dots, the reflection, the perpendicular segment,
spot values, the pixel map).
- B1 "y = log₂x" collided with (8, 3)'s labels → **fixed**: moved below the curve at (5.3, 1.6); overlap test covers it.
- B2 "2³ = 8" and "(3, 8)" both left of the dot → **fixed**: each coordinate label cross-fades into its equation.
- B3 "log₂4 = 2" / "log₂2 = 1" had no place; (2, 1)'s label would hit the axis → **fixed**: same cross-fade; (2, 1)'s
  label below-right, above the axis.
- B4 cover at 1.6 s before the curve finished → **fixed**: drawn by 1.5 s, cover at 1.7 s.
- B5 the ×1.3 punch-in pushed the picture out of the band → **fixed**: re-centred on (5.5, 5.5), graph clipped to the
  band with soft edges, labels tested inside 30–1050.
- I1 make the domain rule come from the flip → **taken**: y ≤ 0 shade ("2ˣ never here") folds into x ≤ 0 ("no log").
- I2 no non-integer labels mid-fold → **taken**: labels swap as each dot crosses.
- I3 the copy vanishes at s = 0 → **taken**: quick crossing + soft shadow.
- I4 cover text alone was meaningless → **taken**: "Flip 2ˣ over y = x → ?".
- I5 "no log here" too wide for the strip → **taken**: "no log", set vertically.
- Layout: whooshes on the punch-in and zoom out (F15) → **taken**; 4.6–8.0 now changes every ~0.7 s (F2).
