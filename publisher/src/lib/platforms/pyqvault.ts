import type { PyqvaultLead } from "@/lib/domain/pyqvaultLeads";

// PYQ Vault's defence-leads feed (its GET /api/leads/defence, founder 2026-10-25): NDA, CDS and AFCAT students who agreed
// to be contacted, a page at a time after a cursor. The shared secret (PYQVAULT_LEADS_SECRET here, GOPOST_LEADS_SECRET
// there) is the only access GoPost has: no key to PYQ Vault's database.

export interface PyqvaultConfig { base: string; secret: string }
export const PYQVAULT_BASE = "https://www.pyqvault.com";

export class PyqvaultApiError extends Error {}

export async function fetchDefenceLeads(
  cfg: PyqvaultConfig, input: { source: "account" | "quiz"; after: string | null; limit: number },
): Promise<{ leads: PyqvaultLead[]; next: string | null }> {
  const q = new URLSearchParams({ source: input.source, limit: String(input.limit) });
  if (input.after) q.set("after", input.after);
  const res = await fetch(`${cfg.base}/api/leads/defence?${q}`, { headers: { authorization: `Bearer ${cfg.secret}` }, cache: "no-store" });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new PyqvaultApiError(`PYQ Vault answered ${res.status}: ${body?.error ?? res.statusText}`);
  if (!Array.isArray(body?.leads) || !(body.next === null || typeof body.next === "string")) {
    throw new PyqvaultApiError("PYQ Vault's reply is not a page of leads");
  }
  return { leads: body.leads, next: body.next };
}
