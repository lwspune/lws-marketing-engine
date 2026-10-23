import { effectiveCaption } from "@/lib/domain/captions";
import { applyEvent, MAX_START_TRIES, type PublicationEvent } from "@/lib/domain/workflow";
import { PLATFORM_LABEL, type Captions, type Platform, type PostKind, type Publication } from "@/lib/domain/types";
import { stepFacebook, stepInstagram, type MetaConfig, type MetaPostMedia } from "@/lib/platforms/meta";
import { stepYouTube, type UploadSession, type YouTubeConfig } from "@/lib/platforms/youtube";

// One scheduler tick: claim due publications, move each forward one step, record the result.
// Called every minute by /api/cron/publish (triggered from Supabase pg_cron). Each publication is
// handled independently: one failing never blocks the rest, and anything unexpected is logged and
// released so the next tick tries again.

/** How long the signed media links Meta downloads from stay valid. */
export const SIGNED_URL_TTL_SECONDS = 2 * 60 * 60;

export interface PublishContext {
  post: {
    id: string; kind: PostKind; captions: Captions; videoPath: string | null; coverPath: string | null; slidePaths: string[];
    /** The reel rendered with YouTube's end card (0024); YouTube gets it when present. */
    youtubeVideoPath?: string | null;
  };
  account: { platform: Platform; externalId: string; token: string };
}

export interface PublisherRepo {
  claimDue(limit: number): Promise<Publication[]>;
  /** null when the project no longer has an account connected for this platform. */
  loadContext(pub: Publication): Promise<PublishContext | null>;
  signUrls(paths: string[], ttlSeconds: number): Promise<string[]>;
  record(publicationId: string, ev: PublicationEvent): Promise<void>;
  release(publicationId: string): Promise<void>;
  /** Save a carousel's uploaded slide containers so a run that gets cut off doesn't upload them again. */
  saveChildren(publicationId: string, refs: string[]): Promise<void>;
  /** A YouTube upload's resumable session for the publication's current attempt (0023), so a cut-off run resumes. */
  loadUploadSession(publicationId: string): Promise<UploadSession | null>;
  saveUploadSession(publicationId: string, session: UploadSession): Promise<void>;
}

export interface TickSummary { claimed: number; recorded: number; released: number; errors: number }

export interface TickOptions {
  repo: PublisherRepo;
  metaConfig: MetaConfig;
  /** null when the server has no Google client (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET). */
  youtubeConfig?: YouTubeConfig | null;
  limit?: number;
  logger?: { error: (...args: unknown[]) => void };
  /** Milliseconds now; injectable for tests. */
  clock?: () => number;
}

/**
 * Start no new step after this long: the cron request gives up at 55 s and Vercel stops the function
 * at 60 s, and a step cut off mid-upload is repeated from scratch by the next run.
 */
export const TICK_BUDGET_MS = 30_000;

async function mediaFor(pub: Publication, ctx: PublishContext, repo: PublisherRepo): Promise<MetaPostMedia> {
  const { post } = ctx;
  const caption = effectiveCaption(pub.platform === "facebook" ? "facebook" : "instagram", post.captions);
  const media: MetaPostMedia = { kind: post.kind, caption };
  // Only a pending publication uploads anything; processing ones just poll, so don't mint links.
  if (pub.status !== "pending") return media;
  if (post.kind === "reel" && post.videoPath) {
    const paths = post.coverPath ? [post.videoPath, post.coverPath] : [post.videoPath];
    const [videoUrl, coverUrl] = await repo.signUrls(paths, SIGNED_URL_TTL_SECONDS);
    return { ...media, videoUrl, coverUrl };
  }
  if (post.kind === "story" && post.coverPath) {
    const [imageUrl] = await repo.signUrls([post.coverPath], SIGNED_URL_TTL_SECONDS);
    return { ...media, imageUrl };
  }
  return { ...media, slideUrls: await repo.signUrls(post.slidePaths, SIGNED_URL_TTL_SECONDS) };
}

async function stepYouTubeShort(pub: Publication, ctx: PublishContext, opts: TickOptions): Promise<PublicationEvent | null> {
  if (!opts.youtubeConfig) {
    return { type: "failed", error: "YouTube isn't set up on the server yet (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET). Press Retry once it is." };
  }
  const { post, account } = ctx;
  if (post.kind !== "reel") return { type: "failed", error: `A ${post.kind} can't be published to YouTube.` };
  const yt = post.captions.youtube ?? { title: "", description: "" };
  // Only a pending upload downloads the video; Shorts take no cover through the API.
  const video = post.youtubeVideoPath ?? post.videoPath;
  const [videoUrl] = pub.status === "pending" && video ? await opts.repo.signUrls([video], SIGNED_URL_TTL_SECONDS) : [];
  return stepYouTube(pub, {
    config: opts.youtubeConfig,
    account: { channelId: account.externalId, refreshToken: account.token },
    media: { videoUrl, title: yt.title, description: yt.description },
    loadSession: () => opts.repo.loadUploadSession(pub.id),
    saveSession: (s) => opts.repo.saveUploadSession(pub.id, s),
  });
}

async function stepOne(pub: Publication, ctx: PublishContext, opts: TickOptions): Promise<PublicationEvent | null> {
  const { platform, externalId, token } = ctx.account;
  if (pub.status === "pending" && (pub.claims ?? 0) > MAX_START_TRIES) {
    return { type: "failed", error: `Couldn't get this started after ${MAX_START_TRIES} tries (each run was cut off or the platform was busy). Press Retry.` };
  }
  if (platform === "youtube") return stepYouTubeShort(pub, ctx, opts);
  const media = await mediaFor(pub, ctx, opts.repo);
  if (platform === "instagram") {
    // Best effort: if saving fails, the worst case is uploading those slides again next run.
    const saveChildren = (refs: string[]) => opts.repo.saveChildren(pub.id, refs).catch((e) => {
      (opts.logger ?? console).error("publisher: saving carousel progress failed", { publicationId: pub.id, error: (e as Error).message });
    });
    return stepInstagram(pub, { config: opts.metaConfig, account: { igUserId: externalId, token }, media, saveChildren });
  }
  return stepFacebook(pub, { config: opts.metaConfig, account: { pageId: externalId, token }, media });
}

export async function runTick(opts: TickOptions): Promise<TickSummary> {
  const { repo, logger = console, clock = Date.now } = opts;
  const startedAt = clock();
  const due = await repo.claimDue(opts.limit ?? 10);
  const summary: TickSummary = { claimed: due.length, recorded: 0, released: 0, errors: 0 };

  for (const pub of due) {
    if (clock() - startedAt > TICK_BUDGET_MS) {
      await repo.release(pub.id).then(() => summary.released++, () => {});
      continue;
    }
    try {
      const ctx = await repo.loadContext(pub);
      const ev: PublicationEvent | null = ctx
        ? await stepOne(pub, ctx, opts)
        : { type: "failed", error: `${PLATFORM_LABEL[pub.platform]} isn't connected for this project any more.` };
      if (ev) {
        applyEvent(pub, ev); // app-side check of the transition; the database enforces it again
        await repo.record(pub.id, ev);
        summary.recorded++;
      } else {
        await repo.release(pub.id);
        summary.released++;
      }
    } catch (e) {
      summary.errors++;
      logger.error("publisher: publication step failed", { publicationId: pub.id, platform: pub.platform, error: (e as Error).message });
      await repo.release(pub.id).then(() => summary.released++, () => {});
    }
  }
  return summary;
}
