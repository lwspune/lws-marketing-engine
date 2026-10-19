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
   `TEST_DATABASE_URL`. Generate `CRON_SECRET` as a long random string. `META_APP_SECRET` and
   `META_WEBHOOK_VERIFY_TOKEN` are needed there since the Inbox (step 8): Meta's DM webhook is checked
   against them.
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

## 7. Connect the ad account (Meta ads, ~15 min)

Lets the Insights tab show ad results, and the Ads tab create ads (paused until you press Launch).

1. developers.facebook.com → the publisher's app → **Use cases** → add **Create & manage ads with
   Marketing API**. Then **publish the app (Live mode)**: App settings → Basic needs a Privacy
   Policy URL (`https://lwspune.in/privacy-policy/`), Terms (`https://lwspune.in/terms-conditions/`),
   data deletion (same privacy URL), an icon and a category; then **Publish**. Reading results works in
   Development mode, but Meta refuses to put a post made by an unpublished app into an ad
   ("…created by an app that is in development mode. It must be in public", subcode 1885183).
2. business.facebook.com → Settings → Users → **System users** → LWS uses **Digi Publisher**
   (Admin). **Assign assets**: the business's ad account **LWS Pune `570714718754453`** with
   **Manage campaigns (ads)** only (not "Manage ad accounts": the tool never needs payments or
   permissions), the **LWS Pune** Page and the **@lws.pune** Instagram account (full control).
   Only ad accounts *in the business portfolio* work; `779905330977080` (personal, another
   Facebook login) is deliberately not used. The ad account needs a payment method before Launch.
3. Same system user → **Generate new token** → choose the publisher app → expiry **Never** → tick
   `ads_read, ads_management, business_management, pages_show_list, pages_read_engagement`.
4. `npm run connect:ads -- --org=lws-pune --account=570714718754453` and paste the token when it asks.
   It checks the token can see the account (INR, active, can read campaigns) before saving it,
   encrypted in Supabase Vault.
5. `npm run insights -- --org=lws-pune` to pull the first results (afterwards: nightly at 3 am IST).

The `lws-coaching` project (or whichever project an ad belongs to) needs its Facebook Page and
Instagram connected (step 3), because the ad is published as the Page and @lws.pune.

### Making an ad

Put an `.ad.json` next to its poster, e.g. `reels/spi-mock-parents.ad.json`:

```json
{
  "slug": "spi-mock-parents-nov",
  "project": "lws-coaching",
  "title": "SPI Mock Test – parents, Nov week 1",
  "image": "spi-mock-poster.png",
  "campaign": "SPI Mock Test – Pune – Nov 2026",
  "adset": "Parents 35–55 – Pune",
  "ad": "Poster – English",
  "primaryText": "Is your child in 10th and aiming for NDA? …",
  "headline": "SPI Mock Test – Every Sunday, FC Road",
  "description": "Sagar Arcade, FC Road · Every Sunday 10 AM–1 PM",
  "whatsapp": {
    "phone": "919156310546",
    "greeting": "Hi! 👋 Tap send to get the SPI mock test schedule and fees.",
    "prefilled": "Hi, please send details of the SPI Sunday mock test."
  },
  "audience": { "latitude": 18.52, "longitude": 73.84, "radiusKm": 20, "ageMin": 35, "ageMax": 55, "place": "FC Road, Pune" },
  "dailyBudgetInr": 150,
  "start": "2026-11-01T13:00:00+05:30",
  "end": "2026-11-08T13:00:00+05:30",
  "music": false
}
```

Then `npm run ads:add -- --org=lws-pune ../reels/spi-mock-parents.ad.json` and open the **Ads** tab:
**Approve** creates it on Meta, paused → **Check the preview in Ads Manager** → **Launch** (asks
"start spending?") → **Pause** any time. Rules the file and the database both enforce: at most
₹1,000/day, an end date 1–30 days after the start, times with `+05:30`. Fixed settings: WhatsApp
chats as the goal, people **living** within the radius, strict ages, automatic placements, Meta's
AI changes off (poster and text run exactly as written; `music` is the only optional one),
Multi-advertiser ads off. Under-18 audiences are fine: Meta only allows age + location for them,
which is all this uses.

## 8. Inbox: Instagram DMs (owners only, ~20 min)

DMs land in GoPost's **Inbox** tab: read, reply (within Instagram's 24-hour window), mark each chat
New / Interested / Booked / Bought / Not a lead. Only **owner** logins see it: not editors, not staff.
Message text is deleted after 12 months; the lead counts stay. Get the brand owner's OK before
connecting an outside brand's account (e.g. Sound Mind).

1. Generate a verify token (any long random string) and put it in `.env.local` and on Vercel as
   `META_WEBHOOK_VERIFY_TOKEN`; put `META_APP_SECRET` on Vercel too. Redeploy.
2. App dashboard → use cases → **Manage messaging & content on Instagram** → Customize → Permissions →
   add **`instagram_manage_messages`**; **Manage everything on your Page** → add **`pages_manage_metadata`**;
   **Add use cases** → the Messenger one → add **`pages_messaging`**. Meta refuses to subscribe a Page to DMs
   without `pages_messaging` until the app has Advanced Access (found 2026-10-19). Facebook Page chats still
   don't reach GoPost: the webhook only listens to Instagram.
3. App dashboard → **Webhooks** → product **Instagram** → callback URL
   `https://gopostapp.vercel.app/api/webhooks/meta`, verify token from step 1 → **Verify and save** →
   subscribe to the **messages** field.
4. Graph API Explorer → same token as step 3 above **plus** `instagram_manage_messages,
   pages_manage_metadata, pages_messaging` (paste the token into the terminal, not into chat) → run `npm run connect:meta -- --org=lws-pune --page="LWS Pune"
   --projects=pyq-vault,lws-coaching` (and again per Page). It says "✓ Inbox: new Instagram DMs will
   reach GoPost".
5. On the phone, each Instagram account: **Settings → Messages and story replies → Message controls →
   Connected tools → Allow access to messages** (on).
6. `npm run messages:backfill -- --org=lws-pune --accounts=@lws.pune,@pyqvault_` pulls in recent existing chats (about the last 20
   messages of each). Send the account a test DM from another profile: it appears in the Inbox.

Meta may ask for App Review of `instagram_manage_messages` before DMs from the public arrive (only
people with a role on the app would get through until then). The review wants a screen recording
of the Inbox: open a chat, reply, set a status.

**Monthly:** `npm run messages:themes -- --org=lws-pune` groups the last 30 days of questions into
ranked problems in students' words → `../analytics/dm-themes-<date>.md`. Personal details (names,
@handles, numbers, emails, links) are removed before anything is sent to Claude. Needs
`ANTHROPIC_API_KEY` in `.env.local`; without it you get the redacted questions to paste yourself.

## 9. WhatsApp in the Inbox (owners only, ~15 min)

Messages to a **WhatsApp API number** in your business portfolio land in the same Inbox (first: +91 76206 99213, which
WABridge also uses for the attendance messages). GoPost listens **alongside** WABridge: nothing is moved or
re-registered, and WABridge keeps sending. GoPost sees what people send in (with their WhatsApp name, and the ad id when a
chat starts from a Click-to-WhatsApp ad), not WABridge's outgoing messages. Replies from GoPost work within 24 hours of
their last message; after that WhatsApp allows only approved templates (not in GoPost yet). WhatsApp keeps no history,
so the Inbox starts the day you connect.

1. App dashboard → **Add use cases → Connect on WhatsApp** → Permissions: add **`whatsapp_business_management`** and
   **`whatsapp_business_messaging`**. Do **not** use API Setup → "Add phone number" (that would re-register the number
   to this app) or Tech Provider onboarding.
2. Same use case → **Configuration** → webhook: the same callback URL and verify token as step 8 → subscribe **messages**.
3. Business Settings → **Accounts → WhatsApp accounts** → the number → **Assign people** → **Digi Publisher** (the
   system user) → Full control.
4. Business Settings → **System users → Digi Publisher → Generate token**: app Digital Marketing Automation,
   `whatsapp_business_management, whatsapp_business_messaging, business_management`, expiry **Never**.
5. `npm run connect:whatsapp -- --org=lws-pune --number=7620699213` and paste the token into the terminal. It ends with
   "✓ Inbox: WhatsApp messages to this number will reach GoPost". Send the number a WhatsApp from another phone: it
   appears in the Inbox under the "WhatsApp +91 …" chip.

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
  appear on its Done card (▲/▼ against the typical reel).
- **Insights tab:** every reel on the account (including hand-posted ones) with ▲/▼ against your
  typical reel; refreshes nightly at 3 am IST, or tap **Refresh now**. `npm run insights --
  --org=lws-pune` does the same refresh and also writes `../analytics/lwspune-reels-<date>.csv`.
- **Inbox** (owners): "Needs reply" lists chats waiting on you; the Insights tab's **Messages this
  week** box counts new chats, chats from ads, leads and bookings from the statuses you set.
- Tokens: the Page token doesn't expire, but it stops working if you change your Facebook password
  or remove the app. Run `connect:meta` again to reconnect.
- **Ads:** the Insights tab's **Ads** box shows each campaign's last 30 days: spend, WhatsApp chats,
  cost per chat (Good ≤ ₹60 · Watch ≤ ₹100 · above that change the poster, not the budget). Every
  Monday type last week's **tests booked** and **NDA leads** from your WhatsApp labels into it, for
  cost per booked test. `npm run insights` also writes `../analytics/lwspune-ads-<date>.csv`. Meta's
  days follow the ad account's clock (LWS Pune's is India time).
