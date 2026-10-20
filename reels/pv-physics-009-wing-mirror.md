# @pyqvault_ · Physics, visualised #9: a car in your wing mirror: closer or farther than it looks?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 12 · **Topic:** remake-backlog **P29**, topic score **7/10**
(F21), the second of the Ray Optics run · **Proven idea:** @bisal.physics' convex-mirror reel, 52k views (6.2× their
typical reel), https://www.instagram.com/reel/Deb17aCSjg2/ · **Framework v1.13** · **Background:** dark (L22: physics
alternates, #8 was white) · **Colours:** the first reel made under F24 from the start (VIVID.lab; real materials keep their
look: silver glass, window glass, tyres, asphalt) · **Music:** `drive` (L34: all five styles at 3, drive fits a car, not trap
twice in a row), hit on the answer · **Orbit:** 360° opening (F22) · **Caption:** without the answer (F6) · **Voice:**
Kokoro `af_heart` (F23; silent render alongside) · **Length:** 21.3 s · **Made in Remotion** (`remotion/src/PvPhysics009.tsx`,
optics + timing + sound `src/lib/pp009.ts` with its beat table, tests `tests/pp009.test.ts`).

## The physics (checked, and tested)

- A wing mirror is a convex mirror, f = −F (F = 1, R = 2 in world units). 1/v + 1/u = 1/f gives v = −uF/(u + F): behind the
  glass and within F; m = −v/u = F/(u + F): upright and below 1 for every u. Re-derived in the tests from u = 3.6 to 0.3.
- Why it looks farther: from the driver's seat (the eye d = 1.53 from the glass) a flat mirror would show the car full size,
  u behind the glass, seen from d + u; the convex mirror shows it m times as tall, |v| behind, seen from d + |v|. Angular
  size ratio m(d + u)/(d + |v|) < 1 (×0.64 at the end): it looks smaller than a flat mirror shows it, so it looks farther.
  The reel states the size ("×0.64 as big"), not a distance: how far something *looks* is perception, not a formula.
- The wider view: the eye's lines to the glass's top and bottom edges, reflected by r = i − 2(i·n)n with the convex
  glass's real normals (tilted out at the edges) vs a flat mirror's (+x). The tests check the reflection law at each edge
  and that the convex view is more than twice as wide.
- Five rays from the car's roof: each lands on the glass and heads back out on a line through the image (exact); the
  pole ray reflects at equal angles; the parallel ray seems to come from F to within the glass's depth (< 0.06).
- The image car is scaled by m in all three directions so it reads as a car; strictly its depth shrinks by m² (not
  shown). The scene is labelled "not to scale" (a real wing mirror is far smaller than a car, and real cars farther).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–2.8 s | question + A/B/C; the camera goes once round the mirror and the road; the blue car drives in, wheels turning | **PHYSICS, VISUALISED #9 · A car in your wing mirror. Is it closer or farther than it looks?** A closer · B farther · C same |
| 3.0–3.9 s | five rays (cyan, pink, yellow, green, violet) draw from the roof to the glass and back out; dashed lines meet behind the glass at a small upright car | |
| 4–8.6 s | the car comes closer and stops; the image grows but stays smaller; the graph draws under the flat mirror's ×1 line | *Its image: upright, but small* · *Even up close: always smaller* |
| 8.6 s | punch-in; **A closer** lights; "what you see": flat mirror vs wing mirror, ×0.64 as big | *Smaller looks farther: it's closer!* |
| 11.4 s | zoom out; the eye; its view off the glass: a wide green wedge vs a flat mirror's narrow dashed one | *But you see far more road* |
| 14.4 s | "OBJECTS IN MIRROR ARE CLOSER THAN THEY APPEAR" under the wing-mirror view | *That's why the glass warns you* · *Convex: smaller image, wider view* |
| 18.8–21.3 s | end card | Wing mirror: convex, image always smaller. **So the car is closer than it looks** · Follow for #10 · **pyqvault.com** |

## Camera (F9, F22) and sound (F14–F16)

- The 360° orbit from frame 0 (no whoosh), at the front by 2.8 s → slow push while the car comes → **punch-in landing on
  the answer** (whoosh) → quick zoom out for the view (whoosh) → slow push for the last lines.
- The car's engine: a low rumble as loud as its speed, silent once it stops. Light is silent.

## Made with the storyboard steps (runbook, 2026-10-21)

The beat table sits at the top of `src/lib/pp009.ts`; the voice was measured before the captions were timed (two lines moved:
the first caption to 6.1 s, the last to start at 16.3 s); the stills sheet caught pastel colours (the dark set's light
shades under 3D light: VIVID.lab moved to the 500 shades) and labels landing on the answer chips (kept inside the band).

## Files

`pv-physics-009-wing-mirror-voice.mp4` (voiced, in the manifest) and `pv-physics-009-wing-mirror.mp4` (silent) · cover
`pv-physics-009-wing-mirror-cover.png` (4.5 s, before the answer) · `pv-physics-009-wing-mirror.post.json` · strip
`pv-physics-009-strip.png`. Re-make: `cd remotion && npm run music:pp009 && npm run voice:pp009 && npm run mix:pp009 && npm
run render:pp009 && npm run render:pp009v && npm run cover:pp009`.
