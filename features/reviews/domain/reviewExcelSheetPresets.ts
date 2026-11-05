import type { Period } from "@/features/_shared/schemas/period";
import type { ReviewExcelOptions } from "../schemas/reviewExcelOptions";
import type { ReviewExcelSheetConfig } from "../schemas/reviewExcelSheetConfig";

export function reviewExcelSheetPresets(
  period: Period,
  historyYears = 5,
  includeCharts = true,
): Record<ReviewExcelOptions["sheets"][number], ReviewExcelSheetConfig> {
  const base = { historyYears, includeCharts };
  return {
    reviews: {
      ...base,
      name: "reviews L12M",
      metric: "reviews",
      window: "annual",
      group: "properties",
    },
    rating: {
      ...base,
      name: "score L12M",
      metric: "rating",
      window: "annual",
      group: "properties",
    },
    quarterRating: {
      ...base,
      name:
        period.kind === "quarter" ? `score Q${period.quarter}` : "score period",
      metric: "rating",
      window: period.kind === "quarter" ? "quarterly" : "selected",
      quarter: period.quarter,
      year: period.year,
      group: "properties",
    },
    satisfaction: {
      ...base,
      name: "satisfied L12M",
      metric: "satisfaction",
      window: "annual",
      group: "properties",
    },
    quarterSatisfaction: {
      ...base,
      name:
        period.kind === "quarter"
          ? `satisfied Q${period.quarter}`
          : "satisfied period",
      metric: "satisfaction",
      window: period.kind === "quarter" ? "quarterly" : "selected",
      quarter: period.quarter,
      year: period.year,
      group: "properties",
    },
    anchorRating: {
      ...base,
      name: "score anchors",
      metric: "rating",
      window: "annual",
      group: "anchors",
    },
    anchorSatisfaction: {
      ...base,
      name: "satisfied anchors",
      metric: "satisfaction",
      window: "annual",
      group: "anchors",
    },
  };
}
