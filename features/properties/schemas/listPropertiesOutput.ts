import { dateIntervalSchema } from "@/features/reviews/schemas/reviewCoverage";
import { z } from "zod";
import { ratingTrendPointSchema } from "@/features/reviews/schemas/ratingTrendPoint";
import { propertySchema } from "./property";
export const propertySummarySchema = propertySchema.extend({
  covered: z.array(dateIntervalSchema),
  status: z.string().nullable(),
  collectedAt: z.string().nullable(),
  collectionPeriod: z
    .object({ start: z.iso.date(), end: z.iso.date() })
    .nullable(),
  reviews: z.number().nullable(),
  textReviews: z.number().int().nonnegative().nullable(),
  ratedCount: z.number().nullable(),
  rating: z.number().nullable(),
  ratingTrend: z.array(ratingTrendPointSchema),
});
export const listPropertiesOutputSchema = z.array(propertySummarySchema);
export type PropertySummary = z.infer<typeof propertySummarySchema>;
