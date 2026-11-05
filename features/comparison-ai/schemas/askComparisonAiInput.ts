import { z } from "zod";
import { periodSchema } from "@/features/_shared/schemas/period";
export const askComparisonAiInputSchema = z.object({
  analysisId: z.string().uuid(),
  importId: z.string().uuid(),
  message: z.string().trim().min(1).max(2000),
  locale: z.enum(["it", "en"]),
  period: periodSchema,
});
export type AskComparisonAiInput = z.infer<typeof askComparisonAiInputSchema>;
