import { z } from "zod";
import {
  comparisonReportSchema,
  reportErrorCodeSchema,
} from "./comparisonReport";
export const listComparisonReportsOutputSchema = z.object({
  reports: z.array(comparisonReportSchema),
  configurationError: reportErrorCodeSchema.nullable(),
});
export type ListComparisonReportsOutput = z.infer<
  typeof listComparisonReportsOutputSchema
>;
