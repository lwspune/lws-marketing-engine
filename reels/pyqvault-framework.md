# @pyqvault_ reel framework (v1.8, 2026-10-20)

How every @pyqvault_ reel is made, one numbered point at a time. The founder's standard (2026-10-20): **every point has a
reason**, and **no point is added, changed or dropped without one**. We keep tuning it with real numbers until it wins.
Account settings (captions, hashtags, posting times) live in `pyqvault-insta.md`; the numbers and lessons behind each
point live in `pyqvault-learnings.md` (the L-numbers below).
@lws.pune has its own framework, `lwspune-framework.md`: the same idea keeps the same F-number on both.

**Status:** ✅ proven by our own numbers · 🧪 on test (the L-number measures it) · 📌 standing rule: the founder's call or
a house standard (kept until our numbers say otherwise)

**Winning means:** beating the typical @pyqvault_ reel at 48 h. Today that's **133 views · 5.2 s watched · 0 saves ·
0 comments** (9 reels, 2026-10-20). Watch time comes first: Instagram only shows a reel to more people when the first
viewers stay.

---

## Topic

**F1 · Remake a proven idea.** Pick from `remake-backlog.md`: ideas that already went viral for other creators,
remade our way. · *Why:* someone else's views prove people want it; our first reels were all remakes, and the best did
2× the worst (L27). · *Check:* the backlog row has the proof link. · 📌 founder, 2026-10-18

**F21 · Pick by topic score.** Each open idea is scored out of 10 in `remake-backlog.md` → **Topic scores**: proof
(0–3, worked out from their views multiple) + vivid (0–3) + a 2-second question (0–2) + law live (0–1) + everyday hook
(0–1), each with written anchors. The subject that's due (P → C) takes its highest open score, a tie going to the bigger views multiple, then to the idea that shows its law live (F3); `node
reels/tools/topic-scores.js` checks the table and names the next pick. **No exam-weight criterion:** the goal is
engagement and reach (founder). **No repeats:** a concept already made is not picked again, even under a new angle;
its row is parked with the reel it repeats (founder, 2026-10-20). · *Why:* the criteria are F1–F4's reasons turned into numbers, so the choice is the same
whoever makes it, and L35 can test whether the score predicts results; the everyday hook is for reach beyond students
(@mathsy.uk's #1 is a soda can, 2.7M). · *Check:* the tool passes (`tests/topic-scores.test.js` also checks the real
table). · 🧪 L35

**F2 · Vivid first.** The whole screen moves and changes colour: many objects at once (molecules, elements,
particles), bold colour changes, something new every second. If a topic can only show one thing moving, add what's
around it (many copies, a live chart, colour that follows the numbers) or pick another. · *Why:* our 3 most-viewed reels
are the 3 busiest (Boyle 263, calculus 226, the 8 families 194 views); the quiet ones got half that (L30). · *Check:* look
at the frame strip: is something new happening every second, across the whole frame? · 🧪 L30

**F3 · A law shown live.** A live simulation + live numbers that change with it + a graph that draws itself. · *Why:*
@bisal.physics and @codematrixvishal's law reels are their best category (L20, L27); our top reel is Boyle's law, live. ·
*Check:* the reel has all three. · 🧪 L27

## Hook (the first 3 seconds)

**F4 · Ask first (predict-first).** Frame 0 asks a question the viewer can answer in two seconds, with A/B/C and
"comment your guess 👇" (`PredictHeader`); the picture settles it and the right option lights. The caption's first line
repeats it. · *Why:* the account that asks gets 3.3 comments per 1,000 views, everyone else 0–1 (L28); our first 8
reels got 0 comments. · *Check:* the question + options are on the first frame. · 🧪 L28

**F5 · Question in front, picture already moving behind it.** No still frames in the first 3 s: no title card, no
still scene under the question. · *Why:* viewers left by 3–6 s, during the 2.6 s still title card (L29); seeing something
happen before you know why makes you stay (founder, L31). · *Check:* a test that something changes on every frame of
the first 3 s. · 🧪 L29, L31

**F6 · The cover never gives the answer away.** Take it before the reveal; cover text like "Guess before you
watch". · *Why:* the guess is the hook; a cover with the answer kills it. · *Check:* cover time is before the answer
lights and no answer number is on screen. · 🧪 L28 (part of predict-first)

## Picture

**F7 · More picture, less text.** On-screen text is short labels, one line at a time, ≤ 7 words; no derivations, no
formula walls. Live numbers that change with the picture (speed, rate, energy bars) count as picture. · *Why:* the picture carries the idea; text competes with it in a 3-second decision. · *Check:* the reel's
tests count words per caption line. · 📌 founder, 2026-10-18

**F8 · Rounded shapes.** No sharp corners where we can avoid them: blocks, planks, knobs and posts are rounded
(`RoundBox` in `remotion/src/shapes.tsx`) or round (cylinders, spheres); UI bars and pills have round ends. The 3D
area **fades into the board at its edges** (`softEdges`) instead of a hard crop line, which shows as soon as the camera
zooms in. · *Why:*
soft shapes look friendlier and more premium (founder); a straight crop line is a corner too (seen on the first
renders of the remakes). · *Check:* no `boxGeometry` in the reel's file; the frame strip shows no hard edge. · 🧪 L33

**F9 · Zoom in and out at 3–4 moments.** A slow push in while something builds, a quick **punch-in that lands on
the big moment**, a zoom out to show the result. Written as tested keys (`CAMERA`, `tween` in `motion.ts`). · *Why:* a
change of view restarts attention and makes the big moment feel big (founder). · *Check:* tests: at least 2 zooms in and
1 out, no jump between frames, a punch-in on the big moment. · 🧪 L33

**F22 · The orbit is the hook: every 3D reel opens with one.** From frame 0 the camera goes **all the way round the object, a full 360°** (front, side, back, side, front), eased in and out with no whoosh, while the question is up, and it **ends back at the front, the explaining view, by 3 s**, before anything is explained. One orbit per reel, in the opening only (no closing orbit, never during a punch-in). Written as a third camera value (orbit angle) on the same `CAMERA` keys. · *Why:* the founder (2026-10-20): the orbit is the hook, so it belongs in the first 3 s; it shows the
depth of the 3D we build and gives motion from frame 0 (F5). Back at the front by 3 s because a slope's angle, arrows
and gauges only read from one view. · *Check:* the reel's tests (the orbit starts at frame 0, turns exactly 360°, ends at the front by 3 s, no jumps, no other orbit). · 📌 founder, measured by L37

**F10 · Honest.** The physics and maths are re-derived in tests; never fake counts, proportions or effects; label any
scale change ("zoomed ×10⁹"). · *Why:* a wrong reel on an exam account costs trust we can't buy back; it's the no-slop
rule. · *Check:* the reel's tests re-derive the answer. · 📌 founder

**F11 · Smooth, frame-exact video (Remotion).** Real three.js 3D, timeline as pure functions of t in
`src/lib/<reel>.ts`, tests first. Template: `remotion/src/PvPhysics004.tsx` + `src/lib/pp004.ts` (the first reel with
every point of v1). · *Why:* the old engine dropped frames, worst in the first second (L25); the founder
judged Remotion "far better". · *Check:* rendered by `npm run render:<reel>`. · 📌 founder, 2026-10-18

**F12 · Dark or white background: on test.** Alternate `LAB` (dark: wrap the reel in `<Theme value={LAB}>`) and
`WHITE`, balanced across subjects. · *Why:*
the fastest-growing science accounts are dark, ours started white; the data decides (L22). So far dark leads (median
watch 5.6 s vs 3.3 s, 4 reels each) but the slots were tangled. Called once each side has ≥ 6 posted reels. · *Check:*
the L22 rotation; the background goes in the Background column of the results table. · 🧪 L22

## Sound

**F13 · Music made in code, picked by mood.** Energetic styles (`drive`, `synthwave`, `cinematic`, `trap`), never the
same style twice in a row. By mood: simulations and motion → `drive` or `synthwave`; build-up reveals → `cinematic`;
dark or dramatic → `trap`. **While L34 runs:** among the styles that fit the mood, take the one with the fewest posted
reels (cinematic, lofi, drive, synthwave, trap), so each gets a fair count. 1–3 `music.hits` on the picture's big beats.
Voice: see F23. · *Why:* no licence risk, and a hit on
the big beat makes it land; Claude picks, the founder judges the finished reel. Which style holds viewers best is now measured (L34): the first 8 reels hint
that cinematic and lofi beat drive, synthwave and trap. · *Check:* `music/<reel>.json`; the style goes in the Music column
of the results table. · 🧪 L34

**F14 · The experiment's own sound.** Effects for what's on screen, made in code from the reel's timeline (`SOUND`
score, `src/lib/sfx.ts`): e.g. a ratchet click per degree, the friction scrape while a block slides, a burner's roar,
molecules tapping a lid. **Only what the picture shows** (a gas being heated doesn't boil, so no boiling sound). · *Why:*
sound in sync with the picture makes it feel real (founder). · *Check:* tests put each sound on its event (a click at
each whole degree, every tap at a real lid hit). · 🧪 L33

**F15 · A whoosh only on fast zooms** (≤ 0.9 s): rising for in, falling for out; slow drifts stay silent. · *Why:* a
whoosh on every move is noise (founder: "if appropriate"). · *Check:* `whooshesFor`, tested. · 🧪 L33

**F16 · The mix.** The music dips under the effects and comes back; effects sit 5–10 dB under the music's body;
peak ≤ −3 dB (limiter only on loud moments). · *Why:* the effects are heard without fighting the music; one level for
every reel. · *Check:* `npm run mix:<reel>` prints the levels; `check-video.mjs` on the MP4. · 📌 house standard

**F23 · Voiceover: on test.** A free, offline AI voice (Kokoro, `af_heart`, Apache 2.0) reads **only words already on
screen, while they are on screen**: the question from frame 0, then each caption just after it appears. The music drops
~8 dB under it. Each test reel is also rendered silent, and the founder picks which one goes out. The caption says
"🔊 Voice: AI narrator". · *Why:* many viewers do listen, and a voice may hold them through the first seconds (L29);
it costs no money and nobody records their voice (faceless). Limited to on-screen words so the reel still works muted
(F17). · *Check:* the reel's tests (`onScreen`: every line's words are on screen for its whole slot, no overlaps);
`npm run voice:<reel>` stops if a line runs past its slot. · 🧪 L43

**F17 · It still works with the sound off.** Every idea is on screen. · *Why:* many people scroll muted; the account
is faceless and silent-first. · *Check:* watch it muted. · 📌 founder

## Shape

**F18 · Short.** ≤ 25 s for predict-first reels; ~25–35 s otherwise. · *Why:* viewers left within seconds (L29); a
short reel is watched to the end more often. · *Check:* the reel's tests. · 🧪 L29

**F19 · A numbered series, physics and chemistry only.** "Physics / Chemistry, visualised #N", alternating P → C. No
maths on @pyqvault_ (founder, 2026-10-20): maths ideas go to @lws.pune. · *Why:* physics and chemistry have the better
visual content (founder; our top reels are Boyle and the 8 families, L30), and maths has its home on @lws.pune; a numbered
series gives a reason to follow and come back (L14; @ubilumapp's numbered series top their chart). · 📌 founder, 2026-10-18

**F20 · End on the idea, then the end card with `pyqvault.com`.** No exam question on screen at the end; exam
relevance lives in the caption. · *Why:* an MCQ at the end felt like homework (founder); the website is where a follower
becomes a user. · *Check:* the end card. · 📌 founder, 2026-10-18

---

## Changing the framework

1. **Every change has a reason.** Add, change or drop a point only with a line in the change log below: what changed,
   why (our numbers with their L-number, an account we studied, or the founder's call), and which lesson measures it.
2. **A founder's call goes in at once** (📌 or 🧪) and gets a lesson in `pyqvault-learnings.md` that measures it.
3. **Our numbers decide.** A 🧪 point becomes ✅ when at least 3 reels that follow it beat the typical reel on its
   measure at 48 h; it's dropped (and logged here) when at least 3 reels show no gain. Read after every 48 h update.
4. Points keep their number when others are dropped, so old notes still point to the right one; new points take the
   next free number.

## Change log

| Version | Date | Change | Why |
|---|---|---|---|
| v1 | 2026-10-20 | Framework created from the house settings (F1, F3, F4, F6, F7, F10–F13, F17–F20) plus today's points: F2 vivid first, F5 question in front of a moving picture, F8 rounded shapes, F9 zooms, F14 the experiment's own sound, F15 whooshes on fast zooms only, F16 the mix. | Founder: a standard framework, every point with a reason. Today's points come from the first 8 reels' numbers (L29, L30) and the founder's calls (L31, L33). First reels made with all of it: the remakes of Physics #4 and Chemistry #4. |
| v1.1 | 2026-10-20 | F13 music: from 📌 to 🧪 L34; fair rotation between five styles while the test runs; style logged per reel. | Founder: track music performance. The first 8 reels hint the opposite of F13's "energetic first" (cinematic and lofi on top, drive/synthwave/trap at the bottom), too weak to change the rule, enough to measure it. |
| v1.2 | 2026-10-20 | F12 background: a Background column per reel and a rule for when to call it (≥ 6 posted reels each side, median watch time first). | Founder: track dark vs white. The test (L22) had a rotation but no column and no finish line, so it could run forever or be called on a hunch. |
| v1.3 | 2026-10-20 | F21 added: pick by topic score (proof, vivid, question, law live, everyday hook). F1's backlog is now ranked by it. | Founder: a mechanism to choose topics, aimed at engagement and reach, so no exam weight. The backlog's order was set on 18 Oct, before L30; a written score makes the choice repeatable and testable (L35). The everyday hook is Claude's addition, with its evidence. |
| v1.6 | 2026-10-20 | F21: a second tie-break, the law shown live (F3), then table order. 12 new ideas from PYQ Vault's MHT-CET notes (P13–P18, C12–C17). | Two chemistry ideas with no proof tied at 6 and the tool fell back on table order, which is arbitrary; F3 is our best category (L27). Founder: look at the CET notes for better ideas; chemistry had no strong idea left (best 6/10), now three at 7. |
| v1.5 | 2026-10-20 | F19 and F21: physics and chemistry only (P → C); the maths series closed, its open ideas to @lws.pune. F21's tie-break reads "better-proven" as the bigger views multiple. | Founder: physics and chemistry have the better visual content; maths goes to @lws.pune (completing the square → W16). Measured by L41. The tie-break: the tool compared proof points only, so 63× and 54× tied, against the rule's wording. |
| v1.4 | 2026-10-20 | F22 added: one orbit shot in 3D reels, 60–120°, opening or closing only, back at the explaining view before the key moment. | Founder's idea (an arc round the object). Kept on test with limits because our reels explain from a fixed angle. First reel: Chemistry #5; Physics #5 (no orbit) is the comparison (L37). |
| v1.7 | 2026-10-20 | F23 added: voiceover on test (Kokoro, on-screen words only, a silent render alongside); F13's "no voice (voiceover parked)" now points to it. F21: no repeats. | Founder: try a free voiceover on @pyqvault_ (the ElevenLabs own-voice plan of 15 Oct stays parked); measured by L43. No repeats: C12 (heat → rate) was next but repeats Chemistry #1; founder's call. First voiced reel: Chemistry #7, half-life. |
| v1.8 | 2026-10-20 | F22: the orbit is the hook. Every 3D reel opens with a full 360° orbit, from frame 0, ending at the explaining view by 3 s; no closing orbits. From 🧪 to 📌. | Founder: "orbit is hook and should be there in first 3 sec", for @pyqvault_ and @lws.pune; "make it 360 degree orbit" (was 60–120°). Reels already made are left as they are (founder). |
