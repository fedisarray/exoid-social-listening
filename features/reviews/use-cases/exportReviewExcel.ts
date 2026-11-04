import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { findOwnedAnalysis } from "@/features/analyses/repositories/analyses";
import {
  enqueueCollection,
  findRunSnapshot,
} from "../repositories/collections";
import { getReviewDashboard } from "./getReviewDashboard";
import { getReviewDashboardOutputSchema } from "../schemas/getReviewDashboardOutput";
import type { ExportReviewExcelInput } from "../schemas/exportReviewExcelInput";
import type { ExportReviewExcelOutput } from "../schemas/exportReviewExcelOutput";
import { reviewExcelReport } from "../domain/reviewExcelReport";
import { buildReviewExcel } from "../domain/buildReviewExcel";

export async function exportReviewExcel(
  ctx: OperationContext,
  input: ExportReviewExcelInput,
): Promise<ExportReviewExcelOutput> {
  const analysis = await findOwnedAnalysis(
    ctx.db,
    input.analysisId,
    ctx.userId,
  );
  if (!analysis) return { ok: false, code: "ANALYSIS_NOT_FOUND" };
  let snapshotId = input.snapshotId;
  if (!snapshotId) {
    if (analysis.version !== input.expectedVersion)
      return { ok: false, code: "CONFIGURATION_CHANGED" };
    try {
      // The existing transaction freezes review revisions and their historical coverage.
      const runId = await enqueueCollection(ctx.db, analysis.id, 10000);
      snapshotId = await findRunSnapshot(ctx.db, analysis.id, runId);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        ["COMPARISON_COVERAGE_INCOMPLETE", "PROPERTIES_NOT_COLLECTED"].includes(
          String(error.message),
        )
      )
        return { ok: false, code: "COVERAGE_INCOMPLETE" };
      throw error;
    }
  }
  const result = await getReviewDashboard(ctx, {
    analysisId: analysis.id,
    snapshotId,
    period: input.period,
  });
  const data = getReviewDashboardOutputSchema.parse(result);
  if (!data.snapshot || !data.comparisonReady || !data.metrics)
    return { ok: false, code: "COVERAGE_INCOMPLETE" };
  if (!input.snapshotId && data.snapshot.version !== input.expectedVersion)
    return { ok: false, code: "CONFIGURATION_CHANGED" };
  const report = reviewExcelReport(data, input.period, input.locale);
  const bytes = buildReviewExcel(report);
  return {
    ok: true,
    filename: `reviews-Q${input.period.quarter}-${input.period.year}-${snapshotId}.xlsx`,
    content: Buffer.from(bytes).toString("base64"),
    snapshotId,
  };
}
