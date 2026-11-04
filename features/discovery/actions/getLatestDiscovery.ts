"use server";

import { requireUser } from "@/lib/auth/dal";
import { getLatestDiscoveryInputSchema } from "../schemas/getLatestDiscoveryInput";
import { getLatestDiscoveryOutputSchema } from "../schemas/getLatestDiscoveryOutput";
import { getLatestDiscovery as execute } from "../use-cases/getLatestDiscovery";
import type { DiscoveryRun } from "../schemas/discoveryRun";

export async function getLatestDiscovery(
  raw: unknown,
): Promise<DiscoveryRun | null> {
  const input = getLatestDiscoveryInputSchema.parse(raw);
  void input;
  const ctx = await requireUser();
  const output = await execute(ctx);
  return getLatestDiscoveryOutputSchema.parse(output);
}
