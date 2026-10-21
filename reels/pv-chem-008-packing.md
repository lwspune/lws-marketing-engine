# @pyqvault_ · Chemistry, visualised #8: stack oranges in a box: the best you can fill it?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 12 (MHT-CET) · **Topic:** remake-backlog **C14**, topic score
**7/10** (F21), our own idea from PYQ Vault's MHT-CET Solid State notes (49 PYQs on packing and voids) · **Framework
v1.13** · **Background:** dark (L22: chemistry alternates, #7 was white) · **Colours:** F24, VIVID.lab (oranges orange,
box edges cyan, the winning bar green); copper and the wooden tray keep their real look · **Music:** `cinematic` (L34: a
build-up reveal; tied fewest), hit on the answer · **Orbit:** 360° opening (F22) · **Caption:** without the answer (F6) ·
**Voice:** Kokoro `af_heart` (F23; silent render alongside) · **Length:** 20.1 s · **Made in Remotion**
(`remotion/src/PvChem008.tsx`, geometry + timing + sound `src/lib/pc008.ts` with its beat table, tests
`tests/pc008.test.ts`).

**Syllabus:** Solid State is in MHT-CET's Class 12 chemistry; it's off the rationalised CBSE syllabus and NEET / JEE Main,
so the caption names MHT-CET only.

## The chemistry (checked, and tested)

- One cubic unit cell, edge a. Simple cubic: 8 corners, a = 2r, π/6 = **52.4%**. Body-centred: + the centre, a = 4r/√3,
  √3π/8 = **68%**. Face-centred: + 6 face centres, a = 2√2 r, π/(3√2) = **74%**. Answer **C**.
- The live "% filled" is the real share of the box on every frame: each orange is cut exactly at the box's faces (1/8 of a
  corner one inside, ½ of a face one, all of the centre one; every radius ≤ a/2, tested), and between stackings the radii
  change without any two oranges overlapping (tested on every frame). So the number dips for a moment while the corners
  shrink before the next orange grows: that's honest geometry. The bars count up only once each stacking has settled.
- At each settled stacking the oranges touch: along an edge, the body diagonal, a face diagonal (tested).
- The fruit-seller's pyramid (9 + 4 + 1) is face-centred stacking: each orange touches its neighbours, layers d/√2 apart
  (tested). Copper and gold are face-centred metals (CET notes). "74% is as tight as it gets" is Kepler's conjecture,
  proved (Hales, 1998).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–3.25 s | question + A/B/C; the camera goes once round the box; eight oranges drop into its corners | **CHEMISTRY, VISUALISED #8 · Stack oranges in a box. The best you can fill it?** A 52% · B 68% · C 74% |
| 3.25–5.7 s | the parts outside the box fade to ghosts; the cut parts show as slices; 52.4% | *Straight rows: 52% filled* |
| 5.7–8.1 s | the corners shrink, one grows in the middle; 68.0% | *One in the middle: 68%* |
| 8.1–9.5 s | the middle one shrinks away, six grow on the faces; 74.0% | *One on each face* |
| 9.5 s | punch-in; **C 74%** lights; the face-centred bar turns green | *74%: the best way to stack* |
| 12.1 s | the box fades; a fruit-seller's pyramid builds on a wooden tray | *The fruit-seller's pyramid is 74%* |
| 15.1 s | the pyramid turns copper | *Copper and gold atoms stack this way* |
| 17.6–20.1 s | end card | Simple 52% · body-centred 68% · face-centred 74% · **74% is as tight as it gets** · Follow for #9 · **pyqvault.com** |

## Camera (F9, F22) and sound (F14–F16)

- The 360° orbit from frame 0, back at the three-quarter view by 2.8 s → slow push through the stackings → **punch-in landing
  on 74%** (whoosh) → quick zoom out for the pyramid (whoosh) → slow push as it turns copper.
- A soft thud as each orange lands (8 in the box, 14 in the pyramid). Growing and shrinking is silent.

## Made with the storyboard steps

Beat table at the top of `src/lib/pc008.ts`. Measuring the voice first lengthened the stackings (the voice reads "52%"
in full): the answer moved from 8.4 s to 9.5 s. The stills sheet caught hollow-looking cut oranges (now flat-coloured
slices), oranges dropping into the question area, a half-filled bar label ("15.1%"), muddy ghosts on the dark board and a
two-line caption.

## Files

`pv-chem-008-packing-voice.mp4` (voiced, in the manifest) and `pv-chem-008-packing.mp4` (silent) · cover
`pv-chem-008-packing-cover.png` (4.0 s, simple cubic, before the answer) · `pv-chem-008-packing.post.json` · strip
`pv-chem-008-strip.png`. Re-make: `cd remotion && npm run music:pc008 && npm run voice:pc008 && npm run mix:pc008 && npm
run render:pc008 && npm run render:pc008v && npm run cover:pc008`.
