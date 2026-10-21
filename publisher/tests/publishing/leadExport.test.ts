import { describe, expect, it, vi } from "vitest";
import { handleLeadExport, type ExportDeps } from "@/lib/leads/export";
import type { LeadRow } from "@/lib/domain/leads";

// "Download for Excel" asks: all leads, or only the ones added since your last download (founder, 2026-10-21;
// migration 0020). Either download moves your download point, but only once the file has been built.

const NOW = new Date("2026-10-21T10:35:00Z");
const LAST = "2026-10-20T12:00:00Z";
const lead: LeadRow = { name: "Priya", contact: "+919876543210", course: "NDA", lead_at: "2026-10-19T08:00:00Z", source: "Website lwspune.com/" };

const post = (kind: string | null, origin: string | null = "https://gopostapp.vercel.app") => {
  const body = new FormData();
  if (kind !== null) body.set("kind", kind);
  return new Request("https://gopostapp.vercel.app/leads/export", { method: "POST", body, headers: origin ? { origin } : {} });
};

function deps(over: Partial<ExportDeps> = {}): ExportDeps {
  return {
    isOwner: vi.fn(async () => true),
    lastDownload: vi.fn(async () => LAST),
    load: vi.fn(async () => [lead]),
    record: vi.fn(async () => {}),
    now: () => NOW,
    logger: { error: vi.fn() },
    ...over,
  };
}

describe("handleLeadExport", () => {
  it("all: every lead up to now, then moves the download point", async () => {
    const d = deps();
    const res = await handleLeadExport(post("all"), d);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-disposition")).toBe('attachment; filename="leads-all-2026-10-21.csv"');
    expect(await res.text()).toContain("Priya");
    expect(d.load).toHaveBeenCalledWith({ since: null, until: NOW.toISOString() });
    expect(d.record).toHaveBeenCalledWith({ kind: "all", count: 1, since: null, at: NOW.toISOString() });
  });

  it("new: only leads added after your last download, up to now", async () => {
    const d = deps();
    const res = await handleLeadExport(post("new"), d);
    expect(res.headers.get("content-disposition")).toBe('attachment; filename="leads-new-2026-10-21.csv"');
    expect(d.load).toHaveBeenCalledWith({ since: LAST, until: NOW.toISOString() });
    expect(d.record).toHaveBeenCalledWith({ kind: "new", count: 1, since: LAST, at: NOW.toISOString() });
  });

  it("new before any download is everything", async () => {
    const d = deps({ lastDownload: vi.fn(async () => null) });
    await handleLeadExport(post("new"), d);
    expect(d.load).toHaveBeenCalledWith({ since: null, until: NOW.toISOString() });
  });

  it("doesn't move the point when the leads can't be read", async () => {
    const d = deps({ load: vi.fn(async () => { throw new Error("db down"); }) });
    const res = await handleLeadExport(post("all"), d);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: { code: "unexpected", message: "Couldn't read the leads. Try again." } });
    expect(d.record).not.toHaveBeenCalled();
  });

  it("still gives you the file if saving the point fails (the next 'new' just repeats these)", async () => {
    const d = deps({ record: vi.fn(async () => { throw new Error("db down"); }) });
    const res = await handleLeadExport(post("all"), d);
    expect(res.status).toBe(200);
    expect(d.logger?.error).toHaveBeenCalled();
  });

  it("refuses non-owners, another site's form, and an unknown choice, before reading anything", async () => {
    for (const [req, over, status] of [
      [post("all"), { isOwner: vi.fn(async () => false) }, 403],
      [post("all", "https://evil.example"), {}, 403],
      [post("everything"), {}, 400],
      [post(null), {}, 400],
    ] as const) {
      const d = deps(over);
      expect((await handleLeadExport(req, d)).status).toBe(status);
      expect(d.load).not.toHaveBeenCalled();
      expect(d.record).not.toHaveBeenCalled();
    }
  });
});
