"use server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { signInInputSchema } from "../schemas/signInInput";
import { signInOutputSchema } from "../schemas/signInOutput";
import { signIn as execute } from "../use-cases/signIn";
export async function signIn(raw: unknown): Promise<{ ok: boolean }> {
  const input = signInInputSchema.parse(raw);
  const db = await createSupabaseServer();
  const output = await execute(db, input);
  return signInOutputSchema.parse(output);
}
