# @pyqvault_ reel framework (v1.26, 2026-10-22)

How every @pyqvault_ reel is made, one numbered point at a time. The founder's standard (2026-10-20): **every point has a
reason**, and **no point is added, changed or dropped without one**. We keep tuning it with real numbers until it wins.
Account settings (captions, hashtags, posting times) live in `pyqvault-insta.md`; the numbers and lessons behind each
point live in `pyqvault-learnings.md` (the L-numbers below).
@lws.pune has its own framework, `lwspune-framework.md`: the same idea keeps the same F-number on both.

**Status:** ✅ proven by our own numbers · 🧪 on test (the L-number measures it) · 📌 standing rule: the founder's call or
a house standard (kept until our numbers say otherwise)

**Winning means:** more **views and watch time** than the typical @pyqvault_ reel at 48 h (founder, 2026-10-22: "views is
the main goal because we want to reach the maximum audience… watch time as well"; comments come later). The two go
together: Instagram shows a reel to more people when the first viewers stay. The bar today is the five framework reels of
20–21 Oct: **1,429 views · 8.4 s watched** (median, read at 6–36 h; the pre-framework reels were 119–269 views, 3–7 s).
`topic-scores.js pyqvault --calibrate` replaces it with the 48 h median once enough reels are read at 48 h.

---

## Topic

**F1 · Three sources: a proven remake, a PYQ Vault concept, or the founder's idea.** Every reel is made from the idea
list, `pyqvault-ideas.md` (founder, 2026-10-21): ideas that already went viral for other creators, remade our way;
concepts from PYQ Vault's own notes (the MHT-CET and JEE Main physics and chemistry chapters); or a concept the founder
brings (Source `founder`). The last two pass F28; every idea passes the list's test. Each row names its Source. · *Why:* someone else's views prove people want it; our first reels were all remakes,
and the best did 2× the worst (L27). But the proven supply runs dry (chemistry had none left beyond the gas laws), the
notes are PYQ Vault's own (every concept is one a student will meet), and the founder knows the students (founder,
2026-10-21). · *Check:* a remake's row has the proof link; every row has a Source (`topic-scores.js`). · 📌 founder,
2026-10-18; notes and founder concepts 🧪 L59

**F21 · Pick by a score that our results tune.** Each idea in `pyqvault-ideas.md` is scored out of 100: each criterion's
points × its weight, over the best possible. Criteria (anchors in the list's Scoring table): proof (−1–3, from their
views multiple; a known flop, under 1×, is −1) · vivid (0–3) · guess (0–2) · surprise (0–2: is the obvious answer
wrong?) · law live (0–1) · everyday (0–2). The subject that's due (P → C) takes its highest open score, a tie going to the
bigger views multiple, then to the idea that shows its law live (F3). **The weights are tuned at every analysis**
(founder, 2026-10-21): `topic-scores.js pyqvault --calibrate` compares each posted reel's score with its 48 h result
(watch time and views against the typical reel), reports how well the score ranks them, and moves a criterion's weight
by 0.5 when its high scorers beat its low scorers by 20% or more (at least 3 reels a side, 6 in all; never when the
split lines up with a background, music, voice or hook); each run is logged in the list. **No exam-weight criterion:**
the goal is engagement and reach (founder). **No repeats:** a concept already made is not picked again, even under a
new angle; its row is parked with the reel it repeats (founder, 2026-10-20). · *Why:* the criteria are F1–F4's
reasons turned into numbers, so the choice is the same whoever makes it; a fixed score can only be judged, a tuned one
learns which criteria actually bring watch time and views on our account. Surprise is there because our comments are
still 0 and a wrong first guess is what makes people comment (L28); everyday widened because the spoon, the wing mirror
and the soda can were the everyday ideas (@mathsy.uk's #1, 2.7M). · *Check:* the tool passes
(`tests/topic-scores.test.js` also checks the real list); the calibration log has a row for every analysis. · 🧪 L35

**F28 · A notes or founder concept earns its row.** A concept from the notes or from the founder (F1) is curated
against the framework before it's scored (a founder idea that fails a point comes back with a version that passes, or the
reason it can't; the founder decides): physics or chemistry (F19), not a repeat (F21), labels of 7 words or fewer with no derivation (F7), true without
faking anything (F10), works muted and fits ≤ 25 s (F17, F18). While it's open or queued it must also pass **the gate**:
Guess 2, a 2-second A/B/C guess (F4), and Vivid ≥ 2 (F2); one that fails is parked with the
reason. Every chapter read goes in the idea list's **Concept sweep** log with what it added and what it left out (and which
point kept it out), so no chapter is read twice; a JEE Main chapter with an MHT-CET namesake is logged as covered. ·
*Why:* a remake's proof shows people want it; a notes concept has no proof, so the two things our numbers say matter
most, the guess (L28) and a busy picture (L30), have to be there from the start. Most of the notes are sums and recall
with nothing to watch; the log stops anyone wading through them again. · *Check:* `topic-scores.js` refuses an open or
queued non-remake row with Guess < 2 or Vivid < 2, a notes Source not in the Concept sweep, or a chapter logged twice
(`tests/topic-scores.test.js`). · 🧪 L59

**F29 · Explained without a single word.** The test of a good concept (founder, 2026-10-21): take every word out of the
reel (the question, the labels, the captions) and the picture alone still shows **what happens and why**. Motion, colour,
arrows, gauges, bars, graphs, numbers and chemical symbols count as picture, as in F7; words don't. The words stay in the
reel (the guess, F4; short labels, F7), but they only point at what the picture already shows. It applies to every source,
remakes included: proof shows people want a topic, not that the picture can carry it. A concept whose "what" shows but
whose "why" needs telling (liquid oxygen sticks to a magnet, but unpaired electrons need words) fails. · *Why:* the
founder's call; it is F7 (more picture, less text) and F17 (works muted) taken to the concept itself, and viewers decide
in 3 seconds, too fast to read an explanation. · *Check:* the Wordless column in the idea list (✓ / ✗) and each card's **Without words** beats: `topic-scores.js`
refuses an open or queued ✗ row; when the reel is made, the stills sheet is read once with the text hidden
(`visual-reel-workflow.md` step 5). · 📌 founder, 2026-10-21

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

**F6 · Neither the cover nor the caption gives the answer away.** Take the cover before the reveal; cover text like
"Guess before you watch". The caption asks the question and says "Answer at the end of the reel 👀"; it explains the
idea without naming the answer (no "→ B"; Instagram, Facebook and YouTube alike). · *Why:* the guess is the hook; a
cover with the answer kills it, and so does a caption: the first two predict-first reels got 0 comments with the answer
printed under the question (L45). · *Check:* cover time is before the answer lights and no answer number is on screen;
`tests/caption-answer.test.js` checks every caption. · 🧪 L28 (part of predict-first), L45

**F25 · Rotate the hook and the opening picture.** The A/B/C guess (F4) stays on every reel; what rotates is the
**hook**, the angle of the question, and the **opening picture** of the first 3 s. No hook or opening twice in a row; the
orbit (F22) opens at most 2 of any 4 reels; each reel's pair is set in `pyqvault-ideas.md` → **Hook queue** before it's
made. Hooks, each with the reel that proved it for another account: **Race** (two or three set-ups already running:
which first?) · **Pick one** ("Pick one. Don't switch.": @ubilumapp's pick-a-number, 4.9 comments per 1,000 views, their
best rate) · **Ending first** (open on the strange result, then "how?") · **Everyday puzzle** (@sciencevisualised topspin
63×, bounce 52×; @mathsy.uk soda can 114×) · **You'd think** (the intuitive answer is wrong; never an invented "90 %
get this wrong") · **Spot the mistake** (one wrong ray or arrow; our own idea, no proof yet) · **Put in order**
(@sciencevisualised "Can you name all 8 chemical families?" 256×) · **Same start, two endings** (@bisal.physics "Same
compression. Same starting gas. Two completely different outcomes." 21×). A countdown ("3 seconds") may be added to any
of them, never on its own. Openings: Orbit 360° · Race running · Ending first · Zoom (scale; the scale goes in the caption,
F10) · Assemble (suit-up: parts fly in and lock together) · Split apart (an exploded view) · Morph · X-ray · Split screen ·
Colour flood · **Shock** (founder, 2026-10-23: a dramatic event from the topic inside the first second, seen before anything
can be read: a strike, a crash, a burst, a flash; real physics, any moment of the topic, not only its climax; explosions and
danger are judged by the founder case by case, never a real person hurt). **Out:** the exam badge ("JEE asked this"; founder, 2026-10-21).
· *Why:* watch time rose with the guess-first format (5.2 s → 7.4–9.5 s, L28/L31), but every reel now opens the same way;
followers would learn the pattern and stop. The hooks are the ones that beat their own account's typical reel in our
competitor data (`analytics/competitors/`); game hooks (pick one, solve this) bring 10–50× more comments per view than
explainer hooks, and our comments are still 0. · *Check:* `node reels/tools/hook-rotation.js` (`tests/hook-rotation.test.js`
also checks the real queue against the idea list); the reel's row gets its hook and opening in the Hook column. · 🧪 L48

**Every hook has a visual layer** (founder, 2026-10-21/22: "hook should always have a visual layer… it could also mean
orbit shot, objects splitting or coming together (just like an Iron Man suit). It's some visual which hooks the viewer's
attention"). The question stays in words (the guess, F4); alongside it, the first 3 s carry **a visual move that grabs the
eye**: the camera orbits or punches in, the object assembles itself part by part like a suit-up, splits apart into an
exploded view, morphs, floods with colour, or two set-ups race. It is the Opening, and the **Visual hook** column says
what we see it do. Best when the move also sets up the question (molecules splitting and streaming into two tubes), but
attention comes first. Word-led hooks (You'd think, Pick one) get a move like any other (Physics: an orbit round two lifts
hauling the same box, one racing ahead). · *Why:* viewers decide in 3 s, many with the sound off; a striking move is
seen before any words are read, and motion from frame 0 is what holds them (F5, L29, L31). · *Check:* the Hook queue's
Opening and **Visual hook** columns (`hook-rotation.js` refuses an empty visual hook, or one written as a question); the
storyboard's first row; the stills sheet's frames from 0–3 s, read with the text hidden. · 📌 founder, 2026-10-21

**F26 · A second hook at the answer.** As the first answer lands, the next question appears (≤ 7 words, F7), and the
reel's explanation becomes its answer: "Then which angle goes farthest?" (45°), "Swap them: copper rod, zinc liquid?"
(nothing happens). Other forms: the picture rules one option out halfway ("Not A"), or a near miss ("Almost…") just before
the answer. The second answer is re-derived in the tests like the first (F10). · *Why:* viewers leave at the answer:
Physics #4 answers at 9.7 s and is watched 9.5 s, Chemistry #4 at 9.0 s and 7.4 s (L48); the answer ends the curiosity,
so a new question has to open before it closes. **It has its own attention-grabbing visual** (founder, 2026-10-22: "second
should also have attention grabbing visual"): as the second question appears, the scene makes a striking move that sets
it up (a punch-in that splits a molecule again, the camera swinging to the power meters, a glass sliding into the empty
slot, a rope swinging steeper live, the rod and the liquid swapping places), so viewers see something new at the very
moment they'd leave. · *Check:* the Second hook and **Second visual** columns of the Hook queue (`hook-rotation.js`:
present, ≤ 7 words, a picture not a question); the reel's tests put the second question and its move on screen at the
answer. · 🧪 L49

**F27 · Loop or end card: on test.** Half the reels **loop**: the last second brings the scene back to its first frame
(the question returns, the tag stays, F20), with no end card, so a replay runs on without a seam. The other half end on
the end card as before. Never 3 the same in a row, both subjects on each side. · *Why:* a seamless replay adds watch
time and invites a second look at the guess; the end card is a hard stop that ends the view. Only viewers who reach the
end feel it, so it should pay off more once F26 keeps them longer. · *Check:* the Loop column of the Hook queue
(`hook-rotation.js`); in a looping reel, a test that the last frame matches frame 0's scene. · 🧪 L50

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

**F24 · Object colours: real, varied, in harmony, in contrast.** Founder, 2026-10-22: "by vivid I meant variety and
difference. Objects' colours should gel well and bring good contrast. Wherever possible they should be realistic." Four
parts, in this order:
1. **Real first.** Anything that has a real colour keeps it: copper is copper, zinc and steel are grey metal, a flame is
   orange-yellow, copper sulphate is blue, chlorine is yellow-green, gold is gold, a leaf is green. It has to look like the
   real thing (Physics #8: the steel spoon read better than a cyan one). The shades come from `REAL` in
   `remotion/src/lib/palette.ts` (15 materials, a fill and an edge of the same colour per board), so copper is the same
   copper in every reel; a material not there yet is added to it, with its test, before it's used.
2. **Variety where nothing is real.** Things with no real colour (particles, field lines, rays, arrows, energy bars, the
   options) take colours from `VIVID` (same file, the set for the board), and anything the viewer must tell apart gets a
   clearly different one: each ray its own, two gases in two colours. **It must stay different for colour-blind viewers**
   (about 1 in 12 men): every such pair passes `distinguishable()`. In VIVID, red–green, orange–yellow and blue–violet
   don't, so they never mark two things that must be told apart.
3. **They gel.** One reel keeps to a small family: the real colours plus a few VIVID ones that sit well with them (about 4
   key hues in a frame); the same thing keeps the same colour all reel long. No clashing pairs placed side by side.
4. **Contrast.** Every key object stands out from the board (≥ 3:1) and from what's next to it. A real colour that is too
   pale or too dark for the board (a glass beaker, a steel spoon on white) gets an edge, a shadow or a shade of its own
   colour, never a fake colour. The board stays calm and text keeps the WHITE / LAB palette, so words keep their contrast.
· *Why:* founder, 2026-10-21 then 2026-10-22: variety and difference, not brightness for its own sake; real colours
make the picture believable and quicker to read (the steel spoon), and a reel full of unrelated bright colours fights
itself. On the white board pale objects vanish: Physics #8's first cream candle and its image were nearly invisible.
· *Check:* `remotion/tests/palette.test.ts` (each VIVID colour ≥ 3:1 on its board, ≥ 20° of hue from the others; each REAL
material's fill or edge ≥ 3:1, the edge a shade of the fill; `distinguishable()` catches the colour-blind pairs); the
beat table names each key object's colour, real (from REAL) or VIVID, and lists the pairs that must be told apart, which
the reel's tests run through `distinguishable()` (runbook step 1); the stills sheet shows
nothing washed out, no two neighbours hard to tell apart, and no clash. · 🧪 L46

**F9 · Zoom in and out at 3–4 moments.** A slow push in while something builds, a quick **punch-in that lands on
the big moment**, a zoom out to show the result. Written as tested keys (`CAMERA`, `tween` in `motion.ts`). · *Why:* a
change of view restarts attention and makes the big moment feel big (founder). · *Check:* tests: at least 2 zooms in and
1 out, no jump between frames, a punch-in on the big moment. · 🧪 L33

**F22 · The orbit: one of the openings (F25).** When a 3D reel opens with the orbit (at most 2 of any 4 reels, F25), from frame 0 the camera goes **all the way round the object, a full 360°** (front, side, back, side, front), eased in and out with no whoosh, while the question is up, and it **ends back at the front, the explaining view, by 3 s**, before anything is explained. One orbit per reel, in the opening only (no closing orbit, never during a punch-in). Written as a third camera value (orbit angle) on the same `CAMERA` keys. **Not for 2D reels** (founder, 2026-10-20: tried on @lws.pune 016, "doesn't look good"): a flat reel opens with its picture building from frame 0 instead (F5). · *Why:* the founder (2026-10-20): the orbit is the hook, so it belongs in the first 3 s; it shows the
depth of the 3D we build and gives motion from frame 0 (F5). Back at the front by 3 s because a slope's angle, arrows
and gauges only read from one view. · *Check:* the reel's tests (the orbit starts at frame 0, turns exactly 360°, ends at the front by 3 s, no jumps, no other orbit). · 📌 founder, measured by L37 and L48

**F10 · Entertainment first, the result real.** The motto (founder, 2026-10-23): **entertainment through physics and
chemistry**; people on Instagram come to be entertained, not to learn. So anything that adds drama is in: slow motion,
replays, crashes, flashes, sparks, colour floods, camera shake, bigger stakes in the setting, sizes exaggerated. The one
floor: **the result and every number on screen are real**, re-derived in the reel's tests. No disclaimers on screen: "Objects
not drawn to scale" (or "time-lapse", "zoomed ×10⁹") goes in the caption. · *Why:* the viewers are Class 11–12 students
who sit exams, and the brand behind the reel is PYQ Vault: a wrong result costs them marks and costs us the trust leads come
from, while drama costs nothing true. · *Check:* the reel's tests re-derive the answer and every number shown; the caption
carries the scale note when sizes are exaggerated. · 📌 founder, 2026-10-23

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
sound in sync with the picture makes it feel real (founder). **Both hooks' moves have their sound** (founder, 2026-10-22),
from the kit in `sfx.ts`, still only what the picture shows: Assemble (suit-up) → a **snap** per part locking, pitch rising,
then a **shimmer** when it's complete · Split apart → a **crack** · Morph or swap → a **shimmer** · a fast punch-in →
**whoosh-in** (F15) · Colour flood → **shimmer** · a slow orbit or drift → **silent**, the music carries it (F15) · the
second hook's big beat → a **music hit** (F13). · *Check:* tests put each sound on its event (a click at each whole degree,
every tap at a real lid hit); the Hook queue's **Hook sound** and **Second sound** columns name only kit sounds
(`hook-rotation.js`, kept in step with `sfx.ts` by its test), and the reel's tests put them on their moves. · 🧪 L33

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

**F20 · "PYQ Vault · pyqvault.com" on screen from frame 0; end on the idea.** A small tag under the question from the
first frame, staying for the whole reel: smaller and quieter than the question (the question wins the 3-second decision)
but at least 4.5:1 against the board (WCAG AA), no "www.". A reel that doesn't loop (F27) still ends on the end card with
`pyqvault.com`. No exam question on screen at the end; exam relevance lives in the caption. · *Why:* the website is where
a follower becomes a user (founder), but until now @pyqvault_ reels showed it only on the end card at ~18–20 s, which the
average viewer never reaches (they leave at 7–9 s, L48), and the board's watermark is off on them (it reads "LWS Pune ·
NDA Maths"). On screen from frame 0 everyone sees it, the cover carries it, and a looping reel no longer needs a hard stop
(founder, 2026-10-21). An MCQ at the end felt like homework (founder). · *Check:* the reel's tests (the tag is on every
frame; its contrast); the stills sheet. · 🧪 L51

## Before posting

**F30 · Predict it before it goes out.** Every finished reel is scored by the virality predictor before it's queued: its
inputs (the idea's score; motion, colour, length and cover measured on the MP4; hook move, words at frame 0, second hook,
answer time and loop from the storyboard; the account's momentum) give a score out of 100, a band (record-breaker / above
typical / below typical) and its weakest input. The prediction is written in `virality-log.md`, frozen, and judged at the
reel's 48 h reading. **Advisory for now:** it becomes the go/no-go gate once at least 15 real predictions are judged, the
score ranks views with a rank correlation of 0.5 or more and it caught most below-typical reels; then a reel predicted
below typical is fixed (its weakest input) before posting, and the founder can overrule. Nothing posts without the
founder's approval either way. · *Why:* founder, 2026-10-22: "a virality predictor… which can predict the reel will have more
views than our current highest… eventually use this as the decision-making factor whether the reel should go out or not".
Logging before posting keeps it honest; the hindsight check already separates the pre-framework reels (scores 14–29;
119–269 views) from the framework ones (57–79; 1,293–1,496). · *Check:* `node reels/tools/virality-measure.mjs
reels/<reel>.post.json` then a row in the log's Reels and Predictions tables; `node reels/tools/virality.js` validates the
log and reports accuracy (`tests/virality.test.js`). **A new prediction for every new reel; the old ones updated at
every analysis** (founder, 2026-10-22): the 48 h readings come in by script (publisher `npm run results` →
`results-sync.js`), and `virality.js --update` fills each old prediction's outcome beside it (its frozen score and band are
never rewritten), moves the weights the rule allows, and logs the run. · 🧪 L60

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
| v1.9 | 2026-10-20 | F22: the orbit stays for 3D reels only; 2D reels open with their picture building from frame 0. | Founder: a 3D opening (360° turn settling into the flat grid) was built for @lws.pune 016 and dropped the same day: "doesn't look good". |
| v1.10 | 2026-10-20 | F21: proof runs −1–3; an idea that flopped for another account (under 1× their typical reel) scores −1, and loses a tie to an untested idea. P19–P29 (Ray Optics) added; P24 queued ahead of P11. | Founder, 2026-10-20: the Ray Optics search found ideas that flopped for other accounts (prism 0.5×, mirage 0.4×, sliced lens 0.9×) scoring the same as untested ones, and winning ties against them. A flop is evidence against, so it costs a point; in a tie, no evidence counts as 1×. Ray Optics first: founder ("take one physics chapter"). |
| v1.11 | 2026-10-20 | F6: the caption never gives the answer either ("Answer at the end of the reel 👀"), checked by `tests/caption-answer.test.js`. | Founder, 2026-10-20 (L45): Physics #4 and Chemistry #4 asked "Comment your guess" and got 0 comments at 1,403 and 340 views, with "→ B" printed a few lines down. First reel under the rule: Physics #8 (P24, the spoon). Reels made before it are in SUGGESTIONS.md → Backfill ledger. |
| v1.12 | 2026-10-21 | F24 added: bright objects from the `VIVID` set (both handles). | Founder: "more vivid colour objects", for @pyqvault_ and @lws.pune. Measured by L46. First reel: Physics #8 remade (`PvPhysics008Vivid`), set beside the first version for the founder to compare. |
| v1.13 | 2026-10-21 | F24: an everyday object people know by its material keeps it (steel, glass); the rest stays vivid. | Founder, 2026-10-21, comparing Physics #8's two versions: "original spoon colour was better, rest vivid is better". A steel spoon in cyan stopped looking like a spoon; the bright candle, rays and graph read better. Physics #8 goes out vivid with the steel spoon. |
| v1.14 | 2026-10-21 | F25 added: rotate the hook (8 types) and the opening picture (8 types) around the A/B/C guess; the Hook queue in `remake-backlog.md`, checked by `hook-rotation.js`. F22: the orbit is now one of the openings, at most 2 of any 4 reels (was every 3D reel). | Founder, 2026-10-21: "think about more hooks before this becomes repetitive"; chose the rotation from Claude's analysis of the competitor data and dropped the exam badge ("hook 6 out"). No orbit reel has been posted yet, so the orbit stays in the mix and L37 still measures it. Measured by L48. First reels: P11, C8, P6, C9, P7, C15. Reels already made are left as they are. |
| v1.15 | 2026-10-21 | F26 added: a second hook at the answer. F27 added: loop or end card, on test, alternating. F20: "PYQ Vault · pyqvault.com" under the question from frame 0 for the whole reel; the end card stays only on reels that don't loop. Hook queue gets Second hook and Loop columns, checked by `hook-rotation.js`. | Founder, 2026-10-21: "okay with both" (Claude's analysis: viewers leave at the answer, L48), and the founder's idea to put PYQ Vault and its address under the hook so a looping reel has no hard stop; Claude's additions: keep it for the whole reel, no "www.", AA contrast. Measured by L49, L50, L51. First reels: the six in the Hook queue. Reels already made are left as they are. |
| v1.16 | 2026-10-21 | F1: two sources, a proven remake or a PYQ Vault concept (MHT-CET and JEE Main physics and chemistry notes). F28 added: a notes concept is curated against F7, F10, F17–F19 and F21, then must pass the gate (Question 2, Vivid ≥ 2); every chapter read goes in the Concept sweep log. Topic scores gets a Source column, checked by `topic-scores.js`. | Founder, 2026-10-21: "topics can come from pyqvault concepts. It should be curated against other points mentioned". The proven supply ran out for chemistry; the gate keeps the two things our numbers back (the guess, L28; a busy picture, L30). First sweep: all of chemistry, C18–C42 added; P26 parked (Vivid 1). Measured by L59. |
| v1.17 | 2026-10-21 | F1: a third source, the founder's own concepts (Source `founder`, curated by F28 like a notes concept). F29 added: a concept must be explainable without a single word (picture, numbers and symbols only); every row gets a Wordless ✓ / ✗, an open or queued ✗ is refused for any source; the stills sheet is read with the text hidden. | Founder, 2026-10-21: "concept can come from me also. test for a good concept is if can be explained visually without a single word". Applied to the open backlog (P10, C28, C42 parked); the five queued reels and every made reel pass or are left as they are. Founder concepts measured with the others in L59. |
| v1.18 | 2026-10-21 | One idea list, `pyqvault-ideas.md`: every @pyqvault_ idea, the test, a card per idea (frame 0, the story in beats without words, second hook, source) and the Hook queue + Concept sweep, moved out of `remake-backlog.md`. F21: the score becomes weights × points out of 100, with Surprise (0–2) added and Everyday widened to 0–2; the weights are tuned at every analysis by a written rule (`--calibrate`, 48 h results, 6 reels, 20% gap, 0.5 steps, confound check), each run logged. 22 founder ideas added (P30–P46, C43–C47); P14 and P15 marked as known flops; P19 replaced by P31; C20 folded into C43; P28 and C40 parked on F29. | Founder, 2026-10-21: "create a reel idea list from which all the future reels can be made… curated with our test" and "a scoring mechanism for ideas… fine-tuned during every analysis of our posted list". First calibration refused (only 4 reels read at ≥ 48 h); logged in the list. Measured by L35. |
| v1.19 | 2026-10-22 | F25: every hook has a visual layer, an eye-catching move in 0–3 s (orbit, punch-in, suit-up assembly, split apart, morph…; Openings gain Assemble (suit-up), Split apart, Morph). The Hook queue gets a **Visual hook** column (what we see that move do), checked by `hook-rotation.js`; the storyboard's first row and the stills sheet's 0–3 s frames carry it. The five queued reels got theirs; P6's "You'd think" becomes two lifts hauling the same box, one racing ahead. | Founder, 2026-10-21: "hook should always have a visual layer", after seeing that two of the five queued hooks (P6, C9) leaned on words. Reels already posted are left as they are. |
| v1.20 | 2026-10-22 | F26: the second hook gets its own attention-grabbing visual. The Hook queue gets a **Second visual** column (the move that comes with the second question), checked by `hook-rotation.js`; the storyboard's second-hook row and the stills sheet carry it. The five queued reels got theirs. Also: C8 opens on Split apart (was Zoom), P7 on Assemble (suit-up) (was Split screen). | Founder, 2026-10-22: "second should also have attention grabbing visual"; and yes to the two opening swaps. Viewers leave at the answer (L48, L49), so the moment needs something new to see, not only to read. |
| v1.21 | 2026-10-22 | F14: both hooks' moves have their sound, from the `sfx.ts` kit (suit-up → a snap per part + shimmer, split → crack, morph or swap → shimmer, fast punch-in → whoosh-in, slow orbit → silent, the second hook's beat → music hit). The Hook queue gets **Hook sound** and **Second sound** columns, checked by `hook-rotation.js` against the kit; the storyboard rows name them. The five queued reels got theirs; P6's camera now punches in on the power meters (a fast zoom, so its whoosh is allowed by F15). | Founder, 2026-10-22: yes to pairing each visual move with a sound. The new moves (F25, F26) had no sound assigned, so the moment they're built for would have played silent or got a random effect. |
| v1.22 | 2026-10-22 | F24 rewritten: from "bright objects from VIVID" to four parts in order: real colours first, VIVID variety only where nothing is real, a small family of colours that gel, contrast with the board and the neighbours (a too-pale real colour gets an edge or shadow, never a fake colour). The beat table marks each colour real or VIVID. | Founder, 2026-10-22: "by vivid I meant variety and difference. Objects' colours should gel well and bring good contrast. Wherever possible they should be realistic." L46 keeps measuring it. Reels already made are left as they are. |
| v1.23 | 2026-10-22 | F24: real colours come from `REAL` in `palette.ts` (14 materials, a true-to-life fill and an edge of the same colour per board, tested for contrast), and pairs the viewer must tell apart pass `distinguishable()` (red–green colour blindness, Viénot simulation; in VIVID red–green, orange–yellow and blue–violet fail). The beat table lists those pairs and the reel's tests check them. | Founder, 2026-10-22: yes to a tested set of real colours and the colour-blind check. Without the set, "copper" could be a different shade every reel or vanish on the white board; the check found that blue and violet, not only red and green, merge for colour-blind viewers. |
| v1.24 | 2026-10-22 | Winning means views and watch time (comments later); the bar moves from 133 views · 5.2 s (all 9 reels, 20 Oct) to 1,429 views · 8.4 s (the five framework reels of 20–21 Oct, read at 6–36 h). The calibration's result stays the average of views and watch time against the typical reel, now locked by a test. | Founder, 2026-10-22: "views is the main goal because we want to reach the maximum audience. We are optimising for views. Comments we will think later… watch time as well." The fresh export showed the framework reels at 6–10× the earlier views, so the old bar no longer told good from bad. |
| v1.25 | 2026-10-22 | F30 added, a new part "Before posting": every finished reel is scored by the virality predictor (`virality-log.md`, `virality.js`, `virality-measure.mjs`) and its prediction logged, frozen, before it's queued; advisory until ≥ 15 real predictions are judged with a rank correlation ≥ 0.5, then the go/no-go gate (the founder can overrule). | Founder, 2026-10-22: a virality predictor to decide whether a reel goes out, fine-tuned as we go. Measured by L60. First real test: the 7 reels made but not posted. |
| v1.26 | 2026-10-22 | F30: the numbers come in by script and the predictor updates itself. Publisher `npm run results` (GoPost's write-once 48 h / 7 d readings by post slug) → `results-sync.js` (into the learnings results table) → `virality.js --update` (old predictions get their outcome beside them, weights move by the rule, the run is logged). The four-step analysis routine heads the results table. | Founder, 2026-10-22: "prediction is made every time a new reel is made and old predictions are updated to fine-tune the predictor". The results table had stopped at Physics #4 by hand, which hid the framework's 6–10× jump in views. |
| v1.27 | 2026-10-22 | No point changed. Framework 2 (`pyqvault-framework-2.md`, an outside storyboard bible: suit-up builds, ~30 s, an explainer hook, the formula and a takeaway at the end) is put on test against this framework in one pair on one topic, electromagnetic induction: `pv-f2-induction` (made by it) vs `pv-physics-011-induction` (made by this one), 09:00 Fri 23 and Sat 24 Oct. | Founder, 2026-10-22: "let the data speak". Measured by L61, with its decision rule set before posting. |
| v1.28 | 2026-10-23 | F10 rewritten: "Entertainment first, the result real". Drama of any kind is in (slow motion, crashes, flashes, shake, stakes, exaggerated sizes); the one floor is a real result and real numbers on screen; scale, speed and zoom notes move from the screen to the caption. F25: new opening **Shock**, a dramatic event from the topic inside the first second (any moment of the topic, not only the climax; explosions and danger judged by the founder case by case; never a real person hurt). First reel: P51, lightning hits a car. | Founder, 2026-10-23, after the retention-curve debate: Instagram viewers come for entertainment; nobody can read a reel in its first second, so a visual shock has to win it and the question carries seconds 1–3. Skip rate (viewers gone by 3 s) goes with reach on 179 @lws.pune reels (pyqvault-learnings.md L64). |
