import { z } from "zod";
import { periodSchema } from "@/features/_shared/schemas/period";

export const getSharedReviewerEvidenceInputSchema = z
  .object({
    analysisId: z.uuid(),
    snapshotId: z.uuid().optional(),
    period: periodSchema,
    competitorId: z.string().min(1),
    offset: z.number().int().min(0).max(1_000_000).default(0),
  })
  .refine((input) => input.period.start <= input.period.end, "INVALID_PERIOD");
export type GetSharedReviewerEvidenceInput = z.infer<
  typeof getSharedReviewerEvidenceInputSchema
>;
