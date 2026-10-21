import { storyErrorText, typicalStory, type StoryMetrics } from "@/lib/domain/metrics";

export interface StoryRow {
  id: string; title: string; publishedAt: string;
  /** The 23h snapshot: null until it's taken; `error` set when it couldn't be read. */
  metrics: (StoryMetrics & { error: string | null }) | null;
}

const IST = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short" });
// "Daily quiz · Mon 19 Oct · Vectors" → "Vectors"; "Maths answer · Mon 26 Oct · Matrices" → "Answer · Matrices" (the date is shown above).
const shortTitle = (t: string) =>
  t.replace(/^Daily quiz · [^·]+· /, "").replace(/^Maths (question|answer) · [^·]+· /, (_, p: string) => `${p[0].toUpperCase()}${p.slice(1)} · `);
const n = (x: number | null) => (x === null ? "–" : Number(x).toLocaleString("en-IN"));

// The two daily story series, each with its own typical story: they reach different audiences.
const KINDS = {
  quiz: {
    heading: "Daily quiz stories",
    note: "Profile visits are people who went on to the profile, where the bio link opens the quiz. Instagram doesn’t count link taps for stories posted by the app.",
  },
  question: {
    heading: "Daily maths questions",
    note: "Replies are people who answered by DM: their answers are in the Inbox. The morning card asks, the evening card answers.",
  },
} as const;

/** Insights tab: a daily story series' numbers, saved 23 hours after each went up (Instagram deletes them at 24). */
export function StorySummary({ rows, kind }: { rows: StoryRow[]; kind: keyof typeof KINDS }) {
  const k = KINDS[kind];
  const headingId = `story-summary-${kind}`;
  const typical = typicalStory(rows.flatMap((r) => (r.metrics && !r.metrics.error ? [r.metrics] : [])));
  const tile = (label: string, value: number) => (
    <div className="tile"><dt className="stat-label">{label}</dt><dd className="stat-value">{n(value)}</dd></div>
  );
  return (
    <section aria-labelledby={headingId} className="card space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={headingId} className="text-lg font-semibold tracking-tight">{k.heading}</h2>
        <span className="text-xs text-muted">{typical ? `Typical story: median of ${typical.count}` : "A typical story shows once 5 have numbers"}</span>
      </div>
      {typical && (
        <dl className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-4">
          {tile("Reached", typical.reach)}
          {tile("Profile visits", typical.profileVisits)}
          {tile("Follows", typical.follows)}
          {tile("Replies", typical.replies)}
        </dl>
      )}
      <ul className="divide-y divide-line rounded-xl border border-line" aria-label={`Last ${rows.length}: ${k.heading.toLowerCase()}`}>
        {rows.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">{IST.format(new Date(r.publishedAt))}</p>
              <p className="break-words text-sm">{shortTitle(r.title)}</p>
            </div>
            {!r.metrics ? (
              <p className="text-xs text-muted sm:max-w-xs">Numbers are saved 23 hours after it went up.</p>
            ) : r.metrics.error ? (
              <p className="text-xs text-muted sm:max-w-xs">Not saved: {storyErrorText(r.metrics.error)}</p>
            ) : (
              <dl className="grid shrink-0 grid-cols-4 gap-3 text-sm tabular-nums sm:w-[24rem]">
                <div><dt className="stat-label">Reached</dt><dd>{n(r.metrics.reach)}</dd></div>
                <div><dt className="stat-label">Profile</dt><dd>{n(r.metrics.profileVisits)}</dd></div>
                <div><dt className="stat-label">Follows</dt><dd>{n(r.metrics.follows)}</dd></div>
                <div><dt className="stat-label">Replies</dt><dd>{n(r.metrics.replies)}</dd></div>
              </dl>
            )}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">{k.note}</p>
    </section>
  );
}
