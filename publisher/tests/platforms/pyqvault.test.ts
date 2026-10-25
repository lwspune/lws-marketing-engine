import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { fetchDefenceLeads, PyqvaultApiError } from "@/lib/platforms/pyqvault";

// Reading PYQ Vault's defence-leads feed (GET /api/leads/defence, a shared secret as Bearer). A local stand-in for
// www.pyqvault.com.

let server: http.Server | undefined;
afterEach(async () => { await new Promise<void>((r) => (server ? server.close(() => r()) : r())); server = undefined; });

async function fakeVault(reply: { status: number; body: object }) {
  const calls: { path: string; query: URLSearchParams; auth?: string }[] = [];
  server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://fake");
    calls.push({ path: url.pathname, query: url.searchParams, auth: req.headers.authorization });
    res.writeHead(reply.status, { "content-type": "application/json" });
    res.end(JSON.stringify(reply.body));
  });
  await new Promise<void>((r) => server!.listen(0, "127.0.0.1", r));
  return { base: `http://127.0.0.1:${(server!.address() as AddressInfo).port}`, calls };
}

const LEAD = { cursor: "2026-07-15T16:16:12.104123+00:00~11111111-1111-4111-8111-111111111111", leadAt: "2026-07-15T16:16:12.104123+00:00", name: "Test Student", mobile: "919800000001", exams: ["nda"], stage: "class-12", city: null };

describe("fetchDefenceLeads", () => {
  it("asks for one page after the cursor with the secret, and returns the leads and the next cursor", async () => {
    const v = await fakeVault({ status: 200, body: { leads: [LEAD], next: LEAD.cursor } });
    const page = await fetchDefenceLeads({ base: v.base, secret: "s3cret" }, { source: "account", after: "2026-07-01T00:00:00+00:00~0", limit: 100 });
    expect(page).toEqual({ leads: [LEAD], next: LEAD.cursor });
    expect(v.calls).toEqual([{ path: "/api/leads/defence", query: expect.any(URLSearchParams), auth: "Bearer s3cret" }]);
    expect(Object.fromEntries(v.calls[0].query)).toEqual({ source: "account", after: "2026-07-01T00:00:00+00:00~0", limit: "100" });
  });

  it("starts from the beginning when there is no cursor", async () => {
    const v = await fakeVault({ status: 200, body: { leads: [], next: null } });
    expect(await fetchDefenceLeads({ base: v.base, secret: "s" }, { source: "quiz", after: null, limit: 5 })).toEqual({ leads: [], next: null });
    expect(v.calls[0].query.has("after")).toBe(false);
  });

  it("says what PYQ Vault answered when it refuses", async () => {
    const v = await fakeVault({ status: 401, body: { error: "unauthorized" } });
    const err = await fetchDefenceLeads({ base: v.base, secret: "wrong" }, { source: "account", after: null, limit: 5 }).catch((e) => e);
    expect(err).toBeInstanceOf(PyqvaultApiError);
    expect(err.message).toBe("PYQ Vault answered 401: unauthorized");
  });

  it("refuses a reply that isn't a page of leads", async () => {
    const v = await fakeVault({ status: 200, body: { questions: [] } });
    await expect(fetchDefenceLeads({ base: v.base, secret: "s" }, { source: "account", after: null, limit: 5 })).rejects.toThrow(/not a page of leads/);
  });
});
