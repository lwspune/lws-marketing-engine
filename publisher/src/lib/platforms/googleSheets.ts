import { createSign } from "node:crypto";

// Reading the website's lead sheets (founder, 2026-10-25) as a Google service account: a robot login in the GoPost Google
// Cloud project that sees only the sheets shared with it, read-only. Signs its own token request (RS256, node:crypto), so
// no Google package. Key: GOOGLE_SHEETS_KEY (the service account's JSON key), never in code or the browser.

export interface GoogleConfig { tokenUrl: string; sheetsBase: string }
export const GOOGLE: GoogleConfig = { tokenUrl: "https://oauth2.googleapis.com/token", sheetsBase: "https://sheets.googleapis.com" };
export interface ServiceAccount { client_email: string; private_key: string }

const SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

export class GoogleApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}

/** The service account's key file (JSON from Google Cloud → Keys). The message never repeats the key. */
export function parseServiceAccount(json: string): ServiceAccount {
  let key: Record<string, unknown>;
  try {
    key = JSON.parse(json) as Record<string, unknown>;
  } catch {
    throw new Error("GOOGLE_SHEETS_KEY isn't the JSON key file from Google Cloud.");
  }
  const email = key.client_email, pem = key.private_key;
  if (typeof email !== "string" || !email.endsWith(".iam.gserviceaccount.com") || typeof pem !== "string" || !pem.includes("PRIVATE KEY")) {
    throw new Error("GOOGLE_SHEETS_KEY needs a service account's client_email and private_key.");
  }
  return { client_email: email, private_key: pem };
}

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");

async function googleJson(res: Response, what: string): Promise<Record<string, unknown>> {
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown> & { error?: { message?: string } | string; error_description?: string };
  if (!res.ok) {
    const detail = typeof json.error === "object" ? json.error?.message : json.error_description ?? json.error;
    throw new GoogleApiError(`Google API ${res.status} (${what}): ${detail ?? res.statusText}`, res.status);
  }
  return json;
}

/** A one-hour access token for reading sheets. */
export async function serviceAccountToken(cfg: GoogleConfig, sa: ServiceAccount, now = new Date()): Promise<string> {
  const iat = Math.floor(now.getTime() / 1000);
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ iss: sa.client_email, scope: SCOPE, aud: cfg.tokenUrl, iat, exp: iat + 3600 })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const res = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }),
  });
  const json = await googleJson(res, "token");
  if (typeof json.access_token !== "string") throw new GoogleApiError("Google API: no access token in the reply.", res.status);
  return json.access_token;
}

/** A tab's heading row and up to `maxRows` rows from `fromRow` on (columns A–Z), in one call. Trailing blank rows aren't returned. */
export async function readSheetRows(
  cfg: GoogleConfig, token: string, input: { spreadsheetId: string; tab: string; fromRow: number; maxRows: number },
): Promise<{ header: string[]; rows: string[][] }> {
  const tab = `'${input.tab.replace(/'/g, "''")}'`;
  const q = new URLSearchParams([["ranges", `${tab}!1:1`], ["ranges", `${tab}!A${input.fromRow}:Z${input.fromRow + input.maxRows - 1}`], ["majorDimension", "ROWS"]]);
  const res = await fetch(`${cfg.sheetsBase}/v4/spreadsheets/${encodeURIComponent(input.spreadsheetId)}/values:batchGet?${q}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const json = (await googleJson(res, "reading the sheet")) as { valueRanges?: { values?: string[][] }[] };
  const [head, body] = json.valueRanges ?? [];
  return { header: head?.values?.[0] ?? [], rows: body?.values ?? [] };
}
