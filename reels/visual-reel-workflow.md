# Visual reel workflow (white board, animated graph)

How to make a reel like `nda-maths-005-area`: a real NDA PYQ solved by a **picture that builds
itself** (a curve draws, an area fills with slices, a figure folds) on a soft-white board. No pen,
no face, no voice. About 30 s. Everything else follows the house settings in `lwspune-insta.md`.

**Status:** on test (day 5 of `format-test.md`). Paper stays the house look until the scorecard says
otherwise.

---

## 1. Pick the question (10 min)

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
| Traps | 25–28.5 s | one line per wrong option; draw the reason (e.g. a brace "repeats every π") |
| End card | 28.5 s → end | house navy end card: one takeaway line + "Follow for more" |

Captions: short, at most 2 lines, and they cross-fade on the white board.

## 3. Build the render page (30–60 min)

1. Copy `nda-maths-005-area.render.html` to `nda-maths-NNN-<slug>.render.html`. Keep
   `theme: 'white'`.
2. Take colours from `Reel.WHITE` only, never new hex values. They are contrast-tested in
   `tests/reel-theme.test.js`:
   `ink` = text · `muted` = labels and the source line · `blue` = the function, ∫ and limits ·
   `green` = area and result · `amber` = the one accent (answer, traps) · `fill` = area fill ·
   `grid` / `axis` = the graph frame.
3. Change `drawQuestionCard` (source line, maths, `api.chips` labels + answer index + answer time),
   `captions`, the `draw()` functions, `end` and `cover`.
4. Long upper limits on ∫ need leading spaces so they clear the sign: `{ int: ['0', '  8π'] }`.
5. Put the cover caption low (y ≈ 1440) so the figure shows in the 3:4 profile-grid crop.

**Premium look checklist** (founder's brief: premium + soothing to the eyes):
- [ ] At most **one maths colour + one area colour + one accent**; the accent appears only at the answer/traps
- [ ] Text on white cards or straight on the board, never on black slabs; sentence case, not ALL CAPS
- [ ] Depth from soft shadows (`api.card`, `api.softStroke`), not borders and boxes
- [ ] Scaffolding (grid, axes, labels) quieter than the maths: dot grid, thin muted axes
- [ ] Motion is calm: things fade, grow or are led by a dot; nothing scribbles, flashes or snaps
- [ ] Nothing within ~60 px of the watermark (y = 1600) or in the bottom ~320 px
- [ ] The end card stays on the soft board (no dark flash)

## 4. Check, record, check again (10 min, mostly waiting)

Run from the project folder (`Digital_Marketing_AI`). They need Microsoft Edge and nothing else.
Save every image the founder should look at (contact sheets, strips, before/after) inside the project
folder, e.g. `reels/`, never a temp folder, so the links open from the editor.

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

**If you changed `engine.js`:**
```
node reels/tools/unchanged.mjs           # every existing reel must say SAME
node --test tests/*.test.js             # palette contrast + core tests
```
Only after an *intended* change to an existing reel: `node reels/tools/unchanged.mjs --save`.

## 5. Caption kit and manifest (15 min)

- `nda-maths-NNN-<slug>.md`: copy `nda-maths-005-area.md`. It holds the source, the checked working,
  the traps, a table of what's on screen, the caption, and the before-you-post checklist.
- `nda-maths-NNN-<slug>.post.json`: copy `nda-maths-005-area.post.json` (Instagram, Facebook and
  YouTube captions). Validate it with the publisher's own rules: `parseManifest` + `captionErrors` in
  `publisher/src/lib/domain/` (a throwaway vitest file in `publisher/tests/`, deleted afterwards).
- Add the reel to `format-test.md` (schedule + scorecard row) while the format is on test.

## 6. Approval gate (founder)

- [ ] Watch it once on the phone: every line readable at normal size
- [ ] The answer and working match the caption kit
- [ ] Caption has the exam, paper, Q number and answer
- [ ] Cover PNG chosen in the upload screen; bio link opens PYQ Vault

Never publish without this tick. The publisher app enforces the same gate.
