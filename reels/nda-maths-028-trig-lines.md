# @lws.pune · 028, Why? #16: the six trig ratios are six real lines

**Handle:** @lws.pune (project `pyq-vault`, post slug `nda-maths-028-trig-lines`) · **Series:** Why? #16 · **NDA link:**
NDA 2024 (II) Maths Q79 (question id `50d1cbe8-cb76-4d0d-86a0-7e61869cd845`), named in the caption · **Proven idea:**
remake-backlog W32, @official_neutron_and_numbers' "This Visualisation Makes Trig Click"
([reel](https://www.instagram.com/reel/DblFTtdhlhn/), 1.1M views, 59× their typical reel; lesson L76).

**How this version was made (founder, 2026-10-28):** the first version followed our house framework (3D, white board,
a question first, captions read aloud) and the founder rejected it: "i asked you to make exact one" and "hardly any
cadence in voice". This one copies the studied reel's look, order, titles, effects and pace: a dark starfield, a
glowing cyan circle, flat neon lines drawn as the narration names them, a coloured title per step, their ripple, glow,
glitch, arrow and gentle zooms. **One change, the founder's choice:** cot and cosec are drawn where they really are
(theirs sends cosec up-left off θ's ray and cot left of the y-axis). **Voice:** a continuous narration in our own
words (theirs is not copied), Kokoro `af_heart`, chosen by the founder from two samples (Mary had more pitch movement,
10.2 vs 6.8 semitones; the founder preferred af_heart). Voiced only: the reel is built round its narration.
Framework points this reel sets aside at the founder's word: F34 (3D), F12 (white board), F4 (question first), F13 / F17
(no voice; voice only on-screen words), F20 (end card), F22 (orbit). **Music:** `calm`, made in code, dipping under the
voice. **Length:** 49.6 s (theirs 44.8 s). **Made in Remotion** (flat SVG: `remotion/src/Reel028.tsx`; geometry,
narration, beats, words and sound in `src/lib/reel028.ts`; tests in `tests/reel028.test.ts`).

## The maths (checked, and tested)

- On a circle of radius 1 with angle θ: the drop from the point to the x-axis is **sin θ**, the base is **cos θ**.
- The line touching the circle at (1, 0), cut off by θ's ray, is **tan θ** (tangent = touching); the slant from the
  centre to it is **sec θ** and cuts the circle (secant = to cut). Right angle at (1, 0): 1 + tan²θ = sec²θ.
- The line touching the top, y = 1, cut off by the same ray at (cot θ, 1), is **cot θ**; the slant to it is **cosec θ**.
- Tests check every line's length against its ratio, and that T and C lie on θ's own ray.
- **NDA 2024 (II) Q79:** lim θ→π/2 (sec θ − tan θ) = (1 − sin θ)/cos θ = cos θ/(1 + sin θ) → **0 → (B)**.

## Narration (af_heart) and steps

| Starts | Narration | Title / picture |
|---|---|---|
| 0.3 s | Take a circle with radius one. | *Start with a circle of radius 1*; the circle draws, a ripple |
| 2.55 s | Pick an angle, theta, and draw its radius. | *Choose an angle θ*; the radius swings to 40°, a glow |
| 5.45 s | Now drop a line straight down to the x-axis. That height is sine theta. | *Sine is the Height*; green drop |
| 10.04 s | And the shadow it leaves along the x-axis? That's cosine theta. | *Cosine is the Base*; yellow base, a push in |
| 14.08 s | But why is tangent called tangent? | *Why is it called Tangent?* |
| 16.24 s | Draw a line that just touches the circle on the right, going straight up. | thin cyan touching line |
| 20.06 s | Now stretch the radius until it meets that line. | the radius runs on |
| 23.06 s | That piece is the real tangent. It touches the circle. | a glitch, cyan tan θ; *Tangent = Touching* |
| 26.64 s | And the slanted line from the centre up to it? That's the secant. It cuts right through the circle. | *Secant Cuts the Circle*; orange slant, sparks where it cuts |
| 32.17 s | Secant literally means to cut. | *Secant = To Cut* |
| 34.31 s | Now do the same at the top. Draw a line that touches the top of the circle, and stretch the radius to meet it. | *Cotangent at the Top*; the arrow, the top line, the ray |
| 40.74 s | That top piece is cotangent. | purple cot θ |
| 42.80 s | And the slanted line from the centre to it is cosecant. | *Cosecant*; pink slant, sparks where it cuts |
| 46.11 s | Six ratios. Six real lines. | *Six Actual Lines*; the six lines glow in turn |

**Cover:** 49.0 s, the full six-line figure with "Six Actual Lines" moved down into the grid's 3:4 crop.

## Files

- `nda-maths-028-trig-lines-voice.mp4` · `nda-maths-028-trig-lines-cover.png`
- Re-make: `cd remotion && npm test && npm run music:028 && npm run voice:028 && npm run mix:028 && npm run render:028v &&
  npm run cover:028`

## Before you post (founder)

- [ ] Watch it once on the phone with sound
- [ ] Queue it in GoPost (Instagram, Facebook, LWS Pune YouTube)
