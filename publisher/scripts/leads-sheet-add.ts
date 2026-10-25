// Register one Google Sheet tab the website fills with leads (migration 0026). The hourly leads job then reads its new rows.
//
//   npm run leads:sheet:add -- --org=lws-pune --sheet=<spreadsheet id> --tab="Age Calculator" --kind=age_calculator
//     --page="lwspune.com NDA age calculator"
//
// --kind: age_calculator | popup_form (how the rows read: src/lib/domain/leadSheets.ts). The sheet must be shared, as
// Viewer, with the service account in GOOGLE_SHEETS_KEY (SETUP.md step 12). Adding the same tab again changes nothing.
import { SHEET_KINDS } from "../src/lib/domain/leadSheets";
import { parseServiceAccount } from "../src/lib/platforms/googleSheets";
import { admin, flags, need, run } from "./lib";

run(async () => {
  const f = flags();
  const kind = need(f, "kind");
  if (!(SHEET_KINDS as readonly string[]).includes(kind)) throw new Error(`--kind must be one of: ${SHEET_KINDS.join(", ")}`);
  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", need(f, "org")).single();
  if (!org) throw new Error(`No organisation "${f.org}".`);
  const { data, error } = await db.rpc("add_lead_sheet", {
    p_org: org.id, p_spreadsheet: need(f, "sheet"), p_tab: need(f, "tab"), p_kind: kind, p_page: need(f, "page"),
  });
  if (error) throw new Error(`add_lead_sheet: ${error.message}`);
  const robot = process.env.GOOGLE_SHEETS_KEY ? parseServiceAccount(process.env.GOOGLE_SHEETS_KEY).client_email : "(set GOOGLE_SHEETS_KEY)";
  console.log(`✓ ${f.tab} registered (${data as string}). Share the sheet as Viewer with ${robot}, then run npm run leads:sheets -- --org=${f.org} --dry-run`);
});
