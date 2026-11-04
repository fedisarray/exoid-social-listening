import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { cancelReport } from "../repositories/reports";
import type { CancelComparisonReportInput } from "../schemas/cancelComparisonReportInput";
import type { CancelComparisonReportOutput } from "../schemas/cancelComparisonReportOutput";
export async function cancelComparisonReport(
  ctx: OperationContext,
  input: CancelComparisonReportInput,
): Promise<CancelComparisonReportOutput> {
  const cancelled = await cancelReport(ctx.db, input.reportId);
  return { cancelled };
}
