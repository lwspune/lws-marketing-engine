# @pyqvault_ · Chemistry, visualised #11: same hammer, same hit. Which one shatters?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 12 · **Topic:** idea **C45** ("Metal bends, salt shatters",
score 55/100; the founder's idea, picked as the third Shock reel on 2026-10-26) · **Hook:** Same start, two endings (the
same hammer, the same hit) · **Opening:** **Shock**, the third one (F25): close on the salt crystal, the hammer lands at
0.2 s with a flash, chips and dust · **F37, the first reel made to it:** a whip-pan to the copper bending (the bar rings at
1.35 s), a whip back to the crystal as cracks race across it (1.95, 2.35 s), both hammers wind up and strike again: the salt
bursts at 3.2 s (aftershock 0.64, seconds 1–3 moving 15% of the pixels a frame) · **Second hook:** "So why didn't the copper
break?" (a dive into the bend, then the atoms) · **Loop:** yes, a rewind back to frame 0 (F27: Chemistry #10 and Physics #15
both end on the end card) · **Framework v1.31** · **Look:** dark set under a spotlight (not the studio: the founder found the
studio version "not dramatic enough, pretty bland"; F35 full frame kept) · **Music:** `cinematic`, shaped by a level curve
(a riser into the burst, a hole for it, a lift for the second question) · **Voice:** none (silent) · **Length:** 15.5 s ·
**Review panel (F38):** first reel through it (see below) · **Made in Remotion** (`remotion/src/PvChem011.tsx`; timeline,
beat table, chemistry, burst and shard simulation, sound `src/lib/pc011.ts`; tests `tests/pc011.test.ts`).

## The chemistry (checked, and tested)

- A metal is + ions in a sea of electrons that belong to no one atom. Push one layer of ions one step over the next and
  the sea flows with it: still held, so copper bends (malleable). Copper's atoms are 256 pm apart, radius 128 pm, touching
  (tested).
- A salt is + and − ions taking turns in every direction (rock salt). Push one layer one step and every ion across the
  plane faces its own kind, + over +, − over − (tested on the slab: 7 opposite pairs before, 6 like pairs after); they
  push apart and the crystal splits along that plane (brittle). Na⁺ 102 pm and Cl⁻ 181 pm, 282 pm apart (Shannon radii).
- Salt splits along its cube faces, so it breaks into smaller cubes: 27 equal cubes with the crystal's volume (tested),
  plus 180 small shards (salt chips into small cubes too).
- Shown in slow motion; the pieces fall under a slowed gravity and never sink into the floor or the block (simulated once
  with a fixed step, tested). Both hammers fall from the same height at the same speed and land together, twice: the first
  blow bends the copper and cracks the salt, the second bends the copper a little more and shatters the salt. The flash is
  the reel's drama, not physics (F10). The answer is **B salt**.

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–0.2 s | close on the salt crystal on a dark block, the hammer head falling at it | **CHEMISTRY, VISUALISED #11 · Same hammer. Same hit. Which one shatters?** A copper · B salt · C both · tag |
| 0.2 s | the hit: a short flash, chips and a dust puff, a hard shake (crack, boom, clang) | |
| 0.6–1.0 s | whip-pan to the copper bar across two blocks | |
| 1.0–1.35 s | the bar bends into a V under its hammer; it rings, dust bursts off its blocks, the hammer kicks up (whump, clang) | |
| 1.5–1.9 s | whip back to the crystal (whoosh) | |
| 1.95–2.55 s | cracks race across its faces (crack ×4, snap), salt dust spits, it shivers; the camera circles in | |
| 2.55–3.2 s | both hammers wind up and slam down | the question shrinks (2.8 s): "Copper or salt: which shatters?" |
| 3.2 s | the burst, close: a flash, 27 cubes and 180 shards fly (a third at the camera), a dust cloud (boom, crack, clang) | |
| 3.45–3.9 s | held close on the debris | **Salt shatters. Copper just bends.** |
| 3.9–4.5 s | pull back to both set-ups; the pieces land (taps) | **B salt** under the pile |
| 4.9 s | the dive into the copper's bend (whoosh, snap) | So why didn't the copper break? |
| 5.6 s | cut into copper's atoms: + cores in a flowing sea of glowing electrons | Copper: + ions in an electron sea |
| 6.3–7.0 s | the top layers slide one step; the sea flows with them (scrape) | Layers slide. The sea still holds. |
| 8.4 s | cut to salt's atoms: Na⁺ violet, Cl⁻ green, taking turns | Salt: + and − take turns |
| 9.0–9.6 s | the top layers slide one step (scrape) | |
| 9.6 s | + over +, − over −: yellow pulses and arrows between them (thunk ×3) | Slide one step: + meets + |
| 10.6 s | the top layers fly apart (crack, boom); pull back | Like charges push. It splits. |
| 12.3 s | cut back out: the bent bar, the scattered cubes, the camera drifting round | Metals bend. Salts shatter. |
| 14.0–15.5 s | the rewind (shimmer): pieces fly back, the bar straightens, the hammers rise, back to the close-up; the question returns: the last frame is frame 0 | |

**Colours (F24):** copper, steel, wood and salt REAL (salt added to `REAL`); Na⁺ VIVID violet, Cl⁻ VIVID green, electrons
VIVID cyan, the push VIVID yellow (red on green is the colour-blind pair); dark gunmetal blocks on a near-black floor, the
salt the brightest thing in frame. Na⁺ vs Cl⁻ and copper vs its electrons are told apart for colour-blind viewers (tested).

## Review panel (F38)

Pass 1 (the dramatic remake, before these fixes): Drama 5 · Colour 5 · Motion 6 · Sound 5. Every must-fix and what was done
is in `reels/review-panel.md` → Log. Declined: a split-screen frame 0 with both set-ups (keeps the close-up shock; the copper
comes 0.6 s later) · a run-up whoosh into the hit (a whoosh peaks 0.45 s after it starts, so it would begin before frame 0)
· a lighter Na⁺ violet (the VIVID set is test-locked; the +/− marks carry the difference) · bigger lattices (they already
fill 75–90% of the width).

## Files

- `pv-chem-011-hammer.mp4` · `pv-chem-011-hammer-cover.png` (0.45 s: the hit, chips in the air, before any crack)
- Re-make: `cd remotion && npm test && npm run music:pc011 && npm run mix:pc011 && npm run render:pc011 && npm run cover:pc011`
