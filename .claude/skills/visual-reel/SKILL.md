---
name: visual-reel
description: Make an @lws.pune "visual" reel — an NDA maths concept (or a real NDA PYQ) shown by an animated graph on the soft-white board (curve draws, area fills with slices, figure transforms), like reels/nda-maths-005-area. Use when asked for a visual/graph/animated/white-board reel, or "a reel like 005".
---

# Visual reel

Follow **`reels/visual-reel-workflow.md`** step by step. It is the source of truth; this skill only
makes sure it gets used.

**Before any code: the storyboard + its independent review** (framework F31, `reels/lwspune-storyboard.md`).

**First read `reels/lwspune-framework.md`** (2026-10-20): every new @lws.pune reel follows it, and where it differs from
the workflow (concepts first, a PYQ only in the caption when one fits; Remotion), the framework wins.

Non-negotiables while doing it:

1. **One real PYQ, re-derived.** Exactly one question per reel, never two (not even a linked pair on
   one set-up). Read it from the question bank (read-only, anon key) and solve it yourself before
   building anything. Write the working and traps into the caption kit.
2. **3D, from a template** (framework F34, founder 2026-10-24: "3D reels only for lwspune"). Start from
   `remotion/src/Reel025.tsx` + `src/lib/reel025.ts` (3D on the white board, `RealLight`, an opening orbit, physics via
   `reel025Physics.ts` where things fall or collide). The engine template (`nda-maths-007-cancel.render.html`) is for
   re-making old engine reels only.
3. **Tools, not ad-hoc scripts.** Use `reels/tools/` (frames → record → cover → check-video). Look at
   the contact sheet and the decoded strip before calling it done; `check-video` must print 4 PASS.
4. **Engine changes:** test-first in `tests/`, then `node reels/tools/unchanged.mjs` must say SAME for
   every existing reel.
5. **Deliverables:** MP4, cover PNG, `.md` caption kit, `.post.json` validated with the publisher's
   rules, and a `format-test.md` entry while the format is on test.
6. **Never post.** The founder approves on their phone (checklist in the caption kit).

If you learn something new while making one, add it to the runbook in the same session.
