"use client";

import { useState, useTransition } from "react";
import { setLeadStatus } from "@/app/inbox/actions";

/** One tap marks how far a chat got. Options come from the server (LEAD_STATUSES), so labels live in one place. */
export function LeadStatusPicker({ conversationId, status, options }: {
  conversationId: string; status: string; options: { value: string; label: string }[];
}) {
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-2">
      <div role="group" aria-label="Lead status" className="seg flex-wrap">
        {options.map((o) => (
          <button key={o.value} type="button" aria-pressed={current === o.value} disabled={pending}
            className="seg-item disabled:opacity-60"
            onClick={() => {
              if (o.value === current) return;
              const before = current;
              setCurrent(o.value);
              setError(null);
              start(async () => {
                const r = await setLeadStatus({ conversationId, status: o.value });
                if (!r.ok) { setCurrent(before); setError(r.error.message); }
              });
            }}>
            {o.label}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );
}
