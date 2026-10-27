# @lws.pune · 028, Why? #16: circle of radius 1. Which line is tan θ? (the six trig ratios are six real lines)

**Handle:** @lws.pune (project `pyq-vault`, post slug `nda-maths-028-trig-lines`) · **Series:** Why? #16 ·
**Storyboard:** [nda-maths-028-trig-lines.storyboard.md](nda-maths-028-trig-lines.storyboard.md), reviewed by an
independent agent before any code (F31; 5 blockers: 2 fixed, 3 declined with reasons; 3 improvements taken) · **NDA
link:** NDA 2024 (II) Maths Q79 (question id `50d1cbe8-cb76-4d0d-86a0-7e61869cd845`), named in the caption · **Proven
idea:** remake-backlog W32, @official_neutron_and_numbers' "This Visualisation Makes Trig Click"
([reel](https://www.instagram.com/reel/DblFTtdhlhn/), 1.1M views, 59× their typical reel of 18.7k; studied 2026-10-27).
Their idea, our picture and words: theirs draws cot and cosec in the wrong place; ours is correct, asks first, shows
**why** the height is tan θ (the stretch), both identities, real 3D and a live sweep with numbers; topic score 8/10 ·
Made with `lwspune-framework.md` v1.12 (3D, F34) · **Look:** white board; a glossy ink ring on a thin glass disc; sin
green, cos cyan, tan blue, sec orange, cot violet, cosec pink (every pair that meets checked for colour-blind viewers) ·
**Music:** `calm` · **Voice:** two cuts, the founder picks: **voiced** (Kokoro `af_heart`, the founder's ask,
2026-10-27; it reads only the words on screen: the question, each caption, the end line) and **silent** (the house
rule, F13) · **Length:** 27.3 s (a "why" build, F18) · **Made in Remotion 3D** (`remotion/src/Reel028.tsx`; figure,
camera, labels, voice lines and sound in `src/lib/reel028.ts`; tests in `tests/reel028.test.ts`).

## The maths (checked, and tested)

- On a circle of radius 1 with the angle θ at the centre, the point on the circle is (cos θ, sin θ): the small
  triangle has **height sin θ** and **base cos θ**.
- Stretch that triangle from the centre by 1/cos θ: its base becomes 1 (it reaches the circle's edge) and its height
  becomes sin θ ÷ cos θ = **tan θ**, standing exactly on the line that touches the circle at (1, 0) → **B** (tested: the
  stretch takes (cos θ, 0) to (1, 0) and (cos θ, sin θ) to (1, tan θ)). That's the name: *tangent* = touching.
- The slant from the centre to the top of tan θ is the stretched radius: 1 × 1/cos θ = **sec θ**, and it cuts through
  the circle (*secant* = cutting). Right angle at (1, 0): **1 + tan²θ = sec²θ**.
- The same against the line touching the top, y = 1: θ's ray meets it at (cot θ, 1). The angle there is θ again
  (alternate angles), so the top piece is 1 ÷ tan θ = **cot θ** and the slant is **cosec θ** = 1 ÷ sin θ. Right angle at
  (0, 1): **1 + cot²θ = cosec²θ**. sec θ and cosec θ lie on the same ray, so they are drawn side by side in two lanes.
- Every length is computed from θ in one function used by the picture and the tests; the readouts are the true values
  to 2 dp at each frame's θ (40°: sin 0.64, cos 0.77, tan 0.84, sec 1.31, cot 1.19, cosec 1.56).
- **NDA 2024 (II) Q79:** "What is lim θ→π/2 (sec θ − tan θ) equal to?" sec θ − tan θ = (1 − sin θ)/cos θ =
  cos θ/(1 + sin θ) → 0/2 = **0 → (B)** (tested numerically). Matches the bank. The picture shows it: as θ grows both
  lines shoot up, but their gap shrinks (40°: 0.47, 62°: 0.25).
- **Traps:** A (the drop) is sin θ: the opposite side of a triangle whose base is cos θ, not 1. C (the long slant) is
  sec θ.
- **Their mistake, not repeated:** the studied reel draws cosec from the centre up-left, off θ's ray, and cot left of the
  y-axis. Both end where θ's own ray meets the top touching line.

## On screen

| Time | Picture | Text (voiced cut: spoken word for word) |
|---|---|---|
| 0 s → | the ring on glass, θ marked, three lines tagged A (green drop), B (blue touching piece), C (orange slant) | **NDA MATHS · TRIGONOMETRY · Circle of radius 1. Which line is tan θ?** chips A · B · C in the lines' colours |
| 0–3.0 s | a 360° orbit; each line pulses with its chip | *Every trig ratio is a real line* (not spoken) |
| 3.1–5.3 s | the small triangle fills; "sin θ" (green), "cos θ" (cyan) | *Height sin θ, base cos θ* |
| 5.3–6.9 s | the triangle grows from the centre, "× 1/cos θ = 1.00 → 1.31"; its base reaches "1", its height lands on the touching line | *Stretch it until the base is 1* |
| 7.2 s | punch-in · **B** lights; "tan θ"; "tan θ = sin θ ÷ cos θ" | *So the height is tan θ* |
| 8.9–11.4 s | the touching line runs long; a ring where it touches | *Tangent means touching. It touches here.* |
| 11.4–13.8 s | the slant lights orange, a flash where it cuts the circle; "1 + tan²θ = sec²θ" | *Secant means cutting. It cuts through.* |
| 13.8–15.2 s | the top touching line draws; a ring where it touches | *Same trick at the top* |
| 15.2–18.0 s | "cot θ" (violet), θ again at the top, "cosec θ" (pink); "1 + cot²θ = cosec²θ" | *Cot θ touches. Cosec θ cuts.* |
| 18.0–24.0 s | θ swings 40° → 62° → 28° → 40°; all six lines stretch and shrink; six live readouts | *Turn θ: all six lines move* · *Six ratios. Six real lines.* |
| 24.0–27.3 s | end card | Trig ratios are lengths on one circle. **Follow for more** |

**Cover:** 3.05 s (front view after the orbit, the three tagged lines, nothing named), "Every trig ratio is a real line".

## Sound (F14–F16)

A soft tap as each candidate pulses, a click as sin and then cos glow, a shimmer under the stretch, a knock on the
answer, a bright tap where each touching line touches, a snap where each slant cuts the circle, a click per identity and
as cot draws, a tick for every 2° of θ in the sweep (pitch following θ); whooshes on the fast zooms only. Effects ~10 dB
under the music, peak −3.3 dB. Voiced cut: the music dips 8 dB under each spoken line.

## Files

- `nda-maths-028-trig-lines-voice.mp4` (voiced) · `nda-maths-028-trig-lines.mp4` (silent) ·
  `nda-maths-028-trig-lines-voice-yt.mp4` (voiced, "Subscribe for more") · `nda-maths-028-trig-lines-cover.png`
- Re-make: `cd remotion && npm test && npm run music:028 && npm run voice:028 && npm run mix:028 && npm run render:028v &&
  npm run render:028 && npm run render:028v:yt && npm run cover:028`

## Before you post (founder)

- [ ] Pick the cut: voiced or silent (the manifest points to the voiced one; for silent, swap `video` and `youtubeVideo`)
- [ ] Watch it once on the phone: the labels near the point on the circle and the six readouts readable
- [ ] The answer (B) and Q79's working match this kit
