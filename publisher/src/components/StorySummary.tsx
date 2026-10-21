import { storyErrorText, typicalStory, type StoryMetrics } from "@/lib/domain/metrics";

export interface StoryRow {
  id: string; title: string; publishedAt: string;
  /** The 23h snapshot: null until it's taken; `error` set when it couldn't be read. */
  metrics: (StoryMetrics & { error: string | null }) | null;
}

const IST = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short" });
const n = (x: number | null) => (x === null ? "–" : Number(x).toLocaleString("en-IN"));

/** Insights tab: the daily quiz stories' numbers, saved 23 hours after each went up (Instagram deletes them at 24). */
export function StorySummary({ rows }: { rows: StoryRow[] }) {
  const typical = typicalStory(rows.flatMap((r) => (r.metrics && !r.metrics.error ? [r.metrics] : [])));
  const tile = (label: string, value: number) => (
    <div className="tile"><dt className="stat-label">{label}</dt><dd className="stat-value">{n(value)}</dd></div>
  );
  return (
    <section aria-labelledby="story-summary" className="card space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="story-summary" className="text-lg font-semibold tracking-tight">Daily quiz stories</h2>
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
      <ul className="divide-y divide-line rounded-xl border border-line" aria-label={`Last ${rows.length} quiz stories`}>
        {rows.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">{IST.format(new Date(r.publishedAt))}</p>
              <p className="break-words text-sm">{r.title.replace(/^Daily quiz · [^·]+· /, "")}</p>
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
      <p className="text-xs text-muted">
        Profile visits are people who went on to the profile, where the bio link opens the quiz. Instagram doesn&apos;t count link taps
        for stories posted by the app.
      </p>
    </section>
  );
}
