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
  visual-reel-workflow.md #  runbook for white-board animated-graph reels (skill: .claude/skills/visual-reel)
  visual-candidates.md   #   PYQs whose answer is a picture, by paper (pick visual reels from here)
  tools/                 #   headless-Edge scripts: frames, record, cover, check-video, unchanged (+ baseline.txt)
  assets/                #   V mascot poses (copied from Question_Bank/public/chat)
  *.post.json            #   one per piece: manifest for publisher's `queue:add` (files + captions)
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
`npm run insights -- --org=lws-pune` exports every reel's numbers to `../analytics/`.

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
