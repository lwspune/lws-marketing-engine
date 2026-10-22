# Visual reel workflow (white board, animated graph)

How to make a reel like `nda-maths-005-area`: a real NDA PYQ solved by a **picture that builds
itself** (a curve draws, an area fills with slices, a figure folds) on a soft-white board. No pen,
no face, no voice. About 30 s. Everything else follows the house settings in `lwspune-insta.md`.

**From 2026-10-20 new @lws.pune reels follow `lwspune-framework.md`** (Remotion, NDA maths concepts first, a PYQ in the
caption when one fits). Where this runbook and the framework differ, the framework wins; the steps below still hold
for the picture, the re-derivation and the checks.

**Status:** on test (day 5 of `format-test.md`). Paper stays the house look until the scorecard says
otherwise.

---

## 1. Pick the question (10 min)

- **One question per reel** (founder's rule). Never combine two PYQs, even a linked pair on one
  set-up (e.g. Q89 + Q90): solve the one the picture answers. See `lwspune-insta.md` → Content rules.
- **Start from `visual-candidates.md`:** the shortlist of PYQs already sorted by picture type.
- **Good fit:** the answer *is* a picture. Examples: area under a curve, periodic graphs (|sin x|,
  sawtooth x − [x]), odd/even symmetry (the areas cancel), the slope of a tangent, a locus.
  **Bad fit:** pure algebra with no picture. Use the paper reel for those.
- **Source:** the PYQ Vault question bank (`../Question_Bank`, Supabase table `questions`). Read only,
  with the public anon key from `../Question_Bank/.env.local`. Never write to it.
- **Re-derive the answer by hand** and write the working in the caption kit. Note which wrong options
  are traps and why (those become the trap caption).
- Note the exam, paper, question number and question id for the caption kit.

## 2. Plan the beats (on paper first)

| Beat | Time | Rule |
|---|---|---|
| Hook | 0–3 s | question box + options + empty axes **visible on frame 0**; caption = the fear ("8π looks scary.") |
| Draw | 3–6 s | the plain curve traces in |
| Transform | 6–10 s | the one idea (fold the dips, reflect, shift…) |
| Zoom + build | 10–16 s | zoom on one piece; slices grow and melt into one area; the working appears below |
| Repeat / count | 16–21.5 s | zoom out; the other pieces fill in turn while a counter runs |
| Answer | 21.5–25 s | red ring on the option + chime (`music: { chime: t }`) |
| Traps | 25–28.5 s | one line per wrong option; draw the reason (e.g. a brace "repeats every π") in `muted` + dashed, not amber |
| End card | 28.5 s → end | house navy end card: one takeaway line + "Follow for more" |

Captions: short, at most 2 lines, and they cross-fade on the white board.

## 3. Build the render page (30–60 min)

1. Copy `nda-maths-007-cancel.render.html` to `nda-maths-NNN-<slug>.render.html` (the first reel made
   to every rule below: shrinking card, growing graph, no watermark). Keep `theme: 'white'`. Reel 005
   is still the example for zoom + slices.
2. Take colours from `Reel.WHITE` only, never new hex values. They are contrast-tested in
   `tests/reel-theme.test.js`:
   `ink` = text · `muted` = labels and the source line · `blue` = the function, ∫ and limits ·
   `green` = area and result · `amber` = the correct answer **only** · `fill` = area fill ·
   `grid` / `axis` = the graph frame.
3. Change `drawQuestionCard` (source line, maths, `api.chips` labels + answer index + answer time),
   `captions`, the `draw()` functions, `end` and `cover`.
4. Long upper limits on ∫ need leading spaces so they clear the sign: `{ int: ['0', '  8π'] }`.
5. Put the cover caption low (y ≈ 1440) so the figure shows in the 3:4 profile-grid crop.
6. Option labels longer than "(d) 16" (e.g. "(c) 100a") overflow the default chip: use
   `size: 40, w: 182, gap: 14` in `api.chips`.
7. **Honest scale.** Never draw a different count, domain or scale from the question's (e.g. 4 humps
   standing for 100). If the real count is large, show it first (100 humps as a fine comb across the
   graph), then zoom into the part that matters. Only if that's truly impossible: a "not to scale"
   label at full label size (36 px) with the dot grid kept out from behind it.
8. **Shrink the question after the hook.** Once the graph starts drawing, collapse the question card to
   a slim strip (source line + the maths + chips) and give the graph the space it frees up. The full card
   stays only for the first ~3 s. In 007, `drawQuestionCard` lerps the card with `k = api.prog(t, 3.0, 0.8)`
   and `setView` grows the graph (`GY`, `SY`) with the same `k`.
9. **No watermark** (from reel 007): `watermarkY: null` in `Reel.mount` (already in the 007 template).
10. ∫ limits are drawn at half the maths size, so keep the card's maths at ≥ 56 px or the limits get
    too small to read. When the expression is long, cut its size only until it fits the 860 px card.

**On test (see `learnings.md`, don't treat as rules yet):** `vignette: true` in `Reel.mount` adds a soft
slate edge shade that stays on the end card (L12); the opening title held still at the centre on a card
with a light circling its edge (`api.glowRing`), then gliding to the top (L11; reels 009–011); the quick format: ~19 s, 3 s countdown
with motion, comment prompt before the reveal, answer at the end (L3–L5; reel 008); the "Why?" series: one intuitive why, something always moving, then the real PYQ it unlocks (L13–L14; reel 009).

**Music:** pick `music: { style }` per reel and rotate it (founder, 2026-10-17: different background music per reel): `lofi` (house default), `bright` (D-major pluck arpeggio + light beat, 100 BPM; reel 012), `calm` (soft piano, no drums, 72 BPM). All original, made in code. Check loudness with check-video after any new style. **Don't** sonify the maths (two tones at once sounded chaotic to the founder, L17); `music.tones` stays in the engine unused.

**Choosing the topic:** @pyqvault_ takes the tool's next pick from `pyqvault-ideas.md` (`node reels/tools/topic-scores.js pyqvault`; its card has the frame-0 question, the beats without words and the second hook); @lws.pune starts from `remake-backlog.md` (proven reels from the creators we studied, remade our way; founder, 2026-10-18). Take the idea, never their video or words.

**Premium look checklist** (founder's brief: premium + soothing to the eyes):
- [ ] At most **one maths colour + one area colour + one accent**; amber marks the correct answer and
      nothing else. Traps use `muted` with a dashed line or hatch, never the answer's colour
- [ ] **One focal point per scene**: if the caption, question, graph and working all compete, shrink
      or hide one (see step 3.8)
- [ ] **Colour is never the only cue**: pair it with a label, hatch, dash or position (e.g. "leaves" =
      hatched + dashed, "joins" = solid green + label)
- [ ] **No label under 36 px** if the viewer needs to read it (a 1080-wide frame shows at about 1/2.8
      size on a phone, so 30 px comes out at about 11 pt); 30–34 px only for scaffolding like axis letters
- [ ] **Timing comes from reading time**, not the beat table: hold a 2-line caption ≥ 2.5 s and a
      working line ≥ 3 s. A longer, clear reel beats a rushed one
- [ ] Text on white cards or straight on the board, never on black slabs; sentence case, not ALL CAPS
- [ ] Depth from soft shadows (`api.card`, `api.softStroke`), not borders and boxes
- [ ] Scaffolding (grid, axes, labels) quieter than the maths: dot grid, thin muted axes
- [ ] Motion is calm: things fade, grow or are led by a dot; nothing scribbles, flashes or snaps
- [ ] No slow zoom on text: it shimmers (founder, 2026-10-17). Hold text still and move light around it (`api.glowRing`)
- [ ] Nothing in the bottom ~320 px (below y ≈ 1600), and no `LWS Pune · NDA Maths` watermark (`watermarkY: null`)
- [ ] The end card stays on the soft board (no dark flash)

## 4. Check, record, check again (10 min, mostly waiting)

Run from the project folder (`Digital_Marketing_AI`). They need Microsoft Edge and nothing else.
Save every image the founder should look at (contact sheets, strips, before/after) inside the project
folder, e.g. `reels/`, never a temp folder, so the links open from the editor. **A change to how reels look** (a new
on-screen tag, colours, layout) is shown as **two separate finished reels**, without and with the change, not a
screenshot sheet: the founder watches both and picks (founder, 2026-10-21).

```
node reels/tools/frames.mjs reels/<name>.render.html sheet.png 0 4 7.6 11 15 19 22.6 26.5
```
Look at every frame: the hook is readable at t = 0, nothing overlaps, labels don't collide mid-animation,
nothing sits in the bottom ~320 px or the right ~120 px below mid-screen. Fix and repeat.

```
node reels/tools/record.mjs reels/<name>.render.html        # → <name>.mp4 (real time, ~32 s)
node reels/tools/cover.mjs  reels/<name>.render.html        # → <name>-cover.png
node reels/tools/check-video.mjs reels/<name>.mp4 strip.png 0.05 9.6 15.2 22.6 26.5 30.8
```
`check-video` must print four PASS lines (1080×1920, stereo, peak ≤ −3 dB, loudness about −22 dB).
Look at the strip too: it's decoded from the MP4 itself, so it shows what Instagram gets.

**Every new or remade reel:** once it's final, run `node reels/tools/unchanged.mjs --save` so its frames
join the baseline (006 and 007 were missing until 2026-10-15, so a later check showed them CHANGED for
no real reason). Run the compare first: only the reel you just made may differ.

**If you changed `engine.js`:**
```
node reels/tools/unchanged.mjs           # every existing reel must say SAME
node --test tests/*.test.js             # palette contrast + core tests
```
Only after an *intended* change to an existing reel: `node reels/tools/unchanged.mjs --save`.

## 5. Caption kit and manifest (15 min)

- `nda-maths-NNN-<slug>.md`: copy `nda-maths-007-cancel.md`. It holds the source, the checked working,
  the traps, a table of what's on screen, the caption, and the before-you-post checklist.
- `nda-maths-NNN-<slug>.post.json`: copy `nda-maths-007-cancel.post.json` (Instagram, Facebook and
  YouTube captions). Validate it with the publisher's own rules (`parseManifest` + `captionErrors`):
  `cd publisher && npx vitest run tests/content` already checks every `reels/*.post.json`, so no
  throwaway test file is needed.
- Add the reel to `format-test.md` (schedule + scorecard row) while the format is on test.
- Queue it in the publisher: `cd publisher && npm run queue:add -- --org=lws-pune ../reels/<name>.post.json`.
  **Remade** a reel that's still Ready in the queue? Add `--replace`: it swaps the files and captions in
  place (refused once the post is approved, published or rejected). Check Instagram first: a reel
  already posted by hand must be rejected in the queue, never approved again. **Match by the video,
  not the caption:** on 2026-10-12 the Q74 solution (001) went out with the hook's (002) caption, so
  a caption search pointed at the wrong reel. Ask the founder or compare the thumbnail.

**V reels (the mascot explains):** see `nda-maths-004-v.render.html`. V's speech carries the steps,
so the top caption is used only for the hook and the answer (one focal point). Draw the speech as a
soft white card with a small tail (`api.card`), not `api.bubble`: that is the old paper style with a
dark border, which breaks the premium checklist. Keep V and its card above y ≈ 1600 and hide both on
the cover.

## 6. Approval gate (founder)

- [ ] Watch it once on the phone: every line readable at normal size
- [ ] The answer and working match the caption kit
- [ ] Caption has the exam, paper, Q number and answer
- [ ] Cover PNG chosen in the upload screen; bio link opens PYQ Vault

Never publish without this tick. The publisher app enforces the same gate.

## Remotion reels (on trial from 2026-10-18; 3D goes here)

For a question whose picture is **3D** (a cone, a plane, a solid), make it in `remotion/` instead of a
`.render.html`. Remotion renders every frame (the engine's real-time recording drops some, L25). Reel 014
(`remotion/src/Reel014.tsx`) is the example. Steps 1, 2, 5 and 6 above are unchanged; steps 3–4 become:

**One render at a time** (2026-10-22): never run a video render, a still or `check-video.mjs` alongside another one.
Each opens headless browsers; two at once ran this 16 GB laptop out of memory and grew the page file to 12.6 GB, on a
disk that was already nearly full. Renders keep their temp files in their own folder and clear its stale leftovers when
they start (`remotion/tools/tempDir.ts`, wired in `remotion.config.ts`); `npm run clean:temp` clears it by hand.

1. **Storyboard first: a beat table** (founder, 2026-10-21), at the top of `src/lib/<reel>.ts`, one row per beat:
   time · what moves · the caption, and how long its voice line takes · what the camera must keep in frame · the key
   objects' colours, each marked **real** (from `REAL` in `palette.ts`: copper, steel, flame, copper sulphate…; add a
   missing material there first) or **VIVID** (for things with no real colour: particles, rays, arrows, bars), about 4 key
   hues that sit well together, the same thing the same colour throughout; then **the pairs that must be told apart**,
   each checked with `distinguishable()` in the reel's tests (colour-blind safe: never red–green, orange–yellow or
   blue–violet for such a pair) (F24, founder 2026-10-22; L22 decides white or dark). **@pyqvault_: the hooks are rows of
   their own** (founder, 2026-10-21), taken from the idea's card and its Hook queue row: **row 1 = the first hook**, from
   frame 0 to 3 s (the A/B/C question, its hook type, the opening picture already moving behind it, and the tag; F4, F5,
   F20, F25), including **its visual hook**: the eye-catching move from the Hook queue (an orbit, a punch-in,
   parts assembling like a suit-up, an object splitting apart, a morph…; founder, 2026-10-21/22: every hook has a visual
   layer) and **its sound** (the Hook sound: a snap per part of a suit-up, a crack for a split…; F14); **the answer row** (when the right option lights); **the second-hook row**, starting as the answer lands
   (its question ≤ 7 words, which the rest of the reel answers; F26), with **its own attention-grabbing move**, the Second
   visual from the Hook queue, and its sound (founder, 2026-10-22); and **the last row**, the loop back to frame 0 or the
   end card (F27). *Why:* on Physics #8 every first-render fault
   was one a table catches: a cream candle and its image nearly invisible on the white board, the answer's image
   cropped at the band's edge, two voice lines longer than their captions. Remakes and rejections (Physics #4,
   Chemistry #4, Maths #3, the clay Sound Mind reel) each cost about an hour for a fault visible in a few frames.
2. **Timeline in tests:** `src/lib/<reel>.ts` holds the timings and geometry as pure functions of t;
   `tests/<reel>.test.ts` checks them first (`npm test`). For 3D, test that every label **and every row's
   "keep in frame" object** stays inside the 3D band on every frame (`project()`), and that the key figure **faces the
   camera** while it's being explained, answered and trapped (never edge-on).
3. **Voice before caption times** (voiced reels, F23): write the lines, run `npm run voice:<reel>` and set each
   caption's slot from the measured length (+ 0.1 s lead), then re-run until it prints no "too long". Silent reels: the
   same slots, so either render can go out.
4. **Scene:** the 3D figure in a `ThreeCanvas` band; the question card, captions, working and end card are
   the shared HTML pieces in `src/board.tsx` (same white look and Reel.WHITE colours, palette test-locked).
   Labels are HTML placed with `project()`, so they stay crisp Cambria.
5. **Stills sheet before any sound or full render:** render 6–8 beat frames (the opening, the cover time, each beat,
   the answer, the second hook on screen mid-move, and the last frame: the end card, or for a loop the last frame beside frame 0) with `npx remotion still <Comp> <out.png> --frame=<n>` into the scratchpad, put them on
   one sheet (an HTML grid screenshotted by headless Edge) and fix what it shows: anything hard to see on the board,
   washed out, two neighbours hard to tell apart, a clash, or a fake colour where a real one exists (F24), cropped,
   overlapping or late. Then read the sheet once **with the text hidden** (the
   question, labels and captions; numbers, gauges and graphs stay): it must still show what happens and why (@pyqvault_
   F29, founder 2026-10-21); if it doesn't, the picture is missing a beat, so add it rather than more words. The frames
   from 0–3 s, text hidden, must show the visual hook's move doing something striking on every frame. **Claude's own check:** the founder judges the finished reel only, never the sheet
   (founder, 2026-10-21).
6. **Music:** write `remotion/music/<reel>.json` (`duration`, `music.style`, `music.hits`), then
   `node ../reels/tools/music.mjs music/<reel>.json public/<reel>.wav`: the house music from `engine.js`,
   rendered offline (sample-exact, hits on time). Then `npm run mix:<reel>`.
   Effects (`src/lib/sfx.ts`, `HIT_KINDS`): click, tap, crack, thunk, whump, boom, whoosh-in/out, plus **snap** (a bright
   hit for a cut or flip to a new screen) and **shimmer** (an airy 2 s swell under a reveal zoom), both modelled on a
   studied reel's sounds (2026-10-21): measured, then made in code, never copied.
7. **Check:** render the MP4 to `reels/` and run `check-video.mjs` as in step 4 (four PASS lines), and look at its
   strip. **@pyqvault_: then predict it before it's queued** (framework F30): `node reels/tools/virality-measure.mjs
   reels/<reel>.post.json`, add its rows to `reels/virality-log.md` (Reels: the measured and storyboard points;
   Predictions: today's score, band and weakest input, the record and the typical views now, Hindsight no) and run
   `node reels/tools/virality.js`. While it's advisory, a "below typical" reel is flagged to the founder with its weakest
   input; it doesn't stop the reel.
8. **Map reels (F28):** start from `Reel017.tsx` + `src/lib/reel017.ts`. A card is 330 px wide, so a formula line over
   ~290 px at 34 px (about 18 Cambria characters) is cut off at its edge on the full map: give that node a smaller `size`
   (017's Bayes card: 31) or split the line. Check the full-map frame at full size, not only the stills sheet.

### Reel toolkit (2026-10-20, founder-approved): reach for these before hand-rolling

Installed in `remotion/` only, pinned. First used in @pyqvault_ Physics #7 (`PvPhysics007.tsx`) and Sound Mind sm-r004.

| Tool | Use it for | Gotcha |
|---|---|---|
| `@react-three/postprocessing` `<Bloom>` | real glow on hot / bright / fast things in 3D (photons, a star, induced current, hot molecules) | Draws only from the canvas's 2nd render: add a `BloomWarmUp` (copy it from `PvPhysics007.tsx`) or the cover and each tab's first frame are blank. Glow = `meshBasicMaterial toneMapped={false}` colour above 1; dark (lab) board shows it best. |
| `@remotion/paths` `evolvePath` | arrows, curves and outlines that draw themselves (the heat arrow in Physics #7) | Gives `strokeDasharray` / `strokeDashoffset` for an SVG `<path>`; replaces hand-written dash maths. |
| `@remotion/noise` | gentle organic motion (sway, drift, breathing), the same on every render | Seeded noise of t, never `Math.random`. |
| `@remotion/rough-notation` | hand-drawn strike-throughs, circles, underlines, marker highlights on HTML text | **Always pass `seed`** (it falls back to `Math.random`, so every render would differ). Wrap words in it as HTML; it measures them, so put it inside the same CSS transform as the scene's zoom. |
| `perfect-freehand` `getStroke` | real pen strokes that thicken and taper; drawn point by point for "the pen draws it" | Feed it the points drawn so far; fill the outline it returns. |
| Many particles (3D) | one `instancedMesh` updated in `useLayoutEffect`, from a precomputed simulation (Physics #7: 2,400 molecules) | Simulate with + − × ÷ √ only and a seeded generator, so Node (tests, sound) and Edge (render) get the identical run. |
| `RealLight` (`src/realism.tsx`) | realistic light in any 3D scene: room reflections, one key light with soft shadows | Pass `shadows` to the `ThreeCanvas`; set `castShadow` / `receiveShadow` on meshes. Three.js only, no package. |
| `@dimforge/rapier3d-compat` (Rapier physics, Apache 2.0) | real collisions: molecules bouncing off each other, balls, dice, a piston hit by particles. Demo: `remotion/src/DemoPhysics.tsx` (`review/realism/4 …`) | Remotion draws frames out of order: simulate **once**, fixed step (1/120 s), in `src/lib/` (`demoPhysics.ts`) → `node tools/simulate.ts` writes `public/*.json` → the reel only plays it back. Test that two runs are identical. A fast ball can sink ~0.02 into a wall for a frame. It's for how the motion **looks**: any number the reel states (pressure, speed, count) still comes from the re-derived law (F10), never from the engine. |
| `three.quarks` (particles, MIT) | fire, sparks, smoke, steam, heat haze. Demo: `remotion/src/DemoParticles.tsx` (`review/realism/5 …`) | It moves by clock time and `Math.random`: rebuild and replay from 0 every frame with `withSeed` (`demoParticles.ts`), plus one throwaway build at module load (its first build draws extra random numbers). Emitters must sit in a `Scene`. Additive glow vanishes on the white board: **dark (lab) only**. Forces are in the emitter's own axes (turned to point up: down = local −z). |

**Not used, and why** (checked 2026-10-20): `@react-three/drei` (pulls in 21 packages incl. face tracking and a GPU check
that downloads data; three.js's own `TubeGeometry` / `Line2` cover trails and thick lines), tegaki (handwriting only in
its 13 bundled fonts, not Kalam), Remotion's `@remotion/effects` (needs `HtmlInCanvas`, behind a Chrome flag), matter-js
(a physics engine drifts energy; our reels re-derive exact physics, F10; Rapier is kept for how collisions look, with that rule), three-gpu-pathtracer (photo-real stills: 1–4 min each and the GPU reset in about half the long runs on this laptop; founder agreed, 2026-10-20), a 3D opening for 2D reels with `@remotion/motion-blur` on the turn (built for @lws.pune 016; the founder: "doesn't look good"; and motion blur's copies of the 3D canvas washed frames out white when several tabs rendered at once). KaTeX waits for the first reel with a formula
label (P7, P15, P17).

**Adding a package:** `npm install --save-exact --ignore-scripts <pkg>@<x.y.z>` in `remotion/`, never `npx remotion add`.
`tests/deps.test.ts` fails on a loose version, a package from outside npm's registry, or an install script nobody has
read. Remotion's official skill (`.claude/skills/remotion-markup`, local only) has the API details; where it differs, the
rules here and in the framework win.

## Where the 2026-10-14 rules came from

An outside "visual upgrade brief" reviewed reel 006. Its useful parts are the rules in steps 3.7–3.8
and the checklist above. Reels 005 and 006 predate them and stay as they are (founder's call: no
rework). Considered and **declined**, so don't re-propose them without a reason:
- **Dark navy "cinematic" palette:** the white board is mid-test; a dark look would be its own test
  after the scorecard, never a swap.
- **A pipeline that renders any question from data:** too early at 6 reels. Move repeated graph code
  (axes, traced curve, area fill) into `engine.js` when a third graph reel needs it.
- **Sound effects only, no music:** the original music is approved and loudness-checked.
- **A "practise on PYQ Vault" line on the end card:** the founder removed such lines; the link
  lives in the caption.
