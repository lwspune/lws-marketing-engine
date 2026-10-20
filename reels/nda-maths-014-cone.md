# Reel 014, 3D #1 (remade 2026-10-20): r = (cos θ, sin θ, 1), θ keeps turning, its angle with the z-axis…?

**Handle:** @lws.pune (project `pyq-vault`) · **Framework:** `lwspune-framework.md` v1.1 · **Made in Remotion 3D**
(`remotion/src/Reel014.tsx`, timeline `src/lib/reel014.ts`, tests `tests/reel014.test.ts`) · **Music:** `calm`, hit on the
answer · **Orbit:** one, 90° in the opening (F22) · **Length:** 22 s · **Slot:** Thu 23 Oct 15:40. The first version (31.5 s,
the exam question on screen throughout) was taken back before posting; it's in git history.

## The idea (checked, and tested)

- r goes up 1 and across 1 for every θ (cos²θ + sin²θ = 1): |r| = √2, cos γ = 1/√2, γ = 45° → **B** (the tests compute
  the angle from the vector on every frame; the live strip shows that same number).
- As θ turns, r sweeps a cone around the z-axis. Trap: 90° is the angle of its floor shadow, not of r.
- NDA 2026 (II) Maths Q68: angle with the +z-axis → (c) π/4; trap (b) π/3 = cos γ = 1/2 with the √ forgotten. Caption only.

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–2.2 s | question + A varies · B 45° · C 90°; the camera orbits 90° while the arrow grows and sweeps its cone once | **NDA MATHS · 3D VECTORS · r = (cos θ, sin θ, 1). θ keeps turning. Its angle with the z-axis…?** · *θ turns: the arrow sweeps a cone* |
| 2.6–5 s | the "up 1, across 1, √2" triangle and the 45° arc, side-on | *Up 1, across 1, every time* |
| 5.0 s | punch-in · **B** lights | *Always 45°, whatever θ is* |
| 9–12.5 s | the floor shadow and its 90° | *90° is only its shadow* |
| 12.5–18.6 s | zoom out to the whole cone, θ keeps turning | *\|r\| = √2, not 2* · *Same triangle all the way round* |
| 18.6–22 s | end card | Up 1, across 1? **Always 45°, for any θ.** Follow for more |

The fixed strip above the 3D (F9) shows θ racing while "angle with z = 45.0°" never moves. Sound: a click at every
30° mark of θ, a thunk on the answer.

## Files

- `nda-maths-014-cone.mp4` · `-cover.png` (1.6 s, mid-orbit) · `nda-maths-014-strip.png` · `.post.json`
- Re-make: `cd remotion && npm test && npm run music:014 && npm run mix:014 && npm run render:014 && npm run cover:014`
