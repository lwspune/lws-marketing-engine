# Reel 006 — NDA Maths: slide the window (white visual format)

**Handle:** @lws.pune · **Format:** animated graph on a soft-white board (no filming, no face, no voice) · **Length:** 27 s
**Source:** PYQ Vault question bank, NDA 2024 (I), Maths Q89, chapter Definite Integration (question id
`2fc35f4f-4623-4a87-bb2f-4331cbb79485`). Answer key **(d) 200**, re-derived by hand.

Second reel in the white visual format (on test, see `format-test.md`); how to make more:
`visual-reel-workflow.md`. A sibling of reel 005 (same |sin x| humps, new idea: the window slides).

---

## Files

- **Video:** `nda-maths-006-window.mp4`: 27 s, 1080×1920, H.264 + AAC stereo, original music with a
  chime when the answer lights up.
- **Cover:** `nda-maths-006-window-cover.png`: the sliding window + "Slide the window. The area stays 200."
- **To re-make after an edit:** `node reels/tools/record.mjs reels/nda-maths-006-window.render.html`, or open
  the page in Edge → **Record & download MP4** (keep the tab visible for 27 s).

## The question

> Let φ(a) = ∫ₐ^(a+100π) |sin x| dx. What is φ(a) equal to?
> (a) 0  (b) a  (c) 100a  (d) 200

(The paper's next question, Q90, asks for φ′(a) on the same set-up. One question per reel, so it is
not in this one.)

## The working (checked)

- ∫₀^π sin x dx = [−cos x]₀^π = −cos π + cos 0 = 1 + 1 = **2** (the area of one hump of |sin x|)
- |sin x| repeats every **π**, so any stretch 100π long holds exactly **100** whole humps, wherever it
  starts: sliding the window drops a piece on the left and picks up an identical piece on the right
- 100 × 2 = **200** → **(d)**

**Traps:** (b) a and (c) 100a assume the answer depends on where the window starts; it doesn't.
(a) 0 is what ∫ sin x gives over whole periods (the dips cancel the humps); the modulus flips the dips
up, so nothing cancels.

## What's on screen

| Time | Picture | On-screen text |
|---|---|---|
| 0–3.4 s | question card with option chips, empty dot-grid axes (all visible on frame 0) | **a is in the limits. Is a in the answer?** |
| 3.4–6.6 s | \|sin x\| traces from 0 to 6π; a "2" in each hump; working ∫₀^π sin x dx = 2 | **Each hump of \|sin x\| has area 2.** |
| 6.6–10 s | a shaded window, brace "100π = 100 humps" (not to scale), edges labelled a and a + 100π | **φ(a) = the area inside a window 100π wide.** |
| 10–16.2 s | the window slides right: the piece that leaves (hatched) and the identical piece that joins (green); "φ(a) = 100 × 2 = 200" stays | **Slide it. A piece leaves on the left…** → **…the same piece joins on the right.** |
| 16.2–19.8 s | the (d) 200 chip fills terracotta and pulses, chime | **Area never changes: 100 × 2 = 200 → (d)** |
| 19.8–24 s | the window slides back; "a moves → φ(a) stays 200" | **Trap (b) a, (c) 100a: start doesn't matter. Trap (a) 0: that's sin x, not \|sin x\|.** |
| 24–27 s | end card | Window = whole humps? **Its area never changes.** **Follow for more** |

## Caption (paste as is)

```
NDA 2024 (I) · Maths · Q89. a is in the limits… so is a in the answer? 👀

One hump of |sin x| has area 2, and it repeats every π. Any window 100π wide holds exactly 100 humps, wherever it starts → 100 × 2 = 200 (d).
Trap: (b) a and (c) 100a. Slide the window and the area never changes.

Save this 📌 Follow @lws.pune for one real NDA PYQ every day.
Practise every Definite Integration PYQ free, chapter-wise → link in bio (PYQ Vault).

#NDA #NDAMaths #NDA2027 #NDAPreparation #DefenceAspirants #NDAPYQ #MathsTricks #LWSPune #Calculus
```

## Before you post (approval gate)

- [ ] Watch it once on your phone: every line readable at normal size
- [ ] Caption says NDA 2024 (I), Q89, answer (d)
- [ ] Cover PNG chosen in the upload screen
- [ ] Bio link opens PYQ Vault
