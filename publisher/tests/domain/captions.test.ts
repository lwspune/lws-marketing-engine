import { describe, expect, it } from "vitest";
import { captionErrors, effectiveCaption, LIMITS } from "@/lib/domain/captions";

describe("captionErrors — instagram", () => {
  it("accepts a normal caption", () => {
    expect(captionErrors("instagram", { instagram: "NDA 2026 Q74 #NDA #NDAMaths" })).toEqual([]);
  });

  it("rejects a missing or blank caption", () => {
    expect(captionErrors("instagram", {})).toEqual(["Instagram caption is empty"]);
    expect(captionErrors("instagram", { instagram: "   \n " })).toEqual(["Instagram caption is empty"]);
  });

  it("counts characters, not UTF-16 units (emoji count once)", () => {
    const atLimit = "😀".repeat(LIMITS.instagramChars);
    expect(captionErrors("instagram", { instagram: atLimit })).toEqual([]);
    expect(captionErrors("instagram", { instagram: atLimit + "x" })[0]).toMatch(/2,200 characters/);
  });

  it("rejects more than 30 hashtags", () => {
    const tags = (n: number) => Array.from({ length: n }, (_, i) => `#tag${i}`).join(" ");
    expect(captionErrors("instagram", { instagram: tags(30) })).toEqual([]);
    expect(captionErrors("instagram", { instagram: tags(31) })[0]).toMatch(/30 hashtags/);
  });

  it("rejects more than 20 @mentions", () => {
    const mentions = (n: number) => Array.from({ length: n }, (_, i) => `@user${i}`).join(" ");
    expect(captionErrors("instagram", { instagram: mentions(20) })).toEqual([]);
    expect(captionErrors("instagram", { instagram: mentions(21) })[0]).toMatch(/20 @mentions/);
  });

  it("does not count email addresses as mentions", () => {
    const emails = Array.from({ length: 25 }, (_, i) => `a${i}@lws.in`).join(" ");
    expect(captionErrors("instagram", { instagram: emails })).toEqual([]);
  });
});

describe("captionErrors — facebook", () => {
  it("accepts a normal caption", () => {
    expect(captionErrors("facebook", { facebook: "Solve it in 10 seconds" })).toEqual([]);
  });

  it("falls back to the Instagram caption when its own is blank", () => {
    expect(captionErrors("facebook", { facebook: "  ", instagram: "IG text" })).toEqual([]);
  });

  it("rejects when both are blank", () => {
    expect(captionErrors("facebook", { facebook: "" })).toEqual(["Facebook caption is empty"]);
  });
});

describe("effectiveCaption", () => {
  it("is the platform's own caption, Facebook falling back to Instagram when blank", () => {
    expect(effectiveCaption("instagram", { instagram: "IG" })).toBe("IG");
    expect(effectiveCaption("facebook", { facebook: "FB", instagram: "IG" })).toBe("FB");
    expect(effectiveCaption("facebook", { facebook: " ", instagram: "IG" })).toBe("IG");
    expect(effectiveCaption("facebook", {})).toBe("");
  });
});

describe("captionErrors — youtube", () => {
  const ok = { title: "NDA 2026 Maths PYQ: 10-second integral #shorts", description: "Practise free at pyqvault.com" };

  it("accepts a valid title + description", () => {
    expect(captionErrors("youtube", { youtube: ok })).toEqual([]);
  });

  it("rejects a missing youtube block or blank title", () => {
    expect(captionErrors("youtube", {})).toEqual(["YouTube title is empty"]);
    expect(captionErrors("youtube", { youtube: { ...ok, title: "  " } })).toEqual(["YouTube title is empty"]);
  });

  it("caps the title at 100 characters", () => {
    expect(captionErrors("youtube", { youtube: { ...ok, title: "x".repeat(100) } })).toEqual([]);
    expect(captionErrors("youtube", { youtube: { ...ok, title: "x".repeat(101) } })[0]).toMatch(/100 characters/);
  });

  it("rejects angle brackets, which YouTube refuses", () => {
    expect(captionErrors("youtube", { youtube: { ...ok, title: "a < b" } })[0]).toMatch(/< or >/);
    expect(captionErrors("youtube", { youtube: { ...ok, description: "x > y" } })[0]).toMatch(/< or >/);
  });

  it("caps the description at 5000 bytes (multi-byte characters count more)", () => {
    expect(captionErrors("youtube", { youtube: { ...ok, description: "x".repeat(5000) } })).toEqual([]);
    expect(captionErrors("youtube", { youtube: { ...ok, description: "θ".repeat(2501) } })[0]).toMatch(/5,000 bytes/);
  });
});
