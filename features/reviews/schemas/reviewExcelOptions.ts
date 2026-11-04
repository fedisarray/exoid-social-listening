import { z } from "zod";

export const reviewExcelSheets = [
  "reviews",
  "rating",
  "quarterRating",
  "satisfaction",
  "quarterSatisfaction",
  "anchorRating",
  "anchorSatisfaction",
] as const;

export const reviewExcelOptionsSchema = z.object({
  listingIds: z
    .array(z.string().min(1))
    .min(1)
    .max(30)
    .refine((ids) => new Set(ids).size === ids.length),
  sheets: z
    .array(z.enum(reviewExcelSheets))
    .min(1)
    .max(7)
    .refine((ids) => new Set(ids).size === ids.length),
  historyYears: z.number().int().min(0).max(20),
  includeCharts: z.boolean(),
});
export type ReviewExcelOptions = z.infer<typeof reviewExcelOptionsSchema>;
