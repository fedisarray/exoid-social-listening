import { z } from "zod";
import { periodSchema } from "@/features/_shared/schemas/period";
export const ensureComparisonCoverageInputSchema = z
  .object({
    analysisId: z.uuid(),
    period: periodSchema,
    retry: z.boolean().default(false),
  })
  .refine((input) => input.period.start <= input.period.end, "INVALID_PERIOD");
export type EnsureComparisonCoverageInput = z.infer<
  typeof ensureComparisonCoverageInputSchema
>;
