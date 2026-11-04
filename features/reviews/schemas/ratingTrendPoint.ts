import { z } from "zod";

export const ratingTrendPointSchema = z.object({
  bucket: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  rating: z.number().min(1).max(5).nullable(),
  ratedCount: z.number().int().nonnegative(),
  reviews: z.number().int().nonnegative(),
});

export type RatingTrendPoint = z.infer<typeof ratingTrendPointSchema>;
