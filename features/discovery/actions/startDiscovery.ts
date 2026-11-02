"use server";
import { requireUser } from "@/lib/auth/dal";
import { startDiscoveryInputSchema } from "../schemas/startDiscoveryInput";
import { startDiscoveryOutputSchema } from "../schemas/startDiscoveryOutput";
import { startDiscovery as execute } from "../use-cases/startDiscovery";
import type { DiscoveryRun } from "../schemas/discoveryRun";
export async function startDiscovery(raw: unknown): Promise<DiscoveryRun> {
  const input = startDiscoveryInputSchema.parse(raw);
  const ctx = await requireUser();
  const output = await execute(ctx, input);
  return startDiscoveryOutputSchema.parse(output);
}
