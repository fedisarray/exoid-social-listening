import { z } from "zod";
import { periodSchema } from "@/features/_shared/schemas/period";
export const getComparisonAiEvidenceInputSchema = z.object({
  analysisId: z.string().uuid(),
  importId: z.string().uuid(),
  period: periodSchema,
  kind: z.enum(["sentiment", "theme", "month", "listing", "word"]),
  value: z.string().min(1).max(120),
  offset: z.coerce.number().int().nonnegative().default(0),
});
