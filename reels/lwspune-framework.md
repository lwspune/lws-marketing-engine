# @lws.pune reel framework (v1, 2026-10-20)

How every new @lws.pune reel is made, one numbered point at a time. Same standard as @pyqvault_'s
(`pyqvault-framework.md`, founder 2026-10-20): **every point has a reason**, and **no point is added, changed or dropped
without one**. A point keeps **the same number as on @pyqvault_ when it's the same idea** (F4 is "ask first" on both), so
a note like "F9" means one thing; the wording, reasons and status are this account's own, because each handle is tuned
by its own numbers. Account settings (captions, hashtags, posting time, the daily Story) live in `lwspune-insta.md`;
the numbers and lessons live in `learnings.md` (the L-numbers below).

**Status:** ✅ proven by @lws.pune's own numbers · 🧪 on test here (the L-number measures it; evidence from other
accounts or from @pyqvault_ counts as a reason, not as proof) · 📌 standing rule: the founder's call or a house standard

**Winning means:** beating the typical recent @lws.pune maths reel at 48 h. Today that's **1,271 views · 6.1 s watched ·
3 saves · 0 comments · 0 shares** (median of the 7 NDA maths reels posted 12–19 Oct, read 20 Oct). Watch time comes
first: Instagram only shows a reel to more people when the first viewers stay. Saves come second: they're why NDA
aspirants follow (L6). The reach test's targets still stand: reach > 2,000, watch > 10 s, one reel > 10k.

---

## Topic

**F1 · NDA maths concepts first, from proven ideas.** The reel explains one NDA maths idea; a real NDA PYQ is named in the
caption when one fits, but a good concept isn't blocked for lack of one. Ideas come from the @lws.pune list in
`remake-backlog.md`: ideas that already went viral for other creators, remade our way. · *Why:* the founder (2026-10-20:
"let's not make real PYQs too harsh; focus on NDA maths concepts"); the maths accounts that grow teach syllabus
fundamentals named by exam and topic (@mathsy.uk, L23); someone else's views prove people want the idea. · *Check:* the
backlog row has the proof link and an NDA chapter. · 🧪 L39

**F21 · Pick by topic score.** Each open idea is scored out of 10 in `remake-backlog.md` → **@lws.pune topic scores**:
proof (0–3, from their views multiple) + vivid (0–3) + a 2-second question (0–2) + concept live (0–1) + everyday hook
(0–1), with @pyqvault_'s written anchors. **Gate:** NDA maths chapters only. No exam-weight criterion: the gate already
keeps it on the syllabus, and the reel's job is reach. `node reels/tools/topic-scores.js lwspune` checks the table and
names the next pick. · *Why:* the same choice whoever makes it, and testable; the criteria are F1–F4's reasons as
numbers. · *Check:* the tool passes (`tests/topic-scores.test.js` also checks the real table). · 🧪 L39

**F2 · Vivid first.** The whole screen moves and changes: curves drawing, many strips or points at once, colour that
follows the numbers, something new every second. · *Why:* constant motion holds people even at 60 s; still moments lose
them (@ubilumapp, L13; our own exit at 5–7 s, L3); @pyqvault_'s 3 busiest reels were its top 3 (L30). · *Check:* the frame
strip: something new every second, across the frame. · 🧪 L38

**F3 · The concept shown live.** A moving picture + numbers that change with it + a graph that draws itself (a tangent
sliding while f′ plots below; strips filling an area while the sum counts up). · *Why:* one formula + one moving picture
+ live numbers is what the big simulation reels share (@sciencevisualised L19, @bisal.physics L20). · *Check:* the reel
has all three. · 🧪 L38

## Hook (the first 3 seconds)

**F4 · Ask first (predict-first), one question only.** Frame 0 asks a question the viewer can answer in two seconds, with
A/B/C and "comment your guess 👇" (`PredictHeader`); the picture settles it and the right option lights. The caption's
first line repeats it. Never two questions in one reel (founder's rule, 2026-10-14). · *Why:* comments are rare here
(L7: median ~1); an ask only works before people leave (L5); on @pyqvault_ the account that asks gets 3.3 comments per
1,000 views (L28). · *Check:* the question + options are on the first frame. · 🧪 L38

**F5 · Question in front, picture already moving behind it.** No still frames in the first 3 s: no title card, no
countdown over a still page. · *Why:* our viewers leave at 5–7 s, and in 008 that was inside a 6 s still countdown (L3);
motion from frame 0 (founder, L11). · *Check:* a test that something changes on every frame of the first 3 s. · 🧪 L3, L38

**F6 · The cover never gives the answer away, and works in the grid.** Take it before the reveal; cover text mid-page so
the profile grid's 3:4 crop keeps it (nothing important in the top or bottom 240 px). · *Why:* the guess is the hook; the
grid crops reels to 3:4 (house settings). · *Check:* cover time is before the answer lights; the cover's text sits
between y ≈ 240 and 1680. · 📌 house + 🧪 L38

## Picture

**F7 · More picture, less text.** Short labels, one line at a time, ≤ 7 words; no derivations or formula walls on screen
(the working goes in the caption). Live numbers count as picture. · *Why:* the picture carries the idea in a 3-second
decision; @ubilumapp's reels have almost no on-screen text (L16). This replaces the old "steps as on-screen text" format
for new reels. · *Check:* the reel's tests count words per caption line. · 🧪 L38

**F8 · Rounded shapes, soft edges.** No sharp corners where we can avoid them (`RoundBox`, round-ended bars and pills);
a 3D or zoomed area fades into the board (`softEdges`) instead of a hard crop line. · *Why:* soft shapes look friendlier
and more premium (founder, 2026-10-20); a straight crop line shows as soon as the camera zooms. · *Check:* no
`boxGeometry` in the reel's file; the frame strip shows no hard edge. · 🧪 L38

**F9 · Zoom in and out at 3–4 moments, on the picture.** A slow push in while something builds, a quick **punch-in on the
big moment**, a zoom out to show the result (`CAMERA` keys, `tween` in `motion.ts`). **Zoom the picture, not text:** keep
the question and labels still. · *Why:* a change of view restarts attention (founder); text under a slow zoom shimmers
and looked jerky to the founder (L11). · *Check:* tests: at least 2 zooms in and 1 out, no jump between frames, a
punch-in on the big moment. · 🧪 L38

**F22 · An orbit shot in 3D reels.** 3D reels only (solids, surfaces, 3D geometry), at most **one per reel**, **60–120°**, in
the opening seconds or the closing moment, back at the explaining view before the key moment, slow and eased with no
whoosh. · *Why:* it shows the 3D's depth and gives motion from frame 0 (reel 014 opens with a circling camera, L25); it's
limited because an angle or a slope only reads from one view. · *Check:* the reel's tests (arc size, back at the front
before the key moment, no jumps). · 🧪 L38

**F10 · Honest.** The maths is re-derived in the reel's tests; a PYQ named in the caption has its answer re-derived from
the question bank (read-only); no made-up numbers ("90% get this wrong"); label any scale change. · *Why:* a wrong reel on
an exam account costs trust we can't buy back; the no-slop rule. · *Check:* the tests re-derive the answer. · 📌 founder

**F11 · Smooth, frame-exact video (Remotion).** New reels are made in `remotion/`: timeline as pure functions of t in
`src/lib/<reel>.ts`, tests first. Template: `remotion/src/Reel015.tsx` + `src/lib/reel015.ts` (2D) or `Reel014.tsx` (3D).
Reels made with `engine.js` (001–013) stay as they are. · *Why:* the engine's 005 averaged 29.2 fps with gaps up to
0.4 s in the first second; the founder judged Remotion "far better" (L25). · *Check:* rendered by `npm run render:<reel>`.
· 📌 founder, 2026-10-18

**F12 · White board.** The soft white board (`WHITE` palette: slate ink, one indigo maths colour, one accent for the answer).
Dark isn't tried here yet: it switches only if @pyqvault_'s dark-vs-white test (L22) is called clearly for dark, and
then as a test here first. · *Why:* @lws.pune has always been white; running the same test on both handles at once would
leave each with half the evidence. · *Check:* the background goes in the Background column of the results table. · 📌
house, logged (L40)

## Sound

**F13 · Music made in code, a different style each reel.** Never the same style twice in a row, picked by mood: calm
`lofi` (the house default) or `calm` for slow builds, `cinematic` for a reveal, `drive` or `synthwave` for motion, `bright`
for light topics. 1–3 `music.hits` on the big beats. No voice. · *Why:* no licence risk; the founder asked for a
different music per reel (L17); which style holds viewers is measured, not assumed. · *Check:* `music/<reel>.json`; the
style goes in the Music column of the results table. · 🧪 L40

**F14 · The picture's own sound.** Effects for what's on screen, made in code from the reel's `SOUND` score
(`src/lib/sfx.ts`): e.g. a soft click as a point crosses each grid line (pitch following the slope), a thunk when the
answer lights, a tap per strip as an area fills. **Only what the picture shows.** · *Why:* sound in sync makes the
picture feel real (founder). · *Check:* tests put each sound on its event. · 🧪 L38

**F15 · A whoosh only on fast zooms** (≤ 0.9 s): rising for in, falling for out; slow drifts stay silent. · *Why:* a whoosh
on every move is noise (founder: "if appropriate"). · *Check:* `whooshesFor`, tested. · 🧪 L38

**F16 · The mix.** The music dips under the effects and comes back; effects sit 5–10 dB under the music's body; peak
≤ −3 dB. · *Why:* the effects are heard without fighting the music; one level for every reel. · *Check:* `npm run
mix:<reel>`; `check-video.mjs` on the MP4. · 📌 house standard

**F17 · It still works with the sound off.** Every idea is on screen. · *Why:* many people scroll muted; the account is
faceless and silent-first (CLAUDE.md). · *Check:* watch it muted. · 📌 founder

## Shape

**F18 · Short.** ≤ 25 s for predict-first reels; up to ~45 s for a "why" build that never stands still. · *Why:* viewers
leave at 5–7 s whatever the length (L3), and @ubilumapp shows length isn't the problem, still moments are (L13). ·
*Check:* the reel's tests. · 🧪 L3, L13

**F19 · Name the exam and chapter, in a numbered series.** On screen: `NDA MATHS · <CHAPTER>`; caption's first line: `NDA
Maths · <Chapter>`, then the question. Concept reels continue the "Why? #N" count in the caption kit. · *Why:* students share
what's on their syllabus, named up front (@mathsy.uk, L23); a numbered series gives a reason to follow (L14). · *Check:*
the header and the caption's first line. · 🧪 L14, L23

**F20 · End on the idea, then "Follow for more".** One takeaway line + the call to action, on the same soft board; no
handle and no website on screen (viewers tap the name), no exam question at the end: the PYQ lives in the caption. ·
*Why:* founder's calls (12 Oct: no handle, no extra lines; 13 Oct: the white end card fades into the board); an MCQ at the
end felt like homework (founder, on @pyqvault_). · *Check:* the end card. · 📌 founder

---

## Changing the framework

1. **Every change has a reason.** Add, change or drop a point only with a line in the change log below: what changed,
   why (our numbers with their L-number, an account we studied, or the founder's call), and which lesson measures it.
2. **A founder's call goes in at once** (📌 or 🧪) and gets a lesson in `learnings.md` that measures it.
3. **Our numbers decide.** A 🧪 point becomes ✅ when at least 3 @lws.pune reels that follow it beat the typical reel on its
   measure at 48 h; it's dropped (and logged here) when at least 3 reels show no gain. Read after every 48 h update. A
   result on @pyqvault_ is a reason to try a change here, never proof on its own.
4. Points keep their number when others are dropped. A new point that's the same idea as a @pyqvault_ point takes that
   number; a point only this account has takes the next number free on **both** (so they never clash).

## Change log

| Version | Date | Change | Why |
|---|---|---|---|
| v1 | 2026-10-20 | Framework created: @pyqvault_'s v1.4 points, numbered the same, adapted to @lws.pune: F1 concepts first (a PYQ in the caption when one fits), F21 with the NDA-chapter gate, F9 zoom the picture not text, F12 white kept, F13 a different style each reel, F18 up to ~45 s for "why" builds, F19 exam + chapter label, F20 "Follow for more" with no website. Rules that already stood (one question per reel, no made-up numbers, faceless, Remotion, the 3:4 cover) folded in. | Founder: "make similar things for @lws.pune". Each adaptation comes from this account's own lessons (L3, L5–L7, L11, L13, L14, L17, L23, L25) or the founder's call (concepts first, 20 Oct). First reel already made this way: 015 (f and f′ together). |
