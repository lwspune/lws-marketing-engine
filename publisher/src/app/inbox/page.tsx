import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { memberAccess } from "@/lib/supabase/access";
import { Nav, PageHeader } from "@/components/Nav";
import { AutoReplyBox } from "@/components/AutoReplyBox";
import { WhatsAppConnectBox } from "@/components/WhatsAppConnectBox";
import { attachmentLabel, contactLabel, LEAD_LABEL, MAX_REPLY, needsReply, type LeadStatus } from "@/lib/domain/inbox";
import { pickInstagramAccount, type InstagramAccount } from "@/lib/domain/accounts";

export const dynamic = "force-dynamic";

const VIEWS = [
  { id: "reply", label: "Needs reply" },
  { id: "leads", label: "Leads" },
  { id: "all", label: "All" },
] as const;
type ViewId = (typeof VIEWS)[number]["id"];

interface Row {
  id: string; account_id: string; channel: string; contact_id: string; contact_name: string | null; contact_username: string | null; status: LeadStatus;
  source: string; last_message_at: string; last_incoming_at: string | null; last_outgoing_at: string | null; preview: string;
}

const WHEN = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
const previewText = (p: string) => p.match(/^\[([a-z_]+)\]$/) ? attachmentLabel(p.slice(1, -1)) : p;

export default async function InboxPage({ searchParams }: { searchParams: { account?: string; view?: string } }) {
  const supabase = createSupabaseServerClient();
  const access = await memberAccess(supabase);
  if (!access.inbox) redirect("/");
  const view: ViewId = (VIEWS.find((v) => v.id === searchParams.view)?.id ?? "reply") as ViewId;

  // Instagram accounts, WhatsApp numbers and Facebook Pages whose inbox is on (0025), one chip each. Pages come last,
  // so the first Instagram account stays the default.
  const { data: accountRows } = await supabase.from("connected_accounts").select("id, platform, display_name, created_at, inbox")
    .in("platform", ["instagram", "whatsapp", "facebook"]);
  const chip = (a: { id: string; platform: string; display_name: string; created_at: string }): InstagramAccount => ({
    id: a.id, createdAt: a.created_at,
    displayName: a.platform === "whatsapp" ? `WhatsApp ${a.display_name}` : a.platform === "facebook" ? `Facebook ${a.display_name}` : a.display_name,
  });
  const listed = (accountRows ?? []).filter((a) => a.platform !== "facebook" || a.inbox);
  const pages = listed.filter((a) => a.platform === "facebook").map(chip);
  const others = listed.filter((a) => a.platform !== "facebook").map(chip);
  const byAge = (list: InstagramAccount[]) => [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const accounts = [...byAge(others), ...byAge(pages)];
  const account = accounts.find((a) => a.id === searchParams.account) ?? pickInstagramAccount(others, undefined) ?? accounts[0] ?? null;
  const isInstagram = listed.find((a) => a.id === account?.id)?.platform === "instagram";
  // RLS: owners only, for both. Fetched together (one round trip each).
  const [{ data: autoReply }, { data }] = await Promise.all([
    account && isInstagram
      ? supabase.from("auto_replies").select("enabled, body").eq("account_id", account.id).maybeSingle()
      : { data: null },
    account
      ? supabase.from("conversations")
        .select("id, account_id, channel, contact_id, contact_name, contact_username, status, source, last_message_at, last_incoming_at, last_outgoing_at, preview")
        .eq("account_id", account.id).order("last_message_at", { ascending: false }).limit(500)
      : { data: [] },
  ]);
  const all = (data ?? []) as Row[];
  const rows = all.filter((r) => view === "all" || (view === "reply" ? needsReply(r) && r.status !== "not_lead" : ["interested", "booked", "bought"].includes(r.status)));
  const waiting = all.filter((r) => needsReply(r) && r.status !== "not_lead").length;

  const qs = (next: { account?: string; view?: ViewId }) => {
    const p = new URLSearchParams();
    const a = next.account ?? account?.id, v = next.view ?? view;
    if (a && accounts.length > 1) p.set("account", a);
    if (v !== "reply") p.set("view", v);
    const s = p.toString();
    return s ? `/inbox?${s}` : "/inbox";
  };

  return (
    <>
      <Nav current="inbox" ads={access.ads} inbox />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8">
        <PageHeader title="Inbox">Instagram, Facebook and WhatsApp messages, in one place. Only owners can see this page.</PageHeader>

        {accounts.length > 1 && (
          <nav aria-label="Account" className="mb-4 flex flex-wrap gap-2">
            {accounts.map((a) => (
              <Link key={a.id} href={qs({ account: a.id })} aria-current={account?.id === a.id ? "page" : undefined}
                className={`chip py-1 ${account?.id === a.id ? "chip-accent" : "chip-muted hover:text-fg"}`}>{a.displayName}</Link>
            ))}
          </nav>
        )}

        {account && isInstagram && (
          <AutoReplyBox key={account.id} accountId={account.id} enabled={autoReply?.enabled ?? false} text={autoReply?.body ?? ""} maxLength={MAX_REPLY} />
        )}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">{waiting === 0 ? "Nobody is waiting for a reply." : `${waiting} waiting for a reply.`}</p>
          <nav aria-label="Filter chats" className="seg">
            {VIEWS.map((v) => (
              <Link key={v.id} href={qs({ view: v.id })} aria-current={view === v.id ? "page" : undefined} className="seg-item">{v.label}</Link>
            ))}
          </nav>
        </div>

        {all.length === 0 ? (
          <section className="card space-y-2 p-4 sm:p-6">
            <p className="text-sm">No messages yet.</p>
            <p className="text-sm text-muted">
              New messages appear here as they arrive, once messaging is switched on for this account
              (publisher/SETUP.md → Inbox).
            </p>
          </section>
        ) : rows.length === 0 ? (
          <p className="card p-4 text-sm text-muted sm:p-6">Nothing here. Try another filter.</p>
        ) : (
          <ul className="card divide-y divide-line overflow-hidden" aria-label={`${rows.length} chats`}>
            {rows.map((r) => {
              const name = contactLabel(r), waitingOn = needsReply(r);
              const ours = !!r.last_outgoing_at && r.last_outgoing_at === r.last_message_at;
              return (
                <li key={r.id}>
                  <Link href={`/inbox/${r.id}`} className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-white/[0.03] focus-visible:bg-white/[0.03]"
                    aria-label={`Chat with ${name}${waitingOn ? ", waiting for your reply" : ""}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{name}</span>
                      {waitingOn && r.status !== "not_lead" && <span className="chip chip-warn">Needs reply</span>}
                      {r.status !== "new" && <span className={`chip ${r.status === "not_lead" ? "chip-muted" : "chip-accent"}`}>{LEAD_LABEL[r.status]}</span>}
                      {r.source === "ad" && <span className="chip chip-muted">From an ad</span>}
                      {r.source === "story" && <span className="chip chip-muted">Story reply</span>}
                      <span className="ml-auto text-xs text-muted tabular-nums">{WHEN.format(new Date(r.last_message_at))}</span>
                    </div>
                    <p className="truncate text-sm text-muted">{ours ? "You: " : ""}{previewText(r.preview) || "(message deleted after 12 months)"}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <WhatsAppConnectBox appId={process.env.META_APP_ID ?? ""} configId={process.env.META_WA_SIGNUP_CONFIG_ID ?? ""}
          version={process.env.META_GRAPH_VERSION || "v24.0"} />
      </main>
    </>
  );
}
