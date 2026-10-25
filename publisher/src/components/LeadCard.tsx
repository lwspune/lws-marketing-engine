"use client";

import Link from "next/link";
import { useId, useState, useTransition } from "react";
import { removeLead, updateLead } from "@/app/leads/actions";

/**
 * One lead: who, how to reach them, course, class, when and where from. Owners can correct the name, course and class,
 * or remove it. `whatsapp` (wa.me link, from the server) starts a chat for a lead with no chat in GoPost, such as a
 * website form entry.
 */
export function LeadCard({ lead, phone, date, whatsapp }: {
  lead: { id: string; name: string | null; contact: string; course: string | null; class_level: string | null; source: string; conversationId: string | null };
  phone: string | null; date: string; whatsapp: string | null;
}) {
  const id = useId();
  const [saved, setSaved] = useState({ name: lead.name ?? "", course: lead.course ?? "", classLevel: lead.class_level ?? "" });
  const [draft, setDraft] = useState(saved);
  const [editing, setEditing] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (removed) return null;
  const who = saved.name || "No name yet";

  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`font-medium ${saved.name ? "" : "text-muted"}`}>{who}</span>
        {saved.course && <span className="chip chip-accent">{saved.course}</span>}
        {saved.classLevel && <span className="chip chip-muted">Class {saved.classLevel}</span>}
        <span className="ml-auto text-xs text-muted tabular-nums">{date}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <a className="link tabular-nums" href={phone ? `tel:${lead.contact}` : `mailto:${lead.contact}`}>{phone ?? lead.contact}</a>
        <span className="text-muted">{lead.source}</span>
        <span className="ml-auto flex gap-3">
          {lead.conversationId
            ? <Link className="link" href={`/inbox/${lead.conversationId}`}>Open chat</Link>
            : whatsapp && (
              <a className="link" href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`Message ${who} on WhatsApp (opens WhatsApp)`}>
                WhatsApp
              </a>
            )}
          {!editing && (
            <button type="button" className="link" onClick={() => { setDraft(saved); setError(null); setEditing(true); }}
              aria-label={`Edit ${who}`}>Edit</button>
          )}
        </span>
      </div>

      {editing && (
        <form className="mt-3 grid gap-3 sm:grid-cols-[1fr_10rem_7rem_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              setError(null);
              const r = await updateLead({ leadId: lead.id, name: draft.name, course: draft.course, classLevel: draft.classLevel });
              if (!r.ok) return setError(r.error.message);
              setSaved({ name: draft.name.trim(), course: draft.course.trim(), classLevel: draft.classLevel.trim() });
              setEditing(false);
            });
          }}>
          <div>
            <label htmlFor={`${id}-name`} className="label">Name</label>
            <input id={`${id}-name`} className="field" maxLength={200} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div>
            <label htmlFor={`${id}-course`} className="label">Course</label>
            <input id={`${id}-course`} className="field" maxLength={80} value={draft.course} placeholder="e.g. NDA"
              onChange={(e) => setDraft({ ...draft, course: e.target.value })} />
          </div>
          <div>
            <label htmlFor={`${id}-class`} className="label">Class</label>
            <input id={`${id}-class`} className="field" maxLength={20} value={draft.classLevel} placeholder="e.g. 11"
              onChange={(e) => setDraft({ ...draft, classLevel: e.target.value })} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
            <button type="button" className="btn" disabled={pending} onClick={() => setEditing(false)}>Cancel</button>
            <button type="button" className="btn btn-danger" disabled={pending}
              onClick={() => {
                if (!window.confirm(`Remove ${who} from leads? Their chat will be marked "Not a lead".`)) return;
                start(async () => {
                  setError(null);
                  const r = await removeLead({ leadId: lead.id });
                  if (r.ok) setRemoved(true); else setError(r.error.message);
                });
              }}>Not a lead</button>
          </div>
        </form>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </li>
  );
}
