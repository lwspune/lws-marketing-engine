import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// The database lives in Mumbai (Supabase ap-south-1). Vercel runs functions in Washington (iad1)
// unless told otherwise, which puts ~0.2 s on every query; pages make several. Keep them together.

describe("vercel.json", () => {
  it("runs server code in Mumbai, next to the database", () => {
    const config = JSON.parse(readFileSync(path.resolve(__dirname, "../../vercel.json"), "utf8"));
    expect(config.regions).toEqual(["bom1"]);
  });
});
