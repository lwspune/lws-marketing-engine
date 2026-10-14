import { z } from "zod";
import { DomainError } from "./types";

// A manifest describes one ready-made post sitting next to its media files, e.g.
// reels/nda-maths-002-hook.post.json → nda-maths-002-hook.mp4 + nda-maths-002-hook-cover.png.
// `npm run queue:add` uploads the files and queues the post as "ready".

const SLUG = /^[a-z0-9][a-z0-9-]{1,79}$/;
// A plain file name in the manifest's own folder: no separators, no "..", no drive letters.
const FILE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

const fileName = (ext: RegExp, what: string) =>
  z.string().regex(FILE, `${what} must be a plain file name next to the manifest`).regex(ext, `${what} has the wrong file type`);

const CaptionsSchema = z.object({
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  youtube: z.object({ title: z.string(), description: z.string() }).optional(),
});

const ManifestSchema = z
  .object({
    slug: z.string().regex(SLUG, "slug must be lowercase letters, digits and dashes"),
    project: z.string().regex(SLUG, "project must be a lowercase slug"),
    kind: z.enum(["reel", "carousel"]),
    title: z.string().trim().min(1, "title is required").max(120),
    video: fileName(/\.mp4$/i, "video").optional(),
    cover: fileName(/\.(png|jpe?g)$/i, "cover").optional(),
    slides: z.array(fileName(/\.(png|jpe?g)$/i, "slide")).optional(),
    captions: CaptionsSchema,
  })
  .superRefine((m, ctx) => {
    if (m.kind === "reel") {
      if (!m.video) ctx.addIssue({ code: "custom", path: ["video"], message: "a reel needs a video (.mp4)" });
      if (m.slides?.length) ctx.addIssue({ code: "custom", path: ["slides"], message: "a reel can't have slides" });
    } else {
      const n = m.slides?.length ?? 0;
      if (n < 2 || n > 10) ctx.addIssue({ code: "custom", path: ["slides"], message: "a carousel needs 2–10 slides" });
      if (m.video) ctx.addIssue({ code: "custom", path: ["video"], message: "a carousel can't have a video" });
    }
  });

export type Manifest = z.infer<typeof ManifestSchema>;

export function parseManifest(input: unknown): Manifest {
  const result = ManifestSchema.safeParse(input);
  if (result.success) return result.data;
  const problems = result.error.issues.map((i) => `${i.path.join(".") || "manifest"}: ${i.message}`);
  throw new DomainError("invalid_manifest", `Invalid post manifest — ${problems.join("; ")}`);
}
