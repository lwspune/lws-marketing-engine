# LWS Publisher — setup

One-time setup, in order. Steps marked **(you)** happen in a browser with your accounts; the rest
are commands Claude (or you) run from this `publisher/` folder. Never paste keys or tokens into a
chat: they go only into `.env.local` (gitignored) and Vercel's environment variables.

## 1. Supabase project (you)

1. supabase.com → New project → name `lws-publisher`, region **Mumbai**, strong DB password.
2. Authentication → Sign In / Providers → **Email**: on. Turn **off** "Allow new users to sign up"
   (logins are created only by `npm run seed`).
3. Authentication → URL Configuration → Site URL: your Vercel URL (step 4). For local testing,
   add `http://localhost:3000/**` to Redirect URLs.
4. Copy `.env.example` → `.env.local` and fill in the URL, anon key, service-role key and
   `DATABASE_URL` (Project Settings → Database → Connection string → **Session pooler**).

## 2. Database

```
npm run db:migrate
npm run seed -- --org=lws-pune --org-name="LWS Pune" --projects="pyq-vault:PYQ Vault,lws-coaching:LWS Coaching" --owner=connect.lwspune@gmail.com
```

Then accept the Supabase invite email.

**DB tests:** set `TEST_DATABASE_URL` (a second project, or the same one, because every test rolls
back), run `npm run db:migrate -- --test`, then `npm test`.

## 3. Meta app (you, ~15 min)

1. developers.facebook.com → My Apps → **Create app** → use case for managing a Page/Instagram
   (business type) → link it to the LWS business portfolio. It stays in **Development mode**, which
   is enough for your own Page and Instagram (no App Review needed while only LWS uses it).
2. App settings → Basic → copy **App ID** and **App Secret** into `.env.local`.
3. Tools → **Graph API Explorer** → choose the app → Get **User** access token with:
   `pages_show_list, pages_read_engagement, pages_manage_posts, instagram_basic,
   instagram_content_publish, business_management`, plus the read-only statistics permissions
   `instagram_manage_insights, read_insights` (views/saves/reach for the scorecard; added
   2026-10-15). Add each to the app's use cases first. Choose **current Pages only** and tick the
   **LWS Pune** Page.
4. Run `npm run connect:meta -- --org=lws-pune --projects=pyq-vault,lws-coaching` and paste the token
   when it asks. It stores a non-expiring Page token, encrypted in Supabase Vault.

## 4. Vercel (you)

1. Push this repo to GitHub, then vercel.com → Add New Project → import it → **Root Directory:
   `publisher`**.
2. Environment variables: everything from `.env.local` **except** `DATABASE_URL`,
   `TEST_DATABASE_URL`, `META_APP_SECRET` (scripts only). Generate `CRON_SECRET` as a long random
   string.
3. Deploy, then set Supabase's Site URL (step 1.3) to the Vercel URL.

## 5. Turn on the scheduler (SQL editor in Supabase)

```sql
select vault.create_secret('https://<your-app>.vercel.app/api/cron/publish', 'publisher_cron_url');
select vault.create_secret('<same value as CRON_SECRET>', 'publisher_cron_secret');
```

From now on, every minute that something is due, Supabase calls the app and it publishes.

## 6. Queue posts

```
npm run queue:add -- --org=lws-pune ../reels/nda-maths-002-hook.post.json ../reels/nda-maths-001.post.json
```

Open the app, check a card, then press **Approve & publish** or **Reject**.

## Adding another Facebook Page later

The app is granted **current Pages only** (by choice, so a new Page never gets connected by
accident). For each new Page:

1. (If it's a new product) add a project: `npm run seed -- --org=lws-pune --org-name="LWS Pune"
   --projects="crack-ssb:Crack SSB" --owner=connect.lwspune@gmail.com` (re-running is safe).
2. Graph API Explorer → same app → Get User Access Token → same eight permissions → Generate. In the
   pop-up choose **current Pages only** and tick **every Page the app should keep, plus the new
   one**. Unticking an existing Page revokes the app's access to it.
3. `npm run connect:meta -- --org=lws-pune --page="New Page Name" --projects=crack-ssb` and paste the
   token. Existing connections are left as they are.

## Day-to-day

- New reel → its `*.post.json` next to the files → `npm run queue:add` → approve on your phone.
- Something failed? The card shows the platform's reason, with a **Retry** button (3 attempts).
- Scorecard: 48 hours and 7 days after a post goes live, its views, saves, shares and watch time
  appear on its Done card (▲/▼ against the typical reel). For the whole account:
  `npm run insights -- --org=lws-pune` writes `../analytics/lwspune-reels-<date>.csv`.
- Tokens: the Page token doesn't expire, but it stops working if you change your Facebook password
  or remove the app. Run `connect:meta` again to reconnect.
