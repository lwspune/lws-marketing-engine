import { describe, expect, it } from "vitest";
import { MAX_LIMIT, parseFeedRequest, secretMatches, toFeedLead, type FeedRow } from "@/lib/domain/admissionsFeed";

// The admissions feed (GET /api/feeds/admissions, founder 2026-10-26): LWS Pune's leads with an Indian mobile, read every
// hour by Admissions AI, where counsellors and telecallers call them. Who counts is SQL's (admissions_leads_after, 0029).

const ID = "11111111-1111-4111-8111-111111111111";
const AT = "2026-10-26T06:30:00.123456+00:00";

describe("admissions feed: the request", () => {
  it("starts from the beginning with the default page size", () => {
    expect(parseFeedRequest(new URLSearchParams())).toEqual({ ok: true, after: null, limit: 100 });
  });

  it("reads a cursor as Postgres printed it, microseconds kept", () => {
    expect(parseFeedRequest(new URLSearchParams({ after: `${AT}~${ID}`, limit: "500" })))
      .toEqual({ ok: true, after: { at: AT, id: ID }, limit: 500 });
  });

  it("refuses a cursor it didn't hand out, and a page size outside 1 to the cap", () => {
    for (const after of ["2026-10-26", `not-a-date~${ID}`, `${AT}~not-a-uuid`, `~${ID}`]) {
      expect(parseFeedRequest(new URLSearchParams({ after })).ok).toBe(false);
    }
    for (const limit of ["0", String(MAX_LIMIT + 1), "2.5", "ten"]) {
      expect(parseFeedRequest(new URLSearchParams({ limit })).ok).toBe(false);
    }
  });
});

describe("admissions feed: the secret", () => {
  it("lets in the bearer of the configured secret only", () => {
    expect(secretMatches("Bearer s3cret-value", "s3cret-value")).toBe(true);
    expect(secretMatches("Bearer wrong", "s3cret-value")).toBe(false);
    expect(secretMatches("s3cret-value", "s3cret-value")).toBe(false);
    expect(secretMatches("Bearer ", "s3cret-value")).toBe(false);
    expect(secretMatches(null, "s3cret-value")).toBe(false);
  });

  it("stays closed when no secret is configured", () => {
    expect(secretMatches("Bearer anything", undefined)).toBe(false);
    expect(secretMatches("Bearer ", "")).toBe(false);
  });
});

describe("admissions feed: a lead", () => {
  const row: FeedRow = {
    id: ID, created_at: AT, lead_at: "2026-10-20T10:00:00+00:00", name: " Test Student ", contact: "+919800000001",
    course: "NDA", class_level: "12 passed", channel: "instagram", page: null, from_ad: true, reason: "Shared a phone number",
  };

  it("carries its cursor and what a caller needs, nothing else", () => {
    expect(toFeedLead(row)).toEqual({
      cursor: `${AT}~${ID}`, leadAt: "2026-10-20T10:00:00+00:00", name: "Test Student", mobile: "+919800000001",
      course: "NDA", classLevel: "12 passed", channel: "instagram", page: null, fromAd: true, reason: "Shared a phone number",
    });
  });

  it("sends blank text as null", () => {
    expect(toFeedLead({ ...row, name: "  ", reason: "" })).toMatchObject({ name: null, reason: null });
  });
});
