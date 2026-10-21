import { leadDate, leadsCsv, type LeadRow } from "@/lib/domain/leads";
import { fail } from "@/lib/publishing/result";

// The "Download for Excel" handler (POST /leads/export, migration 0020), kept free of Next and Supabase so it can be
// tested directly (like cron.ts). kind=all: every lead; kind=new: leads added since your last download. Either moves
// your download point, but only after the file is built; if saving the point fails you still get the file, and the
// next "new" download simply repeats these leads.

export type ExportKind = "all" | "new";

export interface ExportDeps {
  isOwner: () => Promise<boolean>;
  /** Your download point (ISO), or null before your first download. */
  lastDownload: () => Promise<string | null>;
  /** Leads added after `since` (null: from the start) and up to `until`. */
  load: (window: { since: string | null; until: string }) => Promise<LeadRow[]>;
  record: (d: { kind: ExportKind; count: number; since: string | null; at: string }) => Promise<void>;
  now: () => Date;
  logger?: { error: (...args: unknown[]) => void };
}

const sameSite = (req: Request) => {
  const origin = req.headers.get("origin");
  try {
    return !origin || new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
};

export async function handleLeadExport(req: Request, deps: ExportDeps): Promise<Response> {
  const log = deps.logger ?? console;
  if (!sameSite(req)) return Response.json(fail("forbidden", "Downloads start from the Leads page."), { status: 403 });
  let kind: unknown = null;
  try {
    kind = (await req.formData()).get("kind");
  } catch { /* not a form */ }
  if (kind !== "all" && kind !== "new") return Response.json(fail("invalid_input", "Choose all leads or new leads."), { status: 400 });
  if (!(await deps.isOwner())) return Response.json(fail("forbidden", "Only owners can download leads."), { status: 403 });

  const at = deps.now().toISOString();
  let rows: LeadRow[], since: string | null = null;
  try {
    since = kind === "new" ? await deps.lastDownload() : null;
    rows = await deps.load({ since, until: at });
  } catch (e) {
    log.error("leads: export failed", { error: (e as Error).message });
    return Response.json(fail("unexpected", "Couldn't read the leads. Try again."), { status: 500 });
  }
  const csv = leadsCsv(rows);
  try {
    await deps.record({ kind, count: rows.length, since, at });
  } catch (e) {
    log.error("leads: saving the download point failed", { error: (e as Error).message });
  }
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="leads-${kind}-${leadDate(at)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
