# @pyqvault_ · Chemistry, visualised #9: one battery, two tubes. Which fills first?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11–12 · **Topic:** idea **C8** ("Split water", our own;
score 59/100), Hook queue row 2 · **Hook:** Race · **Opening:** Split apart (one water molecule bursts) · **Second hook:**
"Why exactly twice as fast?" (punch-in, slow-motion split, both H lit) · **Loop:** no (end card) · **Framework v1.27** ·
**Background:** white (L22: dark leads 13–10 in reels made) · **Music:** `synthwave` (F13 / L34: a race fits drive or
synthwave; synthwave has fewer), hits on the answer and the second hook · **Voice:** none, silent: the first **L62** test
(a running count that is the answer and keeps running past it), silent so the voice (L43) can't take the credit ·
**Length:** 19.8 s · **Made in Remotion** (`remotion/src/PvChem009.tsx`; timeline, beat table, chemistry and sound
`src/lib/pc009.ts`; tests `tests/pc009.test.ts`).

**Syllabus:** NCERT Class 11 Some Basic Concepts of Chemistry teaches Gay-Lussac's law of gaseous volumes with exactly this
(2 volumes of hydrogen with 1 of oxygen) and Avogadro's law; electrolysis of water is Class 12 Electrochemistry.

## The chemistry (checked, and tested)

- Water with a little acid, platinum electrodes: 2 H₂O → 2 H₂ + O₂. Hydrogen collects over the − electrode, oxygen over
  the +. The equation balances (4 H, 2 O a side; tested).
- At the same temperature and pressure equal numbers of gas molecules take equal volumes (Avogadro), so the hydrogen tube
  collects exactly **twice** the oxygen's volume at every moment: answer **A hydrogen**. The counts are mL (2 mL/s and
  1 mL/s, like a voltameter's scale): 14 : 7 at the answer, 34 : 17 at the end card; 2 : 1 on every frame (tested).
- The drawn molecules are a model. Whenever one is shown big it is labelled "1 water molecule · zoomed ×10⁸" (≈ 0.28 nm
  shown ≈ 2.5 cm on a phone). One molecule's two H go to the hydrogen side and its O to the oxygen side: one H₂ and half
  an O₂, the overall reaction, not the electrode half-reactions.
- In a real cell a little oxygen dissolves at first, so the measured ratio starts slightly above 2 : 1; the ideal ratio is
  the textbook one.

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | one water molecule fills the band, breathing; counts H₂ 0 · O₂ 0; bubbles already rising behind | **CHEMISTRY, VISUALISED #9 · Two tubes. Which fills first?** A hydrogen · B oxygen · C together · tag |
| 0.5 s | it bursts (crack): both H fly left, the O right, shrinking as the camera pulls back to the two tubes | |
| 2.6–6.1 s | the race: bubbles stream, gas columns grow, the counts tick (a tap per mL) and the graph draws 2 : 1 | Battery on: water splits · Gas fills each tube |
| 6.1–7.0 s | punch-in on the two gas columns (whoosh-in); **A hydrogen** lights at 14 : 7 | Hydrogen: twice as fast |
| 8.0 s | punch-in on one water molecule (whoosh-in, music hit); 9.0 s it splits in slow motion (crack), both H light up | Why exactly twice as fast? · Two H for every O |
| 10.6 s | zoom out (whoosh-out): its atoms fly to the tubes; the counts run on | 2 H₂O → 2 H₂ + O₂ |
| 13.6–17.4 s | the race runs on to 34 : 17 | Twice the molecules, twice the gas · Still exactly 2 : 1 |
| 17.4–19.8 s | end card | Water splits 2 H₂ : 1 O₂ · pyqvault.com · Follow for #10 |

**Colours (F24):** O red, H blue (VIVID.white, told apart for colour-blind viewers; tested), used for the atoms, bubbles,
gas, counts and graph lines alike; water, glass, steel electrodes and copper wires are REAL.

## Files

- `pv-chem-009-electrolysis.mp4` · `pv-chem-009-electrolysis-cover.png` (0.4 s: the molecule, both counts at 0)
- Re-make: `cd remotion && npm test && npm run music:pc009 && npm run mix:pc009 && npm run render:pc009 && npm run cover:pc009`
