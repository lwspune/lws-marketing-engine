# @pyqvault_ · Chemistry, visualised #13: add NaOH to iron(III) chloride. The cloud is white, blue or rust-brown?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 12 · **Topic:** idea **C49** ("Hydroxide clouds", score
52/100; the third F39 share test, 2026-10-26) · **Hook:** Pick one · **Opening:** close on a dropper over the aluminium tube,
a drop already falling; a white cloud at 0.08 s, then copper's blue and iron(II)'s dirty green as the camera follows the
dropper (F37) · **Second hook:** none · **Loop:** yes, a rewind to frame 0 (F27) · **F39 (made to send), test 3 of 3:** the
payoff is the salt-analysis table, every ion with its hydroxide and colour, held still for 1.8 s as a cheat sheet; the
caption lists it with iron(III) as "?" and asks to send it to a lab partner · **After the answer:** more NaOH into the
aluminium tube and its white cloud dissolves (amphoteric) · **Framework v1.34** · **Look:** full frame (F35) on the dark
set, a rack of test tubes (as Chemistry #12) · **Music:** `synthwave` (full from frame 0; `music.seamless`), hits on the answer
(4.6 s) and the cheat sheet (8.3 s) · **Voice:** none · **Length:** 12.1 s · **Made in Remotion**
(`remotion/src/PvChem013.tsx`; timeline, chemistry and every text's place in `src/lib/pc013.ts`; tests in
`tests/pc013.test.ts`).

## The chemistry (checked, and tested)

- NCERT Class 12 practical, salt analysis (cations), with NaOH: Al³⁺ + 3OH⁻ → Al(OH)₃, white and gelatinous, dissolving in
  excess NaOH as colourless aluminate [Al(OH)₄]⁻ · Cu²⁺ + 2OH⁻ → Cu(OH)₂, pale blue · Fe²⁺ + 2OH⁻ → Fe(OH)₂, dirty green
  (it browns slowly in air, said in the caption) · Fe³⁺ + 3OH⁻ → Fe(OH)₃, rust-brown. The answer is **C rust-brown**.
- The solutions keep their real colours before the drop (aluminium sulphate clear, copper sulphate blue, iron(II) sulphate
  pale green, iron(III) chloride yellow-brown) and fade as the metal leaves in the precipitate. Settling is sped up
  (caption).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–0.08 s | dark set, a lightbox behind; close on the aluminium tube (clear); a dropper over it, a drop halfway down | **CHEMISTRY, VISUALISED #13 · Add NaOH to iron(III) chloride. The cloud is…** A white · B blue · C rust-brown · tag |
| 0.08 s | a white cloud blooms down the tube, specks falling (tap, whump) | |
| 0.7, 1.3 s | the camera follows the dropper: copper's blue cloud, iron(II)'s dirty olive-green; then the dropper slides off | |
| 2.2–2.9 s | the pull-back to the whole rack (whoosh) (the cover, 2.85 s) | |
| 3.0 s | | the question shrinks: "Iron(III): white, blue or brown?" |
| 3.4–4.3 s | close on iron(III) (pale yellow); the dropper slides in over it | each tube's colour, ion and hydroxide; ? over iron(III) · One drop of NaOH each |
| 4.6 s | its drop lands: a burnt-sienna cloud blooms (thunk, whump, music hit); a slow push | rust-brown; **C rust-brown** at 5.1 s |
| 5.25–5.75 s | across to aluminium, the whole tube in shot (whoosh) | |
| 6.25–6.85 s | three more drops: the first stirs the white layer back up, each thins it by a third, to clear (shimmer) | white → clear |
| 7.0–7.6 s | the dropper gone | Al(OH)₃ dissolves in excess NaOH |
| 7.6–8.1 s | out to the whole rack (whoosh) | |
| 8.3–10.5 s | **the cheat sheet**, everything still | Salt analysis: hydroxide colours · each ion, hydroxide and colour · aluminium: dissolves in excess |
| 10.5–12.1 s | the rewind (shimmer): clouds lift and vanish, the dropper flies back: the last frame is frame 0 | the question returns |

## Review panel (F38)

See `reels/review-panel.md` → Log.

## Files

- `pv-chem-013-hydroxides.mp4` · `pv-chem-013-hydroxides-cover.png` (2.85 s: three clouds made, iron(III) still pale yellow, the question big)
- Re-make: `cd remotion && npm test && npm run music:pc013 && npm run mix:pc013 && npm run render:pc013 && npm run cover:pc013`
