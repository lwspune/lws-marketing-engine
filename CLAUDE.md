# CLAUDE.md — LWS Marketing Engine

Project context for Claude Code. Read this first, every session.
Strategy source of truth: **[MARKETING_PLAN.md](MARKETING_PLAN.md)** (beginner-facing). This file is the *builder's* doc.

## What we're building

A **personal marketing operating system** for a solo founder with several education products
(PYQ Vault, Crack SSB, NDA Maths Tracker, LWS coaching). Its one job: turn each product into a
steady flow of leads with a routine of about two hours a week. Not a generic AI marketing tool,
not a scheduler, not an SEO tool, not (yet) a product for other coaches.

The user is a **marketing beginner** who has delegated the driving to Claude. Decide and build,
explain in plain language, don't hand back menus of options. (See memory.)

## Architecture

| Part | Job | Status |
|---|---|---|
| **Product profiles** | one profile per product: buyer, real problems in their words, assets, offer, voice, channels | Phase 1 |
| **Ideas → Drafts** | per product: idea cards, then Reel scripts / captions / Telegram / WhatsApp / YouTube titles | Phase 1 |
| **Review queue** | Approve / Tweak / Kill; approved pieces export as a batch | Phase 1 |
| **Capture** | free gift per product, Telegram/WhatsApp list | Phase 2 |
| **Nurture + convert** | sequence writer, Telegram bot, UPI checkout | Phase 3 |

Human gate sits between drafting and publishing. Enforcement point for the no-slop rule.

## Stack and conventions

- **Local, no server.** `marketing-engine.html` + `core.js`, opened over `file://`. Vanilla JS,
  no framework, no bundler, no npm packages. `core.js` holds all pure logic (profile validation,
  prompt building, response parsing, queue transitions, export formatting, storage) and is loaded
  by both the page and the tests.
- **Tests:** `tests/core.test.js`, run with `node --test`. Test-first for anything in core.
- **API key:** password input, persisted in `localStorage` in try/catch. Never hardcoded.
- **Anthropic API:** direct browser call to `POST /v1/messages` with the
  `anthropic-dangerous-direct-browser-access: true` header (personal local tool, user's own key).
  Model `claude-opus-5`. JSON responses via `output_config.format` (`json_schema`). Refusal
  fallbacks on by default (`fallbacks: "default"` + beta `server-side-fallback-2026-07-01`).
  Always check `stop_reason` before reading content.
- **Look:** dark utilitarian control panel, monospace, single green accent `#4fd1a5`, matching
  the comment extractor / idea generator family.
- **Storage:** profiles, queue, and settings in `localStorage`, all wrapped in try/catch, with
  JSON export/import so nothing is trapped in one browser.

## Non-negotiable constraints

- **Write as if the repo were public** (founder, 2026-10-21: "assume it won't be private in future"). Never
  commit secrets, `analytics/` exports (git-ignored), other accounts' material, an outside brand's numbers, or
  anyone's personal details (students, leads, staff logins): tests use made-up names, numbers and emails.
- **No slop.** Every idea and draft must name a real problem from the profile AND a real asset
  (or a flagged gap). Generic study-tip/motivation output is a failure.
- **Faceless + silent-first.** Default Reel format is pen-and-paper solving filmed top-down, steps
  as on-screen text, music, no face, no voice. Never design flows that assume face/voice.
- **One approval gate.** AI drafts; human approves. Never auto-publish.
- **No hardcoded key, no server dependency.**
- **No fabricated student quotes.**

## Decisions log (the *why*)

- **Multi-product from day one** (2026-09-24). The user has several products; a tool bound to
  one of them would be rebuilt for the next. Profiles make the machine reusable.
- **PYQ Vault is the first campaign** because its audience research (ten ranked problems from
  YouTube comments) already exists and it has a clear offer.
- **Profiles + drafting loop before capture.** Capture and nurture are useless without a
  steady content supply; the loop is what the founder will actually run weekly.
- **₹0 ads until the funnel converts organically.** Green light about 2 in 100 free leads buy.
- **SEO is out of scope.** PYQ Vault's indexing problem lives in that app's codebase.
- **Personal tool, not a product.** Prove it brings buyers before packaging it.
- **Hosted publisher (2026-10-12, founder-approved).** One-click "approve → publish" to Instagram,
  Facebook and YouTube needs public media URLs, OAuth and a scheduler, which a `file://` page can't
  provide. So `publisher/` is a separate **Next.js + Supabase app on its own Vercel project** (Hobby
  plan, as a trial of whether it works at all). This lifts "local, no server" and "no npm packages"
  **for `publisher/` only**; the local marketing engine keeps both rules. Same stack as PYQ Vault.
- **Organisation → project → posts (2026-10-12).** Every row carries `org_id` and `project_id` (one
  project per product, e.g. PYQ Vault, Crack SSB) so other teams *could* use it later. Nothing is
  built for other organisations yet (no invites, billing or onboarding): LWS Pune is org #1.
- **Scheduling runs on Supabase pg_cron**, not Vercel Cron (Hobby only allows daily jobs).
- **First paid ads, and ads in the publisher (2026-10-16, founder-approved).** The "₹0 ads" rule
  was for the online products' funnel. A local paid offer (SPI Mock Test, ₹499, Sagar Arcade FC
  Road) is the exception: rupees spent vs. tests booked is directly measurable, and the test is
  really lead generation for the NDA course. Format: Click-to-WhatsApp, parents 35–55 within 20 km,
  ₹150/day test weeks. The publisher reads results and creates ads, but **two gates**: Approve
  creates everything PAUSED on Meta, a separate Launch (with confirmation) starts spending. Budget
  guardrails (≤ ₹1,000/day, 1–30 days, end date required) are database constraints.

- **Remotion trial (2026-10-18, founder-approved).** Does Remotion (React video, rendered frame by frame)
  make reels clearly better without slowing the weekly routine? Trial = reel 005 remade in `remotion/`
  (not posted: the question is already up) and judged side by side. npm is allowed **in `remotion/`
  only**; `reels/engine.js` keeps "no npm packages". Free licence: LWS has ≤ 3 employees. Renders with
  the laptop's Edge (no browser download). If it loses, delete `remotion/`; nothing else depends on it.
  **Result (same day): founder judged Remotion "far better".** Measured: the engine's real-time MP4 of
  005 averages 29.2 fps with gaps of up to 0.4 s in the first second (the hook) and runs ~0.5 s behind
  its script; Remotion gives exactly 30 fps, on time. Cost: 2 min 15 s to render 31.5 s (engine ≈ 32 s).
  Next: the next new visual reel is made in Remotion and posted; its numbers go in reels/learnings.md.
- **First outside brand in the publisher (2026-10-18, founder-approved).** @soundmindwithshivani (Shivani
  Dhumal's "Sound Mind" brand, not an LWS product) posts through the publisher as project `soundmind-shivani`
  inside the LWS Pune org: no separate org, no login for Shivani yet. Access is Shivani's Page "Sound Mind
  Shivani" (owned by her "Sound Mind" business portfolio) shared with the LWS Facebook login, which she can
  revoke at any time. The marketing engine's profiles and house reel styles don't cover this brand.

- **Sound Mind carousels (2026-10-19, founder-approved).** Sound Mind posts shareable carousels (quote cards +
  metaphor stories), modelled on @komal_reads / @myeasytherapy after a Business Discovery read of four accounts showed
  their images and carousels beat reels, and Sound Mind's reels were rarely shared. Made in `soundmind/` (vanilla JS +
  headless Edge, like the reels), queued with `queue:add`; Shivani judges finished posts, not drafts. Runbook:
  `soundmind/brand.md`.

- **Instagram DMs in GoPost (2026-10-19, founder-approved).** Pull DMs into an owner-only **Inbox** to read,
  reply, mark leads, count them, and mine what students ask. This reverses the 2026-10-15 "no messaging
  permissions" choice, with safeguards: only `owner` logins read messages (RLS, not editors or staff), nobody
  signed in writes them (webhook → service role), text deleted after 12 months, no attachment URLs or raw
  payloads, personal details redacted before the themes report goes to Claude. WhatsApp uses the same tables
  (`channel`): first the API number 7620699213 that WABridge already uses (no coexistence needed), with GoPost
  listening alongside WABridge rather than taking the number over.

- **Reel toolkit (2026-10-20, founder-approved).** Five vetted packages in `remotion/` for more sophisticated reels:
  `@remotion/paths`, `@remotion/noise`, `@remotion/rough-notation`, `@react-three/postprocessing`, `perfect-freehand`
  (+ Remotion's official `remotion-markup` skill, local only: its repo has no licence file). Chosen from a GitHub search
  for maintained, licensed, well-known repos; drei and tegaki were checked and dropped. Installed pinned with scripts off;
  `tests/deps.test.ts` keeps every future package that way. First reels: @pyqvault_ Physics #7, Sound Mind sm-r004.

- **Voiceover trial (2026-10-20, founder-approved).** A free AI voice (Kokoro via `kokoro-js`, Apache 2.0, offline,
  pinned in `remotion/` with its install scripts read) reads only words already on screen, so reels stay faceless and
  still work muted. Every voiced reel is also rendered silent; the founder picks. Framework F23, lesson L43; decide after
  3 voiced reels. The own-voice ElevenLabs plan (2026-10-15) stays parked.

- **Realism demos (2026-10-20, founder-approved after seeing them).** Rapier physics (`@dimforge/rapier3d-compat`) and
  three.quarks particles are kept in `remotion/` for topics that need them (demos: `DemoPhysics.tsx`, `DemoParticles.tsx`;
  how to use them in Remotion: `reels/visual-reel-workflow.md` → Reel toolkit). The path tracer was tried and dropped
  (too slow and unreliable on this laptop).

- **@pyqvault_ daily maths question stories (2026-10-21, founder-approved).** For engagement and reach: an easy MHT-CET
  maths MCQ at 07:30 IST ("Reply A, B, C or D") and its answer at 19:30. The cards never name an exam (founder: "just
  q and options"). Replies, not a quiz sticker: the API can't add stickers, and replies land in the Inbox. Made a week
  at a time in `stories/` (KaTeX in headless Edge, because the server's card maker can't set maths, and every answer
  is re-derived first), queued with `queue:add`, approved with "Approve all stories". This is @pyqvault_'s one maths
  format: its reels stay physics + chemistry. Runbook: `stories/README.md`.

- **Sound Mind pause reels (2026-10-23, founder-approved).** After studying an AI-made anime "peace" reel, the founder
  chose to make such reels our own way rather than with AI video (no "AI info" label on Shivani's brand): one calm
  everyday scene, flat 2D in Remotion with the scene stories' people, 3–4 shots, 12–15 s, made to loop, rain made in code
  (`sfx.ts` bed `rain`). Framework S20, lesson L66; first: sm-r011 "chai in the rain". Runbook: `soundmind/brand.md`.

- **Painted 2D look for Sound Mind (2026-10-24, founder-approved).** Pause reel #2 "tapri at dusk" (no black outlines,
  shaded shapes, dusk light, wet reflections, depth and soft focus) "looks much better" than the flat outlined style:
  every new Sound Mind reel is made this way (framework S21; recipe in `soundmind/brand.md`; palette check
  `remotion/src/lib/paint.ts`). Older flat reels are a backfill candidate in `SUGGESTIONS.md`, not reworked.

- **YouTube Shorts in the publisher (2026-10-23, founder-approved).** Same approve → publish flow as Instagram, to the
  LWS Pune and Sound Mind channels first (Sound Mind with Shivani's OK), PYQ Vault once its channel exists. Google
  Cloud project `gopost-512510` ("GoPost", In production, not Google-verified: fine for our own channels). API uploads
  stay Private until Google's API audit passes, which needs the YouTube section in lwspune.in's privacy policy.

- **@lws.pune daily NDA maths question stories (2026-10-23, founder-approved).** The daily quiz-link stories brought
  zero leads ("quizzes are not at all effective"), so from 24 Oct @lws.pune posts @pyqvault_'s story format with easy NDA
  maths MCQs (07:30 question, 19:30 answer, "Reply A, B, C or D": a reply opens an Inbox chat). `stories/` now holds one
  series per account (`stories/<series>/`, `SERIES` in `questions.js`); the Saturday quiz planner is off (0022). Judge
  after a week against the quiz stories' 23 h numbers (Insights).

## File structure

```
MARKETING_PLAN.md        # beginner-facing strategy
CLAUDE.md                # this file
SUGGESTIONS.md           # deferred improvements + blockers, living checklist
marketing-engine.html    # the app UI
core.js                  # pure logic shared by the page and the tests
tests/core.test.js       # node --test
tests/reel-theme.test.js # Reel.WHITE colours pass WCAG contrast on the board
reels/                   # ready-to-post reels/posts: MP4/PNG + caption kit per piece
  engine.js              #   shared canvas renderer: paper, maths layout, red pen, captions,
                         #   speech bubbles, end card, synthesised music, MP4 recording
  *.render.html          #   one per piece: content config + Reel.mount(); open in Edge to re-make
  lwspune-insta.md       #   @lws.pune HOUSE SETTINGS (approved): look, sound, captions, upload steps
  format-test.md         #   format test (days 1–5): schedule, captions, scorecard
  learnings.md           #   @lws.pune LEARNINGS LOG: every lesson as a testable idea (evidence → test reel → result →
                         #   status). Update after each reel's 48 h / 7 d numbers; only Confirmed rules move
                         #   into lwspune-insta.md or visual-reel-workflow.md
  pyqvault-insta.md      #   @pyqvault_ HOUSE SETTINGS: audience, series, captions, hashtags, posting slots
  pyqvault-framework.md  #   @pyqvault_ REEL FRAMEWORK (founder 2026-10-20): numbered points F1…, each with its reason,
                         #   check and status; change only through its change log, with a reason
  pyqvault-learnings.md  #   @pyqvault_ LEARNINGS LOG, kept apart (founder 2026-10-20); one L-numbering shared with
                         #   learnings.md
  lwspune-framework.md   #   @lws.pune REEL FRAMEWORK (founder 2026-10-20): same F-numbers as @pyqvault_'s for the same
                         #   idea, adapted (NDA maths concepts first, white, "Follow for more"); own change log
  visual-reel-workflow.md #  runbook for white-board animated-graph reels (skill: .claude/skills/visual-reel)
  visual-candidates.md   #   PYQs whose answer is a picture, by paper (pick visual reels from here)
  tools/                 #   headless-Edge scripts: frames, record, cover, check-video, unchanged (+ baseline.txt)
  pyqvault-ideas.md      #   @pyqvault_ IDEA LIST (founder 2026-10-21): every future reel comes from here. The test (F29 no
                         #   words, F28 gate…), the score (weights × points /100, tuned at every analysis), Ideas table, one
                         #   card per open idea (frame 0, beats without words, second hook), Hook queue, Concept sweep, Archive
  remake-backlog.md      #   @lws.pune ideas (score /10) + the remake rules; @pyqvault_ moved to pyqvault-ideas.md
  tools/topic-scores.js  #   next topic by score, per handle (framework F21); `node reels/tools/topic-scores.js
                         #   [pyqvault|lwspune]`; `pyqvault --calibrate` = the weight tuning (48 h results from
                         #   pyqvault-learnings.md → results, Idea column; needs 6 reels; prints, changes nothing); lwspune also
                         #   prints the week's Probability + Statistics picks (F32–F33, ideas "Probability · …")
  virality-log.md        #   @pyqvault_ VIRALITY PREDICTOR (framework F30, founder 2026-10-22): inputs per reel, a score /100,
                         #   band, weakest input; predictions frozen before posting, judged at 48 h; advisory until proven
  tools/virality.js      #   the predictor (+ virality-measure.mjs: motion, colour, length, cover from the MP4 in headless
                         #   Edge); `node reels/tools/virality.js [--update | --calibrate]`; --update at every analysis
  tools/results-sync.js  #   copies GoPost's 48 h readings (publisher `npm run results`) into pyqvault-learnings.md's
                         #   results table; the 4-step analysis routine is at the top of that table
  tools/hook-rotation.js #   @pyqvault_ hook, opening, second hook, loop per queued reel (framework F25–F27;
                         #   pyqvault-ideas.md → Hook queue): no repeat in a row, orbit ≤ 2 of any 4, loop alternates;
                         #   `node reels/tools/hook-rotation.js`
  analysis-framework.md  #   REEL ELEMENT ANALYSIS: which elements go with hits (top vs typical reels per account), method +
                         #   decision rule + runs; tools/element-analysis.js (+ elements.js, cover-metrics.mjs, element-report.js),
                         #   covers via publisher `npm run covers:fetch` (read-only, deleted after measuring); data in analytics/elements/.
                         #   Two sets: `science` (reels, views) and `soundmind` (every post, likes). Other accounts' posts:
                         #   publisher `npm run competitors:export -- --org=lws-pune --handles=…` → analytics/competitors/
  assets/                #   V mascot poses (copied from Question_Bank/public/chat)
  *.post.json            #   one per piece: manifest for publisher's `queue:add` (files + captions)
soundmind/               # @soundmindwithshivani carousels (outside brand). Runbook + research: brand.md
  framework.md           #   POST FRAMEWORK (founder 2026-10-21): S1… points (carousels + ME reels), each with reason, check,
                         #   status, in three parts (both formats / carousels / reels, each with its own winning measure); change
                         #   only through its change log. Sound Mind's numbers: analytics/soundmind-baseline.md (local only)
  learnings.md           #   Sound Mind LEARNINGS LOG (L52 on; one L-numbering with the LWS logs)
  cards.js               #   pure rules: batch validation, health-claim check, font sizes, GoPost manifest
  art.js                 #   line-drawing catalogue for story slides
  card.html, render.mjs  #   one template; render.mjs → 1080×1350 JPEGs + <slug>.post.json per post
  <year>-w<week>/        #   batch.json (committed) + rendered slides (gitignored)
  reels/                 #   "ME" story reels (and pause reels, S20) made in remotion/ (MeStory.tsx shared, SoundMind0NN.tsx each):
                         #   .post.json + cover; MP4 gitignored
tests/soundmind-cards.test.js # node --test
stories/                 # daily maths question stories, one series per account. Runbook: stories/README.md
  questions.js           #   pure rules: SERIES (folder → project + exam), batch check (no exam names, A–D spread,
                         #   re-derived), times, card words, manifests
  card.html, render.mjs  #   KaTeX card (vendor/katex = pyqvault.com's version) → 1080×1920 JPEGs + .post.json per card
  pick.mjs               #   shortlist easy MCQs from the question bank (anon key, read-only); --series picks the exam
  pyqvault/<year>-w<wk>/ #   @pyqvault_ (MHT-CET): batch.json + manifests (committed) + cards (gitignored)
  lwspune/<year>-w<wk>/  #   @lws.pune (NDA, from 2026-10-24, replacing the quiz-link stories)
tests/stories-questions.test.js # node --test
study/reels/             # other accounts' reels saved for private study (git-ignored; never repost). How: memory
                         #   reference-study-reel-downloads (snapinsta.to in Chrome)
remotion/                # TRIAL: reels in Remotion (React + SVG, frame-by-frame render, Edge). `npm test`,
                         #   `npm run typecheck`, `npm run audio` (soundtrack from the engine MP4), `npm run render`,
                         #   `npm run compare:files && npm run compare` (old vs new side by side) → out/
                         #   ONE RENDER AT A TIME; temp files in %TEMP%/remotion-lws-render, cleared at each render start
                         #   (tools/tempDir.ts; `npm run clean:temp`); 4 browser tabs per render (remotion.config.ts)
  src/lib/               #   pure timelines (same prog/ease/caption timing as engine.js; palette test-locked to Reel.WHITE)
  src/lib/voice.ts       #   voiceover (F23): place, level, check lines; `npm run voice:<reel>` (tools/voice.ts, Kokoro,
                         #   offline) → public/voice/; `mix.ts <reel> --voice` → <reel>-voice-mix.wav
  src/lib/sfx.ts         #   sound effects made in code from a reel's SOUND score + ducking + −3 dB limiter (framework F14–F16);
                         #   `npm run mix:<reel>` (tools/mix.ts) mixes them into the music → public/<reel>-mix.wav
  src/shapes.tsx         #   RoundBox (rounded 3D boxes, framework F8); camera zooms are `tween` keys (motion.ts, F9)
  src/Reel014.tsx        #   first 3D reel (@remotion/three + three.js, GPU via ANGLE); `npm run music:014`,
                         #   `render:014`, `cover:014` write to ../reels/. Runbook: reels/visual-reel-workflow.md
  music/*.json           #   music spec per reel → reels/tools/music.mjs renders engine.js music offline to WAV
  tests/deps.test.ts     #   package guard: exact versions, npm registry only, no unread install scripts. Reel toolkit
                         #   (glow, self-drawing paths, noise, hand-drawn notes, pen strokes): reels/visual-reel-workflow.md
publisher/               # HOSTED approve → publish app (Next.js 14 + Supabase, own Vercel project)
  SETUP.md               #   one-time setup runbook (Supabase, Meta app, Vercel, scheduler)
  supabase/migrations/   #   schema + RLS + transition triggers (0001), write functions (0002), pg_cron (0003)
  src/lib/domain/        #   pure rules: captions, manifest, approval + publication state machine
  src/lib/platforms/     #   Meta Graph client (Instagram reels/carousels, Facebook Page reels)
  src/lib/publishing/    #   worker tick, cron handler, Supabase repo, result shape
  scripts/               #   migrate, seed (org/projects/owner), connect-meta, queue-add
  tests/                 #   vitest: domain, fake-Meta integration, worker, cron, content, DB (rollback)
```

**Publisher:** `cd publisher && npm test` (DB suite skips until `TEST_DATABASE_URL` is set), `npm run
typecheck`, `npm run lint`, `npm run build`. Writes only through the 0002 database functions; the
worker uses the service role. Tokens live in Supabase Vault, never in code or the browser. Every
response uses `{ ok, data | error: { code, message } }`. **YouTube Shorts (0023/0024, 2026-10-23):** reels go to
YouTube through the Data API (`src/lib/platforms/youtube.ts`): resumable upload whose session is saved first
(`private.upload_sessions`, service role only), so a cut-off run resumes or records the finished video, never uploads
twice; then poll until processed → `youtube.com/shorts/<id>`; 48 h / 7 d views, likes, comments. Channel connected with
`npm run connect:youtube -- --org=lws-pune --projects=<slug>` (Google sign-in, refresh token in Vault; needs
`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` in `.env.local` and Vercel). A reel's optional `youtubeVideo` (`-yt.mp4`, end
card "Subscribe for more": Remotion `EndCard platform`, `--props=props/youtube.json`) is what YouTube gets. **Until
Google's API audit passes, every upload is Private (locked)** (SETUP.md step 11). **Cut-off runs (0021, 2026-10-23):** a run that outlasts the cron's
55 s records nothing, so the next one starts again; a 9-slide carousel did that ~50 times and Instagram blocked the
account's uploads for a day (code 9). Now carousel slides upload 5 at once and are saved as they go (`child_refs`,
resumed next run), a tick starts nothing new after 30 s (`TICK_BUDGET_MS`), and a pending post picked up more than 5
times fails with "Press Retry" (`claims`, `MAX_START_TRIES`). Retry clears both. **Scorecard (0004):** the same per-minute tick
takes write-once snapshots of each published post at 48 h and 7 d (`publication_metrics`), shown
on Done cards against `LWS_BASELINE` (src/lib/domain/metrics.ts, the median @lws.pune reel).
`npm run insights -- --org=lws-pune` exports every reel's numbers to `../analytics/` (local only, git-ignored); `npm run results -- --org=lws-pune --project=pyqvault-insta` exports each reel's 48 h / 7 d readings by post slug for `reels/tools/results-sync.js` (`src/lib/domain/reelResults.ts`). **Insights tab
(0005):** `/insights` lists every reel on the account (hand-posted too, `account_media`) against the
typical reel computed live (`typicalReel`, median); refreshed nightly at 03:00 IST by pg_cron →
`/api/cron/insights`, by the tab's Refresh button, or by `npm run insights` (same sync code).
**Daily quiz Stories (0006/0007; Saturday job off since 0022, 2026-10-23: zero leads, replaced by NDA question
stories from `stories/lwspune/`):** post kind `story` = one 1080×1920 **JPEG** card in `cover_path`
(the Instagram API rejects PNG: code 9004), no caption, Instagram only, plus the
`quiz` it shows (from PYQ Vault `/api/quiz/today?date=`, with per-place tagged `links`) so the
story-reply DM and Telegram post link the same quiz. Saturdays 18:00 IST pg_cron → `/api/cron/stories`
(or `npm run stories:plan`) queues next Mon–Sun as Ready; "Approve all stories" schedules each for
07:30 IST on its day (`storyApproval`: posts now if its day started, refused once it's over). Card:
`storyCard.ts` (satori + sharp, bundled Noto Sans in `assets/fonts`). `STORY_CTA=reply` switches the
card from "link in bio" to "Reply QUIZ" once the reply DM exists. **Story scorecard (0015):** Instagram deletes
a story's insights ~24 h after it goes up, so a story gets one `23h` snapshot (reach, views, replies, follows,
profile visits, taps out; `record_story_metrics`, same write-once table and per-minute tick), shown on its card
and in Insights → "Daily quiz stories" (typical story once 5 have numbers). No link-tap count: API stories can't
carry a link sticker, so profile visits are the bio-link proxy; quiz visits are PYQ Vault's `utm_medium=story`.
**Question stories (0019, founder 2026-10-21):** a story shows a `quiz` (the @lws.pune planner) OR a `question`
(`{id, answer, part}`: @pyqvault_'s maths cards from `stories/`), never both, frozen once approved. Manifests take
`kind: "story"` with `plannedFor` + `question` (`queue:add`). Insights keeps "Daily maths questions" apart from
"Daily quiz stories", with one maths box per project (both @pyqvault_ and @lws.pune post them).
**Ads (0008):** the ad account is a `meta_ads` connected account (System User token, `npm run
connect:ads`). Results (`ad_entities`, `ad_daily`: spend + WhatsApp chats per ad per day, in the ad
account's own time zone: Asia/Kolkata for LWS Pune `act_570714718754453`) sync with the nightly insights job and show in the Insights
tab's Ads box; weekly tests booked / NDA leads are typed in there (`ad_outcomes`). Ads are made from
an `.ad.json` next to the poster (`npm run ads:add`, fields in `src/lib/domain/ads.ts`) → Ads tab:
Approve creates campaign/ad set/creative/ad PAUSED (each Meta id write-once, so Retry resumes) →
Launch. The Meta app must be **Live** (published) or Meta refuses the creative (subcode 1885183). Meta's AI creative changes and Multi-advertiser ads are opted out per feature. Untested
against the live API until the first real Approve: if Meta rejects a field, the card shows its
reason; fix `src/lib/domain/ads.ts` and Retry.
**Projects (0009, founder 2026-10-18): LWS Pune first, PYQ Vault second.** Names follow the Instagram account:
slug `pyq-vault` is shown as **LWS Pune** (@lws.pune: NDA reels, daily stories), `pyqvault-insta` as **PYQ Vault**
(@pyqvault_), `lws-coaching` as **LWS Pune ads** (ads only; the Queue hides projects with no posts), `soundmind-shivani` as **Sound Mind with Shivani**
(@soundmindwithshivani, an outside brand, 18:00 IST).
**Staff logins (0011, founder 2026-10-18):** role `staff` sees only the projects in `project_members` (their posts,
channels, accounts, reels, media), never ads; owners/editors see the whole org. Enforced by RLS + `lock_member_post`
(tests/db/staff.test.ts). Add one with `npm run staff:add -- --org=lws-pune --email=… --projects=<slug>` (asks for
the password). First staff: Shivani's Sound Mind login → `soundmind-shivani`. Slugs never
change: manifests and the story planner name projects by slug.
**Inbox (0012, founder 2026-10-19):** Instagram DMs reach `/api/webhooks/meta` (signed with `META_APP_SECRET`,
checked by `verifyMetaSignature`; GET answers Meta's check with `META_WEBHOOK_VERIFY_TOKEN`; not behind sign-in) →
`ingest_messages` (service role; dedupes on Meta's message id, deletes unsent ones) → `conversations` + `messages`,
readable by **owners only** (`private.is_org_owner`). `/inbox` lists chats (Needs reply / Leads / All), `/inbox/[id]`
replies via `me/messages` (24-hour window, `canReply`) and sets the lead status (`set_conversation_status`). Insights
shows "Messages this week" to owners. Nightly pg_cron `messages-retention` deletes text older than 12 months.
`npm run messages:backfill -- --accounts=@lws.pune,…` (old chats, ~20 messages each; only named accounts), `npm run messages:themes` (redacted → Claude →
`../analytics/dm-themes-<date>.md`). **WhatsApp (0013, founder 2026-10-19):** connected account platform `whatsapp`
(external_id = Meta phone number id, token = Digi Publisher system user token) via `npm run connect:whatsapp`, which
subscribes this app to the WhatsApp account alongside WABridge (attendance messages keep flowing; GoPost sees only what
people send in). Same webhook address (`parseWhatsAppWebhook`), sender names arrive with the message, Click-to-WhatsApp
ad ids are kept, replies via `/{phone-number-id}/messages` (JSON, 24-hour window). SETUP.md step 9. First number: +91
76206 99213 (ads still point to +91 91563 10546, outside the portfolio, so their chats don't reach GoPost yet). Needs `instagram_manage_messages` + `pages_manage_metadata` + `pages_messaging`
(Meta refuses the Page subscription without it before Advanced Access) and the Page subscribed (`connect:meta` does
it): SETUP.md step 8. Live since 2026-10-19 for @lws.pune and @pyqvault_ (Sound Mind not connected: needs Shivani's OK). Pure rules: `src/lib/domain/inbox.ts`.
**Facebook Page chats (0025, founder 2026-10-25):** Messenger messages to a Page are channel `facebook` (contact = page-scoped
id; webhook object `page`, `parseFacebookWebhook`), replies via `sendFacebookText` (`messaging_type: RESPONSE`, 24-hour
window), and a shared number or email makes a lead, as on Instagram. `connect:meta` subscribes every Page, Sound Mind's too,
so a Page's chats are stored only while `connected_accounts.inbox` is on: `npm run messages:backfill -- --org=lws-pune
--pages="LWS Pune"` switches it on (`set_account_inbox`) and pulls old chats. On for LWS Pune only. Old-chat pages that Meta
calls too much data (500, code 1) are retried at half size (`fetchConversations`).
**Auto-reply to ad chats (0014, founder 2026-10-19):** Instagram only. After the webhook stores a delivery, anyone whose
message is from an ad (Meta's ad mark, or one of Meta's ready-made ad questions, `adStarts`) gets the account's saved
reply once (`src/lib/inbox/autoReply.ts`). `claim_auto_reply` (service role) is the gate: switched on, never claimed,
nobody has replied yet; a failed send calls `release_auto_reply`. Owners set text + on/off in the Inbox box (`set_auto_reply`).
**Leads (0016, founder 2026-10-21):** one list at `/leads` (owners only): name, contact, course, date, source, with
"Download for Excel" (`/leads/export`, CSV) and Edit / "Not a lead" (marks the chat `not_lead` so it never comes back).
Instagram chats become leads when the person shares a phone number or email (`findContact`, no AI); WhatsApp chats when
judged genuine (Claude, `src/lib/leads/claude.ts`, only with `ANTHROPIC_API_KEY`; none is set yet, so the founder chose
sorting in a Claude Code chat: `npm run leads:screen -- --org=lws-pune --whatsapp-out=<file>` → verdicts →
`--whatsapp-in=<file>`). Hourly pg_cron `leads-hourly` → `/api/cron/leads` (`leads_to_check` → `screenLeads` →
`record_lead_checks`); each chat is re-checked only after a new incoming message. One lead per contact per org.
**Website leads (0017, founder 2026-10-21):** lwspune.com form entries (emailed from lws.adacoount@gmail.com, two layouts:
"New message from" and "Request a Call Back") are read in a Claude Code chat through the Gmail connector, that sender
only (no Gmail access for GoPost), and added with `npm run leads:website -- --org=lws-pune --file=<[{date,text}]>`
(`parseFormEmail` + `mergeFormLeads` → `add_website_leads`): channel `website`, the form's page in `page`. Next time,
search `from:lws.adacoount@gmail.com after:<newest website lead date>`. Skip test entries (first import: "test abc",
"ABC XYZ", "LWS Foundation 8523697412", "Rajeev Thakkar 8526974562").
**Website lead sheets (0026, founder 2026-10-25):** lwspune.com's NDA age calculator and popup form write to a Google Sheet
kept by the web agency ("Defence Age Calculator Data- LWS Pune", tabs "Age Calculator" and "Popup Form Data"). The hourly
leads job reads each tab's rows after its marker (`lead_sheets.next_row`) as a Google service account (`GOOGLE_SHEETS_KEY`,
read-only, sees only sheets shared with it; `src/lib/platforms/googleSheets.ts`, no Google package) → `sheetLeads`
(`src/lib/domain/leadSheets.ts`: columns by heading, valid Indian mobiles only, made-up numbers and repeats dropped, sheet
times are UTC) → `import_sheet_rows` (leads + marker in one transaction; channel `website`, `page` = the tab's label). A
broken tab records `last_error`; the Leads page shows one line (`sheetWarning`). `npm run leads:sheets -- --org=lws-pune
[--dry-run]` runs it by hand; `npm run leads:sheet:add` registers a tab. SETUP.md step 12. **Class (0027):** `leads.class_level`
("10", "12 passed"…) comes from the calculator's "Class Level"; owners can type it for any lead (Edit); it is in the Excel
download. Calculator leads imported before 0027 got it from their note (`private.class_from_note`).
**PYQ Vault leads (0028, founder 2026-10-25):** PYQ Vault students who chose NDA, CDS or AFCAT, gave a mobile and ticked
"I agree to be contacted" (account) or took a public NDA quiz. PYQ Vault decides who counts (`defence_leads_after`, its
migration 0185) and serves them at `https://www.pyqvault.com/api/leads/defence` behind a shared secret (`GOPOST_LEADS_SECRET`
there, `PYQVAULT_LEADS_SECRET` here); GoPost holds no key to PYQ Vault's database. The hourly leads job reads two feeds
(`lead_feeds`: `pyqvault_account`, `pyqvault_quiz`) after their cursor (`<timestamp>~<id>`) → `feedLeads`
(`src/lib/domain/pyqvaultLeads.ts`: course "NDA, CDS…", class from stage, city in the note) → `import_feed_rows` (leads +
cursor in one transaction; channel `website`, `page` "PYQ Vault · account" / "PYQ Vault · quiz"). A feed that can't be read
shows one line on the Leads page. `npm run leads:pyqvault -- --org=lws-pune [--dry-run]` runs it by hand and registers the
feeds. SETUP.md step 13. A student marked "Not a lead" comes back only if they change their PYQ Vault profile again.
**Admissions feed (0029, founder 2026-10-26):** Admissions AI (the aptitude test app, where LWS's counsellors and
telecallers call leads) reads every `lws-pune` lead with an Indian mobile, whatever the course, from `GET
/api/feeds/admissions` every hour, behind `ADMISSIONS_LEADS_SECRET` (`GOPOST_LEADS_SECRET` there); it holds no key to this
database. `admissions_leads_after` (service role) decides who counts; the cursor is `(created_at, id)`, not `lead_at`, so a
lead added late with an old date isn't passed by, and a lead added in the last two minutes is held back so one still being
saved can't land behind the cursor. `src/lib/domain/admissionsFeed.ts`. Only new leads travel: an edit here afterwards
doesn't reach Admissions AI. The middleware lets `api/feeds/` through, so each feed guards itself. SETUP.md step 14.
**Leads from chats GoPost can't see (0018, founder 2026-10-21):** e.g. +91 91563 10546 (the SPI ad number, not connected):
read in WhatsApp Web through Claude in Chrome, read-only; opening an unread chat marks it read, so judge unread ones by
their preview or ask first. The founder approves the verdicts, then `npm run leads:add -- --org=lws-pune --channel=whatsapp
--via="+91 91563 10546" --file=<[{phone,date,name?,course?,from_ad?,reason?}]>` → `add_outside_leads`.
**Lead downloads (0020, founder 2026-10-21):** "Download for Excel" asks: all leads, or only those added since your last
download (by when they were added, `created_at`). A POST from the page (`src/lib/leads/export.ts`); either choice moves
that owner's download point (`lead_downloads`, per person), saved only after the file is built.
**WhatsApp Business app numbers (founder 2026-10-19, first: +91 70200 03600):** Meta "coexistence": the number stays on
the phone app and also reaches GoPost. Inbox → "Connect a WhatsApp Business app number" opens Meta's Embedded Signup
(`WhatsAppConnectBox`, env `META_WA_SIGNUP_CONFIG_ID`) → `connectWhatsAppBusinessApp` (owners) → `connectBusinessAppNumber`:
swap the 30-s code, save the number (platform `whatsapp`, business token in Vault), subscribe, request history once
(Meta allows it only within 24 h). Never call `/register` on such a number (it would leave the phone). The webhook also
reads `smb_message_echoes` (sent from the phone → `out`) and `history` (old chats). No migration. Meta requires Tech
Provider status (App Review; the portfolio is verified): SETUP.md step 10.
**1,000-row cap (found 2026-10-25):** Supabase returns at most 1,000 rows per request whatever `.limit()` says (the Leads page
showed "1000 leads" of ~2,300). Any list that can grow past that reads through `allRows` (`src/lib/supabase/pages.ts`) with a
unique tie-breaker in the order.
**Note:** `TEST_DATABASE_URL` is the same database as `DATABASE_URL` (tests roll back), so
`db:migrate` changes the live schema; dry-run a new migration in a rolled-back transaction first.
**Address and name (2026-10-19, founder):** the app is **GoPost** at **https://gopostapp.vercel.app** (no "LWS":
outside brands use it too). The old https://lws-marketing-engine.vercel.app still works as an alias; the Vercel
project keeps its name `lws-marketing-engine`. pg_cron reaches the app through the Vault secret `publisher_cron_url`
(now the gopostapp address); change it there if the address ever changes again.
**Deploys (2026-10-16):** Vercel (Hobby, owner `thefableisland`) now BLOCKS git-push deploys
because the commit author (GitHub `lwspune`) isn't on the Vercel account. Until the founder links
GitHub `lwspune` in Vercel → Account Settings → Login Connections, deploy with the owner's token:
`POST https://api.vercel.com/v13/deployments` with `VERCEL_TOKEN` from `.env.local`, body
`{name:"lws-marketing-engine", project:VERCEL_PROJECT_ID, target:"production", gitSource:{type:"github",
repoId:1418874769, ref:"main", sha:<pushed sha>}}`, then poll `/v13/deployments/<id>` until READY.
**Phone screenshots:** headless Edge won't make a window narrower than ~500 px, so `--window-size=390,…`
crops a wider layout and fakes an overflow. Use DevTools `Emulation.setDeviceMetricsOverride`
(`mobile: true`) and compare `document.documentElement.scrollWidth` to the viewport.

**Reels:** rendered in Edge from `*.render.html` (MediaRecorder → H.264 + AAC MP4, 1080×1920; carousels
1080×1350 PNG). Text in Cambria (legible, "ln" ≠ "In"). Music is generated in code, never a
licensed track. Keep the first frame's hook visible at t = 0 and cover text mid-page (the profile grid
crops reels to 3:4). `nda-maths-001.render.html` is standalone (pre-engine) by design.
`theme: 'white'` (reel 005 on) is the premium, soothing animated-graph look (soft board, cards, chips), on test; the paper look
is the default. Make these with `reels/visual-reel-workflow.md`. After any `engine.js` change, run
`node reels/tools/unchanged.mjs`: every existing reel must say SAME.

**Real PYQs:** the PYQ Vault question bank (`../Question_Bank`, Supabase) is the source for real
questions + verified solutions. Read it with the public anon key only (read-only); never write to it.
Re-derive the answer before using any question in content.

## Run

Open `marketing-engine.html` in a browser. Paste API key. Pick a product. Generate.
Tests: `node --test tests/*.test.js` from this folder.

## Don'ts

- No content that assumes the user's face or voice.
- No fully-autonomous publishing.
- No generic slop; keep everything grounded in the selected product profile.
- No hardcoded keys, no server dependency, no npm packages.
