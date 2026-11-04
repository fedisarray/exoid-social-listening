import { z } from "zod";
import { periodSchema } from "@/features/_shared/schemas/period";
const scope = z.union([
  z.object({ analysisId: z.uuid(), propertyId: z.never().optional() }),
  z.object({ propertyId: z.uuid(), analysisId: z.never().optional() }),
]);
export const getReviewDashboardInputSchema = scope
  .and(z.object({ snapshotId: z.uuid().optional(), period: periodSchema }))
  .refine((x) => x.period.start <= x.period.end, "INVALID_PERIOD");
export type GetReviewDashboardInput = z.infer<
  typeof getReviewDashboardInputSchema
>;
