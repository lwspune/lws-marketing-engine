# Review panel: four critics before a reel goes out (framework F38)

**Why** (founder, 2026-10-26): Chemistry #11 passed every test and check and was still "not dramatic enough, pretty bland".
My own look at my own stills is anchored on what I meant to make. "There should be agents to review dramatic effect,
colours, motions, sound effects. They will review critically to ensure virality of the reel." So every new @pyqvault_ and
@lws.pune reel is read by four harsh critics who see only the reel, never my reasoning, before it's queued in GoPost. The
founder still judges the finished reel; the panel's verdicts go with it.

**Pass bar:** no must-fix item left and every critic's score **≥ 7/10**. I fix each must-fix, re-render and re-run that
critic; a suggestion I don't take is written in the reel's caption kit (`reels/<slug>.md` → Review panel) with the reason.
Whether reviewed reels do better is measured by L73 (`pyqvault-learnings.md`).

## How it runs

1. **Pass 1, on the stills sheet** (runbook step 5, before the music and the full render): Drama, Colour, Motion.
2. **Pass 2, on the rendered MP4** (runbook step 7, before predicting it): Sound, and Motion again on the measured numbers.
   A critic whose pass-1 must-fixes changed the picture reads the new stills too.
3. Each critic is a **fresh agent** (`general-purpose`), at most **3 running at once** (owner's limit), read-only: it reads
   the kit's files and writes nothing, never renders, never touches git, GoPost or the database. It never sees the
   virality predictor's score, the idea score, or my notes, so it isn't anchored on them.
4. The main session reads every verdict, fixes the must-fixes, and alone renders, queues and commits.

## The kit (made by the main session into the scratchpad, `<kit>/`)

| File | How | For |
|---|---|---|
| `sheet.png` | `cd remotion && npm run stills -- <Comp> <kit> <frames>` (6–18 beat frames, the opening dense) | Drama, Colour, Motion |
| `opening.png` | `node reels/tools/check-video.mjs reels/<slug>.mp4 <kit>/opening.png 0 0.25 0.5 … 3.5` (from the MP4) | Drama, Motion |
| `whole.png` | the same, one frame a second | Drama, Sound |
| `cover.png` | the reel's cover | Drama, Colour |
| `motion.txt` | `node reels/tools/virality-measure.mjs reels/<slug>.post.json --frames` | Motion |
| `sound.txt` | `cd remotion && node tools/sound-report.ts src/lib/<lib>.ts public/<file>` | Sound |
| `beats.txt` | the reel's beat table (the header of `src/lib/<lib>.ts`) | all |
| references | our best covers and openings: `reels/pv-chem-006-flame-cover.png` (most shared), `reels/pv-physics-013-lightning-cover.png` (best start: 96% at 1 s, 78% at 3 s) | Drama, Colour |

**Keep the kit honest** (learned on Chemistry #11, pass 2): rewrite the beat table in the lib header after every retime, or the critics judge against stale times (the sound critic found "every hit 0.3 s late": the table was); and `sound.txt` shows the music *as it plays* (the mix minus the effects), not the raw music file, whose swells the level curve may already take out.

Pass 1 has no MP4 yet: Drama and Motion read the stills sheet (with the opening's frames every 0.25 s on it) instead of
`opening.png`, and Motion gets no `motion.txt` until pass 2.

## The brief (the same for each critic, with its checklist pasted in)

> You are a harsh critic of short science reels for Instagram (Class 11–12 students; most scroll with the sound off; a
> viewer decides in the first second whether to stay). Your one job: **{CRITIC}**. Be critical: a polite review costs us
> the reel. Judge only what is in these files: {FILES}. Compare with the reference frames: would this reel stop a thumb
> faster than they did? Do not edit, render or run anything that writes; keep tool output small (read the images, read the
> text files; no long listings).
> Reply in this shape and nothing else:
> **Score:** n/10 · **Must-fix:** numbered, each with the time (s) or frame it's at, what is wrong, and what to change (or
> "none") · **Suggestions:** numbered, short · **Best moment:** one line.
> Checklist: {CHECKLIST}

## The checklists

**Drama** (does it feel like an event?)
1. Frame 0 alone, text hidden: would it stop a thumb? Is something already happening, big in frame?
2. The shock (F25): is the event big, close and loud on screen (a flash, debris, a shake, a speed change), or small and far?
3. Escalation: does it build to the reveal, or peak early and coast? Is the reveal the biggest moment?
4. Scale and closeness: is the camera close when it matters? Is the key object at least a third of the frame then?
5. Stakes and contrast: is there a "what will happen?" in every second of the first three?
6. The ending and the loop: does the last second pay off or invite a replay?

**Colour** (does it pop on a phone?)
1. Contrast: does the key object stand out from the background at a glance, on a phone, in daylight?
2. One focal point per beat: does colour lead the eye to what matters, or compete with it?
3. Washed out, muddy, glaring or flat areas; blown-out whites that lose detail.
4. Real things in real colours (F24); colours that must be told apart told apart (colour-blind safe).
5. Text: readable over the picture at every moment.
6. The cover on a 3:4 grid crop: does it read and pull?

**Motion** (is it alive every second?)
1. Seconds 0–3: does something new happen about every second (F37), with no still or settling stretch? (`motion.txt`:
   name every 0.1 s step under 5% of the pixels a frame.)
2. Camera: purposeful moves (push, whip, orbit, punch-in) at the right beats, or drifting and static?
3. Physics feel: do objects move with weight (fast impacts, slowing falls, bounces), or float?
4. Pacing after 3 s: any stretch over ~1.5 s where nothing changes?
5. Smoothness: jumps, pops, things appearing from nowhere, jarring cuts.

**Sound** (does it hit?)
1. Every visible impact has its own sound, on the frame (compare `sound.txt` hits with `beats.txt`).
2. The shock has weight: is it the loudest moment of the first 3 s? Is anything under it (music) at all?
3. Effects against music: F16 wants effects 5–10 dB under the music's body, and the music dipping under the big hits.
4. The music's accents land on the reveals (the answer, the second hook).
5. Silences or flat stretches; clutter (too many hits on top of each other); anything that would grate on a phone speaker.
6. It still works muted (F17): nothing important is only in the sound.

## Log

One row per reel and pass: the four scores, the must-fixes (and what was done), the suggestions declined (and why).

| Reel | Pass | Drama | Colour | Motion | Sound | Must-fixes → done | Declined (why) |
|---|---|---|---|---|---|---|---|
| Chemistry #11 (`pv-chem-011-hammer`, the dramatic remake) | 1 (MP4, all four at once) | 5 | 5 | 6 | 5 | Flash blew out both peaks → 2–3 frames, small, bloom down · grey on grey → near-black floor, gunmetal blocks, vignette, the salt brightest · copper read as wood → polished salmon copper, dark handle · frame 0 a still life, hammer behind the text → camera lower, hammer head in frame below the question · burst with no cause → both hammers wind up and strike again at 3.2 s · cracks like black tape → thin, jagged, with a bright edge · copper bent off screen → u³ bend, mostly after the whip lands · answer far away → held close, then a tighter two-shot, a bigger "B salt" · red push on green Cl⁻ (colour-blind pair) → yellow · music swell over the cracks, music over the burst, no metal ring, late whooshes → a music curve (riser, a hole for the burst, a lift for the second question, quiet loop seam), a new `clang`, whooshes placed by hand · flat copper atoms → angled, drifting camera, the electron sea flows · chips hanging → faster fall · split drifting → 0.7 s | Split-screen frame 0 with both set-ups (keeps the close-up shock; the copper comes 0.6 s later) · a run-up whoosh into the hit (a whoosh peaks 0.45 s after it starts: it would begin before frame 0) · Na⁺ lighter violet (VIVID set is test-locked; the +/− marks carry it) · bigger lattices (they fill 75–90% of the width already) |
| Chemistry #11 | 2 (after pass-1 fixes) | 5 | 5 | 6 | 5 | Copper bend still off screen → hard cut onto a nearly straight bar, a deep V (0.24) bent on camera · 2.0 s still, cracks vanishing → cut back lands on the first crack; cracks move with the shivering crystal (a bug: they slipped inside it) · frame 0 a still life → the hammer a hand above the crystal with a short trail, camera closer (the crystal a third of the width) · first blow left no mark → a crack and a corner knocked off at 0.2 s · whip-pans dead → hard cuts (snap) · grey/white hook, no warmth → warm key on the copper, cool rim on the salt, amber sparks where steel hits steel, the salt off pure white · split a gap, holds 1.7 s → a flash, a shake, a punch-in before, drift after; the recap 1.05 s · captions washed by dust → a dark band · copper tag unreadable → light, bigger · shock not dominant, cracks buried, burst smeared, second hook sagging → louder shock and cracks, no clang over the salt, the burst three hits, no dip before 4.9 s, the music loud from frame 0 | Cover with both set-ups (the cover is the hit, close; the copper comes 0.55 s later) · a speed ramp before the burst (the wind-up already holds back) · a top/bottom split answer (the two-shot is tightened instead) |
