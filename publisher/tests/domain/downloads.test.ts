import { describe, expect, it } from "vitest";
import { downloadPaths, mediaDownloads } from "@/lib/domain/downloads";

// Founder, 2026-10-30: "add option to download from gopost. i will download from chrome/safari on mobile phone": a reel
// that needs Instagram's own audio ("Use audio") is posted by hand from the phone, so its file has to get there.
const reel = { video_path: "org/post/nda-poem-001-atal-raho.mp4", cover_path: "org/post/nda-poem-001-atal-raho-cover.png", slide_paths: null };
const carousel = { video_path: null, cover_path: null, slide_paths: ["org/p2/sm-c01-1.jpg", "org/p2/sm-c01-2.jpg"] };

describe("downloadPaths", () => {
  it("lists every stored file of the posts on screen, once", () => {
    expect(downloadPaths([reel, carousel, reel])).toEqual([reel.video_path, reel.cover_path, ...carousel.slide_paths]);
  });
  it("skips posts with no files", () => {
    expect(downloadPaths([{ video_path: null, cover_path: null, slide_paths: [] }])).toEqual([]);
  });
});

describe("mediaDownloads", () => {
  const links = new Map([
    [reel.video_path, "https://x/video?download="],
    [reel.cover_path, "https://x/cover?download="],
    [carousel.slide_paths[0], "https://x/s1?download="],
    [carousel.slide_paths[1], "https://x/s2?download="],
  ]);

  it("a reel: the video first, then its cover, each saved under its own file name", () => {
    expect(mediaDownloads(reel, links)).toEqual([
      { label: "Download video", file: "nda-poem-001-atal-raho.mp4", url: "https://x/video?download=" },
      { label: "Download cover", file: "nda-poem-001-atal-raho-cover.png", url: "https://x/cover?download=" },
    ]);
  });

  it("a carousel: every slide, numbered", () => {
    expect(mediaDownloads(carousel, links).map((d) => [d.label, d.file])).toEqual([
      ["Download slide 1", "sm-c01-1.jpg"],
      ["Download slide 2", "sm-c01-2.jpg"],
    ]);
  });

  it("leaves out a file whose link couldn't be made", () => {
    expect(mediaDownloads(reel, new Map([[reel.video_path, "https://x/video"]])).map((d) => d.label)).toEqual(["Download video"]);
  });
});
