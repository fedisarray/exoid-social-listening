import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { getProperty } from "@/features/properties/queries/getProperty";
import { getAnalysis } from "@/features/analyses/queries/getAnalysis";
import {
  latestCollection,
  listSnapshots,
  readMetrics,
  readStoredDashboard,
  readFrozenCoverage,
  findSnapshot,
} from "../repositories/collections";
import {
  previousReviewPeriod,
  reviewIndicators,
} from "../domain/reviewIndicators";
import { reviewCoverage, windowCovered } from "../domain/reviewCoverage";
import type { GetReviewDashboardInput } from "../schemas/getReviewDashboardInput";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";
export async function getReviewDashboard(
  ctx: OperationContext,
  input: GetReviewDashboardInput,
): Promise<ReviewDashboard> {
  const entity = input.propertyId
    ? await getProperty({ id: input.propertyId })
    : await getAnalysis({ id: input.analysisId });
  if (!entity) throw new Error("SCOPE_NOT_FOUND");
  const scope = input.propertyId
    ? { propertyId: entity.id }
    : { analysisId: entity.id };
  const [run, snapshots, snapshot] = await Promise.all([
    latestCollection(ctx.db, scope, input.snapshotId),
    listSnapshots(ctx.db, scope),
    input.snapshotId
      ? findSnapshot(ctx.db, scope, input.snapshotId)
      : Promise.resolve(null),
  ]);
  const stored = snapshot
    ? await Promise.all([
        readMetrics(ctx.db, snapshot.id, input),
        readFrozenCoverage(ctx.db, snapshot.id),
      ]).then(([metrics, coverage]) => ({ metrics, coverage }))
    : await readStoredDashboard(ctx.db, input);
  const coverage = reviewCoverage(
    stored.coverage,
    input.period,
    new Date().toISOString().slice(0, 10),
  ).map((state) =>
    snapshot && state.reason === "placeRemoved"
      ? { ...state, reason: "incomplete" as const }
      : state,
  );
  const comparisonReady = windowCovered(coverage, input.period);
  const raw = stored.metrics;
  const previousPeriod = previousReviewPeriod(input.period);
  const previousInput = { ...input, period: previousPeriod };
  const previous =
    comparisonReady && windowCovered(coverage, previousPeriod)
      ? snapshot
        ? await readMetrics(ctx.db, snapshot.id, previousInput)
        : await readStoredDashboard(ctx.db, previousInput).then((result) =>
            windowCovered(result.coverage, previousPeriod)
              ? result.metrics
              : null,
          )
      : null;
  const primaryId = coverage.find(
    (place) => place.role === "primary",
  )?.listingId;
  const indicators = reviewIndicators(
    raw,
    previous,
    previousPeriod,
    primaryId,
    comparisonReady,
  );
  const yearCovered = (year: string) =>
    windowCovered(coverage, { start: `${year}-01-01`, end: `${year}-12-31` });
  const quarterCovered = (year: string) => {
    const month = (input.period.quarter - 1) * 3;
    return windowCovered(coverage, {
      start: new Date(Date.UTC(Number(year), month, 1))
        .toISOString()
        .slice(0, 10),
      end: new Date(Date.UTC(Number(year), month + 3, 0))
        .toISOString()
        .slice(0, 10),
    });
  };
  const metrics =
    comparisonReady ||
    (input.propertyId && raw.properties.some((property) => property.available))
      ? {
          ...raw,
          properties: raw.properties.map((property) => {
            const state = coverage.find(
              (s) => s.listingId === property.listingId,
            );
            if (!state) throw new Error("COVERAGE_SOURCE_MISSING");
            return {
              ...property,
              available: comparisonReady || property.available,
              label: state.label,
              role: state.role,
            };
          }),
          annual: raw.annual.filter((row) => yearCovered(row.bucket)),
          quarters: raw.quarters.filter((row) => quarterCovered(row.bucket)),
          rolling: windowCovered(coverage, {
            start: raw.rollingStart,
            end: raw.rollingEnd,
          })
            ? raw.rolling
            : [],
        }
      : null;
  const workerStalled = Boolean(
    (run?.status === "queued" &&
      Date.now() - Date.parse(run.createdAt) > 30_000) ||
    coverage.some(
      (state) =>
        state.activeRun?.status === "queued" &&
        Date.now() - Date.parse(state.activeRun.createdAt) > 30_000,
    ),
  );
  return {
    mode: snapshot ? "frozen" : "live",
    run,
    snapshots,
    snapshot,
    coverage,
    comparisonReady,
    metrics,
    workerStalled,
    indicators,
  };
}
