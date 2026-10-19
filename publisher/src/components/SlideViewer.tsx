"use client";

import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { slideStepForKey, stepSlide, swipeStep } from "@/lib/domain/queue";

/**
 * A carousel preview: one slide at a time with ‹ › buttons, arrow keys and swipe. Tapping the slide
 * opens it full screen (a native <dialog>: Esc closes it and focus stays inside while it's open).
 */
export function SlideViewer({ urls, title }: { urls: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const n = urls.length;
  const go = (delta: number) => setIndex((i) => stepSlide(i, n, delta));

  const onKey = (e: KeyboardEvent) => {
    const step = slideStepForKey(e.key);
    if (step) { e.preventDefault(); go(step); }
  };
  const swipe = {
    onTouchStart: (e: TouchEvent) => { touchX.current = e.touches[0]?.clientX ?? null; },
    onTouchEnd: (e: TouchEvent) => {
      const start = touchX.current, end = e.changedTouches[0]?.clientX;
      touchX.current = null;
      if (start !== null && end !== undefined) go(swipeStep(end - start));
    },
  };

  const controls = (big: boolean) => (
    <div className="flex items-center justify-between gap-2">
      <button type="button" className={`btn aria-disabled:cursor-not-allowed aria-disabled:opacity-40 ${big ? "px-5 py-2.5 text-lg" : "px-4 text-base"}`} onClick={() => go(-1)}
        aria-disabled={index === 0} aria-label="Previous slide">‹</button>
      <span className={`tabular-nums text-muted ${big ? "text-base" : "text-sm"}`} aria-live="polite">{index + 1} / {n}</span>
      <button type="button" className={`btn aria-disabled:cursor-not-allowed aria-disabled:opacity-40 ${big ? "px-5 py-2.5 text-lg" : "px-4 text-base"}`} onClick={() => go(1)}
        aria-disabled={index === n - 1} aria-label="Next slide">›</button>
    </div>
  );

  return (
    <div role="region" aria-roledescription="carousel" aria-label={`Slides of ${title}`} onKeyDown={onKey} className="space-y-2">
      <button type="button" onClick={() => dialog.current?.showModal()} {...swipe}
        className="block w-full rounded-xl" aria-label={`Slide ${index + 1} of ${n}. Open full size`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urls[index]} alt="" className="aspect-[4/5] w-full rounded-xl border border-line object-cover" />
      </button>
      {controls(false)}
      <p className="text-center text-xs text-muted">Tap the slide to see it full size</p>

      <dialog ref={dialog} aria-label={`${title}: slide ${index + 1} of ${n}`}
        className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-black p-0 text-fg backdrop:bg-black">
        <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-3 p-3 sm:p-6">
          <div className="flex w-full justify-end">
            <button type="button" className="btn" onClick={() => dialog.current?.close()} aria-label="Close full-size view">✕ Close</button>
          </div>
          <div className="flex min-h-0 w-full flex-1 items-center justify-center" {...swipe}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={urls[index]} alt={`Slide ${index + 1} of ${n}`} className="max-h-full max-w-full rounded-xl object-contain" />
          </div>
          <div className="w-full max-w-sm">{controls(true)}</div>
        </div>
      </dialog>
    </div>
  );
}
