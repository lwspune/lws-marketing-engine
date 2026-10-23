import type { PublicationEvent } from "@/lib/domain/workflow";
import type { Publication } from "@/lib/domain/types";

// YouTube Shorts publishing over the YouTube Data API v3.
//
// Same shape as meta.ts: `stepYouTube` moves ONE publication forward by at most one stage and returns
// the event to record (null = nothing yet, try next tick).
//
//   pending      refresh the access token → resumable upload (session saved BEFORE any bytes go) → started(video id)
//   processing   GET /videos?part=status → processed = published (https://www.youtube.com/shorts/<id>)
//
// Never post twice: on YouTube a finished upload IS a posted video. So the upload session is saved
// first, and a later run that finds a saved session asks Google how far it got: complete → record
// that video; partway → send the rest; gone (sessions last about a week) → start again.
//
// Until Google's API audit passes, YouTube keeps every API upload Private (locked); it is still
// recorded as published, since uploading again would only make a second private copy.

export interface YouTubeConfig {
  oauthBase: string;
  apiBase: string;
  clientId: string;
  clientSecret: string;
}

/** null when GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET aren't set. */
export const youTubeConfigFromEnv = (): YouTubeConfig | null => {
  const clientId = process.env.GOOGLE_CLIENT_ID, clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { oauthBase: "https://oauth2.googleapis.com", apiBase: "https://www.googleapis.com", clientId, clientSecret };
};

export interface YouTubeAccount { channelId: string; refreshToken: string }

export interface YouTubeMedia {
  /** Signed link to the MP4; the worker downloads it and streams it to Google. */
  videoUrl?: string;
  title: string;
  description: string;
}

/** A resumable upload in flight: Google's session link and the file's size. */
export interface UploadSession { uri: string; size: number }

export interface YouTubeStepContext {
  config: YouTubeConfig;
  account: YouTubeAccount;
  media: YouTubeMedia;
  loadSession: () => Promise<UploadSession | null>;
  saveSession: (s: UploadSession) => Promise<void>;
}

/** YouTube's Education category: what every Short we post is. */
const EDUCATION = "27";

export class YouTubeApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly reason?: string) {
    super(message);
    this.name = "YouTubeApiError";
  }
  get temporary() { return this.status === 0 || this.status >= 500; }
}

const redact = (text: string, secrets: string[]) => secrets.filter(Boolean).reduce((t, s) => t.split(s).join("[secret]"), text);

async function request(url: string, init: RequestInit & { secrets: string[] }): Promise<Response> {
  const { secrets, ...rest } = init;
  try {
    return await fetch(url, rest);
  } catch (e) {
    throw new YouTubeApiError(redact(`Network error talking to Google: ${(e as Error).message}`, secrets), 0);
  }
}

async function errorFrom(res: Response, secrets: string[]): Promise<YouTubeApiError> {
  const json = (await res.json().catch(() => ({}))) as {
    error?: string | { message?: string; errors?: { reason?: string }[] }; error_description?: string;
  };
  if (typeof json.error === "string") {
    // OAuth errors: { error: "invalid_grant", error_description }
    return new YouTubeApiError(redact(`Google sign-in ${res.status}: ${json.error_description ?? json.error}`, secrets), res.status, json.error);
  }
  const reason = json.error?.errors?.[0]?.reason;
  const msg = `YouTube API ${res.status}${reason ? ` (${reason})` : ""}: ${json.error?.message ?? res.statusText}`;
  return new YouTubeApiError(redact(msg, secrets), res.status, reason);
}

/** Swap the stored refresh token for a one-hour access token. */
export async function accessToken(cfg: YouTubeConfig, refreshToken: string): Promise<string> {
  const secrets = [refreshToken, cfg.clientSecret];
  const res = await request(`${cfg.oauthBase}/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken, client_id: cfg.clientId, client_secret: cfg.clientSecret }).toString(),
    secrets,
  });
  if (!res.ok) throw await errorFrom(res, secrets);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new YouTubeApiError("Google sign-in returned no access token.", 500);
  return json.access_token;
}

const SIGN_IN_GONE = "YouTube sign-in has expired or was revoked. Run `npm run connect:youtube` again, then press Retry.";
const QUOTA_REASONS = new Set(["quotaExceeded", "uploadLimitExceeded", "dailyLimitExceeded", "rateLimitExceeded"]);

function onError(e: unknown, secrets: string[]): PublicationEvent | null {
  if (e instanceof YouTubeApiError) {
    if (e.reason === "invalid_grant" || e.status === 401) return { type: "failed", error: `${SIGN_IN_GONE} (${e.message})` };
    if (e.reason && QUOTA_REASONS.has(e.reason)) {
      return { type: "failed", error: `YouTube's daily limit for uploads is used up. Press Retry tomorrow. (${e.message})` };
    }
    if (e.reason === "youtubeSignupRequired") return { type: "failed", error: "This Google account has no YouTube channel." };
    return e.temporary ? null : { type: "failed", error: e.message };
  }
  return { type: "failed", error: redact(`Unexpected error: ${(e as Error).message ?? String(e)}`, secrets) };
}

/** Where a saved session got to: the finished video's id, or how many bytes Google already has. */
async function sessionState(s: UploadSession, token: string, secrets: string[]): Promise<{ videoId: string } | { received: number } | null> {
  const res = await request(s.uri, {
    method: "PUT", headers: { authorization: `Bearer ${token}`, "content-range": `bytes */${s.size}` }, body: new Uint8Array(0), secrets,
  });
  if (res.status === 200 || res.status === 201) return { videoId: String(((await res.json()) as { id: string }).id) };
  if (res.status === 308) {
    const range = res.headers.get("range")?.match(/bytes=0-(\d+)/);
    return { received: range ? Number(range[1]) + 1 : 0 };
  }
  if (res.status === 404 || res.status === 410) return null;
  throw await errorFrom(res, secrets);
}

async function download(url: string, secrets: string[]): Promise<Uint8Array<ArrayBuffer>> {
  const res = await request(url, { method: "GET", secrets });
  if (!res.ok) throw new YouTubeApiError(`Couldn't read the video file (${res.status}).`, res.status >= 500 ? res.status : 400);
  return new Uint8Array(await res.arrayBuffer());
}

/** Send bytes [from, end) of the file to the session; returns the new video's id. */
async function sendBytes(s: UploadSession, file: Uint8Array<ArrayBuffer>, from: number, token: string, secrets: string[]): Promise<string> {
  const headers: Record<string, string> = { authorization: `Bearer ${token}`, "content-type": "video/mp4" };
  if (from > 0) headers["content-range"] = `bytes ${from}-${s.size - 1}/${s.size}`;
  const res = await request(s.uri, { method: "PUT", headers, body: file.subarray(from), secrets });
  if (res.status === 200 || res.status === 201) return String(((await res.json()) as { id: string }).id);
  if (res.status === 308) throw new YouTubeApiError("YouTube received only part of the video; resuming next run.", 503);
  throw await errorFrom(res, secrets);
}

async function startSession(cfg: YouTubeConfig, media: YouTubeMedia, size: number, token: string, secrets: string[]): Promise<UploadSession> {
  const res = await request(`${cfg.apiBase}/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`, "content-type": "application/json; charset=UTF-8",
      "x-upload-content-length": String(size), "x-upload-content-type": "video/mp4",
    },
    body: JSON.stringify({
      snippet: { title: media.title, description: media.description, categoryId: EDUCATION },
      status: { privacyStatus: "public", selfDeclaredMadeForKids: false, containsSyntheticMedia: false },
    }),
    secrets,
  });
  if (!res.ok) throw await errorFrom(res, secrets);
  const uri = res.headers.get("location");
  if (!uri) throw new YouTubeApiError("YouTube didn't return an upload link.", 500);
  return { uri, size };
}

interface VideoStatus { uploadStatus?: string; failureReason?: string; rejectionReason?: string }

export async function stepYouTube(pub: Publication, ctx: YouTubeStepContext): Promise<PublicationEvent | null> {
  const { config: cfg, account, media } = ctx;
  const secrets = [account.refreshToken, cfg.clientSecret];
  try {
    if (pub.status === "pending") {
      if (!media.videoUrl) return { type: "failed", error: "Reel has no video file." };
      const token = await accessToken(cfg, account.refreshToken);
      secrets.push(token);

      const saved = await ctx.loadSession();
      if (saved) {
        const state = await sessionState(saved, token, secrets);
        if (state && "videoId" in state) return { type: "started", externalRef: state.videoId };
        if (state) {
          const file = await download(media.videoUrl, secrets);
          if (file.length !== saved.size) throw new YouTubeApiError("The video file changed during an upload; press Retry.", 400);
          return { type: "started", externalRef: await sendBytes(saved, file, state.received, token, secrets) };
        }
      }
      const file = await download(media.videoUrl, secrets);
      const session = await startSession(cfg, media, file.length, token, secrets);
      await ctx.saveSession(session);
      return { type: "started", externalRef: await sendBytes(session, file, 0, token, secrets) };
    }

    if (pub.status === "processing" && pub.externalRef) {
      const token = await accessToken(cfg, account.refreshToken);
      secrets.push(token);
      const res = await request(`${cfg.apiBase}/youtube/v3/videos?${new URLSearchParams({ part: "status", id: pub.externalRef })}`, {
        method: "GET", headers: { authorization: `Bearer ${token}` }, secrets,
      });
      if (!res.ok) throw await errorFrom(res, secrets);
      const items = ((await res.json()) as { items?: { status?: VideoStatus }[] }).items ?? [];
      if (!items.length) return { type: "failed", error: `Video ${pub.externalRef} is no longer on YouTube (deleted?).` };
      const st = items[0].status ?? {};
      if (st.uploadStatus === "processed") {
        return { type: "published", externalId: pub.externalRef, permalink: `https://www.youtube.com/shorts/${pub.externalRef}` };
      }
      if (st.uploadStatus === "rejected") return { type: "failed", error: `YouTube rejected the video: ${st.rejectionReason ?? "no reason given"}` };
      if (st.uploadStatus === "failed") return { type: "failed", error: `YouTube couldn't process the video: ${st.failureReason ?? "no reason given"}` };
      if (st.uploadStatus === "deleted") return { type: "failed", error: `Video ${pub.externalRef} is no longer on YouTube (deleted?).` };
      return null;
    }
    return null;
  } catch (e) {
    return onError(e, secrets);
  }
}
