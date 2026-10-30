"use client";

import { useMemo, useState, useTransition } from "react";
import { approvePost, approveStory, rejectPost, retryPublication, saveCaptions, unapprovePost } from "@/app/actions";
import { captionErrors } from "@/lib/domain/captions";
import { supportedPlatforms } from "@/lib/domain/workflow";
import { compareToBaseline, LWS_BASELINE, storyErrorText, type PostMetrics, type Verdict } from "@/lib/domain/metrics";
import { PLATFORM_LABEL, type Captions, type Platform, type PostKind } from "@/lib/domain/types";
import type { Result } from "@/lib/publishing/result";
import type { StoryQuestion, StoryQuiz } from "@/lib/domain/story";
import type { Download } from "@/lib/domain/downloads";
import { SlideViewer } from "@/components/SlideViewer";
import { ReelPreview } from "@/components/ReelPreview";

export interface PostView {
  id: string; title: string; slug: string; kind: PostKind; status: string; captions: Captions;
  scheduledAt: string | null; rejectReason: string | null; projectName: string;
  /** Stories only: the time it's meant for and the quiz or question its card shows. */
  plannedFor: string | null; quiz: StoryQuiz | null; question: StoryQuestion | null;
  /** Reels and carousels: the project's next free posting slot, where approving puts it (null: no slots). */
  nextSlotAt: string | null;
  videoUrl: string | null; coverUrl: string | null; slideUrls: string[];
  /** The post's files, signed to save rather than play (domain/downloads.ts). */
  downloads: Download[];
  channels: { platform: Platform; name: string }[];
  publications: {
    id: string; platform: Platform; status: string; scheduledAt: string | null; attempts: number; permalink: string | null;
    error: string | null; publishedAt: string | null; metrics: Snapshot[];
  }[];
}

export interface Snapshot {
  snapshot: string; views: number | null; reach: number | null; saves: number | null; shares: number | null;
  avgWatchMs: number | null; error: string | null;
  replies: number | null; follows: number | null; profileVisits: number | null; exits: number | null;
}

const IST = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
const when = (iso: string | null) => (iso ? `${IST.format(new Date(iso))} IST` : "");

const STATUS_STYLE: Record<string, string> = {
  ready: "chip-muted", approved: "chip-warn", pending: "chip-warn", processing: "chip-warn", published: "chip-accent",
  partially_published: "chip-warn", failed: "chip-danger", rejected: "chip-muted",
};
const STATUS_LABEL: Record<string, string> = {
  ready: "Ready", approved: "Approved", pending: "Waiting", processing: "Uploading", published: "Live",
  partially_published: "Partly live", failed: "Failed", rejected: "Rejected",
};

export function PostCard({ post }: { post: PostView }) {
  const ready = post.status === "ready";
  const story = post.kind === "story";
  const usable = useMemo(
    () => post.channels.filter((c) => supportedPlatforms(post.kind).includes(c.platform)),
    [post.channels, post.kind],
  );
  const [captions, setCaptions] = useState<Captions>(post.captions);
  const [platforms, setPlatforms] = useState<Platform[]>(usable.map((c) => c.platform));
  const [mode, setMode] = useState<"slot" | "now" | "later">(post.nextSlotAt ? "slot" : "now");
  const [at, setAt] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, start] = useTransition();

  const dirty = JSON.stringify(captions) !== JSON.stringify(post.captions);
  const problems = story ? [] : platforms.flatMap((p) => captionErrors(p, captions));

  const run = (fn: () => Promise<Result<unknown>>, success: string) =>
    start(async () => {
      const r = await fn();
      setMessage(r.ok ? { kind: "ok", text: success } : { kind: "err", text: r.error.message });
    });

  const approve = () => {
    if (story) return run(() => approveStory({ postId: post.id }), "Approved. It posts at its time.");
    const scheduledAt = mode === "later" && at ? new Date(at).toISOString() : null;
    if (mode === "later" && !at) return setMessage({ kind: "err", text: "Pick a date and time, or choose Publish now." });
    start(async () => {
      if (dirty) {
        const saved = await saveCaptions({ postId: post.id, captions });
        if (!saved.ok) return setMessage({ kind: "err", text: saved.error.message });
      }
      const r = await approvePost({ postId: post.id, platforms, scheduledAt, slot: mode === "slot" });
      setMessage(!r.ok ? { kind: "err", text: r.error.message }
        : r.data.scheduledAt ? { kind: "ok", text: `Approved. Goes out ${when(r.data.scheduledAt)}.` } : { kind: "ok", text: "Approved. Publishing within a minute." });
    });
  };

  const toggle = (p: Platform) => setPlatforms((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  const allPending = post.publications.every((p) => p.status === "pending");

  return (
    <article className="card overflow-hidden" aria-labelledby={`t-${post.id}`}>
      <div className="flex flex-col gap-5 p-4 sm:flex-row sm:gap-6 sm:p-6">
        <div className={`mx-auto w-full shrink-0 sm:mx-0 ${post.slideUrls.length ? "max-w-[360px] sm:w-72" : "max-w-[240px] sm:w-52"}`}>
          {story && post.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverUrl} alt={`Story card: ${post.quiz?.title ?? post.title}`} loading="lazy" decoding="async"
              className="aspect-[9/16] w-full rounded-xl border border-line object-cover" />
          ) : post.kind === "reel" && post.videoUrl ? (
            <ReelPreview videoUrl={post.videoUrl} coverUrl={post.coverUrl} title={post.title} />
          ) : post.slideUrls.length ? (
            <SlideViewer urls={post.slideUrls} title={post.title} />
          ) : (
            <div className="flex aspect-[9/16] items-center justify-center rounded-xl border border-dashed border-line bg-bg text-xs text-muted">No preview</div>
          )}
          {post.downloads.length > 0 && (
            // The link saves the file (Supabase's download link sends it as an attachment, under the stored name):
            // Android Chrome puts it in Downloads, iPhone Safari in Files (Share → Save Video puts it in Photos).
            <div className="mt-3 flex flex-col gap-2">
              {post.downloads.map((d) => (
                <a key={d.url} href={d.url} download={d.file} className="btn w-full py-1.5 text-xs" aria-label={`${d.label}: ${d.file}`}>
                  <span aria-hidden>⬇</span> {d.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`chip ${STATUS_STYLE[post.status] ?? "chip-muted"}`}>{STATUS_LABEL[post.status] ?? post.status}</span>
              <span className="chip chip-muted capitalize">{post.kind}</span>
              {post.projectName && <span className="text-xs text-muted">{post.projectName}</span>}
            </div>
            <h2 id={`t-${post.id}`} className="text-lg font-semibold leading-snug tracking-tight">{post.title}</h2>
            {post.scheduledAt && post.status === "approved" && <p className="text-sm text-warn">Scheduled for {when(post.scheduledAt)}</p>}
            {story && post.quiz && (
              <p className="text-sm text-muted">
                Quiz: {post.quiz.title}{" "}
                <a href={`https://www.pyqvault.com/quiz/${encodeURIComponent(post.quiz.publicSlug)}`} target="_blank" rel="noopener noreferrer"
                  className="link">Check the quiz<span className="sr-only"> (opens in a new tab)</span></a>
              </p>
            )}
            {story && post.question && (
              <p className="text-sm text-muted">
                {post.question.part === "question" ? "Morning question" : "Evening answer"} · right answer {post.question.answer}
              </p>
            )}
            {post.rejectReason && <p className="text-xs text-muted">Rejected: {post.rejectReason}</p>}
          </div>

          {ready ? (
            <>
              {story ? (
                <p className="tile text-sm">
                  Instagram Story · posts <strong className="font-semibold">{post.plannedFor ? when(post.plannedFor) : "when approved"}</strong>
                  <span className="mt-1 block text-xs text-muted">Approving later on its day posts it straight away; after its day it can only be rejected.</span>
                </p>
              ) : (
                <>
                  <CaptionFields kind={post.kind} captions={captions} onChange={setCaptions} id={post.id} />

                  <fieldset>
                    <legend className="label">Publish to</legend>
                    {usable.length === 0 ? (
                      <p className="text-sm text-danger">No accounts are connected for this project yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {usable.map((c) => (
                          <label key={c.platform} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-raised px-3 py-2 hover:border-white/20 text-sm">
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
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {post.nextSlotAt && (
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-raised px-3 py-2 hover:border-white/20"><input type="radio" name={`when-${post.id}`} checked={mode === "slot"} onChange={() => setMode("slot")} className="accent-[#4fd1a5]" />Next free slot · {when(post.nextSlotAt)}</label>
                      )}
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-raised px-3 py-2 hover:border-white/20"><input type="radio" name={`when-${post.id}`} checked={mode === "now"} onChange={() => setMode("now")} className="accent-[#4fd1a5]" />Publish now</label>
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-raised px-3 py-2 hover:border-white/20"><input type="radio" name={`when-${post.id}`} checked={mode === "later"} onChange={() => setMode("later")} className="accent-[#4fd1a5]" />Schedule</label>
                      {mode === "later" && (
                        <input type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} className="field w-auto"
                          aria-label="Publish date and time (your time zone)" />
                      )}
                    </div>
                  </fieldset>

                </>
              )}

              {problems.length > 0 && (
                <ul className="space-y-1 text-sm text-danger" aria-live="polite">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
              )}

              <div className="flex flex-wrap gap-2 border-t border-line pt-5">
                <button type="button" className="btn btn-primary" onClick={approve}
                  disabled={pending || (!story && (platforms.length === 0 || problems.length > 0))}>
                  {story ? "Approve story" : mode === "now" ? "Approve & publish" : "Approve & schedule"}
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
              {!story && <CaptionPreview captions={post.captions} />}
              {post.publications.length > 0 && (
                <ul className="space-y-2" aria-label="Platforms">
                  {post.publications.map((p) => (
                    <li key={p.id} className="tile flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                      <span className="w-20 font-medium">{PLATFORM_LABEL[p.platform]}</span>
                      <span className={`chip ${STATUS_STYLE[p.status] ?? "chip-muted"}`}>{STATUS_LABEL[p.status] ?? p.status}</span>
                      {p.permalink && <a href={p.permalink} target="_blank" rel="noopener noreferrer" className="link">Open<span className="sr-only"> on {PLATFORM_LABEL[p.platform]} (opens a new tab)</span></a>}
                      {p.publishedAt && <span className="text-xs text-muted">{when(p.publishedAt)}</span>}
                      {p.status === "failed" && p.attempts < 3 && (
                        <button type="button" className="btn px-2 py-1 text-xs" disabled={pending}
                          onClick={() => run(() => retryPublication({ publicationId: p.id }), "Retrying within a minute.")}>Retry</button>
                      )}
                      {p.error && <p className="w-full text-xs text-danger">{p.error}</p>}
                      {p.status === "published" && (story ? <StoryScorecard snapshots={p.metrics} /> : <Scorecard snapshots={p.metrics} />)}
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

const VERDICT: Record<Verdict, { mark: string; cls: string; text: string }> = {
  above: { mark: "▲", cls: "text-accent", text: "above your typical reel" },
  even: { mark: "=", cls: "text-muted", text: "same as your typical reel" },
  below: { mark: "▼", cls: "text-danger", text: "below your typical reel" },
  "n/a": { mark: "", cls: "text-muted", text: "not available" },
};

const n = (x: number | null) => (x === null ? "–" : Number(x).toLocaleString("en-IN"));

/** Latest snapshot (7 days, else 48 hours) against the account's typical reel. */
function Scorecard({ snapshots }: { snapshots: Snapshot[] }) {
  const s = snapshots.find((x) => x.snapshot === "7d") ?? snapshots.find((x) => x.snapshot === "48h");
  if (!s) return <p className="w-full text-xs text-muted">Scorecard appears 48 hours after going live.</p>;
  if (s.error) return <p className="w-full text-xs text-muted">{s.snapshot} stats unavailable: {s.error}</p>;
  const m: PostMetrics = { views: s.views, reach: s.reach, saves: s.saves, shares: s.shares, likes: null, comments: null, avgWatchMs: s.avgWatchMs };
  const v = compareToBaseline(m, LWS_BASELINE);
  return (
    <div className="w-full space-y-2 pt-1">
      <p className="text-xs text-muted">
        After {s.snapshot === "7d" ? "7 days" : "48 h"} · vs typical {LWS_BASELINE.views} views · {LWS_BASELINE.saves} save · {(LWS_BASELINE.avgWatchMs / 1000).toFixed(1)} s
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cell("Views", n(s.views), v.views)}
        {cell("Saves", n(s.saves), v.saves)}
        {cell("Shares", n(s.shares))}
        {cell("Watched", s.avgWatchMs === null ? "–" : `${(s.avgWatchMs / 1000).toFixed(1)} s`, v.avgWatchMs)}
      </div>
    </div>
  );
}

/** A story's one snapshot, saved 23 hours after it went up (Instagram deletes it at 24). */
function StoryScorecard({ snapshots }: { snapshots: Snapshot[] }) {
  const s = snapshots.find((x) => x.snapshot === "23h");
  if (!s) return <p className="w-full text-xs text-muted">Numbers are saved 23 hours after it went up.</p>;
  if (s.error) return <p className="w-full text-xs text-muted">Numbers not saved: {storyErrorText(s.error)}</p>;
  return (
    <div className="w-full space-y-2 pt-1">
      <p className="text-xs text-muted">After 23 h · {n(s.views)} views · {n(s.exits)} tapped out</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cell("Reached", n(s.reach))}
        {cell("Profile visits", n(s.profileVisits))}
        {cell("Follows", n(s.follows))}
        {cell("Replies", n(s.replies))}
      </div>
    </div>
  );
}

function cell(label: string, value: string, verdict?: Verdict) {
  return (
    <div className="rounded-lg bg-bg/60 px-3 py-2">
      <div className="stat-label">{label}</div>
      <div className="mt-0.5 text-base font-semibold tabular-nums">
        {value}
        {verdict && verdict !== "n/a" && (
          <span className={`ml-1 text-xs ${VERDICT[verdict].cls}`} title={VERDICT[verdict].text} aria-label={VERDICT[verdict].text}>{VERDICT[verdict].mark}</span>
        )}
      </div>
    </div>
  );
}

function CaptionPreview({ captions }: { captions: Captions }) {
  return (
    <details className="rounded-xl border border-line bg-raised text-sm">
      <summary className="cursor-pointer select-none rounded-xl px-3 py-2 text-muted hover:text-fg">Captions</summary>
      <pre className="mx-3 mb-3 whitespace-pre-wrap break-words rounded-lg bg-bg p-3 font-mono text-xs">{captions.instagram ?? captions.facebook ?? ""}</pre>
    </details>
  );
}
