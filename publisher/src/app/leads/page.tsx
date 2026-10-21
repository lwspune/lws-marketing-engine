import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { memberAccess } from "@/lib/supabase/access";
import { Nav, PageHeader } from "@/components/Nav";
import { LeadCard } from "@/components/LeadCard";
import { formatPhone, whatsappLink } from "@/lib/domain/leads";
import { loadLeads } from "./data";

export const dynamic = "force-dynamic";

const DAY = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });

export default async function LeadsPage() {
  const supabase = createSupabaseServerClient();
  const access = await memberAccess(supabase);
  if (!access.inbox) redirect("/");
  const leads = await loadLeads(supabase);
  const sortingWhatsApp = !!process.env.ANTHROPIC_API_KEY;

  return (
    <>
      <Nav current="leads" ads={access.ads} inbox />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8">
        <PageHeader title="Leads">
          Everyone worth calling back, in one list. Instagram chats join when the person shares a phone number or email;
          WhatsApp chats when Claude judges them a genuine new enquiry, and lwspune.com form entries from their emails.
          Only owners can see this page.
        </PageHeader>

        {!sortingWhatsApp && (
          <p role="status" className="card mb-4 p-4 text-sm text-warn">
            WhatsApp chats aren&rsquo;t being sorted yet: the server has no Claude API key (ANTHROPIC_API_KEY). Instagram leads still arrive.
          </p>
        )}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">{leads.length === 1 ? "1 lead" : `${leads.length} leads`}</p>
          {leads.length > 0 && <a className="btn" href="/leads/export" download>Download for Excel</a>}
        </div>

        {leads.length === 0 ? (
          <section className="card space-y-2 p-4 sm:p-6">
            <p className="text-sm">No leads yet.</p>
            <p className="text-sm text-muted">They appear here within an hour of someone sharing their number on Instagram or sending a genuine enquiry on WhatsApp.</p>
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
