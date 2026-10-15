// Core types shared by the domain rules, the platform clients and the database layer.
// The database enforces the same rules (supabase/migrations); these are the app-side mirror.

export const PLATFORMS = ["instagram", "facebook", "youtube"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
};

export type PostKind = "reel" | "carousel" | "story";

export type PostStatus = "ready" | "approved" | "published" | "partially_published" | "failed" | "rejected";

export type PublicationStatus = "pending" | "processing" | "published" | "failed";

export interface Captions {
  instagram?: string;
  facebook?: string;
  youtube?: { title: string; description: string };
}

export interface Post {
  id: string;
  orgId: string;
  projectId: string;
  kind: PostKind;
  status: PostStatus;
  captions: Captions;
}

export interface Publication {
  id: string;
  postId: string;
  platform: Platform;
  status: PublicationStatus;
  scheduledAt: Date | null;
  attempts: number;
  /** Platform-side handle while processing: an Instagram container id, a Facebook video id, … */
  externalRef: string | null;
  /** The published item's id on the platform. */
  externalId: string | null;
  permalink: string | null;
  error: string | null;
}

/** A rule violation with a stable machine-readable code and a human message. */
export class DomainError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "DomainError";
  }
}
