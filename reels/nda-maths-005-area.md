# Reel 005 — NDA Maths: slices build the area (white visual format)

**Handle:** @lws.pune · **Format:** animated graph on a soft-white board (no filming, no face, no voice) · **Length:** 31.5 s
**Source:** PYQ Vault question bank, NDA 2023 (II), Maths Q67, chapter Definite Integration (question id
`b85aa14f-4bc8-4828-bd7f-e1f001dee3f4`). Answer key **(d) 16**, re-derived by hand.

This is the first reel in the **white visual format**: a new format being tested against the approved
paper look (see `format-test.md`); how to make more: `visual-reel-workflow.md`. It is modelled on the "slices build volume" style of maths reels.

---

## Files

- **Video:** `nda-maths-005-area.mp4`: 31.5 s, 1080×1920, H.264 + AAC stereo, original music with a
  chime when the answer is circled.
- **Cover:** `nda-maths-005-area-cover.png`: the 8 humps + "Area over 8π? Count the humps." on a white card
- **To re-make after an edit:** `node reels/tools/record.mjs reels/nda-maths-005-area.render.html`, or open
  the page in Edge → **Record & download MP4** (keep the tab visible for 32 s).
- **Before/after (plain white → premium soft look, 2026-10-13):** `nda-maths-005-before-after.png`.

## The question

> What is ∫₀^8π |sin x| dx equal to?
> (a) 2  (b) 4  (c) 8  (d) 16

## The working (checked)

- ∫₀^π sin x dx = [−cos x]₀^π = −cos π + cos 0 = 1 + 1 = **2** (the area of one hump)
- |sin x| repeats every **π**, so 0 to 8π holds **8** humps
- 8 × 2 = **16** → **(d)**

**Traps:** (a) 2 is the area of one hump only. (c) 8 comes from taking the period as 2π (4 periods × 2):
that's the period of sin x, but the modulus halves it to π.

## What's on screen

| Time | Picture | On-screen text |
|---|---|---|
| 0–3 s | question card with option chips, empty dot-grid axes (all visible on frame 0) | **8π looks scary. Watch the area.** |
| 3–6 s | sin x traces from 0 to 8π, dips dimmer | **Draw sin x from 0 to 8π.** |
| 6–10 s | every dip folds up: y = sin x becomes y = \|sin x\| | **The modulus flips every dip up.** |
| 10–16 s | zoom on the first hump; 16 slices grow in, melt into one area labelled 2; working below | **Zoom in on one hump.** → **Slices build its area: 2** |
| 16–21.5 s | zoom out; humps 2–8 fill in turn; counter runs "1 hump × 2 = 2" … "8 humps × 2 = 16" | **Same hump, 8 times.** |
| 21.5–25 s | the (d) 16 chip fills terracotta and pulses, chime | **Answer: (d) 16** |
| 25–28.5 s | terracotta brace under hump 1: "repeats every π" | **Trap (a) 2: that is one hump. Trap (c) 8: period is π, not 2π.** |
| 28.5–31.5 s | end card | Graph keeps repeating? **Find one hump. Multiply.** **Follow for more** |

## Caption (paste as is)

```
NDA 2023 (II) · Maths · Q67. ∫ from 0 to 8π of |sin x|. Don't integrate 8π of anything 👀

One hump of |sin x| has area 2. The graph repeats every π, so 0 to 8π is 8 humps → 8 × 2 = 16 (d).
Trap: (c) 8 uses period 2π. The modulus makes it π.

Save this 📌 Follow @lws.pune for one real NDA PYQ every day.
Practise every Definite Integration PYQ free, chapter-wise → link in bio (PYQ Vault).

#NDA #NDAMaths #NDA2027 #NDAPreparation #DefenceAspirants #NDAPYQ #MathsTricks #LWSPune #Calculus
```

## Before you post (approval gate)

- [ ] Watch it once on your phone: every line readable at normal size
- [ ] Caption says NDA 2023 (II), Q67, answer (d)
- [ ] Cover PNG chosen in the upload screen
- [ ] Bio link opens PYQ Vault
