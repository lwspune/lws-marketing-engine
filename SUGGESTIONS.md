# Suggestions

A running list of actionable improvements and blockers. Strike through when done.

---

## Blockers only the user can clear

### ~~Meta app "API access blocked" (found 2026-10-17)~~ RESOLVED 2026-10-17 (founder cleared it in the developer dashboard; all 3 tokens valid again)
Every call with the Meta app (`1475312887986856`, "Digital Marketing Automation") returns code 200
"API access blocked", even app-level calls, so it's an app restriction, not an expired token. Blocks:
publishing (daily quiz Stories queued 19–24 Oct will fail → Retry after the fix), Insights + ad-result
syncs (last good sync 16 Oct 14:03 UTC), competitor study (Business Discovery). Running ads still deliver.
**How:** developers.facebook.com → the app → Dashboard / Required actions / Alert Inbox → screenshot the
reason to Claude (likely a privacy-policy URL, Data Use Checkup or verification after going Live).

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

### ~~Publisher setup~~ LIVE since 2026-10-15
https://lws-marketing-engine.vercel.app (Vercel, root `publisher/`) · Supabase `rlbvnuujedtugsfhncey`
(Mumbai) · Meta app `1475312887986856` (dev mode, LWS Pune Page + @lws.pune, never-expiring Page
token in Vault) · pg_cron tick every minute · 98/98 tests incl. 17 DB tests on the real database.
Queued as Ready: 001–005. **Next:** first real approval by the founder; queue 006/007 once final.
**Security follow-up:** the Supabase access token and DB password were pasted in chat. Rotate both
when convenient (Account → Access Tokens; Project Settings → Database → reset password, then update
`.env.local`).

## Deferred improvements

### ~~@lws.pune: NDA maths concepts first, real PYQs not so strict~~ DONE 2026-10-20
The founder wants @lws.pune to focus on **NDA maths concepts**, without making real PYQs too harsh a rule. Done the same
day with the @lws.pune reel framework (`reels/lwspune-framework.md` F1, lesson L39): `lwspune-insta.md` Content rules +
Caption template reworded (a real PYQ named in the caption when one fits); `visual-reel-workflow.md` and the visual-reel
skill point to the framework; the one-question rule is unchanged. First reel made this way: **015, f and f′ together**.

- **Publisher tests need the story card JPEGs (found 2026-10-23).** `tests/content/manifests.test.ts` checks each
  `stories/pyqvault/*/*.post.json` has its card on disk, but cards are git-ignored and were cleaned up after queuing, so
  20 tests fail on this laptop (and on any fresh clone). Fix: skip the file check once a story's date has passed, or
  when the card is missing and the manifest is already queued.

- **Sound Mind: posts to analyse later (founder, 2026-10-21).** Theme to explore: **the problems Indian women face in
  their daily lives.** Read each post (Business Discovery or Chrome, read-only), note its format, hook and numbers against
  its account's typical post, and judge it against `soundmind/framework.md` before proposing anything to Shivani.
  1. https://www.instagram.com/p/DewWisYGjq6/ (a carousel; the founder pointed at slide 8). **Studied 2026-10-22.**
     @black_thoughtss_ (a very large account; most of its posts are carousels), marked "AI content". A 10-slide comic, set
     in a Western plane: a woman is mocked for her size by her seatmate, shrinks and apologises, then a flight attendant
     gives *her* the business-class seat (slide 8, "The seat is for you"); last slide: "Up here you don't have to
     apologize for anything." Comments at ~20 h about 6× the account's typical carousel (top sixth of its year), but many
     are backlash: the most-liked calls it made up, others mock her weight. Worth taking: the inner-thought slide ("Don't
     take up any space. Like every time."), the turn where someone kind steps in, the closing line said *to* her. Leave
     out: a villain to hate plus a revenge slide (the backlash engine; against Sound Mind's kind tone, S12 in spirit), AI
     art, body size as the first subject (a comment section Shivani would have to police). Fits S9's story carousel, but a
     real everyday scene instead of an object-metaphor is a new variant: the founder's call, with its own lesson.
     Figures: `analytics/competitors/black_thoughtss_-2026-10-22.csv` (local).
     **Made 2026-10-22:** the founder chose it; framework S19 (scene stories), lesson L57, first post sm-008 "The last one
     to eat" (week 44), in its own illustrated style (`remotion/src/SceneStory.tsx`).
- ~~**@pyqvault_ physics concept sweep (F28)**~~ DONE 2026-10-21: every MHT-CET physics chapter read in full, plus the 4
  JEE Main chapters with no MHT-CET namesake; P47–P74 added, each chapter logged in `pyqvault-ideas.md` → Concept sweep.
  Two left-outs worth the founder's eye: "drop one ball, throw another sideways: they land together" (close to P11) and
  "a bottle's note rises as it fills" (a more everyday angle for P34).
- **@pyqvault_ maths stories, next steps (started 2026-10-21, `stories/README.md`).** (1) "N of you got it right" on
  the 19:30 answer card, counted from that morning's story replies in the Inbox. It needs the card drawn on the day,
  not a week ahead, so it waits until replies actually come in (a "0 of you" card would hurt). (2) An auto-reply to a
  story reply ("Got it! Answer at 7:30 pm" + a link to more questions in that chapter), built on the `question` the
  card carries and the ad auto-reply's claim/release gate. Decide both after 2 weeks of numbers in Insights →
  "Daily maths questions".
- **Publisher phase 3: YouTube Shorts.** Google Cloud project + OAuth + `videos.insert`; uploads stay
  private until Google's API audit passes, so submit the audit form early. Then the
  "Subscribe for more" YouTube render variants (`?platform=yt`).
- **Meta app scope (decided 2026-10-15, changed 2026-10-19):** the publisher's Meta app now also reads and
  sends Instagram DMs for the owner-only Inbox (`instagram_manage_messages`, migration 0012), founder-approved
  with safeguards (CLAUDE.md decisions log). **WhatsApp:** Meta's "coexistence" now lets a WhatsApp
  Business app number also run on the Cloud API with the phone app kept working (vendors say up to ~6 months of
  history syncs), so 7020003600 may not need to move. See "WhatsApp in the Inbox" below before touching it. **Ads** via API only once ₹0-ads is lifted; Ads Manager needs no app.
- **Comment-to-DM lead capture (Phase 2 idea, 2026-10-15):** "Comment NDA → get the free PDF in your
  DMs". The messaging permission and the DM plumbing now exist (Inbox, 2026-10-19: webhook, send, store).
  Still needs: comment webhooks (`comments` field), a private reply per comment, opt-out and rate limits.
- **WhatsApp in the Inbox (founder asked 2026-10-19; check first, then build).** Goal: Click-to-WhatsApp ad chats
  and WhatsApp leads in the same Inbox, with ad chats counted per ad automatically (CTWA messages carry
  `referral.source_id` = ad id). Check before any code: (1) coexistence available for an Indian number and the
  WhatsApp Business app on 7020003600 at v2.24.17+; (2) whether Meta lets us switch it on ourselves or needs a
  Solution Partner / Tech Provider via Embedded Signup, and what that costs; (3) what it disables (broadcast
  lists read-only, disappearing messages off). Then: `connected_accounts.platform` 'whatsapp', webhook object
  `whatsapp_business_account` → the same `ingest_messages`.
  **Check result (2026-10-19):** India is supported per vendors (Meta publishes no list; eligibility is checked
  per number during signup). Meta's Embedded Signup page doesn't require Tech Provider status, but onboarding
  needs Advanced Access to the WhatsApp permissions (App Review) and Business Verification raises the limits; the
  phone-app number needs a customised flow ("WhatsApp Business app user onboarding"). Route to try first: our own
  Meta app (combine with the Instagram messaging review). Fallback: a WhatsApp partner (monthly fee).
  **Correction + build (2026-10-19, founder: 70200 03600):** Meta's current docs DO require Solution Partner or Tech
  Provider status for the Business-app route; the portfolio is already verified, so what's left is App Review (Advanced
  Access to both WhatsApp permissions). Built: Inbox → "Connect a WhatsApp Business app number" (Embedded Signup,
  echoes + one-time history import), SETUP.md step 10. **PARKED by founder 2026-10-19 (too lengthy for now).** Done:
  code live, webhook fields subscribed (API), Facebook Login for Business client OAuth settings, Tech Provider onboarding
  started as **Independent Tech Provider** (business verification Approved). Stopped at App Review → "Review app
  settings": upload `review/gopost-app-icon-1024.png` as the app icon, set category "Business and pages" (privacy URL
  already set). Then: "Record video documentation" (2 videos: a message sent and received; a template created in
  WhatsApp Manager), submit, wait for approval → create the WhatsApp Embedded Signup configuration (only "General" is
  offered until then; don't create a General one: the variation can't be changed) → `META_WA_SIGNUP_CONFIG_ID` on
  Vercel → connect 70200 03600, then link WhatsApp Web on the office PC (it used WhatsApp for Windows).
  Embedded Signup v2/v3 retired 15 Oct 2026; Meta documents this route only with v3-style extras (`SIGNUP_EXTRAS`), so
  if the v4 window doesn't offer it, that constant is the place to fix. Later: show `account_update` disconnections
  (phone not opened for 14 days) as an account-health warning.
- **Publisher: upload from the dashboard** (drag a reel in) instead of `npm run queue:add`.
- **Publisher: account health**: warn on the dashboard when a token stops working.
- **Publisher: small JPEG previews for the Queue (logged 2026-10-19).** Reel covers are PNGs of ~0.9 MB (up to 1.7 MB)
  and the Queue shows them as previews; since 2026-10-19 they load only when scrolled to, but each is still full size.
  `queue:add` could also upload a ~100 KB JPEG preview (sharp is already a dependency) for the cards, about 8× lighter.
  Needs a `preview_path` column or a naming rule; Instagram keeps getting the full cover.
- **Free AI voiceover on test (2026-10-20, founder-approved, L43).** Kokoro (`kokoro-js`, Apache 2.0, offline) in
  `remotion/`: `npm run voice:<reel>` speaks the reel's `VOICE` lines (on-screen words only, framework F23),
  `npm run mix:<reel>` makes a silent and a voiced mix, and the founder picks one. First reel: @pyqvault_ Chemistry #7.
  If its American/British accent is the problem, try AI4Bharat's Indic Parler-TTS next. Decide after 3 voiced reels.
  The own-voice ElevenLabs plan below stays parked until then.
- **Hinglish AI voiceover in the founder's own voice (planned and parked 2026-10-15).** Route:
  ElevenLabs Instant Voice Clone (founder confirmed the voice in `WhatsApp Video 2026-10-01 at 8.15.40 AM.mp4`
  is theirs; that clip peaks at 0 dB and likely has music, so a clean 1–2 min phone recording is the
  better sample). **Founder:** sign up, clone the voice (ticking the consent box themselves), put the API
  key + voice ID in a gitignored `.env`. **Build:** `reels/<name>.voice.json` (timed Hinglish lines per
  caption) → `reels/tools/voice.mjs` (calls the TTS API, caches unchanged lines, warns when a line
  overruns its slot) → engine plays the clips with music ducked, packed as a script file so it works over
  `file://` → test-first against a fake ElevenLabs server, `unchanged.mjs` SAME for all reels, voice-aware
  loudness in `check-video`. **Rules:** "faceless + silent-first" becomes "faceless; AI voice optional;
  captions carry everything" (CLAUDE.md, `lwspune-insta.md`, memory). Trial on reel 007 as a "voice vs
  silent" format-test row. Only the script text leaves the machine; the key never enters a page or video.

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

### Make the repo safe to go public (logged 2026-10-21; first part DONE 2026-10-21, history rewrite deferred)
Founder, 2026-10-21: "assume it won't be private in future". New work is covered (`analytics/` git-ignored, CLAUDE.md
rule). Already committed: 35 files under `analytics/` (other creators' cover images and numbers in `competitors/`,
Sound Mind's numbers incl. Shivani's contact numbers from her captions, element analyses), and Shivani's staff login
email in CLAUDE.md. A history scan (187 commits) found **no secrets**: no API keys, tokens, DB passwords or `.env`.
**360:** scope = 35 analytics files + one email line · blast radius = nothing reads analytics/ from git (scripts write
it locally); removing it from history rewrites every commit hash, so every worktree and session must re-sync, and
open branches need rebasing · does it apply? only before the repo actually goes public; while private nothing leaks ·
risk = `git rm --cached` + email edit: none (files stay on disk); history rewrite (git filter-repo + force-push):
high, not reversible once pushed, breaks other sessions mid-work · cost = 5 min for the first; ~30 min + a quiet
moment with no other sessions for the history rewrite · **recommendation: partial now** (stop tracking analytics/,
replace the email with "Shivani's staff login"); **defer the history rewrite** to the day before going public.
**Done (founder OK, 2026-10-21):** analytics/ untracked (35 files, kept on disk) and the email replaced. Note: a checkout
that still tracks them (e.g. the main folder on an old branch) deletes them from disk when it switches to main, so copy
analytics/ aside first and put it back after. **Still to do before going public:** erase analytics/ and the old email
from history (git filter-repo + force-push, with no other session running; back up analytics/ first).

### Sound Mind week-43 posts have one-line captions (logged 2026-10-21, declined)
Framework v1.1 (S16) gives captions a "you" first line and 2–4 lines of the idea. The 11 week-43 posts (7 carousels,
4 reels; 2 published, the rest approved or ready in GoPost) have one-line captions.
**360:** scope = 11 captions · blast radius = their GoPost posts (2 already live; editing a live caption is possible but
changes a post mid-measurement) · does it really apply: yes, but S16 is a 🧪 lead, not proven · risk: low, reversible ·
cost: ~30 min · **recommendation: decline.** Week 43 is L56's comparison group: rewriting it would leave nothing to
measure the new captions against.

### @lws.pune's daily quiz stories show only a chapter name and a link (logged 2026-10-21, not proposed)
@pyqvault_'s new maths stories put the question on the card and ask for a reply. @lws.pune's daily quiz stories (since
16 Oct) show only a chapter name and "Tap the link in our bio". The one with numbers (20 Oct) reached 163 people:
0 replies, 17 profile visits, and 115 of ~206 views tapped away.
**360:** scope = the weekly quiz-story planner (`storyPlanner.ts`, Saturday job) and its card · blast radius = @lws.pune's
morning story, the bio-link quiz traffic to PYQ Vault (`utm_medium=story`) · does it apply? only if question cards beat
link cards: one data point isn't enough, and the two audiences differ (NDA vs Class 11–12) · risk = low, reversible
(the planner is one switch) · cost ≈ half a day: NDA questions are also LaTeX, so the card would come from
`stories/render.mjs`, not the server · **recommendation: defer** until @pyqvault_ has 2 weeks of "Daily maths
questions" numbers to compare against.

### Bright objects (F24) on reels already made (logged 2026-10-21, not proposed)
New founder rule (framework F24, both handles): key objects take colours from the `VIVID` set. Made before it: every
@pyqvault_ and @lws.pune reel, including the queued ones (Physics #5–#7, Chemistry #5–#7). Physics #8 is the exception:
the founder asked for its remake to compare (`pv-physics-008-compare.mp4`).
**360:** scope = 6 queued @pyqvault_ reels + every posted reel on both handles · blast radius = their GoPost posts (MP4 +
cover re-rendered and re-uploaded) · does it apply? only as polish: each was judged as made, and F24 is itself on test
(L46, L47) · risk = posted reels can't be replaced without losing their numbers; a queued one is a re-render + re-upload ·
cost ≈ 20–30 min per reel · **recommendation: decline for posted reels; defer for queued ones** until the Physics #8
comparison and L46 show colour helps.

### Predict-first captions that print the answer (logged 2026-10-20) DECLINED: founder, 2026-10-21, "queued is fine"
New founder rule (L45, framework F6 v1.11): a predict-first caption never names the answer; it says "Answer at the end
of the reel 👀". Made before the rule, all 9 @pyqvault_ predict-first manifests print it ("→ B"): posted Physics #4 and
Chemistry #4; queued for approval Physics #5, Chemistry #5, Chemistry #7; made Physics #6, #7 and Chemistry #6; rejected
Maths #3. `tests/caption-answer.test.js` lists them (BEFORE_L45) and fails once one is fixed but still listed. @lws.pune's
four (010, 011, 012, 014) follow their own framework: not part of this rule.
**360:** scope = 6 unposted reels' captions (Physics #5–#7, Chemistry #5–#7) + 2 posted · blast radius = their GoPost
posts (caption text only: no re-render, no new cover) · does it apply? yes for unposted ones, the rule is about what a
viewer reads before guessing; the 2 posted reels are L45's baseline (0 comments with the answer shown), so changing them
would muddy the test · risk = low, text only, reversible in GoPost before approval · cost ≈ 5 min per reel ·
**recommendation: do it for the 6 unposted reels** (edit each caption in GoPost before approving; then drop them from
BEFORE_L45); **leave the 2 posted ones.** This also gives L45 six more test reels within days.

### Opening orbit (the hook) on reels already made (logged 2026-10-20) DECLINED: founder, same day, "leave those now"
Founder, 2026-10-20: "orbit is hook and should be there in first 3 sec", for @pyqvault_ and @lws.pune (framework F22
v1.8 / v1.2). Made before the rule: @pyqvault_ Physics #5, #6, #7 and Chemistry #7 have no orbit, Chemistry #6 orbits at
the close; Chemistry #5 and @lws.pune 014 already open with one. The founder chose to leave them; they post as made.

### Real glow / pen strokes on reels already made (logged 2026-10-20, not proposed)
The reel toolkit (CLAUDE.md decisions log) adds real glow (bloom) to 3D reels and pen-pressure strokes to Sound Mind's
drawings. Reels already made colour hot things bright (Physics #5 molecules, Chemistry #4/#6 flames) without glow, and
Sound Mind 001–003 use even-width lines.
**360:** scope = 6 @pyqvault_ 3D reels (posted or queued) + 4 Sound Mind reels · blast radius = their GoPost posts (MP4 +
cover) · does it apply? only as polish: each was judged and approved as it is, and glow is itself on test (L42) ·
risk = re-render + re-upload, posted reels can't be replaced without losing their numbers · cost ≈ 15 min per reel ·
**recommendation: decline for posted reels; defer for queued ones** until L42 shows glow helps on new reels.

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

### Carousels upload PNG, which Instagram's API rejects (logged 2026-10-17, awaiting user confirmation)
Found while building the daily quiz Story. A probe that only creates an unpublished Story container
(never publishes) got `Meta API 400 (code 9004): Only photo or video can be accepted as media type` for
a PNG and `FINISHED` for a JPEG. The publisher's carousel flow sends `image_url` PNG slides
(`reels/*.post.json` slides, `lwspune-insta.md` "Image post … PNG"), so approving a carousel would most
likely fail the same way. Not checked yet whether any carousel has gone through the publisher.
**Proposed:** convert slides to JPEG at `queue:add` time (or render JPEG in `reels/tools`), and change
the house setting to JPEG. Needs a 360 analysis before touching shipped carousels.

### "One question per reel" vs the visual-candidates plan (logged 2026-10-14, awaiting user confirmation)
New founder rule: one PYQ per reel, never two (`reels/lwspune-insta.md` → Content rules). No shipped
reel breaks it (001–005 each solve one question). Two planning lines in `reels/visual-candidates.md`
→ "Make next" do: #2 "Odd function = 0 … one reel, three PYQs on screen" and #4 "Two-dice grid … one
grid, three questions". **Proposed:** reword both to one PYQ on screen, keeping "NDA asked this 3
times" as the hook line. Docs only, no media to re-render; trivially reversible.
**Update (same day):** #2 is resolved: reel 007 was made from one PYQ (24-I Q74). Only #4 (two-dice
grid) still needs rewording.

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
