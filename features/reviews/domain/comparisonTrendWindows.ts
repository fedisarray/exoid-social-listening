import { resolvePeriod } from "@/features/_shared/domain/period";
import type { Period } from "@/features/_shared/schemas/period";
import type {
  MetricFacts,
  ReviewDashboard,
} from "../schemas/getReviewDashboardOutput";
import { windowCovered } from "./reviewCoverage";

export type TrendWindow = {
  id: string;
  start: string;
  end: string;
  rows: (MetricFacts & { listingId: string })[];
};

export function comparisonTrendWindows(
  data: ReviewDashboard,
  period: Period,
): {
  annual: TrendWindow[];
  quarters: TrendWindow[];
} {
  const metrics = data.metrics;
  const rowsForWindow = (
    start: string,
    end: string,
    rows: TrendWindow["rows"],
  ): TrendWindow["rows"] => {
    if (!metrics || !windowCovered(data.coverage, { start, end })) return [];
    // SQL aggregates omit empty groups; verified empty windows still have zero reviews.
    return data.coverage.map(
      (place) =>
        rows.find((r) => r.listingId === place.listingId) ?? {
          listingId: place.listingId,
          reviews: 0,
          ratedCount: 0,
          rating: null,
          satisfaction: null,
          textReviews: 0,
          identifiedReviews: 0,
          identifiedReviewers: 0,
        },
    );
  };
  const lastYear = Number(period.end.slice(0, 4));
  const years = new Set(metrics?.annual.map((r) => r.bucket) ?? []);
  const quarterYears = new Set([
    ...(metrics?.quarters.map((r) => r.bucket) ?? []),
    String(period.year),
  ]);
  const coveredYears = data.coverage.flatMap((p) =>
    p.covered.map((r) => Number(r.start.slice(0, 4))),
  );
  const firstYear = Math.min(lastYear, period.year, ...coveredYears);
  for (let year = firstYear; year < lastYear; year++) years.add(String(year));
  for (let year = firstYear; year <= period.year; year++)
    quarterYears.add(String(year));
  const annual = [...years].sort().map((year) => {
    const start = `${year}-01-01`,
      end = `${year}-12-31`;
    return {
      id: year,
      start,
      end,
      rows: rowsForWindow(
        start,
        end,
        metrics?.annual.filter((r) => r.bucket === year) ?? [],
      ),
    };
  });
  const rolling = resolvePeriod({
    ...period,
    kind: "l12m",
    cutoff: period.end,
  });
  const start = metrics?.rollingStart ?? rolling.start;
  const end = metrics?.rollingEnd ?? rolling.end;
  annual.push({
    id: "l12m",
    start,
    end,
    rows: rowsForWindow(start, end, metrics?.rolling ?? []),
  });
  const quarters = [...quarterYears].sort().map((year) => {
    const range = resolvePeriod({
      ...period,
      kind: "quarter",
      year: Number(year),
    });
    return {
      id: year,
      start: range.start,
      end: range.end,
      rows: rowsForWindow(
        range.start,
        range.end,
        metrics?.quarters.filter((r) => r.bucket === year) ?? [],
      ),
    };
  });
  return { annual, quarters };
}
