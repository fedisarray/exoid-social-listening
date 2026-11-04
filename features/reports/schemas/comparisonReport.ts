import { z } from "zod";
import { periodSchema } from "@/features/_shared/schemas/period";
export const reportErrorCodeSchema = z.enum([
  "REPORTING_NOT_CONFIGURED",
  "WORKER_NOT_CONFIGURED",
  "WORKER_UNAVAILABLE",
  "TEMPLATE_NOT_CONFIGURED",
  "TEMPLATE_INVALID",
  "ANALYSIS_NOT_FOUND",
  "SNAPSHOT_NOT_FOUND",
  "CONFIGURATION_CHANGED",
  "COVERAGE_INCOMPLETE",
  "INVALID_PERIOD",
  "INVALID_SELECTION",
  "ACCESS_DENIED",
  "USAGE_LIMIT",
  "RATE_LIMITED",
  "START_UNCERTAIN",
  "GENERATION_FAILED",
  "GENERATION_TIMED_OUT",
  "EXPORT_FAILED",
  "DOWNLOAD_FAILED",
  "INVALID_POWERPOINT",
  "PROCESSING_FAILED",
]);
export const comparisonReportSchema = z.object({
  id: z.uuid(),
  version: z.number().int(),
  snapshotId: z.uuid(),
  nativeCharts: z.boolean(),
  period: periodSchema,
  locale: z.enum(["it", "en"]),
  status: z.enum([
    "queued",
    "starting",
    "generating",
    "downloading",
    "completed",
    "failed",
    "cancelled",
  ]),
  createdAt: z.iso.datetime({ offset: true }),
  finishedAt: z.iso.datetime({ offset: true }).nullable(),
  errorCode: reportErrorCodeSchema.nullable(),
  stalled: z.boolean(),
});
export type ComparisonReport = z.infer<typeof comparisonReportSchema>;
export type ReportErrorCode = z.infer<typeof reportErrorCodeSchema>;
