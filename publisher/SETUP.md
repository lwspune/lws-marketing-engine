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
   without `pages_messaging` until the app has Advanced Access (found 2026-10-19). Facebook Page chats: step 7.
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
7. **Facebook Page (Messenger) chats** (migration 0025, 2026-10-25). `connect:meta` already subscribes every Page
   to `messages`, an outside brand's Page too, so GoPost stores a Page's chats only once its **inbox is on**:
   `npm run messages:backfill -- --org=lws-pune --pages="LWS Pune"` switches it on and pulls the old chats. The app
   must also listen to Pages: App dashboard → **Webhooks** → product **Page** → same callback URL and verify token
   → subscribe to **messages**. Chats show as "Facebook LWS Pune" in the Inbox; replies go through Messenger
   (24-hour window); a shared phone number or email makes a lead, as on Instagram.

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
5. `npm run connect:whatsapp -- --org=lws-pune --number=7620699213 --business=9624437840908410` (the business
   portfolio id from any business.facebook.com URL) and paste the token into the terminal. It ends with
   "✓ Inbox: WhatsApp messages to this number will reach GoPost". Send the number a WhatsApp from another phone: it
   appears in the Inbox under the "WhatsApp +91 …" chip.

## 10. A WhatsApp Business app number in the Inbox (owners only)

For a number that runs on the **WhatsApp Business app on a phone** (first: +91 70200 03600). Meta's "coexistence"
keeps it working on the phone and also sends its chats to GoPost, including what the team sends from the phone and,
once, up to about 6 months of old chats. GoPost never registers the number (that would move it off the phone).

What changes on the phone: broadcast lists become read-only, disappearing / view-once messages and live location
are switched off in one-to-one chats, group chats don't come to GoPost, linked devices are unlinked (re-link them
afterwards; **WhatsApp for Windows can't be re-linked**), and the app must be opened at least every 14 days or the
connection stops. Needs WhatsApp Business app 2.24.17 or newer.

1. **Tech Provider (once, Meta-side).** Meta allows this route only for Tech Providers. The business portfolio is
   already verified (checked 2026-10-19), so what's left is **App Review**: Advanced Access to
   `whatsapp_business_messaging` and `whatsapp_business_management`, with two screen recordings (a message sent from
   the app and received in WhatsApp; a message template created in WhatsApp Manager). Try steps 2–5 first: Meta may
   let the app's own admin connect the portfolio's own number before the review.
2. App dashboard → **Facebook Login for Business → Settings**: switch on Client OAuth login, Web OAuth login,
   Enforce HTTPS, Embedded Browser OAuth Login, strict mode for redirect URIs and Login with the JavaScript SDK. Add
   `https://gopostapp.vercel.app/` to **Allowed domains** and **Valid OAuth redirect URIs**.
3. **Facebook Login for Business → Configurations → Create** from the WhatsApp Embedded Signup template (token that
   never expires). Copy its **configuration id** into Vercel as `META_WA_SIGNUP_CONFIG_ID` (Production) and redeploy.
4. **WhatsApp → Configuration → Webhook fields**: subscribe **history**, **smb_message_echoes** and
   **account_update** (alongside **messages** from step 9). `smb_app_state_sync` (the phone's address book) is left
   off on purpose: GoPost doesn't need it. (Done 2026-10-19 through the API: `POST /{app-id}/subscriptions` with the
   app token, object `whatsapp_business_account`, all four fields listed, same callback URL and verify token.)

Note: 70200 03600 already shows in Business Settings → WhatsApp accounts (account 1781479843047484, linked from the
phone app), but Meta reports it `DISCONNECTED` from the API. Assigning people or the system user to it does NOT bring
its messages to GoPost; only step 5 does.
5. Open the Inbox → **Connect a WhatsApp Business app number** → **Connect with Meta**. In Meta's window choose
   **connect your existing WhatsApp Business app**, pick 70200 03600, scan the QR code with the phone (keep the app
   open) and allow sharing chat history. GoPost then saves the number, subscribes to it and asks for the old chats
   straight away (Meta allows that once, within 24 hours). It ends with "Connected: WhatsApp +91 70200 03600".
6. Check: send the number a WhatsApp from another phone (it appears under its chip), then reply from the phone app
   (it appears in GoPost as "You: …").
7. **Office PC:** 70200 03600 was used in WhatsApp for Windows (founder, 2026-10-19), which can't be re-linked. Open
   **web.whatsapp.com** in Edge, scan its QR code with the phone, and install it as an app (Edge ⋯ → Apps → Install
   this site as an app). Replies sent from WhatsApp Web reach GoPost; ones from the Windows app wouldn't.

If the window doesn't offer the WhatsApp Business app option, Meta has changed how the route is picked:
`SIGNUP_EXTRAS` in `src/components/WhatsAppConnectBox.tsx` is the one place to update.

## 11. YouTube Shorts (~20 min, then Google's audit)

Done 2026-10-23 for LWS Pune; repeat only steps 5–7 for another channel.

1. **Google Cloud project** `GoPost` (`gopost-512510`, signed in as the account that owns the LWS Pune channel) →
   APIs & Services → Library → **YouTube Data API v3** → Enable.
2. **Google Auth Platform**: app name GoPost, audience **External**, home page `https://lwspune.in/`, privacy
   `https://lwspune.in/privacy-policy/`, terms `https://lwspune.in/terms-conditions/`, authorised domain
   `lwspune.in` (Google won't take a `vercel.app` address). Data Access: `youtube.upload` + `youtube.readonly`.
3. **Audience → Publish app → In production.** In "Testing" the sign-in dies after 7 days. Ignore "needs
   verification": an unverified app works for up to 100 sign-ins, with a warning screen (Advanced → Go to GoPost).
4. **Clients → Create client → Desktop app** "GoPost connect". Put its id and secret in `.env.local` **and** in
   Vercel (Production) as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, then redeploy. Without them on Vercel,
   YouTube publications fail with "YouTube isn't set up on the server yet".
5. `npm run connect:youtube -- --org=lws-pune --projects=pyq-vault`: Google's sign-in opens in the browser; pick the
   channel, allow both permissions. The refresh token goes to Vault. Re-run it if a card says the sign-in expired.
   Sound Mind: `--projects=soundmind-shivani`, signed in by Shivani (or a manager of her brand account), with her OK
   first. Being added under YouTube Studio → Permissions is **not** enough for the API.
6. **Privacy policy**: lwspune.in/privacy-policy/ needs the "YouTube and Google" section (uses YouTube API Services,
   links to the YouTube Terms and Google's Privacy Policy, what's stored, how to revoke). The auditors read it.
7. **Audit**: support.google.com/youtube/contact/yt_api_form → audit. **Until it passes, every API upload is Private
   (locked)**: GoPost still records it as published (uploading again would only make a second private copy).

Quota: about 6 uploads a day per Google project (shared by every channel); over it, the card says to press Retry
tomorrow. A reel with a `-yt` copy (end card "Subscribe for more", `youtubeVideo` in its manifest) sends that copy.

## 12. Website lead sheets: NDA age calculator + popup form (owners only, ~10 min)

lwspune.com writes its NDA age calculator and popup-form entries to a Google Sheet ("Defence Age Calculator Data- LWS
Pune", kept by the web agency). The hourly leads job reads each tab's new rows and adds them to Leads (migration 0026).
GoPost reads the sheet as a **service account**: a robot login that sees only what is shared with it, read-only.

1. [console.cloud.google.com](https://console.cloud.google.com), project **GoPost (gopost-512510)** → **APIs & Services →
   Library** → **Google Sheets API** → **Enable**.
2. **IAM & Admin → Service Accounts → Create service account**: name `google-leads`, no roles (skip both optional
   steps) → Done. Open it → **Keys → Add key → Create new key → JSON**: a file downloads.
3. Put the file's whole contents on one line in `.env.local` as `GOOGLE_SHEETS_KEY='<json>'`, and on Vercel (same name,
   Production) → redeploy. Then delete the downloaded file. (Org policy "Disable service account key creation" blocks
   step 2; turn it off for this project if you see it.)
4. Open the sheet → **Share** → paste the service account's email (`google-leads@gopost-512510.iam.gserviceaccount.com`, created 2026-10-25)
   → **Viewer**, untick "Notify" → Share.
5. Register each tab once (re-running is safe):
   `npm run leads:sheet:add -- --org=lws-pune --sheet=<id from the sheet's URL> --tab="Age Calculator" --kind=age_calculator --page="lwspune.com NDA age calculator"`
   and the same with `--tab="Popup Form Data" --kind=popup_form --page="lwspune.com popup form"`.
6. `npm run leads:sheets -- --org=lws-pune --dry-run` shows what would be added; then without `--dry-run` it imports the
   backlog. From then on it runs every hour. If it breaks (sheet unshared, renamed, a column heading changed), the
   Leads page says so in one line.

## 13. PYQ Vault leads: NDA, CDS and AFCAT students (owners only, ~5 min)

PYQ Vault students who chose NDA, CDS or AFCAT, gave a mobile and ticked "I agree to be contacted" (on their account or
at a public NDA quiz) reach Leads every hour (migration 0028). PYQ Vault decides who counts and serves them at
`https://www.pyqvault.com/api/leads/defence` behind a shared secret; GoPost holds no key to PYQ Vault's database.

1. Make a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.
2. Put it on PYQ Vault's Vercel project (`question-bank`) as `GOPOST_LEADS_SECRET` (Production, Sensitive), and on
   GoPost's (`lws-marketing-engine`) as `PYQVAULT_LEADS_SECRET`, plus `PYQVAULT_LEADS_SECRET` in `.env.local`. Redeploy
   both. Without it PYQ Vault answers 401 and GoPost skips the feed.
3. `npm run leads:pyqvault -- --org=lws-pune --dry-run` shows what would be added; then without `--dry-run` it registers
   the two feeds (account, quiz) and imports everyone so far. From then on it runs every hour. If PYQ Vault can't be read,
   the Leads page says so in one line.

## 14. Admissions AI reads LWS Pune's leads (owners only, ~5 min)

Admissions AI (the aptitude test app, where counsellors and telecallers call leads) reads every LWS Pune lead with an
Indian mobile from `/api/feeds/admissions` every hour (migration 0029), behind a shared secret; it holds no key to this
database. This is GoPost serving, the other way round from step 13.

1. `npm run db:migrate` (adds `admissions_leads_after`).
2. Make a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.
3. Put it on GoPost's Vercel project (`lws-marketing-engine`) as `ADMISSIONS_LEADS_SECRET` (Production, Sensitive) and on
   Admissions AI's (`admissions-ai`) as `GOPOST_LEADS_SECRET`. Redeploy GoPost. Without it the feed answers 401 to everyone.
4. Admissions AI's side (its import, schedule and first run) is in that repo.

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
