import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Nav } from "@/components/Nav";
import { RefreshInsights } from "@/components/RefreshInsights";
import { compareToBaseline, median, typicalReel, type PostMetrics, type Verdict } from "@/lib/domain/metrics";
import { AdsSummary, type AdsSummaryProps } from "@/components/AdsSummary";
import { summariseCampaigns, weekStartIst, type DailyRow, type EntityRow, type OutcomeRow } from "@/lib/domain/ads";
import { pickInstagramAccount, type InstagramAccount } from "@/lib/domain/accounts";

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

export default async function InsightsPage({ searchParams }: { searchParams: { sort?: string; account?: string } }) {
  const supabase = createSupabaseServerClient();
  const ads = await loadAds(supabase, new Date());
  const sort: SortId = (SORTS.find((s) => s.id === searchParams.sort)?.id ?? "new") as SortId;
  // One Instagram account at a time (RLS: only the member's own org), so two audiences never blend.
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
  const rows = (data ?? []) as Row[];
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

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <Nav current="insights" />
      <h1 className="sr-only">Insights</h1>
      <div className="mb-4"><AdsSummary {...ads} /></div>

      {accounts.length > 1 && (
        <nav aria-label="Instagram account" className="mb-4 flex flex-wrap gap-2">
          {[...accounts].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((a) => (
            <Link key={a.id} href={qs({ account: a.id })} aria-current={account?.id === a.id ? "page" : undefined}
              className={`chip ${account?.id === a.id ? "border-accent text-accent" : "border-line text-muted"}`}>{a.displayName}</Link>
          ))}
        </nav>
      )}

      {rows.length === 0 ? (
        <section className="space-y-3 rounded-lg border border-line bg-panel p-4">
          <p className="text-sm text-muted">No reels read yet. They refresh every night at 3 am; you can read them now.</p>
          <RefreshInsights label="Read my reels now" />
        </section>
      ) : (
        <>
          <section aria-labelledby="summary" className="space-y-3 rounded-lg border border-line bg-panel p-4">
            <h2 id="summary" className="font-medium">Your typical reel{accounts.length > 1 && account ? ` on ${account.displayName}` : ""}</h2>
            <p className="text-sm">
              <strong>{n(typical.views)}</strong> views · <strong>{n(typical.saves)}</strong> {typical.saves === 1 ? "save" : "saves"} ·{" "}
              <strong>{sec(typical.avgWatchMs)}</strong> watched <span className="text-muted">({typical.note})</span>
            </p>
            <p className="text-sm">
              <span className="text-muted">Last 30 days ({recent.length} reels):</span>{" "}
              {n(recentM.views)} views<Mark v={recentV.views} /> · {n(recentM.saves)} saves<Mark v={recentV.saves} /> · {sec(recentM.avgWatchMs)} watched<Mark v={recentV.avgWatchMs} />
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted">
                ▲ above / ▼ below your typical reel · updated {lastSync ? IST.format(new Date(lastSync)) : "never"} (refreshes nightly)
              </p>
              <RefreshInsights />
            </div>
          </section>

          <nav aria-label="Sort reels" className="my-4 flex flex-wrap gap-2">
            {SORTS.map((s) => (
              <Link key={s.id} href={qs({ sort: s.id })} aria-current={sort === s.id ? "page" : undefined}
                className={`chip ${sort === s.id ? "border-accent text-accent" : "border-line text-muted"}`}>{s.label}</Link>
            ))}
          </nav>

          <ul className="space-y-2" aria-label={`${rows.length} reels`}>
            {sorted.map((r) => {
              const v = compareToBaseline(metricsOf(r), typical);
              return (
                <li key={r.external_id} className="rounded-lg border border-line bg-panel p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 text-sm">
                      <span className="text-muted">{IST.format(new Date(r.posted_at))} · </span>
                      <span className="break-words">{r.caption.split("\n")[0].slice(0, 110) || "(no caption)"}</span>
                    </p>
                    <a href={r.permalink} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm text-accent underline"
                      aria-label={`Open this reel on Instagram (posted ${IST.format(new Date(r.posted_at))})`}>Open</a>
                  </div>
                  {r.insights_error ? (
                    <p className="mt-1 text-xs text-muted">Numbers unavailable: {r.insights_error}</p>
                  ) : (
                    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      <span>{n(r.views)} views<Mark v={v.views} /></span>
                      <span>{n(r.saves)} saves<Mark v={v.saves} /></span>
                      <span>{n(r.shares)} shares</span>
                      <span>{sec(r.avg_watch_ms)} watched<Mark v={v.avgWatchMs} /></span>
                      <span className="text-muted">{n(r.likes)} likes · {n(r.comments)} comments</span>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </main>
  );
}
