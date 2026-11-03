import { z } from "zod";
export const startCollectionInputSchema = z.object({
  analysisId: z.uuid(),
  maxReviews: z.number().int().min(100).max(10000),
});
export type StartCollectionInput = z.infer<typeof startCollectionInputSchema>;
