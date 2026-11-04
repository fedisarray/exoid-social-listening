import "server-only";
import { requireUser } from "@/lib/auth/dal";
import { getPropertyInputSchema } from "../schemas/getPropertyInput";
import { getPropertyOutputSchema } from "../schemas/getPropertyOutput";
import { getProperty as execute } from "../use-cases/getProperty";
import type { Property } from "../schemas/property";
export async function getProperty(raw: unknown): Promise<Property | null> {
  const input = getPropertyInputSchema.parse(raw);

  const ctx = await requireUser();
  const output = await execute(ctx, input.id);
  return getPropertyOutputSchema.parse(output);
}
