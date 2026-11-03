import { z } from "zod";
import { periodSchema } from "@/features/_shared/schemas/period";
import { listingSchema } from "@/features/_shared/schemas/listing";
export const selectionSchema = listingSchema.extend({
  role: z.enum(["primary", "additionalOwn", "competitor", "anchor"]),
  label: z.string().trim().min(1).max(120),
});
export const analysisConfigSchema = z
  .object({
    period: periodSchema,
    listings: z.array(selectionSchema).min(1).max(30),
  })
  .superRefine((value, ctx) => {
    if (value.listings.filter((x) => x.role === "primary").length !== 1)
      ctx.addIssue({
        code: "custom",
        message: "PRIMARY_REQUIRED",
        path: ["listings"],
      });
    if (
      new Set(value.listings.map((x) => x.sourceId)).size !==
      value.listings.length
    )
      ctx.addIssue({
        code: "custom",
        message: "DUPLICATE_LISTING",
        path: ["listings"],
      });
    if (value.period.start > value.period.end)
      ctx.addIssue({
        code: "custom",
        message: "INVALID_PERIOD",
        path: ["period", "end"],
      });
  });
export type Selection = z.infer<typeof selectionSchema>;
export type AnalysisConfig = z.infer<typeof analysisConfigSchema>;
