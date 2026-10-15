import { readFileSync } from "node:fs";
import path from "node:path";
import satori from "satori";
import sharp from "sharp";
import type { StoryCardText } from "@/lib/domain/story";

// The daily quiz Story card: 1080×1920 JPEG in the soft-white house look (Reel.WHITE in
// reels/engine.js). satori lays it out with the bundled Noto Sans (Vercel's servers have no
// fonts), sharp encodes JPEG (the Instagram API rejects a PNG story). Text stays clear of the top
// ~250 px (Instagram's profile bar) and bottom ~340 px (the reply box).

const C = { board: "#faf8f3", edge: "#f1ede4", ink: "#23304a", muted: "#5f6880", blue: "#3f56a0", green: "#2a736e" };
const W = 1080, H = 1920;

const fontDir = path.join(process.cwd(), "assets", "fonts");
let fonts: { name: string; data: Buffer; weight: 400 | 600 | 700; style: "normal" }[] | null = null;
const loadFonts = () =>
  (fonts ??= ([[400, "Regular"], [600, "SemiBold"], [700, "Bold"]] as const).map(([weight, file]) => ({
    name: "Noto Sans", data: readFileSync(path.join(fontDir, `NotoSans-${file}.ttf`)), weight, style: "normal" as const,
  })));

type Node = { type: string; props: Record<string, unknown> };
const el = (style: Record<string, unknown>, children: (Node | string)[] | string): Node => ({ type: "div", props: { style, children } });

/** Long chapter names step down in size so they stay on two or three lines. */
const chapterSize = (s: string) => (s.length <= 18 ? 112 : s.length <= 30 ? 92 : 72);

export async function renderStoryCard(t: StoryCardText): Promise<Buffer> {
  const tree = el(
    {
      width: W, height: H, display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "300px 96px 400px", fontFamily: "Noto Sans",
      backgroundImage: `radial-gradient(circle at 50% 45%, ${C.board} 55%, ${C.edge} 100%)`,
    },
    [
      el({ display: "flex", fontSize: 44, fontWeight: 600, color: C.muted }, t.kicker),
      el(
        {
          display: "flex", flexDirection: "column", backgroundColor: "#ffffff", borderRadius: 44, padding: "80px 72px",
          boxShadow: "0 24px 64px rgba(35, 48, 74, 0.12)",
        },
        [
          el({ display: "flex", fontSize: chapterSize(t.chapter), fontWeight: 700, color: C.ink, lineHeight: 1.08 }, t.chapter),
          ...(t.quizName ? [el({ display: "flex", marginTop: 28, fontSize: 60, fontWeight: 600, color: C.blue }, t.quizName)] : []),
          el({ display: "flex", marginTop: 48, height: 2, backgroundColor: C.edge }, []),
          el({ display: "flex", marginTop: 40, fontSize: 42, fontWeight: 400, color: C.muted }, t.note),
        ],
      ),
      el(
        {
          display: "flex", alignSelf: "center", backgroundColor: C.green, color: "#ffffff", fontSize: 56, fontWeight: 700,
          padding: "36px 64px", borderRadius: 999,
        },
        t.cta,
      ),
    ],
  );
  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], { width: W, height: H, fonts: loadFonts() });
  return sharp(Buffer.from(svg)).jpeg({ quality: 90, chromaSubsampling: "4:4:4" }).toBuffer();
}
