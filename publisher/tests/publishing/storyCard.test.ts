import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { renderStoryCard } from "@/lib/publishing/storyCard";

describe("renderStoryCard", () => {
  it("makes a 1080×1920 JPEG (Instagram's story size; it rejects PNG)", async () => {
    const jpg = await renderStoryCard({
      kicker: "Today's quiz · Mon 19 Oct", chapter: "Vectors", quizName: "Formulas 1",
      note: "Free · see your score instantly", cta: "Reply QUIZ for the link",
    });
    expect([...jpg.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
    const meta = await sharp(jpg).metadata();
    expect(meta).toMatchObject({ format: "jpeg", width: 1080, height: 1920 });
  });

  it("fits a long chapter name without throwing", async () => {
    const jpg = await renderStoryCard({
      kicker: "Today's quiz · Mon 19 Oct", chapter: "Applications of Integration and Differential Equations",
      quizName: "Practice 6", note: "Free · see your score instantly", cta: "Tap the link in our bio",
    });
    expect((await sharp(jpg).metadata()).height).toBe(1920);
  });
});
