// Connecting a WhatsApp Business app number (founder, 2026-10-19: 70200 03600) through Meta's Embedded Signup with
// the "coexistence" route: the number stays on the phone app and also reaches GoPost. Meta's window reports its
// progress to our page as window "message" events; these rules decide which ones to trust and act on.

export type SignupEvent =
  | { kind: "finish"; wabaId: string; phoneNumberId: string | null }
  /** Finished, but on a route that moves the number off the phone or sets up a new one: not what we asked for. */
  | { kind: "wrong_route" }
  | { kind: "cancel"; message: string };

const ID = /^\d{1,30}$/;
const BUSINESS_APP_FINISH = "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING";

/** Only Meta's own pages may talk to us: https on facebook.com or a subdomain (not "evilfacebook.com"). */
export function isFacebookOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    return u.protocol === "https:" && (u.hostname === "facebook.com" || u.hostname.endsWith(".facebook.com"));
  } catch {
    return false;
  }
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 300) : null);

/** One message event's data (JSON text or an object) → what happened, or null when it isn't Embedded Signup's. */
export function parseSignupEvent(raw: unknown): SignupEvent | null {
  let msg: unknown = raw;
  if (typeof raw === "string") {
    try {
      msg = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!isObj(msg) || msg.type !== "WA_EMBEDDED_SIGNUP" || typeof msg.event !== "string") return null;
  const data = isObj(msg.data) ? msg.data : {};
  if (msg.event === "CANCEL" || msg.event === "ERROR") {
    const step = text(data.current_step);
    return { kind: "cancel", message: text(data.error_message) ?? (step ? `Stopped at: ${step}` : "The window was closed before the end.") };
  }
  if (msg.event === BUSINESS_APP_FINISH) {
    const waba = typeof data.waba_id === "string" && ID.test(data.waba_id) ? data.waba_id : null;
    if (!waba) return null;
    const pn = typeof data.phone_number_id === "string" && ID.test(data.phone_number_id) ? data.phone_number_id : null;
    return { kind: "finish", wabaId: waba, phoneNumberId: pn };
  }
  if (msg.event.startsWith("FINISH")) return { kind: "wrong_route" };
  return null;
}
