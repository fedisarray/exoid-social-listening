import { z } from "zod";
export const askComparisonAiOutputSchema = z.object({
  messageId: z.string().uuid(),
  answer: z.string(),
  citations: z.array(
    z.object({
      reviewId: z.string().uuid(),
      quote: z.string(),
      sheet: z.string(),
      row: z.number().int(),
    }),
  ),
  jobId: z.string().uuid().nullable(),
  workerStarted: z.boolean(),
});

export type AskComparisonAiOutput = z.infer<typeof askComparisonAiOutputSchema>;
