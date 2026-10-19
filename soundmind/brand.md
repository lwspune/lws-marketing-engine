# Sound Mind: shareable carousels (@soundmindwithshivani)

Runbook for the weekly Sound Mind batch. Outside brand: none of the LWS / PYQ rules or house styles apply here.
Shivani judges the finished posts in GoPost (staff login) and approves or rejects them. She doesn't review drafts.

## Why carousels (research, 2026-10-19)

Four model accounts were read through Meta's Business Discovery API (likes and comments only; Meta hides views,
shares and saves of other accounts):

| Account | What wins | Lesson for Sound Mind |
|---|---|---|
| @komal_reads (326K, India) | illustrated metaphor-story carousels, 10 slides; peaks of 766K and 336K likes | **Format B**: a story people send to a friend spreads furthest |
| @myeasytherapy (1.3M) | one sentence on a flat brand colour; images get ~10× the likes of her reels | **Format A**: one strong line beats a video; "comment KEYWORD" to sell |
| @selfcarewithwall (3.4M) | "this is so me" quote cards in carousels (mostly reposts + paid promos) | short, sendable lines; copy the format, never the content |
| @therapypulse (372K) | stick-figure psychology reels; median fell from 5.8K likes (Aug 2025) to ~300 | the format is wearing out: don't make it the main bet |

Sound Mind's own 80 reels (to 2026-06): median 399 views, **0 shares, 0 saves**, 6 s watch time.
GoPost can't post single images yet, so both formats are carousels.

## The two formats

- **Quotes** (`"format": "quotes"`, 4–8 slides): cover line → one statement per slide → share slide.
  Themes from her best posts: calm can't be forced, the inner critic, mindful pauses, self-acceptance, rest.
- **Story** (`"format": "story"`, 6–10 slides): cover (title, subtitle, drawing) → pages (one sentence or two
  with a drawing each) → one lesson slide → share slide. An everyday object stands in for a feeling
  (a kettle told to calm down, a plant that keeps being moved, a phone that never charges).

Every post ends with a **share slide**: *send this to…*, *save this for…* or *tell me in the comments*.

## Reels: the "ME" story (2026-10-19, on test)

Carousels mostly reach followers; reels reach people who don't follow yet. Model: @silvabydebalina's "protect your
peace" reel (45.6K likes on a 4.6K account), studied frame by frame. We rebuild its structure, never its content:

1. **Frame 0 carries the whole message** (top text) and the picture-metaphor (a calm **ME** figure).
2. **Conflict:** named pressures (*SHOULD, GUILT, WHAT WILL PEOPLE SAY?*) attack; the metaphor protects ME.
   Name feelings and pressures, not "negative people": the conflict stays, the tone stays kind.
3. **Close-up** on calm ME (no text), then a **second wave with a second line**.
4. **Happy ending:** the threat leaves, ME smiles, something grows.
5. 20–30 s, something moves every 1–2 s, text inside Instagram's safe band, calm piano made in code.

These rules are tests (`remotion/tests/sm001.test.ts`). Made in Remotion: `remotion/src/SoundMind001.tsx` + timeline
`src/lib/sm001.ts`; Kalam and Lora ship in `remotion/public/fonts` (Open Font Licence).
`cd remotion && npm run music:sm001 && npm run render:sm001 && npm run cover:sm001` → `soundmind/reels/`
(MP4 gitignored), then `queue:add` the `.post.json` beside it. Next metaphors on the same template: ME closing a
window on *Overthinking*, ME watering her own plant while *Other people's opinions* circle.

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
- Captions are short (one line, a question, a save/share nudge) with 1–5 hashtags including `#soundmind`.

## Weekly routine

1. Write `soundmind/<year>-w<week>/batch.json` (7 posts, `sm-NNN-…` slugs continue from the last week).
2. `node soundmind/render.mjs soundmind/<week>/batch.json`: checks every rule, renders the JPEGs next to
   it and writes one `<slug>.post.json` per post. A slide whose text or drawing doesn't fit fails the run.
   A new drawing goes in `art.js` first (its name is the catalogue).
3. Look at every slide.
4. `cd publisher && npm run queue:add -- --org=lws-pune ../soundmind/<week>/*.post.json`. The posts appear in
   GoPost's Ready tab under **Sound Mind with Shivani**. Approving puts each one in the next 18:00 IST slot
   (Instagram only: GoPost can't post carousels to Facebook yet).
5. After 7 days, compare shares and saves per post with her baseline (0 / 0) in the Insights tab.

The JPEGs are not committed (`.gitignore`); re-make them from `batch.json` with step 2.
