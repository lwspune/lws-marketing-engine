import { describe, expect, it } from "vitest";
import { seesAds, seesInbox } from "@/lib/domain/access";

// Staff (migration 0011) never see ads, so the app hides the Ads tab and the Insights ads box for them.
describe("seesAds", () => {
  it("is true for owners and editors", () => {
    expect(seesAds(["owner"])).toBe(true);
    expect(seesAds(["editor"])).toBe(true);
  });
  it("is false for a staff-only login", () => {
    expect(seesAds(["staff"])).toBe(false);
  });
  it("is true when any membership is a full one", () => {
    expect(seesAds(["staff", "owner"])).toBe(true);
  });
  it("is false with no membership at all", () => {
    expect(seesAds([])).toBe(false);
  });
});

// DMs (migration 0012) are owners only: the Inbox tab and the Insights messages box are hidden for everyone else.
describe("seesInbox", () => {
  it("is true only with an owner membership", () => {
    expect(seesInbox(["owner"])).toBe(true);
    expect(seesInbox(["staff", "owner"])).toBe(true);
    expect(seesInbox(["editor"])).toBe(false);
    expect(seesInbox(["staff"])).toBe(false);
    expect(seesInbox([])).toBe(false);
  });
});
