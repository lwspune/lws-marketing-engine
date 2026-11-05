import { afterEach, describe, expect, it, vi } from "vitest";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Next 14 keeps every fetch a GET route makes in its Data Cache unless told not to, keyed by the request, POST bodies
// included. supabase-js sends a database function as a POST, so the admissions feed asked for the same cursor and size
// hour after hour and got the empty answer it was first given, while new leads waited (2026-10-26 to 10-31; Admissions
// AI read it as a feed broken at certain page sizes). A database read must always be read fresh.
describe("the service-role client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("never lets Next serve a database read from its cache", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key");
    const fetch = vi.fn(async () => new Response("[]", { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetch);

    await createSupabaseAdminClient().rpc("admissions_leads_after", { p_limit: 50 });
    await createSupabaseAdminClient().from("leads").select("id");

    expect(fetch).toHaveBeenCalledTimes(2);
    for (const [, init] of fetch.mock.calls as unknown as [unknown, RequestInit][]) expect(init.cache).toBe("no-store");
  });
});
