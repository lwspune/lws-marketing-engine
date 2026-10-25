import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { memberAccess } from "@/lib/supabase/access";
import { Nav, PageHeader } from "@/components/Nav";
import { LeadCard } from "@/components/LeadCard";
import { formatPhone, whatsappLink } from "@/lib/domain/leads";
import { lastDownload, loadLeads } from "./data";

export const dynamic = "force-dynamic";

const DAY = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });
const WHEN = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

export default async function LeadsPage() {
  const supabase = createSupabaseServerClient();
  const access = await memberAccess(supabase);
  if (!access.inbox) redirect("/");
  const [leads, since] = await Promise.all([loadLeads(supabase), lastDownload(supabase)]);
  const fresh = since ? leads.filter((l) => Date.parse(l.created_at) > Date.parse(since)).length : leads.length;
  const sortingWhatsApp = !!process.env.ANTHROPIC_API_KEY;

  return (
    <>
      <Nav current="leads" ads={access.ads} inbox />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8">
        <PageHeader title="Leads">
          Everyone worth calling back, in one list. Instagram and Facebook chats join when the person shares a phone number or email;
          WhatsApp chats when Claude judges them a genuine new enquiry, and lwspune.com form entries from their emails.
          Only owners can see this page.
        </PageHeader>

        {!sortingWhatsApp && (
          <p role="status" className="card mb-4 p-4 text-sm text-warn">
            WhatsApp chats aren&rsquo;t being sorted yet: the server has no Claude API key (ANTHROPIC_API_KEY). Instagram and Facebook leads still arrive.
          </p>
        )}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">{leads.length === 1 ? "1 lead" : `${leads.length} leads`}</p>
          {leads.length > 0 && (
            // Each choice is a POST: a download moves your download point (migration 0020).
            <details className="relative">
              <summary className="btn cursor-pointer list-none">Download for Excel</summary>
              <form method="post" action="/leads/export"
                className="card absolute right-0 z-10 mt-2 flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-1 p-2 text-sm">
                <button type="submit" name="kind" value="all" className="rounded-lg px-3 py-2 text-left hover:bg-white/[0.06] focus-visible:bg-white/[0.06]">
                  <span className="block font-medium">All leads ({leads.length})</span>
                </button>
                {since ? (
                  <button type="submit" name="kind" value="new" disabled={fresh === 0}
                    className="rounded-lg px-3 py-2 text-left hover:bg-white/[0.06] focus-visible:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50">
                    <span className="block font-medium">New since your last download ({fresh})</span>
                    <span className="block text-xs text-muted">Last download {WHEN.format(new Date(since))}</span>
                  </button>
                ) : (
                  <p className="px-3 py-2 text-xs text-muted">This is your first download, so there&rsquo;s no &ldquo;new&rdquo; yet.</p>
                )}
              </form>
            </details>
          )}
        </div>

        {leads.length === 0 ? (
          <section className="card space-y-2 p-4 sm:p-6">
            <p className="text-sm">No leads yet.</p>
            <p className="text-sm text-muted">They appear here within an hour of someone sharing their number on Instagram or Facebook, or sending a genuine enquiry on WhatsApp.</p>
          </section>
        ) : (
          <ul className="card divide-y divide-line overflow-hidden" aria-label={`${leads.length} leads`}>
            {leads.map((l) => (
              <LeadCard key={l.id} lead={l} date={DAY.format(new Date(l.lead_at))} phone={l.contact.startsWith("+") ? formatPhone(l.contact) : null}
                whatsapp={l.conversationId ? null : whatsappLink(l.contact)} />
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
