# @pyqvault_ · Chemistry, visualised #6: a barium salt in the flame: yellow, green or red?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11 · **Topic:** remake-backlog **C7**, topic score **6/10**
(F21; tied with C8 and C9, all our own ideas, so no views multiple to break the tie: picked as the most colourful, F2) ·
**Proven idea:** none (the accounts we studied have no proven chemistry left; L41 / backlog note) · **Framework v1.5** ·
**Background:** dark (L22: C5 was white; the flames glow on dark) · **Music:** `cinematic` (L34: every style had 2 reels;
a colour reveal → cinematic; not the same as Physics #6's drive before it), hit on the answer · **Orbit:** the closing
moment, 80°, slow (F22; the second orbit reel, L37) · **Length:** 22.0 s · **Made in Remotion**
(`remotion/src/PvChem006.tsx`, timing + sound `src/lib/pc006.ts`, tests `tests/pc006.test.ts`).

## The chemistry (checked, and tested)

- Flame colours as NCERT Class 11 (The s-Block Elements) gives them: Li crimson red, Na yellow, K violet (lilac),
  Ca brick red, Ba apple green. Answer **B green**.
- Each colour matches the metal's real emission lines, shown on the spectrum: Li 670.8 nm, Na 589.0/589.6, K 766.5 +
  404.4, Ca 622, Ba 524 + 554 (the green bands). The tests check each drawn colour's hue against its named colour.
- The why (Structure of the Atom): the heat kicks an electron up to a higher shell; it falls back and gives out the
  difference as one photon, E = hc/λ: barium 1239.84 / 524 = **2.37 eV**. The atom is drawn as shells (a picture, not to
  scale).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | question + A/B/C over five gas-blue flames, already flickering; Li Na K Ca Ba under them | **CHEMISTRY, VISUALISED #6 · A barium salt goes into the flame. The flame turns…?** A yellow · B green · C red |
| 1.0–3.4 s | salt falls into each flame in turn: crimson, yellow, violet, brick red; their lines light on the spectrum | *Lithium, sodium, potassium, calcium…* |
| 4.3–4.75 s | barium: punch-in · **B green** lights | *Barium: apple green!* |
| 6.6–12.6 s | the barium atom: heat kicks the electron up, it falls back, a green photon flies: 524 nm · 2.37 eV | *Heat kicks an electron up* · *It falls back: one colour of light* |
| 12.6–15.4 s | all five flames + the full spectrum | *Each metal: its own colour* |
| 15.4–18.6 s | the orbit round the five coloured flames | *That's how fireworks get colours* |
| 18.6–22 s | end card | One metal, one colour of light. **That's the chemistry.** Follow for #7 · **pyqvault.com** |

## Camera (F9, F22) and sound (F14–F16)

- Drift from frame 0 → slow push while the salts go in → **punch-in landing on the answer** (whoosh) → quick zoom out
  for the atom (whoosh) → slow push → the closing orbit (80°, slow, no whoosh).
- The burners' roar the whole time, the salt crackling as each goes in (3 crackles each), whooshes on the fast zooms.

## Files

- `pv-chem-006-flame.mp4` · `pv-chem-006-flame-cover.png` (0.6 s, all flames still blue) · `pv-chem-006-strip.png`
- Re-make: `cd remotion && npm test && npm run music:pc006 && npm run mix:pc006 && npm run render:pc006 && npm run cover:pc006`
