# @lws.pune storyboard + independent review (framework F31)

Founder, 2026-10-23: "for future reels storyboarding for lwspune be better. one independent agent should review the story."
Every new @lws.pune reel gets a written storyboard **before any code**, and an agent that didn't write it reviews it. The
reel is built only after every blocker the review raises is fixed (or declined with a reason, written down). The founder
still judges finished reels only (memory: founder judges video only); the review is Claude's own gate.

**Why:** reels 018–020 (2026-10-23) were storyboarded as a beat table inside the code and checked only at the stills
sheet. Seven faults surfaced after building, each costing a re-render (~5 min): an empty frame 0 (019), two label
collisions (018 ×2), a punch-in that cropped the origin (019), a lit cell off-screen (020), matrix entries running together
(020), and **the question's matrix never on screen** (020: "this matrix…" while the box showed the in-between one, so
nobody could answer from frame 0). Reel 016 was rejected by the founder as "confusing" (2026-10-20). A reader who
didn't write the story catches confusion; a layout map catches collisions before a pixel is drawn. Measured by L63.

## 1. Write the storyboard: `reels/<slug>.storyboard.md`

Copy the template below. Fill every section; "n/a" needs a reason. Commit it on the reel's branch before
`src/lib/<reel>.ts` (the beat table at the top of that file is then a copy of section 5's times).

```markdown
# <slug> storyboard

## 1. The idea
- One sentence: what the viewer understands at the end that they didn't at the start.
- The end-card takeaway line (≤ 7 words) and the NDA chapter.
- Source idea (backlog row, proof ×) and the NDA PYQ for the caption (id, answer re-derived) or "none, because…".

## 2. The viewer
- Who: an NDA aspirant (Class 11–12 or dropper), scrolling, often muted. What they already know about this.
- What they'll most likely answer, and why (each wrong option's pull: the trap).

## 3. The question (frame 0)
- Exact words (2 lines, ≤ 34 characters each) + the 3 options.
- **Everything needed to answer is on frame 0** (the function, the matrix, the numbers): list each item and where it is.
- Can it be answered in 2 seconds? How?

## 4. Frame 0 and the cover
- Frame 0: what is already drawn and what is already moving (F5). Not empty axes.
- Cover time + what it shows; why it doesn't give the answer away; the 3:4 crop keeps the question and the picture.

## 5. Beats
| time | picture: what moves | on-screen words (≤ 7) | camera | sound | key colours (VIVID / real) |
|---|---|---|---|---|---|
Something new every second (F2). The answer time. What keeps them watching after the answer (the second beat).

## 6. Layout map (1080 × 1920)
| zone | y range (px) | what sits there, per beat |
|---|---|---|
| header: chapter label, question, chips, "comment your guess" | 96 – 440 | |
| picture band (pills / readouts at its top ~22–110) | 470 – 1500 | |
| caption | ~1540 – 1640 | |
| nothing important | > 1680, and < 240 for the 3:4 grid crop of the cover | |
- For every label: which side of its line or point it sits on, and why that side stays free for the whole reel.
- At each zoom: what must stay in frame (corners, origin, labels) and the furthest point's screen position.
- Every number box: its widest value (e.g. "−12.5", "0.25125") fits its width.

## 7. The story without words
Beat by beat, what the pictures alone show (text, captions, labels hidden; numbers and graphs stay). If a beat needs
its words to make sense, the picture is missing something: add it here, not more words (F29's idea).

## 8. Honest numbers
Every number on screen: how it's computed and which test checks it (F10). No made-up numbers.

## 9. Risks
What could go wrong on screen (overlaps, crops, spoilers before the answer, a still second, unreadable small text,
colours that merge for colour-blind viewers) and how the layout above avoids each.

## 10. Review
(filled after the independent review: each issue → fixed how / declined why)
```

## 2. The independent review

Spawn **one fresh agent** (Agent tool, `general-purpose`; not a fork: it must not see the session's reasoning). Give it
only the brief below with the paths filled in. Don't add your own opinion of the storyboard, or it will confirm it.
It reads and reports; it never edits files.

> You are reviewing a storyboard for a 15–25 s faceless Instagram reel on @lws.pune, an NDA (Indian defence academy
> entrance) maths account. Viewers are 16–19, scrolling, often with the sound off; most leave in 5–7 s. The reel asks a
> multiple-choice question on its first frame and a moving picture answers it.
>
> Read: `reels/<slug>.storyboard.md` (the storyboard), `reels/lwspune-framework.md` (the rules every reel follows), and
> the "Content rules" section of `reels/lwspune-insta.md`. Don't read the reel's code or any other storyboard.
>
> Review it as (1) a 17-year-old NDA aspirant seeing it for the first time and (2) a careful maths teacher. Report:
> 1. **Verdict:** build / fix first.
> 2. **Blockers** (a viewer would be confused or misled, the maths is wrong, the question can't be answered from frame 0,
>    the cover gives the answer away, a framework point is broken): numbered, each with the beat or zone it's in and a
>    concrete fix.
> 3. **Improvements** (would make it clearer, more vivid or more worth saving): at most 5, each with a fix.
> 4. **Maths check:** re-derive the answer and every on-screen number yourself; say which you checked.
> 5. **Layout check:** any two things in the same place at the same time, anything that leaves the frame at a zoom.
>
> Be specific and brief (under 400 words). Don't praise; only what to change and why.

Then, in the main session: fix every blocker in the storyboard (or decline it with a reason), take the improvements
that are worth it, and fill section 10 with each issue → what was done. Re-derive any maths the reviewer disputes
before deciding who is right. Only then write the tests and the code (runbook steps 2 on).

## 3. Then test the layout (from 021–023, 2026-10-23)

The review catches story, maths and confusion; it can't see pixels. So every reel's lib exports one list of its labels
(`labelsAt(t)`: text, position, anchor, size, alpha) used by both the picture and the tests, and `labelBox()`; its tests
check, on every frame, that every visible label is inside the picture and no two overlap (copy the test from
`remotion/tests/reel021.test.ts`). On 021–023 it caught 6 faults before any render (a label leaving the frame in a
punch-in, labels still fading while another moved through them). Moving objects that must not cross (a turning tile)
get their own separating-axis test (`tests/reel022.test.ts`). The cover gets a test too: it shows nothing that gives
the answer or the method away.
