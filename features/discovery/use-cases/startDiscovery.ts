import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import type { StartDiscoveryInput } from "../schemas/startDiscoveryInput";
import type { DiscoveryRun } from "../schemas/discoveryRun";
import { insertRun, updateRun } from "../repositories/discovery";
import { startProviderSearch } from "../repositories/apify";
import { toDiscoveryRun } from "../domain/toDiscoveryRun";
export async function startDiscovery(
  ctx: OperationContext,
  input: StartDiscoveryInput,
): Promise<DiscoveryRun> {
  const run = await insertRun(ctx.db, ctx.userId, input);
  try {
    const providerId = await startProviderSearch(input);
    const updated = await updateRun(ctx.db, run.id, {
      provider_run_id: providerId,
      status: "running",
    });
    return toDiscoveryRun(updated);
  } catch (error) {
    const code =
      error instanceof Error && error.message === "APIFY_NOT_CONFIGURED"
        ? "APIFY_NOT_CONFIGURED"
        : "DISCOVERY_FAILED";
    const updated = await updateRun(ctx.db, run.id, {
      status: "failed",
      error: code,
    });
    return toDiscoveryRun(updated);
  }
}
