# @lws.pune · 019, Why? #7: the area between y = x and y = x³ (0 to 1) is…? (top minus bottom)

**Handle:** @lws.pune (project `pyq-vault`) · **Kind:** an **NDA maths concept** reel (framework F1) whose question **is a
real PYQ**: NDA 2022 (I) Maths Q78 (question id `5e4fbc15-7213-4f58-9c33-bef0c971c8ec`; the paper's options ⅛, ¼, ½, 1;
the reel shows three of them) · **Series:** Why? #7 · **Proven idea:** remake-backlog W10, "area between two curves":
@codematrixvishal 1.80M (66×) [link](https://www.instagram.com/reel/Dd0ByRkjOhZ/); topic score 6/10 · Made with
`lwspune-framework.md` v1.7 · **Look:** white board, VIVID objects (F24) · **Music:** `bright` (018 lofi before it) ·
**Length:** 19.0 s · **Made in Remotion** (`remotion/src/Reel019.tsx`, maths + timing + camera + sound in
`src/lib/reel019.ts`, tests in `tests/reel019.test.ts`).

## The maths (checked, and tested)

- x = x³ ⇔ x(x − 1)(x + 1) = 0, so in the first quadrant the curves meet at 0 and 1; between them x > x³ (test), so the
  line is on top.
- Area = ∫₀¹ (x − x³) dx = [x²/2 − x⁴/4]₀¹ = ½ − ¼ = **¼ → B** (test). This is NDA 2022 (I) Q78's answer (b) ¼, matching
  the bank's key.
- The strips are midpoint strips, so the total on screen is the real strip sum (tests): 10 strips 0.25125 (= ½ − 0.24875;
  the midpoint rule's error on x³ is 3/(24n²)), 20 → 0.25031, 40 → 0.25008, 80 → 0.25002, then exactly 0.25.
- **Traps:** A ½ is the area under the line alone (forgot to subtract); C ⅛ is ½ × ¼ (multiplied instead of
  subtracting).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | y = x (blue) and y = x³ (orange) drawing themselves from 0 to 1 | **NDA MATHS · AREA UNDER CURVES · Area between y = x and y = x³ from 0 to 1 is…?** A ½ · B ¼ · C ⅛ |
| 2.0–5.0 s | 10 green strips rise from x³ to x, one by one, a tap each; `area ≈ 0.00xxx` counts up to 0.25125 | *Line on top, x³ below* → *Each strip: top minus bottom* |
| 5.4–6.4 s | the strips double three times (a snap each): 0.25031, 0.25008, 0.25002 | *Thinner strips… the total settles* |
| 7.0 s | strips melt into one green area, punch-in · **B ¼** lights | *Area = ¼* · `area = 0.25 = ¼` |
| 8.0–9.6 s | zoom out; the triangle under the line fills, dashed blue, "½" | *Under the line: ½* |
| 9.6–11.2 s | the part under x³ fills orange, "¼" | *Under x³: ¼* |
| 11.2–13.0 s | the orange ¼ drops away; green ¼ stays | *Between them: ½ − ¼ = ¼* |
| 13.0–16.0 s | gentle push in | *Area between = ∫(top − bottom)* |
| 16.0–19.0 s | end card | Area between two curves: **∫ (top − bottom) dx** · Follow for more |

**Cover:** 1.2 s (curves most of the way drawn, labelled, no strips: no spoiler), "½, ¼ or ⅛?" mid-page.

## Camera (F9) and sound (F14–F16)

- Slow push in from frame 0 → **punch-in on the area landing on the answer** (whoosh) → fast zoom out for the why
  (whoosh) → slow push while it builds → gentle push for the last line.
- A tap as each of the first 10 strips rises (pitch climbing), a snap at each doubling, a knock on the answer, a soft
  whump as each part of the why fills, a knock as ½ − ¼ lands.

## Files

- `nda-maths-019-area-between.mp4` · `nda-maths-019-area-between-cover.png` · `nda-maths-019-strip.png`
- Re-make: `cd remotion && npm test && npm run music:019 && npm run mix:019 && npm run render:019 && npm run cover:019`

## Before you post (founder)

- [ ] Watch it once on the phone: the running total and every line readable
- [ ] The answer (B ¼) and Q78's working match this kit
- [ ] Cover chosen in the upload screen
