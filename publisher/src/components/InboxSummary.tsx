import Link from "next/link";
import type { InboxWeek } from "@/lib/domain/inbox";

/** Insights tab, owners only: this week's Instagram and WhatsApp chats per account, from the Inbox's lead statuses. */
export function InboxSummary({ weekStart, accounts }: { weekStart: string; accounts: { id: string; name: string; week: InboxWeek }[] }) {
  const since = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${weekStart}T00:00:00Z`));
  const tile = (label: string, value: number) => (
    <div className="tile"><dt className="stat-label">{label}</dt><dd className="stat-value">{value}</dd></div>
  );
  return (
    <section aria-labelledby="inbox-summary" className="card space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="inbox-summary" className="text-lg font-semibold tracking-tight">Messages this week</h2>
        <span className="text-xs text-muted">New chats since Mon {since} · <Link href="/inbox" className="link">Open Inbox</Link></span>
      </div>
      {accounts.map((a) => (
        <div key={a.id} className="space-y-2">
          {accounts.length > 1 && <h3 className="text-sm font-medium">{a.name}</h3>}
          <dl className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-4">
            {tile("New chats", a.week.newChats)}
            {tile("From ads", a.week.fromAds)}
            {tile("Leads", a.week.leads)}
            {tile("Booked / bought", a.week.booked)}
          </dl>
        </div>
      ))}
      <p className="text-xs text-muted">Leads and bookings come from the status you set on each chat in the Inbox.</p>
    </section>
  );
}
