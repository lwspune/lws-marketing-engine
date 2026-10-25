import { guessCourse, instagramLead, parseScreening, transcript, whatsappContact, type ChatMessage } from "@/lib/domain/leads";

// The hourly leads job (migration 0016), kept free of Next and Supabase so it can be tested directly (like cron.ts).
// Instagram and Facebook (Messenger): a chat where the person shared a phone number or email is a lead. WhatsApp: Claude
// reads the new chats and only the genuine ones become leads; without a Claude key WhatsApp is skipped (and nothing there
// is marked checked).

export interface Candidate {
  conversationId: string; channel: "instagram" | "facebook" | "whatsapp"; contactId: string;
  contactName: string | null; contactUsername: string | null; lastIncomingAt: string;
}
export interface FoundLead { contact: string; name: string | null; course: string | null; leadAt: string; reason: string }
/** One chat looked at, up to its last incoming message. `reason` is Claude's, for a WhatsApp chat that isn't a lead. */
export interface LeadCheck { conversationId: string; checkedAt: string; lead: FoundLead | null; reason?: string }
export interface ScreeningChat { id: string; transcript: string }

export interface ScreenDeps {
  candidates: (channel: Candidate["channel"], limit: number) => Promise<Candidate[]>;
  messages: (conversationIds: string[]) => Promise<Map<string, ChatMessage[]>>;
  /** Saves the checks; returns how many leads were added (a contact that is already a lead isn't added again). */
  record: (checks: LeadCheck[]) => Promise<number>;
  /** Claude's verdicts for these chats (src/lib/leads/claude.ts), or null when there's no API key. */
  ask: ((chats: ScreeningChat[]) => Promise<unknown>) | null;
  logger?: { error: (...args: unknown[]) => void };
}

export type WhatsAppResult = { checked: number; leads: number } | { skipped: "no_key" } | { error: string };
export interface ScreenResult { instagram: { checked: number; leads: number }; facebook: { checked: number; leads: number }; whatsapp: WhatsAppResult }

// One Claude call per run keeps the job well inside Vercel's 60 s; the backfill script loops until nothing is left.
export const LIMITS = { instagram: 200, facebook: 200, whatsapp: 15 };

export async function screenLeads(deps: ScreenDeps, limits = LIMITS): Promise<ScreenResult> {
  return {
    instagram: await screenSharedContact(deps, "instagram", limits.instagram),
    facebook: await screenSharedContact(deps, "facebook", limits.facebook),
    whatsapp: await screenWhatsApp(deps, limits.whatsapp),
  };
}

async function screenSharedContact(deps: ScreenDeps, channel: "instagram" | "facebook", limit: number) {
  const chats = await deps.candidates(channel, limit);
  if (!chats.length) return { checked: 0, leads: 0 };
  const msgs = await deps.messages(chats.map((c) => c.conversationId));
  const checks = chats.map((c): LeadCheck => {
    const m = msgs.get(c.conversationId) ?? [];
    const found = instagramLead(m);
    return {
      conversationId: c.conversationId, checkedAt: c.lastIncomingAt,
      lead: found && {
        contact: found.contact, name: c.contactName || (c.contactUsername ? `@${c.contactUsername}` : null), course: guessCourse(m),
        leadAt: found.at, reason: found.contact.startsWith("+") ? "Shared a phone number" : "Shared an email",
      },
    };
  });
  return { checked: checks.length, leads: await deps.record(checks) };
}

async function screenWhatsApp(deps: ScreenDeps, limit: number): Promise<WhatsAppResult> {
  if (!deps.ask) return { skipped: "no_key" };
  const chats = await deps.candidates("whatsapp", limit);
  if (!chats.length) return { checked: 0, leads: 0 };
  const msgs = await deps.messages(chats.map((c) => c.conversationId));
  let verdicts;
  try {
    verdicts = parseScreening(
      await deps.ask(chats.map((c) => ({ id: c.conversationId, transcript: transcript(msgs.get(c.conversationId) ?? []) }))),
      chats.map((c) => c.conversationId),
    );
  } catch (e) {
    (deps.logger ?? console).error("leads: WhatsApp screening failed", { error: (e as Error).message });
    return { error: (e as Error).message };
  }
  const checks: LeadCheck[] = [];
  for (const c of chats) {
    const v = verdicts.get(c.conversationId);
    if (!v) continue;
    const contact = whatsappContact(c.contactId);
    const firstIn = (msgs.get(c.conversationId) ?? []).filter((m) => m.direction === "in").map((m) => m.sent_at).sort()[0];
    checks.push(v.genuine && contact
      ? {
        conversationId: c.conversationId, checkedAt: c.lastIncomingAt,
        lead: { contact, name: v.name ?? c.contactName, course: v.course, leadAt: firstIn ?? c.lastIncomingAt, reason: v.reason },
      }
      : { conversationId: c.conversationId, checkedAt: c.lastIncomingAt, lead: null, reason: v.reason });
  }
  return { checked: checks.length, leads: checks.length ? await deps.record(checks) : 0 };
}
