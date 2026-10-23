import { captionErrors } from "./captions";
import { DomainError, PLATFORM_LABEL, type Platform, type Post, type PostKind, type PostStatus, type Publication } from "./types";

// The approval gate and the per-platform publishing state machine.
//
//   post:         ready ──approve──▶ approved ──(all publications settle)──▶ published | partially_published | failed
//                   └──reject──▶ rejected          └──unapprove (nothing started yet)──▶ ready
//   publication:  pending ──started──▶ processing ──published──▶ published (terminal: never posts twice)
//                    └────────failed────────┴──▶ failed ──retry (≤ MAX_ATTEMPTS)──▶ pending

export const MAX_ATTEMPTS = 3;
/** Pick-ups allowed while pending before giving up: each one that ends with nothing recorded was cut off or hit a Meta hiccup. */
export const MAX_START_TRIES = 5;
export const MAX_SCHEDULE_DAYS = 75;

export function supportedPlatforms(kind: PostKind): Platform[] {
  return kind === "reel" ? ["instagram", "facebook", "youtube"] : ["instagram"];
}

export interface ApprovalInput {
  platforms: Platform[];
  scheduledAt: Date | null;
  now: Date;
  /** Platforms with a working connected account for this post's project. */
  connected: Platform[];
}

export interface ApprovalPlan {
  publications: { platform: Platform; scheduledAt: Date | null }[];
}

export function planApproval(post: Post, input: ApprovalInput): ApprovalPlan {
  const { platforms, scheduledAt, now, connected } = input;
  if (post.status !== "ready") throw new DomainError("not_ready", `Only a ready post can be approved (this one is ${post.status}).`);
  if (platforms.length === 0) throw new DomainError("no_platforms", "Choose at least one platform.");
  if (new Set(platforms).size !== platforms.length) throw new DomainError("duplicate_platform", "A platform was chosen twice.");

  const allowed = supportedPlatforms(post.kind);
  for (const p of platforms) {
    if (!allowed.includes(p)) throw new DomainError("unsupported_platform", `A ${post.kind} can't be published to ${PLATFORM_LABEL[p]} yet.`);
    if (!connected.includes(p)) throw new DomainError("not_connected", `${PLATFORM_LABEL[p]} isn't connected for this project.`);
  }

  // A story has no caption; everything else needs one per platform.
  const problems = post.kind === "story" ? [] : platforms.flatMap((p) => captionErrors(p, post.captions));
  if (problems.length) throw new DomainError("invalid_caption", problems.join("; "));

  if (scheduledAt) {
    if (scheduledAt.getTime() <= now.getTime()) throw new DomainError("schedule_in_past", "The scheduled time has already passed.");
    if (scheduledAt.getTime() > now.getTime() + MAX_SCHEDULE_DAYS * 86_400_000) {
      throw new DomainError("schedule_too_far", `Schedule at most ${MAX_SCHEDULE_DAYS} days ahead.`);
    }
  }

  return { publications: platforms.map((platform) => ({ platform, scheduledAt })) };
}

export function canReject(post: Post): boolean {
  return post.status === "ready";
}

export function canUnapprove(post: Post, publications: Publication[]): boolean {
  return post.status === "approved" && publications.every((p) => p.status === "pending");
}

export type PublicationEvent =
  | { type: "started"; externalRef: string }
  | { type: "published"; externalId?: string | null; permalink?: string | null }
  | { type: "failed"; error: string }
  | { type: "retry" };

export function applyEvent(pub: Publication, ev: PublicationEvent): Publication {
  if (pub.status === "published") throw new DomainError("terminal", "Already published; it will never be posted again.");
  const invalid = () => new DomainError("invalid_transition", `Can't apply "${ev.type}" to a ${pub.status} publication.`);

  switch (ev.type) {
    case "started":
      if (pub.status !== "pending") throw invalid();
      return { ...pub, status: "processing", attempts: pub.attempts + 1, externalRef: ev.externalRef, error: null };
    case "published":
      if (pub.status !== "processing") throw invalid();
      return { ...pub, status: "published", externalId: ev.externalId ?? null, permalink: ev.permalink ?? null, error: null };
    case "failed":
      if (pub.status !== "pending" && pub.status !== "processing") throw invalid();
      return { ...pub, status: "failed", error: ev.error };
    case "retry":
      if (pub.status !== "failed") throw invalid();
      if (pub.attempts >= MAX_ATTEMPTS) throw new DomainError("retry_limit", `Gave up after ${MAX_ATTEMPTS} attempts.`);
      return { ...pub, status: "pending", externalRef: null, error: null, claims: 0, childRefs: [] };
  }
}

export function derivePostStatus(publications: Publication[]): PostStatus {
  if (publications.some((p) => p.status === "pending" || p.status === "processing")) return "approved";
  const published = publications.filter((p) => p.status === "published").length;
  if (published === publications.length) return "published";
  return published > 0 ? "partially_published" : "failed";
}

/** Should the publisher look at this publication now? Processing ones need polling until they settle. */
export function isDue(pub: Publication, now: Date): boolean {
  if (pub.status === "processing") return true;
  if (pub.status !== "pending") return false;
  return pub.scheduledAt === null || pub.scheduledAt.getTime() <= now.getTime();
}
