import { z } from "zod";
export const getComparisonReportDownloadOutputSchema = z.discriminatedUnion(
  "ok",
  [
    z.object({ ok: z.literal(true), url: z.url() }),
    z.object({
      ok: z.literal(false),
      code: z.enum(["REPORT_NOT_FOUND", "REPORT_NOT_READY"]),
    }),
  ],
);
export type GetComparisonReportDownloadOutput = z.infer<
  typeof getComparisonReportDownloadOutputSchema
>;
