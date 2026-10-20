# Remake backlog: proven reels, remade our way

Founder's call (2026-10-18): instead of inventing every topic, pick reels that **already worked** for the creators we
studied and that sit on **our syllabus**, then remake them. Picked from every reel saved in `analytics/competitors/`
(5 accounts) that reached **≥ 3× that creator's typical reel**, minus spectacle that isn't on any syllabus (number
tricks, "math sounds like", parametric art).

**Rules for a remake**
- We take the **idea** (the topic and the kind of picture), never their video, frames, text, voice or music.
  Everything is drawn in our own look (Remotion template `remotion/src/PvPhysics004.tsx`, framework F11) with our own words.
- **Better, not the same:** add what theirs lacks, usually the *why* (a live count, a second picture, a graph that
  morphs) and our house rules (`pyqvault-insta.md` / `lwspune-insta.md`).
- The caption kit (`<reel>.md`) names the source reel in a "Proven idea" line, so the numbers can be compared later.
- Each one still needs its physics/maths re-checked in its tests, and a real PYQ (@lws.pune) or a "where it's asked"
  line (@pyqvault_).
- When a remake is posted, fill its row in `learnings.md` (@lws.pune) or `pyqvault-learnings.md` (@pyqvault_): did a
  proven idea beat our own ideas on our account?

## Topic scores

**Which idea to make next** (framework F21, founder 2026-10-20). Each open @pyqvault_ idea gets a score out of 10;
the next reel of the subject that's due (P → C → M) takes the **highest open score**, ties going to the better-proven
idea. `node reels/tools/topic-scores.js` checks every row and prints the next pick per subject. The goal is
**engagement and reach**, so exam weight is deliberately *not* a criterion (founder). L35 checks whether a high score
really predicts watch time; the criteria are tuned from that.

| Criterion | Points | Anchors | Why |
|---|---|---|---|
| **Proof** | 0–3, worked out | their views ÷ their typical reel: ≥ 100× → 3 · ≥ 30× → 2 · ≥ 3× → 1 · our own idea (–) → 0 | demand already shown (F1) |
| **Vivid** | 0–3 | 3 = many objects moving across the whole frame + colour changing (Boyle's molecules, the 8 families) · 2 = several moving parts or a strong colour change · 1 = one main object moving · 0 = mostly still | our 3 busiest reels were our top 3 (L30) |
| **Question** | 0–2 | 2 = a 2-second A/B/C guess with a surprising answer · 1 = a question that needs a sum or reading · 0 = no natural question | the opening that gets comments (L28, F4) |
| **Law live** | 0–1 | a live simulation + live numbers + a graph that draws itself | our best category and others' (F3, L27) |
| **Everyday** | 0–1 | something viewers have seen in real life (a pump getting hot, tea cooling, topspin) | reach beyond students: @mathsy.uk's #1 is a soda can (2.7M), Magnus 1.1M. Claude's addition, 2026-10-20: on test (L35) |

Re-score an idea when its angle changes, and keep a made idea's row (status "made") so its score can be checked
against its results. **Chemistry is thin:** the 5 accounts we studied have no proven chemistry left beyond the gas laws,
so C7–C11 are our own vivid ideas (proof 0) until a study of chemistry accounts finds proven ones.

| # | Subject | Idea | Proof (×) | Vivid | Question | Law live | Everyday | Score | Status |
|---|---|---|---|---|---|---|---|---|---|
| P5 | P | Adiabatic squeeze heats the gas (insulated vs open, side by side) | 125 | 3 | 2 | 1 | 1 | 10 | ✅ made 2026-10-20 (`pv-physics-005-adiabatic`) |
| P9 | P | Heat flows hot → cold, never back (two chambers mixing) | 54 | 3 | 1 | 1 | 1 | 8 | |
| P11 | P | 30° and 60° land in the same spot (a fan of launch angles) | 11 | 3 | 2 | 1 | 1 | 8 | |
| P12 | P | Topspin dips, slice floats (Magnus, streamlines) | 63 | 3 | 2 | 0 | 1 | 8 | |
| P6 | P | Same lift, faster = more power | 76 | 1 | 2 | 1 | 1 | 7 | |
| P7 | P | Tilt the rope: lift vs pull (drone towing a box) | 83 | 2 | 1 | 1 | 1 | 7 | |
| P8 | P | Why a bounced ball never comes back as high | 52 | 1 | 1 | 1 | 1 | 6 | |
| P10 | P | One-screen sheet: Class 12 electricity & magnetism | 190 | 2 | 0 | 0 | 0 | 5 | |
| C5 | C | P, V and T together (combined gas law) | 11 | 2 | 2 | 1 | 1 | 7 | ✅ made 2026-10-20 (`pv-chem-005-pvt`) |
| C7 | C | Flame colours: each metal burns its own colour (fireworks) | – | 3 | 2 | 0 | 1 | 6 | |
| C8 | C | Split water: hydrogen fills twice as fast as oxygen | – | 3 | 2 | 1 | 0 | 6 | |
| C9 | C | The pH rainbow: universal indicator from lemon to soap | – | 3 | 2 | 0 | 1 | 6 | |
| C11 | C | Diffusion: dye in hot vs cold water | – | 2 | 2 | 0 | 1 | 5 | |
| C10 | C | Cool the brown gas: NO₂ ⇌ N₂O₄ shifts (Le Chatelier) | – | 2 | 2 | 0 | 0 | 4 | |
| M4 | M | f and f′ together: the slope becomes a graph | 115 | 2 | 1 | 1 | 0 | 7 | ↪ moved to @lws.pune (reel 015, founder 2026-10-20) |
| M5 | M | The quadratic formula is a square, completed | 40 | 2 | 1 | 0 | 0 | 5 | |
| M7 | M | What is integration? Rectangles get thinner | 19 | 2 | 1 | 1 | 0 | 5 | |
| M9 | M | Every type of matrix on one screen | 35 | 2 | 0 | 0 | 0 | 4 | |
| M6 | M | e^(iθ): multiplying by i turns 90° | 17 | 1 | 1 | 0 | 0 | 3 | |
| M8 | M | The equation of a circle is just Pythagoras | 15 | 1 | 1 | 0 | 0 | 3 | |

## @pyqvault_ (Class 11–12 Physics and Chemistry): the proven ideas (pick by **Topic scores** above)

Rotation: Physics → Chemistry → Maths; background follows the L22 test, music the L34 rotation (`pyqvault-framework.md`).

| # | Remake | Proof (views, × their typical reel) | Our angle | Chapter | Look | Status |
|---|---|---|---|---|---|---|
| P2 | Boyle's law: piston squeezes a gas | @codematrixvishal 3.52M (129×) [link](https://www.instagram.com/reel/DaUw5t1JB1Z/); @bisal.physics 774k (91×) [link](https://www.instagram.com/reel/DdvUfF_S6o2/) | 3D cylinder + a live **count of hits on the piston** (×2, ×4): the why they don't show | 11 · Kinetic theory | white | ✅ made (`pv-physics-002-boyle`) |
| C2 | The periodic table's 8 families | @sciencevisualised 4.45M (256×) [link](https://www.instagram.com/reel/DcFiAVwKFIg/) | the table fills family by family; each family's one shared trait as a short label | 11 · Classification of elements | **lab** | ✅ made (`pv-chem-002-families`) |
| P3 | Pendulum: energy trades places | @sciencevisualised 2.60M (150×) [link](https://www.instagram.com/reel/DcbO-NOMudT/) | 3D pendulum, live PE / KE / total bars, total never moves | 11 · Work, energy & power | lab | ✅ made (`pv-physics-003-pendulum`) |
| C3 | Avogadro: add gas, the volume grows | @bisal.physics 421k (50×) [link](https://www.instagram.com/reel/Dd5lqeJy6e7/) | particles added one by one, the free piston rises in step; V ∝ n live | 11 · States of matter | white | ✅ made (`pv-chem-003-avogadro`) |
| P4 | Forces on a slope: mg sin θ, mg cos θ | @mathsy.uk 1.50M (63×) [link](https://www.instagram.com/reel/C3_I1WSKmyF/) | 3D block on a ramp that tilts; the two parts of gravity grow/shrink live; it slides when sin θ wins | 11 · Laws of motion | white | ✅ made, predict-first (`pv-physics-004-slope`) |
| C4 | Charles's law: heat it, it expands | @codematrixvishal 807k (30×) [link](https://www.instagram.com/reel/DaXyLxWJDbn/) | faster particles push a free piston up; V–T line through absolute zero | 11 · States of matter | lab | ✅ made, predict-first (`pv-chem-004-charles`) |
| P5 | Adiabatic squeeze heats the gas | @bisal.physics 1.06M (125×) [link](https://www.instagram.com/reel/Dd-vzrQSvZx/) | insulated vs open cylinder side by side; thermometer and particle speed rise only in one | 11 · Thermodynamics | lab | |
| P6 | Work vs power: same lift, faster = more power | @sciencevisualised 1.33M (76×) [link](https://www.instagram.com/reel/Dc6jyHPqN27/) | two lifts, same work bar, different power bars | 11 · Work, energy & power | white | |
| P7 | Vector components: tilt the rope, lift vs pull | @sciencevisualised 1.45M (83×) [link](https://www.instagram.com/reel/Dc9MzBgKwJS/) | 3D drone towing a box; angle slider, F cos θ / F sin θ bars live | 11 · Vectors / laws of motion | white | |
| P8 | Why a bounced ball never comes back as high | @sciencevisualised 908k (52×) [link](https://www.instagram.com/reel/DbnqvWgMo8b/) | heights shrink by e² each bounce; energy lost per bounce as bars | 11 · Work, energy & power | lab | |
| P9 | Heat flows hot → cold, never back | @bisal.physics 457k (54×) [link](https://www.instagram.com/reel/DeGfT9iyQd3/) | two chambers, fast/slow particles mixing until the speeds even out | 11 · Thermodynamics | white | |
| P10 | One-screen sheet: Class 12 electricity & magnetism laws | @codematrixvishal 5.21M (190×) [link](https://www.instagram.com/reel/DZGBPbdzgsS/) | the **reference-sheet** format (L27): each law appears with a tiny live picture, built to be saved | 12 · Electrostatics → EMI | lab | test format |
| P11 | 30° and 60° land in the same spot | @sciencevisualised 193k (11×) [link](https://www.instagram.com/reel/Dc3b1oVsuzr/) | a fan of projectiles (15°–75°) launched together, each its own colour; twin pairs (30°/60°, 15°/75°) land together; range readout; sin 2θ twin angles | 11 · Projectile motion | white | |
| P12 | Topspin dips, slice floats (Magnus) | @sciencevisualised 1.10M (63×) [link](https://www.instagram.com/reel/Dbvz1s7M3C6/) | 3D spinning ball, pressure arrows above/below (Bernoulli) | 11 · Fluids | lab | |
| C5 | P, V and T together (combined gas law) | @codematrixvishal 299k (11×) [link](https://www.instagram.com/reel/DX13CZTJdVK/) | one piston: heat it, squeeze it, three live gauges; P·V/T never moves | 11 · States of matter | lab | |

### @pyqvault_ · Maths, visualised (Class 11–12; added 2026-10-18, founder)

The third @pyqvault_ series, in rotation with Physics and Chemistry (P → C → M), same house settings (short labels,
no exam question, pyqvault.com). **No overlap with @lws.pune:** each maths idea belongs to one handle only (the NDA list
below keeps the soda can, derivative wheel, secant → tangent, unit-circle sheet, area between curves, probability,
logarithms, series and matrix transformations; and, since 2026-10-20, **f and f′ together**, moved to @lws.pune as reel 015).

| # | Remake | Proof (views, × their typical reel) | Our angle | Chapter | Look | Status |
|---|---|---|---|---|---|---|
| M1 | Sine and cosine in motion: a point circles, its waves unroll | @codematrixvishal 3.10M (113×) [link](https://www.instagram.com/reel/DbKeNVpps4y/); 783k (29×) [link](https://www.instagram.com/reel/DbfKhhnJh4-/) | the height and the width of one turning point draw sin and cos side by side, live | 11 · Trigonometric functions | white | ✅ made (`pv-maths-001-sin-cos`) |
| M2 | Calculus in 60 seconds: limit → derivative → integral | @ubilumapp 599k (55×) [link](https://www.instagram.com/reel/DcwfuB6Omyy/) | one curve, three ideas in a row: zoom in (limit), slope (derivative), strips (integral) | 11–12 · Limits, derivatives, integrals | lab | ✅ made (`pv-maths-002-calculus`) |
| M3 | e: why 2.718…? | @codematrixvishal 1.59M (58×) [link](https://www.instagram.com/reel/Dbqgimsp0bk/) | ₹1 at 100% interest, compounded more and more often: the total climbs and stops at e | 11–12 · Exponential & log functions | white | ✅ made, predict-first (`pv-maths-003-e`) |
| M4 | f and f′ together: the slope becomes a graph | @codematrixvishal 651k (24×) [link](https://www.instagram.com/reel/DdvWvQlJu86/); 3.14M (115×) [link](https://www.instagram.com/reel/DXq3MMKiQWi/) | a tangent slides along a cubic and drops its slope as a dot that draws f′ below | 12 · Continuity & differentiability | lab || ↪ moved to @lws.pune: `nda-maths-015-slope-graph` (founder 2026-10-20) |
| M5 | The quadratic formula is a square, completed | @codematrixvishal 1.10M (40×) [link](https://www.instagram.com/reel/DZPH3WfpKcB/) | x² + bx is cut and moved into an almost-square; the missing corner is (b/2)² | 11 · Quadratic equations | white | |
| M6 | e^(iθ): multiplying by i turns 90° | @codematrixvishal 453k (17×) [link](https://www.instagram.com/reel/Dbhl5GMpsNR/) | a point on the Argand plane rotates; cos θ + i sin θ traced live | 11 · Complex numbers | lab | |
| M7 | What is integration? Rectangles get thinner | @mathsy.uk 459k (19×) [link](https://www.instagram.com/reel/C4wUT11tpvK/) | n rectangles → 4, 8, 64…; live sum closes in on the exact area | 12 · Integrals | white | |
| M8 | The equation of a circle is just Pythagoras | @mathsy.uk 350k (15×) [link](https://www.instagram.com/reel/C_WEKTaN59m/) | a point goes round; its right triangle gives (x − a)² + (y − b)² = r² | 11 · Conic sections | lab | |
| M9 | Every type of matrix on one screen | @codematrixvishal 952k (35×) [link](https://www.instagram.com/reel/DZKSkRDJuDv/) | reference sheet that builds itself (L27 format test), each type lit in a 3×3 grid | 12 · Matrices | white | test format |

Left out on purpose: Class 9–10 formula sheets (mensuration 1.87M, algebra identities 426k), number tricks and
"beauty of maths" reels: big views, but not our syllabus.

Chemistry has only 4 strong proven ideas so far (the studied accounts are mostly physics/maths). **Next study: a
chemistry visual account**, to fill C5 onwards.

## @lws.pune (NDA Maths "Why?" series), each still ending on a real NDA PYQ

| # | Remake | Proof | Our angle (the "why") | NDA chapter | Status |
|---|---|---|---|---|---|
| W6 | The soda-can problem: the best shape | @mathsy.uk 2.74M (114×) [link](https://www.instagram.com/reel/C4nXYzzKdHe/), their #1 ever | 3D can morphs tall ↔ wide at fixed volume; surface-area graph has a low point where h = 2r | Application of derivatives (max/min) | next |
| W7 | Derivatives go round in a circle: sin → cos → −sin → −cos | @mathsy.uk 1.59M (66×) [link](https://www.instagram.com/reel/C4c9UQKq_UO/) | each derivative = the curve shifted a quarter turn; the wheel turns | Differentiation | |
| W8 | What a derivative really is (secant → tangent) | @codematrixvishal 3.14M (115×) [link](https://www.instagram.com/reel/DXq3MMKiQWi/); @mathsy.uk 1.24M (52×) [link](https://www.instagram.com/reel/C4sodsGow6W/) | h shrinks live, the slope readout settles; f and f′ drawn together | Limits & differentiation | |
| W9 | The whole unit circle on one screen | @codematrixvishal 21.3M (779×) [link](https://www.instagram.com/reel/DbXW1vxJ-7-/), the biggest reel we've seen | reference sheet that builds itself; the 30-45-60 triangles explain every value | Trigonometry | test format |
| W10 | Area between two curves | @codematrixvishal 1.80M (66×) [link](https://www.instagram.com/reel/Dd0ByRkjOhZ/) | strips sweep between the curves; top minus bottom | Area under curves | |
| W11 | Why do we multiply probabilities? | @mathsy.uk 822k (34×) [link](https://www.instagram.com/reel/DOqyBeBjbpu/) | the shrinking square: each "and" cuts the space | Probability | |
| W12 | What a logarithm is (exponential, flipped) | @mathsy.uk 1.10M (46×) [link](https://www.instagram.com/reel/DNrQxTaVBtF/) | y = aˣ reflected in y = x, live | Logarithms | |
| W13 | Series formulas on one screen | @codematrixvishal 2.61M (95×) [link](https://www.instagram.com/reel/DZr28L5p89C/) | reference sheet; each sum shown as a picture (staircases, squares) | Sequences & series | test format |
| W14 | A matrix moves space | @codematrixvishal 916k (34×) [link](https://www.instagram.com/reel/DbZeJpoJKmm/) | a grid transforms; the determinant = how much area scales (links to reel 011) | Matrices & determinants | |

## Re-run

`node reels/tools/remake-candidates.mjs` lists every ≥ 3× reel in `analytics/competitors/*.csv` by topic (rough
keyword tagging: always read the caption before adding a row). Add a new account's export first (the study script).
