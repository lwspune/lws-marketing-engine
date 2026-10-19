import { describe, expect, it } from "vitest";
import { adStarts, checkAutoReplyText, type InboxRow } from "@/lib/domain/inbox";

// Auto-reply to ad chats (founder, 2026-10-19): someone who messages from an ad gets the saved reply once.
// Meta marks only some ad messages (2 of 62 on 19 Oct); the rest start with Meta's ready-made ad questions.

const NOW = new Date("2026-10-19T12:00:00Z");
const row = (over: Partial<InboxRow> = {}): InboxRow => ({
  contact_id: "9001", mid: "mid.1", direction: "in", body: "Hi", attachment: null,
  sent_at: "2026-10-19T11:59:00Z", source: "direct", ad_id: null, deleted: false, ...over,
});

describe("adStarts", () => {
  it("picks a message Meta marked as coming from an ad", () => {
    expect(adStarts([row({ source: "ad", ad_id: "120253223204060134", body: "" })], NOW)).toEqual(["9001"]);
  });

  it("picks Meta's ready-made ad questions, whatever the case or spacing", () => {
    for (const body of ["Can I learn more about your business?", "Is anyone available to chat?", "can you tell me more about your ad? ", "  IS ANYONE AVAILABLE TO CHAT"]) {
      expect(adStarts([row({ body })], NOW)).toEqual(["9001"]);
    }
  });

  it("ignores ordinary messages: greetings, questions that merely mention an ad, shared reels, story replies", () => {
    expect(adStarts([
      row({ body: "Hi" }),
      row({ contact_id: "9002", body: "I saw your ad, what are the fees? Can you tell me more about your ad?" }),
      row({ contact_id: "9003", body: "", attachment: "ig_reel" }),
      row({ contact_id: "9004", body: "Is anyone available to chat?", source: "story" }),
    ], NOW)).toEqual([]);
  });

  it("ignores our own messages, unsent ones, and anything older than Instagram's 24-hour reply window", () => {
    expect(adStarts([
      row({ direction: "out", body: "Is anyone available to chat?" }),
      row({ contact_id: "9002", body: "Is anyone available to chat?", deleted: true }),
      row({ contact_id: "9003", body: "Is anyone available to chat?", sent_at: "2026-10-18T11:00:00Z" }),
    ], NOW)).toEqual([]);
  });

  it("names each person once, even when one delivery holds several of their messages", () => {
    expect(adStarts([
      row({ body: "Can I learn more about your business?" }),
      row({ mid: "mid.2", source: "ad", ad_id: "1" }),
      row({ contact_id: "9002", mid: "mid.3", body: "Is anyone available to chat?" }),
    ], NOW)).toEqual(["9001", "9002"]);
  });
});

describe("checkAutoReplyText", () => {
  it("trims the text and accepts up to Instagram's 1,000 characters", () => {
    expect(checkAutoReplyText("  Please share your contact.  ")).toEqual({ ok: true, text: "Please share your contact." });
    expect(checkAutoReplyText("x".repeat(1000))).toEqual({ ok: true, text: "x".repeat(1000) });
  });

  it("refuses an empty or too-long message with a plain reason", () => {
    expect(checkAutoReplyText("   ")).toEqual({ ok: false, message: "Write the reply first." });
    expect(checkAutoReplyText("x".repeat(1001))).toEqual({ ok: false, message: "Replies can be up to 1000 characters." });
  });
});
