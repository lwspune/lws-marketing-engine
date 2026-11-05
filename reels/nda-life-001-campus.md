# @lws.pune · NDA Life #1, NDA campus tour: 6 places every cadet knows

**Handle:** @lws.pune (project `pyq-vault`, post slug `nda-life-001-campus`) · **Series:** NDA Life #1, the first reel of
framework F41 (NDA life first, maths reels paused, founder 2026-11-02) · **Idea:** N1 in `lwspune-ideas.md` ·
**Storyboard:** [nda-life-001-campus.storyboard.md](nda-life-001-campus.storyboard.md), reviewed by an independent agent
before any code (F31: 4 blockers fixed, 4 improvements taken, 1 declined) · **Look:** real 3D on the white board: a toy-like
model of the campus · **Music:** Pixabay shelf track `epic-build` ("Cinematic Epic", The_Mountain, Pixabay Content License;
F13 v1.16) from 1.0 s: quieter through the tour, fuller from ~17 s · **Length:** 29.7 s · **Made in Remotion 3D**
(`remotion/src/Life001.tsx`; camera, places, parade, jets, words and sound in `src/lib/life001.ts`; tests in
`tests/life001.test.ts`; Sudan Block shared with One Day in `src/sudanBlock.tsx`).

**History (founder, 2026-11-03):** the first version was a guess-the-place question (A Sudan Block · B Khetarpal · C Peacock
Bay, 17.6 s). "Seems fast" → re-cut at 24.6 s (F2's pacing floor, L80). Then "can we make this reel as campus tour with
highlighting few more prominent places" and "music can be better. currently seems kiddish" → this tour, with orchestral
music. The question version is in git history (to `6564e9e`).

## What's true (checked, F42)

Every line, with its official source, is in the storyboard's § 8. In short:
- Sudan Block, NDA's landmark: PIB, 16 Jan 2024 (PRID 1996645). What it houses isn't claimed.
- Squadrons ("Squadron Building: Cadets' Home"), three swimming pools, horse riding, Peacock Bay's water sports all year:
  NDA's joining instructions, Course 155, § 6, § 12, § 41, § 43.
- Khetarpal Ground, the passing-out parade, the Antim Pag; a Su-30 fly-past at the 149th course's parade: PIB, 30 Nov
  2025 (PRID 2196625).
- Maths 300 of the 900 written marks: UPSC, NDA & NA (II) 2026 notification.
- Not claimed: where anything stands (our own model, not to scale, said in the caption); uniforms; Habibullah Hall (no
  official source found).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0–4.0 s | the model turning once; six numbered pins pop in; a gold route draws itself; blocks of cadets already on the ground | **NDA LIFE · CAMPUS TOUR · 6 places every NDA cadet knows** + six dots 1–6 |
| 4.0–7.0 s | 1 Sudan Block: down to the dome, round it | *1 · Sudan Block* · NDA's landmark building. |
| 7.0–10.0 s | 2 a squadron building; on its lawn the squadron doing star jumps | *2 · Squadron building* · Cadets live in squadrons. |
| 10.0–13.0 s | 3 a pool, swimmers doing lengths | *3 · Swimming pool* · One of NDA's three pools. |
| 13.0–16.0 s | 4 the riding ring, three horses with riders trotting | *4 · Horse riding* · Cadets learn horse riding. |
| 16.0–19.0 s | 5 Peacock Bay, white sails | *5 · Peacock Bay* · Water sports all year round. |
| 19.0–24.9 s | 6 Khetarpal Ground: the blocks mark time, the gold band appears, only the passing-out course marches over it | *6 · Khetarpal Ground* · Where cadets pass out. · The last step: Antim Pag. |
| 24.9–26.5 s | three jets in a vee fly in and past | |
| 26.5–29.7 s | the camera rises to the whole campus; end card | It starts with the written exam: maths is 300 of 900 marks. / **Follow for more** |

**Cover:** 3.6 s (the model, all six pins, the route) with "6 places every NDA cadet knows" above the picture.

## Sound (F14–F16)

Wind and birds under everything, fading out at the end; a click as each pin pops and as it comes up on its visit; claps on
the squadron's jumps; splashes at the pool; hoofbeats at the ring; water at the bay (the music dips ~3 dB under both); a soft
shimmer as the gold band appears; marching time on the ranks' step beat, then a loud step as each rank crosses, the music
dipping ~6 dB under each; three staggered jet passes and the roar, the loudest moment, the music ducked under them and its
own swells trimmed. No whooshes on the 1.5 s glides (F15). Effects 9 dB under the music (F16).

## Review panel (F38)

Scores and must-fixes: `review-panel.md` → Log. Declined, with the reason:
- A bigger model or an action shot on frame 0 (Drama, Colour, Motion): the whole model with its six pins is the hook and
  must stay whole while it turns (≤ 960 px at every angle, tested; F22). The weakest point of the reel; the founder decides.
- Tricolour smoke on the jets (Colour): a Su-30 fly-past has none (PIB), and smoke in a vee reads as the Surya Kiran team.
- Ending on the step, the exam line only in the caption (Drama): F43, every NDA life reel ends on the written exam.
- Shorter stops as the tour goes (Drama): the founder's pacing floor (F2 v1.15: "seems fast").
- A sky behind the whole reel, coloured sails (Colour): the white board is the house look (F12); a near orange sail read as a
  red shard in the first version. The sky is used only behind the jets.
- Moving the music so its crest lands on the march (Sound): the track's build is at 18 s and it can't start before 0.
