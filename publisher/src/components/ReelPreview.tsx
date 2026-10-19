"use client";

import { useState } from "react";

/**
 * A reel's cover with a play button; the video loads only when tapped. A <video poster> downloads its
 * cover (and some video) as soon as the page opens, even far down the list, and the signed links change
 * on every visit, so nothing is cached. Without a cover there is nothing to show, so the video goes in directly.
 */
export function ReelPreview({ videoUrl, coverUrl, title }: { videoUrl: string; coverUrl: string | null; title: string }) {
  const [playing, setPlaying] = useState(!coverUrl);
  const box = "aspect-[9/16] w-full rounded-xl border border-line bg-black";

  if (playing) {
    return (
      <video src={videoUrl} poster={coverUrl ?? undefined} controls autoPlay={!!coverUrl} preload="metadata" playsInline
        className={box} aria-label={`Preview of ${title}`} />
    );
  }
  return (
    <button type="button" onClick={() => setPlaying(true)} className="group relative block w-full rounded-xl" aria-label={`Play preview of ${title}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={coverUrl!} alt="" loading="lazy" decoding="async" className={`${box} object-cover`} />
      <span aria-hidden className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 pl-1 text-2xl text-white transition-transform group-hover:scale-110">▶</span>
      </span>
    </button>
  );
}
