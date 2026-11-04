import { z } from "zod";
import { periodSchema } from "@/features/_shared/schemas/period";
import { resolvePeriod } from "@/features/_shared/domain/period";

export const exportReviewExcelInputSchema = z.object({
  analysisId: z.uuid(),
  snapshotId: z.uuid().optional(),
  expectedVersion: z.number().int().positive(),
  locale: z.enum(["it", "en"]),
  period: periodSchema.refine((period) => {
    const resolved = resolvePeriod(period);
    return (
      period.kind === "quarter" &&
      period.start === resolved.start &&
      period.end === resolved.end
    );
  }, "QUARTER_REQUIRED"),
});
export type ExportReviewExcelInput = z.infer<
  typeof exportReviewExcelInputSchema
>;
