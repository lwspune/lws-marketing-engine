import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseManifest } from "@/lib/domain/manifest";
import { captionErrors } from "@/lib/domain/captions";
import { supportedPlatforms } from "@/lib/domain/workflow";

// Guards the real content in ../reels: every post manifest must parse, point at files that exist,
// and have captions that pass each platform's rules, so a bad post fails here, not at approval time.

const REELS = path.resolve(__dirname, "../../../reels");
const manifests = existsSync(REELS) ? readdirSync(REELS).filter((f) => f.endsWith(".post.json")) : [];

describe.skipIf(manifests.length === 0)("reels/*.post.json", () => {
  it.each(manifests)("%s is valid and complete", (file) => {
    const m = parseManifest(JSON.parse(readFileSync(path.join(REELS, file), "utf8")));
    for (const name of [m.video, m.cover, ...(m.slides ?? [])].filter((x): x is string => !!x)) {
      expect(existsSync(path.join(REELS, name)), `${file} → ${name}`).toBe(true);
    }
    for (const p of supportedPlatforms(m.kind)) {
      const hasCaption = p === "youtube" ? !!m.captions.youtube : !!(m.captions.instagram || m.captions.facebook);
      if (hasCaption) expect(captionErrors(p, m.captions), `${file} → ${p}`).toEqual([]);
    }
  });
});

// The same guard for @pyqvault_'s maths question stories (../stories/pyqvault/<week>/), made by stories/render.mjs.
const STORIES = path.resolve(__dirname, "../../../stories/pyqvault");
const storyManifests = existsSync(STORIES)
  ? readdirSync(STORIES).flatMap((w) => (existsSync(path.join(STORIES, w)) && !w.includes(".")
    ? readdirSync(path.join(STORIES, w)).filter((f) => f.endsWith(".post.json")).map((f) => path.join(w, f)) : []))
  : [];

describe.skipIf(storyManifests.length === 0)("stories/pyqvault/*/*.post.json", () => {
  it.each(storyManifests)("%s is a valid question story with its card", (file) => {
    const m = parseManifest(JSON.parse(readFileSync(path.join(STORIES, file), "utf8")));
    expect(m.kind).toBe("story");
    expect(m.project).toBe("pyqvault-insta");
    expect(existsSync(path.join(STORIES, path.dirname(file), m.cover!)), `${file} → ${m.cover}`).toBe(true);
  });
});
