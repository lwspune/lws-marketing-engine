import { describe, expect, it } from "vitest";
import { nextSlot, slotsFor, POST_SLOTS } from "@/lib/domain/slots";

// Founder, 2026-10-18: @pyqvault_ posts 3 reels a day at fixed times and the founder only approves or rejects.
// Approving puts a post in the next free slot of its project (times in IST).
// Founder, 2026-10-20: 09:00, 13:00, 18:00 (was 11:00, 17:30, 21:30: the 21:30 reels had the lowest watch time;
// reels/pyqvault-learnings.md L32). Founder, 2026-10-26: one reel a day, 18:00 (each reel now takes longer to make: the review
// panel, F38).
const ist = (s: string) => new Date(`${s}+05:30`);

describe("slotsFor", () => {
  it("has one daily slot for PYQ Vault (@pyqvault_), 18:00, and one for LWS Pune (@lws.pune)", () => {
    expect(slotsFor("pyqvault-insta")).toEqual(["18:00"]);
    expect(slotsFor("pyq-vault")).toEqual(["15:40"]);
  });
  it("has one evening slot for Sound Mind with Shivani (@soundmindwithshivani)", () => {
    expect(slotsFor("soundmind-shivani")).toEqual(["18:00"]);
  });
  it("is empty for a project without slots (ads only)", () => {
    expect(slotsFor("lws-coaching")).toEqual([]);
  });
  it("every slot is a valid HH:MM, in order, with no repeats", () => {
    for (const times of Object.values(POST_SLOTS)) {
      for (const t of times) expect(t).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      expect([...times].sort()).toEqual(times);
      expect(new Set(times).size).toBe(times.length);
    }
  });
});

describe("nextSlot", () => {
  const times = ["11:00", "17:30", "21:30"];
  it("picks today's next slot that is still ahead", () => {
    expect(nextSlot(times, [], ist("2026-10-18T09:00"))).toEqual(ist("2026-10-18T11:00"));
    expect(nextSlot(times, [], ist("2026-10-18T12:00"))).toEqual(ist("2026-10-18T17:30"));
  });
  it("skips slots that are taken", () => {
    const taken = [ist("2026-10-18T11:00"), ist("2026-10-18T17:30")];
    expect(nextSlot(times, taken, ist("2026-10-18T09:00"))).toEqual(ist("2026-10-18T21:30"));
  });
  it("rolls over to tomorrow when today is full or over", () => {
    const taken = ["11:00", "17:30", "21:30"].map((t) => ist(`2026-10-18T${t}`));
    expect(nextSlot(times, taken, ist("2026-10-18T09:00"))).toEqual(ist("2026-10-19T11:00"));
    expect(nextSlot(times, [], ist("2026-10-18T22:00"))).toEqual(ist("2026-10-19T11:00"));
  });
  it("needs a few minutes' lead: a slot starting within 5 minutes is skipped", () => {
    expect(nextSlot(times, [], ist("2026-10-18T10:57"))).toEqual(ist("2026-10-18T17:30"));
  });
  it("works across the IST date line (late evening UTC is next morning IST)", () => {
    expect(nextSlot(["06:00"], [], new Date("2026-10-18T23:00:00Z"))).toEqual(ist("2026-10-19T06:00"));
  });
  it("is null without slots", () => {
    expect(nextSlot([], [], ist("2026-10-18T09:00"))).toBeNull();
  });
});
