import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { getAnalysis } from "@/features/analyses/queries/getAnalysis";
import {
  latestCollection,
  listSnapshots,
  snapshotSources,
  readMetrics,
} from "../repositories/collections";
import type { GetReviewDashboardInput } from "../schemas/getReviewDashboardInput";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";
export async function getReviewDashboard(
  ctx: OperationContext,
  input: GetReviewDashboardInput,
): Promise<ReviewDashboard> {
  const analysis = await getAnalysis({ id: input.analysisId });
  if (!analysis) throw new Error("ANALYSIS_NOT_FOUND");
  const [run, snapshots] = await Promise.all([
    latestCollection(ctx.db, analysis.id),
    listSnapshots(ctx.db, analysis.id),
  ]);
  const snapshot = input.snapshotId
    ? (snapshots.find((s) => s.id === input.snapshotId) ?? null)
    : (snapshots.find((s) => s.version === analysis.version) ?? null);
  if (input.snapshotId && !snapshot) throw new Error("SNAPSHOT_NOT_FOUND");
  let metrics: ReviewDashboard["metrics"] = null;
  if (snapshot) {
    const [raw, sources] = await Promise.all([
      readMetrics(ctx.db, snapshot.id, input),
      snapshotSources(ctx.db, snapshot.id),
    ]);
    metrics = {
      ...raw,
      properties: raw.properties.map((p) => {
        const source = sources.find((s) => s.listing_id === p.listingId);
        if (!source) throw new Error("SNAPSHOT_SOURCE_MISSING");
        return { ...p, label: source.label, role: source.role };
      }),
    };
  }
  const workerStalled = Boolean(
    run &&
    run.status === "queued" &&
    Date.now() - Date.parse(run.createdAt) > 30_000,
  );
  return { run, snapshots, snapshot, metrics, workerStalled };
}
