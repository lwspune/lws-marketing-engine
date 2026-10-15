import { describe, expect, it } from "vitest";
import { planStories, pyqVaultQuizSource, type NewStory, type StoryPlanRepo } from "@/lib/publishing/storyPlanner";
import type { StoryQuiz } from "@/lib/domain/story";

// Saturday 17 Oct 2026, 18:00 IST → plans Mon 19 to Sun 25 Oct.
const NOW = new Date("2026-10-17T12:30:00Z");
const quizFor = (date: string): StoryQuiz => ({
  publicSlug: `quiz-${date}`, title: `NDA Vectors — Formulas ${date.slice(-1)}`, chapter: "Vectors",
  links: { dm: `https://www.pyqvault.com/quiz/quiz-${date}?utm_medium=dm` },
});

function memoryRepo(already: string[] = []) {
  const saved: NewStory[] = [];
  const repo: StoryPlanRepo = {
    existingSlugs: async (slugs) => slugs.filter((s) => already.includes(s)),
    saveStory: async (s) => { saved.push(s); },
  };
  return { repo, saved };
}

const render = async () => Buffer.from([0xff, 0xd8, 0xff]);

describe("planStories", () => {
  it("plans next Monday to Sunday: one Ready story a day, at 7:30 am IST, with its quiz", async () => {
    const m = memoryRepo();
    const res = await planStories({ repo: m.repo, quizzes: { quizFor: async (d) => quizFor(d) }, render, now: NOW, cta: "bio" });
    expect(res.planned).toHaveLength(7);
    expect(m.saved.map((s) => s.slug)).toEqual([
      "daily-quiz-2026-10-19", "daily-quiz-2026-10-20", "daily-quiz-2026-10-21", "daily-quiz-2026-10-22",
      "daily-quiz-2026-10-23", "daily-quiz-2026-10-24", "daily-quiz-2026-10-25",
    ]);
    expect(m.saved[0]).toMatchObject({
      plannedFor: new Date("2026-10-19T02:00:00Z"),
      quiz: quizFor("2026-10-19"),
      title: "Daily quiz · Mon 19 Oct · Vectors",
    });
    expect([...m.saved[0].jpeg]).toEqual([0xff, 0xd8, 0xff]);
  });

  it("skips days already planned, so running it twice is harmless", async () => {
    const m = memoryRepo(["daily-quiz-2026-10-19", "daily-quiz-2026-10-20"]);
    const res = await planStories({ repo: m.repo, quizzes: { quizFor: async (d) => quizFor(d) }, render, now: NOW, cta: "bio" });
    expect(res.skipped).toEqual(["2026-10-19", "2026-10-20"]);
    expect(m.saved).toHaveLength(5);
  });

  it("a day whose quiz can't be read is reported; the other days still get planned", async () => {
    const m = memoryRepo();
    const quizzes = { quizFor: async (d: string) => { if (d === "2026-10-21") throw new Error("PYQ Vault is down"); return quizFor(d); } };
    const res = await planStories({ repo: m.repo, quizzes, render, now: NOW, cta: "bio" });
    expect(res.failed).toEqual([{ date: "2026-10-21", error: "PYQ Vault is down" }]);
    expect(m.saved).toHaveLength(6);
  });
});

describe("planStories — chosen days", () => {
  it("plans just the days asked for (e.g. today, or a day whose card was rejected)", async () => {
    const m = memoryRepo();
    const res = await planStories({
      repo: m.repo, quizzes: { quizFor: async (d) => quizFor(d) }, render, now: NOW, cta: "bio", dates: ["2026-10-17"],
    });
    expect(res.planned).toEqual(["2026-10-17"]);
    expect(m.saved[0]).toMatchObject({ slug: "daily-quiz-2026-10-17", plannedFor: new Date("2026-10-17T02:00:00Z") });
  });
});

describe("pyqVaultQuizSource", () => {
  const ok = {
    ok: true,
    data: { publicSlug: "s", title: "NDA Vectors — Formulas 1", chapter: "Vectors", url: "https://www.pyqvault.com/quiz/s", links: { dm: "https://www.pyqvault.com/quiz/s?utm_medium=dm" } },
  };
  const fetchReturning = (status: number, body: unknown) => {
    const calls: string[] = [];
    const f = (async (url: string) => { calls.push(url); return new Response(JSON.stringify(body), { status }); }) as unknown as typeof fetch;
    return { f, calls };
  };

  it("asks PYQ Vault for that date and keeps only what a story needs", async () => {
    const { f, calls } = fetchReturning(200, ok);
    const quiz = await pyqVaultQuizSource("https://www.pyqvault.com", f).quizFor("2026-10-19");
    expect(calls).toEqual(["https://www.pyqvault.com/api/quiz/today?src=story&date=2026-10-19"]);
    expect(quiz).toEqual({ publicSlug: "s", title: "NDA Vectors — Formulas 1", chapter: "Vectors", links: ok.data.links });
  });

  it("passes PYQ Vault's own error message on", async () => {
    const { f } = fetchReturning(404, { ok: false, error: { code: "no_public_quiz", message: "No quiz is public yet." } });
    await expect(pyqVaultQuizSource("https://www.pyqvault.com", f).quizFor("2026-10-19")).rejects.toThrow("No quiz is public yet.");
  });

  it("refuses a reply that isn't the expected shape", async () => {
    const { f } = fetchReturning(200, { ok: true, data: { title: "no slug" } });
    await expect(pyqVaultQuizSource("https://www.pyqvault.com", f).quizFor("2026-10-19")).rejects.toThrow(/unexpected reply/);
  });

  it("refuses links that aren't https (they end up in DMs)", async () => {
    const { f } = fetchReturning(200, { ...ok, data: { ...ok.data, links: { dm: "javascript:alert(1)" } } });
    await expect(pyqVaultQuizSource("https://www.pyqvault.com", f).quizFor("2026-10-19")).rejects.toThrow(/unexpected reply/);
  });
});
