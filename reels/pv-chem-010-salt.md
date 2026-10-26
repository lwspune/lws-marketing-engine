# @pyqvault_ · Chemistry, visualised #10: explosive metal + poison gas. What do you get?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11 · **Topic:** idea **C44** ("An explosive metal and a poison
gas make table salt", score 62/100; the founder's idea, picked as the second Shock reel on 2026-10-26) · **Hook:** You'd
think (explosive + poison should make something worse) · **Opening:** **Shock**, the second one (F25): a spoon of burning
sodium bursts into flame in the chlorine at 0.2 s · **Second hook:** "Why does only salt water conduct?" (dry salt between
two electrodes, bulb dark; water pours in, the bulb lights) · **Loop:** no, end card (F27: Physics #13 and #14 both loop) ·
**Framework v1.28** · **Background:** dark (the flame and its glow need it) · **Music:** `trap` (F13 / L34: dramatic;
trap has the fewest posted reels among the styles that fit), hits on both answers · **Voice:** none (silent) · **Length:**
17.0 s · **Made in Remotion** (`remotion/src/PvChem010.tsx`; timeline, beat table, chemistry and sound
`src/lib/pc010.ts`; tests `tests/pc010.test.ts`).

## The chemistry (checked, and tested)

- Sodium burns in chlorine with a bright yellow flame and white smoke: 2Na + Cl₂ → 2NaCl. The yellow is sodium's own
  colour (589 nm, as in Chemistry #6's flame test). The deflagrating spoon and the gas jar are the school demonstration.
- Na is 2, 8, 1 and Cl is 2, 8, 7. Sodium gives its one outer electron to chlorine: Na⁺ (2, 8) and Cl⁻ (2, 8, 8), both
  with a full shell of 8, charges +1 and −1, no electron made or lost (tested). The answer is **C table salt**.
- Sizes are real and to scale with each other: Na 186 pm shrinks to Na⁺ 102 pm (it loses its whole outer shell); Cl 99 pm
  swells to Cl⁻ 181 pm (Shannon ionic radii, 6-coordinate). In rock salt the ions touch: 102 + 181 ≈ 282 pm, half the
  564 pm cubic cell (tested to 1%).
- The lattice is real rock salt: 4 × 4 × 4, 32 Na⁺ and 32 Cl⁻, every neighbour the other ion, no two overlapping on any
  frame (tested). A cubic lattice is why salt grains are cubes.
- Dry salt doesn't conduct: its ions are locked in place. Dissolved, the ions move: Na⁺ to the − electrode, Cl⁻ to the +
  (tested), and the bulb lights. The ions in the beaker are drawn far bigger than real (said in the caption, F10).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–0.2 s | a spoon of burning sodium already plunging into a jar of yellow-green chlorine | **CHEMISTRY, VISUALISED #10 · Explosive metal + poison gas. What do you get?** A worse poison · B new metal · C table salt · tag |
| 0.2–0.4 s | it bursts: yellow flash, sparks, shake (crack + whump + boom) | |
| 0.4–2.4 s | it burns (roar, crackle); white smoke fills the jar, the green fades, the lid disc closes the jar | The green gas turns white (2.45 s) |
| 2.8–3.3 s | punch-in into the smoke (whoosh-in); it washes white | |
| 3.3 s | one Na atom (violet, big) with one outer electron; one Cl atom (yellow-green, small) with 7 and a gap | Sodium has one spare electron |
| 3.9–4.5 s | the electron hops into the gap (click, snap) | |
| 4.5–5.3 s | Na shrinks to Na⁺, Cl swells to Cl⁻; they snap together (thunk) | Chlorine grabs it: + and − |
| 5.4–6.6 s | pull back: 62 more ions fly in and lock into a cube (taps, rising) | They stack into a cube |
| 6.65–7.0 s | the lattice turns into a clear crystal (shimmer); white wash | |
| 7.0–7.6 s | back at the jar; punch-in on the spoon of cube crystals (whoosh-in); **C table salt** lights | Every salt grain is a cube |
| 8.8 s | across to a beaker of dry salt between two electrodes (whoosh-out); bulb dark | Why does only salt water conduct? |
| 9.5–10.3 s | water pours in (pour); the salt dissolves into drifting ions | |
| 10.8 s | the bulb lights (shimmer); Na⁺ drift to −, Cl⁻ to + | In water, the ions can move |
| 11.3–12.9 s | punch-in between the electrodes (whoosh-in) | Locked in a crystal, free in water (12.6 s) |
| 12.9–14.6 s | zoom out to the jar and the beaker | |
| 14.6–17.0 s | end card | Poison gas + explosive metal = salt · pyqvault.com · Follow for #11 |

**Colours (F24):** chlorine is REAL chlorine from the gas to the Cl⁻ ion; sodium metal REAL sodium (added to `REAL`
for this reel); Na⁺ VIVID violet; the electron VIVID cyan (the same cyan as the current in the wires); glass, steel,
copper and water REAL; salt white. Na vs Cl and the electron vs each are told apart for colour-blind viewers (tested).

## Files

- `pv-chem-010-salt.mp4` · `pv-chem-010-salt-cover.png` (0.45 s: the burst, before any answer)
- Re-make: `cd remotion && npm test && npm run music:pc010 && npm run mix:pc010 && npm run render:pc010 && npm run cover:pc010`
