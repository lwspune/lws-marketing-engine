import { effectiveCaption } from "@/lib/domain/captions";
import { applyEvent, type PublicationEvent } from "@/lib/domain/workflow";
import { PLATFORM_LABEL, type Captions, type Platform, type PostKind, type Publication } from "@/lib/domain/types";
import { stepFacebook, stepInstagram, type MetaConfig, type MetaPostMedia } from "@/lib/platforms/meta";

// One scheduler tick: claim due publications, move each forward one step, record the result.
// Called every minute by /api/cron/publish (triggered from Supabase pg_cron). Each publication is
// handled independently: one failing never blocks the rest, and anything unexpected is logged and
// released so the next tick tries again.

/** How long the signed media links Meta downloads from stay valid. */
export const SIGNED_URL_TTL_SECONDS = 2 * 60 * 60;

export interface PublishContext {
  post: { id: string; kind: PostKind; captions: Captions; videoPath: string | null; coverPath: string | null; slidePaths: string[] };
  account: { platform: Platform; externalId: string; token: string };
}

export interface PublisherRepo {
  claimDue(limit: number): Promise<Publication[]>;
  /** null when the project no longer has an account connected for this platform. */
  loadContext(pub: Publication): Promise<PublishContext | null>;
  signUrls(paths: string[], ttlSeconds: number): Promise<string[]>;
  record(publicationId: string, ev: PublicationEvent): Promise<void>;
  release(publicationId: string): Promise<void>;
}

export interface TickSummary { claimed: number; recorded: number; released: number; errors: number }

export interface TickOptions {
  repo: PublisherRepo;
  metaConfig: MetaConfig;
  limit?: number;
  logger?: { error: (...args: unknown[]) => void };
}

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
  return { ...media, slideUrls: await repo.signUrls(post.slidePaths, SIGNED_URL_TTL_SECONDS) };
}

async function stepOne(pub: Publication, ctx: PublishContext, opts: TickOptions): Promise<PublicationEvent | null> {
  const { platform, externalId, token } = ctx.account;
  if (platform === "youtube") return { type: "failed", error: "YouTube publishing isn't available yet." };
  const media = await mediaFor(pub, ctx, opts.repo);
  if (platform === "instagram") return stepInstagram(pub, { config: opts.metaConfig, account: { igUserId: externalId, token }, media });
  return stepFacebook(pub, { config: opts.metaConfig, account: { pageId: externalId, token }, media });
}

export async function runTick(opts: TickOptions): Promise<TickSummary> {
  const { repo, logger = console } = opts;
  const due = await repo.claimDue(opts.limit ?? 10);
  const summary: TickSummary = { claimed: due.length, recorded: 0, released: 0, errors: 0 };

  for (const pub of due) {
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
