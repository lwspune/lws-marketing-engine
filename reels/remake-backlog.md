# Remake backlog: proven reels, remade our way

Founder's call (2026-10-18): instead of inventing every topic, pick reels that **already worked** for the creators we
studied and that sit on **our syllabus**, then remake them. Picked from every reel saved in `analytics/competitors/`
(5 accounts) that reached **≥ 3× that creator's typical reel**, minus spectacle that isn't on any syllabus (number
tricks, "math sounds like", parametric art).

**Rules for a remake**
- We take the **idea** (the topic and the kind of picture), never their video, frames, text, voice or music.
  Everything is drawn in our own look (Remotion template `remotion/src/PvPhysics004.tsx`, framework F11) with our own words.
- **Better, not the same:** add what theirs lacks, usually the *why* (a live count, a second picture, a graph that
  morphs) and each handle's framework (`pyqvault-framework.md` / `lwspune-framework.md`).
- The caption kit (`<reel>.md`) names the source reel in a "Proven idea" line, so the numbers can be compared later.
- Each one still needs its physics/maths re-checked in its tests, and a "where it's asked" line: a real NDA PYQ in
  the caption when one fits (@lws.pune, concepts first since 2026-10-20) or the exams that ask it (@pyqvault_).
- When a remake is posted, fill its row in `learnings.md` (@lws.pune) or `pyqvault-learnings.md` (@pyqvault_): did a
  proven idea beat our own ideas on our account?

## @pyqvault_: moved to `pyqvault-ideas.md` (2026-10-21)

Every @pyqvault_ idea now lives in **`reels/pyqvault-ideas.md`** (founder, 2026-10-21): the test, the tuned score, one
card per idea, the Concept sweep log and the Hook queue. Older notes that point to "remake-backlog.md → Topic scores",
"Hook queue" or "Concept sweep" for @pyqvault_ mean that file; its Archive section keeps the source tables that were
here. The remake rules above still apply to @pyqvault_ remakes. This file keeps @lws.pune until it is rebuilt.

## @lws.pune (NDA maths concepts), pick by **@lws.pune topic scores** below

Concepts first (founder, 2026-10-20): the reel explains the idea; a real NDA PYQ is named in the caption when one fits,
but a good concept isn't blocked for lack of one. Only NDA maths chapters go on this list.

| # | Remake | Proof | Our angle (the "why") | NDA chapter | Status |
|---|---|---|---|---|---|
| W6 | The soda-can problem: the best shape | @mathsy.uk 2.74M (114×) [link](https://www.instagram.com/reel/C4nXYzzKdHe/), their #1 ever | 3D can morphs tall ↔ wide at fixed volume; surface-area graph has a low point where h = 2r | Application of derivatives (max/min) | next |
| W7 | Derivatives go round in a circle: sin → cos → −sin → −cos | @mathsy.uk 1.59M (66×) [link](https://www.instagram.com/reel/C4c9UQKq_UO/) | each derivative = the curve shifted a quarter turn; the wheel turns | Differentiation | |
| W8 | What a derivative really is (secant → tangent) | @codematrixvishal 3.14M (115×) [link](https://www.instagram.com/reel/DXq3MMKiQWi/); @mathsy.uk 1.24M (52×) [link](https://www.instagram.com/reel/C4sodsGow6W/) | h shrinks live, the slope readout settles; f and f′ drawn together | Limits & differentiation | f and f′ part made as 015 (W15); secant → tangent still open |
| W9 | The whole unit circle on one screen | @codematrixvishal 21.3M (779×) [link](https://www.instagram.com/reel/DbXW1vxJ-7-/), the biggest reel we've seen | reference sheet that builds itself; the 30-45-60 triangles explain every value | Trigonometry | test format |
| W10 | Area between two curves | @codematrixvishal 1.80M (66×) [link](https://www.instagram.com/reel/Dd0ByRkjOhZ/) | strips sweep between the curves; top minus bottom | Area under curves | |
| W11 | Why do we multiply probabilities? | @mathsy.uk 822k (34×) [link](https://www.instagram.com/reel/DOqyBeBjbpu/) | the shrinking square: each "and" cuts the space | Probability | |
| W12 | What a logarithm is (exponential, flipped) | @mathsy.uk 1.10M (46×) [link](https://www.instagram.com/reel/DNrQxTaVBtF/) | y = aˣ reflected in y = x, live | Logarithms | |
| W13 | Series formulas on one screen | @codematrixvishal 2.61M (95×) [link](https://www.instagram.com/reel/DZr28L5p89C/) | reference sheet; each sum shown as a picture (staircases, squares) | Sequences & series | test format |
| W14 | A matrix moves space | @codematrixvishal 916k (34×) [link](https://www.instagram.com/reel/DbZeJpoJKmm/) | a grid transforms; the determinant = how much area scales (links to reel 011) | Matrices & determinants | |
| W15 | f and f′ together: the slope becomes a graph | @codematrixvishal (115×), as @pyqvault_ M4 | slope 0 at every peak and valley | Application of derivatives | ✅ made 2026-10-20 (reel 015) |
| W16 | The quadratic formula is a square, completed | @codematrixvishal 1.10M (40×) [link](https://www.instagram.com/reel/DZPH3WfpKcB/), as @pyqvault_ M5 | x² + 6x as tiles: the 6x strip splits in two and wraps the square; the missing corner (3² = 9) completes it; the same move with b gives the formula | Quadratic equations | moved from @pyqvault_ (founder 2026-10-20) |

## @lws.pune topic scores

**Which idea to make next** (`lwspune-framework.md` F21, founder 2026-10-20). Same rubric as @pyqvault_'s (above), with
**"Law live" read as "Concept live"**: the idea shown working live (a moving picture + numbers that change with it + a
graph that draws itself). No exam-weight criterion here either: every row is an NDA maths chapter already (the gate),
and the goal of the reel is reach. `node reels/tools/topic-scores.js lwspune` checks the table and names the next pick.

| # | Subject | Idea | Proof (×) | Vivid | Question | Concept live | Everyday | Score | Status |
|---|---|---|---|---|---|---|---|---|---|
| W6 | M | The soda-can problem: the best shape | 114 | 2 | 2 | 1 | 1 | 9 | ⏸ parked (founder, 2026-10-20) |
| W11 | M | Why do we multiply probabilities? (the shrinking square) | 34 | 2 | 2 | 1 | 1 | 8 | ✅ made 2026-10-20 (`nda-maths-016-multiply`) |
| W14 | M | A matrix moves space (determinant = area scale) | 34 | 3 | 1 | 1 | 0 | 7 | |
| W8 | M | What a derivative really is: secant → tangent | 115 | 1 | 1 | 1 | 0 | 6 | |
| W7 | M | Derivatives go round: sin → cos → −sin → −cos | 66 | 2 | 1 | 1 | 0 | 6 | |
| W10 | M | Area between two curves (strips sweep) | 66 | 2 | 1 | 1 | 0 | 6 | |
| W9 | M | The whole unit circle on one screen | 779 | 2 | 0 | 0 | 0 | 5 | |
| W12 | M | What a logarithm is (exponential, flipped) | 46 | 1 | 1 | 1 | 0 | 5 | |
| W13 | M | Series formulas on one screen | 95 | 2 | 0 | 0 | 0 | 4 | |
| W16 | M | The quadratic formula is a square, completed (tiles) | 40 | 2 | 1 | 0 | 0 | 5 | |
| W15 | M | f and f′ together: the slope becomes a graph | 115 | 2 | 1 | 1 | 0 | 7 | ✅ made 2026-10-20 (reel 015) |

Anchors as above. The soda can's question: "Which can uses the least metal: tall, wide or equal?" (h = 2r); the
probability square's: "Two coins: both heads?" (½ · ½). The reference sheets (W9, W13) score low on purpose: no
question, nothing live; they stay as a "test format" for a later reach test, not the next pick.

## Re-run

`node reels/tools/remake-candidates.mjs` lists every ≥ 3× reel in `analytics/competitors/*.csv` by topic (rough
keyword tagging: always read the caption before adding a row). Add a new account's export first (the study script).
