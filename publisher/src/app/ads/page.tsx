import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canSeeAds } from "@/lib/supabase/access";
import { Nav, PageHeader } from "@/components/Nav";
import { AdDraftCard, type AdDraftView } from "@/components/AdDraftCard";
import { adsManagerUrl, type AdSpec, type DraftStatus } from "@/lib/domain/ads";

export const dynamic = "force-dynamic";
// Approve uploads the poster and creates four objects on Meta inside the server action.
export const maxDuration = 60;

export default async function AdsPage() {
  const supabase = createSupabaseServerClient();
  if (!(await canSeeAds(supabase))) redirect("/");
  const [{ data: drafts }, { data: projects }, { data: accounts }] = await Promise.all([
    supabase.from("ad_drafts")
      .select("id, project_id, account_id, title, status, spec, image_path, error, reject_reason, meta_campaign_id, launched_at, created_at")
      .order("created_at", { ascending: false }).limit(50),
    supabase.from("projects").select("id, name"),
    supabase.from("connected_accounts").select("id, external_id").eq("platform", "meta_ads"),
  ]);

  const paths = (drafts ?? []).map((d) => d.image_path as string);
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabase.storage.from("media").createSignedUrls(paths, 3600);
    for (const s of data ?? []) if (s.path && s.signedUrl) signed.set(s.path, s.signedUrl);
  }

  const views: AdDraftView[] = (drafts ?? []).map((d) => ({
    id: d.id, title: d.title, status: d.status as DraftStatus, spec: d.spec as AdSpec,
    imageUrl: signed.get(d.image_path) ?? null, projectName: projects?.find((p) => p.id === d.project_id)?.name ?? "",
    error: d.error, rejectReason: d.reject_reason, launchedAt: d.launched_at,
    adsManagerUrl: adsManagerUrl(accounts?.find((a) => a.id === d.account_id)?.external_id ?? "", d.meta_campaign_id),
  }));

  return (
    <>
      <Nav current="ads" />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8">
        <PageHeader title="Ads">
          Approve creates the ad on Meta <strong className="font-medium text-fg">paused</strong>. Check the preview in Ads Manager, then Launch.
          Nothing spends until you press Launch. Results are on the Insights tab.
        </PageHeader>
        {views.length === 0 ? (
          <p className="card p-5 text-sm text-muted">
            No ads yet. Add one with <code className="font-mono">npm run ads:add</code> and an .ad.json file.
          </p>
        ) : (
          <div className="space-y-5">{views.map((v) => <AdDraftCard key={v.id} ad={v} />)}</div>
        )}
      </main>
    </>
  );
}
