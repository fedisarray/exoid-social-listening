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
  console.log(`Local account ready: ${email}`);
}
