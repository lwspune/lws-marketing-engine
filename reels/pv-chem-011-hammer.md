# @pyqvault_ · Chemistry, visualised #11: same hammer, same hit. Which one shatters?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 12 · **Topic:** idea **C45** ("Metal bends, salt shatters",
score 55/100; the founder's idea, picked as the third Shock reel on 2026-10-26) · **Hook:** Same start, two endings (the
same hammer, the same hit) · **Opening:** **Shock**, the third one (F25): both hammers land at 0.2 s · **F37, the first
reel made to it:** a new event about every second until 3 s (the hit 0.2 s, the bend lands 1.2 s, the first crack 1.3 s,
cracks branch 2.2 s, the burst 3.2 s), no fade or wash before 3 s · **Second hook:** "So why didn't the copper break?" (a
dive into the bend, then the atoms) · **Loop:** yes, a rewind back to frame 0 (F27: Chemistry #10 and Physics #15 both end on
the end card) · **Framework v1.30** · **Look:** full-frame soft studio (F35, F36; the second studio reel) · **Music:**
`cinematic` (F13: dramatic; Chemistry #6, the record, was cinematic), hits on the answer and the second hook · **Voice:**
none (silent) · **Length:** 15.0 s · **Made in Remotion** (`remotion/src/PvChem011.tsx`; timeline, beat table, chemistry,
burst simulation and sound `src/lib/pc011.ts`; tests `tests/pc011.test.ts`).

## The chemistry (checked, and tested)

- A metal is + ions in a sea of electrons that belong to no one atom. Push one layer of ions one step over the next and
  the sea flows with it: still held, so copper bends (malleable). Copper's atoms are 256 pm apart, radius 128 pm, touching
  (tested).
- A salt is + and − ions taking turns in every direction (rock salt). Push one layer one step and every ion across the
  plane faces its own kind, + over +, − over − (tested on the slab: 7 opposite pairs before, 6 like pairs after); they
  push apart and the crystal splits along that plane (brittle). Na⁺ 102 pm and Cl⁻ 181 pm, 282 pm apart (Shannon radii).
- Salt splits along its cube faces, so it breaks into smaller cubes: 27 equal cubes with the crystal's volume (tested).
- Shown in slow motion; the pieces fall under a slowed gravity, settle flat and never sink into the floor or the block
  (simulated once with a fixed step, tested). Both hammers fall from the same height at the same speed and land together.
  The answer is **B salt**.

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–0.2 s | two hammers already falling, one on a copper bar across two steel blocks, one on a salt crystal on a steel block | **CHEMISTRY, VISUALISED #11 · Same hammer. Same hit. Which one shatters?** A copper · B salt · C both · tag |
| 0.2 s | both land: crack + boom + a metal ring, a shake, dust rings | |
| 0.2–1.2 s | slow motion: the copper bends into a V, its hammer riding it down | tags: copper · salt |
| 1.2 s | the bend lands (whump, a second dust ring); the hammer bounces up | |
| 1.3 s | a crack shoots across the salt (crack); flecks spray | |
| 2.2 s | more cracks branch along the cube's faces (crack, crack, snap) | |
| 2.8 s | | the question shrinks to "Copper or salt: which shatters?" |
| 3.2 s | the salt bursts into 27 small cubes (boom); its hammer hits the block (thunk); the pieces land (taps) | **B salt** lights (3.45 s) · Salt shatters. Copper just bends. |
| 4.4–5.1 s | the dive: punch-in on the copper's bend (whoosh-in) | So why didn't the copper break? |
| 5.1 s | cut (snap) into copper's atoms: + cores in a sea of cyan electrons (pull back, whoosh-out) | Copper: + ions in an electron sea |
| 6.3–7.0 s | the top layers slide one step, the electrons flow with them (scrape) | Layers slide. The sea still holds. |
| 7.9 s | cut (snap) to salt's atoms: Na⁺ violet, Cl⁻ green, taking turns | Salt: + and − take turns |
| 8.5–9.1 s | the top layers slide one step (scrape) | |
| 9.1 s | + over +, − over −: red pulses and arrows between them (thunk ×3) | Slide one step: + meets + |
| 10.1 s | the top layers jump apart (crack, boom); pull back (whoosh-out) | Like charges push. It splits. |
| 11.8 s | cut (snap) back out: the bent bar, the scattered cubes | Metals bend. Salts shatter. |
| 13.5–15.0 s | the rewind (shimmer): the pieces fly back, the bar straightens, the hammers rise, the question returns: the last frame is frame 0 | |

**Colours (F24):** copper, steel, wood and salt REAL (salt added to `REAL` for this reel: clear white with a grey edge so it
reads on the white studio); Na⁺ VIVID violet, Cl⁻ VIVID green, electrons VIVID cyan, the push VIVID red (ions have no colour
of their own). Na⁺ vs Cl⁻ and copper vs its electrons are told apart for colour-blind viewers (tested).

## Files

- `pv-chem-011-hammer.mp4` · `pv-chem-011-hammer-cover.png` (0.6 s: both hammers down, the copper starting to bend, before
  any crack)
- Re-make: `cd remotion && npm test && npm run music:pc011 && npm run mix:pc011 && npm run render:pc011 && npm run cover:pc011`
