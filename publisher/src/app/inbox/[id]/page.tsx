import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { memberAccess } from "@/lib/supabase/access";
import { Nav } from "@/components/Nav";
import { ReplyBox } from "@/components/ReplyBox";
import { LeadStatusPicker } from "@/components/LeadStatusPicker";
import { attachmentLabel, canReply, contactLabel, LEAD_LABEL, LEAD_STATUSES, MAX_REPLY } from "@/lib/domain/inbox";

export const dynamic = "force-dynamic";

const WHEN = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const access = await memberAccess(supabase);
  if (!access.inbox) redirect("/");
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  // RLS: only owners get the row back.
  const { data: c } = await supabase.from("conversations")
    .select("id, account_id, channel, contact_id, contact_name, contact_username, status, source, last_incoming_at, first_message_at")
    .eq("id", params.id).maybeSingle();
  if (!c) notFound();
  const [{ data: msgs }, { data: account }] = await Promise.all([
    supabase.from("messages").select("id, direction, body, attachment, sent_at").eq("conversation_id", c.id)
      .order("sent_at", { ascending: false }).limit(200),
    supabase.from("connected_accounts").select("display_name").eq("id", c.account_id).maybeSingle(),
  ]);
  const messages = [...(msgs ?? [])].reverse();
  const name = contactLabel(c);

  return (
    <>
      <Nav current="inbox" ads={access.ads} inbox />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        <Link href="/inbox" className="link text-sm">← Inbox</Link>
        <div className="mb-6 mt-3">
          <h1 className="page-title break-words">{name}</h1>
          <p className="page-sub">
            {c.channel === "whatsapp" && c.contact_name ? `+${c.contact_id} · ` : ""}
            {c.contact_username && c.contact_name ? `@${c.contact_username} · ` : ""}
            {c.channel === "whatsapp" ? "WhatsApp " : c.channel === "facebook" ? "Facebook " : ""}{account?.display_name ?? "Instagram"}
            {c.source === "ad" ? " · started from an ad" : c.source === "story" ? " · started as a story reply" : ""}
            {c.channel === "instagram" && c.contact_username && (
              <> · <a className="link" href={`https://www.instagram.com/${encodeURIComponent(c.contact_username)}/`} target="_blank" rel="noopener noreferrer"
                aria-label={`Open ${name}'s Instagram profile`}>Profile</a></>
            )}
          </p>
        </div>

        <section aria-labelledby="lead" className="mb-6 space-y-2">
          <h2 id="lead" className="label">How far did this chat get?</h2>
          <LeadStatusPicker conversationId={c.id} status={c.status}
            options={LEAD_STATUSES.map((s) => ({ value: s, label: LEAD_LABEL[s] }))} />
        </section>

        <section aria-label="Messages" className="card mb-6 space-y-3 p-4">
          {messages.length === 0 && <p className="text-sm text-muted">Messages older than 12 months are deleted.</p>}
          <ol className="space-y-3">
            {messages.map((m) => {
              const out = m.direction === "out";
              return (
                <li key={m.id} className={`flex ${out ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl border px-3 py-2 text-sm ${out ? "border-accent/30 bg-accent/10" : "border-line bg-raised"}`}>
                    <span className="sr-only">{out ? "You" : name}: </span>
                    {m.attachment && <p className="text-xs italic text-muted">{attachmentLabel(m.attachment)}</p>}
                    {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                    <p className="mt-1 text-right text-[11px] text-muted tabular-nums">{WHEN.format(new Date(m.sent_at))}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <ReplyBox conversationId={c.id} open={canReply(c.last_incoming_at, new Date())} maxLength={MAX_REPLY} contact={name}
          channel={c.channel === "whatsapp" || c.channel === "facebook" ? c.channel : "instagram"} />
      </main>
    </>
  );
}
