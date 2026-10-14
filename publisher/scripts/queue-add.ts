// Upload ready-made posts and put them in the dashboard's Ready tab.
//
//   npm run queue:add -- --org=lws-pune ../reels/nda-maths-002-hook.post.json [more.post.json …]
//
// Each manifest sits next to its media files (see src/lib/domain/manifest.ts). Files go to the
// private `media` bucket under <org_id>/<post_id>/. If saving the post fails, the uploaded files
// are removed again so nothing is left half-done. A slug already queued in the project is skipped.
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseManifest } from "../src/lib/domain/manifest";
import { admin, flags, need, run } from "./lib";

const TYPE: Record<string, string> = { ".mp4": "video/mp4", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

run(async () => {
  const f = flags();
  const orgSlug = need(f, "org");
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
    const { data: existing } = await db.from("posts").select("id, status").eq("project_id", project.id).eq("slug", m.slug).maybeSingle();
    if (existing) { console.log(`- ${m.slug}: already queued (${existing.status}), skipped`); continue; }

    const postId = randomUUID();
    const key = (name: string) => `${org.id}/${postId}/${name}`;
    const names = [m.video, m.cover, ...(m.slides ?? [])].filter((x): x is string => !!x);
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
        slide_paths: (m.slides ?? []).map(key),
      });
      if (error) throw new Error(`saving the post: ${error.message}`);
      console.log(`✓ ${m.slug} queued as Ready (${names.length} files)`);
    } catch (e) {
      if (uploaded.length) await db.storage.from("media").remove(uploaded);
      throw new Error(`${m.slug}: ${(e as Error).message}`);
    }
  }
});
