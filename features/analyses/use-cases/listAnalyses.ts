import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { listOrganizationAnalyses } from "../repositories/analyses";
import type { AnalysisSummary } from "../schemas/analysisDetail";
export async function listAnalyses(
  ctx: OperationContext,
): Promise<AnalysisSummary[]> {
  return listOrganizationAnalyses(ctx.db, ctx.organizationId);
}
