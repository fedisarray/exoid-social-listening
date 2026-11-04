import { z } from "zod";
import { periodSchema } from "@/features/_shared/schemas/period";
import { resolvePeriod } from "@/features/_shared/domain/period";
import { reviewExcelOptionsSchema } from "./reviewExcelOptions";

export const exportReviewExcelInputSchema = z.object({
  analysisId: z.uuid(),
  snapshotId: z.uuid().optional(),
  expectedVersion: z.number().int().positive(),
  locale: z.enum(["it", "en"]),
  options: reviewExcelOptionsSchema,
  period: periodSchema.refine((period) => {
    const resolved = resolvePeriod(period);
    return (
      period.start <= period.end &&
      period.start === resolved.start &&
      period.end === resolved.end
    );
  }, "INVALID_PERIOD"),
});
export type ExportReviewExcelInput = z.infer<
  typeof exportReviewExcelInputSchema
>;
