import { z } from "zod";

export const ratingBreakdownSchema = z.record(
  z.enum(["1", "2", "3", "4", "5"]),
  z.number().int().nonnegative(),
);

export type RatingBreakdown = z.infer<typeof ratingBreakdownSchema>;
