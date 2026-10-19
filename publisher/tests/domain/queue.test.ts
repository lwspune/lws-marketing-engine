import { describe, expect, it } from "vitest";
import { newestFirst, slideStepForKey, stepSlide, swipeStep } from "@/lib/domain/queue";

// The Queue lists Ready posts in the order they were queued (the top card is the next to go out);
// the other tabs keep the latest first. Carousel previews move one slide at a time.

describe("newestFirst", () => {
  it("shows Ready oldest first, so a queued week reads in posting order", () => {
    expect(newestFirst("ready")).toBe(false);
  });

  it("keeps Scheduled, Done and Rejected newest first", () => {
    for (const tab of ["scheduled", "done", "rejected"]) expect(newestFirst(tab)).toBe(true);
  });
});

describe("stepSlide", () => {
  it("moves forward and back", () => {
    expect(stepSlide(2, 7, 1)).toBe(3);
    expect(stepSlide(2, 7, -1)).toBe(1);
  });

  it("stops at the first and last slide instead of wrapping", () => {
    expect(stepSlide(0, 7, -1)).toBe(0);
    expect(stepSlide(6, 7, 1)).toBe(6);
  });

  it("is 0 when there are no slides", () => {
    expect(stepSlide(0, 0, 1)).toBe(0);
  });
});

describe("slideStepForKey", () => {
  it("maps the arrow keys and ignores everything else", () => {
    expect(slideStepForKey("ArrowRight")).toBe(1);
    expect(slideStepForKey("ArrowLeft")).toBe(-1);
    expect(slideStepForKey("Enter")).toBe(0);
    expect(slideStepForKey("ArrowUp")).toBe(0);
  });
});

describe("swipeStep", () => {
  it("swiping left shows the next slide, swiping right the previous one", () => {
    expect(swipeStep(-80)).toBe(1);
    expect(swipeStep(80)).toBe(-1);
  });

  it("ignores small finger movements (a tap, a scroll wobble)", () => {
    expect(swipeStep(-20)).toBe(0);
    expect(swipeStep(30)).toBe(0);
  });
});
