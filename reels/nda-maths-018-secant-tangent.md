# @lws.pune · 018, Why? #6: slide the two points together. The line's slope becomes…? (what a derivative really is)

**Handle:** @lws.pune (project `pyq-vault`) · **Kind:** an **NDA maths concept** reel (framework F1) · **Series:** Why? #6
(016 had the number but was rejected and never posted) · **NDA link:** NDA 2021 (II) Maths Q100 (question id
`a8c9317f-15ed-4d88-aedd-75cbe3143163`), named in the caption, not on screen · **Proven idea:** remake-backlog W8,
"what a derivative really is (secant → tangent)": @codematrixvishal 3.14M (115×) [link](https://www.instagram.com/reel/DXq3MMKiQWi/),
@mathsy.uk 1.24M (52×) [link](https://www.instagram.com/reel/C4sodsGow6W/); topic score 6/10 · Made with
`lwspune-framework.md` v1.7 · **Look:** white board, VIVID objects (F24) · **Music:** `lofi` (014 calm, 015 cinematic,
011 drive go out before it) · **Length:** 21.0 s · **Made in Remotion** (`remotion/src/Reel018.tsx`, maths + timing +
camera + sound in `src/lib/reel018.ts`, tests in `tests/reel018.test.ts`).

## The maths (checked, and tested)

- y = x², P = (1, 1), Q = (1 + h, (1 + h)²). Chord slope = ((1 + h)² − 1) / h = (2h + h²) / h = **2 + h** (test, for
  several h). As h → 0 the chord becomes the tangent and the slope → **2 = f′(1)** → **B 2**.
- The gap shrinks by the same factor every second, 1.5 → 0.002 by 5.0 s, so the live slope reads 3.500 → 2.002, then
  exactly 2 (tests: shrinking on every frame from frame 0; h = 0 from the answer on).
- Deep zoom ×48 on P: the curve sits (x − 1)² above its tangent y = 2x − 1, under 12 px at the band's edge (test), so
  on screen curve and tangent are one line. That is why a tangent exists.
- Then P slides to x = 2: slope 4. The slope of x² at any x is 2x (the derivative).
- **NDA 2021 (II) Q100:** "The tangent to the curve x² = y at (1, 1) makes an angle θ with the positive x-axis." Slope
  = 2x = 2 at x = 1, so tan θ = 2. tan(π/3) = √3 ≈ 1.73 < 2 and tan → ∞ as θ → π/2, so **π/3 < θ < π/2 → (d)**
  (θ ≈ 63.4°; tested). Matches the bank's key.
- **Traps:** A 1 (the slope of y = x, or reading the point's y-value); C ∞ (thinking 0/0 blows up: the h cancels first).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | y = x² with P (1, 1) and Q; Q already sliding in, the orange chord pivoting, rise/run dashed with h | **NDA MATHS · DERIVATIVES · Slide the two points together. The line's slope becomes…?** A 1 · B 2 · C ∞ · live `slope = 3.500` |
| 0.5–5.0 s | the slope counts down, a tick at every halving of h | *A line through two points* → *Slide them together…* |
| 5.0 s | punch-in on P; the chord turns green: the tangent · **B 2** lights | *They meet: the tangent. Slope 2* |
| 6.8–10.3 s | deep zoom on P to ×48 (the "zoom ×N" label says so); the curve straightens onto the tangent | *Zoom in: the curve turns straight* |
| 11.0–11.7 s | fast zoom out about P | |
| 12.0–14.6 s | the tangent slides to x = 2, slope 2 → 4 | *Move along: the slope grows* |
| 14.6–18.0 s | gentle push in | *Slope of x² at any x: 2x* |
| 18.0–21.0 s | end card | The derivative = **the slope as the gap → 0.** Follow for more |

**Cover:** 0.3 s (slope still 3.0: no spoiler), "1, 2 or ∞?" mid-page.

## Camera (F9) and sound (F14–F16)

- Slow push in from frame 0 → **punch-in on P landing on the answer** (whoosh) → deep zoom ×48 (slow, shimmer) → fast
  zoom out (whoosh) → pan with the slide → gentle push in. The camera works in log₂ zoom so the deep zoom eases evenly.
- A soft tick each time h halves, pitch rising as Q closes in (tested); a knock as the tangent locks (on the music's
  hit); taps as the slide passes x = 1.5 and lands on 2. Mix: peak −3.3 dB.

## Files

- `nda-maths-018-secant-tangent.mp4` · `nda-maths-018-secant-tangent-cover.png` · `nda-maths-018-strip.png`
- Re-make: `cd remotion && npm test && npm run music:018 && npm run mix:018 && npm run render:018 && npm run cover:018`

## Before you post (founder)

- [ ] Watch it once on the phone: the live slope and every line readable
- [ ] The answer (B 2) and Q100's working match this kit
- [ ] Cover chosen in the upload screen
