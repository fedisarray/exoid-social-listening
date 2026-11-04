import { z } from "zod";
export const cancelComparisonReportOutputSchema = z.object({
  cancelled: z.boolean(),
});
export type CancelComparisonReportOutput = z.infer<
  typeof cancelComparisonReportOutputSchema
>;
