import { reviewExcelOptionsSchema } from "@/features/reviews/schemas/reviewExcelOptions";
import { z } from "zod";
import { worksheetQuarterMetricsSchema } from "@/features/reviews/schemas/worksheetQuarterMetrics";
import { rawMetricsSchema } from "@/features/reviews/schemas/getReviewDashboardOutput";
import { storedCoverageSchema } from "@/features/reviews/schemas/reviewCoverage";
import { snapshotSchema } from "@/features/reviews/schemas/collection";
export const frozenReportDataSchema = z.object({
  name: z.string(),
  exportOptions: reviewExcelOptionsSchema.optional(),
  quarterMetrics: worksheetQuarterMetricsSchema.optional(),
  snapshot: snapshotSchema,
  metrics: rawMetricsSchema.omit({ samples: true }),
  coverage: z.array(storedCoverageSchema),
  sharedL12M: z
    .object({
      start: z.iso.date(),
      end: z.iso.date(),
      available: z.boolean(),
      rows: rawMetricsSchema.shape.shared,
    })
    .optional(),
});
export type FrozenReportData = z.infer<typeof frozenReportDataSchema>;
