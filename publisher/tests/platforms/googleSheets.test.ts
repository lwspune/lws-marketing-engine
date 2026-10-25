import { createVerify, generateKeyPairSync } from "node:crypto";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { GoogleApiError, parseServiceAccount, readSheetRows, serviceAccountToken, type GoogleConfig } from "@/lib/platforms/googleSheets";

// Reading the website's lead sheets as a Google service account (read-only, sees only sheets shared with it). A local
// stand-in for oauth2.googleapis.com + sheets.googleapis.com; the key pair is made for the test.

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const SA = { client_email: "gopost-leads@gopost-test.iam.gserviceaccount.com", private_key: privateKey.export({ type: "pkcs8", format: "pem" }) as string };

interface Call { method: string; path: string; query: URLSearchParams; body: URLSearchParams; auth?: string }
let server: http.Server | undefined;
afterEach(async () => { await new Promise<void>((r) => (server ? server.close(() => r()) : r())); server = undefined; });

async function fakeGoogle(sheet: { values?: string[][]; status?: number } = {}) {
  const calls: Call[] = [];
  server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://fake");
    const body = await new Promise<string>((r) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => r(b)); });
    calls.push({ method: req.method ?? "", path: url.pathname, query: url.searchParams, body: new URLSearchParams(body), auth: req.headers.authorization });
    const send = (status: number, payload: object) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(payload)); };
    if (url.pathname === "/token") return send(200, { access_token: "ya29.test-token", expires_in: 3599, token_type: "Bearer" });
    if (url.pathname.endsWith("/values:batchGet")) {
      if (sheet.status) return send(sheet.status, { error: { code: sheet.status, message: "The caller does not have permission", status: "PERMISSION_DENIED" } });
      const [head, rows] = url.searchParams.getAll("ranges");
      const all = sheet.values ?? [];
      const from = Number(rows.match(/!A(\d+):/)![1]), to = Number(rows.match(/:Z(\d+)$/)![1]);
      const body = all.slice(from - 1, to);
      return send(200, { valueRanges: [{ range: head, values: all.slice(0, 1) }, { range: rows, ...(body.length ? { values: body } : {}) }] });
    }
    send(404, { error: { message: `fake: no route for ${url.pathname}` } });
  });
  await new Promise<void>((r) => server!.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${(server!.address() as AddressInfo).port}`;
  return { calls, cfg: { tokenUrl: `${base}/token`, sheetsBase: base } satisfies GoogleConfig };
}

describe("parseServiceAccount", () => {
  it("reads the key file Google gives, and refuses anything else without echoing it", () => {
    expect(parseServiceAccount(JSON.stringify({ type: "service_account", ...SA, project_id: "p" }))).toEqual(SA);
    expect(() => parseServiceAccount("not json")).toThrow(/GOOGLE_SHEETS_KEY/);
    const err = (() => { try { parseServiceAccount(JSON.stringify({ client_email: "x", private_key: "secret-ish" })); } catch (e) { return e as Error; } })();
    expect(err?.message).not.toContain("secret-ish");
  });
});

describe("serviceAccountToken", () => {
  it("signs a one-hour JWT for the read-only Sheets scope and swaps it for an access token", async () => {
    const g = await fakeGoogle();
    const now = new Date("2026-10-25T10:00:00Z");
    expect(await serviceAccountToken(g.cfg, SA, now)).toBe("ya29.test-token");
    const call = g.calls.find((c) => c.path === "/token")!;
    expect(call.body.get("grant_type")).toBe("urn:ietf:params:oauth:grant-type:jwt-bearer");
    const [h, p, s] = call.body.get("assertion")!.split(".");
    expect(JSON.parse(Buffer.from(h, "base64url").toString())).toEqual({ alg: "RS256", typ: "JWT" });
    expect(JSON.parse(Buffer.from(p, "base64url").toString())).toEqual({
      iss: SA.client_email, scope: "https://www.googleapis.com/auth/spreadsheets.readonly", aud: g.cfg.tokenUrl,
      iat: now.getTime() / 1000, exp: now.getTime() / 1000 + 3600,
    });
    expect(createVerify("RSA-SHA256").update(`${h}.${p}`).verify(publicKey, Buffer.from(s, "base64url"))).toBe(true);
  });
});

describe("readSheetRows", () => {
  const values = [["Full Name", "Mobile Number"], ["A", "9800000001"], ["B", "9800000002"], ["C", "9800000003"]];

  it("reads the heading row and the rows from the marker on, in one call", async () => {
    const g = await fakeGoogle({ values });
    expect(await readSheetRows(g.cfg, "ya29.t", { spreadsheetId: "SHEET1", tab: "Age Calculator", fromRow: 3, maxRows: 100 }))
      .toEqual({ header: ["Full Name", "Mobile Number"], rows: [["B", "9800000002"], ["C", "9800000003"]] });
    const call = g.calls.find((c) => c.path.endsWith("/values:batchGet"))!;
    expect(call.path).toBe("/v4/spreadsheets/SHEET1/values:batchGet");
    expect(call.query.getAll("ranges")).toEqual(["'Age Calculator'!1:1", "'Age Calculator'!A3:Z102"]);
    expect(call.auth).toBe("Bearer ya29.t");
  });

  it("returns no rows when nothing is new, and quotes a tab name with an apostrophe", async () => {
    const g = await fakeGoogle({ values });
    expect((await readSheetRows(g.cfg, "t", { spreadsheetId: "SHEET1", tab: "Bob's tab", fromRow: 5, maxRows: 10 })).rows).toEqual([]);
    expect(g.calls[0].query.getAll("ranges")[0]).toBe("'Bob''s tab'!1:1");
  });

  it("says plainly when the sheet isn't shared with the robot", async () => {
    const g = await fakeGoogle({ status: 403 });
    const err = await readSheetRows(g.cfg, "ya29.secret", { spreadsheetId: "SHEET1", tab: "T", fromRow: 2, maxRows: 10 }).catch((e) => e);
    expect(err).toBeInstanceOf(GoogleApiError);
    expect(err.message).toMatch(/403.*permission/i);
    expect(err.message).not.toContain("ya29.secret");
  });
});
