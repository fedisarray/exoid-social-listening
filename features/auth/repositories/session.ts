import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { RequestLoginCodeInput } from "../schemas/requestLoginCodeInput";
import type { VerifyLoginCodeInput } from "../schemas/verifyLoginCodeInput";
export async function requestEmailCode(
  db: SupabaseClient<Database>,
  input: RequestLoginCodeInput,
): Promise<boolean> {
  const { error } = await db.auth.signInWithOtp({
    email: input.email,
    options: { shouldCreateUser: false },
  });
  return !error;
}
export async function verifyEmailCode(
  db: SupabaseClient<Database>,
  input: VerifyLoginCodeInput,
): Promise<boolean> {
  const { error } = await db.auth.verifyOtp({
    email: input.email,
    token: input.token,
    type: "email",
  });
  return !error;
}
export async function removeSession(
  db: SupabaseClient<Database>,
): Promise<void> {
  const { error } = await db.auth.signOut();
  if (error) throw error;
}
