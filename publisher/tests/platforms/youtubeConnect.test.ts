import { afterEach, describe, expect, it } from "vitest";
import { startFakeGoogle } from "../helpers/fakeGoogle";
import { connectAuthUrl, exchangeCode, myChannel, YOUTUBE_SCOPES } from "@/lib/platforms/youtube";

// `npm run connect:youtube`: sign in with Google once (loopback redirect + PKCE), keep the refresh token,
// and find the channel the sign-in picked.

let fake: Awaited<ReturnType<typeof startFakeGoogle>> | undefined;
afterEach(async () => { await fake?.close(); fake = undefined; });

describe("connectAuthUrl", () => {
  it("asks for upload + read-only access, offline, with consent forced so Google returns a refresh token", () => {
    const url = new URL(connectAuthUrl({ clientId: "client-1", redirectUri: "http://127.0.0.1:5555", state: "S1", codeChallenge: "CH1" }));
    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: "client-1", redirect_uri: "http://127.0.0.1:5555", response_type: "code",
      scope: YOUTUBE_SCOPES.join(" "), access_type: "offline", prompt: "consent",
      state: "S1", code_challenge: "CH1", code_challenge_method: "S256",
    });
    expect(YOUTUBE_SCOPES).toEqual([
      "https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly",
    ]);
  });
});

describe("exchangeCode + myChannel", () => {
  it("swaps the code for a refresh token and finds the chosen channel", async () => {
    fake = await startFakeGoogle();
    const t = await exchangeCode(fake.config, { code: "CODE-OK", codeVerifier: "VERIFIER-1", redirectUri: "http://127.0.0.1:5555" });
    expect(t).toEqual({ accessToken: "ya29.fake-access", refreshToken: "1//new-refresh" });
    expect(await myChannel(fake.config, t.accessToken)).toEqual({ id: "UC-lws", title: "LWS Pune", handle: "@lwspune" });
  });

  it("refuses a sign-in that returned no refresh token", async () => {
    fake = await startFakeGoogle({ noRefreshToken: true });
    await expect(exchangeCode(fake.config, { code: "CODE-OK", codeVerifier: "VERIFIER-1", redirectUri: "http://127.0.0.1:5555" }))
      .rejects.toThrow(/no refresh token/);
  });

  it("reports a bad code with Google's reason", async () => {
    fake = await startFakeGoogle();
    await expect(exchangeCode(fake.config, { code: "WRONG", codeVerifier: "VERIFIER-1", redirectUri: "http://127.0.0.1:5555" }))
      .rejects.toThrow(/invalid_grant|Bad Request/);
  });

  it("says so when the Google account has no YouTube channel", async () => {
    fake = await startFakeGoogle({ noChannel: true });
    await expect(myChannel(fake.config, "ya29.fake-access")).rejects.toThrow(/no YouTube channel/);
  });
});
