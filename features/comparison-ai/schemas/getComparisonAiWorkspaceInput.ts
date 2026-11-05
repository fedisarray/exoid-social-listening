import { z } from "zod";
export const getComparisonAiWorkspaceInputSchema = z.object({
  analysisId: z.string().uuid(),
});
