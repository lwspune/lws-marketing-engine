// Every reel manifest fits GoPost's manifest rules before it reaches `queue:add` (publisher/src/lib/domain/manifest.ts):
// a title of at most 120 characters. Physics #15's first title was 121 characters and only failed at upload (2026-10-26).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const REELS = path.join(__dirname, "..", "reels");
const manifests = () => fs.readdirSync(REELS).filter((f) => f.endsWith(".post.json"))
  .map((f) => ({ f, j: JSON.parse(fs.readFileSync(path.join(REELS, f), "utf8")) }));

test("every reels/*.post.json title fits GoPost's 120 characters", () => {
  const all = manifests();
  assert.ok(all.length > 0);
  for (const { f, j } of all) if (j.title !== undefined) assert.ok([...j.title].length <= 120, `${f}: title is ${[...j.title].length} characters`);
});
