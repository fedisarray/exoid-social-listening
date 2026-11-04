import type { Period } from "@/features/_shared/schemas/period";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";
import { reviewsEN } from "../locales/en";
import { reviewsIT } from "../locales/it";
import { comparisonTrendWindows } from "./comparisonTrendWindows";
import type { ReviewExcelOptions } from "../schemas/reviewExcelOptions";

export type ReviewExcelData = Pick<
  ReviewDashboard,
  "metrics" | "coverage" | "snapshot" | "mode" | "comparisonReady"
>;

export type ExcelCell = string | number | null;
export type ReviewExcelSheet = {
  name: string;
  title: string;
  format: "#,##0" | "0.00" | "0.0%";
  maximum?: number;
  rows: ExcelCell[][];
  notes: string[];
  samples: ExcelCell[][];
};
export type ReviewExcelReport = {
  locale: "it" | "en";
  sheets: ReviewExcelSheet[];
  includeCharts: boolean;
};

export function reviewExcelReport(
  data: ReviewExcelData,
  period: Period,
  locale: "it" | "en",
  options: ReviewExcelOptions,
): ReviewExcelReport {
  if (
    !data.snapshot ||
    !data.metrics ||
    data.mode !== "frozen" ||
    !data.comparisonReady
  )
    throw new Error("FROZEN_DATASET_REQUIRED");
  const t = locale === "it" ? reviewsIT : reviewsEN;
  const snapshot = data.snapshot;
  const metrics = data.metrics;
  const selected = new Set(options.listingIds);
  const scoped = {
    ...data,
    coverage: data.coverage.filter((place) => selected.has(place.listingId)),
  };
  const windows = comparisonTrendWindows(scoped, period);
  const historyStart = Number(period.end.slice(0, 4)) - options.historyYears;
  windows.annual = windows.annual.filter(
    (window) =>
      window.id === "l12m" ||
      (options.historyYears > 0 &&
        Number(window.id) >= historyStart &&
        Number(window.id) < Number(period.end.slice(0, 4))),
  );
  windows.quarters = windows.quarters.filter(
    (window) =>
      Number(window.id) >= period.year - options.historyYears &&
      Number(window.id) <= period.year,
  );
  const properties = scoped.coverage.filter((place) => place.role !== "anchor");
  const anchors = scoped.coverage.filter((place) => place.role === "anchor");
  const selectedWindow = [
    {
      id: t.selected,
      start: period.start,
      end: period.end,
      rows: scoped.coverage.map(
        (place) =>
          metrics.properties.find(
            (row) => row.listingId === place.listingId,
          ) ?? {
            listingId: place.listingId,
            reviews: 0,
            ratedCount: 0,
            rating: null,
            satisfaction: null,
            textReviews: 0,
            identifiedReviews: 0,
            identifiedReviewers: 0,
          },
      ),
    },
  ];
  const definitions = [
    {
      id: "reviews",
      name: "reviews L12M",
      title: t.trendVolume,
      metric: "reviews",
      anchors: false,
      quarter: false,
    },
    {
      id: "rating",
      name: "score L12M",
      title: t.rating,
      metric: "rating",
      anchors: false,
      quarter: false,
    },
    {
      id: "quarterRating",
      name:
        period.kind === "quarter" ? `score Q${period.quarter}` : "score period",
      title:
        period.kind === "quarter" ? t.trendQuarterRating : t.exportPeriodRating,
      metric: "rating",
      anchors: false,
      quarter: true,
    },
    {
      id: "satisfaction",
      name: "satisfied L12M",
      title: t.satisfied,
      metric: "satisfaction",
      anchors: false,
      quarter: false,
    },
    {
      id: "quarterSatisfaction",
      name:
        period.kind === "quarter"
          ? `satisfied Q${period.quarter}`
          : "satisfied period",
      title:
        period.kind === "quarter"
          ? t.trendQuarterSatisfaction
          : t.exportPeriodSatisfaction,
      metric: "satisfaction",
      anchors: false,
      quarter: true,
    },
    {
      id: "anchorRating",
      name: "score anchors",
      title: t.trendAnchorRating,
      metric: "rating",
      anchors: true,
      quarter: false,
    },
    {
      id: "anchorSatisfaction",
      name: "satisfied anchors",
      title: t.trendAnchorSatisfaction,
      metric: "satisfaction",
      anchors: true,
      quarter: false,
    },
  ] as const;
  return {
    locale,
    includeCharts: options.includeCharts,
    sheets: definitions
      .filter((definition) => options.sheets.includes(definition.id))
      .map((definition): ReviewExcelSheet => {
        const places = definition.anchors ? anchors : properties;
        const ranges = definition.quarter
          ? period.kind === "quarter"
            ? windows.quarters
            : selectedWindow
          : windows.annual;
        const label = (id: string) =>
          definition.quarter && period.kind === "quarter"
            ? `Q${period.quarter} ${id}`
            : id === "l12m"
              ? "L12M"
              : id;
        return {
          name: definition.name,
          title: definition.title,
          format:
            definition.metric === "reviews"
              ? "#,##0"
              : definition.metric === "rating"
                ? "0.00"
                : "0.0%",
          maximum:
            definition.metric === "rating"
              ? 5
              : definition.metric === "satisfaction"
                ? 1
                : undefined,
          rows: [
            [t.bucket, ...places.map((place) => place.label)],
            ...ranges.map((range) => [
              label(range.id),
              ...places.map((place) => {
                const facts = range.rows.find(
                  (row) => row.listingId === place.listingId,
                );
                const value = facts?.[definition.metric] ?? null;
                return definition.metric === "satisfaction" && value !== null
                  ? value / 100
                  : value;
              }),
            ]),
          ],
          notes: [
            `${definition.title} · Google · ${period.start} — ${period.end} (UTC)`,
            `${t.excelDataset}: ${snapshot.id} · v${snapshot.version} · ${snapshot.createdAt}`,
            t.excelMissing,
            ...(places.length ? [] : [t.exportEmptyGroup]),
            `${t.exportProperties}: ${scoped.coverage.length}`,
            ...(ranges.some((range) => !range.rows.length)
              ? [t.excelPartialHistory]
              : []),
            ...(definition.metric === "satisfaction"
              ? [t.excelSatisfactionMethod]
              : []),
            t.excelSource,
            t.excelSamples,
          ],
          samples: [
            [t.bucket, t.excelDates, ...places.map((place) => place.label)],
            ...ranges.map((range) => [
              label(range.id),
              `${range.start} — ${range.end} (UTC)`,
              ...places.map((place) => {
                const facts = range.rows.find(
                  (row) => row.listingId === place.listingId,
                );
                return facts?.ratedCount ?? null;
              }),
            ]),
          ],
        };
      }),
  };
}
