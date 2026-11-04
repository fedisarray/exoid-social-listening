import { z } from "zod";
export const processComparisonReportOutputSchema = z.object({
  worked: z.boolean(),
  nextAttemptAt: z.iso.datetime({ offset: true }).nullable(),
});
export type ProcessComparisonReportOutput = z.infer<
  typeof processComparisonReportOutputSchema
>;
