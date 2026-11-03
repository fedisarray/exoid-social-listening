import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { RequestLoginCodeInput } from "../schemas/requestLoginCodeInput";
import type { RequestLoginCodeOutput } from "../schemas/requestLoginCodeOutput";
import { requestEmailCode } from "../repositories/session";
export async function requestLoginCode(
  db: SupabaseClient<Database>,
  input: RequestLoginCodeInput,
): Promise<RequestLoginCodeOutput> {
  const ok = await requestEmailCode(db, input);
  return { ok };
}
