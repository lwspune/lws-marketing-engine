"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { canReply, checkAutoReplyText, LEAD_STATUSES, MAX_REPLY } from "@/lib/domain/inbox";
import { ingestRows } from "@/lib/inbox/store";
import { connectBusinessAppNumber, type HistoryState } from "@/lib/inbox/connectWhatsApp";
import { MetaApiError, metaConfigFromEnv } from "@/lib/platforms/meta";
import { sendFacebookText, sendInstagramText, sendWhatsAppText } from "@/lib/platforms/metaMessages";
import { fail, fromRpcError, ok, type Result } from "@/lib/publishing/result";

const WINDOW_CLOSED = {
  instagram: "Instagram only allows replies within 24 hours of their last message. Reply from the Instagram app instead.",
  facebook: "Messenger only allows replies within 24 hours of their last message. Reply from Meta Business Suite instead.",
  whatsapp: "WhatsApp only allows replies within 24 hours of their last message (after that, approved templates only).",
};

/** Reply to one chat on Instagram, Messenger or WhatsApp, then store the reply (Meta's echo of it is ignored as a duplicate). */
export async function sendReply(input: { conversationId: string; text: string }): Promise<Result<null>> {
  const parsed = z.object({
    conversationId: z.string().uuid(),
    text: z.string().trim().min(1, "Write a reply first.").max(MAX_REPLY, `Replies can be up to ${MAX_REPLY} characters.`),
  }).safeParse(input);
  if (!parsed.success) return fail("invalid_input", parsed.error.issues.map((i) => i.message).join("; "));
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("unauthorized", "Please sign in again.");
  // RLS: only owners see conversations, so this read is also the permission check.
  const { data: c } = await supabase.from("conversations")
    .select("id, account_id, channel, contact_id, last_incoming_at").eq("id", parsed.data.conversationId).maybeSingle();
  if (!c) return fail("not_found", "Conversation not found.");
  const channel = c.channel as keyof typeof WINDOW_CLOSED;
  if (!canReply(c.last_incoming_at, new Date())) return fail("window_closed", WINDOW_CLOSED[channel]);
  const { data: account } = await supabase.from("connected_accounts").select("external_id").eq("id", c.account_id).maybeSingle();
  if (!account) return fail("not_found", "Account not found.");

  const admin = createSupabaseAdminClient();
  const { data: token } = await admin.rpc("get_account_token", { p_account: c.account_id });
  const app = channel === "whatsapp" ? "WhatsApp" : channel === "facebook" ? "Messenger" : "Instagram";
  if (!token) return fail("not_connected", `The ${app} connection needs renewing (SETUP.md step 8).`);
  let mid: string;
  try {
    const cfg = metaConfigFromEnv(), text = parsed.data.text;
    mid = channel === "whatsapp"
      ? await sendWhatsAppText(cfg, { token: token as string, phoneNumberId: account.external_id, to: c.contact_id, text })
      : channel === "facebook"
        ? await sendFacebookText(cfg, { token: token as string, recipientId: c.contact_id, text })
        : await sendInstagramText(cfg, { token: token as string, recipientId: c.contact_id, text });
  } catch (e) {
    console.error("inbox: reply failed", { conversationId: c.id, channel, error: (e as Error).message });
    return fail("send_failed", e instanceof MetaApiError ? `${app} refused the reply: ${e.message}` : `Couldn't reach ${app}. Try again.`);
  }
  try {
    await ingestRows(admin, channel, account.external_id, [{
      contact_id: c.contact_id, mid, direction: "out", body: parsed.data.text, attachment: null,
      sent_at: new Date().toISOString(), source: "direct", ad_id: null, deleted: false,
    }]);
  } catch (e) {
    // Sent already; the webhook echo will store it.
    console.error("inbox: storing a sent reply failed", { conversationId: c.id, error: (e as Error).message });
  }
  revalidatePath(`/inbox/${c.id}`);
  revalidatePath("/inbox");
  return ok(null);
}

/** Save one Instagram account's auto-reply to ad chats and switch it on or off (owners only; the database checks). */
export async function saveAutoReply(input: { accountId: string; enabled: boolean; text: string }): Promise<Result<null>> {
  const parsed = z.object({ accountId: z.string().uuid(), enabled: z.boolean(), text: z.string() }).safeParse(input);
  if (!parsed.success) return fail("invalid_input", "Unknown account.");
  const text = checkAutoReplyText(parsed.data.text);
  if (!text.ok) return fail("invalid_input", text.message);
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("unauthorized", "Please sign in again.");
  const { error } = await supabase.rpc("set_auto_reply", { p_account: parsed.data.accountId, p_enabled: parsed.data.enabled, p_body: text.text });
  if (error) return fromRpcError(error);
  revalidatePath("/inbox");
  return ok(null);
}

/** Mark how far a chat got (owners only; the database checks). */
export async function setLeadStatus(input: { conversationId: string; status: string }): Promise<Result<null>> {
  const parsed = z.object({ conversationId: z.string().uuid(), status: z.enum(LEAD_STATUSES) }).safeParse(input);
  if (!parsed.success) return fail("invalid_input", "Unknown chat or status.");
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("unauthorized", "Please sign in again.");
  const { error } = await supabase.rpc("set_conversation_status", { p_conversation: parsed.data.conversationId, p_status: parsed.data.status });
  if (error) return fromRpcError(error);
  revalidatePath(`/inbox/${parsed.data.conversationId}`);
  revalidatePath("/inbox");
  revalidatePath("/insights");
  return ok(null);
}

/**
 * Finish connecting a WhatsApp Business app number after Meta's Embedded Signup window (owners only). The number
 * stays on the phone app; GoPost gets its messages too. See src/lib/inbox/connectWhatsApp.ts.
 */
export async function connectWhatsAppBusinessApp(
  input: { code: string; wabaId: string | null; phoneNumberId: string | null },
): Promise<Result<{ number: string; history: HistoryState }>> {
  const id = z.string().regex(/^\d{1,30}$/).nullable();
  const parsed = z.object({ code: z.string().min(10).max(2000), wabaId: id, phoneNumberId: id }).safeParse(input);
  if (!parsed.success) return fail("invalid_input", "Meta's window didn't return a usable code. Please try again.");
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("unauthorized", "Please sign in again.");
  // RLS returns the user's own memberships; only an owner may connect a number.
  const { data: owned } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).eq("role", "owner");
  if (!owned?.length) return fail("forbidden", "Only owners can connect a WhatsApp number.");
  if (owned.length > 1) return fail("invalid_input", "You own more than one organisation; connect the number with the script instead.");
  const appId = process.env.META_APP_ID, appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) return fail("not_configured", "META_APP_ID and META_APP_SECRET aren't set on the server.");

  const admin = createSupabaseAdminClient();
  const r = await connectBusinessAppNumber(parsed.data, {
    cfg: metaConfigFromEnv(), appId, appSecret,
    save: async (n, token) => {
      const { error } = await admin.rpc("upsert_connected_account", {
        p_org: owned[0].org_id, p_platform: "whatsapp", p_external_id: n.phoneNumberId, p_display_name: n.displayPhoneNumber, p_token: token, p_expires_at: null,
      });
      if (error) throw new Error(`upsert_connected_account: ${error.message}`);
    },
  });
  if (r.ok) revalidatePath("/inbox");
  return r;
}
