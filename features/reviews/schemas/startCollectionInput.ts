import { z } from "zod";
import { periodSchema } from "@/features/_shared/schemas/period";
export const startCollectionInputSchema = z
  .union([
    z.object({
      analysisId: z.uuid(),
      propertyId: z.never().optional(),
      maxReviews: z.number().int().min(100).max(10000),
    }),
    z.object({
      propertyId: z.uuid(),
      analysisId: z.never().optional(),
      maxReviews: z.number().int().min(100).max(10000),
      period: periodSchema,
    }),
  ])
  .refine(
    (x) => !("period" in x) || x.period.start <= x.period.end,
    "INVALID_PERIOD",
  );
export type StartCollectionInput = z.infer<typeof startCollectionInputSchema>;
