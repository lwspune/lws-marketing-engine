import type { Captions, Platform } from "./types";

// Platform limits we check before anything is sent, so a bad caption fails at approval time
// instead of half-way through publishing.
export const LIMITS = {
  instagramChars: 2200,
  instagramHashtags: 30,
  instagramMentions: 20,
  facebookChars: 63206,
  youtubeTitleChars: 100,
  youtubeDescriptionBytes: 5000,
} as const;

const charCount = (s: string) => Array.from(s).length;
const fmt = (n: number) => n.toLocaleString("en-US");
// A hashtag/mention starts a word: "#tag" or "@user", not the "@" inside an email address.
const HASHTAG = /(^|\s)#[\p{L}\p{N}_]+/gu;
const MENTION = /(^|\s)@[\p{L}\p{N}._]+/gu;
const ANGLE = /[<>]/;

/** The text actually posted to Instagram or Facebook. A blank Facebook caption reuses Instagram's. */
export function effectiveCaption(platform: "instagram" | "facebook", captions: Captions): string {
  if (platform === "facebook" && captions.facebook?.trim()) return captions.facebook;
  if (platform === "facebook") return captions.instagram?.trim() ? captions.instagram : "";
  return captions.instagram ?? "";
}

export function captionErrors(platform: Platform, captions: Captions): string[] {
  if (platform === "instagram") {
    const text = captions.instagram ?? "";
    if (!text.trim()) return ["Instagram caption is empty"];
    const errors: string[] = [];
    if (charCount(text) > LIMITS.instagramChars) errors.push(`Instagram caption is over ${fmt(LIMITS.instagramChars)} characters`);
    if ((text.match(HASHTAG) ?? []).length > LIMITS.instagramHashtags) errors.push(`Instagram allows at most ${LIMITS.instagramHashtags} hashtags`);
    if ((text.match(MENTION) ?? []).length > LIMITS.instagramMentions) errors.push(`Instagram allows at most ${LIMITS.instagramMentions} @mentions`);
    return errors;
  }

  if (platform === "facebook") {
    const text = effectiveCaption("facebook", captions);
    if (!text.trim()) return ["Facebook caption is empty"];
    return charCount(text) > LIMITS.facebookChars ? [`Facebook caption is over ${fmt(LIMITS.facebookChars)} characters`] : [];
  }

  const yt = captions.youtube;
  if (!yt || !yt.title.trim()) return ["YouTube title is empty"];
  const errors: string[] = [];
  if (charCount(yt.title) > LIMITS.youtubeTitleChars) errors.push(`YouTube title is over ${LIMITS.youtubeTitleChars} characters`);
  if (ANGLE.test(yt.title) || ANGLE.test(yt.description)) errors.push("YouTube title and description can't contain < or >");
  if (new TextEncoder().encode(yt.description).length > LIMITS.youtubeDescriptionBytes) {
    errors.push(`YouTube description is over ${fmt(LIMITS.youtubeDescriptionBytes)} bytes`);
  }
  return errors;
}
