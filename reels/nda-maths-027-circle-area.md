# @lws.pune · 027, Why? #15: unroll each ring of a circle and stack them. What shape? (why area = πr²)

**Handle:** @lws.pune (project `pyq-vault`, post slug `nda-maths-027-circle-area`) · **Series:** Why? #15 (026, the
seesaw, takes #14) · **Storyboard:** [nda-maths-027-circle-area.storyboard.md](nda-maths-027-circle-area.storyboard.md),
reviewed by an independent agent before any code (F31; 3 blockers fixed, 5 improvements taken) · **NDA link:** NDA 2019
(I) Maths Q76 (question id `58e09c79-09e4-41e8-8f5b-e75916e4ad87`), named in the caption · **Proven idea:**
remake-backlog W29, @proof.motion's "Area = πr², why?" ([reel](https://www.instagram.com/reel/DcVE1Qxqr7-/), 126k views,
30× their typical reel; lesson L70); topic score 9/10. Their idea, our picture and words: real 3D rings, moving from
frame 0, a predict-first question, the trap shown wrong, a live area count and the integration link · Made with
`lwspune-framework.md` v1.10 (3D, F34) · **Look:** white board; a thick 3D disc of 10 rings in VIVID cyan / blue, the
rim orange, the bottom radius red (colour-blind checked) · **Music:** `cinematic` · **Length:** 24.2 s · **Made in
Remotion 3D** (`remotion/src/Reel027.tsx`; the unrolling map, camera, labels and sound in `src/lib/reel027.ts`; tests in
`tests/reel027.test.ts`).

## The maths (checked, and tested)

- Cut every ring at the top and straighten it, keeping its length. A ring at radius ρ is 2πρ long, so the rim is the
  longest strip (2πr) and the strips shrink to nothing at the centre: stacked, they make a **triangle → B**, base 2πr,
  height r. Area = ½ × 2πr × r = **πr²**.
- **The picture is exact, not a sketch.** Each point (ρ, φ) of the disc moves along one formula: every ring bends to an
  arc of radius ρ/(1 − s) through its bottom point, so it keeps its length at every moment, and at s = 1 it lies flat at
  height −ρ (tested). The rings are scaled copies of one another about the centre, so they never cross (tested). The
  bottom radius never moves: it becomes the height (tested). A ring of width w becomes a trapezoid of exactly its own
  area, so 10 rings make the exact triangle, area πr², half the 2πr × r rectangle (tested by the shoelace formula).
- The live count: after the top n of 10 rings, x = n·r/10 and the area so far is π(x)², the small triangle on top
  (tested against the strips' own area). ∫₀ʳ 2πx dx = πr² (tested numerically).
- **NDA 2019 (I) Q76:** "For r > 0, f(r) is the ratio of perimeter to area of a circle of radius r. Then f(1) + f(2) is
  equal to" → f(r) = 2πr ÷ πr² = 2/r, so f(1) + f(2) = 2 + 1 = **3 → (c)** (tested). Matches the bank. The picture shows
  it: the triangle's area is ½ × perimeter × r, so perimeter ÷ area = 2/r.
- **Traps:** A rectangle (picturing every strip the same length; the dashed 2πr × r rectangle shows the triangle fills
  only half of it); C semicircle (a cut circle "stays round").

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | a thick ringed disc, a ripple already lifting the inner ring | **NDA MATHS · AREA · Unroll each ring, stack them. What shape do they make?** A rectangle · B triangle · C semicircle |
| 0–3.0 s | a tilted 360° orbit; the ripple runs centre → rim twice | *Area = πr². Here's why.* |
| 3.0–4.4 s | a red line draws the bottom radius ("r"); a white slit cuts the top | *Cut every ring at the top* |
| 4.4–7.4 s | the rings open at the slit and straighten into a triangle while the camera pulls back; the red radius stays put | *Lay every ring out flat* |
| 7.4 s | punch-in · **B triangle** lights | |
| 7.4–8.8 s | a dashed 2πr × r rectangle draws round it; its empty halves shaded | *Not a rectangle: inner rings shrink* |
| 8.8–10.8 s | the bottom strip turns orange; a brace "2πr" under it | *Bottom strip = the rim: 2πr* |
| 10.8–12.8 s | push-in on the red radius, "r" | *Height: the radius that never moved* |
| 12.8–16.0 s | "Area = ½ × 2πr × r", the ½ and the 2 struck through, "= πr²" | *Triangle: ½ × base × height* |
| 16.0–19.0 s | the rings fade back, then return one by one from the apex, "2π(0.6r)" on the newest; "area so far = π(0.6r)²" → "area = πr²"; the line becomes "∫₀ʳ 2πx dx = πr²" | *Adding thin rings = integration* |
| 19.0–21.2 s | the triangle rolls back up into the disc, its orange rim back on the outside | *Same rings, same area* |
| 21.2–24.2 s | end card | A circle is a rolled-up triangle. **Follow for more** |

**Cover:** 0.5 s (the closed disc mid-orbit, nothing unrolled), "Area = πr². Here's why.".

## Sound (F14–F16)

A soft tap per ring as the ripple lifts it, a tap as the radius is drawn, a snap as the slit finishes the cut, a
shimmer under the unrolling, a knock on the answer, taps as the brace lands and the height glows, a click per formula
term and on the strike, a whump on πr², a rising click per ring in the sweep, a tap on the ∫ line; whooshes on the fast
zooms only. Effects ~9 dB under the music, peak −3.5 dB.

## Files

- `nda-maths-027-circle-area.mp4` · `nda-maths-027-circle-area-cover.png` · `nda-maths-027-strip.png`
- Re-make: `cd remotion && npm test && npm run music:027 && npm run mix:027 && npm run render:027 && npm run cover:027`

## Before you post (founder)

- [ ] Watch it once on the phone: "r", "2πr", the formula and the area count readable
- [ ] The answer (B triangle) and Q76's working match this kit
- [ ] Cover chosen in the upload screen
