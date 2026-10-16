"use client";

import { useState, useTransition } from "react";
import { approveAd, launchAd, pauseAd, rejectAd, retryAd } from "@/app/ads/actions";
import { draftActions, type AdSpec, type DraftStatus } from "@/lib/domain/ads";
import type { Result } from "@/lib/publishing/result";

export interface AdDraftView {
  id: string; title: string; status: DraftStatus; spec: AdSpec; imageUrl: string | null; projectName: string;
  error: string | null; rejectReason: string | null; adsManagerUrl: string; launchedAt: string | null;
}

const IST = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const ist = (iso: string) => `${IST.format(new Date(iso))} IST`;

const STATUS: Record<DraftStatus, { label: string; cls: string }> = {
  ready: { label: "Ready to approve", cls: "border-line text-muted" },
  approved: { label: "Creating on Meta…", cls: "border-warn/60 text-warn" },
  failed: { label: "Couldn't create", cls: "border-danger/60 text-danger" },
  created: { label: "Created, paused", cls: "border-warn/60 text-warn" },
  live: { label: "Running", cls: "border-accent/60 text-accent" },
  paused: { label: "Paused", cls: "border-line text-muted" },
  rejected: { label: "Rejected", cls: "border-line text-muted" },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[9rem_1fr]">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="min-w-0 whitespace-pre-line break-words text-sm">{children}</dd>
    </div>
  );
}

export function AdDraftCard({ ad }: { ad: AdDraftView }) {
  const s = ad.spec;
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmLaunch, setConfirmLaunch] = useState(false);
  const [pending, start] = useTransition();
  const actions = draftActions(ad.status);
  const days = Math.round((Date.parse(s.end) - Date.parse(s.start)) / 86_400_000);

  const run = (fn: () => Promise<Result<{ status: string }>>, okText: string) => start(async () => {
    setMessage(null);
    const r = await fn();
    setMessage(r.ok ? { kind: "ok", text: okText } : { kind: "err", text: r.error.message });
  });

  return (
    <article className="space-y-3 rounded-lg border border-line bg-panel p-4" aria-labelledby={`ad-${ad.id}`}>
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 id={`ad-${ad.id}`} className="break-words font-medium">{ad.title}</h2>
          <p className="text-xs text-muted">{ad.projectName}</p>
        </div>
        <span className={`chip ${STATUS[ad.status].cls}`}>{STATUS[ad.status].label}</span>
      </header>

      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        {ad.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed URL from private storage
          <img src={ad.imageUrl} alt={`Poster for ${ad.title}`} className="w-40 rounded-md border border-line" />
        ) : <div className="h-48 w-40 rounded-md border border-line" aria-hidden />}
        <dl className="space-y-2">
          <Row label="Budget">₹{s.dailyBudgetInr}/day · {days} days · up to ₹{(s.dailyBudgetInr * days).toLocaleString("en-IN")}</Row>
          <Row label="Runs">{ist(s.start)} → {ist(s.end)}</Row>
          <Row label="Who sees it">Ages {s.audience.ageMin}–{s.audience.ageMax}, living within {s.audience.radiusKm} km of {s.audience.place ?? `${s.audience.latitude}, ${s.audience.longitude}`}</Row>
          <Row label="Names">{s.campaign} › {s.adset} › {s.ad}</Row>
          <Row label="Headline">{s.headline}</Row>
          <Row label="Text">{s.primaryText}</Row>
          {s.description && <Row label="Description">{s.description}</Row>}
          <Row label="WhatsApp">+{s.whatsapp.phone}{"\n"}Greeting: {s.whatsapp.greeting}{"\n"}They send: {s.whatsapp.prefilled}</Row>
          <Row label="Meta's AI">Off: poster and text run exactly as written{s.music ? " (music on)" : ""}. Multi-advertiser ads off.</Row>
        </dl>
      </div>

      {ad.status === "failed" && ad.error && <p role="alert" className="text-sm text-danger">{ad.error}</p>}
      {ad.status === "rejected" && ad.rejectReason && <p className="text-sm text-muted">Reason: {ad.rejectReason}</p>}
      {ad.launchedAt && <p className="text-xs text-muted">First launched {ist(ad.launchedAt)}</p>}

      {["created", "live", "paused"].includes(ad.status) && (
        <p className="text-sm">
          <a href={ad.adsManagerUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline">
            Check the preview in Ads Manager
          </a>{" "}
          <span className="text-muted">(opens a new tab)</span>
        </p>
      )}

      {actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {actions.includes("approve") && (
            <button type="button" className="btn btn-primary" disabled={pending}
              onClick={() => run(() => approveAd(ad.id), "Created on Meta, paused. Check the preview, then Launch.")}>
              {pending ? "Creating on Meta…" : "Approve (creates it paused)"}
            </button>
          )}
          {actions.includes("retry") && (
            <button type="button" className="btn" disabled={pending}
              onClick={() => run(() => retryAd(ad.id), "Created on Meta, paused. Check the preview, then Launch.")}>
              {pending ? "Retrying…" : "Retry"}
            </button>
          )}
          {actions.includes("launch") && !confirmLaunch && (
            <button type="button" className="btn btn-primary" disabled={pending} onClick={() => setConfirmLaunch(true)}>
              {ad.status === "paused" ? "Resume" : "Launch"}
            </button>
          )}
          {actions.includes("launch") && confirmLaunch && (
            <div role="group" aria-label="Confirm launch" className="flex flex-wrap items-center gap-2">
              <span className="text-sm">Start spending up to ₹{s.dailyBudgetInr}/day?</span>
              <button type="button" className="btn btn-primary" disabled={pending}
                onClick={() => run(() => launchAd(ad.id), "Switched on. Meta reviews it first (usually a few hours).")}>
                {pending ? "Switching on…" : "Yes, start"}
              </button>
              <button type="button" className="btn" disabled={pending} onClick={() => setConfirmLaunch(false)}>Cancel</button>
            </div>
          )}
          {actions.includes("pause") && (
            <button type="button" className="btn btn-danger" disabled={pending}
              onClick={() => run(() => pauseAd(ad.id), "Paused. Nothing more is spent until you resume.")}>
              {pending ? "Pausing…" : "Pause"}
            </button>
          )}
          {actions.includes("reject") && !rejecting && (
            <button type="button" className="btn" disabled={pending} onClick={() => setRejecting(true)}>Reject</button>
          )}
        </div>
      )}

      {rejecting && (
        <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => {
          e.preventDefault();
          run(() => rejectAd(ad.id, reason), "Rejected.");
          setRejecting(false);
        }}>
          <div className="min-w-0 flex-1">
            <label htmlFor={`reason-${ad.id}`} className="label">Why? (optional)</label>
            <input id={`reason-${ad.id}`} className="field" maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-danger" disabled={pending}>Reject</button>
          <button type="button" className="btn" onClick={() => setRejecting(false)}>Cancel</button>
        </form>
      )}

      {/* a failed create is already shown above as the card's saved error; don't repeat it */}
      {message && !(message.kind === "err" && message.text === ad.error) && <p role={message.kind === "ok" ? "status" : "alert"} className={`text-sm ${message.kind === "ok" ? "text-accent" : "text-danger"}`}>{message.text}</p>}
    </article>
  );
}
