import { z } from "zod";

export const reviewExcelSheetConfigSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(31)
    .regex(/^[^\[\]:*?/\\\u0000-\u001f]+$/)
    .refine(
      (name) =>
        !name.startsWith("'") &&
        !name.endsWith("'") &&
        name.toLowerCase() !== "history",
    ),
  metric: z.enum(["reviews", "rating", "satisfaction"]),
  window: z.enum(["selected", "l12m", "annual", "quarterly", "monthly"]),
  group: z.enum(["properties", "anchors", "all", "own", "competitors"]),
  historyYears: z.number().int().min(0).max(20),
  quarter: z.number().int().min(1).max(4).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  includeCharts: z.boolean(),
});

export type ReviewExcelSheetConfig = z.infer<
  typeof reviewExcelSheetConfigSchema
>;
