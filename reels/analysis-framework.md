# Reel element analysis (v2, 2026-10-21)

**What it's for** (founder, 2026-10-20): look at popular reels element by element (background, colour, text, the hook,
the caption…), find which elements go with success and which don't, then decide carefully which to bring into the reel
framework (`pyqvault-framework.md`). Everything is done from our end: no one has to watch or tap anything.

**What it can and can't see.** Meta's competitor lookup (Business Discovery, read-only) gives other accounts' **cover
image, caption, time and numbers**, not their video (checked 2026-10-20: no `media_url` for their reels). We don't
scrape instagram.com (against Instagram's terms, and a risk to our Meta app). So v1 covers **cover + caption + timing**.
Motion, zooms, music and sound are judged from **our own reels** (we have every video and know every choice) and our
tests (L22, L33, L34).

---

## Method

1. **Sample.** For each studied science/maths account (@bisal.physics, @codematrixvishal, @sciencevisualised,
   @ubilumapp, @mathsy.uk, @maths_mentor24; data in `analytics/competitors/`): reels from its last 180 days (a year, then all
   time, if it has fewer than 10 hits there: @mathsy.uk's hits are from 2024);
   its **15 top reels** (highest views ÷ its typical reel, at least 3×) and **15 typical reels** (closest to 1×).
   *Why:* comparing hits with the same account's ordinary reels shows what's *different* about hits. Looking only at
   hits would credit whatever the account always does.
2. **Covers.** Fetched read-only (`publisher: npm run covers:fetch`), measured, then **deleted**: we keep the numbers,
   never their images.
3. **Measure** every element below for every reel (`reels/tools/elements.js`, `cover-metrics.mjs`).
4. **Eye-coded elements are coded blind:** covers shown shuffled, under neutral ids, without knowing which are hits.
5. **Compare.** Within each account, does the element show up more in top reels or in typical ones?
6. **Verdict across accounts** (the decision rule below), then a report for the founder.
7. **Into the framework only by the founder's choice**, through `pyqvault-framework.md`'s change log, each with its
   evidence and a lesson (L-number) that tests it on @pyqvault_. A pattern in other people's reels is a lead, not proof.

## Decision rule

Every element is turned into yes/no (numbers: "above this account's median for the element?"). For each account:

- **favours top** when the share of top reels with it is **≥ 15 points** higher than the share of typical reels;
- **favours typical** when it's ≥ 15 points lower;
- otherwise **no difference**. An account where the element never varies (e.g. always white) tells us nothing and
  isn't counted.

Across accounts:

- ✅ **works**: favours top in **≥ 3 accounts** and in at least **twice as many** accounts as it favours typical;
- ❌ **doesn't work**: the mirror image;
- ❔ **unclear**: anything else.

*Why these numbers:* 15 points is 2–3 reels out of 15, the smallest gap that isn't just noise in a sample this size;
3 accounts with a 2:1 majority keeps one account's quirk from deciding. Revisit both once we have more data.

## Elements (v1)

| # | Element | Measured how | Why we look |
|---|---|---|---|
| E1 | **Dark background** | cover's outer 10 % average brightness < 0.35 (auto) | dark vs white test (L22) |
| E2 | **Colourful** | Hasler–Süsstrunk colourfulness of the cover, above the account's median (auto) | vivid reels win (L30) |
| E3 | **Busy** | edge density of the cover, above median (auto) | vivid / many objects (L30) |
| E4 | **Bright accents** | share of strongly saturated pixels, above median (auto) | one-accent look vs many colours (L16) |
| E5 | **Text on cover** | none / short (≤ 6 words) / long (eye, blind) | how much a cover should say |
| E6 | **Question on cover** | yes/no (eye, blind) | predict-first hook (L28) |
| E7 | **Face or person** | yes/no (eye, blind) | our reels are faceless; does it matter? |
| E8 | **3D look** | yes/no (eye, blind) | 3D reels (L25) |
| E9 | **Many objects** | ≥ 5 separate things (particles, curves, elements) (eye, blind) | vivid (L30) |
| E10 | **Real photo / footage** | yes = camera image, no = drawn/animated (eye, blind) | animation vs real |
| E11 | **Long caption** | characters above median (auto) | do long explanations help? |
| E12 | **Opens with a question** | the caption's first line contains "?" (auto) | hook in the caption |
| E13 | **Asks for a comment** | "comment / guess / answer / tell me / which one…" (auto) | comments (L28) |
| E14 | **Asks to save, share or follow** | (auto) | save/follow asks |
| E15 | **Many hashtags** | count above median (auto) | hashtags |
| E16 | **Emojis** | any emoji (auto) | tone |
| E17 | **Numbered series** | "#N", "Part N", "Day N" (auto) | series (L14) |
| E18 | **Posted in the morning (IST 06–12)** | (auto) | timing (L21, L32) |
| E19 | **Posted on a weekend** | Sat/Sun IST (auto) | timing |

Next versions add elements as we learn (e.g. topic type, everyday hook), each with its reason, like the framework.

## Sound Mind set (v2, 2026-10-21)

Same method and decision rule, for @soundmindwithshivani (founder: "a similar one for Sound Mind"); findings go into
`soundmind/framework.md` only by the founder's choice. What's different:

- **Accounts:** @komal_reads, @myeasytherapy, @selfcarewithwall, @therapypulse, @habityra, @silvabydebalina,
  @easybrilliantart (`soundmind/brand.md` → research). **@soundmindwithshivani is in the sample as "ours":** shown in
  its own column, never counted in the verdict (one account is a lead, not proof).
- **Every post, judged on likes.** Meta gives views only for other accounts' reels; carousels and images only have
  likes. So top/typical is each post's likes ÷ its account's median likes, across reels, carousels and images.
  Exported with `npm run competitors:export -- --org=lws-pune --handles=…` (publisher; `--metric=likes`, last year).
- **Run it:** `node reels/tools/element-analysis.js sample <out-dir> soundmind`, then the same steps as above.
- **Elements:** E1–E19, plus:

| # | Element | Measured how | Why we look |
|---|---|---|---|
| E20 | **Carousel** | post type (auto) | carousels vs reels (L52) |
| E21 | **Reel** | post type (auto) | the same question from the other side |
| E22 | **Many slides** | carousels only: slide count above the account's median (auto) | how long a carousel should be |
| E23 | **Asks to send / tag someone** | "send this to / share this with / tag a…" (auto) | the share ask (S6) |
| E24 | **"Comment KEYWORD"** | "comment" + a word of 3+ capitals (auto) | @myeasytherapy sells this way |
| E25 | **First line speaks to "you"** | you / your / you're / yourself in the caption's first line (auto) | the voice (S5) |
| E26 | **Handwritten lettering** | the main words look hand-written (eye, blind) | Sound Mind's Kalam headlines |
| E27 | **Everyday object as a metaphor** | an object stands for a feeling (a slow truck, a cake that can't rise) (eye, blind) | story carousels (L55) |
| E28 | **Drawn character / figure** | a drawn or painted person, animal or creature (eye, blind) | the ME figure (S11) |
| E29 | **Quote card** | words on a plain or textured colour, at most a small decoration (eye, blind) | quote carousels (L55) |

Eye-coding anchors for this set: E5 counts words on the cover (≤ 6 short, > 6 long); E6 is a question **or a named
struggle** (anxiety, burnout, overwhelm); E7 is a real person's face or body in a photo (a hand counts; drawn people are
E28); a photo with a quote over it is E10, not E29.

## Runs

### Run 1 · 2026-10-20 · covers + captions · 180 reels, 6 accounts

Full tables: `analytics/elements/2026-10-20/report.md` (raw: `results.json`; inputs `sample.json`, `covers.json`,
`eye.json`). Steps to repeat it are at the top of `reels/tools/element-analysis.js`.

- **19 of 20 elements: ❔ unclear.** Within an account, hits and ordinary reels have the same kind of cover and caption:
  each account does one thing every time (always dark, always a question card, never a face). **What makes some reels
  take off is inside the reel (topic, motion), which a cover can't show.** That backs L30 (vivid) and F21 (choosing
  the topic) as the main levers, not cover styling.
- **✅ Long caption (E11):** more common in the top reels of 4 accounts (60 % vs 40 % in three of them), the reverse in
  @sciencevisualised. A weak lead: 3 reels out of 15, and a long caption may just go with a meatier topic.
- **Watch:** a question on the cover (E6) leaned to *typical* reels on @codematrixvishal (0 % vs 33 %) and @mathsy.uk
  (27 % vs 47 %). Not a verdict, but our predict-first covers (F4, F6) do this, so L28's own numbers decide.
- **Can't say:** background colour (most accounts never change it), face, 3D, photos (too rare).

**Next:** v2 measures **our own reels' videos** (motion at frame 0, zooms, pace, sound, colour over time), where we
know every choice and have every file, alongside our tests (L22, L33, L34, L35).

### Run 2 · 2026-10-21 · Sound Mind set · 225 posts, 7 accounts + ours

Full tables: `analytics/elements/2026-10-21-soundmind/report.md`. **Covers: 88 of 225.** Meta's hourly request limit
stopped the download; @myeasytherapy, @selfcarewithwall and @silvabydebalina are complete, the rest have none (4 of
@komal_reads, all typical). So the cover elements (E1–E10, E26–E29) are from 3 accounts and can't reach a verdict yet;
caption, format and timing cover all 225 posts.

- **✅ Long caption (E11):** more common in the top posts of 5 accounts (@komal_reads 73 % vs 27 %, @selfcarewithwall
  67 % vs 33 %, @habityra 67 % vs 40 %), the reverse in 2 (@myeasytherapy, @easybrilliantart). The second study in a row
  to say so (run 1: 4 of 6 science accounts). Ours leans the same way (67 % vs 33 %). Still a lead: a long caption may
  just go with a meatier post. Note `brand.md` says Sound Mind captions are short.
- **✅ The caption's first line speaks to "you" (E25):** top in 3 (@komal_reads 40 % vs 13 %, @selfcarewithwall
  67 % vs 47 %, @habityra 67 % vs 33 %), typical in 1 (@myeasytherapy).
- **❌ "Comment KEYWORD" (E24):** more common in *typical* posts in 3 accounts (@myeasytherapy 0 % vs 27 %, @habityra
  0 % vs 27 %, @silvabydebalina 13 % vs 33 %), never in top. These are sales posts: they collect comments from people who
  already follow, not likes from new ones. A keyword ask on a post meant to spread works against it.
- **Leads** (2 accounts each, none the other way): a drawn character on the cover (E28: @selfcarewithwall 22 % vs 0 %,
  @silvabydebalina 20 % vs 0 %); a save / share / follow ask (E14: @habityra, @silvabydebalina). @silvabydebalina's hits
  show a real person or photo far less often (E7 27 % vs 73 %, E10 53 % vs 80 %). A question or named struggle on the
  cover leans *typical* at @myeasytherapy (7 % vs 40 %), as it did for two science accounts in run 1.
- **Format** (from the exports, median likes per format, last year): where an account posts both, the still formats
  out-like its reels 3–11×: @komal_reads carousels 1,603 vs reels 303; @myeasytherapy single images 5,131, carousels
  1,551, reels 459. Sound Mind's own: reels 25, carousels 26. Likes aren't reach (reels find non-followers), so L52
  decides on our own shares and reach.
- **What the hits look like:** @komal_reads' best are metaphor-story carousels (*Your train is not late…* 607× its median,
  *Life of a lotus* 266×, *Life of a snail* 46×); @easybrilliantart's are reels of a one-line quote being drawn, about
  silence, being alone and peace (up to 445×, 174K likes).

**Next:** the other 137 covers when Meta's limit allows (`covers:fetch` skips the ones already saved), then the cover
verdicts.

## Change log

| Version | Date | Change | Why |
|---|---|---|---|
| v2 | 2026-10-21 | Sound Mind set: 7 wellness accounts + ours (shown, not counted), every post judged on likes, E20–E29 (format, slides, send / keyword asks, "you", handwriting, metaphor, drawn figure, quote card). Run 2. | Founder: an analysis like @pyqvault_'s for Sound Mind. Likes because Meta gives no views for other accounts' carousels; our own account kept out of the verdict because one account is a lead, not proof. |
| v1 | 2026-10-20 | Created: method, decision rule, 19 cover/caption/timing elements. | Founder: analyse popular reels element by element before changing the framework. Cover + caption only, because Meta doesn't give other accounts' videos and we don't scrape. |
