import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parseFeedRequest, secretMatches, toFeedLead, type FeedRow } from "@/lib/domain/admissionsFeed";

// GET /api/feeds/admissions?after=<cursor>&limit=<1..500>, Authorization: Bearer <ADMISSIONS_LEADS_SECRET>
// → 200 { leads: FeedLead[], next: string | null }
//
// LWS Pune's leads with an Indian mobile, for Admissions AI, which calls this every hour (migration 0029). Not behind
// sign-in (the middleware lets api/feeds/ through), so the secret is the only door: a wrong secret, none, and none set on
// this server all answer the same 401, closed, and a caller can't tell which. `next` is the last lead's cursor, or the
// `after` that was sent when nothing is new, so the caller can always store it.
export const dynamic = "force-dynamic";

const ORG = "lws-pune";

export async function GET(request: NextRequest) {
  if (!secretMatches(request.headers.get("authorization"), process.env.ADMISSIONS_LEADS_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const params = new URL(request.url).searchParams;
  const parsed = parseFeedRequest(params);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await createSupabaseAdminClient().rpc("admissions_leads_after", {
    p_org: ORG, p_after_at: parsed.after?.at ?? null, p_after_id: parsed.after?.id ?? null, p_limit: parsed.limit,
  });
  if (error) {
    console.error("admissions_leads_after failed", error);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }
  const leads = ((data ?? []) as FeedRow[]).map(toFeedLead);
  return NextResponse.json(
    { leads, next: leads.length ? leads[leads.length - 1].cursor : params.get("after") },
    { headers: { "Cache-Control": "no-store" } },
  );
}
