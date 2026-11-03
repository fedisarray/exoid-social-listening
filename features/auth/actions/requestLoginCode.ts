"use server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { requestLoginCodeInputSchema } from "../schemas/requestLoginCodeInput";
import {
  requestLoginCodeOutputSchema,
  type RequestLoginCodeOutput,
} from "../schemas/requestLoginCodeOutput";
import { requestLoginCode as execute } from "../use-cases/requestLoginCode";
export async function requestLoginCode(
  raw: unknown,
): Promise<RequestLoginCodeOutput> {
  const input = requestLoginCodeInputSchema.parse(raw);
  const db = await createSupabaseServer();
  const output = await execute(db, input);
  return requestLoginCodeOutputSchema.parse(output);
}
