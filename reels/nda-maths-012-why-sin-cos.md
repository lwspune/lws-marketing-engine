# Reel 012, Why? #4 (remade 2026-10-20): the angle keeps turning, sin²θ + cos²θ is…?

**Handle:** @lws.pune (project `pyq-vault`) · **Framework:** `lwspune-framework.md` v1.1 · **Made in Remotion**
(`remotion/src/Reel012.tsx`, timeline `src/lib/reel012.ts`, tests `tests/reel012.test.ts`) · **Music:** `lofi`, hit on the
answer · **Length:** 22 s · **Slot:** Wed 22 Oct 15:40. The first version (engine, still title card, MCQ at the end,
`.render.html`) was taken back before posting.

## The idea (checked, and tested)

- A point on a circle of radius 1: width cos θ, height sin θ, hypotenuse 1, so Pythagoras gives sin²θ + cos²θ = 1 at
  every angle → **A 1** (the tests check the point is on the circle and the sum is 1 on every frame).
- The parts really trade: sin² swings from 0 to 1 and back while cos² does the opposite.
- NDA 2025 (I) Maths Q35 (question id `49d9d19d-5e2c-4eec-b8cc-6a1adc64a016`): p = sin α − sin(α − 90°) = sin α + cos α;
  p² = 1 + sin 2α ≤ 2 → max √2 → (b). In the caption only (it uses this very identity).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | question + A 1 · B θ · C varies; the point already circling, its triangle, a stacked bar (cos² under sin²) exactly 1 tall, the waves drawing below | **NDA MATHS · TRIGONOMETRY · The angle keeps turning. sin²θ + cos²θ is…?** |
| 0.6–4.6 s | half a turn: the bar's two parts trade sizes, the total never moves | *Turn the angle: sin², cos² trade* |
| 4.6 s | punch-in on the bar · **A** lights | *The sum never moves: always 1* |
| 8.6–15.6 s | push into the circle; the point eases to the top: sin² = 1, cos² = 0 | *Pythagoras on a circle of 1* · *At 90°: 1 + 0 = 1* |
| 15.6–18.6 s | a faster spin, both waves and the flat green sum | *Any angle: sin² + cos² = 1* |
| 18.6–22 s | end card | Any angle at all: **sin²θ + cos²θ = 1.** Follow for more |

The live sum (sin²θ + cos²θ = 1.00) sits in a fixed strip above the picture (F9). Sound: a click at every 30° mark
(pitch following sin²), a thunk on the answer.

## Files

- `nda-maths-012-why-sin-cos.mp4` · `-cover.png` (2.0 s) · `nda-maths-012-strip.png` · `.post.json`
- Re-make: `cd remotion && npm test && npm run music:012 && npm run mix:012 && npm run render:012 && npm run cover:012`
