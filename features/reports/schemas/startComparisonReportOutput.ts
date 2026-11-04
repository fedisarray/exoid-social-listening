import { z } from "zod";
import { reportErrorCodeSchema } from "./comparisonReport";
export const startComparisonReportOutputSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    reportId: z.uuid(),
    workerStarted: z.boolean(),
  }),
  z.object({ ok: z.literal(false), code: reportErrorCodeSchema }),
]);
export type StartComparisonReportOutput = z.infer<
  typeof startComparisonReportOutputSchema
>;
