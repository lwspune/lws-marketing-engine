# @pyqvault_ · Chemistry, visualised #2 — why does the periodic table have families?

**Handle:** @pyqvault_ (publisher project `pyqvault-insta`) · **Audience:** Class 11 (CBSE / State boards, JEE, NEET,
MHT-CET) · **Theme:** **lab** (dark; background A/B test L22: P1 lab, C1 white, P2 white, **C2 lab**) · **Made in Remotion**
(`remotion/src/PvChem002.tsx`, data + timing `src/lib/pc002.ts`, tests `tests/pc002.test.ts`), a 3D-tilted table
(CSS 3D, crisp symbols) · **Music:** `cinematic` (a build-up reveal), impacts at 6.4 s (first family), 21.7 s (halogens),
26.8 s (whole table lights) · **Length:** 33 s · goes out in the next free slot when approved.
**Proven idea:** @sciencevisualised, "Can you name all 8 chemical families?", 4.45M views (256× their typical reel),
https://www.instagram.com/reel/DcFiAVwKFIg/ (remake-backlog C2). Our version adds the *why*: outer-electron shells for
groups 1, 2, 17, 18 and the closing line "same column → same outer electrons → same chemistry".

## The chemistry (checked, and tested)

- All 118 elements in the standard long form: groups 1–18, periods 1–7, lanthanides (La–Lu, 57–71) and actinides
  (Ac–Lr, 89–103) in the two rows below, placeholders "57–71" / "89–103" in group 3.
- Families (test-checked member by member): alkali metals Li Na K Rb Cs Fr (group 1 without H) · alkaline earth metals
  Be Mg Ca Sr Ba Ra · transition metals: groups 3–12, periods 4–7 (38 shown) · lanthanides 15 · actinides 15 ·
  metalloids B Si Ge As Sb Te · halogens F Cl Br I At Ts · noble gases He Ne Ar Kr Xe Rn Og. H, C, N, O, P, S, Se and
  the post-transition metals stay unlit (no family in this reel).
- Traits: alkali metals have 1 valence electron and react with water; alkaline earth 2; halogens 7 (form salts with
  metals); noble gases have a full outer shell (He: 2, the rest 8) and are almost unreactive; transition-metal
  compounds are coloured and many are catalysts; every actinide is radioactive; lanthanides = rare earths;
  metalloids have properties between metals and non-metals.

## What's on screen

| Time | Picture | Text (in frame) |
|---|---|---|
| 0–2.6 s | title still on a dark card, a green light circling its edge | **CHEMISTRY, VISUALISED #2 · Why does the periodic table have families?** |
| 3.2–6 s | 118 tiles drop onto a tilted 3D table in atomic-number order | *118 elements* |
| 6.4–26.8 s | each family lifts and glows in its colour, the rest dim; shells with 1, 2, 7, 8 outer electrons for groups 1, 2, 17, 18 | Alkali metals · 1 outer electron: fizz in water → Alkaline earth metals → Transition metals → Lanthanides → Actinides → Metalloids → Halogens → Noble gases (one short trait each) |
| 26.8–29.4 s | every family lit at once, the table tilts up | *Same column → same outer electrons → same chemistry* |
| 29.4–33 s | end card | Same column, same chemistry. **That's the chemistry.** Follow for #3 · **pyqvault.com** |

## Files

- `pv-chem-002-families.mp4` (1080×1920, 30 fps, Remotion) · `pv-chem-002-families-cover.png` (all 8 families lit,
  "The periodic table's 8 families") · `pv-chem-002-strip.png` (frames decoded from the MP4)
- Re-make: `cd remotion && npm test && npm run music:pc002 && npm run render:pc002 && npm run cover:pc002`

## Before you post (approval gate)

- [ ] Watch it once on your phone: each family's name and trait readable
- [ ] Goes to **@pyqvault_** (approving puts it in the next free slot)
