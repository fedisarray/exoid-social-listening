import { z } from "zod";
export const cancelComparisonReportInputSchema = z
  .object({ reportId: z.uuid() })
  .strict();
export type CancelComparisonReportInput = z.infer<
  typeof cancelComparisonReportInputSchema
>;
