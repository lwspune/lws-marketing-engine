// Connect a YouTube channel and route projects to it (YouTube Shorts).
//
//   npm run connect:youtube -- --org=lws-pune --projects=pyq-vault
//
// Needs GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env.local (Google Cloud project "GoPost", Desktop client
// "GoPost connect": SETUP.md step 11). It opens Google's sign-in in your browser: sign in with the account that
// owns or manages the channel, pick the channel if Google asks, and allow both permissions. The app isn't
// verified by Google (not needed for our own channels), so click Advanced → Go to GoPost on the warning.
//
// The sign-in comes back to this computer only (http://127.0.0.1, PKCE). The refresh token is stored encrypted
// in Supabase Vault; the worker swaps it for a one-hour access token on each upload. Re-running refreshes it.
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { connectAuthUrl, exchangeCode, myChannel, youTubeConfigFromEnv } from "../src/lib/platforms/youtube";
import { admin, flags, need, run } from "./lib";

const b64url = (b: Buffer) => b.toString("base64url");

function openBrowser(url: string) {
  // rundll32 takes the URL as-is (cmd's `start` would cut it at the first &).
  const [cmd, args] = process.platform === "win32" ? ["rundll32", ["url.dll,FileProtocolHandler", url]]
    : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  spawn(cmd, args as string[], { stdio: "ignore", detached: true }).on("error", () => {}).unref();
}

/** Wait for Google to redirect back with ?code=…&state=…, then tell the browser tab it can close. */
function waitForCode(server: http.Server, state: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("No sign-in within 5 minutes; run it again.")), 5 * 60_000);
    server.on("request", (req, res) => {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      const code = url.searchParams.get("code"), error = url.searchParams.get("error");
      if (!code && !error) { res.writeHead(404).end(); return; }
      const ok = code && url.searchParams.get("state") === state;
      res.writeHead(ok ? 200 : 400, { "content-type": "text/html; charset=utf-8" });
      res.end(ok ? "<p>GoPost is connected. You can close this tab.</p>" : "<p>Sign-in didn't complete. Check the terminal.</p>");
      clearTimeout(timer);
      if (ok) resolve(code);
      else reject(new Error(error ? `Google said: ${error}` : "The sign-in reply didn't match this request (state)."));
    });
  });
}

run(async () => {
  const f = flags();
  const orgSlug = need(f, "org");
  const projectSlugs = need(f, "projects").split(",").map((s) => s.trim()).filter(Boolean);
  const cfg = youTubeConfigFromEnv();
  if (!cfg) throw new Error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local first (SETUP.md step 11).");

  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);
  const projects: { slug: string; id: string }[] = [];
  for (const slug of projectSlugs) {
    const { data: project } = await db.from("projects").select("id").eq("org_id", org.id).eq("slug", slug).single();
    if (!project) throw new Error(`No project "${slug}" in ${orgSlug}.`);
    projects.push({ slug, id: project.id });
  }

  const verifier = b64url(randomBytes(32));
  const state = b64url(randomBytes(16));
  const server = http.createServer();
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const redirectUri = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const url = connectAuthUrl({
    clientId: cfg.clientId, redirectUri, state, codeChallenge: b64url(createHash("sha256").update(verifier).digest()),
  });
  console.log(`Opening Google sign-in in your browser. If it doesn't open, paste this link:\n\n${url}\n`);
  openBrowser(url);

  let code: string;
  try { code = await waitForCode(server, state); } finally { server.close(); }
  const tokens = await exchangeCode(cfg, { code, codeVerifier: verifier, redirectUri });
  const channel = await myChannel(cfg, tokens.accessToken);
  const name = channel.handle ? `${channel.title} (${channel.handle})` : channel.title;
  console.log(`✓ signed in: YouTube channel ${name}`);

  const { data: accountId, error } = await db.rpc("upsert_connected_account", {
    p_org: org.id, p_platform: "youtube", p_external_id: channel.id, p_display_name: name, p_token: tokens.refreshToken, p_expires_at: null,
  });
  if (error) throw new Error(`saving the channel: ${error.message}`);
  for (const p of projects) {
    const { error: routeError } = await db.rpc("set_project_channel", { p_project: p.id, p_platform: "youtube", p_account: accountId });
    if (routeError) throw new Error(`routing ${p.slug} → youtube: ${routeError.message}`);
    console.log(`✓ ${p.slug} now posts Shorts to ${name}`);
  }
});
