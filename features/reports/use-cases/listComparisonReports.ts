import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { readOrganization } from "@/features/organizations/repositories/organizations";
import { listReports } from "../repositories/reports";
import type { ListComparisonReportsInput } from "../schemas/listComparisonReportsInput";
import type { ListComparisonReportsOutput } from "../schemas/listComparisonReportsOutput";
export async function listComparisonReports(
  ctx: OperationContext,
  input: ListComparisonReportsInput,
): Promise<ListComparisonReportsOutput> {
  const [org, reports] = await Promise.all([
    readOrganization(ctx.db, ctx.organizationId),
    listReports(ctx.db, ctx.organizationId, input.analysisId),
  ]);
  const configurationError = !org.reportTemplateId
    ? "TEMPLATE_NOT_CONFIGURED"
    : !process.env.REPORT_GENERATION_API_KEY
      ? "REPORTING_NOT_CONFIGURED"
      : !process.env.REPORT_WORKER_SECRET ||
          process.env.REPORT_WORKER_SECRET.length < 32
        ? "WORKER_NOT_CONFIGURED"
        : null;
  return { reports, configurationError };
}
