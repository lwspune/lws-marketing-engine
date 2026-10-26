# @pyqvault_ idea list

**The one place @pyqvault_'s reel ideas live** (founder, 2026-10-21): every future reel is made from a row here. An idea gets
in only if it passes **the test** below; it is then **scored** (weights frozen since framework v1.33: the score didn't predict our results, L35).
`node reels/tools/topic-scores.js pyqvault` checks the whole file and names the next pick per subject (P → C);
`--calibrate` runs the tuning. Framework: `pyqvault-framework.md` (F1, F21, F28, F29). @lws.pune's ideas stay in
`remake-backlog.md` until it is rebuilt.

**Open: 82 ideas · about 82 days at 1 reel a day.**

Refill before it drops under two weeks. Sources (F1): the founder's ideas (Source `founder`, any time), a notes sweep
(physics and chemistry are done; a new exam's notes next), and the next competitor read (`node reels/tools/remake-candidates.mjs`).

## The test

An idea is added only when it passes every point; one that fails is parked with the point it failed. The tool checks the ones
marked ⚙.

| Point | The question | Who |
|---|---|---|
| **F29 · No words** ⚙ | Take every word out (question, labels, captions): does the picture alone still show *what happens and why*? Motion, colour, arrows, gauges, graphs, numbers and symbols count as picture. Written as the card's **Without words** beats. | every idea, remakes too |
| **F4 · A 2-second guess** ⚙ | Does frame 0 ask an A/B/C question answerable in 2 seconds? (Guess 2) | notes and founder ideas (F28) |
| **F2 · Vivid** ⚙ | Several things moving or a strong colour change? (Vivid ≥ 2) | notes and founder ideas (F28) |
| **F7 · Short labels** | Can every label be 7 words or fewer, with no derivation? | every idea |
| **F10 · Honest** | Is it true without faking anything (time-lapses and scale labelled)? | every idea |
| **F17, F18 · Muted, short** | Does it work with the sound off, in 25 s or less? | every idea |
| **F19 · Subject** | Physics or chemistry? | every idea |
| **F21 · No repeat** | Not a concept we've already made, even from a new angle? | every idea |
| **F28 · One read per chapter** ⚙ | A notes idea's chapter is in the Concept sweep log. | notes ideas |

## Scoring

**Score = Σ (points × weight) ÷ Σ (best points × weight), out of 100** (framework F21). Every weight started at 1
(2026-10-21). The test decides what gets in; the score only ranks what passed. Ties go to the bigger views multiple, then to
the idea that shows its law live (F3). No exam weight: the goal is engagement and reach (founder, 2026-10-20).

| Criterion | Key | Points | Weight | Anchors |
|---|---|---|---|---|
| Proof | proof | −1–3 | 1 | their views ÷ their typical reel: ≥ 100× → 3 · ≥ 30× → 2 · ≥ 3× → 1 · untested or 1–3× → 0 · **under 1× → −1** (a known flop) |
| Vivid | vivid | 0–3 | 1.5 | 3 = many objects moving across the whole frame + colour changing · 2 = several moving parts or a strong colour change · 1 = one main object moving · 0 = mostly still |
| Guess | guess | 0–2 | 1 | 2 = a 2-second A/B/C guess · 1 = a question that needs a sum or reading · 0 = no natural question |
| Surprise | surprise | 0–2 | 1 | 2 = most people's first answer is wrong ("water should boil at −80 °C") · 1 = many would get it right · 0 = everyone knows (the siren drops in pitch) |
| Law live | law | 0–1 | 1 | a live simulation + live numbers + a graph that draws itself (F3) |
| Everyday | everyday | 0–2 | 1 | 2 = something people hold or see daily (a spoon, tea, rain, soap) · 1 = seen in real life now and then (a mirage, a rainbow) · 0 = lab or textbook only |

**Result of a posted reel** (at 48 h): the average of *its views ÷ the typical reel's* and *its watch time ÷ the typical
reel's*, where the typical reel is the median of every posted reel read at 48 h or more. 1.0 = typical, 2.0 = twice as
good. Views and watch time are the goals (founder, 2026-10-22: reach the most people); comments come later.

**Tuning: frozen since 2026-10-26** (framework v1.33): on the 18 framework reels the score ranked views at −0.33 and
watch time at 0.07, so the weights stay as they are; the next framework review (rule 5) decides whether the score stays.
The rule as it was, kept for the record: **tuning, at every analysis** (each time new 48 h numbers are in `pyqvault-learnings.md`; founder, 2026-10-21: "fine-tuned
during every analysis of our posted list"). Run `node reels/tools/topic-scores.js pyqvault --calibrate`; it changes nothing
itself.
1. **Does the score predict?** The rank correlation between score and result across posted reels (1 = same order, 0 = no
   link). Written in the log below every time. It should be positive and rising.
2. **Each weight, one rule.** Reels above a criterion's average points vs at or below it: if the high side's median result
   beats the low side's by ≥ 20% (≥ 3 reels a side), the weight goes up 0.5; if the low side wins by ≥ 20%, down 0.5;
   otherwise it stays. One step per analysis, weights 0–3. No change when the split lines up with something else (≥ 75% of
   one side share a background, music, voice or hook that ≤ 25% of the other side has).
3. **Write it down, then re-score.** Each change gets a row below (date, reels, numbers, old → new); the Ideas table is
   re-scored with the new weights. A founder's call overrides the rule.
4. Needs **6 scored reels with numbers** to run at all, and moves a weight only when **a reel has reached 48 h since the
   last row**: `--calibrate` prints its proposal on every run, so on the same readings log "none: no new 48 h reading"
   (2026-10-23: acting on it again counts the same evidence twice). The results table names each reel's idea (`pyqvault-learnings.md`,
   Idea column).

| Date | Reels | Rank correlation | Change | Why |
|---|---|---|---|---|
| 2026-10-21 | set-up | – | all weights 1 | starting point: ranks ideas almost as the old score out of 10 did; Surprise added, Everyday widened to 0–2 |
| 2026-10-21 | 4 of 8 (P1, C1, P2, C2); P3, C3, P4, C4 read at 5–36 h | – | none: refused (needs 6 at ≥ 48 h) | the results table's 20 Oct reading came too early for half the reels, and P5 on have no numbers yet. A preview on all 8 at any age gave 0.71 and leaned Vivid up (1.16 vs 0.87), not acted on: mixed ages, and these 8 were scored after posting |
| 2026-10-22 | 8 at 48 h (P1, C1, P2, C2, P3, C3, P4, C4); P5, C5, P12, C7, C13 still under 48 h | 0.71 | Vivid 1 → 1.5; 89 ideas re-scored | high Vivid (P2, C1, C2) median result 1.32 vs low 1.00 (3 vs 5); no line-up: the high side's "before F5" opening is also on 3 of the 5 low reels. Other criteria too lopsided to judge (< 3 reels a side). Next after the queue unchanged: P36 (79), C18 (72) |
| 2026-10-23 | the same 8 at 48 h; P5 (43 h), C5 (39 h), P12 (34 h), C7 (19 h), C13 (10 h), P29b (15 h) still under 48 h | 0.71 | none | no new 48 h reading since 2026-10-22, so the tool's "Vivid 1.5 → 2" is the same evidence counted twice; not acted on. P5 and C5 pass 48 h today, P12 tomorrow |
| 2026-10-23 (evening) | 11 at 48 h (+ P5, C5, P12); C7, C13, P29b, P37, C8, P11 still under 48 h | 0.70 | none: **held for the founder** | the rule asks Proof 1 → 1.5 (high 2.24 vs low 0.71, 8 vs 3) and Vivid 1.5 → 1 (low 2.06 vs high 1.06, 6 vs 5), but both splits are the two eras mixed: framework reels score 3.4–4.3, earlier ones 0.5–1.1. Within each era neither separates: Vivid 3 vs less, framework 3.9 vs 3.86, earlier 0.94 vs 0.58 (vivid ahead); Proof, framework ~3.7 vs 3.89, earlier 0.76 vs 0.64. Applied, the rank correlation falls 0.70 → 0.59 (step 1 wants it rising). The confound check misses it: "before F5" is on 3 of 5 high-Vivid reels (60%, under the 75% bar). Founder's call; until then the weights stay |
| 2026-10-26 | 17 at 48 h (+ C7, C13, P29b, P37, C8, P11); P24, P29, C14, P6, P37a under 48 h | 0.49 | none: same era mix, still held | the tool asks Proof 1 → 0.5, Vivid 1.5 → 2, Law 1 → 0.5, Everyday 1 → 1.5, but on the 11 framework reels alone (P4 on) the rank correlation is **−0.06** (0.17 without C7 and P29b) and no criterion moves: Proof 1.01 vs 1.00, Vivid 1.17 vs 0.98 (both within 20%), the rest too lopsided. Framework reels all land at reach 1,093–1,368 (L64), so results barely vary and there is little for the score to rank; the 0.49 is mostly old reels vs new |
| 2026-10-26 (evening) | 19 at 48 h (+ P37a, P51); P24, P29, C14, P6, P75, C44 under 48 h | 0.33 | none: same era mix, still held | the tool asks Proof 1 → 0.5, Law 1 → 0.5, Everyday 1 → 1.5. On the 13 framework reels alone (P4 on) the rank correlation is **−0.20** (−0.06 without C7 and P29b) and no criterion clears 20%: Vivid high 1.26 vs low 1.06 (6 vs 7, +19%), Law low 1.28 vs high 1.07 (3 vs 10, +19.6%: P12, C7, P51), Proof low 1.19 vs high 1.05, Surprise 1.22 vs 1.08; Guess and Everyday too lopsided. Vivid and Law are the two to watch next run |

## Ideas

Status: blank = open · ⏭ queued (in the Hook queue) · ✅ made · ⏸ parked (kept, with the reason; never picked). Sources: `remake`,
`own` (Claude's), `founder`, or the PYQ Vault notes chapter. Rows marked "scored after posting" were scored once their
numbers were already known (a hindsight risk); everything else was scored before it was made.

| # | Subject | Idea | Proof (×) | Vivid | Guess | Surprise | Law live | Everyday | Score | Status | Source | Wordless |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P1 | P | Two carts collide: momentum before = after (ends on JEE Main 2022 Q8) | – | 1 | 1 | 0 | 1 | 0 | 24 | ✅ made 2026-10-18 (`pv-physics-001-collision`; scored after posting) | own | ✓ |
| P2 | P | Boyle's law: squeeze the piston, count the hits | 129 | 3 | 1 | 0 | 1 | 1 | 72 | ✅ made 2026-10-18 (`pv-physics-002-boyle`; scored after posting) | remake | ✓ |
| P3 | P | Pendulum: energy trades places, the total never moves | 150 | 2 | 1 | 0 | 1 | 1 | 62 | ✅ made 2026-10-19 (`pv-physics-003-pendulum`; scored after posting) | remake | ✓ |
| P4 | P | Block on a tilting ramp: it slips when sin θ wins | 63 | 2 | 2 | 1 | 1 | 1 | 69 | ✅ made 2026-10-20 (`pv-physics-004-slope`, remade; scored after posting) | remake | ✓ |
| P5 | P | Adiabatic squeeze heats the gas (insulated vs open, side by side) | 125 | 3 | 2 | 1 | 1 | 1 | 86 | ✅ made 2026-10-20 (`pv-physics-005-adiabatic`) | remake | ✓ |
| P6 | P | Same lift, faster = more power | 76 | 1 | 2 | 1 | 1 | 2 | 66 | ✅ made 2026-10-23 (`pv-physics-012-lift-power`) | remake | ✓ |
| P7 | P | Tilt the rope: lift vs pull (drone towing a box) | 83 | 2 | 1 | 1 | 1 | 1 | 62 | ⏭ queued 2026-10-21 (Hook queue) | remake | ✓ |
| P8 | P | Why a bounced ball never comes back as high | 52 | 1 | 1 | 0 | 1 | 2 | 52 |  | remake | ✓ |
| P9 | P | Heat flows hot → cold, never back (two chambers mixing) | 54 | 3 | 1 | 0 | 1 | 2 | 72 | ✅ made 2026-10-20 (`pv-physics-007-heat`) | remake | ✓ |
| P10 | P | One-screen sheet: Class 12 electricity & magnetism | 190 | 2 | 0 | 0 | 0 | 0 | 41 | ⏸ parked: fails F29 (a sheet of laws is words by design; 2026-10-21) | remake | ✗ |
| P11 | P | 30° and 60° land in the same spot (a fan of launch angles) | 11 | 3 | 2 | 2 | 1 | 1 | 79 | ✅ made 2026-10-21 (`pv-physics-010-launch-angles`, Physics #10) | remake | ✓ |
| P12 | P | Topspin dips, slice floats (Magnus, streamlines) | 63 | 3 | 2 | 1 | 0 | 1 | 72 | ✅ made 2026-10-20 (`pv-physics-006-topspin`) | remake | ✓ |
| P13 | P | Rolling race: ring, disc and ball down one slope | – | 3 | 2 | 2 | 1 | 1 | 72 |  | mht-cet-physics/rotational-dynamics | ✓ |
| P14 | P | A magnet dropped down a copper pipe falls in slow motion | 0.5 | 3 | 2 | 2 | 1 | 0 | 59 |  | mht-cet-physics/electromagnetic-induction | ✓ |
| P15 | P | Bright red light frees no electrons, dim violet does | 0.3 | 3 | 2 | 2 | 1 | 1 | 66 |  | mht-cet-physics/dual-nature-of-radiation-and-matter | ✓ |
| P16 | P | Red star or blue star: which is hotter? (Wien) | – | 3 | 2 | 2 | 1 | 1 | 72 |  | mht-cet-physics/thermal-properties-of-matter | ✓ |
| P17 | P | Join a small and a big soap bubble: the big one grows | – | 2 | 2 | 2 | 1 | 1 | 62 |  | mht-cet-physics/mechanical-properties-of-fluids | ✓ |
| P18 | P | A laser follows a curved water jet (total internal reflection) | 0.3 | 2 | 2 | 1 | 1 | 1 | 48 | ⏸ parked: total internal reflection is P20's mirage, the everyday angle (founder, 2026-10-20) | mht-cet-physics/ray-optics | ✓ |
| P19 | P | White light through a prism: violet bends most (dispersion) | 0.5 | 3 | 2 | 1 | 1 | 1 | 59 | ⏸ parked: replaced by P31, the rainbow (same dispersion, everyday picture; the prism flopped at 0.5×; 2026-10-21) | mht-cet-physics/ray-optics | ✓ |
| P20 | P | The "water" on a hot road is the sky (mirage) | 0.4 | 3 | 2 | 1 | 0 | 2 | 59 |  | mht-cet-physics/ray-optics | ✓ |
| P21 | P | Cover half the lens: the whole image stays, dimmer | 0.9 | 2 | 2 | 2 | 1 | 1 | 55 |  | mht-cet-physics/ray-optics | ✓ |
| P22 | P | A 2 m pool looks 1.5 m deep (apparent depth) | – | 2 | 2 | 1 | 1 | 2 | 62 |  | mht-cet-physics/ray-optics | ✓ |
| P23 | P | Walk a candle up to a convex lens: the image flips upright | – | 2 | 2 | 1 | 1 | 1 | 55 |  | mht-cet-physics/ray-optics | ✓ |
| P24 | P | Your face in a spoon: upside down, then upright up close (concave mirror) | 10.5 | 2 | 2 | 2 | 1 | 2 | 76 | ✅ made 2026-10-21 (`pv-physics-008-spoon`) | mht-cet-physics/ray-optics | ✓ |
| P25 | P | A magnifying glass under water barely magnifies (lensmaker) | – | 2 | 2 | 2 | 1 | 1 | 62 |  | mht-cet-physics/ray-optics | ✓ |
| P26 | P | A half-height mirror shows your whole body, at any distance | – | 1 | 2 | 2 | 1 | 2 | 59 | ⏸ parked: fails F28 (vivid 1: one person walking, one strip of mirror; 2026-10-21) | mht-cet-physics/ray-optics | ✓ |
| P27 | P | A bigger telescope lens: a brighter moon, not a bigger one | – | 2 | 2 | 2 | 0 | 1 | 55 |  | mht-cet-physics/ray-optics | ✓ |
| P28 | P | Turn a prism: the bend dips, then rises (minimum deviation) | – | 2 | 2 | 1 | 1 | 0 | 48 | ⏸ parked: fails F29 (it dips, then rises, but why needs words; 2026-10-21) | mht-cet-physics/ray-optics | ✗ |
| P29 | P | "Objects in mirror are closer than they appear" (convex mirror) | 6.2 | 2 | 2 | 1 | 1 | 2 | 69 | ✅ made 2026-10-21 (`pv-physics-009-wing-mirror`); rebuilt 2026-10-22 to v1.26 as P29b (`pv-physics-009b-wing-mirror`) | mht-cet-physics/ray-optics | ✓ |
| P30 | P | A raindrop's speed levels off: drag catches up with weight (terminal velocity) | 36 | 2 | 2 | 1 | 1 | 2 | 76 |  | founder | ✓ |
| P31 | P | Rainbow: red on top, made inside raindrops | – | 3 | 2 | 1 | 1 | 1 | 66 |  | founder | ✓ |
| P32 | P | A skater pulls her arms in and spins faster (angular momentum) | – | 2 | 2 | 1 | 1 | 1 | 55 |  | founder | ✓ |
| P33 | P | Water climbs highest in the thinnest tube (capillary action) | – | 2 | 2 | 1 | 1 | 2 | 62 |  | founder | ✓ |
| P34 | P | Shake a string faster: more loops (standing waves) | – | 2 | 2 | 1 | 1 | 1 | 55 |  | founder | ✓ |
| P35 | P | Heat a brass–steel strip: it bends toward the steel (bimetallic strip) | 1.2 | 2 | 2 | 1 | 1 | 1 | 55 |  | founder | ✓ |
| P36 | P | Ice at the top cools a drink faster than ice at the bottom (convection) | – | 3 | 2 | 2 | 1 | 2 | 79 | ✅ made 2026-10-26 (`pv-physics-015-ice`, Physics #15; first full-frame studio reel, F35–F36) | founder | ✓ |
| P37 | P | A magnet held still in a coil lights nothing (induction) | – | 2 | 2 | 2 | 1 | 1 | 62 | ✅ made 2026-10-22 (`pv-physics-011-induction`, Physics #11; framework-2 test B, L61; reel A `pv-f2-induction` is the same topic made by framework 2) | founder | ✓ |
| P38 | P | Two coils that never touch: the second bulb lights, on AC only (transformer) | – | 2 | 2 | 2 | 1 | 2 | 69 |  | founder | ✓ |
| P39 | P | Flip the battery on a diode: the current stops (p-n junction) | – | 2 | 2 | 1 | 1 | 2 | 62 |  | founder | ✓ |
| P40 | P | Blow between two hanging sheets: they swing together (Bernoulli) | 0.5 | 2 | 2 | 2 | 1 | 1 | 55 |  | founder | ✓ |
| P41 | P | A steel needle floats; one drop of soap sinks it (surface tension) | – | 2 | 2 | 2 | 0 | 1 | 55 |  | founder | ✓ |
| P42 | P | Fire a cannonball fast enough and it falls forever (Newton's cannon) | – | 2 | 2 | 2 | 1 | 0 | 55 |  | founder | ✓ |
| P43 | P | The right note, not the loudest, shatters a glass (resonance) | 0.4 | 2 | 2 | 1 | 1 | 1 | 48 |  | founder | ✓ |
| P44 | P | A siren's waves bunch up ahead of the ambulance (Doppler) | 0.7 | 2 | 2 | 0 | 1 | 2 | 48 |  | founder | ✓ |
| P45 | P | A second slit makes dark stripes (double slit) | 0.4 | 2 | 2 | 2 | 1 | 0 | 48 |  | founder | ✓ |
| P46 | P | One neutron, ten rounds, over a thousand splits (fission chain) | 0.2 | 3 | 2 | 1 | 0 | 0 | 45 |  | founder | ✓ |
| P47 | P | Speed up the AC: a bulb behind a capacitor glows brighter | – | 2 | 2 | 2 | 1 | 0 | 55 |  | mht-cet-physics/ac-circuits | ✓ |
| P48 | P | Charge a capacitor, connect a coil: the current swings back and forth (LC oscillation) | – | 2 | 2 | 2 | 1 | 0 | 55 |  | mht-cet-physics/ac-circuits | ✓ |
| P49 | P | Two bulbs in series or in parallel: the parallel pair glows brighter | – | 2 | 2 | 1 | 1 | 2 | 62 |  | mht-cet-physics/current-electricity | ✓ |
| P50 | P | Switch off a big coil and it sparks (self-inductance) | – | 2 | 2 | 2 | 1 | 1 | 62 |  | mht-cet-physics/electromagnetic-induction | ✓ |
| P51 | P | Lightning hits a car: the metal body, not the tyres, keeps you safe | – | 2 | 2 | 2 | 0 | 1 | 55 | ✅ made 2026-10-23 (`pv-physics-013-lightning`, Physics #13; the first Shock opening, founder's pick) | mht-cet-physics/electrostatics | ✓ |
| P52 | P | Fall to the Earth's centre and you'd weigh nothing | – | 2 | 2 | 2 | 1 | 0 | 55 |  | mht-cet-physics/gravitation | ✓ |
| P53 | P | You weigh a little less at the equator than at the poles | – | 2 | 2 | 2 | 0 | 0 | 48 |  | mht-cet-physics/gravitation | ✓ |
| P54 | P | A lift starting up: the scale under you reads more | – | 2 | 2 | 1 | 1 | 2 | 62 |  | mht-cet-physics/laws-of-motion | ✓ |
| P55 | P | Bend your knees when you land: same push, spread over more time | – | 2 | 2 | 1 | 1 | 2 | 62 |  | mht-cet-physics/laws-of-motion | ✓ |
| P56 | P | Two wires with currents the same way pull together | – | 2 | 2 | 2 | 1 | 0 | 55 |  | mht-cet-physics/magnetic-fields-due-to-electric-current | ✓ |
| P57 | P | Charged particles spiral along Earth's field and light the aurora | 0.3 | 3 | 2 | 1 | 1 | 1 | 59 |  | mht-cet-physics/magnetic-fields-due-to-electric-current | ✓ |
| P58 | P | Heat a magnet red-hot and it stops being a magnet | – | 2 | 2 | 2 | 0 | 1 | 55 |  | mht-cet-physics/magnetic-materials | ✓ |
| P59 | P | Thumb over a hose: the same water squeezes out faster (continuity) | – | 2 | 2 | 0 | 1 | 2 | 55 |  | mht-cet-physics/mechanical-properties-of-fluids | ✓ |
| P60 | P | Three holes in a bottle on the floor: the middle jet lands farthest | – | 2 | 2 | 2 | 1 | 1 | 62 |  | mht-cet-physics/mechanical-properties-of-fluids | ✓ |
| P61 | P | An ice cube melts in a full glass: the water level doesn't move | – | 2 | 2 | 2 | 0 | 2 | 62 |  | mht-cet-physics/mechanical-properties-of-fluids | ✓ |
| P62 | P | Let go of a whirling ball: it flies off along the tangent, not outward | – | 2 | 2 | 2 | 0 | 1 | 55 |  | mht-cet-physics/motion-in-a-plane | ✓ |
| P63 | P | Run in vertical rain: tilt the umbrella forward | – | 2 | 2 | 1 | 1 | 2 | 62 |  | mht-cet-physics/motion-in-a-plane | ✓ |
| P64 | P | A heavy bob and a light one swing in step (period doesn't depend on mass) | – | 2 | 2 | 2 | 1 | 1 | 62 |  | mht-cet-physics/oscillations | ✓ |
| P65 | P | Tilted roads let cars take a curve faster (banking) | – | 2 | 2 | 1 | 1 | 1 | 55 |  | mht-cet-physics/rotational-dynamics | ✓ |
| P66 | P | Swing a bucket of water overhead fast enough and nothing spills | – | 2 | 2 | 2 | 1 | 1 | 62 |  | mht-cet-physics/rotational-dynamics | ✓ |
| P67 | P | Heat a metal and it conducts worse; heat a semiconductor and it conducts better | – | 2 | 2 | 2 | 1 | 0 | 55 |  | mht-cet-physics/semiconductor-devices | ✓ |
| P68 | P | Two almost-equal notes make a wobble (beats) | – | 2 | 2 | 2 | 1 | 0 | 55 |  | mht-cet-physics/superposition-of-waves | ✓ |
| P69 | P | A nucleus weighs less than its parts (mass defect) | – | 2 | 2 | 2 | 0 | 0 | 48 |  | mht-cet-physics/structure-of-atoms-and-nuclei | ✓ |
| P70 | P | Metal feels colder than wood at the same temperature | – | 2 | 2 | 2 | 1 | 2 | 69 |  | mht-cet-physics/thermal-properties-of-matter | ✓ |
| P71 | P | Leave the fridge door open in a closed room: the room gets warmer | – | 2 | 2 | 2 | 1 | 2 | 69 |  | mht-cet-physics/thermodynamics | ✓ |
| P72 | P | Two crossed polaroids block all light; a third between them lets light back | 0.1 | 2 | 2 | 2 | 1 | 1 | 55 |  | mht-cet-physics/wave-optics | ✓ |
| P73 | P | Double your speed and your braking distance goes up four times | – | 2 | 2 | 2 | 1 | 2 | 69 |  | jee-mains-physics/motion-in-a-straight-line | ✓ |
| P74 | P | One spectrum: radio to gamma, and your TV remote uses infrared | – | 2 | 2 | 2 | 0 | 2 | 62 | ✅ made 2026-10-26 (`pv-physics-016-spectrum`, Physics #16; F39 share test 2 of 3, L64) | jee-mains-physics/electromagnetic-waves | ✓ |
| P75 | P | Double the battery: the current doubles (Ohm's law acted by our own cast: Volt the battery, Amp the sparks, Ohm the resistor, red-hot at 4x heat) | 829 | 3 | 2 | 1 | 0 | 1 | 79 | ✅ made 2026-10-24 (`pv-physics-014-ohm`, Physics #14; Painted 2D; the topic hit 29.2M on @qubit.exe, 829x its typical reel; our own characters and scene) | founder | ✓ |
| C1 | C | Heat speeds up a reaction: faster molecules, more hits | – | 3 | 1 | 0 | 1 | 1 | 52 | ✅ made 2026-10-18 (`pv-chem-001-heat-rate`; scored after posting) | own | ✓ |
| C2 | C | The periodic table's 8 families | 256 | 3 | 1 | 0 | 0 | 0 | 59 | ✅ made 2026-10-18 (`pv-chem-002-families`; scored after posting) | remake | ✓ |
| C3 | C | Avogadro: add gas, the volume grows | 50 | 2 | 1 | 0 | 1 | 1 | 55 | ✅ made 2026-10-19 (`pv-chem-003-avogadro`; scored after posting) | remake | ✓ |
| C4 | C | Charles's law: heat 0 → 273 °C, the volume doubles | 30 | 2 | 2 | 1 | 1 | 1 | 69 | ✅ made 2026-10-20 (`pv-chem-004-charles`, remade; scored after posting) | remake | ✓ |
| C5 | C | P, V and T together (combined gas law) | 11 | 2 | 2 | 1 | 1 | 1 | 62 | ✅ made 2026-10-20 (`pv-chem-005-pvt`) | remake | ✓ |
| C7 | C | Flame colours: each metal burns its own colour (fireworks) | – | 3 | 2 | 1 | 0 | 1 | 59 | ✅ made 2026-10-20 (`pv-chem-006-flame`) | own | ✓ |
| C8 | C | Split water: hydrogen fills twice as fast as oxygen | – | 3 | 2 | 1 | 1 | 0 | 59 | ✅ made 2026-10-23 (`pv-chem-009-electrolysis`) | own | ✓ |
| C9 | C | The pH chart: lemon to bleach, milk is slightly acidic (universal indicator) | – | 3 | 2 | 2 | 0 | 2 | 72 | ✅ made 2026-10-26 (`pv-chem-012-ph`, Chemistry #12; the first F39 share test, L64) | own | ✓ |
| C10 | C | Squeeze the brown gas: darker at once, then lighter (Le Chatelier) | – | 2 | 2 | 2 | 0 | 0 | 48 |  | own | ✓ |
| C11 | C | Diffusion: dye in hot vs cold water | – | 2 | 2 | 0 | 0 | 2 | 48 | ⏸ parked: close to Chemistry #1, heat speeds things up (founder, 2026-10-20) | own | ✓ |
| C12 | C | Heat it by 10 °C: the rate doubles (collisions over the energy hill) | – | 3 | 2 | 2 | 1 | 1 | 72 | ⏸ parked: repeats Chemistry #1, heat → rate (founder, 2026-10-20) | mht-cet-chemistry/chemical-kinetics | ✓ |
| C13 | C | Half-life: 64 atoms, 2 half-lives, 16 left | – | 3 | 2 | 1 | 1 | 1 | 66 | ✅ made 2026-10-20 (`pv-chem-007-halflife`, first voiceover) | mht-cet-chemistry/chemical-kinetics | ✓ |
| C14 | C | Stack the oranges: 52%, 68% or 74% filled (packing efficiency) | – | 3 | 2 | 1 | 1 | 1 | 66 | ✅ made 2026-10-21 (`pv-chem-008-packing`) | mht-cet-chemistry/solid-state | ✓ |
| C15 | C | A zinc rod in blue copper sulphate: copper coats it, the blue fades | – | 3 | 2 | 1 | 1 | 0 | 59 | ⏭ queued 2026-10-21 (Hook queue) | mht-cet-chemistry/electrochemistry | ✓ |
| C16 | C | Why water is bent: lone pairs squeeze 109.5° → 104.5° (VSEPR) | – | 2 | 2 | 1 | 1 | 1 | 55 |  | mht-cet-chemistry/chemical-bonding | ✓ |
| C17 | C | Salt makes water boil hotter, not sooner (boiling-point elevation) | – | 2 | 2 | 2 | 1 | 2 | 69 |  | mht-cet-chemistry/solutions | ✓ |
| C18 | C | Salt a cucumber: the water walks out through the skin (osmosis) | 1.6 | 3 | 2 | 1 | 1 | 2 | 72 |  | mht-cet-chemistry/solutions | ✓ |
| C19 | C | Same pinhole: the helium balloon empties first (lighter = faster) | – | 3 | 2 | 1 | 1 | 1 | 66 |  | mht-cet-chemistry/states-of-matter | ✓ |
| C20 | C | By the trend, water should boil at −80 °C (hydrogen bonds) | – | 2 | 2 | 2 | 1 | 1 | 62 | ⏸ parked: same concept as C43 (hydrogen bonds); its −80 °C line is C43's second hook (2026-10-21) | mht-cet-chemistry/chemical-bonding | ✓ |
| C21 | C | Salt water lights the bulb bright, vinegar barely (strong vs weak electrolyte) | – | 2 | 2 | 1 | 1 | 1 | 55 |  | mht-cet-chemistry/electrochemistry | ✓ |
| C22 | C | A drop of acid: water's colour swings, a buffer's holds | – | 2 | 2 | 1 | 1 | 1 | 55 |  | mht-cet-chemistry/ionic-equilibria | ✓ |
| C23 | C | Warm an aldehyde with Tollens' reagent: the tube turns into a mirror | – | 3 | 2 | 2 | 0 | 1 | 66 |  | mht-cet-chemistry/aldehydes-ketones-and-carboxylic-acids | ✓ |
| C24 | C | Soap doesn't dissolve oil, it wraps it (micelles) | – | 3 | 2 | 1 | 0 | 2 | 66 |  | mht-cet-chemistry/surface-chemistry | ✓ |
| C25 | C | Heat DNA: the A–T rungs let go before G–C | – | 3 | 2 | 1 | 0 | 0 | 52 |  | mht-cet-chemistry/biomolecules | ✓ |
| C26 | C | Pump a second gas in: the first gas's pressure doesn't change (Dalton) | – | 3 | 2 | 2 | 1 | 0 | 66 |  | mht-cet-chemistry/states-of-matter | ✓ |
| C27 | C | Ice melts at one temperature, glass just softens (crystalline vs amorphous) | – | 2 | 2 | 1 | 1 | 2 | 62 |  | mht-cet-chemistry/solid-state | ✓ |
| C28 | C | Copper sulphate is blue, zinc sulphate colourless (d–d colours) | – | 3 | 2 | 1 | 0 | 0 | 52 | ⏸ parked: fails F29 (why zinc is colourless needs its d shell explained in words; 2026-10-21) | mht-cet-chemistry/transition-and-inner-transition-elements | ✗ |
| C29 | C | More electrons, smaller atom: radii shrink across a period | – | 2 | 2 | 2 | 1 | 0 | 55 |  | mht-cet-chemistry/modern-periodic-table | ✓ |
| C30 | C | Lithium, sodium, potassium in water: which bursts into flame? | – | 3 | 2 | 1 | 0 | 0 | 52 |  | mht-cet-chemistry/elements-of-group-1-and-2 | ✓ |
| C31 | C | Cut a 1 cm cube into nanocubes: surface area ×10 million | – | 2 | 2 | 2 | 1 | 0 | 55 |  | mht-cet-chemistry/surface-chemistry | ✓ |
| C32 | C | One sip of water holds 6 × 10²³ molecules (the mole) | – | 2 | 2 | 2 | 0 | 2 | 62 |  | mht-cet-chemistry/some-basic-concepts | ✓ |
| C33 | C | A pinch of alum clears muddy water (coagulation) | – | 2 | 2 | 1 | 0 | 1 | 48 |  | mht-cet-chemistry/surface-chemistry | ✓ |
| C34 | C | SN2: the molecule flips inside out like an umbrella | – | 2 | 2 | 1 | 0 | 1 | 48 |  | mht-cet-chemistry/halogen-derivatives | ✓ |
| C35 | C | Mirror-image molecules, like your hands, never match (chirality) | – | 2 | 2 | 1 | 0 | 2 | 55 |  | mht-cet-chemistry/basic-principles-of-organic-chemistry | ✓ |
| C36 | C | Boil an egg: the proteins unfold, the chain stays (denaturation) | – | 2 | 2 | 1 | 0 | 2 | 55 |  | mht-cet-chemistry/biomolecules | ✓ |
| C37 | C | Carry bag or milk can: same ethene, branched vs straight chains (LDPE vs HDPE) | – | 2 | 2 | 1 | 0 | 2 | 55 |  | mht-cet-chemistry/introduction-to-polymer-chemistry | ✓ |
| C38 | C | A gallium spoon melts in hot tea | – | 2 | 2 | 2 | 0 | 1 | 55 |  | jee-mains-chemistry/p-block-elements | ✓ |
| C39 | C | Add acid to saturated salt water: salt crystals fall out (common ion) | – | 2 | 2 | 2 | 1 | 0 | 55 |  | mht-cet-chemistry/ionic-equilibria | ✓ |
| C40 | C | 1,000 snapshots of one electron make a cloud (orbitals) | – | 3 | 2 | 1 | 0 | 0 | 52 | ⏸ parked: fails F29 (the cloud shows; why it isn't a neat orbit needs words; 2026-10-21) | mht-cet-chemistry/structure-of-atom | ✗ |
| C41 | C | A hydrogen fuel cell's only exhaust is water | – | 2 | 2 | 1 | 0 | 1 | 48 |  | mht-cet-chemistry/electrochemistry | ✓ |
| C42 | C | Liquid oxygen sticks to a magnet, nitrogen pours through (MO theory) | – | 2 | 2 | 2 | 0 | 0 | 48 | ⏸ parked: fails F29 (it sticks, but why, unpaired electrons, needs words; 2026-10-21) | mht-cet-chemistry/chemical-bonding | ✗ |
| C43 | C | Solid wax sinks, solid water floats: ice's open lattice (hydrogen bonds) | – | 2 | 2 | 2 | 1 | 2 | 69 |  | founder | ✓ |
| C44 | C | An explosive metal and a poison gas make table salt (ionic bond) | – | 2 | 2 | 2 | 0 | 2 | 62 | ✅ made 2026-10-26 (`pv-chem-010-salt`, Chemistry #10; the second Shock opening, founder's pick) | founder | ✓ |
| C45 | C | Hit metal and salt with a hammer: the salt shatters (metallic bond) | – | 2 | 2 | 1 | 0 | 2 | 55 | ✅ made 2026-10-26 (`pv-chem-011-hammer`, Chemistry #11; the third Shock opening and the first F37 reel) | founder | ✓ |
| C46 | C | Iron nails in dry air, water and salt water: salt water rusts first | – | 2 | 2 | 1 | 0 | 2 | 55 |  | founder | ✓ |
| C47 | C | A laser beam shows in milky water, not salt water (Tyndall) | 3.0 | 2 | 2 | 1 | 0 | 2 | 62 |  | founder | ✓ |
| C48 | C | s and p orbitals blend into methane's four equal bonds (hybridisation) | – | 2 | 1 | 1 | 0 | 0 | 34 | ⏸ parked: fails F29 (the blend shows; why it happens needs words; founder's list, 2026-10-21) | founder | ✗ |
| C49 | C | Add NaOH to four metal salts: white, blue, green and rust-brown clouds (hydroxide precipitates) | – | 3 | 2 | 1 | 0 | 0 | 52 | ✅ made 2026-10-26 (`pv-chem-013-hydroxides`, Chemistry #13; F39 share test 3 of 3, L64) | own | ✓ |

## Idea cards

One per open or queued idea (the tool refuses one without): the frame-0 question → answer; the story told **without words**
in 3–4 beats (F29); a second hook for the moment of the answer (F26, ≤ 7 words); where it came from. The words are drafts:
each answer is re-derived in its reel's tests (F10).

### P6 · Work vs power
- **Frame 0:** Same box, same height; one lift is faster. More work? → the same work, more power
- **Without words:** two lifts raise identical boxes → one arrives in half the time → both energy bars end at the same height → the fast lift's power bar stands twice as tall
- **Second hook:** So what did speed change? → power, the work per second
- **From:** remake · @sciencevisualised 1.33M (76×) [link](https://www.instagram.com/reel/Dc6jyHPqN27/)

### P7 · Tilt the rope
- **Frame 0:** Same drone, same box, same pull: one lifts it, one drags it. Why? → the rope angle
- **Without words:** two drones pull identical boxes on ropes at different angles → arrows split each pull into an up part and a forward part → the steep rope's up arrow outgrows the box's weight arrow → that box leaves the ground, the other slides
- **Second hook:** How steep before it lifts? → where F sin θ = mg
- **From:** remake · @sciencevisualised 1.45M (83×) [link](https://www.instagram.com/reel/Dc9MzBgKwJS/)

### P8 · Bounce height
- **Frame 0:** Drop a ball from 1 m. It comes back to 1 m, a bit less, or higher? → a bit less, every time
- **Without words:** a ball falls and bounces → each bounce is lower, the heights drawn as shrinking bars → at each impact a slice of the energy bar turns to heat glow and sound rings → the heights fall by the same fraction every time
- **Second hook:** Drop it from 2 m instead? → twice as high back: the same fraction
- **From:** remake · @sciencevisualised 908k (52×) [link](https://www.instagram.com/reel/DbnqvWgMo8b/)

### P13 · Rolling race
- **Frame 0:** Ring, disc and ball of the same mass down one slope: which is first? → the ball
- **Without words:** three bodies at the top of one slope → they roll; the ball pulls ahead, the ring trails → each one's energy bar splits into moving and spinning colours; the ring's spinning share is biggest → the ball crosses first, then the disc, then the ring
- **Second hook:** A heavy ring vs a light ring? → a tie: mass doesn't matter, shape does
- **From:** mht-cet-physics/rotational-dynamics · rolling (37 PYQs)

### P14 · Magnet in a copper pipe
- **Frame 0:** Drop a magnet down a copper pipe: normal speed, slower, or faster? → far slower
- **Without words:** a steel ball and a magnet drop side by side, the ball down an empty tube, the magnet down copper → the ball is gone, the magnet drifts → glowing current rings form in the copper above and below it → arrows from the rings push back up on the magnet
- **Second hook:** A pipe with a slit down it? → it falls faster: no rings
- **From:** mht-cet-physics/electromagnetic-induction · Lenz, magnetic braking (27 PYQs) · a competitor's copper-braking reel did 0.5× (a known flop)

### P15 · Photoelectric effect
- **Frame 0:** Bright red light on a metal: frees many electrons, a few, or none? → none
- **Without words:** red photons rain on a metal plate; the brightness turns up, more photons → every one bounces off; the plate's electrons stay put → one dim violet photon hits → an electron flies out, its speed bar = the photon's energy minus the plate's toll
- **Second hook:** Brighter violet light? → more electrons, not faster ones
- **From:** mht-cet-physics/dual-nature-of-radiation-and-matter · photoelectric (87 PYQs) · a competitor's photons-vs-metal reel did 0.3× (a known flop)

### P16 · Hot colours
- **Frame 0:** A red star and a blue star: which is hotter? → blue
- **Without words:** a metal coil heats: dull red → orange → yellow-white, its thermometer climbing → its atoms jiggle harder and throw out bluer light; the colour curve's peak slides from red toward blue → two stars, red and blue, each get a thermometer: blue reads higher
- **Second hook:** Then why isn't the Sun green? → it peaks there but gives every colour: white
- **From:** mht-cet-physics/thermal-properties-of-matter · Wien, Stefan (93 PYQs)

### P17 · Two soap bubbles
- **Frame 0:** Join a small and a big soap bubble: which one grows? → the big one
- **Without words:** two bubbles on the ends of one tube, a valve shut → pressure gauges: the small bubble reads higher → the valve opens; air streams from small to big → the small one shrinks to a cap, the big one swells
- **Second hook:** Two equal bubbles? → balanced, until the slightest nudge
- **From:** mht-cet-physics/mechanical-properties-of-fluids · excess pressure (63 PYQs)

### P20 · Mirage
- **Frame 0:** The "water" on a hot road is real water, the sky, or heat haze? → the sky
- **Without words:** a hot road; the air layers coloured hot near the road, cooler above → a ray from the blue sky bends upward as it skims the hot layer → it reaches the driver's eye from below → the "puddle" shows sky, exactly where the ray seems to come from
- **Second hook:** Why does the puddle keep moving away? → the bend only works at a shallow angle
- **From:** mht-cet-physics/ray-optics · refraction · @sciencevisualised mirage 0.4× (a known flop)

### P21 · Half-covered lens
- **Frame 0:** Cover half a lens: half the image, the whole image dimmer, or nothing? → the whole image, dimmer
- **Without words:** candle, lens, screen; the flame's image sharp on the screen → a card slides over the top half of the lens → rays from every part of the flame still pass the bottom half and meet at the same image → the whole flame stays, its brightness bar halved
- **Second hook:** A finger over a phone camera? → the photo stays whole, darker
- **From:** mht-cet-physics/ray-optics · "a half-covered mirror forms half an image" (a common mistake) · @bisal.physics sliced lens 0.9× (a known flop)

### P22 · Apparent depth
- **Frame 0:** A 2 m pool looks 2 m, 1.5 m, or 2.7 m deep? → 1.5 m
- **Without words:** an empty pool, a coin on the floor, a depth ruler → water fills; rays from the coin bend at the surface → a ghost coin rises, its ruler reading 1.5 m → the real ruler beside it still reads 2 m
- **Second hook:** So why does a straw look bent? → the same bend at the surface
- **From:** mht-cet-physics/ray-optics · apparent depth

### P23 · A candle walks into a lens
- **Frame 0:** Bring a candle inside a lens's focus: the image is smaller, bigger and upside down, or bigger and upright? → bigger and upright
- **Without words:** a candle far from a convex lens; a small upside-down image on the screen → it walks closer; the image grows, then races off to infinity at the focus → inside the focus the rays spread and trace back to a big upright image → a magnifying glass over a page, the same picture
- **Second hook:** Exactly at the focus? → no image: the rays leave parallel
- **From:** mht-cet-physics/ray-optics · lens formula

### P25 · Lens under water
- **Frame 0:** A magnifying glass under water: the same, stronger, or much weaker? → much weaker
- **Without words:** a glass lens in air focuses rays to a point close by → water floods around the lens → the same rays bend less at each surface and meet far away; the focal-length bar grows about 4× → underwater, the page behind it barely magnifies
- **Second hook:** So why do goggles help divers? → they put air back in front of the eye
- **From:** mht-cet-physics/ray-optics · lensmaker ("using the glass's own index in water", a common mistake)

### P27 · Telescope aperture
- **Frame 0:** A bigger front lens makes the Moon bigger, brighter, or both? → brighter
- **Without words:** two telescopes, small and big front lens, aimed at the Moon → many more rays pour into the big one → both images are the same size, a ruler on each → the big one's brightness bar is much higher
- **Second hook:** So what makes it bigger? → the eyepiece: a shorter focal length
- **From:** mht-cet-physics/ray-optics · "a large aperture raises the magnification" (a common mistake)

### P30 · Terminal velocity
- **Frame 0:** A raindrop falls 2 km. It keeps speeding up, levels off, or slows down? → levels off
- **Without words:** a drop falls; a weight arrow down, a tiny drag arrow up → the speed climbs and the drag arrow grows with it → drag grows to match weight; the speed graph flattens into a line → it lands at about 9 m/s, not the 200 m/s it would reach with no air
- **Second hook:** So why don't raindrops hurt? → 9 m/s, not 200
- **From:** founder · @sciencevisualised "how air resistance changes with speed" 625k (36×) · mht-cet-physics/mechanical-properties-of-fluids (terminal velocity)

### P31 · Rainbow
- **Frame 0:** In a rainbow, is red at the top, the bottom, or the middle? → the top
- **Without words:** sunlight from behind the viewer enters a raindrop → it bends, splits into colours, reflects off the back of the drop and bends again on the way out → red leaves at 42°, violet at 40° → from a sky full of drops, red reaches the eye from the higher ones: red on top
- **Second hook:** Is the Sun behind you or ahead? → behind you
- **From:** founder · mht-cet-physics/ray-optics (dispersion) · replaces P19 (the prism flopped at 0.5×)

### P32 · Spinning skater
- **Frame 0:** A spinning skater pulls her arms in: faster, slower, or the same? → faster
- **Without words:** a skater spins slowly, arms out; a spin-rate dial and a spin-amount bar → her arms pull in; the mass dots move toward the axis → the spin dial races up while the spin-amount bar stays exactly level → arms out again: she slows
- **Second hook:** Try it on an office chair? → the same: arms in, faster
- **From:** founder · mht-cet-physics/rotational-dynamics · conservation of angular momentum

### P33 · Capillary action
- **Frame 0:** Thin, medium and wide glass tubes in water: where does water climb highest? → the thinnest
- **Without words:** three tubes dip into coloured water → water creeps up each; the thinnest climbs highest → close up: water molecules cling to the glass and pull the column up against a gravity arrow → the height numbers: halve the width, double the height
- **Second hook:** Mercury in the same tube? → it sinks below the surface
- **From:** founder · mht-cet-physics/mechanical-properties-of-fluids · capillary rise. Everyday picture: a tissue or paper towel, not a plant stem (plants lift water mainly by evaporation from their leaves, F10)

### P34 · Standing waves
- **Frame 0:** Shake a string faster: more loops, fewer, or the same? → more loops
- **Without words:** a string tied at both ends, one end shaken slowly → it settles into one loop; the ends stay still → faster: two loops, then three, the still points marked → a frequency dial beside it reads 1×, 2×, 3×
- **Second hook:** Press a guitar fret: higher or lower? → higher: a shorter string
- **From:** founder · mht-cet-physics/superposition-of-waves · stationary waves

### P35 · Bimetallic strip
- **Frame 0:** Heat a brass–steel strip: it stays straight, bends toward brass, or toward steel? → toward steel
- **Without words:** a strip, brass on top, steel below, over a flame → atoms in both jiggle; the brass atoms spread apart more → the brass side grows longer, so the strip curls with steel on the inside → it lifts off a contact and breaks a circuit: an iron's thermostat
- **Second hook:** Cool it below room temperature? → it bends the other way
- **From:** founder · mht-cet-physics/thermal-properties-of-matter · thermal expansion · @sciencevisualised metal expansion 1.2×

### P36 · Ice at the top
- **Frame 0:** Ice at the top or the bottom of a drink: which cools it faster? → the top
- **Without words:** two glasses, colour = temperature: ice floating at the top of one, held at the bottom of the other → in the first, cold water sinks from the ice and warm water rises to it; the whole glass turns blue → in the second, the cold pools at the bottom; the top stays warm → thermometers near the top: the first reads lower
- **Second hook:** So where does a fridge keep its freezer? → at the top
- **From:** founder · mht-cet-physics/thermal-properties-of-matter · convection (a competitor's general heat-transfer reel did 1.3×: related, not counted)

### P37 · Still magnet, dark bulb
- **Frame 0:** A magnet held still inside a coil with a bulb: bright, dim, or off? → off
- **Without words:** a magnet plunges into a coil; field lines sweep through the turns; the bulb flashes → it stops inside: the field lines hold still, the bulb goes dark → it pulls out: the bulb flashes again, the current arrow reversed → in and out fast: the bulb glows steadily
- **Second hook:** Move the coil, not the magnet? → it lights too
- **From:** founder · mht-cet-physics/electromagnetic-induction · Faraday's law

### P38 · Transformer
- **Frame 0:** Two coils that never touch, on one iron ring: does the second bulb light? → yes, on AC
- **Without words:** an AC source drives coil A; field lines pulse round the iron ring → they thread coil B; its bulb glows → switch A to a battery: one flash, then the field holds still and B goes dark → more turns on B: its bulb glows brighter
- **Second hook:** Switch to a battery? → one flash, then dark
- **From:** founder · mht-cet-physics/ac-circuits · transformer, mutual induction. Post some days after P37, not straight after

### P39 · p-n junction
- **Frame 0:** Flip the battery on a diode: the current reverses, stops, or doubles? → stops
- **Without words:** a p side full of holes, an n side full of electrons, a thin empty gap between → battery one way: the gap narrows, charges cross, an LED lights → battery flipped: the charges pull apart, the gap widens, the LED goes dark → the I–V graph draws: steep one way, flat the other
- **Second hook:** So how does a charger make DC? → diodes let one direction through
- **From:** founder · mht-cet-physics/semiconductor-devices · p-n junction diode

### P40 · Blow between two sheets
- **Frame 0:** Blow between two hanging sheets of paper: they fly apart, come together, or stay? → come together
- **Without words:** two sheets hang side by side, equal pressure arrows on both faces → fast air rushes between them; the inside arrows shrink → the outside arrows win; the sheets swing together → streamlines crowd into the narrow gap
- **Second hook:** Why does a passing truck pull a cyclist in? → the same fast air between them
- **From:** founder · mht-cet-physics/mechanical-properties-of-fluids · Bernoulli. ⚠️ A competitor's Bernoulli-pipe reel did 0.5× (a flop), and our topspin reel (P12) already used Bernoulli to explain Magnus: check with the founder it isn't a repeat before queueing. Never a wing with "equal transit time" (a myth, F10)

### P41 · Needle floats
- **Frame 0:** Lay a steel needle gently on water: sinks or floats? → floats
- **Without words:** a needle on water; the surface dimples under it like a trampoline → close up: surface molecules pull on each other, arrows along the dimple hold the needle up → a water strider stands on the same dimples → one drop of soap: the arrows weaken, the needle sinks
- **Second hook:** Add one drop of soap? → it sinks
- **From:** founder · mht-cet-physics/mechanical-properties-of-fluids · surface tension. Post apart from P17 (also surface tension)

### P42 · Newton's cannon
- **Frame 0:** Fire a cannonball fast enough from a mountain: it lands far, flies off, or falls forever? → falls forever (an orbit)
- **Without words:** a cannon on a tall mountain fires; the ball arcs down and lands → faster: it lands farther round the curved Earth → at 7.9 km/s the ground curves away as fast as the ball falls: it circles the Earth → faster still, 11.2 km/s: it leaves
- **Second hook:** Faster still? → it escapes Earth (11.2 km/s)
- **From:** founder · mht-cet-physics/gravitation · orbital and escape speed. No air (labelled)

### P43 · The right note
- **Frame 0:** To shatter a glass with sound you need the loudest note, the highest, or the right one? → the right one
- **Without words:** a glass and a frequency dial; a tone sweeps up → the rim barely wobbles until the dial reaches the glass's own ring → the wobble grows and grows; the amplitude graph spikes → it shatters
- **Second hook:** Why do soldiers break step on bridges? → the same resonance
- **From:** founder · mht-cet-physics/oscillations · resonance · @bisal.physics resonance 0.4× (a known flop)

### P44 · Doppler
- **Frame 0:** An ambulance races toward you: its sound waves ahead are bunched, stretched, or the same? → bunched
- **Without words:** a siren sends out circular waves, evenly spaced while it stands still → it moves; the circles crowd ahead and spread behind → a listener ahead gets crests close together (a short wavelength bar); one behind gets them far apart → as it passes, the listener's bar jumps from short to long
- **Second hook:** Can light do this too? → yes: galaxies redden as they recede
- **From:** founder · mht-cet-physics/sound · Doppler effect · @sciencevisualised siren 0.7× (a known flop)

### P45 · Double slit
- **Frame 0:** Open a second slit next to the first: brighter everywhere, or dark stripes appear? → dark stripes
- **Without words:** light through one slit makes one broad glow on a screen → a second slit opens; two sets of ripples spread and overlap → where crest meets trough they cancel; dark stripes appear → the slits move closer: the stripes spread apart
- **Second hook:** Move the slits closer? → the stripes spread apart
- **From:** founder · mht-cet-physics/wave-optics · Young's double slit · @bisal.physics interference 0.4× (a known flop)

### P46 · Fission chain
- **Frame 0:** One neutron splits one uranium nucleus; each split frees two. After 10 rounds: about 10, 100, or over 1,000 split? → over 1,000
- **Without words:** a neutron hits a nucleus; it splits with a flash and two neutrons fly out → each hits another nucleus: 2, then 4, then 8 → a counter races to 1,023 splits after 10 rounds → control rods slide in and soak up the spare neutrons: the count steadies
- **Second hook:** How does a reactor stop it running away? → rods soak up neutrons
- **From:** founder · mht-cet-physics/structure-of-atoms-and-nuclei · nuclear fission (two neutrons a split, simplified and labelled; real fission averages about 2.4) · a competitor's chain-reaction reel did 0.2× (a known flop)

### P47 · Capacitor and bulb
- **Frame 0:** A bulb in series with a capacitor on AC: make the AC faster. Brighter, dimmer, or the same? → brighter
- **Without words:** a capacitor and a bulb on an AC supply; charge sloshes onto one plate, then the other → the frequency dial turns up; the plates fill and empty more times each second → more charge flows each second; the current arrow grows → the bulb glows brighter
- **Second hook:** And a coil instead of a capacitor? → dimmer
- **From:** mht-cet-physics/ac-circuits · reactance, a bulb in series with a coil or capacitor

### P48 · LC oscillation
- **Frame 0:** A charged capacitor joined to a coil, no battery: the current flows once, never, or back and forth? → back and forth
- **Without words:** a charged capacitor, its field drawn between the plates, joined to a coil → charge rushes out; the capacitor's field shrinks as the coil's field grows → the coil's field collapses and pushes the charge onto the other plate → the two energy bars trade places, over and over
- **Second hook:** Add a resistor? → the swings die away
- **From:** mht-cet-physics/ac-circuits · LC oscillations

### P49 · Series or parallel
- **Frame 0:** Two bulbs on one battery, in series or in parallel: which pair glows brighter? → parallel
- **Without words:** one battery, two bulbs in a line; current dots crawl through both → the same two bulbs side by side on their own paths → each path gets the full push; the dots flow faster; both bulbs glow brighter → unscrew one: in series both go out, in parallel the other stays lit
- **Second hook:** So how is your house wired? → in parallel
- **From:** mht-cet-physics/current-electricity · Kirchhoff's laws, cells and resistances

### P50 · The coil's spark
- **Frame 0:** A big coil, a battery and a neon lamp: open the switch. The lamp stays dark, dims, or flashes? → it flashes
- **Without words:** a battery drives a current through a big coil; its field lines fill the core → the switch opens; the field starts to collapse → the collapsing field drives the current on, through the neon lamp; a voltage needle leaps far past the battery's → the lamp flashes
- **Second hook:** Why do switches spark when you unplug? → the same collapsing field
- **From:** mht-cet-physics/electromagnetic-induction · self-inductance, energy in an inductor

### P51 · Safe in a car
- **Frame 0:** Lightning strikes a car. You're safe because of the rubber tyres, the metal body, or luck? → the metal body
- **Without words:** a car under a storm; a bolt hits the roof → charge spreads over the metal shell and races round the outside to the ground → inside, the field is zero; the passenger untouched → a cage of wire round a person, the same: field lines stop at the cage
- **Second hook:** Is a convertible safe? → no: no metal roof
- **From:** mht-cet-physics/electrostatics · fields of conductors (Gauss's law)

### P52 · Weight at the centre
- **Frame 0:** Tunnel to the Earth's centre. There you weigh more, less, or nothing? → nothing
- **Without words:** a person in a tunnel through the Earth, a weight scale strapped on → going down, the shells of Earth above pull up and those below pull down; the reading drops → at the centre every pull has a partner pulling the other way; the arrows cancel → the scale reads zero; a graph of g draws: rising to the surface, then falling with height
- **Second hook:** And far above the surface? → it falls as 1/r²
- **From:** mht-cet-physics/gravitation · variation of g with height and depth

### P53 · Equator vs poles
- **Frame 0:** Weigh yourself at the North Pole and at the equator: where do you weigh more? → the pole
- **Without words:** a spinning Earth with a person on a scale at the pole and one at the equator → the equator person rides a huge circle every day; part of gravity's pull goes into keeping them on it → the arrow left over for the scale is a little shorter → the pole scale reads more
- **Second hook:** Spin Earth 17× faster? → people at the equator float
- **From:** mht-cet-physics/gravitation · the Earth's spin and latitude

### P54 · Scale in a lift
- **Frame 0:** Stand on a scale in a lift. As it starts going up, the reading rises, falls, or stays? → rises
- **Without words:** a person on a scale in a lift at rest; the scale reads their weight → the lift accelerates up; the floor pushes harder, the reading climbs → at steady speed it settles back → slowing at the top, it dips below; a graph of the reading draws the whole ride
- **Second hook:** And if the cable snapped? → it reads zero
- **From:** mht-cet-physics/laws-of-motion · lifts and apparent weight

### P55 · Bend your knees
- **Frame 0:** Jump off a wall and land stiff-legged or with bent knees: which hurts less? → bent knees
- **Without words:** two jumpers land, one stiff, one bending → a force–time graph draws for each: a tall thin spike, and a low wide hump → the shaded areas under both are equal: the same change in momentum → the stiff landing's peak force is far higher
- **Second hook:** Why do cars have crumple zones? → the same: more time, less force
- **From:** mht-cet-physics/laws-of-motion · impulse and rates of momentum

### P56 · Parallel wires
- **Frame 0:** Two wires, currents the same way: they attract, repel, or nothing? → attract
- **Without words:** two loose wires side by side, no current → current flows the same way in both; field circles wrap each wire → between them the fields point opposite ways and partly cancel; outside they add → the wires bow toward each other
- **Second hook:** Reverse one current? → they push apart
- **From:** mht-cet-physics/magnetic-fields-due-to-electric-current · force between parallel wires

### P57 · Aurora spirals
- **Frame 0:** A charged particle flies into a magnetic field: straight on, faster, or round in circles? → round in circles
- **Without words:** a particle enters a field; a force arrow always at right angles to its motion → it turns into a circle, its speed bar unchanged → give it some speed along the field too: it corkscrews → solar particles corkscrew down Earth's field lines to the poles and the sky glows green
- **Second hook:** Faster particle? → a bigger circle
- **From:** mht-cet-physics/magnetic-fields-due-to-electric-current · circular motion in a magnetic field · a competitor's charged-particle reel did 0.3× (a known flop)

### P58 · Hot magnet
- **Frame 0:** Heat a magnet red-hot: it gets stronger, weaker, or stops being a magnet? → it stops
- **Without words:** a magnet holding a row of paper clips; inside, tiny magnetic arrows all point one way → a flame heats it; the arrows jiggle → past one temperature they point every which way → the clips fall off
- **Second hook:** Let it cool? → it stays unmagnetised
- **From:** mht-cet-physics/magnetic-materials · ferromagnets, Curie temperature

### P59 · Thumb on a hose
- **Frame 0:** Put your thumb over a hose end: the water comes out slower, faster, or the same? → faster
- **Without words:** water flows through a wide hose; flow dots evenly spaced → the end narrows under a thumb → the same number of dots per second must pass a smaller gap, so they speed up → the jet shoots far; flow-rate bars equal, speed bars unequal
- **Second hook:** Then why does a river run fast in narrows? → the same rule
- **From:** mht-cet-physics/mechanical-properties-of-fluids · continuity

### P60 · Three jets
- **Frame 0:** A bottle on the floor, holes near the top, middle and bottom: which jet lands farthest? → the middle one
- **Without words:** a tall bottle on the ground, three holes, water spraying → the bottom jet leaves fastest (speed bars: deeper is faster) → but it starts lowest, so it hits the ground soon; the top jet has height but little speed → the middle jet, half speed and half height, lands farthest; the range numbers prove it
- **Second hook:** Which comes out fastest? → the bottom one
- **From:** mht-cet-physics/mechanical-properties-of-fluids · Torricelli (v = √2gh; range 2√(h(H − h)), largest at half height)

### P61 · Melting ice cube
- **Frame 0:** An ice cube floats in a glass full to the brim. When it melts, the glass overflows, drops, or stays full? → stays full
- **Without words:** ice floats, its underwater part shaded → as it melts, the meltwater is drawn as blue blocks → the meltwater exactly fills the shaded space the ice was pushing aside → the level line never moves
- **Second hook:** And ice melting on land? → the sea rises
- **From:** mht-cet-physics/mechanical-properties-of-fluids · upthrust (Archimedes)

### P62 · Let go of the string
- **Frame 0:** Whirl a ball on a string and let go: it flies straight out, along the circle's edge, or spirals away? → along the edge, a straight line
- **Without words:** a ball circles on a string, the pull arrow pointing in → the string is cut at one point → the ball leaves in a straight line, along the tangent, no arrow on it → mud flying off a bike wheel leaves the same way
- **Second hook:** Cut it at the top instead? → it flies off sideways, then falls
- **From:** mht-cet-physics/motion-in-a-plane · circular motion

### P63 · Umbrella in the rain
- **Frame 0:** Rain falls straight down. You run: hold the umbrella straight, tilted forward, or back? → forward
- **Without words:** rain falls straight down past a standing person → they run; the rain drawn from their moving view slants toward them → the rain's arrow and the runner's arrow add into a slanted arrow → the umbrella tips forward to meet it
- **Second hook:** Run faster? → tilt it more
- **From:** mht-cet-physics/motion-in-a-plane · relative velocity

### P64 · Heavy or light bob
- **Frame 0:** Two pendulums, same string, one bob 10× heavier: which swings faster? → neither: in step
- **Without words:** two pendulums side by side, a tiny bob and a big one → released together, they swing perfectly in step; two timers tick together → a longer string beside them swings slower → a graph of period against length draws: mass makes no difference
- **Second hook:** Longer string? → slower swings
- **From:** mht-cet-physics/oscillations · period and length (a competitor's pendulum-motion reel did 0.5×: a different angle, not counted)

### P65 · Banked curve
- **Frame 0:** Two curves, one flat, one tilted: which can a car take faster? → the tilted one
- **Without words:** a car on a flat curve; only tyre grip pulls it round, a short arrow → too fast: it slides off → the same curve tilted; the road's push leans inward and adds to the grip → that car holds the curve at a higher speed reading
- **Second hook:** Why are race tracks tilted? → the same lean inward
- **From:** mht-cet-physics/rotational-dynamics · banked roads

### P66 · Bucket overhead
- **Frame 0:** Swing a bucket of water over your head: does it spill? → no, if it's fast enough
- **Without words:** a bucket swings round a vertical circle, water inside → at the top, gravity pulls the water down, but the bucket is already moving away faster than the water falls → the water presses into the bucket bottom → too slow: below the speed mark, the water falls out
- **Second hook:** Swing it slower? → it spills at the top
- **From:** mht-cet-physics/rotational-dynamics · the vertical circle

### P67 · Hot semiconductor
- **Frame 0:** Heat a piece of silicon: it conducts better, worse, or the same? → better
- **Without words:** a copper wire and a silicon chip, current meters on both → heat both: copper's atoms jiggle and get in the electrons' way; its current falls → in silicon the heat kicks electrons up across the gap; more carriers, its current rises → two resistance graphs draw, one up, one down
- **Second hook:** Then how does a thermistor sense heat? → that rising current
- **From:** mht-cet-physics/semiconductor-devices · band theory

### P68 · Beats
- **Frame 0:** Two tuning forks, 440 and 442 Hz, together: you hear a steady note, two notes, or a wobble? → a wobble, twice a second
- **Without words:** two waves drawn one above the other, nearly the same spacing → added together: where they line up the sum is tall, where they oppose it is flat → the sum's outline swells and shrinks twice a second → tighten one fork closer: the swells slow, then stop
- **Second hook:** Match the forks exactly? → the wobble stops
- **From:** mht-cet-physics/superposition-of-waves · beats

### P69 · Mass defect
- **Frame 0:** Weigh a helium nucleus, then its 2 protons and 2 neutrons separately: equal, the nucleus heavier, or lighter? → lighter
- **Without words:** a balance: the four parts on one pan, the nucleus on the other → the parts' pan sinks → the missing sliver of mass glows and leaves as energy when they bind (E = mc²) → the binding-energy graph draws, iron at the top
- **Second hook:** So where does the Sun's energy come from? → fusion's missing mass
- **From:** mht-cet-physics/structure-of-atoms-and-nuclei · binding energy

### P70 · Metal feels colder
- **Frame 0:** A steel spoon and a wooden spoon in the same room: which is colder? → neither; the steel only feels colder
- **Without words:** two spoons, thermometers on both reading 25 °C → a hand touches each; heat-flow arrows leave the hand → into steel the heat floods away fast; into wood it trickles → the hand's skin thermometer drops faster on steel
- **Second hook:** Then why do floor tiles feel cold? → the same: they pull heat fast
- **From:** mht-cet-physics/thermal-properties-of-matter · conduction, rate of heat flow

### P71 · Open fridge door
- **Frame 0:** Open the fridge door in a closed room and leave it: the room gets cooler, warmer, or stays? → warmer
- **Without words:** a fridge pumps heat from its inside out through the coils at the back, heat arrows drawn → door open: inside and room are one space; the heat pumped out comes straight back in → the motor's own work adds a heat arrow on top → the room thermometer creeps up
- **Second hook:** Can an AC cool a room without an outside unit? → no, the same reason
- **From:** mht-cet-physics/thermodynamics · refrigerator, coefficient of performance

### P72 · Third polaroid
- **Frame 0:** Two polaroid sheets crossed: no light. Slip a third between them at 45°: still dark, or light comes back? → light comes back
- **Without words:** light waves wave in every direction; the first sheet lets only up-down waves through → the crossed sheet allows only side-to-side: nothing gets through → a sheet at 45° between them passes part of the up-down wave as a slanted wave → the last sheet passes part of that: light, a quarter of it
- **Second hook:** Turn the middle sheet? → the light rises and falls
- **From:** mht-cet-physics/wave-optics · Malus' law · @sciencevisualised polarised sunglasses 0.1× (a known flop)

### P73 · Braking distance
- **Frame 0:** Double your speed: your braking distance doubles, triples, or quadruples? → quadruples
- **Without words:** two identical cars brake on the same road, one at 40 km/h, one at 80 → both slow at the same rate; distance bars grow behind them → the fast car takes twice the time at twice the average speed → its stopping bar ends four times as long; a v² graph draws
- **Second hook:** So what does triple the speed do? → nine times the distance
- **From:** jee-mains-physics/motion-in-a-straight-line · braking and stopping distance

### P74 · One spectrum
- **Frame 0:** Your TV remote talks to the TV with… A radio · B infrared light · C sound? → infrared light
- **Without words:** a wave stretches across the screen as wide as a building (radio, a tower) → it squeezes: microwave (an oven), infrared (a remote's blink), visible (a rainbow), ultraviolet (sun on skin), X-ray (a hand's bones), gamma (a nucleus) → an energy bar climbs as the wave squeezes → the whole spectrum holds still, each band under its object
- **From:** jee-mains-physics/electromagnetic-waves · the spectrum

### C8 · Split water
- **Frame 0:** One battery, two tubes. Which fills first? → hydrogen
- **Without words:** water molecules at two electrodes → each splits: two H atoms go one way, one O the other → bubbles rise; the hydrogen tube fills twice as fast → the gas levels read 2 : 1
- **Counter (L62 test):** an H₂ and an O₂ count racing above the tubes, a tick per molecule, landing on 2 : 1 and still running after it; post it silent
- **Second hook:** Why exactly twice as fast? → H₂O: two H for every O
- **From:** own

### C9 · The pH chart
- **Frame 0:** Milk is… A acidic · B neutral · C basic? → slightly acidic (pH ≈ 6.5)
- **Without words:** seven glasses (lemon, coffee, milk, water, baking soda, soap, bleach) each get a drop of universal indicator → colours flood in, red through orange, yellow-green, green, blue to violet → a pH scale 1–14 slides under them and each glass lands on its number; milk sits just left of water's green → the whole chart holds still: seven glasses on their numbers
- **From:** own

### C10 · Squeeze the brown gas
- **Frame 0:** Squeeze a syringe of brown NO₂: it gets darker, lighter, or both? → darker at once, then lighter
- **Without words:** a syringe of brown gas: NO₂ molecules drifting, some paired as colourless N₂O₄ → the plunger pushes in: the same molecules in less space; the colour darkens → over seconds more NO₂ pair up into fewer, colourless molecules; the colour fades → a molecule counter falls: fewer molecules push back less
- **Second hook:** Dip it in ice? → it fades: cold favours the pairs
- **From:** own · the squeeze angle is the founder's (2026-10-21) · Le Chatelier

### C15 · Zinc in copper sulphate
- **Frame 0:** A zinc rod in blue copper sulphate: it stays, turns copper-coloured, or fizzes? → turns copper-coloured
- **Without words:** a zinc rod in blue solution, blue Cu²⁺ ions drifting → each Cu²⁺ touches the zinc, takes two electrons and sticks as copper → zinc atoms leave as colourless Zn²⁺ → the blue fades; the rod is coated copper (time-lapse, labelled)
- **Second hook:** Swap them: copper rod, zinc liquid? → nothing happens
- **From:** mht-cet-chemistry/electrochemistry · galvanic cells (73 PYQs)

### C16 · Why water is bent
- **Frame 0:** Water's bond angle: 109.5°, 104.5° or 90°? → 104.5°
- **Without words:** methane's four bonds spread to 109.5°, the angle live → ammonia: one bond becomes a fat lone-pair cloud; the others squeeze to 107° → water: two lone-pair clouds; the bonds squeeze to 104.5° → all three side by side, the angle shrinking
- **Second hook:** Then why is CO₂ straight? → no lone pairs on carbon: 180°
- **From:** mht-cet-chemistry/chemical-bonding · VSEPR

### C17 · Salt and boiling
- **Frame 0:** Salt in a pot of water: it boils sooner, later, or the same? → later, at a higher temperature
- **Without words:** two pots, plain and salted, with thermometers → water molecules leap off the plain surface; in the salted pot salt ions take up surface spots → at 100 °C the plain pot boils; the salted one needs a little more → it boils above 100 °C (the rise magnified and labelled: a pinch adds a fraction of a degree)
- **Second hook:** So why salt the pasta water? → for taste: the rise is tiny
- **From:** mht-cet-chemistry/solutions · boiling-point elevation (43 PYQs)

### C18 · Osmosis
- **Frame 0:** Salt a cucumber slice. Water goes in, out, or nowhere? → out
- **Without words:** a cucumber slice, water molecules inside a membrane wall → salt lands outside; water molecules cross the wall toward the salt; the salt can't cross back → droplets bead on the surface; the slice shrinks → a pressure gauge across the wall rises
- **Second hook:** A raisin in plain water? → it swells
- **From:** mht-cet-chemistry/solutions · osmotic pressure · @sciencevisualised osmosis 1.6×

### C19 · Lighter is faster
- **Frame 0:** Two balloons, same pinhole: helium or air, which empties first? → helium
- **Without words:** two balloons with identical tiny holes, particles inside → helium's particles zip about 2.7× faster than air's, speed bars on each → they find the hole far more often; an escape counter races → the helium balloon shrivels first
- **Second hook:** Hydrogen vs helium? → hydrogen, about 1.4× faster again
- **From:** mht-cet-chemistry/states-of-matter · root-mean-square speed (v ∝ 1/√M)

### C21 · Strong vs weak electrolyte
- **Frame 0:** Same bulb, same strength: salt water or vinegar, which glows brighter? → salt water
- **Without words:** two beakers in circuits with bulbs → in salt water every NaCl splits into ions; they stream to the electrodes; the bulb glows bright → in vinegar about 1 acetic acid molecule in 100 splits; few ions move; the bulb barely glows → a fraction-split bar: 100% vs about 1%
- **Second hook:** Add water to the vinegar? → a bigger share splits
- **From:** mht-cet-chemistry/electrochemistry · degree of dissociation (α = Λ/Λ₀)

### C22 · Buffer
- **Frame 0:** One drop of acid into water and into a buffer: which colour swings? → the water's
- **Without words:** two beakers with indicator, both green, pH meters at 7 → a drop of acid into each → in water the H⁺ spread free; the colour flips red, the meter dives → in the buffer waiting A⁻ ions catch each H⁺; the colour holds, the meter barely moves
- **Second hook:** Your blood's pH? → 7.4, held by a buffer
- **From:** mht-cet-chemistry/ionic-equilibria · buffers

### C23 · Silver mirror
- **Frame 0:** Warm an aldehyde with Tollens' reagent: it turns blue, makes a mirror, or nothing? → makes a mirror
- **Without words:** a clear test tube in warm water → silver ions near the glass take electrons from the aldehyde molecules → silver atoms pile onto the glass, a grey film spreading → the tube becomes a mirror; a face shows in it
- **Second hook:** And a ketone? → nothing happens
- **From:** mht-cet-chemistry/aldehydes-ketones-and-carboxylic-acids · Tollens' test

### C24 · Micelles
- **Frame 0:** Oil in water: soap dissolves it, wraps it, or burns it? → wraps it
- **Without words:** an oil drop on a plate under water → soap molecules arrive, each a head and a tail; the tails dive into the oil, the heads stay in the water → they close into a ball around the oil → rinse water carries the balls away
- **Second hook:** Why does water alone fail? → oil and water never mix
- **From:** mht-cet-chemistry/surface-chemistry · associated colloids

### C25 · DNA's rungs
- **Frame 0:** Heat DNA: which rungs let go first, A–T or G–C? → A–T
- **Without words:** a double helix: A–T rungs with two bond lines, G–C with three → the thermometer rises → the A–T stretches open first, bubbles in the helix → the G–C stretches hold on longest
- **Second hook:** So which DNA melts hotter? → the one rich in G–C
- **From:** mht-cet-chemistry/biomolecules · Watson–Crick pairs

### C26 · Dalton's law
- **Frame 0:** A box of oxygen. Pump nitrogen in: oxygen's pressure goes up, down, or stays? → stays
- **Without words:** a box of red oxygen particles hitting the walls, an oxygen gauge → blue nitrogen particles pour in; a nitrogen gauge rises → the red hits on the walls stay the same; the oxygen gauge holds still → the total gauge reads the sum
- **Second hook:** So what does the total read? → the sum of both
- **From:** mht-cet-chemistry/states-of-matter · Dalton's law

### C27 · Crystal vs glass
- **Frame 0:** Heat ice and glass: which melts at one exact temperature? → ice
- **Without words:** an ordered grid (ice) and a jumbled one (glass), thermometers on both → heat: the grid holds until 0 °C, then falls apart all at once; its temperature line goes flat while it melts → the jumble softens bit by bit; its line never goes flat → a glass blower's tube sags slowly
- **Second hook:** Why can glass be blown? → it softens over a range
- **From:** mht-cet-chemistry/solid-state · crystalline vs amorphous

### C29 · Atomic radius
- **Frame 0:** Across a period atoms gain electrons. They get bigger, smaller, or stay the same? → smaller
- **Without words:** lithium to neon side by side; the nucleus gains a + each step → each new electron joins the same shell → the bigger + pulls the whole shell tighter; the radius numbers fall → the radius graph draws downward, then jumps up at sodium
- **Second hook:** Why does sodium jump up? → a new shell
- **From:** mht-cet-chemistry/modern-periodic-table · atomic radius

### C30 · Group 1 in water
- **Frame 0:** Lithium, sodium, potassium in water: which bursts into flame? → potassium
- **Without words:** three dishes; a metal drops into each → lithium fizzes calmly, sodium races about, potassium bursts into lilac flame → zoom: each atom's lone outer electron sits farther from the nucleus going down → the farther out, the faster it's given away
- **Second hook:** Caesium? → more violent still
- **From:** mht-cet-chemistry/elements-of-group-1-and-2 · alkali metals

### C31 · Nano surface
- **Frame 0:** Cut a 1 cm cube into 1 nm cubes. The surface area grows ×10, ×1,000, or ×10 million? → ×10 million
- **Without words:** one cube, its surface painted, an area counter at 6 cm² → it splits into 8, then 64; each new face lights up fresh; the counter climbs → zoom, labelled ×10⁷: nanocubes → the counter reads 6,000 m², about a football pitch from one sugar cube
- **Second hook:** Why are catalysts made this small? → more surface to react on
- **From:** mht-cet-chemistry/surface-chemistry · nanocatalysts

### C32 · The mole
- **Frame 0:** A sip of water, 18 mL. Molecules in it: a billion, a trillion, or 6 × 10²³? → 6 × 10²³
- **Without words:** a glass; one sip drawn into a spoon → zoom (labelled) down to molecules jostling → a counter races past a billion, a trillion → it settles at 6.02 × 10²³: one mole
- **Second hook:** Count one a second: how long? → over a million times the universe's age
- **From:** mht-cet-chemistry/some-basic-concepts · the mole

### C33 · Alum and mud
- **Frame 0:** Muddy water, a pinch of alum: the mud settles faster, slower, or the same? → faster
- **Without words:** tiny clay specks float, each with a − sign, pushing each other away → alum dissolves; Al³⁺ ions drift to the specks and cancel their charge → the specks clump into flakes → the flakes sink; the water clears
- **Second hook:** Why alum, not table salt? → Al³⁺: three charges work hardest
- **From:** mht-cet-chemistry/surface-chemistry · coagulation, Hardy–Schulze

### C34 · SN2 inversion
- **Frame 0:** In SN2 the attacker comes from the front, the back, or the side? → the back
- **Without words:** a carbon with three groups and a bromine; the attacker approaches → the front is crowded by bromine; it swings round to the back → as it bonds, bromine leaves and the three groups flip over like an umbrella in wind → the new molecule is the mirror image of the old
- **Second hook:** Crowd the back with big groups? → it barely happens
- **From:** mht-cet-chemistry/halogen-derivatives · SN1 vs SN2

### C35 · Chirality
- **Frame 0:** Turn your left hand any way you like: can it match your right? → never
- **Without words:** two hands, mirror images, turn and try to overlap: they never fit → a carbon with four different coloured groups and its mirror image do the same → they never overlap either → polarised light through each turns opposite ways
- **Second hook:** Two of the groups the same? → it matches its mirror
- **From:** mht-cet-chemistry/basic-principles-of-organic-chemistry · chiral carbons

### C36 · Boiled egg
- **Frame 0:** Boil an egg: its proteins break into pieces, unfold, or melt? → unfold
- **Without words:** clear egg white; inside, proteins folded into neat balls → heat: the balls shake and unfold into long strands → the strands snag each other into a mesh → the white turns solid and opaque; every chain unbroken, only its shape changed
- **Second hook:** Can you un-boil it? → no
- **From:** mht-cet-chemistry/biomolecules · protein structure, denaturation

### C37 · Bag vs can
- **Frame 0:** A carry bag and a milk can, both made from ethene. What's different: the atoms, the chains' shape, or the colour? → the chains' shape
- **Without words:** ethene units join into chains → in the bag the chains branch like twigs and pack loosely → in the can straight chains stack tight like pencils → the bag stretches, the can stays stiff
- **Second hook:** Which one is denser? → the can's plastic (HDPE)
- **From:** mht-cet-chemistry/introduction-to-polymer-chemistry · LDPE vs HDPE

### C38 · Gallium spoon
- **Frame 0:** Stir hot tea with a gallium spoon: it melts, bends, or nothing? → it melts
- **Without words:** a shiny spoon goes into steaming tea; thermometers on both, the tea about 70 °C, the spoon's melting point 29.8 °C marked → the spoon's atoms start sliding past each other → the bowl slumps and drips → a silver puddle at the bottom of the cup
- **Second hook:** Will it melt in your hand? → yes, slowly: 37 °C
- **From:** jee-mains-chemistry/p-block-elements · gallium's liquid range

### C39 · Common ion
- **Frame 0:** Add hydrochloric acid to saturated salt water: more dissolves, crystals appear, or nothing? → crystals appear
- **Without words:** a beaker of saturated salt water, Na⁺ and Cl⁻ ions crowding → acid pours in, adding many more Cl⁻ → Na⁺ and Cl⁻ meet more often and lock together → white crystals rain down
- **Second hook:** Add water instead? → they dissolve again
- **From:** mht-cet-chemistry/ionic-equilibria · common ion effect

### C41 · Fuel cell
- **Frame 0:** A hydrogen fuel-cell bus. Its only exhaust: CO₂, smoke, or water? → water
- **Without words:** hydrogen enters one side, oxygen the other, a membrane between → hydrogen splits; its electrons run round the outside through a motor; the protons cross the membrane → protons, electrons and oxygen meet → water drips from the exhaust
- **Second hook:** Run it backwards? → it splits water
- **From:** mht-cet-chemistry/electrochemistry · H₂–O₂ fuel cell

### C43 · Ice floats
- **Frame 0:** Solid wax sinks in liquid wax. Solid water in liquid water: sinks or floats? → floats
- **Without words:** liquid water molecules tumble close together → cooling, they lock into a hexagonal lattice held by hydrogen bonds, with open holes → the same molecules now take more room; a density bar drops → the ice floats, while solid wax packs tighter and sinks
- **Second hook:** By the trend, water should boil at? → about −80 °C (C20)
- **From:** founder · mht-cet-chemistry/chemical-bonding · hydrogen bonding (C20's boiling point is its second hook)

### C44 · Salt from poison
- **Frame 0:** An explosive metal plus a poison gas make a worse poison, a new metal, or table salt? → table salt
- **Without words:** a sodium atom with one loose outer electron, a chlorine atom one short → the electron hops across; Na⁺ and Cl⁻ snap together → millions stack into a cube lattice → a salt crystal on a spoon
- **Second hook:** Why does salt water conduct, salt doesn't? → in water the ions can move
- **From:** founder · mht-cet-chemistry/chemical-bonding · ionic bonding

### C45 · Metal bends, salt shatters
- **Frame 0:** Hit a metal and a salt crystal with a hammer: which shatters? → the salt
- **Without words:** a metal: + ions in a sea of moving electrons; a salt: + and − ions in a grid → the hammer hits the metal; layers slide and the electron sea flows with them: it bends → the hammer hits the salt; a layer slides; + meets +, − meets − → they push apart; the crystal shatters
- **Second hook:** So why didn't the copper break? → the electron sea holds its sliding layers (made, 2026-10-26: it is answered by the reel's own explanation, F26; the draft "Why do metals conduct?" would have needed a scene of its own)
- **From:** founder · mht-cet-chemistry/solid-state · metallic vs ionic solids

### C46 · Rusting
- **Frame 0:** Iron nails in dry air, in water, and in salt water: which rusts first? → salt water
- **Without words:** three nails side by side (time-lapse, labelled) → dry air: nothing; water: rust spots creep → salt water: rust spreads fastest; ions carry the charge between rusting and clean spots → the salt-water nail ends orange
- **Second hook:** Why paint a bridge? → it keeps water and air off
- **From:** founder · corrosion (electrochemistry)

### C49 · Hydroxide clouds
- **Frame 0:** Add NaOH to iron(III) chloride. The cloud is… A white · B blue · C rust-brown? → rust-brown
- **Without words:** four clear salt solutions in a rack (aluminium, copper, iron(II), iron(III)) → a drop of NaOH falls into each in turn and a cloud blooms: white, pale blue, dirty green, rust-brown → the clouds settle to the bottom of each tube → the rack holds still, each tube labelled with its metal and colour
- **From:** own · the Class 12 practical (salt analysis: cations)

### C47 · Tyndall effect
- **Frame 0:** A laser through salt water and through milky water: where do you see the beam? → only in the milky water
- **Without words:** two glasses, clear salt water and water with a drop of milk; a laser passes through both → in salt water the dissolved particles are too small: the beam is invisible → in milky water bigger fat droplets scatter the light: the beam glows as a line → a sunbeam through a dusty window, the same scattering
- **Second hook:** Why do headlights show beams in fog? → the same scattering
- **From:** founder · surface chemistry (colloids) · @sciencevisualised "light through different liquid mixtures" 52.8k (3.0×)

## Hook queue

**The next @pyqvault_ reels, in order** (founder 2026-10-21). The topics are F21's picks (Ideas above); the A/B/C
guess (F4) stays on every one. Per reel: the **hook** and the **opening picture** rotate (F25: no hook or opening twice in
a row, P → C); **every hook has a visual layer** (founder, 2026-10-21): the **Visual hook** column says what the
eye-catching move in the first 3 s does (an orbit, a punch-in, parts assembling like a suit-up, an object splitting apart,
a morph, a colour flood; framework F25), best when it also sets up the question; **Hook sound** names the kit sound the move
gets (founder, 2026-10-22; F14); and every reel **loops** back to its first frame (F27). No second hook and no orbit cap
since framework v1.33 (2026-10-26: no gain in the data). "PYQ Vault · pyqvault.com" sits under the
question from frame 0 and stays (F20). The words are drafts: the options and answers are re-derived in each reel's tests
(F10), and anything sped up or not to scale is noted in the caption, not on screen (F10). `node reels/tools/hook-rotation.js` checks this table;
`tests/hook-rotation.test.js` keeps it in step with the queued rows of Ideas. Take a row out once its reel is made (its
hook and opening go in the Hook column of `pyqvault-learnings.md`).

| Order | # | Hook | Opening | Visual hook | Hook sound | Loop | Frame 0 (draft) |
|---|---|---|---|---|---|---|---|
| 7 | P7 | Same start, two endings | Assemble (suit-up) | two drones build themselves part by part (frame, arms, rotors spinning up, ropes clipping on), then pull identical boxes; one box lifts off, the other scrapes along the ground | snap ×8 (one per part locking, pitch rising) + shimmer (both drones complete) | yes | "Same drone, same box, same pull. One lifts it, one drags it. Why?" A rope angle · B rope length · C luck; the drones assemble behind the question, then fly. Loop: both drones land back on the start |
| 8 | C15 | Ending first | Ending first | a copper-coated rod standing in clear liquid; the picture starts running backwards and the liquid turns blue | shimmer (the rewind) | yes | Open on a copper-coated rod in clear liquid: "This was zinc in blue liquid. Where did the blue go?" then rewind (time-lapse, labelled). Loop: ends where it began |

## Concept sweep

**Every PYQ Vault notes chapter read for ideas** (F28, founder 2026-10-21), so none is read twice: when it was read, what
it added to Topic scores, and what it left out with the rule that kept it out. A JEE Main chapter whose MHT-CET namesake is
already swept is logged as covered. `topic-scores.js` refuses a notes idea whose chapter isn't here, or a chapter logged
twice. Physics and chemistry are fully swept (2026-10-21); the next sweep is the notes of any new PYQ Vault exam.

| Chapter | Swept | Added | Left out (rule) |
|---|---|---|---|
| mht-cet-physics/ray-optics | 2026-10-20 | P18–P29 | lens combinations, lensmaker sums (F7) |
| mht-cet-physics/rotational-dynamics | 2026-10-20; full read 2026-10-21 | P13, P32 (founder), P65, P66 | moment of inertia, axis theorems (F7); a door pushed near the hinge (F4: everyone knows; a competitor's did 0.4×) |
| mht-cet-physics/electromagnetic-induction | 2026-10-20; full read 2026-10-21 | P14, P37, P50 | motional e.m.f. rods (F21: P37); mutual inductance (P38 covers it) |
| mht-cet-physics/dual-nature-of-radiation-and-matter | 2026-10-20; full read 2026-10-21 | P15 | de Broglie wavelength (F29: why matter waves needs words); photoelectric graphs (F7) |
| mht-cet-physics/thermal-properties-of-matter | 2026-10-20; full read 2026-10-21 | P16, P35, P36, P70 | Newton's cooling (F21: close to P9's heat flow); black or white shirt in the sun (F2: one still picture); calorimetry (F7) |
| mht-cet-physics/mechanical-properties-of-fluids | 2026-10-20; full read 2026-10-21 | P17, P30, P33, P40, P41, P59, P60, P61 | a bubble growing as it rises (F21: Boyle, made); viscosity (F4) |
| mht-cet-physics/ac-circuits | 2026-10-21 | P47, P48 | LCR resonance (F21: P43's resonance); the generator (F21: P37); r.m.s., phasors, power factor (F7) |
| mht-cet-physics/current-electricity | 2026-10-21 | P49 | bridges, potentiometer, galvanometer conversions (F7) |
| mht-cet-physics/electrostatics | 2026-10-21 | P51 | Coulomb ratios, capacitor sums, dielectrics (F7); a dipole turning in a field (F2: one object) |
| mht-cet-physics/gravitation | 2026-10-21 | P52, P53 | orbits and escape speed (F21: P42, founder's Newton's cannon); planets' g (F7) |
| mht-cet-physics/kinetic-theory-of-gases | 2026-10-21 | – | r.m.s. speed (F21: C19, lighter = faster); gas laws (made: P2, C3–C5); degrees of freedom (F7) |
| mht-cet-physics/laws-of-motion | 2026-10-21 | P54, P55 | collisions (F21: P1 and P8); braking sums (JEE P73 covers it); moments (F7) |
| mht-cet-physics/magnetic-fields-due-to-electric-current | 2026-10-21 | P56, P57 | solenoid and coil fields, galvanometer shunts (F7) |
| mht-cet-physics/magnetic-materials | 2026-10-21 | P58 | dia- and paramagnets (F29: like C42, why needs words); B, H, M (F7) |
| mht-cet-physics/mechanical-properties-of-solids | 2026-10-21 | – | springs and elastic energy, impact heat (F7) |
| mht-cet-physics/motion-in-a-plane | 2026-10-21 | P62, P63 | drop vs throw sideways, both land together (F21: close to P11's projectiles; a strong one, ask the founder); vectors, kinematics sums (F7) |
| mht-cet-physics/oscillations | 2026-10-21 | P64 | a pendulum in a falling lift (F21: close to P54); spring and energy sums (F7) |
| mht-cet-physics/semiconductor-devices | 2026-10-21 | P67 | an LED that makes current in light (folded into P39 as an angle); logic gates, transistors (F7) |
| mht-cet-physics/sound | 2026-10-21 | – | a bottle's note rising as it fills (F21: P34's standing waves; a stronger everyday angle for P34); Doppler (P44); decibels (F7) |
| mht-cet-physics/structure-of-atoms-and-nuclei | 2026-10-21 | P69 | fission (P46); half-life (made: C13); Bohr spectrum (F21: Chemistry #6's flame colours); alpha/beta counting (F7) |
| mht-cet-physics/superposition-of-waves | 2026-10-21 | P68 | standing waves (P34); interference (P45); wave equations (F7) |
| mht-cet-physics/thermodynamics | 2026-10-21 | P71 | adiabatic (made: P5); heat flow (made: P9); first-law sums (F7) |
| mht-cet-physics/units-and-measurement | 2026-10-21 | – | errors and units (F4) |
| mht-cet-physics/wave-optics | 2026-10-21 | P72 | double slit (P45); single-slit diffraction, resolving power (F7) |
| jee-mains-physics/motion-in-a-straight-line | 2026-10-21 | P73 | a hammer and a feather fall together (F21: close to P64's 'mass doesn't matter'); graphs, calculus (F7) |
| jee-mains-physics/work-energy-and-power | 2026-10-21 | – | Newton's cradle (F21: P1's collision); power (P6 queued); spring and work sums (F7) |
| jee-mains-physics/communication-systems | 2026-10-21 | – | tower height vs range (F2: one still picture); AM (F29: needs words) |
| jee-mains-physics/electromagnetic-waves | 2026-10-21 | P74 | radiation pressure (F2); Maxwell's equations, displacement current (F7) |
| jee-mains-physics/alternating-current | 2026-10-21 | – | covered by mht-cet-physics/ac-circuits |
| jee-mains-physics/atoms | 2026-10-21 | – | covered by mht-cet-physics/structure-of-atoms-and-nuclei |
| jee-mains-physics/nuclei | 2026-10-21 | – | covered by mht-cet-physics/structure-of-atoms-and-nuclei |
| jee-mains-physics/current-electricity | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-physics/dual-nature | 2026-10-21 | – | covered by mht-cet-physics/dual-nature-of-radiation-and-matter |
| jee-mains-physics/electromagnetic-induction | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-physics/electrostatics | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-physics/gravitation | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-physics/kinetic-theory | 2026-10-21 | – | covered by mht-cet-physics/kinetic-theory-of-gases |
| jee-mains-physics/laws-of-motion | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-physics/magnetism-and-matter | 2026-10-21 | – | covered by mht-cet-physics/magnetic-materials |
| jee-mains-physics/mechanical-properties-of-fluids | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-physics/mechanical-properties-of-solids | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-physics/motion-in-a-plane | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-physics/moving-charges-and-magnetism | 2026-10-21 | – | covered by mht-cet-physics/magnetic-fields-due-to-electric-current |
| jee-mains-physics/oscillations | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-physics/ray-optics | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-physics/rotational-motion | 2026-10-21 | – | covered by mht-cet-physics/rotational-dynamics |
| jee-mains-physics/semiconductor-electronics | 2026-10-21 | – | covered by mht-cet-physics/semiconductor-devices |
| jee-mains-physics/thermal-properties-of-matter | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-physics/thermodynamics | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-physics/units-and-measurements | 2026-10-21 | – | covered by mht-cet-physics/units-and-measurement |
| jee-mains-physics/wave-optics | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-physics/waves | 2026-10-21 | – | covered by mht-cet-physics/sound and superposition-of-waves |
| mht-cet-chemistry/alcohols-phenols-and-ethers | 2026-10-21 | – | naming, reagents, named reactions (F7: nothing to watch); H-bond boiling points went to C20 |
| mht-cet-chemistry/aldehydes-ketones-and-carboxylic-acids | 2026-10-21 | C23 | Fehling's red is C23's second hook; named reactions (F7) |
| mht-cet-chemistry/alkanes | 2026-10-21 | – | straight vs branched boiling points (F2: two still numbers); Wurtz, isomer counts (F7) |
| mht-cet-chemistry/alkenes | 2026-10-21 | – | Markovnikov, ozonolysis, KMnO₄ (F7: rules to recall) |
| mht-cet-chemistry/alkynes | 2026-10-21 | – | reactions (F7) |
| mht-cet-chemistry/amines | 2026-10-21 | – | basicity order, named tests (F7); azo dyes (F4: no 2-second guess) |
| mht-cet-chemistry/aromatic-compounds | 2026-10-21 | – | Hückel's rule, directing groups (F7) |
| mht-cet-chemistry/basic-principles-of-organic-chemistry | 2026-10-21 | C35 | isomer types, naming (F7) |
| mht-cet-chemistry/biomolecules | 2026-10-21 | C25, C36 | starch vs cellulose (F4: the β-link isn't guessable); glucose reactions (F7) |
| mht-cet-chemistry/chemical-bonding | 2026-10-21 | C16, C20, C42 | Lewis, formal charge, bond order (F7); a charged comb bending water (F10: the textbook reason is disputed) |
| mht-cet-chemistry/chemical-kinetics | 2026-10-21 | C12, C13 | a catalyst lowers the hill (F21: repeats Chemistry #1); orders and rate laws (F7) |
| mht-cet-chemistry/chemical-thermodynamics | 2026-10-21 | – | ice melts by itself though it takes in heat (F4: needs reading); Hess, bond enthalpies (F7) |
| mht-cet-chemistry/coordination-compounds | 2026-10-21 | – | Werner's chloride count, EAN, magnetic moments (F7) |
| mht-cet-chemistry/electrochemistry | 2026-10-21 | C15, C21, C41 | metals in acid (F21: C15's series again); brine electrolysis (F21: close to C8); Nernst, cell sums (F7); Ostwald's dilution is C21's second hook |
| mht-cet-chemistry/elements-of-group-1-and-2 | 2026-10-21 | C30 | Solvay, minerals and uses (F7) |
| mht-cet-chemistry/elements-of-group-16-17-and-18 | 2026-10-21 | – | halogen colours down the group (F4: recall); xenon shapes (F21: C16's VSEPR) |
| mht-cet-chemistry/green-chemistry-and-nanochemistry | 2026-10-21 | – | principles, atom economy, nano dimensions (F4) |
| mht-cet-chemistry/halogen-derivatives | 2026-10-21 | C34 | named reactions, Freons, DDT (F7) |
| mht-cet-chemistry/introduction-to-polymer-chemistry | 2026-10-21 | C37 | monomer tables, polymer uses (F7) |
| mht-cet-chemistry/ionic-equilibria | 2026-10-21 | C22, C39 | pH sums, salt hydrolysis (F7); indicator colours (F21: C9) |
| mht-cet-chemistry/modern-periodic-table | 2026-10-21 | C29 | group and block from a configuration (F7) |
| mht-cet-chemistry/redox-reactions | 2026-10-21 | – | oxidation numbers, balancing (F7) |
| mht-cet-chemistry/solid-state | 2026-10-21 | C14, C27 | density and unit-cell sums (F7); defects, band gap (F4); magnetism (physics) |
| mht-cet-chemistry/solutions | 2026-10-21 | C17, C18 | salt on icy roads (F21: C17's law, ΔT = iKm); an opened soda fizzes (F4: everyone knows); alcohol + water shrinks (F10: clashes with the notes' deviation rule); Raoult sums (F7) |
| mht-cet-chemistry/some-basic-concepts | 2026-10-21 | C32 | laws of combination, SI units (F7) |
| mht-cet-chemistry/states-of-matter | 2026-10-21 | C19, C26 | Boyle, Charles, Avogadro, combined (made); equal masses, lightest gas pushes hardest (F21: close to C3); real gases (F7) |
| mht-cet-chemistry/structure-of-atom | 2026-10-21 | C40 | hydrogen spectrum (F21: Chemistry #6's flame colours); photon energy (F21: P15); Bohr sums, quantum numbers (F7) |
| mht-cet-chemistry/surface-chemistry | 2026-10-21 | C24, C31, C33 | adsorption, Freundlich (F4); the Tyndall beam isn't in these notes |
| mht-cet-chemistry/transition-and-inner-transition-elements | 2026-10-21 | C28 | lanthanoid contraction, oxidation states (F7) |
| jee-mains-chemistry/equilibrium | 2026-10-21 | – | Le Chatelier (C10), indicators (C9), buffers and common ion (C22, C39); ICE tables, Kp (F7) |
| jee-mains-chemistry/organic-reaction-mechanisms | 2026-10-21 | – | carbocation shifts, named reactions, road maps (F7); tests (C23) |
| jee-mains-chemistry/p-block-elements | 2026-10-21 | C38 | borax, oxoacids, inert pair (F7) |
| jee-mains-chemistry/alcohols-phenols-and-ethers | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-chemistry/aldehydes-ketones-and-carboxylic-acids | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-chemistry/amines | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-chemistry/biomolecules | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-chemistry/chemical-bonding | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-chemistry/chemical-kinetics | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-chemistry/coordination-compounds | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-chemistry/electrochemistry | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-chemistry/solutions | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-chemistry/some-basic-concepts | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-chemistry/structure-of-atom | 2026-10-21 | – | covered by its MHT-CET namesake |
| jee-mains-chemistry/d-and-f-block-elements | 2026-10-21 | – | covered by mht-cet-chemistry/transition-and-inner-transition-elements |
| jee-mains-chemistry/haloalkanes-and-haloarenes | 2026-10-21 | – | covered by mht-cet-chemistry/halogen-derivatives |
| jee-mains-chemistry/hydrocarbons | 2026-10-21 | – | covered by MHT-CET alkanes, alkenes, alkynes, aromatic-compounds |
| jee-mains-chemistry/organic-basic-principles | 2026-10-21 | – | covered by mht-cet-chemistry/basic-principles-of-organic-chemistry |
| jee-mains-chemistry/periodicity | 2026-10-21 | – | covered by mht-cet-chemistry/modern-periodic-table |
| jee-mains-chemistry/thermodynamics | 2026-10-21 | – | covered by mht-cet-chemistry/chemical-thermodynamics |

## Archive

The source tables these ideas came from (2026-10-18 – 21), kept as they were for their links and history. The cards above
are the current version.

### @pyqvault_ (Class 11–12 Physics and Chemistry): the proven ideas 

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

### @pyqvault_ · chemistry concept sweep (2026-10-21)

Founder: "topics can come from pyqvault concepts, curated against the other points" (F1 + F28). Every MHT-CET chemistry
chapter was read concept by concept, plus the JEE Main chapters with no MHT-CET namesake; what each chapter added or left out
is in the **Concept sweep** log. The 25 that passed are below, with their frame-0 question. The words are drafts: each
answer is re-derived in its reel's tests (F10). **Evidence:** only osmosis has a reel at the accounts we studied
(@sciencevisualised, 1.6×); the rest are untested (proof 0).

| # | Idea | The question on frame 0 → answer | The picture | Notes section |
|---|---|---|---|---|
| C18 | Osmosis | Salt a cucumber slice. Water goes: in, out, or nowhere? → out | water molecules cross the skin toward the salt; the slice shrinks, droplets bead; π = iCRT live. Second hook: a raisin in plain water (it swells) | Solutions · osmotic pressure, isotonic |
| C19 | Lighter = faster | Two balloons, same pinhole: helium or air, which empties first? → helium | two crowds of particles, helium's ~2.7× faster (v ∝ 1/√M); escapes counted live, v_rms bars | States of matter · root-mean-square velocity |
| C20 | Water's strange boiling point | H₂S boils at −60 °C. Water, lighter, boils at: −80 °C, −60 °C or +100 °C? → +100 °C | the H₂Te → H₂Se → H₂S boiling points draw a line that points to about −80 °C; water jumps to 100; its molecules hold hands by hydrogen bonds while H₂S flies off | Chemical bonding · hydrogen bonding |
| C21 | Strong vs weak electrolyte | Same bulb, same strength: salt water or vinegar, which glows brighter? → salt water | every NaCl splits into ions, about 1 in 100 acetic acid molecules does; ions stream, the bulb glows, α live. Second hook: add water to the vinegar (a bigger share ionises, Ostwald) | Electrochemistry · degree of dissociation α = Λ/Λ₀ |
| C22 | Buffer | One drop of acid into water and into a buffer: which colour swings? → water's | indicator colour in two beakers; the buffer's A⁻ catch each H⁺; pH meters live. Everyday: your blood is a buffer (pH 7.4) | Ionic equilibria · buffers |
| C23 | Silver mirror | Warm an aldehyde with Tollens' reagent: it turns blue, makes a mirror, or nothing? → a mirror | Ag⁺ ions take electrons and plate the glass, the tube turns silver. Second hook: a ketone (nothing happens) | Aldehydes · Tollens, Fehling |
| C24 | Micelles | Oil in water: soap dissolves it, wraps it, or burns it? → wraps it | soap molecules swarm an oil drop, tails in, heads out, and lift it away | Surface chemistry · associated colloids |
| C25 | DNA's rungs | Unzip DNA: which pair holds tighter, A–T or G–C? → G–C | the helix warms and unwinds; A–T rungs (two hydrogen bonds) let go before G–C (three) | Biomolecules · Watson–Crick pairs |
| C26 | Dalton's law | A box of oxygen. Pump nitrogen in: oxygen's pressure goes up, down, or stays? → stays | two colours of particles, a gauge for each and one for the total; total = sum | States of matter · Dalton's law |
| C27 | Crystal vs glass | Heat ice and glass: which melts at one exact temperature? → ice | an ordered lattice falls apart at one moment, a jumbled one slumps slowly; temperature–time graphs, one with a flat step | Solid state · crystalline vs amorphous |
| C28 | d–d colours | Copper sulphate is blue. Zinc sulphate is: blue, green or colourless? → colourless | a row of solutions from Ti³⁺ to Zn²⁺; each absorbs part of white light and shows the rest; Zn²⁺ (3d¹⁰) has no jump to make | Transition elements · coloured ions |
| C29 | Atomic radius | Across a period atoms gain electrons. They get: bigger, smaller, or the same? → smaller | Li → Ne side by side; the nucleus's charge grows and pulls the same shell in; radius live, graph draws | Periodic table · atomic radius |
| C30 | Group 1 in water | Lithium, sodium, potassium in water: which bursts into flame? → potassium | three dishes: lithium fizzes, sodium races about, potassium flames lilac; the outer electron sits farther out each time | Group 1 · alkali metal properties |
| C31 | Nano surface | Cut a 1 cm cube into 1 nm cubes. Surface area grows: ×10, ×1,000 or ×10 million? → ×10 million | the cube splits again and again (zoom labelled); the area counter climbs; why nanocatalysts work | Surface chemistry · nanocatalysts |
| C32 | The mole | A sip of water, 18 mL. Molecules in it: a billion, a trillion, or 6 × 10²³? → 6 × 10²³ | zoom from a glass to molecules (labelled), a counter racing | Basic concepts · the mole |
| C33 | Alum and mud | Muddy water, a pinch of alum: the mud settles faster, slower, or the same? → faster | clay specks carry the same charge and repel; Al³⁺ cancels it and they clump and sink (Hardy–Schulze: higher charge, stronger) | Surface chemistry · coagulation |
| C34 | SN2 inversion | In SN2 the nucleophile attacks from: the front, the back, or the side? → the back | the nucleophile comes in behind, and the molecule flips inside out like an umbrella in wind | Halogen derivatives · SN1 vs SN2 |
| C35 | Chirality | Turn your left hand any way you like: can it match your right? → never | a carbon with four different groups and its mirror image rotate and never overlap; polarised light turns opposite ways | Basic principles · chiral carbons |
| C36 | Denaturation | Boil an egg: its proteins break into pieces, unfold, or melt? → unfold | a folded protein shakes loose into a tangle, the chain unbroken; clear white turns opaque | Biomolecules · protein structure |
| C37 | LDPE vs HDPE | Carry bag and milk can, both made from ethene. What's different? the atoms, the chain shape, or the colour? → the chain shape | branched chains pack loosely (soft bag), straight ones stack tightly (stiff can) | Polymers · LDPE vs HDPE |
| C38 | Gallium | Stir hot tea with a gallium spoon: it melts, bends, or nothing? → it melts | the spoon slumps into a silver puddle at 29.8 °C; thermometer live | JEE p-block · gallium's liquid range |
| C39 | Common ion | Add hydrochloric acid to saturated salt water: more dissolves, crystals appear, or nothing? → crystals appear | extra Cl⁻ pushes the dissolving back; ion product passes the limit and salt crystals fall | Ionic equilibria · common ion effect |
| C40 | Orbitals | Mark where one electron is found, 1,000 times. The dots make: a ring, a cloud, or one dot? → a cloud | dots pile up into the 1s sphere (labelled as probability), then a 2p dumbbell | Structure of atom · orbital shapes |
| C41 | Fuel cell | A hydrogen fuel-cell bus. Its only exhaust: CO₂, smoke or water? → water | H₂ and O₂ meet through the cell; electrons drive the motor; water drips out | Electrochemistry · H₂–O₂ fuel cell |
| C42 | Liquid oxygen | Pour liquid oxygen between magnet poles: falls through, sticks, or flies off? → sticks | O₂ hangs between the poles (two unpaired electrons), nitrogen pours straight through | Chemical bonding · magnetic behaviour (MO) |

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
