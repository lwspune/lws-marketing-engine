// Apply supabase/migrations/*.sql in order, each once, each in its own transaction.
//
//   npm run db:migrate            → DATABASE_URL        (the live project)
//   npm run db:migrate -- --test  → TEST_DATABASE_URL   (the project the DB tests use)
//
// Both come from .env.local (Supabase → Project Settings → Database → Connection string, "Session
// pooler"). Applied files are tracked in private.schema_migrations; a changed file is never re-run,
// so fixes go in a new numbered file.
import { config } from "dotenv";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";

config({ path: ".env.local" });

async function main() {
  const test = process.argv.includes("--test");
  const url = test ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
  if (!url) throw new Error(`${test ? "TEST_DATABASE_URL" : "DATABASE_URL"} is not set in .env.local`);
  if (url.includes("[YOUR-PASSWORD]")) throw new Error("Replace [YOUR-PASSWORD] in .env.local with your database password first.");

  const dir = path.join(process.cwd(), "supabase", "migrations");
  const files = readdirSync(dir).filter((f) => /^\d{4}_[a-z0-9_]+\.sql$/.test(f)).sort();
  const db = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await db.connect();
  try {
    await db.query("create schema if not exists private");
    await db.query("create table if not exists private.schema_migrations (name text primary key, applied_at timestamptz not null default now())");
    const done = new Set((await db.query<{ name: string }>("select name from private.schema_migrations")).rows.map((r) => r.name));
    for (const file of files) {
      if (done.has(file)) continue;
      process.stdout.write(`applying ${file} … `);
      await db.query("begin");
      try {
        await db.query(readFileSync(path.join(dir, file), "utf8"));
        await db.query("insert into private.schema_migrations (name) values ($1)", [file]);
        await db.query("commit");
        console.log("ok");
      } catch (e) {
        await db.query("rollback");
        console.log("FAILED");
        throw e;
      }
    }
    console.log(`up to date (${files.length} migrations) on ${test ? "TEST" : "LIVE"} database`);
  } finally {
    await db.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
