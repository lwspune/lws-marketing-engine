// Supabase (PostgREST) answers at most 1,000 rows per request, whatever .limit() asks for. Read longer lists page by page
// with a stable order (add a unique tie-breaker such as id), or pages can skip or repeat rows.

export const PAGE_SIZE = 1000;

/** Every row `read(from, to)` returns, one page at a time, up to `max`. */
export async function allRows<T>(
  read: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  size = PAGE_SIZE, max = 50_000,
): Promise<T[]> {
  const out: T[] = [];
  while (out.length < max) {
    const from = out.length, to = Math.min(from + size, max) - 1;
    const { data, error } = await read(from, to);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
    if ((data ?? []).length < to - from + 1) break;
  }
  return out;
}
