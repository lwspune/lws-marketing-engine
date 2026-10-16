import { afterEach, describe, expect, it } from "vitest";
import { startFakeMeta } from "../helpers/fakeMeta";
import { syncAdAccount } from "@/lib/insights/adsSync";
import type { EntityRow } from "@/lib/domain/ads";
import type { AdDailyRow } from "@/lib/platforms/metaAds";

let fake: Awaited<ReturnType<typeof startFakeMeta>> | undefined;
afterEach(async () => { await fake?.close(); fake = undefined; });

const row = (day: string, chats: string) => ({
  ad_id: "a1", ad_name: "Poster", adset_id: "as1", adset_name: "Parents", campaign_id: "c1", campaign_name: "SPI",
  spend: "150.00", impressions: "5000", reach: "4000", clicks: "50", date_start: day, date_stop: day,
  actions: [{ action_type: "onsite_conversion.messaging_conversation_started_7d", value: chats }],
});

describe("syncAdAccount", () => {
  it("reads the last 30 days up to TODAY IN THE AD ACCOUNT'S time zone, and stores entities + daily rows", async () => {
    fake = await startFakeMeta({
      adLists: { campaigns: [{ id: "c1", name: "SPI", effective_status: "ACTIVE" }] },
      adInsights: [row("2026-10-17", "3"), row("2026-10-18", "2")],
    });
    let stored: { entities: EntityRow[]; daily: AdDailyRow[] } | undefined;
    // 03:00 UTC on 19 Oct is still 18 Oct in Los Angeles (the account's time zone)
    const s = await syncAdAccount({
      config: fake.config, actId: "act_1", token: "T", now: new Date("2026-10-19T03:00:00Z"),
      store: async (entities, daily) => { stored = { entities, daily }; },
    });
    expect(s).toEqual({ campaigns: 1, days: 2, spend: 300, chats: 5 });
    const ins = fake.calls.find((c) => c.path.endsWith("/insights"))!;
    expect(JSON.parse(ins.params.time_range)).toEqual({ since: "2026-09-19", until: "2026-10-18" });
    expect(stored?.entities).toHaveLength(1);
    expect(stored?.daily.map((d) => d.conversations)).toEqual([3, 2]);
  });

  it("stores nothing when Meta refuses", async () => {
    fake = await startFakeMeta({ failOn: { path: /\/insights$/, status: 400, message: "(#100) bad" } });
    let stored = false;
    await expect(syncAdAccount({ config: fake.config, actId: "act_1", token: "T", now: new Date(), store: async () => { stored = true; } }))
      .rejects.toThrow(/bad/);
    expect(stored).toBe(false);
  });
});
