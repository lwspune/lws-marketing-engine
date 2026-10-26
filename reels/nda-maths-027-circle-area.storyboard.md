# nda-maths-027-circle-area storyboard

## 1. The idea
- One sentence: a circle is made of thin rings; cut them all at the top and straighten each one (it keeps its length)
  and they lie flat as a triangle with base 2πr (the rim) and height r (the bottom radius, which never moves), so the
  area is ½ × 2πr × r = πr², exactly half the 2πr × r rectangle; adding up those rings is what ∫₀ʳ 2πx dx does.
- End-card takeaway: "A circle is a rolled-up triangle." (6 words). Chapter: NDA MATHS · AREA.
- Source: remake-backlog W29, @proof.motion "Area = πr², why?" (126k views, 30× their typical reel, studied
  2026-10-26, L70), score 9/10. Ours adds: real 3D rings, motion from frame 0 (theirs opens on 1 s of blank screen), the
  unrolling done by 7.4 s (theirs 8–11 s), a predict-first question (F4), the trap shown wrong (the rectangle), a live
  "area so far" count, the integration link and a roll-back to the circle.
- Caption PYQ: NDA 2019 (I) Q76 (id `58e09c79-09e4-41e8-8f5b-e75916e4ad87`): f(r) = perimeter ÷ area of a circle of
  radius r; f(1) + f(2) = ? → (c) 3. Re-derived: f(r) = 2πr ÷ πr² = 2/r, so f(1) + f(2) = 2 + 1 = 3. The picture shows
  it: the triangle's base is the perimeter and its area is ½ × perimeter × r, so perimeter ÷ area = 2/r. Caption only (F20).

## 2. The viewer
- NDA aspirant (Class 11–12 or dropper), scrolling, often muted. Has used A = πr² since Class 7; has never been shown
  why. Knows ½ × base × height. Knows ∫ as "area under a curve" but not as "adding thin pieces".
- Likely answers: **A rectangle** (the strong trap: "slices of a circle make a rectangle", from the pizza-slice proof
  some have seen, and from picturing the rings as equal strips); **C semicircle** (weak: "a circle cut open stays
  round"). Right: **B triangle** (the rings get shorter towards the centre, down to nothing).

## 3. The question (frame 0)
- Header lines: "Unroll each ring, stack them." (29 chars) / "What shape do they make?" (24 chars).
- Options: A rectangle · B triangle · C semicircle (chips, w 270: "C semicircle" touched the edge at 240).
- Everything needed is on frame 0: the disc, already made of 10 visible rings in alternating colours (the 3D band), and
  the question (the header). The viewer needs no number.
- Answerable in 2 s: the rings are visibly different lengths (big outside, tiny in the middle), so straightened and
  stacked they must taper to a point.

## 4. Frame 0 and the cover
- Frame 0: the ringed disc (a thick 3D puck, 0.45 deep) seen from 22° above, close (×2.1), the orbit just starting; a
  ripple is already lifting the innermost ring towards the camera (F5: moving on frame 0).
- Cover: t = 0.5 (the caption is up). Shows the closed disc and the question: nothing unrolled, so no spoiler (tested:
  s(0.5) = 0, no label but the question). Cover text "Area = πr². Here's why." at y 1590 (inside the 3:4 crop
  240–1680); the disc sits mid-band.

## 5. Beats
World: the disc's centre at the origin, radius R = 1.6, 10 rings each 0.16 wide, depth 0.45, facing +z (the camera).
Unrolling (s from 0 to 1): a point at radius ρ and angle φ from the bottom (φ ∈ [−π, π]; the cut is at the top,
φ = ±π) goes to ρ · ( sin(aφ)/a , (s − cos(aφ))/a ) with a = 1 − s, and to ρ · (φ, −1) at s = 1. Every ring keeps its
length 2πρ at every s (tested); every ring is a scaled copy of the others about the centre, which lies inside it, so no
two ever cross (tested); the bottom radius (φ = 0) stays at (0, −ρ) for every s (tested); at s = 1 the disc is exactly
the triangle |x| ≤ π·(−y), −R ≤ y ≤ 0: base 2πR at y = −R, apex at the centre, and the cut's two edges are its slanted
sides (tested).

| time | picture: what moves | on-screen words (≤ 7) | camera | sound | key colours (VIVID / real) |
|---|---|---|---|---|---|
| 0–3.0 | the disc turns in a full tilted orbit; a ripple lifts each ring 0.08 towards the camera in turn, centre → rim, twice | "Area = πr². Here's why." (0.3–3.0) | orbit 360°, elevation 22° → 12°, ×2.1, front by 3.0 | a soft tap per ring as it lifts | rings cyan / blue alternating |
| 3.0–4.4 | a red line draws down the bottom radius, centre → rim (3.0–3.5), "r" beside it (3.3–4.4); a white slit runs down the top radius, rim → centre (3.5–4.0) | "Cut every ring at the top" (3.0–4.4) | slow push ×2.1 → ×2.2 | snap at 4.0 (the cut) | radius red; slit white glow |
| 4.4–7.4 | the rings open at the slit and straighten (s 0 → 1, eased), the outer ones the longest; the slit's two edges swing down to become the slanted sides; the red radius stays exactly where it is | "Lay every ring out flat" (4.6–7.0) | zoom out ×2.2 → ×1.0 while the target slides down to the triangle's middle (4.4–7.05) | shimmer under the unrolling (4.4) | |
| 7.4 | **B lights**; the triangle is complete | | punch-in ×1.0 → ×1.08 (7.05–7.4) | whoosh-in + thunk + music hit | |
| 7.4–8.8 | the trap: a dashed muted rectangle 2πR × R draws round the triangle; the triangle fills exactly half of it | "Not a rectangle: inner rings shrink" (7.4–8.8) | fast zoom out ×1.08 → ×1.0 (8.0–8.5) | whoosh-out | rectangle muted, dashed |
| 8.8–10.8 | the rectangle fades; the bottom strip (the old rim) glows orange; an orange brace grows under the base with "2πr" | "Bottom strip = the rim: 2πr" (8.8–10.8) | still | tap as the brace lands | rim + brace orange |
| 10.8–12.8 | the red radius glows and "r" returns beside it: it is the triangle's height | "Height: the radius that never moved" (10.8–12.8) | push-in ×1.0 → ×1.5 on the middle (10.8–11.5); the tips leave the frame on purpose | tap | height red |
| 12.8–16.0 | the formula line under the triangle builds: "½ × 2πr × r", then the ½ and the 2 are struck through (hand-drawn), then "= πr²" (15.2) | "Triangle: ½ × base × height" (12.8–16.0) | fast zoom out ×1.5 → ×1.0 (12.8–13.4) | whoosh-out; a click per term; whump on πr² | πr² in result green |
| 16.0–19.0 | the rings light one by one from the apex to the base; the lit ring's strip glows and carries "2πx"; a readout counts "area so far = π(0.1r)²" … "π(0.9r)²" → "πr²"; at 18.6 the formula line becomes "∫₀ʳ 2πx dx = πr²" | "Adding thin rings = integration" (16.0–19.0) | slow push ×1.0 → ×1.06 | a tick per ring, rising in pitch | lit ring: white glow on its own colour |
| 19.0–21.2 | the triangle rolls back up into the circle (s 1 → 0); the red radius stays put; the formula stays | "Same rings, same area" (19.2–21.2) | zoom in ×1.06 → ×2.1, target back to the centre | music swell (slow: no whoosh) | |
| 21.2–24.2 | end card | "A circle is a / rolled-up triangle. / Follow for more" | – | – | |

Answer at 7.4 s. What keeps them after the answer: why not a rectangle (7.4), then 2πr, r and ½ × 2πr × r (8.8–16.0),
then the live sum (16.0–19.0) and the roll-back. Something moves on every frame.

## 6. Layout map (1080 × 1920)
| zone | y range (px) | what sits there, per beat |
|---|---|---|
| header: "NDA MATHS · AREA", question, chips, "comment your guess" | 96 – 440 | fixed all reel |
| readout (16.0–19.0 only) | 590 – 650 | top-left pill, x 60, 44 px: "area so far = π(0.9r)²" (widest, 22 chars ≈ 520 px) |
| 3D band | 560 – 1500 | the disc, then the triangle; "r", "2πr", "2πx" are HTML placed with `project()` |
| formula line | 1330 – 1420 | HTML, centred, 56 px; from 12.8 s; the widest "∫₀ʳ 2πx dx = πr²" ≈ 520 px |
| caption | ~1540 – 1640 | widest: "Not a rectangle: inner rings shrink" (35 chars at 50 px ≈ 900 px) fits 960 |
| nothing important | > 1680; the cover text inside 240–1680 | |
- Scale: at ×1.0 the base 2πR = 10.05 units is ≈ 860 px (≈ 86 px a unit); the triangle ≈ 137 px tall. Disc at ×2.1
  ≈ 580 px across. Every frame of the unroll (4.4–8.5), the sweep (16.0–19.0) and the roll-back (19.0–21.2) keeps the
  whole shape inside the band with ≥ 20 px to spare (tested on every frame); the height push-in (10.8–12.8) is the one
  deliberate crop (the tips), and there the red radius, "r" and the strips around it stay inside (tested).
- "r" (3.3–4.4): right of the red radius, at its middle, on a white pill (the disc's front face around it is cyan/blue).
  "r" (10.8–12.8): the same side, at the height's middle. "2πr": centred under the brace. "2πx": just past the right
  tip of the lit strip, which moves down and out as the sweep goes on (tested inside, never on the readout).
- Labels hidden during the orbit (0–3.0) and the roll-back (19.0–21.2). Every visible label inside the band and no two
  overlapping, on every frame (tested).

## 7. The story without words
A thick ringed disc turns in the light, its rings rippling. A red line marks the radius at the bottom; a bright slit
cuts the top. The rings fall open at the slit and straighten, outer ones long, inner ones short, stacking into a flat
triangle as wide as the old rim, while the red radius never moves. A dashed rectangle round it shows the triangle is
half of it. The bottom strip glows (it was the rim), the camera closes in on the red line (now the height), the
rings light one after another from the tip down while a count of the area grows, and the triangle rolls back into the
disc. The words only name what the picture did: 2πr, r, ½ × base × height, πr².

## 8. Honest numbers
- R, ring widths and the unrolling map: one formula (§5) used by the picture and the tests. Tests: each ring's length
  is 2πρ at s = 0, 0.5, 1 (sampled, within 0.5 %); the bottom radius fixed for every s; at s = 1 x = ρφ, y = −ρ (exact
  triangle; base 2πR, height R); no two rings cross at any s (sampled); area at s = 1 equals πR² (shoelace) and half
  the rectangle 2πR × R.
- The readout: after k of 10 rings from the apex, x = k·r/10 and the area so far is π(x)² (the top triangle of height
  x), tested against the shoelace area of those strips.
- The formula line: ½ × 2πr × r = πr² and ∫₀ʳ 2πx dx = πr² (tested numerically for r = 1.6).
- The PYQ: f(r) = 2/r, f(1) + f(2) = 3 (tested).
- The 10 rings are a drawing choice (thick enough to see); the triangle is exact for any number of rings, because a
  ring of width w straightens into a trapezoid of the same area (π(ρ₁² − ρ₀²) = ½(2πρ₀ + 2πρ₁)(ρ₁ − ρ₀)), tested.

## 9. Risks
- The triangle is very flat (137 × 860 px): its true shape (height r, base 2πr ≈ 6.3 r). The 12° tilt shows its
  depth, and the height beat pushes in ×1.5. Not stretched (F10).
- The unroll's open arms near the frame edge: the zoom-out is set so the widest point (the final base) fits; tested
  every frame.
- Rings z-fighting where neighbours touch: each band is its own mesh; bands never overlap (tested: no crossing).
- The ½ and 2 strike: `@remotion/rough-notation` with a fixed seed (else every render differs).
- Colour-blind: cyan/blue rings, orange rim, red radius: every pair `distinguishable()` (tested); the slit is white
  glow and the trap rectangle muted + dashed (never a colour-only cue).
- Disk ≈ 2 GB free: one render at a time; temp cleared at start.

## 10. Review
Reviewed by an independent agent, 2026-10-26: **fix first** (maths checked: the map at s = 0 and s → 1, ring length
2πρ at every s, no crossing, base 10.05 and height 1.6, the trapezoid identity, ½ × 2πr × r, ∫₀ʳ 2πx dx, f = 2/r → 3).
- B1 the height drawn as "the same line as the cut" is false: the cut becomes the slanted sides; the height is the
  bottom radius (φ = 0), which never moves → **fixed**: the red radius is the bottom one, marked from 3.0, still
  through the unroll, and it becomes the height (beat 10.8–12.8); the cut is a white slit at the top.
- B2 "r" timing contradicted the layout map → **fixed**: "r" 3.3–4.4, then 10.8–12.8.
- B3 at ×1.08 the base left ~32 px, and the open arms mid-unroll nearly touch the edge → **fixed**: base ≈ 860 px at
  ×1.0; the whole shape tested inside the band on every frame of the unroll, sweep and roll-back.
- I1 no live number (F3) → **taken**: "2πx" on the lit strip and an "area so far = π(0.kr)²" readout counting to πr².
- I2 too flat to read the height → **taken**: push-in ×1.5 on the middle in the height beat.
- I3 the trap never shown wrong → **taken**: the dashed 2πR × R rectangle the triangle fills half of, "Not a
  rectangle: inner rings shrink" (7.4–8.8); also in the caption kit. Reel now 24.2 s (≤ 25).
- I4 two questions on frame 0 → **taken**: the caption is "Area = πr². Here's why."
- I5 vague question; cover before its text → **taken**: "Unroll each ring, stack them."; cover at 0.5 s.
- Layout: the header's top is outside the grid's 3:4 crop → **declined**: the house header on every reel; the cover
  text, the part the grid shows, sits inside the crop.
- Built: the radius was pink; the colour test found pink and the blue rings merge for colour-blind viewers
  (`distinguishable`), so the radius is VIVID red (passes against cyan, blue and orange).
