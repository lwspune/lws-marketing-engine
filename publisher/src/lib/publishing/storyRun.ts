import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { StoryCta } from "@/lib/domain/story";
import { renderStoryCard } from "./storyCard";
import { planStories, pyqVaultQuizSource, type PlanResult, type StoryPlanRepo } from "./storyPlanner";

// Wires the Story planner to Supabase (service role): cards go to the private `media` bucket under
// <org_id>/<post_id>/card.jpg like every other post's files, and the post is inserted as Ready.
// Shared by the Saturday job (/api/cron/stories) and `npm run stories:plan`.

export interface StoryRunConfig {
  orgSlug: string;
  projectSlug: string;
  pyqVaultUrl: string;
  cta: StoryCta;
}

export const storyConfigFromEnv = (): StoryRunConfig => ({
  orgSlug: process.env.STORY_ORG || "lws-pune",
  projectSlug: process.env.STORY_PROJECT || "pyq-vault",
  pyqVaultUrl: process.env.PYQ_VAULT_URL || "https://www.pyqvault.com",
  // "reply" once the story-reply DM is live; until then the card points at the bio link.
  cta: process.env.STORY_CTA === "reply" ? "reply" : "bio",
});

function supabaseStoryRepo(db: SupabaseClient, orgId: string, projectId: string): StoryPlanRepo {
  return {
    async existingSlugs(slugs) {
      const { data, error } = await db.from("posts").select("slug").eq("project_id", projectId).in("slug", slugs);
      if (error) throw new Error(`reading planned stories: ${error.message}`);
      return (data ?? []).map((r) => r.slug as string);
    },
    async saveStory(s) {
      const postId = randomUUID();
      const key = `${orgId}/${postId}/card.jpg`;
      const { error: upErr } = await db.storage.from("media").upload(key, s.jpeg, { contentType: "image/jpeg", upsert: false });
      if (upErr) throw new Error(`uploading the card: ${upErr.message}`);
      const { error } = await db.from("posts").insert({
        id: postId, org_id: orgId, project_id: projectId, slug: s.slug, kind: "story", title: s.title,
        captions: {}, cover_path: key, quiz: s.quiz, planned_for: s.plannedFor.toISOString(),
      });
      if (error) {
        await db.storage.from("media").remove([key]);
        throw new Error(`saving the story: ${error.message}`);
      }
    },
  };
}

export async function runStoryPlanner(db: SupabaseClient, cfg: StoryRunConfig, now = new Date()): Promise<PlanResult> {
  const { data: org } = await db.from("organizations").select("id").eq("slug", cfg.orgSlug).maybeSingle();
  if (!org) throw new Error(`No organisation "${cfg.orgSlug}".`);
  const { data: project } = await db.from("projects").select("id").eq("org_id", org.id).eq("slug", cfg.projectSlug).maybeSingle();
  if (!project) throw new Error(`No project "${cfg.projectSlug}" in ${cfg.orgSlug}.`);
  return planStories({
    repo: supabaseStoryRepo(db, org.id, project.id),
    quizzes: pyqVaultQuizSource(cfg.pyqVaultUrl),
    render: renderStoryCard,
    now,
    cta: cfg.cta,
  });
}
