import { z } from "zod";

export const exportReviewExcelOutputSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    filename: z
      .string()
      .regex(/^reviews-\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}-[a-f0-9-]+\.xlsx$/),
    content: z
      .string()
      .min(1)
      .regex(/^[A-Za-z0-9+/]+={0,2}$/),
    snapshotId: z.uuid(),
  }),
  z.object({
    ok: z.literal(false),
    code: z.enum([
      "COVERAGE_INCOMPLETE",
      "CONFIGURATION_CHANGED",
      "ANALYSIS_NOT_FOUND",
      "INVALID_SELECTION",
    ]),
  }),
]);
export type ExportReviewExcelOutput = z.infer<
  typeof exportReviewExcelOutputSchema
>;
