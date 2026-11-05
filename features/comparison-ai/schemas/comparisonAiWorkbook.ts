import { z } from "zod";
import { periodSchema } from "@/features/_shared/schemas/period";

export const workbookCellSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);
export const comparisonAiWorkbookSchema = z.object({
  version: z.literal(1),
  importId: z.uuid(),
  period: periodSchema,
  sheets: z.array(
    z.object({
      name: z.string().min(1).max(31),
      description: z.string(),
      snapshotId: z.uuid().nullable(),
      kind: z.enum(["index", "properties", "shared", "reviews", "methodology"]),
      columns: z.array(z.string()),
      rows: z.array(z.array(workbookCellSchema)),
    }),
  ),
});
export type ComparisonAiWorkbook = z.infer<typeof comparisonAiWorkbookSchema>;

export const workbookReviewSchema = z.object({
  reviewId: z.uuid(),
  revisionId: z.uuid(),
  listingId: z.string(),
  publishedAt: z.string(),
  rating: z.number().nullable(),
  text: z.string(),
  language: z.string().nullable(),
  url: z.string().nullable(),
});
export type WorkbookReview = z.infer<typeof workbookReviewSchema>;
