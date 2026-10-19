import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { handleMetaWebhook } from "@/lib/inbox/webhook";
import { fillProfiles, ingestRows } from "@/lib/inbox/store";
import { metaConfigFromEnv } from "@/lib/platforms/meta";

// Meta calls this for every Instagram DM (app dashboard → Webhooks → Instagram → messages) and every WhatsApp message
// to a connected number (Webhooks → Whatsapp Business Account → messages). Not behind sign-in
// (see middleware); each delivery is checked against the app secret instead. Migration 0012 has the rules.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const deps = () => {
  const db = createSupabaseAdminClient();
  return {
    appSecret: process.env.META_APP_SECRET ?? "",
    verifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN ?? "",
    ingest: (platform: Parameters<typeof ingestRows>[1], externalId: string, rows: Parameters<typeof ingestRows>[3]) => ingestRows(db, platform, externalId, rows),
    fillProfiles: (needs: Parameters<typeof fillProfiles>[2]) => fillProfiles(db, metaConfigFromEnv(), needs),
  };
};

export async function GET(req: Request) {
  return handleMetaWebhook(req, deps());
}

export async function POST(req: Request) {
  return handleMetaWebhook(req, deps());
}
