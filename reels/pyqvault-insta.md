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
- **Made in Remotion from #2 on** (founder, 2026-10-18; the engine drops frames, L25): `remotion/src/PvPhysics002.tsx` is
  the template: real three.js 3D, timeline as pure functions of t in `src/lib/<reel>.ts` with tests first (physics
  re-checked in the test, labels ≤ 7 words), `TitleCard` + `EndCard` from `src/board.tsx`. Physics #1 and Chemistry #1
  were made with the engine (`api.jar`, `api.sphere3d`) and stay as they are.
- **The dark lab look isn't in Remotion yet:** add it (a palette like `Reel.LAB`, test-locked) before the next lab reel (Chemistry #2).
- **Honest scale:** never fake counts or proportions; zoom with a visible label (e.g. "zoomed ×10⁹").
- **Length:** ~25–35 s now that there's no question segment.
- **End card ends with the website, `pyqvault.com`** (founder, 2026-10-18), large, in the accent colour. (This
  is the opposite of @lws.pune, where the founder removed link lines from the end card.)

## Look

- **Background is on test (L22):** alternate `theme: 'lab'` (dark) and `theme: 'white'`, balanced across
  physics and chemistry (P1 lab, C1 white, P2 white, C2 lab, …). Colours from `Reel.palette(THEME)` only.
- Title card with the glowing edge (`api.glowRing`), then it glides to the header; no slow zoom on text.
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

- One reel a day; aim for **11:00 IST** (L21). Approving in the publisher posts at once, so approve at 11:00.
