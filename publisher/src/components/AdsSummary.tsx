import { AdOutcomeForm } from "@/components/AdOutcomeForm";
import { COST_PER_CHAT, type CampaignSummary, type ChatVerdict } from "@/lib/domain/ads";

// The Insights tab's Ads section: each campaign's last 30 days, judged on cost per WhatsApp chat,
// with the week's bookings typed in from WhatsApp labels (Meta can't see those).

const rupees = (x: number | null) => (x === null ? "–" : `₹${Math.round(x).toLocaleString("en-IN")}`);

const VERDICT: Record<ChatVerdict, { label: string; cls: string; help: string }> = {
  good: { label: "Good", cls: "border-accent/60 text-accent", help: `₹${COST_PER_CHAT.good} or less per chat` },
  watch: { label: "Watch", cls: "border-warn/60 text-warn", help: `₹${COST_PER_CHAT.good}–${COST_PER_CHAT.watch} per chat` },
  change: { label: "Change the poster", cls: "border-danger/60 text-danger", help: `over ₹${COST_PER_CHAT.watch} per chat: change the poster or hook, not the budget` },
  early: { label: "Too early", cls: "border-line text-muted", help: "not enough spent to judge yet" },
};

const STATUS: Record<string, string> = {
  ACTIVE: "Running", PAUSED: "Paused", CAMPAIGN_PAUSED: "Paused", ADSET_PAUSED: "Paused", PENDING_REVIEW: "In review",
  IN_PROCESS: "Starting", WITH_ISSUES: "Has a problem", DISAPPROVED: "Rejected by Meta", PENDING_BILLING_INFO: "Needs payment info",
  ARCHIVED: "Finished", DELETED: "Deleted",
};
const statusLabel = (s: string | null) => (s ? STATUS[s] ?? s.toLowerCase().replace(/_/g, " ") : "");

function Verdict({ v }: { v: ChatVerdict }) {
  return <span className={`chip ${VERDICT[v].cls}`} title={VERDICT[v].help}>{VERDICT[v].label}</span>;
}

export interface AdsSummaryProps {
  accountId: string | null;
  campaigns: CampaignSummary[];
  weekStart: string;
  thisWeek: Record<string, { booked: number; leads: number }>;
  lastSync: string | null;
}

const DAY = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
const day = (d: string | null) => (d ? DAY.format(new Date(`${d}T00:00:00Z`)) : "");

export function AdsSummary({ accountId, campaigns, weekStart, thisWeek, lastSync }: AdsSummaryProps) {
  return (
    <section aria-labelledby="ads" className="space-y-3 rounded-lg border border-line bg-panel p-4">
      <h2 id="ads" className="font-medium">Ads <span className="text-sm font-normal text-muted">(last 30 days)</span></h2>

      {!accountId ? (
        <p className="text-sm text-muted">No ad account connected yet. See SETUP.md, step “Connect the ad account”.</p>
      ) : campaigns.length === 0 ? (
        <p className="text-sm text-muted">No ads have run in the last 30 days.</p>
      ) : (
        <ul className="space-y-3" aria-label={`${campaigns.length} campaigns`}>
          {campaigns.map((c) => (
            <li key={c.campaignId} className="space-y-2 rounded-md border border-line p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="min-w-0 break-words text-sm font-medium">{c.name}</h3>
                <span className="text-xs text-muted">
                  {statusLabel(c.status)}{c.firstDay ? ` · ${day(c.firstDay)}–${day(c.lastDay)}` : " · no results yet"}
                </span>
              </div>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span><strong>{rupees(c.spend)}</strong> spent</span>
                <span><strong>{c.chats}</strong> WhatsApp {c.chats === 1 ? "chat" : "chats"}</span>
                <span><strong>{rupees(c.costPerChat)}</strong> per chat</span>
                <Verdict v={c.verdict} />
              </p>
              <p className="text-sm">
                {c.booked === null ? (
                  <span className="text-muted">No bookings typed in yet.</span>
                ) : (
                  <>
                    <strong>{c.booked}</strong> tests booked · <strong>{c.leads}</strong> NDA leads ·{" "}
                    <strong>{rupees(c.costPerBooked)}</strong> per booked test
                  </>
                )}
              </p>
              {c.adsets.length > 0 && (
                <ul className="space-y-1 border-t border-line pt-2" aria-label="Ad sets">
                  {c.adsets.map((a) => (
                    <li key={a.adsetId} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="min-w-0 break-words font-medium">{a.name}</span>
                      <span className="text-muted">{statusLabel(a.status)}{a.dailyBudgetInr !== null ? ` · ${rupees(a.dailyBudgetInr)}/day` : ""}</span>
                      <span>{rupees(a.spend)} · {a.chats} {a.chats === 1 ? "chat" : "chats"} · {rupees(a.costPerChat)} per chat</span>
                      <Verdict v={a.verdict} />
                    </li>
                  ))}
                </ul>
              )}
              <AdOutcomeForm accountId={accountId} campaignId={c.campaignId} campaignName={c.name} weekStart={weekStart}
                booked={thisWeek[c.campaignId]?.booked ?? 0} leads={thisWeek[c.campaignId]?.leads ?? 0} />
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted">
        Per chat: Good ≤ ₹{COST_PER_CHAT.good} · Watch ≤ ₹{COST_PER_CHAT.watch} · above that, change the poster or hook, not the budget.
        Days are India time (the ad account&apos;s clock).
        {lastSync ? ` Updated ${new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(lastSync))}.` : ""}
      </p>
    </section>
  );
}
