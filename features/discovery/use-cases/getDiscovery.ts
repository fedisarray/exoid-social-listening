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
      const interrupted = await updateRun(ctx.db, id, {
        status: "failed",
        error: "DISCOVERY_START_INTERRUPTED",
      });
      return toDiscoveryRun(interrupted);
    }
    const remote = await getProviderSearch(run.provider_run_id);
    if (["FAILED", "ABORTED", "TIMED-OUT"].includes(remote.status)) {
      const failed = await updateRun(ctx.db, id, {
        status: "failed",
        results: remote.results,
        error:
          remote.status === "TIMED-OUT"
            ? "DISCOVERY_TIMED_OUT"
            : "DISCOVERY_FAILED",
      });
      return toDiscoveryRun(failed);
    }
    if (remote.status === "SUCCEEDED" || remote.results.length) {
      const updated = await updateRun(ctx.db, id, {
        status: remote.status === "SUCCEEDED" ? "completed" : "running",
        results: remote.results,
      });
      return toDiscoveryRun(updated);
    }
    return toDiscoveryRun(run);
  } catch (error) {
    // A temporary status request failure must not discard an active provider run.
    if (
      !(error instanceof Error) ||
      ![
        "APIFY_RESULTS_INVALID",
        "APIFY_RESULTS_MISSING",
        "APIFY_REQUEST_FAILED_401",
        "APIFY_REQUEST_FAILED_403",
        "APIFY_REQUEST_FAILED_404",
      ].includes(error.message)
    )
      throw error;
    const updated = await updateRun(ctx.db, id, {
      status: "failed",
      error: "DISCOVERY_FAILED",
    });
    return toDiscoveryRun(updated);
  }
}
