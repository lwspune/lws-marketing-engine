# @pyqvault_ · Chemistry, visualised #12: one drop of indicator. Milk is acidic, neutral or basic?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 10–11 · **Topic:** idea **C9** ("The pH chart", score
72/100; re-angled on 2026-10-26 for the share test: the whole chart, with milk as the guess) · **Hook:** You'd think (milk
"should" be neutral) · **Opening:** Colour flood: close on a dropper over the milk with a drop falling on frame 0, two tubes beside
it already coloured; the camera follows the dropper tube to tube (a drop every ~0.5 s to 2.25 s), then pulls back to the
whole rainbow (F37: aftershock 1.39, seconds 1–3 moving 23% of the pixels a frame) · **Second hook:** none (F26 dropped in v1.33) · **Loop:** yes, a rewind to frame 0 (F27) ·
**The first F39 reel (made to send):** the payoff is the whole chart, seven everyday liquids on a pH strip, held still as a
cheat sheet for 1.8 s (11.7–13.5 s), the whole set listed in the caption with milk as "?", and a send line ("Send this to your
lab partner before the practical") · **Framework v1.34** · **Look:** full frame (F35) on Chemistry #11's dark set (the
review panel's pass 1: on the white studio, pastel tubes on off-white read as a bar chart) · **Music:** `cinematic`, hits on
the answer (7.0 s) and the cheat sheet (11.7 s), dipped under the strip's snap, the landings and the answer's thunk · **Voice:** none (silent) · **Length:** 15.3 s · **Made in Remotion**
(`remotion/src/PvChem012.tsx`; timeline, chemistry and every text's place in `src/lib/pc012.ts`; 24 tests in
`tests/pc012.test.ts`).

## The chemistry (checked, and tested)

- Typical pH values: lemon juice 2, soda water 4, milk 6.5, water 7, baking soda solution 8, soap 10, drain cleaner 13
  (real ones vary a little by brand: lemon juice 2–2.6, soda water 3.5–4, milk 6.4–6.8, baking soda ≈ 8.3, soap 9–10,
  drain cleaner 13–14; said in the caption). Milk is **slightly acidic**: the answer is **A acidic**.
- A common universal indicator's colours: red ≤ 3, orange 4–5, yellow 6, green 7, teal 8, blue 9–10, indigo 11, violet
  12–14 (tested per pH). Milk is opaque, so its yellow-green shows pale.
- **No bleach** (the idea first said "lemon to bleach"): sodium hypochlorite bleaches the indicator itself, so a violet
  bleach tube would be fake (F10). Drain cleaner (sodium hydroxide) takes the basic end.
- The sort is honest about space: tubes that cross pass in different depth lanes, and no two ever overlap (tested); a lifted
  tube stays under the strip (tested).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–0.15 s | dark set, close: a dropper over the milk (opaque cream), a fat glowing drop falling; baking soda (teal) and water (green) already coloured | **CHEMISTRY, VISUALISED #12 · One drop of indicator. Milk is…** A acidic · B neutral · C basic · tag · a "milk" pill on its tube |
| 0.15 s | the drop lands: a bright yellow-green cloud runs down the milk (tap) | |
| 0.25–2.25 s | the camera follows the dropper close: soap (0.7), lemon juice (1.15), a long glide right to soda water (1.8), drain cleaner (2.25), a drop, a cloud and a tap each | |
| 2.3–3.0 s | the pull-back to the whole rainbow (whoosh); the dropper lifts away | |
| 3.0 s | | the question shrinks: "Milk: acid, neutral or base?" |
| 3.1–3.65 s | the pH strip, 0 to 14 in the indicator's own colours, slides in above the rack and locks (shimmer, snap) | acid · 7 neutral · base · "Each colour means a pH" |
| 3.7–4.85 s | the tubes lift and swap into pH order | |
| 5.0–6.5 s | they land one by one, acid to base, each with a hop (taps rising in pitch); a pointer runs from each to its pH on the strip | pH 2 · lemon juice, pH 4 · soda water … |
| 4.85–7.0 s | milk hovers over the gap between soda water and water | ? (big) |
| 7.0 s | milk lands, just left of water's green, a warm ring pulses out (thunk, music hit); punch-in on milk and water | pH 6.5 (warm white); **A acidic** lights at 7.5 s (a bright tick) |
| 8.2–9.65 s | across to the acid end, close | Below 7: acids |
| 9.6–10.95 s | across to the base end, close | Above 7: bases |
| 10.95–11.45 s | out to the whole rack | |
| 11.7–13.5 s | **the cheat sheet**, everything still (music hit at 11.7) | Universal indicator: the pH chart · every tube's pH and name · acid · 7 neutral · base |
| 13.5–15.3 s | the rewind (shimmer): tubes fly back, colours drain, back to the dropper over the milk: the last frame is frame 0 | the question returns |

**Colours (F24):** the liquids are the indicator's real colours; milk opaque cream; every tube is labelled with its pH and
name once sorted, so colour is never the only cue. Text in the LAB palette; the answer is dark text on warm white (≥ 4.5:1,
tested), a colour no liquid uses.

## Review panel (F38)

Two passes, then Sound on the final MP4: Drama · Colour · Motion **3 · 4 · 5** (white studio stills) → **5 · 6 · 6** (dark set,
the MP4) · Sound **6**. Pass 1 moved the reel to the dark set (all three critics), gave milk its look and tag, a real dropper,
readable labels and a full cover; pass 2 made the camera follow the dropper, fixed the drifting milk tag and the text over
the tube rims; the Sound pass fixed the buried landings and thunk. Every must-fix and what was done: `reels/review-panel.md`
→ Log. Declined, with reasons there: hiding milk's empty slot (it is the "where will it land?"), dimming the other tubes at
the answer, a spotlight on milk alone in the cover, holding all the music down (against F16).

## Files

- `pv-chem-012-ph.mp4` · `pv-chem-012-ph-cover.png` (2.93 s: the whole rainbow, every tube full, milk tagged, the question big)
- Re-make: `cd remotion && npm test && npm run music:pc012 && npm run mix:pc012 && npm run render:pc012 && npm run cover:pc012`
