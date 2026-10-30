# @pyqvault_ · Maths, visualised #4: the chain rule as three gears

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 12 (CBSE, JEE Main, MHT-CET) · **Topic:** idea **M10** ("Chain
rule as gears") · **Framework v1.35, F40: the first imitation** (founder, 2026-10-28: "imitate top performing reels… as closely
as possible while maintaining our unique brand identity") · **Hook / Opening:** Copied (the gears already turning, the title
popping in) · **Loop:** yes: the words leave and the gears speed back up to frame 0's pace (their end card, ours loops, F27)
· **Look:** the soft studio in 3D (F36), three gears on posts · **Mascot:** PYQ Vault's V (theirs is their own) · **Music:**
`synthwave` (`music.seamless`), hits on the 6 (16.0 s) and on 3 × 2 (23.0 s) · **Voice:** none · **Length:** 34.0 s (theirs
34.0 s) · **Made in Remotion** (`remotion/src/PvMaths004.tsx`; timeline, maths and every text's place in
`src/lib/pm004.ts`; tests in `tests/pm004.test.ts`).

**Proven idea:** @learnara.math, "Chain Rule visualized!" (posted 2026-10-19), **85,973 views, 7.1× their typical reel**
(1,524 followers; export 2026-10-28), https://www.instagram.com/reel/DerDcmpqINc/. Study copy (never posted):
`study/reels/DerDcmpqINc.mp4`.

## The maths (checked, and tested)

- x has 36 teeth, u 18, y 6, all the same tooth size, so meshing gears trade teeth one for one: u turns 36 ÷ 18 = **2**
  times per turn of x (du/dx = 2), y turns 18 ÷ 6 = **3** times per turn of u (dy/du = 3).
- One turn of x: u turns 2 times, each giving 3 turns of y: **6** turns of y. dy/dx = dy/du · du/dx = 3 × 2 = 6, not
  3 + 2 = 5. That is the chain rule (NCERT Class 12, Continuity and Differentiability).
- The teeth really mesh (a tooth in a gap at both contacts, all reel long) and the gears turn opposite ways in turn; the
  counters count whole turns, not signed angles. All in the tests.

## Their reel, shot by shot (from the study copy, one frame a second)

| Time | Picture | Their words |
|---|---|---|
| 0–3 s | three gears on posts (small orange y, green u, big blue x); their mascot cranks x | "Chain Rule Visualized" at ~1 s |
| 3 s | the lesson: headline, an answer card "dy/dx = ?", the gears below with a counter under each | "How fast does y spin?" |
| 4–7 s | x turns once; u's counter 0 → 2; a "du/dx = 2" tag on u | "Turn x once" → "u spins 2× as fast as x" |
| 7–10 s | u turns once; y's counter 0 → 3; "dy/du = 3" | "Now turn u once" → "y spins 3× as fast as u" |
| 11–15 s | the card: "3 + 2 = 5?" in red; x turns once; y's counter 3 → 5 → 6 | "Add them? 3 + 2 = 5" → "Turn x once. Is it 5?" |
| 16–17 s | the "3 + 2" breaks apart; the card reads 6 | "6, not 5!" |
| 18–22 s | the card fills: "? + ? = 6" → "3 + 3 = 6"; y counts 3 per u turn | "Each u turn: 3 y turns" |
| 23–26 s | "3 × 2 = 6" with a green tick, then "dy/du × du/dx = 6" | "Multiply… Rates multiply. They don't add." → "That's the chain rule" |
| 27–31 s | a chain rule card; counters to 1 · 2 · 6 | "Every link multiplies" → "The chain rule" |
| 32–34 s | their end card: mascot, website | |

## Ours

| Time | Picture | Text (ours) |
|---|---|---|
| 0–2.5 s | the gears turning, slowing to a stop; V floats over x | MATHS, VISUALISED #4 · PYQ Vault · pyqvault.com |
| 0.8 s | (whoosh) | **Chain Rule / Visualised** pops in (the cover, 1.6 s) |
| 3.0 s | the lesson | How fast does y turn? · x drives u, u drives y · dy/dx = ? |
| 4.0–5.7 s | x turns once; u's counter 0 → 2 (a click a turn) | Give x one full turn |
| 6.0 s | du/dx = 2 tag on u | u turns twice as fast |
| 7.2–8.9 s | u turns once; y's counter 0 → 3 | Now give u one turn |
| 9.2 s | dy/du = 3 tag on y | y turns 3× as fast as u |
| 11.0 s | the card stamps **3 + 2 = 5?** (thunk); V thinks | Just add them: 5? |
| 13.0–15.9 s | x turns once; y's counter 0 → 6 | Check: one turn of x |
| 16.0 s | 3 + 2 = 5? breaks apart, **6** lands (crack, music hit); V laughs | It's 6, not 5! |
| 18–22 s | x turns once in two halves; y counts 3 per u turn (snap as each 3 fills) | Every u turn: 3 of y · ? + ? → 3 + ? → 3 + 3 = 6 |
| 23.0 s | **3 × 2 = 6** ✓ (shimmer, music hit); V laughs | So multiply: 3 × 2 = 6 · rates multiply, they never add |
| 25.0 s | dy/du × du/dx = 6 ✓ | This is the chain rule |
| 27–29 s | x turns once: counters 1 · 2 · 6; CHAIN RULE dy/dx = dy/du · du/dx (shimmer) | Each link multiplies |
| 29.5 s | | Multiply along the chain |
| 32–34 s | the words leave; the gears speed back up: the last frame is frame 0 | |

## Review panel (F38)

Pass 1 (Drama 5 · Colour 6 · Motion 5 · Sound 5): every must-fix done; see `reels/review-panel.md` → Log, which also lists
the suggestions declined and why (mostly: the source decides, F40).

## Files

- `pv-maths-004-chain-rule.mp4` · `pv-maths-004-chain-rule-cover.png` (1.6 s: the title over the gears)
- Re-make: `cd remotion && npm test && npm run music:pm004 && npm run mix:pm004 && npm run render:pm004 && npm run cover:pm004`
