import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { listReports, wakeReportWorker } from "../repositories/reports";
import type { ResumeComparisonReportInput } from "../schemas/resumeComparisonReportInput";
import type { StartComparisonReportOutput } from "../schemas/startComparisonReportOutput";
export async function resumeComparisonReport(
  ctx: OperationContext,
  input: ResumeComparisonReportInput,
): Promise<StartComparisonReportOutput> {
  if (
    !process.env.REPORT_WORKER_SECRET ||
    process.env.REPORT_WORKER_SECRET.length < 32
  )
    return { ok: false, code: "WORKER_NOT_CONFIGURED" };
  const reports = await listReports(
    ctx.db,
    ctx.organizationId,
    input.analysisId,
  );
  const active = reports.find(
    (report) => !["completed", "failed", "cancelled"].includes(report.status),
  );
  if (!active) return { ok: false, code: "ANALYSIS_NOT_FOUND" };
  const workerStarted = await wakeReportWorker();
  return { ok: true, reportId: active.id, workerStarted };
}
