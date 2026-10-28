# @pyqvault_ house settings (approved by the founder, 2026-10-18)

The Instagram for **PYQ Vault**: Physics, Chemistry and Maths concepts for **Class 11–12** (CBSE / State boards, JEE,
NEET, MHT-CET), explained visually. Not NDA or defence (that's @lws.pune). Publisher project **`pyqvault-insta`**: posts go
to @pyqvault_ and the PYQ Vault Facebook Page. Reels are made in Remotion (`remotion/`) by the framework below.

## How a reel is made: the framework

**Every reel follows [`pyqvault-framework.md`](pyqvault-framework.md)** (founder, 2026-10-20): 20 numbered points on
topic, hook, picture, sound and shape, each with its reason, how it's checked and its status. The content and look rules
that used to be here moved there unchanged (plus the 2026-10-20 points); change them only through its change log.

- **Series:** "Physics, visualised #N", "Chemistry, visualised #N" and "Maths, visualised #N", rotating P → C → M
  (framework F19). Maths was off from 2026-10-20 and is back from 2026-10-28 (founder: "defence related reels will go to
  lwspune. maths, physics, chem will go to pyqvault"); the count carries on from Maths #2. NDA maths and defence reels
  stay on @lws.pune; no topic goes to both.
- **Imitate proven reels** (framework F40, founder 2026-10-28: "let's not reinvent the wheel"): reels copy a ≥ 3× reel
  from another creator as closely as possible, in our own look, words and sound.
- Physics #1 and Chemistry #1 were made with the old engine (`api.jar`, `api.sphere3d`) and stay as they are.

## Caption

- First line names the syllabus (L23): `Class 11 Physics · <chapter>` / `Class 12 Chemistry · <chapter>` /
  `Class 12 Maths · <chapter>`.
- Then the series line, 2–4 short lines on the idea, one line on where it's asked, the save/follow ask, and
  "Practise every PYQ on this chapter free → link in bio (PYQ Vault)".
- Hashtags: #Physics, #Chemistry or #Maths, #Class11 / #Class12, #CBSE, #JEEMain, #NEET (physics and chemistry only;
  + #MHTCET where relevant), the chapter, #PhysicsVisualised / #ChemistryVisualised / #MathsVisualised.
- Facebook: same, with the PYQ Vault chapter link written out.
- **Predict-first reels** (framework F4, F6): line 1 is the question with its options, then "Comment your guess before you
  watch 👇" and "Answer at the end of the reel 👀". The answer is never in the caption, on any platform (L45; checked
  by `tests/caption-answer.test.js`).

## Posting

- **One reel a day at 18:00 IST** (founder, 2026-10-26: each reel now takes longer to make, with the review panel, F38).
  Was three a day at 09:00, 13:00 and 18:00 from 2026-10-20 (11:00 / 17:30 / 21:30 before, L32). 18:00 kept: the three
  slots' framework-reel medians were within ~10% (09:00 ~1,360 views, 13:00 ~1,510, 18:00 ~1,480) and students are free
  after school. Approving in GoPost puts the reel in the next free slot (`publisher/src/lib/domain/slots.ts`).
- Numbers and lessons for this handle go in **`pyqvault-learnings.md`**, not @lws.pune's `learnings.md`.
