# @soundmindwithshivani post framework (v1.7, 2026-10-27)

How every Sound Mind post is made, one numbered point at a time, in three parts: **both formats**, **carousels** and
**reels**. Carousels and reels do different jobs (founder, 2026-10-21: "different fundamentally"): a carousel mostly
reaches followers, who keep it and send it on; a reel is how Sound Mind reaches people who don't follow yet. So each
has its own rules and its own measure of winning.

Same standard as @pyqvault_'s (`reels/pyqvault-framework.md`, founder 2026-10-20): **every point has a reason**, and
**no point is added, changed or dropped without one**. Sound Mind is an outside brand with its own formats, so its
points are numbered **S1, S2…**, not F-numbers: an F-number means the same idea on @pyqvault_ and @lws.pune, and none
of their rules apply here. How to make a batch (commands, look, voice) is in `brand.md`; the lessons behind each point
are in `learnings.md` (the L-numbers below, one numbering shared with the LWS logs).

**Sound Mind's numbers are not in this repo** (an outside brand's data; CLAUDE.md: write as if the repo were public).
The typical reel and carousel are in **`analytics/soundmind-baseline.md`**, local only (git-ignored).

**Status:** ✅ proven by Sound Mind's own numbers · 🧪 on test (the L-number measures it; other accounts' results count as
a reason, not as proof) · 📌 standing rule: the founder's call or a house standard (kept until our numbers say otherwise)

**Who decides:** the founder changes the framework. Shivani judges finished posts in GoPost and approves or rejects them.
GoPost records reach, shares and saves for carousels and reels alike (scorecard at 48 h and 7 d).

---

## Both formats

**S1 · One feeling her audience knows, said plainly.** Each post is about one feeling or pressure (calm can't be forced,
the inner critic, rest, self-acceptance, other people's opinions…), not a technique or a lecture. · *Why:* her
most-shared reels name a feeling ("Your body is not the problem.", "Feeling stuck?"); "this is so me" lines are what
@selfcarewithwall and @myeasytherapy are built on (`brand.md`). · *Check:* the post's title names the feeling. · 📌 house
standard

**S2 · Two formats every week: carousels and reels.** · *Why:* carousels and single images are where @myeasytherapy and
@komal_reads get their biggest numbers, but in the small accounts we studied (@habityra, @silvabydebalina) the reels,
not the carousels, reached beyond followers; Sound Mind's own carousels get shared more per person reached, its reels
reach more people. Each format is judged on its own job, below. · *Check:* the week's batch has both. · 🧪 L52

**S3 · Original lines only.** Never a borrowed quote presented as hers; never an invented client's or follower's words.
Copy a format, never content. · *Why:* the no-fabrication rule; Sound Mind's trust is the product. · *Check:* every line
is written for the post. · 📌 founder

**S4 · No health claims.** No "cure", diagnosis, guarantees, medication or "you have <disorder>"; gentle practices
(breathing, grounding, rest) are fine. · *Why:* it's a wellness brand, not therapy; a claim could hurt someone and the
brand. · *Check:* `soundmind/cards.js` refuses the words in slides and captions (`tests/soundmind-cards.test.js`). · 📌
house standard

**S5 · A warm, plain voice.** Second person ("you") or her first person ("I"), short sentences, no jargon. · *Why:* it's
how she speaks, and a line people can send to a friend has to sound like a friend. · *Check:* read it aloud. · 📌 house
standard

**S16 · Captions of a few lines, opening on "you".** The first line speaks to the reader and names the feeling ("You
don't have to earn rest."); then 2–4 short lines that open up the post's idea (what it looks like on a normal day, one
small thing to try); then the share or save ask (S6, S17); 1–5 hashtags. No more one-line captions. **Never "comment
KEYWORD"** on a post meant to spread; if Sound Mind sells something, the keyword goes in its own post. · *Why:* run 2 of
the element analysis: long captions went with hits in 5 of 7 wellness accounts (and in 4 of 6 science accounts in run
1), a first line to "you" in 3 (one the other way); still a lead, since a long caption may just go with a meatier post.
Keyword asks went with *ordinary* posts in 3 accounts and with hits in none: they're sales posts, and sales posts don't
travel. · *Check:* the caption has a "you" first line, at least 3 lines before the hashtags, and no keyword ask. · 🧪 L56
(the captions); 📌 founder, 2026-10-21 (no keyword asks; the next analysis run re-checks E24)

**S7 · Faceless, and it works muted.** Drawings and words, never Shivani's face or voice unless she chooses to record
one. · *Why:* the house rule (no flows that assume face or voice), and most people scroll muted. · *Check:* watch it
muted. · 📌 founder

---

## Carousels

**Their job:** to be kept and sent on. Most of the people who see a carousel already follow Sound Mind.

**Winning means:** at 7 days, more **shares per 1,000 people reached** than the typical Sound Mind carousel, **with at
least 2 shares** (so one share on a small reach isn't a win); then saves per 1,000 reached. The typical carousel is in
the local baseline (`analytics/soundmind-baseline.md` → Carousels: her 44 carousels, read 2026-10-21). Shares come first
because they're what the founder asked for ("content people share", 2026-10-19).

**S6 · End on a share slide.** *Send this to…*, *save this for…* or *tell me in the comments*. · *Why:* asking is the
cheapest lever for shares; the model accounts all ask. · *Check:* `cards.js` requires the share slide last. · 📌 house
standard (the element analysis, E14 / E23, tells us if asking goes with hits)

**S8 · Warm paper, hand-lettered.** Cream paper `#F6F1E7`, green-grey ink, sage accents, Kalam headlines + Lora body,
simple line drawings from `art.js`; text keeps WCAG AA contrast. · *Why:* calm and personal, unlike the stock-photo
look of most wellness pages. · *Check:* `tests/soundmind-cards.test.js`. · 📌 house standard

**S9 · Quotes and stories, side by side.** **Quotes** (4–8 slides): a cover line, one statement per slide, the share
slide. **Story** (6–10 slides): an everyday object stands in for a feeling (a kettle told to calm down, a plant that keeps
being moved), one lesson slide, the share slide. · *Why:* the two model accounts that win with carousels win with these
two kinds: @komal_reads' illustrated metaphor stories (peaks of 766K and 336K likes) and @myeasytherapy's one-line cards.
Which one Sound Mind's audience shares more is measured. · *Check:* `cards.js` checks the slide counts and order. · 🧪 L55

**S10 · Every slide fits, or the run fails.** One idea per slide; text and drawing have to fit at their size. · *Why:* a
squeezed slide is unreadable on a phone. · *Check:* `node soundmind/render.mjs` refuses a batch with a slide that doesn't
fit. · 📌 house standard

**S19 · Scene stories: a real everyday moment, told so people swipe to the end.** A third kind of carousel (`"format":
"scene"`, 8–10 slides): an ordinary moment from an Indian woman's day (the Diwali kitchen, the family function), in its
own flat illustrated style instead of line drawings, with speech and thought bubbles. The cover promises a turn; at least
two middle slides end on a cliffhanger line (*Then her daughter walked into the kitchen.*); the turn comes from someone
kind, with no villain to hate and no revenge; then one lesson, then the share slide. · *Why:* the founder pointed at an
illustrated comic story (@black_thoughtss_, 2026-10-22; studied in `SUGGESTIONS.md`): its comments ran about 6× that
account's typical carousel, but much of it was backlash at the villain, so the turn is kept and the villain dropped; the
founder asked for "more detailed and relatable" stories that make viewers "swipe the cards to reach the end". · *Check:*
`cards.js` (slide counts, scenes, cliffhangers, bubbles; `tests/soundmind-cards.test.js`) and
`remotion/tests/sceneStory.test.ts` (text and bubbles fit, no bubble on a face, tails at the speaker). · 🧪 L57

---

## Reels: the "ME" story

**Their job:** to reach people who don't follow Sound Mind yet. Instagram only shows a reel to more people when its
first viewers keep watching.

**Winning means:** at 7 days, **more people reached and longer watch time** than the typical Sound Mind reel; then shares
per 1,000 reached against the typical reel, with at least 2 shares. The typical reel is in the local baseline
(`analytics/soundmind-baseline.md` → Reels: all 81 reels, read 2026-10-21).

**S11 · The ME story.** Frame 0 carries the whole message (top text) and the picture metaphor (a calm **ME** figure);
named pressures (*SHOULD, GUILT, WHAT WILL PEOPLE SAY?*) attack and the metaphor protects ME; a close-up with no text,
then a second wave with a second line; a happy ending (the threat leaves, ME smiles, something grows). · *Why:*
@silvabydebalina's "protect your peace" reel built this way got 45.6K likes on a 4.6K account, about 2,500× her usual 18;
the message has to be on frame 0 because Sound Mind's viewers leave within the first few seconds. · *Check:*
`remotion/tests/sm00N.test.ts` (frame 0 has the message and ME, the beats in order). · 🧪 L53

**S12 · Name feelings, not people.** The attackers are pressures and feelings, never "toxic people" or "haters". ·
*Why:* the conflict holds attention; the kindness is the brand. · *Check:* read the labels. · 📌 house standard

**S13 · 20–30 s, something moving every 1–2 s, text in the safe band.** · *Why:* a still second loses a scroller;
Instagram's buttons cover the bottom and right of the frame. · *Check:* the reel's tests. · 📌 house standard

**S17 · The share ask is the caption's last line.** · *Why:* a reel has no last slide to ask on, and the ask must not
cover the picture. · *Check:* read the caption. · 📌 house standard

**S18 · Flat 2D, vivid.** The `VIVID` palette (`remotion/src/lib/smPalette.ts`): morning-blue sky, fresh greens, coral
bloom; text in the green-grey ink, WCAG AA on every background. · *Why:* the founder scrapped a clay-3D version
(2026-10-20: "flat 2D only") and asked for more vibrant colours. · *Check:* `remotion/tests/smPalette.test.ts`. · 📌
founder; vivid vs muted measured by L54

**S14 · Calm piano, made in code.** · *Why:* no licence risk, and the mood is calm, not energetic. · *Check:*
`remotion/music/sm00N.json`. · 📌 house standard

**S15 · Made in Remotion, tested.** Shared pieces in `remotion/src/MeStory.tsx`, each reel's timeline in
`src/lib/sm00N.ts`, tests first. · *Why:* frame-exact video (the founder judged Remotion "far better", 2026-10-18), and
the beats are checked instead of eyeballed. · *Check:* `npm test` in `remotion/`. · 📌 founder

---

## Reels: the pause reel

**Their job and winning:** the same as the ME story's (reach people who don't follow yet; at 7 days, more people reached
and longer watch time than the typical reel, then shares per 1,000 reached with at least 2 shares). S11 and S13's length
don't apply to a pause reel; S1, S4, S5, S7, S12, S14, S16, S17 and S18's colours do.

**S20 · Pause reels: a calm moment to watch, 12–15 s, made to loop.** One everyday scene (chai on a rainy balcony, phone
face down), drawn flat (S18), filmed as 3–4 shots from the one drawing with dissolves between them: wide → close-ups
with no text and the background in soft focus → wide again. Layers move at their own depth as the camera drifts, and
something always moves (rain, steam, breeze, blinks). The person is a young woman (early 20s; founder, 2026-10-23). The message is on frame 0 (it names the
feeling, S1), one line comes back at the end, and the camera ends where it began, so the loop doesn't jump. Rain and
piano are made in code. · *Why:* the founder pointed at an AI-made anime reel (@pixcraft_132, 2026-10-23: a man with
chai under a tree in the rain, 12 s, four shots, no words, caption "Peace") that people reposted widely: a mood they send
on, and a short loop adds watch time. Made our way, not with AI video: no "AI info" label on Shivani's brand, and the
founder's rules for reels (flat 2D, S18; Remotion, S15). **The scene is in season** (founder, 2026-10-24: "since it is not monsoon, we need to have different setup"): rain only in the monsoon (June–September), indoor and evening scenes otherwise. · *Check:* `remotion/tests/sm011.test.ts` (message at frame 0,
the shots, close-ups that hold their subject, the loop, constant motion, words WCAG AA). · 🧪 L66

**S21 · Painted 2D: the look of every new reel.** No black ink outlines: each colour has a light side, a shadow
side and an edge that is a darker shade of itself (`remotion/src/lib/paint.ts`). Mood light (dusk, a warm lamp) with a
glow, reflections on wet or shiny surfaces, layers at their own depth with soft focus behind close-ups, a fine grain.
White text on dark skies, the ink on light ones, both WCAG AA. · *Why:* the founder, comparing the two pause reels
(2026-10-24): sm-r012 "tapri at dusk" (painted) "looks much better" than sm-r011 (flat, outlined); earlier he read
outlined drawings as "kids drawing". · *Check:* the reel's palette passes `paintProblems()` in its test (sm-r012:
`remotion/tests/sm012.test.ts`). · 📌 founder; painted vs flat measured by L67

## Reels: the reminder reel

**Their job and winning:** the same as the ME story's (reach people who don't follow yet; at 7 days, more people reached
and longer watch time than the typical reel, then shares per 1,000 reached with at least 2 shares). S11 doesn't apply;
S1, S3, S4, S5, S7, S12, S14, S16, S17 and S21 do, and S20's "in season" rule.

**S22 · Reminder reels: one short line at a time over drifting painted scenes, 25–32 s.** A kind message told as 9–12
short lines (8 words at most), one on screen at a time, mid-frame in Lora, each up long enough to read (about 3 words a
second); the hook on frame 0 names the feeling and raises a question. Underneath, 4–5 painted scenes (S21) that drift
and dissolve into each other, no hard cuts; the last seconds sink dark so the loop is soft. No voice: the words are on
screen (S7). · *Why:* the founder pointed at a 34 s "let me remind you" reel (2026-10-27; studied frame by frame: 15
lines of ~2 s over night skies, the hook inside a dark circle, music only) and asked for one like it for Sound Mind. An
AI voice was considered and left out: on Shivani's account it would pass as her voice and needs Meta's "AI info" label,
and on @pyqvault_ voice brought no gain (L43); her own recorded voice is welcome as a second version. · *Check:*
`remotion/tests/sm014.test.ts` (the hook on frame 0, one line at a time, reading time, safe band and 3:4 crop, the
dissolves, the dark ending, painted palette, words WCAG AA, no health claims). · 🧪 L75

---

## Changing the framework

1. **Every change has a reason.** Add, change or drop a point only with a line in the change log below: what changed,
   why (our numbers with their L-number, an account we studied, or the founder's call), and which lesson measures it.
2. **A founder's call goes in at once** (📌 or 🧪) and gets a lesson in `learnings.md` that measures it.
3. **Our numbers decide.** A 🧪 point becomes ✅ when at least 3 posts that follow it win by their format's measure
   (Carousels or Reels → Winning means) at 7 days; it's dropped (and logged here) when at least 3 show no gain. Read
   after every 7-day update. A point in "Both formats" needs the wins in both.
4. **What other accounts do is a lead, not proof.** An element the analysis (`reels/analysis-framework.md` → Sound Mind)
   marks ✅ comes in only when the founder picks it, as 🧪 with a lesson.
5. Points keep their number when others are dropped or moved; new points take the next free number.
6. **No Sound Mind numbers in this file or `learnings.md`:** they go in `analytics/soundmind-baseline.md` (local).

## Change log

| Version | Date | Change | Why |
|---|---|---|---|
| v1 | 2026-10-21 | Framework created from `brand.md`'s rules (S1–S15), each with a reason, a check and a status; "winning" set to shares per 1,000 reached at 7 days. Lessons L52–L55 measure the four points on test. | Founder: a framework like @pyqvault_'s, for Sound Mind. Nothing in it is new: it numbers what Sound Mind already does, so changes from here on have a trail. |
| v1.1 | 2026-10-21 | S6: never "comment KEYWORD" on a post meant to spread. S16 added: captions of a few lines, opening on "you" (replaces the one-line caption); on test, L56. | Founder chose both from run 2 of the element analysis (`reels/analysis-framework.md`): keyword asks went with ordinary posts in 3 accounts; long captions with hits in 5, a "you" first line in 3. Week 43's posts keep their one-line captions and are L56's comparison (SUGGESTIONS.md → Backfill ledger). |
| v1.7 | 2026-10-27 | S22 added: reminder reels, a third kind of reel (one short line at a time over drifting painted scenes, 25–32 s, ending dark). On test, L75; first: sm-r014 "a reminder under the stars" (Diwali night, in season). | Founder, after the study of a "let me remind you" reel: "analyse and create similar reel for soundmind"; silent-first (AI voice declined: it would pass as Shivani's). |
| v1.6 | 2026-10-24 | S20: a pause reel's scene is in season (rain only June–September); sm-r013 "window seat" is the first indoor one, and its test refuses a rain bed. | Founder, 2026-10-24: "since it is not monsoon, we need to have different setup like chai in cozy room besides window with book in hand". |
| v1.5 | 2026-10-24 | S21 added: Painted 2D, the look of every new reel (no black outlines, light and shadow sides, mood light, reflections, depth and soft focus); checked by `paint.ts`. S18's vivid palette still sets the colours of ME reels. L67 measures painted vs flat. | Founder, comparing pause reel #2 (painted) with #1 (flat, outlined): "this looks much better ... lets save it". |
| v1.4 | 2026-10-23 | S20 added: pause reels, a second kind of reel (one calm everyday scene in 3–4 shots, 12–15 s, made to loop, the message on frame 0). On test, L66; first: sm-r011 "chai in the rain". | Founder, after the study of an AI-made "peace" reel: "how can such reels be made for soundmind?", then chose our own flat 2D way over AI video. |
| v1.3 | 2026-10-22 | S19 added: scene stories, a third kind of carousel (an everyday moment, illustrated, cliffhangers, a kind turn). On test, L57. | Founder, after the study of an illustrated story carousel: "more detailed and relatable story. viewers should swipe the cards to reach end"; "it doesn't have to be ME". |
| v1.2 | 2026-10-21 | Split into Both formats / Carousels / Reels, each format with its own winning measure: carousels on shares per 1,000 reached, reels on reach and watch time first. S6 is now the carousels' share slide; the reels' ask is the new S17. S8 is now the carousel look; the reel look is the new S18 (L54 measures S18). The keyword rule moved from S6 to S16 (captions, both formats). Sound Mind's numbers moved out to `analytics/soundmind-baseline.md` (local); a carousel baseline added there (her 44 carousels). | Founder: "separate sections for reels and carousels since those are different fundamentally". A carousel reaches followers who keep and send it; a reel is how Sound Mind reaches new people, and Instagram spreads a reel by watch time. Her own carousels get about twice the reels' shares per person reached. Numbers out: founder, 2026-10-21, "write as if the repo were public". |
