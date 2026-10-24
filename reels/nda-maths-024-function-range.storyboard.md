# nda-maths-024-function-range storyboard

## 1. The idea
- One sentence: a function sends each input to exactly one output; the domain is every input, the codomain is every
  output allowed, and the range is only the outputs actually hit, so the range can be smaller than the codomain.
- End-card takeaway: "Range = the outputs you hit." Chapter: NDA MATHS · FUNCTIONS.
- Source idea: the founder's own ask (2026-10-24: "a reel explaining the concept of function with input, output, domain,
  codomain and range"), not from the backlog, so no proof ×.
- Caption PYQ: NDA 2022 (II) Maths Q13 (id `de6011e3-03ae-415b-a52a-8de41b353945`): A = {7, 8, …, 16}, f: A → N,
  f(x) = the highest prime factor of x. How many elements in the range? → (c) 6. Re-derived: 7→7, 8→2, 9→3, 10→5,
  11→11, 12→3, 13→13, 14→7, 15→5, 16→2; distinct {2, 3, 5, 7, 11, 13} = 6. The codomain N is infinite; the range has 6.

## 2. The viewer
- An NDA aspirant (Class 11–12 or dropper), scrolling, often muted. Has heard "domain, codomain, range" as three words
  in the Functions chapter; usually treats codomain and range as the same thing.
- Likely answers: **B {0, …, 4}** (the whole of Y: "range = codomain", the commonest confusion; the 2026 NDA paper even
  asks whether the range always equals the codomain); **C {−2, …, 2}** (mixes up inputs and outputs: "range = the x
  values"). Right: **A {0, 1, 4}**.

## 3. The question (frame 0)
- Lines: "f(x) = x², from set X to set Y." (31 chars) / "What is the range of f?" (23 chars).
- Options: A {0, 1, 4} · B {0, …, 4} · C {−2, …, 2} (chips 300 px wide). The sets are X and Y, never A/B, so a letter
  always means an option (review B1).
- On frame 0: the rule (question line 1); set X = {−2, −1, 0, 1, 2} drawn as a cyan oval with its five numbers, labelled
  "X"; set Y = {0, 1, 2, 3, 4} as a pink oval with its five numbers, labelled "Y". Every element is visible.
- 2-second answer: square the five inputs: 4, 1, 0, 1, 4 → {0, 1, 4}. Or just watch the arrows land.

## 4. Frame 0 and the cover
- Frame 0: both ovals and all ten numbers drawn; the first ball (from −2) has already left X and its arrow is drawing
  itself towards 4; the readout under the ovals already says "Outputs:" with nothing after it; a slow push-in has started.
- Cover: 0.3 s: the first ball half-way across, nothing in Y lit yet, the readout still "Outputs:". Text "What's the
  range?" at y 1590 (inside 240–1680; the ovals at screen 610–1310 also sit inside the 3:4 crop). The cover render hides
  the caption (as on 023), so the two never meet. No spoiler: no output is lit yet.

## 5. Beats
| time | picture: what moves | on-screen words (≤ 7) | camera | sound | key colours (VIVID) |
|---|---|---|---|---|---|
| 0–3.8 | five balls, one per input (−2, −1, 0, 1, 2), leave X every 0.7 s and fly 1.0 s each to their output, drawing an arrow behind them; each lands with a pop, its output dot fills green, and its value joins the readout list: "Outputs: 4", "Outputs: 4, 1", … "Outputs: 4, 1, 0, 1, 4" | "Each input → exactly one output" (0.3–3.0) | slow push in 1 → 1.04 (0–4.6) | a click per landing, pitch up with the output | ball + arrows cyan (domain), Y pink, hit outputs green |
| 3.8–4.2 | Y's 2 and 3 turn to dashed rings; "2, 3: never hit" fades in between them | (none: the tag says it) | | a soft tap | dashed ring = muted |
| 4.0–4.8 | the list's repeats merge: the second 1 and second 4 fade out, the list turns into the green pill "Range = {0, 1, 4}" | | punch-in 1.04 → 1.1 (4.65–5.0) | whoosh-in | range pill green |
| 5.0 | **A lights**; the pill pulses | "Range: only the outputs hit" (5.0–7.2) | zoom out to 1.0 (5.4–6.0) | thunk + music hit; whoosh-out | |
| 7.2–9.4 | X's oval glows cyan; its label grows to "X · domain"; the five inputs pulse in turn | "C is X, the domain: every input" | still | tap | cyan |
| 9.4–11.6 | Y's oval glows pink; label "Y · codomain"; all five outputs pulse, the dashed 2 and 3 included | "B is Y, the codomain: allowed outputs" | still | tap | pink |
| 11.6–13.8 | second beat: the arrows from −2 and 2 thicken and glow, both into the one 4; a green ✓ pops on 4 | "Two inputs, one output: still fine" | push in 1.0 → 1.06 (11.6–13.6) | click | |
| 13.8–16.4 | a dashed muted arrow grows from 1 to 0, so 1 has two arrows; a muted ✗ pops on it; it fades by 16.0 | "One input, two arrows: not a function" | zoom out 1.06 → 1.0 (13.8–14.4) | snap as ✗ pops; whoosh-out | muted dashed |
| 16.4–18.4 | the summary to screenshot: both ovals glowing, all three tags up (X · domain, Y · codomain, Range = {0, 1, 4}), the five real arrows | "Range sits inside the codomain" | still | – | |
| 18.4–21.4 | end card | "Range = the outputs you hit." / "Follow for more" | – | – | |

Answer at 5.0 s. After the answer the reel answers "so what were B and C?" (each wrong option is a set: 7.2–11.6), then
"what makes it a function at all?" (11.6–16.4), the second beat, then holds the whole picture to save (16.4–18.4).

## 6. Layout map (1080 × 1920)
Band = screen 470–1500 (1030 px tall); band y = screen y − 470.

| zone | y range (px) | what sits there, per beat |
|---|---|---|
| header: chapter label, question, chips, "comment your guess" | 96 – 440 | label 96; lines at 150 and 215 (54 px); chips top ≈ 306, 76 tall; nudge ≈ 402 (gone at the answer) |
| picture band | 470 – 1500 | set labels at band y 86 (they don't zoom); ovals centre band (250, 490) and (830, 490), rx 150, ry 350 (band y 140–840); readout / range pill centre band y 960 (doesn't zoom) |
| caption | ~1540 – 1640 | one line, 50 px |
| nothing important | > 1680, and < 240 for the cover's 3:4 crop | |

- Elements: band y 210, 345, 480, 615, 750 in both ovals (X: −2 … 2 top to bottom; Y: 0 … 4); dots r 34, numbers 44 px
  centred in their dots. Arrows run from X's dot edge (x 284) to Y's dot edge (x 796).
- Set labels: "X" / "Y" (52 px) over each oval at band y 86 (box ≈ 48–96); later "X · domain" (≈ 260 px) and "Y ·
  codomain" (≈ 310 px). Their y never changes; their x follows the oval's centre on screen under the zoom (review I4), so
  at 1.1 "Y · codomain" is centred at 540 + 290 × 1.1 = 859: 704–1014, inside 0–1080.
- "2, 3: never hit": 36 px (≈ 270 px wide), in the zoomed layer (it belongs to the dots), centred (830, 556), between Y's
  2 (dot bottom 514) and 3 (dot top 581). No arrow crosses x 695–965 near y 520–565 (the arrows into 0, 1, 4 enter at y
  210–235, 345–370 and 700–750).
- Readout: widest "Outputs: 4, 1, 0, 1, 4" (22 characters at 52 px ≈ 570 px), centred 540: 255–825.
- Camera (zooms only the ovals, arrows, balls, the "never hit" tag and the ✓ / ✗; set labels, readout and pill stay
  still): centred so the picture's centre (540, 490) stays put. At the 1.1 punch-in the ovals span x 540 ± 440 × 1.1 =
  56 … 1024 and y 490 ± 350 × 1.1 = 105 … 875: below the labels' box (≤ 96) and above the pill (top ≈ 915).
- The ✓ sits just right of Y's 4 dot (x ≈ 885, band y 750), inside the oval; the ✗ on the dashed arrow's midpoint
  (540, 412), on a small board-coloured disc: the real arrows cross x 540 at y 345 and 480, clear of it.

## 7. The story without words
Two bags of numbers. Five balls leave the left bag one by one, each flying to exactly one number in the right bag,
which lights up green where it lands, and a list below grows 4, 1, 0, 1, 4; two numbers in the right bag are never
touched and turn to dashed rings. The list's repeats merge and it becomes a green tray {0, 1, 4}: that's the answer.
Then the left bag glows (all of it), then the right bag (all of it, dashed ones too): two bigger sets than the tray. Two
arrows land on the same 4 and get a tick; one number sends two arrows and gets a cross. Then the whole picture holds,
every part named.

## 8. Honest numbers
- The outputs list is computed from the inputs in the reel's lib (b = a²); the tests check it reads 4, 1, 0, 1, 4 in
  landing order and that every b is in Y.
- The range pill's set is computed from the five outputs (distinct, sorted) and tested equal to {0, 1, 4}; "never hit"
  marks exactly Y minus the range ({2, 3}), tested.
- The ✓ case (−2 and 2 → 4) and the ✗ case (1 with a second arrow) are tested against the definition: the real map gives
  every input exactly one output; the ghost arrow makes 1 have two.
- NDA 2022 (II) Q13 re-derived in the tests (highest prime factor of 7…16 → 6 distinct values).

## 9. Risks
- Five arrows crossing could look tangled: they're thin (5 px), drawn one at a time, and the ball leads each one.
- "B {0, …, 4}" might be read as {0, 4}: the oval Y on screen shows all of 0, 1, 2, 3, 4 right beside it.
- Letters: options are A/B/C and the sets X/Y, so no letter means two things (review B1).
- Labels under a zoom: the set labels and readout aren't in the zoomed layer (the labels' x follows the ovals), and the
  oval tops stay below them at 1.1.
- Colour-blind: cyan (domain; blue failed `distinguishable()` against pink, 2026-10-24), pink (codomain), green (range) must be told apart: `distinguishable()` per pair in the
  tests; each is also named by a label, so colour isn't the only cue.
- Amber is the answer chip only; the ✗ and ghost arrow are muted and dashed, never amber.

## 10. Review
Independent agent, 2026-10-24: **fix first** (maths checked: the five squares, range {0, 1, 4}, Y − range = {2, 3},
the ✓ and ✗ cases, Q13's six prime factors; layout: the 1.1 punch-in stays in frame).
- B1 the options A/B/C clash with sets named A and B ("A lights", "C is the domain" under "A · domain") → **fixed**: the
  sets are X and Y everywhere; captions "C is X, the domain: every input", "B is Y, the codomain: allowed outputs".
- B2 the cover text sits on the 0.3–3.0 caption → **declined**: the cover render shows only the cover text, never a
  caption (the same component as 023).
- I1 the readout changes every 0.7 s, too fast to read muted → **taken**: a growing list "Outputs: 4, 1, 0, 1, 4" whose
  repeats merge into {0, 1, 4}, which shows why 1 and 4 count once.
- I2 the fake arrow into 3 muddies "never hit" → **taken**: it goes from 1 to 0.
- I3 "never hit" between 2 and 3 is ambiguous → **taken**: "2, 3: never hit", in the zoomed layer with the dots.
- I4 set labels drift off their ovals under the zoom → **taken**: their x follows the oval centre; y stays put.
- I5 the end isn't worth saving → **taken**: a 2 s hold of the whole named picture before the end card.

**Changed while building (2026-10-24):** the colour test failed blue (domain) against pink (codomain) for colour-blind
viewers, so the domain is VIVID cyan. The stills sheet caught two faults: frame 0's ball still sat on the −2 dot (the
first flight now starts 0.2 s before frame 0, so it is already in the air), and the ✗ glyph came out thin and off its
line (✓ and ✗ are now drawn as thick strokes centred on their spot). The cover moved from 0.5 s to 0.3 s: at 0.5 the
ball sat beside 3 and read as landing there. The layout tests found no overlaps.
