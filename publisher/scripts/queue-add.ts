// Upload ready-made posts and put them in the dashboard's Ready tab.
//
//   npm run queue:add -- --org=lws-pune ../reels/nda-maths-002-hook.post.json [more.post.json …]
//   npm run queue:add -- --org=lws-pune --replace ../reels/nda-maths-004-v.post.json
//
// Each manifest sits next to its media files (see src/lib/domain/manifest.ts). Files go to the
// private `media` bucket under <org_id>/<post_id>/. If saving the post fails, the uploaded files
// are removed again so nothing is left half-done. A slug already queued in the project is skipped,
// unless --replace is given AND that post is still "ready": then its files, title and captions are
// swapped for the new ones (a remade reel). Approved/published/rejected posts are never replaced.
// A story (stories/render.mjs) also saves its planned time and the question it shows; approve it
// with the dashboard's "Approve all stories", like the daily quiz stories.
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseManifest } from "../src/lib/domain/manifest";
import { admin, flags, need, run } from "./lib";

const TYPE: Record<string, string> = { ".mp4": "video/mp4", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

run(async () => {
  const f = flags();
  const orgSlug = need(f, "org");
  const replace = "replace" in f;
  const files = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (!files.length) throw new Error("Give at least one .post.json file.");
  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);

  for (const file of files) {
    const dir = path.dirname(path.resolve(file));
    const m = parseManifest(JSON.parse(readFileSync(file, "utf8")));
    const { data: project } = await db.from("projects").select("id").eq("org_id", org.id).eq("slug", m.project).single();
    if (!project) throw new Error(`${m.slug}: no project "${m.project}" in ${orgSlug}.`);
    const { data: existing } = await db.from("posts").select("id, status, kind").eq("project_id", project.id).eq("slug", m.slug).maybeSingle();
    const names = [m.video, m.cover, ...(m.slides ?? [])].filter((x): x is string => !!x);
    const storyFields = m.kind === "story" ? { planned_for: m.plannedFor, question: m.question } : {};

    if (existing && !(replace && existing.status === "ready")) {
      console.log(`- ${m.slug}: already queued (${existing.status}), skipped${replace ? " (only a ready post can be replaced)" : ""}`);
      continue;
    }
    if (existing) {
      // Remade reel: overwrite its files in place, then point the post at them. The DB only allows
      // media/caption edits while the post is ready, so this can't touch anything approved.
      if (existing.kind !== m.kind) throw new Error(`${m.slug}: can't replace a ${existing.kind} with a ${m.kind}.`);
      const key = (name: string) => `${org.id}/${existing.id}/${name}`;
      for (const name of names) {
        const { error } = await db.storage.from("media").upload(key(name), readFileSync(path.join(dir, name)), {
          contentType: TYPE[path.extname(name).toLowerCase()], upsert: true,
        });
        if (error) throw new Error(`${m.slug}: uploading ${name}: ${error.message}`);
      }
      const { error } = await db.from("posts").update({
        title: m.title, captions: m.captions, ...storyFields,
        video_path: m.video ? key(m.video) : null, cover_path: m.cover ? key(m.cover) : null, slide_paths: (m.slides ?? []).map(key),
      }).eq("id", existing.id).eq("status", "ready");
      if (error) throw new Error(`${m.slug}: updating the post: ${error.message}`);
      console.log(`✓ ${m.slug} replaced with the new version (${names.length} files), still Ready`);
      continue;
    }

    const postId = randomUUID();
    const key = (name: string) => `${org.id}/${postId}/${name}`;
    const uploaded: string[] = [];
    try {
      for (const name of names) {
        const body = readFileSync(path.join(dir, name));
        const { error } = await db.storage.from("media").upload(key(name), body, {
          contentType: TYPE[path.extname(name).toLowerCase()], upsert: false,
        });
        if (error) throw new Error(`uploading ${name}: ${error.message}`);
        uploaded.push(key(name));
      }
      const { error } = await db.from("posts").insert({
        id: postId, org_id: org.id, project_id: project.id, slug: m.slug, kind: m.kind, title: m.title, captions: m.captions,
        video_path: m.video ? key(m.video) : null, cover_path: m.cover ? key(m.cover) : null,
        slide_paths: (m.slides ?? []).map(key), ...storyFields,
      });
      if (error) throw new Error(`saving the post: ${error.message}`);
      console.log(`✓ ${m.slug} queued as Ready (${names.length} files)`);
    } catch (e) {
      if (uploaded.length) await db.storage.from("media").remove(uploaded);
      throw new Error(`${m.slug}: ${(e as Error).message}`);
    }
  }
});
