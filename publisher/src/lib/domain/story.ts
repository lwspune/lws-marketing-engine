// Daily quiz Stories: which days to plan, when each goes out, and what its card says.
//
// One story per day, planned a week at a time (next Monday to Sunday) so the founder approves the
// week in one sitting. The quiz for each day comes from PYQ Vault (/api/quiz/today?date=) and is
// stored on the post, so the card, the story-reply DM and the Telegram post all name the same quiz.

/** A quiz as PYQ Vault's /api/quiz/today describes it; `links` are the tagged quiz URLs per place. */
export interface StoryQuiz {
  publicSlug: string;
  title: string;
  chapter: string | null;
  links: Record<string, string>;
}

/** How a viewer gets the link: the bio (until the reply DM exists) or by replying QUIZ. */
export type StoryCta = "bio" | "reply";

const DAY_MS = 86_400_000;
const IST_OFFSET_MS = 5.5 * 3_600_000;

/** 7:30 am IST: before school and coaching, when aspirants check their phones. */
export const storyMorning = (date: string): Date => new Date(`${date}T07:30:00+05:30`);

export const storySlug = (date: string): string => `daily-quiz-${date}`;

const isoDate = (istDay: number) => new Date(istDay * DAY_MS).toISOString().slice(0, 10);

/** Next Monday to Sunday on the Indian calendar. On a Monday that's a week away: today is running. */
export function weekAhead(now: Date): string[] {
  const today = Math.floor((now.getTime() + IST_OFFSET_MS) / DAY_MS);
  const weekday = (today + 3) % 7; // 0 = Monday (1 Jan 1970 was a Thursday)
  const monday = today + (7 - weekday);
  return Array.from({ length: 7 }, (_, i) => isoDate(monday + i));
}

export interface StoryCardText {
  kicker: string;
  chapter: string;
  quizName: string;
  note: string;
  cta: string;
}

const DAY_LABEL = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });

/** "Mon 19 Oct" for a YYYY-MM-DD date. */
export const storyDayLabel = (date: string): string => DAY_LABEL.format(new Date(`${date}T00:00:00Z`)).replace(",", "");

/**
 * The card's words. House rules (reels/lwspune-insta.md): no handle on screen and no number we
 * can't back up, so it names the chapter and the quiz and says only what the quiz page does.
 */
export function storyCardText(quiz: StoryQuiz, date: string, cta: StoryCta): StoryCardText {
  const after = quiz.title.split(" — ")[1];
  return {
    kicker: `Today's quiz · ${storyDayLabel(date)}`,
    chapter: quiz.chapter ?? quiz.title,
    quizName: after === undefined ? "" : after.trim(),
    note: "Free · see your score instantly",
    cta: cta === "reply" ? "Reply QUIZ for the link" : "Tap the link in our bio",
  };
}

export type StoryApproval = { ok: true; scheduledAt: Date | null } | { ok: false; reason: string };

/**
 * When approving a story makes it go out: at its morning if that's still ahead, straight away if
 * its day has started, and not at all once its IST day is over (the card says "Today's quiz · <day>").
 */
export function storyApproval(plannedFor: Date, now: Date): StoryApproval {
  const istDay = (d: Date) => Math.floor((d.getTime() + IST_OFFSET_MS) / DAY_MS);
  if (istDay(now) > istDay(plannedFor)) return { ok: false, reason: "This story's day has passed." };
  return { ok: true, scheduledAt: plannedFor.getTime() > now.getTime() ? plannedFor : null };
}
