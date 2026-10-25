import { describe, expect, it, vi } from "vitest";
import { allRows } from "@/lib/supabase/pages";

// Supabase answers at most 1,000 rows per request (found 2026-10-25: the Leads page showed "1000 leads" of ~2,300, and
// the Excel download would have dropped the rest while moving the download point past them). allRows reads page by page.

const page = (rows: number[]) => vi.fn(async (from: number, to: number) => ({ data: rows.slice(from, to + 1), error: null }));

describe("allRows", () => {
  it("reads every page until a short one, asking for each range in turn", async () => {
    const rows = Array.from({ length: 2345 }, (_, i) => i);
    const read = page(rows);
    expect(await allRows(read, 1000)).toEqual(rows);
    expect(read.mock.calls).toEqual([[0, 999], [1000, 1999], [2000, 2999]]);
  });

  it("asks once more when the last page is exactly full, and handles no rows", async () => {
    const read = page(Array.from({ length: 2000 }, (_, i) => i));
    expect(await allRows(read, 1000)).toHaveLength(2000);
    expect(read).toHaveBeenCalledTimes(3);
    expect(await allRows(page([]), 1000)).toEqual([]);
  });

  it("stops at a ceiling so a runaway table can't hang the page", async () => {
    const read = page(Array.from({ length: 50 }, (_, i) => i));
    expect(await allRows(read, 10, 30)).toHaveLength(30);
  });

  it("raises the database's error", async () => {
    const read = vi.fn(async () => ({ data: null, error: { message: "permission denied" } }));
    await expect(allRows(read, 1000)).rejects.toThrow(/permission denied/);
  });
});
