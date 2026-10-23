# nda-maths-023-derivative-cycle storyboard

## 1. The idea
- One sentence: differentiating sin x slides its wave a quarter of a turn to the left each time (sin → cos → −sin →
  −cos), so after four derivatives you're back at sin x, and after two you get minus what you started with.
- End-card takeaway: "Each derivative: a quarter turn." Chapter: NDA MATHS · DIFFERENTIATION.
- Source idea: remake-backlog W7, "Derivatives go round in a circle", @mathsy.uk 1.59M (66×), score 6/10.
- Caption PYQ: NDA 2019 (I) Q83 (id `5b1f30f8-ea8a-4536-a48a-e91d91b59aef`): "If y = a cos 2x + b sin 2x, then…" →
  (d) d²y/dx² + 4y = 0. Re-derived: y′ = −2a sin 2x + 2b cos 2x, y″ = −4a cos 2x − 4b sin 2x = −4y.

## 2. The viewer
- Knows (sin x)′ = cos x and (cos x)′ = −sin x as two facts to memorise; hasn't seen they're the same move.
- Likely answers: **B −sin x** (stops after two derivatives, or thinks the sign keeps flipping); **C cos x** (thinks
  it alternates sin, cos). Right: **A sin x**.

## 3. The question (frame 0)
- Lines: "Differentiate sin x four times." (31 chars) / "You get…?" · Options: A sin x · B −sin x · C cos x.
- On frame 0: the wave and a dial with four marks (sin x, cos x, −sin x, −cos x) with its pointer on sin x; a pill
  "y = sin x" that counts derivatives in the reel's own notation (y′, y″, y‴, y⁗; never "× n", which reads as multiply).
  Everything needed is the question text itself.
- 2-second answer: "sin → cos → −sin → −cos → sin", or by trusting the dial once it starts turning.

## 4. Frame 0 and the cover
- Frame 0: the wave is already sliding (the first derivative starts at t = 0), the pointer already turning.
- Cover: 0.5 s: the wave a few degrees into its first slide, the pointer between sin x and cos x, pill "y = sin x".
  Text "sin, −sin or cos?" at y 1590 (inside 240–1680). No spoiler.

## 5. Beats
| time | picture: what moves | on-screen words (≤ 7) | camera | sound | key colours |
|---|---|---|---|---|---|
| 0–1.3 | the wave slides left by π/2 and becomes cos x; the pointer turns 90° to "cos x"; pill y′ = cos x | "Each derivative: slide a quarter left" (0.3–2.6) | slow push in | tick as it lands | wave blue, pointer orange (VIVID), ghost sin x pale dashed blue |
| 1.3–2.6 | slides again: −sin x (the wave is now the ghost upside down); pointer to "−sin x"; pill y″ = −sin x | (same caption) | slow | tick | |
| 2.6–3.9 | again: −cos x; pill y‴ = −cos x | (no caption: the pill and dial carry it) | slow | tick | |
| 3.9–5.2 | again: sin x, the wave lands exactly on the ghost; pointer back at the top; pill y⁗ = sin x | "Four: back to sin x" | punch-in ×1.15 on the wave panel's centre (band 540, 400), landing at 5.2 | whoosh-in (0.35 s) + knock + music hit at 5.2 | |
| 5.2 | **A lights**; the ghost and wave flash together | | | | |
| 5.2–8.5 | zoom out; the wave's second derivative **draws itself** left to right as its mirror image across the x-axis, tagged "−sin x = only 2 derivatives (B)"; pill y″ = −y | "Two turns: y″ = −y" | fast zoom out, then hold | whoosh-out; whump as the mirror finishes | second-derivative wave orange |
| 8.5–9.3 | the dial fades; the panel rescales so ±4 fits (the y-axis shows marks 1 and 4; the camera stays still); the wave squeezes to sin 2x | "Twice as fast: sin 2x" | still | – | |
| 9.3–12.3 | two steps, each a quarter slide **and twice as tall**: sin 2x → 2 cos 2x → −4 sin 2x, each drawing itself; pill y′ = 2 cos 2x, then y″ = −4 sin 2x | "Each turn: ×2 taller" → "y″ = −4y" | still | tick per step | |
| 12.3–14.0 | hold; pill "y″ + 4y = 0" | "So y″ + 4y = 0" | gentle push in | – | |
| 14.0–17.0 | end card | "Each derivative: / a quarter turn. / Follow for more" | – | – | |
Answer at 5.2 s. After the answer: why two turns give −y (5.2–8.5), and why the faster wave gives −4y: 2 × 2, seen
(8.5–14.0). That is the caption's PYQ, named there only (F20).

## 6. Layout map (1080 × 1920)
| zone | y range (px) | what sits there |
|---|---|---|
| header | 96 – 440 | label, question, chips, nudge |
| picture band | 470 – 1500 | pill top centre (band y 22–110, "y⁗ = sin x" widest ≈ 10 chars at 52 px); wave panel x ∈ [−π, 2π] → band x 80–1000, centre band y 400, amplitude 1 → 150 px; dial: circle r 140 at band (540, 800) with labels at N "sin x", E "cos x", S "−sin x", W "−cos x" |
| caption | ~1540 – 1640 | |
- No separate function-name label (the pill and dial already say it; less to read in 0–5.2 s).
- Only the wave panel zooms (the punch-in ×1.15 about band (540, 400)): its ends go to 540 ± 460 × 1.15 = 11 … 1069,
  inside 0–1080; its peaks to 400 ± 150 × 1.15 = 228 … 572. The pill, the dial and its labels sit in an unzoomed layer.
- The dial's E and W labels at x = 540 ± (140 + 20) → "cos x" anchored start at 700, "−cos x" anchored end at 380: both
  inside 0–1080.
- 8.5 s on: the dial fades out and the wave panel rescales to fit ±4 (amplitude 1 → 60 px, so 4 → 240 px; panel centre
  band y 520): the tall wave stays inside 280–760; the y-axis carries marks "1" and "4". The camera doesn't move then.
- The trap tag sits above the orange mirror wave's first trough-free stretch, left of the panel centre (band ≈ 300, 230).

## 7. The story without words
A wave slides left a quarter of its length, four times, while a pointer clicks round a dial a quarter turn each time;
after the fourth it lands exactly on its starting shadow. Then a wave and its upside-down twin, then a faster wave whose
upside-down twin is four times as tall.

## 8. Honest numbers
- d/dx sin(x + kπ/2) = sin(x + (k + 1)π/2) (test, numerically at many x); the slide is exactly π/2 per derivative.
- (sin 2x)″ = −4 sin 2x (test); Q83 re-derived symbolically at several a, b.
- The tall wave is drawn at the true scale (4×), the panel rescaled with a visible y-axis "4" mark (F10: label scale).

## 9. Risks
- Sliding the wave left by π/2 looks the same as sliding it right by 3π/2: the ghost stays fixed so the slide direction
  reads, and the pill counts.
- Four similar slides in a row could feel repetitive: 1.3 s each, the dial and pill change every time, the 4th has a
  punch-in.
- The dial + wave + pill + caption is a lot of text: the dial labels are small (36 px) and the caption is short.
- Colour-blind: blue vs orange (distinguishable, tested).

## 10. Review
Independent agent, 2026-10-23: **fix first** (maths checked: the cycle, y″ = −y, (sin 2x)″ = −4 sin 2x, Q83).
- B1 pill "d/dx × n" reads as multiply and clashes with the 4 in −4y → **fixed**: the pill counts y′, y″, y‴, y⁗.
- B2 "That's NDA's y″ + 4y = 0" means nothing to a viewer and leans on F20 → **fixed**: "So y″ + 4y = 0"; the PYQ stays
  in the caption.
- B3 punch-in had no scale/centre and would crop the function name → **fixed**: ×1.15 about (540, 400), only the wave
  panel zooms; the name label is gone (I2); ends checked inside the frame.
- B4 8.5–11.5 said both "same scale" and "rescale + zoom out" → **fixed**: rescale with marks 1 and 4, camera still.
- I1 show the 4 as 2 × 2 → **taken**: sin 2x → 2 cos 2x → −4 sin 2x, each step a quarter slide and twice as tall.
- I2 too much text in 0–5.2 s → **taken**: no function-name label; captions only on beats 1 and 4.
- I3 name the trap → **taken**: the mirror wave is tagged "−sin x = only 2 derivatives (B)".
- I4 the second derivative should draw itself (F3) → **taken**.
- I5 whoosh on the punch-in (F15), cover y (F6), ghost not grey (F24) → **taken**: whoosh-in/out, cover at y 1590,
  ghost pale dashed blue.

**Changed while building (2026-10-23):** nothing on the layout tests (no overlaps, panel in frame on every frame). The
stills sheet and strip caught one fault: the trap tag sat on the waves' peaks at band y 228, so it moved to y 178, under
the pill. The pill reads "y⁗ = sin x" until 6.4 s (not 5.6) so it is up long enough to read. Music: `drive` came out at
−26 dB at this length (the bottom of the loudness range), so the reel uses `synthwave` (−20.8 dB). The fast steps morph
(slide + grow) rather than redraw.
