// One response shape for every action and endpoint: { ok: true, data } | { ok: false, error: { code, message } }.

export type Result<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const fail = (code: string, message: string): Result<never> => ({ ok: false, error: { code, message } });

/**
 * Database functions raise with a human message and a stable code in HINT (supabase/migrations/0002).
 * Those are safe to show. Anything else is an internal error, so the user sees a generic message.
 */
export function fromRpcError(err: { message: string; hint?: string | null; code?: string }): Result<never> {
  if (err.code === "P0001" && err.hint) return fail(err.hint, err.message);
  return fail("unexpected", "Something went wrong. Please try again.");
}
