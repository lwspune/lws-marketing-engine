import { afterEach, describe, expect, it, vi } from "vitest";
import { startFakeMeta } from "../helpers/fakeMeta";
import { connectBusinessAppNumber, type ConnectDeps } from "@/lib/inbox/connectWhatsApp";

// After Meta's Embedded Signup window closes on the WhatsApp Business app route, GoPost swaps the 30-second code for
// the business token, finds the number, saves it (token encrypted in Vault), subscribes to its webhooks, and asks
// Meta once for the phone's old chats (allowed only within 24 hours of connecting, so it happens right away).

let fake: Awaited<ReturnType<typeof startFakeMeta>> | undefined;
afterEach(async () => { await fake?.close(); fake = undefined; });

function deps(over: Partial<ConnectDeps> = {}): ConnectDeps & { save: ReturnType<typeof vi.fn>; logger: { error: ReturnType<typeof vi.fn> } } {
  return { cfg: fake!.config, appId: "APP", appSecret: "SECRET", save: vi.fn(async () => {}), logger: { error: vi.fn() }, ...over } as never;
}
const paths = () => fake!.calls.map((c) => `${c.method} ${c.path.replace(/^\/v[\d.]+/, "")}`);

describe("connectBusinessAppNumber", () => {
  it("swaps the code first, saves the number with its token, subscribes, then asks for the chat history", async () => {
    fake = await startFakeMeta();
    const d = deps();
    const r = await connectBusinessAppNumber({ code: "CODE1", wabaId: "WABA2", phoneNumberId: "PN3" }, d);
    expect(r).toEqual({ ok: true, data: { number: "+91 70200 03600", history: "requested" } });
    expect(d.save).toHaveBeenCalledWith({ phoneNumberId: "PN3", displayPhoneNumber: "+91 70200 03600" }, "BIZTOKEN-0123456789abcdef");
    expect(paths()).toEqual(["GET /oauth/access_token", "GET /WABA2/phone_numbers", "POST /WABA2/subscribed_apps", "POST /PN3/smb_app_data"]);
  });

  it("without ids from the window, finds the account on the token and the number that is on the phone app", async () => {
    fake = await startFakeMeta({ debugTokenTargets: ["WABA2"] });
    const d = deps();
    const r = await connectBusinessAppNumber({ code: "CODE1", wabaId: null, phoneNumberId: null }, d);
    expect(r.ok).toBe(true);
    expect(d.save).toHaveBeenCalledWith({ phoneNumberId: "PN3", displayPhoneNumber: "+91 70200 03600" }, expect.any(String));
    const debug = fake.calls.find((c) => c.path.endsWith("/debug_token"))!;
    expect(debug.params).toMatchObject({ input_token: "BIZTOKEN-0123456789abcdef", access_token: "APP|SECRET" });
  });

  it("refuses when the account has no number on the phone app, naming what it found, and saves nothing", async () => {
    fake = await startFakeMeta();
    const d = deps();
    const r = await connectBusinessAppNumber({ code: "CODE1", wabaId: "WABA1", phoneNumberId: null }, d);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.code).toBe("not_found");
    expect(r.error.message).toMatch(/\+91 76206 99213/);
    expect(d.save).not.toHaveBeenCalled();
  });

  it("refuses a phone number id that isn't in the account", async () => {
    fake = await startFakeMeta();
    const r = await connectBusinessAppNumber({ code: "CODE1", wabaId: "WABA2", phoneNumberId: "PN9" }, deps());
    expect(r).toMatchObject({ ok: false, error: { code: "not_found" } });
  });

  it("an expired code: asks to try again, saves nothing, and keeps the app secret out of the log", async () => {
    fake = await startFakeMeta();
    const d = deps({ appSecret: "SECRET-abcdef0123456789" });
    const r = await connectBusinessAppNumber({ code: "OLD", wabaId: "WABA2", phoneNumberId: "PN3" }, d);
    expect(r).toMatchObject({ ok: false, error: { code: "meta_refused" } });
    if (!r.ok) expect(r.error.message).toMatch(/try again/i);
    expect(d.save).not.toHaveBeenCalled();
    expect(JSON.stringify(d.logger.error.mock.calls)).not.toContain("SECRET-abcdef0123456789");
  });

  it("doesn't subscribe when saving fails", async () => {
    fake = await startFakeMeta();
    const d = deps({ save: vi.fn(async () => { throw new Error("vault down"); }) });
    const r = await connectBusinessAppNumber({ code: "CODE1", wabaId: "WABA2", phoneNumberId: "PN3" }, d);
    expect(r).toMatchObject({ ok: false, error: { code: "save_failed" } });
    expect(paths()).not.toContain("POST /WABA2/subscribed_apps");
  });

  it("stays connected when the history request fails, and says so", async () => {
    fake = await startFakeMeta({ failOn: { path: /\/PN3\/smb_app_data$/, status: 500, message: "Temporary", code: 1 } });
    const d = deps();
    const r = await connectBusinessAppNumber({ code: "CODE1", wabaId: "WABA2", phoneNumberId: "PN3" }, d);
    expect(r).toEqual({ ok: true, data: { number: "+91 70200 03600", history: "failed" } });
    expect(d.logger.error).toHaveBeenCalled();
    expect(JSON.stringify(d.logger.error.mock.calls)).not.toContain("BIZTOKEN");
  });

  it("history already requested (connecting twice) counts as done", async () => {
    fake = await startFakeMeta({ failOn: { path: /\/PN3\/smb_app_data$/, status: 400, message: "Sync already requested", code: 135000 } });
    const r = await connectBusinessAppNumber({ code: "CODE1", wabaId: "WABA2", phoneNumberId: "PN3" }, deps());
    expect(r).toEqual({ ok: true, data: { number: "+91 70200 03600", history: "already" } });
  });
});
