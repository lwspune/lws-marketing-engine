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
  their images and carousels beat reels, and Sound Mind's reels got 0 shares. Made in `soundmind/` (vanilla JS +
  headless Edge, like the reels), queued with `queue:add`; Shivani judges finished posts, not drafts. Runbook:
  `soundmind/brand.md`.

- **Instagram DMs in GoPost (2026-10-19, founder-approved).** Pull DMs into an owner-only **Inbox** to read,
  reply, mark leads, count them, and mine what students ask. This reverses the 2026-10-15 "no messaging
  permissions" choice, with safeguards: only `owner` logins read messages (RLS, not editors or staff), nobody
  signed in writes them (webhook → service role), text deleted after 12 months, no attachment URLs or raw
  payloads, personal details redacted before the themes report goes to Claude. WhatsApp uses the same tables
  (`channel`): first the API number 7620699213 that WABridge already uses (no coexistence needed), with GoPost
  listening alongside WABridge rather than taking the number over.

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
  visual-reel-workflow.md #  runbook for white-board animated-graph reels (skill: .claude/skills/visual-reel)
  visual-candidates.md   #   PYQs whose answer is a picture, by paper (pick visual reels from here)
  tools/                 #   headless-Edge scripts: frames, record, cover, check-video, unchanged (+ baseline.txt)
  assets/                #   V mascot poses (copied from Question_Bank/public/chat)
  *.post.json            #   one per piece: manifest for publisher's `queue:add` (files + captions)
soundmind/               # @soundmindwithshivani carousels (outside brand). Runbook + research: brand.md
  cards.js               #   pure rules: batch validation, health-claim check, font sizes, GoPost manifest
  art.js                 #   line-drawing catalogue for story slides
  card.html, render.mjs  #   one template; render.mjs → 1080×1350 JPEGs + <slug>.post.json per post
  <year>-w<week>/        #   batch.json (committed) + rendered slides (gitignored)
  reels/                 #   "ME" story reels made in remotion/ (MeStory.tsx shared, SoundMind00N.tsx each):
                         #   .post.json + cover; MP4 gitignored
tests/soundmind-cards.test.js # node --test
remotion/                # TRIAL: reels in Remotion (React + SVG, frame-by-frame render, Edge). `npm test`,
                         #   `npm run typecheck`, `npm run audio` (soundtrack from the engine MP4), `npm run render`,
                         #   `npm run compare:files && npm run compare` (old vs new side by side) → out/
  src/lib/               #   pure timelines (same prog/ease/caption timing as engine.js; palette test-locked to Reel.WHITE)
  src/lib/sfx.ts         #   sound effects made in code from a reel's SOUND score + ducking + −3 dB limiter (framework F14–F16);
                         #   `npm run mix:<reel>` (tools/mix.ts) mixes them into the music → public/<reel>-mix.wav
  src/shapes.tsx         #   RoundBox (rounded 3D boxes, framework F8); camera zooms are `tween` keys (motion.ts, F9)
  src/Reel014.tsx        #   first 3D reel (@remotion/three + three.js, GPU via ANGLE); `npm run music:014`,
                         #   `render:014`, `cover:014` write to ../reels/. Runbook: reels/visual-reel-workflow.md
  music/*.json           #   music spec per reel → reels/tools/music.mjs renders engine.js music offline to WAV
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
response uses `{ ok, data | error: { code, message } }`. YouTube isn't wired yet (phase 3): approving
it records a clear "not available yet" failure. **Scorecard (0004):** the same per-minute tick
takes write-once snapshots of each published post at 48 h and 7 d (`publication_metrics`), shown
on Done cards against `LWS_BASELINE` (src/lib/domain/metrics.ts, the median @lws.pune reel).
`npm run insights -- --org=lws-pune` exports every reel's numbers to `../analytics/`. **Insights tab
(0005):** `/insights` lists every reel on the account (hand-posted too, `account_media`) against the
typical reel computed live (`typicalReel`, median); refreshed nightly at 03:00 IST by pg_cron →
`/api/cron/insights`, by the tab's Refresh button, or by `npm run insights` (same sync code).
**Daily quiz Stories (0006/0007):** post kind `story` = one 1080×1920 **JPEG** card in `cover_path`
(the Instagram API rejects PNG: code 9004), no caption, Instagram only, no scorecard, plus the
`quiz` it shows (from PYQ Vault `/api/quiz/today?date=`, with per-place tagged `links`) so the
story-reply DM and Telegram post link the same quiz. Saturdays 18:00 IST pg_cron → `/api/cron/stories`
(or `npm run stories:plan`) queues next Mon–Sun as Ready; "Approve all stories" schedules each for
07:30 IST on its day (`storyApproval`: posts now if its day started, refused once it's over). Card:
`storyCard.ts` (satori + sharp, bundled Noto Sans in `assets/fonts`). `STORY_CTA=reply` switches the
card from "link in bio" to "Reply QUIZ" once the reply DM exists.
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
the password). First staff: connect.with.soundmind@gmail.com → `soundmind-shivani`. Slugs never
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
**Auto-reply to ad chats (0014, founder 2026-10-19):** Instagram only. After the webhook stores a delivery, anyone whose
message is from an ad (Meta's ad mark, or one of Meta's ready-made ad questions, `adStarts`) gets the account's saved
reply once (`src/lib/inbox/autoReply.ts`). `claim_auto_reply` (service role) is the gate: switched on, never claimed,
nobody has replied yet; a failed send calls `release_auto_reply`. Owners set text + on/off in the Inbox box (`set_auto_reply`).
**WhatsApp Business app numbers (founder 2026-10-19, first: +91 70200 03600):** Meta "coexistence": the number stays on
the phone app and also reaches GoPost. Inbox → "Connect a WhatsApp Business app number" opens Meta's Embedded Signup
(`WhatsAppConnectBox`, env `META_WA_SIGNUP_CONFIG_ID`) → `connectWhatsAppBusinessApp` (owners) → `connectBusinessAppNumber`:
swap the 30-s code, save the number (platform `whatsapp`, business token in Vault), subscribe, request history once
(Meta allows it only within 24 h). Never call `/register` on such a number (it would leave the phone). The webhook also
reads `smb_message_echoes` (sent from the phone → `out`) and `history` (old chats). No migration. Meta requires Tech
Provider status (App Review; the portfolio is verified): SETUP.md step 10.
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
