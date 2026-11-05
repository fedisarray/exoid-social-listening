import type { Period } from "@/features/_shared/schemas/period";
import type { ReviewExcelSheetConfig } from "../schemas/reviewExcelSheetConfig";
import type { ReviewExcelData } from "./reviewExcelReport";
import {
  comparisonTrendWindows,
  type TrendWindow,
} from "./comparisonTrendWindows";
import { windowCovered } from "./reviewCoverage";
import { resolvePeriod } from "@/features/_shared/domain/period";

export function reviewExcelSheetWindows(
  data: ReviewExcelData,
  period: Period,
  config: ReviewExcelSheetConfig,
): TrendWindow[] {
  const metrics = data.metrics;
  if (!metrics) return [];
  const empty = {
    reviews: 0,
    ratedCount: 0,
    rating: null,
    satisfaction: null,
    textReviews: 0,
    identifiedReviews: 0,
    identifiedReviewers: 0,
  };
  const rows = (
    start: string,
    end: string,
    facts: TrendWindow["rows"],
  ): TrendWindow["rows"] =>
    windowCovered(data.coverage, { start, end })
      ? data.coverage.map(
          (place) =>
            facts.find((row) => row.listingId === place.listingId) ?? {
              ...empty,
              listingId: place.listingId,
            },
        )
      : [];
  if (config.window === "monthly") {
    const result: TrendWindow[] = [];
    const cursor = new Date(`${period.start.slice(0, 7)}-01T00:00:00Z`);
    while (cursor.toISOString().slice(0, 10) <= period.end) {
      const bucket = cursor.toISOString().slice(0, 7);
      const first = `${bucket}-01`;
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      const last = new Date(cursor.getTime() - 86400000)
        .toISOString()
        .slice(0, 10);
      const start = first < period.start ? period.start : first;
      const end = last > period.end ? period.end : last;
      result.push({
        id: bucket,
        start,
        end,
        rows: rows(
          start,
          end,
          metrics.monthly.filter((row) => row.bucket === bucket),
        ),
      });
    }
    return result;
  }
  if (
    config.window === "selected" ||
    (config.window === "quarterly" &&
      period.kind !== "quarter" &&
      !config.quarter)
  )
    return [
      {
        id: "selected",
        start: period.start,
        end: period.end,
        rows: rows(period.start, period.end, metrics.properties),
      },
    ];
  if (config.window === "quarterly") {
    const quarter = config.quarter ?? period.quarter;
    const year = config.year ?? period.year;
    const key = String(quarter) as keyof NonNullable<
      ReviewExcelData["quarterMetrics"]
    >;
    const facts =
      data.quarterMetrics?.[key] ??
      (period.kind === "quarter" &&
      period.quarter === quarter &&
      year <= period.year
        ? metrics.quarters
        : undefined);
    if (!facts) throw new Error("QUARTER_METRICS_REQUIRED");
    const quarterPeriod = resolvePeriod({
      ...period,
      kind: "quarter",
      quarter,
      year,
    });
    const windows = comparisonTrendWindows(
      { ...data, metrics: { ...metrics, quarters: facts } },
      quarterPeriod,
    );
    return windows.quarters
      .filter(
        (window) =>
          Number(window.id) >= year - config.historyYears &&
          Number(window.id) <= year,
      )
      .map((window) => ({ ...window, id: `Q${quarter} ${window.id}` }));
  }
  const windows = comparisonTrendWindows(data, period);
  const year = Number(period.end.slice(0, 4));
  return windows.annual.filter(
    (window) =>
      window.id === "l12m" ||
      (config.window === "annual" &&
        config.historyYears > 0 &&
        Number(window.id) >= year - config.historyYears &&
        Number(window.id) < year),
  );
}
