"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { canReply, LEAD_STATUSES, MAX_REPLY } from "@/lib/domain/inbox";
import { ingestRows } from "@/lib/inbox/store";
import { MetaApiError, metaConfigFromEnv } from "@/lib/platforms/meta";
import { sendInstagramText } from "@/lib/platforms/metaMessages";
import { fail, fromRpcError, ok, type Result } from "@/lib/publishing/result";

/** Reply to one chat on Instagram, then store the reply (the webhook's echo of it is ignored as a duplicate). */
export async function sendReply(input: { conversationId: string; text: string }): Promise<Result<null>> {
  const parsed = z.object({
    conversationId: z.string().uuid(),
    text: z.string().trim().min(1, "Write a reply first.").max(MAX_REPLY, `Instagram allows up to ${MAX_REPLY} characters.`),
  }).safeParse(input);
  if (!parsed.success) return fail("invalid_input", parsed.error.issues.map((i) => i.message).join("; "));
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("unauthorized", "Please sign in again.");
  // RLS: only owners see conversations, so this read is also the permission check.
  const { data: c } = await supabase.from("conversations")
    .select("id, account_id, channel, contact_id, last_incoming_at").eq("id", parsed.data.conversationId).maybeSingle();
  if (!c) return fail("not_found", "Conversation not found.");
  if (c.channel !== "instagram") return fail("not_supported", "Replies work for Instagram chats only for now.");
  if (!canReply(c.last_incoming_at, new Date())) {
    return fail("window_closed", "Instagram only allows replies within 24 hours of their last message. Reply from the Instagram app instead.");
  }
  const { data: account } = await supabase.from("connected_accounts").select("external_id").eq("id", c.account_id).maybeSingle();
  if (!account) return fail("not_found", "Instagram account not found.");

  const admin = createSupabaseAdminClient();
  const { data: token } = await admin.rpc("get_account_token", { p_account: c.account_id });
  if (!token) return fail("not_connected", "The Instagram connection needs renewing (npm run connect:meta).");
  let mid: string;
  try {
    mid = await sendInstagramText(metaConfigFromEnv(), { token: token as string, recipientId: c.contact_id, text: parsed.data.text });
  } catch (e) {
    console.error("inbox: reply failed", { conversationId: c.id, error: (e as Error).message });
    return fail("send_failed", e instanceof MetaApiError ? `Instagram refused the reply: ${e.message}` : "Couldn't reach Instagram. Try again.");
  }
  try {
    await ingestRows(admin, "instagram", account.external_id, [{
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
