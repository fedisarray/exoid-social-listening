import { z } from "zod";
export const comparisonAiModelOutputSchema = z.object({
  answer: z.string().min(1).max(8000),
  citations: z
    .array(
      z.object({
        reviewId: z.string().uuid(),
        quote: z.string().min(1).max(500),
      }),
    )
    .max(12),
  visualizationType: z
    .enum([
      "sentiment",
      "themes",
      "sentiment_trend",
      "listing_comparison",
      "word_cloud",
      "area",
      "radar",
    ])
    .nullable(),
});
export type ComparisonAiModelOutput = z.infer<
  typeof comparisonAiModelOutputSchema
>;
