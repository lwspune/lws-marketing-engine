"use client";

import { useId, useState, useTransition } from "react";
import { saveAdOutcome } from "@/app/insights/actions";

/** This week's bookings for one campaign, copied from the WhatsApp labels. */
export function AdOutcomeForm(props: {
  accountId: string; campaignId: string; campaignName: string; weekStart: string; booked: number; leads: number;
}) {
  const id = useId();
  const [booked, setBooked] = useState(String(props.booked));
  const [leads, setLeads] = useState(String(props.leads));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const week = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${props.weekStart}T00:00:00Z`));

  return (
    <form
      className="flex flex-wrap items-end gap-3 border-t border-line pt-4"
      aria-label={`Bookings this week for ${props.campaignName}`}
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          setMsg(null);
          const r = await saveAdOutcome({
            accountId: props.accountId, campaignId: props.campaignId, weekStart: props.weekStart,
            booked: Number(booked), leads: Number(leads),
          });
          setMsg(r.ok ? { ok: true, text: "Saved." } : { ok: false, text: r.error.message });
        });
      }}
    >
      <p className="w-full text-xs text-muted">This week (from Mon {week}), from your WhatsApp labels:</p>
      <div>
        <label htmlFor={`${id}-b`} className="label">Tests booked</label>
        <input id={`${id}-b`} className="field w-24" type="number" min={0} max={10000} inputMode="numeric" required
          value={booked} onChange={(e) => setBooked(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${id}-l`} className="label">NDA leads</label>
        <input id={`${id}-l`} className="field w-24" type="number" min={0} max={10000} inputMode="numeric" required
          value={leads} onChange={(e) => setLeads(e.target.value)} />
      </div>
      <button type="submit" className="btn" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
      {msg && <span role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-accent" : "text-danger"}`}>{msg.text}</span>}
    </form>
  );
}
