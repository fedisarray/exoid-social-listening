import { z } from "zod";
import { rawMetricsSchema } from "./getReviewDashboardOutput";

export const worksheetQuarterMetricsSchema = z.partialRecord(
  z.enum(["1", "2", "3", "4"]),
  rawMetricsSchema.shape.quarters,
);
export type WorksheetQuarterMetrics = z.infer<
  typeof worksheetQuarterMetricsSchema
>;
