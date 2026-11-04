import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key)
  throw new Error("Set the local URL and secret key in .env.local.");
if (!["127.0.0.1", "localhost"].includes(new URL(url).hostname))
  throw new Error("Seeding is restricted to local Supabase.");
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await db.auth.admin.listUsers();
if (error) throw error;
for (const email of ["fedi.sarray@exoid.io", "second@exoid.local"]) {
  const existing = data.users.find((user) => user.email === email);
  const result = existing
    ? await db.auth.admin.updateUserById(existing.id, {
        email_confirm: true,
      })
    : await db.auth.admin.createUser({ email, email_confirm: true });
  if (result.error) throw result.error;
  const userId = result.data.user.id;
  const membership = await db
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (membership.error) throw membership.error;
  if (!membership.data) {
    const provisioned = await db.rpc("provision_organization", {
      p_user_id: userId,
      p_name: `Workspace ${userId.slice(0, 8)}`,
    });
    if (provisioned.error) throw provisioned.error;
  }
  console.log(`Local account ready: ${email}`);
}
