import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatMessage } from "@/lib/domain/leads";
import { askClaudeForLeads } from "./claude";
import type { Candidate, LeadCheck, ScreenDeps } from "./screen";

// The leads job's database calls, through 0016's functions (service role). Shared by /api/cron/leads and
// `npm run leads:screen`, so no `server-only` here: callers pass the admin client.

const PER_CHAT = 200, PARALLEL = 10;

export function leadsStore(db: SupabaseClient, opts: { apiKey?: string; orgId?: string } = {}): ScreenDeps {
  return {
    candidates: async (channel, limit) => {
      const { data, error } = await db.rpc("leads_to_check", { p_channel: channel, p_limit: limit, p_org: opts.orgId ?? null });
      if (error) throw new Error(`leads_to_check: ${error.message}`);
      return ((data ?? []) as Record<string, string | null>[]).map((r): Candidate => ({
        conversationId: r.conversation_id!, channel: r.channel as Candidate["channel"], contactId: r.contact_id!,
        contactName: r.contact_name, contactUsername: r.contact_username, lastIncomingAt: r.last_incoming_at!,
      }));
    },
    // Each chat's latest messages, a few chats at a time (one query per chat stays under Supabase's row cap).
    messages: async (ids) => {
      const out = new Map<string, ChatMessage[]>();
      for (let i = 0; i < ids.length; i += PARALLEL) {
        await Promise.all(ids.slice(i, i + PARALLEL).map(async (id) => {
          const { data, error } = await db.from("messages").select("direction, body, attachment, sent_at")
            .eq("conversation_id", id).order("sent_at", { ascending: false }).limit(PER_CHAT);
          if (error) throw new Error(`reading messages: ${error.message}`);
          out.set(id, (data ?? []) as ChatMessage[]);
        }));
      }
      return out;
    },
    record: async (checks: LeadCheck[]) => {
      const { data, error } = await db.rpc("record_lead_checks", {
        p_checks: checks.map((c) => ({
          conversation_id: c.conversationId, checked_at: c.checkedAt, reason: c.reason ?? null,
          lead: c.lead && { contact: c.lead.contact, name: c.lead.name, course: c.lead.course, lead_at: c.lead.leadAt, reason: c.lead.reason },
        })),
      });
      if (error) throw new Error(`record_lead_checks: ${error.message}`);
      return data as number;
    },
    ask: opts.apiKey ? (chats) => askClaudeForLeads(opts.apiKey!, chats) : null,
  };
}
