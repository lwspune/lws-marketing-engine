# @lws.pune · 017, Map #1: which chapter gets the most NDA maths questions now? (all of NDA probability on one map)

**Handle:** @lws.pune (project `pyq-vault`) · **Kind:** NDA maths map reel (framework F28, new, on test: L57), no PYQ
named · **Topic:** chosen by exam weight, not topic score (founder, 2026-10-21: "the most important NDA maths topic"):
Probability has the most questions in each of the last 3 papers · **Model:** a "formula map" reel studied 2026-10-21
(`study/reels/DdttI7oyswS.mp4`, not ours, study only): map with empty boxes → node tour → two flips to black → the full
map held with "Screenshot this". Remade our way: the idea, never their video, words or sound · **Framework:** @lws.pune
v1.7 · **Look:** white board, flat 2D, 8 VIVID node colours (F24), two flips to the indigo board · **Music:** `drive`
(016 was synthwave, 015 cinematic), hits on the answer and the zoom out · **Length:** 25 s, loops (the last frame is frame
0) · **End:** the full map + "Screenshot this 📌 · All of NDA probability, one map · Follow for more" (F28 in place of the
end card) · **Made in Remotion** (`remotion/src/Reel017.tsx`, timing + camera + sound `src/lib/reel017.ts`, tests
`tests/reel017.test.ts`).

## The numbers (from the question bank, read-only, checked in the tests)

- **Questions per chapter, last 3 papers** (NDA-2 2025, NDA-1 2026, NDA-2 2026; 120 each; PYQ Vault guide → trends,
  `EXAM_MATRIX`, read 2026-10-21): **Probability 14 + 13 + 14 = 41**, Matrices & Determinants 31, Trigonometric Identities
  20, Lines 17, Vectors 20, Limits & Continuity 17, Statistics 15. Each paper's column adds up to 120 (tested), and
  Probability is the biggest chapter of the 31. Answer **B**.
- Over all 19 papers (2017–2026), Matrices & Determinants is still first (181 vs 176), so the question says **now**
  and the caption says "last 3 papers". Probability has led every one of the last 3 papers; Statistics, #3 overall, is
  falling (11 → 5 a paper).
- **"90 of 176 NDA probability PYQs are just counting":** of the 176 Probability PYQs 2017–2026, 90 are tagged
  "Probability via Counting" (subtopic counts, question bank, queried 2026-10-21). The rest: conditional / Bayes 31,
  event algebra 25, independent events 17, bounds 13.
- Binomial distribution is its own chapter in the bank (4 questions in the last 3 papers, not in the 41); it's on the map
  because NDA probability questions use it.

## The maths (every formula on the map, tested by counting dice outcomes)

| Node | On the card | Checked with |
|---|---|---|
| Counting | favourable ÷ total | P(two dice total 7) = 6/36 |
| Not A | P(A′) = 1 − P(A) | P(at least one six in two dice) = 1 − P(no six) = 11/36 |
| A or B | P(A) + P(B) − P(A∩B) | first die even OR total ≥ 9 |
| Exclusive | P(A∩B) = 0 | total 2 and total 12 can't both happen… |
| Independent | P(A∩B) = P(A) · P(B) | first die even AND second die six |
| Given B | P(A\|B) = P(A∩B) ÷ P(B) | total 7 given the second die is six: 1/6 both ways |
| Bayes | P(A\|B) = P(B\|A)·P(A) ÷ P(B) | the same pair, turned around |
| Binomial | ⁿCᵣ pʳ qⁿ⁻ʳ · mean np · var npq | number of sixes in 4 dice (1,296 outcomes): every r, mean 4/6, variance 20/36 |

**The trap on the second flip, "Exclusive ≠ Independent":** exclusive events with non-zero chances are never
independent: P(A∩B) = 0 but P(A)·P(B) > 0 (total 2 and total 12: 0 vs 1/36 × 1/36). A favourite NDA trick.

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–2.8 s | the map small: a dark hub with **?**, 8 spokes, 8 empty cards; a light runs out along each spoke (a click each); slow push | **NDA MATHS · LAST 3 PAPERS · Which chapter gets the most NDA maths questions now?** A Matrices · B Probability · C Trig · comment your guess 👇 |
| 2.8 s | punch-in on the hub: **?** → *NDA maths · Probability*; **B** lights (thunk) | *Last 3 papers: 41 of 360* |
| 4.0–5.7 s | close on **Counting** (red), it writes in (tap) | *Count the ways, divide by all* |
| 5.7–7.2 s | **flip to indigo** (whump) | **90 of 176** NDA probability PYQs are just counting |
| 7.2–12.3 s | **Not A** (orange), **A or B** (yellow), **Exclusive** (green) | *“At least one”? Do 1 − none* · *Add both, take the overlap off once* · *Can’t happen together: no overlap* |
| 12.3–13.8 s | **flip** (whump) | **Trap!** Exclusive ≠ Independent · exclusive: never together · independent: no effect |
| 13.8–20.6 s | **Independent** (cyan), **Given B** (blue), **Bayes** (violet), **Binomial** (pink) | *One doesn’t change the other: multiply* · *B happened: B is the new whole* · *Turn the condition around* · *n tries, r successes, p each time* |
| 20.6–24.45 s | zoom out (whoosh): **the whole map, every card written**, held 3 s+ | **Screenshot this 📌** · All of NDA probability, one map · **Follow for more** |
| 24.45–25 s | the cards empty, the hub goes back to **?**, the camera back to frame 0's view | the question again, unanswered: it loops |

## Files

- `nda-maths-017-probability-map.mp4` · `nda-maths-017-probability-map-cover.png` (1.2 s: the small map with empty cards
  and **?**, the question, "Guess before you watch"; nothing answered, F6)
- Re-make: `cd remotion && npm test && npm run music:017 && npm run mix:017 && npm run render:017 && npm run cover:017`
- Checked: `check-video` 4 PASS (1080×1920, stereo, peak −5.6 dB, body −22.9 dB RMS).

## Caption (Instagram)

See `nda-maths-017-probability-map.post.json` (Instagram, Facebook, YouTube). First line `NDA Maths · Probability`
(F19), the question, the numbers, then the save ask.

## Before you post (founder)

- [ ] Watch it once on the phone: every card readable when the camera is on it; the full map readable at the end
- [ ] Pause on the full map: is it worth a screenshot?
- [ ] The numbers match this kit (41 of 360; 90 of 176)
- [ ] Cover chosen in the upload screen; bio link opens PYQ Vault
