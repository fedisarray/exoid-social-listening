"use server";
import { requireUser } from "@/lib/auth/dal";
import { addPropertyInputSchema } from "../schemas/addPropertyInput";
import { addPropertyOutputSchema } from "../schemas/addPropertyOutput";
import { addProperty as execute } from "../use-cases/addProperty";
import type { Property } from "../schemas/property";
export async function addProperty(raw: unknown): Promise<Property> {
  const input = addPropertyInputSchema.parse(raw);

  const ctx = await requireUser();
  const output = await execute(ctx, input.sourceId);
  return addPropertyOutputSchema.parse(output);
}
