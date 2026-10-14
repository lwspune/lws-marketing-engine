import { describe, expect, it, vi } from "vitest";
import { handleCron } from "@/lib/publishing/cron";
import { fromRpcError } from "@/lib/publishing/result";

const req = (auth?: string) => new Request("https://app.test/api/cron/publish", {
  method: "POST", headers: auth ? { authorization: auth } : {},
});

describe("handleCron", () => {
  const SECRET = "s3cret-value-that-is-long-enough-123";

  it("refuses a missing or wrong secret without running a tick", async () => {
    const tick = vi.fn();
    for (const auth of [undefined, "Bearer nope", `Basic ${SECRET}`, `Bearer ${SECRET}x`]) {
      const res = await handleCron(req(auth), { secret: SECRET, tick });
      expect(res.status, String(auth)).toBe(401);
      expect(await res.json()).toEqual({ ok: false, error: { code: "unauthorized", message: "Unauthorized" } });
    }
    expect(tick).not.toHaveBeenCalled();
  });

  it("refuses everything when the server has no secret configured", async () => {
    const tick = vi.fn();
    const res = await handleCron(req("Bearer "), { secret: "", tick });
    expect(res.status).toBe(401);
    expect(tick).not.toHaveBeenCalled();
  });

  it("runs one tick with the right secret and returns its summary", async () => {
    const tick = vi.fn().mockResolvedValue({ claimed: 2, recorded: 1, released: 1, errors: 0 });
    const res = await handleCron(req(`Bearer ${SECRET}`), { secret: SECRET, tick });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { claimed: 2, recorded: 1, released: 1, errors: 0 } });
  });

  it("reports a crashed tick as a 500 in the same response shape, without internals", async () => {
    const tick = vi.fn().mockRejectedValue(new Error("connection refused 10.0.0.1"));
    const res = await handleCron(req(`Bearer ${SECRET}`), { secret: SECRET, tick, logger: { error: () => {} } });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: { code: "tick_failed", message: "The publishing tick failed; see server logs." } });
  });
});

describe("fromRpcError", () => {
  it("maps a database HINT code to the result shape", () => {
    expect(fromRpcError({ message: "Only a ready post can be approved (this one is approved).", hint: "not_ready", code: "P0001" }))
      .toEqual({ ok: false, error: { code: "not_ready", message: "Only a ready post can be approved (this one is approved)." } });
  });

  it("hides unexpected database errors behind a generic message", () => {
    expect(fromRpcError({ message: 'relation "x" does not exist', code: "42P01" }))
      .toEqual({ ok: false, error: { code: "unexpected", message: "Something went wrong. Please try again." } });
  });
});
