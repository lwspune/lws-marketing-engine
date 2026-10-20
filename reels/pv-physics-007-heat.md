# @pyqvault_ · Physics, visualised #7: hot gas meets cold: equal, apart or swap?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11 · **Topic:** remake-backlog **P9**, topic score **8/10**
(F21) · **Proven idea:** @bisal.physics "heat flows hot → cold", 457k views (54× their typical reel),
https://www.instagram.com/reel/DeGfT9iyQd3/ · **Framework v1.6** · **Background:** dark (L22: physics alternates, P6 was
white) · **Music:** `synthwave` (L34: a simulation → drive or synthwave; synthwave had the fewest posted reels), hit on the
answer · **Orbit:** none · **New:** first reel with real glow (bloom, L42) and a self-drawing arrow (`@remotion/paths`) ·
**Length:** 22.0 s · **Made in Remotion** (`remotion/src/PvPhysics007.tsx`, simulation + timing + sound
`src/lib/pp007.ts`, tests `tests/pp007.test.ts`).

## The physics (checked, and tested)

- 600 K beside 200 K at the **same pressure** (p = nkT, so the cold side holds 3× the molecules: 600 and 1,800). Same
  numbers of each would start the hot side at 3× the pressure: lifting the wall would cause a gust that overshoots
  (tried, rejected), not a clean heat flow.
- 2,400 hard spheres, elastic collisions (equal masses swap velocity along the line of centres), mirror walls. The tests
  check that total energy never changes (to 1e-9), no molecule crosses before the wall lifts, and all stay in the box.
- The end temperature is the molecule-weighted average, (600·600 + 1,800·200) / 2,400 = **300 K**. Answer **A equal**,
  lit when the two thermometers first read within 10 K (6.93 s).
- Thermometers show a 2 s average in 10 K steps. With 2,400 molecules a reading wobbles a few kelvin (a real gas has
  ~10²³); the tests check the cold side **never reads hotter** once they meet (the second law, as shown).
- One seeded simulation using only + − × ÷ √, so Node (tests, sound) and Edge (render) compute the identical run.
- Molecules slowed down and drawn huge (labelled on screen); each is coloured by its own speed.

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | question + A/B/C over the box; the hot side's molecules already flying and glowing gold, the cold side's slow and blue | **PHYSICS, VISUALISED #7 · Lift the wall: hot gas meets cold. Their temperatures end up…?** A equal · B apart · C swap |
| 1.0–1.6 s | the wall slides up and fades; the heat arrow draws itself between the thermometers | *Hot = fast molecules. Cold = slow.* |
| 2.6–6.9 s | the gases mix, colours spread, the arrow thins, the graph's two lines close in | *Each bump passes speed along* |
| 6.93 s | both read 300 K: punch-in · **A equal** lights · the 300 K line appears on the graph | *Equal: both 300 K* |
| 9.9–18.6 s | the mix stays even, readings stay level | *Heat flows hot → cold* · *Never back on its own* · *That's the second law* |
| 18.6–22 s | end card | Heat flows hot → cold. Never back. **That's the physics.** Follow for #8 · **pyqvault.com** |

## Camera (F9) and sound (F14–F16)

- A drift towards the hot side from frame 0 → slow push in as the wall lifts → **punch-in landing on the answer**
  (whoosh) → quick zoom out to the whole box (whoosh) → gentle push for the last line.
- Molecules tapping the end walls: one tap per 50 real hits, as loud as their average impact energy, so the hot end
  softens and the cold end grows louder as the heat moves (306 taps). The wall's slide (scrape) and stop (thunk).
  Mix: effects 9.2 dB under the music, peak −3.8 dB.

## Files

- `pv-physics-007-heat.mp4` · `pv-physics-007-heat-cover.png` (0.8 s, wall still down) · `pv-physics-007-strip.png`
- Re-make: `cd remotion && npm test && npm run music:pp007 && npm run mix:pp007 && npm run render:pp007 && npm run cover:pp007`
