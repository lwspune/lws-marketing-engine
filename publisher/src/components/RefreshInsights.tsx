"use client";

import { useState, useTransition } from "react";
import { refreshInsights } from "@/app/insights/actions";

export function RefreshInsights({ label = "Refresh now" }: { label?: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className="btn" disabled={pending}
        onClick={() => start(async () => {
          setMsg(null);
          const r = await refreshInsights();
          setMsg(r.ok ? { ok: true, text: `Updated ${r.data.reels} reels.` } : { ok: false, text: r.error.message });
        })}>
        {pending ? "Reading Instagram… (about 20 s)" : label}
      </button>
      {msg && <span role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-accent" : "text-danger"}`}>{msg.text}</span>}
    </div>
  );
}
