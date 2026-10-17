# Reel 014 — 3D #1: θ changes, the angle doesn't

**Handle:** @lws.pune · **Format:** white visual reel, the **first real 3D reel** (Remotion + three.js: the
camera circles from frame 0), no filming, no face, no voice · **Music:** house lo-fi, rendered offline from
`engine.js` (`reels/tools/music.mjs`), chime on the answer · **Length:** 31.5 s
**Source:** NDA 2026 (II), Maths, Q68, chapter Vectors (question id `687c01b9-37bb-4633-84aa-a47d53fbd399`,
stem "How much angle does r = (cos θ) î + (sin θ) ĵ + k̂ make with the positive direction of z-axis?").
Answer key **(c) π/4**, re-derived by hand.

Made in `remotion/` (`src/Reel014.tsx`, timeline `src/lib/reel014.ts`, tests `tests/reel014.test.ts`), not
from a `.render.html`. Tests L25 (3D + frame-exact render vs the 5–7 s exit point).

## The maths (checked)

- |r| = √(cos²θ + sin²θ + 1) = √(1 + 1) = √2; its z-part is 1.
- cos γ = (r · k̂) / |r| = 1/√2, so **γ = π/4** whatever θ is → **(c)**.
- Picture: the tip is always at height 1, radius 1 from the z-axis (a circle), so r sweeps a cone; every r is
  the long side of the same "up 1, across 1" right triangle, which has a 45° corner at the origin.
- Traps: **(a) π/2** is the angle between the z-axis and r's floor shadow (cos θ, sin θ, 0).
  **(b) π/3** comes from cos γ = 1/2, i.e. using |r| = 2 (forgetting the √).

## What's on screen

| Time | Picture | Caption |
|---|---|---|
| 0–3.2 s | question card + options + 3D axes on frame 0; camera already circling | θ keeps changing. Does the angle? |
| 3.2–7 s | r grows from the origin; dashed "across 1" at height 1 | Draw r for one θ. |
| 7–12 s | θ runs once round: the tip traces the rim, r paints a see-through cone | Let θ run. It sweeps a cone. |
| 12–17 s | the triangle lights up (1, 1, √2) facing the camera; 45° arc; working: \|r\| = √2, cos γ = 1/√2 ⇒ γ = 45° | Up 1, across 1. |
| 17–21.6 s | θ turns once more under a live counter: θ = …°, γ = 45° | Same triangle for every θ. |
| 21.6–25 s | (c) π/4 fills with the accent + chime at 21.8 s; wrong options step back | Answer: (c) π/4 |
| 25–28.5 s | dashed floor shadow at 90° to z (muted); working: \|r\| = √2, not 2 | Trap (a) π/2: that is the shadow. Trap (b) π/3: you forgot the √. |
| 28.5–31.5 s | soft end card | Up 1, across 1? · Always 45°, for any θ. · Follow for more |

## Files

- `nda-maths-014-cone.mp4` (1080×1920, 30 fps, made with `cd remotion && npm run music:014 && npm run render:014`)
- `nda-maths-014-cone-cover.png` (`npm run cover:014`): the full cone, "θ changes. The angle doesn't."

## Before you post (approval gate)

- [ ] Watch it once on your phone: labels readable, the 3D motion smooth, the music feels right
- [ ] Caption has NDA 2026 (II), Q68, answer (c)
- [ ] Approve it in the publisher app (Queue tab); it was added as Ready
