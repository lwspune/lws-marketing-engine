# @lws.pune · NDA Life #1, NDA as a miniature: where is the passing-out parade held?

**Handle:** @lws.pune (project `pyq-vault`, post slug `nda-life-001-campus`) · **Series:** NDA Life #1, the first reel of
framework F41 (NDA life first, maths reels paused, founder 2026-11-02) · **Idea:** N1 in `lwspune-ideas.md` ·
**Storyboard:** [nda-life-001-campus.storyboard.md](nda-life-001-campus.storyboard.md), reviewed by an independent agent
before any code (F31: 7 blockers fixed, 3 improvements taken), with build notes after each review-panel pass (§ 11) ·
**Look:** real 3D on the white board: a toy-like model of the campus · **Music:** Pixabay shelf track `patriotic-india`
("Indian Patriotic", JonasBlakewood, Pixabay Content License; F13 v1.14), from 0.3 s · **Length:** 24.6 s (first cut 17.6 s; slowed after the founder's "seems fast", 2026-11-03) · **Made in
Remotion 3D** (`remotion/src/Life001.tsx`; camera, pins, parade, jets, words and sound in `src/lib/life001.ts`; tests in
`tests/life001.test.ts`; Sudan Block shared with One Day in `src/sudanBlock.tsx`).

## What's true (checked, F42)

Every fact, with its official source, is in the storyboard's § 8. In short:
- Khetarpal (Parade) Ground is where the passing-out parade is held; the cadets "crossed the Antim Pag on the tunes of Auld
  Lang Syne"; 1,250 on parade, 329 passing out; a Su-30 fly-past ended it: PIB, 149th course, 30 Nov 2025 (PRID 2196625).
  The caption ties the numbers and the fly-past to that parade.
- Sudan Block, NDA's landmark: PIB, 16 Jan 2024 (PRID 1996645). What it houses isn't claimed.
- Peacock Bay, water sports: NDA's joining instructions, Course 155, § 12.
- Maths 300 of the 900 written marks: UPSC, NDA & NA (II) 2026 notification.
- Not used: the campus area (PIB 7,015 acres vs the joining instructions' 6,780); where the buildings stand (our own model,
  not to scale, said in the caption); the cadets' uniform (plain navy figures).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | the model of NDA turning from high above; three dark pins A, B, C over Sudan Block, the ground, the lake | **NDA LIFE · THE CAMPUS · Where is the passing-out parade held?** A Sudan Block · B Khetarpal · C Peacock Bay |
| 0–4.0 s | one full turn; the pins pop in turn (0.4, 1.2, 2.0) | |
| 4.0–8.5 s | glide down to Sudan Block, round the dome; pin A pops with a red ✗ (6.9) | *A · Sudan Block* · *Not the parade ground.* |
| 8.5–13.0 s | glide to the lake, over the white sails; pin C pops with a red ✗ (11.6) | *C · Peacock Bay* · *Peacock Bay: water sports.* · *Not here.* |
| 13.0–15.6 s | glide to the ground; blocks of cadets dropped in like toy soldiers (14.8–15.5) | *B · Khetarpal* |
| 15.6 s | **a big green ✓ slams over the ground**, a ring goes out, it settles into pin B | *B · Khetarpal Ground* · *Passing-out parade: here.* |
| 16.6–20.2 s | low beside the gold band: only the passing-out course marches over it, rank by rank | *The last step: Antim Pag.* |
| 19.8–21.4 s | three jets in a vee fly in and past | |
| 21.4–24.6 s | the camera rises over the ground to the whole campus; end card | It starts with the written exam. / Maths: 300 of 900 marks. / **Follow for more** |

**Cover:** 3.6 s (the model, three pins, nothing answered) with "Where is the passing-out parade held?" mid-page.

## Sound (F14–F16)

Wind and birds under everything; a click as each pin pops; whooshes on the fast glides only; a low thud on each ✗; water
plips over the bay; a tap as each block lands and as each rank crosses the band; the ✓ the loudest hit, with a ring, the
music dipping under it; the jets' roar, the music dipping, fading out as they go. Effects ~5 dB under the music.

## Review panel (F38)

Pass 1 (stills): Drama 4, Colour 4, Motion 5. Pass 2 (MP4): Drama 5, Motion 6, Sound 5, Colour: see `review-panel.md` →
Log. Must-fixes and what was done: storyboard § 11 and `review-panel.md` → Log.

Declined:
- "Open in the middle of the action" (Drama, pass 1 and 2): the options are places on the model, so frame 0 shows the model
  (F4), and every 3D reel opens on the orbit (F22).
- White caps or cross-belts on the cadets (Motion, pass 2): that would claim a uniform no source gives us (F42); at full
  size they read as marching figures.
- A louder master (Sound, pass 2): the mix sits in the house range (body −26…−18 dB, peak ≤ −3 dB, `check-video.mjs`).
