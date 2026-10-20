# Suggestions

A running list of actionable improvements and blockers. Strike through when done.

---

## Blockers only the user can clear

### Fill in the Crack SSB profile
The app ships with a blank Crack SSB profile. Until it holds real buyer problems and real assets,
the app refuses to generate for it (by design, no-slop rule).
**How:** open the app → Products → Crack SSB → fill buyer, problems, assets, offer. Or tell Claude
what Crack SSB is and Claude drafts the profile for review.

### Locate real PYQ chapter-weightage data (Phase 2 lead magnet)
The Weightage Map must be built from real per-chapter PYQ counts, not invented ones.
**How:** point Claude to the source file (the NDA comment analysis workbook or the question-bank
folders). **Lead (2026-10-12):** the question bank's Supabase is readable with the anon key and
holds `pyq_year` + `chapter_id` for 2,160 NDA Maths PYQs, so real chapter counts can be queried.

### Telegram channel + BotFather token (Phase 3)
**How:** create a public channel; message @BotFather → New Bot → paste the token to Claude.

### PYQ Vault price + UPI method (Phase 3)
**How:** decide the price and pick UPI ID / QR / payment-link provider.

### Publisher setup (built 2026-10-12, needs the founder's accounts)
Code, tests and migrations are in `publisher/`. To go live, follow `publisher/SETUP.md`: Supabase
project → migrate + seed → Meta app + `connect:meta` → Vercel deploy → scheduler secrets → `queue:add`.
Then run the 17 DB tests against the real database and do ONE real test post with the founder's OK.

## Deferred improvements

- **Publisher phase 3: YouTube Shorts.** Google Cloud project + OAuth + `videos.insert`; uploads stay
  private until Google's API audit passes, so submit the audit form early. Then the
  "Subscribe for more" YouTube render variants (`?platform=yt`).
- **Publisher: upload from the dashboard** (drag a reel in) instead of `npm run queue:add`.
- **Publisher: account health**: warn on the dashboard when a token stops working.

- Sequence writer (10-day nurture) as a fifth screen, exporting JSON the bot can run.
- Weekly leads log inside the app (Phase 4).
- Fold the PYQ Vault SEO briefs in Downloads into that app's own backlog; out of scope here.
- Instagram auto-posting via the Graph API (analysed 2026-10-12): deferred. Needs public video
  hosting + an always-on runner + token refresh, which breaks local/no-server. Revisit when posting
  >10 pieces/week and Instagram brings real leads; prefer a paid scheduler's API over building one.
- Make the export an "Instagram posting sheet" (caption, hashtags, on-screen text, suggested slot)
  so scheduling in Meta Business Suite is pure paste.
- Rendered PYQ reels (typed steps animated to MP4, no filming): try after the first pen-and-paper
  reels show what performs.
- ~~**Format test (asked 2026-10-12):** hook reel, solution reel, image post, V robot reel.~~ Built
  2026-10-12, see `reels/format-test.md`. **Next:** user posts days 1–4 and fills the scorecard;
  then repeat the top two formats before committing.
- **White visual reels, next PYQs (all six 2024–2026 NDA Maths papers sorted 2026-10-13):** 83 of 720
  questions are solved by a picture, about 14 per paper; see `reels/visual-candidates.md` (by picture type,
  with a "make next" order). Make more only if reel 005 scores in the top two on the scorecard.
- Reel kit generator: once `reels/nda-maths-001.md` format is proven, pull a PYQ from the question
  bank and draft the kit inside the app (still behind the approval gate).

## Backfill ledger

### ~~@pyqvault_ Chemistry #4 opens on a still picture for 2 s~~ (logged 2026-10-20) DONE the same day: the founder had both
Physics #4 and Chemistry #4 remade (framework v1, `reels/pyqvault-framework.md`) instead of posting them as they were
New founder rule (L31 in `reels/pyqvault-learnings.md`, rule in `reels/pyqvault-insta.md`): the question sits in front
while the animation already runs behind it, no still frames in the first 3 s. Chemistry #4 (approved, posts 20 Oct
17:30) shows the question over a cylinder that stays still until the flames light at 2 s. Physics #4 (11:00) starts
moving at 0.8 s: close enough. Reels already posted aren't touched.
**360:** scope = one approved reel · blast radius = its GoPost post (MP4 + cover replaced) · does it apply? partly: 2 s
still with the question already on screen, vs the 2.6 s title card before · risk = re-render + re-upload hours before
its slot · cost ≈ 20 min · **recommendation: leave it.** It's still a clean predict-first test (L28), and set against
Physics #4 (moving at 0.8 s) it gives a first hint for L31.

### Wrong handle burned into reels 001–004 (logged 2026-10-12, DECLINED by user the same day)
User: viewers can tap the account to follow, so the handle isn't needed; keep the Instagram files as
they are. Future pieces carry no handle on screen (see `reels/lwspune-insta.md`).

The real handle is **@lws.pune**. The end cards of all three reels and carousel slide 4 show
"Follow @lwspune" in the picture. Docs, captions and memory are already fixed. **Proposed:** change
the text in the four `*.render.html` files, re-render the 3 MP4s and slide 4, then re-verify frames
and audio.

### Move reel 001 onto the shared engine (logged 2026-10-12, not proposed yet)
`reels/nda-maths-001.render.html` predates `reels/engine.js` and duplicates its drawing/music code.
The approved MP4 is already rendered, so nothing is broken; the cost is two copies to maintain if
001 is ever re-made. Run a 360 analysis and ask before touching it. Leaning: defer until 001 needs
an edit.

### Face + voice Reels vs the shipped faceless rule (logged 2026-10-01, awaiting user confirmation)
User now wants Reels made end to end with their face and voice. Shipped work assumes faceless + silent:
`FACELESS_RULE` and the Reel script prompt in `core.js`, tests in `tests/core.test.js`, CLAUDE.md
constraints/don'ts, MARKETING_PLAN.md, memory `user-camera-shy-faceless`.
**Proposed:** partial. Add a "Talking (AI clone)" Reel format next to faceless; don't delete faceless.
Keep the one approval gate. `git init` first so the change can be undone.
