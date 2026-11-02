import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { listOwnedAnalyses } from "../repositories/analyses";
import type { AnalysisSummary } from "../schemas/analysisDetail";
export async function listAnalyses(
  ctx: OperationContext,
): Promise<AnalysisSummary[]> {
  return listOwnedAnalyses(ctx.db, ctx.userId);
}
