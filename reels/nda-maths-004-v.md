# Reel 004 — NDA Maths: the triangle trick, V explains (white visual format, v2)

**Handle:** @lws.pune · **Format:** animated figure on a soft-white board + V (PYQ Vault mascot) explaining
in speech cards (no filming, no face, no voice) · **Length:** 31 s
**Source:** PYQ Vault question bank, NDA 2026 (II), Maths Q13, chapter Inverse Trigonometry (question id
`1dc08e50-6548-4778-986f-a07278ad8ed2`). Answer key **(c) 3/5**, re-derived by hand and numerically
(sin(atan 0.75) = 0.6).

Format test **day 4** (V robot). Remade on 2026-10-15 to the `visual-reel-workflow.md` rules (white
board, question shrinks after the hook, honest scale, amber only on the answer, no watermark). The
first version (paper + pen, never posted) is kept as `nda-maths-004-v-paper.mp4`.

---

## Files

- **Video:** `nda-maths-004-v.mp4`: 31 s, 1080×1920, H.264 + AAC stereo, original music with a chime
  when the answer lights up. `check-video`: 4 PASS (peak −3.5 dB, body −22.5 dB RMS).
- **Cover:** `nda-maths-004-v-cover.png`: the question, the 3-4-5 triangle with opposite + hypotenuse in
  green, "sin θ = opp ÷ hyp = 3/5" + "Inverse trig? Draw the triangle."
- **Decoded check strip:** `nda-maths-004-v-strip.png` (frames read back from the MP4).
- **To re-make after an edit:** `node reels/tools/record.mjs reels/nda-maths-004-v.render.html`, then
  `cover.mjs` and `check-video.mjs` (see the workflow, step 4).

## The question

> What is sin(tan⁻¹ 0.75) equal to?
> (a) 1  (b) 4/5  (c) 3/5  (d) 1/2

## The working (checked)

- Let θ = tan⁻¹(0.75) = tan⁻¹(3/4). Since 0.75 > 0, θ lies in (0, π/2): a first-quadrant angle.
- tan θ = opposite ÷ adjacent = 3/4, so draw a right triangle with **opposite 3, adjacent 4**.
- Hypotenuse = √(3² + 4²) = √25 = **5**.
- sin θ = opposite ÷ hypotenuse = **3/5** → **(c)**.

The triangle on screen is drawn exactly 3 : 4 : 5 (honest scale).

**Traps:**
- **(b) 4/5** is cos θ (adjacent ÷ hypotenuse): reading the wrong side. Shown on screen.
- (a) 1 would need θ = 90°, but tan 90° is undefined, not 0.75.
- (d) 1/2 is sin 30°, but tan 30° ≈ 0.577, not 0.75.

## What's on screen

| Time | Picture | On-screen text |
|---|---|---|
| 0–3.2 s | full question card with option chips; V (thinking) bottom left, all on frame 0 | **Inverse trig looks scary. It's just a triangle.** |
| 3.2–7.8 s | card shrinks to a slim strip; working θ = tan⁻¹(3/4) ⇒ tan θ = 3/4 | V: *Call the angle θ. Then tan θ = 0.75 = 3/4.* |
| 7.8–12 s | base 4 and side 3 draw in, led by a dot; right-angle mark; θ arc | V: *tan = opposite ÷ adjacent. So draw it: 3 up, 4 across.* |
| 12–16.2 s | hypotenuse draws, labelled 5; working hyp = √(3² + 4²) = √25 = 5 | V (thinking): *The hypotenuse? It's a 3-4-5 triangle: 5.* |
| 16.2–20.4 s | triangle fills; opposite + hypotenuse turn green with labels; working sin θ = opp ÷ hyp = 3/5 | V: *sin = opposite ÷ hypotenuse = 3/5* |
| 20.4–23.6 s | the (c) 3/5 chip fills terracotta and pulses, chime; V laughs | **Answer: (c) 3/5** |
| 23.6–27.4 s | the adjacent side turns dashed grey; working cos θ = 4/5 ≠ sin θ | V (thinking): *Careful: 4/5 is cos θ, not sin θ.* |
| 27.4–31 s | end card on the white board with V laughing | Inverse trig? Draw the triangle. **Then read sin off it.** **Follow for more** |

## Caption (paste as is)

```
NDA 2026 (II) · Maths · Q13: sin(tan⁻¹ 0.75). V shows the triangle trick 🤖

tan θ = 3/4 → draw a 3-4-5 triangle → sin θ = 3/5.
Trap: 4/5 is cos θ, not sin θ.

Save this 📌 Follow @lws.pune for one real NDA PYQ every day.
Practise every Inverse Trigonometry PYQ free → link in bio (PYQ Vault).

#NDA #NDAMaths #NDA2027 #NDAPreparation #DefenceAspirants #NDAPYQ #MathsTricks #LWSPune #Trigonometry
```

## Before you post (approval gate)

- [ ] Watch it once on your phone: every line readable at normal size
- [ ] Caption says NDA 2026 (II), Q13, answer (c)
- [ ] Cover PNG chosen in the upload screen (the publisher app sets it automatically)
- [ ] Bio link opens PYQ Vault
