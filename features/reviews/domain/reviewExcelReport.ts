import type { Period } from "@/features/_shared/schemas/period";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";
import { reviewsEN } from "../locales/en";
import { reviewsIT } from "../locales/it";
import { comparisonTrendWindows } from "./comparisonTrendWindows";

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
};

export function reviewExcelReport(
  data: ReviewDashboard,
  period: Period,
  locale: "it" | "en",
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
  const windows = comparisonTrendWindows(data, period);
  const properties = data.coverage.filter((place) => place.role !== "anchor");
  const anchors = data.coverage.filter((place) => place.role === "anchor");
  const definitions = [
    {
      name: "reviews L12M",
      title: t.trendVolume,
      metric: "reviews",
      anchors: false,
      quarter: false,
    },
    {
      name: "score L12M",
      title: t.rating,
      metric: "rating",
      anchors: false,
      quarter: false,
    },
    {
      name: `score Q${period.quarter}`,
      title: t.trendQuarterRating,
      metric: "rating",
      anchors: false,
      quarter: true,
    },
    {
      name: "satisfied L12M",
      title: t.satisfied,
      metric: "satisfaction",
      anchors: false,
      quarter: false,
    },
    {
      name: `satisfied Q${period.quarter}`,
      title: t.trendQuarterSatisfaction,
      metric: "satisfaction",
      anchors: false,
      quarter: true,
    },
    {
      name: "score anchors",
      title: t.trendAnchorRating,
      metric: "rating",
      anchors: true,
      quarter: false,
    },
    {
      name: "satisfied anchors",
      title: t.trendAnchorSatisfaction,
      metric: "satisfaction",
      anchors: true,
      quarter: false,
    },
  ] as const;
  return {
    locale,
    sheets: definitions.map((definition): ReviewExcelSheet => {
      const places = definition.anchors ? anchors : properties;
      const ranges = definition.quarter ? windows.quarters : windows.annual;
      const label = (id: string) =>
        definition.quarter
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
          ...(places.length ? [] : [t.excelNoAnchors]),
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
