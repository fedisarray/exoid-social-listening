import { z } from "zod";
export const getComparisonReportDownloadInputSchema = z
  .object({ reportId: z.uuid() })
  .strict();
export type GetComparisonReportDownloadInput = z.infer<
  typeof getComparisonReportDownloadInputSchema
>;
