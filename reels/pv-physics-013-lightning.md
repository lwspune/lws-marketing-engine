# @pyqvault_ · Physics, visualised #13: lightning hits your car. What saves you?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 12 · **Topic:** idea **P51** ("Lightning hits a car: the
metal body, not the tyres, keeps you safe", score 55/100; the founder's pick, 2026-10-23), Hook queue row 3 · **Hook:**
You'd think (most people believe the rubber tyres save you) · **Opening:** **Shock**, the first one (F25, founder
2026-10-23): the strike lands inside the first second · **Second hook:** "Is a convertible safe?" (the roof folds into the
boot, a second bolt strikes into the cabin) · **Loop:** yes · **Framework v1.28** (F10: entertainment first, the result
real) · **Background:** dark (lightning and its glow need it) · **Music:** `trap` (F13 / L34: dark and dramatic; trap has
the fewest posted reels), hits on both answers · **Voice:** none (silent) · **Length:** 17.0 s · **Made in Remotion**
(`remotion/src/PvPhysics013.tsx`; timeline, beat table, physics and sound `src/lib/pp013.ts`; tests `tests/pp013.test.ts`).

## The physics (checked, and tested)

- A car's body is a closed metal shell, a conductor. A bolt's charge spreads over its **outside** and runs down to the road;
  it jumps the last gap past the tyres (kilometres of air didn't stop it, a few centimetres of rubber won't). Answer **B
  metal body**. Tested: every point of the charge's four paths lies on the outer shell, never inside the cabin.
- Inside a closed conductor with no charge inside, Gauss's law gives zero flux through any surface in the cabin, so **E = 0**
  there. The field lines from the cloud end on the outside of the metal, at right angles to it; none enter the cabin (tested).
- A convertible with the roof down has no metal over the cabin, so there is no cage: the second bolt's path runs through
  the seat (a crash-test dummy; nobody real). Weather services advise the same: hard-topped metal cars are safe, soft tops
  are not.
- A flash is a few return strokes down one channel, tens of milliseconds apart: here 3, 60 ms apart. Rain falls at 9.2 m/s
  (real drops: about 9 m/s). The charge is drawn creeping at a few metres a second: slow motion, said in the caption with
  "Objects not drawn to scale" (F10), nothing on screen.

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–0.2 s | rain; the leader already zig-zagging down | **PHYSICS, VISUALISED #13 · Lightning hits your car. What saves you?** A tyres · B metal body · C luck · tag |
| 0.2–0.4 s | strike on the roof: 3 return strokes, white flashes, sparks, camera shake (crack + thunder) | |
| 0.4–3.6 s | cyan charge streams from the roof down the outside of the shell; arcs at the wheels (crackle) | Charge races over the metal (2.8 s) |
| 3.6 s | the camera drops to the front wheel: the arc jumps past the tyre | It jumps right past the tyres |
| 5.4 s | punch-in on the cabin (whoosh-in): the dummy untouched, "E = 0"; **B metal body** lights | The metal shell carries it |
| 6.6 s | zoom out (whoosh-out), the roof folds into the boot | Is a convertible safe? |
| 7.8 s | a second bolt strikes into the open cabin (crack + thunder); a red path through the seat | No roof: no cage (9.0 s) |
| 10.8–11.6 s | the roof folds back; zoom out (whoosh-out) | |
| 11.4 s | field lines from the cloud end on the metal; "E = 0" inside | Inside a metal shell: E = 0 |
| 13.6 s | slow push in, rain | Stay inside, windows up |
| 15.6–17.0 s | loop: the lines fade, the chips reset, a new leader starts at 16.7 s | |

**Colours (F24):** the body is steel (REAL); the charge cyan and the convertible's danger path red (VIVID.lab, told apart
for colour-blind viewers, and each from the steel; tested); the dummy crash-test yellow; the bolt white-violet, glowing.

**Sound (F14, F16):** a crack per return stroke and thunder after each strike, the arcs' crackle, rain under it all;
effects 5.6 dB under the music (`npm run mix:pp013`).

## Files

- `pv-physics-013-lightning.mp4` · `pv-physics-013-lightning-cover.png` (0.36 s: the strike, before any answer)
- Re-make: `cd remotion && npm test && npm run music:pp013 && npm run mix:pp013 && npm run render:pp013 && npm run cover:pp013`
