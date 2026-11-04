import { z } from "zod";
export const listComparisonReportsInputSchema = z
  .object({ analysisId: z.uuid() })
  .strict();
export type ListComparisonReportsInput = z.infer<
  typeof listComparisonReportsInputSchema
>;
