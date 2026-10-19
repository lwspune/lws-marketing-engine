"use client";

import { useId, useState, useTransition } from "react";
import { saveAutoReply } from "@/app/inbox/actions";

/** One Instagram account's automatic reply to people who message from an ad: on/off plus the text. */
export function AutoReplyBox({ accountId, enabled, text, maxLength }: { accountId: string; enabled: boolean; text: string; maxLength: number }) {
  const id = useId();
  const [on, setOn] = useState(enabled);
  const [draft, setDraft] = useState(text);
  const [saved, setSaved] = useState({ on: enabled, text });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const changed = on !== saved.on || draft.trim() !== saved.text;

  return (
    <details className="card mb-4 text-sm" open={!saved.text}>
      <summary className="flex cursor-pointer select-none flex-wrap items-center gap-2 rounded-xl px-4 py-3 hover:text-fg">
        <span className="font-medium">Auto-reply to ad chats</span>
        <span className={`chip ${saved.on ? "chip-accent" : "chip-muted"}`}>{saved.on ? "On" : "Off"}</span>
        {saved.on && <span className="min-w-0 flex-1 truncate text-muted">“{saved.text}”</span>}
      </summary>
      <form
        className="space-y-3 border-t border-line p-4"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            setMsg(null);
            const r = await saveAutoReply({ accountId, enabled: on, text: draft });
            if (r.ok) setSaved({ on, text: draft.trim() });
            setMsg(r.ok ? { ok: true, text: "Saved." } : { ok: false, text: r.error.message });
          });
        }}
      >
        <p className="text-muted">
          Someone who messages from an ad gets this reply within seconds, once. Never after you have replied to them.
        </p>
        <label className="flex w-fit cursor-pointer items-center gap-2">
          <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="h-4 w-4 accent-[#4fd1a5]" />
          Send it automatically
        </label>
        <div className="space-y-1">
          <label htmlFor={id} className="label">Reply</label>
          <textarea id={id} className="field min-h-[72px] resize-y" maxLength={maxLength} required value={draft}
            onChange={(e) => setDraft(e.target.value)} placeholder="Please share your contact. Our counsellor will reach out to you." />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn btn-primary" disabled={pending || !changed || !draft.trim()}>{pending ? "Saving…" : "Save"}</button>
          <span className="text-xs text-muted tabular-nums">{draft.length}/{maxLength}</span>
          {msg && <span role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-accent" : "text-danger"}`}>{msg.text}</span>}
        </div>
      </form>
    </details>
  );
}
