import { fail, ok, type Result } from "@/lib/publishing/result";
import { MetaApiError, type MetaConfig } from "@/lib/platforms/meta";
import {
  exchangeSignupCode, listWabaNumbers, requestWhatsAppHistory, subscribeAppToWaba, tokenWabaIds, type WabaNumber,
} from "@/lib/platforms/metaMessages";

// Connect a WhatsApp Business app number to the Inbox after Meta's Embedded Signup window (founder, 2026-10-19:
// 70200 03600). Kept free of Next and Supabase so it can be tested against the fake Meta server, like webhook.ts.
// The number stays on the phone app ("coexistence"): it is never registered here, which would move it off the phone.

export interface ConnectDeps {
  cfg: MetaConfig;
  appId: string;
  appSecret: string;
  /** Store the number as a connected account (platform whatsapp, token encrypted in Vault). */
  save: (n: { phoneNumberId: string; displayPhoneNumber: string }, token: string) => Promise<void>;
  logger?: { error: (...args: unknown[]) => void };
}

/** "requested": old chats are on their way; "already": asked before; "failed": connected, but no old chats. */
export type HistoryState = "requested" | "already" | "failed";

const msg = (e: unknown) => (e as Error).message ?? String(e);

export async function connectBusinessAppNumber(
  input: { code: string; wabaId: string | null; phoneNumberId: string | null }, deps: ConnectDeps,
): Promise<Result<{ number: string; history: HistoryState }>> {
  const log = deps.logger ?? console;
  // The code lives 30 seconds, so it is swapped before anything else.
  let token: string;
  try {
    token = await exchangeSignupCode(deps.cfg, { appId: deps.appId, appSecret: deps.appSecret, code: input.code });
  } catch (e) {
    log.error("whatsapp connect: code exchange failed", { error: msg(e) });
    return fail("meta_refused", `Meta refused the sign-up (${msg(e)}). Please try again: the window gives a fresh code each time.`);
  }

  let number: WabaNumber | undefined;
  const seen: string[] = [];
  try {
    const wabaIds = input.wabaId ? [input.wabaId] : await tokenWabaIds(deps.cfg, { token, appToken: `${deps.appId}|${deps.appSecret}` });
    for (const wabaId of wabaIds) {
      const numbers = await listWabaNumbers(deps.cfg, { token, wabaId });
      seen.push(...numbers.map((n) => n.displayPhoneNumber));
      number ??= input.phoneNumberId ? numbers.find((n) => n.phoneNumberId === input.phoneNumberId) : numbers.find((n) => n.onPhoneApp);
    }
  } catch (e) {
    log.error("whatsapp connect: number lookup failed", { error: msg(e) });
    return fail("meta_refused", e instanceof MetaApiError ? `Meta refused the number lookup: ${e.message}` : msg(e));
  }
  if (!number) {
    return fail("not_found", `No WhatsApp Business app number came back from the sign-up (found: ${seen.join(", ") || "none"}). `
      + "Start again and choose to connect your existing WhatsApp Business app.");
  }

  try {
    await deps.save({ phoneNumberId: number.phoneNumberId, displayPhoneNumber: number.displayPhoneNumber }, token);
  } catch (e) {
    log.error("whatsapp connect: saving the number failed", { error: msg(e) });
    return fail("save_failed", "Couldn't save the number. Please try again.");
  }
  try {
    await subscribeAppToWaba(deps.cfg, { token, wabaId: number.wabaId });
  } catch (e) {
    log.error("whatsapp connect: webhook subscription failed", { error: msg(e) });
    return fail("meta_refused", `Saved, but Meta refused to send its messages to GoPost: ${msg(e)}`);
  }

  // Meta allows this once, within 24 hours of connecting; a failure leaves the number connected without old chats.
  let history: HistoryState;
  try {
    history = (await requestWhatsAppHistory(deps.cfg, { token, phoneNumberId: number.phoneNumberId })) === null ? "already" : "requested";
  } catch (e) {
    log.error("whatsapp connect: history request failed", { error: msg(e) });
    history = "failed";
  }
  return ok({ number: number.displayPhoneNumber, history });
}
