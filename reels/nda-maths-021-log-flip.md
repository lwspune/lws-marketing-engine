# @lws.pune · 021, Why? #9: flip y = 2ˣ over the line y = x. You get…? (a logarithm is the power, flipped)

**Handle:** @lws.pune (project `pyq-vault`) · **Kind:** an **NDA maths concept** reel (framework F1) · **Series:** Why? #9 ·
**Storyboard:** [nda-maths-021-log-flip.storyboard.md](nda-maths-021-log-flip.storyboard.md), reviewed by an independent
agent before any code (framework F31; 5 blockers fixed) · **NDA link:** NDA 2024 (I) Maths Q27 (question id
`e0244426-f13f-4475-a9fa-32198825fe25`), named in the caption · **Proven idea:** remake-backlog W12, "what a logarithm is
(exponential, flipped)": @mathsy.uk 1.10M (46×) [link](https://www.instagram.com/reel/DNrQxTaVBtF/); topic score 5/10 ·
Made with `lwspune-framework.md` v1.8 · **Look:** white board, VIVID objects (F24) · **Music:** `cinematic` (020 synthwave
before it) · **Length:** 16.6 s · **Made in Remotion** (`remotion/src/Reel021.tsx`, maths + timing + camera + labels +
sound in `src/lib/reel021.ts`, tests in `tests/reel021.test.ts`).

## The maths (checked, and tested)

- Folding over y = x sends (a, b) to (b, a) (test). The fold of (x, 2ˣ) is (2ˣ, x), and log₂(2ˣ) = x, so the folded copy
  lies exactly on y = log₂x (test, every sampled point) → **B log₂x**.
- 2¹ = 2, 2² = 4, 2³ = 8 ↔ log₂2 = 1, log₂4 = 2, log₂8 = 3 (tests).
- 2ˣ > 0 for every x, so the strip y ≤ 0 is empty of the blue curve; folded, it is the strip x ≤ 0, empty of the orange
  one: log₂x needs x > 0 (test: the strip's corners fold exactly onto x ≤ 0).
- **NDA 2024 (I) Q27:** "number of solutions of log₄(x − 1) = log₂(x − 3)". log₄(x − 1) = ½ log₂(x − 1), so
  x − 1 = (x − 3)², x² − 7x + 10 = 0, x = 2 or 5. Logs need x − 3 > 0, so x = 2 is out: **one solution, x = 5 → (b)**
  (tested). Matches the bank's key. The domain beat is exactly why x = 2 fails.
- **Traps:** A x² (mixes up "power of x" with "power of 2"; the flip of x² would be √x); C 2⁻ˣ (that's the mirror in
  the y-axis, not in y = x).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | axes, dashed mirror y = x, the blue curve already drawing; dots (1, 2), (2, 4), (3, 8) pop on | **NDA MATHS · LOGARITHMS · Flip y = 2ˣ over the line y = x. You get…?** A x² · B log₂x · C 2⁻ˣ |
| 1.5–4.4 s | a copy folds across the mirror (soft shadow), turning orange as it crosses at 2.95 s; the dots land on (2, 1), (4, 2), (8, 3) | *Power of 2: x in, 2ˣ out* → *Fold it over y = x…* |
| 4.6 s | "y = log₂x"; punch-in on the (3, 8)–(8, 3) pair · **B log₂x** lights | *2³ = 8 flips to log₂8 = 3* |
| 5.0–7.3 s | the swap segment draws (at right angles to the mirror); "(3, 8)" → "2³ = 8", "(8, 3)" → "log₂8 = 3"; the pair pulses | |
| 8.0–10.4 s | zoom out; "2² = 4 ↔ log₂4 = 2", "2¹ = 2 ↔ log₂2 = 1" | *Every point swaps the same way* |
| 10.4–12.4 s | y ≤ 0 shades blue, "2ˣ never here"; it folds over the mirror onto x ≤ 0, orange, "no log" | *2ˣ is never 0 or negative…* → *So no log for 0 or negatives* |
| 13.6–16.6 s | end card | Logarithm = **the power, flipped.** Follow for more |

**Cover:** 1.45 s (blue curve with its three labelled dots, nothing folded yet), "Flip 2ˣ over y = x → ?".

## Camera (F9) and sound (F14–F16)

- Slow push in from frame 0 → **punch-in re-centred on the (3, 8)–(8, 3) pair, landing on the answer** (whoosh) → fast
  zoom out (whoosh) → gentle push for the domain beat. Tested: no two labels ever overlap, and every visible label stays
  in the picture on every frame.
- A tap as each dot pops in, a shimmer under the fold and a snap as the copy crosses the mirror, a knock on the answer,
  taps for the segment and each equation, a whump as the strip shades, a shimmer + snap as it folds and lands.

## Files

- `nda-maths-021-log-flip.mp4` · `nda-maths-021-log-flip-cover.png` · `nda-maths-021-strip.png`
- Re-make: `cd remotion && npm test && npm run music:021 && npm run mix:021 && npm run render:021 && npm run cover:021`

## Before you post (founder)

- [ ] Watch it once on the phone: the swapped coordinates and every line readable
- [ ] The answer (B log₂x) and Q27's working match this kit
- [ ] Cover chosen in the upload screen
