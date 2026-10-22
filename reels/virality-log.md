# @pyqvault_ virality predictor log

**Will a finished reel beat our record for views?** (founder, 2026-10-22; framework F30). Each reel gets a score out of 100
from inputs measured on the finished reel or read from its storyboard, a band (record-breaker / above typical / below
typical) and its weakest input, the thing to fix first. **The prediction is logged, frozen, before the reel is posted**, and
judged at its 48 h reading. Tools: `node reels/tools/virality-measure.mjs reels/<reel>.post.json` (motion, colour, length,
cover) · `node reels/tools/virality.js` (checks this log, shows accuracy) · `--calibrate` (weight changes the results
support, the same rule as the idea score).

**Status: advisory.** It becomes the go/no-go gate only when **at least 15 real (not hindsight) predictions** have their 48 h
reading, **the rank correlation between score and views is ≥ 0.5**, and **it caught most below-typical reels**. Then a reel
predicted below typical goes back to be fixed (its weakest input) before posting; the founder can still overrule, and
nothing ever posts without the founder's approval.

## Scoring

Score = Σ (points × weight) ÷ Σ (best points × weight), out of 100, the same rule as the idea score. Weight 0 = measured and
logged but not counted yet, because which way it pushes isn't known; calibration can raise it once the 48 h results show it.

| Input | Key | Points | Weight | Anchors |
|---|---|---|---|---|
| Idea | idea | 0–3 | 1.5 | the idea's score in `pyqvault-ideas.md`: ≥ 70 → 3 · ≥ 60 → 2 · ≥ 50 → 1 · below → 0 |
| Motion 0–3 s | motion | 0–2 | 1 | share of frames (10 a second) where ≥ 0.2% of pixels change noticeably: ≥ 95% → 2 · ≥ 75% → 1 · below → 0 (L29, F5) |
| Hook move | hookmove | 0–1 | 1 | a named attention move in 0–3 s (orbit, punch-in, assemble, split apart, morph, split screen, race, colour flood) → 1 (F25) |
| Words 0–3 s | words | 0–2 | 1 | words on screen at frame 0 (label, question, options, tag): ≤ 10 → 2 · ≤ 18 → 1 · more → 0 (F7) |
| Colour 0–3 s | colour | 0–2 | 1 | colourfulness (Hasler–Süsstrunk M, median over 0–3 s): ≥ 20 → 2 · ≥ 10 → 1 · below → 0 (L30, F24) |
| Length | length | 0–1 | 1 | ≤ 25 s → 1 (F18) |
| Second hook | secondhook | 0–1 | 1 | a second question with its own move at the answer → 1 (F26, L49) |
| Momentum | momentum | 0–2 | 1 | median views of the 3 reels posted before ÷ the median of all reels posted before: ≥ 1.5 → 2 · ≥ 0.8 → 1 · below → 0 |
| Cover | cover | 0–2 | 0 | the cover's colourfulness, same anchors as Colour |
| Answer after 8 s | answer | 0–1 | 0 | the A/B/C answer lands after 8 s → 1 (L48: viewers leave at the answer) |
| Loop | loop | 0–1 | 0 | loops back to frame 0 → 1 (F27, L50) |

**Bands:** record-breaker ≥ 80 · above typical ≥ 55 · below typical under 55. A band is about views: record-breaker
= more views than the record at logging time; above typical = at least the typical reel's views; below typical = fewer.

## Reels

Points per input (measured: motion, colour, length, cover; from the storyboard: hook move, words, second hook, answer,
loop; momentum from the reels posted before). The score shown by the tool is today's, under today's weights.

| Idea | Reel | Idea score | Motion | Hook move | Words | Colour | Length | Second hook | Momentum | Cover | Answer | Loop | Measured |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P1 | pv-physics-001-collision | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | idea 23 · motion 70% · words ≈12 (title card, estimated) · colour 7.8 · 40.6 s · cover 16.3 |
| P2 | pv-physics-002-boyle | 2 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | idea 69 · motion 57% · words ≈12 (title card, estimated) · colour 8.7 · 30 s · cover 11 |
| C2 | pv-chem-002-families | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | idea 54 · motion 50% · words ≈12 (title card, estimated) · colour 7.1 · 33 s · cover 34.9 |
| C1 | pv-chem-001-heat-rate | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | idea 46 · motion 47% · words ≈12 (title card, estimated) · colour 7.7 · 32.6 s · cover 8 |
| P3 | pv-physics-003-pendulum | 2 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | idea 62 · motion 50% · words ≈12 (title card, estimated) · colour 7.1 · 31 s · cover 19.3 |
| C3 | pv-chem-003-avogadro | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | idea 54 · motion 57% · words ≈12 (title card, estimated) · colour 8.3 · 30 s · cover 9.7 |
| P4 | pv-physics-004-slope | 2 | 2 | 0 | 1 | 1 | 1 | 0 | 1 | 2 | 1 | 0 | idea 69 · motion 97% · words 14 · colour 15.8 · 23 s · cover 21.5 |
| C4 | pv-chem-004-charles | 2 | 2 | 0 | 1 | 1 | 1 | 0 | 2 | 1 | 1 | 0 | idea 69 · motion 100% · words 18 · colour 12.6 · 22 s · cover 11.6 |
| P5 | pv-physics-005-adiabatic | 3 | 2 | 1 | 1 | 1 | 1 | 0 | 2 | 1 | 1 | 0 | idea 85 · motion 100% · words 14 · colour 18.8 · 21.8 s · cover 16.3 |
| C5 | pv-chem-005-pvt | 2 | 2 | 1 | 1 | 1 | 1 | 0 | 2 | 1 | 1 | 0 | idea 62 · motion 100% · words 14 · colour 17.2 · 21.4 s · cover 14.8 |
| P12 | pv-physics-006-topspin | 2 | 2 | 0 | 1 | 2 | 1 | 0 | 2 | 2 | 1 | 0 | idea 69 · motion 100% · words 14 · colour 24 · 22 s · cover 22 |
| C7 | pv-chem-006-flame | 1 | 2 | 0 | 1 | 1 | 1 | 0 | 2 | 1 | 1 | 0 | idea 54 · motion 100% · words 16 · colour 17.9 · 22 s · cover 11.1 |
| P9 | pv-physics-007-heat | 2 | 2 | 0 | 1 | 2 | 1 | 0 | 2 | 1 | 1 | 0 | idea 69 · motion 100% · words 17 · colour 25.5 · 22 s · cover 18.6 |
| C13 | pv-chem-007-halflife | 2 | 2 | 0 | 1 | 2 | 1 | 0 | 2 | 2 | 1 | 0 | idea 62 · motion 100% · words 14 · colour 40.3 · 21.9 s · cover 38.7 |
| P24 | pv-physics-008-spoon | 3 | 1 | 1 | 0 | 1 | 1 | 0 | 2 | 1 | 1 | 0 | idea 77 · motion 93% · words 20 · colour 11.2 · 20.4 s · cover 15.6 |
| P29 | pv-physics-009-wing-mirror | 2 | 2 | 1 | 0 | 2 | 1 | 0 | 2 | 2 | 1 | 0 | idea 69 · motion 100% · words 20 · colour 23.4 · 21.3 s · cover 24.2 |
| C14 | pv-chem-008-packing | 2 | 2 | 1 | 1 | 2 | 1 | 0 | 2 | 2 | 1 | 0 | idea 62 · motion 100% · words 17 · colour 40.8 · 20.1 s · cover 27.7 |
| P11 | pv-physics-010-launch-angles | 3 | 2 | 1 | 1 | 1 | 1 | 1 | 2 | 1 | 1 | 1 | idea 77 · motion 100% · words 16 · colour 12.3 · 18.5 s · cover 11.1 |
| P29b | pv-physics-009b-wing-mirror | 2 | 2 | 1 | 1 | 2 | 1 | 1 | 2 | 2 | 1 | 1 | idea 69 · motion 100% · words 12 · colour 39.7 · 19 s · cover 37.9 · rebuild of P29 to v1.26 (You'd think + morph, split, loop) |

## Predictions

Frozen when logged. **Hindsight = yes**: scored after the reel was posted, so it's shown but never counted in accuracy.
The 7 reels made but not posted on 2026-10-22 are the first real test.

| Idea | Reel | Logged | Score | Band | Weakest | Record then | Typical then | Hindsight | Views 48 h | Actual | Right |
|---|---|---|---|---|---|---|---|---|---|---|---|
| P1 | pv-physics-001-collision | 2026-10-22 | 14 | below typical | idea | 1 | 1 | yes | 141 | record-breaker | hindsight |
| P2 | pv-physics-002-boyle | 2026-10-22 | 29 | below typical | motion | 143 | 143 | yes | 263 | record-breaker | hindsight |
| C2 | pv-chem-002-families | 2026-10-22 | 21 | below typical | idea | 269 | 206 | yes | 194 | below typical | hindsight |
| C1 | pv-chem-001-heat-rate | 2026-10-22 | 14 | below typical | idea | 269 | 195 | yes | 133 | below typical | hindsight |
| P3 | pv-physics-003-pendulum | 2026-10-22 | 29 | below typical | motion | 269 | 143 | yes | 118 | below typical | hindsight |
| C3 | pv-chem-003-avogadro | 2026-10-22 | 21 | below typical | idea | 932 | 143 | yes | 121 | below typical | hindsight |
| P4 | pv-physics-004-slope | 2026-10-22 | 57 | above typical | idea | 932 | 140 | yes | 1,431 | record-breaker | hindsight |
| C4 | pv-chem-004-charles | 2026-10-22 | 64 | above typical | idea | 1429 | 143 | yes | 1,298 | above typical | hindsight |
| P5 | pv-physics-005-adiabatic | 2026-10-22 | 79 | above typical | words | 1429 | 169 | yes | – | waiting | – |
| C5 | pv-chem-005-pvt | 2026-10-22 | 71 | above typical | idea | 1429 | 195 | yes | – | waiting | – |
| P12 | pv-physics-006-topspin | 2026-10-22 | 71 | above typical | idea | 1455 | 232 | yes | – | waiting | – |
| C7 | pv-chem-006-flame | 2026-10-22 | 57 | above typical | idea | 1496 | 1429 | no | – | waiting | – |
| P9 | pv-physics-007-heat | 2026-10-22 | 71 | above typical | idea | 1496 | 1429 | no | – | waiting | – |
| C13 | pv-chem-007-halflife | 2026-10-22 | 71 | above typical | idea | 1496 | 1429 | no | – | waiting | – |
| P24 | pv-physics-008-spoon | 2026-10-22 | 64 | above typical | words | 1496 | 1429 | no | – | waiting | – |
| P29 | pv-physics-009-wing-mirror | 2026-10-22 | 71 | above typical | words | 1496 | 1429 | no | – | waiting | – |
| C14 | pv-chem-008-packing | 2026-10-22 | 79 | above typical | idea | 1496 | 1429 | no | – | waiting | – |
| P11 | pv-physics-010-launch-angles | 2026-10-22 | 86 | record-breaker | words | 1496 | 1429 | no | – | waiting | – |
| P29b | pv-physics-009b-wing-mirror | 2026-10-22 | 86 | record-breaker | idea | 1496 | 1429 | no | – | waiting | – |

## Calibration and accuracy runs

| Date | Real predictions judged | Bands right | Rank correlation | Weight changes | Note |
|---|---|---|---|---|---|
| 2026-10-22 | 0 | – | – | idea 1 → 1.5 | calibrated on 8 reels, score vs result 0.72 |
