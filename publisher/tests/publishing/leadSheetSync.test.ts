import { describe, expect, it, vi } from "vitest";
import { syncLeadSheets, type LeadSheet, type SheetSyncDeps } from "@/lib/leads/sheets";

// The hourly sync of the website's lead sheets (founder, 2026-10-25): for each tab, read the rows after its marker, turn
// them into leads, and import them with the new marker in one database step. One broken sheet never stops the others.

const CALC = ["Full Name", "Mobile Number", "Submission Date"];
const sheet = (over: Partial<LeadSheet> = {}): LeadSheet => ({ id: "s1", spreadsheetId: "SHEET1", tab: "Age Calculator", kind: "age_calculator", nextRow: 10, ...over });

function deps(read: SheetSyncDeps["read"], sheets = [sheet()]) {
  const d: SheetSyncDeps = {
    sheets: vi.fn(async () => sheets),
    read: vi.fn(read),
    importRows: vi.fn(async (_id: string, _from: number, _next: number, leads: unknown[]) => leads.length),
    recordError: vi.fn(async () => {}),
    logger: { error: vi.fn() },
  };
  return d;
}

describe("syncLeadSheets", () => {
  it("imports the new rows from the marker on and moves the marker past every row read, blank or not", async () => {
    const d = deps(async () => ({ header: CALC, rows: [["A", "9800000001", "2026-10-25 4:00:00"], [], ["B", "", "2026-10-25 5:00:00"]] }));
    expect(await syncLeadSheets(d, 500)).toEqual([{ tab: "Age Calculator", read: 3, added: 1 }]);
    expect(d.read).toHaveBeenCalledWith(sheet(), 10, 500);
    expect(d.importRows).toHaveBeenCalledWith("s1", 10, 13, [expect.objectContaining({ contact: "+919800000001", course: "NDA" })]);
  });

  it("with nothing new, still checks in (marks the sheet synced, clears an old error)", async () => {
    const d = deps(async () => ({ header: CALC, rows: [] }));
    expect(await syncLeadSheets(d)).toEqual([{ tab: "Age Calculator", read: 0, added: 0 }]);
    expect(d.importRows).toHaveBeenCalledWith("s1", 10, 10, []);
  });

  it("records the error and moves on when a sheet can't be read or has lost a column; the marker stays put", async () => {
    const d = deps(async (s) => {
      if (s.id === "s1") throw new Error("Google API 403: The caller does not have permission");
      return { header: ["Full Name", "Phone", "Submission Date"], rows: [["A", "9800000001", "2026-10-25 4:00:00"]] };
    }, [sheet(), sheet({ id: "s2", tab: "Popup Form Data", kind: "popup_form" })]);
    expect(await syncLeadSheets(d)).toEqual([
      { tab: "Age Calculator", read: 0, added: 0, error: "Google API 403: The caller does not have permission" },
      { tab: "Popup Form Data", read: 0, added: 0, error: expect.stringMatching(/Mobile Number/) },
    ]);
    expect(d.recordError).toHaveBeenCalledTimes(2);
    expect(d.importRows).not.toHaveBeenCalled();
    expect(d.logger!.error).toHaveBeenCalled();
  });
});
