# nda-maths-026-mean-balance storyboard (3D, F34)

## 1. The idea
- One sentence: the mean is the point where the marks balance like weights on a seesaw, so one big mark drags it a long
  way, while the median (the middle mark) doesn't move at all.
- End-card takeaway: "Mean: the balance point. Median: the middle." Chapter: NDA MATHS · STATISTICS.
- Source: remake-backlog W25 (core chapter, F32), no proven remake, score 6/10. F33 (watched happening), F34 (3D).
- Caption PYQ: NDA 2017 (I) Q117 (id `93168259-096e-499b-95f8-37cd3a7e1993`): 5 observations, mean 32, median 33; one
  recorded as 40 instead of 35. Corrected → **(b) the median remains the same but the mean will decrease**. Re-derived:
  sum 160 → 160 − 40 + 35 = 155, mean 31; 40 and 35 are both above the median 33, so the middle value stays 33.

## 2. The viewer
- Knows "mean = sum ÷ n" and "median = middle value" as two recipes; has never seen why the mean is pulled by an
  outlier and the median isn't.
- Likely answers: **A 40** (the middle mark didn't change, so "nothing moved": mixing the mean up with the median, the
  trap); **C 60** (the top mark jumped 50, so the mean must jump a lot). Right: **B 50** (it moves 50 ÷ 5 = 10).

## 3. The question (frame 0)
- Lines: "Marks 20 30 40 50 60. Mean 40." (30 chars) / "60 becomes 110. New mean?" (25) · A 40 · B 50 · C 60.
- On frame 0: the question text (it holds every number) and the seesaw with its 0–120 scale already in view.
- 2-second answer: gut feel ("a bit more") or 50 ÷ 5 = 10. The seesaw then shows it.

## 4. Frame 0 and the cover
- Frame 0: front-on, the camera starting its orbit; the plank level on its fulcrum at 40; the 40 block already falling.
- Cover: t = 2.9 s (the orbit landing front-on, all five blocks on, the plank level at 40, before the jump at 3.0).
  No spoiler: it shows the old mean the question states. Text "60 → 110. New mean?" at y 1590 (no caption on screen then).

## 5. The scene (3D, real materials, F24)
- A thin, light **wood** plank (REAL wood, RoundBox 12.6 × 0.16 × 1.4) marked 0 … 120 (ticks every 10, numbers every
  20 under the front edge), on a **steel** wedge fulcrum 1.4 high, on a soft white floor that catches the shadows
  (`RealLight`). The plank's own weight is left out, as in the maths (a light plank): only the blocks count.
- Five rounded blocks (RoundBox 0.9, equal weight), **VIVID blue**, each with its mark on its front face (34 px); the
  topper (60 → 110) **VIVID orange**. A small glass **spirit level** at the plank's empty 0–10 end: its bubble shows
  the tilt. A **VIVID green** flag on the middle (40) block: "median".
- **Motion, all from honest rules (scripted):**
  - the blocks drop in balanced pairs (40; then 30 and 50; then 20 and 60), true gravity falls with a small bounce, so
    the plank stays level at 40 all along (tested: the torque about 40 is zero after each landing);
  - the tilt follows the torque Σ(mark − pivot): any non-zero torque tips the plank onto the floor on that side; resting
    there, its angle is set by geometry (sin θ = pivot height ÷ distance from the pivot to that end), so as the pivot
    slides towards the low end the plank gets steeper; only when the torque is exactly zero (pivot at the mean) does it
    lift to level, with a small damped wobble (tested);
  - the fulcrum slides along the floor; the bubble follows the tilt.

## 6. Beats
| time | picture: what moves | on-screen words (≤ 7) | camera | sound | key colours |
|---|---|---|---|---|---|
| 0–3.0 | the orbit (front → side → back → side → front, 15° down); blocks drop: 40 (0.1), 30 + 50 (0.7), 20 + 60 (1.3); the plank level on the fulcrum at 40 | "Balanced at the mean: 40" (0.3–2.8) | orbit 360°, front by 3.0 | a wooden knock per landing | blocks VIVID blue, topper orange; plank wood; fulcrum steel |
| 3.0–4.0 | the orange block lifts off 60 and flies an arc to 110, landing with a squash (3.75); the plank tips right-down onto the floor, the bubble runs right | "60 jumps to 110…" | slow push | a whoosh, then a heavy clunk | |
| 4.0–5.0 | the fulcrum slides right along the floor (40 → 50); the plank stays down and gets a little steeper | "Slide the pivot to balance" · readout counts 40 → 50 | slow push | a soft scrape | |
| 5.0–5.2 | at 50 the plank lifts to level, a small wobble, the bubble centres; **B lights** at 5.2 | | punch-in on the pivot, landing at 5.2 | a click; whoosh-in + thunk + music hit | |
| 5.2–6.8 | the 110 block glows; "+50 shared by 5 = +10" | "+50 shared by 5 = +10" | zoom out (5.8–6.4) | whoosh-out | |
| 6.8–8.0 | the median flag on the 40 block glows: it never moved | "Median: still 40" | still | | flag VIVID green |
| 8.0–9.2 | bars float up above the plank from the pivot: three **cyan** bars to the left at stacked heights (to 40, 30, 20: lengths 10, 20, 30), one **orange** bar to the right (to 110: 60), each labelled at its middle | "Gaps from 50: 30, 20, 10 and 60" | slow push | a tap per bar | bars VIVID cyan / orange |
| 9.2–11.0 | the three cyan bars slide into one line leftwards from the pivot (30 + 20 + 10 = 60 marks long, reaching −10), the orange one at the same height rightwards (60): a symmetric T about the pivot | "Left 30 + 20 + 10 = right 60" | still | a snap as they match | |
| 11.0–13.5 | the bars fade; a pill "Σ (x − mean) = 0" | "Mean: where the gaps cancel" | zoom out | | |
| 13.5–16.5 | the orange block slides along the plank 110 → 70 → 110; the fulcrum follows the mean live (50 → 42 → 50), the plank stays level, the readout counts; the median flag never moves | "Move the top mark: the mean follows" | gentle push | a scrape while it moves | |
| 16.5–19.5 | end card | "Mean: the balance point. / Median: the middle. / Follow for more" | – | – | |
Answer at 5.2 s. Second hook: "+50 shared by 5" answers trap C at once; "why exactly 50?" is the bars beat (8.0–11.0).

## 7. Layout map (1080 × 1920)
| zone | y range (px) | what sits there |
|---|---|---|
| header | 96 – 440 | label, question (2 lines, 54 px), chips, nudge |
| readout | 560 – 620 | top-left, fixed: "balance at: 40" / "mean = 46" |
| 3D band | 640 – 1500 | the seesaw ≈ 860 px across at zoom 1 (0.85 of the width, so the punch-in ×1.15 keeps the 110 block and both plank ends in frame); labels HTML via `project()` |
| caption | ~1540 – 1640 | widest "Every"… none over 35 characters |
| nothing important | > 1680 | |
- Scale numbers under the plank's front edge every 20 (36 px, ≈ 140 px apart), faded 8.0–13.5 while the bars are up.
- Block marks on the front faces (34 px, "110" ≈ 52 px on a ≈ 70 px face). "median" above the 40 block's flag.
- Bars at heights 1.0, 1.35, 1.7 above the plank top (above the blocks' tops at 0.9); labels at each bar's middle,
  above it; after the slide, labels "30", "20", "10" on their segments and "60" on the right bar.
- The spirit level at mark 5, away from every block and label. Tested on every frame after the orbit: labels inside the
  band, none overlapping; the plank's ends, the 110 block and the T's ends (−10, 110) inside the frame at every zoom.

## 8. The story without words
Blocks drop onto a seesaw and it balances. One block jumps far to the right and the plank crashes down on that side;
the pivot slides after it until the plank is level again. A flag on the middle block never moves. Rods from the pivot
to each block show three short ones on the left and one long one on the right; stacked, the left three are exactly as
long as the right one. Then the far block slides in and out and the pivot follows it like a shadow.

## 9. Honest numbers
- Mean 40 → 50: (20 + 30 + 40 + 50 + 110) ÷ 5 = 50; median 40 before and after (tests).
- Rods: distances from 50: 30, 20, 10, 0 | 60; 30 + 20 + 10 = 60 (test); Σ(x − x̄) = 0 (test).
- The live mean: (140 + m) ÷ 5 for the moving mark m (110 → 70 → 110 gives 50 → 42 → 50; test), the median 40
  throughout (m ≥ 40, test).
- The tilt: from the net torque Σ(xᵢ − f), zero exactly when f is the mean (test); the plank's resting tilt when the
  low end touches the floor is computed from the geometry (test).
- PYQ: 160 → 155, mean 31; median 33 (test).

## 10. Risks
- Five labels on the blocks plus scale numbers plus rod labels: the scale numbers fade while the rods are up.
- The tilt hides the fulcrum's position: the punch-in at 5.2 is on the fulcrum, readout states it.
- An orbit of a long thin plank shows it edge-on: elevation 15°, the blocks give it height.
- Colour-blind: blue blocks / orange topper / green rods and flag pairwise `distinguishable()` (tested).

## 11. Review
Independent agent, 2026-10-24: **fix first** (maths checked: 200 → mean 40; 250 → 50; median 40; gaps 30 + 20 + 10 = 60;
(140 + m) ÷ 5 for m = 110, 70; the PYQ 155 → 31, median 33).
- B1 blocks landing one at a time would tip the plank → **fixed**: dropped in balanced pairs (40; 30 + 50; 20 + 60).
- B2 the plank can't flatten as the pivot slides (torque stays right-down; the resting angle steepens) → **fixed**: it
  stays down, steepening, and lifts only at 50.
- B3 the spirit level at 40 collides with the block, flag and scale label → **fixed**: at the empty 0–10 end.
- B4 rods on one line overlap and run under the blocks → **fixed**: bars float above the plank at stacked heights.
- B5 the punch-in pushes the plank ends and 110 out → **fixed**: 0.85 of the width at zoom 1; ends and 110 tested in.
- B6 an 8-word caption → **fixed**: "Move the top mark: the mean follows" (7).
- I1 the trick and trap C → **taken**: "+50 shared by 5 = +10" at 5.2 (the PYQ is −5 ÷ 5 = −1).
- I2 cover → **taken**: 2.9 s, all blocks on, "60 → 110. New mean?".
- I3 flag lifts though "never moved" → **taken**: glow only.
- I4 green for both the flag and the rods → **taken**: bars cyan.
- I5 the plank's weight → **taken**: left out, stated, the plank kept thin.
