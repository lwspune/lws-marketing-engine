import { describe, expect, it } from "vitest";
import { parseManifest } from "@/lib/domain/manifest";
import { DomainError } from "@/lib/domain/types";

const reel = {
  slug: "nda-maths-002-hook",
  project: "lws-pune",
  kind: "reel",
  title: "Q74 hook (10-second countdown)",
  video: "nda-maths-002-hook.mp4",
  cover: "nda-maths-002-hook-cover.png",
  captions: { instagram: "NDA 2026 Q74 #NDA", facebook: "NDA 2026 Q74" },
};

const carousel = {
  slug: "nda-maths-003-carousel",
  project: "lws-pune",
  kind: "carousel",
  title: "Q42 binomial, 4 slides",
  slides: ["s-1.png", "s-2.png", "s-3.png", "s-4.png"],
  captions: { instagram: "NDA 2026 Q42 #NDA" },
};

const story = {
  slug: "maths-q-2026-10-26",
  project: "pyqvault-insta",
  kind: "story",
  title: "Maths question · Mon 26 Oct",
  cover: "maths-q-2026-10-26.jpg",
  plannedFor: "2026-10-26T07:30:00+05:30",
  question: { id: "047abe4b-6c21-47e9-b26e-4d6e74258b74", answer: "D", part: "question" },
  captions: {},
};

function codeOf(fn: () => unknown): string | undefined {
  try { fn(); } catch (e) { return e instanceof DomainError ? e.code : "not-a-domain-error"; }
  return undefined;
}

describe("parseManifest", () => {
  it("accepts a valid reel and a valid carousel", () => {
    expect(parseManifest(reel)).toMatchObject({ slug: "nda-maths-002-hook", kind: "reel" });
    expect(parseManifest(carousel).slides).toHaveLength(4);
  });

  it("requires an .mp4 video for a reel, and no slides", () => {
    expect(codeOf(() => parseManifest({ ...reel, video: undefined }))).toBe("invalid_manifest");
    expect(codeOf(() => parseManifest({ ...reel, video: "clip.mov" }))).toBe("invalid_manifest");
    expect(codeOf(() => parseManifest({ ...reel, slides: ["a.png", "b.png"] }))).toBe("invalid_manifest");
  });

  it("requires 2–10 image slides for a carousel, and no video", () => {
    expect(codeOf(() => parseManifest({ ...carousel, slides: ["only.png"] }))).toBe("invalid_manifest");
    const eleven = Array.from({ length: 11 }, (_, i) => `s${i}.png`);
    expect(codeOf(() => parseManifest({ ...carousel, slides: eleven }))).toBe("invalid_manifest");
    expect(codeOf(() => parseManifest({ ...carousel, slides: ["a.png", "b.gif"] }))).toBe("invalid_manifest");
    expect(codeOf(() => parseManifest({ ...carousel, video: "x.mp4" }))).toBe("invalid_manifest");
  });

  it("accepts a question story: one JPEG card, its morning or evening, and the question it shows", () => {
    const m = parseManifest(story);
    expect(m).toMatchObject({ kind: "story", cover: "maths-q-2026-10-26.jpg", question: { answer: "D", part: "question" } });
    expect(m.plannedFor).toBe("2026-10-26T07:30:00+05:30");
  });

  it("a story needs a JPEG card (Instagram rejects PNG), a time with its offset, and its question", () => {
    expect(codeOf(() => parseManifest({ ...story, cover: undefined }))).toBe("invalid_manifest");
    expect(codeOf(() => parseManifest({ ...story, cover: "card.png" }))).toBe("invalid_manifest");
    expect(codeOf(() => parseManifest({ ...story, plannedFor: undefined }))).toBe("invalid_manifest");
    expect(codeOf(() => parseManifest({ ...story, plannedFor: "2026-10-26T07:30:00" }))).toBe("invalid_manifest");
    expect(codeOf(() => parseManifest({ ...story, question: undefined }))).toBe("invalid_manifest");
  });

  it("a story's question names a real id, an answer A–D and which card it is", () => {
    expect(codeOf(() => parseManifest({ ...story, question: { ...story.question, id: "q1" } }))).toBe("invalid_manifest");
    expect(codeOf(() => parseManifest({ ...story, question: { ...story.question, answer: "E" } }))).toBe("invalid_manifest");
    expect(codeOf(() => parseManifest({ ...story, question: { ...story.question, part: "hint" } }))).toBe("invalid_manifest");
  });

  it("a story has no video, slides or caption", () => {
    expect(codeOf(() => parseManifest({ ...story, video: "x.mp4" }))).toBe("invalid_manifest");
    expect(codeOf(() => parseManifest({ ...story, slides: ["a.jpg", "b.jpg"] }))).toBe("invalid_manifest");
    expect(codeOf(() => parseManifest({ ...story, captions: { instagram: "hello" } }))).toBe("invalid_manifest");
  });

  it("only a story carries a planned time or a question", () => {
    expect(codeOf(() => parseManifest({ ...reel, plannedFor: story.plannedFor }))).toBe("invalid_manifest");
    expect(codeOf(() => parseManifest({ ...carousel, question: story.question }))).toBe("invalid_manifest");
  });

  it("only allows plain file names next to the manifest (no paths)", () => {
    for (const bad of ["../secret.mp4", "C:/x.mp4", "sub/dir.mp4", "a\\b.mp4", "/abs.mp4"]) {
      expect(codeOf(() => parseManifest({ ...reel, video: bad })), bad).toBe("invalid_manifest");
    }
  });

  it("requires lowercase slugs for the post and the project", () => {
    expect(codeOf(() => parseManifest({ ...reel, slug: "Bad Slug" }))).toBe("invalid_manifest");
    expect(codeOf(() => parseManifest({ ...reel, project: "" }))).toBe("invalid_manifest");
  });

  it("names every problem in the error message", () => {
    try {
      parseManifest({ ...reel, slug: "X", video: undefined });
      expect.unreachable();
    } catch (e) {
      expect((e as Error).message).toMatch(/slug/);
      expect((e as Error).message).toMatch(/video/);
    }
  });
});
