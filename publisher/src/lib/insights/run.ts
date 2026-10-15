import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MetaConfig } from "@/lib/platforms/meta";
import { syncInstagramAccount, toDbRow, type SyncSummary } from "./sync";

// Runs the account-wide insights sync against Supabase (service role): the nightly cron job syncs
// every Instagram account that's due; the Insights tab's Refresh button syncs one account now.

export async function syncAccount(db: SupabaseClient, cfg: MetaConfig, account: { id: string; externalId: string }): Promise<SyncSummary> {
  const { data: token, error } = await db.rpc("get_account_token", { p_account: account.id });
  if (error || !token) throw new Error(`no token for account ${account.id}`);
  return syncInstagramAccount({
    config: cfg, igUserId: account.externalId, token: token as string,
    store: async (rows) => {
      if (!rows.length) return;
      const { error: e } = await db.rpc("upsert_account_media", { p_account: account.id, p_rows: rows.map(toDbRow) });
      if (e) throw new Error(`upsert_account_media: ${e.message}`);
    },
  });
}

export async function syncDueAccounts(db: SupabaseClient, cfg: MetaConfig, logger: { error: (...a: unknown[]) => void } = console) {
  const { data, error } = await db.rpc("insights_sync_due", { p_hours: 20 });
  if (error) throw new Error(`insights_sync_due: ${error.message}`);
  const results: { accountId: string; ok: boolean; summary?: SyncSummary }[] = [];
  for (const a of (data ?? []) as { account_id: string; external_id: string }[]) {
    try {
      results.push({ accountId: a.account_id, ok: true, summary: await syncAccount(db, cfg, { id: a.account_id, externalId: a.external_id }) });
    } catch (e) {
      logger.error("insights: account sync failed", { accountId: a.account_id, error: (e as Error).message });
      results.push({ accountId: a.account_id, ok: false });
    }
  }
  return { accounts: results.length, results };
}
