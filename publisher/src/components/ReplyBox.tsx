"use client";

import { useId, useState, useTransition } from "react";
import { sendReply } from "@/app/inbox/actions";

/** Reply to one Instagram, Messenger or WhatsApp chat. Closed (with the reason) once the platform's 24-hour window has passed. */
export function ReplyBox({ conversationId, open, maxLength, contact, channel }: {
  conversationId: string; open: boolean; maxLength: number; contact: string; channel: "instagram" | "facebook" | "whatsapp";
}) {
  const app = channel === "whatsapp" ? "WhatsApp" : channel === "facebook" ? "Messenger" : "Instagram";
  const id = useId();
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <p className="card p-4 text-sm text-muted" role="note">
        {channel === "whatsapp"
          ? "WhatsApp only allows replies within 24 hours of their last message; after that, approved templates only (not in GoPost yet)."
          : channel === "facebook"
            ? "Messenger only allows replies from here within 24 hours of their last message. Reply from Meta Business Suite instead."
            : "Instagram only allows replies from here within 24 hours of their last message. Reply from the Instagram app instead."}
      </p>
    );
  }
  return (
    <form
      className="card space-y-3 p-4"
      aria-label={`Reply to ${contact}`}
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          setMsg(null);
          const r = await sendReply({ conversationId, text });
          if (r.ok) setText("");
          setMsg(r.ok ? { ok: true, text: "Sent." } : { ok: false, text: r.error.message });
        });
      }}
    >
      <label htmlFor={id} className="label">Reply on {app}</label>
      <textarea id={id} className="field min-h-[96px] resize-y" maxLength={maxLength} required value={text}
        onChange={(e) => setText(e.target.value)} placeholder="Write your reply…" />
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={pending || !text.trim()}>{pending ? "Sending…" : "Send"}</button>
        <span className="text-xs text-muted tabular-nums">{text.length}/{maxLength}</span>
        {msg && <span role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-accent" : "text-danger"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}
