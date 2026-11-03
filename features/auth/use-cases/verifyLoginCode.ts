import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { VerifyLoginCodeInput } from "../schemas/verifyLoginCodeInput";
import type { VerifyLoginCodeOutput } from "../schemas/verifyLoginCodeOutput";
import { verifyEmailCode } from "../repositories/session";
export async function verifyLoginCode(
  db: SupabaseClient<Database>,
  input: VerifyLoginCodeInput,
): Promise<VerifyLoginCodeOutput> {
  const ok = await verifyEmailCode(db, input);
  return { ok };
}
