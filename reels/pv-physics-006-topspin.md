# @pyqvault_ · Physics, visualised #6: same tennis shot with topspin: dip, float or neither?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11 · **Topic:** remake-backlog **P12**, topic score **8/10**
(F21; tied with P9 and P11, picked on the bigger views multiple, framework v1.5) · **Proven idea:** @sciencevisualised
"topspin vs slice", 1.10M views (63× their typical reel), https://www.instagram.com/reel/Dbvz1s7M3C6/ · **Framework
v1.5** · **Background:** white (L22: P5 was dark) · **Music:** `drive` (L34: every style had 2 reels; motion → drive; not
the same as Chemistry #5's lofi before it), hit on the answer · **Orbit:** none (F22: the spin and the dip read only from
this side; Chemistry #5 carries the orbit test) · **Length:** 22.0 s · **Made in Remotion**
(`remotion/src/PvPhysics006.tsx`, physics + timing + sound `src/lib/pp006.ts`, tests `tests/pp006.test.ts`).

## The physics (checked, and tested)

- A real tennis ball (57 g, radius 3.3 cm) from 1 m, 26 m/s (94 km/h) at 14°. Forces: gravity, drag ½ρC_D A v²
  (C_D 0.55) and Magnus lift ½ρC_L A v² at right angles to the velocity (C_L 0.25, the same spin rate both ways),
  ρ = 1.2 kg/m³. Integrated with RK4; the tests re-run it with a separate Euler integration (agree within 2 cm).
- **No spin:** 25.6 m, out (singles court 23.77 m). **Topspin:** lift points down, clears the net (2.0 m up at the net) and
  dips in at **20.1 m**. **Backspin:** lift points up, floats to 33.2 m. Answer **A dip**.
- The why (NCERT Class 11, dynamic lift): the spinning ball drags the air round and throws it off one way; the air is
  pushed one way, the ball the other (topspin: air up, ball down).
- Shown in slow motion ×0.4 (labelled on screen); balls drawn 8× their size (labelled); the drawn spin (1.2 turns a
  second) is slowed for the eye (a real ball turns ~35 times a second).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | question + A/B/C over the court; three balls already spinning on the ball machine | **PHYSICS, VISUALISED #6 · Same shot, now with topspin. The ball will…?** A dip · B float · C neither |
| 1.0 s | the machine fires; trails draw, Magnus arrows (down on topspin, up on backspin), live distances | *Same hit, three spins (slow motion)* |
| 3.4–3.9 s | topspin bounces inside: punch-in · **A dip** lights · IN | *Topspin dips in. The rest: out!* |
| 4.3 / 5.8 s | no spin and backspin land beyond the baseline: OUT | |
| 6.3–15.4 s | close-up: the air streaming past a spinning ball, thrown up (topspin) then down (backspin) | *Topspin throws the air upward* · *Air goes up, ball goes down* · *Backspin: air down, ball floats* |
| 15.4–18.6 s | back to the court, push in on the bounce inside | *That's why players hit topspin* |
| 18.6–22 s | end card | Air thrown up, ball pushed down. **That's the physics.** Follow for #7 · **pyqvault.com** |

## Camera (F9) and sound (F14–F16)

- On the machine from frame 0 → follows the balls down the court → **punch-in landing on the answer** (whoosh) → slow pan
  out to the long landings → quick zoom out for the air picture (whoosh) → gentle push in at the end.
- The machine fires once (whump), a bounce (thunk) as each ball lands, whooshes on the fast zooms. No effect for the
  air close-up: it's a drawing, not a sound you'd hear.

## Files

- `pv-physics-006-topspin.mp4` · `pv-physics-006-topspin-cover.png` (0.8 s, balls still on the machine) · `pv-physics-006-strip.png`
- Re-make: `cd remotion && npm test && npm run music:pp006 && npm run mix:pp006 && npm run render:pp006 && npm run cover:pp006`
