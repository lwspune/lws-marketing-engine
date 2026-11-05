# nda-life-001-campus storyboard: NDA campus tour

@lws.pune's first **NDA life** reel (framework F41, idea N1 in `lwspune-ideas.md`; lessons L79, L80). NDA as a toy-like 3D
miniature, flown over like a drone, **six places in turn** along a route drawn on the model. Founder, 2026-11-03: "can we
make this reel as campus tour with highlighting few more prominent places", replacing the first version (a guess-the-place
question with three options, git history up to `6564e9e`). The model, Sudan Block, the lake, the parade and the jets carry
over; the squadron building, the pool and the riding ring are new. Music changed on the same day ("seems kiddish").

## 0. Framework points

| Point | Here |
|---|---|
| F41 NDA life first | ✅ NDA Life #1 |
| F42 true, public, our own | ✅ every line in § 8 from PIB or NDA's own joining instructions; our own 3D, no photos, no crest; cadets faceless |
| F43 back to the exam | ✅ end card: "It starts with the written exam." / "Maths: 300 of 900 marks." (UPSC) |
| F34 3D, F11 Remotion | ✅ real 3D (`Life001.tsx`, Sudan Block from `sudanBlock.tsx`) |
| F22 opening orbit | ✅ one 360° turn round the whole model, 0–4.0 s, at speed on frame 0, easing out only (F5 wins, as in One Day) |
| F4 ask first | **set aside for this reel** (founder's tour choice). The hook is a promise with a count: "6 places every NDA cadet knows", six numbered pins on the model and six numbered dots in the header on frame 0. Whether a tour holds like a question is what L79/L80's numbers will show |
| F5 moving on frame 0 | ✅ the orbit, the route drawing itself, boats, birds, PT already going |
| F6 cover | ✅ t = 3.6 s: the whole model, all six pins, the route drawn; the hook line repeated mid-page |
| F2 + pacing floor (v1.15) | ✅ a new place every 3.0 s, things moving inside every shot; every glide 1.5 s, every caption ≥ 1.5 s, opening turn 4.0 s (tested) |
| F7 ≤ 7 words a line | ✅ |
| F8 rounded, F24 colour | ✅ real colours (green lawns, blue water and pool, sand ring, brown horses, red roofs); pins and dots dark ink + VIVID green for "now" |
| F9 zooms | ✅ a push into each place, a low swing beside the Antim Pag, the pull-back |
| F13 music | ✅ Pixabay shelf `epic-build` ("Cinematic Epic", The_Mountain) from 1.0 s: quieter for the tour, fuller from reel ~17 s, as the camera reaches the ground. **Not** `patriotic-india` (founder: "seems kiddish") |
| F14–F17 sound | ✅ wind + birds bed; a click as each pin pops; PT claps, swimmers' splashes, hoofbeats, water at the bay, marching taps, the jets' roar; every idea also on screen |
| F15 whoosh only on fast moves | ✅ the 1.5 s glides are silent; only the short jet moves whoosh (`whooshesFor`) |
| F18 short | ~29.7 s (six places; Army ranks ran 20.8 s) |
| F19 label | `NDA LIFE · CAMPUS TOUR` |
| F20 end card | ✅ F43's two lines + "Follow for more" over the whole campus |
| F31 storyboard + review, F38 four critics | ✅ this file + § 10; the panel on the stills, then the MP4 |
| F1/F21, F28, F32–F33 | ⏸ paused (F41) |

## 1. The idea
- One sentence: a 30-second drone tour of NDA's campus as a miniature: Sudan Block, a squadron, a pool, the riding ring,
  Peacock Bay, and the finale at Khetarpal Ground, where the passing-out course crosses the Antim Pag and jets fly past.
- Why it works for the viewer: an aspirant gets to "walk round" the place they want to live in, with one true line about
  each place. Saves and shares ("this is where I'll be").

## 2. The viewer
- NDA aspirant, 16–19, often muted. Knows Sudan Block from posters; has heard of Peacock Bay and the passing-out parade;
  has not seen the squadrons, pools or riding from above.

## 3. Frame 0
- Header (on the board, above the picture): `NDA LIFE · CAMPUS TOUR`, then "6 places every" / "NDA cadet knows", then a
  row of six numbered dots (1–6): the one being visited fills green, visited ones go dark, so a viewer always sees how far
  through the tour they are.
- Picture: the whole model from 64° up, turning (at speed); six dark numbered pins over the six places pop in one by one
  (0.4–2.15 s); a dotted gold route draws itself from 1 to 6 (0.5–3.5 s). Boats sail, birds cross, the squadron's PT is on,
  and blocks of cadets already stand tiny on Khetarpal Ground: a tease of the finale (review I3).

## 4. Cover
- t = 3.6 s: the model, all six pins, the route drawn, nothing visited. **Cover only:** the header is hidden and the hook
  "6 places every / NDA cadet knows" sits on the board above the picture (y ≈ 340, inside the 3:4 crop's 240–1680), so it
  is never shown twice and never over a pin (tested; review B3).

## 5. Beats (30 fps, ~29.7 s)

Each of places 1–5: a 1.5 s glide (its pill appears halfway), 1.5 s there (caption from 0.3 s before arrival until the
next glide: 1.8 s). As the glide starts, that place's pin (already up since the opening) pulses with a click and its
header dot turns green (review B4).

| time | place: what moves | pill | caption (≤ 7 words) | sound |
|---|---|---|---|---|
| 0–4.0 | the whole model turning once; pins pop 1→6; route draws | — | — (header) | music in; wind + birds |
| 4.0–7.0 | **1 Sudan Block**: down to the dome, a slow arc round it | 1 · Sudan Block | NDA's landmark building. | click |
| 7.0–10.0 | **2 Squadron**: a long two-storey block, red roof; on its lawn a squadron (5 × 8) doing star jumps in time | 2 · Squadron building | Cadets live in squadrons. | claps on the jumps |
| 10.0–13.0 | **3 Swimming pool**: a blue pool with white lane lines; four swimmers doing lengths, splashes behind them | 3 · Swimming pool | One of NDA's three pools. | splashes |
| 13.0–16.0 | **4 Riding**: a sand ring with a white rail; three horses with riders trotting round it | 4 · Horse riding | Cadets learn horse riding. | hoofbeats |
| 16.0–19.0 | **5 Peacock Bay**: low over the lake, white sails, wakes | 5 · Peacock Bay | Water sports all year round. | water plips |
| 19.0–20.5 | **6 Khetarpal Ground**: glide to the big ground, where the blocks of cadets (there since frame 0) start marking time | 6 · Khetarpal Ground | — | marking time |
| 20.5–21.3 | push in; the gold Antim Pag band appears across the ground | (same) | Where cadets pass out. (20.2–22.0) | |
| 21.3–24.9 | swing low beside the band (pin 6 hidden from here); only the passing-out course steps off and crosses it rank by rank (22.9–24.7) | (same) | The last step: Antim Pag. (22.0–24.9) | a tap per rank; band flashes |
| 24.9–26.5 | **after the last rank and its caption**: camera off the jets' path; three jets in a vee fly in and past, no smoke (review B1) | — | — | roar, music dips |
| 26.5–29.7 | pull back to the whole campus, light going low and warm; end card at 27.7 | — | one line: "It starts with the written exam: maths is 300 of 900 marks." (two rows, together) / Follow for more (review B2) | music resolves |

## 6. Layout (1080 × 1920)
- Header 96–380: label 34 px, two lines 54 px, dots row (6 × 60 px + gaps ≈ 480 px) at ~300–360.
- Picture band 470–1700 (soft edges); pill y 1370; caption y 1490 (48 px); nothing to read below 1600 or in the right
  120 px below mid-screen (tested). End card panel 1225–1525.
- At each place its pin stays inside the band (tested); labels never overlap (tested).

## 7. The story without words
A model campus turns; six markers along a dotted route. The camera visits each in turn: a domed building, a block with a
squadron exercising on its lawn, a pool with swimmers, a riding ring with horses, a lake with sailing boats, and a huge
ground where blocks of cadets are set down and the last ones march over a gold line. Jets pass; the camera rises over the
whole campus. Every place reads from the picture; the words name it and add one true thing.

## 8. Facts and their sources (F42)

| On screen | Source |
|---|---|
| **Sudan Block**, "NDA's landmark building." | PIB, 16 Jan 2024 (PRID 1996645): the 75-year stamp released "in the resplendent aura of the majestic Sudan Block". What it houses isn't claimed |
| **Squadron**, "Cadets live in squadrons." | NDA joining instructions, Course 155: § 41 (cadets live in quarters allotted), § 43 ("Personal Number and Squadron are allotted to Cadets"), photo caption "Squadron Building: Cadets' Home" |
| Star jumps on the lawn (picture only) | joining instructions § 6: training includes "Calisthenics, Drill, Swimming, Horse-Riding" |
| **Swimming pool**, "One of NDA's three pools." | joining instructions § 12: "three swimming pools" |
| **Riding**, "Cadets learn horse riding." | joining instructions § 6 (Horse-Riding in the training) and § 12 ("a large number of horses"; photo "Equitation Training") |
| **Peacock Bay**, "Water sports all year round." | joining instructions § 12: "The Khadakwasla Lake (Peacock Bay) adjoining NDA provides excellent facilities for Water sports throughout the year" |
| **Khetarpal Ground**, "Where cadets pass out." / "The last step: Antim Pag." | PIB, 30 Nov 2025, 149th POP "at Khetarpal Ground"; cadets "crossed the Antim Pag" (PRID 2196625) |
| Jets (picture only); caption: a Su-30 fly-past at the 149th course's parade | same PIB release |
| "Maths: 300 of 900 marks." | UPSC NDA & NA (II) 2026 notification |
| The layout, sizes and places of buildings | **not a map**: placed for the camera; "Our own model of NDA, not to scale." is in the post's caption, not on screen (review I5) |
| Uniforms, horses' breed, pool size | **not claimed**: plain navy figures, plain brown horses |
| Not used | Habibullah Hall (no official source found yet); campus area (PIB and the joining instructions disagree) |

## 9. Risks
- **Six places blur into "a game map".** Each place has its own colour and its own movement (dome, exercising squadron,
  blue pool, sand ring with horses, sails, marching blocks); the pill names it; the header dots count through.
- **Too long for the feed.** ~28.8 s; a new place every 3 s and the dots show progress. Watch time vs One Day / Army ranks
  is the measure (L80).
- **Tiny swimmers and horses read as specks.** Close enough that a horse is ≥ 60 px long and a swimmer ≥ 25 px with a
  white splash; checked on the stills.
- **Route dots clutter the model.** Gold discs on the ground, trees kept off the route; they fade after the opening.
- **Pins overlap on frame 0.** Six pins far enough apart on the wide view (tested at frame 0 and the cover).
- **Someone says "the pool isn't there".** "Not to scale" caption; no claim about where anything is.

## 10. Review (independent agent, 2026-11-03: "fix first")

| # | Issue | Done |
|---|---|---|
| B1 | The jets cut in while the ranks are still crossing and under the Antim Pag caption | Fixed: the jets start at 24.9 s, after the last rank (24.7) and its caption (to 24.9); the reel grows to ~29.7 s |
| B2 | End card has two lines + Follow; house rule is one takeaway line | Fixed: one sentence, "It starts with the written exam: maths is 300 of 900 marks.", on two rows that arrive together |
| B3 | Cover shows the hook twice, the mid-page copy over the pins | Fixed: cover only, the header hidden, the hook above the picture (y ≈ 340); tested clear of every pin |
| B4 | Pins "pop" at the opening and again "as the glide starts" | Fixed: they pop once in the opening; on arrival the pin pulses (with a click) and its header dot turns green |
| I1 | "NDA's landmark building." says little; find a sourced fact | Declined for now: NDA's site and PIB's page wouldn't load to check one (what it houses, the stamp); the line stays as checked in the first version |
| I2 | "Passing-out parade: here." is awkward | Taken, shorter than suggested (the suggestion was 950 px wide, over the 840 px limit): "Where cadets pass out." |
| I3 | The best part starts at 19 s; tease it | Taken: the blocks of cadets stand on Khetarpal Ground from frame 0 |
| I4 | Pills "Squadron", "Riding" are generic | Taken: "Squadron building" (the joining instructions' words), "Horse riding" |
| I5 | Is "not to scale" on screen? | Clarified: in the post's caption only |
| Layout | Pin 6 over the ranks in the low swing; band and ranks vs pill and caption | Pin 6 hidden from the swing on; the pill/caption vs the band checked on the stills |
| Framework | F22 says "by 3 s", F2 v1.15 says the turn takes ≥ 4 s | F22's text updated to "by 4 s" (v1.16), with the reason |
