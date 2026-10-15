"use client";

import { useState, useTransition } from "react";
import { approveReadyStories } from "@/app/actions";

/** The weekly routine in one click: approve every ready daily story whose day hasn't passed. */
export function ApproveStoriesButton({ count, projectId }: { count: number; projectId: string | null }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const approveAll = () =>
    start(async () => {
      const r = await approveReadyStories({ projectId });
      if (!r.ok) return setMessage({ kind: "err", text: r.error.message });
      const { approved, skipped } = r.data;
      setMessage({
        kind: skipped.length ? "err" : "ok",
        text: `Approved ${approved} ${approved === 1 ? "story" : "stories"}.${skipped.length ? ` Not approved: ${skipped.join("; ")}` : ""}`,
      });
    });

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-panel p-3">
      <p className="text-sm">{count} daily {count === 1 ? "story is" : "stories are"} waiting. Check the cards below, then:</p>
      <button type="button" className="btn btn-primary" disabled={pending} onClick={approveAll}>
        Approve all {count} {count === 1 ? "story" : "stories"}
      </button>
      {message && (
        <p role={message.kind === "err" ? "alert" : "status"} className={`w-full text-sm ${message.kind === "err" ? "text-danger" : "text-accent"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
