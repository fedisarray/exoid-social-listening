import type { Period } from "@/features/_shared/schemas/period";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";
import { reviewsEN } from "../locales/en";
import { reviewsIT } from "../locales/it";
import { reviewExcelSheetPresets } from "./reviewExcelSheetPresets";
import { reviewExcelSheetWindows } from "./reviewExcelSheetWindows";
import type { ReviewExcelOptions } from "../schemas/reviewExcelOptions";
import type { WorksheetQuarterMetrics } from "../schemas/worksheetQuarterMetrics";

export type ReviewExcelData = Pick<
  ReviewDashboard,
  "metrics" | "coverage" | "snapshot" | "mode" | "comparisonReady"
> & { quarterMetrics?: WorksheetQuarterMetrics };

export type ExcelCell = string | number | null;
export type ReviewExcelSheet = {
  name: string;
  title: string;
  format: "#,##0" | "0.00" | "0.0%";
  maximum?: number;
  includeCharts?: boolean;
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
  const selected = new Set(options.listingIds);
  const scoped = {
    ...data,
    coverage: data.coverage.filter((place) => selected.has(place.listingId)),
  };
  const presets = reviewExcelSheetPresets(
    period,
    options.historyYears,
    options.includeCharts,
  );
  const metricLabels = {
    reviews: t.trendVolume,
    rating: t.rating,
    satisfaction: t.satisfied,
  };
  const windowLabels = {
    selected: t.selected,
    l12m: t.trendRollingLabel,
    annual: t.sheetWindowAnnual,
    quarterly: t.sheetWindowQuarterly,
    monthly: t.sheetWindowMonthly,
  };
  return {
    locale,
    includeCharts: options.includeCharts,
    sheets: options.sheets.map((id): ReviewExcelSheet => {
      const config = options.sheetSettings?.[id] ?? presets[id];
      const places = scoped.coverage.filter((place) => {
        switch (config.group) {
          case "all":
            return true;
          case "anchors":
            return place.role === "anchor";
          case "own":
            return place.role === "primary" || place.role === "additionalOwn";
          case "competitors":
            return place.role === "competitor";
          case "properties":
            return place.role !== "anchor";
        }
      });
      const ranges = reviewExcelSheetWindows(
        { ...scoped, coverage: places },
        period,
        config,
      );
      const label = (id: string) =>
        id === "selected" ? t.selected : id === "l12m" ? "L12M" : id;
      const title = options.sheetSettings?.[id]
        ? config.name
        : metricLabels[config.metric];
      const start =
        ranges.map((range) => range.start).sort()[0] ?? period.start;
      const end =
        ranges
          .map((range) => range.end)
          .sort()
          .at(-1) ?? period.end;
      return {
        name: config.name,
        title,
        includeCharts: config.includeCharts,
        format:
          config.metric === "reviews"
            ? "#,##0"
            : config.metric === "rating"
              ? "0.00"
              : "0.0%",
        maximum:
          config.metric === "rating"
            ? 5
            : config.metric === "satisfaction"
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
              const value = facts?.[config.metric] ?? null;
              return config.metric === "satisfaction" && value !== null
                ? value / 100
                : value;
            }),
          ]),
        ],
        notes: [
          `${title} · ${metricLabels[config.metric]} · ${windowLabels[config.window]} · Google · ${start} — ${end} (UTC)`,
          `${t.excelDataset}: ${snapshot.id} · v${snapshot.version} · ${snapshot.createdAt}`,
          t.excelMissing,
          ...(places.length ? [] : [t.exportEmptyGroup]),
          `${t.exportProperties}: ${places.length}`,
          ...(ranges.some((range) => !range.rows.length)
            ? [t.excelPartialHistory]
            : []),
          ...(config.metric === "satisfaction"
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
