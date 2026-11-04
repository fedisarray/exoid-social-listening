import { resolvePeriod } from "@/features/_shared/domain/period";
import { reviewExcelOptionsSchema } from "@/features/reviews/schemas/reviewExcelOptions";
import { z } from "zod";
import { periodSchema } from "@/features/_shared/schemas/period";
export const startComparisonReportInputSchema = z
  .object({
    analysisId: z.uuid(),
    expectedVersion: z.number().int().positive(),
    snapshotId: z.uuid().optional(),
    period: periodSchema.refine((period) => {
      const resolved = resolvePeriod(period);
      return (
        period.start <= period.end &&
        period.start === resolved.start &&
        period.end === resolved.end
      );
    }, "INVALID_PERIOD"),
    locale: z.enum(["it", "en"]),
    options: reviewExcelOptionsSchema,
  })
  .strict();
export type StartComparisonReportInput = z.infer<
  typeof startComparisonReportInputSchema
>;
