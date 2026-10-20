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

## Topic scores

**Which idea to make next** (framework F21, founder 2026-10-20). Each open @pyqvault_ idea gets a score out of 10;
the next reel of the subject that's due (P → C) takes the **highest open score**, ties going to the better-proven
idea (the bigger views multiple). **@pyqvault_ is physics and chemistry only** (founder, 2026-10-20: they have the better
visual content); its maths ideas are closed below, and maths goes to @lws.pune. **No repeats** (founder, 2026-10-20): a
concept already made is not picked again, even under a new angle; such a row is parked with the reel it repeats. `node reels/tools/topic-scores.js` checks every row and prints the next pick per subject. The goal is
**engagement and reach**, so exam weight is deliberately *not* a criterion (founder). L35 checks whether a high score
really predicts watch time; the criteria are tuned from that.

| Criterion | Points | Anchors | Why |
|---|---|---|---|
| **Proof** | −1–3, worked out | their views ÷ their typical reel: ≥ 100× → 3 · ≥ 30× → 2 · ≥ 3× → 1 · our own idea (–) or 1–3× → 0 · **under 1× → −1** (a known flop) | demand already shown (F1); a flop is worse than no evidence (founder, 2026-10-20) |
| **Vivid** | 0–3 | 3 = many objects moving across the whole frame + colour changing (Boyle's molecules, the 8 families) · 2 = several moving parts or a strong colour change · 1 = one main object moving · 0 = mostly still | our 3 busiest reels were our top 3 (L30) |
| **Question** | 0–2 | 2 = a 2-second A/B/C guess with a surprising answer · 1 = a question that needs a sum or reading · 0 = no natural question | the opening that gets comments (L28, F4) |
| **Law live** | 0–1 | a live simulation + live numbers + a graph that draws itself | our best category and others' (F3, L27) |
| **Everyday** | 0–1 | something viewers have seen in real life (a pump getting hot, tea cooling, topspin) | reach beyond students: @mathsy.uk's #1 is a soda can (2.7M), Magnus 1.1M. Claude's addition, 2026-10-20: on test (L35) |

Re-score an idea when its angle changes, and keep a made idea's row (status "made") so its score can be checked
against its results. **Chemistry is thin:** the 5 accounts we studied have no proven chemistry left beyond the gas laws,
so C7–C11 are our own vivid ideas (proof 0) until a study of chemistry accounts finds proven ones. **P13–P18 and C12–C17
(2026-10-20, founder: "look at the CET notes for better ideas")** come from PYQ Vault's MHT-CET physics and chemistry
notes: concepts that pass F2–F4, with the question each reel opens on in the list below. Their PYQ counts are context for the
caption's "where it's asked" line only, not a score. Ties: the bigger views multiple, then the law shown live (F3), then the
order of this table. **P19–P29 (2026-10-20, founder: "take one physics chapter")** cover Ray Optics concept by concept
(list below). Their Proof column records what other accounts' reels of the same idea did, flops included (under 1× costs a point).

| # | Subject | Idea | Proof (×) | Vivid | Question | Law live | Everyday | Score | Status |
|---|---|---|---|---|---|---|---|---|---|
| P5 | P | Adiabatic squeeze heats the gas (insulated vs open, side by side) | 125 | 3 | 2 | 1 | 1 | 10 | ✅ made 2026-10-20 (`pv-physics-005-adiabatic`) |
| P9 | P | Heat flows hot → cold, never back (two chambers mixing) | 54 | 3 | 1 | 1 | 1 | 8 | ✅ made 2026-10-20 (`pv-physics-007-heat`) |
| P11 | P | 30° and 60° land in the same spot (a fan of launch angles) | 11 | 3 | 2 | 1 | 1 | 8 | |
| P12 | P | Topspin dips, slice floats (Magnus, streamlines) | 63 | 3 | 2 | 0 | 1 | 8 | ✅ made 2026-10-20 (`pv-physics-006-topspin`) |
| P6 | P | Same lift, faster = more power | 76 | 1 | 2 | 1 | 1 | 7 | |
| P7 | P | Tilt the rope: lift vs pull (drone towing a box) | 83 | 2 | 1 | 1 | 1 | 7 | |
| P8 | P | Why a bounced ball never comes back as high | 52 | 1 | 1 | 1 | 1 | 6 | |
| P10 | P | One-screen sheet: Class 12 electricity & magnetism | 190 | 2 | 0 | 0 | 0 | 5 | |
| P13 | P | Rolling race: ring, disc and ball down one slope (CET notes) | – | 3 | 2 | 1 | 1 | 7 | |
| P14 | P | A magnet dropped down a copper pipe falls in slow motion (CET notes) | – | 3 | 2 | 1 | 1 | 7 | |
| P15 | P | Bright red light frees no electrons, dim violet does (CET notes) | – | 3 | 2 | 1 | 1 | 7 | |
| P16 | P | Red star or blue star: which is hotter? (Wien, CET notes) | – | 3 | 2 | 1 | 1 | 7 | |
| P17 | P | Join a small and a big soap bubble: the big one grows (CET notes) | – | 2 | 2 | 1 | 1 | 6 | |
| P18 | P | A laser follows a curved water jet (total internal reflection, CET notes) | – | 2 | 2 | 1 | 1 | 6 | ⏸ parked: total internal reflection is P20's mirage, the everyday angle (founder, 2026-10-20) |
| P19 | P | White light through a prism: violet bends most (dispersion, Ray Optics) | 0.5 | 3 | 2 | 1 | 1 | 6 | |
| P20 | P | The "water" on a hot road is the sky (mirage, Ray Optics) | 0.4 | 3 | 2 | 0 | 1 | 5 | |
| P21 | P | Cover half the lens: the whole image stays, dimmer (Ray Optics) | 0.9 | 2 | 2 | 1 | 1 | 5 | |
| P22 | P | A 2 m pool looks 1.5 m deep (apparent depth, Ray Optics) | – | 2 | 2 | 1 | 1 | 6 | |
| P23 | P | Walk a candle up to a convex lens: the image flips upright (Ray Optics) | – | 2 | 2 | 1 | 1 | 6 | |
| P24 | P | Your face in a spoon: upside down, then upright up close (concave mirror, Ray Optics) | 10.5 | 2 | 2 | 1 | 1 | 7 | ✅ made 2026-10-21 (`pv-physics-008-spoon`, first of Ray Optics) |
| P25 | P | A magnifying glass under water barely magnifies (lensmaker, Ray Optics) | – | 2 | 2 | 1 | 1 | 6 | |
| P26 | P | A half-height mirror shows your whole body, at any distance (Ray Optics) | – | 1 | 2 | 1 | 1 | 5 | |
| P27 | P | A bigger telescope lens: a brighter moon, not a bigger one (Ray Optics) | – | 2 | 2 | 0 | 1 | 5 | |
| P28 | P | Turn a prism: the bend dips, then rises (minimum deviation, Ray Optics) | – | 2 | 2 | 1 | 0 | 5 | |
| P29 | P | "Objects in mirror are closer than they appear" (convex mirror, Ray Optics) | 6.2 | 2 | 2 | 1 | 1 | 7 | |
| C5 | C | P, V and T together (combined gas law) | 11 | 2 | 2 | 1 | 1 | 7 | ✅ made 2026-10-20 (`pv-chem-005-pvt`) |
| C7 | C | Flame colours: each metal burns its own colour (fireworks) | – | 3 | 2 | 0 | 1 | 6 | ✅ made 2026-10-20 (`pv-chem-006-flame`) |
| C8 | C | Split water: hydrogen fills twice as fast as oxygen | – | 3 | 2 | 1 | 0 | 6 | |
| C9 | C | The pH rainbow: universal indicator from lemon to soap | – | 3 | 2 | 0 | 1 | 6 | |
| C11 | C | Diffusion: dye in hot vs cold water | – | 2 | 2 | 0 | 1 | 5 | ⏸ parked: close to Chemistry #1, heat speeds things up (founder, 2026-10-20) |
| C10 | C | Cool the brown gas: NO₂ ⇌ N₂O₄ shifts (Le Chatelier) | – | 2 | 2 | 0 | 0 | 4 | |
| C12 | C | Heat it by 10 °C: the rate doubles (collisions over the energy hill, CET notes) | – | 3 | 2 | 1 | 1 | 7 | ⏸ parked: repeats Chemistry #1, heat → rate (founder, 2026-10-20) |
| C13 | C | Half-life: 64 atoms, 2 half-lives, 16 left (CET notes) | – | 3 | 2 | 1 | 1 | 7 | ✅ made 2026-10-20 (`pv-chem-007-halflife`, first voiceover) |
| C14 | C | Stack the oranges: 52%, 68% or 74% filled (packing efficiency, CET notes) | – | 3 | 2 | 1 | 1 | 7 | |
| C15 | C | A zinc rod in blue copper sulphate: copper coats it, the blue fades (CET notes) | – | 3 | 2 | 1 | 0 | 6 | |
| C16 | C | Why water is bent: lone pairs squeeze 109.5° → 104.5° (VSEPR, CET notes) | – | 2 | 2 | 1 | 1 | 6 | |
| C17 | C | Salt makes water boil hotter, not faster (boiling-point elevation, CET notes) | – | 2 | 2 | 1 | 1 | 6 | |

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

### @pyqvault_ · our own ideas from the MHT-CET notes (2026-10-20)

From `Question_Bank/src/app/notes/mht-cet-physics` and `mht-cet-chemistry` (read-only). No proven reel behind them (proof 0),
so their results test whether a vivid unproven idea holds viewers (L35).

| # | Idea | The question on frame 0 → answer | The picture | CET chapter (PYQs) |
|---|---|---|---|---|
| P13 | Rolling race | Ring, disc, ball down one slope: which is first? → the ball | three bodies race; each one's energy bar splits into moving + spinning live; mass doesn't matter, shape does | Rotational dynamics · rolling (37) |
| P14 | Magnet in a copper pipe | Dropped down a copper pipe it falls normally, slower or faster? → far slower | the magnet drifts down; induced current rings glow in the pipe and push back (Lenz) | EM induction · magnetic braking (27) |
| P15 | Photoelectric effect | Bright red light on a metal frees more, none or faster electrons? → none | a stream of photons; red ones bounce off however bright, violet ones knock electrons out; KE = hf − φ live | Dual nature · photoelectric (87) |
| P16 | Red star, blue star | Which is hotter: red, blue or same? → blue | a body heats from red to white to blue; the black-body curve's peak slides left (Wien) and its area grows as T⁴ | Radiation · Wien, Stefan (93) |
| P17 | Two soap bubbles joined | Join a small and a big bubble: which grows? → the big one | air flows from small to big; ΔP = 4T/r live | Fluids · excess pressure (63) |
| P18 | Light in a water jet | A laser into a curving jet: straight out or along the water? → along it | the beam bounces inside the jet at more than the critical angle; how fibre internet works | Ray optics · total internal reflection (37) |
| C12 | Heat it by 10 °C | The rate: +10%, ×2 or ×10? → about ×2 | many molecules colliding; only those over the energy hill spark and react; the energy curve shifts as it warms | Chemical kinetics · Arrhenius, collision theory (18) |
| C13 | Half-life | 64 atoms, 2 half-lives: 0, 16 or 32 left? → 16 | dots flick off at random; the count halves each half-life; carbon dating | Chemical kinetics · first order (77) |
| C14 | Stack the oranges | The best you can fill a box: 52%, 68% or 74%? → 74% | 3D spheres stack three ways (simple cubic, bcc, fcc) with the fill % live | Solid state · packing efficiency (49) |
| C15 | Zinc in copper sulphate | The rod stays, turns copper-coloured, or fizzes? → copper coats it, the blue fades | Cu²⁺ ions take electrons from zinc; the blue fades as they leave; E° from the series | Electrochemistry · galvanic cells (73) |
| C16 | Why water is bent | Water's angle: 109.5°, 104.5° or 90°? → 104.5° | CH₄ → NH₃ → H₂O: lone pairs push the bonds closer, angle live; a 3D shape (orbit fits) | Chemical bonding · VSEPR |
| C17 | Salt in boiling water | Water boils at a lower, higher or the same temperature? → higher | solute particles block the surface; the boiling point rises with i·m (a kitchen myth busted) | Solutions · boiling-point elevation (43) |

### @pyqvault_ · one chapter, concept by concept: Ray Optics (2026-10-20)

Founder: "take one physics chapter, identify the concepts which can be explained visually." Ray Optics (Class 12): no reel of
ours covers it yet, light suits the glow (L42), and it has everyday hooks; 112 MHT-CET PYQs. Concepts from
`Question_Bank/src/app/notes/mht-cet-physics/ray-optics` (read-only); several questions are the notes' own "common
mistakes". Left out: lens combinations and lensmaker sums (worked on paper, nothing to watch).

**Evidence** (`analytics/competitors/`, read 17 Oct): @bisal.physics posted an optics run on 12–15 Oct (reels 2–5 days old
when read). **Mirrors won**: concave mirror image 89k (10.5×), convex mirror 52k (6.2×), tilted mirror 2θ 20k (2.3×).
**The rest lost**: sliced lens 0.9×, two lenses 1.1×, prism 0.5×, total internal reflection 0.3×. @sciencevisualised's
mirage (0.4×) and refraction (0.1×) also lost. Read their multiples again before trusting them.

| # | Idea | The question on frame 0 → answer | The picture | Evidence | CET notes section |
|---|---|---|---|---|---|
| P19 | Prism and dispersion | White light into a prism: which bends most? red, violet or all the same → violet | a white beam enters and fans out into glowing colours; each colour's bend live | @bisal.physics 0.5× [link](https://www.instagram.com/reel/DebJu8pSlr6/) | Prism · dispersion |
| P20 | Mirage on a hot road | The "water" on a hot road is: real water, the sky, or heat haze? → the sky | hot air layers shimmer; a ray from the sky curves up into the eye; the "puddle" appears | @sciencevisualised 0.4× [link](https://www.instagram.com/reel/DcCpnCSKfKM/) | Refraction · total internal reflection |
| P21 | Half-covered lens | Cover half the lens: half the image, the whole image dimmer, or none? → whole, dimmer | candle, lens, screen; a card slides over half the lens; the open half still draws the whole flame; brightness % live (a finger on a phone camera) | @bisal.physics sliced lens 0.9× [link](https://www.instagram.com/reel/Deg9x1hyS5X/) | Mirrors · "a half-covered mirror forms half an image" (mistake) |
| P22 | Apparent depth | A 2 m pool looks: 2 m, 1.5 m or 2.7 m deep? → 1.5 m | water fills; rays from a coin bend at the surface; a ghost coin rises with the water; real vs apparent depth draws | related, not counted: @sciencevisualised refraction 0.1× | Refraction · apparent depth |
| P23 | Convex lens: walk the candle in | Closer than f, the image is: smaller, inverted and bigger, or upright and bigger? → upright and bigger | the image grows inverted, runs off to infinity at f, returns upright (a magnifying glass); v–u graph draws | related, not counted: @bisal.physics two lenses 1.1× | Lenses · lens formula |
| P24 | Concave mirror: the spoon | Upside down in a spoon; bring it to your nose? → it flips upright | the same flip in a mirror; ray rules drawn; mirror formula live | @bisal.physics concave mirror 10.5× [link](https://www.instagram.com/reel/DeZOe3Sy5Fb/) | Mirrors · mirror formula |
| P25 | Glass lens in water | A magnifying glass under water: same, stronger, or much weaker? → much weaker (f about 4×) | water floods round the lens; rays bend less; f live; why eyes blur underwater and goggles fix it | – | Lenses · "using the glass's own index in water" (mistake) |
| P26 | Whole-body mirror | How tall a mirror to see all of you: your height, half, or it depends on distance? → half, at any distance | a person walks back; the strip of mirror used stays the same size | – | Mirrors · plane mirrors |
| P27 | Telescope aperture | A bigger front lens makes the moon: bigger, brighter, or both? → brighter | more rays pour in; image brightness climbs, size stays | – | Instruments · "a large aperture raises the magnification" (mistake) |
| P28 | Minimum deviation | Keep turning a prism: does the bend keep growing? → no, it dips, then rises | the prism turns; the U-shaped deviation curve draws itself | – | Prism · minimum deviation |
| P29 | Convex mirror: "closer than they appear" | A car in the wing mirror is: closer, farther, or as far as it looks? → closer | a car approaches; its image stays small behind the mirror; wider view than a flat mirror | @bisal.physics convex mirror 6.2× [link](https://www.instagram.com/reel/Deb17aCSjg2/) | Mirrors · mirror formula |

### @pyqvault_ · Maths, visualised: closed 2026-10-20 (founder: @pyqvault_ is physics and chemistry only)

**Closed** (founder, 2026-10-20): @pyqvault_ keeps physics and chemistry, which have the better visual content. M1 and M2
were posted; M3 was rejected; M4 moved to @lws.pune (reel 015) and M5 to @lws.pune's list (W16). M6–M9 stay here as a
record; any of them can move to @lws.pune when it fits the NDA list. Was: the third @pyqvault_ series, in rotation with Physics and Chemistry (P → C → M), same house settings (short labels,
no exam question, pyqvault.com). **No overlap with @lws.pune:** each maths idea belongs to one handle only (the NDA list
below keeps the soda can, derivative wheel, secant → tangent, unit-circle sheet, area between curves, probability,
logarithms, series and matrix transformations; and, since 2026-10-20, **f and f′ together**, moved to @lws.pune as reel 015).

| # | Remake | Proof (views, × their typical reel) | Our angle | Chapter | Look | Status |
|---|---|---|---|---|---|---|
| M1 | Sine and cosine in motion: a point circles, its waves unroll | @codematrixvishal 3.10M (113×) [link](https://www.instagram.com/reel/DbKeNVpps4y/); 783k (29×) [link](https://www.instagram.com/reel/DbfKhhnJh4-/) | the height and the width of one turning point draw sin and cos side by side, live | 11 · Trigonometric functions | white | ✅ made (`pv-maths-001-sin-cos`) |
| M2 | Calculus in 60 seconds: limit → derivative → integral | @ubilumapp 599k (55×) [link](https://www.instagram.com/reel/DcwfuB6Omyy/) | one curve, three ideas in a row: zoom in (limit), slope (derivative), strips (integral) | 11–12 · Limits, derivatives, integrals | lab | ✅ made (`pv-maths-002-calculus`) |
| M3 | e: why 2.718…? | @codematrixvishal 1.59M (58×) [link](https://www.instagram.com/reel/Dbqgimsp0bk/) | ₹1 at 100% interest, compounded more and more often: the total climbs and stops at e | 11–12 · Exponential & log functions | white | ✅ made, predict-first (`pv-maths-003-e`) |
| M4 | f and f′ together: the slope becomes a graph | @codematrixvishal 651k (24×) [link](https://www.instagram.com/reel/DdvWvQlJu86/); 3.14M (115×) [link](https://www.instagram.com/reel/DXq3MMKiQWi/) | a tangent slides along a cubic and drops its slope as a dot that draws f′ below | 12 · Continuity & differentiability | lab || ↪ moved to @lws.pune: `nda-maths-015-slope-graph` (founder 2026-10-20) |
| M5 | The quadratic formula is a square, completed | @codematrixvishal 1.10M (40×) [link](https://www.instagram.com/reel/DZPH3WfpKcB/) | x² + bx is cut and moved into an almost-square; the missing corner is (b/2)² | 11 · Quadratic equations | white | ↪ moved to @lws.pune as W16 (founder 2026-10-20) |
| M6 | e^(iθ): multiplying by i turns 90° | @codematrixvishal 453k (17×) [link](https://www.instagram.com/reel/Dbhl5GMpsNR/) | a point on the Argand plane rotates; cos θ + i sin θ traced live | 11 · Complex numbers | lab | |
| M7 | What is integration? Rectangles get thinner | @mathsy.uk 459k (19×) [link](https://www.instagram.com/reel/C4wUT11tpvK/) | n rectangles → 4, 8, 64…; live sum closes in on the exact area | 12 · Integrals | white | |
| M8 | The equation of a circle is just Pythagoras | @mathsy.uk 350k (15×) [link](https://www.instagram.com/reel/C_WEKTaN59m/) | a point goes round; its right triangle gives (x − a)² + (y − b)² = r² | 11 · Conic sections | lab | |
| M9 | Every type of matrix on one screen | @codematrixvishal 952k (35×) [link](https://www.instagram.com/reel/DZKSkRDJuDv/) | reference sheet that builds itself (L27 format test), each type lit in a 3×3 grid | 12 · Matrices | white | test format |

Left out on purpose: Class 9–10 formula sheets (mensuration 1.87M, algebra identities 426k), number tricks and
"beauty of maths" reels: big views, but not our syllabus.

Chemistry has only 4 strong proven ideas so far (the studied accounts are mostly physics/maths). **Next study: a
chemistry visual account**, to fill C5 onwards.

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
