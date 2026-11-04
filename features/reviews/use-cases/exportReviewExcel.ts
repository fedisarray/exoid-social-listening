import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { findOwnedAnalysis } from "@/features/analyses/repositories/analyses";
import {
  enqueueCollection,
  findRunSnapshot,
  findSnapshot,
  readMetrics,
  readFrozenCoverage,
} from "../repositories/collections";
import { reviewCoverage, windowCovered } from "../domain/reviewCoverage";
import type { ExportReviewExcelInput } from "../schemas/exportReviewExcelInput";
import type { ExportReviewExcelOutput } from "../schemas/exportReviewExcelOutput";
import {
  reviewExcelReport,
  type ReviewExcelData,
} from "../domain/reviewExcelReport";
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
    if (
      input.options.listingIds.some(
        (id) =>
          !analysis.config.listings.some((place) => place.sourceId === id),
      )
    )
      return { ok: false, code: "INVALID_SELECTION" };
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
  const dashboardInput = {
    analysisId: analysis.id,
    snapshotId,
    period: input.period,
  };
  const snapshot = await findSnapshot(
    ctx.db,
    { analysisId: analysis.id },
    snapshotId,
  );
  const [raw, storedCoverage] = await Promise.all([
    readMetrics(ctx.db, snapshot.id, dashboardInput),
    readFrozenCoverage(ctx.db, snapshot.id),
  ]);
  const selectedIds = new Set(input.options.listingIds);
  if (
    input.options.listingIds.some(
      (id) => !storedCoverage.some((place) => place.listingId === id),
    )
  )
    return { ok: false, code: "INVALID_SELECTION" };
  const coverage = reviewCoverage(
    storedCoverage.filter((place) => selectedIds.has(place.listingId)),
    input.period,
    new Date().toISOString().slice(0, 10),
  );
  if (!windowCovered(coverage, input.period))
    return { ok: false, code: "COVERAGE_INCOMPLETE" };
  if (!input.snapshotId && snapshot.version !== input.expectedVersion)
    return { ok: false, code: "CONFIGURATION_CHANGED" };
  const data: ReviewExcelData = {
    mode: "frozen",
    snapshot,
    coverage,
    comparisonReady: true,
    metrics: {
      ...raw,
      properties: raw.properties
        .filter((property) => selectedIds.has(property.listingId))
        .map((property) => {
          const place = coverage.find(
            (place) => place.listingId === property.listingId,
          )!;
          return { ...property, label: place.label, role: place.role };
        }),
    },
  };
  const report = reviewExcelReport(
    data,
    input.period,
    input.locale,
    input.options,
  );
  const bytes = buildReviewExcel(report);
  return {
    ok: true,
    filename: `reviews-${input.period.start}-${input.period.end}-${snapshotId}.xlsx`,
    content: Buffer.from(bytes).toString("base64"),
    snapshotId,
  };
}
