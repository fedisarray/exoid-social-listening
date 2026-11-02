import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { SignInInput } from "../schemas/signInInput";
import { createSession } from "../repositories/session";
export async function signIn(
  db: SupabaseClient<Database>,
  input: SignInInput,
): Promise<{ ok: boolean }> {
  const ok = await createSession(db, input);
  return { ok };
}
