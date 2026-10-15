import type { PublicationEvent } from "@/lib/domain/workflow";
import type { PostKind, Publication } from "@/lib/domain/types";

// Instagram + Facebook Page publishing over the Graph API.
//
// Each `step*` call moves ONE publication forward by at most one stage and returns the event to
// record (or null when there is nothing to record yet). The scheduler calls it every minute, so a
// slow upload is just several ticks. Publishing only ever happens from `processing` after the
// platform reports the media ready, and a container Instagram already reports as PUBLISHED is
// recorded rather than published again: the never-post-twice guard on the platform side.
//
// Flows:
//   Instagram reel      POST /{ig}/media (REELS, video_url, cover_url) → poll container → POST /{ig}/media_publish
//   Instagram story     POST /{ig}/media (STORIES, image_url, no caption) → same
//   Instagram carousel  POST /{ig}/media per slide (is_carousel_item) → POST /{ig}/media (CAROUSEL) → same
//   Facebook Page reel  POST /{page}/video_reels start → rupload file_url → finish (PUBLISHED) → poll status

export interface MetaConfig {
  graphBase: string;
  ruploadBase: string;
  version: string;
}

export const metaConfigFromEnv = (): MetaConfig => ({
  graphBase: "https://graph.facebook.com",
  ruploadBase: "https://rupload.facebook.com",
  version: process.env.META_GRAPH_VERSION || "v24.0",
});

export interface MetaPostMedia {
  kind: PostKind;
  caption: string;
  /** Publicly fetchable (signed) URLs; Meta downloads the files from these. */
  videoUrl?: string;
  coverUrl?: string;
  slideUrls?: string[];
  /** A story's card (JPEG: Instagram rejects PNG). */
  imageUrl?: string;
}

export interface StepContext<A> {
  config: MetaConfig;
  account: A;
  media: MetaPostMedia;
}

export class MetaApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "MetaApiError";
  }
  /** 5xx and network trouble are worth retrying on the next tick; 4xx means fix something first. */
  get temporary() { return this.status === 0 || this.status >= 500; }
}

const redact = (text: string, token: string) => (token ? text.split(token).join("[token]") : text);

async function call(
  url: string,
  init: { method: "GET" | "POST"; params?: Record<string, string>; headers?: Record<string, string>; token: string },
): Promise<Record<string, unknown>> {
  let target = url;
  const opts: RequestInit = { method: init.method, headers: { ...init.headers } };
  if (init.params) {
    const body = new URLSearchParams(init.params);
    if (init.method === "GET") target += `?${body}`;
    else {
      opts.body = body.toString();
      (opts.headers as Record<string, string>)["content-type"] = "application/x-www-form-urlencoded";
    }
  }
  let res: Response;
  try {
    res = await fetch(target, opts);
  } catch (e) {
    throw new MetaApiError(redact(`Network error talking to Meta: ${(e as Error).message}`, init.token), 0);
  }
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const err = (json.error ?? {}) as { message?: string; code?: number };
    const msg = `Meta API ${res.status}${err.code ? ` (code ${err.code})` : ""}: ${err.message ?? res.statusText}`;
    throw new MetaApiError(redact(msg, init.token), res.status);
  }
  return json;
}

const graph = (cfg: MetaConfig, path: string) => `${cfg.graphBase}/${cfg.version}/${path}`;

/** Shared with metaInsights.ts: one Graph request with token redaction and typed errors. */
export { call as metaCall, graph as graphUrl };

/** Turn an API failure into the event to record: temporary → try again next tick, otherwise fail. */
function onError(e: unknown, token: string): PublicationEvent | null {
  if (e instanceof MetaApiError) return e.temporary ? null : { type: "failed", error: e.message };
  return { type: "failed", error: redact(`Unexpected error: ${(e as Error).message ?? String(e)}`, token) };
}

// ---------------------------------------------------------------------------------------------
// Instagram

export interface InstagramAccount { igUserId: string; token: string }

export async function stepInstagram(pub: Publication, ctx: StepContext<InstagramAccount>): Promise<PublicationEvent | null> {
  const { config: cfg, account, media } = ctx;
  const token = account.token;
  try {
    if (pub.status === "pending") {
      if (media.kind === "reel") {
        if (!media.videoUrl) return { type: "failed", error: "Reel has no video file." };
        const params: Record<string, string> = {
          media_type: "REELS", video_url: media.videoUrl, caption: media.caption, share_to_feed: "true", access_token: token,
        };
        if (media.coverUrl) params.cover_url = media.coverUrl;
        const res = await call(graph(cfg, `${account.igUserId}/media`), { method: "POST", params, token });
        return { type: "started", externalRef: String(res.id) };
      }
      if (media.kind === "story") {
        if (!media.imageUrl) return { type: "failed", error: "Story has no image." };
        const res = await call(graph(cfg, `${account.igUserId}/media`), {
          method: "POST", params: { media_type: "STORIES", image_url: media.imageUrl, access_token: token }, token,
        });
        return { type: "started", externalRef: String(res.id) };
      }
      const slides = media.slideUrls ?? [];
      if (slides.length < 2) return { type: "failed", error: "Carousel needs at least 2 slides." };
      const children: string[] = [];
      for (const url of slides) {
        const child = await call(graph(cfg, `${account.igUserId}/media`), {
          method: "POST", params: { image_url: url, is_carousel_item: "true", access_token: token }, token,
        });
        children.push(String(child.id));
      }
      const parent = await call(graph(cfg, `${account.igUserId}/media`), {
        method: "POST", params: { media_type: "CAROUSEL", children: children.join(","), caption: media.caption, access_token: token }, token,
      });
      return { type: "started", externalRef: String(parent.id) };
    }

    if (pub.status === "processing" && pub.externalRef) {
      const st = await call(graph(cfg, pub.externalRef), {
        method: "GET", params: { fields: "status_code,status", access_token: token }, token,
      });
      const code = String(st.status_code ?? "");
      if (code === "IN_PROGRESS") return null;
      if (code === "PUBLISHED") return { type: "published", externalId: null, permalink: null };
      if (code === "ERROR" || code === "EXPIRED") {
        return { type: "failed", error: `Instagram couldn't process the media (${code}): ${String(st.status ?? "no detail")}` };
      }
      if (code !== "FINISHED") return null;
      const published = await call(graph(cfg, `${account.igUserId}/media_publish`), {
        method: "POST", params: { creation_id: pub.externalRef, access_token: token }, token,
      });
      const mediaId = String(published.id);
      const permalink = await call(graph(cfg, mediaId), { method: "GET", params: { fields: "permalink", access_token: token }, token })
        .then((r) => (typeof r.permalink === "string" ? r.permalink : null))
        .catch(() => null); // published either way; the link is a nicety
      return { type: "published", externalId: mediaId, permalink };
    }
    return null;
  } catch (e) {
    return onError(e, token);
  }
}

// ---------------------------------------------------------------------------------------------
// Facebook Page reels

export interface FacebookAccount { pageId: string; token: string }

interface FbStatus {
  video_status?: string;
  processing_phase?: { status?: string; error?: { message?: string } };
  uploading_phase?: { status?: string };
  publishing_phase?: { status?: string; error?: { message?: string } };
}

export async function stepFacebook(pub: Publication, ctx: StepContext<FacebookAccount>): Promise<PublicationEvent | null> {
  const { config: cfg, account, media } = ctx;
  const token = account.token;
  if (media.kind !== "reel") return { type: "failed", error: "Carousels can't be published to Facebook yet." };
  try {
    if (pub.status === "pending") {
      if (!media.videoUrl) return { type: "failed", error: "Reel has no video file." };
      const start = await call(graph(cfg, `${account.pageId}/video_reels`), {
        method: "POST", params: { upload_phase: "start", access_token: token }, token,
      });
      const videoId = String(start.video_id);
      await call(`${cfg.ruploadBase}/video-upload/${cfg.version}/${videoId}`, {
        method: "POST", headers: { authorization: `OAuth ${token}`, file_url: media.videoUrl }, token,
      });
      await call(graph(cfg, `${account.pageId}/video_reels`), {
        method: "POST",
        params: { upload_phase: "finish", video_id: videoId, video_state: "PUBLISHED", description: media.caption, access_token: token },
        token,
      });
      return { type: "started", externalRef: videoId };
    }

    if (pub.status === "processing" && pub.externalRef) {
      const res = await call(graph(cfg, pub.externalRef), { method: "GET", params: { fields: "status", access_token: token }, token });
      const st = (res.status ?? {}) as FbStatus;
      const phaseError = st.processing_phase?.error?.message ?? st.publishing_phase?.error?.message;
      if (st.video_status === "error" || st.processing_phase?.status === "error" || st.publishing_phase?.status === "error") {
        return { type: "failed", error: `Facebook couldn't process the reel: ${phaseError ?? "no detail"}` };
      }
      if (st.publishing_phase?.status !== "complete") return null;
      const link = await call(graph(cfg, pub.externalRef), { method: "GET", params: { fields: "permalink_url", access_token: token }, token })
        .then((r) => (typeof r.permalink_url === "string" ? r.permalink_url : null))
        .catch(() => null);
      const permalink = link && link.startsWith("/") ? `https://www.facebook.com${link}` : link;
      return { type: "published", externalId: pub.externalRef, permalink };
    }
    return null;
  } catch (e) {
    return onError(e, token);
  }
}
