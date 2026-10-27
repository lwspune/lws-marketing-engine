# nda-maths-028-trig-lines storyboard

## 1. The idea
- One sentence: on a circle of radius 1, every trig ratio of θ is the length of a real line: sin θ and cos θ are the
  height and base of the small triangle; stretch that triangle until its base is 1 and its height becomes sin θ ÷ cos θ
  = tan θ, a piece of the line that **touches** the circle (hence "tangent"); the slant from the centre to it **cuts**
  the circle and is sec θ (hence "secant"); the same build against the line touching the top gives cot θ and cosec θ.
  Pythagoras on those triangles gives 1 + tan²θ = sec²θ and 1 + cot²θ = cosec²θ.
- End-card takeaway: "Trig ratios are / lengths on one circle." (7 words). Chapter: NDA MATHS · TRIGONOMETRY.
- Source: new backlog row W32, @official_neutron_and_numbers "This Visualisation Makes Trig Click" (1.1M views, 59×
  their typical reel: median of their 39 other recent reels 18.7k, read 2026-10-27). Theirs is a 45 s narrated 2D neon
  sketch. **Theirs draws cot and cosec wrongly** (cosec heads up-left of the centre, off θ's ray; cot sits left of the
  y-axis). Ours: the correct figure (cot θ and cosec θ end where θ's own ray meets the top touching line), a
  predict-first question, the **why** of tan (the similar-triangle stretch), both Pythagoras identities, real 3D with an
  orbit, and a live sweep where all six lengths change together with their numbers.
- Caption PYQ: NDA 2024 (II) Q79 (id `50d1cbe8-cb76-4d0d-86a0-7e61869cd845`): lim θ→π/2 (sec θ − tan θ) = ? → (B) 0.
  Re-derived: sec θ − tan θ = (1 − sin θ)/cos θ = cos θ/(1 + sin θ) → 0/2 = 0. The picture shows it: as θ grows the
  slant (sec) and the touching piece (tan) both grow but their gap shrinks (40°: 0.47, 62°: 0.25). Caption only (F20).
- Voice (founder's ask for this reel, 2026-10-27): Kokoro `af_heart` reads the question and each caption, only words
  on screen (F17, `onScreen` test). Rendered twice, voiced and silent (F13 says "No voice" for the house; this reel is the founder's explicit exception); the founder picks.

## 2. The viewer
- NDA aspirant (Class 11–12 or dropper), scrolling, often muted. Knows SOH-CAH-TOA (tan = opposite ÷ adjacent) and the
  identities by heart; has never seen tan θ as a length, nor why it is called "tangent".
- Likely answers: **A (the drop from P to the axis)**, the strong trap: "tan is the opposite side"; it is sin θ, the
  opposite side of a triangle whose adjacent side is cos θ, not 1. **C (the long slant)**: "tan is the slope, the
  sloping line"; it is sec θ. Right: **B (the piece of the right-hand touching line)**.

## 3. The question (frame 0)
- Header: "Circle of radius 1." (19 chars) / "Which line is tan θ?" (20 chars); label "NDA MATHS · TRIGONOMETRY".
- Options: chips "A", "B", "C" (w 150), each chip's letter and border in its line's colour and pulsing with it
  (review B2: mid-orbit the in-picture tags are hidden, the chips are not); in the picture each candidate line carries a pill tag of its letter in its
  colour: A = the drop P → M (green), B = the touching piece A → T on x = 1 (blue), C = the slant O → T (orange).
- Everything needed is on frame 0: the circle with "1" on its radius OP, the angle θ marked at the centre, the three
  tagged lines, the right-hand touching line drawn faint.
- Answerable in 2 s: by name (tangent = the line touching the circle), or by tan = opposite ÷ adjacent in the big
  triangle O-A-T whose adjacent side is the radius 1.

## 4. Frame 0 and the cover
- Frame 0: the figure (circle as a glossy tube on a thin glass disc, axes, θ = 40°, ray O → T, three tagged candidate
  lines) seen front-on and close (×1.15); the orbit is starting and tag A is pulsing (F5).
- Tags are HTML placed with `project()`; they fade out as the view turns past ±50° and back in by the front (they would
  bunch up edge-on), so frame 0 and t = 3.0 show all three.
- Cover: t = 3.05 (orbit done, front view, the three tags (they fade from 3.1), the opening caption gone): nothing answered (B not lit, no labels but
  "1" and "θ", no formula). Cover text "Every trig ratio is a real line" at y 1590 (inside the 3:4 crop 240–1680).

## 5. Beats
World: the circle's centre O at the origin, radius 1 (world units = the ratios' values), in the plane z = 0 facing +z.
θ = 40° until the sweep. P = (cos θ, sin θ), M = (cos θ, 0), A = (1, 0), T = (1, tan θ), B = (0, 1),
C = (cot θ, 1). O, P, T, C lie on one ray. sec θ = OT, cosec θ = OC: on the same ray, so they are drawn as two parallel
lanes 0.035 apart (sec on the clockwise side, cosec on the anticlockwise side), never one rod over the other.

| time | picture: what moves | on-screen words (≤ 7) | camera | sound | key colours |
|---|---|---|---|---|---|
| 0–3.0 | full orbit; the three candidates pulse in turn (A 0.3, B 1.2, C 2.1) | header question; caption "Every trig ratio is a real line" (0.3–3.0) | orbit 360°, elevation 20° → 6°, ×1.15, front by 3.0 | soft tap on each pulse | circle ink; A green, B blue, C orange |
| 3.0–5.3 | tags fade; B and C dim to 20 %; the small triangle O-M-P fills (a thin translucent slab); its height glows green with "sin θ" (3.2), its base glows cyan with "cos θ" (3.9) | "Height sin θ, base cos θ" (3.1–5.3) | slow push ×1.15 → ×1.25 on the triangle | click on each glow | sin green, cos cyan |
| 5.3–6.9 | the triangle grows from O (scale 1 → 1/cos θ): its base reaches the circle's edge (label "1"), its green height slides out to x = 1 and grows to the touching line's piece; a live pill "× 1/cos θ = 1.00 → 1.31" rides the base's end | "Stretch it until the base is 1" (5.3–7.2) | zoom out ×1.25 → ×1.1 (5.3–6.8) | shimmer under the growth | |
| 7.2 | **B lights** (line and chip): the grown height turns blue, "tan θ" beside it; the formula line "tan θ = sin θ ÷ cos θ" (7.4); the original sin line returns (7.6) | "So the height is tan θ" (7.2–8.9) | punch-in ×1.1 → ×1.2 (6.85–7.2) | whoosh-in + thunk + music hit | tan blue |
| 8.9–11.4 | the right touching line x = 1 brightens and runs long (y −0.6 → 2); a ring pulses where it touches the circle at A | "Tangent means touching. It touches here." (8.9–11.4) | fast zoom out ×1.2 → ×1.1 (8.9–9.4) | whoosh-out; ping on the touch | |
| 11.4–13.8 | the slant O → T lights orange, "sec θ"; a flash where it crosses the circle at P; triangle O-A-T outlines and the formula line becomes "1 + tan²θ = sec²θ" (12.6) | "Secant means cutting. It cuts through." (11.4–13.8) | still | snap at the cut; click on the formula | sec orange |
| 13.8–15.2 | the top touching line y = 1 draws left → right; a ring pulses at B where it touches | "Same trick at the top" (13.8–15.2) | slow drift of the target up (+0.15) | ping | |
| 15.2–18.0 | θ's ray extends to meet the top line; the top piece lights violet, "cot θ" (15.4); an arc marks θ again where the ray meets the top line (alternate angles), so the top piece = 1 ÷ tan θ (15.8); the slant to it lights pink in its own lane, "cosec θ" (16.3); flash at P; formula "1 + cot²θ = cosec²θ" (16.9) | "Cot θ touches. Cosec θ cuts." (15.2–18.0) | still | ping, snap, click | cot violet, cosec pink |
| 18.0–24.0 | θ sweeps 40° → 62° (18.4–20.2) → 28° (20.4–22.6) → 40° (22.8–23.8); all six lines move (sin and cos labels hide: the readouts carry them); the formula line fades and six live readouts count (two rows, bottom of the band) | "Turn θ: all six lines move" (18.0–20.6); "Six ratios. Six real lines." (21.0–24.0) | fast zoom out ×1.1 → ×0.9, target to the figure's middle (18.0–18.6), whoosh | a tick every 2° of θ, pitch following θ | the six colours |
| 24.0–27.0 | end card (its first two lines voiced from 24.5) | "Trig ratios are / lengths on one circle. / Follow for more" | – | – | |

Answer at 7.2 s. After it: why the name (touching, cutting), both identities, the top pair, then the live sweep with
numbers. Something changes every second.

Voice (af_heart, measured 2026-10-27): question 2.84 s from 0.15; then each caption's words starting 0.05 s after the
caption: 1.96, 1.66, 1.34, 2.25, 2.02, 1.14, 2.57, 2.00, 2.20 s; the end card's first two lines (2.24 s) from 24.6.
Every line ends before its caption leaves (tested).

## 6. Layout map (1080 × 1920)
| zone | y range (px) | what sits there, per beat |
|---|---|---|
| header: label, 2 question lines (54 px), chips, "comment your guess" | 96 – 440 | fixed all reel |
| 3D band | 480 – 1500 | the figure; every label HTML placed with `project()` |
| formula line (7.4–18.0) | 515 – 575 | centred, 52 px, at the top of the band (the circle's bottom reaches ≈ 1435 in the push-ins, so not below it); widest "1 + cot²θ = cosec²θ" ≈ 500 px |
| readouts (18.0–24.0) | 1395 – 1490 | two rows of three, 38 px, each "cosec 1.56" in its colour; widest "cosec 2.13" ≈ 200 px in a 300 px column |
| caption | ~1540 – 1640 | widest "Tangent means touching. It touches here." (40 chars at 48 px ≈ 1000 px): size 46 |
| nothing important | > 1680; cover text inside 240–1680 | |
- Scale: ×1.15 → ≈ 342 px per unit; target (0.15, 0.05): the circle spans x 147–831, y 665–1349; T's label "tan θ"
  right of x = 1 ends ≈ 955. In the sweep (×0.9, target (0.42, 0.42)): T at 62° (y 1.88) lands ≈ 600, C at 28°
  (x 1.88) ≈ 930, the circle's bottom ≈ 1370: everything inside the band with ≥ 20 px to spare (tested every frame).
- Label sides: "sin θ" left of its line (inside the triangle, the right side is the circle's narrow edge); "cos θ" below
  the axis; "tan θ" right of x = 1 (outside the circle, always free); "sec θ" on the clockwise side of the ray at 0.55
  of its length; "cosec θ" on the anticlockwise side at 0.8 of its length; "cot θ" above y = 1 at its middle; "1" on
  the radius OP (anticlockwise side) until the stretch, then under OA. "θ" right of the arc at O.
- Every visible label inside the band, none overlapping another, on every frame (tested, `labelsAt` + `labelBox`).

## 7. The story without words
A glossy ring on glass turns once in the light; three coloured lines on it pulse in turn. The small triangle under the
radius fills and grows outward from the centre until its base reaches the circle's edge; its green side, now standing
on the line that touches the circle, turns blue. That touching line glows long, with a ring where it touches; the slant
from the centre to its top lights orange and flashes where it pierces the circle. A second touching line draws along
the top; the same ray reaches it, giving a violet piece and a pink slant. Then the angle swings up and down and all six
coloured lines stretch and shrink together while six numbers count. The words only name what the picture shows.

## 8. Honest numbers
- Every point is computed from θ in one function (`figure(θ)`) used by the picture and the tests. Tests re-derive:
  the stretch maps M → A and P → T exactly at scale 1/cos θ (so AT = tan θ); OT = sec θ, OC = cosec θ, BC = cot θ;
  O, P, T, C collinear; T on x = 1 and C on y = 1; 1 + tan² = sec², 1 + cot² = cosec² at every sweep frame.
- Readouts: two decimals of the true value at that frame's θ (θ = 40°: 0.64, 0.77, 0.84, 1.31, 1.19, 1.56); the scale
  pill "× 1.31" = 1/cos 40° = 1.305.
- The PYQ: (1 − sin θ)/cos θ → 0 as θ → 90° (tested numerically), answer B.
- θ = 40° is a drawing choice (all six lines readable); the sweep stays within 28°–62° so T and C stay on screen
  (tan 62° = cot 28° = 1.88).

## 9. Risks
- sec and cosec on the same ray: two lanes, labels on opposite sides, never a single rod (tested: lane offset).
- Labels crowding near P in the sweep (sin, sec, cosec): tested every frame; a label that can't fit fades rather than
  overlaps.
- Edge-on orbit: the flat figure becomes a line at 90°; the glass disc and tube give it body; the tags fade there.
- Colour-blind: six colours; every pair that touches (sin–cos, sin–sec, cos–sec, sec–cosec, tan–sec, cot–cosec) must
  pass `distinguishable()`, else a colour is swapped; every line also carries its name.
- Small text: labels 38–44 px on white pills.
- The voice repeating text: only on-screen words (tested); the silent version must work on its own (F17).
- Disk: one render at a time; temp cleared at the start.

## 10. Review
Reviewed by an independent agent, 2026-10-27: **fix first** (maths checked: all six values at 40°, the pill 1.31, sec − tan
0.47 / 0.25, tan 62° = cot 28° = 1.881, sec 62° = cosec 28° = 2.130, O-P-T-C collinear, both identities, the PYQ → B,
every caption ≤ 7 words).
- B1 27.6 s breaks F18's 25 s → **declined, trimmed**: F18 allows "up to ~45 s for a 'why' build that never stands
  still", and this is one (the why of tan, sec, cot, cosec, two identities); trimmed to 27.0 s (end card 24.0–27.0).
- B2 B and C pulse while their tags are hidden mid-orbit → **fixed**: the chips carry each line's colour and pulse with it.
- B3 no graph drawing itself (F3) → **declined**: the six live lengths are the moving picture and the six readouts the
  live numbers; a θ-vs-value trace would crowd the readout band. Same as 027.
- B4 the zoom out ran into the punch-in; the sweep zoom started from the wrong value → **fixed**: zoom out ends 6.8,
  punch-in 6.85–7.2, the sweep zoom from ×1.1, fast, with a whoosh.
- B5 voice: house rule says none, founder preferred parler-Mary → **declined**: the founder asked for af_heart for this
  reel (2026-10-27); the silent cut is made too and the founder picks. The F13 citation stands (F13: "No voice").
- I1 scale pill → **taken** ("× 1/cos θ = 1.31"). I2 strike chips A / C early → **declined**: the chips step back at the
  answer as on every reel; the caption kit names both traps. I3 why BC = cot θ → **taken**: θ marked at the top
  meeting point (alternate angles), so the top piece = 1 ÷ tan θ. I4 no point letters → **kept** (none on screen).
  I5 cover clash → **taken** (cover 3.05, tags fade from 3.1).
- Layout: formula line vs the circle's bottom → **fixed** (moved to the top of the band); sin / cos labels hidden in the
  sweep → **taken**; cosec label vs T and cot → tested every frame; the top line runs to x = 2.1 (past C at 1.88) →
  **fixed**.
