// Give someone a staff login that sees only the projects named here (migration 0011). Safe to re-run:
// it adds projects, and a typed password replaces the old one.
//
//   npm run staff:add -- --org=lws-pune --email=someone@example.com --projects=soundmind-shivani
//
// It asks for the password (never pass it on the command line; it ends up in shell history). New logins are
// created already confirmed, so no invite email is sent; they sign in with email + password.
import { createInterface } from "node:readline/promises";
import { admin, flags, need, run } from "./lib";

run(async () => {
  const f = flags();
  const orgSlug = need(f, "org"), email = need(f, "email").trim().toLowerCase();
  const projectSlugs = need(f, "projects").split(",").map((s) => s.trim()).filter(Boolean);
  const db = admin();

  const { data: org } = await db.from("organizations").select("id").eq("slug", orgSlug).single();
  if (!org) throw new Error(`No organisation "${orgSlug}".`);
  const projects: { id: string; slug: string }[] = [];
  for (const slug of projectSlugs) {
    const { data: project } = await db.from("projects").select("id, slug").eq("org_id", org.id).eq("slug", slug).single();
    if (!project) throw new Error(`No project "${slug}" in ${orgSlug}.`);
    projects.push(project);
  }

  let userId: string | undefined;
  for (let page = 1; !userId; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listing users: ${error.message}`);
    userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id;
    if (data.users.length < 200) break;
  }

  const { data: existing } = userId
    ? await db.from("org_members").select("role").eq("org_id", org.id).eq("user_id", userId).maybeSingle()
    : { data: null };
  if (existing && existing.role !== "staff") throw new Error(`${email} is already ${existing.role} of ${orgSlug} and sees every project; not changed.`);

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const password = (await rl.question(userId ? "New password (leave empty to keep the current one): " : `Password for ${email}: `)).trim();
  rl.close();
  if (password && password.length < 8) throw new Error("Use a password of at least 8 characters.");

  if (!userId) {
    if (!password) throw new Error("A new login needs a password.");
    const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) throw new Error(`creating ${email}: ${error.message}`);
    userId = data.user.id;
    console.log(`✓ login ${email} created`);
  } else if (password) {
    const { error } = await db.auth.admin.updateUserById(userId, { password });
    if (error) throw new Error(`setting the password: ${error.message}`);
    console.log(`✓ password for ${email} changed`);
  }

  const { error: memErr } = await db.from("org_members").upsert({ org_id: org.id, user_id: userId, role: "staff" }, { onConflict: "org_id,user_id" });
  if (memErr) throw new Error(`membership: ${memErr.message}`);
  for (const p of projects) {
    const { error } = await db.from("project_members").upsert({ org_id: org.id, project_id: p.id, user_id: userId }, { onConflict: "project_id,user_id" });
    if (error) throw new Error(`giving ${p.slug}: ${error.message}`);
  }
  console.log(`✓ ${email} is staff of ${orgSlug} and sees: ${projects.map((p) => p.slug).join(", ")}`);
});
