import "server-only";
import { requireUser } from "@/lib/auth/dal";
import { listPropertiesInputSchema } from "../schemas/listPropertiesInput";
import { listPropertiesOutputSchema } from "../schemas/listPropertiesOutput";
import { listProperties as execute } from "../use-cases/listProperties";
import type { PropertySummary } from "../schemas/listPropertiesOutput";
export async function listProperties(raw: unknown): Promise<PropertySummary[]> {
  const input = listPropertiesInputSchema.parse(raw);
  void input;
  const ctx = await requireUser();
  const output = await execute(ctx);
  return listPropertiesOutputSchema.parse(output);
}
