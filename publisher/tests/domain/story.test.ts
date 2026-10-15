import { describe, expect, it } from "vitest";
import { storyApproval, storyCardText, storyMorning, storySlug, weekAhead, type StoryQuiz } from "@/lib/domain/story";

const quiz: StoryQuiz = {
  publicSlug: "nda-maths-vectors-formula-1",
  title: "NDA Vectors — Formulas 1",
  chapter: "Vectors",
  links: { dm: "https://www.pyqvault.com/quiz/nda-maths-vectors-formula-1?utm_medium=dm" },
};

describe("storyMorning / storySlug", () => {
  it("a story goes out at 7:30 am IST on its day", () => {
    expect(storyMorning("2026-10-19").toISOString()).toBe("2026-10-19T02:00:00.000Z");
  });

  it("one slug per day, so planning a day twice can't make two stories", () => {
    expect(storySlug("2026-10-19")).toBe("daily-quiz-2026-10-19");
  });
});

describe("weekAhead", () => {
  it("plans next Monday to Sunday, from any day of the week before", () => {
    // Saturday 17 Oct 2026, 18:00 IST.
    expect(weekAhead(new Date("2026-10-17T12:30:00Z"))).toEqual([
      "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24", "2026-10-25",
    ]);
  });

  it("on a Monday it still plans the NEXT Monday's week (today's is already running)", () => {
    expect(weekAhead(new Date("2026-10-19T03:00:00Z"))[0]).toBe("2026-10-26");
  });

  it("uses the Indian calendar: Sunday 23:30 IST is still Sunday", () => {
    // 2026-10-18T18:00Z = Sunday 23:30 IST → next Monday is the 19th.
    expect(weekAhead(new Date("2026-10-18T18:00:00Z"))[0]).toBe("2026-10-19");
  });
});

describe("storyCardText", () => {
  it("names the chapter and the quiz, and the day", () => {
    const t = storyCardText(quiz, "2026-10-19", "bio");
    expect(t.chapter).toBe("Vectors");
    expect(t.quizName).toBe("Formulas 1");
    expect(t.kicker).toBe("Today's quiz · Mon 19 Oct");
  });

  it("the call to action matches how the link is reached", () => {
    expect(storyCardText(quiz, "2026-10-19", "bio").cta).toBe("Tap the link in our bio");
    expect(storyCardText(quiz, "2026-10-19", "reply").cta).toBe("Reply QUIZ for the link");
  });

  it("says nothing it can't back up: no numbers, no handle", () => {
    const t = storyCardText(quiz, "2026-10-19", "reply");
    const all = Object.values(t).join(" ");
    expect(all).not.toMatch(/@/);
    expect(all.replace(/19 Oct|Formulas 1/g, "")).not.toMatch(/\d/);
  });

  it("copes with a quiz title that has no dash and no chapter", () => {
    const t = storyCardText({ ...quiz, title: "NDA Probability Practice", chapter: null }, "2026-10-19", "bio");
    expect(t.chapter).toBe("NDA Probability Practice");
    expect(t.quizName).toBe("");
  });
});

describe("storyApproval", () => {
  const planned = storyMorning("2026-10-19"); // Mon 19 Oct, 07:30 IST

  it("before its morning: scheduled for 7:30 am that day", () => {
    expect(storyApproval(planned, new Date("2026-10-17T12:30:00Z"))).toEqual({ ok: true, scheduledAt: planned });
  });

  it("later the same day: posts straight away (the card still says today)", () => {
    expect(storyApproval(planned, new Date("2026-10-19T05:00:00Z"))).toEqual({ ok: true, scheduledAt: null });
  });

  it("once its day is over (Indian time) it can't be approved: the card would name the wrong day", () => {
    // Tue 20 Oct 00:10 IST
    expect(storyApproval(planned, new Date("2026-10-19T18:40:00Z"))).toEqual({ ok: false, reason: "This story's day has passed." });
  });
});
