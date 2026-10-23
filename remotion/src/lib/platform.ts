// Which platform a render is for. House rule (reels/lwspune-insta.md): the end card says
// "Follow for more" on Instagram and "Subscribe for more" on YouTube; nothing else changes.
// Render the YouTube copy with `--props=props/youtube.json` → ../reels/<slug>-yt.mp4.

export type Platform = 'instagram' | 'youtube';

/** An end-card line as it should read on this platform. */
export function endLineFor(text: string, platform: Platform = 'instagram'): string {
  return platform === 'youtube' ? text.replace(/^Follow for /, 'Subscribe for ') : text;
}
