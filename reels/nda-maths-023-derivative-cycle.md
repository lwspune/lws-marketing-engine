# @lws.pune · 023, Why? #11: differentiate sin x four times. You get…? (derivatives go round in a circle)

**Handle:** @lws.pune (project `pyq-vault`) · **Kind:** an **NDA maths concept** reel (framework F1) · **Series:** Why? #11 ·
**Storyboard:** [nda-maths-023-derivative-cycle.storyboard.md](nda-maths-023-derivative-cycle.storyboard.md), reviewed by
an independent agent before any code (F31; 4 blockers fixed) · **NDA link:** NDA 2019 (I) Maths Q83 (question id
`5b1f30f8-ea8a-4536-a48a-e91d91b59aef`), named in the caption · **Proven idea:** remake-backlog W7, "derivatives go round
in a circle": @mathsy.uk 1.59M (66×) [link](https://www.instagram.com/reel/C4c9UQKq_UO/); topic score 6/10 · Made with
`lwspune-framework.md` v1.8 · **Look:** white board, VIVID objects (F24) · **Music:** `synthwave` (022 lofi before it; `drive` came out at −26 dB at this length, the bottom of the loudness range) ·
**Length:** 17.0 s · **Made in Remotion** (`remotion/src/Reel023.tsx`, waves + dial + camera + labels + sound in
`src/lib/reel023.ts`, tests in `tests/reel023.test.ts`).

## The maths (checked, and tested)

- (sin x)′ = cos x = sin(x + π/2): each derivative slides the wave π/2 (a quarter of its length) to the left. In general
  d/dx sin(x + kπ/2) = sin(x + (k + 1)π/2) (tested numerically). Four slides = 2π, a full turn: back to sin x → **A**.
- Two slides give sin(x + π) = −sin x, so y″ = −y (the mirror wave).
- For sin 2x each derivative also multiplies by 2: (sin 2x)′ = 2 cos 2x = 2 sin(2x + π/2), (sin 2x)″ = −4 sin 2x (tested),
  so y″ = −4y.
- **NDA 2019 (I) Q83:** "If y = a cos 2x + b sin 2x, then…": y′ = −2a sin 2x + 2b cos 2x, y″ = −4a cos 2x − 4b sin 2x
  = −4y, so **y″ + 4y = 0 → (d)** (tested at four (a, b) pairs). Matches the bank's key.
- **Traps:** B −sin x (stops after two derivatives, and the reel tags the mirror wave with exactly that); C cos x (one
  derivative, or "it alternates sin, cos").

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | the blue wave already sliding over its pale dashed shadow; the dial's orange pointer turning; pill `y = sin x` | **NDA MATHS · DIFFERENTIATION · Differentiate sin x four times. You get…?** A sin x · B −sin x · C cos x |
| 0–5.2 s | four quarter slides, a tick each; the pill counts y′ = cos x, y″ = −sin x, y‴ = −cos x, y⁗ = sin x | *Each derivative: slide a quarter left* → *Four: back to sin x* |
| 5.2 s | the wave lands on its shadow and glows; punch-in on the panel · **A sin x** lights | |
| 5.6–8.5 s | the second derivative draws itself as the orange mirror wave, tagged "−sin x = only 2 derivatives (B)" | *Two turns: y″ = −y* |
| 8.5–9.3 s | the dial fades; the panel rescales (marks 1 and 4); the wave squeezes to sin 2x | *Twice as fast: each turn ×2 taller* |
| 9.3–12.3 s | two steps, each a quarter slide and twice as tall: 2 cos 2x, then −4 sin 2x | *Two turns: y″ = −4y* |
| 12.3–14.0 s | gentle push in; pill `y″ + 4y = 0` | *So y″ + 4y = 0* |
| 14.0–17.0 s | end card | Each derivative: **a quarter turn.** Follow for more |

**Cover:** 0.5 s (a few degrees into the first slide, pill `y = sin x`), "sin, −sin or cos?".

## Camera (F9) and sound (F14–F16)

- Only the wave panel zooms, about its own centre (it never slides onto the dial): slow push from frame 0 → **punch-in
  landing on the answer** (whoosh) → fast zoom out (whoosh) → still while the panel rescales → gentle push for the last
  line. Tested: panel ends and peaks stay in the picture; no two labels overlap.
- A tick as each slide lands, a knock on the answer, a whump as the mirror wave finishes drawing, a tap as the wave
  squeezes, ticks as the two fast steps land.

## Files

- `nda-maths-023-derivative-cycle.mp4` · `nda-maths-023-derivative-cycle-cover.png` · `nda-maths-023-strip.png`
- Re-make: `cd remotion && npm test && npm run music:023 && npm run mix:023 && npm run render:023 && npm run cover:023`

## Before you post (founder)

- [ ] Watch it once on the phone: the pill and the dial readable
- [ ] The answer (A sin x) and Q83's working match this kit
- [ ] Cover chosen in the upload screen
