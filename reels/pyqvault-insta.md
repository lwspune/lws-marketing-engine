# @pyqvault_ house settings (approved by the founder, 2026-10-18)

The Instagram for **PYQ Vault**: Physics, Chemistry and Maths concepts for **Class 11–12** (CBSE / State boards, JEE,
NEET, MHT-CET), explained visually. Not NDA (that's @lws.pune). Publisher project **`pyqvault-insta`**: posts go
to @pyqvault_ and the PYQ Vault Facebook Page. Reels are made in Remotion (`remotion/`) by the framework below.

## How a reel is made: the framework

**Every reel follows [`pyqvault-framework.md`](pyqvault-framework.md)** (founder, 2026-10-20): 20 numbered points on
topic, hook, picture, sound and shape, each with its reason, how it's checked and its status. The content and look rules
that used to be here moved there unchanged (plus the 2026-10-20 points); change them only through its change log.

- **Series:** "Physics, visualised #N", "Chemistry, visualised #N" and "Maths, visualised #N", rotating P → C → M day
  by day (framework F19). Maths topics never repeat @lws.pune's NDA list (see the backlog).
- Physics #1 and Chemistry #1 were made with the old engine (`api.jar`, `api.sphere3d`) and stay as they are.

## Caption

- First line names the syllabus (L23): `Class 11 Physics · <chapter>` / `Class 12 Chemistry · <chapter>`.
- Then the series line, 2–4 short lines on the idea, one line on where it's asked, the save/follow ask, and
  "Practise every PYQ on this chapter free → link in bio (PYQ Vault)".
- Hashtags: #Physics or #Chemistry, #Class11 / #Class12, #CBSE, #JEEMain, #NEET (+ #MHTCET where relevant),
  the chapter, #PhysicsVisualised / #ChemistryVisualised.
- Facebook: same, with the PYQ Vault chapter link written out.

## Posting

- **Three reels a day at 09:00, 13:00 and 18:00 IST** (founder, 2026-10-20; was 11:00 / 17:30 / 21:30 until then,
  L32). Approving in GoPost puts the reel in the next free slot (`publisher/src/lib/domain/slots.ts`).
- Numbers and lessons for this handle go in **`pyqvault-learnings.md`**, not @lws.pune's `learnings.md`.
