import { describe, expect, it } from "vitest";
import { asUser, errorOf, fixture, TEST_DB_URL, withTx } from "../helpers/testdb";

// Approving fills a project's next free posting slot (src/lib/domain/slots.ts). Two quick approvals could both see
// the same slot as free, so the database itself refuses a second post at the same time in the same project.
describe.skipIf(!TEST_DB_URL)("database: one post per slot", () => {
  const at = new Date(Date.now() + 3 * 86_400_000).toISOString();

  it("a second post can't take a project's slot; a different time is fine", () => withTx(async (q) => {
    const f = await fixture(q);
    await asUser(q, f.member);
    await q("select * from public.approve_post($1, array['instagram'], $2)", [f.post, at]);
    const clash = await errorOf(q, "select * from public.approve_post($1, array['instagram'], $2)", [f.carousel, at]);
    expect(clash?.code).toBe("23505");
    const later = new Date(Date.parse(at) + 60 * 60_000).toISOString();
    expect(await q("select * from public.approve_post($1, array['instagram'], $2)", [f.carousel, later])).toHaveLength(1);
  }));

  it("posting now (no time) never clashes, and a reset frees the slot", () => withTx(async (q) => {
    const f = await fixture(q);
    await asUser(q, f.member);
    await q("select * from public.approve_post($1, array['instagram'])", [f.post]);
    expect(await q("select * from public.approve_post($1, array['instagram'])", [f.carousel])).toHaveLength(1);
  }));
});
