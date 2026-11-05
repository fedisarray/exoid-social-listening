import {
  reviewExcelReport,
  type ReviewExcelData,
  type ReviewExcelReport,
} from "@/features/reviews/domain/reviewExcelReport";
import { reviewExcelSheets } from "@/features/reviews/schemas/reviewExcelOptions";
import { reviewCoverage } from "@/features/reviews/domain/reviewCoverage";
import type { Period } from "@/features/_shared/schemas/period";
import type { FrozenReportData } from "../schemas/frozenReportData";
export function reportWorkbook(
  data: FrozenReportData,
  period: Period,
  locale: "it" | "en",
  createdAt: string,
): ReviewExcelReport {
  const options = data.exportOptions ?? {
    listingIds: data.coverage.map((place) => place.listingId),
    sheets: [...reviewExcelSheets],
    historyYears: 5,
    includeCharts: true,
  };
  const ids = new Set(options.listingIds);
  const coverage = reviewCoverage(
    data.coverage.filter((place) => ids.has(place.listingId)),
    period,
    createdAt.slice(0, 10),
  );
  const metrics: NonNullable<ReviewExcelData["metrics"]> = {
    ...data.metrics,
    samples: [],
    properties: data.metrics.properties
      .filter((row) => ids.has(row.listingId))
      .map((row) => {
        const place = coverage.find(
          (place) => place.listingId === row.listingId,
        );
        if (!place) throw new Error("REPORT_COVERAGE_INVALID");
        return { ...row, label: place.label, role: place.role };
      }),
  };
  return reviewExcelReport(
    {
      metrics,
      quarterMetrics: data.quarterMetrics,
      coverage,
      snapshot: data.snapshot,
      mode: "frozen",
      comparisonReady: true,
    },
    period,
    locale,
    { ...options, includeCharts: true },
  );
}
