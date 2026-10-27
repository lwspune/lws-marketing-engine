# @lws.pune · Defence #1, Army ranks: which rank wears this? Then Lieutenant to General, and the Field Marshal

**Handle:** @lws.pune (project `pyq-vault`, post slug `nda-defence-001-army-ranks`) · **Series:** Defence #1 (the first
defence-knowledge reel; ONE DAY, Story #1, is the first defence story) · **Storyboard:**
[nda-defence-001-army-ranks.storyboard.md](nda-defence-001-army-ranks.storyboard.md), reviewed by an independent agent
before any code (F31; 4 blockers fixed or settled, 5 improvements taken) · **Founder's brief (2026-10-27):** "a lwspune reel
on different army officer ranks" · **Look:** real 3D on the white board: an olive shoulder strap, brass badges · **Music:**
`synthwave`, full from frame 0 (`drive` was tried first: its level falls ~0.5 dB a second, logged in SUGGESTIONS.md) ·
**Length:** 20.8 s · **Made in Remotion 3D** (`remotion/src/Defence001.tsx`; badges, camera, words and sound in
`src/lib/defence001.ts`; tests in `tests/defence001.test.ts`).

## What's true (checked)

- Every badge checked by eye against the Wikimedia Commons insignia pictures used by Wikipedia's *Indian Army ranks and
  insignia* (2026-10-27), and in words where a page has them: Lieutenant 2 stars · Captain 3 stars · Major the national
  emblem · Lt Colonel the emblem over 1 star · Colonel the emblem over 2 stars · Brigadier the emblem over 3 stars in a
  triangle (one, then two side by side) · Major General a star over a crossed sword and baton · Lieutenant General the
  emblem over a crossed sword and baton · General the emblem and a star over a crossed sword and baton. Tested against
  this list (`tests/defence001.test.ts`).
- Field Marshal: the emblem over two crossed batons in a wreath (*Field marshal (India)*; the Commons picture was corrected
  in 2024 from Sam Manekshaw's uniform). Only two holders: Manekshaw (1973) and Cariappa (1986).
- "9 ranks" = Lieutenant to General. New officers are commissioned as Lieutenants (Second Lieutenant is no longer used).
- General is the Army Chief's rank; the reel doesn't say "only one" (a Chief of Defence Staff from the Army is a General
  too).
- The emblem is our own simplified drawing, shown only as part of a badge, never as a mark or beside a brand (State
  Emblem of India (Prohibition of Improper Use) Act, 2005).

## On screen

| Time | Picture | Text |
|---|---|---|
| 0 s → | the strap wearing the Brigadier's badges, already turning | **NDA · ARMY RANKS · Which rank wears this? Look at the shoulder.** A Colonel · B Brigadier · C Major Gen |
| 0–3.0 s | one full turn under a slow push: slow past the front, a whip round its (lit) back | |
| 3.0 s | **B lights**; punch-in; the three stars flash | |
| 3.1–4.4 s | a white line joins the three stars | *Emblem + 3 stars in a triangle* |
| 4.4–5.6 s | the bottom-right star slides off, the other moves to the centre: Colonel | *Colonel: emblem + only 2 stars* |
| 5.4–6.0 s | every badge flies off; the ladder of 9 ranks fades in on the left | |
| 6.0–15.9 s | a rank every 1.1 s, each badge dropping on with a pop; its ladder row lights (orange, bold, a dot) and its name shows big under the strap | *NDA → IMA → you start here* (Lieutenant) · *The Army Chief's rank* (General) |
| 15.9–18.6 s | the Field Marshal's wreath lands (16.5); a row above the ladder lights; zoom out | *Only 2 ever held this rank* · *Manekshaw (1973) · Cariappa (1986)* |
| 18.6–20.8 s | end card | 9 ranks. Lieutenant to General. **Follow for more** |

**Cover:** 2.7 s (the turn back at the front, nothing answered), no header (the 3:4 grid crop cut through it), "Which rank
wears this?" on a pill at y 1590.

## Sound (F14–F16)

A thunk on the answer and a tink as each of its stars flashes; a click as the trap's star slides off and a tink as the
other settles; a clank whenever badges come off; a tink as each badge lands, rising a step per rank; General and the Field
Marshal land with a thunk on a music accent, the Field Marshal with a shimmer and the music lifted under it; whooshes on
the fast zooms only. Effects ~6 dB under the music, peak −3.3 dB.

## Review panel (F38)

Pass 1 (MP4): Drama 4, Colour 5, Motion 5, Sound 6. Pass 2: Drama 4, Colour 7, Motion 6, Sound 6. Must-fixes and what was
done: `review-panel.md` → Log. Two pass-1 claims were checked at full size and were wrong (the Lieutenant's stars were
there at 7 s; no star was floating by the ladder at 6 s).

Declined:
- A ±35° rock instead of the full turn (all three pass-1 critics): F22 is the founder's rule; the turn now whips round the
  back in ~0.6 s and the back is lit olive.
- A dark background (Drama, Colour): F12, the white board is @lws.pune's house look.
- Faster junior ranks and slower generals, a camera move per rank (Drama, Motion): kept one rank per 1.1 s so each badge
  can be read; the slow push runs through the climb.
- Locking the rank step to the music's beat (Sound, both passes): needs the whole timeline retimed; the landings are
  heard over the music either way.
- Ending on the Field Marshal strap, fading the header during the ladder, a brass star on the end card (Drama, Colour):
  F20's end card is the house standard; the header keeps the question the reel answered.
- Specular streaks and darker bevels on the brass, a dark outline on the white star line, "comment your guess" darker
  (Colour): the brass already measures ~3.6–3.9:1 on the cloth; the nudge is the shared header's colour on every reel.

## Files

- `nda-defence-001-army-ranks.mp4` · `nda-defence-001-army-ranks-cover.png` · `nda-defence-001-army-ranks.post.json`
- Re-make: `cd remotion && npm test && npm run music:d001 && npm run mix:d001 && npm run render:d001 && npm run cover:d001`

## Before you post (founder)

- [ ] Watch it once on the phone: the stars and the emblem read on the strap; the rank names readable
- [ ] Cover chosen in the upload screen
- [ ] Reply to the rank comments in the first hour (the caption asks "Which rank will you retire as?")
