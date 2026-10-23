import { z } from "zod";
import { DomainError } from "./types";

// A manifest describes one ready-made post sitting next to its media files, e.g.
// reels/nda-maths-002-hook.post.json → nda-maths-002-hook.mp4 + nda-maths-002-hook-cover.png.
// `npm run queue:add` uploads the files and queues the post as "ready".
// A story (stories/render.mjs) is one JPEG card, no caption, with the time it's meant for and the
// question it shows, so the evening answer card and any reply to it are tied to the same question.

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

const QuestionSchema = z.object({
  id: z.string().uuid("question.id must be the question bank's id"),
  answer: z.enum(["A", "B", "C", "D"]),
  part: z.enum(["question", "answer"]),
});

const ManifestSchema = z
  .object({
    slug: z.string().regex(SLUG, "slug must be lowercase letters, digits and dashes"),
    project: z.string().regex(SLUG, "project must be a lowercase slug"),
    kind: z.enum(["reel", "carousel", "story"]),
    title: z.string().trim().min(1, "title is required").max(120),
    video: fileName(/\.mp4$/i, "video").optional(),
    /** The same reel with YouTube's end card ("Subscribe for more"); YouTube gets this one. */
    youtubeVideo: fileName(/\.mp4$/i, "youtubeVideo").optional(),
    cover: fileName(/\.(png|jpe?g)$/i, "cover").optional(),
    slides: z.array(fileName(/\.(png|jpe?g)$/i, "slide")).optional(),
    plannedFor: z.string().datetime({ offset: true, message: "plannedFor must be a time with its offset, e.g. 2026-10-26T07:30:00+05:30" }).optional(),
    question: QuestionSchema.optional(),
    captions: CaptionsSchema,
  })
  .strict()
  .superRefine((m, ctx) => {
    if (m.youtubeVideo && m.kind !== "reel") ctx.addIssue({ code: "custom", path: ["youtubeVideo"], message: "only a reel has a YouTube video" });
    if (m.kind !== "story") {
      if (m.plannedFor) ctx.addIssue({ code: "custom", path: ["plannedFor"], message: "only a story has a planned time" });
      if (m.question) ctx.addIssue({ code: "custom", path: ["question"], message: "only a story carries a question" });
    }
    if (m.kind === "story") {
      if (!m.cover || !/\.jpe?g$/i.test(m.cover)) ctx.addIssue({ code: "custom", path: ["cover"], message: "a story needs a JPEG card (Instagram rejects PNG)" });
      if (!m.plannedFor) ctx.addIssue({ code: "custom", path: ["plannedFor"], message: "a story needs its planned time" });
      if (!m.question) ctx.addIssue({ code: "custom", path: ["question"], message: "a story needs the question it shows" });
      if (m.video || m.slides?.length) ctx.addIssue({ code: "custom", path: ["video"], message: "a story is one card: no video or slides" });
      if (Object.values(m.captions).some(Boolean)) ctx.addIssue({ code: "custom", path: ["captions"], message: "a story has no caption" });
    } else if (m.kind === "reel") {
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
