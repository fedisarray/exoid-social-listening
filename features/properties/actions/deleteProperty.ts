"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/dal";
import { deletePropertyInputSchema } from "../schemas/deletePropertyInput";
import {
  deletePropertyOutputSchema,
  type DeletePropertyOutput,
} from "../schemas/deletePropertyOutput";
import { deleteProperty as execute } from "../use-cases/deleteProperty";
export async function deleteProperty(
  raw: unknown,
): Promise<DeletePropertyOutput> {
  const input = deletePropertyInputSchema.parse(raw);
  const ctx = await requireUser();
  const output = await execute(ctx, input.id);
  const result = deletePropertyOutputSchema.parse(output);
  if (result.ok) revalidatePath("/properties");
  return result;
}
