# @pyqvault_ · Chemistry, visualised #5: double T, halve V, the pressure?

**Handle:** @pyqvault_ (`pyqvault-insta`) · **Audience:** Class 11 · **Topic:** remake-backlog **C5**, topic score **7/10**
(F21) · **Proven idea:** @codematrixvishal "P, V and T", 299k views (11×), https://www.instagram.com/reel/DX13CZTJdVK/ ·
**Framework v1.4**, every point, and the **first orbit shot (F22, L37)** · **Background:** white (L22) · **Music:** `lofi`
(L34 rotation), hit on the answer · **Length:** 21.4 s · **Made in Remotion** (`remotion/src/PvChem005.tsx`, chemistry +
timing + camera + sound `src/lib/pc005.ts`, tests `tests/pc005.test.ts`).

## The chemistry (checked, and tested)

- Fixed amount of gas: P·V/T constant on every frame (test). Start 1 atm · 2 L · 300 K.
- 0–4 s: heated with the lid locked (pins through the glass), 300 → 600 K: P × 2. 4.3 s: the lock clicks open.
- 4.6–8 s: held at 600 K and squeezed to 1 L: P × 2 again → **4 atm, C ×4**.
- Molecules move at their real relative speed (∝ √T); the lid is hit ~2.8× as often at the end (hotter + squeezed),
  each hit harder: that's the pressure (tests).

## Camera (F9, F22) and sound (F14–F16)

- **Orbit:** the camera swings ~72° round the cylinder in the first 3.4 s (question up, burner lighting), then returns to
  the front by 4.3 s, before the squeeze. Then a slow push in while squeezing, a **punch-in landing on the answer**
  (whoosh), a quick zoom out (whoosh), a gentle push in.
- Burner whump + roar while lit, the lock's click, molecules tapping the lid (every tap a real hit), the piston's scrape
  while squeezing, a thunk as it stops. Mix: peak −3.0 dB (the limiter dipped once, 0.83, on the whump).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | question + A/B/C; the camera orbits as the burner lights | **CHEMISTRY, VISUALISED #5 · Double the temperature, halve the volume. Pressure becomes?** |
| 0–4.3 s | lid pinned; molecules warm (blue → amber); P dial 1 → 2 atm; T bar 300 → 600 K | *Heat it: lid locked* |
| 4.6–8 s | pins out, piston squeezes to 1 L; P dial → 4 atm | *Hold 600 K, squeeze to half* |
| 8.45 s | punch-in · **C ×4** lights | *Pressure ×4!* |
| 8.5–18 s | | *×2 from heat, ×2 from squeeze* · *P·V ÷ T never changes* |
| always | `P × V ÷ T = 0.0067`, worked out live from the gauges | |
| 18–21.4 s | end card | ×2 from heat, ×2 from squeeze: ×4. **That's the chemistry.** Follow for #6 · **pyqvault.com** |

## Files

- `pv-chem-005-pvt.mp4` · `pv-chem-005-pvt-cover.png` (1.0 s, mid-orbit, before the answer) · `pv-chem-005-strip.png`
- Re-make: `cd remotion && npm test && npm run music:pc005 && npm run mix:pc005 && npm run render:pc005 && npm run cover:pc005`
