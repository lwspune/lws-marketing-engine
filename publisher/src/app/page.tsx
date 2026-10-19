import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { memberAccess } from "@/lib/supabase/access";
import { PostCard, type PostView } from "@/components/PostCard";
import { Nav, PageHeader } from "@/components/Nav";
import { ApproveStoriesButton } from "@/components/ApproveStoriesButton";
import type { StoryQuiz } from "@/lib/domain/story";
import { queueProjects } from "@/lib/domain/projects";
import { newestFirst } from "@/lib/domain/queue";
import type { Platform } from "@/lib/domain/types";
import { nextSlot, slotsFor } from "@/lib/domain/slots";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "ready", label: "Ready", statuses: ["ready"] },
  { id: "scheduled", label: "Scheduled", statuses: ["approved"] },
  { id: "done", label: "Done", statuses: ["published", "partially_published", "failed"] },
  { id: "rejected", label: "Rejected", statuses: ["rejected"] },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default async function Dashboard({ searchParams }: { searchParams: { tab?: string; project?: string } }) {
  const supabase = createSupabaseServerClient();
  const tab: TabId = (TABS.find((t) => t.id === searchParams.tab)?.id ?? "ready") as TabId;
  const statuses = TABS.find((t) => t.id === tab)!.statuses;

  // Independent reads go out together: each one is a round trip to the database.
  const now = new Date();
  const [access, { data: projects }, { data: allPosts }, { data: channels }, { data: booked }] = await Promise.all([
    memberAccess(supabase),
    supabase.from("projects").select("id, name, slug, organizations(name)").order("name"),
    // Every post's project and status: the tab counts, and which projects get a button.
    supabase.from("posts").select("project_id, status"),
    supabase.from("project_channels").select("project_id, platform, connected_accounts(display_name)"),
    // Booked slots, for each project's next free posting slot (domain/slots.ts).
    supabase.from("posts").select("project_id, scheduled_at")
      .not("scheduled_at", "is", null).gt("scheduled_at", now.toISOString()).neq("kind", "story"),
  ]);
  const projectId = projects?.find((p) => p.id === searchParams.project)?.id ?? null;

  let postsQuery = supabase
    .from("posts")
    .select("id, project_id, slug, kind, title, status, captions, video_path, cover_path, slide_paths, scheduled_at, planned_for, quiz, created_at, reject_reason, publications(id, platform, status, scheduled_at, attempts, permalink, error, published_at, publication_metrics(snapshot, views, reach, saves, shares, avg_watch_ms, error))")
    .in("status", statuses as unknown as string[])
    .order("created_at", { ascending: !newestFirst(tab) })
    .order("slug", { ascending: !newestFirst(tab) })
    .limit(50);
  if (projectId) postsQuery = postsQuery.eq("project_id", projectId);
  const { data: posts } = await postsQuery;

  const inView = (allPosts ?? []).filter((r) => !projectId || r.project_id === projectId);
  const counts = Object.fromEntries(TABS.map((t) => [t.id, inView.filter((r) => (t.statuses as readonly string[]).includes(r.status)).length]));
  const projectButtons = queueProjects(projects ?? [], (allPosts ?? []).map((r) => r.project_id as string), projectId);

  // The next free posting slot per project (approving a post puts it there).
  const slotOf = (projectId: string) => {
    const slug = projects?.find((p) => p.id === projectId)?.slug ?? "";
    const taken = (booked ?? []).filter((b) => b.project_id === projectId).map((b) => new Date(b.scheduled_at as string));
    return nextSlot(slotsFor(slug), taken, now)?.toISOString() ?? null;
  };

  // Preview links for the media of the posts on screen (members may read their org's files).
  const paths = (posts ?? []).flatMap((p) => [p.video_path, p.cover_path, ...(p.slide_paths ?? [])]).filter((x): x is string => !!x);
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabase.storage.from("media").createSignedUrls(paths, 3600);
    for (const d of data ?? []) if (d.path && d.signedUrl) signed.set(d.path, d.signedUrl);
  }

  const views: PostView[] = (posts ?? []).map((p) => ({
    id: p.id, title: p.title, slug: p.slug, kind: p.kind, status: p.status, captions: p.captions ?? {},
    scheduledAt: p.scheduled_at, rejectReason: p.reject_reason,
    plannedFor: p.planned_for, quiz: (p.quiz ?? null) as StoryQuiz | null,
    nextSlotAt: p.kind === "story" ? null : slotOf(p.project_id),
    projectName: projects?.find((x) => x.id === p.project_id)?.name ?? "",
    videoUrl: p.video_path ? signed.get(p.video_path) ?? null : null,
    coverUrl: p.cover_path ? signed.get(p.cover_path) ?? null : null,
    slideUrls: (p.slide_paths ?? []).map((s: string) => signed.get(s)).filter((x: string | undefined): x is string => !!x),
    channels: (channels ?? []).filter((c) => c.project_id === p.project_id).map((c) => ({
      platform: c.platform as Platform,
      name: (c.connected_accounts as unknown as { display_name: string } | null)?.display_name ?? c.platform,
    })),
    publications: (p.publications ?? []).map((x) => ({
      id: x.id, platform: x.platform as Platform, status: x.status, scheduledAt: x.scheduled_at, attempts: x.attempts,
      permalink: x.permalink, error: x.error, publishedAt: x.published_at,
      metrics: (x.publication_metrics ?? []).map((s) => ({
        snapshot: s.snapshot, views: s.views, reach: s.reach, saves: s.saves, shares: s.shares, avgWatchMs: s.avg_watch_ms, error: s.error,
      })),
    })),
  }));

  const readyStories = tab === "ready" ? views.filter((v) => v.kind === "story").length : 0;

  const href = (next: { tab?: string; project?: string | null }) => {
    const q = new URLSearchParams();
    const t = next.tab ?? tab;
    const pr = next.project === undefined ? projectId : next.project;
    if (t !== "ready") q.set("tab", t);
    if (pr) q.set("project", pr);
    const s = q.toString();
    return s ? `/?${s}` : "/";
  };

  return (
    <>
      <Nav current="queue" ads={access.ads} inbox={access.inbox} />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8">
        <PageHeader title="Queue">Approve what goes out. Nothing posts without you.</PageHeader>

        {!projects?.length ? (
          <p className="card p-5 text-sm text-muted">
            Your account isn&apos;t part of any organisation yet. Ask the owner to add you.
          </p>
        ) : (
          <>
            {projectButtons.length > 1 && (
              <nav aria-label="Projects" className="mb-4 flex flex-wrap gap-2">
                <Link href={href({ project: null })} aria-current={!projectId ? "page" : undefined}
                  className={`chip py-1 ${!projectId ? "chip-accent" : "chip-muted hover:text-fg"}`}>All projects</Link>
                {projectButtons.map((p) => (
                  <Link key={p.id} href={href({ project: p.id })} aria-current={projectId === p.id ? "page" : undefined}
                    className={`chip py-1 ${projectId === p.id ? "chip-accent" : "chip-muted hover:text-fg"}`}>{p.name}</Link>
                ))}
              </nav>
            )}

            <nav aria-label="Post status" className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
              {TABS.map((t) => (
                <Link key={t.id} href={href({ tab: t.id })} aria-current={tab === t.id ? "page" : undefined}
                  className={`-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-2 py-2.5 sm:gap-2 sm:px-3 text-sm font-medium transition-colors ${tab === t.id ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"}`}>
                  {t.label}
                  <span className={`rounded-full px-1.5 text-xs tabular-nums ${tab === t.id ? "bg-accent/15 text-accent" : "bg-white/[0.06] text-muted"}`}>{counts[t.id]}</span>
                </Link>
              ))}
            </nav>

            {readyStories > 0 && <ApproveStoriesButton count={readyStories} projectId={projectId} />}

            {views.length === 0 ? (
              <p className="card px-5 py-12 text-center text-sm text-muted">Nothing here.</p>
            ) : (
              <ul className="space-y-5">
                {views.map((v) => <li key={v.id}><PostCard post={v} /></li>)}
              </ul>
            )}
          </>
        )}
      </main>
    </>
  );
}
