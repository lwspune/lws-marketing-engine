import { afterEach, describe, expect, it } from "vitest";
import { startFakeMeta } from "../helpers/fakeMeta";
import { fetchInstagramConversations, fetchInstagramProfile, sendInstagramText } from "@/lib/platforms/metaMessages";
import { MetaApiError } from "@/lib/platforms/meta";

// Instagram messaging over the Graph API with the stored Page token (instagram_manage_messages).

let fake: Awaited<ReturnType<typeof startFakeMeta>> | undefined;
afterEach(async () => { await fake?.close(); fake = undefined; });

describe("sendInstagramText", () => {
  it("sends a text reply to the person and returns Meta's message id", async () => {
    fake = await startFakeMeta();
    const mid = await sendInstagramText(fake.config, { token: "T", recipientId: "9001", text: "Syllabus PDF is in our bio link" });
    expect(mid).toBe("mid.sent1");
    const call = fake.calls.find((c) => c.method === "POST" && c.path.endsWith("/me/messages"))!;
    expect(JSON.parse(call.params.recipient)).toEqual({ id: "9001" });
    expect(JSON.parse(call.params.message)).toEqual({ text: "Syllabus PDF is in our bio link" });
  });

  it("raises Meta's reason when it refuses (e.g. outside the 24-hour window), without the token", async () => {
    const token = "EAAG-secret-token-0123456789";
    fake = await startFakeMeta({ failOn: { path: /\/me\/messages$/, status: 400, message: `This message is sent outside of allowed window. ${token}` } });
    const err = await sendInstagramText(fake.config, { token, recipientId: "9001", text: "hi" }).catch((e) => e);
    expect(err).toBeInstanceOf(MetaApiError);
    expect(err.message).toMatch(/outside of allowed window/);
    expect(err.message).not.toContain(token);
  });
});

describe("fetchInstagramProfile", () => {
  it("reads the person's name and username", async () => {
    fake = await startFakeMeta();
    expect(await fetchInstagramProfile(fake.config, { token: "T", contactId: "9001" })).toEqual({ name: "Rahul S", username: "rahul_07" });
  });
});

describe("fetchInstagramConversations", () => {
  const conv = (id: string, contact: string, msgs: [string, "in" | "out", string, string][]) => ({
    id, updated_time: "2026-10-18T10:00:00+0000",
    messages: { data: msgs.map(([mid, dir, text, at]) => ({
      id: mid, created_time: at, message: text,
      from: dir === "in" ? { id: contact, username: `user_${contact}` } : { id: "ig1", username: "lws.pune" },
      to: { data: [dir === "in" ? { id: "ig1", username: "lws.pune" } : { id: contact, username: `user_${contact}` }] },
    })) },
  });

  it("lists every page of conversations and turns their recent messages into rows, with usernames", async () => {
    fake = await startFakeMeta({
      igConversations: [
        conv("c1", "9001", [["m2", "out", "Yes, ₹499", "2026-10-18T10:00:00+0000"], ["m1", "in", "Fees?", "2026-10-18T09:00:00+0000"]]),
        conv("c2", "9002", [["m3", "in", "", "2026-10-17T09:00:00+0000"]]),
        conv("c3", "9003", [["m4", "in", "Hello", "2026-10-16T09:00:00+0000"]]),
      ],
      igConversationsPageSize: 2,
    });
    const out = await fetchInstagramConversations(fake.config, { token: "T", igUserId: "ig1" });
    expect(out.rows).toEqual([
      { contact_id: "9001", mid: "m2", direction: "out", body: "Yes, ₹499", attachment: null, sent_at: "2026-10-18T10:00:00.000Z", source: "direct", ad_id: null, deleted: false },
      { contact_id: "9001", mid: "m1", direction: "in", body: "Fees?", attachment: null, sent_at: "2026-10-18T09:00:00.000Z", source: "direct", ad_id: null, deleted: false },
      { contact_id: "9002", mid: "m3", direction: "in", body: "", attachment: "other", sent_at: "2026-10-17T09:00:00.000Z", source: "direct", ad_id: null, deleted: false },
      { contact_id: "9003", mid: "m4", direction: "in", body: "Hello", attachment: null, sent_at: "2026-10-16T09:00:00.000Z", source: "direct", ad_id: null, deleted: false },
    ]);
    expect(out.usernames).toEqual({ "9001": "user_9001", "9002": "user_9002", "9003": "user_9003" });
    const lists = fake.calls.filter((c) => c.path.endsWith("/me/conversations"));
    expect(lists).toHaveLength(2);
    expect(lists[0].params.platform).toBe("instagram");
  });

  it("stops at the conversation cap", async () => {
    fake = await startFakeMeta({
      igConversations: Array.from({ length: 5 }, (_, i) => conv(`c${i}`, `90${i}`, [[`m${i}`, "in", "x", "2026-10-16T09:00:00+0000"]])),
      igConversationsPageSize: 2,
    });
    const out = await fetchInstagramConversations(fake.config, { token: "T", igUserId: "ig1", maxConversations: 3 });
    expect(new Set(out.rows.map((r) => r.contact_id)).size).toBe(3);
  });
});
