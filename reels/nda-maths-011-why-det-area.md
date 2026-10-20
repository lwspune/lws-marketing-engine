# Reel 011, Why? #3 (remade 2026-10-20): double a 2×2 matrix, its determinant becomes…?

**Handle:** @lws.pune (project `pyq-vault`) · **Framework:** `lwspune-framework.md` v1.1 · **Made in Remotion**
(`remotion/src/Reel011.tsx`, timeline `src/lib/reel011.ts`, tests `tests/reel011.test.ts`) · **Music:** `drive`, hit on the
answer · **Length:** 22 s · **Slot:** Tue 21 Oct 15:40. The first version (engine, still title card, MCQ at the end,
`.render.html`) was taken back before posting.

## The idea (checked, and tested)

- The rows of A = [3 1; 1 2] are two arrows; |det A| = 3·2 − 1·1 = 5 is the area of the parallelogram between them
  (the tests check |det| = shoelace area for random matrices, and that the area shown is |det| of the rows shown).
- Double row 1: area 10 (2 copies). Double row 2 too (that's 2A): area 20 (4 copies) → |2A| = 4|A| → **B ×4**.
- Any k: area = 5k² (the graph draws itself while k sweeps 2 → 3 → 1); n×n: |kA| = kⁿ|A|.
- NDA 2025 (II) Maths Q44 (question id `cb96362c-a449-43bf-8896-bef877b5f6f2`): I. det(mX) = mⁿ det(X); II. one row × m ⇒
  det × m → (a) both true, II explains I. In the caption only.

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | question + A ×2 · B ×4 · C same; the two row arrows draw themselves (@remotion/paths), the area fills | **NDA MATHS · DETERMINANTS · Double every number in a 2×2 matrix. Its determinant becomes…?** |
| 1.2–3.2 s | row 1 stretches: area 5 → 10, a dashed split shows 2 copies | *Double row 1: area doubles* |
| 3.6–5.6 s | row 2 stretches: → 20, 4 copies of 5 | *Double row 2: doubles again* |
| 5.6 s | punch-in · **B** lights · area 20 in green | *\|2A\| = 4 \|A\|, not 2 \|A\|* |
| 9–16.6 s | both rows scaled by k, k sweeps 2 → 3 → 1 → 2; area = 5k² graph with its live point | *Scale by k: area × k²* · *n×n matrix: \|kA\| = kⁿ \|A\|* |
| 18.6–22 s | end card | Double a 2×2 matrix: **the determinant goes ×4.** Follow for more |

The matrix (named A, then 2A, then kA) and its area sit in a fixed strip above the picture (F9). Sound: a click as the
area passes each whole unit while the rows stretch, a thunk on the answer.

## Files

- `nda-maths-011-why-det-area.mp4` · `-cover.png` (2.2 s) · `nda-maths-011-strip.png` · `.post.json`
- Re-make: `cd remotion && npm test && npm run music:011 && npm run mix:011 && npm run render:011 && npm run cover:011`
