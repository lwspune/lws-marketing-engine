import { timingSafeEqual } from "node:crypto";
import { fail, ok } from "./result";
// The /api/cron/publish handler, kept free of Next and Supabase so it can be tested directly.
// Only Supabase pg_cron knows the secret (stored in Vault, see migration 0003).

export interface CronDeps {
  secret: string;
  tick: () => Promise<unknown>;
  logger?: { error: (...args: unknown[]) => void };
}

function secretMatches(header: string | null, secret: string): boolean {
  if (!secret || !header?.startsWith("Bearer ")) return false;
  const given = Buffer.from(header.slice("Bearer ".length));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function handleCron(req: Request, deps: CronDeps): Promise<Response> {
  if (!secretMatches(req.headers.get("authorization"), deps.secret)) {
    return Response.json(fail("unauthorized", "Unauthorized"), { status: 401 });
  }
  try {
    return Response.json(ok(await deps.tick()));
  } catch (e) {
    (deps.logger ?? console).error("publisher: tick failed", { error: (e as Error).message });
    return Response.json(fail("tick_failed", "The publishing tick failed; see server logs."), { status: 500 });
  }
}
