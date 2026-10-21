import { describe, expect, it } from "vitest";
import {
  findContact, formatPhone, guessCourse, instagramLead, leadsCsv, parseScreening, sourceLabel, transcript, whatsappContact,
  type ChatMessage,
} from "@/lib/domain/leads";

// One leads list (founder, 2026-10-21): name, contact, course, date, source. Instagram chats become leads when the
// person shares a phone number or email; WhatsApp chats when Claude judges them genuine (migration 0016).

const msg = (body: string, over: Partial<ChatMessage> = {}): ChatMessage => ({ direction: "in", body, sent_at: "2026-10-20T08:00:00Z", ...over });

describe("findContact", () => {
  it("finds an Indian mobile number however it is written, as +91 and ten digits", () => {
    for (const text of ["9876543210", "my no 98765 43210", "+91 98765-43210", "call 09876543210 sir", "919876543210", "+91-9876543210."]) {
      expect(findContact(text), text).toBe("+919876543210");
    }
  });

  it("finds an email, in lower case", () => {
    expect(findContact("mail me at Rahul.S07@Gmail.com pls")).toBe("rahul.s07@gmail.com");
  });

  it("ignores numbers that aren't a mobile: years, roll numbers, prices, landline-length digits", () => {
    for (const text of ["NDA 2 2026", "roll no 2345678", "fees ₹45000?", "5876543210", "Q74 of 2019 paper", "1234567890123"]) {
      expect(findContact(text), text).toBeNull();
    }
  });

  it("ignores our own numbers when someone quotes them back", () => {
    expect(findContact("is 7620699213 your number?")).toBeNull();
    expect(findContact("I called 91563 10546")).toBeNull();
  });
});

describe("instagramLead", () => {
  it("takes the first contact the person shared, with the time they shared it", () => {
    const lead = instagramLead([
      msg("Sir fees?", { sent_at: "2026-10-18T08:00:00Z" }),
      msg("Call me on 9876543210", { sent_at: "2026-10-19T09:30:00Z" }),
      msg("or 9123456789", { sent_at: "2026-10-20T09:30:00Z" }),
    ]);
    expect(lead).toEqual({ contact: "+919876543210", at: "2026-10-19T09:30:00Z" });
  });

  it("never counts a number we sent", () => {
    expect(instagramLead([msg("Call us on 9876543210", { direction: "out" }), msg("ok")])).toBeNull();
  });
});

describe("guessCourse", () => {
  it("names the course the person mentioned first", () => {
    expect(guessCourse([msg("Sir SPI ka mock test kab hai?"), msg("NDA bhi")])).toBe("SPI");
    expect(guessCourse([msg("nda maths coaching?")])).toBe("NDA");
    expect(guessCourse([msg("CDS 2027")])).toBe("CDS");
  });

  it("only reads what they wrote, and leaves it empty when nothing matches", () => {
    expect(guessCourse([msg("NDA batch starts Monday", { direction: "out" }), msg("ok sir")])).toBeNull();
    expect(guessCourse([msg("spinach")])).toBeNull();
  });
});

describe("whatsappContact and formatPhone", () => {
  it("turns a WhatsApp id into +digits, and refuses anything that isn't a phone number", () => {
    expect(whatsappContact("919876543210")).toBe("+919876543210");
    expect(whatsappContact("abc")).toBeNull();
    expect(whatsappContact("12")).toBeNull();
  });

  it("shows Indian numbers the way people write them", () => {
    expect(formatPhone("+919876543210")).toBe("+91 98765 43210");
    expect(formatPhone("+447700900123")).toBe("+447700900123");
    expect(formatPhone("a@b.co")).toBe("a@b.co");
  });
});

describe("sourceLabel", () => {
  it("names the channel and the account, and says when the chat came from an ad", () => {
    expect(sourceLabel({ channel: "instagram", account: "@lws.pune", fromAd: false })).toBe("Instagram @lws.pune");
    expect(sourceLabel({ channel: "instagram", account: "@lws.pune", fromAd: true })).toBe("Instagram @lws.pune (ad)");
    expect(sourceLabel({ channel: "whatsapp", account: "+91 76206 99213", fromAd: false })).toBe("WhatsApp +91 76206 99213");
  });
});

describe("transcript", () => {
  it("labels who spoke, removes phone numbers and emails, and keeps only the latest messages", () => {
    const t = transcript([
      msg("old message", { sent_at: "2026-10-01T08:00:00Z" }),
      msg("I am Priya, my son wants NDA coaching. Call 9876543210 or priya@x.com", { sent_at: "2026-10-19T08:00:00Z" }),
      msg("Sure, fees are ₹45,000", { direction: "out", sent_at: "2026-10-19T09:00:00Z" }),
    ], 2);
    expect(t).toBe("Them: I am Priya, my son wants NDA coaching. Call [phone] or [email]\nUs: Sure, fees are ₹45,000");
  });

  it("shows attachments by type and cuts very long messages", () => {
    const t = transcript([msg("", { attachment: "audio" }), msg("x".repeat(900))]);
    expect(t.split("\n")[0]).toBe("Them: [Voice note]");
    expect(t.split("\n")[1].length).toBeLessThanOrEqual(6 + 500 + 1);
  });
});

describe("parseScreening", () => {
  const ids = ["c1", "c2"];
  it("keeps one verdict per chat we asked about, trimmed and capped", () => {
    const v = parseScreening({
      chats: [
        { id: "c1", genuine: true, reason: " Parent asking NDA fees for son ", name: " Priya ", course: "NDA" },
        { id: "c2", genuine: false, reason: "Existing student's parent replying to attendance", name: null, course: null },
        { id: "zz", genuine: true, reason: "not asked", name: null, course: null },
      ],
    }, ids);
    expect(v.get("c1")).toEqual({ genuine: true, reason: "Parent asking NDA fees for son", name: "Priya", course: "NDA" });
    expect(v.get("c2")).toMatchObject({ genuine: false, name: null, course: null });
    expect(v.has("zz")).toBe(false);
  });

  it("drops malformed entries, so those chats are simply checked again next time", () => {
    const v = parseScreening({ chats: [{ id: "c1", genuine: "yes" }, { id: "c2", genuine: true, reason: "ok", name: "", course: "" }] }, ids);
    expect(v.has("c1")).toBe(false);
    expect(v.get("c2")).toEqual({ genuine: true, reason: "ok", name: null, course: null });
    expect(parseScreening(null, ids).size).toBe(0);
  });
});

describe("leadsCsv", () => {
  it("writes the five columns for Excel: India dates, phones Excel keeps as text, quotes where needed", () => {
    const csv = leadsCsv([
      { name: "Priya, Pune", contact: "+919876543210", course: "NDA", lead_at: "2026-10-19T20:00:00Z", source: "WhatsApp +91 76206 99213" },
      { name: null, contact: "a@b.co", course: null, lead_at: "2026-10-20T08:00:00Z", source: "Instagram @lws.pune" },
    ]);
    expect(csv).toBe(
      "﻿Name,Contact,Course,Date,Source\r\n" +
      "\"Priya, Pune\",98765 43210,NDA,2026-10-20,WhatsApp +91 76206 99213\r\n" +
      ",a@b.co,,2026-10-20,Instagram @lws.pune\r\n",
    );
  });

  it("never lets a cell start a spreadsheet formula", () => {
    const csv = leadsCsv([{ name: "=HYPERLINK(\"x\")", contact: "+447700900123", course: "@x", lead_at: "2026-10-20T08:00:00Z", source: "s" }]);
    expect(csv.split("\r\n")[1]).toBe("\"'=HYPERLINK(\"\"x\"\")\",'+447700900123,'@x,2026-10-20,s");
  });
});
