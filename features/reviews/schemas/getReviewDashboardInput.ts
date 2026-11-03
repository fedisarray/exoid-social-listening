import { z } from "zod";
import { periodSchema } from "@/features/_shared/schemas/period";
export const getReviewDashboardInputSchema = z
  .object({
    analysisId: z.uuid(),
    snapshotId: z.uuid().optional(),
    period: periodSchema,
  })
  .refine((x) => x.period.start <= x.period.end, "INVALID_PERIOD");
export type GetReviewDashboardInput = z.infer<
  typeof getReviewDashboardInputSchema
>;
