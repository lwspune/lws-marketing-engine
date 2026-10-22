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
