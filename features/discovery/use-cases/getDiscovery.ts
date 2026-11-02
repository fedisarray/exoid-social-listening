import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import type { DiscoveryRun } from "../schemas/discoveryRun";
import { findRun, updateRun } from "../repositories/discovery";
import { getProviderSearch } from "../repositories/apify";
import { toDiscoveryRun } from "../domain/toDiscoveryRun";
export async function getDiscovery(
  ctx: OperationContext,
  id: string,
): Promise<DiscoveryRun> {
  const run = await findRun(ctx.db, ctx.userId, id);
  if (!run) throw new Error("DISCOVERY_NOT_FOUND");
  if (["completed", "failed"].includes(run.status)) return toDiscoveryRun(run);
  try {
    if (!run.provider_run_id) {
      if (Date.now() - Date.parse(run.created_at) < 60_000)
        return toDiscoveryRun(run);
      throw new Error("DISCOVERY_START_INTERRUPTED");
    }
    const remote = await getProviderSearch(run.provider_run_id);
    if (remote.status === "SUCCEEDED") {
      const updated = await updateRun(ctx.db, id, {
        status: "completed",
        results: remote.results,
      });
      return toDiscoveryRun(updated);
    }
    if (["FAILED", "ABORTED", "TIMED-OUT"].includes(remote.status))
      throw new Error("DISCOVERY_FAILED");
    return toDiscoveryRun(run);
  } catch {
    const updated = await updateRun(ctx.db, id, {
      status: "failed",
      error: "DISCOVERY_FAILED",
    });
    return toDiscoveryRun(updated);
  }
}
