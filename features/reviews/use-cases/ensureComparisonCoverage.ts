import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import {
  ensureCoverage,
  wakeCollectionWorker,
} from "../repositories/collections";
import type { EnsureComparisonCoverageInput } from "../schemas/ensureComparisonCoverageInput";
import type { EnsureComparisonCoverageOutput } from "../schemas/ensureComparisonCoverageOutput";
export async function ensureComparisonCoverage(
  ctx: OperationContext,
  input: EnsureComparisonCoverageInput,
): Promise<EnsureComparisonCoverageOutput> {
  if (!process.env.APIFY_TOKEN)
    return { ok: false, code: "APIFY_NOT_CONFIGURED" };
  if (
    !process.env.COLLECTION_WORKER_SECRET ||
    process.env.COLLECTION_WORKER_SECRET.length < 32
  )
    return { ok: false, code: "WORKER_NOT_CONFIGURED" };
  await ensureCoverage(ctx.db, input);
  const awake = await wakeCollectionWorker();
  if (!awake) return { ok: false, code: "WORKER_UNAVAILABLE" };
  return { ok: true };
}
