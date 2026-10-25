import { sheetLeads, type SheetKind, type SheetLead } from "@/lib/domain/leadSheets";

// The hourly sync of the website's lead sheets (migration 0026), kept free of Next, Supabase and Google so it can be
// tested directly (like screen.ts). Each tab: read the rows after its marker → leads → import_sheet_rows moves the leads
// and the marker together. A sheet that can't be read keeps its marker and records why; the others carry on.

export interface LeadSheet { id: string; spreadsheetId: string; tab: string; kind: SheetKind; nextRow: number }
export interface SheetSyncDeps {
  sheets: () => Promise<LeadSheet[]>;
  read: (sheet: LeadSheet, fromRow: number, maxRows: number) => Promise<{ header: string[]; rows: string[][] }>;
  /** Imports the leads from rows from..next-1 and moves the marker to next; returns how many leads were new. */
  importRows: (sheetId: string, from: number, next: number, leads: SheetLead[]) => Promise<number>;
  recordError: (sheetId: string, message: string) => Promise<void>;
  logger?: { error: (...args: unknown[]) => void };
}
export interface SheetSyncResult { tab: string; read: number; added: number; error?: string }

// Rows per tab per run: keeps the hourly job inside Vercel's 60 s; `npm run leads:sheets` loops for a backlog.
export const MAX_ROWS = 1000;

export async function syncLeadSheets(deps: SheetSyncDeps, maxRows = MAX_ROWS): Promise<SheetSyncResult[]> {
  const out: SheetSyncResult[] = [];
  for (const s of await deps.sheets()) {
    try {
      const { header, rows } = await deps.read(s, s.nextRow, maxRows);
      const { leads } = sheetLeads(s.kind, header, rows);
      out.push({ tab: s.tab, read: rows.length, added: await deps.importRows(s.id, s.nextRow, s.nextRow + rows.length, leads) });
    } catch (e) {
      const message = (e as Error).message;
      (deps.logger ?? console).error("leads: reading a lead sheet failed", { sheet: s.id, tab: s.tab, error: message });
      out.push({ tab: s.tab, read: 0, added: 0, error: message });
      await deps.recordError(s.id, message).catch(() => {});
    }
  }
  return out;
}
