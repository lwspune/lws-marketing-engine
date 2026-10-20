# @lws.pune Instagram — house settings

The standard for every reel and post on the LWS Pune Instagram. Approved by the founder on
2026-10-12 (reels 001–004). `engine.js` already uses these defaults; change them here and there
together.

## Account

- **Handle:** **@lws.pune**, with a dot (Instagram professional account: Creator or Business).
  Never "@lwspune": that's a different account, so a CTA with it sends viewers away. The hashtag stays
  `#LWSPune`, because hashtags can't contain dots.
- **Audience:** NDA aspirants (Class 11–12 and droppers), Maths first
- **Bio link:** https://www.pyqvault.com/go/quiz (from 2026-10-17: always opens today's quiz, never needs
  editing; chapter links still go in captions). The **Daily Quiz** highlight's link sticker uses
  https://www.pyqvault.com/go/quiz?src=highlight
- **Ads:** ₹0. Organic only until free leads convert (about 2 buyers per 100 leads). Don't use Ads Manager.

## Content rules

- **Real PYQs only**, from the PYQ Vault question bank (read-only). Re-derive every answer before use.
- **One question per piece** (founder's rule, 2026-10-14). Never put two PYQs in one reel or post, even
  when the paper asks two questions on one set-up (e.g. NDA 2024 (I) Q89 + Q90). Pick the one the
  picture answers; the other can be its own piece later. "NDA asked this 3 times" is fine as a hook
  line, but only one question is on screen and solved.
- Label every piece with paper, subject and question number, e.g. `NDA 2026 (II) · Maths · Q74`.
- **No made-up numbers**: no "90% get this wrong" unless the bank has real attempt data.
- **Faceless + silent-first.** On-screen text carries the explanation; no voice, no face. V (the PYQ
  Vault mascot) may "speak" in speech bubbles.
- Each piece teaches one reusable habit or trick, plus the trap answer and why it's wrong.

## Look

| Item | Setting |
|---|---|
| Reel size | 1080 × 1920 (9:16), H.264 + AAC MP4, 30 fps |
| Image post | 1080 × 1350 (4:5) PNG slides, "1/4 Swipe →" counter bottom right |
| Background | ruled paper `#fbf8f0`, faint blue rules, red margin line |
| Maths / working | **Cambria, weight 600**, ink `#1b2a6b`. Chosen for legibility; "ln" never reads as "In" |
| Red pen | `#d22f27`: underline, box, ring around the answer, arrows routed through empty space only |
| On-screen text | black rounded box, white Segoe UI 800, ~56 px, at y ≈ 300; use `\n` for clean line breaks |
| Hook | visible on **frame 0**, with no fade-in (people decide in the first second) |
| Cover | the question on paper + one big black box mid-page (y ≈ 1060–1080). The profile grid crops reels to 3:4, so nothing important in the top or bottom 240 px |
| Safe zones | keep text out of the bottom ~320 px (caption/username) and the right ~120 px below mid-screen (buttons) |
| Watermark | **None**, from reel 007 on (founder's call, 2026-10-14): set `watermarkY: null` in the render page. Reels 001–006 keep their `LWS Pune · NDA Maths` line as made |
| End card | **solid** dark `#0c1018`, short: one takeaway line + a green `#4fd1a5` call to action. **No handle on screen**: viewers tap the account name to follow (founder's call, 2026-10-12). Wording per platform: Instagram **"Follow for more"**, YouTube **"Subscribe for more"**. No extra lines (the founder removed "A real NDA PYQ every day" and "link in bio") |

### Experimental: white visual format (added 2026-10-13, on test)

Not yet approved as house style; it's day 5 of `format-test.md`. How to make one:
`visual-reel-workflow.md`. Turn on with `theme: 'white'`. The aim is **premium and soothing**
(founder's brief, 2026-10-13):

| Element | Setting |
|---|---|
| Board | warm soft-white `#faf8f3` fading to `#f1ede4` at the edges; never pure white, no ruled lines |
| Colours | from `Reel.WHITE` only: slate ink `#23304a`, muted `#5f6880`, one maths colour indigo `#3f56a0` (curve, ∫, limits), one area colour sage `#2a736e` on a soft fill, **one accent** terracotta `#a94f28` used only for the correct answer (traps are muted + dashed, from 2026-10-14). All ≥ 4.5:1 centre to edge (tested) |
| Captions | floating white cards with a soft shadow, Segoe UI Variable semibold, sentence case; they cross-fade |
| Question | `api.card()` with the source line, the maths, and options as `api.chips()`; the answer chip fills with the accent and pulses once (no scribbled ring) |
| Lines | `api.softStroke()`: round caps, faint shadow in the line's own colour; a glowing dot leads a curve as it draws |
| Scaffolding | faint dot grid, thin muted axes, so the curve is the only strong line |
| Cover | sentence case on a white card, low (y ≈ 1440) so the figure shows in the 3:4 grid crop |
| End card | **fades into the same soft board** (no navy flash), muted lead line, ink takeaway, sage "Follow for more". Founder-approved exception to the navy end card, white format only (2026-10-13) |

Everything else above (hook on frame 0, safe zones, no watermark, music) still applies. Best for
questions with a picture: areas, periodic graphs, symmetry (`visual-candidates.md`).

## Daily quiz Story (added 2026-10-17)

Made and posted by the publisher (`publisher/src/lib/publishing/storyCard.ts`), one a day at 7:30 am
IST, approved a week at a time. No caption, no music.

| Element | Setting |
|---|---|
| Size | 1080 × 1920 **JPEG** (the Instagram API rejects PNG) |
| Look | the soft-white board (`#faf8f3` → `#f1ede4`), one white card with a soft shadow, Noto Sans |
| Words | "Today's quiz · Mon 19 Oct", the chapter (ink, bold), the quiz name (indigo), "Free · see your score instantly" (muted) |
| Call to action | sage `#2a736e` pill: **"Tap the link in our bio"** until the story-reply DM is live, then **"Reply QUIZ for the link"** |
| Safe zones | nothing in the top ~250 px (profile bar) or bottom ~340 px (reply box) |
| Rules | no handle on screen, no numbers we can't back up (same as reels) |

## Sound

- **Original music only**, generated by `engine.js`: calm lo-fi (Am7–Fmaj7–Cmaj7–G6, 84 BPM), fade in
  ~1 s and out ~2.5 s. Never a licensed track.
- A chime when the answer is circled; clock ticks plus a "time's up" ding for countdowns.
- Loudness: about −22 dB RMS, peak no higher than −3 dB.

## Caption template

```
NDA <year> (<I/II>) · Maths · Q<n>. <one-line hook>

<the trick in 1–2 lines>
<the trap, if any>

Save this 📌 Follow @lws.pune for one real NDA PYQ every day.
Practise every <Chapter> PYQ free, chapter-wise → link in bio (PYQ Vault).
```

**Hashtags:** `#NDA #NDAMaths #NDA2027 #NDAPreparation #DefenceAspirants #NDAPYQ #MathsTricks #LWSPune`
plus one topic tag (`#Calculus`, `#BinomialTheorem`, `#Trigonometry`, …).

## Posting routine

- Same time every day: **7:30 pm IST**.
- Reply to every comment in the first hour. On hook reels, don't reveal the answer.
- Fill in the scorecard 48 hours after each post (see `format-test.md`).

### Upload from the computer: Meta Business Suite (free, not Ads Manager)

One-time setup: @lws.pune must be a professional account **linked to a Facebook Page** and added to
your business portfolio. Without that link, the Reel and scheduling options don't appear.

**Reel**
1. Go to **business.facebook.com** → choose the LWS business → **Content** (or **Planner**) → **Create reel**.
2. Destination: tick **Instagram @lws.pune** (untick Facebook unless you want it there too).
3. Upload the `.mp4` from `reels/`. The music is already inside; Business Suite can't add Instagram's music.
4. **Cover / thumbnail** → *Upload image* → the matching `-cover.png`.
5. Paste the caption and hashtags.
6. Arrow next to **Share now** → **Schedule** → date and 7:30 pm. Check the time zone shows IST.

**Image post (carousel)**
1. **Create post** → tick Instagram @lws.pune → **Add photo** → select slides 1–4 and check the order.
2. Paste the caption → **Schedule** as above.

Scheduled items appear in **Planner**, where you can edit or move them until they go live.
