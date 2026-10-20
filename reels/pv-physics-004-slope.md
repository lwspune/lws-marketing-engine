# @pyqvault_ · Physics, visualised #4 — tilt the ramp: when does the block slide?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11 · **Theme:** white (L22 rotation: P4 white) · **Format test:**
the first **predict-first** reel (learnings L28, L29): the question with A/B/C is on screen from frame 0, the caption opens
with "Comment your guess", no still title card, 23.0 s · **Made in Remotion** (`remotion/src/PvPhysics004.tsx`, physics +
timing `src/lib/pp004.ts`, tests `tests/pp004.test.ts`) · **Music:** `drive`, impact at the slip (9.7 s).
**Remade 2026-10-20** to framework v1 (`pyqvault-framework.md`): tilting from frame 0 (F5), rounded shapes (F8), five camera
moves (F9) and the experiment's own sound (F14–F16). The first version (still for 0.8 s, no effects) was never posted.
**Proven idea:** @mathsy.uk "Forces on a slope", 1.50M views (63× their typical reel),
https://www.instagram.com/reel/C3_I1WSKmyF/ (remake-backlog P4). Ours turns it into a prediction the picture settles.

## The physics (checked, and tested)

- 1 kg block, μs = 0.7, μk = 0.45; the plank tilts 3.6° a second from frame 0.
- It holds while mg sin θ ≤ μs mg cos θ (test: the pull never beats friction's limit before the slip) and slips the
  moment tan θ = μs: θ = atan 0.7 = 35.0° (test), so the answer is **B 35°**.
- Sliding: a = g(sin 35° − 0.45 cos 35°) ≈ 2.0 m/s², down the plank to the bottom stop (test: never back up, never off
  the plank), reaching it 1.44 s after the slip (11.2 s). The ramp eases to 37° and holds.

## What's on screen

| Time | Picture | Text (in frame) |
|---|---|---|
| 0 s → | **PHYSICS, VISUALISED #4 · Tilt the ramp. When does the block slide?** A 20° · B 35° · C 50° · *comment your guess 👇*; a blue block on a flat plank | |
| 0–9.7 s | the plank tilts; amber arrow (pull down the slope) grows, green arrow (friction) matches it | θ = N° · bars: pull vs friction max (N) · *Gravity pulls it down the slope* · *Friction holds it back… for now* |
| 9.7 s | the pull bar passes friction's limit; the block slips and slides to the stop; **B 35°** lights | *It slips at 35°!* |
| 13.3–19.6 s | | *It slips when tan θ = μ* · tan 35° = 0.70 = μ (0.7) |
| 19.6–23.0 s | end card | tan θ = μ = 0.7 → 35° · **That's the physics.** Follow for #5 · **pyqvault.com** |

## Camera (F9, `CAMERA` in `src/lib/pp004.ts`)

| Time | Move |
|---|---|
| 0–3 s | slow drift in (0.88 → 1.05) |
| 3.6–8.8 s | slow push in on the block as the slope steepens (→ 1.55) |
| 9.4–9.7 s | **punch-in landing on the slip** (→ 2.0) · whoosh in |
| 10.2–11.0 s | quick zoom out to watch it slide into the stop (→ 1.0) · whoosh out |
| 13.7–16.7 s | gentle push in for the rule (→ 1.3) |

## Sound (F14–F16, `SOUND` in `src/lib/pp004.ts`, tested)

- A soft **ratchet click at each whole degree** from 1° to 34°, rising in pitch: the tension builds.
- A **crack** at 35° as static friction lets go (on the music's impact).
- A **friction scrape** while it slides (9.7–11.2 s), as strong as the block's real speed.
- A wooden **thunk** as it hits the stop (11.2 s). Whooshes on the two fast zooms.
- Mix: music dips under the crack, scrape and thunk; peak −5.7 dB (no limiting needed).

## Files

- `pv-physics-004-slope.mp4` · `pv-physics-004-slope-cover.png` · `pv-physics-004-strip.png`
- Re-make: `cd remotion && npm test && npm run music:pp004 && npm run mix:pp004 && npm run render:pp004 && npm run cover:pp004`
  (the reel plays `public/pv-physics-004-slope-mix.wav`: music + effects)
