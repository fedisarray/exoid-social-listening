import { z } from "zod";
export const processCollectionOutputSchema = z.object({
  worked: z.boolean(),
  nextAttemptAt: z.iso.datetime({ offset: true }).nullable(),
});
export type ProcessCollectionOutput = z.infer<
  typeof processCollectionOutputSchema
>;
