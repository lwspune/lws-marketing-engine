# Sound Mind: shareable carousels (@soundmindwithshivani)

Runbook for the weekly Sound Mind batch. Outside brand: none of the LWS / PYQ rules or house styles apply here.
Shivani judges the finished posts in GoPost (staff login) and approves or rejects them. She doesn't review drafts.
The rules below are numbered, each with its reason, check and status, in **`framework.md`** (S1, S2…; change them only
through its change log); the numbers that test them go in **`learnings.md`** (L52 on).

## Why carousels (research, 2026-10-19)

Four model accounts were read through Meta's Business Discovery API (likes and comments only; Meta hides views,
shares and saves of other accounts):

| Account | What wins | Lesson for Sound Mind |
|---|---|---|
| @komal_reads (326K, India) | illustrated metaphor-story carousels, 10 slides; peaks of 766K and 336K likes | **Format B**: a story people send to a friend spreads furthest |
| @myeasytherapy (1.3M) | one sentence on a flat brand colour; images get ~10× the likes of her reels | **Format A**: one strong line beats a video; "comment KEYWORD" to sell |
| @selfcarewithwall (3.4M) | "this is so me" quote cards in carousels (mostly reposts + paid promos) | short, sendable lines; copy the format, never the content |
| @therapypulse (372K) | stick-figure psychology reels; median fell from 5.8K likes (Aug 2025) to ~300 | the format is wearing out: don't make it the main bet |
| @easybrilliantart (42.6K) | reels of a one-line quote being drawn (silence, being alone, peace): hits up to 445× its median, 174K likes; single images out-like its reels 1.7× | a hand-drawn line people want to send; read 2026-10-21 (`reels/analysis-framework.md` → run 2) |

Sound Mind's own reels (to 2026-06) were rarely shared or saved (figures: `analytics/soundmind-baseline.md`, local only:
Sound Mind's numbers stay out of the repo).
GoPost can't post single images yet, so both formats are carousels.

## The two formats

- **Quotes** (`"format": "quotes"`, 4–8 slides): cover line → one statement per slide → share slide.
  Themes from her best posts: calm can't be forced, the inner critic, mindful pauses, self-acceptance, rest.
- **Story** (`"format": "story"`, 6–10 slides): cover (title, subtitle, drawing) → pages (one sentence or two
  with a drawing each) → one lesson slide → share slide. An everyday object stands in for a feeling
  (a kettle told to calm down, a plant that keeps being moved, a phone that never charges).

Every post ends with a **share slide**: *send this to…*, *save this for…* or *tell me in the comments*.

## Scene stories (2026-10-22, on test, framework S19)

A third kind of carousel: an ordinary moment from an Indian woman's day, told over 8–10 illustrated slides so people
swipe to the end. Written as `"format": "scene"` in the week's `batch.json`: each slide names its `scene` (the drawings
in `remotion/src/SceneStory.tsx`; where faces, speakers and bubbles go in `remotion/src/lib/sceneStory.ts`), its `text`
(on the paper above the picture), up to three `bubbles` (`{who, kind: "say" | "think", text}`) and, on a middle page, a
`cliff` line (coral, with an arrow). `node soundmind/render.mjs` renders them through Remotion like any other batch.

- **The shape:** the cover promises a turn → the everyday pressure builds, in the woman's own thoughts → two cliffhangers
  → the turn comes from someone kind (the person viewers expect to be the villain makes the best twist) → one lesson →
  the share slide. No villain to hate, no revenge: that's what turned the model post's comments into an argument.
- **The look:** flat and warm, an Indian home (kurta and dupatta, toran, diya, rangoli, steel thalis), the same
  hand-drawn wobble as the reels, the words on Sound Mind's paper (S8). Not the ME figures (founder: "it doesn't have to
  be ME").
- **A new scene:** add its drawing in `SceneStory.tsx` and its faces, speakers and bubble spots in `SCENES`; the tests
  then check every slide of every scene story fits.

| Post | Story | Turn |
|---|---|---|
| sm-008 the last one to eat (week 44) | Diwali: she cooks from 6 a.m., is told off for sitting, eats after everyone, as she has for nine Diwalis; her daughter asks why | her mother-in-law takes the ladle: "For thirty-five years I ate last too. Not anymore." |

## Reels: the "ME" story (2026-10-19, on test)

Carousels mostly reach followers; reels reach people who don't follow yet. Model: @silvabydebalina's "protect your
peace" reel (45.6K likes on a 4.6K account), studied frame by frame. We rebuild its structure, never its content:

1. **Frame 0 carries the whole message** (top text) and the picture-metaphor (a calm **ME** figure).
2. **Conflict:** named pressures (*SHOULD, GUILT, WHAT WILL PEOPLE SAY?*) attack; the metaphor protects ME.
   Name feelings and pressures, not "negative people": the conflict stays, the tone stays kind.
3. **Close-up** on calm ME (no text), then a **second wave with a second line**.
4. **Happy ending:** the threat leaves, ME smiles, something grows.
5. 20–30 s, something moves every 1–2 s, text inside Instagram's safe band, calm piano made in code.

These rules are tests (`remotion/tests/sm00N.test.ts`). Made in Remotion: shared pieces (sky, ME, plant, labels, text,
fonts) in `remotion/src/MeStory.tsx` + `src/lib/meStory.ts`; each reel adds its metaphor in `src/SoundMind00N.tsx` with its
timeline in `src/lib/sm00N.ts`. Kalam and Lora ship in `remotion/public/fonts` (Open Font Licence).
`cd remotion && npm run music:sm00N && npm run render:sm00N && npm run cover:sm00N` → `soundmind/reels/` (MP4 gitignored),
then `queue:add` the `.post.json` beside it.

| Reel | Metaphor | Conflict | Ending |
|---|---|---|---|
| sm-r001 umbrella | ME under an umbrella | word-drops roll off | sun, smile, plant grows |
| sm-r002 window | ME with tea by a closed window | thoughts thump on the glass | night, moon, ME asleep smiling |
| sm-r003 plant | ME watering her own plant | crows circle with remarks, give up | plant blooms, sun, smile |
| sm-r003v plant, vivid | the same reel in the **vivid** palette | same | same, with a coral bloom |
| sm-r004 page (vivid) | ME beside her notebook; a pencil writes and strikes | the inner critic's lines (TOO LATE NOW, EVERYONE'S AHEAD…) write themselves and are struck out; second wave: a doodle grows beside each | I'M ENOUGH written and marker-highlighted, sun, smile |
| sm-r005 hammock (vivid) | ME asleep in a hammock under a low, red battery | pressures on ropes (ONE MORE TASK, LAZY?, GUILT…) tug at the hammock; each gives up and floats off, and the battery charges a step | battery full and green, sun, ME wakes and smiles, plant blooms |
| sm-r006 mirror (vivid) | ME beside a standing mirror that shows her reflection | sticky notes (FIX THIS, HIDE THAT, NOT LIKE BEFORE…) slap onto the glass; her cloth wipes each one off; second wave: a flower grows on the frame for each | flowers all round the frame, ME and her reflection smile, the glass sparkles |
| sm-r007 glitter jar (vivid) | ME holding a jar of glitter water | pressures (CALM DOWN!, JUST RELAX…) slam in and shake the jar; after the close-up ME sets it down and the second wave can't shake it | the glitter settles, the water clears, a flower blooms, sun, smile |
| sm-r008 teacup (vivid) | ME holding her cup of tea | kettles of requests (JUST THIS ONCE, YOU'RE FREE, NA?, ADJUST KARO…) pour in until it overflows; after the close-up ME puts a lid on and the second wave splashes off | the lid lifts, steam curls into a heart, sun, smile, plant blooms |
| sm-r009 kite (vivid) | ME flying a kite | storm clouds (WHAT'S YOUR PLAN?, BY 30 YOU SHOULD…) gust and jerk it about; after the close-up ME lets the string out and the second wave barely moves it | the kite climbs high into the sun, smile, plant blooms |
| sm-r010 rain cloud (vivid) | a small rain cloud over ME | signs (STOP CRYING, BE STRONG, SMILE!…) pop up and ME holds it in: the cloud shrinks and darkens; after the close-up she lets it rain and the second wave's signs wash over, a flower for each | the cloud turns white and floats off, a rainbow, sun, smile |

## Reels: the pause reel (2026-10-23, on test, framework S20)

A second kind of reel: no conflict and no ME, just a calm everyday moment to watch for a few seconds and send on. Model:
an AI-made anime "peace" reel (@pixcraft_132, studied 2026-10-23). We keep its shape (one scene, four shots, a loop) and
make it our own way: flat 2D in Remotion (the scene stories' `Face` from `SceneStory.tsx`), no AI video.

**Her (founder, 2026-10-23):** a young woman in her **early 20s**, not a middle-aged one: loose shoulder-length hair, a
lighter warm skin tone (`#E2AE88`), an oversized sweatshirt, sitting cosily on a floor cushion with her knees drawn up.
The scene stories' homemaker (bun, bindi, kurta, darker `#B97A56`) read as middle-aged and too dark here, and a
front-on pose on a stool made the legs look stiff.

**Animation that makes it feel alive** (from the first cut, which the founder found too still): layers at their own
depth (`LAYERS`, parallax as the camera drifts), soft focus behind the close-ups, a 0.5 s dissolve at each cut, rain in
two depths, trees and hair and the fairy-light wire in a light breeze, blinks, the head tipping back to sip and turning
toward the rain, steam, splashes on the ledge, rings on a puddle.

1. **Frame 0:** the wide shot with the message on top, naming the feeling ("You don't have to earn rest.").
2. **Two close-ups with no text**, 3 s each: something small and alive (the glass and its steam; the tulsi as drops hit it).
3. **Wide again:** she leans back, eyes closed; one line on a card ("Ten minutes. Just you and the rain.").
4. 12–15 s; the camera ends where it began (the loop); rain, steam and lights always moving; rain (`sfx.ts` bed `rain`)
   under calm piano; a soft tap as each drop lands.

Rules are tests (`remotion/tests/sm011.test.ts`); timeline in `src/lib/sm011.ts`, drawing in `src/SoundMind011.tsx`.
`cd remotion && npm run music:sm011 && npm run mix:sm011 && npm run render:sm011 && npm run cover:sm011`.

| Reel | Scene | Close-ups | Ending |
|---|---|---|---|
| sm-r011 chai in the rain | she sips chai on her balcony at a rainy dusk, phone face down, fairy lights, tulsi on the ledge | the glass and its steam; the tulsi as drops hit its leaves | she leans back, eyes closed, smiling |
| sm-r013 window seat (Painted 2D, **in season**: no rain) | a cosy room at golden hour: she reads curled in the window seat, chai on the sill, a lamp, a plant, fairy lights, the town at sunset outside | the mug and its steam in the window light; the book, a page turning in the breeze | she leans her head on the window, eyes closed, the book open on her knees |
| sm-r012 tapri at dusk (**Painted 2D**, S21) | a street-side tea stall under a tin roof at dusk in the rain; she sits with a kulhad of chai, her scooter outside | the kettle, its steam and the bulb; the scooter's tail light in a rippling puddle | she leans back against the post, eyes closed |

## Reels: the reminder reel (2026-10-27, on test, framework S22)

A third kind of reel: a kind message read one short line at a time over painted scenes that drift and dissolve. Model: a
34 s "let me remind you" reel (studied 2026-10-27): 15 lines of ~2 s each in a small white serif, night skies that blend
into each other with no hard cuts, the hook inside a dark circle on frame 0, music only, ending dark.

1. **Frame 0:** the hook names the feeling and makes people wonder ("You've been hard on yourself again."), framed by
   something round and dark (the window); the next line promises the rest ("So here's a gentle reminder.").
2. **One line at a time**, 8 words at most, mid-frame (inside the profile grid's 3:4 crop), Lora 54 px white with a soft
   dark halo, balanced wrapping; each up about 3 words a second + 0.4 s; never more than half a second without words.
3. **The scenes:** 4–5 painted scenes (S21), each its own drawing with layers at their own depth, 0.8 s dissolves, the
   camera always drifting; something always alive (stars, diyas, a lantern, clouds); in season.
4. **The end** sinks dark (the last 2.5 s) while the last line stays bright, so the loop back to frame 0 is soft.
5. Silent-first: calm piano made in code plus a few soft effects. If Shivani records the lines herself, add a voiced
   version beside the silent one; never an AI voice on her account (it would pass as hers).

Rules are tests (`remotion/tests/sm014.test.ts`); timeline in `src/lib/sm014.ts`, drawing in `src/SoundMind014.tsx`.
`cd remotion && npm run music:sm014 && npm run mix:sm014 && npm run render:sm014 && npm run cover:sm014`.

| Reel | Scenes | Message |
|---|---|---|
| sm-r014 a reminder under the stars | a dark room with a round window (fly through it) → Pune rooftops at Diwali (sky lantern, diyas, fairy lights) → her on the terrace, back to us, looking up → the Milky Way and a shooting star → moonlit clouds, sinking dark | you're doing better than you think: you got up, you kept going, breathe out, be kinder to yourself tonight |

## Reels: the racing-mind reel (2026-10-27, on test, framework S23)

A fourth kind of reel: a busy mind made visible, then switched off. Model: a 20 s "racing thoughts" reel (studied
2026-10-27): a girl awake in bed while her worries pile up on screen over a steady pulse, a hard cut to near-silence, a
view from above of her lying calm, "Breathe…".

1. **Frame 0:** the first thought, alone ("Why am I still awake?"); the next one after a second.
2. **The pile-up:** 16–22 of her own thoughts, faster and faster (gaps from ~0.9 s down to ~0.35 s), mixed sizes, in
   Lora and in Kalam (her handwriting); each fully up at least 1.2 s, then dimming to a ghost and gone after 4.6 s; a
   placer (`place()` in `src/lib/sm015.ts`) scatters them so none covers another. The camera creeps in. Ends on the loudest
   one ("I need to stop overthinking.").
3. **The cut:** every word and sound stops at once; half a second of nothing.
4. **The quiet:** a new angle (from above), one slow breath with its words ("Breathe in…" 3.5 s, "…and out." 4 s), eyes
   closing, one line to keep; the lamp dims.
5. **Sound, made in code:** a heartbeat (`thunk` pairs) that quickens and grows louder, a clock, a low rumble rising, the
   piano kept low under them (`Score.music`); silence at the cut; then the piano alone.

Rules are tests (`remotion/tests/sm015.test.ts`); timeline in `src/lib/sm015.ts`, drawing in `src/SoundMind015.tsx`.
`cd remotion && npm run music:sm015 && npm run mix:sm015 && npm run render:sm015 && npm run cover:sm015`.

| Reel | Scene | Thoughts → quiet |
|---|---|---|
| sm-r015 the 1 a.m. thoughts | she lies awake on her side by a warm lamp, phone glowing, Diwali lights outside the window → from above, on her back | 18 thoughts (messages, career, "what will people say?", Mumma, Monday plans…) → breathe in, out, "The thoughts can wait till morning." |

## Painted 2D (2026-10-24, framework S21): the look of every new reel

The founder's pick after comparing the two pause reels ("this looks much better"). Recipe, as built in
`remotion/src/SoundMind012.tsx` (timeline and palette in `src/lib/sm012.ts`):

1. **No black ink.** A palette of `{fill, light, shade, edge}` per material, the edge a darker shade of the fill;
   `paintProblems(PAINT)` in the reel's test must return `[]` (`src/lib/paint.ts`).
2. **Every shape shaded:** a gradient from its light side to its shadow side (`Grad`), a small highlight on round things.
3. **Mood light:** a dusk sky gradient (deep blue → violet → warm horizon), one warm practical light (a bulb) with a
   blurred glow and a soft pool of light on what's near it (`mixBlendMode: screen`), a slight flicker.
4. **Wet reflections:** the street drawn a second time, flipped about the road surface, dimmed (~30 %) and softened,
   clipped below the waterline; light streaks under lamps; a puddle with spreading rings.
5. **Depth:** layers at their own depth (`layerCam`), soft focus on the far layers in close-ups, rain at 2–3 depths,
   out-of-focus bokeh lights in the distance, mist over the far town, a vignette and grain over everything.
6. **People:** the young Sound Mind woman (memory: early 20s, lighter warm skin), drawn painted too (no outline on the
   face; lids, brows and blush do the expression), scaled so she reads in the wide shot.
7. **Text:** white on the dark sky (WCAG AA, tested), the second line on Sound Mind's white card.

**Hand-drawn tools** (from sm-r004, 2026-10-20; details in `reels/visual-reel-workflow.md` → Reel toolkit): strikes,
circles and marker highlights on words with `@remotion/rough-notation` (always pass `seed`); pen doodles that draw
themselves with `perfect-freehand`; gentle sway with `@remotion/noise`. The pencil moves on its own (storybook style):
a stick-figure arm long enough to reach across the page looks wrong. If the founder likes the pen look, the carousels
can take `perfect-freehand` as one copied file (MIT licence kept with it), since `soundmind/` has no npm.

**Palettes** (`remotion/src/lib/smPalette.ts`): `MUTED` (the original cream/sage) and `VIVID` (founder, 2026-10-20: "more
vibrant colours"; morning-blue sky, fresh greens, terracotta pot, turquoise can, candy-coloured remarks, coral bloom).
Shared pieces take `p={palette}`; text stays the green-grey ink, kept WCAG AA on every background by
`tests/smPalette.test.ts`. A 3D clay version of 003 was tried the same day and rejected: keep these reels flat 2D.

**Checking a refactor of shared pieces:** renders aren't bit-identical (the wobble filter adds noise of a few pixels on
~1 in 60 frames), so compare old and new renders at `--scale=0.5` and accept only scattered blips that also show up
between two renders of the same code. Mind the disk: 780 full-size PNGs are about 2 GB.

## Look

Cream paper `#F6F1E7`, green-grey ink `#2F3A33`, sage accent `#8FAE8B` (decoration only), soft-sage
highlight `#DCE8D3` behind `*marked*` words. Headlines in Kalam (handwritten), body in Lora (serif). 1080×1350
JPEG. Page number top right, `@soundmindwithshivani` at the bottom. Drawings are simple line art from
`art.js`, slightly wobbled to look hand-drawn. Contrast is test-locked (tests/soundmind-cards.test.js).

## Voice and safety

- Warm, plain, second person ("you") or her first person ("I"). Short sentences. No jargon.
- **Original lines only.** Never present a borrowed quote as hers; never invent a client's or follower's words.
- **No health claims:** no "cure", diagnosis, guarantees, medication or "you have <disorder>". `cards.js`
  refuses these words. Gentle practices (breathing, grounding, rest) are fine.
- Captions (framework S16, from week 44): a first line that speaks to "you" and names the feeling, 2–4 short lines that
  open up the idea, then the share or save ask; 1–5 hashtags including `#soundmind`. Never "comment KEYWORD" (S6).

## Weekly routine

1. Write `soundmind/<year>-w<week>/batch.json` (7 posts, `sm-NNN-…` slugs continue from the last week).
2. `node soundmind/render.mjs soundmind/<week>/batch.json`: checks every rule, renders the JPEGs next to
   it and writes one `<slug>.post.json` per post. A slide whose text or drawing doesn't fit fails the run.
   A new drawing goes in `art.js` first (its name is the catalogue).
3. Look at every slide.
4. `cd publisher && npm run queue:add -- --org=lws-pune ../soundmind/<week>/*.post.json`. The posts appear in
   GoPost's Ready tab under **Sound Mind with Shivani**. Approving puts each one in the next 18:00 IST slot
   (Instagram only: GoPost can't post carousels to Facebook yet).
5. After 7 days, read each post's shares, saves and reach on its GoPost card and compare with the baseline
   (`framework.md` → Carousels / Reels → Winning means; the typical post is in `analytics/soundmind-baseline.md`, local); write
   what happened into its lesson in `learnings.md` in words, and the figures into the local baseline.

The JPEGs are not committed (`.gitignore`); re-make them from `batch.json` with step 2.
