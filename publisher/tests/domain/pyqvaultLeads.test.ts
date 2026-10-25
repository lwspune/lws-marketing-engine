import { describe, expect, it } from "vitest";
import { feedLeads, type PyqvaultLead } from "@/lib/domain/pyqvaultLeads";

// PYQ Vault's defence students → leads (founder, 2026-10-25). PYQ Vault decides who counts (consent + NDA/CDS/AFCAT);
// this only shapes each one for the Leads list and drops what a phone call can't use.

const row = (over: Partial<PyqvaultLead> = {}): PyqvaultLead => ({
  cursor: "2026-07-15T16:16:12.104123+00:00~11111111-1111-4111-8111-111111111111",
  leadAt: "2026-07-15T16:16:12.104123+00:00", name: "Test Student", mobile: "919800000001",
  exams: ["nda"], stage: "class-12", city: "Pune", ...over,
});

describe("feedLeads", () => {
  it("makes an account lead: +91 number, course, class, and where they came from", () => {
    expect(feedLeads("pyqvault_account", [row({ exams: ["nda", "cds"] })])).toEqual({
      leads: [{
        name: "Test Student", contact: "+919800000001", course: "NDA, CDS", class_level: "12",
        lead_at: "2026-07-15T16:16:12.104123+00:00", from_ad: false,
        reason: "Agreed to be contacted on PYQ Vault (account), Pune",
      }],
      skipped: { noNumber: 0, fake: 0, repeats: 0 },
    });
  });

  it("names each stage the way the Leads page shows class", () => {
    const classOf = (stage: string | null) => feedLeads("pyqvault_account", [row({ stage })]).leads[0].class_level;
    expect([classOf("class-9-10"), classOf("class-11"), classOf("class-12"), classOf("dropper"), classOf("college"), classOf(null)])
      .toEqual(["9-10", "11", "12", "12 passed", "College", null]);
  });

  it("makes a quiz lead without class or city", () => {
    const [lead] = feedLeads("pyqvault_quiz", [row({ stage: null, city: null, exams: ["nda"], name: null })]).leads;
    expect(lead).toMatchObject({ name: null, course: "NDA", class_level: null, reason: "Agreed to be contacted on PYQ Vault (NDA quiz)" });
  });

  it("names AFCAT and keeps exams in a fixed order", () => {
    expect(feedLeads("pyqvault_account", [row({ exams: ["afcat", "nda"] })]).leads[0].course).toBe("NDA, AFCAT");
  });

  it("drops numbers that aren't Indian mobiles and the made-up ones people type", () => {
    const r = feedLeads("pyqvault_account", [
      row({ mobile: "91123" }), row({ mobile: "915800000001" }), row({ mobile: "919999999999" }), row({ mobile: "919876543210" }),
    ]);
    expect(r.leads).toEqual([]);
    expect(r.skipped).toEqual({ noNumber: 2, fake: 2, repeats: 0 });
  });

  it("keeps one lead per number, with the earliest date", () => {
    const r = feedLeads("pyqvault_quiz", [
      row({ leadAt: "2026-09-02T00:00:00+00:00", name: "Later" }), row({ leadAt: "2026-06-08T00:00:00+00:00", name: "Earlier" }),
    ]);
    expect(r.leads).toHaveLength(1);
    expect(r.leads[0].lead_at).toBe("2026-06-08T00:00:00+00:00");
    expect(r.skipped.repeats).toBe(1);
  });
});
