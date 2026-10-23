import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Nav, PageHeader } from "@/components/Nav";
import { RefreshInsights } from "@/components/RefreshInsights";
import { compareToBaseline, median, typicalReel, type PostMetrics, type Verdict } from "@/lib/domain/metrics";
import { AdsSummary, type AdsSummaryProps } from "@/components/AdsSummary";
import { summariseCampaigns, weekStartIst, type DailyRow, type EntityRow, type OutcomeRow } from "@/lib/domain/ads";
import { pickInstagramAccount, type InstagramAccount } from "@/lib/domain/accounts";
import { memberAccess } from "@/lib/supabase/access";
import { InboxSummary } from "@/components/InboxSummary";
import { summariseInbox, type InboxWeek } from "@/lib/domain/inbox";
import { StorySummary, type StoryRow } from "@/components/StorySummary";

export const dynamic = "force-dynamic";

const SORTS = [
  { id: "new", label: "Newest" },
  { id: "views", label: "Most views" },
  { id: "saves", label: "Most saves" },
  { id: "watch", label: "Longest watch" },
] as const;
type SortId = (typeof SORTS)[number]["id"];

interface Row {
  external_id: string; permalink: string; caption: string; posted_at: string; likes: number | null; comments: number | null;
  views: number | null; reach: number | null; saves: number | null; shares: number | null; avg_watch_ms: number | null;
  insights_error: string | null; refreshed_at: string;
}

const IST = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });
const n = (x: number | null) => (x === null ? "–" : Number(x).toLocaleString("en-IN"));
const sec = (ms: number | null) => (ms === null ? "–" : `${(ms / 1000).toFixed(1)} s`);
const metricsOf = (r: Row): PostMetrics => ({
  views: r.views, reach: r.reach, saves: r.saves, shares: r.shares, likes: r.likes, comments: r.comments, avgWatchMs: r.avg_watch_ms,
});
const MARK: Record<Verdict, { m: string; cls: string; text: string }> = {
  above: { m: "▲", cls: "text-accent", text: "above your typical reel" },
  even: { m: "=", cls: "text-muted", text: "same as your typical reel" },
  below: { m: "▼", cls: "text-danger", text: "below your typical reel" },
  "n/a": { m: "", cls: "", text: "" },
};
function Mark({ v }: { v: Verdict }) {
  if (v === "n/a") return null;
  return <span className={`ml-0.5 ${MARK[v].cls}`} title={MARK[v].text} aria-label={MARK[v].text}>{MARK[v].m}</span>;
}

type Db = ReturnType<typeof createSupabaseServerClient>;

/** Ad results for the Ads section (RLS: only the member's own org). */
async function loadAds(supabase: Db, now: Date): Promise<AdsSummaryProps> {
  const weekStart = weekStartIst(now);
  const { data: acct } = await supabase.from("connected_accounts").select("id").eq("platform", "meta_ads").limit(1).maybeSingle();
  if (!acct) return { accountId: null, campaigns: [], weekStart, thisWeek: {}, lastSync: null };
  const since = new Date(now.getTime() - 31 * 86_400_000).toISOString().slice(0, 10);
  const [{ data: daily }, { data: entities }, { data: outcomes }] = await Promise.all([
    supabase.from("ad_daily").select("ad_id, day, adset_id, adset_name, campaign_id, campaign_name, spend, conversations, impressions, refreshed_at")
      .eq("account_id", acct.id).gte("day", since).limit(5000),
    supabase.from("ad_entities").select("level, external_id, name, parent_id, effective_status, daily_budget_minor, refreshed_at")
      .eq("account_id", acct.id).limit(2000),
    supabase.from("ad_outcomes").select("campaign_id, week_start, tests_booked, nda_leads").eq("account_id", acct.id).limit(2000),
  ]);
  const outs = (outcomes ?? []) as OutcomeRow[];
  const thisWeek = Object.fromEntries(outs.filter((o) => o.week_start === weekStart).map((o) => [o.campaign_id, { booked: o.tests_booked, leads: o.nda_leads }]));
  const stamps = [...(entities ?? []), ...(daily ?? [])].map((r) => r.refreshed_at as string);
  return {
    accountId: acct.id,
    campaigns: summariseCampaigns((daily ?? []) as DailyRow[], (entities ?? []) as EntityRow[], outs),
    weekStart, thisWeek,
    lastSync: stamps.length ? stamps.reduce((m, t) => (t > m ? t : m)) : null,
  };
}

/** This week's chats per Instagram account and WhatsApp number (owners only; RLS returns nothing to anyone else). */
async function loadInbox(supabase: Db, now: Date) {
  const weekStart = weekStartIst(now);
  // A week starts Monday 00:00 IST = Sunday 18:30 UTC.
  const from = new Date(new Date(`${weekStart}T00:00:00Z`).getTime() - 5.5 * 3_600_000).toISOString();
  const [{ data }, { data: rows }] = await Promise.all([
    supabase.from("conversations").select("account_id, first_message_at, status, source").gte("first_message_at", from).limit(5000),
    supabase.from("connected_accounts").select("id, platform, display_name, created_at").in("platform", ["instagram", "whatsapp"]),
  ]);
  const byAccount = summariseInbox(data ?? [], weekStart);
  const accounts: InstagramAccount[] = (rows ?? []).map((a) => ({
    id: a.id, displayName: a.platform === "whatsapp" ? `WhatsApp ${a.display_name}` : a.display_name, createdAt: a.created_at,
  }));
  const empty: InboxWeek = { newChats: 0, fromAds: 0, leads: 0, booked: 0 };
  return {
    weekStart,
    accounts: [...accounts].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((a) => ({ id: a.id, name: a.displayName, week: byAccount[a.id] ?? empty })),
  };
}

interface StoryDbRow {
  id: string; title: string;
  publications: {
    published_at: string | null;
    publication_metrics: { snapshot: string; views: number | null; reach: number | null; shares: number | null; replies: number | null;
      follows: number | null; profile_visits: number | null; exits: number | null; error: string | null }[];
  }[];
}

/**
 * The last 14 published stories of one kind with their 23h numbers (RLS: the member's own projects):
 * `quiz` = @lws.pune's daily quiz links (until 2026-10-23), `question` = the daily maths questions, which
 * both @pyqvault_ and @lws.pune post, so they're read one project at a time. Kept apart so two audiences
 * never blend into one typical story.
 */
async function loadStories(supabase: Db, shows: "quiz" | "question", projectId?: string): Promise<StoryRow[]> {
  let query = supabase.from("posts")
    .select("id, title, publications(published_at, publication_metrics(snapshot, views, reach, shares, replies, follows, profile_visits, exits, error))")
    .eq("kind", "story").eq("status", "published").not(shows, "is", null);
  if (projectId) query = query.eq("project_id", projectId);
  const { data } = await query.order("planned_for", { ascending: false }).limit(14);
  return ((data ?? []) as StoryDbRow[]).flatMap((p) => p.publications.filter((pb) => pb.published_at).map((pb) => {
    const m = pb.publication_metrics.find((x) => x.snapshot === "23h");
    return {
      id: p.id, title: p.title, publishedAt: pb.published_at as string,
      metrics: m ? { views: m.views, reach: m.reach, shares: m.shares, replies: m.replies, follows: m.follows, profileVisits: m.profile_visits, exits: m.exits, error: m.error } : null,
    };
  })).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export default async function InsightsPage({ searchParams }: { searchParams: { sort?: string; account?: string } }) {
  const supabase = createSupabaseServerClient();
  const access = await memberAccess(supabase);
  const showAds = access.ads;
  const sort: SortId = (SORTS.find((s) => s.id === searchParams.sort)?.id ?? "new") as SortId;
  // One Instagram account at a time (RLS: only the member's own org), so two audiences never blend.
  const loadReels = async () => {
    const { data: igRows } = await supabase.from("connected_accounts").select("id, display_name, created_at").eq("platform", "instagram");
    const accounts: InstagramAccount[] = (igRows ?? []).map((a) => ({ id: a.id, displayName: a.display_name, createdAt: a.created_at }));
    const account = pickInstagramAccount(accounts, searchParams.account);
    const { data } = account
      ? await supabase
        .from("account_media")
        .select("external_id, permalink, caption, posted_at, likes, comments, views, reach, saves, shares, avg_watch_ms, insights_error, refreshed_at")
        .eq("account_id", account.id)
        .order("posted_at", { ascending: false })
        .limit(2000)
      : { data: [] };
    return { accounts, account, rows: (data ?? []) as Row[] };
  };
  // Daily maths questions, one box per account (project) that posts them.
  const loadQuestionStories = async () => {
    const { data: projects } = await supabase.from("projects").select("id, name").order("name");
    const groups = await Promise.all((projects ?? []).map(async (p) => ({ account: { id: p.id as string, name: p.name as string }, rows: await loadStories(supabase, "question", p.id) })));
    return groups.filter((g) => g.rows.length > 0);
  };
  // The sections don't depend on each other: load them together.
  const [ads, { accounts, account, rows }, inbox, stories, questionStories] = await Promise.all([
    showAds ? loadAds(supabase, new Date()) : null,
    loadReels(),
    access.inbox ? loadInbox(supabase, new Date()) : null,
    loadStories(supabase, "quiz"),
    loadQuestionStories(),
  ]);
  const qs = (next: { sort?: SortId; account?: string }) => {
    const p = new URLSearchParams();
    const s = next.sort ?? sort, a = next.account ?? account?.id;
    if (s !== "new") p.set("sort", s);
    if (a && accounts.length > 1) p.set("account", a);
    const str = p.toString();
    return str ? `/insights?${str}` : "/insights";
  };

  const now = new Date();
  const typical = typicalReel(rows.filter((r) => r.views !== null).map(metricsOf), now);
  const recent = rows.filter((r) => now.getTime() - new Date(r.posted_at).getTime() < 30 * 86_400_000);
  const recentM: PostMetrics = {
    views: median(recent.map((r) => r.views)), saves: median(recent.map((r) => r.saves)), avgWatchMs: median(recent.map((r) => r.avg_watch_ms)),
    reach: null, shares: null, likes: null, comments: null,
  };
  const recentV = compareToBaseline(recentM, typical);
  const lastSync = rows.reduce<string | null>((m, r) => (!m || r.refreshed_at > m ? r.refreshed_at : m), null);

  const key: Record<SortId, (r: Row) => number> = {
    new: (r) => new Date(r.posted_at).getTime(), views: (r) => r.views ?? -1, saves: (r) => r.saves ?? -1, watch: (r) => r.avg_watch_ms ?? -1,
  };
  const sorted = [...rows].sort((a, b) => key[sort](b) - key[sort](a));

  const typicalTile = (label: string, value: string, recentValue: string, verdict: Verdict) => (
    <div className="tile">
      <dt className="stat-label">{label}</dt>
      <dd className="stat-value">{value}</dd>
      <dd className="mt-1 text-xs text-muted">Last 30 days: <span className="tabular-nums text-fg">{recentValue}</span><Mark v={verdict} /></dd>
    </div>
  );

  return (
    <>
      <Nav current="insights" ads={showAds} inbox={access.inbox} />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8">
        <PageHeader title="Insights">How your {ads ? "ads and reels are" : "reels are"} doing, against your own typical numbers.</PageHeader>
        {ads && <div className="mb-6"><AdsSummary {...ads} /></div>}
        {inbox && inbox.accounts.length > 0 && <div className="mb-6"><InboxSummary {...inbox} /></div>}
        {stories.length > 0 && <div className="mb-6"><StorySummary rows={stories} kind="quiz" /></div>}
        {questionStories.map((g) => <div key={g.account.id} className="mb-6"><StorySummary rows={g.rows} kind="question" account={g.account} /></div>)}

        {accounts.length > 1 && (
          <nav aria-label="Instagram account" className="mb-4 flex flex-wrap gap-2">
            {[...accounts].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((a) => (
              <Link key={a.id} href={qs({ account: a.id })} aria-current={account?.id === a.id ? "page" : undefined}
                className={`chip py-1 ${account?.id === a.id ? "chip-accent" : "chip-muted hover:text-fg"}`}>{a.displayName}</Link>
            ))}
          </nav>
        )}

        {rows.length === 0 ? (
          <section className="card space-y-3 p-4 sm:p-6">
            <p className="text-sm text-muted">No reels read yet. They refresh every night at 3 am; you can read them now.</p>
            <RefreshInsights label="Read my reels now" />
          </section>
        ) : (
          <>
            <section aria-labelledby="summary" className="card space-y-4 p-4 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="summary" className="text-lg font-semibold tracking-tight">Your typical reel{accounts.length > 1 && account ? ` on ${account.displayName}` : ""}</h2>
                <span className="text-xs text-muted">{typical.note}</span>
              </div>
              <dl className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
                {typicalTile("Views", n(typical.views), n(recentM.views), recentV.views)}
                {typicalTile("Saves", n(typical.saves), n(recentM.saves), recentV.saves)}
                {typicalTile("Watched", sec(typical.avgWatchMs), sec(recentM.avgWatchMs), recentV.avgWatchMs)}
              </dl>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <p className="text-xs text-muted">
                  Last 30 days = {recent.length} reels · ▲ above / ▼ below your typical reel · updated {lastSync ? IST.format(new Date(lastSync)) : "never"} (refreshes nightly)
                </p>
                <RefreshInsights />
              </div>
            </section>

            <div className="mb-3 mt-8 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Reels <span className="text-sm font-normal text-muted">({rows.length})</span></h2>
              <nav aria-label="Sort reels" className="seg">
                {SORTS.map((s) => (
                  <Link key={s.id} href={qs({ sort: s.id })} aria-current={sort === s.id ? "page" : undefined} className="seg-item">{s.label}</Link>
                ))}
              </nav>
            </div>

            <ul className="card divide-y divide-line overflow-hidden" aria-label={`${rows.length} reels`}>
              {sorted.map((r) => {
                const v = compareToBaseline(metricsOf(r), typical);
                return (
                  <li key={r.external_id} className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-6">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted">{IST.format(new Date(r.posted_at))} · {n(r.likes)} likes · {n(r.comments)} comments</p>
                      <p className="break-words text-sm">{r.caption.split("\n")[0].slice(0, 110) || "(no caption)"}</p>
                    </div>
                    {r.insights_error ? (
                      <p className="text-xs text-muted sm:max-w-xs">Numbers unavailable: {r.insights_error}</p>
                    ) : (
                      <dl className="grid shrink-0 grid-cols-4 gap-3 text-sm tabular-nums sm:w-[22rem]">
                        <div><dt className="stat-label">Views</dt><dd>{n(r.views)}<Mark v={v.views} /></dd></div>
                        <div><dt className="stat-label">Saves</dt><dd>{n(r.saves)}<Mark v={v.saves} /></dd></div>
                        <div><dt className="stat-label">Shares</dt><dd>{n(r.shares)}</dd></div>
                        <div><dt className="stat-label">Watched</dt><dd>{sec(r.avg_watch_ms)}<Mark v={v.avgWatchMs} /></dd></div>
                      </dl>
                    )}
                    <a href={r.permalink} target="_blank" rel="noopener noreferrer" className="link shrink-0 self-start text-sm sm:self-auto"
                      aria-label={`Open this reel on Instagram (posted ${IST.format(new Date(r.posted_at))})`}>Open</a>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </>
  );
}
