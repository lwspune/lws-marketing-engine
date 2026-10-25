import type { SupabaseClient } from "@supabase/supabase-js";
import { FEEDS, type FeedSource } from "@/lib/domain/pyqvaultLeads";
import { fetchDefenceLeads, type PyqvaultConfig } from "@/lib/platforms/pyqvault";
import type { FeedSyncDeps, LeadFeed } from "./pyqvault";

// The PYQ Vault sync's database and PYQ Vault calls (0028's functions, service role). Shared by /api/cron/leads and
// `npm run leads:pyqvault`, so no `server-only` here: callers pass the admin client and the shared secret.

export function pyqvaultStore(db: SupabaseClient, vault: PyqvaultConfig, opts: { orgId?: string } = {}): FeedSyncDeps {
  return {
    feeds: async () => {
      let q = db.from("lead_feeds").select("id, source, page, cursor").order("created_at");
      if (opts.orgId) q = q.eq("org_id", opts.orgId);
      const { data, error } = await q;
      if (error) throw new Error(`reading lead_feeds: ${error.message}`);
      return (data ?? []).map((f): LeadFeed => ({ id: f.id, source: f.source as FeedSource, page: f.page, cursor: f.cursor }));
    },
    read: (f, after, limit) => fetchDefenceLeads(vault, { source: FEEDS[f.source].path, after, limit }),
    importRows: async (feedId, from, next, leads) => {
      const { data, error } = await db.rpc("import_feed_rows", { p_feed: feedId, p_from: from, p_next: next, p_rows: leads });
      if (error) throw new Error(`import_feed_rows: ${error.message}`);
      return data as number;
    },
    recordError: async (feedId, message) => {
      const { error } = await db.rpc("record_feed_error", { p_feed: feedId, p_error: message });
      if (error) throw new Error(`record_feed_error: ${error.message}`);
    },
  };
}
