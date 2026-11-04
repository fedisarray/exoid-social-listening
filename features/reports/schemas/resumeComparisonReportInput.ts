import { z } from "zod";
export const resumeComparisonReportInputSchema = z
  .object({ analysisId: z.uuid() })
  .strict();
export type ResumeComparisonReportInput = z.infer<
  typeof resumeComparisonReportInputSchema
>;
