# @lws.pune · 020, Why? #8: this matrix reshapes the grid. The square's area becomes…? (a matrix moves space)

**Handle:** @lws.pune (project `pyq-vault`) · **Kind:** an **NDA maths concept** reel (framework F1) · **Series:** Why? #8 ·
**NDA link:** NDA 2026 (II) Maths Q69 (question id `e53ed6cf-dda1-4e57-ad8c-41793df0cacd`), named in the caption, not on
screen · **Proven idea:** remake-backlog W14, "a matrix moves space": @codematrixvishal 916k (34×)
[link](https://www.instagram.com/reel/DbZeJpoJKmm/); topic score 7/10 (the top pick). Reel 011 (posted 25 Oct) showed det
scaling with the rows; this one shows the whole grid moving, and goes out three days later so two determinant reels
don't run back to back · Made with `lwspune-framework.md` v1.7 · **Look:** white board, VIVID objects (F24) · **Music:**
`synthwave` (019 bright before it) · **Length:** 16.0 s · **Made in Remotion** (`remotion/src/Reel020.tsx`, maths +
timing + camera + sound in `src/lib/reel020.ts`, tests in `tests/reel020.test.ts`).

## The maths (checked, and tested)

- M = [[2, 1], [1, 3]]: its columns are where î and ĵ land, (2, 1) and (1, 3). The unit square becomes the
  parallelogram (0, 0), (2, 1), (3, 4), (1, 3); its shoelace area is 5 = 2·3 − 1·1 = det M (tests) → **B 5**.
- The live area on screen is |det| of the matrix at that frame, which equals the moving square's shoelace area on every
  frame (test). Every square of the grid grows by the same ×5 (two neighbours light up to show it).
- S = [[2, 1], [4, 2]]: det = 4 − 4 = 0, its columns (2, 4) and (1, 2) are parallel, and the square lands on a segment
  of the line y = 2x: area 0 (tests). A flat plane can't be un-flattened: no inverse.
- **NDA 2026 (II) Q69:** unit vectors a, b at 30°; the parallelogram on a + 3b and 3a + b. The new sides are the
  matrix [[1, 3], [3, 1]] applied to a and b, so the area is |1·1 − 3·3| × |a × b| = 8 × sin 30° = 8 × ½ = **4 → (d)**
  (tested by the cross product too). Matches the bank's key.
- **Traps:** A 6 (2 × 3, the diagonal alone: forgets the lean), C 7 (2 + 1 + 1 + 3, adding the entries).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | the grid already bending towards the matrix shown at top left, [[2, 1], [1, 3]] (columns in î's and ĵ's colours; it changes live only in the squash): cyan grid lines, red î, blue ĵ, yellow square; live `area = 1.00` | **NDA MATHS · DETERMINANTS · This matrix reshapes the grid. The square's area becomes…?** A 6 · B 5 · C 7 |
| 0.4–3.6 s | the area counts up, a tick at 2, 3, 4 | *Watch the grid move* → *The square stretches and leans* |
| 3.6 s | punch-in on the parallelogram, "×5" inside · **B 5** lights | *Area ×5: the determinant* · `area = 5 = det` |
| 5.2–8.2 s | zoom out; the squares either side light up, "5" each | *Every square grows ×5* |
| 8.2–10.6 s | slow zoom out; the matrix becomes [[2, 1], [4, 2]], the whole grid folds onto one line, area 5 → 0 | *det 0? The plane goes flat* |
| 10.6–13.0 s | gentle push in on the line | *Flat: no area, no inverse* · `area = 0` |
| 13.0–16.0 s | end card | Determinant = **how much area scales.** Follow for more |

**Cover:** 0.9 s (area 1.39: no spoiler), "6, 5 or 7?" mid-page.

## Camera (F9) and sound (F14–F16)

- Slow push in from frame 0 → **punch-in on the parallelogram landing on the answer** (whoosh) → fast zoom out to show the
  neighbours (whoosh) → slow zoom out to fit the squash → gentle push in. Tested: the square's corners and the lit
  squares stay inside the picture, below the area pill, on every frame.
- A tick each time the area passes a whole number (rising 2, 3, 4; falling 4, 3, 2, 1 in the squash), a knock at 5,
  taps as the neighbours light, a whump when the plane goes flat.

## Files

- `nda-maths-020-matrix-grid.mp4` · `nda-maths-020-matrix-grid-cover.png` · `nda-maths-020-strip.png`
- Re-make: `cd remotion && npm test && npm run music:020 && npm run mix:020 && npm run render:020 && npm run cover:020`

## Before you post (founder)

- [ ] Watch it once on the phone: the matrix, the live area and every line readable
- [ ] The answer (B 5) and Q69's working match this kit
- [ ] Cover chosen in the upload screen
