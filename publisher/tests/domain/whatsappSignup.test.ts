import { describe, expect, it } from "vitest";
import { isFacebookOrigin, parseSignupEvent } from "@/lib/domain/whatsappSignup";

// Meta's Embedded Signup window posts its progress to our page (window "message" events). Only the WhatsApp
// Business app route ("coexistence": the phone keeps working) is accepted; the others would move or create a number.

describe("isFacebookOrigin", () => {
  it("accepts facebook.com and its subdomains over https only", () => {
    expect(isFacebookOrigin("https://www.facebook.com")).toBe(true);
    expect(isFacebookOrigin("https://web.facebook.com")).toBe(true);
    expect(isFacebookOrigin("https://facebook.com")).toBe(true);
  });
  it("refuses look-alikes, plain http and junk", () => {
    expect(isFacebookOrigin("https://evilfacebook.com")).toBe(false);
    expect(isFacebookOrigin("https://facebook.com.evil.in")).toBe(false);
    expect(isFacebookOrigin("http://www.facebook.com")).toBe(false);
    expect(isFacebookOrigin("null")).toBe(false);
  });
});

describe("parseSignupEvent", () => {
  const finish = { type: "WA_EMBEDDED_SIGNUP", event: "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING", data: { waba_id: "111", phone_number_id: "222", business_id: "333" } };

  it("reads the finished WhatsApp Business app route, as JSON text or an object", () => {
    const want = { kind: "finish", wabaId: "111", phoneNumberId: "222" };
    expect(parseSignupEvent(JSON.stringify(finish))).toEqual(want);
    expect(parseSignupEvent(finish)).toEqual(want);
  });

  it("copes without the phone number id (Meta often leaves it out on this route)", () => {
    expect(parseSignupEvent({ ...finish, data: { waba_id: "111" } })).toEqual({ kind: "finish", wabaId: "111", phoneNumberId: null });
  });

  it("refuses the other finish routes, which would move the number off the phone or set up a new one", () => {
    for (const event of ["FINISH", "FINISH_ONLY_WABA", "FINISH_OBO_MIGRATION"]) {
      expect(parseSignupEvent({ ...finish, event })).toEqual({ kind: "wrong_route" });
    }
  });

  it("reports a cancel with the step it stopped at, or Meta's error message", () => {
    expect(parseSignupEvent({ type: "WA_EMBEDDED_SIGNUP", event: "CANCEL", data: { current_step: "PHONE_NUMBER_SETUP" } }))
      .toEqual({ kind: "cancel", message: "Stopped at: PHONE_NUMBER_SETUP" });
    expect(parseSignupEvent({ type: "WA_EMBEDDED_SIGNUP", event: "CANCEL", data: { error_message: "Number not eligible", error_code: "524126" } }))
      .toEqual({ kind: "cancel", message: "Number not eligible" });
    expect(parseSignupEvent({ type: "WA_EMBEDDED_SIGNUP", event: "ERROR", data: { error_message: "Something broke" } }))
      .toEqual({ kind: "cancel", message: "Something broke" });
  });

  it("ignores everything else: other message types, bad JSON, ids that aren't numbers", () => {
    expect(parseSignupEvent({ type: "OTHER", event: "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING" })).toBeNull();
    expect(parseSignupEvent("not json")).toBeNull();
    expect(parseSignupEvent(null)).toBeNull();
    expect(parseSignupEvent({ ...finish, data: { waba_id: "1; drop" } })).toBeNull();
    expect(parseSignupEvent({ ...finish, data: { waba_id: "111", phone_number_id: "x" } })).toEqual({ kind: "finish", wabaId: "111", phoneNumberId: null });
  });
});
