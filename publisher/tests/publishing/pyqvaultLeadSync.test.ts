import { describe, expect, it, vi } from "vitest";
import { syncPyqvaultLeads, type LeadFeed, type FeedSyncDeps } from "@/lib/leads/pyqvault";
import type { PyqvaultLead } from "@/lib/domain/pyqvaultLeads";

// The hourly sync of PYQ Vault's defence students (founder, 2026-10-25): for each feed, read pages after its cursor, turn
// them into leads, and import each page with its new cursor in one database step. One broken feed never stops the other.

const lead = (n: number): PyqvaultLead => ({
  cursor: `c${n}`, leadAt: "2026-07-15T16:16:12+00:00", name: `Student ${n}`, mobile: `9198000000${String(n).padStart(2, "0")}`,
  exams: ["nda"], stage: null, city: null,
});
const feed = (over: Partial<LeadFeed> = {}): LeadFeed => ({ id: "f1", source: "pyqvault_account", page: "PYQ Vault · account", cursor: null, ...over });

function deps(pages: Record<string, PyqvaultLead[]>, feeds = [feed()]) {
  const d: FeedSyncDeps = {
    feeds: vi.fn(async () => feeds),
    read: vi.fn(async (_f: LeadFeed, after: string | null) => {
      const leads = pages[after ?? "start"] ?? [];
      return { leads, next: leads.length ? leads[leads.length - 1].cursor : after };
    }),
    importRows: vi.fn(async (_id: string, _from: string | null, _next: string | null, leads: unknown[]) => leads.length),
    recordError: vi.fn(async () => {}),
    logger: { error: vi.fn() },
  };
  return d;
}

describe("syncPyqvaultLeads", () => {
  it("reads page after page from the cursor until a short page, importing each with its new cursor", async () => {
    const d = deps({ start: [lead(1), lead(2)], c2: [lead(3)] });
    expect(await syncPyqvaultLeads(d, { pageSize: 2 })).toEqual([{ feed: "PYQ Vault · account", read: 3, added: 3 }]);
    expect(d.importRows).toHaveBeenNthCalledWith(1, "f1", null, "c2", [expect.objectContaining({ contact: "+919800000001" }), expect.anything()]);
    expect(d.importRows).toHaveBeenNthCalledWith(2, "f1", "c2", "c3", [expect.objectContaining({ contact: "+919800000003", course: "NDA" })]);
    expect(d.importRows).toHaveBeenCalledTimes(2);
  });

  it("with nothing new, still checks in (marks the feed synced, clears an old error) and keeps the cursor", async () => {
    const d = deps({}, [feed({ cursor: "c9" })]);
    expect(await syncPyqvaultLeads(d)).toEqual([{ feed: "PYQ Vault · account", read: 0, added: 0 }]);
    expect(d.importRows).toHaveBeenCalledWith("f1", "c9", "c9", []);
  });

  it("stops after the page limit so the hourly job stays short; the next run carries on from the cursor", async () => {
    const d = deps({ start: [lead(1)], c1: [lead(2)], c2: [lead(3)] });
    expect(await syncPyqvaultLeads(d, { pageSize: 1, maxPages: 2 })).toEqual([{ feed: "PYQ Vault · account", read: 2, added: 2 }]);
    expect(d.read).toHaveBeenCalledTimes(2);
  });

  it("records the error and moves on when a feed can't be read; its cursor stays put", async () => {
    const d = deps({ start: [lead(1)] }, [feed(), feed({ id: "f2", source: "pyqvault_quiz", page: "PYQ Vault · quiz" })]);
    vi.mocked(d.read).mockImplementationOnce(async () => { throw new Error("PYQ Vault answered 401: unauthorized"); });
    expect(await syncPyqvaultLeads(d)).toEqual([
      { feed: "PYQ Vault · account", read: 0, added: 0, error: "PYQ Vault answered 401: unauthorized" },
      { feed: "PYQ Vault · quiz", read: 1, added: 1 },
    ]);
    expect(d.recordError).toHaveBeenCalledWith("f1", "PYQ Vault answered 401: unauthorized");
    expect(d.importRows).toHaveBeenCalledTimes(1);
    expect(d.logger!.error).toHaveBeenCalled();
  });
});
