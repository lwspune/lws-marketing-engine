// What are students asking? Groups the last month's incoming DMs into ranked problems, in their own words,
// ready to paste into a product profile ("real problems in their words") and to pick reels from.
//
//   npm run messages:themes -- --org=lws-pune [--days=30]
//
// Names, @handles, phone numbers, emails and links are removed BEFORE any text leaves this computer
// (redactForThemes). With ANTHROPIC_API_KEY in .env.local, Claude groups them and the result goes to
// ../analytics/dm-themes-<date>.md. Without a key, the redacted questions go to ../analytics/dm-questions-<date>.md
// so you can paste them into the marketing engine yourself. Plain HTTP on purpose: no new package for one call.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { redactForThemes } from "../src/lib/domain/inbox";
import { admin, flags, need, run } from "./lib";

const MODEL = "claude-opus-5-5";
const MAX_CHARS = 120_000;

interface Theme { problem: string; count: number; examples: string[]; reel_idea: string }

const SCHEMA = {
  type: "object",
  properties: {
    themes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          problem: { type: "string", description: "The problem or question, phrased the way students phrase it" },
          count: { type: "integer", description: "How many of the messages are about this" },
          examples: { type: "array", items: { type: "string" }, description: "Up to 3 messages copied exactly from the input" },
          reel_idea: { type: "string", description: "One faceless pen-and-paper reel that answers it" },
        },
        required: ["problem", "count", "examples", "reel_idea"],
        additionalProperties: false,
      },
    },
  },
  required: ["themes"],
  additionalProperties: false,
};

async function askClaude(key: string, messages: string[]): Promise<Theme[]> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json",
      // On a safety decline, Anthropic re-runs the request on its recommended fallback model.
      "anthropic-beta": "server-side-fallback-2026-07-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      fallbacks: "default",
      output_config: { effort: "high", format: { type: "json_schema", schema: SCHEMA } },
      system:
        "You help a solo founder who teaches NDA/CDS maths and runs PYQ Vault (past exam questions). You get the Instagram DMs " +
        "students sent last month, one per line, with personal details already removed. Group them into the distinct problems " +
        "they show, most common first. Skip greetings and spam. Keep each problem in the students' own words (Hinglish is fine). " +
        "Examples must be copied exactly from the input, never invented. Reel ideas are silent, faceless, filmed top-down: " +
        "a real past question solved on paper with on-screen text.",
      messages: [{ role: "user", content: messages.join("\n") }],
    }),
  });
  const json = (await res.json()) as {
    stop_reason?: string; content?: { type: string; text?: string }[]; error?: { message?: string };
  };
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${json.error?.message ?? res.statusText}`);
  if (json.stop_reason === "refusal") throw new Error("Claude declined this request. Try a shorter --days range.");
  if (json.stop_reason === "max_tokens") throw new Error("The answer was cut off. Try a shorter --days range.");
  const text = json.content?.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Claude returned no text.");
  return (JSON.parse(text) as { themes: Theme[] }).themes;
}

run(async () => {
  const f = flags();
  const orgSlug = need(f, "org"), days = Number(f.days ?? 30);
  if (!Number.isInteger(days) || days < 1 || days > 365) throw new Error("--days must be a whole number from 1 to 365.");
  const db = admin();
  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data, error } = await db.from("messages").select("body").eq("org_id", org.id).eq("direction", "in")
    .neq("body", "").gte("sent_at", since).order("sent_at", { ascending: false }).limit(5000);
  if (error) throw new Error(`reading messages: ${error.message}`);

  // Redact, flatten to one line each, drop duplicates, and keep within one request.
  const seen = new Set<string>(), lines: string[] = [];
  let chars = 0;
  for (const { body } of data ?? []) {
    const line = redactForThemes(String(body)).replace(/\s+/g, " ").trim();
    if (line.length < 3 || seen.has(line.toLowerCase())) continue;
    if (chars + line.length > MAX_CHARS) break;
    seen.add(line.toLowerCase());
    lines.push(line);
    chars += line.length + 1;
  }
  if (!lines.length) throw new Error(`No incoming messages with text in the last ${days} days.`);

  const dir = path.resolve(process.cwd(), "..", "analytics");
  mkdirSync(dir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    const file = path.join(dir, `dm-questions-${date}.md`);
    writeFileSync(file, `# DM questions, last ${days} days (${lines.length}, personal details removed)\n\n${lines.map((l) => `- ${l}`).join("\n")}\n`);
    console.log(`No ANTHROPIC_API_KEY in .env.local, so no grouping. Wrote the ${lines.length} redacted questions to ${file}`);
    return;
  }

  console.log(`Grouping ${lines.length} messages with Claude…`);
  const themes = await askClaude(key, lines);
  const file = path.join(dir, `dm-themes-${date}.md`);
  const md = [
    `# What students asked on Instagram: last ${days} days`,
    "",
    `${lines.length} distinct messages (personal details removed), grouped by Claude on ${date}. Most common first.`,
    "",
    ...themes.flatMap((t, i) => [
      `## ${i + 1}. ${t.problem} (${t.count})`,
      "",
      ...t.examples.slice(0, 3).map((e) => `> ${e}`),
      "",
      `**Reel idea:** ${t.reel_idea}`,
      "",
    ]),
  ].join("\n");
  writeFileSync(file, md);
  console.log(`✓ ${themes.length} themes → ${file}`);
});
