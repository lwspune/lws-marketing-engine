# Reel 007 — NDA Maths: the areas cancel (white visual format)

**Handle:** @lws.pune · **Format:** animated graph on a soft-white board (no filming, no face, no voice) · **Length:** 28 s
**Source:** PYQ Vault question bank, NDA 2024 (I), Maths Q74, chapter Definite Integration (question id
`55cdc03f-3be6-4b3b-909d-4e93c1e85778`). Answer key **(b) 0**, re-derived by hand.

Third reel in the white visual format (on test, see `format-test.md`) and the first made to the
2026-10-14 rules in `visual-reel-workflow.md`: honest scale, the question shrinks after the hook, amber
only on the answer, no watermark.

---

## Files

- **Video:** `nda-maths-007-cancel.mp4`: 28 s, 1080×1920, H.264 + AAC stereo, original music with a
  chime when the answer lights up.
- **Cover:** `nda-maths-007-cancel-cover.png`: the curve with +A above and −A hatched below + "Above cancels
  below. The answer is 0."
- **To re-make after an edit:** `node reels/tools/record.mjs reels/nda-maths-007-cancel.render.html`, or open
  the page in Edge → **Record & download MP4** (keep the tab visible for 28 s).

## The question

> What is ∫₋₁¹ (3 sin x − sin 3x) cos²x dx equal to?
> (a) −¼  (b) 0  (c) ½  (d) ¼

## The working (checked)

- sin 3x = 3 sin x − 4 sin³x, so 3 sin x − sin 3x = **4 sin³x**
- The integrand is 4 sin³x · cos²x. sin³(−x) = −sin³x (odd) and cos²(−x) = cos²x (even), so the
  product is **odd**: f(−x) = −f(x)
- An odd function's graph is unchanged by a half-turn about O, so on [−1, 1] the area above the axis
  (x from 0 to 1) equals the area below it (x from −1 to 0). They cancel: the integral is **0** → **(b)**

The graph on screen is the real function on the real interval [−1, 1] (y stretched for legibility; the
highest point is about 0.74 at x ≈ 0.89).

**Traps:** any non-zero option ((a) −¼, (c) ½, (d) ¼) means a slip somewhere in integrating the long
way. The bank doesn't say which slip leads to which option, so the reel doesn't guess.

**Hook for the caption:** NDA used the same trick three times since 2024 (24-I Q74, 24-II Q94,
26-II Q75). Only this one is on screen (one question per reel).

## What's on screen

| Time | Picture | On-screen text |
|---|---|---|
| 0–3.2 s | full question card with option chips, empty dot-grid axes (all visible on frame 0) | **Three lines of integration? Or one picture.** |
| 3.2–7 s | the card shrinks to a slim strip, the graph grows; working 3 sin x − sin 3x = 4 sin³x | **Simplify first: sin 3x = 3 sin x − 4 sin³x** |
| 7–10.8 s | y = 4 sin³x cos²x traces from −1 to 1, led by a dot | **Now graph it, from −1 to 1.** |
| 10.8–14.6 s | right area fills green (+A); a copy turns half a circle about O and lands on the left, which becomes hatched grey (−A) | **Turn the right half about O: it lands on the left.** |
| 14.6–18 s | working (+A) + (−A) = 0; both areas fade | **Above = below. They cancel to 0.** |
| 18–21.6 s | the (b) 0 chip fills terracotta and pulses, chime | **Answer: (b) 0** |
| 21.6–25 s | takeaway line: odd function on [−1, 1] ⇒ 0 | **Got −¼, ½ or ¼? That's a slip in the long way.** |
| 25–28 s | end card | Odd function, limits −a to a? **The answer is 0.** **Follow for more** |

## Caption (paste as is)

```
NDA 2024 (I) · Maths · Q74. Three lines of integration… or one picture? 👀

3 sin x − sin 3x = 4 sin³x, so the integrand is 4 sin³x cos²x: an odd function. From −1 to 1 the area above the axis cancels the area below → 0 (b).
NDA has used this trick 3 times since 2024. Odd function + limits −a to a = 0, no integration.

Save this 📌 Follow @lws.pune for one real NDA PYQ every day.
Practise every Definite Integration PYQ free, chapter-wise → link in bio (PYQ Vault).

#NDA #NDAMaths #NDA2027 #NDAPreparation #DefenceAspirants #NDAPYQ #MathsTricks #LWSPune #Calculus
```

## Before you post (approval gate)

- [ ] Watch it once on your phone: every line readable at normal size
- [ ] Caption says NDA 2024 (I), Q74, answer (b)
- [ ] Cover PNG chosen in the upload screen
- [ ] Bio link opens PYQ Vault
