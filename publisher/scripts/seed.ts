// Create (or update) an organisation, its projects, and its owner's login. Safe to re-run.
//
//   npm run seed -- --org=lws-pune --org-name="LWS Pune" \
//     --projects="pyq-vault:PYQ Vault,lws-coaching:LWS Coaching" --owner=connect.lwspune@gmail.com
//
// The owner gets an invite email (Supabase Auth) if they don't have a login yet. Nobody can sign
// themselves up; the login page only sends links to people created here.
import { admin, flags, need, run } from "./lib";

run(async () => {
  const f = flags();
  const slug = need(f, "org"), name = need(f, "org-name"), owner = need(f, "owner").toLowerCase();
  const projects = need(f, "projects").split(",").map((p) => {
    const [s, ...n] = p.split(":");
    return { slug: s.trim(), name: (n.join(":") || s).trim() };
  });
  const db = admin();

  const { data: org, error: orgErr } = await db.from("organizations").upsert({ slug, name }, { onConflict: "slug" }).select("id").single();
  if (orgErr) throw new Error(`organisation: ${orgErr.message}`);
  console.log(`✓ organisation ${slug} (${org.id})`);

  for (const p of projects) {
    const { error } = await db.from("projects").upsert({ org_id: org.id, slug: p.slug, name: p.name }, { onConflict: "org_id,slug" });
    if (error) throw new Error(`project ${p.slug}: ${error.message}`);
    console.log(`✓ project ${p.slug}`);
  }

  // Find or invite the owner.
  let userId: string | undefined;
  for (let page = 1; !userId; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listing users: ${error.message}`);
    userId = data.users.find((u) => u.email?.toLowerCase() === owner)?.id;
    if (data.users.length < 200) break;
  }
  if (!userId) {
    const { data, error } = await db.auth.admin.inviteUserByEmail(owner);
    if (error) throw new Error(`inviting ${owner}: ${error.message}`);
    userId = data.user.id;
    console.log(`✓ invited ${owner}; check that inbox for the Supabase invite`);
  }
  const { error: memErr } = await db.from("org_members").upsert({ org_id: org.id, user_id: userId, role: "owner" }, { onConflict: "org_id,user_id" });
  if (memErr) throw new Error(`membership: ${memErr.message}`);
  console.log(`✓ ${owner} is owner of ${slug}`);
});
