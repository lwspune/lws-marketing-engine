import { describe, expect, it } from "vitest";
import { pickInstagramAccount } from "@/lib/domain/accounts";

// The org can have more than one Instagram account (@lws.pune and @pyqvault_, 2026-10-18). The Insights tab
// shows one account at a time, so one account's typical reel is never blended with another's.
const lws = { id: "a1", displayName: "@lws.pune", createdAt: "2026-10-12T10:00:00Z" };
const pv = { id: "a2", displayName: "@pyqvault_", createdAt: "2026-10-18T10:00:00Z" };

describe("pickInstagramAccount", () => {
  it("returns the requested account when it exists", () => {
    expect(pickInstagramAccount([lws, pv], "a2")).toEqual(pv);
  });

  it("defaults to the first connected account (the original one)", () => {
    expect(pickInstagramAccount([pv, lws], undefined)).toEqual(lws);
  });

  it("ignores an unknown or foreign id and falls back to the default", () => {
    expect(pickInstagramAccount([lws, pv], "not-ours")).toEqual(lws);
  });

  it("is null when no Instagram account is connected", () => {
    expect(pickInstagramAccount([], "a1")).toBeNull();
  });
});
