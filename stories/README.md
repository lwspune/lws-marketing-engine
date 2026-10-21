# @pyqvault_ daily maths question stories

Founder, 2026-10-21: a daily maths question as an Instagram story on @pyqvault_, for engagement and reach.
Easy MHT-CET maths MCQs from PYQ Vault's question bank. **The cards never name an exam**: just the question
and its options.

## What goes up each day

| Time (IST) | Card | Words on it |
|---|---|---|
| 07:30 | question (`maths-q-<date>`) | the question, options A–D, "Reply A, B, C or D" |
| 19:30 | answer (`maths-a-<date>`) | "Answer", the question (small), the right option highlighted, a one-line "Why", "New question tomorrow, 7:30 am" |

Replies come in as DMs and land in GoPost's Inbox, marked as story replies. Instagram doesn't let apps add
quiz or poll stickers, which is why people reply instead of tapping. Each story's numbers (reach, replies,
follows, profile visits, taps away) are saved at 23 h and shown in Insights → "Daily maths questions",
kept apart from @lws.pune's quiz stories.

## The weekly routine (Claude, ~20 min; founder, one click)

1. **Shortlist:** `node stories/pick.mjs --out=<scratchpad>/candidates.json`. This reads the question bank
   with the public anon key (read-only) and keeps public, easy, picture-free MCQs that have four text options
   and fit a story. Questions already used in any `stories/pyqvault/*/batch.json` are skipped.
2. **Choose 7.** Spread the chapters, and spread the right answers over A–D (no letter more than twice a week).
   Pick questions someone can do in their head in under a minute. (The batch check enforces the A–D spread.)
3. **Re-derive every answer yourself** before it goes in. Write how you did it in `checked`, and say whether
   it matches the bank. If it doesn't, drop the question. Tidy the wording if needed (no "......", no exam
   names, a long formula on its own line as `\[…\]`), but never change the maths.
4. **Write** `stories/pyqvault/<year>-w<week>/batch.json` (Monday to Sunday; see 2026-w44). In JSON every
   backslash is doubled: `\\(x\\)`, `\\times`, `\\right`. A single `\t`, `\r`, `\b` or `\f` becomes a
   control character, and the batch check refuses it.
5. **Render:** `node stories/render.mjs stories/pyqvault/<week>/batch.json`. It checks the batch, then draws
   14 JPEGs (1080×1920) and 14 `.post.json` files next to it. It fails if any maths won't set or any card
   doesn't fit between Instagram's top and bottom buttons. Look at every card.
6. **Queue:** `cd publisher && npm run queue:add -- --org=lws-pune ../stories/pyqvault/<week>/*.post.json`.
   They arrive in GoPost as Ready. To fix a card that's still Ready, re-render it and add `--replace`.
7. **Founder:** "Approve all stories" in GoPost. Each card is scheduled for its own time. A card whose day
   has already passed is refused.

## Files

- `questions.js`: the pure rules (batch check, exam-name check, times, card words, manifests). Tests:
  `tests/stories-questions.test.js` (`node --test tests/*.test.js`).
- `card.html`: the card template. Maths is set by KaTeX, the same version pyqvault.com uses
  (`vendor/katex`, MIT), and the text is in Cambria on the Reel.WHITE board.
- `render.mjs`: batch → JPEGs + manifests (headless Edge via `reels/tools/edge.mjs`).
- `pick.mjs`: the shortlist from the question bank.
- Publisher side: manifest `kind: "story"` (`publisher/src/lib/domain/manifest.ts`) and migration
  `0019_question_stories.sql` (a story shows a quiz OR a question, frozen once approved).
