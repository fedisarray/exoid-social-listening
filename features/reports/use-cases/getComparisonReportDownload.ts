import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { findReportDownload } from "../repositories/reports";
import { createReportDownload } from "../repositories/reportFiles";
import { periodSchema } from "@/features/_shared/schemas/period";
import type { GetComparisonReportDownloadInput } from "../schemas/getComparisonReportDownloadInput";
import type { GetComparisonReportDownloadOutput } from "../schemas/getComparisonReportDownloadOutput";
export async function getComparisonReportDownload(
  ctx: OperationContext,
  input: GetComparisonReportDownloadInput,
): Promise<GetComparisonReportDownloadOutput> {
  const report = await findReportDownload(
    ctx.db,
    ctx.organizationId,
    input.reportId,
  );
  if (!report) return { ok: false, code: "REPORT_NOT_FOUND" };
  if (report.status !== "completed" || !report.storage_path)
    return { ok: false, code: "REPORT_NOT_READY" };
  const period = periodSchema.parse(report.period);
  const url = await createReportDownload(
    ctx.db,
    report.storage_path,
    `comparison-${period.start}-${period.end}-${input.reportId}.pptx`,
  );
  return { ok: true, url };
}
