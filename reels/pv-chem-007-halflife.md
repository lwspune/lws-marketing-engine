# @pyqvault_ · Chemistry, visualised #7: 64 atoms, two half-lives: how many are left?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 12 · **Topic:** remake-backlog **C13**, topic score **7/10**
(F21; C12 scored the same but repeats Chemistry #1, heat → rate, so it was parked: founder, "no repeats"; C13 vs C14
tied on every tie-break, so table order) · **Proven idea:** none (our own idea from the MHT-CET notes) · **Framework v1.7**
· **Background:** white (L22: C6 was dark) · **Music:** `lofi` (L34: lofi and trap had the fewest reels; a calm,
narrated reel → lofi), hit on the answer · **Voiceover:** the first (F23, L43): rendered **twice**, silent and voiced;
the founder picked the **voiced** one, with the American voice over Kokoro's four Hindi voices (20 Oct) · **Length:** 21.9 s · **Made in Remotion** (`remotion/src/PvChem007.tsx`, timing, sound and voice
lines `src/lib/pc007.ts`, tests `tests/pc007.test.ts`, voice helpers `src/lib/voice.ts`).

## The chemistry (checked, and tested)

- Radioactive decay is a **first-order** reaction (NCERT Class 12, Chemical Kinetics): N = N₀ · (½)^(t / t½), and the
  half-life t½ = 0.693 / k does not depend on how much is left. After two half-lives: 64 × ¼ = **16**. Answer **B 16**.
- The count on screen follows the law exactly at every whole half-life (64, 32, 16, 8, 4, 2, 1); the k-th atom decays
  when 64 · (½)^h falls to 64 − k. **Which** atom goes is a seeded random shuffle: in real decay each atom's moment is
  random and only the average is fixed, which is the reel's second point ("Nobody knows").
- The half-life clock **pauses on screen** (⏸) for 1.6 s at the answer so "16" can land, then runs on at the same rate.
  The pause is shown, not hidden.
- Carbon dating: C-14's half-life is 5,730 years, so a bone with 25 % of its C-14 left is 2 × 5,730 = **11,460 years**
  old (age = 5,730 · log₂(1 / fraction), shown live as the gauge falls).

## On screen

| Time | Picture | Text (and voice, in the voiced version) |
|---|---|---|
| 0 s → | question + A/B/C over a tray of 64 glowing atoms, already pulsing; count 64, clock 0.0, Geiger counter | **CHEMISTRY, VISUALISED #7 · 64 atoms. Two half-lives. How many are left?** A 0 · B 16 · C 32 |
| 0.4–4.4 s | atoms decay at random: a flash, a particle flies off, the atom turns teal; the count and the graph halve | (voice reads the question) |
| 4.4 s | punch-in on the 16 survivors (lit) · **B 16** lights · clock paused | *16 left: half go each half-life* |
| 6.0–13.0 s | the clock runs on: 8, 4, 2, 1 at the same pace; the graph draws on | *Which one goes next? Nobody knows.* · *Same half-life, however many are left* |
| 13.0–19.4 s | the graph's axes turn into C-14 % and years; a bone's C-14 gauge falls to 25 % → 11,460 years old | *Carbon-14 halves every 5,730 years* · *That's how we date old bones* |
| 19.4–21.9 s | end card | Which atom goes? Random. **How many? Exactly half.** Follow for #8 · **pyqvault.com** |

## Camera (F9) and sound (F14–F16, F23)

- Drift from frame 0 → slow push while the atoms go → **punch-in landing on the answer** (whoosh) → quick zoom out as
  the clock restarts (whoosh) → slow push for "same half-life" → zoom out for the bone (whoosh).
- A **Geiger click on every decay** (the counter on screen flashes with it), whooshes on the fast zooms.
- Voiced version: Kokoro `af_heart` at 1×, each line at −20 dBFS, the music dipped ~8 dB under it. Every line is the
  on-screen words, inside the time they are up (tested); the longest, the carbon line, takes 4.0 s of its 4.2 s.

## Files

- `pv-chem-007-halflife.mp4` (silent) · `pv-chem-007-halflife-voice.mp4` (voiced) · `pv-chem-007-halflife-cover.png`
  (0.3 s, before any atom decays) · `pv-chem-007-strip.png`
- Re-make: `cd remotion && npm test && npm run music:pc007 && npm run voice:pc007 && npm run mix:pc007 && npm run render:pc007
  && npm run render:pc007v && npm run cover:pc007`
