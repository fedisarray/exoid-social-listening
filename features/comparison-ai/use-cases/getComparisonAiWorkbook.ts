import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { findComparisonAiImport } from "../repositories/comparisonAi";
import { listWorkbookSnapshotReviews } from "../repositories/workbooks";
import {
  findSnapshot,
  readFrozenCoverage,
  readMetrics,
} from "@/features/reviews/repositories/collections";
import { buildComparisonAiWorkbook } from "../domain/buildComparisonAiWorkbook";
import {
  comparisonAiWorkbookSchema,
  type ComparisonAiWorkbook,
} from "../schemas/comparisonAiWorkbook";
import type { GetComparisonAiWorkbookInput } from "../schemas/getComparisonAiWorkbookInput";

export async function getComparisonAiWorkbook(
  ctx: OperationContext,
  input: GetComparisonAiWorkbookInput,
): Promise<ComparisonAiWorkbook> {
  const source = await findComparisonAiImport(
    ctx.db,
    ctx.organizationId,
    input.analysisId,
    input.importId,
  );
  if (!source) throw new Error("IMPORT_NOT_FOUND");
  if (source.import_kind !== "review_rows")
    throw new Error("REVIEW_ROWS_REQUIRED");
  if (!source.source_snapshot_ids.length) throw new Error("SNAPSHOTS_REQUIRED");
  const snapshots = [];
  for (const id of source.source_snapshot_ids) {
    const snapshot = await findSnapshot(
      ctx.db,
      { analysisId: input.analysisId },
      id,
    );
    const dashboardInput = {
      analysisId: input.analysisId,
      snapshotId: id,
      period: input.period,
    };
    const [coverage, metrics, reviews] = await Promise.all([
      readFrozenCoverage(ctx.db, id),
      readMetrics(ctx.db, id, dashboardInput),
      listWorkbookSnapshotReviews(ctx.db, ctx.organizationId, id),
    ]);
    snapshots.push({ snapshot, coverage, metrics, reviews });
  }
  const workbook = buildComparisonAiWorkbook(
    input.importId,
    input.period,
    snapshots,
  );
  return comparisonAiWorkbookSchema.parse(workbook);
}
