# @pyqvault_ · Physics, visualised #15: ice at the top or the bottom. Which cools a drink faster?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11 · **Topic:** idea **P36** ("Ice at the top cools a drink
faster than ice at the bottom (convection)", score 79/100, the top physics idea; the founder's idea) · **Hook:** Everyday
puzzle · **Opening:** **Zoom**: frame 0 is a close-up of the floating ice, cold water already streaming down from it; the
camera pulls back to both glasses by 1.8 s · **Second hook:** "So where should the freezer go?" (the camera swings to a
cut-away fridge; cold air falls from the freezer at the top, warms past the food, rises at the front) · **Loop:** no, end
card (F27: Physics #13 and #14 loop) · **Framework v1.29**: the **first full-frame studio reel** (F35 one picture, full
frame; F36 soft studio; L71) · **Background:** studio (white) · **Music:** `lofi` (F13 / L34: a calm, cool topic; lofi has
the fewest posted reels of the styles that fit), hits on the answer and the second hook · **Voice:** none (silent) ·
**Length:** 17.6 s · **Made in Remotion** (`remotion/src/PvPhysics015.tsx`; timeline, beat table, heat model, text layout
and sound `src/lib/pp015.ts`; the studio set `src/studio.tsx`; the full-frame checks `src/lib/layout.ts`; tests
`tests/pp015.test.ts`, `tests/layout.test.ts`).

## Why this reel looks different

The founder, 2026-10-26, after studying @studyhacks09's quantum-numbers reel: "our videos are at the center of reel while
top and bottom is occupied by content/text". So: no question card, graph card or caption pill. The 3D picture fills the
page on a white seamless studio set (the floor curves into the wall; soft light, soft shadows, see-through glass and
drink). The question is big for the first 3 s, then shrinks to one line under the top edge. Every other text sits beside
what it names (temperatures over the glasses, tags under them, the clock between) and comes and goes. Tests check, on
every frame, that each text is inside Instagram's safe area and clear of every other text, and that the glasses (or the
fridge) fill the frame.

## The physics (checked, and tested)

- **Water is densest at 4 °C** (999.97 kg/m³; 998.2 at 20 °C). Water cooled by ice is heavier than the warm drink, so it
  sinks, as long as it is above 4 °C.
- **The model:** the drink as 24 layers of 0.5 cm (a 12 cm drink in a 6.6 cm glass, 410 g, at 25 °C), with 80 g of ice
  (8 cubes of 2.2 cm) in 4 cm at the top or, held by a mesh, at the bottom. Each 0.25 s step: the ice takes heat from the
  water it touches (rate 0.03 per second, about 400 W/m²·K over the cubes' surface, falling as the cubes shrink) and melts
  1 g per 334 J; water conducts heat between layers (1.43 × 10⁻⁷ m²/s); the 25 °C room warms the glass a little; then any
  layer heavier than the one below it sinks and mixes (convection).
- **Ice on top:** its cold water sinks and stirs the whole glass. After 5 minutes the drink is **10 °C** all through and
  the ice is all but gone (0.3 g of the 80 g left).
- **Ice at the bottom:** its cold water is already at the bottom; the warm drink above is lighter and stays there, and
  conduction through water is very slow. After 5 minutes the drink averages **16 °C**: ice-cold at the bottom, **still
  25 °C at the top**, with 32 g of the ice left.
- Tested: the heat the drink loses plus the heat from the room equals the heat that melted the ice (to 1%); no layer ever
  sits on lighter water; nothing sinks from ice that is already at the bottom.
- Left out: the meltwater's own volume (it would make the top-ice drink a little colder still). The cold streaks are drawn
  as 4 °C water (its densest) falling and fading; the model mixes them in at once.
- **The fridge:** in a single-door fridge the freezer box sits at the top, so the air it chills sinks past the food and
  the warmed air rises back to it (natural convection). Double-door fridges with the freezer below use a fan instead (said
  in the caption).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–1.8 s | close-up of the floating ice, cold blue water streaming down into the orange drink; ice clinks; pull back to both glasses | **PHYSICS, VISUALISED #15 · Ice at the top or the bottom: which cools a drink faster?** A top · B bottom · C the same · tag · comment your guess |
| 1.8–3.0 s | the left glass cools all through; the right only at its foot; clock ticks (a click each minute) | 16 °C · 19 °C · ice on top · ice at bottom · ⏱ 1:00 |
| 3.0–3.6 s | | the question shrinks to "Ice on top or at the bottom?"; the tag rises under it |
| 3.7 s | cold streams falling from the top ice | Cold water sinks from the ice |
| 5.0–5.8 s | punch-in on the right glass (whoosh-in): orange on top, blue below | Top layer: still 25 °C |
| 6.8–7.6 s | zoom out (whoosh-out) | Here the cold stays down |
| 8.0 s | the clock stops at 5:00 (thunk); the top ice is gone | 10 °C · 16 °C |
| 8.6 s | | **A  ice on top** lights under the left glass · Ice on top cools it all |
| 9.6–10.5 s | the camera swings right to a mint fridge, door open (whoosh) | So where should the freezer go? |
| 10.6–12.0 s | cold air (blue) falls from the freezer past the food, warms, rises at the front (peach) | freezer · Cold air falls past the food |
| 12.0–12.8 s | punch-in on the freezer (whoosh-in) | **freezer at the top** lights · Freezer on top: all of it cools |
| 13.8–15.6 s | zoom out (whoosh-out) | Cold sinks. Warm rises. |
| 15.6–17.6 s | end card | Put the cold on top · pyqvault.com · Follow for #16 |

**Colours (F24):** the drink's colour is its temperature: VIVID orange at 25 °C through peach and light blue to VIVID blue
at 0 °C (orange vs blue told apart for colour-blind viewers, tested); the numbers use the same scale through ink, so they
read on the studio (≥ 3:1, tested). Glass, ice and steel REAL; the fridge mint with a white inside.

## Files

- `pv-physics-015-ice.mp4` · `pv-physics-015-ice-cover.png` (1.6 s: both glasses, the question, before any answer)
- Re-make: `cd remotion && npm test && npm run music:pp015 && npm run mix:pp015 && npm run render:pp015 && npm run cover:pp015`
