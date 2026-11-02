import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const password = process.env.LOCAL_ANALYST_PASSWORD;
if (!url || !key || !password || password.length < 12)
  throw new Error(
    "Set local URL, secret key, and LOCAL_ANALYST_PASSWORD (12+ characters) in .env.local.",
  );
if (!["127.0.0.1", "localhost"].includes(new URL(url).hostname))
  throw new Error("Seeding is restricted to local Supabase.");
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await db.auth.admin.listUsers();
if (error) throw error;
for (const email of ["analyst@exoid.local", "second@exoid.local"]) {
  const existing = data.users.find((user) => user.email === email);
  const result = existing
    ? await db.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
      })
    : await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (result.error) throw result.error;
  console.log(`Local account ready: ${email}`);
}
