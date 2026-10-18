import { describe, expect, it } from "vitest";
import { seesAds } from "@/lib/domain/access";

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
