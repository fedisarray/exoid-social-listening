import { z } from "zod";
import { reviewExcelSheetConfigSchema } from "./reviewExcelSheetConfig";

export const reviewExcelSheets = [
  "reviews",
  "rating",
  "quarterRating",
  "satisfaction",
  "quarterSatisfaction",
  "anchorRating",
  "anchorSatisfaction",
] as const;

export const reviewExcelOptionsSchema = z
  .object({
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
    sheetSettings: z
      .partialRecord(z.enum(reviewExcelSheets), reviewExcelSheetConfigSchema)
      .optional(),
  })
  .superRefine((options, ctx) => {
    const names = new Set<string>();
    for (const id of options.sheets) {
      if (options.sheetSettings && !options.sheetSettings[id])
        ctx.addIssue({
          code: "custom",
          message: "SHEET_SETTINGS_REQUIRED",
          path: ["sheetSettings", id],
        });
      const name = options.sheetSettings?.[id]?.name.toLowerCase();
      if (!name) continue;
      if (names.has(name))
        ctx.addIssue({
          code: "custom",
          message: "DUPLICATE_SHEET_NAME",
          path: ["sheetSettings", id, "name"],
        });
      names.add(name);
    }
  });
export type ReviewExcelOptions = z.infer<typeof reviewExcelOptionsSchema>;
