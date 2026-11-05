import { z } from "zod";
export const processComparisonAiJobOutputSchema = z.object({
  worked: z.boolean(),
  nextAttemptAt: z.iso.datetime({ offset: true }).nullable(),
});
