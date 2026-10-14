---
name: visual-reel
description: Make an @lws.pune "visual" reel — a real NDA PYQ solved by an animated graph on the soft-white board (curve draws, area fills with slices, figure transforms), like reels/nda-maths-005-area. Use when asked for a visual/graph/animated/white-board reel, or "a reel like 005".
---

# Visual reel

Follow **`reels/visual-reel-workflow.md`** step by step. It is the source of truth; this skill only
makes sure it gets used.

Non-negotiables while doing it:

1. **Real PYQ, re-derived.** Read it from the question bank (read-only, anon key) and solve it
   yourself before building anything. Write the working and traps into the caption kit.
2. **Template, not scratch.** Copy `reels/nda-maths-005-area.render.html`, keep `theme: 'white'`,
   and use only `Reel.WHITE` colours.
3. **Tools, not ad-hoc scripts.** Use `reels/tools/` (frames → record → cover → check-video). Look at
   the contact sheet and the decoded strip before calling it done; `check-video` must print 4 PASS.
4. **Engine changes:** test-first in `tests/`, then `node reels/tools/unchanged.mjs` must say SAME for
   every existing reel.
5. **Deliverables:** MP4, cover PNG, `.md` caption kit, `.post.json` validated with the publisher's
   rules, and a `format-test.md` entry while the format is on test.
6. **Never post.** The founder approves on their phone (checklist in the caption kit).

If you learn something new while making one, add it to the runbook in the same session.
