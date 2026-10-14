import { config } from "dotenv";
import { randomUUID } from "node:crypto";
import { Client } from "pg";

// DB integration tests run against TEST_DATABASE_URL (migrated with `npm run db:migrate -- --test`).
// Every test runs inside ONE transaction that is always rolled back, so nothing persists, even
// when a test fails. Users are simulated the way Supabase does it: role `authenticated` plus a JWT
// `sub` claim, which is what auth.uid() reads.

config({ path: ".env.local" });
// Unset, or still holding the .env template's password placeholder → the DB suites skip.
const raw = process.env.TEST_DATABASE_URL;
export const TEST_DB_URL = raw && !raw.includes("[YOUR-PASSWORD]") ? raw : undefined;

export type Q = <T = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<T[]>;

export async function withTx(fn: (q: Q, db: Client) => Promise<void>) {
  const db = new Client({ connectionString: TEST_DB_URL, ssl: { rejectUnauthorized: false } });
  await db.connect();
  const q: Q = async (sql, params) => (await db.query(sql, params as unknown[])).rows as never;
  try {
    await db.query("begin");
    await fn(q, db);
  } finally {
    await db.query("rollback").catch(() => {});
    await db.end();
  }
}

export async function asUser(q: Q, userId: string) {
  await q("reset role");
  await q("select set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub: userId, role: "authenticated" })]);
  await q("set local role authenticated");
}
export async function asAnon(q: Q) {
  await q("reset role");
  await q("select set_config('request.jwt.claims', $1, true)", [JSON.stringify({ role: "anon" })]);
  await q("set local role anon");
}
export async function asService(q: Q) {
  await q("reset role");
  await q("set local role service_role");
}
export async function asOwner(q: Q) {
  await q("reset role");
}

/** Run a statement inside a savepoint; resolves to the Postgres error (or null) without aborting the test transaction. */
export async function errorOf(q: Q, sql: string, params?: unknown[]): Promise<{ message: string; hint?: string; code?: string } | null> {
  await q("savepoint t");
  try {
    await q(sql, params);
    await q("release savepoint t");
    return null;
  } catch (e) {
    await q("rollback to savepoint t");
    return e as { message: string; hint?: string; code?: string };
  }
}

export interface Fixture {
  member: string; outsider: string; org: string; project: string; igAccount: string; post: string; carousel: string;
}

/** Two users (one member, one outsider), an org + project with Instagram connected, a ready reel and carousel. */
export async function fixture(q: Q): Promise<Fixture> {
  await asOwner(q);
  const member = randomUUID(), outsider = randomUUID(), tag = randomUUID().slice(0, 8);
  for (const [id, email] of [[member, `m-${tag}@test.local`], [outsider, `o-${tag}@test.local`]]) {
    await q("insert into auth.users (id, email, aud, role) values ($1, $2, 'authenticated', 'authenticated')", [id, email]);
  }
  const [{ id: org }] = await q<{ id: string }>("insert into public.organizations (slug, name) values ($1, 'Test Org') returning id", [`t-${tag}`]);
  await q("insert into public.org_members (org_id, user_id, role) values ($1, $2, 'owner')", [org, member]);
  const [{ id: project }] = await q<{ id: string }>("insert into public.projects (org_id, slug, name) values ($1, 'pyq-vault', 'PYQ Vault') returning id", [org]);
  const [{ id: igAccount }] = await q<{ id: string }>(
    "select public.upsert_connected_account($1, 'instagram', '17841400000000000', '@lws.pune', 'IGAA-test-token-0123456789', null) as id", [org]);
  await q("select public.set_project_channel($1, 'instagram', $2)", [project, igAccount]);
  const [{ id: post }] = await q<{ id: string }>(
    `insert into public.posts (org_id, project_id, slug, kind, title, captions, video_path, cover_path)
     values ($1::uuid, $2, 'reel-1', 'reel', 'Reel 1', '{"instagram":"Q74 #NDA"}', $1::text || '/p/v.mp4', $1::text || '/p/c.png') returning id`, [org, project]);
  const [{ id: carousel }] = await q<{ id: string }>(
    `insert into public.posts (org_id, project_id, slug, kind, title, captions, slide_paths)
     values ($1::uuid, $2, 'car-1', 'carousel', 'Carousel 1', '{"instagram":"Q42"}', array[$1::text || '/c/1.png', $1::text || '/c/2.png']) returning id`, [org, project]);
  return { member, outsider, org, project, igAccount, post, carousel };
}
