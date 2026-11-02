"use server";
import { requireUser } from "@/lib/auth/dal";
import { getDiscoveryInputSchema } from "../schemas/getDiscoveryInput";
import { getDiscoveryOutputSchema } from "../schemas/getDiscoveryOutput";
import { getDiscovery as execute } from "../use-cases/getDiscovery";
import type { DiscoveryRun } from "../schemas/discoveryRun";
export async function getDiscovery(raw: unknown): Promise<DiscoveryRun> {
  const input = getDiscoveryInputSchema.parse(raw);
  const ctx = await requireUser();
  const output = await execute(ctx, input.id);
  return getDiscoveryOutputSchema.parse(output);
}
