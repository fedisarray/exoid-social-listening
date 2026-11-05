import { z } from "zod";

export const prepareComparisonAiSnapshotsOutputSchema = z.object({
  importId: z.uuid(),
  rowCount: z.number().int().nonnegative(),
});
