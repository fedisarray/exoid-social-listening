import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { SignInInput } from "../schemas/signInInput";
export async function createSession(
  db: SupabaseClient<Database>,
  input: SignInInput,
): Promise<boolean> {
  const { error } = await db.auth.signInWithPassword(input);
  return !error;
}
export async function removeSession(
  db: SupabaseClient<Database>,
): Promise<void> {
  const { error } = await db.auth.signOut();
  if (error) throw error;
}
