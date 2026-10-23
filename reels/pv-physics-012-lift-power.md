# @pyqvault_ · Physics, visualised #12: same box, same height. Faster lift, more work?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11 · **Topic:** idea **P6** ("Same lift, faster = more
power", score 66/100; remake of @sciencevisualised 1.33M, 76× their typical reel), Hook queue row 3 · **Hook:** You'd
think · **Opening:** Orbit 360° (F22, silent) · **Second hook:** "So what did speed change?" (a replay paused mid-climb,
punch-in on the power meters) · **Loop:** no (end card) · **Framework v1.27** · **Background:** white (L22: white 11, dark
13 in reels made) · **Music:** `drive` (F13 / L34: lifts in motion; Chemistry #9 was synthwave), hits on the answer and the
second hook · **Voice:** none, silent: the second **L62** reel (each lift's joule count is the answer and counts again past
it) · **Length:** 19.2 s · **Made in Remotion** (`remotion/src/PvPhysics012.tsx`; timeline, beat table, physics and sound
`src/lib/pp012.ts`; tests `tests/pp012.test.ts`).

## The physics (checked, and tested)

- Lifting at a steady speed, the work is W = mgh = 50 kg × 9.8 m/s² × 3 m = **1,470 J**, whatever the speed: answer
  **B the same**. The counts show mgh as each crate rises; both land on 1,470 J (tested on every frame).
- Power is work per second, P = W ÷ t = mgv: 1,470 J in 3 s = **490 W** (1 m/s), in 6 s = **245 W** (0.5 m/s). The meters
  show mgv while a lift climbs and 0 at rest; on the graph of work against time the slope is the power.
- The replay is labelled: "⏪ replay" as both crates go back down (counts to 0), "⏸ paused" while the picture holds
  mid-climb (the meters keep the reading they had), "▶" as it runs on. The starts and stops are idealised (no
  speeding up or slowing down), as in the textbook.

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–2.8 s | the camera orbits two lift towers; both crates rising from 0.4 s; joule counts climbing | **PHYSICS, VISUALISED #12 · Same box, same height. Faster lift, more work?** A more · B the same · C less · tag |
| 3.4 s | the fast crate arrives (thunk), its count stops at 1,470 J | Fast lift: there already |
| 5.8–6.6 s | punch-in on the tops (whoosh-in); the slow crate arrives at 6.4 s | Slow lift: still climbing |
| 6.8 s | **B the same** lights, 1,470 J and 1,470 J | Same work: 1,470 J each |
| 7.0–7.6 s | zoom out (whoosh-out), ⏪ replay: both back to the floor | |
| 7.8 s | both climb again; 8.6 s ⏸ (thunk), punch-in on the meters (whoosh-in): 490 W vs 245 W; the graph's slopes labelled | So what did speed change? · Power: work done per second |
| 11.0 s → | ▶, zoom out (whoosh-out): they finish (thunks), 1,470 J each again | Twice as fast, twice the power · 490 W vs 245 W · Same work. Half the time. |
| 16.8–19.2 s | end card | Power = work ÷ time · pyqvault.com · Follow for #13 |

**Colours (F24):** the fast lift orange, the slow lift blue (VIVID.white, told apart for colour-blind viewers; tested), for
the counts, meters, tags, platform stripes and graph lines; the crates are wood and the towers steel (REAL).

## Files

- `pv-physics-012-lift-power.mp4` · `pv-physics-012-lift-power-cover.png` (1.2 s: mid-orbit, neither crate has arrived)
- Re-make: `cd remotion && npm test && npm run music:pp012 && npm run mix:pp012 && npm run render:pp012 && npm run cover:pp012`
