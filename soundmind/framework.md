# @soundmindwithshivani post framework (v1.2, 2026-10-21)

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
| v1.2 | 2026-10-21 | Split into Both formats / Carousels / Reels, each format with its own winning measure: carousels on shares per 1,000 reached, reels on reach and watch time first. S6 is now the carousels' share slide; the reels' ask is the new S17. S8 is now the carousel look; the reel look is the new S18 (L54 measures S18). The keyword rule moved from S6 to S16 (captions, both formats). Sound Mind's numbers moved out to `analytics/soundmind-baseline.md` (local); a carousel baseline added there (her 44 carousels). | Founder: "separate sections for reels and carousels since those are different fundamentally". A carousel reaches followers who keep and send it; a reel is how Sound Mind reaches new people, and Instagram spreads a reel by watch time. Her own carousels get about twice the reels' shares per person reached. Numbers out: founder, 2026-10-21, "write as if the repo were public". |
