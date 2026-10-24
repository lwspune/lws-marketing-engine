# @lws.pune reel framework (v1.9, 2026-10-24)

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
proof (−1–3, from their views multiple; a known flop, under 1×, is −1) + vivid (0–3) + a 2-second question (0–2) + concept live (0–1) + everyday hook
(0–1), with @pyqvault_'s written anchors. **Gate:** NDA maths chapters only. No exam-weight criterion: the gate already
keeps it on the syllabus, and the reel's job is reach (except F32's weekly Probability and Statistics reels). `node reels/tools/topic-scores.js lwspune` checks the table and
names the next pick. **Map reels (F28) are picked by exam weight instead.** · *Why:* the same choice whoever makes it, and testable; the criteria are F1–F4's reasons as
numbers. · *Check:* the tool passes (`tests/topic-scores.test.js` also checks the real table). · 🧪 L39

**F2 · Vivid first.** The whole screen moves and changes: curves drawing, many strips or points at once, colour that
follows the numbers, something new every second. · *Why:* constant motion holds people even at 60 s; still moments lose
them (@ubilumapp, L13; our own exit at 5–7 s, L3); @pyqvault_'s 3 busiest reels were its top 3 (L30). · *Check:* the frame
strip: something new every second, across the frame. · 🧪 L38

**F3 · The concept shown live.** A moving picture + numbers that change with it + a graph that draws itself (a tangent
sliding while f′ plots below; strips filling an area while the sum counts up). · *Why:* one formula + one moving picture
+ live numbers is what the big simulation reels share (@sciencevisualised L19, @bisal.physics L20). · *Check:* the reel
has all three; a map reel (F28) shows a whole chapter instead. · 🧪 L38

**F31 · Storyboard first, reviewed by an independent agent.** Before any code, the reel gets a written storyboard,
`reels/<slug>.storyboard.md` (template in `lwspune-storyboard.md`): the idea in one sentence, the viewer and the trap,
the question with **everything needed to answer it on frame 0**, frame 0 and the cover, the beats, a layout map (which
zone holds what, which side of each line its label sits on, what stays in frame at each zoom, the widest value in each
number box), the story told without words, every on-screen number and its test, and the risks. Then one fresh agent that
didn't write it reviews it (the brief in `lwspune-storyboard.md`, nothing else from the session) as a first-time NDA
aspirant and as a maths teacher. Every blocker is fixed or declined with a reason in the storyboard's Review section
before the tests and code are written. The founder still judges finished reels only. · *Why:* the founder (2026-10-23:
"storyboarding be better; one independent agent should review the story"). 018–020 surfaced seven faults only after
building (an empty frame 0, label collisions, a cropped punch-in, a cell off-screen, numbers running together, and a
question whose matrix wasn't on screen), each a re-render; 016 was rejected as "confusing". A reader who didn't write the
story sees the confusion its writer can't. · *Check:* the storyboard, with its Review section filled, is committed before
`src/lib/<reel>.ts`; L63 counts the faults found after the review. · 📌 founder, measured by L63

**F32 · Probability and Statistics every week.** One Probability reel and one Statistics reel each week, the best open
idea in that chapter (`remake-backlog.md`, ideas named "Probability · …" / "Statistics · …"), whatever F21's overall score
says; the rest of the week stays with F21. Each chapter keeps at least 2 ideas waiting. · *Why:* the founder (2026-10-24:
"they are the most important NDA maths topics"). Probability is the biggest chapter now (41 of the last 360 questions,
first in each of the last 3 papers) and Statistics is #3 over all 19 papers. F21 alone would rarely pick them: almost no
proven remakes exist for either, and 010 and 017 stayed with followers (L58). · *Check:* `node reels/tools/topic-scores.js
lwspune` prints "This week's core reels" and fails when a chapter has fewer than 2 ideas to make. · 📌 founder, measured by L68

**F33 · Probability and statistics are watched happening.** The chance is something you see: balls, darts, dice, tosses
or marks doing it on screen, many times, and the answer read off the picture (a share of an area, a pile's height, a line
settling, a seesaw levelling). The formula comes last, as the name for what was just seen. No word cards, no
formula-first walk-throughs. · *Why:* the founder (2026-10-24: "there are beautiful ways to visualize probability … you are
not able to make probability as much visual"). Our own: 017 (word cards on a map) was watched 3.5 s, the lowest of any
recent reel, and 016 (formula-led) was rejected as "confusing"; 010, the one with 360 real rolls racing, was watched 8.0 s.
Other accounts: simulations travelled (Monte Carlo darts 2.9×, Monopoly dice 4×), explainers flopped (bell curve 0.6×,
Bayes 0.1×, mean/median/mode 0.3×). · *Check:* the topic-score tool refuses a core idea with vivid under 2 or no concept
live; the storyboard's frame 0 shows the objects, not a sentence. · 📌 founder, measured by L68

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

**F24 · Bright objects.** Every key object (the curve being drawn, the strips, the points, a 3D figure) takes a colour
from `VIVID` (`remotion/src/lib/palette.ts`, the white set on the white board); things the viewer must tell apart get
different colours; no grey or beige objects we invent. An everyday object people know by its material keeps it (a steel
spoon stays steel). Text, axes and grid keep the WHITE palette, so words keep their contrast. ·
*Why:* founder, 2026-10-21: "more vivid colour objects". Our busiest, most colourful reels did best (L30), and on the white board pale objects vanish: Physics #8's first cream candle and its image were nearly invisible (the same rule as @pyqvault_'s F24). · *Check:* `remotion/tests/palette.test.ts` (each VIVID colour saturated ≥ 0.65, ≥ 3:1 on its board, ≥ 20° of hue from the others); the beat table names each key object's VIVID colour (runbook step 1); the stills sheet shows nothing grey or washed out. · 🧪 L47

**F9 · Zoom in and out at 3–4 moments, on the picture.** A slow push in while something builds, a quick **punch-in on the
big moment**, a zoom out to show the result (`CAMERA` keys, `tween` in `motion.ts`). **Zoom the picture, not text:** keep
the question and labels still. · *Why:* a change of view restarts attention (founder); text under a slow zoom shimmers
and looked jerky to the founder (L11). · *Check:* tests: at least 2 zooms in and 1 out, no jump between frames, a
punch-in on the big moment. · 🧪 L38

**F22 · The orbit is the hook: every 3D reel opens with one.** From frame 0 the camera goes **all the way round the object, a full 360°** (front, side, back, side, front), eased in and out with no whoosh, while the question is up, and it **ends back at the front, the explaining view, by 3 s**, before anything is explained. One orbit per reel, in the opening only (no closing orbit, never during a punch-in). Written as a third camera value (orbit angle) on the same `CAMERA` keys. **Not for 2D reels** (founder, 2026-10-20: tried on @lws.pune 016, "doesn't look good"): a flat reel opens with its picture building from frame 0 instead (F5). 3D reels are the solids, surfaces and 3D geometry topics. · *Why:* the founder (2026-10-20): the orbit
is the hook, so it belongs in the first 3 s; it shows the 3D's depth and gives motion from frame 0 (reel 014 opens
with one, L25). Back at the front by 3 s because an angle or a slope only reads from one view. · *Check:* the reel's
tests (the orbit starts at frame 0, turns exactly 360°, ends at the front by 3 s, no jumps, no other orbit). · 📌 founder,
measured by L38

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
leave each with half the evidence. A map reel's two flips to the indigo board (F28) are pattern breaks, not a second board. · *Check:* the background goes in the Background column of the results table. · 📌
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

## Map reels (a series, on test)

**F28 · A whole chapter on one map, ending on a frame worth a screenshot.** For the chapter with the most NDA maths
questions now (the PYQ Vault guide's trends: the last 3 papers), not by topic score (F21). Frame 0: the question of
which chapter (F4) over the map already up and small: a hub with **?**, one spoke and one empty card per idea, each in
its own VIVID colour (F24). The answer lands on the hub; then the camera goes close on each card in turn while its formula
writes in, with a one-line "when to use it" caption (F7). **Two flips** to the indigo board with a real number or a real
trap, at most 1.5 s each. Then the zoom out to the **whole map, every card written, held ≥ 3 s** with "Screenshot this" and
"Follow for more" in place of the question (F20), and in the last 0.5 s the cards empty and the camera returns to frame
0's view, so the reel **loops**. Every formula is tested (F10); ≤ 25 s (F18). Replaces F3's moving graph: the motion is
the camera between cards. Template: `remotion/src/Reel017.tsx` + `src/lib/reel017.ts`. · *Why:* the founder
(2026-10-21: "the most important NDA maths topic", after studying a formula-map reel). Saves are our weakest number
(typical 3) and a whole chapter on one frame is made to be saved; the studied reel held its full map 3.4 s with
"Screenshot this", flipped to black at its two "but…" moments, and opened on its own end frame with the labels hidden.
· *Check:* `tests/reel017.test.ts` (the chapter count re-derived from the snapshot, each paper = 120; each formula by
counting dice outcomes; cards never overlap or crop while explained; the hold ≥ 3 s; last frame = frame 0). · 🧪 L57

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
| v1.9 | 2026-10-24 | F32 added: one Probability and one Statistics reel every week, picked within the chapter (F21's second exception, after F28). F33 added: probability and statistics are watched happening, the formula last. 11 core ideas added to `remake-backlog.md` (W18–W28); the topic-score tool prints the week's core picks and checks both points. | Founder, 2026-10-24: "add probability and statistics … they are most imp nda maths topics"; "there are beautiful ways to visualize probability. i think you are not able to make probability as much visual". Measured by L68. |
| v1.8 | 2026-10-23 | F31 added: a written storyboard (`reels/<slug>.storyboard.md`, template in `lwspune-storyboard.md`) before any code, reviewed by one independent agent; every blocker fixed or declined in writing before the build. | Founder, 2026-10-23: "for future reels storyboarding for lwspune be better. one independent agent should review the story." Seven faults in 018–020 were found only after building; one of them (020's question matrix not on frame 0) made the question unanswerable. Measured by L63. |
| v1.7 | 2026-10-21 | F28 added: map reels, a series picked by exam weight (F21's exception), a whole chapter on one map in place of F3's moving graph, two indigo flips (noted under F12), the full map held for a screenshot and looping to frame 0 in place of the end card. First: 017, Probability (41 of the last 360). | Founder, 2026-10-21: a reel like a studied formula map, "for the most important NDA maths topic", approved with these three changes. Measured by L57 (saves). |
| v1.6 | 2026-10-21 | F24: an everyday object people know by its material keeps it; the rest stays vivid (as @pyqvault_ v1.13). | Founder, 2026-10-21, comparing Physics #8's two versions: "original spoon colour was better, rest vivid is better". A steel spoon in cyan stopped looking like a spoon; the bright candle, rays and graph read better. |
| v1.5 | 2026-10-21 | F24 added: bright objects from the `VIVID` set, as on @pyqvault_ (v1.12). | Founder: "more vivid colour objects", for both handles. Measured by L47. |
| v1.4 | 2026-10-20 | F21: a known flop (under 1× their typical reel) scores −1 and loses a tie to an untested idea (the same tool as @pyqvault_ v1.10). No @lws.pune row changes. | Founder, 2026-10-20: the Ray Optics search found ideas that flopped for other accounts (prism 0.5×, mirage 0.4×, sliced lens 0.9×) scoring the same as untested ones, and winning ties against them. A flop is evidence against, so it costs a point; in a tie, no evidence counts as 1×. |
| v1.3 | 2026-10-20 | F22: the orbit stays for 3D reels only; 2D reels open with their picture building from frame 0. | Founder: a 3D opening (360° turn settling into the flat grid) was built for @lws.pune 016 and dropped the same day: "doesn't look good". |
| v1.2 | 2026-10-20 | F22: the orbit is the hook. Every 3D reel opens with a full 360° orbit, from frame 0, ending at the explaining view by 3 s; no closing orbits. From 🧪 to 📌. | Founder: "orbit is hook and should be there in first 3 sec", for @pyqvault_ and @lws.pune; "make it 360 degree orbit" (was 60–120°). Reels already made are left as they are (founder). |
| v1.1 | 2026-10-20 | F21: ties go to the bigger views multiple, then the concept shown live, then table order (the same tool as @pyqvault_). | Same reason as @pyqvault_ v1.6: a tie with equal proof was settled by table order. |
| v1 | 2026-10-20 | Framework created: @pyqvault_'s v1.4 points, numbered the same, adapted to @lws.pune: F1 concepts first (a PYQ in the caption when one fits), F21 with the NDA-chapter gate, F9 zoom the picture not text, F12 white kept, F13 a different style each reel, F18 up to ~45 s for "why" builds, F19 exam + chapter label, F20 "Follow for more" with no website. Rules that already stood (one question per reel, no made-up numbers, faceless, Remotion, the 3:4 cover) folded in. | Founder: "make similar things for @lws.pune". Each adaptation comes from this account's own lessons (L3, L5–L7, L11, L13, L14, L17, L23, L25) or the founder's call (concepts first, 20 Oct). First reel already made this way: 015 (f and f′ together). |
