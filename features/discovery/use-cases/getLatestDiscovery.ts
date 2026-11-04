import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import type { DiscoveryRun } from "../schemas/discoveryRun";
import { findLatestRun } from "../repositories/discovery";
import { getDiscovery } from "./getDiscovery";

export async function getLatestDiscovery(
  ctx: OperationContext,
): Promise<DiscoveryRun | null> {
  const run = await findLatestRun(ctx.db, ctx.organizationId);
  if (!run) return null;
  return getDiscovery(ctx, run.id);
}
