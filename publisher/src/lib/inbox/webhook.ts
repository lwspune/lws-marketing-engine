import { timingSafeEqual } from "node:crypto";
import { parseInstagramWebhook, parseWhatsAppWebhook, verifyMetaSignature, type InboxRow } from "@/lib/domain/inbox";
import { fail, ok } from "@/lib/publishing/result";

// The /api/webhooks/meta handler, kept free of Next and Supabase so it can be tested directly (like cron.ts).
// GET: Meta checks the address once with our verify token. POST: one signed delivery of Instagram DMs or WhatsApp
// messages (the same address serves both products). Storing failures
// answer 500 so Meta delivers again (the database ignores duplicates); a failed name lookup doesn't.

export interface NeedsProfile { accountId: string; conversationId: string; contactId: string }
export type InboxPlatform = "instagram" | "whatsapp";

export interface WebhookDeps {
  appSecret: string;
  verifyToken: string;
  ingest: (platform: InboxPlatform, accountExternalId: string, rows: InboxRow[]) => Promise<NeedsProfile[]>;
  fillProfiles: (needs: NeedsProfile[]) => Promise<void>;
  logger?: { error: (...args: unknown[]) => void };
}

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export async function handleMetaWebhook(req: Request, deps: WebhookDeps): Promise<Response> {
  const log = deps.logger ?? console;
  if (req.method === "GET") {
    const q = new URL(req.url).searchParams;
    const token = q.get("hub.verify_token") ?? "";
    if (q.get("hub.mode") !== "subscribe" || !deps.verifyToken || !same(token, deps.verifyToken)) {
      return Response.json(fail("forbidden", "Verification failed."), { status: 403 });
    }
    return new Response(q.get("hub.challenge") ?? "", { status: 200, headers: { "content-type": "text/plain" } });
  }

  const raw = await req.text();
  if (!verifyMetaSignature(raw, req.headers.get("x-hub-signature-256"), deps.appSecret)) {
    return Response.json(fail("unauthorized", "Bad signature."), { status: 401 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json(fail("invalid_input", "Body is not JSON."), { status: 400 });
  }

  const groups: [InboxPlatform, ReturnType<typeof parseInstagramWebhook>][] = [
    ["instagram", parseInstagramWebhook(body)], ["whatsapp", parseWhatsAppWebhook(body)],
  ];
  const needs: NeedsProfile[] = [];
  let stored = 0;
  try {
    for (const [platform, list] of groups) {
      for (const g of list) {
        const missing = await deps.ingest(platform, g.accountExternalId, g.rows);
        // WhatsApp sends names with the message; only Instagram contacts are looked up.
        if (platform === "instagram") needs.push(...missing);
        stored += g.rows.length;
      }
    }
  } catch (e) {
    log.error("inbox: storing a webhook delivery failed", { error: (e as Error).message });
    return Response.json(fail("ingest_failed", "Couldn't store the messages."), { status: 500 });
  }
  if (needs.length) {
    try {
      await deps.fillProfiles(needs);
    } catch (e) {
      log.error("inbox: contact name lookup failed", { error: (e as Error).message });
    }
  }
  return Response.json(ok({ stored }));
}
