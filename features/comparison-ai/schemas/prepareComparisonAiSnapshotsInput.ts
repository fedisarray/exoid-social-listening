import { z } from "zod";

export const prepareComparisonAiSnapshotsInputSchema = z.object({
  analysisId: z.uuid(),
  snapshotIds: z
    .array(z.uuid())
    .min(1)
    .max(20)
    .superRefine((ids, context) => {
      if (new Set(ids).size !== ids.length)
        context.addIssue({ code: "custom", message: "SNAPSHOTS_INVALID" });
    }),
});
export type PrepareComparisonAiSnapshotsInput = z.infer<
  typeof prepareComparisonAiSnapshotsInputSchema
>;
