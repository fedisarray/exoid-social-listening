"use server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { verifyLoginCodeInputSchema } from "../schemas/verifyLoginCodeInput";
import {
  verifyLoginCodeOutputSchema,
  type VerifyLoginCodeOutput,
} from "../schemas/verifyLoginCodeOutput";
import { verifyLoginCode as execute } from "../use-cases/verifyLoginCode";
export async function verifyLoginCode(
  raw: unknown,
): Promise<VerifyLoginCodeOutput> {
  const input = verifyLoginCodeInputSchema.parse(raw);
  const db = await createSupabaseServer();
  const output = await execute(db, input);
  return verifyLoginCodeOutputSchema.parse(output);
}
