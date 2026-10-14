"use client";

import { useMemo, useState, useTransition } from "react";
import { approvePost, rejectPost, retryPublication, saveCaptions, unapprovePost } from "@/app/actions";
import { captionErrors } from "@/lib/domain/captions";
import { supportedPlatforms } from "@/lib/domain/workflow";
import { PLATFORM_LABEL, type Captions, type Platform, type PostKind } from "@/lib/domain/types";
import type { Result } from "@/lib/publishing/result";

export interface PostView {
  id: string; title: string; slug: string; kind: PostKind; status: string; captions: Captions;
  scheduledAt: string | null; rejectReason: string | null; projectName: string;
  videoUrl: string | null; coverUrl: string | null; slideUrls: string[];
  channels: { platform: Platform; name: string }[];
  publications: { id: string; platform: Platform; status: string; scheduledAt: string | null; attempts: number; permalink: string | null; error: string | null; publishedAt: string | null }[];
}

const IST = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
const when = (iso: string | null) => (iso ? `${IST.format(new Date(iso))} IST` : "");

const STATUS_STYLE: Record<string, string> = {
  ready: "border-line text-muted", approved: "border-warn/60 text-warn", pending: "border-warn/60 text-warn",
  processing: "border-warn/60 text-warn", published: "border-accent/60 text-accent", partially_published: "border-warn/60 text-warn",
  failed: "border-danger/60 text-danger", rejected: "border-line text-muted",
};
const STATUS_LABEL: Record<string, string> = {
  ready: "Ready", approved: "Approved", pending: "Waiting", processing: "Uploading", published: "Live",
  partially_published: "Partly live", failed: "Failed", rejected: "Rejected",
};

export function PostCard({ post }: { post: PostView }) {
  const ready = post.status === "ready";
  const usable = useMemo(
    () => post.channels.filter((c) => supportedPlatforms(post.kind).includes(c.platform)),
    [post.channels, post.kind],
  );
  const [captions, setCaptions] = useState<Captions>(post.captions);
  const [platforms, setPlatforms] = useState<Platform[]>(usable.map((c) => c.platform));
  const [mode, setMode] = useState<"now" | "later">("now");
  const [at, setAt] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, start] = useTransition();

  const dirty = JSON.stringify(captions) !== JSON.stringify(post.captions);
  const problems = platforms.flatMap((p) => captionErrors(p, captions));

  const run = (fn: () => Promise<Result<unknown>>, success: string) =>
    start(async () => {
      const r = await fn();
      setMessage(r.ok ? { kind: "ok", text: success } : { kind: "err", text: r.error.message });
    });

  const approve = () => {
    const scheduledAt = mode === "later" && at ? new Date(at).toISOString() : null;
    if (mode === "later" && !at) return setMessage({ kind: "err", text: "Pick a date and time, or choose Publish now." });
    run(async () => {
      if (dirty) {
        const saved = await saveCaptions({ postId: post.id, captions });
        if (!saved.ok) return saved;
      }
      return approvePost({ postId: post.id, platforms, scheduledAt });
    }, scheduledAt ? "Approved and scheduled." : "Approved. Publishing within a minute.");
  };

  const toggle = (p: Platform) => setPlatforms((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  const allPending = post.publications.every((p) => p.status === "pending");

  return (
    <article className="overflow-hidden rounded-lg border border-line bg-panel" aria-labelledby={`t-${post.id}`}>
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <div className="w-full shrink-0 sm:w-48">
          {post.kind === "reel" && post.videoUrl ? (
            <video src={post.videoUrl} poster={post.coverUrl ?? undefined} controls preload="metadata" playsInline
              className="aspect-[9/16] w-full rounded-md bg-black" aria-label={`Preview of ${post.title}`} />
          ) : post.slideUrls.length ? (
            <div className="flex snap-x gap-2 overflow-x-auto" role="list" aria-label="Slides">
              {post.slideUrls.map((u, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={u} src={u} alt={`Slide ${i + 1} of ${post.slideUrls.length}`} role="listitem"
                  className="aspect-[4/5] w-40 shrink-0 snap-start rounded-md object-cover sm:w-full" />
              ))}
            </div>
          ) : (
            <div className="flex aspect-[9/16] items-center justify-center rounded-md bg-bg text-xs text-muted">No preview</div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`chip ${STATUS_STYLE[post.status] ?? "border-line"}`}>{STATUS_LABEL[post.status] ?? post.status}</span>
              <span className="chip border-line text-muted">{post.kind}</span>
              {post.projectName && <span className="text-xs text-muted">{post.projectName}</span>}
            </div>
            <h2 id={`t-${post.id}`} className="mt-1 font-medium">{post.title}</h2>
            {post.scheduledAt && post.status === "approved" && <p className="text-xs text-warn">Scheduled for {when(post.scheduledAt)}</p>}
            {post.rejectReason && <p className="text-xs text-muted">Rejected: {post.rejectReason}</p>}
          </div>

          {ready ? (
            <>
              <CaptionFields kind={post.kind} captions={captions} onChange={setCaptions} id={post.id} />

              <fieldset>
                <legend className="label">Publish to</legend>
                {usable.length === 0 ? (
                  <p className="text-sm text-danger">No accounts are connected for this project yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {usable.map((c) => (
                      <label key={c.platform} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={platforms.includes(c.platform)} onChange={() => toggle(c.platform)}
                          className="h-4 w-4 accent-[#4fd1a5]" />
                        {PLATFORM_LABEL[c.platform]} <span className="text-muted">({c.name})</span>
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>

              <fieldset>
                <legend className="label">When</legend>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <label className="flex items-center gap-2"><input type="radio" name={`when-${post.id}`} checked={mode === "now"} onChange={() => setMode("now")} className="accent-[#4fd1a5]" />Publish now</label>
                  <label className="flex items-center gap-2"><input type="radio" name={`when-${post.id}`} checked={mode === "later"} onChange={() => setMode("later")} className="accent-[#4fd1a5]" />Schedule</label>
                  {mode === "later" && (
                    <input type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} className="field w-auto"
                      aria-label="Publish date and time (your time zone)" />
                  )}
                </div>
              </fieldset>

              {problems.length > 0 && (
                <ul className="space-y-1 text-sm text-danger" aria-live="polite">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
              )}

              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary" onClick={approve}
                  disabled={pending || platforms.length === 0 || problems.length > 0}>
                  {mode === "later" ? "Approve & schedule" : "Approve & publish"}
                </button>
                {dirty && (
                  <button type="button" className="btn" disabled={pending}
                    onClick={() => run(() => saveCaptions({ postId: post.id, captions }), "Captions saved.")}>Save captions</button>
                )}
                {!rejecting ? (
                  <button type="button" className="btn btn-danger" disabled={pending} onClick={() => setRejecting(true)}>Reject</button>
                ) : (
                  <div className="flex w-full flex-wrap items-center gap-2">
                    <label htmlFor={`r-${post.id}`} className="sr-only">Reason (optional)</label>
                    <input id={`r-${post.id}`} className="field flex-1" placeholder="Reason (optional)" value={reason} maxLength={500}
                      onChange={(e) => setReason(e.target.value)} />
                    <button type="button" className="btn btn-danger" disabled={pending}
                      onClick={() => run(() => rejectPost({ postId: post.id, reason: reason || undefined }), "Rejected.")}>Confirm reject</button>
                    <button type="button" className="btn" onClick={() => setRejecting(false)}>Cancel</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <CaptionPreview captions={post.captions} />
              {post.publications.length > 0 && (
                <ul className="space-y-2" aria-label="Platforms">
                  {post.publications.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="w-20 text-muted">{PLATFORM_LABEL[p.platform]}</span>
                      <span className={`chip ${STATUS_STYLE[p.status] ?? "border-line"}`}>{STATUS_LABEL[p.status] ?? p.status}</span>
                      {p.permalink && <a href={p.permalink} target="_blank" rel="noopener noreferrer" className="text-accent underline">Open</a>}
                      {p.publishedAt && <span className="text-xs text-muted">{when(p.publishedAt)}</span>}
                      {p.status === "failed" && p.attempts < 3 && (
                        <button type="button" className="btn px-2 py-1 text-xs" disabled={pending}
                          onClick={() => run(() => retryPublication({ publicationId: p.id }), "Retrying within a minute.")}>Retry</button>
                      )}
                      {p.error && <p className="w-full text-xs text-danger">{p.error}</p>}
                    </li>
                  ))}
                </ul>
              )}
              {post.status === "approved" && allPending && (
                <button type="button" className="btn" disabled={pending}
                  onClick={() => run(() => unapprovePost({ postId: post.id }), "Moved back to Ready.")}>Take back (not started yet)</button>
              )}
            </>
          )}

          {message && (
            <p role={message.kind === "err" ? "alert" : "status"} className={`text-sm ${message.kind === "err" ? "text-danger" : "text-accent"}`}>{message.text}</p>
          )}
        </div>
      </div>
    </article>
  );
}

function CaptionFields({ kind, captions, onChange, id }: { kind: PostKind; captions: Captions; onChange: (c: Captions) => void; id: string }) {
  const yt = captions.youtube ?? { title: "", description: "" };
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={`ig-${id}`} className="label">Instagram caption <span className="normal-case">({Array.from(captions.instagram ?? "").length}/2,200)</span></label>
        <textarea id={`ig-${id}`} rows={5} className="field font-mono" value={captions.instagram ?? ""}
          onChange={(e) => onChange({ ...captions, instagram: e.target.value })} />
      </div>
      {kind === "reel" && (
        <>
          <div>
            <label htmlFor={`fb-${id}`} className="label">Facebook caption</label>
            <textarea id={`fb-${id}`} rows={3} className="field font-mono" value={captions.facebook ?? ""}
              placeholder="Leave empty to reuse the Instagram caption"
              onChange={(e) => onChange({ ...captions, facebook: e.target.value })} />
          </div>
          <div>
            <label htmlFor={`ytt-${id}`} className="label">YouTube title <span className="normal-case">({Array.from(yt.title).length}/100)</span></label>
            <input id={`ytt-${id}`} className="field" value={yt.title} onChange={(e) => onChange({ ...captions, youtube: { ...yt, title: e.target.value } })} />
            <label htmlFor={`ytd-${id}`} className="label mt-2">YouTube description</label>
            <textarea id={`ytd-${id}`} rows={3} className="field font-mono" value={yt.description}
              onChange={(e) => onChange({ ...captions, youtube: { ...yt, description: e.target.value } })} />
          </div>
        </>
      )}
    </div>
  );
}

function CaptionPreview({ captions }: { captions: Captions }) {
  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-muted">Captions</summary>
      <pre className="mt-2 whitespace-pre-wrap break-words rounded-md bg-bg p-3 font-mono text-xs">{captions.instagram ?? captions.facebook ?? ""}</pre>
    </details>
  );
}
