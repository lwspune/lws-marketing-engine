import { describe, expect, it, vi } from "vitest";
import { screenLeads, type Candidate, type LeadCheck, type ScreenDeps } from "@/lib/leads/screen";
import type { ChatMessage } from "@/lib/domain/leads";

// The hourly leads job (migration 0016): Instagram chats where the person shared a contact become leads straight away;
// WhatsApp chats go to Claude, and only the ones it calls genuine become leads. Every chat looked at is marked checked
// (up to its last incoming message), so it's only looked at again when they write again.

const cand = (over: Partial<Candidate> = {}): Candidate => ({
  conversationId: "ig-1", channel: "instagram", contactId: "9001", contactName: "Rahul S", contactUsername: "rahul_07",
  lastIncomingAt: "2026-10-20T10:00:00Z", ...over,
});
const m = (body: string, over: Partial<ChatMessage> = {}): ChatMessage => ({ direction: "in", body, sent_at: "2026-10-20T09:00:00Z", ...over });

function deps(chats: Record<string, { c: Candidate; msgs: ChatMessage[] }>, over: Partial<ScreenDeps> = {}) {
  const recorded: LeadCheck[] = [];
  const d: ScreenDeps = {
    candidates: vi.fn(async (channel: string) => Object.values(chats).filter((x) => x.c.channel === channel).map((x) => x.c)),
    messages: vi.fn(async (ids: string[]) => new Map(ids.map((id) => [id, chats[id].msgs]))),
    record: vi.fn(async (checks: LeadCheck[]) => {
      recorded.push(...checks);
      return checks.filter((c) => c.lead).length;
    }),
    ask: null,
    logger: { error: vi.fn() },
    ...over,
  };
  return { d, recorded };
}

describe("screenLeads: Instagram", () => {
  it("makes a lead of a chat where the person shared a number, and marks the rest checked", async () => {
    const { d, recorded } = deps({
      "ig-1": { c: cand(), msgs: [m("Sir SPI mock test?", { sent_at: "2026-10-19T08:00:00Z" }), m("my no 98765 43210")] },
      "ig-2": { c: cand({ conversationId: "ig-2", contactName: null, contactUsername: null }), msgs: [m("nice reel")] },
    });
    const r = await screenLeads(d);
    expect(r.instagram).toEqual({ checked: 2, leads: 1 });
    expect(recorded).toEqual([
      {
        conversationId: "ig-1", checkedAt: "2026-10-20T10:00:00Z",
        lead: { contact: "+919876543210", name: "Rahul S", course: "SPI", leadAt: "2026-10-20T09:00:00Z", reason: "Shared a phone number" },
      },
      { conversationId: "ig-2", checkedAt: "2026-10-20T10:00:00Z", lead: null },
    ]);
  });

  it("falls back to the @handle for the name, and says when it was an email", async () => {
    const { d, recorded } = deps({ "ig-1": { c: cand({ contactName: null }), msgs: [m("a@b.co")] } });
    await screenLeads(d);
    expect(recorded[0].lead).toMatchObject({ contact: "a@b.co", name: "@rahul_07", course: null, reason: "Shared an email" });
  });
});

// Facebook Page chats (2026-10-25) follow Instagram's rule: sharing a phone number or email makes a lead, no AI.
describe("screenLeads: Facebook", () => {
  it("makes a lead of a Messenger chat where the person shared a number, named by their Facebook name", async () => {
    const fb = cand({ conversationId: "fb-1", channel: "facebook", contactId: "7001", contactName: "Priya K", contactUsername: null });
    const { d, recorded } = deps({
      "fb-1": { c: fb, msgs: [m("NDA batch? 9123456789")] },
      "ig-1": { c: cand(), msgs: [m("nice reel")] },
    });
    const r = await screenLeads(d);
    expect(r.facebook).toEqual({ checked: 1, leads: 1 });
    expect(r.instagram).toEqual({ checked: 1, leads: 0 });
    expect(recorded).toContainEqual({
      conversationId: "fb-1", checkedAt: "2026-10-20T10:00:00Z",
      lead: { contact: "+919123456789", name: "Priya K", course: "NDA", leadAt: "2026-10-20T09:00:00Z", reason: "Shared a phone number" },
    });
  });
});

describe("screenLeads: WhatsApp", () => {
  const wa = (id: string, over: Partial<Candidate> = {}) =>
    cand({ conversationId: id, channel: "whatsapp", contactId: "919876543210", contactName: "Priya", contactUsername: null, ...over });

  it("skips WhatsApp, and checks nothing there, when there's no Claude key", async () => {
    const { d, recorded } = deps({ "wa-1": { c: wa("wa-1"), msgs: [m("fees?")] } });
    const r = await screenLeads(d);
    expect(r.whatsapp).toEqual({ skipped: "no_key" });
    expect(recorded).toEqual([]);
  });

  it("sends redacted chats to Claude and makes leads only of the genuine ones", async () => {
    const ask = vi.fn(async () => ({
      chats: [
        { id: "wa-1", genuine: true, reason: "Parent asking about NDA batch", name: "Priya Kulkarni", course: "NDA" },
        { id: "wa-2", genuine: false, reason: "Existing student's parent about attendance", name: null, course: null },
      ],
    }));
    const { d, recorded } = deps({
      "wa-1": { c: wa("wa-1"), msgs: [m("Hi, NDA batch for my son? call 9123456789", { sent_at: "2026-10-18T07:00:00Z" }), m("?")] },
      "wa-2": { c: wa("wa-2", { contactId: "919000000001" }), msgs: [m("He is sick today")] },
    }, { ask });
    const r = await screenLeads(d);
    expect(r.whatsapp).toEqual({ checked: 2, leads: 1 });
    const sent = (ask.mock.calls[0] as unknown as [{ id: string; transcript: string }[]])[0];
    expect(sent.map((s) => s.id)).toEqual(["wa-1", "wa-2"]);
    expect(sent[0].transcript).toContain("call [phone]");
    expect(recorded).toContainEqual({
      conversationId: "wa-1", checkedAt: "2026-10-20T10:00:00Z",
      lead: { contact: "+919876543210", name: "Priya Kulkarni", course: "NDA", leadAt: "2026-10-18T07:00:00Z", reason: "Parent asking about NDA batch" },
    });
    expect(recorded).toContainEqual({ conversationId: "wa-2", checkedAt: "2026-10-20T10:00:00Z", lead: null, reason: "Existing student's parent about attendance" });
  });

  it("uses their WhatsApp name when Claude found none, and leaves chats without a verdict for next time", async () => {
    const ask = vi.fn(async () => ({ chats: [{ id: "wa-1", genuine: true, reason: "Asks for admission", name: null, course: null }] }));
    const { d, recorded } = deps({
      "wa-1": { c: wa("wa-1"), msgs: [m("admission?")] },
      "wa-2": { c: wa("wa-2"), msgs: [m("hello")] },
    }, { ask });
    const r = await screenLeads(d);
    expect(r.whatsapp).toEqual({ checked: 1, leads: 1 });
    expect(recorded.map((c) => c.conversationId)).toEqual(["wa-1"]);
    expect(recorded[0].lead?.name).toBe("Priya");
  });

  it("logs a failed Claude call and still keeps the Instagram results", async () => {
    const ask = vi.fn(async () => { throw new Error("Claude API 529: overloaded"); });
    const { d, recorded } = deps({
      "ig-1": { c: cand(), msgs: [m("9876543210")] },
      "wa-1": { c: wa("wa-1"), msgs: [m("fees?")] },
    }, { ask });
    const r = await screenLeads(d);
    expect(r.instagram.leads).toBe(1);
    expect(r.whatsapp).toEqual({ error: "Claude API 529: overloaded" });
    expect(recorded.map((c) => c.conversationId)).toEqual(["ig-1"]);
    expect(d.logger?.error).toHaveBeenCalled();
  });

  it("asks nothing when no WhatsApp chat is waiting", async () => {
    const ask = vi.fn();
    const { d } = deps({}, { ask });
    expect((await screenLeads(d)).whatsapp).toEqual({ checked: 0, leads: 0 });
    expect(ask).not.toHaveBeenCalled();
  });
});
