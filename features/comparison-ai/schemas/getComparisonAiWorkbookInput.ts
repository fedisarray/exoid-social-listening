import { z } from "zod";
import { periodSchema } from "@/features/_shared/schemas/period";
export const getComparisonAiWorkbookInputSchema = z.object({
  analysisId: z.uuid(),
  importId: z.uuid(),
  period: periodSchema,
});
export type GetComparisonAiWorkbookInput = z.infer<
  typeof getComparisonAiWorkbookInputSchema
>;
