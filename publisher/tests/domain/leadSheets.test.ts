import { describe, expect, it } from "vitest";
import { SheetFormatError, sheetLeads, sheetWarning } from "@/lib/domain/leadSheets";

// Rows from the Google Sheets the website fills (founder, 2026-10-25) → leads. Headings as in the live sheet; every name
// and number here is made up. Sheet times are UTC: the sheet's quiet hours fall at night in India.

const CALC = ["Full Name", "Mobile Number", "Date of Birth", "Gender", "Class Level", "Marital Status", "Current Age", "Total Attempts", "Attempt Details", "Submission Date"];
const calcRow = (over: Partial<Record<(typeof CALC)[number], string>> = {}) => {
  const r: Record<string, string> = {
    "Full Name": "Test Student", "Mobile Number": "9800000001", "Date of Birth": "2008-05-06", Gender: "male", "Class Level": "12passed",
    "Marital Status": "unmarried", "Current Age": "17.9", "Total Attempts": "2", "Attempt Details": "NDA I 2026, NDA II 2026",
    "Submission Date": "2026-03-30 4:33:23", ...over,
  };
  return CALC.map((h) => r[h]);
};
const POPUP = ["Student's Full Name", "Mobile Number", "State", "Courses ", "Submission Date"];

describe("sheetLeads: NDA age calculator", () => {
  it("makes an NDA lead with what the calculator worked out, dated in UTC", () => {
    expect(sheetLeads("age_calculator", CALC, [calcRow()])).toEqual({
      leads: [{
        name: "Test Student", contact: "+919800000001", course: "NDA", class_level: "12 passed", lead_at: "2026-03-30T04:33:23.000Z", from_ad: false,
        reason: "NDA age calculator: age 17.9, class 12passed, 2 attempts (NDA I 2026, NDA II 2026)",
      }],
      skipped: { noNumber: 0, fake: 0, noDate: 0, repeats: 0 },
    });
  });

  it("keeps the class as the calculator gives it, spelling out 'passed', and leaves it blank when missing", () => {
    const out = sheetLeads("age_calculator", CALC, [
      calcRow({ "Class Level": "10" }), calcRow({ "Mobile Number": "9800000002", "Class Level": "12Passed" }), calcRow({ "Mobile Number": "9800000003", "Class Level": "" }),
    ]);
    expect(out.leads.map((l) => l.class_level)).toEqual(["10", "12 passed", null]);
  });

  it("skips rows with no usable mobile (blank, 9 or 11 digits) and made-up ones", () => {
    const out = sheetLeads("age_calculator", CALC, [
      calcRow({ "Mobile Number": "" }), calcRow({ "Mobile Number": "980000000" }), calcRow({ "Mobile Number": "98000000011" }),
      calcRow({ "Mobile Number": "9876543210" }), calcRow({ "Mobile Number": "7777777777" }), calcRow({ "Mobile Number": "+91 98000 00002" }),
    ]);
    expect(out.leads.map((l) => l.contact)).toEqual(["+919800000002"]);
    expect(out.skipped).toMatchObject({ noNumber: 3, fake: 2 });
  });

  it("keeps one lead per number: the first submission's date, the latest details", () => {
    const out = sheetLeads("age_calculator", CALC, [
      calcRow({ "Class Level": "11", "Submission Date": "2026-03-30 18:02:41" }),
      calcRow({ "Class Level": "10", "Submission Date": "2026-03-30 18:03:50" }),
    ]);
    expect(out.leads).toHaveLength(1);
    expect(out.leads[0]).toMatchObject({ lead_at: "2026-03-30T18:02:41.000Z", reason: expect.stringContaining("class 10") });
    expect(out.skipped.repeats).toBe(1);
  });

  it("skips a row whose date can't be read, and leaves out a blank name", () => {
    const out = sheetLeads("age_calculator", CALC, [calcRow({ "Submission Date": "soon" }), calcRow({ "Mobile Number": "9800000003", "Full Name": "  " })]);
    expect(out.skipped.noDate).toBe(1);
    expect(out.leads[0].name).toBeNull();
  });

  it("finds columns by their heading wherever they are, and refuses a sheet missing the number or date column", () => {
    const moved = ["Submission Date", "Mobile Number", "Full Name"];
    expect(sheetLeads("age_calculator", moved, [["2026-03-30 4:33:23", "9800000001", "A"]]).leads[0]).toMatchObject({ contact: "+919800000001", name: "A" });
    expect(() => sheetLeads("age_calculator", ["Full Name", "Phone", "Submission Date"], [])).toThrow(SheetFormatError);
    expect(() => sheetLeads("age_calculator", ["Full Name", "Phone", "Submission Date"], [])).toThrow(/Mobile Number/);
  });
});

describe("sheetLeads: popup form", () => {
  it("uses the course they chose and notes their state; the unchosen 'Courses' placeholder means no course", () => {
    const out = sheetLeads("popup_form", POPUP, [
      ["Test Parent", "9800000001", "Maharashtra", "NDA 2 year", "April 21, 2026 11:52 AM"],
      ["Second Parent", "9800000002", "Goa", "Courses", "May 8, 2026 1:56 PM"],
    ]);
    expect(out.leads).toEqual([
      { name: "Test Parent", contact: "+919800000001", course: "NDA 2 year", class_level: null, lead_at: "2026-04-21T11:52:00.000Z", from_ad: false, reason: "Popup form, Maharashtra" },
      { name: "Second Parent", contact: "+919800000002", course: null, class_level: null, lead_at: "2026-05-08T13:56:00.000Z", from_ad: false, reason: "Popup form, Goa" },
    ]);
  });

  it("ignores blank rows in the middle of the sheet", () => {
    expect(sheetLeads("popup_form", POPUP, [[], ["A", "9800000001", "", "", "April 21, 2026 11:52 AM"]]).leads).toHaveLength(1);
  });
});

// The Leads page warns only when the sync is broken, so it can't fail quietly.
describe("sheetWarning", () => {
  const now = new Date("2026-10-25T12:00:00Z");
  const ok = { tab: "Age Calculator", last_error: null, last_synced_at: "2026-10-25T11:15:00Z" };

  it("says nothing while every tab synced within the last 3 hours", () => {
    expect(sheetWarning([ok, { ...ok, tab: "Popup Form Data" }], now)).toBeNull();
    expect(sheetWarning([], now)).toBeNull();
  });

  it("names the tab and Google's reason when a read failed", () => {
    expect(sheetWarning([ok, { ...ok, tab: "Popup Form Data", last_error: "Google API 403 (reading the sheet): The caller does not have permission" }], now))
      .toBe("Popup Form Data isn't syncing: Google API 403 (reading the sheet): The caller does not have permission");
  });

  it("warns when a tab hasn't synced for over 3 hours, or never has", () => {
    expect(sheetWarning([{ ...ok, last_synced_at: "2026-10-25T08:30:00Z" }], now)).toMatch(/Age Calculator hasn't synced since/);
    expect(sheetWarning([{ ...ok, last_synced_at: null }], now)).toBe("Age Calculator hasn't synced yet.");
  });
});
