import { z } from "zod";
import {
  storyCardText, storyDayLabel, storyMorning, storySlug, weekAhead, type StoryCardText, type StoryCta, type StoryQuiz,
} from "@/lib/domain/story";

// The weekly Story planner: for next Monday to Sunday, ask PYQ Vault for each day's quiz, draw its
// card and queue it as a Ready story. Nothing is published here; the founder approves the week.
// Days already planned are skipped, so a re-run (or the Saturday job firing twice) is harmless, and
// one day failing (PYQ Vault down, a bad reply) is reported without stopping the others.

export interface NewStory {
  slug: string;
  title: string;
  plannedFor: Date;
  quiz: StoryQuiz;
  jpeg: Buffer;
}

export interface StoryPlanRepo {
  /** Which of these slugs already exist in the project. */
  existingSlugs(slugs: string[]): Promise<string[]>;
  /** Store the card and insert the Ready post; leaves nothing behind if either step fails. */
  saveStory(story: NewStory): Promise<void>;
}

export interface QuizSource { quizFor(date: string): Promise<StoryQuiz> }

export interface PlanResult {
  planned: string[];
  skipped: string[];
  failed: { date: string; error: string }[];
}

export async function planStories(opts: {
  repo: StoryPlanRepo;
  quizzes: QuizSource;
  render: (text: StoryCardText) => Promise<Buffer>;
  now: Date;
  cta: StoryCta;
}): Promise<PlanResult> {
  const dates = weekAhead(opts.now);
  const existing = new Set(await opts.repo.existingSlugs(dates.map(storySlug)));
  const result: PlanResult = { planned: [], skipped: [], failed: [] };

  for (const date of dates) {
    if (existing.has(storySlug(date))) {
      result.skipped.push(date);
      continue;
    }
    try {
      const quiz = await opts.quizzes.quizFor(date);
      const jpeg = await opts.render(storyCardText(quiz, date, opts.cta));
      await opts.repo.saveStory({
        slug: storySlug(date),
        title: `Daily quiz · ${storyDayLabel(date)} · ${quiz.chapter ?? quiz.title}`.slice(0, 120),
        plannedFor: storyMorning(date),
        quiz,
        jpeg,
      });
      result.planned.push(date);
    } catch (e) {
      result.failed.push({ date, error: (e as Error).message });
    }
  }
  return result;
}

const httpsUrl = z.string().url().refine((u) => u.startsWith("https://"), "must be https");
const TodayReply = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    data: z.object({
      publicSlug: z.string().min(1).max(200),
      title: z.string().min(1).max(300),
      chapter: z.string().max(200).nullable(),
      links: z.record(httpsUrl),
    }),
  }),
  z.object({ ok: z.literal(false), error: z.object({ code: z.string(), message: z.string() }) }),
]);

/** PYQ Vault's /api/quiz/today (same rotation as its /go/quiz bio link), checked at the boundary. */
export function pyqVaultQuizSource(baseUrl: string, fetchImpl: typeof fetch = fetch): QuizSource {
  return {
    async quizFor(date) {
      const res = await fetchImpl(`${baseUrl}/api/quiz/today?src=story&date=${encodeURIComponent(date)}`);
      const parsed = TodayReply.safeParse(await res.json().catch(() => null));
      if (!parsed.success) throw new Error(`PYQ Vault sent an unexpected reply for ${date} (HTTP ${res.status}).`);
      if (!parsed.data.ok) throw new Error(parsed.data.error.message);
      const { publicSlug, title, chapter, links } = parsed.data.data;
      return { publicSlug, title, chapter, links };
    },
  };
}
