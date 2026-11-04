import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { enqueueReport, wakeReportWorker } from "../repositories/reports";
import { reportErrorCodeSchema } from "../schemas/comparisonReport";
import type { StartComparisonReportInput } from "../schemas/startComparisonReportInput";
import type { StartComparisonReportOutput } from "../schemas/startComparisonReportOutput";
export async function startComparisonReport(
  ctx: OperationContext,
  input: StartComparisonReportInput,
): Promise<StartComparisonReportOutput> {
  if (!process.env.REPORT_GENERATION_API_KEY)
    return { ok: false, code: "REPORTING_NOT_CONFIGURED" };
  if (
    !process.env.REPORT_WORKER_SECRET ||
    process.env.REPORT_WORKER_SECRET.length < 32
  )
    return { ok: false, code: "WORKER_NOT_CONFIGURED" };
  let reportId: string;
  try {
    reportId = await enqueueReport(ctx.db, input);
  } catch (error) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "";
    if (message === "COMPARISON_COVERAGE_INCOMPLETE")
      return { ok: false, code: "COVERAGE_INCOMPLETE" };
    const code = reportErrorCodeSchema.safeParse(message);
    if (code.success) return { ok: false, code: code.data };
    throw error;
  }
  const workerStarted = await wakeReportWorker();
  return { ok: true, reportId, workerStarted };
}
