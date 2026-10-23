import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Captions, Platform, PostKind, Publication, PublicationStatus } from "@/lib/domain/types";
import type { PublicationEvent } from "@/lib/domain/workflow";
import type { PublishContext, PublisherRepo } from "./worker";
import type { MetricsRepo } from "./metrics";
import type { SnapshotLabel } from "@/lib/domain/metrics";

// PublisherRepo backed by Supabase (service role). All state changes go through the database
// functions in migration 0002, which enforce the transitions and settle the post atomically.

interface PublicationRow {
  id: string; post_id: string; platform: Platform; status: PublicationStatus; scheduled_at: string | null;
  attempts: number; external_ref: string | null; external_id: string | null; permalink: string | null; error: string | null;
  claims?: number; child_refs?: string[];
}

export const toPublication = (r: PublicationRow): Publication => ({
  id: r.id, postId: r.post_id, platform: r.platform, status: r.status,
  scheduledAt: r.scheduled_at ? new Date(r.scheduled_at) : null, attempts: r.attempts,
  externalRef: r.external_ref, externalId: r.external_id, permalink: r.permalink, error: r.error,
  claims: r.claims ?? 0, childRefs: r.child_refs ?? [],
});

const STATUS_OF: Record<PublicationEvent["type"], PublicationStatus | null> = {
  started: "processing", published: "published", failed: "failed", retry: null,
};

export function supabaseRepo(db: SupabaseClient): PublisherRepo {
  return {
    async claimDue(limit) {
      const { data, error } = await db.rpc("claim_due_publications", { p_limit: limit });
      if (error) throw new Error(`claim_due_publications: ${error.message}`);
      return ((data ?? []) as PublicationRow[]).map(toPublication);
    },

    async loadContext(pub): Promise<PublishContext | null> {
      const { data: post, error } = await db
        .from("posts")
        .select("id, project_id, kind, captions, video_path, cover_path, slide_paths")
        .eq("id", pub.postId)
        .single();
      if (error || !post) throw new Error(`post ${pub.postId}: ${error?.message ?? "missing"}`);

      const { data: channel } = await db
        .from("project_channels")
        .select("account_id, connected_accounts!inner(id, external_id, platform)")
        .eq("project_id", post.project_id)
        .eq("platform", pub.platform)
        .maybeSingle();
      if (!channel) return null;
      const account = channel.connected_accounts as unknown as { id: string; external_id: string; platform: Platform };

      const { data: token, error: tokenError } = await db.rpc("get_account_token", { p_account: account.id });
      if (tokenError || !token) return null;

      return {
        post: {
          id: post.id, kind: post.kind as PostKind, captions: (post.captions ?? {}) as Captions,
          videoPath: post.video_path, coverPath: post.cover_path, slidePaths: post.slide_paths ?? [],
        },
        account: { platform: account.platform, externalId: account.external_id, token: token as string },
      };
    },

    async signUrls(paths, ttlSeconds) {
      const { data, error } = await db.storage.from("media").createSignedUrls(paths, ttlSeconds);
      if (error || !data) throw new Error(`signing media URLs: ${error?.message ?? "no data"}`);
      return paths.map((p) => {
        const hit = data.find((d) => d.path === p);
        if (!hit?.signedUrl) throw new Error(`no signed URL for ${p}`);
        return hit.signedUrl;
      });
    },

    async record(publicationId, ev) {
      const status = STATUS_OF[ev.type];
      if (!status) throw new Error(`the worker never records "${ev.type}"`);
      const { error } = await db.rpc("record_publication_event", {
        p_publication: publicationId,
        p_status: status,
        p_external_ref: ev.type === "started" ? ev.externalRef : null,
        p_external_id: ev.type === "published" ? ev.externalId ?? null : null,
        p_permalink: ev.type === "published" ? ev.permalink ?? null : null,
        p_error: ev.type === "failed" ? ev.error : null,
      });
      if (error) throw new Error(`record_publication_event: ${error.message}`);
    },

    async release(publicationId) {
      const { error } = await db.rpc("release_publication", { p_publication: publicationId });
      if (error) throw new Error(`release_publication: ${error.message}`);
    },

    async saveChildren(publicationId, refs) {
      const { error } = await db.rpc("save_carousel_children", { p_publication: publicationId, p_refs: refs });
      if (error) throw new Error(`save_carousel_children: ${error.message}`);
    },

    async loadUploadSession(publicationId) {
      const { data, error } = await db.rpc("upload_session", { p_publication: publicationId });
      if (error) throw new Error(`upload_session: ${error.message}`);
      const row = (data as { session_uri: string; size_bytes: number }[] | null)?.[0];
      return row ? { uri: row.session_uri, size: Number(row.size_bytes) } : null;
    },

    async saveUploadSession(publicationId, s) {
      const { error } = await db.rpc("save_upload_session", { p_publication: publicationId, p_uri: s.uri, p_size: s.size });
      if (error) throw new Error(`save_upload_session: ${error.message}`);
    },
  };
}

interface DueRow {
  publication_id: string; post_id: string; platform: Platform; external_ref: string | null; external_id: string | null;
  published_at: string; snapshot: SnapshotLabel;
}

export function supabaseMetricsRepo(db: SupabaseClient): MetricsRepo {
  const base = supabaseRepo(db);
  return {
    async metricsDue(limit) {
      const { data, error } = await db.rpc("metrics_due", { p_limit: limit });
      if (error) throw new Error(`metrics_due: ${error.message}`);
      return ((data ?? []) as DueRow[]).map((r) => ({
        snapshot: r.snapshot,
        publication: {
          id: r.publication_id, postId: r.post_id, platform: r.platform, status: "published", scheduledAt: null,
          attempts: 0, externalRef: r.external_ref, externalId: r.external_id, permalink: null, error: null,
        },
      }));
    },
    loadContext: base.loadContext,
    async recordMetrics(publicationId, snapshot, m, raw) {
      const rawObject = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : { value: raw ?? null };
      const { error } = await db.rpc("record_publication_metrics", {
        p_publication: publicationId, p_snapshot: snapshot,
        p_views: m?.views ?? null, p_reach: m?.reach ?? null, p_saves: m?.saves ?? null, p_shares: m?.shares ?? null,
        p_likes: m?.likes ?? null, p_comments: m?.comments ?? null, p_avg_watch_ms: m?.avgWatchMs ?? null,
        p_error: (rawObject as { error?: string }).error ?? null, p_raw: rawObject,
      });
      if (error) throw new Error(`record_publication_metrics: ${error.message}`);
    },
    async recordStoryMetrics(publicationId, m, raw) {
      const rawObject = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : { value: raw ?? null };
      const { error } = await db.rpc("record_story_metrics", {
        p_publication: publicationId,
        p_views: m?.views ?? null, p_reach: m?.reach ?? null, p_shares: m?.shares ?? null, p_replies: m?.replies ?? null,
        p_follows: m?.follows ?? null, p_profile_visits: m?.profileVisits ?? null, p_exits: m?.exits ?? null,
        p_error: (rawObject as { error?: string }).error ?? null, p_raw: rawObject,
      });
      if (error) throw new Error(`record_story_metrics: ${error.message}`);
    },
  };
}
