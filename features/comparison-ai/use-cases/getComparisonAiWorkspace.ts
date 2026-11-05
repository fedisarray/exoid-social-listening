import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import {
  findComparisonAiAnalysis,
  listComparisonAiImports,
  listComparisonAiMessages,
} from "../repositories/comparisonAi";
import type { ComparisonAiWorkspace } from "../schemas/workspace";
export async function getComparisonAiWorkspace(
  ctx: OperationContext,
  analysisId: string,
): Promise<ComparisonAiWorkspace> {
  const analysis = await findComparisonAiAnalysis(ctx, analysisId);
  if (!analysis) throw new Error("SCOPE_NOT_FOUND");
  const [imports, messages] = await Promise.all([
    listComparisonAiImports(ctx.db, ctx.organizationId, analysisId),
    listComparisonAiMessages(ctx.db, ctx.organizationId, analysisId),
  ]);
  return { imports, messages };
}
