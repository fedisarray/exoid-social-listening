import { z } from "zod";
export const getComparisonAiEvidenceOutputSchema = z.object({
  reviews: z.array(
    z.object({
      id: z.string().uuid(),
      text: z.string(),
      date: z.iso.date().nullable(),
      rating: z.number().int().nullable(),
      listing: z.string().nullable(),
      sheet: z.string(),
      row: z.number().int(),
      sourceUrl: z.url().nullable(),
    }),
  ),
  total: z.number().int(),
});
