import { feedLeads, type FeedSource, type PyqvaultLead } from "@/lib/domain/pyqvaultLeads";
import type { SheetLead } from "@/lib/domain/leadSheets";

// The hourly sync of PYQ Vault's defence students (migration 0028), kept free of Next and Supabase so it can be tested
// directly (like sheets.ts). Each feed: read pages after its cursor → leads → import_feed_rows moves the leads and the
// cursor together. A feed that can't be read keeps its cursor and records why; the other carries on.

export interface LeadFeed { id: string; source: FeedSource; page: string; cursor: string | null }
export interface FeedSyncDeps {
  feeds: () => Promise<LeadFeed[]>;
  read: (feed: LeadFeed, after: string | null, limit: number) => Promise<{ leads: PyqvaultLead[]; next: string | null }>;
  /** Imports one page's leads and moves the cursor from `from` to `next`; returns how many leads were new. */
  importRows: (feedId: string, from: string | null, next: string | null, leads: SheetLead[]) => Promise<number>;
  recordError: (feedId: string, message: string) => Promise<void>;
  logger?: { error: (...args: unknown[]) => void };
}
export interface FeedSyncResult { feed: string; read: number; added: number; error?: string }

// A page per request and pages per feed per run: keeps the hourly job inside Vercel's 60 s (PYQ Vault allows up to 500).
export const PAGE_SIZE = 200;
export const MAX_PAGES = 5;

export async function syncPyqvaultLeads(
  deps: FeedSyncDeps, opts: { pageSize?: number; maxPages?: number } = {},
): Promise<FeedSyncResult[]> {
  const pageSize = opts.pageSize ?? PAGE_SIZE, maxPages = opts.maxPages ?? MAX_PAGES;
  const out: FeedSyncResult[] = [];
  for (const f of await deps.feeds()) {
    let cursor = f.cursor, read = 0, added = 0;
    try {
      for (let page = 0; page < maxPages; page++) {
        const { leads, next } = await deps.read(f, cursor, pageSize);
        added += await deps.importRows(f.id, cursor, next ?? cursor, feedLeads(f.source, leads).leads);
        read += leads.length;
        cursor = next ?? cursor;
        if (leads.length < pageSize) break;
      }
      out.push({ feed: f.page, read, added });
    } catch (e) {
      const message = (e as Error).message;
      (deps.logger ?? console).error("leads: reading a PYQ Vault feed failed", { feed: f.id, source: f.source, error: message });
      out.push({ feed: f.page, read, added, error: message });
      await deps.recordError(f.id, message).catch(() => {});
    }
  }
  return out;
}
