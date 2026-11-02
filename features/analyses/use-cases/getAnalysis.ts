import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { findOwnedAnalysis } from "../repositories/analyses";
import type { AnalysisDetail } from "../schemas/analysisDetail";
export async function getAnalysis(
  ctx: OperationContext,
  id: string,
): Promise<AnalysisDetail | null> {
  return findOwnedAnalysis(ctx.db, id, ctx.userId);
}
