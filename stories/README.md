# Daily maths question stories (@pyqvault_ and @lws.pune)

A daily maths question as an Instagram story, from PYQ Vault's question bank. **The cards never name an
exam**: just the question and its options. One series per account, each in its own folder:

| Series (folder) | Account | GoPost project | Questions | Since |
|---|---|---|---|---|
| `stories/pyqvault/` | @pyqvault_ | `pyqvault-insta` | easy MHT-CET Maths | 2026-10-21 (founder: engagement and reach) |
| `stories/lwspune/` | @lws.pune | `pyq-vault` | easy NDA Mathematics | 2026-10-24 (founder 2026-10-23: the quiz-link stories brought zero leads) |

The folder decides the account (`SERIES` in `questions.js`); "never posted before" is checked per account.
@lws.pune's old Saturday quiz-story job is switched off (migration 0022).

## What goes up each day

| Time (IST) | Card | Words on it |
|---|---|---|
| 07:30 | question (`maths-q-<date>`) | the question, options A–D, "Reply A, B, C or D" |
| 19:30 | answer (`maths-a-<date>`) | "Answer", the question (small), the right option highlighted, a one-line "Why", "New question tomorrow, 7:30 am" |

Replies come in as DMs and land in GoPost's Inbox, marked as story replies. Instagram doesn't let apps add
quiz or poll stickers, which is why people reply instead of tapping. Each story's numbers (reach, replies,
follows, profile visits, taps away) are saved at 23 h and shown in Insights → "Daily maths questions · <account>",
one box per account, kept apart from @lws.pune's old quiz stories.

## The weekly routine (Claude, ~20 min per account; founder, one click)

Do it once per account: `<series>` is `pyqvault` or `lwspune`.

1. **Shortlist:** `node stories/pick.mjs --series=<series> --out=<scratchpad>/candidates.json`. This reads the
   question bank with the public anon key (read-only) and keeps public, easy, picture-free MCQs that have four
   text options and fit a story. Questions already used in any `stories/<series>/*/batch.json` are skipped.
2. **Choose 7.** Spread the chapters, and spread the right answers over A–D (no letter more than twice a week).
   Pick questions someone can do in their head in under a minute. (The batch check enforces the A–D spread.)
3. **Re-derive every answer yourself** before it goes in. Write how you did it in `checked`, and say whether
   it matches the bank. If it doesn't, drop the question. Tidy the wording if needed (no "......", no exam
   names, a long formula on its own line as `\[…\]`), but never change the maths.
4. **Write** `stories/<series>/<year>-w<week>/batch.json` (Monday to Sunday; see `pyqvault/2026-w44`). In JSON every
   backslash is doubled: `\\(x\\)`, `\\times`, `\\right`. A single `\t`, `\r`, `\b` or `\f` becomes a
   control character, and the batch check refuses it.
5. **Render:** `node stories/render.mjs stories/<series>/<week>/batch.json`. It checks the batch, then draws
   14 JPEGs (1080×1920) and 14 `.post.json` files next to it. It fails if any maths won't set or any card
   doesn't fit between Instagram's top and bottom buttons. Look at every card.
6. **Queue:** `cd publisher && npm run queue:add -- --org=lws-pune ../stories/<series>/<week>/*.post.json`.
   They arrive in GoPost as Ready. To fix a card that's still Ready, re-render it and add `--replace`.
7. **Founder:** "Approve all stories" in GoPost, once per account (the button approves every Ready story of
   the project on screen). Each card is scheduled for its own time. A card whose day has already passed is refused.

## Files

- `questions.js`: the pure rules (batch check, exam-name check, times, card words, manifests). Tests:
  `tests/stories-questions.test.js` (`node --test tests/*.test.js`).
- `card.html`: the card template. Maths is set by KaTeX, the same version pyqvault.com uses
  (`vendor/katex`, MIT), and the text is in Cambria on the Reel.WHITE board.
- `render.mjs`: batch → JPEGs + manifests (headless Edge via `reels/tools/edge.mjs`).
- `pick.mjs`: the shortlist from the question bank (`--series` picks the exam).
- Publisher side: manifest `kind: "story"` (`publisher/src/lib/domain/manifest.ts`) and migration
  `0019_question_stories.sql` (a story shows a quiz OR a question, frozen once approved).
