# @pyqvault_ · Physics, visualised #10: 30° or 60°, same speed: which lands farther?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11 · **Topic:** remake-backlog **P11**, topic score **8/10**
(F21), first of the Hook queue · **Proven idea:** @sciencevisualised's fan of launch angles, 193k views (11× their typical
reel), https://www.instagram.com/reel/Dc3b1oVsuzr/ · **Framework v1.15**, the first reel with all of it: hook **Pick one** with
the opening **Race running** (F25, no orbit), a **second hook** at the answer (F26), a **loop** instead of an end card (F27),
**"PYQ Vault · pyqvault.com"** under the question for the whole reel (F20) · **Background:** white (L22: physics alternates, #9
was dark) · **Colours:** VIVID.white (F24), one per angle: 15° orange, 30° blue, 45° green, 60° red, 75° violet · **Music:**
`synthwave` (L34: drive and synthwave fit motion; synthwave has fewer posted + queued, and #9 was drive), hits on both answers
· **Caption:** without the answer (F6) · **Voice:** none: the founder picked the silent render over the voiced one (Kokoro `af_heart`, F23) · **Length:** 18.5 s ·
**Made in Remotion** (`remotion/src/PvPhysics010.tsx`, physics + timing + sound `src/lib/pp010.ts` with its beat table, tests
`tests/pp010.test.ts`).

## The physics (checked, and tested)

- Real numbers: v = 30 m/s, g = 9.8 m/s², no air; the reel plays in real time. x = v cos θ t, y = v sin θ t − g t²/2; the
  tests solve y = 0 for the flight time T = 2v sin θ / g and check x(T) = R = v² sin 2θ / g for every angle, and the top of
  each arc at half the range, v² sin² θ / 2g.
- 30° and 60°: sin 60° = sin 120°, so both land at **79.5 m**; 30° lands first (3.06 s), 60° later (5.30 s). That's the
  race's trap: the first ball down looks like the winner. 15° and 75° tie at **45.9 m**. 45° goes farthest, **91.8 m**
  (sin 2θ = 1); the tests check every whole angle from 1° to 89° against it.
- "No air" is on the graph card; with air the best angle is a little under 45°, so the reel never claims 45° for real
  throws. The balls are drawn far bigger than real ("balls not to scale").

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s (loop) | 30° and 60° already 0.3 s into flight, each with its trail; five launchers in lanes on a sand field | **PHYSICS, VISUALISED #10 · Pick one. Don't switch. Which lands farther?** A 30° · B 60° · C same · PYQ Vault · pyqvault.com · comment your guess 👇 |
| 2.76 s | 30° lands: blue flag, "79.5 m"; 60° still high | *30° lands first…* |
| 5.00 s | 60° comes down on the same flag; punch-in; **C same** lights; both dots on the graph, joined | *Same spot!* |
| 6.40 s | zoom out; all five fire together (the second hook) | *Then which angle goes farthest?* |
| 10.73 s | 45° lands farthest: green flag, "91.8 m" | *45° goes farthest!* |
| 11.70 / 12.31 s | 60° lands on the 79.5 m flag, 75° on the 45.9 m flag; the twins' dots join | *Angles adding to 90° tie* |
| 14.8 s | R = v² sin 2θ / g draws through the five dots, its top at 45° | *The curve peaks at 45°* |
| 17.3–18.5 s | the field clears, the chips un-light, "comment your guess" returns; 30° and 60° fire again: the last frame runs on into frame 0 | |

## Camera (F9) and sound (F14–F16)

- A slow push from frame 0 while the pair flies → **punch-in landing on the answer** at the shared flag (whoosh) → quick zoom
  out as all five fire (whoosh) → a slow drift for the graph → back to the opening view by the end, at rest, so the loop
  has no seam. No orbit: the opening is the race already running (F25).
- A soft pop as each volley fires on screen, a thunk at every landing.

## Made with the storyboard steps

The voice was measured before the captions were timed: "30°" reads as "thirty degrees" (as long as the spelled-out
version), but "79.5 m" reads "m" as a letter and "∝ sin 2θ" can't be checked, so the distances stay on the flags and the
formula on the graph, and the captions use plain words. The stills sheet caught a field too small in the frame (camera
brought side-on), "91.8 m" cut at the edge and then overlapping "79.5 m" (labels centred over their flags), and the
formula sitting on the curve's peak (headroom added).

## Files

`pv-physics-010-launch-angles.mp4` (silent, with the tag: **in the manifest, the founder's pick**, 21 Oct) ·
`pv-physics-010-launch-angles-voice.mp4` (voiced, with the tag) · `pv-physics-010-launch-angles-voice-before.mp4` (voiced, **without** the tag: the "before" for the
founder's comparison, not posted) · cover `pv-physics-010-launch-angles-cover.png` (3.6 s, before the answer) ·
`pv-physics-010-launch-angles.post.json`. Re-make: `cd remotion && npm run music:pp010 && npm run voice:pp010 && npm run
mix:pp010 && npm run render:pp010v && npm run render:pp010 && npm run render:pp010before && npm run cover:pp010`.
