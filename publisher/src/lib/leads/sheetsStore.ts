import type { SupabaseClient } from "@supabase/supabase-js";
import type { SheetKind } from "@/lib/domain/leadSheets";
import { GOOGLE, parseServiceAccount, readSheetRows, serviceAccountToken, type GoogleConfig } from "@/lib/platforms/googleSheets";
import type { LeadSheet, SheetSyncDeps } from "./sheets";

// The sheet sync's database and Google calls (0026's functions, service role). Shared by /api/cron/leads and
// `npm run leads:sheets`, so no `server-only` here: callers pass the admin client and the key file's JSON.

export function sheetsStore(db: SupabaseClient, keyJson: string, opts: { orgId?: string; google?: GoogleConfig } = {}): SheetSyncDeps {
  const sa = parseServiceAccount(keyJson), google = opts.google ?? GOOGLE;
  let token: Promise<string> | undefined;
  return {
    sheets: async () => {
      let q = db.from("lead_sheets").select("id, spreadsheet_id, tab, kind, next_row").order("created_at");
      if (opts.orgId) q = q.eq("org_id", opts.orgId);
      const { data, error } = await q;
      if (error) throw new Error(`reading lead_sheets: ${error.message}`);
      return (data ?? []).map((s): LeadSheet => ({ id: s.id, spreadsheetId: s.spreadsheet_id, tab: s.tab, kind: s.kind as SheetKind, nextRow: s.next_row }));
    },
    read: async (s, fromRow, maxRows) => {
      token ??= serviceAccountToken(google, sa);
      return readSheetRows(google, await token, { spreadsheetId: s.spreadsheetId, tab: s.tab, fromRow, maxRows });
    },
    importRows: async (sheetId, from, next, leads) => {
      const { data, error } = await db.rpc("import_sheet_rows", { p_sheet: sheetId, p_from: from, p_next: next, p_rows: leads });
      if (error) throw new Error(`import_sheet_rows: ${error.message}`);
      return data as number;
    },
    recordError: async (sheetId, message) => {
      const { error } = await db.rpc("record_sheet_error", { p_sheet: sheetId, p_error: message });
      if (error) throw new Error(`record_sheet_error: ${error.message}`);
    },
  };
}
