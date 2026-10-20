# @pyqvault_ house settings (approved by the founder, 2026-10-18)

The Instagram for **PYQ Vault**: Physics, Chemistry and Maths concepts for **Class 11–12** (CBSE / State boards, JEE,
NEET, MHT-CET), explained visually. Not NDA (that's @lws.pune). Publisher project **`pyqvault-insta`**: posts go
to @pyqvault_ and the PYQ Vault Facebook Page. Every reel uses the shared engine (`reels/engine.js`) and the
runbook (`visual-reel-workflow.md`); the rules below override it for this handle.

## Content rules

- **Series:** "Physics, visualised #N", "Chemistry, visualised #N" and "Maths, visualised #N" (maths added 2026-10-18), rotating P → C → M day by day. Maths topics never repeat @lws.pune's NDA list (see the backlog).
- **Pick topics from `remake-backlog.md`** (founder, 2026-10-18): proven ideas from other creators, remade our way.
- **No exam question at the end** (founder, 2026-10-18). The reel ends on the idea, then the end card. Exam
  relevance lives in the caption ("CBSE boards asked this in 2023, 2025, 2026"), never as an on-screen MCQ.
- **More visuals, less theory** (founder, 2026-10-18): the picture carries the idea. On-screen text is short
  labels and one short line at a time (aim ≤ 7 words), no derivations, no formula walls. Live numbers that
  change with the picture (speed, rate, energy bars) count as visuals and are welcome.
- **The @bisal.physics recipe** (learnings L20): a live simulation + live numbers + a graph that draws itself.
- **Vivid first** (founder, 2026-10-20; measured in `pyqvault-learnings.md` L30): pick topics where the **whole screen
  moves and changes colour**: many objects at once (molecules, elements, particles), bold colour changes, something new
  every second. Our top three (Boyle's piston, the 8 families, calculus in one curve) work like that; the quiet ones
  (one dot, one jar, one pendulum on a calm screen) got half the views. If a topic can only show one thing moving, add
  what's around it (many copies, a live chart, colour that follows the numbers) or pick another topic.
- **Predict-first opening (on test from 2026-10-19, L28 + L29):** frame 0 asks a question the viewer can answer in
  two seconds, with A/B/C pills and "comment your guess 👇" (`PredictHeader` in `remotion/src/board.tsx`); no still title
  card; the picture then settles it and the right pill lights. The caption's first line repeats the question + "Comment
  your guess". Aim for ≤ 25 s. **The cover never gives the answer away:** take it before the right pill lights,
  and keep the answer out of the cover text (e.g. "Guess before you watch"). Our first five reels averaged 2.7–6.6 s of watch time and 0 comments: this tests the fix.
- **Question in front, picture already moving behind it** (founder, 2026-10-20; `pyqvault-learnings.md` L31): the
  question sits in the foreground from frame 0 while the animation is already running behind it, so the viewer sees
  something happen before they know why. No still frames in the first 3 s: not a still scene under the question, not a
  still title card.
- **Made in Remotion from #2 on** (founder, 2026-10-18; the engine drops frames, L25): `remotion/src/PvPhysics002.tsx` is
  the template: real three.js 3D, timeline as pure functions of t in `src/lib/<reel>.ts` with tests first (physics
  re-checked in the test, labels ≤ 7 words), `TitleCard` + `EndCard` from `src/board.tsx`. Physics #1 and Chemistry #1
  were made with the engine (`api.jar`, `api.sphere3d`) and stay as they are.
- **Dark lab look in Remotion:** wrap the reel in `<Theme value={LAB}>` (`src/lib/palette.ts`, test-locked to `Reel.LAB`).
- **Honest scale:** never fake counts or proportions; zoom with a visible label (e.g. "zoomed ×10⁹").
- **Length:** ≤ 25 s for predict-first reels (L29: viewers left within seconds); ~25–35 s otherwise.
- **End card ends with the website, `pyqvault.com`** (founder, 2026-10-18), large, in the accent colour. (This
  is the opposite of @lws.pune, where the founder removed link lines from the end card.)

## Look

- **Background is on test (L22):** alternate `theme: 'lab'` (dark) and `theme: 'white'`, balanced across
  physics and chemistry (P1 lab, C1 white, P2 white, C2 lab, …). Colours from `Reel.palette(THEME)` only.
- No still title card (L29, L31): the question opens over the moving picture. No slow zoom on text.
- **Music: Claude picks it** (founder, 2026-10-18: "you choose; I approve or reject the reel"). Use the energetic styles
  (`drive`, `synthwave`, `cinematic`, `trap`; `lofi`/`bright`/`calm` only for a deliberately calm topic), never the same
  style twice in a row on the handle. Fit by mood: simulations and motion → `drive` or `synthwave`; build-up reveals
  (a table filling, a curve straightening) → `cinematic`; dark/dramatic → `trap`. Mark 1–3 key moments as `music.hits`
  (riser → impact on the picture's big beat). Loudness must pass `check-video.mjs`. No voice (voiceover parked).

## Caption

- First line names the syllabus (L23): `Class 11 Physics · <chapter>` / `Class 12 Chemistry · <chapter>`.
- Then the series line, 2–4 short lines on the idea, one line on where it's asked, the save/follow ask, and
  "Practise every PYQ on this chapter free → link in bio (PYQ Vault)".
- Hashtags: #Physics or #Chemistry, #Class11 / #Class12, #CBSE, #JEEMain, #NEET (+ #MHTCET where relevant),
  the chapter, #PhysicsVisualised / #ChemistryVisualised.
- Facebook: same, with the PYQ Vault chapter link written out.

## Posting

- **Three reels a day at 09:00, 13:00 and 18:00 IST** (founder, 2026-10-20; was 11:00 / 17:30 / 21:30 until then,
  L32). Approving in GoPost puts the reel in the next free slot (`publisher/src/lib/domain/slots.ts`).
- Numbers and lessons for this handle go in **`pyqvault-learnings.md`**, not @lws.pune's `learnings.md`.
